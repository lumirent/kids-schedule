import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScheduleStore } from './useScheduleStore';

describe('hooks/useScheduleStore', () => {
  beforeEach(() => {
    // Reset state before each test
    // Use setState directly to avoid triggers or confirmations
    useScheduleStore.setState({
      children: [],
      academies: [],
      schedules: [],
      selectedChildId: 'all',
      showSunday: false,
      isViewerMode: false
    });
  });

  describe('Children Actions', () => {
    it('adds a child', () => {
      useScheduleStore.getState().addChild({ name: '철수', color: 'blue' });
      const { children } = useScheduleStore.getState();
      expect(children.length).toBe(1);
      expect(children[0].name).toBe('철수');
      expect(children[0].id).toContain('c-');
    });

    it('updates a child', () => {
      useScheduleStore.getState().addChild({ name: '철수', color: 'blue' });
      const id = useScheduleStore.getState().children[0].id;
      
      useScheduleStore.getState().updateChild(id, { name: '철수 (업데이트)' });
      expect(useScheduleStore.getState().children[0].name).toBe('철수 (업데이트)');
    });

    it('removes a child and their schedules', () => {
      useScheduleStore.getState().addChild({ name: '철수', color: 'blue' });
      const childId = useScheduleStore.getState().children[0].id;
      
      useScheduleStore.getState().addSchedule({
        childId,
        academyId: 'a1',
        day: '월',
        start: '10:00',
        end: '11:00'
      });

      expect(useScheduleStore.getState().schedules.length).toBe(1);
      
      useScheduleStore.getState().removeChild(childId);
      expect(useScheduleStore.getState().children.length).toBe(0);
      expect(useScheduleStore.getState().schedules.length).toBe(0);
    });
  });

  describe('Academy Actions', () => {
    it('adds an academy', () => {
      useScheduleStore.getState().addAcademy({
        name: '태권도',
        contact: '010-1234-5678',
        price: 150000,
        color: 'rose',
        teachers: [],
        paymentDay: '1'
      });
      const { academies } = useScheduleStore.getState();
      expect(academies.length).toBe(1);
      expect(academies[0].name).toBe('태권도');
    });

    it('removes an academy and linked schedules', () => {
      useScheduleStore.getState().addAcademy({
        name: '태권도',
        contact: '',
        price: 0,
        color: 'rose',
        teachers: [],
        paymentDay: '1'
      });
      const academyId = useScheduleStore.getState().academies[0].id;

      useScheduleStore.getState().addSchedule({
        childId: 'c1',
        academyId,
        day: '화',
        start: '14:00',
        end: '15:00'
      });

      expect(useScheduleStore.getState().schedules.length).toBe(1);
      
      useScheduleStore.getState().removeAcademy(academyId);
      expect(useScheduleStore.getState().academies.length).toBe(0);
      expect(useScheduleStore.getState().schedules.length).toBe(0);
    });
  });

  describe('Schedule Actions', () => {
    it('adds, updates and removes a schedule', () => {
      useScheduleStore.getState().addSchedule({
        childId: 'c1',
        academyId: 'a1',
        day: '월',
        start: '10:00',
        end: '11:00'
      });
      
      const id = useScheduleStore.getState().schedules[0].id;
      expect(useScheduleStore.getState().schedules.length).toBe(1);

      useScheduleStore.getState().updateSchedule(id, { start: '10:30' });
      expect(useScheduleStore.getState().schedules[0].start).toBe('10:30');

      useScheduleStore.getState().removeSchedule(id);
      expect(useScheduleStore.getState().schedules.length).toBe(0);
    });
  });

  describe('Data Management', () => {
    it('resets all data', () => {
      useScheduleStore.getState().addChild({ name: '철수', color: 'blue' });
      useScheduleStore.getState().resetAll();
      
      expect(useScheduleStore.getState().children.length).toBe(0);
    });

    it('imports data correctly', () => {
      const newData = {
        children: [{ id: 'nc1', name: '새아이', color: 'green' }],
        academies: [],
        schedules: []
      };
      
      useScheduleStore.getState().importData(newData);
      expect(useScheduleStore.getState().children[0].name).toBe('새아이');
      expect(useScheduleStore.getState().isViewerMode).toBe(false);
    });

    it('loads viewer data and sets isViewerMode flag', () => {
      const viewerData = {
        children: [{ id: 'vc1', name: '영희', color: 'pink' }],
        academies: [],
        schedules: []
      };
      
      useScheduleStore.getState().loadViewerData(viewerData);
      
      expect(useScheduleStore.getState().isViewerMode).toBe(true);
      expect(useScheduleStore.getState().children[0].name).toBe('영희');
    });

    it('sets selectedChildId and showSunday', () => {
      useScheduleStore.getState().setSelectedChildId('c1');
      expect(useScheduleStore.getState().selectedChildId).toBe('c1');

      useScheduleStore.getState().setShowSunday(true);
      expect(useScheduleStore.getState().showSunday).toBe(true);
    });
  });
});
