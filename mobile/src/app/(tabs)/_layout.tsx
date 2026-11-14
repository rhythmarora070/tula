import { router, usePathname } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { Pressable, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, usePalette } from '@/lib/theme.ts';

function Dot({ color, focused }: { color: ColorValue; focused: boolean }) {
  return <View style={{ width: focused ? 18 : 8, height: 8, borderRadius: 4, backgroundColor: color }} />;
}

export default function TabsLayout() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: p.accentText,
          tabBarInactiveTintColor: p.muted,
          tabBarStyle: { backgroundColor: p.surface, borderTopColor: p.line },
          tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 12 },
          sceneStyle: { backgroundColor: p.bg },
          tabBarIcon: ({ color, focused }) => <Dot color={color} focused={focused} />,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Today' }} />
        <Tabs.Screen name="deadlines" options={{ title: 'Deadlines' }} />
        <Tabs.Screen name="settings" options={{ title: 'You' }} />
      </Tabs>
      {pathname !== '/settings' && <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add a deadline"
        onPress={() => router.push({ pathname: '/capture', params: { mode: 'paste' } })}
        style={({ pressed }) => ({
          position: 'absolute',
          right: 18,
          bottom: insets.bottom + 68,
          backgroundColor: p.accent,
          borderRadius: 999,
          paddingHorizontal: 20,
          paddingVertical: 14,
          opacity: pressed ? 0.8 : 1,
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        })}
      >
        <Text style={{ color: p.accentInk, fontFamily: fonts.bodyBold, fontSize: 15 }}>+ Add</Text>
      </Pressable>}
    </View>
  );
}
