// ============================================================
// Helper: box mesh
// ============================================================
function box(w, h, d, mat, castShadow = true, receiveShadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = castShadow;
  m.receiveShadow = receiveShadow;
  return m;
}

// Shorthand: vytvoř box, nastav pozici, přidej do skupiny
function ab(group, w, h, d, mat, x, y, z) {
  const m = box(w, h, d, mat);
  m.position.set(x, y, z);
  group.add(m);
  return m;
}
