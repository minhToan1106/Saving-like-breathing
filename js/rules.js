// The app's brain: pure math, no screen and no storage.
// All money is in cents (whole numbers), so $3.00 - $0.50 is exactly 250.
window.BY = window.BY || {};

(function (BY) {
  // "48.50", "$3", "4" → cents. Anything empty, negative or not a number → null.
  function parseMoney(text) {
    if (text === null || text === undefined) return null;
    var t = String(text).trim().replace(/^\$/, '');
    if (!/^(\d+(\.\d{1,2})?|\.\d{1,2})$/.test(t)) return null;
    return Math.round(parseFloat(t) * 100);
  }

  function formatMoney(cents) {
    var sign = cents < 0 ? '-' : '';
    return sign + '$' + (Math.abs(cents) / 100).toFixed(2);
  }

  // Today's limit: the tapped stake minus any penalty, never below $0.
  function limitFor(stakeCents, penaltyCents) {
    return Math.max(0, stakeCents - penaltyCents);
  }

  // Sum of that day's Diary income entries.
  function incomeOn(data, dayKey) {
    return data.diary.entries
      .filter(function (e) { return e.type === 'income' && e.date === dayKey; })
      .reduce(function (sum, e) { return sum + e.amount; }, 0);
  }

  // Actual spent = morning + income - night (a negative result counts as $0).
  // Spending exactly the limit is a win. On a win, the unspent part is saved.
  function settleDay(morning, income, night, limit) {
    var actualSpent = Math.max(0, morning + income - night);
    var win = actualSpent <= limit;
    return {
      actualSpent: actualSpent,
      result: win ? 'win' : 'loss',
      saved: win ? limit - actualSpent : 0
    };
  }

  BY.rules = {
    parseMoney: parseMoney,
    formatMoney: formatMoney,
    limitFor: limitFor,
    incomeOn: incomeOn,
    settleDay: settleDay
  };
})(window.BY);
