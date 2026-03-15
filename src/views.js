// ============================================================
// Tab / View System (přízemní verze)
// ============================================================
let composer = null;
const playhouse = new THREE.Group();

function switchView(view) {
  if (walkModeOn) {
    exitWalkMode();
    document.getElementById('toggle-walk').classList.remove('on');
  }
  currentView = view;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.view === view);
  });
  const is3D = view === '3d';
  const isMaterials = view === 'materials';
  document.getElementById('view-presets').style.display = is3D ? 'flex' : 'none';
  document.getElementById('toggles').style.display = is3D ? 'flex' : 'none';
  document.getElementById('print-btn').style.display = (is3D || isMaterials) ? 'none' : 'block';
  document.getElementById('controls-hint').style.display = is3D ? 'block' : 'none';
  document.getElementById('dim-canvas').style.display = (is3D || isMaterials) ? 'none' : 'block';
  document.getElementById('canvas-container').style.display = isMaterials ? 'none' : 'block';
  document.getElementById('specs').style.display = isMaterials ? 'none' : 'flex';
  document.getElementById('legend').style.display = isMaterials ? 'none' : 'block';

  const matPage = document.getElementById('materials-page');
  if (isMaterials) {
    matPage.innerHTML = buildMaterialsPage();
    matPage.style.display = 'block';
    return;
  } else {
    matPage.style.display = 'none';
  }

  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const H = CONFIG.H_ROOF_FRONT;
  const pad = 1.5;

  sectionPlane.constant = 1000;

  playhouse.traverse(c => { c.visible = true; });

  // Vedlejší assety — jen v 3D
  playhouse.traverse(c => {
    if (c.name === 'sandbox') c.visible = is3D;
  });
  scene.traverse(c => {
    if (c.name === 'swing' || c.name === 'surroundings') c.visible = is3D;
  });

  renderer.shadowMap.enabled = is3D;
  dirLight.castShadow = is3D;
  renderer.shadowMap.needsUpdate = true;

  if (view === '3d') {
    activeCamera = perspCamera;
  } else if (view === 'floor1') {
    setupOrthoView(
      new THREE.Vector3(CONFIG.HOUSE_X, 10, 0),
      new THREE.Vector3(CONFIG.HOUSE_X, 0, 0),
      -hw - pad, hw + pad, hd + pad, -hd - pad
    );
    orthoCamera.near = 10 - CONFIG.H_FRONT + 0.01;
    orthoCamera.far = 10.15;
    orthoCamera.updateProjectionMatrix();
  } else if (view === 'front') {
    const halfH = H / 2 + pad;
    setupOrthoView(
      new THREE.Vector3(CONFIG.HOUSE_X, H / 2, -10),
      new THREE.Vector3(CONFIG.HOUSE_X, H / 2, 0),
      -hw - pad, hw + pad, halfH, -halfH
    );
  } else if (view === 'side') {
    const halfH = H / 2 + pad;
    setupOrthoView(
      new THREE.Vector3(CONFIG.HOUSE_X + 10, H / 2, 0),
      new THREE.Vector3(CONFIG.HOUSE_X, H / 2, 0),
      -hd - pad, hd + pad, halfH, -halfH
    );
  } else if (view === 'section') {
    const halfH = H / 2 + pad;
    setupOrthoView(
      new THREE.Vector3(CONFIG.HOUSE_X + 10, H / 2, 0),
      new THREE.Vector3(CONFIG.HOUSE_X, H / 2, 0),
      -hd - pad, hd + pad, halfH, -halfH
    );
    sectionPlane.constant = CONFIG.HOUSE_X;
  }

  if (!is3D) setTimeout(() => drawDimensions(view), 50);
}

let sectionPlane;

function setupOrthoView(pos, target, left, right, top, bottom) {
  const aspect = window.innerWidth / window.innerHeight;
  const orthoH = top - bottom;
  const orthoW = orthoH * aspect;
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  orthoCamera = new THREE.OrthographicCamera(cx - orthoW / 2, cx + orthoW / 2, cy + orthoH / 2, cy - orthoH / 2, 0.01, 100);
  orthoCamera.position.copy(pos);
  orthoCamera.lookAt(target);
  activeCamera = orthoCamera;
}

// ============================================================
// View Presets (3D)
// ============================================================
const VIEW_PRESETS = {
  iso: { pos: [CONFIG.HOUSE_X + 5, 3, -5], target: [CONFIG.HOUSE_X, 1, 0] },
  front: { pos: [CONFIG.HOUSE_X, 1.5, -8], target: [CONFIG.HOUSE_X, 1, 0] },
  back: { pos: [CONFIG.HOUSE_X, 1.5, 8], target: [CONFIG.HOUSE_X, 1, 0] },
  left: { pos: [CONFIG.HOUSE_X - 8, 1.5, 0], target: [CONFIG.HOUSE_X, 1, 0] },
  right: { pos: [CONFIG.HOUSE_X + 8, 1.5, 0], target: [CONFIG.HOUSE_X, 1, 0] },
  top: { pos: [CONFIG.HOUSE_X, 10, 0], target: [CONFIG.HOUSE_X, 0, 0] },
};

function setPreset(name) {
  const p = VIEW_PRESETS[name];
  if (!p) return;
  perspCamera.position.set(...p.pos);
  orbitTarget.set(...p.target);
}
