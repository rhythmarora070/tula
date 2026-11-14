# Tula: Student-First Strategy

Written 25 Oct 2026. Amended 11 Nov 2026 after the competitor research in [COMPETITORS.md](COMPETITORS.md).

## What changed on 11 Nov 2026

The research found that turning a message or screenshot into a deadline is a commodity: more than 30 products, phone-level AI and eight recent hackathon projects already do it. The direction below still stands, with these edits. Amended passages are marked *(amended)*.

1. **Differentiator.** Capture is table stakes. Tula has to be clearly better after capture: stakes-aware reminders, one record per deadline that tracks extensions and duplicates across groups, and a daily "what's due" view.
2. **The class angle.** One person (a class rep or society lead) forwards a notice and the whole section gets the deadline. No competitor found does this for Indian college groups. We test it by hand before building anything.
3. **Dates.** Nothing had started by 11 Nov, and a pilot in mid-December would land on end-semester exams. Discovery and the concierge test run now; the app pilot moves to the start of the new semester in January 2027.
4. **Positioning line.** "Forward it to Tula and never miss a deadline again" is close to what general capture apps already say. The line is now about college groups and stakes.

## The decision

Saksham sir is right about focus, but the student-savings idea is the wrong first problem. Start with the problem Tula was born from: important deadlines that arrive scattered across WhatsApp groups, Classroom, email and Unstop, and get lost.

### Recommendation

| | |
| --- | --- |
| **What Tula becomes** | A student-first agent that catches every deadline and opportunity from wherever it lands, and makes sure you act on it in time |
| **First segment** | Indian college undergraduates (18+) juggling classes plus hackathons, internships and society work. Start with VIPS and our own three tech communities |
| **The one problem** | Deadlines arrive as messy forwards, screenshots and PDFs in 20+ places. Students miss submissions, forms and offers because nothing captures them where they arrive |
| **MVP** | Share any message, screenshot or PDF to Tula in one tap. It extracts the deadline, what to submit and the link; you confirm; it reminds you in time and plans your day around what's due |
| **Differentiator** *(amended)* | Capture itself is common. Tula wins after capture: reminders sized to the stakes, one record that follows a deadline through extensions and repeats across groups, a daily view of what's due, and non-academic deadlines (internships, hackathons, scholarships, fees) that academic planners ignore. The unclaimed angle is the class: one forward, the whole section gets it |
| **One line** *(amended)* | Every deadline from your college groups, sorted by what's at stake. |

**What this is not:** a price-comparison or coupon agent (wrong problem first; see the next section), or a wellbeing app. Mood tracking becomes optional and off by default.

**Biggest risk, stated upfront:** Google now gives Indian college students Gemini's student hub free for a year, and it explicitly offers to "track deadlines". If students already find that good enough, our wedge disappears. The plan below is designed to find that out before we over-build.

## Which problem first

Deadline capture wins on frequency, feasibility and retention; savings loses on all three. Scores are our judgment (1 low, 5 high) from the research below. They are hypotheses until student interviews confirm them.

| Problem | How often it hurts | How painful | Can we stand out? | Can two students build it in 4 weeks? | Will students come back? | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Deadline capture and execution (assignments, forms, internships, hackathons, fees) | 5: several new deadlines a week | 5: a missed internship form or offer can't be undone | 3 *(reasoning amended)*: capture alone is common; nobody student-first and India-first keeps the record after capture | 5: share sheet + LLM extraction + local reminders | 5: new deadlines arrive every week | **Start here** |
| Study help (summaries, quizzes, revision) | 4 | 3 | 1: ChatGPT study mode, NotebookLM and Gemini are free for Indian students | 4 | 3: spikes before exams | Avoid; incumbents win |
| Student savings (price comparison, coupons, cheaper alternatives) | 2: big purchases are occasional | 2: you overpay a little, rarely a disaster | 2: BuyHatke already compares prices and auto-applies coupons; UNiDAYS gives student codes in India | 1: Amazon's product API needs 10 sales in 30 days; coupon checks are unreliable | 1: nothing to come back for between purchases | Later, if ever |
| General everyday help (bookings, emails) | 3 | 2 | 1: this is exactly what general agents do | 2 | 2 | Avoid; this is the "too broad" trap |

