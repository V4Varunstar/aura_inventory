import {
  User,
  Role,
  Product,
  ProductCategory,
  ProductUnit,
  Warehouse,
  Inward,
  Outward,
  Adjustment,
  ActivityLog,
  ActivityType,
  OutwardDestination,
  InwardSource,
} from '../types';
import { getSources } from './sourceService';

// Performance optimization: Cache management
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const cache = new PerformanceCache();

// Auto cleanup every 10 minutes
setInterval(() => cache.cleanup(), 10 * 60 * 1000);

// --- MOCK DATABASE ---
const users: User[] = [
  { id: '1', name: 'Super Admin', email: 'superadmin@aura.com', role: 'SuperAdmin' as any, isEnabled: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Test Admin', email: 'admin@test.com', role: 'Admin' as Role, orgId: 'org-test-001', isEnabled: true, createdAt: new Date(), updatedAt: new Date() },
];

// Optimized localStorage operations with batching
class StorageManager {
  private batchedWrites = new Map<string, any>();
  private writeTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 100; // 100ms

  batchWrite(key: string, data: any): void {
    this.batchedWrites.set(key, data);
    
    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
    }
    
    this.writeTimeout = setTimeout(() => {
      this.flushWrites();
    }, this.BATCH_DELAY);
  }

  private flushWrites(): void {
    for (const [key, data] of this.batchedWrites.entries()) {
      try {
        localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
      } catch (error) {
        console.error(`Failed to write to localStorage key: ${key}`, error);
      }
    }
    this.batchedWrites.clear();
    this.writeTimeout = null;
  }

  read<T>(key: string, defaultValue: T): T {
    const cached = cache.get<T>(`storage_${key}`);
    if (cached !== null) return cached;

    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      cache.set(`storage_${key}`, parsed, 2 * 60 * 1000); // Cache for 2 minutes
      return parsed;
    } catch (error) {
      console.error(`Failed to read from localStorage key: ${key}`, error);
      return defaultValue;
    }
  }

  write(key: string, data: any): void {
    cache.set(`storage_${key}`, data, 2 * 60 * 1000);
    this.batchWrite(key, data);
  }

  clearCache(): void {
    cache.clear();
  }
}

const storage = new StorageManager();

// Add a robust initialization function for Vercel production
const initializeVercelProduction = () => {
  try {
    // Ensure SuperAdmin always exists in production
    const superAdminExists = users.find(u => u.email === 'superadmin@aura.com');
    if (!superAdminExists) {
      users.push({
        id: 'superadmin-production',
        name: 'Super Admin',
        email: 'superadmin@aura.com',
        role: 'SuperAdmin' as any,
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('🔧 Added SuperAdmin for Vercel production');
    }

    // Initialize test data if in debug mode or if no data exists
    const hasCompanies = storage.read('superadmin_companies', []).length > 0;
    const hasUsers = storage.read('superadmin_users', []).length > 0;
    
    if (!hasCompanies && !hasUsers && window.location.hostname.includes('vercel.app')) {
      console.log('🚀 Initializing default test data for Vercel production...');
      
      // Create a test company
      const testCompany = {
        id: 'company_vercel_default',
        name: 'Demo Company',
        email: 'demo@aura.com',
        phone: '1234567890',
        plan: 'Pro',
        subscriptionStatus: 'active',
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
        loginAllowed: true,
        orgId: 'org_demo',
        isActive: true,
        limits: { maxUsers: 100, maxWarehouses: 20, maxProducts: 5000 },
        usage: { users: 1, warehouses: 0, products: 0 },
        ownerId: 'user_demo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create a test user
      const testUser = {
        id: 'user_demo',
        name: 'Demo Admin',
        email: 'demo@aura.com',
        password: 'demo123',
        role: 'Admin',
        orgId: 'org_demo',
        companyId: 'company_vercel_default',
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      storage.write('superadmin_companies', [testCompany]);
      storage.write('superadmin_users', [testUser]);
      
      console.log('✅ Default test data initialized for Vercel');
    }
  } catch (error) {
    console.error('Error initializing Vercel production data:', error);
  }
};

// Run Vercel initialization
initializeVercelProduction();

// Function to add user to global registry (called from Super Admin service)
export const addUserToGlobalRegistry = (userData: {
  id: string;
  name: string;
  email: string;
  role: Role;
  orgId: string;
  companyId?: string;
  isEnabled: boolean;
  password: string;
}) => {
  // Check if user already exists
  const existingUser = users.find(u => u.email === userData.email);
  if (!existingUser) {
    const newUser: User & { password?: string } = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      orgId: userData.orgId,
      companyId: userData.companyId,
      isEnabled: userData.isEnabled,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: userData.password // Store password for validation
    };
    users.push(newUser);
    console.log('✅ Added user to global registry:', userData.email);
  }
};

// Initialize users from localStorage on app start (optimized with caching)
const initializeUsersFromStorage = () => {
  try {
    const superAdminUsers = storage.read('superadmin_users', []);
    if (superAdminUsers.length === 0) return;
    
    // Batch process user additions
    const batchSize = 50;
    for (let i = 0; i < superAdminUsers.length; i += batchSize) {
      const batch = superAdminUsers.slice(i, i + batchSize);
      batch.forEach((userData: any) => {
        addUserToGlobalRegistry({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          orgId: userData.orgId,
          isEnabled: userData.isEnabled,
          password: userData.password
        });
      });
    }
    console.log(`✅ Initialized ${superAdminUsers.length} users from storage`);
  } catch (error) {
    console.error('Error initializing users from storage:', error);
  }
};

// Call initialization on module load
initializeUsersFromStorage();

// Optimized debug function with caching
export const debugUserStorage = () => {
  console.log('=== USER STORAGE DEBUG ===');
  console.log('Global registry users:', users);
  
  try {
    const localStorageUsers = storage.read('superadmin_users', []);
    console.log('localStorage users:', localStorageUsers);
    
    const companies = storage.read('superadmin_companies', []);
    console.log('localStorage companies:', companies);
  } catch (error) {
    console.error('Error reading localStorage:', error);
  }
  console.log('=========================');
};

// Auto-run debug on load
setTimeout(() => {
  debugUserStorage();
}, 1000);

const products: Product[] = [];

const warehouses: Warehouse[] = [];

const activities: ActivityLog[] = [];


let currentUser: User | null = null;
const SESSION_KEY = 'aura_inventory_user';
const SESSION_BACKUP_KEY = 'aura_inventory_user_backup';
const STORAGE_KEYS = {
  PRODUCTS: 'aura_inventory_products',
  WAREHOUSES: 'aura_inventory_warehouses',
  INWARD: 'aura_inventory_inward',
  OUTWARD: 'aura_inventory_outward',
  ADJUSTMENTS: 'aura_inventory_adjustments',
  ACTIVITIES: 'aura_inventory_activities',
  CATEGORIES: 'aura_inventory_categories',
  COURIER_PARTNERS: 'aura_inventory_courier_partners',
};

// Session protection - prevent accidental clearing
const backupSession = () => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      localStorage.setItem(SESSION_BACKUP_KEY, session);
    }
  } catch (error) {
    console.error('Failed to backup session:', error);
  }
};

// Restore session from backup if main session is lost
const restoreSessionFromBackup = (): boolean => {
  try {
    const mainSession = localStorage.getItem(SESSION_KEY);
    const backupSession = localStorage.getItem(SESSION_BACKUP_KEY);
    
    if (!mainSession && backupSession) {
      console.log('🔄 Restoring session from backup');
      localStorage.setItem(SESSION_KEY, backupSession);
      return true;
    }
  } catch (error) {
    console.error('Failed to restore session from backup:', error);
  }
  return false;
};

// Backup session periodically (every 5 seconds)
setInterval(backupSession, 5000);

// Also backup session before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    console.log('📤 Page unloading - backing up session...');
    backupSession();
  });
  
  // Check and restore session on page load
  window.addEventListener('load', () => {
    console.log('📥 Page loaded - checking session...');
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      console.log('✅ Session found on page load');
      backupSession();
    } else {
      console.log('⚠️ No session on page load - attempting restore from backup...');
      if (restoreSessionFromBackup()) {
        console.log('✅ Session restored from backup!');
      }
    }
  });
  
  // Listen for storage events to detect if session is cleared by another tab
  window.addEventListener('storage', (e) => {
    if (e.key === SESSION_KEY && e.newValue === null && e.oldValue !== null) {
      console.log('🚨 Session was cleared - attempting to restore from backup...');
      if (restoreSessionFromBackup()) {
        console.log('✅ Session restored after being cleared!');
        // Reload to re-authenticate
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }
  });
}

