// Utility functions for interacting with various AI providers.
// These functions do not depend on any UI libraries and can be reused
// in different contexts. They return raw response data from the
// provider REST APIs.

export async function fetchOpenRouterModels(fetchFn = fetch) {
  const url = 'https://openrouter.ai/api/v1/models';
  const res = await fetchFn(url);
  if (!res.ok) throw new Error('Failed to fetch OpenRouter models');
  const data = await res.json();
  const models = (data.data || []).map(m => ({ ...m, base: m.id.split('/').pop() }));
  return models;
}

export async function fetchOpenAiModels(apiKey, fetchFn = fetch) {
  const url = 'https://api.openai.com/v1/models';
  const res = await fetchFn(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error('Failed to fetch OpenAI models');
  const data = await res.json();
  return data.data?.map(m => m.id).sort() || [];
}

export async function fetchGoogleModels(apiKey, fetchFn = fetch) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetchFn(url);
  if (!res.ok) throw new Error('Failed to fetch Google models');
  const data = await res.json();
  return data.models?.map(m => m.name) || [];
}

export async function fetchGoogleVoices(apiKey, fetchFn = fetch) {
  const url = `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`;
  const res = await fetchFn(url);
  if (!res.ok) throw new Error('Failed to fetch Google voices');
  const data = await res.json();
  return data.voices?.map(v => v.name) || [];
}

export async function openRouterChat(model, messages, apiKey = '', fetchFn = fetch) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const body = { model, messages };
  const res = await fetchFn(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Text generation failed');
  return res.json();
}

export async function openAiChat(model, messages, apiKey, fetchFn = fetch) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
  const body = { model, messages };
  const res = await fetchFn(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Text generation failed');
  return res.json();
}

export async function googleGenerateText(model, prompt, apiKey, fetchFn = fetch) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateText?key=${apiKey}`;
  const body = { prompt: { text: prompt } };
  const headers = { 'Content-Type': 'application/json' };
  const res = await fetchFn(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Text generation failed');
  return res.json();
}

export async function openRouterTts(model, input, instructions, apiKey = '', fetchFn = fetch) {
  const url = 'https://openrouter.ai/api/v1/audio/speech';
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const body = { model, input, instructions, voice: 'alloy', response_format: 'mp3' };
  const res = await fetchFn(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('TTS request failed');
  return res.blob();
}

export async function openAiTts(model, input, instructions, apiKey, fetchFn = fetch) {
  const url = 'https://api.openai.com/v1/audio/speech';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
  const body = { model, input, instructions, voice: 'alloy', response_format: 'mp3' };
  const res = await fetchFn(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('TTS request failed');
  return res.blob();
}

export async function openRouterTranscribe(model, fileBlob, prompt = '', apiKey = '', fetchFn = fetch) {
  const form = new FormData();
  form.append('model', model);
  form.append('file', fileBlob);
  if (prompt) form.append('prompt', prompt);
  const url = 'https://openrouter.ai/api/v1/audio/transcriptions';
  const headers = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const res = await fetchFn(url, { method: 'POST', headers, body: form });
  if (!res.ok) throw new Error('Transcription failed');
  return res.json();
}

export async function openAiTranscribe(model, fileBlob, prompt = '', apiKey, fetchFn = fetch) {
  const form = new FormData();
  form.append('model', model);
  form.append('file', fileBlob);
  if (prompt) form.append('prompt', prompt);
  const url = 'https://api.openai.com/v1/audio/transcriptions';
  const headers = { Authorization: `Bearer ${apiKey}` };
  const res = await fetchFn(url, { method: 'POST', headers, body: form });
  if (!res.ok) throw new Error('Transcription failed');
  return res.json();
}

export async function mistralTranscribe(model, fileBlob, prompt = '', apiKey, fetchFn = fetch) {
  const form = new FormData();
  form.append('model', model);
  form.append('file', fileBlob);
  if (prompt) form.append('prompt', prompt);
  const url = 'https://api.mistral.ai/v1/audio/transcriptions';
  const headers = { 'x-api-key': apiKey };
  const res = await fetchFn(url, { method: 'POST', headers, body: form });
  if (!res.ok) throw new Error('Transcription failed');
  return res.json();
}
