// Streaks screen: the current streak plus a full-year activity grid (January to December),
// like a contribution graph split into 12 month blocks: one column per week, one row per weekday.
window.BY = window.BY || {};

(function (BY) {
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function squareClass(data, key, today) {
    var day = data.days[key];
    var cls = 'sq';
    if (day && day.result === 'win') cls += ' sq-win';
    else if (day && day.result === 'loss') cls += ' sq-loss';
    else cls += ' sq-none';
    if (key > today) cls += ' sq-future';
    if (key === today) cls += ' sq-today';
    return cls;
  }

  function label(data, key, today) {
    var day = data.days[key];
    var when = BY.dates.parseKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (key > today) return when;
    if (!day || !day.result) return when + ': no data';
    return when + ': ' + (day.result === 'win' ? 'win' : 'loss') + (day.missed ? ' (missed)' : '') + (day.demo ? ' (demo)' : '');
  }

  function render(data) {
    var root = document.getElementById('screen-streaks');
    var today = BY.dates.todayKey();
    var streak = BY.rules.currentStreak(data);
    var year = today.slice(0, 4);

    // One block per month, so months sit apart with a gap between them.
    // Inside a block: one column per week, Sunday at the top.
    var blocks = '';
    for (var m = 1; m <= 12; m++) {
      var monthKey = year + '-' + (m < 10 ? '0' : '') + m;
      var firstOfMonth = monthKey + '-01';
      var cells = '';
      var lead = BY.dates.parseKey(firstOfMonth).getDay();
      for (var b = 0; b < lead; b++) cells += '<li class="sq sq-blank" aria-hidden="true"></li>';
      for (var key = firstOfMonth; key.slice(0, 7) === monthKey; key = BY.dates.addDays(key, 1)) {
        var text = label(data, key, today);
        cells += '<li class="' + squareClass(data, key, today) + '" data-date="' + key + '" title="' + text + '">' +
          '<span class="sr-only">' + text + '</span></li>';
      }
      blocks += '<div class="month">' +
        '<span class="month-label">' + MONTHS[m - 1] + '</span>' +
        '<ol class="grid">' + cells + '</ol>' +
      '</div>';
    }

    root.innerHTML =
      '<div class="screen-head"><h2 class="screen-title">Streaks</h2></div>' +
      '<div class="streaks">' +
        '<div class="card sketch streak-card">' +
          '<p class="eyebrow">Current streak</p>' +
          '<p class="streak-number" id="streaks-number">' + streak + '</p>' +
          '<p class="muted">' + (streak === 1 ? 'day' : 'days') + ' unbeaten</p>' +
        '</div>' +
        '<div class="card sketch grid-card">' +
          '<p class="eyebrow">' + year + '</p>' +
          '<div class="year-scroll" id="year-scroll">' +
            '<div class="year">' +
              '<ul class="weekday-labels" aria-hidden="true"><li></li><li>Mon</li><li></li><li>Wed</li><li></li><li>Fri</li><li></li></ul>' +
              '<div class="months" id="streak-grid">' + blocks + '</div>' +
            '</div>' +
          '</div>' +
          '<ul class="legend">' +
            '<li><span class="sq sq-win"></span> Win</li>' +
            '<li><span class="sq sq-loss"></span> Loss</li>' +
            '<li><span class="sq sq-none"></span> No data</li>' +
            '<li><span class="sq sq-none sq-today"></span> Today</li>' +
          '</ul>' +
        '</div>' +
      '</div>';

    // On narrow screens the year scrolls sideways; start with today in view
    var scroller = root.querySelector('#year-scroll');
    var todaySq = root.querySelector('.sq-today');
    if (todaySq && scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollLeft = todaySq.offsetLeft - scroller.clientWidth / 2;
    }
  }

  BY.streaks = { render: render };
})(window.BY);
