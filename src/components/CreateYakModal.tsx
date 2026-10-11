import React, { useState } from 'react';
import { X, BarChart2, Plus, Trash2, ShieldCheck, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { COURSE_CHANNELS, TOPIC_TAGS } from '../data/initialYaks';
import { compressImageFile } from '../utils/image';

interface CreateYakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    content: string;
    courseTag: string;
    topicTag?: string;
    mood?: string;
    imageUrl?: string;
    pollQuestion?: string;
    pollOptions?: string[];
  }) => void;
}

const MOODS = [
  '☕ Cramming',
  '😂 Laughing',
  '😭 Stressed',
  '💡 Thought',
  '🤫 Confession',
  '🙏 Praying For Curve',
  '🔥 Hot Take',
];

export const CreateYakModal: React.FC<CreateYakModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [courseTag, setCourseTag] = useState('ALL');
  const [topicTag, setTopicTag] = useState('#CampusLife');
  const [selectedMood, setSelectedMood] = useState('☕ Cramming');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);

  if (!isOpen) return null;

  const maxLength = 300;
  const charsRemaining = maxLength - content.length;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    try {
      const dataUrl = await compressImageFile(file, 1000, 0.8);
      setImageUrl(dataUrl);
    } catch (err) {
      console.error('Image compression error', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Simple client-side safety detection for numbers or emails
  const hasPotentialPersonalInfo =
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(content) ||
    /@[\w.]+/.test(content) ||
    /instagram|snapchat|phone number/i.test(content);

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`]);
    }
  };

  const handleUpdatePollOption = (index: number, val: string) => {
    const next = [...pollOptions];
    next[index] = val;
    setPollOptions(next);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    const selectedCourse = COURSE_CHANNELS.find((c) => c.id === courseTag || c.code === courseTag);
    const resolvedCourseTag = selectedCourse ? selectedCourse.code : courseTag;

    onSubmit({
      content: content.trim(),
      courseTag: resolvedCourseTag,
      topicTag,
      mood: selectedMood,
      imageUrl: imageUrl || undefined,
      pollQuestion: showPoll ? pollQuestion : undefined,
      pollOptions: showPoll ? pollOptions : undefined,
    });

    // Reset and close
    setContent('');
    setImageUrl(null);
    setShowPoll(false);
    setPollQuestion('');
    setPollOptions(['Option 1', 'Option 2']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-neutral-800/80 px-5 shrink-0 bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Post Anonymous Thought</span>
            <span className="text-xs text-neutral-400">· 100% Private</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Channel and Tag Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Class / Channel
              </label>
              <select
                value={courseTag}
                onChange={(e) => setCourseTag(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
              >
                {COURSE_CHANNELS.map((ch) => (
                  <option key={ch.id} value={ch.code}>
                    {ch.icon} {ch.code} - {ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Topic Tag
              </label>
              <select
                value={topicTag}
                onChange={(e) => setTopicTag(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-white focus:border-emerald-500 focus:outline-none"
              >
                {TOPIC_TAGS.filter((t) => t !== '#AllTopics').map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={4}
              maxLength={maxLength}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in lecture, the lab, or the library? Keep it constructive, witty, and anonymous..."
              className="w-full resize-none rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 text-base text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Protected by the -5 downvote community standard</span>
              </span>
              <span
                className={`font-mono tabular-nums font-medium ${
                  charsRemaining < 30 ? 'text-rose-400' : 'text-neutral-400'
                }`}
              >
                {charsRemaining} left
              </span>
            </div>
          </div>

          {/* Privacy Alert if potential personal info detected */}
          {hasPotentialPersonalInfo && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Reminder: Do not post personal names, phone numbers, or social handles. Posts violating this get removed at -5 downvotes.
              </span>
            </div>
          )}

          {/* Mood / Vibe selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Select Vibe / Mood
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((mood) => (
                <button
                  type="button"
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                    selectedMood === mood
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Picture Upload Section */}
          <div className="border-t border-neutral-800/80 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                <ImageIcon className="h-4 w-4" />
                <span>{imageUrl ? 'Change Picture' : '+ Attach Picture / Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {isProcessingImage && (
                <span className="text-[11px] text-neutral-400 font-mono animate-pulse">
                  Compressing image...
                </span>
              )}
            </div>

            {imageUrl && (
              <div className="relative mt-2 overflow-hidden rounded-2xl border border-neutral-700 bg-black/40 max-h-56">
                <img
                  src={imageUrl}
                  alt="Post Attachment"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 rounded-full bg-neutral-900/90 p-1.5 text-neutral-300 hover:text-rose-400 hover:bg-neutral-800 transition-colors shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Poll Toggle & Fields */}
          <div className="border-t border-neutral-800/80 pt-3">
            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className="flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <BarChart2 className="h-4 w-4" />
              <span>{showPoll ? 'Remove Anonymous Poll' : '+ Attach Anonymous Poll'}</span>
            </button>

            {showPoll && (
              <div className="mt-3 space-y-2.5 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5">
                <input
                  type="text"
                  placeholder="Poll Question (e.g. Will the midterm have a curve?)"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />

                <div className="space-y-1.5">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdatePollOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(idx)}
                          className="p-1 text-neutral-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-emerald-400"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add another option (up to 4)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!content.trim() && !imageUrl}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-neutral-950 shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 active:scale-[0.99]"
            >
              Post Thought to {courseTag}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
