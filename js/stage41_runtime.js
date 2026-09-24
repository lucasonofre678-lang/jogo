// Stage 41.1 — runtime das expedições.
// Discovery, the challenge of each site, revisits (outposts), the diegetic
// discovery plate and field notes, the county map glyphs and save migration.
// Everything hooks into the existing PlaceSystem / LoreSystem / SocietySystem
// instead of adding a parallel interaction layer.

const S41_BLADES = ['knife', 'butcher_knife', 'machete', 'hatchet', 'fire_axe', 'stone_axe'];
const S41_OUTPOST = {
  sheriff_cache:'O abrigo está limpo. O catre do xerife virou um lugar seguro para dormir.',
  quarantine_camp:'A quarentena está limpa. A maca de triagem pode tratar ferimentos uma vez por dia.',
  greenwater_bunker:'O bunker está limpo. Com o gerador ligado, o banco de baterias recarrega.',
  county_arsenal:'O arsenal está limpo. A bancada do armeiro restaura armas com peças.',
  blackridge_vault:'BR-7 esvaziado. Nada aqui vale uma segunda descida.'
};
const S41_RUMORS = {
  mara:['sheriff_cache', 'Meu pai jurava que o xerife cavou um porão perto da Estrada 17, entre a lavoura e os trailers.'],
  lena:['quarantine_camp', 'Levaram os pacientes leves para baixo do pátio cercado do hospital. Quem desce lá respira filtrado.'],
  jonah:['greenwater_bunker', 'Uma família de Greenwater me trocou sementes de um bunker no campo depois da horta. O gerador deles morreu.'],
  eli:['county_arsenal', 'Os ferroviários falavam de um arsenal sob o pátio de Westline. Sensores e anteparos — sem chave de manutenção, nem tente.']
};

RADIO_TRANSMISSIONS.push({
  id:'sheriff_band', freq:'88.3', name:'Faixa do Xerife',
  requirement:() => true,
  text:'— ...gabinete do xerife, gravação automática. Quem achar as marcas nas entradas: um traço, pouco perigo; cinco traços, não desça. Deixei um bilhete na delegacia de North County...'
});

class Stage41Runtime {
  constructor(deps) {
    Object.assign(this, deps);
    this.sites = new Map();
    for (const def of STAGE41_EXPEDITIONS) {
      const s = this.structures.structures.find(x => x.expeditionId === def.id);
      if (s) this.sites.set(def.id, { def, s, st:Stage41Runtime.freshState() });
    }
    this.notesRead = new Set();
    this.sensorCooldown = 0;
    this.noteAnchor = null;
    this.noteTimer = 0;
    this.bannerTimer = 0;
    this.bannerQueue = [];
    this.pristine = this.snapshotLegacy();
    this.places.stage41 = this;
    this.lore.stage41 = this;
    this.society.stage41 = this;
    this.ui = {};
    this.buildUI();
  }

  static freshState() {
    return { discovered:false, entered:false, vaultOpened:false, powerRestored:false, completed:false,
      sensorsDisabled:false, lockdown:true, stationMinute:null, batteryStored:0, batteryClock:null };
  }

  /* ------------------------------------------------------------ lookups */

  point(siteId, slot) { return this.places.points.find(p => p.s41 === siteId && p.s41Slot === slot) || null; }
  siteOf(point) { return point?.s41 ? this.sites.get(point.s41) || null : null; }
  vaultBox(site) { return this.structures.containers.find(c => c.expeditionId === site.def.id && c.stage41Vault) || null; }
  inside(s, tx, ty, pad = 0) { return tx >= s.x - 1 - pad && tx <= s.endX + 1 + pad && ty >= s.yTop - pad && ty <= s.yBottom + pad; }
  playerTile() {
    const p = this.player, T = CONFIG.TILE;
    return { tx:(p.x + p.w / 2) / T, ty:(p.y + p.h / 2) / T, feet:Math.floor((p.y + p.h - 1) / T) };
  }
  siteAt(tx, ty) {
    for (const site of this.sites.values()) if (this.inside(site.s, tx, ty)) return site;
    return null;
  }
  marks(tier) { return 'I'.repeat(tier); }
  riskBar(tier) { return '■'.repeat(tier) + '□'.repeat(5 - tier); }

  /* ------------------------------------------------------------- update */

  update(dt) {
    const { tx, ty } = this.playerTile();
    for (const site of this.sites.values()) {
      const { def, s, st } = site;
      if (!st.discovered) {
        const near = s.s41.entrances.some(e => Math.abs(e.x + .5 - tx) <= 6 && Math.abs(e.y - ty) <= 4);
        if (near || this.inside(s, tx, ty)) this.discover(site);
      }
      if (!st.entered && this.inside(s, tx, ty)) st.entered = true;
      if (!st.vaultOpened && this.vaultBox(site)?.discovered) {
        st.vaultOpened = true;
        this.notify(`${def.name.toUpperCase()} · cofre aberto`, 'good');
      }
      this.updatePower(site);
      if (st.vaultOpened && !st.completed && st.entered && this.cleared(s)) this.complete(site);
      if (def.id === 'greenwater_bunker') this.updateBatteryBank(site);
    }
    this.updateHazards(dt, tx, ty);
    this.updateUI(dt, tx, ty);
  }

