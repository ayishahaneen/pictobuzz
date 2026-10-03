import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const token = db.createPasswordResetToken(email);
  if (!token) {
    return res.status(200).json({
      message: 'If an account exists, a reset link has been generated',
      token: 'demo-token'
    });
  }

  return res.status(200).json({
    message: 'Reset token generated successfully',
    token
  });
}
