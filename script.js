/* Balamurugan Devadarshan — portfolio. Vanilla JavaScript, no libraries. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOUCH = window.matchMedia('(hover: none)').matches;
  var GH = 'https://github.com/devadd2105-max';
  var ORDER = ['home', 'about', 'leadership', 'projects', 'programmes', 'awards', 'credentials', 'photography', 'contact'];
  var LABEL = { home: 'Home', about: 'About', leadership: 'Leadership', projects: 'Projects', programmes: 'Programmes', awards: 'Awards', credentials: 'Service', photography: 'Photos', contact: 'Contact' };
  var app = $('#main'), dock = $('#dock'), ind = $('#ind');
  var cur = null, counted = false;

  /* ---------- toast ---------- */
  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 2200);
  }

  /* ---------- router ---------- */
  function setInd() {
    var b = $('button[aria-current="page"]', dock); if (!b) return;
    ind.style.width = b.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + b.offsetLeft + 'px)';
    var target = b.offsetLeft - (dock.clientWidth - b.offsetWidth) / 2;
    if (dock.scrollWidth > dock.clientWidth) dock.scrollTo({ left: target, behavior: RM ? 'auto' : 'smooth' });
  }
  function go(id, push) {
    if (ORDER.indexOf(id) < 0) id = 'home';
    if (id === cur) return;
    var dir = cur ? (ORDER.indexOf(id) > ORDER.indexOf(cur) ? 1 : -1) : 1;
    app.style.setProperty('--dir', dir);
    ORDER.forEach(function (k) {
      var v = document.getElementById(k), on = k === id;
      v.classList.toggle('active', on);
      if (on) v.scrollTop = 0;
      v.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    $$('button[data-go]', dock).forEach(function (b) {
      if (b.dataset.go === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    cur = id;
    document.title = (id === 'home' ? 'Balamurugan Devadarshan | Portfolio' : LABEL[id] + ' | Balamurugan Devadarshan');
    if (push !== false) { try { history.pushState(null, '', '#' + id); } catch (e) { location.hash = id; } }
    if (push !== false && window.goatcounter && window.goatcounter.count) { try { window.goatcounter.count({ path: '/' + id, title: id.charAt(0).toUpperCase() + id.slice(1) }); } catch (e) {} }
    requestAnimationFrame(setInd); setTimeout(setInd, 80); setTimeout(setInd, 400);
    if (id === 'home') runCounters();
    netRun(id === 'home');
    if (window.vfRun) window.vfRun(id === 'home');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]'); if (!a) return;
    e.preventDefault(); closeAll(); go(a.dataset.go);
    if (a.dataset.role != null) { var rt = document.getElementById('lt' + a.dataset.role); if (rt) rt.click(); }
    if (a.dataset.tab != null) { var pt = document.getElementById('pt' + a.dataset.tab); if (pt) pt.click(); }
  });
  window.addEventListener('popstate', function () { go(location.hash.slice(1), false); });
  window.addEventListener('hashchange', function () { go(location.hash.slice(1), false); });
  window.addEventListener('resize', setInd);

  /* ---------- counters ---------- */
  function runCounters() {
    if (counted) return; counted = true;
    $$('[data-count]').forEach(function (el) {
      var n = +el.dataset.count, suf = el.dataset.suf || '';
      if (RM) { el.textContent = n + suf; return; }
      var t0 = performance.now(), d = 900;
      (function step(t) {
        var p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(n * e) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* ---------- typed roles ---------- */
  (function () {
    var el = $('#typed'); if (!el || RM) return;
    var roles = ['Python', 'Cybersecurity', 'Team leadership', 'Public speaking', 'Photography', 'Capture the flag', 'Avid reader', 'Proud Holmesian'];
    var i = 0, j = 0, del = false;
    (function tick() {
      var w = roles[i];
      el.textContent = w.slice(0, j);
      if (!del && j < w.length) { j++; setTimeout(tick, 80); }
      else if (!del) { del = true; setTimeout(tick, 1400); }
      else if (j > 0) { j--; setTimeout(tick, 38); }
      else { del = false; i = (i + 1) % roles.length; setTimeout(tick, 250); }
    })();
  })();

  /* ---------- name scramble ---------- */
  (function () {
    var h = $('#hero-title'); if (!h) return;
    h.setAttribute('aria-label', 'Balamurugan Devadarshan');
    $$('[data-scr]', h).forEach(function (s) { s.setAttribute('aria-hidden', 'true'); });
    if (RM) return;
    var pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/_#';
    function scramble(el, delay) {
      var txt = el.textContent, t0 = performance.now() + delay, dur = 650;
      el.textContent = txt.replace(/./g, ' ');
      (function f(t) {
        var p = Math.max(0, Math.min(1, (t - t0) / dur)), k = Math.floor(p * txt.length), out = '';
        for (var i = 0; i < txt.length; i++) out += i < k ? txt[i] : (p === 0 ? ' ' : pool[Math.floor(Math.random() * pool.length)]);
        el.textContent = out;
        if (p < 1) requestAnimationFrame(f); else el.textContent = txt;
      })(performance.now());
    }
    var els = $$('[data-scr]', h);
    els.forEach(function (el, i) { scramble(el, i * 200); });
  })();

  /* ---------- particle network (home only, light, self-disabling on slow machines) ---------- */
  var netRun = function () {};
  (function () {
    var cv = $('#net'), ctx = cv.getContext('2d'), W, H, pts = [], mx = -999, my = -999, raf = 0, on = false;
    var cs = getComputedStyle(cv), dotC = cs.color, lineC = cs.getPropertyValue('--net-b').trim() || 'rgba(120,170,235,.5)';
    var root = document.documentElement, frames = 0, slow = 0, last = 0;
    if (true || RM || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) || (navigator.deviceMemory && navigator.deviceMemory < 4)) { root.classList.add('lite'); return; }
    function size() {
      W = cv.width = innerWidth; H = cv.height = innerHeight;
      var n = Math.min(55, Math.round(innerWidth * innerHeight / 26000));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.4 + .8 });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var link = 120, l2 = link * link;
      ctx.lineWidth = 1; ctx.strokeStyle = lineC; ctx.globalAlpha = .28; ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 14400 && d2 > 0) { var d = Math.sqrt(d2); p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ax = p.x - q.x, ay = p.y - q.y;
          if (ax * ax + ay * ay < l2) { ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
        }
      }
      ctx.stroke();
      ctx.globalAlpha = .8; ctx.fillStyle = dotC; ctx.beginPath();
      for (var k = 0; k < pts.length; k++) { var r = pts[k]; ctx.moveTo(r.x + r.r, r.y); ctx.arc(r.x, r.y, r.r, 0, 6.2832); }
      ctx.fill(); ctx.globalAlpha = 1;
    }
    function loop(t) {
      if (!on) return;
      if (last) {
        var dt = t - last; frames++;
        if (frames > 20 && dt > 34) slow++;
        if (frames === 120) { if (slow > 40) { on = false; root.classList.add('lite'); return; } slow = 0; frames = 20; }
      }
      last = t; draw(); raf = requestAnimationFrame(loop);
    }
    netRun = function (v) {
      if (root.classList.contains('lite')) return;
      if (v && !on) { on = true; last = 0; cv.style.opacity = 1; raf = requestAnimationFrame(loop); }
      else if (!v && on) { on = false; cancelAnimationFrame(raf); cv.style.opacity = .25; }
    };
    size(); draw();
    addEventListener('resize', function () { size(); draw(); });
    addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) netRun(false); else netRun(cur === 'home'); });
  })();

  /* ---------- spotlight, glow, tilt, magnetic ---------- */
  (function () {
    var pend = null;
    addEventListener('pointermove', function (e) {
      pend = e; if (pend._q) return; pend._q = true;
      requestAnimationFrame(function () {
        var ev = pend; if (!ev) return;
        if (false) {
          var t = ev.target.closest && ev.target.closest('.vf-frame');
          if (t) { var b = t.getBoundingClientRect(), px = (ev.clientX - b.left) / b.width - .5, py = (ev.clientY - b.top) / b.height - .5; t.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg'); t.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg'); }
          var m = ev.target.closest && ev.target.closest('.mag');
          if (m) { var mb = m.getBoundingClientRect(); m.style.transform = 'translate(' + ((ev.clientX - mb.left - mb.width / 2) * .22).toFixed(1) + 'px,' + ((ev.clientY - mb.top - mb.height / 2) * .3).toFixed(1) + 'px)'; }
        }
        pend = null;
      });
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var t = e.target.closest && e.target.closest('.tilt'); if (t && !t.contains(e.relatedTarget)) { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); }
      var m = e.target.closest && e.target.closest('.mag'); if (m && !m.contains(e.relatedTarget)) m.style.transform = '';
    });
  })();

  /* ---------- tablist helper ---------- */
  function tablist(list, cb) {
    if (!list) return;
    function tabs() { return $$('[role="tab"]', list); }
    function sel(t, focus) {
      tabs().forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
        var pid = x.getAttribute('aria-controls'); if (pid) { var p = document.getElementById(pid); if (p) p.hidden = !on; }
      });
      if (focus) t.focus();
      if (cb) cb(t);
    }
    tabs().forEach(function (t) { t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1; });
    list.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[role="tab"]'); if (t && list.contains(t)) sel(t); });
    list.addEventListener('keydown', function (e) {
      var t = e.target.closest && e.target.closest('[role="tab"]'); if (!t) return;
      var all = tabs(), i = all.indexOf(t), n = null, k = e.key, L = all.length;
      if (k === 'ArrowDown' || k === 'ArrowRight') n = all[(i + 1) % L];
      else if (k === 'ArrowUp' || k === 'ArrowLeft') n = all[(i - 1 + L) % L];
      else if (k === 'Home') n = all[0]; else if (k === 'End') n = all[L - 1];
      if (n) { e.preventDefault(); e.stopPropagation(); sel(n, true); }
    });
  }
  tablist($('#rl'), function (t) {
    if (innerWidth <= 820) { var p = document.getElementById(t.getAttribute('aria-controls')); if (p && p.scrollIntoView) p.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  });
  tablist($('#crt'));
  tablist($('#mmt'));
  tablist($('#prt'));
  tablist($('#cft'));
  /* more code excerpts: fetched the first time the Code tab is opened, so the page itself stays light */
  (function () {
    var pt = document.getElementById('pt1'), done = false;
    function load() {
      if (done) return; done = true;
      fetch('code-more.json?v=fast19').then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (d) {
        var tl = document.getElementById('cft'), pl = tl && tl.parentNode.querySelector('.cpanels');
        if (!tl || !pl) return;
        tl.insertAdjacentHTML('beforeend', d.tabs); pl.insertAdjacentHTML('beforeend', d.panels);
      }).catch(function () { done = false; });
    }
    if (pt) { pt.addEventListener('click', load); pt.addEventListener('focus', load, { once: true }); }
    if (location.hash === '#projects' && pt && pt.getAttribute('aria-selected') === 'true') load();
  })();
  tablist($('#awf'), function (t) {
    var f = t.dataset.f, n = 0;
    $$('#awgrid .award').forEach(function (a) {
      var show = f === 'all' || a.dataset.cat.split(' ').indexOf(f) > -1;
      a.hidden = !show; if (show) n++;
    });
    $('#awn').textContent = n;
  });
  tablist($('#phf'), function (t) {
    var f = t.dataset.f;
    $$('#masonry .shot').forEach(function (s) { s.hidden = !(f === 'all' || s.dataset.cat === f); });
  });

  /* ---------- project modal ---------- */
  var modal = $('#modal'), lastFocus = null;
  function openModal(id) {
    var src = document.getElementById(id); if (!src) return;
    lastFocus = document.activeElement;
    $('#mt').textContent = src.dataset.title; $('#mb').innerHTML = src.innerHTML;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); $('#mx').focus();
  }
  function closeModal() {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-modal]').forEach(function (b) { b.addEventListener('click', function () { openModal(b.dataset.modal); }); });
  $('#mx').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  /* ---------- photo lightbox (viewfinder) ---------- */
  var lb = $('#lb'), lbi = $('#lbi'), lbc = $('#lbc'), lbt = $('#lbt'), film = $('#film'), lbg = $('#lbg'), lcur = 0, lfocus = null, fbuilt = '';
  function vis() { return $$('#masonry .shot').filter(function (s) { return !s.hidden; }); }
  function buildFilm(v) {
    var key = v.length + ':' + (v[0] && v[0].querySelector('a').getAttribute('href')); if (key === fbuilt) return; fbuilt = key;
    film.innerHTML = '';
    v.forEach(function (s, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Frame ' + (i + 1));
      var im = document.createElement('img'); im.src = $('img', s).getAttribute('src'); im.alt = ''; im.loading = 'lazy'; b.appendChild(im);
      b.addEventListener('click', function () { lshow(i); }); film.appendChild(b);
    });
  }
  function lshow(i) {
    var v = vis(); if (!v.length) return;
    lcur = (i + v.length) % v.length; buildFilm(v);
    var a = $('a', v[lcur]); lbi.src = a.getAttribute('href'); lbi.alt = $('img', v[lcur]).alt;
    var cap = a.dataset.cap.split(' · '); lbt.textContent = cap[0];
    lbc.textContent = (cap[1] || '') + '  ·  ' + ('0' + (lcur + 1)).slice(-2) + ' / ' + ('0' + v.length).slice(-2);
    $$('button', film).forEach(function (b, k) { b.classList.toggle('on', k === lcur); if (k === lcur && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center' }); });
  }
  function lopen(i) { lfocus = document.activeElement; lb.classList.add('open'); lshow(i); $('#lbx').focus(); }
  function lclose() { if (!lb.classList.contains('open')) return; lb.classList.remove('open'); lbi.removeAttribute('src'); if (lfocus) lfocus.focus(); }
  function lgrid() { var on = lb.classList.toggle('grid'); lbg.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  $$('#masonry .shot').forEach(function (s, n) {
    var f = s.querySelector('figcaption'); if (f) { var nn = document.createElement('span'); nn.className = 'n mono'; nn.textContent = ('0' + (n + 1)).slice(-2); s.querySelector('a').appendChild(nn); }
    $('a', s).addEventListener('click', function (e) { e.preventDefault(); lopen(vis().indexOf(s)); });
  });
  $('#lbx').addEventListener('click', lclose);
  $('#lbp').addEventListener('click', function () { lshow(lcur - 1); });
  $('#lbn').addEventListener('click', function () { lshow(lcur + 1); });
  lbg.addEventListener('click', lgrid);
  document.addEventListener('keydown', function (e) { if (lb.classList.contains('open') && (e.key === 'g' || e.key === 'G')) { e.stopPropagation(); lgrid(); } }, true);
  lb.addEventListener('click', function (e) { if (e.target === lb) lclose(); });

  /* ---------- hero viewfinder rotation ---------- */
  (function () {
    var imgs = $$('#vf .vfi'); if (imgs.length < 2) return;
    var i = 0, t = null, bar = $('#vfb'), n = $('#vfn'), l = $('#vfl'), tt = $('#vft'), D = 4200;
    var bd = $('#vfbd'), vc = $('#vfc'); if (vc) vc.textContent = '0' + imgs.length;
    function backdrop() { if (bd) bd.style.backgroundImage = 'url("' + imgs[i].getAttribute('src') + '")'; }
    backdrop();
    function show(k) {
      imgs[i].classList.remove('on'); i = k % imgs.length; imgs[i].classList.add('on');
      n.textContent = '0' + (i + 1); backdrop(); l.textContent = imgs[i].dataset.l; tt.textContent = imgs[i].dataset.t;
      var ca = document.querySelector('#vf .vf-cap a'), g = imgs[i].dataset.go || 'photography';
      if (ca) { ca.setAttribute('href', '#' + g); ca.setAttribute('data-go', g); ca.innerHTML = (imgs[i].dataset.link || 'Open the gallery') + ' &rarr;'; }
      bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    }
    function start() { if (RM || t) return; t = setInterval(function () { show(i + 1); }, D); document.getElementById('vf').classList.add('run'); }
    function stop() { clearInterval(t); t = null; document.getElementById('vf').classList.remove('run'); }
    window.vfRun = function (on) { if (on) start(); else stop(); };
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (cur === 'home') start(); });
    if (document.getElementById('home').classList.contains('active')) start();
  })();

  /* ---------- password strength lab ---------- */
  /* STRENGTH:BEGIN */
  var COMMON = ['password', 'qwerty', 'letmein', 'welcome', 'admin', 'iloveyou', 'monkey', 'dragon', 'sherlock', 'singapore'];
  function strength(pw) {
    var pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/[0-9]/.test(pw)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
    var bits = pw.length && pool ? pw.length * Math.log2(pool) : 0;
    var low = pw.toLowerCase();
    var common = COMMON.some(function (w) { return low.indexOf(w) > -1; });
    var seq = /(abc|bcd|cde|123|234|345|456|567|678|789|qwe|wer|ert)/i.test(pw);
    var rep = /(.)\1\1/.test(pw);
    if (common) bits = Math.min(bits, 20);
    if (seq) bits -= 8;
    if (rep) bits -= 8;
    bits = Math.max(0, bits);
    var secs = Math.pow(2, bits) / 1e10;
    return { bits: bits, secs: secs, common: common, seq: seq, rep: rep, pool: pool };
  }
  /* STRENGTH:END */
  (function () {
    var inp = $('#pw'); if (!inp) return;
    function human(s) {
      if (s < 1) return 'instantly'; if (s < 60) return Math.round(s) + ' seconds';
      if (s < 3600) return Math.round(s / 60) + ' minutes'; if (s < 86400) return Math.round(s / 3600) + ' hours';
      if (s < 31557600) return Math.round(s / 86400) + ' days'; if (s < 3.15576e9) return Math.round(s / 31557600) + ' years';
      return 'centuries';
    }
    function upd() {
      var pw = inp.value, r = strength(pw), m = $('#pwm'), c = $('#pwc');
      var pct = Math.min(100, r.bits / 80 * 100), v = r.bits < 28 ? 'Weak' : r.bits < 45 ? 'Fair' : r.bits < 60 ? 'Good' : 'Strong';
      if (!pw) { v = '–'; pct = 0; }
      m.style.width = pct + '%'; m.style.background = r.bits < 28 ? '#ff6b6b' : r.bits < 45 ? '#FDC500' : '#4ade80';
      $('#pwv').textContent = v; $('#pwe').textContent = Math.round(r.bits) + ' bits';
      $('#pwt').textContent = pw ? human(r.secs) : '–';
      var chk = [[pw.length >= 12, 'At least 12 characters'], [/[a-z]/.test(pw) && /[A-Z]/.test(pw), 'Upper and lower case'], [/[0-9]/.test(pw) && /[^a-zA-Z0-9]/.test(pw), 'Numbers and symbols'], [pw && !r.common, 'Not a common word'], [pw && !r.seq && !r.rep, 'No sequences or repeats']];
      c.innerHTML = ''; chk.forEach(function (x) { var li = document.createElement('li'); li.className = x[0] ? 'ok' : 'no'; li.textContent = (x[0] ? '✓ ' : '✗ ') + x[1]; c.appendChild(li); });
    }
    inp.addEventListener('input', upd); upd();
  })();

  /* ---------- contact reveal ---------- */
  function dec(r) { return r.split('').reverse().join(''); }
  function copy(text, msg) {
    function ok() { toast(msg || 'Copied'); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { fallback(); });
    else fallback();
    function fallback() { var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('Press Ctrl+C to copy'); } t.remove(); }
  }
  function revealCard(c) {
    var r = dec(c.dataset.r), kind = c.dataset.kind, val = $('.val', c), row = $('.row', c);
    var shown = kind === 'tel' ? r.replace(/(\d{4})(\d{4})/, '$1 $2') : r;
    var href = kind === 'tel' ? 'tel:+65' + r : 'mailto:' + r;
    val.innerHTML = ''; var a = document.createElement('a'); a.href = href; a.textContent = shown; val.appendChild(a);
    row.innerHTML = '';
    var cb = document.createElement('button'); cb.type = 'button'; cb.className = 'btn primary sm'; cb.textContent = 'Copy';
    cb.addEventListener('click', function () { copy(shown, 'Copied ' + shown); });
    row.appendChild(cb);
  }
  $$('.cc[data-r]').forEach(function (c) { $('[data-act="reveal"]', c).addEventListener('click', function () { revealCard(c); }); });

  /* ---------- terminal ---------- */
  var drawer = $('#drawer'), out = $('#out'), cmd = $('#cmd'), termInit = false, hist = [], hi = 0;
  var proMail = function () { return dec($('.cc[data-r]').dataset.r); };
  var phMail = function () { return dec($$('.cc[data-r]')[1].dataset.r); };
  var DATA = {
    help: 'ABOUT ME\n  whoami  skills  reading  leadership  projects  awards  credentials  contact  cv\n\nGITHUB\n  repos            all 19 repositories (public and private)\n  open <repo>      open a public repo on GitHub, e.g. open focal\n  search <word>    find repos by name or description\n  langs            language share across my public repos\n  latest           my most recent push\n  github           my GitHub account\n\nTOOLS\n  password [n]     make a random password (default 16, runs on your device)\n  hash <text>      SHA-256 of some text\n  b64 <text>       Base64 encode      unb64 <text>   decode\n  caesar <n> <text>  shift letters by n (rot13 = caesar 13)\n  tip              a cybersecurity tip\n\nSITE\n  goto <page>      home, about, leadership, projects, programmes, awards, credentials, photography, contact\n  ls  pwd  cd <page>  random  stats  neofetch  uptime  date\n  theme [dark|light]  history  echo <text>  clear  exit\n\nFUN\n  ctf  hack  ask <q> (when enabled)',
    whoami: 'Balamurugan Devadarshan (goes by Devadarshan)\nStudent, St. Andrew\'s Junior College, Singapore.\nPresident of the Infocomm Club. Python, cybersecurity, public speaking, photography.\nAvid reader and proud Holmesian.\nGoal: cybersecurity and technology, with an open mind about where it leads.',
    skills: 'Technical:   Python, JavaScript/HTML/CSS, networking basics, CTF, data fundamentals\nDomain:      cybersecurity fundamentals, safe online practices\nPeople:      team leadership, public speaking, event hosting, duty rotation planning, teaching, photography\nBeyond:      Tamil speech, Taekwondo (green belt), swimming (silver), guitar (beginner), reading',
    reading: 'Avid reader. Proud Holmesian: a devoted Sherlock Holmes fan.',
    leadership: '2026-now   President, Infocomm Club (St. Andrew\'s JC)\n2026       ChrySAlis 2026, leaders\' programme (SAJC)\n2018-26    Class Committee roles (ICT, Biology, Literature, Classroom Care, Economics)\n2024-25    Head of Photography, Publications & Media Club (180+ hours behind the lens)\n2022-25    Student Council, Bonding / Welfare / Events committees\n2023-25    Science Ambassador (Compost Bin Rep)\n2024       Capture Beginnings, student-initiated photography course\n2022-24    Debate, member\n2016-21    Senior Prefect, Prefectorial Board (primary school)',
    projects: 'SG Wayfinder   Singapore navigation game: locate, plan, predict (GitHub)\nClearway       lunar mission browser, NASA Space Apps 2026 (GitHub)\nCasebook 221B   Victorian detective game, play as Holmes (GitHub)\nCrack the Password   how fast a password falls (GitHub)\nFocal          browser photo coach (GitHub)\nI-Think        control a Windows laptop from an iPad, encrypted (private repo)\nThis portfolio  hand-written site, no framework (GitHub)\nFlag Lab       CTF practice kit, 26 puzzles easy to hard (GitHub)\n(programmes, competitions and events are on the Programmes page)',
    awards: (document.querySelectorAll('.award').length) + ' awards and certificates, ' + document.querySelectorAll('.award[data-cat~="podium"]').length + ' podium finishes. Highlights:\n  1st  Literary Confluence speech competition (2023)\n  1st  Mother Tongue Fortnight (2024)\n  1st  MTL Fortnight Tamil singing (2017)\n  3rd  Cyber Sports Day CTF, 2nd Runner-Up (2026)\nSee the Awards page for every one, with dates.',
    credentials: 'Earned:  ICDL Big Data, seeNTU Python, Sentinel coursework (100%), Certificate of Distinction\nPlanned: Google Cybersecurity Certificate, CS50 Cybersecurity, CS50P, Fortinet NSE 1-2, Cisco Cybersecurity Essentials, TryHackMe',
    github: GH + '\n  ' + GH + '/sg-WayFinder\n  ' + GH + '/Clearway'
  };
  function line(t, cls) { var d = document.createElement('div'); if (cls) d.className = cls; d.textContent = t; out.appendChild(d); out.scrollTop = out.scrollHeight; }
  function run(raw) {
    var c = raw.trim(); if (!c) return;
    line('$ ' + c, 'u'); hist.push(c); hi = hist.length;
    var lc = c.toLowerCase(), parts = lc.split(/\s+/);
    if (lc === 'clear') { out.innerHTML = ''; return; }
    if (lc === 'hack') { line('Initialising... follow the white rabbit.'); setTimeout(matrix, 500); return; }
    if (lc === 'contact') { line('Professional: ' + proMail() + '\nPhotography:  ' + phMail() + '\nGitHub:       ' + GH + '\nPhone: open the Contact page and tap Reveal.'); return; }
    if (parts[0] === 'goto' && parts[1]) { var t = parts[1] === 'photos' ? 'photography' : parts[1]; if (ORDER.indexOf(t) > -1) { line('Opening ' + t + '...'); go(t); } else line('Unknown page: ' + parts[1], 'e'); return; }
    if (lc.indexOf('sudo') === 0) { line('Permission granted. Opening contact...'); setTimeout(function () { go('contact'); }, 600); return; }
    if (parts[0] === 'ask') {
      var q = c.slice(3).trim(); if (!q) { line('Usage: ask <question about Devadarshan>'); return; }
      if (!window.ASK_URL) { line('AI answers are switched off on this site. (The owner can enable them with a private proxy; see README.)'); return; }
      line('Thinking...');
      fetch(window.ASK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q.slice(0, 300) }) })
        .then(function (r) { return r.json(); }).then(function (j) { line(String(j.answer || 'No answer.').slice(0, 1200)); })
        .catch(function () { line('Could not reach the assistant.', 'e'); });
      return;
    }
    if (parts[0] === 'ctf') {
      if (!parts[1]) { line('Challenge (Caesar shift 3): GHYD{HOHPHQWDUB}\nDecode it, then run: ctf <answer>'); return; }
      if (parts.slice(1).join('').toUpperCase() === 'DEVA{ELEMENTARY}') line('Flag captured: DEVA{ELEMENTARY}. Elementary, my dear reader.'); else line('Not quite. Shift each letter back by 3.', 'e'); return;
    }
    if (lc === 'sudo' || lc.indexOf('sudo ') === 0) { line('Nice try. This user is not in the sudoers file. This incident will be reported (to nobody).', 'e'); return; }
    if (lc === 'cv') { window.dispatchEvent(new Event('print-cv')); line('Opening the print dialog. Choose Save as PDF.'); return; }
    if (lc === 'ls') { line(ORDER.join('  ')); return; }
    /* ---- extra terminal commands ---- */
    var args = c.split(/\s+/).slice(1).join(' ');
    function repoList() {
      return $$('.repomini .rrow').map(function (r) {
        var n = r.querySelector('b').textContent.trim(), p = /private/i.test(r.querySelector('small').textContent);
        return { name: n, priv: p };
      });
    }
    function ghCache() { try { return JSON.parse(sessionStorage.getItem('ghr') || 'null'); } catch (e) { return null; } }
    function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
    function shift(str, n) {
      return str.replace(/[a-z]/gi, function (ch) { var b = ch <= 'Z' ? 65 : 97; return String.fromCharCode((ch.charCodeAt(0) - b + n % 26 + 26) % 26 + b); });
    }
    var TIPS = [
      'Use a different password for every account. A password manager makes that realistic.',
      'Turn on two-step verification, and prefer an authenticator app over SMS codes.',
      'Length beats cleverness: a long passphrase is harder to guess than a short symbol-heavy word.',
      'Phishing works by urgency. Pause, then go to the site yourself instead of tapping the link.',
      'Keep your phone and apps updated. Most attacks use bugs that already have a fix.',
      'Check the full address before you sign in. paypa1.com is not paypal.com.',
      'Never share a one-time code with anyone, including someone who says they are from your bank.',
      'Public Wi-Fi is fine for browsing sites that use HTTPS, but do not log in to sensitive accounts without a VPN or mobile data.',
      'Back up what matters in two places, and test that you can restore it.',
      'If a deal or a message sounds too good or too scary to be true, verify it somewhere else first.'
    ];
    if (lc === 'repos') {
      var rl = repoList(); if (!rl.length) { line('Repo list is not on this page yet.', 'e'); return; }
      line(rl.length + ' repositories (' + rl.filter(function (r) { return !r.priv; }).length + ' public, ' + rl.filter(function (r) { return r.priv; }).length + ' private):\n' + rl.map(function (r, i) { return ('0' + (i + 1)).slice(-2) + '  ' + r.name + (r.priv ? '   [private]' : ''); }).join('\n') + '\nTry: open <repo>');
      return;
    }
    if (parts[0] === 'open') {
      if (!args) { line('Usage: open <repo>  (try: repos)'); return; }
      var q1 = args.toLowerCase().replace(/\s+/g, '-'), rl2 = repoList();
      var hit = rl2.filter(function (r) { return r.name.toLowerCase() === q1; })[0] || rl2.filter(function (r) { return r.name.toLowerCase().indexOf(q1) > -1; })[0];
      if (!hit) { line('No repo matches "' + args + '". Type repos for the list.', 'e'); return; }
      if (hit.priv) { line(hit.name + ' is a private repository, so there is nothing public to open.'); return; }
      line('Opening ' + GH + '/' + hit.name + ' ...'); window.open(GH + '/' + encodeURIComponent(hit.name), '_blank', 'noopener'); return;
    }
    if (parts[0] === 'search' || parts[0] === 'grep' || parts[0] === 'find') {
      if (!args) { line('Usage: search <word>, e.g. search python'); return; }
      var w = args.toLowerCase(), found = $$('#pp3 .card.demo').filter(function (d) { return d.textContent.toLowerCase().indexOf(w) > -1; }).map(function (d) { return d.querySelector('b').textContent.replace(/^[^A-Za-z0-9]+/, '').trim(); });
      line(found.length ? found.length + ' match' + (found.length > 1 ? 'es' : '') + ':\n  ' + found.join('\n  ') : 'No repo mentions "' + args + '".'); return;
    }
    if (lc === 'langs' || lc === 'languages') {
      var g = ghCache(); if (!g || !g.repos) { line('Language data has not loaded yet. Open the Projects page, then try again.', 'e'); return; }
      var cnt = {}; g.repos.forEach(function (r) { var l = r.language || 'Other'; cnt[l] = (cnt[l] || 0) + 1; });
      var ks = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }), tot = g.repos.length;
      line('Main language of my ' + tot + ' public repos (by repo count, not lines of code):\n' + ks.map(function (k) { var p = Math.round(cnt[k] / tot * 100); return ('            ' + k).slice(-12) + '  ' + new Array(Math.max(1, Math.round(p / 5)) + 1).join('#') + '  ' + cnt[k] + ' (' + p + '%)'; }).join('\n')); return;
    }
    if (lc === 'latest') {
      var g2 = ghCache(); if (!g2 || !g2.repos || !g2.repos[0]) { line('Live GitHub data has not loaded yet. Open the Projects page, then try again.', 'e'); return; }
      var top = g2.repos[0], mins = Math.max(0, Math.round((Date.now() - new Date(top.pushed_at)) / 60000));
      line('Latest push: ' + top.name + ', ' + (mins < 60 ? mins + ' min ago' : mins < 1440 ? Math.round(mins / 60) + ' h ago' : Math.round(mins / 1440) + ' days ago') + '\n' + GH + '/' + top.name); return;
    }
    if (lc === 'date' || lc === 'time') { line(new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'full', timeStyle: 'medium' }) + ' (Singapore)'); return; }
    if (lc === 'uptime') {
      var sg = new Date(Date.now() + 8 * 36e5), days = Math.floor((Date.UTC(sg.getUTCFullYear(), sg.getUTCMonth(), sg.getUTCDate()) - Date.UTC(2009, 4, 21)) / 864e5);
      line('Up ' + days.toLocaleString('en-US') + ' days (since 21 May 2009).'); return;
    }
    if (lc === 'pwd') { var av = document.querySelector('.view.active'); line('/home/devadarshan/portfolio/' + (av ? av.id : 'home')); return; }
    if (parts[0] === 'cd') { var t2 = (parts[1] || 'home').replace(/^\//, ''); t2 = t2 === 'photos' ? 'photography' : t2; if (ORDER.indexOf(t2) > -1) { line('Opening ' + t2 + '...'); go(t2); } else line('cd: no such page: ' + (parts[1] || ''), 'e'); return; }
    if (lc === 'random') { var rp = ORDER[Math.floor(Math.random() * ORDER.length)]; line('Taking you to ' + rp + '...'); go(rp); return; }
    if (lc === 'echo' || parts[0] === 'echo') { line(args); return; }
    if (lc === 'history') { line(hist.length ? hist.map(function (h, i) { return ('  ' + (i + 1)).slice(-3) + '  ' + h; }).join('\n') : 'No history yet.'); return; }
    if (lc === 'exit' || lc === 'quit') { termOpen(false); return; }
    if (parts[0] === 'theme') {
      var root = document.documentElement, cur = root.dataset.theme === 'dark' ? 'dark' : 'light', want = parts[1];
      if (!want) { line('Theme: ' + cur + '. Use: theme dark | theme light'); return; }
      if (want !== 'dark' && want !== 'light') { line('Use: theme dark | theme light', 'e'); return; }
      if (want !== cur) { var tb = document.getElementById('themeBtn'); if (tb) tb.click(); }
      line('Theme set to ' + want + '.'); return;
    }
    if (lc === 'stats') {
      var rl3 = repoList(), aw = document.querySelectorAll('.award').length, pod = document.querySelectorAll('.award[data-cat~="podium"]').length;
      line('Repositories: ' + rl3.length + ' (' + rl3.filter(function (r) { return !r.priv; }).length + ' public, ' + rl3.filter(function (r) { return r.priv; }).length + ' private)\nAwards and certificates: ' + aw + ' (' + pod + ' podium finishes)\nPages: ' + ORDER.length); return;
    }
    if (lc === 'neofetch') {
      var rl4 = repoList(), aw2 = document.querySelectorAll('.award').length, th = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      line('  ____  ____     devadarshan@portfolio\n |  _ \\|  _ \\    ---------------------\n | |_) | | | |   Role:    President, Infocomm Club\n |  _ <| |_| |   School:  St. Andrew\'s JC, Singapore\n |_| \\_\\____/    Focus:   Python, cybersecurity\n                 Repos:   ' + rl4.length + '\n                 Awards:  ' + aw2 + '\n                 Theme:   ' + th + '\n                 Stack:   HTML, CSS, JS, no framework'); return;
    }
    if (lc === 'tip') { line(TIPS[Math.floor(Math.random() * TIPS.length)]); return; }
    if (parts[0] === 'password' || parts[0] === 'passwd') {
      var n = parts[1] ? parseInt(parts[1], 10) : 16;
      if (!(n >= 8 && n <= 64)) { line('Usage: password [length 8-64]', 'e'); return; }
      var set = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+', buf = new Uint32Array(n), lim = Math.floor(4294967296 / set.length) * set.length, pw = '';
      while (pw.length < n) { crypto.getRandomValues(buf); for (var i = 0; i < buf.length && pw.length < n; i++) if (buf[i] < lim) pw += set[buf[i] % set.length]; }
      line(pw + '\nMade on your device with crypto.getRandomValues. It is not stored or sent anywhere.'); return;
    }
    if (parts[0] === 'hash' || parts[0] === 'sha256') {
      if (!args) { line('Usage: hash <text>'); return; }
      if (!(window.crypto && crypto.subtle)) { line('Hashing needs a secure (https) page.', 'e'); return; }
      crypto.subtle.digest('SHA-256', new TextEncoder().encode(args)).then(function (b) { line('SHA-256: ' + hex(b)); }); return;
    }
    if (parts[0] === 'b64' || parts[0] === 'base64') {
      if (!args) { line('Usage: b64 <text>'); return; }
      var by = new TextEncoder().encode(args), bs = ''; by.forEach(function (x) { bs += String.fromCharCode(x); }); line(btoa(bs)); return;
    }
    if (parts[0] === 'unb64') {
      if (!args) { line('Usage: unb64 <base64>'); return; }
      try { var raw2 = atob(args.replace(/\s+/g, '')), u8 = new Uint8Array(raw2.length); for (var k = 0; k < raw2.length; k++) u8[k] = raw2.charCodeAt(k); line(new TextDecoder().decode(u8)); } catch (e) { line('That is not valid Base64.', 'e'); } return;
    }
    if (parts[0] === 'caesar' || parts[0] === 'rot13') {
      var sh, txt;
      if (parts[0] === 'rot13') { sh = 13; txt = args; } else { sh = parseInt(parts[1], 10); txt = c.split(/\s+/).slice(2).join(' '); }
      if (isNaN(sh) || !txt) { line('Usage: caesar <shift> <text>   (negative shifts decode, rot13 <text> is shift 13)'); return; }
      line(shift(txt, sh)); return;
    }
    if (DATA[lc]) { line(DATA[lc]); return; }
    line('command not found: ' + c + '. Type help.', 'e');
  }
  function termOpen(on) {
    var o = on === undefined ? !drawer.classList.contains('open') : on;
    drawer.classList.toggle('open', o); $('#openTerm').setAttribute('aria-expanded', o);
    if (o) {
      if (!termInit) { termInit = true; line('Welcome. Type help, or tap a command below.'); }
      setTimeout(function () { cmd.focus(); }, 60);
    }
  }
  $('#openTerm').addEventListener('click', function () { termOpen(); });
  $('#closeTerm').addEventListener('click', function () { termOpen(false); });
  $('#tform').addEventListener('submit', function (e) { e.preventDefault(); run(cmd.value); cmd.value = ''; });
  cmd.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); cmd.value = hist[hi] || ''; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); cmd.value = hist[hi] || ''; }
    else if (e.key === 'Tab' && cmd.value && cmd.value.indexOf(' ') < 0) {
      var pre = cmd.value.toLowerCase(), names = ['whoami','skills','reading','leadership','projects','awards','credentials','contact','cv','repos','open','search','langs','latest','github','password','hash','b64','unb64','caesar','rot13','tip','goto','ls','pwd','cd','random','stats','neofetch','uptime','date','theme','history','echo','clear','exit','ctf','hack','help'];
      var m = names.filter(function (n) { return n.indexOf(pre) === 0; });
      if (m.length === 1) { e.preventDefault(); cmd.value = m[0] + ' '; } else if (m.length > 1) { e.preventDefault(); line(m.join('  ')); }
    }
    else if (e.key === 'Escape') termOpen(false);
    e.stopPropagation();
  });
  ['whoami', 'skills', 'repos', 'neofetch', 'tip', 'ctf', 'hack', 'help'].forEach(function (c) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.addEventListener('click', function () { run(c); cmd.focus(); }); $('#quick').appendChild(b);
  });

  /* ---------- matrix rain ---------- */
  var rain = $('#rain'), rc = $('#rainc'), rctx = rc.getContext('2d'), rraf, rto;
  function matrix() {
    termOpen(false); rain.classList.add('on');
    rc.width = innerWidth; rc.height = innerHeight;
    var fs = 18, cols = Math.floor(rc.width / fs), drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -40;
    var chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ{}<>/;$#@';
    rctx.fillStyle = '#00101f'; rctx.fillRect(0, 0, rc.width, rc.height);
    (function f() {
      rctx.fillStyle = 'rgba(0,20,60,.12)'; rctx.fillRect(0, 0, rc.width, rc.height);
      rctx.font = fs + 'px monospace';
      for (var i = 0; i < cols; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        rctx.fillStyle = Math.random() > .96 ? '#ffffff' : '#FDC500';
        rctx.fillText(ch, i * fs, drops[i] * fs);
        if (drops[i] * fs > rc.height && Math.random() > .975) drops[i] = 0;
        drops[i] += 1;
      }
      rraf = requestAnimationFrame(f);
    })();
    clearTimeout(rto); rto = setTimeout(endMatrix, 9000);
  }
  function endMatrix() { cancelAnimationFrame(rraf); rain.classList.remove('on'); }
  rain.addEventListener('click', endMatrix);

  /* ---------- command palette ---------- */
  var pal = $('#pal'), palq = $('#palq'), pall = $('#pall'), items = [], sel = 0;
  var CMDS = [];
  ORDER.forEach(function (k, i) { CMDS.push({ t: 'Go to ' + LABEL[k], h: String(i + 1), f: function () { go(k); } }); });
  CMDS.push({ t: 'Open GitHub profile', h: 'link', f: function () { window.open(GH, '_blank', 'noopener'); } });
  CMDS.push({ t: 'Open SG Wayfinder on GitHub', h: 'link', f: function () { window.open(GH + '/sg-WayFinder', '_blank', 'noopener'); } });
  CMDS.push({ t: 'Open Clearway on GitHub', h: 'link', f: function () { window.open(GH + '/Clearway', '_blank', 'noopener'); } });
  CMDS.push({ t: 'Copy professional email', h: 'copy', f: function () { copy(proMail(), 'Email copied'); } });
  CMDS.push({ t: 'Copy photography email', h: 'copy', f: function () { copy(phMail(), 'Email copied'); } });
  CMDS.push({ t: 'Open terminal', h: '`', f: function () { termOpen(true); } });
  CMDS.push({ t: 'Run hack mode', h: 'fun', f: function () { matrix(); } });
  window.__pxCmds = CMDS;
  function render() {
    var q = palq.value.toLowerCase().trim();
    items = CMDS.filter(function (c) { return !q || c.t.toLowerCase().indexOf(q) > -1; });
    sel = Math.min(sel, Math.max(0, items.length - 1));
    pall.innerHTML = '';
    items.forEach(function (c, i) {
      var li = document.createElement('li'), b = document.createElement('button'); b.type = 'button'; b.className = i === sel ? 'sel' : '';
      b.innerHTML = '<span></span><small></small>'; b.firstChild.textContent = c.t; b.lastChild.textContent = c.h;
      b.addEventListener('click', function () { palRun(c); });
      li.appendChild(b); pall.appendChild(li);
    });
  }
  function palRun(c) { palOpen(false); setTimeout(c.f, 30); }
  function palOpen(on) {
    pal.classList.toggle('open', on);
    if (on) { palq.value = ''; sel = 0; render(); setTimeout(function () { palq.focus(); }, 30); }
  }
  palq.addEventListener('input', function () { sel = 0; render(); });
  palq.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (items[sel]) palRun(items[sel]); }
    else if (e.key === 'Escape') palOpen(false);
    e.stopPropagation();
  });
  pal.addEventListener('click', function (e) { if (e.target === pal) palOpen(false); });
  $('#openPal').addEventListener('click', function () { palOpen(true); });

  function closeAll() { closeModal(); lclose(); palOpen(false); }

  /* ---------- global keyboard ---------- */
  document.addEventListener('keydown', function (e) {
    var typing = /input|textarea|select/i.test((e.target.tagName || ''));
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palOpen(!pal.classList.contains('open')); return; }
    if (e.key === 'Escape') { if (rain.classList.contains('on')) endMatrix(); else if (drawer.classList.contains('open')) termOpen(false); else closeAll(); return; }
    if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
    if (lb.classList.contains('open')) {
      if (e.key === 'ArrowLeft') lshow(lcur - 1); else if (e.key === 'ArrowRight') lshow(lcur + 1); return;
    }
    if (modal.classList.contains('open') || pal.classList.contains('open')) return;
    if (e.key === '`') { e.preventDefault(); termOpen(); return; }
    var i = ORDER.indexOf(cur);
    if (e.key === 'ArrowRight' && i < ORDER.length - 1) go(ORDER[i + 1]);
    else if (e.key === 'ArrowLeft' && i > 0) go(ORDER[i - 1]);
    else if (/^[1-8]$/.test(e.key)) go(ORDER[+e.key - 1]);
  });
  // simple focus trap for the modal
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = $$('a,button', modal).filter(function (x) { return x.offsetParent !== null; }); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- marquee clone ---------- */
  (function () { var m = $('#mq'); if (m) m.innerHTML += m.innerHTML; })();

  /* ---------- start ---------- */
  var start = location.hash.slice(1);
  go(ORDER.indexOf(start) > -1 ? start : 'home', false);
  setTimeout(setInd, 200);
  /* the dock pill follows the real size of the dock, even after fonts load or the label changes */
  if (window.ResizeObserver) { var dro = new ResizeObserver(function () { requestAnimationFrame(setInd); }); dro.observe(dock); $$('button', dock).forEach(function (b) { dro.observe(b); }); }
  window.addEventListener('load', setInd);

  /* ---------- leadership: colour the roles by school stage ---------- */
  (function stages() {
    var ST = [{ k: 'p', from: 2016, to: 2022, name: 'Primary' }, { k: 's', from: 2022, to: 2026, name: 'Secondary' }, { k: 'j', from: 2026, to: 2027, name: 'Junior College' }];
    var SPAN = 11; /* the bars cover 2016 to the end of 2026 */
    function stageOf(y) { for (var i = 0; i < ST.length; i++) if (y >= ST[i].from && y < ST[i].to) return ST[i].k; return 'j'; }
    var cut1 = (2022 - 2016) / SPAN * 100, cut2 = (2026 - 2016) / SPAN * 100;
    $$('#rl [role="tab"]').forEach(function (t) {
      var m = /(\d{4})/.exec(($('small', t) || {}).textContent || ''); if (!m) return;
      var y0 = +m[1], all = ($('small', t).textContent.match(/\d{4}/g) || []), y1 = +all[all.length - 1] || y0;
      if (/Present/i.test($('small', t).textContent)) y1 = 2026;
      t.dataset.stage = stageOf(y0);
      /* a role that runs across more than one school stage carries each stage's colour */
      var order = ['p', 's', 'j'], span = order.slice(order.indexOf(stageOf(y0)), order.indexOf(stageOf(y1)) + 1);
      if (t.id === 'lt2') span = ['p', 's', 'j']; /* class roles run through all three stages */
      if (span.length > 1) {
        var n = span.length, edge = span.map(function (k, i) { return 'var(--st-' + k + ') ' + (i * 100 / n) + '% ' + ((i + 1) * 100 / n) + '%'; }).join(',');
        t.dataset.multi = span.join('');
        t.style.setProperty('--edge-v', 'linear-gradient(180deg,' + edge + ')');
        t.style.setProperty('--edge-h', 'linear-gradient(90deg,' + edge + ')');
        var pn = document.getElementById(t.getAttribute('aria-controls'));
        if (pn) { pn.dataset.multi = span.join(''); pn.style.setProperty('--edge-h', 'linear-gradient(90deg,' + edge + ')'); }
      }
      var panel = document.getElementById(t.getAttribute('aria-controls')); if (panel) panel.dataset.stage = stageOf(y0);
      var bar = $('.trk i', t); if (!bar) return;
      var left = parseFloat(bar.style.left), w = parseFloat(bar.style.width); if (!(w > 0)) return;
      function loc(c) { return Math.max(0, Math.min(100, (c - left) / w * 100)); }
      var a = loc(cut1), b = loc(cut2);
      bar.style.background = 'linear-gradient(90deg,var(--st-p) 0 ' + a + '%,var(--st-s) ' + a + '% ' + b + '%,var(--st-j) ' + b + '% 100%)';
    });
  })();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setInd);
})();

