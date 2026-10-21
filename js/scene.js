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

  function apply() {
    var scene = document.querySelector('.scene');
    if (!scene || realStreak === null) return;
    var stage = stageFor(previewStreak === null ? realStreak : previewStreak);
    var treasure = treasureFor(previewPercent === null ? realPercent : previewPercent);
    [1, 2, 3].forEach(function (n) {
      scene.classList.toggle('stage-' + n, n === stage);
    });
    [1, 2, 3, 4].forEach(function (n) {
      scene.classList.toggle('treasure-' + n, n === treasure);
    });
    // After the first paint, changes cross-fade (see components.css)
    if (!scene.classList.contains('is-ready')) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { scene.classList.add('is-ready'); });
      });
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
    apply();
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
