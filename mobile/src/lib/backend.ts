// Optional account: AI reading of notices, backup across devices, and pilot metrics.
// Without EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY the app runs fully local.
// The publishable key (sb_publishable_...) is safe to ship in the app; row-level security
// keeps each student's rows private. Older projects can use the legacy anon key instead.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, FunctionsHttpError, type Session } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { File } from 'expo-file-system';
import { AppState, Platform } from 'react-native';
import { isoLocal, tombstone, weekdayLong, type AiItem, type Deadline } from '@/engine/index.ts';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && key
    ? createClient(url, key, {
        auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;
export const backendConfigured = !!supabase;

if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (s) => (s === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()));
}

export type { Session };

const need = () => {
  if (!supabase) throw new BackendError('not_configured');
  return supabase;
};

export class BackendError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

/* ---------- sign-in: a 6-digit code by email, no passwords and no deep links ---------- */
export async function sendCode(email: string) {
  const { error } = await need().auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
  if (error) throw new BackendError(error.status === 429 ? 'rate_limited' : 'send_failed');
}
export async function verifyCode(email: string, token: string) {
  const { error } = await need().auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' });
  if (error) throw new BackendError('bad_code');
}
export async function signOut() {
  await supabase?.auth.signOut();
}

/* ---------- AI reading ---------- */
export interface ExtractInput {
  text?: string;
  file?: { uri: string; mimeType: string };
}

/** Sends the notice once to the extract function. Returns the model's proposals; the app re-checks every date. */
export async function extractRemote(input: ExtractInput, now: Date): Promise<AiItem[]> {
  const db = need();
  const { data: s } = await db.auth.getSession();
  if (!s.session) throw new BackendError('not_signed_in');
  let file: { mimeType: string; data: string } | undefined;
  if (input.file) {
    const data = await new File(input.file.uri).base64();
    file = { mimeType: input.file.mimeType, data };
  }
  const { data, error } = await db.functions.invoke('extract', {
    body: { text: input.text ?? '', file, now: isoLocal(now), weekday: weekdayLong(now) },
  });
  if (error) {
    let code = 'model_unavailable';
    if (error instanceof FunctionsHttpError) {
      try {
        code = (await error.context.json())?.error ?? code;
      } catch {}
    }
    throw new BackendError(code);
  }
  return Array.isArray(data?.items) ? data.items : [];
}

/* ---------- sync ---------- */
/** The account's copy, unchecked: mergeDeadlines drops anything that isn't a deadline. */
export async function pullDeadlines(): Promise<unknown[]> {
  const { data, error } = await need().from('deadlines').select('data');
  if (error) throw new BackendError('sync_failed');
  return (data ?? []).map((r) => r.data);
}

export async function pushDeadlines(list: Deadline[], deletedIds: string[]) {
  const db = need();
  if (list.length) {
    const { error } = await db
      .from('deadlines')
      .upsert(list.map((d) => ({ id: d.id, data: d, updated_at: d.updatedAt })), { onConflict: 'user_id,id' });
    if (error) throw new BackendError('sync_failed');
  }
  if (deletedIds.length) {
    // Replace each deleted deadline with a tombstone (id and time only), so other phones
    // signed in to the same account drop it too. The content itself is gone from the server.
    const now = Date.now();
    const { error } = await db
      .from('deadlines')
      .upsert(deletedIds.map((id) => ({ id, data: tombstone(id, now), updated_at: now })), { onConflict: 'user_id,id' });
    if (error) throw new BackendError('sync_failed');
  }
}

export interface CaptureEvent {
  source: 'share' | 'paste' | 'quick';
  input: 'text' | 'image' | 'pdf' | 'typed';
  ai: boolean;
  found: number;
  saved: number;
  edited: number;
  merged: number;
}

/** Counts only, never the notice: what the pilot needs to measure captures and the no-edit rate. */
export async function logCapture(ev: CaptureEvent) {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;
  await supabase.from('capture_events').insert(ev);
}

/* ---------- error reports ---------- */
const reported = new Set<string>();
const MAX_REPORTS_PER_SESSION = 20;

/**
 * Sends a crash or error report so the team sees problems on students' phones.
 * Signed-in students only; never throws; each distinct message is sent once per app session.
 */
export async function reportError(source: 'screen' | 'global', error: unknown) {
  try {
    if (!supabase) return;
    const err = error instanceof Error ? error : new Error(String(error));
    const message = `${err.name}: ${err.message}`.slice(0, 500);
    if (reported.has(message) || reported.size >= MAX_REPORTS_PER_SESSION) return;
    reported.add(message);
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await supabase.from('client_errors').insert({
      source,
      message,
      stack: err.stack?.slice(0, 2000) ?? null,
      app_version: (Constants.expoConfig?.version ?? '').slice(0, 40),
      os_version: `${Platform.OS} ${Platform.Version}`.slice(0, 40),
    });
  } catch {
    // reporting must never cause a second failure
  }
}

/** Deletes the account; the database removes its deadlines and events with it. */
export async function deleteAccount() {
  const db = need();
  const { error } = await db.functions.invoke('delete-account', { body: {} });
  if (error) throw new BackendError('delete_failed');
  await db.auth.signOut();
}
