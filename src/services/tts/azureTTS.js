// Azure Cognitive Services Speech: Text-to-Speech (client-side demo only)
// Note: For production, proxy these requests via your server to avoid exposing API keys.

const KEY = process.env.REACT_APP_AZURE_SPEECH_KEY;
const REGION = process.env.REACT_APP_AZURE_SPEECH_REGION; // e.g. "eastus"

export function isAzureConfigured() {
  return Boolean(KEY && REGION);
}

export async function listAzureVoices() {
  if (!isAzureConfigured()) return [];
  const url = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
  const res = await fetch(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
    },
  });
  if (!res.ok) throw new Error(`Azure voices list failed: ${res.status}`);
  const list = await res.json();
  // Typical fields: Name, DisplayName/LocalName, ShortName, Gender, Locale, StyleList, SampleRateHertz, VoiceType
  return Array.isArray(list) ? list : [];
}

function toPercentString(mult, maxPct = 50) {
  // Convert multiplier around 1.0 to +/-percent string; clamp +-maxPct
  const pct = Math.max(-maxPct, Math.min(maxPct, Math.round((mult - 1) * 100)));
  if (pct === 0) return '0%';
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

export async function synthesizeAzureTTS(text, shortName, { rate = 1.0, pitch = 1.0, volume = 1.0 } = {}) {
  if (!isAzureConfigured()) throw new Error('Azure TTS not configured');
  const url = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const prosodyRate = toPercentString(rate, 75);
  const prosodyPitch = toPercentString(pitch, 75);
  const ssml = `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${shortName}">
    <prosody rate="${prosodyRate}" pitch="${prosodyPitch}">${escapeXml(text)}</prosody>
  </voice>
</speak>`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`Azure synth failed: ${res.status}`);
  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);
  return { url: audioUrl, dispose: () => URL.revokeObjectURL(audioUrl), volume: Math.max(0, Math.min(1, volume)) };
}

function escapeXml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
