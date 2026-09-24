const PARTICLE_PALETTES = {
  dark: ['255,255,255', '240,198,116', '77,124,255'],
  light: ['30,32,40', '176,128,20', '43,75,189'],
};

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-particles';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paletteName = getCurrentTheme();
  window.addEventListener('wg-theme-change', () => {
    paletteName = getCurrentTheme();
    if (reduceMotion) draw(0);
  });
  let particles = [];
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const createParticles = () => {
    const count = Math.min(80, Math.round((width * height) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      colorIdx: Math.floor(Math.random() * 3),
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    const colors = PARTICLE_PALETTES[paletteName];
    particles.forEach((p) => {
      if (!reduceMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }
      const twinkle = reduceMotion ? 0.5 : 0.35 + 0.25 * Math.sin(time / 1200 + p.phase);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${colors[p.colorIdx]}, ${twinkle})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!reduceMotion) requestAnimationFrame(draw);
  };

  resize();
  createParticles();
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
  draw(0);
}

function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const setTheme = (theme, persist) => {
    root.classList.add('theme-transitioning');
    root.setAttribute('data-theme', theme);
    window.dispatchEvent(new Event('wg-theme-change'));
    if (persist) {
      try {
        localStorage.setItem('wg_theme', theme);
      } catch (e) {
        /* ignore storage errors (private browsing, etc.) */
      }
    }
    setTimeout(() => root.classList.remove('theme-transitioning'), 450);
  };

  toggle.addEventListener('click', () => {
    const current = getCurrentTheme();
    setTheme(current === 'light' ? 'dark' : 'light', true);
  });
}

function setupFilterBar(barEl, items, getCategory) {
  if (!barEl || !items.length) return;
  barEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    barEl.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    items.forEach((item) => {
      item.style.display = filter === 'all' || getCategory(item) === filter ? '' : 'none';
    });
  });
}

function initTabs() {
  document.querySelectorAll('.tab-bar').forEach((bar) => {
    const panels = Array.from(bar.parentElement.querySelectorAll(':scope > .tab-panel'));
    if (!panels.length) return;
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      bar.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      panels.forEach((panel) => {
        const active = panel.dataset.panel === target;
        panel.hidden = !active;
        if (active) panel.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
      });
    });
  });
}

function initServicesFilter() {
  const bar = document.getElementById('services-filters');
  const grid = document.getElementById('services-grid');
  if (!bar || !grid) return;
  setupFilterBar(bar, Array.from(grid.querySelectorAll('.card')), (item) => item.dataset.category);
}

