// Day/night toggle in the band: the button is a faint sun by day and a cratered moon by night.
// Flips data-theme on <html>; every color is a CSS variable, so the page and the band
// change at once. The choice is saved and applied on open.
// Also wires the crow on the band's tower, which hops when clicked.
window.BY = window.BY || {};

(function (BY) {
  // Faceless, scratchy sun (muted yellow, hatched on its lower right) and moon
  var SUN = '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<path class="sun-rays" d="M38.4 8.2 39.9 2.6 M49.2 14.8 51.2 12.8 M55.4 25.7 61.8 24 M55.2 38.2 58.8 39.2' +
      ' M49.2 49.2 53.3 53.3 M38.3 55.7 39.1 58.7 M25.9 54.8 24.2 61 M14.5 49.5 12.6 51.4 M8.4 38.3 2.2 40' +
      ' M8.4 25.7 5 24.8 M15.2 15.2 10.2 10.2 M25.8 8.9 24.8 5"/>' +
    '<path class="sun-disc" d="M32 13 41.8 15 48.7 22.4 51.7 32 49.1 41.9 41.3 48.1 32 50.5 21.9 49.5 15.5 41.5 13 32 14.3 21.8 22.3 15.2Z"/>' +
    '<path class="sun-shade" d="M48.7 22.4 51.7 32 49.1 41.9 41.3 48.1 32 50.5 21.9 49.5 15.5 41.5Z"/></svg>';
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
