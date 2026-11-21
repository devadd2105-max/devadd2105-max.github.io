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
(function(){document.querySelectorAll('#masonry .shot img').forEach(function(i){var w=+i.getAttribute('width'),h=+i.getAttribute('height');if(w&&h)i.closest('.shot').style.setProperty('--ar',(w/h).toFixed(4));});})();

/* photography: pick a row height so the last row fills the width */
(function(){var m=document.getElementById('masonry');if(!m)return;var busy=0;
function fit(){busy=1;var shots=[].slice.call(m.querySelectorAll('.shot')).filter(function(s){return !s.hidden});var W=m.clientWidth;if(!W||!shots.length){busy=0;return}
var g=W<700?8:12,lo=W<700?95:170,hi=W<700?(shots.length<=6?260:170):(shots.length<=6?520:300),ars=shots.map(function(s){return parseFloat(s.style.getPropertyValue('--ar'))||1.2}),best=null;
for(var H=lo;H<=hi;H+=2){var sum=0,n=0,rows=[];ars.forEach(function(a){var w=a*H;if(n&&sum+g*n+w>W){rows.push(sum+g*(n-1));sum=0;n=0}sum+=w;n++});var last=sum+g*(n-1),fill=last/W;
var penalty=Math.abs(1-fill)+(rows.length?0:0)+Math.abs(H-(lo+hi)/2)/1000;if(fill>1)penalty+=1;if(!best||penalty<best.p)best={p:penalty,H:H,fill:fill}}
m.style.setProperty('--rh',best.H+'px');m.classList.toggle('pad',best.fill<.75);setTimeout(function(){busy=0},0)}
fit();addEventListener('resize',function(){fit()});
new MutationObserver(function(){if(!busy)fit()}).observe(m,{subtree:true,attributes:true,attributeFilter:['hidden']});
var v=m.closest('.view');if(v)new MutationObserver(function(){fit()}).observe(v,{attributes:true,attributeFilter:['class']});})();

/* accent picker */
(function(){var P=[['royal','Royal','#1236d6','18,54,214','#fdc500','253,197,0'],['emerald','Emerald','#0a7a55','10,122,85','#ffd166','255,209,102'],['violet','Violet','#6d28d9','109,40,217','#fbbf24','251,191,36'],['crimson','Crimson','#c81d3a','200,29,58','#ffd166','255,209,102'],['teal','Teal','#0e7490','14,116,144','#fb923c','251,146,60'],['rose','Rose','#be185d','190,24,93','#fcd34d','252,211,77'],['slate','Slate','#334155','51,65,85','#38bdf8','56,189,248'],['amber','Amber','#b45309','180,83,9','#fde68a','253,230,138']];
var btn=document.getElementById('accBtn'),pop=document.getElementById('accPop'),grid=document.getElementById('accGrid'),nm=document.getElementById('accName');if(!btn||!pop||!grid)return;
var st=document.documentElement.style,cur='royal';try{cur=localStorage.getItem('accent')||'royal'}catch(e){}
function apply(k){var c=P.filter(function(x){return x[0]===k})[0]||P[0];st.setProperty('--brand',c[2]);st.setProperty('--brand-rgb',c[3]);st.setProperty('--pop',c[4]);st.setProperty('--pop-rgb',c[5]);st.setProperty('--c1',c[2]);st.setProperty('--c3',c[4]);cur=c[0];nm.textContent=c[1];[].forEach.call(grid.children,function(b){b.setAttribute('aria-pressed',b.dataset.k===cur)});try{localStorage.setItem('accent',cur)}catch(e){}}
P.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='acc-sw';b.dataset.k=c[0];b.style.setProperty('--a',c[2]);b.style.setProperty('--b',c[4]);b.setAttribute('aria-label',c[1]);b.setAttribute('aria-pressed','false');grid.appendChild(b)});
apply(cur);
function open(o){pop.classList.toggle('on',o);btn.setAttribute('aria-expanded',o)}
btn.addEventListener('click',function(e){e.stopPropagation();open(!pop.classList.contains('on'))});
grid.addEventListener('click',function(e){var b=e.target.closest('.acc-sw');if(b)apply(b.dataset.k)});
document.addEventListener('click',function(e){if(!pop.contains(e.target))open(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&pop.classList.contains('on')){open(false);btn.focus()}});})();

/* CV print, contact form, live GitHub strip */
(function(){
function mailOf(){var c=document.querySelector('.cc[data-kind="mail"]');return c?c.dataset.r.split('').reverse().join(''):''}
function printCV(){var m=document.getElementById('cvmail');if(m)m.textContent=mailOf();var ul=document.getElementById('cvaw');
 if(ul&&!ul.children.length){var t=['Galactic Problem Solver, NASA Space Apps Challenge 2026 (team entry: Clearway)'];[].forEach.call(document.querySelectorAll('#awgrid .award.prime h3'),function(h){t.push(h.textContent.trim())});t.forEach(function(x){var li=document.createElement('li');li.textContent=x;ul.appendChild(li)})}
 document.body.classList.add('cvp');setTimeout(function(){window.print()},50)}
addEventListener('afterprint',function(){document.body.classList.remove('cvp')});
addEventListener('print-cv',printCV);
var b=document.getElementById('cvBtn');if(b)b.addEventListener('click',printCV);
var KEY='';/* optional: paste a free Web3Forms access key here to send without opening a mail app */
var f=document.getElementById('cform');
if(f)f.addEventListener('submit',function(e){e.preventDefault();var m=document.getElementById('fmsg'),d=new FormData(f);m.className='fmsg';
 if(d.get('botcheck'))return;var n=(d.get('name')||'').trim(),em=(d.get('email')||'').trim(),msg=(d.get('message')||'').trim();
 if(!n||!/^\S+@\S+\.\S+$/.test(em)||msg.length<5){m.className='fmsg err';m.textContent='Please add your name, a valid email and a short message.';return}
 if(KEY){m.textContent='Sending...';fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_key:KEY,name:n,email:em,message:msg,subject:'Portfolio message from '+n})}).then(function(r){return r.json()}).then(function(j){if(j.success){m.className='fmsg ok';m.textContent='Thank you, your message was sent.';f.reset()}else throw 0}).catch(function(){m.className='fmsg err';m.textContent='Could not send. Please use the email above.'});return}
 var to=mailOf();location.href='mailto:'+to+'?subject='+encodeURIComponent('Portfolio message from '+n)+'&body='+encodeURIComponent(msg+'\n\nFrom: '+n+' ('+em+')');
 m.className='fmsg ok';m.textContent='Your email app should open with the message ready to send.'});
var L=document.getElementById('live'),LT=document.getElementById('livet');
if(L&&LT){var C=null;try{C=JSON.parse(sessionStorage.getItem('gh')||'null')}catch(e){}
 function show(o){var d=Math.max(0,Math.round((Date.now()-new Date(o.t))/864e5));LT.textContent='Live from GitHub: last push to '+o.r+' '+(d<1?'today':d===1?'yesterday':d+' days ago')+'.';L.hidden=false}
 if(C)show(C);else fetch('https://api.github.com/users/devadd2105-max/repos?sort=pushed&per_page=5').then(function(r){return r.ok?r.json():Promise.reject()}).then(function(a){a=a.filter(function(x){return !x.private});if(!a.length)return;var o={r:a[0].name,t:a[0].pushed_at};try{sessionStorage.setItem('gh',JSON.stringify(o))}catch(e){}show(o)}).catch(function(){})}
})();
