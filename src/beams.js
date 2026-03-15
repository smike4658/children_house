// ============================================================
// Beams — trámy (přízemní verze)
// ============================================================
function createBeams() {
  const g = new THREE.Group(); g.name = 'beams';
  const B = CONFIG.BEAM;
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;

  // === Podlahové trámy — obvodový rám + středový trám ===
  const floorY = -B / 2 + 0.01;

  // Obvodové trámy (rám dokola)
  [-hd, hd].forEach(z => {
    const m = box(CONFIG.W, B, B, MAT.beam);
    m.position.set(0, floorY, z);
    g.add(m);
  });
  [-hw, hw].forEach(x => {
    const m = box(B, B, CONFIG.D, MAT.beam);
    m.position.set(x, floorY, 0);
    g.add(m);
  });

  // Středový trám — podél Z, uprostřed šířky
  const centerBeam = box(B, B, CONFIG.D, MAT.beam);
  centerBeam.position.set(0, floorY, 0);
  g.add(centerBeam);

  // Příčné nosníky (3 ks rovnoměrně uvnitř)
  for (let i = 0; i < 3; i++) {
    const z = -hd + CONFIG.D / 4 * (i + 1);
    const m = box(CONFIG.W, B, B, MAT.beam);
    m.position.set(0, floorY, z);
    g.add(m);
  }

  // === Horní vaznice (top plates) — šikmé, sledují sklon střechy ===

  // Přední vaznice na -hd — vrch předních sloupků (H_FRONT)
  const frontBeam = box(CONFIG.W, B, B, MAT.beam);
  frontBeam.position.set(0, CONFIG.H_FRONT - B / 2, -hd);
  g.add(frontBeam);

  // Zadní vaznice na +hd — vrch zadních sloupků (H_BACK)
  const backBeam = box(CONFIG.W, B, B, MAT.beam);
  backBeam.position.set(0, CONFIG.H_BACK - B / 2, hd);
  g.add(backBeam);

  // Boční vaznice (šikmé) — od přední (H_FRONT) k zadní (H_BACK)
  const slopeLen = Math.sqrt(CONFIG.D * CONFIG.D + CONFIG.ROOF_DROP * CONFIG.ROOF_DROP);
  const slopeAngle = Math.atan2(CONFIG.ROOF_DROP, CONFIG.D);

  [-hw, hw].forEach(x => {
    const m = box(B, B, slopeLen, MAT.beam);
    m.rotation.x = slopeAngle;
    m.position.set(x, (CONFIG.H_FRONT + CONFIG.H_BACK) / 2 - B / 2, 0);
    g.add(m);
  });

  return g;
}
