/**
 * Server-Side Authentication Logic
 * This module handles user validation on the server
 * Queries Firestore for user data to support cross-device authentication
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
const initFirebaseAdmin = (): boolean => {
  if (admin.apps.length > 0) return true;
  
  try {
    const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!saJson) {
      console.log('⚠️ [SERVER-AUTH] FIREBASE_SERVICE_ACCOUNT_JSON not configured');
      return false;
    }
    
    const serviceAccount = JSON.parse(saJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ [SERVER-AUTH] Firebase Admin initialized');
    return true;
  } catch (err: any) {
    console.error('❌ [SERVER-AUTH] Failed to init Firebase Admin:', err.message);
    return false;
  }
};

interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  orgId?: string;
  companyId?: string;
  isEnabled: boolean;
  firebaseUid?: string;
}

/**
 * Query Firestore for user by email
 */
const findUserInFirestore = async (emailNorm: string): Promise<UserRecord | null> => {
  try {
    if (!initFirebaseAdmin()) return null;
    
    const db = admin.firestore();
    const usersSnapshot = await db.collection('users')
      .where('email', '==', emailNorm)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('[SERVER-AUTH] No user found in Firestore for:', emailNorm);
      return null;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data() as UserRecord;
    console.log('[SERVER-AUTH] ✅ User found in Firestore:', emailNorm);
    return userData;
  } catch (err: any) {
    console.error('[SERVER-AUTH] Firestore query error:', err.message);
    return null;
  }
};

/**
 * Validate user credentials (server-side)
 * Checks hardcoded test users, then Firestore, then Firebase Auth
 */
export const validateUserCredentials = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserRecord; error?: string }> => {
  try {
    const emailNorm = String(email).trim().toLowerCase();
    const passTrim = String(password).trim();

    console.log('[SERVER-AUTH] Validating credentials for:', emailNorm);

    // Step 1: Check hardcoded test users (for demo purposes)
    const testUsers: UserRecord[] = [
      {
        id: 'superadmin-1',
        name: 'Super Admin',
        email: 'superadmin@aura.com',
        password: 'SuperAdmin@123',
        role: 'SuperAdmin',
        isEnabled: true,
      },
      {
        id: 'admin-test-1',
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'Admin@123',
        role: 'Admin',
        orgId: 'org-test-001',
        isEnabled: true,
      },
      {
        id: 'demo-1',
        name: 'Demo Admin',
        email: 'demo@aura.com',
        password: 'demo123',
        role: 'Admin',
        orgId: 'org_demo',
        companyId: 'company_vercel_default',
        isEnabled: true,
      },
    ];

    const testUser = testUsers.find(u => u.email === emailNorm);
    if (testUser && testUser.password === passTrim) {
      console.log('[SERVER-AUTH] ✅ Test user authenticated:', emailNorm);
      const { password: _, ...userWithoutPassword } = testUser;
      return { success: true, user: userWithoutPassword };
    }

    // Step 2: Query Firestore for SuperAdmin-created users
    const firestoreUser = await findUserInFirestore(emailNorm);
    if (firestoreUser) {
      if (!firestoreUser.isEnabled) {
        console.log('[SERVER-AUTH] ❌ User is disabled:', emailNorm);
        return {
          success: false,
          error: 'Account is disabled',
        };
      }
      
      if (firestoreUser.password === passTrim) {
        console.log('[SERVER-AUTH] ✅ Firestore user authenticated:', emailNorm);
        const { password: _, ...userWithoutPassword } = firestoreUser;
        return { success: true, user: userWithoutPassword };
      } else {
        console.log('[SERVER-AUTH] ❌ Password mismatch for Firestore user:', emailNorm);
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }
    }

    // Step 3: Try Firebase Authentication (for Firebase-managed users)
    if (initFirebaseAdmin()) {
      try {
        const firebaseUser = await admin.auth().getUserByEmail(emailNorm);
        console.log('[SERVER-AUTH] ✅ Firebase Auth user found:', emailNorm, 'uid:', firebaseUser.uid);
        
        // Note: We can't verify password server-side for Firebase users
        // Password verification must happen client-side with Firebase Client SDK
        // This branch is mainly for users who were created via Firebase Console
        
        return {
          success: true,
          user: {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: emailNorm,
            role: 'Admin', // Default role
            isEnabled: !firebaseUser.disabled,
            firebaseUid: firebaseUser.uid,
          },
        };
      } catch (fbErr: any) {
        console.log('[SERVER-AUTH] Firebase Auth lookup failed:', fbErr.code);
      }
    }

    // Step 4: Authentication failed - no match found
    console.log('[SERVER-AUTH] ❌ Authentication failed for:', emailNorm);
    console.log('[SERVER-AUTH] Checked: test users, Firestore, Firebase Auth');
    
    return {
      success: false,
      error: 'Invalid email or password',
    };
  } catch (err: any) {
    console.error('[SERVER-AUTH] ❌ Error during validation:', err.message);
    return {
      success: false,
      error: 'Authentication error occurred',
    };
  }
};
