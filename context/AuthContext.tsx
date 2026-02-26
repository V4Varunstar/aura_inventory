
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';

/**
 * AuthContext - Server-Side Session Based Authentication
 * 
 * This context now uses HTTP-only cookies for authentication.
 * NO localStorage dependency for auth state.
 * Sessions work across all browsers, incognito, and devices.
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check session on mount by calling /api/auth/me
   * This validates the HTTP-only cookie stored by the browser
   */
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        console.log('[AUTH-CONTEXT] Checking session via /api/auth/me');
        
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies in request
        });

        // Get text first to handle non-JSON responses safely
        const text = await response.text();
        
        if (response.ok) {
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('[AUTH-CONTEXT] ❌ Non-JSON response from /api/auth/me:', text);
            setUser(null);
            return;
          }
          
          if (data.success && data.user) {
            console.log('[AUTH-CONTEXT] ✅ Session valid:', data.user.email);
            setUser(data.user);
          } else {
            console.log('[AUTH-CONTEXT] ⚠️ Session invalid');
            setUser(null);
          }
        } else {
          console.log('[AUTH-CONTEXT] No active session');
          setUser(null);
        }
      } catch (error: any) {
        console.error('[AUTH-CONTEXT] ❌ Session check failed:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []); // Run only once on mount

  /**
   * Login by calling /api/auth/login
   * Server sets HTTP-only cookie on success
   */
  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      console.log('[AUTH-CONTEXT] Attempting login for:', email);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      // Get text first to handle non-JSON responses safely
      const text = await response.text();
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[AUTH-CONTEXT] ❌ Non-JSON response from server:', text);
        throw new Error('Server error during login. Please try again.');
      }

      if (response.ok && data.success && data.user) {
        console.log('[AUTH-CONTEXT] ✅ Login successful:', data.user.email);
        setUser(data.user);
        return data.user;
      } else {
        const error = data.error || data.message || 'Login failed';
        console.error('[AUTH-CONTEXT] ❌ Login failed:', error);
        throw new Error(error);
      }
    } catch (error: any) {
      console.error('[AUTH-CONTEXT] ❌ Login error:', error.message);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout by calling /api/auth/logout
   * Server clears HTTP-only cookie
   */
  const logout = async (): Promise<void> => {
    try {
      console.log('[AUTH-CONTEXT] Logging out');

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      console.log('[AUTH-CONTEXT] ✅ Logout successful');
      setUser(null);
    } catch (error: any) {
      console.error('[AUTH-CONTEXT] ❌ Logout error:', error.message);
      // Clear user state even if API call fails
      setUser(null);
    }
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
