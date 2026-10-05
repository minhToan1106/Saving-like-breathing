---
doc: spec
status: approved
---

# Beat Yourself (working title) — Technical Spec

## How This Works, In Plain Language

Beat Yourself is **one web page made of plain HTML, CSS and JavaScript files** that you open by double-clicking `index.html`. There's no server, no install, and no account.

- **The page (`index.html`)** holds the sidebar (Home, Diary, Streaks), the day/night toggle, and all three screens. Only one screen is shown at a time. Clicking the sidebar swaps which one is visible.
- **The look (`css/`)** makes it feel hand-drawn and gothic: woodblock-style headings, handwriting-style text, wobbly SVG-filtered borders, and generated paper texture. All colors live in one set of variables, so the toggle can flip the whole app between sepia day and dark night.
- **The rules (`js/rules.js`)** are the app's brain. They do the math, *Actual spent = Morning balance + Income today − Night balance*, decide win or lose, apply the $0.50 penalty, count the streak, and say which achievement to show. They never touch the screen or the storage, so they're easy to test on their own.
- **The memory (`js/storage.js`)** is the **only** file that talks to `localStorage`, the browser's sticky note for this site. It has two functions: `loadData()` and `saveData(data)`. All the app's data is kept together in one object. After the hackathon, switching to online storage with login (so it works on many devices) means rewriting the inside of this one file, not the whole app.
- **The catch-up (`js/catchup.js`)** runs every time the app opens. A closed web page can't do anything at midnight, so on open the app checks the date and fills in what it missed. Unsettled or skipped days become losses, and a new month resets savings.
- **The screens (`js/home.js`, `js/diary.js`, `js/streaks.js`)** draw what you see and react to taps. They ask the rules what happened and ask storage to remember it.

Why this shape and nothing bigger: it's one user on one device, and the kernel is a daily bet you settle with two numbers. That fits in a browser on its own. Every extra service (server, database, login) would add setup and failure points without making the bet more convincing.

## The Core Journey Through the System

Traces `prd.md > The Core Journey`.

1. **Arrive.** You double-click `index.html`. `app.js` starts → `storage.loadData()` reads the data object from `localStorage` (or creates a fresh empty one on first use) → `catchup.run()` fills in missed days and checks the month → the theme saved last time is applied → **Home** is shown.
2. **The hook.** `home.js` shows *"Do you think you can beat yourself?"*, and a CSS animation drops it in from the top.
3. **Morning bet.** If yesterday was a loss, `rules.penaltyFor(today)` says so, and Home shows the penalty notice first. You tap $2 / $3 / $5 / $10 / Custom. The morning balance is the Diary balance from `rules.monthBalance()` (if this month has no starting money yet, Home asks for it, pre-filled from `rules.monthStartSuggestion()`) → `rules.limitFor(stake, penalty)` gives today's limit (e.g. $3 − $0.50 = $2.50) → today's record is saved with `morningBalance` (frozen) and `betAt` through `storage.saveData()`. The monthly goal input sits underneath and saves the same way.
4. **During the day (optional).** In **Diary** you add "bubble tea, $4, spending" or "part-time pay, $100, income" → `diary.js` adds it to the entries list with today's date → saved → the balance at the top updates.
5. **Night check-in.** At **7 PM or later**, or right away after tapping **"Skip to tonight"**, Home shows the night balance input.
6. **Verdict.** You enter the night balance → `rules.incomeOn(data, today, betAt)` adds up income logged since the bet → `rules.settleDay()` works out actual spent, compares it with the limit, and returns win or lose plus the saved amount → today's record gets the result → `rules.unloggedSpending()` adds any shortfall to the Diary → on a win, savings go up by (limit − actual spent) → `achievements.js` shows the pop-up (small win, 30-day grand, or monthly goal) → saved.
7. **Look back.** In **Streaks**, `streaks.js` reads the day records and draws the grid (green win, red loss, gray no data) and the current streak.
8. **Demo shortcut.** **"Skip to 30 days of success"** writes 30 winning sample days ending yesterday, adds their savings to this month, and shows the grand achievement (and the monthly one if the goal is reached).

```
 tap / type ──► home.js · diary.js · streaks.js ──► rules.js (math, win/lose)
                        │   ▲
           saveData()   ▼   │ loadData()
                      storage.js ──► localStorage (this browser only)
 on open: app.js ──► catchup.js (missed days → losses, new month → reset)
```

## Stack

