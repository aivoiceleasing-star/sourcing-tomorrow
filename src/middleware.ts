import { defineMiddleware, sequence } from 'astro:middleware';
import { clerkMiddleware } from '@clerk/astro/server';
import { timingSafeEqual } from 'node:crypto';
import { verifySessionToken, COOKIE_NAME } from './lib/auth';

function verifyApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key');
  const secret = import.meta.env.API_SECRET_KEY || process.env.API_SECRET_KEY;
  if (!apiKey || !secret || apiKey.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(apiKey), Buffer.from(secret));
}

const adminMiddleware = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isProtected =
    (pathname.startsWith('/admin') && pathname !== '/admin/login') ||
    (pathname.startsWith('/api/') && pathname !== '/api/contact' && pathname !== '/api/newsletter');

  if (!isProtected) return next();

  // API key auth (for n8n programmatic access)
  if (pathname.startsWith('/api/') && verifyApiKey(context.request)) {
    return next();
  }

  // Cookie auth (for admin panel browser access)
  const token = context.cookies.get(COOKIE_NAME)?.value;

  if (!token || !verifySessionToken(token)) {
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login');
  }

  return next();
});

export const onRequest = sequence(clerkMiddleware(), adminMiddleware);
