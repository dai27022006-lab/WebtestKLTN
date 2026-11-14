'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getMe, logout } from '@/services';
import type { UserProfileDto } from '@/types/api';

interface AuthContextValue {
  user: UserProfileDto | null;
  isLoading: boolean;
  refreshUser: () => Promise<UserProfileDto | null>;
  setUserDirect: (user: UserProfileDto | null) => void;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async (): Promise<UserProfileDto | null> => {
    const res = await getMe();
    if (res.ok) {
      setUser(res.data.user);
      setIsLoading(false);
      return res.data.user;
    }
    setUser(null);
    setIsLoading(false);
    return null;
  }, []);

  useEffect(() => {
    let active = true;
    void getMe().then((res) => {
      if (!active) return;
      if (res.ok) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const logoutUser = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      refreshUser,
      setUserDirect: setUser,
      logoutUser,
    }),
    [user, isLoading, refreshUser, logoutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
