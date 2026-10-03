import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
  const leaderboard = db.getLeaderboard(limit);
  return res.status(200).json({ leaderboard });
}
