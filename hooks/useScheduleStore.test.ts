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
