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
      UPDATE articles SET
        title = ${body.title},
        slug = ${body.slug},
        excerpt = ${body.excerpt || ''},
        content = ${body.content || ''},
        category = ${body.category || ''},
        category_slug = ${body.category_slug || ''},
        featured_image = ${body.featured_image || ''},
        meta_description = ${body.meta_description || ''},
        publish_date = ${body.publish_date || null},
        author = ${body.author || 'SourcingTomorrow'},
        featured = ${body.featured || false},
        tags = ${body.tags || []},
        read_time = ${body.read_time || 5},
        faq = ${JSON.stringify(body.faq || [])}::jsonb,
        status = ${body.status || 'draft'},
        updated_at = NOW()
      WHERE id = ${params.id}
    `;
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[API /articles/:id] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const sql = getDb();
    await sql`DELETE FROM articles WHERE id = ${params.id}`;
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[API /articles/:id] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
