import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, ChatRoom } from '../types/chat';
import { INITIAL_ROOMS, INITIAL_MESSAGES, CHAT_COLORS } from '../data/initialChats';
import { db, handleFirestoreError, OperationType, cleanForFirestore } from '../lib/firebase';
import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

const CHAT_STORAGE_KEY = 'faceless_chat_messages_v3';
const ROOMS_STORAGE_KEY = 'faceless_chat_rooms_v3';
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

  // Fallback to localStorage deviceId if prop has not finished resolving yet
  const effectiveDeviceId =
    deviceId ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('yak_device_id_v2') : '') ||
    'anon-user';

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
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_MESSAGE' && event.data.payload) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === event.data.payload.id)) return prev;
              const next = [...prev, event.data.payload];
              next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
              return pruneExpiredMessages(next);
            });
          }
        };
        return () => {
          channel.close();
        };
      } catch (e) {
        console.warn('BroadcastChannel error', e);
      }
    }
  }, [pruneExpiredMessages]);

  // 1. REAL-TIME FIRESTORE LISTENER FOR ROOMS (Broadcast to all devices)
  useEffect(() => {
    const roomsCol = collection(db, 'chatRooms');
    const unsubscribe = onSnapshot(
      roomsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial chat rooms into Firestore so all devices share them
          try {
            for (const r of INITIAL_ROOMS) {
              await setDoc(doc(db, 'chatRooms', r.id), cleanForFirestore(r));
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
          // Preserve predictable room ordering (Quad room first)
          loadedRooms.sort((a, b) => {
            if (a.id === 'room-quad') return -1;
            if (b.id === 'room-quad') return 1;
            return a.name.localeCompare(b.name);
          });
          setRooms(loadedRooms);
          try {
            localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(loadedRooms));
          } catch {}
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'chatRooms');
        const cached = localStorage.getItem(ROOMS_STORAGE_KEY);
        if (cached) {
          try {
            setRooms(JSON.parse(cached));
          } catch {
            setRooms(INITIAL_ROOMS);
          }
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. REAL-TIME FIRESTORE LISTENER FOR ALL MESSAGES (ACROSS ALL ROOMS VIA COLLECTION GROUP)
  useEffect(() => {
    const messagesGroup = collectionGroup(db, 'messages');
    const unsubscribe = onSnapshot(
      messagesGroup,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial demo messages across all default rooms
          try {
            for (const m of INITIAL_MESSAGES) {
              await setDoc(doc(db, 'chatRooms', m.roomId, 'messages', m.id), cleanForFirestore(m));
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, 'messages/seed');
          }
          setMessages(INITIAL_MESSAGES);
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
        handleFirestoreError(error, OperationType.LIST, 'messages (collectionGroup)');
        const cached = localStorage.getItem(CHAT_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setMessages(pruneExpiredMessages(parsed));
          } catch {
            setMessages(INITIAL_MESSAGES);
          }
        } else {
          setMessages(INITIAL_MESSAGES);
        }
      }
    );

    return () => unsubscribe();
  }, [pruneExpiredMessages]);

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

  // SEND A MESSAGE (SYNCED TO FIRESTORE IN REAL-TIME TO ALL DEVICES)
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
        senderId: effectiveDeviceId,
        senderAlias: userProfile.alias,
        senderAvatar: userProfile.avatar,
        senderColor: randomColor,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        reactions: {},
        ...(imageUrl ? { imageUrl } : {}),
        ...(replyTo ? { replyTo } : {}),
      };

      // Optimistic update
      setMessages((prev) => {
        const next = [...prev, newMsg];
        return pruneExpiredMessages(next);
      });

      // Write to Firestore - broadcasts to ALL devices in real-time
      try {
        const payload = cleanForFirestore(newMsg);
        await setDoc(doc(db, 'chatRooms', roomId, 'messages', msgId), payload);
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
    [effectiveDeviceId, userProfile, pruneExpiredMessages]
  );

  // TOGGLE EMOJI REACTION (SYNCED TO FIRESTORE)
  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const target = messages.find((m) => m.id === messageId);
      if (!target) return;

      const currentReactions = target.reactions || {};
      const currentUsers = currentReactions[emoji] || [];
      const hasReacted = currentUsers.includes(effectiveDeviceId);
      const nextUsers = hasReacted
        ? currentUsers.filter((id) => id !== effectiveDeviceId)
        : [...currentUsers, effectiveDeviceId];

      const updatedReactions = {
        ...currentReactions,
        [emoji]: nextUsers,
      };

      // Optimistic local update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions: updatedReactions } : m))
      );

      // Write to Firestore using the message's specific parent room
      try {
        await updateDoc(
          doc(db, 'chatRooms', target.roomId, 'messages', messageId),
          cleanForFirestore({
            reactions: updatedReactions,
          })
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `chatRooms/${target.roomId}/messages/${messageId}`);
      }
    },
    [messages, effectiveDeviceId]
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
        await setDoc(doc(db, 'chatRooms', newRoom.id), cleanForFirestore(newRoom));
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
      setMessages((prev) => prev.filter((m) => m.roomId !== roomId));
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
  const clearAllChatHistory = useCallback(async () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    try {
      const snap = await getDocs(collectionGroup(db, 'messages'));
      const deletePromises = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'messages (collectionGroup)');
    }
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
