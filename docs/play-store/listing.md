# Google Play listing pack

Everything the Play Console asks for, written to match what the app does in the code today (12 Nov 2026). Re-check the data-safety answers whenever data handling changes.

## Store listing

| Field | Value | Limit |
| --- | --- | --- |
| App name | Tula: College Deadlines | 30 characters (23 used) |
| Short description | Every deadline from your college groups, sorted by what's at stake. | 80 characters (67 used) |
| Category | Productivity | |
| Tags | Education, Productivity, To-do list | Pick up to 5 that Play offers |
| App icon | `mobile/assets/play-store-icon-512.png` | 512×512 PNG |
| Feature graphic | `docs/play-store/feature-graphic.png` | 1024×500 PNG |
| Privacy policy | The live address of `privacy.html` (currently set in the app as `https://rhythmarora070.github.io/tula/privacy.html`) | Must load before submitting |
| Contact email | [contact email] | Shown publicly |

### Full description (about 1,500 of 4,000 characters)

```
Deadlines don't arrive in one place. A lab record in the class group, an internship form in the placement group, a hackathon registration on Unstop, a fee date in a PDF nobody opened. Tula keeps one record of each and reminds you in time for what a miss would cost.

SHARE IT TO TULA
Long-press a message in WhatsApp, tap Share, then Tula. Tula reads the date, what to submit and the link, and shows you a card to check. Nothing is saved until you tap Save.

ONE RECORD PER DEADLINE
• Same notice in three groups? Tula keeps one deadline, not three.
• Deadline extended? Tula updates it and keeps the old date, so you know which one is real.
• Tula shows the words it read the date from. If a notice only says "soon", it asks you instead of guessing.

REMINDERS SIZED TO THE STAKES
• Internship forms, offers, fees and exams: 3 days before, 1 day before and the morning of.
• Everything else: 1 day before and 3 hours before.
Reminders work even when Tula is closed.

WHAT'S DUE TODAY
Each day, the 2 or 3 things to act on, plus everything due in the next 72 hours. Tell Tula how much time you have and it plans around it.

BEYOND COURSEWORK
Internships, hackathons, scholarships, fees and society work sit next to your assignments.

PRIVATE BY DESIGN
• Tula never reads your chats. It only sees what you share to it.
• It keeps the fields you confirm, never the message or screenshot.
• Your deadlines stay on your phone unless you sign in to back them up.
• Delete everything in one tap.

Made by college students in India, for college students aged 18 and over.
```

## Screenshots

Take them on a real phone from the preview build (Play needs 2 to 8, 9:16, at least 1080 px on the short side). Load realistic examples first: on Today with no deadlines, tap **Add your first deadline**, then **Try a sample notice**, and add a few more of your own.

| # | Screen | Caption to put above it |
| --- | --- | --- |
| 1 | Today with 3 picks and the radar | What's due today, sorted by what's at stake |
| 2 | WhatsApp share sheet with Tula in it | Share any notice to Tula |
| 3 | Confirm card showing "Date read from 'Friday 5 pm'" | Check it before it saves |
| 4 | A deadline with "Moved from Fri" and "Seen 2 times" | Extensions and repeats, handled |
| 5 | Deadlines tab | Every deadline in one place |
| 6 | A reminder notification on the lock screen | Reminders that match the stakes |

## App content answers

| Section | Answer | Why |
| --- | --- | --- |
| Privacy policy | The live `privacy.html` address | |
| Ads | No ads | |
| App access | All functionality available without special access | Everything works without an account. Signing in only adds backup and AI reading of screenshots |
| Content rating | Fill the questionnaire as a productivity app: no violence, no user-to-user communication, no gambling, no location sharing | Expect the lowest rating |
| Target audience | 18 and over only | Tula is for college students 18+ (DPDP Act consent rules for under-18s) |
| News app | No | |
| Government app | No | |
| Financial features | None | |
| Health | No | |

## Data safety form

Play counts data as "collected" when it leaves the phone. Sending notices to Google for reading is done on Tula's behalf, which Play treats as a service provider, not sharing.

**Overview answers**

| Question | Answer |
| --- | --- |
| Does the app collect or share any of the required user data types? | Yes |
| Is all collected data encrypted in transit? | Yes |
| Do you provide a way for users to request that their data is deleted? | Yes: in the app (You → Delete my data) and at the `delete-account.html` page |
| Is data shared with third parties? | No |

**Data types**

| Data type | Collected? | Optional? | Processed ephemerally? | Purpose |
| --- | --- | --- | --- | --- |
| Personal info → Email address | Yes | Optional (only if the student signs in) | No | Account management |
| Photos and videos → Photos | Yes | Optional (only when a signed-in student shares a screenshot) | Yes: read once, not stored | App functionality |
| Files and docs | Yes | Optional (only when a signed-in student shares a PDF) | Yes: read once, not stored | App functionality |
| Messages → Other in-app messages | Yes | Optional (text of a notice the student shares, when signed in) | Yes: read once, not stored | App functionality |
| App activity → Other user-generated content | Yes | Optional (deadlines backed up when signed in) | No | App functionality |
| App activity → Other actions | Yes | Optional (counts per save: found, saved, edited; when signed in) | No | Analytics |
| App info and performance → Crash logs | Yes | Optional (when signed in) | No | App functionality, Analytics |
| App info and performance → Diagnostics | Yes | Optional (error messages with app and Android version, when signed in) | No | App functionality |

Everything else (location, contacts, financial info, health, device IDs, web history, audio, calendar) is not collected. Reminders are scheduled on the phone and never leave it.

## Release checklist

- [ ] Final app name and package name chosen (`app.json`), since the package can't change after the first upload
- [ ] `privacy.html` and `delete-account.html` gaps filled (contact email, grievance contact, Supabase region) and the site live
- [ ] Gemini billing turned on
- [ ] Production build: `npx eas-cli@latest build --profile production --platform android`
- [ ] Upload to the **internal testing** track first (`npx eas-cli@latest submit --profile production --platform android`); the first upload to a new app has to be done by hand in the Play Console
- [ ] Personal developer accounts created after November 2023 must run a closed test with at least 12 testers for 14 days before production access. The pilot students can be those testers
