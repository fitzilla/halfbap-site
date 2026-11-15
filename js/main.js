/* Half Bap Recording Studios
   - Desktop: strips on the right expand sideways into panels.
   - Phone (< 900px): Menu opens a drawer; each item slides in a full-screen page.
   - Homepage slideshow (studio, Alana Henderson) with dots, arrows, pause and autoplay.
   - Full-screen article overlay.
   - Booking form opens the visitor's email app (no server needed). */
(function () {
  'use strict';

  var site = document.getElementById('site');
  var hero = document.getElementById('main');
  var heroUi = hero.querySelector('.hero__ui');
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

  // Only move focus around for keyboard users (stops the focus ring flashing after a click)
  var keyboardUser = false;
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') keyboardUser = true; }, true);
  document.addEventListener('pointerdown', function () { keyboardUser = false; }, true);

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
    hero.querySelector('.hero__stage').inert = !!state.open;
    hero.querySelector('.hero__bottom').inert = !!state.open;
    hero.querySelector('.hero__contact').inert = !!state.open;
    hero.querySelector('.hero__feed').inert = !!state.open;
    stack.inert = state.article || (isPhone && state.menu && !state.open);

    document.documentElement.style.overflow = anyOverlay ? 'hidden' : '';
    slideshow.check();
  }

  function focusSoon(el) {
    if (!el || !keyboardUser) return;
    window.setTimeout(function () { el.focus({ preventScroll: true }); }, 60);
  }

  function setHash(hash) {
    var url = location.pathname + location.search + (hash ? '#' + hash : '');
    if (location.hash.replace('#', '') !== (hash || '')) history.pushState(null, '', url);
  }

  /* ---------- sections ---------- */
  function openSection(key, trigger) {
    if (keys.indexOf(key) === -1) return;
    lastTrigger = trigger || document.activeElement;
    state.from = phone.matches && state.menu ? 'menu' : 'home';
    state.article = false;
    state.open = key;
    sync();
    setHash(key);
    var strip = stripFor(key);
    strip.querySelector('.strip__body').scrollTop = 0;
    if (phone.matches) strip.scrollTop = 0;
    var close = phone.matches ? strip.querySelector('.mobilebar .close-btn') : strip.querySelector('.panel__close');
    focusSoon(close);
  }

  // The X takes you back to where you were: the menu if you came from it, otherwise the homepage.
  function closeSection(opts) {
    var was = state.open;
    var backToMenu = phone.matches && (opts && opts.backToMenu !== undefined ? opts.backToMenu : state.from === 'menu');
    opts = { backToMenu: backToMenu };
    state.open = null;
    state.menu = backToMenu;
    sync();
    setHash('');
    if (opts && opts.backToMenu) {
      focusSoon(drawer.querySelector('[data-open="' + was + '"]'));
    } else if (!phone.matches && was) {
      focusSoon(stripFor(was).querySelector('.strip__tab'));
    } else {
      focusSoon(phone.matches ? menuButton : lastTrigger);
    }
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
    if (t.hasAttribute('data-home')) {
      e.preventDefault();
      if (lightbox.isOpen()) lightbox.close();
      state.open = null; state.menu = false; state.article = false;
      sync(); setHash('');
      return;
    }
    if (t.hasAttribute('data-open')) {
      // a service row pre-picks that service in the contact form
      if (t.dataset.session) {
        var select = form.querySelector('select[name="session"]');
        if (select) select.value = t.dataset.session;
      }
      openSection(t.getAttribute('data-open'), t);
      return;
    }
    if (t.hasAttribute('data-back')) { closeSection({ backToMenu: true }); return; }
    if (t.hasAttribute('data-close')) { closeSection(); return; }
    if (t === menuButton) { openMenu(); return; }
    if (t.hasAttribute('data-close-menu')) { closeMenu(); return; }
    if (t.hasAttribute('data-open-article')) { openArticle(t); return; }
    if (t.hasAttribute('data-close-article')) { closeArticle(); return; }
  });

  // Left / right arrow keys: with a panel open, step through the sections (wraps round);
  // on the homepage, move the slideshow. Ignored while typing, and the lightbox keeps its own arrows.
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
      var next = keys[(i + step + keys.length) % keys.length];
      state.from = phone.matches ? state.from : 'home';
      openSection(next);
    } else {
      hero.querySelector(step > 0 ? '[data-slide-next]' : '[data-slide-prev]').click();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lightbox.isOpen()) lightbox.close();
    else if (state.article) closeArticle();
    else if (state.open) closeSection();
    else if (state.menu) closeMenu();
  });

  function fromHash() {
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
  // Safari 13 and older only support addListener on media queries
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
    var hovering = false;
    var introDone = false;

    function go(i) {
      index = (i + count) % count;
      hero.dataset.slide = String(index);
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
      return introDone && !userPaused && !hovering && !document.hidden &&
        !state.open && !state.menu && !state.article;
    }
    function check() {
      if (canRun()) { if (!timer) timer = window.setInterval(function () { go(index + 1); }, 7000); }
      else if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart() { if (timer) { window.clearInterval(timer); timer = null; } check(); }
    function setPaused(p) {
      userPaused = p;
      pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
      check();
    }

    hero.querySelector('[data-slide-prev]').addEventListener('click', function () { go(index - 1); restart(); });
    hero.querySelector('[data-slide-next]').addEventListener('click', function () { go(index + 1); restart(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(Number(d.dataset.slideTo)); restart(); });
    });
    pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });

    var stage = hero.querySelector('.hero__stage');
    stage.addEventListener('mouseenter', function () { hovering = true; check(); });
    stage.addEventListener('mouseleave', function () { hovering = false; check(); });
    hero.addEventListener('focusin', function () { hovering = true; check(); });
    hero.addEventListener('focusout', function () { hovering = false; check(); });
    document.addEventListener('visibilitychange', check);

    // swipe on phones
    var startX = null;
    stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
      startX = null;
    });

    if (userPaused) setPaused(true);
    go(0);

    return {
      check: check,
      introFinished: function () { introDone = true; check(); }
    };
  })();

  /* ---------- first-visit intro ----------
     1. The studio photo full screen with the big logo easing in.
     2. The big logo fades out while shrinking in place, the photo layer dissolves,
        and the rest of the site (corner logo, strips, headline, controls) fades in underneath. */
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
      // measure where the big logo is and where the corner logo sits
      big.style.animation = 'none';
      void big.offsetWidth;
      var from = big.getBoundingClientRect();
      var to = hero.querySelector('.brand-logo').getBoundingClientRect();
      var scale = to.width / from.width;
      var dx = to.left - from.left, dy = to.top - from.top;
      // glide + shrink into the corner, fading out as it arrives (the real corner logo fades in on the same spot)
      big.style.transformOrigin = '0 0';
      big.style.transition = 'transform 1.2s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.45s cubic-bezier(0.65, 0, 0.35, 1) 0.85s';
      void big.offsetWidth;
      big.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';
      big.style.opacity = '0';
      screen.classList.add('is-leaving');
      reveal();
      timers.push(window.setTimeout(cleanUp, 1400));
    }
    function skip() { reveal(); cleanUp(); }

    // let the logo ease in fully and settle before the hand-off
    function start() { timers.push(window.setTimeout(leave, 1900)); }

    // any click or key skips it
    document.addEventListener('pointerdown', skip);
    document.addEventListener('keydown', skip);

    // wait for both the logo and the studio photo, so it never starts on a blank screen
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

  /* ---------- gallery lightbox ---------- */
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
      groups[g].push({ src: b.dataset.full || i.getAttribute('src'), alt: i.getAttribute('alt'), caption: cap ? cap.textContent : '' });
    });
    var items = [];
    var index = 0, open = false, opener = null;
    box.inert = true;

    function show(i) {
      index = (i + items.length) % items.length;
      var it = items[index];
      img.classList.add('is-swapping');
      var swap = function () {
        img.src = it.src; img.alt = it.alt;
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
      slideshow.check();
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

  /* ---------- booking form -> email app ---------- */
  var form = document.getElementById('book-form');
  var note = document.getElementById('form-note');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
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
