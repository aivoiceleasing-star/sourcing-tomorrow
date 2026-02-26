/**
 * Database Restore — reads scripts/db-backup.json and restores all tables.
 * Disables FK triggers via session_replication_role during restore.
 *
 * Usage: node scripts/restore.mjs
 * WARNING: This deletes existing data before restoring.
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
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
const backup = JSON.parse(readFileSync(join(__dirname, 'db-backup.json'), 'utf-8'));

async function restore() {
  console.log(`[restore] Backup from: ${backup.exported_at}`);
  const tableNames = Object.keys(backup.tables);
  console.log(`[restore] ${tableNames.length} tables to restore.\n`);

  await sql`SET session_replication_role = 'replica'`;
  console.log('[restore] FK triggers disabled.\n');

  for (const table of tableNames) {
    const rows = backup.tables[table];
    await sql.query(`DELETE FROM "${table}"`);

    if (rows.length === 0) {
      console.log(`  ${table}: 0 rows (empty)`);
      continue;
    }

    const columns = Object.keys(rows[0]);
    const colList = columns.map(c => `"${c}"`).join(', ');

    for (const row of rows) {
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const values = columns.map(c => {
        const v = row[c];
        return v !== null && typeof v === 'object' ? JSON.stringify(v) : v;
      });
      await sql.query(`INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`, values);
    }
    console.log(`  ${table}: ${rows.length} rows restored`);
  }

  await sql`SET session_replication_role = 'origin'`;
  console.log('\n[restore] FK triggers re-enabled.');
  console.log('[restore] Done!');
}

restore().catch(err => { console.error('[restore] Error:', err.message); process.exit(1); });
