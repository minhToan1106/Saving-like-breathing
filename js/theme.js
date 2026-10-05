// Day/night toggle in the top right. Flips data-theme on <html>; every color is a CSS
// variable, so the whole look changes at once. The choice is saved and applied on open.
window.BY = window.BY || {};

(function (BY) {
  // Hand-drawn-style sun and moon outlines
  var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/>' +
    '<path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2l1.8 1.8M17 17l1.8 1.8M5.2 18.8 7 17M17 7l1.8-1.8"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/></svg>';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function drawButton(data) {
    var slot = document.getElementById('theme-slot');
    var night = data.theme === 'night';
    // The button shows where it takes you
    slot.innerHTML = '<button type="button" class="btn theme-toggle" id="theme-toggle" aria-pressed="' + night + '">' +
      (night ? SUN + 'Day' : MOON + 'Night') + '</button>';
    slot.querySelector('#theme-toggle').addEventListener('click', function () {
      data.theme = night ? 'day' : 'night';
      apply(data.theme);
      if (!BY.storage.saveData(data)) BY.app.showSaveWarning();
      drawButton(data);
    });
  }

  function init(data) {
    if (data.theme !== 'night') data.theme = 'day';
    apply(data.theme);
    drawButton(data);
  }

  BY.theme = { init: init };
})(window.BY);
