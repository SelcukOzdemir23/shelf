# Shelf

An independent catalogue of open-source applications that ship their builds as GitHub releases.
Static Astro site, no runtime API, no accounts.

Live: https://selcukozdemir23.github.io/shelf/

## Stack

- Astro 5 with static output, TypeScript, plain CSS with design tokens
- Self-hosted fonts (Bricolage Grotesque, Instrument Sans, IBM Plex Mono)
- No client framework. Client JavaScript is limited to the search page and Astro's hover prefetch
- Theme follows the system setting, with a `prefers-contrast: more` variant

## Run locally

```bash
npm install
npm run data     # fetch the shelves into src/data (needs network)
npm run dev      # http://localhost:4321/shelf/
```

```bash
npm run build    # static output in dist/
npm run preview
```

## Data

`shelf` reads the public fallback mirror of release metadata:
[komi-store-backend-data](https://github.com/komi-store/komi-store-backend-data).
`npm run data` pulls 32 shelf files at build time, deduplicates by repository id into
`src/data/repos.json`, and writes `public/search-index.json` for client-side search.
Nothing is fetched in the browser.

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`
and every six hours, which is how the shelves stay fresh. Repo settings set automatically;
to change the domain, set the repository variable `SITE_URL` (and `BASE_PATH` if the site
moves off a subpath).

## Licence

Code: MIT (see `LICENSE`). Data: published by the Komi Store project under Apache-2.0,
repository metadata originates from GitHub and the individual projects.

Shelf is not affiliated with, endorsed by, or named after Komi Store. It does not use that
project's branding, and install files always point at the project's own GitHub releases.
