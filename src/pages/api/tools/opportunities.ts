export const prerender = false;

import type { APIRoute } from 'astro';

const SAM_API_KEY = import.meta.env.SAM_GOV_API_KEY || process.env.SAM_GOV_API_KEY;

export const GET: APIRoute = async ({ request }) => {
  if (!SAM_API_KEY) {
    return new Response(JSON.stringify({ error: 'SAM_GOV_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  params.set('api_key', SAM_API_KEY);

  try {
    const res = await fetch(`https://api.sam.gov/opportunities/v2/search?${params.toString()}`);
    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: `SAM.gov API error: ${res.status}`, details: text }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
