import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, ChatRoom } from '../types/chat';
import { INITIAL_ROOMS, INITIAL_MESSAGES, CHAT_COLORS } from '../data/initialChats';

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
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('room-quad');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Filter out any messages older than 24 hours
  const pruneExpiredMessages = useCallback((msgs: ChatMessage[]): ChatMessage[] => {
    return msgs.filter((m) => !isMessageExpired(m.createdAt));
  }, []);

  // Save messages to storage
  const saveMessages = useCallback(
    (newMsgs: ChatMessage[]) => {
      const pruned = pruneExpiredMessages(newMsgs);
      setMessages(pruned);
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(pruned));
      } catch (e) {
        console.warn('Chat save failed:', e);
      }
    },
    [pruneExpiredMessages]
  );

  // Initialize data & multi-tab BroadcastChannel
  useEffect(() => {
    // 1. Rooms
    const storedRooms = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (storedRooms) {
      try {
        const parsed = JSON.parse(storedRooms);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRooms(parsed);
        } else {
          setRooms(INITIAL_ROOMS);
          localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(INITIAL_ROOMS));
        }
      } catch {
        setRooms(INITIAL_ROOMS);
      }
    } else {
      setRooms(INITIAL_ROOMS);
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(INITIAL_ROOMS));
    }

    // 2. Messages
    const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        if (Array.isArray(parsed)) {
          const valid = pruneExpiredMessages(parsed);
          setMessages(valid);
        } else {
          setMessages(pruneExpiredMessages(INITIAL_MESSAGES));
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
        }
      } catch {
        setMessages(pruneExpiredMessages(INITIAL_MESSAGES));
      }
    } else {
      setMessages(pruneExpiredMessages(INITIAL_MESSAGES));
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
    }

    // 3. Multi-tab broadcast channel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('faceless_chat_broadcast');
        channelRef.current = channel;
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_MESSAGE') {
            const incomingMsg: ChatMessage = event.data.payload;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incomingMsg.id)) return prev;
              const next = [...prev, incomingMsg];
              return pruneExpiredMessages(next);
            });
          } else if (event.data?.type === 'REACTION_UPDATE') {
            const { messageId, emoji, userDeviceId } = event.data.payload;
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== messageId) return m;
                const currentReactions = m.reactions || {};
                const currentUsers = currentReactions[emoji] || [];
                const hasReacted = currentUsers.includes(userDeviceId);
                const nextUsers = hasReacted
                  ? currentUsers.filter((id) => id !== userDeviceId)
                  : [...currentUsers, userDeviceId];
                return {
                  ...m,
                  reactions: {
                    ...currentReactions,
                    [emoji]: nextUsers,
                  },
                };
              })
            );
          } else if (event.data?.type === 'CLEAR_ROOM') {
            const { roomId } = event.data.payload;
            setMessages((prev) => prev.filter((m) => m.roomId !== roomId));
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error', e);
      }
    }

    // 4. Timer to continuously prune expired 24h messages
    const pruneTimer = setInterval(() => {
      setMessages((prev) => {
        const pruned = pruneExpiredMessages(prev);
        if (pruned.length !== prev.length) {
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(pruned));
        }
        return pruned;
      });
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(pruneTimer);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [pruneExpiredMessages]);

  // Send a message
  const sendMessage = useCallback(
    (
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

      setMessages((prev) => {
        const next = [...prev, newMsg];
        const pruned = pruneExpiredMessages(next);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(pruned));
        return pruned;
      });

      // Broadcast to other tabs
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

  // Toggle emoji reaction
  const toggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      setMessages((prev) => {
        const updated = prev.map((m) => {
          if (m.id !== messageId) return m;
          const currentReactions = m.reactions || {};
          const currentUsers = currentReactions[emoji] || [];
          const hasReacted = currentUsers.includes(deviceId);
          const nextUsers = hasReacted
            ? currentUsers.filter((id) => id !== deviceId)
            : [...currentUsers, deviceId];

          return {
            ...m,
            reactions: {
              ...currentReactions,
              [emoji]: nextUsers,
            },
          };
        });

        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));

        if (channelRef.current) {
          channelRef.current.postMessage({
            type: 'REACTION_UPDATE',
            payload: { messageId, emoji, userDeviceId: deviceId },
          });
        }

        return updated;
      });
    },
    [deviceId]
  );

  // Create new chat room
  const createRoom = useCallback(
    (name: string, courseCode: string, icon: string, description: string) => {
      const newRoom: ChatRoom = {
        id: 'room-' + Date.now().toString(36),
        name: name.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        icon: icon || '💬',
        description: description.trim(),
      };

      setRooms((prev) => {
        const next = [...prev, newRoom];
        localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setActiveRoomId(newRoom.id);
      return newRoom;
    },
    []
  );

  // Clear room history (Admin or room moderator)
  const clearRoomHistory = useCallback((roomId: string) => {
    setMessages((prev) => {
      const next = prev.filter((m) => m.roomId !== roomId);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'CLEAR_ROOM',
        payload: { roomId },
      });
    }
  }, []);

  // Admin clear all history
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
