/* =========================================================
   0xTRACE — app.js
   Aucun handler inline dans le HTML : tout est ici, ce qui
   permet de servir une CSP stricte sans 'unsafe-inline'.
   ========================================================= */
(function () {
  'use strict';

  /* Marque que JS tourne. Les animations de révélation ne
     s'appliquent que dans ce cas : sans JS, tout reste visible. */
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Menu mobile accessible ---------- */
    var btn = document.querySelector('.menu-btn');
    var nav = document.getElementById('nav');

    if (btn && nav) {
      var setOpen = function (open) {
        nav.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      };

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpen(!nav.classList.contains('open'));
      });

      // Fermer au clic sur un lien
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
      });

      // Fermer au clic à l'extérieur
      document.addEventListener('click', function (e) {
        if (!nav.classList.contains('open')) return;
        if (!nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
      });

      // Fermer avec Échap et rendre le focus au bouton
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
          setOpen(false);
          btn.focus();
        }
      });

      // Si on repasse en desktop, réinitialiser l'état
      var mq = window.matchMedia('(min-width:861px)');
      var onChange = function () { if (mq.matches) setOpen(false); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    /* ---------- Année automatique dans le footer ---------- */
    var years = document.querySelectorAll('[data-year]');
    var y = new Date().getFullYear();
    for (var i = 0; i < years.length; i++) years[i].textContent = y;

    /* ---------- Révélation au scroll ----------
       IntersectionObserver : zéro reflow forcé, contrairement
       à un listener scroll qui appelle getBoundingClientRect. */
    var blocks = document.querySelectorAll('.reveal');
    if (!blocks.length) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !('IntersectionObserver' in window)) {
      for (var j = 0; j < blocks.length; j++) blocks[j].classList.add('shown');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('shown');
        io.unobserve(entry.target); // une seule fois, puis on libère
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    for (var k = 0; k < blocks.length; k++) io.observe(blocks[k]);
  });
})();