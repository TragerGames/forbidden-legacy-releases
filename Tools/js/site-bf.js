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
        selo.innerHTML = '<b>BLACK FRIDAY</b><i>-' + bf.pct + '%</i>' +
          (bf.fim_utc ? '<span>' + (d > 0 ? d + 'd ' : '') + dd(h) + ':' + dd(m) + ':' + dd(s) + '</span>' : '');
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

  window.flBfFounderValor = function (moeda) {
    if (!noAr()) return moeda === 'USD' ? USD : BRL;
    return desconto(moeda === 'USD' ? USD : BRL);
  };

  fetch('/pagar/black_friday.php', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
    bf = (d && d.bf) ? d.bf : null;
    dif = (d && d.agora) ? d.agora - Math.floor(Date.now() / 1000) : 0;
    if (noAr()) { pintar(); timer = setInterval(pintar, 1000); }
  }).catch(function () {});
})();
