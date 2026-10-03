import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, newPassword } = req.body || {};
  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Valid token and new password (min 6 chars) required' });
  }

  const success = await db.resetPasswordWithToken(token, newPassword);
  if (!success) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  return res.status(200).json({ message: 'Password reset successfully! You can now log in.' });
}
