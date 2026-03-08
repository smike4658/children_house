// ============================================================
// Walk Mode — procházka s postavičkou + fyzika terénu
// ============================================================
let walkModeOn = false;
let walkChar = null;
let walkYaw = 0;
let walkPitch = 0;
let walkPos = new THREE.Vector3(CONFIG.HOUSE_X + 2.5, 0, -3);
const walkSpeed = 0.04;
const walkClimbSpeed = 0.025;
const walkKeys = { w: false, a: false, s: false, d: false };
let walkPointerLocked = false;
let walkCamDist = 2.5;  // 0 = first-person, 2.5 = third-person
const WALK_CAM_DIST_MAX = 4.0;
const WALK_FP_THRESHOLD = 0.15;  // below this → first-person mode

// Physics state
const WALK_GRAVITY = 0.006;
let walkVelY = 0; // vertical velocity
let walkState = 'ground'; // 'ground' | 'floor2' | 'climbing' | 'falling'

// Character dimensions (child ~120cm tall)
const CHAR_HEIGHT = 1.20;
const CHAR_HEAD_R = 0.12;
const CHAR_BODY_R = 0.08;
const CHAR_BODY_H = 0.50;
const CHAR_LEG_R = 0.05;
const CHAR_LEG_H = 0.45;
const CHAR_ARM_R = 0.04;
const CHAR_ARM_H = 0.35;

function isOnStairs(px, pz) {
  const sx1 = CONFIG.HOUSE_X + 0.93;
  const sx2 = CONFIG.HOUSE_X + 1.55 + 0.05; // Mírná rezerva pro okraj
  const sz1 = -CONFIG.D / 2 - CONFIG.STAIRS_RUN;
  const sz2 = -CONFIG.D / 2;
  return px >= sx1 && px <= sx2 && pz >= sz1 && pz <= sz2;
}

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

// Walking / climbing animation
let walkTime = 0;
function animateCharacter(isMoving) {
  if (!walkChar) return;

  const legL = walkChar.getObjectByName('legL');
  const legR = walkChar.getObjectByName('legR');
  const armL = walkChar.getObjectByName('armL');
  const armR = walkChar.getObjectByName('armR');

  if (walkState === 'climbing') {
    // Climbing animation — alternating reach
    if (isMoving) walkTime += 0.10;
    else walkTime *= 0.9;
    const swing = Math.sin(walkTime) * 0.5;
    if (legL && legR) { legL.rotation.x = swing; legR.rotation.x = -swing; }
    if (armL && armR) { armL.rotation.x = -swing * 1.2; armR.rotation.x = swing * 1.2; }
  } else {
    // Normal walk
    if (isMoving) walkTime += 0.12;
    else walkTime *= 0.9;
    const swing = Math.sin(walkTime) * 0.4;
    if (legL && legR) { legL.rotation.x = swing; legR.rotation.x = -swing; }
    if (armL && armR) { armL.rotation.x = -swing * 0.75; armR.rotation.x = swing * 0.75; }
  }
}

// Check if position is on the 2nd floor footprint
function isOnFloor2(px, pz) {
  const hw = CONFIG.W / 2;
  const hd = CONFIG.D / 2;
  const ox = CONFIG.HOUSE_X;
  const margin = 0.05;
  return px > ox - hw + margin && px < ox + hw - margin && pz > -hd + margin && pz < hd - margin;
}

// Get the floor height at a given position
function getFloorHeight(px, pz, currentY) {
  const hw = CONFIG.W / 2;
  const hd = CONFIG.D / 2;

  if (isOnStairs(px, pz)) {
    const sz1 = -hd - CONFIG.STAIRS_RUN;
    const sz2 = -hd;
    // Pramp height linearly interpolates from 0 to H1
    let t = (pz - sz1) / (sz2 - sz1);
    t = Math.max(0, Math.min(1, t));
    return t * CONFIG.H1;
  }

  // If character is above H1 level and on the 2nd floor footprint → floor2
  if (currentY >= CONFIG.H1 - 0.1 && isOnFloor2(px, pz)) {
    return CONFIG.H1;
  }

  // Ground level everywhere else
  return 0;
}

function enterWalkMode() {
  walkModeOn = true;
  walkState = 'ground';
  walkVelY = 0;
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
  orbitTarget.set(walkPos.x, 1.5, walkPos.z);
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

  // In climbing mode, face the ladder (towards -X, looking at the wall)
  if (walkState !== 'climbing') {
    walkChar.rotation.y = walkYaw;
    walkChar.rotation.x = 0;
    walkChar.rotation.z = 0;
  }

  const firstPerson = walkCamDist < WALK_FP_THRESHOLD;
  walkChar.visible = !firstPerson;

  if (firstPerson) {
    // First-person: camera at eye level, look forward with pitch
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

  // Current position — must be declared before all state checks
  const px = walkChar.position.x;
  const pz = walkChar.position.z;
  const py = walkChar.position.y;

  // ---- STATE: FALLING ----
  if (walkState === 'falling') {
    walkVelY -= WALK_GRAVITY;
    walkChar.position.y += walkVelY;

    // Check landing
    const floorH = getFloorHeight(px, pz, py);
    if (walkChar.position.y <= floorH) {
      walkChar.position.y = floorH;
      walkVelY = 0;
      walkState = floorH >= CONFIG.H1 - 0.1 ? 'floor2' : 'ground';
    }

    // Still allow horizontal movement while falling
    if (isMoving) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= len; moveZ /= len;
      const sinY = Math.sin(walkYaw), cosY = Math.cos(walkYaw);
      walkChar.position.x += (sinY * moveZ + cosY * moveX) * walkSpeed * 0.5;
      walkChar.position.z += (cosY * moveZ - sinY * moveX) * walkSpeed * 0.5;
    }

    walkChar.position.x = Math.max(-10, Math.min(10, walkChar.position.x));
    walkChar.position.z = Math.max(-10, Math.min(10, walkChar.position.z));

    animateCharacter(false);
    updateWalkCamera();
    return;
  }

  if (isMoving) {
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    moveX /= len; moveZ /= len;

    const sinY = Math.sin(walkYaw), cosY = Math.cos(walkYaw);
    const newX = walkChar.position.x + (sinY * moveZ + cosY * moveX) * walkSpeed;
    const newZ = walkChar.position.z + (cosY * moveZ - sinY * moveX) * walkSpeed;

    // Check if still on current floor after move
    if (walkState === 'floor2') {
      if (!isOnFloor2(newX, newZ) && !isOnStairs(newX, newZ)) {
        // Walked off the edge → fall!
        walkState = 'falling';
        walkVelY = 0;
        walkChar.position.x = newX;
        walkChar.position.z = newZ;
      } else {
        walkChar.position.x = newX;
        walkChar.position.z = newZ;
        const newY = getFloorHeight(newX, newZ, walkChar.position.y);
        walkChar.position.y = newY;
        // Transition back to ground when descending stairs to ground level
        if (newY < CONFIG.H1 - 0.1) {
          walkState = 'ground';
        }
      }
    } else {
      // Ground — free movement or stairs
      walkChar.position.x = newX;
      walkChar.position.z = newZ;
      walkChar.position.y = getFloorHeight(newX, newZ, walkChar.position.y);
      if (walkChar.position.y >= CONFIG.H1 - 0.1) {
        walkState = 'floor2';
      }
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
