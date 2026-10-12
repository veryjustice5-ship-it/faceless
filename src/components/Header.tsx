import React from 'react';
import { Plus, Shield, Award, Key, LogOut } from 'lucide-react';
import { FacelessLogo } from './FacelessLogo';

interface HeaderProps {
  onOpenCreate: () => void;
  onOpenStandards: () => void;
  onOpenKarma: () => void;
  onOpenAdmin: () => void;
  onLockSession: () => void;
  isAdmin: boolean;
  activeCodeName?: string;
  yakarma: number;
  activeTab: string;
  onSelectNav: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreate,
  onOpenStandards,
  onOpenKarma,
  onOpenAdmin,
  onLockSession,
  isAdmin,
  activeCodeName,
  yakarma,
  activeTab,
  onSelectNav,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between gap-2 sm:gap-6 md:gap-8 px-3 sm:px-6">
        {/* Zone 1: Brand wordmark (single text element) */}
        <button
          onClick={() => onSelectNav('hot')}
          className="flex items-center gap-2 text-left transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
        >
          <FacelessLogo size="sm" showWordmark={true} />
        </button>

        {/* Zone 2: 4-5 concise single-line nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-neutral-400">
          <button
            onClick={() => onSelectNav('hot')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'hot' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Quad Feed
          </button>
          <button
            onClick={() => onSelectNav('chats')}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'chats' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            <span>Class Chats</span>
            <span className="rounded bg-amber-500/10 px-1 py-0.2 text-[10px] font-mono text-amber-400 font-semibold border border-amber-500/20">
              24h
            </span>
          </button>
          <button
            onClick={() => onSelectNav('my-yaks')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeTab === 'my-yaks' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            My Activity
          </button>
          <button
            onClick={onOpenStandards}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white text-neutral-400"
          >
            <Shield className="h-4 w-4 text-emerald-500/80" />
            <span>Community Rules</span>
          </button>
          <button
            onClick={onOpenKarma}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white text-neutral-300"
          >
            <Award className="h-4 w-4 text-amber-400" />
            <span className="font-mono tabular-nums text-xs text-amber-400 font-semibold">
              {yakarma} Karma
            </span>
          </button>

          {/* STRICT REQUIREMENT: Only visible to authorized administrators */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg"
            >
              <Key className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin ? (
            <button
              onClick={onLockSession}
              title="Log Out of Administrator Clearance"
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 px-2 sm:px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 hover:text-white transition-all shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span className="hidden sm:inline">Log Out Admin</span>
              <span className="sm:hidden">Logout</span>
            </button>
          ) : (
            <button
              onClick={onLockSession}
              title={activeCodeName ? `Active Pass: ${activeCodeName} (Click to switch code)` : 'Lock session'}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-[11px] truncate max-w-[90px]">
                {activeCodeName || 'Lock'}
              </span>
            </button>
          )}

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-500 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-neutral-950 shadow-md shadow-emerald-500/15 transition-all hover:bg-emerald-400 active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Post Thought</span>
            <span className="sm:hidden">Post</span>
          </button>
        </div>
      </div>
    </header>
  );
};

