/**
 * Database migration runner.
 * Reads schema.sql and executes it against Neon Postgres.
 *
 * Usage: node scripts/migrate.mjs
 * Requires DATABASE_URL in .env or environment.
 */

import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config(); // load .env

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Add it to your .env file.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf-8');

console.log('[migrate] Connecting to Neon Postgres...');
console.log('[migrate] Running schema.sql...');

try {
  // Neon serverless doesn't support multiple statements in one call.
  // Strip comments, split on semicolons, execute each statement.
  const stripped = schema.replace(/--.*$/gm, '');
  const statements = stripped
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let count = 0;
  for (const stmt of statements) {
    await sql.query(stmt);
    count++;
  }
  console.log(`[migrate] Schema applied successfully. ${count} statements executed.`);
} catch (err) {
  console.error('[migrate] Error applying schema:', err.message);
  process.exit(1);
}
