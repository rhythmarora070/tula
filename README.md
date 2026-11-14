# Tula

**Every deadline from your college groups, sorted by what's at stake.** Tula keeps one record of each deadline, follows it through extensions and repeats, reminds you in time for what a miss would cost, and shows you what's due today. Built for Indian college students (18+).

> Working name. The final brand name is still being decided.

## What's in this repo

| Path | What it is | Status |
| --- | --- | --- |
| `index.html` | Landing page | Live draft |
| `mobile/` | Android app (Expo): Share → Tula for text, screenshots and PDFs, confirm card, one record per deadline, stakes-based reminders that fire with the app closed. See [mobile/README.md](mobile/README.md) | Built, not yet run on a phone |
| `supabase/` | Optional backend: AI reading of notices, backup, pilot metrics, account deletion. See [supabase/README.md](supabase/README.md) | Written, not yet deployed |
| `app/index.html` | Web prototype of the same flow (paste only, reminders while the page is open) | Prototype (web) |
| `docs/STRATEGY.md` | Why Tula is student-first, the MVP, validation plan, risks | Decided 25 Oct 2026, amended 11 Nov |
| `docs/COMPETITORS.md` | About 45 related products and what they mean for Tula | Researched 11 Nov 2026 |
| `docs/ROADMAP.md` | Timeline, scope contract, watch list | Living doc |
| `docs/pilot/` | Pilot plan, decision table, metrics SQL, student messages and surveys | Ready once the backend is live |
| `pilot.html` | The page pilot students open to install and set up Tula, including battery settings by phone brand | Build link and contact email still to fill in |
| `docs/play-store/` | Play Store listing text, data-safety answers, feature graphic, release checklist | Ready to paste into the Play Console |
| `privacy.html`, `delete-account.html` | Privacy policy and account-deletion page that Google Play requires | Contact details still to fill in |

## Run it locally

No build step yet. Open the files directly, or serve the folder:

```bash
python -m http.server 8000
```

Landing page: http://localhost:8000 · Prototype: http://localhost:8000/app/

In the standalone prototype, data is saved in your browser (localStorage) and notices are read by plain code: the date, the link and a title, one deadline per paragraph. AI extraction needs the backend that comes with the Android app.

What the web prototype can't do, and says so in its UI: read screenshots or PDFs, appear in the Android share sheet, or remind you when the page is closed.

## Deploy the landing page (free)

1. Push this repo to GitHub.
2. Settings → Pages → Source: "Deploy from a branch" → `main` / root.
3. The site goes live at `https://<username>.github.io/<repo>/`.

## How a deadline is kept

- **Dates are decided by code.** `resolveDate` reads phrases like "Friday 5 pm", "kal", "12/11 EOD" or "next Friday". The AI only proposes; if its reading differs from the code's, the confirm card flags it. Vague dates ("soon", "next week") are flagged for you to set, never guessed.
- **One record per deadline.** A notice that matches a saved deadline updates that record: the same date counts it as seen again, a different date asks "deadline moved?" and keeps the old date in the history.
- **Reminders follow the stakes.** High stakes: 3 days before, 1 day before and 9 am on the day. Everything else: 1 day and 3 hours before.

## How the daily picks work

Each open deadline gets a score:

```
score = 0.45 × urgency + 0.35 × stakes + 0.20 × time fit + age bonus
urgency   = 1 / (1 + hours_until_due / 24)   (1.15 if overdue, 0.15 if no date)
stakes    = importance / 3                    (1 low, 2 matters, 3 can't be undone)
time fit  = 1 − |task size − time you have|   (0.5 if you didn't say)
age bonus = up to +0.15 for items sitting untouched, so nothing fades away
```

Anything due within 24 hours is picked first. You get 3 picks, or 2 if you said you have under an hour, within a time budget set by the optional "Time today?" answer.

## Principles

- Tula sees only what you send it. It never reads your chats.
- Nothing is saved, moved or deleted without your tap.
- Be honest about what is known, guessed, or not possible yet. No fake actions.
- Delete everything in one tap.
