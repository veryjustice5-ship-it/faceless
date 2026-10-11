import React from 'react';
import { X, Shield, ThumbsDown, UserX, BookOpen, HeartHandshake } from 'lucide-react';

interface CommunityStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityStandardsModal: React.FC<CommunityStandardsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6 shrink-0 bg-neutral-950/80">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Shield className="h-5 w-5" />
            <h2 className="text-base font-bold text-white">Community Standards & The -5 Rule</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-300">
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
            <p className="font-semibold text-emerald-300 mb-1">
              Classroom Anonymity with Collective Accountability
            </p>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Faceless is built on the classic anonymous forum philosophy: students should be free to speak honestly, share study humor, and ask genuine questions without social anxiety. In return, the community polices itself using the ballot box.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ThumbsDown className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">1. The -5 Downvote Threshold</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Every student has equal voting power. When any post drops to a net score of <strong className="text-rose-400 font-mono">-5</strong>, it is instantly purged from the feed. You don’t need an admin to clean up the quad; downvote bad content and it disappears.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <UserX className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">2. No Names, Handles, or Doxxing</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Never post personal names, student IDs, phone numbers, dorm room numbers, or social media handles. Target ideas, courses, and professors’ general syllabus quirks—never individual classmates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">3. Honor Code & Academic Integrity</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Discussing concepts, sharing general study tips, and venting about difficult problem sets is celebrated. Posting live exam questions or asking for completed test answers violates university honor codes and will be flagged immediately.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">4. Earn Karma Through Quality</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Helpful advice, witty lecture quotes, study group announcements, and supportive comments earn you Karma points. Karma reflects your positive footprint across your class community.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-neutral-950 transition-colors hover:bg-emerald-400"
            >
              I Understand & Agree to Honor Standards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
