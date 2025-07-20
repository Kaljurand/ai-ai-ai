import { describe, it, expect } from 'vitest';
import fs from 'fs';

function loadTruncate() {
  const code = fs.readFileSync('src/App.jsx', 'utf8');
  const start = code.indexOf('const truncate');
  const open = code.indexOf('{', start);
  let depth = 1; let i = open + 1;
  while (depth > 0 && i < code.length) {
    if (code[i] === '{') depth++; else if (code[i] === '}') depth--;
    i++;
  }
  const body = code.slice(open, i);
  return eval('(v =>' + body + ')');
}

describe('log truncate', () => {
  const truncate = loadTruncate();
  it('replaces long byte strings with placeholder', () => {
    const out = truncate({ data: 'A'.repeat(150) });
    expect(out).toBe(JSON.stringify({ data: '<bytes>' }));
  });
  it('keeps regular strings intact', () => {
    const out = truncate({ text: 'hello' });
    expect(out).toBe(JSON.stringify({ text: 'hello' }));
  });
});
