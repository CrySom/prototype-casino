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

  // Desktop menu: collapsed (72px) / opened (210px). Opened by default on
  // screens wider than 1280px (the initial state is set in <head>); once the
  // user toggles it, their choice is remembered between visits.
  var root = document.documentElement;
  var toggles = document.querySelectorAll('[data-sidebar-toggle]');
  var DEFAULT_OPEN = window.matchMedia('(min-width: 1281px)');

  function applySidebar(open) {
    root.classList.toggle('sidebar-open', open);
    Array.prototype.forEach.call(toggles, function (btn) {
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  function setSidebar(open) {
    applySidebar(open);
    try {
      localStorage.setItem('sidebar-state', open ? 'open' : 'collapsed');
    } catch (e) {}
  }

  function storedSidebar() {
    try {
      return localStorage.getItem('sidebar-state');
    } catch (e) {
      return null;
    }
  }

  // Without a saved choice the menu follows the breakpoint on resize.
  DEFAULT_OPEN.addEventListener('change', function (event) {
    if (!storedSidebar()) applySidebar(event.matches);
  });

  Array.prototype.forEach.call(toggles, function (btn) {
    btn.setAttribute('aria-expanded', String(root.classList.contains('sidebar-open')));
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      setSidebar(!root.classList.contains('sidebar-open'));
    });
  });

  // Logo in the opened menu collapses it back; search in the collapsed one opens it.
  var logo = document.querySelector('.sidebar__logo-link');
  if (logo) {
    logo.addEventListener('click', function (event) {
      if (!root.classList.contains('sidebar-open')) return;
      event.preventDefault();
      setSidebar(false);
    });
  }

  var sbSearch = document.querySelector('.sb-search');
  if (sbSearch) {
    sbSearch.addEventListener('click', function () {
      if (root.classList.contains('sidebar-open')) return;
      setSidebar(true);
      sbSearch.querySelector('input').focus();
    });
  }

  // Sport groups in the opened menu.
  document.querySelectorAll('[data-accordion]').forEach(function (group) {
    var head = group.firstElementChild;
    head.setAttribute('aria-expanded', String(group.classList.contains('is-open')));
    head.addEventListener('click', function () {
      if (!root.classList.contains('sidebar-open')) {
        setSidebar(true);
        return;
      }
      var open = group.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(open));
    });
  });

  // "Application" promo card in the menu footer.
  document.querySelectorAll('[data-app-card-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('[data-app-card]').classList.add('is-closed');
    });
  });

  // Game tiles on touch screens: the first tap shows the hover state
  // (play button, favourite), a tap on the active tile opens the game.
  if (window.matchMedia('(hover: none)').matches) {
    var activeTile = null;
    document.addEventListener('click', function (event) {
      var tile = event.target.closest('.game-tile');
      if (tile && tile !== activeTile) {
        event.preventDefault();
        if (activeTile) activeTile.classList.remove('is-active');
        tile.classList.add('is-active');
        activeTile = tile;
      } else if (!tile && activeTile) {
        activeTile.classList.remove('is-active');
        activeTile = null;
      }
    });
  }

  // Coefficients: toggle selection.
  document.querySelectorAll('.coef').forEach(function (coef) {
    coef.addEventListener('click', function () {
      coef.classList.toggle('is-selected');
    });
  });
})();
