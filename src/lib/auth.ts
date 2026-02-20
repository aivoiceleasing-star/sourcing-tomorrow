import { createHmac } from 'node:crypto';

export const COOKIE_NAME = 'admin_session';
export const MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecret(): string {
  const pw = import.meta.env.ADMIN_PASSWORD;
  if (!pw) throw new Error('ADMIN_PASSWORD env var not set');
  return pw;
}

export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const sig = createHmac('sha256', getSecret()).update(timestamp).digest('hex');
  return `${timestamp}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const [timestamp, sig] = token.split('.');
  if (!timestamp || !sig) return false;
  const age = (Date.now() - parseInt(timestamp)) / 1000;
  if (age > MAX_AGE) return false;
  const expected = createHmac('sha256', getSecret()).update(timestamp).digest('hex');
  return sig === expected;
}

export function checkPassword(password: string): boolean {
  return password === import.meta.env.ADMIN_PASSWORD;
}
