// Stakes-based reminders as local notifications: they fire with the app closed and need no server.
// Every change reschedules the whole set, which keeps them exactly in step with the deadlines.
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { dueLabel, upcomingReminders, type Deadline } from '@/engine/index.ts';

const CHANNEL = 'deadlines';
/** Android caps an app at 500 alarms; the soonest 200 are plenty for a student. */
const MAX_SCHEDULED = 200;
export const remindersSupported = Platform.OS === 'android' || Platform.OS === 'ios';

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function setupReminders() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Deadline reminders',
    description: 'Reminders before a saved deadline is due',
    importance: AndroidImportance.HIGH,
    lightColor: '#7462B5',
  });
}

export async function reminderPermission(): Promise<PermissionState> {
  if (!remindersSupported) return 'unsupported';
  const p = await Notifications.getPermissionsAsync();
  return p.granted ? 'granted' : p.canAskAgain ? 'undetermined' : 'denied';
}

export async function askReminderPermission(): Promise<PermissionState> {
  if (!remindersSupported) return 'unsupported';
  const p = await Notifications.requestPermissionsAsync();
  return p.granted ? 'granted' : p.canAskAgain ? 'undetermined' : 'denied';
}

function body(t: Deadline, at: number) {
  const label = dueLabel(t.due, new Date(at)).text;
  const when = /^(Today|Tomorrow)/.test(label) ? label[0].toLowerCase() + label.slice(1) : label;
  const bits = [`Due ${when}`];
  if (t.submit) bits.push(t.submit);
  if (t.imp === 3) bits.push('Can’t be undone');
  return bits.join(' · ');
}

/** Cancels every scheduled reminder and schedules the upcoming ones again. Returns how many are set. */
export async function rescheduleAll(deadlines: Deadline[], now = new Date()): Promise<number> {
  if (!remindersSupported) return 0;
  if ((await reminderPermission()) !== 'granted') return 0;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const all = deadlines
    .flatMap((t) => upcomingReminders(t, now).map((r) => ({ t, at: r.at })))
    .sort((a, b) => a.at - b.at)
    .slice(0, MAX_SCHEDULED);
  for (const { t, at } of all) {
    await Notifications.scheduleNotificationAsync({
      content: { title: t.title, body: body(t, at), data: { deadlineId: t.id } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
    });
  }
  return all.length;
}

export async function cancelAllReminders() {
  if (remindersSupported) await Notifications.cancelAllScheduledNotificationsAsync();
}
