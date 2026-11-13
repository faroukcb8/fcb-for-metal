// FCB For Metal — small progressive enhancements. The page works without this file.
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  // Mobile menu
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }

  // Reveal on scroll
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // Gallery filters
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".gallery .tile"));
  document.querySelectorAll(".filters button").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      document.querySelectorAll(".filters button").forEach(function (x) {
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
      tiles.forEach(function (t) { t.hidden = !(f === "all" || t.getAttribute("data-cat") === f); });
    });
  });

  // Lightbox
  var dlg = document.getElementById("lightbox");
  if (dlg && typeof dlg.showModal === "function") {
    var img = dlg.querySelector("img");
    var cap = dlg.querySelector("figcaption");
    var current = 0;
    var visible = function () { return tiles.filter(function (t) { return !t.hidden; }); };
    var show = function (i) {
      var list = visible();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      var t = list[current];
      img.src = t.getAttribute("data-full");
      img.alt = t.getAttribute("data-alt");
      cap.textContent = t.getAttribute("data-alt");
    };
    tiles.forEach(function (t) {
      t.addEventListener("click", function () {
        show(visible().indexOf(t));
        dlg.showModal();
      });
    });
    dlg.querySelector(".lb-close").addEventListener("click", function () { dlg.close(); });
    dlg.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    dlg.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", function (e) {
      var rtl = doc.dir === "rtl";
      if (e.key === "ArrowRight") show(current + (rtl ? -1 : 1));
      if (e.key === "ArrowLeft") show(current + (rtl ? 1 : -1));
    });
    dlg.addEventListener("close", function () { img.removeAttribute("src"); });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
