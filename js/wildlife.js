// Stage 31 — fauna caçável.
//
// Os animais não são infectados com outra textura: eles fogem em vez de
// perseguir, ouvem muito melhor do que enxergam, e o preço de errar um tiro é
// perder a caça E chamar tudo que estiver por perto. Javali e lobo são as duas
// exceções que revidam.
//
// Layout das folhas: 48x40 por quadro, o bicho apoiado na linha 36. A altura
// extra existe para a galhada do veado e as orelhas do coelho.
const ANIMAL_SPRITE_LAYOUT = { frameW: 48, frameH: 40, cx: 24, ground: 36 };

const ANIMAL_ANIMATIONS = {
  idle:  { frames: [0, 1],          fps: 1.2, loop: true },
  walk:  { frames: [2, 3, 4, 5],    fps: 5.2, loop: true, group: 'stride' },
  run:   { frames: [6, 7, 8, 9],    fps: 11,  loop: true, group: 'stride' },
  alert: { frames: [10],            fps: 1,   loop: true },
  hurt:  { frames: [11],            fps: 1,   loop: false },
  dead:  { frames: [12],            fps: 1,   loop: false }
};

const WILDLIFE_SPECIES = {
  rabbit: {
    id: 'rabbit', name: 'Coelho', w: 22, h: 16, hp: 16, mass: .4,
    walk: 26, run: 152, hearing: 1.35, sight: 9, nerve: .1, stamina: 5.5,
    night: .5, drops: { raw_small_game: [1, 2], animal_hide: [0, 1] },
    butcherTime: .6, noise: 40, color: '#8b7d68',
    regions: { coldwood: 1, pasture: 1.2, roadside: .9, crossing: .6, cedar: .5, dustbowl: .7, ridge: .6, civic: .3 }
  },
  pheasant: {
    id: 'pheasant', name: 'Galinha-do-mato', w: 20, h: 18, hp: 13, mass: .35,
    walk: 22, run: 128, hearing: 1.5, sight: 10, nerve: .05, stamina: 4,
    night: .2, drops: { raw_small_game: [1, 2], feathers: [2, 5] },
    butcherTime: .5, noise: 55, color: '#7d6a4a', hops: true,
    regions: { coldwood: .9, pasture: 1.1, roadside: .8, crossing: .5, cedar: .5, dustbowl: .5, ridge: .5 }
  },
  deer: {
    id: 'deer', name: 'Veado', w: 46, h: 36, hp: 58, mass: 1.5,
    walk: 34, run: 168, hearing: 1.5, sight: 14, nerve: .15, stamina: 9,
    night: .7, drops: { raw_meat: [3, 5], animal_hide: [1, 2], bone: [1, 2], animal_fat: [0, 1] },
    butcherTime: 1.5, noise: 70, color: '#7a6047',
    regions: { coldwood: 1.2, pasture: .8, roadside: .5, ridge: .9, dustbowl: .3 }
  },
  boar: {
    id: 'boar', name: 'Javali', w: 42, h: 28, hp: 84, mass: 2.1,
    walk: 30, run: 132, hearing: 1.1, sight: 8, nerve: .75, stamina: 7,
    night: .8, aggressive: true, damage: 15, attackRange: 34, attackDelay: 1.15,
    drops: { raw_meat: [3, 6], animal_hide: [1, 2], animal_fat: [1, 2], bone: [1, 2] },
    butcherTime: 1.8, noise: 95, color: '#5b4c3f',
    regions: { coldwood: .9, pasture: .4, dustbowl: .7, ridge: .8, roadside: .3 }
  },
  wolf: {
    id: 'wolf', name: 'Lobo', w: 40, h: 26, hp: 50, mass: 1.1,
    walk: 40, run: 176, hearing: 1.6, sight: 16, nerve: 1, stamina: 12,
    night: 2.2, predator: true, damage: 12, attackRange: 32, attackDelay: .95,
    drops: { raw_meat: [1, 3], animal_hide: [1, 2], bone: [1, 2] },
    butcherTime: 1.2, noise: 120, color: '#5f5c55',
    regions: { coldwood: 1.1, ridge: 1, pasture: .3, dustbowl: .4 }
  }
};

