import type { NextApiRequest, NextApiResponse } from 'next';
import { defaultGameEngine } from '@/server/gameEngine';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid room ID' });
  }

  const room = defaultGameEngine.getRoom(id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  return res.status(200).json({
    id: room.id,
    code: room.code,
    name: room.settings.name,
    status: room.status,
    playersCount: room.players.length,
    maxPlayers: room.settings.maxPlayers,
    rounds: room.settings.rounds,
    drawDuration: room.settings.drawDuration,
    category: room.settings.category,
    difficulty: room.settings.difficulty
  });
}
