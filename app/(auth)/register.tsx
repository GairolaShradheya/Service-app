import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, UserRole } from '@/context/AuthContext';
import { ServiceType, CITIES } from '@/constants/mockData';
import colors from '@/constants/colors';

export default function Register() {
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { register } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [serviceType, setServiceType] = useState<ServiceType>('plumber');
  const [experience, setExperience] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const isProvider = role === 'provider';

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (isProvider && (!experience.trim() || !price.trim())) {
      Alert.alert('Missing fields', 'Please fill in your experience and price per hour.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: role || 'customer',
        city,
        ...(isProvider ? {
          serviceType,
          experience: parseInt(experience) || 1,
          pricePerHour: parseInt(price) || 300,
          available: true,
          description: `Professional ${serviceType} with ${experience} years of experience.`,
          skills: serviceType === 'plumber' ? ['Pipe Fitting', 'Leak Repair', 'Bathroom Installation'] : ['Home Wiring', 'Panel Upgrade', 'Lighting'],
          rating: 0,
          reviewCount: 0,
          completedJobs: 0,
        } : {}),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.bg}>
        <LinearGradient colors={['#0F1E3D', '#0A0E1A']} style={StyleSheet.absoluteFill} />
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: Platform.OS === 'web' ? 67 + 24 : insets.top + 24, paddingBottom: insets.bottom + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>

          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <View style={[styles.iconWrap, { backgroundColor: isProvider ? colors.accent : colors.primary }]}>
              <Ionicons name={isProvider ? 'construct' : 'person'} size={28} color={colors.white} />
            </View>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Register as {isProvider ? 'Service Provider' : 'Customer'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.form}>
            {/* Common fields */}
            <InputField label="Full Name" icon="person-outline" value={name} onChangeText={setName} placeholder="John Doe" />
            <InputField label="Email" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboard="email-address" capitalize="none" />
            <InputField label="Phone" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+91 9876543210" keyboard="phone-pad" />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Min 6 characters"
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

            {/* City selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <Pressable onPress={() => setShowCityPicker(!showCityPicker)} style={styles.inputWrap}>
                <Ionicons name="location-outline" size={18} color={colors.textTertiary} />
                <Text style={[styles.input, { paddingVertical: 0, color: colors.textPrimary }]}>{city}</Text>
                <Ionicons name={showCityPicker ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textTertiary} />
              </Pressable>
              {showCityPicker && (
                <View style={styles.cityPicker}>
                  {CITIES.map((c) => (
                    <Pressable key={c} onPress={() => { setCity(c); setShowCityPicker(false); }} style={[styles.cityOption, city === c && styles.cityOptionSelected]}>
                      <Text style={[styles.cityOptionText, city === c && { color: colors.primary }]}>{c}</Text>
                      {city === c && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Provider-only fields */}
            {isProvider && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Service Type</Text>
                  <View style={styles.toggleRow}>
                    <Pressable
                      onPress={() => setServiceType('plumber')}
                      style={[styles.toggleBtn, serviceType === 'plumber' && styles.toggleBtnActive]}
                    >
                      <Ionicons name="water-outline" size={16} color={serviceType === 'plumber' ? colors.white : colors.textSecondary} />
                      <Text style={[styles.toggleText, serviceType === 'plumber' && { color: colors.white }]}>Plumber</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setServiceType('electrician')}
                      style={[styles.toggleBtn, serviceType === 'electrician' && { ...styles.toggleBtnActive, backgroundColor: colors.electrician }]}
                    >
                      <Ionicons name="flash-outline" size={16} color={serviceType === 'electrician' ? colors.white : colors.textSecondary} />
                      <Text style={[styles.toggleText, serviceType === 'electrician' && { color: colors.white }]}>Electrician</Text>
                    </Pressable>
                  </View>
                </View>
                <InputField label="Years of Experience" icon="briefcase-outline" value={experience} onChangeText={setExperience} placeholder="e.g. 5" keyboard="numeric" />
                <InputField label="Price per Hour (₹)" icon="cash-outline" value={price} onChangeText={setPrice} placeholder="e.g. 350" keyboard="numeric" />
              </>
            )}

            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
            >
              <LinearGradient
                colors={isProvider ? [colors.accent, '#C2410C'] : [colors.primary, colors.primaryDark]}
                style={StyleSheet.absoluteFill} borderRadius={14}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
              <Text style={styles.registerBtnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
            </Pressable>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Already have an account?</Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.signupLink}>Sign in</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, icon, value, onChangeText, placeholder, keyboard, capitalize }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboard || 'default'}
          autoCapitalize={capitalize || 'words'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  back: { marginBottom: 20 },
  iconWrap: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 26, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginBottom: 28 },
  form: { gap: 14 },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  input: { flex: 1, fontSize: 14, color: colors.textPrimary, fontFamily: 'Poppins_400Regular' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
  },
  toggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_600SemiBold' },
  registerBtn: {
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden', marginTop: 8,
  },
  registerBtnText: { fontSize: 16, color: colors.white, fontFamily: 'Poppins_700Bold' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 20 },
  signupText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  signupLink: { fontSize: 14, color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
  cityPicker: {
    backgroundColor: colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden',
  },
  cityOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  cityOptionSelected: { backgroundColor: 'rgba(37,99,235,0.1)' },
  cityOptionText: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Poppins_400Regular' },
});
