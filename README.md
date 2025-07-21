# Speech Playground

This repository contains a small proof-of-concept single page application for experimenting with various AI speech services such as text generation, text-to-speech (TTS) and automatic speech recognition (ASR).

The app now uses a small Vite build setup. Install dependencies and run the development server with:

```bash
npm install
npm run dev
```

Build static files with:

```bash
npm run build
```

This generates production files in the `dist` directory. Open
`dist/index.html` in your browser to use the app without running the
development server.

To execute the unit tests run:

```bash
npm test
```

## Features

- Generate Estonian texts via OpenAI, Google or OpenRouter APIs.
- API keys and available models for each provider can be entered in the UI. Model lists and pricing are fetched from OpenRouter whenever possible.
- Synthesize text to audio using TTS APIs.
- Transcribe audio back to text using the selected ASR models.
- Compute the Word Error Rate (WER) between the generated text and transcription.
- Visual diff view highlighting transcription errors.
- Users can add their own texts, edit generated ones and upload audio files.
- Export results as JSON, YAML or Markdown and clear all stored data.
- Results are persisted in browser local storage.
- The number of log entries kept can be adjusted and current storage usage is shown in the Settings tab.
- Browse OpenRouter models in a dedicated tab. The table shows the sum of
  prompt and completion pricing for each model.
- Click any table cell (except checkboxes) to view a Markdown preview of its contents.
- Prompts can reference table values using `{{tab_name.table.ID.field}}` syntax which expands before API calls.
- The selected models are stored in the URL, allowing bookmarks to restore your choices.

This is not a production-ready system but demonstrates the flow described in the specification.
