import { describe, it, expect } from 'vitest';
import { transform } from 'esbuild';
import fs from 'fs';

describe('providers module', () => {
  it('compiles without syntax errors', async () => {
    const code = fs.readFileSync('src/providers.js', 'utf8');
    await expect(transform(code, { loader: 'jsx' })).resolves.toBeTruthy();
  });
  it('contains provider URLs', () => {
    const code = fs.readFileSync('src/providers.js', 'utf8');
    expect(code.includes('openrouter.ai')).toBe(true);
    expect(code.includes('api.openai.com')).toBe(true);
    expect(code.includes('googleapis.com')).toBe(true);
  });
});
