import { useState } from 'react';
import { View } from 'react-native';
import { fmtDate, hoursUntil, movedSince, parseLocal, type Deadline } from '@/engine/index.ts';
import { useStore } from '@/lib/store.tsx';
import { usePalette } from '@/lib/theme.ts';
import { useNow } from '@/ui/brand.tsx';
import { DeadlineCard } from '@/ui/DeadlineCard.tsx';
import { Card, Chip, Empty, LinkButton, Screen, Section, T } from '@/ui/kit.tsx';

/** Dated first, soonest first; undated at the end, newest first. */
const byDue = (a: Deadline, b: Deadline) => {
  const x = parseLocal(a.due)?.getTime() ?? Infinity;
  const y = parseLocal(b.due)?.getTime() ?? Infinity;
  return x - y || b.created - a.created;
};

export default function Deadlines() {
  const p = usePalette();
  const now = useNow();
  const { deadlines, setDone } = useStore();
  const [showDone, setShowDone] = useState(false);
  const open = deadlines.filter((d) => !d.done).sort(byDue);
  const done = deadlines.filter((d) => d.done).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));
  const week = now.getTime() - 7 * 864e5;
  const stats = [
    { n: done.filter((d) => (d.doneAt ?? 0) >= week).length, l: 'finished this week' },
    { n: deadlines.filter((d) => d.created >= week).length, l: 'saved this week' },
    { n: open.filter((d) => { const h = hoursUntil(d.due, now); return h != null && h >= 0 && h <= 168; }).length, l: 'due in 7 days' },
    { n: deadlines.filter((d) => movedSince(d, week)).length, l: 'dates moved' },
  ];

  return (
    <Screen>
      <Section title="Done and coming up">
        <Card style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 0 }}>
          {stats.map((s) => (
            <View key={s.l} style={{ width: '50%', paddingVertical: 6 }}>
              <T variant="num" style={{ color: p.fg }}>{s.n}</T>
              <T variant="smallMuted">{s.l}</T>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Everything open" right={open.length ? <T variant="smallMuted">{open.length} open</T> : undefined}>
        {open.length ? (
          <View style={{ gap: 10 }}>
            {open.map((t) => (
              <DeadlineCard key={t.id} t={t} now={now} full />
            ))}
          </View>
        ) : (
          <Empty>
            <T variant="muted">Nothing open. Share a notice to Tula, or tap + Add.</T>
          </Empty>
        )}
      </Section>

      {done.length > 0 && (
        <Section title={`Done (${done.length})`} right={<LinkButton label={showDone ? 'Hide' : 'Show'} onPress={() => setShowDone((v) => !v)} />}>
          {showDone && (
            <Card>
              {done.slice(0, 50).map((t, i) => (
                <View key={t.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingTop: i ? 10 : 0, borderTopWidth: i ? 1 : 0, borderTopColor: p.line }}>
                  <Chip square text={t.doneAt ? fmtDate(new Date(t.doneAt)) : 'Done'} bg={p.sunk} fg={p.muted} />
                  <T variant="muted" style={{ flex: 1, textDecorationLine: 'line-through' }}>
                    {t.title}
                  </T>
                  <LinkButton label="Undo" onPress={() => setDone(t.id, false)} />
                </View>
              ))}
            </Card>
          )}
        </Section>
      )}
    </Screen>
  );
}
