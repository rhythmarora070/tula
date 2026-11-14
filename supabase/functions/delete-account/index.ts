// "Delete my data": removes the signed-in student's account. Every table references
// auth.users with ON DELETE CASCADE, so their deadlines and capture events go with it.
import { cors, json, signedIn } from '../_shared/auth.ts';

export async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const caller = await signedIn(req);
  if (!caller) return json({ error: 'not_signed_in' }, 401);
  const { error } = await caller.admin.auth.admin.deleteUser(caller.userId);
  if (error) return json({ error: 'server_error' }, 500);
  return json({ deleted: true });
}

export default { fetch: handle };
