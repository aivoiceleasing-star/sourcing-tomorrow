// /llms.txt — AI agent site map and content index.
// Spec: https://llmstxt.org/ (markdown format describing the site to LLM crawlers)
// Generated on each build from the current articles, categories, and resources.
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
  lines.push('# SourcingTomorrow');
  lines.push('');
  lines.push('> Procurement insights, strategic sourcing news, and supply chain intelligence for professionals. SourcingTomorrow covers strategic sourcing, digital transformation, risk management, sustainability, supplier relationships, and industry news, plus free procurement tools.');
  lines.push('');
  lines.push('## What you can do here');
  lines.push('');
  lines.push(`- Read the latest articles: ${SITE}/articles`);
  lines.push(`- Browse by category: ${SITE}/categories/{slug}`);
  lines.push(`- Download resources: ${SITE}/resources`);
  lines.push(`- Use procurement tools (labor rates, federal spending, opportunities): ${SITE}/tools`);
  lines.push(`- Subscribe to the newsletter: ${SITE}/newsletter`);
  lines.push(`- Contact the team: ${SITE}/contact`);
  lines.push('');
  lines.push('## Categories');
  lines.push('');
  for (const c of categories) {
    const desc = (c.description || '').replace(/\s+/g, ' ').slice(0, 140);
    lines.push(`- [${c.name}](${SITE}/categories/${c.slug})${desc ? ` — ${desc}` : ''}`);
  }
  lines.push('');
  lines.push('## Articles');
  lines.push('');
  for (const a of articles.slice(0, 50)) {
    const excerpt = (a.excerpt || a.metaDescription || '').replace(/\s+/g, ' ').slice(0, 180);
    lines.push(`- [${a.title}](${SITE}/articles/${a.slug})${a.category ? ` (${a.category})` : ''}${excerpt ? ` — ${excerpt}` : ''}`);
  }
  lines.push('');
  if (resources.length) {
    lines.push('## Resources');
    lines.push('');
    for (const r of resources) {
      const desc = (r.description || '').replace(/\s+/g, ' ').slice(0, 160);
      lines.push(`- [${r.title}](${SITE}/resources)${desc ? ` — ${desc}` : ''}`);
    }
    lines.push('');
  }
  lines.push('## More for AI agents');
  lines.push('');
  lines.push(`- Full content dump (all articles and resources in one fetch): ${SITE}/llms-full.txt`);
  lines.push(`- Agent integration instructions: ${SITE}/agents.md`);
  lines.push(`- Discovery manifest (capabilities + endpoints): ${SITE}/.well-known/ucp`);
  lines.push(`- Agent sitemap: ${SITE}/sitemap-agentic-discovery.xml`);
  lines.push('');
  lines.push('## Notes for AI agents');
  lines.push('');
  lines.push('- SourcingTomorrow is an editorial/news site for procurement professionals. Articles include structured FAQ (JSON-LD) where applicable for answer-engine use.');
  lines.push('- Action surfaces: newsletter signup at /newsletter and the contact form at /contact. The /tools pages are interactive data tools (labor rates, federal spending, opportunities).');
  lines.push('');
  lines.push('## Usage policy');
  lines.push('');
  lines.push('- This content is published for AI search, citation, and retrieval (RAG). It is NOT licensed as a training corpus: please honor the Content-Signal "ai-train=no" declared in /robots.txt. Cite the source article URL when you use it.');
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