**Why the savings idea is weaker than it sounds.** It needs live, accurate prices we can't easily get, and one wrong price or dead coupon breaks trust. Even BuyHatke, a funded Indian price-comparison company, says Amazon blocked its affiliate ID. Discounts can be a later hook, but they won't bring students back weekly.

**Assumptions the interviews must confirm:**

1. Students miss deadlines mainly because the information is scattered, not because they forget things they already wrote down
2. Most deadline information arrives through WhatsApp groups, screenshots and PDFs
3. Students will tap Share to Tula on a forward, which is one extra step
4. Gemini's free student hub, or the phone's own "add to calendar", isn't already solving this for them *(amended)*
5. Non-academic deadlines (internships, hackathons, scholarships) matter as much as coursework

## Competitors

The student AI agent idea is not untapped. Big players give Indian students strong AI tools for free, and at least one startup already sells a "college agent". The fuller map, with about 45 products and projects, is in [COMPETITORS.md](COMPETITORS.md).

| Product | Type | What it does well | Where it leaves a gap |
| --- | --- | --- | --- |
| Gemini for Students | General AI, student plan | Free Google AI Plus for a year for Indian college students 18+. Student hub, study notebooks, and "organize your syllabus, track deadlines" (Google) | Built around uploaded course material. No capture from WhatsApp forwards; doesn't chase you before a form closes |
| ChatGPT (study mode, Go) | General AI | Study mode on all plans; ChatGPT Go offered free for 12 months in India from Nov 2025 (Indian Express) | A chat, not a tracker. It doesn't remind you or keep a deadline list |
| MyStudyLife | Student planner | 10M+ students, free. AI coach "Scout", snap your timetable, reminders before deadlines | Assumes school-style timetables and manual entry; no WhatsApp or screenshot capture; no internships or hackathons |
| Ahead | Student planner | Scan a syllabus and get every deadline and a semester plan | iOS only; syllabus-driven, while Indian deadlines mostly arrive mid-semester as notices |
| The College Agent | Student AI agent | Pitches "the AI assistant built for college life": classes, deadlines, internships, connected to calendar and email | US-focused. Proves the category exists, so we must win on the Indian context and what happens after capture, not the label |
| BuyHatke | Price comparison (India) | Compares prices across Amazon, Flipkart, Myntra and others; auto-applies coupons; AI "LookAlike" alternatives | Not student-specific, but it already does what the savings idea proposes |
| UNiDAYS India | Student discounts | Verified-student discount codes, "guaranteed to work" | Already owns student-verified discounts |
| Unstop | Opportunities platform | 32M+ students and freshers; internships, hackathons, competitions | Lists opportunities but doesn't track your personal deadlines across platforms; often points you to yet another WhatsApp group |

**Where the opening is** *(amended)*. One Indian internship blog puts it plainly: students can't keep "20 rolling deadlines in your head across WhatsApp groups, college notice boards" and other portals (TheNewViews). Research on students' academic WhatsApp groups shows they carry exams, assignments, deadlines and internship notices (Frontiers in Education; Baishya & Maheshwari, Sikkim University). The original version of this doc said no product captures from those messages directly. That was wrong: general capture apps, WhatsApp bots and phone AI do. What none of them does is keep a student's deadline record over time, know the stakes, or share a deadline with a class.

## The MVP

**One job: nothing that lands in a student's phone with a deadline gets missed.** The target user is an Android-using undergraduate in 5+ WhatsApp groups who has missed at least one deadline this semester.

### Core journey

