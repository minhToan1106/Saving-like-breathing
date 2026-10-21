# Beat Yourself

*Do you think you can beat yourself?*

A small web app for students who run out of money before the end of the month. Each morning you bet against yourself: "Today I'll spend no more than $3." Each night you enter the money you have left, and the app tells you whether you won. Wins build a streak and add to a monthly saving goal. A loss resets the streak and takes $0.50 off tomorrow's limit.

It's a proof of concept built for the Devpost *Build With AI: Basics* hackathon.

## How to run it

1. Download or clone this repository.
2. Double-click `index.html`. It opens in your browser. There's nothing to install and no account.

Chrome or Edge on a computer works best. If the page doesn't remember your data when opened this way, open the folder in VS Code, install the **Live Server** extension, then right-click `index.html` → **Open with Live Server**.

Your data stays in your browser on this device (`localStorage`). Nothing is sent anywhere.

## How it works

- **Diary:** enter the money you have this month once. Then log spending and income. This is your one balance.
- **Morning bet:** tap $2 / $3 / $5 / $10 / Custom, or the **Suggested** bet (this month's money ÷ 30). Your Diary balance is locked in as the morning balance.
- **Night check-in** (from 7 PM): type the money you really have. *Actual spent = morning balance + income logged since the bet − tonight's balance.* Spend no more than your limit to win.
- If tonight's number is lower than the Diary, the difference is added as **Unlogged spending**, so the Diary stays true. If it's higher, the app asks you to log that income first, so money you didn't log can't hide what you spent.
- **Savings:** each win adds what you didn't spend, counted only up to the suggested bet, so a huge bet can't fake your savings.
- **Streaks:** a full-year grid of wins (green), losses (red), and missed days. A missed check-in counts as a loss.
- **Day/night:** the toggle at the top right switches between the sepia day look and the dark night look, and remembers your choice.
- **The town** behind the app grows with your streak: crooked at first, repaired from **7** days, a lit village from **15**, a castle from **30**. A loss resets the streak to 0, so the town goes back to the start.
- **Buried treasure** under the town grows with the share of this month's saving goal you've saved: gold nuggets from 25%, more gold and a fossil from 50%, gems from 80%, an open chest at 100%.
- **Demo card** (on Home): **7 / 15 / 30 days** preview the town, **25% / 50% / 80% / 100%** preview the treasure. **Your streak** and **Your savings** go back to the real picture. A preview only changes the picture and is never saved.

## Animations

Made with [GSAP](https://gsap.com). Each one plays once; nothing loops.

- The town rebuilds when the streak reaches a new stage, and new treasure rises out of the soil.
- The goal bar grows from its last value.
- Achievements stamp in over a dimmed page with a warm glow (stronger for 30 days and goal reached).
- A small inked flame by the streak number flares when the streak goes up.

If your system is set to reduce motion, everything appears in its final state instantly.

`gsap.min.js` is bundled in `js/vendor/` under GSAP's free Standard License (see the header in the file). There's no npm and no CDN, so the app still opens offline by double-clicking `index.html`.

## Reset to a fresh start

Press **F12** → **Console**, type `localStorage.clear()`, press Enter, and refresh the page.

## Demo (about 1 minute)

1. Reset. Open **Diary** and enter **300** as the money you have this month.
2. On **Home**, tap **Suggested $10.00** → **Lock in the stakes** → **Skip to tonight** (demo button) → enter **298** → **Settle up**. You win, an achievement pops up, the flame flares, and the streak becomes 1.
3. On the **Demo** card, tap **7 days**, **15 days**, **30 days** to watch the town grow, then **Your streak**.
4. Tap **25%**, **50%**, **80%**, **100%** to dig up the treasure, then **Your savings**.
5. Set the monthly goal to **100** → tap **Skip to 30 days of success**. The 30-day and monthly achievements pop up, the goal bar fills, and the real town becomes a castle.
6. Show the **Streaks** grid, then flip the **Night** toggle at the top right.

## Known issues

- Streaks screen is wider than the screen on phones.

## Checking the math

Open `tests.html` in the same way. It runs the product's examples against the rules in `js/rules.js` and shows PASS or FAIL for each one.

## Files

- `index.html`: the page. `css/` holds the look; `js/` holds the app.
- `js/rules.js`: all the money math (verdict, penalty, streak, savings, suggested bet).
- `js/storage.js`: the only file that reads or writes saved data.
- `js/scene.js`: the town and treasure stages, and their animations.
- `js/motion.js`: decides when to animate (GSAP loaded, reduced motion off).
- `js/vendor/gsap.min.js`: the bundled GSAP library.
- `devpost/`: the planning documents (scope, product requirements, technical spec, build checklist).
