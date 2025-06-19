import React, { useState, useEffect } from 'react';
import { wordErrorRate } from './wordErrorRate';

function useStoredState(key, initial) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}

export default function App() {
  const [apiKeys, setApiKeys] = useStoredState('apiKeys', { openai: '' });
  const [texts, setTexts] = useStoredState('texts', []);
  const [audios, setAudios] = useStoredState('audios', []);
  const [transcripts, setTranscripts] = useStoredState('transcripts', []);

  const mockMode = !apiKeys.openai;

  const generateText = async () => {
    if (mockMode) {
      const mock = `Näidis lause ${texts.length + 1} numbriga ${Math.floor(Math.random()*100)}`;
      setTexts([...texts, { provider: 'mock', text: mock }]);
      return;
    }
    const prompt = 'Loo keeruline lühike eestikeelne tekst, mis sisaldab numbreid ja lühendeid.';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeys.openai}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    }).then(r => r.json());
    const text = res.choices?.[0]?.message?.content?.trim();
    if (text) setTexts([...texts, { provider: 'openai', text }]);
  };

  const synthesize = async (index) => {
    const txt = texts[index];
    if (!txt) return;
    if (mockMode) {
      const blob = new Blob([txt.text], { type: 'audio/plain' });
      const url = URL.createObjectURL(blob);
      setAudios([...audios, { index, provider: 'mock', url }]);
      return;
    }
    const utter = new SpeechSynthesisUtterance(txt.text);
    speechSynthesis.speak(utter);
    const url = '';
    setAudios([...audios, { index, provider: 'speechSynthesis', url }]);
  };

  const transcribe = async (aIndex) => {
    const audio = audios[aIndex];
    if (!audio) return;
    if (mockMode) {
      const transcript = texts[audio.index]?.text || '';
      setTranscripts([...transcripts, { aIndex, provider: 'mock', text: transcript }]);
      return;
    }
    const transcript = texts[audio.index]?.text || '';
    setTranscripts([...transcripts, { aIndex, provider: 'copy', text: transcript }]);
  };

  const rows = transcripts.map((t, i) => {
    const audio = audios[t.aIndex];
    const txt = texts[audio.index];
    const wer = wordErrorRate(txt.text, t.text);
    return { i: i + 1, original: txt.text, transcription: t.text, wer };
  });

  return (
    <div>
      <h1>Estonian Speech Comparison Tool</h1>
      <h2>API Key</h2>
      <input
        type="password"
        placeholder="OpenAI API key"
        value={apiKeys.openai}
        onChange={e => setApiKeys({ ...apiKeys, openai: e.target.value })}
      />
      {mockMode && <p style={{color:'red'}}>Mock mode active: no API key</p>}
      <h2>Text Generation</h2>
      <button onClick={generateText}>Generate Sample Text</button>
      <ul>
        {texts.map((t, i) => (
          <li key={i}>{t.text} <button onClick={() => synthesize(i)}>Synthesize</button></li>
        ))}
      </ul>
      <h2>Generated Audio</h2>
      <ul>
        {audios.map((a, i) => (
          <li key={i}>
            Audio {i + 1} from text {a.index + 1}
            {a.url && <audio controls src={a.url}></audio>}
            <button onClick={() => transcribe(i)}>Transcribe</button>
          </li>
        ))}
      </ul>
      <h2>Results</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Original Text</th><th>Transcription</th><th>WER</th></tr>
        </thead>
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
    </div>
  );
}

