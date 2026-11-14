# Tula: competitor research

Searched and read on 11 Nov 2026. This is the research that amended [STRATEGY.md](STRATEGY.md).

## Verdict

**Turning a WhatsApp message or screenshot into a deadline is no longer a differentiator; it's a commodity.** About 45 related products and projects turned up, and more than 30 of them already turn a message, screenshot or notice into a dated reminder. They include phone-level AI from Apple, Google, Samsung and Nothing, a consumer app with 100K+ downloads, WhatsApp bots, and eight student hackathon projects built in September and October 2026 alone, most of them visibly made for Indian college WhatsApp groups.

**What nobody has yet:** a product that is student-first, India-first and captures from the mess, and that keeps students coming back. The student apps (Wick, MyStudyLife, Vidyantar, InterSemester) rely on manual entry, LMS sync or timetables. The capture apps (Ping, Photo2Calendar, Any.do, Gemini) are general-purpose and know nothing about stakes, attendance, internships or a class's WhatsApp group. Only hackathon demos sit in the corner Tula is aiming at, and none of them shipped as a product.

What this changes:

1. **Capture alone won't win.** A student can already screenshot a notice and tap "Add to calendar" on a recent iPhone, a Pixel or a Samsung with Gemini. Tula has to be clearly better after capture: stakes-aware reminders, a deadline that tracks extensions and duplicates across groups, and a daily "what's due" view.
2. **The strongest unclaimed angle is the class, not the individual.** One person (a class rep or society lead) forwards a notice, and everyone in the section gets the deadline. No competitor found does this for Indian college groups. It also solves distribution.
3. **Watch two close competitors:** Vidyantar (Delhi, free, deadlines + attendance + internships + a daily AI briefing) and Hello Aria (Indian company, WhatsApp-native, has a student use case). Both are early.
4. **The repositioning plan still stands, with three edits.** Sharpen the landing copy away from generic capture, add a batch-sharing test to the pilot, and fix the pilot dates so they don't fall on end-semesters. Details in the last section.

## At a glance

The student planners rely on typed-in or synced deadlines; the capture tools are built for everyone. The corner where Tula aims, student-first and capturing from the mess, holds only hackathon demos. Placement is by quadrant, not exact position.

| | Deadlines typed in or synced | Captured from the mess |
| --- | --- | --- |
| **General-purpose** | Todoist, TickTick | Ping, Photo2Calendar, Any.do's WhatsApp bot, Gemini, phone-level AI |
| **Student-first** | Wick, MyStudyLife, Vidyantar, InterSemester, Gemini student hub | Hackathon demos only (NoticeIQ, Aalsi, tl;dr and others). **Tula aims here** |

## Closest competitors: capture apps

**These already do Tula's core trick, turning a message, screenshot or PDF into a dated item, for a general audience.** None is built around students, stakes or Indian college life.

| Product | What it does | Platform and reach | Gap Tula can use |
| --- | --- | --- | --- |
| Ping: AI To-Do & Reminders | Voice, starred email or photo becomes a task with a due date; the listing explicitly says "turn WhatsApp messages, notes and screenshots into actions"; Google Calendar sync | Android, iOS, desktop; 100K+ downloads on Play | General to-dos and team boards; no stakes, no student context |
| Photo2Calendar | Photo, screenshot, text, PDF or audio becomes calendar events; share from any app; uses Gemini | Android and iOS; 10K+ downloads, 4.5★ | Events only, no reminders logic; subscription for multi-event |
| Toki | Voice notes, texts, screenshots and forwarded emails become calendar events | Mobile, multilingual | A calendar app, not a deadline tracker |
| Sense | Screenshot a group chat (it names WhatsApp and Hindi) and the date lands on a family calendar; multiple events per screenshot; relative dates | iOS share sheet; Android needs opening the app | Built for parents and families |
| SnapCal | Screenshots of chats, posters and notices become events; share sheet; screenshot not kept | iPhone only; 10 free reads a month | No Android, which is where Indian students are |
| Remy | Screenshots, emails, tickets and flyers become Apple Calendar events, with a review step | iPhone only | Same |
| Clutch | Screenshot to tasks and deadlines; names "students tracking assignments" as a use | iPhone; 5 free extractions a week | Small, iOS-only |
| Agenda Hero, Trace, CalendarBridge | Text and image to calendar events | Mixed | General calendars |

