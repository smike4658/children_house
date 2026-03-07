// ============================================================
// Walls — stěny
// ============================================================

// Helper: stěna s otvorem (okno/dveře)
function wallWithHole(totalW, totalH, holeX, holeY, holeW, holeH, mat, depth) {
  const g = new THREE.Group();
  const leftEdge = -totalW / 2;
  const rightEdge = totalW / 2;
  const holeLeft = holeX - holeW / 2;
  const holeRight = holeX + holeW / 2;
  const holeTop = holeY + holeH / 2;
  const holeBottom = holeY - holeH / 2;
  const segments = [
    // vlevo od otvoru
    {
      x: (leftEdge + holeLeft) / 2,
      w: holeLeft - leftEdge,
      y: totalH / 2, h: totalH
    },
    // vpravo od otvoru
    {
      x: (holeRight + rightEdge) / 2,
      w: rightEdge - holeRight,
      y: totalH / 2, h: totalH
    },
    // nad otvorem
    {
      x: holeX, w: holeW,
      y: (holeTop + totalH) / 2,
      h: totalH - holeTop
    },
    // pod otvorem
    {
      x: holeX, w: holeW,
      y: holeBottom / 2,
      h: holeBottom
    },
  ];
  segments.forEach(s => {
    if (s.w <= 0.001 || s.h <= 0.001) return;
    const m = box(s.w, s.h, depth, mat);
    m.position.set(s.x, s.y, 0);
    g.add(m);
  });
  return g;
}

// Wall with two holes (door + window)
function wallWithTwoHoles(totalW, totalH, holes, mat, depth) {
  // holes: [{x, y, w, h}, ...]
  // Simple approach: build column strips
  const g = new THREE.Group();
  // Sort holes by x
  holes.sort((a, b) => a.x - b.x);
  const h1 = holes[0], h2 = holes[1];

  // Full height strips between/around holes
  const leftEdge = -totalW / 2;
  const rightEdge = totalW / 2;

  // Columns: left of h1, between h1 and h2, right of h2
  const columns = [
    { x0: leftEdge, x1: h1.x - h1.w / 2 },
    { x0: h1.x + h1.w / 2, x1: h2.x - h2.w / 2 },
    { x0: h2.x + h2.w / 2, x1: rightEdge },
  ];
  columns.forEach(col => {
    const cw = col.x1 - col.x0;
    if (cw <= 0.001) return;
    const m = box(cw, totalH, depth, mat);
    m.position.set((col.x0 + col.x1) / 2, totalH / 2, 0);
    g.add(m);
  });

  // Rows above/below each hole (in their x range)
  holes.forEach(hole => {
    // above
    const aboveH = totalH - (hole.y + hole.h / 2);
    if (aboveH > 0.001) {
      const m = box(hole.w, aboveH, depth, mat);
      m.position.set(hole.x, hole.y + hole.h / 2 + aboveH / 2, 0);
      g.add(m);
    }
    // below
    const belowH = hole.y - hole.h / 2;
    if (belowH > 0.001) {
      const m = box(hole.w, belowH, depth, mat);
      m.position.set(hole.x, belowH / 2, 0);
      g.add(m);
    }
  });

  return g;
}

function createWalls() {
  const g = new THREE.Group(); g.name = 'walls';
  const T = CONFIG.WALL_T;
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const divZ = CONFIG.divZ;

  // === Zadní stěna (+Z) — plná, celá výška (1. + 2. patro) ===
  const backWall = box(CONFIG.W, CONFIG.H, T, MAT.walls);
  backWall.position.set(0, CONFIG.H / 2, hd + T / 2);
  g.add(backWall);

  // === Levá stěna (-X) — plná 1. patro + 2. patro s oknem ===
  // 1. patro: plná
  const left1 = box(T, CONFIG.H1, CONFIG.D, MAT.walls);
  left1.position.set(-hw - T / 2, CONFIG.H1 / 2, 0);
  g.add(left1);

  // 2. patro levá stěna s oknem — pouze kabina (ne terasa)
  const r2H = CONFIG.H - CONFIG.H1;
  const win2 = { x: 0, y: r2H / 2, w: CONFIG.SIDE_WIN_W, h: CONFIG.SIDE_WIN_H };
  const left2 = wallWithHole(CONFIG.CD, r2H, win2.x, win2.y, win2.w, win2.h, MAT.walls, T);
  left2.rotation.y = Math.PI / 2;
  left2.position.set(-hw - T / 2, CONFIG.H1, divZ + CONFIG.CD / 2);
  g.add(left2);

  // Window frame — left wall (centered on cabin, not terrace)
  addWindowFrame(g, -hw - T, CONFIG.H1 + win2.y, divZ + CONFIG.CD / 2, CONFIG.SIDE_WIN_W, CONFIG.SIDE_WIN_H, T, 'x', true);

  // === Pravá stěna (+X) — plná, pouze 2. patro, pouze kabina (ne terasa) ===
  const r2H_right = CONFIG.H - CONFIG.H1;
  const right2 = box(T, r2H_right, CONFIG.CD, MAT.walls);
  right2.position.set(hw + T / 2, CONFIG.H1 + r2H_right / 2, divZ + CONFIG.CD / 2);
  g.add(right2);

  // === Přední stěna kabiny (divZ) — 2. patro, dveře + okno ===
  const cabH = CONFIG.H - CONFIG.H1;
  // Dveře: vlevo, okno vpravo
  const doorX = -CONFIG.W / 2 + CONFIG.DOOR_W / 2 + CONFIG.DOOR_OFFSET_X + 0.15;
  const winX = CONFIG.W / 2 - CONFIG.FRONT_WIN_W / 2 - 0.15;
  const holes = [
    { x: doorX, y: CONFIG.DOOR_H / 2, w: CONFIG.DOOR_W, h: CONFIG.DOOR_H },
    { x: winX, y: cabH / 2, w: CONFIG.FRONT_WIN_W, h: CONFIG.FRONT_WIN_H },
  ];
  const frontCabin = wallWithTwoHoles(CONFIG.W, cabH, holes, MAT.walls, T);
  frontCabin.position.set(0, CONFIG.H1, divZ - T / 2);
  g.add(frontCabin);

  // Door frame
  addDoorFrame(g, doorX, CONFIG.H1, divZ - T, CONFIG.DOOR_W, CONFIG.DOOR_H, T);
  // Front cabin window frame
  addWindowFrame(g, winX, CONFIG.H1 + cabH / 2, divZ - T, CONFIG.FRONT_WIN_W, CONFIG.FRONT_WIN_H, T, 'z', false);

  // === Štítové zdi (gable walls) — trojúhelníky mezi stěnou a střechou ===
  const H2 = CONFIG.H;
  const gableLen = hd - divZ; // hloubka kabiny podél Z

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

    const geom = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
    const mesh = new THREE.Mesh(geom, MAT.walls.clone());
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
      { pw: FT, ph: h, pd: depth * 2, ox: -w / 2 - FT / 2, oy: 0, oz: 0 },
      // right
      { pw: FT, ph: h, pd: depth * 2, ox: w / 2 + FT / 2, oy: 0, oz: 0 },
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
    // z-facing window
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
