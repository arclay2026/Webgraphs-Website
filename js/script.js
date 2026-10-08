function initPreloader() {
  const el = document.getElementById('wg-preloader');
  if (!el) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('wg-loading');

  const minDisplay = reduceMotion ? 0 : 700;
  const start = Date.now();
  let hidden = false;

  const hide = () => {
    if (hidden) return;
    hidden = true;
    const wait = Math.max(0, minDisplay - (Date.now() - start));
    setTimeout(() => {
      el.classList.add('wg-preloader-hidden');
      document.body.classList.remove('wg-loading');
      setTimeout(() => el.remove(), 650);
    }, wait);
  };

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide);
  }
  // Safety net: never let the preloader block the site if 'load' is slow/odd.
  setTimeout(hide, 3000);
}

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

function initClock() {
  const clock = document.createElement('div');
  clock.className = 'wg-clock';
  clock.setAttribute('aria-hidden', 'true');
  clock.innerHTML = '<span class="wg-clock-dot"></span><span class="wg-clock-time">--:--:--</span><span class="wg-clock-label">SAST</span>';
  document.body.appendChild(clock);

  const timeEl = clock.querySelector('.wg-clock-time');
  const update = () => {
    let text;
    try {
      text = new Intl.DateTimeFormat('en-ZA', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        timeZone: 'Africa/Johannesburg',
      }).format(new Date());
    } catch (e) {
      text = new Date().toLocaleTimeString();
    }
    timeEl.textContent = text;
  };
  update();
  setInterval(update, 1000);
}

