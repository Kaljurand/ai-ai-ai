import { describe, it, expect } from 'vitest';
import { diffWords } from './diffWords';

describe('diffWords', () => {
  it('marks identical words as equal', () => {
    const diff = diffWords('a b', 'a b');
    expect(diff).toEqual([
      {type:'equal', word:'a'},
      {type:'equal', word:'b'}
    ]);
  });
  it('detects insert and delete', () => {
    const diff = diffWords('a b', 'a x b');
    expect(diff).toEqual([
      {type:'equal', word:'a'},
      {type:'insert', word:'x'},
      {type:'equal', word:'b'}
    ]);
  });
});
