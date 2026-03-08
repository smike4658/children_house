// ============================================================
// Walls — stěny
// ============================================================

// Vytvoří materiál pro stěnu se správným mapováním textury podle skutečných rozměrů
// Chceme aby 1 "opakovani" textury palubek (což je 16 prken na obrazek) mělo fixní reálnou velikost.
// 1 prkno = 20 cm = 0.20 m. 16 prken = 3.20 m výšky na jednu texturu.
// Na šířku nastavíme třeba 2.0 m na jedno zopakování.
const PLANK_TEX_H = 3.20; // 16 prken × 0.20 m
const PLANK_TEX_W = 2.0;  // šířka textury v metrech

// Materiál pro BoxGeometry (UV 0..1)
function getWallMat(width, height, offsetY = 0) {
  const m = MAT.walls.clone();
  m.map = MAT.wallsTex.clone();
  m.map.needsUpdate = true;
  m.map.repeat.set(width / PLANK_TEX_W, height / PLANK_TEX_H);
  m.map.offset.set(0, (offsetY % PLANK_TEX_H) / PLANK_TEX_H);
  return m;
}

// Materiál pro ExtrudeGeometry (UV ve světových jednotkách/metrech)
function getWallMatExtrude(offsetY = 0) {
  const m = MAT.walls.clone();
  m.map = MAT.wallsTex.clone();
  m.map.needsUpdate = true;
  // ExtrudeGeometry UV jsou přímo v metrech, takže repeat = 1/velikost_textury
  m.map.repeat.set(1 / PLANK_TEX_W, 1 / PLANK_TEX_H);
  m.map.offset.set(0, (offsetY % PLANK_TEX_H) / PLANK_TEX_H);
  return m;
}

// Helper: stěna s otvorem (okno/dveře)
function wallWithHole(totalW, totalH, holeX, holeY, holeW, holeH, depth, offsetY = 0) {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  const hw = totalW / 2;
  // Vnější obdélník (CCW)
  shape.moveTo(-hw, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, totalH);
  shape.lineTo(-hw, totalH);
  shape.lineTo(-hw, 0);

  // Vnitřní otvor (CW)
  const p = new THREE.Path();
  const l = holeX - holeW / 2;
  const r = holeX + holeW / 2;
  const b = holeY - holeH / 2;
  const t = holeY + holeH / 2;
  p.moveTo(l, b);
  p.lineTo(l, t);
  p.lineTo(r, t);
  p.lineTo(r, b);
  p.lineTo(l, b);
  shape.holes.push(p);

  // Vygenerovat UV na zakladé pozice (protože extrude si generuje UV blbě)
  const geom = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: 1 });
  geom.translate(0, -totalH / 2, -depth / 2);

  const mesh = new THREE.Mesh(geom, getWallMatExtrude(offsetY));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(0, totalH / 2, 0);
  g.add(mesh);
  return g;
}

// Wall with two holes (door + window)
function wallWithTwoHoles(totalW, totalH, holes, depth, offsetY = 0) {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  const hw = totalW / 2;
  // Vnější obdélník (CCW)
  shape.moveTo(-hw, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, totalH);
  shape.lineTo(-hw, totalH);
  shape.lineTo(-hw, 0);

  // Otvory (CW winding)
  holes.forEach(hole => {
    const p = new THREE.Path();
    const l = hole.x - hole.w / 2;
    const r = hole.x + hole.w / 2;
    const b = hole.y - hole.h / 2;
    const t = hole.y + hole.h / 2;
    p.moveTo(l, b);
    p.lineTo(l, t);
    p.lineTo(r, t);
    p.lineTo(r, b);
    p.lineTo(l, b);
    shape.holes.push(p);
  });

  const geom = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: 1 });
  geom.translate(0, -totalH / 2, -depth / 2);

  const mesh = new THREE.Mesh(geom, getWallMatExtrude(offsetY));
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.position.set(0, totalH / 2, 0);
  g.add(mesh);
  return g;
}

