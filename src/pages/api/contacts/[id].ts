export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

const ALLOWED_STATUSES = ['new', 'read', 'replied', 'archived'];

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    if (!body.status || !ALLOWED_STATUSES.includes(body.status)) {
      return new Response(JSON.stringify({ error: 'Invalid status value' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    const sql = getDb();
    await sql`UPDATE contacts SET status = ${body.status}, updated_at = NOW() WHERE id = ${params.id}`;
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[API /contacts/:id] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const sql = getDb();
    await sql`DELETE FROM contacts WHERE id = ${params.id}`;
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('[API /contacts/:id] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
