// ============================================================
// Toggles
// ============================================================
let wireframeOn = false;
let labelsOn = false;

document.getElementById('toggle-wire').addEventListener('click', function () {
  wireframeOn = !wireframeOn;
  this.classList.toggle('on', wireframeOn);
  playhouse.traverse(c => {
    if (c.isMesh && c.material && c.name !== 'ground') {
      c.material.wireframe = wireframeOn;
    }
  });
});

document.getElementById('toggle-labels').addEventListener('click', function () {
  labelsOn = !labelsOn;
  this.classList.toggle('on', labelsOn);
  const labelsGroup = playhouse.getObjectByName('labels');
  if (labelsGroup) labelsGroup.visible = labelsOn;
});

let dimsOn = false;
document.getElementById('toggle-dims').addEventListener('click', function () {
  dimsOn = !dimsOn;
  this.classList.toggle('on', dimsOn);
  const dimsGroup = playhouse.getObjectByName('dimensions');
  if (dimsGroup) dimsGroup.visible = dimsOn;
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
