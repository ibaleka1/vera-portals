import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const v = process.env.OPENAI_API_KEY;
  // Do NOT return the key; just confirm presence and length
  res.status(200).json({
    present: !!v,
    length: v ? v.length : 0
  });
}
