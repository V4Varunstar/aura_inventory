/**
 * Vercel Serverless Function: Login with JWT Session
 * POST /api/auth/login
 * 
 * Authenticates user and sets HTTP-only session cookie
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { getCookieConfig } from './jwt-utils';
import { validateUserCredentials } from './server-auth-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET missing');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration',
      });
    }
    const jwtSecret = process.env.JWT_SECRET;

    const { email, password } = req.body || {};

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    console.log('[API-LOGIN] Attempting login for:', email);

    // Validate credentials using server-side logic
    const result = await validateUserCredentials(email, password);

    if (!result.success || !result.user) {
      console.log('[API-LOGIN] ❌ Login failed:', result.error);
      return res.status(401).json({
        success: false,
        message: result.error || 'Invalid credentials',
      });
    }

    const user = result.user;
    console.log('[API-LOGIN] ✅ User authenticated:', user.email);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        companyId: user.companyId,
      },
      jwtSecret,
      {
        expiresIn: '7d',
        issuer: 'aura-inventory',
      }
    );

    // Set HTTP-only cookie
    const cookieConfig = getCookieConfig();
    const cookie = serialize(cookieConfig.name, token, cookieConfig.options);
    
    res.setHeader('Set-Cookie', cookie);

    console.log('[API-LOGIN] ✅ Session cookie set for:', user.email);

    // Return user info (without password)
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        companyId: user.companyId,
        isEnabled: user.isEnabled,
      },
    });
  } catch (err: any) {
    console.error('[API-LOGIN] Login handler crashed:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
}
