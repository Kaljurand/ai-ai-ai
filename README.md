# Estonian Speech Comparison Tool

This repository contains a small proof-of-concept single page application for comparing Estonian text generation, text-to-speech (TTS) and automatic speech recognition (ASR) providers.

Open `index.html` in a browser to run the tool. The application is implemented entirely in the browser using React. No build step is required.

## Features

- Generate Estonian texts via OpenAI API or a built‑in mock provider.
- Choose between the browser Speech Synthesis API and a mock provider for TTS.
- Two mock ASR providers are included (`Copy` and `Reverse`).
- Track token usage and estimated cost for text generation sessions.
- View a visual diff between original text and transcription.
- Waveform plots are drawn for generated audio when available.
- Results are persisted in browser local storage.

### Usage

1. Open `index.html` in a modern browser.
2. Select preferred providers for text generation, TTS and ASR from the *Providers* section.
3. If using OpenAI, enter your API key in the *API Key* field.
4. Click **Generate Sample Text** and then **Synthesize** to create audio.
5. Use **Transcribe** to run the selected ASR provider. The results table will show WER and the diff.
6. Token usage and approximate cost are shown at the top of the page and can be reset.

This is not a production-ready system but demonstrates the flow described in the specification.
