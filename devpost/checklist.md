---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. You can place a morning bet and settle it tonight**
  Becomes usable: Double-click `index.html`, see the hook drop in, tap a stake, enter a morning balance, tap "Skip to tonight", enter a night balance, and get a Win/Lose verdict. Today's bet and verdict are still there after closing and reopening the browser. Already looks hand-drawn and sepia, not like a default web page.
  Why now: This is the unique kernel, so it comes first. It also proves the riskiest assumption from the spec straight away: that `localStorage` keeps data on a double-clicked `file://` page. The scaffold, storage, date helpers, rules math, and base look are all built inside this slice because the bet needs them.
  PRD ref: `prd.md > The Core Journey` (steps 1–3, 5–6), `prd.md > Morning Bet`, `prd.md > Night Check-in and Verdict`, `prd.md > Demo Buttons` (Skip to tonight), `prd.md > States and Boundaries`, `prd.md > Look and Feel`
  Spec ref: `spec.md > How This Works, In Plain Language`, `spec.md > Stack`, `spec.md > Look and Feel`, `spec.md > Components` (App Shell and Navigation, Storage, Dates and Time, Rules, Home Screen, Rules Check Page), `spec.md > Data Model`, `spec.md > File Structure`, `spec.md > Important Failure Modes`
  Build: Create `index.html` (sidebar with Home active, toggle slot, screen sections, pop-up layer, SVG `#wobble` filter, scripts in spec order), `css/theme.css` + `css/layout.css` + `css/components.css` with the day sepia palette, fonts, paper grain, and wobbly borders, `js/storage.js`, `js/dates.js`, `js/rules.js` (cents; `limitFor`, `incomeOn`, `settleDay`), `js/home.js` with the four Home states, input validation, and Skip to tonight, `js/app.js` startup, and `tests.html` with the PRD verdict examples.
  Verify (mechanical): Load `tests.html` in headless Chrome and confirm every PRD example shows PASS. Load `index.html` from `file://` in headless Chrome and confirm it renders Home with no script errors. Run a headless script that places a bet, settles it, reloads the page, and confirms the verdict is still read back from `localStorage`.
  Learner check: Double-click `index.html`. Tap $3, type 50 as your morning balance, confirm, tap "Skip to tonight", type 48, and settle. You should see **Win** with $2 spent against a $3 limit. Close the browser, open `index.html` again, and the verdict should still be there. Say whether the look feels like the hand-drawn gothic style you pictured.
  Commit: `Add morning bet and night verdict`

- [x] **2. Wins and losses have stakes that stick**
  Becomes usable: A win raises the streak and stamps a small achievement pop-up. A loss resets the streak to 0, and the next morning shows the "$0.50 penalty" notice and lowers the limit. A day you skip or don't settle counts as a loss when you come back.
  Why now: This finishes the kernel, the part that makes it a bet against yourself rather than a calculator. It's also where the date logic (missed days, new day at midnight) can go wrong, so it gets tested before anything is built on top of it.
  PRD ref: `prd.md > Streaks and Achievements`, `prd.md > Morning Bet` (penalty after a loss), `prd.md > States and Boundaries` (day after a loss, penalty larger than the bet)
  Spec ref: `spec.md > Components` (Rules, Catch-up on Open, Achievement Pop-ups, Home Screen), `spec.md > Data Model`
  Build: Add `penaltyFor`, `currentStreak`, and `achievementsFor` (win) to `js/rules.js`; add `js/catchup.js` (missed or unsettled days up to yesterday → loss, run on open and on window focus); add `js/achievements.js` (stamped pop-up queue); show the streak, win pop-up, and penalty notice on Home. Extend `tests.html` with the penalty, $0 floor, streak, and missed-day cases.
  Verify (mechanical): Load `tests.html` headless and confirm all cases PASS, including $3 after a loss → $2.50, $0.50 bet with penalty → $0, and a missed day breaking the streak. Run a headless script with seeded data (yesterday a loss, the day before missing) and confirm Home shows the penalty notice and a streak of 0.
  Learner check: Do a winning day (morning 50, night 48) and watch the achievement pop-up and streak go to 1. Then, to see a loss, open DevTools (F12) → Console and paste the line I'll give you to pretend yesterday was a loss, refresh, and check that Home shows the penalty notice and tapping $3 gives a $2.50 limit.
  Commit: `Add streaks, penalties, and win achievements`

