import { YakPost, CourseChannel } from '../types/yak';

export const COURSE_CHANNELS: CourseChannel[] = [
  { id: 'all', code: 'ALL', name: 'Campus Quad (All Classes)', membersCount: 1420, icon: '🏛️' },
  { id: 'cs101', code: 'CS 101', name: 'Intro to Algorithms & Data Structures', membersCount: 384, icon: '💻' },
  { id: 'math240', code: 'MATH 240', name: 'Linear Algebra & Multivariable', membersCount: 290, icon: '📐' },
  { id: 'bio105', code: 'BIO 105', name: 'Cellular & Molecular Biology', membersCount: 215, icon: '🧬' },
  { id: 'econ201', code: 'ECON 201', name: 'Principles of Macroeconomics', membersCount: 198, icon: '📈' },
  { id: 'eng110', code: 'ENGL 110', name: 'College Rhetoric & Literature', membersCount: 160, icon: '✍️' },
  { id: 'studyhall', code: 'NIGHT-OWL', name: '3AM Library Study Hall', membersCount: 512, icon: '🌙' },
];

export const INITIAL_YAKS: YakPost[] = [
  {
    id: 'yak-1',
    content: "Professor just said 'This problem won't be on the exam' and 140 mechanical pencils lifted off paper in perfect unscripted unison.",
    courseTag: 'CS 101',
    topicTag: '#ProfQuotes',
    mood: '😂 Priceless',
    authorId: 'dev-user-991',
    authorAlias: 'Anonymous Badger',
    authorAvatar: '🦡',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
    score: 142,
    upvotes: ['seed-1', 'seed-2', 'seed-3'],
    downvotes: [],
    commentsCount: 9,
    reportCount: 0,
    reportedBy: [],
    isRemoved: false,
    comments: [
      {
        id: 'c-1-1',
        postId: 'yak-1',
        authorAlias: 'OP',
        authorAvatar: '🦡',
        authorId: 'dev-user-991',
        isOP: true,
        content: 'I swear I heard a collective sigh of relief resonate through the entire lecture hall.',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        score: 41,
        upvotes: ['seed-1'],
        downvotes: []
      },
      {
        id: 'c-1-2',
        postId: 'yak-1',
        authorAlias: 'Sleepy Koala',
        authorAvatar: '🐨',
        authorId: 'seed-koala',
        isOP: false,
        content: "Don't fall for it... last semester he said that and question 4 had the exact same proof in disguise 💀",
        createdAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
        score: 83,
        upvotes: ['seed-2'],
        downvotes: []
      },
      {
        id: 'c-1-3',
        postId: 'yak-1',
        authorAlias: 'Midnight Owl',
        authorAvatar: '🦉',
        authorId: 'seed-owl',
        isOP: false,
        content: "Plot twist: it's on the extra credit section.",
        createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
        score: 19,
        upvotes: [],
        downvotes: []
      }
    ]
  },
  {
    id: 'yak-2',
    content: "Quick check: Did anyone actually finish problem 4 on homework 6 without crying or questioning their major?",
    courseTag: 'MATH 240',
    topicTag: '#HomeworkHelp',
    mood: '😭 QuestioningLife',
    authorId: 'seed-author-2',
    authorAlias: 'Curious Otter',
    authorAvatar: '🦦',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    score: 87,
    upvotes: ['seed-4', 'seed-5'],
    downvotes: [],
    commentsCount: 6,
    reportCount: 0,
    reportedBy: [],
    isRemoved: false,
    poll: {
      id: 'poll-2',
      question: 'Did you finish Problem 4 on HW6?',
      totalVotes: 94,
      options: [
        { id: 'opt-1', text: 'Yes, and it made sense', votes: 8 },
        { id: 'opt-2', text: 'Wrote random formulas and prayed', votes: 62 },
        { id: 'opt-3', text: 'Skipped it entirely', votes: 19 },
        { id: 'opt-4', text: 'Currently staring blankly at it', votes: 5 }
      ]
    },
    comments: [
      {
        id: 'c-2-1',
        postId: 'yak-2',
        authorAlias: 'Velvet Fox',
        authorAvatar: '🦊',
        authorId: 'seed-fox',
        isOP: false,
        content: 'Hint without leaking answers: remember that the matrix is symmetric, so eigenvalues must be real numbers! Check theorem 5.2.',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        score: 35,
        upvotes: [],
        downvotes: []
      },
      {
        id: 'c-2-2',
        postId: 'yak-2',
        authorAlias: 'OP',
        authorAvatar: '🦦',
        authorId: 'seed-author-2',
        isOP: true,
        content: 'You literally just saved my GPA tonight Velvet Fox. Thank you anonymous guardian angel.',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        score: 22,
        upvotes: [],
        downvotes: []
      }
    ]
  },
  {
    id: 'yak-3',
    content: "To the person loudly eating dry Captain Crunch in the silent 4th floor library study room: you are on thin ice.",
    courseTag: 'NIGHT-OWL',
    topicTag: '#DiningHall',
    mood: '🤫 Shhh',
    authorId: 'seed-author-3',
    authorAlias: 'Neon Hedgehog',
    authorAvatar: '🦔',
    createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    score: 215,
    upvotes: ['seed-6'],
    downvotes: [],
    commentsCount: 14,
    reportCount: 0,
    reportedBy: [],
    isRemoved: false,
    comments: [
      {
        id: 'c-3-1',
        postId: 'yak-3',
        authorAlias: 'Silver Lynx',
        authorAvatar: '🐆',
        authorId: 'seed-lynx',
        isOP: false,
        content: 'Every bite sounds like an explosion in an acoustic amphitheater 😭',
        createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
        score: 64,
        upvotes: [],
        downvotes: []
      },
      {
        id: 'c-3-2',
        postId: 'yak-3',
        authorAlias: 'Crunch Culprit',
        authorAvatar: '🥣',
        authorId: 'seed-culprit',
        isOP: false,
        content: "Wait is this about me?? I've been sucking on them to soften the crunch before biting down! I'm trying my best!",
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        score: 132,
        upvotes: [],
        downvotes: []
      }
    ]
  },
  {
    id: 'yak-4',
    content: "Someone brought a whole French press and ceramic mugs to the 8:00 AM macro lecture. That is peak academic luxury right there.",
    courseTag: 'ECON 201',
    topicTag: '#CampusLife',
    mood: '☕ Sophisticated',
    authorId: 'seed-author-4',
    authorAlias: 'Golden Beaver',
    authorAvatar: '🦫',
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    score: 168,
    upvotes: [],
    downvotes: [],
    commentsCount: 5,
    reportCount: 0,
    reportedBy: [],
    isRemoved: false,
    comments: []
  },
  {
    id: 'yak-5',
    content: "Notice: Please don't blast TikTok reels without headphones in the student union lounge. We don't need to hear the 'Oh no no no' audio 47 times in a row.",
    courseTag: 'ALL',
    topicTag: '#CampusAlert',
    mood: '🎧 HeadphonesPlease',
    authorId: 'seed-author-5',
    authorAlias: 'Cozy Penguin',
    authorAvatar: '🐧',
    createdAt: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
    score: 95,
    upvotes: [],
    downvotes: [],
    commentsCount: 3,
    reportCount: 0,
    reportedBy: [],
    isRemoved: false,
    comments: []
  },
  {
    id: 'yak-6',
    content: "Selling my lab coat for BIO 105. Only used to dramatically swirl saline solutions like a mad scientist. Clean and stain-free.",
    courseTag: 'BIO 105',
    topicTag: '#StudyHacks',
    mood: '🧪 Scientist',
    authorId: 'seed-author-6',
    authorAlias: 'Emerald Falcon',
    authorAvatar: '🦅',
    createdAt: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    score: 54,
    upvotes: [],
    downvotes: [],
    commentsCount: 2,
    reportCount: 0,
    reportedBy: [],
    isRemoved: false,
    comments: []
  },
  {
    id: 'yak-7',
    content: "Drop Sarah from Section B's private phone number here so we can all text her about the syllabus",
    courseTag: 'CS 101',
    topicTag: '#Rant',
    mood: '⚠️ Flagged',
    authorId: 'seed-bad-actor',
    authorAlias: 'Shadow Troll',
    authorAvatar: '👺',
    createdAt: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    score: -5,
    upvotes: [],
    downvotes: ['seed-1', 'seed-2', 'seed-3', 'seed-4', 'seed-5'],
    commentsCount: 2,
    reportCount: 4,
    reportedBy: ['seed-1', 'seed-2', 'seed-3', 'seed-4'],
    isRemoved: true,
    removeReason: 'Removed by community standards: Reached -5 downvotes and multiple flags for personal info / doxxing.',
    comments: [
      {
        id: 'c-7-1',
        postId: 'yak-7',
        authorAlias: 'Vigilant Lynx',
        authorAvatar: '🐆',
        authorId: 'seed-mod-1',
        isOP: false,
        content: 'Downvoted. Absolutely no doxxing or posting names/numbers. Community standard #1.',
        createdAt: new Date(Date.now() - 1000 * 60 * 185).toISOString(),
        score: 28,
        upvotes: [],
        downvotes: []
      }
    ]
  },
  {
    id: 'yak-8',
    content: "Poll: Should our class rep ask for a 24-hour extension on the English draft since the campus Wi-Fi died for 3 hours last night?",
    courseTag: 'ENGL 110',
    topicTag: '#ExamSZN',
    mood: '🙏 FingersCrossed',
    authorId: 'seed-author-8',
    authorAlias: 'Mighty Bison',
    authorAvatar: '🦬',
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    score: 112,
    upvotes: [],
    downvotes: [],
    commentsCount: 8,
    reportCount: 0,
    reportedBy: [],
    isRemoved: false,
    poll: {
      id: 'poll-8',
      question: 'Should we request the 24-hr extension?',
      totalVotes: 73,
      options: [
        { id: 'opt-8-1', text: 'YES 100% (Wi-Fi outage was real)', votes: 68 },
        { id: 'opt-8-2', text: 'No, just want to get it over with', votes: 4 },
        { id: 'opt-8-3', text: 'Already turned it in early', votes: 1 }
      ]
    },
    comments: []
  }
];

