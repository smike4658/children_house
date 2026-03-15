// ============================================================
// Walk Mode — procházka s postavičkou (přízemní verze)
// ============================================================
let walkModeOn = false;
let walkChar = null;
let walkYaw = 0;
let walkPitch = 0;
let walkPos = new THREE.Vector3(CONFIG.HOUSE_X + 2.5, 0, -3);
const walkSpeed = 0.04;
const walkKeys = { w: false, a: false, s: false, d: false };
let walkPointerLocked = false;
let walkCamDist = 2.5;
const WALK_CAM_DIST_MAX = 4.0;
const WALK_FP_THRESHOLD = 0.15;

// Character dimensions (child ~120cm tall)
const CHAR_HEIGHT = 1.20;
const CHAR_HEAD_R = 0.12;
const CHAR_BODY_R = 0.08;
const CHAR_BODY_H = 0.50;
const CHAR_LEG_R = 0.05;
const CHAR_LEG_H = 0.45;
const CHAR_ARM_R = 0.04;
const CHAR_ARM_H = 0.35;

function createCharacter() {
  const group = new THREE.Group();
  group.name = 'walkCharacter';

  const skinMat = new THREE.MeshStandardMaterial({ color: '#f5c6a0', roughness: 0.8 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: '#e74c3c', roughness: 0.7 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: '#2c3e50', roughness: 0.7 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: '#5d4037', roughness: 0.9 });
  const hairMat = new THREE.MeshStandardMaterial({ color: '#8d6e63', roughness: 0.9 });

  const head = new THREE.Mesh(new THREE.SphereGeometry(CHAR_HEAD_R, 12, 8), skinMat);
  head.position.y = CHAR_LEG_H + CHAR_BODY_H + CHAR_HEAD_R + 0.02;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(CHAR_HEAD_R * 1.05, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
  hair.position.copy(head.position);
  hair.position.y += 0.01;
  hair.castShadow = true;
  group.add(hair);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(CHAR_BODY_R, CHAR_BODY_R * 1.1, CHAR_BODY_H, 8), shirtMat);
  body.position.y = CHAR_LEG_H + CHAR_BODY_H / 2;
  body.castShadow = true;
  group.add(body);

  for (let side = -1; side <= 1; side += 2) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(CHAR_LEG_R, CHAR_LEG_R, CHAR_LEG_H, 6), pantsMat);
    leg.position.set(side * 0.06, CHAR_LEG_H / 2, 0);
    leg.castShadow = true;
    leg.name = side < 0 ? 'legL' : 'legR';
    group.add(leg);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.14), shoeMat);
    shoe.position.set(side * 0.06, 0.02, 0.02);
    shoe.castShadow = true;
    group.add(shoe);
  }

  for (let side = -1; side <= 1; side += 2) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(CHAR_ARM_R, CHAR_ARM_R, CHAR_ARM_H, 6), skinMat);
    arm.position.set(side * (CHAR_BODY_R + CHAR_ARM_R + 0.02), CHAR_LEG_H + CHAR_BODY_H * 0.55, 0);
    arm.castShadow = true;
    arm.name = side < 0 ? 'armL' : 'armR';
    group.add(arm);
  }

  return group;
}

let walkTime = 0;
function animateCharacter(isMoving) {
  if (!walkChar) return;
  const legL = walkChar.getObjectByName('legL');
  const legR = walkChar.getObjectByName('legR');
  const armL = walkChar.getObjectByName('armL');
  const armR = walkChar.getObjectByName('armR');

  if (isMoving) walkTime += 0.12;
  else walkTime *= 0.9;
  const swing = Math.sin(walkTime) * 0.4;
  if (legL && legR) { legL.rotation.x = swing; legR.rotation.x = -swing; }
  if (armL && armR) { armL.rotation.x = -swing * 0.75; armR.rotation.x = swing * 0.75; }
}

// ---- Collision system ----
const CHAR_RADIUS = 0.15;

