# Dětský Patrový Domeček — 3D Návrh

## Projekt

Interaktivní 3D vizualizace dětského zahradního domečku v jednom HTML souboru.
Technologie: **Three.js r128** (CDN), vanilla JS, žádný build step.
Výstup: jeden `domecek.html` soubor, sdílitelný jako artifact v Claude Desktop.

## Co to je — popis domečku

Dvoupatrový dětský dřevěný domeček do zahrady, stavěný svépomocí.
Celkové rozměry: 310 cm (šířka) × 242 cm (hloubka) × 300 cm (výška po okap, 345 cm po hřeben).

**Konstrukce:** Dřevěná rámová konstrukce. Nosné sloupky 12×12 cm (KVH hranoly) na betonových
patkách. Stěny z dřevěných palubek (horizontální obklad). Pultová střecha (vyšší vzadu).

**1. patro (přízemí, 0–150 cm):**
- Výška stropu 150 cm (pro děti cca 3–8 let)
- Zadní stěna (+Z): plná, palubky celá výška
- Pravá stěna (+X): plná, palubky celá výška
- Levá stěna (-X): plná, palubky celá výška
- Přední strana (-Z): OTEVŘENÁ — žádná stěna, volný přístup
- Podlaha: dřevěné palubky/prkna na trámech
- Účel: herní prostor, pískoviště, stoleček

**2. patro (150–300 cm):**
- Přístup: po žebříku z pravé strany (+X, zvenku)
- Kabina (zadní část, 310×172 cm): uzavřená místnost s dveřmi a okny
  - Přední stěna kabiny: dveře (55×110 cm) + okno (40×35 cm)
  - Levá stěna: okno (50×40 cm) s křížovým rámem
  - Zadní stěna: plná
  - Pravá stěna: plná
  - Střecha: pultová, pouze nad kabinou
- Terasa (přední část, 310×70 cm): otevřená plocha
  - Zábradlí: vpředu a vlevo (výška 90 cm, příčle)
  - Klouzačka: z levé strany terasy (-X) dolů na trávník
  - Žebřík: z pravé strany (+X) zvenku

**Klouzačka:**
- Plastová, žlutá, délka 260 cm
- Začíná na levé straně terasy (-X, 2. patro)
- Sjíždí dopředu směrem na trávník (-Z)

**Žebřík:**
- Dřevěný, 6 příček, šířka 45 cm
- Opřený o pravou stranu domečku (+X) zvenku
- Naklonění cca 75° (mírný sklon od svislice)
- Vede na úroveň podlahy 2. patra (150 cm)

**Betonové patky:**
- Pod každým nosným sloupkem (4 rohy)
- Rozměr 22×22×10 cm
- Izolují dřevo od země

## Architektura kódu

Soubor MUSÍ být modulární. Každá část domečku = samostatná funkce.
Toto je klíčové pro efektivní iterace — editace jedné funkce nesmí vyžadovat přepis celého souboru.

```
domecek.html
├── <style> — UI overlay, taby, ovládací prvky
├── <div> — HTML overlay (taby, spec chips, legenda, controls)
└── <script>
    ├── CONFIG — všechny rozměry na jednom místě
    ├── Renderer + Scene setup (shadows, tone mapping, encoding)
    ├── setupEnvironment()   — HDRI / fallback sky
    ├── setupMaterials()     — textury, materiály (512px canvas)
    ├── setupPostProcessing() — EffectComposer + SSAO (s fallback)
    ├── Model (každá část = funkce):
    │   ├── createGround()       — trávník s texturou
    │   ├── createPosts()        — nosné sloupky
    │   ├── createFloors()       — podlahy
    │   ├── createWalls()        — stěny (zadní, pravá, přední kabiny)
    │   ├── createRoof()         — střecha
    │   ├── createRailing()      — zábradlí terasy
    │   ├── createSlide()        — klouzačka
    │   ├── createLadder()       — žebřík
    │   ├── createBeams()        — trámy a joists
    │   └── createFootings()     — betonové patky
    ├── Pohledy (tab systém):
    │   ├── view3D()             — interaktivní 3D (PerspectiveCamera)
    │   ├── viewFloorPlan1()     — půdorys 1. patro (OrthographicCamera shora)
    │   ├── viewFloorPlan2()     — půdorys 2. patro
    │   ├── viewFront()          — nárys zepředu
    │   ├── viewSide()           — nárys z boku
    │   └── viewSection()        — příčný řez
    ├── Kóty — createDimensions() pro každý pohled
    ├── Popisky — createLabels() pro každý pohled
    ├── OrbitControls — vlastní implementace (mouse + touch)
    └── Animační loop (composer.render() nebo renderer.render() fallback)
```

