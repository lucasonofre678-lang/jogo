// Stage 42 — Zombie Population & Base Defense Foundation.
//
// This layer turns infected into a regional pressure instead of a finite set
// of props. It deliberately reuses DangerSystem and HordeSystem: there is one
// source of truth for AI, while this class owns population, attention, fair
// off-screen arrivals, Red Night scheduling and the condition of the base.

Object.assign(BUILD_DEFS, {
  perimeter_sensor: {
    name: 'Sensor de perímetro', category: 'DEFESA',
    description: 'Avisa quando grupos entram no perímetro da base. Precisa de uma rede elétrica ativa.',
    cost: { scrap_metal:2, wire:3, motion_sensor:1, fuse:1 },
    refund: { scrap_metal:1, wire:1 }, maxHealth:85, width:1, height:1,
    color:'#76918a', objectOnly:true, stage42:true
  },
  decoy_siren: {
    name: 'Sirene de desvio', category: 'DEFESA',
    description: 'Ponto de distração para conduzir uma horda para longe da parte principal da base.',
    cost: { scrap_metal:3, wire:4, circuit_parts:1, battery:1 },
    refund: { scrap_metal:1, wire:2 }, maxHealth:105, width:1, height:2,
    color:'#aa684d', objectOnly:true, stage42:true
  }
});

class ZombiePopulationSystem {
  constructor(deps) {
    Object.assign(this, deps);
    this.announce = null;
    this.regions = new Map();
    this.lastMinutes = null;
    this.lastKills = this.danger.kills || 0;
    this.spawnTimer = 8;
    this.emissionTimer = 2;
    this.sensorTimer = 0;
    this.migrationTimer = 170;
    this.pressureTimer = 0;
    this.serial = 1;
    this.event = {
      phase:'calm', warningAt:0, startedAt:0, wave:0, waveTimer:0,
      nextAt:this.firstRedNightAt(), lastResult:null
    };
    this.seedRegions();
  }

  firstRedNightAt() {
    const day = 5 + ((this.seed >>> 0) % 2);
    return (day - 1) * 1440 + 19 * 60;
  }

  seedRegions() {
    const danger = {
      coldwood:.42, pasture:.48, roadside:.62, crossing:.72, cedar:.9,
      downtown:1.25, civic:1.05, dustbowl:.74, westline:1.15, ridge:.76,
      blackridge:1.48, greenwater_pass:.66, greenwater_forest:.7,
      greenwater_lake:.56, greenwater_meadow:.5, greenwater_highlands:.72,
      greenwater_vale:.58, greenwater_range:.68, greenwater_frontier:.62
    };
    for (const r of REGIONS) {
      const width = Math.max(24, r.to - r.from);
      const capacity = Math.round(Math.max(18, Math.min(92, width * .48 * (danger[r.id] || .75))));
      this.regions.set(r.id, {
        id:r.id, name:r.name, population:Math.round(capacity * (.68 + this.hash(r.from) * .2)),
        capacity, attention:0, agitation:.08, clearedUntil:0, lastArrival:0
      });
    }
  }

