# Tula roadmap

Follows [STRATEGY.md](STRATEGY.md) (student-first, 25 Oct 2026) as amended by [COMPETITORS.md](COMPETITORS.md) (11 Nov 2026).

**The plan in one line:** validate by hand now, build through December around exams, pilot when the new semester opens in January 2027.

## Where we are (11 Nov 2026)

- [x] Web prototype repositioned: paste a notice → confirm → one record per deadline (extensions, repeats) → stakes-based reminders → what's due
- [x] Date resolver in plain code (the model proposes, code decides, vague dates are flagged)
- [x] Landing page rewritten for the new positioning
- [x] Android app code (12 Nov): Expo app in `mobile/`, engine ported to TypeScript with 38 tests, Share → Tula for text, screenshots and PDFs, local reminders, optional Supabase backend in `supabase/`
- [ ] Android app running on a real phone (needs a development build)
- [ ] Supabase project, Gemini key, functions deployed
- [ ] Interviews and concierge pilots
- [ ] Final brand name (Tula is the working name)

The app code was written ahead of the timeline below. The gate still applies: if discovery says students don't miss deadlines this way, the app waits.

## Timeline

### 1. Discovery and concierge: 16 – 29 Nov 2026

No code. Two people, a spreadsheet and two WhatsApp numbers. Everything needed is in the [discovery kit](discovery/README.md): day-by-day plan, interview guide, messages, tracking sheets and the gate scorecard.

- 15 interviews, 20 minutes each. Questions are in [STRATEGY.md](STRATEGY.md#validation). Every interview includes: "Show me how you'd save this notice with your phone or Gemini today."
- **Individual concierge:** 15 to 20 students forward deadlines to a Tula number. Enter them in a sheet, send reminders by hand.
- **Class-wide concierge:** one Tula number for one class section. The class rep forwards notices; everyone who opts in gets one evening digest of what's due.

**Gate to keep going:**

- At least 10 of 15 interviewees describe a miss caused by scattered information
- Individual concierge users forward 3 or more items in a week
- Students in the section read and act on the evening digest
- Students do not say their phone or Gemini already handles it

If the class-wide test clearly beats the individual one, the class board moves ahead of the single-player app.

### 2. Build: 30 Nov – early Jan

Sized around end-semester exams. If exam weeks leave under 10 hours a week each, shrink the scope, not the quality.

| Step | What ships |
| --- | --- |
| Foundations | Expo app with Supabase sign-in. Planning engine and date resolver ported from `app/index.html` into a tested TypeScript module. Proof that Share → Tula works on a real Android phone (custom development build, not Expo Go) |
| Capture | Extraction server function (text, screenshot, PDF). Confirm card. Deadline list and radar |
| Remind | Stakes-based local reminders that fire with the app closed. Today screen. Duplicate and date-change handling with visible history. Delete-my-data |

### 3. Pilot: 4 weeks, once the backend is live

Discovery was skipped on 12 Nov 2026 to build first, so the pilot can start as soon as the backend is connected. The full plan, pre-launch checklist, messages, surveys and metrics queries are in [pilot/](pilot/README.md). If the start overlaps end-semester exams, move the exit interviews to the week after. 30 to 50 students, onboarded by section where possible, since new groups and deadlines all arrive at once.

- Fix extraction errors daily
- 2-minute check-in survey each week
- 8 exit interviews at the end

### 4. Decide: end of pilot week 4

| Signal | Continue | Change direction | Stop this direction |
| --- | --- | --- | --- |
| Students still capturing in week 4 | 30% or more | 15–30% | Under 15% |
| Captures per active student per week | 3 or more | 1–3 | Under 1 |
| "Very disappointed" without Tula | 40% or more | 20–40% | Under 20% |
| What interviews say | "It saved a deadline I'd have missed" | "Nice, but Gemini or my own system works" | "I don't really miss deadlines" |

Also tracked: extractions saved without edits (target 85% or more) and self-reported missed deadlines against the four weeks before the pilot.

## Scope contract

New ideas go into a parking-lot doc until the pilot ends.

| Build now (MVP) | Build later (only if the pilot asks for it) | Avoid for now |
| --- | --- | --- |
| Concierge WhatsApp pilots (by hand), individual and one class section | Google Classroom import | Price comparison and coupon checking |
| Expo Android app with Supabase sign-in | Google Calendar export | Gmail reading |
| Share → Tula for text, screenshots and PDFs | Forward-to-Tula WhatsApp number | Reading WhatsApp chats or scraping notifications |
| AI extraction with a confirm card; dates resolved by code | Class-wide deadline board (only if the section test shows signal) | General bookings and email agent |
| Deadline radar, Today picks, 2 or 3 a day | Study plan for exam weeks | Mood tracking as a core feature |
| Stakes-based reminders that work when the app is closed | Student perks list (verified, curated by hand) | Users under 18 |
| Duplicate and date-change detection, with a visible history | Chat with Tula about your deadlines | iOS, payments, a companion character |
| Delete-my-data, privacy note | Weekly "done and coming up" summary | Anything we can't actually make work end to end |

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Mobile app | Expo (React Native + TypeScript) | Android first, iOS later. Share-sheet target and scheduled notifications that work when the app is closed |
| Backend + auth + DB | Supabase (Postgres, Auth, Row Level Security) | Free tier, Google sign-in, per-user data isolation without writing a server |
| AI calls | Supabase Edge Function calling Gemini 3.5 Flash-Lite through the Interactions API, with a JSON schema and storage off | API keys stay on the server. About ₹0.10 per capture. The model is one setting |
| Landing page | Static HTML on GitHub Pages | Free, no build step |

Cost to start: ₹0 on free tiers, plus LLM API usage. A Google Play developer account is a one-time fee, needed only when publishing.

## Watch list (check monthly)

| Who | Why |
| --- | --- |
| Vidyantar | Delhi, free, same students: deadlines, attendance, internships, daily AI briefing. No capture yet |
| InterSemester | Batch-wide Android app; claims to bring in WhatsApp batch updates |
| Hello Aria | Indian, WhatsApp-native, has a student use case |
| Ping | 100K+ downloads; already markets WhatsApp messages and screenshots → tasks |
| Any.do's WhatsApp bot | Forward a message, get a task and a reminder in WhatsApp |
| Meta AI in WhatsApp | If it starts reading groups for deadlines, the single-player app is in trouble |

Worth doing once: talk to Vidyantar's founder. Same city, same problem, a dashboard rather than capture.
