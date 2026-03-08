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
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const baseColor = COLORS.walls; // Use config color
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  // Horizontal planks
  const numPlanks = 16;
  const plankH = size / numPlanks;
  for (let p = 0; p < numPlanks; p++) {
    const y0 = p * plankH;
    const lightness = 0.94 + Math.random() * 0.12;
    ctx.fillStyle = `rgba(0,0,0,${Math.abs(1 - lightness) * 0.2})`;
    ctx.fillRect(0, y0, size, plankH);
    // Plank seam with Fake AO
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, y0, size, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, y0 + 4, size, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(0, y0 + plankH - 2, size, 2);
    // Subtle wood grain
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    for (let i = 0; i < 8; i++) {
      ctx.lineWidth = 0.5 + Math.random();
      const y = y0 + 6 + Math.random() * (plankH - 12);
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x < size; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 2 + (Math.random() - 0.5));
      }
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function setupMaterials() {
  const woodTex = makeWoodTexture(COLORS.posts, '#7A5222', { knots: 4, repeatX: 1, repeatY: 4 });

  // Vytvoříme texturu palubek tak, aby se vůbec neopakovala v canvasu sama o sobě (zrušíme repeat logic)
  // Ne, raději jen nastavíme jejím repeat parametrům fixní poměr.
  const palubkyTex = makePalubkyTexture();
  // Změníme mapping z defaultního (který se natahuje) na absolutní repeat.
  // Aby repeat fungoval metricky globálně, neuděláme to v materiálu (pač ten se aplikuje na různé velikosti boxů),
  // ale upravíme UV mapování přímo na geometriích. To vyřešíme dodatečnou funkcí pro zdi.

  const floorTex = makeWoodTexture(COLORS.floor, '#7A5222', { knots: 3, repeatX: 3, repeatY: 2 });
  const roofTex = makeWoodTexture(COLORS.roof, '#555C60', { knots: 0, repeatX: 2, repeatY: 2 });

  MAT.posts = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.9, metalness: 0.0 });

  // Stěny budou sdílet jednu texturu, ale my nechceme z materiálů řešit geometrie,
  // naštěstí existuje lepší trik pro plošné materiály: nepoužijeme repeat na textuře,
  // protože pak se natahuje s geometrií, ale použijeme repeat úměrný šířce a výšce při tvorbě STĚN, 
  // případně můžeme textuře nastavit wrap, ale musíme předat konkrétní počet repeatů.
  // Proto tu jen pripravíme zaklad a budeme to řešit klonováním materialu s ruznym repeatem ve walls.js.
  MAT.wallsTex = palubkyTex; // save texture to clone it later
  MAT.walls = new THREE.MeshStandardMaterial({ map: palubkyTex, roughness: 1.0, metalness: 0.0 });

  MAT.floor = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.95, metalness: 0.0 });
  MAT.roof = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.85, metalness: 0.1 });
  MAT.roofEdge = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.9, metalness: 0.0 });
  MAT.railing = new THREE.MeshStandardMaterial({ color: COLORS.railing, roughness: 1.0, metalness: 0.0 });
  MAT.slide = new THREE.MeshStandardMaterial({ color: COLORS.slide, roughness: 0.15, metalness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.1 });
  MAT.ladder = new THREE.MeshStandardMaterial({ color: COLORS.ladder, roughness: 1.0, metalness: 0.0 });
  MAT.frame = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.9, metalness: 0.0 });
  MAT.glass = new THREE.MeshStandardMaterial({ color: 0x88ccee, transparent: true, opacity: 0.4, roughness: 0.05, metalness: 0.2 });
  MAT.concrete = new THREE.MeshStandardMaterial({ color: COLORS.concrete, roughness: 0.95, metalness: 0.0 });
  MAT.beam = MAT.posts;
}
