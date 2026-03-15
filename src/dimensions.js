// ============================================================
// 2D Koty — canvas overlay (přízemní verze)
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

  function ws(wx, wy, wz) {
    const v = new THREE.Vector3(wx, wy, wz != null ? wz : 0);
    v.project(activeCamera);
    return { x: (v.x + 1) / 2 * cv.width, y: (1 - v.y) / 2 * cv.height };
  }

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

  function dimLineH(a, b, baseAY, baseBY, dimY) {
    var leftX = Math.min(a.x, b.x);
    var rightX = Math.max(a.x, b.x);
    var extDir = dimY > Math.max(baseAY, baseBY) ? 1 : -1;
    ctx.strokeStyle = DIM_COLOR_LIGHT;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(a.x, baseAY); ctx.lineTo(a.x, dimY + extDir * EXT_OVERSHOOT); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x, baseBY); ctx.lineTo(b.x, dimY + extDir * EXT_OVERSHOOT); ctx.stroke();
    ctx.strokeStyle = DIM_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(a.x, dimY); ctx.lineTo(b.x, dimY); ctx.stroke();
    drawArrow(leftX, dimY, 0);
    drawArrow(rightX, dimY, Math.PI);
  }

  function dimLineV(a, b, baseAX, baseBX, dimX) {
    var topY = Math.min(a.y, b.y);
    var botY = Math.max(a.y, b.y);
    var extDir = dimX > Math.max(baseAX, baseBX) ? 1 : -1;
    ctx.strokeStyle = DIM_COLOR_LIGHT;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(baseAX, a.y); ctx.lineTo(dimX + extDir * EXT_OVERSHOOT, a.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(baseBX, b.y); ctx.lineTo(dimX + extDir * EXT_OVERSHOOT, b.y); ctx.stroke();
    ctx.strokeStyle = DIM_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(dimX, a.y); ctx.lineTo(dimX, b.y); ctx.stroke();
    drawArrow(dimX, topY, -Math.PI / 2);
    drawArrow(dimX, botY, Math.PI / 2);
  }

  var hw = CONFIG.W / 2, hd = CONFIG.D / 2;
  var hx = CONFIG.HOUSE_X;

  // ---- PUDORYS ----
  if (view === 'floor1') {
    var tl = ws(hx-hw, 0, hd);
    var tr = ws(hx+hw, 0, hd);
    var bl = ws(hx-hw, 0, -hd);
    var br = ws(hx+hw, 0, -hd);

    dimLineH(bl, br, tl.y, tr.y, tl.y + ROW2);
    drawDimText((CONFIG.W * 100 | 0) + ' cm', (bl.x + br.x) / 2, tl.y + ROW2, false);

    dimLineV(br, tr, br.x, tr.x, br.x + ROW2);
    drawDimText((CONFIG.D * 100 | 0) + ' cm', br.x + ROW2, (br.y + tr.y) / 2, true);

    drawAreaLabel('DOMEK — 310 x 242 cm', (tl.x + tr.x) / 2, (tl.y + bl.y) / 2, null);
  }

  // ---- NARYS ZEPREDU ----
  else if (view === 'front') {
    var bl = ws(hx-hw, 0, -hd);
    var br = ws(hx+hw, 0, -hd);
    var tlTop = ws(hx-hw, CONFIG.H_FRONT, -hd);
    var tlRoof = ws(hx-hw, CONFIG.H_ROOF_FRONT, -hd);

    dimLineH(bl, br, bl.y, br.y, bl.y + ROW1);
    drawDimText((CONFIG.W * 100 | 0) + ' cm', (bl.x + br.x) / 2, bl.y + ROW1, false);

    // Výška stěny
    dimLineV(bl, tlTop, bl.x, tlTop.x, bl.x - ROW1);
    drawDimText((CONFIG.H_FRONT * 100 | 0) + ' cm', bl.x - ROW1, (bl.y + tlTop.y) / 2, true);

    // Výška střechy
    dimLineV(bl, tlRoof, bl.x, tlRoof.x, bl.x - ROW2);
    drawDimText((CONFIG.H_ROOF_FRONT * 100 | 0) + ' cm', bl.x - ROW2, (bl.y + tlRoof.y) / 2, true);

    // Popisky
    var doorX = hx + CONFIG.DOOR_OFFSET_X;
    var doorBot = ws(doorX, 0, -hd);
    var doorTop = ws(doorX, CONFIG.DOOR_H, -hd);
    drawAreaLabel('dvere ' + (CONFIG.DOOR_W * 100 | 0) + 'x' + (CONFIG.DOOR_H * 100 | 0), doorBot.x, (doorBot.y + doorTop.y) / 2, null);
  }

  // ---- NARYS Z BOKU ----
  else if (view === 'side') {
    var frontBot = ws(hx+hw, 0, -hd);
    var backBot = ws(hx+hw, 0, hd);
    var frontTop = ws(hx+hw, CONFIG.H_FRONT, -hd);
    var backTop = ws(hx+hw, CONFIG.H_BACK, hd);
    var frontRoof = ws(hx+hw, CONFIG.H_ROOF_FRONT, -hd);

    var leftBot = frontBot.x < backBot.x ? frontBot : backBot;
    var rightBot = frontBot.x < backBot.x ? backBot : frontBot;

    // Hloubka (dole)
    var baseY = Math.max(frontBot.y, backBot.y);
    dimLineH(frontBot, backBot, frontBot.y, backBot.y, baseY + ROW1);
    drawDimText((CONFIG.D * 100 | 0) + ' cm', (frontBot.x + backBot.x) / 2, baseY + ROW1, false);

    // Výška přední stěny (vlevo)
    dimLineV(leftBot, frontTop, leftBot.x, frontTop.x, leftBot.x - ROW1);
    drawDimText((CONFIG.H_FRONT * 100 | 0) + ' cm', leftBot.x - ROW1, (leftBot.y + frontTop.y) / 2, true);

    // Výška střechy vpředu
    dimLineV(leftBot, frontRoof, leftBot.x, frontRoof.x, leftBot.x - ROW2);
    drawDimText((CONFIG.H_ROOF_FRONT * 100 | 0) + ' cm', leftBot.x - ROW2, (leftBot.y + frontRoof.y) / 2, true);

    // Výška zadní stěny (vpravo)
    dimLineV(rightBot, backTop, rightBot.x, backTop.x, rightBot.x + ROW1);
    drawDimText((CONFIG.H_BACK * 100 | 0) + ' cm', rightBot.x + ROW1, (rightBot.y + backTop.y) / 2, true);
  }

  // ---- REZ ----
  else if (view === 'section') {
    var frontBot = ws(hx, 0, -hd);
    var backBot = ws(hx, 0, hd);
    var frontTop = ws(hx, CONFIG.H_FRONT, -hd);
    var backTop = ws(hx, CONFIG.H_BACK, hd);
    var frontRoof = ws(hx, CONFIG.H_ROOF_FRONT, -hd);

    var leftBot = frontBot.x < backBot.x ? frontBot : backBot;
    var rightBot = frontBot.x < backBot.x ? backBot : frontBot;

    var baseY = Math.max(frontBot.y, backBot.y);
    dimLineH(frontBot, backBot, frontBot.y, backBot.y, baseY + ROW1);
    drawDimText((CONFIG.D * 100 | 0) + ' cm', (frontBot.x + backBot.x) / 2, baseY + ROW1, false);

    dimLineV(leftBot, frontTop, leftBot.x, frontTop.x, leftBot.x - ROW1);
    drawDimText((CONFIG.H_FRONT * 100 | 0) + ' cm', leftBot.x - ROW1, (leftBot.y + frontTop.y) / 2, true);

    dimLineV(leftBot, frontRoof, leftBot.x, frontRoof.x, leftBot.x - ROW2);
    drawDimText((CONFIG.H_ROOF_FRONT * 100 | 0) + ' cm', leftBot.x - ROW2, (leftBot.y + frontRoof.y) / 2, true);

    ctx.save();
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillStyle = LABEL_COLOR;
    ctx.fillText('REZ — pohled zprava (X=0)', 20, 30);
    ctx.fillText('Vyska predni steny: ' + (CONFIG.H_FRONT * 100 | 0) + ' cm', 20, 50);
    ctx.fillText('Vyska zadni steny: ' + (CONFIG.H_BACK * 100 | 0) + ' cm', 20, 70);
    ctx.restore();
  }
}
