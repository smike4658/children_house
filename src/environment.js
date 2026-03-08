// ============================================================
// Environment — HDRI + fallback
// ============================================================
function setupEnvironment() {
  // Always use the fallback sky for better color control and no popping
  setupFallbackSky();
}

function setupFallbackSky() {
  const canvas = document.createElement('canvas');
  canvas.width = 1; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#1E4A82');
  grad.addColorStop(0.4, '#3A77B8');
  grad.addColorStop(0.75, '#6AABC7');
  grad.addColorStop(1.0, '#B3C3B9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  scene.environment = tex; // PBR ambient z gradientu oblohy
}
