# Estonian Speech Comparison Tool

This repository contains a small proof-of-concept single page application for comparing Estonian text generation, text-to-speech (TTS) and automatic speech recognition (ASR) providers.

Open `index.html` in a browser to run the tool. The application is implemented entirely in the browser using React.

## Features

- Generate Estonian texts via OpenAI API or a built‑in mock mode when no API key is provided.
- Synthesize text to audio using the browser Speech Synthesis API (or mock blobs).
- Transcribe audio back to text (mock mode copies the original text).
- Compute the Word Error Rate (WER) between the generated text and transcription.
- Results are persisted in browser local storage.

This is not a production-ready system but demonstrates the flow described in the specification.
