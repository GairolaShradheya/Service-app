import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useBookings } from '@/context/BookingsContext';
import { useAuth } from '@/context/AuthContext';
import { BookingCard } from '@/components/BookingCard';
import colors from '@/constants/colors';

export default function ProviderJobs() {
  const { user } = useAuth();
  const { bookings, updateBookingStatus } = useBookings();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const myJobs = bookings.filter((b) => b.providerId === user?.id || b.providerName === user?.name);
  const pending = myJobs.filter((b) => b.status === 'pending');
  const active = myJobs.filter((b) => ['confirmed', 'ongoing'].includes(b.status));
  const allActive = [...pending, ...active];

  const accept = async (id: string) => {
    await updateBookingStatus(id, 'confirmed');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const reject = async (id: string) => {
    await updateBookingStatus(id, 'cancelled');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <Text style={styles.title}>Incoming Jobs</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>{pending.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
            <Text style={[styles.statNum, { color: colors.success }]}>{active.length}</Text>
            <Text style={[styles.statLabel, { color: colors.success }]}>Active</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: 'rgba(249,115,22,0.12)' }]}>
            <Text style={[styles.statNum, { color: colors.accent }]}>{myJobs.filter((b) => b.status === 'completed').length}</Text>
            <Text style={[styles.statLabel, { color: colors.accent }]}>Done</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={allActive}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(400)} style={{ marginHorizontal: 20 }}>
            <BookingCard
              booking={item}
              showActions
              onAccept={() => accept(item.id)}
              onReject={() => reject(item.id)}
            />
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!allActive.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={52} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No active jobs</Text>
            <Text style={styles.emptyText}>Job requests will appear here when customers book you</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 26, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statPill: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14,
    backgroundColor: 'rgba(251,191,36,0.12)',
  },
  statNum: { fontSize: 20, color: colors.warning, fontFamily: 'Poppins_700Bold' },
  statLabel: { fontSize: 11, color: colors.warning, fontFamily: 'Poppins_400Regular' },
  list: { paddingTop: 4, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' },
  emptyText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', textAlign: 'center' },
});
