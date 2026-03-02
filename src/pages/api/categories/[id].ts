export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    if (!body.name || typeof body.name !== 'string' || !body.slug || typeof body.slug !== 'string') {
      return new Response(JSON.stringify({ error: 'Name and slug are required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    const sql = getDb();
    await sql`
      UPDATE categories SET name = ${body.name}, slug = ${body.slug}, description = ${body.description || ''}, updated_at = NOW()
      WHERE id = ${params.id}
    `;
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[API /categories/:id] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const sql = getDb();
    await sql`DELETE FROM categories WHERE id = ${params.id}`;
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[API /categories/:id] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
