/**
 * Seed default site_settings rows.
 * Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING.
 *
 * Usage: node scripts/seed-settings.mjs
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const defaults = [
  // Hero section
  { key: 'hero_title', value: 'The Future of Procurement, Today', value_type: 'text', label: 'Hero Title', section: 'hero', sort_order: 1 },
  { key: 'hero_subtitle', value: 'Insights, tools, and community for procurement professionals', value_type: 'text', label: 'Hero Subtitle', section: 'hero', sort_order: 2 },
  { key: 'hero_image', value: '', value_type: 'image', label: 'Hero Background Image', section: 'hero', sort_order: 3 },
  { key: 'hero_overlay_opacity', value: '0.6', value_type: 'text', label: 'Hero Overlay Opacity (0-1)', section: 'hero', sort_order: 4 },
  { key: 'hero_show_newsletter', value: 'true', value_type: 'text', label: 'Show Newsletter Signup (true/false)', section: 'hero', sort_order: 5 },

  // About page
  { key: 'about_title', value: 'About SourcingTomorrow', value_type: 'text', label: 'About Page Title', section: 'about', sort_order: 1 },
  { key: 'about_content', value: '', value_type: 'html', label: 'About Page Content', section: 'about', sort_order: 2 },

  // General / Branding
  { key: 'site_tagline', value: 'Procurement insights, strategic sourcing news, and supply chain intelligence', value_type: 'text', label: 'Site Tagline', section: 'general', sort_order: 1 },
  { key: 'footer_text', value: '© 2026 SourcingTomorrow. All rights reserved.', value_type: 'text', label: 'Footer Copyright Text', section: 'general', sort_order: 2 },

  // Newsletter CTA section
  { key: 'cta_title', value: 'Stay Ahead of the Curve', value_type: 'text', label: 'CTA Section Title', section: 'cta', sort_order: 1 },
  { key: 'cta_subtitle', value: 'Join procurement professionals who get curated insights, expert analysis, and actionable strategies delivered weekly.', value_type: 'textarea', label: 'CTA Section Subtitle', section: 'cta', sort_order: 2 },
];

console.log('[seed] Inserting default site settings...');

let inserted = 0;
for (const row of defaults) {
  const result = await sql`
    INSERT INTO site_settings (key, value, value_type, label, section, sort_order)
    VALUES (${row.key}, ${row.value}, ${row.value_type}, ${row.label}, ${row.section}, ${row.sort_order})
    ON CONFLICT (key) DO NOTHING
    RETURNING id
  `;
  if (result.length > 0) inserted++;
}

console.log(`[seed] Done. ${inserted} new settings inserted, ${defaults.length - inserted} already existed.`);
