// ============================================================
// Build scene
// ============================================================
function buildScene() {
  setupEnvironment();
  setupMaterials();

  // Section clipping plane (applied per-material on playhouse, not globally)
  sectionPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1000);
  renderer.localClippingEnabled = true;

  scene.add(createGround());
  scene.add(createContactShadow());

  playhouse.add(createFootings());
  playhouse.add(createBeams());
  playhouse.add(createPosts());
  playhouse.add(createFloors());
  playhouse.add(createWalls());
  playhouse.add(createRoof());
  playhouse.add(createRailing());
  playhouse.add(createSlide());
  playhouse.add(createStairs());
  playhouse.add(createSandbox());
  scene.add(createSurroundings());
  scene.add(createSwing());
  playhouse.add(createDimensions());

  // Enable shadows and apply clipping plane to playhouse meshes
  playhouse.traverse(c => {
    if (c.isMesh) {
      // Skip glass and frames — they have intentional shadow settings
      if (c.material !== MAT.glass && c.material !== MAT.frame) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
      // Apply section clipping to playhouse materials only (not ground/contact shadow)
      if (c.material) c.material.clippingPlanes = [sectionPlane];
    }
  });

  playhouse.position.x = CONFIG.HOUSE_X;
  scene.add(playhouse);

  composer = setupPostProcessing();
}

// ============================================================
// Resize
// ============================================================
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    perspCamera.aspect = w / h;
    perspCamera.updateProjectionMatrix();
    if (currentView !== '3d') {
      switchView(currentView);
    }
    if (composer) composer.setSize(w, h);
  }, 150);
});

// ============================================================
// Axis Indicator — XYZ osa v pravém dolním rohu (3D mód)
// ============================================================
const axisScene = new THREE.Scene();
axisScene.add(new THREE.AxesHelper(0.8));
const axisCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);

// ============================================================
// Animation loop
// ============================================================
function animate() {
  requestAnimationFrame(animate);
  // Walk mode movement update
  if (walkModeOn) updateWalkMovement();
  if (currentView === '3d' && composer && !composerFailed) {
    composer.passes[0].camera = activeCamera;
    try { composer.render(); } catch (e) { composerFailed = true; renderer.render(scene, activeCamera); }
  } else {
    renderer.render(scene, activeCamera);
  }

  // Axis indicator — renderujeme jen v 3D módu
  if (currentView === '3d') {
    const s = 90;
    const x = window.innerWidth - s - 12;
    const y = 12;
    renderer.setViewport(x, y, s, s);
    renderer.setScissor(x, y, s, s);
    renderer.setScissorTest(true);
    axisCamera.position.copy(perspCamera.position).sub(orbitTarget).normalize().multiplyScalar(3);
    axisCamera.lookAt(0, 0, 0);
    axisCamera.up.copy(perspCamera.up);
    renderer.render(axisScene, axisCamera);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  }
}

buildScene();
animate();
