export function expandRefs(str, { texts = [], audios = [], textPrompt = '', ttsPrompt = '' } = {}) {
  if (!str) return '';
  const getTextRow = id => texts[id - 1];
  const getAudioRow = id => audios[id - 1];
  return str.replace(/{{(.*?)}}/g, (_, expr) => {
    const parts = expr.split('.');
    if (parts[0] === 'tab_text') {
      if (parts[1] === 'table') {
        const row = getTextRow(parseInt(parts[2], 10));
        if (!row) return '';
        const field = parts[3] === 'source' ? 'provider' : parts[3];
        return row[field] ?? '';
      }
      if (parts[1] === 'text') return ttsPrompt || textPrompt || '';
    }
    if (parts[0] === 'tab_audio' && parts[1] === 'table') {
      const row = getAudioRow(parseInt(parts[2], 10));
      if (!row) return '';
      if (parts[3] === 'audio') return row.data || row.url || '';
      if (parts[3] === 'text') return texts[row.index]?.text || '';
      return row[parts[3]] ?? '';
    }
    return '';
  });
}
