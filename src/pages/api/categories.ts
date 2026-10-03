import type { NextApiRequest, NextApiResponse } from 'next';
import { WORD_CATEGORIES } from '@/lib/wordBank';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({ categories: WORD_CATEGORIES });
}
