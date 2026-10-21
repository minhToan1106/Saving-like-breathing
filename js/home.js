// Home screen: the morning bet, the night check-in and the verdict.
// It shows one of four states, based on today's record and the clock.
window.BY = window.BY || {};

(function (BY) {
  var STAKES = [200, 300, 500, 1000];
  // Streaks the Demo card can preview the town at (one per stage),
  // and shares of the monthly goal it can preview the buried treasure at (one per level)
  var PREVIEWS = [7, 15, 30];
  var TREASURE_PREVIEWS = [25, 50, 80, 100];
  var BALANCE_ERROR = 'Enter your balance as a number, like 48.50';

  // What the user has picked but not confirmed yet
  var ui = { stake: null, custom: false, suggested: false };
  // The night balance typed so far, kept if the user goes to the Diary to log income
  var nightDraft = '';
  // The goal bar's last fill, so it grows from there instead of from empty on every render
  var shownPct = null;
  // The streak the flame last flared for. Kept for this browser tab only, never in the saved data,
  // so switching screens or re-rendering doesn't replay it; a new tab flares it once.
  var FLAME_KEY = 'by-flame-streak';
  var flamed = readFlamed();

  // A small inked flame beside the streak number: filled, hatched inside its outline, a pale core, then inked
  var FLAME_PATH = 'M12 30.5C6.2 30.6 3.4 26.4 3.9 21.6 4.3 17.4 7.6 15.1 7.9 10.4 10.6 12.3 11.6 14.6 11.3 17.2 13.6 14.8 14.6 10.2 12.6 2.5 17.9 6.4 21.2 12.6 20.7 19.4 20.4 25.9 17.2 30.4 12 30.5Z';
  var FLAME =
    '<svg class="streak-flame" viewBox="0 0 24 32" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="flame-clip"><path d="' + FLAME_PATH + '"/></clipPath></defs>' +
      '<path class="flame-fill" d="' + FLAME_PATH + '"/>' +
      '<path class="flame-hatch" clip-path="url(#flame-clip)" d="M0 20 9 11M0 25 13 12M1 30 17 14M5 32 21 16M10 33 24 19M15 33 24 24"/>' +
      '<path class="flame-core" d="M12.1 28.4C9.4 28.5 8.2 26.4 8.7 24.1 9.1 22.2 10.8 21.3 11.2 19.2 13.4 20.6 15.1 23 15 25.1 14.9 27.1 13.8 28.4 12.1 28.4Z"/>' +
      '<path class="flame-outline" d="' + FLAME_PATH + '"/>' +
    '</svg>';

  function money(cents) {
    return BY.rules.formatMoney(cents);
  }

  function shortMoney(cents) {
    return money(cents).replace('.00', '');
  }

  function save(data) {
    if (!BY.storage.saveData(data)) BY.app.showSaveWarning();
  }

  function render(data) {
    var play = document.getElementById('home-play');
    var today = BY.dates.todayKey();
    var day = data.days[today];
    var streak = BY.rules.currentStreak(data);

    play.innerHTML =
      '<p class="streak-badge sketch">Streak: ' + (streak > 0 ? FLAME : '') +
        '<strong id="home-streak">' + streak + '</strong>' +
        (streak === 1 ? ' day' : ' days') + '</p>' +
      '<div id="home-card" class="home-card"></div>' +
      '<div id="home-goal" class="home-card"></div>' +
      '<div class="demo-corner sketch">' +
        '<p class="eyebrow">Demo</p>' +
        '<button type="button" class="btn" id="skip-30">Skip to 30 days of success <span class="tag">demo</span></button>' +
        '<p class="hint">Fills the last 30 days with sample wins so the big achievements can be shown.</p>' +
        '<div class="scene-preview" role="group" aria-labelledby="preview-label">' +
          '<p class="hint" id="preview-label">See how the town grows with a longer streak. Only the picture changes.</p>' +
          PREVIEWS.map(function (n) {
            return '<button type="button" class="btn" data-preview="' + n + '">' + n + ' days</button>';
          }).join('') +
          '<button type="button" class="btn" data-preview="">Your streak</button>' +
        '</div>' +
        '<div class="scene-preview" role="group" aria-labelledby="treasure-label">' +
          '<p class="hint" id="treasure-label">See what\'s buried as you get closer to your monthly goal. Only the picture changes.</p>' +
          TREASURE_PREVIEWS.map(function (n) {
            return '<button type="button" class="btn" data-preview="' + n + '">' + n + '%</button>';
          }).join('') +
          '<button type="button" class="btn" data-preview="">Your savings</button>' +
        '</div>' +
      '</div>';
    play.querySelector('#skip-30').addEventListener('click', function () { skipThirtyDays(data); });
    flareIfNew(play.querySelector('.streak-flame'), streak);
    BY.scene.update(data);
    var previews = play.querySelectorAll('.scene-preview');
    wirePreview(previews[0], BY.scene.preview, BY.scene.previewing);
    wirePreview(previews[1], BY.scene.previewTreasure, BY.scene.previewingTreasure);
    var root = play.querySelector('#home-card');
    renderGoal(play.querySelector('#home-goal'), data, day);

    if (!day) {
      renderBet(root, data, today);
    } else if (!day.result) {
      var nightOpen = BY.dates.isNightOpen() || data.demoNightUnlocked === today;
      if (nightOpen) renderNight(root, data, day);
      else renderWaiting(root, data, today, day);
    } else {
      renderVerdict(root, day);
    }
  }

  // ---------- Streak flame ----------
  function readFlamed() {
    try {
      var v = sessionStorage.getItem(FLAME_KEY);
      return v === null ? null : Number(v);
    } catch (e) {
      return null;
    }
  }

  // Flares on the first Home of this tab or when the streak went up; any other render shows it still
  function flareIfNew(flame, streak) {
    var flare = streak > 0 && (flamed === null || streak > flamed);
    if (streak !== flamed) {
      flamed = streak;
      try { sessionStorage.setItem(FLAME_KEY, String(streak)); } catch (e) { /* the in-memory flag still works */ }
    }
    if (!flare || !BY.motion.on()) return;
    // Grows from a spark at its base, flickers a few times, then stands still
    gsap.timeline()
      .fromTo(flame, { scale: 0.2, autoAlpha: 0, transformOrigin: '50% 100%' },
        { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
      .to(flame, {
        keyframes: [
          { scaleX: 0.94, scaleY: 1.12, rotation: -4 },
          { scaleX: 1.04, scaleY: 0.95, rotation: 3 },
          { scaleX: 0.98, scaleY: 1.05, rotation: -1.5 },
          { scaleX: 1, scaleY: 1, rotation: 0 }
        ],
        duration: 0.7, ease: 'none', easeEach: 'sine.inOut'
      });
  }

  // ---------- 1. Before the bet ----------
  function renderBet(root, data, today) {
    var stakeButtons = STAKES.map(function (s) {
      return '<button type="button" class="btn stake" data-stake="' + s + '">' + shortMoney(s) + '</button>';
    }).join('');

    var penalty = BY.rules.penaltyFor(data, today);
    var month = BY.dates.monthKey();
    // One balance: the morning balance is whatever the Diary says. If this month has no
    // starting money yet (first use, new month), Home asks for it here instead.
    var diaryBalance = BY.rules.monthBalance(data, month);
    var suggestion = diaryBalance === null ? BY.rules.monthStartSuggestion(data, month) : null;
    var balanceField = diaryBalance !== null
      ? '<div class="field">' +
          '<p class="field-label">Money you have</p>' +
          '<p class="money-now" id="morning-balance-shown">' + money(diaryBalance) + '</p>' +
          '<p class="hint">From your Diary. <button type="button" class="link-btn" id="fix-in-diary">Fix it in Diary</button></p>' +
        '</div>'
      : '<div class="field">' +
          '<label for="morning-balance">Money you have this month</label>' +
          '<input id="morning-balance" inputmode="decimal" autocomplete="off" placeholder="e.g. 200.00"' +
            (suggestion !== null ? ' value="' + (Math.max(0, suggestion) / 100).toFixed(2) + '"' : '') + '>' +
          '<p class="hint">' + (suggestion !== null
            ? 'Where last month\'s Diary ended. Change it if needed.'
            : 'This also starts your Diary for the month.') + '</p>' +
          '<p class="field-error" id="morning-error"></p>' +
        '</div>';
    var penaltyNotice = penalty
      ? '<div class="card sketch penalty-notice" id="penalty-notice">' +
          '<p class="eyebrow">Penalty</p>' +
          '<p>Because you lost yesterday, you have a penalty today: <strong>' + money(penalty) +
          '</strong> comes off your spending limit.</p>' +
        '</div>'
      : '';

    root.innerHTML = penaltyNotice +
      '<div class="card sketch">' +
        '<p class="bet-sentence">Today I\'ll spend no more than…</p>' +
        '<div class="stakes" role="group" aria-label="Spending limit">' +
          stakeButtons +
          '<button type="button" class="btn stake" data-stake="custom">Custom</button>' +
          '<button type="button" class="btn stake stake-suggested" data-stake="suggested" id="suggest-btn" hidden></button>' +
        '</div>' +
        '<p class="hint" id="suggest-line" hidden></p>' +
        '<div class="field" id="custom-field" hidden>' +
          '<label for="custom-stake">Your own limit</label>' +
          '<input id="custom-stake" inputmode="decimal" autocomplete="off" placeholder="e.g. 4.50">' +
          '<p class="field-error" id="custom-error"></p>' +
        '</div>' +
        balanceField +
        '<p class="limit-preview" id="limit-preview" hidden></p>' +
        '<button type="button" class="btn primary" id="confirm-bet" disabled>Lock in the stakes</button>' +
        '<p class="hint" id="bet-hint">' + (diaryBalance !== null ? 'Pick your stakes to lock in.' : 'Pick your stakes and enter your balance to lock in.') + '</p>' +
      '</div>';

    var customField = root.querySelector('#custom-field');
    var customInput = root.querySelector('#custom-stake');
    var morningInput = root.querySelector('#morning-balance'); // only when asking for this month's money
    var confirmBtn = root.querySelector('#confirm-bet');

    // This month's starting money: already saved, or what's being typed on day one / a new month
    function startingMoney() {
      if (morningInput) return BY.rules.parseMoney(morningInput.value);
      return data.diary.startingBalances[month];
    }

    function chosenStake() {
      if (ui.suggested) {
        var s = BY.rules.suggestedBet(startingMoney());
        return s && s > 0 ? s : null;
      }
      if (!ui.custom) return ui.stake;
      var c = BY.rules.parseMoney(customInput.value);
      return c && c > 0 ? c : null;
    }

    function showSuggestion() {
      var start = startingMoney();
      var s = BY.rules.suggestedBet(start);
      var btn = root.querySelector('#suggest-btn');
      var line = root.querySelector('#suggest-line');
      btn.hidden = line.hidden = !(s > 0);
      if (s > 0) {
        btn.textContent = 'Suggested ' + money(s);
        line.textContent = 'Suggested bet: ' + money(s) + ' (your ' + money(start) +
          ' this month ÷ 30). Bet higher if you like, but only up to ' + money(s) + ' a day counts toward savings.';
      } else if (ui.suggested) {
        ui.suggested = false;
        btn.classList.remove('is-selected');
      }
    }

    function validate() {
      showSuggestion();
      var stake = chosenStake();
      var morning = morningInput ? BY.rules.parseMoney(morningInput.value) : diaryBalance;
      root.querySelector('#custom-error').textContent =
        ui.custom && customInput.value.trim() && stake === null ? 'Enter a limit above $0, like 4.50' : '';
      if (morningInput) {
        root.querySelector('#morning-error').textContent =
          morningInput.value.trim() && morning === null ? BALANCE_ERROR : '';
      }
      var preview = root.querySelector('#limit-preview');
      preview.hidden = !(penalty && stake !== null);
      if (!preview.hidden) {
        preview.textContent = 'Your limit today: ' + money(stake) + ' − ' + money(penalty) +
          ' penalty = ' + money(BY.rules.limitFor(stake, penalty));
      }
      var ready = stake !== null && morning !== null;
      confirmBtn.disabled = !ready;
      root.querySelector('#bet-hint').hidden = ready;
      return ready ? { stake: stake, morning: morning } : null;
    }

    root.querySelectorAll('.stake').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('.stake').forEach(function (b) {
          b.classList.remove('is-selected');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-selected');
        btn.setAttribute('aria-pressed', 'true');
        ui.custom = btn.dataset.stake === 'custom';
        ui.suggested = btn.dataset.stake === 'suggested';
        ui.stake = ui.custom || ui.suggested ? null : Number(btn.dataset.stake);
        customField.hidden = !ui.custom;
        if (ui.custom) customInput.focus();
        validate();
      });
    });

    customInput.addEventListener('input', validate);
    if (morningInput) morningInput.addEventListener('input', validate);
    showSuggestion();
    var fixLink = root.querySelector('#fix-in-diary');
    if (fixLink) fixLink.addEventListener('click', function () { BY.app.showScreen('diary'); });

    confirmBtn.addEventListener('click', function () {
      var bet = validate();
      if (!bet) return;
      if (morningInput) data.diary.startingBalances[month] = bet.morning;
      data.days[today] = {
        stake: bet.stake,
        penalty: penalty,
        limit: BY.rules.limitFor(bet.stake, penalty),
        morningBalance: bet.morning,   // the Diary balance at the moment of the bet
        betAt: Date.now(),
        suggested: BY.rules.suggestedBet(data.diary.startingBalances[month]), // caps savings
        nightBalance: null,
        income: 0,
        actualSpent: null,
        result: null,
        saved: 0,
        unlogged: 0,
        settledAt: null,
        missed: false,
        demo: false
      };
      ui = { stake: null, custom: false, suggested: false };
      save(data);
      render(data);
    });
  }

  function penaltyLine(day) {
    return day.penalty
      ? '<p class="muted">' + money(day.stake) + ' stake − ' + money(day.penalty) + ' penalty from yesterday</p>'
      : '';
  }

  // ---------- 2. Bet placed, before 7 PM ----------
  function renderWaiting(root, data, today, day) {
    root.innerHTML =
      '<div class="card sketch">' +
        '<p class="eyebrow">Today\'s stakes</p>' +
        '<p class="big-line">Spend no more than <strong>' + money(day.limit) + '</strong></p>' +
        penaltyLine(day) +
        '<p class="muted">Morning balance: ' + money(day.morningBalance) + '</p>' +
        '<p>Night check-in opens at 7 PM. Come back and settle up.</p>' +
        '<button type="button" class="btn" id="skip-tonight">Skip to tonight <span class="tag">demo</span></button>' +
      '</div>';

    root.querySelector('#skip-tonight').addEventListener('click', function () {
      data.demoNightUnlocked = today;
      save(data);
      render(data);
    });
  }

  // ---------- 3. Night open ----------
  function renderNight(root, data, day) {
    root.innerHTML =
      '<div class="card sketch">' +
        '<p class="eyebrow">Night check-in</p>' +
        '<p class="big-line">Did you beat yourself?</p>' +
        '<p class="muted">Limit: ' + money(day.limit) + ' · Morning balance: ' + money(day.morningBalance) + '</p>' +
        penaltyLine(day) +
        '<p class="muted">Income logged in the Diary since your bet: ' + money(BY.rules.incomeOn(data, BY.dates.todayKey(), day.betAt)) + '</p>' +
        '<div class="field">' +
          '<label for="night-balance">Money you have now</label>' +
          '<input id="night-balance" inputmode="decimal" autocomplete="off" placeholder="e.g. 48.00">' +
          '<p class="field-error" id="night-error"></p>' +
        '</div>' +
        '<div class="income-warning" id="income-warning" hidden>' +
          '<p id="income-warning-text"></p>' +
          '<div class="stakes">' +
            '<button type="button" class="btn primary" id="log-income">Log it in Diary</button>' +
            '<button type="button" class="btn" id="settle-anyway">Settle anyway</button>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn primary" id="settle" disabled>Settle up</button>' +
      '</div>';

    var input = root.querySelector('#night-balance');
    var settleBtn = root.querySelector('#settle');
    var warning = root.querySelector('#income-warning');

    function check() {
      var night = BY.rules.parseMoney(input.value);
      nightDraft = input.value;
      root.querySelector('#night-error').textContent = input.value.trim() && night === null ? BALANCE_ERROR : '';
      settleBtn.disabled = night === null;
      warning.hidden = true;
      settleBtn.hidden = false;
    }
    input.value = nightDraft;
    check();
    input.addEventListener('input', check);

    // More money than the Diary says: ask the user to log the income first,
    // so money they didn't log can't hide what they spent.
    settleBtn.addEventListener('click', function () {
      var night = BY.rules.parseMoney(input.value);
      if (night === null) return;
      var diaryBalance = BY.rules.monthBalance(data, BY.dates.monthKey());
      if (diaryBalance !== null && night > diaryBalance) {
        root.querySelector('#income-warning-text').textContent =
          'You have ' + money(night - diaryBalance) + ' more than your Diary says. ' +
          'If you got money today, log it as income first so it can\u2019t hide your spending.';
        warning.hidden = false;
        settleBtn.hidden = true;
        return;
      }
      settle(night);
    });
    root.querySelector('#log-income').addEventListener('click', function () {
      BY.diary.startIncome();
      BY.app.showScreen('diary');
    });
    root.querySelector('#settle-anyway').addEventListener('click', function () {
      var night = BY.rules.parseMoney(input.value);
      if (night !== null) settle(night);
    });

    function settle(night) {
      nightDraft = '';
      var today = BY.dates.todayKey();
      var income = BY.rules.incomeOn(data, today, day.betAt);
      var outcome = BY.rules.settleDay(day.morningBalance, income, night, day.limit, day.suggested);
      day.nightBalance = night;
      day.income = income;
      day.actualSpent = outcome.actualSpent;
      day.result = outcome.result;
      day.saved = outcome.saved;
      day.settledAt = Date.now();
      data.goal.saved += outcome.saved;
      // Keep the Diary matching real money: anything missing was spent without being logged
      var unlogged = BY.rules.unloggedSpending(BY.rules.monthBalance(data, BY.dates.monthKey()), night);
      if (unlogged) {
        data.diary.entries.push({
          id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          date: today,
          type: unlogged.type,
          amount: unlogged.amount,
          note: unlogged.note,
          at: day.settledAt
        });
        day.unlogged = unlogged.amount;
      }
      var extra = BY.rules.unloggedIncome(BY.rules.monthBalance(data, BY.dates.monthKey()), night);
      if (extra) {
        data.diary.entries.push({
          id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          date: today,
          type: extra.type,
          amount: extra.amount,
          note: extra.note,
          at: day.settledAt
        });
        day.unloggedIncome = extra.amount;
      }
      var kinds = BY.rules.achievementsFor(data, today);
      if (kinds.indexOf('monthly') !== -1) data.goal.monthlyAchieved = true;
      render(data);
      kinds.forEach(function (kind) {
        BY.achievements.show(kind, data);
      });
      save(data);
    }
  }

  // ---------- Demo: preview the town at 7, 15 and 30 days, or the treasure at 25-100% ----------
  // preview(value or null) shows it; previewing() says what's shown (null = the real one)
  function wirePreview(group, preview, previewing) {
    var buttons = group.querySelectorAll('[data-preview]');
    function mark() {
      var shown = previewing();
      buttons.forEach(function (b) {
        var value = b.dataset.preview === '' ? null : Number(b.dataset.preview);
        b.setAttribute('aria-pressed', String(value === shown));
      });
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        preview(b.dataset.preview === '' ? null : Number(b.dataset.preview));
        mark();
      });
    });
    mark();
  }

  // ---------- Demo: 30 days of success ----------
  function skipThirtyDays(data) {
    var today = BY.dates.todayKey();
    var cap = BY.rules.suggestedBet(data.diary.startingBalances[BY.dates.monthKey()]);
    var demo = BY.rules.demoDays(today, cap === null ? undefined : cap);
    Object.keys(demo.days).forEach(function (k) { data.days[k] = demo.days[k]; });
    var firstDemo = BY.dates.addDays(today, -BY.rules.GRAND_STREAK);
    if (data.startDate > firstDemo) data.startDate = firstDemo;
    data.goal.saved += demo.saved;

    var kinds = [];
    if (BY.rules.currentStreak(data) >= BY.rules.GRAND_STREAK) kinds.push('grand30');
    if (BY.rules.goalJustReached(data.goal)) {
      data.goal.monthlyAchieved = true;
      kinds.push('monthly');
    }
    save(data);
    render(data);
    kinds.forEach(function (kind) { BY.achievements.show(kind, data); });
    save(data);
  }

  // ---------- Monthly goal (always below the bet) ----------
  function renderGoal(root, data, today) {
    var goal = data.goal;
    var pct = goal.amount > 0 ? Math.min(100, Math.round(goal.saved / goal.amount * 100)) : 0;
    root.innerHTML =
      '<div class="card sketch goal-card">' +
        '<p class="eyebrow">Monthly saving goal</p>' +
        '<p class="goal-line">Saved this month: <strong id="goal-saved">' + money(goal.saved) + '</strong>' +
          (goal.amount > 0 ? ' of <strong>' + money(goal.amount) + '</strong>' : '') + '</p>' +
        (today && today.result === 'win' ? savedLine(today) : '') +
        (goal.amount > 0
          ? '<div class="progress sketch" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
              '<div class="progress-fill" id="goal-fill" style="width:' + pct + '%"></div>' +
            '</div>'
          : '<p class="hint">Every win saves what you didn\'t spend from your limit. Set a goal to aim for.</p>') +
        (goal.monthlyAchieved ? '<p class="goal-done" id="goal-done">Goal reached this month.</p>' : '') +
        '<div class="inline-form">' +
          '<div class="field">' +
            '<label for="goal-amount">Goal for this month</label>' +
            '<input id="goal-amount" inputmode="decimal" autocomplete="off" placeholder="e.g. 600.00"' +
              (goal.amount > 0 ? ' value="' + (goal.amount / 100).toFixed(2) + '"' : '') + '>' +
            '<p class="field-error" id="goal-error"></p>' +
          '</div>' +
          '<button type="button" class="btn" id="set-goal" disabled>Set goal</button>' +
        '</div>' +
      '</div>';

    // The fill grows from where it was last shown (empty on the first Home); unchanged, it stays put
    var fill = root.querySelector('#goal-fill');
    if (fill && pct !== shownPct && BY.motion.on()) {
      gsap.fromTo(fill, { width: (shownPct || 0) + '%' }, { width: pct + '%', duration: 0.9, ease: 'power2.out' });
    }
    shownPct = pct;

    var input = root.querySelector('#goal-amount');
    var btn = root.querySelector('#set-goal');
    function valid() {
      var v = BY.rules.parseMoney(input.value);
      return v && v > 0 ? v : null;
    }
    input.addEventListener('input', function () {
      var v = valid();
      root.querySelector('#goal-error').textContent =
        input.value.trim() && v === null ? 'Enter a goal above $0, like 600.00' : '';
      btn.disabled = v === null || v === goal.amount;
    });
    btn.addEventListener('click', function () {
      var v = valid();
      if (v === null) return;
      goal.amount = v;
      var reached = BY.rules.goalJustReached(goal);
      if (reached) goal.monthlyAchieved = true;
      save(data);
      render(data);
      if (reached) BY.achievements.show('monthly', data);
    });
  }

  // In the goal card after a win: "Today you saved $5.00 toward this month's goal (only up to your suggested $10.00 counts)."
  function savedLine(day) {
    var capped = typeof day.suggested === 'number' && day.limit > day.suggested;
    return '<p class="muted" id="saved-line">Today you saved <strong>' + money(day.saved) + '</strong> toward this month\'s goal' +
      (capped ? ' (only up to your suggested ' + money(day.suggested) + ' counts)' : '') + '.</p>';
  }

  // ---------- 4. Settled ----------
  function renderVerdict(root, day) {
    var win = day.result === 'win';
    root.innerHTML =
      '<div class="card sketch verdict ' + (win ? 'verdict-win' : 'verdict-loss') + '">' +
        '<p class="verdict-word">' + (win ? 'Win' : 'Lose') + '</p>' +
        '<p class="verdict-line">' + (win ? 'You beat yourself today.' : 'Yesterday\'s you won this one.') + '</p>' +
        '<p>You spent <strong>' + money(day.actualSpent) + '</strong> against a <strong>' + money(day.limit) + '</strong> limit.</p>' +
        '<p class="muted math">' + money(day.morningBalance) + ' morning + ' + money(day.income) + ' income − ' +
          money(day.nightBalance) + ' tonight = ' + money(day.actualSpent) + ' spent</p>' +
        (day.unlogged
          ? '<p class="muted" id="unlogged-note">' + money(day.unlogged) + ' you didn\'t log was added to your Diary as unlogged spending.</p>'
          : '') +
        (day.unloggedIncome
          ? '<p class="muted" id="unlogged-income-note">' + money(day.unloggedIncome) + ' more than your Diary was added to it as unlogged income.</p>'
          : '') +
        (win
          ? '<p class="muted">Protect your streak. A new bet opens at midnight.</p>'
          : '<p class="muted">Streak reset to 0. Tomorrow, ' + money(BY.rules.PENALTY) +
            ' comes off your limit. Think you can win it back?</p>') +
      '</div>';
  }

  BY.home = { render: render };
})(window.BY);