// Clean up corrupted outward data on load
const cleanCorruptedOutwardData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.OUTWARD);
        if (stored) {
            const records = JSON.parse(stored);
            let hasCorruptedData = false;
            
            const cleanedRecords = records.map((record: any) => {
                // Fix corrupted destination fields with long IDs
                if (record.destination && record.destination.startsWith('src_') && record.destination.length > 20) {
                    hasCorruptedData = true;
                    console.log('🔧 Cleaning corrupted destination:', record.destination);
                    
                    // Try to map back to proper names
                    if (record.destination.toLowerCase().includes('meesho')) {
                        record.destination = 'Meesho';
                    } else if (record.destination.toLowerCase().includes('amazon')) {
                        record.destination = 'Amazon FBA';
                    } else if (record.destination.toLowerCase().includes('flipkart')) {
                        record.destination = 'Flipkart';
                    } else if (record.destination.toLowerCase().includes('myntra')) {
                        record.destination = 'Myntra';
                    } else {
                        record.destination = 'Amazon FBA'; // Default fallback
                    }
                    console.log('✅ Fixed to:', record.destination);
                }
                return record;
            });
            
            // Only update if we found corrupted data
            if (hasCorruptedData) {
                localStorage.setItem(STORAGE_KEYS.OUTWARD, JSON.stringify(cleanedRecords));
                console.log('🎯 Successfully cleaned corrupted outward data!');
            }
        }
    } catch (error) {
        console.error('❌ Error cleaning outward data:', error);
    }
};

// Clear all localStorage data for fresh start (DISABLED - causes login issues)
const clearAllStorageData = () => {
    // COMMENTED OUT TO PRESERVE SUPERADMIN DATA
    // This was causing login issues for users created through SuperAdmin
    console.log('🔧 clearAllStorageData disabled to preserve SuperAdmin users');
    /* 
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('superadmin_companies');
        localStorage.removeItem('superadmin_users');
        console.log('🧹 Cleared all localStorage data for fresh deployment');
    } catch (error) {
        console.error('❌ Error clearing localStorage:', error);
    }
    */
};

// Run cleanup selectively - only clean corrupted data, not user data
// clearAllStorageData(); // DISABLED - was causing login issues
cleanCorruptedOutwardData();

// Helper functions for localStorage persistence
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

type SuperAdminStoredUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  orgId: string;
  companyId?: string;
  isEnabled?: boolean;
  active?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type SuperAdminStoredCompany = {
  id: string;
  name: string;
  orgId: string;
  isActive?: boolean;
  loginAllowed?: boolean;
  subscriptionStatus?: string;
  validFrom?: string | Date;
  validTo?: string | Date;
};

const parseDateLike = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
};

const getStoredSuperAdminUsers = (): SuperAdminStoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem('superadmin_users') || '[]');
  } catch {
    return [];
  }
};

const getStoredSuperAdminCompanies = (): SuperAdminStoredCompany[] => {
  try {
    return JSON.parse(localStorage.getItem('superadmin_companies') || '[]');
  } catch {
    return [];
  }
};

const findCompanyForUser = (
  companies: SuperAdminStoredCompany[],
  user: { companyId?: string; orgId?: string }
): SuperAdminStoredCompany | null => {
  if (user.companyId) {
    const byId = companies.find(c => c.id === user.companyId);
    if (byId) return byId;
  }
  if (user.orgId) {
    const byOrg = companies.find(c => c.orgId === user.orgId);
    if (byOrg) return byOrg;
  }
  return null;
};

const validateCompanyAccess = (
  company: SuperAdminStoredCompany,
  now: Date
): { ok: true } | { ok: false; reason: string } => {
  if (company.isActive === false) {
    return { ok: false, reason: 'Your company account is disabled. Please contact support.' };
  }

  if (company.loginAllowed === false) {
    return { ok: false, reason: 'Login is currently disabled for your company. Please contact support.' };
  }

  // Only treat explicitly expired/inactive as blocked; allow other values for backward compatibility.
  const status = (company.subscriptionStatus || '').toLowerCase();
  if (status === 'expired' || status === 'inactive' || status === 'suspended') {
    return { ok: false, reason: 'Your company subscription is not active. Please contact support.' };
  }

  const validFrom = parseDateLike(company.validFrom);
  const validTo = parseDateLike(company.validTo);

  if (validFrom && now.getTime() < validFrom.getTime()) {
    return { ok: false, reason: 'Your company access has not started yet. Please contact support.' };
  }

  if (validTo && now.getTime() > validTo.getTime()) {
    return { ok: false, reason: 'Your company access has expired. Please contact support.' };
  }

  return { ok: true };
};

// --- MOCK AUTH FUNCTIONS ---
export const mockLogin = (email: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('🔐 mockLogin called for:', email);

      const now = new Date();
      const isDevHost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local');
      
      // ALWAYS sync users from localStorage first (critical for incognito mode)
      let foundUser = null;
      try {
        const superAdminUsers = getStoredSuperAdminUsers();
        console.log('📋 Found SuperAdmin users in localStorage:', superAdminUsers.length);
        
        // Sync each user to global registry
        superAdminUsers.forEach((userData: any) => {
          const existingUser = users.find(u => u.email === userData.email);
          if (!existingUser) {
            console.log('🔄 Syncing user to global registry:', userData.email);
            addUserToGlobalRegistry({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              orgId: userData.orgId,
              companyId: userData.companyId,
              isEnabled: userData.isEnabled,
              password: userData.password
            });
          }
        });
        
        // Check if the login email is a SuperAdmin user
        const superAdminUser = superAdminUsers.find((u: any) => u.email === email);
        if (superAdminUser) {
          console.log('🎯 Found user in SuperAdmin users:', email);
          foundUser = {
            id: superAdminUser.id,
            name: superAdminUser.name,
            email: superAdminUser.email,
            role: superAdminUser.role,
            orgId: superAdminUser.orgId,
            companyId: superAdminUser.companyId,
            isEnabled: superAdminUser.isEnabled,
            createdAt: new Date(superAdminUser.createdAt),
            updatedAt: new Date(superAdminUser.updatedAt)
          };
        }
      } catch (error) {
        console.error('❌ Error syncing users:', error);
      }

      // If not found in SuperAdmin users, only allow a tiny set of dev/test accounts.
      if (!foundUser) {
        const allowList = new Set<string>(['superadmin@aura.com']);
        if (isDevHost) {
          allowList.add('admin@test.com');
          allowList.add('Test@orgatre.com');
        }

        if (allowList.has(email)) {
          foundUser = users.find(u => u.email === email) || null;
          console.log('🧪 Allowlisted dev user:', email, foundUser ? 'FOUND' : 'NOT FOUND');
        } else {
          console.log('❌ Login blocked: user not created by Super Admin:', email);
          reject(new Error('User not found. Please contact Super Admin to create your account.'));
          return;
        }
      }
      
      // Password validation
      let validPassword = false;
      
      // Check built-in test users first
      if (email === 'Test@orgatre.com' && pass === 'Test@1234') {
        validPassword = true;
      } else if (email === 'superadmin@aura.com' && pass === 'SuperAdmin@123') {
        validPassword = true;
      } else if (email === 'admin@test.com' && pass === 'Admin@123') {
        validPassword = true;
      } else {
        // Check SuperAdmin created users password
        try {
          const superAdminUsers = getStoredSuperAdminUsers();
          const superAdminUser = superAdminUsers.find((u: any) => u.email === email);
          if (superAdminUser && superAdminUser.password && superAdminUser.password === pass) {
            validPassword = true;
            console.log('✅ Password validated against SuperAdmin user');
          }
        } catch (error) {
          console.error('❌ Error checking SuperAdmin user password:', error);
        }
        
        // Also check global registry users
        if (!validPassword) {
          const registryUser = users.find(u => u.email === email) as any;
          if (registryUser && registryUser.password === pass) {
            validPassword = true;
            console.log('✅ Password validated against global registry');
          }
        }
      }

      // Company validation for SuperAdmin created users
      if (foundUser && foundUser.role !== ('SuperAdmin' as any) && validPassword) {
        try {
          const superAdminCompanies = getStoredSuperAdminCompanies();
          const userCompany = findCompanyForUser(superAdminCompanies, foundUser as any);

          if (!userCompany) {
            console.log('❌ Company not found for user:', foundUser.email);
            reject(new Error('Company not found for this user. Please contact Super Admin.'));
            return;
          }

          console.log('🏢 Found user company:', userCompany.name);
          const companyAccess = validateCompanyAccess(userCompany, now);
          if (companyAccess.ok === false) {
            console.log('❌ Company access blocked:', companyAccess.reason);
            reject(new Error(companyAccess.reason));
            return;
          }

          console.log('✅ Company validation passed (status + validity window)');
        } catch (error) {
          console.error('❌ Error validating company status:', error);
          reject(new Error('Unable to validate company access. Please try again.'));
          return;
        }
      }
      
      // Final validation and login
      if (foundUser && validPassword) {
        if (!foundUser.isEnabled) {
            console.log('❌ User account disabled');
            reject(new Error("Your account is disabled. Please contact an administrator."));
        } else {
            console.log('✅ Login successful for:', foundUser.email);
            console.log('🔐 Setting session for user:', foundUser.email);
            currentUser = foundUser;
            
            // Ensure session is stored with proper structure
            const sessionData = JSON.stringify(foundUser);
            localStorage.setItem(SESSION_KEY, sessionData);
            
            // Create session backup immediately
            backupSession();
            
            // Verify session was saved correctly
            const savedSession = localStorage.getItem(SESSION_KEY);
            if (!savedSession || savedSession !== sessionData) {
                console.error('❌ Failed to save session to localStorage');
                reject(new Error('Failed to save login session. Please try again.'));
                return;
            }
            
            console.log('✅ Session established and verified for:', foundUser.email);
            console.log('📦 Session data stored:', {
                email: foundUser.email,
                role: foundUser.role,
                orgId: foundUser.orgId,
                size: sessionData.length + ' bytes',
                backupCreated: true
            });
            resolve(foundUser);
        }
      } else {
        console.log('❌ Login failed for:', email, { foundUser: !!foundUser, validPassword });
        reject(new Error("Invalid email or password"));
      }
    }, 1000);
  });
};

