import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '@/context/BookingsContext';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
import colors from '@/constants/colors';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
  showActions?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

export function BookingCard({ booking, onPress, showActions, onAccept, onReject }: BookingCardProps) {
  const isPlumber = booking.serviceType === 'plumber';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Avatar initials={booking.providerInitials} color={booking.providerColor} size={44} />
        <View style={styles.info}>
          <Text style={styles.name}>{booking.providerName}</Text>
          <View style={styles.serviceBadge}>
            <Ionicons
              name={isPlumber ? 'water-outline' : 'flash-outline'}
              size={11}
              color={isPlumber ? colors.plumber : colors.electrician}
            />
            <Text style={[styles.serviceText, { color: isPlumber ? colors.plumber : colors.electrician }]}>
              {booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1)}
            </Text>
          </View>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <View style={styles.details}>
        <View style={styles.detail}>
          <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.detailText}>{booking.date}</Text>
        </View>
        <View style={styles.detail}>
          <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.detailText}>{booking.timeSlot}</Text>
        </View>
        <View style={styles.detail}>
          <Ionicons name="cash-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.detailText}>₹{booking.totalAmount}</Text>
        </View>
      </View>

      {showActions && booking.status === 'pending' && (
        <View style={styles.actions}>
          <Pressable onPress={onReject} style={({ pressed }) => [styles.rejectBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="close" size={16} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Decline</Text>
          </Pressable>
          <Pressable onPress={onAccept} style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.7 }]}>
            <Ionicons name="checkmark" size={16} color={colors.white} />
            <Text style={[styles.actionText, { color: colors.white }]}>Accept</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  pressed: { opacity: 0.85 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 3 },
  serviceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serviceText: { fontSize: 12, fontFamily: 'Poppins_500Medium' },
  details: { flexDirection: 'row', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  acceptBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.primary,
  },
  actionText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
});
