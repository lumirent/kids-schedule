import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { INITIAL_CHILDREN, INITIAL_ACADEMIES, INITIAL_SCHEDULES } from '@/lib/constants';

export interface Child {
  id: string;
  name: string;
  color: string;
  schoolDismissalTimes?: Record<string, string>;
}

export interface AcademyTeacher {
  name: string;
  contact: string;
}

export interface Academy {
  id: string;
  name: string;
  contact: string;
  price: number;
  color: string;
  teachers: AcademyTeacher[];
  paymentDay: string;
}

export interface Schedule {
  id: string;
  childId: string;
  academyId: string;
  day: string;
  start: string;
  end: string;
  shuttleIn?: string;
  shuttleOut?: string;
}

export interface ScheduleState {
  children: Child[];
  academies: Academy[];
  schedules: Schedule[];
  selectedChildId: string;
  showSunday: boolean;
  isViewerMode: boolean; // Flag for shared URL view
  
  // Actions
  setSelectedChildId: (id: string) => void;
  setShowSunday: (show: boolean) => void;
  
  // Children
  addChild: (child: Omit<Child, 'id'>) => void;
  updateChild: (id: string, child: Partial<Child>) => void;
  removeChild: (id: string) => void;
  
  // Schedule
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => void;
  removeSchedule: (id: string) => void;
  
  // Academy
  addAcademy: (academy: Omit<Academy, 'id'>) => void;
  updateAcademy: (id: string, academy: Partial<Academy>) => void;
  removeAcademy: (id: string) => void;
  
  // Data Management
  resetAll: () => void;
  importData: (data: { children: Child[], academies: Academy[], schedules: Schedule[] }) => void;
  loadViewerData: (data: { children: Child[], academies: Academy[], schedules: Schedule[] }) => void;
  setIsViewerMode: (isViewer: boolean) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      children: INITIAL_CHILDREN,
      academies: INITIAL_ACADEMIES,
      schedules: INITIAL_SCHEDULES,
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
      removeChild: (id) => set((state) => ({
        children: state.children.filter(c => c.id !== id),
        schedules: state.schedules.filter(s => s.childId !== id)
      })),

      // Schedule Actions
      addSchedule: (schedule) => set((state) => ({
        schedules: [...state.schedules, { ...schedule, id: `s-${Date.now()}` }]
      })),
      updateSchedule: (id, schedule) => set((state) => ({
        schedules: state.schedules.map(s => s.id === id ? { ...s, ...schedule } : s)
      })),
      removeSchedule: (id) => set((state) => ({
        schedules: state.schedules.filter(s => s.id !== id)
      })),
      
      // Academy Actions
      addAcademy: (academy) => set((state) => ({
        academies: [...state.academies, { ...academy, id: `a-${Date.now()}` }]
      })),
      updateAcademy: (id, academy) => set((state) => ({
        academies: state.academies.map(a => a.id === id ? { ...a, ...academy } : a)
      })),
      removeAcademy: (id) => set((state) => ({
        academies: state.academies.filter(a => a.id !== id),
        schedules: state.schedules.filter(s => s.academyId !== id)
      })),

      resetAll: () => {
        set({
          children: [],
          academies: [],
          schedules: [],
          selectedChildId: 'all',
          showSunday: false,
          isViewerMode: false
        });
      },

      importData: (data) => set({
        children: data.children || [],
        academies: data.academies || [],
        schedules: data.schedules || [],
        isViewerMode: false
      }),

      loadViewerData: (data) => set({
        children: data.children || [],
        academies: data.academies || [],
        schedules: data.schedules || [],
        isViewerMode: true
      })
    }),
    {
      name: 'kids-schedule-storage',
      version: 1,
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as Storage))),
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isViewerMode, ...rest } = state;
        return rest;
      },
    }
  )
);
