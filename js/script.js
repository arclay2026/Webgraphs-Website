function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const update = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const close = () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };
  const open = () => {
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  };

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('open')) close(); else open();
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function initHeroParallax() {
  const visual = document.querySelector('.hero-visual .showcase-grid');
  if (!visual || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const section = document.querySelector('.hero');
  if (!section) return;
  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    visual.style.transform = `translate(${x * -6}px, ${y * -6}px)`;
  });
  section.addEventListener('mouseleave', () => {
    visual.style.transform = 'translate(0, 0)';
  });
}

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const setTheme = (theme, persist) => {
    root.classList.add('theme-transitioning');
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    if (persist) {
      try {
        localStorage.setItem('wg_theme', theme);
      } catch (e) {
        /* ignore storage errors (private browsing, etc.) */
      }
    }
    setTimeout(() => root.classList.remove('theme-transitioning'), 350);
  };

  toggle.addEventListener('click', () => {
    const current = getCurrentTheme();
    setTheme(current === 'dark' ? 'light' : 'dark', true);
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
  initFingerprintPopup();
  initPortfolio();
  initServicesFilter();
  initTabs();
  initCoursesFilter();
  initContactForm();
  initNavbarScroll();
  initMobileMenu();
  initHeroParallax();

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
