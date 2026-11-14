// One screen for everything that creates or changes a deadline:
// shared from another app, pasted, typed by hand, or edited. Nothing saves without a tap.
import { router, useLocalSearchParams } from 'expo-router';
import { useShareIntentContext, type ShareIntent } from 'expo-share-intent';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { blankDraft, extractLocal, finishItem, summarizeSave, type Deadline, type Draft } from '@/engine/index.ts';
import { BackendError, backendConfigured, extractRemote, type ExtractInput } from '@/lib/backend.ts';
import { askReminderPermission, reminderPermission } from '@/lib/reminders.ts';
import { useStore } from '@/lib/store.tsx';
import { usePalette } from '@/lib/theme.ts';
import { DraftEditor } from '@/ui/DraftEditor.tsx';
import { Button, Field, LinkButton, Row, Screen, Section, T, useToast } from '@/ui/kit.tsx';

type Mode = 'share' | 'paste' | 'quick' | 'edit';
type InputKind = 'text' | 'image' | 'pdf' | 'typed';

interface Form {
  drafts: Draft[];
  selected: boolean[];
  /** what Tula read, to count edits for the pilot's "saved without edits" rate */
  originals: string[];
  input: InputKind;
  ai: boolean;
}

const SAMPLE = 'ML lab record submission by Friday 5 pm, upload on Classroom, format attached.\nhttps://classroom.google.com';
const FILE_TYPES = /^(image\/(jpeg|png|webp|heic|heif)|application\/pdf)$/;

const ERRORS: Record<string, string> = {
  not_signed_in: 'Sign in under You to let Tula read notices with AI.',
  rate_limited: 'Too many notices read today. Try again later, or fill it in yourself.',
  file_too_large: 'That file is too big to read. Try a screenshot of the part with the date.',
  unsupported_file: 'Tula can read screenshots and PDFs, not this kind of file.',
  not_configured: 'AI reading isn’t set up on the server yet.',
};

const key = (d: Draft) => JSON.stringify([d.title.trim(), d.due, d.submit.trim(), d.link.trim(), d.imp]);
const makeForm = (drafts: Draft[], input: InputKind, ai: boolean): Form => ({ drafts, selected: drafts.map(() => true), originals: drafts.map(key), input, ai });

function initialForm(mode: Mode, editing: Deadline | undefined): Form | null {
  if (mode === 'quick') return makeForm([blankDraft()], 'typed', false);
  if (mode === 'edit' && editing) {
    const { title, due, submit, link, imp, effort, area } = editing;
    return makeForm([{ title, due, when: '', flag: '', submit, link, imp, effort, area }], 'typed', false);
  }
  return null;
}

/** Text and the first readable file from a share. */
function fromShare(s: ShareIntent) {
  const f = s.files?.find((x) => FILE_TYPES.test(x.mimeType));
  const text = [s.text, s.webUrl && !s.text?.includes(s.webUrl) ? s.webUrl : ''].filter(Boolean).join('\n');
  return { f, text, unreadable: !f && !text.trim() && !!s.files?.length };
}

