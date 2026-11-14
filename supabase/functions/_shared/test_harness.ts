// Test harness: the environment a Supabase project provides, a throwaway signing key that
// stands in for the project's, real signed user tokens, and fakes for Supabase and Gemini.
// No network and no real keys.
import { SignJWT } from 'npm:jose@6';

export const SUPABASE = 'http://supabase.test';
/** Supabase user ids are UUIDs. */
export const USER = '6f1d2c3b-4a5e-4f60-8a7b-9c0d1e2f3a4b';
export const OTHER_USER = '0a1b2c3d-4e5f-4a6b-8c7d-8e9f0a1b2c3d';

const { privateKey, publicKey } = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const otherPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const jwk = { ...(await crypto.subtle.exportKey('jwk', publicKey)), kid: 'test-key', alg: 'ES256', use: 'sig' };

Deno.env.set('SUPABASE_URL', SUPABASE);
Deno.env.set('SUPABASE_PUBLISHABLE_KEYS', JSON.stringify({ default: 'sb_publishable_test' }));
Deno.env.set('SUPABASE_SECRET_KEYS', JSON.stringify({ default: 'sb_secret_test' }));
Deno.env.set('SUPABASE_JWKS', JSON.stringify({ keys: [jwk] }));
Deno.env.set('GEMINI_API_KEY', 'gemini-test');
Deno.env.set('EXTRACT_DAILY_CAP', '3');

/** A user access token like Supabase Auth issues. `forged` signs with a key the project doesn't have. */
export function token(opts: { sub?: string; expiresIn?: string; forged?: boolean } = {}) {
  return new SignJWT({ role: 'authenticated', email: 's@example.edu' })
    .setProtectedHeader({ alg: 'ES256', kid: 'test-key', typ: 'JWT' })
    .setSubject(opts.sub ?? USER)
    .setAudience('authenticated')
    .setIssuedAt()
    .setExpirationTime(opts.expiresIn ?? '1h')
    .sign(opts.forged ? otherPair.privateKey : privateKey);
}

/** What the fakes saw, and what they answer. */
export const world = {
  usageToday: 0,
  usageInserts: [] as unknown[],
  usageFilters: [] as string[],
  deletedUsers: [] as string[],
  adminKeys: [] as string[],
  modelText: '{"items":[]}',
  modelStatus: 200,
  modelBodies: [] as any[],
  modelHeaders: [] as Headers[],
  modelUrls: [] as string[],
};

export function reset() {
  Object.assign(world, {
    usageToday: 0,
    usageInserts: [],
    usageFilters: [],
    deletedUsers: [],
    adminKeys: [],
    modelText: '{"items":[]}',
    modelStatus: 200,
    modelBodies: [],
    modelHeaders: [],
    modelUrls: [],
  });
}

const jsonRes = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
  const req = new Request(input, init);
  const url = new URL(req.url);
  if (url.origin === SUPABASE) world.adminKeys.push(req.headers.get('apikey') ?? '');
  if (url.origin === SUPABASE && url.pathname === '/rest/v1/extract_usage') {
    if (req.method === 'HEAD' || req.method === 'GET') {
      world.usageFilters.push(url.searchParams.get('user_id') ?? '');
      return new Response(null, { status: 200, headers: { 'Content-Range': `*/${world.usageToday}` } });
    }
    if (req.method === 'POST') {
      world.usageInserts.push(await req.json());
      return new Response(null, { status: 201 });
    }
  }
  if (url.origin === SUPABASE && url.pathname.startsWith('/auth/v1/admin/users/')) {
    const id = url.pathname.split('/').pop() ?? '';
    const user = { id, aud: 'authenticated', role: 'authenticated', email: 's@example.edu' };
    if (req.method === 'GET') return jsonRes(user);
    if (req.method === 'DELETE') {
      world.deletedUsers.push(id);
      return jsonRes(user);
    }
  }
  if (url.hostname === 'generativelanguage.googleapis.com') {
    world.modelUrls.push(url.pathname);
    world.modelBodies.push(await req.json());
    world.modelHeaders.push(req.headers);
    return jsonRes(
      { id: 'int-1', status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: world.modelText }] }] },
      world.modelStatus,
    );
  }
  throw new Error(`unexpected fetch ${req.method} ${req.url}`);
};

/** A POST to a function, signed in unless `auth` is null. */
export async function post(handle: (r: Request) => Promise<Response>, body: unknown, auth: string | null | Promise<string> = token()) {
  const bearer = auth == null ? null : await auth;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: 'sb_publishable_test' };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  return handle(new Request('http://fn.test/', { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) }));
}
