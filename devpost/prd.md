---
doc: prd
status: approved
---

# Beat Yourself (working title) — Product Requirements

A hand-drawn, gothic-style web app where students bet each morning on how little they'll spend, then settle up at night, competing against yesterday's self instead of just logging numbers.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Develops `scope.md > The Core Loop` and `scope.md > What "Working" Looks Like`.

1. **Arrive.** The user opens the web app. A sidebar on the left lists **Home**, **Diary**, and **Streaks**. Home is open.
2. **The hook.** On Home, the question *"Do you think you can beat yourself?"* drops in from the top half of the screen.
3. **Morning bet.** In the bottom half, the user reads *"Today I'll spend no more than…"*, taps **$2 | $3 | $5 | $10 | Custom**, and sees their **morning balance**, which is simply their Diary balance (typed by hand only on the very first day and once at the start of each month). Below that, they can set a **monthly saving goal** (e.g. $600).
4. **During the day (optional).** In **Diary**, the user logs money going out (spending) and money coming in (income). The diary balance goes down or up with each entry.
5. **Night check-in.** At night (or right away via the **"Skip to tonight"** demo button), the user enters their **night balance**.
6. **Verdict.** The app calculates **Actual spent = Morning balance + Income logged since the bet − Night balance** and compares it with today's limit. If the night balance is lower than the Diary balance, the difference is added to the Diary as "Unlogged spending."
   - **Win** (actual spent ≤ limit): the streak goes up by 1, a small achievement pops up, and the unspent amount (limit − actual spent) is added to this month's savings.
   - **Lose** (actual spent > limit): the streak resets to 0, and tomorrow's bet carries a $0.50 penalty.
7. **Look back.** In **Streaks**, the user sees an activity grid (green win, red loss, gray no data) and their current streak.
8. **Demo shortcut.** **"Skip to 30 days of success"** fills in 30 winning days, plus their savings, so the 30-day grand achievement and the monthly achievement can be shown on camera.

## Screens and Layout

- **Sidebar (left, always visible):** Home · Diary · Streaks.
- **Top right (always visible):** day/night theme toggle.
- **Home:** top half has the hook question, which drops in from above. Bottom half is the interactive area: the morning bet, then the monthly goal below it, and later in the day the night check-in and verdict.
- **Diary:** top shows the current balance (the money the user has this month). Bottom half is where the user adds spending and income entries and sees what they've logged.
- **Streaks:** an activity-graph grid of days plus the current streak number.

## Look and Feel
Source: learner's design direction during the PRD interview, building on `scope.md > Inspiration & Identity`.

- **Style:** hand-drawn gothic, inspired by the *feel* of Don't Starve. It should look like real hand drawing, **not** generic AI-app styling.
- **Colors:** sepia and dark tones, shaded in several layers.
- **Texture and lines:** paper texture, sketchy and uneven borders.
- **Rule:** inspired by, never copied. **No game assets** of any kind.
- **Themes:** day and night, switched with the top-right toggle (day = sepia paper, night = dark).
- **Tone:** competitive and a little provocative ("Do you think you can beat yourself?"). Say "stakes," never "gambling" (`scope.md > Inspiration & Identity`).
- **Streak grid colors:** green / red / gray, as the learner chose. *Assumption:* drawn in muted, sketchy shades so they fit the sepia style.

## Features and Behavior

### Morning Bet
Develops `scope.md > The Core Loop` (step 1).
- The user sees *"Today I'll spend no more than…"* with buttons **$2, $3, $5, $10, Custom**. Custom lets them type an amount.
- **One balance.** The **morning balance** is the Diary balance ("Money you have: $95.00, from your Diary"). It isn't typed; a "Fix it in Diary" link opens the Diary to correct it. Logging in the Diary before the bet updates it right away.
  - **First day ever, or first bet of a new month** (no starting money for this month yet): Home asks "Money you have this month" right there, pre-filled with where last month's Diary ended when there is one. Locking in saves it as this month's Diary starting money.
  - **Locking in freezes the morning balance** for the day. Later Diary entries change the Diary, not today's morning balance.
  - **The bet covers from the moment it's locked in until the night check-in.** *Known gap, accepted by the team:* spending done before the bet doesn't count against any day.
