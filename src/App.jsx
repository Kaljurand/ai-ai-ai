import React, { useState, useEffect } from 'react';
import { wordErrorRate } from './wordErrorRate';
import { diffWordsHtml } from './diffWords';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

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

function makeLongMockText(index) {
  const num = Math.floor(Math.random() * 100);
  return `Näidis pikem tekst ${index} sisaldab mitut lauset ja juhusliku numbri ${num}. ` +
    'Teine lause venitab kasutajaliidese paigutust ning kontrollib komade ja lühendite lk kasutamist. ' +
    'Kolmas lause lisab keerukama sõna nagu õunaaed ja muudab teksti mitmekesiseks.';
}

function makeMockTranscription(text) {
  const words = text.split(/\s+/);
  const out = [];
  for (const w of words) {
    const r = Math.random();
    if (r < 0.1) continue; // drop word
    let word = w;
    if (r >= 0.1 && r < 0.2) {
      const idx = Math.floor(Math.random() * w.length);
      const ch = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      word = w.slice(0, idx) + ch + w.slice(idx + 1);
    }
    out.push(word);
    if (r >= 0.2 && r < 0.3) out.push('ja');
  }
  return out.join(' ');
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [genPrompt, setGenPrompt] = useStoredState('genPrompt', 'Generate a realistic Estonian weather report');
  const [ttsPrompt, setTtsPrompt] = useStoredState('ttsPrompt', 'Use an Estonian female voice');
  const [asrPrompt, setAsrPrompt] = useStoredState('asrPrompt', 'Transcribe the speech to Estonian text with punctuation');

  const mockMode = !apiKeys.openai && !apiKeys.google;

  useEffect(() => {
    if (!apiKeys.openai) return;
    fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKeys.openai}`
      }
    })
      .then(async r => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          throw new Error(e.error?.message || 'Failed to fetch OpenAI models');
        }
        return r.json();
      })
      .then(data => {
        const models = data.data?.map(m => m.id).sort();
        if (models?.length) {
          setOpenAiModels(models);
          if (!models.includes(openAiModel)) setOpenAiModel(models[0]);
        }
      })
      .catch(e => setStatus(e.message));
  }, [apiKeys.openai]);

  useEffect(() => {
    if (!apiKeys.google) return;
    fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeys.google}`)
      .then(async r => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          throw new Error(e.error?.message || 'Failed to fetch Google models');
        }
        return r.json();
      })
      .then(data => {
        const models = data.models?.map(m => m.name);
        if (models?.length) {
          setGoogleModels(models);
          if (!models.includes(googleModel)) setGoogleModel(models[0]);
        }
      })
      .catch(e => setStatus(e.message));
  }, [apiKeys.google]);

  const generateText = async () => {
    setStatus('Generating text...');
    if (mockMode) {
      const mock = makeLongMockText(texts.length + 1);
      setTexts([...texts, { provider: 'mock', text: mock }]);
      setStatus('');
      return;
    }
    const prompt = genPrompt;
    let text = '';
    if (provider === 'google') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateText?key=${apiKeys.google}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: { text: prompt } })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setStatus(e.error?.message || 'Text generation failed');
        return;
      }
      const data = await res.json();
      text = data.candidates?.[0]?.output?.trim();
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
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setStatus(e.error?.message || 'Text generation failed');
        return;
      }
      const data = await res.json();
      text = data.choices?.[0]?.message?.content?.trim();
    }
    if (text) setTexts([...texts, { provider, text, prompt }]);
    setStatus('');
  };

  const synthesize = async (index) => {
    const txt = texts[index];
    if (!txt) return;
    setStatus('Synthesizing...');
    if (mockMode) {
      const blob = new Blob([txt.text], { type: 'audio/plain' });
      const url = URL.createObjectURL(blob);
      setAudios([...audios, { index, provider: 'mock', url, prompt: ttsPrompt }]);
      setStatus('');
      return;
    }
    const utter = new SpeechSynthesisUtterance(txt.text);
    speechSynthesis.speak(utter);
    const url = '';
    setAudios([...audios, { index, provider: 'speechSynthesis', url, prompt: ttsPrompt }]);
    setStatus('');
  };

  const uploadAudio = (index, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudios([...audios, { index, provider: 'upload', url, prompt: ttsPrompt }]);
  };

  const transcribe = async (aIndex) => {
    const audio = audios[aIndex];
    if (!audio) return;
    setStatus('Transcribing...');
    const finish = (text, provider) => {
      setTranscripts([...transcripts, { aIndex, provider, text, prompt: asrPrompt }]);
      setStatus('');
    };
    if (mockMode) {
      const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
      if (SR) {
        try {
          const recognition = new SR();
          recognition.lang = 'et-EE';
          recognition.onresult = e => {
            const text = Array.from(e.results).map(r => r[0].transcript).join(' ');
            finish(text, 'browser-asr');
          };
          recognition.onerror = () => finish(makeMockTranscription(texts[audio.index]?.text || ''), 'mock');
          recognition.start();
          if (audio.url) {
            new Audio(audio.url).play();
          }
          return;
        } catch {
          // ignore and fallback
        }
      }
      const text = makeMockTranscription(texts[audio.index]?.text || '');
      finish(text, 'mock');
      return;
    }
    const transcript = texts[audio.index]?.text || '';
    finish(transcript, 'copy');
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
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Estonian Speech Comparison Tool</Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div style={{ width: 250, padding: '1rem' }}>
          <Typography variant="h6">Configuration</Typography>
          <TextField
            label="OpenAI API key"
            type="password"
            value={apiKeys.openai}
            onChange={e => setApiKeys({ ...apiKeys, openai: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Google API key"
            type="password"
            value={apiKeys.google}
            onChange={e => setApiKeys({ ...apiKeys, google: e.target.value })}
            fullWidth
            margin="normal"
          />
          {mockMode && <Typography color="error">Mock mode active: no API key</Typography>}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Text Generation</Typography>
          <Select value={provider} onChange={e => setProvider(e.target.value)} fullWidth>
            <MenuItem value="openai">OpenAI</MenuItem>
            <MenuItem value="google">Google</MenuItem>
          </Select>
          {provider === 'openai' && (
            <Select value={openAiModel} onChange={e => setOpenAiModel(e.target.value)} fullWidth margin="normal">
              {openAiModels.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              {!openAiModels.length && <MenuItem value="gpt-3.5-turbo">gpt-3.5-turbo</MenuItem>}
            </Select>
          )}
          {provider === 'google' && (
            <Select value={googleModel} onChange={e => setGoogleModel(e.target.value)} fullWidth margin="normal">
              {googleModels.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          )}
          <TextField
            label="Generation prompt"
            multiline
            rows={3}
            value={genPrompt}
            onChange={e => setGenPrompt(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="TTS prompt"
            multiline
            rows={2}
            value={ttsPrompt}
            onChange={e => setTtsPrompt(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="ASR prompt"
            multiline
            rows={2}
            value={asrPrompt}
            onChange={e => setAsrPrompt(e.target.value)}
            fullWidth
            margin="normal"
          />
        </div>
      </Drawer>
      <div style={{ padding: '1rem' }}>
        <Button variant="contained" onClick={generateText}>Generate Sample Text</Button>
        <div style={{ marginTop: '1rem' }}>
          <TextField
            multiline
            fullWidth
            rows={3}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Add custom text"
          />
          <Button variant="outlined" onClick={addText} sx={{ mt: 1 }}>Add Text</Button>
        </div>
        <ul>
          {texts.map((t, i) => (
            <li key={i}>
              <TextField multiline fullWidth value={t.text} onChange={e => updateText(i, e.target.value)} />
              <Button onClick={() => synthesize(i)} sx={{ mt: 1 }}>Synthesize</Button>
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
              <Button onClick={() => transcribe(i)}>Transcribe</Button>
            </li>
          ))}
        </ul>
        <h2>Results</h2>
        <Button onClick={exportJSON}>Export JSON</Button>
        <Button onClick={exportCSV}>Export CSV</Button>
        <Button onClick={clearData}>Clear Data</Button>
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
    </>
  );
}

