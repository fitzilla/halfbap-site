/* Half Bap Recording Studios
   - Desktop: strips on the right expand sideways into panels.
   - Phone (< 900px): Menu opens a drawer; each item slides in a full-screen page.
   - Homepage slideshow (studio, Alana Henderson) with dots, arrows, pause and autoplay.
   - Article drawer, photo lightbox, first-visit intro.
   - Contact form opens the visitor's email app (no server needed yet). */
(function () {
  'use strict';
  window.hbReady = true; // tells the safety net in <head> the script loaded

  var site = document.getElementById('site');
  var hero = document.getElementById('hero');
  var heroUi = hero.querySelector('.hero__ui');
  var heroStage = hero.querySelector('.hero__stage');
  var heroBottom = hero.querySelector('.hero__bottom');
  var heroContact = hero.querySelector('.hero__contact');
  var stack = document.getElementById('stack');
  var drawer = document.getElementById('drawer');
  var article = document.getElementById('article');
  var articleScrim = document.querySelector('.article-scrim');
  var menuButton = document.getElementById('menu-button');
  var strips = Array.prototype.slice.call(stack.querySelectorAll('.strip'));
  var keys = strips.map(function (s) { return s.dataset.key; });

  var phone = window.matchMedia('(max-width: 899px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var state = { open: null, menu: false, article: false, from: 'home' };
  var lastTrigger = null;

  // Focus always moves into whatever opens (screen readers need that), but after a mouse
  // click or tap we hide the ring on that programmatic focus so it doesn't flash.
  var pointerUsed = false;
  document.addEventListener('pointerdown', function () { pointerUsed = true; }, true);
  document.addEventListener('keydown', function () { pointerUsed = false; }, true);
  document.addEventListener('focusout', function (e) { e.target.classList && e.target.classList.remove('focus-quiet'); }, true);

  function focusSoon(el) {
    if (!el) return;
    window.setTimeout(function () {
      if (pointerUsed) el.classList.add('focus-quiet');
      el.focus({ preventScroll: true });
    }, 60);
  }

  function stripFor(key) { return stack.querySelector('.strip[data-key="' + key + '"]'); }

  /* ---------- inert / visibility bookkeeping ---------- */
  function sync() {
    var isPhone = phone.matches;
    var anyOverlay = state.article || (isPhone && (state.open || state.menu));

    strips.forEach(function (strip) {
      var on = strip.dataset.key === state.open;
      strip.classList.toggle('is-open', on);
      strip.querySelector('.strip__tab').setAttribute('aria-expanded', on ? 'true' : 'false');
      strip.querySelector('.strip__body').inert = !on || state.article;
    });
    site.classList.toggle('has-open', !!state.open);

    drawer.classList.toggle('is-open', isPhone && state.menu);
    drawer.inert = !(isPhone && state.menu && !state.open && !state.article);
    menuButton.setAttribute('aria-expanded', state.menu ? 'true' : 'false');

    article.classList.toggle('is-open', state.article);
    articleScrim.classList.toggle('is-open', state.article);
    article.inert = !state.article;

    heroUi.inert = !!anyOverlay;
    heroStage.inert = heroBottom.inert = heroContact.inert = !!state.open;
    stack.inert = state.article || (isPhone && state.menu && !state.open);

    slideshow.check();
  }

  // replace = true for stepping between panels with the arrow keys, so Back isn't flooded
  function setHash(hash, replace) {
    var url = location.pathname + location.search + (hash ? '#' + hash : '');
    if (location.hash.replace('#', '') === (hash || '')) return;
    if (replace) history.replaceState(null, '', url); else history.pushState(null, '', url);
  }

  /* ---------- sections ---------- */
  function openSection(key, trigger, replace) {
    if (keys.indexOf(key) === -1) return;
    lastTrigger = trigger || document.activeElement;
    state.from = phone.matches && state.menu ? 'menu' : 'home';
    state.article = false;
    state.open = key;
    sync();
    setHash(key, replace);
    var strip = stripFor(key);
    strip.querySelector('.strip__body').scrollTop = 0;
    if (phone.matches) strip.scrollTop = 0;
    focusSoon(strip.querySelector(phone.matches ? '.mobilebar .close-btn' : '.panel__close'));
  }

  // The X takes you back to where you were: the menu if you came from it, otherwise the homepage.
  // toMenu: the phone "← Menu" button always goes to the menu, whatever opened the page
  function closeSection(toMenu) {
    var was = state.open;
    var backToMenu = phone.matches && (toMenu === true || state.from === 'menu');
    state.open = null;
    state.menu = backToMenu;
    sync();
    setHash('');
    if (backToMenu) focusSoon(drawer.querySelector('[data-open="' + was + '"]'));
    else if (!phone.matches && was) focusSoon(stripFor(was).querySelector('.strip__tab'));
    else focusSoon(phone.matches ? menuButton : lastTrigger);
  }

  function goHome() {
    state.open = null; state.menu = false; state.article = false;
    sync(); setHash('');
    focusSoon(phone.matches ? menuButton : hero.querySelector('.brand'));
  }

  /* ---------- phone drawer ---------- */
  function openMenu() {
    state.menu = true;
    sync();
    focusSoon(drawer.querySelector('.drawer__list button'));
  }
  function closeMenu() {
    state.menu = false;
    sync();
    focusSoon(menuButton);
  }

  /* ---------- article ---------- */
  function openArticle(trigger) {
    lastTrigger = trigger || document.activeElement;
    state.article = true;
    sync();
    setHash('alana-henderson');
    article.querySelector('.article__scroll').scrollTop = 0;
    focusSoon(article.querySelector('.article__close'));
  }
  function closeArticle() {
    state.article = false;
    sync();
    setHash(state.open || '');
    focusSoon(lastTrigger);
  }

  /* ---------- clicks ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('button, a');
    if (!t) return;

    if (t.classList.contains('strip__tab')) {
      var key = t.closest('.strip').dataset.key;
      if (state.open === key) closeSection(); else openSection(key, t);
      return;
    }
    if (t.hasAttribute('data-home')) { e.preventDefault(); goHome(); return; }
    if (t.hasAttribute('data-open')) { openSection(t.getAttribute('data-open'), t); return; }
    if (t.hasAttribute('data-back')) { closeSection(true); return; }
    if (t.hasAttribute('data-close')) {
      if (t.classList.contains('hero__scrim')) t.blur(); // don't leave focus parked in the hero (it pauses the slideshow)
      closeSection();
      return;
    }
    if (t === menuButton) { openMenu(); return; }
    if (t.hasAttribute('data-close-menu')) { closeMenu(); return; }
    if (t.hasAttribute('data-open-article')) { openArticle(t); return; }
    if (t.hasAttribute('data-close-article')) { closeArticle(); return; }
  });

  /* ---------- keyboard ----------
     Left / right: with a panel open, step through the sections (wraps round);
     on the homepage, move the slideshow. Ignored while typing; the lightbox has its own. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    var el = document.activeElement;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
    if (lightbox.isOpen() || state.article || (phone.matches && state.menu && !state.open)) return;
    var step = e.key === 'ArrowRight' ? 1 : -1;
    e.preventDefault();
    if (state.open) {
      var i = keys.indexOf(state.open);
      openSection(keys[(i + step + keys.length) % keys.length], null, true);
    } else {
      slideshow.step(step);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lightbox.isOpen()) lightbox.close();
    else if (state.article) closeArticle();
    else if (state.open) closeSection();
    else if (state.menu) closeMenu();
  });

  /* ---------- back / forward and shared links ---------- */
  function fromHash() {
    if (lightbox.isOpen()) lightbox.close();
    var h = location.hash.replace('#', '');
    state.article = h === 'alana-henderson';
    var next = keys.indexOf(h) !== -1 ? h : null;
    if (next && next !== state.open) state.from = phone.matches && state.menu ? 'menu' : 'home';
    state.open = next;
    if (!state.open && !phone.matches) state.menu = false;
    sync();
  }
  window.addEventListener('popstate', fromHash);

  var onPhoneChange = function () {
    if (!phone.matches) state.menu = false;
    sync();
  };
  // Safari 13 only supports addListener on media queries
  if (phone.addEventListener) phone.addEventListener('change', onPhoneChange); else phone.addListener(onPhoneChange);

  /* ---------- slideshow ---------- */
  var slideshow = (function () {
    var layers = Array.prototype.slice.call(hero.querySelectorAll('[data-slide-index]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide-to]'));
    var pauseBtn = hero.querySelector('[data-slide-pause]');
    var count = dots.length;
    var index = 0;
    var timer = null;
    var userPaused = reduced.matches;
    var hovering = false;   // mouse over the slide
    var focused = false;    // keyboard focus inside the hero
    var introDone = false;

    function go(i) {
      index = (i + count) % count;
      layers.forEach(function (el) {
        var on = Number(el.dataset.slideIndex) === index;
        el.classList.toggle('is-active', on);
        if (el.classList.contains('stage-layer')) el.inert = !on;
      });
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === index);
        if (n === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }
    function canRun() {
      return introDone && !userPaused && !hovering && !focused && !document.hidden &&
        !state.open && !state.menu && !state.article;
    }
    function check() {
      if (canRun()) { if (!timer) timer = window.setInterval(function () { go(index + 1); }, 7000); }
      else if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart() { if (timer) { window.clearInterval(timer); timer = null; } check(); }
    function step(n) { go(index + n); restart(); }
    function setPaused(p) {
      userPaused = p;
      pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false'); // label stays "Pause slideshow"
      check();
    }

    hero.querySelector('[data-slide-prev]').addEventListener('click', function () { step(-1); });
    hero.querySelector('[data-slide-next]').addEventListener('click', function () { step(1); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(Number(d.dataset.slideTo)); restart(); });
    });
    pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });

    heroStage.addEventListener('mouseenter', function () { hovering = true; check(); });
    heroStage.addEventListener('mouseleave', function () { hovering = false; check(); });
    hero.addEventListener('focusin', function () { focused = true; check(); });
    hero.addEventListener('focusout', function () { focused = false; check(); });
    document.addEventListener('visibilitychange', check);

    // swipe on phones
    var startX = null;
    heroStage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    heroStage.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      startX = null;
    });

    if (userPaused) setPaused(true);
    go(0);

    return {
      check: check,
      step: step,
      introFinished: function () { introDone = true; check(); }
    };
  })();

  /* ---------- first-visit intro ----------
     1. The studio photo full screen with the big logo easing in.
     2. The big logo shrinks and glides into the top-left corner, fading as it lands on the
        real corner logo; the photo layer dissolves and the site fades in underneath. */
  (function intro() {
    var root = document.documentElement;
    var screen = document.querySelector('.intro-screen');
    if (!root.classList.contains('has-intro') || !screen) { slideshow.introFinished(); return; }

    var big = screen.querySelector('.intro-screen__logo');
    var photoLayer = screen.querySelector('.intro-screen__photo');
    var timers = [];
    var leaving = false, finished = false;

    function cleanUp() {
      if (finished) return;
      finished = true;
      timers.forEach(window.clearTimeout);
      screen.remove();
      try { sessionStorage.setItem('hb-intro-seen', '1'); } catch (e) {}
      document.removeEventListener('pointerdown', skip);
      document.removeEventListener('keydown', skip);
      slideshow.introFinished();
    }
    function reveal() {
      root.classList.add('intro-done');
      root.classList.remove('has-intro');
    }
    function leave() {
      if (leaving) return;
      leaving = true;
      big.style.animation = 'none';
      void big.offsetWidth;
      var from = big.getBoundingClientRect();
      var to = hero.querySelector('.brand-logo').getBoundingClientRect();
      var scale = to.width / from.width;
      big.style.transformOrigin = '0 0';
      big.style.transition = 'transform 1.2s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.45s cubic-bezier(0.65, 0, 0.35, 1) 0.85s';
      void big.offsetWidth;
      big.style.transform = 'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px) scale(' + scale + ')';
      big.style.opacity = '0';
      screen.classList.add('is-leaving');
      reveal();
      timers.push(window.setTimeout(cleanUp, 1400));
    }
    function skip() { reveal(); cleanUp(); }
    function start() { timers.push(window.setTimeout(leave, 1900)); }

    // any click or key skips it
    document.addEventListener('pointerdown', skip);
    document.addEventListener('keydown', skip);

    // wait for the logo and the photo, so it never starts on a blank screen
    var pending = 0, started = false;
    function ready() { if (--pending <= 0 && !started) { started = true; start(); } }
    [big, photoLayer].forEach(function (img) {
      if (!img || img.complete) return;
      pending++;
      img.addEventListener('load', ready);
      img.addEventListener('error', ready);
    });
    if (pending === 0) { started = true; start(); }
    timers.push(window.setTimeout(function () { if (!started) { started = true; start(); } }, 1800));
    timers.push(window.setTimeout(skip, 7000)); // safety net
  })();

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- photo lightbox (gallery + producers) ---------- */
  var lightbox = (function () {
    var box = document.getElementById('lightbox');
    var img = box.querySelector('.lightbox__img');
    var count = box.querySelector('.lightbox__count');
    var text = box.querySelector('.lightbox__text');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    // photos are grouped (gallery, people) so the arrows only step through their own set
    var groups = {};
    buttons.forEach(function (b) {
      var g = b.dataset.lightbox;
      var i = b.querySelector('img');
      var host = b.closest('figure, .person');
      var cap = host && host.querySelector('figcaption, h3');
      groups[g] = groups[g] || [];
      b._lightboxIndex = groups[g].length;
      groups[g].push({ src: b.dataset.full, alt: i.getAttribute('alt'), caption: cap ? cap.textContent : '' });
    });
    var items = [];
    var index = 0, open = false, opener = null;
    box.inert = true;

    // use the WebP version when the browser picked WebP for the page's own images
    function bestSrc(src) {
      var probe = document.querySelector('.brand-logo');
      var webp = probe && /\.webp(\?|$)/.test(probe.currentSrc || '');
      return webp ? src.replace(/\.jpe?g$/, '.webp') : src;
    }
    function show(i) {
      index = (i + items.length) % items.length;
      var it = items[index];
      img.classList.add('is-swapping');
      var swap = function () {
        img.src = bestSrc(it.src); img.alt = it.alt;
        text.textContent = it.caption && it.alt.indexOf(it.caption) === -1 ? it.caption + ' · ' + it.alt : it.alt;
        count.textContent = pad(index + 1) + ' / ' + pad(items.length);
        window.requestAnimationFrame(function () { img.classList.remove('is-swapping'); });
      };
      if (open) window.setTimeout(swap, 150); else swap();
    }
    function openAt(i, trigger) {
      opener = trigger;
      show(i);
      open = true;
      box.classList.add('is-open');
      box.inert = false;
      site.inert = true;
      focusSoon(box.querySelector('.lightbox__close'));
    }
    function close() {
      open = false;
      box.classList.remove('is-open');
      box.inert = true;
      site.inert = false;
      focusSoon(opener);
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { items = groups[b.dataset.lightbox]; openAt(b._lightboxIndex, b); });
    });
    box.querySelector('[data-lightbox-prev]').addEventListener('click', function () { show(index - 1); });
    box.querySelector('[data-lightbox-next]').addEventListener('click', function () { show(index + 1); });
    Array.prototype.forEach.call(box.querySelectorAll('[data-lightbox-close]'), function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    var sx = null;
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      sx = null;
    });
    return { isOpen: function () { return open; }, close: close };
  })();

  /* ---------- contact form -> email app ----------
     (Swap for a form service such as Formspree at launch: see README.) */
  var form = document.getElementById('book-form');
  var note = document.getElementById('form-note');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var subject = 'Enquiry: ' + d.get('session') + ' (' + d.get('name') + ')';
    var body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') +
      '\nSession type: ' + d.get('session') + '\n\n' + (d.get('message') || '');
    window.location.href = 'mailto:info@halfbapstudios.com?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    note.textContent = 'Opening your email app. If nothing happens, email info@halfbapstudios.com.';
  });

  /* ---------- start ---------- */
  fromHash();
})();
