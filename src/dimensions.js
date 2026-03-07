// ============================================================
// 3D Dimensions — rozmerove cary ve 3D scene (toggle)
// ============================================================
function makeDimLabel(text) {
  const c = document.createElement('canvas');
  c.width = 192; c.height = 48;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(20,25,15,0.85)';
  if (ctx.roundRect) ctx.roundRect(2, 2, c.width - 4, c.height - 4, 4);
  else ctx.fillRect(2, 2, c.width - 4, c.height - 4);
  ctx.fill();
  ctx.strokeStyle = '#5a6a4a';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#e8dcc0';
  ctx.font = 'bold 16px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, c.width / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.8, 0.2, 1);
  return sprite;
}

function makeDimLine(p1, p2, offset, label) {
  const group = new THREE.Group();

  const o1 = p1.clone().add(offset);
  const o2 = p2.clone().add(offset);

  // Extension lines
  const extOffset = offset.clone().normalize().multiplyScalar(0.05);
  const extMat = new THREE.LineBasicMaterial({ color: 0x8a9a72, transparent: true, opacity: 0.5 });
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1.clone().add(extOffset), o1]), extMat));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p2.clone().add(extOffset), o2]), extMat));

  // Main dimension line
  const mainMat = new THREE.LineBasicMaterial({ color: 0x8a9a72 });
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([o1, o2]), mainMat));

  // Ticks at ends
  const tickLen = 0.06;
  const perp = offset.clone().normalize().multiplyScalar(tickLen);
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([o1.clone().add(perp), o1.clone().sub(perp)]), mainMat));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([o2.clone().add(perp), o2.clone().sub(perp)]), mainMat));

  // Label at midpoint
  const lbl = makeDimLabel(label);
  lbl.position.copy(o1.clone().add(o2).multiplyScalar(0.5));
  group.add(lbl);

  return group;
}

function createDimensions() {
  const g = new THREE.Group();
  g.name = 'dimensions';
  const hw = CONFIG.W / 2, hd = CONFIG.D / 2;

  // Celkova sirka (dole, predni strana)
  g.add(makeDimLine(
    new THREE.Vector3(-hw, 0, -hd),
    new THREE.Vector3(hw, 0, -hd),
    new THREE.Vector3(0, 0, -0.4),
    '310 cm'
  ));

  // Celkova hloubka (dole, prava strana)
  g.add(makeDimLine(
    new THREE.Vector3(hw, 0, -hd),
    new THREE.Vector3(hw, 0, hd),
    new THREE.Vector3(0.4, 0, 0),
    '242 cm'
  ));

  // Vyska 1. patra (posunuto dal, aby neprocházelo stitem)
  g.add(makeDimLine(
    new THREE.Vector3(-hw, 0, -hd),
    new THREE.Vector3(-hw, CONFIG.H1, -hd),
    new THREE.Vector3(-0.5, 0, -0.5),
    '150 cm'
  ));

  // Celkova vyska po okap (posunuto dal)
  g.add(makeDimLine(
    new THREE.Vector3(-hw, 0, -hd),
    new THREE.Vector3(-hw, CONFIG.H, -hd),
    new THREE.Vector3(-1.0, 0, -1.0),
    '300 cm'
  ));

  // Prevyseni strechy
  g.add(makeDimLine(
    new THREE.Vector3(-hw, CONFIG.H, hd),
    new THREE.Vector3(-hw, CONFIG.H + CONFIG.ROOF_PEAK, hd),
    new THREE.Vector3(-0.9, 0, 0.3),
    '+45 cm'
  ));

  // Terasa vs kabina (prava strana, uroven 2. patra)
  const divZ = -hd + CONFIG.TD;
  g.add(makeDimLine(
    new THREE.Vector3(hw, CONFIG.H1, -hd),
    new THREE.Vector3(hw, CONFIG.H1, divZ),
    new THREE.Vector3(0.5, 0, 0),
    '70 cm'
  ));
  g.add(makeDimLine(
    new THREE.Vector3(hw, CONFIG.H1, divZ),
    new THREE.Vector3(hw, CONFIG.H1, hd),
    new THREE.Vector3(0.5, 0, 0),
    '172 cm'
  ));



  g.visible = false;
  return g;
}

