function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-particles';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['255,255,255', '240,198,116', '77,124,255'];
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
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
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
      ctx.fillStyle = `rgba(${p.color}, ${twinkle})`;
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
      <div class="popup-price"><span class="currency">R</span>300</div>
      <p>Fast, professional biometric fingerprint capture for Uber and Bolt driver-partner registration — walk in, no long queues.</p>
      <div class="popup-actions">
        <a href="https://wa.me/27787347867?text=${encodeURIComponent("Hi, I'd like to book an Uber/Bolt fingerprint capture (R300).")}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fa-brands fa-whatsapp"></i> Book on WhatsApp</a>
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

  const filterBar = document.getElementById('portfolio-filters');
  const items = Array.from(grid.querySelectorAll('.portfolio-item'));

  if (filterBar && items.length) {
    filterBar.hidden = false;
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach((item) => {
        item.style.display = filter === 'all' || item.dataset.category === filter ? '' : 'none';
      });
    });
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

  initParticles();
  initFingerprintPopup();
  initPortfolio();

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const service = document.getElementById('service').value;
      const message = document.getElementById('message').value.trim();
      const text = `Hi Web Graphs Technologies, my name is ${name}. I'm interested in: ${service}. ${message}`;
      const url = `https://wa.me/27787347867?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
  }
});
