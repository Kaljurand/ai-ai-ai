import { describe, it, expect } from 'vitest';
import { wordErrorRate } from './wordErrorRate';

describe('wordErrorRate', () => {
  it('returns 0 for identical strings', () => {
    expect(wordErrorRate('hello world', 'hello world')).toBe('0.00');
  });
  it('returns 1 for totally different', () => {
    expect(wordErrorRate('a b c', 'x y z')).toBe('1.00');
  });
});
