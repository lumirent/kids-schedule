import { describe, it, expect, beforeEach } from 'vitest';
import { useConfigStore } from './useConfigStore';

describe('hooks/useConfigStore', () => {
  beforeEach(() => {
    // Reset store state if needed, though Zustand persist makes it tricky.
    // For unit tests, we can just set values.
    useConfigStore.setState({ theme: 'system' });
  });

  it('initializes with system theme', () => {
    expect(useConfigStore.getState().theme).toBe('system');
  });

  it('sets theme correctly', () => {
    useConfigStore.getState().setTheme('dark');
    expect(useConfigStore.getState().theme).toBe('dark');

    useConfigStore.getState().setTheme('light');
    expect(useConfigStore.getState().theme).toBe('light');
  });
});
