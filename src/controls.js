// ============================================================
// OrbitControls — custom implementation
// ============================================================
const orbitTarget = new THREE.Vector3(0, 1.5, 0);
let isDragging = false, isRightDrag = false;
let lastMouse = { x: 0, y: 0 };
let spherical = new THREE.Spherical();
// Pre-allocated vectors to avoid GC pressure in event handlers
const _orbitPos = new THREE.Vector3();
const _orbitRight = new THREE.Vector3();
const _orbitDir = new THREE.Vector3();

function updateOrbit() {
  const offset = perspCamera.position.clone().sub(orbitTarget);
  spherical.setFromVector3(offset);
}
updateOrbit();

renderer.domElement.addEventListener('mousedown', e => {
  isDragging = true;
  isRightDrag = e.button === 2;
  lastMouse = { x: e.clientX, y: e.clientY };
});
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('mouseup', () => isDragging = false);
window.addEventListener('mousemove', e => {
  if (!isDragging || currentView !== '3d' || walkModeOn) return;
  const dx = e.clientX - lastMouse.x;
  const dy = e.clientY - lastMouse.y;
  lastMouse = { x: e.clientX, y: e.clientY };
  if (isRightDrag) {
    // Pan
    _orbitRight.crossVectors(
      perspCamera.getWorldDirection(_orbitDir),
      perspCamera.up
    ).normalize();
    const dist = perspCamera.position.distanceTo(orbitTarget);
    orbitTarget.addScaledVector(_orbitRight, -dx * 0.003 * dist * 0.5);
    orbitTarget.addScaledVector(perspCamera.up, dy * 0.003 * dist * 0.5);
  } else {
    spherical.theta -= dx * 0.008;
    spherical.phi -= dy * 0.008;
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
  }
  _orbitPos.setFromSpherical(spherical).add(orbitTarget);
  perspCamera.position.copy(_orbitPos);
  perspCamera.lookAt(orbitTarget);
});
renderer.domElement.addEventListener('wheel', e => {
  if (currentView !== '3d' || walkModeOn) return;
  spherical.radius *= (1 + e.deltaY * 0.001);
  spherical.radius = Math.max(1, Math.min(20, spherical.radius));
  _orbitPos.setFromSpherical(spherical).add(orbitTarget);
  perspCamera.position.copy(_orbitPos);
  perspCamera.lookAt(orbitTarget);
});

// Touch support
let touches = [];
renderer.domElement.addEventListener('touchstart', e => { touches = Array.from(e.touches); });
renderer.domElement.addEventListener('touchmove', e => {
  if (currentView !== '3d') return;
  e.preventDefault();
  const t = Array.from(e.touches);
  if (t.length === 1 && touches.length === 1) {
    const dx = t[0].clientX - touches[0].clientX;
    const dy = t[0].clientY - touches[0].clientY;
    spherical.theta -= dx * 0.008;
    spherical.phi -= dy * 0.008;
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
    _orbitPos.setFromSpherical(spherical).add(orbitTarget);
    perspCamera.position.copy(_orbitPos);
    perspCamera.lookAt(orbitTarget);
  } else if (t.length === 2 && touches.length === 2) {
    const prevDist = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    const currDist = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    spherical.radius *= prevDist / currDist;
    spherical.radius = Math.max(1, Math.min(20, spherical.radius));
    _orbitPos.setFromSpherical(spherical).add(orbitTarget);
    perspCamera.position.copy(_orbitPos);
    perspCamera.lookAt(orbitTarget);
  }
  touches = t;
}, { passive: false });
