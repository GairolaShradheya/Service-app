import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/Avatar';
import colors from '@/constants/colors';

export default function CustomerChats() {
  const { user } = useAuth();
  const { chats, markAsRead } = useChat();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const myChats = chats.filter((c) => c.customerId === user?.id);

  const openChat = (chatId: string) => {
    markAsRead(chatId);
    router.push({ pathname: '/chat-room', params: { chatId } });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={myChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
            <Pressable
              onPress={() => openChat(item.id)}
              style={({ pressed }) => [styles.chatItem, pressed && styles.pressed]}
            >
              <View style={styles.avatarWrap}>
                <Avatar initials={item.providerInitials} color={item.providerColor} size={50} />
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatTop}>
                  <Text style={styles.chatName}>{item.providerName}</Text>
                  <Text style={styles.chatTime}>{item.lastTimestamp ? formatTime(item.lastTimestamp) : ''}</Text>
                </View>
                <Text style={styles.chatPreview} numberOfLines={1}>
                  {item.lastMessage || 'No messages yet'}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!myChats.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={52} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>Start a chat by messaging a provider from their profile</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, color: colors.textPrimary, fontFamily: 'Poppins_700Bold' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  chatItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  pressed: { opacity: 0.75 },
  avatarWrap: { position: 'relative' },
  unreadBadge: {
    position: 'absolute', top: -2, right: -2,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  unreadText: { fontSize: 10, color: colors.white, fontFamily: 'Poppins_700Bold' },
  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' },
  chatTime: { fontSize: 12, color: colors.textTertiary, fontFamily: 'Poppins_400Regular' },
  chatPreview: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' },
  emptyText: { fontSize: 14, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', textAlign: 'center' },
});
