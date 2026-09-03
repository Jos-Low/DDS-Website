(function () {
    'use strict';
  
    // Mobile nav
    var toggle = document.getElementById('nav-toggle');
    var nav    = document.getElementById('site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  
    // Submenu toggles (mobile)
    document.querySelectorAll('.nav__item--has-sub .nav__trigger').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (window.matchMedia('(min-width: 960px)').matches) return;
        e.preventDefault();
        var item = btn.closest('.nav__item--has-sub');
        var open = item.classList.toggle('is-open');
        document.querySelectorAll('.nav__item--has-sub').forEach(function (other) {
          if (other !== item) { other.classList.remove('is-open'); }
        });
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  
    // Scroll reveal — [data-reveal] + legacy .reveal elements
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ('IntersectionObserver' in window) {
      var revealIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealIo.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(function (el) {
        if (reduceMotion) el.classList.add('is-visible');
        else revealIo.observe(el);
      });

      var legacyEls = document.querySelectorAll('.step, .why-card, .review, .faq__item, .gallery__item, .svc-benefit, .svc-step');
      legacyEls.forEach(function (el) { el.classList.add('reveal'); });
      var legacyIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
          entry.target.style.transitionDelay = Math.min(siblings.indexOf(entry.target) * 70, 350) + 'ms';
          entry.target.classList.add('visible');
          legacyIo.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
      legacyEls.forEach(function (el) {
        if (reduceMotion) el.classList.add('visible');
        else legacyIo.observe(el);
      });
    } else {
      document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(function (el) {
        el.classList.add('is-visible');
      });
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
    }
  
    // Sticky header shadow
    var header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', function () {
        header.style.boxShadow = window.scrollY > 8 ? '0 2px 16px rgba(0,0,0,.5)' : '';
      }, { passive: true });
    }
  
    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
          if (nav) { nav.classList.remove('is-open'); toggle && toggle.setAttribute('aria-expanded', 'false'); }
        }
      });
    });
  })();

// Scroll-linked before/after hero crossfade
(function () {
  var bgs = document.querySelectorAll('.svc-hero__bg--crossfade');
  if (!bgs.length) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  bgs.forEach(function (bg) {
    var after = bg.querySelector('.svc-hero__bg-layer--after');
    var section = bg.closest('.svc-hero');
    if (!after || !section) return;

    if (reduceMotion) {
      after.style.opacity = 1;
      return;
    }

    var ticking = false;
    function update() {
      var rect = section.getBoundingClientRect();
      var total = rect.height || 1;
      var scrolled = Math.min(Math.max(-rect.top, 0), total);
      after.style.opacity = scrolled / total;
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
  });
})();