// ============================================================
// 2D Koty — canvas overlay se sipkami a extension lines
// ============================================================
function drawDimensions(view) {
  const cv = document.getElementById('dim-canvas');
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);

  const DIM_COLOR = '#8a9a72';
  const DIM_COLOR_LIGHT = 'rgba(138,154,114,0.4)';
  const TEXT_COLOR = '#d4c9a8';
  const TEXT_BG = 'rgba(26,31,22,0.85)';
  const LABEL_COLOR = 'rgba(212,201,168,0.6)';
  const ARROW_SIZE = 6;
  const EXT_OVERSHOOT = 4;
  const ROW1 = 30;
  const ROW2 = 60;

  // World-to-screen
  function ws(wx, wy, wz) {
    const v = new THREE.Vector3(wx, wy, wz != null ? wz : 0);
    v.project(activeCamera);
    return { x: (v.x + 1) / 2 * cv.width, y: (1 - v.y) / 2 * cv.height };
  }

  // Sipka (plny trojuhelnik)
  function drawArrow(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-ARROW_SIZE * 2, -ARROW_SIZE);
    ctx.lineTo(-ARROW_SIZE * 2, ARROW_SIZE);
    ctx.closePath();
    ctx.fillStyle = DIM_COLOR;
    ctx.fill();
    ctx.restore();
  }

  // Text s pozadim
  function drawDimText(text, x, y, vertical) {
    ctx.save();
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    var tw = ctx.measureText(text).width;
    var th = 14;
    var px = 6, py = 3;

    if (vertical) {
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = TEXT_BG;
      ctx.fillRect(-tw / 2 - px, -th / 2 - py, tw + px * 2, th + py * 2);
      ctx.fillStyle = TEXT_COLOR;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
    } else {
      ctx.fillStyle = TEXT_BG;
      ctx.fillRect(x - tw / 2 - px, y - th / 2 - py, tw + px * 2, th + py * 2);
      ctx.fillStyle = TEXT_COLOR;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
    }
    ctx.restore();
  }

  // Popisek (uvnitr plochy, jemnejsi)
  function drawAreaLabel(text, wx, wy, wz) {
    var p = ws(wx, wy, wz);
    ctx.save();
    ctx.font = '13px Segoe UI, sans-serif';
    ctx.fillStyle = LABEL_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, p.x, p.y);
    ctx.restore();
  }

  // Horizontalni kota se sipkami a extension lines
  // a, b = screen body (zacatek, konec), baseY = Y zakladny odkud vedou ext lines
  // dimY = Y kde bude kotova cara
  function dimLineH(a, b, baseAY, baseBY, dimY) {
    var leftX = Math.min(a.x, b.x);
    var rightX = Math.max(a.x, b.x);
    var extDir = dimY > Math.max(baseAY, baseBY) ? 1 : -1;

    ctx.strokeStyle = DIM_COLOR_LIGHT;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Extension lines
    ctx.beginPath(); ctx.moveTo(a.x, baseAY); ctx.lineTo(a.x, dimY + extDir * EXT_OVERSHOOT); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x, baseBY); ctx.lineTo(b.x, dimY + extDir * EXT_OVERSHOOT); ctx.stroke();

    // Dimension line
    ctx.strokeStyle = DIM_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(a.x, dimY); ctx.lineTo(b.x, dimY); ctx.stroke();

    // Sipky
    drawArrow(leftX, dimY, 0);
    drawArrow(rightX, dimY, Math.PI);
  }

  // Vertikalni kota se sipkami a extension lines
  // a, b = screen body (zacatek, konec), baseX = X zakladny odkud vedou ext lines
  // dimX = X kde bude kotova cara
  function dimLineV(a, b, baseAX, baseBX, dimX) {
    var topY = Math.min(a.y, b.y);
    var botY = Math.max(a.y, b.y);
    var extDir = dimX > Math.max(baseAX, baseBX) ? 1 : -1;

    ctx.strokeStyle = DIM_COLOR_LIGHT;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Extension lines
    ctx.beginPath(); ctx.moveTo(baseAX, a.y); ctx.lineTo(dimX + extDir * EXT_OVERSHOOT, a.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(baseBX, b.y); ctx.lineTo(dimX + extDir * EXT_OVERSHOOT, b.y); ctx.stroke();

    // Dimension line
    ctx.strokeStyle = DIM_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(dimX, a.y); ctx.lineTo(dimX, b.y); ctx.stroke();

    // Sipky
    drawArrow(dimX, topY, -Math.PI / 2);
    drawArrow(dimX, botY, Math.PI / 2);
  }

  var hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  var divZ = CONFIG.divZ;

  // ---- PUDORYS 1. PATRO ----
  if (view === 'floor1') {
    var tl = ws(-hw, 0, hd);   // top-left (zadni-levy)
    var tr = ws(hw, 0, hd);    // top-right (zadni-pravy)
    var bl = ws(-hw, 0, -hd);  // bottom-left (predni-levy)
    var br = ws(hw, 0, -hd);   // bottom-right (predni-pravy)

    // Sirka 310 cm (dole)
    dimLineH(bl, br, bl.y, br.y, bl.y + ROW2);
    drawDimText('310 cm', (bl.x + br.x) / 2, bl.y + ROW2, false);

    // Hloubka 242 cm (vpravo)
    dimLineV(br, tr, br.x, tr.x, br.x + ROW2);
    drawDimText('242 cm', br.x + ROW2, (br.y + tr.y) / 2, true);

    // Popisek
    drawAreaLabel('PRIZEMI — otevreno vpredu a vlevo', (tl.x + br.x) / 2, (tl.y + bl.y) / 2, null);
  }

  // ---- PUDORYS 2. PATRO ----
  else if (view === 'floor2') {
    var tl = ws(-hw, 0, hd);
    var tr = ws(hw, 0, hd);
    var bl = ws(-hw, 0, -hd);
    var br = ws(hw, 0, -hd);
    var divR = ws(hw, 0, divZ);   // delici cara vpravo
    var divL = ws(-hw, 0, divZ);  // delici cara vlevo

    // Sirka 310 cm (dole)
    dimLineH(bl, br, bl.y, br.y, bl.y + ROW2);
    drawDimText('310 cm', (bl.x + br.x) / 2, bl.y + ROW2, false);

    // Hloubka celkova 242 cm (vpravo, rada 2)
    dimLineV(br, tr, br.x, tr.x, br.x + ROW2);
    drawDimText('242 cm', br.x + ROW2, (br.y + tr.y) / 2, true);

    // Terasa 70 cm (vpravo, rada 1)
    dimLineV(br, divR, br.x, divR.x, br.x + ROW1);
    drawDimText('70 cm', br.x + ROW1, (br.y + divR.y) / 2, true);

    // Kabina 172 cm (vpravo, rada 1)
    dimLineV(divR, tr, divR.x, tr.x, divR.x + ROW1);
    drawDimText('172 cm', divR.x + ROW1, (divR.y + tr.y) / 2, true);

    // Popisky uvnitr
    drawAreaLabel('TERASA', (bl.x + br.x) / 2, (bl.y + divR.y) / 2, null);
    drawAreaLabel('KABINA', (tl.x + tr.x) / 2, (divL.y + tl.y) / 2, null);
  }

  // ---- NARYS ZEPREDU ----
  else if (view === 'front') {
    var bl = ws(-hw, 0, -hd);
    var br = ws(hw, 0, -hd);
    var tlMid = ws(-hw, CONFIG.H1, -hd);
    var tlTop = ws(-hw, CONFIG.H, -hd);
    var tlPeak = ws(-hw, CONFIG.H + CONFIG.ROOF_PEAK, -hd);

    // Sirka 310 cm (dole)
    dimLineH(bl, br, bl.y, br.y, bl.y + ROW1);
    drawDimText('310 cm', (bl.x + br.x) / 2, bl.y + ROW1, false);

    // 1. patro 150 cm (vlevo, rada 1)
    dimLineV(bl, tlMid, bl.x, tlMid.x, bl.x - ROW1);
    drawDimText('150 cm', bl.x - ROW1, (bl.y + tlMid.y) / 2, true);

    // 2. patro 150 cm (vlevo, rada 1)
    dimLineV(tlMid, tlTop, tlMid.x, tlTop.x, tlMid.x - ROW1);
    drawDimText('150 cm', tlMid.x - ROW1, (tlMid.y + tlTop.y) / 2, true);

    // Celkova 300 cm (vlevo, rada 2)
    dimLineV(bl, tlTop, bl.x, tlTop.x, bl.x - ROW2);
    drawDimText('300 cm', bl.x - ROW2, (bl.y + tlTop.y) / 2, true);

    // Hreben +45 cm (vlevo, rada 2)
    dimLineV(tlTop, tlPeak, tlTop.x, tlPeak.x, tlTop.x - ROW2);
    drawDimText('+45 cm', tlTop.x - ROW2, (tlTop.y + tlPeak.y) / 2, true);

    // Popisky
    drawAreaLabel('PRIZEMI (otevreno)', (bl.x + br.x) / 2, (bl.y + tlMid.y) / 2, null);
    drawAreaLabel('2. PATRO', (bl.x + br.x) / 2, (tlMid.y + tlTop.y) / 2, null);
  }

  // ---- NARYS Z BOKU ----
  else if (view === 'side') {
    // Kamera na +X, screen X = -Z (predni vlevo, zadni vpravo? nebo naopak)
    // Musime pouzit ws a zjistit skutecne screen pozice
    var frontBot = ws(hw, 0, -hd);
    var backBot = ws(hw, 0, hd);
    var frontMid = ws(hw, CONFIG.H1, -hd);
    var backMid = ws(hw, CONFIG.H1, hd);
    var frontTop = ws(hw, CONFIG.H, -hd);
    var backTop = ws(hw, CONFIG.H, hd);
    var backPeak = ws(hw, CONFIG.H + CONFIG.ROOF_PEAK, hd);
    var divBot = ws(hw, 0, divZ);
    var divMid = ws(hw, CONFIG.H1, divZ);

    // Zjistime ktery je screen vlevo
    var leftBot = frontBot.x < backBot.x ? frontBot : backBot;
    var rightBot = frontBot.x < backBot.x ? backBot : frontBot;
    var leftMid = frontBot.x < backBot.x ? frontMid : backMid;
    var rightMid = frontBot.x < backBot.x ? backMid : frontMid;
    var leftTop = frontBot.x < backBot.x ? frontTop : backTop;

    // Terasa 70 cm (dole, rada 1)
    var baseY = Math.max(frontBot.y, divBot.y, backBot.y);
    var dimY1 = baseY + ROW1;

    dimLineH(frontBot, divBot, frontBot.y, divBot.y, dimY1);
    drawDimText('70 cm', (frontBot.x + divBot.x) / 2, dimY1, false);

    // Kabina 172 cm (dole, rada 1)
    dimLineH(divBot, backBot, divBot.y, backBot.y, dimY1);
    drawDimText('172 cm', (divBot.x + backBot.x) / 2, dimY1, false);

    // Celkova hloubka 242 cm (dole, rada 2)
    var dimY2 = baseY + ROW2;
    // Extension lines prodlouzit z rady 1
    dimLineH(frontBot, backBot, frontBot.y, backBot.y, dimY2);
    drawDimText('242 cm', (frontBot.x + backBot.x) / 2, dimY2, false);

    // Vysky (vlevo)
    // 1. patro 150 cm
    dimLineV(leftBot, leftMid, leftBot.x, leftMid.x, leftBot.x - ROW1);
    drawDimText('150 cm', leftBot.x - ROW1, (leftBot.y + leftMid.y) / 2, true);

    // 2. patro 150 cm
    dimLineV(leftMid, leftTop, leftMid.x, leftTop.x, leftMid.x - ROW1);
    drawDimText('150 cm', leftMid.x - ROW1, (leftMid.y + leftTop.y) / 2, true);

    // Celkova 300 cm
    dimLineV(leftBot, leftTop, leftBot.x, leftTop.x, leftBot.x - ROW2);
    drawDimText('300 cm', leftBot.x - ROW2, (leftBot.y + leftTop.y) / 2, true);

    // Hreben +45 cm
    var leftPeak = frontBot.x < backBot.x ? ws(hw, CONFIG.H + CONFIG.ROOF_PEAK, -hd) : backPeak;
    // Hreben je vzadu, takze pouzijeme backTop a backPeak
    dimLineV(backTop, backPeak, backTop.x, backPeak.x, Math.max(backTop.x, backPeak.x) + ROW1);
    drawDimText('+45 cm', Math.max(backTop.x, backPeak.x) + ROW1, (backTop.y + backPeak.y) / 2, true);

    // Popisky
    drawAreaLabel('PRIZEMI', (leftBot.x + rightBot.x) / 2, (leftBot.y + leftMid.y) / 2, null);
    drawAreaLabel('2. PATRO', (leftBot.x + rightBot.x) / 2, (leftMid.y + leftTop.y) / 2, null);
  }

  // ---- REZ ----
  else if (view === 'section') {
    var frontBot = ws(0, 0, -hd);
    var backBot = ws(0, 0, hd);
    var frontMid = ws(0, CONFIG.H1, -hd);
    var backMid = ws(0, CONFIG.H1, hd);
    var frontTop = ws(0, CONFIG.H, -hd);
    var backTop = ws(0, CONFIG.H, hd);
    var backPeak = ws(0, CONFIG.H + CONFIG.ROOF_PEAK, hd);
    var divBot = ws(0, 0, divZ);

    var leftBot = frontBot.x < backBot.x ? frontBot : backBot;
    var rightBot = frontBot.x < backBot.x ? backBot : frontBot;
    var leftMid = frontBot.x < backBot.x ? frontMid : backMid;
    var leftTop = frontBot.x < backBot.x ? frontTop : backTop;

    // Terasa + kabina (dole, rada 1)
    var baseY = Math.max(frontBot.y, divBot.y, backBot.y);
    var dimY1 = baseY + ROW1;

    dimLineH(frontBot, divBot, frontBot.y, divBot.y, dimY1);
    drawDimText('70 cm', (frontBot.x + divBot.x) / 2, dimY1, false);

    dimLineH(divBot, backBot, divBot.y, backBot.y, dimY1);
    drawDimText('172 cm', (divBot.x + backBot.x) / 2, dimY1, false);

    // Celkova hloubka (dole, rada 2)
    var dimY2 = baseY + ROW2;
    dimLineH(frontBot, backBot, frontBot.y, backBot.y, dimY2);
    drawDimText('242 cm', (frontBot.x + backBot.x) / 2, dimY2, false);

    // Vysky (vlevo)
    dimLineV(leftBot, leftMid, leftBot.x, leftMid.x, leftBot.x - ROW1);
    drawDimText('150 cm', leftBot.x - ROW1, (leftBot.y + leftMid.y) / 2, true);

    dimLineV(leftMid, leftTop, leftMid.x, leftTop.x, leftMid.x - ROW1);
    drawDimText('150 cm', leftMid.x - ROW1, (leftMid.y + leftTop.y) / 2, true);

    dimLineV(leftBot, leftTop, leftBot.x, leftTop.x, leftBot.x - ROW2);
    drawDimText('300 cm', leftBot.x - ROW2, (leftBot.y + leftTop.y) / 2, true);

    dimLineV(backTop, backPeak, backTop.x, backPeak.x, Math.max(backTop.x, backPeak.x) + ROW1);
    drawDimText('+45 cm', Math.max(backTop.x, backPeak.x) + ROW1, (backTop.y + backPeak.y) / 2, true);

    // Info text
    ctx.save();
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillStyle = LABEL_COLOR;
    ctx.fillText('REZ — pohled zprava (X=0)', 20, 30);
    ctx.fillText('Podlaha 2. patra: ' + (CONFIG.H1 * 100 | 0) + ' cm', 20, 50);
    ctx.fillText('Vyska hrebene: ' + ((CONFIG.H + CONFIG.ROOF_PEAK) * 100 | 0) + ' cm', 20, 70);
    ctx.restore();
  }
}
