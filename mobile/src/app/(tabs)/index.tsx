import { router } from 'expo-router';
import { View } from 'react-native';
import { dueLabel, fmtLong, fmtMin, planDay, radar, reason, summary, TIME_LABELS, type TimeToday } from '@/engine/index.ts';
import { backendConfigured } from '@/lib/backend.ts';
import { useStore } from '@/lib/store.tsx';
import { toneColors, usePalette } from '@/lib/theme.ts';
import { Brand, useNow } from '@/ui/brand.tsx';
import { Badges, DeadlineCard, useMarkDone } from '@/ui/DeadlineCard.tsx';
import { Button, Card, Chip, Empty, LinkButton, Row, Screen, Section, Segmented, T } from '@/ui/kit.tsx';

export default function Today() {
  const p = usePalette();
  const now = useNow();
  const { loaded, deadlines, time, setTime, session } = useStore();
  const markDone = useMarkDone();
  const plan = planDay(deadlines, time, now);
  const soon = radar(deadlines, now);
  const hr = now.getHours();
  const greet = hr < 5 ? 'Still up?' : hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Brand />
        <T variant="smallMuted">
          {greet} · {fmtLong(now)}
        </T>
      </View>

      <Section title="What's due">
        <Card>
          <T variant="voice">{loaded ? summary(deadlines, now) : ' '}</T>
          {deadlines.some((d) => !d.done) && (
            <View style={{ gap: 6 }}>
              <T variant="small" style={{ fontWeight: '700' }}>
                Time today? <T variant="smallMuted">optional</T>
              </T>
              <Segmented<TimeToday> columns={2} options={TIME_LABELS.map((l, i) => ({ label: l, value: (i + 1) as TimeToday }))} value={time || null} onChange={setTime} />
            </View>
          )}
        </Card>
      </Section>

      {loaded && backendConfigured && !session && (
        <Card style={{ backgroundColor: p.accentSoft, borderColor: p.accentSoft }}>
          <T>Sign in to back up your deadlines and let Tula read screenshots and PDFs.</T>
          <Button kind="primary" small label="Sign in with your email" onPress={() => router.navigate('/settings')} />
        </Card>
      )}

      <Section title="Today, just these">
        {!loaded ? null : !deadlines.length ? (
          <Empty>
            <T variant="voice">No deadlines here yet.</T>
            <T variant="muted">
              In WhatsApp, long-press a notice, tap Share, then Tula. Or tap + Add to paste one. Tula keeps the date, what to submit and the link, and reminds you in time for what’s at stake.
            </T>
            <Button kind="primary" label="Add your first deadline" onPress={() => router.push({ pathname: '/capture', params: { mode: 'paste' } })} />
          </Empty>
        ) : !plan.picks.length ? (
          <Empty>
            <T variant="voice">Nothing needs you today.</T>
            <T variant="muted">Everything open is either done or set aside until tomorrow.</T>
          </Empty>
        ) : (
          <View style={{ gap: 10 }}>
            {plan.picks.map((o, i) => (
              <DeadlineCard key={o.t.id} t={o.t} now={now} index={i} why={reason(o, plan.short)} />
            ))}
            <T variant="smallMuted">
              About {fmtMin(plan.mins)} of work.
              {plan.overflow ? ` ${plan.overflow} more due within a day. ${plan.overflow > 1 ? 'They’re' : 'It’s'} on the radar below; finish these first.` : ''}
            </T>
          </View>
        )}
      </Section>

      <Section title="Deadline radar · next 72 hours">
        <Card>
          {!soon.length ? (
            <T variant="muted">Clear skies. Nothing due in the next three days.</T>
          ) : (
            soon.map(({ t }, i) => {
              const dl = dueLabel(t.due, now);
              const tc = toneColors(p, dl.tone);
              return (
                <View key={t.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingTop: i ? 10 : 0, borderTopWidth: i ? 1 : 0, borderTopColor: p.line }}>
                  <Chip square text={dl.text} bg={tc.bg} fg={tc.fg} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <T>{t.title}</T>
                    {(t.history.length > 0 || t.seen > 1) && (
                      <Row>
                        <Badges t={t} />
                      </Row>
                    )}
                  </View>
                  <LinkButton label="Done" onPress={() => markDone(t)} />
                </View>
              );
            })
          )}
          {soon.some(({ t }) => t.snoozedUntil > now.getTime()) && (
            <T variant="smallMuted">“Not today” hides a deadline from today’s picks, never from here.</T>
          )}
        </Card>
      </Section>
    </Screen>
  );
}
