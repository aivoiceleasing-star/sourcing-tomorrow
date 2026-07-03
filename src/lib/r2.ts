/**
 * R2 storage helper — drop-in replacement for the bits of `@vercel/blob` we use.
 *
 * Public files (images) go in the shared public bucket and are served directly
 * from R2_PUBLIC_URL_BASE. Private files (documents like RFP responses) go in a
 * separate private bucket and are streamed back through our own /api/download
 * proxy (never exposed publicly). Keys are namespaced by R2_KEY_PREFIX so many
 * sites can share the same buckets without collisions.
 *
 * Mirrors medical-supplies-for-home/src/lib/r2-upload.ts (same S3Client shape).
 */
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const env = (k: string): string | undefined =>
  (typeof process !== 'undefined' && process.env?.[k]) || (import.meta.env as any)?.[k];

const ACCOUNT_ID = env('R2_ACCOUNT_ID');
const ACCESS_KEY = env('R2_ACCESS_KEY_ID');
const SECRET_KEY = env('R2_SECRET_ACCESS_KEY');
const PUBLIC_BUCKET = env('R2_BUCKET');                 // portfolio-media (public)
const PRIVATE_BUCKET = env('R2_PRIVATE_BUCKET');        // portfolio-private (no public URL)
const PUBLIC_BASE = env('R2_PUBLIC_URL_BASE');          // https://pub-xxx.r2.dev
const PREFIX = (env('R2_KEY_PREFIX') || '').replace(/^\/+|\/+$/g, ''); // e.g. "procurement-hub"

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
      throw new Error('R2 credentials missing (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).');
    }
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    });
  }
  return client;
}

function prefixed(pathname: string): string {
  const p = pathname.replace(/^\/+/, '');
  return PREFIX ? `${PREFIX}/${p}` : p;
}

async function toBuffer(body: File | Blob | Buffer | Uint8Array | ArrayBuffer): Promise<Buffer> {
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);
  if (body instanceof ArrayBuffer) return Buffer.from(body);
  if (typeof (body as Blob).arrayBuffer === 'function') return Buffer.from(await (body as Blob).arrayBuffer());
  return Buffer.from(body as any);
}

export interface PutOptions {
  access?: 'public' | 'private';
  contentType?: string;
  addRandomSuffix?: boolean;
}
export interface PutResult { url: string; pathname: string; key: string }

/**
 * Upload a file. For public access, `url` is the direct public R2 URL.
 * For private access, `url` is the object key (resolve/stream it via getObjectStream).
 */
export async function put(pathname: string, body: File | Blob | Buffer | Uint8Array | ArrayBuffer, opts: PutOptions = {}): Promise<PutResult> {
  const access = opts.access || 'public';
  const bucket = access === 'private' ? PRIVATE_BUCKET : PUBLIC_BUCKET;
  if (!bucket) throw new Error(`R2 ${access} bucket not configured (${access === 'private' ? 'R2_PRIVATE_BUCKET' : 'R2_BUCKET'}).`);
  const key = prefixed(pathname);
  const buf = await toBuffer(body);
  const contentType = opts.contentType || (body as File).type || 'application/octet-stream';
  await getClient().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buf, ContentType: contentType }));
  const url = access === 'private' ? key : `${(PUBLIC_BASE || '').replace(/\/+$/, '')}/${key}`;
  return { url, pathname: key, key };
}

/** Fetch a private object for the /api/download proxy. Accepts a bare key or full public URL. */
export async function getObject(keyOrUrl: string): Promise<{ body: any; contentType: string; contentLength?: number }> {
  const key = keyOrUrl.startsWith('http') ? new URL(keyOrUrl).pathname.replace(/^\/+/, '') : keyOrUrl.replace(/^\/+/, '');
  const res = await getClient().send(new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }));
  return { body: res.Body, contentType: res.ContentType || 'application/octet-stream', contentLength: res.ContentLength };
}

export async function del(keyOrUrl: string, access: 'public' | 'private' = 'private'): Promise<void> {
  const bucket = access === 'private' ? PRIVATE_BUCKET : PUBLIC_BUCKET;
  const key = keyOrUrl.startsWith('http') ? new URL(keyOrUrl).pathname.replace(/^\/+/, '') : keyOrUrl.replace(/^\/+/, '');
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
