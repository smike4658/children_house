// ============================================================
// Slide — klouzačka s plošinou (+X strana = vlevo na obrazovce)
// ============================================================
function createSlide() {
  const g = new THREE.Group(); g.name = 'slide';
  const hw = CONFIG.W / 2;

  const PW = CONFIG.PLATFORM_W;
  const PD = CONFIG.PLATFORM_D;
  const PH = CONFIG.PLATFORM_H;
  const PP = CONFIG.PLATFORM_POST;
  const PZ = CONFIG.PLATFORM_Z;
  const RH = CONFIG.PLATFORM_RAIL_H;
  const RT = 0.04;

  // Key positions
  const platCX = hw + PW / 2;
  const platFrontZ = PZ - PD / 2;
  const platBackZ = PZ + PD / 2;
  const innerX = hw + PP / 2;
  const outerX = hw + PW - PP / 2;
  const totalH = PH + RH;

  // === Platform deck ===
  const deck = box(PW, 0.04, PD, MAT.floor);
  deck.position.set(platCX, PH, PZ);
  deck.receiveShadow = true;
  g.add(deck);

  // === 4 corner posts (full height for railing) ===
  const corners = [
    [outerX, platFrontZ + PP / 2],
    [outerX, platBackZ - PP / 2],
    [innerX, platFrontZ + PP / 2],
    [innerX, platBackZ - PP / 2],
  ];
  corners.forEach(([px, pz]) => {
    const p = box(PP, totalH, PP, MAT.posts);
    p.position.set(px, totalH / 2, pz);
    p.castShadow = true;
    g.add(p);
  });

  // === Railing ===
  const ry1 = PH + RH * 0.45;
  const ry2 = PH + RH;

  // Outer side (+X): full railing between outer posts
  const outerSpan = PD - PP;
  [ry1, ry2].forEach(y => {
    const r = box(RT, RT, outerSpan, MAT.railing);
    r.position.set(outerX, y, PZ);
    g.add(r);
  });

  // Back side (+Z): full railing (stairs approach from behind, not through back)
  const backSpan = PW - PP;
  [ry1, ry2].forEach(y => {
    const r = box(backSpan, RT, RT, MAT.railing);
    r.position.set(platCX, y, platBackZ - PP / 2);
    g.add(r);
  });

  // Front side (-Z): partial railing with slide opening
  const slideHW = CONFIG.SLIDE_W / 2;
  const innerEdge = innerX + PP / 2;
  const outerEdge = outerX - PP / 2;

  // Guard from inner post to slide opening
  const guardInnerLen = (platCX - slideHW) - innerEdge;
  if (guardInnerLen > 0.02) {
    [ry1, ry2].forEach(y => {
      const r = box(guardInnerLen, RT, RT, MAT.railing);
      r.position.set(innerEdge + guardInnerLen / 2, y, platFrontZ + PP / 2);
      g.add(r);
    });
  }

  // Guard from slide opening to outer post
  const guardOuterLen = outerEdge - (platCX + slideHW);
  if (guardOuterLen > 0.02) {
    [ry1, ry2].forEach(y => {
      const r = box(guardOuterLen, RT, RT, MAT.railing);
      r.position.set((platCX + slideHW) + guardOuterLen / 2, y, platFrontZ + PP / 2);
      g.add(r);
    });
  }

  // === Stairs (from back, toward +Z) ===
  const stepDepth = CONFIG.STAIR_DEPTH;
  const stairCount = CONFIG.STAIR_COUNT;
  for (let i = 0; i < stairCount; i++) {
    const stepH = (stairCount - i) * (PH / (stairCount + 1));
    const stepZ = platBackZ + (i + 1) * stepDepth - stepDepth / 2;
    const step = box(PW, stepH, stepDepth, MAT.floor);
    step.position.set(platCX, stepH / 2, stepZ);
    step.castShadow = true;
    step.receiveShadow = true;
    g.add(step);
  }

  // === Slide ===
  const slideH = PH - 0.02;
  const slideAngle = Math.asin(slideH / CONFIG.SLIDE_LEN);

  const slideGroup = new THREE.Group();
  slideGroup.name = 'slideChute';

  // Slide surface
  const slideFloor = box(CONFIG.SLIDE_W, 0.02, CONFIG.SLIDE_LEN, MAT.slide);
  slideFloor.position.set(0, 0, -CONFIG.SLIDE_LEN / 2);
  slideGroup.add(slideFloor);

  // Slide side walls
  [-1, 1].forEach(side => {
    const w = box(0.02, 0.10, CONFIG.SLIDE_LEN, MAT.slide);
    w.position.set(side * CONFIG.SLIDE_W / 2, 0.05, -CONFIG.SLIDE_LEN / 2);
    slideGroup.add(w);
  });

  slideGroup.rotation.x = -slideAngle;
  slideGroup.position.set(platCX, PH, platFrontZ);
  g.add(slideGroup);

  return g;
}
