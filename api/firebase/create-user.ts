/**
 * Vercel Serverless Function: Create Firebase Auth User
 * POST /api/firebase/create-user
 * 
 * This is a server-side API endpoint that uses Firebase Admin SDK.
 * The Admin SDK CANNOT be imported in client code, so this endpoint
 * provides a safe way for the frontend to create Firebase users.
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only runs on server)
const initAdmin = () => {
  if (admin.apps.length > 0) return true;
  
  try {
    const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saJson) {
      console.log('⚠️ FIREBASE_SERVICE_ACCOUNT_JSON not configured');
      return false;
    }
    
    const serviceAccount = JSON.parse(saJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ [SERVER] Firebase Admin SDK initialized');
    return true;
  } catch (err: any) {
    console.error('❌ [SERVER] Failed to initialize Firebase Admin:', err.message);
    return false;
  }
};

export default async function handler(req: any, res: any) {
  // CORS and method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Initialize Firebase Admin
    const initialized = initAdmin();
    if (!initialized) {
      return res.status(500).json({
        success: false,
        error: 'Firebase Admin SDK not available',
      });
    }

    console.log('[SERVER] Creating Firebase user:', email);

    // Create user via Firebase Admin
    const user = await admin.auth().createUser({
      email: String(email).trim().toLowerCase(),
      password,
      disabled: false,
    });

    console.log('✅ [SERVER] Firebase user created:', email, 'uid=', user.uid);

    return res.status(200).json({
      success: true,
      uid: user.uid,
    });
  } catch (err: any) {
    console.error('[SERVER] Error creating Firebase user:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to create Firebase user',
    });
  }
}
