import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { KidsScheduleDB, migrateSchedulesToIndexedDB } from './db';
import 'fake-indexeddb/auto';

describe('KidsScheduleDB & Migration', () => {
    let db: KidsScheduleDB;
    const mockNow = new Date('2026-03-08T00:00:00Z'); // 기준 날짜 고정 (일요일)

    beforeEach(async () => {
        db = new KidsScheduleDB();
        await db.open();
    });

    afterEach(async () => {
        await db.delete();
    });

    it('initializes schedules table with the correct indices', () => {
        const table = db.schedules;
        expect(table).toBeDefined();
        expect(table.schema.indexes.map(idx => idx.name)).toEqual([
            'groupId',
            'childId',
            'academyId',
            'date',
            '[childId+date]'
        ]);
        expect(table.schema.primKey.name).toBe('id');
    });

    it('migrates old day-based schedules to date-based schedules', async () => {
        const oldSchedules: any[] = [
            {
                id: 's1',
                childId: 'c1',
                academyId: 'a1',
                day: '월', // Monday
                start: '14:00',
                end: '15:30',
            },
            {
                id: 's2',
                childId: 'c1',
                academyId: 'a2',
                day: '수', // Wednesday
                start: '15:00',
                end: '16:00',
            }
        ];

        // 마이그레이터 함수 실행 (향후 6개월치 Spread)
        await migrateSchedulesToIndexedDB(db, oldSchedules, mockNow);

        // 저장된 데이터 확인
        const count = await db.schedules.count();
        // 6개월 (약 26주). 월요일 26개, 수요일 26개 -> 52 또는 54개 언저리
        expect(count).toBeGreaterThan(50);
        expect(count).toBeLessThan(60);

        // 월요일 일정의 변환 결과 확인 (3/8 기준 첫 월요일은 3/9)
        const mondaySchedules = await db.schedules.where('childId').equals('c1').toArray();
        const firstMonday = mondaySchedules.find(s => s.date === '2026-03-09');

        expect(firstMonday).toBeDefined();
        if (firstMonday) {
            expect(firstMonday.academyId).toBe('a1');
            expect(firstMonday.start).toBe('14:00');
            expect(firstMonday.end).toBe('15:30');
            expect((firstMonday as any).day).toBeUndefined(); // 구형 day 필드는 제거되어야 함
            expect(firstMonday.groupId).toBeDefined();
            expect(firstMonday.repeatType).toBe('weekly');
        }

        // 그룹화 확인: 같은 요일의 일정들은 동일한 groupId를 가져야 함
        const mondayGroup = mondaySchedules.filter(s => s.start === '14:00');
        expect(mondayGroup.length).toBeGreaterThan(20);
        expect(mondayGroup[0].groupId).toBe(mondayGroup[1].groupId);
    });
});
