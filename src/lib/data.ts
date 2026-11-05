import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PLATFORMS, type PlatformSlug, TOPICS, VIEWS } from './site';

export interface Owner {
  login: string;
  avatarUrl: string;
}

export interface PlatformRelease {
  tag?: string | null;
  publishedAt?: string | null;
}

export interface Repo {
  id: number;
  name: string;
  fullName: string;
  owner: Owner;
  description?: string | null;
  htmlUrl: string;
  releasesUrl?: string | null;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount?: number;
  downloadCount: number;
  language?: string | null;
  topics?: string[];
  latestReleaseDate?: string | null;
  archived?: boolean;
  createdAt?: string | null;
  pushedAt?: string | null;
  releaseRecency?: number | null;
  releaseRecencyText?: string | null;
  platformReleases?: Record<string, PlatformRelease> | null;
  hasInstallersAndroid?: boolean;
  hasInstallersWindows?: boolean;
  hasInstallersMacos?: boolean;
  hasInstallersLinux?: boolean;
  popularityScore?: number | null;
  trendingScore?: number | null;
}

export interface Shelf {
  lastUpdated: string | null;
  repositories: Repo[];
}

const DATA = path.resolve(process.cwd(), 'src', 'data');

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(path.join(DATA, file), 'utf8')) as T;
  } catch {
    return null;
  }
}

export function readShelf(kind: 'categories' | 'topics', name: string, platform: string): Shelf {
  return readJson<Shelf>(path.join(kind, name, `${platform}.json`)) ?? { lastUpdated: null, repositories: [] };
}

let indexCache: Repo[] | null = null;

export function readIndex(): Repo[] {
  if (!indexCache) indexCache = readJson<Repo[]>('repos.json') ?? [];
  return indexCache;
}

export function readBuild(): { builtAt: string; repos: number; mirrors: number; requests: number } | null {
  return readJson('build.json');
}

export function findRepo(owner: string, name: string): Repo | undefined {
  return readIndex().find((repo) => repo.fullName.toLowerCase() === `${owner}/${name}`.toLowerCase());
}

export type SortMode = 'trending' | 'new-releases' | 'most-popular' | 'topic';

export function mergeShelves(lists: Shelf[], platforms: string[], sort: SortMode): Repo[] {
  const onlyOne = lists.length === 1;
  if (onlyOne) return lists[0].repositories;

  const byId = new Map<number, Repo>();
  lists.forEach((shelf, position) => {
    for (const repo of shelf.repositories) {
      const seen = byId.get(repo.id);
      if (!seen) {
        byId.set(repo.id, { ...repo });
        continue;
      }
      if (repo.trendingScore && (!seen.trendingScore || repo.trendingScore > seen.trendingScore)) {
        seen.trendingScore = repo.trendingScore;
      }
      if (repo.popularityScore && (!seen.popularityScore || repo.popularityScore > seen.popularityScore)) {
        seen.popularityScore = repo.popularityScore;
      }
      if (repo.latestReleaseDate && (!seen.latestReleaseDate || repo.latestReleaseDate > seen.latestReleaseDate)) {
        seen.latestReleaseDate = repo.latestReleaseDate;
      }
      void position;
    }
  });

  const merged = [...byId.values()];
  const byNumber = (a?: number | null, b?: number | null) => (b ?? 0) - (a ?? 0);

  if (sort === 'new-releases') {
    merged.sort((a, b) => (b.latestReleaseDate ?? '').localeCompare(a.latestReleaseDate ?? ''));
  } else if (sort === 'trending') {
    merged.sort(
      (a, b) => byNumber(a.trendingScore, b.trendingScore) || byNumber(a.downloadCount, b.downloadCount),
    );
  } else if (sort === 'most-popular') {
    merged.sort(
      (a, b) => byNumber(a.popularityScore, b.popularityScore) || byNumber(a.downloadCount, b.downloadCount),
    );
  } else {
    merged.sort((a, b) => byNumber(a.stargazersCount, b.stargazersCount));
  }
  return merged;
}

export function loadView(platform: PlatformSlug, view: string): Repo[] {
  const meta = VIEWS.find((entry) => entry.slug === view) ?? VIEWS[0];
  const platforms = platform === 'all' ? PLATFORMS.map((entry) => entry.slug) : [platform];
  const lists = platforms.map((slug) => readShelf('categories', meta.name, slug));
  return mergeShelves(lists, platforms, meta.slug as SortMode);
}

export function loadTopic(platform: PlatformSlug, topic: string): Repo[] {
  const platforms = platform === 'all' ? PLATFORMS.map((entry) => entry.slug) : [platform];
  const lists = platforms.map((slug) => readShelf('topics', topic, slug));
  return mergeShelves(lists, platforms, 'topic');
}

export function platformTicks(repo: Repo): { slug: string; tick: string; label: string }[] {
  return PLATFORMS.filter((platform) => repo[platform.field] === true).map((platform) => ({
    slug: platform.slug,
    tick: platform.tick,
    label: platform.label,
  }));
}

export function releaseTag(repo: Repo, platform?: string): string | null {
  const releases = repo.platformReleases ?? {};
  const preferred = platform && platform !== 'all' ? releases[platform] : undefined;
  const picked = preferred ?? releases.android ?? releases.windows ?? releases.macos ?? releases.linux;
  return picked?.tag ?? null;
}

export function reposSharingTopics(repo: Repo, limit = 3): Repo[] {
  const topics = new Set((repo.topics ?? []).map((topic) => topic.toLowerCase()));
  if (!topics.size) return [];
  return readIndex()
    .filter((other) => other.id !== repo.id && (other.topics ?? []).some((topic) => topics.has(topic.toLowerCase())))
    .slice(0, limit);
}

export function topicSlugs(): string[] {
  return TOPICS.map((topic) => topic.slug);
}

export interface FreshSelection {
  repos: Repo[];
  windowHours: number;
  total: number;
}

export function freshRepos(preferredHours = 24, limit = 3): FreshSelection {
  const within = (hours: number) =>
    readIndex().filter((repo) => {
      if (!repo.latestReleaseDate) return false;
      const parsed = Date.parse(repo.latestReleaseDate);
      return !Number.isNaN(parsed) && Date.now() - parsed <= hours * 3_600_000;
    });

  let windowHours = preferredHours;
  let candidates = within(windowHours);
  if (candidates.length < limit) {
    windowHours = 48;
    candidates = within(windowHours);
  }
  candidates.sort((a, b) => (b.stargazersCount ?? 0) - (a.stargazersCount ?? 0));
  return { repos: candidates.slice(0, limit), windowHours, total: candidates.length };
}
