import React, { useState, useEffect } from 'react';
import PlaygroundIcon from './PlaygroundIcon';
import { wordErrorRate } from './wordErrorRate';
import { diffWordsHtml } from './diffWords';
import { transcriptsToRows } from './resultUtils';
import {
  Button,
  IconButton,
  Tooltip,
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
  CircularProgress,
  Box,
  Divider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';
import { rowsToJSON, rowsToCSV, rowsToMarkdown, download } from './exportUtils';

function useStoredState(key, initial) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('storageError', { detail: { key, error: e } }));
    }
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
      getRowHeight={() => 'auto'}
      disableRowSelectionOnClick
      sx={{ '& .MuiDataGrid-cell': { whiteSpace: 'normal', overflowWrap: 'anywhere' } }}
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

function renderCell(params) {
  const val = params.value == null ? '' : String(params.value);
  return (
    <Tooltip title={val} placement="top">
      <span style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{val}</span>
    </Tooltip>
  );
}

function renderHtmlCell(params) {
  const text = (params.value || '').replace(/<[^>]+>/g, '');
  return (
    <Tooltip title={text} placement="top">
      <span style={{ whiteSpace: 'normal', wordWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: params.value }} />
    </Tooltip>
  );
}

function ExportButtons({ rows, columns, name, t, children }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Button onClick={() => download(rowsToJSON(rows, columns), 'application/json', `${name}.json`)}>{t('exportJSON')}</Button>
      <Button onClick={() => download(rowsToCSV(rows, columns), 'text/csv', `${name}.csv`)} sx={{ ml: 1 }}>{t('exportCSV')}</Button>
      <Button onClick={() => download(rowsToMarkdown(rows, columns), 'text/markdown', `${name}.md`)} sx={{ ml: 1 }}>{t('exportMD')}</Button>
      {children}
    </Box>
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
    demoPromptLabel: 'Demo prompts',
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
    sheetUrl: 'Google Sheet URL',
    publish: 'Publish',
    language: 'Language',
    mockMode: 'Mock mode active: no API key',
    close: 'Close',
    storageFailed: 'Not stored'
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
    demoPromptLabel: 'Demopromptid',
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
    sheetUrl: 'Google Sheeti URL',
    publish: 'Avalda',
    language: 'Keel',
    mockMode: 'Moki re\u017eiim: API v\u00f5ti puudub',
    close: 'Sulge',
    storageFailed: 'Salvestus eba\u00f5nnestus'
  }
};

function useTranslation() {
  const [lang, setLang] = useStoredState('lang', 'en');
  const t = key => translations[lang][key] || key;
  return { t, lang, setLang };
}

