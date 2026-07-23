import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  authApi,
  clearStoredAuth,
  onAuthExpired,
  usersApi,
  type AuthResponse,
  type UserResponse,
} from '../lib/api';
import { AuthContext } from './authContextValue';

// ── Provider ──────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const clearAuthState = useCallback(() => {
    clearStoredAuth();
    setAccessToken(null);
    setUserState(null);
  }, []);

  // Rehydrate from localStorage on first mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('auth_expires_at');
    const stored = localStorage.getItem('auth_user');
    const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : null;
    const isExpired = expiresAtMs !== null && (!Number.isFinite(expiresAtMs) || Date.now() >= expiresAtMs);

    if (token && stored && expiresAt && !isExpired) {
      try {
        setAccessToken(token);
        setUserState(JSON.parse(stored) as UserResponse);
      } catch {
        clearAuthState();
      }
    } else if (token || stored) {
      clearAuthState();
    }
    setIsLoading(false);
  }, [clearAuthState]);

  useEffect(() => onAuthExpired(clearAuthState), [clearAuthState]);

  useEffect(() => {
    if (!accessToken) return;

    const expiresAt = localStorage.getItem('auth_expires_at');
    if (!expiresAt) {
      clearAuthState();
      return;
    }

    const expiresAtMs = new Date(expiresAt).getTime();
    if (!Number.isFinite(expiresAtMs)) {
      clearAuthState();
      return;
    }

    const msUntilExpiry = expiresAtMs - Date.now();
    if (msUntilExpiry <= 0) {
      clearAuthState();
      return;
    }

    const timer = window.setTimeout(clearAuthState, msUntilExpiry);
    return () => window.clearTimeout(timer);
  }, [accessToken, clearAuthState]);

  const persist = useCallback((res: AuthResponse) => {
    localStorage.setItem('auth_token', res.accessToken);
    localStorage.setItem('auth_expires_at', res.expiresAt);
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
      clearAuthState();
      setIsPending(false);
    }
  }, [clearAuthState]);

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
