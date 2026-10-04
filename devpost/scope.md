---
doc: scope
status: approved
---

# Beat Yourself (working title)

A web app where students bet on their own spending each morning and settle up each night, competing against their past selves instead of just logging numbers.

## The Unique Kernel
**A daily bet against yourself, with stakes that sting.** Each morning you commit ("I'll spend no more than $3 today"). At night you settle. Win, and you keep your streak and earn an achievement. Lose, and your streak resets to zero and tomorrow's stakes get harder: the app shrinks your $3 bet to $2.50. The opponent is always "yesterday's you," which keeps it fair for everyone, whatever their income.

## Who It's For
Students like us who run short of money by the end of the month, usually because of impulse buys they didn't really need. Today they either track nothing or try a spending tracker and quit because typing in numbers "would be too boring." For many of them, even just logging in to an app is a big ask.

## The Core Loop
Two visits a day, no more:
1. **Morning: set the stakes.** Open the app, see the challenge, pick a bet ("spend no more than $X" or "end the day with at least $Y"), tap an amount, and enter the current balance.
2. **Night (around 10 PM): settle up.** Enter the night balance. The app compares it with the morning balance and gives the verdict.
   - **Win:** keep the streak and earn an achievement.
   - **Lose:** the streak resets to zero, and tomorrow's stakes level up and get harder (for example, $3 becomes $2.50).

They come back to protect the streak, and because a loss is a challenge to win back: "Do you think you can beat yourself?"

## Inspiration & Identity
- **[CSS Battle](https://cssbattle.dev/):** the base reference. A normal website, clean, competitive, one challenge front and center.
- **Tone:** a hook from the very first screen. "Do you think you can beat yourself?" should make users salty, curious, or thrilled by the better version of themselves they could become.
- **Energy:** competitive game feel (Valorant, TFT, Arena of Valor), with instant dopamine on a win.
- **Language:** "stakes," never "gambling."

## Why This Matters to the Learner
It's our own problem: "students struggle to manage money and run short by the end of the month." We believe lots of people share it. As a team of two, we also want to learn "how to work with an AI agent," and this is the project we'll practice on.

## What "Working" Looks Like
A one-minute demo video showing one full day:
1. Open the app → the hook "Do you think you can beat yourself?" → pick a bet type, tap an amount, enter the morning balance.
2. Tap **"Skip to tonight"** (a demo button) → enter the night balance → see the verdict.
3. **The "oh, that's cool" beat:** on a win, the streak grows and an achievement pops up. On a loss, the streak resets and the app shows tomorrow's tougher stakes ($3 → $2.50).

## The POC Boundary
- Morning check-in: choose the bet type, tap a stake amount, enter the balance.
- Night check-in: enter the balance, get a win/lose verdict from the balance check.
- Win → streak and achievement. Lose → streak resets, and the next day's stakes get harder.
- A "Skip to tonight" demo button so a whole day fits in the video.
- One user on one device. Nothing social.

## Later
- Real 10 PM notifications. Browser notifications are tricky to set up, and the demo can't wait until 10 PM.
- Leaderboards and rankings among users.
- Connecting with friends and referrals to grow the user base.
- An exercise penalty (pushups) for losses. We chose harder stakes as the loss consequence for now.
- A bigger achievement collection, with bad achievements to earn back.

## Explicitly Cut
- **Charging $1 per failure.** It punishes students who are already short on money, and the app would profit when users fail.
- **Gambling and addiction framing.** It's an ethical and legal red flag for an audience with money problems. We kept the stakes and dropped the gambling.
- **Cheat-proof verification (for example, bank connections).** That's far beyond a 2–4 hour build. The balance check-in runs on the honor system, and cheating only means losing to yourself.
