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
      if (btn.classList.contains('sb-handle')) btn.setAttribute('aria-label', open ? 'Collapse menu' : 'Expand menu');
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

  // The logo leads to the start screen; search in the collapsed menu opens it.

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
      if (group.closest('.sidebar') && !root.classList.contains('sidebar-open')) {
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

  // Prediction: the category tabs swap the markets in the cards (demo data).
  var prediction = document.querySelector('.prediction');
  if (prediction) {
    var IMG = 'assets/img/';
    // [image, category, markets, title, question, yes %, yes coef, no coef, volume, bets]
    var MARKETS = {
      Top: [
        ['prediction-event.webp', 'Politics', 15, 'Donald Trump offers', 'Donald Trump’s Offer for Greenland<br>(Trillions of Dollars)', 52, '1,92', '1,68', '2.1M $', '78 901'],
        ['thematic-sport.webp', 'Sport', 24, 'Champions League', 'Will Real Madrid win the<br>Champions League 2026?', 38, '2,63', '1,45', '5.4M $', '120 344'],
        ['thematic-casino.webp', 'Crypto', 9, 'Bitcoin price', 'Will Bitcoin close above<br>$150,000 this year?', 61, '1,64', '2,56', '8.9M $', '210 087'],
        ['thematic-prediction.webp', 'Tech', 7, 'AI race', 'Will a new AI model top<br>the leaderboard in June?', 70, '1,43', '3,33', '1.2M $', '45 620']
      ],
      Politics: [
        ['prediction-event.webp', 'Politics', 15, 'Donald Trump offers', 'Donald Trump’s Offer for Greenland<br>(Trillions of Dollars)', 52, '1,92', '1,68', '2.1M $', '78 901'],
        ['prediction-event.webp', 'Politics', 11, 'US Midterms', 'Will Republicans keep<br>the House in 2026?', 57, '1,75', '2,33', '12.4M $', '301 552'],
        ['banner-player.webp', 'Politics', 6, 'UK elections', 'Snap general election<br>before 2027?', 18, '5,55', '1,22', '740K $', '19 210'],
        ['vip-image.webp', 'Politics', 8, 'EU summit', 'Will the EU agree a new<br>budget deal this quarter?', 44, '2,27', '1,79', '980K $', '27 403']
      ],
      Sport: [
        ['thematic-sport.webp', 'Sport', 15, 'F1 Drivers’ Champion', 'George Russell to win the<br>2026 championship?', 52, '1,92', '1,68', '3.3M $', '96 015'],
        ['thematic-sport.webp', 'Sport', 24, 'Champions League', 'Will Real Madrid win the<br>Champions League 2026?', 38, '2,63', '1,45', '5.4M $', '120 344'],
        ['banner-player.webp', 'Sport', 12, 'NBA Finals', 'Will the Celtics reach<br>the NBA Finals?', 46, '2,17', '1,85', '4.1M $', '88 730'],
        ['thematic-sport.webp', 'Sport', 5, 'Wimbledon', 'Will Carlos Alcaraz win<br>Wimbledon 2026?', 41, '2,43', '1,69', '1.7M $', '40 118']
      ],
      Culture: [
        ['vip-image.webp', 'Culture', 10, 'Oscars 2027', 'Will a sci-fi film win<br>Best Picture?', 23, '4,34', '1,30', '620K $', '14 902'],
        ['banner-player.webp', 'Culture', 4, 'Eurovision', 'Will Sweden win<br>Eurovision 2027?', 19, '5,26', '1,23', '410K $', '11 037'],
        ['thematic-casino.webp', 'Culture', 7, 'Box office', 'Will a film pass $2B<br>at the box office this year?', 34, '2,94', '1,51', '890K $', '21 764'],
        ['thematic-prediction.webp', 'Culture', 3, 'Music awards', 'Album of the Year goes<br>to a debut artist?', 27, '3,70', '1,37', '350K $', '9 480']
      ],
      Tech: [
        ['thematic-prediction.webp', 'Tech', 7, 'AI race', 'Will a new AI model top<br>the leaderboard in June?', 70, '1,43', '3,33', '1.2M $', '45 620'],
        ['thematic-casino.webp', 'Tech', 5, 'Smartphones', 'Foldable iPhone announced<br>this year?', 33, '3,03', '1,49', '1.9M $', '52 311'],
        ['vip-image.webp', 'Tech', 9, 'Big Tech', 'Will a company pass<br>a $6T market cap?', 48, '2,08', '1,92', '2.6M $', '63 804'],
        ['banner-player.webp', 'Tech', 4, 'Gaming', 'GTA VI released<br>on schedule?', 64, '1,56', '2,78', '3.1M $', '104 925']
      ],
      Space: [
        ['thematic-prediction.webp', 'Space', 6, 'Starship', 'Starship reaches orbit<br>and lands this year?', 58, '1,72', '2,38', '1.4M $', '37 290'],
        ['vip-image.webp', 'Space', 3, 'Moon landing', 'Crewed Moon landing<br>before 2028?', 29, '3,45', '1,41', '960K $', '22 518'],
        ['thematic-casino.webp', 'Space', 4, 'Mars', 'Uncrewed Mars mission<br>launched in 2026?', 36, '2,78', '1,56', '510K $', '13 604'],
        ['banner-player.webp', 'Space', 2, 'Space tourism', 'More than 50 tourists<br>in space this year?', 42, '2,38', '1,72', '280K $', '7 915']
      ],
      Celebrities: [
        ['banner-player.webp', 'Celebrities', 8, 'Royal news', 'Royal wedding announced<br>this year?', 21, '4,76', '1,27', '430K $', '12 660'],
        ['vip-image.webp', 'Celebrities', 5, 'Tour record', 'Highest-grossing tour<br>record broken in 2026?', 55, '1,82', '2,22', '770K $', '19 043'],
        ['thematic-casino.webp', 'Celebrities', 6, 'Social media', 'First account to reach<br>1B followers?', 31, '3,23', '1,45', '390K $', '10 377'],
        ['thematic-prediction.webp', 'Celebrities', 3, 'Red carpet', 'Met Gala theme revealed<br>before March?', 67, '1,49', '3,03', '150K $', '4 802']
      ],
      Crypto: [
        ['thematic-casino.webp', 'Crypto', 9, 'Bitcoin price', 'Will Bitcoin close above<br>$150,000 this year?', 61, '1,64', '2,56', '8.9M $', '210 087'],
        ['thematic-prediction.webp', 'Crypto', 7, 'Ethereum', 'ETH above $8,000<br>by December?', 35, '2,86', '1,54', '4.6M $', '118 402'],
        ['vip-image.webp', 'Crypto', 5, 'ETF', 'Solana ETF approved<br>this quarter?', 49, '2,04', '1,96', '2.2M $', '59 731'],
        ['banner-player.webp', 'Crypto', 4, 'Stablecoins', 'USDT market cap<br>above $200B?', 72, '1,39', '3,57', '1.5M $', '33 216']
      ],
      Other: [
        ['vip-image.webp', 'Other', 4, 'Weather', 'Hottest year on record<br>in 2026?', 63, '1,59', '2,70', '640K $', '17 588'],
        ['thematic-prediction.webp', 'Other', 3, 'Economy', 'Fed cuts rates<br>at the next meeting?', 54, '1,85', '2,17', '6.3M $', '140 976'],
        ['thematic-casino.webp', 'Other', 2, 'Travel', 'Record number of flights<br>in a single day?', 47, '2,13', '1,89', '220K $', '6 104'],
        ['banner-player.webp', 'Other', 5, 'Science', 'Room-temperature<br>superconductor confirmed?', 8, '12,5', '1,09', '1.1M $', '28 447']
      ]
    };
    var order = Object.keys(MARKETS);
    var polyCards = prediction.querySelectorAll('.polybet');

    var fillCard = function (card, m) {
      var yes = m[5];
      card.querySelector('.polybet__avatar').src = IMG + m[0];
      card.querySelector('.polybet__meta').textContent = m[1] + ' · ' + m[2] + ' markets';
      card.querySelector('.polybet__title').textContent = m[3];
      card.querySelector('.polybet__question').innerHTML = m[4];
      card.querySelector('.polybet-btn--yes span:last-child').textContent = yes + '%';
      card.querySelector('.polybet-btn--no span:last-child').textContent = (100 - yes) + '%';
      var bars = card.querySelectorAll('.progress__indicator');
      bars[0].style.right = (100 - yes) + '%';
      bars[1].style.right = yes + '%';
      var coefs = card.querySelectorAll('.polybet__coef');
      coefs[0].textContent = m[6];
      coefs[1].textContent = m[7];
      card.querySelector('.polybet__stat--volume span:last-child').textContent = m[8];
      card.querySelector('.polybet__stat--bets span:last-child').textContent = m[9];
      card.classList.remove('is-swapping');
      void card.offsetWidth; // restart the fade-in
      card.classList.add('is-swapping');
    };

    prediction.querySelectorAll('.category-tab').forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        var label = tab.textContent.trim();
        // Tabs without their own data ("Section title") cycle through the rest.
        var set = MARKETS[label] || MARKETS[order[i % order.length]];
        Array.prototype.forEach.call(polyCards, function (card, n) {
          fillCard(card, set[n % set.length]);
        });
      });
    });
  }

  // Game hall grids (desktop): show whole rows only; "Load more" adds as many
  // rows as the section starts with (demo tiles are copies of the first ones).
  var DESKTOP = window.matchMedia('(min-width: 1024px)');
  var hallGrids = [];
  document.querySelectorAll('.hall-games').forEach(function (section) {
    var grid = section.querySelector('.hall-games__grid');
    var rows = Number(grid.getAttribute('data-grid-rows')) || 1;
    var base = grid.children.length;
    var state = { grid: grid, rows: rows, pages: 1 };

    state.layout = function () {
      var tiles = grid.children;
      if (!DESKTOP.matches) {
        grid.classList.remove('is-laid-out');
        Array.prototype.forEach.call(tiles, function (t) { t.classList.remove('is-hidden'); });
        return;
      }
      var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      var need = cols * rows * state.pages;
      while (grid.children.length < need) {
        grid.appendChild(grid.children[1 + (grid.children.length % (base - 1))].cloneNode(true));
      }
      Array.prototype.forEach.call(grid.children, function (t, i) {
        t.classList.toggle('is-hidden', i >= need);
      });
      grid.classList.add('is-laid-out');
    };

    section.querySelector('[data-load-more]').addEventListener('click', function () {
      state.pages += 1;
      state.layout();
    });
    hallGrids.push(state);
  });

  if (hallGrids.length) {
    var relayout = function () {
      hallGrids.forEach(function (g) { g.layout(); });
    };
    relayout();
    window.addEventListener('resize', relayout);
    // The menu width changes the number of columns too.
    new MutationObserver(relayout).observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  // Category tabs: the arrow scrolls the row.
  document.querySelectorAll('[data-scroll-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.parentElement.querySelector('.h-scroll').scrollBy({ left: 240, behavior: 'smooth' });
    });
  });

  // Tournament countdowns (demo: all run from the same time).
  var countdowns = document.querySelectorAll('[data-countdown]');
  if (countdowns.length) {
    var left = 8 * 3600 + 7 * 60 + 41;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    setInterval(function () {
      left = left > 0 ? left - 1 : 8 * 3600;
      var parts = [Math.floor(left / 86400), Math.floor(left / 3600) % 24, Math.floor(left / 60) % 60, left % 60];
      Array.prototype.forEach.call(countdowns, function (cd) {
        Array.prototype.forEach.call(cd.querySelectorAll('.countdown__num'), function (el, i) {
          el.textContent = pad(parts[i]);
        });
      });
    }, 1000);
  }

  var money = function (n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' $';
  };

  // Betting pages: one pick at a time. Desktop fills the betslip in the
  // right column, mobile opens the stake form under the tapped row.
  var betButtons = document.querySelectorAll('[data-bet]');
  if (betButtons.length) {
    var slip = document.querySelector('[data-betslip]');
    var inline = document.querySelector('[data-inline-bet]');
    var amounts = document.querySelectorAll('[data-bet-amount]');
    var picked = null;
    var BALANCE = 1200;
    var setText = function (sel, text) {
      document.querySelectorAll(sel).forEach(function (el) { el.textContent = text; });
    };
    var recalc = function () {
      var amount = parseFloat(amounts[0].value) || 0;
      var coef = picked ? parseFloat(picked.getAttribute('data-coef')) : 0;
      setText('[data-bet-win]', money(amount * coef));
    };
    var pick = function (btn, openInline) {
      if (picked) picked.classList.remove('is-selected');
      picked = btn;
      if (slip) {
        slip.querySelector('[data-betslip-empty]').hidden = !!btn;
        slip.querySelector('[data-betslip-body]').hidden = !btn;
      }
      if (!btn) {
        if (inline) inline.hidden = true;
        return;
      }
      btn.classList.add('is-selected');
      setText('[data-bet-event]', btn.getAttribute('data-bet-event-text'));
      setText('[data-bet-market]', btn.getAttribute('data-bet-market-text'));
      setText('[data-bet-outcome]', btn.getAttribute('data-bet-outcome-text'));
      setText('[data-bet-coef]', btn.getAttribute('data-coef'));
      setText('[data-bet-total]', btn.getAttribute('data-coef'));
      if (inline && openInline) {
        var row = btn.closest('.market__row, .ev-row');
        row.parentNode.insertBefore(inline, row.nextSibling);
        inline.hidden = false;
      }
      recalc();
    };

    betButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn === picked) pick(null);
        else pick(btn, !DESKTOP.matches);
      });
    });
    amounts.forEach(function (input) {
      input.addEventListener('input', function () {
        amounts.forEach(function (other) { if (other !== input) other.value = input.value; });
        recalc();
      });
    });
    document.querySelectorAll('[data-bet-max]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        amounts.forEach(function (input) { input.value = BALANCE; });
        recalc();
      });
    });
    document.querySelectorAll('[data-bet-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () { pick(null); });
    });
    document.querySelectorAll('[data-bet-place]').forEach(function (btn) {
      var label = btn.textContent;
      btn.addEventListener('click', function () {
        if (!picked) return;
        btn.textContent = 'Bet placed';
        btn.classList.add('is-done');
        setTimeout(function () {
          btn.textContent = label;
          btn.classList.remove('is-done');
          pick(null);
        }, 1400);
      });
    });
    // On desktop the betslip starts with the first outcome, as in Figma.
    if (DESKTOP.matches) pick(betButtons[0], false);
    else pick(null);
  }

  // Prediction hall: the category tabs filter the markets ("Top" shows all).
  var marketFilter = document.querySelector('[data-market-filter]');
  if (marketFilter) {
    var markets = document.querySelectorAll('[data-market-cat]');
    marketFilter.addEventListener('click', function (event) {
      var tab = event.target.closest('.hall-tab');
      if (!tab) return;
      var cat = tab.textContent.trim();
      var any = Array.prototype.some.call(markets, function (m) { return m.getAttribute('data-market-cat') === cat; });
      markets.forEach(function (m) {
        m.hidden = cat !== 'Top' && any && m.getAttribute('data-market-cat') !== cat;
        m.classList.remove('is-swapping');
        void m.offsetWidth;
        m.classList.add('is-swapping');
      });
    });
  }

  // Welcome bonus widget: close / decline hide it.
  document.querySelectorAll('[data-bonus-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.closest('[data-bonus-card]').hidden = true;
    });
  });

  // Sport betslip: an express of the picked outcomes (one per event). The
  // total odds multiply, the stake and quick amounts give the potential win.
  var sslip = document.querySelector('[data-sslip]');
  if (sslip) {
    var picksEl = sslip.querySelector('[data-sslip-picks]');
    var emptyEl = sslip.querySelector('[data-sslip-empty]');
    var totalEl = sslip.querySelector('[data-sslip-total]');
    var bonusEl = sslip.querySelector('[data-sslip-bonus]');
    var amountEl = sslip.querySelector('[data-sslip-amount]');
    var placeEl = sslip.querySelector('[data-sslip-place]');
    var side = sslip.closest('.hall-side');
    var fab = document.querySelector('[data-sslip-fab]');
    var picks = [];
    var SPORT_BALANCE = 1200;
    var esc = function (t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

    var renderSlip = function () {
      document.querySelectorAll('[data-sbet]').forEach(function (b) {
        b.classList.toggle('is-selected', picks.some(function (p) { return p.btn === b; }));
      });
      picksEl.innerHTML = picks.map(function (p, i) {
        return '<div class="betslip__pick"><div class="betslip__event">' + (p.live ? '<span class="betslip__event-icon"><img src="assets/img/bs-live.svg" alt=""></span>' : '') +
          '<span class="betslip__event-icon"><img src="assets/img/bet-market.svg" alt=""></span><p>' + esc(p.event) + '</p></div>' +
          '<p class="betslip__market">' + esc(p.market) + '</p><div class="betslip__outcome"><span>' + esc(p.outcome) + '</span><span>' + p.coef.toFixed(2) + '</span></div>' +
          '<button class="betslip__remove" type="button" aria-label="Remove" data-sslip-remove="' + i + '"><img src="assets/img/bet-close.svg" alt=""></button></div>';
      }).join('');
      emptyEl.hidden = picks.length > 0;
      var total = picks.reduce(function (t, p) { return t * p.coef; }, 1);
      totalEl.textContent = picks.length ? total.toFixed(2) : '—';
      bonusEl.textContent = picks.length >= 2 ? 'Express bonus +5% added' : 'Add ' + (2 - picks.length) + ' outcome' + (picks.length === 1 ? '' : 's') + ', get a bonus';
      placeEl.disabled = !picks.length || !(parseFloat(amountEl.value) > 0);
      var amount = parseFloat(amountEl.value) || 0;
      placeEl.textContent = picks.length && amount ? 'Place a bet · ' + money(amount * total) : 'Place a bet';
      if (fab) {
        fab.hidden = DESKTOP.matches || !picks.length;
        fab.querySelector('[data-sslip-count]').textContent = picks.length;
        fab.querySelector('[data-sslip-fab-total]').textContent = picks.length ? total.toFixed(2) : '';
      }
      if (!picks.length && side) side.classList.remove('is-open');
    };

    document.querySelectorAll('[data-sbet]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var event = btn.getAttribute('data-event');
        var existing = picks.findIndex(function (p) { return p.event === event; });
        var same = existing >= 0 && picks[existing].btn === btn;
        if (existing >= 0) picks.splice(existing, 1);
        if (!same) {
          picks.push({
            btn: btn, event: event, market: btn.getAttribute('data-market'), outcome: btn.getAttribute('data-outcome'),
            coef: parseFloat(btn.getAttribute('data-coef')), live: btn.hasAttribute('data-live')
          });
        }
        renderSlip();
      });
    });
    picksEl.addEventListener('click', function (event) {
      var rm = event.target.closest('[data-sslip-remove]');
      if (!rm) return;
      picks.splice(Number(rm.getAttribute('data-sslip-remove')), 1);
      renderSlip();
    });
    amountEl.addEventListener('input', renderSlip);
    sslip.querySelectorAll('[data-sbet-quick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = btn.getAttribute('data-sbet-quick');
        amountEl.value = v === 'max' ? SPORT_BALANCE : v;
        renderSlip();
      });
    });
    sslip.querySelector('[data-sslip-clear]').addEventListener('click', function () {
      picks = [];
      renderSlip();
    });
    placeEl.addEventListener('click', function () {
      placeEl.textContent = 'Bet placed';
      placeEl.classList.add('is-done');
      setTimeout(function () {
        placeEl.classList.remove('is-done');
        picks = [];
        renderSlip();
      }, 1400);
    });
    if (fab) {
      fab.addEventListener('click', function () { side.classList.toggle('is-open'); });
      document.addEventListener('click', function (event) {
        if (side.classList.contains('is-open') && !side.contains(event.target) && !fab.contains(event.target) &&
            !event.target.closest('[data-sbet]')) side.classList.remove('is-open');
      });
    }
    DESKTOP.addEventListener('change', renderSlip);

    // Start with two picks, as in Figma.
    var initial = document.querySelectorAll('.leagues [data-sbet]');
    if (DESKTOP.matches && initial.length > 4) {
      initial[0].click();
      initial[4].click();
    } else {
      renderSlip();
    }
  }

  // Toggles, collapsible leagues / countries / express cards.
  document.querySelectorAll('[data-toggle]').forEach(function (t) {
    t.addEventListener('click', function () {
      t.setAttribute('aria-checked', String(t.getAttribute('aria-checked') !== 'true'));
    });
  });
  document.querySelectorAll('[data-league]').forEach(function (league) {
    league.querySelector('.league__toggle').addEventListener('click', function () {
      league.classList.toggle('is-open');
    });
  });
  document.querySelectorAll('[data-country]').forEach(function (country) {
    country.querySelector('.scountry__head').addEventListener('click', function () {
      country.classList.toggle('is-open');
    });
  });

  // Express of the day (mobile): stake, quick amounts, bonus and potential win.
  document.querySelectorAll('[data-express]').forEach(function (card) {
    var total = parseFloat(card.getAttribute('data-total'));
    var input = card.querySelector('[data-x-amount]');
    var update = function () {
      var amount = parseFloat(input.value) || 0;
      card.querySelector('[data-x-bonus]').textContent = money(amount * total * 0.15 / 10);
      card.querySelector('[data-x-win]').textContent = money(amount * total);
    };
    card.querySelector('.express__head').addEventListener('click', function () { card.classList.toggle('is-open'); });
    input.addEventListener('input', update);
    card.querySelectorAll('[data-x-quick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = btn.getAttribute('data-x-quick');
        input.value = v === 'Max' ? 1200 : v;
        update();
      });
    });
    var place = card.querySelector('[data-x-place]');
    place.addEventListener('click', function () {
      place.textContent = 'Bet placed';
      place.classList.add('is-done');
      setTimeout(function () { place.textContent = 'Place a bet'; place.classList.remove('is-done'); }, 1400);
    });
    update();
  });

  // "Load more" on the sport page: repeat the cards of the block above.
  document.querySelectorAll('[data-sport-more]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var list = btn.previousElementSibling;
      Array.prototype.slice.call(list.children, 0, 2).forEach(function (card) {
        list.appendChild(card.cloneNode(true));
      });
    });
  });

  // Wallet: currency dropdown under the balance, Wallet, Balance Settings and
  // Display Crypto in Fiat (demo data). The eye hides every amount; the
  // choices are kept in localStorage.
  var wdrop = document.querySelector('[data-wdrop]');
  if (wdrop) {
    var IMGP = 'assets/img/';
    var CURRENCIES = [
      { code: 'USDT', name: 'Tether', amount: 1200, usd: 1, icon: 'currency-t.webp' },
      { code: 'USDC', name: 'USD Coin', amount: 50, usd: 1, icon: 'currency-usd.webp' },
      { code: 'ETH', name: 'Ethereum', amount: 0, usd: 3200, icon: 'currency-eth.svg' },
      { code: 'BTC', name: 'Bitcoin', amount: 0, usd: 65000, icon: 'currency-e.webp' },
      { code: 'LTC', name: 'Litecoin', amount: 0, usd: 80, icon: 'currency-usd.webp' }
    ];
    // ?balance=0 opens the prototype with an empty wallet (first deposit scenario)
    if (/[?&]balance=0(&|$)/.test(location.search)) CURRENCIES.forEach(function (c) { c.amount = 0; });
    var FIATS = [
      { code: 'USD', name: 'US Dollar', sym: '$', rate: 1 },
      { code: 'AED', name: 'UAE Dirham', sym: 'AED ', rate: 3.67 },
      { code: 'CNY', name: 'Chinese Yuan', sym: '¥', rate: 7.1 },
      { code: 'TRY', name: 'Turkish Lira', sym: '₺', rate: 32.5 }
    ];
    var HIDDEN = '******';
    var wstate = { hidden: false, hideZero: false, fiat: null, recent: ['AED', 'CNY'], current: 'USDT' };
    try { Object.assign(wstate, JSON.parse(localStorage.getItem('wallet-state') || '{}')); } catch (e) {}
    var saveW = function () {
      try { localStorage.setItem('wallet-state', JSON.stringify(wstate)); } catch (e) {}
    };
    var fiatOf = function (code) { return FIATS.filter(function (f) { return f.code === code; })[0]; };
    var fiatText = function (c, fiat, sep) {
      var v = c.amount * c.usd * fiat.rate;
      var t = v.toFixed(2);
      if (sep) t = t.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return fiat.sym + t;
    };
    var cryptoText = function (c) { return c.amount.toFixed(6); };
    var wEsc = function (t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); };
    var matches = function (item, q) {
      return !q || item.code.toLowerCase().indexOf(q) >= 0 || item.name.toLowerCase().indexOf(q) >= 0;
    };
    var visibleCurrencies = function (q) {
      return CURRENCIES.filter(function (c) {
        return (!wstate.hideZero || c.amount > 0 || c.code === wstate.current) && matches(c, q);
      });
    };
    var row = function (c, main, sub, tag, active) {
      var t = tag || 'div';
      return '<' + t + ' class="wrow' + (active ? ' is-active' : '') + '"' + (t === 'button' ? ' type="button" data-wcur="' + c.code + '"' : '') + '>' +
        '<span class="wrow__icon"><img src="' + IMGP + c.icon + '" alt=""></span>' +
        '<span class="wrow__name"><span class="wrow__code">' + c.code + '</span><span class="wrow__full">' + wEsc(c.name) + '</span></span>' +
        '<span class="wrow__value"><span class="wrow__main">' + main + '</span>' + (sub ? '<span class="wrow__sub">' + sub + '</span>' : '') + '</span></' + t + '>';
    };

    var dropSearch = wdrop.querySelector('[data-wdrop-search]');
    var fiatSearch = document.querySelector('[data-wfiat-search]');

    var renderWallet = function () {
      root.classList.toggle('is-balance-hidden', wstate.hidden);
      document.querySelectorAll('[data-balance-eye]').forEach(function (b) {
        b.setAttribute('aria-label', wstate.hidden ? 'Show balance' : 'Hide balance');
        b.setAttribute('aria-pressed', String(wstate.hidden));
      });
      var fiat = fiatOf(wstate.fiat);
      var cur = CURRENCIES.filter(function (c) { return c.code === wstate.current; })[0] || CURRENCIES[0];

      // Header
      document.querySelectorAll('[data-balance-sum]').forEach(function (el) {
        el.textContent = wstate.hidden ? HIDDEN : fiat ? fiatText(cur, fiat) : cryptoText(cur);
      });
      document.querySelectorAll('.balance__currency img').forEach(function (im) {
        im.src = IMGP + cur.icon;
        im.alt = cur.code;
      });
      document.querySelectorAll('[data-balance-code]').forEach(function (el) { el.textContent = cur.code; });

      // Profile: amounts follow the display fiat and the hidden balance
      var pf = fiat || FIATS[0];
      document.querySelectorAll('[data-pf-usd]').forEach(function (el) {
        el.textContent = wstate.hidden ? HIDDEN : fiatText({ amount: +el.getAttribute('data-pf-usd'), usd: 1 }, pf, true);
      });
      document.querySelectorAll('[data-pf-crypto]').forEach(function (el) {
        el.textContent = wstate.hidden ? HIDDEN : (+el.getAttribute('data-pf-crypto')).toFixed(6);
      });
      document.querySelectorAll('[data-pf-fiat]').forEach(function (el) { el.textContent = pf.code; });

      // Dropdown
      var q = dropSearch.value.trim().toLowerCase();
      var list = visibleCurrencies(q);
      wdrop.querySelector('[data-wdrop-list]').innerHTML = list.map(function (c) {
        var main = wstate.hidden ? HIDDEN : fiat ? fiatText(c, fiat) : cryptoText(c);
        var sub = fiat && !wstate.hidden ? cryptoText(c) : '';
        return row(c, main, sub, 'button', c.code === cur.code);
      }).join('');
      wdrop.querySelector('[data-w-empty]').hidden = list.length > 0;
      dropSearch.closest('.wsearch').classList.toggle('is-typing', !!q);

      // Wallet modal: values in the chosen fiat (USD when "None")
      var wf = fiat || FIATS[0];
      var total = CURRENCIES.reduce(function (t, c) { return t + c.amount * c.usd; }, 0);
      document.querySelector('[data-wallet-total]').textContent = wstate.hidden ? wf.sym.trim() + HIDDEN :
        fiatText({ amount: total, usd: 1 }, wf, true);
      document.querySelector('[data-wallet-fiat]').textContent = wf.code;
      document.querySelector('[data-wallet-list]').innerHTML = visibleCurrencies('').map(function (c) {
        return row(c, wstate.hidden ? HIDDEN : fiatText(c, wf), wstate.hidden ? HIDDEN : cryptoText(c));
      }).join('');

      // Settings
      document.querySelector('[data-whide-zero]').checked = wstate.hideZero;

      // Fiat list
      var fq = fiatSearch.value.trim().toLowerCase();
      var fiats = [{ code: 'None', name: 'Show balances in crypto', none: true }].concat(FIATS).filter(function (f) { return matches(f, fq); });
      document.querySelector('[data-wfiat-list]').innerHTML = fiats.map(function (f) {
        var selected = f.none ? !wstate.fiat : wstate.fiat === f.code;
        return '<button class="wrow' + (selected ? ' is-active' : '') + '" type="button" data-wfiat="' + (f.none ? '' : f.code) + '">' +
          '<span class="wrow__icon"><img src="' + IMGP + 'currency-usd.webp" alt=""></span>' +
          '<span class="wrow__name"><span class="wrow__code">' + f.code + '</span>' + (f.none ? '' : '<span class="wrow__full">' + f.name + '</span>') + '</span>' +
          (selected ? '<img class="wrow__check" src="' + IMGP + 'wl-check.svg" alt="Selected">' : '') + '</button>';
      }).join('');
      var fiatModal = document.querySelector('[data-wmodal="fiat"]');
      fiatModal.querySelector('[data-w-empty]').hidden = fiats.length > 0;
      fiatSearch.closest('.wsearch').classList.toggle('is-typing', !!fq);
      var recent = document.querySelector('[data-wrecent]');
      recent.innerHTML = wstate.recent.map(function (c) { return '<button class="wchip" type="button" data-wfiat="' + c + '">' + c + '</button>'; }).join('');
      document.querySelector('[data-wrecent-block]').hidden = !wstate.recent.length || !!fq;
    };

    var balanceBox = document.querySelector('[data-balance-box]');
    var dropToggle = document.querySelector('[data-balance-toggle]');
    var setDrop = function (open) {
      wdrop.hidden = !open;
      balanceBox.classList.toggle('is-open', open);
      dropToggle.setAttribute('aria-expanded', String(open));
      if (!open) {
        dropSearch.value = '';
        renderWallet();
      }
    };
    var wmodal = function (name) { return document.querySelector('[data-wmodal="' + name + '"]'); };
    var anyModalOpen = function () {
      return Array.prototype.some.call(document.querySelectorAll('[data-wmodal]'), function (m) { return !m.hidden; });
    };
    var openW = function (name) {
      setDrop(false);
      wmodal(name).hidden = false;
      root.classList.add('modal-open');
      var close = wmodal(name).querySelector('.wmodal__close');
      if (close) close.focus();
    };
    var closeW = function (name) {
      wmodal(name).hidden = true;
      if (name === 'fiat') {
        fiatSearch.value = '';
        renderWallet();
      }
      if (name === 'coin' || name === 'provider') wmodal('wallet').hidden = false;
      if (name === 'wdpick') wmodal('withdraw').hidden = false;
      if (name === 'withdraw') clearTimeout(wd.timer);
      if (name === 'deppick') wmodal('deposit').hidden = false;
      if (name === 'deposit') clearTimeout(dep.timer);
      if (!anyModalOpen()) root.classList.remove('modal-open');
    };

    dropToggle.addEventListener('click', function () { setDrop(wdrop.hidden); });
    document.addEventListener('click', function (event) {
      if (!wdrop.hidden && !wdrop.contains(event.target) && !balanceBox.contains(event.target)) setDrop(false);
    });
    document.querySelectorAll('[data-balance-eye]').forEach(function (b) {
      b.addEventListener('click', function () {
        wstate.hidden = !wstate.hidden;
        saveW();
        renderWallet();
      });
    });
    wdrop.addEventListener('click', function (event) {
      var r = event.target.closest('[data-wcur]');
      if (!r) return;
      wstate.current = r.getAttribute('data-wcur');
      saveW();
      setDrop(false);
    });
    dropSearch.addEventListener('input', renderWallet);
    fiatSearch.addEventListener('input', renderWallet);

    document.querySelectorAll('[data-wallet-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        setWStep('wallet');
        openW('wallet');
      });
    });
    document.querySelectorAll('[data-wsettings-open]').forEach(function (b) {
      b.addEventListener('click', function () { openW('settings'); });
    });
    document.querySelectorAll('[data-wfiat-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!wmodal('settings').hidden) closeW('settings');
        openW('fiat');
      });
    });
    document.querySelectorAll('[data-wmodal]').forEach(function (m) {
      m.querySelectorAll('[data-wmodal-close]').forEach(function (b) {
        b.addEventListener('click', function () { closeW(m.getAttribute('data-wmodal')); });
      });
    });
    document.querySelector('[data-whide-zero]').addEventListener('change', function (event) {
      wstate.hideZero = event.target.checked;
      saveW();
      renderWallet();
    });
    wmodal('fiat').addEventListener('click', function (event) {
      var f = event.target.closest('[data-wfiat]');
      if (!f) return;
      var code = f.getAttribute('data-wfiat') || null;
      wstate.fiat = code;
      if (code) {
        wstate.recent = [code].concat(wstate.recent.filter(function (c) { return c !== code; })).slice(0, 5);
      }
      saveW();
      closeW('fiat');
    });
    // Wallet modal steps: Wallet, Buy Crypto (form, Swapped.com provider,
    // completed) and Swap (form, confirmation, completed). A tab opens the
    // first step of its flow; balances change for the current visit only.
    var wcard = wmodal('wallet');
    var STEPS = {
      wallet: { tab: 'wallet', title: 'Wallet' },
      buy: { tab: 'buy', title: 'Buy Crypto' },
      'buy-provider': { tab: 'buy', title: 'Buy Crypto' },
      'buy-done': { tab: 'buy', title: 'Buy Crypto' },
      swap: { tab: 'swap', title: 'Swap' },
      'swap-confirm': { tab: 'swap', title: 'Confirm Swap' },
      'swap-done': { tab: 'swap', title: 'Completed!' }
    };
    var BUY_MIN_USD = 7;
    var SWAP_FEE_USD = 0.25;
    // Deposits that still have to be wagered (demo: part of the USDC balance)
    var WAGER = { USDC: { total: 50, left: 10 } };
    var byCode = function (code) { return CURRENCIES.filter(function (c) { return c.code === code; })[0]; };
    var num = function (v) {
      var n = parseFloat(String(v).replace(',', '.'));
      return isFinite(n) && n > 0 ? n : 0;
    };
    var fix = function (n, d) { return n ? n.toFixed(d) : ''; };
    var usdText = function (v) { return '$' + v.toFixed(2); };
    var rateText = function (from, to) {
      var r = from.usd / to.usd;
      return '1 ' + from.code + ' ≈ ' + (r >= 1 ? r.toFixed(2) : r.toFixed(6)) + ' ' + to.code;
    };
    var fieldRow = function (c, arrow) {
      var main = wstate.hidden ? HIDDEN : usdText(c.amount * c.usd);
      var sub = wstate.hidden ? HIDDEN : cryptoText(c);
      return row(c, main, sub).replace(/^<div class="wrow">|<\/div>$/g, '') +
        (arrow ? '<img class="wrow__arrow" src="' + IMGP + 'ws-arrow.svg" alt="">' : '');
    };
    var q = function (sel) { return wcard.querySelector(sel); };
    var credit = function (c, amount) {
      c.amount += amount;
      var w = WAGER[c.code] || (WAGER[c.code] = { total: 0, left: 0 });
      w.total += amount;
      w.left += amount;
    };

    // Select coin: From / To and the Buy Crypto currencies are picked in a
    // separate window (bottom sheet on mobile) over the Wallet modal, with
    // search and recently used currencies.
    var coinModal = wmodal('coin');
    var coinSearch = coinModal.querySelector('[data-coin-search]');
    var coinFor = null;
    if (!wstate.recentCoins) wstate.recentCoins = ['USDT', 'USDC'];
    var coinItems = function () {
      if (coinFor === 'buy-fiat') return FIATS;
      var other = coinFor === 'swap-from' ? swap.to : coinFor === 'swap-to' ? swap.from : null;
      return CURRENCIES.filter(function (c) { return c.code !== other; });
    };
    var coinCurrent = function () {
      return coinFor === 'swap-from' ? swap.from : coinFor === 'swap-to' ? swap.to : coinFor === 'buy-fiat' ? buy.fiat : buy.crypto;
    };
    var renderCoins = function () {
      var fiat = coinFor === 'buy-fiat';
      var cq = coinSearch.value.trim().toLowerCase();
      var items = coinItems();
      var list = items.filter(function (c) { return matches(c, cq); });
      coinModal.querySelector('[data-coin-list]').innerHTML = list.map(function (c) {
        if (fiat) {
          return '<button class="wrow' + (c.code === buy.fiat ? ' is-active' : '') + '" type="button" data-coin-item="' + c.code + '">' +
            '<span class="wrow__icon"><img src="' + IMGP + 'currency-usd.webp" alt=""></span>' +
            '<span class="wrow__name"><span class="wrow__code">' + c.code + '</span><span class="wrow__full">' + wEsc(c.name) + '</span></span></button>';
        }
        var main = wstate.hidden ? HIDDEN : usdText(c.amount * c.usd);
        return row(c, main, wstate.hidden ? HIDDEN : cryptoText(c), 'button', c.code === coinCurrent())
          .replace('data-wcur=', 'data-coin-item=');
      }).join('');
      coinModal.querySelector('[data-coin-empty]').hidden = list.length > 0;
      coinSearch.closest('.wsearch').classList.toggle('is-typing', !!cq);
      var codes = items.map(function (c) { return c.code; });
      var recent = fiat ? wstate.recent : wstate.recentCoins;
      recent = recent.filter(function (c) { return codes.indexOf(c) >= 0; });
      coinModal.querySelector('[data-coin-recent]').innerHTML = recent.map(function (c) {
        return '<button class="wchip" type="button" data-coin-item="' + c + '">' + c + '</button>';
      }).join('');
      coinModal.querySelector('[data-coin-recent-block]').hidden = !recent.length || !!cq;
      coinModal.querySelector('[data-coin-sub]').textContent = fiat ? 'Fiat currency' : 'Currencies';
    };
    var openCoin = function (name) {
      coinFor = name;
      coinSearch.value = '';
      coinModal.querySelector('[data-coin-title]').textContent = q('[data-wallet-title]').textContent;
      renderCoins();
      wcard.hidden = true;
      openW('coin');
    };
    wcard.querySelectorAll('[data-wpick]').forEach(function (t) {
      t.addEventListener('click', function (event) {
        event.preventDefault();
        openCoin(t.getAttribute('data-wpick'));
      });
    });
    coinSearch.addEventListener('input', renderCoins);
    coinModal.addEventListener('click', function (event) {
      var item = event.target.closest('[data-coin-item]');
      if (!item) return;
      var code = item.getAttribute('data-coin-item');
      if (coinFor === 'swap-from') swap.from = code;
      else if (coinFor === 'swap-to') swap.to = code;
      else if (coinFor === 'buy-crypto') buy.crypto = code;
      else buy.fiat = code;
      if (coinFor === 'buy-fiat') {
        wstate.recent = [code].concat(wstate.recent.filter(function (c) { return c !== code; })).slice(0, 5);
      } else {
        wstate.recentCoins = [code].concat(wstate.recentCoins.filter(function (c) { return c !== code; })).slice(0, 5);
      }
      saveW();
      if (coinFor.indexOf('swap') === 0) { syncSwap('from'); renderSwap(); }
      else { syncBuy('crypto'); renderBuy(); }
      closeW('coin');
    });

    // Provider (Buy Crypto): the row above the amounts opens the list of
    // providers with the amount each one gives (demo fees).
    var PROVIDERS = [
      { name: 'Paybis', fee: 0.012, logo: 'pv-paybis.webp' },
      { name: 'Banxa', fee: 0.015, logo: 'pv-banxa.webp' },
      { name: 'Swapped.com', fee: 0, logo: 'pv-swapped.webp' },
      { name: 'Binance Connect', fee: 0.008, logo: 'pv-binance.svg' },
      { name: 'Ramp Network', fee: 0.01, logo: 'pv-ramp.webp' }
    ];
    var provModal = wmodal('provider');
    var provOf = function (name) { return PROVIDERS.filter(function (pr) { return pr.name === name; })[0]; };
    var renderProviders = function () {
      var code = buy.crypto;
      provModal.querySelector('[data-prov-list]').innerHTML = PROVIDERS.map(function (pr) {
        var get = buy.amount * (1 - pr.fee);
        return '<button class="wrow' + (pr.name === buy.provider ? ' is-active' : '') + '" type="button" data-prov-item="' + pr.name + '">' +
          '<span class="wrow__icon wrow__icon--logo"><img src="' + IMGP + pr.logo + '" alt=""></span>' +
          '<span class="wrow__name"><span class="wrow__code">' + pr.name + '</span><span class="wrow__full">' +
          get.toFixed(6) + ' ' + code + (pr.fee ? ' (-' + (buy.amount * pr.fee).toFixed(3) + ')' : '') + '</span></span></button>';
      }).join('');
    };
    q('[data-prov-open]').addEventListener('click', function () {
      renderProviders();
      wcard.hidden = true;
      openW('provider');
    });
    provModal.addEventListener('click', function (event) {
      var item = event.target.closest('[data-prov-item]');
      if (!item) return;
      buy.provider = item.getAttribute('data-prov-item');
      q('[data-prov-name]').textContent = buy.provider;
      q('[data-prov-logo]').src = IMGP + provOf(buy.provider).logo;
      closeW('provider');
    });

    // Swap
    var swap = { from: 'USDT', to: 'ETH', amount: 16, hash: '' };
    var swapFrom = q('[data-swap-from]');
    var swapTo = q('[data-swap-to]');
    var swapFee = function (from) { return SWAP_FEE_USD / from.usd; };
    var syncSwap = function (side) {
      var from = byCode(swap.from), to = byCode(swap.to);
      if (side === 'to') swap.amount = num(swapTo.value) * to.usd / from.usd;
      else if (side === 'from') swap.amount = num(swapFrom.value);
      if (side !== 'from') swapFrom.value = fix(swap.amount, 6);
      if (side !== 'to') swapTo.value = fix(swap.amount * from.usd / to.usd, 6);
    };
    var renderSwap = function () {
      var from = byCode(swap.from), to = byCode(swap.to);
      q('[data-wpick="swap-from"]').innerHTML = fieldRow(from, true);
      q('[data-wpick="swap-to"]').innerHTML = fieldRow(to, true);
      q('[data-swap-rate]').textContent = rateText(from, to);
      var w = WAGER[from.code];
      var wagering = !!(w && w.left > 0);
      q('[data-swap-from-field]').hidden = wagering;
      q('[data-swap-wager]').hidden = !wagering;
      if (wagering) {
        var pct = Math.round((1 - w.left / w.total) * 100);
        q('[data-wager-pct]').textContent = pct + '%';
        q('[data-wager-bar]').style.width = pct + '%';
        q('[data-wager-left]').textContent = w.left.toFixed(2) + ' ' + from.code;
      }
      var total = swap.amount + swapFee(from);
      q('[data-swap-submit]').disabled = wagering || !swap.amount || total > from.amount + 1e-9;
    };
    swapFrom.addEventListener('input', function () { syncSwap('from'); renderSwap(); });
    swapTo.addEventListener('input', function () { syncSwap('to'); renderSwap(); });
    q('[data-swap-max]').addEventListener('click', function (event) {
      event.preventDefault();
      var from = byCode(swap.from);
      swap.amount = Math.max(0, from.amount - swapFee(from));
      syncSwap();
      renderSwap();
    });
    q('[data-swap-flip]').addEventListener('click', function () {
      var t = swap.from;
      swap.from = swap.to;
      swap.to = t;
      syncSwap('from');
      renderSwap();
    });
    q('[data-swap-refresh]').addEventListener('click', function (event) {
      var b = event.currentTarget;
      b.classList.remove('is-spinning');
      void b.offsetWidth;
      b.classList.add('is-spinning');
    });
    q('[data-swap-submit]').addEventListener('click', function () {
      var from = byCode(swap.from), to = byCode(swap.to);
      var fee = swapFee(from);
      var get = swap.amount * from.usd / to.usd;
      q('[data-confirm-from]').innerHTML = fieldRow({ code: from.code, name: from.name, icon: from.icon, amount: swap.amount, usd: from.usd });
      q('[data-confirm-to]').innerHTML = fieldRow({ code: to.code, name: to.name, icon: to.icon, amount: get, usd: to.usd });
      q('[data-confirm-fee]').textContent = fee.toFixed(6) + ' ' + from.code;
      q('[data-confirm-total]').textContent = (swap.amount + fee).toFixed(6) + ' ' + from.code;
      q('[data-confirm-rate]').textContent = rateText(from, to);
      setWStep('swap-confirm');
    });
    q('[data-swap-confirm]').addEventListener('click', function () {
      var from = byCode(swap.from), to = byCode(swap.to);
      var total = swap.amount + swapFee(from);
      from.amount = Math.max(0, from.amount - total);
      credit(to, swap.amount * from.usd / to.usd);
      var hex = '';
      for (var i = 0; i < 64; i++) hex += '0123456789abcdef'[Math.floor(Math.random() * 16)];
      swap.hash = '0x' + hex;
      q('[data-swap-done-sum]').textContent = total.toFixed(6) + ' ' + from.code;
      q('[data-swap-hash-text]').textContent = swap.hash.slice(0, 4) + '...' + swap.hash.slice(-4);
      renderWallet();
      setWStep('swap-done');
    });
    q('[data-swap-hash]').addEventListener('click', function (event) {
      var b = event.currentTarget;
      var done = function () {
        b.querySelector('span').textContent = 'Copied';
        setTimeout(function () { b.querySelector('span').textContent = swap.hash.slice(0, 4) + '...' + swap.hash.slice(-4); }, 1200);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(swap.hash).then(done, done);
      else done();
    });

    // Buy Crypto
    var buy = { crypto: 'USDT', fiat: 'USD', amount: 0, provider: 'Swapped.com' };
    var buyCrypto = q('[data-buy-crypto]');
    var buyFiat = q('[data-buy-fiat]');
    var provCrypto = q('[data-prov-crypto]');
    var provFiat = q('[data-prov-fiat]');
    var buyPrice = function () { return byCode(buy.crypto).usd * fiatOf(buy.fiat).rate; };
    var syncBuy = function (side, src) {
      var price = buyPrice();
      if (side === 'fiat') buy.amount = num(src ? src.value : buyFiat.value) / price;
      else if (side === 'crypto') buy.amount = num(src ? src.value : buyCrypto.value);
      [[buyCrypto, 'crypto'], [provCrypto, 'crypto'], [buyFiat, 'fiat'], [provFiat, 'fiat']].forEach(function (f) {
        if (f[0] === src) return;
        f[0].value = f[1] === 'crypto' ? fix(buy.amount, 6) : fix(buy.amount * price, 2);
      });
    };
    var buyTooLow = function () {
      var usd = buy.amount * byCode(buy.crypto).usd;
      return usd > 0 && usd < BUY_MIN_USD;
    };
    var renderBuy = function () {
      var c = byCode(buy.crypto), f = fiatOf(buy.fiat);
      wcard.querySelectorAll('[data-buy-crypto-code]').forEach(function (el) { el.textContent = c.code; });
      wcard.querySelectorAll('[data-buy-crypto-icon]').forEach(function (el) { el.src = IMGP + c.icon; });
      wcard.querySelectorAll('[data-buy-fiat-code]').forEach(function (el) { el.textContent = f.code; });
      q('[data-buy-min-text]').textContent = f.sym + (BUY_MIN_USD * f.rate).toFixed(2);
      q('[data-buy-min]').hidden = !buyTooLow();
      q('[data-prov-submit]').disabled = !buy.amount || buyTooLow();
    };
    [[buyCrypto, 'crypto'], [buyFiat, 'fiat'], [provCrypto, 'crypto'], [provFiat, 'fiat']].forEach(function (f) {
      f[0].addEventListener('input', function () { syncBuy(f[1], f[0]); renderBuy(); });
    });
    q('[data-prov-chips]').addEventListener('click', function (event) {
      var chip = event.target.closest('[data-prov-chip]');
      if (!chip) return;
      buy.amount = +chip.getAttribute('data-prov-chip');
      syncBuy();
      renderBuy();
    });
    q('[data-buy-submit]').addEventListener('click', function () {
      if (!buy.amount || buyTooLow()) {
        buyCrypto.focus();
        return;
      }
      setWStep('buy-provider');
    });
    q('[data-prov-submit]').addEventListener('click', function () {
      var c = byCode(buy.crypto), f = fiatOf(buy.fiat);
      q('[data-buy-done-spend]').textContent = (buy.amount * buyPrice()).toFixed(2) + ' ' + f.code;
      var get = buy.amount * (1 - provOf(buy.provider).fee);
      q('[data-buy-done-get]').textContent = get.toFixed(6) + ' ' + c.code;
      credit(c, get);
      renderWallet();
      setWStep('buy-done');
    });

    // Withdraw (Wallet 439:375390): its own window from the Wallet / Profile
    // Withdraw buttons. Currency and network are picked in a sheet; a currency
    // with an unwagered deposit shows the wagering requirement and Wager now.
    // Confirmation asks for the 6-digit email code (any digits in the demo).
    var NETWORKS = {
      USDT: [
        { code: 'TRX', name: 'TRON (TRC20)', feeUsd: 1, icon: 'net-trx.svg' },
        { code: 'BNB', name: 'BSC (BEP20)', feeUsd: 0.2, icon: 'net-bnb.svg' },
        { code: 'TON', name: 'TON', feeUsd: 0.2, icon: 'net-ton.svg' },
        { code: 'ETH', name: 'Ethereum (ERC20)', feeUsd: 0.8, icon: 'net-eth.svg' }
      ],
      USDC: [
        { code: 'ETH', name: 'Ethereum (ERC20)', feeUsd: 0.8, icon: 'net-eth.svg' },
        { code: 'BNB', name: 'BSC (BEP20)', feeUsd: 0.2, icon: 'net-bnb.svg' }
      ],
      ETH: [{ code: 'ETH', name: 'Ethereum (ERC20)', feeUsd: 2, icon: 'net-eth.svg' }],
      BTC: [{ code: 'BTC', name: 'Bitcoin', feeUsd: 3, icon: 'net-btc.svg' }],
      LTC: [{ code: 'LTC', name: 'Litecoin', feeUsd: 0.1, icon: 'net-ltc.svg' }]
    };
    var wdModal = wmodal('withdraw');
    var wdPick = wmodal('wdpick');
    var wq = function (sel) { return wdModal.querySelector(sel); };
    var wd = { cur: 'USDT', net: 0, amount: 0, hash: '', timer: null };
    var wdAmount = wq('[data-wd-amount]');
    var wdAddress = wq('[data-wd-address]');
    var wdCodes = wdModal.querySelectorAll('[data-wd-code] input');
    var wdNet = function () { return NETWORKS[wd.cur][wd.net] || NETWORKS[wd.cur][0]; };
    var wdFee = function () { return wdNet().feeUsd / byCode(wd.cur).usd; };
    var wdDigits = function (c) { return c.usd > 100 ? 6 : 2; };
    var netRow = function (n, sub, check) {
      return '<span class="wrow__icon"><img src="' + IMGP + n.icon + '" alt=""></span>' +
        '<span class="wrow__name"><span class="wrow__code">' + wEsc(n.name) + '</span><span class="wrow__full">' + wEsc(sub) + '</span></span>' +
        (check ? '<img class="wrow__check" src="' + IMGP + 'wl-check.svg" alt="Selected">' : '');
    };
    var commission = function (n) {
      var c = byCode(wd.cur), f = fiatOf(wstate.fiat) || FIATS[0];
      var fee = n.feeUsd / c.usd;
      return 'Commission: ' + fee.toFixed(fee < 0.01 ? 6 : 2).replace(/\.?0+$/, '') + ' ' + c.code + ' (≈' + f.sym + (n.feeUsd * f.rate).toFixed(2) + ')';
    };
    var setWdStep = function (step) {
      wdModal.querySelectorAll('[data-wd-step]').forEach(function (p) { p.hidden = p.getAttribute('data-wd-step') !== step; });
      wq('[data-wd-title]').textContent = step === 'confirm' ? 'Confirm Withdrawal' : step === 'done' ? 'Completed!' : 'Withdraw';
    };
    var renderWd = function () {
      var c = byCode(wd.cur), n = wdNet();
      var w = WAGER[c.code];
      var wagering = !!(w && w.left > 0);
      wq('[data-wd-pick="cur"]').innerHTML = fieldRow(c, true);
      wq('[data-wd-pick="net"]').innerHTML = netRow(n, n.code === c.code ? c.name : n.code) +
        '<img class="wrow__arrow" src="' + IMGP + 'ws-arrow.svg" alt="">';
      ['[data-wd-net-block]', '[data-wd-amount-block]', '[data-wd-address-block]'].forEach(function (sel) { wq(sel).hidden = wagering; });
      wq('[data-wd-wager]').hidden = !wagering;
      if (wagering) {
        var pct = Math.round((1 - w.left / w.total) * 100);
        wq('[data-wd-wager-pct]').textContent = pct + '%';
        wq('[data-wd-wager-bar]').style.width = pct + '%';
        wq('[data-wd-wager-left]').textContent = w.left.toFixed(2) + ' ' + c.code;
      }
      var fee = wdFee(), total = wd.amount + fee, d = wdDigits(c);
      wdModal.querySelectorAll('[data-wd-sum]').forEach(function (el) { el.textContent = wd.amount.toFixed(6) + ' ' + c.code; });
      wdModal.querySelectorAll('[data-wd-fee]').forEach(function (el) { el.textContent = fee.toFixed(6) + ' ' + c.code; });
      wdModal.querySelectorAll('[data-wd-total]').forEach(function (el) { el.textContent = total.toFixed(d) + ' ' + c.code; });
      wq('[data-wd-note]').hidden = !(wd.amount || wdAddress.value.trim());
      wq('[data-wd-submit]').hidden = wagering;
      wq('[data-wd-wager-now]').hidden = !wagering;
      wq('[data-wd-submit]').disabled = !wd.amount || wdAddress.value.trim().length < 10 || total > c.amount + 1e-9;
    };
    var openWd = function () {
      if (!byCode(wd.cur) || !byCode(wd.cur).amount) wd.cur = byCode(wstate.current) && byCode(wstate.current).amount ? wstate.current : 'USDT';
      setWdStep('form');
      renderWd();
      if (!wmodal('wallet').hidden) closeW('wallet');
      openW('withdraw');
    };
    document.querySelectorAll('[data-withdraw-open]').forEach(function (b) {
      b.addEventListener('click', function (event) {
        event.preventDefault();
        openWd();
      });
    });
    wdAmount.addEventListener('input', function () { wd.amount = num(wdAmount.value); renderWd(); });
    // Demo: a click on the empty Address field fills in a sample address of the
    // chosen network (it follows the network until the player edits it)
    var WD_ADDR = {
      TRX: 'TR7hrgJeKQxGTci8q8Z7f9Lm5tQ6j8cV3F',
      BNB: '0x3F8b2c6D1e9A47f5B0c83d2E6a91F4b7C5d0E218',
      ETH: '0x3F8b2c6D1e9A47f5B0c83d2E6a91F4b7C5d0E218',
      TON: 'UQCv4Lm8pR2nT6wX9zB1dF5hJ3kN7qS0uY4aE8gI2oM6cW1',
      BTC: 'bc1q9h6tp4l0zk2m8xw3r5v7n1c6d4s2a8f0g3j5ke',
      LTC: 'ltc1q7m3k9d2f5h8j1n4p6r0t3w5y8a2c4e6g9b1xz'
    };
    var wdAuto = function () {
      if (wdAddress.value.trim() && !wd.auto) return;
      wdAddress.value = WD_ADDR[wdNet().code] || '';
      wd.auto = !!wdAddress.value;
    };
    wdAddress.addEventListener('click', function () {
      if (wdAddress.value.trim()) return;
      wdAuto();
      renderWd();
    });
    wdAddress.addEventListener('input', function () {
      wd.auto = false;
      renderWd();
    });
    wq('[data-wd-max]').addEventListener('click', function (event) {
      event.preventDefault();
      wd.amount = Math.max(0, byCode(wd.cur).amount - wdFee());
      wdAmount.value = fix(wd.amount, 6);
      renderWd();
    });
    var wdPickFor = null;
    var renderWdPick = function () {
      var cur = wdPickFor === 'cur';
      wdPick.querySelector('[data-wdpick-title]').textContent = cur ? 'Select currency to withdraw' : 'Select network type';
      wdPick.querySelector('[data-wdpick-sub]').hidden = !cur;
      wdPick.querySelector('[data-wdpick-list]').innerHTML = cur ?
        CURRENCIES.filter(function (c) { return c.amount > 0; }).map(function (c) {
          return row(c, wstate.hidden ? HIDDEN : usdText(c.amount * c.usd), wstate.hidden ? HIDDEN : cryptoText(c), 'button', false)
            .replace('data-wcur=', 'data-wdpick-item=');
        }).join('') :
        NETWORKS[wd.cur].map(function (n, i) {
          return '<button class="wrow' + (i === wd.net ? ' is-active' : '') + '" type="button" data-wdpick-item="' + i + '">' +
            netRow(n, commission(n), i === wd.net) + '</button>';
        }).join('');
    };
    wdModal.querySelectorAll('[data-wd-pick]').forEach(function (b) {
      b.addEventListener('click', function () {
        wdPickFor = b.getAttribute('data-wd-pick');
        renderWdPick();
        wdModal.hidden = true;
        openW('wdpick');
      });
    });
    wdPick.addEventListener('click', function (event) {
      var item = event.target.closest('[data-wdpick-item]');
      if (!item) return;
      var v = item.getAttribute('data-wdpick-item');
      if (wdPickFor === 'cur') {
        if (v !== wd.cur) {
          wd.cur = v;
          wd.net = 0;
          wd.amount = 0;
          wdAmount.value = '';
        }
      } else {
        wd.net = +v;
      }
      if (wd.auto) wdAuto();
      renderWd();
      closeW('wdpick');
    });
    var wdTick = function (left) {
      var b = wq('[data-wd-resend]');
      clearTimeout(wd.timer);
      b.disabled = left > 0;
      b.textContent = left > 0 ? 'Resend (' + left + 's)' : 'Resend';
      if (left > 0) wd.timer = setTimeout(function () { wdTick(left - 1); }, 1000);
    };
    var codeReady = function () {
      return Array.prototype.every.call(wdCodes, function (i) { return /^\d$/.test(i.value); });
    };
    wq('[data-wd-submit]').addEventListener('click', function () {
      var c = byCode(wd.cur);
      wq('[data-wd-get]').textContent = wd.amount.toFixed(6) + ' ' + c.code;
      wdCodes.forEach(function (i) { i.value = ''; });
      wq('[data-wd-confirm]').disabled = true;
      setWdStep('confirm');
      wdTick(54);
      wdCodes[0].focus();
    });
    wdCodes.forEach(function (input, i) {
      input.addEventListener('input', function () {
        var digits = input.value.replace(/\D/g, '');
        if (digits.length > 1) {
          // pasted code: spread it over the boxes
          digits.split('').slice(0, wdCodes.length - i).forEach(function (d, k) { wdCodes[i + k].value = d; });
          wdCodes[Math.min(i + digits.length, wdCodes.length) - 1].focus();
        } else {
          input.value = digits;
          if (digits && wdCodes[i + 1]) wdCodes[i + 1].focus();
        }
        wq('[data-wd-confirm]').disabled = !codeReady();
      });
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Backspace' && !input.value && wdCodes[i - 1]) wdCodes[i - 1].focus();
      });
    });
    wq('[data-wd-resend]').addEventListener('click', function () { wdTick(54); });
    wq('[data-wd-back]').addEventListener('click', function () {
      clearTimeout(wd.timer);
      setWdStep('form');
    });
    wq('[data-wd-confirm]').addEventListener('click', function () {
      if (!codeReady()) return;
      var c = byCode(wd.cur);
      clearTimeout(wd.timer);
      c.amount = Math.max(0, c.amount - wd.amount - wdFee());
      var hex = '';
      for (var i = 0; i < 64; i++) hex += '0123456789abcdef'[Math.floor(Math.random() * 16)];
      wd.hash = '0x' + hex;
      wq('[data-wd-sent]').textContent = wd.amount.toFixed(6) + ' ' + c.code;
      wq('[data-wd-hash] span').textContent = wd.hash.slice(0, 4) + '...' + wd.hash.slice(-4);
      wd.amount = 0;
      wdAmount.value = '';
      wdAddress.value = '';
      wd.auto = false;
      renderWallet();
      setWdStep('done');
    });
    wq('[data-wd-hash]').addEventListener('click', function (event) {
      var sp = event.currentTarget.querySelector('span');
      var done = function () {
        sp.textContent = 'Copied';
        setTimeout(function () { sp.textContent = wd.hash.slice(0, 4) + '...' + wd.hash.slice(-4); }, 1200);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(wd.hash).then(done, done);
      else done();
    });
    wq('[data-wd-wallet]').addEventListener('click', function () {
      closeW('withdraw');
      setWStep('wallet');
      openW('wallet');
    });

    // Deposit (Wallet 525:364601, wireframes): its own window from the header
    // wallet button, the Wallet and the Profile. Currency and network are
    // picked in a sheet; the network shows the address with its QR code. An
    // empty balance offers Buy crypto (the Wallet's Buy Crypto step), a
    // non-empty one offers it as a repeat deposit. Demo: a few seconds after
    // the address is shown the transfer "arrives" ($100 in the coin).
    var DEP_NETS = {
      USDT: [
        { code: 'TRX', name: 'TRON (TRC20)', min: 1, icon: 'net-trx.svg', qr: 'trx' },
        { code: 'APT', name: 'APTOS', min: 0.5, icon: 'net-aptos.svg', qr: 'apt' },
        { code: 'BNB', name: 'BSC (BEP20)', min: 0.5, icon: 'net-bnb.svg', qr: 'evm' },
        { code: 'TON', name: 'TON', min: 0.5, icon: 'net-ton.svg', qr: 'ton' },
        { code: 'ETH', name: 'Ethereum (ERC20)', min: 5, icon: 'net-eth.svg', qr: 'evm' },
        { code: 'PLASMA', name: 'Plasma (USDT0)', min: 0.1, icon: 'net-plasma.svg', qr: 'evm' },
        { code: 'NEAR', name: 'Near', min: 0.5, icon: 'net-near.svg', qr: 'near' },
        { code: 'SOL', name: 'SOL', min: 0.5, icon: 'net-sol.svg', qr: 'sol' }
      ],
      USDC: [
        { code: 'ETH', name: 'Ethereum (ERC20)', min: 5, icon: 'net-eth.svg', qr: 'evm' },
        { code: 'BNB', name: 'BSC (BEP20)', min: 0.5, icon: 'net-bnb.svg', qr: 'evm' },
        { code: 'SOL', name: 'SOL', min: 0.5, icon: 'net-sol.svg', qr: 'sol' }
      ],
      ETH: [{ code: 'ETH', name: 'Ethereum (ERC20)', min: 0.002, icon: 'net-eth.svg', qr: 'evm' }],
      BTC: [{ code: 'BTC', name: 'Bitcoin', min: 0.0001, icon: 'net-btc.svg', qr: 'btc' }],
      LTC: [{ code: 'LTC', name: 'Litecoin', min: 0.01, icon: 'net-ltc.svg', qr: 'ltc' }]
    };
    // Demo addresses; dq-*.svg are their QR codes
    var DEP_ADDR = {
      trx: 'TXz9P3cq4Hn7mR2kVbW8sJfL5yDgA1eQuN',
      evm: '0x7a3F9c21B04dE8f6A5b2C9e17D4f08A6b3E5c912',
      ton: 'UQBx7Kp2mN4vR9sT1wY6zA3cE8fH5jL0qG2dU7iO4bX9kMnP',
      apt: '0x5c1e8b3a9f27d4c6e0b18a5f3d72c94e6b0a18d5f3c27e9b4a6d0c81f5e3b729',
      near: '7f3a9c2e5b18d4f6a0c3e7b92d5f1a8c4e6b0d3f7a2c9e5b1d8f4a6c0e3b7d92',
      sol: '9wFzK3vRqT8mPj2LhN6xYc4bDs1aGe7uVt5oMkQpXr3Z',
      btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      ltc: 'ltc1qg82tn7m5z6d4c3x9h0jv8k2w5p7s4r6y3e1a0f'
    };
    var depModal = wmodal('deposit');
    var depPick = wmodal('deppick');
    var dq = function (sel) { return depModal.querySelector(sel); };
    var dep = { cur: 'USDT', net: -1, timer: null, pick: null };
    var depToast = document.querySelector('[data-dep-toast]');
    var depEmpty = function () { return !CURRENCIES.some(function (c) { return c.amount > 0; }); };
    var depNet = function () { return DEP_NETS[dep.cur][dep.net]; };
    var depWarn = function (c, n) {
      return n ? 'Send only ' + c.code + ' via ' + n.name + ' to this address. Sending other assets or using another network may result in permanent loss.' :
        'Choose the network you will send ' + c.code + ' from. Sending via another network may result in permanent loss.';
    };
    var renderDep = function () {
      var c = byCode(dep.cur), n = depNet(), empty = depEmpty();
      dq('[data-dep-pick="cur"]').innerHTML = fieldRow(c, true);
      dq('[data-dep-pick="net"]').innerHTML = n ?
        netRow(n, n.code === c.code ? c.name : n.code) + '<img class="wrow__arrow" src="' + IMGP + 'ws-arrow.svg" alt="">' :
        '<span class="wrow__name"><span class="wrow__placeholder">Choose network</span></span><img class="wrow__arrow" src="' + IMGP + 'ws-arrow.svg" alt="">';
      dq('[data-dep-address-block]').hidden = !n;
      dq('[data-dep-callout="top"]').hidden = !empty || !!n;
      dq('[data-dep-callout="bottom"]').hidden = !empty || !n;
      dq('[data-dep-repeat]').hidden = empty || !!n;
      if (n) {
        dq('[data-dep-qr]').src = IMGP + 'dq-' + n.qr + '.svg';
        dq('[data-dep-qr-coin]').src = IMGP + c.icon;
        dq('[data-dep-address]').textContent = DEP_ADDR[n.qr];
        dq('[data-dep-warn]').textContent = depWarn(c, n);
      }
    };
    var depArrive = function () {
      clearTimeout(dep.timer);
      if (!depNet()) return;
      dep.timer = setTimeout(function () {
        if (depModal.hidden && depPick.hidden) return;
        var c = byCode(dep.cur), amount = 100 / c.usd;
        credit(c, amount);
        wstate.current = c.code;
        saveW();
        renderWallet();
        if (!depPick.hidden) closeW('deppick');
        closeW('deposit');
        depToast.querySelector('[data-dep-toast-text]').textContent = 'Your deposit is here: +' + fix(amount, 6) + ' ' + c.code;
        depToast.hidden = false;
        clearTimeout(dep.toast);
        dep.toast = setTimeout(function () { depToast.hidden = true; }, 5000);
      }, 6000);
    };
    var openDep = function () {
      if (byCode(wstate.current)) dep.cur = wstate.current;
      dep.net = -1;
      renderDep();
      ['wallet', 'withdraw'].forEach(function (n) { if (!wmodal(n).hidden) closeW(n); });
      openW('deposit');
    };
    document.querySelectorAll('[data-deposit-open]').forEach(function (b) {
      b.addEventListener('click', function (event) {
        event.preventDefault();
        openDep();
      });
    });
    var renderDepPick = function () {
      var cur = dep.pick === 'cur', c = byCode(dep.cur);
      depPick.querySelector('[data-deppick-title]').textContent = cur ? 'Select currency to deposit' : 'Select network type';
      depPick.querySelector('[data-deppick-note]').hidden = cur;
      depPick.querySelector('[data-deppick-warn]').textContent = depWarn(c);
      depPick.querySelector('[data-deppick-list]').innerHTML = cur ?
        CURRENCIES.map(function (x) {
          return row(x, wstate.hidden ? HIDDEN : usdText(x.amount * x.usd), wstate.hidden ? HIDDEN : cryptoText(x), 'button', x.code === dep.cur)
            .replace('data-wcur=', 'data-deppick-item=');
        }).join('') :
        DEP_NETS[dep.cur].map(function (n, i) {
          return '<button class="wrow' + (i === dep.net ? ' is-active' : '') + '" type="button" data-deppick-item="' + i + '">' +
            netRow(n, 'Min. deposit: ' + n.min + ' ' + c.code, i === dep.net) + '</button>';
        }).join('');
    };
    depModal.querySelectorAll('[data-dep-pick]').forEach(function (b) {
      b.addEventListener('click', function () {
        dep.pick = b.getAttribute('data-dep-pick');
        renderDepPick();
        depModal.hidden = true;
        openW('deppick');
      });
    });
    depPick.addEventListener('click', function (event) {
      var item = event.target.closest('[data-deppick-item]');
      if (!item) return;
      var v = item.getAttribute('data-deppick-item');
      if (dep.pick === 'cur') {
        if (v !== dep.cur) {
          dep.cur = v;
          dep.net = -1;
          clearTimeout(dep.timer);
        }
      } else if (+v !== dep.net) {
        dep.net = +v;
        depArrive();
      }
      renderDep();
      closeW('deppick');
    });
    depModal.querySelectorAll('[data-dep-buy]').forEach(function (b) {
      b.addEventListener('click', function () {
        buy.crypto = dep.cur;
        closeW('deposit');
        setWStep('buy');
        openW('wallet');
      });
    });
    dq('[data-dep-copy]').addEventListener('click', function (event) {
      var sp = event.currentTarget.querySelector('span');
      var addr = sp.textContent;
      var done = function () {
        sp.textContent = 'Copied';
        setTimeout(function () { sp.textContent = addr; }, 1200);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(addr).then(done, done);
      else done();
    });
    depToast.querySelector('[data-dep-toast-close]').addEventListener('click', function () {
      clearTimeout(dep.toast);
      depToast.hidden = true;
    });

    var setWStep = function (step) {
      var st = STEPS[step];
      wcard.querySelectorAll('[data-wpane]').forEach(function (p) { p.hidden = p.getAttribute('data-wpane') !== step; });
      wcard.querySelectorAll('[data-wtab]').forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-wtab') === st.tab); });
      q('[data-wallet-title]').textContent = st.title;
      q('[data-wallet-gear]').hidden = !st.gear;
      q('[data-wallet-close]').hidden = !!st.gear;
      if (step === 'swap') {
        if (swap.from === swap.to || !byCode(swap.from)) swap.from = wstate.current;
        if (swap.from === swap.to) swap.to = CURRENCIES.filter(function (c) { return c.code !== swap.from; })[0].code;
        syncSwap();
        renderSwap();
      }
      if (step === 'buy' || step === 'buy-provider') {
        syncBuy();
        renderBuy();
      }
    };
    wcard.querySelectorAll('[data-wtab]').forEach(function (tab) {
      tab.addEventListener('click', function () { setWStep(tab.getAttribute('data-wtab')); });
    });
    wcard.querySelectorAll('[data-wstep]').forEach(function (b) {
      b.addEventListener('click', function () { setWStep(b.getAttribute('data-wstep')); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (!wdrop.hidden) setDrop(false);
      ['coin', 'provider', 'wdpick', 'deppick', 'fiat', 'settings', 'withdraw', 'deposit', 'wallet'].some(function (n) {
        if (!wmodal(n).hidden) { closeW(n); return true; }
        return false;
      });
    });
    renderWallet();
  }

  // Play flow: a game tile opens the game card (Demo / Play, game currency);
  // on the game page "Play real mode" switches demo to money mode (guests are
  // asked to log in).
  var favKey = 'game-fav';
  var isFav = function () { try { return localStorage.getItem(favKey) === '1'; } catch (e) { return false; } };
  var setFav = function (on) {
    try { localStorage.setItem(favKey, on ? '1' : '0'); } catch (e) {}
    document.querySelectorAll('[data-game-fav]').forEach(function (b) {
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? 'Remove from favorites' : 'Add to favorites');
    });
  };
  document.querySelectorAll('[data-game-fav]').forEach(function (b) {
    b.addEventListener('click', function () { setFav(!isFav()); });
  });
  setFav(isFav());

  var gp = document.querySelector('[data-gpreview]');
  if (gp) {
    var gpList = gp.querySelector('[data-gp-list]');
    var gpToggle = gp.querySelector('[data-gp-toggle]');
    var gpLast = null;
    var setGpList = function (open) {
      gpList.hidden = !open;
      gpToggle.setAttribute('aria-expanded', String(open));
      gp.classList.toggle('is-list', open);
    };
    var openGp = function () {
      gpLast = document.activeElement;
      // Mobile: the card drops down under the header while it is on screen.
      var hdr = document.querySelector('.header');
      gp.style.top = (!DESKTOP.matches && hdr ? Math.max(0, hdr.getBoundingClientRect().bottom) : 0) + 'px';
      gp.hidden = false;
      root.classList.add('modal-open');
      gp.querySelector('.wmodal__close').focus();
    };
    var closeGp = function (keepFocus) {
      if (gp.hidden) return;
      gp.hidden = true;
      setGpList(false);
      root.classList.remove('modal-open');
      if (!keepFocus && gpLast) gpLast.focus({ preventScroll: true });
    };
    var selectGameCurrency = function (code) {
      var row = gpList.querySelector('[data-gp-cur="' + code + '"]');
      if (!row) return;
      gpList.querySelectorAll('[data-gp-cur]').forEach(function (r) {
        r.classList.toggle('is-active', r === row);
        r.setAttribute('aria-selected', String(r === row));
      });
      gp.querySelector('[data-gp-sym]').textContent = row.getAttribute('data-gp-sym');
      gp.querySelector('[data-gp-code]').textContent = code;
    };

    // Game tiles are switched off for now: a tap does nothing (no game card,
    // no game page). Set GAMES_ON to true to bring the game card back.
    var GAMES_ON = false;
    document.addEventListener('click', function (event) {
      var tile = event.target.closest('a[data-game]');
      if (!tile || event.defaultPrevented) return;
      event.preventDefault();
      if (GAMES_ON) openGp();
    });
    gp.querySelectorAll('[data-gp-close]').forEach(function (b) {
      b.addEventListener('click', function () { closeGp(); });
    });
    gp.querySelectorAll('[data-modal-open]').forEach(function (b) {
      b.addEventListener('click', function () { closeGp(true); });
    });
    gpToggle.addEventListener('click', function () { setGpList(gpList.hidden); });
    gpList.addEventListener('click', function (event) {
      var row = event.target.closest('[data-gp-cur]');
      if (!row) return;
      var code = row.getAttribute('data-gp-cur');
      selectGameCurrency(code);
      try { localStorage.setItem('game-currency', code); } catch (e) {}
      setGpList(false);
      gpToggle.focus();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || gp.hidden) return;
      if (!gpList.hidden) {
        setGpList(false);
        gpToggle.focus();
      } else {
        closeGp();
      }
    });
    try { selectGameCurrency(localStorage.getItem('game-currency') || 'EUR'); } catch (e) {}
  }


  var gamePage = document.querySelector('[data-game-page]');
  if (gamePage) {
    var setMode = function (real) { gamePage.setAttribute('data-mode', real ? 'real' : 'demo'); };
    setMode(root.classList.contains('is-auth') && !/[?&]demo=1\b/.test(location.search));
    gamePage.querySelector('[data-game-real]').addEventListener('click', function () {
      setMode(true);
      try { history.replaceState(null, '', 'game.html'); } catch (e) {}
    });
    gamePage.querySelector('[data-game-close]').addEventListener('click', function (event) {
      var sameSite = false;
      try { sameSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
      if (sameSite && history.length > 1) {
        event.preventDefault();
        history.back();
      }
    });
  }

  // Profile: tabs, info tooltips, log out.
  var pfTabs = document.querySelectorAll('[data-pf-tab]');
  pfTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.getAttribute('data-pf-tab');
      pfTabs.forEach(function (t) {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      document.querySelectorAll('[data-pf-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-pf-pane') !== name; });
    });
  });
  var pfTips = document.querySelectorAll('[data-pf-tip]');
  var closeTips = function (except) {
    pfTips.forEach(function (b) {
      if (b === except) return;
      b.parentNode.classList.remove('is-open');
      b.setAttribute('aria-expanded', 'false');
    });
  };
  pfTips.forEach(function (b) {
    b.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = !b.parentNode.classList.contains('is-open');
      closeTips(b);
      b.parentNode.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', String(open));
    });
  });
  if (pfTips.length) {
    document.addEventListener('click', function () { closeTips(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeTips(); });
  }
  document.querySelectorAll('.pf [data-logout]').forEach(function (b) {
    b.addEventListener('click', function () {
      setAuth(false);
      window.location.href = 'home.html';
    });
  });

  // Menu: the Casino / Sport / Prediction tabs switch the menu (sidebar and
  // mobile screen); on mobile the Menu tab opens the menu as a screen.
  document.querySelectorAll('[data-menu-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var box = tab.closest('.sidebar__menu, .mmenu__scroll');
      var name = tab.getAttribute('data-menu-tab');
      box.querySelectorAll('[data-menu-tab]').forEach(function (t) {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      box.querySelectorAll('[data-menu-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-menu-pane') !== name; });
      var search = box.querySelector('[data-menu-search]');
      if (search) search.placeholder = name === 'prediction' ? 'Search predictions' : 'Search games, providers, categories';
    });
  });

  // Desktop menu pop-ups: sections list (collapsed "⋮"), item names on hover
  // in the collapsed menu, language list (EN button, also in the mobile menu).
  var sidebarEl = document.querySelector('.sidebar');
  var pops = {};
  document.querySelectorAll('[data-sb-pop]').forEach(function (p) { pops[p.getAttribute('data-sb-pop')] = p; });
  var popOwner = {};
  var closePop = function (name) {
    var p = pops[name];
    if (!p || p.hidden) return;
    p.hidden = true;
    if (popOwner[name]) popOwner[name].setAttribute('aria-expanded', 'false');
    popOwner[name] = null;
  };
  var place = function (p, x, y, fromBottom) {
    p.style.left = Math.max(8, Math.min(x, window.innerWidth - p.offsetWidth - 8)) + 'px';
    if (fromBottom) {
      p.style.top = 'auto';
      p.style.bottom = Math.max(8, window.innerHeight - y) + 'px';
    } else {
      p.style.bottom = 'auto';
      p.style.top = Math.max(8, Math.min(y, window.innerHeight - p.offsetHeight - 8)) + 'px';
    }
  };
  var openPop = function (name, owner, pos) {
    var p = pops[name];
    ['sections', 'lang'].forEach(function (n) { if (n !== name) closePop(n); });
    p.hidden = false;
    popOwner[name] = owner;
    owner.setAttribute('aria-expanded', 'true');
    pos(p);
    var first = p.querySelector('.is-active') || p.querySelector('button');
    if (first) first.focus({ preventScroll: true });
  };
  var collapsed = function () { return DESKTOP.matches && !root.classList.contains('sidebar-open'); };

  if (pops.sections && sidebarEl) {
    var secBtn = sidebarEl.querySelector('[data-sb-sections]');
    secBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      if (!pops.sections.hidden) { closePop('sections'); return; }
      openPop('sections', secBtn, function (p) {
        var r = secBtn.getBoundingClientRect();
        place(p, sidebarEl.getBoundingClientRect().right, r.top);
      });
    });
    pops.sections.addEventListener('click', function (event) {
      var item = event.target.closest('[data-sb-section]');
      if (!item) return;
      var tab = sidebarEl.querySelector('[data-menu-tab="' + item.getAttribute('data-sb-section') + '"]');
      if (tab) tab.click();
      closePop('sections');
      secBtn.focus();
    });
  }

  if (pops.tip && sidebarEl) {
    var tipText = pops.tip.querySelector('[data-sb-tip-text]');
    var tipIcon = pops.tip.querySelector('[data-sb-tip-icon]');
    sidebarEl.addEventListener('mouseover', function (event) {
      var cell = event.target.closest('.sidebar__menu .sb-cell');
      if (!collapsed() || !cell || !cell.title || cell.hasAttribute('data-sb-sections')) { pops.tip.hidden = true; return; }
      var r = cell.getBoundingClientRect();
      tipText.textContent = cell.title;
      var icon = cell.querySelector('.sb-cell__icon img');
      tipIcon.innerHTML = icon ? '<img src="' + icon.getAttribute('src') + '" alt="">' : '';
      pops.tip.hidden = false;
      pops.tip.style.left = r.left + 'px';
      pops.tip.style.top = r.top + 'px';
      pops.tip.style.bottom = 'auto';
    });
    sidebarEl.addEventListener('mouseleave', function () { pops.tip.hidden = true; });
    sidebarEl.querySelector('.sidebar__menu').addEventListener('scroll', function () { pops.tip.hidden = true; });
  }

  if (pops.lang) {
    var setLang = function (code) {
      document.querySelectorAll('[data-lang-code]').forEach(function (el) { el.textContent = code; });
      pops.lang.querySelectorAll('[data-lang]').forEach(function (b) {
        var on = b.getAttribute('data-lang') === code;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-checked', String(on));
      });
    };
    document.querySelectorAll('[data-lang-open]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.stopPropagation();
        if (!pops.lang.hidden && popOwner.lang === btn) { closePop('lang'); return; }
        openPop('lang', btn, function (p) {
          var r = btn.getBoundingClientRect();
          if (btn.closest('.sidebar') && collapsed()) place(p, sidebarEl.getBoundingClientRect().right + 4, r.bottom, true);
          else place(p, r.left, r.top - 8, true);
        });
      });
    });
    pops.lang.addEventListener('click', function (event) {
      var item = event.target.closest('[data-lang]');
      if (!item) return;
      var code = item.getAttribute('data-lang');
      setLang(code);
      try { localStorage.setItem('lang', code); } catch (e) {}
      var owner = popOwner.lang;
      closePop('lang');
      if (owner) owner.focus();
    });
    try { if (localStorage.getItem('lang')) setLang(localStorage.getItem('lang')); } catch (e) {}
  }

  document.addEventListener('click', function (event) {
    ['sections', 'lang'].forEach(function (n) {
      if (pops[n] && !pops[n].contains(event.target)) closePop(n);
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    ['sections', 'lang'].forEach(function (n) {
      var owner = popOwner[n];
      if (pops[n] && !pops[n].hidden) { closePop(n); if (owner) owner.focus(); }
    });
  });
  window.addEventListener('resize', function () { closePop('sections'); closePop('lang'); });

  // Mobile menu page (menu.html?s=casino|sport|prediction): shows the menu of
  // the section it was opened from; Menu again goes back; on desktop the
  // sidebar is the menu, so the page leads to the section itself.
  var menuPage = document.querySelector('[data-menu-page]');
  if (menuPage) {
    var sm = /[?&]s=(casino|sport|prediction)\b/.exec(location.search);
    var section = sm ? sm[1] : 'casino';
    if (DESKTOP.matches) {
      location.replace(section + '.html');
    } else {
      var secTab = menuPage.querySelector('[data-menu-tab="' + section + '"]');
      if (secTab && !secTab.classList.contains('is-active')) secTab.click();
    }
    document.querySelectorAll('[data-menu-link]').forEach(function (a) {
      a.addEventListener('click', function (event) {
        var sameSite = false;
        try { sameSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
        if (sameSite && history.length > 1) {
          event.preventDefault();
          history.back();
        }
      });
    });
    DESKTOP.addEventListener('change', function (e) { if (e.matches) location.replace(section + '.html'); });
  }

  // Coefficients: toggle selection.
  document.querySelectorAll('.coef').forEach(function (coef) {
    coef.addEventListener('click', function () {
      coef.classList.toggle('is-selected');
    });
  });
})();
