/* Black Friday no Founder (2026-11-18, Trager). Liga pela caixinha "Founder" da
   pagina Black Friday do painel (pagar/admin_black_friday.php); o servidor diz
   o que vale em pagar/black_friday.php e o checkout cobra o mesmo valor.
   Aqui so se pinta o preco: R$ 39,90 / US$ 20 viram "riscado + novo" onde quer
   que aparecam (cartao do Founder, metodos de pagamento, janela do Pix, barras
   de oferta) e um selo BLACK FRIDAY entra no cartao do Founder. O desenho e
   refeito a cada segundo porque as barras repintam o preco sozinhas; no fim
   da promocao tudo volta ao texto original. A conta repete
   fl_bf_total_centavos(): total - round(total * X / 100), em centavos. */
(function () {
  'use strict';
  if (window.__flBfFounder) return;
  window.__flBfFounder = true;

  var BRL = 39.90, USD = 20;
  var ALVOS = '.fl-preco-br,.fl-preco-int,.price-amount,.pay-method-price,.pay-method-desc,.pix-amount,#offer-bar-price,.fl-oferta-preco,.pay-stripe-price';
  var bf = null, dif = 0, timer = null;

  function agora() { return Math.floor(Date.now() / 1000) + dif; }
  function noAr() {
    if (!bf || !bf.founder || !(bf.pct > 0)) return false;
    var a = agora();
    return !(bf.fim_utc && a >= bf.fim_utc) && !(bf.inicio_utc && a < bf.inicio_utc);
  }
  function desconto(v) { var t = Math.round(v * 100); return (t - Math.round(t * bf.pct / 100)) / 100; }
  function brl(v) { return 'R$&nbsp;' + v.toFixed(2).replace('.', ','); }
  function usd(v) { var s = v.toFixed(2); return 'US$&nbsp;' + (s.slice(-3) === '.00' ? s.slice(0, -3) : s); }

  /* R$ 39,90 (com espaco, &nbsp; ou &thinsp;), R$ 39.90 em ingles, US$ 20 e $20 USD */
  var RE_BRL = /R\$(?:\s|&nbsp;|&thinsp;| | )*39[,.]90/g;
  var RE_USD = /US\$(?:\s|&nbsp;| )*20(?![.,\d])|\$(?:\s|&nbsp;| )*20(?:\.00)?(?:(?:\s|&nbsp;| )*USD)?(?![.,\d])/g;

  function pintar() {
    var on = noAr();
    document.querySelectorAll(ALVOS).forEach(function (el) {
      if (on) {
        if (el.querySelector('s.fl-bf-de')) return;
        var html = el.innerHTML;
        if (!RE_BRL.test(html) && !RE_USD.test(html)) { RE_BRL.lastIndex = 0; RE_USD.lastIndex = 0; return; }
        RE_BRL.lastIndex = 0; RE_USD.lastIndex = 0;
        el.dataset.flBfOrig = html;
        el.innerHTML = html
          /* funcao, nao texto: "R$&nbsp;" no texto de troca seria lido como "$&" */
          .replace(RE_BRL, function () { return '<s class="fl-bf-de">' + brl(BRL) + '</s> ' + brl(desconto(BRL)); })
          .replace(RE_USD, function () { return '<s class="fl-bf-de">' + usd(USD) + '</s> ' + usd(desconto(USD)); });
      } else if (el.dataset.flBfOrig !== undefined) {
        if (el.querySelector('s.fl-bf-de')) el.innerHTML = el.dataset.flBfOrig;
        delete el.dataset.flBfOrig;
      }
    });
    /* o cartao do Founder (o primeiro .fl-preco da pagina e o do Gratis) */
    var pb = document.querySelector('.fl-preco-br'), preco = pb ? pb.closest('.fl-preco') : null;
    var selo = document.getElementById('fl-bf-selo');
    if (on && preco && !selo) {
      selo = document.createElement('div');
      selo.id = 'fl-bf-selo';
      selo.className = 'fl-bf-selo';
      preco.parentNode.insertBefore(selo, preco);
    }
    if (selo) {
      if (!on) { selo.remove(); }
      else {
        var f = bf.fim_utc ? Math.max(0, bf.fim_utc - agora()) : 0;
        var d = Math.floor(f / 86400), h = Math.floor(f % 86400 / 3600), m = Math.floor(f % 3600 / 60), s = f % 60;
        var dd = function (n) { return (n < 10 ? '0' : '') + n; };
        var htmlSelo = '<b>BLACK FRIDAY</b><i>-' + bf.pct + '%</i>' +
          (bf.fim_utc ? '<span>' + (d > 0 ? d + 'd ' : '') + dd(h) + ':' + dd(m) + ':' + dd(s) + '</span>' : '');
        /* so mexe no DOM quando muda: o observador de mutacoes chama pintar() */
        if (selo.dataset.html !== htmlSelo) { selo.dataset.html = htmlSelo; selo.innerHTML = htmlSelo; }
      }
    }
    if (!on && bf && bf.fim_utc && agora() >= bf.fim_utc) { bf = null; clearInterval(timer); timer = null; }
  }

  var css = document.createElement('style');
  css.textContent =
    's.fl-bf-de{opacity:.55;font-size:.72em;text-decoration-thickness:2px;text-decoration-color:#ff5a4e;margin-right:.25em;white-space:nowrap}' +
    '.fl-bf-selo{display:flex;align-items:center;justify-content:flex-start;gap:8px;flex-wrap:wrap;margin:4px 0 8px;font-family:"Bebas Neue",Impact,sans-serif;letter-spacing:.06em}' +
    '.fl-bf-selo b{font-weight:400;font-size:18px;color:#0b0b0d;background:linear-gradient(90deg,#f0c35a,#ffe8a8);padding:3px 8px 1px;border-radius:5px}' +
    '.fl-bf-selo i{font-style:normal;font-size:24px;color:#ff5a4e}' +
    '.fl-bf-selo span{font-size:16px;color:#ffe8a8;font-variant-numeric:tabular-nums}';
  document.head.appendChild(css);


  /* ── AVISO AO ENTRAR (2026-11-18, Trager): janela da Black Friday com X para
     fechar, nos 4 idiomas (segue o idioma escolhido no site). Aparece uma vez
     por visita (sessao do navegador) enquanto a Black Friday estiver no ar.
     Imagem: a mesma do pop-up do jogo (pagar/promo_popup.php), se houver. */
  var BANNER_TXT = {
    pt: { t: 'em todo o site', s: '{O} com {P}% de desconto até {D}. Souls, Stars, Tickets e cartas UR continuam iguais: só o preço cai.', souls: 'Ver pacotes de Souls', founder: 'Quero o Founder', fim: 'Termina em', fechar: 'Fechar' },
    en: { t: 'sitewide', s: '{O}: {P}% off until {D}. Souls, Stars, Tickets and UR cards stay the same: only the price drops.', souls: 'See Souls packs', founder: 'Get Founder', fim: 'Ends in', fechar: 'Close' },
    es: { t: 'en todo el sitio', s: '{O} con {P}% de descuento hasta {D}. Las Souls, Stars, Tickets y cartas UR siguen iguales: solo baja el precio.', souls: 'Ver paquetes de Souls', founder: 'Quiero el Founder', fim: 'Termina en', fechar: 'Cerrar' },
    vi: { t: 'toàn trang', s: '{O} giảm {P}% đến {D}. Souls, Stars, Vé và thẻ UR giữ nguyên: chỉ giá giảm.', souls: 'Xem gói Souls', founder: 'Nhận Founder', fim: 'Kết thúc sau', fechar: 'Đóng' }
  };
  var BANNER_LIGADO = false; // aviso ao entrar: liga depois do ok do Trager
  var banner = null, bannerImg = '';

  function bfAtiva() {
    if (!bf || !(bf.pct > 0)) return false;
    var a = agora();
    return !(bf.fim_utc && a >= bf.fim_utc) && !(bf.inicio_utc && a < bf.inicio_utc);
  }
  function idioma() {
    var l = document.documentElement.getAttribute('data-lang-ativo') || '';
    if (!BANNER_TXT[l]) { try { l = localStorage.getItem('fl_lang') || ''; } catch (e) {} }
    return BANNER_TXT[l] ? l : 'pt';
  }
  function dataFim(l) {
    if (!bf.fim_utc) return '';
    try {
      var loc = { pt: 'pt-BR', en: 'en-US', es: 'es-ES', vi: 'vi-VN' }[l];
      var f = new Intl.DateTimeFormat(loc, { timeZone: 'America/Sao_Paulo', day: 'numeric', month: l === 'en' ? 'short' : '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
      return f.format(new Date(bf.fim_utc * 1000)) + ' (' + { pt: 'horário de Brasília', en: 'Brasília time', es: 'hora de Brasilia', vi: 'giờ Brasília' }[l] + ')';
    } catch (e) { return ''; }
  }
  /* O que entra: "todos os pacotes" so quando a lista do painel esta vazia. */
  function oQue(l) {
    var todos = !(bf.pacotes && bf.pacotes.length), f = !!bf.founder;
    var T = {
      pt: [todos ? 'Todos os pacotes de Souls' : 'Pacotes de Souls selecionados', ' e a versão Founder'],
      en: [todos ? 'Every Souls pack' : 'Selected Souls packs', ' and the Founder version'],
      es: [todos ? 'Todos los paquetes de Souls' : 'Paquetes de Souls seleccionados', ' y la versión Founder'],
      vi: [todos ? 'Mọi gói Souls' : 'Các gói Souls được chọn', ' và bản Founder']
    }[l];
    return T[0] + (f ? T[1] : '');
  }
  function chaveFechado() { return 'fl_bf_banner_off_' + (bf ? bf.fim_utc : ''); }
  function fecharBanner() {
    try { sessionStorage.setItem(chaveFechado(), '1'); } catch (e) {}
    if (banner) { banner.classList.remove('on'); var b = banner; banner = null; setTimeout(function () { b.remove(); }, 300); }
    document.removeEventListener('keydown', escBanner);
  }
  function escBanner(e) { if (e.key === 'Escape') fecharBanner(); }
  function desenharBanner() {
    if (!banner) return;
    var l = idioma(), x = BANNER_TXT[l], naLoja = /loja\.html$/.test(location.pathname);
    banner.querySelector('.fl-bfb-caixa').innerHTML =
      '<button type="button" class="fl-bfb-x" aria-label="' + x.fechar + '">✕</button>' +
      (bannerImg ? '<img class="fl-bfb-img" src="' + bannerImg + '" alt="" width="600" height="760">' : '') +
      '<div class="fl-bfb-corpo"><div class="fl-bfb-selo">BLACK FRIDAY</div>' +
      '<div class="fl-bfb-tit"><b>-' + bf.pct + '%</b> ' + x.t + '</div>' +
      '<p>' + x.s.replace('{O}', oQue(l)).replace('{P}', bf.pct).replace('{D}', dataFim(l)) + '</p>' +
      '<div class="fl-bfb-relogio"><small>' + x.fim + '</small><span></span></div>' +
      '<div class="fl-bfb-bts">' +
        (naLoja ? '' : '<a class="fl-bfb-bt" href="loja.html">' + x.souls + '</a>') +
        (bf.founder ? '<a class="fl-bfb-bt fl-bfb-bt2" href="index.html#comprar">' + x.founder + '</a>' : '') +
      '</div></div>';
    banner.querySelector('.fl-bfb-x').addEventListener('click', fecharBanner);
    banner.querySelectorAll('.fl-bfb-bt').forEach(function (a) { a.addEventListener('click', function () { try { sessionStorage.setItem(chaveFechado(), '1'); } catch (e) {} if (a.getAttribute('href').indexOf('#comprar') >= 0 && /(^\/$|index\.html$)/.test(location.pathname)) fecharBanner(); }); });
    relogioBanner();
  }
  function relogioBanner() {
    if (!banner) return;
    if (!bfAtiva()) { fecharBanner(); return; }
    var el = banner.querySelector('.fl-bfb-relogio span');
    if (!el || !bf.fim_utc) return;
    var f = Math.max(0, bf.fim_utc - agora()), d = Math.floor(f / 86400), h = Math.floor(f % 86400 / 3600), m = Math.floor(f % 3600 / 60), sg = f % 60;
    var dd = function (n) { return (n < 10 ? '0' : '') + n; };
    el.textContent = (d > 0 ? d + 'd ' : '') + dd(h) + ':' + dd(m) + ':' + dd(sg);
  }
  function abrirBanner() {
    if (banner || !bfAtiva()) return;
    try { if (sessionStorage.getItem(chaveFechado())) return; } catch (e) {}
    var css2 = document.createElement('style');
    css2.textContent =
      '.fl-bfb{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;background:rgba(0,0,0,.72);opacity:0;transition:opacity .25s}' +
      '.fl-bfb.on{opacity:1}' +
      '.fl-bfb-caixa{position:relative;display:flex;gap:18px;align-items:center;max-width:720px;width:100%;max-height:calc(100vh - 32px);overflow:auto;padding:18px;border-radius:16px;' +
        'background:linear-gradient(160deg,#17110a,#0b0b0d 60%);border:1px solid #f0c35a;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(240,195,90,.18);color:#f3e9d2;font-family:Inter,system-ui,sans-serif}' +
      '.fl-bfb-img{width:240px;height:auto;border-radius:10px;flex-shrink:0}' +
      '.fl-bfb-corpo{flex:1;min-width:0}' +
      '.fl-bfb-selo{display:inline-block;font:22px/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.1em;color:#0b0b0d;background:linear-gradient(90deg,#f0c35a,#ffe8a8);padding:6px 10px 4px;border-radius:6px}' +
      '.fl-bfb-tit{margin:10px 0 6px;font:30px/1.05 "Bebas Neue",Impact,sans-serif;letter-spacing:.04em;color:#ffe8a8}' +
      '.fl-bfb-tit b{font-weight:400;font-size:48px;color:#ff5a4e;margin-right:4px}' +
      '.fl-bfb p{margin:0 0 10px;font-size:14.5px;line-height:1.5;color:#e9dcc0}' +
      '.fl-bfb-relogio{margin-bottom:14px;font:24px/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.08em;color:#ffe8a8;font-variant-numeric:tabular-nums}' +
      '.fl-bfb-relogio small{display:block;margin-bottom:3px;font:10px/1.2 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#b9a77e}' +
      '.fl-bfb-bts{display:flex;gap:8px;flex-wrap:wrap}' +
      '.fl-bfb-bt{display:inline-block;text-decoration:none;border-radius:10px;padding:11px 16px;font:700 14px/1 Inter,system-ui,sans-serif;color:#111;background:linear-gradient(180deg,#ffe8a8,#e0a63a)}' +
      '.fl-bfb-bt2{background:transparent;color:#ffe8a8;border:1px solid #f0c35a}' +
      '.fl-bfb-x{position:absolute;top:8px;right:8px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(240,195,90,.5);background:rgba(0,0,0,.55);color:#ffe8a8;font-size:16px;cursor:pointer;z-index:1}' +
      '@media (max-width:640px){.fl-bfb-caixa{flex-direction:column;text-align:center;padding:16px 14px}.fl-bfb-img{width:min(150px,40vw)}.fl-bfb-bts{justify-content:center}.fl-bfb-tit{font-size:26px}.fl-bfb-tit b{font-size:40px}}' +
      '@media (prefers-reduced-motion:reduce){.fl-bfb{transition:none}}';
    document.head.appendChild(css2);
    banner = document.createElement('div');
    banner.className = 'fl-bfb';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-label', 'Black Friday');
    banner.innerHTML = '<div class="fl-bfb-caixa"></div>';
    banner.addEventListener('click', function (e) { if (e.target === banner) fecharBanner(); });
    document.body.appendChild(banner);
    desenharBanner();
    document.addEventListener('keydown', escBanner);
    requestAnimationFrame(function () { if (banner) banner.classList.add('on'); });
    setInterval(relogioBanner, 1000);
    new MutationObserver(desenharBanner).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang-ativo'] });
  }
  function prepararBanner() {
    if (!bfAtiva()) return;
    fetch('/pagar/promo_popup.php', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      bannerImg = (d && d.promo && /^https:\/\//.test(d.promo.imagem_url || '')) ? d.promo.imagem_url : '';
    }).catch(function () {}).then(function () { setTimeout(abrirBanner, 700); });
  }

  window.flBfFounderValor = function (moeda) {
    if (!noAr()) return moeda === 'USD' ? USD : BRL;
    return desconto(moeda === 'USD' ? USD : BRL);
  };

  fetch('/pagar/black_friday.php', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
    bf = (d && d.bf) ? d.bf : null;
    dif = (d && d.agora) ? d.agora - Math.floor(Date.now() / 1000) : 0;
    if (noAr()) {
      pintar(); timer = setInterval(pintar, 1000);
      /* As barras de oferta repintam o preco sozinhas (rolagem, troca de regiao).
         O observador repinta na mesma hora, antes de a tela desenhar, para nao
         piscar entre o preco cheio e o da Black Friday. */
      var obs = new MutationObserver(function () { if (noAr()) pintar(); else obs.disconnect(); });
      obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
    if (BANNER_LIGADO) prepararBanner();
  }).catch(function () {});
})();
