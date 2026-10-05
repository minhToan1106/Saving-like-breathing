// Achievement pop-ups: a stamped card that fades after about 3 seconds or on tap.
// If several trigger at once, they queue and show one after another.
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
    if (!item) { showing = false; return; }
    showing = true;

    var layer = document.getElementById('popups');
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'popup sketch' + (item.big ? ' popup-big' : '');
    card.innerHTML = '<span class="popup-kicker">Achievement</span>' +
      '<span class="popup-title"></span><span class="popup-sub"></span>';
    card.querySelector('.popup-title').textContent = item.title;
    card.querySelector('.popup-sub').textContent = item.sub;
    layer.appendChild(card);

    var done = false;
    function dismiss() {
      if (done) return;
      done = true;
      card.classList.add('is-leaving');
      setTimeout(function () { card.remove(); next(); }, 400);
    }
    card.addEventListener('click', dismiss);
    setTimeout(dismiss, 3000);
  }

  BY.achievements = { show: show };
})(window.BY);
