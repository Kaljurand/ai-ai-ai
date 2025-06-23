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

- Generate Estonian texts via OpenAI or Google APIs. A built‑in mock mode is used when no API keys are provided.
- API keys and available models for each provider can be entered in the UI. Model lists are fetched from the APIs.
- Synthesize text to audio using the browser Speech Synthesis API (or mock blobs).
- Transcribe audio back to text. In mock mode the app tries to use the browser's built‑in speech recognition service and falls back to a randomised transcript when unavailable.
- Compute the Word Error Rate (WER) between the generated text and transcription.
- Visual diff view highlighting transcription errors.
- Users can add their own texts, edit generated ones and upload audio files.
- Export results as JSON or CSV and clear all stored data.
- Results are persisted in browser local storage.

This is not a production-ready system but demonstrates the flow described in the specification.