  discover(site) {
    const { def, s, st } = site;
    st.discovered = true;
    s.discovered = true;
    this.bannerQueue.push(def);
  }

  cleared(s) {
    const T = CONFIG.TILE;
    return !this.danger.enemies.some(e => e.alive && this.inside(s, (e.x + e.w / 2) / T, (e.y + e.h / 2) / T, 1));
  }

  complete(site) {
    site.st.completed = true;
    site.s.eventPool = [];
    this.notify(S41_OUTPOST[site.def.id], 'good');
  }

  updatePower(site) {
    const { def, s, st } = site;
    if (def.id === 'blackridge_vault' && !this.places.poweredAreas.has(s.name) &&
      (this.places.flags.has('bunker_power') || this.places.poweredAreas.has('Complexo Blackridge'))) this.places.powerArea(s.name);
    if (def.id !== 'greenwater_bunker' && def.id !== 'blackridge_vault') return;
    const on = this.places.poweredAreas.has(s.name);
    if (on && !st.powerRestored) {
      st.powerRestored = true;
      this.notify(def.id === 'greenwater_bunker' ? 'O gerador pega. Luzes do bunker e a porta blindada respondem.' : 'BR-7 recebe energia do nível -1. O console de bloqueio acordou.', 'good');
    }
  }

  updateBatteryBank(site) {
    const { st } = site;
    const now = this.getWorldMinutes();
    if (!st.powerRestored || !st.completed) { st.batteryClock = now; return; }
    if (st.batteryClock == null) st.batteryClock = now;
    while (now - st.batteryClock >= 1440 && st.batteryStored < 2) { st.batteryStored++; st.batteryClock += 1440; }
    if (st.batteryStored >= 2) st.batteryClock = now;
  }

  updateHazards(dt, tx, ty) {
    const p = this.player, T = CONFIG.TILE;
    // Sheriff: tin cans strung across the armoury doorway.
    const wire = this.point('sheriff_cache', 5);
    if (wire && wire.state === 'armed' && !p.crouching) {
      const feet = Math.floor((p.y + p.h - 1) / T);
      if (feet === wire.tileY && p.x + p.w > wire.x + 8 && p.x < wire.x + T - 8) {
        wire.state = 'tripped';
        wire.consumed = true;
        this.danger.emitNoise(wire.x + T / 2, wire.y, 360, 'latas');
        this.audio?.world?.('break', 0);
        this.fx.shake = Math.max(this.fx.shake || 0, 1.5);
        this.notify('Latas chacoalham no escuro. O abrigo inteiro ouviu.', 'danger');
      }
    }
    // Arsenal: chest-height motion sensors on the service corridor.
    const arsenal = this.sites.get('county_arsenal');
    this.sensorCooldown = Math.max(0, this.sensorCooldown - dt);
    if (arsenal && !arsenal.st.sensorsDisabled && this.sensorCooldown <= 0) {
      const U = arsenal.s.s41.geo.upper;
      const feet = Math.floor((p.y + p.h - 1) / T);
      if (feet === U - 1) {
        for (const sensor of arsenal.s.s41.sensors) {
          const sx = sensor.x * T;
          if (p.x + p.w > sx + 6 && p.x < sx + T - 6 && p.y < sensor.beamY) { this.tripSensor(arsenal, sensor); break; }
        }
      }
    }
  }

  tripSensor(site, sensor) {
    this.sensorCooldown = 8;
    const siren = this.point(site.def.id, 2);
    if (siren && siren.state !== 'on') { siren.state = 'on'; siren.alarmTimer = 0; }
    this.danger.emitNoise((sensor.x + .5) * CONFIG.TILE, sensor.beamY, 900, 'sensor');
    this.audio?.world?.('alarm', 0);
    this.notify('SENSOR ACIONADO — a sirene do arsenal ecoa pelos anteparos', 'danger');
  }

  raiseLockdown(site) {
    const siren = this.point(site.def.id, 3);
    if (siren) { siren.state = 'on'; siren.alarmTimer = 0; }
    site.st.lockdown = false;
    const T = CONFIG.TILE;
    this.danger.emitNoise((site.s.x + site.s.endX) / 2 * T, (site.s.groundY - 2) * T, 1200, 'contenção');
    this.audio?.world?.('alarm', 0);
    this.notify('BLOQUEIO BR-7 — a sirene de contenção disparou', 'danger');
  }

  // Extra fictional contamination: Harlow's isolation ward.
  contamination(player) {
    const T = CONFIG.TILE, tx = (player.x + player.w / 2) / T, ty = (player.y + player.h / 2) / T;
    let k = 0;
    for (const site of this.sites.values()) for (const h of site.s.s41.hazards) {
      if (h.kind === 'contamination' && tx >= h.x0 && tx <= h.x1 + 1 && ty >= h.y0 - 1 && ty <= h.y1 + 1) k = Math.max(k, h.k);
    }
    return k;
  }

  areaName(player) {
    const { tx, ty } = this.playerTile();
    return this.siteAt(tx, ty)?.def.name || null;
  }

