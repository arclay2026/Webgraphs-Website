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

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
