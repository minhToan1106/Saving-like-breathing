// Startup: load the data, catch up on missed days, then show Home. Loaded last, after every other script.
window.BY = window.BY || {};

(function (BY) {
  var lastView = null;

  // Which Home state the clock allows right now; re-render only when it changes,
  // so typing isn't wiped out every time the window regains focus.
  function viewKey() {
    return BY.dates.todayKey() + '|' + BY.dates.isNightOpen();
  }

  function renderHome() {
    lastView = viewKey();
    if (BY.catchup.run(BY.state.data) && !BY.storage.saveData(BY.state.data)) showSaveWarning();
    BY.home.render(BY.state.data);
  }

  function refreshIfStale() {
    if (viewKey() !== lastView) renderHome();
  }

  function showSaveWarning() {
    var notice = document.getElementById('notice');
    notice.textContent = 'This browser isn\'t saving your progress. Try Chrome or Edge, or open the app with Live Server.';
    notice.hidden = false;
  }

  function start() {
    BY.state = { data: BY.storage.loadData() };
    renderHome();
    window.addEventListener('focus', refreshIfStale);
    setInterval(refreshIfStale, 60 * 1000);
  }

  BY.app = { showSaveWarning: showSaveWarning };
  start();
})(window.BY);
