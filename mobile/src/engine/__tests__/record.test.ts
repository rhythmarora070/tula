import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractLocal, finishItem } from '../extract.ts';
import { applyDrafts, applyEdit, fromDraft, summarizeSave } from '../save.ts';
import { findDup, reminderTimes, upcomingReminders } from '../record.ts';
import { planDay, radar, summary } from '../plan.ts';
import { dueLabel, isoLocal } from '../format.ts';
import type { Deadline, Draft } from '../types.ts';

const NOW = new Date(2026, 10, 11, 14, 5);
const T = NOW.getTime();
let n = 0;
const ids = () => `id${++n}`;

test('extractLocal reads the sample notice', () => {
  const [d] = extractLocal('ML lab record submission by Friday 5 pm, upload on Classroom, format attached.\nhttps://classroom.google.com', NOW);
  assert.equal(d.title, 'ML lab record submission');
  assert.equal(d.due, '2026-11-13T17:00');
  assert.equal(d.when, 'Friday 5 pm');
  assert.equal(d.link, 'https://classroom.google.com');
  assert.equal(d.area, 'Assignment');
  assert.match(d.submit, /^Upload on Classroom/);
});

test('extractLocal splits paragraphs and cleans titles', () => {
  const ds = extractLocal('*URGENT* Internship form closes kal 11:59 pm\nApply: https://forms.gle/xyz\n\nHackathon registration till 20 Nov. Register on Unstop.', NOW);
  assert.deepEqual(
    ds.map((d) => [d.title, d.due, d.area, d.imp]),
    [
      ['Internship form closes', '2026-11-12T23:59', 'Internship / jobs', 3],
      ['Hackathon registration', '2026-11-20T23:59', 'Hackathon', 3],
    ],
  );
  assert.equal(ds[0].link, 'https://forms.gle/xyz');
  assert.equal(extractLocal('Reminder: ML lab record submission by Friday 5 pm on Classroom', NOW)[0].title, 'ML lab record submission');
  assert.equal(extractLocal('ML lab record submission extended to Monday 5 pm', NOW)[0].title, 'ML lab record submission');
  assert.equal(extractLocal('By Friday submit the DBMS assignment', NOW)[0].title, 'Submit the DBMS assignment');
});

test('finishItem: code decides the date and flags disagreement', () => {
  const a = finishItem({ title: 'Submit form', when: 'Friday 5 pm', due: '2026-11-14T17:00', link: 'https://forms.gle/abc.', imp: 3, area: 'Internship / jobs' }, NOW);
  assert.equal(a.due, '2026-11-13T17:00');
  assert.match(a.flag, /AI read this as Sat, 14 Nov/);
  assert.equal(a.link, 'https://forms.gle/abc');
  const b = finishItem({ title: 'Orientation', when: 'soon', due: '2026-11-15T10:00', link: 'javascript:alert(1)', area: 'Nope' }, NOW);
  assert.equal(b.due, '');
  assert.equal(b.link, '');
  assert.equal(b.area, 'Personal');
  assert.match(b.flag, /unclear/);
  const c = finishItem({ title: 'Pay fee', when: '', due: '2026-11-20T17:00' }, NOW);
  assert.equal(c.due, '2026-11-20T17:00');
  assert.match(c.flag, /Couldn’t confirm/);
});

test('applyDrafts: same notice twice is one record, a new date moves it', () => {
  const [d] = extractLocal('ML lab record submission by Friday 5 pm, upload on Classroom', NOW);
  let r = applyDrafts([], [d], T, ids);
  assert.equal(r.added, 1);
  r = applyDrafts(r.deadlines, extractLocal('Reminder: ML lab record submission by Friday 5 pm on Classroom', NOW), T + 1, ids);
  assert.equal(r.same, 1);
  assert.equal(r.deadlines.length, 1);
  assert.equal(r.deadlines[0].seen, 2);
  const moved = extractLocal('ML lab record submission extended to Monday 5 pm', NOW);
  assert.equal(findDup(moved[0], r.deadlines)?.kind, 'moved');
  r = applyDrafts(r.deadlines, moved, T + 2, ids);
  assert.equal(r.moved, 1);
  const t = r.deadlines[0];
  assert.equal(t.due, '2026-11-16T17:00');
  assert.deepEqual(t.history, [{ due: '2026-11-13T17:00', at: T + 2 }]);
  assert.equal(t.seen, 3);
  assert.equal(summarizeSave(r), '1 moved to the new date.');
  // "save as new" keeps two records
  const sep = applyDrafts(r.deadlines, [{ ...moved[0], due: '2026-11-18T17:00', dupAct: 'new' }], T + 3, ids);
  assert.equal(sep.deadlines.length, 2);
});

