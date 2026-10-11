import React, { useState, useMemo } from 'react';
import { useYakStore } from './hooks/useYakStore';
import { useAccessStore } from './hooks/useAccessStore';
import { useChatStore } from './hooks/useChatStore';
import { YakPost, FeedTab } from './types/yak';
import { calculateHotScore } from './utils/time';
import { COURSE_CHANNELS } from './data/initialYaks';

import { Header } from './components/Header';
import { CampusHero } from './components/CampusHero';
import { FilterBar } from './components/FilterBar';
import { YakCard } from './components/YakCard';
import { Sidebar } from './components/Sidebar';
import { YakDetailModal } from './components/YakDetailModal';
import { CreateYakModal } from './components/CreateYakModal';
import { ReportModal } from './components/ReportModal';
import { CommunityStandardsModal } from './components/CommunityStandardsModal';
import { YakarmaModal } from './components/YakarmaModal';
import { MobileBottomBar } from './components/MobileBottomBar';
import { AccessGate } from './components/AccessGate';
import { AdminConsoleModal } from './components/AdminConsoleModal';
import { WhatsAppChatView } from './components/WhatsAppChatView';
import { MessageSquareDashed, Plus, Key, Shield, MessageSquare, Flame, LogOut } from 'lucide-react';

const SIMULATED_PROMPTS = [
  {
    content: "Someone brought an entire blender into the study pod and made a strawberry smoothie during midterms. I respect the audacity.",
    courseTag: 'NIGHT-OWL',
    topicTag: '#DiningHall',
    mood: '🥤 Audacious',
  },
  {
    content: "If the midterm average is a 42%, does that mean we all failed, or did the exam fail us?",
    courseTag: 'MATH 240',
    topicTag: '#ExamSZN',
    mood: '😭 QuestioningLife',
  },
  {
    content: "Shoutout to the TA who replied to my frantic 2:40 AM Piazza question with 'Go to sleep, we extended the deadline by 12 hours.' Real hero.",
    courseTag: 'CS 101',
    topicTag: '#HomeworkHelp',
    mood: '🙏 Hero',
  },
  {
    content: "The library air conditioning is set to absolute zero today. Bring your arctic parkas.",
    courseTag: 'ALL',
    topicTag: '#CampusAlert',
    mood: '❄️ Freezing',
  },
  {
    content: "Overheard in the student center: 'I didn’t choose the biology major, the biology major chose to humble me.'",
    courseTag: 'BIO 105',
    topicTag: '#ProfQuotes',
    mood: '😂 Priceless',
  },
];