WhatsApp-native bots that turn forwards into tasks:

| Product | What it does | Gap |
| --- | --- | --- |
| Any.do WhatsApp bot | Forward any WhatsApp message to the bot and it becomes a task; reminders arrive in WhatsApp; voice notes; 29+ languages | Premium only; you add the reminder time yourself |
| Forwardo | Forward a text or voice note; AI extracts task, date and time; reminds the day before and an hour before | Waitlist; aimed at freelancers and parents |
| Hello Aria | WhatsApp, Telegram and iOS assistant with a student page: assignment deadlines, exam countdowns, group projects. Run by Realityrift Innovations Pvt. Ltd. (India) | You tell it deadlines; $4 a month after a trial; generalist |
| TidyBoard, Done-Copilot, Tickly, TodoBuddy, Donna | WhatsApp task and reminder bots | Business or personal reminders; nothing student-specific |

## Platform threats

**The phone itself is learning to do capture, which makes a capture-only app a feature that platforms will absorb.** What platforms don't do yet is remember what matters to a student, chase them before a form closes, or share a deadline with a whole class.

| Platform | What it does today | Who has it | What it leaves open |
| --- | --- | --- | --- |
| Gemini on Android | Creates events in Google, Samsung, Xiaomi, OPPO, HONOR and TECNO calendars from a prompt or an image; can read the screen. Free for Indian college students under the Google AI Plus student offer | Most Android phones in India | One event at a time on request; no deadline list, stakes or follow-up |
| Apple Visual Intelligence (iOS 26) | Screenshot anything, tap Add to Calendar; ZDNET found it more reliable than Android equivalents | iPhone 15 Pro and newer only | Few Indian students have those iPhones; one event per screenshot |
| Nothing Essential Space | One press of the Essential Key captures a screenshot; since March 2026 it automatically extracts events and shows upcoming reminders | Nothing phones with an Essential Key (Phone 3a series onward) | Only on Nothing phones; general-purpose |
| Samsung Now Nudge and Now Brief | Reads what's on screen and suggests adding a calendar event; daily brief of events | Recent Galaxy phones | Suggestions, not a tracker |
| Pixel Screenshots | Suggests reminders or calendar events from dates in screenshots, on-device | Pixel only; limited countries | Tiny share in India |
| Meta AI in WhatsApp | Scheduled tasks and reminders inside the Meta AI chat | Everyone on WhatsApp where Meta AI is available | You type the reminder; it doesn't read your groups |

**The real platform risk:** if WhatsApp lets Meta AI read a group and pull out deadlines, the single-player version of Tula is in trouble. That's another reason to build what platforms won't: a class-wide deadline board that students and class reps maintain together.

## Student planners and AI study apps

**Student apps get deadlines from LMS sync, syllabus scans or manual entry, the way US colleges work.** Indian deadlines mostly arrive mid-semester as WhatsApp notices, so these tools miss the input that matters most here.

