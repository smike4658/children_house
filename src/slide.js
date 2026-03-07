// ============================================================
// Slide — klouzačka (pravá strana terasy, sjíždí dopředu)
// ============================================================
function createSlide() {
  const g = new THREE.Group(); g.name = 'slide';
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;

  const slideLen = CONFIG.SLIDE_LEN;
  const slideAngle = Math.asin(CONFIG.H1 / slideLen);

  // Build slide with pivot at top (origin), extending along -Z
  const slideGroup = new THREE.Group();

  const slideMesh = box(CONFIG.SLIDE_W, 0.04, slideLen, MAT.slide);
  slideMesh.position.set(0, 0, -slideLen / 2);
  slideGroup.add(slideMesh);

  [-1, 1].forEach(side => {
    const rail = box(0.04, 0.12, slideLen, MAT.slide);
    rail.position.set(side * (CONFIG.SLIDE_W / 2 - 0.02), 0.06, -slideLen / 2);
    slideGroup.add(rail);
  });

  // Negative rotation.x tilts -Z end downward (away from house toward lawn)
  slideGroup.rotation.x = -slideAngle;

  // Pivot at top of slide: right corner from camera view (world -X, camera at +6)
  slideGroup.position.set(hw - CONFIG.SLIDE_W / 2, CONFIG.H1, -hd);

  g.add(slideGroup);
  return g;
}
