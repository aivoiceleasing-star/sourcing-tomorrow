export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM categories ORDER BY name`;
    return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const sql = getDb();
    const rows = await sql`
      INSERT INTO categories (name, slug, description)
      VALUES (${body.name}, ${body.slug}, ${body.description || ''})
      RETURNING id
    `;
    return new Response(JSON.stringify({ id: rows[0].id }), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