function canMoveTo(nx, nz) {
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const ox = CONFIG.HOUSE_X;
  const T = CONFIG.WALL_T;
  const P = CONFIG.POST;
  const r = CHAR_RADIUS;

  function hits(bx1, bz1, bx2, bz2) {
    var cx = Math.max(bx1, Math.min(nx, bx2));
    var cz = Math.max(bz1, Math.min(nz, bz2));
    var dx = nx - cx, dz = nz - cz;
    return dx * dx + dz * dz < r * r;
  }

  // Corner posts
  var pp = P / 2;
  if (hits(ox - hw - pp, -hd - pp, ox - hw + pp, -hd + pp)) return false;
  if (hits(ox + hw - pp, -hd - pp, ox + hw + pp, -hd + pp)) return false;
  if (hits(ox - hw - pp, hd - pp, ox - hw + pp, hd + pp)) return false;
  if (hits(ox + hw - pp, hd - pp, ox + hw + pp, hd + pp)) return false;

  // Walls
  // Back wall (+Z)
  if (hits(ox - hw, hd, ox + hw, hd + T)) return false;
  // Left wall (-X)
  if (hits(ox - hw - T, -hd, ox - hw, hd)) return false;
  // Right wall (+X)
  if (hits(ox + hw, -hd, ox + hw + T, hd)) return false;
  // Front wall (-Z) with door opening
  var doorX = ox + CONFIG.DOOR_OFFSET_X;
  var doorL = doorX - CONFIG.DOOR_W / 2;
  var doorR = doorX + CONFIG.DOOR_W / 2;
  if (hits(ox - hw, -hd - T, doorL, -hd)) return false;
  if (hits(doorR, -hd - T, ox + hw, -hd)) return false;

  // Swing frame posts
  var swSandboxR = ox + hw + 1.40;
  var swLeftX = swSandboxR + 0.70;
  var swWidth = 3.00;
  var swJ = 0.08;
  var swCX = swLeftX + swWidth / 2;
  if (hits(swCX - swWidth / 2 - swJ / 2, -swJ / 2, swCX - swWidth / 2 + swJ / 2, swJ / 2)) return false;
  if (hits(swCX + swWidth / 2 - swJ / 2, -swJ / 2, swCX + swWidth / 2 + swJ / 2, swJ / 2)) return false;

  // Sandbox frame
  var sbL = ox + hw;
  var sbR = ox + hw + 1.40;
  var sbB = hd;
  var sbF = hd - 1.40;
  var sbT = 0.04;
  if (hits(sbL, sbB - sbT, sbR, sbB)) return false;
  if (hits(sbL, sbF, sbR, sbF + sbT)) return false;
  if (hits(sbL, sbF, sbL + sbT, sbB)) return false;
  if (hits(sbR - sbT, sbF, sbR, sbB)) return false;

  return true;
}

function enterWalkMode() {
  walkModeOn = true;
  walkCamDist = 2.5;

  if (!walkChar) walkChar = createCharacter();
  scene.add(walkChar);

  walkChar.position.copy(walkPos);
  walkChar.position.y = 0;
  walkChar.rotation.x = 0;
  walkChar.rotation.z = 0;

  walkYaw = 0;
  walkPitch = 0.3;

  updateWalkCamera();
  document.getElementById('walk-hint').style.display = 'block';
  document.getElementById('controls-hint').style.display = 'none';
  document.getElementById('view-presets').style.display = 'none';
}

function exitWalkMode() {
  walkModeOn = false;
  if (walkChar) {
    walkPos.copy(walkChar.position);
    scene.remove(walkChar);
  }
  walkPointerLocked = false;
  document.exitPointerLock && document.exitPointerLock();
  document.getElementById('walk-hint').style.display = 'none';

  activeCamera = perspCamera;
  perspCamera.position.set(walkPos.x + 4, walkPos.y + 3, walkPos.z - 4);
  orbitTarget.set(walkPos.x, 1, walkPos.z);
  perspCamera.lookAt(orbitTarget);
  updateOrbit();

  if (currentView === '3d') {
    document.getElementById('controls-hint').style.display = 'block';
    document.getElementById('view-presets').style.display = 'flex';
    document.getElementById('toggles').style.display = 'flex';
  }
}

