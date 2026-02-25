import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceType } from '@/constants/mockData';
import colors from '@/constants/colors';

interface ServiceBadgeProps {
  serviceType: ServiceType;
  size?: 'sm' | 'md';
}

export function ServiceBadge({ serviceType, size = 'md' }: ServiceBadgeProps) {
  const isPlumber = serviceType === 'plumber';
  const bgColor = isPlumber ? 'rgba(59,130,246,0.15)' : 'rgba(251,191,36,0.15)';
  const textColor = isPlumber ? colors.plumber : colors.electrician;
  const icon = isPlumber ? 'water' : 'flash';
  const label = isPlumber ? 'Plumber' : 'Electrician';
  const iconSize = size === 'sm' ? 11 : 13;
  const fontSize = size === 'sm' ? 10 : 12;
  const padding = size === 'sm' ? { paddingHorizontal: 8, paddingVertical: 3 } : { paddingHorizontal: 10, paddingVertical: 5 };

  return (
    <View style={[styles.badge, { backgroundColor: bgColor, ...padding }]}>
      <Ionicons name={icon as any} size={iconSize} color={textColor} />
      <Text style={[styles.label, { color: textColor, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
  },
});
