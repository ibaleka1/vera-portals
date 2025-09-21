// api/vera-voice.js
// Claude-style: Edge function that returns a Response (works reliably on Vercel)

export const config = { runtime: 'edge' }; // run on Edge

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // read JSON body (Edge-style)
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const text = (body?.text || '').toString().trim();
    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing "text" string in body.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey  = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) {
      return new Response(JSON.stringify({ error: 'Voice or API key not configured on server.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // call ElevenLabs
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
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'TTS request failed', detail }), {
        status: resp.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // stream/return audio as a proper Response
    const audio = await resp.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error', detail: e?.message || String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
