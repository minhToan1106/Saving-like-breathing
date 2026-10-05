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

  // Sum of that day's Diary income entries. With sinceTime (when the bet was locked in),
  // only income logged after the bet counts: income logged before it is already inside
  // the morning balance, so adding it again would count it twice.
  function incomeOn(data, dayKey, sinceTime) {
    return data.diary.entries
      .filter(function (e) {
        if (e.type !== 'income' || e.date !== dayKey) return false;
        return !sinceTime || !e.at || e.at > sinceTime;
      })
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

  // 50 cents off today if the day before was a loss (including a missed day).
  // Flat, never stacks, and there's nothing to lose before your first day.
  var PENALTY = 50;

  function penaltyFor(data, dayKey) {
    var prev = data.days[BY.dates.addDays(dayKey, -1)];
    return prev && prev.result === 'loss' ? PENALTY : 0;
  }

  // Consecutive wins, counting back from the latest settled day.
  function currentStreak(data) {
    var settled = Object.keys(data.days)
      .filter(function (k) { return data.days[k].result; })
      .sort();
    if (!settled.length) return 0;
    var key = settled[settled.length - 1];
    var streak = 0;
    while (data.days[key] && data.days[key].result === 'win') {
      streak++;
      key = BY.dates.addDays(key, -1);
    }
    return streak;
  }

  // The Diary balance for one month: that month's starting money + its income − its spending.
  // null if the starting money for that month hasn't been entered yet.
  function monthBalance(data, month) {
    var start = data.diary.startingBalances[month];
    if (typeof start !== 'number') return null;
    return data.diary.entries
      .filter(function (e) { return e.date.slice(0, 7) === month; })
      .reduce(function (sum, e) {
        return sum + (e.type === 'income' ? e.amount : -e.amount);
      }, start);
  }

  // Suggested starting money for a new month: where last month's Diary ended, or null.
  function monthStartSuggestion(data, month) {
    return monthBalance(data, BY.dates.prevMonth(month));
  }

  // At settle: if the night balance is lower than the Diary says, the difference was
  // spent without being logged. Returns the Diary entry to add, or null.
  function unloggedSpending(diaryBalance, night) {
    if (diaryBalance === null || night >= diaryBalance) return null;
    return { type: 'spending', amount: diaryBalance - night, note: 'Unlogged spending' };
  }

  // Which pop-ups to show after a day is settled.
  function achievementsFor(data, dayKey) {
    var kinds = [];
    if (data.days[dayKey] && data.days[dayKey].result === 'win') kinds.push('win');
    return kinds;
  }

  BY.rules = {
    PENALTY: PENALTY,
    parseMoney: parseMoney,
    formatMoney: formatMoney,
    limitFor: limitFor,
    incomeOn: incomeOn,
    settleDay: settleDay,
    penaltyFor: penaltyFor,
    currentStreak: currentStreak,
    monthBalance: monthBalance,
    monthStartSuggestion: monthStartSuggestion,
    unloggedSpending: unloggedSpending,
    achievementsFor: achievementsFor
  };
})(window.BY);
