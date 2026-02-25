import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/context/BookingsContext';
import { Avatar } from '@/components/Avatar';
import colors from '@/constants/colors';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const { getCustomerBookings } = useBookings();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const myBookings = getCustomerBookings(user?.id || '');
  const completed = myBookings.filter((b) => b.status === 'completed').length;
  const totalSpent = myBookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + b.totalAmount, 0);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const avatarColor = colors.primary;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: bottomInset + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <LinearGradient colors={['rgba(37,99,235,0.15)', 'transparent']} style={styles.heroBg} />
        <Avatar initials={initials} color={avatarColor} size={80} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons name="location-outline" size={13} color={colors.primary} />
            <Text style={styles.badgeText}>{user?.city}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="person-outline" size={13} color={colors.primary} />
            <Text style={styles.badgeText}>Customer</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{myBookings.length}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={[styles.statCard, styles.statCardMid]}>
          <Text style={styles.statValue}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{totalSpent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="person-circle-outline" label="Personal Details" subtitle={user?.phone} />
          <MenuItem icon="location-outline" label="My City" subtitle={user?.city} />
          <MenuItem icon="shield-checkmark-outline" label="Privacy & Security" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="help-circle-outline" label="Help & FAQ" />
          <MenuItem icon="chatbubble-outline" label="Contact Support" />
          <MenuItem icon="star-outline" label="Rate the App" />
        </View>
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.75 }]}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.version}>FixIt Pro v1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({ icon, label, subtitle }: { icon: string; label: string; subtitle?: string }) {
  return (
    <Pressable style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.menuInfo}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24,
    paddingTop: 10, overflow: 'hidden',
  },
  heroBg: { ...StyleSheet.absoluteFillObject },
  name: { fontSize: 22, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginTop: 12, marginBottom: 2 },
  email: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 10 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(37,99,235,0.12)',
  },
  badgeText: { fontSize: 12, color: colors.primary, fontFamily: 'Poppins_500Medium' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 24,
    backgroundColor: colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden',
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statCardMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.cardBorder },
  statValue: { fontSize: 18, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 2 },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 13, color: colors.textTertiary, fontFamily: 'Poppins_600SemiBold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center' },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Poppins_500Medium' },
  menuSubtitle: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 16, paddingVertical: 14, borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: { fontSize: 15, color: colors.error, fontFamily: 'Poppins_600SemiBold' },
  version: { textAlign: 'center', fontSize: 12, color: colors.textTertiary, fontFamily: 'Poppins_400Regular', marginBottom: 8 },
});
