# Evaluate Estonian ASR

This specification describes both a tool (in this section) as well as the execution of the tool (the rest of the sections). The tool could be implemented in something like LangChain. It should run well on a Unix command line but also offer a visual UI to explore all the generated files.

The goal is to evaluate various ASR models on Estonian. We generate multiple input texts with multiple models. We then use a single TTS model because here the goal is not to evaluate TTS, but ASR. We then use multiple ASR models to transcribe the ASR output. Finally, we evaluate each transcription ("hyp") against its original input ("ref") with an evaluation model. In its simplest form the evaluation is done by just calculating the word-error-rate (WER) between the "ref" and the "hyp". We refer to this simple model as "builtin/wer". A more complex semantic evaluation can be done with an LLM (that is instructed to use the WER tool, in addition to providing a semantic summary of the differences).

The following spec lists:

- text generation models and prompts
- text-to-speech models and prompts
- audio transcription models and prompts

Each section lists 1 or more models (given as a list in the Models-section), exactly 1 meta prompt, and 0 or more prompts (given as subsections of the Prompt-section, if present), resulting in all combinations to be generated. The "meta prompt" must be used as the instruction or system prompt, or if these are not supported by the provider, then just attached as a prefix to each prompt.

The system should use the Text-section to generate texts with all the models based on all the prompts. It should then use the Text-to-speech-section to convert all the generated texts into audio, in all ways possible by the given models and prompts. It should then use the Audio-transcription section to convert all generated audio into new texts in all the ways possible by the given models and prompts. Finally, it should evaluate how well the transcription corresponds to the original texts, using all possible evaluation models and their prompts. All the generated files should be stored and made available via a browser-based interface.

The system should also assign a unique ID to all the generated texts and audio. The input text of a single run is referred to as $ref and the output of the audio transcription is $hyp. These IDs should be expanded before the the call to the evaluation model.

## Text

### Models

- openai/gpt-4.1-nano
- openrouter/grok-3-mini

### Meta prompt

Generate a text as input for TTS. That means:

- don't be/use a chat model
- just generate the text without any scaffolding explanations, etc.
- you can format in Markdown and use Elevenlabs-style meta-tags like "[whispers]".

### Prompts

#### Teen

Genereeri dialoog kahe teismelise vahel. Esimene on 80ndade nolk, kelle jutt on täis venekeelseid roppusi. Teine on 2000ndate idufirma asutaja, kes miksib jutu sisse ingliskeelseid sõnu ("pivot", "pitch"), mille eestikeelset tõlget ta ei tea.

#### Weather

Generate a short weather report, with lots of abbreviations.

## Text-to-speech

### Models

- openai/gpt-4o-mini-tts

### Meta prompt

The text is in Estonian, but might contain foreign words, which should be pronounced with an Estonian accent. The text can contain "voice tags" like "[whispers]". Expand all abbreviations before you start speaking, e.g. "25 km/h-ni" should be expanded to "kahekümneviie kilomeetrini tunnis" to make it easier to read.

### Prompts

#### Fast

Read it fast and use some traffic noise in the background.

#### Finnish

Read it with a Finnish accent.

## Audio transcription

### Models

- openai/whisper-1
- openai/gpt-4o-transcribe

### Meta prompt

Transcribe this Estonian audio. Insert punctuation marks. Use normal orthography (numbers as digits, common abbreviations).

## Evaluation

### Models

- builtin/wer
- openrouter/grok-3-mini

### Meta prompt

Perform a semantic comparison of the following text "ref" (correct reference text) and "hyp" (automatic ASR transcription of the audio of "ref"), where "hyp" might contain various ASR mistakes:

```
<ref>$ref</ref>

<hyp>$hyp</hyp>
```

Also use the WER-tool to calculate the word-error-rate. Report the result in the form of JSON with the following fields:

- wer
- text of evaluation
