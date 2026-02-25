import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import colors from '@/constants/colors';

export default function Login() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.bg}>
        <LinearGradient colors={['#0F1E3D', '#0A0E1A']} style={StyleSheet.absoluteFill} />
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: Platform.OS === 'web' ? 67 + 40 : insets.top + 40, paddingBottom: insets.bottom + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>

          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <View style={styles.iconWrap}>
              <Ionicons name="construct" size={32} color={colors.white} />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your FixIt Pro account</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                />
                <Pressable onPress={() => setShowPw(!showPw)}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textTertiary} />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
            >
              <LinearGradient colors={[colors.primary, colors.primaryDark]} style={StyleSheet.absoluteFill} borderRadius={14} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              <Text style={styles.loginBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <Pressable onPress={() => router.push('/onboarding')}>
                <Text style={styles.signupLink}>Sign up</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  back: { marginBottom: 24 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 28, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginBottom: 32 },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_400Regular' },
  loginBtn: {
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden', marginTop: 8,
  },
  loginBtnText: { fontSize: 16, color: colors.white, fontFamily: 'Poppins_700Bold' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.cardBorder },
  dividerText: { fontSize: 13, color: colors.textTertiary, fontFamily: 'Poppins_400Regular' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  signupText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  signupLink: { fontSize: 14, color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
});
