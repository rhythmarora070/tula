import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { AppState, Linking, View } from 'react-native';
import { BackendError, backendConfigured, sendCode, signOut, verifyCode } from '@/lib/backend.ts';
import { askReminderPermission, reminderPermission, type PermissionState } from '@/lib/reminders.ts';
import { useStore, type SyncState } from '@/lib/store.tsx';
import { Button, Card, Field, LinkButton, Row, Screen, Section, T, useToast } from '@/ui/kit.tsx';

/** Set in app.json (expo.extra.privacyUrl) once the site is live. */
const PRIVACY_URL: string = Constants.expoConfig?.extra?.privacyUrl ?? '';

const SYNC: Record<SyncState, string> = {
  local: 'Saved on this phone.',
  'signed-out': 'Saved on this phone. Sign in to back up and to let Tula read screenshots.',
  syncing: 'Backing up…',
  synced: 'Backed up to your account.',
  offline: 'Couldn’t reach your account. Saved on this phone; it will back up when you’re online.',
};

function Account() {
  const { session, sync } = useStore();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!backendConfigured) {
    return (
      <Card>
        <T>This build has no account set up.</T>
        <T variant="muted">Everything stays on this phone, and notices are read by plain code instead of AI. Screenshots and PDFs need the account.</T>
      </Card>
    );
  }
  if (session) {
    return (
      <Card>
        <T>Signed in as {session.user.email}</T>
        <T variant="muted">{SYNC[sync]}</T>
        <LinkButton label="Sign out" onPress={() => signOut()} />
      </Card>
    );
  }
  const run = async (fn: () => Promise<void>, fail: string) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast(e instanceof BackendError && e.code === 'rate_limited' ? 'Too many tries. Wait a minute and try again.' : fail);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <T variant="muted">{SYNC[sync]} We send a 6-digit code to your email; no password.</T>
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@college.edu" />
      {sent && <Field label="6-digit code" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={8} autoComplete="one-time-code" />}
      <Row gap={8}>
        {!sent ? (
          <Button kind="primary" label="Send code" disabled={busy || !/\S+@\S+\.\S+/.test(email)} onPress={() => run(async () => { await sendCode(email); setSent(true); }, 'Couldn’t send the code. Check the email and try again.')} />
        ) : (
          <>
            <Button kind="primary" label="Sign in" disabled={busy || code.trim().length < 6} onPress={() => run(() => verifyCode(email, code), 'That code didn’t work. Check it, or send a new one.')} />
            <Button kind="ghost" label="Send a new code" disabled={busy} onPress={() => run(() => sendCode(email), 'Couldn’t send the code.')} />
          </>
        )}
      </Row>
    </Card>
  );
}

function Reminders() {
  const [perm, setPerm] = useState<PermissionState>('undetermined');
  useEffect(() => {
    const check = () => reminderPermission().then(setPerm).catch(() => {});
    check();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => sub.remove();
  }, []);
  return (
    <Card>
      <T variant="muted">High stakes: 3 days before, 1 day before and 9 am on the day. Everything else: 1 day and 3 hours before. They arrive even when Tula is closed.</T>
      {perm === 'granted' && <T>Reminders are on.</T>}
      {perm === 'undetermined' && <Button kind="primary" label="Turn on reminders" onPress={() => askReminderPermission().then(setPerm)} />}
      {perm === 'denied' && (
        <>
          <T>Notifications are off for Tula, so reminders can’t reach you.</T>
          <Button label="Open settings" onPress={() => Linking.openSettings()} />
        </>
      )}
      {perm === 'unsupported' && <T>Reminders work in the Android app, not in this preview.</T>}
      <T variant="smallMuted">If reminders arrive late, set Tula’s battery use to “Unrestricted” in Android settings.</T>
    </Card>
  );
}

function DeleteAll() {
  const { deleteEverything, session } = useStore();
  const toast = useToast();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <Card>
      <T variant="muted">
        Tula keeps only the fields you confirm, never the message or screenshot you shared, and it never reads your chats. With AI reading on, a notice is sent once to read the deadline, then discarded.
      </T>
      {PRIVACY_URL ? (
        <LinkButton label="Read the privacy policy" onPress={() => Linking.openURL(PRIVACY_URL).catch(() => toast('Couldn’t open the privacy policy.'))} />
      ) : null}
      <View style={{ gap: 6 }}>
        <T>Delete my data</T>
        <T variant="smallMuted">{session ? 'Removes every deadline from this phone and deletes your account.' : 'Removes every deadline from this phone.'}</T>
        <Button
          kind="danger"
          disabled={busy}
          label={armed ? 'Tap again to delete everything' : 'Delete everything'}
          onPress={async () => {
            if (!armed) return setArmed(true);
            setArmed(false);
            setBusy(true);
            const ok = await deleteEverything();
            setBusy(false);
            toast(ok ? 'Deleted. Nothing of yours is stored here now.' : 'Deleted on this phone. Couldn’t reach your account, so sign in and try again when you’re online.');
          }}
        />
      </View>
    </Card>
  );
}

export default function Settings() {
  return (
    <Screen>
      <T variant="voice">You</T>
      <Section title="Account">
        <Account />
      </Section>
      <Section title="Reminders">
        <Reminders />
      </Section>
      <Section title="Your data">
        <DeleteAll />
      </Section>
      <T variant="smallMuted">Tula {Constants.expoConfig?.version ?? ''} · early access · for college students 18+</T>
    </Screen>
  );
}
