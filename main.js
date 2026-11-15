// FCB For Metal — progressive enhancements. The page works without this file.
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rtl = doc.dir === "rtl";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Header turns solid once the page scrolls past the top of the hero
  var header = $(".site-header");
  var onScroll = function () { if (header) header.classList.toggle("solid", window.scrollY > 40); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var btn = $(".menu-btn");
  var nav = document.getElementById("nav");
  var closeNav = function () { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (header) header.classList.add("solid");
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { closeNav(); btn.focus(); }
    });
  }

  // Hero slideshow: real project photos, crossfading
  var slides = $$(".hero-slides .slide");
  var dots = $$(".hero-dots button");
  var cap = $(".hero-cap");
  var cur = 0, timer = null;
  var go = function (i) {
    if (!slides.length) return;
    cur = (i + slides.length) % slides.length;
    var s = slides[cur];
    var im = s.querySelector("img");
    if (im && im.loading === "lazy") im.loading = "eager";
    // Only crossfade once the next photo has loaded, so a slow connection never shows an empty frame
    if (im && !im.complete) { im.addEventListener("load", function () { go(cur); }, { once: true }); return; }
    slides.forEach(function (x, k) { x.classList.toggle("on", k === cur); });
    dots.forEach(function (d, k) { d.setAttribute("aria-current", k === cur ? "true" : "false"); });
    if (cap) cap.textContent = s.getAttribute("data-cap") || "";
  };
  var play = function () {
    if (reduce || slides.length < 2) return;
    clearInterval(timer);
    timer = setInterval(function () { if (!document.hidden) go(cur + 1); }, 6000);
  };
  if (slides.length) {
    go(0);
    dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); play(); }); });
    // Warm the next slides once the page has loaded so the first crossfade is instant
    window.addEventListener("load", function () {
      slides.slice(1).forEach(function (s) { var im = s.querySelector("img"); if (im) im.loading = "eager"; });
      play();
    });
  }

  // Reveal on scroll
  var revealEls = $$(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // Short workshop loops: load and play only while on screen, never with reduced motion
  var vids = $$("video[data-src]");
  if (!reduce && "IntersectionObserver" in window) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.src) { v.src = v.getAttribute("data-src"); }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (v.src) { v.pause(); }
      });
    }, { rootMargin: "120px 0px", threshold: 0.25 });
    vids.forEach(function (v) {
      v.addEventListener("playing", function () { v.classList.add("playing"); });
      vo.observe(v);
    });
  }

  // Gallery filters + "show more"
  var tiles = $$(".gallery .tile");
  var moreWrap = $(".gallery-more");
  var moreBtn = moreWrap && moreWrap.querySelector("button");
  var STEP = window.innerWidth < 620 ? 8 : 12;
  var filter = "all", limit = STEP;
  var apply = function () {
    var shown = 0, total = 0;
    tiles.forEach(function (t) {
      var match = filter === "all" || t.getAttribute("data-cat") === filter;
      if (match) total++;
      var on = match && shown < limit;
      if (on) shown++;
      t.hidden = !on;
    });
    if (moreWrap) moreWrap.hidden = shown >= total;
  };
  $$(".filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.getAttribute("data-filter");
      limit = STEP;
      $$(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      apply();
    });
  });
  if (moreBtn) moreBtn.addEventListener("click", function () { limit += STEP * 2; apply(); });
  if (tiles.length) apply();

  // Lightbox (gallery tiles and project "view photos" buttons)
  var dlg = document.getElementById("lightbox");
  if (dlg && typeof dlg.showModal === "function") {
    var img = dlg.querySelector("img");
    var fcap = dlg.querySelector("figcaption");
    var count = dlg.querySelector(".lb-count");
    var list = [], idx = 0;
    var show = function (i) {
      if (!list.length) return;
      idx = (i + list.length) % list.length;
      var t = list[idx];
      img.classList.add("loading");
      img.onload = function () { img.classList.remove("loading"); };
      img.sizes = "100vw";
      img.srcset = t.getAttribute("data-srcset") || "";
      img.src = t.getAttribute("data-full");
      img.alt = t.getAttribute("data-alt");
      fcap.textContent = t.getAttribute("data-alt");
      if (count) count.textContent = (idx + 1) + " / " + list.length;
      // Preload the neighbour so swiping feels instant
      var n = list[(idx + 1) % list.length];
      if (n) { var pre = new Image(); pre.sizes = "100vw"; pre.srcset = n.getAttribute("data-srcset") || ""; pre.src = n.getAttribute("data-full"); }
    };
    var open = function (items, start) { list = items; show(start); dlg.showModal(); };
    tiles.forEach(function (t) {
      t.addEventListener("click", function () {
        var vis = tiles.filter(function (x) { return filter === "all" || x.getAttribute("data-cat") === filter; });
        open(vis, vis.indexOf(t));
      });
    });
    $$("[data-project]").forEach(function (b) {
      if (b.classList.contains("tile")) return;
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-project");
        var items = tiles.filter(function (x) { return (" " + x.getAttribute("data-projects") + " ").indexOf(" " + id + " ") > -1; });
        if (items.length) open(items, 0);
      });
    });
    dlg.querySelector(".lb-close").addEventListener("click", function () { dlg.close(); });
    dlg.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    dlg.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.tagName === "FIGURE") dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") show(idx + (rtl ? -1 : 1));
      if (e.key === "ArrowLeft") show(idx + (rtl ? 1 : -1));
    });
    var x0 = null, y0 = null;
    dlg.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    dlg.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(idx + ((dx < 0) !== rtl ? 1 : -1));
      x0 = null;
    }, { passive: true });
    dlg.addEventListener("close", function () { img.removeAttribute("src"); img.removeAttribute("srcset"); });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
