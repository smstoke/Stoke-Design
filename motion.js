/*
 * Motion: Lenis smooth scroll, page-wipe intro/transitions, and scroll reveals.
 * Needs gsap, ScrollTrigger and Lenis loaded first. Does nothing (and the page
 * stays fully visible) for reduced-motion users or if a library fails to load.
 */
(function () {
  var root = document.documentElement;
  clearTimeout(window.__wipeFailsafe);

  /* ---------- Where a navigation lands ----------
   * Following a link always starts the new page at the top, in every browser,
   * unless the link has a #hash, in which case the section is shown just below
   * the sticky nav. Back/forward still restore the old scroll position. */
  var TOP_FLAG = "stoke:land-top";
  var lenisRef = null;

  function navHeight() {
    var nav = document.querySelector(".nav");
    return nav ? nav.offsetHeight : 0;
  }
  function jumpTo(y) {
    if (lenisRef) lenisRef.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }
  function landOnTarget() {
    var viaLink = false;
    try { viaLink = sessionStorage.getItem(TOP_FLAG) === "1"; } catch (e) { /* storage blocked */ }
    var target = null;
    if (location.hash.length > 1) {
      try { target = document.querySelector(location.hash); } catch (e) { target = null; }
    }
    if (target) {
      jumpTo(Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - navHeight()));
    } else if (viaLink) {
      jumpTo(0);
    }
  }
  function clearFlag() { try { sessionStorage.removeItem(TOP_FLAG); } catch (e) { /* ignore */ } }
  landOnTarget();
  window.addEventListener("load", function () { landOnTarget(); clearFlag(); });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    root.classList.remove("has-wipe");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.05, smoothWheel: true });
    window.lenis = lenis;
    lenisRef = lenis;
    landOnTarget();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      e.preventDefault();
      if (id === "#" || id === "#top") { lenis.scrollTo(0); return; }
      var target = document.querySelector(id);
      var nav = document.querySelector(".nav");
      if (target) lenis.scrollTo(target, { offset: -(nav ? nav.offsetHeight : 0) });
    });
  }

  /* ---------- Page wipe (reveal on load, cover on navigation) ---------- */
  var panel = document.querySelector(".c-pagewipe_panel");
  var REVEAL = 0.65, COVER = 0.35, EASE = "power3.inOut";

  function reveal(done) {
    gsap.to(panel, { yPercent: 105, duration: REVEAL, ease: EASE, onComplete: done });
  }

  /* ---------- Reveals ---------- */
  var headingWords = [];
  var started = false;

  function splitWords(el) {
    // A heading can be made of styled parts (.h1-main, .h1-accent) or have a highlight span (.hl):
    // split the words inside each part so every part keeps its own styling.
    var hosts = el.querySelectorAll(".hl, .h1-main, .h1-accent");
    if (!hosts.length) hosts = [el];
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var words = [];
    Array.prototype.forEach.call(hosts, function (host) {
      var text = host.textContent.trim().replace(/\s+/g, " ");
      host.textContent = "";
      text.split(" ").forEach(function (word, i, all) {
        var mask = document.createElement("span");
        mask.className = "word-mask";
        mask.setAttribute("aria-hidden", "true");
        var inner = document.createElement("span");
        inner.className = "word";
        inner.textContent = word;
        mask.appendChild(inner);
        host.appendChild(mask);
        if (i < all.length - 1) host.appendChild(document.createTextNode(" "));
        words.push(inner);
      });
    });
    return words;
  }

  var HEADINGS = ".hero h1, .hero h4, .page-head h1, .work h2, .about h2, .service h2, .services-cta h2, .page-section > h2, .about-intro__text h2, .facts__item h2, .job h3";
  var SLIDE = ".work__grid > *, .project-grid > *, .about__img";
  var FOOTER_RISE = ".footer img, .footer__social, .footer .btn, .footer__copy";
  var RISE = ".hero p, .page-head p, .about__text p, .about__buttons, .work .btn, .project-nav, .service__body > p, .services-cta .btn, .about-intro__text p, .about-intro__logo, .job__range, .job__body p, .facts__item p";

  // Hide everything up front (the wipe panel is covering the page at this point).
  document.querySelectorAll(HEADINGS).forEach(function (el) {
    var words = splitWords(el);
    gsap.set(words, { yPercent: 120, x: -10, rotate: -4, opacity: 0 });
    var bar = el.querySelector(".hl");
    if (bar) gsap.set(bar, { "--bar": 0 });
    headingWords.push({ el: el, words: words, bar: bar });
  });
  gsap.set(SLIDE, { x: -100, opacity: 0 });
  gsap.set(RISE, { y: 24, opacity: 0 });
  gsap.set(FOOTER_RISE, { y: 24, opacity: 0 });

  function startReveals() {
    if (started) return;
    started = true;

    headingWords.forEach(function (h) {
      ScrollTrigger.create({
        trigger: h.el,
        start: "top 90%",
        onEnter: function () {
          gsap.to(h.words, {
            yPercent: 0, x: 0, rotate: 0, opacity: 1,
            duration: 1.1, ease: "power3.out",
            stagger: { each: 0.04, from: "start" }, overwrite: true
          });
          if (h.bar) gsap.to(h.bar, { "--bar": 1, duration: 0.9, delay: 0.1, ease: "power3.out", overwrite: true });
        },
        onLeaveBack: function () {
          gsap.set(h.words, { yPercent: 120, x: -10, rotate: -4, opacity: 0, overwrite: true });
          if (h.bar) gsap.set(h.bar, { "--bar": 0, overwrite: true });
        }
      });
    });

    ScrollTrigger.batch(SLIDE, {
      start: "top 90%",
      onEnter: function (els) {
        gsap.to(els, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1, overwrite: true, clearProps: "transform,opacity" });
      },
      onLeaveBack: function (els) {
        gsap.set(els, { x: -100, opacity: 0, overwrite: true });
      }
    });

    ScrollTrigger.batch(RISE, {
      start: "top 92%",
      onEnter: function (els) {
        gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true, clearProps: "transform,opacity" });
      },
      onLeaveBack: function (els) {
        gsap.set(els, { y: 24, opacity: 0, overwrite: true });
      }
    });

    ScrollTrigger.batch(FOOTER_RISE, {
      start: "top 99%",
      onEnter: function (els) {
        gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true, clearProps: "transform,opacity" });
      },
      onLeaveBack: function (els) {
        gsap.set(els, { y: 24, opacity: 0, overwrite: true });
      }
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  function intro() {
    gsap.set(panel, { yPercent: 0 });
    requestAnimationFrame(function () {
      reveal(function () { gsap.set(panel, { yPercent: 105 }); });
      // Start the headline a beat before the panel finishes lifting.
      gsap.delayedCall(REVEAL * 0.55, startReveals);
    });
  }
  intro();

  // Cover the page, then follow same-site links.
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || !a.href || e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download")) return;
    var href = a.getAttribute("href") || "";
    if (href.charAt(0) === "#") return;
    var url = new URL(a.href, location.href);
    if (url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "file:") return;
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    if (url.pathname === location.pathname && url.search === location.search) {
      // Link to the page you're already on: just glide back to the top.
      if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try { sessionStorage.setItem(TOP_FLAG, "1"); } catch (err) { /* storage blocked */ }
    gsap.set(panel, { yPercent: -105 });
    gsap.to(panel, { yPercent: 0, duration: COVER, ease: EASE, onComplete: function () { location.href = a.href; } });
  });

  // Back/forward cache restore: play the reveal again.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    gsap.set(panel, { yPercent: 0 });
    reveal(function () { gsap.set(panel, { yPercent: 105 }); });
  });
})();
