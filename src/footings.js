// ============================================================
// Footings — betonové patky
// ============================================================
function createFootings() {
  const g = new THREE.Group(); g.name = 'footings';
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const positions = [
    [-hw, 0, -hd], [hw, 0, -hd],
    [-hw, 0, hd], [hw, 0, hd],
  ];
  const FW = 0.22, FD = 0.22, FH = 0.10;
  positions.forEach(([x, , z]) => {
    const m = box(FW, FH, FD, MAT.concrete);
    m.position.set(x, FH / 2, z);
    g.add(m);
  });
  return g;
}
