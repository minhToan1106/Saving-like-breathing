// Day/night toggle in the band: the button is a faint sun by day and a cratered moon by night.
// Flips data-theme on <html>; every color is a CSS variable, so the page and the band
// change at once. The choice is saved and applied on open.
// Also wires the crow on the band's tower, which hops when clicked.
window.BY = window.BY || {};

(function (BY) {
  // Faceless, scratchy sun and moon
  var SUN = '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<path class="sun-rays" d="M32 4v9M33 51v10M5 31h9M51 33h9M12 13l6 5M46 47l5 6M13 52l5-6M45 17l7-6"/>' +
    '<path class="sun-disc" d="M32 15 44 19 49 31 45 44 32 49 20 45 15 33 19 20Z"/></svg>';
  var MOON = '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<path class="moon-disc" d="M32 8 47 13 56 27 55 42 46 53 31 57 17 51 9 38 10 23 19 12Z"/>' +
    '<circle class="moon-crater" cx="24" cy="24" r="5"/><circle class="moon-crater" cx="40" cy="36" r="7"/>' +
    '<circle class="moon-crater" cx="22" cy="42" r="3"/><circle class="moon-crater" cx="42" cy="19" r="2.5"/></svg>';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function drawButton(data) {
    var slot = document.getElementById('theme-slot');
    var night = data.theme === 'night';
    // The button is what's in the sky now; clicking it brings the other one
    slot.innerHTML = '<button type="button" class="theme-toggle" id="theme-toggle" aria-pressed="' + night +
      '" aria-label="' + (night ? 'Moon: switch to day' : 'Sun: switch to night') + '">' +
      (night ? MOON : SUN) + '</button>';
    slot.querySelector('#theme-toggle').addEventListener('click', function () {
      data.theme = night ? 'day' : 'night';
      apply(data.theme);
      if (!BY.storage.saveData(data)) BY.app.showSaveWarning();
      drawButton(data);
      document.getElementById('theme-toggle').focus();
    });
  }

  // The crow on the tower hops once per click (or Enter/Space, since it's an SVG "button")
  function wireCrow() {
    var crow = document.getElementById('crow');
    if (!crow) return;
    function hop() {
      if (crow.classList.contains('is-hopping')) return;
      crow.classList.add('is-hopping');
      setTimeout(function () { crow.classList.remove('is-hopping'); }, 1000);
    }
    crow.addEventListener('click', hop);
    crow.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hop();
      }
    });
  }

  function init(data) {
    if (data.theme !== 'night') data.theme = 'day';
    apply(data.theme);
    drawButton(data);
    wireCrow();
  }

  BY.theme = { init: init };
})(window.BY);
