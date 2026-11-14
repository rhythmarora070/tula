// Dates are decided by plain code. The model may propose a date, but this resolver
// reads the words, and the confirm card flags any disagreement.
import { fmtDay, isoLocal } from './format.ts';
import type { LocalISO } from './types.ts';

export interface Resolved {
  /** 'ok' = due set, 'unclear' = vague words found and nothing guessed, 'none' = no date words */
  status: 'ok' | 'unclear' | 'none';
  due: LocalISO;
  /** the date words, in the order they appeared */
  phrase: string;
  parts: string[];
  /** things the student should check */
  notes: string[];
}

const MON = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const NAMED: Record<string, [number, number]> = {
  noon: [12, 0], morning: [10, 0], subah: [10, 0], afternoon: [15, 0], evening: [18, 0], shaam: [18, 0],
};
const VAGUE = /\b(soon|asap|shortly|later|jaldi?|(?:next|this) (?:week|month)|end of (?:the )?(?:week|month|sem(?:ester)?))\b/;

/** Reads a date out of a phrase or a whole notice, relative to `now` (device local time). */
export function resolveDate(text: string, now: Date = new Date()): Resolved {
  let orig = ` ${String(text || '')} `;
  let s = orig.toLowerCase();
  if (s.length !== orig.length) orig = s;
  let hh: number | null = null;
  let mm = 0;
  let eod = false;
  let nextWk = false;
  const notes: string[] = [];
  const parts: [number, string][] = [];
  const cut = (k: RegExpExecArray) => {
    parts.push([k.index, orig.substr(k.index, k[0].length).trim().replace(/[.,]+$/, '')]);
    s = s.slice(0, k.index) + ' '.repeat(k[0].length) + s.slice(k.index + k[0].length);
  };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let m: RegExpExecArray | null;

  // time of day
  if ((m = /\b(\d{1,2})(?:[:.](\d{2}))?\s*([ap])\.?m\b\.?/.exec(s)) && +m[1] >= 1 && +m[1] <= 12 && +(m[2] || 0) < 60) {
    hh = (+m[1] % 12) + (m[3] === 'p' ? 12 : 0);
    mm = +(m[2] || 0);
    cut(m);
  } else if ((m = /\b([01]?\d|2[0-3]):([0-5]\d)\b/.exec(s))) {
    hh = +m[1];
    mm = +m[2];
    if (hh >= 1 && hh <= 7) {
      hh += 12;
      notes.push('No AM or PM given, assumed PM.');
    }
    cut(m);
  } else if ((m = /\b(eod|end of (?:the )?day|midnight|raat)\b/.exec(s))) {
    hh = 23;
    mm = 59;
    eod = m[1] !== 'midnight';
    cut(m);
  } else if ((m = /\b(noon|morning|subah|afternoon|evening|shaam)\b/.exec(s))) {
    [hh, mm] = NAMED[m[1]];
    cut(m);
  }

  // the day
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const mk = (y: number, mo: number, da: number) => {
    const x = new Date(y, mo, da);
    return mo >= 0 && mo < 12 && x.getMonth() === mo && x.getDate() === da ? x : null;
  };
  // A date without a year that is more than 60 days in the past means next year.
  const roll = (mo: number, da: number, y: number) => {
    if (y) return mk(y < 100 ? 2000 + y : y, mo, da);
    let x = mk(base.getFullYear(), mo, da);
    if (x && base.getTime() - x.getTime() > 60 * 864e5) x = mk(base.getFullYear() + 1, mo, da);
    return x;
  };
  const plus = (n: number) => {
    const x = new Date(base);
    x.setDate(x.getDate() + n);
    return x;
  };
  let d: Date | null = null;
  const tryIt = (re: RegExp, fn: (k: RegExpExecArray) => Date | null) => {
    if (d) return;
    const k = re.exec(s);
    if (!k) return;
    const x = fn(k);
    if (x) {
      d = x;
      cut(k);
    }
  };
  tryIt(/\b(\d{4})-(\d{2})-(\d{2})\b/, (k) => mk(+k[1], +k[2] - 1, +k[3]));
  tryIt(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:of\\s+)?(${MON})\\b\\.?(?:,?\\s*(\\d{4})\\b)?`), (k) =>
    roll(MONTHS.indexOf(k[2].slice(0, 3)), +k[1], +k[3] || 0),
  );
  tryIt(new RegExp(`\\b(${MON})\\b\\.?\\s*(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s*(\\d{4})\\b)?`), (k) =>
    roll(MONTHS.indexOf(k[1].slice(0, 3)), +k[2], +k[3] || 0),
  );
  tryIt(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/, (k) => roll(+k[2] - 1, +k[1], +k[3] || 0)); // DD/MM, the Indian order
  tryIt(/\b(\d{1,2})-(\d{1,2})-(\d{2,4})\b/, (k) => roll(+k[2] - 1, +k[1], +k[3]));
  tryIt(/\b(day after tomorrow|parson?)\b/, () => plus(2));
  tryIt(/\b(tomorrow|tmrw|tmr|kal)\b/, () => plus(1));
  tryIt(/\b(today|tonight|aaj)\b/, () => plus(0));
  tryIt(/\b(?:(next|this|coming)\s+)?(mon|tues?|wed(?:nes)?|thu(?:rs?)?|fri|sat(?:ur)?|sun)(?:day)?\b/, (k) => {
    const target = WDAYS.indexOf(k[2].slice(0, 3));
    const wd = base.getDay();
    let diff = (target - wd + 7) % 7;
    if (k[1] === 'next' || /\bnext week\b/.test(s)) {
      // "next Friday" = the Friday of next week (Monday-start weeks)
      diff = 7 - ((wd + 6) % 7) + ((target + 6) % 7);
      nextWk = true;
    } else if (diff === 0 && hh != null && hh * 60 + mm <= nowMin) diff = 7;
    return plus(diff);
  });

  if (!d) {
    const v = VAGUE.exec(s);
    if (eod) d = base;
    else if (v) {
      return { due: '', status: 'unclear', phrase: orig.substr(v.index, v[0].length).trim(), parts: [], notes: ['Date unclear. Set it yourself.'] };
    } else if (hh != null) {
      const passed = hh * 60 + mm <= nowMin;
      d = plus(passed ? 1 : 0);
      notes.push(`No day given, assumed ${passed ? 'tomorrow' : 'today'}.`);
    } else return { due: '', status: 'none', phrase: '', parts: [], notes: [] };
  }
  const day = d as Date;
  day.setHours(hh == null ? 23 : hh, hh == null ? 59 : mm, 0, 0);
  if (nextWk) notes.push(`“Next” read as ${fmtDay(day)}. Check it.`);
  if (day < now) notes.push('This date has already passed.');
  parts.sort((a, b) => a[0] - b[0]);
  const p = parts.map((x) => x[1]);
  return { due: isoLocal(day), status: 'ok', phrase: p.join(' '), parts: p, notes };
}
