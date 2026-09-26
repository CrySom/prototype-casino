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

  // Logged-in state: html.is-auth swaps the header buttons for the balance /
  // profile controls and shows the player widgets. Kept between visits.
  function setAuth(on) {
    root.classList.toggle('is-auth', on);
    try {
      if (on) localStorage.setItem('auth', '1');
      else localStorage.removeItem('auth');
    } catch (e) {}
  }

  var profileToggle = document.querySelector('[data-profile-toggle]');
  var profileMenu = document.querySelector('[data-profile-menu]');
  if (profileToggle && profileMenu) {
    var setProfileMenu = function (open) {
      profileMenu.hidden = !open;
      profileToggle.setAttribute('aria-expanded', String(open));
    };
    profileToggle.addEventListener('click', function () {
      setProfileMenu(profileMenu.hidden);
    });
    document.addEventListener('click', function (event) {
      if (!profileMenu.hidden && !event.target.closest('.header__profile')) setProfileMenu(false);
    });
    profileMenu.querySelector('[data-logout]').addEventListener('click', function () {
      setProfileMenu(false);
      setAuth(false);
      window.scrollTo(0, 0);
    });
  }

  // Footer groups ("Online Casino", "Legal Policies").
  document.querySelectorAll('[data-footer-group]').forEach(function (group) {
    var head = group.querySelector('.footer-legal__title');
    head.addEventListener('click', function () {
      head.setAttribute('aria-expanded', String(group.classList.toggle('is-open')));
    });
  });

  // Stories: a story plays its slides (5 s each); a tap on the left / right
  // half of the slide goes back / forward, the last slide closes the viewer.
  var storyView = document.getElementById('story');
  if (storyView) {
    var steps = storyView.querySelectorAll('.story-view__step');
    var storyTitle = storyView.querySelector('[data-story-title]');
    var storyIndex = 0;
    var storyFocus = null;

    var showStep = function (i) {
      if (i < 0) i = 0;
      if (i >= steps.length) {
        closeStory();
        return;
      }
      storyIndex = i;
      Array.prototype.forEach.call(steps, function (step, n) {
        step.classList.remove('is-active');
        step.classList.toggle('is-done', n < i);
      });
      void steps[i].offsetWidth; // restart the progress animation
      steps[i].classList.add('is-active');
    };

    var openStory = function (story) {
      storyFocus = story;
      storyTitle.textContent = story.querySelector('.story__label').textContent;
      storyView.hidden = false;
      root.classList.add('modal-open');
      showStep(0);
      storyView.querySelector('.story-view__close').focus();
    };

    var closeStory = function () {
      storyView.hidden = true;
      root.classList.remove('modal-open');
      Array.prototype.forEach.call(steps, function (step) {
        step.classList.remove('is-active', 'is-done');
      });
      if (storyFocus) {
        storyFocus.classList.add('is-seen');
        storyFocus.focus();
      }
    };

    Array.prototype.forEach.call(steps, function (step, n) {
      step.firstElementChild.addEventListener('animationend', function () {
        if (n === storyIndex) showStep(n + 1);
      });
    });

    document.querySelectorAll('[data-story]').forEach(function (story) {
      story.addEventListener('click', function () {
        openStory(story);
      });
    });
    storyView.querySelector('[data-story-prev]').addEventListener('click', function () {
      showStep(storyIndex - 1);
    });
    storyView.querySelector('[data-story-next]').addEventListener('click', function () {
      showStep(storyIndex + 1);
    });
    storyView.querySelectorAll('[data-story-close]').forEach(function (btn) {
      btn.addEventListener('click', closeStory);
    });
    document.addEventListener('keydown', function (event) {
      if (storyView.hidden) return;
      if (event.key === 'Escape') closeStory();
      else if (event.key === 'ArrowLeft') showStep(storyIndex - 1);
      else if (event.key === 'ArrowRight') showStep(storyIndex + 1);
    });
  }

  // Log in / Sign up pop-up. Prototype: a click / tap on a field fills it with
  // the demo value from data-value. "Log In" enables once email and password
  // are filled; "Registration" also needs the date of birth and the 18+ box.
  var modal = document.getElementById('auth');
  if (modal) {
    var cards = modal.querySelectorAll('[data-auth]');
    var lastFocus = null;
    var REQUIRED = { login: ['email', 'password'], signup: ['email', 'password', 'birth'] };

    function setupCard(card) {
      var kind = card.getAttribute('data-auth');
      var fields = card.querySelectorAll('[data-reg-field]');
      var submit = card.querySelector('.reg-card__submit');
      var terms = card.querySelector('#reg-terms');
      var promoLink = card.querySelector('[data-reg-promo]');
      var eye = card.querySelector('[data-reg-eye]');

      function fieldText(field) {
        var value = field.getAttribute('data-value');
        if (field.getAttribute('data-reg-field') === 'password' && !(eye && eye.classList.contains('is-on'))) {
          return value.replace(/./g, '*');
        }
        return value;
      }

      function focusField(field) {
        Array.prototype.forEach.call(fields, function (f) {
          f.classList.toggle('is-focused', f === field);
        });
      }

      function updateSubmit() {
        var filled = REQUIRED[kind].every(function (name) {
          return card.querySelector('[data-reg-field="' + name + '"]').classList.contains('is-filled');
        });
        submit.disabled = !(filled && (!terms || terms.checked));
      }

      function fill(field) {
        field.classList.add('is-filled');
        field.querySelector('.reg-field__value').textContent = fieldText(field);
        focusField(field);
        updateSubmit();
      }

      Array.prototype.forEach.call(fields, function (field) {
        field.addEventListener('click', function (event) {
          if (event.target.closest('[data-reg-eye]')) return;
          fill(field);
        });
        field.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fill(field);
          }
        });
      });

      // Clicking outside the fields drops the focus ring.
      card.addEventListener('click', function (event) {
        if (!event.target.closest('[data-reg-field]')) focusField(null);
      });

      if (eye) {
        eye.addEventListener('click', function () {
          eye.classList.toggle('is-on');
          var field = eye.closest('[data-reg-field]');
          if (field.classList.contains('is-filled')) {
            field.querySelector('.reg-field__value').textContent = fieldText(field);
          }
        });
      }

      if (promoLink) {
        promoLink.addEventListener('click', function () {
          promoLink.hidden = true;
          var promo = card.querySelector('[data-reg-field="promo"]');
          promo.hidden = false;
          promo.focus();
        });
      }

      if (terms) terms.addEventListener('change', updateSubmit);

      card.addEventListener('submit', function (event) {
        event.preventDefault();
        if (submit.disabled) return;
        closeModal();
        setAuth(true);
        window.scrollTo(0, 0);
      });

      card.resetCard = function () {
        Array.prototype.forEach.call(fields, function (f) {
          f.classList.remove('is-filled', 'is-focused');
          f.querySelector('.reg-field__value').textContent = '';
        });
        var promo = card.querySelector('[data-reg-field="promo"]');
        if (promo) promo.hidden = true;
        if (promoLink) promoLink.hidden = false;
        if (eye) eye.classList.remove('is-on');
        card.reset();
        updateSubmit();
      };
    }

    function showCard(kind) {
      Array.prototype.forEach.call(cards, function (card) {
        card.hidden = card.getAttribute('data-auth') !== kind;
      });
      modal.querySelector('[data-auth="' + kind + '"] .reg-card__close').focus();
    }

    function openModal(kind) {
      lastFocus = document.activeElement;
      modal.hidden = false;
      root.classList.add('modal-open');
      showCard(kind);
    }

    function closeModal() {
      modal.hidden = true;
      root.classList.remove('modal-open');
      Array.prototype.forEach.call(cards, function (card) {
        card.resetCard();
      });
      if (lastFocus) lastFocus.focus();
    }

    Array.prototype.forEach.call(cards, setupCard);

    document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        openModal(btn.getAttribute('data-modal-open'));
      });
    });

    modal.querySelectorAll('[data-auth-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        showCard(tab.getAttribute('data-auth-tab'));
      });
    });

    modal.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  // Coefficients: toggle selection.
  document.querySelectorAll('.coef').forEach(function (coef) {
    coef.addEventListener('click', function () {
      coef.classList.toggle('is-selected');
    });
  });
})();
