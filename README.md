# forbidden-legacy-releases
Forbidden Legacy — Builds oficiais

## Regras de conteudo do site

- **Novidades (changelogs) em `Tools/index.html`, secao `#novidades`:** mostra SO a build atual e os patches dela, o patch mais recente primeiro. Quando sai uma build nova (ex.: Beta 2.3), os cards da build anterior e dos patches dela saem. O texto vem de `Docs/changelogs/changelog_beta_X*.txt` no repo do jogo. (Regra do Felipe, 2026-10-23.)
- **Videos (`#videos`):** o mais recente fica no destaque; o destaque antigo vira o primeiro card da grade e o card mais velho sai.
- **Push na `main` = deploy ao vivo.** So com o OK do Felipe.
- **Menu do site:** fonte unica em `Tools/js/site-nav.js` (PC e celular saem da mesma lista). Nao escrever menu a mao nas paginas; pagina nova inclui `css/site-fx.css`, `js/site-nav.js` logo depois do `</nav>` e `js/site-fx.js` (defer) antes do `</body>`, e o `?v=` dos tres sobe a cada mudanca.
