import { describe, it, expect } from 'vitest';
import { encodeData, decodeData, type SharingData } from './sharing';

describe('lib/sharing', () => {
  const sampleData: SharingData = {
    children: [{ id: '1', name: '은채', color: 'pink' }],
    academies: [{
      id: 'a1',
      name: '미술',
      contact: '010',
      price: 100,
      color: 'rose',
      teachers: [{ name: '샘', contact: '' }],
      paymentDay: '1'
    }],
    schedules: [{ id: 's1', childId: '1', academyId: 'a1', date: '2026-03-09', start: '10:00', end: '11:00', groupId: null, repeatType: 'none' }]
  };

  it('should encode and decode data correctly', () => {
    const encoded = encodeData(sampleData);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeData(encoded);
    expect(decoded).toEqual(sampleData);
  });

  it('should return null for invalid encoded string', () => {
    const decoded = decodeData('invalid-base64-string!!!');
    expect(decoded).toBeNull();
  });

  it('should handle encoding failure for circular references', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    // We expect encodeData to fail safely and return empty string for circular objects
    // @ts-expect-error - passing invalid data for failure testing
    const encoded = encodeData(circular as SharingData);
    expect(encoded).toBe('');
  });
});
