import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { firestore } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';

export type BookingStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerInitials: string;
  providerColor: string;
  serviceType: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  totalAmount: number;
  notes: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  // optionally store the id returned by the payment gateway
  paymentId?: string;
}

interface BookingsContextValue {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  getProviderBookings: (providerId: string) => Booking[];
  getCustomerBookings: (customerId: string) => Booking[];
}

const BookingsContext = createContext<BookingsContextValue | null>(null);
// not using AsyncStorage; bookings stored in Firestore collection
const BOOKINGS_COLLECTION = collection(firestore, 'bookings');

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // listen for realtime updates
  useEffect(() => {
    const q = query(BOOKINGS_COLLECTION, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const arr: Booking[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Booking, 'id'>),
      }));
      setBookings(arr);
    });
    return unsub;
  }, []);

  const addBooking = useCallback(async (data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
    const docRef = await addDoc(BOOKINGS_COLLECTION, {
      ...data,
      createdAt: serverTimestamp(),
    } as DocumentData);
    const snap = await getDoc(docRef);
    const booking: Booking = { id: docRef.id, ...(snap.data() as Omit<Booking, 'id'>) };
    return booking;
  }, []);

  const updateBookingStatus = useCallback(async (id: string, status: BookingStatus) => {
    await updateDoc(doc(BOOKINGS_COLLECTION, id), { status });
  }, []);

  const getProviderBookings = useCallback((providerId: string) =>
    bookings.filter((b) => b.providerId === providerId), [bookings]);

  const getCustomerBookings = useCallback((customerId: string) =>
    bookings.filter((b) => b.customerId === customerId), [bookings]);

  const value = useMemo(() => ({
    bookings, addBooking, updateBookingStatus, getProviderBookings, getCustomerBookings,
  }), [bookings, addBooking, updateBookingStatus, getProviderBookings, getCustomerBookings]);

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
