import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthSession } from '../types/user';
import { clearSession, loadSession, saveSession } from '../services/storage/sessionStorage';
import { logout as logoutApi } from '../services/api/authApi';

interface AuthContextValue {
  session: AuthSession | null;
  isHydrating: boolean;
  login: (session: AuthSession) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadSession()
      .then(stored => {
        if (isMounted) {
          setSession(stored);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrating(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (newSession: AuthSession) => {
    await saveSession(newSession);
    setSession(newSession);
  }, []);

  const logout = useCallback(async () => {
    // Best-effort: the user must always be able to log out of the app
    // locally, even if the backend call fails (offline, expired token, etc).
    if (session?.token) {
      try {
        await logoutApi(session.token);
      } catch {
        // Ignore — proceed to clear the local session regardless.
      }
    }
    await clearSession();
    setSession(null);
  }, [session]);

  const value = useMemo(
    () => ({ session, isHydrating, login, logout }),
    [session, isHydrating, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
