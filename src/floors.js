// ============================================================
// Floors — podlaha (přízemní verze — jen jedna)
// ============================================================
function createFloors() {
  const g = new THREE.Group(); g.name = 'floors';
  const FH = 0.05;

  const f = box(CONFIG.W, FH, CONFIG.D, MAT.floor);
  f.position.set(0, FH / 2, 0);
  g.add(f);

  return g;
}
