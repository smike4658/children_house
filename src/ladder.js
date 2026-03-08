// ============================================================
// Ladder — žebřík (pravá strana +X, zvenku, nakloněn 75° od vodorovné)
// ============================================================
function createLadder() {
  const g = new THREE.Group(); g.name = 'ladder';
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;

  const LW = CONFIG.LADDER_W;
  const LH = CONFIG.LADDER_H;

  // Žebřík opřen o PRAVOU stěnu (+X) zvenku:
  //   - vršek: x = +hw (u stěny), y = H1 (podlaha 2. patra)
  //   - spodek: 1m od stěny na zemi
  const projX = 1.0; // spodek žebříku 1m od stěny
  const tilt = Math.asin(projX / LH); // úhel od svislice

  // Spodek žebříku na zemi, vně pravé stěny (+X)
  const bottomX = hw + projX;
  const bottomY = 0;
  // Pozice podél Z: přibližně uprostřed terasy
  const ladderZ = -hd + CONFIG.TD * 0.5;

  // Skupinka postavena svisle (podél +Y), pak rotována
  const ladderGroup = new THREE.Group();

  // Dvě boční lišty (bílé)
  [-1, 1].forEach(side => {
    const rail = box(0.05, LH, 0.05, MAT.walls);
    rail.position.set(0, LH / 2, side * LW / 2);
    ladderGroup.add(rail);
  });

  // Příčle (dřevěné)
  for (let i = 0; i < CONFIG.LADDER_RUNGS; i++) {
    const t = (i + 0.5) / CONFIG.LADDER_RUNGS;
    const rung = box(0.04, 0.04, LW, MAT.posts);
    rung.position.set(0, LH * t, 0);
    ladderGroup.add(rung);
  }

  // Rotace: +tilt kolem Z nakloní +Y vršek ke -X (žebřík se opírá o pravou stěnu +X zvenku)
  ladderGroup.rotation.z = tilt;
  // Posun: spodek na správné místo vně pravé stěny (+X)
  ladderGroup.position.set(bottomX, bottomY, ladderZ);

  g.add(ladderGroup);
  return g;
}