## Rozměry domečku (CONFIG objekt)

```javascript
const CONFIG = {
  // Celkové rozměry
  W: 3.10,        // šířka (osa X) v metrech
  D: 2.42,        // hloubka (osa Z)
  H: 3.00,        // celková výška (osa Y)

  // Patra
  H1: 1.50,       // výška 1. patra (podlaha 2. patra)

  // Terasa
  TD: 0.70,       // hloubka terasy (z přední strany)
  // CD = D - TD = 1.72  (hloubka kabiny, dopočítat)

  // Konstrukční prvky
  POST: 0.12,     // průřez nosného sloupku
  WALL_T: 0.04,   // tloušťka stěny (palubky)
  BEAM: 0.07,     // průřez trámů

  // Střecha (pultová, vyšší vzadu)
  ROOF_OVERHANG: 0.15,
  ROOF_PEAK: 0.45,    // převýšení vzadu oproti předu

  // Dveře (v přední stěně kabiny, 2. patro)
  DOOR_W: 0.55,
  DOOR_H: 1.10,
  DOOR_OFFSET_X: 0.15,  // mírně vpravo od středu

  // Okna
  SIDE_WIN_W: 0.50,     // okno v levé stěně (-X)
  SIDE_WIN_H: 0.40,
  FRONT_WIN_W: 0.50,    // okno v přední stěně kabiny
  FRONT_WIN_H: 0.45,

  // Klouzačka
  SLIDE_LEN: 2.60,
  SLIDE_W: 0.42,

  // Žebřík
  LADDER_W: 0.45,
  LADDER_H: 1.85,
  LADDER_RUNGS: 6,

  // Zábradlí
  RAIL_H: 0.90,
  RAIL_T: 0.04,
};
```

## Souřadnicový systém

```
Osa X = šířka (levá = -X, pravá = +X)
Osa Y = výška (nahoru = +Y)
Osa Z = hloubka (přední/trávník = -Z, zadní = +Z)

Střed modelu: [0, 0, 0] = střed půdorysu na úrovni země
```

## Kamera reference — výchozí ISO pohled

Výchozí kamera je na pozici `(6, 4, -6)`, dívá se na `(0, 1.5, 0)`.

```
Z výchozího ISO pohledu:

  Na obrazovce VPRAVO  →  svět +X  (pravá stěna, žebřík)
  Na obrazovce VLEVO   →  svět -X  (levá stěna, okno, klouzačka)
  Na obrazovce VZADU   →  svět +Z  (zadní stěna)
  Na obrazovce VPŘEDU  →  svět -Z  (terasa, trávník, klouzačka)
  NAHORU               →  svět +Y  (výška)
```

**Axis indicator v 3D view:** V pravém dolním rohu je vždy viditelná XYZ osa:
- 🔴 červená = X (šířka)
- 🟢 zelená = Y (výška)
- 🔵 modrá = Z (hloubka)

**Jak popisovat opravy:**
Místo "klouzačka je na špatné straně" piš "klouzačka má být na +X straně (vpravo na obrazovce)".
Místo "otočená do domečku" piš "má směřovat do -Z (vpředu/trávník)".

## Layout (pohled shora, -Y)

