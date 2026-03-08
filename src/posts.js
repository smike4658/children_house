// ============================================================
// Posts — nosné sloupky
// ============================================================
function createPosts() {
  const g = new THREE.Group(); g.name = 'posts';
  const P = CONFIG.POST;
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const H_front = CONFIG.H1 + CONFIG.RAIL_H;   // přední sloupy (terasa) — úroveň zábradlí 2.40m
  const H_cabin_front = CONFIG.H + CONFIG.ROOF_PEAK; // přední stěna kabiny (divZ) — úroveň 3.45m
  const H_back = CONFIG.H;                    // zadní sloupy — úroveň 3.00m
  const FH = 0.10;

  // 4 rohové sloupky — terasa nižší, zadní na 3.00
  const corners = [
    [-hw, -hd, H_front], [hw, -hd, H_front],
    [-hw, hd, H_back], [hw, hd, H_back],
  ];
  corners.forEach(([x, z, h]) => {
    const ph = h - FH; // výška od patky po vrch
    const m = box(P, ph, P, MAT.posts);
    m.position.set(x, FH + ph / 2, z);
    g.add(m);
  });

  // divZ = pozice přední stěny kabiny = -hd + CONFIG.TD
  const divZ = CONFIG.divZ;
  // 2 dělicí sloupky terasa/kabina, od H1 výš po H_cabin_front
  const cabinH = H_cabin_front - CONFIG.H1;
  [-hw, hw].forEach(x => {
    const m = box(P * 0.85, cabinH, P * 0.85, MAT.posts);
    m.position.set(x, CONFIG.H1 + cabinH / 2, divZ);
    g.add(m);
  });

  return g;
}
