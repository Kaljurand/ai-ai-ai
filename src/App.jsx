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
  CircularProgress,
  Box,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

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

function PersistedGrid({ storageKey, ...props }) {
  const [sortModel, setSortModel] = useStoredState(storageKey + 'Sort', []);
  const [filterModel, setFilterModel] = useStoredState(storageKey + 'Filter', { items: [] });
  const [cols, setCols] = useStoredState(storageKey + 'Cols', {});
  return (
    <DataGrid
      autoHeight
      disableRowSelectionOnClick
      sortingOrder={['asc', 'desc']}
      sortModel={sortModel}
      onSortModelChange={setSortModel}
      filterModel={filterModel}
      onFilterModelChange={setFilterModel}
      columnVisibilityModel={cols}
      onColumnVisibilityModelChange={setCols}
      {...props}
    />
  );
}

const translations = {
  en: {
    appTitle: 'Speech Playground',
    tabText: 'Text',
    tabAudio: 'Audio',
    tabAsr: 'ASR',
    tabLog: 'Log',
    tabSettings: 'Settings',
    genPrompt: 'Generate Text',
    promptForModels: 'Prompt for text generator',
    uploadPrompt: 'Upload Prompt',
    useText: 'Use for Audio',
    textId: 'ID',
    timestamp: 'Time',
    text: 'Text',
    source: 'Source',
    ttsPromptLabel: 'TTS prompt',
    generateAudio: 'Generate Audio',
    metaPromptLabel: 'Meta prompt',
    uploadAudio: 'Upload Audio',
    recordAudio: 'Record Audio',
    stopRecording: 'Stop Recording',
    audioId: 'ID',
    audio: 'Audio',
    actions: 'Actions',
    toAsr: 'To ASR',
    asrPromptLabel: 'ASR Prompt',
    transcriptId: 'ID',
    originalText: 'Original Text',
    transcript: 'Transcript',
    wer: 'WER',
    diff: 'Diff',
    delete: 'Delete',
    exportJSON: 'Export JSON',
    exportCSV: 'Export CSV',
    exportMD: 'Export Markdown',
    clearData: 'Clear Data',
    openaiKey: 'OpenAI API key',
    googleKey: 'Google API key',
    language: 'Language',
    mockMode: 'Mock mode active: no API key'
  },
  et: {
    appTitle: 'K\u00f5ne m\u00e4nguplats',
    tabText: 'Tekst',
    tabAudio: 'Heli',
    tabAsr: 'ASR',
    tabLog: 'Logi',
    tabSettings: 'Seaded',
    genPrompt: 'Genereeri tekst',
    promptForModels: 'P\u00e4ringu sisu',
    uploadPrompt: 'Laadi tekst',
    useText: 'Saada helisse',
    textId: 'ID',
    timestamp: 'Aeg',
    text: 'Tekst',
    source: 'Allikas',
    ttsPromptLabel: 'TTS-prompt',
    generateAudio: 'Genereeri heli',
    metaPromptLabel: 'Metaprompt',
    uploadAudio: 'Laadi heli',
    recordAudio: 'Salvesta heli',
    stopRecording: 'Peata salvestus',
    audioId: 'ID',
    audio: 'Heli',
    actions: 'Tegevused',
    toAsr: 'Saada ASR-i',
    asrPromptLabel: 'ASR-prompt',
    transcriptId: 'ID',
    originalText: 'Algtekst',
    transcript: 'Transkript',
    wer: 'Viga%',
    diff: 'Erinevus',
    delete: 'Kustuta',
    exportJSON: 'Ekspordi JSON',
    exportCSV: 'Ekspordi CSV',
    exportMD: 'Ekspordi Markdown',
    clearData: 'Puhasta andmed',
    openaiKey: 'OpenAI API v\u00f5ti',
    googleKey: 'Google API v\u00f5ti',
    language: 'Keel',
    mockMode: 'Moki re\u017eiim: API v\u00f5ti puudub'
  }
};