  hash(n) {
    let x = (n + (this.seed >>> 0) * 17) | 0;
    x = Math.imul(x ^ (x >>> 15), 0x45d9f3b); x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  minutes() { return this.getWorldMinutes(); }
  day() { return Math.floor(this.minutes() / 1440) + 1; }
  regionAtWorldX(x) { return this.regions.get(this.world.region(Math.floor(x / CONFIG.TILE)).id); }
  current() { return this.regionAtWorldX(this.player.x + this.player.w * .5); }
  baseAnchor() { return this.baseCamp?.anchor?.() || null; }

  addAttention(x, amount, reason = 'atividade') {
    const row = this.regionAtWorldX(x);
    if (!row) return 0;
    row.attention = Math.max(0, Math.min(100, row.attention + amount));
    row.agitation = Math.max(row.agitation, Math.min(1, amount / 18));
    row.lastReason = reason;
    return row.attention;
  }

  onNoise(x, radius, label = 'ruído') {
    const factor = label === 'passos' ? .06 : label === 'gerador' ? .045 : label === 'porta' ? .18
      : label === 'reparo' ? .35 : label === 'construção' ? .6 : label === 'grito' ? 1.2 : 1;
    const weight = Math.max(.01, Math.min(4.8, radius / 230) * factor);
    return this.addAttention(x, weight, label);
  }

  regionalStep(deltaMinutes) {
    if (deltaMinutes <= 0) return;
    const now = this.minutes();
    for (const row of this.regions.values()) {
      const calm = now < row.clearedUntil;
      const recoveryPerDay = row.capacity * (calm ? .035 : .11);
      row.population = Math.min(row.capacity, row.population + recoveryPerDay * deltaMinutes / 1440);
      row.attention = Math.max(0, row.attention - deltaMinutes * (calm ? .018 : .009));
      row.agitation = Math.max(.04, row.agitation - deltaMinutes * .0008);
    }
    // A small fraction migrates between neighbouring regions. This keeps the
    // map alive without teleporting anything beside the player.
    if (deltaMinutes >= 2) {
      const rows = REGIONS.map(r => this.regions.get(r.id));
      for (let i = 0; i < rows.length - 1; i++) {
        const a = rows[i], b = rows[i + 1];
        const flow = Math.min(.08 * deltaMinutes, Math.max(0, (a.population / a.capacity - b.population / b.capacity) * .18));
        if (flow > 0) { a.population -= flow; b.population = Math.min(b.capacity, b.population + flow); }
      }
    }
  }

  accountForKills() {
    const total = this.danger.kills || 0;
    const delta = Math.max(0, total - this.lastKills);
    if (!delta) return;
    const row = this.current();
    row.population = Math.max(0, row.population - delta);
    row.agitation = Math.min(1, row.agitation + delta * .025);
    if (row.population <= row.capacity * .2) row.clearedUntil = Math.max(row.clearedUntil, this.minutes() + 2.5 * 1440);
    this.lastKills = total;
  }

  baseEmission() {
    const anchor = this.baseAnchor();
    if (!anchor) return;
    const nearby = this.building.objects.filter(o => o.health > 0 && Math.abs(this.building.center(o).x - anchor.x) < 46 * CONFIG.TILE);
    let amount = .025 + nearby.length * .0015 + this.baseCamp.residents().length * .012;
    for (const o of nearby) {
      if (o.type === 'generator' && o.running) amount += .12;
      if (['floodlight','motion_floodlight','wall_lamp'].includes(o.type) && this.power.powered(o)) amount += .012;
      if (['auto_bench','radio_station','electric_pump','furnace'].includes(o.type)) amount += .008;
    }
    this.addAttention(anchor.x, amount, 'atividade da base');
  }

  aliveInRegion(regionId) {
    let n = 0;
    for (const e of this.danger.enemies) if (e.alive && this.world.region(Math.floor((e.x + e.w * .5) / CONFIG.TILE)).id === regionId) n++;
    return n;
  }

  fairColumn(row, side = 0) {
    const px = (this.player.x + this.player.w * .5) / CONFIG.TILE;
    const view = this.getViewWidth() / CONFIG.TILE;
    const anchor = this.baseAnchor();
    for (let i = 0; i < 28; i++) {
      const dir = side || (Math.random() > .5 ? 1 : -1);
      let tx = Math.round(px + dir * (view * .65 + 12 + Math.random() * 26));
      tx = Math.max(row ? REGIONS.find(r => r.id === row.id).from + 4 : 5,
        Math.min(row ? REGIONS.find(r => r.id === row.id).to - 4 : CONFIG.WORLD_W - 5, tx));
      if (Math.abs(tx - px) < view * .58 + 7) continue;
      if (anchor && Math.abs(tx * CONFIG.TILE - anchor.x) < 27 * CONFIG.TILE) continue;
      const gy = this.world.groundY(tx);
      if (!this.world.hasHeadroom(tx, gy, 3)) continue;
      return tx;
    }
    return null;
  }

  spawnRegional() {
    const row = this.current();
    if (!row || row.population < 1 || this.danger.enemies.filter(e => e.alive).length > 340) return false;
    const calm = this.minutes() < row.clearedUntil;
    const dayScale = Math.min(1.65, .72 + this.day() * .055);
    const desired = Math.max(calm ? 1 : 3, Math.round((row.population / row.capacity) * 9 * dayScale + row.attention * .055));
    if (this.aliveInRegion(row.id) >= desired) return false;
    const tx = this.fairColumn(row);
    if (tx == null) return false;
    const roll = Math.random();
    const advanced = this.day() >= 10;
    const type = advanced && roll > .93 ? 'heavy' : roll > .82 ? 'runner' : roll > .72 ? 'stalker' : 'wanderer';
    const visual = row.id === 'blackridge' ? 'blackridge' : row.id.includes('greenwater') || ['coldwood','pasture','roadside','ridge'].includes(row.id) ? 'rural' : 'civilian';
    const e = this.danger.makeEnemy(type, tx, this.danger.salt++, visual);
    e.stage42 = true;
    this.danger.enemies.push(e);
    row.population = Math.max(0, row.population - .18);
    row.lastArrival = this.minutes();
    return true;
  }

  adaptiveSize() {
    const residents = this.baseCamp.residents().length;
    const baseLevel = this.baseCamp.level();
    const tech = this.building.objects.filter(o => o.health > 0 && ['reinforced_wall','reinforced_gate','floodlight','motion_floodlight','guard_post'].includes(o.type)).length;
    const score = this.day() * .12 + residents * .28 + baseLevel * .22 + Math.min(1.5, tech * .05);
    return score > 3.9 ? 'large' : score > 2 ? 'medium' : 'small';
  }

  startRedNight() {
    this.event.phase = 'active'; this.event.startedAt = this.minutes();
    this.event.wave = 0; this.event.waveTimer = 6;
    for (const npc of this.baseCamp.residents()) npc.sheltering = true;
    this.announce?.('NOITE VERMELHA — feche os setores e mantenha uma rota de saída.', 'danger');
  }

  spawnWave() {
    const anchor = this.baseAnchor();
    const targetX = anchor?.x || this.player.x;
    const wave = ++this.event.wave;
    const baseSize = this.adaptiveSize();
    const size = wave === 1 ? 'small' : wave === 4 ? (baseSize === 'small' ? 'medium' : 'large') : baseSize;
    const left = this.hordes.spawnGroup(size, targetX, { side:-1, minTiles:38, maxTiles:66, life:520 });
    const right = wave >= 2 ? this.hordes.spawnGroup(wave === 2 ? 'small' : size, targetX, { side:1, minTiles:38, maxTiles:70, life:520 }) : null;
    if (!left && !right) { this.event.wave--; this.event.waveTimer = 8; return; }
    const labels = ['Reconhecimento','Pressão','Ruptura','Última onda'];
    this.announce?.(`${labels[wave - 1]} — onda ${wave}/4 se aproximando.`, wave >= 3 ? 'danger' : 'warn');
    this.event.waveTimer = wave < 4 ? 48 + wave * 8 : 70;
  }

  finishRedNight() {
    this.event.phase = 'recovery';
    this.event.lastResult = { day:this.day(), integrity:this.baseIntegrity(), wave:this.event.wave };
    this.event.nextAt = this.minutes() + (6 + ((this.seed + this.day()) % 3)) * 1440;
    this.event.waveTimer = 45;
    for (const npc of this.baseCamp.residents()) npc.sheltering = false;
    this.announce?.(`O silêncio voltou. Integridade da base: ${this.baseIntegrity()}%.`, 'good');
  }

  updateEvent(dt) {
    const now = this.minutes();
    if (this.event.phase === 'calm' && now >= this.event.nextAt - 1440) {
      this.event.phase = 'warning'; this.event.warningAt = now;
      this.announce?.('ATIVIDADE ANORMAL — o rádio prevê uma grande migração para esta noite.', 'warn');
    }
    if (this.event.phase === 'warning' && now >= this.event.nextAt) this.startRedNight();
    if (this.event.phase === 'active') {
      this.event.waveTimer -= dt;
      if (this.event.wave < 4 && this.event.waveTimer <= 0) this.spawnWave();
      else if (this.event.wave >= 4 && this.event.waveTimer <= 0 && this.hordes.siegeLevel() <= 1) this.finishRedNight();
    } else if (this.event.phase === 'recovery') {
      this.event.waveTimer -= dt;
      if (this.event.waveTimer <= 0) this.event.phase = 'calm';
    }
  }

  maybeMigrate() {
    const row = this.current();
    if (!row || row.attention < 12 || row.population < 8) return;
    const target = this.baseAnchor()?.x || this.player.x;
    const size = row.attention > 48 ? 'medium' : 'small';
    const group = this.hordes.spawnGroup(size, target, { minTiles:38, maxTiles:72, life:380 });
    if (group) {
      row.attention = Math.max(0, row.attention - 8);
      this.announce?.(`Horda migratória entrando em ${row.name}.`, 'warn');
    }
  }

  sensorCheck() {
    const sensor = this.building.objects.find(o => o.type === 'perimeter_sensor' && o.health > 0 && this.power.poweredAt(this.building.center(o)));
    if (!sensor) return;
    const c = this.building.center(sensor);
    let count = 0;
    for (const e of this.danger.enemies) if (e.alive && Math.abs(e.x - c.x) < 30 * CONFIG.TILE) count++;
    if (count >= 5) this.announce?.(`SENSOR DE PERÍMETRO — ${count} movimentos detectados.`, count >= 10 ? 'danger' : 'warn');
  }

  interactDefense(object) {
    if (!object) return {ok:false, reason:'Defesa indisponível'};
    const c = this.building.center(object);
    if (object.type === 'perimeter_sensor') {
      const online = this.power.poweredAt(c);
      let count = 0;
      for (const e of this.danger.enemies) if (e.alive && Math.abs(e.x - c.x) < 30 * CONFIG.TILE) count++;
      return online
        ? {ok:true, reason:`Sensor online · ${count} movimento${count === 1 ? '' : 's'} no perímetro`}
        : {ok:false, reason:'Sensor sem energia na rede'};
    }
    if (object.type === 'decoy_siren') {
      if (!this.power.poweredAt(c)) return {ok:false, reason:'Sirene sem energia na rede'};
      const now = this.minutes();
      if ((object.lastUse || 0) + 45 > now) return {ok:false, reason:'A sirene precisa esfriar antes de outro pulso'};
      object.lastUse = now;
      this.danger.emitNoise(c.x, c.y, 920, 'sirene de desvio');
      this.hordes.onLoudNoise(c.x, 920);
      let diverted = 0;
      for (const e of this.danger.enemies) {
        if (!e.alive || Math.abs(e.x - c.x) > 55 * CONFIG.TILE) continue;
        e.state = 'investigate'; e.targetX = c.x; e.lastKnownX = c.x; e.memory = 28; diverted++;
      }
      return {ok:true, reason:`Pulso de desvio ativo · ${diverted} infectado${diverted === 1 ? '' : 's'} reagiram`};
    }
    return {ok:false, reason:'Defesa indisponível'};
  }

  baseIntegrity() {
    const anchor = this.baseAnchor();
    if (!anchor) return 0;
    const defensive = this.building.objects.filter(o => {
      if (Math.abs(this.building.center(o).x - anchor.x) > 48 * CONFIG.TILE) return false;
      return ['wall','plank_wall','brick_wall','metal_wall','reinforced_wall','door','garage_door','reinforced_gate','barricade','fence','chain_fence','guard_post'].includes(o.type);
    });
    if (!defensive.length) return 15;
    let total = 0;
    for (const o of defensive) {
      let tileDamage = 0;
      for (const c of this.building.cellsFor(o.type, o.tileX, o.tileY)) tileDamage += this.world.damageAt(c.x, c.y);
      const hpRatio = Math.max(0, Math.min(1, (o.health ?? o.maxHealth ?? 1) / Math.max(1, o.maxHealth || 1)));
      total += Math.max(0, hpRatio - Math.min(.75, tileDamage / 300));
    }
    return Math.round(total / defensive.length * 100);
  }

  eventLabel() {
    if (this.event.phase === 'warning') {
      const mins = Math.max(0, Math.ceil(this.event.nextAt - this.minutes()));
      return `NOITE VERMELHA EM ${Math.floor(mins / 60)}H ${mins % 60}M`;
    }
    if (this.event.phase === 'active') return `NOITE VERMELHA · ONDA ${Math.max(1, this.event.wave)}/4`;
    if (this.event.phase === 'recovery') return 'BASE EM RECUPERAÇÃO';
    const row = this.current();
    return row?.attention >= 35 ? 'ATIVIDADE ELEVADA' : row?.attention >= 12 ? 'MOVIMENTO NA REGIÃO' : 'REGIÃO ESTÁVEL';
  }

  update(dt, enabled = true) {
    if (!enabled) return;
    const now = this.minutes();
    if (this.lastMinutes == null) this.lastMinutes = now;
    const delta = Math.max(0, Math.min(180, now - this.lastMinutes));
    this.lastMinutes = now;
    this.regionalStep(delta);
    this.accountForKills();
    this.emissionTimer -= dt;
    if (this.emissionTimer <= 0) { this.baseEmission(); this.emissionTimer = 2; }
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) { this.spawnRegional(); this.spawnTimer = 10 + Math.random() * 9; }
    this.migrationTimer -= dt;
    if (this.migrationTimer <= 0) { this.maybeMigrate(); this.migrationTimer = 170 + Math.random() * 130; }
    this.sensorTimer -= dt;
    if (this.sensorTimer <= 0) { this.sensorCheck(); this.sensorTimer = 22; }
    this.updateEvent(dt);
    const shelter = this.event.phase === 'active';
    for (const npc of this.baseCamp.residents()) npc.sheltering = shelter;
  }

