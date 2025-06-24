import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('error bar style', () => {
  it('contains error-bar class', () => {
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css.includes('.error-bar')).toBe(true);
  });
});