function updateWalkCamera() {
  if (!walkChar || !walkModeOn) return;

  walkChar.rotation.y = walkYaw;
  walkChar.rotation.x = 0;
  walkChar.rotation.z = 0;

  const firstPerson = walkCamDist < WALK_FP_THRESHOLD;
  walkChar.visible = !firstPerson;

  if (firstPerson) {
    const eyeY = walkChar.position.y + CHAR_HEIGHT * 0.9;
    perspCamera.position.set(walkChar.position.x, eyeY, walkChar.position.z);
    const lookDist = 5;
    perspCamera.lookAt(
      walkChar.position.x + Math.sin(walkYaw) * lookDist * Math.cos(walkPitch),
      eyeY + Math.sin(walkPitch) * lookDist,
      walkChar.position.z + Math.cos(walkYaw) * lookDist * Math.cos(walkPitch)
    );
  } else {
    const camHeight = 1.4;
    const cx = walkChar.position.x - Math.sin(walkYaw) * walkCamDist * Math.cos(walkPitch);
    const cy = walkChar.position.y + camHeight + Math.sin(walkPitch) * walkCamDist * 0.5;
    const cz = walkChar.position.z - Math.cos(walkYaw) * walkCamDist * Math.cos(walkPitch);
    perspCamera.position.set(cx, cy, cz);
    const lookY = walkChar.position.y + CHAR_HEIGHT * 0.85;
    perspCamera.lookAt(walkChar.position.x, lookY, walkChar.position.z);
  }

  activeCamera = perspCamera;
}

function updateWalkMovement() {
  if (!walkModeOn || !walkChar) return;

  let moveX = 0, moveZ = 0;
  if (walkKeys.w) moveZ += 1;
  if (walkKeys.s) moveZ -= 1;
  if (walkKeys.a) moveX += 1;
  if (walkKeys.d) moveX -= 1;

  const isMoving = moveX !== 0 || moveZ !== 0;

  if (isMoving) {
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    moveX /= len; moveZ /= len;

    const px = walkChar.position.x;
    const pz = walkChar.position.z;
    const sinY = Math.sin(walkYaw), cosY = Math.cos(walkYaw);
    const newX = px + (sinY * moveZ + cosY * moveX) * walkSpeed;
    const newZ = pz + (cosY * moveZ - sinY * moveX) * walkSpeed;

    if (canMoveTo(newX, newZ)) {
      walkChar.position.x = newX;
      walkChar.position.z = newZ;
    } else if (canMoveTo(newX, pz)) {
      walkChar.position.x = newX;
    } else if (canMoveTo(px, newZ)) {
      walkChar.position.z = newZ;
    }

    walkChar.position.x = Math.max(-10, Math.min(10, walkChar.position.x));
    walkChar.position.z = Math.max(-10, Math.min(10, walkChar.position.z));
  }

  animateCharacter(isMoving);
  updateWalkCamera();
}

// Keyboard handlers for walk mode
window.addEventListener('keydown', e => {
  if (!walkModeOn) return;
  const key = e.key.toLowerCase();
  if (key in walkKeys) {
    walkKeys[key] = true;
    e.preventDefault();
  }
  if (key === 'escape') {
    document.getElementById('toggle-walk').click();
  }
});

window.addEventListener('keyup', e => {
  if (!walkModeOn) return;
  const key = e.key.toLowerCase();
  if (key in walkKeys) walkKeys[key] = false;
});

// Mouse look (pointer lock)
renderer.domElement.addEventListener('click', () => {
  if (walkModeOn && !walkPointerLocked) {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  walkPointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener('mousemove', e => {
  if (!walkModeOn || !walkPointerLocked) return;
  walkYaw -= e.movementX * 0.003;
  walkPitch -= e.movementY * 0.003;
  const firstPerson = walkCamDist < WALK_FP_THRESHOLD;
  const pitchMin = firstPerson ? -1.4 : -0.3;
  const pitchMax = firstPerson ? 1.4 : 1.0;
  walkPitch = Math.max(pitchMin, Math.min(pitchMax, walkPitch));
});

renderer.domElement.addEventListener('wheel', e => {
  if (!walkModeOn) return;
  e.preventDefault();
  walkCamDist += e.deltaY * 0.005;
  walkCamDist = Math.max(0, Math.min(WALK_CAM_DIST_MAX, walkCamDist));
}, { passive: false });
