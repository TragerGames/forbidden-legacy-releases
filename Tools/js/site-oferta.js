/* Barra da Versao Founder em TODAS as paginas (Trager, 2026-11-13).
   A inicial ja tem a dela (index.html, #offer-bar), que some quando o
   visitante chega na secao de compra; aqui fica a mesma barra para as outras
   paginas, levando para index.html#comprar.

   Uso: logo depois de <script src="js/site-nav.js">, sem defer, para os
   textos (data-lang) existirem antes de a pagina escolher o idioma.
   Fechar vale para a sessao (mesma chave da inicial). */
(function () {
  'use strict';
  if (document.getElementById('offer-bar')) return;   // a inicial cuida da propria barra

  var T = function (pt, en, es, vi) {
    return '<span data-lang="pt">' + pt + '</span><span data-lang="en">' + en + '</span><span data-lang="es">' + es + '</span><span data-lang="vi">' + vi + '</span>';
  };
  var fechada = false;
  try { fechada = sessionStorage.getItem('fl_offerbar_off') === '1'; } catch (e) {}
  if (fechada) return;

  function ehBrasil() {
    var ov = null;
    try { ov = localStorage.getItem('fl_region_override'); } catch (e) {}
    if (ov) return ov === 'BR';
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      return /^(America\/(Sao_Paulo|Araguaina|Bahia|Belem|Boa_Vista|Campo_Grande|Cuiaba|Eirunepe|Fortaleza|Maceio|Manaus|Noronha|Porto_Velho|Recife|Rio_Branco|Santarem)|Brazil\/)/.test(tz);
    } catch (e) { return true; }
  }

  var css = document.createElement('style');
  css.id = 'fl-oferta-css';
  css.textContent = [
    '.fl-oferta{position:fixed;left:0;right:0;bottom:0;z-index:9990;display:flex;align-items:center;justify-content:center;gap:18px;',
    '  padding:11px 16px calc(11px + env(safe-area-inset-bottom,0px));background:rgba(10,9,12,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);',
    '  border-top:1px solid rgba(255,255,255,.12);box-shadow:0 -6px 24px rgba(0,0,0,.5);transform:translateY(110%);transition:transform .28s cubic-bezier(.22,1,.36,1);',
    "  font-family:'Manrope',system-ui,-apple-system,sans-serif}",
    '.fl-oferta.show{transform:translateY(0)}',
    '.fl-oferta *{letter-spacing:0}',
    '.fl-oferta-txt{display:flex;flex-direction:column;gap:1px;line-height:1.25}',
    ".fl-oferta-t{font-family:'Sora',system-ui,sans-serif;font-weight:600;font-size:16px;color:#ffd98a}",
    '.fl-oferta-s{font-size:12px;color:#8b867d}',
    ".fl-oferta-preco{font-family:'Sora',system-ui,sans-serif;font-weight:600;font-size:24px;color:#fff;white-space:nowrap}",
    '.fl-oferta-bt{display:inline-flex;align-items:center;background:linear-gradient(180deg,#ffe3a1,#e9b949 55%,#d39f33);color:#1d1304;',
    "  font-family:'Manrope',system-ui,sans-serif;font-weight:800;font-size:14.5px;padding:11px 22px;border-radius:10px;text-decoration:none;white-space:nowrap;",
    '  box-shadow:0 8px 22px rgba(233,185,73,.18);transition:filter .15s,transform .15s}',
    '.fl-oferta-bt:hover{filter:brightness(1.06);transform:translateY(-1px)}',
    '.fl-oferta-link{display:flex;flex-direction:column;gap:1px;line-height:1.25;padding-left:18px;border-left:1px solid rgba(255,255,255,.09);text-decoration:none;white-space:nowrap}',
    '.fl-oferta-q{font-size:11px;color:#8b867d}',
    '.fl-oferta-a{font-size:13px;color:#e9b949;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(233,185,73,.45)}',
    '.fl-oferta-link:hover .fl-oferta-a{color:#ffd98a;text-decoration-color:currentColor}',
    '.fl-oferta-link:focus-visible,.fl-oferta-bt:focus-visible{outline:2px solid rgba(233,185,73,.6);outline-offset:3px;border-radius:8px}',
    '.fl-oferta-x{background:none;border:0;color:#6f6a62;font-size:19px;cursor:pointer;padding:4px 6px;line-height:1;border-radius:8px}',
    '.fl-oferta-x:hover{color:#bcb6aa}',
    'body.fl-oferta-on{padding-bottom:calc(70px + env(safe-area-inset-bottom,0px)) !important}',
    '@media (max-width:820px){.fl-oferta{gap:14px}.fl-oferta-link{padding-left:14px}.fl-oferta-q{display:none}}',
    '@media (max-width:919px){.fl-oferta-sup{display:none}}',
    '@media (max-width:720px){.fl-oferta{display:grid;grid-template-columns:auto auto auto auto;grid-template-areas:"t p b x" "d p b x";justify-content:center;align-items:center;column-gap:16px;row-gap:1px}',
    '  .fl-oferta-txt{display:contents}.fl-oferta-t{grid-area:t;align-self:end}.fl-oferta-s{display:none}',
    '  .fl-oferta-link{grid-area:d;align-self:start;padding-left:0;border-left:0}.fl-oferta-a{font-size:12px}',
    '  .fl-oferta-preco{grid-area:p}.fl-oferta-bt{grid-area:b}.fl-oferta-x{grid-area:x}}',
    '@media (max-width:560px){.fl-oferta{column-gap:11px;padding:9px 12px calc(9px + env(safe-area-inset-bottom,0px))}.fl-oferta-t{font-size:14.5px}',
    '  .fl-oferta-a{font-size:11.5px}.fl-oferta-preco{font-size:19px}.fl-oferta-bt{font-size:13.5px;padding:10px 14px}}',
    '@media (max-width:400px){.fl-oferta{column-gap:8px;padding-left:10px;padding-right:10px}.fl-oferta-a{font-size:11px}.fl-oferta-bt{padding:10px 11px}}',
    '@media (prefers-reduced-motion:reduce){.fl-oferta{transition:none}}'
  ].join('\n');
  document.head.appendChild(css);

  var barra = document.createElement('div');
  barra.className = 'fl-oferta';
  barra.id = 'fl-oferta';
  barra.setAttribute('role', 'region');
  barra.setAttribute('aria-label', 'Versão Founder');
  barra.innerHTML =
    '<div class="fl-oferta-txt"><span class="fl-oferta-t">' + T('Versão Founder', 'Founder Version', 'Versión Founder', 'Phiên bản Founder') + '</span>' +
    '<span class="fl-oferta-s">' + T('Pagamento único · licença vitalícia', 'One-time payment · lifetime license', 'Pago único · licencia de por vida', 'Thanh toán một lần · giấy phép trọn đời') + '</span></div>' +
    '<span class="fl-oferta-preco">' + (ehBrasil() ? 'R$&nbsp;39,90' : 'US$&nbsp;20') + '</span>' +
    '<a class="fl-oferta-bt" href="index.html#comprar">' + T('Quero o Founder', 'Get Founder', 'Quiero el Founder', 'Nhận Founder') + '</a>' +
    '<a class="fl-oferta-link" href="ativar_dispositivo.html"><span class="fl-oferta-q">' + T('Já é Founder?', 'Already a Founder?', '¿Ya eres Founder?', 'Đã là Founder?') + '</span>' +
    '<span class="fl-oferta-a">' + T('Ativar outro dispositivo', 'Activate another device', 'Activa otro dispositivo', 'Kích hoạt thiết bị khác') + '</span></a>' +
    '<a class="fl-oferta-link fl-oferta-sup" href="suporte.html"><span class="fl-oferta-q">' + T('Dúvidas?', 'Questions?', '¿Dudas?', 'Có thắc mắc?') + '</span>' +
    '<span class="fl-oferta-a">' + T('Fale com o suporte', 'Contact support', 'Contactar soporte', 'Liên hệ hỗ trợ') + '</span></a>' +
    '<button type="button" class="fl-oferta-x" aria-label="Fechar">✕</button>';
  (document.body || document.documentElement).appendChild(barra);

  function mostrar(sim) {
    barra.classList.toggle('show', sim);
    if (document.body) document.body.classList.toggle('fl-oferta-on', sim);
  }
  barra.querySelector('.fl-oferta-x').addEventListener('click', function () {
    mostrar(false);
    try { sessionStorage.setItem('fl_offerbar_off', '1'); } catch (e) {}
    setTimeout(function () { barra.remove(); }, 400);
  });

  /* Aparece logo depois de abrir a pagina; fica escondida enquanto o aviso de
     cookies estiver na tela, para os dois nao brigarem pelo rodape. */
  function avaliar() {
    if (!barra.isConnected) return;
    var cookie = document.getElementById('cookie-banner');
    var cookieNaTela = cookie && getComputedStyle(cookie).display !== 'none';
    mostrar(!cookieNaTela);
  }
  window.addEventListener('load', function () { setTimeout(avaliar, 600); });
  setInterval(avaliar, 1500);
})();
