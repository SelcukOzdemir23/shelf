const compactFormat = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export function compact(value?: number | null): string {
  if (value == null) return '0';
  return compactFormat.format(value);
}

export function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  return Math.floor((Date.now() - parsed) / 86_400_000);
}

export function released(iso?: string | null): string {
  const days = daysSince(iso);
  if (days == null) return 'unknown';
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

export function shortDate(iso?: string | null): string {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function isFresh(iso?: string | null, maxDays = 7): boolean {
  const days = daysSince(iso);
  return days != null && days <= maxDays;
}

// Upstream descriptions are written by hundreds of projects and contain em and
// en dashes plus collapsed whitespace. Normalise them for display so the
// catalogue keeps one typographic voice.
export function clean(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export function releasedPrecise(iso?: string | null): string {
  if (!iso) return 'unknown';
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return 'unknown';
  const hours = Math.floor((Date.now() - parsed) / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'yesterday';
  return released(iso);
}
