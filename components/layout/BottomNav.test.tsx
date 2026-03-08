import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomNav from './BottomNav';

describe('components/layout/BottomNav', () => {
  it('renders all nav items', () => {
    render(<BottomNav currentView="home" setView={() => {}} />);
    expect(screen.getByText('홈')).toBeDefined();
    expect(screen.getByText('일정')).toBeDefined();
    expect(screen.getByText('학원')).toBeDefined();
    expect(screen.getByText('설정')).toBeDefined();
  });

  it('calls setView when an item is clicked', () => {
    const setView = vi.fn();
    render(<BottomNav currentView="home" setView={setView} />);
    
    fireEvent.click(screen.getByText('홈'));
    expect(setView).toHaveBeenCalledWith('home');

    fireEvent.click(screen.getByText('일정'));
    expect(setView).toHaveBeenCalledWith('schedule');
    
    fireEvent.click(screen.getByText('학원'));
    expect(setView).toHaveBeenCalledWith('academy');

    fireEvent.click(screen.getByText('설정'));
    expect(setView).toHaveBeenCalledWith('settings');
  });

  it('highlights the active view', () => {
    const { rerender } = render(<BottomNav currentView="home" setView={() => {}} />);
    const homeBtn = screen.getByText('홈').closest('button');
    expect(homeBtn).toHaveClass('text-primary');

    rerender(<BottomNav currentView="schedule" setView={() => {}} />);
    const scheduleBtn = screen.getByText('일정').closest('button');
    expect(scheduleBtn).toHaveClass('text-primary');
    expect(screen.getByText('홈').closest('button')).not.toHaveClass('text-primary');
  });
});
