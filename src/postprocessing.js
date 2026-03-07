// ============================================================
// Post-processing (SSAO)
// ============================================================
let composerFailed = false;
function setupPostProcessing() {
  try {
    if (typeof THREE.EffectComposer === 'undefined') return null;
    const c = new THREE.EffectComposer(renderer);
    const rp = new THREE.RenderPass(scene, perspCamera);
    c.addPass(rp);
    if (typeof THREE.SSAOPass !== 'undefined') {
      const ssao = new THREE.SSAOPass(scene, perspCamera, window.innerWidth, window.innerHeight);
      ssao.kernelRadius = 0.3;
      ssao.minDistance = 0.001;
      ssao.maxDistance = 0.15;
      c.addPass(ssao);
    }
    if (typeof THREE.GammaCorrectionShader !== 'undefined' && typeof THREE.ShaderPass !== 'undefined') {
      const gamma = new THREE.ShaderPass(THREE.GammaCorrectionShader);
      c.addPass(gamma);
    }
    return c;
  } catch (e) {
    return null;
  }
}
