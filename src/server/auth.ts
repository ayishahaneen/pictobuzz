import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';
import { db, UserRecord } from './db';

export const JWT_SECRET = process.env.JWT_SECRET || 'picto_buzz_super_secret_key_2026';

export interface DecodedToken {
  id: string;
  username: string;
}

export function signToken(user: { id: string; username: string }): string {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}

export function getAuthenticatedUser(req: NextApiRequest): UserRecord | null {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return db.findUserById(decoded.id);
}
