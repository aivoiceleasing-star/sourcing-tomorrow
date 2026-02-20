export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  const DEPLOY_HOOK = import.meta.env.VERCEL_DEPLOY_HOOK || process.env.VERCEL_DEPLOY_HOOK;
  if (!DEPLOY_HOOK) {
    return new Response(JSON.stringify({ error: 'VERCEL_DEPLOY_HOOK not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(DEPLOY_HOOK, { method: 'POST' });
    if (!res.ok) throw new Error(`Vercel responded ${res.status}`);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
