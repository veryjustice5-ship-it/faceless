export function formatRelativeTime(isoString: string): string {
  try {
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

// Calculate Hot score inspired by HackerNews/Reddit/YikYak gravity algorithms
export function calculateHotScore(score: number, createdAtIso: string): number {
  const hoursSince = Math.max(0.1, (Date.now() - new Date(createdAtIso).getTime()) / (1000 * 60 * 60));
  const order = Math.max(1, score + 10);
  return order / Math.pow(hoursSince + 2, 1.4);
}
