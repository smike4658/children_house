// ============================================================
// Roof — pultová, přes celý půdorys (přízemní verze)
// ============================================================
function createRoof() {
  const g = new THREE.Group(); g.name = 'roof';
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const OH = CONFIG.ROOF_OVERHANG;
  const T = 0.06;

  // Pultová střecha: přední hrana vyšší (H_ROOF_FRONT=2.20), zadní nižší (H_BACK=1.90)
  const HF = CONFIG.H_ROOF_FRONT;
  const HB = CONFIG.H_ROOF_BACK;
  const drop = HF - HB;

  const roofLen = Math.sqrt(CONFIG.D * CONFIG.D + drop * drop) + OH * 2;
  const roofAngle = Math.atan2(drop, CONFIG.D);
  const roofCenterY = (HF + HB) / 2;

  const roofMesh = box(CONFIG.W + OH * 2, T, roofLen, MAT.roof);
  roofMesh.rotation.x = roofAngle;
  roofMesh.position.set(0, roofCenterY + T / 2, 0);
  g.add(roofMesh);

  // Fascie — přední a zadní hrana
  const bargeT = 0.04;

  // Přední fascie (vyšší, -Z)
  const frontFascia = box(CONFIG.W + OH * 2 + bargeT * 2, bargeT, bargeT, MAT.roofEdge, false, false);
  frontFascia.position.set(0, HF - bargeT / 2, -hd - OH);
  g.add(frontFascia);

  // Zadní fascie (nižší, +Z)
  const backFascia = box(CONFIG.W + OH * 2 + bargeT * 2, bargeT, bargeT, MAT.roofEdge, false, false);
  backFascia.position.set(0, HB - bargeT / 2, hd + OH);
  g.add(backFascia);

  // Vergeboard — levý a pravý okraj
  [-1, 1].forEach(side => {
    const m = box(bargeT, T * 1.5, roofLen, MAT.roofEdge, false, false);
    m.rotation.x = roofAngle;
    m.position.set(side * (CONFIG.W / 2 + OH + bargeT / 2), roofCenterY, 0);
    g.add(m);
  });

  return g;
}
