// ============================================================
// Roof — pultová, pouze nad kabinou
// ============================================================
function createRoof() {
  const g = new THREE.Group(); g.name = 'roof';
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const divZ = CONFIG.divZ;
  const OH = CONFIG.ROOF_OVERHANG;
  const T = 0.06; // tloušťka střešního pláště

  // Pultová střecha: přední hrana na H2 = CONFIG.H, zadní hrana na H2 + ROOF_PEAK
  const H2 = CONFIG.H;
  const HP = H2 + CONFIG.ROOF_PEAK;
  const cabinDepth = CONFIG.D - CONFIG.TD; // 1.72

  // Roof panel as a tilted box — using rotated mesh
  const roofLen = Math.sqrt(cabinDepth * cabinDepth + CONFIG.ROOF_PEAK * CONFIG.ROOF_PEAK) + OH * 2;
  const roofAngle = Math.atan2(CONFIG.ROOF_PEAK, cabinDepth);
  const roofCenterY = (H2 + HP) / 2;
  const roofCenterZ = (divZ + hd) / 2;

  const roofMesh = box(CONFIG.W + OH * 2, T, roofLen, MAT.roof);
  roofMesh.rotation.x = roofAngle;
  roofMesh.position.set(0, roofCenterY + T / 2, roofCenterZ);
  g.add(roofMesh);

  // Barge boards (fascie) — přední a zadní hrana
  const bargeT = 0.04;
  [-1, 1].forEach(side => {
    const m = box(CONFIG.W + OH * 2 + bargeT * 2, bargeT, bargeT, MAT.roofEdge, false, false);
    m.position.set(0,
      side === -1 ? H2 - bargeT / 2 : HP - bargeT / 2,
      side === -1 ? divZ - OH : hd + OH
    );
    g.add(m);
  });

  // Vergeboard — levý a pravý okraj
  [-1, 1].forEach(side => {
    const m = box(bargeT, T * 1.5, roofLen, MAT.roofEdge, false, false);
    m.rotation.x = roofAngle;
    m.position.set(side * (CONFIG.W / 2 + OH + bargeT / 2), roofCenterY, roofCenterZ);
    g.add(m);
  });

  return g;
}
