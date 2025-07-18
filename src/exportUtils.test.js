import { describe, it, expect } from 'vitest';
import { rowsToYAML, rowsToMarkdown, rowsToCSV, rowsToTSV } from './exportUtils.js';

const columns = [
  { field: 'a', headerName: 'A' },
  { field: 'b', headerName: 'B' }
];
const rows = [
  { a: 'x', b: 'y' },
  { a: '1', b: '2' }
];

describe('export utils', () => {
  it('converts rows to YAML', () => {
    const yaml = rowsToYAML(rows, columns).trim();
    expect(yaml).toBe('-\n  a: x\n  b: y\n-\n  a: 1\n  b: 2');
  });
  it('converts rows to Markdown', () => {
    const md = rowsToMarkdown(rows, columns).trim();
    expect(md).toBe('|A|B|\n|---|---|\n|x|y|\n|1|2|');
  });
  it('converts rows to CSV', () => {
    const csv = rowsToCSV(rows, columns).trim();
    expect(csv).toBe('A,B\n"x","y"\n"1","2"');
  });
  it('converts rows to TSV', () => {
    const tsv = rowsToTSV(rows, columns).trim();
    expect(tsv).toBe('A\tB\nx\ty\n1\t2');
  });
});
