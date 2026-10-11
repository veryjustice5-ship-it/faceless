import React, { useState } from 'react';
import {
  X,
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  Users,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Clock,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { AccessCode } from '../types/auth';
import { YakPost } from '../types/yak';
import { ChatRoom } from '../types/chat';
import { COURSE_CHANNELS } from '../data/initialYaks';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessCodes: AccessCode[];
  onGenerateCode: (params: {
    customCode?: string;
    label: string;
    targetCourse: string;
    maxUses?: number;
    createdBy?: string;
  }) => AccessCode;
  onToggleActive: (codeId: string) => void;
  onDeleteCode: (codeId: string) => void;
  posts: YakPost[];
  onRemovePost?: (postId: string) => void;
  chatRooms: ChatRoom[];
  onClearChatRoom?: (roomId: string) => void;
  onLogoutAdmin?: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  accessCodes,
  onGenerateCode,
  onToggleActive,
  onDeleteCode,
  posts,
  onRemovePost,
  chatRooms,
  onClearChatRoom,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'codes' | 'students' | 'chats' | 'moderation'>('codes');

  // Generator form
  const [customCode, setCustomCode] = useState('');
  const [label, setLabel] = useState('');
  const [targetCourse, setTargetCourse] = useState('ALL');
  const [maxUses, setMaxUses] = useState('50');
  const [createdBy, setCreatedBy] = useState('Faculty Admin');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = onGenerateCode({
      customCode: customCode.trim() || undefined,
      label: label.trim() || `${targetCourse} Section Pass`,
      targetCourse,
      maxUses: parseInt(maxUses, 10) || 50,
      createdBy: createdBy.trim() || 'Faculty Admin',
    });

    setSuccessNotice(`Generated code: ${newCode.code}`);
    setCustomCode('');
    setLabel('');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleCopy = (code: AccessCode) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code.code);
      setCopiedId(code.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const totalLogins = accessCodes.reduce((acc, c) => acc + c.usedCount, 0);
  const reportedPosts = posts.filter((p) => p.reportCount > 0 || p.isRemoved);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative flex h-[92vh] max-h-[860px] w-full max-w-4xl flex-col rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6 shrink-0 bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Faculty & Administrator Console</span>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                  Full Authority
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Manage enrollment codes, monitor student activity, and oversee 24h chatrooms
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onLogoutAdmin && (
              <button
                onClick={() => {
                  if (confirm('Sign out of Administrator clearance?')) {
                    onLogoutAdmin();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors"
              >
                <span>Log Out Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-6 text-xs font-semibold gap-2">
          <button
            onClick={() => setActiveTab('codes')}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              activeTab === 'codes'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>Access Codes ({accessCodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              activeTab === 'students'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Enrolled Students ({totalLogins})</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              activeTab === 'chats'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>24h Group Chatrooms ({chatRooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              activeTab === 'moderation'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Reported Content ({reportedPosts.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-300">
          {/* TAB 1: ACCESS CODES */}
          {activeTab === 'codes' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                  <span className="text-xs text-neutral-400">Total Codes Issued</span>
                  <div className="mt-1 text-2xl font-bold font-mono text-white tabular-nums">
                    {accessCodes.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                  <span className="text-xs text-neutral-400">Students Authenticated</span>
                  <div className="mt-1 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {totalLogins}
                  </div>
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                  <span className="text-xs text-neutral-400">Active Passes</span>
                  <div className="mt-1 text-2xl font-bold font-mono text-amber-400 tabular-nums">
                    {accessCodes.filter((c) => c.isActive).length} Active
                  </div>
                </div>
              </div>

              {/* Generator Form */}
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5">
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <span>Generate New Student Access Code</span>
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Give these codes to your students. Only students with valid codes can enter the class feed and chatrooms.
                </p>

                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">
                        Custom Code Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                        placeholder="e.g. CS101-MIDTERM"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono uppercase text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-neutral-500 mt-0.5 block">
                        Leave blank to auto-generate code.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">
                        Course Section
                      </label>
                      <select
                        value={targetCourse}
                        onChange={(e) => setTargetCourse(e.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
                      >
                        {COURSE_CHANNELS.map((c) => (
                          <option key={c.id} value={c.code}>
                            {c.icon} {c.code} - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">
                        Section Label
                      </label>
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="e.g. Fall 2026 Section B Students"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-1">
                          Max Uses
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={maxUses}
                          onChange={(e) => setMaxUses(e.target.value)}
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-400 mb-1">
                          Issued By
                        </label>
                        <input
                          type="text"
                          value={createdBy}
                          onChange={(e) => setCreatedBy(e.target.value)}
                          placeholder="e.g. Prof. Vance"
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {successNotice && (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-300">
                      <Check className="h-4 w-4" />
                      <span>{successNotice}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Code</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Codes Table / Cards */}
              <div className="space-y-2">
                {accessCodes.map((code) => {
                  const isExhausted = code.maxUses > 0 && code.usedCount >= code.maxUses;
                  return (
                    <div
                      key={code.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-base font-extrabold text-emerald-400 tracking-wider">
                            {code.code}
                          </span>
                          <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold text-neutral-300">
                            {code.targetCourse}
                          </span>
                          {!code.isActive ? (
                            <span className="rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5">
                              Deactivated
                            </span>
                          ) : isExhausted ? (
                            <span className="rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5">
                              Exhausted
                            </span>
                          ) : (
                            <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-300 mt-1">{code.label}</p>
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                          <span>Issued by: {code.createdBy}</span>
                          <span>·</span>
                          <span>
                            Enrolled: {code.usedCount} / {code.maxUses || '∞'} students
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleCopy(code)}
                          className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-700 transition-colors"
                        >
                          {copiedId === code.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onToggleActive(code.id)}
                          title={code.isActive ? 'Deactivate Code' : 'Activate Code'}
                          className={`rounded-xl p-2 transition-colors ${
                            code.isActive
                              ? 'text-neutral-400 hover:bg-neutral-800 hover:text-amber-400'
                              : 'text-emerald-400 hover:bg-emerald-950/30'
                          }`}
                        >
                          <Power className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete access code ${code.code}?`)) {
                              onDeleteCode(code.id);
                            }
                          }}
                          title="Delete Code"
                          className="rounded-xl p-2 text-neutral-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ENROLLED STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Classroom Roster & Identities</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Total of {totalLogins} student enrollments authenticated via active access passes.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>100% Verified Access</span>
                </div>
              </div>

              <div className="divide-y divide-neutral-800/60 rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
                {accessCodes.map((code) => (
                  <div key={code.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">{code.code}</span>
                        <span className="text-xs text-neutral-400">({code.targetCourse})</span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-0.5">{code.label}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono tabular-nums text-sm font-bold text-white">
                        {code.usedCount} students
                      </span>
                      <span className="block text-[11px] text-neutral-500 font-mono">
                        Max cap: {code.maxUses}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 24H CHATROOMS OVERSIGHT */}
          {activeTab === 'chats' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                  <Clock className="h-4 w-4" />
                  <span>24-Hour Ephemeral Chatroom Policy</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Every group chat message automatically vanishes after 24 hours. As an administrator, you can also manually clear chat history at any moment.
                </p>
              </div>

              <div className="space-y-3">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{room.icon}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{room.name}</span>
                          <span className="text-[10px] font-mono rounded bg-neutral-800 px-1.5 py-0.2 text-emerald-400">
                            {room.courseCode}
                          </span>
                        </h4>
                        <p className="text-xs text-neutral-400 mt-0.5">{room.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`Admin action: Clear all messages in ${room.name}?`)) {
                            onClearChatRoom?.(room.id);
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-900/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear History</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MODERATION & REPORTS */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <h4 className="font-bold text-white text-sm">Peer Moderation & Community Standards</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Posts reaching -5 downvotes or 3 student flags are quarantined. Admins can permanently purge or restore posts.
                </p>
              </div>

              {reportedPosts.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No flagged or quarantined posts. Campus quad is peaceful.
                </div>
              ) : (
                <div className="space-y-3">
                  {reportedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-rose-950/50 bg-neutral-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold mb-1">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>
                            {post.isRemoved ? 'Removed by -5 Standard' : `${post.reportCount} flags`}
                          </span>
                          <span className="text-neutral-500">· {post.courseTag}</span>
                        </div>
                        <p className="text-xs text-neutral-200 line-clamp-2">{post.content}</p>
                      </div>

                      {onRemovePost && (
                        <button
                          onClick={() => onRemovePost(post.id)}
                          className="flex items-center gap-1 text-xs text-rose-400 hover:text-white rounded-lg bg-rose-950/40 px-3 py-1.5 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Purge Post</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
