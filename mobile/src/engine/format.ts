// Date helpers that never depend on the device locale, so output is the same
// in tests, on every phone and in the extraction prompt.
import type { LocalISO } from './types.ts';

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MO_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
export const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const isoLocal = (d: Date): LocalISO => `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Parses 'YYYY-MM-DDTHH:mm' as local time without relying on Date string parsing. */
export function parseLocal(v: LocalISO | number | Date | null | undefined): Date | null {
  if (v == null || v === '') return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], 0, 0);
}
export const toMs = (v: LocalISO) => parseLocal(v)?.getTime() ?? NaN;

export function clock(d: Date) {
  const h = d.getHours() % 12 || 12;
  return `${h}:${pad(d.getMinutes())} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}
export const weekday = (d: Date) => WD[d.getDay()];
export const fmtDate = (d: Date) => `${d.getDate()} ${MO[d.getMonth()]}`;
export const fmtDay = (v: LocalISO | Date | number) => {
  const d = parseLocal(v);
  return d ? `${WD[d.getDay()]}, ${fmtDate(d)}` : '';
};
export const fmtAbs = (v: LocalISO | Date | number) => {
  const d = parseLocal(v);
  return d ? `${fmtDay(d)}, ${clock(d)}` : '';
};
export const fmtLong = (d: Date) => `${WD_LONG[d.getDay()]}, ${d.getDate()} ${MO_LONG[d.getMonth()]}`;
export const weekdayLong = (d: Date) => WD_LONG[d.getDay()];

export const hoursUntil = (due: LocalISO, now: Date) => {
  const d = parseLocal(due);
  return d ? (d.getTime() - now.getTime()) / 36e5 : null;
};

export type Tone = 'crit' | 'warn' | 'calm';

/** Short label for a due time as seen from `now`: "Today 5:00 PM", "Tomorrow 12:00 PM", "Fri 5:00 PM", "20 Nov", "Overdue 3h". */
export function dueLabel(due: LocalISO | Date | number, now: Date): { text: string; tone: Tone } {
  const dd = parseLocal(due);
  if (!dd) return { text: 'No date', tone: 'calm' };
  const h = (dd.getTime() - now.getTime()) / 36e5;
  if (h < 0) {
    const a = -h;
    return { text: a < 24 ? `Overdue ${Math.max(1, Math.round(a))}h` : `Overdue ${Math.round(a / 24)}d`, tone: 'crit' };
  }
  if (dayKey(dd) === dayKey(now)) return { text: `Today ${clock(dd)}`, tone: h < 6 ? 'crit' : 'warn' };
  const tmw = new Date(now);
  tmw.setDate(now.getDate() + 1);
  if (dayKey(dd) === dayKey(tmw)) return { text: `Tomorrow ${clock(dd)}`, tone: 'warn' };
  if (h < 24 * 7) return { text: `${weekday(dd)} ${clock(dd)}`, tone: 'calm' };
  return { text: fmtDate(dd), tone: 'calm' };
}
