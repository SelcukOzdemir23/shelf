import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Project pages live under /shelf/ on selcukozdemir23.github.io. A custom domain
// or a <user>.github.io repo sets SITE_URL / BASE_PATH in the workflow instead.
const site = process.env.SITE_URL || 'https://selcukozdemir23.github.io';
const base = process.env.BASE_PATH ?? '/shelf';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