  rumorFor(npc) {
    const row = S41_RUMORS[npc?.id];
    if (!row || npc.quest?.status === 'active') return null;
    const site = this.sites.get(row[0]);
    return site && !site.st.discovered ? row[1] : null;
  }

  /* ------------------------------------------------------ interaction */

  hasBlade() { return S41_BLADES.some(id => this.inventory.count(id) > 0); }
  itemName(id) { return ITEM_DEFS[id]?.name || id; }

  prompt(p) {
    const site = this.siteOf(p), st = site?.st;
    const name = String(p.name || '').toUpperCase();
    switch (p.kind) {
      case 'hatch':
        return site ? `E — ${p.label || 'DESCER'}  ·  RISCO ${this.riskBar(site.def.tier)}` : null;
      case 'door': {
        if (p.state === 'open') return `E — FECHAR ${name}`;
        if (!p.locked) return `E — ABRIR ${name} (rangido metálico)`;
        const alarm = site?.def.id === 'blackridge_vault' && p.vault && st?.lockdown ? ' · BLOQUEIO ARMADO' : '';
        if (p.keyItem && this.inventory.count(p.keyItem) > 0) return `E — DESTRANCAR ${name} COM ${this.itemName(p.keyItem).toUpperCase()}${alarm}`;
        if (this.inventory.count(p.forceTool) > 0) return `E — ARROMBAR ${name} · ${p.integrity} golpe${p.integrity === 1 ? '' : 's'} · barulho alto${alarm}`;
        return `${name} ${p.masc ? 'TRANCADO' : 'TRANCADA'} · ${p.keyItem ? this.itemName(p.keyItem) + ' ou ' : ''}${this.itemName(p.forceTool)}`;
      }
      case 'shutter': {
        if (p.state === 'open') return `E — FECHAR ${name}`;
        if (this.places.isPowered(p)) return `E — ABRIR ${name}`;
        if (this.inventory.count(p.forceTool) > 0) return `E — FORÇAR ${name} SEM ENERGIA · ${p.integrity} golpes · muito barulho`;
        return `${name} SEM ENERGIA · religue o quadro do gerador`;
      }
      case 's41_note':
        return `E — LER ${name}${this.notesRead.has(p.note) ? ' · lido' : ''}`;
      case 's41_tripwire':
        if (p.state !== 'armed') return '';
        return this.hasBlade() ? 'E — CORTAR O FIO COM LATAS · ou passe agachado (CTRL)' : 'FIO COM LATAS · passe agachado (CTRL) ou traga uma lâmina';
      case 's41_rest':
        return st?.completed ? 'E — DORMIR ATÉ AMANHECER · abrigo seguro' : `${name} · ainda não é seguro dormir aqui`;
      case 's41_station': return this.stationPrompt(p, site);
      case 's41_panel':
        return st?.sensorsDisabled ? `${name} · SENSORES DESLIGADOS` : 'E — DESLIGAR OS SENSORES DO CORREDOR';
      case 's41_console':
        if (!st?.powerRestored) return 'CONSOLE BR-7 SEM ENERGIA · religue o quadro do bunker (nível -1)';
        return st.lockdown ? 'E — LIBERAR O BLOQUEIO DA CÂMARA BR-7' : 'CONSOLE BR-7 · BLOQUEIO LIBERADO';
      case 's41_escape':
        if (this.outsideCover(p)) return p.state === 'open' ? `E — DESCER PELA ${name}` : `${name} · trancada por dentro`;
        return p.state === 'open' ? `E — FECHAR ${name}` : `E — ABRIR ${name} (saída para a superfície)`;
      default: return null;
    }
  }

  stationPrompt(p, site) {
    const st = site?.st;
    if (!st?.completed) return `${String(p.name).toUpperCase()} · limpe o local antes de usar`;
    if (p.station === 'medical') {
      const ready = st.stationMinute == null || this.getWorldMinutes() - st.stationMinute >= 1440;
      return ready ? 'E — TRATAR FERIMENTOS NA MACA DE TRIAGEM' : 'MACA DE TRIAGEM · suprimentos repostos amanhã';
    }
    if (p.station === 'battery') {
      if (!st.powerRestored) return 'BANCO DE BATERIAS · sem energia do gerador';
      return st.batteryStored > 0 ? `E — RETIRAR BATERIA CARREGADA (${st.batteryStored})` : 'BANCO DE BATERIAS · carregando (1 por dia)';
    }
    if (p.station === 'armory') return 'E — RESTAURAR A ARMA SELECIONADA (1 peça de arma)';
    return '';
  }

  outsideCover(p) { return this.player.y + this.player.h / 2 < (p.coverY) * CONFIG.TILE; }

