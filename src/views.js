// ============================================================
// Tab / View System
// ============================================================
let composer = null;
const playhouse = new THREE.Group();

function switchView(view) {
  // Exit walk mode when switching views
  if (walkModeOn) {
    exitWalkMode();
    document.getElementById('toggle-walk').classList.remove('on');
  }
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

  // Obnovit viditelnost všech objektů před přepnutím (kromě dimensions — ty řídí toggle)
  playhouse.traverse(c => {
    if (c.name !== 'dimensions' && c.parent && c.parent.name !== 'dimensions') {
      c.visible = true;
    }
  });

  // Stíny jen v 3D pohledu — v technických výkresech ruší
  renderer.shadowMap.enabled = is3D;
  dirLight.castShadow = is3D;
  renderer.shadowMap.needsUpdate = true;

  if (view === '3d') {
    activeCamera = perspCamera;
  } else if (view === 'floor1') {
    setupOrthoView(
      new THREE.Vector3(0, 10, 0),
      new THREE.Vector3(0, 0, 0),
      -hw - pad, hw + pad, hd + pad, -hd - pad
    );
    // Zobrazit pouze 1. patro (y = 0 až H1)
    // Kamera je na y=10, near/far ořízne vše mimo rozsah Y 0..H1-0.01
    orthoCamera.near = 10 - CONFIG.H1 + 0.01;
    orthoCamera.far = 10.15;
    orthoCamera.updateProjectionMatrix();
    // Skrýt prvky 2. patra které by mohly prosakovat
    playhouse.traverse(c => {
      if (c.name === 'slide' || c.name === 'railing' || c.name === 'ladder') {
        c.visible = false;
      }
    });
  } else if (view === 'floor2') {
    setupOrthoView(
      new THREE.Vector3(0, 10, 0),
      new THREE.Vector3(0, 0, 0),
      -hw - pad, hw + pad, hd + pad, -hd - pad
    );
    // Zobrazit pouze 2. patro (y = H1 až H) — bez střechy
    orthoCamera.near = 10 - CONFIG.H - 0.05;
    orthoCamera.far = 10 - CONFIG.H1 + 0.01;
    orthoCamera.updateProjectionMatrix();
    // Skrýt střechu, patky a zem — v půdorysu 2. patra nechceme
    playhouse.traverse(c => {
      if (c.name === 'roof' || c.name === 'footings' || c.name === 'ground' || c.name === 'contactShadow') {
        c.visible = false;
      }
    });
  } else if (view === 'front') {
    // Frustum bounds jsou view-space offsety od pozice kamery (ne absolutní world Y)
    const halfH = H / 2 + pad;
    setupOrthoView(
      new THREE.Vector3(0, H / 2, -10),
      new THREE.Vector3(0, H / 2, 0),
      -hw - pad, hw + pad, halfH, -halfH
    );
  } else if (view === 'side') {
    const halfH = H / 2 + pad;
    setupOrthoView(
      new THREE.Vector3(10, H / 2, 0),
      new THREE.Vector3(0, H / 2, 0),
      -hd - pad, hd + pad, halfH, -halfH
    );
  } else if (view === 'section') {
    const halfH = H / 2 + pad;
    setupOrthoView(
      new THREE.Vector3(10, H / 2, 0),
      new THREE.Vector3(0, H / 2, 0),
      -hd - pad, hd + pad, halfH, -halfH
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
