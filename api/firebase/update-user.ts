/**
 * Vercel Serverless Function: Update Firebase Auth User
 * POST /api/firebase/update-user
 * 
 * This is a server-side API endpoint that uses Firebase Admin SDK.
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
    const { uid, email, password, disabled } = req.body;

    // Input validation
    if (!uid) {
      return res.status(400).json({
        success: false,
        error: 'Firebase UID is required',
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

    console.log('[SERVER] Updating Firebase user:', uid);

    // Build update payload with only provided fields
    const updatePayload: any = {};
    if (email) {
      updatePayload.email = String(email).trim().toLowerCase();
    }
    if (password) {
      updatePayload.password = password;
    }
    if (disabled !== undefined) {
      updatePayload.disabled = disabled;
    }

    // Update user via Firebase Admin
    await admin.auth().updateUser(uid, updatePayload);

    console.log('✅ [SERVER] Firebase user updated:', uid);

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[SERVER] Error updating Firebase user:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Failed to update Firebase user',
      // Include error details in development mode only
      error: process.env.NODE_ENV !== 'production'
        ? err?.message || String(err)
        : undefined,
    });
  }
}