  use(p) {
    const site = this.siteOf(p), st = site?.st;
    switch (p.kind) {
      case 's41_note': {
        const note = STAGE41_NOTES[p.note];
        if (!note) return { ok:false, reason:'O papel está ilegível' };
        this.notesRead.add(p.note);
        this.showNote(note, p);
        return { ok:true, noise:6, message:'' };
      }
      case 's41_tripwire':
        if (p.state !== 'armed') return { ok:false, reason:'O fio já foi rompido' };
        if (!this.hasBlade()) return { ok:false, reason:'Precisa de uma lâmina — ou passe agachado' };
        p.state = 'cut'; p.consumed = true;
        return { ok:true, noise:10, message:'Fio cortado em silêncio. As latas ficam no chão.' };
      case 's41_rest': {
        if (!st?.completed) return { ok:false, reason:'Ainda há infectados por perto. Limpe o abrigo primeiro.' };
        if (this.danger.nearbyThreat(this.player, 14).count > 0) return { ok:false, reason:'Perigoso demais para dormir com infectados por perto' };
        const minute = this.getWorldMinutes() % 1440;
        const until = minute > 360 ? 1440 - minute + 360 : 360 - minute;
        this.survival.rest(until, false);
        this.advanceMinutes(until);
        this.danger.noiseLevel = 0;
        return { ok:true, noise:0, message:`Você dormiu ${Math.max(1, Math.round(until / 60))}h no abrigo do xerife e acordou ao amanhecer` };
      }
      case 's41_station': return this.useStation(p, site);
      case 's41_panel':
        if (st.sensorsDisabled) return { ok:false, reason:'Os sensores já estão desligados' };
        st.sensorsDisabled = true;
        { const siren = this.point(site.def.id, 2); if (siren) siren.state = 'off'; }
        return { ok:true, noise:20, message:'Sensores desligados. O corredor de serviço está livre.', sound:'switch' };
      case 's41_console':
        if (!st.powerRestored) return { ok:false, reason:'Sem energia. O quadro do bunker, no nível -1, alimenta este setor.' };
        if (!st.lockdown) return { ok:false, reason:'O bloqueio já foi liberado' };
        st.lockdown = false;
        return { ok:true, noise:15, message:'Bloqueio liberado. O cartão agora abre a câmara BR-7 em silêncio.', sound:'switch' };
      case 's41_escape': {
        if (this.outsideCover(p)) {
          if (p.state !== 'open') return { ok:false, reason:'Trancada por dentro' };
          const landing = site.s.s41.landing;
          this.player.x = p.tileX * CONFIG.TILE + 6;
          this.player.y = (p.coverY + 2) * CONFIG.TILE - this.player.h;
          this.player.vx = 0; this.player.vy = 0;
          return { ok:true, noise:40, message:`Você desce pela ${p.name.toLowerCase()}`, teleport:Boolean(landing) };
        }
        this.setEscape(p, p.state === 'open' ? 'closed' : 'open');
        return { ok:true, noise:70, message:p.state === 'open' ? 'Escotilha aberta. Ar frio desce pelo poço.' : 'Escotilha fechada e travada.', sound:'push' };
      }
      default: return null;
    }
  }

  useStation(p, site) {
    const st = site.st;
    if (!st.completed) return { ok:false, reason:'Limpe o local antes de usar' };
    if (p.station === 'medical') {
      const now = this.getWorldMinutes();
      if (st.stationMinute != null && now - st.stationMinute < 1440) return { ok:false, reason:'Os suprimentos da maca só voltam amanhã' };
      let n = 0;
      while (this.injuries.bandage() && n < 6) n++;
      this.injuries.disinfect();
      this.survival.health = Math.min(this.survival.maxHealth, this.survival.health + 20);
      st.stationMinute = now;
      return { ok:true, noise:10, message:`Ferimentos tratados na triagem${n ? ` · ${n} curativo${n > 1 ? 's' : ''}` : ''}` };
    }
    if (p.station === 'battery') {
      if (!st.powerRestored) return { ok:false, reason:'Sem energia do gerador' };
      if (st.batteryStored <= 0) return { ok:false, reason:'Nenhuma bateria carregada ainda' };
      let moved = 0;
      while (st.batteryStored > 0 && this.inventory.canAdd('battery', 1)) { this.inventory.add('battery', 1); st.batteryStored--; moved++; }
      if (!moved) return { ok:false, reason:'Peso demais para levar a bateria' };
      return { ok:true, noise:10, message:`Bateria carregada ×${moved}`, inventory:true };
    }
    if (p.station === 'armory') {
      const id = this.selectedItem();
      const def = ITEM_DEFS[id];
      if (!def?.maxDurability || (!def.gun && !def.melee && def.category !== 'tool')) return { ok:false, reason:'Selecione na hotbar a arma que quer restaurar' };
      const d = this.inventory.durability(id);
      if (!d || d.current >= d.max) return { ok:false, reason:'Essa arma já está em ótima condição' };
      if (this.inventory.count('weapon_parts') < 1) return { ok:false, reason:'Precisa de 1 Peças de arma' };
      this.inventory.remove('weapon_parts', 1);
      this.inventory.repairTool(id, d.max);
      return { ok:true, noise:25, message:`${def.name} restaurada na bancada do armeiro`, sound:'push' };
    }
    return { ok:false };
  }

  afterUse(p, r) {
    const site = this.siteOf(p);
    if (!site || !r?.ok) return;
    if (site.def.id === 'blackridge_vault' && p.vault && (r.unlocked || r.forced || r.partial) && site.st.lockdown) this.raiseLockdown(site);
    if (p.kind === 'alarm' && site.def.id === 'county_arsenal' && p.state === 'off') this.sensorCooldown = 6;
  }

