import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useBookings, BookingStatus } from '@/context/BookingsContext';
import { useAuth } from '@/context/AuthContext';
import { BookingCard } from '@/components/BookingCard';
import colors from '@/constants/colors';

type TabFilter = 'upcoming' | 'completed' | 'cancelled';

const TAB_STATUSES: Record<TabFilter, BookingStatus[]> = {
  upcoming: ['pending', 'confirmed', 'ongoing'],
  completed: ['completed'],
  cancelled: ['cancelled'],
};

export default function CustomerBookings() {
  const { user } = useAuth();
  const { getCustomerBookings, updateBookingStatus } = useBookings();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabFilter>('upcoming');

  const handleComplete = async (id: string) => {
    try {
      await updateBookingStatus(id, 'completed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const myBookings = getCustomerBookings(user?.id || '');
  const filtered = myBookings.filter((b) => TAB_STATUSES[activeTab].includes(b.status));

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.tabs}>
          {(['upcoming', 'completed', 'cancelled'] as TabFilter[]).map((tab) => {
            const count = myBookings.filter((b) => TAB_STATUSES[tab].includes(b.status)).length;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, activeTab === tab && { color: colors.white }]}>{count}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
            <BookingCard booking={item} />
            {activeTab === 'upcoming' && ['confirmed', 'ongoing'].includes(item.status) && (
              <Pressable
                onPress={() => handleComplete(item.id)}
                style={styles.completeBtn}
              >
                <Text style={styles.completeBtnText}>Mark Completed</Text>
              </Pressable>
            )}
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={52} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'Book a service to get started' : `No ${activeTab} bookings yet`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 16 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_600SemiBold' },
  tabTextActive: { color: colors.white },
  tabBadge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabBadgeText: { fontSize: 10, color: colors.textSecondary, fontFamily: 'Poppins_700Bold' },
  list: { padding: 20, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' },
  emptyText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', textAlign: 'center' },
  completeBtn: {
    marginHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    marginBottom: 10,
  },
  completeBtnText: { color: colors.white, fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
});
