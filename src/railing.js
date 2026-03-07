// ============================================================
// Railing — zábradlí terasy
// ============================================================
function createRailing() {
  const g = new THREE.Group(); g.name = 'railing';
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const divZ = CONFIG.divZ;
  const RH = CONFIG.RAIL_H;
  const RT = CONFIG.RAIL_T;
  const baseY = CONFIG.H1 + 0.06; // on top of 2nd floor

  function addPost(x, z, height) {
    const m = box(RT, height, RT, MAT.railing);
    m.position.set(x, baseY + height / 2, z);
    g.add(m);
  }
  function addRail(x1, z1, x2, z2, y) {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    const m = box(len, RT, RT, MAT.railing, false, false);
    m.rotation.y = angle;
    m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    g.add(m);
  }

  // Přední zábradlí (-Z strana terasy)
  const zFront = -hd;
  // Posts
  const numFront = 5;
  for (let i = 0; i <= numFront; i++) {
    const x = -hw + CONFIG.W / numFront * i;
    addPost(x, zFront, RH);
  }
  // Top rail
  addRail(-hw, zFront, hw, zFront, baseY + RH - RT / 2);
  // Mid rail
  addRail(-hw, zFront, hw, zFront, baseY + RH / 2);

  // Levé zábradlí (-X strana terasy)
  const xLeft = -hw;
  const numLeft = 3;
  for (let i = 0; i <= numLeft; i++) {
    const z = zFront + CONFIG.TD / numLeft * i;
    addPost(xLeft, z, RH);
  }
  addRail(xLeft, zFront, xLeft, divZ, baseY + RH - RT / 2);
  addRail(xLeft, zFront, xLeft, divZ, baseY + RH / 2);

  return g;
}