test('applyEdit keeps the old date in history', () => {
  const t = fromDraft({ title: 'Pay fee', due: '2026-11-14T17:00', when: '', flag: '', submit: '', link: '', imp: 3, effort: 'S', area: 'Fees / forms' }, T, 'x');
  const e = applyEdit(t, { title: 'Pay fee', due: '2026-11-16T17:00', when: '', flag: '', submit: 'ERP', link: 'ftp://nope', imp: 3, effort: 'S', area: 'Fees / forms' }, T + 5);
  assert.equal(e.history.length, 1);
  assert.equal(e.link, '');
  assert.equal(e.submit, 'ERP');
});

test('reminders follow the stakes', () => {
  const hi = reminderTimes({ due: '2026-11-16T17:00', imp: 3 });
  assert.deepEqual(hi.map((r) => isoLocal(new Date(r.at))), ['2026-11-13T17:00', '2026-11-15T17:00', '2026-11-16T09:00']);
  const lo = reminderTimes({ due: '2026-11-16T17:00', imp: 2 });
  assert.deepEqual(lo.map((r) => isoLocal(new Date(r.at))), ['2026-11-15T17:00', '2026-11-16T14:00']);
  // a deadline due at 8 am has no "morning of" reminder after it
  assert.equal(reminderTimes({ due: '2026-11-16T08:00', imp: 3 }).length, 2);
  const t = fromDraft({ title: 'x', due: '2026-11-12T12:00', when: '', flag: '', submit: '', link: '', imp: 3, effort: 'S', area: 'Personal' }, T, 'y');
  assert.deepEqual(upcomingReminders(t, NOW).map((r) => r.label), ['1 day before', 'morning of'].slice(1));
});

test('planDay puts anything due within a day first and shortens on a short day', () => {
  const mk = (title: string, due: string, imp: 1 | 2 | 3, effort: 'S' | 'M' | 'L'): Deadline =>
    fromDraft({ title, due, when: '', flag: '', submit: '', link: '', imp, effort, area: 'Assignment' } as Draft, T - 864e5, title);
  const all = [mk('later big', '2026-11-20T17:00', 3, 'L'), mk('tonight', '2026-11-11T23:59', 2, 'M'), mk('no date', '', 1, 'S'), mk('fri', '2026-11-13T17:00', 2, 'M')];
  // default budget is 3 hours: tonight (1 hr) + the big high-stakes one (2 hrs) fill it
  const p = planDay(all, 0, NOW);
  assert.deepEqual(p.picks.map((o) => o.t.title), ['tonight', 'later big']);
  // most of the day: room for three
  assert.equal(planDay(all, 4, NOW).picks.length, 3);
  // under an hour: at most 2, and the due-tonight one always stays
  const short = planDay(all, 1, NOW);
  assert.ok(short.picks.length <= 2);
  assert.equal(short.picks[0].t.title, 'tonight');
  // snoozed items leave the picks but stay on the radar
  const snoozed = all.map((t) => (t.title === 'tonight' ? { ...t, snoozedUntil: T + 864e5 } : t));
  assert.ok(!planDay(snoozed, 0, NOW).picks.some((o) => o.t.title === 'tonight'));
  assert.ok(radar(snoozed, NOW).some((o) => o.t.title === 'tonight'));
  assert.equal(summary(all, NOW), '2 due in the next 72 hours.');
});

test('dueLabel', () => {
  assert.deepEqual(dueLabel('2026-11-11T17:00', NOW), { text: 'Today 5:00 PM', tone: 'crit' });
  assert.deepEqual(dueLabel('2026-11-12T12:00', NOW), { text: 'Tomorrow 12:00 PM', tone: 'warn' });
  assert.deepEqual(dueLabel('2026-11-13T17:00', NOW), { text: 'Fri 5:00 PM', tone: 'calm' });
  assert.deepEqual(dueLabel('2026-11-30T17:00', NOW), { text: '30 Nov', tone: 'calm' });
  assert.deepEqual(dueLabel('2026-11-11T10:00', NOW), { text: 'Overdue 4h', tone: 'crit' });
  assert.deepEqual(dueLabel('', NOW), { text: 'No date', tone: 'calm' });
});
