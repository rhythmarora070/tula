// One record per deadline: repeats are merged, extensions keep their history,
// and reminders follow the stakes.
import { parseLocal, toMs } from './format.ts';
import type { Deadline, Draft, LocalISO } from './types.ts';

const STOP = new Set('the a an of for to by on in and your please example is are at with from'.split(' '));
const toks = (s: string) =>
  new Set(
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map((w) => (w === 'submission' ? 'submit' : w.replace(/s$/, '')))
      .filter((w) => w.length > 1 && !STOP.has(w)),
  );

/** Jaccard overlap of meaningful words, 0..1. */
export function similarity(a: string, b: string) {
  const A = toks(a);
  const B = toks(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  A.forEach((w) => {
    if (B.has(w)) n++;
  });
  return n / (A.size + B.size - n);
}

export interface DupMatch {
  deadline: Deadline;
  /** 'same' = same date (or the new one has none), 'moved' = the date differs */
  kind: 'same' | 'moved';
}

/** Is this the same deadline as one already saved and still open? */
export function findDup(x: Pick<Draft, 'title' | 'due' | 'link'>, all: Deadline[], skipId?: string): DupMatch | null {
  let best: Deadline | null = null;
  let bs = 0;
  for (const t of all) {
    if (t.done || t.id === skipId) continue;
    const s = similarity(x.title, t.title);
    if ((s >= 0.6 || (x.link && x.link === t.link && s >= 0.25)) && s > bs) {
      best = t;
      bs = s;
    }
  }
  if (!best) return null;
  return { deadline: best, kind: !x.due || x.due === best.due ? 'same' : 'moved' };
}

export interface Reminder {
  at: number;
  label: string;
}

/** High stakes: 3 days, 1 day and 9 am on the day. Everything else: 1 day and 3 hours before. */
export function reminderTimes(t: Pick<Deadline, 'due' | 'imp'>): Reminder[] {
  const due = parseLocal(t.due);
  if (!due) return [];
  const d = due.getTime();
  if (t.imp === 3) {
    const morning = new Date(due);
    morning.setHours(9, 0, 0, 0);
    return [
      { at: d - 72 * 36e5, label: '3 days before' },
      { at: d - 24 * 36e5, label: '1 day before' },
      { at: morning.getTime(), label: 'morning of' },
    ]
      .filter((r) => r.at < d)
      .sort((a, b) => a.at - b.at);
  }
  return [
    { at: d - 24 * 36e5, label: '1 day before' },
    { at: d - 3 * 36e5, label: '3 hours before' },
  ];
}

/** Reminders still to come for an open deadline. */
export function upcomingReminders(t: Deadline, now: Date): Reminder[] {
  if (t.done || !t.due) return [];
  const d = toMs(t.due);
  if (!(d > now.getTime())) return [];
  return reminderTimes(t).filter((r) => r.at > now.getTime());
}

/** Returns the deadline with a new due date; the old one goes into the history. */
export function moveDue(t: Deadline, due: LocalISO, source: string | undefined, now: number): Deadline {
  const history = t.due && t.due !== due ? [...t.history, { due: t.due, at: now }] : t.history;
  return { ...t, due, history, snoozedUntil: 0, source: source || t.source, updatedAt: now };
}

export const lastMove = (t: Deadline) => t.history[t.history.length - 1] ?? null;
export const movedSince = (t: Deadline, sinceMs: number) => t.history.some((h) => h.at >= sinceMs);
