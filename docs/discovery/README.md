# Discovery kit: 16 – 29 Nov 2026

**Two weeks, no code.** Find out whether students miss deadlines because the information is scattered, and whether they'll forward notices to something that keeps them. The app waits on the answer.

| File | Use it for |
| --- | --- |
| [interview-guide.md](interview-guide.md) | Running each 20-minute interview |
| [messages.md](messages.md) | Recruiting posts, concierge replies, reminders, the class digest, the end-of-week survey |
| [templates/interview-notes.csv](templates/interview-notes.csv) | One row per interview. Import into Google Sheets |
| [templates/concierge-participants.csv](templates/concierge-participants.csv) | One row per concierge student |
| [templates/concierge-items.csv](templates/concierge-items.csv) | One row per deadline forwarded to either concierge number |
| [templates/section-digests.csv](templates/section-digests.csv) | One row per evening digest sent to the class section |

**Keep real data out of Git.** Fill the sheets in Google Sheets, or in `docs/discovery/data/`, which is ignored. Use participant codes (I01, C01, S01), never names or numbers, in anything you share.

## Who does what

| Owner | Runs |
| --- | --- |
| **Interviews owner** | Recruiting posts, booking and running the 15 interviews, filling interview-notes |
| **Concierge owner** | Both Tula WhatsApp numbers: entering forwarded deadlines, sending reminders and the evening digest, filling the concierge sheets |

Swap one interview each so both of you hear students first-hand. Meet for 20 minutes every evening to read the day's notes together.

## Before Monday (Sat 14 – Sun 15 Nov)

- [ ] Two WhatsApp numbers on the **WhatsApp Business** app (two spare SIMs, or one phone with a dual SIM and a second device). Name both "Tula (deadline concierge)". Set the profile description from [messages.md](messages.md#profile-description)
  - **Number 1, individual:** students forward their own deadlines
  - **Number 2, class section:** the class rep forwards; everyone opted in gets an evening digest
- [ ] Quick replies saved in WhatsApp Business for the confirm and reminder messages (`/got`, `/remind`, `/digest`)
- [ ] The four templates imported into one Google Sheet (one tab each), shared only between you two
- [ ] Recruiting posts ready to go out Monday morning
- [ ] One class section picked where you know the class rep personally. Ask them on Sunday ([messages.md](messages.md#class-rep-ask))
- [ ] Three real notices from your own groups saved as screenshots, for the platform test in each interview. Blur names and numbers first

## Day by day

| Day | Interviews owner | Concierge owner |
| --- | --- | --- |
| **Mon 16** | Recruiting posts out. Book interviews for Tue to Fri | Welcome the first concierge sign-ups. Class rep: confirm and agree the digest time |
| **Tue 17** | 3 interviews | Individual concierge running. Set up the section: announcement-only group plus the rep's number |
| **Wed 18** | 3 interviews | First evening digest to the section |
| **Thu 19** | 3 interviews | Reminders going out. Note every forward in concierge-items |
| **Fri 20** | 3 interviews | Short end-of-week survey to concierge students |
| **Sat 21** | **Midpoint review together** (below) | |
| **Mon 23 – Thu 26** | Last 3 interviews. Second-college students first | Both concierge numbers keep running |
| **Fri 27** | Fill any gaps in interview-notes | End-of-week survey again; section poll |
| **Sun 29** | **Gate decision together** (below) | |

If interviews run short, stop at 12 rather than adding filler. If they're booking fast, push to 20: the gate needs 10 of 15, and more data makes it clearer.

## Midpoint review (Sat 21)

Answer from the sheets, not from memory:

1. How many interviewees described a miss caused by scattered information? Is it heading for 10 of 15?
2. Which channel came up most as where the notice was first seen?
3. How many items has each concierge student forwarded? Who forwarded nothing, and why (ask them)?
4. Are section students reading the digest? Check "Read by" on each digest message.
5. What did the platform test show: could students save a notice with their phone or Gemini in under a minute?
6. Change one thing for week 2. Write it down in the sheet.

## The gate (Sun 29)

Fill this in together. Each row passes or fails on its own number.

| Signal | How to measure | Passes if |
| --- | --- | --- |
| Scattered information is the cause | interview-notes: `scattered_info_miss = Y` | 10 or more of 15 interviewees |
| Students forward on their own | concierge-items, individual number: items per active student in week 2 | 3 or more per student per week |
| Students keep forwarding | concierge-participants: forwarded something in both weeks | 50% or more of those who joined in week 1 |
| The section digest gets read | section-digests: average `read_by_pct` | 60% or more of opted-in students |
| The section digest gets acted on | section-digests: ✅ reactions, plus the Fri 27 poll | Half or more say it helped them not miss something |
| The phone isn't already enough | interview-notes: `platform_test_good_enough = Y` | Fewer than 5 of 15 say what their phone did is enough |

**Reading the result**

- **All six pass:** start the build on 30 Nov as planned.
- **Section passes, individual doesn't:** build the class-wide board first; it's the stronger signal.
- **Individual passes, section doesn't:** build the single-player app as planned; drop the class board.
- **Scattered information fails:** stop. Write up what students said the real cause is before building anything.
- **Phone is enough for 5 or more:** narrow to high-stakes deadlines only (internships, placements, fees), where reminders that chase you matter most, and re-test.

Write the decision and the numbers at the top of the interview-notes sheet and in [../ROADMAP.md](../ROADMAP.md).

## Consent and privacy

- **18+ only.** Ask the age at sign-up. Under 18: thank them and don't add them (DPDP Act consent rules).
- Every concierge student gets the consent message in [messages.md](messages.md#welcome-individual) and can stop any time by sending **STOP**.
- Delete forwarded screenshots from both phones once the details are in the sheet. Keep only the fields.
- Interviews: ask before recording; notes are fine without a recording. Never screenshot someone's chats; ask them to read the notice out or show it.
- On **Mon 30 Nov**, export the sheet you need for the decision with codes only, then delete the phone-number column and both numbers' chat histories. Tell participants it's done.
