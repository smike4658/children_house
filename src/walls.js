// ============================================================
// Walls — stěny (přízemní verze)
// ============================================================

const PLANK_TEX_H = 3.20;
const PLANK_TEX_W = 2.0;

function getWallMat(width, height, offsetY = 0) {
  const m = MAT.walls.clone();
  m.map = MAT.wallsTex.clone();
  m.map.needsUpdate = true;
  m.map.repeat.set(width / PLANK_TEX_W, height / PLANK_TEX_H);
  m.map.offset.set(0, (offsetY % PLANK_TEX_H) / PLANK_TEX_H);
  return m;
}

function getWallMatExtrude(offsetY = 0) {
  const m = MAT.walls.clone();
  m.map = MAT.wallsTex.clone();
  m.map.needsUpdate = true;
  m.map.repeat.set(1 / PLANK_TEX_W, 1 / PLANK_TEX_H);
  m.map.offset.set(0, (offsetY % PLANK_TEX_H) / PLANK_TEX_H);
  return m;
}

function wallWithHole(totalW, totalH, holeX, holeY, holeW, holeH, depth, offsetY = 0) {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  const hw = totalW / 2;
  shape.moveTo(-hw, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, totalH);
  shape.lineTo(-hw, totalH);
  shape.lineTo(-hw, 0);

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

  const geom = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: 1 });
  geom.translate(0, -totalH / 2, -depth / 2);

  const mesh = new THREE.Mesh(geom, getWallMatExtrude(offsetY));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(0, totalH / 2, 0);
  g.add(mesh);
  return g;
}

function wallWithTwoHoles(totalW, totalH, holes, depth, offsetY = 0) {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  const hw = totalW / 2;
  shape.moveTo(-hw, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, totalH);
  shape.lineTo(-hw, totalH);
  shape.lineTo(-hw, 0);

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
  const H_F = CONFIG.H_FRONT;
  const H_B = CONFIG.H_BACK;

  // === Zadní stěna (+Z) — plná, výška H_BACK ===
  const backMat = getWallMat(CONFIG.W, H_B, 0);
  const backWall = box(CONFIG.W, H_B, T, backMat);
  backWall.position.set(0, H_B / 2, hd + T / 2);
  g.add(backWall);

  // === Levá stěna (-X) — s oknem uprostřed ===
  const leftH = (H_F + H_B) / 2; // průměrná výška pro obdélníkovou aproximaci
  const winY_left = 1.00 + CONFIG.SIDE_WIN_H / 2; // okno 1m od podlahy
  const leftWall = wallWithHole(CONFIG.D, H_F, 0, winY_left, CONFIG.SIDE_WIN_W, CONFIG.SIDE_WIN_H, T, 0);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-hw - T / 2, 0, 0);
  g.add(leftWall);

  addWindowFrame(g, -hw - T, winY_left, 0, CONFIG.SIDE_WIN_W, CONFIG.SIDE_WIN_H, T, 'x', true);

  // === Pravá stěna (+X) — s oknem uprostřed ===
  const rightWall = wallWithHole(CONFIG.D, H_F, 0, winY_left, CONFIG.SIDE_WIN_W, CONFIG.SIDE_WIN_H, T, 0);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(hw + T / 2, 0, 0);
  g.add(rightWall);

  addWindowFrame(g, hw + T, winY_left, 0, CONFIG.SIDE_WIN_W, CONFIG.SIDE_WIN_H, T, 'x', true);

  // === Přední stěna (-Z) — posuvné dveře + prodejní okno (California styl) ===
  const doorX = CONFIG.DOOR_OFFSET_X;
  const winX = CONFIG.SERVE_WIN_X;
  const winY_front = CONFIG.SERVE_WIN_BOTTOM + CONFIG.SERVE_WIN_H / 2;

  const holes = [
    { x: doorX, y: CONFIG.DOOR_H / 2, w: CONFIG.DOOR_W, h: CONFIG.DOOR_H },
    { x: winX, y: winY_front, w: CONFIG.SERVE_WIN_W, h: CONFIG.SERVE_WIN_H },
  ];
  const frontWall = wallWithTwoHoles(CONFIG.W, H_F, holes, T, 0);
  frontWall.position.set(0, 0, -hd - T / 2);
  g.add(frontWall);

  // Door frame (posuvné dveře)
  addDoorFrame(g, doorX, 0, -hd - T, CONFIG.DOOR_W, CONFIG.DOOR_H, T);

  // Serving window frame
  addWindowFrame(g, winX, winY_front, -hd - T, CONFIG.SERVE_WIN_W, CONFIG.SERVE_WIN_H, T, 'z', false);

  // Counter (pult) — dřevěná deska pod prodejním oknem
  const counterY = CONFIG.SERVE_WIN_BOTTOM;
  const counter = box(CONFIG.SERVE_WIN_W + 0.04, 0.03, CONFIG.SERVE_COUNTER_D, MAT.frame);
  counter.position.set(winX, counterY, -hd - T - CONFIG.SERVE_COUNTER_D / 2);
  g.add(counter);

  // Awning (stříška) — nad prodejním oknem
  const awningY = winY_front + CONFIG.SERVE_WIN_H / 2 + 0.03;
  const awningW = CONFIG.SERVE_WIN_W + 0.10;
  const awning = box(awningW, 0.03, CONFIG.SERVE_AWNING_D, MAT.frame);
  awning.position.set(winX, awningY, -hd - T - CONFIG.SERVE_AWNING_D / 2);
  awning.rotation.x = 0.15;
  g.add(awning);

  // Awning brackets (podpěry stříšky)
  [-1, 1].forEach(side => {
    const bx = winX + side * (CONFIG.SERVE_WIN_W / 2 - 0.05);
    const bracket = box(0.025, 0.15, 0.025, MAT.frame);
    bracket.position.set(bx, awningY - 0.09, -hd - T - CONFIG.SERVE_AWNING_D * 0.4);
    g.add(bracket);
  });

  return g;
}

