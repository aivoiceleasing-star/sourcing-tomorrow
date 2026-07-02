// /llms-full.txt — full-content dump for AI agents in a single fetch.
// Expands all articles (title, category, excerpt) and resources.
export const prerender = true;

import type { APIRoute } from 'astro';
import { getArticles, getCategories, getResources } from '../lib/airtable';

const SITE = 'https://www.sourcingtomorrow.com';

export const GET: APIRoute = async () => {
  const [articles, categories, resources] = await Promise.all([
    getArticles(),
    getCategories(),
    getResources(),
  ]);

  const lines: string[] = [];
  lines.push('# SourcingTomorrow — Full Content Index');
  lines.push('');
  lines.push('> Procurement insights, strategic sourcing news, and supply chain intelligence for professionals.');
  lines.push('');
  lines.push(`Website: ${SITE}`);
  lines.push(`Newsletter: ${SITE}/newsletter`);
  lines.push(`Contact: ${SITE}/contact`);
  lines.push('');
  lines.push('## Categories');
  lines.push('');
  for (const c of categories) {
    lines.push(`### ${c.name} (${SITE}/categories/${c.slug})`);
    if (c.description) lines.push(c.description);
    lines.push('');
  }
  lines.push('## Articles');
  lines.push('');
  for (const a of articles) {
    lines.push(`### ${a.title}`);
    const meta: string[] = [];
    if (a.category) meta.push(`Category: ${a.category}`);
    if (a.author) meta.push(`Author: ${a.author}`);
    if (a.publishDate) meta.push(`Published: ${a.publishDate}`);
    if (meta.length) lines.push(meta.join(' | '));
    const excerpt = (a.excerpt || a.metaDescription || '').replace(/\s+/g, ' ').trim();
    if (excerpt) lines.push(excerpt);
    lines.push(`URL: ${SITE}/articles/${a.slug}`);
    lines.push('');
  }
  if (resources.length) {
    lines.push('## Resources');
    lines.push('');
    for (const r of resources) {
      lines.push(`### ${r.title}`);
      if (r.description) lines.push(r.description.replace(/\s+/g, ' ').trim());
      lines.push(`Available at: ${SITE}/resources`);
      lines.push('');
    }
  }
  lines.push('## Usage policy');
  lines.push('');
  lines.push('This content is published so AI assistants can find, cite, and retrieve (RAG) SourcingTomorrow articles on behalf of users. It is NOT a training corpus — honor the Content-Signal "ai-train=no" declared in /robots.txt, and cite the source article URL when you use it.');
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
