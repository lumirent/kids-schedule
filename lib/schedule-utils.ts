import { Schedule } from '@/lib/db';

interface RepeatConfig {
    repeatType: 'none' | 'weekly' | 'monthly';
    endCondition: 'date' | 'count';
    endDate: string; // YYYY-MM-DD
    count: number;
}

/**
 * Generates an array of schedules based on repeat configurations.
 */
export function generateRepeatingSchedules(
    baseSchedule: Omit<Schedule, 'id' | 'groupId' | 'repeatType'>,
    config: RepeatConfig,
    groupId: string
): Omit<Schedule, 'id'>[] {
    const { repeatType, endCondition, endDate, count } = config;

    const schedules: Omit<Schedule, 'id'>[] = [];

    if (repeatType === 'none') {
        schedules.push({
            ...baseSchedule,
            groupId: null,
            repeatType: 'none'
        });
        return schedules;
    }

    let currentDate = new Date(baseSchedule.date);
    const endDateTime = endCondition === 'date' && endDate ? new Date(endDate).getTime() : Infinity;
    const maxCount = endCondition === 'count' && count > 0 ? count : Infinity;
    let currentCount = 0;

    // Hard limit to prevent infinite loops (e.g. 5 years)
    const HARD_LIMIT = 5 * 365;

    while (currentCount < maxCount && currentCount < HARD_LIMIT) {
        if (endCondition === 'date' && currentDate.getTime() > endDateTime) {
            break;
        }

        const dateStr = currentDate.toISOString().split('T')[0];

        schedules.push({
            ...baseSchedule,
            date: dateStr,
            groupId,
            repeatType,
        });

        currentCount++;

        // Advance date
        if (repeatType === 'weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else if (repeatType === 'monthly') {
            const currentMonth = currentDate.getMonth();
            currentDate.setMonth(currentDate.getMonth() + 1);

            // Handle edge cases like Jan 31 -> Feb 28
            // If the month jumped by 2 (e.g., from Jan 31, +1 month -> Mar 3 (if non-leap year)), roll back to the last day of the desired month
            if (currentDate.getMonth() !== (currentMonth + 1) % 12) {
                currentDate.setDate(0);
            }
        }
    }

    return schedules;
}
