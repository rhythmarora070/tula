// Due date and time. Android uses the system date then time pickers; other platforms type it.
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { fmtAbs, isoLocal, parseLocal, type LocalISO } from '@/engine/index.ts';
import { fonts, usePalette } from '@/lib/theme.ts';
import { Field, LinkButton } from './kit.tsx';

export function DueField({ value, onChange }: { value: LocalISO; onChange: (v: LocalISO) => void }) {
  const p = usePalette();
  const current = parseLocal(value);

  if (Platform.OS === 'android') {
    const pick = () => {
      const start = current ?? defaultDue();
      DateTimePickerAndroid.open({
        value: start,
        mode: 'date',
        onChange: (e, date) => {
          if (e.type !== 'set' || !date) return;
          DateTimePickerAndroid.open({
            value: start,
            mode: 'time',
            is24Hour: false,
            onChange: (e2, time) => {
              if (e2.type !== 'set' || !time) return;
              const d = new Date(date);
              d.setHours(time.getHours(), time.getMinutes(), 0, 0);
              onChange(isoLocal(d));
            },
          });
        },
      });
    };
    return (
      <View style={{ gap: 5 }}>
        <Text style={{ color: p.muted, fontFamily: fonts.bodySemi, fontSize: 12.5 }}>Due</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={current ? `Due ${fmtAbs(current)}. Change` : 'Set a due date'}
          onPress={pick}
          style={{ backgroundColor: p.bg, borderColor: p.line, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 }}
        >
          <Text style={{ color: current ? p.fg : p.muted, fontFamily: fonts.body, fontSize: 15 }}>{current ? fmtAbs(current) : 'Set a date'}</Text>
        </Pressable>
        {current && <LinkButton label="Clear date" onPress={() => onChange('')} />}
      </View>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={{ gap: 5 }}>
        <Text style={{ color: p.muted, fontFamily: fonts.bodySemi, fontSize: 12.5 }}>Due</Text>
        {current ? (
          <DateTimePicker value={current} mode="datetime" onChange={(_e, d) => d && onChange(isoLocal(d))} />
        ) : (
          <LinkButton label="Set a date" onPress={() => onChange(isoLocal(defaultDue()))} />
        )}
      </View>
    );
  }

  return <TypedDue value={value} onChange={onChange} />;
}

/** Web fallback: 'YYYY-MM-DD HH:mm'. */
function TypedDue({ value, onChange }: { value: LocalISO; onChange: (v: LocalISO) => void }) {
  // While typing, show what was typed; otherwise show the saved value.
  const [text, setText] = useState<string | null>(null);
  return (
    <Field
      label="Due (YYYY-MM-DD HH:mm)"
      value={text ?? value.replace('T', ' ')}
      placeholder="2026-11-13 17:00"
      onBlur={() => setText(null)}
      onChangeText={(t) => {
        setText(t);
        const v = t.trim().replace(' ', 'T');
        if (!t.trim()) onChange('');
        else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) && parseLocal(v)) onChange(v);
      }}
    />
  );
}

function defaultDue() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 0, 0);
  return d;
}
