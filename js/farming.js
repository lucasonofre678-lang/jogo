// Stage 31 — horta, irrigação e estufa.
//
// A base precisa poder se sustentar no longo prazo sem virar um simulador de
// fazenda. Um canteiro tem três números (crescimento, água, saúde), a chuva
// rega sozinha, a estufa resolve o frio e um morador com função de horta cuida
// da plantação enquanto o jogador está longe.

const CROP_DEFS = {
  potato: {
    id: 'potato', name: 'Batata', seed: 'seed_potato', item: 'potato',
    growHours: 68, yield: [3, 5], seedReturn: [1, 2],
    thirst: 1.0, coldFloor: 2, heatCeiling: 34, color: '#6f8a4a', flower: '#b5a05c',
    description: 'Lenta e generosa. A base de qualquer despensa.'
  },
  corn: {
    id: 'corn', name: 'Milho', seed: 'seed_corn', item: 'corn',
    growHours: 60, yield: [2, 4], seedReturn: [1, 2],
    thirst: 1.35, coldFloor: 6, heatCeiling: 38, color: '#7d9349', flower: '#c9ad4f', tall: true,
    description: 'Come água e sol. Rende grão, comida e semente.'
  },
  beans: {
    id: 'beans', name: 'Feijão', seed: 'seed_bean', item: 'beans',
    growHours: 44, yield: [3, 5], seedReturn: [1, 3],
    thirst: 0.85, coldFloor: 0, heatCeiling: 33, color: '#6a8250', flower: '#9fae7c',
    description: 'Rústico. Cresce rápido e aguenta noites frias.'
  },
  tomato: {
    id: 'tomato', name: 'Tomate', seed: 'seed_tomato', item: 'tomato',
    growHours: 52, yield: [4, 7], seedReturn: [1, 3],
    thirst: 1.5, coldFloor: 8, heatCeiling: 36, color: '#5f8049', flower: '#a4503f',
    description: 'Rende muito, mas a primeira geada mata.'
  },
  wheat: {
    id: 'wheat', name: 'Trigo', seed: 'seed_wheat', item: 'wheat_grain',
    growHours: 76, yield: [4, 7], seedReturn: [1, 2],
    thirst: 0.9, coldFloor: 1, heatCeiling: 37, color: '#8d8d4e', flower: '#c1ad6b', tall: true,
    description: 'Ciclo longo que termina em farinha e pão.'
  }
};

const CROP_STAGES = ['SEMEADO', 'BROTANDO', 'CRESCENDO', 'MADURO'];

class FarmingSystem {
  constructor({ building, world, inventory, structures, weather, danger, getWorldMinutes }) {
    this.building = building;
    this.world = world;
    this.inventory = inventory;
    this.structures = structures;
    this.weather = weather;
    this.danger = danger;
    this.getWorldMinutes = getWorldMinutes;
    this.lastMinutes = null;
    this.onNotice = null;
    this.harvestedTotal = 0;
  }

  /* ------------------------------------------------------------ estado */

  plots() { return this.building.objects.filter(o => o.type === 'garden_plot' && o.health > 0); }
  troughs() { return this.building.objects.filter(o => o.type === 'water_trough' && o.health > 0); }
  greenhouses() { return this.building.objects.filter(o => o.type === 'greenhouse_frame' && o.health > 0); }

  prepare(plot) {
    if (!plot) return plot;
    if (plot.crop === undefined) plot.crop = null;
    if (plot.growth == null) plot.growth = 0;
    if (plot.water == null) plot.water = 45;
    if (plot.vigor == null) plot.vigor = 100;
    if (plot.boost == null) plot.boost = 0;
    return plot;
  }

  crop(plot) { return plot?.crop ? CROP_DEFS[plot.crop] : null; }

  // Um canteiro está coberto quando cai dentro do vão de uma estufa. A estufa
  // é 3x3 e é desenhada a partir do canto inferior esquerdo.
  sheltered(plot) {
    return this.greenhouses().some(g =>
      plot.tileX >= g.tileX - 1 && plot.tileX <= g.tileX + 3 &&
      plot.tileY <= g.tileY + 1 && plot.tileY >= g.tileY - 3);
  }

  outdoors(plot) {
    return !this.world.isIndoors(plot.tileX, plot.tileY);
  }

  stageIndex(plot) {
    if (!plot?.crop) return -1;
    return Math.min(3, Math.floor(plot.growth * 4));
  }

  ripe(plot) { return Boolean(plot?.crop) && plot.growth >= 1; }

  /* ------------------------------------------------------------- ações */

