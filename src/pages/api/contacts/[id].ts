export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = await request.json();
    const sql = getDb();
    await sql`UPDATE contacts SET status = ${body.status}, updated_at = NOW() WHERE id = ${params.id}`;
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const sql = getDb();
    await sql`DELETE FROM contacts WHERE id = ${params.id}`;
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
