// ============================================================
// Beams — trámy
// ============================================================
function createBeams() {
  const g = new THREE.Group(); g.name = 'beams';
  const B = CONFIG.BEAM;
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;

  // Horní rámy po obvodu na výšce H2 = CONFIG.H odstraněny

  // Stropní nosníky pod podlahou 2. patra (joists)
  for (let i = 0; i < 4; i++) {
    const z = -hd + CONFIG.D / 5 * (i + 0.5);
    const m = box(CONFIG.W, B, B, MAT.beam);
    m.position.set(0, CONFIG.H1 - B / 2, z);
    g.add(m);
  }

  // Podlahové nosníky 1. patra
  for (let i = 0; i < 3; i++) {
    const z = -hd + CONFIG.D / 4 * (i + 0.5);
    const m = box(CONFIG.W, B, B, MAT.beam);
    m.position.set(0, -B / 2 + 0.01, z);
    g.add(m);
  }

  // Rám přední stěny kabiny odstraněn (křížil by se s dveřmi)

  return g;
}
