/**
 * Postgres connection utility.
 * postgres.js drop-in for the old @neondatabase/serverless `neon()` client —
 * runs against Neon OR a self-hosted box Postgres by flipping DATABASE_URL.
 * SSL auto-enabled for Neon, disabled for the plain box Postgres. Timestamp
 * OIDs forced to raw strings to match Neon's output.
 */

import postgres from 'postgres';

const DATABASE_URL = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

export const isDbConfigured = !!DATABASE_URL;

const TS_OIDS = [1082, 1083, 1114, 1184]; // date, time, timestamp, timestamptz
const NEEDS_SSL = /sslmode=require|\.neon\.tech/.test(DATABASE_URL || '');

let _sql: any = null;
export function getDb() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!_sql) {
    const pg = postgres(DATABASE_URL, {
      prepare: false,
      ssl: NEEDS_SSL ? 'require' : false,
      types: {
        datestr: {
          to: 0,
          from: TS_OIDS,
          serialize: (v: unknown) => v as string,
          parse: (v: string) => v,
        },
      },
    });
    (pg as any).query = (text: string, params: unknown[] = []) => pg.unsafe(text, params as any[]);
    _sql = pg;
  }
  return _sql;
}
