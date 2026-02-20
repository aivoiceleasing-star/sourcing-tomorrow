export const prerender = false;

import type { APIRoute } from 'astro';
import { put } from '@vercel/blob';

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const file = form.get('file') as File | null;
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'];
  if (!allowed.includes(ext)) {
    return new Response(JSON.stringify({ error: 'File type not allowed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const pathname = `images/${timestamp}-${safeName}`;

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return new Response(JSON.stringify({ url: blob.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
