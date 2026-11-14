// Small set of building blocks in the Tula style: one calm column, soft cards, pill chips.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, usePalette } from '@/lib/theme.ts';

export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120, paddingHorizontal: 16, gap: 24, maxWidth: 720, width: '100%', alignSelf: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

export function T({ children, style, variant = 'body', numberOfLines }: { children: ReactNode; style?: StyleProp<TextStyle>; variant?: 'body' | 'muted' | 'small' | 'smallMuted' | 'strong' | 'title' | 'voice' | 'brand' | 'label' | 'num'; numberOfLines?: number }) {
  const p = usePalette();
  const v: Record<string, TextStyle> = {
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: p.fg },
    muted: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: p.muted },
    small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: p.fg },
    smallMuted: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: p.muted },
    strong: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 22, color: p.fg },
    title: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22, color: p.fg },
    voice: { fontFamily: fonts.display, fontSize: 21, lineHeight: 27, color: p.fg },
    brand: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 34, color: p.fg },
    label: { fontFamily: fonts.displayBold, fontSize: 12.5, letterSpacing: 1, textTransform: 'uppercase', color: p.muted },
    num: { fontFamily: fonts.display, fontSize: 28, lineHeight: 30, color: p.accentText },
  };
  return (
    <Text style={[v[variant], style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Section({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <T variant="label">{title}</T>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style, highlight }: { children: ReactNode; style?: StyleProp<ViewStyle>; highlight?: boolean }) {
  const p = usePalette();
  return (
    <View
      style={[
        { backgroundColor: p.surface, borderColor: highlight ? p.accent : p.line, borderWidth: highlight ? 2 : 1, borderRadius: 18, padding: highlight ? 15 : 16, gap: 10 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Chip({ text, bg, fg, square }: { text: string; bg: string; fg: string; square?: boolean }) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: square ? 6 : 999, paddingHorizontal: square ? 8 : 9, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: fg, fontFamily: fonts.bodyBold, fontSize: 12 }}>{text}</Text>
    </View>
  );
}

export function Row({ children, gap = 6, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap, alignItems: 'center' }, style]}>{children}</View>;
}

export function Button({ label, onPress, kind = 'default', disabled, small }: { label: string; onPress: () => void; kind?: 'default' | 'primary' | 'ghost' | 'danger'; disabled?: boolean; small?: boolean }) {
  const p = usePalette();
  const bg = kind === 'primary' ? p.accent : kind === 'ghost' ? 'transparent' : p.surface;
  const border = kind === 'primary' ? p.accent : p.line;
  const fg = kind === 'primary' ? p.accentInk : kind === 'danger' ? p.roseInk : p.fg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: small ? 12 : 16,
        paddingVertical: small ? 7 : 11,
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        alignSelf: 'flex-start',
      })}
    >
      <Text style={{ color: fg, fontFamily: fonts.bodyBold, fontSize: small ? 13 : 15 }}>{label}</Text>
    </Pressable>
  );
}

export function LinkButton({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  const p = usePalette();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingVertical: 4 })}>
      <Text style={{ color: danger ? p.roseInk : p.accentText, fontFamily: fonts.bodyBold, fontSize: 13.5 }}>{label}</Text>
    </Pressable>
  );
}

/** Two-tap destructive action: the first tap arms it for 3 seconds. */
export function ConfirmLink({ label, armedLabel = 'Sure?', onConfirm }: { label: string; armedLabel?: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);
  return <LinkButton danger label={armed ? armedLabel : label} onPress={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))} />;
}

export function Segmented<V extends string | number>({ options, value, onChange, columns }: { options: { label: string; value: V }[]; value: V | null; onChange: (v: V) => void; columns?: number }) {
  const p = usePalette();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={{
              flexGrow: 1,
              flexBasis: columns ? `${100 / columns - 3}%` : undefined,
              backgroundColor: on ? p.accent : p.bg,
              borderColor: on ? p.accent : p.line,
              borderWidth: 1,
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: on ? p.accentInk : p.fg, fontFamily: fonts.bodySemi, fontSize: 13 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** `half`: sits side by side in a Row on wide screens, stacks on phones. */
export function Field({ label, half, ...props }: { label: string; half?: boolean } & TextInputProps) {
  const p = usePalette();
  return (
    <View style={[{ gap: 5 }, half && { flexGrow: 1, flexBasis: 220 }]}>
      <Text style={{ color: p.muted, fontFamily: fonts.bodySemi, fontSize: 12.5 }}>{label}</Text>
      <TextInput
        placeholderTextColor={p.muted}
        accessibilityLabel={label}
        {...props}
        style={[
          { backgroundColor: p.bg, borderColor: p.line, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: p.fg, fontFamily: fonts.body, fontSize: 15 },
          props.multiline ? { minHeight: 96, textAlignVertical: 'top' } : null,
          props.style,
        ]}
      />
    </View>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  const p = usePalette();
  return <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: p.line, borderRadius: 18, padding: 20, gap: 10 }}>{children}</View>;
}

export function Tick({ onPress, label }: { onPress: () => void; label: string }) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: pressed ? p.ok : p.line, alignItems: 'center', justifyContent: 'center' })}
    >
      {({ pressed }) => <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: pressed ? p.ok : 'transparent' }} />}
    </Pressable>
  );
}

/* ---------- toast ---------- */
interface ToastMsg {
  text: string;
  action?: { label: string; onPress: () => void };
}
const ToastCtx = createContext<(m: ToastMsg | string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: ToastMsg | string) => {
    const next = typeof m === 'string' ? { text: m } : m;
    setMsg(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), next.action ? 5000 : 3500);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.toast, { bottom: insets.bottom + 72, backgroundColor: p.surface, borderColor: p.line, shadowColor: '#000' }]}
        >
          <Text style={{ flex: 1, color: p.fg, fontFamily: fonts.body, fontSize: 14.5 }}>{msg.text}</Text>
          {msg.action && (
            <Button
              small
              label={msg.action.label}
              onPress={() => {
                msg.action?.onPress();
                setMsg(null);
              }}
            />
          )}
        </View>
      )}
    </ToastCtx.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxWidth: 520,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 6,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});
