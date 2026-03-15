// ============================================================
// Materials Page — přehled materiálů (přízemní verze)
// ============================================================

function buildMaterialsPage() {
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  const P = CONFIG.POST;
  const B = CONFIG.BEAM;
  const T = CONFIG.WALL_T;
  const FH = 0.10; // výška patky

  // Helper: zaokrouhlení na cm
  function cm(m) { return Math.round(m * 100); }
  // Helper: zaokrouhlení na 1 des. místo
  function m1(m) { return Math.round(m * 10) / 10; }
  // Helper: plocha v m²
  function area(w, h) { return Math.round(w * h * 100) / 100; }

  const sections = [];

  // === 1. BETONOVÉ PATKY ===
  sections.push({
    title: 'Betonové patky',
    color: COLORS.concrete,
    items: [
      { name: 'Betonová patka', dim: '22 × 22 × 10 cm', qty: 4, note: 'Pod rohovými sloupky' },
    ]
  });

  // === 2. NOSNÉ SLOUPKY ===
  const postItems = [];
  postItems.push({
    name: 'Rohový sloupek (přední)',
    dim: `${cm(P)} × ${cm(P)} × ${cm(CONFIG.H_FRONT - FH)} cm`,
    qty: 2,
    note: `KVH hranol, výška ${cm(CONFIG.H_FRONT - FH)} cm`
  });
  postItems.push({
    name: 'Rohový sloupek (zadní)',
    dim: `${cm(P)} × ${cm(P)} × ${cm(CONFIG.H_BACK - FH)} cm`,
    qty: 2,
    note: `KVH hranol, výška ${cm(CONFIG.H_BACK - FH)} cm`
  });
  sections.push({ title: 'Nosné sloupky', color: COLORS.posts, items: postItems });

  // === 3. TRÁMY A NOSNÍKY ===
  const beamItems = [];
  // Podlahový rám
  beamItems.push({
    name: 'Obvodový trám podlaha (podél X)',
    dim: `${cm(CONFIG.W)} × ${cm(B)} × ${cm(B)} cm`,
    qty: 2,
    note: 'Přední + zadní'
  });
  beamItems.push({
    name: 'Obvodový trám podlaha (podél Z)',
    dim: `${cm(B)} × ${cm(B)} × ${cm(CONFIG.D)} cm`,
    qty: 2,
    note: 'Levý + pravý'
  });
  beamItems.push({
    name: 'Středový trám podlaha',
    dim: `${cm(B)} × ${cm(B)} × ${cm(CONFIG.D)} cm`,
    qty: 1,
    note: 'Podél Z, střed šířky'
  });
  beamItems.push({
    name: 'Příčný nosník podlaha',
    dim: `${cm(CONFIG.W)} × ${cm(B)} × ${cm(B)} cm`,
    qty: 3,
    note: 'Rovnoměrně rozložené pod podlahou'
  });
  // Horní rámy (vaznice)
  beamItems.push({
    name: 'Přední vaznice',
    dim: `${cm(CONFIG.W)} × ${cm(B)} × ${cm(B)} cm`,
    qty: 1,
    note: `Na výšce ${cm(CONFIG.H_FRONT)} cm`
  });
  beamItems.push({
    name: 'Zadní vaznice',
    dim: `${cm(CONFIG.W)} × ${cm(B)} × ${cm(B)} cm`,
    qty: 1,
    note: `Na výšce ${cm(CONFIG.H_BACK)} cm`
  });
  const roofDrop = CONFIG.H_FRONT - CONFIG.H_BACK;
  const slopeLen = Math.sqrt(CONFIG.D * CONFIG.D + roofDrop * roofDrop);
  beamItems.push({
    name: 'Boční vaznice (šikmá)',
    dim: `${cm(B)} × ${cm(B)} × ${cm(slopeLen)} cm`,
    qty: 2,
    note: 'Levá + pravá, pod střechou'
  });
  sections.push({
    title: 'Trámy a nosníky',
    color: COLORS.posts,
    items: beamItems,
    material: 'Smrk, impregnovaný, broušený',
    link: { url: 'https://drevovyroba-plasil.cz/hranoly/74-5597-hranol-brouseny-100x100-mm-delka-6m.html#/32-delka-4_m/38-impregnace-bez_impregnace/54-povrchova_uprava-nebrouseny', label: 'Dřevovýroba Plášil — Hranol 100×100 mm' }
  });

  // === 4. PODLAHA ===
  sections.push({
    title: 'Podlaha',
    color: COLORS.floor,
    items: [{
      name: 'Podlaha',
      dim: `${cm(CONFIG.W)} × ${cm(CONFIG.D)} cm, tl. 5 cm`,
      qty: 1,
      note: `Plocha ${area(CONFIG.W, CONFIG.D)} m²`
    }]
  });

  // === 5. STĚNY ===
  const wallItems = [];
  wallItems.push({
    name: 'Zadní stěna (+Z)',
    dim: `${cm(CONFIG.W)} × ${cm(CONFIG.H_BACK)} cm, tl. ${cm(T)} cm`,
    qty: 1,
    note: `Plná. Plocha ${area(CONFIG.W, CONFIG.H_BACK)} m²`
  });
  wallItems.push({
    name: 'Levá stěna (-X)',
    dim: `${cm(CONFIG.D)} × ${cm(CONFIG.H_FRONT)} cm, tl. ${cm(T)} cm`,
    qty: 1,
    note: `S oknem ${cm(CONFIG.SIDE_WIN_W)}×${cm(CONFIG.SIDE_WIN_H)}. Plocha ${area(CONFIG.D, CONFIG.H_FRONT)} m²`
  });
  wallItems.push({
    name: 'Pravá stěna (+X)',
    dim: `${cm(CONFIG.D)} × ${cm(CONFIG.H_FRONT)} cm, tl. ${cm(T)} cm`,
    qty: 1,
    note: `S oknem ${cm(CONFIG.SIDE_WIN_W)}×${cm(CONFIG.SIDE_WIN_H)}. Plocha ${area(CONFIG.D, CONFIG.H_FRONT)} m²`
  });
  const doorArea = CONFIG.DOOR_W * CONFIG.DOOR_H;
  const frontWinArea = CONFIG.FRONT_WIN_W * CONFIG.FRONT_WIN_H;
  wallItems.push({
    name: 'Přední stěna (-Z)',
    dim: `${cm(CONFIG.W)} × ${cm(CONFIG.H_FRONT)} cm, tl. ${cm(T)} cm`,
    qty: 1,
    note: `Posuvné dveře ${cm(CONFIG.DOOR_W)}×${cm(CONFIG.DOOR_H)} + okno ${cm(CONFIG.FRONT_WIN_W)}×${cm(CONFIG.FRONT_WIN_H)}`
  });
  sections.push({ title: 'Stěny (palubky)', color: COLORS.walls, items: wallItems });

  // === 6. RÁMY OKEN A DVEŘÍ ===
  const frameItems = [];
  frameItems.push({
    name: 'Rám okna levá stěna',
    dim: `${cm(CONFIG.SIDE_WIN_W)} × ${cm(CONFIG.SIDE_WIN_H)} cm`,
    qty: 1,
    note: 'S křížovým rámem'
  });
  frameItems.push({
    name: 'Rám okna pravá stěna',
    dim: `${cm(CONFIG.SIDE_WIN_W)} × ${cm(CONFIG.SIDE_WIN_H)} cm`,
    qty: 1,
    note: 'S křížovým rámem'
  });
  frameItems.push({
    name: 'Rám okna přední stěna',
    dim: `${cm(CONFIG.FRONT_WIN_W)} × ${cm(CONFIG.FRONT_WIN_H)} cm`,
    qty: 1,
    note: 'Sklo'
  });
  frameItems.push({
    name: 'Posuvné dveře — rám',
    dim: `${cm(CONFIG.DOOR_W)} × ${cm(CONFIG.DOOR_H)} cm`,
    qty: 1,
    note: 'Posuvné na liště'
  });
  sections.push({ title: 'Rámy oken a dveří', color: COLORS.frame, items: frameItems });

  // === 7. STŘECHA ===
  const roofLen = Math.sqrt(CONFIG.D * CONFIG.D + roofDrop * roofDrop) + CONFIG.ROOF_OVERHANG * 2;
  const roofW = CONFIG.W + CONFIG.ROOF_OVERHANG * 2;
  const roofAngle = Math.round(Math.atan2(roofDrop, CONFIG.D) * 180 / Math.PI);
  const roofItems = [];
  roofItems.push({
    name: 'Střešní plášť (pultová)',
    dim: `${cm(roofW)} × ${cm(roofLen)} cm, tl. 6 cm`,
    qty: 1,
    note: `Plocha ${area(roofW, roofLen)} m². Sklon ${roofAngle}°`
  });
  roofItems.push({
    name: 'Okapová lišta (přední)',
    dim: `${cm(roofW + 0.08)} × 4 × 4 cm`,
    qty: 1,
    note: 'Fascie vpředu'
  });
  roofItems.push({
    name: 'Okapová lišta (zadní)',
    dim: `${cm(roofW + 0.08)} × 4 × 4 cm`,
    qty: 1,
    note: 'Fascie vzadu'
  });
  roofItems.push({
    name: 'Vergeboard (boční)',
    dim: `4 × 9 × ${cm(roofLen)} cm`,
    qty: 2,
    note: 'Levý + pravý okraj střechy'
  });
  sections.push({ title: 'Střecha', color: COLORS.roof, items: roofItems });

  // === RENDER HTML ===
  let html = '';

  const totalBeams = 2 + 2 + 1 + 3 + 1 + 1 + 2; // podlahové + vaznice
  const totalWallArea = area(CONFIG.W, CONFIG.H_BACK)
    + area(CONFIG.D, CONFIG.H_FRONT) * 2
    + area(CONFIG.W, CONFIG.H_FRONT);
  html += `<div class="mat-summary">
    <h3>Souhrn materiálu</h3>
    <div class="mat-summary-grid">
      <div class="mat-summary-item"><span class="label">Sloupky KVH</span><span class="value">4 ks</span></div>
      <div class="mat-summary-item"><span class="label">Trámy a nosníky</span><span class="value">${totalBeams} ks</span></div>
      <div class="mat-summary-item"><span class="label">Plocha podlahy</span><span class="value">${area(CONFIG.W, CONFIG.D)} m²</span></div>
      <div class="mat-summary-item"><span class="label">Plocha stěn (palubky)</span><span class="value">~${m1(totalWallArea)} m²</span></div>
      <div class="mat-summary-item"><span class="label">Plocha střechy</span><span class="value">${area(roofW, roofLen)} m²</span></div>
      <div class="mat-summary-item"><span class="label">Betonové patky</span><span class="value">4 ks</span></div>
    </div>
  </div>`;

  sections.forEach(sec => {
    const totalQty = sec.items.reduce((s, i) => s + i.qty, 0);
    let matInfo = '';
    if (sec.material || sec.link) {
      matInfo = '<div class="mat-section-info">';
      if (sec.material) matInfo += `<span class="mat-material">${sec.material}</span>`;
      if (sec.link) matInfo += `<a class="mat-link" href="${sec.link.url}" target="_blank">${sec.link.label}</a>`;
      matInfo += '</div>';
    }
    html += `<div class="mat-section">
      <div class="mat-section-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="mat-section-dot" style="background:${sec.color}"></div>
        <span class="mat-section-title">${sec.title}</span>
        <span class="mat-section-count">${totalQty} ks</span>
        <span class="mat-section-toggle">▼</span>
      </div>
      ${matInfo}
      <table class="mat-table">
        <tr><th>Položka</th><th>Rozměr</th><th style="text-align:center">Ks</th><th>Poznámka</th></tr>
        ${sec.items.map(it => `<tr>
          <td>${it.name}</td>
          <td class="dim">${it.dim}</td>
          <td class="qty">${it.qty}</td>
          <td class="note">${it.note}</td>
        </tr>`).join('')}
      </table>
    </div>`;
  });

  return html;
}
