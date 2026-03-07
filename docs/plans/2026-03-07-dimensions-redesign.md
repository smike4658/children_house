# Redesign 2D kot (dimensions) - stavebni standard

## Problem
- 2D koty nemaji extension lines ani sipky — neni videt odkud/kam rozmer vede
- Popisky se prekryvaji s kotami
- Nektere koty chybi (hloubka na pudorysu 2. patra)

## Reseni

### Vizualni styl: stavebni standard
- Extension lines: plna tenka cara od objektu ke kotove care (presah 3px za kotu)
- Dimension line: plna cara mezi extension lines
- Sipky: plne trojuhelniky na obou koncich
- Text: uprostred, s bilym/tmavym pozadim (padding)
- Odsazeni: rada 1 = 30px, rada 2 = 60px, rada 3 = 90px

### Popisky vs koty
- Koty ukazuji jen cisla (70 cm, 172 cm)
- Popisky (TERASA, KABINA, PRIZEMI) jsou uvnitr ploch, bez kolize s kotami

### Pomocne funkce
- `dimArrowH(ctx, x1, x2, y, label)` — horizontalni kota
- `dimArrowV(ctx, y1, y2, x, label)` — vertikalni kota

### Koty dle pohledu

**Pudorys 1. patro:**
- Sirka 310 cm (dole, rada 2)
- Hloubka 242 cm (vpravo, rada 2)
- Popisek PRIZEMI uvnitr

**Pudorys 2. patro:**
- Sirka 310 cm (dole, rada 2)
- Hloubka 242 cm (vpravo, rada 2)
- Terasa 70 + kabina 172 (vpravo, rada 1)
- Popisky TERASA, KABINA uvnitr

**Narys zepredu:**
- Sirka 310 cm (dole, rada 1)
- Vyska 1. patra 150 cm (vlevo, rada 1)
- Vyska 2. patra 150 cm (vlevo, rada 1)
- Celkova vyska 300 cm (vlevo, rada 2)
- Popisky PRIZEMI, 2. PATRO uvnitr

**Narys z boku:**
- Terasa 70 + kabina 172 (dole, rada 1)
- Celkova hloubka 242 cm (dole, rada 2)
- Vysky jako zepredu (vlevo)
- Popisky uvnitr

**Rez:**
- Vysky jako bocni narys
- Info text: tloustka podlah, pozice tramu
