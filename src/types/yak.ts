export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds?: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface YakComment {
  id: string;
  postId: string;
  authorAlias: string; // e.g. "OP" or "Anonymous Badger"
  authorAvatar: string; // emoji or icon code
  authorId: string;
  isOP: boolean;
  content: string;
  imageUrl?: string;
  createdAt: string; // ISO string
  score: number;
  upvotes: string[]; // user IDs who upvoted
  downvotes: string[]; // user IDs who downvoted
}

export interface YakPost {
  id: string;
  content: string;
  courseTag: string; // e.g., "CS 101", "Campus Quad", "MATH 240"
  topicTag?: string; // e.g., "#Midterms", "#ProfQuotes"
  mood?: string; // emoji or mood text e.g. "☕ Cramming"
  authorId: string;
  authorAlias: string;
  authorAvatar: string;
  createdAt: string; // ISO string
  score: number;
  upvotes: string[]; // array of device IDs
  downvotes: string[]; // array of device IDs
  commentsCount: number;
  comments: YakComment[];
  poll?: Poll;
  imageUrl?: string; // Optional image attachment
  reportCount: number;
  reportedBy: string[]; // device IDs
  isRemoved: boolean; // true if score <= -5 or reported >= 3
  removeReason?: string;
  savedBy?: string[]; // device IDs
}

export type FeedTab = 'hot' | 'new' | 'top' | 'saved' | 'my-yaks';

export interface CourseChannel {
  id: string;
  code: string;
  name: string;
  membersCount: number;
  icon: string;
}

export interface CommunityReport {
  postId: string;
  reason: 'harassment' | 'cheating' | 'doxxing' | 'hate' | 'spam';
  timestamp: string;
}
