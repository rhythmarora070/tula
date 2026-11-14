import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveDate } from '../dates.ts';

// Wednesday 11 Nov 2026, 2:05 pm local
const NOW = new Date(2026, 10, 11, 14, 5);

const cases: [string, string, string?][] = [
  // phrase, expected due (or status), expected note fragment
  ['tomorrow 5 pm', '2026-11-12T17:00'],
  ['by Friday 5 pm', '2026-11-13T17:00'],
  ['next Friday', '2026-11-20T23:59', 'Next'],
  ['12/11 EOD', '2026-11-12T23:59'],
  ['kal tak', '2026-11-12T23:59'],
  ['parso subah', '2026-11-13T10:00'],
  ['EOD', '2026-11-11T23:59'],
  ['soon', 'unclear', 'Date unclear'],
  ['next week', 'unclear'],
  ['20 Nov', '2026-11-20T23:59'],
  ['Nov 20, 2026 at 9:30 am', '2026-11-20T09:30'],
  ['13-11-2026 17:00', '2026-11-13T17:00'],
  ['by 5 pm', '2026-11-11T17:00', 'assumed today'],
  ['by 11 am', '2026-11-12T11:00', 'assumed tomorrow'],
  ['submit by 5:00', '2026-11-11T17:00', 'assumed PM'],
  ['Wednesday 10 am', '2026-11-18T10:00'],
  ['Wednesday 6 pm', '2026-11-11T18:00'],
  ['2026-11-30', '2026-11-30T23:59'],
  ['team of 3-4 members', 'none'],
  ['10 marks, 2 questions', 'none'],
  ['tonight', '2026-11-11T23:59'],
  ['3rd December midnight', '2026-12-03T23:59'],
  ['Sat', '2026-11-14T23:59'],
  ['no date here at all', 'none'],
  ['next week Monday 9 am', '2026-11-16T09:00', 'Next'],
  ['1 Jan', '2027-01-01T23:59'],
  ['5 p.m. tomorrow.', '2026-11-12T17:00'],
  ['31/02', 'none'],
];

for (const [phrase, want, note] of cases) {
  test(`resolveDate: ${phrase}`, () => {
    const r = resolveDate(phrase, NOW);
    if (want === 'unclear' || want === 'none') {
      assert.equal(r.status, want);
      assert.equal(r.due, '');
    } else {
      assert.equal(r.status, 'ok');
      assert.equal(r.due, want);
    }
    if (note) assert.match(r.notes.join(' '), new RegExp(note));
  });
}

test('resolveDate keeps the date words without trailing punctuation', () => {
  assert.equal(resolveDate('Fee due 5 p.m. tomorrow.', NOW).phrase, '5 p.m tomorrow');
  assert.equal(resolveDate('by Friday 5 pm', NOW).phrase, 'Friday 5 pm');
});

test('resolveDate flags a date already in the past', () => {
  const r = resolveDate('10 Nov', NOW);
  assert.equal(r.due, '2026-11-10T23:59');
  assert.match(r.notes.join(' '), /already passed/);
});
