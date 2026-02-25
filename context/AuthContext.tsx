import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'customer' | 'provider';
export type ServiceType = 'plumber' | 'electrician';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  // Provider-specific
  serviceType?: ServiceType;
  experience?: number;
  pricePerHour?: number;
  available?: boolean;
  description?: string;
  skills?: string[];
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<User> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'fixit_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setUser(JSON.parse(stored));
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, _password: string) => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const u = JSON.parse(stored);
      if (u.email === email) {
        setUser(u);
        return;
      }
    }
    throw new Error('Invalid credentials. Please register first.');
  };

  const register = async (data: Partial<User> & { password: string }) => {
    const { password: _, ...rest } = data;
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: rest.name || 'User',
      email: rest.email || '',
      phone: rest.phone || '',
      role: rest.role || 'customer',
      city: rest.city || 'Mumbai',
      ...rest,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateUser }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
