// api/vera-voice.js
// Vercel Serverless Function that proxies text -> ElevenLabs TTS -> returns audio/mpeg
// Requires env vars on Vercel: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing "text" string in body.' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey || !voiceId) {
      return res
        .status(500)
        .json({ error: 'Voice or API key not configured on the server.' });
    }

    const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    // Call ElevenLabs
    const r = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        // You can tweak these to match your VERA voice vibe
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return res
        .status(r.status)
        .json({ error: 'TTS request failed', detail });
    }

    // Stream back as audio/mpeg
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    return res
      .status(500)
      .json({ error: 'Server error', detail: e?.message || String(e) });
  }
}
