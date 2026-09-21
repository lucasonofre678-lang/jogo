// In-world HUD. Drawn on the canvas so the game reads as a game instead of a
// web dashboard: small icons, short bars, and secondary readouts that only
// appear when they actually matter.

const HUD_INK = '#ded6c0';
const HUD_DIM = 'rgba(222,214,192,0.55)';

function hudPlate(ctx, x, y, w, h, alpha = 0.55) {
  ctx.fillStyle = `rgba(10,12,13,${alpha})`;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(226,216,186,0.10)';
  ctx.fillRect(x, y, w, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x, y + h - 1, w, 1);
}

function hudBar(ctx, x, y, w, h, ratio, color, opts = {}) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x, y, w, h);
  const fill = Math.max(0, Math.min(1, ratio));
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.round(w * fill), h);
  if (opts.tick != null) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x + Math.round(w * opts.tick), y - 1, 1, h + 2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(x, y, Math.round(w * fill), 1);
}

function hudIcon(ctx, key, x, y, size = 14, alpha = 1) {
  const img = ASSETS.ready(`ui:${key}`) || ASSETS.ready(key);
  if (!img) return;
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, x, y, size, size);
  ctx.globalAlpha = 1;
}

class HUD {
  constructor() {
    this.pulse = 0;
    this.noiseFade = 0;
    this.warnFade = 0;
    this.lastWarning = '';
  }

  update(dt) {
    this.pulse += dt;
  }

  // state: { survival, injuries, lore, danger, weather, player, vehicle, weight,
  //          maxWeight, threat, sprinting, clothing }
  draw(ctx, s, dt) {
    this.update(dt);
    const H = ctx.canvas.height;
    const W = ctx.canvas.width;

    this.drawVitals(ctx, s, 16, H - 92);
    this.drawSecondary(ctx, s, 16, H - 116);
    this.drawThreat(ctx, s, W - 16, H - 92);
    this.drawObjectives(ctx, s, W - 16, 22);
    this.drawStance(ctx, s, 16, H - 132);
    this.drawWeapon(ctx, s, W - 16, H - 150);
    if (s.vehicle) this.drawDriving(ctx, s.vehicle, W / 2, H - 96);
    this.drawAlerts(ctx, s, W / 2, 74);
  }

  drawVitals(ctx, s, x, y) {
    const rows = [
      ['health', s.survival.health / s.survival.maxHealth, '#b8574f', s.survival.health],
      ['hunger', s.survival.hunger / 100, '#8d9a5c', s.survival.hunger],
      ['thirst', s.survival.thirst / 100, '#5f8ba3', s.survival.thirst],
      ['energy', s.survival.energy / s.survival.maxEnergy, '#b59a52', s.survival.energy]
    ];

    hudPlate(ctx, x - 6, y - 8, 130, 84, 0.42);
    ctx.font = '600 9px "Courier New", monospace';

    rows.forEach((row, i) => {
      const [icon, ratio, color, value] = row;
      const ry = y + i * 18;
      const low = ratio < 0.25 || (icon === 'energy' && s.staminaLocked);
      hudIcon(ctx, icon, x, ry, 13, low ? 1 : 0.85);
      hudBar(ctx, x + 18, ry + 4, 74, 5, ratio, low ? this.flash(color) : color);
      if (low) {
        ctx.fillStyle = color;
        ctx.fillText(String(Math.ceil(value)), x + 98, ry + 9);
      }
    });
  }

  flash(color) {
    return Math.sin(this.pulse * 7) > 0 ? color : 'rgba(228,206,170,0.9)';
  }

  // Sleep, body temperature, wetness and contamination only show up when the
  // player actually needs to think about them.
  drawSecondary(ctx, s, x, y) {
    const chips = [];
    const sv = s.survival;
    if (sv.sleep < 55) chips.push(['sleep', sv.sleep / 100, '#8b93b0', `${Math.round(sv.sleep)}`]);
    if (sv.bodyTemp < 36.2 || sv.bodyTemp > 37.6) {
      chips.push(['temp', Math.max(0, Math.min(1, (sv.bodyTemp - 33) / 7)), sv.bodyTemp < 36.2 ? '#6d9cb4' : '#c07a5c', `${sv.bodyTemp.toFixed(1)}°`]);
    }
    if (sv.wetness > 12) chips.push(['wet', sv.wetness / 100, '#6d9cb4', `${Math.round(sv.wetness)}%`]);
    // Stage 31: alimentação só ocupa espaço quando está boa o bastante para
    // valer a pena, ou ruim o bastante para doer.
    const nut = s.nutrition;
    if (nut && (nut.value < 45 || nut.value > 76 || nut.malaise)) {
      chips.push(['hunger', nut.value / 100, nut.malaise ? '#a2574c' : nut.state.tone, nut.malaise ? 'MAL-ESTAR' : nut.state.label]);
    }
    if (s.season?.freezing) chips.push(['temp', 1, '#7fa8c4', 'CONGELANDO']);
    if (s.lore.exposure > 1) chips.push(['exposure', s.lore.exposure / 100, '#9cb06a', `${Math.round(s.lore.exposure)}%`]);
    if (s.weight > s.maxWeight) chips.push(['nav_inventory', 1, '#c47a5c', 'PESO']);
    const bleeding = s.injuries.bleedingRate() > 0;
    if (bleeding) chips.push(['health', 1, '#b8574f', 'SANGRA']);

    if (!chips.length) return;
    ctx.font = '600 9px "Courier New", monospace';
    let cx = x - 6;
    const cy = y - 12;
    for (const [icon, ratio, color, label] of chips) {
      const w = 30 + ctx.measureText(label).width;
      hudPlate(ctx, cx, cy, w, 18, 0.5);
      hudIcon(ctx, icon, cx + 3, cy + 2, 13, 0.9);
      ctx.fillStyle = color;
      ctx.fillText(label, cx + 19, cy + 12);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(cx, cy + 16, Math.round(w * Math.min(1, ratio)), 2);
      ctx.globalAlpha = 1;
      cx += w + 5;
    }
  }

