import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  providerId: string;
  providerName: string;
  providerInitials: string;
  providerColor: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: Message[];
}

interface ChatContextValue {
  chats: Chat[];
  startOrGetChat: (providerId: string, providerName: string, providerInitials: string, providerColor: string, customerId: string, customerName: string) => Chat;
  sendMessage: (chatId: string, senderId: string, text: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  getChatById: (chatId: string) => Chat | undefined;
}

const ChatContext = createContext<ChatContextValue | null>(null);
const STORAGE_KEY = 'fixit_chats';

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setChats(JSON.parse(stored));
    });
  }, []);

  const save = async (updated: Chat[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setChats(updated);
  };

  const startOrGetChat = useCallback((
    providerId: string, providerName: string, providerInitials: string, providerColor: string,
    customerId: string, customerName: string
  ): Chat => {
    const existing = chats.find((c) => c.providerId === providerId && c.customerId === customerId);
    if (existing) return existing;
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      providerId, providerName, providerInitials, providerColor,
      customerId, customerName,
      lastMessage: '',
      lastTimestamp: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
    };
    const updated = [newChat, ...chats];
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setChats(updated);
    return newChat;
  }, [chats]);

  const sendMessage = useCallback(async (chatId: string, senderId: string, text: string) => {
    const msg: Message = {
      id: `msg_${Date.now()}`,
      senderId,
      text,
      timestamp: new Date().toISOString(),
    };
    const updated = chats.map((c) => {
      if (c.id !== chatId) return c;
      return {
        ...c,
        messages: [...c.messages, msg],
        lastMessage: text,
        lastTimestamp: msg.timestamp,
        unreadCount: c.unreadCount + 1,
      };
    });
    await save(updated);

    // Simulate provider reply after 2 seconds
    const replies = [
      'Sure, I can help with that!',
      'I will be there on time.',
      'Thank you for reaching out.',
      'Can you share more details?',
      'I am available at the scheduled time.',
      'The work will be done efficiently.',
    ];
    setTimeout(async () => {
      const reply: Message = {
        id: `msg_${Date.now()}_reply`,
        senderId: 'provider',
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toISOString(),
      };
      setChats((prev) => {
        const withReply = prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            messages: [...c.messages, reply],
            lastMessage: reply.text,
            lastTimestamp: reply.timestamp,
          };
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(withReply));
        return withReply;
      });
    }, 2000);
  }, [chats]);

  const markAsRead = useCallback(async (chatId: string) => {
    const updated = chats.map((c) => c.id === chatId ? { ...c, unreadCount: 0 } : c);
    await save(updated);
  }, [chats]);

  const getChatById = useCallback((chatId: string) => chats.find((c) => c.id === chatId), [chats]);

  const value = useMemo(() => ({
    chats, startOrGetChat, sendMessage, markAsRead, getChatById,
  }), [chats, startOrGetChat, sendMessage, markAsRead, getChatById]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