1. A notice lands in the class WhatsApp group: "ML lab record submission by Friday 5 pm, upload on Classroom, format attached."
2. The student long-presses it and taps **Share → Tula**. Screenshots and PDFs work the same way.
3. Tula shows a confirm card within about 3 seconds: **Submit ML lab record · Fri 5:00 pm · Upload on Classroom · Stakes: graded**. Tap Save, or fix a field.
4. Tula schedules reminders based on stakes: 1 day before and 3 hours before for graded work; 3 days, 1 day and the morning of for internship forms and offers.
5. Each morning, the Today screen shows the 2 or 3 things to act on and everything due in the next 72 hours.
6. The student marks it done. Tula also notices duplicates ("Looks like the same deadline you saved from another group") and flags date changes ("Deadline extended to Monday?").

### The five essential capabilities

Order of effort *(amended)*: 3, 4 and the duplicate and date-change handling in step 6 are where Tula has to be better than everyone else. 1 and 2 only need to be as good as the phone's own tools.

| # | Capability | Why it's essential |
| --- | --- | --- |
| 1 | Share to Tula (text, screenshot, PDF) | Capture where the information arrives. Expected, not special |
| 2 | AI extraction with a confirm step | Turns mess into title, due time, what to submit, link and stakes. Nothing is saved without the student's tap. Dates are resolved by plain code where possible; the model only proposes, and vague dates are flagged, not guessed |
| 3 | Deadline radar and Today | Already built. Shows everything due soon, 2 or 3 picks a day, never hides an urgent item |
| 4 | Stakes-based reminders that fire when the app is closed | Reminders are what actually prevent the miss |
| 5 | Quick add and edit by typing or brain dump | For deadlines heard in class or remembered later |

### Not in the MVP

Price comparison and coupons; chat with Tula; study help (summaries, quizzes); mood tracking and wellness nudges; Gmail reading; a WhatsApp bot; iOS; payments; anything for school students under 18.

### Why students come back

New deadlines arrive every week, so every forward is a reason to open Tula. Reminders bring them back, and the Today screen is the one place that answers "what's due?". If Tula saves even one form or submission, that's the story they tell friends.

### How we'll know it works (pilot targets)

| Metric | Target after 4 weeks | Why |
| --- | --- | --- |
| Captures per active student per week | 3 or more | Shows the share habit is real |
| Students still capturing in week 4 | 30% or more of those who installed | Retention is the real test, not installs |
| Extractions saved without edits | 85% or more | Below this, students stop trusting it |
| Self-reported missed deadlines | Fewer than in the 4 weeks before the pilot | The outcome we promise |
| "How disappointed would you be if Tula disappeared?" | 40% or more say "very" | Standard product-market-fit signal |

## What happens to what we've built

**About 70% of the prototype carries over.** The deadline radar and the brain dump are already the heart of the new MVP. Nothing gets deleted from Git; we just change what's switched on.

| Existing piece (in the repo) | Decision | Why |
| --- | --- | --- |
| Deadline radar (next 72 hours, never hides snoozed items) | Keep, make central | This is the promise of the new product |
| Brain dump to tasks (AI extraction with a review step) | Keep, extend | Same engine becomes Share to Tula; add "what to submit" and "link" fields. Screenshots and PDFs wait for the Android app *(amended)* |
| Planning score (urgency, stakes, size, age bonus) and 2 or 3 picks | Keep | Still the right logic for "what do I do today" |
| "Break it into tiny steps" | Keep, low priority | Useful for big submissions; not a reason to install |
| Pastel design tokens and fonts | Keep | Distinctive and calm, and it already works in light and dark |
| Daily mood, energy and stress check-in | Redesign | Replace with one optional question: "How much time do you have today?" It keeps the useful planning input without making Tula a mood app |
| Calm mode | Redesign, demote | Becomes a small "Too much? Show just the next step" button. It's a nice touch, not the product |
| Water, movement and eye nudges | Deprioritize (off by default) | Off-strategy for the MVP; Saksham sir's point stands |
| Weekly reflection (stress stats) | Redesign later | Becomes "what you finished and what's coming"; drop the mood stats |
| Landing page | Rewrite copy, keep design | The old copy sold wellbeing; the new copy sells deadlines sorted by stakes |

