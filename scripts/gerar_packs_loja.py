"""Gera a imagem de fundo dos 8 pacotes da Loja do site (Tools/img/loja/pack_<id>.webp).

So arte do proprio jogo (repo forbidden-legacy, ao lado deste):
  - arte da carta (Imagens/artes/<carta>.webp) no topo;
  - fundo do templo (Imagens/ui/card_shop/bg_card_shop.png) no corpo;
  - cor do nivel do pacote (c1/c2, as mesmas do loja.html) e moldura dourada.
O medalhao do Item do Milenio, o nome, a fita de UR e o preco continuam sendo
desenhados por cima pelo loja.html (CSS), entao a imagem nao leva texto.

Uso: python scripts/gerar_packs_loja.py
Proporcao do card: 5 x 7.4 (igual a .lv-pack-corpo). Saida 500x740 WebP.
"""
import os

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

RAIZ_SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOGO = os.path.join(os.path.dirname(RAIZ_SITE), "forbidden-legacy")
SAIDA = os.path.join(RAIZ_SITE, "Tools", "img", "loja")
W, H = 500, 740

# id do pacote -> (carta do jogo, c1, c2)  (cores iguais as de PACOTES no loja.html)
PACOTES = {
    "milenio_colar":   ("millennium_golem", "#b87332", "#4a2610"),
    "milenio_balanca": ("guardian_sphinx", "#d9892b", "#57300c"),
    "milenio_chave":   ("pharaonic_guardian_sphinx", "#e8b840", "#6b4a0e"),
    "milenio_anel":    ("dark_magician_girl", "#3fae7a", "#0f3a26"),
    "milenio_olho":    ("obelisk_the_tormentor", "#4d7fd6", "#12264f"),
    "milenio_cetro":   ("dark_magician", "#9b59d0", "#2e1248"),
    "milenio_enigma":  ("slifer_the_sky_dragon", "#d2434f", "#4a0d15"),
    "milenio_trono":   ("the_winged_dragon_of_ra", "#f0c35a", "#8a5a12"),
}
OURO = (232, 196, 106)


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def gradiente(c1, c2):
    g = Image.new("RGB", (W, H))
    px = g.load()
    for y in range(H):
        t = y / (H - 1)
        cor = tuple(int(c1[i] * (1 - t) + c2[i] * t) for i in range(3))
        for x in range(W):
            px[x, y] = cor
    return g


def mascara_vinheta(w, h, forca=0.75):
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((-w * 0.25, -h * 0.2, w * 1.25, h * 1.2), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(min(w, h) * 0.18))
    return ImageEnhance.Brightness(m).enhance(forca)


def gerar(pid, carta, c1h, c2h):
    c1, c2 = rgb(c1h), rgb(c2h)
    base = gradiente(c1, c2)

    # Corpo: templo do jogo, escurecido e tingido com a cor do nivel.
    templo = Image.open(os.path.join(JOGO, "Imagens", "ui", "card_shop", "bg_card_shop.png")).convert("RGB")
    esc = H / templo.height
    templo = templo.resize((int(templo.width * esc), H), Image.LANCZOS)
    x0 = (templo.width - W) // 2
    templo = templo.crop((x0, 0, x0 + W, H)).filter(ImageFilter.GaussianBlur(2))
    templo = ImageEnhance.Brightness(templo).enhance(0.55)
    base = ImageChops.multiply(base, templo).point(lambda v: min(255, int(v * 1.9)))

    # Topo: arte da carta, com borda suave descendo para o corpo.
    arte = Image.open(os.path.join(JOGO, "Imagens", "artes", carta + ".webp")).convert("RGB")
    lado = W - 44
    arte = arte.resize((lado, lado), Image.LANCZOS)
    arte = ImageEnhance.Contrast(arte).enhance(1.06)
    m = Image.new("L", (lado, lado), 255)
    dm = ImageDraw.Draw(m)
    for i in range(90):  # desvanece a parte de baixo
        dm.line((0, lado - 1 - i, lado, lado - 1 - i), fill=int(255 * i / 90))
    base.paste(arte, (22, 30), m)

    # Brilho dourado atras do medalhao (o CSS poe o medalhao em ~68% da altura).
    luz = Image.new("L", (W, H), 0)
    ImageDraw.Draw(luz).ellipse((W * 0.18, H * 0.53, W * 0.82, H * 0.83), fill=150)
    luz = luz.filter(ImageFilter.GaussianBlur(40))
    base = Image.composite(Image.new("RGB", (W, H), OURO), base, luz.point(lambda v: int(v * 0.45)))

    # Vinheta nas bordas.
    escuro = Image.new("RGB", (W, H), (8, 5, 2))
    base = Image.composite(base, escuro, mascara_vinheta(W, H, 1.0).point(lambda v: max(v, 70)))

    # Moldura dourada dupla + cantos.
    d = ImageDraw.Draw(base)
    d.rounded_rectangle((6, 6, W - 7, H - 7), radius=14, outline=OURO, width=4)
    d.rounded_rectangle((15, 15, W - 16, H - 16), radius=9, outline=(150, 112, 40), width=2)
    d.rectangle((22, 30, W - 23, 30 + lado - 1), outline=(200, 160, 70), width=2)
    for cx, cy in ((15, 15), (W - 16, 15), (15, H - 16), (W - 16, H - 16)):
        d.polygon([(cx, cy - 10), (cx + 10, cy), (cx, cy + 10), (cx - 10, cy)], fill=OURO)

    # Faixa serrilhada do topo do pacote (lacre).
    for x in range(0, W, 10):
        d.polygon([(x, 0), (x + 5, 9), (x + 10, 0)], fill=(20, 12, 4))

    os.makedirs(SAIDA, exist_ok=True)
    destino = os.path.join(SAIDA, "pack_%s.webp" % pid)
    base.save(destino, "WEBP", quality=84, method=6)
    return destino


if __name__ == "__main__":
    for pid, (carta, c1, c2) in PACOTES.items():
        print(gerar(pid, carta, c1, c2))
