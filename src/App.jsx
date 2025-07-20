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
  Switch,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Link,
  FormGroup,
  Menu,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TableChartIcon from '@mui/icons-material/TableChart';
import SettingsIcon from '@mui/icons-material/Settings';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import { rowsToJSON, rowsToCSV, rowsToTSV, rowsToYAML, rowsToMarkdown, download } from './exportUtils';
import { expandRefs } from './referenceUtils';
import { marked } from 'marked';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DotSpinner from './DotSpinner';
import {
  fetchOpenRouterModels,
  fetchOpenAiModels,
  fetchGoogleModels,
  fetchGoogleVoices,
  openRouterChat,
  openAiChat,
  googleGenerateText,
  openRouterTts,
  openAiTts,
  openRouterTranscribe,
  openAiTranscribe,
  mistralTranscribe
} from './providers';

import useStoredState from "./useStoredState";
function PaperComponent(props) {
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'} handle="#draggable-dialog-title">
      <Paper {...props} />
    </Draggable>
  );
}


function PersistedGrid({ storageKey, t, initialCols = {}, initialSort = [], ...props }) {
  const [sortModel, setSortModel] = useStoredState(storageKey + 'Sort', initialSort);
  const [filterModel, setFilterModel] = useStoredState(storageKey + 'Filter', { items: [] });
  const [cols, setCols] = useStoredState(storageKey + 'Cols', initialCols);
  const [previewRow, setPreviewRow] = useState(null);
  const open = Boolean(previewRow);
  const renderValue = val => {
    if (val == null) return '';
    if (typeof val === 'object') {
      return `<pre>${marked.parse('```json\n' + JSON.stringify(val, null, 2) + '\n```')}</pre>`;
    }
    const s = String(val);
    if (s.trim().startsWith('{')) {
      try {
        return `<pre>${marked.parse('```json\n' + JSON.stringify(JSON.parse(s), null, 2) + '\n```')}</pre>`;
      } catch {}
    }
    if (s.trim().startsWith('<') && s.includes('</')) return s;
    return marked.parse(s);
  };
  const exclude = ['id','i','index','timestamp','time','provider','textSource','audioSource','asrSource','model','modelId','name'];
  const tabKey = {
    texts: 'tab_text',
    audios: 'tab_audio',
    results: 'tab_asr',
    models: 'tab_models',
    logs: 'tab_log'
  }[storageKey] || storageKey;
  const renderFields = row =>
    props.columns
      .filter(c => c.field !== 'actions' && !exclude.includes(c.field) && row[c.field] != null)
      .map(c => {
        const raw = row[c.field];
        const html = renderValue(raw);
        const id = row.id != null ? row.id + 1 : (row.i ?? row.index ?? '');
        const ref = id !== '' ? `{{${tabKey}.table.${id}.${c.field}}}` : '';
        return (
          <Box key={c.field} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              {c.headerName || c.field}
              {ref && (
                <Tooltip title={ref} placement="top">
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(ref)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small" onClick={() => navigator.clipboard.writeText(typeof raw === 'object' ? JSON.stringify(raw, null, 2) : String(raw))}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Typography>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </Box>
        );
      });
  const html = React.useMemo(() => {
    if (!previewRow) return '';
    const val =
      previewRow.diff ||
      previewRow.transcription ||
      previewRow.text ||
      previewRow.original ||
      previewRow.body ||
      previewRow.response || '';
    if (typeof val === 'string' && val.trim().startsWith('{')) {
      try {
        const obj = JSON.parse(val);
        return `<pre>${marked.parse('```json\n' + JSON.stringify(obj, null, 2) + '\n```')}</pre>`;
      } catch {
        return marked.parse(val);
      }
    }
    if (typeof val === 'string' && val.startsWith('<') && val.includes('</')) {
      return val;
    }
    return marked.parse(String(val));
  }, [previewRow]);
  const handleCellClick = (params, event) => {
    if (params.field === 'actions') return;
    if (event.target.closest('input[type="checkbox"]')) return;
    setPreviewRow(params.row);
  };
  return (
    <>
      <DataGrid
        autoHeight
        getRowHeight={() => 'auto'}
        disableRowSelectionOnClick
        getRowClassName={params => params.row.pending ? 'pending-row' : ''}
        sx={{ '& .MuiDataGrid-cell': {
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 3,
          overflow: 'hidden'
        } }}
        sortingOrder={['asc', 'desc']}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        columnVisibilityModel={cols}
        onColumnVisibilityModelChange={setCols}
        onCellClick={handleCellClick}
        {...props}
      />
      <Dialog open={open} onClose={() => setPreviewRow(null)} PaperComponent={PaperComponent} fullWidth maxWidth="sm">
        {previewRow && (
          <>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              {(() => {
                const parts = [];
                const id = previewRow.id ?? previewRow.i ?? previewRow.index;
                if (id != null) parts.push('#' + id);
                if (previewRow.timestamp || previewRow.time) parts.push(previewRow.timestamp || previewRow.time);
                if (previewRow.model || previewRow.name || previewRow.modelId) parts.push(previewRow.model || previewRow.name || previewRow.modelId);
                const provider = previewRow.provider || previewRow.asrSource || previewRow.audioSource || previewRow.textSource;
                if (provider) parts.push(provider);
                return parts.join(' ');
              })()}
              <IconButton size="small" onClick={() => setPreviewRow(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {previewRow.url && (['audios','results'].includes(storageKey)) && (
                <audio controls src={previewRow.url} style={{ width: '100%', marginBottom: '1em' }} />
              )}
              {renderFields(previewRow)}
            </DialogContent>
            {props.columns.some(c => c.field === 'actions') && (
              <DialogActions sx={{ justifyContent: 'flex-start' }}>
                {props.columns.find(c => c.field === 'actions').renderCell({ row: previewRow })}
              </DialogActions>
            )}
          </>
        )}
      </Dialog>
    </>
  );
}

function renderCell(params, tab, pending = false) {
  let val = params.value == null ? '' : params.value;
  if (params.field === 'pricing' && val !== '') {
    val = Number(val).toFixed(2);
  } else {
    val = String(val);
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
    val = val.replace('T', ' ').slice(0, 19);
  }
  if (/^\s*\{.*\}\s*$/.test(val)) {
    try { val = JSON.stringify(JSON.parse(val)); } catch {}
  }
  const style = {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };
  if (['timestamp', 'time', 'provider', 'textSource', 'audioSource', 'asrSource', 'wer'].includes(params.field)) {
    style.fontFamily = 'monospace';
  }
  const id = params.row.id != null ? params.row.id + 1 : (params.row.i ?? params.row.index ?? '');
  const ref = tab && id !== '' ? `{{${tab}.table.${id}.${params.field}}}` : '';
  const title = ref ? `${val} ${ref}` : val;
  return (
    <Tooltip title={title} placement="top">
      <span style={style} className={pending ? 'pending-cell' : ''}>{val}</span>
    </Tooltip>
  );
}

function renderHtmlCell(params, tab, pending = false) {
  const text = (params.value || '').replace(/<[^>]+>/g, '');
  const id = params.row.id != null ? params.row.id + 1 : (params.row.i ?? params.row.index ?? '');
  const ref = tab && id !== '' ? `{{${tab}.table.${id}.${params.field}}}` : '';
  const title = ref ? `${text} ${ref}` : text;
  return (
    <Tooltip title={title} placement="top">
      <span
        className={pending ? 'pending-cell' : ''}
        style={{
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
        dangerouslySetInnerHTML={{ __html: params.value }}
      />
    </Tooltip>
  );
}

function renderProgressCell(params, tab) {
  const pending = params.row.pending && (params.value === undefined || params.value === '');
  if (pending) {
    return renderCell(params, tab, true);
  }
  if (params.row.error) {
    return <span style={{color:'red'}}>{params.row.error}</span>;
  }
  return renderCell(params, tab);
}

function renderHtmlProgressCell(params, tab) {
  const pending = params.row.pending && !params.value;
  if (pending) {
    return renderHtmlCell(params, tab, true);
  }
  if (params.row.error) {
    return <span style={{color:'red'}}>{params.row.error}</span>;
  }
  return renderHtmlCell(params, tab);
}

function ExportButtons({ rows, columns, name, t, children }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <Box sx={{ mb: 1 }}>
      <Button size="small" onClick={e => setAnchor(e.currentTarget)}>
        {t('exportAs')}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem
          onClick={() => {
            download(rowsToJSON(rows, columns), 'application/json', `${name}.json`);
            setAnchor(null);
          }}
        >
          {t('exportJSON')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            download(rowsToYAML(rows, columns), 'text/yaml', `${name}.yaml`);
            setAnchor(null);
          }}
        >
          {t('exportYAML')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            download(rowsToCSV(rows, columns), 'text/csv', `${name}.csv`);
            setAnchor(null);
          }}
        >
          {t('exportCSV')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            download(rowsToTSV(rows, columns), 'text/tab-separated-values', `${name}.tsv`);
            setAnchor(null);
          }}
        >
          {t('exportTSV')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            download(rowsToMarkdown(rows, columns), 'text/markdown', `${name}.md`);
            setAnchor(null);
          }}
        >
          {t('exportMD')}
        </MenuItem>
      </Menu>
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
    tabModels: 'Models',
    generate: 'Generate',
    genPrompt: 'Generate Text',
    promptForModels: 'Prompt for text generator',
    examplePromptLabel: 'Example prompt',
    exampleInstrLabel: 'Example prompt',
    uploadPrompt: 'Upload Prompt',
    useText: 'Use for Audio',
    textId: 'ID',
    timestamp: 'Time',
    text: 'Text',
    source: 'Source',
    ttsPromptLabel: 'Text',
    generateAudio: 'Generate Audio',
    metaPromptLabel: 'Instructions',
    uploadAudio: 'Upload Audio',
    recordAudio: 'Record Audio',
    stopRecording: 'Stop Recording',
    audioId: 'ID',
    audio: 'Audio',
    actions: 'Actions',
    toAsr: 'To ASR',
    generateTranscript: 'Generate Transcript',
    asrPromptLabel: 'ASR Prompt',
    transcriptId: 'ID',
    originalText: 'Original Text',
    transcript: 'Transcript',
    wer: 'WER',
    diff: 'Diff',
    textSource: 'Text source',
    audioSource: 'Audio source',
    asrSource: 'ASR source',
    delete: 'Delete',
    exportAs: 'Export table as\u2026',
    exportJSON: 'JSON',
    exportYAML: 'YAML',
    exportMD: 'Markdown',
    exportCSV: 'CSV',
    exportTSV: 'TSV',
    clearData: 'Clear Data',
    clearKeys: 'Clear Keys',
    resetUi: 'Reset UI state',
    keysGroup: 'Keys',
    uiGroup: 'UI',
    storageGroup: 'Storage',
    openaiKey: 'OpenAI API key',
    googleKey: 'Google API key',
    openrouterKey: 'OpenRouter API key',
    mistralKey: 'Mistral API key',
    openaiKeyUrl: 'https://platform.openai.com/api-keys',
    googleKeyUrl: 'https://console.cloud.google.com/apis/credentials',
    openrouterKeyUrl: 'https://openrouter.ai/keys',
    mistralKeyUrl: 'https://console.mistral.ai/api-keys',
    language: 'Language',
    darkMode: 'Dark mode',
    preview: 'Preview',
    showSelected: 'Show selected only',
    selectedModels: 'Models',
    storageFailed: 'Not stored',
    priceModel: 'Model',
    pricePerM: 'USD per 1M tokens',
    modelId: 'ID',
    modelName: 'Name',
    modelDesc: 'Description',
    modality: 'Modality',
    pricing: 'Pricing',
    duration: 'Duration',
    logSize: 'Log rows',
    storageUsage: 'Storage used'
  },
  et: {
    appTitle: 'K\u00f5ne m\u00e4nguplats',
    tabText: 'Tekst',
    tabAudio: 'Heli',
    tabAsr: 'ASR',
    tabLog: 'Logi',
    tabSettings: 'Seaded',
    tabModels: 'Mudelid',
    generate: 'Genereeri',
    genPrompt: 'Genereeri tekst',
    promptForModels: 'P\u00e4ringu sisu',
    examplePromptLabel: 'Näidis prompt',
    exampleInstrLabel: 'Näidis prompt',
    uploadPrompt: 'Laadi tekst',
    useText: 'Saada helisse',
    textId: 'ID',
    timestamp: 'Aeg',
    text: 'Tekst',
    source: 'Allikas',
    ttsPromptLabel: 'Tekst',
    generateAudio: 'Genereeri heli',
    metaPromptLabel: 'Juhised',
    uploadAudio: 'Laadi heli',
    recordAudio: 'Salvesta heli',
    stopRecording: 'Peata salvestus',
    audioId: 'ID',
    audio: 'Heli',
    actions: 'Tegevused',
    toAsr: 'Saada ASR-i',
    generateTranscript: 'Genereeri transkript',
    asrPromptLabel: 'ASR-prompt',
    transcriptId: 'ID',
    originalText: 'Algtekst',
    transcript: 'Transkript',
    wer: 'Viga%',
    diff: 'Erinevus',
    textSource: 'Teksti allikas',
    audioSource: 'Heli allikas',
    asrSource: 'ASR allikas',
    delete: 'Kustuta',
    exportAs: 'Ekspordi tabel…',
    exportJSON: 'JSON',
    exportYAML: 'YAML',
    exportMD: 'Markdown',
    exportCSV: 'CSV',
    exportTSV: 'TSV',
    clearData: 'Puhasta andmed',
    clearKeys: 'Puhasta võtmid',
    resetUi: 'Taasta liidese olek',
    keysGroup: 'Võtmed',
    uiGroup: 'Kasutajaliides',
    storageGroup: 'Salvestus',
    openaiKey: 'OpenAI API v\u00f5ti',
    googleKey: 'Google API v\u00f5ti',
    openrouterKey: 'OpenRouter API v\u00f5ti',
    mistralKey: 'Mistral API v\u00f5ti',
    openaiKeyUrl: 'https://platform.openai.com/api-keys',
    googleKeyUrl: 'https://console.cloud.google.com/apis/credentials',
    openrouterKeyUrl: 'https://openrouter.ai/keys',
    mistralKeyUrl: 'https://console.mistral.ai/api-keys',
    language: 'Keel',
    darkMode: 'Tume re\u017eiim',
    preview: 'Eelvaade',
    showSelected: 'Ainult valitud',
    selectedModels: 'Mudelid',
    storageFailed: 'Salvestus eba\u00f5nnestus',
    priceModel: 'Mudel',
    pricePerM: 'USD 1M tokeni kohta',
    modelId: 'ID',
    modelName: 'Nimi',
    modelDesc: 'Kirjeldus',
    modality: 'Modaliteet',
    pricing: 'Hind',
    duration: 'Kestus',
    logSize: 'Logi ridade arv',
    storageUsage: 'Kasutatud salvestus'
  },
  vro: {
    appTitle: 'K\u00f5n\u00f5 m\u00e4nguplats',
    tabText: 'Tekst',
    tabAudio: 'H\u00e4\u00e4l',
    tabAsr: 'ASR',
    tabLog: 'Logi',
    tabSettings: 'S\u00f6tmis',
    tabModels: 'Mudelid',
    generate: 'Genereeri',
    genPrompt: 'Genereeri tekst',
    promptForModels: 'P\u00e4ringu sisu',
    examplePromptLabel: 'Näütüs prompt',
    exampleInstrLabel: 'Näütüs prompt',
    uploadPrompt: 'Laadi tekst',
    useText: 'Saada h\u00e4\u00e4le',
    textId: 'ID',
    timestamp: 'Aig',
    text: 'Tekst',
    source: 'Allikas',
    ttsPromptLabel: 'Tekst',
    generateAudio: 'Genereeri h\u00e4\u00e4l',
    metaPromptLabel: 'Juhised',
    uploadAudio: 'Laadi h\u00e4\u00e4l',
    recordAudio: 'Salvesta h\u00e4\u00e4l',
    stopRecording: 'Peata salvestus',
    audioId: 'ID',
    audio: 'H\u00e4\u00e4l',
    actions: 'Tegemised',
    toAsr: 'Saada ASR-i',
    generateTranscript: 'Genereeri transkript',
    asrPromptLabel: 'ASR-prompt',
    transcriptId: 'ID',
    originalText: 'Algtekst',
    transcript: 'Transkript',
    wer: 'Viga%',
    diff: 'Erinevus',
    textSource: 'Teksti allikas',
    audioSource: 'H\u00e4\u00e4le allikas',
    asrSource: 'ASR allikas',
    delete: 'Kustuta',
    exportAs: 'Ekspordi tabel…',
    exportJSON: 'JSON',
    exportYAML: 'YAML',
    exportMD: 'Markdown',
    exportCSV: 'CSV',
    exportTSV: 'TSV',
    clearData: 'Puhasta andmed',
    clearKeys: 'Puhasta võtmid',
    resetUi: 'Taasta liidese olõk',
    openaiKey: 'OpenAI API v\u00f5ti',
    googleKey: 'Google API v\u00f5ti',
    openrouterKey: 'OpenRouter API v\u00f5ti',
    mistralKey: 'Mistral API v\u00f5ti',
    openaiKeyUrl: 'https://platform.openai.com/api-keys',
    googleKeyUrl: 'https://console.cloud.google.com/apis/credentials',
    openrouterKeyUrl: 'https://openrouter.ai/keys',
    mistralKeyUrl: 'https://console.mistral.ai/api-keys',
    language: 'Kiil',
    darkMode: 'Tummas re\u017eiim',
    preview: 'Eelvaot\u00f5',
    showSelected: 'Ainult valitud',
    selectedModels: 'Mudelid',
    storageGroup: 'Salvestus',
    storageFailed: 'Salvestus epa\u00f5nnestus',
    priceModel: 'Mudel',
    pricePerM: 'USD 1M tokeni p\u00e4\u00e4le',
    modelId: 'ID',
    modelName: 'Nimi',
    modelDesc: 'Kirjeldus',
    modality: 'Modaliteet',
    pricing: 'Hind',
    duration: 'Kestus',
    logSize: 'Logi ridadõ arv',
    storageUsage: 'Kasutatu salvestus'
  }
};

function useTranslation() {
  const [lang, setLang] = useStoredState('lang', 'en');
  const t = key => translations[lang][key] || key;
  return { t, lang, setLang };
}

export default function App({ darkMode, setDarkMode }) {
  const [apiKeys, setApiKeys] = useStoredState('apiKeys', { openai: '', google: '', openrouter: '', mistral: '' });
  const { t, lang, setLang } = useTranslation();
  const [texts, setTexts] = useStoredState('texts', []);
  const [audios, setAudios] = useStoredState('audios', []);
  const [transcripts, setTranscripts] = useStoredState('transcripts', []);
  const [newText, setNewText] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useStoredState('provider', 'openai');
  const [openAiModels, setOpenAiModels] = useState([]);
  const [googleModels, setGoogleModels] = useState([]);
  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [openRouterMap, setOpenRouterMap] = useState({});
  const [openAiModel, setOpenAiModel] = useStoredState('openAiModel', 'gpt-3.5-turbo');
  const [googleModel, setGoogleModel] = useStoredState('googleModel', '');
  const [textPrompt, setTextPrompt] = useStoredState('textPrompt', 'Generate a realistic Estonian weather report');
  const [selectedTextModels, setSelectedTextModels] = useStoredState('selectedTextModels', []);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [selectedAudioId, setSelectedAudioId] = useState(null);
  const [ttsPrompt, setTtsPrompt] = useStoredState('ttsPrompt', 'Use an Estonian female voice');
  const [asrPrompt, setAsrPrompt] = useStoredState('asrPrompt', 'Transcribe the speech to Estonian text with punctuation');
  const [promptAnchor, setPromptAnchor] = useState(null);
  const [instrAnchor, setInstrAnchor] = useState(null);
  const [asrPromptAnchor, setAsrPromptAnchor] = useState(null);

  const [view, setView] = useState('audio');
  const [ttsModels, setTtsModels] = useState([
    { id: 'gpt-4o-mini-tts', name: 'gpt-4o-mini-tts', cost: '', provider: 'openai' }
  ]);
  const [selectedTtsModels, setSelectedTtsModels] = useStoredState('selectedTtsModels', []);
  const [ttsMetaPrompt, setTtsMetaPrompt] = useStoredState('ttsMetaPrompt', 'Convert the following text to audio speaking in double speed:');
  const [asrModels, setAsrModels] = useState([]);
  const mistralModels = ['voxtral-mini-2507', 'voxtral-small-2507'];
  const [selectedAsrModels, setSelectedAsrModels] = useStoredState('selectedAsrModels', []);
  const [showSelectedOnly, setShowSelectedOnly] = useStoredState('modelsShowSelected', false);
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [loadingCount, setLoadingCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [logs, setLogs] = useStoredState('logs', []);
  const [logSize, setLogSize] = useStoredState('logSize', 100);
  const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0 });

  const predefinedPrompts = [
    'Generate 10 tongue twisters, each on a new line.',
    'Display the main content of <https://pohiseadus.ee/sisu/3554>.',
    'Write an Estonian haiku in the style of Jaan Pehk.',
    'Write an Estonian sports report, for example: "Eesti esireket Mark Lajal (ATP 167.) teenis Wimbledoni sl\u00e4mmiturniiri kvalifikatsiooni avaringis 3:6, 6:4, 6:3 v\u00f5idu Suurbritanniat esindava Jan Choinski (ATP 202.) \u00fcle."',
    'List all Estonian prime ministers in the order they took office. Only provide the names, separated by commas.',
    'Tee nimekiri k\u00f5ikidest Elva linnapeadest, kelle ees- v\u00f5i perekonnanimi algab v\u00f5i l\u00f5peb t\u00e4hega "a". Esita tulemused Markdown-tabelina.',
    'Genereeri lustakas vestlus Riigikogu kohvikus, kus osalised r\u00e4\u00e4givad \u00fcksteisele vahele ja \u00fcksteisest \u00fcle (eralda need k\u00f5nekatked "..." m\u00e4rgiga).',
    'R\u00e4pi midagi Kaarel Kose stiilis.',
    'Loetle Eesti p\u00e4risnimesid, mis ainsuse nimetavas on kolmandas v\u00e4ltes, aga esita need mitmuse kaasa\u00fctlevas.',
    'Genereeri dialoog kahe teismelise vahel. Esimene on 80ndate nolk, kelle jutt on t\u00e4is venekeelseid roppusi. Teine on 2000ndate idufirma asutaja, kes miksib jutu sisse ingliskeelseid s\u00f5nu ("pivot", "pitch"), mille eestikeelset t\u00f5lget ta ei tea.'
  ];

  const predefinedInstructions = [
    'Expand all abbreviations before speaking. For example, "25 km/h-ni" should be read as "kahek\u00fcmne viie kilomeetrini tunnis" to improve clarity.',
    'Read the following text very quickly, in the style of an energetic sports commentator (like Gunnar Hololei).',
    'Read the following text with a Finnish accent, for example by mispronouncing palatalization and vowel lengths ("v\u00e4lted").',
    'Assume the following text may contain "voice tags" such as "[whispers]".'
  ];

  const predefinedAsrPrompts = [
    'Provide a verbatim transcription, e.g. always write numbers as words ("one", "two point five", ...), never abbreviate.',
    'Assume the following audio was generated by TTS.',
    'Assume the following audio was spoken by a non-native speaker.',
    'The transcription of the following audio is {tab-asr.input-text}. Do not use this text during transcription, but when writing out the final transcription, only include the words that were misrecognized.'
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
    setLogs(l => l.slice(-logSize));
  }, [logSize]);

  useEffect(() => {
    if (ttsModels.length && !selectedTtsModels.length) {
      setSelectedTtsModels([ttsModels[0].id]);
    }
  }, [ttsModels]);

  useEffect(() => {
    if (selectedTextId === null && texts.length) setSelectedTextId(0);
  }, [texts]);

  useEffect(() => {
    if (selectedAudioId !== null && selectedAudioId >= audios.length) {
      setSelectedAudioId(null);
    }
  }, [audios]);

  useEffect(() => {
    updateStorageInfo();
  }, [texts, audios, transcripts, logs]);

  const textModelsList = [
    ...openRouterModels
      .filter(m => m.architecture?.modality === 'text->text')
      .map(m => ({ id: m.base, provider: 'openrouter' })),
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

  const logIdRef = React.useRef(0);
  const fmtBytes = b => (b / 1048576).toFixed(1) + ' MB';
  const truncate = v => {
    const mask = s => {
      const m = s.match(/^data:.*?;base64,(.*)$/);
      if (m && m[1].length > 100) return '<bytes>';
      if (s.length > 100 && /^[A-Za-z0-9+/=]+$/.test(s)) return '<bytes>';
      return s;
    };
    if (typeof v === 'string') {
      try { v = JSON.parse(v); } catch { return mask(v); }
    }
    if (typeof v === 'object' && v) {
      const out = {};
      for (const [k, val] of Object.entries(v)) {
        if (typeof val === 'string') out[k] = mask(val);
        else out[k] = val;
      }
      return JSON.stringify(out);
    }
    return String(v);
  };

  const updateStorageInfo = async () => {
    let info = { usage: 0, quota: 0 };
    if (navigator.storage?.estimate) {
      try {
        const res = await navigator.storage.estimate();
        if (res) info = res;
      } catch {}
    }
    if (!info.quota) info.quota = 5 * 1024 * 1024;
    if (!info.usage) {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const val = localStorage.getItem(key) || '';
        size += (key.length + val.length) * 2;
      }
      info.usage = size;
    }
    setStorageInfo(info);
  };

  const startLog = (method, url, body = '', model = '', cost = '') => {
    const id = logIdRef.current++;
    const entry = { id, time: new Date().toISOString(), method, url, body: truncate(body), model, cost, pending: true };
    const start = Date.now();
    setLogs(l => {
      const updated = [...l, entry];
      return updated.slice(-logSize);
    });
    return { id, start };
  };

  const finishLog = (handle, response = '', cost = '') => {
    const duration = Date.now() - handle.start;
    setLogs(l => l.map(e => e.id === handle.id ? { ...e, response: truncate(response), cost, duration, pending: false } : e));
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

  const mimeExtension = mime => {
    if (/mpeg|mp3/.test(mime)) return 'mp3';
    if (/ogg/.test(mime)) return 'ogg';
    if (/wav/.test(mime)) return 'wav';
    if (/webm/.test(mime)) return 'webm';
    return 'dat';
  };

  const audioDuration = url => new Promise(resolve => {
    const a = new Audio();
    a.addEventListener('loadedmetadata', () => resolve(a.duration || 0));
    a.src = url;
  });


  useEffect(() => {
    (async () => {
      try {
        const log = startLog('GET', 'https://openrouter.ai/api/v1/models', '', 'openrouter');
        const models = await fetchOpenRouterModels(fetchWithLoading);
        finishLog(log, { models: models.length });
        if (models.length) {
          setOpenRouterModels(models);
          const map = {};
          models.forEach(m => { map[m.base] = m; });
          setOpenRouterMap(map);
          const tts = models.filter(m => /tts|speech|audio/i.test(m.id)).map(m => {
            const cost = parseFloat(m.pricing?.prompt || 0) * 1e6;
            return { id: m.base, name: m.id, cost: Math.round(cost * 100) / 100, provider: 'openrouter' };
          });
          if (tts.length) {
            setTtsModels(t => [...t.filter(x => !tts.some(v => v.id === x.id)), ...tts]);
            if (!selectedTtsModels.length) setSelectedTtsModels([tts[0].id]);
          }
          const asr = models.filter(m => /whisper|asr|speech|transcribe|audio/i.test(m.id)).map(m => ({ id: m.base, name: m.id, provider: 'openrouter' }));
          if (asr.length) {
            setAsrModels(a => [...a.filter(x => !asr.some(v => v.id === x.id)), ...asr]);
            if (!selectedAsrModels.length) setSelectedAsrModels([asr[0].id]);
          }
        }
      } catch (e) {
        showError(e.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!apiKeys.openai) return;
    (async () => {
      try {
        const log = startLog('GET', 'https://api.openai.com/v1/models', '', 'openai');
        const models = await fetchOpenAiModels(apiKeys.openai, fetchWithLoading);
        finishLog(log, { models: models.length });
        if (models.length) {
          setOpenAiModels(models);
          if (!models.includes(openAiModel)) setOpenAiModel(models[0]);
        }
        const ttsList = models.filter(m => m.startsWith('tts-') || /audio|speech|multimodal/i.test(m)).map(m => ({ id: m, name: m, cost: '', provider: 'openai' }));
        if (!ttsList.some(m => m.id === 'gpt-4o-mini-tts')) {
          ttsList.push({ id: 'gpt-4o-mini-tts', name: 'gpt-4o-mini-tts', cost: '', provider: 'openai' });
        }
        if (ttsList.length) {
          setTtsModels(t => [...t.filter(x => !x.id.startsWith('tts-') && !ttsList.some(v => v.id === x.id)), ...ttsList]);
          if (!selectedTtsModels.length) setSelectedTtsModels([ttsList[0].id]);
        }
        const asr = models.filter(m => /whisper|speech|audio|transcribe/i.test(m)).map(m => ({ id: m, name: m, provider: 'openai' }));
        if (asr.length) {
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
      ...openAiModels.filter(m => /whisper|speech|audio|transcribe/i.test(m)).map(m => ({ id: m, name: m, provider: 'openai' })),
      ...googleModels.filter(m => /speech|audio|transcribe|asr/i.test(m)).map(m => ({ id: m, name: m, provider: 'google' })),
      ...mistralModels.map(m => ({ id: m, name: m, provider: 'mistral' }))
    ];
    if (combined.length) {
      setAsrModels(combined);
      if (!selectedAsrModels.length) setSelectedAsrModels([combined[0].id]);
    }
  }, [openAiModels, googleModels]);

  useEffect(() => {
    if (!apiKeys.google) return;
    (async () => {
      try {
        const log = startLog('GET', 'https://generativelanguage.googleapis.com/v1beta/models', '', 'google');
        const models = await fetchGoogleModels(apiKeys.google, fetchWithLoading);
        finishLog(log, { models: models.length });
        if (models.length) {
          setGoogleModels(models);
          if (!models.includes(googleModel)) setGoogleModel(models[0]);
          const multi = models.filter(m => /speech|audio|multimodal/i.test(m)).map(m => ({ id: m, name: m, cost: '', provider: 'google' }));
          if (multi.length) {
            setTtsModels(t => [...t.filter(x => !multi.some(mm => mm.id === x.id)), ...multi]);
            if (!selectedTtsModels.length) setSelectedTtsModels([multi[0].id]);
          }
          const asr = models.filter(m => /speech|audio|transcribe|asr/i.test(m)).map(m => ({ id: m, name: m, provider: 'google' }));
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
      try {
        const log = startLog('GET', 'https://texttospeech.googleapis.com/v1/voices', '', 'google');
        const voices = await fetchGoogleVoices(apiKeys.google, fetchWithLoading);
        finishLog(log, { voices: voices.length });
        if (voices.length) {
          const voiceRows = voices.map(v => ({ id: v, name: v, cost: '', provider: 'google' }));
          setTtsModels(t => [...t.filter(x => !x.id.startsWith('projects/') && !voiceRows.some(v => v.id === x.id)), ...voiceRows]);
          if (!selectedTtsModels.length) setSelectedTtsModels([voiceRows[0].id]);
        }
      } catch (e) {
        showError(e.message);
      }
    })();
  }, [apiKeys.google]);

  const generateTexts = async () => {
    setStatus('Generating text...');
    const timestamp = new Date().toISOString();
    const promises = selectedTextModels.map(model => {
      let rowIndex;
      setTexts(t => {
        rowIndex = t.length;
        return [...t, { provider: model, text: '', prompt: textPrompt, timestamp, pending: true }];
      });
      return (async () => {
        if (openRouterMap[model]) {
          const orModel = openRouterMap[model].id;
          const body = [{ role: 'user', content: expandRefs(textPrompt, { texts, audios, textPrompt, ttsPrompt }) }];
          const log = startLog('POST', 'https://openrouter.ai/api/v1/chat/completions', body, model);
          try {
            const data = await openRouterChat(orModel, body, apiKeys.openrouter, fetchWithLoading);
            finishLog(log, data);
            const text = data.choices?.[0]?.message?.content?.trim();
            if (text) setTexts(t => t.map((v,i)=>i===rowIndex?{ ...v, text, pending:false }:v));
          } catch (e) {
            finishLog(log, { error: e.message });
            showError(e.message);
            setTexts(t => t.map((v,i)=>i===rowIndex?{ ...v, pending:false, error: e.message }:v));
          }
        } else if (googleModels.includes(model)) {
          const prompt = expandRefs(textPrompt, { texts, audios, textPrompt, ttsPrompt });
          const log = startLog('POST', 'google generate', prompt, model);
          try {
            const data = await googleGenerateText(model, prompt, apiKeys.google, fetchWithLoading);
            finishLog(log, data);
            const text = data.candidates?.[0]?.output?.trim();
            if (text) setTexts(t => t.map((v,i)=>i===rowIndex?{ ...v, text, pending:false }:v));
          } catch (e) {
            finishLog(log, { error: e.message });
            showError(e.message);
            setTexts(t => t.map((v,i)=>i===rowIndex?{ ...v, pending:false, error: e.message }:v));
          }
        } else {
          const body = [{ role: 'user', content: expandRefs(textPrompt, { texts, audios, textPrompt, ttsPrompt }) }];
          const log = startLog('POST', 'https://api.openai.com/v1/chat/completions', body, model);
          try {
            const data = await openAiChat(model, body, apiKeys.openai, fetchWithLoading);
            finishLog(log, data);
            const text = data.choices?.[0]?.message?.content?.trim();
            if (text) setTexts(t => t.map((v,i)=>i===rowIndex?{ ...v, text, pending:false }:v));
          } catch (e) {
            finishLog(log, { error: e.message });
            showError(e.message);
            setTexts(t => t.map((v,i)=>i===rowIndex?{ ...v, pending:false, error: e.message }:v));
          }
        }
      })();
    });
    await Promise.all(promises);
    setStatus('');
  };


  const uploadAudio = async (file) => {
    if (!file || selectedTextId === null) return;
    const data = await blobToDataUrl(file);
    const duration = await audioDuration(data);
    const timestamp = new Date().toISOString();
    setAudios([...audios, { index: selectedTextId, provider: 'upload', url: data, data, prompt: ttsPrompt, timestamp, duration }]);
  };

  const startRecording = async () => {
    if (recording || selectedTextId === null) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = async e => {
        const data = await blobToDataUrl(e.data);
        const duration = await audioDuration(data);
        const timestamp = new Date().toISOString();
        setAudios(a => [...a, { index: selectedTextId, provider: 'record', url: data, data, prompt: ttsPrompt, timestamp, duration }]);
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
    setTexts([...texts, { provider: 'tts', text: ttsPrompt, instructions: ttsMetaPrompt }]);
    const promises = selectedTtsModels.map(model => {
      const cost = ttsModels.find(m => m.id === model)?.cost || '';
      let rowIndex;
      setAudios(a => {
        rowIndex = a.length;
        return [...a, { index: idx, provider: model, prompt: ttsPrompt, instructions: ttsMetaPrompt, timestamp, pending: true }];
      });
      return (async () => {
        if (openRouterMap[model]) {
          const orModel = openRouterMap[model].id;
          const input = expandRefs(ttsPrompt, { texts, audios, textPrompt, ttsPrompt });
          const instr = expandRefs(ttsMetaPrompt, { texts, audios, textPrompt, ttsPrompt });
          const log = startLog('POST', 'https://openrouter.ai/api/v1/audio/speech', { model: orModel, input }, model, cost);
          try {
            const blob = await openRouterTts(orModel, input, instr, apiKeys.openrouter, fetchWithLoading);
            finishLog(log, { model, data: '<bytes>' }, cost);
            const data = await blobToDataUrl(blob);
            const duration = await audioDuration(data);
            setAudios(a => a.map((v,i)=>i===rowIndex?{ ...v, url: data, data, duration, pending:false }:v));
          } catch (e) {
            finishLog(log, { error: e.message }, cost);
            showError(e.message);
            setAudios(a => a.map((v,i)=>i===rowIndex?{ ...v, pending:false, error: e.message }:v));
          }
        } else if (openAiModels.includes(model)) {
          const input = expandRefs(ttsPrompt, { texts, audios, textPrompt, ttsPrompt });
          const instr = expandRefs(ttsMetaPrompt, { texts, audios, textPrompt, ttsPrompt });
          const log = startLog('POST', 'https://api.openai.com/v1/audio/speech', { model, input }, model, cost);
          try {
            const blob = await openAiTts(model, input, instr, apiKeys.openai, fetchWithLoading);
            finishLog(log, { model, data: '<bytes>' }, cost);
            const data = await blobToDataUrl(blob);
            const duration = await audioDuration(data);
            setAudios(a => a.map((v,i)=>i===rowIndex?{ ...v, url: data, data, duration, pending:false }:v));
          } catch (e) {
            finishLog(log, { error: e.message }, cost);
            showError(e.message);
            setAudios(a => a.map((v,i)=>i===rowIndex?{ ...v, pending:false, error: e.message }:v));
          }
        } else {
          const log = startLog('TTS', model, fullPrompt, model, cost);
          const blob = new Blob([`${model}:${fullPrompt}`], { type: 'audio/plain' });
          const data = await blobToDataUrl(blob);
          const duration = await audioDuration(data);
          setAudios(a => a.map((v,i)=>i===rowIndex?{ ...v, url: data, data, duration, pending:false }:v));
          finishLog(log, { model, data: '<bytes>' }, cost);
        }
      })();
    });
    await Promise.all(promises);
  };

  const transcribe = async (aIndex) => {
    const audio = audios[aIndex];
    if (!audio) return;
    setStatus('Transcribing...');
    const blob = dataUrlToBlob(audio.data || audio.url);
    const promises = selectedAsrModels.map(model => {
      let rowIndex;
      const finish = text => {
        setTranscripts(t => t.map((v,i)=>i===rowIndex?{ ...v, text, pending:false }:v));
      };
      setTranscripts(t => {
        rowIndex = t.length;
        return [...t, { aIndex, provider: model, text: '', prompt: asrPrompt, timestamp: new Date().toISOString(), pending: true }];
      });
      return (async () => {
        if (openRouterMap[model]) {
          const orModel = openRouterMap[model].id;
          const prompt = asrPrompt ? expandRefs(asrPrompt, { texts, audios, textPrompt, ttsPrompt }) : '';
          const log = startLog('POST', 'https://openrouter.ai/api/v1/audio/transcriptions', { model: orModel }, model);
          try {
            const data = await openRouterTranscribe(orModel, blob, prompt, apiKeys.openrouter, fetchWithLoading);
            finishLog(log, data);
            const text = data.text?.trim();
            if (text) finish(text);
          } catch (e) {
            finishLog(log, { error: e.message });
            setTranscripts(t => t.map((v,i)=>i===rowIndex?{ ...v, pending:false, error: e.message }:v));
            showError(e.message);
          }
        } else if (mistralModels.includes(model)) {
          const prompt = asrPrompt ? expandRefs(asrPrompt, { texts, audios, textPrompt, ttsPrompt }) : '';
          const log = startLog('POST', 'https://api.mistral.ai/v1/audio/transcriptions', { model }, model);
          try {
            const data = await mistralTranscribe(model, blob, prompt, apiKeys.mistral, fetchWithLoading);
            finishLog(log, data);
            const text = data.text?.trim();
            if (text) finish(text);
          } catch (e) {
            finishLog(log, { error: e.message });
            setTranscripts(t => t.map((v,i)=>i===rowIndex?{ ...v, pending:false, error: e.message }:v));
            showError(e.message);
          }
        } else if (openAiModels.includes(model)) {
          const prompt = asrPrompt ? expandRefs(asrPrompt, { texts, audios, textPrompt, ttsPrompt }) : '';
          const log = startLog('POST', 'https://api.openai.com/v1/audio/transcriptions', { model }, model);
          try {
            const data = await openAiTranscribe(model, blob, prompt, apiKeys.openai, fetchWithLoading);
            finishLog(log, data);
            const text = data.text?.trim();
            if (text) finish(text);
          } catch (e) {
            finishLog(log, { error: e.message });
            setTranscripts(t => t.map((v,i)=>i===rowIndex?{ ...v, pending:false, error: e.message }:v));
            showError(e.message);
          }
        } else {
          const logBody = { model, audio: '<bytes>' };
          const log = startLog('ASR', model, logBody, model);
          const text = texts[audio.index]?.text || '';
          finish(text);
          finishLog(log, text);
        }
      })();
    });
    await Promise.all(promises);
    setStatus('');
  };

  const generateTranscripts = () => {
    if (selectedAudioId == null) return;
    transcribe(selectedAudioId);
  };

  const deleteAudio = (aIndex) => {
    setAudios(a => a.filter((_, i) => i !== aIndex));
    setTranscripts(t => t.flatMap(tr => {
      if (tr.aIndex === aIndex) return [];
      if (tr.aIndex > aIndex) return [{ ...tr, aIndex: tr.aIndex - 1 }];
      return [tr];
    }));
    if (selectedAudioId === aIndex) setSelectedAudioId(null);
    else if (selectedAudioId > aIndex) setSelectedAudioId(selectedAudioId - 1);
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
    if (selectedAudioId != null) {
      const mapped = map[selectedAudioId];
      if (mapped == null) setSelectedAudioId(null);
      else setSelectedAudioId(mapped);
    }
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

  const clearTables = () => {
    const keys = [
      'texts', 'audios', 'transcripts', 'logs',
      'textsSort', 'textsFilter', 'textsCols',
      'audiosSort', 'audiosFilter', 'audiosCols',
      'resultsSort', 'resultsFilter', 'resultsCols',
      'modelsSort', 'modelsFilter', 'modelsCols',
      'logsSort', 'logsFilter', 'logsCols'
    ];
    keys.forEach(k => localStorage.removeItem(k));
    setTexts([]); setAudios([]); setTranscripts([]); setLogs([]);
  };

  const clearKeys = () => {
    clearTables();
    localStorage.removeItem('apiKeys');
    setApiKeys({ openai: '', google: '', openrouter: '', mistral: '' });
  };

  const resetUi = () => {
    const keys = [
      'textPrompt', 'ttsPrompt', 'asrPrompt', 'ttsMetaPrompt',
      'textsSort', 'textsFilter', 'textsCols',
      'audiosSort', 'audiosFilter', 'audiosCols',
      'resultsSort', 'resultsFilter', 'resultsCols',
      'modelsSort', 'modelsFilter', 'modelsCols',
      'logsSort', 'logsFilter', 'logsCols',
      'darkMode', 'lang'
    ];
    keys.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  const rows = transcriptsToRows(transcripts, audios, texts);

  const textRows = texts.map((txt, i) => ({ id: i, ...txt })).filter(r => r.provider !== 'tts');
  const textColumns = [
    { field: 'id', headerName: t('textId'), width: 70, valueGetter: p => (p.row && p.row.id != null ? p.row.id + 1 : ''), renderCell: p => renderCell(p, 'tab_text') },
    { field: 'timestamp', headerName: t('timestamp'), width: 180, renderCell: p => renderCell(p, 'tab_text') },
    { field: 'text', headerName: t('text'), flex: 1, renderCell: p => renderProgressCell(p, 'tab_text') },
    { field: 'provider', headerName: t('source'), width: 120, renderCell: p => renderCell(p, 'tab_text') },
    {
      field: 'actions', headerName: t('actions'), sortable: false, filterable: false, width: 150,
      renderCell: params => (
        <>
          <Tooltip title={t('useText')}>
            <IconButton onClick={e => { e.stopPropagation(); setSelectedTextId(params.row.id); setTtsPrompt(params.row.text); setView('audio'); }} size="small">
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton onClick={e => { e.stopPropagation(); deleteText(params.row.id); }} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  const audioRows = audios.map((a, i) => ({ id: i, ...a, _index: i }));
  const renderAudioCell = p => (
    <div>
      {p.row.error && <div style={{color:'red'}}>{p.row.error}</div>}
      {p.row.url && <audio controls src={p.row.url}></audio>}
      {p.row.storageError && <div style={{color:'red'}}>{t('storageFailed')}</div>}
    </div>
  );
  const audioColumns = [
    { field: 'timestamp', headerName: t('timestamp'), width: 180, renderCell: p => renderCell(p, 'tab_audio') },
    { field: 'index', headerName: t('textId'), width: 80, valueGetter: p => (p.row && p.row.index != null ? p.row.index + 1 : ''), renderCell: p => renderCell(p, 'tab_audio') },
    { field: 'provider', headerName: t('source'), width: 120, renderCell: p => renderCell(p, 'tab_audio') },
    {
      field: 'text',
      headerName: t('text'),
      flex: 1,
      valueGetter: p => (p && p.row && p.row.index != null ? (texts[p.row.index]?.text || '') : ''),
      renderCell: p => renderCell(p, 'tab_audio')
    },
    { field: 'audio', headerName: t('audio'), flex: 1, sortComparator: (a,b,c,d) => (c?.row?.duration ?? 0) - (d?.row?.duration ?? 0), renderCell: renderAudioCell },
    {
      field: 'actions', headerName: t('actions'), sortable: false, filterable: false, width: 160,
      renderCell: params => (
        <>
          <Tooltip title={t('toAsr')}>
            <IconButton onClick={e => { e.stopPropagation(); setSelectedAudioId(params.row._index); setView('asr'); }} size="small">
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton onClick={e => { e.stopPropagation(); deleteAudio(params.row._index); }} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  const resultRows = rows.map((r, idx) => ({ id: idx, ...r, _index: idx }));
  const resultColumns = [
    { field: 'i', headerName: t('transcriptId'), width: 70, renderCell: p => renderCell(p, 'tab_asr') },
    { field: 'timestamp', headerName: t('timestamp'), width: 180, renderCell: p => renderCell(p, 'tab_asr') },
    { field: 'textSource', headerName: t('textSource'), width: 120, renderCell: p => renderCell(p, 'tab_asr') },
    { field: 'audioSource', headerName: t('audioSource'), width: 120, renderCell: p => renderCell(p, 'tab_asr') },
    { field: 'asrSource', headerName: t('asrSource'), width: 120, renderCell: p => renderCell(p, 'tab_asr') },
    { field: 'original', headerName: t('originalText'), flex: 1, renderCell: p => renderCell(p, 'tab_asr') },
    { field: 'transcription', headerName: t('transcript'), flex: 1, renderCell: p => renderProgressCell(p, 'tab_asr') },
    { field: 'wer', headerName: t('wer'), width: 90, renderCell: p => renderProgressCell(p, 'tab_asr') },
    { field: 'diff', headerName: t('diff'), flex: 1, renderCell: p => renderHtmlProgressCell(p, 'tab_asr') },
    {
      field: 'actions', headerName: t('actions'), sortable: false, filterable: false, width: 90,
      renderCell: params => (
        <Tooltip title={t('delete')}>
          <IconButton onClick={e => { e.stopPropagation(); deleteTranscript(params.row._index); }} size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  const logRows = logs.map((l, i) => ({ id: i, ...l }));
  const logColumns = [
    { field: 'model', headerName: t('modelName'), width: 150, renderCell: p => renderCell(p, 'tab_log') },
    { field: 'time', headerName: t('timestamp'), width: 180, renderCell: p => renderCell(p, 'tab_log') },
    { field: 'method', headerName: t('actions'), width: 100, renderCell: p => renderCell(p, 'tab_log') },
    { field: 'url', headerName: 'Endpoint', flex: 1, renderCell: p => renderCell(p, 'tab_log') },
    { field: 'body', headerName: 'Query', flex: 1, renderCell: p => renderCell(p, 'tab_log') },
    { field: 'response', headerName: 'Response', flex: 1, renderCell: p => renderProgressCell(p, 'tab_log') },
    { field: 'cost', headerName: 'Cost', width: 100, renderCell: p => renderProgressCell(p, 'tab_log') },
    { field: 'duration', headerName: t('duration'), width: 100, renderCell: p => renderProgressCell(p, 'tab_log') },
    {
      field: 'actions', headerName: t('actions'), sortable: false, filterable: false, width: 120,
      renderCell: params => (
        <Tooltip title={t('delete')}>
          <IconButton onClick={e => { e.stopPropagation(); deleteLog(params.row.id); }} size="small" color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  const modelRows = React.useMemo(() => {
    const map = {};
    textModelsList.forEach(m => {
      map[m.id] = { id: m.id, provider: m.provider, name: m.id };
    });
    ttsModels.forEach(m => {
      const row = map[m.id] || { id: m.id, provider: m.provider, name: m.name };
      row.name = m.name;
      row.audio = true;
      row.pricing = row.pricing || m.cost || '';
      map[m.id] = row;
    });
    asrModels.forEach(m => {
      const row = map[m.id] || { id: m.id, provider: m.provider, name: m.name };
      row.asr = true;
      map[m.id] = row;
    });
    openRouterModels.forEach(m => {
      const prompt = parseFloat(m.pricing?.prompt || 0);
      const completion = parseFloat(m.pricing?.completion || 0);
      const pricing = (prompt + completion) * 1e6;
      const id = m.id.split('/').pop();
      const row = map[id] || { id, provider: 'openrouter', name: m.name };
      row.modelId = m.id;
      row.description = m.description;
      row.modality = m.architecture?.modality || row.modality;
      row.pricing = pricing ? Math.round(pricing * 100) / 100 : row.pricing;
      map[id] = row;
    });
    openAiModels.forEach(id => {
      if (!map[id]) map[id] = { id, provider: 'openai', name: id };
    });
    googleModels.forEach(id => {
      if (!map[id]) map[id] = { id, provider: 'google', name: id };
    });
    return Object.values(map).map(r => ({
      ...r,
      text: selectedTextModels.includes(r.id),
      audio: selectedTtsModels.includes(r.id),
      asr: selectedAsrModels.includes(r.id)
    }));
  }, [textModelsList, ttsModels, asrModels, openRouterModels, openAiModels, googleModels, selectedTextModels, selectedTtsModels, selectedAsrModels]);

  const filteredModelRows = React.useMemo(
    () => showSelectedOnly ? modelRows.filter(r => r.text || r.audio || r.asr) : modelRows,
    [modelRows, showSelectedOnly]
  );

  const modelColumns = [
    { field: 'id', headerName: t('modelId'), width: 200, renderCell: p => renderCell(p, 'tab_models') },
    { field: 'provider', headerName: t('source'), width: 100, renderCell: p => renderCell(p, 'tab_models') },
    { field: 'name', headerName: t('modelName'), width: 200, renderCell: p => renderCell(p, 'tab_models') },
    { field: 'description', headerName: t('modelDesc'), flex: 1, renderCell: p => renderCell(p, 'tab_models') },
    { field: 'modality', headerName: t('modality'), width: 120, renderCell: p => renderCell(p, 'tab_models') },
    { field: 'pricing', headerName: t('pricePerM'), width: 150, type: 'number', renderCell: p => renderCell(p, 'tab_models') },
    { field: 'text', headerName: t('tabText'), width: 80, sortable: false, filterable: false,
      renderCell: params => (
        <Checkbox size="small" checked={selectedTextModels.includes(params.row.id)} onChange={e => {
          const checked = e.target.checked;
          setSelectedTextModels(s => checked ? [...s, params.row.id] : s.filter(v => v !== params.row.id));
        }} />
      ) },
    { field: 'audio', headerName: t('tabAudio'), width: 80, sortable: false, filterable: false,
      renderCell: params => (
        <Checkbox size="small" checked={selectedTtsModels.includes(params.row.id)} onChange={e => {
          const checked = e.target.checked;
          setSelectedTtsModels(s => checked ? [...s, params.row.id] : s.filter(v => v !== params.row.id));
        }} />
      ) },
    { field: 'asr', headerName: t('tabAsr'), width: 80, sortable: false, filterable: false,
      renderCell: params => (
        <Checkbox size="small" checked={selectedAsrModels.includes(params.row.id)} onChange={e => {
          const checked = e.target.checked;
          setSelectedAsrModels(s => checked ? [...s, params.row.id] : s.filter(v => v !== params.row.id));
        }} />
      ) }
  ];

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const tabsAll = [
    { value: 'text', label: t('tabText'), icon: <ArticleIcon fontSize="small" /> },
    { value: 'audio', label: t('tabAudio'), icon: <AudiotrackIcon fontSize="small" /> },
    { value: 'asr', label: t('tabAsr'), icon: <KeyboardVoiceIcon fontSize="small" /> },
    { value: 'log', label: t('tabLog'), icon: <ListAltIcon fontSize="small" /> },
    { value: 'models', label: t('tabModels'), icon: <TableChartIcon fontSize="small" /> },
    { value: 'config', label: t('tabSettings'), icon: <SettingsIcon fontSize="small" /> }
  ];
  const visibleTabs = isSmall ? tabsAll.slice(0, 3) : tabsAll;
  const extraTabs = isSmall ? tabsAll.slice(3) : [];

  const modelsTooltip = `${t('tabText')}: ${selectedTextModels.join(', ')} | ${t('tabAudio')}: ${selectedTtsModels.join(', ')} | ${t('tabAsr')}: ${selectedAsrModels.join(', ')}`;


  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <PlaygroundIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            {t('appTitle')}
          </Typography>
          <Tabs
            value={view}
            onChange={(e, v) => setView(v)}
            textColor="inherit"
            indicatorColor="secondary"
          >
            {visibleTabs.map(ti => {
              const tabEl = (
                <Tab
                  key={ti.value}
                  value={ti.value}
                  label={isSmall ? '' : ti.label}
                  icon={isSmall ? ti.icon : undefined}
                  aria-label={ti.label}
                />
              );
              return ti.value === 'models' ? (
                <Tooltip key={ti.value} title={modelsTooltip} placement="bottom">
                  {tabEl}
                </Tooltip>
              ) : tabEl;
            })}
          </Tabs>
          {extraTabs.length > 0 && (
            <>
              <IconButton color="inherit" onClick={e => setMenuAnchor(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                {extraTabs.map(ti => (
                  <MenuItem key={ti.value} onClick={() => { setView(ti.value); setMenuAnchor(null); }}>
                    {ti.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {loadingCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <DotSpinner className="dot-spinner" />
              {loadingCount > 1 && (
                <Typography variant="caption" sx={{ ml: 0.5 }}>{loadingCount}</Typography>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ pt: { xs: '56px', sm: '64px' } }}>
      <div className="content" style={{ display: view === 'text' ? "block" : "none" }}>

          <Tooltip title={expandRefs(textPrompt, { texts, audios, textPrompt, ttsPrompt })} placement="top">
            <TextField
              label={t('promptForModels')}
              multiline
              rows={3}
              value={textPrompt}
              onChange={e => setTextPrompt(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <IconButton size="small" onClick={() => navigator.clipboard.writeText(textPrompt)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={e => setPromptAnchor(e.currentTarget)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </InputAdornment>
                )
              }}
            />
          </Tooltip>
          <Menu anchorEl={promptAnchor} open={Boolean(promptAnchor)} onClose={() => setPromptAnchor(null)}>
            <MenuItem value="" disabled>{t('examplePromptLabel')}</MenuItem>
            {predefinedPrompts.map((p, i) => (
              <MenuItem key={i} onClick={() => { setTextPrompt(p); setPromptAnchor(null); }}>{p}</MenuItem>
            ))}
          </Menu>
          <Tooltip
            title={selectedTextModels.join('\n')}
            componentsProps={{ tooltip: { sx: { whiteSpace: 'pre-line' } } }}
          >
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={generateTexts}
            >
              {t('generate')}
            </Button>
          </Tooltip>
          <Divider sx={{ my: 2 }} />
          <ExportButtons rows={textRows} columns={textColumns} name="texts" t={t} />
          <PersistedGrid
            storageKey="texts"
            rows={textRows}
            columns={textColumns}
            t={t}
            initialSort={[{ field: 'timestamp', sort: 'desc' }]}
          />
        </div>
      )}
      <div className="content" style={{ display: view === 'audio' ? "block" : "none" }}>

          <Tooltip title={expandRefs(ttsMetaPrompt, { texts, audios, textPrompt, ttsPrompt })} placement="top">
            <TextField
              label={t('metaPromptLabel')}
              multiline
              rows={2}
              value={ttsMetaPrompt}
              onChange={e => setTtsMetaPrompt(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Read the following text as a very fast and energetic sports reporter, kind of like Gunnar Hololei"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <IconButton size="small" onClick={() => navigator.clipboard.writeText(ttsMetaPrompt)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={e => setInstrAnchor(e.currentTarget)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </InputAdornment>
                )
              }}
            />
          </Tooltip>
          <Menu anchorEl={instrAnchor} open={Boolean(instrAnchor)} onClose={() => setInstrAnchor(null)}>
            <MenuItem value="" disabled>{t('examplePromptLabel')}</MenuItem>
            {predefinedInstructions.map((p, i) => (
              <MenuItem key={i} onClick={() => { setTtsMetaPrompt(p); setInstrAnchor(null); }}>{p}</MenuItem>
            ))}
          </Menu>
          <Tooltip title={expandRefs(ttsPrompt, { texts, audios, textPrompt, ttsPrompt })} placement="top">
            <TextField
              label={t('ttsPromptLabel')}
              multiline
              rows={4}
              value={ttsPrompt}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => navigator.clipboard.writeText(ttsPrompt)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              fullWidth
              margin="normal"
            />
          </Tooltip>
          <Tooltip
            title={selectedTtsModels.join('\n')}
            componentsProps={{ tooltip: { sx: { whiteSpace: 'pre-line' } } }}
          >
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={synthesizeTts}
              sx={{ mt: 1 }}
            >
              {t('generate')}
            </Button>
          </Tooltip>
          <Button size="small" component="label" sx={{ mt: 1, ml: 1 }}>
            {t('uploadAudio')}
            <input type="file" accept="audio/*" hidden onChange={e => uploadAudio(e.target.files[0])} />
          </Button>
          <Button size="small" onClick={recording ? stopRecording : startRecording} sx={{ mt: 1, ml: 1 }}>
            {recording ? t('stopRecording') : t('recordAudio')}
          </Button>
          <Divider sx={{ my: 2 }} />
          <ExportButtons rows={audioRows} columns={audioColumns} name="audios" t={t} />
          <PersistedGrid
            storageKey="audios"
            rows={audioRows}
            columns={audioColumns}
            t={t}
            initialSort={[{ field: 'timestamp', sort: 'desc' }]}
          />
          {status && <p>{status}</p>}
        </div>
      )}
      <div className="content" style={{ display: view === 'asr' ? "block" : "none" }}>

          <Tooltip title={expandRefs(asrPrompt, { texts, audios, textPrompt, ttsPrompt })} placement="top">
            <TextField
              label={t('asrPromptLabel')}
              multiline
              rows={3}
              value={asrPrompt}
              onChange={e => setAsrPrompt(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <IconButton size="small" onClick={() => navigator.clipboard.writeText(asrPrompt)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={e => setAsrPromptAnchor(e.currentTarget)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </InputAdornment>
                )
              }}
            />
          </Tooltip>
          <Menu anchorEl={asrPromptAnchor} open={Boolean(asrPromptAnchor)} onClose={() => setAsrPromptAnchor(null)}>
            <MenuItem value="" disabled>{t('examplePromptLabel')}</MenuItem>
            {predefinedAsrPrompts.map((p, i) => (
              <MenuItem key={i} onClick={() => { setAsrPrompt(p); setAsrPromptAnchor(null); }}>{p}</MenuItem>
            ))}
          </Menu>
          {selectedAudioId != null && audios[selectedAudioId] && (
            <audio controls src={audios[selectedAudioId].url} style={{ width: '100%', marginTop: '0.5rem' }} />
          )}
          <Tooltip
            title={selectedAsrModels.join('\n')}
            componentsProps={{ tooltip: { sx: { whiteSpace: 'pre-line' } } }}
          >
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={generateTranscripts}
              sx={{ mt: 1 }}
            >
              {t('generate')}
            </Button>
          </Tooltip>
          <Divider sx={{ my: 2 }} />
          <ExportButtons rows={resultRows} columns={resultColumns} name="results" t={t} />
          <PersistedGrid
            storageKey="results"
            rows={resultRows}
            columns={resultColumns}
            t={t}
            initialSort={[{ field: 'timestamp', sort: 'desc' }]}
          />
          {status && <p>{status}</p>}
        </div>
      )}
      <div className="content" style={{ display: view === 'models' ? "block" : "none" }}>

          <FormControlLabel
            control={<Switch checked={showSelectedOnly} onChange={e => setShowSelectedOnly(e.target.checked)} />}
            label={t('showSelected')}
            sx={{ mb: 1 }}
          />
          <ExportButtons rows={filteredModelRows} columns={modelColumns} name="models" t={t} />
          <PersistedGrid
            storageKey="models"
            rows={filteredModelRows}
            columns={modelColumns}
            t={t}
            initialSort={[{ field: 'pricing', sort: 'desc' }]}
          />
        </div>
      )}
      <div className="content" style={{ display: view === 'log' ? "block" : "none" }}>

          <Divider sx={{ my: 2 }} />
          <ExportButtons rows={logRows} columns={logColumns} name="logs" t={t} />
          <PersistedGrid
            storageKey="logs"
            rows={logRows}
            columns={logColumns}
            t={t}
            initialCols={{ duration: false }}
            initialSort={[{ field: 'time', sort: 'desc' }]}
          />
        </div>
      )}
      <div className="content" style={{ display: view === 'config' ? "block" : "none" }}>

          <Divider textAlign="left" sx={{ mb: 1 }}>{t('keysGroup')}</Divider>
          <TextField
            label={t('openaiKey')}
            type="password"
            value={apiKeys.openai}
            onChange={e => setApiKeys({ ...apiKeys, openai: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Typography variant="caption" sx={{ ml: 1 }}>
            <Link href={t('openaiKeyUrl')} target="_blank" rel="noopener">
              {t('openaiKeyUrl')}
            </Link>
          </Typography>
          <TextField
            label={t('googleKey')}
            type="password"
            value={apiKeys.google}
            onChange={e => setApiKeys({ ...apiKeys, google: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Typography variant="caption" sx={{ ml: 1 }}>
            <Link href={t('googleKeyUrl')} target="_blank" rel="noopener">
              {t('googleKeyUrl')}
            </Link>
          </Typography>
          <TextField
            label={t('openrouterKey')}
            type="password"
            value={apiKeys.openrouter}
            onChange={e => setApiKeys({ ...apiKeys, openrouter: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Typography variant="caption" sx={{ ml: 1 }}>
            <Link href={t('openrouterKeyUrl')} target="_blank" rel="noopener">
              {t('openrouterKeyUrl')}
            </Link>
          </Typography>
          <TextField
            label={t('mistralKey')}
            type="password"
            value={apiKeys.mistral}
            onChange={e => setApiKeys({ ...apiKeys, mistral: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Typography variant="caption" sx={{ ml: 1 }}>
            <Link href={t('mistralKeyUrl')} target="_blank" rel="noopener">
              {t('mistralKeyUrl')}
            </Link>
          </Typography>
          <Divider textAlign="left" sx={{ my: 2 }}>{t('uiGroup')}</Divider>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />}
            label={t('darkMode')}
            sx={{ mt: 1 }}
          />
          <Select value={lang} onChange={e => setLang(e.target.value)} fullWidth sx={{ mt: 1 }}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="et">Eesti</MenuItem>
            <MenuItem value="vro">V\u00f5ro</MenuItem>
          </Select>
          <Divider textAlign="left" sx={{ my: 2 }}>{t('storageGroup')}</Divider>
          <Box sx={{ mb: 1 }}>
            <TextField
              label={t('logSize')}
              type="number"
              size="small"
              value={logSize}
              onChange={e => setLogSize(parseInt(e.target.value || 0))}
              sx={{ width: 120, mr: 2 }}
            />
            <Typography variant="body2" sx={{ mt: 2 }}>
              {t('storageUsage')}: {fmtBytes(storageInfo.usage)} / {fmtBytes(storageInfo.quota)}
            </Typography>
          </Box>
          <Box>
            <Button size="small" onClick={clearTables}>{t('clearData')}</Button>
            <Button size="small" onClick={clearKeys} sx={{ ml: 1 }}>{t('clearKeys')}</Button>
            <Button size="small" onClick={resetUi} sx={{ ml: 1 }}>{t('resetUi')}</Button>
          </Box>
        </div>
      )}
      </Box>
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

