/**
 * Neon Postgres connection utility.
 * Uses @neondatabase/serverless for Vercel edge/serverless compatibility.
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

export const isDbConfigured = !!DATABASE_URL;

export function getDb() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(DATABASE_URL);
}
