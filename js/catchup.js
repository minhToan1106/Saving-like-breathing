// Runs every time the app opens (and when the window regains focus).
// A closed web page can't do anything at midnight, so this fills in what it missed:
// every day from the start date up to yesterday that wasn't settled becomes a loss.
window.BY = window.BY || {};

(function (BY) {
  function missedDay(existing) {
    var day = existing || {
      stake: null,
      penalty: 0,
      limit: null,
      morningBalance: null,
      nightBalance: null,
      income: 0,
      actualSpent: null,
      saved: 0,
      demo: false
    };
    day.result = 'loss';
    day.missed = true;
    day.saved = 0;
    return day;
  }

  // Returns true if anything changed, so the caller knows to save.
  function run(data, now) {
    var today = BY.dates.todayKey(now);
    var changed = false;

    for (var key = data.startDate; key < today; key = BY.dates.addDays(key, 1)) {
      var day = data.days[key];
      if (!day || !day.result) {
        data.days[key] = missedDay(day);
        changed = true;
      }
    }

    // New month: savings start again from $0. The goal amount itself is kept.
    var month = BY.dates.monthKey(now);
    if (data.goal && data.goal.month !== month) {
      data.goal.month = month;
      data.goal.saved = 0;
      data.goal.monthlyAchieved = false;
      changed = true;
    }

    return changed;
  }

  BY.catchup = { run: run };
})(window.BY);
