import React from 'react';
import { Flame, Clock, Trophy, Bookmark, User, Search, X } from 'lucide-react';
import { FeedTab } from '../types/yak';
import { COURSE_CHANNELS, TOPIC_TAGS } from '../data/initialYaks';

interface FilterBarProps {
  currentTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  selectedCourse: string;
  onCourseChange: (code: string) => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentTab,
  onTabChange,
  selectedCourse,
  onCourseChange,
  selectedTopic,
  onTopicChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-3.5 mb-6">
      {/* Search & Tabs Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented Feed Controls */}
        <div className="inline-flex items-center rounded-xl bg-neutral-900/90 p-1 border border-neutral-800/80 shadow-inner">
          <button
            onClick={() => onTabChange('hot')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'hot'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Hot</span>
          </button>

          <button
            onClick={() => onTabChange('new')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'new'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>New</span>
          </button>

          <button
            onClick={() => onTabChange('top')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'top'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Top</span>
          </button>

          <button
            onClick={() => onTabChange('my-yaks')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'my-yaks'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>My Posts</span>
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'saved'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search class thoughts..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-1.5 pl-8 pr-8 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Courses & Topics Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {COURSE_CHANNELS.map((ch) => {
          const isSelected = selectedCourse === ch.code || (ch.code === 'ALL' && selectedCourse === 'ALL');
          return (
            <button
              key={ch.id}
              onClick={() => onCourseChange(ch.code)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                  : 'bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800/60'
              }`}
            >
              <span>{ch.icon}</span>
              <span>{ch.code}</span>
            </button>
          );
        })}
      </div>

      {/* Topic Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-neutral-500 shrink-0 text-[11px] uppercase tracking-wider font-semibold">
          Topic:
        </span>
        {TOPIC_TAGS.map((tag) => {
          const isSelected = selectedTopic === tag || (tag === '#AllTopics' && selectedTopic === '');
          return (
            <button
              key={tag}
              onClick={() => onTopicChange(tag === '#AllTopics' ? '' : tag)}
              className={`rounded-md px-2 py-0.5 whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-neutral-800 text-emerald-400 font-semibold border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
