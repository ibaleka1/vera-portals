// api/vera-voice.js
// ElevenLabs TTS proxy -> returns audio/mpeg
// Env vars required on Vercel: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID

async function tts(text, apiKey, voiceId) {
  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.7, style: 0.2, use_speaker_boost: true }
    })
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    const err = new Error('TTS request failed');
    err.status = resp.status;
    err.detail = detail;
    throw err;
  }
  return Buffer.from(await resp.arrayBuffer());
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Method not allowed' }));
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {}
    }
    const text = body && typeof body.text === 'string' ? body.text.trim() : '';

    if (!text) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Missing "text" string in body.' }));
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Voice or API key not configured on server.' }));
    }

    const audio = await tts(text, apiKey, voiceId);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(audio);
  } catch (e) {
    res.statusCode = e.status || 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Server error', detail: e.detail || e.message || String(e) }));
  }
};

// Force Node runtime so Vercel never treats this as an Edge function
module.exports.config = { runtime: 'nodejs18.x' };
