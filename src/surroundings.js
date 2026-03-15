// ============================================================
// Surroundings — okolí (kamínky, habry, plot)
// ============================================================
function createSurroundings() {
    const g = new THREE.Group(); g.name = 'surroundings';

    // Kamínková plocha: domeček u LEVÉHO okraje (z pohledu kamery),
    // pískoviště a houpačka na kamínkové ploše napravo od domečku.
    const pebbleLeft = CONFIG.HOUSE_X - CONFIG.W / 2 - 0.15; // levý okraj = u domečku
    const swingRight = CONFIG.HOUSE_X + CONFIG.W / 2 + 1.40 + 0.70 + 3.00 + 0.5;
    const pWidth = swingRight - pebbleLeft;
    const pDepth = 2.5;
    const pZ = 0;
    const cX = (pebbleLeft + swingRight) / 2;

    const pebblesGeometry = new THREE.BoxGeometry(pWidth, 0.04, pDepth);
    const pebblesMesh = new THREE.Mesh(pebblesGeometry, MAT.pebbles);
    pebblesMesh.position.set(cX, 0.02, pZ);
    pebblesMesh.receiveShadow = true;
    g.add(pebblesMesh);

    // 2. Habry (110cm pás za kamínky = z 1.25 do 2.35)
    // Výška 1.0m, šířka 9m (stejná jako kamínky)
    const hWidth = pWidth;
    const hDepth = 1.1;
    const hHeight = 1.0;
    const hZ = pZ + pDepth / 2 + hDepth / 2; // 1.25 + 0.55 = 1.80

    const hornbeamsGeometry = new THREE.BoxGeometry(hWidth, hHeight, hDepth);
    const hornbeamsMesh = new THREE.Mesh(hornbeamsGeometry, MAT.hornbeams);
    hornbeamsMesh.position.set(cX, hHeight / 2, hZ);
    hornbeamsMesh.castShadow = true;
    hornbeamsMesh.receiveShadow = true;
    g.add(hornbeamsMesh);

    // 3. Plot (nepruhledná textilie, výška 1.8m)
    // Za habry (z = 2.35 do 2.39)
    const fWidth = pWidth;
    const fDepth = 0.04;
    const fHeight = 1.8;
    const fZ = pZ + pDepth / 2 + hDepth + fDepth / 2; // 1.25 + 1.1 + 0.02 = 2.37

    const fenceGeometry = new THREE.BoxGeometry(fWidth, fHeight, fDepth);
    const fenceMesh = new THREE.Mesh(fenceGeometry, MAT.fenceTex);
    fenceMesh.position.set(cX, fHeight / 2, fZ);
    fenceMesh.castShadow = true;
    fenceMesh.receiveShadow = true;
    g.add(fenceMesh);

    return g;
}