export const mockLogout = (): Promise<void> => {
    return new Promise(resolve => {
        // Only clear session, NOT products or other data
        const wasLoggedIn = currentUser?.email;
        currentUser = null;
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_BACKUP_KEY); // Also clear backup on explicit logout
        console.log('🚪 Logout:', wasLoggedIn, '- Session and backup cleared, all data preserved in localStorage');
        resolve();
    });
}

export const mockFetchUser = (): Promise<User> => {
    return new Promise((resolve, reject) => {
        try {
            let userJson = localStorage.getItem(SESSION_KEY);
            
            // Try to restore from backup if main session is missing
            if (!userJson) {
                console.log('⚠️ Main session not found, attempting restore from backup...');
                if (restoreSessionFromBackup()) {
                    userJson = localStorage.getItem(SESSION_KEY);
                    console.log('✅ Session restored from backup successfully');
                }
            }
            
            console.log('🔍 Checking session... Key present:', !!userJson);
            
            if (!userJson) {
                console.log('ℹ️ No active session found in localStorage');
                reject(new Error('No active session'));
                return;
            }

            // Try to parse the user data
            let user;
            try {
                user = JSON.parse(userJson);
            } catch (parseError) {
                console.error('❌ Failed to parse user session data:', parseError);
                // Clear corrupted session
                localStorage.removeItem(SESSION_KEY);
                reject(new Error('Invalid session data'));
                return;
            }

            // Validate user object has required fields
            if (!user || !user.email || !user.id || !user.role) {
                console.error('❌ Invalid user session structure:', user);
                localStorage.removeItem(SESSION_KEY);
                reject(new Error('Invalid session structure'));
                return;
            }

            // Validate user/company status (be tolerant on refresh).
            // NOTE: This app is localStorage-backed; the in-memory registry can be out of sync during reload.
            // Only force-logout if we can prove the user/company is disabled.
            const superAdminUsers = getStoredSuperAdminUsers();
            const superAdminCompanies = getStoredSuperAdminCompanies();

            // SuperAdmin session bypasses tenant checks
            if (user.role === 'SuperAdmin') {
              currentUser = user;
              backupSession();
              console.log('✅ SuperAdmin session restored successfully:', user.email);
              resolve(currentUser as User);
              return;
            }

            const registryUser = users.find(u => u.email === user.email) as any;
            const storedUser = superAdminUsers.find((u: any) => u.email === user.email) as SuperAdminStoredUser | undefined;

            // Enforce: user must exist in SuperAdmin-created users
            if (!storedUser) {
              console.error('❌ Session user not present in SuperAdmin users:', user.email);
              localStorage.removeItem(SESSION_KEY);
              reject(new Error('User not found. Please login again.'));
              return;
            }

            const isExplicitlyDisabled =
              (registryUser && registryUser.isEnabled === false) ||
              (storedUser && storedUser.isEnabled === false) ||
              (storedUser && storedUser.active === false);

            if (isExplicitlyDisabled) {
                console.error('❌ User is disabled:', user.email);
                localStorage.removeItem(SESSION_KEY);
                reject(new Error('Your account is disabled. Please contact an administrator.'));
                return;
            }

            const company = findCompanyForUser(superAdminCompanies, storedUser);
            if (!company) {
              console.error('❌ Company not found for session user:', user.email);
              localStorage.removeItem(SESSION_KEY);
              reject(new Error('Company not found for this user. Please contact Super Admin.'));
              return;
            }

            const access = validateCompanyAccess(company, new Date());
            if (access.ok === false) {
              console.error('❌ Company access blocked for session user:', user.email, access.reason);
              localStorage.removeItem(SESSION_KEY);
              reject(new Error(access.reason));
              return;
            }

            // Normalize session org/company scope from authoritative stored user
            user.orgId = storedUser.orgId;
            user.companyId = storedUser.companyId;

            // Session is valid, restore it and create backup
            currentUser = user;
            backupSession(); // Create/update backup
            console.log('✅ Session restored successfully:', user.email, 'role:', user.role, 'orgId:', user.orgId);
            resolve(currentUser as User);
            
        } catch (error) {
            console.error('❌ Unexpected error fetching user session:', error);
            // Don't clear session on unexpected errors - let user retry
            reject(error);
        }
    });
};


// --- MOCK API FUNCTIONS ---
const simulateApi = <T,>(data: T, delay = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));
};

// Users
export const getUsers = () => simulateApi(users);
export const addUser = (data: Partial<User>) => {
    const newUser: User = {
        id: `user_${Date.now()}`,
        name: data.name || 'New User',
        email: data.email || '',
        role: data.role || Role.Viewer,
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    users.push(newUser);
    return simulateApi(newUser);
};
export const updateUser = (id: string, data: Partial<User>) => {
    const userIndex = users.findIndex(u => u.id === id);
    if(userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...data };
        return simulateApi(users[userIndex]);
    }
    return Promise.reject('User not found');
};