function createWalls() {
  const g = new THREE.Group(); g.name = 'walls';
  const T = CONFIG.WALL_T;
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const divZ = CONFIG.divZ;

  // === Zadní stěna (+Z) — plná, celá výška (1. + 2. patro) ===
  const backMat = getWallMat(CONFIG.W, CONFIG.H, 0); // startuje na světle od 0 nahoru
  const backWall = box(CONFIG.W, CONFIG.H, T, backMat);
  backWall.position.set(0, CONFIG.H / 2, hd + T / 2);
  g.add(backWall);

  // === Levá stěna (-X) — plná 1. patro + 2. patro s oknem ===
  // 1. patro: plná
  const l1Mat = getWallMat(CONFIG.D, CONFIG.H1, 0);
  const left1 = box(T, CONFIG.H1, CONFIG.D, l1Mat);
  left1.position.set(-hw - T / 2, CONFIG.H1 / 2, 0);
  g.add(left1);

  // 2. patro levá stěna s oknem — pouze kabina (ne terasa)
  const r2H = CONFIG.H - CONFIG.H1;
  const win2 = { x: 0, y: r2H / 2, w: CONFIG.SIDE_WIN_W, h: CONFIG.SIDE_WIN_H };
  const left2 = wallWithHole(CONFIG.CD, r2H, win2.x, win2.y, win2.w, win2.h, T, CONFIG.H1); // offset = H1
  left2.rotation.y = Math.PI / 2;
  left2.position.set(-hw - T / 2, CONFIG.H1, divZ + CONFIG.CD / 2);
  g.add(left2);

  // Window frame — left wall (centered on cabin, not terrace)
  addWindowFrame(g, -hw - T, CONFIG.H1 + win2.y, divZ + CONFIG.CD / 2, CONFIG.SIDE_WIN_W, CONFIG.SIDE_WIN_H, T, 'x', true);

  // === Pravá stěna (+X) — plná, pouze 2. patro, pouze kabina (ne terasa) ===
  const r2H_right = CONFIG.H - CONFIG.H1;
  const r2Mat = getWallMat(CONFIG.CD, r2H_right, CONFIG.H1);
  const right2 = box(T, r2H_right, CONFIG.CD, r2Mat);
  right2.position.set(hw + T / 2, CONFIG.H1 + r2H_right / 2, divZ + CONFIG.CD / 2);
  g.add(right2);

  // === Přední stěna kabiny (divZ) — 2. patro, dveře + okno ===
  const cabH = (CONFIG.H + CONFIG.ROOF_PEAK) - CONFIG.H1; // Zvýšeno až ke střeše (vpředu je vyšší hrana pultové střechy)
  // Dveře: vlevo, okno vpravo
  const doorX = -CONFIG.W / 2 + CONFIG.DOOR_W / 2 + CONFIG.DOOR_OFFSET_X + 0.15;
  const doorRightEdge = doorX + CONFIG.DOOR_W / 2;
  const winX = doorRightEdge + (CONFIG.W / 2 - doorRightEdge) / 2;

  // Pozice Y = střed původní zdi (0.75 m od podlahy přidáme H1)
  const holeY = (CONFIG.H - CONFIG.H1) / 2;

  const holes = [
    { x: doorX, y: CONFIG.DOOR_H / 2, w: CONFIG.DOOR_W, h: CONFIG.DOOR_H },
    { x: winX, y: holeY, w: CONFIG.FRONT_WIN_W, h: CONFIG.FRONT_WIN_H },
  ];
  // Front cabin wall panels
  const frontCabin = wallWithTwoHoles(CONFIG.W, cabH, holes, T, CONFIG.H1);
  frontCabin.position.set(0, CONFIG.H1, divZ - T / 2);
  g.add(frontCabin);

  // Door frame (s obnoveným vlastním horním překladem)
  addDoorFrame(g, doorX, CONFIG.H1, divZ - T, CONFIG.DOOR_W, CONFIG.DOOR_H, T);

  // Front cabin window frame (obnovený s horním překladem, šířka okna zachována)
  addWindowFrame(g, winX, CONFIG.H1 + holeY, divZ - T, CONFIG.FRONT_WIN_W, CONFIG.FRONT_WIN_H, T, 'z', false);

  // Shelf (pultík) under front window — protrudes toward terrace
  const shelfW = CONFIG.FRONT_WIN_W + 0.10; // slightly wider than window
  const shelfD = 0.18; // depth of shelf protruding outward
  const shelfT = 0.03; // thickness
  const shelfY = CONFIG.H1 + holeY - CONFIG.FRONT_WIN_H / 2 - 0.01; // just below window
  const shelfZ = divZ - T - shelfD / 2;
  const shelf = box(shelfW, shelfT, shelfD, MAT.frame, true, true);
  shelf.position.set(winX, shelfY, shelfZ);
  g.add(shelf);

  // Shelf brackets (two angled supports)
  const bracketH = 0.12;
  const bracketD = shelfD - 0.02;
  const bracketT = 0.02;
  [-1, 1].forEach(side => {
    const bracket = box(bracketT, bracketH, bracketD, MAT.frame, false, false);
    bracket.position.set(winX + side * (shelfW / 2 - 0.06), shelfY - bracketH / 2 - shelfT / 2, shelfZ);
    g.add(bracket);
  });

  // === Štítové zdi (gable walls) — trojúhelníky mezi stěnou a střechou ===
  const H2 = CONFIG.H;
  const gableLen = hd - divZ; // hloubka kabiny podél Z

  // Na štíty uděláme materiál — ExtrudeGeometry, UV ve světových jednotkách
  const gableMat = getWallMatExtrude(H2);

  [1, -1].forEach(side => {
    const shape = new THREE.Shape();
    if (side === 1) {
      // Pravá (+X): rot π/2 → shape X maps to world -Z
      shape.moveTo(0, 0);
      shape.lineTo(gableLen, 0);
      shape.lineTo(gableLen, CONFIG.ROOF_PEAK);
    } else {
      // Levá (-X): rot -π/2 → shape X maps to world +Z
      shape.moveTo(0, 0);
      shape.lineTo(gableLen, 0);
      shape.lineTo(0, CONFIG.ROOF_PEAK);
    }
    shape.closePath();

    const geom = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false, curveSegments: 1 });
    const mesh = new THREE.Mesh(geom, gableMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.y = side * Math.PI / 2;
    if (side === 1) {
      mesh.position.set(hw + T / 2, H2, hd);
    } else {
      mesh.position.set(-hw - T / 2, H2, divZ);
    }
    g.add(mesh);
  });

  return g;
}