  setEscape(p, state) {
    p.state = state;
    this.world.set(p.tileX, p.coverY, state === 'open' ? TILE.CATWALK : TILE.METAL);
  }

  // Closed doors, shutters and escape covers get their tiles back after a
  // load or a re-carve; open ones are cleared. Nothing else is touched.
  syncTiles() {
    for (const p of this.places.points) {
      if (!p.s41) continue;
      if (p.kind === 'door' || p.kind === 'shutter') {
        for (const c of this.places.cells(p)) this.world.set(c.x, c.y, p.state === 'open' ? TILE.AIR : (p.tile || TILE.PLANK));
      } else if (p.kind === 's41_escape') this.setEscape(p, p.state === 'open' ? 'open' : 'closed');
    }
  }

  /* ----------------------------------------------------------- drawing */

  drawPoint(ctx, p, x, y) {
    const T = CONFIG.TILE;
    if (p.kind === 's41_note') {
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 9, y - 21, 15, 18);
      ctx.fillStyle = this.notesRead.has(p.note) ? '#a99d80' : '#d4c6a0'; ctx.fillRect(x + 8, y - 22, 15, 18);
      ctx.fillStyle = '#6f5d45'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 10, y - 18 + i * 3, 9 - (i % 2) * 3, 1);
      ctx.fillStyle = '#a2463c'; ctx.fillRect(x + 14, y - 23, 3, 3);
    } else if (p.kind === 's41_tripwire') {
      const wy = y + T - 11;
      if (p.state === 'armed') {
        ctx.strokeStyle = 'rgba(196,188,160,.7)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 2, wy); ctx.lineTo(x + T + 2, wy - 1); ctx.stroke();
        ctx.fillStyle = '#8f8a7c';
        for (const cx of [5, 14, 23]) { ctx.fillRect(x + cx, wy + 1, 5, 7); ctx.fillStyle = '#6d6a60'; ctx.fillRect(x + cx, wy + 1, 5, 1); ctx.fillStyle = '#8f8a7c'; }
      } else {
        ctx.fillStyle = '#7d786b';
        ctx.fillRect(x + 3, y + T - 5, 7, 4); ctx.fillRect(x + 15, y + T - 4, 5, 3); ctx.fillRect(x + 22, y + T - 6, 4, 5);
      }
    } else if (p.kind === 's41_panel' || p.kind === 's41_console') {
      const st = this.siteOf(p)?.st;
      const ok = p.kind === 's41_panel' ? st?.sensorsDisabled : st && !st.lockdown;
      const powered = p.kind === 's41_panel' || st?.powerRestored;
      ctx.fillStyle = '#2e3436'; ctx.fillRect(x + 7, y + 2, T - 14, 22);
      ctx.fillStyle = powered ? '#46524f' : '#2a2f30'; ctx.fillRect(x + 10, y + 5, T - 20, 9);
      ctx.fillStyle = !powered ? '#3a3a36' : ok ? '#8fb07a' : '#c24a3e'; ctx.fillRect(x + 11, y + 17, 4, 4);
      ctx.fillStyle = '#1b1f20'; ctx.fillRect(x + 17, y + 18, 6, 2);
    } else if (p.kind === 's41_station') {
      const st = this.siteOf(p)?.st;
      if (p.station === 'battery') {
        ctx.fillStyle = '#3b4244'; ctx.fillRect(x + 6, y + 8, T - 12, 20);
        ctx.fillStyle = st?.batteryStored ? '#9cc07a' : st?.powerRestored ? '#c7a55a' : '#4a4d49';
        for (let i = 0; i < 2; i++) ctx.fillRect(x + 10 + i * 8, y + 12, 5, 3);
      } else if (p.station === 'medical') {
        ctx.fillStyle = st?.completed ? '#b2463d' : '#5d4d48';
        ctx.fillRect(x + 13, y + 4, 6, 14); ctx.fillRect(x + 9, y + 8, 14, 6);
      }
    } else if (p.kind === 's41_escape') {
      const cy = p.coverY * T - (p.tileY * T) + y;
      ctx.strokeStyle = p.state === 'open' ? '#8da36c' : '#b4a073'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + T / 2, cy + T + 8, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + T / 2 - 6, cy + T + 8); ctx.lineTo(x + T / 2 + 6, cy + T + 8); ctx.stroke();
    }
  }

  // World language at every entrance: a painted post with the scavengers'
  // tally (one stroke = light danger, five = do not go down).
  draw(ctx, cameraX, cameraY) {
    const T = CONFIG.TILE;
    for (const site of this.sites.values()) {
      const e = site.s.s41.entrances[0];
      if (!e) continue;
      const x = (e.x + 1) * T - cameraX + 6, y = (e.y + 1) * T - cameraY;
      if (x < -60 || x > ctx.canvas.width + 60 || y < -80 || y > ctx.canvas.height + 80) continue;
      ctx.fillStyle = '#4a3b2c'; ctx.fillRect(x, y - 34, 4, 34);
      ctx.fillStyle = '#6a5a44'; ctx.fillRect(x - 6, y - 34, 18, 12);
      ctx.fillStyle = site.def.tier >= 4 ? '#c8574a' : site.def.tier === 3 ? '#d0a45a' : '#d9d1b8';
      for (let i = 0; i < site.def.tier; i++) ctx.fillRect(x - 4 + i * 3, y - 32, 2, 8);
      if (site.def.tier === 5) { ctx.fillRect(x - 5, y - 28, 16, 1); }
    }
  }

  // After lighting: sensor LEDs and chest-height beams, so they read in the dark.
  drawGlow(ctx, cameraX, cameraY) {
    const arsenal = this.sites.get('county_arsenal');
    if (!arsenal) return;
    const T = CONFIG.TILE, armed = !arsenal.st.sensorsDisabled;
    const pulse = .55 + Math.abs(Math.sin(performance.now() * .004)) * .45;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const s of arsenal.s.s41.sensors) {
      const x = s.x * T - cameraX, y = s.beamY - cameraY;
      if (x < -40 || x > ctx.canvas.width + 40 || y < -40 || y > ctx.canvas.height + 40) continue;
      ctx.fillStyle = armed ? `rgba(255,70,52,${(.85 * pulse).toFixed(3)})` : 'rgba(120,170,110,.5)';
      ctx.fillRect(x + T / 2 - 2, y - 2, 4, 4);
      if (armed) {
        ctx.fillStyle = `rgba(255,70,52,${(.28 * pulse).toFixed(3)})`;
        for (let i = -T; i < T * 2; i += 6) ctx.fillRect(x + i, y, 3, 1);
      }
    }
    ctx.restore();
  }

  // County map: common sites amber, underground blue, high risk red.
  drawMapMarker(mc, s, sx, sy) {
    const site = this.sites.get(s.expeditionId);
    if (!site || !site.st.discovered) return true;
    const e = s.s41.entrances[0] || { x:(s.x + s.endX) / 2, y:s.groundY };
    const x = Math.round((e.x + .5) * sx), y = Math.round(e.y * sy);
    const cat = site.def.category;
    const color = cat === 'alto risco' ? '#c8574a' : cat === 'subterrânea' ? '#7f9fb4' : '#c9a55f';
    mc.save();
    mc.strokeStyle = color; mc.fillStyle = color; mc.lineWidth = 2;
    mc.beginPath(); mc.moveTo(x, y - 6); mc.lineTo(x + 6, y); mc.lineTo(x, y + 6); mc.lineTo(x - 6, y); mc.closePath();
    if (cat === 'alto risco') mc.fill(); else mc.stroke();
    if (cat !== 'comum') { mc.beginPath(); mc.moveTo(x, y + 6); mc.lineTo(x, y + 12); mc.stroke(); }
    const tag = site.st.completed ? (site.def.id === 'blackridge_vault' ? ' · VAZIO' : ' · POSTO') : '';
    const label = `${site.def.short} ${this.marks(site.def.tier)}${tag}`;
    const tw = mc.measureText(label).width + 8;
    mc.fillStyle = 'rgba(8,12,13,.78)'; mc.fillRect(x - tw / 2, y + 14, tw, 13);
    mc.fillStyle = color; mc.fillText(label, x - tw / 2 + 4, y + 20.5);
    mc.restore();
    return true;
  }

  drawMapLegend(mc, W, H) {
    if (![...this.sites.values()].some(s => s.st.discovered)) return;
    mc.save();
    mc.font = '600 9px "Courier New", monospace';
    mc.textBaseline = 'middle';
    const rows = [['comum', '#c9a55f', false], ['subterrânea', '#7f9fb4', false], ['alto risco', '#c8574a', true]];
    rows.forEach(([label, color, fill], i) => {
      const x = 14, y = H - 16 - (rows.length - 1 - i) * 14;
      mc.strokeStyle = color; mc.fillStyle = color; mc.lineWidth = 1.5;
      mc.beginPath(); mc.moveTo(x, y - 4); mc.lineTo(x + 4, y); mc.lineTo(x, y + 4); mc.lineTo(x - 4, y); mc.closePath();
      if (fill) mc.fill(); else mc.stroke();
      mc.fillStyle = 'rgba(214,208,184,.8)'; mc.fillText(`EXPEDIÇÃO ${label.toUpperCase()}`, x + 9, y);
    });
    mc.restore();
  }

  /* ---------------------------------------------------------- interface */

  buildUI() {
    if (typeof document === 'undefined') return;
    const banner = document.getElementById('s41Banner');
    const note = document.getElementById('s41Note');
    if (banner) {
      const make = (tag, cls) => { const el = document.createElement(tag); el.className = cls; banner.appendChild(el); return el; };
      this.ui.banner = banner;
      this.ui.kicker = make('span', 's41-kicker');
      this.ui.title = make('strong', 's41-title');
      this.ui.risk = make('span', 's41-risk');
      this.ui.phrase = make('em', 's41-phrase');
    }
    if (note) {
      const make = (tag, cls) => { const el = document.createElement(tag); el.className = cls; note.appendChild(el); return el; };
      this.ui.note = note;
      this.ui.noteTitle = make('strong', 's41-note-title');
      this.ui.noteText = make('p', 's41-note-text');
    }
  }

  showBanner(def) {
    if (!this.ui.banner) return;
    this.ui.kicker.textContent = `LOCAL DESCOBERTO · EXPEDIÇÃO ${def.category.toUpperCase()}`;
    this.ui.title.textContent = def.name.toUpperCase();
    this.ui.risk.textContent = `RISCO ${this.riskBar(def.tier)}  ${def.tier}/5`;
    this.ui.phrase.textContent = def.phrase;
    this.ui.banner.className = `s41-banner tier-${def.tier} show`;
    this.bannerTimer = 5.2;
  }

  showNote(note, p) {
    if (!this.ui.note) { this.notify(`${note.title}: ${note.text}`, 'info'); return; }
    this.ui.noteTitle.textContent = note.title;
    this.ui.noteText.textContent = note.text;
    this.ui.note.className = 's41-note show';
    this.noteAnchor = { x:p.x, y:p.y };
    this.noteTimer = 14;
  }

  hideNote() {
    if (this.ui.note) this.ui.note.className = 's41-note hidden';
    this.noteAnchor = null; this.noteTimer = 0;
  }

  updateUI(dt) {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0 && this.ui.banner) this.ui.banner.className = 's41-banner hidden';
    } else if (this.bannerQueue.length) this.showBanner(this.bannerQueue.shift());
    if (this.noteAnchor) {
      this.noteTimer -= dt;
      const c = this.player.center();
      if (this.noteTimer <= 0 || Math.hypot(c.x - this.noteAnchor.x, c.y - this.noteAnchor.y) > 4 * CONFIG.TILE) this.hideNote();
    }
  }

  /* --------------------------------------------------------- save/load */

  exportState() {
    const sites = {};
    for (const [id, site] of this.sites) sites[id] = { ...site.st };
    return { version:2, layout:STAGE41_LAYOUT, sites, notes:[...this.notesRead] };
  }

  // Snapshot of the freshly generated world under the Stage 41.0 footprints.
  snapshotLegacy() {
    const map = new Map(), W = CONFIG.WORLD_W;
    for (const [x, y] of this.structures.stage41LegacyCells?.() || []) {
      if (!this.world.inBounds(x, y)) continue;
      map.set(y * W + x, [this.world.get(x, y), this.world.getWall(x, y)]);
    }
    return map;
  }

  // Called right after the tile grid of a save is restored.
  restoreTerrain(save) {
    this.migration = null;
    if (save?.stage41?.layout === STAGE41_LAYOUT && (save.version || 0) >= 41) return;
    const W = CONFIG.WORLD_W;
    if ((save?.version || 0) >= 41) {
      // Stage 41.0 carved other places; give them back to the county first.
      for (const [x, y, shaftOnly] of this.structures.stage41LegacyCells()) {
        const v = this.pristine.get(y * W + x);
        if (!v) continue;
        if (shaftOnly && (this.world.get(x, y) !== TILE.LADDER || v[0] === TILE.LADDER)) continue;
        this.world.set(x, y, v[0]); this.world.setWall(x, y, v[1]);
      }
      this.migration = 'stage41.0';
    } else this.migration = 'stage40';
    this.structures.restoreStage41Terrain();
  }

  // Stage 41.0 saves numbered its 18 points right after the Stage 20 region
  // points, pushing every later id up by 18. Map them back.
  migratePointRows(save) {
    const rows = save?.points || [];
    if ((save?.version || 0) !== 41 || save?.stage41?.layout === STAGE41_LAYOUT) return rows;
    const split = this.structures.stage41LegacyPointSplit;
    if (!Number.isFinite(split)) return rows;
    const legacy = [];
    for (const L of STAGE41_LEGACY) for (const kind of L.points) legacy.push({ site:L.id, kind });
    const n = legacy.length, out = [];
    for (const row of rows) {
      if (row.id >= S41_POINT_BASE || row.id < split) { out.push(row); continue; }
      if (row.id >= split + n) { out.push({ ...row, id:row.id - n }); continue; }
      const old = legacy[row.id - split];
      if (old.kind === 'door' && row.state === 'open') {
        const door = this.places.points.find(p => p.s41 === old.site && p.vault);
        if (door) out.push({ id:door.id, state:'open', locked:false });
      }
    }
    return out;
  }

  // Stage 41 containers are matched by stable key; Stage 41.0 containers by
  // expedition + name. Opened boxes keep what the player left in them.
  migrateContainers(save, generated) {
    const list = this.structures.containers;
    const byKey = new Map(list.filter(c => c.stage41Key).map(c => [c.stage41Key, c]));
    const legacy = list.filter(c => c.stage41 && !c.stage41Key);
    const kept = list.filter(c => !(c.stage41 && !c.stage41Key));
    let id = Math.max(0, ...list.map(c => c.id || 0)) + 1;
    for (const g of generated.filter(c => c.stage41Key)) {
      const saved = byKey.get(g.stage41Key);
      if (saved) { saved.x = g.x; saved.y = g.y; saved.stage41Vault = g.stage41Vault; continue; }
      const box = { ...g, id:id++, loot:(g.loot || []).map(v => ({ ...v })) };
      const old = legacy.find(c => c.expeditionId === g.expeditionId && c.name === g.name);
      if (old && old.discovered) { box.loot = (old.loot || []).map(v => ({ ...v })); box.discovered = true; }
      kept.push(box);
    }
    this.structures.containers = kept;
  }

  importState(data, save) {
    for (const site of this.sites.values()) {
      const saved = data?.sites?.[site.def.id];
      site.st = { ...Stage41Runtime.freshState(), ...(saved || {}) };
      if (!saved) {
        site.st.discovered = Boolean(site.s.discovered);
        site.st.entered = Boolean(site.s.visits);
        site.st.vaultOpened = Boolean(this.vaultBox(site)?.discovered);
      }
      if (site.st.discovered) site.s.discovered = true;
      if (site.st.completed) this.secure(site);
    }
    this.notesRead = new Set(data?.notes || []);
    this.bannerQueue = [];
    this.bannerTimer = 0;
    if (this.ui.banner) this.ui.banner.className = 's41-banner hidden';
    this.hideNote();
    this.syncTiles();
    this.rescuePlayer();
    return true;
  }

  // A cleared outpost stays cleared: no authored infected, no room events.
  secure(site) {
    site.s.eventPool = [];
    const T = CONFIG.TILE;
    this.danger.enemies = this.danger.enemies.filter(e => !(this.inside(site.s, (e.x + e.w / 2) / T, (e.y + e.h / 2) / T, 1) && e.state === 'dormant'));
  }

  // Never leave a survivor inside rock after a migration or a re-carve.
  rescuePlayer() {
    const p = this.player, T = CONFIG.TILE;
    const x0 = Math.floor((p.x + 2) / T), x1 = Math.floor((p.x + p.w - 3) / T);
    const y0 = Math.floor(p.y / T), y1 = Math.floor((p.y + p.h - 1) / T);
    let stuck = false;
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (this.world.isSolid(x, y)) stuck = true;
    if (!stuck) return false;
    const tx = (p.x + p.w / 2) / T, ty = (p.y + p.h / 2) / T;
    let best = null, bestD = Infinity;
    for (const L of STAGE41_LEGACY) {
      if (tx >= L.x0 - 2 && tx <= L.x1 + 2 && ty >= L.floor - 44 && ty <= L.floor + 2) best = this.sites.get(L.id);
    }
    if (!best) for (const site of this.sites.values()) {
      const d = Math.abs((site.s.x + site.s.endX) / 2 - tx) + Math.abs(site.s.groundY - ty);
      if (this.inside(site.s, tx, ty, 3) && d < bestD) { best = site; bestD = d; }
    }
    if (!best) return false;
    const l = best.s.s41.landing;
    p.x = l.x * T + 6; p.y = l.y * T - p.h - 2; p.vx = 0; p.vy = 0;
    return true;
  }
}

