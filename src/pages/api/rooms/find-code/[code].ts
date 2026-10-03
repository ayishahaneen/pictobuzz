import type { NextApiRequest, NextApiResponse } from 'next';
import { defaultGameEngine } from '@/server/gameEngine';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid room code' });
  }

  const room = defaultGameEngine.findRoomByCode(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  return res.status(200).json({ roomId: room.id, code: room.code });
}
