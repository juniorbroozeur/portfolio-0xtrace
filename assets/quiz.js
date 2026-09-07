/* =========================================================
   quiz.js — Quiz de cybersécurité, 100% côté client.
   Aucune donnée envoyée : scores stockés en localStorage.
   Le pseudo saisi est TOUJOURS échappé avant affichage
   (pas de XSS stocké sur le portfolio d'un pentester).
   ========================================================= */
(function () {
  'use strict';

  /* ----- Banques de questions -----
     Format : { q: énoncé, o: [options], a: index correct, e: explication } */
  var BANKS = {
    web: {
      label: 'Sécurité web & bug bounty',
      questions: [
        { q: "Une API renvoie /api/orders/1043. En changeant 1043 par 1044, tu vois la commande d'un autre client. De quelle faille s'agit-il ?",
          o: ["IDOR / BOLA", "XSS stocké", "SSRF", "Injection SQL"], a: 0,
          e: "Accès direct à l'objet d'un autre utilisateur sans contrôle d'autorisation : c'est une IDOR (Insecure Direct Object Reference), aussi appelée BOLA sur les API." },
        { q: "Quel type de XSS s'exécute entièrement dans le navigateur, sans que la charge passe jamais par le serveur ?",
          o: ["XSS réfléchi", "XSS stocké", "XSS basé sur le DOM", "XSS aveugle"], a: 2,
          e: "Le XSS DOM-based résulte d'un traitement non sûr côté client (ex. innerHTML depuis location.hash) ; la charge ne transite pas forcément par le serveur." },
        { q: "Une application récupère une URL fournie par l'utilisateur et va la chercher côté serveur. Quel risque cela crée-t-il en priorité ?",
          o: ["CSRF", "SSRF", "Clickjacking", "Open redirect"], a: 1,
          e: "Si le serveur va chercher une URL contrôlée par l'attaquant, on parle de SSRF — souvent utilisé pour atteindre les métadonnées cloud internes (169.254.169.254)." },
        { q: "Que protège en priorité un jeton anti-CSRF ?",
          o: ["La confidentialité des données", "L'intégrité d'une action initiée par l'utilisateur", "Le chiffrement du transport", "La disponibilité du serveur"], a: 1,
          e: "Le CSRF force la victime authentifiée à exécuter une action non voulue. Le jeton prouve que la requête vient bien de l'application, pas d'un site tiers." },
        { q: "Dans un JWT, que garantit la signature ?",
          o: ["Que le contenu est chiffré", "Que le contenu n'a pas été modifié", "Que le jeton n'expire jamais", "Que l'utilisateur est administrateur"], a: 1,
          e: "Un JWT n'est pas chiffré par défaut : son payload est seulement encodé en base64. La signature garantit l'intégrité, pas la confidentialité." },
        { q: "Quelle attaque vise l'introspection d'une API GraphQL ?",
          o: ["Cartographier tout le schéma de l'API", "Injecter du SQL", "Voler un cookie de session", "Saturer le serveur"], a: 0,
          e: "L'introspection GraphQL, si elle est activée en production, révèle tout le schéma : types, champs, mutations — une carte complète de la surface d'attaque." },
        { q: "Un champ 'role' modifiable dans le corps d'une requête de mise à jour de profil relève de quelle faille ?",
          o: ["Mass assignment", "Path traversal", "XXE", "Race condition"], a: 0,
          e: "L'affectation de masse (mass assignment) laisse l'utilisateur écrire des champs qu'il ne devrait pas contrôler, comme son propre rôle." },
        { q: "Quelle catégorie est en tête de l'OWASP Top 10 2021 ?",
          o: ["Injection", "Broken Access Control", "Cryptographic Failures", "SSRF"], a: 1,
          e: "Depuis 2021, le contrôle d'accès défaillant (Broken Access Control) est la catégorie n°1 — c'est aussi la plus rentable en bug bounty." },
        { q: "Pourquoi une validation faite uniquement côté client (JavaScript) n'est-elle pas une protection de sécurité ?",
          o: ["Elle est trop lente", "L'attaquant contrôle entièrement le client et peut la contourner", "Elle consomme trop de mémoire", "Elle n'est pas compatible mobile"], a: 1,
          e: "Tout ce qui s'exécute dans le navigateur peut être modifié ou contourné. La sécurité doit toujours être validée côté serveur." },
        { q: "Dans une reconnaissance, à quoi sert l'analyse des fichiers JavaScript d'une cible ?",
          o: ["À la ralentir", "À découvrir des endpoints, des clés et des chemins cachés", "À la chiffrer", "À tester sa charge"], a: 1,
          e: "Les fichiers JS front-end contiennent souvent des références à des endpoints d'API, des sous-domaines, voire des secrets oubliés." }
      ]
    },
    general: {
      label: 'Cybersécurité générale',
      questions: [
        { q: "Qu'est-ce qui rend un mot de passe réellement plus solide ?",
          o: ["Le remplacer par des symboles (p@ssw0rd)", "Sa longueur", "Le changer chaque semaine", "L'écrire en majuscules"], a: 1,
          e: "La longueur prime sur la complexité : une phrase de passe longue résiste mieux qu'un mot court truffé de symboles prévisibles." },
        { q: "Qu'est-ce que l'authentification à deux facteurs (2FA) ajoute ?",
          o: ["Un deuxième mot de passe", "Une preuve d'un autre type que le mot de passe", "Un antivirus", "Un pare-feu"], a: 1,
          e: "Le 2FA combine deux catégories : ce que tu sais (mot de passe) et ce que tu possèdes (téléphone, clé) ou ce que tu es (biométrie)." },
        { q: "Un email urgent te demande de cliquer un lien pour 'vérifier ton compte bancaire'. C'est un cas typique de :",
          o: ["Spam", "Phishing (hameçonnage)", "Malware", "Ransomware"], a: 1,
          e: "Le phishing joue sur l'urgence et l'imitation d'un tiers de confiance pour te faire cliquer ou saisir tes identifiants." },
        { q: "À quoi sert le HTTPS (le cadenas) sur un site ?",
          o: ["Le site est sans danger et honnête", "La connexion est chiffrée entre toi et le site", "Le site n'a pas de virus", "Le site est officiel"], a: 1,
          e: "Le cadenas garantit le chiffrement du transport, pas l'honnêteté du site : un site de phishing peut aussi avoir un cadenas." },
        { q: "Qu'est-ce qu'un ransomware (rançongiciel) ?",
          o: ["Un logiciel qui chiffre tes fichiers et exige une rançon", "Un email publicitaire", "Un pare-feu", "Un gestionnaire de mots de passe"], a: 0,
          e: "Le ransomware chiffre les données de la victime et réclame un paiement pour la clé. La meilleure défense reste des sauvegardes hors ligne." },
        { q: "Pourquoi éviter le Wi-Fi public ouvert pour des opérations sensibles ?",
          o: ["Il est trop lent", "Le trafic peut être intercepté par d'autres sur le réseau", "Il vide la batterie", "Il coûte cher"], a: 1,
          e: "Sur un réseau ouvert, un attaquant sur le même point d'accès peut intercepter ou manipuler le trafic non chiffré. Un VPN atténue ce risque." },
        { q: "À quoi sert un gestionnaire de mots de passe ?",
          o: ["Créer et stocker un mot de passe unique et fort par site", "Accélérer internet", "Bloquer les pubs", "Chiffrer le disque"], a: 0,
          e: "Il génère et retient un mot de passe unique par service : tu n'en réutilises aucun, et une fuite sur un site n'expose pas les autres." },
        { q: "Que signifie 'principe du moindre privilège' ?",
          o: ["Donner à chacun uniquement les accès nécessaires à sa tâche", "Interdire tous les accès", "Donner l'accès admin à tous", "Supprimer les comptes"], a: 0,
          e: "Chaque compte ne reçoit que les droits strictement nécessaires : si un compte est compromis, les dégâts restent limités." },
        { q: "Une mise à jour logicielle corrige souvent quoi, du point de vue sécurité ?",
          o: ["Des failles connues", "La couleur de l'interface", "La vitesse uniquement", "Rien d'important"], a: 0,
          e: "Les mises à jour colmatent des vulnérabilités connues. Un logiciel non à jour est une porte d'entrée privilégiée des attaquants." },
        { q: "Qu'est-ce que le chiffrement de bout en bout garantit dans une messagerie ?",
          o: ["Seuls l'expéditeur et le destinataire peuvent lire les messages", "Les messages ne s'effacent jamais", "La messagerie est gratuite", "Les messages sont publics"], a: 0,
          e: "En chiffrement de bout en bout, même le fournisseur du service ne peut pas lire le contenu : seules les deux extrémités le peuvent." }
      ]
    }
  };

  var RANKS = [
    { min: 10, name: "Élite", verdict: "Sans faute. Tu as le réflexe d'un professionnel." },
    { min: 8,  name: "Analyste confirmé", verdict: "Solide. Il te manque juste quelques détails pointus." },
    { min: 6,  name: "Apprenti sérieux", verdict: "Bonne base. Regarde la correction pour combler les trous." },
    { min: 3,  name: "Curieux", verdict: "Tu débroussailles. La correction va t'apprendre beaucoup." },
    { min: 0,  name: "Débutant", verdict: "On commence tous quelque part. Lis la correction, puis rejoue." }
  ];

  var KEY = 'oxtrace_quiz_scores_v1';

  /* ----- Anti-XSS : échappe tout texte avant insertion HTML ----- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function $(id) { return document.getElementById(id); }

  /* ----- Stockage local ----- */
  function loadScores() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function saveScore(entry) {
    var all = loadScores();
    all.push(entry);
    all.sort(function (a, b) { return b.score - a.score || a.t - b.t; });
    all = all.slice(0, 10); // top 10
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
    return all;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!$('q-home')) return; // pas sur la page quiz

    var state = { theme: null, i: 0, score: 0, picked: null, answers: [] };

    var elHome = $('q-home'), elPlay = $('q-play'), elResult = $('q-result');

    function show(el) {
      [elHome, elPlay, elResult].forEach(function (s) { s.hidden = (s !== el); });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ---------- Tableau des scores (accueil du quiz) ---------- */
    function renderBoard() {
      var scores = loadScores();
      var box = $('q-board-home');
      if (!scores.length) { box.hidden = true; return; }
      box.hidden = false;
      var rows = scores.map(function (s, n) {
        var theme = s.theme === 'web' ? 'Web' : 'Général';
        return '<div class="rowline">'
          + '<span class="ic" aria-hidden="true"><b style="font-family:inherit">' + (n + 1) + '</b></span>'
          + '<div class="lbl"><b>' + esc(s.name) + '</b><span>' + theme + '</span></div>'
          + '<div class="val"><b>' + s.score + '/10</b></div>'
          + '</div>';
      }).join('');
      $('q-board').innerHTML = rows;
    }
    renderBoard();

    $('q-clear').addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      renderBoard();
    });

    /* ---------- Démarrer un quiz ---------- */
    document.querySelectorAll('.quiz-pick').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.theme = btn.getAttribute('data-theme');
        state.i = 0; state.score = 0; state.picked = null; state.answers = [];
        $('q-theme-label').textContent = BANKS[state.theme].label;
        show(elPlay);
        renderQuestion();
      });
    });

    /* ---------- Afficher une question ---------- */
    function renderQuestion() {
      var bank = BANKS[state.theme];
      var item = bank.questions[state.i];
      state.picked = null;

      $('q-progress').textContent = 'Question ' + (state.i + 1) + ' / ' + bank.questions.length;
      $('q-bar').className = 'w' + Math.round((state.i) / bank.questions.length * 100);
      $('q-stem').textContent = item.q;
      $('q-feedback').textContent = '';
      var next = $('q-next');
      next.disabled = true;
      next.textContent = 'Valider';

      var opts = $('q-options');
      opts.innerHTML = '';
      item.o.forEach(function (txt, idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'rowline quiz-opt';
        b.style.width = '100%';
        b.style.textAlign = 'left';
        b.style.cursor = 'pointer';
        b.style.background = 'none';
        b.style.border = 'none';
        b.style.borderTop = '1px solid var(--line)';
        b.innerHTML = '<span class="ic" aria-hidden="true">'
          + '<b style="font-family:inherit">' + String.fromCharCode(65 + idx) + '</b></span>'
          + '<div class="lbl"><b style="font-weight:500">' + esc(txt) + '</b></div>';
        b.addEventListener('click', function () { pick(idx, b); });
        opts.appendChild(b);
      });
    }

    /* ---------- Sélectionner une réponse ---------- */
    function pick(idx, btn) {
      if (state.picked !== null) return; // déjà répondu
      state.picked = idx;
      var item = BANKS[state.theme].questions[state.i];
      var correct = item.a;
      state.answers.push({ picked: idx, correct: correct });

      var buttons = $('q-options').querySelectorAll('.quiz-opt');
      buttons.forEach(function (b, n) {
        b.style.cursor = 'default';
        var lbl = b.querySelector('.lbl b');
        if (n === correct) { b.style.color = 'var(--good)'; lbl.innerHTML += '  ✓'; }
        else if (n === idx) { b.style.color = 'var(--accent)'; lbl.innerHTML += '  ✗'; }
        else { b.style.opacity = '.55'; }
      });

      if (idx === correct) {
        state.score++;
        $('q-feedback').innerHTML = '<b style="color:var(--good)">Correct.</b> ' + esc(item.e);
      } else {
        $('q-feedback').innerHTML = '<b style="color:var(--accent)">Raté.</b> ' + esc(item.e);
      }

      var next = $('q-next');
      next.disabled = false;
      next.textContent = (state.i + 1 < BANKS[state.theme].questions.length) ? 'Question suivante' : 'Voir mon résultat';
    }

    /* ---------- Question suivante / fin ---------- */
    $('q-next').addEventListener('click', function () {
      if (state.picked === null) return;
      state.i++;
      if (state.i < BANKS[state.theme].questions.length) {
        renderQuestion();
      } else {
        showResult();
      }
    });

    /* ---------- Résultat ---------- */
    function showResult() {
      var total = BANKS[state.theme].questions.length;
      var rank = RANKS.find(function (r) { return state.score >= r.min; });
      $('q-rank').textContent = rank.name;
      $('q-score').textContent = state.score + '/' + total;
      $('q-verdict').textContent = rank.verdict;
      $('q-saved-note').hidden = true;
      $('q-name').value = '';

      // Correction détaillée
      var list = $('q-review-list');
      list.innerHTML = '';
      BANKS[state.theme].questions.forEach(function (item, n) {
        var ans = state.answers[n];
        var good = ans.picked === item.a;
        var row = document.createElement('div');
        row.className = 'rowline';
        row.innerHTML = '<span class="ic" aria-hidden="true">'
          + (good ? '<svg fill="none" stroke="var(--good)" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>'
                  : '<svg fill="none" stroke="var(--accent)" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>')
          + '</span><div class="lbl"><b style="font-weight:500">' + esc(item.q) + '</b>'
          + '<span>Bonne réponse : ' + esc(item.o[item.a]) + '</span></div>';
        list.appendChild(row);
      });

      show(elResult);
    }

    /* ---------- Enregistrer le score ---------- */
    $('q-save').addEventListener('click', function () {
      var raw = $('q-name').value.trim();
      if (!raw) { $('q-name').focus(); return; }
      var name = raw.slice(0, 24); // borne dure
      saveScore({ name: name, score: state.score, theme: state.theme, t: Date.now() });
      $('q-saved-note').hidden = false;
      renderBoard();
    });

    /* ---------- Rejouer ---------- */
    $('q-again').addEventListener('click', function () {
      renderBoard();
      show(elHome);
    });
  });
})();