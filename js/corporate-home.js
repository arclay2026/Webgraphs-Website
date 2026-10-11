(function () {
  "use strict";
  document.body.classList.add("js");

  /* ---------- mobile nav overlay ---------- */
  var overlay = document.getElementById("nav-overlay");
  var openBtn = document.querySelector("[data-open-nav]");
  var closeBtn = document.querySelector("[data-close-nav]");
  var lastFocus = null;

  function openOverlay() {
    if (!overlay) return;
    lastFocus = document.activeElement;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var closeEl = overlay.querySelector(".overlay-close");
    if (closeEl) closeEl.focus();
    document.addEventListener("keydown", onKeydown);
  }
  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocus) lastFocus.focus();
  }
  function onKeydown(e) { if (e.key === "Escape") closeOverlay(); }
  if (openBtn) openBtn.addEventListener("click", openOverlay);
  if (closeBtn) closeBtn.addEventListener("click", closeOverlay);

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -2% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    window.addEventListener("scroll", function () {
      revealEls.forEach(function (el) {
        if (!el.classList.contains("is-in")) {
          var rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight) el.classList.add("is-in");
        }
      });
    }, { passive: true });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- services carousel ---------- */
  var carousel = document.querySelector(".svc-carousel");
  if (carousel) {
    var track = carousel.querySelector(".svc-track");
    var slides = carousel.querySelectorAll(".svc-slide");
    var dots = carousel.querySelectorAll(".svc-dot");
    var pauseBtn = carousel.querySelector(".svc-pause");
    var current = 0;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(i, userInitiated) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        var on = idx === current;
        slide.classList.toggle("is-active", on);
        if (on) { slide.removeAttribute("aria-hidden"); slide.inert = false; }
        else { slide.setAttribute("aria-hidden", "true"); slide.inert = true; }
      });
      dots.forEach(function (dot, idx) {
        // re-setting aria-current restarts the progress animation from zero
        dot.setAttribute("aria-current", "false");
        if (idx === current) { void dot.offsetWidth; dot.setAttribute("aria-current", "true"); }
      });
      track.setAttribute("aria-live", userInitiated ? "polite" : "off");
    }

    function setPaused(paused) {
      carousel.classList.toggle("is-paused", paused);
      carousel.classList.remove("is-stopped");
      pauseBtn.setAttribute("aria-label", paused ? "Play slide rotation" : "Pause slide rotation");
    }

    // the active dot's progress animation is the timer: when it finishes, advance
    carousel.addEventListener("animationend", function (e) {
      if (e.animationName === "svc-progress") show(current + 1, false);
    });

    carousel.querySelectorAll("[data-svc-step]").forEach(function (btn) {
      btn.addEventListener("click", function () { show(current + Number(btn.dataset.svcStep), true); });
    });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () { show(Number(dot.dataset.svcGo), true); });
    });
    pauseBtn.addEventListener("click", function () {
      setPaused(!(carousel.classList.contains("is-paused") || carousel.classList.contains("is-stopped")));
    });

    // hold rotation while the visitor is reading or interacting
    carousel.addEventListener("mouseenter", function () { carousel.classList.add("is-held"); });
    carousel.addEventListener("mouseleave", function () { carousel.classList.remove("is-held"); });
    carousel.addEventListener("focusin", function () { carousel.classList.add("is-held"); });
    carousel.addEventListener("focusout", function (e) {
      if (!carousel.contains(e.relatedTarget)) carousel.classList.remove("is-held");
    });

    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { show(current - 1, true); e.preventDefault(); }
      if (e.key === "ArrowRight") { show(current + 1, true); e.preventDefault(); }
    });

    var startX = null, startY = null;
    track.addEventListener("pointerdown", function (e) { startX = e.clientX; startY = e.clientY; });
    track.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1), true);
      startX = null;
    });

    if (reduceMotion) {
      carousel.classList.add("is-stopped");
      pauseBtn.setAttribute("aria-label", "Play slide rotation");
    }
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
