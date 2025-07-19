import { describe, it, expect } from 'vitest';
import { transcriptsToRows } from './resultUtils';

describe('transcriptsToRows', () => {
  it('handles missing references', () => {
    const texts = [{ text: 'hi', provider: 't1' }];
    const audios = [{ index: 0, provider: 'a1' }];
    const transcripts = [
      { aIndex: 0, provider: 'mock', text: 'hi' },
      { aIndex: 1, provider: 'mock', text: 'oops' }
    ];
    const rows = transcriptsToRows(transcripts, audios, texts);
    expect(rows[0].wer).toBe('0.00');
    expect(rows[0].textSource).toBe('t1');
    expect(rows[0].audioSource).toBe('a1');
    expect(rows[0].asrSource).toBe('mock');
    expect(rows[1].wer).toBe('1.00');
  });

  it('marks pending rows', () => {
    const texts = [];
    const audios = [];
    const transcripts = [
      { aIndex: 0, provider: 'mock', text: '', pending: true }
    ];
    const rows = transcriptsToRows(transcripts, audios, texts);
    expect(rows[0].pending).toBe(true);
    expect(rows[0].wer).toBe('');
  });

  it('ignores TTS instructions when computing WER', () => {
    const texts = [{ text: 'hello there', instructions: 'fast', provider: 'tts' }];
    const audios = [{ index: 0, provider: 'tts' }];
    const transcripts = [
      { aIndex: 0, provider: 'mock', text: 'hello there' }
    ];
    const rows = transcriptsToRows(transcripts, audios, texts);
    expect(rows[0].wer).toBe('0.00');
  });
});
