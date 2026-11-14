// The same pastel tokens as the web prototype and landing page.
import { useColorScheme } from 'react-native';
import type { Tone } from '@/engine/format.ts';

const light = {
  bg: '#F6F3FA', surface: '#FFFFFF', sunk: '#EEE9F5', line: '#E3DCEE',
  fg: '#2A2535', muted: '#6F6880',
  accent: '#C9BBF0', accentInk: '#2A2535', accentText: '#7462B5', accentSoft: '#EDE7FB',
  peach: '#FFE3D3', peachInk: '#9A5A33', mint: '#D6F1E3', mintInk: '#2F7350',
  sky: '#DCEBFB', skyInk: '#3B6996', rose: '#FBDDE3', roseInk: '#A6435A', butter: '#FBEFC8', butterInk: '#8A6A12',
  ok: '#2F7350', shadow: 'rgba(80,60,120,0.10)',
};
export type Palette = typeof light;

const dark: Palette = {
  bg: '#1B1923', surface: '#24212E', sunk: '#2D2939', line: '#3A3549',
  fg: '#EFEBF7', muted: '#A9A2BA',
  accent: '#B9A8EC', accentInk: '#1B1923', accentText: '#C9BBF5', accentSoft: '#363052',
  peach: '#4A3329', peachInk: '#FFC9AC', mint: '#243F33', mintInk: '#9EDDBC',
  sky: '#243548', skyInk: '#A9CDF2', rose: '#472A33', roseInk: '#F3A8B8', butter: '#433B22', butterInk: '#EBD38A',
  ok: '#9EDDBC', shadow: 'rgba(0,0,0,0.35)',
};

export const fonts = {
  display: 'Quicksand_600SemiBold',
  displayBold: 'Quicksand_700Bold',
  body: 'NunitoSans_400Regular',
  bodySemi: 'NunitoSans_600SemiBold',
  bodyBold: 'NunitoSans_700Bold',
};

export function usePalette(): Palette & { dark: boolean } {
  const scheme = useColorScheme();
  return scheme === 'dark' ? { ...dark, dark: true } : { ...light, dark: false };
}

export function toneColors(p: Palette, tone: Tone) {
  if (tone === 'crit') return { bg: p.rose, fg: p.roseInk };
  if (tone === 'warn') return { bg: p.peach, fg: p.peachInk };
  return { bg: p.sunk, fg: p.muted };
}

/** One colour pair per kind of deadline, in the order of AREAS. */
export function areaColors(p: Palette, i: number) {
  return [
    { bg: p.accentSoft, fg: p.accentText },
    { bg: p.sky, fg: p.skyInk },
    { bg: p.peach, fg: p.peachInk },
    { bg: p.butter, fg: p.butterInk },
    { bg: p.mint, fg: p.mintInk },
    { bg: p.rose, fg: p.roseInk },
  ][Math.max(0, i) % 6];
}
