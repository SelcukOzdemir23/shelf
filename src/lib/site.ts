export const SITE = {
  name: 'Shelf',
  title: 'Shelf, an independent discovery shelf for open-source releases',
  description:
    'Browse open-source apps published as GitHub releases. Trending, new releases and topic shelves, with install links straight to the project.',
  sourceUrl: 'https://github.com/SelcukOzdemir23/shelf',
  dataUrl: 'https://github.com/komi-store/komi-store-backend-data',
  upstreamUrl: 'https://github.com/komi-store/komi-store',
};

const rawBase = import.meta.env.BASE_URL || '/';
export const BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

export const MAX_ROWS = 120;

export function link(path = ''): string {
  const clean = path.replace(/^\//, '');
  return clean ? `${BASE}/${clean}` : `${BASE}/`;
}

export interface PlatformMeta {
  id: string;
  slug: string;
  label: string;
  field: 'hasInstallersAndroid' | 'hasInstallersWindows' | 'hasInstallersMacos' | 'hasInstallersLinux';
  tick: string;
}

export const PLATFORMS: PlatformMeta[] = [
  { id: 'android', slug: 'android', label: 'Android', field: 'hasInstallersAndroid', tick: 'A' },
  { id: 'windows', slug: 'windows', label: 'Windows', field: 'hasInstallersWindows', tick: 'W' },
  { id: 'macos', slug: 'macos', label: 'macOS', field: 'hasInstallersMacos', tick: 'M' },
  { id: 'linux', slug: 'linux', label: 'Linux', field: 'hasInstallersLinux', tick: 'L' },
];

export const ALL_PLATFORM = { id: 'all', slug: 'all', label: 'Every platform' } as const;

export type PlatformSlug = 'all' | 'android' | 'windows' | 'macos' | 'linux';

export const PLATFORM_SLUGS: PlatformSlug[] = ['all', 'android', 'windows', 'macos', 'linux'];

export interface ViewMeta {
  slug: string;
  label: string;
  hint: string;
  source: 'categories';
  name: string;
}

export const VIEWS: ViewMeta[] = [
  { slug: 'trending', label: 'Trending', hint: 'Moving fastest this week', source: 'categories', name: 'trending' },
  { slug: 'new-releases', label: 'New releases', hint: 'Fresh off the tag', source: 'categories', name: 'new-releases' },
  { slug: 'most-popular', label: 'Most popular', hint: 'Most downloaded through the app', source: 'categories', name: 'most-popular' },
];

export const TOPICS = [
  { slug: 'privacy', label: 'Privacy', blurb: 'VPNs, encryption and tools that keep data local' },
  { slug: 'media', label: 'Media', blurb: 'Players, editors and podcast clients' },
  { slug: 'productivity', label: 'Productivity', blurb: 'Notes, tasks, calendars and files' },
  { slug: 'networking', label: 'Networking', blurb: 'Tunnels, sync, SSH and diagnostics' },
  { slug: 'dev-tools', label: 'Dev tools', blurb: 'Editors, terminals and the rest of the bench' },
];

export function platformLabel(slug: string): string {
  if (slug === 'all') return ALL_PLATFORM.label;
  return PLATFORMS.find((entry) => entry.slug === slug)?.label ?? slug;
}

export function topicLabel(slug: string): string {
  return TOPICS.find((entry) => entry.slug === slug)?.label ?? slug;
}

export function viewLabel(slug: string): string {
  return VIEWS.find((entry) => entry.slug === slug)?.label ?? slug;
}
