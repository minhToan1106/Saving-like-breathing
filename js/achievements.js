// Achievement pop-ups: a stamped card with a warm glow over a dimmed page,
// gone after about 3 seconds or on tap. If several trigger at once, they queue and show one after another.
// Everything plays once per pop-up; with reduced motion the card just appears and disappears.
window.BY = window.BY || {};

(function (BY) {
  var queue = [];
  var showing = false;

  var TEXT = {
    win: function (info) {
      return { title: 'Yesterday\'s you: beaten.', sub: 'Streak: ' + info.streak + (info.streak === 1 ? ' day' : ' days') };
    },
    grand30: function () {
      return { title: '30 Days Unbeaten', sub: 'A whole month of beating yourself.', big: true };
    },
    monthly: function (info) {
      return { title: 'Goal Reached', sub: BY.rules.formatMoney(info.data.goal.saved) + ' saved this month', big: true };
    }
  };

  // Records the achievement in the data and queues its pop-up. The caller saves.
  function show(kind, data) {
    var today = BY.dates.todayKey();
    data.achievements.push({ kind: kind, date: today });
    queue.push(TEXT[kind]({ streak: BY.rules.currentStreak(data), data: data }));
    if (!showing) next();
  }

  function next() {
    var item = queue.shift();
    if (!item) {
      showing = false;
      dim(false);
      return;
    }
    showing = true;
    dim(true);

    var layer = document.getElementById('popups');
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'popup sketch' + (item.big ? ' popup-big' : '');
    card.innerHTML = '<span class="popup-glow" aria-hidden="true"></span>' +
      '<span class="popup-kicker">Achievement</span>' +
      '<span class="popup-title"></span><span class="popup-sub"></span>';
    card.querySelector('.popup-title').textContent = item.title;
    card.querySelector('.popup-sub').textContent = item.sub;
    layer.appendChild(card);
    var intro = BY.motion.on() ? stampIn(card, item.big) : null;

    var done = false;
    function dismiss() {
      if (done) return;
      done = true;
      if (!BY.motion.on()) {
        card.remove();
        next();
        return;
      }
      if (intro) intro.kill();
      gsap.to(card, {
        scale: 0.9, y: -20, autoAlpha: 0, duration: 0.35, ease: 'power2.in',
        onComplete: function () { card.remove(); next(); }
      });
    }
    card.addEventListener('click', dismiss);
    setTimeout(dismiss, 3000);
  }

  // The card stamps down while its glow fades in, the glow swells once and settles,
  // then the lines of text rise into place
  function stampIn(card, big) {
    var stamp = big ? 0.6 : 0.45;
    return gsap.timeline()
      .fromTo(card, { scale: 2, rotation: -14, autoAlpha: 0 },
        { scale: 1, rotation: -3, autoAlpha: 1, duration: stamp, ease: 'back.out(2)' })
      .fromTo(card.querySelector('.popup-glow'), { autoAlpha: 0, scale: 0.85 },
        { autoAlpha: 0.85, scale: 1, duration: stamp, ease: 'power2.out' }, 0)
      .to(card.querySelector('.popup-glow'), { autoAlpha: 1, scale: big ? 1.1 : 1.06, duration: 0.35, ease: 'sine.out' })
      .to(card.querySelector('.popup-glow'), { autoAlpha: 0.75, scale: 1, duration: 0.5, ease: 'sine.inOut' })
      .from(card.querySelectorAll('.popup-kicker, .popup-title, .popup-sub'),
        { y: 8, autoAlpha: 0, duration: 0.25, stagger: 0.08, ease: 'power2.out' }, stamp - 0.15);
  }

  // The page behind dims while pop-ups show, and stays dim between queued ones
  function dim(on) {
    var shade = document.getElementById('popup-dim');
    if (BY.motion.on()) {
      gsap.to(shade, { autoAlpha: on ? 1 : 0, duration: 0.3, ease: 'power1.out', overwrite: true });
    } else {
      if (window.gsap) gsap.killTweensOf(shade);
      shade.style.opacity = on ? 1 : 0;
      shade.style.visibility = on ? 'inherit' : 'hidden';
    }
  }

  BY.achievements = { show: show };
})(window.BY);
