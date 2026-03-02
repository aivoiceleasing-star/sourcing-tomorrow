import { defineMiddleware, sequence } from 'astro:middleware';
import { timingSafeEqual } from 'node:crypto';
import { verifySessionToken, COOKIE_NAME } from './lib/auth';

let clerkMw: ReturnType<typeof defineMiddleware> | null = null;
try {
  const clerkKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (clerkKey) {
    const { clerkMiddleware } = await import('@clerk/astro/server');
    const rawClerk = clerkMiddleware();
    // Skip Clerk on admin routes (has its own auth) and API routes to avoid CSRF blocks
    clerkMw = defineMiddleware((context, next) => {
      const { pathname } = context.url;
      if (pathname.startsWith('/admin') || pathname.startsWith('/api/')) {
        return next();
      }
      return rawClerk(context, next);
    });
  }
} catch {
  // Clerk not configured — skip
}

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
    (pathname.startsWith('/api/') && pathname !== '/api/contact' && pathname !== '/api/newsletter' && !pathname.startsWith('/api/tools/'));

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

const passthrough = defineMiddleware((_, next) => next());
export const onRequest = sequence(clerkMw ?? passthrough, adminMiddleware);
