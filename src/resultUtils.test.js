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
    expect(rows[1].wer).toBe('1.00');
  });
});
