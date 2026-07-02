# Sourcing Tomorrow

Procurement professional community and news site. Astro 5 + Neon Postgres + Vercel + Tailwind 4 + React.
Live at: https://www.sourcingtomorrow.com (root domain DNS pending — A record at HostGator still points to old IP)

> **Stack gotchas** (Neon driver, HMAC auth, Vercel deploy, static rebuild, Astro SSR) live in `~/.claude/projects/-Users-claudiotartaglia/memory/shared-stack-gotchas.md`. Project-specific overrides below.

## Environment Variables

Required (in `.env` at project root):
- `DATABASE_URL` — Neon Postgres connection string (pooled)
- `DATABASE_URL_UNPOOLED` — Neon raw connection (for migrations only)
- `ADMIN_PASSWORD` — Admin panel login
- `VERCEL_DEPLOY_HOOK` — URL to trigger Vercel rebuild from admin panel
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob store token (image uploads)

Optional:
- `API_SECRET_KEY` — For programmatic API access (n8n integration, checked via `X-API-Key` header)
- `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID` — Not yet integrated, future CMS alternative

## Deployment (project-specific overrides)

- **Vercel Project ID**: `prj_4PK94g1IDoC5IjVeyU8k4sC8V3mA`
- Admin "Rebuild Site" calls `POST /api/rebuild` → `VERCEL_DEPLOY_HOOK` env var

## Data Layer

Three-tier fallback in `src/lib/queries.ts`:
1. **Neon Postgres** (primary) — all typed query functions
2. **Airtable** (secondary, not yet set up)
3. **Mock data** (`src/data/mock.ts`) — hardcoded fallback

## Public exceptions (auth middleware)

- `/api/contact`
- `/api/newsletter`

## Database Schema (6 tables)

`categories`, `articles`, `resources`, `contacts`, `newsletter_subscribers`, `site_settings`

- Articles have FAQ field (JSONB) for JSON-LD schema / AEO
- Site settings are key-value pairs for hero text, CTA, etc.

## Scripts

| Script | Usage | Notes |
|--------|-------|-------|
| `migrate.mjs` | `npm run migrate` | Executes schema.sql on Neon (uses DATABASE_URL_UNPOOLED) |
| `seed.mjs` | `npm run seed` | Insert dev data |

## Admin Panel

- **Dashboard**: Stats cards + Recharts visualizations + "Rebuild Site" button
- **CRUD**: Articles, Resources, Categories, Contacts (read-only), Subscribers (read-only), Site Settings
- **Image upload**: `POST /api/upload` to Vercel Blob (requires BLOB_READ_WRITE_TOKEN)

## Known Issues (project-specific)

- **Root domain DNS**: `sourcingtomorrow.com` A record at HostGator still points to 66.235.200.171 (old IP). Needs to be changed to 76.76.21.21 (Vercel). `www` subdomain works.
- **Vercel Blob orphaned stores**: 5 failed CLI attempts created orphaned blob stores counting toward the 5-store Hobby plan limit. Delete in Vercel dashboard before creating a fresh one.
- **Async/await pitfall**: If making a sync function async in queries.ts, grep ALL call sites for missing `await` — Astro silently passes Promises instead of data.

## Content Categories

Strategic Sourcing, Digital Transformation, Risk Management, Sustainability, Supplier Relationships, Industry News

## GA4

Tracking ID: G-T43GMSNJWK
