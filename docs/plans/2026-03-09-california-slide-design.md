# Návrh: California styl + klouzačka s plošinou

## Status: ROZPRACOVÁNO

Brainstorming dokončen, první implementace hotová, ale potřebuje úpravy.

## Co je hotové

### 1. Přední stěna — California styl ✅
- Posuvné dveře (80×160 cm) vlevo (offset -0.55)
- Prodejní okno (80×50 cm) vpravo (offset +0.55), spodní hrana 80 cm
- Pult (deska vyčnívající 20 cm ven) pod oknem
- Stříška (20 cm přesah) nad oknem s podpěrami
- Soubory: `src/config.js`, `src/walls.js`

### 2. Klouzačka s plošinou — levá strana (= +X na obrazovce) ⚠️
- Plošinka 60×50 cm, výška 100 cm, 2 sloupky, 2 schůdky
- Klouzačka 200 cm sjíždí dopředu (-Z)
- Soubory: `src/slide.js`
- **PROBLÉM:** User říká "není to ideální, uděláme plošinu" — chce větší plošinu místo minimalistické verze

### 3. Pískoviště přesunuto vlevo (+X) ✅
- 140×140 cm, za schůdky plošiny
- Soubor: `src/sandbox.js`

## Co je potřeba udělat

### Plošina místo minimalistické verze
User chce větší plošinu (ne jen 60×50 cm plošinku). Pravděpodobně něco jako na fotce Kuul:
- Větší plošina s zábradlím
- Schůdky nahoru
- Klouzačka z plošiny dopředu

Parametry z brainstormingu:
- Výška: 100 cm
- Pozice: +X strana (vlevo na obrazovce), přilepená k domečku
- Klouzačka sjíždí dopředu (-Z)
- Schůdky podél stěny domečku (z +Z směrem)
- Pískoviště na zemi za schůdky

### Inspirace
- California: https://www.littlesettlers.cz/p/california/ — okno uprostřed, posuvné dveře
- Kuul: https://www.littlesettlers.cz/p/hriste-kuul/ — klouzačka z boku s plošinou

## CONFIG konstanty (aktuální)
```javascript
PLATFORM_W: 0.60,    // šířka plošiny (X, od stěny ven)
PLATFORM_D: 0.50,    // hloubka plošiny (Z)
PLATFORM_H: 1.00,    // výška plošiny
PLATFORM_POST: 0.10, // sloupky plošiny
PLATFORM_Z: -0.05,   // střed plošiny v Z
SLIDE_LEN: 2.00,     // délka klouzačky
SLIDE_W: 0.42,       // šířka klouzačky
STAIR_DEPTH: 0.25,   // hloubka jednoho schodu
```

## Souřadnicový systém (důležité!)
- +X na obrazovce = VLEVO (tam kde je klouzačka/pískoviště)
- -X na obrazovce = VPRAVO
- -Z = přední strana (trávník)
- +Z = zadní strana
- Kamera: `(HOUSE_X + 5, 3, -5)` → `(1.5, 3, -5)` looking at `(-3.5, 1, 0)`
