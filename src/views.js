// ============================================================
// Tab / View System
// ============================================================
let composer = null;
const playhouse = new THREE.Group();

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.view === view);
  });
  const is3D = view === '3d';
  document.getElementById('view-presets').style.display = is3D ? 'flex' : 'none';
  document.getElementById('toggles').style.display = is3D ? 'flex' : 'none';
  document.getElementById('print-btn').style.display = is3D ? 'none' : 'block';
  document.getElementById('controls-hint').style.display = is3D ? 'block' : 'none';
  document.getElementById('dim-canvas').style.display = is3D ? 'none' : 'block';

  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const H = CONFIG.H + CONFIG.ROOF_PEAK;
  const pad = 1.5;

  sectionPlane.constant = 1000; // default: no clipping

  if (view === '3d') {
    activeCamera = perspCamera;
    // Show all
    playhouse.traverse(c => { if (c.isMesh) c.visible = true; });
  } else if (view === 'floor1') {
    setupOrthoView(
      new THREE.Vector3(0, 10, 0),
      new THREE.Vector3(0, 0, 0),
      -hw - pad, hw + pad, hd + pad, -hd - pad
    );
    // Zobrazit pouze 1. patro (y = 0 až H1)
    // Kamera je na y=10, takže near=10-H1, far=10+0.1
    orthoCamera.near = 10 - CONFIG.H1 - 0.05;
    orthoCamera.far = 10.15;
    orthoCamera.updateProjectionMatrix();
  } else if (view === 'floor2') {
    setupOrthoView(
      new THREE.Vector3(0, 10, 0),
      new THREE.Vector3(0, 0, 0),
      -hw - pad, hw + pad, hd + pad, -hd - pad
    );
    // Zobrazit pouze 2. patro (y = H1 až H+ROOF_PEAK)
    orthoCamera.near = 10 - CONFIG.H - CONFIG.ROOF_PEAK - 0.3;
    orthoCamera.far = 10 - CONFIG.H1 + 0.15;
    orthoCamera.updateProjectionMatrix();
  } else if (view === 'front') {
    setupOrthoView(
      new THREE.Vector3(0, H / 2, -10),
      new THREE.Vector3(0, H / 2, 0),
      -hw - pad, hw + pad, H + pad, -pad
    );
  } else if (view === 'side') {
    setupOrthoView(
      new THREE.Vector3(10, H / 2, 0),
      new THREE.Vector3(0, H / 2, 0),
      -hd - pad, hd + pad, H + pad, -pad
    );
  } else if (view === 'section') {
    setupOrthoView(
      new THREE.Vector3(10, H / 2, 0),
      new THREE.Vector3(0, H / 2, 0),
      -hd - pad, hd + pad, H + pad, -pad
    );
    sectionPlane.constant = 0; // Clip at X=0
  }

  // Kreslit kóty a popisky po dokončení přechodu kamery
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
  iso: { pos: [6, 4, -6], target: [0, 1.5, 0] },
  front: { pos: [0, 2, -8], target: [0, 1.5, 0] },
  back: { pos: [0, 2, 8], target: [0, 1.5, 0] },
  left: { pos: [-8, 2, 0], target: [0, 1.5, 0] },
  right: { pos: [8, 2, 0], target: [0, 1.5, 0] },
  top: { pos: [0, 10, 0], target: [0, 0, 0] },
};

function setPreset(name) {
  const p = VIEW_PRESETS[name];
  if (!p) return;
  perspCamera.position.set(...p.pos);
  orbitTarget.set(...p.target);
}
