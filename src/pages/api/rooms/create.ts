import type { NextApiRequest, NextApiResponse } from 'next';
import { defaultGameEngine } from '@/server/gameEngine';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hostUser, settings } = req.body || {};
  if (!hostUser || !settings || !settings.name) {
    return res.status(400).json({ error: 'Missing room settings or host details' });
  }

  const room = defaultGameEngine.createRoom(hostUser, settings);
  return res.status(200).json({ room });
}
