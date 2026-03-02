export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    if (!body.title || typeof body.title !== 'string' || !body.slug || typeof body.slug !== 'string') {
      return new Response(JSON.stringify({ error: 'Title and slug are required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    const sql = getDb();
    await sql`
      UPDATE resources SET
        title = ${body.title}, slug = ${body.slug}, description = ${body.description || ''},
        category = ${body.category || ''}, cover_image = ${body.cover_image || ''},
        download_url = ${body.download_url || '#'}, publish_date = ${body.publish_date || null},
        status = ${body.status || 'draft'}, updated_at = NOW()
      WHERE id = ${params.id}
    `;
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[API /resources/:id] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const sql = getDb();
    await sql`DELETE FROM resources WHERE id = ${params.id}`;
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[API /resources/:id] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
