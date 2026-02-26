/**
 * Vercel Serverless Function: Logout
 * POST /api/auth/logout
 * 
 * Clears session cookie to log user out
 */

import { serialize } from 'cookie';
import { getCookieConfig } from './jwt-utils';

export default async function handler(req: any, res: any) {
  // Allow POST or GET for logout
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API-LOGOUT] Logging out user');

    // Clear the session cookie by setting it with maxAge: 0
    const cookieConfig = getCookieConfig();
    const cookie = serialize(cookieConfig.name, '', {
      ...cookieConfig.options,
      maxAge: 0, // Expire immediately
    });

    res.setHeader('Set-Cookie', cookie);

    console.log('[API-LOGOUT] ✅ Session cookie cleared');

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err: any) {
    console.error('[API-LOGOUT] ❌ Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
      // Include error details in development mode only
      error: process.env.NODE_ENV !== 'production'
        ? err?.message || String(err)
        : undefined,
    });
  }
}
