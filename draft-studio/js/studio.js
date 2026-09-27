/* Draft Studio — site behaviour. Content lives in js/catalog.js. */
(function () {
  "use strict";

  var DATA = window.DRAFT_STUDIO || { site: {}, templates: [], logos: [], icons: [] };
  var SITE = DATA.site || {};
  var page = document.body.getAttribute("data-page");

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uniq(arr) { return arr.filter(function (v, i) { return v && arr.indexOf(v) === i; }); }
  function formatsOf(item) { return uniq((item.files || []).map(function (f) { return String(f.format).toUpperCase(); })); }
  function previewOf(item) {
    if (item.preview) return item.preview;
    var svg = (item.files || []).filter(function (f) { return String(f.format).toUpperCase() === "SVG"; })[0];
    return svg ? svg.path : "";
  }
  function newestFirst(a, b) { return String(b.date || "").localeCompare(String(a.date || "")); }
  function fileName(path) { return String(path).split("/").pop(); }
  function badge(f, extra) { return '<span class="fmt fmt-' + esc(f) + (extra ? " " + extra : "") + '">' + esc(f) + "</span>"; }
  function matches(item, q) {
    if (!q) return true;
    var hay = [item.title, item.name, item.category, item.description].concat(item.tags || []).join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  var ICON_SVG = {
    download: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    link: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
    copy: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
  };

  var toastTimer;
  function toast(msg) {
    var t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2000);
  }
  function copyText(text, msg) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(msg); } catch (e) { toast("Copy failed"); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast(msg); }, fallback);
    else fallback();
  }
  function saveBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- theme + nav ---------- */
  var toggle = $(".theme-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (dark) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", "dark");
    try { localStorage.setItem("ds_theme", dark ? "light" : "dark"); } catch (e) {}
  });
  var menuBtn = $(".menu-toggle");
  if (menuBtn) menuBtn.addEventListener("click", function () {
    var open = $(".main-nav").classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });

  /* ---------- footer / site details ---------- */
  $all("[data-site]").forEach(function (el) {
    var key = el.getAttribute("data-site");
    if (key === "email") {
      if (SITE.email) { el.href = "mailto:" + SITE.email; el.textContent = SITE.email; } else el.remove();
    } else if (key === "email-button") {
      if (SITE.email) el.href = "mailto:" + SITE.email;
      else if (SITE.whatsapp) el.href = "https://wa.me/" + String(SITE.whatsapp).replace(/\D/g, "");
      else { var sec = el.closest("[data-site-section]"); if (sec) sec.remove(); }
    } else if (key === "whatsapp") {
      if (SITE.whatsapp) el.href = "https://wa.me/" + String(SITE.whatsapp).replace(/\D/g, ""); else el.remove();
    } else if (key === "instagram") {
      if (SITE.instagram) el.href = SITE.instagram; else el.remove();
    } else if (SITE[key]) {
      el.textContent = SITE[key];
    }
  });
  $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- modal ---------- */
  var modal = $("#modal");
  var lastFocus = null;
  function openModal(html, small) {
    lastFocus = document.activeElement;
    modal.innerHTML =
      '<div class="modal-panel' + (small ? " small" : "") + '" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<button class="icon-btn modal-close" aria-label="Close">' + ICON_SVG.close + "</button>" + html + "</div>";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus();
  }
  function closeModal() {
    if (!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.innerHTML = "";
    document.body.style.overflow = "";
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus) lastFocus.focus();
  }
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest(".modal-close")) closeModal();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  /* ---------- design items (templates & logos) ---------- */
  function cardHTML(item) {
    var prev = previewOf(item);
    return '<button class="card" data-id="' + esc(item.id) + '">' +
      '<div class="thumb">' + (prev ? '<img src="' + esc(prev) + '" alt="" loading="lazy">' : "") + "</div>" +
      '<div class="card-body"><h3>' + esc(item.title) + "</h3>" +
      '<div class="card-meta"><span class="cat">' + esc(item.category) + '</span><span class="card-fmts">' +
      formatsOf(item).map(function (f) { return badge(f); }).join("") + "</span></div></div></button>";
  }

  function openItem(item) {
    var prev = previewOf(item);
    var files = (item.files || []).map(function (f) {
      var fmt = String(f.format).toUpperCase();
      return '<div class="dl-item">' + badge(fmt) +
        '<span class="dl-name">' + esc(fileName(f.path)) + (f.size ? " · " + esc(f.size) : "") + "</span>" +
        '<a class="btn btn-primary btn-sm" href="' + esc(f.path) + '" download>' + ICON_SVG.download + " Download</a></div>";
    }).join("");
    openModal(
      '<div class="modal-preview thumb">' + (prev ? '<img src="' + esc(prev) + '" alt="Preview of ' + esc(item.title) + '">' : "") + "</div>" +
      '<div class="modal-info">' +
      '<span class="cat" style="color:var(--ink-2);font-size:14px">' + esc(item.category) + "</span>" +
      '<h2 id="modal-title">' + esc(item.title) + "</h2>" +
      (item.description ? '<p class="desc">' + esc(item.description) + "</p>" : "") +
      (item.tags && item.tags.length ? '<div class="tags">' + item.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div>" : "") +
      '<div class="dl-list">' + (files || '<p class="desc">No files attached yet.</p>') + "</div>" +
      '<div class="row"><button class="btn btn-ghost btn-sm" data-share>' + ICON_SVG.link + " Copy link</button></div>" +
      (SITE.license ? '<p class="license-note"><strong>License:</strong> ' + esc(SITE.license) + "</p>" : "") +
      "</div>"
    );
    history.replaceState(null, "", "#" + item.id);
    $("[data-share]", modal).addEventListener("click", function () { copyText(location.href, "Link copied"); });
  }

  function bindCards(container, list) {
    container.addEventListener("click", function (e) {
      var card = e.target.closest(".card");
      if (!card) return;
      var item = list.filter(function (i) { return i.id === card.getAttribute("data-id"); })[0];
      if (item) openItem(item);
    });
  }

  function listingPage(type) {
    var all = (DATA[type] || []).slice().sort(newestFirst);
    var params = new URLSearchParams(location.search);
    var state = { q: params.get("q") || "", cat: params.get("cat") || "", fmt: params.get("fmt") || "", sort: "new" };

    var grid = $("#grid"), count = $("#count"), search = $("#search"), catSel = $("#category"), sortSel = $("#sort"), chipBox = $("#formats");
    search.value = state.q;

    uniq(all.map(function (i) { return i.category; })).sort().forEach(function (c) {
      var o = document.createElement("option"); o.value = c; o.textContent = c; catSel.appendChild(o);
    });
    catSel.value = state.cat;

    if (chipBox) {
      var fmts = uniq([].concat.apply([], all.map(formatsOf)));
      chipBox.innerHTML = ['<button class="chip" data-fmt="">All formats</button>'].concat(fmts.map(function (f) {
        return '<button class="chip" data-fmt="' + esc(f) + '">' + esc(f) + "</button>";
      })).join("");
      chipBox.addEventListener("click", function (e) {
        var c = e.target.closest(".chip"); if (!c) return;
        state.fmt = c.getAttribute("data-fmt"); render();
      });
    }

    function render() {
      var list = all.filter(function (i) {
        return matches(i, state.q) && (!state.cat || i.category === state.cat) && (!state.fmt || formatsOf(i).indexOf(state.fmt) !== -1);
      });
      if (state.sort === "az") list.sort(function (a, b) { return a.title.localeCompare(b.title); });
      grid.innerHTML = list.length ? list.map(cardHTML).join("") :
        '<div class="empty">' + (all.length ? "Nothing matches your search. Try another word or clear the filters." : "New designs are coming soon.") + "</div>";
      count.textContent = list.length + (list.length === 1 ? " design" : " designs");
      if (chipBox) $all(".chip", chipBox).forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-fmt") === state.fmt); });

      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.cat) p.set("cat", state.cat);
      if (state.fmt) p.set("fmt", state.fmt);
      var qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    }

    search.addEventListener("input", function () { state.q = search.value.trim(); render(); });
    catSel.addEventListener("change", function () { state.cat = catSel.value; render(); });
    sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); });
    bindCards(grid, all);
    render();

    var hashId = decodeURIComponent(location.hash.slice(1));
    var target = all.filter(function (i) { return i.id === hashId; })[0];
    if (target) openItem(target);
  }

  /* ---------- icons ---------- */
  var svgCache = {};
  function loadSvg(path) {
    if (!svgCache[path]) {
      svgCache[path] = fetch(path).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      }).catch(function () { return null; });
    }
    return svgCache[path];
  }
  // Make an SVG string size-able by CSS: drop fixed width/height on the root <svg>
  function fluid(svg) {
    return svg.replace(/<\?xml[^>]*>/, "").replace(/<svg\b([^>]*)>/, function (m, attrs) {
      return "<svg" + attrs.replace(/\s(width|height)="[^"]*"/g, "") + ' aria-hidden="true">';
    });
  }
  function recolor(svg, color) { return svg.replace(/currentColor/g, color); }
  function sized(svg, size) {
    return svg.replace(/<svg\b([^>]*)>/, function (m, attrs) {
      return "<svg" + attrs.replace(/\s(width|height)="[^"]*"/g, "") + ' width="' + size + '" height="' + size + '">';
    });
  }
  function fillGlyph(el, icon) {
    loadSvg(icon.file).then(function (svg) {
      el.innerHTML = svg ? fluid(svg) : '<img src="' + esc(icon.file) + '" alt="">';
    });
  }

  function iconTile(icon) {
    return '<button class="icon-tile" data-id="' + esc(icon.id) + '" title="' + esc(icon.name) + '">' +
      '<span class="glyph" data-file="' + esc(icon.file) + '"></span><span>' + esc(icon.name) + "</span></button>";
  }
  function hydrateGlyphs(root, list) {
    $all(".icon-tile", root).forEach(function (tile) {
      var icon = list.filter(function (i) { return i.id === tile.getAttribute("data-id"); })[0];
      if (icon) fillGlyph($(".glyph", tile), icon);
    });
  }

  function iconColor() {
    var c = $("#icon-color");
    return c ? c.value : (document.documentElement.getAttribute("data-theme") === "dark" ? "#f4f2ee" : "#16161a");
  }

  function openIcon(icon) {
    var color = iconColor();
    openModal(
      '<div class="modal-preview thumb" style="--icon-color:' + esc(color) + '"><div class="big-glyph"></div></div>' +
      '<div class="modal-info">' +
      '<span style="color:var(--ink-2);font-size:14px">' + esc(icon.category) + " icon</span>" +
      '<h2 id="modal-title">' + esc(icon.name) + "</h2>" +
      '<div class="row">' +
      '<label class="field">Colour<input type="color" id="m-color" value="' + esc(color) + '" style="width:48px;height:36px;border:1px solid var(--line);border-radius:8px;background:var(--surface)"></label>' +
      '<label class="field">PNG size<select id="m-size" class="select"><option>64</option><option>128</option><option selected>256</option><option>512</option><option>1024</option></select></label>' +
      "</div>" +
      '<div class="row">' +
      '<button class="btn btn-primary btn-sm" data-act="svg">' + ICON_SVG.download + " SVG</button>" +
      '<button class="btn btn-dark btn-sm" data-act="png">' + ICON_SVG.download + " PNG</button>" +
      '<button class="btn btn-ghost btn-sm" data-act="copy">' + ICON_SVG.copy + " Copy SVG</button>" +
      "</div>" +
      '<textarea class="code-box" readonly aria-label="SVG code"></textarea>' +
      (SITE.license ? '<p class="license-note"><strong>License:</strong> ' + esc(SITE.license) + "</p>" : "") +
      "</div>", true
    );
    history.replaceState(null, "", "#" + icon.id);

    var big = $(".big-glyph", modal), preview = $(".modal-preview", modal), code = $(".code-box", modal), colorIn = $("#m-color", modal);
    fillGlyph(big, icon);
    loadSvg(icon.file).then(function (raw) {
      function current() { return raw ? recolor(raw, colorIn.value).trim() : ""; }
      code.value = raw ? current() : "SVG code preview needs the site to be served from a web server (e.g. GitHub Pages).";
      colorIn.addEventListener("input", function () {
        preview.style.setProperty("--icon-color", colorIn.value);
        if (raw) code.value = current();
      });
      modal.querySelector(".modal-info").addEventListener("click", function (e) {
        var btn = e.target.closest("[data-act]"); if (!btn) return;
        var act = btn.getAttribute("data-act");
        if (!raw) { window.open(icon.file, "_blank"); return; }
        if (act === "copy") copyText(current(), "SVG code copied");
        if (act === "svg") saveBlob(new Blob([current()], { type: "image/svg+xml" }), icon.id + ".svg");
        if (act === "png") {
          var size = parseInt($("#m-size", modal).value, 10);
          var img = new Image();
          img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            canvas.getContext("2d").drawImage(img, 0, 0, size, size);
            canvas.toBlob(function (b) { saveBlob(b, icon.id + "-" + size + ".png"); });
          };
          img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(sized(current(), size));
        }
      });
    });
  }

  function iconsPage() {
    var all = (DATA.icons || []).slice();
    var params = new URLSearchParams(location.search);
    var state = { q: params.get("q") || "", cat: params.get("cat") || "" };
    var grid = $("#grid"), count = $("#count"), search = $("#search"), catSel = $("#category");
    var colorIn = $("#icon-color"), sizeIn = $("#icon-size");
    search.value = state.q;

    uniq(all.map(function (i) { return i.category; })).sort().forEach(function (c) {
      var o = document.createElement("option"); o.value = c; o.textContent = c; catSel.appendChild(o);
    });
    catSel.value = state.cat;

    // Default the colour to the current theme's ink colour
    colorIn.value = document.documentElement.getAttribute("data-theme") === "dark" ? "#f4f2ee" : "#16161a";
    function applyLook() {
      grid.style.setProperty("--icon-color", colorIn.value);
      grid.style.setProperty("--icon-size", sizeIn.value + "px");
    }
    colorIn.addEventListener("input", applyLook);
    sizeIn.addEventListener("input", applyLook);
    applyLook();

    function render() {
      var list = all.filter(function (i) { return matches(i, state.q) && (!state.cat || i.category === state.cat); });
      grid.innerHTML = list.length ? list.map(iconTile).join("") : '<div class="empty">No icons match your search.</div>';
      hydrateGlyphs(grid, list);
      count.textContent = list.length + (list.length === 1 ? " icon" : " icons");
      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.cat) p.set("cat", state.cat);
      var qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    }
    search.addEventListener("input", function () { state.q = search.value.trim(); render(); });
    catSel.addEventListener("change", function () { state.cat = catSel.value; render(); });
    grid.addEventListener("click", function (e) {
      var t = e.target.closest(".icon-tile"); if (!t) return;
      var icon = all.filter(function (i) { return i.id === t.getAttribute("data-id"); })[0];
      if (icon) openIcon(icon);
    });
    render();

    var hashId = decodeURIComponent(location.hash.slice(1));
    var target = all.filter(function (i) { return i.id === hashId; })[0];
    if (target) openIcon(target);
  }

  /* ---------- home ---------- */
  function homePage() {
    var t = DATA.templates || [], l = DATA.logos || [], i = DATA.icons || [];
    function setCount(sel, n, word) { var el = $(sel); if (el) el.textContent = n + " " + word + (n === 1 ? "" : "s"); }
    setCount("#count-templates", t.length, "template");
    setCount("#count-icons", i.length, "icon");
    setCount("#count-logos", l.length, "logo");

    var featured = t.concat(l).filter(function (x) { return x.featured; }).sort(newestFirst).slice(0, 6);
    if (!featured.length) featured = t.concat(l).sort(newestFirst).slice(0, 6);
    var fgrid = $("#featured");
    fgrid.innerHTML = featured.length ? featured.map(cardHTML).join("") : '<div class="empty">New designs are coming soon.</div>';
    bindCards(fgrid, featured);

    var strip = $("#icon-strip");
    var some = i.slice(0, 12);
    strip.innerHTML = some.map(iconTile).join("");
    hydrateGlyphs(strip, some);
    strip.addEventListener("click", function (e) {
      var tile = e.target.closest(".icon-tile"); if (!tile) return;
      location.href = "icons.html#" + tile.getAttribute("data-id");
    });

    // Hero collage uses the newest previews
    var previews = t.concat(l).sort(newestFirst).map(previewOf).filter(Boolean);
    $all(".hero-art [data-prev]").forEach(function (el, n) {
      if (previews[n]) el.innerHTML = '<img src="' + esc(previews[n]) + '" alt="">';
    });
    var art = $(".hero-art .t3");
    if (art) {
      i.slice(0, 4).forEach(function (icon) {
        var s = document.createElement("span"); s.className = "g"; art.appendChild(s);
        loadSvg(icon.file).then(function (svg) { s.innerHTML = svg ? fluid(svg) : ""; });
      });
    }

    var form = $("#hero-search");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = $("#hero-q").value.trim();
      var dest = $("#hero-type").value;
      location.href = dest + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  if (page === "home") homePage();
  if (page === "templates") listingPage("templates");
  if (page === "logos") listingPage("logos");
  if (page === "icons") iconsPage();
})();
