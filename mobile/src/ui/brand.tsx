import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { usePalette } from '@/lib/theme.ts';
import { T } from './kit.tsx';

/** Re-renders every minute so "Today 5:00 PM" and the picks stay current. */
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function Brand() {
  const p = usePalette();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Circle cx={15} cy={20} r={11} fill={p.accent} />
        <Circle cx={25} cy={20} r={11} fill={p.peach} opacity={0.9} />
        <Circle cx={20} cy={20} r={3} fill={p.accentText} />
      </Svg>
      <View>
        <T variant="brand">Tula</T>
        <T variant="smallMuted">Every deadline, sorted by what’s at stake.</T>
      </View>
    </View>
  );
}