| Product | How deadlines get in | Notable | Where it falls short for Tula's user |
| --- | --- | --- | --- |
| Wick | Syncs Canvas, Moodle, Blackboard, D2L; syllabus upload; text brain dump | Texts you every morning with what's due and checks in each evening; Android and iOS | Built around US LMSs; small (1,000+ Play downloads) |
| MyStudyLife | Snap a timetable, or tell its AI coach "Scout" | 10M+ students, free; reminders before every deadline | School-timetable model; no WhatsApp capture |
| The College Agent | Upload a syllabus once; connects to Gmail, Canvas, calendars and 250+ apps | Pitches itself as "the AI assistant built for college life", including internships | US-focused; proves the category exists |
| Ahead | Scan a syllabus | Semester plan, reminders, streaks and XP | iOS only; syllabus-driven |
| College Life | Snap a syllabus; Canvas, Blackboard, Moodle sync | Class check-in rewards; AI assistant at $4.99 a month | US campus app |
| Gemini student hub | Upload course material | Free for Indian college students for a year; "track deadlines" | Course material, not WhatsApp notices |
| CampusCat, Study Edge (Tracxn) | Syllabi, slides, recordings | 2026 startups, study-management AI | Study tools, not deadline capture |

Institution-side tools are a different market. Risely AI (YC S25) sells AI agents to universities; Indian ERPs such as Opexal, Placenex and Campusboard sell to colleges and placement cells. They can be partners later (a college pushing notices into Tula), not competitors for the student.

## India: early startups and student projects

**Indian students are already building this, in public and fast, but almost all of it is either a manual dashboard or a weekend demo.** Two products are worth tracking closely.

### Early products

| Product | What it does | Stage | Overlap with Tula |
| --- | --- | --- | --- |
| Vidyantar | Free web dashboard for Indian college students: timetable, 75% attendance calculator, deadline tracker, competition rounds, internship manager, and a daily AI briefing ("Daily Drishti") | Built by a second-year SRCC (Delhi) student; LinkedIn cites a 54-student survey where 61% had missed a deadline or been caught out by attendance | High on positioning and audience, the same city included. The site doesn't say it captures from WhatsApp or screenshots |
| InterSemester | Android app for a whole batch: live timetable, room changes, assignments and deadlines; claims to bring in Teams, Classroom, ERP portals and "WhatsApp batch updates" | Free on Play; testimonial from KIIT | High on the batch idea; focused on timetables and class changes |
| Campus Buddy | Notes, PYQs, placement prep, resume builder, "smart notices" | Android, 1,000+ users claimed | Low; a study and career app |
| Hello Aria | WhatsApp assistant with a student use case (see above) | Indian company, NVIDIA Inception | Medium; WhatsApp-native but generalist |
| NOTIFYi, AR Platform | Admission and entrance-exam deadline alerts | Admissions counselling | Low; school-leavers, not college life |

### Hackathon and open-source projects (all 2026)

These prove the pain is real and widely felt. They also mean judges, mentors and investors have seen this demo many times.

| Project | Approach | Status |
| --- | --- | --- |
| NoticeIQ (Metamorph 2.0, Sep 2026) | Screenshot, PDF or text → structured tasks → real push notifications with the app closed; Gemini for images, Groq for text | Best Beginner Project; closest to Tula's MVP |
| Aalsi (Oct 2026) | Exported WhatsApp chat → local Gemma → deadlines, tracks postponements, "you may have missed" list; Hinglish | Local-only demo |
| tl;dr (Oct 2026) | WhatsApp export → deadlines with history ("postpone ho gaya"), .ics file | Demo |
| NoticeCatcher (Oct 2026) | WhatsApp export → Qwen3-8B; dates resolved by code; flags vague notices | Demo |
| College Copilot (Oct 2026) | WhatsApp exports, notice PDFs, screenshots → "what matters for me today", attendance math | Demo |
| WhatsApp Group Digest, Deadline Decoder, CampusLens (Oct 2026) | Notice or chat → actions and deadlines | Demos |
| DeadlineGuard AI, AI Notice Board | Notices from boards, email, WhatsApp, OCR → opportunities ranked by eligibility and deadline | Open-source and hackathon |

**What to borrow from them:** "the model proposes, plain code decides" for dates (NoticeCatcher, College Copilot); tracking a deadline's history when it's postponed (Aalsi, tl;dr); flagging vague dates instead of guessing (NoticeCatcher). All three are now in the web prototype.

