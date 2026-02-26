/**
 * Server-Side Authentication Logic
 * This module handles user validation on the server
 * 
 * IMPORTANT: For production, user data should come from a database.
 * Currently uses environment variables for demo purposes.
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
 * Load users from environment variable (temporary solution)
 * In production, this should query a real database (Firestore, PostgreSQL, etc.)
 */
const loadUsersFromEnvironment = (): UserRecord[] => {
  try {
    const usersJson = process.env.SUPERADMIN_USERS;
    if (!usersJson) {
      console.log('[SERVER-AUTH] No SUPERADMIN_USERS environment variable');
      return [];
    }
    
    const users = JSON.parse(usersJson);
    console.log('[SERVER-AUTH] Loaded', users.length, 'users from environment');
    return users;
  } catch (err) {
    console.error('[SERVER-AUTH] Failed to parse SUPERADMIN_USERS:', err);
    return [];
  }
};

/**
 * Validate user credentials (server-side)
 * This replicates the core auth logic from mockLogin but runs on the server
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

    // Step 2: Load SuperAdmin created users from environment
    const dynamicUsers = loadUsersFromEnvironment();
    const allUsers = [...testUsers, ...dynamicUsers];

    console.log('[SERVER-AUTH] Checking against', allUsers.length, 'users');

    // Find user by email
    const foundUser = allUsers.find(u => u.email === emailNorm);

    if (foundUser && foundUser.password === passTrim) {
      console.log('[SERVER-AUTH] ✅ User authenticated:', emailNorm);
      const { password: _, ...userWithoutPassword } = foundUser;
      return { success: true, user: userWithoutPassword };
    }

    // Step 3: Try Firebase Authentication (if no local match)
    if (initFirebaseAdmin()) {
      try {
        // Verify Firebase user exists
        const firebaseUser = await admin.auth().getUserByEmail(emailNorm);
        console.log('[SERVER-AUTH] ✅ Firebase user found:', emailNorm, 'uid:', firebaseUser.uid);
        
        // For Firebase-managed users, we can't verify password server-side
        // The client-side Firebase SDK should verify the password first
        // For now, we'll trust that Firebase authentication happened on the client
        
        // Check if user is in our user list (to get role and org info)
        const userRecord = allUsers.find(u => u.email === emailNorm || u.firebaseUid === firebaseUser.uid);
        
        if (userRecord) {
          console.log('[SERVER-AUTH] ✅ Firebase user with local record');
          const { password: _, ...userWithoutPassword } = userRecord;
          return { success: true, user: userWithoutPassword };
        }
        
        // Return basic Firebase user if no local record
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
        console.log('[SERVER-AUTH] Firebase lookup failed:', fbErr.code);
      }
    }

    // Step 4: Authentication failed
    console.log('[SERVER-AUTH] ❌ Authentication failed for:', emailNorm);
    console.log('[SERVER-AUTH] Available users:', allUsers.map(u => u.email));
    
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
