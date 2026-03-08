// ============================================================
// Toggles
// ============================================================
let wireframeOn = false;
document.getElementById('toggle-wire').addEventListener('click', function () {
  wireframeOn = !wireframeOn;
  this.classList.toggle('on', wireframeOn);
  playhouse.traverse(c => {
    if (c.isMesh && c.material && c.name !== 'ground') {
      c.material.wireframe = wireframeOn;
    }
  });
});

let dimsOn = false;
document.getElementById('toggle-dims').addEventListener('click', function () {
  dimsOn = !dimsOn;
  this.classList.toggle('on', dimsOn);
  const dimsGroup = playhouse.getObjectByName('dimensions');
  if (dimsGroup) dimsGroup.visible = dimsOn;
});

document.getElementById('toggle-walk').addEventListener('click', function () {
  if (currentView !== '3d') return;
  const entering = !walkModeOn;
  this.classList.toggle('on', entering);
  if (entering) {
    enterWalkMode();
  } else {
    exitWalkMode();
  }
});

// ============================================================
// Tab event listeners
// ============================================================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

// View presets
document.querySelectorAll('.vbtn').forEach(btn => {
  btn.addEventListener('click', () => setPreset(btn.dataset.preset));
});
