export function formatRelativeTime(value: string | Date) {
  const timestamp = typeof value === 'string' ? new Date(value).getTime() : value.getTime();
  const diff = Date.now() - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;

  if (diff < hour) {
    const minutes = Math.max(1, Math.round(diff / minute));
    return `${minutes}m ago`;
  }
  if (diff < day) {
    const hours = Math.max(1, Math.round(diff / hour));
    return `${hours}h ago`;
  }
  if (diff < 2 * day) return 'yesterday';
  if (diff < week) {
    return `${Math.max(1, Math.round(diff / day))}d ago`;
  }
  if (diff < month) {
    return `${Math.max(1, Math.round(diff / week))}w ago`;
  }
  return `${Math.max(1, Math.round(diff / month))}mo ago`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
}
