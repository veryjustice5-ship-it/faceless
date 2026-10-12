import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, ChatRoom } from '../types/chat';
import { INITIAL_ROOMS, INITIAL_MESSAGES, CHAT_COLORS } from '../data/initialChats';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

const CHAT_STORAGE_KEY = 'faceless_chat_messages_v2';
const ROOMS_STORAGE_KEY = 'faceless_chat_rooms_v2';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function isMessageExpired(createdAtIso: string): boolean {
  try {
    const age = Date.now() - new Date(createdAtIso).getTime();
    return age >= TWENTY_FOUR_HOURS_MS;
  } catch {
    return true;
  }
}

export function formatExpiryCountdown(createdAtIso: string): string {
  try {
    const expiresAt = new Date(createdAtIso).getTime() + TWENTY_FOUR_HOURS_MS;
    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) return 'expired';

    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    if (remainingHours > 0) {
      return `${remainingHours}h ${remainingMinutes}m left`;
    }
    return `${remainingMinutes}m left`;
  } catch {
    return '24h limit';
  }
}

export function useChatStore(deviceId: string, userProfile: { alias: string; avatar: string }) {
  const [rooms, setRooms] = useState<ChatRoom[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>('room-quad');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Filter out any messages older than 24 hours
  const pruneExpiredMessages = useCallback((msgs: ChatMessage[]): ChatMessage[] => {
    return msgs.filter((m) => !isMessageExpired(m.createdAt));
  }, []);

  // Multi-tab broadcast channel for local instant bounce
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('faceless_chat_broadcast');
        channelRef.current = channel;
        return () => {
          channel.close();
        };
      } catch (e) {
        console.warn('BroadcastChannel error', e);
      }
    }
  }, []);

  // 1. REAL-TIME FIRESTORE LISTENER FOR ROOMS
  useEffect(() => {
    const roomsCol = collection(db, 'chatRooms');
    const unsubscribe = onSnapshot(
      roomsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial chat rooms into Firestore so all devices share them
          try {
            for (const r of INITIAL_ROOMS) {
              await setDoc(doc(db, 'chatRooms', r.id), r);
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, 'chatRooms');
          }
          setRooms(INITIAL_ROOMS);
        } else {
          const loadedRooms: ChatRoom[] = [];
          snapshot.forEach((docSnap) => {
            loadedRooms.push(docSnap.data() as ChatRoom);
          });
          setRooms(loadedRooms);
          try {
            localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(loadedRooms));
          } catch {}
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'chatRooms');
        // Fallback to local storage if Firestore connection errors
        const cached = localStorage.getItem(ROOMS_STORAGE_KEY);
        if (cached) {
          try {
            setRooms(JSON.parse(cached));
          } catch {}
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. REAL-TIME FIRESTORE LISTENER FOR MESSAGES IN ACTIVE ROOM
  useEffect(() => {
    if (!activeRoomId) return;

    const messagesCol = collection(db, 'chatRooms', activeRoomId, 'messages');
    const unsubscribe = onSnapshot(
      messagesCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed room initial messages if Quad room and clean
          if (activeRoomId === 'room-quad') {
            const initialForQuad = INITIAL_MESSAGES.filter((m) => m.roomId === 'room-quad');
            for (const m of initialForQuad) {
              try {
                await setDoc(doc(db, 'chatRooms', activeRoomId, 'messages', m.id), m);
              } catch {}
            }
          }
          setMessages([]);
        } else {
          const loaded: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as ChatMessage);
          });
          // Sort by creation time ascending
          loaded.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const valid = pruneExpiredMessages(loaded);
          setMessages(valid);
          try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(valid));
          } catch {}
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `chatRooms/${activeRoomId}/messages`);
        // Fallback to local cache
        const cached = localStorage.getItem(CHAT_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setMessages(pruneExpiredMessages(parsed));
          } catch {}
        }
      }
    );

    return () => unsubscribe();
  }, [activeRoomId, pruneExpiredMessages]);

  // 3. Periodic timer to prune 24h expired messages
  useEffect(() => {
    const pruneTimer = setInterval(() => {
      setMessages((prev) => {
        const pruned = pruneExpiredMessages(prev);
        if (pruned.length !== prev.length) {
          try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(pruned));
          } catch {}
        }
        return pruned;
      });
    }, 30000);

    return () => clearInterval(pruneTimer);
  }, [pruneExpiredMessages]);

  // SEND A MESSAGE (SYNCED TO FIRESTORE IN REAL-TIME)
  const sendMessage = useCallback(
    async (
      roomId: string,
      content: string,
      replyTo?: { id: string; senderAlias: string; content: string },
      imageUrl?: string
    ) => {
      if (!content.trim() && !imageUrl) return;

      const randomColor = CHAT_COLORS[Math.floor(Math.random() * CHAT_COLORS.length)];
      const msgId = 'msg-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);

      const newMsg: ChatMessage = {
        id: msgId,
        roomId,
        senderId: deviceId,
        senderAlias: userProfile.alias,
        senderAvatar: userProfile.avatar,
        senderColor: randomColor,
        content: content.trim(),
        imageUrl,
        createdAt: new Date().toISOString(),
        replyTo,
        reactions: {},
      };

      // Optimistic update
      setMessages((prev) => {
        const next = [...prev, newMsg];
        return pruneExpiredMessages(next);
      });

      // Write to Firestore - broadcasts to ALL devices in real-time
      try {
        await setDoc(doc(db, 'chatRooms', roomId, 'messages', msgId), newMsg);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `chatRooms/${roomId}/messages/${msgId}`);
      }

      // Broadcast to other tabs locally
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'NEW_MESSAGE',
          payload: newMsg,
        });
      }

      return newMsg;
    },
    [deviceId, userProfile, pruneExpiredMessages]
  );

  // TOGGLE EMOJI REACTION (SYNCED TO FIRESTORE)
  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const target = messages.find((m) => m.id === messageId);
      if (!target) return;

      const currentReactions = target.reactions || {};
      const currentUsers = currentReactions[emoji] || [];
      const hasReacted = currentUsers.includes(deviceId);
      const nextUsers = hasReacted
        ? currentUsers.filter((id) => id !== deviceId)
        : [...currentUsers, deviceId];

      const updatedReactions = {
        ...currentReactions,
        [emoji]: nextUsers,
      };

      // Optimistic local update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions: updatedReactions } : m))
      );

      // Write to Firestore
      try {
        await updateDoc(doc(db, 'chatRooms', activeRoomId, 'messages', messageId), {
          reactions: updatedReactions,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `chatRooms/${activeRoomId}/messages/${messageId}`);
      }
    },
    [messages, deviceId, activeRoomId]
  );

  // CREATE NEW CHAT ROOM (SYNCED TO FIRESTORE)
  const createRoom = useCallback(
    async (name: string, courseCode: string, icon: string, description: string) => {
      const newRoom: ChatRoom = {
        id: 'room-' + Date.now().toString(36),
        name: name.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        icon: icon || '💬',
        description: description.trim(),
      };

      setRooms((prev) => [...prev, newRoom]);
      setActiveRoomId(newRoom.id);

      try {
        await setDoc(doc(db, 'chatRooms', newRoom.id), newRoom);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `chatRooms/${newRoom.id}`);
      }

      return newRoom;
    },
    []
  );

  // CLEAR ROOM HISTORY (ADMIN ACTION - SYNCED TO FIRESTORE)
  const clearRoomHistory = useCallback(
    async (roomId: string) => {
      setMessages([]);
      try {
        const snap = await getDocs(collection(db, 'chatRooms', roomId, 'messages'));
        const deletePromises = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
        await Promise.all(deletePromises);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `chatRooms/${roomId}/messages`);
      }
    },
    []
  );

  // CLEAR ALL HISTORY
  const clearAllChatHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }, []);

  return {
    rooms,
    activeRoomId,
    setActiveRoomId,
    messages,
    sendMessage,
    toggleReaction,
    createRoom,
    clearRoomHistory,
    clearAllChatHistory,
  };
}