  plant(plot, seedId) {
    this.prepare(plot);
    if (plot.crop) return { ok: false, reason: 'Este canteiro já está plantado' };
    const def = ITEM_DEFS[seedId];
    const crop = def?.crop ? CROP_DEFS[def.crop] : null;
    if (!crop) return { ok: false, reason: 'Isso não é uma semente' };
    if (this.inventory.count(seedId) < 1) return { ok: false, reason: `Você não tem ${def.name}` };
    this.inventory.remove(seedId, 1);
    plot.crop = crop.id;
    plot.growth = 0;
    plot.vigor = 100;
    plot.water = Math.max(plot.water, 40);
    return { ok: true, crop };
  }

  // Regar aceita regador (muitas doses) ou uma garrafa cheia (uma dose).
  waterPlot(plot, amount = 55) {
    this.prepare(plot);
    if (plot.water >= 96) return { ok: false, reason: 'O canteiro já está úmido' };
    plot.water = Math.min(100, plot.water + amount);
    return { ok: true };
  }

  fertilize(plot) {
    this.prepare(plot);
    if (this.inventory.count('fertilizer') < 1) return { ok: false, reason: 'Você precisa de composto' };
    if (plot.boost > 40) return { ok: false, reason: 'O canteiro já está adubado' };
    this.inventory.remove('fertilizer', 1);
    plot.boost = 100;
    plot.vigor = Math.min(100, plot.vigor + 25);
    return { ok: true };
  }

  rollYield(crop, plot, salt = Math.random()) {
    const [lo, hi] = crop.yield;
    const quality = (plot.vigor / 100) * (0.75 + (plot.boost > 0 ? 0.35 : 0));
    const base = lo + Math.floor(salt * (hi - lo + 1));
    return Math.max(1, Math.round(base * Math.max(0.4, Math.min(1.45, quality))));
  }

  harvest(plot) {
    this.prepare(plot);
    const crop = this.crop(plot);
    if (!crop) return { ok: false, reason: 'Nada plantado aqui' };
    if (plot.vigor <= 0) {
      plot.crop = null; plot.growth = 0; plot.vigor = 100; plot.boost = 0;
      return { ok: true, dead: true, items: {} };
    }
    if (plot.growth < 1) return { ok: false, reason: `${crop.name}: ${this.statusText(plot)}` };

    const qty = this.rollYield(crop, plot);
    const seeds = crop.seedReturn[0] + Math.floor(Math.random() * (crop.seedReturn[1] - crop.seedReturn[0] + 1));
    const items = {};
    items[crop.item] = this.inventory.add(crop.item, qty);
    items[crop.seed] = this.inventory.add(crop.seed, seeds);

    plot.crop = null;
    plot.growth = 0;
    plot.boost = Math.max(0, plot.boost - 45);
    plot.vigor = Math.min(100, plot.vigor);
    plot.water = Math.max(0, plot.water - 25);
    this.harvestedTotal += qty;
    return { ok: true, crop, items, qty, seeds };
  }

  // Colheita automática para o morador que cuida da horta: os itens vão para o
  // estoque da base em vez da mochila do jogador.
  harvestInto(plot, addStock) {
    const crop = this.crop(plot);
    if (!crop || plot.growth < 1 || plot.vigor <= 0) return null;
    const qty = this.rollYield(crop, plot);
    const seeds = crop.seedReturn[0];
    addStock(crop.item, qty);
    addStock(crop.seed, seeds);
    plot.crop = null;
    plot.growth = 0;
    plot.boost = Math.max(0, plot.boost - 45);
    plot.water = Math.max(0, plot.water - 25);
    this.harvestedTotal += qty;
    return { crop, qty, seeds };
  }

  /* ---------------------------------------------------------- simulação */

  // Quanto um canteiro cresce por hora de jogo, entre 0 e ~1.6.
  growthRate(plot, crop, ambientTemp) {
    if (plot.water <= 2) return 0;
    const covered = this.sheltered(plot);
    const temp = covered ? Math.max(ambientTemp, crop.coldFloor + 4) : ambientTemp;
    let rate = 1;
    if (temp < crop.coldFloor + 4) rate *= Math.max(0.15, (temp - crop.coldFloor + 4) / 8);
    if (temp > crop.heatCeiling - 4) rate *= Math.max(0.3, (crop.heatCeiling - temp + 4) / 8);
    if (plot.water < 25) rate *= 0.55;
    if (plot.boost > 0) rate *= 1.3;
    if (covered) rate *= 1.22;
    return Math.max(0, rate);
  }

