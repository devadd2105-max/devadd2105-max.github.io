/* Devadarshan portfolio: the polish layer (behaviour). Safe to remove: the site works without it. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var KEY = 'look';

  function look() { try { return localStorage.getItem(KEY) === 'classic' ? 'classic' : 'new'; } catch (e) { return 'new'; } }
  function setLook(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    root.classList.toggle('px', v !== 'classic');
    var b = $('.px-lookbtn'); if (b) b.textContent = v === 'classic' ? 'Switch to the new look' : 'Switch to the classic look';
    var t = document.getElementById('toast'); if (t) { t.textContent = v === 'classic' ? 'Classic look' : 'New look'; t.classList.add('on'); clearTimeout(setLook.t); setLook.t = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  }

  /* ---- palette commands (the command menu, Ctrl K) ---- */
  if (window.__pxCmds) {
    window.__pxCmds.push({ t: 'Look: switch to the classic design', h: 'look', f: function () { setLook('classic'); } });
    window.__pxCmds.push({ t: 'Look: switch to the new design', h: 'look', f: function () { setLook('new'); } });
  }

  /* ---- which view is open, so the background can follow it ---- */
  var app = $('#main');
  function markView() { var v = $('.view.active'); if (v) root.dataset.view = v.id; }
  markView();
  if (app && window.MutationObserver) new MutationObserver(markView).observe(app, { subtree: true, attributes: true, attributeFilter: ['class'] });

  /* ---- progress ruler, glass top bar, back to top ---- */
  var bar = document.createElement('div'); bar.className = 'px-progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  var top = document.createElement('button'); top.type = 'button'; top.className = 'px-top'; top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(top);
  var topbar = $('.topbar'), tick = false;
  function onScroll(e) {
    var v = e.target; if (!v || !v.classList || !v.classList.contains('view') || !v.classList.contains('active')) return;
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      tick = false;
      var max = v.scrollHeight - v.clientHeight, y = v.scrollTop;
      bar.style.setProperty('--sp', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      bar.style.setProperty('--spo', y > 8 ? 1 : 0);
      if (topbar) topbar.classList.toggle('scrolled', y > 8);
      top.classList.toggle('on', y > 520);
    });
  }
  document.addEventListener('scroll', onScroll, true);
  top.addEventListener('click', function () { var v = $('.view.active'); if (v) v.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); });
  if (app && window.MutationObserver) new MutationObserver(function () {
    bar.style.setProperty('--sp', 0); bar.style.setProperty('--spo', 0); top.classList.remove('on'); if (topbar) topbar.classList.remove('scrolled');
  }).observe(app, { subtree: true, attributes: true, attributeFilter: ['aria-hidden'] });

  /* ---- footer on the Contact view ---- */
  var wrap = $('#contact .wrap');
  if (wrap && !$('.px-foot', wrap)) {
    var f = document.createElement('footer'); f.className = 'px-foot';
    f.innerHTML = '<div class="row"><span><b>Balamurugan Devadarshan</b> &middot; Singapore</span><span>&copy; <span class="px-year"></span></span></div>' +
      '<p>Designed and coded by hand in plain HTML, CSS and JavaScript. No frameworks, no cookies, and only a privacy-friendly visit counter. Press <kbd>Ctrl</kbd> <kbd>K</kbd> for the command menu.</p>' +
      '<div class="acts"><button type="button" class="px-totop">Back to top</button><button type="button" class="px-lookbtn"></button></div>';
    wrap.appendChild(f);
    $('.px-year', f).textContent = new Date().getFullYear();
    $('.px-totop', f).addEventListener('click', function () { top.click(); });
    $('.px-lookbtn', f).addEventListener('click', function () { setLook(root.classList.contains('px') ? 'classic' : 'new'); });
    $('.px-lookbtn', f).textContent = look() === 'classic' ? 'Switch to the new look' : 'Switch to the classic look';
  }

})();
