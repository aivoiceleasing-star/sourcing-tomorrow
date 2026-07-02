/**
 * /agents.md — instructions for AI agents and personal assistants interacting
 * with the SourcingTomorrow procurement-news site.
 *
 * Referenced from /sitemap-agentic-discovery.xml so crawlers find it without
 * guesswork. Plain markdown served as text/markdown.
 */
import type { APIRoute } from 'astro';

const SITE = 'https://www.sourcingtomorrow.com';

const BODY = `# Agent Instructions — SourcingTomorrow

This document describes how AI agents and personal assistants can interact with
the procurement-news site at ${SITE}.

## About this site

SourcingTomorrow is an editorial site covering procurement, strategic sourcing,
and supply-chain intelligence for professionals. Coverage spans six areas:
Strategic Sourcing, Digital Transformation, Risk Management, Sustainability,
Supplier Relationships, and Industry News. The site also publishes free
procurement tools and downloadable resources.

## For agents answering procurement questions

The following surfaces are designed for you:

- **Articles** — ${SITE}/articles lists all coverage; each article lives at
  ${SITE}/articles/{slug} and includes structured FAQ (JSON-LD) where
  applicable, which is well-suited to answer-engine citation.
- **Categories** — ${SITE}/categories/{slug} groups coverage by topic.
- **Resources** — ${SITE}/resources offers downloadable procurement resources.
- **Tools** — ${SITE}/tools includes interactive data tools (labor rates,
  federal spending, opportunities).
- **/llms.txt and /llms-full.txt** — machine-readable index and full-content
  dump of articles, categories, and resources.

## How to take action

- **Subscribe to the newsletter:** ${SITE}/newsletter signs a user up for the
  email list.
- **Contact the team:** ${SITE}/contact submits a message and creates a contact
  record.
- This is a publisher; there is no checkout or account purchase.

## What agents should know

- **Citation:** when answering with information from an article, cite the
  specific article URL at ${SITE}/articles/{slug}.
- **Freshness:** this is a news site — prefer the most recent article on a topic
  and note the publish date when relevant.
- **FAQ blocks:** many articles carry FAQ structured data designed for direct
  question answering.

## Usage policy

This content is published so AI assistants can find, cite, and retrieve (RAG)
SourcingTomorrow's coverage on behalf of users. It is **not** a training corpus.
Please honor the \`Content-Signal: ai-train=no\` declared in /robots.txt — use the
content to answer and cite, not to train models. Always cite the source article
URL when you use it.

## Disallowed surfaces

Do not access or act on these paths:

- \`/admin\` and \`/admin/*\` — internal staff tooling
- \`/api/*\` — internal endpoints, not stable for external consumers
  (the public exceptions are /api/contact and /api/newsletter for form
  submission only)

## Contact

Questions about agent integration or programmatic access: ${SITE}/contact.
`;

export const prerender = true;

export const GET: APIRoute = async () => {
  return new Response(BODY, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