class WildlifeSystem {
  constructor({ world, structures, danger, inventory, weather, seed, getWorldMinutes }) {
    this.world = world;
    this.structures = structures;
    this.danger = danger;
    this.inventory = inventory;
    this.weather = weather;
    this.seed = (seed >>> 0) || 1;
    this.getWorldMinutes = getWorldMinutes;

    this.animals = [];
    this.carcasses = [];
    this.pressure = new Map();       // região -> 0..1 de caça recente
    this.spawnTimer = 4;
    this.salt = 1;
    this.kills = 0;
    this.lastPressureDay = 0;
    this.onAttack = null;            // (animal, damage) -> void
    this.onAlarm = null;             // (animal) -> void, para som
    this.onKill = null;
  }

  rand(n) {
    let x = (n + this.seed * 61) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  day() { return Math.floor((this.getWorldMinutes?.() || 0) / 1440) + 1; }
  hour() { return ((this.getWorldMinutes?.() || 0) % 1440) / 60; }
  isNight() { const h = this.hour(); return h < 6 || h >= 20; }

  /* --------------------------------------------------------- população */

  regionId(tileX) {
    return this.world.region(Math.max(0, Math.min(CONFIG.WORLD_W - 1, tileX | 0)))?.id || 'pasture';
  }

  // Caçar demais a mesma área esvazia a área. A pressão cai sozinha ao longo
  // de alguns dias, então a região se recupera se o jogador der um tempo.
  huntingPressure(regionId) {
    return Math.max(0, Math.min(1, this.pressure.get(regionId) || 0));
  }

  addPressure(regionId, amount) {
    this.pressure.set(regionId, Math.min(1.2, (this.pressure.get(regionId) || 0) + amount));
  }

  relaxPressure() {
    const day = this.day();
    if (day <= this.lastPressureDay) return;
    this.lastPressureDay = day;
    for (const [id, value] of [...this.pressure.entries()]) {
      const next = value - 0.34;
      if (next <= 0) this.pressure.delete(id); else this.pressure.set(id, next);
    }
  }

  // Qual espécie aparece aqui e agora. Peso por região, e o turno do dia
  // decide se o lobo sai ou se o coelho se esconde.
  pickSpecies(regionId, salt) {
    const night = this.isNight();
    const rows = [];
    let total = 0;
    for (const def of Object.values(WILDLIFE_SPECIES)) {
      const base = def.regions[regionId];
      if (!base) continue;
      const shift = night ? def.night : 1 / Math.max(.2, def.night);
      const weight = base * Math.max(.05, shift);
      total += weight;
      rows.push([def, total]);
    }
    if (!rows.length) return null;
    const roll = this.rand(salt) * total;
    return (rows.find(r => roll <= r[1]) || rows[rows.length - 1])[0];
  }

  make(def, tileX, groundY) {
    return {
      species: def.id, def,
      x: tileX * CONFIG.TILE, y: (groundY - Math.ceil(def.h / CONFIG.TILE)) * CONFIG.TILE,
      w: def.w, h: def.h,
      vx: 0, vy: 0, dir: this.rand(this.salt++ * 7) > .5 ? 1 : -1,
      hp: def.hp, maxHp: def.hp, alive: true,
      state: 'graze', stateTimer: 1 + this.rand(this.salt++ * 11) * 3,
      fear: 0, energy: def.stamina, hurtTimer: 0, attackTimer: 0,
      onGround: false, animator: new SpriteAnimator(ANIMAL_ANIMATIONS, 'idle'), animState: 'idle',
      wanderTarget: null, spooked: 0
    };
  }

  spawnNear(player, camera, viewW) {
    const px = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
    for (let attempt = 0; attempt < 8; attempt++) {
      const side = this.rand(this.salt++ * 13) > .5 ? 1 : -1;
      const distance = Math.floor(viewW / CONFIG.TILE * .62) + 6 + Math.floor(this.rand(this.salt++ * 17) * 18);
      const tileX = px + side * distance;
      if (tileX < 4 || tileX >= CONFIG.WORLD_W - 4) continue;

      const regionId = this.regionId(tileX);
      if (this.rand(this.salt++ * 19) < this.huntingPressure(regionId) * .85) continue;

      const def = this.pickSpecies(regionId, this.salt++ * 23);
      if (!def) continue;

      const groundY = this.world.groundY(tileX);
      if (!this.world.hasHeadroom(tileX, groundY, 3)) continue;
      if (this.world.isIndoors(tileX, groundY - 1)) continue;
      // bichos não nascem em asfalto e concreto: a fauna é do campo
      const floor = this.world.get(tileX, groundY);
      if (![TILE.GRASS, TILE.WET_GRASS, TILE.DEAD_GRASS, TILE.DIRT, TILE.DRY_DIRT, TILE.WET_DIRT,
            TILE.LEAF_LITTER, TILE.GRAVEL, TILE.MUD, TILE.TALL_GRASS].includes(floor)) continue;

      const animal = this.make(def, tileX, groundY);
      this.animals.push(animal);
      return animal;
    }
    return null;
  }

  targetPopulation(player) {
    const regionId = this.regionId(Math.floor((player.x + player.w / 2) / CONFIG.TILE));
    const base = ['coldwood', 'pasture', 'ridge', 'roadside', 'dustbowl'].includes(regionId) ? 5 : 2;
    return Math.max(0, Math.round(base * (1 - this.huntingPressure(regionId) * .7)));
  }

  /* ------------------------------------------------------------- física */

  solidAt(px, py) {
    return this.world.isSolid(Math.floor(px / CONFIG.TILE), Math.floor(py / CONFIG.TILE));
  }

  // Locomoção deliberadamente simples: andam no chão, sobem um degrau e viram
  // quando a parede não cede. Nada de pathfinding para um coelho.
  move(animal, dt) {
    const speed = animal.vx;
    if (speed !== 0) {
      const nextX = animal.x + speed * dt;
      const edgeX = speed > 0 ? nextX + animal.w : nextX;
      const footY = animal.y + animal.h - 2;
      if (this.solidAt(edgeX, footY)) {
        // tenta um degrau
        if (!this.solidAt(edgeX, footY - CONFIG.TILE) && !this.solidAt(edgeX, footY - CONFIG.TILE * 1.6)) {
          animal.y -= CONFIG.TILE;
          animal.x = nextX;
        } else {
          animal.vx = 0;
          animal.dir *= -1;
        }
      } else animal.x = nextX;
    }

    animal.vy = Math.min(16, animal.vy + 26 * dt);
    animal.y += animal.vy;
    animal.onGround = false;
    const footY = animal.y + animal.h;
    if (this.solidAt(animal.x + animal.w * .5, footY)) {
      animal.y = Math.floor(footY / CONFIG.TILE) * CONFIG.TILE - animal.h;
      animal.vy = 0;
      animal.onGround = true;
    }
    animal.x = Math.max(CONFIG.TILE * 2, Math.min((CONFIG.WORLD_W - 3) * CONFIG.TILE, animal.x));
  }

  /* ------------------------------------------------------ percepção */

  // Enxergam mal e ouvem muito bem. Agachar, chuva e vento ajudam o caçador.
  senses(animal, player, options) {
    const ac = { x: animal.x + animal.w / 2, y: animal.y + animal.h / 2 };
    const pc = player.center();
    const distance = Math.hypot(pc.x - ac.x, pc.y - ac.y);
    const stealth = Math.max(.25, options.stealth ?? 1);
    const sight = animal.def.sight * CONFIG.TILE * stealth * (options.visibility ?? 1);
    let alarm = 0;

    if (distance < sight) {
      const facing = Math.sign(pc.x - ac.x) === animal.dir ? 1 : .45;
      alarm = Math.max(alarm, (1 - distance / sight) * facing);
    }

    for (const noise of this.danger?.noises || []) {
      const d = Math.hypot(noise.x - ac.x, noise.y - ac.y);
      const radius = noise.radius * animal.def.hearing * (options.noiseScale ?? 1);
      if (d < radius) alarm = Math.max(alarm, 1 - d / radius);
    }

    return { alarm, distance, playerX: pc.x, playerY: pc.y };
  }

  /* ---------------------------------------------------------- simulação */

  update(dt, player, options = {}) {
    this.relaxPressure();
    const viewW = options.viewW || 1280;
    const px = player.x + player.w / 2;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 3.5 + Math.random() * 4;
      const nearby = this.animals.filter(a => a.alive && Math.abs(a.x - px) < viewW * 1.9).length;
      if (nearby < this.targetPopulation(player)) this.spawnNear(player, options.camera, viewW);
    }

    for (let i = this.animals.length - 1; i >= 0; i--) {
      const animal = this.animals[i];
      // longe demais para importar: some sem cerimônia
      if (Math.abs(animal.x - px) > viewW * 3.2) { this.animals.splice(i, 1); continue; }
      if (!animal.alive) { this.animals.splice(i, 1); continue; }
      this.updateAnimal(animal, dt, player, options);
    }

    for (let i = this.carcasses.length - 1; i >= 0; i--) {
      const c = this.carcasses[i];
      c.life -= dt;
      if (c.life <= 0 || Math.abs(c.x - px) > viewW * 3.2) this.carcasses.splice(i, 1);
    }
  }