export const ANONYMOUS_AVATARS = [
  { icon: '🦡', name: 'Badger' },
  { icon: '🦦', name: 'Otter' },
  { icon: '🦊', name: 'Fox' },
  { icon: '🐨', name: 'Koala' },
  { icon: '🦉', name: 'Owl' },
  { icon: '🦔', name: 'Hedgehog' },
  { icon: '🐧', name: 'Penguin' },
  { icon: '🦫', name: 'Beaver' },
  { icon: '🦅', name: 'Falcon' },
  { icon: '🦬', name: 'Bison' },
  { icon: '🐺', name: 'Wolf' },
  { icon: '🐼', name: 'Panda' },
  { icon: '🦁', name: 'Lion' },
  { icon: '🦌', name: 'Deer' },
];

export const ADJECTIVES = [
  'Midnight', 'Curious', 'Golden', 'Silver', 'Sleepy',
  'Cozy', 'Neon', 'Velvet', 'Mighty', 'Breezy', 'Clever', 'Quiet'
];

export const TOPIC_TAGS = [
  '#AllTopics',
  '#ProfQuotes',
  '#HomeworkHelp',
  '#ExamSZN',
  '#CampusLife',
  '#DiningHall',
  '#NightStudy',
  '#Confession',
  '#CampusAlert'
];
