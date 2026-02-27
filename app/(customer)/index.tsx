import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, Pressable,
  Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Provider, CITIES } from '@/constants/mockData';
import { ProviderCard } from '@/components/ProviderCard';
import { useAuth } from '@/context/AuthContext';
import colors from '@/constants/colors';
import { firestore } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

type Filter = 'all' | 'plumber' | 'electrician';

export default function CustomerHome() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedCity, setSelectedCity] = useState<string>(user?.city || 'Mumbai');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);

  // subscribe to provider collection in Firestore
  useEffect(() => {
    const providersCol = collection(firestore, 'providers');
    const q = query(providersCol);
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => {
        const data = d.data() as any;
        // compute missing fields with defaults
        const name: string = data.name || '';
        return {
          id: d.id,
          name,
          initials: name
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .toUpperCase(),
          avatarColor: data.avatarColor || colors.primary,
          serviceType: data.serviceType as any,
          city: data.city || '',
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
        } as Provider;
      });
      setProviders(arr);
    });
    return unsub;
  }, []);

  const filtered = providers.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'all' || p.serviceType === filter;
    const matchCity = p.city === selectedCity;
    return matchSearch && matchFilter && matchCity;
  });

  const onProviderPress = useCallback((provider: Provider) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/provider-detail', params: { id: provider.id } });
  }, []);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={[styles.header, { paddingTop: topInset + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Pressable onPress={() => setShowCityPicker(!showCityPicker)} style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.primary} />
              <Text style={styles.locationText}>{selectedCity}</Text>
              <Ionicons name={showCityPicker ? 'chevron-up' : 'chevron-down'} size={12} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Pressable style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* City picker dropdown */}
        {showCityPicker && (
          <View style={styles.cityDropdown}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
              {CITIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => { setSelectedCity(c); setShowCityPicker(false); }}
                  style={[styles.cityChip, selectedCity === c && styles.cityChipActive]}
                >
                  <Text style={[styles.cityChipText, selectedCity === c && { color: colors.white }]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plumbers, electricians..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.filters}>
          {(['all', 'plumber', 'electrician'] as Filter[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => { setFilter(f); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
            >
              {f === 'plumber' && <Ionicons name="water-outline" size={13} color={filter === f ? colors.white : colors.textSecondary} />}
              {f === 'electrician' && <Ionicons name="flash-outline" size={13} color={filter === f ? colors.white : colors.textSecondary} />}
              {f === 'all' && <Ionicons name="grid-outline" size={13} color={filter === f ? colors.white : colors.textSecondary} />}
              <Text style={[styles.filterText, filter === f && { color: colors.white }]}>
                {f === 'all' ? 'All Services' : f === 'plumber' ? 'Plumbers' : 'Electricians'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{filtered.length} professionals found</Text>
          <View style={styles.availableRow}>
            <View style={styles.greenDot} />
            <Text style={styles.availableText}>{filtered.filter((p) => p.available).length} available now</Text>
          </View>
        </View>
      </Animated.View>

      {/* Provider list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
            <ProviderCard provider={item} onPress={() => onProviderPress(item)} />
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No providers found</Text>
            <Text style={styles.emptyText}>Try changing your search or city</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.background, paddingBottom: 8 },
  headerTop: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 12,
  },
  greeting: { fontSize: 22, color: colors.textPrimary, fontFamily: 'Poppins_700Bold', marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  notifBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  cityDropdown: {
    marginHorizontal: 20, marginBottom: 10,
    backgroundColor: colors.card, borderRadius: 12, padding: 8,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  cityChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder,
  },
  cityChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cityChipText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    marginHorizontal: 20, marginBottom: 12,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary, fontFamily: 'Poppins_400Regular' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 10 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_600SemiBold' },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 8,
  },
  statsText: { fontSize: 12, color: colors.textTertiary, fontFamily: 'Poppins_400Regular' },
  availableRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  availableText: { fontSize: 12, color: colors.success, fontFamily: 'Poppins_500Medium' },
  list: { paddingTop: 8, paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' },
  emptyText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
});
