// ============================================================
// 3D Object Picker — raycasting + tooltip
// ============================================================
(function () {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let tooltipTimer = null;

  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.id = 'picker-tooltip';
  tooltip.style.cssText = [
    'position:fixed',
    'display:none',
    'background:rgba(26,31,22,0.88)',
    'border:1px solid #3a4030',
    'border-radius:6px',
    'padding:8px 12px',
    'color:#d4c9a8',
    'font-size:12px',
    'font-family:Segoe UI,sans-serif',
    'pointer-events:auto',
    'cursor:pointer',
    'z-index:100',
    'backdrop-filter:blur(8px)',
    'line-height:1.5',
    'max-width:260px'
  ].join(';');
  document.body.appendChild(tooltip);

  function hideTooltip() {
    tooltip.style.display = 'none';
    if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
  }

  function findNamedParent(obj) {
    let current = obj;
    while (current) {
      if (current.name && current.parent === playhouse) return current;
      current = current.parent;
    }
    return null;
  }

  renderer.domElement.addEventListener('click', function (e) {
    if (currentView !== '3d') return;

    // Hide previous tooltip
    hideTooltip();

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, activeCamera);
    const hits = raycaster.intersectObjects(playhouse.children, true);
    if (hits.length === 0) return;

    const hit = hits[0];
    const group = findNamedParent(hit.object);
    if (!group) return;

    const name = group.name;
    const pt = hit.point;
    const src = 'src/' + name + '.js';

    // Compute bounding box of the clicked mesh in world space
    var mesh = hit.object;
    mesh.geometry.computeBoundingBox();
    var bb = mesh.geometry.boundingBox.clone();
    bb.applyMatrix4(mesh.matrixWorld);
    var size = new THREE.Vector3();
    bb.getSize(size);

    const coords = 'x: ' + pt.x.toFixed(2) + '  y: ' + pt.y.toFixed(2) + '  z: ' + pt.z.toFixed(2);
    const bbInfo = 'rozsah Y: ' + bb.min.y.toFixed(2) + ' → ' + bb.max.y.toFixed(2) +
      '  (výška: ' + size.y.toFixed(2) + ')';
    const sizeInfo = 'rozměr: ' + size.x.toFixed(2) + ' × ' + size.y.toFixed(2) + ' × ' + size.z.toFixed(2);
    const clipText = '[3D objekt] ' + name + ' (' + src + ') na pozici ' + coords +
      ', ' + bbInfo + ', ' + sizeInfo + ' — uprav/odstraň tento díl';

    tooltip.innerHTML =
      '<strong style="color:#b8c89a">' + name + '</strong><br>' +
      '<span style="color:#8a9a72">' + src + '</span><br>' +
      coords + '<br>' +
      '<span style="color:#c9b87a">' + bbInfo + '</span><br>' +
      '<span style="color:#8a9a72">' + sizeInfo + '</span>' +
      '<br><span style="color:#6a7a5a;font-size:10px" id="picker-copy-hint">klik = kopirovat</span>';

    // Copy to clipboard on tooltip click
    tooltip.onclick = function (ev) {
      ev.stopPropagation();
      navigator.clipboard.writeText(clipText).then(function () {
        var hint = document.getElementById('picker-copy-hint');
        if (hint) hint.textContent = 'zkopirováno!';
        clearTimeout(tooltipTimer);
        tooltipTimer = setTimeout(hideTooltip, 1500);
      });
    };

    // Position tooltip near cursor, clamped to viewport
    let tx = e.clientX + 14;
    let ty = e.clientY + 14;
    tooltip.style.display = 'block';
    const rect = tooltip.getBoundingClientRect();
    if (tx + rect.width > window.innerWidth - 8) tx = e.clientX - rect.width - 8;
    if (ty + rect.height > window.innerHeight - 8) ty = e.clientY - rect.height - 8;
    tooltip.style.left = tx + 'px';
    tooltip.style.top = ty + 'px';

    tooltipTimer = setTimeout(hideTooltip, 3000);
  });
})();
