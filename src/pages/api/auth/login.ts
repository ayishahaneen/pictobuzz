import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { signToken } from '@/server/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(455).json({ error: 'Method not allowed' });
  }

  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter username/email and password' });
    }

    const user = db.findUserByUsernameOrEmail(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const valid = await db.verifyPassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const token = signToken({ id: user.id, username: user.username });
    return res.status(200).json({ user, token });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Login failed' });
  }
}
