export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    const samKey = (import.meta.env.SAM_GOV_API_KEY || process.env.SAM_GOV_API_KEY || '').replace(/"/g, '').trim();

    if (!samKey) {
      return new Response(JSON.stringify({ error: 'SAM_GOV_API_KEY not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);
    params.set('api_key', samKey);

    const samUrl = `https://api.sam.gov/opportunities/v2/search?${params.toString()}`;
    const res = await fetch(samUrl);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return new Response(JSON.stringify({ error: `SAM.gov returned ${res.status}`, details: text }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack?.split('\n').slice(0, 3) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
