/**
 * Vercel Serverless Function: Sync User to Firestore
 * POST /api/users/sync
 * 
 * Stores/updates user data in Firestore for cross-device authentication
 * Called when SuperAdmin creates or updates a user
 */

import admin from 'firebase-admin';

// Initialize Firestore
const initFirebase = () => {
  if (admin.apps.length > 0) return admin.firestore();
  
  try {
    const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not configured');
    }
    
    const serviceAccount = JSON.parse(saJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    return admin.firestore();
  } catch (err: any) {
    console.error('[API-SYNC-USER] Failed to init Firebase:', err.message);
    throw err;
  }
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user, action = 'upsert' } = req.body;

    if (!user || !user.email || !user.id) {
      return res.status(400).json({
        success: false,
        error: 'User data with id and email is required',
      });
    }

    console.log('[API-SYNC-USER] Syncing user:', user.email, 'action:', action);

    const db = initFirebase();
    const usersCollection = db.collection('users');

    if (action === 'delete') {
      // Delete user
      await usersCollection.doc(user.id).delete();
      console.log('[API-SYNC-USER] ✅ User deleted:', user.email);
      
      return res.status(200).json({
        success: true,
        message: 'User deleted from server',
      });
    } else {
      // Upsert user (create or update)
      const userData = {
        id: user.id,
        name: user.name,
        email: String(user.email).trim().toLowerCase(),
        password: user.password || '', // Store password (should be hashed in production!)
        role: user.role,
        orgId: user.orgId || '',
        companyId: user.companyId || '',
        isEnabled: user.isEnabled !== false,
        firebaseUid: user.firebaseUid || '',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await usersCollection.doc(user.id).set(userData, { merge: true });
      console.log('[API-SYNC-USER] ✅ User synced to Firestore:', user.email);

      return res.status(200).json({
        success: true,
        message: 'User synced to server',
      });
    }
  } catch (err: any) {
    console.error('[API-SYNC-USER] ❌ Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync user to server',
      // Include error details in development mode only
      error: process.env.NODE_ENV !== 'production'
        ? err?.message || String(err)
        : undefined,
    });
  }
}