  drawAtmosphere(ctx) {
    if (!['warning','active'].includes(this.event.phase)) return;
    const alpha = this.event.phase === 'active' ? .13 + Math.sin(performance.now() * .0008) * .025 : .035;
    ctx.save(); ctx.fillStyle = `rgba(122,24,19,${alpha})`; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
  }

  drawHUD(ctx) {
    const row = this.current();
    if (!row) return;
    const pop = Math.max(0, Math.min(1, row.population / row.capacity));
    const att = Math.max(0, Math.min(1, row.attention / 100));
    const x = 18, y = 82, w = 238, h = this.baseAnchor() ? 92 : 70;
    ctx.save();
    ctx.fillStyle = 'rgba(11,16,16,.82)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = this.event.phase === 'active' ? '#bd5946' : '#5f6f63'; ctx.strokeRect(x+.5,y+.5,w-1,h-1);
    ctx.font = 'bold 10px monospace'; ctx.fillStyle = '#c9b770'; ctx.fillText('PRESSÃO REGIONAL', x+11, y+16);
    ctx.font = '10px monospace'; ctx.fillStyle = '#d6ddd2'; ctx.fillText(this.eventLabel(), x+11, y+31);
    const bar = (yy, value, color, label) => {
      ctx.fillStyle='#222b27';ctx.fillRect(x+11,yy,145,6);ctx.fillStyle=color;ctx.fillRect(x+11,yy,145*value,6);
      ctx.fillStyle='#9eaaa2';ctx.fillText(label,x+164,yy+6);
    };
    bar(y+42,pop,'#819365','POPULAÇÃO'); bar(y+56,att,'#b66b4f','ATENÇÃO');
    if (this.baseAnchor()) { ctx.fillStyle='#9eaaa2';ctx.fillText(`BASE ${this.baseIntegrity()}%`,x+11,y+78); }
    ctx.restore();
  }

  exportState() {
    return {
      version:1, lastMinutes:this.lastMinutes, lastKills:this.lastKills, serial:this.serial,
      regions:[...this.regions.values()].map(r => ({...r})), event:{...this.event}
    };
  }

  importState(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.regions)) return false;
    for (const saved of data.regions || []) if (this.regions.has(saved.id)) this.regions.set(saved.id, {...this.regions.get(saved.id), ...saved});
    this.event = {...this.event, ...(data.event || {})};
    this.lastMinutes = Number.isFinite(data.lastMinutes) ? data.lastMinutes : null;
    this.lastKills = Number.isFinite(data.lastKills) ? data.lastKills : (this.danger.kills || 0);
    this.serial = data.serial || 1;
    return true;
  }
}
