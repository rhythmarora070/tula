# Tula roadmap

## Where we are (Oct 2026)

- [x] Web prototype of the core loop: check-in → 2–3 picks → deadline radar → calm mode
- [x] Brain dump to tasks (AI), break-a-task-into-steps (AI)
- [x] Gentle nudges (only while the tab is open), weekly reflection
- [x] Landing page
- [ ] Final brand name (Tula is the working name)

## Recommended stack

| Layer | Choice | Why |
| --- | --- | --- |
| Mobile app | Expo (React Native + TypeScript) | One codebase for Android first, iOS later. Real scheduled notifications that work when the app is closed |
| Backend + auth + DB | Supabase (Postgres, Auth, Row Level Security) | Free tier, Google sign-in, per-user data isolation without writing a server |
| AI calls | Supabase Edge Function calling an LLM API | API keys stay on the server, never in the app |
| Landing page | Static HTML on GitHub Pages | Free, no build step |

Cost to start: ₹0 on free tiers, plus LLM API usage. A Google Play developer account is a one-time fee, needed only when publishing.

## Phase 1: Foundation (Android app)

1. Expo app scaffold with the pastel design tokens and navigation (Today, Tasks, Notes, You)
2. Supabase project: auth (Google + email), tables for `tasks`, `checkins`, `notes`, `prefs`
3. Port the planning engine from `app/index.html` into a tested TypeScript module
4. Today screen (home): check-in, picks, radar
5. Tasks: add, edit, snooze, done, delete
6. Local notifications: deadline reminders (24h and 3h before), nudges with quiet hours
7. Brain dump through the AI edge function

**Milestone:** you use it daily on your own phone for one week.

## Phase 2: Context and memory

- Quick notes and "remember this"
- Memory you can inspect, edit, export and delete
- Ask Tula: chat that can see your tasks, notes and check-ins ("prepare me for tomorrow")
- Daily briefing and end-of-day review

## Phase 3: Wellbeing and device

- Sleep routine, focus sessions
- Screen-time summaries (Android Usage Stats permission, opt-in only)
- Google Calendar import

## Phase 4: More of life

- Finance reminders (bills, subscriptions), learning goals, important documents
- Optional companion layer

## Testing with real users

- 5–10 students from your communities, two weeks
- Measure: deadlines missed (before vs after), how often they open it on heavy days, which nudges they turn off
- One 15-minute interview per person at the end