  // O tempo do mundo anda em saltos: dormir até o amanhecer entrega oito horas
  // de uma vez. Um passo único desse tamanho secaria o canteiro ANTES de
  // calcular o crescimento e mataria a horta toda noite, então a simulação é
  // fatiada em passos de uma hora.
  update(dt, env = {}) {
    const minutes = this.getWorldMinutes();
    if (this.lastMinutes == null) this.lastMinutes = minutes;
    const elapsed = Math.max(0, minutes - this.lastMinutes);
    if (elapsed < 1) return;
    this.lastMinutes = minutes;

    let remaining = elapsed / 60;
    let ripened = 0;
    let guard = 0;
    while (remaining > 0.0001) {
      // Saltos muito longos (carregar um save antigo) terminam em um passo só:
      // mais do que alguns dias de detalhe não muda a decisão de ninguém.
      const step = guard >= 96 ? remaining : Math.min(1, remaining);
      ripened += this.step(step, env);
      remaining -= step;
      guard++;
    }

    if (ripened) this.onNotice?.(`${ripened} canteiro${ripened > 1 ? 's' : ''} pronto${ripened > 1 ? 's' : ''} para colher`, 'good');
  }

  // Uma hora de horta. Devolve quantos canteiros ficaram maduros neste passo.
  step(hours, env = {}) {
    const rain = env.rainIntensity || 0;
    const ambient = Number.isFinite(env.ambientTemp) ? env.ambientTemp : 16;
    const freezing = env.freezing || ambient < 1;

    // Calhas de irrigação enchem na chuva e distribuem para os canteiros.
    const troughs = this.troughs();
    for (const t of troughs) {
      if (t.water == null) t.water = 0;
      if (rain > 0 && !this.world.isIndoors(t.tileX, t.tileY)) t.water = Math.min(10, t.water + hours * rain * 2.4);
    }

    let ripened = 0;
    for (const raw of this.plots()) {
      const plot = this.prepare(raw);
      const crop = this.crop(plot);
      const covered = this.sheltered(plot);
      const open = this.outdoors(plot) && !covered;

      // O crescimento olha o canteiro como ele estava no começo da hora, e não
      // depois de o sol ter levado a água dela.
      const growthRate = crop ? this.growthRate(plot, crop, ambient) : 0;

      // Água: chuva enche, sol e planta gastam.
      if (rain > 0 && open) plot.water = Math.min(100, plot.water + hours * rain * 22);
      const use = crop ? crop.thirst : 0.4;
      plot.water = Math.max(0, plot.water - hours * use * (covered ? 1.6 : 2.4) * (ambient > 24 ? 1.3 : 1));

      // Irrigação básica: uma calha com água mantém os canteiros vizinhos vivos.
      if (plot.water < 55) {
        const source = troughs.find(t => t.water > 0.25 &&
          Math.abs(t.tileX - plot.tileX) <= 4 && Math.abs(t.tileY - plot.tileY) <= 3);
        if (source) {
          const dose = Math.min(45, hours * 28);
          plot.water = Math.min(100, plot.water + dose);
          source.water = Math.max(0, source.water - dose / 45);
          plot.irrigated = true;
        } else plot.irrigated = false;
      }

      if (plot.boost > 0) plot.boost = Math.max(0, plot.boost - hours * 1.4);
      if (!crop) { plot.vigor = Math.min(100, plot.vigor + hours * 0.6); continue; }

      // Seca e geada machucam a planta; a estufa é exatamente o que evita isso.
      if (plot.water <= 2) plot.vigor -= hours * 3.2;
      else if (plot.water < 18) plot.vigor -= hours * 1.1;
      else plot.vigor = Math.min(100, plot.vigor + hours * 0.5);
      if (!covered && (freezing || ambient < crop.coldFloor - 2)) plot.vigor -= hours * 4.5;

      if (plot.vigor <= 0) { plot.vigor = 0; continue; }

      const before = plot.growth;
      plot.growth = Math.min(1, plot.growth + (hours / crop.growHours) * growthRate);
      if (before < 1 && plot.growth >= 1) ripened++;
    }
    return ripened;
  }

  /* ------------------------------------------------------------ leitura */

  statusText(plot) {
    this.prepare(plot);
    const crop = this.crop(plot);
    if (!crop) return 'CANTEIRO VAZIO';
    if (plot.vigor <= 0) return 'PLANTA PERDIDA';
    if (plot.growth >= 1) return `${crop.name.toUpperCase()} · MADURO`;
    const pct = Math.round(plot.growth * 100);
    const dry = plot.water < 18 ? ' · SECO' : plot.water < 45 ? ' · PEDE ÁGUA' : '';
    return `${crop.name.toUpperCase()} · ${CROP_STAGES[this.stageIndex(plot)]} ${pct}%${dry}`;
  }

  summary() {
    const plots = this.plots().map(p => this.prepare(p));
    return {
      total: plots.length,
      planted: plots.filter(p => p.crop).length,
      ripe: plots.filter(p => this.ripe(p)).length,
      dry: plots.filter(p => p.crop && p.water < 18).length,
      lost: plots.filter(p => p.crop && p.vigor <= 0).length,
      sheltered: plots.filter(p => this.sheltered(p)).length
    };
  }

