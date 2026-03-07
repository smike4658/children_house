// ============================================================
// Environment — HDRI + fallback
// ============================================================
function setupEnvironment() {
  try {
    if (typeof THREE.RGBELoader !== 'undefined') {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      new THREE.RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .load(
          'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloppenheim_06_puresky_1k.hdr',
          (texture) => {
            const envMap = pmrem.fromEquirectangular(texture).texture;
            scene.environment = envMap;
            scene.background = envMap;
            texture.dispose();
            pmrem.dispose();
          },
          undefined,
          () => setupFallbackSky()
        );
    } else {
      setupFallbackSky();
    }
  } catch (e) {
    setupFallbackSky();
  }
}

function setupFallbackSky() {
  const canvas = document.createElement('canvas');
  canvas.width = 1; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#4a90d9');
  grad.addColorStop(0.4, '#87CEEB');
  grad.addColorStop(0.75, '#b8daf0');
  grad.addColorStop(1.0, '#e8dcc8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  scene.environment = tex; // PBR ambient z gradientu oblohy
}
