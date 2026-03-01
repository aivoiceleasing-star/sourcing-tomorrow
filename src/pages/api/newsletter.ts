export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb, isDbConfigured } from '../../lib/db';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString() || '';

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let isNewSubscriber = true;

    if (isDbConfigured) {
      const sql = getDb();
      const result = await sql`INSERT INTO newsletter_subscribers (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING RETURNING id`;
      isNewSubscriber = result.length > 0;
    }

    // Send welcome email to new subscribers via Resend
    const resendKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (isNewSubscriber && resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'SourcingTomorrow <hello@sourcingtomorrow.com>',
        to: email,
        subject: 'Welcome to SourcingTomorrow',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #111827; font-size: 24px; margin-bottom: 16px;">Welcome to SourcingTomorrow</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              Thanks for subscribing. You'll receive weekly insights on procurement strategy, sourcing technology, and supply chain intelligence — built for professionals who want to stay ahead.
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              In the meantime, explore our latest articles:
            </p>
            <a href="https://www.sourcingtomorrow.com/articles/" style="display: inline-block; background-color: #15803d; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Browse Articles
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
              SourcingTomorrow — Procurement insights for professionals.
            </p>
          </div>
        `,
      }).catch((err) => {
        console.error('[Newsletter] Welcome email failed:', err);
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
