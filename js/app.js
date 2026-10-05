// Startup: load the data, catch up on missed days, then show Home.
// Also handles the sidebar: one screen visible at a time. Loaded last, after every other script.
window.BY = window.BY || {};

(function (BY) {
  var SCREENS = {
    home: function (data) { BY.home.render(data); },
    diary: function (data) { BY.diary.render(data); }
  };
  var lastView = null;

  // Which day it is and whether night is open; re-render only when that changes,
  // so typing isn't wiped out every time the window regains focus.
  function viewKey() {
    return BY.dates.todayKey() + '|' + BY.dates.isNightOpen();
  }

  function renderCurrent() {
    lastView = viewKey();
    if (BY.catchup.run(BY.state.data) && !BY.storage.saveData(BY.state.data)) showSaveWarning();
    SCREENS[BY.state.screen](BY.state.data);
  }

  function refreshIfStale() {
    if (viewKey() !== lastView) renderCurrent();
  }

  function showScreen(name) {
    BY.state.screen = name;
    document.querySelectorAll('.screen').forEach(function (s) {
      var on = s.id === 'screen-' + name;
      s.hidden = !on;
      s.classList.toggle('is-active', on);
    });
    document.querySelectorAll('.nav-link').forEach(function (b) {
      var on = b.dataset.screen === name;
      b.classList.toggle('is-active', on);
      if (on) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    renderCurrent();
  }

  function showSaveWarning() {
    var notice = document.getElementById('notice');
    notice.textContent = 'This browser isn\'t saving your progress. Try Chrome or Edge, or open the app with Live Server.';
    notice.hidden = false;
  }

  function start() {
    BY.state = { data: BY.storage.loadData(), screen: 'home' };
    document.querySelectorAll('.nav-link').forEach(function (b) {
      b.addEventListener('click', function () {
        if (SCREENS[b.dataset.screen]) showScreen(b.dataset.screen);
      });
    });
    showScreen('home');
    window.addEventListener('focus', refreshIfStale);
    setInterval(refreshIfStale, 60 * 1000);
  }

  BY.app = { showSaveWarning: showSaveWarning, showScreen: showScreen };
  start();
})(window.BY);
