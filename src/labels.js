// ============================================================
// Labels — 3D text sprites
// ============================================================
function makeLabel(text, color = '#d4c9a8', fontSize = 14) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(26,31,22,0.75)';
  ctx.roundRect ? ctx.roundRect(4, 4, c.width - 8, c.height - 8, 6) : ctx.fillRect(4, 4, c.width - 8, c.height - 8);
  ctx.fill();
  ctx.strokeStyle = '#3a4030';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px Segoe UI, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.2, 0.3, 1);
  return sprite;
}

function createLabels() {
  const g = new THREE.Group(); g.name = 'labels';
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;

  const items = [
    { text: 'KABINA  310\u00d7172 cm', x: 0, y: CONFIG.H1 + 0.7, z: hd / 2 + 0.2 },
    { text: 'TERASA  310\u00d770 cm', x: 0, y: CONFIG.H1 + 0.3, z: -hd + CONFIG.TD / 2 },
    { text: 'P\u0158\u00cdZEM\u00cd  150 cm', x: 0, y: 0.7, z: -hd / 2 },
    { text: 'Klouz\u00e1\u010dka  260 cm', x: hw + 0.4, y: CONFIG.H1 / 2, z: -hd - 0.4, color: COLORS.slide },
    { text: '\u017deb\u0159\u00edk  6 p\u0159\u00ed\u010dek', x: -hw - 0.8, y: CONFIG.H1 / 2, z: 0, color: COLORS.ladder },
  ];
  items.forEach(it => {
    const s = makeLabel(it.text, it.color || '#d4c9a8');
    s.position.set(it.x, it.y, it.z);
    g.add(s);
  });
  return g;
}