  /* ------------------------------------------------------------ desenho */

  draw(ctx, cameraX, cameraY) {
    for (const raw of this.plots()) {
      const plot = this.prepare(raw);
      const x = plot.tileX * CONFIG.TILE - cameraX;
      const y = plot.tileY * CONFIG.TILE - cameraY;
      if (x < -60 || x > ctx.canvas.width + 60) continue;

      const wet = Math.min(1, plot.water / 100);
      ctx.fillStyle = '#4a3d2b';                                   // moldura
      ctx.fillRect(x, y + 18, CONFIG.TILE, 14);
      ctx.fillStyle = wet > .5 ? '#5a4a33' : '#6d5b3f';            // terra
      ctx.fillRect(x + 1, y + 20, CONFIG.TILE - 2, 11);
      ctx.fillStyle = 'rgba(38,31,22,.45)';                        // sulcos
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 4 + i * 8, y + 23, 5, 2);
      ctx.fillStyle = wet > .5 ? 'rgba(96,120,128,.22)' : 'rgba(158,136,98,.35)';
      ctx.fillRect(x + 1, y + 20, CONFIG.TILE - 2, 1);             // crista úmida
      ctx.fillStyle = 'rgba(20,17,12,.4)';
      ctx.fillRect(x, y + 30, CONFIG.TILE, 2);

      const crop = this.crop(plot);
      if (!crop) continue;

      if (plot.vigor <= 0) {
        ctx.strokeStyle = '#6a5f47';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x + 8 + i * 8, y + 21);
          ctx.lineTo(x + 6 + i * 8, y + 15);
          ctx.stroke();
        }
        continue;
      }

      const stage = this.stageIndex(plot);
      const height = [3, 8, 14, crop.tall ? 22 : 17][stage];
      const tone = plot.water < 18 ? '#7c7a4c' : crop.color;
      ctx.strokeStyle = tone;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const sx = x + 8 + i * 8;
        ctx.beginPath();
        ctx.moveTo(sx, y + 21);
        ctx.lineTo(sx + (i - 1) * 1.5, y + 21 - height);
        ctx.stroke();
        if (stage >= 2) {
          ctx.fillStyle = tone;
          ctx.fillRect(sx - 3, y + 21 - height * .6, 3, 2);
          ctx.fillRect(sx + 1, y + 21 - height * .8, 3, 2);
        }
        if (stage === 3) {
          ctx.fillStyle = crop.flower;
          ctx.fillRect(sx - 2, y + 20 - height, 4, 4);
        }
      }
      if (this.ripe(plot)) {
        ctx.fillStyle = 'rgba(198,168,94,.22)';
        ctx.fillRect(x + 2, y + 18 - height, CONFIG.TILE - 4, height + 6);
      }
    }

    for (const g of this.greenhouses()) {
      const x = g.tileX * CONFIG.TILE - cameraX;
      const y = (g.tileY - 2) * CONFIG.TILE - cameraY;
      if (x < -140 || x > ctx.canvas.width + 140) continue;
      const w = CONFIG.TILE * 3, h = CONFIG.TILE * 3;
      ctx.fillStyle = 'rgba(176,198,190,.13)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#7d8a7f';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      ctx.beginPath();
      ctx.moveTo(x + 1, y + 1); ctx.lineTo(x + w / 2, y - 10); ctx.lineTo(x + w - 1, y + 1);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(190,208,200,.35)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(x + i * CONFIG.TILE, y); ctx.lineTo(x + i * CONFIG.TILE, y + h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + i * CONFIG.TILE); ctx.lineTo(x + w, y + i * CONFIG.TILE); ctx.stroke();
      }
    }

    for (const t of this.troughs()) {
      const x = t.tileX * CONFIG.TILE - cameraX;
      const y = t.tileY * CONFIG.TILE - cameraY;
      if (x < -90 || x > ctx.canvas.width + 90) continue;
      ctx.fillStyle = '#5c5442';
      ctx.fillRect(x + 1, y + 18, CONFIG.TILE * 2 - 2, 12);
      const level = Math.max(0, Math.min(1, (t.water || 0) / 10));
      if (level > 0) {
        ctx.fillStyle = 'rgba(96,142,160,.75)';
        ctx.fillRect(x + 3, y + 26 - Math.round(level * 6), CONFIG.TILE * 2 - 6, Math.max(2, Math.round(level * 6)));
      }
      ctx.fillStyle = '#6f6650';
      ctx.fillRect(x + 1, y + 17, CONFIG.TILE * 2 - 2, 2);
    }
  }
}
