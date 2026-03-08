import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useScheduleStore } from './useScheduleStore';
import { KidsScheduleDB, db, migrateSchedulesToIndexedDB } from '@/lib/db';
import 'fake-indexeddb/auto';

vi.mock('@/lib/db', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/db')>();
  return {
    ...mod,
    // We can use the real db instance because fake-indexeddb handles it
  };
});

describe('hooks/useScheduleStore', () => {
  beforeEach(async () => {
    // db 초기화
    await db.open();
    await db.schedules.clear();

    useScheduleStore.setState({
      children: [],
      academies: [],
      schedules: [],
      selectedChildId: 'all',
      showSunday: false,
      isViewerMode: false
    });
  });

  afterEach(async () => {
    await db.schedules.clear();
  });

  describe('Children Actions', () => {
    it('adds a child', () => {
      useScheduleStore.getState().addChild({ name: '철수', color: 'blue' });
      const { children } = useScheduleStore.getState();
      expect(children.length).toBe(1);
    });
  });

  describe('Schedule Actions with IndexedDB', () => {
    it('adds a schedule and fetches it', async () => {
      const { fetchSchedules, addSchedule } = useScheduleStore.getState();

      // 스케줄 추가 (DB 반영)
      await addSchedule({
        childId: 'c1',
        academyId: 'a1',
        groupId: 'g1',
        date: '2026-03-09',
        start: '10:00',
        end: '11:00',
        repeatType: 'none'
      });

      // 아직 fetch 안했으므로 store 내 schedules는 비어있거나 다를 수 있음
      // fetch 실행
      await fetchSchedules('2026-03-09', '2026-03-15');

      const updatedSchedules = useScheduleStore.getState().schedules;
      expect(updatedSchedules.length).toBe(1);
      expect(updatedSchedules[0].date).toBe('2026-03-09');
    });

    it('updates a schedule in DB', async () => {
      const { fetchSchedules, addSchedule, updateSchedule } = useScheduleStore.getState();
      await addSchedule({
        childId: 'c1',
        academyId: 'a1',
        groupId: 'g1',
        date: '2026-03-09',
        start: '10:00',
        end: '11:00'
      });

      await fetchSchedules('2026-03-09', '2026-03-09');
      const id = useScheduleStore.getState().schedules[0].id;

      await updateSchedule(id, { start: '10:30' });
      await fetchSchedules('2026-03-09', '2026-03-09');

      expect(useScheduleStore.getState().schedules[0].start).toBe('10:30');
    });

    it('removes a schedule from DB', async () => {
      const { fetchSchedules, addSchedule, removeSchedule } = useScheduleStore.getState();
      await addSchedule({
        childId: 'c1', academyId: 'a1', groupId: 'g1', date: '2026-03-09', start: '10:00', end: '11:00'
      });
      await fetchSchedules('2026-03-09', '2026-03-09');
      const id = useScheduleStore.getState().schedules[0].id;

      await removeSchedule(id);
      await fetchSchedules('2026-03-09', '2026-03-09');
      expect(useScheduleStore.getState().schedules.length).toBe(0);
    });

    it('updates a schedule group from a specific date forward', async () => {
      const { fetchSchedules, addSchedules, updateScheduleGroup } = useScheduleStore.getState();

      await addSchedules([
        { childId: 'c1', academyId: 'a1', groupId: 'g-repeat', date: '2026-03-01', start: '10:00', end: '11:00', repeatType: 'weekly' },
        { childId: 'c1', academyId: 'a1', groupId: 'g-repeat', date: '2026-03-08', start: '10:00', end: '11:00', repeatType: 'weekly' },
        { childId: 'c1', academyId: 'a1', groupId: 'g-repeat', date: '2026-03-15', start: '10:00', end: '11:00', repeatType: 'weekly' },
      ]);

      // Update from Mar 8 onwards
      await updateScheduleGroup('g-repeat', '2026-03-08', { start: '11:00', end: '12:00' });
      await fetchSchedules('2026-03-01', '2026-03-20');

      const schedules = useScheduleStore.getState().schedules.sort((a, b) => a.date.localeCompare(b.date));
      expect(schedules.length).toBe(3);

      // Mar 1 should remain unchanged
      expect(schedules[0].date).toBe('2026-03-01');
      expect(schedules[0].start).toBe('10:00');

      // Mar 8 and Mar 15 should be updated
      expect(schedules[1].date).toBe('2026-03-08');
      expect(schedules[1].start).toBe('11:00');

      expect(schedules[2].date).toBe('2026-03-15');
      expect(schedules[2].start).toBe('11:00');
    });

    it('removes a schedule group from a specific date forward', async () => {
      const { fetchSchedules, addSchedules, removeScheduleGroup } = useScheduleStore.getState();

      await addSchedules([
        { childId: 'c1', academyId: 'a1', groupId: 'g-delete', date: '2026-03-01', start: '10:00', end: '11:00', repeatType: 'weekly' },
        { childId: 'c1', academyId: 'a1', groupId: 'g-delete', date: '2026-03-08', start: '10:00', end: '11:00', repeatType: 'weekly' },
        { childId: 'c1', academyId: 'a1', groupId: 'g-delete', date: '2026-03-15', start: '10:00', end: '11:00', repeatType: 'weekly' },
      ]);

      // Remove from Mar 8 onwards
      await removeScheduleGroup('g-delete', '2026-03-08');

      await fetchSchedules('2026-03-01', '2026-03-20');
      const schedules = useScheduleStore.getState().schedules;

      // Only Mar 1 should remain
      expect(schedules.length).toBe(1);
      expect(schedules[0].date).toBe('2026-03-01');
    });

    it('migrates from localStorage to IndexedDB safely', async () => {
      // localStorage에 남아있던 구형 스케줄 모의
      useScheduleStore.setState({
        schedules: [
          { id: 'old1', childId: 'c1', academyId: 'a1', day: '월', start: '10:00', end: '11:00' } as any
        ]
      });

      await useScheduleStore.getState().migrateFromLocalStorage(new Date('2026-03-08T00:00:00Z'));

      // 변환이 끝나면 Zustand 내의 schedules 배열(과거 형태)은 비워져야 한다
      expect(useScheduleStore.getState().schedules.length).toBe(0);

      // IndexedDB에 수십개의 객체가 생성되었는지 확인
      const dbCount = await db.schedules.count();
      expect(dbCount).toBeGreaterThan(20);
    });
  });
});