export default function App() {
  const [apiKeys, setApiKeys] = useStoredState('apiKeys', { openai: '', google: '' });
  const [sheetUrl, setSheetUrl] = useStoredState('sheetUrl', '');
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
  const [demoPrompt, setDemoPrompt] = useState('');

  const [view, setView] = useState('audio');
  const [ttsModels, setTtsModels] = useState([]);
  const [selectedTtsModels, setSelectedTtsModels] = useStoredState('selectedTtsModels', []);
  const [ttsMetaPrompt, setTtsMetaPrompt] = useStoredState('ttsMetaPrompt', 'Convert the following text to audio speaking in double speed:');
  const [asrModels, setAsrModels] = useState([]);
  const [selectedAsrModels, setSelectedAsrModels] = useStoredState('selectedAsrModels', []);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [loadingCount, setLoadingCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [logs, setLogs] = useStoredState('logs', []);

  const predefinedPrompts = [
    'write an Estonian haiku in the style of Jaan Pehk',
    'write an Estonian sport report, something like "Eesti esireket Mark Lajal (ATP 167.) teenis Wimbledoni sl\u00e4mmiturniiri kvalifikatsiooni avaringis 3:6, 6:4, 6:3 v\u00f5idu Suurbritanniat esindava Jan Choinski (ATP 202.) \u00fcle."',
    'make a list of all Estonian prime ministers in the order they took office. Just names separated by commas',
    'tee nimekiri k\u00f5ikidest Elva linnapeadest, kelle ees- v\u00f5i perekonna nimi algab v\u00f5i l\u00f5peb "a" t\u00e4hega. Esita tulemused Markdown tabelina',
    'genereeri lustakas vestlus Riigikogu kohvikus, kus osalised r\u00e4\u00e4givad \u00fcksteisele vahele ja \u00fcksteisest \u00fcle (eralda need k\u00f5nekatked "..." m\u00e4rgiga).',
    'r\u00e4pi midagi Kaarel Kose stiilis',
    'loetle Eesti p\u00e4risnimesid, mis ainsuse nimetavas on kolmandas v\u00e4ltes, aga esita need mitmuse kaasa\u00fctlevas'
  ];

  useEffect(() => {
    const handler = e => {
      const { key, error } = e.detail || {};
      showError(`Failed to store ${key}: ${error.message}`);
      if (key === 'audios') {
        setAudios(a => {
          if (!a.length || a[a.length - 1].storageError) return a;
          const copy = [...a];
          copy[copy.length - 1] = { ...copy[copy.length - 1], storageError: true };
          return copy;
        });
      }
    };
    window.addEventListener('storageError', handler);
    return () => window.removeEventListener('storageError', handler);
  }, []);

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
    setErrors(errs => [...errs, msg]);
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
        setTranscripts(t => [...t, { aIndex, provider, text, prompt: asrPrompt, timestamp: new Date().toISOString() }]);
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

  const publishTranscript = async (tIndex) => {
    const tr = transcripts[tIndex];
    if (!tr) return;
    if (!sheetUrl || !apiKeys.google) {
      showError('Missing Google Sheet URL or API key');
      return;
    }
    const idMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch) {
      showError('Invalid Google Sheet URL');
      return;
    }
    const sheetId = idMatch[1];
    const audio = audios[tr.aIndex];
    const txt = audio ? texts[audio.index] : null;
    const row = [
      tr.timestamp || audio?.timestamp || new Date().toISOString(),
      tr.provider,
      audio?.provider || '',
      txt?.provider || '',
      txt?.text || '',
      tr.text,
      txt ? wordErrorRate(txt.text, tr.text) : 1
    ];
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:append?valueInputOption=USER_ENTERED&key=${apiKeys.google}`;
    const body = { values: [row] };
    try {
      const res = await fetchWithLoading(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      addLog('POST', url, row, data);
      if (!res.ok) throw new Error(data.error?.message || 'Publish failed');
    } catch (e) {
      showError(e.message);
    }
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

  const rows = transcriptsToRows(transcripts, audios, texts);

  const textRows = texts.map((txt, i) => ({ id: i, ...txt })).filter(r => r.provider !== 'tts');
  const textColumns = [
    { field: 'id', headerName: t('textId'), width: 70, valueGetter: p => (p.row && p.row.id != null ? p.row.id + 1 : '') , renderCell },
    { field: 'timestamp', headerName: t('timestamp'), width: 180, renderCell },
    { field: 'text', headerName: t('text'), flex: 1, renderCell },
    { field: 'provider', headerName: t('source'), width: 120, renderCell },
    {
      field: 'actions', headerName: t('actions'), sortable: false, filterable: false, width: 150,
      renderCell: params => (
        <>
          <Tooltip title={t('useText')}>
            <IconButton onClick={() => { setSelectedTextId(params.row.id); setTtsPrompt(params.row.text); setView('audio'); }} size="small">
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton onClick={() => deleteText(params.row.id)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  const audioRows = audios.map((a, i) => ({ id: i, ...a, _index: i }));
  const audioColumns = [
    { field: 'timestamp', headerName: t('timestamp'), width: 180, renderCell },
    { field: 'index', headerName: t('textId'), width: 80, valueGetter: p => (p.row && p.row.index != null ? p.row.index + 1 : ''), renderCell },
    { field: 'provider', headerName: t('source'), width: 120, renderCell },
    { field: 'audio', headerName: t('audio'), flex: 1, renderCell: p => (
      <div>
        {p.row.url && <audio controls src={p.row.url}></audio>}
        {p.row.storageError && <div style={{color:'red'}}>{t('storageFailed')}</div>}
      </div>
    ) },
    {
      field: 'actions', headerName: t('actions'), sortable: false, filterable: false, width: 160,
      renderCell: params => (
        <>
          <Tooltip title={t('toAsr')}>
            <IconButton onClick={() => transcribe(params.row._index)} size="small">
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton onClick={() => deleteAudio(params.row._index)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  const resultRows = rows.map((r, idx) => ({ id: idx, ...r, _index: idx }));
  const resultColumns = [
    { field: 'i', headerName: t('transcriptId'), width: 70, renderCell },
    { field: 'model', headerName: t('source'), width: 140, renderCell },
    { field: 'original', headerName: t('originalText'), flex: 1, renderCell },
    { field: 'transcription', headerName: t('transcript'), flex: 1, renderCell },
    { field: 'wer', headerName: t('wer'), width: 90, renderCell },
    { field: 'diff', headerName: t('diff'), flex: 1, renderCell: renderHtmlCell },
    {
      field: 'actions', headerName: t('actions'), sortable: false, filterable: false, width: 150,
      renderCell: params => (
        <>
          <Tooltip title={t('publish')}>
            <IconButton onClick={() => publishTranscript(params.row._index)} size="small">
              <CloudUploadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton onClick={() => deleteTranscript(params.row._index)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  const logRows = logs.map((l, i) => ({ id: i, ...l }));
  const logColumns = [
    { field: 'time', headerName: t('timestamp'), width: 180, renderCell },
    { field: 'method', headerName: t('actions'), width: 100, renderCell },
    { field: 'url', headerName: 'Endpoint', flex: 1, renderCell },
    { field: 'body', headerName: 'Body', flex: 1, renderCell },
    { field: 'response', headerName: 'Response', flex: 1, renderCell },
    { field: 'cost', headerName: 'Cost', width: 100, renderCell },
    {
      field: 'actions', headerName: t('actions'), sortable: false, filterable: false, width: 120,
      renderCell: params => (
        <Tooltip title={t('delete')}>
          <IconButton onClick={() => deleteLog(params.row.id)} size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];


  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <PlaygroundIcon sx={{ mr: 1 }} />
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
          <Select
            value={demoPrompt}
            onChange={e => { setDemoPrompt(e.target.value); setTextPrompt(e.target.value); }}
            fullWidth
            displayEmpty
            sx={{ mt: 1 }}
          >
            <MenuItem value="" disabled>{t('demoPromptLabel')}</MenuItem>
            {predefinedPrompts.map((p, i) => (
              <MenuItem key={i} value={p}>{p}</MenuItem>
            ))}
          </Select>
          <TextField label={t('promptForModels')} multiline rows={3} value={textPrompt} onChange={e => setTextPrompt(e.target.value)} fullWidth margin="normal" />
          <Button onClick={generateTexts}>{t('genPrompt')}</Button>
          <Typography variant="h6" sx={{ mt: 2 }}>{t('tabText')}</Typography>
          <Divider sx={{ my: 2 }} />
          <ExportButtons rows={textRows} columns={textColumns} name="texts" t={t} />
          <PersistedGrid
            storageKey="texts"
            rows={textRows}
            columns={textColumns}
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
          <Divider sx={{ my: 2 }} />
          <ExportButtons rows={audioRows} columns={audioColumns} name="audios" t={t} />
          <PersistedGrid
            storageKey="audios"
            rows={audioRows}
            columns={audioColumns}
          />
          {status && <p>{status}</p>}
        </div>
      )}
      {view === 'asr' && (
        <div style={{ padding: '1rem' }}>
          <Select multiple value={selectedAsrModels} onChange={e => setSelectedAsrModels(e.target.value)} fullWidth renderValue={s => s.join(', ')}>
            {asrModels.map(m => (
              <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
            ))}
          </Select>
          <TextField label={t('asrPromptLabel')} multiline rows={3} value={asrPrompt} onChange={e => setAsrPrompt(e.target.value)} fullWidth margin="normal" />
          <Divider sx={{ my: 2 }} />
          <ExportButtons rows={resultRows} columns={resultColumns} name="results" t={t}>
            <Button onClick={clearData} sx={{ ml: 1 }}>{t('clearData')}</Button>
          </ExportButtons>
          <PersistedGrid
            storageKey="results"
            rows={resultRows}
            columns={resultColumns}
          />
          {status && <p>{status}</p>}
        </div>
      )}
      {view === 'log' && (
        <div style={{ padding: '1rem' }}>
          <Divider sx={{ my: 2 }} />
          <ExportButtons rows={logRows} columns={logColumns} name="logs" t={t} />
          <PersistedGrid
            storageKey="logs"
            rows={logRows}
            columns={logColumns}
          />
        </div>
      )}
      {view === 'config' && (
        <div style={{ padding: '1rem' }}>
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
          <TextField
            label={t('sheetUrl')}
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
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
      {errors.length > 0 && (
        <div className="error-bar">
          <span>{errors.join(' | ')}</span>
          <IconButton size="small" onClick={() => setErrors([])} sx={{color:'inherit'}}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      )}
    </>
  );
}

