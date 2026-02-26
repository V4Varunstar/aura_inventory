/**
 * JWT Session Management Utility (Server-Side Only)
 * Handles token generation and validation for HTTP-only cookie authentication
 */

import jwt from 'jsonwebtoken';

// JWT Secret - should be stored in environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'aura-inventory-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  orgId?: string;
  companyId?: string;
}

/**
 * Generate a JWT token for authenticated user
 */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'aura-inventory',
  });
};

/**
 * Verify and decode a JWT token
 * Returns null if token is invalid or expired
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'aura-inventory',
    }) as TokenPayload;
    return decoded;
  } catch (err: any) {
    console.error('[JWT] Token verification failed:', err.message);
    return null;
  }
};

/**
 * Cookie configuration for session token
 */
export const getCookieConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    name: 'aura_session',
    options: {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    },
  };
};
