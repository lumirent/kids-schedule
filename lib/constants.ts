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
  pink: 'bg-pink-100 text-pink-700 border-pink-200/50 dark:bg-pink-900/40 dark:text-pink-200 dark:border-pink-800/50',
  blue: 'bg-blue-100 text-blue-700 border-blue-200/50 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800/50',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200/50 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-800/50',
  rose: 'bg-rose-100 text-rose-700 border-rose-200/50 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800/50',
  amber: 'bg-amber-100 text-amber-700 border-amber-200/50 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800/50',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800/50',
  violet: 'bg-violet-100 text-violet-700 border-violet-200/50 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-800/50'
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
  pink: '#ec4899',   // pink-500
  blue: '#3b82f6',   // blue-500
  indigo: '#6366f1', // indigo-500
  rose: '#f43f5e',   // rose-500
  amber: '#f59e0b',  // amber-500
  emerald: '#10b981', // emerald-500
  violet: '#8b5cf6'  // violet-500
};
