const INFECTED_PROFILES = {
  // Stage 24 centralizes motion/attack feel here so new art can be swapped in
  // later without rewriting AI. accel is horizontal response per 60 Hz frame.
  wanderer: { hp: 62, speed: 1.08, damage: 11, vision: 6.2, hearing: 1, w: 25, h: 52, label: "Errante", mass: 1, reach: 8, accel: .34, attackWindup: .36, attackCooldown: 1.18 },
  runner: { hp: 42, speed: 2.18, damage: 15, vision: 7.5, hearing: 1.15, w: 23, h: 48, label: "Corredor", mass: .75, reach: 8, accel: .72, attackWindup: .23, attackCooldown: .86 },
  stalker: { hp: 50, speed: 1.45, damage: 13, vision: 9.8, hearing: 1.35, w: 24, h: 51, label: "Observador", mass: .9, reach: 10, accel: .42, attackWindup: .32, attackCooldown: 1.06 },
  heavy: { hp: 130, speed: .74, damage: 24, vision: 5.4, hearing: .9, w: 28, h: 55, label: "Pesado", mass: 2.2, reach: 12, armor: .25, accel: .20, attackWindup: .48, attackCooldown: 1.38, staggerResist: .72 },
  screamer: { hp: 34, speed: 1.25, damage: 8, vision: 8.6, hearing: 1.5, w: 23, h: 50, label: "Berrador", mass: .7, reach: 6, screamer: true, accel: .36, attackWindup: .36, attackCooldown: 1.2 },
  // A grounded special infected for urban interiors: slow most of the time, but
  // makes a short, readable lurch once it has line of sight.
  lurcher: { hp: 58, speed: 1.12, damage: 14, vision: 7.2, hearing: 1.1, w: 25, h: 51, label: "Cambaleante", mass: 1.05, reach: 9, accel: .36, attackWindup: .34, attackCooldown: 1.12, lurch: true },
  // Protective gear, not superpowers: harder to stagger and modestly armored.
  armored: { hp: 105, speed: .88, damage: 18, vision: 6.4, hearing: .95, w: 27, h: 54, label: "Blindado", mass: 1.8, reach: 10, armor: .34, accel: .24, attackWindup: .42, attackCooldown: 1.3, staggerResist: .55 },
  // Pessoal de contenção da Blackridge: lento, blindado, difícil de derrubar.
  contained: { hp: 160, speed: .88, damage: 21, vision: 6, hearing: .85, w: 27, h: 54, label: "Contido", mass: 2.6, reach: 10, armor: .45, accel: .18, attackWindup: .5, attackCooldown: 1.42, staggerResist: .48 }
};

const INFECTED_VISUALS = ["civilian", "worker", "patient", "responder", "rural"];

// Which infected an area produces — the county reads differently depending on
// who was standing there when it happened.
const AREA_PROFILES = {
  farm: { visual: 'rural', types: ['wanderer', 'wanderer', 'heavy'] },
  cabin: { visual: 'rural', types: ['wanderer'] },
  camp: { visual: 'rural', types: ['wanderer', 'runner'] },
  house: { visual: 'civilian', types: ['wanderer', 'runner'] },
  suburb: { visual: 'civilian', types: ['wanderer', 'runner', 'stalker'] },
  trailer: { visual: 'civilian', types: ['wanderer'] },
  chapel: { visual: 'civilian', types: ['wanderer'] },
  market: { visual: 'civilian', types: ['wanderer', 'runner', 'screamer'] },
  diner: { visual: 'civilian', types: ['wanderer'] },
  pharmacy: { visual: 'patient', types: ['wanderer', 'stalker'] },
  police: { visual: 'responder', types: ['armored', 'wanderer', 'runner', 'screamer'] },
  parking: { visual: 'civilian', types: ['stalker', 'runner', 'screamer'] },
  clinic: { visual: 'patient', types: ['wanderer', 'stalker', 'wanderer'] },
  school: { visual: 'civilian', types: ['wanderer', 'runner'] },
  motel: { visual: 'civilian', types: ['wanderer', 'stalker'] },
  gas_station: { visual: 'responder', types: ['wanderer', 'runner'] },
  warehouse: { visual: 'worker', types: ['wanderer', 'heavy'] },
  workshop: { visual: 'worker', types: ['wanderer', 'heavy', 'wanderer'] },
  railyard: { visual: 'worker', types: ['wanderer', 'stalker'] },
  quarry: { visual: 'worker', types: ['heavy', 'wanderer'] },
  blackridge: { visual: 'blackridge', types: ['stalker', 'contained', 'wanderer', 'screamer'] },
  // Stage 20 places
  ranger: { visual: 'rural', types: ['wanderer'] },
  wreck: { visual: 'rural', types: ['wanderer'] },
  farm_annex: { visual: 'rural', types: ['wanderer', 'heavy'] },
  cemetery: { visual: 'rural', types: ['wanderer', 'stalker'] },
  apartments: { visual: 'civilian', types: ['wanderer', 'lurcher', 'runner', 'stalker', 'screamer'] },
  hospital: { visual: 'patient', types: ['wanderer', 'lurcher', 'stalker', 'runner', 'heavy'] },
  firestation: { visual: 'responder', types: ['armored', 'wanderer', 'heavy'] },
  metro: { visual: 'civilian', types: ['wanderer', 'lurcher', 'runner', 'stalker'] },
  drainage: { visual: 'civilian', types: ['wanderer', 'lurcher', 'stalker'] },
  underground_mall: { visual: 'civilian', types: ['wanderer', 'lurcher', 'runner', 'stalker'] },
  maintenance: { visual: 'worker', types: ['wanderer', 'stalker', 'heavy'] },
  mine: { visual: 'worker', types: ['wanderer', 'heavy', 'stalker'] },
  substation: { visual: 'worker', types: ['wanderer', 'heavy'] }
};