```
           PŘEDNÍ STRANA (trávník, -Z)
    ┌─────────────────────────────────┐
    │       TERASA  310 × 70 cm       │  ← otevřená, zábradlí vpředu + vlevo
    │  KLOUZAČKA              ŽEBŘÍK   │  ← klouzačka VLEVO, žebřík VPRAVO
    │  (vlevo, -X)          (vpravo)  │  ← žebřík zvenku VPRAVO (+X)
    ├─────────────────────────────────┤  ← přední stěna kabiny (dveře + okno)
    │                                 │
    │     KABINA / DOMEČEK            │
    │        310 × 172 cm            │
    │                                 │
    │  LEVÁ = PLNÁ stěna (s oknem)   │  PRAVÁ = PLNÁ stěna
    │                                 │
    └─────────────────────────────────┘
           ZADNÍ STRANA (+Z) = PLNÁ STĚNA
```

## Stěny — detail

| Stěna | 1. patro | 2. patro | Poznámka |
|-------|----------|----------|----------|
| Zadní (+Z) | plná | plná | palubky, celá výška |
| Pravá (+X) | — | plná (kabina) | pouze 2. patro kabina |
| Levá (-X) | plná | plná s oknem 50×40 (kabina) | okno s křížovým rámem |
| Přední kabiny (divZ) | neexistuje (terasa) | dveře 55×110 + okno 40×35 | odděluje terasu od kabiny |
| Přední (-Z) | neexistuje | neexistuje | terasa je otevřená vpředu |

## Nosná konstrukce — detail

**Sloupky (svislé):**
- 4 rohové sloupky 12×12 cm — přední do 240 cm (H1+RAIL_H), zadní do 300 cm (H)
- 1 střední sloupek (přední strana, -Z) ~10×10 cm, výška 240 cm — uprostřed šířky
- 2 dělicí sloupky (terasa/kabina) ~10×10 cm, od H1 do 345 cm (H+ROOF_PEAK) — na pozici divZ

**Trámy (vodorovné) — AKTUÁLNÍ STAV:**
- 4 stropní nosníky (joists) 7×7 cm pod podlahou 2. patra, přes celou šířku
- 3 podlahové nosníky 7×7 cm pod podlahou 1. patra, přes celou šířku
- CHYBÍ: horní rámy (vaznice) po obvodu — potřeba doplnit
- CHYBÍ: rám přední stěny kabiny — potřeba doplnit

**Podlahy:**
- Přízemí: deska na úrovni 0 (tloušťka 5 cm)
- 2. patro: deska na úrovni H1=150 cm (tloušťka 6 cm)
- Obě podlahy pokrývají celý půdorys (310×242 cm)

## Střecha

- Typ: pultová (shed roof)
- Pokrývá POUZE kabinu (ne terasu!)
- Přední hrana (u terasy): na výšce H2 = 3.00m
- Zadní hrana: H2 + 0.45 = 3.45m
- Přesah: 15cm na každou stranu

## Tab systém — pohledy

Každý tab přepne kameru a viditelnost pomocných vrstev:

### Tab: 3D
- PerspectiveCamera, interaktivní otáčení
- Volitelně: wireframe, popisky, kóty
- Přednastavené pohledy: zepředu, zezadu, zleva, zprava, shora, iso

### Tab: Půdorys 1. patro
- OrthographicCamera shora (Y→-Y)
- Zobrazit pouze geometrii od Y=0 do Y=1.50
- Šrafy pro stěny (řezané), kóty šířky/hloubky
- Popisky: "PŘÍZEMÍ", rozměry místnosti

### Tab: Půdorys 2. patro
- OrthographicCamera shora
- Geometrie od Y=1.50 do Y=3.00
- Terasa vs kabina oddělení, dveře, okna v půdorysu
- Zábradlí schematicky

### Tab: Nárys zepředu
- OrthographicCamera z -Z směru
- Čelní pohled: terasa, zábradlí, klouzačka, žebřík, střecha
- Výškové kóty: 1. patro, 2. patro, střecha

