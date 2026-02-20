export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM articles ORDER BY publish_date DESC NULLS LAST`;
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const sql = getDb();
    const rows = await sql`
      INSERT INTO articles (title, slug, excerpt, content, category, category_slug, featured_image, meta_description, publish_date, author, featured, tags, read_time, faq, status)
      VALUES (${body.title}, ${body.slug}, ${body.excerpt || ''}, ${body.content || ''}, ${body.category || ''}, ${body.category_slug || ''}, ${body.featured_image || ''}, ${body.meta_description || ''}, ${body.publish_date || null}, ${body.author || 'SourcingTomorrow'}, ${body.featured || false}, ${body.tags || []}, ${body.read_time || 5}, ${JSON.stringify(body.faq || [])}::jsonb, ${body.status || 'draft'})
      RETURNING id
    `;
    return new Response(JSON.stringify({ id: rows[0].id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
