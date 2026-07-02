// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import clerk from '@clerk/astro';

export default defineConfig({
  site: 'https://www.sourcingtomorrow.com',
  output: 'static',
  redirects: {
    '/about-us': '/about',
    '/about-us/': '/about',
    '/career-development': '/articles/procurement-manager-career-advancement-skills-2026',
    '/career-development/': '/articles/procurement-manager-career-advancement-skills-2026',
  },
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    clerk(),
    sitemap({
      filter: (page) => !page.includes('/admin/'),
    }),
  ],
  security: {
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