  updateAnimal(animal, dt, player, options) {
    const def = animal.def;
    animal.hurtTimer = Math.max(0, animal.hurtTimer - dt);
    animal.attackTimer = Math.max(0, animal.attackTimer - dt);
    animal.stateTimer -= dt;
    animal.spooked = Math.max(0, animal.spooked - dt);

    const sense = this.senses(animal, player, options);
    const threshold = animal.state === 'flee' ? .12 : .34;

    // Predadores e o javali ferido invertem a lógica: aproximação é ataque.
    const wantsFight = (def.predator && this.isNight() && sense.distance < def.sight * CONFIG.TILE) ||
      (def.aggressive && (animal.hp < animal.maxHp * .8 || sense.distance < CONFIG.TILE * 3.2) && sense.alarm > .3);

    if (sense.alarm > threshold) {
      animal.fear = Math.min(1, animal.fear + dt * (1.6 + sense.alarm));
      if (wantsFight) {
        if (animal.state !== 'hunt') this.onAlarm?.(animal, 'hunt');
        animal.state = 'hunt';
      } else if (animal.fear > def.nerve) {
        if (animal.state !== 'flee') this.onAlarm?.(animal, 'flee');
        animal.state = 'flee';
        animal.stateTimer = 2.2 + Math.random() * 2.6;
        animal.dir = sense.playerX > animal.x ? -1 : 1;
      } else if (animal.state === 'graze') {
        animal.state = 'alert';
        animal.stateTimer = 1.4;
        animal.dir = sense.playerX > animal.x ? 1 : -1;
      }
    } else {
      animal.fear = Math.max(0, animal.fear - dt * .55);
      if (animal.state === 'alert' && animal.stateTimer <= 0) animal.state = 'graze';
      if (animal.state === 'flee' && animal.stateTimer <= 0 && sense.distance > CONFIG.TILE * 12) animal.state = 'graze';
      if (animal.state === 'hunt' && sense.distance > def.sight * CONFIG.TILE * 1.4) animal.state = 'graze';
    }

    switch (animal.state) {
      case 'flee': {
        animal.energy = Math.max(0, animal.energy - dt);
        const speed = animal.energy > 0 ? def.run : def.walk * 1.4;
        animal.vx = animal.dir * speed;
        break;
      }
      case 'hunt': {
        animal.dir = sense.playerX > animal.x ? 1 : -1;
        if (sense.distance <= def.attackRange) {
          animal.vx = 0;
          if (animal.attackTimer <= 0) {
            animal.attackTimer = def.attackDelay;
            this.onAttack?.(animal, def.damage);
          }
        } else animal.vx = animal.dir * def.run * .78;
        break;
      }
      case 'alert':
        animal.vx = 0;
        break;
      default: {
        animal.energy = Math.min(def.stamina, animal.energy + dt * .8);
        if (animal.stateTimer <= 0) {
          animal.stateTimer = 2 + Math.random() * 4;
          const roll = Math.random();
          animal.vx = roll < .45 ? 0 : (roll < .72 ? 1 : -1) * def.walk * (def.hops ? 1.2 : 1);
          if (animal.vx !== 0) animal.dir = Math.sign(animal.vx);
        }
        break;
      }
    }

    // Aves e coelhos saltam em vez de trotar.
    if (def.hops && animal.vx !== 0 && animal.onGround && Math.random() < dt * 3.5) animal.vy = -5.2;

    this.move(animal, dt);

    const next = !animal.alive ? 'dead'
      : animal.hurtTimer > 0 ? 'hurt'
      : animal.state === 'flee' || animal.state === 'hunt' ? 'run'
      : animal.vx !== 0 ? 'walk'
      : animal.state === 'alert' ? 'alert' : 'idle';
    if (next !== animal.animState) { animal.animState = next; animal.animator.set(next); }
    animal.animator.update(dt);
  }

