// The ONLY file that talks to localStorage.
// Everything the app remembers lives in one data object, saved under one key.
// To move to online storage later, rewrite the inside of loadData/saveData.
window.BY = window.BY || {};

(function (BY) {
  var KEY = 'beatYourself.v1';

  function defaultData() {
    return {
      version: 1,
      theme: 'day',
      startDate: BY.dates.todayKey(),
      days: {},
      diary: { startingBalances: {}, entries: [] },
      goal: { amount: 0, month: BY.dates.monthKey(), saved: 0, monthlyAchieved: false },
      achievements: [],
      demoNightUnlocked: null
    };
  }

  // Returns the saved data, or a fresh object on first use or if the saved data is broken.
  function loadData() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultData();
      var data = JSON.parse(raw);
      if (!data || data.version !== 1 || typeof data.days !== 'object') return defaultData();
      // Fill in any missing parts so older or hand-edited data still works
      var fresh = defaultData();
      Object.keys(fresh).forEach(function (k) {
        if (data[k] === undefined) data[k] = fresh[k];
      });
      // Before slice 3 the diary had one startingBalance instead of one per month
      if (!data.diary.startingBalances) data.diary.startingBalances = {};
      delete data.diary.startingBalance;
      return data;
    } catch (e) {
      console.warn('Saved data could not be read, starting fresh.', e);
      return defaultData();
    }
  }

  // Returns true if saved, false if this browser refused.
  function saveData(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Could not save data.', e);
      return false;
    }
  }

  BY.storage = { loadData: loadData, saveData: saveData, defaultData: defaultData };
})(window.BY);
