import React, { useState ,useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  TextInput, Alert, KeyboardAvoidingView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { TIME_SLOTS } from '@/constants/mockData';
import { Provider } from '@/constants/mockData';
import { firestore } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';import { useBookings } from '@/context/BookingsContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/Avatar';
import colors from '@/constants/colors';
import RazorpayCheckout from 'react-native-razorpay';

function getDates(count: number) {
  const dates: { label: string; dayName: string; full: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      label: d.getDate().toString(),
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }
  return dates;
}

export default function Booking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(firestore, 'providers', id));
      if (snap.exists()) {
        const data = snap.data() as any;
        const name: string = data.name || '';
        setProvider({
          id: snap.id,
          name,
          initials: name
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .toUpperCase(),
          avatarColor: data.avatarColor || colors.primary,
          serviceType: data.serviceType,
          city: data.city,
          experience: data.experience || 0,
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          pricePerHour: data.pricePerHour || 0,
          available: data.available ?? false,
          description: data.description || '',
          skills: data.skills || [],
          completedJobs: data.completedJobs || 0,
          phone: data.phone || '',
          distance: data.distance || 0,
        });
      }
    })();
  }, [id]);  const dates = getDates(14);

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [hours, setHours] = useState(2);
  const [loading, setLoading] = useState(false);

  if (!provider) return null;

  const totalAmount = provider.pricePerHour * hours;

  const confirm = async () => {
    if (!selectedSlot) {
      Alert.alert('Select time', 'Please choose a time slot to proceed.');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      // first open razorpay checkout for payment
      const amountPaise = Math.round(totalAmount * 100); // razorpay expects smallest unit
      const options = {
        description: 'Service booking fee',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: '', // TODO: put your Razorpay API key here
        amount: amountPaise.toString(),
        name: provider.name,
        prefill: {
          email: user.email || '',
          contact: user.phone || '',
          name: user.name,
        },
        theme: { color: colors.primary },
      } as any;

      const paymentData = await RazorpayCheckout.open(options);
      // if we reach here payment succeeded
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      await addBooking({
        providerId: provider.id,
        providerName: provider.name,
        providerInitials: provider.initials,
        providerColor: provider.avatarColor,
        serviceType: provider.serviceType,
        date: dates[selectedDate].full,
        timeSlot: selectedSlot,
        status: 'pending',
        totalAmount,
        notes: notes.trim(),
        customerId: user.id,
        customerName: user.name,
        paymentId: paymentData.razorpay_payment_id,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Booking Confirmed!',
        `Your ${provider.serviceType} service with ${provider.name} has been booked for ${dates[selectedDate].full} at ${selectedSlot}. Total: ₹${totalAmount}`,
        [{ text: 'View Bookings', onPress: () => { router.dismissAll(); router.push('/(customer)/bookings'); } }]
      );
    } catch (e: any) {
      // if error originated from payment or booking
      const msg = e.description || e.message || 'Unable to complete transaction';
      Alert.alert('Payment Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: topInset + 16, paddingBottom: bottomInset + 120 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Book Service</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Provider summary */}
          <View style={styles.providerCard}>
            <Avatar initials={provider.initials} color={provider.avatarColor} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerType}>
                {provider.serviceType.charAt(0).toUpperCase() + provider.serviceType.slice(1)} · ₹{provider.pricePerHour}/hr
              </Text>
            </View>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingText}>{provider.rating}</Text>
            </View>
          </View>

          {/* Date selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
              {dates.map((date, i) => (
                <Pressable
                  key={i}
                  onPress={() => { setSelectedDate(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[styles.dateChip, selectedDate === i && styles.dateChipActive]}
                >
                  <Text style={[styles.dateDayName, selectedDate === i && { color: 'rgba(255,255,255,0.7)' }]}>{date.dayName}</Text>
                  <Text style={[styles.dateLabel, selectedDate === i && { color: colors.white }]}>{date.label}</Text>
                  {i === 0 && <Text style={[styles.todayLabel, selectedDate === i && { color: 'rgba(255,255,255,0.7)' }]}>Today</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Time slot selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.map((slot) => (
                <Pressable
                  key={slot}
                  onPress={() => { setSelectedSlot(slot); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
                >
                  <Text style={[styles.slotText, selectedSlot === slot && { color: colors.white }]}>{slot}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Duration selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration (hours)</Text>
            <View style={styles.durationRow}>
              <Pressable
                onPress={() => { if (hours > 1) setHours(hours - 1); }}
                style={styles.durationBtn}
              >
                <Ionicons name="remove" size={20} color={hours > 1 ? colors.textPrimary : colors.textTertiary} />
              </Pressable>
              <Text style={styles.durationValue}>{hours}</Text>
              <Pressable
                onPress={() => { if (hours < 8) setHours(hours + 1); }}
                style={styles.durationBtn}
              >
                <Ionicons name="add" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Describe the issue or special requirements..."
              placeholderTextColor={colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Price summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Price Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service charge</Text>
              <Text style={styles.summaryValue}>₹{provider.pricePerHour} × {hours} hrs</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform fee</Text>
              <Text style={styles.summaryValue}>₹0</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={[styles.ctaBar, { paddingBottom: bottomInset + 12 }]}>
          <View>
            <Text style={styles.ctaAmount}>₹{totalAmount}</Text>
            <Text style={styles.ctaLabel}>{hours} hr{hours > 1 ? 's' : ''} · {selectedSlot || 'Choose time'}</Text>
          </View>
          <Pressable
            onPress={confirm}
            disabled={loading || !selectedSlot}
            style={({ pressed }) => [
              styles.ctaBtn,
              (!selectedSlot) && styles.ctaBtnDisabled,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <LinearGradient
              colors={selectedSlot ? [colors.accent, '#C2410C'] : [colors.surface, colors.surface]}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Text style={[styles.ctaBtnText, !selectedSlot && { color: colors.textTertiary }]}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, color: colors.textPrimary, fontFamily: 'Poppins_700Bold' },
  providerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card, marginHorizontal: 20, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 20,
  },
  providerName: { fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 2 },
  providerType: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(251,191,36,0.15)',
  },
  ratingText: { fontSize: 13, color: '#FBBF24', fontFamily: 'Poppins_700Bold' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 12 },
  dateChip: {
    width: 58, alignItems: 'center', paddingVertical: 12, borderRadius: 14,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
  },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateDayName: { fontSize: 11, color: colors.textTertiary, fontFamily: 'Poppins_500Medium', marginBottom: 4 },
  dateLabel: { fontSize: 18, color: colors.textPrimary, fontFamily: 'Poppins_700Bold' },
  todayLabel: { fontSize: 9, color: colors.textTertiary, fontFamily: 'Poppins_400Regular', marginTop: 2 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
  },
  slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  durationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 20,
    backgroundColor: colors.card, borderRadius: 14, padding: 6, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  durationBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  durationValue: { fontSize: 22, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', minWidth: 30, textAlign: 'center' },
  notesInput: {
    backgroundColor: colors.card, borderRadius: 14, padding: 14,
    fontSize: 14, color: colors.textPrimary, fontFamily: 'Poppins_400Regular',
    borderWidth: 1, borderColor: colors.cardBorder, minHeight: 80,
  },
  summary: {
    marginHorizontal: 20, backgroundColor: colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.cardBorder, gap: 10,
  },
  summaryTitle: { fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  summaryValue: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  totalRow: {
    borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 10, marginTop: 4,
  },
  totalLabel: { fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_700Bold' },
  totalValue: { fontSize: 18, color: colors.accent, fontFamily: 'Poppins_700Bold' },
  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 20, paddingTop: 16,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },
  ctaAmount: { fontSize: 20, color: colors.textPrimary, fontFamily: 'Poppins_700Bold' },
  ctaLabel: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  ctaBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  ctaBtnDisabled: {},
  ctaBtnText: { fontSize: 15, color: colors.white, fontFamily: 'Poppins_700Bold' },
});