- **HTML5, CSS3, plain JavaScript (ES2015+).** No framework and no build step. Chosen by the team: you already know these languages, so you can read every line the agent writes and spend your energy learning to direct and review it. **Tradeoff accepted:** keeping three screens in sync is manual. Each screen has a `render()` function that redraws it from the data object.
- **Plain `<script>` tags, not ES modules.** Browsers block ES modules (`type="module"`) when a page is opened by double-clicking the file, so each file attaches its functions to one shared object (`window.BY`), and `index.html` loads the scripts in a fixed order. (Implementation detail that follows from "double-click to run.")
- **`localStorage`** for remembering data. Chosen by the team (option A). **Tradeoff accepted:** data stays in one browser on one device. Docs: <https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage>
- **Google Fonts:** IM Fell English (headings) and Patrick Hand (text). Accepted on recommendation. <https://fonts.google.com/specimen/IM+Fell+English>, <https://fonts.google.com/specimen/Patrick+Hand>
- **SVG filters** (`feTurbulence` + `feDisplacementMap`) for the wobbly hand-drawn edges and paper grain. Built into browsers, nothing to install. Docs: <https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence>

*Verify early in the build:* that `localStorage` keeps data when `index.html` is opened from a double-click (as a `file://` page) in the browser you'll record with. It does in current Chrome and Edge. If it doesn't, fall back to VS Code's Live Server extension (see below). This was not looked up in this session; it's from general knowledge.

## Where It Runs and How Someone Tries It

- **Runtime:** a desktop web browser (Chrome or Edge recommended). Nothing to install, and no API keys.
- **Start:** double-click `index.html` in the project folder. The app opens on Home.
- **Backup start:** if the browser misbehaves with `file://`, open the folder in VS Code, install the **Live Server** extension, right-click `index.html` → *Open with Live Server*.
- **Reset to a clean first-use state** (before recording): open DevTools (F12) → Console → type `localStorage.clear()` → press Enter, then refresh.
- **Demo recording (about 1 minute), following `scope.md > What "Working" Looks Like`:**
  1. Fresh state → the hook drops in → open **Diary** and enter $300 as this month's money.
  2. On Home, tap **Suggested $10.00** → **Lock in the stakes** → **Skip to tonight** → enter $298 → **Win**, achievement pop-up, streak 1. (Optionally replay a loss to show the penalty notice.)
  3. Show the Diary and the full-year Streaks grid.
  4. Set the monthly goal to $100 → tap **Skip to 30 days of success** → 30-day grand achievement and monthly achievement.
  5. Flip the day/night toggle.
- **README:** `README.md` repeats how to run, reset, and record the demo.
- **Submission:** a short demo video plus a public GitHub repository. Both are required.
  - Repository: https://github.com/minhToan1106/Saving-like-breathing
- **Optional deployment (decide in `6-ship`):** GitHub Pages can serve these same files at a free public link, with no code changes. Each visitor's device keeps its own data.

## Look and Feel

Implements `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.

- **Feeling:** hand-drawn gothic, inspired by the *feel* of Don't Starve. No game assets: everything is drawn with CSS and SVG.
- **Fonts:** **IM Fell English** for the hook, screen titles and the verdict. **Patrick Hand** for buttons, inputs and body text. Fallbacks: Georgia / cursive.
- **Colors (CSS variables in `theme.css`, set on `<html data-theme="day|night">`):**
  - Day: sepia paper (`#e9dcc0`-ish background, `#f3e8cf` cards), dark brown ink (`#2a1f16`), rust accent (`#8b3a1e`).
  - Night: near-black paper (`#16120e`), parchment ink (`#e6d8bd`), ember accent (`#d9824f`).
  - Layered shading: cards use 2–3 stacked inner and outer shadows in darker sepia to look shaded in pencil.
  - Streak grid: muted, sketchy green (`#5f7d45`), red (`#9e3a2c`), gray (`#b3a68f`), with lighter or darker versions for night.
- **Lines and texture:** one SVG `#wobble` filter on borders and buttons for uneven, sketchy edges. A noise-based paper grain sits behind everything. Borders are 2px dark ink with irregular `border-radius` values so no two corners match.
- **Motion:** the hook drops in from above (about 0.6s, slight bounce). Achievement pop-ups stamp in (scale and rotate a few degrees), then fade after about 3 seconds or on tap.
- **Copy tone:** competitive and a little provocative ("Do you think you can beat yourself?", "Yesterday's you won this one."). Say "stakes," never "gambling."
- **Not allowed:** purple or blue gradients, glassmorphism, generic rounded "SaaS" cards, emoji-heavy UI.

