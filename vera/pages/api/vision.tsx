import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || "";
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).end("Method not allowed");
    if (!openai) return res.status(500).json({ error: "OpenAI not configured" });

    const { imageDataUrl, question } = req.body || {};
    if (!imageDataUrl) return res.status(400).json({ error: "Missing image" });

    // Use GPT-4o-mini for fast, low-cost vision analysis
    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are VERA, a gentle, somatically-aware assistant. Describe the emotional, symbolic, and embodied themes in the image. Avoid medical claims."
        },
        {
          role: "user",
          content: [
            { type: "text", text: question || "Interpret the feelings, symbols, colors, and possible nervous-system themes in this image." },
            { type: "image_url", image_url: { url: imageDataUrl } }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const text = r.choices?.[0]?.message?.content || "No interpretation available.";
    res.status(200).json({ text });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "vision_failed" });
  }
}
