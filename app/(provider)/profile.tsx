import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/Avatar';
import { ServiceBadge } from '@/components/ServiceBadge';
import { RatingStars } from '@/components/RatingStars';
import colors from '@/constants/colors';

export default function ProviderProfile() {
  const { user, updateUser, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(user?.description || '');
  const [price, setPrice] = useState(String(user?.pricePerHour || ''));

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'P';
  const avatarColor = colors.accent;

  const toggleAvailable = async (val: boolean) => {
    await updateUser({ available: val });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const saveEdits = async () => {
    await updateUser({ description: desc, pricePerHour: parseInt(price) || user?.pricePerHour });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <LinearGradient colors={['rgba(249,115,22,0.15)', 'transparent']} style={StyleSheet.absoluteFill} />
        <Avatar initials={initials} color={avatarColor} size={80} />
        <Text style={styles.name}>{user?.name}</Text>
        {user?.serviceType && <ServiceBadge serviceType={user.serviceType} />}
        <View style={styles.statsRow}>
          {(user?.rating || 0) > 0 && <RatingStars rating={user?.rating || 0} reviewCount={user?.reviewCount} />}
          <View style={styles.statPill}>
            <Ionicons name="briefcase-outline" size={13} color={colors.accent} />
            <Text style={styles.statText}>{user?.completedJobs || 0} jobs</Text>
          </View>
        </View>
        <View style={styles.availRow}>
          <View style={[styles.availDot, { backgroundColor: user?.available ? colors.success : colors.error }]} />
          <Text style={styles.availText}>{user?.available ? 'Available for jobs' : 'Offline'}</Text>
          <Switch
            value={user?.available ?? true}
            onValueChange={toggleAvailable}
            trackColor={{ false: colors.cardBorder, true: colors.success }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Skills */}
      {(user?.skills?.length || 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsWrap}>
            {user?.skills?.map((skill) => (
              <View key={skill} style={styles.skill}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <Pressable onPress={() => editing ? saveEdits() : setEditing(true)} style={styles.editBtn}>
            <Ionicons name={editing ? 'checkmark' : 'pencil-outline'} size={16} color={colors.accent} />
            <Text style={styles.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <DetailRow icon="mail-outline" label="Email" value={user?.email || ''} />
          <DetailRow icon="call-outline" label="Phone" value={user?.phone || ''} />
          <DetailRow icon="location-outline" label="City" value={user?.city || ''} />
          <DetailRow icon="briefcase-outline" label="Experience" value={`${user?.experience || 0} years`} />
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={18} color={colors.textTertiary} />
            <Text style={styles.detailLabel}>Price/Hr</Text>
            {editing ? (
              <TextInput
                style={styles.detailInput}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Text style={styles.detailValue}>₹{user?.pricePerHour}/hr</Text>
            )}
          </View>
          <View style={[styles.detailRow, { alignItems: 'flex-start', borderBottomWidth: 0 }]}>
            <Ionicons name="document-text-outline" size={18} color={colors.textTertiary} style={{ marginTop: 2 }} />
            <Text style={styles.detailLabel}>Bio</Text>
            {editing ? (
              <TextInput
                style={[styles.detailInput, { height: 80, textAlignVertical: 'top' }]}
                value={desc}
                onChangeText={setDesc}
                multiline
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Text style={[styles.detailValue, { flex: 1, lineHeight: 18 }]}>{user?.description}</Text>
            )}
          </View>
        </View>
      </View>

      <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.75 }]}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={18} color={colors.textTertiary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, gap: 10, overflow: 'hidden' },
  name: { fontSize: 22, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  availText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, color: colors.textTertiary, fontFamily: 'Poppins_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(249,115,22,0.1)' },
  editBtnText: { fontSize: 13, color: colors.accent, fontFamily: 'Poppins_600SemiBold' },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  skillText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  card: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  detailLabel: { fontSize: 13, color: colors.textTertiary, fontFamily: 'Poppins_400Regular', width: 70 },
  detailValue: { flex: 1, fontSize: 13, color: colors.textPrimary, fontFamily: 'Poppins_500Medium' },
  detailInput: { flex: 1, fontSize: 13, color: colors.textPrimary, fontFamily: 'Poppins_500Medium', backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginBottom: 16, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  logoutText: { fontSize: 15, color: colors.error, fontFamily: 'Poppins_600SemiBold' },
});
