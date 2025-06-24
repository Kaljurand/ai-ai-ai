import { describe, it, expect } from 'vitest';
import { rowsToCSV, rowsToMarkdown } from './exportUtils.js';

const columns = [
  { field: 'a', headerName: 'A' },
  { field: 'b', headerName: 'B' }
];
const rows = [
  { a: 'x', b: 'y' },
  { a: '1', b: '2' }
];

describe('export utils', () => {
  it('converts rows to CSV', () => {
    const csv = rowsToCSV(rows, columns).trim();
    expect(csv).toBe('A,B\n"x","y"\n"1","2"');
  });
  it('converts rows to Markdown', () => {
    const md = rowsToMarkdown(rows, columns).trim();
    expect(md).toBe('|A|B|\n|---|---|\n|x|y|\n|1|2|');
  });
});
