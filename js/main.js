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

  // Prediction: the category tabs swap the markets in the cards (demo data).
  var prediction = document.querySelector('.prediction');
  if (prediction) {
    var IMG = 'assets/img/';
    // [image, category, markets, title, question, yes %, yes coef, no coef, volume, bets]
    var MARKETS = {
      Top: [
        ['prediction-event.png', 'Politics', 15, 'Donald Trump offers', 'Donald Trump’s Offer for Greenland<br>(Trillions of Dollars)', 52, '1,92', '1,68', '2.1M $', '78 901'],
        ['thematic-sport.png', 'Sport', 24, 'Champions League', 'Will Real Madrid win the<br>Champions League 2026?', 38, '2,63', '1,45', '5.4M $', '120 344'],
        ['thematic-casino.png', 'Crypto', 9, 'Bitcoin price', 'Will Bitcoin close above<br>$150,000 this year?', 61, '1,64', '2,56', '8.9M $', '210 087'],
        ['thematic-prediction.png', 'Tech', 7, 'AI race', 'Will a new AI model top<br>the leaderboard in June?', 70, '1,43', '3,33', '1.2M $', '45 620']
      ],
      Politics: [
        ['prediction-event.png', 'Politics', 15, 'Donald Trump offers', 'Donald Trump’s Offer for Greenland<br>(Trillions of Dollars)', 52, '1,92', '1,68', '2.1M $', '78 901'],
        ['prediction-event.png', 'Politics', 11, 'US Midterms', 'Will Republicans keep<br>the House in 2026?', 57, '1,75', '2,33', '12.4M $', '301 552'],
        ['banner-player.png', 'Politics', 6, 'UK elections', 'Snap general election<br>before 2027?', 18, '5,55', '1,22', '740K $', '19 210'],
        ['vip-image.png', 'Politics', 8, 'EU summit', 'Will the EU agree a new<br>budget deal this quarter?', 44, '2,27', '1,79', '980K $', '27 403']
      ],
      Sport: [
        ['thematic-sport.png', 'Sport', 15, 'F1 Drivers’ Champion', 'George Russell to win the<br>2026 championship?', 52, '1,92', '1,68', '3.3M $', '96 015'],
        ['thematic-sport.png', 'Sport', 24, 'Champions League', 'Will Real Madrid win the<br>Champions League 2026?', 38, '2,63', '1,45', '5.4M $', '120 344'],
        ['banner-player.png', 'Sport', 12, 'NBA Finals', 'Will the Celtics reach<br>the NBA Finals?', 46, '2,17', '1,85', '4.1M $', '88 730'],
        ['thematic-sport.png', 'Sport', 5, 'Wimbledon', 'Will Carlos Alcaraz win<br>Wimbledon 2026?', 41, '2,43', '1,69', '1.7M $', '40 118']
      ],
      Culture: [
        ['vip-image.png', 'Culture', 10, 'Oscars 2027', 'Will a sci-fi film win<br>Best Picture?', 23, '4,34', '1,30', '620K $', '14 902'],
        ['banner-player.png', 'Culture', 4, 'Eurovision', 'Will Sweden win<br>Eurovision 2027?', 19, '5,26', '1,23', '410K $', '11 037'],
        ['thematic-casino.png', 'Culture', 7, 'Box office', 'Will a film pass $2B<br>at the box office this year?', 34, '2,94', '1,51', '890K $', '21 764'],
        ['thematic-prediction.png', 'Culture', 3, 'Music awards', 'Album of the Year goes<br>to a debut artist?', 27, '3,70', '1,37', '350K $', '9 480']
      ],
      Tech: [
        ['thematic-prediction.png', 'Tech', 7, 'AI race', 'Will a new AI model top<br>the leaderboard in June?', 70, '1,43', '3,33', '1.2M $', '45 620'],
        ['thematic-casino.png', 'Tech', 5, 'Smartphones', 'Foldable iPhone announced<br>this year?', 33, '3,03', '1,49', '1.9M $', '52 311'],
        ['vip-image.png', 'Tech', 9, 'Big Tech', 'Will a company pass<br>a $6T market cap?', 48, '2,08', '1,92', '2.6M $', '63 804'],
        ['banner-player.png', 'Tech', 4, 'Gaming', 'GTA VI released<br>on schedule?', 64, '1,56', '2,78', '3.1M $', '104 925']
      ],
      Space: [
        ['thematic-prediction.png', 'Space', 6, 'Starship', 'Starship reaches orbit<br>and lands this year?', 58, '1,72', '2,38', '1.4M $', '37 290'],
        ['vip-image.png', 'Space', 3, 'Moon landing', 'Crewed Moon landing<br>before 2028?', 29, '3,45', '1,41', '960K $', '22 518'],
        ['thematic-casino.png', 'Space', 4, 'Mars', 'Uncrewed Mars mission<br>launched in 2026?', 36, '2,78', '1,56', '510K $', '13 604'],
        ['banner-player.png', 'Space', 2, 'Space tourism', 'More than 50 tourists<br>in space this year?', 42, '2,38', '1,72', '280K $', '7 915']
      ],
      Celebrities: [
        ['banner-player.png', 'Celebrities', 8, 'Royal news', 'Royal wedding announced<br>this year?', 21, '4,76', '1,27', '430K $', '12 660'],
        ['vip-image.png', 'Celebrities', 5, 'Tour record', 'Highest-grossing tour<br>record broken in 2026?', 55, '1,82', '2,22', '770K $', '19 043'],
        ['thematic-casino.png', 'Celebrities', 6, 'Social media', 'First account to reach<br>1B followers?', 31, '3,23', '1,45', '390K $', '10 377'],
        ['thematic-prediction.png', 'Celebrities', 3, 'Red carpet', 'Met Gala theme revealed<br>before March?', 67, '1,49', '3,03', '150K $', '4 802']
      ],
      Crypto: [
        ['thematic-casino.png', 'Crypto', 9, 'Bitcoin price', 'Will Bitcoin close above<br>$150,000 this year?', 61, '1,64', '2,56', '8.9M $', '210 087'],
        ['thematic-prediction.png', 'Crypto', 7, 'Ethereum', 'ETH above $8,000<br>by December?', 35, '2,86', '1,54', '4.6M $', '118 402'],
        ['vip-image.png', 'Crypto', 5, 'ETF', 'Solana ETF approved<br>this quarter?', 49, '2,04', '1,96', '2.2M $', '59 731'],
        ['banner-player.png', 'Crypto', 4, 'Stablecoins', 'USDT market cap<br>above $200B?', 72, '1,39', '3,57', '1.5M $', '33 216']
      ],
      Other: [
        ['vip-image.png', 'Other', 4, 'Weather', 'Hottest year on record<br>in 2026?', 63, '1,59', '2,70', '640K $', '17 588'],
        ['thematic-prediction.png', 'Other', 3, 'Economy', 'Fed cuts rates<br>at the next meeting?', 54, '1,85', '2,17', '6.3M $', '140 976'],
        ['thematic-casino.png', 'Other', 2, 'Travel', 'Record number of flights<br>in a single day?', 47, '2,13', '1,89', '220K $', '6 104'],
        ['banner-player.png', 'Other', 5, 'Science', 'Room-temperature<br>superconductor confirmed?', 8, '12,5', '1,09', '1.1M $', '28 447']
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

  // Coefficients: toggle selection.
  document.querySelectorAll('.coef').forEach(function (coef) {
    coef.addEventListener('click', function () {
      coef.classList.toggle('is-selected');
    });
  });
})();