class DangerSystem {
  constructor(world, structures, seed) {
    this.world = world;
    this.structures = structures;
    this.seed = seed >>> 0;
    this.enemies = [];
    this.noises = [];
    // Stage 31 — o clima abafa ou carrega o som do mundo inteiro.
    this.environmentNoiseScale = 1;
    this.noiseLevel = 0;
    this.kills = 0;
    this.salt = 1;
    this.respawnTimer = 60;
    this.baseCount = 0;
    this.onScreech = null;
    this.onBodyDown = null;      // set by game.js: scuffs the ground where a body lands
    this.generate();
    this.baseCount = this.enemies.length;
  }

  rand(n) {
    let x = (n + this.seed * 23) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  groundYAt(tileX, hintY) {
    return this.world.groundY(tileX, hintY);
  }

  findSpawnColumn(tileX) {
    for (let step = 0; step < 12; step++) {
      for (const dir of [1, -1]) {
        const x = tileX + step * dir;
        if (x < 2 || x >= CONFIG.WORLD_W - 2) continue;
        const gy = this.world.groundY(x);
        if (this.world.hasHeadroom(x, gy, 3)) return { x, y: gy };
      }
    }
    const gy = this.world.groundY(tileX);
    return { x: tileX, y: gy };
  }

  makeEnemy(type, tileX, salt, forcedVisual = null, opts = {}) {
    const profile = INFECTED_PROFILES[type] || INFECTED_PROFILES.wanderer;
    const spot = opts.exact ? { x: tileX, y: opts.groundY } : this.findSpawnColumn(tileX);
    tileX = spot.x;
    const groundY = spot.y;
    const visual = forcedVisual || INFECTED_VISUALS[(salt + (type === "runner" ? 1 : 0)) % INFECTED_VISUALS.length];

    return {
      id: `${type}-${salt}`,
      type,
      x: tileX * CONFIG.TILE + 4,
      y: groundY * CONFIG.TILE - profile.h,
      vx: 0, vy: 0,
      onGround: false,
      w: profile.w, h: profile.h,
      hp: profile.hp, maxHp: profile.hp,
      speed: profile.speed,
      damage: profile.damage,
      vision: profile.vision,
      hearing: profile.hearing,
      label: profile.label,
      state: opts.dormant ? "dormant" : "wander",
      dormant: Boolean(opts.dormant),
      homeX: tileX * CONFIG.TILE,
      targetX: tileX * CONFIG.TILE,
      lastKnownX: null,
      alert: 0,
      searchTimer: 0,
      dir: this.rand(salt * 31) > .5 ? 1 : -1,
      attackCooldown: 0,
      attackWindup: 0,
      hurtTimer: 0,
      memory: 0,
      alive: true,
      visual: type === "heavy" ? (forcedVisual || "heavy") : visual,
      sheet: infectedSheetKey(type === "heavy" ? (forcedVisual || "heavy") : visual, type),
      animTime: this.rand(salt * 201) * 6,
      statePulse: 0,
      blockedTimer: 0,
      idleTimer: 0,
      climb: 0,
      screeched: false,
      stagger: 0,
      knocked: 0,
      getUp: 0,
      mass: profile.mass ?? 1,
      reach: profile.reach ?? 8,
      armor: profile.armor ?? 0,
      accel: profile.accel ?? .34,
      attackWindupTime: profile.attackWindup ?? .36,
      attackCooldownTime: profile.attackCooldown ?? 1.18,
      staggerResist: profile.staggerResist ?? 1,
      isScreamer: Boolean(profile.screamer),
      lurches: Boolean(profile.lurch),
      lurchTimer: 0,
      lurchCooldown: 2.5 + this.rand(salt * 29) * 4.5,
      screamCooldown: 0,
      flash: 0,
      animator: new SpriteAnimator(INFECTED_ANIMATIONS, opts.dormant ? 'dormant' : 'idle'),
      animState: opts.dormant ? 'dormant' : 'idle',
      dying: null,
      voiceTimer: 2 + this.rand(salt * 17) * 6
    };
  }

  /* ------------------------------------------------------------ spawning */

  generate() {
    for (const structure of this.structures.structures) {
      const profile = AREA_PROFILES[structure.type] || { visual: null, types: ['wanderer'] };
      // Stage 20: hand-placed spots (upper wards, tunnels, lower levels)
      for (const [sx, sy, visual] of structure.spawns || []) {
        this.spawnUnderground(sx, sy, visual || profile.visual);
      }
      if (structure.underground) continue;
      const span = structure.endX - structure.x;
      // the structure's world state scales how many are inside
      const fixed = STRUCTURE_PROFILES[structure.type]?.spawn;
      const count = fixed != null ? fixed : Math.max(2, Math.round(span / 9 * (structure.dangerMult || 1)));

      for (let i = 0; i < count; i++) {
        const tileX = structure.x + 1 + Math.floor(this.rand(this.salt * 41) * Math.max(1, span - 2));
        const type = profile.types[Math.floor(this.rand(this.salt * 73) * profile.types.length)] || 'wanderer';
        // most of the infected in a building are standing still until disturbed
        const dormant = this.rand(this.salt * 131) > 0.35 && this.world.isIndoors(tileX, this.world.groundY(tileX));
        this.enemies.push(this.makeEnemy(type, tileX, this.salt++, profile.visual, { dormant }));
      }
    }

    for (let x = 60; x < CONFIG.WORLD_W - 40; x += 34) {
      const r = this.rand(x * 17);
      const type = r > .88 ? "stalker" : r > .72 ? "runner" : "wanderer";
      const region = this.world.region(x);
      const visual = region.id === 'coldwood' || region.id === 'pasture' ? 'rural'
        : region.id === 'westline' || region.id === 'ridge' ? 'worker'
        : region.id === 'blackridge' ? 'blackridge' : 'civilian';
      this.enemies.push(this.makeEnemy(type, x, this.salt++, visual));
    }
  }

  populateStructure(structure, count = 4) {
    const profile = AREA_PROFILES[structure.type] || { visual: null, types: ['wanderer'] };
    const span = Math.max(4, structure.endX - structure.x);
    for (let i = 0; i < count; i++) {
      const tileX = structure.x + 1 + Math.floor(this.rand(this.salt * 41) * (span - 2));
      const type = i === 0 ? 'heavy' : profile.types[Math.floor(this.rand(this.salt * 73) * profile.types.length)];
      this.enemies.push(this.makeEnemy(type, tileX, this.salt++, profile.visual, { dormant: true }));
    }
    this.baseCount = this.enemies.length;
  }

  spawnUnderground(tileX, tileY, visual = "blackridge") {
    const e = this.makeEnemy(this.rand(tileX * 7) > .6 ? "stalker" : "wanderer", tileX, this.salt++, visual,
      { exact: true, groundY: tileY, dormant: true });
    e.homeX = tileX * CONFIG.TILE;
    this.enemies.push(e);
    return e;
  }

  // Never place anything where the player could watch it appear.
  spawnOffscreen(player, camera, canvasW) {
    const pc = player.center();
    for (let attempt = 0; attempt < 14; attempt++) {
      const dir = this.rand(this.salt * 7 + attempt) > .5 ? 1 : -1;
      const distTiles = 28 + this.rand(this.salt * 11 + attempt) * 44;
      const tileX = Math.round(pc.x / CONFIG.TILE + dir * distTiles);
      if (tileX < 4 || tileX > CONFIG.WORLD_W - 4) continue;

      const px = tileX * CONFIG.TILE;
      const onScreen = px > camera.x - 64 && px < camera.x + canvasW + 64;
      if (onScreen) continue;

      const gy = this.world.groundY(tileX);
      if (!this.world.hasHeadroom(tileX, gy, 3)) continue;

      const r = this.rand(this.salt * 13 + attempt);
      const type = r > .88 ? "stalker" : r > .7 ? "runner" : "wanderer";
      const e = this.makeEnemy(type, tileX, this.salt++, null);
      this.enemies.push(e);
      return e;
    }
    return null;
  }

  /* --------------------------------------------------------------- noise */

  emitNoise(x, y, radius, label = "ruído") {
    radius *= this.environmentNoiseScale || 1;
    this.noises.push({ x, y, radius, life: 1.4, label });
    this.noiseLevel = Math.max(this.noiseLevel, Math.min(100, radius / 3.1));
    this.onNoise?.(x, y, radius, label);
  }

  lineOfSight(enemy, player) {
    const a = { x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h * .45 };
    const b = player.center();
    const steps = Math.max(4, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 20));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const tx = Math.floor((a.x + (b.x - a.x) * t) / CONFIG.TILE);
      const ty = Math.floor((a.y + (b.y - a.y) * t) / CONFIG.TILE);
      if (this.world.isSolid(tx, ty)) return false;
    }
    return true;
  }

  nearestNoise(enemy) {
    let best = null;
    let bestScore = Infinity;
    for (const noise of this.noises) {
      const d = Math.hypot(enemy.x - noise.x, enemy.y - noise.y);
      if (d <= noise.radius * enemy.hearing && d < bestScore) {
        best = noise;
        bestScore = d;
      }
    }
    return best;
  }

  // A chase starts with a screech that pulls in everything nearby.
  screech(enemy) {
    if (enemy.screeched) return;
    enemy.screeched = true;
    const cx = enemy.x + enemy.w / 2, cy = enemy.y + enemy.h / 2;
    this.emitNoise(cx, cy, 300, "grito");
    for (const other of this.enemies) {
      if (other === enemy || !other.alive) continue;
      const d = Math.hypot(other.x - cx, other.y - cy);
      if (d > 300) continue;
      other.dormant = false;
      if (other.state === "wander" || other.state === "dormant") {
        other.state = "investigate";
        other.targetX = cx;
        other.lastKnownX = cx;
        other.memory = 8;
        other.statePulse = .4;
      }
    }
    this.onScreech?.(enemy);
  }

  // Infected no longer stand inside each other: overlapping bodies push apart
  // along X, weighted by mass. Bucketed so the cost stays linear.
  separate(dt) {
    const bucketSize = 96;
    const buckets = new Map();
    for (const e of this.enemies) {
      if (!e.alive || e.state === 'dormant') continue;
      const key = Math.floor(e.x / bucketSize);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(e);
    }

    for (const [key, list] of buckets) {
      const neighbours = list.concat(buckets.get(key + 1) || []);
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        for (let j = 0; j < neighbours.length; j++) {
          const b = neighbours[j];
          if (a === b) continue;
          const dy = Math.abs((a.y + a.h / 2) - (b.y + b.h / 2));
          if (dy > 26) continue;                       // different floors
          const dx = (a.x + a.w / 2) - (b.x + b.w / 2);
          const minDist = (a.w + b.w) * 0.42;
          const dist = Math.abs(dx);
          if (dist >= minDist) continue;
          const push = (minDist - dist) * 0.5;
          const total = a.mass + b.mass;
          // Exact overlaps used to be skipped forever. Give identical centres a
          // stable opposite direction based on their ids so hordes untangle.
          const dir = dist < 0.001 ? (String(a.id) < String(b.id) ? -1 : 1) : (dx < 0 ? -1 : 1);
          a.x += dir * push * (b.mass / total);
          b.x -= dir * push * (a.mass / total);
        }
      }
    }
  }

  /* ------------------------------------------------------------ movement */

  moveEnemy(enemy, dt) {
    const T = CONFIG.TILE;
    const w = this.world;

    enemy.vy += CONFIG.GRAVITY * (dt * 60);
    if (enemy.vy > 18) enemy.vy = 18;

    const stepX = enemy.vx * (dt * 60);
    enemy.x += stepX;
    let blocked = false;
    const top = Math.floor(enemy.y / T);
    const bottom = Math.floor((enemy.y + enemy.h - 1) / T);
    if (stepX > 0) {
      const right = Math.floor((enemy.x + enemy.w - 1) / T);
      for (let ty = top; ty <= bottom; ty++) {
        if (w.isSolid(right, ty)) { enemy.x = right * T - enemy.w - 0.01; blocked = true; break; }
      }
    } else if (stepX < 0) {
      const left = Math.floor(enemy.x / T);
      for (let ty = top; ty <= bottom; ty++) {
        if (w.isSolid(left, ty)) { enemy.x = (left + 1) * T + 0.01; blocked = true; break; }
      }
    }

    enemy.climb = Math.max(0, (enemy.climb || 0) - dt * 0.6);
    if (blocked && enemy.onGround && enemy.state !== "wander" && enemy.climb < 3) {
      const probeX = Math.floor((enemy.x + (stepX > 0 ? enemy.w + 2 : -2)) / T);
      const footY = Math.floor((enemy.y + enemy.h - 1) / T);
      const fits = w.isSolid(probeX, footY) && !w.isSolid(probeX, footY - 1) &&
        !w.isSolid(probeX, footY - 2) && !w.isSolid(probeX, footY - 3);
      if (fits) {
        enemy.y -= T;
        enemy.x += stepX > 0 ? 3 : -3;
        enemy.climb += 1;
        blocked = false;
      }
    }

    enemy.y += enemy.vy * (dt * 60);
    enemy.onGround = false;
    const left = Math.floor((enemy.x + 3) / T);
    const right = Math.floor((enemy.x + enemy.w - 4) / T);
    if (enemy.vy > 0) {
      const bot = Math.floor((enemy.y + enemy.h - 1) / T);
      for (let tx = left; tx <= right; tx++) {
        if (w.isSolid(tx, bot)) { enemy.y = bot * T - enemy.h; enemy.vy = 0; enemy.onGround = true; break; }
        const info = TILE_INFO[w.get(tx, bot)];
        if (info?.platform) { enemy.y = bot * T - enemy.h; enemy.vy = 0; enemy.onGround = true; break; }
      }
    } else if (enemy.vy < 0) {
      const tp = Math.floor(enemy.y / T);
      for (let tx = left; tx <= right; tx++) {
        if (w.isSolid(tx, tp)) { enemy.y = (tp + 1) * T; enemy.vy = 0; break; }
      }
    }

    enemy.x = Math.max(T, Math.min(CONFIG.WORLD_W * T - T * 2, enemy.x));
    if (enemy.y > CONFIG.WORLD_H * T) enemy.alive = false;
    return blocked;
  }

  clawAtObstacle(enemy, dt) {
    const T = CONFIG.TILE;
    const tx = Math.floor((enemy.x + enemy.w / 2 + enemy.dir * (enemy.w / 2 + 4)) / T);
    const ty = Math.floor((enemy.y + enemy.h * 0.55) / T);
    const tile = this.world.get(tx, ty);
    if (tile === TILE.AIR) return null;
    const info = TILE_INFO[tile];
    if (!info || !info.solid || info.hp <= 0) return null;
    const power = (enemy.type === "heavy" ? 26 : 12) * dt * 4;
    const result = this.world.mine(tx, ty, power);
    if (result && result.broken) return { x: tx, y: ty, tile };
    return null;
  }

  enemyAnimationState(enemy) {
    if (enemy.knocked > 0) return 'knocked';
    if (enemy.getUp > 0) return 'getup';
    if (enemy.stagger > 0) return 'stagger';
    if (enemy.hurtTimer > 0) return 'hurt';
    if (enemy.attackWindup > 0) return 'attack_windup';
    if (enemy.attackCooldown > Math.max(0, enemy.attackCooldownTime - .22)) return 'attack';
    if (enemy.state === 'dormant') return 'dormant';
    if (enemy.lurchTimer > 0) return 'lurch';
    if (enemy.state === 'chase') return 'chase';
    if (enemy.state === 'investigate' || enemy.state === 'search') return 'investigate';
    if (Math.abs(enemy.vx) > .06) return 'walk';
    return 'idle';
  }

  // Weight, direction and a final resting position — nothing graphic. The body
  // pivots on its feet, slides a little with the knockback, then settles and
  // fades. onBodyDown fires once, when it actually hits the floor.
  updateDying(enemy, dt) {
    const d = enemy.dying;
    d.t += dt;
    const fall = Math.min(1, d.t / .42);
    d.rot = (1 - Math.pow(1 - fall, 2.4)) * (Math.PI / 2 - .14) * d.dir;
    if (Math.abs(d.vx) > .01) {
      enemy.x += d.vx * dt * 34;
      d.vx *= Math.pow(.02, dt);
    }
    if (!d.landed && fall >= 1) {
      d.landed = true;
      this.onBodyDown?.(enemy, d.dir);
    }
    d.alpha = d.t > d.total - .9 ? Math.max(0, (d.total - d.t) / .9) : 1;
    if (d.t >= d.total) enemy.dying = null;
  }

  updateEnemyAnimation(enemy, dt) {
    const state = this.enemyAnimationState(enemy);
    enemy.animState = state;
    enemy.animator?.set(state);
    const rate = ['walk','investigate','chase','lurch'].includes(state)
      ? Math.max(.55, Math.abs(enemy.vx) / Math.max(.1, enemy.speed)) : 1;
    enemy.animator?.update(dt, rate);
  }

  /* ------------------------------------------------------------------ AI */

  update(dt, player, callbacks = {}) {
    this.noiseLevel = Math.max(0, this.noiseLevel - dt * 24);
    for (const n of this.noises) n.life -= dt;
    if (this.noises.length) this.noises = this.noises.filter(n => n.life > 0);

    const pc = player.center();
    const visibilityScale = Math.max(.35, Math.min(1.35, callbacks.visibilityScale ?? 1));
    const stealth = (player.crouching ? 0.45 : 1) * visibilityScale;

    for (const enemy of this.enemies) {
      if (!enemy.alive) {
        if (enemy.dying) this.updateDying(enemy, dt);
        continue;
      }

      const far = Math.abs(enemy.x - pc.x) > 52 * CONFIG.TILE;
      if (far) { enemy.vx = 0; this.moveEnemy(enemy, dt); continue; }

      if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
      if (enemy.attackWindup > 0) enemy.attackWindup -= dt;
      if (enemy.hurtTimer > 0) enemy.hurtTimer -= dt;
      if (enemy.flash > 0) enemy.flash -= dt;
      if (enemy.screamCooldown > 0) enemy.screamCooldown -= dt;
      if (enemy.lurchCooldown > 0) enemy.lurchCooldown -= dt;
      if (enemy.lurchTimer > 0) enemy.lurchTimer -= dt;
      this.updateEnemyAnimation(enemy, dt);

      // staggered or knocked down: no movement, no attack, real recovery time
      if (enemy.knocked > 0) {
        enemy.knocked -= dt;
        enemy.vx *= 0.8;
        this.moveEnemy(enemy, dt);
        if (enemy.knocked <= 0) {
          enemy.getUp = 0.55;
          callbacks.onGetUp?.(enemy);
        }
        continue;
      }
      if (enemy.getUp > 0) {
        enemy.getUp -= dt;
        enemy.vx = 0;
        this.moveEnemy(enemy, dt);
        continue;
      }
      if (enemy.stagger > 0) {
        enemy.stagger -= dt;
        enemy.vx *= 0.7;
        enemy.attackWindup = 0;
        this.moveEnemy(enemy, dt);
        continue;
      }

      // ambient voice so a building full of infected is audible before it is visible
      enemy.voiceTimer -= dt;
      if (enemy.voiceTimer <= 0) {
        enemy.voiceTimer = (enemy.state === 'chase' ? 1.6 : 6) + this.rand(Math.floor(enemy.x)) * 6;
        callbacks.onVoice?.(enemy, enemy.state === 'chase' ? 'attack' : 'idle');
      }
      if (enemy.memory > 0) enemy.memory -= dt;
      if (enemy.idleTimer > 0) enemy.idleTimer -= dt;
      if (enemy.searchTimer > 0) enemy.searchTimer -= dt;
      enemy.alert = Math.max(0, enemy.alert - dt * 0.35);
      enemy.animTime += dt * (enemy.state === "chase" ? 8 : enemy.state === "investigate" ? 5 : 3);
      enemy.statePulse = Math.max(0, enemy.statePulse - dt);

      const ec = { x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h / 2 };
      const dist = Math.hypot(pc.x - ec.x, pc.y - ec.y);
      const facingPlayer = Math.sign(pc.x - ec.x) === enemy.dir;
      const visionRange = enemy.vision * CONFIG.TILE * (facingPlayer ? 1 : 0.45) * stealth;
      const canSee = dist <= visionRange && this.lineOfSight(enemy, player);
      const noise = canSee ? null : this.nearestNoise(enemy);

      // ---- dormant: standing in the dark until something wakes them ----
      if (enemy.state === "dormant") {
        enemy.vx = 0;
        this.moveEnemy(enemy, dt);
        const closeEnough = dist < 5 * CONFIG.TILE * stealth && this.lineOfSight(enemy, player);
        if (noise || closeEnough) {
          enemy.dormant = false;
          enemy.state = closeEnough ? "chase" : "investigate";
          enemy.targetX = noise ? noise.x : pc.x;
          enemy.lastKnownX = enemy.targetX;
          enemy.memory = 6;
          enemy.statePulse = .6;
          callbacks.onWake?.(enemy);
        }
        continue;
      }

      // ---- perception ---------------------------------------------------
      if (canSee) {
        if (enemy.state !== "chase") {
          enemy.statePulse = .5;
          callbacks.onSpot?.(enemy);
          this.screech(enemy);
        }
        // the screamer's whole job: convert sight of you into a crowd
        if (enemy.isScreamer && enemy.screamCooldown <= 0) {
          enemy.screamCooldown = 12;
          this.emitNoise(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 820, "grito");
          callbacks.onScream?.(enemy);
        }
        enemy.state = "chase";
        enemy.alert = 1;
        enemy.targetX = pc.x;
        enemy.lastKnownX = pc.x;
        enemy.memory = enemy.type === "runner" ? 5 : 3.6;
      } else if (noise) {
        enemy.alert = Math.min(1, enemy.alert + 0.5);
        if (enemy.state !== "chase" || enemy.memory <= 0) {
          if (enemy.state === "wander") enemy.statePulse = .35;
          enemy.state = "investigate";
          enemy.targetX = noise.x;
          enemy.lastKnownX = noise.x;
          enemy.memory = 3.4;
        }
      } else if (enemy.memory <= 0) {
        if (enemy.state === "chase") {
          // lost them: go to where they were last seen and look around
          enemy.state = "search";
          enemy.targetX = enemy.lastKnownX ?? enemy.x;
          enemy.searchTimer = 6 + this.rand(Math.floor(enemy.x)) * 5;
          enemy.screeched = false;
        } else if (enemy.state === "investigate" && Math.abs(enemy.x - enemy.targetX) < 26) {
          enemy.state = "search";
          enemy.searchTimer = 4 + this.rand(Math.floor(enemy.x)) * 4;
        } else if (enemy.state === "search" && enemy.searchTimer <= 0) {
          enemy.state = "wander";
          enemy.screeched = false;
          enemy.idleTimer = .6 + this.rand(Math.floor(enemy.x)) * 1.8;
          enemy.targetX = enemy.homeX + (this.rand(enemy.id.length * 97 + Math.floor(enemy.x)) - .5) * 260;
        }
      }

      // ---- movement per state -------------------------------------------
      if (enemy.state === "search") {
        // pace around the last known position instead of standing still
        if (Math.abs(enemy.x - enemy.targetX) < 20) {
          enemy.targetX = (enemy.lastKnownX ?? enemy.x) + (this.rand(Math.floor(enemy.animTime * 3)) - .5) * 180;
        }
      } else if (enemy.state === "wander" && Math.abs(enemy.x - enemy.targetX) < 20 && enemy.idleTimer <= 0) {
        enemy.idleTimer = .8 + this.rand(Math.floor(enemy.x) * 13) * 2.4;
        enemy.targetX = enemy.homeX + (this.rand(Math.floor(enemy.x) * 17 + Math.floor(enemy.animTime)) - .5) * 280;
      }

      const dir = enemy.targetX >= enemy.x + enemy.w / 2 ? 1 : -1;
      const idling = enemy.state === "wander" && enemy.idleTimer > 0 && Math.abs(enemy.x - enemy.targetX) < 24;
      if (!idling) enemy.dir = dir;

      if (enemy.lurches && enemy.state === 'chase' && enemy.lurchCooldown <= 0 && dist > CONFIG.TILE * 1.5 && dist < CONFIG.TILE * 7) {
        enemy.lurchTimer = .42;
        enemy.lurchCooldown = 4.2 + this.rand(Math.floor(enemy.x + enemy.animTime * 31)) * 4.6;
        enemy.statePulse = Math.max(enemy.statePulse, .25);
        callbacks.onLurch?.(enemy);
      }

      const chaseScale = enemy.type === "runner" ? 1.25 : enemy.type === "stalker" ? 1.12 : enemy.type === "heavy" || enemy.type === 'armored' ? .98 : 1.12;
      let speedScale = enemy.state === "chase" ? chaseScale
        : enemy.state === "investigate" ? .9
        : enemy.state === "search" ? .68 : .48;
      if (enemy.lurchTimer > 0) speedScale *= 1.7;
      const desiredVx = idling || enemy.attackWindup > 0 ? 0 : enemy.dir * enemy.speed * speedScale;
      const accelStep = enemy.accel * (dt * 60) * (enemy.lurchTimer > 0 ? 1.45 : 1);
      const deltaV = desiredVx - enemy.vx;
      enemy.vx += Math.max(-accelStep, Math.min(accelStep, deltaV));

      const blocked = this.moveEnemy(enemy, dt);

      if (blocked && (enemy.state === "chase" || enemy.state === "investigate")) {
        enemy.blockedTimer += dt;
        if (enemy.blockedTimer > 0.6) {
          const broke = this.clawAtObstacle(enemy, dt);
          if (broke) {
            enemy.blockedTimer = 0;
            callbacks.onBreak?.(enemy, broke);
          }
        }
      } else enemy.blockedTimer = 0;

      // ---- attack --------------------------------------------------------
      // Contact is a real box overlap plus a short reach, so nothing lands a
      // hit from across the room any more.
      const inReach =
        player.x < enemy.x + enemy.w + enemy.reach &&
        player.x + player.w > enemy.x - enemy.reach &&
        player.y < enemy.y + enemy.h &&
        player.y + player.h > enemy.y;

      if (inReach && enemy.attackCooldown <= 0 && enemy.attackWindup <= 0) {
        enemy.attackWindup = enemy.attackWindupTime;
        enemy.attackWindupTotal = enemy.attackWindupTime;
        callbacks.onWindup?.(enemy);
      } else if (enemy.attackWindup > 0 && enemy.attackWindup <= dt) {
        enemy.attackWindup = 0;
        enemy.attackCooldown = enemy.attackCooldownTime;
        // the strike only connects if the player is still there when it lands
        if (inReach) {
          const region = this.world.region(Math.floor(enemy.x / CONFIG.TILE));
          const risk = region?.id === 'blackridge' ? 1.18 : region?.id === 'downtown' ? 1.08 : 1;
          callbacks.onPlayerHit?.(enemy.damage * risk, enemy.x + enemy.w / 2, enemy);
        } else callbacks.onMiss?.(enemy);
      }
    }

    this.separate(dt);

    this.respawnTimer -= dt;
    if (this.respawnTimer <= 0) {
      this.respawnTimer = 45 + this.rand(Math.floor(performance.now() / 1000)) * 40;
      const alive = this.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0);
      if (alive < this.baseCount && callbacks.camera) {
        this.spawnOffscreen(player, callbacks.camera, callbacks.viewW || 1280, callbacks.viewH || 720);
      }
    }
    if (this.enemies.length > 260) this.enemies = this.enemies.filter(e => e.alive || e.dying);
    else if (this.enemies.length && (this.cleanupTick = (this.cleanupTick || 0) + 1) > 120) {
      this.cleanupTick = 0;
      this.enemies = this.enemies.filter(e => e.alive || e.dying);
    }
  }

  /* ------------------------------------------------------------- combat */

  meleePathClear(x1, y1, x2, y2) {
    const steps = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 10));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const tx = Math.floor((x1 + (x2 - x1) * t) / CONFIG.TILE);
      const ty = Math.floor((y1 + (y2 - y1) * t) / CONFIG.TILE);
      if (this.world.isSolid(tx, ty)) return false;
    }
    return true;
  }

  // Swings are resolved against a real box in front of the player. Everything
  // inside it is hit, up to the weapon's target count, closest first.
  swing(box, opts = {}) {
    const targets = [];
    const cx = box.x + box.w / 2;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (enemy.x >= box.x + box.w || enemy.x + enemy.w <= box.x) continue;
      if (enemy.y >= box.y + box.h || enemy.y + enemy.h <= box.y) continue;
      if (opts.fromY != null && !this.meleePathClear(opts.fromX ?? cx, opts.fromY, enemy.x + enemy.w / 2, enemy.y + enemy.h * .45)) continue;
      targets.push(enemy);
    }
    if (!targets.length) return { hit: false, killed: 0, results: [] };

    targets.sort((a, b) => Math.abs(a.x + a.w / 2 - cx) - Math.abs(b.x + b.w / 2 - cx));
    const max = Math.max(1, opts.targets || 1);
    const results = [];
    let killed = 0;

    for (let i = 0; i < targets.length && i < max; i++) {
      const enemy = targets[i];
      const falloff = i === 0 ? 1 : 0.7;             // secondary targets take less
      const res = this.applyHit(enemy, opts.damage * falloff, {
        ...opts,
        knockback: (opts.knockback || 2) * falloff,
        fromX: opts.fromX ?? cx
      });
      results.push(res);
      if (res.killed) killed++;
    }
    return { hit: true, killed, results, enemy: results[0].enemy, sneak: results[0].sneak };
  }

  // Shared by melee, gunfire and companions.
  applyHit(enemy, damage, opts = {}) {
    const fromX = opts.fromX ?? enemy.x;
    const facingAway = Math.sign(fromX - (enemy.x + enemy.w / 2)) !== enemy.dir;
    const sneak = enemy.dormant || (enemy.state !== 'chase' && facingAway);
    const armor = opts.ignoreArmor ? 0 : enemy.armor;
    let dealt = damage * (1 - armor);
    if (sneak) dealt *= opts.sneakMultiplier || 2.2;

    enemy.hp -= dealt;
    enemy.hurtTimer = .22;
    enemy.flash = .12;
    enemy.dormant = false;
    enemy.attackWindup = 0;

    const dir = fromX <= enemy.x + enemy.w / 2 ? 1 : -1;
    const knock = (opts.knockback || 2) / Math.max(.5, enemy.mass);
    enemy.vx = dir * knock;
    enemy.vy = Math.min(enemy.vy, -1.2 - knock * .18);

    // heavy impacts put them on the ground; lighter ones only interrupt
    const staggerPower = (opts.stagger || 1) * knock * (enemy.staggerResist ?? 1);
    if (staggerPower > 4.2 && enemy.mass < 2.4) {
      enemy.knocked = Math.max(enemy.knocked, .55 + staggerPower * .06);
      enemy.stagger = 0;
    } else {
      enemy.stagger = Math.max(enemy.stagger, .18 + staggerPower * .05);
    }

    if (enemy.state !== 'chase') {
      enemy.state = 'chase';
      this.screech(enemy);
    }
    enemy.targetX = fromX;
    enemy.lastKnownX = fromX;
    enemy.memory = 5;

    if (enemy.hp <= 0) {
      // `alive` stays the gameplay flag — AI, targeting and counts all treat
      // this one as gone. `dying` is purely the body finishing its fall, so a
      // kill no longer makes an infected vanish mid-frame.
      enemy.alive = false;
      enemy.dying = {
        t: 0,
        total: 3.2,
        dir: Math.sign(enemy.vx) || (fromX != null ? Math.sign(enemy.x - fromX) : 0) || -enemy.dir || 1,
        vx: enemy.vx * .55,
        landed: false
      };
      this.kills += 1;
      return { enemy, killed: true, sneak, dealt };
    }
    return { enemy, killed: false, sneak, dealt };
  }

  // Hitscan for firearms: walks the line and stops at the first body or wall.
  shoot(originX, originY, dirX, dirY, opts = {}) {
    const range = opts.range || 300;
    const steps = Math.ceil(range / 8);
    for (let i = 1; i <= steps; i++) {
      const t = (i / steps) * range;
      const x = originX + dirX * t;
      const y = originY + dirY * t;
      const tx = Math.floor(x / CONFIG.TILE), ty = Math.floor(y / CONFIG.TILE);
      if (this.world.isSolid(tx, ty)) return { blocked: true, x, y, distance: t };
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        if (x < enemy.x || x > enemy.x + enemy.w) continue;
        if (y < enemy.y || y > enemy.y + enemy.h) continue;
        const res = this.applyHit(enemy, opts.damage || 20, {
          knockback: opts.knockback || 3,
          fromX: originX,
          stagger: 1.2,
          ignoreArmor: opts.ignoreArmor,
          sneakMultiplier: 1.5
        });
        return { ...res, hit: true, x, y, distance: t };
      }
    }
    return { miss: true, x: originX + dirX * range, y: originY + dirY * range, distance: range };
  }

  // kept so older call sites (companions) keep working
  attack(player, range, damage, opts = {}) {
    const pc = player.center();
    const box = {
      x: player.facing > 0 ? player.x + player.w * .4 : player.x + player.w * .6 - range,
      y: player.y + 6,
      w: range,
      h: player.h - 10
    };
    return this.swing(box, { ...opts, damage, fromX: pc.x });
  }

  nearbyThreat(player, radiusTiles = 9) {
    const pc = player.center();
    let count = 0, chasing = 0, heavy = false, stalkerChasing = false, searching = 0;
    const r2 = (radiusTiles * CONFIG.TILE) ** 2;
    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.state === 'dormant') continue;
      const dx = enemy.x + enemy.w / 2 - pc.x;
      const dy = enemy.y + enemy.h / 2 - pc.y;
      if (dx * dx + dy * dy <= r2) {
        count++;
        if (enemy.state === "chase") {
          chasing++;
          if (enemy.type === "stalker") stalkerChasing = true;
        } else if (enemy.state === "search" || enemy.state === "investigate") searching++;
        if (enemy.type === "heavy") heavy = true;
      }
    }
    return { count, chasing, searching, heavy, stalkerChasing };
  }

  /* ------------------------------------------------------------ drawing */

  // A body that has finished its fall: rotated onto the ground on the side it
  // was knocked toward, with the shadow flattening out under it.
  drawBody(ctx, enemy, x, y) {
    const d = enemy.dying;
    const spr = ASSETS.ready(`sprite:infected:${enemy.sheet}`) || ASSETS.ready(`sprite:infected:${enemy.visual}`);
    const layout = INFECTED_SPRITE_LAYOUT;
    const frame = INFECTED_ANIMATIONS.knocked.frames[0];
    const lean = Math.abs(d.rot) / (Math.PI / 2);

    ctx.save();
    ctx.globalAlpha = d.alpha ?? 1;
    ctx.fillStyle = "rgba(8,10,9,.2)";
    ctx.beginPath();
    ctx.ellipse(x + enemy.w / 2 + d.dir * lean * 9, y + enemy.h + 1, 11 + lean * 9, 4 - lean * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(x + enemy.w / 2, y + enemy.h);
    ctx.rotate(d.rot);
    ctx.translate(-(x + enemy.w / 2), -(y + enemy.h));
    ctx.translate(x + (enemy.dir < 0 ? enemy.w : 0), 0);
    if (enemy.dir < 0) ctx.scale(-1, 1);
    if (spr) {
      ctx.drawImage(spr, frame * layout.frameW, 0, layout.frameW, layout.frameH,
        enemy.w / 2 - layout.cx, y + enemy.h - layout.ground, layout.drawW, layout.drawH);
    }
    ctx.restore();
  }


  draw(ctx, cameraX, cameraY, lighting = null) {
    ctx.imageSmoothingEnabled = false;
    for (const enemy of this.enemies) {
      if (!enemy.alive && !enemy.dying) continue;

      const x = Math.round(enemy.x - cameraX);
      const y = Math.round(enemy.y - cameraY);
      if (x < -70 || x > ctx.canvas.width + 70 || y < -90 || y > ctx.canvas.height + 90) continue;

      if (!enemy.alive) { this.drawBody(ctx, enemy, x, y); continue; }

      const animState = this.enemyAnimationState(enemy);
      if (animState !== enemy.animState) { enemy.animState = animState; enemy.animator?.set(animState); }
      let progress = null;
      if (animState === 'attack_windup' && enemy.attackWindupTotal > 0) progress = 1 - enemy.attackWindup / enemy.attackWindupTotal;
      const frame = enemy.animator?.frame(progress) ?? 0;

      const spr = ASSETS.ready(`sprite:infected:${enemy.sheet}`) || ASSETS.ready(`sprite:infected:${enemy.visual}`);

      const bulk = enemy.type === "heavy" || enemy.type === "contained" ? 1.25 : enemy.type === "armored" ? 1.12 : enemy.type === "runner" ? .88 : 1;
      const grounded = enemy.knocked > 0 || enemy.getUp > 0;

      ctx.save();
      ctx.fillStyle = "rgba(8,10,9,.19)";
      ctx.beginPath();
      ctx.ellipse(x + enemy.w / 2, y + enemy.h + 1, (grounded ? 17 : 12) * bulk, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(6,8,8,.24)";
      ctx.beginPath();
      ctx.ellipse(x + enemy.w / 2, y + enemy.h + 1, (grounded ? 10 : 6.5) * bulk, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // knocked down: rotate the body rather than showing anything graphic
      if (enemy.knocked > 0 || enemy.getUp > 0) {
        const t = enemy.knocked > 0 ? 1 : 1 - Math.min(1, (0.55 - enemy.getUp) / 0.55);
        ctx.translate(x + enemy.w / 2, y + enemy.h);
        ctx.rotate(enemy.dir * 1.35 * t);
        ctx.translate(-(x + enemy.w / 2), -(y + enemy.h));
      }

      ctx.translate(x + (enemy.dir < 0 ? enemy.w : 0), 0);
      if (enemy.dir < 0) ctx.scale(-1, 1);
      if (enemy.hurtTimer > 0) ctx.globalAlpha = .9;   // the additive flash carries the hit, not transparency
      if (enemy.state === "dormant") ctx.globalAlpha = .82;

      if (spr) {
        const layout = INFECTED_SPRITE_LAYOUT;
        // Mass differences are already drawn into the form sheets, so the
        // runtime scale is only a nudge. Anchor off the sole row and the centre
        // column so a scaled sprite still stands exactly on the ground line.
        const scale = enemy.type === "heavy" ? 1.08 : enemy.type === 'contained' ? 1.06 : enemy.type === 'armored' ? 1.04 : enemy.type === "runner" ? .96 : 1;
        const dx = enemy.w / 2 - layout.cx * scale;
        const dy = y + enemy.h - layout.ground * scale;
        const dw = layout.drawW * scale, dh = layout.drawH * scale;
        ctx.drawImage(spr, frame * layout.frameW, 0, layout.frameW, layout.frameH, dx, dy, dw, dh);
        const rim = lighting ? actorRimOffset(lighting.sampleAt(enemy.x + enemy.w / 2, enemy.y + enemy.h * .4), .85) : null;
        if (rim) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = rim.alpha;
          ctx.drawImage(spr, frame * layout.frameW, 0, layout.frameW, layout.frameH, dx + rim.x, dy + rim.y, dw, dh);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        }
        if (enemy.flash > 0) {
          ctx.globalAlpha = Math.min(1, enemy.flash * 7);
          ctx.globalCompositeOperation = 'lighter';
          ctx.drawImage(spr, frame * layout.frameW, 0, layout.frameW, layout.frameH, dx, dy, dw, dh);
          ctx.globalCompositeOperation = 'source-over';
        }
      } else {
        ctx.fillStyle = enemy.type === "runner" ? "#66584e" : "#536057";
        ctx.fillRect(4, y + 18, enemy.w - 8, enemy.h - 22);
      }
      ctx.restore();

      if (enemy.isScreamer && enemy.state === 'chase' && enemy.screamCooldown > 10.5) {
        ctx.save();
        const t = (12 - enemy.screamCooldown) / 1.5;
        ctx.strokeStyle = `rgba(212,150,90,${(1 - t) * .8})`;
        ctx.lineWidth = 2;
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          ctx.arc(x + enemy.w / 2, y + 14, 16 + r * 14 + t * 30, -0.9, 0.9);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x + enemy.w / 2, y + 14, 16 + r * 14 + t * 30, Math.PI - 0.9, Math.PI + 0.9);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (enemy.attackWindup > 0) {
        const t = 1 - enemy.attackWindup / Math.max(.01, enemy.attackWindupTotal || enemy.attackWindupTime || .36);
        ctx.save();
        ctx.strokeStyle = `rgba(196,100,92,${.35 + t * .5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + enemy.w / 2, y + enemy.h / 2, 22 + t * 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (enemy.state !== "wander" && enemy.state !== "dormant") {
        const mark = ASSETS.ready(enemy.state === "chase" ? "ui:threat:chase" : "ui:threat:investigate");
        if (mark) {
          const bob = enemy.state === "chase" ? Math.sin(enemy.animTime * 6) * 2 : 0;
          ctx.globalAlpha = enemy.state === "chase" ? 1 : .75;
          ctx.drawImage(mark, x + enemy.w / 2 - 9, y - 24 + bob, 18, 18);
          ctx.globalAlpha = 1;
        }
      }

      if (enemy.hp < enemy.maxHp) {
        const w = Math.max(24, enemy.w + 4);
        ctx.fillStyle = "rgba(16,16,16,.7)";
        ctx.fillRect(x - 2, y - 10, w, 4);
        ctx.fillStyle = enemy.type === "heavy" ? "#9b6c4a" : "#9f4340";
        ctx.fillRect(x - 2, y - 10, w * (enemy.hp / enemy.maxHp), 4);
      }
    }

    for (const noise of this.noises) {
      const x = noise.x - cameraX, y = noise.y - cameraY;
      const r = noise.radius * (1 - noise.life * .22);
      ctx.strokeStyle = `rgba(216,208,183,${(noise.life * .14).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
