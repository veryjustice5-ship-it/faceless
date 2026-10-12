import React from 'react';
import { Flame, MessageSquare, PlusCircle, Shield, Award, Key, LogOut } from 'lucide-react';

interface MobileBottomBarProps {
  currentView: 'feed' | 'chats';
  onChangeView: (view: 'feed' | 'chats') => void;
  onOpenCreate: () => void;
  onOpenStandards: () => void;
  onOpenKarma: () => void;
  onOpenAdmin?: () => void;
  onLogoutAdmin?: () => void;
  isAdmin?: boolean;
  yakarma: number;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentView,
  onChangeView,
  onOpenCreate,
  onOpenStandards,
  onOpenKarma,
  onOpenAdmin,
  onLogoutAdmin,
  isAdmin = false,
  yakarma,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 pb-safe border-t border-neutral-800/90 bg-neutral-950/95 backdrop-blur-md px-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => onChangeView('feed')}
        className={`flex-1 flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 transition-colors ${
          currentView === 'feed' ? 'text-emerald-400 font-bold' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <Flame className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Quad</span>
      </button>

      <button
        onClick={() => onChangeView('chats')}
        className={`flex-1 relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 transition-colors ${
          currentView === 'chats' ? 'text-emerald-400 font-bold' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Chats</span>
        <span className="absolute top-1 right-3 h-1.5 w-1.5 rounded-full bg-amber-400" />
      </button>

      {/* Central Post Action */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center -mt-5 h-12 w-12 rounded-full bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 shrink-0"
          aria-label="Post Anonymous Thought"
        >
          <PlusCircle className="h-6 w-6 stroke-[2.5]" />
        </button>
      </div>

      <button
        onClick={onOpenStandards}
        className="flex-1 flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <Shield className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Rules</span>
      </button>

      {isAdmin ? (
        <div className="flex-1 flex items-center justify-center gap-1">
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex flex-col items-center justify-center min-w-[36px] min-h-[44px] py-1 text-amber-400 font-bold transition-colors"
              title="Admin Console"
            >
              <Key className="h-5 w-5" />
              <span className="text-[9px] mt-0.5">Admin</span>
            </button>
          )}
          {onLogoutAdmin && (
            <button
              onClick={() => {
                if (confirm('Log out of administrator clearance?')) {
                  onLogoutAdmin();
                }
              }}
              className="flex flex-col items-center justify-center min-w-[36px] min-h-[44px] py-1 text-rose-400 font-bold transition-colors"
              title="Log Out Admin"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[9px] mt-0.5">Logout</span>
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={onOpenKarma}
          className="flex-1 flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <Award className="h-5 w-5 text-amber-400" />
          <span className="text-[10px] font-mono tabular-nums font-semibold mt-0.5 text-amber-400">
            {yakarma}
          </span>
        </button>
      )}
    </nav>
  );
};
