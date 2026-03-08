import pako from 'pako';
import { type Child, type Academy, type Schedule } from '@/hooks/useScheduleStore';

export interface SharingData {
  children: Child[];
  academies: Academy[];
  schedules: Schedule[];
}

/**
 * Encodes data to a Base64 string after compression (deflate).
 */
export function encodeData(data: SharingData): string {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = pako.deflate(jsonString);
    const binaryString = String.fromCharCode(...compressed);
    return btoa(binaryString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''); // URL-safe Base64
  } catch (e) {
    console.error('Encoding failed:', e);
    return '';
  }
}

/**
 * Decodes a URL-safe Base64 string to original data.
 */
export function decodeData(encoded: string): SharingData | null {
  try {
    // Restore Base64 padding and characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const binaryString = atob(base64);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    
    const decompressed = pako.inflate(uint8Array, { to: 'string' });
    return JSON.parse(decompressed) as SharingData;
  } catch (e) {
    console.error('Decoding failed:', e);
    return null;
  }
}
