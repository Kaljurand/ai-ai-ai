import { describe, it, expect, vi } from 'vitest';
import { transform } from 'esbuild';
import fs from 'fs';
import { fetchOpenRouterCredits } from './providers';

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

  it('fetches remaining OpenRouter credits', async () => {
    const mockData = { data: { limit_remaining: 4.7 } };
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockData) });
    const result = await fetchOpenRouterCredits('abc', fetchFn);
    expect(fetchFn).toHaveBeenCalledWith('https://openrouter.ai/api/v1/key', { headers: { Authorization: 'Bearer abc' } });
    expect(result.remaining).toBe(4.7);
    expect(result.raw).toEqual(mockData);
  });
});
