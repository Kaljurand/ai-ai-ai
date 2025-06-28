import { describe, it, expect } from 'vitest';
import { expandRefs } from './referenceUtils';

describe('expandRefs', () => {
  const texts = [{ text: 'hello', provider: 'gpt' }];
  const audios = [{ data: 'AUDIO', url: 'u', index: 0 }];
  it('replaces table references', () => {
    const str = 'A {{tab_text.table.1.text}} B {{tab_text.table.1.source}}';
    const res = expandRefs(str, { texts, audios });
    expect(res).toBe('A hello B gpt');
  });
  it('replaces audio references', () => {
    const str = '{{tab_audio.table.1.audio}}';
    const res = expandRefs(str, { texts, audios });
    expect(res).toBe('AUDIO');
  });
});
