/**
 * Database Backup — exports all public schema tables to scripts/db-backup.json.
 * Dynamically discovers tables so new ones are captured automatically.
 *
 * Usage: node scripts/backup.mjs
 * Requires DATABASE_URL (or POSTGRES_URL / POSTGRES_DATABASE_URL) in .env or environment.
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });
config({ path: join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: No database URL found. Set DATABASE_URL, POSTGRES_URL, or POSTGRES_DATABASE_URL.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function backup() {
  console.log('[backup] Discovering tables...');
  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' ORDER BY tablename
  `;

  console.log(`[backup] Found ${tables.length} tables.\n`);

  const dump = { exported_at: new Date().toISOString(), tables: {} };

  for (const { tablename } of tables) {
    const rows = await sql.query(`SELECT * FROM "${tablename}"`);
    dump.tables[tablename] = rows;
    console.log(`  ${tablename}: ${rows.length} rows`);
  }

  const outPath = join(__dirname, 'db-backup.json');
  writeFileSync(outPath, JSON.stringify(dump, null, 2));
  const total = Object.values(dump.tables).reduce((s, r) => s + r.length, 0);
  console.log(`\n[backup] Saved ${total} rows across ${tables.length} tables to scripts/db-backup.json`);
}

backup().catch(err => { console.error('[backup] Error:', err.message); process.exit(1); });