## Technical feasibility

**Everything in the MVP works without anyone's approval, and AI costs are close to zero at pilot scale.** The stack stays as planned in [ROADMAP.md](ROADMAP.md): an Expo (React Native) Android app, Supabase for sign-in and database, and AI calls through a server function so the API key never ships in the app.

### AI cost

One capture is roughly 2,000 input tokens (instructions, the answer format, and a screenshot) and 200 output tokens. On Gemini 3.5 Flash-Lite, Google's current small model, listed at $0.30 per million input and $2.50 per million output tokens (Google pricing, checked 12 Nov 2026), that's about $0.0011, or ₹0.10, per capture. *(amended: the original estimate used the older 2.5 Flash-Lite at a quarter of the price)*

- 50 pilot students × 5 captures a week × 4 weeks = 1,000 captures ≈ $1.10 total
- 10,000 students × 20 captures a month = 200,000 captures ≈ $220 a month

Use the paid tier from the first real student: on the free tier Google may use the content to improve its products, and the privacy policy promises it won't.

Prices change often, so we re-check before launch and keep the model swappable behind one server function.

### Integrations: what works now, what needs approval, what to avoid

| Integration | Status | Notes |
| --- | --- | --- |
| Android share sheet (Share → Tula) | Works now | Standard Android feature. In Expo it needs a share-intent library and a custom development build (not Expo Go); we prove this early in the build |
| Screenshot and PDF reading | Works now | Gemini models accept images; PDFs can be converted to text or images server-side |
| Local scheduled reminders | Works now | Fire even when the app is closed; no server needed |
| Google Calendar export | Needs approval at scale | Fine for up to 100 test users in Google's testing mode; needs Google app verification before a public launch |
| Google Classroom import | Needs approval at scale | A student-only read scope exists (`classroom.coursework.me.readonly`) (Google). Many colleges use Classroom, so it's a strong Phase 2 feature |
| WhatsApp bot (forward to a Tula number) | Later | Needs Meta business setup; utility messages cost about ₹0.115 each in India (WhAutomate). Good alternative channel once the share flow is proven |
| Gmail reading | Avoid | Restricted scope; storing that data needs a yearly third-party security assessment (Google) |
| Reading WhatsApp chats automatically or scraping notifications | Avoid | No official way to do it, a privacy red line, and a Play Store policy risk |
| Live price data and coupon checks | Avoid | Amazon's product API requires 10 qualified sales in the last 30 days (Amazon); scraping is fragile |

### Privacy and age

- Store only what the student shares and confirms. The raw screenshot is deleted after extraction unless they choose to keep it
- One-tap "delete my data" from day one
- College students 18+ only for now. India's DPDP Act defines a child as anyone under 18 and requires verifiable parental consent before processing their data (PIB; DPDP Rule 10). "Students in general" can come later, once we can handle consent properly

### Real feature vs demo

The pilot ships only what genuinely works end to end on a real phone: share, extract, confirm, remind. No simulated "Tula booked it for you" actions.

## Roadmap *(amended: re-dated and re-shaped)*

**Validate by hand now, build through December around exams, pilot when the new semester opens.** The original plan ran six straight weeks from 26 Oct with the pilot ending 6 Dec. It hadn't started by 11 Nov, and shifting it as-is would put the pilot on end-semester exams and winter break.

1. **Discovery and concierge (16 – 29 Nov 2026).** 15 interviews (questions below). Two concierge tests, both run by hand:
   - *Individual:* 15 to 20 students forward deadlines to a Tula WhatsApp number. You enter them in a sheet and send reminders by hand.
   - *Class-wide:* one Tula number for one class section. The class rep forwards notices, and everyone who opts in gets one evening digest of what's due.

   **Gate:** at least 10 of 15 interviewees describe a scattered-information miss; individual concierge users forward 3+ items in a week; and students in the section read and act on the digest.