export default function Capture() {
  const p = usePalette();
  const params = useLocalSearchParams<{ mode?: string; id?: string }>();
  const mode = (['share', 'paste', 'quick', 'edit'].includes(String(params.mode)) ? params.mode : 'paste') as Mode;
  const { deadlines, saveDrafts, edit, session } = useStore();
  const { shareIntent, hasShareIntent, resetShareIntent } = useShareIntentContext();
  const toast = useToast();
  const editing = mode === 'edit' ? deadlines.find((d) => d.id === params.id) : undefined;
  const canUseAi = backendConfigured && !!session;

  const [text, setText] = useState('');
  const [form, setForm] = useState<Form | null>(() => initialForm(mode, editing));
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [fileLabel, setFileLabel] = useState('');

  const show = (drafts: Draft[], input: InputKind, ai: boolean, msg: string) => {
    setForm(makeForm(drafts, input, ai));
    setStatus(msg);
  };

  const read = async (input: ExtractInput, kind: InputKind) => {
    const now = new Date();
    setBusy(true);
    setStatus(kind === 'text' ? 'Reading…' : 'Reading the file…');
    try {
      if (canUseAi) {
        const items = (await extractRemote(input, now)).map((x) => finishItem(x, now)).filter((d) => d.title);
        if (items.length) return show(items, kind, true, `Found ${items.length}. Check ${items.length === 1 ? 'it' : 'them'}, then save.`);
        if (kind !== 'text') return show([blankDraft()], kind, true, 'No deadline found in that. Fill it in yourself if there is one.');
      }
      if (input.text?.trim()) {
        return show(extractLocal(input.text, now), kind, false, canUseAi ? 'The AI found nothing, so plain code read it. Check each field.' : 'Read without AI. Check each field, then save.');
      }
      show(
        [blankDraft()],
        kind,
        false,
        backendConfigured ? 'Sign in under You and Tula can read screenshots and PDFs. For now, fill it in yourself.' : 'Reading screenshots needs the account set up. For now, fill it in yourself.',
      );
    } catch (e) {
      const why = ERRORS[e instanceof BackendError ? e.code : ''] ?? 'The AI didn’t answer.';
      if (input.text?.trim()) show(extractLocal(input.text, now), kind, false, `${why} Read without AI; check each field.`);
      else show([blankDraft()], kind, false, `${why} Fill it in yourself.`);
    } finally {
      setBusy(false);
    }
  };

  // A share is an event from outside React (the Android share sheet). Take it once, then clear it.
  const handledShare = useRef(false);
  useEffect(() => {
    if (mode !== 'share' || handledShare.current || !hasShareIntent) return;
    handledShare.current = true;
    const { f, text: t, unreadable } = fromShare(shareIntent);
    resetShareIntent();
    /* eslint-disable react-hooks/set-state-in-effect -- loading content handed over by the share sheet */
    if (f) {
      setFileLabel(f.mimeType === 'application/pdf' ? `PDF: ${f.fileName}` : 'Screenshot');
      read({ text: t, file: { uri: f.path, mimeType: f.mimeType } }, f.mimeType === 'application/pdf' ? 'pdf' : 'image');
    } else if (t.trim()) {
      setText(t);
      read({ text: t }, 'text');
    } else if (unreadable) {
      show([blankDraft()], 'typed', false, 'Tula can read text, screenshots and PDFs, not this kind of file. Fill it in yourself.');
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hasShareIntent]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = async () => {
    if (!form) return;
    const { drafts, selected, originals } = form;
    if (mode === 'edit' && editing) {
      edit(editing.id, drafts[0]);
      toast(drafts[0].due && editing.due && drafts[0].due !== editing.due ? 'Updated. The old date is kept in its history.' : 'Updated.');
      return close();
    }
    const keep = drafts.map((d, i) => selected[i] && !!d.title.trim());
    const chosen = drafts.filter((_, i) => keep[i]);
    if (!chosen.length) return setStatus('Tick at least one, and give it a name.');
    const r = saveDrafts(chosen, {
      source: mode === 'share' ? 'share' : mode === 'quick' ? 'quick' : 'paste',
      input: form.input,
      ai: form.ai,
      found: drafts.length,
      edited: drafts.filter((d, i) => keep[i] && key(d) !== originals[i]).length,
    });
    toast(summarizeSave(r));
    close();
    // Ask for notifications when they make sense: right after the first save.
    if ((await reminderPermission()) === 'undetermined') await askReminderPermission();
  };

  const title = mode === 'edit' ? 'Edit deadline' : mode === 'quick' ? 'Add a deadline' : mode === 'share' ? 'Shared to Tula' : 'Paste a notice';
  const many = (form?.drafts.length ?? 0) > 1;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: p.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="voice">{title}</T>
          <LinkButton label="Cancel" onPress={close} />
        </Row>

        {mode === 'edit' && !editing && <T variant="muted">That deadline isn’t here any more.</T>}
        {mode === 'share' && !hasShareIntent && !form && !busy && <T variant="muted">Nothing was shared. Go back and try sharing again.</T>}

        {mode === 'paste' && !form && (
          <Section title="The notice, as you got it">
            <Field
              label="One notice per paragraph"
              multiline
              value={text}
              onChangeText={setText}
              placeholder="e.g. ML lab record submission by Friday 5 pm, upload on Classroom, format attached."
            />
            <Row gap={8}>
              <Button kind="primary" label="Find the deadline" disabled={busy || !text.trim()} onPress={() => read({ text }, 'text')} />
              <Button kind="ghost" label="Try a sample notice" onPress={() => setText(SAMPLE)} />
            </Row>
            <LinkButton label="Type it in yourself instead" onPress={() => show([blankDraft()], 'typed', false, '')} />
            <T variant="smallMuted">Faster: in WhatsApp, long-press a message, tap Share, then Tula. Screenshots and PDFs work too.</T>
          </Section>
        )}

        {fileLabel ? <T variant="smallMuted">From: {fileLabel}. The file is read once and not kept.</T> : null}
        {busy ? (
          <Row gap={10}>
            <ActivityIndicator color={p.accentText} />
            <T variant="muted">{status}</T>
          </Row>
        ) : status ? (
          <T variant="muted">{status}</T>
        ) : null}

        {form && (
          <View style={{ gap: 12 }}>
            {form.drafts.map((d, i) => (
              <DraftEditor
                key={i}
                draft={d}
                onChange={(nd) => setForm((f) => f && { ...f, drafts: f.drafts.map((x, j) => (j === i ? nd : x)) })}
                existing={mode === 'edit' ? undefined : deadlines}
                selected={many ? form.selected[i] : undefined}
                onToggle={many ? () => setForm((f) => f && { ...f, selected: f.selected.map((v, j) => (j === i ? !v : v)) }) : undefined}
                showKind={form.input === 'typed'}
              />
            ))}
            <Row gap={8} style={{ justifyContent: 'flex-end' }}>
              {mode === 'paste' && (
                <Button
                  kind="ghost"
                  label="Start over"
                  onPress={() => {
                    setForm(null);
                    setStatus('');
                  }}
                />
              )}
              <Button kind="primary" label={mode === 'edit' ? 'Save changes' : 'Save'} onPress={save} />
            </Row>
            {mode !== 'edit' && <T variant="smallMuted">Nothing is saved until you tap Save.</T>}
          </View>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