  /* -------------------------------------------------------------- dano */

  applyHit(animal, damage, opts = {}) {
    animal.hp -= damage;
    animal.hurtTimer = .25;
    animal.fear = 1;
    animal.energy = Math.max(animal.energy, animal.def.stamina * .6);
    const def = animal.def;

    if (animal.hp <= 0) {
      animal.alive = false;
      this.kills++;
      this.addPressure(this.regionId(Math.floor(animal.x / CONFIG.TILE)), def.mass >= 1 ? .34 : .16);
      const carcass = {
        species: def.id, def, x: animal.x, y: animal.y + animal.h - 14,
        w: Math.max(26, def.w), h: 14, dir: animal.dir, life: 480, butchered: false
      };
      this.carcasses.push(carcass);
      this.onKill?.(animal, carcass);
      return { hit: true, killed: true, animal, carcass };
    }

    // Um tiro que não mata espanta o resto da mata.
    animal.state = def.aggressive || (def.predator && this.isNight()) ? 'hunt' : 'flee';
    animal.stateTimer = 4;
    animal.dir = (opts.fromX ?? animal.x) > animal.x ? -1 : 1;
    this.spookNearby(animal.x, CONFIG.TILE * 16);
    return { hit: true, killed: false, animal };
  }

  spookNearby(x, radius) {
    for (const a of this.animals) {
      if (!a.alive || Math.abs(a.x - x) > radius) continue;
      if (a.state === 'graze' || a.state === 'alert') {
        a.state = 'flee';
        a.stateTimer = 2.5;
        a.fear = 1;
        a.dir = x > a.x ? -1 : 1;
      }
    }
  }

