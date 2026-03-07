// ============================================================
// Ground
// ============================================================
function createGround() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4a7a2e';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3000; i++) {
    const g = 80 + Math.random() * 60;
    ctx.fillStyle = `rgba(${30 + Math.random() * 40}, ${g}, ${20 + Math.random() * 20}, 0.15)`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 6, 2 + Math.random() * 6);
  }
  ctx.strokeStyle = '#5a8a35';
  for (let i = 0; i < 500; i++) {
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 0.5;
    const x = Math.random() * 512, y = Math.random() * 512;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 3 - Math.random() * 5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 1.0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'ground';
  return ground;
}

// Contact shadow
function createContactShadow() {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.W + 1.5, CONFIG.D + 1.5),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.002, 0);
  mesh.name = 'contactShadow';
  return mesh;
}
