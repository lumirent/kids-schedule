import Dexie, { type Table } from 'dexie';

export interface Child {
  id?: string; // Optional for auto-increment if needed, but we'll use UUID/String for now
  name: string;
  defaultTimes?: string; // Optional default school/home times
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

export interface Schedule {
  id?: string;
  childId: string;
  academyId: string;
  day: string; // '월', '화' ...
  start: string; // 'HH:mm'
  end: string;
  shuttleIn?: string;
  shuttleOut?: string;
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
  }
}

export const db = new KidsScheduleDB();
