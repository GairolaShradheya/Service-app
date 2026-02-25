import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

interface BookingsContextValue {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  getProviderBookings: (providerId: string) => Booking[];
  getCustomerBookings: (customerId: string) => Booking[];
}

const BookingsContext = createContext<BookingsContextValue | null>(null);
const STORAGE_KEY = 'fixit_bookings';

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setBookings(JSON.parse(stored));
    });
  }, []);

  const save = async (updated: Booking[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setBookings(updated);
  };

  const addBooking = useCallback(async (data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
    const booking: Booking = {
      ...data,
      id: `booking_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [booking, ...bookings];
    await save(updated);
    return booking;
  }, [bookings]);

  const updateBookingStatus = useCallback(async (id: string, status: BookingStatus) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    await save(updated);
  }, [bookings]);

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
