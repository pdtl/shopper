/**
 * Returns a friendly "time ago" string for a given date, e.g. "just now", "10 minutes ago", "last week".
 */
export function timeAgo(date: string | Date): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin === 1) return "1 minute ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour === 1) return "1 hour ago";
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffWeek === 1) return "last week";
  if (diffWeek < 4) return `${diffWeek} weeks ago`;
  if (diffMonth === 1) return "last month";
  if (diffMonth < 12) return `${diffMonth} months ago`;
  if (diffYear === 1) return "last year";
  return `${diffYear} years ago`;
}
