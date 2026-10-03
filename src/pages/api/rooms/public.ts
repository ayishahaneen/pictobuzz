import type { NextApiRequest, NextApiResponse } from 'next';
import { defaultGameEngine } from '@/server/gameEngine';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rooms = defaultGameEngine.getPublicRooms().map(r => ({
    id: r.id,
    code: r.code,
    name: r.settings.name,
    playersCount: r.players.length,
    maxPlayers: r.settings.maxPlayers,
    difficulty: r.settings.difficulty,
    category: r.settings.category,
    rounds: r.settings.rounds
  }));

  return res.status(200).json({ rooms });
}
