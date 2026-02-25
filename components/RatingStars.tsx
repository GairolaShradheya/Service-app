import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/colors';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showNumber?: boolean;
  reviewCount?: number;
}

export function RatingStars({ rating, size = 14, showNumber = true, reviewCount }: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.container}>
      {stars.map((s) => (
        <Ionicons
          key={s}
          name={s <= Math.floor(rating) ? 'star' : s - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={size}
          color="#FBBF24"
        />
      ))}
      {showNumber && (
        <Text style={[styles.number, { fontSize: size }]}>{rating.toFixed(1)}</Text>
      )}
      {reviewCount !== undefined && (
        <Text style={[styles.reviews, { fontSize: size - 1 }]}>({reviewCount})</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  number: {
    color: colors.textPrimary,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 4,
  },
  reviews: {
    color: colors.textSecondary,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 2,
  },
});
