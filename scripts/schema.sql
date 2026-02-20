-- SourcingTomorrow — Database Schema
-- Neon Postgres on Vercel
-- Run via: node scripts/migrate.mjs

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  excerpt          TEXT DEFAULT '',
  content          TEXT DEFAULT '',
  category         TEXT DEFAULT '',
  category_slug    TEXT DEFAULT '',
  featured_image   TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  publish_date     DATE,
  author           TEXT DEFAULT 'SourcingTomorrow',
  featured         BOOLEAN DEFAULT false,
  tags             TEXT[] DEFAULT '{}',
  read_time        INTEGER DEFAULT 5,
  faq              JSONB DEFAULT '[]',
  status           TEXT DEFAULT 'draft'
                   CHECK (status IN ('draft', 'review', 'published', 'archived')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT DEFAULT '',
  category     TEXT DEFAULT '',
  cover_image  TEXT DEFAULT '',
  download_url TEXT DEFAULT '#',
  publish_date DATE,
  status       TEXT DEFAULT 'draft'
               CHECK (status IN ('draft', 'published', 'archived')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT DEFAULT '',
  message    TEXT DEFAULT '',
  status     TEXT DEFAULT 'new'
             CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  status        TEXT DEFAULT 'active'
                CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);
