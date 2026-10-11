import React, { useState } from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';

interface ReportModalProps {
  postId: string | null;
  onClose: () => void;
  onSubmitReport: (postId: string, reason: string) => void;
}

const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment or Bullying', desc: 'Targeting a specific student or instructor maliciously' },
  { id: 'doxxing', label: 'Personal Information / Doxxing', desc: 'Sharing private names, phone numbers, dorms, or socials' },
  { id: 'cheating', label: 'Academic Dishonesty', desc: 'Posting active exam leaks, quizzes, or Honor Code violations' },
  { id: 'hate', label: 'Hate Speech or Intolerance', desc: 'Discrimination based on identity, race, religion, or orientation' },
  { id: 'spam', label: 'Spam or Commercial Promotion', desc: 'Selling products, external links, or irrelevant noise' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  postId,
  onClose,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('harassment');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!postId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonObj = REPORT_REASONS.find((r) => r.id === selectedReason);
    onSubmitReport(postId, reasonObj ? reasonObj.label : 'Community Violation');
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Report Content</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
            <p className="text-sm font-semibold text-white">Report Submitted</p>
            <p className="text-xs text-neutral-400">
              Thank you for keeping the campus community safe and civil.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="text-xs text-neutral-400">
              Posts that accumulate 3 community reports or reach -5 downvotes are immediately quarantined or removed from the campus feed.
            </p>

            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    selectedReason === reason.id
                      ? 'border-rose-500/50 bg-rose-950/20 text-white'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                    className="mt-0.5 text-rose-500 focus:ring-rose-500"
                  />
                  <div>
                    <span className="block text-xs font-semibold">{reason.label}</span>
                    <span className="block text-[11px] text-neutral-400 mt-0.5">{reason.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-rose-500 shadow-sm shadow-rose-600/20"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
