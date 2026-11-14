// The confirm card: every field editable, the date words shown beside the date,
// and a note when this looks like a deadline that's already saved.
import { Pressable, Text, View } from 'react-native';
import { AREAS, fmtAbs, findDup, STAKES_LABEL, type Area, type Deadline, type Draft, type Effort, type Stakes } from '@/engine/index.ts';
import { fonts, usePalette } from '@/lib/theme.ts';
import { DueField } from './DueField.tsx';
import { Card, Field, Row, Segmented, T } from './kit.tsx';

interface Props {
  draft: Draft;
  onChange: (d: Draft) => void;
  /** saved deadlines, for the duplicate note; omit when editing */
  existing?: Deadline[];
  /** shown on confirm cards with several items */
  selected?: boolean;
  onToggle?: () => void;
  showKind?: boolean;
}

export function DraftEditor({ draft: x, onChange, existing, selected, onToggle, showKind }: Props) {
  const p = usePalette();
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => onChange({ ...x, [k]: v });
  const dup = existing ? findDup(x, existing) : null;
  const dim = selected === false;

  return (
    <Card style={{ backgroundColor: p.bg, opacity: dim ? 0.6 : 1 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
        {onToggle && (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!selected }}
            accessibilityLabel="Save this one"
            onPress={onToggle}
            hitSlop={8}
            style={{ width: 24, height: 24, marginBottom: 10, borderRadius: 6, borderWidth: 2, borderColor: selected ? p.accentText : p.line, backgroundColor: selected ? p.accentText : 'transparent', alignItems: 'center', justifyContent: 'center' }}
          >
            {selected && <Text style={{ color: p.surface, fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 16 }}>✓</Text>}
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Field label="What is it?" value={x.title} onChangeText={(v) => set('title', v)} maxLength={140} placeholder="Submit ML lab record" />
        </View>
      </View>

      <DueField value={x.due} onChange={(v) => set('due', v)} />
      {(x.when || x.flag || !x.due) && (
        <T variant="smallMuted">
          {x.when ? `Date read from “${x.when}”. ` : ''}
          {x.flag ? <Text style={{ color: p.roseInk, fontFamily: fonts.bodySemi }}>{x.flag}</Text> : null}
          {!x.when && !x.flag && !x.due ? <Text style={{ color: p.roseInk, fontFamily: fonts.bodySemi }}>No date found. Set one if there is a deadline.</Text> : null}
        </T>
      )}

      <View style={{ gap: 5 }}>
        <T variant="smallMuted" style={{ fontFamily: fonts.bodySemi }}>If it slips…</T>
        <Segmented<Stakes> options={[1, 2, 3].map((v) => ({ label: STAKES_LABEL[v as Stakes], value: v as Stakes }))} value={x.imp} onChange={(v) => set('imp', v)} />
      </View>

      <Row gap={10} style={{ alignItems: 'flex-start' }}>
        <Field half label="What to submit, and where" value={x.submit} onChangeText={(v) => set('submit', v)} maxLength={120} placeholder="Upload PDF on Classroom" />
        <Field half label="Link" value={x.link} onChangeText={(v) => set('link', v)} maxLength={300} placeholder="https://" autoCapitalize="none" keyboardType="url" autoCorrect={false} />
      </Row>

      {showKind && (
        <>
          <View style={{ gap: 5 }}>
            <T variant="smallMuted" style={{ fontFamily: fonts.bodySemi }}>Kind</T>
            <Segmented<Area> options={AREAS.map((a) => ({ label: a, value: a }))} value={x.area} onChange={(v) => set('area', v)} />
          </View>
          <View style={{ gap: 5 }}>
            <T variant="smallMuted" style={{ fontFamily: fonts.bodySemi }}>Size</T>
            <Segmented<Effort>
              options={[
                { label: 'Under 30 min', value: 'S' },
                { label: 'About an hour', value: 'M' },
                { label: '2+ hours', value: 'L' },
              ]}
              value={x.effort}
              onChange={(v) => set('effort', v)}
            />
          </View>
        </>
      )}

      {dup && (
        <View style={{ backgroundColor: p.butter, borderRadius: 10, padding: 12, gap: 8 }}>
          {dup.kind === 'same' ? (
            <T variant="small" style={{ color: p.butterInk }}>
              Already saved as “{dup.deadline.title}”. Saving keeps one record and counts it as seen again.
            </T>
          ) : (
            <>
              <T variant="small" style={{ color: p.butterInk }}>
                Looks like “{dup.deadline.title}”, {dup.deadline.due ? `saved as due ${fmtAbs(dup.deadline.due)}` : 'saved without a date'}. Has the deadline moved?
              </T>
              <Segmented<'update' | 'new'>
                options={[
                  { label: 'Yes, update it', value: 'update' },
                  { label: 'No, save separately', value: 'new' },
                ]}
                value={x.dupAct ?? 'update'}
                onChange={(v) => set('dupAct', v)}
              />
            </>
          )}
        </View>
      )}
    </Card>
  );
}
