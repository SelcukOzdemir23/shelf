// Pulls the shelves the KMP app reads as its offline fallback and freezes them
// for a static build. Runs in CI, where CORS does not apply.
//
//   https://raw.githubusercontent.com/komi-store/komi-store-backend-data/main/cached-data/...
//
// Output: src/data/ (gitignored, build input) and public/search-index.json.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MIRROR =
  'https://raw.githubusercontent.com/komi-store/komi-store-backend-data/main/cached-data';
const USER_AGENT = 'shelf-static-build/0.1 (+https://github.com/SelcukOzdemir23/shelf)';
const PLATFORMS = ['android', 'windows', 'macos', 'linux'];
const CATEGORIES = ['trending', 'new-releases', 'most-popular'];
const TOPICS = ['privacy', 'media', 'productivity', 'networking', 'dev-tools'];

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const PUBLIC = path.join(ROOT, 'public');

async function fetchJson(url, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  return null;
}

async function writeJson(target, value) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(value));
}

const index = new Map();
let shelfCount = 0;
let requestCount = 0;

async function pull(localKind, localName, remotePath, platform) {
  // The mirror keeps categories at the root and topics under topics/, which is
  // why the remote path is passed in separately from the local folder name.
  const url = `${MIRROR}/${remotePath}/${platform}.json`;
  requestCount += 1;
  const payload = await fetchJson(url);
  const repos = Array.isArray(payload?.repositories) ? payload.repositories : [];
  if (!repos.length) {
    console.warn(`empty shelf ${kind}/${name}/${platform}`);
    return;
  }
  shelfCount += 1;
  await writeJson(path.join(DATA, localKind, localName, `${platform}.json`), {
    lastUpdated: payload.lastUpdated ?? null,
    repositories: repos,
  });
  for (const repo of repos) {
    if (!repo?.id) continue;
    if (!index.has(repo.id)) index.set(repo.id, { ...repo, shelves: [] });
  }
}

for (const category of CATEGORIES) {
  for (const platform of PLATFORMS) {
    console.log(`pull ${category}/${platform}`);
    await pull('categories', category, category, platform);
  }
}
for (const topic of TOPICS) {
  for (const platform of PLATFORMS) {
    console.log(`pull topics/${topic}/${platform}`);
    await pull('topics', topic, `topics/${topic}`, platform);
  }
}

if (shelfCount === 0) {
  console.error(`no shelf could be fetched (${requestCount} requests)`);
  process.exit(1);
}

const repos = [...index.values()].sort((a, b) => b.stargazersCount - a.stargazersCount);
await writeJson(path.join(DATA, 'repos.json'), repos);
await writeJson(path.join(DATA, 'build.json'), {
  builtAt: new Date().toISOString(),
  mirrors: shelfCount,
  requests: requestCount,
  repos: repos.length,
});

const searchable = repos.map((repo) => ({
  n: repo.name,
  f: repo.fullName,
  d: repo.description ?? '',
  l: repo.language ?? '',
  t: (repo.topics ?? []).slice(0, 6),
  s: repo.stargazersCount ?? 0,
  dl: repo.downloadCount ?? 0,
  r: repo.latestReleaseDate ?? '',
  p: [
    repo.hasInstallersAndroid ? 'a' : '',
    repo.hasInstallersWindows ? 'w' : '',
    repo.hasInstallersMacos ? 'm' : '',
    repo.hasInstallersLinux ? 'l' : '',
  ].join(''),
}));
await writeJson(path.join(PUBLIC, 'search-index.json'), searchable);

console.log(`done: ${shelfCount} shelves, ${repos.length} repos, ${requestCount} requests`);
