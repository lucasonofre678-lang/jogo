class FXSystem {
  constructor(seed = 1) {
    this.seed = seed >>> 0;
    this.particles = [];
    this.slashes = [];
    this.screenFlash = 0;
    this.screenFlashColor = '255,255,255';
    this.shake = 0;
    this.stepTimer = 0;
    this.wasGrounded = true;
    this.ambientTimer = 0;
    this.time = 0;
  }

  rand(n = 0) {
    let x = ((n * 997) + this.seed + Math.floor(this.time * 1000)) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  particle(x, y, options = {}) {
    this.particles.push({
      x, y,
      vx: options.vx ?? 0,
      vy: options.vy ?? 0,
      gravity: options.gravity ?? 0,
      drag: options.drag ?? .98,
      life: options.life ?? .5,
      maxLife: options.life ?? .5,
      size: options.size ?? 3,
      color: options.color ?? '#d8cfb8',
      alpha: options.alpha ?? 1,
      world: options.world !== false,
      kind: options.kind || 'square',
      rotation: options.rotation || 0,
      spin: options.spin || 0
    });
  }

  dust(x, y, count = 7, strength = 1) {
    for (let i = 0; i < count; i++) {
      const r = this.rand(i + this.particles.length);
      this.particle(x + (r - .5) * 18, y, {
        vx: (r - .5) * 38 * strength,
        vy: -(12 + this.rand(i + 14) * 26) * strength,
        gravity: -5,
        drag: .94,
        life: .35 + this.rand(i + 41) * .28,
        size: 2 + this.rand(i + 73) * 4,
        color: i % 2 ? '#b9ab8d' : '#756957',
        alpha: .55,
        kind: 'circle'
      });
    }
  }

  debris(x, y, color = '#777', count = 8, hard = false) {
    for (let i = 0; i < count; i++) {
      const a = this.rand(i + this.particles.length) * Math.PI * 2;
      const speed = (25 + this.rand(i + 20) * (hard ? 88 : 54));
      this.particle(x, y, {
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 28,
        gravity: 165,
        drag: .98,
        life: .42 + this.rand(i + 50) * .35,
        size: 2 + this.rand(i + 80) * (hard ? 4 : 3),
        color,
        rotation: a,
        spin: (this.rand(i + 130) - .5) * 10
      });
    }
  }

  impact(x, y, color = '#e9dec1', count = 8) {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI * .75 + this.rand(i + 3) * Math.PI * 1.5;
      const speed = 65 + this.rand(i + 24) * 105;
      this.particle(x, y, {
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        gravity: 70,
        drag: .965,
        life: .18 + this.rand(i + 61) * .22,
        size: 2 + this.rand(i + 82) * 3,
        color,
        kind: i % 3 === 0 ? 'streak' : 'square'
      });
    }
  }

  // What comes off a hit. Deliberately small and short-lived: the goal is
  // weight, not a fireworks display. `spark` is the share of particles that
  // fly as hot streaks instead of tumbling chips.
  impactAt(x, y, material = 'flesh', dirX = -1, dirY = 0, power = 1) {
    const m = FXSystem.MATERIALS[material] || FXSystem.MATERIALS.flesh;
    const base = Math.atan2(dirY, dirX);
    const n = Math.round(m.count * Math.min(1.8, power));
    for (let i = 0; i < n; i++) {
      const r = this.rand(i * 3 + 7);
      const a = base + (this.rand(i + 11) - .5) * m.cone;
      const speed = m.speed * (.45 + r * .9) * power;
      const isSpark = this.rand(i + 29) < m.spark;
      this.particle(x, y, {
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - m.lift,
        gravity: m.gravity,
        drag: isSpark ? .9 : .95,
        life: m.life * (.6 + r * .7),
        size: (isSpark ? m.size * .7 : m.size) * (.7 + r * .7),
        color: m.colors[i % m.colors.length],
        alpha: isSpark ? 1 : .92,
        kind: isSpark ? 'streak' : 'square',
        spin: (r - .5) * 12
      });
    }
    if (m.smoke) this.smoke(x, y, { count: 2, rise: 24, life: .5, size: 3, color: m.smokeColor });
  }

  // Soft expanding puff. One kind of smoke, tuned by the caller.
  smoke(x, y, opts = {}) {
    const n = opts.count ?? 3;
    const rgb = opts.color || '158,152,140';
    const alpha = (opts.alpha ?? .34).toFixed(2);
    for (let i = 0; i < n; i++) {
      const r = this.rand(i + 53);
      this.particle(x + (r - .5) * 4, y + (r - .5) * 3, {
        vx: (opts.vx || 0) + (r - .5) * 26,
        vy: -(opts.rise ?? 30) * (.5 + r * .8),
        gravity: -6,
        drag: .93,
        life: (opts.life ?? .55) * (.7 + r * .6),
        size: (opts.size ?? 4) * (.7 + r * .8),
        color: 'rgba(' + rgb + ',' + alpha + ')',
        alpha: 1,
        kind: 'smoke',
        spin: (r - .5) * 2
      });
    }
  }

  // Ejected brass, thrown up and to the weak side of the weapon.
  shellEject(x, y, facing, kind = 'pistol') {
    if (kind === 'shotgun') return;                       // pumps hold the hull
    const r = this.rand(97);
    this.particle(x, y, {
      vx: -facing * (30 + r * 40),
      vy: -110 - r * 60,
      gravity: 520,
      drag: .99,
      life: .6 + r * .25,
      size: kind === 'rifle' ? 2.2 : 1.8,
      color: '#c8a85c',
      alpha: 1,
      kind: 'square',
      spin: 18 + r * 14
    });
  }

  slash(player, range = 46, color = '#e8dcc0') {
    const c = player.center();
    this.slashes.push({
      x: c.x + player.facing * 12,
      y: c.y,
      facing: player.facing,
      radius: Math.max(28, Math.min(68, range * .78)),
      life: .16,
      maxLife: .16,
      color
    });
  }

  hitPlayer(player) {
    const c = player.center();
    this.impact(c.x, c.y, '#d88e7e', 9);
    this.screenFlash = .24;
    this.screenFlashColor = '164,58,52';
    this.shake = Math.max(this.shake, 7.5);
  }

  hitEnemy(enemy, killed = false, opts = {}) {
    const x = enemy.x + enemy.w / 2, y = enemy.y + enemy.h * .42;
    const dir = opts.dir ?? -1;
    // The strike material reads first (sparks off a pipe, chips off an axe),
    // then a small stylised spatter. No pools, no gore.
    this.impactAt(x, y, opts.material || 'blunt', dir * .55, -.45, killed ? 1.35 : 1);
    this.impactAt(x, y, 'flesh', dir * .8, -.3, killed ? 1.1 : .6);
    this.shake = Math.max(this.shake, killed ? 5.2 : 2.8);
  }

  // An infected going down: a scuff of ground where it lands, nothing graphic.
  enemyDown(enemy, dir = 1) {
    const x = enemy.x + enemy.w / 2 + dir * 8;
    const y = enemy.y + enemy.h;
    this.impactAt(x, y, this.looseGround ? 'dirt' : 'stone', dir * .6, -.7, .9);
    this.smoke(x, y - 2, { count: 3, rise: 12, life: .5, size: 4, alpha: .22, color: '142,134,118' });
  }

  mining(x, y, tile, broken = false) {
    const colors = {
      [TILE.GRASS]: '#718653',
      [TILE.DIRT]: '#775740',
      [TILE.STONE]: '#73777a',
      [TILE.WOOD]: '#835d40',
      [TILE.LEAF]: '#58734c',
      [TILE.BERRY_BUSH]: '#617b51',
      [TILE.CONCRETE]: '#838889',
      [TILE.BRICK]: '#8b584b',
      [TILE.PLANK]: '#8c6645',
      [TILE.GLASS]: '#91bac5',
      [TILE.ASPHALT]: '#5d6163',
      [TILE.METAL]: '#71797d'
    };
    const hard = [TILE.STONE, TILE.METAL, TILE.CONCRETE, TILE.BRICK].includes(tile);
    this.debris(x, y, colors[tile] || '#777', broken ? 11 : 4, hard);
    if (hard) this.shake = Math.max(this.shake, broken ? 2.8 : 1.2);
  }

  build(x, y) {
    this.grit(x, y, 5, .6);
    this.shake = Math.max(this.shake, .9);
  }

  trackPlayer(player, sprinting, moving, dt) {
    if (!this.wasGrounded && player.onGround) {
      // landing raises a puff only on loose ground, and only from a real drop
      const drop = Math.abs(player.vy);
      if (this.looseGround && drop > 6) {
        this.grit(player.x + player.w / 2, player.y + player.h, 5, .7);
      }
      this.shake = Math.max(this.shake, Math.min(2.2, drop * .16));
    }
    this.wasGrounded = player.onGround;

    this.stepTimer -= dt;
    if (!player.onGround || !moving || this.stepTimer > 0) return;
    this.stepTimer = sprinting ? .17 : player.crouching ? .5 : .3;
    this.stepped = true;                       // the loop turns this into a sound

    // Dust is the exception, not the rule: only running, only on dry, loose
    // ground, and only a few small grains kicked backwards.
    if (!sprinting || !this.looseGround) return;
    this.grit(player.x + player.w / 2 - player.facing * 7, player.y + player.h, 3, .55, -player.facing);
  }

  // Small, short-lived grains — deliberately not a smoke puff.
  grit(x, y, count, strength, dir = 0) {
    const color = this.groundColor || '#8a7a63';
    for (let i = 0; i < count; i++) {
      const r = this.rand(i + this.particles.length);
      this.particle(x + (r - .5) * 8, y - 1, {
        vx: (dir * 16 + (r - .5) * 18) * strength,
        vy: -(6 + r * 12) * strength,
        gravity: 120,
        drag: .93,
        life: .2 + r * .16,
        size: 1 + r * 1.4,
        color,
        alpha: .38,
        kind: 'square'
      });
    }
  }

  // Muzzle flash: one bright frame, no lingering glow.
  // Angle is the real barrel direction, so the flash, the sparks and the smoke
  // all leave the muzzle instead of the middle of the player.
  muzzleFlash(x, y, angle, power = 1) {
    this.flashes = this.flashes || [];
    this.flashes.push({ x, y, angle, power, life: .075, maxLife: .075 });
    const n = Math.round(5 + power * 5);
    for (let i = 0; i < n; i++) {
      const r = this.rand(i + 3);
      const a = angle + (r - .5) * .55;
      this.particle(x, y, {
        vx: Math.cos(a) * (90 + r * 230) * power,
        vy: Math.sin(a) * (90 + r * 230) * power,
        gravity: 90,
        drag: .88,
        life: .08 + r * .13,
        size: 1 + r * 2,
        color: r > .5 ? '#f8e6ad' : '#dfa054',
        alpha: .95,
        kind: 'streak'
      });
    }
    this.smoke(x, y, {
      count: Math.round(2 + power * 3), rise: 16, life: .7, size: 3.4,
      vx: Math.cos(angle) * 46 * power, alpha: .3
    });
    this.screenFlash = Math.max(this.screenFlash, .06 + power * .07);
    this.screenFlashColor = '236,214,150';
  }

  tracer(x0, y0, x1, y1) {
    this.tracers = this.tracers || [];
    this.tracers.push({ x0, y0, x1, y1, life: .06, maxLife: .06 });
  }

  // Drifting motes, pollen and wind-blown leaves. Density follows the weather
  // so a storm feels different from a still afternoon.
  ambient(dt, camera, options = {}) {
    const wind = options.wind ?? .3;
    const width = options.width || 1280;
    const height = options.height || 720;
    this.ambientTimer -= dt;
    if (this.ambientTimer > 0) return;
    this.ambientTimer = (.2 - wind * .1) + this.rand(55) * .3;

    const leaf = this.rand(163) < .22 + wind * .2;
    const x = camera.x + this.rand(72) * width;
    const y = camera.y + 60 + this.rand(83) * (height * .7);
    if (leaf) {
      this.particle(x, y, {
        vx: (12 + wind * 46) * (this.rand(77) > .12 ? 1 : -1),
        vy: -4 + this.rand(91) * 16,
        gravity: 16,
        drag: .995,
        life: 2.6 + this.rand(117) * 2.4,
        size: 2 + this.rand(129) * 2,
        color: this.rand(145) > .55 ? '#6b5d33' : '#3f5c35',
        alpha: .5,
        spin: (this.rand(151) - .5) * 7
      });
      return;
    }
    this.particle(x, y, {
      vx: 5 + wind * 22 + this.rand(92) * 10,
      vy: (this.rand(104) - .5) * 5,
      gravity: 0,
      drag: 1,
      life: 2.2 + this.rand(117) * 2.5,
      size: 1.5 + this.rand(129) * 2.2,
      color: this.rand(145) > .75 ? '#b7a36e' : '#89927d',
      alpha: .14 + this.rand(158) * .2,
      kind: 'circle'
    });
  }

  // The loop feeds the tile under the player: colour for grit, and whether
  // this surface can raise dust at all.
  setGroundTile(tileId) {
    const info = tileId ? TILE_INFO[tileId] : null;
    this.groundColor = info?.color || null;
    this.groundGroup = tileId ? tileGroup(tileId) : 'air';
    this.looseGround = this.groundGroup === 'soil' || this.groundGroup === 'rock';
  }

  takeStep() {
    const stepped = this.stepped;
    this.stepped = false;
    return stepped;
  }

  update(dt, player, camera, options = {}) {
    this.time += dt;
    this.screenFlash = Math.max(0, this.screenFlash - dt * 1.8);
    this.shake *= Math.pow(.05, dt);
    if (this.shake < .08) this.shake = 0;

    this.trackPlayer(player, options.sprinting, options.moving, dt);
    this.ambient(dt, camera, options);

    for (const p of this.particles) {
      p.life -= dt;
      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);

    for (const s of this.slashes) s.life -= dt;
    this.slashes = this.slashes.filter(s => s.life > 0);

    if (this.tracers && this.tracers.length) {
      for (const t of this.tracers) t.life -= dt;
      this.tracers = this.tracers.filter(t => t.life > 0);
    }
    if (this.flashes && this.flashes.length) {
      for (const f of this.flashes) f.life -= dt;
      this.flashes = this.flashes.filter(f => f.life > 0);
    }
  }

  cameraOffset() {
    if (this.shake <= 0) return { x: 0, y: 0 };
    return {
      x: (this.rand(201) - .5) * this.shake * 2,
      y: (this.rand(219) - .5) * this.shake * 1.3
    };
  }

  drawWorld(ctx, cameraX, cameraY) {
    for (const p of this.particles) {
      if (!p.world) continue;
      const x = p.x - cameraX;
      const y = p.y - cameraY;
      const a = Math.max(0, p.life / p.maxLife) * p.alpha;
      if (x < -30 || x > ctx.canvas.width + 30 || y < -30 || y > ctx.canvas.height + 30) continue;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.translate(x, y);
      ctx.rotate(p.rotation);
      if (p.kind === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
      } else if (p.kind === 'streak') {
        ctx.fillRect(-p.size * 2.2, -1, p.size * 4.4, 2);
      } else if (p.kind === 'smoke') {
        const grow = 1 + (1 - p.life / p.maxLife) * 1.9;
        ctx.globalAlpha = a * Math.min(1, p.life / p.maxLife * 1.6);
        ctx.beginPath(); ctx.arc(0, 0, p.size * grow, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }

    if (this.tracers) {
      for (const t of this.tracers) {
        const a = t.life / t.maxLife;
        ctx.save();
        ctx.strokeStyle = `rgba(250,236,186,${(a * .7).toFixed(2)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(t.x0 - cameraX, t.y0 - cameraY);
        ctx.lineTo(t.x1 - cameraX, t.y1 - cameraY);
        ctx.stroke();
        ctx.restore();
      }
    }
    if (this.flashes) {
      for (const f of this.flashes) {
        const a = f.life / f.maxLife;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(f.x - cameraX, f.y - cameraY);
        ctx.rotate(f.angle);
        const len = (16 + f.power * 12) * (.7 + a * .5);
        const wid = (3.4 + f.power * 2.2) * (.6 + a * .6);
        ctx.fillStyle = '#f8e7b0';
        ctx.beginPath();
        ctx.moveTo(0, -wid);
        ctx.lineTo(len * .55, -wid * .55);
        ctx.lineTo(len, 0);
        ctx.lineTo(len * .55, wid * .55);
        ctx.lineTo(0, wid);
        ctx.closePath();
        ctx.fill();
        // cross-flare: the detail that makes it read as a muzzle flash
        ctx.fillStyle = 'rgba(255,224,150,.65)';
        ctx.fillRect(len * .18, -wid * 1.9, wid * .8, wid * 3.8);
        ctx.fillStyle = '#fff3cc';
        ctx.beginPath();
        ctx.arc(len * .22, 0, wid * .85, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (const s of this.slashes) {
      const t = 1 - s.life / s.maxLife;
      const x = s.x - cameraX;
      const y = s.y - cameraY;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t) * .85;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 4 - t * 2;
      ctx.beginPath();
      const center = s.facing > 0 ? 0 : Math.PI;
      ctx.arc(x, y, s.radius, center - .8 + t * .3, center + .65 + t * .45);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawScreen(ctx, tension = 0) {
    const cx = ctx.canvas.width / 2, cy = ctx.canvas.height / 2;
    const inner = ctx.canvas.height * (.2 - tension * .07);
    const g = ctx.createRadialGradient(cx, cy, inner, cx, cy, ctx.canvas.width * .68);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(${tension > .5 ? 22 : 0},0,0,${(.22 + tension * .18).toFixed(2)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (this.screenFlash > 0) {
      ctx.fillStyle = `rgba(${this.screenFlashColor},${this.screenFlash * .42})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // very subtle grain - deterministic moving points
    ctx.save();
    ctx.globalAlpha = .045;
    ctx.fillStyle = '#ffffff';
    const offset = Math.floor(this.time * 24);
    for (let i = 0; i < 45; i++) {
      const x = (i * 173 + offset * 29) % ctx.canvas.width;
      const y = (i * 89 + offset * 13) % ctx.canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();
  }
}

// Small signs that the county is still a place: birds crossing the sky,
// deer at the treeline, smoke rising off anything still burning, insects
// around a light at night. Purely decorative, deliberately cheap.
// cone: spray width in radians. lift: extra upward kick. smoke: puff on impact.
FXSystem.MATERIALS = {
  flesh:  { colors: ['#8e3a36', '#6b2b2a', '#a44a42'], count: 5, speed: 85,  gravity: 240, size: 1.9, cone: 1.5, spark: 0,   lift: 26, life: .30 },
  blunt:  { colors: ['#c6b995', '#9d917a'],            count: 5, speed: 105, gravity: 220, size: 1.8, cone: 1.9, spark: .15, lift: 18, life: .26 },
  metal:  { colors: ['#ffe9a8', '#ffc25e', '#fff6d2'], count: 8, speed: 210, gravity: 260, size: 1.5, cone: 1.3, spark: .85, lift: 20, life: .22 },
  stone:  { colors: ['#9a958a', '#6e6a62', '#b4afa3'], count: 7, speed: 130, gravity: 320, size: 2.3, cone: 1.7, spark: .18, lift: 24, life: .36, smoke: true, smokeColor: '150,146,136' },
  wood:   { colors: ['#a8845a', '#6f5636', '#c2a179'], count: 7, speed: 120, gravity: 300, size: 2.1, cone: 1.6, spark: 0,   lift: 20, life: .42 },
  dirt:   { colors: ['#7d6a4f', '#5a4c39', '#92805f'], count: 8, speed: 95,  gravity: 330, size: 2.5, cone: 2.0, spark: 0,   lift: 22, life: .34, smoke: true, smokeColor: '132,118,96' },
  grass:  { colors: ['#6f8a4c', '#4e6535', '#87a05c'], count: 6, speed: 88,  gravity: 170, size: 2.2, cone: 2.2, spark: 0,   lift: 30, life: .60 },
  sand:   { colors: ['#b8a479', '#8e7d59'],            count: 9, speed: 90,  gravity: 300, size: 2.0, cone: 2.1, spark: 0,   lift: 24, life: .38, smoke: true, smokeColor: '162,148,116' },
  water:  { colors: ['#8fb0bd', '#c6dbe2', '#6e8f9c'], count: 9, speed: 115, gravity: 350, size: 2.0, cone: 1.8, spark: 0,   lift: 40, life: .30 },
  glass:  { colors: ['#cfe0e4', '#93aab0', '#eef6f8'], count: 8, speed: 155, gravity: 300, size: 1.6, cone: 1.9, spark: .35, lift: 26, life: .30 }
};

class LifeSystem {
  constructor(seed = 1) {
    this.seed = seed >>> 0;
    this.birds = [];
    this.animals = [];
    this.smoke = [];
    this.birdTimer = 12;
    this.animalTimer = 30;
    this.smokeTimer = 0;
    this.time = 0;
  }

  rand() { return Math.random(); }

  update(dt, camera, world, options = {}) {
    this.time += dt;

    // --- birds ---------------------------------------------------------
    this.birdTimer -= dt;
    if (this.birdTimer <= 0 && this.birds.length < 3) {
      this.birdTimer = 22 + this.rand() * 40;
      const count = 3 + Math.floor(this.rand() * 5);
      const dir = this.rand() > .5 ? 1 : -1;
      const baseY = camera.y + 40 + this.rand() * 150;
      const speed = (28 + this.rand() * 34) * dir;
      for (let i = 0; i < count; i++) {
        this.birds.push({
          x: camera.x + (dir > 0 ? -60 - i * 26 : options.width + 60 + i * 26),
          y: baseY + (this.rand() - .5) * 40,
          vx: speed,
          flap: this.rand() * 6,
          life: 26
        });
      }
    }
    for (const b of this.birds) {
      b.x += b.vx * dt;
      b.y += Math.sin(this.time * 1.6 + b.flap) * 6 * dt;
      b.flap += dt * 9;
      b.life -= dt;
    }
    if (this.birds.length) this.birds = this.birds.filter(b => b.life > 0);

    // --- distant animals ------------------------------------------------
    this.animalTimer -= dt;
    if (this.animalTimer <= 0 && this.animals.length < 2) {
      this.animalTimer = 45 + this.rand() * 70;
      const tileX = Math.round(camera.x / CONFIG.TILE) + (this.rand() > .5 ? 44 : -14);
      const region = world.region(tileX);
      if (region && (region.id === 'coldwood' || region.id === 'pasture' || region.id === 'ridge')) {
        this.animals.push({
          x: tileX * CONFIG.TILE,
          y: world.groundY(tileX) * CONFIG.TILE,
          vx: (this.rand() > .5 ? 1 : -1) * (10 + this.rand() * 14),
          life: 16 + this.rand() * 10
        });
      }
    }
    for (const a of this.animals) {
      a.x += a.vx * dt;
      a.life -= dt;
      const tx = Math.floor(a.x / CONFIG.TILE);
      a.y += (world.groundY(tx) * CONFIG.TILE - a.y) * Math.min(1, dt * 4);
    }
    if (this.animals.length) this.animals = this.animals.filter(a => a.life > 0);

    // --- smoke from anything burning ------------------------------------
    this.smokeTimer -= dt;
    if (this.smokeTimer <= 0) {
      this.smokeTimer = .22;
      for (const src of options.fires || []) {
        this.smoke.push({
          x: src.x + (this.rand() - .5) * 6,
          y: src.y,
          vy: -12 - this.rand() * 10,
          vx: (options.wind || .3) * (8 + this.rand() * 10),
          size: 3 + this.rand() * 3,
          life: 2.4 + this.rand() * 1.6,
          maxLife: 4
        });
      }
    }
    for (const p of this.smoke) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.size += dt * 5;
      p.life -= dt;
    }
    if (this.smoke.length) this.smoke = this.smoke.filter(p => p.life > 0);
  }

  draw(ctx, cameraX, cameraY, light = 1) {
    // smoke first, it sits behind the birds
    for (const p of this.smoke) {
      const a = Math.max(0, p.life / p.maxLife) * .3;
      ctx.fillStyle = `rgba(188,190,186,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y - cameraY, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.fillStyle = `rgba(28,32,34,${(0.35 + light * 0.3).toFixed(2)})`;
    for (const a of this.animals) {
      const x = a.x - cameraX, y = a.y - cameraY;
      if (x < -60 || x > ctx.canvas.width + 60) continue;
      // deer-ish silhouette at distance: body, legs, neck, head
      ctx.fillRect(x, y - 16, 16, 8);
      ctx.fillRect(x + 1, y - 8, 2, 8);
      ctx.fillRect(x + 12, y - 8, 2, 8);
      ctx.fillRect(a.vx > 0 ? x + 14 : x, y - 24, 3, 9);
      ctx.fillRect(a.vx > 0 ? x + 14 : x - 2, y - 26, 5, 3);
    }

    ctx.fillStyle = `rgba(24,28,30,${(0.45 + light * 0.35).toFixed(2)})`;
    for (const b of this.birds) {
      const x = b.x - cameraX, y = b.y - cameraY;
      if (x < -30 || x > ctx.canvas.width + 30) continue;
      const wing = Math.sin(b.flap) * 3;
      ctx.fillRect(x, y, 2, 2);
      ctx.fillRect(x - 3, y - wing, 3, 1);
      ctx.fillRect(x + 2, y - wing, 3, 1);
    }
    ctx.restore();
  }
}