  // Up to three live goals, right-aligned so they never fight the world.
  drawObjectives(ctx, s, right, y) {
    const list = (s.objectives || []).slice(0, 3);
    if (!list.length) return;
    ctx.font = '600 9px "Courier New", monospace';

    let width = 150;
    for (const o of list) {
      width = Math.max(width, ctx.measureText(o.title).width + 24, ctx.measureText(o.text || '').width + 24);
    }
    const x = right - width;
    const h = 16 + list.length * 22;
    hudPlate(ctx, x, y, width, h, 0.4);
    ctx.fillStyle = 'rgba(198,168,94,0.75)';
    ctx.fillRect(x, y, width, 1);
    ctx.fillStyle = HUD_DIM;
    ctx.fillText('OBJETIVOS', x + 8, y + 12);

    list.forEach((o, i) => {
      const oy = y + 26 + i * 22;
      ctx.fillStyle = '#c6a85e';
      ctx.fillRect(x + 8, oy - 7, 3, 3);
      ctx.fillStyle = HUD_INK;
      ctx.fillText(o.title, x + 16, oy - 4);
      ctx.fillStyle = 'rgba(222,214,192,0.42)';
      ctx.fillText(o.text || '', x + 16, oy + 7);
    });
  }

  // Small stance readout: the player needs to know when they are quiet.
  drawStance(ctx, s, x, y) {
    if (!s.crouching && !s.sprinting) return;
    const label = s.crouching ? 'AGACHADO · SILENCIOSO' : 'CORRENDO · BARULHENTO';
    ctx.font = '600 9px "Courier New", monospace';
    const w = ctx.measureText(label).width + 16;
    hudPlate(ctx, x - 6, y, w, 16, 0.45);
    ctx.fillStyle = s.crouching ? '#8d9a5c' : '#c47a5c';
    ctx.fillText(label, x + 2, y + 11);
  }

  // Weapon readout: what is in your hands and whether it can still be used.
  drawWeapon(ctx, s, right, y) {
    const w = s.weapon;
    if (!w) return;
    ctx.font = '600 9px "Courier New", monospace';

    const status = w.kind === 'gun'
      ? `${w.loaded}/${w.magazine}   ·   ${w.reserve} na mochila`
      : w.durability != null ? `CONDIÇÃO ${Math.round(w.durability * 100)}%` : 'SEM DESGASTE';

    const width = Math.max(150, ctx.measureText(w.label.toUpperCase()).width + 24, ctx.measureText(status).width + 24);
    const x = right - width;
    hudPlate(ctx, x, y, width, 40, 0.45);

    ctx.fillStyle = w.kind === 'gun' && w.loaded === 0 ? '#c47a5c' : HUD_INK;
    ctx.fillText(w.label.toUpperCase(), x + 8, y + 15);
    ctx.fillStyle = HUD_DIM;
    ctx.fillText(status, x + 8, y + 29);

    // magazine pips read faster than a number mid-fight
    if (w.kind === 'gun' && w.magazine <= 14) {
      const pipW = Math.min(8, (width - 16) / w.magazine);
      for (let i = 0; i < w.magazine; i++) {
        ctx.fillStyle = i < w.loaded ? '#c6a85e' : 'rgba(222,214,192,0.18)';
        ctx.fillRect(x + 8 + i * pipW, y + 33, Math.max(2, pipW - 2), 3);
      }
    }

    if (w.reloading > 0) {
      const t = 1 - w.reloading;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(x, y - 10, width, 6);
      ctx.fillStyle = '#c6a85e';
      ctx.fillRect(x, y - 10, width * t, 6);
      ctx.fillStyle = HUD_DIM;
      ctx.fillText('RECARREGANDO', x + 8, y - 14);
    }
  }

