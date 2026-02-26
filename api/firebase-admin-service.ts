/**
 * Server-side Firebase Admin Service
 * This file ONLY runs on Vercel serverless backend - never bundled into client code
 * Handles Firebase Auth operations that require the Admin SDK
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK - only runs on server
const initFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return;
  }
  
  try {
    const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saJson) {
      console.log('⚠️ FIREBASE_SERVICE_ACCOUNT_JSON not set - Firebase Admin unavailable');
      return false;
    }

    const serviceAccount = JSON.parse(saJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized on server');
    return true;
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err);
    return false;
  }
};

/**
 * Create a Firebase Auth user (server-side operation)
 */
export const createFirebaseUserServer = async (
  email: string,
  password: string
): Promise<{ success: boolean; uid?: string; error?: string }> => {
  try {
    const initialized = initFirebaseAdmin();
    if (!initialized || admin.apps.length === 0) {
      return {
        success: false,
        error: 'Firebase Admin SDK not initialized',
      };
    }

    const user = await admin.auth().createUser({
      email: String(email).trim().toLowerCase(),
      password,
      disabled: false,
    });

    console.log('✅ [SERVER] Firebase user created:', email, 'uid=', user.uid);
    return {
      success: true,
      uid: user.uid,
    };
  } catch (err: any) {
    console.error('❌ [SERVER] Failed to create Firebase user:', err.message);
    return {
      success: false,
      error: err.message || 'Failed to create Firebase user',
    };
  }
};

/**
 * Update a Firebase Auth user (server-side operation)
 */
export const updateFirebaseUserServer = async (
  uid: string,
  updates: { email?: string; password?: string; disabled?: boolean }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const initialized = initFirebaseAdmin();
    if (!initialized || admin.apps.length === 0) {
      return {
        success: false,
        error: 'Firebase Admin SDK not initialized',
      };
    }

    // Build update payload - only include provided fields
    const updatePayload: any = {};
    if (updates.email) {
      updatePayload.email = String(updates.email).trim().toLowerCase();
    }
    if (updates.password) {
      updatePayload.password = updates.password;
    }
    if (updates.disabled !== undefined) {
      updatePayload.disabled = updates.disabled;
    }

    await admin.auth().updateUser(uid, updatePayload);

    console.log('✅ [SERVER] Firebase user updated:', uid);
    return { success: true };
  } catch (err: any) {
    console.error('❌ [SERVER] Failed to update Firebase user:', err.message);
    return {
      success: false,
      error: err.message || 'Failed to update Firebase user',
    };
  }
};