- [ ] Example: Diary $100, a $5 coffee logged before the bet → Home shows $95 and the bet saves $95; a $5 lunch logged after → the Diary shows $90 but the morning balance stays $95; night $90 → $5 spent → **Lose** at a $3 limit.
- Only one bet type exists: "spend no more than."
- **Penalty after a loss:** the morning after a loss (including a missed check-in), the user sees a notice like *"Because you lost yesterday, you have a penalty today: $0.50 comes off your spending limit."* Whatever they tap, today's limit is $0.50 lower (tap $3 → limit $2.50). The penalty is a flat $0.50 and does not stack.
- [ ] On Home, the bet sentence and all five buttons are visible, and tapping one clearly marks it as selected.
- [ ] Choosing Custom lets the user type an amount.
- [ ] After a loss, the next morning shows the penalty notice, and the confirmed limit is the tapped amount − $0.50.
- [ ] The bet can't be confirmed without an amount and a valid morning balance.
- [ ] After settling with a night balance of $48, the next morning's balance field shows $48.00, and the user can change it before confirming.
- [ ] On the very first day, the morning balance field is empty.
- [ ] After a skipped day, the field shows the latest night balance and says which day it's from.

### Monthly Goal
- Below the morning bet, the user can set a monthly saving goal (e.g. $600).
- **Suggested bet** = this month's starting money ÷ 30, the same every day of the month (e.g. $300 → $10.00). Home shows it as a "Suggested $10.00" button and a line explaining the math. Users can still bet any amount.
- **Saved this month** = the sum of each won day's unspent amount, counted only up to the suggested bet: **(the smaller of the limit and the suggested bet) − actual spent**, never below $0. This stops a huge bet against a tiny goal from reaching the goal in one day.
- [ ] Example: starting money $300 (suggested $10), goal $95, bet $100, spent $5 → **Win**, but only $5 is saved, and no monthly achievement.
- Reaching the goal unlocks a **big monthly achievement**.
- Savings reset to $0 on the 1st of each month.
- [ ] After a win with a bet at or below the suggested bet, saved-this-month increases by exactly (limit − actual spent).
- [ ] When saved-this-month reaches the goal, the monthly achievement pops up.

