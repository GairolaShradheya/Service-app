import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { firestore } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';

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
// chats stored in Firestore collection
const CHATS_COLLECTION = collection(firestore, 'chats');

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);

  // realtime listener for chat documents
  useEffect(() => {
    const q = query(CHATS_COLLECTION, orderBy('lastTimestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const arr: Chat[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Chat, 'id'>),
      }));
      setChats(arr);
    });
    return unsub;
  }, []);

  const startOrGetChat = useCallback(async (
    providerId: string, providerName: string, providerInitials: string, providerColor: string,
    customerId: string, customerName: string
  ): Promise<Chat> => {
    // try to find existing chat via query
    const q = query(
      CHATS_COLLECTION,
      where('providerId', '==', providerId),
      where('customerId', '==', customerId),
      limit(1),
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...(d.data() as Omit<Chat, 'id'>) };
    }
    const newDoc = await addDoc(CHATS_COLLECTION, {
      providerId,
      providerName,
      providerInitials,
      providerColor,
      customerId,
      customerName,
      lastMessage: '',
      lastTimestamp: serverTimestamp(),
      unreadCount: 0,
      messages: [],
    } as DocumentData);
    const d = await getDoc(newDoc);
    const chat: Chat = { id: newDoc.id, ...(d.data() as Omit<Chat, 'id'>) };
    return chat;
  }, []);

  const sendMessage = useCallback(async (chatId: string, senderId: string, text: string) => {
    const msg: Message = {
      id: `msg_${Date.now()}`,
      senderId,
      text,
      timestamp: new Date().toISOString(),
    };
    // push message array locally
    const chatRef = doc(CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      messages: [...(chats.find((c) => c.id === chatId)?.messages || []), msg],
      lastMessage: text,
      lastTimestamp: msg.timestamp,
      unreadCount: (chats.find((c) => c.id === chatId)?.unreadCount || 0) + 1,
    });

    // provider reply simulation could remain local or push to firestore
    setTimeout(async () => {
      const reply: Message = {
        id: `msg_${Date.now()}_reply`,
        senderId: 'provider',
        text: 'This is an automated response.',
        timestamp: new Date().toISOString(),
      };
      await updateDoc(chatRef, {
        messages: [...(chats.find((c) => c.id === chatId)?.messages || []), msg, reply],
        lastMessage: reply.text,
        lastTimestamp: reply.timestamp,
      });
    }, 2000);
  }, [chats]);

  const markAsRead = useCallback(async (chatId: string) => {
    await updateDoc(doc(CHATS_COLLECTION, chatId), { unreadCount: 0 });
  }, []);

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