function addWindowFrame(g, x, y, z, w, h, depth, axis, crosshair = false) {
  const FT = 0.03;
  if (axis === 'x') {
    // Frame around window in right wall (rotated)
    const parts = [
      // top
      { pw: w + FT * 2, ph: FT, pd: depth * 2, ox: 0, oy: h / 2 + FT / 2, oz: 0 },
      // bottom
      { pw: w + FT * 2, ph: FT, pd: depth * 2, ox: 0, oy: -h / 2 - FT / 2, oz: 0 },
      // left
      { pw: FT, ph: h, pd: depth * 2, ox: 0, oy: 0, oz: -w / 2 - FT / 2 },
      // right
      { pw: FT, ph: h, pd: depth * 2, ox: 0, oy: 0, oz: w / 2 + FT / 2 },
    ];
    if (crosshair) {
      parts.push({ pw: w, ph: FT, pd: depth * 2, ox: 0, oy: 0, oz: 0 }); // horiz
      parts.push({ pw: FT, ph: h, pd: depth * 2, ox: 0, oy: 0, oz: 0 }); // vert
    }
    parts.forEach(p => {
      const m = box(p.pd, p.ph, p.pw, MAT.frame, false, false);
      m.position.set(x, y + p.oy, z + p.oz);
      g.add(m);
    });
    // Glass
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), MAT.glass);
    glass.rotation.y = Math.PI / 2;
    glass.position.set(x, y, z);
    g.add(glass);
  } else {
    // z-facing window standard
    const parts = [
      { pw: w + FT * 2, ph: FT, pd: depth * 2, ox: 0, oy: h / 2 + FT / 2, oz: 0 },
      { pw: w + FT * 2, ph: FT, pd: depth * 2, ox: 0, oy: -h / 2 - FT / 2, oz: 0 },
      { pw: FT, ph: h + FT * 2, pd: depth * 2, ox: -w / 2 - FT / 2, oy: 0, oz: 0 },
      { pw: FT, ph: h + FT * 2, pd: depth * 2, ox: w / 2 + FT / 2, oy: 0, oz: 0 },
    ];
    parts.forEach(p => {
      const m = box(p.pw, p.ph, p.pd, MAT.frame, false, false);
      m.position.set(x + p.ox, y + p.oy, z);
      g.add(m);
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), MAT.glass);
    glass.position.set(x, y, z);
    g.add(glass);
  }
}

function addDoorFrame(g, x, y, z, w, h, depth) {
  const FT = 0.04;
  // sides 
  [-1, 1].forEach(side => {
    const m = box(FT, h, depth * 2, MAT.frame, false, false);
    m.position.set(x + side * (w / 2 + FT / 2), y + h / 2, z);
    g.add(m);
  });
  // lintel
  const lintel = box(w + FT * 2, FT, depth * 2, MAT.frame, false, false);
  lintel.position.set(x, y + h + FT / 2, z);
  g.add(lintel);
}
