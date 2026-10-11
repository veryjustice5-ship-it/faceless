import React from 'react';
import { X, Award, RefreshCw, Flame, MessageSquare, ShieldCheck, RotateCcw } from 'lucide-react';
import { getRandomAnonymousIdentity } from '../hooks/useYakStore';
import { YakPost } from '../types/yak';

interface YakarmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  yakarma: number;
  userProfile: { alias: string; avatar: string };
  onUpdateProfile: (profile: { alias: string; avatar: string }) => void;
  posts: YakPost[];
  deviceId: string;
  onResetDefaults: () => void;
}

export const YakarmaModal: React.FC<YakarmaModalProps> = ({
  isOpen,
  onClose,
  yakarma,
  userProfile,
  onUpdateProfile,
  posts,
  deviceId,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const myPostsCount = posts.filter((p) => p.authorId === deviceId).length;
  const myCommentsCount = posts.reduce((acc, p) => {
    return acc + p.comments.filter((c) => c.authorId === deviceId).length;
  }, 0);

  // Compute status rank
  let rankTitle = 'Quad Freshman';
  let rankDesc = 'Getting familiar with the class feed';
  if (yakarma >= 250) {
    rankTitle = 'Campus Legend';
    rankDesc = 'Iconic contributor whose thoughts carry the community';
  } else if (yakarma >= 120) {
    rankTitle = 'Hall of Fame Regular';
    rankDesc = 'Consistently hilarious and helpful';
  } else if (yakarma >= 50) {
    rankTitle = 'Lecture Hall Regular';
    rankDesc = 'Active contributor across class channels';
  }

  const handleReroll = () => {
    const fresh = getRandomAnonymousIdentity();
    onUpdateProfile(fresh);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6 shrink-0 bg-neutral-950/80">
          <div className="flex items-center gap-2 text-amber-400">
            <Award className="h-5 w-5" />
            <h2 className="text-base font-bold text-white">My Karma & Identity</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-300">
          {/* Identity Card */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-2xl border border-neutral-700">
                  {userProfile.avatar}
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">{userProfile.alias}</h3>
                  <p className="text-xs text-neutral-400">Your current anonymous persona</p>
                </div>
              </div>
              <button
                onClick={handleReroll}
                title="Reroll anonymous avatar & name"
                className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reroll</span>
              </button>
            </div>
          </div>

          {/* Score & Rank */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-center">
            <span className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold">
              Total Karma Score
            </span>
            <div className="my-2 font-mono tabular-nums text-4xl font-extrabold text-amber-400">
              {yakarma}
            </div>
            <div className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
              {rankTitle}
            </div>
            <p className="mt-2 text-xs text-neutral-400">{rankDesc}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <Flame className="h-4 w-4 text-emerald-400" />
                <span>Thoughts Authored</span>
              </div>
              <div className="font-mono tabular-nums text-xl font-bold text-white">
                {myPostsCount}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <span>Replies Posted</span>
              </div>
              <div className="font-mono tabular-nums text-xl font-bold text-white">
                {myCommentsCount}
              </div>
            </div>
          </div>

          {/* Reset Demo Database */}
          <div className="border-t border-neutral-800/80 pt-4 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Need to restore original sample chatter?</span>
            <button
              onClick={() => {
                if (confirm('Reset posts to initial sample campus chatter?')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Sample Feed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
