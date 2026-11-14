// Saving confirmed drafts: new deadlines, repeats merged into one record, moved dates kept in history.
import { ISO_RE } from './format.ts';
import { cleanLink } from './extract.ts';
import { findDup, moveDue } from './record.ts';
import type { Deadline, Draft } from './types.ts';

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function fromDraft(x: Draft, now: number, id = newId()): Deadline {
  return {
    id,
    title: String(x.title).trim().slice(0, 140),
    due: ISO_RE.test(x.due || '') ? x.due : '',
    imp: x.imp,
    effort: x.effort,
    area: x.area,
    submit: String(x.submit || '').trim().slice(0, 120),
    link: cleanLink(x.link),
    source: String(x.when || '').slice(0, 80),
    history: [],
    seen: 1,
    done: false,
    created: now,
    updatedAt: now,
    steps: [],
    snoozedUntil: 0,
  };
}

export interface SaveResult {
  deadlines: Deadline[];
  added: number;
  moved: number;
  same: number;
  /** ids touched, for scrolling or highlighting */
  ids: string[];
}

export function applyDrafts(all: Deadline[], drafts: Draft[], now: number, makeId: () => string = newId): SaveResult {
  let list = all.slice();
  const res = { added: 0, moved: 0, same: 0, ids: [] as string[] };
  for (const raw of drafts) {
    const x: Draft = { ...raw, title: String(raw.title).trim(), link: cleanLink(raw.link), due: ISO_RE.test(raw.due || '') ? raw.due : '' };
    if (!x.title) continue;
    const d = findDup(x, list);
    const fill = (t: Deadline): Deadline => ({
      ...t,
      submit: t.submit || x.submit.slice(0, 120),
      link: t.link || x.link,
      seen: (t.seen || 1) + 1,
      updatedAt: now,
    });
    if (d && d.kind === 'same') {
      list = list.map((t) => (t.id === d.deadline.id ? fill(t) : t));
      res.same++;
      res.ids.push(d.deadline.id);
    } else if (d && x.dupAct !== 'new') {
      list = list.map((t) => (t.id === d.deadline.id ? fill(moveDue(t, x.due, x.when, now)) : t));
      res.moved++;
      res.ids.push(d.deadline.id);
    } else {
      const t = fromDraft(x, now, makeId());
      list.push(t);
      res.added++;
      res.ids.push(t.id);
    }
  }
  return { deadlines: list, ...res };
}

/** Applies an edit from the quick-add form. A changed date goes into the history. */
export function applyEdit(t: Deadline, x: Draft, now: number): Deadline {
  const due = ISO_RE.test(x.due || '') ? x.due : '';
  const moved = !!t.due && !!due && due !== t.due;
  return {
    ...t,
    title: String(x.title).trim().slice(0, 140) || t.title,
    due,
    imp: x.imp,
    effort: x.effort,
    area: x.area,
    submit: String(x.submit || '').trim().slice(0, 120),
    link: cleanLink(x.link),
    history: moved ? [...t.history, { due: t.due, at: now }] : t.history,
    snoozedUntil: moved ? 0 : t.snoozedUntil,
    updatedAt: now,
  };
}

/**
 * What the account keeps for a deleted deadline: the id and when, nothing else.
 * Every phone that pulls it drops its copy, and the database never lets it be overwritten.
 */
export interface Tombstone {
  id: string;
  deleted: true;
  updatedAt: number;
}
export const tombstone = (id: string, at: number): Tombstone => ({ id, deleted: true, updatedAt: at });
const isTombstone = (d: unknown): d is Tombstone =>
  !!d && typeof d === 'object' && (d as Tombstone).deleted === true && typeof (d as Tombstone).id === 'string';

/**
 * Combines this phone's deadlines with the account's copy after sign-in.
 * The newest copy of each deadline wins (a tie keeps this phone's). Anything deleted
 * on this phone or on another one (a tombstone) stays deleted, whatever its date, and
 * remote rows that aren't valid deadlines are dropped.
 */
export function mergeDeadlines(local: Deadline[], remote: unknown[], deleted: string[]): Deadline[] {
  const gone = new Set([...deleted, ...remote.filter(isTombstone).map((t) => t.id)]);
  const byId = new Map<string, Deadline>();
  const valid = remote.filter(
    (d): d is Deadline => !!d && typeof d === 'object' && typeof (d as Deadline).id === 'string' && typeof (d as Deadline).title === 'string',
  );
  for (const d of [...valid, ...local]) {
    if (gone.has(d.id)) continue;
    const cur = byId.get(d.id);
    if (!cur || (d.updatedAt ?? 0) >= (cur.updatedAt ?? 0)) byId.set(d.id, d);
  }
  return [...byId.values()];
}

export function summarizeSave(r: Pick<SaveResult, 'added' | 'moved' | 'same'>) {
  const bits: string[] = [];
  if (r.added) bits.push(`${r.added} saved`);
  if (r.moved) bits.push(`${r.moved} moved to the new date`);
  if (r.same) bits.push(`${r.same} already here, kept as one`);
  const s = bits.join(', ');
  return s ? `${s[0].toUpperCase()}${s.slice(1)}.` : 'Nothing to save.';
}
