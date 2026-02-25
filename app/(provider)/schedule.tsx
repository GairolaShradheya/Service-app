import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import colors from '@/constants/colors';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];

export default function ProviderSchedule() {
  const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [activeDays, setActiveDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [activeSlots, setActiveSlots] = useState<string[]>(['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']);

  const toggleDay = (day: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toggleSlot = (slot: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSlots((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]);
  };

  const toggleAvailable = async (val: boolean) => {
    await updateUser({ available: val });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>My Schedule</Text>

      {/* Online status toggle */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="radio-outline" size={20} color={user?.available ? colors.success : colors.textTertiary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Available for Jobs</Text>
            <Text style={styles.cardSubtitle}>{user?.available ? 'You are visible to customers' : 'You are offline'}</Text>
          </View>
          <Switch
            value={user?.available ?? true}
            onValueChange={toggleAvailable}
            trackColor={{ false: colors.cardBorder, true: colors.success }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Working days */}
      <Text style={styles.sectionTitle}>Working Days</Text>
      <View style={styles.daysGrid}>
        {DAYS.map((day) => (
          <Pressable
            key={day}
            onPress={() => toggleDay(day)}
            style={({ pressed }) => [
              styles.dayChip,
              activeDays.includes(day) && styles.dayChipActive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.dayText, activeDays.includes(day) && { color: colors.white }]}>{day}</Text>
          </Pressable>
        ))}
      </View>

      {/* Time slots */}
      <Text style={styles.sectionTitle}>Available Time Slots</Text>
      <View style={styles.slotsGrid}>
        {TIME_SLOTS.map((slot) => (
          <Pressable
            key={slot}
            onPress={() => toggleSlot(slot)}
            style={({ pressed }) => [
              styles.slotChip,
              activeSlots.includes(slot) && styles.slotChipActive,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.slotText, activeSlots.includes(slot) && { color: colors.white }]}>{slot}</Text>
          </Pressable>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.summaryText}>
          You're available on {activeDays.length} days with {activeSlots.length} time slots per day.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  title: { fontSize: 26, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 16 },
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  sectionTitle: {
    fontSize: 13, color: colors.textTertiary, fontFamily: 'Poppins_600SemiBold',
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  dayChip: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_600SemiBold' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  slotChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
  },
  slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(37,99,235,0.1)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)',
  },
  summaryText: { flex: 1, fontSize: 13, color: colors.primary, fontFamily: 'Poppins_400Regular', lineHeight: 18 },
});