function addWindowFrame(g, x, y, z, w, h, depth, axis, crosshair = false) {
  const FT = 0.03;
  if (axis === 'x') {
    const parts = [
      { pw: w + FT * 2, ph: FT, pd: depth * 2, ox: 0, oy: h / 2 + FT / 2, oz: 0 },
      { pw: w + FT * 2, ph: FT, pd: depth * 2, ox: 0, oy: -h / 2 - FT / 2, oz: 0 },
      { pw: FT, ph: h, pd: depth * 2, ox: 0, oy: 0, oz: -w / 2 - FT / 2 },
      { pw: FT, ph: h, pd: depth * 2, ox: 0, oy: 0, oz: w / 2 + FT / 2 },
    ];
    if (crosshair) {
      parts.push({ pw: w, ph: FT, pd: depth * 2, ox: 0, oy: 0, oz: 0 });
      parts.push({ pw: FT, ph: h, pd: depth * 2, ox: 0, oy: 0, oz: 0 });
    }
    parts.forEach(p => {
      const m = box(p.pd, p.ph, p.pw, MAT.frame, false, false);
      m.position.set(x, y + p.oy, z + p.oz);
      g.add(m);
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), MAT.glass);
    glass.rotation.y = Math.PI / 2;
    glass.position.set(x, y, z);
    g.add(glass);
  } else {
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
  [-1, 1].forEach(side => {
    const m = box(FT, h, depth * 2, MAT.frame, false, false);
    m.position.set(x + side * (w / 2 + FT / 2), y + h / 2, z);
    g.add(m);
  });
  const lintel = box(w + FT * 2, FT, depth * 2, MAT.frame, false, false);
  lintel.position.set(x, y + h + FT / 2, z);
  g.add(lintel);
}
