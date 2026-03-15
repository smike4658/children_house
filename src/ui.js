// ============================================================
// Spec chips — dynamické rozměry z CONFIG (přízemní verze)
// ============================================================
document.getElementById('spec-w').textContent = (CONFIG.W * 100 | 0) + ' cm';
document.getElementById('spec-d').textContent = (CONFIG.D * 100 | 0) + ' cm';
document.getElementById('spec-hf').textContent = (CONFIG.H_FRONT * 100 | 0) + ' cm';
document.getElementById('spec-hb').textContent = (CONFIG.H_BACK * 100 | 0) + ' cm';
document.getElementById('spec-hr').textContent = (CONFIG.H_ROOF_FRONT * 100 | 0) + ' cm';

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
