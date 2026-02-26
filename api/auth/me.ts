/**
 * Vercel Serverless Function: Get Current User
 * GET /api/auth/me
 * 
 * Validates session cookie and returns authenticated user info
 */

import { parse } from 'cookie';
import { verifyToken, getCookieConfig } from './jwt-utils';

export default async function handler(req: any, res: any) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse cookies from request
    const cookies = parse(req.headers.cookie || '');
    const cookieConfig = getCookieConfig();
    const token = cookies[cookieConfig.name];

    if (!token) {
      console.log('[API-ME] No session cookie found');
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Verify JWT token
    const payload = verifyToken(token);

    if (!payload) {
      console.log('[API-ME] Invalid or expired token');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
      });
    }

    console.log('[API-ME] ✅ Valid session for:', payload.email);

    // Return user info from token payload
    return res.status(200).json({
      success: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        orgId: payload.orgId,
        companyId: payload.companyId,
        isEnabled: true, // Assumed from valid token
      },
    });
  } catch (err: any) {
    console.error('[API-ME] ❌ Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
