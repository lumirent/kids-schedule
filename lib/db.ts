import Dexie, { type Table } from 'dexie';

export interface Child {
  id: string; // Required. UUID/String
  name: string;
  schoolDismissalTimes?: Record<string, string>;
  color: string;
}

export interface AcademyTeacher {
  name: string;
  contact: string;
}

export interface Academy {
  id?: string;
  name: string;
  contact: string;
  price: number;
  color: string;
  teachers: AcademyTeacher[];
  paymentDay: string;
  paymentMethod?: string;
}

export type RepeatType = 'none' | 'weekly' | 'monthly';

export interface Schedule {
  id: string;             // 개별 일정 인스턴스의 고유 ID
  groupId: string | null; // 반복 생성된 경우 공통으로 부여받는 그룹 ID
  childId: string;
  academyId: string;
  date: string;           // 실제 일정이 발생하는 날짜 (YYYY-MM-DD 형식)
  start: string;          // 시작 시간 (HH:mm)
  end: string;            // 종료 시간 (HH:mm)
  shuttleIn?: string;
  shuttleOut?: string;
  repeatType?: RepeatType;
}

export class KidsScheduleDB extends Dexie {
  children!: Table<Child>;
  academies!: Table<Academy>;
  schedules!: Table<Schedule>;

  constructor() {
    super('KidsScheduleDB');
    this.version(1).stores({
      children: 'id, name',
      academies: 'id, name',
      schedules: 'id, childId, academyId, day'
    });

    this.version(2).stores({
      schedules: 'id, groupId, childId, academyId, date, [childId+date]'
    }).upgrade(tx => {
      return tx.table('schedules').clear();
    });
  }
}

export const db = new KidsScheduleDB();

const DAY_MAP: Record<string, number> = {
  '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6
};

function getNextDateForDayOfWeek(startDate: Date, targetDayOfWeek: number): Date {
  const date = new Date(startDate);
  const currentDay = date.getDay();
  // Find the start of the current week (Sunday)
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - currentDay);

  const targetDate = new Date(weekStart);
  targetDate.setDate(weekStart.getDate() + targetDayOfWeek);

  return targetDate;
}

export async function migrateSchedulesToIndexedDB(database: KidsScheduleDB, oldSchedules: any[], now: Date = new Date()) {
  if (!oldSchedules || oldSchedules.length === 0) return;

  const WEEKS_TO_SPREAD = 26; // 약 6개월 (26주)
  const newSchedules: Schedule[] = [];

  for (const old of oldSchedules) {
    const targetDayNum = DAY_MAP[old.day];
    if (targetDayNum === undefined) continue;

    const baseDate = getNextDateForDayOfWeek(now, targetDayNum);
    const groupId = `g-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    for (let w = 0; w < WEEKS_TO_SPREAD; w++) {
      const iterDate = new Date(baseDate);
      iterDate.setDate(baseDate.getDate() + w * 7);

      const yyyy = iterDate.getFullYear();
      const mm = String(iterDate.getMonth() + 1).padStart(2, '0');
      const dd = String(iterDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      newSchedules.push({
        id: `s-${Date.now()}-${w}-${Math.random().toString(36).substr(2, 5)}`,
        groupId,
        childId: old.childId,
        academyId: old.academyId,
        date: dateStr,
        start: old.start,
        end: old.end,
        shuttleIn: old.shuttleIn,
        shuttleOut: old.shuttleOut,
        repeatType: 'weekly'
      });
    }
  }

  // Bulk add to Dexie
  await database.schedules.bulkAdd(newSchedules);
}
