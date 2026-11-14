// Reads a notice (text, screenshot or PDF) and returns proposed deadlines.
// The app re-checks every date with its own resolver and shows a confirm card;
// nothing is saved here and the notice itself is never stored or logged.
//
// Model call: Gemini Interactions API (Google's recommended API for new projects),
// with a JSON schema so the model can only answer in the shape we expect,
// and store: false so Google keeps no copy of the notice.
import { cors, json, signedIn } from '../_shared/auth.ts';

export const AREAS = ['Assignment', 'Internship / jobs', 'Hackathon', 'Fees / forms', 'Community', 'Personal'];
const FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
const MAX_TEXT = 8000;
const MAX_FILE_B64 = 7_000_000; // about 5 MB of file
const LOCAL_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const env = (k: string, d: string) => Deno.env.get(k) || d;

/** What the model must return: one item per deadline. */
export const SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      description: 'One item per distinct deadline or task in the notice. Empty if there are none.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short action starting with a verb, max 70 characters' },
          when: { type: 'string', description: 'The date and time words copied exactly from the notice, e.g. "Friday 5 pm", "kal tak", "12/11 EOD". Empty if none' },
          due: { type: 'string', description: 'Your reading of "when" as YYYY-MM-DDTHH:mm in the student\'s local time. Empty if there is no date or it is vague' },
          submit: { type: 'string', description: 'What to submit and where, max 80 characters. Empty if not stated' },
          link: { type: 'string', description: 'A URL copied exactly from the notice. Empty if none' },
          imp: { type: 'integer', enum: [1, 2, 3], description: '3 = cannot be undone (internship or scholarship forms, offers, fees, registrations, exams); 2 = graded coursework; 1 = low stakes' },
          effort: { type: 'string', enum: ['S', 'M', 'L'], description: 'S under 30 minutes, M about an hour, L two hours or more' },
          area: { type: 'string', enum: AREAS },
        },
        required: ['title', 'when', 'due', 'submit', 'link', 'imp', 'effort', 'area'],
      },
    },
  },
  required: ['items'],
};

function instructions(now: string, weekday: string) {
  return `You pull deadlines out of a notice that an Indian college student received (class WhatsApp groups, Classroom, email, Unstop). It may be English or Hinglish.
Now: ${weekday} ${now.replace('T', ' ')} (the student's local time).
List every distinct deadline or task. Copy date words, links and names exactly as written.
Never invent a deadline, date or link that is not in the notice. If there are none, return an empty list.`;
}

/** Text of the model's answer: the text parts of the last model_output steps. */
export function outputText(res: unknown): string {
  const steps = (res as { steps?: unknown })?.steps;
  if (!Array.isArray(steps)) return '';
  const parts: string[] = [];
  for (const step of steps) {
    if (step?.type !== 'model_output' || !Array.isArray(step.content)) continue;
    for (const c of step.content) if (c?.type === 'text' && typeof c.text === 'string') parts.push(c.text);
  }
  return parts.join('');
}

/** Items from the model's JSON, tolerating a bare array or JSON wrapped in prose. */
export function parseItems(raw: string): unknown[] {
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    const m = /[[{][\s\S]*[\]}]/.exec(raw);
    try {
      v = m ? JSON.parse(m[0]) : [];
    } catch {
      v = [];
    }
  }
  const list = Array.isArray(v) ? v : Array.isArray((v as { items?: unknown })?.items) ? (v as { items: unknown[] }).items : [];
  return list.filter((x) => x && typeof x === 'object').slice(0, 25);
}

export async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const caller = await signedIn(req);
  if (!caller) return json({ error: 'not_signed_in' }, 401);
  const db = caller.admin; // extract_usage has no policies: admin only, always filtered by the caller

  let body: { text?: unknown; file?: { mimeType?: unknown; data?: unknown }; now?: unknown; weekday?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const text = typeof body.text === 'string' ? body.text.slice(0, MAX_TEXT) : '';
  const f = body.file;
  const file =
    f && typeof f.data === 'string' && typeof f.mimeType === 'string' && FILE_TYPES.includes(f.mimeType)
      ? { mimeType: f.mimeType, data: f.data }
      : null;
  if (f && !file) return json({ error: 'unsupported_file' }, 415);
  if (file && file.data.length > MAX_FILE_B64) return json({ error: 'file_too_large' }, 413);
  if (!text.trim() && !file) return json({ error: 'empty' }, 400);
  const now = typeof body.now === 'string' && LOCAL_ISO.test(body.now) ? body.now : null;
  const weekday = typeof body.weekday === 'string' ? body.weekday.slice(0, 12) : '';
  if (!now) return json({ error: 'bad_request' }, 400);

  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) return json({ error: 'not_configured' }, 503);

  const since = new Date(Date.now() - 864e5).toISOString();
  const { count, error: countErr } = await db
    .from('extract_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', caller.userId)
    .gte('at', since);
  if (countErr) return json({ error: 'server_error' }, 500);
  if ((count ?? 0) >= Number(env('EXTRACT_DAILY_CAP', '100'))) return json({ error: 'rate_limited' }, 429);
  const isPdf = file?.mimeType === 'application/pdf';
  await db.from('extract_usage').insert({ user_id: caller.userId, input: file ? (isPdf ? 'pdf' : 'image') : 'text' });

  const input: unknown[] = [];
  if (file) input.push({ type: isPdf ? 'document' : 'image', mime_type: file.mimeType, data: file.data });
  input.push({ type: 'text', text: text.trim() ? `Notice:\n${text}` : 'The notice is the attached file.' });

  const model = env('GEMINI_MODEL', 'gemini-3.5-flash-lite');
  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/${env('GEMINI_API_VERSION', 'v1beta')}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model,
        system_instruction: instructions(now, weekday),
        input,
        response_format: { type: 'text', mime_type: 'application/json', schema: SCHEMA },
        generation_config: { max_output_tokens: 4096 },
        store: false,
      }),
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    return json({ error: 'model_unavailable' }, 502);
  }
  if (res.status === 429) return json({ error: 'rate_limited' }, 429);
  if (!res.ok) {
    console.error('model error', res.status); // status only: never log the notice
    return json({ error: 'model_unavailable' }, 502);
  }
  return json({ items: parseItems(outputText(await res.json())), model });
}

export default { fetch: handle };
