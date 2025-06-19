# Estonian Speech Comparison Tool

This repository contains a small proof-of-concept single page application for comparing Estonian text generation, text-to-speech (TTS) and automatic speech recognition (ASR) providers.

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

- Generate Estonian texts via OpenAI API or a built‑in mock mode when no API key is provided.
- Synthesize text to audio using the browser Speech Synthesis API (or mock blobs).
- Transcribe audio back to text (mock mode copies the original text).
- Compute the Word Error Rate (WER) between the generated text and transcription.
- Visual diff view highlighting transcription errors.
- Users can add their own texts, edit generated ones and upload audio files.
- Export results as JSON or CSV and clear all stored data.
- Results are persisted in browser local storage.

This is not a production-ready system but demonstrates the flow described in the specification.
