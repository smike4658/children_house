// ============================================================
// Stairs — schody na terasu
// ============================================================
function createStairs() {
    const g = new THREE.Group(); g.name = 'stairs';
    const hw = CONFIG.W / 2, hd = CONFIG.D / 2;

    const STAIRS_W = CONFIG.STAIRS_W;
    const STAIRS_RUN = CONFIG.STAIRS_RUN;

    // Pozice za sloupkem x = 0.93 a končící na x = 1.55
    const startX = 0.93 + STAIRS_W / 2; // = 1.24

    const rise = CONFIG.H1; // 1.50
    const run = STAIRS_RUN;
    const length = Math.sqrt(run * run + rise * rise);
    const angle = Math.atan2(rise, run);

    const stairsGroup = new THREE.Group();

    const stringerT = 0.05;
    const stringerH = 0.16;

    // Dvě boční schodnice (bílé)
    [-1, 1].forEach(side => {
        const stringer = box(stringerT, stringerH, length, MAT.walls);
        stringer.position.set(side * (STAIRS_W / 2 - stringerT / 2), rise / 2, -run / 2);
        // Nastavení úhlu stoupání
        stringer.rotation.x = -angle;
        stairsGroup.add(stringer);
    });

    // Stupně (dřevěné)
    const numSteps = 9;
    const stepD = 0.18; // Hloubka nášlapu 18cm
    const stepT = 0.035;
    const stepW = STAIRS_W - 2 * stringerT;

    for (let i = 1; i <= numSteps; i++) {
        const fraction = i / (numSteps + 1);
        const step = box(stepW, stepT, stepD, MAT.floor);
        // Stupnice jdou od shora dolů (z = 0 do z = -run)
        const sy = rise - fraction * rise;
        const sz = -fraction * run;
        step.position.set(0, sy, sz);
        stairsGroup.add(step);
    }

    // Zábradlí schodů (madlo) - na levé straně z pohledu zahrady (+X v lokálních osách)
    const handrailSide = 1;
    const postH = 0.90;

    // Spodní sloupek madla
    const botPost = box(0.06, postH, 0.06, MAT.posts);
    botPost.position.set(handrailSide * (STAIRS_W / 2 - stringerT / 2), postH / 2, -run);
    botPost.castShadow = true;
    stairsGroup.add(botPost);

    // Madlo (horní prkno)
    const handrail = box(0.04, 0.08, length, MAT.walls);
    handrail.position.set(handrailSide * (STAIRS_W / 2 - stringerT / 2 + 0.05), rise / 2 + postH, -run / 2);
    handrail.rotation.x = -angle;
    stairsGroup.add(handrail);

    // Spodní prkno
    const lowerRail = box(0.02, 0.08, length, MAT.walls);
    lowerRail.position.set(handrailSide * (STAIRS_W / 2 - stringerT / 2 + 0.04), rise / 2 + postH - 0.35, -run / 2);
    lowerRail.rotation.x = -angle;
    stairsGroup.add(lowerRail);

    // Celková pozice schodů: u přední strany terasy (z = -hd), u sloupku x = 0.93 - 1.55
    stairsGroup.position.set(startX, 0, -hd);
    g.add(stairsGroup);

    return g;
}