## Components

### App Shell and Navigation (`index.html`, `js/app.js`)
Holds the sidebar (Home · Diary · Streaks), the top-right toggle slot, the three screen `<section>`s, the pop-up layer, and the SVG filter definitions. `app.js` is the startup sequence: load data → run catch-up → apply theme → render Home. Sidebar clicks show one section, hide the others, and call that screen's `render()`. Catch-up runs again when the window regains focus, so an app left open past midnight still rolls over.
PRD ref: `prd.md > Screens and Layout`, `prd.md > The Core Journey` (step 1).

### Storage (`js/storage.js`)
The only file that touches `localStorage`. Exposes `loadData()` (returns the saved data object, or `defaultData()` on first use or if the saved data is broken) and `saveData(data)`. Uses one key: `beatYourself.v1`. This boundary is what keeps the after-hackathon upgrade to login and many devices contained.
PRD ref: `prd.md > States and Boundaries` (What persists).

### Dates and Time (`js/dates.js`)
Small helpers that use the computer's local clock: `todayKey()` → `"2026-10-04"`, `monthKey()` → `"2026-10"`, `addDays(key, n)`, `isNightOpen(now)` (true at 19:00 or later), and the constant `NIGHT_UNLOCK_HOUR = 19`.
PRD ref: `prd.md > States and Boundaries`.

### Rules (`js/rules.js`)
Pure math with no screen and no storage, so it can be tested on its own. All money is handled in **cents** (whole numbers) so $3.00 − $0.50 never turns into 2.4999999.
- `penaltyFor(data, dayKey)` → 50 cents if the previous day's record is a loss, otherwise 0. Flat; doesn't stack. There's no penalty on the first day of use.
- `limitFor(stakeCents, penaltyCents)` → `max(0, stake − penalty)`.
- `incomeOn(data, dayKey, sinceTime)` → the sum of that day's Diary income entries; with `sinceTime` (the bet's `betAt`), only entries logged after it (entries without a time still count).
- `settleDay(morning, income, night, limit, savingsCap)` → `actualSpent = max(0, morning + income − night)`. Win if `actualSpent ≤ limit`. On a win, `saved = max(0, min(limit, savingsCap) − actualSpent)` (no cap when `savingsCap` is missing); 0 on a loss.
- `suggestedBet(startingMoney)` → `round(startingMoney ÷ 30)`, or `null` if this month's starting money hasn't been entered.
- `goalJustReached(goal)` → true the first time this month's savings reach a goal that's been set.
- `currentStreak(data)` → the number of consecutive wins counting back from the latest settled day.
- `monthBalance(data, month)` → that month's starting money + its income − its spending, or `null` if the month has no starting money yet. This is both the Diary balance and Home's morning balance.
- `monthStartSuggestion(data, month)` → where last month's Diary ended (`monthBalance` of the previous month), or `null`.
- `unloggedIncome(diaryBalance, night)` → `{ type: 'income', amount: night − diaryBalance, note: 'Unlogged income' }` when the night balance is higher, otherwise `null`.
- `unloggedSpending(diaryBalance, night)` → `{ type: 'spending', amount: diaryBalance − night, note: 'Unlogged spending' }` when the night balance is lower, otherwise `null`.
- `achievementsFor(...)` → which pop-ups to show: `win` on every win, `grand30` when the streak reaches 30, `monthly` when saved-this-month first reaches the goal.
PRD ref: `prd.md > Night Check-in and Verdict`, `prd.md > Morning Bet` (penalty), `prd.md > Streaks and Achievements`, `prd.md > Monthly Goal`.

### Catch-up on Open (`js/catchup.js`)
`run(data, now)`:
1. For each day from the start date up to **yesterday** whose record is missing or unsettled → mark it `result: "loss"`, `missed: true`.
2. If `goal.month` isn't this month → `saved = 0`, `monthlyAchieved = false`, `month = this month`.
3. Save if anything changed.
This replaces a background job at midnight. The user sees the same result the moment they come back.
PRD ref: `prd.md > Streaks and Achievements` (missed check-in), `prd.md > Monthly Goal` (reset on the 1st), `prd.md > States and Boundaries` (new day at 00:00).

