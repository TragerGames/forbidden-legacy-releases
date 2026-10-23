/* Efeitos do site, compartilhados por todas as paginas (2026-10-23).
   Leve no celular: sem biblioteca, so transform/opacity, canvas pequeno que
   para quando sai da tela ou quando a aba fica em segundo plano.
   Com prefers-reduced-motion, nada se mexe (os jogadores pediram conforto
   visual no jogo; vale aqui tambem). Carregar com defer, no fim do body. */
(function () {
  'use strict';
  var semMovimento = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mouseFino = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (semMovimento) return;

  /* ── 1. Entrada suave das secoes ao rolar ──
     So nas secoes que a pagina ainda nao anima ([data-reveal]/.reveal ja tem o
     sistema proprio de cada pagina). A primeira secao (topo) nunca some. */
  if ('IntersectionObserver' in window) {
    var jaAnima = '[data-reveal], .reveal';
    var candidatas = Array.prototype.slice.call(document.querySelectorAll('body > section, body > main > section, body > div[id], main > div[id]'));
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('fx-visivel'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    candidatas.forEach(function (el, i) {
      if (i === 0 || el.matches(jaAnima) || el.querySelector(jaAnima) || el.closest(jaAnima)) return;
      var cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.display === 'none' || el.offsetHeight < 120) return;
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight) return; /* ja esta na tela: nao esconde */
      el.classList.add('fx-reveal');
      io.observe(el);
    });
  }

  /* ── 2. Cartas com leve inclinacao 3D (so com mouse) ── */
  if (mouseFino) {
    var SEL = '.cat-card, .card-thumb, .fx-tilt-alvo';
    var atual = null;
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest(SEL);
      if (el !== atual) {
        if (atual) { atual.classList.remove('fx-tilt-ativo'); atual.style.setProperty('--fx-rx', '0deg'); atual.style.setProperty('--fx-ry', '0deg'); }
        atual = el;
        if (el) el.classList.add('fx-tilt', 'fx-tilt-ativo');
      }
      if (!el) return;
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--fx-ry', (x * 10).toFixed(2) + 'deg');
      el.style.setProperty('--fx-rx', (-y * 10).toFixed(2) + 'deg');
    }, { passive: true });
  }

  /* ── 3. Contadores animados (numeros do topo da inicial) ── */
  function contar(el) {
    var txt = el.textContent.trim();
    var m = txt.match(/^([\d.,]+)(\D*)$/);
    if (!m) return;
    var alvo = parseInt(m[1].replace(/[.,]/g, ''), 10);
    if (!(alvo > 1)) return;
    var sep = m[1].indexOf('.') >= 0 ? '.' : (m[1].indexOf(',') >= 0 ? ',' : '');
    var fmt = function (n) { var s = String(n); return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s; };
    var t0 = null, dur = 1200;
    el.textContent = fmt(0) + m[2];
    function passo(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), suave = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(alvo * suave)) + m[2];
      if (p < 1) requestAnimationFrame(passo); else el.textContent = txt;
    }
    requestAnimationFrame(passo);
  }
  var nums = document.querySelectorAll('.hero-pill strong, .fx-contador');
  if (nums.length && 'IntersectionObserver' in window) {
    var ioN = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { contar(e.target); ioN.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { ioN.observe(n); });
  }

  /* ── 4. Poeira dourada no topo da inicial ── */
  var hero = document.querySelector('section.hero#home');
  if (hero && 'IntersectionObserver' in window) {
    if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
    var cv = document.createElement('canvas');
    cv.className = 'fx-poeira';
    cv.setAttribute('aria-hidden', 'true');
    hero.insertBefore(cv, hero.firstChild);
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0, parts = [], rodando = false, visivel = true;
    function medir() {
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var qtd = W < 700 ? 22 : 42;
      parts = [];
      for (var i = 0; i < qtd; i++) parts.push(nova(true));
    }
    function nova(qualquerAltura) {
      return {
        x: Math.random() * W, y: qualquerAltura ? Math.random() * H : H + 10,
        r: 0.6 + Math.random() * 1.8, vy: 0.12 + Math.random() * 0.35, vx: (Math.random() - 0.5) * 0.15,
        a: 0.15 + Math.random() * 0.45, fase: Math.random() * Math.PI * 2
      };
    }
    function quadro() {
      if (!rodando) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.vy; p.x += p.vx + Math.sin(p.fase += 0.01) * 0.12;
        if (p.y < -10) parts[i] = p = nova(false);
        var alfa = p.a * Math.min(1, p.y / (H * 0.35));
        ctx.beginPath();
        ctx.fillStyle = 'rgba(232,196,106,' + alfa.toFixed(3) + ')';
        ctx.shadowColor = 'rgba(232,196,106,.6)'; ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(quadro);
    }
    function atualiza() {
      var deve = visivel && !document.hidden;
      if (deve && !rodando) { rodando = true; requestAnimationFrame(quadro); }
      else if (!deve) rodando = false;
    }
    medir();
    new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; atualiza(); }).observe(hero);
    document.addEventListener('visibilitychange', atualiza);
    var tmr; window.addEventListener('resize', function () { clearTimeout(tmr); tmr = setTimeout(medir, 200); });
  }
})();
