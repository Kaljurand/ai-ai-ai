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
  it('uses pending rows', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('pending: !mockMode')).toBe(true);
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
    expect(/Tooltip\s*\n\s*title={selectedTextModels.length/.test(code)).toBe(true);
    expect(/Tooltip\s*\n\s*title={selectedTtsModels.length/.test(code)).toBe(true);
  });
  it('shows models tab tooltip with selected models', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes('modelsTooltip')).toBe(true);
  });
  it('ignores checkbox clicks', () => {
    const code = fs.readFileSync('src/App.jsx', 'utf8');
    expect(code.includes("closest('input[type=\"checkbox\"]')")).toBe(true);
  });
});
