import { router } from 'expo-router';
import { Linking, View } from 'react-native';
import {
  AREAS,
  dueLabel,
  EFFORT_LABEL,
  fmtAbs,
  fmtDay,
  lastMove,
  STAKES_LABEL,
  toMs,
  upcomingReminders,
  type Deadline,
} from '@/engine/index.ts';
import { useStore } from '@/lib/store.tsx';
import { areaColors, toneColors, usePalette } from '@/lib/theme.ts';
import { Card, Chip, ConfirmLink, LinkButton, Row, T, Tick, useToast } from './kit.tsx';

const CHEERS = ['Done. One less deadline to carry.', 'Handled. That one can’t be missed now.', 'Off the list.', 'Done, and on time.'];

export function Badges({ t }: { t: Deadline }) {
  const p = usePalette();
  const m = lastMove(t);
  return (
    <>
      {m && <Chip text={`Moved from ${fmtDay(m.due)}`} bg={p.butter} fg={p.butterInk} />}
      {t.seen > 1 && <Chip text={`Seen ${t.seen} times`} bg={p.sunk} fg={p.muted} />}
    </>
  );
}

function reminderLine(t: Deadline, now: Date) {
  const up = upcomingReminders(t, now);
  if (!t.due || t.done) return '';
  if (!up.length) return toMs(t.due) > now.getTime() ? 'Reminders sent' : '';
  return `Reminders: ${up.map((r) => (r.at - now.getTime() < 7 * 864e5 ? dueLabel(r.at, now).text : fmtAbs(r.at))).join(' · ')}`;
}

export function useMarkDone() {
  const { setDone } = useStore();
  const toast = useToast();
  return (t: Deadline) => {
    setDone(t.id, true);
    toast({ text: CHEERS[Math.floor(Math.random() * CHEERS.length)], action: { label: 'Undo', onPress: () => setDone(t.id, false) } });
  };
}

/** A pick on Today, or a row in the full list. */
export function DeadlineCard({ t, now, index, why, full }: { t: Deadline; now: Date; index?: number; why?: string; full?: boolean }) {
  const p = usePalette();
  const { snooze, wake, remove } = useStore();
  const toast = useToast();
  const markDone = useMarkDone();
  const dl = dueLabel(t.due, now);
  const tc = toneColors(p, dl.tone);
  const ac = areaColors(p, AREAS.indexOf(t.area));
  const snoozed = t.snoozedUntil > now.getTime();
  const rem = reminderLine(t, now);

  return (
    <Card highlight={index === 0}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        {index != null && <T variant="num">{String(index + 1).padStart(2, '0')}</T>}
        <View style={{ flex: 1, gap: 6 }}>
          <T variant="title">{t.title}</T>
          {why ? <T variant="muted">{why}</T> : null}
          <Row>
            <Chip square text={dl.text} bg={tc.bg} fg={tc.fg} />
            <Chip text={t.area} bg={ac.bg} fg={ac.fg} />
            <Chip text={STAKES_LABEL[t.imp]} bg={p.sunk} fg={p.muted} />
            {!full && <Chip text={EFFORT_LABEL[t.effort]} bg={p.sunk} fg={p.muted} />}
            <Badges t={t} />
          </Row>
          {t.submit ? (
            <T variant="small">
              <T variant="small" style={{ fontWeight: '700' }}>Submit: </T>
              {t.submit}
            </T>
          ) : null}
          {t.link ? <LinkButton label={`Open link (${host(t.link)})`} onPress={() => Linking.openURL(t.link).catch(() => toast('Couldn’t open that link.'))} /> : null}
          {rem ? <T variant="smallMuted">{rem}</T> : null}
          {snoozed && <T variant="smallMuted">Off today’s picks until tomorrow. Still on the radar, still reminded.</T>}
          <Row gap={16}>
            <LinkButton label="Edit" onPress={() => router.push({ pathname: '/capture', params: { mode: 'edit', id: t.id } })} />
            {full && (snoozed ? <LinkButton label="Bring back" onPress={() => wake(t.id)} /> : <LinkButton label="Not today" onPress={() => { snooze(t.id); toast('Off today’s picks. It stays on the radar and you’ll still get its reminders.'); }} />)}
            {full && <ConfirmLink label="Delete" onConfirm={() => remove(t.id)} />}
          </Row>
        </View>
        <Tick label={`Mark done: ${t.title}`} onPress={() => markDone(t)} />
      </View>
    </Card>
  );
}

function host(u: string) {
  const m = /^https?:\/\/([^/?#]+)/i.exec(u);
  return m ? m[1].replace(/^www\./, '') : 'link';
}
