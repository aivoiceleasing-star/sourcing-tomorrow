export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';

export const GET: APIRoute = async ({ url }) => {
  try {
    const sql = getDb();
    const section = url.searchParams.get('section');
    const rows = section
      ? await sql`SELECT * FROM site_settings WHERE section = ${section} ORDER BY sort_order, key`
      : await sql`SELECT * FROM site_settings ORDER BY section, sort_order, key`;
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[API /site-settings] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      for (const item of body) {
        if (!item.key || typeof item.key !== 'string') {
          return new Response(JSON.stringify({ error: 'Each item must have a valid key' }), {
            status: 400, headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } else {
      if (!body.key || typeof body.key !== 'string') {
        return new Response(JSON.stringify({ error: 'Key is required' }), {
          status: 400, headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const sql = getDb();

    if (Array.isArray(body)) {
      for (const item of body) {
        await sql`
          UPDATE site_settings SET value = ${item.value}, updated_at = NOW()
          WHERE key = ${item.key}
        `;
      }
    } else {
      await sql`
        UPDATE site_settings SET value = ${body.value}, updated_at = NOW()
        WHERE key = ${body.key}
      `;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[API /site-settings] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    if (!body.key || typeof body.key !== 'string') {
      return new Response(JSON.stringify({ error: 'Key is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    const sql = getDb();
    const rows = await sql`
      INSERT INTO site_settings (key, value, value_type, label, section, sort_order)
      VALUES (${body.key}, ${body.value || ''}, ${body.value_type || 'text'},
              ${body.label || ''}, ${body.section || 'general'}, ${body.sort_order || 0})
      ON CONFLICT (key) DO UPDATE SET value = ${body.value || ''}, updated_at = NOW()
      RETURNING id
    `;
    return new Response(JSON.stringify({ id: rows[0].id }), {
      status: 201, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[API /site-settings] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
