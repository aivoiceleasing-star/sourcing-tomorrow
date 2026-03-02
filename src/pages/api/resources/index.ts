export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM resources ORDER BY publish_date DESC NULLS LAST`;
    return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[API /resources] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    if (!body.title || typeof body.title !== 'string' || !body.slug || typeof body.slug !== 'string') {
      return new Response(JSON.stringify({ error: 'Title and slug are required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    const sql = getDb();
    const rows = await sql`
      INSERT INTO resources (title, slug, description, category, cover_image, download_url, publish_date, status)
      VALUES (${body.title}, ${body.slug}, ${body.description || ''}, ${body.category || ''}, ${body.cover_image || ''}, ${body.download_url || '#'}, ${body.publish_date || null}, ${body.status || 'draft'})
      RETURNING id
    `;
    return new Response(JSON.stringify({ id: rows[0].id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[API /resources] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