export const updatePassword = (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
    const user = users.find(u => u.id === userId);
    if (!user) {
        return Promise.reject(new Error('User not found'));
    }
    
    // Verify current password
    if (user.password !== currentPassword) {
        return Promise.reject(new Error('Current password is incorrect'));
    }
    
    // Update password
    user.password = newPassword;
    
    // Create password reset log
    const passwordResetLog = {
        id: `reset_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        resetAt: new Date(),
        resetBy: user.id,
        resetByName: user.name,
        companyId: user.companyId
    };
    
    // Get existing logs
    const existingLogs = loadFromStorage('passwordResetLogs', []);
    existingLogs.push(passwordResetLog);
    saveToStorage('passwordResetLogs', existingLogs);
    
    return simulateApi(undefined);
};


// Products
export const getProducts = () => {
    // CRITICAL: Force reload from localStorage to get latest data
    reloadDataFromStorage();
    
    // Filter by current user's orgId if not SuperAdmin
    const filteredProducts = currentUser && currentUser.orgId && currentUser.role !== 'SuperAdmin'
        ? products.filter(p => p.orgId === currentUser.orgId)
        : products;
    
    console.log('📦 getProducts: Total in DB:', products.length, 'Filtered for user:', filteredProducts.length);
    
    return simulateApi([...filteredProducts]);
};

// Clear all products (utility function for fixing duplicate issues)
export const clearAllProducts = () => {
    products.length = 0;
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    console.log('✅ All products cleared from memory and localStorage');
    return simulateApi({ success: true });
};

export const addProduct = (data: Partial<Product>) => {
    const newProduct: Product = {
        id: `prod_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
    } as Product;
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return simulateApi(newProduct);
};
export const updateProduct = (id: string, data: Partial<Product>) => {
    const prodIndex = products.findIndex(p => p.id === id);
    if (prodIndex > -1) {
        products[prodIndex] = { ...products[prodIndex], ...data, updatedAt: new Date() };
        saveToStorage(STORAGE_KEYS.PRODUCTS, products);
        return simulateApi(products[prodIndex]);
    }
    return Promise.reject('Product not found');
};

// Bulk Product Upload
export interface BulkUploadResult {
    imported: Product[];
    failed: Array<{ product: Partial<Product>; error: string }>;
    duplicates: Array<{ product: Partial<Product>; existingSKU: string }>;
    summary: {
        total: number;
        successful: number;
        failed: number;
        duplicates: number;
    };
}

export const checkExistingSKUs = (skus: string[]): Promise<string[]> => {
    // Check which SKUs already exist in the database
    return new Promise((resolve) => {
        setTimeout(() => {
            const existingSKUs = skus.filter(sku => 
                products.some(p => p.sku.toLowerCase() === sku.toLowerCase())
            );
            resolve(existingSKUs);
        }, 300);
    });
};

export const addProductsBatch = async (productsData: Partial<Product>[]): Promise<BulkUploadResult> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // STEP 1: Force reload from localStorage to get absolutely latest data
            console.log('🔄 STEP 1: Force reloading from localStorage...');
            const beforeCount = reloadDataFromStorage();
            console.log('📊 Products in DB before import:', beforeCount);
            
            // STEP 2: Log all existing SKUs for debugging
            const existingSKUs = products.map(p => ({ sku: p.sku, orgId: p.orgId }));
            console.log('📝 Existing SKUs in DB:', existingSKUs.length);
            console.log('📝 First 5 existing SKUs:', existingSKUs.slice(0, 5));
            
            console.log('🚀 STEP 2: Starting batch import...', productsData.length, 'products');
            
            const result: BulkUploadResult = {
                imported: [],
                failed: [],
                duplicates: [],
                summary: {
                    total: productsData.length,
                    successful: 0,
                    failed: 0,
                    duplicates: 0,
                },
            };

            // STEP 3: Process each product
            productsData.forEach((productData, idx) => {
                try {
                    if (!productData.sku) {
                        throw new Error('SKU is required');
                    }
                    
                    // Normalize SKU for comparison (trim and lowercase)
                    const normalizedSKU = productData.sku.trim().toLowerCase();
                    
                    // Check for duplicate: same SKU AND same orgId
                    const existingProduct = products.find(
                        p => p.sku.trim().toLowerCase() === normalizedSKU && 
                        p.orgId === productData.orgId
                    );

                    if (existingProduct) {
                        console.log(`⚠️ Duplicate found: SKU=${productData.sku}, orgId=${productData.orgId}`);
                        result.duplicates.push({
                            product: productData,
                            existingSKU: existingProduct.sku,
                        });
                        result.summary.duplicates++;
                    } else {
                        // Add the product
                        const newProduct: Product = {
                            id: `prod_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            ...productData,
                        } as Product;

                        products.push(newProduct);
                        result.imported.push(newProduct);
                        result.summary.successful++;
                        console.log(`✅ Added: ${newProduct.sku} (ID: ${newProduct.id})`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to import product:`, productData, error);
                    result.failed.push({
                        product: productData,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                    result.summary.failed++;
                }
            });
            
            // STEP 4: Force save to localStorage
            console.log('💾 STEP 4: Saving', products.length, 'products to localStorage...');
            saveToStorage(STORAGE_KEYS.PRODUCTS, products);
            
            // STEP 5: Clear cache to force fresh reads
            cache.clear();
            console.log('🧹 STEP 5: Cache cleared');
            
            // STEP 6: Verify save
            const verifyProducts = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
            console.log('✅ STEP 6: Verified', verifyProducts.length, 'products in localStorage');
            console.log('📊 Import Summary:', {
                total: result.summary.total,
                successful: result.summary.successful,
                duplicates: result.summary.duplicates,
                failed: result.summary.failed
            });

            resolve(result);
        }, 1000); // Simulate API delay
    });
};


// Stock tracking in memory with localStorage persistence
interface StockRecord {
    productId: string;
    warehouseId: string;
    quantity: number;
}

const stockRecords: StockRecord[] = [];

// Custom categories management
let customCategories: string[] = loadFromStorage<string[]>(STORAGE_KEYS.CATEGORIES, ['Hair Care', 'Skin Care', 'Face Care', 'Body Care']);

export const getCategories = () => simulateApi(customCategories);
export const addCategory = (categoryName: string) => {
  if (!customCategories.includes(categoryName)) {
    customCategories.push(categoryName);
    saveToStorage(STORAGE_KEYS.CATEGORIES, customCategories);
  }
  return simulateApi(customCategories);
};
export const deleteCategory = (categoryName: string) => {
  customCategories = customCategories.filter(c => c !== categoryName);
  saveToStorage(STORAGE_KEYS.CATEGORIES, customCategories);
  return simulateApi(customCategories);
};

// Courier partners management
let courierPartners: string[] = loadFromStorage<string[]>(STORAGE_KEYS.COURIER_PARTNERS, ['Delhivery', 'Blue Dart', 'DTDC', 'Ecom Express', 'Xpressbees', 'Self Delivery']);

export const getCourierPartners = () => simulateApi(courierPartners);
export const addCourierPartner = (partnerName: string) => {
  if (!courierPartners.includes(partnerName)) {
    courierPartners.push(partnerName);
    saveToStorage(STORAGE_KEYS.COURIER_PARTNERS, courierPartners);
  }
  return simulateApi(courierPartners);
};
export const deleteCourierPartner = (partnerName: string) => {
  courierPartners = courierPartners.filter(c => c !== partnerName);
  saveToStorage(STORAGE_KEYS.COURIER_PARTNERS, courierPartners);
  return simulateApi(courierPartners);
};

// Load persisted data from localStorage
let inwardRecords: Inward[] = [];
let outwardRecords: Outward[] = [];
let adjustmentRecords: Adjustment[] = [];

// Function to reload all data from localStorage
const reloadDataFromStorage = () => {
  // Clear cache first to force fresh read
  cache.clear();
  
  const initProducts = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  products.length = 0;
  products.push(...initProducts);
  console.log('🔄 Reloaded', initProducts.length, 'products from localStorage');
  
  // Reload warehouses
  const initWarehouses = loadFromStorage<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, []);
  warehouses.length = 0;
  warehouses.push(...initWarehouses);
  console.log('🔄 Reloaded', initWarehouses.length, 'warehouses from localStorage');
  
  // Reload inward records
  const initInward = loadFromStorage<Inward[]>(STORAGE_KEYS.INWARD, []);
  inwardRecords.length = 0;
  inwardRecords.push(...initInward);
  console.log('🔄 Reloaded', initInward.length, 'inward records from localStorage');
  
  // Reload outward records
  const initOutward = loadFromStorage<Outward[]>(STORAGE_KEYS.OUTWARD, []);
  outwardRecords.length = 0;
  outwardRecords.push(...initOutward);
  console.log('🔄 Reloaded', initOutward.length, 'outward records from localStorage');
  
  // Reload adjustment records
  const initAdjustments = loadFromStorage<Adjustment[]>(STORAGE_KEYS.ADJUSTMENTS, []);
  adjustmentRecords.length = 0;
  adjustmentRecords.push(...initAdjustments);
  console.log('🔄 Reloaded', initAdjustments.length, 'adjustment records from localStorage');
  
  return initProducts.length;
};

