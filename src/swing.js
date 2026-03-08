// ============================================================
// Swing — houpačka (z jeklů 8x8 cm, vedle domečku)
// Portálový rám, dvě houpačky:
//   1) klasické ploché sedátko na řetězech (vlevo)
//   2) červené baby sedátko s opěrkou na lanech (vpravo)
// ============================================================
function createSwing() {
    const g = new THREE.Group(); g.name = 'swing';

    const width = 3.00;
    const height = 2.25;
    const jekl = 0.08;

    // Pozice: napravo od pískoviště, 70 cm mezera
    const sandboxRightX = CONFIG.HOUSE_X + CONFIG.W / 2 + 1.40;
    const leftX = sandboxRightX + 0.70;
    const cX = leftX + width / 2;
    const cZ = 0;

    // === RÁM (portál: 2 nohy + příčník) ===

    // Levá noha
    const bLeft = box(jekl, height, jekl, MAT.swingFrame);
    bLeft.position.set(-width / 2, height / 2, 0);
    g.add(bLeft);

    // Pravá noha
    const bRight = box(jekl, height, jekl, MAT.swingFrame);
    bRight.position.set(width / 2, height / 2, 0);
    g.add(bRight);

    // Vrchní příčník
    const bTop = box(width + jekl, jekl, jekl, MAT.swingFrame);
    bTop.position.set(0, height - jekl / 2, 0);
    g.add(bTop);

    // === Materiály pro závěsy ===
    const chainMat = new THREE.MeshStandardMaterial({ color: '#999999', metalness: 0.9, roughness: 0.15 });
    const ropeMat = new THREE.MeshStandardMaterial({ color: '#D0C8A0', roughness: 0.9, metalness: 0.0 });

    // === HOUPAČKA 1: klasické ploché sedátko (vlevo) ===
    const seat1X = -width / 4; // čtvrtina zleva
    const seat1H = 0.45;       // výška sedátka nad zemí
    const seat1W = 0.44;
    const seat1D = 0.18;
    const seat1Thick = 0.025;
    const chain1Len = height - seat1H - jekl;

    // Řetězy (tenké válce)
    const chain1Geom = new THREE.CylinderGeometry(0.008, 0.008, chain1Len);

    const ch1L = new THREE.Mesh(chain1Geom, chainMat);
    ch1L.position.set(seat1X - seat1W / 2 + 0.03, seat1H + chain1Len / 2, 0);
    ch1L.castShadow = true;
    g.add(ch1L);

    const ch1R = new THREE.Mesh(chain1Geom, chainMat);
    ch1R.position.set(seat1X + seat1W / 2 - 0.03, seat1H + chain1Len / 2, 0);
    ch1R.castShadow = true;
    g.add(ch1R);

    // Ploché sedátko (černé)
    const seatBlackMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.85, metalness: 0.0 });
    const seat1Mesh = box(seat1W, seat1Thick, seat1D, seatBlackMat);
    seat1Mesh.position.set(seat1X, seat1H, 0);
    seat1Mesh.castShadow = true;
    g.add(seat1Mesh);

    // === HOUPAČKA 2: baby sedátko s opěrkou (vpravo, červené) ===
    const seat2X = width / 4; // čtvrtina zprava
    const seat2H = 0.55;      // trochu výš (baby sedátko)
    const rope2Len = height - seat2H - jekl;

    // Lana (béžová)
    const rope2Geom = new THREE.CylinderGeometry(0.006, 0.006, rope2Len);

    const rp2L = new THREE.Mesh(rope2Geom, ropeMat);
    rp2L.position.set(seat2X - 0.14, seat2H + rope2Len / 2, 0);
    rp2L.castShadow = true;
    g.add(rp2L);

    const rp2R = new THREE.Mesh(rope2Geom, ropeMat);
    rp2R.position.set(seat2X + 0.14, seat2H + rope2Len / 2, 0);
    rp2R.castShadow = true;
    g.add(rp2R);

    // Baby sedátko — zjednodušený tvar: sedák + opěrka + přední zarážka
    const babyW = 0.30;
    const babyD = 0.28;
    const babySeatThick = 0.03;
    const babyBackH = 0.22;
    const babyFrontH = 0.12;

    // Sedák
    const babySeat = box(babyW, babySeatThick, babyD, MAT.swingSeat);
    babySeat.position.set(seat2X, seat2H, 0);
    babySeat.castShadow = true;
    g.add(babySeat);

    // Opěrka (zadní)
    const babyBack = box(babyW, babyBackH, babySeatThick, MAT.swingSeat);
    babyBack.position.set(seat2X, seat2H + babyBackH / 2, babyD / 2 - babySeatThick / 2);
    babyBack.castShadow = true;
    g.add(babyBack);

    // Přední zarážka (nižší)
    const babyFront = box(babyW, babyFrontH, babySeatThick, MAT.swingSeat);
    babyFront.position.set(seat2X, seat2H + babyFrontH / 2, -babyD / 2 + babySeatThick / 2);
    babyFront.castShadow = true;
    g.add(babyFront);

    // Boční stěnky baby sedátka
    const babySideH = 0.10;
    const babySideL = box(babySeatThick, babySideH, babyD, MAT.swingSeat);
    babySideL.position.set(seat2X - babyW / 2 + babySeatThick / 2, seat2H + babySideH / 2, 0);
    babySideL.castShadow = true;
    g.add(babySideL);

    const babySideR = box(babySeatThick, babySideH, babyD, MAT.swingSeat);
    babySideR.position.set(seat2X + babyW / 2 - babySeatThick / 2, seat2H + babySideH / 2, 0);
    babySideR.castShadow = true;
    g.add(babySideR);

    // Posunout celou skupinu na místo
    g.position.set(cX, 0, cZ);

    return g;
}
