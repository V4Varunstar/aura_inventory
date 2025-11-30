
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
  const [loading, setLoading] = useState(true);

  const checkUserSession = useCallback(async () => {
    setLoading(true);
    try {
      const loggedInUser = await mockFetchUser(); // Simulate checking session
      console.log('Session check successful:', loggedInUser);
      setUser(loggedInUser);
    } catch (error) {
      console.log('No session found, user needs to login');
      // Don't set user to null immediately on refresh, give time for login redirect
      setTimeout(() => setUser(null), 100);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

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
