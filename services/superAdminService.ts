import { Company, SuperAdminStats, CreateCompanyRequest, Role, SubscriptionStatus, SubscriptionPlan } from '../types';
import { upsertUserInGlobalRegistry } from './firebaseService';
import {
  fetchAllRemoteCompanies,
  fetchAllRemoteUsers,
  isRemoteStoreEnabled,
  upsertRemoteCompany,
  upsertRemoteUser,
} from './superAdminRemoteStore';

// This will be replaced with actual Firestore calls in production
// For now, using localStorage simulation to match existing pattern

const SUPER_ADMIN_STORAGE_KEYS = {
  COMPANIES: 'superadmin_companies',
  USERS: 'superadmin_users'
};

// Generate unique orgId
const generateOrgId = (): string => {
  return `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Simulate API delay
const simulateApi = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 100);
  });
};

// Load data from localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Save data to localStorage
const saveToStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`✅ SAVED TO STORAGE: ${key}`, data);
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initialize with demo data if empty
let companies: Company[] = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, []);
let superAdminUsers: any[] = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, []);

// ***** Firebase Admin SDK helpers ****
import admin from 'firebase-admin';

// attempt to initialize admin using service account from env
const initFirebaseAdmin = () => {
  if (admin.apps.length) return;
  try {
    const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (saJson) {
      const sa = JSON.parse(saJson);
      admin.initializeApp({
        credential: admin.credential.cert(sa)
      });
      console.log('🔧 Initialized Firebase Admin SDK');
    } else {
      console.log('⚠️ No service account JSON provided; Firebase Admin unavailable');
    }
  } catch (err) {
    console.error('❌ Failed to init Firebase Admin', err);
  }
};

// create user through admin SDK if available, otherwise fall back to REST
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const createFirebaseUser = async (email: string, password: string): Promise<string | null> => {
  // try admin first
  try {
    initFirebaseAdmin();
    if (admin.apps.length) {
      const user = await admin.auth().createUser({ email, password, disabled: false });
      console.log('✅ Firebase-admin created user', email, 'uid=', user.uid);
      return user.uid;
    }
  } catch (err) {
    console.warn('⚠️ Firebase-admin createUser failed, falling back to REST', err);
  }

  if (!FIREBASE_API_KEY) {
    console.log('🔧 Firebase API key not configured; skipping createFirebaseUser');
    return null;
  }
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );
    const data = await res.json();
    if (data.error) {
      console.error('❌ Firebase create user error', data.error);
      return null;
    }
    console.log('✅ Firebase REST user created:', email, 'uid=', data.localId);
    return data.localId;
  } catch (err) {
    console.error('❌ createFirebaseUser failed', err);
    return null;
  }
};

const updateFirebaseUser = async (
  uid: string,
  updates: { email?: string; password?: string; disabled?: boolean }
): Promise<void> => {
  initFirebaseAdmin();
  if (admin.apps.length && uid) {
    try {
      await admin.auth().updateUser(uid, updates as any);
      console.log('✅ Firebase-admin updated user', uid, updates);
      return;
    } catch (err) {
      console.error('⚠️ Firebase-admin updateUser failed', err);
    }
  }
  // otherwise just log for now
  console.log('🔧 updateFirebaseUser (no-admin) called for', uid, updates);
};

console.log('🚀 SuperAdminService loaded! Current users in storage:', superAdminUsers.length, superAdminUsers.map((u: any) => ({ email: u.email, password: u.password ? '***' : 'NONE' })));

// Start with clean slate - no demo data

const getDefaultLimitsForPlan = (plan: SubscriptionPlan) => {
  // NOTE: Business is treated as effectively unlimited in this app.
  // We keep large numeric limits to avoid breaking older limit checks.
  return {
    maxUsers: plan === SubscriptionPlan.Free ? 5 :
             plan === SubscriptionPlan.Starter ? 25 :
             plan === SubscriptionPlan.Pro ? 100 : 999,
    maxWarehouses: plan === SubscriptionPlan.Free ? 2 :
                  plan === SubscriptionPlan.Starter ? 5 :
                  plan === SubscriptionPlan.Pro ? 20 : 999,
    maxProducts: plan === SubscriptionPlan.Free ? 50 :
               plan === SubscriptionPlan.Starter ? 500 :
               plan === SubscriptionPlan.Pro ? 5000 : 99999,
  };
};

export const getSuperAdminStats = async (): Promise<SuperAdminStats> => {
  const activeCompanies = companies.filter(c => c.isActive).length;
  const inactiveCompanies = companies.filter(c => !c.isActive).length;
  
  return simulateApi({
    totalCompanies: companies.length,
    activeCompanies,
    inactiveCompanies,
    totalUsers: superAdminUsers.length + companies.length // Approximate
  });
};

export const getAllCompanies = async (): Promise<Company[]> => {
  try {
    console.log('📊 getAllCompanies called');

    // If Firestore is configured, sync from remote so data is consistent across devices/browsers.
    if (isRemoteStoreEnabled()) {
      try {
        const remoteCompanies = await fetchAllRemoteCompanies();
        if (remoteCompanies.length > 0) {
          companies = remoteCompanies.map((c: any) => ({
            ...(c as any),
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
            validFrom: c.validFrom ? new Date(c.validFrom) : new Date(),
            validTo: c.validTo ? new Date(c.validTo) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          }));
          saveToStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, companies);
        }
      } catch (e) {
        console.warn('⚠️ Firestore companies sync failed; using localStorage', e);
      }
    }
    
    // Reload from localStorage in case data was updated in another tab
    companies = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, []);
    console.log('📋 Loaded companies from storage:', companies.length);
    
    // Sort by creation date (newest first)
    const sortedCompanies = [...companies].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log('✅ Returning sorted companies:', sortedCompanies.length);
    return simulateApi(sortedCompanies);
  } catch (error) {
    console.error('❌ Error in getAllCompanies:', error);
    // Return empty array as fallback
    return simulateApi([]);
  }
};

export const createCompany = async (request: CreateCompanyRequest): Promise<Company> => {
  const orgId = generateOrgId();
  const companyId = `company_${Date.now()}`;
  
  const now = new Date();
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  const newCompany: Company = {
    id: companyId,
    name: request.name,
    email: request.email,
    phone: request.phone,
    plan: request.plan,
    subscriptionStatus: SubscriptionStatus.Active,
    validFrom: request.validFrom || now,
    validTo: request.validTo || oneYearLater,
    loginAllowed: true,
    orgId: orgId,
    isActive: true,
    limits: {
      ...getDefaultLimitsForPlan(request.plan),
      ...(request.maxUsers ? { maxUsers: request.maxUsers } : {}),
      ...(request.maxWarehouses ? { maxWarehouses: request.maxWarehouses } : {}),
      ...(request.maxProducts ? { maxProducts: request.maxProducts } : {})
    },
    usage: {
      users: 0, // Will be incremented when owner user is created
      warehouses: 0,
      products: 0
    },
    ownerId: `user_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  companies.push(newCompany);
  saveToStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, companies);

  if (isRemoteStoreEnabled()) {
    upsertRemoteCompany(newCompany).catch((e) => console.warn('⚠️ Failed to write company to Firestore', e));
  }

  // Automatically create a default admin user for the company (for easier testing)
  if (request.ownerEmail && request.ownerName) {
    try {
      await createCompanyUser(companyId, {
        name: request.ownerName,
        email: request.ownerEmail,
        role: Role.Admin,
        orgId: orgId,
        password: 'admin123' // Default password
      });
      console.log('✅ Auto-created admin user for company:', request.ownerEmail);
    } catch (error) {
      console.warn('Could not auto-create admin user:', error);
    }
  }

  return simulateApi(newCompany);
};

