(function () {
  'use strict';

  // Carousels: highlight the pagination bullet that matches the scroll position.
  document.querySelectorAll('[data-carousel]').forEach(function (track) {
    var section = track.parentElement;
    var pagination = section.querySelector('[data-pagination]');
    if (!pagination) return;
    var bullets = pagination.children;

    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var progress = max > 0 ? track.scrollLeft / max : 0;
      var index = Math.round(progress * (bullets.length - 1));
      for (var i = 0; i < bullets.length; i++) {
        bullets[i].classList.toggle('is-active', i === index);
      }
    }

    track.addEventListener('scroll', update, { passive: true });

    Array.prototype.forEach.call(bullets, function (bullet, i) {
      bullet.addEventListener('click', function () {
        var max = track.scrollWidth - track.clientWidth;
        track.scrollTo({ left: (max * i) / Math.max(bullets.length - 1, 1), behavior: 'smooth' });
      });
    });
  });

  // Tabs: single active item per group.
  document.querySelectorAll('[data-tabs]').forEach(function (group) {
    group.addEventListener('click', function (event) {
      var tab = event.target.closest('button');
      if (!tab || !group.contains(tab)) return;
      Array.prototype.forEach.call(group.children, function (item) {
        item.classList.toggle('is-active', item === tab);
      });
    });
  });

  // Coefficients: toggle selection.
  document.querySelectorAll('.coef').forEach(function (coef) {
    coef.addEventListener('click', function () {
      coef.classList.toggle('is-selected');
    });
  });
})();
