import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Provider, Review } from '@/constants/mockData';
import { Avatar } from '@/components/Avatar';
import { RatingStars } from '@/components/RatingStars';
import { ServiceBadge } from '@/components/ServiceBadge';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import colors from '@/constants/colors';
import { firestore } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function ProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { startOrGetChat } = useChat();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!id) return;
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

    (async () => {
      const q = query(collection(firestore, 'reviews'), where('providerId', '==', id));
      const snap = await getDocs(q);
      const arr: Review[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }));
      setReviews(arr);
    })();
  }, [id]);
  if (!provider) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textPrimary }}>Provider not found</Text>
      </View>
    );
  }

  const openChat = () => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const chat = startOrGetChat(
      provider.id, provider.name, provider.initials, provider.avatarColor,
      user.id, user.name
    );
    router.push({ pathname: '/chat-room', params: { chatId: chat.id } });
  };

  const bookNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/booking', params: { id: provider.id } });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 100 }}
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: topInset + 16 }]}>
          <LinearGradient
            colors={provider.serviceType === 'plumber'
              ? ['rgba(59,130,246,0.25)', '#0A0E1A']
              : ['rgba(251,191,36,0.25)', '#0A0E1A']}
            style={StyleSheet.absoluteFill}
          />
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>

          <Avatar initials={provider.initials} color={provider.avatarColor} size={90} />
          {provider.available && (
            <View style={styles.availBadge}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>Available Now</Text>
            </View>
          )}
          <Text style={styles.name}>{provider.name}</Text>
          <View style={styles.heroRow}>
            <ServiceBadge serviceType={provider.serviceType} />
            <View style={styles.cityBadge}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.cityText}>{provider.city}</Text>
            </View>
          </View>
          <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} size={14} />
        </View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsCard}>
          <StatItem icon="briefcase-outline" value={`${provider.experience}yrs`} label="Experience" />
          <View style={styles.statDivider} />
          <StatItem icon="checkmark-circle-outline" value={String(provider.completedJobs)} label="Jobs Done" color={colors.success} />
          <View style={styles.statDivider} />
          <StatItem icon="cash-outline" value={`₹${provider.pricePerHour}`} label="Per Hour" color={colors.accent} />
          <View style={styles.statDivider} />
          <StatItem icon="location-outline" value={`${provider.distance}km`} label="Distance" />
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{provider.description}</Text>
        </Animated.View>

        {/* Skills */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.skillsWrap}>
            {provider.skills.map((skill) => (
              <View key={skill} style={styles.skill}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Reviews */}
        {reviews.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewInitial}>{review.customerName[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{review.customerName}</Text>
                    <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                  </View>
                  <RatingStars rating={review.rating} showNumber={false} size={13} />
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.actions, { paddingBottom: bottomInset + 12 }]}>
        <Pressable onPress={openChat} style={({ pressed }) => [styles.chatBtn, pressed && { opacity: 0.75 }]}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          <Text style={styles.chatBtnText}>Chat</Text>
        </Pressable>
        <Pressable onPress={bookNow} style={({ pressed }) => [styles.bookBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}>
          <LinearGradient
            colors={[colors.accent, '#C2410C']}
            style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Ionicons name="calendar-outline" size={20} color={colors.white} />
          <Text style={styles.bookBtnText}>Book Now · ₹{provider.pricePerHour}/hr</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StatItem({ icon, value, label, color }: { icon: string; value: string; label: string; color?: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon as any} size={18} color={color || colors.textSecondary} />
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24,
    gap: 10, overflow: 'hidden', position: 'relative',
  },
  backBtn: {
    position: 'absolute', left: 20, top: undefined,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  availDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  availText: { fontSize: 12, color: colors.success, fontFamily: 'Poppins_600SemiBold' },
  name: { fontSize: 24, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginTop: 4 },
  heroRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  cityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    backgroundColor: colors.card,
  },
  cityText: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  statsCard: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 20,
    backgroundColor: colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 4 },
  statDivider: { width: 1, backgroundColor: colors.cardBorder },
  statValue: { fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_700Bold' },
  statLabel: { fontSize: 10, color: colors.textTertiary, fontFamily: 'Poppins_400Regular' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    fontSize: 16, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 12,
  },
  description: {
    fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular',
    lineHeight: 22, backgroundColor: colors.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(37,99,235,0.1)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)',
  },
  skillText: { fontSize: 13, color: colors.primary, fontFamily: 'Poppins_500Medium' },
  reviewCard: {
    backgroundColor: colors.card, borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  reviewInitial: { fontSize: 14, color: colors.white, fontFamily: 'Poppins_700Bold' },
  reviewName: { fontSize: 13, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold', marginBottom: 2 },
  reviewDate: { fontSize: 11, color: colors.textTertiary, fontFamily: 'Poppins_400Regular' },
  reviewComment: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', lineHeight: 20 },
  actions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 16,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16,
    backgroundColor: 'rgba(37,99,235,0.12)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.25)',
  },
  chatBtnText: { fontSize: 15, color: colors.primary, fontFamily: 'Poppins_700Bold' },
  bookBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 16, overflow: 'hidden',
  },
  bookBtnText: { fontSize: 15, color: colors.white, fontFamily: 'Poppins_700Bold' },
});
