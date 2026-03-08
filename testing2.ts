import { generateRepeatingSchedules } from './lib/schedule-utils';

const schedules = generateRepeatingSchedules(
    { date: '2024-03-09', start: '13:00', end: '14:00', childId: '1', academyId: '2' } as any,
    { repeatType: 'weekly', endCondition: 'count', endDate: '', count: 10, repeatDays: [1, 3] }, // Mon, Wed
    'g-123'
);

console.log(schedules.map(s => s.date));
