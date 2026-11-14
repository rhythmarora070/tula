// Caller verification for Tula's functions, using Supabase's @supabase/server package:
// the user's access token is checked against the project's signing keys (SUPABASE_JWKS),
// and the admin client is built from the new secret key (SUPABASE_SECRET_KEYS).
// The platform provides those variables; nothing here reads a key directly.
import { createSupabaseContext } from 'npm:@supabase/server@1';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

export interface Caller {
  userId: string;
  /** bypasses row-level security: always filter by userId */
  admin: SupabaseClient;
}

/** The signed-in student behind this request, or null if the token is missing, expired or not from this project. */
export async function signedIn(req: Request): Promise<Caller | null> {
  const { data, error } = await createSupabaseContext(req, { auth: 'user' });
  const userId = data?.userClaims?.id;
  if (error || !data || !userId) return null;
  return { userId, admin: data.supabaseAdmin as unknown as SupabaseClient };
}
