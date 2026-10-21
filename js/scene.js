// The town in the background grows with the current streak:
// crooked at first, repaired from 7 days, a lit village from 15, a castle from 30.
// Under it, buried treasure grows with this month's savings toward the goal.
// Only reads the streak (rules.js decides it) and the goal, so a loss brings the town back
// to the start, and less saved means less treasure.
// The Demo card can preview a stage or a treasure level; a preview only changes the picture
// and is never saved.
window.BY = window.BY || {};

(function (BY) {
  // The first streak day of stage 1, 2 and 3
  var STAGE_STARTS = [7, 15, 30];
  // The first percent of the monthly goal for treasure level 1, 2, 3 and 4
  var TREASURE_STARTS = [25, 50, 80, 100];

  var realStreak = null;
  var previewStreak = null;
  var realPercent = null;
  var previewPercent = null;
  // What the picture shows now; null until the first paint, which never animates
  var shownStage = null;
  var shownTreasure = null;
  // GSAP's inline styles are cleared after each change, so the classes stay in charge
  var CLEAR = 'opacity,transform';

  function levelFor(value, starts) {
    var level = 0;
    starts.forEach(function (start, i) {
      if (value >= start) level = i + 1;
    });
    return level;
  }

  function stageFor(streak) {
    return levelFor(streak, STAGE_STARTS);
  }

  function treasureFor(percent) {
    return levelFor(percent, TREASURE_STARTS);
  }

  // Whole percent of the goal saved this month, rounded down, so 100 means the goal is truly met.
  // No goal set counts as 0.
  function goalPercent(goal) {
    if (!goal || !(goal.amount > 0)) return 0;
    return Math.floor(goal.saved * 100 / goal.amount);
  }

  // treasureDelay: seconds to wait before new treasure rises, so the goal bar fills first
  function apply(treasureDelay) {
    var scene = document.querySelector('.scene');
    if (!scene || realStreak === null) return;
    var stage = stageFor(previewStreak === null ? realStreak : previewStreak);
    var treasure = treasureFor(previewPercent === null ? realPercent : previewPercent);
    var animate = BY.motion && BY.motion.on();
    if (animate && shownStage !== null && stage !== shownStage) changeTown(scene, shownStage, stage);
    if (animate && shownTreasure !== null && treasure !== shownTreasure) {
      changeTreasure(scene, shownTreasure, treasure, treasureDelay || 0);
    }
    shownStage = stage;
    shownTreasure = treasure;
    [1, 2, 3].forEach(function (n) {
      scene.classList.toggle('stage-' + n, n === stage);
    });
    [1, 2, 3, 4].forEach(function (n) {
      scene.classList.toggle('treasure-' + n, n === treasure);
    });
    // After the first paint, pine, window and crow changes ease in (see components.css)
    if (!scene.classList.contains('is-ready')) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { scene.classList.add('is-ready'); });
      });
    }
  }

  // Splits groups into the ones a change hides and the ones it shows.
  // shownAt(group, level) says whether a group is drawn at that level.
  function changes(groups, from, to, shownAt) {
    gsap.killTweensOf(groups);
    gsap.set(groups, { clearProps: CLEAR });
    return {
      leaving: groups.filter(function (g) { return shownAt(g, from) && !shownAt(g, to); }),
      arriving: groups.filter(function (g) { return !shownAt(g, from) && shownAt(g, to); })
    };
  }

  // Stage change: old pieces sink and fade, new ones rise from the ground.
  // Going up overshoots a little, like something being built; going down after a loss doesn't.
  function changeTown(scene, from, to) {
    var groups = gsap.utils.toArray(scene.querySelectorAll('.grow'));
    var c = changes(groups, from, to, function (g, stage) { return g.classList.contains('at-' + stage); });
    var tl = gsap.timeline();
    if (c.leaving.length) {
      tl.fromTo(c.leaving, { opacity: 1 },
        { opacity: 0, y: 6, duration: 0.4, ease: 'power1.in', clearProps: CLEAR });
    }
    if (c.arriving.length) {
      // Hidden straight away, not when their turn comes, or they'd flash in first
      gsap.set(c.arriving, { opacity: 0, y: 14, scaleY: 0.9, transformOrigin: '50% 100%' });
      tl.to(c.arriving, { opacity: 1, y: 0, scaleY: 1, duration: 0.6, ease: to > from ? 'back.out(1.4)' : 'power2.out',
        stagger: { each: 0.06, from: 'edges' }, clearProps: CLEAR },
      c.leaving.length ? 0.2 : 0);
    }
  }

  // Treasure change: new finds pop up out of the soil one by one; lost ones fade away
  function changeTreasure(scene, from, to, delay) {
    var groups = gsap.utils.toArray(scene.querySelectorAll('.dig'));
    var c = changes(groups, from, to, function (g, level) {
      for (var n = 1; n <= level; n++) if (g.classList.contains('from-' + n)) return true;
      return false;
    });
    if (c.leaving.length) {
      gsap.fromTo(c.leaving, { opacity: 1 },
        { opacity: 0, duration: 0.4, ease: 'power1.in', clearProps: CLEAR });
    }
    if (c.arriving.length) {
      gsap.set(c.arriving, { opacity: 0, y: 10, scale: 0.6, transformOrigin: '50% 100%' });
      gsap.to(c.arriving, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.12,
        delay: delay, clearProps: CLEAR });
    }
  }

  // Called on every render; a real change to the streak or savings ends that preview
  function update(data) {
    var streak = BY.rules.currentStreak(data);
    var percent = goalPercent(data.goal);
    if (realStreak !== null && streak !== realStreak) previewStreak = null;
    if (realPercent !== null && percent !== realPercent) previewPercent = null;
    realStreak = streak;
    realPercent = percent;
    apply(0.5);
  }

  // streak: a number to preview, or null to go back to the real streak
  function preview(streak) {
    previewStreak = streak;
    apply();
  }

  function previewing() {
    return previewStreak;
  }

  // percent: a share of the goal to preview, or null to go back to the real savings
  function previewTreasure(percent) {
    previewPercent = percent;
    apply();
  }

  function previewingTreasure() {
    return previewPercent;
  }

  BY.scene = {
    stageFor: stageFor, treasureFor: treasureFor, goalPercent: goalPercent, update: update,
    preview: preview, previewing: previewing,
    previewTreasure: previewTreasure, previewingTreasure: previewingTreasure
  };
})(window.BY);
