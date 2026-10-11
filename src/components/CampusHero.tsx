import React from 'react';
import { MessageSquarePlus, ShieldCheck } from 'lucide-react';
import campusQuadBanner from '../assets/images/campus_quad_banner_1791683877643.jpg';

interface CampusHeroProps {
  onOpenCreate: () => void;
  onOpenStandards: () => void;
  activeCourseName: string;
}

export const CampusHero: React.FC<CampusHeroProps> = ({
  onOpenCreate,
  onOpenStandards,
  activeCourseName,
}) => {
  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/60 shadow-lg">
      {/* Background Banner Image with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={campusQuadBanner}
          alt="Campus Quad at Dusk"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
      </div>

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold tracking-wide">
              <span>{activeCourseName}</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>Anonymous Feed</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Speak candidly. Upvote wisdom. Downvote nonsense.
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-300 max-w-xl">
              Strictly anonymous peer board. Posts that reach -5 downvotes are automatically purged to maintain campus standards.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenStandards}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Honor Code</span>
            </button>
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>Drop a Thought</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
