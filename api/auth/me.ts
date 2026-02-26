import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const token = cookies.aura_session;

    // ✅ NO TOKEN = NOT LOGGED IN (401, NOT 500)
    if (!token) {
      return res.status(401).json({
        authenticated: false,
        message: 'Not authenticated',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    return res.status(200).json({
      authenticated: true,
      user: decoded,
    });
  } catch (error) {
    console.error('[AUTH ME ERROR]', error);

    // ✅ INVALID / EXPIRED TOKEN = 401
    return res.status(401).json({
      authenticated: false,
      message: 'Invalid or expired session',
    });
  }
}
