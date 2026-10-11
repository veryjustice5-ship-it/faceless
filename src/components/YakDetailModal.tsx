import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown, Send, ShieldAlert, Flag, Image as ImageIcon } from 'lucide-react';
import { YakPost } from '../types/yak';
import { formatRelativeTime } from '../utils/time';
import { compressImageFile } from '../utils/image';

interface YakDetailModalProps {
  post: YakPost | null;
  currentDeviceId: string;
  onClose: () => void;
  onVotePost: (postId: string, direction: 'up' | 'down') => void;
  onAddComment: (postId: string, content: string, imageUrl?: string) => void;
  onVoteComment: (postId: string, commentId: string, direction: 'up' | 'down') => void;
  onReport: (postId: string) => void;
}

export const YakDetailModal: React.FC<YakDetailModalProps> = ({
  post,
  currentDeviceId,
  onClose,
  onVotePost,
  onAddComment,
  onVoteComment,
  onReport,
}) => {
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!post) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const dataUrl = await compressImageFile(file, 1000, 0.8);
      setCommentImage(dataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !commentImage) return;
    onAddComment(post.id, commentText, commentImage || undefined);
    setCommentText('');
    setCommentImage(null);
  };

  const hasUpvotedPost = post.upvotes.includes(currentDeviceId);
  const hasDownvotedPost = post.downvotes.includes(currentDeviceId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative flex h-[90vh] max-h-[820px] w-full max-w-2xl flex-col rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex h-14 items-center justify-between border-b border-neutral-800/80 px-5 shrink-0 bg-neutral-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-semibold text-emerald-400">{post.courseTag}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Anonymous Discussion</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Main Original Yak */}
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4">
            <div className="flex items-start gap-3.5">
              {/* Vote controls */}
              <div className="flex flex-col items-center rounded-xl bg-neutral-950/60 p-1 border border-neutral-800/60 shrink-0">
                <button
                  onClick={() => onVotePost(post.id, 'up')}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    hasUpvotedPost
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-emerald-400'
                  }`}
                >
                  <ChevronUp className="h-4 w-4 stroke-[2.5]" />
                </button>
                <span className="my-0.5 text-xs font-bold font-mono tabular-nums text-neutral-200">
                  {post.score}
                </span>
                <button
                  onClick={() => onVotePost(post.id, 'down')}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    hasDownvotedPost
                      ? 'bg-rose-500 text-white'
                      : 'text-neutral-400 hover:text-rose-400'
                  }`}
                >
                  <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-x-2 text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-200">
                    {post.authorAvatar} {post.authorAlias}
                  </span>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span className="text-neutral-500">{formatRelativeTime(post.createdAt)}</span>
                </div>
                <p className="text-base text-neutral-100 leading-relaxed break-words">
                  {post.content}
                </p>

                {/* Post attached photo */}
                {post.imageUrl && (
                  <div
                    onClick={() => setLightboxImage(post.imageUrl!)}
                    className="mt-3 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-sm cursor-pointer group"
                  >
                    <img
                      src={post.imageUrl}
                      alt="Post picture"
                      loading="lazy"
                      className="max-h-96 w-full object-cover transition-transform group-hover:scale-[1.01]"
                    />
                  </div>
                )}

                {/* Poll if present */}
                {post.poll && (
                  <div className="mt-3 rounded-xl bg-neutral-950/70 p-3 border border-neutral-800 text-xs">
                    <p className="font-semibold text-neutral-200 mb-2">{post.poll.question}</p>
                    <div className="space-y-1.5">
                      {post.poll.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center justify-between rounded-lg bg-neutral-900/60 px-3 py-1.5 text-neutral-300"
                        >
                          <span>{opt.text}</span>
                          <span className="font-mono tabular-nums text-neutral-400 font-semibold">
                            {opt.votes} votes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comment Thread Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-400 border-b border-neutral-800/60 pb-2">
              <span>{post.comments.length} Comments</span>
              <span className="text-neutral-500">All student identities are anonymized per thread</span>
            </div>

            {post.comments.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-500">
                No replies yet. Be the first to share an anonymous thought!
              </div>
            ) : (
              post.comments.map((comment) => {
                const hasUpvotedC = comment.upvotes.includes(currentDeviceId);
                const hasDownvotedC = comment.downvotes.includes(currentDeviceId);
                const isCommentHidden = comment.score <= -3;

                if (isCommentHidden) {
                  return (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-rose-950/30 bg-neutral-900/20 px-3 py-2 text-xs text-neutral-500 flex items-center gap-2"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                      <span>Comment collapsed due to negative community downvotes</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={comment.id}
                    className="flex items-start gap-3 rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-3.5 transition-colors"
                  >
                    {/* Comment Vote */}
                    <div className="flex flex-col items-center rounded-lg bg-neutral-950/40 p-0.5 border border-neutral-800/40 shrink-0">
                      <button
                        onClick={() => onVoteComment(post.id, comment.id, 'up')}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                          hasUpvotedC
                            ? 'bg-emerald-500 text-neutral-950'
                            : 'text-neutral-400 hover:text-emerald-400'
                        }`}
                      >
                        <ChevronUp className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                      <span className="my-0.5 text-[11px] font-bold font-mono tabular-nums text-neutral-300">
                        {comment.score}
                      </span>
                      <button
                        onClick={() => onVoteComment(post.id, comment.id, 'down')}
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                          hasDownvotedC
                            ? 'bg-rose-500 text-white'
                            : 'text-neutral-400 hover:text-rose-400'
                        }`}
                      >
                        <ChevronDown className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2 text-xs">
                        <span className="font-semibold text-neutral-300">
                          {comment.authorAvatar} {comment.authorAlias}
                        </span>
                        {comment.isOP && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                            OP
                          </span>
                        )}
                        <span aria-hidden="true" className="text-neutral-600">·</span>
                        <span className="text-neutral-500">{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-neutral-200 leading-relaxed break-words">
                        {comment.content}
                      </p>

                      {comment.imageUrl && (
                        <div
                          onClick={() => setLightboxImage(comment.imageUrl!)}
                          className="mt-2 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 cursor-pointer group"
                        >
                          <img
                            src={comment.imageUrl}
                            alt="Comment photo"
                            loading="lazy"
                            className="max-h-64 w-full object-cover transition-transform group-hover:scale-[1.01]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Floating Comment Form at Bottom */}
        <div className="border-t border-neutral-800 bg-neutral-950 p-3 shrink-0">
          {/* Image preview before posting comment */}
          {commentImage && (
            <div className="relative mb-2.5 inline-block overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900">
              <img
                src={commentImage}
                alt="Comment attachment preview"
                className="h-20 w-28 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setCommentImage(null)}
                className="absolute top-1 right-1 rounded-full bg-neutral-950/80 p-1 text-neutral-300 hover:text-rose-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <label
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors shrink-0"
              title="Attach photo to reply"
            >
              <ImageIcon className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={isCompressing ? 'Compressing photo...' : 'Reply anonymously...'}
              maxLength={300}
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900/90 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />

            <button
              type="submit"
              disabled={(!commentText.trim() && !commentImage) || isCompressing}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-neutral-950 font-bold transition-all hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Lightbox Fullscreen Photo Viewer */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Expanded view"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 rounded-full bg-neutral-900/80 p-2 text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