### Tab: Nárys z boku
- OrthographicCamera z +X směru (pravá strana)
- Boční pohled: terasa vs kabina, střecha, okno
- Kóty hloubky a výšky

### Tab: Řez
- OrthographicCamera z +X, ale model oříznutý v polovině šířky
- Vidět vnitřek: podlahy, stropy, střechu, žebřík
- Šrafy pro řezané prvky

## Materiály

```javascript
// Barvy a styly — konzistentní paleta
const COLORS = {
  posts:    '#C4944A',  // nosné sloupky
  walls:    '#B8860B',  // palubky/stěny
  floor:    '#A0784C',  // podlaha
  roof:     '#6B3A2A',  // střecha
  roofEdge: '#4A2818',  // okraj střechy
  railing:  '#D4A056',  // zábradlí
  slide:    '#FFD700',  // klouzačka (žlutá)
  ladder:   '#5B8C3E',  // žebřík (zelená)
  frame:    '#f0e8d0',  // rámy oken/dveří
  concrete: '#999999',  // betonové patky
  grass:    '#4a7a2e',  // trávník
  sky:      '#87CEEB',  // obloha
};
```

- Dřevo: CanvasTexture s generovanou texturou (horizontal planks pro stěny, grain pro sloupky)
- Klouzačka: lesklý plast (metalness: 0.3, roughness: 0.25)
- Střecha: matná (roughness: 0.7)

## Grafická kvalita — vylepšení

### 1. HDRI Environment (PRIORITA — největší vizuální dopad)

Místo ploché `scene.background` barvy použij HDRI environment mapu.
Dá ti realistické osvětlení, odrazy na klouzačce a ambient světlo zdarma.

```javascript
// setupEnvironment() — volat při inicializaci
function setupEnvironment() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  // Varianta A: Načíst free HDRI z Poly Haven (CC0 licence)
  new THREE.RGBELoader()
    .setDataType(THREE.UnsignedByteType)
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_06_puresky_1k.hdr',
      (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;   // PBR osvětlení pro všechny materiály
        scene.background = envMap;    // HDRI jako pozadí (obloha)
        texture.dispose();
        pmremGenerator.dispose();
      }
    );

  // Varianta B (fallback): Pokud HDRI nejde načíst, použij gradient skybox
  // viz setupFallbackSky()
}
```

Fallback sky (pokud HDRI loading selže):
```javascript
function setupFallbackSky() {
  const canvas = document.createElement('canvas');
  canvas.width = 1; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#4a90d9');    // zenith
  grad.addColorStop(0.4, '#87CEEB');  // mid sky
  grad.addColorStop(0.75, '#b8daf0'); // horizon haze
  grad.addColorStop(1.0, '#e8dcc8');  // ground haze
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
}
```

### 2. Stíny — upgrade

```javascript
// Renderer setup
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;  // měkčí než PCFSoft
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputEncoding = THREE.sRGBEncoding;

// Hlavní světlo
const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
dirLight.position.set(5, 10, -4);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(4096, 4096);   // 4K shadow map
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 25;
dirLight.shadow.camera.left = -6;
dirLight.shadow.camera.right = 6;
dirLight.shadow.camera.top = 6;
dirLight.shadow.camera.bottom = -6;
dirLight.shadow.bias = -0.0001;
dirLight.shadow.radius = 4;  // VSM blur radius

// Contact shadow (tmavý kruh pod domečkem pro "uzemnění")
const contactShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 3.5),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.15,
    depthWrite: false
  })
);
contactShadow.rotation.x = -Math.PI / 2;
contactShadow.position.set(0, 0.002, 0);
scene.add(contactShadow);
```

### 3. SSAO Post-processing

Ambient Occlusion přidá realistické stínování v rozích, pod přesahy střechy, kolem trámů.

