import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
// firebase helpers
import { auth, firestore } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  collection,
  getDocs,
} from 'firebase/firestore';

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

// no longer using AsyncStorage for auth persistence

const STORAGE_KEY = 'fixit_user'; // keep for compatibility if needed

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // listen to Firebase Auth state and load user profile from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(firestore, 'users', firebaseUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUser({ id: firebaseUser.uid, ...(snap.data() as Omit<User, 'id'>) });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // add a login timestamp record to a subcollection for analytics/audit
    try {
      const logRef = doc(collection(firestore, 'users', uid, 'logins'));
      await setDoc(logRef, { timestamp: new Date() });
    } catch (err) {
      console.warn('[Auth] failed to log login event', err);
    }

    const snap = await getDoc(doc(firestore, 'users', uid));
    if (snap.exists()) {
      const data = snap.data() as Omit<User, 'id'>;
      const u: User = { id: uid, ...data };
      setUser(u);
      return;
    }
    // fallback: create minimal profile
    const u: User = { id: uid, name: cred.user.email || '', email: cred.user.email || '', phone: '', role: 'customer', city: '' };
    setUser(u);
  };

  const register = async (data: Partial<User> & { password: string }) => {
    console.debug('[Auth] register called', { data });
    const { password, ...rest } = data;
    // create auth user
    const cred = await createUserWithEmailAndPassword(auth, rest.email || '', password);
    const uid = cred.user.uid;

    const newUser: User = {
      id: uid,
      name: rest.name || 'User',
      email: rest.email || '',
      phone: rest.phone || '',
      role: rest.role || 'customer',
      city: rest.city || 'Mumbai',
      ...rest,
    };

    try {
      // build user doc, filtering out undefined fields (Firestore doesn't allow them)
      const userDocData = Object.fromEntries(
        Object.entries({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          city: newUser.city,
          serviceType: newUser.serviceType,
          experience: newUser.experience,
          pricePerHour: newUser.pricePerHour,
          available: newUser.available,
          description: newUser.description,
          skills: newUser.skills,
          rating: newUser.rating,
          reviewCount: newUser.reviewCount,
          completedJobs: newUser.completedJobs,
        }).filter(([_, v]) => v !== undefined)
      );

      await setDoc(doc(firestore, 'users', uid), userDocData);

      // add mirror document in role-specific collection
      const roleCol = newUser.role === 'provider' ? 'providers' : 'customers';
      await setDoc(doc(firestore, roleCol, uid), userDocData);
    } catch (err) {
      console.error('[Auth] failed to write user document', err);
      // if we can't write to Firestore, delete the auth user we just created
      // so they can retry without getting "email already in use" error
      try {
        console.warn('[Auth] rolling back Auth user creation due to Firestore failure');
        await cred.user.delete();
      } catch (deleteErr) {
        console.error('[Auth] failed to rollback auth user', deleteErr);
      }
      // rethrow the original firestore error
      throw err;
    }

    setUser(newUser);
    console.debug('[Auth] registration completed', newUser);  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    await updateDoc(doc(firestore, 'users', user.id), data as any);
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
