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
  it('includes new ASR models', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('gpt-4o-transcribe')).toBe(true);
    expect(code.includes('gpt-4o-mini-transcribe')).toBe(true);
  });
  it('uses audio MIME type when uploading', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('mimeMatch')).toBe(true);
    expect(code.includes('<audio>.${ext}')).toBe(true);
    expect(code.includes('new File')).toBe(true);
  });
  it('formats log values', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('formatLogValue')).toBe(true);
    expect(code.includes('<text>')).toBe(true);
  });
  it('uses OpenAI client for transcription', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('openaiRef.current.audio.transcriptions.create')).toBe(true);
  });
});
