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
    const m = box(RT, height, RT, MAT.posts);
    m.position.set(x, baseY + height / 2, z);
    g.add(m);
  }
  const slatH = 0.12;
  const slatT = 0.02;
  const numSlats = 4;

  function addSlat(x1, z1, x2, z2, y, offsetX, offsetZ) {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    const m = box(len, slatH, slatT, MAT.railing, false, false);
    m.rotation.y = angle;
    m.position.set((x1 + x2) / 2 + offsetX, y, (z1 + z2) / 2 + offsetZ);
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

  // Levé zábradlí (-X strana terasy)
  const xLeft = -hw;
  const numLeft = 3;
  for (let i = 0; i <= numLeft; i++) {
    const z = zFront + CONFIG.TD / numLeft * i;
    addPost(xLeft, z, RH);
  }

  // Pravé zábradlí (+X strana terasy) - místo původního žebříku
  const xRight = hw;
  const numRight = 3;
  for (let i = 0; i <= numRight; i++) {
    const z = zFront + CONFIG.TD / numRight * i;
    addPost(xRight, z, RH);
  }

  // Vodorovné latě (4 nad sebou)
  const gapY = (RH - numSlats * slatH) / 4; // 4 mezery pro 4 latě, horní lícuje s výškou sloupků
  const gapStartX = -hw + CONFIG.W / numFront; // Druhý sloupek (x: -0.93)

  for (let i = 0; i < numSlats; i++) {
    const y = baseY + gapY + slatH / 2 + i * (slatH + gapY);

    // Přední latě (připevněné zepředu)
    // Všechny latě jdou pouze mezi sloupky x=-0.93 a x=0.93
    // Vznikne tak volný průchod pro klouzačku (vlevo -1.55 až -0.93) a schody (vpravo 0.93 až 1.55)
    // gapStartX je -0.93. Pravý konec bude -gapStartX (tedy +0.93).
    const gapEndX = -gapStartX;
    addSlat(gapStartX - RT / 2, zFront, gapEndX + RT / 2 + slatT, zFront, y, 0, -(RT / 2 + slatT / 2));

    // Levé latě (připevněné zleva)
    addSlat(xLeft, zFront - RT / 2, xLeft, divZ, y, -(RT / 2 + slatT / 2), 0);

    // Pravé latě (připevněné zprava)
    addSlat(xRight, zFront - RT / 2, xRight, divZ, y, (RT / 2 + slatT / 2), 0);
  }

  return g;
}
