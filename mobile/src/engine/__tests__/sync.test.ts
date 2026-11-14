import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromDraft, mergeDeadlines, tombstone } from '../save.ts';
import type { Deadline } from '../types.ts';

const mk = (id: string, title: string, updatedAt: number, extra: Partial<Deadline> = {}): Deadline => ({
  ...fromDraft({ title, due: '2026-11-13T17:00', when: '', flag: '', submit: '', link: '', imp: 2, effort: 'M', area: 'Assignment' }, 1, id),
  updatedAt,
  ...extra,
});
const titles = (list: Deadline[]) => Object.fromEntries(list.map((d) => [d.id, d.title]));

test('mergeDeadlines keeps both sides and the newest copy of each', () => {
  const local = [mk('a', 'phone A (newer)', 20), mk('b', 'phone B (older)', 5), mk('c', 'only on phone', 1)];
  const remote = [mk('a', 'account A (older)', 10), mk('b', 'account B (newer)', 9), mk('d', 'only on account', 1)];
  assert.deepEqual(titles(mergeDeadlines(local, remote, [])), {
    a: 'phone A (newer)',
    b: 'account B (newer)',
    c: 'only on phone',
    d: 'only on account',
  });
});

test('mergeDeadlines: a tie keeps the phone copy', () => {
  const merged = mergeDeadlines([mk('a', 'phone', 7)], [mk('a', 'account', 7)], []);
  assert.equal(merged[0].title, 'phone');
});

test('mergeDeadlines: deleted on this phone stays deleted, even if the account still has it', () => {
  const merged = mergeDeadlines([mk('a', 'keep', 1)], [mk('a', 'keep', 1), mk('x', 'deleted here', 99)], ['x']);
  assert.deepEqual(merged.map((d) => d.id), ['a']);
});

test('mergeDeadlines drops remote rows that are not deadlines', () => {
  const merged = mergeDeadlines([], [null, 'oops', { id: 5 }, { id: 'no-title' }, mk('ok', 'fine', 1)], []);
  assert.deepEqual(merged.map((d) => d.id), ['ok']);
});

test('mergeDeadlines carries done state and history from the newer side', () => {
  const remote = mk('a', 'x', 50, { done: true, doneAt: 50, history: [{ due: '2026-11-12T17:00', at: 40 }] });
  const [m] = mergeDeadlines([mk('a', 'x', 10)], [remote], []);
  assert.equal(m.done, true);
  assert.equal(m.history.length, 1);
});

test('mergeDeadlines: a deadline deleted on another phone disappears here too', () => {
  const local = [mk('a', 'deleted elsewhere', 10), mk('b', 'kept', 10)];
  const merged = mergeDeadlines(local, [tombstone('a', 20), mk('b', 'kept', 10)], []);
  assert.deepEqual(merged.map((d) => d.id), ['b']);
});

test('mergeDeadlines: a tombstone wins even over a newer local edit', () => {
  // the phone edited its stale copy after the other phone deleted it; deletion is final
  const merged = mergeDeadlines([mk('a', 'edited later', 99)], [tombstone('a', 20)], []);
  assert.deepEqual(merged, []);
});

test('mergeDeadlines never returns tombstones as deadlines', () => {
  const merged = mergeDeadlines([], [tombstone('x', 5), tombstone('y', 6)], []);
  assert.deepEqual(merged, []);
});
