(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("archive-doc");
  document.body.classList.add("js");

  /* ---------- theme toggle ---------- */
  function applyTheme(t) {
    if (t === "dark") doc.setAttribute("data-theme", "dark");
    else doc.removeAttribute("data-theme");
  }
  try {
    var saved = localStorage.getItem("wgs_theme");
    if (saved) applyTheme(saved);
  } catch (e) {}

  var themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var isDark = doc.getAttribute("data-theme") === "dark";
      var next = isDark ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("wgs_theme", next); } catch (e) {}
    });
  }

  /* ---------- index overlay ---------- */
  var overlay = document.getElementById("ov-index");
  var openBtns = document.querySelectorAll("[data-open-index]");
  var closeBtn = overlay ? overlay.querySelector("[data-close-index]") : null;
  var lastFocus = null;

  function openOverlay() {
    if (!overlay) return;
    lastFocus = document.activeElement;
    overlay.classList.add("is-open");
    overlay.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    var closeEl = overlay.querySelector(".overlay-close");
    if (closeEl) closeEl.focus();
    document.addEventListener("keydown", onKeydown);
  }
  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("hidden", "");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocus) lastFocus.focus();
  }
  function onKeydown(e) {
    if (e.key === "Escape") closeOverlay();
  }
  openBtns.forEach(function (b) { b.addEventListener("click", openOverlay); });
  if (closeBtn) closeBtn.addEventListener("click", closeOverlay);
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay();
    });
  }

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

  /* ---------- shelf prev/next ---------- */
  var shelf = document.getElementById("shelf");
  var shelfPrev = document.querySelector('[data-shelf="prev"]');
  var shelfNext = document.querySelector('[data-shelf="next"]');
  function shelfStep(dir) {
    if (!shelf) return;
    var card = shelf.querySelector(".plate");
    var amount = card ? card.getBoundingClientRect().width + 20 : 300;
    shelf.scrollBy({ left: dir * amount, behavior: "smooth" });
  }
  if (shelfPrev) shelfPrev.addEventListener("click", function () { shelfStep(-1); });
  if (shelfNext) shelfNext.addEventListener("click", function () { shelfStep(1); });

  /* ---------- specimen focus swap ---------- */
  var specCells = document.querySelectorAll(".spec-cells button");
  var specFocus = document.getElementById("spec-focus");
  if (specCells.length && specFocus) {
    var focusGlyph = specFocus.querySelector(".glyph");
    var focusName = specFocus.querySelector(".nm");
    var focusLink = specFocus.querySelector(".go");
    var focusNo = specFocus.querySelector(".no");
    function setFocus(cell) {
      specCells.forEach(function (c) { c.classList.remove("is-on"); });
      cell.classList.add("is-on");
      if (focusGlyph) focusGlyph.innerHTML = cell.querySelector(".g").innerHTML;
      if (focusName) focusName.textContent = cell.dataset.name || "";
      if (focusNo) focusNo.textContent = cell.querySelector(".n").textContent;
      if (focusLink) focusLink.setAttribute("href", cell.dataset.href || "#");
    }
    specCells.forEach(function (cell) {
      cell.addEventListener("mouseenter", function () { setFocus(cell); });
      cell.addEventListener("focus", function () { setFocus(cell); });
    });
    setFocus(specCells[0]);
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
