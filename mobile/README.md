# Tula for Android

Expo (SDK 58) app: share a notice to Tula, confirm the deadline, get reminders sized to the stakes.

## What's built

| Piece | Where | Works without an account? |
| --- | --- | --- |
| Share → Tula for text, screenshots and PDFs | `src/app/+native-intent.ts`, `src/app/capture.tsx` | Text yes. Screenshots and PDFs need sign-in (AI reading) |
| Confirm card: every field editable, date words shown, repeats and moved dates flagged | `src/ui/DraftEditor.tsx` | Yes |
| One record per deadline: repeats merged, extensions kept in history | `src/engine/record.ts`, `src/engine/save.ts` | Yes |
| Dates decided by plain code; the model only proposes | `src/engine/dates.ts`, `src/engine/extract.ts` | Yes |
| Today: 2 or 3 picks, optional "Time today?", 72-hour radar | `src/app/(tabs)/index.tsx`, `src/engine/plan.ts` | Yes |
| Stakes-based reminders that fire with the app closed | `src/lib/reminders.ts` | Yes (local notifications) |
| Email-code sign-in, backup across devices, capture metrics for the pilot | `src/lib/backend.ts`, `src/lib/store.tsx` | Needs Supabase |
| Delete my data (phone, and account if signed in) | `src/app/(tabs)/settings.tsx` | Yes |

Deadlines live on the phone (AsyncStorage). The account is optional.

## Stack (checked 12 Nov 2026)

| Layer | Version | Note |
| --- | --- | --- |
| Expo SDK | 58 | Latest. React Native 0.88, React 19.3, Expo Router 58 |
| AI | Gemini 3.5 Flash-Lite via the Interactions API | Google's current small model and recommended API; see [../supabase/README.md](../supabase/README.md) |
| Backend | Supabase (Postgres with row-level security, Edge Functions on Deno 2) | supabase-js 2.119 |
| Typecheck | TypeScript 7 (`npm run typecheck`) | The new native compiler |
| Lint | ESLint 9 with TypeScript 6 underneath | Expo's lint config doesn't run on ESLint 10 or TypeScript 7 yet. Move up when `eslint-config-expo` supports them |
| Native module versions | Pinned by Expo SDK 58 | Some packages have newer releases (async-storage 3, React 19.3.1); Expo pins the versions it has tested with React Native 0.88. Don't upgrade them by hand: run `npx expo install --check` |

## Run it

```bash
npm install
```

```bash
npm test
```

```bash
npm run web
```

The web preview is for checking screens only: share, reminders and the native date picker need a phone.

Share → Tula needs a development build, not Expo Go. With an Android phone connected over USB (developer mode on) and Android Studio installed:

```bash
npm run android
```

Without Android Studio, build in the cloud with EAS. Log in to your Expo account first, then link the project (both once):

```bash
npx eas-cli@latest login
```

```bash
npx eas-cli@latest init
```

```bash
npx eas-cli@latest build --profile development --platform android
```

Install the APK from the link EAS prints, then run `npm start` and open the app.

## Build profiles (`eas.json`)

| Profile | Gives you | Use it for |
| --- | --- | --- |
| `development` | APK with the dev client | Day-to-day work on a real phone |
| `preview` | Stand-alone APK | Sharing with pilot students without the Play Store |
| `production` | App bundle, version code bumped automatically | Uploading to Google Play (`eas submit` sends it to the internal testing track) |

Cloud builds don't see `.env.local`. Set the two public values as EAS environment variables instead (once per environment):

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co --environment preview --visibility plaintext
```

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value sb_publishable_your-key --environment preview --visibility plaintext
```

## Before the first Play Store upload

- [ ] Choose the final package name in `app.json` (it can't change after the first upload) and the final app name
- [ ] Fill in the marked gaps in `../privacy.html` and `../delete-account.html` (contact email, grievance contact, Supabase region) and publish the site
- [ ] Turn on billing for the Gemini key (the privacy policy depends on the paid tier)
- [ ] Play Console: data safety form (email address; app activity; content you share is processed but not stored), content rating, target audience 18+
- [ ] Store listing: `assets/play-store-icon-512.png`, a 1024×500 feature graphic and at least two phone screenshots
- [ ] Test the `preview` APK on at least two Android phones from different makers, with battery saver on

## Turn on AI reading and backup

1. Create a Supabase project, then from the repo root link it and push the schema: `npx supabase init` (once), `npx supabase link`, `npx supabase db push`.
2. Set the function secrets and deploy (see [../supabase/README.md](../supabase/README.md)).
3. Copy `.env.example` to `.env.local` and fill in the project URL and the **publishable** key (`sb_publishable_…`). Never put a secret key in the app.
4. In Supabase Auth, set the email template to send the 6-digit `{{ .Token }}` (the app signs in with a code, not a link).

## Checks

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run lint
```

## Known limits

- Reminders use Android's normal (inexact) alarms, so one can arrive a few minutes late; aggressive battery savers can delay it more. The You tab tells students how to set battery use to Unrestricted.
- A phone signed in to the same account learns about changes made on another phone when Tula next starts, not instantly. Deletions always win: a deadline deleted on one phone can't come back from another.
- iOS is switched off in the share-intent plugin; the MVP is Android only.
- `app.tula.deadlines` is a placeholder package name. Change it before the first Play Store upload; it can't change afterwards.
- The app doesn't link to the privacy policy yet, because its web address depends on where the site is hosted. Add the link to the You tab once it's live.
