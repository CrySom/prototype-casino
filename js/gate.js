/* Password screen for the whole site (front-end only: it keeps casual
   visitors out, it is not real protection). The password is not stored,
   only its hash; after a correct entry the browser remembers it. */
(function () {
  var KEY = 'proto-access';
  var HASH = '5bdd055d';
  var hash = function (s) {
    var x = 0x811c9dc5;
    s = 'iq-proto:' + s;
    for (var i = 0; i < s.length; i++) {
      x ^= s.charCodeAt(i);
      x = Math.imul(x, 0x01000193) >>> 0;
    }
    return x.toString(16);
  };
  try { if (localStorage.getItem(KEY) === HASH) return; } catch (e) {}

  var root = document.documentElement;
  root.classList.add('is-locked');

  document.addEventListener('DOMContentLoaded', function () {
    var gate = document.createElement('form');
    gate.className = 'gate';
    gate.setAttribute('novalidate', '');
    gate.innerHTML =
      '<div class="gate__card">' +
      '<img class="gate__logo" src="assets/img/logo.svg" alt="IQ">' +
      '<h1 class="gate__title">Crypto Casino</h1>' +
      '<p class="gate__text">Enter the password to open the prototype.</p>' +
      '<label class="gate__field"><span class="gate__label">Password</span>' +
      '<input class="gate__input" type="password" name="password" inputmode="numeric" autocomplete="current-password" autofocus required></label>' +
      '<p class="gate__error" role="alert" hidden>Wrong password. Try again.</p>' +
      '<button class="gate__btn" type="submit">Enter</button>' +
      '</div>';
    document.body.appendChild(gate);
    var input = gate.querySelector('input');
    var error = gate.querySelector('.gate__error');
    input.focus();
    input.addEventListener('input', function () { error.hidden = true; gate.classList.remove('is-wrong'); });
    gate.addEventListener('submit', function (event) {
      event.preventDefault();
      if (hash(input.value.trim()) === HASH) {
        try { localStorage.setItem(KEY, HASH); } catch (e) {}
        gate.remove();
        root.classList.remove('is-locked');
      } else {
        error.hidden = false;
        gate.classList.remove('is-wrong');
        void gate.offsetWidth;
        gate.classList.add('is-wrong');
        input.select();
      }
    });
  });
})();
