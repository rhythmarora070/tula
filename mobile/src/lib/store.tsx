// Local-first state: deadlines live on the phone (AsyncStorage). Reminders are rescheduled
// on every change, and if the student is signed in, changes are backed up to Supabase.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  applyDrafts,
  applyEdit,
  dayKey,
  mergeDeadlines,
  type Deadline,
  type Draft,
  type SaveResult,
  type TimeToday,
} from '@/engine/index.ts';
import { cancelAllReminders, rescheduleAll, setupReminders } from './reminders.ts';
import {
  backendConfigured,
  deleteAccount,
  logCapture,
  pullDeadlines,
  pushDeadlines,
  supabase,
  type CaptureEvent,
  type Session,
} from './backend.ts';

const KEY = 'tula-state-v1';

interface Persisted {
  v: 1;
  deadlines: Deadline[];
  /** "How much time do you have today?" for one day only */
  time: { day: string; value: TimeToday };
  /** deleted here, not yet deleted on the account */
  deleted: string[];
}

const fresh = (): Persisted => ({ v: 1, deadlines: [], time: { day: '', value: 0 }, deleted: [] });

export type SyncState = 'local' | 'signed-out' | 'syncing' | 'synced' | 'offline';

interface Store {
  loaded: boolean;
  deadlines: Deadline[];
  time: TimeToday;
  session: Session | null;
  sync: SyncState;
  /** saves confirmed drafts and records the capture for pilot metrics */
  saveDrafts: (drafts: Draft[], ev: Omit<CaptureEvent, 'saved' | 'merged'>) => SaveResult;
  edit: (id: string, d: Draft) => void;
  setDone: (id: string, done: boolean) => void;
  snooze: (id: string) => void;
  wake: (id: string) => void;
  remove: (id: string) => void;
  setTime: (v: TimeToday) => void;
  /** wipes this phone, cancels reminders, and deletes the account if signed in. False if the account couldn't be reached. */
  deleteEverything: () => Promise<boolean>;
}

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(fresh);
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  /** result of the last backup for this account */
  const [remote, setRemote] = useState<{ uid: string; status: 'synced' | 'offline' } | null>(null);
  const stateRef = useRef(state);
  const pushed = useRef(new Map<string, number>());
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // load
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && Array.isArray(p.deadlines)) {
            const next = { ...fresh(), ...p };
            stateRef.current = next;
            setState(next);
          }
        }
      } catch {}
      setLoaded(true);
      setupReminders().catch(() => {});
    })();
  }, []);

  // persist + reminders, debounced
  useEffect(() => {
    if (!loaded) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
      rescheduleAll(state.deadlines).catch(() => {});
    }, 400);
    return () => clearTimeout(id);
  }, [state, loaded]);

  // session
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  const sync: SyncState = !backendConfigured ? 'local' : !userId ? 'signed-out' : remote?.uid === userId ? remote.status : 'syncing';
  const initialSyncDone = !!userId && remote?.uid === userId;

  // on sign-in: pull, merge (newest copy wins), push the merged set once
  useEffect(() => {
    if (!loaded || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        const remoteList = await pullDeadlines();
        if (cancelled) return;
        const cur = stateRef.current;
        const merged = mergeDeadlines(cur.deadlines, remoteList, cur.deleted);
        await pushDeadlines(merged, cur.deleted);
        if (cancelled) return;
        merged.forEach((d) => pushed.current.set(d.id, d.updatedAt));
        const sent = new Set(cur.deleted);
        setState((s) => ({ ...s, deadlines: mergeDeadlines(s.deadlines, merged, s.deleted), deleted: s.deleted.filter((x) => !sent.has(x)) }));
        setRemote({ uid: userId, status: 'synced' });
      } catch {
        if (!cancelled) setRemote({ uid: userId, status: 'offline' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loaded, userId]);

  // after that, push changed deadlines and deletions
  useEffect(() => {
    if (!loaded || !userId || !initialSyncDone) return;
    const id = setTimeout(async () => {
      const cur = stateRef.current;
      const changed = cur.deadlines.filter((d) => pushed.current.get(d.id) !== d.updatedAt);
      if (!changed.length && !cur.deleted.length) return;
      try {
        await pushDeadlines(changed, cur.deleted);
        changed.forEach((d) => pushed.current.set(d.id, d.updatedAt));
        const sent = new Set(cur.deleted);
        if (sent.size) setState((s) => ({ ...s, deleted: s.deleted.filter((x) => !sent.has(x)) }));
        setRemote({ uid: userId, status: 'synced' });
      } catch {
        setRemote({ uid: userId, status: 'offline' });
      }
    }, 1500);
    return () => clearTimeout(id);
  }, [state.deadlines, state.deleted, loaded, userId, initialSyncDone]);

  const commit = useCallback((fn: (s: Persisted) => Persisted) => {
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
  }, []);

  const update = useCallback(
    (id: string, fn: (d: Deadline) => Deadline) => commit((s) => ({ ...s, deadlines: s.deadlines.map((d) => (d.id === id ? fn(d) : d)) })),
    [commit],
  );

  const saveDrafts = useCallback<Store['saveDrafts']>(
    (drafts, ev) => {
      const r = applyDrafts(stateRef.current.deadlines, drafts, Date.now());
      commit((s) => ({ ...s, deadlines: r.deadlines }));
      logCapture({ ...ev, saved: r.added + r.moved, merged: r.same }).catch(() => {});
      return r;
    },
    [commit],
  );

  const store = useMemo<Store>(() => {
    const today = dayKey(new Date());
    return {
      loaded,
      deadlines: state.deadlines,
      time: state.time.day === today ? state.time.value : 0,
      session,
      sync,
      saveDrafts,
      edit: (id, d) => update(id, (t) => applyEdit(t, d, Date.now())),
      setDone: (id, done) => update(id, (t) => ({ ...t, done, doneAt: done ? Date.now() : undefined, updatedAt: Date.now() })),
      snooze: (id) =>
        update(id, (t) => {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          d.setHours(5, 0, 0, 0);
          return { ...t, snoozedUntil: d.getTime(), updatedAt: Date.now() };
        }),
      wake: (id) => update(id, (t) => ({ ...t, snoozedUntil: 0, updatedAt: Date.now() })),
      remove: (id) => commit((s) => ({ ...s, deadlines: s.deadlines.filter((d) => d.id !== id), deleted: [...s.deleted, id] })),
      setTime: (v) =>
        commit((s) => {
          const day = dayKey(new Date());
          return { ...s, time: { day, value: s.time.day === day && s.time.value === v ? 0 : v } };
        }),
      deleteEverything: async () => {
        let ok = true;
        if (session) {
          try {
            await deleteAccount();
          } catch {
            ok = false;
          }
        }
        await cancelAllReminders().catch(() => {});
        await AsyncStorage.removeItem(KEY).catch(() => {});
        pushed.current.clear();
        commit(() => fresh());
        return ok;
      },
    };
  }, [loaded, state, session, sync, saveDrafts, update, commit]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}
