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
  // Spending exactly the limit is a win. On a win, the unspent part is saved, but only
  // up to the suggested bet (savingsCap), so a huge bet can't turn into fake savings.
  function settleDay(morning, income, night, limit, savingsCap) {
    var actualSpent = Math.max(0, morning + income - night);
    var win = actualSpent <= limit;
    var counted = typeof savingsCap === 'number' ? Math.min(limit, savingsCap) : limit;
    return {
      actualSpent: actualSpent,
      result: win ? 'win' : 'loss',
      saved: win ? Math.max(0, counted - actualSpent) : 0
    };
  }

  // Suggested bet for the whole month: this month's starting money ÷ 30.
  // Takes the starting money in cents; null if it hasn't been entered.
  function suggestedBet(startingMoney) {
    if (typeof startingMoney !== 'number') return null;
    return Math.round(Math.max(0, startingMoney) / 30);
  }

  // 50 cents off today if the day before was a loss (including a missed day).
  // Flat, never stacks, and there's nothing to lose before your first day.
  var PENALTY = 50;

  function penaltyFor(data, dayKey) {
    var prev = data.days[BY.dates.addDays(dayKey, -1)];
    return prev && prev.result === 'loss' ? PENALTY : 0;
  }

  // Consecutive wins ending on dayKey, counting backwards.
  function streakEndingOn(data, dayKey) {
    var key = dayKey;
    var streak = 0;
    while (data.days[key] && data.days[key].result === 'win') {
      streak++;
      key = BY.dates.addDays(key, -1);
    }
    return streak;
  }

  // Consecutive wins, counting back from the latest settled day.
  function currentStreak(data) {
    var settled = Object.keys(data.days)
      .filter(function (k) { return data.days[k].result; })
      .sort();
    if (!settled.length) return 0;
    return streakEndingOn(data, settled[settled.length - 1]);
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

  var GRAND_STREAK = 30;

  // "Skip to 30 days of success": 30 winning sample days ending the day before dayKey.
  // Stake and limit $10, spending from a fixed $3–$7 pattern, saved through the same
  // settleDay rule (and savings cap) as a real day. Returns { days, saved }.
  var DEMO_SPENT = [300, 500, 700, 400, 600, 300, 500];

  function demoDays(dayKey, savingsCap) {
    var days = {};
    var saved = 0;
    for (var i = GRAND_STREAK; i >= 1; i--) {
      var key = BY.dates.addDays(dayKey, -i);
      var spent = DEMO_SPENT[i % DEMO_SPENT.length];
      var outcome = settleDay(spent, 0, 0, 1000, savingsCap);
      days[key] = {
        stake: 1000, penalty: 0, limit: 1000,
        morningBalance: null, nightBalance: null, income: 0,
        actualSpent: outcome.actualSpent, result: outcome.result, saved: outcome.saved,
        suggested: typeof savingsCap === 'number' ? savingsCap : null,
        missed: false, demo: true
      };
      saved += outcome.saved;
    }
    return { days: days, saved: saved };
  }

  // True the first time this month's savings reach a goal that has been set.
  function goalJustReached(goal) {
    return !!goal && goal.amount > 0 && goal.saved >= goal.amount && !goal.monthlyAchieved;
  }

  // Which pop-ups to show after a day is settled (call after the day's savings are added).
  function achievementsFor(data, dayKey) {
    var kinds = [];
    if (data.days[dayKey] && data.days[dayKey].result === 'win') {
      kinds.push('win');
      if (streakEndingOn(data, dayKey) === GRAND_STREAK) kinds.push('grand30');
    }
    if (goalJustReached(data.goal)) kinds.push('monthly');
    return kinds;
  }

  BY.rules = {
    PENALTY: PENALTY,
    parseMoney: parseMoney,
    formatMoney: formatMoney,
    limitFor: limitFor,
    incomeOn: incomeOn,
    settleDay: settleDay,
    suggestedBet: suggestedBet,
    penaltyFor: penaltyFor,
    currentStreak: currentStreak,
    monthBalance: monthBalance,
    monthStartSuggestion: monthStartSuggestion,
    unloggedSpending: unloggedSpending,
    GRAND_STREAK: GRAND_STREAK,
    demoDays: demoDays,
    goalJustReached: goalJustReached,
    achievementsFor: achievementsFor
  };
})(window.BY);
