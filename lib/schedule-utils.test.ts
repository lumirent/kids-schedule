import { describe, it, expect } from 'vitest';
import { generateRepeatingSchedules } from './schedule-utils';
import { Schedule } from './db';

describe('lib/schedule-utils', () => {
    const baseSchedule: Omit<Schedule, 'id' | 'groupId' | 'repeatType'> = {
        childId: 'c1',
        academyId: 'a1',
        date: '2026-03-08',
        start: '14:00',
        end: '15:00'
    };

    it('generates a single schedule when repeatType is none', () => {
        const results = generateRepeatingSchedules(baseSchedule, {
            repeatType: 'none',
            endCondition: 'count',
            count: 5,
            endDate: ''
        }, 'g1');

        expect(results).toHaveLength(1);
        expect(results[0].groupId).toBeNull();
        expect(results[0].repeatType).toBe('none');
        expect(results[0].date).toBe('2026-03-08');
    });

    it('generates weekly schedules with count limit', () => {
        const results = generateRepeatingSchedules(baseSchedule, {
            repeatType: 'weekly',
            endCondition: 'count',
            count: 3,
            endDate: ''
        }, 'g2');

        expect(results).toHaveLength(3);

        expect(results[0].date).toBe('2026-03-08');
        expect(results[1].date).toBe('2026-03-15');
        expect(results[2].date).toBe('2026-03-22');

        results.forEach(r => {
            expect(r.groupId).toBe('g2');
            expect(r.repeatType).toBe('weekly');
        });
    });

    it('generates weekly schedules with specific repeatDays', () => {
        // 2026-03-09 is a Monday (1)
        const monBase = { ...baseSchedule, date: '2026-03-09' };

        const results = generateRepeatingSchedules(monBase, {
            repeatType: 'weekly',
            endCondition: 'count',
            count: 4,
            endDate: '',
            repeatDays: [1, 3, 5] // Mon, Wed, Fri
        }, 'g-days');

        expect(results).toHaveLength(4);
        expect(results[0].date).toBe('2026-03-09'); // Mon
        expect(results[1].date).toBe('2026-03-11'); // Wed
        expect(results[2].date).toBe('2026-03-13'); // Fri
        expect(results[3].date).toBe('2026-03-16'); // Next Mon
        expect(results[0].groupId).toBe('g-days');
    });

    it('generates monthly schedules with date limit', () => {
        // 2026-03-08 to 2026-06-01 should output Mar 8, Apr 8, May 8 (3 occurrences)
        const results = generateRepeatingSchedules(baseSchedule, {
            repeatType: 'monthly',
            endCondition: 'date',
            count: 0,
            endDate: '2026-06-01'
        }, 'g3');

        expect(results).toHaveLength(3);
        expect(results[0].date).toBe('2026-03-08');
        expect(results[1].date).toBe('2026-04-08');
        expect(results[2].date).toBe('2026-05-08');
    });

    it('handles month end limits safely when advancing', () => {
        // A schedule on Jan 31st repeating monthly
        const janBase = { ...baseSchedule, date: '2026-01-31' };

        const results = generateRepeatingSchedules(janBase, {
            repeatType: 'monthly',
            endCondition: 'count',
            count: 3,
            endDate: ''
        }, 'g4');

        expect(results).toHaveLength(3);
        expect(results[0].date).toBe('2026-01-31');
        expect(results[1].date).toBe('2026-02-28'); // non-leap year safe clamp
        // The next one should technically clamp, since adding 1 month to Feb 28 is March 28
        expect(results[2].date).toBe('2026-03-28');
    });
});
