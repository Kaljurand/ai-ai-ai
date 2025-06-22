import React, { useState, useEffect } from 'react';
import { wordErrorRate } from './wordErrorRate';
import { diffWordsHtml } from './diffWords';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Snackbar,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

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
  const [genPrompt, setGenPrompt] = useStoredState('genPrompt', 'Generate a realistic Estonian weather report');
  const [ttsPrompt, setTtsPrompt] = useStoredState('ttsPrompt', 'Use an Estonian female voice');
  const [asrPrompt, setAsrPrompt] = useStoredState('asrPrompt', 'Transcribe the speech to Estonian text with punctuation');

  const [view, setView] = useState('audio');
  const [ttsModels, setTtsModels] = useState([]);
  const [selectedTtsModels, setSelectedTtsModels] = useState([]);
  const [generateTtsPrompt, setGenerateTtsPrompt] = useState(false);
  const [ttsGenPrompt, setTtsGenPrompt] = useState('Create a short Estonian greeting');
  const [ttsGenModel, setTtsGenModel] = useState('');
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioSort, setAudioSort] = useState({ column: 'timestamp', asc: false });
  const [resultSort, setResultSort] = useState({ column: 'i', asc: true });
  const [errorMsg, setErrorMsg] = useState('');

  const predefinedPrompts = [
    'Write a 4-turn dialogue in Estonian between two speakers discussing the weather. The dialogue should include specific temperatures, wind speeds, dates, times, and common weather-related abbreviations (like °C, km/h, EMHI, jne.). The tone should be natural but information-dense.',
    'Generate a short news style weather update for Tallinn including temperatures and wind information.',
    'Create a friendly conversation about weekend plans in Estonian.'
  ];

  useEffect(() => {
    if (ttsModels.length && !selectedTtsModels.length) {
      setSelectedTtsModels([ttsModels[0].id]);
    }
  }, [ttsModels]);

  const ttsGenModelsList = [
    ...openAiModels.map(m => ({ id: m, provider: 'openai' })),
    ...googleModels.map(m => ({ id: m, provider: 'google' }))
  ];

  const sortItems = (items, { column, asc }) => {
    const withIndex = items.map((it, i) => ({ ...it, _index: i }));
    const sorted = withIndex.sort((a, b) => {
      const av = a[column];
      const bv = b[column];
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      if (Date.parse(av) && Date.parse(bv)) return new Date(av) - new Date(bv);
      return String(av).localeCompare(String(bv));
    });
    const res = asc ? sorted : sorted.reverse();
    return res;
  };

  const handleAudioSort = col => {
    setAudioSort(s => ({ column: col, asc: s.column === col ? !s.asc : true }));
  };

  const handleResultSort = col => {
    setResultSort(s => ({ column: col, asc: s.column === col ? !s.asc : true }));
  };

  const showError = msg => {
    setErrorMsg(msg);
  };

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
        const tts = data.data?.filter(m => m.id.startsWith('tts-')).map(m => ({ id: m.id, name: m.id, cost: '' }));
        if (tts?.length) {
          setTtsModels(t => [...t.filter(x => !x.id.startsWith('tts-')), ...tts]);
          if (!selectedTtsModels.length) setSelectedTtsModels([tts[0].id]);
        }
      })
      .catch(e => showError(e.message));
  }, [apiKeys.openai]);

  useEffect(() => {
    const all = [
      ...openAiModels.map(m => ({ id: m, provider: 'openai' })),
      ...googleModels.map(m => ({ id: m, provider: 'google' }))
    ];
    if (!ttsGenModel && all.length) {
      setTtsGenModel(all[0].id);
    }
  }, [openAiModels, googleModels]);

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
      .catch(e => showError(e.message));
  }, [apiKeys.google]);

  useEffect(() => {
    if (!apiKeys.google) return;
    fetch(`https://texttospeech.googleapis.com/v1/voices?key=${apiKeys.google}`)
      .then(async r => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          throw new Error(e.error?.message || 'Failed to fetch Google voices');
        }
        return r.json();
      })
      .then(data => {
        const voices = data.voices?.map(v => ({ id: v.name, name: v.name, cost: '' }));
        if (voices?.length) {
          setTtsModels(t => [...t.filter(x => !x.id.startsWith('projects/')), ...voices]);
          if (!selectedTtsModels.length) setSelectedTtsModels([voices[0].id]);
        }
      })
      .catch(e => showError(e.message));
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
        showError(e.error?.message || 'Text generation failed');
        setStatus('');
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
        showError(e.error?.message || 'Text generation failed');
        setStatus('');
        return;
      }
      const data = await res.json();
      text = data.choices?.[0]?.message?.content?.trim();
    }
    if (text) setTexts([...texts, { provider, text, prompt }]);
    setStatus('');
  };


  const uploadAudio = (index, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const idx = texts.length;
    const timestamp = new Date().toISOString();
    setTexts([...texts, { provider: 'upload', text: `Uploaded audio ${idx + 1}` }]);
    setAudios([...audios, { index: idx, provider: 'upload', url, prompt: ttsPrompt, timestamp }]);
  };

  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = e => {
        const url = URL.createObjectURL(e.data);
        const idx = texts.length;
        const timestamp = new Date().toISOString();
        setTexts([...texts, { provider: 'record', text: `Recorded audio ${idx + 1}` }]);
        setAudios(a => [...a, { index: idx, provider: 'record', url, prompt: ttsPrompt, timestamp }]);
      };
      rec.start();
      setRecorder(rec);
      setRecording(true);
    } catch {
      setStatus('Recording not available');
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setRecording(false);
    }
  };

  const generateTtsText = async () => {
    setStatus('Generating prompt...');
    if (mockMode) {
      setTtsPrompt('Tere, see on genereeritud kõne.');
      setStatus('');
      return;
    }
    const prompt = ttsGenPrompt;
    let text = '';
    const modelInfo = ttsGenModelsList.find(m => m.id === ttsGenModel);
    try {
      if (modelInfo?.provider === 'google') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${ttsGenModel}:generateText?key=${apiKeys.google}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: { text: prompt } })
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error?.message || 'Failed to generate prompt');
        }
        const data = await res.json();
        text = data.candidates?.[0]?.output?.trim();
      } else if (modelInfo?.provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKeys.openai}` },
          body: JSON.stringify({ model: ttsGenModel, messages: [{ role: 'user', content: prompt }] })
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error?.message || 'Failed to generate prompt');
        }
        const data = await res.json();
        text = data.choices?.[0]?.message?.content?.trim();
      }
    } catch (e) {
      showError(e.message);
    }
    if (text) setTtsPrompt(text);
    setStatus('');
  };

  const synthesizeTts = async () => {
    const idx = texts.length;
    const timestamp = new Date().toISOString();
    setTexts([...texts, { provider: 'tts', text: ttsPrompt }]);
    for (const model of selectedTtsModels) {
      if (mockMode) {
        const blob = new Blob([ttsPrompt], { type: 'audio/plain' });
        const url = URL.createObjectURL(blob);
        setAudios(a => [...a, { index: idx, provider: model, url, prompt: ttsPrompt, timestamp }]);
      } else {
        // Replace with real TTS server call
        const blob = new Blob([`${model}:${ttsPrompt}`], { type: 'audio/plain' });
        const url = URL.createObjectURL(blob);
        setAudios(a => [...a, { index: idx, provider: model, url, prompt: ttsPrompt, timestamp }]);
      }
    }
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

  const deleteAudio = (aIndex) => {
    setAudios(a => a.filter((_, i) => i !== aIndex));
    setTranscripts(t => t.flatMap(tr => {
      if (tr.aIndex === aIndex) return [];
      if (tr.aIndex > aIndex) return [{ ...tr, aIndex: tr.aIndex - 1 }];
      return [tr];
    }));
  };

  const deleteTranscript = (tIndex) => {
    setTranscripts(t => t.filter((_, i) => i !== tIndex));
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

  const sortedAudios = sortItems(audios, audioSort);
  const sortedRows = sortItems(rows, resultSort);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Estonian Speech Comparison Tool</Typography>
          <Tabs value={view} onChange={(e, v) => setView(v)} textColor="inherit" indicatorColor="secondary">
            <Tab value="audio" label="Audio Generation" />
            <Tab value="results" label="Results" />
            <Tab value="prompts" label="Prompts" />
            <Tab value="config" label="Config" />
          </Tabs>
        </Toolbar>
      </AppBar>
      {view === 'audio' && (
        <div style={{ padding: '1rem' }}>
          <FormControlLabel control={<Checkbox checked={generateTtsPrompt} onChange={e => setGenerateTtsPrompt(e.target.checked)} />} label="Generate the TTS prompt" />
          {generateTtsPrompt && (
            <>
              <Select value={ttsGenModel} onChange={e => setTtsGenModel(e.target.value)} fullWidth>
                {ttsGenModelsList.map(m => (
                  <MenuItem key={m.id} value={m.id}>{`${m.id} (${m.provider})`}</MenuItem>
                ))}
              </Select>
              <TextField label="Prompt for text generator" multiline rows={3} value={ttsGenPrompt} onChange={e => setTtsGenPrompt(e.target.value)} fullWidth margin="normal" />
              <Button onClick={generateTtsText}>Generate Prompt</Button>
            </>
          )}
          <TextField label="TTS prompt" multiline rows={3} value={ttsPrompt} onChange={e => setTtsPrompt(e.target.value)} fullWidth margin="normal" />
          <Select multiple value={selectedTtsModels} onChange={e => setSelectedTtsModels(e.target.value)} fullWidth renderValue={s => s.join(', ')}>
            {ttsModels.map(m => (
              <MenuItem key={m.id} value={m.id}>{`${m.name} (${m.cost})`}</MenuItem>
            ))}
          </Select>
          <Button variant="contained" onClick={synthesizeTts} sx={{ mt: 1 }}>Generate Audio</Button>
          <Button component="label" sx={{ mt: 1, ml: 1 }}>
            Upload Audio
            <input type="file" accept="audio/*" hidden onChange={e => uploadAudio(texts.length, e.target.files[0])} />
          </Button>
          <Button onClick={recording ? stopRecording : startRecording} sx={{ mt: 1, ml: 1 }}>
            {recording ? 'Stop Recording' : 'Record Audio'}
          </Button>
          <table style={{ width: '100%', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th onClick={() => handleAudioSort('timestamp')}>Time</th>
                <th onClick={() => handleAudioSort('provider')}>Provider</th>
                <th>Audio</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAudios.map((a, i) => (
                <tr key={i}>
                  <td>{a.timestamp}</td>
                  <td>{a.provider}</td>
                  <td>{a.url && <audio controls src={a.url}></audio>}</td>
                  <td>
                    <Button onClick={() => transcribe(a._index)}>Transcribe</Button>
                    <Button onClick={() => deleteAudio(a._index)} color="error" sx={{ ml: 1 }}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {status && <p>{status}</p>}
        </div>
      )}
      {view === 'results' && (
        <div style={{ padding: '1rem' }}>
          <Button onClick={exportJSON}>Export JSON</Button>
          <Button onClick={exportCSV}>Export CSV</Button>
          <Button onClick={clearData}>Clear Data</Button>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleResultSort('i')}>#</th>
                <th onClick={() => handleResultSort('original')}>Original Text</th>
                <th onClick={() => handleResultSort('transcription')}>Transcription</th>
                <th onClick={() => handleResultSort('wer')}>WER</th>
                <th>Diff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.i}</td>
                  <td>{r.original}</td>
                  <td>{r.transcription}</td>
                  <td>{r.wer}</td>
                  <td dangerouslySetInnerHTML={{__html:r.diff}}></td>
                  <td><Button onClick={() => deleteTranscript(idx)} color="error">Delete</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {status && <p>{status}</p>}
        </div>
      )}
      {view === 'prompts' && (
        <div style={{ padding: '1rem' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Predefined Prompts</Typography>
          <List>
            {predefinedPrompts.map((p, i) => (
              <ListItem button key={i} onClick={() => { setTtsGenPrompt(p); setView('audio'); setGenerateTtsPrompt(true); }}>
                <ListItemText primary={p} />
              </ListItem>
            ))}
          </List>
        </div>
      )}
      {view === 'config' && (
        <div style={{ padding: '1rem' }}>
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
        </div>
      )}
      <Snackbar open={!!errorMsg} message={errorMsg} onClose={() => setErrorMsg('')} autoHideDuration={6000} />
    </>
  );
}

