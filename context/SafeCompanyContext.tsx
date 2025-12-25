import React, { createContext, useState, useContext, useEffect } from 'react';
import { Company } from '../types';
import { useAuth } from './AuthContext';

interface SafeCompanyContextType {
  company: Company | null;
  loading: boolean;
  error: string | null;
}

const SafeCompanyContext = createContext<SafeCompanyContextType>({
  company: null,
  loading: false,
  error: null
});

export const SafeCompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCompany(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Create a default company for the user
    try {
      const defaultCompany: Company = {
        id: user.orgId || 'default-org',
        orgId: user.orgId || 'default-org',
        name: user.companyName || 'My Company',
        email: user.email,
        phone: '',
        address: '',
        gstNumber: '',
        plan: 'trial' as any,
        subscriptionStatus: 'active' as any,
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        userCount: 1,
        warehouseCount: 1,
        productCount: 0
      };
      
      setCompany(defaultCompany);
      setError(null);
    } catch (err) {
      console.error('Error creating default company:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value = { company, loading, error };

  return (
    <SafeCompanyContext.Provider value={value}>
      {children}
    </SafeCompanyContext.Provider>
  );
};

export const useSafeCompany = () => {
  const context = useContext(SafeCompanyContext);
  if (context === undefined) {
    throw new Error('useSafeCompany must be used within SafeCompanyProvider');
  }
  return context;
};
