# Konstrukční úpravy domečku — plán implementace

## Co implementovat

### 1. Zábradlí — `src/railing.js` + `src/config.js`

**Změny:**
- `CONFIG.RAIL_H`: 0.90 → 0.75
- Přidat zábradlí vpravo (+X strana terasy, od -hd do divZ)
- Spodní výplň: palubky (solid panel) do výšky 40 cm od podlahy 2. patra
- Nad výplní: 3 vodorovné latě rovnoměrně do výšky RAIL_H

**Detaily výplně:**
- Výška: 0.40 m
- Materiál: `MAT.walls` (palubky, stejné jako stěny)
- Tloušťka: `CONFIG.WALL_T` (4 cm)
- Platí pro vpřední, levé I pravé zábradlí

**Detaily latí:**
- Počet: 3 nad výplní
- Výška latě: 0.10 m
- Materiál: `MAT.railing`
- Tloušťka: 0.02 m

**Pravé zábradlí (+X):**
- Stejná logika jako levé (-X)
- Od z = -hd (přední roh) do z = divZ (přední stěna kabiny)
- Sloupky: 4 (stejný počet jako levé)
- POZOR: nesmí blokovat výstup ze schůdků — sloupek na divZ ano, ale výplň/latě jen do 90 % délky

---

### 2. Schůdky — `src/ladder.js`

**Nahradit žebřík schůdky.**

**Parametry:**
- Šířka: 60 cm
- Výška k překonání: CONFIG.H1 = 150 cm
- Max. vzdálenost spodku od domečku: 100 cm (na ose +X)
- Počet stupňů: 7
- Výška stupně (rise): 150 / 7 ≈ 21.4 cm
- Hloubka stupně (run): 100 / 7 ≈ 14.3 cm
- Sklon: atan(150/100) ≈ 56°

**Konstrukční prvky:**
- 2 bočnice (stringers): šikmé desky 5×4 cm, délka = sqrt(150²+100²) ≈ 180 cm
- 7 stupňů: desky 60×4 cm, hloubka = run
- 2 madla: šikmé tyče 5×5 cm po obou stranách, paralelní s bočnicemi, ve výšce ~60 cm nad stupni
- Svislé sloupky madel: 3 ks na každé straně (ve 1/4, 1/2, 3/4 délky)

**Pozice:**
- Umístění: pravá strana (+X), Z = střed terasy (-hd + TD*0.5)
- Vršek schůdků: x = hw (u pravé stěny), y = CONFIG.H1
- Spodek: x = hw + 1.0, y = 0

**Implementační postup:**
1. Vytvořit `stairGroup` (Three.Group) sestavenou vertikálně
2. Přidat bočnice, stupně, madla, sloupky madel
3. Otočit celou skupinu o správný úhel kolem osy Z
4. Posunout na správnou pozici v prostoru

---

### 3. Diagonální vzpěry — `src/beams.js`

**Přidat funkci `addBraces(g)` volanou z `createBeams()`.**

**Kde:**
- Zadní stěna (+Z, přízemí): 2 vzpěry — jedna od levého dolního rohu, druhá od pravého dolního rohu, obě šikmo nahoru do 2/3 výšky
- Levá stěna (-X, přízemí): 1 vzpěra
- Pravá stěna (+X, přízemí): 1 vzpěra

**Tvar vzpěr:**
- Jednoduchá šikmá tyč od rohu sloupku k bodu na sousedním trámu/sloupku
- Průřez: 5×5 cm (`MAT.posts`)
- NEJDE o "X" kříž — jde o jednoduché "V" z rohů

**Pozice vzpěr (world coordinates):**
- Zadní L: od (-hw+0.1, 0.1, hd-0.1) do (0, CONFIG.H1*0.6, hd-0.1)
- Zadní P: od (hw-0.1, 0.1, hd-0.1) do (0, CONFIG.H1*0.6, hd-0.1)
- Levá: od (-hw+0.1, 0.1, -hd+0.1) do (-hw+0.1, CONFIG.H1*0.6, hd-0.1)
- Pravá: od (hw-0.1, 0.1, -hd+0.1) do (hw-0.1, CONFIG.H1*0.6, hd-0.1)

**Implementace tyče mezi dvěma body:**
```javascript
function addBrace(g, x1, y1, z1, x2, y2, z2) {
  const start = new THREE.Vector3(x1, y1, z1);
  const end = new THREE.Vector3(x2, y2, z2);
  const dir = end.clone().sub(start);
  const len = dir.length();
  const mid = start.clone().add(end).multiplyScalar(0.5);

  const m = box(0.05, 0.05, len, MAT.posts);
  m.position.copy(mid);

  // Natočit mesh z defaultní osy (0,0,1) na směr tyče
  const axis = new THREE.Vector3(0, 0, 1);
  const q = new THREE.Quaternion().setFromUnitVectors(axis, dir.normalize());
  m.quaternion.copy(q);

  g.add(m);
}
```

---

### 4. Horní rám terasy (vaznice) — `src/beams.js`

**Přidat vodorovné trámy po obvodu terasy nahoře (na výšce H1 + RAIL_H).**

**Prvky:**
- Přední trám (-Z): celá šířka W, na x=0, y=H1+RAIL_H-BEAM/2, z=-hd
- Levý trám (-X): délka TD (hloubka terasy), na x=-hw, y=H1+RAIL_H-BEAM/2, z=-hd+TD/2
- Pravý trám (+X): délka TD, na x=hw, y=H1+RAIL_H-BEAM/2, z=-hd+TD/2

**Materiál:** `MAT.beam`

---

## Pořadí implementace

1. `src/config.js` — RAIL_H: 0.75
2. `src/railing.js` — výplň + latě + pravé zábradlí
3. `src/ladder.js` — schůdky
4. `src/beams.js` — diagonály + horní rám terasy

Po každém souboru: `bash build.sh` + vizuální kontrola v prohlížeči.
