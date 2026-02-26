/**
 * Vercel Serverless Function: Get Current User
 * GET /api/auth/me
 * 
 * Validates session cookie and returns authenticated user info
 * Uses proper HTTP status codes:
 * - 401: No token or invalid token (not an error, just not authenticated)
 * - 200: Valid session, user info returned
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parse } from 'cookie';
import { verifyToken, getCookieConfig } from './jwt-utils';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse cookies from request
    const cookies = parse(req.headers.cookie || '');
    const cookieConfig = getCookieConfig();
    const token = cookies[cookieConfig.name];

    // 🔴 FIX #1: No token → NOT an error (return 401 with authenticated: false)
    if (!token) {
      console.log('[API-ME] No session cookie found');
      return res.status(401).json({
        authenticated: false,
        message: 'Not authenticated',
      });
    }

    // Verify JWT token
    const payload = verifyToken(token);

    // 🔴 FIX #2: Invalid token → 401 (not 500)
    if (!payload) {
      console.log('[API-ME] Invalid or expired token');
      return res.status(401).json({
        authenticated: false,
        message: 'Invalid or expired session',
      });
    }

    console.log('[API-ME] ✅ Valid session for:', payload.email);

    // Return user info from token payload
    return res.status(200).json({
      authenticated: true,
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
    console.error('[API-ME] Error:', err.message);
    // Token errors should return 401, not 500
    return res.status(401).json({
      authenticated: false,
      message: 'Invalid or expired session',
    });
  }
}