### Night Check-in and Verdict
Develops `scope.md > The Core Loop` (step 2).
- The user enters their **night balance**.
- **Income since the bet** = the sum of today's Diary income entries logged after the bet was locked in. Income logged before the bet is already inside the morning balance, so it isn't counted twice.
- **Actual spent = Morning balance + Income since the bet − Night balance.**
- **Unlogged spending:** if the night balance is lower than the Diary balance, the app adds an "Unlogged spending" entry for the difference, so the Diary (and tomorrow's morning balance) matches the user's real money. The verdict note says so.
- [ ] Example: Diary $90, night $84 → a $6 "Unlogged spending" entry is added and the Diary shows $84.
- Win if actual spent ≤ today's limit; lose otherwise. Spending exactly the limit counts as a win.
- Diary *spending* entries are a record only. The night balance decides what was spent.
- [ ] Example: morning $50, income $100 logged after the bet, night $130 → actual spent $20. With a $3 limit, the verdict is **Lose**.
- [ ] Example: morning $50, no income, night $48 → actual spent $2. With a $3 limit, the verdict is **Win**.
- [ ] The verdict appears on screen right after the night balance is entered.

### Streaks and Achievements
Develops `scope.md > The Unique Kernel`.
- **Win:** streak +1 and a small achievement pops up.
- **Lose:** streak resets to 0.
- **Missed check-in** (no morning bet, or no night check-in before midnight): counts as a loss.
- **30 consecutive wins:** a grand achievement pops up.
- [ ] A win shows a visible achievement pop-up and the streak number goes up by 1.
- [ ] A loss sets the streak to 0.
- [ ] A day that ends without a completed check-in shows as a loss (red) and resets the streak.
- [ ] Reaching a 30-day streak shows the grand achievement.

### Diary
- **"Money you have this month"** is entered **once**: on first use, and again at the start of each new month. At the start of a new month, the question is pre-filled with where last month's Diary ended. It can be answered in the Diary or on Home before the bet. A small "fix" link allows correcting a typo.
- The top shows this month's balance: money you had this month + this month's income − this month's spending.
- The user adds entries marked as **spending** (balance goes down) or **income** (balance goes up), each with an amount.
- The user can see the entries they've added. Earlier months' entries stay saved but don't count toward this month's balance.
- The Diary balance is Home's morning balance. Income logged after today's bet feeds the night verdict, and settling can add an "Unlogged spending" entry (see **Night Check-in and Verdict**).
- *Assumption:* each entry has a short description ("bubble tea") plus an amount.
- [ ] On first use, the Diary asks for the money you have this month, and doesn't ask again that month.
- [ ] On the first open in a new month, it asks again, pre-filled with where last month's Diary ended.
- [ ] Adding a $4 spending entry lowers the shown balance by exactly $4.
- [ ] Adding a $100 income entry raises the shown balance by exactly $100, and, if logged after the bet, it counts in tonight's "Income since the bet."
- [ ] New entries appear in the visible list.

### Streak Viewer
- A grid of days, like an activity graph: **green = win, red = loss, gray = no data** (days before the user started).
- Shows the **current streak** number.
- [ ] After a win, today's square turns green. After a loss, it turns red.
- [ ] The current streak number matches the Home result.

### Day/Night Toggle
- A top-right toggle switches between the day (sepia) and night (dark) themes.
- [ ] Tapping it switches the whole app's look immediately.

### Demo Buttons
Develops `scope.md > What "Working" Looks Like`.
- **"Skip to tonight":** unlocks the night check-in right away, so a whole day fits in the video.
- **"Skip to 30 days of success":** fills in 30 consecutive winning days and adds their unspent amounts to this month's savings, so both the 30-day grand achievement and the monthly-goal achievement can appear in the video.
- [ ] After a morning bet, tapping "Skip to tonight" shows the night check-in immediately.
- [ ] Tapping "Skip to 30 days of success" shows a 30-day streak, a green grid, and the grand achievement.
- [ ] After it, this month's savings include those 30 days, and the monthly achievement appears if the goal is reached.

## States and Boundaries

- **First use:** no streak (0), Streaks grid all gray, Diary and Home both ask for the money you have this month (answering either one is enough), the Diary shows a short prompt to add a first entry, and Home shows the hook question.
- **New month:** savings reset to $0, and the Diary and Home ask again for the money you have this month (pre-filled with where last month's Diary ended).
- **Before the morning bet:** Home shows the bet area. The night check-in is not available yet.
- **After the morning bet, before night:** Home shows today's bet and limit. The night check-in unlocks at **7 PM** (decided in `4-spec`, replacing the earlier 10 PM assumption from `scope.md > The Core Loop`, so users have more time to settle before midnight), and "Skip to tonight" unlocks it early.
- **After the verdict:** Home shows today's result until midnight. A new day starts at 00:00.
- **Day after a loss:** the penalty notice appears on Home before the bet.
- **Invalid input** (empty, not a number, negative): a friendly message, and the action isn't confirmed.
- **Penalty larger than the bet** (e.g. a Custom bet of $0.50): *Assumption:* the limit can't go below $0.
- **Higher night balance with no logged income:** actual spent comes out negative. *Assumption:* treated as $0 spent, which counts as a win.
- **What persists:** the streak, the day-by-day history, achievements, diary entries and balance, the monthly goal and savings, and the theme choice all stay after closing and reopening, on the same device.
- **Boundaries:** one user, one device, no accounts, nothing social (`scope.md > The POC Boundary`).

## Product Decisions

- **The two balance check-ins are the core.** That's why someone uses the app. The diary is an extra sidebar function.
- **Keep the diary in this first build**, and make room by cutting font settings and login.
- **The night balance decides the verdict.** Diary spending entries are a record only.
- **The diary records income too**, and today's income feeds the formula *Actual spent = Morning + Income today − Night*. Reason: getting paid shouldn't hide overspending ("saving is not necessarily related to income").
- **Type money numbers as rarely as possible** (decided during `5-build`). "Money you have this month" is entered once per month. Reason: even logging in is a big ask for these users (`scope.md > Who It's For`).
- **One balance** (decided during `5-build`). The morning balance is the Diary balance, frozen when the bet is locked in, because two different "money you have" numbers would confuse users. The bet covers from lock-in to the night check-in. Settling adds any shortfall to the Diary as "Unlogged spending" so the one balance stays true.
- **One bet type, "spend no more than,"** with $2 / $3 / $5 / $10 / Custom buttons that you tap, to keep the morning quick.
- **Loss penalty = $0.50 off the next day's limit**, shown in a morning notice. This replaces scope's "tomorrow's stakes get harder" with a concrete rule.
- **A missed check-in counts as a loss.**
- **A small achievement on every win**, a grand achievement at 30 consecutive wins, and a big achievement for reaching the monthly goal.
- **Monthly savings** = the sum of each day's unspent limit, capped at the suggested bet (starting money ÷ 30), decided during `5-build` after the team found that a huge bet against a low goal could reach the goal in one day. The suggestion guides without forcing: users who spend more can still bet high.
- **"Skip to 30 days of success"** demo button, which also fills this month's savings, so the 30-day and monthly achievements can both be shown in the video.
- **Hand-drawn gothic look** inspired by Don't Starve, using no copied assets.
- **Day/night toggle in, font settings and login out.**

## What We're Building
- Sidebar with Home, Diary, and Streaks, plus the top-right day/night toggle.
- Home: the hook, the morning bet (5 buttons + morning balance), the monthly goal, the night check-in, and the verdict.
- The verdict formula with income, the $0.50 penalty, and missed check-ins counting as losses.
- Streak, a small achievement per win, the 30-day grand achievement, and the monthly-goal achievement.
- Diary with spending and income entries and a running balance.
- Streak viewer grid (green / red / gray) with the current streak.
- "Skip to tonight" and "Skip to 30 days of success" demo buttons.
- Data remembered on the same device between visits.
- The hand-drawn gothic sepia/dark look.

## Deferred From the POC
- **Login / stay logged in.** Requires accounts, passwords, and a server holding everyone's data, which is bigger than the rest of the app. One user on one device for now.
- **Using the app on many devices.** Needs online storage plus login (decided in `4-spec`). The spec keeps all saving in one file so this can be added after the hackathon.
- **Font settings.** Cut to make room for the diary.
- **Real night notifications.** Browser notifications are tricky, and the demo can't wait until 7 PM (`scope.md > Later`).

## Possible Later Enhancements
- Leaderboards and rankings among users (`scope.md > Later`).
- Connecting with friends and referrals.
- An exercise penalty (pushups) for losses.
- A bigger achievement collection, including "bad" achievements to earn back.
- A full settings panel (fonts, more themes).

## Non-Goals
- **Charging real money for failures.** It punishes students who are already short, and the app would profit when users fail (`scope.md > Explicitly Cut`).
- **Gambling or addiction framing.** Say "stakes," never "gambling."
- **Cheat-proof verification / bank connections.** The app runs on the honor system, so cheating only means losing to yourself.
- **Handling real money.** The diary mimics a bank for your own record and is never connected to one.
- **Copying Don't Starve (or any game) assets.** Inspired by the feel only.

## Open Questions
- **Final project name.** "Beat Yourself" is a working title. This can wait.
- **Should the night check-in pre-fill with the Diary balance?** This can wait. Typing it in works for now.