function useTranslation() {
  const [lang, setLang] = useStoredState('lang', 'en');
  const t = key => translations[lang][key] || key;
  return { t, lang, setLang };
}

export default function App() {
  const [apiKeys, setApiKeys] = useStoredState('apiKeys', { openai: '', google: '' });
  const { t, lang, setLang } = useTranslation();
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
  const [textPrompt, setTextPrompt] = useStoredState('textPrompt', 'Generate a realistic Estonian weather report');
  const [selectedTextModels, setSelectedTextModels] = useStoredState('selectedTextModels', []);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [ttsPrompt, setTtsPrompt] = useStoredState('ttsPrompt', 'Use an Estonian female voice');
  const [asrPrompt, setAsrPrompt] = useStoredState('asrPrompt', 'Transcribe the speech to Estonian text with punctuation');

  const [view, setView] = useState('audio');
  const [ttsModels, setTtsModels] = useState([]);
  const [selectedTtsModels, setSelectedTtsModels] = useStoredState('selectedTtsModels', []);
  const [ttsMetaPrompt, setTtsMetaPrompt] = useStoredState('ttsMetaPrompt', 'Convert the following text to audio speaking in double speed:');
  const [asrModels, setAsrModels] = useState([]);
  const [selectedAsrModels, setSelectedAsrModels] = useStoredState('selectedAsrModels', []);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [loadingCount, setLoadingCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [logs, setLogs] = useStoredState('logs', []);

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

  useEffect(() => {
    if (selectedTextId === null && texts.length) setSelectedTextId(0);
  }, [texts]);

  const textModelsList = [
    ...openAiModels.map(m => ({ id: m, provider: 'openai' })),
    ...googleModels.map(m => ({ id: m, provider: 'google' }))
  ];

  useEffect(() => {
    if (textModelsList.length && !selectedTextModels.length) {
      setSelectedTextModels([textModelsList[0].id]);
    }
  }, [textModelsList]);






  const showError = msg => {
    setErrorMsg(msg);
  };

  const addLog = (method, url, body = '', response = '', cost = '') => {
    const short = s => {
      if (!s) return '';
      if (typeof s !== 'string') s = JSON.stringify(s);
      return s.length > 60 ? s.slice(0, 30) + '...' + s.slice(-20) : s;
    };
    setLogs(l => [...l, { time: new Date().toISOString(), method, url, body: short(body), response: short(response), cost }]);
  };

  const fetchWithLoading = async (url, opts) => {
    setLoadingCount(c => c + 1);
    try {
      return await fetch(url, opts);
    } finally {
      setLoadingCount(c => c - 1);
    }
  };

  const blobToDataUrl = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const dataUrlToBlob = dataUrl => {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const mockMode = !apiKeys.openai && !apiKeys.google;

  useEffect(() => {
    if (!apiKeys.openai) return;
    (async () => {
      const url = 'https://api.openai.com/v1/models';
      try {
        const res = await fetchWithLoading(url, { headers: { 'Authorization': `Bearer ${apiKeys.openai}` } });
        const data = await res.json().catch(() => ({}));
        addLog('GET', url, '', data);
        if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch OpenAI models');
        const models = data.data?.map(m => m.id).sort();
        if (models?.length) {
          setOpenAiModels(models);
          if (!models.includes(openAiModel)) setOpenAiModel(models[0]);
        }
        const tts = data.data?.filter(m => m.id.startsWith('tts-') || /audio|speech|multimodal/i.test(m.id)).map(m => ({ id: m.id, name: m.id, cost: '' }));
        if (tts?.length) {
          setTtsModels(t => [...t.filter(x => !x.id.startsWith('tts-') && !tts.some(v => v.id === x.id)), ...tts]);
          if (!selectedTtsModels.length) setSelectedTtsModels([tts[0].id]);
        }
        const asr = data.data?.filter(m => /whisper|speech|audio|transcribe/i.test(m.id)).map(m => ({ id: m.id, name: m.id }));
        if (asr?.length) {
          setAsrModels(a => [...a.filter(x => !asr.some(v => v.id === x.id)), ...asr]);
          if (!selectedAsrModels.length) setSelectedAsrModels([asr[0].id]);
        }
      } catch (e) {
        showError(e.message);
      }
    })();
  }, [apiKeys.openai]);


  useEffect(() => {
    const combined = [
      ...openAiModels.filter(m => /whisper|speech|audio|transcribe/i.test(m)).map(m => ({ id: m, name: m })),
      ...googleModels.filter(m => /speech|audio|transcribe|asr/i.test(m)).map(m => ({ id: m, name: m }))
    ];
    if (combined.length) {
      setAsrModels(combined);
      if (!selectedAsrModels.length) setSelectedAsrModels([combined[0].id]);
    }
  }, [openAiModels, googleModels]);

  useEffect(() => {
    if (!apiKeys.google) return;
    (async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeys.google}`;
      try {
        const res = await fetchWithLoading(url);
        const data = await res.json().catch(() => ({}));
        addLog('GET', 'https://generativelanguage.googleapis.com/v1beta/models', '', data);
        if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch Google models');
        const models = data.models?.map(m => m.name);
        if (models?.length) {
          setGoogleModels(models);
          if (!models.includes(googleModel)) setGoogleModel(models[0]);
          const multi = models.filter(m => /speech|audio|multimodal/i.test(m)).map(m => ({ id: m, name: m, cost: '' }));
          if (multi.length) {
            setTtsModels(t => [...t.filter(x => !multi.some(mm => mm.id === x.id)), ...multi]);
            if (!selectedTtsModels.length) setSelectedTtsModels([multi[0].id]);
          }
          const asr = models.filter(m => /speech|audio|transcribe|asr/i.test(m)).map(m => ({ id: m, name: m }));
          if (asr.length) {
            setAsrModels(a => [...a.filter(x => !asr.some(mm => mm.id === x.id)), ...asr]);
            if (!selectedAsrModels.length) setSelectedAsrModels([asr[0].id]);
          }
        }
      } catch (e) {
        showError(e.message);
      }
    })();
  }, [apiKeys.google]);

  useEffect(() => {
    if (!apiKeys.google) return;
    (async () => {
      const url = `https://texttospeech.googleapis.com/v1/voices?key=${apiKeys.google}`;
      try {
        const res = await fetchWithLoading(url);
        const data = await res.json().catch(() => ({}));
        addLog('GET', 'https://texttospeech.googleapis.com/v1/voices', '', data);
        if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch Google voices');
        const voices = data.voices?.map(v => ({ id: v.name, name: v.name, cost: '' }));
        if (voices?.length) {
          setTtsModels(t => [...t.filter(x => !x.id.startsWith('projects/') && !voices.some(v => v.id === x.id)), ...voices]);
          if (!selectedTtsModels.length) setSelectedTtsModels([voices[0].id]);
        }
      } catch (e) {
        showError(e.message);
      }
    })();
  }, [apiKeys.google]);

  const generateTexts = async () => {
    setStatus('Generating text...');
    const timestamp = new Date().toISOString();
    for (const model of selectedTextModels) {
      if (mockMode) {
        const mock = makeLongMockText(texts.length + 1);
        setTexts(t => [...t, { provider: model, text: mock, prompt: textPrompt, timestamp }]);
        continue;
      }
      if (googleModels.includes(model)) {
        const body = { prompt: { text: textPrompt } };
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateText?key=${apiKeys.google}`;
        const res = await fetchWithLoading(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        addLog('POST', url, body, data);
        if (!res.ok) { showError(data.error?.message || 'Text generation failed'); continue; }
        const text = data.candidates?.[0]?.output?.trim();
        if (text) setTexts(t => [...t, { provider: model, text, prompt: textPrompt, timestamp }]);
      } else {
        const body = { model, messages: [{ role: 'user', content: textPrompt }] };
        const url = 'https://api.openai.com/v1/chat/completions';
        const res = await fetchWithLoading(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKeys.openai}` }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        addLog('POST', url, body, data);
        if (!res.ok) { showError(data.error?.message || 'Text generation failed'); continue; }
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) setTexts(t => [...t, { provider: model, text, prompt: textPrompt, timestamp }]);
      }
    }
    setStatus('');
  };


  const uploadAudio = async (file) => {
    if (!file || selectedTextId === null) return;
    const data = await blobToDataUrl(file);
    const timestamp = new Date().toISOString();
    setAudios([...audios, { index: selectedTextId, provider: 'upload', url: data, data, prompt: ttsPrompt, timestamp }]);
  };

  const startRecording = async () => {
    if (recording || selectedTextId === null) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = async e => {
        const data = await blobToDataUrl(e.data);
        const timestamp = new Date().toISOString();
        setAudios(a => [...a, { index: selectedTextId, provider: 'record', url: data, data, prompt: ttsPrompt, timestamp }]);
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


  const synthesizeTts = async () => {
    const idx = texts.length;
    const timestamp = new Date().toISOString();
    const fullPrompt = `${ttsMetaPrompt} ${ttsPrompt}`;
    setTexts([...texts, { provider: 'tts', text: fullPrompt }]);
    for (const model of selectedTtsModels) {
      const cost = ttsModels.find(m => m.id === model)?.cost || '';
      if (mockMode) {
        addLog('TTS', model, fullPrompt, '<audio>', cost);
        const blob = new Blob([fullPrompt], { type: 'audio/plain' });
        const data = await blobToDataUrl(blob);
        setAudios(a => [...a, { index: idx, provider: model, url: data, data, prompt: fullPrompt, timestamp }]);
      } else if (openAiModels.includes(model)) {
        const url = 'https://api.openai.com/v1/audio/speech';
        const body = { model, input: fullPrompt, voice: 'alloy', response_format: 'mp3' };
        const res = await fetchWithLoading(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKeys.openai}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          addLog('POST', url, body, err, cost);
          showError(err.error?.message || 'TTS request failed');
          continue;
        }
        const blob = await res.blob();
        addLog('POST', url, body, '<audio>', cost);
        const data = await blobToDataUrl(blob);
        setAudios(a => [...a, { index: idx, provider: model, url: data, data, prompt: fullPrompt, timestamp }]);
      } else {
        addLog('TTS', model, fullPrompt, '<audio>', cost);
        const blob = new Blob([`${model}:${fullPrompt}`], { type: 'audio/plain' });
        const data = await blobToDataUrl(blob);
        setAudios(a => [...a, { index: idx, provider: model, url: data, data, prompt: fullPrompt, timestamp }]);
      }
    }
  };

  const transcribe = async (aIndex) => {
    const audio = audios[aIndex];
    if (!audio) return;
    setStatus('Transcribing...');
    const blob = dataUrlToBlob(audio.data || audio.url);
    for (const model of selectedAsrModels) {
      const finish = (text, provider) => {
        setTranscripts(t => [...t, { aIndex, provider, text, prompt: asrPrompt }]);
      };
      if (mockMode) {
        const text = makeMockTranscription(texts[audio.index]?.text || '');
        finish(text, 'mock');
        continue;
      }
      if (openAiModels.includes(model)) {
        const form = new FormData();
        form.append('model', model);
        form.append('file', blob, 'audio.webm');
        if (asrPrompt) form.append('prompt', asrPrompt);
        try {
          const url = 'https://api.openai.com/v1/audio/transcriptions';
          const res = await fetchWithLoading(url, { method: 'POST', headers: { 'Authorization': `Bearer ${apiKeys.openai}` }, body: form });
          const data = await res.json().catch(() => ({}));
          addLog('POST', url, '<audio>', data);
          if (!res.ok) throw new Error(data.error?.message || 'Transcription failed');
          const text = data.text?.trim();
          if (text) finish(text, model);
        } catch (e) {
          showError(e.message);
        }
      } else {
        addLog('ASR', model, '<audio>');
        const text = texts[audio.index]?.text || '';
        finish(text, model);
      }
    }
    setStatus('');
  };

  const deleteAudio = (aIndex) => {
    setAudios(a => a.filter((_, i) => i !== aIndex));
    setTranscripts(t => t.flatMap(tr => {
      if (tr.aIndex === aIndex) return [];
      if (tr.aIndex > aIndex) return [{ ...tr, aIndex: tr.aIndex - 1 }];
      return [tr];
    }));
  };

  const deleteText = (index) => {
    const newAudios = [];
    const map = {};
    audios.forEach((a, i) => {
      if (a.index === index) return;
      const updated = { ...a };
      if (a.index > index) updated.index = a.index - 1;
      map[i] = newAudios.length;
      newAudios.push(updated);
    });
    const newTranscripts = transcripts.flatMap(tr => {
      const origAudio = audios[tr.aIndex];
      if (!origAudio || origAudio.index === index) return [];
      return [{ ...tr, aIndex: map[tr.aIndex] }];
    });
    setAudios(newAudios);
    setTranscripts(newTranscripts);
    setTexts(t => t.filter((_, i) => i !== index));
    if (selectedTextId === index) setSelectedTextId(null);
    else if (selectedTextId > index) setSelectedTextId(selectedTextId - 1);
  };

  const deleteTranscript = (tIndex) => {
    setTranscripts(t => t.filter((_, i) => i !== tIndex));
  };

  const deleteLog = (lIndex) => {
    setLogs(l => l.filter((_, i) => i !== lIndex));
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
    const header = 'index,model,original,transcription,wer\n';
    const lines = rows.map(r => `${r.i},${r.model},"${r.original}","${r.transcription}",${r.wer}`).join('\n');
    const blob = new Blob([header + lines], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMD = () => {
    const header = `|${t('transcriptId')}|${t('originalText')}|${t('transcript')}|${t('wer')}|\n|---|---|---|---|\n`;
    const lines = rows.map(r => `|${r.i}|${r.original}|${r.transcription}|${r.wer}|`).join('\n');
    const blob = new Blob([header + lines], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'results.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const rows = transcripts.map((t, i) => {
    const audio = audios[t.aIndex];
    const txt = texts[audio.index];
    const wer = wordErrorRate(txt.text, t.text);
    const diff = diffWordsHtml(txt.text, t.text);
    return { i: i + 1, model: t.provider, original: txt.text, transcription: t.text, wer, diff };
  });


  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('appTitle')}</Typography>
          <Tabs value={view} onChange={(e, v) => setView(v)} textColor="inherit" indicatorColor="secondary">
            <Tab value="text" label={t('tabText')} />
            <Tab value="audio" label={t('tabAudio')} />
            <Tab value="asr" label={t('tabAsr')} />
            <Tab value="log" label={t('tabLog')} />
            <Tab value="config" label={t('tabSettings')} />
          </Tabs>
          {loadingCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <CircularProgress size={20} color="inherit" />
              {loadingCount > 1 && (
                <Typography variant="caption" sx={{ ml: 0.5 }}>{loadingCount}</Typography>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <div style={{ paddingTop: '64px' }}>
      {view === 'text' && (
        <div style={{ padding: '1rem' }}>
          <Select multiple value={selectedTextModels} onChange={e => setSelectedTextModels(e.target.value)} fullWidth renderValue={s => s.join(', ')}>
            {textModelsList.map(m => (
              <MenuItem key={m.id} value={m.id}>{`${m.id} (${m.provider})`}</MenuItem>
            ))}
          </Select>
          <TextField label={t('promptForModels')} multiline rows={3} value={textPrompt} onChange={e => setTextPrompt(e.target.value)} fullWidth margin="normal" />
          <Button onClick={generateTexts}>{t('genPrompt')}</Button>
          <Typography variant="h6" sx={{ mt: 2 }}>{t('tabText')}</Typography>
          <List>
            {predefinedPrompts.map((p, i) => (
              <ListItem button key={i} onClick={() => setTextPrompt(p)}>
                <ListItemText primary={p} />
              </ListItem>
            ))}
          </List>
          <PersistedGrid
            storageKey="texts"
            rows={texts.map((txt, i) => ({ id: i, ...txt }))}
            columns={[
              { field: 'id', headerName: t('textId'), width: 70, valueGetter: params => params.row.id + 1 },
              { field: 'timestamp', headerName: t('timestamp'), width: 180 },
              { field: 'text', headerName: t('text'), flex: 1 },
              { field: 'provider', headerName: t('source'), width: 120 },
              {
                field: 'actions',
                headerName: t('actions'),
                sortable: false,
                filterable: false,
                width: 150,
                renderCell: params => (
                  <>
                    <Button onClick={() => { setSelectedTextId(params.row.id); setTtsPrompt(params.row.text); setView('audio'); }}>{t('useText')}</Button>
                    <Button onClick={() => deleteText(params.row.id)} color="error" sx={{ ml: 1 }}>{t('delete')}</Button>
                  </>
                )
              }
            ]}
          />
        </div>
      )}
      {view === 'audio' && (
        <div style={{ padding: '1rem' }}>
          <TextField label={t('metaPromptLabel')} multiline rows={3} value={ttsMetaPrompt} onChange={e => setTtsMetaPrompt(e.target.value)} fullWidth margin="normal" />
          <TextField label={t('ttsPromptLabel')} multiline rows={3} value={ttsPrompt} onChange={e => setTtsPrompt(e.target.value)} fullWidth margin="normal" />
          <Select multiple value={selectedTtsModels} onChange={e => setSelectedTtsModels(e.target.value)} fullWidth renderValue={s => s.join(', ')}>
            {ttsModels.map(m => (
              <MenuItem key={m.id} value={m.id}>{`${m.name} (${m.cost})`}</MenuItem>
            ))}
          </Select>
          <Button variant="contained" onClick={synthesizeTts} sx={{ mt: 1 }}>{t('generateAudio')}</Button>
          <Button component="label" sx={{ mt: 1, ml: 1 }}>
            {t('uploadAudio')}
            <input type="file" accept="audio/*" hidden onChange={e => uploadAudio(e.target.files[0])} />
          </Button>
          <Button onClick={recording ? stopRecording : startRecording} sx={{ mt: 1, ml: 1 }}>
            {recording ? t('stopRecording') : t('recordAudio')}
          </Button>
          <PersistedGrid
            storageKey="audios"
            rows={audios.map((a, i) => ({ id: i, ...a, _index: i }))}
            columns={[
              { field: 'timestamp', headerName: t('timestamp'), width: 180 },
              { field: 'index', headerName: t('textId'), width: 80, valueGetter: params => params.row.index + 1 },
              { field: 'provider', headerName: t('source'), width: 120 },
              {
                field: 'audio',
                headerName: t('audio'),
                flex: 1,
                renderCell: params => params.row.url && <audio controls src={params.row.url}></audio>
              },
              {
                field: 'actions',
                headerName: t('actions'),
                sortable: false,
                filterable: false,
                width: 160,
                renderCell: params => (
                  <>
                    <Button onClick={() => transcribe(params.row._index)}>{t('toAsr')}</Button>
                    <Button onClick={() => deleteAudio(params.row._index)} color="error" sx={{ ml: 1 }}>{t('delete')}</Button>
                  </>
                )
              }
            ]}
          />
          {status && <p>{status}</p>}
        </div>
      )}
      {view === 'asr' && (
        <div style={{ padding: '1rem' }}>
          <Typography variant="h6">{t('tabAsr')}</Typography>
          <Select multiple value={selectedAsrModels} onChange={e => setSelectedAsrModels(e.target.value)} fullWidth renderValue={s => s.join(', ')}>
            {asrModels.map(m => (
              <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
            ))}
          </Select>
          <TextField label={t('asrPromptLabel')} multiline rows={3} value={asrPrompt} onChange={e => setAsrPrompt(e.target.value)} fullWidth margin="normal" />
          <Button onClick={exportJSON}>{t('exportJSON')}</Button>
          <Button onClick={exportCSV}>{t('exportCSV')}</Button>
          <Button onClick={exportMD}>{t('exportMD')}</Button>
          <Button onClick={clearData}>{t('clearData')}</Button>
          <PersistedGrid
            storageKey="results"
            rows={sortedRows.map((r, idx) => ({ id: idx, ...r, _index: idx }))}
            columns={[
              { field: 'i', headerName: t('transcriptId'), width: 70 },
              { field: 'model', headerName: t('source'), width: 140 },
              { field: 'original', headerName: t('originalText'), flex: 1 },
              { field: 'transcription', headerName: t('transcript'), flex: 1 },
              { field: 'wer', headerName: t('wer'), width: 90 },
              {
                field: 'diff',
                headerName: t('diff'),
                flex: 1,
                renderCell: params => <span dangerouslySetInnerHTML={{ __html: params.value }} />,
              },
              {
                field: 'actions',
                headerName: t('actions'),
                sortable: false,
                filterable: false,
                width: 120,
                renderCell: params => (
                  <Button onClick={() => deleteTranscript(params.row._index)} color="error">{t('delete')}</Button>
                ),
              },
            ]}
          />
          {status && <p>{status}</p>}
        </div>
      )}
      {view === 'log' && (
        <div style={{ padding: '1rem' }}>
          <Typography variant="h6">{t('tabLog')}</Typography>
          <PersistedGrid
            storageKey="logs"
            rows={logs.map((l, i) => ({ id: i, ...l }))}
            columns={[
              { field: 'time', headerName: t('timestamp'), width: 180 },
              { field: 'method', headerName: t('actions'), width: 100 },
              { field: 'url', headerName: 'Endpoint', flex: 1 },
              { field: 'body', headerName: 'Body', flex: 1 },
              { field: 'response', headerName: 'Response', flex: 1 },
              { field: 'cost', headerName: 'Cost', width: 100 },
              {
                field: 'actions',
                headerName: t('actions'),
                sortable: false,
                filterable: false,
                width: 120,
                renderCell: params => (
                  <Button onClick={() => deleteLog(params.row.id)} color="error">{t('delete')}</Button>
                ),
              }
            ]}
          />
        </div>
      )}
      {view === 'config' && (
        <div style={{ padding: '1rem' }}>
          <Typography variant="h6">{t('tabSettings')}</Typography>
          <TextField
            label={t('openaiKey')}
            type="password"
            value={apiKeys.openai}
            onChange={e => setApiKeys({ ...apiKeys, openai: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label={t('googleKey')}
            type="password"
            value={apiKeys.google}
            onChange={e => setApiKeys({ ...apiKeys, google: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Select value={lang} onChange={e => setLang(e.target.value)} fullWidth sx={{ mt: 1 }}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="et">Eesti</MenuItem>
          </Select>
          {mockMode && <Typography color="error">{t('mockMode')}</Typography>}
        </div>
      )}
      </div>
      <Snackbar open={!!errorMsg} message={errorMsg} onClose={() => setErrorMsg('')} autoHideDuration={6000} />
    </>
  );
}

