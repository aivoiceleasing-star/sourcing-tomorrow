import { defineMiddleware } from 'astro:middleware';
import { verifySessionToken, COOKIE_NAME } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isProtected =
    (pathname.startsWith('/admin') && pathname !== '/admin/login') ||
    (pathname.startsWith('/api/') && pathname !== '/api/contact' && pathname !== '/api/newsletter');

  if (!isProtected) return next();

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
