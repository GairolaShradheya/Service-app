import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, SafeAreaView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

type Role = 'customer' | 'provider';

export default function Onboarding() {
  const [selected, setSelected] = useState<Role | null>(null);
  const insets = useSafeAreaInsets();

  const select = (role: Role) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(role);
  };

  const proceed = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/(auth)/register', params: { role: selected } });
  };

  return (
    <View style={styles.bg}>
      <LinearGradient
        colors={['#0A0E1A', '#0F1E3D', '#0A0E1A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      <SafeAreaView style={[styles.safe, { paddingTop: Platform.OS === 'web' ? 67 : insets.top }]}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="construct" size={28} color={colors.white} />
            </View>
            <Text style={styles.logoText}>FixIt Pro</Text>
          </View>
          <Text style={styles.tagline}>Home services at your fingertips</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.cards}>
          <Text style={styles.question}>I am a...</Text>

          <Pressable
            onPress={() => select('customer')}
            style={({ pressed }) => [
              styles.roleCard,
              selected === 'customer' && styles.roleCardSelected,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={selected === 'customer' ? ['rgba(37,99,235,0.25)', 'rgba(37,99,235,0.05)'] : ['transparent', 'transparent']}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            />
            <View style={[styles.roleIcon, selected === 'customer' && { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={32} color={colors.white} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Customer</Text>
              <Text style={styles.roleDesc}>Find and book skilled plumbers & electricians near you</Text>
            </View>
            {selected === 'customer' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </Pressable>

          <Pressable
            onPress={() => select('provider')}
            style={({ pressed }) => [
              styles.roleCard,
              selected === 'provider' && styles.roleCardSelected,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={selected === 'provider' ? ['rgba(249,115,22,0.25)', 'rgba(249,115,22,0.05)'] : ['transparent', 'transparent']}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            />
            <View style={[styles.roleIcon, { backgroundColor: selected === 'provider' ? colors.accent : colors.surface }, selected === 'provider' && { backgroundColor: colors.accent }]}>
              <Ionicons name="construct" size={32} color={colors.white} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>Service Provider</Text>
              <Text style={styles.roleDesc}>Offer your plumbing or electrical skills and earn</Text>
            </View>
            {selected === 'provider' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
            )}
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={proceed}
            disabled={!selected}
            style={({ pressed }) => [
              styles.continueBtn,
              !selected && styles.continueBtnDisabled,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={selected ? [colors.primary, colors.primaryDark] : [colors.surface, colors.surface]}
              style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Text style={[styles.continueBtnText, !selected && { color: colors.textTertiary }]}>
              Continue
            </Text>
            <Ionicons name="arrow-forward" size={20} color={selected ? colors.white : colors.textTertiary} />
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginTextBold}>Sign in</Text></Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  logoIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 28, color: colors.textPrimary, fontFamily: 'Poppins_700Bold' },
  tagline: { fontSize: 15, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  cards: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  question: { fontSize: 22, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 16 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 20, borderRadius: 20, marginBottom: 16,
    borderWidth: 1.5, borderColor: colors.cardBorder, overflow: 'hidden',
  },
  roleCardSelected: { borderColor: colors.primary },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  roleIcon: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  roleInfo: { flex: 1 },
  roleTitle: { fontSize: 17, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 4 },
  roleDesc: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', lineHeight: 18 },
  bottom: { paddingHorizontal: 20 },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 16, overflow: 'hidden', marginBottom: 16,
  },
  continueBtnDisabled: {},
  continueBtnText: { fontSize: 16, color: colors.white, fontFamily: 'Poppins_700Bold' },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  loginTextBold: { color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
});
