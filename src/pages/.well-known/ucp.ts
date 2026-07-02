/**
 * /.well-known/ucp — agent discovery manifest.
 *
 * Modeled on the emerging Universal Commerce Protocol convention for letting AI
 * assistants discover and navigate a site without screen-scraping. Adapted for
 * an editorial site: the "catalog" is published articles and resources; the live
 * surfaces are newsletter signup and contact (no checkout).
 */
import type { APIRoute } from 'astro';
import { getCategories, getArticles } from '../../lib/airtable';

const SITE = 'https://www.sourcingtomorrow.com';

export const prerender = true;

export const GET: APIRoute = async () => {
  const [categories, articles] = await Promise.all([getCategories(), getArticles()]);

  const manifest = {
    ucp_version: '0.1-draft',
    organization: {
      name: 'SourcingTomorrow',
      url: SITE,
      legal_entity: 'SourcingTomorrow',
      country: 'US',
      currency: 'USD',
      languages: ['en'],
      business_type: 'editorial_publisher',
      role: 'procurement_news_and_intelligence',
      description:
        'Procurement insights, strategic sourcing news, and supply chain intelligence for professionals.',
      topics: categories.map((c) => c.name),
      article_count: articles.length,
    },
    capabilities: {
      // Read-only — live today
      article_browse: true,
      article_search: false,
      category_lookup: true,
      resource_download: true,
      tools_access: true, // /tools — labor rates, federal spending, opportunities
      faq_lookup: true, // articles carry FAQ JSON-LD where applicable
      // Transactional
      newsletter_signup: true, // /newsletter
      contact_inquiry: true, // /contact
      online_payment: false,
      account_management: false,
    },
    endpoints: {
      // Discovery
      sitemap: `${SITE}/sitemap-index.xml`,
      agent_sitemap: `${SITE}/sitemap-agentic-discovery.xml`,
      llms_txt: `${SITE}/llms.txt`,
      llms_full: `${SITE}/llms-full.txt`,
      agents_md: `${SITE}/agents.md`,
      // Read-only (live today)
      articles_index: `${SITE}/articles`,
      article_template: `${SITE}/articles/{slug}`,
      category_template: `${SITE}/categories/{slug}`,
      resources_index: `${SITE}/resources`,
      tools_index: `${SITE}/tools`,
      // Transactional (live today)
      newsletter: `${SITE}/newsletter`,
      contact: `${SITE}/contact`,
    },
    ai_usage_policy: {
      ai_search: 'allowed',
      ai_citation: 'allowed',
      ai_retrieval_rag: 'allowed',
      ai_training: 'not_allowed',
      statement:
        'Content is published for AI search, citation, and retrieval (RAG). It is NOT a training corpus — honor Content-Signal ai-train=no and cite the source article URL.',
    },
    crawler_policy: {
      allow: [
        'GPTBot',
        'OAI-SearchBot',
        'ChatGPT-User',
        'ClaudeBot',
        'PerplexityBot',
        'Google-Extended',
        'CCBot',
        'Applebot-Extended',
      ],
      content_signal: 'search=yes, ai-input=yes, ai-train=no',
      see_robots_txt: `${SITE}/robots.txt`,
    },
    contact: {
      agent_integration: `${SITE}/contact`,
    },
    updated_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