export const toggleCompanyStatus = async (companyId: string, isActive: boolean): Promise<void> => {
  const companyIndex = companies.findIndex(c => c.id === companyId);
  if (companyIndex === -1) {
    throw new Error('Company not found');
  }

  companies[companyIndex].isActive = isActive;
  companies[companyIndex].updatedAt = new Date();
  saveToStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, companies);

  if (isRemoteStoreEnabled()) {
    upsertRemoteCompany(companies[companyIndex]).catch((e) => console.warn('⚠️ Failed to write company to Firestore', e));
  }

  return simulateApi(undefined as any);
};

export const createCompanyUser = async (
  companyId: string, 
  userData: { name: string; email: string; role: Role; orgId: string; password?: string }
): Promise<any> => {
  console.log('🔧 createCompanyUser called:', { companyId, userData: { ...userData, password: '***' } });
  
  const company = companies.find(c => c.id === companyId);
  if (!company) {
    throw new Error('Company not found');
  }

  // Check if company is active and login allowed
  if (!company.isActive) {
    throw new Error('Cannot create users for inactive company');
  }

  // Check user limit
  if (company.limits.maxUsers !== -1 && company.usage.users >= company.limits.maxUsers) {
    throw new Error(`User limit exceeded. Maximum ${company.limits.maxUsers} users allowed.`);
  }

  // Normalize email on creation (case/whitespace)
  const normalizedEmail = String(userData.email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Email is required');
  }

  // Reload users from storage to check for existing users
  superAdminUsers = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, []);
  
  // Check if user already exists (case insensitive)
  const existingUser = superAdminUsers.find(
    u => String(u.email || '').trim().toLowerCase() === normalizedEmail
  );
  if (existingUser) {
    console.log('❌ User already exists:', normalizedEmail);
    throw new Error('User with this email already exists');
  }

  const newUser: any = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: userData.name,
    // store normalized email; if you ever need original case, you can store separately
    email: normalizedEmail,
    password: userData.password || 'password123', // Default or provided password
    role: userData.role,
    orgId: userData.orgId,
    companyId: companyId,
    isEnabled: true,
    active: true, // Add active flag for user status
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // create corresponding Firebase Auth user if possible
  try {
    const fbUid = await createFirebaseUser(normalizedEmail, newUser.password);
    if (fbUid) {
      newUser.firebaseUid = fbUid;
    }
  } catch (err) {
    console.warn('⚠️ Failed to sync new user to Firebase Auth', err);
  }

  console.log('✅ Creating new user:', { ...newUser, password: '***' });

  // Store user in localStorage (for persistence)
  superAdminUsers.push(newUser);
  saveToStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, superAdminUsers);

  if (isRemoteStoreEnabled()) {
    upsertRemoteUser(newUser).catch((e) => console.warn('⚠️ Failed to write user to Firestore', e));
  }

  // Add user to global registry for cross-session access
  upsertUserInGlobalRegistry({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    orgId: newUser.orgId,
    companyId: newUser.companyId,
    isEnabled: newUser.isEnabled,
    password: newUser.password
  });

  // Update company user count
  companies = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, []);
  const companyIndex = companies.findIndex(c => c.id === companyId);
  if (companyIndex !== -1) {
    companies[companyIndex].usage.users += 1;
    companies[companyIndex].updatedAt = new Date();
    saveToStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, companies);
  }

  console.log('✅ Created company user successfully:', {
    email: newUser.email,
    role: newUser.role,
    orgId: newUser.orgId,
    companyId: companyId,
    autoLogin: false // Explicitly indicate no auto-login
  });

  return simulateApi({
    ...newUser,
    message: 'User created successfully. They can now login with their credentials.'
  });
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const company = companies.find(c => c.id === companyId);
  return simulateApi(company || null);
};

