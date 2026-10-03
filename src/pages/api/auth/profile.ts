import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser } from '@/server/auth';
import { db } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { username, avatar } = req.body || {};
    const updated = await db.updateProfile(user.id, { username, avatar });
    return res.status(200).json({ user: updated });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || 'Update failed' });
  }
}
