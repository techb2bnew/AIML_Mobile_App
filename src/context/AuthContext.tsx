import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { AuthSession } from '../types/user';
import { clearSession, loadSession, saveSession } from '../services/storage/sessionStorage';
import { logout as logoutApi } from '../services/api/authApi';
import { setUnauthorizedHandler } from '../services/api/client';
import { getTokenExpiryMs, isTokenExpired } from '../services/auth/tokenExpiry';
import { navigationRef } from '../navigation/navigationRef';
import { ROUTES } from '../navigation/routes';

// setTimeout stores its delay in a signed 32-bit int; longer waits fire
// immediately. A long-lived token is simply re-armed when the timer fires.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

interface AuthContextValue {
  session: AuthSession | null;
  isHydrating: boolean;
  // True after the session ended on its own (expired token), so the login
  // screen can explain why the user is back there.
  sessionExpired: boolean;
  login: (session: AuthSession) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const sessionRef = useRef<AuthSession | null>(null);
  sessionRef.current = session;

  useEffect(() => {
    let isMounted = true;
    loadSession()
      .then(async stored => {
        // A session saved days ago may carry a dead token — drop it now
        // rather than letting the user land on Main and hit errors.
        if (stored && isTokenExpired(stored.token)) {
          await clearSession();
          if (isMounted) {
            setSessionExpired(true);
          }
          return;
        }
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

  // The session ended without the user asking: clear it locally (no logout
  // API call — the token is already dead) and send them to Login.
  const expireSession = useCallback(async () => {
    // Several in-flight requests can 401 at once; only the first one acts.
    if (!sessionRef.current) {
      return;
    }
    sessionRef.current = null;
    await clearSession();
    setSession(null);
    setSessionExpired(true);
    if (navigationRef.isReady()) {
      navigationRef.resetRoot({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
    }
  }, []);

  // Any authenticated request that comes back 401 ends the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      expireSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [expireSession]);

  // Log out at the token's own expiry time, and re-check when the app comes
  // back to the foreground (timers don't run reliably while backgrounded).
  const token = session?.token;
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      clearTimeout(timer);
      const expiry = getTokenExpiryMs(token);
      if (expiry === null) {
        return;
      }
      const remaining = expiry - Date.now();
      if (remaining <= 0) {
        expireSession();
        return;
      }
      timer = setTimeout(arm, Math.min(remaining, MAX_TIMEOUT_MS));
    };
    arm();

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        arm();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [token, expireSession]);

  const login = useCallback(async (newSession: AuthSession) => {
    await saveSession(newSession);
    setSessionExpired(false);
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
    () => ({ session, isHydrating, sessionExpired, login, logout }),
    [session, isHydrating, sessionExpired, login, logout],
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