export const updateCompanySubscription = async (
  companyId: string,
  updates: {
    plan: SubscriptionPlan;
    subscriptionStatus?: SubscriptionStatus;
    validFrom?: Date;
    validTo?: Date;
    maxUsers?: number;
    maxWarehouses?: number;
    maxProducts?: number;
  }
): Promise<Company> => {
  companies = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, []);
  const companyIndex = companies.findIndex(c => c.id === companyId);
  if (companyIndex === -1) {
    throw new Error('Company not found');
  }

  const current = companies[companyIndex];
  const defaultLimits = getDefaultLimitsForPlan(updates.plan);

  const next: Company = {
    ...current,
    plan: updates.plan,
    subscriptionStatus: updates.subscriptionStatus ?? current.subscriptionStatus,
    validFrom: updates.validFrom ?? current.validFrom,
    validTo: updates.validTo ?? current.validTo,
    limits: {
      ...current.limits,
      ...defaultLimits,
      ...(typeof updates.maxUsers === 'number' ? { maxUsers: updates.maxUsers } : {}),
      ...(typeof updates.maxWarehouses === 'number' ? { maxWarehouses: updates.maxWarehouses } : {}),
      ...(typeof updates.maxProducts === 'number' ? { maxProducts: updates.maxProducts } : {}),
    },
    updatedAt: new Date(),
  };

  companies[companyIndex] = next;
  saveToStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, companies);
  if (isRemoteStoreEnabled()) {
    upsertRemoteCompany(next).catch((e) => console.warn('⚠️ Failed to write company to Firestore', e));
  }
  return simulateApi(next);
};