/* ---------- theme toggle ---------- */
(function () {
  var b = document.getElementById('themeBtn'); if (!b) return;
  var root = document.documentElement, meta = document.querySelector('meta[name="theme-color"]');
  function paint() {
    var d = root.dataset.theme === 'dark';
    b.setAttribute('aria-pressed', d ? 'true' : 'false');
    b.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
    var l = b.querySelector('.lbl'); if (l) l.textContent = d ? 'Light' : 'Dark';
    if (meta) meta.setAttribute('content', d ? '#060b1f' : '#ffffff');
  }
  b.addEventListener('click', function () {
    if (root.dataset.theme === 'dark') delete root.dataset.theme; else root.dataset.theme = 'dark';
    try { localStorage.setItem('theme', root.dataset.theme === 'dark' ? 'dark' : 'light'); } catch (e) {}
    paint();
  });
  paint();
})();

/* ---------- visit counter (privacy-light: one anonymous number, no cookies) ---------- */
(function () {
  var els = document.querySelectorAll('[data-visits]'); if (!els.length) return;
  var NS = 'devadd2105-max-github-io', KEY = 'visits', BASE = 'https://abacus.jasoncameron.dev/';
  var SINCE = '17 Nov 2026';
  var host = location.hostname, live = /\.github\.io$/.test(host);
  var today = new Date().toISOString().slice(0, 10), counted = false, owner = false;
  try {
    if (/[?&]nocount\b/.test(location.search)) { localStorage.setItem('nocount', '1'); localStorage.setItem('skipgc', 't'); }
    owner = !!localStorage.getItem('nocount');
    counted = localStorage.getItem('vcDay') === today;
  } catch (e) {}
  function show(n) {
    var txt = Number(n).toLocaleString('en-SG') + (Number(n) === 1 ? ' visit' : ' visits') + ' since ' + SINCE;
    els.forEach(function (el) { el.querySelector('.vtxt').textContent = txt; el.hidden = false; });
  }
  if (!live) return;
  var mode = (counted || owner) ? 'get' : 'hit';
  fetch(BASE + mode + '/' + NS + '/' + KEY).then(function (r) {
    if (!r.ok) throw 0; return r.json();
  }).then(function (j) {
    if (mode === 'hit') { try { localStorage.setItem('vcDay', today); } catch (e) {} }
    if (j && typeof j.value === 'number') show(j.value);
  }).catch(function () { /* counter unavailable: stay hidden */ });
})();