- [x] **3. One balance: the Diary is your money, and income can't hide spending**
  Becomes usable: The sidebar switches between Home and Diary. The Diary asks "money you have this month" once (on first use and at the start of each month), then shows this month's balance and lets you add spending and income entries, newest first. Home shows that same Diary balance as "Money you have" (no typing), and locking in the bet freezes it as the morning balance. Tonight's verdict adds income logged since the bet, so getting paid can't hide overspending, and if your night number is lower than the Diary, the difference is added as "Unlogged spending" so the Diary stays true.
  Why now: The verdict formula isn't complete without income, and the PRD's "income $100" example only passes once this exists. The pre-fill and monthly starting money belong here because both are about the two money numbers the Diary and Home share. It also brings in sidebar navigation, which the Streaks screen needs next.
  PRD ref: `prd.md > The Core Journey` (steps 3–4), `prd.md > Morning Bet` (one balance), `prd.md > Diary`, `prd.md > Night Check-in and Verdict` (income example), `prd.md > States and Boundaries` (first use, new month)
  Spec ref: `spec.md > Components` (Rules, Home Screen, Diary Screen, App Shell and Navigation), `spec.md > Data Model`, `spec.md > Decisions and Open Issues`
  Build: Add `js/diary.js` (once-a-month "money you have this month" question pre-filled from where last month ended, a "fix" link, this month's balance, add-entry form with validation, this month's entries, empty-state prompt); store starting money per month in `diary.startingBalances`; add `rules.monthBalance`, `rules.monthStartSuggestion`, `rules.unloggedSpending`, and `incomeOn(..., sinceTime)`; Home shows the Diary balance read-only (or asks for this month's money), saves `morningBalance` and `betAt` at lock-in, and adds unlogged spending at settle; wire sidebar navigation in `js/app.js`. Extend `tests.html` with income-since-bet, unlogged spending, new-month suggestion, and per-month balance cases.
  Verify (mechanical): Load `tests.html` headless and confirm all cases PASS (existing verdict examples unchanged; income before the bet not counted twice; unlogged spending; new-month suggestion; balance counts only this month). Run a headless script for the team's example (Diary $100, $5 coffee before the bet → Home $95 and bet saves $95; $5 lunch after → Diary $90, morning stays $95; night $90 → **Lose**, $5 spent), then $100 pay before the bet + night $194 → $6 spent, $6 "Unlogged spending" added, Diary $194, next morning Home $194; and a new month asks on Home pre-filled from last month's end.
  Learner check: Reset, open Diary, answer 100, log "coffee, 5, Spending", and see Home show $95. Bet $3, then log "lunch, 5, Spending": the Diary shows $90 but Home's morning balance stays $95. Skip to tonight, enter 84, and you should **lose** with $11 spent, and the Diary should gain a $6 "Unlogged spending" entry and show $84.
  Commit: `Add diary with one shared balance and unlogged spending`

- [ ] **4. Wins add up toward a monthly saving goal**
  Becomes usable: Below the bet, you set a monthly saving goal. Each win adds the unspent part of your limit to "Saved this month", a progress bar fills, and reaching the goal stamps the big monthly achievement. Savings reset when a new month starts.
  Why now: The 30-day demo in the next slice fills savings and must trigger this achievement, so the goal has to exist first.
  PRD ref: `prd.md > Monthly Goal`, `prd.md > Streaks and Achievements`
  Spec ref: `spec.md > Components` (Home Screen, Rules, Catch-up on Open, Achievement Pop-ups), `spec.md > Data Model`
  Build: Add the Monthly Goal card to `js/home.js`; add savings on win and the `monthly` case to `rules.achievementsFor`; add the month reset to `js/catchup.js`; add the monthly pop-up. Extend `tests.html` with saving and month-reset cases.
  Verify (mechanical): Load `tests.html` headless and confirm the new cases PASS (a win at a $3 limit spending $2 adds exactly $1; a stored goal from last month resets to $0). Run a headless script that sets a $1 goal, wins a day, and confirms the monthly achievement was recorded.
  Learner check: Set a goal of $1, then win a day with a $3 bet (morning 50, night 48). Saved this month should show $1.00 and the monthly achievement should pop up.
  Commit: `Add monthly saving goal and achievement`

- [ ] **5. You can look back at your streak, and fast-forward 30 days for the demo**
  Becomes usable: The Streaks screen shows your current streak and an activity grid (green win, red loss, gray no data, today outlined). "Skip to 30 days of success" fills 30 winning days, adds their savings, and shows the 30-day grand achievement, plus the monthly one if the goal is reached.
  Why now: Looking back only means something once wins, losses, and savings exist. The 30-day button is the demo's big finish, so it is built on top of the real rules rather than faking them.
  PRD ref: `prd.md > The Core Journey` (steps 7–8), `prd.md > Streak Viewer`, `prd.md > Demo Buttons` (Skip to 30 days of success), `prd.md > Streaks and Achievements` (30-day grand achievement)
  Spec ref: `spec.md > Components` (Streak Viewer, Demo Buttons, Rules, Achievement Pop-ups), `spec.md > Data Model`
  Build: Add `js/streaks.js` (streak number plus a grid from the start of last month to today in rows of 7); add the Streaks screen to navigation; add the `grand30` case to `rules.achievementsFor`; add the "Skip to 30 days of success" button in a labeled Demo corner of Home, writing `demo: true` sample days ending yesterday.
  Verify (mechanical): Run a headless script that taps "Skip to 30 days of success" with a $100 goal and confirms: streak 30, 30 green squares, `grand30` and `monthly` achievements recorded, savings about $150. Confirm the Streaks number matches the Home streak.
  Learner check: Set your goal to $100, tap "Skip to 30 days of success", and watch both achievements pop up. Open Streaks: you should see a row of green squares and a streak of 30. Win today too, and it should become 31 with today's square turning green.
  Commit: `Add streak grid and 30-day demo`

- [ ] **6. Day and night themes, and the app is ready to show**
  Becomes usable: The top-right toggle flips the whole app between sepia day and dark night, and it remembers your choice. A README explains how to run, reset, and record the demo.
  Why now: The base sepia look ships in slice 1 so every screen is styled from the start. Adding the second theme last means it is tested against every finished screen at once, and the final polish pass fixes anything that looks off.
  PRD ref: `prd.md > Day/Night Toggle`, `prd.md > Look and Feel`, `prd.md > States and Boundaries` (theme persists)
  Spec ref: `spec.md > Components` (Day/Night Toggle), `spec.md > Look and Feel`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Decisions and Open Issues` (localStorage boundary check)
  Build: Add `js/theme.js` and the night palette variables in `css/theme.css`; save and apply `data.theme`; write `README.md` (what it is, how to run, how to reset, demo steps).
  Verify (mechanical): Run a headless script that toggles the theme, reloads, and confirms `data-theme="night"` is applied on open. Search `js/` for `localStorage` and confirm only `js/storage.js` uses it. Re-run `tests.html` and confirm all PASS.
  Learner check: Tap the top-right toggle on each screen and check the night look feels right and everything is still readable. Close and reopen, and the theme should still be night.
  Commit: `Add day/night theme and README`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 2, the full bet → verdict → streak/penalty loop with the base look, while feedback can still shape the Diary, Streaks, and final look (done: learners tried win, penalty, and pop-up; worked, no changes requested)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Open Decisions

- ~~**Slice 3, morning pre-fill:** A (last night's number) or B (minus spending logged after settling)?~~ Decided: **B**, "so users rarely have to fix the number." Later replaced by the team's **one balance** design (see Revisions).

## Revisions

- Slice 3 now also pre-fills the morning balance from last night and asks for "money you have this month" once per month; the Diary balance counts only this month — the team decided during the slice 3 check that typing the two money numbers every time was too much for users who find even logging in a big ask. Updated `prd.md` (Core Journey, Morning Bet, Diary, States and Boundaries, Product Decisions) and `spec.md` (Core Journey, Rules, Home Screen, Diary Screen, Demo Buttons, Rules Check Page, Data Model, Decisions). The verdict formula is unchanged.
- Slice 3 morning pre-fill uses option B: last night's balance minus Diary spending logged after the check-in (income not added, never below $0). Day records now store `settledAt` and Diary entries store `at` (when logged) so the app knows what came after. Older entries without a time fall back to "dated after that day." Updated `prd.md > Morning Bet` and `spec.md` (Rules, Data Model, Decisions). The team chose B so users rarely have to fix the number.
- Slice 3 switched to **one balance**: during the learner check the team found the pre-filled morning field and the Diary's "money you have this month" were two different numbers that would confuse users. Home now shows the Diary balance read-only and freezes it at lock-in (`betAt` saved). The team chose that the bet covers from lock-in to night (spending before the bet is an accepted gap), and that settling automatically adds "Unlogged spending" when the night balance is lower than the Diary. To avoid counting income twice, the verdict only adds income logged after the bet. Option B's pre-fill (`lastClosingBalance`) was removed. Updated `prd.md` (Core Journey, Morning Bet, Night Check-in and Verdict, Diary, States and Boundaries, Product Decisions) and `spec.md` (Core Journey, Rules, Home Screen, Diary Screen, Data Model, Decisions).
