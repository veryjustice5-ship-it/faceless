import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MessageCircle, Share2, Bookmark, Flag, Trash2, AlertTriangle, Eye, EyeOff, Check } from 'lucide-react';
import { YakPost } from '../types/yak';
import { formatRelativeTime } from '../utils/time';

interface YakCardProps {
  post: YakPost;
  currentDeviceId: string;
  isSaved: boolean;
  onVote: (postId: string, direction: 'up' | 'down') => void;
  onOpenThread: (post: YakPost) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onToggleSave: (postId: string) => void;
  onReport: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export const YakCard: React.FC<YakCardProps> = ({
  post,
  currentDeviceId,
  isSaved,
  onVote,
  onOpenThread,
  onVotePoll,
  onToggleSave,
  onReport,
  onDelete,
}) => {
  const [showRemovedOverride, setShowRemovedOverride] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasUpvoted = post.upvotes.includes(currentDeviceId);
  const hasDownvoted = post.downvotes.includes(currentDeviceId);
  const isAuthor = post.authorId === currentDeviceId;

  // Poll state
  const hasVotedPoll = post.poll?.options.some((opt) =>
    opt.votedUserIds?.includes(currentDeviceId)
  );

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `"${post.content}" — ${post.courseTag} on Faceless`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If removed by community standards (-5 downvotes or 3 reports)
  if (post.isRemoved && !showRemovedOverride) {
    return (
      <div className="relative rounded-2xl border border-rose-950/40 bg-neutral-900/40 p-4 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">
              {post.removeReason || 'Post removed by community standards (-5 downvotes)'}
            </span>
          </div>
          <button
            onClick={() => setShowRemovedOverride(true)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-neutral-800"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Inspect</span>
          </button>
        </div>
      </div>
    );
  }

  const isNearPurge = post.score <= -3 && !post.isRemoved;

  return (
    <article
      onClick={() => onOpenThread(post)}
      className="group relative cursor-pointer rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 transition-all duration-200 hover:border-neutral-700/80 hover:bg-neutral-900/90 shadow-sm"
    >
      {/* Community Warning if approaching -5 */}
      {isNearPurge && (
        <div className="mb-3.5 flex items-center justify-between rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 border border-amber-500/20">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Community Warning: Score is {post.score}. Post is removed at -5 downvotes.</span>
          </div>
        </div>
      )}

      {post.isRemoved && showRemovedOverride && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 border border-rose-500/20">
          <span>Viewing removed content for peer review</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRemovedOverride(false);
            }}
            className="flex items-center gap-1 text-neutral-400 hover:text-white"
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span>Collapse</span>
          </button>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Voting Column (Tactile Yik Yak style) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center justify-center rounded-xl bg-neutral-950/60 p-1 border border-neutral-800/60 min-w-[44px]"
        >
          <button
            onClick={() => onVote(post.id, 'up')}
            aria-label="Upvote"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              hasUpvoted
                ? 'bg-emerald-500 text-neutral-950 shadow-sm shadow-emerald-500/20'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-emerald-400'
            }`}
          >
            <ChevronUp className="h-5 w-5 stroke-[2.5]" />
          </button>

          <span
            className={`my-1 text-sm font-bold font-mono tabular-nums ${
              post.score > 0
                ? 'text-emerald-400'
                : post.score < 0
                ? 'text-rose-400'
                : 'text-neutral-400'
            }`}
          >
            {post.score}
          </span>

          <button
            onClick={() => onVote(post.id, 'down')}
            aria-label="Downvote"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              hasDownvoted
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-rose-400'
            }`}
          >
            <ChevronDown className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Post Content Area */}
        <div className="flex-1 min-w-0">
          {/* Zero-Pill Unboxed Metadata */}
          <div className="mb-2.5 flex flex-wrap items-center gap-x-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200">
              {post.authorAvatar} {post.authorAlias}
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="font-medium text-emerald-400/90">{post.courseTag}</span>
            {post.topicTag && (
              <>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-neutral-400">{post.topicTag}</span>
              </>
            )}
            {post.mood && (
              <>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-neutral-400">{post.mood}</span>
              </>
            )}
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-500">{formatRelativeTime(post.createdAt)}</span>
          </div>

          {/* Thought text */}
          <p className="text-base font-normal leading-relaxed text-neutral-100 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Attached Picture / Photo */}
          {post.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-sm">
              <img
                src={post.imageUrl}
                alt="Post photo"
                loading="lazy"
                className="max-h-96 w-full object-cover transition-transform duration-200 hover:opacity-95"
              />
            </div>
          )}

          {/* Interactive Anonymous Poll (if present) */}
          {post.poll && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-3.5 space-y-2 rounded-xl bg-neutral-950/70 p-3.5 border border-neutral-800"
            >
              <div className="flex items-center justify-between text-xs font-medium text-neutral-300 mb-1">
                <span className="font-semibold text-neutral-200">{post.poll.question}</span>
                <span className="text-neutral-500 font-mono tabular-nums">
                  {post.poll.totalVotes} {post.poll.totalVotes === 1 ? 'vote' : 'votes'}
                </span>
              </div>

              <div className="space-y-1.5">
                {post.poll.options.map((option) => {
                  const pct =
                    post.poll!.totalVotes > 0
                      ? Math.round((option.votes / post.poll!.totalVotes) * 100)
                      : 0;
                  const isUserPick = option.votedUserIds?.includes(currentDeviceId);

                  return (
                    <button
                      key={option.id}
                      onClick={() => onVotePoll(post.id, option.id)}
                      disabled={hasVotedPoll}
                      className={`group/opt relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left transition-all ${
                        isUserPick
                          ? 'border-emerald-500/60 bg-emerald-950/20 text-neutral-100'
                          : hasVotedPoll
                          ? 'border-neutral-800 bg-neutral-900/40 text-neutral-300'
                          : 'border-neutral-800/80 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-200 cursor-pointer'
                      }`}
                    >
                      {/* Percent Fill */}
                      {hasVotedPoll && (
                        <div
                          className="absolute inset-y-0 left-0 bg-emerald-500/15 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <div className="relative flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium flex items-center gap-1.5">
                          {option.text}
                          {isUserPick && (
                            <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                          )}
                        </span>
                        {hasVotedPoll && (
                          <span className="font-mono tabular-nums text-neutral-400 font-semibold shrink-0">
                            {pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 flex items-center justify-between border-t border-neutral-800/60 pt-3 text-xs text-neutral-400"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => onOpenThread(post)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-mono tabular-nums">
                  {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <Share2 className="h-4 w-4" />
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => onToggleSave(post.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-neutral-800 ${
                  isSaved ? 'text-emerald-400 font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-emerald-400' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              {isAuthor && onDelete && (
                <button
                  onClick={() => onDelete(post.id)}
                  title="Delete my post"
                  className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-rose-950/40 hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                onClick={() => onReport(post.id)}
                title="Flag for Community Standards"
                className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-rose-400"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
