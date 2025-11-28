import { Company, SuperAdminStats, CreateCompanyRequest, Role, SubscriptionStatus, SubscriptionPlan } from '../types';

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
  // Sort by creation date (newest first)
  const sortedCompanies = [...companies].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return simulateApi(sortedCompanies);
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
      maxUsers: request.maxUsers || (request.plan === SubscriptionPlan.Free ? 5 : 
                request.plan === SubscriptionPlan.Starter ? 25 : 
                request.plan === SubscriptionPlan.Pro ? 100 : 999),
      maxWarehouses: request.maxWarehouses || (request.plan === SubscriptionPlan.Free ? 2 : 
                     request.plan === SubscriptionPlan.Starter ? 5 : 
                     request.plan === SubscriptionPlan.Pro ? 20 : 999),
      maxProducts: request.maxProducts || (request.plan === SubscriptionPlan.Free ? 50 : 
                   request.plan === SubscriptionPlan.Starter ? 500 : 
                   request.plan === SubscriptionPlan.Pro ? 5000 : 99999)
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
  const company = companies.find(c => c.id === companyId);
  if (!company) {
    throw new Error('Company not found');
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name: userData.name,
    email: userData.email,
    password: userData.password || 'password123', // Default or provided password
    role: userData.role,
    orgId: userData.orgId,
    companyId: companyId,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  superAdminUsers.push(newUser);
  saveToStorage(SUPER_ADMIN_STORAGE_KEYS.USERS, superAdminUsers);

  // Update company user count
  const companyIndex = companies.findIndex(c => c.id === companyId);
  if (companyIndex !== -1) {
    companies[companyIndex].usage.users += 1;
    companies[companyIndex].updatedAt = new Date();
    saveToStorage(SUPER_ADMIN_STORAGE_KEYS.COMPANIES, companies);
  }

  return simulateApi(newUser);
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const company = companies.find(c => c.id === companyId);
  return simulateApi(company || null);
};