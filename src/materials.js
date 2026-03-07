// ============================================================
// Materials
// ============================================================
let MAT = {};

function makeWoodTexture(baseColor, grainColor, options = {}) {
  const size = options.size || 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 180 : 40},0,0.02)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 8 + 2, Math.random() * 4 + 1);
  }
  for (let layer = 0; layer < 3; layer++) {
    ctx.strokeStyle = grainColor;
    for (let i = 0; i < 50; i++) {
      ctx.globalAlpha = 0.04 + Math.random() * 0.08;
      ctx.lineWidth = 0.3 + Math.random() * 1.2;
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < size; x += 4) {
        ctx.lineTo(x, y + Math.sin(x * 0.01 + i * 0.7) * 4 + (Math.random() - 0.5) * 1.5);
      }
      ctx.stroke();
    }
  }
  const knotCount = options.knots || 2;
  for (let i = 0; i < knotCount; i++) {
    const kx = Math.random() * size;
    const ky = Math.random() * size;
    const kr = 4 + Math.random() * 10;
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#4a3520';
    ctx.beginPath();
    ctx.ellipse(kx, ky, kr, kr * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    for (let r = 1; r < 4; r++) {
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#5a4530';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr + r * 6, kr * 0.7 + r * 4, Math.random() * 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(options.repeatX || 2, options.repeatY || 2);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function makePalubkyTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const baseColor = '#B8860B';
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  // Horizontal planks
  const plankH = size / 12;
  for (let p = 0; p < 12; p++) {
    const y0 = p * plankH;
    const lightness = 0.9 + Math.random() * 0.2;
    ctx.fillStyle = `rgba(${lightness > 1 ? 20 : 0},${lightness > 1 ? 10 : 0},0,${Math.abs(lightness - 1) * 0.3})`;
    ctx.fillRect(0, y0, size, plankH);
    // Plank seam
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y0); ctx.lineTo(size, y0);
    ctx.stroke();
    // Wood grain
    ctx.strokeStyle = '#9a7008';
    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = 0.06 + Math.random() * 0.08;
      ctx.lineWidth = 0.5 + Math.random();
      const y = y0 + Math.random() * plankH;
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x < size; x += 8) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 2 + (Math.random() - 0.5));
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function setupMaterials() {
  const woodTex = makeWoodTexture('#C4944A', '#8a6020', { knots: 3, repeatX: 1, repeatY: 4 });
  const palubkyTex = makePalubkyTexture();
  const floorTex = makeWoodTexture('#A0784C', '#7a5830', { knots: 2, repeatX: 3, repeatY: 2 });
  const roofTex = makeWoodTexture('#6B3A2A', '#4a2818', { knots: 1, repeatX: 2, repeatY: 2 });

  MAT.posts = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 });
  MAT.walls = new THREE.MeshStandardMaterial({ map: palubkyTex, roughness: 0.85 });
  MAT.floor = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });
  MAT.roof = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.7 });
  MAT.roofEdge = new THREE.MeshStandardMaterial({ color: COLORS.roofEdge, roughness: 0.8 });
  MAT.railing = new THREE.MeshStandardMaterial({ color: COLORS.railing, roughness: 0.75 });
  MAT.slide = new THREE.MeshStandardMaterial({ color: COLORS.slide, metalness: 0.3, roughness: 0.25 });
  MAT.ladder = new THREE.MeshStandardMaterial({ color: COLORS.ladder, roughness: 0.8 });
  MAT.frame = new THREE.MeshStandardMaterial({ color: COLORS.frame, roughness: 0.7 });
  MAT.glass = new THREE.MeshStandardMaterial({ color: 0xaad4f5, transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0.1 });
  MAT.concrete = new THREE.MeshStandardMaterial({ color: COLORS.concrete, roughness: 0.9 });
  MAT.beam = MAT.posts; // same texture and roughness
}
