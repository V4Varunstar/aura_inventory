import React, { createContext, useState, useContext, useEffect } from 'react';
import { Company, CompanyUser, SubscriptionPlan, SubscriptionStatus, PLAN_LIMITS } from '../types';
import { useAuth } from './AuthContext';

interface CompanyContextType {
  company: Company | null;
  companyUser: CompanyUser | null;
  loading: boolean;
  canAddUser: () => boolean;
  canAddWarehouse: () => boolean;
  canAddProduct: () => boolean;
  isSubscriptionActive: () => boolean;
  refreshCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    if (!user) {
      setCompany(null);
      setCompanyUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual Firebase queries
      // For now, using mock data
      
      // Mock: Find company where user is a member
      const mockCompanyUser: CompanyUser = {
        id: 'cu_1',
        companyId: 'comp_1',
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        role: user.role,
        isEnabled: user.isEnabled,
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCompany: Company = {
        id: 'comp_1',
        name: 'Aura Beauty Products',
        email: 'admin@aura.com',
        phone: '+91 98765 43210',
        plan: SubscriptionPlan.Pro,
        subscriptionStatus: SubscriptionStatus.Active,
        limits: PLAN_LIMITS[SubscriptionPlan.Pro],
        usage: {
          users: 5,
          warehouses: 2,
          products: 150,
        },
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setCompany(mockCompany);
      setCompanyUser(mockCompanyUser);
    } catch (error) {
      console.error('Error fetching company data:', error);
      setCompany(null);
      setCompanyUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [user]);

  const canAddUser = (): boolean => {
    if (!company) return false;
    const limit = company.limits.maxUsers;
    if (limit === -1) return true;
    return company.usage.users < limit;
  };

  const canAddWarehouse = (): boolean => {
    if (!company) return false;
    const limit = company.limits.maxWarehouses;
    if (limit === -1) return true;
    return company.usage.warehouses < limit;
  };

  const canAddProduct = (): boolean => {
    if (!company) return false;
    const limit = company.limits.maxProducts;
    if (limit === -1) return true;
    return company.usage.products < limit;
  };

  const isSubscriptionActive = (): boolean => {
    if (!company) return false;
    return company.subscriptionStatus === SubscriptionStatus.Active ||
           company.subscriptionStatus === SubscriptionStatus.Trialing;
  };

  const refreshCompany = async () => {
    await fetchCompanyData();
  };

  const value = {
    company,
    companyUser,
    loading,
    canAddUser,
    canAddWarehouse,
    canAddProduct,
    isSubscriptionActive,
    refreshCompany,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
