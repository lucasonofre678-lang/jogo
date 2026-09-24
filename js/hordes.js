// Hordas.
//
// Infectados soltos já existem no mundo. Este sistema cuida do que acontece
// quando MUITOS deles se movem juntos: grupos que migram pela estrada, que
// convergem para um tiro ou um gerador, e o cerco que se forma quando você faz
// barulho demais dentro de uma cidade.
//
// Regra inegociável: nada nasce dentro do campo de visão do jogador.

const HORDE_SIZES = {
  small: { min: 3, max: 5, label: 'grupo' },
  medium: { min: 6, max: 10, label: 'grupo grande' },
  large: { min: 12, max: 18, label: 'horda' }
};

class HordeSystem {
  constructor(deps) {
    this.world = deps.world;
    this.danger = deps.danger;
    this.structures = deps.structures;
    this.player = deps.player;
    this.getViewWidth = deps.getViewWidth || (() => 1280);
    this.getWorldMinutes = deps.getWorldMinutes || (() => 0);
    this.worldState = deps.worldState || null;
    this.announce = null;

    this.groups = [];
    this.pressure = 0;            // sobe com barulho, cai com silêncio
    this.migrateTimer = 120;
    this.spawnCooldown = 0;
    this.lastNoiseAt = 0;
  }

  rand() { return Math.random(); }

  day() { return Math.floor(this.getWorldMinutes() / 1440) + 1; }

  /* ----------------------------------------------------------- utilidades */

  // Coluna fora da tela e longe o bastante para o grupo "chegar", não "surgir".
  offscreenColumn(minTiles = 30, maxTiles = 64, preferSide = 0) {
    const px = this.player.x / CONFIG.TILE;
    const viewTiles = this.getViewWidth() / CONFIG.TILE;
    for (let i = 0; i < 16; i++) {
      const dir = preferSide || (this.rand() > 0.5 ? 1 : -1);
      const dist = minTiles + this.rand() * (maxTiles - minTiles);
      const x = Math.round(px + dir * Math.max(dist, viewTiles * 0.7 + 6));
      if (x < 8 || x > CONFIG.WORLD_W - 8) continue;
      const gy = this.world.groundY(x);
      if (!this.world.hasHeadroom(x, gy, 3)) continue;
      return x;
    }
    return null;
  }

  regionDanger(tileX) {
    const region = this.world.region(tileX);
    return {
      coldwood: 0.3, pasture: 0.45, roadside: 0.6, crossing: 0.7,
      cedar: 0.9, downtown: 1.35, civic: 1.1, dustbowl: 0.8,
      westline: 1.15, ridge: 0.7, blackridge: 1.5
    }[region.id] ?? 0.8;
  }

  aliveCount() {
    let n = 0;
    for (const e of this.danger.enemies) if (e.alive) n++;
    return n;
  }

  /* --------------------------------------------------------------- spawn */

  // Cria um grupo coeso que caminha junto em direção a um alvo.
  spawnGroup(sizeKey, targetX, opts = {}) {
    const size = HORDE_SIZES[sizeKey] || HORDE_SIZES.small;
    const originX = opts.originX ?? this.offscreenColumn(opts.minTiles ?? 30, opts.maxTiles ?? 64, opts.side || 0);
    if (originX == null) return null;
    // Stage 42: the 1900-tile county starts with more regional population than
    // the old map. Keep a ceiling, but leave headroom for real migrations.
    if (this.aliveCount() > 360) return null;

    const count = size.min + Math.floor(this.rand() * (size.max - size.min + 1));
    const region = this.world.region(originX);
    const members = [];

    for (let i = 0; i < count; i++) {
      const roll = this.rand();
      // hordas são feitas de errantes, com corredores no meio
      let type = roll > 0.86 ? 'runner' : roll > 0.8 ? 'stalker' : 'wanderer';
      if (sizeKey === 'large' && i === 0 && this.rand() > 0.55) type = 'heavy';
      const visual = opts.visual || (
        region.id === 'coldwood' || region.id === 'pasture' ? 'rural'
        : region.id === 'westline' || region.id === 'ridge' ? 'worker'
        : region.id === 'blackridge' ? 'blackridge' : 'civilian'
      );
      const spread = Math.round((i - count / 2) * 1.2);
      const e = this.danger.makeEnemy(type, originX + spread, this.danger.salt++, visual);
      e.state = 'investigate';
      e.targetX = targetX;
      e.lastKnownX = targetX;
      e.memory = 40;
      e.homeX = targetX;
      e.hordeId = this.groups.length + 1;
      this.danger.enemies.push(e);
      members.push(e);
    }

    const group = {
      id: this.groups.length + 1,
      members,
      targetX,
      sizeKey,
      life: opts.life ?? 260,
      regroupTimer: 0
    };
    this.groups.push(group);
    return group;
  }

  /* --------------------------------------------------------------- eventos */

