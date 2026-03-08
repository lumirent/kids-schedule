import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScheduleView from './ScheduleView';
import { useScheduleStore, type ScheduleState } from '@/hooks/useScheduleStore';
import { translations } from '@/lib/i18n';
import React from 'react';

// Mock the store
vi.mock('@/hooks/useScheduleStore', () => ({
  useScheduleStore: vi.fn(),
}));

// Mock @hello-pangea/dnd because it's hard to test in vitest/jsdom
vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Droppable: ({ children }: { children: (provided: { droppableProps: object; innerRef: (el: HTMLElement | null) => void; placeholder: React.ReactNode }, snapshot: { isDraggingOver: boolean }) => React.ReactNode }) =>
    children({ droppableProps: {}, innerRef: vi.fn(), placeholder: null }, { isDraggingOver: false }),
  Draggable: ({ children }: { children: (provided: { draggableProps: { style: object }; dragHandleProps: object; innerRef: (el: HTMLElement | null) => void }, snapshot: { isDragging: boolean }) => React.ReactNode }) =>
    children({ draggableProps: { style: {} }, dragHandleProps: {}, innerRef: vi.fn() }, { isDragging: false }),
}));

const t = translations.ko;

describe('ScheduleView', () => {
  const mockSchedules = [
    {
      id: 's1',
      childId: 'c1',
      academyId: 'a1',
      date: '2026-03-09', // Monday
      start: '14:00',
      end: '15:00',
      shuttleIn: '13:40',
      shuttleOut: '15:20',
      groupId: null,
      repeatType: 'none' as const,
    },
  ];

  const mockAcademies = [
    { id: 'a1', name: 'Art Class', color: 'rose', contact: '', price: 0, teachers: [], paymentDay: '' },
  ];

  const mockChildren = [
    { id: 'c1', name: 'Child 1', color: 'indigo', schoolDismissalTimes: {} },
  ];

  it('displays shuttle boarding and alighting times', () => {
    (useScheduleStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      schedules: mockSchedules,
      academies: mockAcademies,
      children: mockChildren,
      selectedChildId: 'all',
      setSelectedChildId: vi.fn(),
      showSunday: false,
      updateSchedule: vi.fn(),
      isViewerMode: false,
    } as unknown as Partial<ScheduleState>);

    render(<ScheduleView onEdit={vi.fn()} />);

    expect(screen.getByText('Art Class')).toBeDefined();
    expect(screen.getByText(`13:40 ${t.schedule.pickup}`)).toBeDefined();
    expect(screen.getByText(`15:20 ${t.schedule.dropoff}`)).toBeDefined();
    expect(screen.getByText('14:00 - 15:00')).toBeDefined();
  });
});
