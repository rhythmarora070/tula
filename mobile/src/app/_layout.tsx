import { NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans';
import { Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import * as Notifications from 'expo-notifications';
import { router, Stack, usePathname, type ErrorBoundaryProps } from 'expo-router';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { reportError } from '@/lib/backend.ts';
import { StoreProvider } from '@/lib/store.tsx';
import { usePalette } from '@/lib/theme.ts';
import { ToastProvider } from '@/ui/kit.tsx';

/**
 * Uncaught JavaScript errors outside rendering (timers, event handlers) also get reported,
 * then passed on to React Native's own handler. A fatal one may close the app before the
 * report is sent; render errors are caught by ErrorBoundary below instead.
 */
type GlobalHandler = (error: Error, isFatal?: boolean) => void;
const errorUtils = (globalThis as { ErrorUtils?: { getGlobalHandler(): GlobalHandler; setGlobalHandler(h: GlobalHandler): void } }).ErrorUtils;
if (Platform.OS !== 'web' && errorUtils) {
  const previous = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, isFatal) => {
    reportError('global', error);
    previous(error, isFatal);
  });
}

/** Opens the capture screen whenever something is shared to Tula while the app is running. */
function ShareWatcher() {
  const { hasShareIntent } = useShareIntentContext();
  const pathname = usePathname();
  useEffect(() => {
    if (hasShareIntent && pathname !== '/capture') router.push({ pathname: '/capture', params: { mode: 'share' } });
  }, [hasShareIntent, pathname]);
  return null;
}

/** Tapping a reminder opens Today. */
function ReminderTaps() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener(() => router.navigate('/'));
    return () => sub.remove();
  }, []);
  return null;
}

/**
 * Shown instead of a blank screen if anything below the root throws while rendering.
 * Uses system fonts on purpose: it must work even if the app's fonts failed to load.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const p = usePalette();
  useEffect(() => {
    reportError('screen', error);
  }, [error]);
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, justifyContent: 'center', padding: 24, gap: 14 }}>
      <Text style={{ color: p.fg, fontSize: 22, fontWeight: '700' }}>Something went wrong</Text>
      <Text style={{ color: p.fg, fontSize: 16, lineHeight: 23 }}>
        Your deadlines are safe on this phone, and your reminders still work. Try again, and if it keeps happening, close and reopen Tula.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => retry()}
        style={({ pressed }) => ({ alignSelf: 'flex-start', backgroundColor: p.accent, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11, opacity: pressed ? 0.8 : 1 })}
      >
        <Text style={{ color: p.accentInk, fontSize: 15, fontWeight: '700' }}>Try again</Text>
      </Pressable>
      <Text selectable style={{ color: p.muted, fontSize: 12.5 }}>
        Details for the Tula team: {String(error?.message ?? error).slice(0, 300)}
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const p = usePalette();
  const [fontsLoaded] = useFonts({ Quicksand_600SemiBold, Quicksand_700Bold, NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold });
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: p.bg }} />;
  return (
    <ShareIntentProvider>
      <SafeAreaProvider>
        <StoreProvider>
          <ToastProvider>
            <StatusBar style={p.dark ? 'light' : 'dark'} />
            <ShareWatcher />
            <ReminderTaps />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: p.bg } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="capture" options={{ presentation: 'modal' }} />
            </Stack>
          </ToastProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </ShareIntentProvider>
  );
}
