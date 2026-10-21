// Motion: whether to animate right now. GSAP is loaded from js/vendor/gsap.min.js;
// without it (tests.html) or with reduced motion on, every change shows its end state at once.
// Asked at the moment of each change, so switching the OS setting takes effect without a reload.
window.BY = window.BY || {};

(function (BY) {
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function on() {
    return !!window.gsap && !(reduce && reduce.matches);
  }

  BY.motion = { on: on };
})(window.BY);
