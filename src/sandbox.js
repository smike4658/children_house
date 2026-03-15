// ============================================================
// Sandbox — pískoviště (140x140 vlevo = +X strana)
// ============================================================
function createSandbox() {
    const g = new THREE.Group(); g.name = 'sandbox';
    const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
    const size = 1.40;
    const h = 0.20;
    const t = 0.04;

    // Pozice: vlevo na obrazovce (+X), za schody plošiny (toward +Z)
    const platBackZ = CONFIG.PLATFORM_Z + CONFIG.PLATFORM_D / 2;
    const stairsEndZ = platBackZ + CONFIG.STAIR_COUNT * CONFIG.STAIR_DEPTH;
    const sandboxFrontZ = stairsEndZ + 0.10;

    const centerX = hw + size / 2;
    const centerZ = sandboxFrontZ + size / 2;

    // Rám pískoviště
    const bBack = box(size, h, t, MAT.posts);
    bBack.position.set(0, h / 2, size / 2 - t / 2);
    const bFront = box(size, h, t, MAT.posts);
    bFront.position.set(0, h / 2, -size / 2 + t / 2);
    const bLeft = box(t, h, size - 2 * t, MAT.posts);
    bLeft.position.set(-size / 2 + t / 2, h / 2, 0);
    const bRight = box(t, h, size - 2 * t, MAT.posts);
    bRight.position.set(size / 2 - t / 2, h / 2, 0);

    g.add(bBack);
    g.add(bFront);
    g.add(bLeft);
    g.add(bRight);

    // Písek
    const sandGeom = new THREE.BoxGeometry(size - 2 * t, h - 0.05, size - 2 * t);
    const sandMat = new THREE.MeshPhongMaterial({ color: '#D4C07B' });
    const sandMesh = new THREE.Mesh(sandGeom, sandMat);
    sandMesh.position.set(0, (h - 0.05) / 2, 0);
    sandMesh.receiveShadow = true;
    g.add(sandMesh);

    g.position.set(centerX, 0, centerZ);

    return g;
}