```javascript
function setupPostProcessing() {
  const composer = new THREE.EffectComposer(renderer);

  // Render pass
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  // SSAO
  const ssaoPass = new THREE.SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
  ssaoPass.kernelRadius = 0.3;     // radius efektu
  ssaoPass.minDistance = 0.001;
  ssaoPass.maxDistance = 0.15;
  ssaoPass.output = THREE.SSAOPass.OUTPUT.Default;
  composer.addPass(ssaoPass);

  // Gamma correction
  const gammaPass = new THREE.ShaderPass(THREE.GammaCorrectionShader);
  composer.addPass(gammaPass);

  return composer;
}

// V animation loop použij composer.render() místo renderer.render():
// composer.render();
// POZOR: při resize aktualizuj i composer.setSize()
```

DŮLEŽITÉ: Pokud SSAOPass nefunguje (CDN problém), přeskoč post-processing a použij jen
Tier 1 vylepšení (HDRI + stíny + textury). Výsledek bude stále výrazně lepší než v2.

### 4. Vylepšené textury dřeva

```javascript
// Větší canvas = víc detailu
function makeWoodTexture(baseColor, grainColor, options = {}) {
  const size = options.size || 512;  // 512 místo 256
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');

  // Base
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Variace základní barvy (subtle noise)
  for (let i = 0; i < 800; i++) {
    ctx.fillStyle = `rgba(${Math.random()>0.5?255:0},${Math.random()>0.5?200:50},0,0.02)`;
    ctx.fillRect(Math.random()*size, Math.random()*size, Math.random()*8+2, Math.random()*4+1);
  }

  // Grain lines (víc vrstev, víc realismu)
  for (let layer = 0; layer < 3; layer++) {
    ctx.strokeStyle = grainColor;
    for (let i = 0; i < 50; i++) {
      ctx.globalAlpha = 0.04 + Math.random() * 0.08;
      ctx.lineWidth = 0.3 + Math.random() * 1.2;
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < size; x += 4) {
        ctx.lineTo(x, y + Math.sin(x * 0.01 + i * 0.7) * 4 + (Math.random()-0.5) * 1.5);
      }
      ctx.stroke();
    }
  }

  // Knots (suky — občasné tmavé ovály)
  const knotCount = options.knots || 2;
  for (let i = 0; i < knotCount; i++) {
    const kx = Math.random() * size;
    const ky = Math.random() * size;
    const kr = 4 + Math.random() * 10;
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#4a3520';
    ctx.beginPath();
    ctx.ellipse(kx, ky, kr, kr * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    // Rings around knot
    for (let r = 1; r < 4; r++) {
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#5a4530';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr + r*6, kr*0.7 + r*4, Math.random()*0.2, 0, Math.PI*2);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(options.repeatX || 2, options.repeatY || 2);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); // ostré textury pod úhlem
  return tex;
}
```

### 5. Ground plane — realistický trávník

```javascript
function createGround() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');

  // Base green
  ctx.fillStyle = '#4a7a2e';
  ctx.fillRect(0, 0, 512, 512);

  // Noise patches
  for (let i = 0; i < 3000; i++) {
    const g = 80 + Math.random() * 60;
    ctx.fillStyle = `rgba(${30+Math.random()*40}, ${g}, ${20+Math.random()*20}, 0.15)`;
    ctx.fillRect(Math.random()*512, Math.random()*512, 2+Math.random()*6, 2+Math.random()*6);
  }

  // Tiny grass blades
  ctx.strokeStyle = '#5a8a35';
  for (let i = 0; i < 500; i++) {
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 0.5;
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random()-0.5)*3, y - 3 - Math.random()*5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(25, 25),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 1.0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  return ground;
}
```

### Pořadí implementace grafiky

1. HDRI environment (setupEnvironment) — PRVNÍ, největší dopad
2. Stíny upgrade (VSM, 4096, contact shadow)
3. Vylepšené textury dřeva (512px, knots, anisotropy)
4. Ground plane s trávou
5. SSAO post-processing — POSLEDNÍ (může být problematické s CDN, má fallback)

