import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { signToken } from '@/server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const guestNum = Math.floor(1000 + Math.random() * 9000);
    const username = `Doodler_${guestNum}`;
    const email = `guest_${Date.now()}_${guestNum}@pictobuzz.local`;
    const avatarNum = Math.floor(1 + Math.random() * 8);
    const user = await db.createUser(username, email, 'guestpassword123', `avatar_${avatarNum}`);
    const token = signToken({ id: user.id, username: user.username });
    return res.status(200).json({ user, token });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create guest user' });
  }
}
