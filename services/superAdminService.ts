import { Company, SuperAdminStats, CreateCompanyRequest, Role, SubscriptionStatus, SubscriptionPlan } from '../types';
import { upsertUserInGlobalRegistry } from './firebaseService';

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
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initialize with demo data if empty
let companies: Company[] = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, []);
let superAdminUsers: any[] = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, []);

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

  // Reload users from storage to check for existing users
  superAdminUsers = loadFromStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, []);
  
  // Check if user already exists
  const existingUser = superAdminUsers.find(u => u.email === userData.email);
  if (existingUser) {
    console.log('❌ User already exists:', userData.email);
    throw new Error('User with this email already exists');
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: userData.name,
    email: userData.email,
    password: userData.password || 'password123', // Default or provided password
    role: userData.role,
    orgId: userData.orgId,
    companyId: companyId,
    isEnabled: true,
    active: true, // Add active flag for user status
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('✅ Creating new user:', { ...newUser, password: '***' });

  // Store user in localStorage (for persistence)
  superAdminUsers.push(newUser);
  saveToStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, superAdminUsers);

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

  const nextUser = {
    ...currentUser,
    name: typeof updates.name === 'string' ? updates.name : currentUser.name,
    role: (updates.role ?? currentUser.role) as Role,
    isEnabled: typeof updates.isEnabled === 'boolean' ? updates.isEnabled : currentUser.isEnabled,
    companyId: nextCompanyId,
    orgId: nextCompany.orgId ?? currentUser.orgId,
    password: nextPassword,
    updatedAt: new Date(),
  };

  superAdminUsers[userIndex] = nextUser;
  saveToStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, superAdminUsers);

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