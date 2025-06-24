import { describe, it, expect } from 'vitest';
import { parseSheetId } from './googleSheet';

describe('parseSheetId', () => {
  it('extracts id from url', () => {
    expect(parseSheetId('https://docs.google.com/spreadsheets/d/abc123/edit')).toBe('abc123');
  });
  it('returns null for invalid url', () => {
    expect(parseSheetId('https://example.com')).toBeNull();
  });
});
