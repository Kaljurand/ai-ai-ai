# Provider REST APIs

This document summarizes the REST endpoints used by the application. All commands are shown as `curl` examples.

## Text Generation

### OpenRouter

```
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_OPENROUTER_KEY' \
  -d '{"model":"gpt-3.5","messages":[{"role":"user","content":"Hello"}]}'
```

### OpenAI

```
curl -X POST https://api.openai.com/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_OPENAI_KEY' \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}'
```

### Google

```
curl -X POST 'https://generativelanguage.googleapis.com/v1beta/models/GEN_MODEL:generateText?key=YOUR_GOOGLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"prompt":{"text":"Hello"}}'
```

## Text-to-Speech

### OpenRouter

```
curl -X POST https://openrouter.ai/api/v1/audio/speech \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_OPENROUTER_KEY' \
  -d '{"model":"tts-model","input":"Hello","instructions":"Read slowly","voice":"alloy","response_format":"mp3"}' --output out.mp3
```

### OpenAI

```
curl -X POST https://api.openai.com/v1/audio/speech \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_OPENAI_KEY' \
  -d '{"model":"tts-model","input":"Hello","instructions":"Read slowly","voice":"alloy","response_format":"mp3"}' --output out.mp3
```

### Google Voices

```
curl -X GET 'https://texttospeech.googleapis.com/v1/voices?key=YOUR_GOOGLE_KEY'
```

## Speech-to-Text

### OpenRouter

```
curl -X POST https://openrouter.ai/api/v1/audio/transcriptions \
  -H 'Authorization: Bearer YOUR_OPENROUTER_KEY' \
  -F model=whisper-model \
  -F file=@audio.wav \
  -F prompt='Optional prompt'
```

### Mistral

```
curl -X POST https://api.mistral.ai/v1/audio/transcriptions \
  -H 'x-api-key: YOUR_MISTRAL_KEY' \
  -F model=voxtral-small-2507 \
  -F file=@audio.wav \
  -F prompt='Optional prompt'
```

### OpenAI

```
curl -X POST https://api.openai.com/v1/audio/transcriptions \
  -H 'Authorization: Bearer YOUR_OPENAI_KEY' \
  -F model=whisper-1 \
  -F file=@audio.wav \
  -F prompt='Optional prompt'
```
