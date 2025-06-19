import { wordErrorRate } from '../src/wordErrorRate.js';

describe('wordErrorRate', () => {
  test('identical sentences have WER 0', () => {
    expect(wordErrorRate('hello world', 'hello world')).toBe('0.00');
  });

  test('single substitution', () => {
    expect(wordErrorRate('hello world', 'hello there')).toBe('0.50');
  });
});
