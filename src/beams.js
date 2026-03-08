// ============================================================
// Beams — trámy
// ============================================================
function createBeams() {
  const g = new THREE.Group(); g.name = 'beams';
  const B = CONFIG.BEAM;
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;

  const divZ = CONFIG.divZ;
  const H2 = CONFIG.H;
  const HP = H2 + CONFIG.ROOF_PEAK;

  // === Podlaha 2. patra — obvodový rám + středový trám + joists ===
  const floor2Y = CONFIG.H1 - B / 2;

  // Obvodové trámy (rám dokola)
  [-hd, hd].forEach(z => {
    const m = box(CONFIG.W, B, B, MAT.beam);
    m.position.set(0, floor2Y, z);
    g.add(m);
  });
  [-hw, hw].forEach(x => {
    const m = box(B, B, CONFIG.D, MAT.beam);
    m.position.set(x, floor2Y, 0);
    g.add(m);
  });

  // Středový trám — podél Z, uprostřed šířky
  const center2 = box(B, B, CONFIG.D, MAT.beam);
  center2.position.set(0, floor2Y, 0);
  g.add(center2);

  // Příčné joists (3 ks rovnoměrně uvnitř)
  for (let i = 0; i < 3; i++) {
    const z = -hd + CONFIG.D / 4 * (i + 1);
    const m = box(CONFIG.W, B, B, MAT.beam);
    m.position.set(0, floor2Y, z);
    g.add(m);
  }

  // === Podlaha 1. patra — obvodový rám + středový trám + joists ===
  const floorY = -B / 2 + 0.01;

  // Obvodové trámy (rám dokola)
  // Přední (-Z) a zadní (+Z) — podél X
  [-hd, hd].forEach(z => {
    const m = box(CONFIG.W, B, B, MAT.beam);
    m.position.set(0, floorY, z);
    g.add(m);
  });
  // Levý (-X) a pravý (+X) — podél Z
  [-hw, hw].forEach(x => {
    const m = box(B, B, CONFIG.D, MAT.beam);
    m.position.set(x, floorY, 0);
    g.add(m);
  });

  // Středový trám — podél Z, uprostřed šířky
  const centerBeam = box(B, B, CONFIG.D, MAT.beam);
  centerBeam.position.set(0, floorY, 0);
  g.add(centerBeam);

  // Příčné joists (3 ks rovnoměrně uvnitř)
  for (let i = 0; i < 3; i++) {
    const z = -hd + CONFIG.D / 4 * (i + 1);
    const m = box(CONFIG.W, B, B, MAT.beam);
    m.position.set(0, floorY, z);
    g.add(m);
  }

  // === Horní vaznice kabiny (top plates) ===

  // Přední vaznice na divZ — vrch dělicích sloupků (HP = 3.45m)
  const frontCabinBeam = box(CONFIG.W, B, B, MAT.beam);
  frontCabinBeam.position.set(0, HP - B / 2, divZ);
  g.add(frontCabinBeam);

  // Zadní vaznice na +hd — vrch zadních sloupků (H2 = 3.00m)
  const backBeam = box(CONFIG.W, B, B, MAT.beam);
  backBeam.position.set(0, H2 - B / 2, hd);
  g.add(backBeam);

  // Boční vaznice (šikmé) — od divZ/HP k hd/H2, pod střechou
  const cabinDepth = hd - divZ;
  const slopeLen = Math.sqrt(cabinDepth * cabinDepth + CONFIG.ROOF_PEAK * CONFIG.ROOF_PEAK);
  const slopeAngle = Math.atan2(CONFIG.ROOF_PEAK, cabinDepth);

  [-hw, hw].forEach(x => {
    const m = box(B, B, slopeLen, MAT.beam);
    m.rotation.x = slopeAngle;
    m.position.set(x, (HP + H2) / 2 - B / 2, (divZ + hd) / 2);
    g.add(m);
  });

  return g;
}
