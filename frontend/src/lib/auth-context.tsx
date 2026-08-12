'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, AuthUser, LoginPayload, RegisterPayload } from './api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<{ email: string }>;
  verifyOtp: (email: string, code: string) => Promise<AuthUser>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await api.me();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(payload: LoginPayload) {
    const res = await api.login(payload);
    setUser(res.data);
    return res.data;
  }

  async function register(payload: RegisterPayload) {
    const res = await api.register(payload);
    // No session is created at this point — registration now requires OTP
    // verification (see verifyOtp) before the account can be used.
    return { email: res.data.email };
  }

  async function verifyOtp(email: string, code: string) {
    const res = await api.verifyOtp(email, code);
    setUser(res.data);
    return res.data;
  }

  async function resendOtp(email: string) {
    await api.resendOtp(email);
  }

  async function logout() {
    await api.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, resendOtp, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}