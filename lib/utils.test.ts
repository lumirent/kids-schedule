import { describe, it, expect } from 'vitest';
import { cn, timeToMinutes, getScheduleColor } from './utils';
import { COLOR_MAP } from './constants';

describe('lib/utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('a', 'b')).toBe('a b');
      expect(cn('a', { b: true, c: false })).toBe('a b');
      expect(cn('p-4', 'p-2')).toBe('p-2'); // tailwind-merge handles override
    });
  });

  describe('timeToMinutes', () => {
    it('converts HH:mm to minutes from midnight', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('01:30')).toBe(90);
      expect(timeToMinutes('12:00')).toBe(720);
      expect(timeToMinutes('23:59')).toBe(1439);
    });

    it('returns null for null or empty input', () => {
      expect(timeToMinutes('')).toBeNull();
      expect(timeToMinutes(null)).toBeNull();
    });
  });

  describe('getScheduleColor', () => {
    it('returns child color if NOT filtered', () => {
      const color = getScheduleColor('pink', 'blue', false);
      expect(color).toBe(COLOR_MAP.pink);
    });

    it('returns academy color if IS filtered', () => {
      const color = getScheduleColor('pink', 'blue', true);
      expect(color).toBe(COLOR_MAP.blue);
    });

    it('falls back to indigo for invalid colors', () => {
      const color = getScheduleColor('nonexistent', 'invalid', false);
      expect(color).toBe(COLOR_MAP.indigo);
    });
  });
});
