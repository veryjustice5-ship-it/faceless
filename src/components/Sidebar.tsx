import React from 'react';
import { Shield, Sparkles, BookOpen, Users, ThumbsDown, Key } from 'lucide-react';
import { COURSE_CHANNELS } from '../data/initialYaks';
import { FacelessLogo } from './FacelessLogo';

interface SidebarProps {
  selectedCourse: string;
  onSelectCourse: (code: string) => void;
  onOpenStandards: () => void;
  onOpenAdmin: () => void;
  onLogoutAdmin?: () => void;
  onSimulateChatter: () => void;
  totalYaksCount: number;
  activeCodeName?: string;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCourse,
  onSelectCourse,
  onOpenStandards,
  onOpenAdmin,
  onLogoutAdmin,
  onSimulateChatter,
  totalYaksCount,
  activeCodeName,
  isAdmin = false,
}) => {
  return (
    <aside className="hidden lg:block w-80 space-y-5 shrink-0">
      {/* Brand & Campus Mascot Card */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-lg">
        <div className="flex items-center gap-3.5 mb-3">
          <FacelessLogo size="md" showWordmark={false} />
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">Faceless Quad</h3>
            <p className="text-xs text-neutral-400">Anonymous Class Chatter</p>
          </div>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          The uncensored, anonymous board for lectures, study halls, and dining reviews. Keep it witty, honest, and respectful.
        </p>

        <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Enrolled pass:</span>
          <span className="font-mono text-[11px] font-bold text-emerald-400">
            {activeCodeName || 'QUAD-PASS'}
          </span>
        </div>
      </div>

      {/* Admin Code Generator Trigger Card (Strictly for Admins only) */}
      {isAdmin && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Key className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Admin Clearance</span>
                <span className="text-[11px] text-amber-300/80">Manage codes & students</span>
              </div>
            </div>
            <button
              onClick={onOpenAdmin}
              className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              Open
            </button>
          </div>

          {onLogoutAdmin && (
            <div className="pt-2 border-t border-amber-500/20 flex justify-end">
              <button
                onClick={() => {
                  if (confirm('Log out of administrator clearance?')) {
                    onLogoutAdmin();
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-900/40 bg-rose-950/30 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 hover:text-white transition-colors"
              >
                <span>Log Out Admin</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* The -5 Community Standard Card */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2">
          <ThumbsDown className="h-4 w-4" />
          <span>The -5 Downvote Rule</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          No waiting for moderators. If a post receives <strong className="text-rose-400 font-mono">-5 net votes</strong> from classmates, it is automatically purged from the Quad forever.
        </p>
        <button
          onClick={onOpenStandards}
          className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Read Honor Code & Safety Rules</span>
        </button>
      </div>

      {/* Class Sections Directory */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span>Class Channels</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">Real-time</span>
        </div>

        <div className="space-y-1">
          {COURSE_CHANNELS.map((ch) => {
            const isSelected = selectedCourse === ch.code || (ch.code === 'ALL' && selectedCourse === 'ALL');
            return (
              <button
                key={ch.id}
                onClick={() => onSelectCourse(ch.code)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors text-left ${
                  isSelected
                    ? 'bg-neutral-800 text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{ch.icon}</span>
                  <span className="truncate">{ch.code}</span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-neutral-500 shrink-0">
                  {ch.membersCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campus Simulation Trigger */}
      <div className="rounded-3xl border border-dashed border-neutral-800 p-4 bg-neutral-950/40">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">Class chatter quiet?</span>
          <button
            onClick={onSimulateChatter}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-neutral-700 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simulate Thought</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
