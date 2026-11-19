/* ==========================================================================
   Al-Maslak al-Muyassar — shared shell
   Builds the navigation and footer on every page, and runs the language switcher.

   TO ADD OR RENAME A PAGE IN THE MENU: edit the NAV list below. That is the only
   place the menu is defined — every page picks it up automatically.
   ========================================================================== */
(function () {
  'use strict';

  /* Visit statistics: Cloudflare Web Analytics. After launch, paste your token between the quotes
     (Cloudflare dashboard -> Analytics & Logs -> Web Analytics -> Add a site). Leave empty to switch it off. */
  var ANALYTICS_TOKEN = '';
  if (ANALYTICS_TOKEN) {
    var cf = document.createElement('script');
    cf.defer = true; cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    cf.setAttribute('data-cf-beacon', JSON.stringify({ token: ANALYTICS_TOKEN }));
    document.head.appendChild(cf);
  }

  var NAV = [
    { t: 'Home', h: 'index.html', k: 'index' },
    { t: 'Guide', g: [
      { t: 'Visa & Arrival', h: 'visa.html', d: 'Entry visa, renewals, documents' },
      { t: 'Housing', h: 'housing.html', d: 'Areas, costs, finding a flat' },
      { t: 'Daily Life', h: 'life.html', d: 'Food, transport, SIM cards, money' },
      { t: 'Safety', h: 'safety.html', d: 'Police, documents, staying safe' }
    ] },
    { t: 'Institutes', g: [
      { t: 'Overview', h: 'institutes.html', d: 'Choosing where to study' },
      { t: 'Arabic', h: 'institutes-arabic.html', d: 'Eight institutes, real prices' },
      { t: 'Qurʾān', h: 'institutes-quran.html', d: 'Four institutes + private teachers' }
    ] },
    { t: 'Tools', h: 'tools.html', k: 'tools' },
    { t: 'FAQ', h: 'faq.html', k: 'faq' },
    { t: 'Community', h: 'community.html', k: 'community' }
  ];
  var CTA = { t: 'Services', h: 'services.html' };

  var FOOT = [
    { t: 'Guide', l: [['Visa & Arrival', 'visa.html'], ['Housing', 'housing.html'], ['Daily Life', 'life.html'], ['Safety', 'safety.html']] },
    { t: 'Institutes', l: [['Overview', 'institutes.html'], ['Arabic institutes', 'institutes-arabic.html'], ['Qurʾān institutes', 'institutes-quran.html']] },
    { t: 'Tools & help', l: [['Budget & checklist', 'tools.html'], ['FAQ', 'faq.html'], ['Community groups', 'community.html']] },
    { t: 'Services', l: [['Our services', 'services.html'], ['Book a call', 'services.html?service=essential#enquire'], ['About', 'about.html']] }
  ];
  var LEGAL = [['Terms', 'terms.html'], ['Privacy', 'privacy.html']];

  var LANGS = [
    ['en', '🇬🇧', 'English', 'English'], ['fr', '🇫🇷', 'French', 'Français'], ['ru', '🇷🇺', 'Russian', 'Русский'],
    ['no', '🇳🇴', 'Norwegian', 'Norsk'], ['nl', '🇳🇱', 'Dutch', 'Nederlands'], ['de', '🇩🇪', 'German', 'Deutsch'],
    ['id', '🇮🇩', 'Indonesian', 'Bahasa Indonesia'], ['ms', '🇲🇾', 'Malay', 'Bahasa Melayu'],
    ['tr', '🇹🇷', 'Turkish', 'Türkçe'], ['ar', '🇸🇦', 'Arabic', 'العربية']
  ];

  /* ---------- current page (works with or without ".html" in the address) ---------- */
  function slug(p) {
    p = String(p).split('#')[0].split('?')[0].replace(/\/+$/, '');
    p = p.split('/').pop().replace(/\.html$/, '');
    return p || 'index';
  }
  var here = slug(location.pathname);
  function isHere(href) { return slug(href) === here; }

  /* ---------- build navigation ---------- */
  function linkHtml(it) {
    var href = it.h === 'index.html' ? '/' : it.h;
    return '<a class="sn-link' + (isHere(it.h) ? ' active' : '') + '" href="' + href + '">' + it.t + '</a>';
  }
  function groupHtml(it) {
    var active = it.g.some(function (x) { return isHere(x.h); });
    var items = it.g.map(function (x) {
      return '<a href="' + x.h + '"' + (isHere(x.h) ? ' class="active" aria-current="page"' : '') + '>' + x.t + (x.d ? '<small>' + x.d + '</small>' : '') + '</a>';
    }).join('');
    return '<div class="sn-group' + (active ? ' has-active' : '') + '">' +
      '<button type="button" class="sn-gbtn" aria-haspopup="true" aria-expanded="false">' + it.t +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></button>' +
      '<div class="sn-menu" role="menu">' + items + '</div></div>';
  }
  function panelHtml() {
    var out = '';
    NAV.forEach(function (it) {
      if (it.g) {
        out += '<h4>' + it.t + '</h4>' + it.g.map(function (x) {
          return '<a href="' + x.h + '"' + (isHere(x.h) ? ' class="active"' : '') + '>' + x.t + (x.d ? '<small>' + x.d + '</small>' : '') + '</a>';
        }).join('');
      } else {
        out += '<a href="' + (it.h === 'index.html' ? '/' : it.h) + '"' + (isHere(it.h) ? ' class="active"' : '') + '>' + it.t + '</a>';
      }
    });
    return out + '<a class="sn-cta' + (isHere(CTA.h) ? ' active' : '') + '" href="' + CTA.h + '">Our services →</a>';
  }
  function langHtml() {
    var btns = LANGS.map(function (l) {
      return '<button type="button" data-lang="' + l[0] + '"' + (l[0] === 'en' ? ' class="lang-reset"' : '') + (l[0] === 'ar' ? ' dir="rtl"' : '') + '>' +
        '<span class="lang-flag">' + l[1] + '</span><span class="lang-name">' + l[2] + '</span><span class="lang-native">' + l[3] + '</span>' +
        '<svg class="lang-tick" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></button>';
    }).join('');
    return '<div class="lang-switcher notranslate" translate="no" id="langSwitcher">' +
      '<button class="lang-btn" id="langBtn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Change language">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>' +
      '<span id="langBtnTxt">EN</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></button>' +
      '<div class="lang-menu" id="langMenu" role="menu" aria-label="Language options"><div class="lang-menu-header">Choose language</div>' + btns + '</div></div>';
  }
  function navHtml() {
    return '<nav class="sn" id="sn" aria-label="Main navigation"><div class="sn-inner">' +
      '<a class="sn-brand" href="/" aria-label="Al-Maslak al-Muyassar — home"><span class="sn-brand-ar notranslate" translate="no" lang="ar">المسلك المُيسَّر</span><span class="sn-brand-en">Al-Maslak al-Muyassar</span></a>' +
      '<div class="sn-links">' + NAV.map(function (it) { return it.g ? groupHtml(it) : linkHtml(it); }).join('') + '<span class="sn-spacer"></span></div>' +
      '<a class="sn-cta' + (isHere(CTA.h) ? ' active' : '') + '" href="' + CTA.h + '">' + CTA.t + '</a>' +
      langHtml() +
      '<button class="sn-burger" id="snBurger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="snPanel"><span></span></button>' +
      '</div><div class="sn-panel" id="snPanel">' + panelHtml() + '</div><div class="sn-progress" id="snProgress"></div></nav>';
  }
  function footHtml() {
    var cols = FOOT.map(function (c) {
      return '<div class="sf-col"><h4>' + c.t + '</h4><ul>' + c.l.map(function (x) { return '<li><a href="' + x[1] + '">' + x[0] + '</a></li>'; }).join('') + '</ul></div>';
    }).join('');
    var legal = LEGAL.map(function (x) { return '<a href="' + x[1] + '" style="color:inherit;text-decoration:underline;text-underline-offset:3px">' + x[0] + '</a>'; }).join(' · ');
    return '<footer class="sf"><div class="sf-inner"><div class="sf-top">' +
      '<div class="sf-brand"><span class="sf-brand-ar notranslate" translate="no" lang="ar">المسلك المُيسَّر</span><span class="sf-brand-en">Al-Maslak al-Muyassar · The Facilitated Path</span>' +
      '<p>A guide for Western Muslims seeking knowledge in Cairo, built from real student experience.</p></div>' + cols + '</div>' +
      '<div class="sf-bottom"><p>© ' + new Date().getFullYear() + ' Al-Maslak al-Muyassar · ' + legal + '<br>This guide covers Cairo, primarily Nasr City. It does not cover other areas of Egypt. Information is based on student experience and can change — confirm prices and details directly with each institute.</p>' +
      '<span class="sf-dua notranslate" translate="no" lang="ar">وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا</span></div></div></footer>';
  }

  var navMount = document.getElementById('sn-mount');
  if (navMount) navMount.innerHTML = navHtml();
  var footMount = document.getElementById('sf-mount');
  if (footMount) footMount.innerHTML = footHtml();
  if (!document.getElementById('gt-el')) {
    var gt = document.createElement('div'); gt.id = 'gt-el'; gt.setAttribute('aria-hidden', 'true');
    document.body.appendChild(gt);
  }

  /* ---------- menu behaviour ---------- */
  var nav = document.getElementById('sn');
  function closeGroups(except) {
    document.querySelectorAll('.sn-group.open').forEach(function (g) {
      if (g !== except) { g.classList.remove('open'); g.querySelector('.sn-gbtn').setAttribute('aria-expanded', 'false'); }
    });
  }
  function closeLang() {
    var m = document.getElementById('langMenu'), b = document.getElementById('langBtn');
    if (m) m.classList.remove('open');
    if (b) b.setAttribute('aria-expanded', 'false');
  }
  function closePanel() {
    if (!nav) return;
    nav.classList.remove('open');
    var bg = document.getElementById('snBurger');
    if (bg) { bg.setAttribute('aria-expanded', 'false'); bg.setAttribute('aria-label', 'Open menu'); }
  }
  document.addEventListener('click', function (e) {
    var gbtn = e.target.closest ? e.target.closest('.sn-gbtn') : null;
    if (gbtn) {
      var grp = gbtn.parentNode, open = !grp.classList.contains('open');
      closeGroups(grp); closeLang();
      grp.classList.toggle('open', open);
      gbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    var lbtn = e.target.closest ? e.target.closest('#langBtn') : null;
    if (lbtn) {
      var menu = document.getElementById('langMenu'), isOpen = menu.classList.toggle('open');
      lbtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      closeGroups();
      return;
    }
    var pick = e.target.closest ? e.target.closest('.lang-menu button[data-lang]') : null;
    if (pick) { setLang(pick.getAttribute('data-lang')); return; }
    var burger = e.target.closest ? e.target.closest('#snBurger') : null;
    if (burger) {
      var o = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', o ? 'true' : 'false');
      burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
      closeLang();
      return;
    }
    if (!e.target.closest || !e.target.closest('.sn-group')) closeGroups();
    if (!e.target.closest || !e.target.closest('#langSwitcher')) closeLang();
    if (e.target.closest && e.target.closest('.sn-panel a')) closePanel();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeGroups(); closeLang(); closePanel(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closePanel(); });

  /* ---------- scroll progress ---------- */
  var bar = document.getElementById('snProgress');
  if (bar) {
    var tick = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
    };
    window.addEventListener('scroll', tick, { passive: true }); tick();
  }

  /* ---------- language (Google's translation engine, our own interface) ----------
     The chosen language is stored in Google's "googtrans" cookie and the page reloads.
     Google's script is only loaded when a language other than English is chosen. */
  function readLang() {
    var m = document.cookie.match(/googtrans=([^;]+)/);
    if (!m) return 'en';
    var parts = decodeURIComponent(m[1]).split('/');
    return parts[2] || 'en';
  }
  function writeLang(lang) {
    var host = location.hostname;
    var kill = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = kill;
    document.cookie = kill + ' domain=' + host + ';';
    document.cookie = kill + ' domain=.' + host + ';';
    if (lang && lang !== 'en') {
      var v = '/en/' + lang;
      document.cookie = 'googtrans=' + v + '; path=/;';
      document.cookie = 'googtrans=' + v + '; path=/; domain=' + host + ';';
      document.cookie = 'googtrans=' + v + '; path=/; domain=.' + host + ';';
    }
  }
  function setLang(lang) {
    if (lang === readLang()) { closeLang(); return; }
    writeLang(lang);
    location.reload();
  }
  window.setLang = setLang;

  var cur = readLang();
  var txt = document.getElementById('langBtnTxt');
  if (txt) txt.textContent = cur.toUpperCase();
  document.querySelectorAll('.lang-menu button[data-lang]').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-lang') === cur);
  });

  if (cur !== 'en') {
    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'gt-el');
    };
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true; document.head.appendChild(s);
    // Fallback: apply the language directly if the cookie alone was not enough
    var tries = 0, t = setInterval(function () {
      var combo = document.querySelector('.goog-te-combo');
      if (combo) {
        if (combo.value !== cur) { combo.value = cur; combo.dispatchEvent(new Event('change')); }
        clearInterval(t);
      }
      if (++tries > 40) clearInterval(t);
    }, 150);
    // Keep Google's banner from pushing the page down
    var tidy = function () {
      if (document.body.style.top && document.body.style.top !== '0px') document.body.style.top = '0px';
      var f = document.querySelector('iframe.skiptranslate, .goog-te-banner-frame');
      if (f) f.style.display = 'none';
    };
    tidy();
    new MutationObserver(tidy).observe(document.documentElement, { attributes: true, childList: true, subtree: true, attributeFilter: ['style', 'class'] });
  }
})();

/* FAQ accordion (used by the FAQ and Services pages) */
window.toggleFaq = function (btn) {
  var ans = btn.nextElementSibling, icon = btn.querySelector('.faq-icon'), open = icon.classList.contains('open');
  document.querySelectorAll('.faq-answer').forEach(function (a) { a.style.maxHeight = '0'; });
  document.querySelectorAll('.faq-q').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  document.querySelectorAll('.faq-icon').forEach(function (i) { i.classList.remove('open'); });
  if (!open) { ans.style.maxHeight = ans.scrollHeight + 'px'; icon.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
};
