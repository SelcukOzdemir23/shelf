import type { APIRoute } from 'astro';
import { link } from '../lib/site';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL(link('sitemap-index.xml'), site ?? 'https://example.com').href;
  const body = ['User-agent: *', 'Allow: /', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
