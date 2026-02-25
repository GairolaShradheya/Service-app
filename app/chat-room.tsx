import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/Avatar';
import colors from '@/constants/colors';

export default function ChatRoom() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user } = useAuth();
  const { getChatById, sendMessage, markAsRead } = useChat();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const chat = getChatById(chatId || '');

  useEffect(() => {
    if (chatId) markAsRead(chatId);
  }, [chatId]);

  useEffect(() => {
    if (chat?.messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chat?.messages.length]);

  const send = async () => {
    if (!text.trim() || !user || !chatId) return;
    const msg = text.trim();
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(chatId, user.id, msg);
  };

  if (!chat) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.textPrimary }}>Chat not found</Text>
      </View>
    );
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isProviderMsg = (senderId: string) => senderId !== user?.id;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Avatar initials={chat.providerInitials} color={chat.providerColor} size={38} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{chat.providerName}</Text>
            <Text style={styles.headerStatus}>Professional</Text>
          </View>
          <Pressable style={styles.callBtn}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
          </Pressable>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={chat.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Avatar initials={chat.providerInitials} color={chat.providerColor} size={64} />
              <Text style={styles.emptyTitle}>{chat.providerName}</Text>
              <Text style={styles.emptyText}>Start a conversation about your service needs</Text>
            </View>
          }
          renderItem={({ item }) => {
            const fromProvider = isProviderMsg(item.senderId);
            return (
              <View style={[styles.msgRow, fromProvider ? styles.msgRowLeft : styles.msgRowRight]}>
                {fromProvider && (
                  <Avatar initials={chat.providerInitials} color={chat.providerColor} size={28} />
                )}
                <View style={[styles.bubble, fromProvider ? styles.bubbleLeft : styles.bubbleRight]}>
                  <Text style={[styles.bubbleText, fromProvider ? styles.bubbleTextLeft : styles.bubbleTextRight]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.bubbleTime, fromProvider ? { color: colors.textTertiary } : { color: 'rgba(255,255,255,0.6)' }]}>
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: bottomInset + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={send}
            disabled={!text.trim()}
            style={({ pressed }) => [styles.sendBtn, !text.trim() && styles.sendBtnDisabled, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="send" size={18} color={text.trim() ? colors.white : colors.textTertiary} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 15, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' },
  headerStatus: { fontSize: 11, color: colors.success, fontFamily: 'Poppins_400Regular' },
  callBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(37,99,235,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  messages: { flexGrow: 1, padding: 16, gap: 10 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '80%' },
  msgRowLeft: { alignSelf: 'flex-start' },
  msgRowRight: { alignSelf: 'flex-end' },
  bubble: { maxWidth: '100%', padding: 12, borderRadius: 16 },
  bubbleLeft: {
    backgroundColor: colors.card, borderTopLeftRadius: 4,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  bubbleRight: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20, fontFamily: 'Poppins_400Regular', marginBottom: 4 },
  bubbleTextLeft: { color: colors.textPrimary },
  bubbleTextRight: { color: colors.white },
  bubbleTime: { fontSize: 10, fontFamily: 'Poppins_400Regular', alignSelf: 'flex-end' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 17, color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' },
  emptyText: { fontSize: 13, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', textAlign: 'center' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingTop: 10,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },
  input: {
    flex: 1, backgroundColor: colors.card, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100,
    fontSize: 14, color: colors.textPrimary, fontFamily: 'Poppins_400Regular',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.card },
});