function initCoursesFilter() {
  const bar = document.getElementById('course-filters');
  const grid = document.getElementById('course-grid');
  if (!bar || !grid) return;
  setupFilterBar(bar, Array.from(grid.querySelectorAll('.course-card')), (item) => item.dataset.software);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidSAPhone(value) {
  const digits = value.replace(/[\s-]/g, '');
  return /^(\+27|0)[1-8][0-9]{8}$/.test(digits);
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name: {
      el: document.getElementById('name'),
      validate: (v) => v.trim().length >= 2,
      message: 'Please enter your full name.',
    },
    age: {
      el: document.getElementById('age'),
      validate: (v) => /^\d+$/.test(v.trim()) && Number(v) >= 1 && Number(v) <= 120,
      message: 'Enter a valid age (1-120).',
    },
    email: {
      el: document.getElementById('email'),
      validate: (v) => isValidEmail(v),
      message: 'Enter a valid email address.',
    },
    phone: {
      el: document.getElementById('phone'),
      validate: (v) => isValidSAPhone(v),
      message: 'Enter a valid South African phone number (e.g. 078 734 7867).',
    },
    address: {
      el: document.getElementById('address'),
      validate: (v) => v.trim().length >= 5,
      message: 'Please enter your address.',
    },
  };

  const showError = (key, message) => {
    const { el } = fields[key];
    el.closest('.form-group').classList.add('has-error');
    const errEl = document.getElementById(`${key}-error`);
    if (errEl) errEl.textContent = message;
  };

  const clearError = (key) => {
    const { el } = fields[key];
    el.closest('.form-group').classList.remove('has-error');
    const errEl = document.getElementById(`${key}-error`);
    if (errEl) errEl.textContent = '';
  };

  Object.keys(fields).forEach((key) => {
    fields[key].el.addEventListener('input', () => clearError(key));
  });

  const successEl = document.getElementById('form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (successEl) successEl.hidden = true;

    let valid = true;
    Object.keys(fields).forEach((key) => {
      const { el, validate, message } = fields[key];
      if (!validate(el.value)) {
        showError(key, message);
        valid = false;
      } else {
        clearError(key);
      }
    });
    if (!valid) return;

    const name = fields.name.el.value.trim();
    const age = fields.age.el.value.trim();
    const email = fields.email.el.value.trim();
    const phone = fields.phone.el.value.trim();
    const address = fields.address.el.value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();

    const lines = [
      "Hi Web Graphs Technologies, I'd like to get in touch.",
      `Name: ${name}`,
      `Age: ${age}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Address: ${address}`,
      `Service: ${service}`,
    ];
    if (message) lines.push(`Message: ${message}`);

    window.open(`https://wa.me/27787347867?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');

    if (successEl) {
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    form.reset();
  });
}

function initHeroNetwork() {
  const canvas = document.getElementById('hero-network');
  if (!canvas) return;
  const container = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  if (!ctx || !container) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINK_DIST = 130;
  const MOUSE_DIST = 160;
  let width = 0;
  let height = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [];
  const mouse = { x: 0, y: 0, active: false };

  const resize = () => {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const createNodes = () => {
    const count = Math.min(46, Math.max(18, Math.round((width * height) / 9000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 1.4,
    }));
  };

  const step = () => {
    if (reduceMotion) return;
    nodes.forEach((n) => {
      if (mouse.active) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST && dist > 0.01) {
          const force = (1 - dist / MOUSE_DIST) * 0.06;
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }
      }
      n.vx *= 0.98;
      n.vy *= 0.98;
      const speed = Math.hypot(n.vx, n.vy);
      const maxSpeed = 0.9;
      if (speed > maxSpeed) {
        n.vx = (n.vx / speed) * maxSpeed;
        n.vy = (n.vy / speed) * maxSpeed;
      }
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
      n.x = Math.max(0, Math.min(width, n.x));
      n.y = Math.max(0, Math.min(height, n.y));
    });
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = `rgba(78, 185, 111, ${0.35 * (1 - dist / LINK_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      nodes.forEach((n) => {
        const dist = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (dist < MOUSE_DIST) {
          ctx.strokeStyle = `rgba(240, 198, 116, ${0.55 * (1 - dist / MOUSE_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      });
      ctx.beginPath();
      ctx.fillStyle = 'rgba(240, 198, 116, 0.9)';
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(78, 185, 111, 0.9)';
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const loop = () => {
    step();
    draw();
    if (!reduceMotion) requestAnimationFrame(loop);
  };

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  resize();
  createNodes();
  window.addEventListener('resize', () => {
    resize();
    createNodes();
  });
  loop();
}

function initTiltCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = document.querySelectorAll('.card, .course-card, .portfolio-item');
  cards.forEach((card) => {
    card.classList.add('tilt-card');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 7;
      const rotateY = (x - 0.5) * 7;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function initFingerprintPopup() {
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Uber and Bolt fingerprint capture pricing');
  overlay.innerHTML = `
    <div class="popup-card">
      <button type="button" class="popup-close" aria-label="Close">&times;</button>
      <div class="popup-icon"><i class="fa-solid fa-fingerprint"></i></div>
      <span class="section-tag">Fingerprint Capture</span>
      <h3>Uber &amp; Bolt Registration</h3>
      <div class="popup-price"><span class="currency">R</span>350</div>
      <p>Fast, professional biometric fingerprint capture for Uber and Bolt driver-partner registration — walk in, no long queues.</p>
      <div class="popup-actions">
        <a href="https://wa.me/27787347867?text=${encodeURIComponent("Hi, I'd like to book an Uber/Bolt fingerprint capture (R350).")}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fa-brands fa-whatsapp"></i> Book on WhatsApp</a>
        <button type="button" class="popup-dismiss">Not now</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const open = () => {
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  };

  const close = () => {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector('.popup-close').addEventListener('click', close);
  overlay.querySelector('.popup-dismiss').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  const INTERVAL = 3 * 60 * 1000;
  let last = 0;
  try {
    last = parseInt(localStorage.getItem('wg_fp_popup_last') || '0', 10);
  } catch (e) {
    last = 0;
  }
  const elapsed = Date.now() - last;
  const firstWait = elapsed >= INTERVAL ? 2000 : INTERVAL - elapsed;

  const trigger = () => {
    open();
    try {
      localStorage.setItem('wg_fp_popup_last', Date.now().toString());
    } catch (e) {
      /* ignore storage errors (private browsing, etc.) */
    }
    setTimeout(trigger, INTERVAL);
  };

  setTimeout(trigger, firstWait);
}

function initPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  const lightbox = document.getElementById('lightbox');
  if (!grid || !lightbox) return;

  const controls = document.getElementById('portfolio-controls');
  const filterBar = document.getElementById('portfolio-filters');
  const searchInput = document.getElementById('portfolio-search');
  const items = Array.from(grid.querySelectorAll('.portfolio-item'));

  if (controls && items.length) {
    controls.hidden = false;
    let activeFilter = 'all';

    const applyFilters = () => {
      const query = (searchInput?.value || '').trim().toLowerCase();
      items.forEach((item) => {
        const matchesCategory = activeFilter === 'all' || item.dataset.category === activeFilter;
        const title = (item.querySelector('img')?.alt || '').toLowerCase();
        const matchesQuery = !query || title.includes(query);
        item.style.display = matchesCategory && matchesQuery ? '' : 'none';
      });
    };

    if (filterBar) {
      filterBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
      });
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
  }

  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = lightbox.querySelector('.popup-close');

  const openLightbox = (item) => {
    const img = item.querySelector('img');
    if (!img) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt || '';
    lightbox.classList.add('active');
    document.body.classList.add('no-scroll');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.classList.remove('no-scroll');
  };

  items.forEach((item) => item.addEventListener('click', () => openLightbox(item)));
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach((el) => observer.observe(el));

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initThemeToggle();
  initParticles();
  initHeroNetwork();
  initTiltCards();
  initFingerprintPopup();
  initPortfolio();
  initServicesFilter();
  initTabs();
  initCoursesFilter();
  initContactForm();

  const quickQuoteForm = document.getElementById('quick-quote-form');
  if (quickQuoteForm) {
    quickQuoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('qq-name').value.trim();
      const service = document.getElementById('qq-service').value;
      const text = `Hi Web Graphs Technologies, my name is ${name}. I'd like a quote for: ${service}.`;
      window.open(`https://wa.me/27787347867?text=${encodeURIComponent(text)}`, '_blank');
    });
  }
});
