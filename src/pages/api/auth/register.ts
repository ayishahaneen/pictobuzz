import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { signToken } from '@/server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password, avatar } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await db.createUser(username, email, password, avatar || 'avatar_1');
    const token = signToken({ id: user.id, username: user.username });
    return res.status(200).json({ user, token });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || 'Registration failed' });
  }
}
