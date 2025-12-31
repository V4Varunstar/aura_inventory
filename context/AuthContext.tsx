
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, Role } from '../types';
import { mockLogin, mockLogout, mockFetchUser } from '../services/firebaseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // TRUE initially to prevent redirect during session check
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Check session ONLY once on mount - no retries to prevent infinite loops
    if (sessionChecked) return;
    
    const checkSession = async () => {
      setLoading(true);
      try {
        console.log('🔍 AuthProvider: Checking user session on mount/refresh...');
        console.log('📦 localStorage keys:', Object.keys(localStorage));
        console.log('🔑 Session key present:', !!localStorage.getItem('aura_inventory_user'));
        
        const loggedInUser = await mockFetchUser();
        
        console.log('✅ AuthProvider: Session restored successfully:', {
          email: loggedInUser.email,
          role: loggedInUser.role,
          orgId: loggedInUser.orgId,
          timestamp: new Date().toISOString()
        });
        
        setUser(loggedInUser);
      } catch (error: any) {
        console.log('⚠️ AuthProvider: Session check failed:', error?.message || error);
        console.log('🚪 AuthProvider: No valid session - user will be redirected to login');
        setUser(null);
      } finally {
        setLoading(false);
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, [sessionChecked]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      console.log('🔐 Login attempt:', { email, timestamp: new Date().toISOString() });
      
      // Prevent any automatic session switching during login
      const currentSession = localStorage.getItem('aura_inventory_user');
      if (currentSession) {
        const currentUser = JSON.parse(currentSession);
        console.log('🔍 Existing session detected for:', currentUser.email);
      }
      
      const loggedInUser = await mockLogin(email, pass);
      console.log('✅ Login successful:', { 
        email: loggedInUser.email, 
        role: loggedInUser.role,
        orgId: loggedInUser.orgId,
        sessionReplaced: !!currentSession
      });
      
      setUser(loggedInUser);
      return loggedInUser;
    } catch(error) {
      console.error('❌ Login failed:', error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await mockLogout();
    setUser(null);
  };

  // Listen for visibility changes to restore session if lost
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !user && sessionChecked) {
        console.log('👁️ Tab became visible - checking if session needs restoration');
        const sessionExists = localStorage.getItem('aura_inventory_user');
        if (sessionExists && !user) {
          console.log('🔄 Session exists but user not set - restoring...');
          setSessionChecked(false); // Trigger re-check
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, sessionChecked]);

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