2. **Build (30 Nov – early Jan), sized around end-semester exams.**
   - *Foundations:* Expo app with sign-in (Supabase), the planning engine and date resolver ported from `app/index.html` into a tested TypeScript module, and a proof that Share → Tula works on a real Android phone.
   - *Capture:* extraction server function (text, screenshot, PDF), confirm card, deadline list and radar.
   - *Remind:* stakes-based local reminders, Today screen, duplicate and date-change handling, delete-my-data.
3. **Pilot (starts in the first two weeks of the new semester, January 2027; runs 4 weeks).** The exact start date comes from the academic calendar. New groups, subjects and deadlines all arrive at once, which is the best moment to onboard a whole section. Recruit 30 to 50 students. Fix extraction errors daily. Run a 2-minute check-in survey each week and do 8 exit interviews at the end.
4. **Decide (end of pilot week 4)** using the criteria in the Validation section. Then plan Phase 2 only for what pilot students asked for most.

**Split the work:** one of you owns the app and server function; the other owns interviews, the concierge pilots, recruiting and the landing page. Swap for code review twice a week.

## Validation

**Test the behaviour before the code: will students actually forward deadlines?** The concierge pilot answers that for free.

### Interview questions (20 minutes, ask about the past, not hypotheticals)

1. Tell me about the last deadline you missed or nearly missed. What was it, and what happened?
2. Where did you first hear about it? (WhatsApp group, Classroom, email, notice board, Unstop, a friend)
3. How many WhatsApp groups are you in for college, societies and opportunities? Can you show me?
4. How do you keep track of deadlines today? Starred messages, screenshots, notes, calendar, nothing?
5. Show me your screenshots folder. How many are notices you meant to act on?
6. What did missing it cost you? (marks, an internship, money, stress)
7. Have you tried an app for this? Why did you stop?
8. Do you use Gemini's student hub or ChatGPT to track deadlines? What happens when you do?
9. *(added)* Show me how you'd save this notice with your phone or Gemini today. (Hand them a real notice. If what they do is already enough, the single-player app isn't worth building.)
10. If you could forward any notice to something that would make sure you act on it, what would you forward this week?

**Listen for:** scattered sources, specific losses, and workarounds they've built themselves. Also ask which of these they already use: Todoist, TickTick, Vidyantar, InterSemester, a WhatsApp reminder bot. Don't pitch Tula until the last question.

### Recruiting

- Your three tech communities and the AARVAK and HackerRank VIPS Crew members: post in the groups and ask for 15 people to try a "deadline concierge"
- For the class-wide test, pick one section where you know the class rep
- Ask each pilot student to invite one friend in a different college, so we learn beyond VIPS
- Target hackathon and internship hunters first; they have the most non-academic deadlines

### Continue, change or stop (end of pilot week 4)

| Signal | Continue | Change direction | Stop this direction |
| --- | --- | --- | --- |
| Students still capturing in week 4 | 30% or more | 15–30% | Under 15% |
| Captures per active student per week | 3 or more | 1–3 | Under 1 |
| "Very disappointed" without Tula | 40% or more | 20–40% | Under 20% |
| What interviews say | "It saved a deadline I'd have missed" | "Nice, but Gemini or my own system works" | "I don't really miss deadlines" |

If we change direction, the most likely moves are to one narrower, high-stakes slice (internship and placement deadlines only, where a miss costs the most) or to the class-wide board if the section test outperforms the individual one. If we stop, the planning engine and capture flow are still reusable.

## Risks, honestly

**The risks that could kill this are the phone or Gemini being "good enough" and students not forming the share habit.** Everything else is manageable.

