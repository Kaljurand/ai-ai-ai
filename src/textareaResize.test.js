import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('textarea resize style', () => {
  it('allows vertical resize', () => {
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css.includes('resize: vertical')).toBe(true);
  });
});
