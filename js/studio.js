(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const motionOn = finePointer && !reduceMotion;

  /* ---------------------------------------------------------------
     00 · Reveal observer (scroll-triggered text / seam / image reveals)
     --------------------------------------------------------------- */
  function initReveal() {
    const targets = Array.from(document.querySelectorAll('.reveal-line, .seam, [data-reveal-visual]'));
    if (!targets.length) return;

    const reveal = (el) => el.classList.add('in-view');

    try {
      if (!('IntersectionObserver' in window)) throw new Error('no-io');
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -2% 0px' });
      targets.forEach((el) => io.observe(el));
    } catch (err) {
      targets.forEach(reveal);
      return;
    }

    // Safety net: a fast/instant scroll jump (anchor link, PageDown, a flick
    // on some mobile browsers) can move past an element's intersection
    // window between observer checks, leaving it masked forever. On every
    // scroll, force-reveal anything that has already entered or passed
    // through the viewport so content is never permanently hidden.
    let ticking = false;
    const sweep = () => {
      ticking = false;
      targets.forEach((el) => {
        if (el.classList.contains('in-view')) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) reveal(el);
      });
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(sweep); }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     01 · Clock — Africa/Johannesburg, real time, no fabrication
     --------------------------------------------------------------- */
  function initClock() {
    const targets = document.querySelectorAll('[data-clock]');
    if (!targets.length) return;
    const fmt = new Intl.DateTimeFormat('en-ZA', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Africa/Johannesburg',
    });
    const tick = () => {
      const t = fmt.format(new Date());
      targets.forEach((el) => { el.textContent = `${t} SAST`; });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------
     02 · Nav — compress on scroll, full-screen menu
     --------------------------------------------------------------- */
  function initNav() {
    const nav = document.querySelector('.wgs-nav');
    if (nav) {
      const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    const menu = document.getElementById('wgs-menu');
    const openBtn = document.getElementById('wgs-menu-open');
    const closeBtn = document.getElementById('wgs-menu-close');
    if (!menu || !openBtn || !closeBtn) return;

    const open = () => {
      menu.classList.add('open');
      openBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      const firstLink = menu.querySelector('.wgs-menu-item a');
      if (firstLink) firstLink.focus();
    };
    const close = () => {
      menu.classList.remove('open');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      openBtn.focus();
    };

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    menu.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ---------------------------------------------------------------
     03 · Scroll thread — recurring motif + progress indicator
     --------------------------------------------------------------- */
  function initThread() {
    const fill = document.getElementById('thread-fill');
    const dot = document.getElementById('thread-dot');
    const bar = document.getElementById('top-progress');
    const pctLabel = document.getElementById('thread-pct');
    if (!fill && !bar) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fill) fill.style.height = `${pct * 100}%`;
      if (dot) dot.style.top = `${pct * 100}%`;
      if (bar) bar.style.width = `${pct * 100}%`;
      if (pctLabel) pctLabel.textContent = `${Math.round(pct * 100)}%`.padStart(3, '0');
    };
    update();
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------------------------------------------------------------
     04 · Custom cursor (desktop, fine pointer, motion allowed only)
     --------------------------------------------------------------- */
  function initCursor() {
    if (!motionOn) return;
    const dot = document.getElementById('wgs-cursor-dot');
    const ring = document.getElementById('wgs-cursor-ring');
    if (!dot || !ring) return;

    document.body.classList.add('has-fine-pointer');

    let rx = -100, ry = -100;
    let dx = -100, dy = -100;

    window.addEventListener('pointermove', (e) => {
      rx = e.clientX; ry = e.clientY;
      dot.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    }, { passive: true });

    const loop = () => {
      dx += (rx - dx) * 0.18;
      dy += (ry - dy) * 0.18;
      ring.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor]');
      if (!target) return;
      const mode = target.getAttribute('data-cursor');
      ring.classList.toggle('is-link', mode === 'link');
      ring.classList.toggle('is-view', mode === 'view');
      const label = ring.querySelector('span');
      if (label) label.textContent = mode === 'view' ? 'VIEW' : '';
    });
    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-cursor]');
      if (!target) return;
      const related = e.relatedTarget;
      if (related && target.contains(related)) return;
      ring.classList.remove('is-link', 'is-view');
    });

    document.addEventListener('mouseleave', () => {
      dot.style.transform = 'translate3d(-100px,-100px,0)';
      ring.style.transform = 'translate3d(-100px,-100px,0)';
    });
  }

  /* ---------------------------------------------------------------
     05 · Magnetic buttons
     --------------------------------------------------------------- */
  function initMagnetic() {
    if (!motionOn) return;
    const els = document.querySelectorAll('[data-magnetic]');
    els.forEach((el) => {
      const strength = 0.35;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const relX = e.clientX - (r.left + r.width / 2);
        const relY = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------
     06 · Hero — pointer-reactive words + coordinate readout + canvas field
     --------------------------------------------------------------- */
  function initHero() {
    const hero = document.querySelector('.hero-studio');
    if (!hero) return;

    const coord = document.getElementById('hero-coord');
    const words = hero.querySelectorAll('.hero-headline .word');

    if (motionOn && words.length) {
      let raf = null;
      hero.addEventListener('pointermove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const r = hero.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width;
          const ny = (e.clientY - r.top) / r.height;
          if (coord) coord.textContent = `X ${nx.toFixed(2)} / Y ${ny.toFixed(2)}`;

          words.forEach((w) => {
            const wr = w.getBoundingClientRect();
            const cx = wr.left + wr.width / 2;
            const cy = wr.top + wr.height / 2;
            const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
            const radius = 180;
            if (dist < radius) {
              const t = 1 - dist / radius;
              w.style.transform = `scale(${1 + t * 0.09}) translateY(${-t * 4}px)`;
            } else {
              w.style.transform = '';
            }
          });
        });
      });
      hero.addEventListener('pointerleave', () => {
        words.forEach((w) => { w.style.transform = ''; });
        if (coord) coord.textContent = 'X 0.00 / Y 0.00';
      });
    }

    initHeroCanvas(hero);
  }

  function initHeroCanvas(hero) {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let px = -9999, py = -9999;
    let running = false;
    let raf = null;

    const resize = () => {
      const r = hero.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const spacing = 46;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      for (let i = 0; i < cols; i += 1) {
        for (let j = 0; j < rows; j += 1) {
          const x = i * spacing;
          const y = j * spacing;
          const dist = Math.hypot(x - px, y - py);
          const influence = Math.max(0, 1 - dist / 260);
          const r = 1 + influence * 1.6;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = influence > 0.02
            ? `rgba(78, 185, 111, ${0.14 + influence * 0.55})`
            : 'rgba(244, 243, 234, 0.10)';
          ctx.fill();
        }
      }
    };

    const loop = () => {
      draw();
      if (running) raf = requestAnimationFrame(loop);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([entry]) => {
        running = entry.isIntersecting && motionOn;
        if (running && !raf) raf = requestAnimationFrame(loop);
      });
      io.observe(hero);
    }

    if (motionOn) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        px = e.clientX - r.left; py = e.clientY - r.top;
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { px = -9999; py = -9999; });
    }

    window.addEventListener('resize', resize);
    resize();
    if (!motionOn) draw();
  }

  /* ---------------------------------------------------------------
     07 · Capabilities — floating thumbnail follows cursor
     --------------------------------------------------------------- */
  function initCapabilities() {
    const list = document.getElementById('cap-list');
    const thumb = document.getElementById('cap-thumb');
    if (!list || !thumb) return;
    const img = thumb.querySelector('img');

    if (!finePointer) return;

    list.addEventListener('mousemove', (e) => {
      const row = e.target.closest('.cap-row');
      if (!row) { thumb.classList.remove('show'); return; }
      const src = row.getAttribute('data-thumb');
      if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
      thumb.classList.add('show');
      const offsetX = 26, offsetY = 26;
      let x = e.clientX + offsetX;
      let y = e.clientY + offsetY;
      const maxX = window.innerWidth - 256;
      const maxY = window.innerHeight - 186;
      x = Math.min(x, maxX);
      y = Math.min(y, maxY);
      thumb.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1)`;
    });
    list.addEventListener('mouseleave', () => thumb.classList.remove('show'));
  }

  /* ---------------------------------------------------------------
     08 · Quick start form → WhatsApp
     --------------------------------------------------------------- */
  function initQuickForm() {
    const form = document.getElementById('quick-start-form');
    if (!form) return;
    const note = document.getElementById('quick-start-note');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('qs-name').value.trim();
      const service = document.getElementById('qs-service').value;
      if (!name) {
        if (note) { note.textContent = 'Add your name so we know who’s messaging.'; note.classList.remove('is-success'); }
        document.getElementById('qs-name').focus();
        return;
      }
      const message = `Hi, I'm ${name}. I'd like to ask about ${service}.`;
      if (note) {
        note.textContent = 'Opening WhatsApp — we usually reply within the day.';
        note.classList.add('is-success');
      }
      window.open(`https://wa.me/27787347867?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    });
  }

  /* ---------------------------------------------------------------
     09 · Easter egg — triple-click the logo
     --------------------------------------------------------------- */
  function initEasterEgg() {
    const logo = document.getElementById('wgs-logo-mark');
    const note = document.getElementById('easter-note');
    if (!logo || !note) return;
    let clicks = 0;
    let timer = null;
    logo.addEventListener('click', (e) => {
      clicks += 1;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 1400);
      if (clicks >= 3) {
        clicks = 0;
        e.preventDefault();
        note.classList.add('show');
        setTimeout(() => note.classList.remove('show'), 2200);
      }
    });
  }

  /* ---------------------------------------------------------------
     10 · Studio tabs (e.g. Curriculum / Pricing on the courses page)
     --------------------------------------------------------------- */
  function initStudioTabs() {
    const bar = document.getElementById('studio-tabs');
    if (!bar) return;
    const tabs = Array.from(bar.querySelectorAll('.studio-tab'));
    const panels = Array.from(document.querySelectorAll('[data-tab-panel]'));

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.toggle('active', t === tab));
        tab.setAttribute('aria-selected', 'true');
        tabs.filter((t) => t !== tab).forEach((t) => t.setAttribute('aria-selected', 'false'));
        panels.forEach((p) => { p.hidden = p.getAttribute('data-tab-panel') !== tab.dataset.tab; });
      });
    });
  }

  /* ---------------------------------------------------------------
     11 · Build-your-bundle course calculator
     --------------------------------------------------------------- */
  function initBundleCalculator() {
    const calc = document.getElementById('bundle-calc');
    if (!calc) return;

    const BUNDLES = [
      { combo: ['Ai'], price: 2000, duration: '1 Month(s)' },
      { combo: ['Ai', 'Lr'], price: 2500, duration: '1/2 Month(s)' },
      { combo: ['Ps', 'Ai'], price: 4500, duration: '2 Month(s)' },
      { combo: ['Ps', 'Ai', 'Lr'], price: 4500, duration: '3 Month(s)' },
      { combo: ['Ai', 'Pr'], price: 5000, duration: '2 Month(s)' },
      { combo: ['Ps', 'Ai', 'Lr', 'Pr'], price: 7500, duration: '4 Month(s)' },
    ];
    const SOFTWARE_NAMES = { Ps: 'Photoshop', Ai: 'Illustrator', Lr: 'Lightroom', Pr: 'Premiere Pro' };

    const checkboxes = Array.from(calc.querySelectorAll('.bundle-toggles input[type="checkbox"]'));
    const placeholder = document.getElementById('bundle-placeholder');
    const matchEl = document.getElementById('bundle-match');
    const nomatchEl = document.getElementById('bundle-nomatch');
    const amountEl = document.getElementById('bundle-amount');
    const durationEl = document.getElementById('bundle-duration');
    const enrollLink = document.getElementById('bundle-enroll');

    function update() {
      const selected = checkboxes.filter((cb) => cb.checked).map((cb) => cb.value).sort();

      if (selected.length === 0) {
        placeholder.hidden = false;
        matchEl.hidden = true;
        nomatchEl.hidden = true;
        return;
      }
      placeholder.hidden = true;

      const match = BUNDLES.find((b) => {
        const combo = [...b.combo].sort();
        return combo.length === selected.length && combo.every((v, i) => v === selected[i]);
      });

      if (match) {
        matchEl.hidden = false;
        nomatchEl.hidden = true;
        amountEl.textContent = `R${match.price}`;
        durationEl.textContent = match.duration;
        const comboText = match.combo.map((c) => SOFTWARE_NAMES[c]).join(' + ');
        const message = `Hi, I'd like to enroll in the ${comboText} course bundle (R${match.price}).`;
        enrollLink.href = `https://wa.me/27787347867?text=${encodeURIComponent(message)}`;
      } else {
        matchEl.hidden = true;
        nomatchEl.hidden = false;
      }
    }

    checkboxes.forEach((cb) => cb.addEventListener('change', update));
    update();
  }

  /* ---------------------------------------------------------------
     Boot
     --------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initClock();
    initNav();
    initThread();
    initCursor();
    initMagnetic();
    initHero();
    initCapabilities();
    initQuickForm();
    initEasterEgg();
    initStudioTabs();
    initBundleCalculator();

    const yearEl = document.getElementById('wgs-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });
})();
