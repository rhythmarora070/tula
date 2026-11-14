# Pilot plan

**Four weeks with 30 to 50 real students, to answer one question: do students keep sending their deadlines to Tula when nobody is reminding them to?** Everything here serves the continue / change / stop decision at the end of week 4.

| File | Use it for |
| --- | --- |
| [messages.md](messages.md) | Every message to students, from the invite to the wrap-up |
| [surveys.md](surveys.md) | The intake, weekly and exit surveys, ready to paste into Google Forms |
| [metrics.sql](metrics.sql) | The queries behind every number in the decision table |
| [`../../pilot.html`](../../pilot.html) | The page students open to install Tula and set it up |

## Before the first invite

Nothing here can be skipped: without the backend there are no numbers, and without the right phone settings reminders fail quietly.

- [ ] **Backend live:** Supabase project linked, `db push` (all three migrations), `config push`, both functions deployed, Gemini key with billing on ([../../supabase/README.md](../../supabase/README.md))
- [ ] **Email provider** set up for sign-in codes (Supabase's built-in sender only manages a few an hour)
- [ ] **EAS variables** for the `preview` environment: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ([../../mobile/README.md](../../mobile/README.md))
- [ ] **New preview build** with the backend variables, from the latest commit, tested by both of you for 3 days on different phone brands
- [ ] **Site live** with `pilot.html`, `privacy.html` and `delete-account.html`, contact details filled in, and the build link pasted into `pilot.html`
- [ ] **Google Forms** created from [surveys.md](surveys.md); links pasted into [messages.md](messages.md)
- [ ] **Pilot WhatsApp group** created, announcement-only, with one of you as the contact for problems
- [ ] **Start date** chosen. End-semester exams are a real stress test but a bad time for exit interviews; if the pilot overlaps them, plan interviews for the week after

## Who

| | |
| --- | --- |
| Size | 30 to 50 students. Under 30 makes the percentages noise |
| Who | College students, 18+, on Android, in 5 or more WhatsApp groups. Hackathon and internship hunters first: they have the most high-stakes deadlines |
| Where from | Your three communities, AARVAK, HackerRank VIPS Crew; then each student invites one friend at another college |
| One class section | Recruit through a class rep you know, so several students in one section use it together |
| Not | Anyone under 18 (DPDP Act), iPhone users (Android only for now), anyone who only joins to help you out and won't use it |

## Every student signs in

Pilot numbers only exist for signed-in students, and screenshots and PDFs only work with an account. The invite and `pilot.html` ask for it; the Today screen shows a sign-in card until they do. A student who never signs in is counted as not active.

## The rhythm

| When | What | Who |
| --- | --- | --- |
| Day 0 | Invite → install from `pilot.html` → sign in → intake survey | Students |
| Day 1 | Welcome message with three things to try | You |
| Day 3 | Nudge anyone who hasn't saved a deadline yet (one message, no pestering) | You |
| Every morning | Check error reports and yesterday's AI reads (queries 6 and 7). A spike in either means something broke | Engineer |
| Every 2 to 3 days | Ship fixes. JavaScript fixes go out over the air (`npx eas-cli@latest update --channel preview --message "..."`), and students get them on the next app restart. A new APK only when native code changes | Engineer |
| Every Friday | 2-minute weekly survey; read the week's numbers together (queries 1 to 5) | Both |
| End of week 4 | Exit survey to everyone; 8 exit interviews (4 active students, 4 who stopped) | Both |
| Day 29 | Decide, using the table below | Both |

Keep a running log (a doc or a sheet tab) of every bug report, every fix shipped, and every quote from a student. The decision needs the quotes as much as the numbers.

## Decide at the end of week 4

The thresholds come from [../STRATEGY.md](../STRATEGY.md#validation), except the 70% line for edits, which is new: the strategy only set the 85% target. The query that measures each one is in [metrics.sql](metrics.sql).

| Signal | Continue | Change direction | Stop | Measured by |
| --- | --- | --- | --- | --- |
| Students still capturing in week 4 | 30% or more | 15–30% | Under 15% | Query 3 |
| Captures per active student per week | 3 or more | 1–3 | Under 1 | Query 2 |
| Extractions saved without edits | 85% or more | 70–85% | Under 70% | Query 4 |
| "Very disappointed" without Tula | 40% or more | 20–40% | Under 20% | Exit survey |
| Missed deadlines vs the 4 weeks before | Fewer | About the same | More | Intake vs exit survey |

**If it's "change direction"**, the likeliest moves are the same as before: narrow to high-stakes deadlines only (internships, placements, fees), or lead with the class-wide board if the class section did clearly better than everyone else (query 5).

## Things that will go wrong

| Problem | What you'll see | What to do |
| --- | --- | --- |
| Reminders arrive late or never | Students say "it didn't remind me"; mostly Xiaomi, Realme, Vivo, OPPO | Send the battery steps from `pilot.html` again. Note the phone brand in the log |
| A date read wrong | A low "saved without edits" rate, or a student complaint | Ask for the notice text (with names removed), add it to `mobile/src/engine/__tests__`, fix, ship over the air |
| Sign-in codes don't arrive | Students stuck on the You tab | Check the email provider's logs; tell students to check spam |
| A crash | Rows in `client_errors` | Fix, ship over the air, tell the affected students |
| Nobody uses it after week 1 | Query 3 falling fast | Exit-interview two of them now, not at week 4 |

## Ending the pilot

Tell students what happens next: Tula keeps working, and their data stays theirs. Anyone can delete everything from the You tab or by email ([../../delete-account.html](../../delete-account.html)). If the decision is "stop", say so honestly and delete the backend data after 30 days.
