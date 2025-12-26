import React, { createContext, useContext, ReactNode } from 'react';
import { Company, CompanyUser } from '../types';
import { useAuth } from './AuthContext';

interface MockCompanyContextType {
  company: Company | null;
  companyUser: CompanyUser | null;
  loading: boolean;
  canAddUser: () => boolean;
  canAddWarehouse: () => boolean;
  canAddProduct: () => boolean;
  isSubscriptionActive: () => boolean;
  refreshCompany: () => Promise<void>;
}

const MockCompanyContext = createContext<MockCompanyContextType | undefined>(undefined);

export const MockCompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const mockCompany: Company | null = user ? {
    id: user.orgId || 'mock-org',
    orgId: user.orgId || 'mock-org',
    name: user.companyName || 'My Company',
    email: user.email,
    phone: '',
    address: '',
    gstNumber: '',
    plan: 'professional',
    subscriptionStatus: 'active',
    subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    userCount: 1,
    warehouseCount: 1,
    productCount: 0
  } : null;

  const mockCompanyUser: CompanyUser | null = user ? {
    id: user.id,
    userId: user.id,
    companyId: user.orgId || 'mock-org',
    role: 'Admin',
    permissions: ['all'],
    createdAt: new Date().toISOString()
  } : null;

  const value = {
    company: mockCompany,
    companyUser: mockCompanyUser,
    loading: false,
    canAddUser: () => true,
    canAddWarehouse: () => true,
    canAddProduct: () => true,
    isSubscriptionActive: () => true,
    refreshCompany: async () => {}
  };

  return <MockCompanyContext.Provider value={value}>{children}</MockCompanyContext.Provider>;
};

export const useCompany = () => {
  const context = useContext(MockCompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within MockCompanyProvider');
  }
  return context;
};
