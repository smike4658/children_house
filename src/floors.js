// ============================================================
// Floors — podlahy
// ============================================================
function createFloors() {
  const g = new THREE.Group(); g.name = 'floors';
  const FH1 = 0.05, FH2 = 0.06;

  // Podlaha 1. patra
  const f1 = box(CONFIG.W, FH1, CONFIG.D, MAT.floor);
  f1.position.set(0, FH1 / 2, 0);
  g.add(f1);

  // Podlaha 2. patra (celý půdorys)
  const f2 = box(CONFIG.W, FH2, CONFIG.D, MAT.floor);
  f2.position.set(0, CONFIG.H1 + FH2 / 2, 0);
  g.add(f2);

  return g;
}
