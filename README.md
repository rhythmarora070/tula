# Tula

**Your all-rounder personal AI.** Tula plans your day around how you actually feel, keeps every deadline in sight, and knows when to tell you to rest.

> Working name. The final brand name is still being decided.

## What's in this repo

| Path | What it is | Status |
| --- | --- | --- |
| `index.html` | Landing page | Live draft |
| `app/index.html` | Working prototype: check-in, energy-aware daily plan, deadline radar, calm mode, nudges, weekly reflection | Prototype (web) |
| `docs/ROADMAP.md` | Build phases and what comes next | Living doc |

## Run it locally

No build step yet. Open the files directly, or serve the folder:

```bash
python3 -m http.server 8000
# landing page: http://localhost:8000
# prototype:    http://localhost:8000/app/
```

In the standalone prototype, data is saved in your browser (localStorage) and the AI brain-dump falls back to "one line = one task". AI sorting needs the backend that comes in Phase 1.

## Deploy the landing page (free)

1. Push this repo to GitHub.
2. Settings → Pages → Source: "Deploy from a branch" → `main` / root.
3. The site goes live at `https://<username>.github.io/<repo>/`.

## How the daily plan works

Each open task gets a score:

```
score = 0.45 × urgency + 0.35 × stakes + 0.20 × energy fit + age bonus
urgency    = 1 / (1 + hours_until_due / 24)   (1.15 if overdue, 0.15 if no date)
stakes     = importance / 3                    (1 low, 2 matters, 3 real consequences)
energy fit = 1 − |task size − today's energy|  (−0.3 for big tasks on high-stress days)
age bonus  = up to +0.15 for tasks sitting untouched, so nothing fades away
```

Anything due within 24 hours is picked first. You get 2 picks on a low day (energy ≤ 2 or stress ≥ 4) and 3 otherwise, within a time budget set by your energy.

## Principles

- Guide, don't pressure. No streaks, no guilt.
- Never change a commitment without asking.
- Be honest about what is known, guessed, or not possible yet.
- Few notifications, quiet hours, easy to pause.