### Fallback strategie

Pokud HDRI nebo SSAO nefunguje (CORS, CDN down):
- HDRI fallback → gradient skybox (setupFallbackSky)
- SSAO fallback → přeskoč, použij jen renderer.render()
- Vždy implementuj try/catch kolem externích loadů

## Three.js CDN a importy

```html
<!-- Core -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- Post-processing (EffectComposer + SSAO) -->
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/SSAOPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script>

<!-- HDRI environment loading -->
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/RGBELoader.js"></script>

<!-- Gamma correction -->
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/GammaCorrectionShader.js"></script>
```

DŮLEŽITÉ: Pokud některý CDN import nefunguje, vyzkoušej alternativní cestu:
`https://unpkg.com/three@0.128.0/examples/js/...`
Pokud ani to nefunguje, implementuj fallback bez post-processingu (jen lepší stíny + textury).

## UI požadavky

- Dark theme overlay (barvy: #1a1f16 pozadí, #d4c9a8 text, #8a9a72 sekundární)
- Tab bar nahoře nebo dole
- Spec chips s rozměry
- Legenda barev (pravá strana)
- Nápověda ovládání (dole)
- Pro 2D pohledy: tlačítko "Tisk / Export" (window.print())
- Responzivní — funguje i na mobilu

## Pravidla pro editace

1. Všechny rozměry POUZE z CONFIG objektu — nikdy hardcoded čísla v geometrii
2. Každá funkce create*() vrací THREE.Group a přidává se do hlavního `playhouse` Group
3. Při editaci jedné části NIKDY neměň ostatní funkce
4. Kóty a popisky jsou v samostatných Group vrstvách (zapínatelné)
5. Při změně rozměru v CONFIG se musí celý model přepočítat správně

## Známé problémy z v2 k opravě

- Pravá stěna: segmenty kolem okna mají drobné mezery
- Klouzačka: pozice a úhel potřebuje doladit (start přesně od hrany terasy 2. patra)
- Žebřík: úhel naklonění nerealistický (měl by být cca 75°, víc svislý)
- 1. patro: záměrně otevřené zepředu (-Z), má stěny vzadu (+Z), vpravo (+X, jen sloupky) a vlevo (-X)
- Střecha: přesah vpředu by měl končit přesně nad přední stěnou kabiny (divZ), ne nad terasou
- Okno v pravé stěně: rám s křížem je na správné pozici, ale stěnové segmenty kolem mají švy
- Dveřní rám: lintel (překlad) by měl vizuálně navazovat na okolní stěnu

## Workflow

1. Vždy edituj jen relevantní funkci
2. Po každé editaci ověř v prohlížeči (open domecek.html)
3. Commituj po každé funkční změně
4. Pro kontrolu rozměrů zapni kóty (dimensions toggle)

## Doporučený postup implementace

### Fáze 1 — Kostra
1. CONFIG + renderer setup (shadows, tone mapping, encoding)
2. setupEnvironment() — HDRI s fallbackem
3. setupMaterials() — vylepšené 512px textury
4. createGround() + createPosts() + createFloors()
5. Ověřit v prohlížeči → commit

### Fáze 2 — Model
6. createWalls() — zadní + pravá + přední kabiny s otvory
7. createRoof()
8. createRailing() + createSlide() + createLadder()
9. createBeams() + createFootings()
10. Ověřit → commit

### Fáze 3 — Grafika
11. setupPostProcessing() — SSAO (s try/catch fallback)
12. Contact shadow pod domečkem
13. Doladit světla, exposure, stíny
14. Ověřit → commit

### Fáze 4 — Pohledy
15. Tab systém UI (HTML + CSS)
16. OrthographicCamera pro 2D pohledy
17. viewFloorPlan1() + viewFloorPlan2()
18. viewFront() + viewSide() + viewSection()
19. Kóty a popisky pro každý pohled
20. Finální test → commit