export const updateCompanyUser = async (
  userEmail: string,
  updates: {
    name?: string;
    role?: Role;
    isEnabled?: boolean;
    companyId?: string;
    password?: string;
    email?: string;
  }
): Promise<any> => {
  const emailKey = userEmail.trim().toLowerCase();
  if (!emailKey) throw new Error('User email is required');

  companies = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, []);
  superAdminUsers = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, []);

  const userIndex = superAdminUsers.findIndex(
    (u: any) => String(u?.email ?? '').trim().toLowerCase() === emailKey
  );
  if (userIndex === -1) throw new Error('User not found');

  const currentUser = superAdminUsers[userIndex];
  const nextCompanyId = updates.companyId ?? currentUser.companyId;
  const currentCompanyId = currentUser.companyId;

  const nextCompany = companies.find((c) => c.id === nextCompanyId);
  if (!nextCompany) throw new Error('Selected company not found');
  if (!nextCompany.isActive) throw new Error('Selected company is inactive');

  if (currentCompanyId && nextCompanyId && currentCompanyId !== nextCompanyId) {
    if (nextCompany.limits.maxUsers !== -1 && nextCompany.usage.users >= nextCompany.limits.maxUsers) {
      throw new Error(`User limit exceeded. Maximum ${nextCompany.limits.maxUsers} users allowed.`);
    }

    const oldCompanyIndex = companies.findIndex((c) => c.id === currentCompanyId);
    if (oldCompanyIndex !== -1) {
      companies[oldCompanyIndex].usage.users = Math.max(0, (companies[oldCompanyIndex].usage.users || 0) - 1);
      companies[oldCompanyIndex].updatedAt = new Date();
    }

    const newCompanyIndex = companies.findIndex((c) => c.id === nextCompanyId);
    if (newCompanyIndex !== -1) {
      companies[newCompanyIndex].usage.users = (companies[newCompanyIndex].usage.users || 0) + 1;
      companies[newCompanyIndex].updatedAt = new Date();
    }

    saveToStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, companies);
  }

  const nextPassword =
    typeof updates.password === 'string' && updates.password.trim().length > 0
      ? updates.password
      : currentUser.password;

  const passwordUpdated = nextPassword !== currentUser.password;

  console.log('🔄 updateCompanyUser called for:', emailKey);
  console.log('   Current password:', currentUser.password ? '***' : 'NONE');
  console.log('   New password:', nextPassword ? '***' : 'NONE');
  console.log('   Password changed:', passwordUpdated);
  console.log('   Exact new password value:', JSON.stringify(nextPassword));

  const nextUser: any = {
    ...currentUser,
    name: typeof updates.name === 'string' ? updates.name : currentUser.name,
    role: (updates.role ?? currentUser.role) as Role,
    isEnabled: typeof updates.isEnabled === 'boolean' ? updates.isEnabled : currentUser.isEnabled,
    companyId: nextCompanyId,
    orgId: nextCompany.orgId ?? currentUser.orgId,
    password: nextPassword,
    updatedAt: new Date(),
  };

  // attempt to update Firebase Auth record if we have a UID
  if (currentUser.firebaseUid) {
    updateFirebaseUser(currentUser.firebaseUid, {
      email: updates.email ? String(updates.email).trim().toLowerCase() : undefined,
      password: passwordUpdated ? nextPassword : undefined,
      disabled: updates.isEnabled === false ? true : undefined,
    }).catch((e) => console.warn('⚠️ Firebase update user failed', e));
  }

  superAdminUsers[userIndex] = nextUser;
  saveToStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, superAdminUsers);

  if (passwordUpdated) {
    console.log('✅ Password updated for user:', nextUser.email, '- New password saved to localStorage');
    console.log('   Verified in storage:', superAdminUsers[userIndex].password);
  }

  if (isRemoteStoreEnabled()) {
    upsertRemoteUser(nextUser).catch((e) => console.warn('⚠️ Failed to write user update to Firestore', e));
  }

  upsertUserInGlobalRegistry({
    id: nextUser.id,
    name: nextUser.name,
    email: nextUser.email,
    role: nextUser.role,
    orgId: nextUser.orgId,
    companyId: nextUser.companyId,
    isEnabled: nextUser.isEnabled !== false,
    password: nextUser.password,
  });

  return simulateApi(nextUser);
};

export const syncSuperAdminUsersFromRemote = async (): Promise<void> => {
  if (!isRemoteStoreEnabled()) return;
  try {
    const remoteUsers = await fetchAllRemoteUsers();
    if (remoteUsers.length === 0) return;

    superAdminUsers = remoteUsers.map((u: any) => ({
      ...u,
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
    }));
    saveToStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, superAdminUsers);

    superAdminUsers.forEach((u: any) => {
      if (!u?.email) return;
      upsertUserInGlobalRegistry({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        orgId: u.orgId,
        companyId: u.companyId,
        isEnabled: u.isEnabled !== false,
        password: u.password,
      });
    });
  } catch (e) {
    console.warn('⚠️ Firestore users sync failed; using localStorage', e);
  }
};