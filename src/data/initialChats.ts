import { ChatRoom, ChatMessage } from '../types/chat';

export const CHAT_COLORS = [
  '#34B7F1', // Blue
  '#25D366', // Green
  '#FF7675', // Coral/Pink
  '#FDCB6E', // Gold
  '#A29BFE', // Purple
  '#00CEC9', // Teal
  '#E17055', // Orange
];

export const INITIAL_ROOMS: ChatRoom[] = [
  {
    id: 'room-quad',
    name: 'Campus Quad Chat',
    courseCode: 'ALL',
    icon: '🏛️',
    description: 'Real-time anonymous quad chatter across all sections. Ephemeral 24hr lifetime.',
  },
  {
    id: 'room-cs101',
    name: 'CS 101 Study Group',
    courseCode: 'CS 101',
    icon: '💻',
    description: 'Algorithms, lab questions, and midterm problem sets.',
  },
  {
    id: 'room-math240',
    name: 'MATH 240 Pod',
    courseCode: 'MATH 240',
    icon: '📐',
    description: 'Eigenvalues, vector spaces, and homework proof discussions.',
  },
  {
    id: 'room-bio105',
    name: 'BIO 105 Lab Team',
    courseCode: 'BIO 105',
    icon: '🧬',
    description: 'Pre-lab quizzes, lab reports, and cellular biology diagrams.',
  },
  {
    id: 'room-studyhall',
    name: '3AM Library Lounge',
    courseCode: 'NIGHT-OWL',
    icon: '🌙',
    description: 'Late night caffeine checks, floor updates, and quiet study companionship.',
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    roomId: 'room-quad',
    senderId: 'seed-badger',
    senderAlias: 'Midnight Badger',
    senderAvatar: '🦡',
    senderColor: '#34B7F1',
    content: 'Is anyone in the dining hall right now? Did they put out the curly fries or the sad soggy wedges today?',
    createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(), // 85 mins ago
    reactions: { '🍟': ['seed-user-1'], '😂': ['seed-user-2'] },
  },
  {
    id: 'msg-2',
    roomId: 'room-quad',
    senderId: 'seed-fox',
    senderAlias: 'Velvet Fox',
    senderAvatar: '🦊',
    senderColor: '#FF7675',
    content: 'CURLY FRIES ARE LIVE! Run before the varsity lacrosse team cleans out the entire tray!',
    createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    replyTo: {
      id: 'msg-1',
      senderAlias: 'Midnight Badger',
      content: 'Is anyone in the dining hall right now? Did they put out the curly fries or the sad soggy wedges today?',
    },
    reactions: { '🔥': ['seed-user-1', 'seed-user-3'] },
  },
  {
    id: 'msg-3',
    roomId: 'room-quad',
    senderId: 'seed-koala',
    senderAlias: 'Sleepy Koala',
    senderAvatar: '🐨',
    senderColor: '#FDCB6E',
    content: 'Just sprinted down from the 3rd floor. Can confirm, curly fries secured. Academic morale restored.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    reactions: { '🙌': ['seed-user-2'] },
  },

  // CS 101 Messages
  {
    id: 'msg-cs-1',
    roomId: 'room-cs101',
    senderId: 'seed-otter',
    senderAlias: 'Curious Otter',
    senderAvatar: '🦦',
    senderColor: '#25D366',
    content: 'Anyone understand why test case 7 on the recursion lab throws a StackOverflowError? It passes 1 through 6 without issue.',
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },
  {
    id: 'msg-cs-2',
    roomId: 'room-cs101',
    senderId: 'seed-owl',
    senderAlias: 'Midnight Owl',
    senderAvatar: '🦉',
    senderColor: '#A29BFE',
    content: 'Check your base case! If the input array has length 0 or negative bounds, it recurses infinitely without hitting the stop condition.',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    replyTo: {
      id: 'msg-cs-1',
      senderAlias: 'Curious Otter',
      content: 'Anyone understand why test case 7 on the recursion lab throws a StackOverflowError?',
    },
    reactions: { '💡': ['seed-otter'] },
  },
  {
    id: 'msg-cs-3',
    roomId: 'room-cs101',
    senderId: 'seed-otter',
    senderAlias: 'Curious Otter',
    senderAvatar: '🦦',
    senderColor: '#25D366',
    content: 'THAT WAS IT! Missing `if (len <= 0) return 0;`. You are an anonymous legend!',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    reactions: { '🎉': ['seed-owl'] },
  },

  // Math 240 Messages
  {
    id: 'msg-math-1',
    roomId: 'room-math240',
    senderId: 'seed-bison',
    senderAlias: 'Mighty Bison',
    senderAvatar: '🦬',
    senderColor: '#00CEC9',
    content: 'Review session tomorrow at 4 PM in Smith Hall 102. Professor said they will go over past exam questions on Gram-Schmidt orthogonalization.',
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    reactions: { '👍': ['seed-1', 'seed-2'] },
  },

  // Study lounge
  {
    id: 'msg-lounge-1',
    roomId: 'room-studyhall',
    senderId: 'seed-penguin',
    senderAlias: 'Cozy Penguin',
    senderAvatar: '🐧',
    senderColor: '#E17055',
    content: 'Whiteboard room 4B has free dry-erase markers and working power outlets if anyone needs a quiet haven tonight.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    reactions: { '❤️': ['seed-1'] },
  },
];