| Risk | How likely | What we do about it |
| --- | --- | --- |
| Too similar to free AI tools. Gemini's student hub already offers deadline tracking to the same students for free | High | Win after capture: non-academic deadlines, extensions and duplicates, reminders that chase you. Ask interviewees directly whether Gemini already does this for them |
| *(added)* Platforms absorb capture. Gemini, Apple, Samsung and Nothing already turn a screenshot into a calendar event; Meta AI could one day read a group | High | Don't sell capture. Build what platforms won't: a student's deadline record over time and a class-wide board |
| *(added)* Close competitors move first. Vidyantar (Delhi, free, deadlines + attendance + internships) and Hello Aria (WhatsApp-native, student use case) are early but aimed at the same students | Medium | Check the watch list monthly. Consider talking to Vidyantar's founder |
| Students won't take the extra step to share | Medium | The concierge pilot tests this before we code. Make sharing take 2 taps and the confirm card take 3 seconds |
| Wrong extraction (wrong date, AM/PM, "next Friday") | Medium | Code resolves dates, the model only proposes; always confirm before saving; show the source text next to the extracted date; flag vague dates; track the edit rate daily |
| Trying to solve too much again | High (it's our habit) | The "Build now / later / avoid" list below is the contract. New ideas go into a parking-lot doc until the pilot ends |
| Privacy worries (screenshots contain classmates' names and numbers) | Medium | Delete raw images after extraction, store only the fields, one-tap data deletion, clear plain-language privacy note |
| Demo vs habit. It impresses in a pitch, then nobody opens it in week 3. Judges and mentors have also seen this demo many times | High | We measure week-4 retention, not installs or demo reactions |
| AI and API costs | Low | About ₹0.10 per capture; the model sits behind one server function and can be swapped |
| Platform dependence (Android share APIs, model pricing) | Low to medium | Use only standard, documented APIs; no scraping |
| Founder bandwidth alongside college, hackathons and other projects | High | One MVP, one owner per area. If we can't protect about 10 hours a week each, shrink the scope, not the quality |

## Build now, later, avoid

**This list is the scope contract until the pilot ends.**

| Build now (MVP) | Build later (only if the pilot asks for it) | Avoid for now |
| --- | --- | --- |
| Concierge WhatsApp pilot (by hand), individual and one class section | Google Classroom import | Price comparison and coupon checking |
| Expo Android app with Supabase sign-in | Google Calendar export | Gmail reading |
| Share → Tula for text, screenshots and PDFs | Forward-to-Tula WhatsApp number | Reading WhatsApp chats or scraping notifications |
| AI extraction with a confirm card; dates resolved by code | Class-wide deadline board (build only if the section test shows signal) | General bookings and email agent |
| Deadline radar, Today picks, 2 or 3 a day | Study plan for exam weeks | Mood tracking as a core feature |
| Stakes-based reminders that work when the app is closed | Student perks list (verified, curated by hand) | Users under 18 |
| Duplicate and date-change detection, with a visible history | Chat with Tula about your deadlines | iOS, payments, a companion character |
| Delete-my-data, privacy note | Weekly "done and coming up" summary | Anything we can't actually make work end to end |
| New landing page copy | | |

## Sources

Pages opened or searched on 25 Oct 2026. Scores, cost estimates and pilot targets in this doc are our own judgments, not sourced facts. The links did not survive when this doc was copied into the repo, so sources are listed by name.

- Google: College students get 12 months of Google AI free
- Google India: One year of Gemini, on us
- OpenAI: Introducing study mode
- Indian Express: ChatGPT Go free in India
- MyStudyLife
- Ahead AI student planner
- The College Agent
- BuyHatke and How BuyHatke earns
- UNiDAYS India
- Unstop: About
- TheNewViews: Best internship trackers 2026
- Frontiers in Education: WhatsApp and first-year students
- Baishya & Maheshwari: WhatsApp groups in academic context (ERIC)
- Gemini API pricing
- Google Classroom API: Manage CourseWork
- Google: Restricted scope verification
- Amazon Product Advertising API: error messages and eligibility
- WhAutomate: WhatsApp API pricing India
- PIB: DPDP Rules 2025 notified
- DPDP Rule 10: Verifiable consent for children