/* --------------------------------------------------------------- hooks */

{
  const prompt = PlaceSystem.prototype.prompt;
  PlaceSystem.prototype.prompt = function(point) {
    if (point?.s41 && this.stage41) { const r = this.stage41.prompt(point); if (r != null) return r; }
    return prompt.call(this, point);
  };
  const use = PlaceSystem.prototype.use;
  PlaceSystem.prototype.use = function(point, player, ctx) {
    if (point?.s41 && this.stage41) {
      const r = this.stage41.use(point);
      if (r) return r;
      const out = use.call(this, point, player, ctx);
      this.stage41.afterUse(point, out);
      return out;
    }
    return use.call(this, point, player, ctx);
  };
  const draw = PlaceSystem.prototype.draw;
  PlaceSystem.prototype.draw = function(ctx, cameraX, cameraY) {
    draw.call(this, ctx, cameraX, cameraY);
    if (!this.stage41) return;
    const T = CONFIG.TILE;
    for (const p of this.points) {
      if (!p.s41 || !p.kind.startsWith('s41_')) continue;
      const x = p.tileX * T - cameraX, y = p.tileY * T - cameraY;
      if (x < -60 || x > ctx.canvas.width + 60 || y < -80 || y > ctx.canvas.height + 80) continue;
      this.stage41.drawPoint(ctx, p, x, y);
    }
  };
  const contamination = LoreSystem.prototype.contaminationIntensity;
  LoreSystem.prototype.contaminationIntensity = function(player) {
    const base = contamination.call(this, player);
    return this.stage41 ? Math.max(base, this.stage41.contamination(player)) : base;
  };
  const areaName = LoreSystem.prototype.areaName;
  LoreSystem.prototype.areaName = function(player) {
    return this.stage41?.areaName(player) || areaName.call(this, player);
  };
  const dialogue = SocietySystem.prototype.dialogueFor;
  SocietySystem.prototype.dialogueFor = function(npc) {
    const base = dialogue.call(this, npc);
    const rumor = this.stage41?.rumorFor(npc);
    return rumor ? `${base} ${rumor}` : base;
  };
}
