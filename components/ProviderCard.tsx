import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from '@/constants/mockData';
import { Avatar } from './Avatar';
import { RatingStars } from './RatingStars';
import { ServiceBadge } from './ServiceBadge';
import colors from '@/constants/colors';

interface ProviderCardProps {
  provider: Provider;
  onPress: () => void;
}

export function ProviderCard({ provider, onPress }: ProviderCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Avatar initials={provider.initials} color={provider.avatarColor} size={52} />
          {provider.available && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{provider.name}</Text>
          <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} size={12} />
          <View style={styles.row}>
            <ServiceBadge serviceType={provider.serviceType} size="sm" />
          </View>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.price}>₹{provider.pricePerHour}</Text>
          <Text style={styles.perHr}>/hr</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Ionicons name="briefcase-outline" size={13} color={colors.textTertiary} />
          <Text style={styles.statText}>{provider.experience}y exp</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="checkmark-circle-outline" size={13} color={colors.textTertiary} />
          <Text style={styles.statText}>{provider.completedJobs} jobs</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
          <Text style={styles.statText}>{provider.distance} km</Text>
        </View>
        <View style={styles.cityTag}>
          <Text style={styles.cityText}>{provider.city}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  info: { flex: 1, gap: 4 },
  name: {
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: 'Poppins_600SemiBold',
  },
  row: { flexDirection: 'row', gap: 6, marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  price: {
    fontSize: 18,
    color: colors.accent,
    fontFamily: 'Poppins_700Bold',
  },
  perHr: {
    fontSize: 11,
    color: colors.textTertiary,
    fontFamily: 'Poppins_400Regular',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    gap: 12,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: colors.textTertiary, fontFamily: 'Poppins_400Regular' },
  cityTag: {
    marginLeft: 'auto',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cityText: { fontSize: 11, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
});
