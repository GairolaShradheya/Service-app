import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookings } from '@/context/BookingsContext';
import { useAuth } from '@/context/AuthContext';
import { BookingCard } from '@/components/BookingCard';
import colors from '@/constants/colors';

export default function ProviderEarnings() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const myJobs = bookings.filter((b) => b.providerId === user?.id || b.providerName === user?.name);
  const completed = myJobs.filter((b) => b.status === 'completed');
  const totalEarnings = completed.reduce((sum, b) => sum + b.totalAmount, 0);
  const thisMonth = completed.filter((b) => {
    const d = new Date(b.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthEarnings = thisMonth.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Earnings</Text>

      {/* Hero earnings card */}
      <View style={styles.heroCard}>
        <LinearGradient
          colors={['#0F1E3D', '#1D4ED8']}
          style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
        />
        <View style={styles.heroTop}>
          <Text style={styles.heroLabel}>Total Earnings</Text>
          <View style={styles.heroIcon}>
            <Ionicons name="trending-up" size={18} color={colors.white} />
          </View>
        </View>
        <Text style={styles.heroAmount}>₹{totalEarnings.toLocaleString()}</Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{completed.length}</Text>
            <Text style={styles.heroStatLabel}>Jobs Done</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>₹{monthEarnings.toLocaleString()}</Text>
            <Text style={styles.heroStatLabel}>This Month</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>₹{completed.length ? Math.round(totalEarnings / completed.length) : 0}</Text>
            <Text style={styles.heroStatLabel}>Avg/Job</Text>
          </View>
        </View>
      </View>

      {/* Quick stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Ionicons name="star" size={18} color="#FBBF24" />
          <Text style={styles.quickStatValue}>{user?.rating?.toFixed(1) || '—'}</Text>
          <Text style={styles.quickStatLabel}>Rating</Text>
        </View>
        <View style={styles.quickStat}>
          <Ionicons name="people-outline" size={18} color={colors.primary} />
          <Text style={styles.quickStatValue}>{user?.reviewCount || 0}</Text>
          <Text style={styles.quickStatLabel}>Reviews</Text>
        </View>
        <View style={styles.quickStat}>
          <Ionicons name="time-outline" size={18} color={colors.success} />
          <Text style={styles.quickStatValue}>98%</Text>
          <Text style={styles.quickStatLabel}>On-Time</Text>
        </View>
      </View>

      {/* Recent jobs */}
      <Text style={styles.sectionTitle}>Completed Jobs</Text>
      {completed.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cash-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No completed jobs yet</Text>
          <Text style={styles.emptyText}>Accept jobs to start earning</Text>
        </View>
      ) : (
        completed.map((booking) => (
          <View key={booking.id} style={{ marginHorizontal: 20 }}>
            <BookingCard booking={booking} />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 26, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 16, paddingHorizontal: 20 },
  heroCard: {
    marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 16, overflow: 'hidden',
    minHeight: 180,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins_500Medium' },
  heroIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  heroAmount: { fontSize: 36, color: colors.white, fontFamily: 'Poppins_700Bold', marginBottom: 20 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroStatValue: { fontSize: 16, color: colors.white, fontFamily: 'Poppins_700Bold', marginBottom: 2 },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins_400Regular' },
  quickStats: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 24,
    backgroundColor: colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden',
  },
  quickStat: {
    flex: 1, alignItems: 'center', paddingVertical: 16, gap: 4,
    borderRightWidth: 1, borderRightColor: colors.cardBorder,
  },
  quickStatValue: { fontSize: 17, color: colors.textPrimary, fontFamily: 'Poppins_700Bold' },
  quickStatLabel: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  sectionTitle: {
    fontSize: 13, color: colors.textTertiary, fontFamily: 'Poppins_600SemiBold',
    marginBottom: 12, paddingHorizontal: 20, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  empty: { alignItems: 'center', paddingTop: 40, gap: 12, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' },
  emptyText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', textAlign: 'center' },
});