  swing(box, opts = {}) {
    const cx = box.x + box.w / 2;
    const targets = this.animals.filter(a => a.alive &&
      a.x < box.x + box.w && a.x + a.w > box.x &&
      a.y < box.y + box.h && a.y + a.h > box.y);
    if (!targets.length) return { hit: false };
    targets.sort((a, b) => Math.abs(a.x + a.w / 2 - cx) - Math.abs(b.x + b.w / 2 - cx));
    return this.applyHit(targets[0], opts.damage || 15, opts);
  }

  shoot(originX, originY, dirX, dirY, opts = {}) {
    const range = opts.range || 300;
    const steps = Math.ceil(range / 8);
    for (let i = 1; i <= steps; i++) {
      const t = (i / steps) * range;
      const x = originX + dirX * t, y = originY + dirY * t;
      if (this.world.isSolid(Math.floor(x / CONFIG.TILE), Math.floor(y / CONFIG.TILE))) return { blocked: true, distance: t, x, y };
      for (const a of this.animals) {
        if (!a.alive) continue;
        if (x < a.x || x > a.x + a.w || y < a.y || y > a.y + a.h) continue;
        return { ...this.applyHit(a, opts.damage || 20, { fromX: originX }), distance: t, x, y };
      }
    }
    return { miss: true, distance: range, x: originX + dirX * range, y: originY + dirY * range };
  }

