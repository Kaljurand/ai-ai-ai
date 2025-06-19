import React, { useState, useEffect } from 'react';
import { wordErrorRate } from './wordErrorRate';
import { diffWordsHtml } from './diffWords';

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
  const [apiKeys, setApiKeys] = useStoredState('apiKeys', { openai: '', google: '' });
  const [texts, setTexts] = useStoredState('texts', []);
  const [audios, setAudios] = useStoredState('audios', []);
  const [transcripts, setTranscripts] = useStoredState('transcripts', []);
  const [newText, setNewText] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useStoredState('provider', 'openai');
  const [openAiModels, setOpenAiModels] = useState([]);
  const [googleModels, setGoogleModels] = useState([]);
  const [openAiModel, setOpenAiModel] = useStoredState('openAiModel', 'gpt-3.5-turbo');
  const [googleModel, setGoogleModel] = useStoredState('googleModel', '');

  const mockMode = !apiKeys.openai && !apiKeys.google;

  useEffect(() => {
    if (!apiKeys.openai) return;
    fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKeys.openai}`
      }
    })
      .then(r => r.json())
      .then(data => {
        const models = data.data?.map(m => m.id).sort();
        if (models?.length) {
          setOpenAiModels(models);
          if (!models.includes(openAiModel)) setOpenAiModel(models[0]);
        }
      })
      .catch(() => {});
  }, [apiKeys.openai]);

  useEffect(() => {
    if (!apiKeys.google) return;
    fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeys.google}`)
      .then(r => r.json())
      .then(data => {
        const models = data.models?.map(m => m.name);
        if (models?.length) {
          setGoogleModels(models);
          if (!models.includes(googleModel)) setGoogleModel(models[0]);
        }
      })
      .catch(() => {});
  }, [apiKeys.google]);

  const generateText = async () => {
    setStatus('Generating text...');
    if (mockMode) {
      const mock = `Näidis lause ${texts.length + 1} numbriga ${Math.floor(Math.random()*100)}`;
      setTexts([...texts, { provider: 'mock', text: mock }]);
      setStatus('');
      return;
    }
    const prompt = 'Loo keeruline lühike eestikeelne tekst, mis sisaldab numbreid ja lühendeid.';
    let text = '';
    if (provider === 'google') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateText?key=${apiKeys.google}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: { text: prompt } })
      }).then(r => r.json());
      text = res.candidates?.[0]?.output?.trim();
    } else {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.openai}`
        },
        body: JSON.stringify({
          model: openAiModel,
          messages: [{ role: 'user', content: prompt }]
        })
      }).then(r => r.json());
      text = res.choices?.[0]?.message?.content?.trim();
    }
    if (text) setTexts([...texts, { provider, text }]);
    setStatus('');
  };

  const synthesize = async (index) => {
    const txt = texts[index];
    if (!txt) return;
    setStatus('Synthesizing...');
    if (mockMode) {
      const blob = new Blob([txt.text], { type: 'audio/plain' });
      const url = URL.createObjectURL(blob);
      setAudios([...audios, { index, provider: 'mock', url }]);
      setStatus('');
      return;
    }
    const utter = new SpeechSynthesisUtterance(txt.text);
    speechSynthesis.speak(utter);
    const url = '';
    setAudios([...audios, { index, provider: 'speechSynthesis', url }]);
    setStatus('');
  };

  const uploadAudio = (index, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudios([...audios, { index, provider: 'upload', url }]);
  };

  const transcribe = async (aIndex) => {
    const audio = audios[aIndex];
    if (!audio) return;
    setStatus('Transcribing...');
    if (mockMode) {
      const transcript = texts[audio.index]?.text || '';
      setTranscripts([...transcripts, { aIndex, provider: 'mock', text: transcript }]);
      setStatus('');
      return;
    }
    const transcript = texts[audio.index]?.text || '';
    setTranscripts([...transcripts, { aIndex, provider: 'copy', text: transcript }]);
    setStatus('');
  };

  const updateText = (index, text) => {
    setTexts(texts.map((t, i) => (i === index ? { ...t, text } : t)));
  };

  const addText = () => {
    if (!newText.trim()) return;
    setTexts([...texts, { provider: 'user', text: newText.trim() }]);
    setNewText('');
  };

  const clearData = () => {
    localStorage.clear();
    setTexts([]); setAudios([]); setTranscripts([]);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = 'index,original,transcription,wer\n';
    const lines = rows.map(r => `${r.i},"${r.original}","${r.transcription}",${r.wer}`).join('\n');
    const blob = new Blob([header + lines], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const rows = transcripts.map((t, i) => {
    const audio = audios[t.aIndex];
    const txt = texts[audio.index];
    const wer = wordErrorRate(txt.text, t.text);
    const diff = diffWordsHtml(txt.text, t.text);
    return { i: i + 1, original: txt.text, transcription: t.text, wer, diff };
  });

  return (
    <div>
      <h1>Estonian Speech Comparison Tool</h1>
      <h2>API Keys</h2>
      <input
        type="password"
        placeholder="OpenAI API key"
        value={apiKeys.openai}
        onChange={e => setApiKeys({ ...apiKeys, openai: e.target.value })}
      />
      <input
        type="password"
        placeholder="Google API key"
        value={apiKeys.google}
        onChange={e => setApiKeys({ ...apiKeys, google: e.target.value })}
      />
      {mockMode && <p style={{color:'red'}}>Mock mode active: no API key</p>}
      <h2>Text Generation</h2>
      <div>
        <label>
          Provider
          <select value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="openai">OpenAI</option>
            <option value="google">Google</option>
          </select>
        </label>
        {provider === 'openai' && (
          <select value={openAiModel} onChange={e => setOpenAiModel(e.target.value)}>
            {openAiModels.map(m => <option key={m} value={m}>{m}</option>)}
            {!openAiModels.length && <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>}
          </select>
        )}
        {provider === 'google' && (
          <select value={googleModel} onChange={e => setGoogleModel(e.target.value)}>
            {googleModels.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
        <button onClick={generateText}>Generate Sample Text</button>
      </div>
      <div>
        <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Add custom text" />
        <button onClick={addText}>Add Text</button>
      </div>
      <ul>
        {texts.map((t, i) => (
          <li key={i}>
            <textarea value={t.text} onChange={e => updateText(i, e.target.value)} />
            <button onClick={() => synthesize(i)}>Synthesize</button>
            <input type="file" accept="audio/*" onChange={e => uploadAudio(i, e.target.files[0])} />
          </li>
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
      <button onClick={exportJSON}>Export JSON</button>
      <button onClick={exportCSV}>Export CSV</button>
      <button onClick={clearData}>Clear Data</button>
      <table>
        <thead>
          <tr><th>#</th><th>Original Text</th><th>Transcription</th><th>WER</th><th>Diff</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.i}>
              <td>{r.i}</td>
              <td>{r.original}</td>
              <td>{r.transcription}</td>
              <td>{r.wer}</td>
              <td dangerouslySetInnerHTML={{__html:r.diff}}></td>
            </tr>
          ))}
        </tbody>
      </table>
      {status && <p>{status}</p>}
    </div>
  );
}

