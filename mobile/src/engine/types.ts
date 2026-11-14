// Shared types for the deadline engine. Pure TypeScript, no React Native imports,
// so the same files run in the app and under `node --test`.

export const AREAS = ['Assignment', 'Internship / jobs', 'Hackathon', 'Fees / forms', 'Community', 'Personal'] as const;
export type Area = (typeof AREAS)[number];

/** 1 low stakes, 2 matters, 3 can't be undone */
export type Stakes = 1 | 2 | 3;
export const STAKES_LABEL: Record<Stakes, string> = { 1: 'Low stakes', 2: 'Matters', 3: 'High stakes' };

export type Effort = 'S' | 'M' | 'L';
export const EFFORT_LABEL: Record<Effort, string> = { S: 'Small', M: '~1 hr', L: 'Big' };
export const EFFORT_MIN: Record<Effort, number> = { S: 25, M: 60, L: 120 };

/** Local wall-clock time as 'YYYY-MM-DDTHH:mm', or '' for no date. */
export type LocalISO = string;

export interface HistoryEntry {
  /** the date it used to be due */
  due: LocalISO;
  /** when it moved (epoch ms) */
  at: number;
}

export interface Step {
  text: string;
  done: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  due: LocalISO;
  imp: Stakes;
  effort: Effort;
  area: Area;
  /** what to submit, and where */
  submit: string;
  link: string;
  /** the words the date was read from */
  source: string;
  /** previous due dates, oldest first */
  history: HistoryEntry[];
  /** how many times this deadline has been captured */
  seen: number;
  done: boolean;
  doneAt?: number;
  created: number;
  updatedAt: number;
  steps: Step[];
  /** hidden from today's picks until this time (never from the radar) */
  snoozedUntil: number;
}

/** A deadline read from a notice, waiting on the student's confirm. */
export interface Draft {
  title: string;
  due: LocalISO;
  /** the date words found in the text */
  when: string;
  /** anything the student should double-check */
  flag: string;
  submit: string;
  link: string;
  imp: Stakes;
  effort: Effort;
  area: Area;
  /** when this looks like a saved deadline with a different date */
  dupAct?: 'update' | 'new';
}

/** "How much time do you have today?" 0 = not answered, 1..4 = the four choices. */
export type TimeToday = 0 | 1 | 2 | 3 | 4;
export const TIME_LABELS = ['Under 1 hr', '1–2 hrs', '2–4 hrs', 'Most of the day'] as const;
export const TIME_CAP_MIN = [180, 45, 120, 210, 320] as const;
