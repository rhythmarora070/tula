// Turning a notice into drafts. Without AI, plain code reads one deadline per paragraph.
// With AI, the model finds the items and copies the date words; resolveDate still decides the date.
import { resolveDate } from './dates.ts';
import { fmtAbs, ISO_RE } from './format.ts';
import { AREAS, type Area, type Draft, type Effort, type Stakes } from './types.ts';

const URL_RE = /https?:\/\/[^\s<>"')\]]+/i;

/** Only http(s) links, trailing punctuation removed. Anything else becomes ''. */
export function cleanLink(u: unknown) {
  const s = String(u ?? '').trim().replace(/[.,;:!?]+$/, '');
  return /^https?:\/\/\S+$/i.test(s) ? s.slice(0, 300) : '';
}

const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cap1 = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function guessKind(text: string): [Area, Stakes] {
  const s = text.toLowerCase();
  if (/intern|offer letter|placement|recruit|\bjob\b|\bhr\b/.test(s)) return ['Internship / jobs', 3];
  if (/hackathon|competition|contest|ideathon/.test(s)) return ['Hackathon', 3];
  if (/\bfees?\b|scholarship|registration|\bform\b/.test(s)) return ['Fees / forms', 3];
  if (/assignment|\blab\b|record|submission|quiz|exam|viva|project|practical|classroom/.test(s)) return ['Assignment', /exam|viva/.test(s) ? 3 : 2];
  if (/society|club|meetup|event|community|chapter/.test(s)) return ['Community', 2];
  return ['Personal', 2];
}

const LEAD = /^(reminder|notice|important|urgent|attention|update|fwd|forwarded|by|on|before|till|until)\b[\s:!\-–]*/i;
const TAIL = /\s+(by|on|before|till|until|due|is|at|tak|to|now|extended|postponed|preponed|moved|shifted|rescheduled)$/i;

/** No AI: one paragraph is one deadline. */
export function extractLocal(text: string, now: Date): Draft[] {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, 25)
    .map((b) => {
      const r = resolveDate(b, now);
      const link = cleanLink((URL_RE.exec(b) || [''])[0]);
      const plain = b.replace(URL_RE, ' ');
      let title = plain.split(/\n|[.!?]\s+(?=[A-Z])/).map((x) => x.trim()).find((x) => x.length > 2) || plain;
      // Cut the title at the date words, or remove them if they come first.
      const idx = r.parts.map((p) => title.toLowerCase().indexOf(p.toLowerCase())).filter((i) => i >= 0).sort((a, c) => a - c)[0];
      if (idx >= 8) title = title.slice(0, idx);
      else r.parts.forEach((p) => (title = title.replace(new RegExp(reEsc(p), 'i'), ' ')));
      title = title.replace(/\s+/g, ' ');
      let prev: string;
      do {
        prev = title;
        title = title.replace(/^[\s*_~>•\-–:!]+/, '').replace(LEAD, '').replace(/[\s,;:.\-–]+$/, '').replace(TAIL, '');
      } while (title !== prev);
      if (title.length < 3) title = plain.replace(/\s+/g, ' ').trim();
      const sm = /\b(upload|e-?mail|send|fill|register|pay|apply)\b[^.\n!?]*/i.exec(plain);
      let submit = sm ? sm[0].replace(/[\s:,\-–]+$/, '').trim().slice(0, 120) : '';
      if (submit && title.toLowerCase().includes(submit.toLowerCase())) submit = '';
      const [area, imp] = guessKind(b);
      return {
        title: cap1(title).slice(0, 140),
        due: r.due,
        when: r.phrase,
        flag: r.notes.join(' '),
        submit: cap1(submit),
        link,
        imp,
        effort: 'M' as Effort,
        area,
      };
    });
}

/** Shape the extraction function returns per item (model output, untrusted). */
export interface AiItem {
  title?: unknown;
  when?: unknown;
  due?: unknown;
  submit?: unknown;
  link?: unknown;
  imp?: unknown;
  effort?: unknown;
  area?: unknown;
}

/** Checks one model item against the resolver and turns it into a draft. */
export function finishItem(x: AiItem, now: Date): Draft {
  const when = String(x.when ?? '').trim().slice(0, 80);
  const r = resolveDate(when, now);
  const ai = typeof x.due === 'string' && ISO_RE.test(x.due) ? x.due : '';
  let due = '';
  const flags = r.notes.slice();
  if (r.status === 'ok') {
    due = r.due;
    if (ai && ai !== due) flags.push(`The AI read this as ${fmtAbs(ai)}. Check it.`);
  } else if (r.status === 'none' && ai) {
    due = ai;
    flags.push('Couldn’t confirm this date from the text. Check it.');
  } else if (r.status === 'none' && when) flags.push('Couldn’t read that as a date. Set it yourself.');
  const imp = [1, 2, 3].includes(Number(x.imp)) ? (Number(x.imp) as Stakes) : 2;
  const effort = ['S', 'M', 'L'].includes(String(x.effort)) ? (String(x.effort) as Effort) : 'M';
  const area = (AREAS as readonly string[]).includes(String(x.area)) ? (String(x.area) as Area) : 'Personal';
  return {
    title: String(x.title ?? '').trim().slice(0, 140),
    due,
    when,
    flag: flags.join(' '),
    submit: String(x.submit ?? '').trim().slice(0, 120),
    link: cleanLink(x.link),
    imp,
    effort,
    area,
  };
}

/** A blank draft for quick add. */
export const blankDraft = (): Draft => ({ title: '', due: '', when: '', flag: '', submit: '', link: '', imp: 2, effort: 'M', area: 'Assignment' });