  /* ----------------------------------------------------------- abate */

  nearestCarcass(player, radiusTiles = 2.4) {
    const pc = player.center();
    let best = null, bestD = radiusTiles * CONFIG.TILE;
    for (const c of this.carcasses) {
      const d = Math.hypot(c.x + c.w / 2 - pc.x, c.y + c.h / 2 - pc.y);
      if (d < bestD) { best = c; bestD = d; }
    }
    return best;
  }

  // Abater exige lâmina. Uma faca de abate aproveita bem mais do animal, que é
  // a razão de ela existir.
  butcher(carcass, opts = {}) {
    if (!carcass || carcass.butchered) return { ok: false, reason: 'Nada para aproveitar aqui' };
    if (!opts.hasBlade) return { ok: false, reason: 'Você precisa de uma lâmina para abater' };

    const bonus = 1 + (opts.bonus || 0);
    const gained = {};
    for (const [id, range] of Object.entries(carcass.def.drops)) {
      const roll = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
      const qty = Math.max(range[0] > 0 ? 1 : 0, Math.round(roll * bonus));
      if (qty <= 0) continue;
      const added = this.inventory.add(id, qty);
      if (added > 0) gained[id] = (gained[id] || 0) + added;
      if (added < qty) gained.__overflow = true;
    }
    carcass.butchered = true;
    const index = this.carcasses.indexOf(carcass);
    if (index >= 0) this.carcasses.splice(index, 1);
    return { ok: true, gained, species: carcass.def };
  }

  /* --------------------------------------------------------- armadilhas */

  // Armadilhas de laço são a resposta de baixo esforço: rendem pouco, rendem
  // devagar, mas rendem sozinhas enquanto o jogador faz outra coisa.
  updateTraps(elapsedMinutes, building) {
    if (!building || elapsedMinutes <= 0) return 0;
    let caught = 0;
    for (const trap of building.objects.filter(o => o.type === 'snare_trap' && o.health > 0)) {
      if (trap.catch) continue;
      if (trap.progress == null) trap.progress = 0;
      const regionId = this.regionId(trap.tileX);
      const density = Math.max(.15, 1 - this.huntingPressure(regionId));
      trap.progress += (elapsedMinutes / 60) * .09 * density;
      if (trap.progress >= 1) {
        trap.progress = 0;
        trap.catch = Math.random() < .68 ? 'rabbit' : 'pheasant';
        this.addPressure(regionId, .05);
        caught++;
      }
    }
    return caught;
  }

  collectTrap(trap) {
    if (!trap) return { ok: false, reason: 'Nenhuma armadilha por perto' };
    if (!trap.catch) {
      const pct = Math.round(Math.max(0, Math.min(1, trap.progress || 0)) * 100);
      return { ok: false, reason: `Armadilha armada · ${pct}% de chance acumulada` };
    }
    const def = WILDLIFE_SPECIES[trap.catch] || WILDLIFE_SPECIES.rabbit;
    trap.catch = null;
    const gained = {};
    for (const [id, range] of Object.entries(def.drops)) {
      const qty = Math.max(range[0], Math.round((range[0] + range[1]) / 2));
      if (qty <= 0) continue;
      const added = this.inventory.add(id, qty);
      if (added) gained[id] = added;
    }
    return { ok: true, species: def, gained };
  }

  /* -------------------------------------------------------------- HUD */

  nearestAnimal(player, radiusTiles = 22) {
    const pc = player.center();
    let best = null, bestD = radiusTiles * CONFIG.TILE;
    for (const a of this.animals) {
      if (!a.alive) continue;
      const d = Math.hypot(a.x + a.w / 2 - pc.x, a.y + a.h / 2 - pc.y);
      if (d < bestD) { best = a; bestD = d; }
    }
    return best ? { animal: best, distance: bestD } : null;
  }

