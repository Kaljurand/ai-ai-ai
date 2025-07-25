import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('error bar style', () => {
  it('contains error-bar class', () => {
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css.includes('.error-bar')).toBe(true);
  });
  it('contains dot-spinner class', () => {
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css.includes('.dot-spinner')).toBe(true);
  });
  it('contains pending-row animation', () => {
    const css = fs.readFileSync('src/style.css', 'utf8');
    expect(css.includes('.pending-row')).toBe(true);
    expect(css.includes('@keyframes rowPending')).toBe(true);
  });
});
