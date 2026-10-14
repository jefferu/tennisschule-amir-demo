(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      io.observe(el);
    });
  }

  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  let lastFocus = null;
  const closeLb = () => { lb.hidden = true; lastFocus && lastFocus.focus(); };
  $$('.g').forEach((btn) => btn.addEventListener('click', () => {
    lastFocus = btn;
    lbImg.src = btn.dataset.full;
    lbImg.alt = $('img', btn).alt;
    lbCap.textContent = btn.dataset.cap;
    lb.hidden = false;
    $('#lbClose').focus();
  }));
  $('#lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  const plan = $('#plan');
  $$('[data-plan]').forEach((a) => a.addEventListener('click', () => {
    const label = a.dataset.plan;
    const opt = [...plan.options].find((o) => label.toLowerCase().startsWith(o.text.toLowerCase().split(' ')[0]));
    if (opt) plan.value = opt.value;
  }));

  const form = $('#form');
  const status = $('#status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name?.trim() || !/^\S+@\S+\.\S+$/.test(d.email || '')) {
      status.style.color = '#ffb4b4';
      status.textContent = 'Bitte Name und eine gültige E-Mail angeben.';
      return;
    }
    status.style.color = '';
    const body = `Name: ${d.name}\nE-Mail: ${d.email}\nInteresse: ${d.plan}\n\n${d.msg || ''}`;
    location.href = `mailto:info@ts-amir.de?subject=${encodeURIComponent('Anfrage: ' + d.plan)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Ihr E-Mail-Programm wurde geöffnet. Bitte senden Sie die Nachricht dort ab.';
  });
})();
