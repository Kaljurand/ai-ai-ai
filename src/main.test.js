import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('main.jsx theme', () => {
  it('applies button state styles', () => {
    const code = fs.readFileSync('src/main.jsx', 'utf8');
    expect(code.includes('minWidth: 44')).toBe(true);
    expect(code.includes('minHeight: 44')).toBe(true);
    expect(code.includes('transform 100ms')).toBe(true);
  });
});
