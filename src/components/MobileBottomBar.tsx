import React from 'react';
import { Flame, MessageSquare, PlusCircle, Shield, Award, Key } from 'lucide-react';

interface MobileBottomBarProps {
  currentView: 'feed' | 'chats';
  onChangeView: (view: 'feed' | 'chats') => void;
  onOpenCreate: () => void;
  onOpenStandards: () => void;
  onOpenKarma: () => void;
  onOpenAdmin?: () => void;
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
  isAdmin = false,
  yakarma,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-3 flex items-center justify-around">
      <button
        onClick={() => onChangeView('feed')}
        className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 transition-colors ${
          currentView === 'feed' ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <Flame className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Quad</span>
      </button>

      <button
        onClick={() => onChangeView('chats')}
        className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 transition-colors ${
          currentView === 'chats' ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Chats</span>
        <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
      </button>

      {/* Central Post Action */}
      <button
        onClick={onOpenCreate}
        className="flex items-center justify-center -mt-4 h-12 w-12 rounded-full bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
        aria-label="Post Anonymous Thought"
      >
        <PlusCircle className="h-6 w-6 stroke-[2.5]" />
      </button>

      <button
        onClick={onOpenStandards}
        className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <Shield className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Rules</span>
      </button>

      {isAdmin && onOpenAdmin ? (
        <button
          onClick={onOpenAdmin}
          className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-amber-400 font-bold transition-colors"
        >
          <Key className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Admin</span>
        </button>
      ) : (
        <button
          onClick={onOpenKarma}
          className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-neutral-500 hover:text-neutral-300 transition-colors"
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
