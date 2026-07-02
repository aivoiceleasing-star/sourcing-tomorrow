/**
 * /sitemap-agentic-discovery.xml — agent-specific sitemap listing the
 * discovery surfaces AI crawlers (GPTBot, ClaudeBot, PerplexityBot) should
 * pull to stay current on SourcingTomorrow's procurement coverage.
 *
 * Distinct from the main /sitemap-index.xml (product of @astrojs/sitemap,
 * which lists article/category/page URLs for general search crawl). This
 * sitemap points at the agent-facing meta surfaces: llms.txt, llms-full.txt,
 * agents.md, and the discovery manifest.
 */
import type { APIRoute } from 'astro';

const SITE = 'https://www.sourcingtomorrow.com';

export const prerender = true;

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const surfaces = [
    { loc: `${SITE}/agents.md`, changefreq: 'weekly' },
    { loc: `${SITE}/llms.txt`, changefreq: 'daily' },
    { loc: `${SITE}/llms-full.txt`, changefreq: 'daily' },
    { loc: `${SITE}/.well-known/ucp`, changefreq: 'weekly' },
    { loc: `${SITE}/sitemap-index.xml`, changefreq: 'daily' },
  ];

  const entries = surfaces
    .map(
      (s) =>
        `  <url>\n    <loc>${s.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${s.changefreq}</changefreq>\n  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
