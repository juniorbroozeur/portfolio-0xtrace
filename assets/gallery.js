/* =========================================================
   gallery.js — Galerie de captures + lightbox, nombre
   d'images VARIABLE par projet.

   Chaque carte projet a un conteneur :
     <div class="shots" data-slug="carte-bancaire" data-max="8"></div>
   Le script tente de charger carte-bancaire-1.webp, -2, -3…
   jusqu'à la première absente. Il n'affiche que celles qui
   existent réellement. Zéro image => petit cadre "à venir".

   Vanilla JS, accessible : Échap ferme, flèches naviguent,
   le focus revient à la vignette d'origine.
   ========================================================= */
(function () {
  'use strict';

  var DIR = 'assets/shots/';
  var EXT = '.webp';

  document.addEventListener('DOMContentLoaded', function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('.shots[data-slug]'));
    if (!boxes.length) return;

    // Lightbox unique
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Aperçu de la capture');
    lb.innerHTML =
      '<button class="lb-close" type="button" aria-label="Fermer">'
        + '<svg fill="none" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>'
      + '<button class="lb-nav lb-prev" type="button" aria-label="Précédente">'
        + '<svg fill="none" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>'
      + '<img alt="">'
      + '<button class="lb-nav lb-next" type="button" aria-label="Suivante">'
        + '<svg fill="none" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>'
      + '<div class="lb-cap"></div>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lb-cap');
    var gallery = [];   // images de la galerie ouverte { src, caption }
    var current = 0, opener = null;

    function draw() {
      lbImg.src = gallery[current].src;
      lbImg.alt = gallery[current].caption || 'Capture de projet';
      lbCap.textContent = gallery[current].caption || '';
      lb.querySelector('.lb-prev').style.display = gallery.length > 1 ? '' : 'none';
      lb.querySelector('.lb-next').style.display = gallery.length > 1 ? '' : 'none';
    }
    function open(list, i, btn) {
      gallery = list; current = i; opener = btn; draw();
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      if (opener) opener.focus();
    }
    function next() { current = (current + 1) % gallery.length; draw(); }
    function prev() { current = (current - 1 + gallery.length) % gallery.length; draw(); }

    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-next').addEventListener('click', next);
    lb.querySelector('.lb-prev').addEventListener('click', prev);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });

    /* Pour chaque projet : sonder -1, -2, … en série jusqu'au premier trou */
    boxes.forEach(function (box) {
      var slug = box.getAttribute('data-slug');
      var max = parseInt(box.getAttribute('data-max') || '10', 10);
      var label = box.getAttribute('data-label') || 'Capture';
      var found = [];

      function probe(n) {
        if (n > max) { return finish(); }
        var url = DIR + slug + '-' + n + EXT;
        var test = new Image();
        test.onload = function () {
          found.push({ src: url, caption: label + ' ' + n });
          probe(n + 1);
        };
        test.onerror = function () { finish(); }; // premier absent => on s'arrête
        test.src = url;
      }

      function finish() {
        if (!found.length) {
          box.classList.add('empty-box');
          box.innerHTML = '<div class="shot empty"><span>captures<br>à venir</span></div>';
          return;
        }
        var ZOOM = '<span class="zoom"><svg fill="none" stroke="#fff" viewBox="0 0 24 24">'
          + '<circle cx="11" cy="11" r="7"/><path d="m20 20-3-3M11 8v6M8 11h6"/></svg></span>';
        box.innerHTML = found.map(function (it, i) {
          return '<button class="shot" type="button" data-i="' + i + '">'
            + '<img src="' + it.src + '" alt="' + it.caption + '" loading="lazy">'
            + ZOOM + '</button>';
        }).join('');
        box.querySelectorAll('.shot').forEach(function (btn) {
          btn.addEventListener('click', function () {
            open(found, parseInt(btn.getAttribute('data-i'), 10), btn);
          });
        });
      }

      probe(1);
    });
  });
})();