// Initialize products and warehouses from localStorage on app start
const initProducts = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
if (initProducts.length > 0) {
  products.length = 0;
  products.push(...initProducts);
  console.log('✅ Initial load:', initProducts.length, 'products from localStorage');
}

const initWarehouses = loadFromStorage<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, []);
if (initWarehouses.length > 0) {
  warehouses.length = 0;
  warehouses.push(...initWarehouses);
  console.log('✅ Initial load:', initWarehouses.length, 'warehouses from localStorage');
}

// Initialize inward records from localStorage (ALWAYS load, even if empty)
const initInward = loadFromStorage<Inward[]>(STORAGE_KEYS.INWARD, []);
inwardRecords.length = 0;
inwardRecords.push(...initInward);
console.log('✅ Initial load:', initInward.length, 'inward records from localStorage');

// Initialize outward records from localStorage (ALWAYS load, even if empty)
const initOutward = loadFromStorage<Outward[]>(STORAGE_KEYS.OUTWARD, []);
outwardRecords.length = 0;
outwardRecords.push(...initOutward);
console.log('✅ Initial load:', initOutward.length, 'outward records from localStorage');

// Initialize adjustment records from localStorage (ALWAYS load, even if empty)
const initAdjustments = loadFromStorage<Adjustment[]>(STORAGE_KEYS.ADJUSTMENTS, []);
adjustmentRecords.length = 0;
adjustmentRecords.push(...initAdjustments);
console.log('✅ Initial load:', initAdjustments.length, 'adjustment records from localStorage');

// Mock Orders data - using outward as sales orders
const generateMockOrders = () => {
    const today = new Date();
    const todayOrders = [];
    
    // Generate some random orders for today
    const channels = ['Amazon FBA', 'Flipkart', 'Meesho', 'Offline Store', 'Myntra'];
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    
    products.slice(0, 3).forEach((product, idx) => {
        hours.forEach((hour, hourIdx) => {
            if (Math.random() > 0.5) { // 50% chance of sale in each hour
                const orderTime = new Date(today);
                orderTime.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
                
                todayOrders.push({
                    id: `order_${Date.now()}_${idx}_${hourIdx}`,
                    companyId: 'demo-company-001',
                    productId: product.id,
                    sku: product.sku,
                    productName: product.name,
                    quantity: Math.floor(Math.random() * 10) + 1,
                    channel: channels[Math.floor(Math.random() * channels.length)],
                    orderRef: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    warehouseId: warehouses[Math.floor(Math.random() * warehouses.length)].id,
                    timestamp: orderTime,
                    createdBy: currentUser?.id || 'system',
                    createdAt: orderTime,
                });
            }
        });
    });
    
    return todayOrders;
};

let ordersCache: any[] = [];

// Custom Sources and Destinations
const DEFAULT_INWARD_SOURCES: string[] = [
  'Factory',
  'Amazon Return',
  'Flipkart Return',
  'Meesho Return',
  'Customer Return',
  'Supplier',
  'Transfer',
  'Other',
];

const DEFAULT_OUTWARD_DESTINATIONS: string[] = [
  'Amazon FBA',
  'Flipkart',
  'Flipkart FBF',
  'Meesho',
  'Myntra',
  'Myntra SJIT',
  'Zepto',
  'Zepto PO',
  'Nykaa',
  'Nykaa PO',
  'Offline Store',
  'Customer',
  'Transfer',
  'Other',
];

const safeEnumValues = (maybeEnum: unknown, fallback: string[]): string[] => {
  if (!maybeEnum || (typeof maybeEnum !== 'object' && typeof maybeEnum !== 'function')) return fallback;
  try {
    const values = Object.values(maybeEnum as any)
      .map(v => String(v))
      .filter(Boolean);
    return values.length > 0 ? values : fallback;
  } catch {
    return fallback;
  }
};

let customInwardSources: string[] = [...safeEnumValues(InwardSource as any, DEFAULT_INWARD_SOURCES)];
let customOutwardDestinations: string[] = [...safeEnumValues(OutwardDestination as any, DEFAULT_OUTWARD_DESTINATIONS)];

export const getInwardSources = () => simulateApi(customInwardSources);
export const addInwardSource = (source: string) => {
    if (!customInwardSources.includes(source)) {
        customInwardSources.push(source);
    }
    return simulateApi(customInwardSources);
};
export const removeInwardSource = (source: string) => {
    customInwardSources = customInwardSources.filter(s => s !== source);
    return simulateApi(customInwardSources);
};

export const getOutwardDestinations = () => simulateApi(customOutwardDestinations);
export const addOutwardDestination = (destination: string) => {
    if (!customOutwardDestinations.includes(destination)) {
        customOutwardDestinations.push(destination);
    }
    return simulateApi(customOutwardDestinations);
};
export const removeOutwardDestination = (destination: string) => {
    customOutwardDestinations = customOutwardDestinations.filter(d => d !== destination);
    return simulateApi(customOutwardDestinations);
};

// Stock calculation
export const getProductStock = (productId: string, warehouseId?: string, companyId?: string) => {
    let totalInward = 0;
    let totalOutward = 0;
    let totalAdjustment = 0;

    inwardRecords.forEach(record => {
        if (record.productId === productId) {
            // Filter by companyId if provided
            if (companyId && record.companyId !== companyId) return;
            if (!warehouseId || record.warehouseId === warehouseId) {
                totalInward += record.quantity;
            }
        }
    });

    outwardRecords.forEach(record => {
        if (record.productId === productId) {
            // Filter by companyId if provided
            if (companyId && record.companyId !== companyId) return;
            if (!warehouseId || record.warehouseId === warehouseId) {
                totalOutward += record.quantity;
            }
        }
    });

    adjustmentRecords.forEach(record => {
        if (record.productId === productId && record.approved) {
            // Filter by companyId if provided
            if (companyId && record.companyId !== companyId) return;
            if (!warehouseId || record.warehouseId === warehouseId) {
                totalAdjustment += record.quantity;
            }
        }
    });

    return totalInward - totalOutward + totalAdjustment;
};

export const getAllProductStocks = () => {
    const stockMap: { [productId: string]: { total: number; byWarehouse: { [whId: string]: number } } } = {};

    products.forEach(product => {
        stockMap[product.id] = {
            total: getProductStock(product.id),
            byWarehouse: {}
        };
        
        warehouses.forEach(wh => {
            const whStock = getProductStock(product.id, wh.id);
            if (whStock > 0) {
                stockMap[product.id].byWarehouse[wh.id] = whStock;
            }
        });
    });

    return simulateApi(stockMap);
};

// Warehouses
export const getWarehouses = () => {
    // Reload warehouses from localStorage to get latest data
    const storedWarehouses = loadFromStorage<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, []);
    if (storedWarehouses.length > 0) {
        warehouses.length = 0;
        warehouses.push(...storedWarehouses);
    }
    return simulateApi(warehouses);
};
export const addWarehouse = (data: Partial<Warehouse>) => {
    const newWarehouse: Warehouse = {
        id: `wh_${Date.now()}`,
        name: data.name!,
        location: data.location,
        code: data.code,
        address: data.address,
        status: data.status || 'Active',
        createdAt: new Date(),
        companyId: 'demo-company-001',
        updatedAt: new Date()
    };
    warehouses.push(newWarehouse);
    saveToStorage(STORAGE_KEYS.WAREHOUSES, warehouses);
    return simulateApi(newWarehouse);
}
export const updateWarehouse = (id: string, data: Partial<Warehouse>) => {
    const whIndex = warehouses.findIndex(w => w.id === id);
    if (whIndex > -1) {
        warehouses[whIndex] = { ...warehouses[whIndex], ...data, updatedAt: new Date() };
        saveToStorage(STORAGE_KEYS.WAREHOUSES, warehouses);
        console.log('✅ Warehouse updated and saved:', warehouses[whIndex]);
        return simulateApi(warehouses[whIndex]);
    }
    return Promise.reject('Warehouse not found');
}

