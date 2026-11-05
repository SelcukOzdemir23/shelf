import type { Repo } from './data';
import { link } from './site';

export function itemListJsonLd(repos: Repo[], name: string, site: URL | undefined) {
  const origin = site ?? new URL('https://example.com');
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: repos.length,
    itemListElement: repos.slice(0, 20).map((repo, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: new URL(link(`app/${repo.owner.login}/${repo.name}/`), origin).href,
      name: repo.name,
    })),
  };
}

export function breadcrumbJsonLd(repo: Repo, site: URL | undefined) {
  const origin = site ?? new URL('https://example.com');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Shelves',
        item: new URL(link(''), origin).href,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: repo.name,
        item: new URL(link(`app/${repo.owner.login}/${repo.name}/`), origin).href,
      },
    ],
  };
}