## Adjacent tools

**These aren't direct competitors, but students may use them instead of Tula, so interviews should ask about them.**

| Category | Examples | Why it matters |
| --- | --- | --- |
| General to-do apps with AI capture | Todoist (speak to add tasks), TickTick (AI assistant, voice add) | Many students already keep a to-do list; Tula must be clearly faster at capture |
| Opportunity platforms | Unstop (32M+ students), Internshala | The source of many hackathon and internship deadlines; they often redirect to another WhatsApp group for updates |
| Deadline trackers as content | TheNewViews internship deadline tracker | Curated public deadlines; a possible data source, not a personal tracker |
| No-code alert agents | CodeWords college application tracker | Watches college websites and sends WhatsApp alerts; shows demand for alerts on WhatsApp |
| College WhatsApp broadcasting | AiSensy for education | Colleges pushing fee and exam reminders via the WhatsApp API; a future partner channel |

## What this means for the repositioning plan

**The plan to reposition the repo is right; three of its choices changed because of what's out there.**

### Keep

- **Dropping wellbeing as the positioning.** Nothing in this research suggests mood tracking would set Tula apart.
- **The confirm card ("nothing saves without your tap").** Every serious capture app (SnapCal, Remy, Sense, Photo2Calendar) has a review step. It's table stakes, so ship it, but don't market it as special.
- **Duplicate and date-change detection.** This is the hard part the hackathon projects spend most of their effort on (Aalsi, tl;dr). It's also what platform "Add to calendar" buttons can't do. Make it a headline feature.
- **The honest no-AI fallback** and "PDFs come with the Android app".

### Change

1. **Landing hero copy.** "Forward it to Tula. Never miss a deadline again." is close to what Ping, Any.do and Forwardo already say. Lead with what's specific to Tula's student: "Every deadline from your college groups, sorted by what's at stake." Promise the class-wide feature only once it exists.
2. **Pilot dates.** A pilot on 14–27 Dec lands on end-semester exams and winter break. Run interviews and the concierge test now, and start the app pilot in the first two weeks of the new semester (January 2027). That's when new groups, subjects and deadlines arrive all at once, which is the best moment to onboard a whole section.
3. **Effort in the prototype.** Spend less on screenshot input (phones are absorbing it) and more on the deadline record over time: extensions, duplicates across groups, stakes-based reminders and the daily "what's due" view.

### Add

1. **A class-wide test in the concierge week.** Run one Tula WhatsApp number per class section: the class rep forwards notices, and everyone who opts in gets one evening digest of what's due. It costs no code and tests both the network effect and the distribution loop.
2. **A platform question in every interview:** "Show me how you'd save this notice with your phone or Gemini today." If students say that's enough, the single-player app isn't worth building.
3. **A watch list, checked monthly:** Vidyantar, InterSemester, Hello Aria, Ping, Any.do's WhatsApp bot, and WhatsApp's Meta AI.
4. **Optional: talk to Vidyantar's founder.** Same city, same problem, a dashboard rather than capture. That could make them a partner, or at least a useful reference for what Delhi students use.

## Sources and limits

Download counts and claims come from each product's own store listing or site and weren't independently verified; user numbers for small Indian products are self-reported. The Play Store couldn't be checked exhaustively for India-only apps, so expect a few more small apps to exist. The links did not survive when this research was copied into the repo, so key pages are listed by name.

- Ping on Google Play
- Photo2Calendar on Google Play
- Any.do WhatsApp reminders and tasks
- Hello Aria for students
- Vidyantar, and Vidyantar on LinkedIn
- InterSemester
- Wick on Google Play
- NoticeIQ on Devfolio
- Gemini Apps: calendar events
- Apple: visual intelligence
- Nothing Essential Space
- WhatsApp: schedule tasks with Meta AI
- Risely AI on Y Combinator
