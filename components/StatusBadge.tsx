import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookingStatus } from '@/context/BookingsContext';
import colors from '@/constants/colors';

interface StatusBadgeProps {
  status: BookingStatus;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'rgba(251,191,36,0.15)', text: '#FBBF24' },
  confirmed: { label: 'Confirmed', bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
  ongoing: { label: 'Ongoing', bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  completed: { label: 'Completed', bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
});
