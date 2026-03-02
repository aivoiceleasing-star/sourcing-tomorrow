export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const sql = getDb();

    const [articles] = await sql`SELECT count(*) as count FROM articles`;
    const [publishedArticles] = await sql`SELECT count(*) as count FROM articles WHERE status = 'published'`;
    const [resources] = await sql`SELECT count(*) as count FROM resources`;
    const [categoryCount] = await sql`SELECT count(*) as count FROM categories`;
    const [contacts] = await sql`SELECT count(*) as count FROM contacts`;
    const [newContacts] = await sql`SELECT count(*) as count FROM contacts WHERE status = 'new'`;
    const [subscribers] = await sql`SELECT count(*) as count FROM newsletter_subscribers WHERE status = 'active'`;

    const recentContacts = await sql`SELECT id, name, email, subject, status, created_at FROM contacts ORDER BY created_at DESC LIMIT 5`;

    const articlesByCategory = await sql`SELECT category, count(*) as count FROM articles WHERE status = 'published' GROUP BY category ORDER BY count DESC`;

    const articlesByStatus = await sql`SELECT status, count(*) as count FROM articles GROUP BY status ORDER BY count DESC`;

    const articlesByMonth = await sql`
      SELECT
        to_char(date_trunc('month', publish_date), 'Mon') as month,
        to_char(date_trunc('month', publish_date), 'YYYY-MM') as sort_key,
        count(*) as count
      FROM articles
      WHERE publish_date >= date_trunc('month', now()) - interval '5 months'
      GROUP BY date_trunc('month', publish_date)
      ORDER BY sort_key ASC
    `;

    const subscribersByMonth = await sql`
      SELECT
        to_char(date_trunc('month', subscribed_at), 'Mon') as month,
        to_char(date_trunc('month', subscribed_at), 'YYYY-MM') as sort_key,
        count(*) as count
      FROM newsletter_subscribers
      WHERE subscribed_at >= date_trunc('month', now()) - interval '5 months'
      GROUP BY date_trunc('month', subscribed_at)
      ORDER BY sort_key ASC
    `;

    return new Response(JSON.stringify({
      articleCount: Number(articles.count),
      publishedArticleCount: Number(publishedArticles.count),
      resourceCount: Number(resources.count),
      categoryCount: Number(categoryCount.count),
      contactCount: Number(contacts.count),
      newContactCount: Number(newContacts.count),
      subscriberCount: Number(subscribers.count),
      recentContacts,
      articlesByCategory: articlesByCategory.map((r: any) => ({ name: r.category, value: Number(r.count) })),
      articlesByStatus: articlesByStatus.map((r: any) => ({ name: r.status, value: Number(r.count) })),
      articlesByMonth: articlesByMonth.map((r: any) => ({ month: r.month, articles: Number(r.count) })),
      subscribersByMonth: subscribersByMonth.map((r: any) => ({ month: r.month, subscribers: Number(r.count) })),
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[API /stats] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
