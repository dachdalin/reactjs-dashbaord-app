import { createContext } from 'react';
import type { UserResponse } from '../lib/api';

export interface AuthContextValue {
  user: UserResponse | null;
  accessToken: string | null;
  isLoading: boolean;
  isPending: boolean;
  isAdmin: () => boolean;
  isAuthor: () => boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: UserResponse) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
