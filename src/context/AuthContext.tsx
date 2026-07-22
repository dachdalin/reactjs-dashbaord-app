import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi, usersApi, type UserResponse, type AuthResponse } from '../lib/api';

// ── Types ────────────────────────────────────────────────
interface AuthContextValue {
  user: UserResponse | null;
  accessToken: string | null;
  isLoading: boolean;
  /** true while a login/register/logout call is in-flight */
  isPending: boolean;
  isAdmin: () => boolean;
  isAuthor: () => boolean;
  /** Returns an error string or null on success */
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  /** Refresh the stored user profile from the API */
  refreshUser: () => Promise<void>;
  /** Update local user state (after a profile save) */
  setUser: (u: UserResponse) => void;
}

// ── Context ───────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // Rehydrate from localStorage on first mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const stored = localStorage.getItem('auth_user');
    if (token && stored) {
      setAccessToken(token);
      setUserState(JSON.parse(stored) as UserResponse);
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((res: AuthResponse) => {
    localStorage.setItem('auth_token', res.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    setAccessToken(res.accessToken);
    setUserState(res.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      setIsPending(true);
      try {
        const res = await authApi.login(email, password);
        persist(res);
        return null;
      } catch (e: unknown) {
        return e instanceof Error ? e.message : 'Login failed';
      } finally {
        setIsPending(false);
      }
    },
    [persist]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, phone?: string): Promise<string | null> => {
      setIsPending(true);
      try {
        const res = await authApi.register(name, email, password, phone);
        persist(res);
        return null;
      } catch (e: unknown) {
        return e instanceof Error ? e.message : 'Registration failed';
      } finally {
        setIsPending(false);
      }
    },
    [persist]
  );

  const logout = useCallback(async () => {
    setIsPending(true);
    try {
      await authApi.logout();
    } catch {
      // ignore – clear local state regardless
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setAccessToken(null);
      setUserState(null);
      setIsPending(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const updated = await usersApi.get(user.id);
      setUserState(updated);
      localStorage.setItem('auth_user', JSON.stringify(updated));
    } catch {
      // silent
    }
  }, [user]);

  const setUser = useCallback((u: UserResponse) => {
    setUserState(u);
    localStorage.setItem('auth_user', JSON.stringify(u));
  }, []);

  const isAdmin = useCallback(() => user?.type === 'ADMIN', [user]);
  const isAuthor = useCallback(() => user?.type === 'AUTHOR' || user?.type === 'ADMIN', [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isPending,
        isAdmin,
        isAuthor,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
