/* Menu do site: FONTE UNICA (2026-10-23).
   Antes cada pagina tinha uma copia do menu escrita a mao, e o celular usava
   uma faixa de links propria, com outros itens e outra ordem em cada pagina.
   Agora o menu mora so aqui: o PC (grupos com submenu) e o celular (botao que
   abre a lista) saem desta mesma lista, na mesma ordem, em todas as paginas.

   Uso na pagina: logo depois do </nav>, <script src="js/site-nav.js"></script>.
   O script roda na hora (sem defer) para os scripts da propria pagina, que
   ligam o clique dos grupos (.nav-grupo-bt), ja encontrarem os botoes prontos.

   Para mudar o menu: edite MENU abaixo. Mais nada. */
(function () {
  'use strict';

  var T = function (pt, en, es, vi) { return { pt: pt, en: en, es: es, vi: vi }; };

  var MENU = [
    { grupo: T('Jogo', 'Game', 'Juego', 'Trò chơi'), itens: [
      { href: 'index.html#sobre', nome: T('O Jogo', 'The Game', 'El Juego', 'Trò chơi'), dica: T('o que é o remake', 'what the remake is', 'qué es el remake', 'bản làm lại là gì') },
      { href: 'features.html', nome: T('Mecânicas', 'Features', 'Mecánicas', 'Cơ chế'), dica: T('duelo, fusões, campo', 'duels, fusions, field', 'duelo, fusiones, campo', 'đấu bài, hợp thể, sân') },
      { href: 'gallery.html', nome: T('Galeria', 'Gallery', 'Galería', 'Thư viện'), dica: T('imagens do jogo', 'game screenshots', 'imágenes del juego', 'ảnh trong game') },
      { href: 'mods.html', nome: T('Mods FM', 'FM Mods', 'Mods FM', 'Mods FM'), dica: T('mods de Forbidden Memories', 'Forbidden Memories mods', 'mods de Forbidden Memories', 'mod Forbidden Memories') }
    ] },
    { grupo: T('Modos de jogo', 'Game modes', 'Modos de juego', 'Chế độ chơi'), itens: [
      { href: 'index.html#campanha', nome: T('Campanha', 'Campaign', 'Campaña', 'Cốt truyện'), dica: T('a história', 'the story', 'la historia', 'cốt truyện') },
      { href: 'torneio.html', nome: T('Championship', 'Championship', 'Championship', 'Championship'), dica: T('torneios e punições', 'tournaments and rules', 'torneos y castigos', 'giải đấu và luật phạt') },
      { href: 'ranking.html', nome: T('Ranking', 'Leaderboard', 'Ranking', 'Bảng xếp hạng'), dica: T('PVP e torneios, ao vivo', 'PVP and tournaments, live', 'PVP y torneos, en vivo', 'PVP và giải đấu, trực tiếp') },
      { href: 'conquistas.html', nome: T('Conquistas', 'Achievements', 'Logros', 'Thành tựu'), dica: T('tudo que dá para conquistar', 'everything to unlock', 'todo para desbloquear', 'mọi thành tựu') }
    ] },
    { grupo: T('Cartas', 'Cards', 'Cartas', 'Thẻ bài'), itens: [
      { href: 'catalogo.html', nome: T('Catálogo', 'Catalog', 'Catálogo', 'Danh mục'), dica: T('todas as cartas', 'every card', 'todas las cartas', 'tất cả thẻ bài') },
      { href: 'boosters.html', nome: T('Boosters', 'Boosters', 'Boosters', 'Booster'), dica: T('pacotes temáticos', 'themed packs', 'sobres temáticos', 'gói chủ đề') },
      { href: 'banlist.html', nome: T('Banlist', 'Banlist', 'Banlist', 'Banlist'), dica: T('limites por grupo', 'limits by group', 'límites por grupo', 'giới hạn theo nhóm') }
    ] },
    { grupo: T('Ferramentas', 'Tools', 'Herramientas', 'Công cụ'), itens: [
      { href: 'montar_deck.html', nome: T('Montar Deck', 'Deck Builder', 'Armar Mazo', 'Tạo bộ bài'), dica: T('monte o seu deck', 'build your deck', 'arma tu mazo', 'tạo bộ bài của bạn') },
      { href: 'ativar_dispositivo.html', nome: T('Ativar outro dispositivo', 'Activate another device', 'Activar otro dispositivo', 'Kích hoạt thiết bị khác'), dica: T('use no PC e no celular', 'use it on PC and phone', 'úsalo en PC y móvil', 'dùng trên PC và điện thoại') },
      { href: 'suporte.html', nome: T('Fale com o suporte', 'Contact support', 'Contactar soporte', 'Liên hệ hỗ trợ'), dica: T('dúvida, bug ou sugestão', 'question, bug or idea', 'duda, bug o sugerencia', 'câu hỏi, lỗi hoặc góp ý') }
    ] },
    { solo: true, href: 'loja.html?v=p04', nome: T('Loja', 'Store', 'Tienda', 'Cửa hàng') }
  ];
  var CTA = { href: 'index.html#comprar', nome: T('☥ Founder', '☥ Founder', '☥ Founder', '☥ Founder') };

  var pagina = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (pagina === '') pagina = 'index.html';
  var naInicial = pagina === 'index.html';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function spans(t) {
    return '<span data-lang="pt">' + esc(t.pt) + '</span><span data-lang="en">' + esc(t.en) +
      '</span><span data-lang="es">' + esc(t.es) + '</span><span data-lang="vi">' + esc(t.vi) + '</span>';
  }
  /* Na inicial, "index.html#x" vira "#x" (rola sem recarregar). */
  function link(h) { return naInicial && h.indexOf('index.html#') === 0 ? h.slice(10) : h; }
  function ativo(h) {
    var arq = h.split('#')[0].split('?')[0].toLowerCase();
    return h.indexOf('#') < 0 && arq === pagina;
  }

  /* ── PC: grupos com submenu, no mesmo HTML que o CSS das paginas ja estiliza ── */
  var pc = '';
  MENU.forEach(function (m) {
    if (m.solo) {
      pc += '<a class="nav-solo' + (ativo(m.href) ? ' ativo' : '') + '" href="' + link(m.href) + '">' + spans(m.nome) + '</a>';
      return;
    }
    var temAtivo = m.itens.some(function (i) { return ativo(i.href); });
    pc += '<div class="nav-grupo' + (temAtivo ? ' tem-ativo' : '') + '">' +
      '<button class="nav-grupo-bt" type="button" aria-expanded="false">' + spans(m.grupo) + '<i class="nav-caret" aria-hidden="true"></i></button>' +
      '<div class="nav-drop">';
    m.itens.forEach(function (i) {
      pc += '<a href="' + link(i.href) + '"' + (ativo(i.href) ? ' class="ativo" aria-current="page"' : '') + '>' +
        spans(i.nome) + '<small>' + spans(i.dica) + '</small></a>';
    });
    pc += '</div></div>';
  });
  var nav = document.getElementById('nav');
  var alvoPc = nav && nav.querySelector('.nav-links');
  if (alvoPc) alvoPc.innerHTML = pc;
  if (nav) {
    var cta = nav.querySelector('.nav-cta');
    if (cta) cta.setAttribute('href', link(CTA.href));
  }

  /* ── Celular: botao no topo que abre a mesma lista, agrupada igual ao PC ── */
  if (!nav) return;
  var bt = document.createElement('button');
  bt.type = 'button';
  bt.className = 'fx-burger';
  bt.setAttribute('aria-label', 'Menu');
  bt.setAttribute('aria-expanded', 'false');
  bt.setAttribute('aria-controls', 'fx-gaveta');
  bt.innerHTML = '<span></span><span></span><span></span>';
  /* No grupo da direita (idioma + Founder), para nao sair da tela no celular. */
  var direita = nav.lastElementChild && nav.lastElementChild.querySelector('.lang-pick, .nav-cta') ? nav.lastElementChild : nav;
  direita.appendChild(bt);

  var gaveta = document.createElement('div');
  gaveta.id = 'fx-gaveta';
  gaveta.className = 'fx-gaveta';
  gaveta.setAttribute('aria-hidden', 'true');
  var g = '<div class="fx-gaveta-fundo" data-fecha></div><div class="fx-gaveta-painel" role="navigation" aria-label="Menu">' +
    '<div class="fx-gaveta-topo"><span class="fx-gaveta-ankh" aria-hidden="true">☥</span>' +
    '<span class="fx-gaveta-tit">Forbidden Legacy</span>' +
    '<button type="button" class="fx-gaveta-x" data-fecha aria-label="Fechar">×</button></div>' +
    '<div class="fx-gaveta-lista">';
  MENU.forEach(function (m) {
    if (m.solo) {
      g += '<a class="fx-gaveta-solo' + (ativo(m.href) ? ' ativo' : '') + '" href="' + link(m.href) + '">' + spans(m.nome) + '</a>';
      return;
    }
    g += '<div class="fx-gaveta-grupo"><div class="fx-gaveta-rotulo">' + spans(m.grupo) + '</div>';
    m.itens.forEach(function (i) {
      g += '<a href="' + link(i.href) + '"' + (ativo(i.href) ? ' class="ativo" aria-current="page"' : '') + '>' +
        '<b>' + spans(i.nome) + '</b><small>' + spans(i.dica) + '</small></a>';
    });
    g += '</div>';
  });
  g += '</div><a class="fx-gaveta-cta" href="' + link(CTA.href) + '">' + spans(CTA.nome) + '</a></div>';
  gaveta.innerHTML = g;
  document.body.appendChild(gaveta);

  function abre(sim) {
    gaveta.classList.toggle('aberta', sim);
    gaveta.setAttribute('aria-hidden', sim ? 'false' : 'true');
    bt.setAttribute('aria-expanded', sim ? 'true' : 'false');
    bt.classList.toggle('aberto', sim);
    document.documentElement.classList.toggle('fx-trava-rolagem', sim);
  }
  bt.addEventListener('click', function (e) { e.stopPropagation(); abre(!gaveta.classList.contains('aberta')); });
  gaveta.addEventListener('click', function (e) {
    if (e.target.closest('[data-fecha]') || e.target.closest('a')) abre(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') abre(false); });
  window.addEventListener('resize', function () { if (innerWidth > 1000) abre(false); });
})();
