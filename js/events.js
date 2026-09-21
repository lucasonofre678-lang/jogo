// Small world events. They fire rarely, always off-screen, and each one gives
// the player a reason to change plans: a horde pushing through, a stranger's
// camp on the road, a building with its lights still on.

class EventSystem {
  constructor(deps) {
    this.deps = deps;
    this.timer = 90;                 // first event never lands immediately
    this.active = [];
    this.history = [];
    this.announce = null;            // set by game.js
    this.worldState = deps.worldState || null;
  }

  rand() { return Math.random(); }

  // A tile column far enough away that nothing pops in on camera.
  offscreenColumn(minTiles = 30, maxTiles = 70) {
    const px = this.deps.player.x / CONFIG.TILE;
    for (let i = 0; i < 12; i++) {
      const dir = this.rand() > 0.5 ? 1 : -1;
      const x = Math.round(px + dir * (minTiles + this.rand() * (maxTiles - minTiles)));
      if (x > 6 && x < CONFIG.WORLD_W - 6) return x;
    }
    return Math.max(6, Math.min(CONFIG.WORLD_W - 6, Math.round(px + 40)));
  }

  update(dt) {
    this.timer -= dt;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const e = this.active[i];
      e.life -= dt;
      if (e.tick) e.tick(dt, e);
      if (e.life <= 0) {
        if (e.end) e.end(e);
        this.active.splice(i, 1);
      }
    }
    this.updateLocal(dt);
    if (this.timer > 0) return;
    this.timer = 150 + this.rand() * 190;
    this.fire();
  }

  fire() {
    const roll = this.rand();
    if (roll < 0.26) this.horde();
    else if (roll < 0.44) this.strandedCamp();
    else if (roll < 0.58) this.storm();
    else if (roll < 0.72) this.litBuilding();
    else if (roll < 0.86) this.roadblock();
    else this.supplyDrop();
  }

  say(text, tone = 'info') {
    this.history.push(text);
    this.worldState?.record?.('world_event', { text, tone });
    if (this.announce) this.announce(text, tone);
  }

  /* -------------------------------------------------------------- events */

  // A pack of infected drifting along the road toward the player's area.
  horde() {
    const { danger, player } = this.deps;
    const x = this.offscreenColumn(34, 60);
    const size = 3 + Math.floor(this.rand() * 4);
    const spawned = [];
    for (let i = 0; i < size; i++) {
      const type = this.rand() > 0.72 ? 'runner' : 'wanderer';
      const e = danger.makeEnemy(type, x + i * 2, danger.salt++, null);
      e.homeX = player.x;                       // they drift toward the player
      e.targetX = player.x;
      e.state = 'investigate';
      e.memory = 26;
      danger.enemies.push(e);
      spawned.push(e);
    }
    this.say('Você ouve muitos passos arrastados em algum lugar da estrada.', 'danger');
    this.active.push({ kind: 'horde', life: 120, enemies: spawned });
  }

  // A survivor's camp that has been picked over — but not completely.
  strandedCamp() {
    const { structures, world } = this.deps;
    const x = this.offscreenColumn(26, 55);
    const y = world.groundY(x) - 1;
    if (!world.hasHeadroom(x, y + 1, 3)) return;
    structures.addProp('barrel', x + 2, y, { scale: 0.8 });
    structures.addProp('fallen_log', x - 2, y, { scale: 0.8 });
    const point = structures.addPoint('firepit', x, y, { name: 'Fogueira recente', state: 'lit', fuel: 240 });
    structures.addContainer('Acampamento recente', x + 1, y - 1, 'camp',
      structures.loot('camp', Math.floor(x * 7), 4, { guaranteed: true }), { rare: true });
    this.say('Fumaça fina subindo ao longe. Alguém acampou por aqui.', 'info');
    this.active.push({ kind: 'camp', life: 600, point });
  }

  storm() {
    const { weather, getWorldMinutes } = this.deps;
    weather.condition = this.rand() > 0.45 ? 'storm' : 'fog';
    weather.nextChangeMinute = getWorldMinutes() + 120 + this.rand() * 120;
    this.say(weather.condition === 'storm' ? 'O vento vira. Tempestade chegando.' : 'Uma neblina pesada desce sobre o condado.', 'warn');
    this.active.push({ kind: 'storm', life: 180 });
  }

  // A building whose generator is somehow still running: light, noise, loot.
  litBuilding() {
    const { structures, places, danger } = this.deps;
    const candidates = structures.structures.filter(s => !places.poweredAreas.has(s.name) && s.type !== 'camp');
    if (!candidates.length) return;
    const s = candidates[Math.floor(this.rand() * candidates.length)];
    places.powerArea(s.name);
    const cx = Math.floor((s.x + s.endX) / 2);
    const cy = this.deps.world.groundY(cx);
    danger.emitNoise(cx * CONFIG.TILE, cy * CONFIG.TILE, 420, 'gerador distante');
    this.say(`Luzes acesas em ${s.name}. Alguém ligou um gerador — e isso faz barulho.`, 'info');
    this.active.push({
      kind: 'lit', life: 420, area: s.name, noiseTimer: 0,
      tick: (dt, e) => {
        e.noiseTimer -= dt;
        if (e.noiseTimer <= 0) {
          e.noiseTimer = 6;
          danger.emitNoise(cx * CONFIG.TILE, cy * CONFIG.TILE, 300, 'gerador');
        }
      },
      end: () => {
        places.poweredAreas.delete(s.name);
        this.say(`O gerador de ${s.name} engasgou e morreu.`, 'warn');
      }
    });
  }

  roadblock() {
    const { structures, world } = this.deps;
    const x = this.offscreenColumn(30, 60);
    const y = world.groundY(x);
    structures.addProp('road_barrier', x, y - 1, { scale: 0.9 });
    structures.addProp('wrecked_car', x + 3, y - 1, { scale: 0.9 });
    structures.addProp('traffic_cone', x - 2, y - 1, { scale: 0.8 });
    structures.addContainer('Porta-malas aberto', x + 3, y - 2, 'garage',
      structures.loot('garage', Math.floor(x * 11), 3));
    this.active.push({ kind: 'roadblock', life: 900 });
  }

  // Something valuable left behind, guarded by whatever moved in after.
  supplyDrop() {
    const { structures, world, danger } = this.deps;
    const x = this.offscreenColumn(30, 65);
    const y = world.groundY(x) - 1;
    structures.addProp('crate_stack', x, y, { scale: 0.85 });
    structures.addContainer('Caixa lacrada', x, y - 1, 'industrial',
      structures.loot('industrial', Math.floor(x * 13), 5, { guaranteed: true }), { rare: true });
    for (let i = 0; i < 2; i++) {
      const e = danger.makeEnemy(this.rand() > 0.5 ? 'stalker' : 'wanderer', x + 3 + i * 2, danger.salt++, null);
      danger.enemies.push(e);
    }
    this.say('Uma caixa intacta na beira da estrada. Isso raramente fica sozinho.', 'info');
    this.active.push({ kind: 'drop', life: 900 });
  }

  /* ------------------------------------------- Stage 20: local events */

  // Contextual events drawn from the eventPool of the structure the player
  // is in. They change something real — power, doors, lights, the infected,
  // even the rock — instead of only printing a line.
  updateLocal(dt) {
    const { structures } = this.deps;
    this.clock = (this.clock || 0) + dt;
    this.localTimer = (this.localTimer ?? 14) - dt;
    const s = structures.current;
    if (!s) { this.localTimer = Math.max(this.localTimer, 10); return; }
    if (this.localTimer > 0) return;
    this.localTimer = 22 + this.rand() * 26;
    if (!s.eventPool || !s.eventPool.length) return;
    this.cooldowns = this.cooldowns || new Map();
    if (this.clock - (this.cooldowns.get(s) ?? -1e9) < 150) return;
    if (this.rand() > 0.6) return;
    const id = s.eventPool[Math.floor(this.rand() * s.eventPool.length)];
    if (this.structureEvent(s, id)) {
      this.cooldowns.set(s, this.clock);
      this.worldState?.record?.('structure_event', { area: s.name, event: id, state: s.state });
    }
  }

  sfx(kind, x) {
    if (this.sound) this.sound(kind, x);
  }

  ownedProps(s, assets) {
    return this.deps.structures.props.filter(p => p.owner === s && assets.includes(p.asset));
  }

  // Dormant or idle infected inside a structure start moving toward the player.
  wakeInside(s, radius = 0) {
    const { danger, player } = this.deps;
    const T = CONFIG.TILE;
    let n = 0;
    for (const e of danger.enemies) {
      if (!e.alive) continue;
      const tx = e.x / T;
      if (tx < s.x - 2 || tx > s.endX + 2) continue;
      if (radius && Math.abs(e.y - player.y) > radius * T) continue;
      e.dormant = false;
      if (e.state === 'dormant' || e.state === 'wander') {
        e.state = 'investigate';
        e.targetX = player.x + (this.rand() - 0.5) * 120;
        e.lastKnownX = e.targetX;
        e.memory = 14;
        n++;
      }
    }
    return n;
  }

  // A room of the structure away from the player, for things that happen "elsewhere".
  farRoom(s) {
    const { player } = this.deps;
    const T = CONFIG.TILE;
    const px = player.x / T, py = player.y / T;
    const rooms = (s.rooms || []).filter(r => Math.hypot((r.x0 + r.x1) / 2 - px, r.floorY - py) > 7);
    return rooms.length ? rooms[Math.floor(this.rand() * rooms.length)] : null;
  }

  pulse(kind, life, every, fn, end) {
    this.active.push({ kind, life, t: 0, tick: (dt, e) => { e.t -= dt; if (e.t <= 0) { e.t = every; fn(); } }, end });
  }

  structureEvent(s, id) {
    const { structures, danger, places, player, world } = this.deps;
    const T = CONFIG.TILE;
    const cx = (s.x + s.endX) / 2 * T;
    const cy = (s.groundY - 2) * T;
    switch (id) {
      case 'radio': {
        const radio = this.ownedProps(s, ['radio'])[0];
        if (!radio) return false;
        const rx = (radio.tileX + 0.5) * T, ry = (radio.tileY + 0.5) * T + radio.offsetY;
        const lamp = structures.lamp(rx, ry, { radius: 80, strength: 0.5, color: 'cold', mode: 'always', flicker: 0.6, fixture: 'neon', owner: s });
        radio.anim = 'shake';
        this.say(RADIO_LINES[Math.floor(this.rand() * RADIO_LINES.length)], 'info');
        this.pulse('radio', 36, 5, () => { danger.emitNoise(rx, ry, 280, 'rádio'); this.sfx('radio', rx); },
          () => { lamp.mode = 'off'; radio.anim = null; });
        return true;
      }
      case 'lights_flicker': {
        s.flicker = 7;
        s.surge = 9;
        if (['suburb', 'house', 'apartments', 'market', 'police', 'pharmacy', 'parking'].includes(s.type)) structures.streetSurge = 14;
        this.say(`As luzes de ${s.name} piscam sozinhas — a rede tossiu por um instante.`, 'info');
        this.sfx('switch', cx);
        return true;
      }
      case 'power_fail': {
        if (!places.poweredAreas.has(s.name)) return this.structureEvent(s, 'lights_flicker');
        places.poweredAreas.delete(s.name);
        s.alert = 50;
        this.say(`A energia de ${s.name} cai. Só as luzes de emergência respondem.`, 'warn');
        this.sfx('power_on', cx);
        this.active.push({ kind: 'power_fail', life: 50, end: () => { places.poweredAreas.add(s.name); this.say(`A energia volta em ${s.name}.`, 'info'); } });
        return true;
      }
      case 'emergency_lights': {
        s.alert = 90;
        const n = this.wakeInside(s, 8);
        this.say(n ? 'Luzes de emergência acendem em vermelho — e algo nos outros setores começa a se mexer.' : 'Luzes de emergência acendem em vermelho pelos corredores.', 'warn');
        this.sfx('alarm', cx);
        return true;
      }
      case 'sector_wake': {
        const n = this.wakeInside(s, 12);
        if (!n) return this.structureEvent(s, 'noise_room');
        this.say('Passos em outro setor. Eles ouviram alguma coisa — e estão vindo ver.', 'danger');
        return true;
      }
      case 'noise_room': {
        const room = this.farRoom(s);
        if (!room) return false;
        const profile = AREA_PROFILES[s.type] || { visual: null, types: ['wanderer'] };
        const tx = Math.floor((room.x0 + room.x1) / 2);
        const count = this.rand() > 0.6 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const e = danger.makeEnemy(profile.types[i % profile.types.length] || 'wanderer', tx + i, danger.salt++, profile.visual, { exact: true, groundY: room.floorY });
          e.state = 'investigate';
          e.targetX = player.x;
          e.memory = 16;
          danger.enemies.push(e);
        }
        danger.emitNoise(tx * T, (room.floorY - 1) * T, 200, 'baque');
        this.sfx('break', tx * T);
        this.say('Algo cai no cômodo ao lado. Não foi o vento.', 'danger');
        return true;
      }
      case 'alarm': {
        s.alert = 32;
        this.say(`Um alarme dispara em ${s.name}!`, 'danger');
        this.pulse('alarm', 30, 2.4, () => { danger.emitNoise(cx, cy, 560, 'alarme'); this.sfx('alarm', cx); });
        return true;
      }
      case 'bell': {
        s.alert = 8;
        danger.emitNoise(cx, cy - 6 * T, 620, 'sino');
        this.sfx('thunder', cx);
        this.say('Um sino toca uma vez, sozinho. Todo o condado ouviu.', 'warn');
        return true;
      }
      case 'stock_unlock': {
        const pt = places.points.find(p => (p.kind === 'shutter' || (p.kind === 'door' && p.locked)) && p.state !== 'open' &&
          places.areaFor(p) === s.name);
        if (!pt) return false;
        pt.locked = false;
        places.open(pt);
        this.sfx('lock', pt.x);
        this.say(`Um estalo metálico em ${s.name}: "${pt.name}" destravou sozinho.`, 'good');
        return true;
      }
      case 'generator_start': {
        if (places.poweredAreas.has(s.name)) return false;
        places.powerArea(s.name);
        const gen = this.ownedProps(s, ['generator', 'machinery'])[0];
        if (gen) gen.anim = 'shake';
        const smoke = gen ? structures.emitter('smoke', (gen.tileX + 0.8) * T, (gen.tileY - 0.2) * T, { owner: s, rate: 1.4 }) : null;
        this.say(`Um gerador pega sozinho em ${s.name}. Luz — e barulho.`, 'info');
        this.pulse('generator', 150, 6, () => { danger.emitNoise(cx, cy, 320, 'gerador'); },
          () => { places.poweredAreas.delete(s.name); if (gen) gen.anim = null; if (smoke) smoke.rate = 0; this.say(`O gerador de ${s.name} engasga e morre.`, 'warn'); });
        return true;
      }
      case 'machine_noise': {
        const m = this.ownedProps(s, ['machinery', 'compressor', 'forklift', 'generator', 'windmill'])[0];
        if (!m) return false;
        m.anim = 'shake';
        const mx = (m.tileX + 0.5) * T, my = m.tileY * T;
        this.say('Uma máquina range e volta a girar. O barulho vai longe.', 'warn');
        this.pulse('machine', 26, 4, () => { danger.emitNoise(mx, my, 300, 'máquina'); this.sfx('mine', mx); }, () => { m.anim = null; });
        return true;
      }
      case 'metal_clang': {
        const far = Math.abs(player.x - s.x * T) > Math.abs(player.x - s.endX * T) ? s.x + 3 : s.endX - 3;
        danger.emitNoise(far * T, s.groundY * T, 700, 'estrondo');
        this.sfx('break', far * T);
        this.say('Um estrondo metálico ecoa longe, pelos túneis.', 'warn');
        return true;
      }
      case 'horde_tunnel': {
        const from = Math.abs(player.x - s.x * T) > Math.abs(player.x - s.endX * T) ? s.x + 2 : s.endX - 6;
        const to = from < (s.x + s.endX) / 2 ? s.endX - 4 : s.x + 4;
        const size = 4 + Math.floor(this.rand() * 3);
        const spawned = [];
        for (let i = 0; i < size; i++) {
          const e = danger.makeEnemy(this.rand() > 0.7 ? 'runner' : 'wanderer', from + i, danger.salt++, 'civilian', { exact: true, groundY: s.groundY });
          e.state = 'investigate';
          e.targetX = to * T;
          e.homeX = to * T;
          e.memory = 30;
          danger.enemies.push(e);
          spawned.push(e);
        }
        this.say('Muitos passos arrastados atravessando o túnel. Uma horda está passando.', 'danger');
        this.active.push({ kind: 'horde', life: 90, enemies: spawned });
        return true;
      }
      case 'collapse': {
        const px = player.x / T;
        const spots = [];
        for (let x = s.x + 4; x < s.endX + 40; x++) {
          if (Math.abs(x - px) < 9) continue;
          for (let y = s.groundY + 4; y < s.groundY + 22; y++) {
            if (world.get(x, y) === TILE.AIR && world.isSolid(x, y - 1) && !world.isSolid(x, y + 2) && world.getWall(x, y)) spots.push([x, y]);
          }
        }
        if (!spots.length) return false;
        const [x, y] = spots[Math.floor(this.rand() * spots.length)];
        for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) if (world.get(x + dx, y + dy) === TILE.AIR) world.set(x + dx, y + dy, TILE.RUBBLE);
        if (this.onDust) this.onDust((x + 1) * T, (y + 1) * T);
        danger.emitNoise(x * T, y * T, 480, 'desabamento');
        this.sfx('mine', x * T);
        this.say('O teto de uma galeria cede. Um caminho a menos — ou um a cavar.', 'warn');
        return true;
      }
      case 'containment_fail': {
        const pods = this.ownedProps(s, ['containment_pod']);
        if (!pods.length) return false;
        const pod = pods[Math.floor(this.rand() * pods.length)];
        s.alert = 120;
        for (let i = 0; i < 2; i++) {
          const e = danger.makeEnemy('contained', pod.tileX + i, danger.salt++, 'blackridge', { exact: true, groundY: pod.tileY + 1 });
          e.state = 'investigate';
          e.targetX = player.x;
          e.memory = 20;
          danger.enemies.push(e);
        }
        pod.tilt = 0.2;
        this.sfx('alarm', pod.tileX * T);
        this.say('ALERTA DE CONTENÇÃO: uma cápsula se abriu. As luzes ficam vermelhas.', 'danger');
        return true;
      }
      case 'partial_power': {
        if (places.poweredAreas.has(s.name)) return false;
        places.powerArea(s.name);
        this.sfx('power_on', cx);
        this.say('Energia parcial restaurada na Blackridge. Terminais e portões respondem — por enquanto.', 'good');
        this.active.push({ kind: 'partial_power', life: 90, end: () => { places.poweredAreas.delete(s.name); this.say('A energia parcial da Blackridge cai de novo.', 'warn'); } });
        return true;
      }
      default:
        return false;
    }
  }
}

const RADIO_LINES = [
  'Um rádio chia sozinho: "...aqui é Harlow, alguém na escuta? Temos água, não temos..."',
  'O rádio acorda: "...não usem a 17 à noite. Repito, não usem a 17..."',
  'Estática, e depois uma voz: "...se você está ouvindo isso, fique longe da Blackridge..."',
  'O rádio toca três notas de uma música e morre em chiado.',
  'Uma voz calma pelo rádio: "...o abrigo da escola caiu. Sigam para o norte..."'
];