  drawThreat(ctx, s, right, y) {
    const t = s.threat;
    const noise = s.danger.noiseLevel;
    ctx.font = '600 9px "Courier New", monospace';

    // noise meter fades in only while you are making some
    this.noiseFade = noise > 10 ? Math.min(1, this.noiseFade + 0.08) : Math.max(0, this.noiseFade - 0.03);
    if (this.noiseFade > 0.01) {
      const w = 94, x = right - w;
      ctx.globalAlpha = this.noiseFade;
      hudPlate(ctx, x, y + 44, w, 20, 0.45);
      hudIcon(ctx, 'noise', x + 3, y + 46, 14, 0.9);
      hudBar(ctx, x + 21, y + 51, 66, 5, noise / 100, noise > 65 ? '#c47a5c' : '#b3ab8e');
      ctx.globalAlpha = 1;
    }

    // a real siege gets its own line — the player must know to run
    if (s.siege >= 5) {
      const label = `HORDA  ×${s.siege}`;
      const w = 34 + ctx.measureText(label).width;
      const x = right - w;
      hudPlate(ctx, x, y - 12, w, 22, 0.75);
      hudIcon(ctx, 'threat', x + 4, y - 9, 16, 1);
      ctx.fillStyle = Math.sin(this.pulse * 8) > 0 ? '#d1594d' : '#e8a08a';
      ctx.fillText(label, x + 24, y + 3);
    }

    if (!t.count) return;
    const level = t.heavy || t.chasing >= 2 ? 'CRÍTICA' : t.chasing > 0 || t.stalkerChasing ? 'ALTA' : t.count >= 3 ? 'MÉDIA' : 'BAIXA';
    const color = t.heavy || t.chasing >= 2 ? '#d1594d' : t.chasing > 0 ? '#c47a5c' : t.count >= 3 ? '#c6a85e' : '#8d897c';
    const label = `${level}  ×${t.count}`;
    const w = 34 + ctx.measureText(label).width;
    const x = right - w;
    const pulse = t.chasing > 0 ? 0.55 + Math.abs(Math.sin(this.pulse * 5)) * 0.35 : 0.5;
    hudPlate(ctx, x, y + 16, w, 22, pulse * 0.7);
    hudIcon(ctx, 'threat', x + 4, y + 19, 16, t.chasing > 0 ? 1 : 0.75);
    ctx.fillStyle = color;
    ctx.fillText(label, x + 24, y + 31);
  }

  drawDriving(ctx, v, cx, y) {
    const w = 208;
    const x = Math.round(cx - w / 2);
    hudPlate(ctx, x, y, w, 46, 0.55);
    ctx.font = '700 10px "Courier New", monospace';
    ctx.fillStyle = HUD_INK;
    ctx.fillText(v.name.toUpperCase(), x + 10, y + 14);
    ctx.font = '600 9px "Courier New", monospace';
    ctx.fillStyle = HUD_DIM;
    ctx.fillText(v.engineOn ? 'MOTOR LIGADO' : 'MOTOR DESLIGADO', x + 10, y + 40);
    ctx.fillText(`${Math.abs(Math.round(v.vx * 9))} km/h`, x + 150, y + 40);

    const gauges = [
      ['COMB', v.fuel / v.maxFuel, v.fuel < v.maxFuel * 0.2 ? '#c47a5c' : '#b59a52'],
      ['BAT', v.battery / 100, v.battery < 20 ? '#c47a5c' : '#6d9cb4'],
      ['COND', v.condition / 100, v.condition < 30 ? '#c47a5c' : '#8d9a5c']
    ];
    gauges.forEach(([label, ratio, color], i) => {
      const gx = x + 10 + i * 64;
      ctx.fillStyle = HUD_DIM;
      ctx.fillText(label, gx, y + 26);
      hudBar(ctx, gx + 26, y + 20, 32, 5, ratio, color);
    });
  }

  drawAlerts(ctx, s, cx, y) {
    let message = '';
    let color = '#c47a5c';
    const sv = s.survival;
    if (sv.health < 25) { message = 'FERIMENTOS GRAVES'; color = '#d1594d'; }
    else if (s.injuries.bleedingRate() > 0.35) { message = 'SANGRAMENTO — USE UM CURATIVO'; color = '#d1594d'; }
    else if (sv.thirst < 12) { message = 'DESIDRATAÇÃO'; }
    else if (sv.hunger < 12) { message = 'FOME EXTREMA'; }
    else if (sv.bodyTemp < 34.8) { message = 'HIPOTERMIA'; color = '#6d9cb4'; }
    else if (s.lore.exposure > 70) { message = 'CONTAMINAÇÃO ALTA'; color = '#9cb06a'; }
    else if (sv.sleep < 12) { message = 'EXAUSTÃO'; }

    this.warnFade = message ? Math.min(1, this.warnFade + 0.06) : Math.max(0, this.warnFade - 0.05);
    if (message) this.lastWarning = message;
    if (this.warnFade <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = this.warnFade * (0.65 + Math.abs(Math.sin(this.pulse * 3)) * 0.35);
    ctx.font = '700 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    const text = this.lastWarning;
    const w = ctx.measureText(text).width + 28;
    hudPlate(ctx, cx - w / 2, y - 14, w, 20, 0.5);
    ctx.fillStyle = color;
    ctx.fillText(text, cx, y);
    ctx.restore();
    ctx.textAlign = 'left';
  }
}