function initHeroParallax() {
  const visual = document.querySelector('.hero-visual .showcase-grid');
  if (!visual || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const section = document.querySelector('.hero');
  if (!section) return;

  let rect = section.getBoundingClientRect();
  const refreshRect = () => { rect = section.getBoundingClientRect(); };
  window.addEventListener('resize', refreshRect, { passive: true });
  window.addEventListener('scroll', refreshRect, { passive: true });

  let pendingX = 0;
  let pendingY = 0;
  let queued = false;
  const apply = () => {
    queued = false;
    visual.style.transform = `translate(${pendingX * -6}px, ${pendingY * -6}px)`;
  };

  section.addEventListener('mousemove', (e) => {
    pendingX = (e.clientX - rect.left) / rect.width - 0.5;
    pendingY = (e.clientY - rect.top) / rect.height - 0.5;
    if (!queued) {
      queued = true;
      requestAnimationFrame(apply);
    }
  }, { passive: true });

  section.addEventListener('mouseleave', () => {
    visual.style.transform = 'translate(0, 0)';
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

function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
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

function initPriceCalculator() {
  const calc = document.querySelector('.price-calc');
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

  const checkboxes = Array.from(calc.querySelectorAll('.price-calc-toggles input[type="checkbox"]'));
  const placeholder = document.getElementById('price-calc-placeholder');
  const matchEl = document.getElementById('price-calc-match');
  const nomatchEl = document.getElementById('price-calc-nomatch');
  const amountEl = document.getElementById('price-calc-amount');
  const durationEl = document.getElementById('price-calc-duration');
  const enrollLink = document.getElementById('price-calc-enroll');

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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidSAPhone(value) {
  const digits = value.replace(/[\s-]/g, '');
  return /^(\+27|0)[1-8][0-9]{8}$/.test(digits);
}

function initCustomSelects() {
  document.querySelectorAll('select').forEach((select) => {
    if (select.dataset.wgEnhanced) return;
    select.dataset.wgEnhanced = 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'wg-select';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.classList.add('wg-select-native');
    select.tabIndex = -1;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'wg-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="wg-select-value"></span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
    wrapper.appendChild(trigger);

    const listbox = document.createElement('ul');
    listbox.className = 'wg-select-list';
    listbox.setAttribute('role', 'listbox');
    listbox.hidden = true;
    wrapper.appendChild(listbox);

    const valueEl = trigger.querySelector('.wg-select-value');
    const optionEls = Array.from(select.options).map((opt, i) => {
      const li = document.createElement('li');
      li.className = 'wg-select-option';
      li.setAttribute('role', 'option');
      li.dataset.index = String(i);
      li.textContent = opt.textContent;
      listbox.appendChild(li);
      return li;
    });

    function syncFromSelect() {
      const opt = select.options[select.selectedIndex];
      valueEl.textContent = opt ? opt.textContent : '';
      optionEls.forEach((li, i) => li.classList.toggle('is-selected', i === select.selectedIndex));
    }
    syncFromSelect();

    function closeList() {
      listbox.hidden = true;
      wrapper.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onOutsideClick);
    }
    function onOutsideClick(e) {
      if (!wrapper.contains(e.target)) closeList();
    }
    function openList() {
      listbox.hidden = false;
      wrapper.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      const active = listbox.querySelector('.is-selected') || optionEls[0];
      active?.scrollIntoView({ block: 'nearest' });
      document.addEventListener('click', onOutsideClick);
    }

    trigger.addEventListener('click', () => {
      if (listbox.hidden) openList(); else closeList();
    });

    listbox.addEventListener('click', (e) => {
      const li = e.target.closest('.wg-select-option');
      if (!li) return;
      select.selectedIndex = Number(li.dataset.index);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      syncFromSelect();
      closeList();
      trigger.focus();
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (listbox.hidden) { openList(); return; }
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        const next = Math.min(Math.max(select.selectedIndex + dir, 0), optionEls.length - 1);
        select.selectedIndex = next;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncFromSelect();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (listbox.hidden) openList(); else closeList();
      } else if (e.key === 'Escape') {
        closeList();
      }
    });
  });
}

function initChecklistLead() {
  const form = document.getElementById('checklist-lead-form');
  if (!form) return;

  const WEB3FORMS_ACCESS_KEY = 'REPLACE-WITH-YOUR-WEB3FORMS-ACCESS-KEY';
  const CHECKLIST_URL = 'assets/downloads/uber-bolt-registration-checklist.pdf';

  const nameEl = document.getElementById('lead-name');
  const phoneEl = document.getElementById('lead-phone');
  const consentEl = document.getElementById('lead-consent');
  const successEl = document.getElementById('checklist-form-success');
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitBtnDefaultHTML = submitBtn.innerHTML;

  const showError = (id, message) => {
    const el = document.getElementById(id);
    el.closest('.form-group').classList.add('has-error');
    const errEl = document.getElementById(`${id}-error`);
    if (errEl) errEl.textContent = message;
  };
  const clearError = (id) => {
    const el = document.getElementById(id);
    el.closest('.form-group').classList.remove('has-error');
    const errEl = document.getElementById(`${id}-error`);
    if (errEl) errEl.textContent = '';
  };

  nameEl.addEventListener('input', () => clearError('lead-name'));
  phoneEl.addEventListener('input', () => clearError('lead-phone'));
  consentEl.addEventListener('change', () => clearError('lead-consent'));

  const triggerDownload = () => {
    const a = document.createElement('a');
    a.href = CHECKLIST_URL;
    a.download = 'Web-Graphs-Uber-Bolt-Registration-Checklist.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (successEl) successEl.hidden = true;

    let valid = true;
    if (nameEl.value.trim().length < 2) {
      showError('lead-name', 'Please enter your full name.');
      valid = false;
    } else {
      clearError('lead-name');
    }
    if (!isValidSAPhone(phoneEl.value)) {
      showError('lead-phone', 'Enter a valid South African phone number.');
      valid = false;
    } else {
      clearError('lead-phone');
    }
    if (!consentEl.checked) {
      showError('lead-consent', 'Please confirm you agree to be contacted.');
      valid = false;
    } else {
      clearError('lead-consent');
    }
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Preparing...';

    // The free download isn't held hostage by the lead-capture backend — it starts right away.
    triggerDownload();

    try {
      const formData = new FormData(form);
      formData.set('access_key', WEB3FORMS_ACCESS_KEY);
      formData.set('subject', 'New Checklist Download Lead');
      formData.set('from_name', 'Web Graphs Technologies Website');
      await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
    } catch (err) {
      /* best-effort lead capture; the visitor already has their download */
    }

    if (successEl) {
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = submitBtnDefaultHTML;
  });
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

  const INTERVAL = 5 * 60 * 1000;
  const FIRST_VISIT_WAIT = 10000;
  let last = 0;
  try {
    last = parseInt(localStorage.getItem('wg_fp_popup_last') || '0', 10);
  } catch (e) {
    last = 0;
  }
  const elapsed = Date.now() - last;
  const firstWait = elapsed >= INTERVAL ? FIRST_VISIT_WAIT : INTERVAL - elapsed;

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

  const prevBtn = document.getElementById('portfolio-prev');
  const nextBtn = document.getElementById('portfolio-next');
  if (prevBtn && nextBtn) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollStep = () => {
      const item = grid.querySelector('.portfolio-item');
      if (!item) return grid.clientWidth;
      const gap = parseFloat(getComputedStyle(grid).columnGap || '0') || 0;
      return item.getBoundingClientRect().width + gap;
    };
    prevBtn.addEventListener('click', () => {
      grid.scrollBy({ left: -scrollStep(), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      grid.scrollBy({ left: scrollStep(), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

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

function initQrGenerator() {
  const contentEl = document.getElementById('qr-content');
  if (!contentEl || typeof qrcode !== 'function') return;

  const sizeEl = document.getElementById('qr-size');
  const eclEl = document.getElementById('qr-ecl');
  const fgEl = document.getElementById('qr-fg');
  const bgEl = document.getElementById('qr-bg');
  const canvas = document.getElementById('qr-canvas');
  const placeholder = document.getElementById('qr-placeholder');
  const downloadBtn = document.getElementById('qr-download');
  const errorEl = document.getElementById('qr-content-error');
  const ctx = canvas.getContext('2d');

  const QUIET_ZONE = 4;
  let debounceTimer = null;

  function render() {
    const text = contentEl.value.trim();
    errorEl.textContent = '';

    if (!text) {
      canvas.hidden = true;
      placeholder.hidden = false;
      downloadBtn.disabled = true;
      return;
    }

    let qr;
    try {
      qr = qrcode(0, eclEl.value || 'M');
      qr.addData(text);
      qr.make();
    } catch (err) {
      canvas.hidden = true;
      placeholder.hidden = true;
      downloadBtn.disabled = true;
      errorEl.textContent = "That's too much content for a QR code — try something shorter, or a lower error correction level.";
      return;
    }

    const moduleCount = qr.getModuleCount();
    const totalModules = moduleCount + QUIET_ZONE * 2;
    const targetSize = parseInt(sizeEl.value, 10) || 300;
    const scale = Math.max(1, Math.round(targetSize / totalModules));
    const pixelSize = scale * totalModules;

    canvas.width = pixelSize;
    canvas.height = pixelSize;

    const fg = fgEl.value || '#111111';
    const bg = bgEl.value || '#ffffff';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, pixelSize, pixelSize);
    ctx.fillStyle = fg;

    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        if (qr.isDark(row, col)) {
          ctx.fillRect((col + QUIET_ZONE) * scale, (row + QUIET_ZONE) * scale, scale, scale);
        }
      }
    }

    canvas.hidden = false;
    placeholder.hidden = true;
    downloadBtn.disabled = false;
  }

  function scheduleRender() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 150);
  }

  contentEl.addEventListener('input', scheduleRender);
  [sizeEl, eclEl, fgEl, bgEl].forEach((el) => {
    if (el) el.addEventListener('change', render);
  });

  document.querySelectorAll('.qr-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      contentEl.value = chip.dataset.fill || '';
      contentEl.focus();
      render();
    });
  });

  downloadBtn.addEventListener('click', () => {
    if (downloadBtn.disabled) return;
    const link = document.createElement('a');
    link.download = 'web-graphs-qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  render();
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

  initPreloader();
  initCustomSelects();
  initFingerprintPopup();
  initPortfolio();
  initQrGenerator();
  initServicesFilter();
  initTabs();
  initFaqAccordion();
  initCoursesFilter();
  initPriceCalculator();
  initContactForm();
  initChecklistLead();
  initNavbarScroll();
  initMobileMenu();
  initHeroParallax();
  initClock();

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
