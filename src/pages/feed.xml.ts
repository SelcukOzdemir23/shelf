import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { readIndex } from '../lib/data';
import { clean } from '../lib/format';
import { SITE, link } from '../lib/site';

export const GET: APIRoute = (context) => {
  const site = context.site ?? new URL('https://example.com');
  const repos = readIndex()
    .filter((repo) => repo.latestReleaseDate)
    .sort((a, b) => (b.latestReleaseDate ?? '').localeCompare(a.latestReleaseDate ?? ''))
    .slice(0, 50);

  return rss({
    title: `${SITE.name} new releases`,
    description: 'The newest open-source releases on the shelf, rebuild every six hours.',
    site,
    items: repos.map((repo) => ({
      title: `${repo.name} by ${repo.owner.login}`,
      pubDate: new Date(repo.latestReleaseDate as string),
      link: new URL(link(`app/${repo.owner.login}/${repo.name}/`), site).href,
      description: clean(repo.description) || `A release from ${repo.owner.login}.`,
    })),
    customData: '<language>en</language>',
  });
};