### Home Screen (`js/home.js`)
Shows one of four states, based on today's record and the clock:
1. **Before the bet:** hook, penalty notice if any, the bet sentence with $2 / $3 / $5 / $10 / Custom (the selected button is clearly marked), a dashed "Suggested $X" button plus a line explaining it (starting money ÷ 30, and that only up to it counts toward savings), "Money you have" shown read-only from the Diary with a "Fix it in Diary" link (or, if this month has no starting money, a "Money you have this month" input pre-filled from `rules.monthStartSuggestion()`), Confirm (disabled until valid).
2. **Bet placed, before 7 PM:** today's stake and limit, "Night check-in opens at 7 PM", **Skip to tonight**.
3. **Night open:** income logged since the bet, night balance input → Settle (adds unlogged spending to the Diary if the night balance is lower). If it's higher, a warning offers **Log it in Diary** (keeps the typed number) or **Settle anyway** (adds unlogged income).
4. **Settled:** the verdict (Win / Lose, actual spent vs. limit) until midnight.
The **Monthly Goal** card (goal input, saved-this-month, progress, and after today's win a "Today you saved $X" line noting when only the suggested bet counted) is always below. The **Skip to 30 days of success** button sits in a small, clearly labeled "Demo" corner.
PRD ref: `prd.md > Morning Bet`, `prd.md > Monthly Goal`, `prd.md > Night Check-in and Verdict`, `prd.md > Demo Buttons`.

### Diary Screen (`js/diary.js`)
Top: if this month has no starting money yet (first use, or the first open in a new month), a "Money you have this month" question, pre-filled from `rules.monthStartSuggestion()` when there is one. Once answered, it shows this month's balance = this month's starting money + this month's income − this month's spending, with a small "fix" link to correct the starting money. Bottom: an add-entry form (description, amount, Spending / Income), and the list of this month's entries with the newest first (earlier months stay saved). When empty, it shows a short prompt to add a first entry. The balance is also Home's morning balance. Income logged after today's bet feeds the verdict.
PRD ref: `prd.md > Diary`.

### Streak Viewer (`js/streaks.js`)
The current streak number, plus a full-year contribution-style grid (January 1 to December 31 of the current year): split into 12 month blocks with a gap between them (team request, for a cleaner look); inside each block one column per week and one row per weekday (Sunday first), the month name on top, and Mon/Wed/Fri at the side. Each square is green for a win, red for a loss, gray for no data or before you started, faint for days still to come, and today is outlined. On narrow screens the grid scrolls sideways inside its card, starting at today. It reads from the day records and from `rules.currentStreak()`, so it always matches Home.
PRD ref: `prd.md > Streak Viewer`.

### Achievement Pop-ups (`js/achievements.js`)
`show(kind)` puts a stamped card into the pop-up layer. Small win: e.g. "Yesterday's you: beaten." 30-day grand: "30 Days Unbeaten." Monthly: "Goal Reached: $X saved this month." Each one is added to `data.achievements`. If two trigger at once, they queue.
PRD ref: `prd.md > Streaks and Achievements`, `prd.md > Monthly Goal`.

### Day/Night Toggle (`js/theme.js`)
Flips `data-theme` on `<html>` between `day` and `night`, saves `data.theme`, and is applied on load. The whole look changes at once because every color is a CSS variable.
PRD ref: `prd.md > Day/Night Toggle`.

### Demo Buttons (in `js/home.js`)
- **Skip to tonight:** sets `data.demoNightUnlocked = todayKey()`. Night opens immediately for today only.
- **Skip to 30 days of success:** **sample data, labeled `demo: true`.** Writes 30 winning day records ending yesterday (stake $10, limit $10, actual spent from a fixed pattern of $3–$7, saved through the same `settleDay` savings cap as real days, so about $150 saved when the suggested bet is $10 or more). Built by `rules.demoDays(today, cap)`. Demo days carry no balances (`null`) and don't touch the Diary. It replaces any records on those dates, moves the start date back if needed, adds the 30 saved amounts to this month's savings, then shows `grand30`, and `monthly` if the goal is reached. Today stays as it was.
PRD ref: `prd.md > Demo Buttons`.

### Rules Check Page (`tests.html`)
A plain page that loads `js/dates.js` and `js/rules.js` and runs the PRD's examples, showing PASS / FAIL for each: morning $50 + income $100 − night $130 = $20 spent → Lose at a $3 limit; morning $50 − night $48 = $2 → Win at $3; $3 tap after a loss → $2.50 limit; $0.50 custom bet with penalty → $0 limit; a negative spend counts as $0 → Win; the morning pre-fill (last night, after a skipped day, first day, demo days ignored); and the Diary's per-month balance. A development aid for checking the agent's math, not part of the app.
PRD ref: `prd.md > Night Check-in and Verdict` (acceptance examples), `prd.md > States and Boundaries`.

## Data Model

Everything is kept together in one object, saved as JSON under the `localStorage` key `beatYourself.v1`. Money is in **cents**.

```js
{
  version: 1,
  theme: "day",                    // "day" | "night"
  startDate: "2026-10-04",         // first use; earlier days show gray
  days: {
    "2026-10-04": {
      stake: 300,                  // tapped amount
      penalty: 50,                 // 0 or 50
      limit: 250,                  // max(0, stake - penalty)
      morningBalance: 5000,        // Diary balance when the bet was locked in
      betAt: 1791130000000,        // when the bet was locked in
      suggested: 1000,             // suggested bet at lock-in (starting money ÷ 30); caps savings
      nightBalance: 4800,          // null until settled
      income: 0,                   // diary income logged since the bet, captured at settle
      unlogged: 0,                 // unlogged spending added to the Diary at settle
      actualSpent: 200,
      result: "win",               // "win" | "loss" | null (open)
      saved: 50,
      settledAt: 1791158400000,    // when Settle was tapped (null until settled)
      missed: false,               // true if filled in by catch-up
      demo: false                  // true for "Skip to 30 days" sample days
    }
  },
  diary: {
    startingBalances: { "2026-10": 20000 },   // "money you have this month", one per month
    entries: [
      { id: "e1", date: "2026-10-04", type: "spending", amount: 400, note: "bubble tea", at: 1791140000000 }  // at = when logged
    ]
  },
  goal: { amount: 60000, month: "2026-10", saved: 50, monthlyAchieved: false },
  achievements: [ { kind: "win", date: "2026-10-04" } ],
  demoNightUnlocked: null          // a date key when "Skip to tonight" was used
}
```

| Data | Lives in | Updated when | Leave and come back |
|---|---|---|---|
| Today's bet and verdict | `days[today]` | Confirm bet, Settle | Still there; Home shows the right state |
| Day history | `days` | Settle, catch-up, demo | Kept; missed days filled as losses |
| Streak | **calculated** from `days` | — | Always matches the history |
| Diary entries and balance | `diary` | Add entry, answer or fix this month's starting money | Kept; a new month asks for new starting money |
| Morning balance | **calculated** from `diary` before the bet; frozen in `days[today].morningBalance` at lock-in | Lock in | Same as the Diary |
| Monthly goal and savings | `goal` | Goal input, win, demo | Kept; reset when the month changes |
| Achievements | `achievements` | Pop-ups | Kept |
| Theme | `theme` | Toggle | Applied on open |

The streak is calculated each time instead of stored, so it can never disagree with the grid.

## File Structure

```
Build AI Basic/
├── index.html          # the whole app: sidebar, toggle, 3 screens, pop-up layer, SVG filters; loads scripts in order
├── tests.html          # rules check page: runs PRD examples, shows PASS/FAIL (dev aid)
├── css/
│   ├── theme.css       # fonts, day/night color variables, paper texture, wobble edges
│   ├── layout.css      # sidebar + main area, screen sections, narrow-screen layout
│   └── components.css  # buttons, cards, inputs, streak grid squares, pop-ups, hook animation
├── js/
│   ├── storage.js      # loadData/saveData/defaultData; the ONLY file touching localStorage
│   ├── dates.js        # todayKey, monthKey, addDays, isNightOpen (7 PM)
│   ├── rules.js        # pure math: penalty, limit, income, settle, streak, achievements
│   ├── catchup.js      # on open/focus: missed days → losses, new month → reset savings
│   ├── achievements.js # pop-up queue
│   ├── theme.js        # day/night toggle
│   ├── home.js         # hook, morning bet, monthly goal, night check-in, verdict, demo buttons
│   ├── diary.js        # balance, add entry, entry list
│   ├── streaks.js      # streak number + activity grid
│   └── app.js          # startup + sidebar navigation (loaded last)
├── README.md           # what it is, how to run, how to reset, demo steps
└── devpost/            # Devpost learning workspace (scope, PRD, spec, checklist)
```

Script load order in `index.html`: storage → dates → rules → catchup → achievements → theme → home → diary → streaks → app.

## External Services and Dependencies

- **Google Fonts** (IM Fell English, Patrick Hand), loaded with a `<link>` in `index.html`. No key, free, needs internet. Without internet, the fallback fonts are used.
- **No APIs, databases, or hosting** in the POC. `localStorage` is built into the browser.
- **Optional later:** GitHub Pages for a public link (free, no key), decided in `6-ship`.

## Important Failure Modes

- **Broken or old saved data** (e.g. edited by hand) → `loadData()` catches the error and starts fresh with `defaultData()`, not a blank screen.
- **Invalid input** (empty, not a number, negative) → a friendly line under the field ("Enter your balance as a number, like 48.50"), and the button stays disabled. See `prd.md > States and Boundaries`.
- **`localStorage` unavailable from `file://`** in some browser → use Chrome or Edge, or run with Live Server. Checked at the very first build step.
- **No internet while recording** → fonts fall back to Georgia / cursive. Record with internet on to get the intended look.
- **Computer clock or timezone changes** → days are keyed by the local date, and the honor system applies (`scope.md > Explicitly Cut`).

## What Was Simplified and Why

- **Device-only storage (`localStorage`)** instead of online storage with login — the team chose this so the build stays small. The fuller version would need a hosted database (e.g. Supabase), a login screen, and moving device data online on first login. `storage.js` isolates this so it can be added after the hackathon.
- **Catch-up when the app opens** instead of a midnight background job — a closed web page can't run code, and a job would need a server. Same result, visible the moment the user returns.
- **On-screen 7 PM unlock** instead of real notifications — deferred in `prd.md > Deferred From the POC`.
- **Sample data for "Skip to 30 days of success"** — clearly labeled `demo: true`. It's a demo shortcut. The real bet, settle, streak and penalty logic is never faked.
- **No framework or build step** — the team's choice. Plain files you can read line by line.

## Decisions and Open Issues

**Decided by the team in this conversation**
- **Plain HTML/CSS/JS**, not React. Familiar, and readable for reviewing the agent's code. Tradeoff: manual screen updates.
- **Option A: `localStorage` on one device**, with multi-device and login moved to Later (now recorded in `prd.md > Deferred From the POC`). Tradeoff: data doesn't follow you between devices.
- **Catch up when the app opens** for missed days and month resets.
- **Night check-in unlocks at 7 PM**, not 10 PM, "to let them have more time to open the app and fill in." `prd.md > States and Boundaries` is updated.
- **Write it up** with the recommended look (IM Fell English + Patrick Hand, SVG wobble, paper texture) and run approach (double-click locally; GitHub Pages optional in `6-ship`), accepted without changes.

**Implementation details derived from those choices (agent recommendations)**
- Plain `<script>` tags with a shared `window.BY` object, so double-click works.
- Money stored as cents. Streak calculated, not stored. One storage key.
- Catch-up also runs on window focus. Demo sample-day values (stake $10, spent $3–$7).
- A `tests.html` rules check page, to verify the agent's math against the PRD examples.
- ~~The diary balance doesn't reset on the 1st.~~ Replaced during `5-build` by the team's decision: "money you have this month" is entered once per month (the new month's question is pre-filled from where last month's Diary ended), and the Diary balance counts only this month's entries. A "fix" link corrects typos.
- **One balance** (team decision during `5-build`, replacing the earlier pre-fill options A/B): the morning balance is the Diary balance, frozen at lock-in. The bet covers lock-in to night check-in; spending before the bet is an accepted gap. Only income logged after the bet is added, so it's never counted twice. Settling adds any shortfall to the Diary as "Unlogged spending."

**The useful unknown**
- *Question raised:* "If I choose A, can I update to D (real accounts, many devices) after the hackathon?"
- *What clarified it:* yes, as long as storage sits behind one boundary. The app only calls `loadData()` / `saveData()` in `storage.js`, and all data is one object, so the upgrade rewrites that file plus adds a login screen. Home, Diary, Streaks and the rules stay unchanged. Remaining later work: uploading existing device data on first login.
- *Checked during the build:* the build should keep every `localStorage` call inside `storage.js`. A search for `localStorage` across `js/` should only find that file.

**Still open (carried over from `prd.md > Open Questions`, can wait)**
- The final project name ("Beat Yourself" is a working title).
- Whether the night check-in should pre-fill with the Diary balance. Typing it in for now: the typed number is the honest check, and the gap becomes "Unlogged spending."
