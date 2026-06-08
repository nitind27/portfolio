import { Portfolio } from './types';

export function generateExportJS(portfolio: Portfolio): string {
  const popup = portfolio.popup;
  const popupEnabled = popup?.enabled;
  const popupDelay = Math.max(0, (popup?.delay ?? 2)) * 1000;
  const popupShowOnce = popup?.showOnce ?? false;
  const popupKey = JSON.stringify(`popup_${popup?.title || 'default'}`);

  return `/* Portfolio interactions */
(function () {
  'use strict';

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    });
  });

  // Section animations
  function easingCss(e) {
    if (e === 'bounce') return 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    if (e === 'snappy') return 'ease-out';
    if (e === 'linear') return 'linear';
    return 'cubic-bezier(0.22, 1, 0.36, 1)';
  }
  function applyAnimState(el, visible) {
    var type = el.getAttribute('data-anim') || 'slide-up';
    if (type === 'none') { el.style.opacity = '1'; return; }
    var dist = parseFloat(el.getAttribute('data-anim-distance') || '40');
    var scale = parseFloat(el.getAttribute('data-anim-scale') || '0.92');
    var op = parseFloat(el.getAttribute('data-anim-opacity') || '0');
    var dur = el.getAttribute('data-anim-duration') || '0.55';
    var delay = el.getAttribute('data-anim-delay') || '0';
    var ease = easingCss(el.getAttribute('data-anim-easing') || 'smooth');
    el.style.transition = 'opacity ' + dur + 's ' + ease + ' ' + delay + 's, transform ' + dur + 's ' + ease + ' ' + delay + 's, filter ' + dur + 's ' + ease + ' ' + delay + 's';
    if (visible) {
      el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none';
      el.classList.add('visible');
    } else {
      el.style.opacity = String(op);
      if (type === 'fade') el.style.transform = 'none';
      else if (type === 'slide-up') el.style.transform = 'translateY(' + dist + 'px)';
      else if (type === 'slide-down') el.style.transform = 'translateY(' + (-dist) + 'px)';
      else if (type === 'slide-left') el.style.transform = 'translateX(' + dist + 'px)';
      else if (type === 'slide-right') el.style.transform = 'translateX(' + (-dist) + 'px)';
      else if (type === 'scale' || type === 'zoom-in') el.style.transform = 'scale(' + scale + ')';
      else if (type === 'zoom-out') el.style.transform = 'scale(1.12)';
      else if (type === 'flip') el.style.transform = 'perspective(800px) rotateX(18deg) translateY(' + (dist * 0.4) + 'px)';
      else if (type === 'blur') { el.style.filter = 'blur(12px)'; el.style.transform = 'none'; }
      else if (type === 'rotate') el.style.transform = 'rotate(-6deg) scale(' + scale + ')';
      else el.style.transform = 'translateY(' + (dist * 0.6) + 'px)';
    }
  }
  function initSectionAnim(el) {
    if (el.getAttribute('data-anim') === 'none') return;
    applyAnimState(el, false);
    var hoverScale = el.getAttribute('data-hover-scale');
    var hoverLift = el.getAttribute('data-hover-lift');
    if (hoverScale || hoverLift) {
      el.addEventListener('mouseenter', function () {
        el.style.transform = 'scale(' + (hoverScale || '1') + ') translateY(' + (-(parseFloat(hoverLift || '0'))) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        if (el.classList.contains('visible')) { el.style.transform = 'none'; }
      });
    }
    if (el.classList.contains('anim-on-load') || el.getAttribute('data-anim-trigger') === 'load') {
      requestAnimationFrame(function () { applyAnimState(el, true); });
      return;
    }
    animObs.observe(el);
  }
  var animObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) applyAnimState(entry.target, true);
    });
  }, { threshold: 0.1, rootMargin: '-40px' });
  document.querySelectorAll('.fade-in, .sec-anim, .anim-on-load').forEach(initSectionAnim);

  // Navbar scroll state
  var navInner = document.querySelector('.navbar-inner');
  if (navInner) {
    window.addEventListener('scroll', function () {
      navInner.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // Mobile menu
  var menuBtn = document.getElementById('menu-btn');
  var menuOverlay = document.getElementById('mobile-menu');
  var menuClose = document.getElementById('menu-close');
  function closeMenu() {
    if (menuOverlay) menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openMenu() {
    if (menuOverlay) menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (menuOverlay) {
    menuOverlay.addEventListener('click', function (e) {
      if (e.target === menuOverlay) closeMenu();
    });
    menuOverlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  // Slideshow
  document.querySelectorAll('[data-slideshow]').forEach(function (root) {
    var slides = root.querySelectorAll('.slide');
    if (slides.length <= 1) return;
    var idx = 0;
    var timer;
    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, j) { s.classList.toggle('active', j === idx); });
      root.querySelectorAll('.slide-dot').forEach(function (d, j) {
        d.classList.toggle('active', j === idx);
      });
    }
    function next() { show(idx + 1); }
    function prev() { show(idx - 1); }
    function start() { timer = setInterval(next, 4500); }
    function stop() { clearInterval(timer); }
    var prevBtn = root.querySelector('[data-slide-prev]');
    var nextBtn = root.querySelector('[data-slide-next]');
    if (prevBtn) prevBtn.addEventListener('click', function () { stop(); prev(); start(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stop(); next(); start(); });
    root.querySelectorAll('[data-slide-to]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        stop(); show(parseInt(btn.getAttribute('data-slide-to'), 10)); start();
      });
    });
    start();
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (el) {
        el.classList.remove('open');
        var b = el.querySelector('.faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Blog modal
  var blogModal = document.getElementById('blog-modal');
  var blogModalTitle = document.getElementById('blog-modal-title');
  var blogModalBody = document.getElementById('blog-modal-body');
  var blogModalClose = document.getElementById('blog-modal-close');
  function closeBlog() { if (blogModal) blogModal.classList.remove('open'); }
  document.querySelectorAll('[data-blog-read]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = btn.getAttribute('data-blog-read');
      var tpl = document.getElementById('blog-body-' + i);
      var card = btn.closest('.blog-card');
      var titleEl = card && card.querySelector('.blog-body p[style*="font-weight:800"]');
      if (blogModalTitle && titleEl) blogModalTitle.textContent = titleEl.textContent || '';
      if (blogModalBody && tpl) blogModalBody.innerHTML = tpl.innerHTML;
      if (blogModal) blogModal.classList.add('open');
    });
  });
  if (blogModalClose) blogModalClose.addEventListener('click', closeBlog);
  if (blogModal) blogModal.addEventListener('click', function (e) { if (e.target === blogModal) closeBlog(); });

  // Contact form → mailto
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var to = form.getAttribute('data-mailto') || '';
      var fd = new FormData(form);
      var name = fd.get('name') || '';
      var from = fd.get('email') || '';
      var subject = fd.get('subject') || 'Portfolio contact';
      var message = fd.get('message') || '';
      var body = 'From: ' + name + ' (' + from + ')\\n\\n' + message;
      if (to) {
        window.location.href = 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      } else {
        window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      }
    });
  }

  // Back to top
  var backBtn = document.getElementById('back-to-top');
  if (backBtn) backBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Popup
  ${popupEnabled ? `
  (function () {
    var key = ${popupKey};
    try { if (${popupShowOnce} && sessionStorage.getItem(key)) return; } catch (e) {}
    setTimeout(function () {
      var el = document.getElementById('landing-popup');
      if (el) el.classList.add('open');
    }, ${popupDelay});
    var dismiss = document.getElementById('popup-dismiss');
    if (dismiss) dismiss.addEventListener('click', function () {
      var el = document.getElementById('landing-popup');
      if (el) el.classList.remove('open');
      try { if (${popupShowOnce}) sessionStorage.setItem(key, '1'); } catch (e) {}
    });
    var popup = document.getElementById('landing-popup');
    if (popup) popup.addEventListener('click', function (e) {
      if (e.target === popup) {
        popup.classList.remove('open');
        try { if (${popupShowOnce}) sessionStorage.setItem(key, '1'); } catch (e) {}
      }
    });
  })();` : ''}
})();
`;
}