  /* ----------------------------------------------------------- desenho */

  drawAnimal(ctx, animal, x, y) {
    const sheet = ASSETS.ready(`sprite:animal:${animal.species}`);
    const layout = ANIMAL_SPRITE_LAYOUT;

    ctx.save();
    ctx.fillStyle = 'rgba(8,10,9,.2)';
    ctx.beginPath();
    ctx.ellipse(x + animal.w / 2, y + animal.h + 1, animal.w * .45, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(x + (animal.dir < 0 ? animal.w : 0), 0);
    if (animal.dir < 0) ctx.scale(-1, 1);

    if (sheet) {
      const frame = animal.animator.frame();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sheet, frame * layout.frameW, 0, layout.frameW, layout.frameH,
        animal.w / 2 - layout.cx, y + animal.h - layout.ground, layout.frameW, layout.frameH);
    } else {
      // fallback sólido: melhor um bicho legível do que um buraco no mundo
      ctx.fillStyle = animal.def.color;
      ctx.fillRect(animal.w * .1, y + animal.h * .25, animal.w * .8, animal.h * .6);
      ctx.fillRect(animal.w * .7, y + animal.h * .05, animal.w * .28, animal.h * .35);
    }
    ctx.restore();

    if (animal.hurtTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(.5, animal.hurtTimer * 2);
      ctx.fillStyle = '#c4796d';
      ctx.fillRect(x, y, animal.w, animal.h);
      ctx.restore();
    }
  }

  draw(ctx, cameraX, cameraY) {
    for (const c of this.carcasses) {
      const x = Math.round(c.x - cameraX), y = Math.round(c.y - cameraY);
      if (x < -80 || x > ctx.canvas.width + 80) continue;
      const sheet = ASSETS.ready(`sprite:animal:${c.species}`);
      ctx.save();
      ctx.fillStyle = 'rgba(8,10,9,.24)';
      ctx.beginPath();
      ctx.ellipse(x + c.w / 2, y + c.h + 1, c.w * .5, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (sheet) {
        ctx.imageSmoothingEnabled = false;
        const frame = ANIMAL_ANIMATIONS.dead.frames[0];
        ctx.drawImage(sheet, frame * ANIMAL_SPRITE_LAYOUT.frameW, 0, ANIMAL_SPRITE_LAYOUT.frameW, ANIMAL_SPRITE_LAYOUT.frameH,
          x + c.w / 2 - ANIMAL_SPRITE_LAYOUT.cx, y + c.h - ANIMAL_SPRITE_LAYOUT.ground, ANIMAL_SPRITE_LAYOUT.frameW, ANIMAL_SPRITE_LAYOUT.frameH);
      } else {
        ctx.fillStyle = c.def.color;
        ctx.fillRect(x, y + 4, c.w, c.h - 4);
      }
      ctx.restore();
    }

    for (const animal of this.animals) {
      if (!animal.alive) continue;
      const x = Math.round(animal.x - cameraX), y = Math.round(animal.y - cameraY);
      if (x < -90 || x > ctx.canvas.width + 90 || y < -90 || y > ctx.canvas.height + 90) continue;
      this.drawAnimal(ctx, animal, x, y);
    }
  }

  /* -------------------------------------------------------- persistência */

  exportState() {
    return {
      version: 1, kills: this.kills, lastPressureDay: this.lastPressureDay,
      pressure: [...this.pressure.entries()],
      carcasses: this.carcasses.map(c => ({ species: c.species, x: c.x, y: c.y, w: c.w, h: c.h, dir: c.dir, life: c.life }))
    };
  }

  importState(data) {
    if (!data || data.version !== 1) return false;
    this.kills = data.kills || 0;
    this.lastPressureDay = data.lastPressureDay || 0;
    this.pressure = new Map(data.pressure || []);
    this.animals = [];
    this.carcasses = (data.carcasses || [])
      .filter(c => WILDLIFE_SPECIES[c.species])
      .map(c => ({ ...c, def: WILDLIFE_SPECIES[c.species], butchered: false }));
    return true;
  }
}