export const deleteWarehouse = async (id: string, reason: string) => {
    const whIndex = warehouses.findIndex(w => w.id === id);
    if (whIndex === -1) {
        return Promise.reject('Warehouse not found');
    }
    
    // In production, check stock using warehouseHasStock utility
    // For now, just remove it
    warehouses.splice(whIndex, 1);
    
    // Create audit log
    activities.push({
        id: `act_${Date.now()}`,
        companyId: 'demo-company-001',
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'Unknown',
        type: ActivityType.WarehouseUpdated,
        referenceId: id,
        details: `Deleted warehouse. Reason: ${reason}`,
        createdAt: new Date(),
    });
    
    return simulateApi(true, 200); // Reduced delay to 200ms for faster response
};

// Inward
export const addInward = (data: Partial<Inward>) => {
    const newInward: Inward = {
        id: `in_${Date.now()}`,
        companyId: data.companyId || 'demo-company-001',
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        transactionDate: new Date(),
        ...data
    } as Inward;
    
    console.log('📥 Adding inward record:', newInward.id, 'Product:', newInward.productId, 'Qty:', newInward.quantity);
    console.log('📊 Before add - inwardRecords.length:', inwardRecords.length);
    
    inwardRecords.push(newInward);
    saveToStorage(STORAGE_KEYS.INWARD, inwardRecords);
    
    console.log('📊 After add - inwardRecords.length:', inwardRecords.length);
    console.log('✅ Inward record saved to localStorage');
    
    // Verify it was saved
    const verifyData = loadFromStorage<Inward[]>(STORAGE_KEYS.INWARD, []);
    console.log('🔍 Verification - localStorage has', verifyData.length, 'inward records');
    
    return simulateApi(newInward);
};

export const getInwardRecords = () => {
    // ALWAYS reload inward records from localStorage to get latest data
    const storedInward = loadFromStorage<Inward[]>(STORAGE_KEYS.INWARD, []);
    inwardRecords.length = 0;
    inwardRecords.push(...storedInward);
    console.log('🔄 Reloaded', storedInward.length, 'inward records from localStorage');
    return simulateApi(inwardRecords);
};

