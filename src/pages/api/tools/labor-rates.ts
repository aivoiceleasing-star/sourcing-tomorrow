export const prerender = false;

import type { APIRoute } from 'astro';

const GSA_BASE = 'https://api.gsa.gov/acquisition/calc/v3/api/ceilingrates/';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);

    const gsaUrl = `${GSA_BASE}?${params.toString()}`;
    const res = await fetch(gsaUrl);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return new Response(JSON.stringify({ error: `GSA API returned ${res.status}`, details: text }), {
        status: 502,
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
