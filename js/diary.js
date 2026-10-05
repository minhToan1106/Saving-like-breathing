// Diary screen: the money you have this month, plus spending and income entries.
// Entries are a record only. Today's income entries feed the night verdict.
window.BY = window.BY || {};

(function (BY) {
  var entryType = 'spending';
  var fixing = false; // showing the "fix starting money" form

  function money(cents) {
    return BY.rules.formatMoney(cents);
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function save(data) {
    if (!BY.storage.saveData(data)) BY.app.showSaveWarning();
  }

  function shortDate(key) {
    return BY.dates.parseKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // Asked once a month: on first use, and on the first open in a new month (or when fixing).
  function startingCard(data, month) {
    var current = data.diary.startingBalances[month];
    var prefill = typeof current === 'number'
      ? current
      : BY.rules.monthStartSuggestion(data, month);
    var fixing = typeof current === 'number';
    return '<div class="card sketch balance-card" id="starting-card">' +
      '<p class="eyebrow">' + (fixing ? 'Fix the money you had this month' : 'This month') + '</p>' +
      '<p>How much money do you have this month?</p>' +
      '<div class="inline-form">' +
        '<div class="field">' +
          '<label for="starting-balance">Money you have this month</label>' +
          '<input id="starting-balance" inputmode="decimal" autocomplete="off" placeholder="e.g. 200.00"' +
            (typeof prefill === 'number' ? ' value="' + (Math.max(0, prefill) / 100).toFixed(2) + '"' : '') + '>' +
          (!fixing && typeof prefill === 'number' ? '<p class="hint">Where last month\'s Diary ended. Change it if needed.</p>' : '') +
          '<p class="field-error" id="starting-error"></p>' +
        '</div>' +
        '<button type="button" class="btn primary" id="set-starting">Save</button>' +
        (fixing ? '<button type="button" class="btn" id="cancel-fix">Cancel</button>' : '') +
      '</div>' +
    '</div>';
  }

  function balanceCard(balance) {
    return '<div class="card sketch balance-card">' +
      '<p class="eyebrow">Money you have this month</p>' +
      '<p class="balance-amount' + (balance < 0 ? ' is-negative' : '') + '" id="diary-balance">' + money(balance) + '</p>' +
      '<button type="button" class="link-btn" id="fix-starting">fix starting money</button>' +
    '</div>';
  }

  function render(data) {
    var root = document.getElementById('screen-diary');
    var month = BY.dates.monthKey();
    var balance = BY.rules.monthBalance(data, month);

    // Only this month's entries; earlier months stay saved
    var list = data.diary.entries.filter(function (e) {
      return e.date.slice(0, 7) === month;
    }).reverse().map(function (e) {
      var sign = e.type === 'income' ? '+' : '−';
      return '<li class="entry entry-' + e.type + '">' +
        '<span class="entry-date">' + shortDate(e.date) + '</span>' +
        '<span class="entry-note">' + escapeHtml(e.note || (e.type === 'income' ? 'Income' : 'Spending')) + '</span>' +
        '<span class="entry-amount">' + sign + money(e.amount) + '</span>' +
      '</li>';
    }).join('');

    root.innerHTML =
      '<div class="screen-head"><h2 class="screen-title">Diary</h2></div>' +
      '<div class="diary">' +
        (balance === null || fixing ? startingCard(data, month) : balanceCard(balance)) +

        '<div class="card sketch">' +
          '<p class="eyebrow">Log money in or out</p>' +
          '<div class="stakes" role="group" aria-label="Entry type">' +
            '<button type="button" class="btn entry-type" data-type="spending">Spending</button>' +
            '<button type="button" class="btn entry-type" data-type="income">Income</button>' +
          '</div>' +
          '<div class="field">' +
            '<label for="entry-note">What was it?</label>' +
            '<input id="entry-note" autocomplete="off" maxlength="60" placeholder="e.g. bubble tea">' +
          '</div>' +
          '<div class="field">' +
            '<label for="entry-amount">Amount</label>' +
            '<input id="entry-amount" inputmode="decimal" autocomplete="off" placeholder="e.g. 4.00">' +
            '<p class="field-error" id="entry-error"></p>' +
          '</div>' +
          '<button type="button" class="btn primary" id="add-entry" disabled>Add entry</button>' +
        '</div>' +

        (list
          ? '<ul class="entries" id="entries">' + list + '</ul>'
          : '<p class="empty-note" id="entries-empty">Nothing logged yet. Add your first entry above. Even a bubble tea counts.</p>') +
      '</div>';

    bind(root, data);
  }

  function bind(root, data) {
    var noteInput = root.querySelector('#entry-note');
    var amountInput = root.querySelector('#entry-amount');
    var addBtn = root.querySelector('#add-entry');
    var startInput = root.querySelector('#starting-balance');

    if (startInput) {
      var startBtn = root.querySelector('#set-starting');
      var checkStart = function () {
        var v = BY.rules.parseMoney(startInput.value);
        root.querySelector('#starting-error').textContent =
          startInput.value.trim() && v === null ? 'Enter your balance as a number, like 200.00' : '';
        startBtn.disabled = v === null;
      };
      checkStart();
      startInput.addEventListener('input', checkStart);
      startBtn.addEventListener('click', function () {
        var v = BY.rules.parseMoney(startInput.value);
        if (v === null) return;
        data.diary.startingBalances[BY.dates.monthKey()] = v;
        fixing = false;
        save(data);
        render(data);
      });
      var cancel = root.querySelector('#cancel-fix');
      if (cancel) cancel.addEventListener('click', function () { fixing = false; render(data); });
    } else {
      root.querySelector('#fix-starting').addEventListener('click', function () { fixing = true; render(data); });
    }

    function markType() {
      root.querySelectorAll('.entry-type').forEach(function (b) {
        var on = b.dataset.type === entryType;
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }
    markType();

    root.querySelectorAll('.entry-type').forEach(function (b) {
      b.addEventListener('click', function () {
        entryType = b.dataset.type;
        markType();
      });
    });

    function validAmount() {
      var v = BY.rules.parseMoney(amountInput.value);
      return v && v > 0 ? v : null;
    }

    amountInput.addEventListener('input', function () {
      var v = validAmount();
      root.querySelector('#entry-error').textContent =
        amountInput.value.trim() && v === null ? 'Enter an amount above $0, like 4.00' : '';
      addBtn.disabled = v === null;
    });

    addBtn.addEventListener('click', function () {
      var amount = validAmount();
      if (amount === null) return;
      data.diary.entries.push({
        id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        date: BY.dates.todayKey(),
        at: Date.now(), // when it was logged, so the morning pre-fill knows what came after check-in
        type: entryType,
        amount: amount,
        note: noteInput.value.trim()
      });
      save(data);
      render(data);
    });
  }

  BY.diary = { render: render };
})(window.BY);
