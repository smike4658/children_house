// ============================================================
// Sandbox — pískoviště (140x140 vpravo vzadu)
// ============================================================
function createSandbox() {
    const g = new THREE.Group(); g.name = 'sandbox';
    const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
    const size = 1.40;
    const h = 0.20;
    const t = 0.04;

    // Pozice: navazuje na pravou stěnu (+X = hw) a lícovitě na zadní stěnu (+Z = hd)
    const leftX = hw;
    const rightX = hw + size;
    const backZ = hd;
    const frontZ = hd - size;

    const centerX = (leftX + rightX) / 2;
    const centerZ = (backZ + frontZ) / 2;

    // Rám pískoviště
    // Zadní (podél X)
    const bBack = box(size, h, t, MAT.posts);
    bBack.position.set(0, h / 2, size / 2 - t / 2);
    // Přední (podél X)
    const bFront = box(size, h, t, MAT.posts);
    bFront.position.set(0, h / 2, -size / 2 + t / 2);
    // Levý (podél Z)
    const bLeft = box(t, h, size - 2 * t, MAT.posts);
    bLeft.position.set(-size / 2 + t / 2, h / 2, 0);
    // Pravý (podél Z)
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
