import React from 'react';
import { wordErrorRate } from './wordErrorRate.js';

export function ResultsTable({ texts = [], transcripts = [] }) {
  const rows = transcripts.map((t, i) => {
    const txt = texts[t.aIndex];
    const wer = wordErrorRate(txt.text, t.text);
    return { i: i + 1, original: txt.text, transcription: t.text, wer };
  });

  return (
    <table data-testid="results-table">
      <tbody>
        {rows.map(r => (
          <tr key={r.i}>
            <td>{r.i}</td>
            <td>{r.original}</td>
            <td>{r.transcription}</td>
            <td>{r.wer}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