export default function App() {
  const {
    isLoaded,
    deviceId,
    posts,
    savedIds,
    userProfile,
    yakarma,
    votePost,
    reportPost,
    votePoll,
    addPost,
    addComment,
    voteComment,
    toggleSave,
    deleteMyPost,
    resetToDefaults,
    setUserProfile,
  } = useYakStore();

  const {
    isInitialized: isAccessLoaded,
    accessCodes,
    session,
    loginWithCode,
    loginAsAdmin,
    logout,
    generateCode,
    toggleCodeActive,
    deleteCode,
  } = useAccessStore();

  const {
    rooms,
    activeRoomId,
    setActiveRoomId,
    messages: chatMessages,
    sendMessage: sendChatMessage,
    toggleReaction: toggleChatReaction,
    createRoom: createChatRoom,
    clearRoomHistory,
  } = useChatStore(deviceId, userProfile);

  // App View: 'feed' (Yik Yak Feed) or 'chats' (WhatsApp 24h Group Chats)
  const [currentView, setCurrentView] = useState<'feed' | 'chats'>('feed');

  // Navigation & Filtering State
  const [currentTab, setCurrentTab] = useState<FeedTab>('hot');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Dialogs
  const [activeThreadPostId, setActiveThreadPostId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isStandardsOpen, setIsStandardsOpen] = useState(false);
  const [isKarmaOpen, setIsKarmaOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  // Sync active thread post object with latest posts state
  const activeThreadPost = useMemo(() => {
    if (!activeThreadPostId) return null;
    return posts.find((p) => p.id === activeThreadPostId) || null;
  }, [posts, activeThreadPostId]);

  // Filtered & Sorted Feed
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Course filter
    if (selectedCourse !== 'ALL') {
      result = result.filter(
        (p) => p.courseTag.toLowerCase() === selectedCourse.toLowerCase()
      );
    }

    // Topic filter
    if (selectedTopic) {
      result = result.filter((p) => p.topicTag === selectedTopic);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.courseTag.toLowerCase().includes(q) ||
          (p.topicTag && p.topicTag.toLowerCase().includes(q))
      );
    }

    // Tabs filter
    if (currentTab === 'saved') {
      result = result.filter((p) => savedIds.includes(p.id));
    } else if (currentTab === 'my-yaks') {
      result = result.filter(
        (p) =>
          p.authorId === deviceId ||
          p.comments.some((c) => c.authorId === deviceId)
      );
    }

    // Sort order
    if (currentTab === 'hot') {
      result.sort((a, b) => calculateHotScore(b.score, b.createdAt) - calculateHotScore(a.score, a.createdAt));
    } else if (currentTab === 'new') {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (currentTab === 'top') {
      result.sort((a, b) => b.score - a.score);
    }

    return result;
  }, [posts, selectedCourse, selectedTopic, searchQuery, currentTab, savedIds, deviceId]);

  // Simulate chatter helper
  const handleSimulateChatter = () => {
    const prompt = SIMULATED_PROMPTS[Math.floor(Math.random() * SIMULATED_PROMPTS.length)];
    addPost({
      content: prompt.content,
      courseTag: prompt.courseTag,
      topicTag: prompt.topicTag,
      mood: prompt.mood,
    });
  };

  const activeCourseObj = COURSE_CHANNELS.find((c) => c.code === selectedCourse);
  const activeCourseName = activeCourseObj ? activeCourseObj.name : 'Campus Quad';

  if (!isLoaded || !isAccessLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm font-medium">Entering Faceless...</span>
        </div>
      </div>
    );
  }

  // Access Code Login Interface Check (Strictly separated student vs admin)
  if (!session.isAuthenticated) {
    return (
      <AccessGate
        onLoginStudent={loginWithCode}
        onLoginAdmin={loginAsAdmin}
        availableCodes={accessCodes}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased">
      {/* Admin Status Strip (Only visible when logged in as faculty/admin) */}
      {session.isAdmin && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="font-semibold">
              Faculty & Administrator Session Active · Full Clearance for All Students & Chatrooms
            </span>
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-1 font-bold text-amber-400 hover:text-white underline underline-offset-2"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Admin Console</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Log out of administrator clearance?')) {
                  logout();
                }
              }}
              className="flex items-center gap-1.5 rounded-lg border border-rose-900/60 bg-rose-950/60 px-2.5 py-1 text-xs font-bold text-rose-300 hover:bg-rose-900 hover:text-white transition-all shadow-sm"
              title="Log out of Administrator Session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Universal Top Bar Contract */}
      <Header
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenStandards={() => setIsStandardsOpen(true)}
        onOpenKarma={() => setIsKarmaOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onLockSession={logout}
        isAdmin={session.isAdmin}
        activeCodeName={session.accessCodeUsed}
        yakarma={yakarma}
        activeTab={currentView === 'chats' ? 'chats' : currentTab}
        onSelectNav={(tab) => {
          if (tab === 'chats') {
            setCurrentView('chats');
          } else {
            setCurrentView('feed');
            setCurrentTab(tab as FeedTab);
          }
        }}
      />

      {/* View Switcher Tabs (Desktop Quick Switcher) */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/60 px-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('feed')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                currentView === 'feed'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Quad Bulletin Feed</span>
            </button>

            <button
              onClick={() => setCurrentView('chats')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                currentView === 'chats'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp Group Chats</span>
              <span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-amber-300">
                ⏳ 24h
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-400">
            <span className="font-mono text-[11px]">
              Pass: <code className="text-emerald-400 font-bold">{session.accessCodeUsed}</code>
            </span>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Container */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {currentView === 'chats' ? (
          /* WHATSAPP GROUP CHATROOM VIEW */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Class Group Chatrooms</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                    Live
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Ephemeral WhatsApp-style discussions. All messages automatically clear after 24 hours.
                </p>
              </div>
            </div>

            <WhatsAppChatView
              rooms={rooms}
              activeRoomId={activeRoomId}
              onSelectRoom={setActiveRoomId}
              messages={chatMessages}
              onSendMessage={sendChatMessage}
              onToggleReaction={toggleChatReaction}
              onCreateRoom={createChatRoom}
              onClearRoom={clearRoomHistory}
              currentDeviceId={deviceId}
              userProfile={userProfile}
              isAdmin={session.isAdmin}
            />
          </div>
        ) : (
          /* QUAD BULLETIN FEED VIEW */
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Central Feed Column */}
            <div className="flex-1 min-w-0 w-full">
              {/* Campus Quad Hero Banner */}
              <CampusHero
                onOpenCreate={() => setIsCreateOpen(true)}
                onOpenStandards={() => setIsStandardsOpen(true)}
                activeCourseName={activeCourseName}
              />

              {/* Filter, Tabs, Search Controls */}
              <FilterBar
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                selectedCourse={selectedCourse}
                onCourseChange={setSelectedCourse}
                selectedTopic={selectedTopic}
                onTopicChange={setSelectedTopic}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              {/* Feed List */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400 mb-3">
                      <MessageSquareDashed className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">No Thoughts Found</h3>
                    <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
                      {searchQuery
                        ? `No thoughts matched "${searchQuery}". Try different keywords or clear the search filter.`
                        : currentTab === 'saved'
                        ? 'You have not saved any posts yet. Click the bookmark icon on any post to save it for later.'
                        : currentTab === 'my-yaks'
                        ? 'You have not posted or replied to any thoughts yet from this device.'
                        : 'The quad is quiet for this filter. Be the brave student who breaks the silence!'}
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                      {(searchQuery || selectedCourse !== 'ALL' || selectedTopic) && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCourse('ALL');
                            setSelectedTopic('');
                          }}
                          className="rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-all"
                      >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        <span>Post Thought</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <YakCard
                      key={post.id}
                      post={post}
                      currentDeviceId={deviceId}
                      isSaved={savedIds.includes(post.id)}
                      onVote={votePost}
                      onOpenThread={(p) => setActiveThreadPostId(p.id)}
                      onVotePoll={votePoll}
                      onToggleSave={toggleSave}
                      onReport={(id) => setReportingPostId(id)}
                      onDelete={deleteMyPost}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Desktop Right Sidebar */}
            <Sidebar
              selectedCourse={selectedCourse}
              onSelectCourse={setSelectedCourse}
              onOpenStandards={() => setIsStandardsOpen(true)}
              onOpenAdmin={() => setIsAdminModalOpen(true)}
              onLogoutAdmin={logout}
              onSimulateChatter={handleSimulateChatter}
              totalYaksCount={posts.length}
              activeCodeName={session.accessCodeUsed}
              isAdmin={session.isAdmin}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomBar
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenStandards={() => setIsStandardsOpen(true)}
        onOpenKarma={() => setIsKarmaOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={logout}
        isAdmin={session.isAdmin}
        yakarma={yakarma}
      />

      {/* Modals & Dialogs */}
      <CreateYakModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={addPost}
      />

      <YakDetailModal
        post={activeThreadPost}
        currentDeviceId={deviceId}
        onClose={() => setActiveThreadPostId(null)}
        onVotePost={votePost}
        onAddComment={addComment}
        onVoteComment={voteComment}
        onReport={(id) => setReportingPostId(id)}
      />

      <ReportModal
        postId={reportingPostId}
        onClose={() => setReportingPostId(null)}
        onSubmitReport={reportPost}
      />

      <CommunityStandardsModal
        isOpen={isStandardsOpen}
        onClose={() => setIsStandardsOpen(false)}
      />

      <YakarmaModal
        isOpen={isKarmaOpen}
        onClose={() => setIsKarmaOpen(false)}
        yakarma={yakarma}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        posts={posts}
        deviceId={deviceId}
        onResetDefaults={resetToDefaults}
      />

      {/* Admin Console Modal (Strictly available when authenticated as admin) */}
      <AdminConsoleModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        accessCodes={accessCodes}
        onGenerateCode={generateCode}
        onToggleActive={toggleCodeActive}
        onDeleteCode={deleteCode}
        posts={posts}
        onRemovePost={deleteMyPost}
        chatRooms={rooms}
        onClearChatRoom={clearRoomHistory}
        onLogoutAdmin={logout}
      />
    </div>
  );
}
