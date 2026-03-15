// ============================================================
// Posts — nosné sloupky (přízemní verze)
// ============================================================
function createPosts() {
  const g = new THREE.Group(); g.name = 'posts';
  const P = CONFIG.POST;
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const FH = 0.10; // výška betonové patky

  // 4 rohové sloupky — přední vyšší (200 cm), zadní nižší (190 cm)
  const corners = [
    [-hw, -hd, CONFIG.H_FRONT], [hw, -hd, CONFIG.H_FRONT],
    [-hw, hd, CONFIG.H_BACK], [hw, hd, CONFIG.H_BACK],
  ];
  corners.forEach(([x, z, h]) => {
    const ph = h - FH;
    const m = box(P, ph, P, MAT.posts);
    m.position.set(x, FH + ph / 2, z);
    g.add(m);
  });

  return g;
}
