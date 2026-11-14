// Today's 2 or 3 picks, the 72-hour radar and the one-line summary.
import { hoursUntil } from './format.ts';
import { movedSince } from './record.ts';
import { EFFORT_MIN, TIME_CAP_MIN, type Deadline, type TimeToday } from './types.ts';

export interface Scored {
  t: Deadline;
  s: number;
  h: number | null;
}

export const isOpen = (t: Deadline, now: Date) => !t.done && !(t.snoozedUntil && t.snoozedUntil > now.getTime());

/**
 * score = 0.45 × urgency + 0.35 × stakes + 0.20 × time fit + age bonus
 * urgency  = 1 / (1 + hours_until_due / 24)  (1.15 if overdue, 0.15 if no date)
 * time fit = 1 − |task size − time you have| (0.5 if not answered)
 */
export function score(t: Deadline, time: TimeToday, now: Date) {
  const h = hoursUntil(t.due, now);
  const u = h == null ? 0.15 : h <= 0 ? 1.15 : 1 / (1 + h / 24);
  const i = t.imp / 3;
  const e = { S: 0, M: 0.5, L: 1 }[t.effort] ?? 0.5;
  const fit = time ? 1 - Math.abs(e - (time - 1) / 3) : 0.5;
  const age = Math.min(0.15, ((now.getTime() - t.created) / 864e5) * 0.03);
  return 0.45 * u + 0.35 * i + 0.2 * fit + age;
}

const load = (t: Deadline, short: boolean) => (short && t.effort === 'L' ? 25 : EFFORT_MIN[t.effort] || 60);

export interface DayPlan {
  picks: Scored[];
  mins: number;
  short: boolean;
  /** due within a day but not picked */
  overflow: number;
}

/** Anything due within 24 hours goes first; the rest by score, within the time budget. */
export function planDay(all: Deadline[], time: TimeToday, now: Date): DayPlan {
  const short = time === 1;
  const n = short ? 2 : 3;
  const cap = TIME_CAP_MIN[time];
  const open = all.filter((t) => isOpen(t, now)).map((t) => ({ t, s: score(t, time, now), h: hoursUntil(t.due, now) }));
  const must = open.filter((o) => o.h != null && o.h <= 24).sort((a, b) => (a.h as number) - (b.h as number));
  const rest = open.filter((o) => !must.includes(o)).sort((a, b) => b.s - a.s);
  const picks: Scored[] = [];
  let mins = 0;
  for (const o of must) {
    if (picks.length >= n) break;
    picks.push(o);
    mins += load(o.t, short);
  }
  for (const o of rest) {
    if (picks.length >= n) break;
    const m = load(o.t, short);
    if (picks.length && mins + m > cap) continue;
    picks.push(o);
    mins += m;
  }
  return { picks, mins, short, overflow: Math.max(0, must.length - n) };
}

export function reason(o: Scored, short: boolean) {
  const { t, h } = o;
  if (h != null && h < 0) return 'Past its deadline. Close it today, or check whether it was extended.';
  if (h != null && h <= 24) return 'Due within a day, so it goes first.';
  if (short && t.effort === 'L') return 'Big one and time is short. Today, just the first 25 minutes.';
  if (t.imp === 3) return 'High stakes. A miss here can’t be undone, so it keeps moving.';
  if (h != null && h <= 72) return 'Due soon. A little today keeps it from becoming a scramble.';
  if (short && t.effort === 'S') return 'Small enough to fit the time you have.';
  return 'Next most important thing on your list.';
}

/** Open deadlines due in the next `hours` (snoozed ones included: snoozing never hides from the radar). */
export function radar(all: Deadline[], now: Date, hours = 72) {
  return all
    .filter((t) => !t.done)
    .map((t) => ({ t, h: hoursUntil(t.due, now) }))
    .filter((o): o is { t: Deadline; h: number } => o.h != null && o.h <= hours)
    .sort((a, b) => a.h - b.h);
}

export function summary(all: Deadline[], now: Date) {
  if (!all.length) return 'Nothing saved yet. Share a notice to Tula and it keeps the deadline for you.';
  const open = all.filter((t) => !t.done);
  if (!open.length) return 'All clear. Everything you saved is done.';
  const hs = open.map((t) => hoursUntil(t.due, now));
  const over = hs.filter((h) => h != null && h < 0).length;
  const soon = hs.filter((h) => h != null && h >= 0 && h <= 72).length;
  const moved = open.filter((t) => movedSince(t, now.getTime() - 7 * 864e5)).length;
  let s = soon ? `${soon} due in the next 72 hours` : 'Nothing due in the next 72 hours';
  if (over) s += `, ${over} overdue`;
  return `${s}.${moved ? ` ${moved} moved this week.` : ''}`;
}

export const fmtMin = (m: number) => (m < 60 ? `${m} min` : `${(m / 60).toFixed(m % 60 ? 1 : 0)} hr`);
