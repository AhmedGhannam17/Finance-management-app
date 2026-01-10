import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';

interface User {
  id: string;
  username?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check if user is authenticated on mount
   */
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await authService.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Load user from local storage - no API call needed
      const storedUser = await authService.getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    const data = await authService.signIn(username, password);
    if (data.user) {
      const userData = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.name,
      };
      setUser(userData);
      await authService.storeUser(userData);
    }
  };

  const signUp = async (username: string, password: string, name?: string) => {
    try {
      console.log('[AuthContext] Starting signup for:', username);
      const data = await authService.signUp(username, password, name);
      console.log('[AuthContext] Signup response received:', data);
      
      if (data.user) {
        const userData = {
          id: data.user.id,
          username: data.user.username,
          name: data.user.name || name || username,
        };
        setUser(userData);
        await authService.storeUser(userData);
        console.log('[AuthContext] User state set and stored');
      } else {
        console.error('[AuthContext] Signup succeeded but no user data returned');
      }
    } catch (error: any) {
      console.error('[AuthContext] Signup error details:', error.response?.data || error.message);
      throw error; // Re-throw so the screen can catch it
    }
  };

  const signOut = async () => {
    await authService.signOut();
    await authService.removeUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
