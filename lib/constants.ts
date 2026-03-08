export const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 ~ 22:00

export const INITIAL_CHILDREN = [
  { id: '1', name: '은채', color: 'pink' },
  { id: '2', name: '준우', color: 'blue' }
];

export const INITIAL_ACADEMIES = [
  { 
    id: 'a1', 
    name: '창의 미술', 
    contact: '010-1234-5678', 
    price: 150000, 
    color: 'rose',
    teachers: [
      { name: '김미술 선생님', contact: '010-1111-2222' },
      { name: '이보조 선생님', contact: '' }
    ],
    paymentDay: '15'
  },
  { 
    id: 'a2', 
    name: '태권도', 
    contact: '02-987-6543', 
    price: 120000, 
    color: 'indigo',
    teachers: [
      { name: '박관장님', contact: '010-3333-4444' }
    ],
    paymentDay: '1'
  }
];

export const INITIAL_SCHEDULES = [
  { 
    id: 's1', 
    childId: '1', 
    academyId: 'a1', 
    day: '월', 
    start: '14:00', 
    end: '15:30', 
    shuttleIn: '13:40', 
    shuttleOut: '15:45' 
  },
  { 
    id: 's2', 
    childId: '1', 
    academyId: 'a2', 
    day: '월', 
    start: '16:30', 
    end: '17:30', 
    shuttleIn: '16:10', 
    shuttleOut: '17:45' 
  },
  { 
    id: 's3', 
    childId: '2', 
    academyId: 'a2', 
    day: '화', 
    start: '15:00', 
    end: '16:00', 
    shuttleIn: '14:40', 
    shuttleOut: '16:15' 
  }
];

export const COLOR_OPTIONS = ['pink', 'blue', 'indigo', 'rose', 'amber', 'emerald', 'violet'] as const;

export const COLOR_MAP = {
  pink: 'bg-pink-50 text-pink-600 border-pink-100/50 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800/30',
  blue: 'bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100/50 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30',
  rose: 'bg-rose-50 text-rose-600 border-rose-100/50 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30',
  amber: 'bg-amber-50 text-amber-600 border-amber-100/50 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30',
  violet: 'bg-violet-50 text-violet-600 border-violet-100/50 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800/30'
};

// 선택된 상태를 위한 전용 맵 (라이트모드에서 흰색 글자 보장)
export const SELECTED_COLOR_MAP = {
  pink: 'bg-pink-600 text-white border-pink-600 dark:bg-pink-500',
  blue: 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500',
  indigo: 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500',
  rose: 'bg-rose-600 text-white border-rose-600 dark:bg-rose-500',
  amber: 'bg-amber-600 text-white border-amber-600 dark:bg-amber-500',
  emerald: 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500',
  violet: 'bg-violet-600 text-white border-violet-600 dark:bg-violet-500'
};

export const COLOR_HEX = {
  pink: '#fdf2f8',
  blue: '#eff6ff',
  indigo: '#eef2ff',
  rose: '#fff1f2',
  amber: '#fffbeb',
  emerald: '#ecfdf5',
  violet: '#f5f3ff'
};
