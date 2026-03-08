import { Schedule } from '@/lib/db';

interface RepeatConfig {
    repeatType: 'none' | 'weekly' | 'monthly';
    endCondition: 'date' | 'count';
    endDate: string; // YYYY-MM-DD
    count: number;
    repeatDays?: number[]; // Array of day indices (0=Sun, ..., 6=Sat)
}

/**
 * Generates an array of schedules based on repeat configurations.
 */
export function generateRepeatingSchedules(
    baseSchedule: Omit<Schedule, 'id' | 'groupId' | 'repeatType'>,
    config: RepeatConfig,
    groupId: string
): Omit<Schedule, 'id'>[] {
    const { repeatType, endCondition, endDate, count, repeatDays } = config;

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
    let loopCounter = 0;

    // Hard limit to prevent infinite loops (e.g. 5 years)
    const HARD_LIMIT = 5 * 365;

    const hasSpecificDays = repeatType === 'weekly' && repeatDays && repeatDays.length > 0;
    const activeDays = hasSpecificDays ? [...(repeatDays as number[])].sort((a, b) => a - b) : null;

    while (currentCount < maxCount && loopCounter < HARD_LIMIT) {
        if (endCondition === 'date' && currentDate.getTime() > endDateTime) {
            break;
        }

        if (hasSpecificDays && activeDays) {
            const currentDayOfWeek = currentDate.getDay();
            if (activeDays.includes(currentDayOfWeek)) {
                const dateStr = currentDate.toISOString().split('T')[0];
                schedules.push({
                    ...baseSchedule,
                    date: dateStr,
                    groupId,
                    repeatType,
                });
                currentCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1); // Advance day by day
            loopCounter++;
        } else {
            const dateStr = currentDate.toISOString().split('T')[0];

            schedules.push({
                ...baseSchedule,
                date: dateStr,
                groupId,
                repeatType,
            });

            currentCount++;
            loopCounter++; // each iteration is one schedule for monthly/plain weekly

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
    }

    return schedules;
}
