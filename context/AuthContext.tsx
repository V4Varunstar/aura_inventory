
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

  const checkUserSession = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 Checking user session on mount/refresh...');
      const loggedInUser = await mockFetchUser();
      console.log('✅ Session check successful:', {
        email: loggedInUser.email,
        role: loggedInUser.role,
        orgId: loggedInUser.orgId,
        timestamp: new Date().toISOString()
      });
      setUser(loggedInUser);
    } catch (error: any) {
      console.log('⚠️ Session check failed:', error?.message || error);
      
      // Only set user to null if session is truly invalid
      // Don't logout on network/temporary errors
      if (error?.message?.includes('No active session') || 
          error?.message?.includes('Invalid session') ||
          error?.message?.includes('disabled')) {
        console.log('🚪 Clearing user state - session invalid');
        setUser(null);
      } else {
        // For unexpected errors, keep user logged in and retry
        console.log('🔄 Temporary error, retrying session check...');
        setTimeout(() => {
          checkUserSession();
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check session on mount - loading state prevents premature redirect
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
