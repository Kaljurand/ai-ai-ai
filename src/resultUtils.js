import { wordErrorRate } from './wordErrorRate';
import { diffWordsHtml } from './diffWords';

export function transcriptsToRows(transcripts, audios, texts) {
  return transcripts.map((t, i) => {
    const audio = audios[t.aIndex];
    const txt = audio ? texts[audio.index] : null;
    const orig = txt?.text || '';
    const transcription = t.text;
    const row = {
      i: i + 1,
      original: orig,
      transcription,
      timestamp: t.timestamp,
      textSource: txt?.provider || '',
      audioSource: audio?.provider || '',
      asrSource: t.provider,
      pending: t.pending || false
    };
    if (!row.pending) {
      row.wer = wordErrorRate(orig, transcription);
      row.diff = txt ? diffWordsHtml(orig, transcription) : transcription;
    } else {
      row.wer = '';
      row.diff = '';
    }
    return row;
  });
}
