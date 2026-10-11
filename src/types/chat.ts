export interface ChatReaction {
  emoji: string;
  count: number;
  userDeviceIds: string[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderAlias: string;
  senderAvatar: string;
  senderColor: string; // WhatsApp sender name color e.g. '#25D366', '#34B7F1', etc.
  content: string;
  createdAt: string; // ISO string
  replyTo?: {
    id: string;
    senderAlias: string;
    content: string;
  };
  imageUrl?: string;
  reactions?: Record<string, string[]>; // emoji -> array of deviceIds
  isDisappearingNotice?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  courseCode: string;
  icon: string;
  description: string;
  unreadCount?: number;
  lastMessageSnippet?: string;
  lastMessageTime?: string;
  isPrivate?: boolean;
}
