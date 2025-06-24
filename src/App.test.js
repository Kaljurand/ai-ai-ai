import { describe, it, expect } from 'vitest';
import { transform } from 'esbuild';
import fs from 'fs';

describe('App.jsx compilation', () => {
  it('compiles without syntax errors', async () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    await expect(transform(code, { loader: 'jsx' })).resolves.toBeTruthy();
  });
  it('contains Voro translations', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('vro:')).toBe(true);
  });
  it('includes new TTS model and prices tab', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('gpt-4o-mini-tts')).toBe(true);
    expect(code.includes('tabPrices')).toBe(true);
  });
  it('contains dark mode and demo instruction labels', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('darkMode')).toBe(true);
    expect(code.includes('demoInstrLabel')).toBe(true);
  });
  it('contains OpenRouter API key label', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('openrouterKey')).toBe(true);
  });
});
