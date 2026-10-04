// Home screen: the morning bet, the night check-in and the verdict.
// It shows one of four states, based on today's record and the clock.
window.BY = window.BY || {};

(function (BY) {
  var STAKES = [200, 300, 500, 1000];
  var BALANCE_ERROR = 'Enter your balance as a number, like 48.50';

  // What the user has picked but not confirmed yet
  var ui = { stake: null, custom: false };

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
    var root = document.getElementById('home-play');
    var today = BY.dates.todayKey();
    var day = data.days[today];

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

  // ---------- 1. Before the bet ----------
  function renderBet(root, data, today) {
    var stakeButtons = STAKES.map(function (s) {
      return '<button type="button" class="btn stake" data-stake="' + s + '">' + shortMoney(s) + '</button>';
    }).join('');

    root.innerHTML =
      '<div class="card sketch">' +
        '<p class="bet-sentence">Today I\'ll spend no more than…</p>' +
        '<div class="stakes" role="group" aria-label="Spending limit">' +
          stakeButtons +
          '<button type="button" class="btn stake" data-stake="custom">Custom</button>' +
        '</div>' +
        '<div class="field" id="custom-field" hidden>' +
          '<label for="custom-stake">Your own limit</label>' +
          '<input id="custom-stake" inputmode="decimal" autocomplete="off" placeholder="e.g. 4.50">' +
          '<p class="field-error" id="custom-error"></p>' +
        '</div>' +
        '<div class="field">' +
          '<label for="morning-balance">Money you have right now</label>' +
          '<input id="morning-balance" inputmode="decimal" autocomplete="off" placeholder="e.g. 50.00">' +
          '<p class="field-error" id="morning-error"></p>' +
        '</div>' +
        '<button type="button" class="btn primary" id="confirm-bet" disabled>Lock in the stakes</button>' +
        '<p class="hint" id="bet-hint">Pick your stakes and enter your balance to lock in.</p>' +
      '</div>';

    var customField = root.querySelector('#custom-field');
    var customInput = root.querySelector('#custom-stake');
    var morningInput = root.querySelector('#morning-balance');
    var confirmBtn = root.querySelector('#confirm-bet');

    function chosenStake() {
      if (!ui.custom) return ui.stake;
      var c = BY.rules.parseMoney(customInput.value);
      return c && c > 0 ? c : null;
    }

    function validate() {
      var stake = chosenStake();
      var morning = BY.rules.parseMoney(morningInput.value);
      root.querySelector('#custom-error').textContent =
        ui.custom && customInput.value.trim() && stake === null ? 'Enter a limit above $0, like 4.50' : '';
      root.querySelector('#morning-error').textContent =
        morningInput.value.trim() && morning === null ? BALANCE_ERROR : '';
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
        ui.stake = ui.custom ? null : Number(btn.dataset.stake);
        customField.hidden = !ui.custom;
        if (ui.custom) customInput.focus();
        validate();
      });
    });

    customInput.addEventListener('input', validate);
    morningInput.addEventListener('input', validate);

    confirmBtn.addEventListener('click', function () {
      var bet = validate();
      if (!bet) return;
      var penalty = 0;
      data.days[today] = {
        stake: bet.stake,
        penalty: penalty,
        limit: BY.rules.limitFor(bet.stake, penalty),
        morningBalance: bet.morning,
        nightBalance: null,
        income: 0,
        actualSpent: null,
        result: null,
        saved: 0,
        missed: false,
        demo: false
      };
      ui = { stake: null, custom: false };
      save(data);
      render(data);
    });
  }

  // ---------- 2. Bet placed, before 7 PM ----------
  function renderWaiting(root, data, today, day) {
    root.innerHTML =
      '<div class="card sketch">' +
        '<p class="eyebrow">Today\'s stakes</p>' +
        '<p class="big-line">Spend no more than <strong>' + money(day.limit) + '</strong></p>' +
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
        '<div class="field">' +
          '<label for="night-balance">Money you have now</label>' +
          '<input id="night-balance" inputmode="decimal" autocomplete="off" placeholder="e.g. 48.00">' +
          '<p class="field-error" id="night-error"></p>' +
        '</div>' +
        '<button type="button" class="btn primary" id="settle" disabled>Settle up</button>' +
      '</div>';

    var input = root.querySelector('#night-balance');
    var settleBtn = root.querySelector('#settle');

    input.addEventListener('input', function () {
      var night = BY.rules.parseMoney(input.value);
      root.querySelector('#night-error').textContent = input.value.trim() && night === null ? BALANCE_ERROR : '';
      settleBtn.disabled = night === null;
    });

    settleBtn.addEventListener('click', function () {
      var night = BY.rules.parseMoney(input.value);
      if (night === null) return;
      var today = BY.dates.todayKey();
      var income = BY.rules.incomeOn(data, today);
      var outcome = BY.rules.settleDay(day.morningBalance, income, night, day.limit);
      day.nightBalance = night;
      day.income = income;
      day.actualSpent = outcome.actualSpent;
      day.result = outcome.result;
      day.saved = outcome.saved;
      save(data);
      render(data);
    });
  }

  // ---------- 4. Settled ----------
  function renderVerdict(root, day) {
    var win = day.result === 'win';
    root.innerHTML =
      '<div class="card sketch verdict ' + (win ? 'verdict-win' : 'verdict-loss') + '">' +
        '<p class="verdict-word">' + (win ? 'Win' : 'Lose') + '</p>' +
        '<p class="verdict-line">' + (win ? 'Yesterday\'s you: beaten.' : 'Yesterday\'s you won this one.') + '</p>' +
        '<p>You spent <strong>' + money(day.actualSpent) + '</strong> against a <strong>' + money(day.limit) + '</strong> limit.</p>' +
        '<p class="muted math">' + money(day.morningBalance) + ' morning + ' + money(day.income) + ' income − ' +
          money(day.nightBalance) + ' tonight = ' + money(day.actualSpent) + ' spent</p>' +
        '<p class="muted">A new bet opens at midnight.</p>' +
      '</div>';
  }

  BY.home = { render: render };
})(window.BY);
