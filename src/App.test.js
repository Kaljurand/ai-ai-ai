import { describe, it, expect } from 'vitest';
import { transform } from 'esbuild';
import fs from 'fs';

describe('App.jsx compilation', () => {
  it('compiles without syntax errors', async () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    await expect(transform(code, { loader: 'jsx' })).resolves.toBeTruthy();
  });
  it('contains Voro translations', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('vro:')).toBe(true);
  });
  it('includes new TTS model and models tab', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('gpt-4o-mini-tts')).toBe(true);
    expect(code.includes('tabModels')).toBe(true);
  });
  it('contains dark mode and example prompt label', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('darkMode')).toBe(true);
    expect(code.includes('examplePromptLabel')).toBe(true);
  });
  it('contains OpenRouter API key label', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('openrouterKey')).toBe(true);
  });
  it('contains Mistral API key label', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('mistralKey')).toBe(true);
  });
  it('contains API key URLs', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('openaiKeyUrl')).toBe(true);
    expect(code.includes('googleKeyUrl')).toBe(true);
    expect(code.includes('openrouterKeyUrl')).toBe(true);
    expect(code.includes('mistralKeyUrl')).toBe(true);
  });
  it('includes voxtral small model', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('voxtral-small-2507')).toBe(true);
  });
  it('contains selectedModels label', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('selectedModels')).toBe(true);
  });
  it('uses the instructions field in TTS requests', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('expandRefs(ttsMetaPrompt')).toBe(true);
  });
  it('imports the more icon', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('@mui/icons-material/MoreVert')).toBe(true);
  });
  it('imports tab icons', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('@mui/icons-material/Article')).toBe(true);
    expect(code.includes('@mui/icons-material/Audiotrack')).toBe(true);
    expect(code.includes('@mui/icons-material/KeyboardVoice')).toBe(true);
  });
  it('includes showSelected translation', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('showSelected')).toBe(true);
  });
  it('includes duration translation', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('duration')).toBe(true);
  });
  it('includes resetUi translation', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('resetUi')).toBe(true);
  });
  it('uses DotSpinner component', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('DotSpinner')).toBe(true);
  });
  it('uses pending rows', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('pending: true')).toBe(true);
  });
  it('uses draggable dialog and cell click handler', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('react-draggable')).toBe(true);
    expect(code.includes('onCellClick')).toBe(true);
  });
  it('renders row actions in the dialog', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes(".find(c => c.field === 'actions').renderCell"))
      .toBe(true);
  });
  it('stops row click propagation on action buttons', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('stopPropagation')).toBe(true);
  });
  it('includes exportYAML translation', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('exportYAML')).toBe(true);
  });
  it('shows generate tooltips with models', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(/Tooltip\s*\n\s*title={selectedTextModels\.join/.test(code)).toBe(true);
    expect(/Tooltip\s*\n\s*title={selectedTtsModels\.join/.test(code)).toBe(true);
  });
  it('shows models tab tooltip with selected models', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('modelsTooltip')).toBe(true);
  });
  it('ignores checkbox clicks', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes("closest('input[type=\"checkbox\"]')")).toBe(true);
  });
  it('includes generateTranscript translation', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('generateTranscript')).toBe(true);
  });
  it('shows ASR generate tooltip with models', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(/Tooltip\s*\n\s*title={selectedAsrModels\.join/.test(code)).toBe(true);
  });
  it('contains ASR example prompts', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('predefinedAsrPrompts')).toBe(true);
    expect(code.includes('Assume the following audio was spoken by a non-native speaker.')).toBe(true);
  });
  it('clamps table cell text to three lines', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('WebkitLineClamp: 3')).toBe(true);
    expect(code.includes("val.slice(0, 25)")).toBe(false);
  });
  it('includes log size and storage usage translations', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('logSize')).toBe(true);
    expect(code.includes('storageUsage')).toBe(true);
  });
  it('calculates local storage usage', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('localStorage.length')).toBe(true);
  });
  it('formats model pricing', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('pricePerM')).toBe(true);
    expect(code.includes("type: 'number'")).toBe(true);
    expect(code.includes('1e6')).toBe(true);
  });
  it('adds pending-row class to pending rows', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('getRowClassName')).toBe(true);
    expect(code.includes('pending-row')).toBe(true);
  });
  it('syncs selected models with the URL', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('URLSearchParams')).toBe(true);
    expect(code.includes('replaceState')).toBe(true);
    expect(code.includes('textModels')).toBe(true);
    expect(code.includes('ttsModels')).toBe(true);
    expect(code.includes('asrModels')).toBe(true);
    expect(code.includes("split('/').pop()")).toBe(true);
  });
});
