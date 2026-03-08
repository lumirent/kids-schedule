import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INITIAL_CHILDREN, INITIAL_ACADEMIES } from '@/lib/constants';
import { db, migrateSchedulesToIndexedDB, type Child, type Academy, type Schedule } from '@/lib/db';
import { formatDateStr } from '@/lib/utils';

export type { Child, Academy, Schedule };

export interface ScheduleState {
  children: Child[];
  academies: Academy[];
  schedules: Schedule[]; // 현재 화면(주/월)에 표시할 일정들 (View State)
  selectedChildId: string;
  showSunday: boolean;
  isViewerMode: boolean;

  // Actions
  setSelectedChildId: (id: string) => void;
  setShowSunday: (show: boolean) => void;

  // Children
  addChild: (child: Omit<Child, 'id'>) => void;
  updateChild: (id: string, child: Partial<Child>) => void;
  removeChild: (id: string) => void;

  // Academy
  addAcademy: (academy: Omit<Academy, 'id'>) => void;
  updateAcademy: (id: string, academy: Partial<Academy>) => void;
  removeAcademy: (id: string) => void;

  // Schedule (IndexedDB 연동)
  fetchSchedules: (startDate: string, endDate: string) => Promise<void>;
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  addSchedules: (schedules: Omit<Schedule, 'id'>[]) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => Promise<void>;
  updateScheduleGroup: (groupId: string, fromDate: string, schedule: Partial<Schedule>) => Promise<void>;
  removeSchedule: (id: string) => Promise<void>;
  removeScheduleGroup: (groupId: string, fromDate: string) => Promise<void>;

  // Data Management
  resetAll: () => Promise<void>;
  importData: (data: { children: Child[], academies: Academy[], schedules: Schedule[] }) => Promise<void>;
  loadViewerData: (data: { children: Child[], academies: Academy[], schedules: Schedule[] }) => void;
  setIsViewerMode: (isViewer: boolean) => void;
  migrateFromLocalStorage: (now?: Date) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      children: INITIAL_CHILDREN,
      academies: INITIAL_ACADEMIES,
      schedules: [], // 초기값 빈 배열
      selectedChildId: 'all',
      showSunday: false,
      isViewerMode: false,

      setSelectedChildId: (id) => set({ selectedChildId: id }),
      setShowSunday: (show) => set({ showSunday: show }),
      setIsViewerMode: (isViewer) => set({ isViewerMode: isViewer }),

      // Children Actions
      addChild: (child) => set((state) => ({
        children: [...state.children, { ...child, id: `c-${Date.now()}` }]
      })),
      updateChild: (id, child) => set((state) => ({
        children: state.children.map(c => c.id === id ? { ...c, ...child } : c)
      })),
      removeChild: async (id) => {
        set((state) => ({ children: state.children.filter(c => c.id !== id) }));
        await db.schedules.where('childId').equals(id).delete();
        set((state) => ({ schedules: state.schedules.filter(s => s.childId !== id) }));
      },

      // Academy Actions
      addAcademy: (academy) => set((state) => ({
        academies: [...state.academies, { ...academy, id: `a-${Date.now()}` }]
      })),
      updateAcademy: (id, academy) => set((state) => ({
        academies: state.academies.map(a => a.id === id ? { ...a, ...academy } : a)
      })),
      removeAcademy: async (id) => {
        set((state) => ({ academies: state.academies.filter(a => a.id !== id) }));
        await db.schedules.where('academyId').equals(id).delete();
        set((state) => ({ schedules: state.schedules.filter(s => s.academyId !== id) }));
      },

      // Schedule Actions (IndexedDB Async)
      fetchSchedules: async (startDate, endDate) => {
        const data = await db.schedules.where('date').between(startDate, endDate, true, true).toArray();
        set({ schedules: data });
      },

      addSchedule: async (schedule) => {
        const newSchedule = { ...schedule, id: `s-${Date.now()}` };
        await db.schedules.add(newSchedule);
        set((state) => ({ schedules: [...state.schedules, newSchedule] }));
      },

