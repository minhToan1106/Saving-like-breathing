// Date helpers using the computer's local clock. Days are keyed like "2026-10-04".
window.BY = window.BY || {};

(function (BY) {
  var NIGHT_UNLOCK_HOUR = 19; // 7 PM

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function keyOf(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseKey(key) {
    var p = key.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function todayKey(now) {
    return keyOf(now || new Date());
  }

  function monthKey(now) {
    return todayKey(now).slice(0, 7);
  }

  function addDays(key, n) {
    var d = parseKey(key);
    d.setDate(d.getDate() + n);
    return keyOf(d);
  }

  function isNightOpen(now) {
    return (now || new Date()).getHours() >= NIGHT_UNLOCK_HOUR;
  }

  BY.dates = {
    NIGHT_UNLOCK_HOUR: NIGHT_UNLOCK_HOUR,
    todayKey: todayKey,
    monthKey: monthKey,
    addDays: addDays,
    parseKey: parseKey,
    isNightOpen: isNightOpen
  };
})(window.BY);
