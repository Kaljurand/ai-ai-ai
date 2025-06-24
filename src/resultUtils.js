import { wordErrorRate } from './wordErrorRate';
import { diffWordsHtml } from './diffWords';

export function transcriptsToRows(transcripts, audios, texts) {
  return transcripts.map((t, i) => {
    const audio = audios[t.aIndex];
    const txt = audio ? texts[audio.index] : null;
    const orig = txt?.text || '';
    const transcription = t.text;
    const wer = wordErrorRate(orig, transcription);
    const diff = txt ? diffWordsHtml(orig, transcription) : transcription;
    return { i: i + 1, model: t.provider, original: orig, transcription, wer, diff };
  });
}