      addSchedules: async (schedulesToInsert) => {
        const newSchedules = schedulesToInsert.map((s, idx) => ({
          ...s,
          id: `s-${Date.now()}-${idx}`
        }));
        await db.schedules.bulkAdd(newSchedules);

        // Add matching schedules to current state (if they are within current view range, though here we just append all for simplicity. Ideally we'd re-fetch, but for now we'll append and let the active view filter/update on next fetch)
        set((state) => ({ schedules: [...state.schedules, ...newSchedules] }));
      },

      updateSchedule: async (id, schedule) => {
        await db.schedules.update(id, schedule);
        set((state) => ({
          schedules: state.schedules.map(s => s.id === id ? { ...s, ...schedule } : s)
        }));
      },

      updateScheduleGroup: async (groupId, fromDate, schedule) => {
        // fromDate 이후의 해당 그룹 데이터 모두 업데이트
        const groupData = await db.schedules.where('groupId').equals(groupId).toArray();
        const targets = groupData.filter(s => s.date >= fromDate);

        // Calculate offset if date represents a shift
        let diffMs = 0;
        if (schedule.date && schedule.date !== fromDate) {
          const fromTime = new Date(fromDate).getTime();
          const newTime = new Date(schedule.date).getTime();
          diffMs = newTime - fromTime;
        }

        const updatedTargets: Schedule[] = [];

        await db.transaction('rw', db.schedules, async () => {
          for (const target of targets) {
            const shiftParams = { ...schedule };
            if (diffMs !== 0) {
              const targetTime = new Date(target.date).getTime();
              const shiftedDate = new Date(targetTime + diffMs);
              shiftParams.date = formatDateStr(shiftedDate);
            } else {
              delete shiftParams.date; // Do not overwrite if no shift, keep original target.date
            }

            await db.schedules.update(target.id, shiftParams);
            updatedTargets.push({ ...target, ...shiftParams });
          }
        });

        set((state) => {
          const newSchedules = state.schedules.map(s => {
            if (s.groupId === groupId && s.date >= fromDate) {
              const updated = updatedTargets.find(t => t.id === s.id);
              return updated || s;
            }
            return s;
          });
          return { schedules: newSchedules };
        });
      },

      removeSchedule: async (id) => {
        await db.schedules.delete(id);
        set((state) => ({ schedules: state.schedules.filter(s => s.id !== id) }));
      },

      removeScheduleGroup: async (groupId, fromDate) => {
        const groupData = await db.schedules.where('groupId').equals(groupId).toArray();
        const targetIds = groupData.filter(s => s.date >= fromDate).map(s => s.id);

        await db.schedules.bulkDelete(targetIds);
        set((state) => ({ schedules: state.schedules.filter(s => !targetIds.includes(s.id)) }));
      },

      resetAll: async () => {
        await db.schedules.clear();
        set({
          children: [],
          academies: [],
          schedules: [],
          selectedChildId: 'all',
          showSunday: false,
          isViewerMode: false
        });
      },

      importData: async (data) => {
        if (data.schedules && data.schedules.length > 0) {
          await db.schedules.clear();
          await db.schedules.bulkAdd(data.schedules);
        }
        set({
          children: data.children || [],
          academies: data.academies || [],
          schedules: data.schedules || [], // Import 후 당장 보일 수 있도록
          isViewerMode: false
        });
      },

      loadViewerData: (data) => set({
        children: data.children || [],
        academies: data.academies || [],
        schedules: data.schedules || [],
        isViewerMode: true
      }),

      migrateFromLocalStorage: async (now?: Date) => {
        const currentSchedules = get().schedules;
        // 구형 Schedule 구조(day 속성이 있고 date가 없음)가 발견되는 경우 마이그레이션 실행
        if (currentSchedules && currentSchedules.length > 0 && ('day' in currentSchedules[0])) {
          await migrateSchedulesToIndexedDB(db, currentSchedules, now);

          // 변환이 완료되면 로컬스토리지에 저장되는 상태값에서 schedules를 빈 배열로 덮어씌움.
          // 앞으론 IndexedDB에서 fetchSchedules 로 꺼내서 렌더링.
          set({ schedules: [] });
        }
      }
    }),
    {
      name: 'kids-schedule-storage',
      version: 2,
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as Storage))),
      partialize: (state) => {
        // schedules는 로컬 스토리지에 더이상 저장하지 않음. IndexedDB가 권한을 가짐.
        const { isViewerMode, schedules, ...rest } = state;
        return rest as any;
      },
    }
  )
);
