import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSession {
  uid: string;
  email?: string;
  displayName: string;
  isAnonymous?: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginDemo: (personaId: 'priya' | 'sunita' | 'lakshmi') => void;
  loginCustom: (email: string, displayName?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_STORAGE_KEY = 'yojana_auth_user';
const AUTH_TOKEN_STORAGE_KEY = 'yojana_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session from storage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      const storedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (storedUser && storedToken) {
        setCurrentUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.warn("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginDemo = (personaId: 'priya' | 'sunita' | 'lakshmi') => {
    let session: UserSession;
    if (personaId === 'priya') {
      session = {
        uid: 'priya',
        email: 'priya.sharma@example.com',
        displayName: 'Priya Sharma',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
      };
    } else if (personaId === 'sunita') {
      session = {
        uid: 'sunita',
        email: 'sunita.devi@example.com',
        displayName: 'Sunita Devi',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita'
      };
    } else {
      session = {
        uid: 'lakshmi',
        email: 'lakshmi.ammal@example.com',
        displayName: 'Lakshmi Ammal',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lakshmi'
      };
    }

    const devToken = `dev-token-${session.uid}`;
    setCurrentUser(session);
    setToken(devToken);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, devToken);
    window.dispatchEvent(new Event('yojana_auth_changed'));
  };

  const loginCustom = (email: string, displayName?: string) => {
    const cleanId = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'user';
    const session: UserSession = {
      uid: cleanId,
      email: email,
      displayName: displayName || email.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanId}`
    };

    const devToken = `dev-token-${cleanId}`;
    setCurrentUser(session);
    setToken(devToken);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, devToken);
    window.dispatchEvent(new Event('yojana_auth_changed'));
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    window.dispatchEvent(new Event('yojana_auth_changed'));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        isLoading,
        loginDemo,
        loginCustom,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