  // Chamado por tiros, alarmes, geradores, motores e explosões de ruído.
  onLoudNoise(x, radius) {
    const weight = Math.min(2.5, radius / 400);
    this.pressure += weight * (0.6 + this.regionDanger(Math.floor(x / CONFIG.TILE)) * 0.7);
    this.lastNoiseAt = x;

    // infectados já existentes na região convergem primeiro
    let pulled = 0;
    for (const e of this.danger.enemies) {
      if (!e.alive) continue;
      const d = Math.abs(e.x - x);
      if (d > radius * 3.2) continue;
      e.dormant = false;
      if (e.state === 'wander' || e.state === 'dormant' || e.state === 'search') {
        e.state = 'investigate';
        e.targetX = x;
        e.lastKnownX = x;
        e.memory = 26;
        pulled++;
      }
    }

    // barulho muito alto também traz gente de fora do quadro
    if (this.pressure >= 3 && this.spawnCooldown <= 0) {
      this.pressure = Math.max(0, this.pressure - 3);
      this.spawnCooldown = 45;
      const side = x < this.player.x ? -1 : 1;
      const g = this.spawnGroup(this.rand() > 0.55 ? 'medium' : 'small', x, { side, minTiles: 34, maxTiles: 58 });
      if (g) this.say('Passos vindo na direção do barulho.', 'danger');
    }
    return pulled;
  }

  // Cerco: muito barulho dentro de uma cidade convoca uma horda de verdade.
  siege(x) {
    const g = this.spawnGroup('large', x, { minTiles: 40, maxTiles: 70, life: 420 });
    if (g) this.say('Uma horda está se formando. Saia da rua.', 'danger');
    return g;
  }

  say(text, tone) { this.announce?.(text, tone); }

  /* ---------------------------------------------------------------- frame */

  update(dt) {
    this.pressure = Math.max(0, this.pressure - dt * 0.12);
    if (this.spawnCooldown > 0) this.spawnCooldown -= dt;

    // grupos mantêm coesão e perseguem o alvo comum
    for (let i = this.groups.length - 1; i >= 0; i--) {
      const g = this.groups[i];
      g.life -= dt;
      g.members = g.members.filter(e => e.alive);
      if (!g.members.length || g.life <= 0) { this.groups.splice(i, 1); continue; }

      g.regroupTimer -= dt;
      if (g.regroupTimer > 0) continue;
      g.regroupTimer = 2.2;

      // o grupo caminha junto: quem ficou para trás acelera o passo
      let sum = 0;
      for (const e of g.members) sum += e.x;
      const centre = sum / g.members.length;
      for (const e of g.members) {
        if (e.state === 'chase') continue;          // quem viu o jogador é livre
        e.state = 'investigate';
        e.memory = Math.max(e.memory, 18);
        const behind = Math.abs(e.x - centre) > 140;
        e.targetX = behind ? centre : g.targetX;
      }
    }

    // migração lenta: grupos cruzam a estrada de tempos em tempos
    this.migrateTimer -= dt;
    if (this.migrateTimer <= 0) {
      this.migrateTimer = 150 + this.rand() * 210;
      this.migrate();
    }
  }

  // Um grupo atravessa a região do jogador sem mirar nele — pressão ambiente.
  migrate() {
    if (this.aliveCount() > 330) return;
    const playerTile = Math.floor(this.player.x / CONFIG.TILE);
    const danger = this.regionDanger(playerTile);
    const dayFactor = Math.min(2.2, 0.7 + this.day() * 0.12);

    // Stage 20.1: persistent regional noise gets first chance. A district that
    // was loud minutes ago can still pull a migrating group after the player
    // has already left, which makes alarms/engines matter beyond the screen.
    const hotspot = this.worldState?.noiseHotspot?.(1.1);
    if (hotspot && this.rand() < Math.min(.88, .38 + hotspot.value * .06)) {
      const destination = hotspot.tileX * CONFIG.TILE;
      const side = destination < this.player.x ? -1 : 1;
      const sizeKey = hotspot.value > 4.5 ? 'large' : hotspot.value > 2.2 ? 'medium' : 'small';
      const g = this.spawnGroup(sizeKey, destination, { side, minTiles: 34, maxTiles: 68, life: 340 });
      if (g) this.say(`Uma horda está migrando para ${hotspot.region || 'uma região barulhenta'}.`, 'warn');
      return;
    }

    const chance = 0.25 * danger * dayFactor;
    if (this.rand() > chance) return;
    const side = this.rand() > 0.5 ? 1 : -1;
    const destination = playerTile * CONFIG.TILE + side * -1 * (900 + this.rand() * 1400);
    const sizeKey = danger > 1.1 && this.rand() > 0.5 ? 'medium' : 'small';
    const g = this.spawnGroup(sizeKey, destination, { side, minTiles: 32, maxTiles: 62, life: 300 });
    if (!g) return;

    const region = this.world.region(playerTile);
    this.say(`Movimento na ${region.name}: algo grande está passando.`, 'warn');
  }

  // Quantos infectados estão realmente em cima do jogador agora.
  siegeLevel() {
    let n = 0;
    for (const e of this.danger.enemies) {
      if (!e.alive || e.state !== 'chase') continue;
      if (Math.abs(e.x - this.player.x) < 24 * CONFIG.TILE) n++;
    }
    return n;
  }
}