// Outward
export const addOutward = (data: Partial<Outward>) => {
    // Check for sufficient stock with companyId
    const companyId = data.companyId || 'demo-company-001';
    const currentStock = getProductStock(data.productId!, data.warehouseId, companyId);
    if (currentStock < data.quantity!) {
        return Promise.reject(new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${data.quantity}`));
    }
    
    const newOutward: Outward = {
        id: `out_${Date.now()}`,
        companyId: companyId,
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        transactionDate: new Date(),
        ...data
    } as Outward;
    
    console.log('📤 Adding outward record:', newOutward.id, 'Product:', newOutward.productId, 'Qty:', newOutward.quantity);
    console.log('📊 Before add - outwardRecords.length:', outwardRecords.length);
    
    outwardRecords.push(newOutward);
    saveToStorage(STORAGE_KEYS.OUTWARD, outwardRecords);
    
    console.log('📊 After add - outwardRecords.length:', outwardRecords.length);
    console.log('✅ Outward record saved to localStorage');
    
    // Verify it was saved
    const verifyData = loadFromStorage<Outward[]>(STORAGE_KEYS.OUTWARD, []);
    console.log('🔍 Verification - localStorage has', verifyData.length, 'outward records');
    
    return simulateApi(newOutward);
};

export const getOutwardRecords = () => {
    // ALWAYS reload outward records from localStorage to get latest data
    const storedOutward = loadFromStorage<Outward[]>(STORAGE_KEYS.OUTWARD, []);
    outwardRecords.length = 0;
    outwardRecords.push(...storedOutward);
    console.log('🔄 Reloaded', storedOutward.length, 'outward records from localStorage');
    return simulateApi(outwardRecords);
};

// Adjustment
export const addAdjustment = (data: Partial<Adjustment>) => {
    const newAdjustment: Adjustment = {
        id: `adj_${Date.now()}`,
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date(),
        requiresApproval: data.quantity! < 0,
        approved: !(data.quantity! < 0),
        ...data
    } as Adjustment;
    adjustmentRecords.push(newAdjustment);
    saveToStorage(STORAGE_KEYS.ADJUSTMENTS, adjustmentRecords);
    console.log("Adding adjustment:", newAdjustment);
    return simulateApi(newAdjustment);
}

export const getAdjustmentRecords = () => simulateApi(adjustmentRecords);

// Today's Sales Analytics
export const getTodaysSalesData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Use real outward records as sales data (instead of mock orders)
    const todaysOutward = outwardRecords.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= today && recordDate < tomorrow;
    });
    
    // Calculate total sold today from real outward records
    const totalSoldToday = todaysOutward.reduce((sum, record) => sum + record.quantity, 0);
    
    // Hourly sales from real outward data
    const hourlySales: { [key: string]: number } = {};
    for (let hour = 0; hour <= 23; hour++) {
        hourlySales[`${hour}:00`] = 0;
    }
    
    todaysOutward.forEach(record => {
        const hour = new Date(record.createdAt).getHours();
        const hourKey = `${hour}:00`;
        hourlySales[hourKey] = (hourlySales[hourKey] || 0) + record.quantity;
    });
    
    const hourlySalesData = Object.entries(hourlySales)
        .filter(([_, qty]) => qty > 0)
        .map(([hour, quantity]) => ({
            hour,
            quantity,
        }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    
    // Top 5 SKUs sold today from real data
    const skuSales: { [sku: string]: { name: string; quantity: number } } = {};
    todaysOutward.forEach(record => {
        const product = products.find(p => p.id === record.productId);
        if (!skuSales[record.sku]) {
            skuSales[record.sku] = { 
                name: product?.name || record.sku, 
                quantity: 0 
            };
        }
        skuSales[record.sku].quantity += record.quantity;
    });
    
    const topSKUs = Object.entries(skuSales)
        .map(([sku, data]) => ({ sku, name: data.name, quantity: data.quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    // Channel-wise breakdown from real outward destinations with proper names
    const companyId = currentUser?.companyId || 'default';
    const outwardSources = await getSources(companyId, 'outward');
    const channelSales: { [channel: string]: number } = {};
    
    todaysOutward.forEach(record => {
        const destinationId = record.destination || 'Others';
        const source = outwardSources.find(s => s.id === destinationId);
        const channel = source ? source.name : 'Others';
        if (!channelSales[channel]) {
            channelSales[channel] = 0;
        }
        channelSales[channel] += record.quantity;
    });
    
    const channelBreakdown = Object.entries(channelSales).map(([name, value]) => ({
        name,
        value,
    }));
    
    // Transform outward records to order format for compatibility
    const todaysOrders = todaysOutward.map(record => {
        const product = products.find(p => p.id === record.productId);
        return {
            id: record.id,
            companyId: record.companyId,
            productId: record.productId,
            sku: record.sku,
            productName: product?.name || record.sku,
            quantity: record.quantity,
            channel: record.destination || 'Others',
            orderRef: record.shipmentRef,
            warehouseId: record.warehouseId,
            timestamp: record.createdAt,
            createdBy: record.createdBy,
            createdAt: record.createdAt,
        };
    });
    
    return simulateApi({
        totalSoldToday,
        hourlySalesData,
        topSKUs,
        channelBreakdown,
        todaysOrders,
    });
};

// Dashboard
export const getDashboardData = async () => {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Calculate real inward and outward for today
    const todaysInward = inwardRecords.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= today && recordDate < tomorrow;
    }).reduce((sum, record) => sum + record.quantity, 0);
    
    const todaysOutward = outwardRecords.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= today && recordDate < tomorrow;
    }).reduce((sum, record) => sum + record.quantity, 0);
    
    // Today's sales = Today's outward (real data, not mock)
    const todaysSales = todaysOutward;
    
    // Calculate total stock units and value
    let totalUnits = 0;
    let totalStockValue = 0;
    
    // Group by SKU to calculate stock
    const stockBySku = new Map<string, number>();
    
    // Add inward quantities
    inwardRecords.forEach(record => {
        const current = stockBySku.get(record.sku) || 0;
        stockBySku.set(record.sku, current + record.quantity);
    });
    
    // Subtract outward quantities
    outwardRecords.forEach(record => {
        const current = stockBySku.get(record.sku) || 0;
        stockBySku.set(record.sku, current - record.quantity);
    });
    
    // Calculate total units and value
    stockBySku.forEach((qty, sku) => {
        if (qty > 0) {
            totalUnits += qty;
            const product = products.find(p => p.sku === sku);
            if (product) {
                const itemValue = qty * product.costPrice;
                totalStockValue += itemValue;
                console.log(`Inventory Value - SKU: ${sku}, Qty: ${qty}, Cost: ₹${product.costPrice}, Value: ₹${itemValue}`);
            } else {
                console.log(`Inventory Value - Product not found for SKU: ${sku}`);
            }
        }
    });
    
    console.log(`Total Inventory: ${totalUnits} pcs, Value: ₹${totalStockValue.toFixed(2)}`);
    
    // Calculate low stock items
    const lowStockItems = products.filter(product => {
        const stock = stockBySku.get(product.sku) || 0;
        return stock > 0 && stock <= product.lowStockThreshold;
    }).length;
    
    // Active SKUs (products with stock > 0)
    const activeSKUs = Array.from(stockBySku.values()).filter(qty => qty > 0).length;
    
    // Calculate expiring items (products with batches expiring within 6 months)
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    sixMonthsFromNow.setHours(23, 59, 59, 999);
    const expiringSkus = new Set<string>();
    
    console.log('Dashboard Expiring Calculation:');
    console.log('Today:', today.toLocaleDateString());
    console.log('Six months from now:', sixMonthsFromNow.toLocaleDateString());
    console.log('Total inward records:', inwardRecords.length);
    
    inwardRecords.forEach(record => {
        if (record.expDate) {
            const expDate = new Date(record.expDate);
            expDate.setHours(0, 0, 0, 0);
            const stock = stockBySku.get(record.sku) || 0;
            
            console.log('Checking record:', {
                sku: record.sku,
                ean: record.ean,
                expDateRaw: record.expDate,
                expDateParsed: expDate.toLocaleDateString(),
                stock,
                expDate_vs_today: expDate > today,
                expDate_vs_sixMonths: expDate <= sixMonthsFromNow,
                willShow: expDate <= sixMonthsFromNow && expDate > today && stock > 0
            });
            
            if (expDate <= sixMonthsFromNow && expDate > today && stock > 0) {
                console.log('✓ Found expiring item:', {
                    sku: record.sku,
                    ean: record.ean,
                    expDate: expDate.toLocaleDateString(),
                    stock,
                    daysToExpiry: Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                });
                expiringSkus.add(record.sku);
            }
        }
    });
    
    console.log('Total expiring SKUs:', expiringSkus.size);
    const expiringItems = expiringSkus.size;
    
    // Calculate inward/outward trend for last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const inwardOutwardTrend = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayInward = inwardRecords.filter(record => {
            const recordDate = new Date(record.createdAt);
            return recordDate >= date && recordDate < nextDate;
        }).reduce((sum, record) => sum + record.quantity, 0);
        
        const dayOutward = outwardRecords.filter(record => {
            const recordDate = new Date(record.createdAt);
            return recordDate >= date && recordDate < nextDate;
        }).reduce((sum, record) => sum + record.quantity, 0);
        
        inwardOutwardTrend.push({
            name: days[date.getDay()],
            inward: dayInward,
            outward: dayOutward
        });
    }
    
    // Calculate channel-wise outward with proper source names
    const channelOutwardMap = new Map<string, number>();
    const companyId = currentUser?.companyId || 'default';
    const outwardSources = await getSources(companyId, 'outward');
    
    console.log('=== CHANNEL WISE OUTWARD DEBUG ===');
    console.log('Dashboard - currentUser:', currentUser);
    console.log('Dashboard - companyId:', companyId);
    console.log('Dashboard - outwardSources:', outwardSources);
    console.log('Dashboard - outwardRecords sample:', outwardRecords.slice(0, 3));
    
    outwardRecords.forEach(record => {
        let destination = 'Unknown';
        
        // First check if destination is already a readable name
        if (record.destination && !record.destination.startsWith('src_')) {
            destination = record.destination;
        } else {
            // Find the source by ID
            const source = outwardSources.find(s => s.id === record.destination);
            if (source) {
                destination = source.name;
            } else {
                // Fallback - try to find by partial ID match or use default mapping
                if (record.destination?.includes('meesho') || record.destination?.toLowerCase().includes('meesho')) {
                    destination = 'Meesho';
                } else if (record.destination?.includes('amazon') || record.destination?.toLowerCase().includes('amazon')) {
                    destination = 'Amazon FBA';
                } else if (record.destination?.includes('flipkart') || record.destination?.toLowerCase().includes('flipkart')) {
                    destination = 'Flipkart';
                } else if (record.destination?.includes('myntra') || record.destination?.toLowerCase().includes('myntra')) {
                    destination = 'Myntra';
                } else {
                    destination = record.destination || 'Unknown';
                }
            }
        }
        
        console.log('Dashboard - Processed outward:', {
            recordId: record.id,
            originalDestination: record.destination,
            finalDestination: destination,
            quantity: record.quantity
        });
        
        const current = channelOutwardMap.get(destination) || 0;
        channelOutwardMap.set(destination, current + record.quantity);
    });
    
    console.log('Dashboard - Final channelOutwardMap:', Array.from(channelOutwardMap.entries()));
    
    const channelWiseOutward = Array.from(channelOutwardMap.entries()).map(([name, value]) => ({
        name,
        value
    }));
    
    // Filter out corrupted data (source IDs starting with 'src_') but don't add fallback data
    const cleanChannelData = channelWiseOutward.filter(item => 
        !item.name.startsWith('src_') && item.name !== 'Unknown' && item.value > 0
    );
    
    // Only use clean data - no hardcoded fallbacks
    const finalChannelWiseOutward = cleanChannelData.length > 0 ? cleanChannelData : [];
    
    console.log('Dashboard - Clean channel outward data:', finalChannelWiseOutward);
    
    // Calculate stock by warehouse
    const warehouseStockMap = new Map<string, number>();
    inwardRecords.forEach(record => {
        const current = warehouseStockMap.get(record.warehouseId) || 0;
        warehouseStockMap.set(record.warehouseId, current + record.quantity);
    });
    outwardRecords.forEach(record => {
        const current = warehouseStockMap.get(record.warehouseId) || 0;
        warehouseStockMap.set(record.warehouseId, current - record.quantity);
    });
    
    const stockByWarehouse = warehouses.map(w => ({
        name: w.name,
        value: warehouseStockMap.get(w.id) || 0
    }));
    
    // Get top SKUs by stock
    const topSKUsByStock = Array.from(stockBySku.entries())
        .filter(([_, qty]) => qty > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([sku, qty]) => {
            const product = products.find(p => p.sku === sku);
            if (product) {
                return { ...product, stockQuantity: qty };
            }
            return null;
        })
        .filter(p => p !== null) as (Product & { stockQuantity: number })[];
    
    // Prepare product inventory for pie chart (top 10 products by stock)
    const productInventory = Array.from(stockBySku.entries())
        .filter(([_, qty]) => qty > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([sku, qty]) => {
            const product = products.find(p => p.sku === sku);
            return {
                name: product?.name || sku,
                inHandQty: qty
            };
        });
    
    const data = {
        summary: {
            totalStockValue,
            totalUnits,
            todaysInward,
            todaysOutward,
            todaysSales,
            lowStockItems,
            expiringItems,
            activeSKUs,
        },
        inwardOutwardTrend,
        channelWiseOutward: finalChannelWiseOutward,
        stockByWarehouse,
        topSKUsByStock,
        productInventory,
        recentActivities: activities.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()),
    }
    return simulateApi(data);
};

// --- MOCK REPORT FUNCTIONS ---
export const getFullStockReport = (format: 'csv' | 'xlsx') => {
    // Generate real stock report data
    const reportData: any[] = [];
    
    products.forEach(product => {
        warehouses.forEach(warehouse => {
            const stock = getProductStock(product.id, warehouse.id);
            if (stock > 0) {
                // Get earliest expiry date for this product in this warehouse
                const relevantBatches = inwardRecords.filter(
                    r => r.productId === product.id && r.warehouseId === warehouse.id && r.expDate
                );
                const earliestExpiry = relevantBatches.length > 0
                    ? new Date(Math.min(...relevantBatches.map(r => new Date(r.expDate).getTime())))
                    : null;
                const daysToExpiry = earliestExpiry
                    ? Math.ceil((earliestExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                
                reportData.push({
                    SKU: product.sku,
                    'Product Name': product.name,
                    Category: product.category,
                    Warehouse: warehouse.name,
                    'Available Stock': stock,
                    'Expiry Date': earliestExpiry ? earliestExpiry.toLocaleDateString('en-IN') : '-',
                    'Days to Expiry': daysToExpiry !== null ? daysToExpiry : '-',
                    'Expiry Status': daysToExpiry === null ? '-' : daysToExpiry < 0 ? 'Expired' : daysToExpiry < 30 ? 'Expiring Soon' : 'Active',
                    MRP: product.mrp,
                    'Cost Price': product.costPrice,
                    'Stock Value': stock * product.costPrice
                });
            }
        });
    });
    
    return simulateApi(reportData);
};

// DEBUG UTILITIES - Helper functions to diagnose issues
export const debugProductStorage = () => {
    console.log('=== PRODUCT STORAGE DEBUG ===');
    
    // Check localStorage
    const rawData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    console.log('1. Raw localStorage data:', rawData ? `${rawData.length} chars` : 'NULL');
    
    if (rawData) {
        try {
            const parsed = JSON.parse(rawData);
            console.log('2. Parsed products:', parsed.length);
            console.log('3. First 3 products:', parsed.slice(0, 3));
            console.log('4. All SKUs:', parsed.map((p: any) => p.sku));
        } catch (error) {
            console.error('Failed to parse localStorage:', error);
        }
    }
    
    // Check memory
    console.log('5. Products in memory:', products.length);
    console.log('6. First 3 in memory:', products.slice(0, 3));
    
    // Check current user
    console.log('7. Current user:', currentUser?.email, currentUser?.orgId);
    
    return {
        localStorageSize: rawData?.length || 0,
        localStorageCount: rawData ? JSON.parse(rawData).length : 0,
        memoryCount: products.length,
        currentUser: currentUser?.email
    };
};

export const forceReloadProducts = () => {
    console.log('🔄 Force reloading products...');
    reloadDataFromStorage();
    return simulateApi(products);
};

export const getInwardReport = (format: 'csv' | 'xlsx') => {
    // Generate real inward report
    const data = inwardRecords.map(record => {
        const product = products.find(p => p.id === record.productId);
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        const daysToExpiry = record.expDate
            ? Math.ceil((new Date(record.expDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;
        
        return {
            Date: new Date(record.createdAt).toLocaleDateString('en-IN'),
            'Invoice/Ref No': record.documentNo || '-',
            SKU: record.sku,
            'Product Name': product?.name || 'Unknown',
            Quantity: record.quantity,
            'Batch No': record.batchNo || '-',
            'Mfg Date': record.mfgDate ? new Date(record.mfgDate).toLocaleDateString('en-IN') : '-',
            'Expiry Date': record.expDate ? new Date(record.expDate).toLocaleDateString('en-IN') : '-',
            'Days to Expiry': daysToExpiry !== null ? daysToExpiry : '-',
            'Expiry Status': daysToExpiry === null ? '-' : daysToExpiry < 0 ? 'Expired' : daysToExpiry < 30 ? 'Expiring Soon' : 'Active',
            'Cost Price': record.costPrice,
            'Total Value': record.quantity * record.costPrice,
            Warehouse: warehouse?.name || 'Unknown',
            Source: record.source,
            Notes: record.notes || '-'
        };
    });
    return simulateApi(data);
};

export const getOutwardReport = async (format: 'csv' | 'xlsx') => {
    // Generate real outward report with proper destination names
    const outwardSources = await getSources('default', 'outward');
    
    const data = outwardRecords.map(record => {
        const product = products.find(p => p.id === record.productId);
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        const destinationId = record.destination;
        const source = outwardSources.find(s => s.id === destinationId);
        const destinationName = source ? source.name : destinationId;
        
        return {
            Date: new Date(record.createdAt).toLocaleDateString('en-IN'),
            SKU: record.sku,
            'Product Name': product?.name || 'Unknown',
            Quantity: record.quantity,
            Warehouse: warehouse?.name || 'Unknown',
            Destination: destinationName,
            Platform: record.platform || '-',
            'Courier Partner': record.courierPartner || '-',
            'Shipment Ref': record.shipmentRef || '-',
            Notes: record.notes || '-'
        };
    });
    return simulateApi(data);
};

export const getBatchExpiryReport = (format: 'csv' | 'xlsx') => {
    // Generate real batch expiry report from inward records with batch-wise quantity
    const data = inwardRecords
        .filter(record => record.batchNo && record.expDate)
        .map(record => {
            const product = products.find(p => p.id === record.productId);
            const warehouse = warehouses.find(w => w.id === record.warehouseId);
            const daysToExpiry = Math.ceil((new Date(record.expDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const monthsToExpiry = Math.floor(daysToExpiry / 30);
            
            return {
                SKU: record.sku,
                'Product Name': product?.name || 'Unknown',
                'Batch No': record.batchNo,
                'Batch Quantity': record.quantity,
                'Mfg Date': new Date(record.mfgDate).toLocaleDateString('en-IN'),
                'Expiry Date': new Date(record.expDate).toLocaleDateString('en-IN'),
                'Months to Expiry': monthsToExpiry,
                Warehouse: warehouse?.name || 'Unknown',
                Status: daysToExpiry < 0 ? 'Expired' : monthsToExpiry <= 6 ? 'Expiring Soon (≤6 months)' : 'Active'
            };
        })
        .sort((a, b) => a['Months to Expiry'] - b['Months to Expiry']); // Sort by expiry date
    
    return simulateApi(data);
};

export const getSkuMovementReport = (format: 'csv' | 'xlsx') => {
    // Generate real SKU movement report from all inward and outward records
    const movements: any[] = [];
    
    // Add all inward movements
    inwardRecords.forEach(record => {
        const product = products.find(p => p.id === record.productId);
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        movements.push({
            Date: new Date(record.createdAt).toLocaleDateString('en-IN'),
            SKU: record.sku,
            'Product Name': product?.name || 'Unknown',
            Movement: 'Inward',
            Quantity: record.quantity,
            'Batch No': record.batchNo || '-',
            'Cost Price': record.costPrice,
            Warehouse: warehouse?.name || 'Unknown',
            'Source/Destination': record.source,
            Reference: record.documentNo || '-'
        });
    });
    
    // Add all outward movements
    outwardRecords.forEach(record => {
        const product = products.find(p => p.id === record.productId);
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        movements.push({
            Date: new Date(record.createdAt).toLocaleDateString('en-IN'),
            SKU: record.sku,
            'Product Name': product?.name || 'Unknown',
            Movement: 'Outward',
            Quantity: record.quantity,
            'Batch No': '-',
            'Cost Price': '-',
            Warehouse: warehouse?.name || 'Unknown',
            'Source/Destination': record.destination,
            Reference: record.shipmentRef || '-'
        });
    });
    
    // Sort by date (most recent first)
    movements.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    
    return simulateApi(movements);
};

export const getWarehouseStockReport = (format: 'csv' | 'xlsx') => {
    // Generate real warehouse stock report
    const reportData: any[] = [];
    
    warehouses.forEach(warehouse => {
        let totalStock = 0;
        let totalValue = 0;
        const productDetails: any[] = [];
        
        products.forEach(product => {
            const stock = getProductStock(product.id, warehouse.id);
            if (stock > 0) {
                totalStock += stock;
                totalValue += stock * product.costPrice;
                productDetails.push({
                    Warehouse: warehouse.name,
                    Location: warehouse.location,
                    SKU: product.sku,
                    'Product Name': product.name,
                    Category: product.category,
                    'Available Stock': stock,
                    'Cost Price': product.costPrice,
                    MRP: product.mrp,
                    'Stock Value': stock * product.costPrice
                });
            }
        });
        
        reportData.push(...productDetails);
    });
    
    return simulateApi(reportData);
};
