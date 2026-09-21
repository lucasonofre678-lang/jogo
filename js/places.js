// Interactive world points: the things that make a building worth entering.
//
// Doors that are locked or boarded, garage shutters that need power, hatches
// down into cellars, terminals that only wake up when the grid is back, key
// hooks, fire pits and cave mouths. Each one is a small decision: do I have the
// tool, the key, the power — or do I make noise forcing it?

const PLACE_LABELS = {
  door: 'PORTA',
  barricade: 'BARRICADA',
  shutter: 'PORTÃO',
  hatch: 'ALÇAPÃO',
  terminal: 'TERMINAL',
  key_hook: 'CHAVES',
  firepit: 'FOGUEIRA',
  cave_mouth: 'CAVERNA',
  fuel_pump: 'BOMBA',
  workbench_spot: 'BANCADA',
  light_switch: 'INTERRUPTOR',
  curtain: 'CORTINA',
  alarm: 'ALARME',
  movable: 'OBJETO',
  fuse_panel: 'QUADRO ELÉTRICO',
  district_panel: 'PAINEL DA REDE'
};

class PlaceSystem {
  constructor(world, structures, inventory, danger) {
    this.world = world;
    this.structures = structures;
    this.inventory = inventory;
    this.danger = danger;
    this.points = structures.points;
    this.flags = new Set();          // leads / knowledge the player has picked up
    this.poweredAreas = new Set();
    this.log = [];
  }

  /* ------------------------------------------------------------ helpers */

  cells(point) {
    const out = [];
    const w = point.width || 1;
    const h = point.height || 1;
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) out.push({ x: point.tileX + i, y: point.tileY - j });
    }
    return out;
  }

  open(point) {
    if (point.state === 'open') return;
    point.state = 'open';
    for (const c of this.cells(point)) this.world.set(c.x, c.y, TILE.AIR);
  }

  close(point) {
    if (point.state === 'closed') return;
    point.state = 'closed';
    for (const c of this.cells(point)) this.world.set(c.x, c.y, point.tile || TILE.PLANK);
  }

  hasTool(toolId) {
    return this.inventory.count(toolId) > 0;
  }

  // Structures near a point define which area's power state applies.
  areaFor(point) {
    if (point.area) return point.area;
    // Prefer the concrete structure owner so underground stations, galleries
    // and multi-level buildings keep their own power domain. Fall back to the
    // broader surface area for legacy points placed outdoors.
    const s = this.structures.structureAt?.(point.tileX, point.tileY, 3);
    return s ? s.name : (this.structures.areaAt?.(point.tileX, point.tileY) || null);
  }

  isPowered(point) {
    const area = this.areaFor(point);
    return Boolean(area && this.poweredAreas.has(area));
  }

  powerArea(areaName) {
    if (!areaName) return false;
    const first = !this.poweredAreas.has(areaName);
    this.poweredAreas.add(areaName);
    return first;
  }

  nearest(player, reachTiles = CONFIG.INTERACT_REACH) {
    const c = player.center();
    let best = null;
    let bestD = reachTiles * CONFIG.TILE;
    for (const p of this.points) {
      if (p.consumed) continue;
      const px = (p.tileX + (p.width || 1) / 2) * CONFIG.TILE;
      const py = (p.tileY + 0.5) * CONFIG.TILE;
      const d = Math.hypot(px - c.x, py - c.y);
      if (d < bestD) { best = p; bestD = d; }
    }
    return best;
  }

  /* ------------------------------------------------------------- prompts */

  prompt(point) {
    if (!point) return '';
    const tag = PLACE_LABELS[point.kind] || '';
    switch (point.kind) {
      case 'door': {
        if (point.state === 'open') return `E — FECHAR ${point.name.toUpperCase()}`;
        if (!point.locked) return `E — ABRIR ${point.name.toUpperCase()}`;
        if (point.keyItem && this.hasTool(point.keyItem)) return `E — DESTRANCAR ${point.name.toUpperCase()}`;
        if (this.hasTool(point.forceTool)) return `E — ARROMBAR ${point.name.toUpperCase()} (RUÍDO)`;
        return point.keyItem
          ? `${tag} TRANCADA — precisa de ${ITEM_DEFS[point.keyItem]?.name || 'chave'}`
          : `${tag} TRANCADA — precisa de ${ITEM_DEFS[point.forceTool]?.name || 'ferramenta'}`;
      }
      case 'barricade': {
        if (point.state === 'open') return '';
        const tool = this.hasTool('crowbar') || this.hasTool('stone_axe') || this.hasTool('repair_hammer');
        return tool
          ? `E — ARRANCAR ${point.name.toUpperCase()} (${point.integrity} golpes)`
          : `${tag} — precisa de pé de cabra ou machado`;
      }
      case 'shutter': {
        if (point.state === 'open') return `E — FECHAR ${point.name.toUpperCase()}`;
        if (this.isPowered(point)) return `E — ABRIR ${point.name.toUpperCase()}`;
        if (this.hasTool(point.forceTool)) return `E — FORÇAR ${point.name.toUpperCase()} (RUÍDO)`;
        return `${tag} SEM ENERGIA — ligue um gerador na área`;
      }
      case 'hatch':
        if (point.locked && point.keyItem && !this.hasTool(point.keyItem)) {
          return `${tag} TRANCADO — precisa de ${ITEM_DEFS[point.keyItem]?.name || 'chave'}`;
        }
        return `E — ${point.label || 'DESCER'}`;
      case 'terminal':
        if (point.used) return `E — RELER ${point.name.toUpperCase()}`;
        if (point.needsPower && !this.isPowered(point)) return `${tag} SEM ENERGIA`;
        return `E — USAR ${point.name.toUpperCase()}`;
      case 'key_hook':
        return point.consumed ? '' : `E — PEGAR ${point.name.toUpperCase()}`;
      case 'firepit':
        return point.state === 'lit' ? 'FOGUEIRA ACESA' : 'E — ACENDER FOGUEIRA (1 madeira)';
      case 'fuel_pump':
        if (!this.isPowered(point)) return `${tag} SEM ENERGIA — ligue um gerador aqui`;
        return 'E — BOMBEAR COMBUSTÍVEL (1 galão vazio)';
      case 'cave_mouth':
        return 'ENTRADA DE CAVERNA';
      case 'workbench_spot':
        return '';
      case 'light_switch':
        if (!this.isPowered(point)) return `${tag} SEM ENERGIA`;
        return `E — ${point.state === 'on' ? 'APAGAR' : 'ACENDER'} ${point.name.toUpperCase()}`;
      case 'curtain':
        return `E — ${point.state === 'closed' ? 'ABRIR' : 'FECHAR'} ${point.name.toUpperCase()}`;
      case 'alarm':
        return `E — ${point.state === 'on' ? 'DESLIGAR' : 'ATIVAR'} ${point.name.toUpperCase()}`;
      case 'movable':
        return `E — EMPURRAR ${point.name.toUpperCase()}`;
      case 'fuse_panel':
        if (this.isPowered(point)) return `${tag} · ÁREA ENERGIZADA`;
        return `E — RESTAURAR ENERGIA (2 cabos + 1 bateria)`;
      case 'district_panel': {
        const allOn = (point.areas || []).every(a => this.poweredAreas.has(a));
        return allOn ? `${tag} · DISTRITO ENERGIZADO` : `E — RELIGAR DISTRITO (4 cabos + 2 baterias + 1 componente)`;
      }
      default:
        return '';
    }
  }

  /* ----------------------------------------------------------- the verbs */

  use(point, player, ctx = {}) {
    if (!point) return { ok: false };
    switch (point.kind) {
      case 'door': return this.useDoor(point, player);
      case 'barricade': return this.useBarricade(point, player);
      case 'shutter': return this.useShutter(point, player);
      case 'hatch': return this.useHatch(point, player);
      case 'terminal': return this.useTerminal(point);
      case 'key_hook': return this.useKeyHook(point);
      case 'firepit': return this.useFirepit(point);
      case 'fuel_pump': return this.useFuelPump(point);
      case 'light_switch': return this.useLightSwitch(point);
      case 'curtain': return this.useCurtain(point);
      case 'alarm': return this.useAlarm(point);
      case 'movable': return this.useMovable(point, player);
      case 'fuse_panel': return this.useFusePanel(point);
      case 'district_panel': return this.useDistrictPanel(point);
      default: return { ok: false, reason: 'Nada acontece' };
    }
  }

  useDoor(point, player) {
    if (point.state === 'open') {
      this.close(point);
      return { ok: true, noise: 40, message: `${point.name} fechada` };
    }
    if (!point.locked) {
      this.open(point);
      return { ok: true, noise: 55, message: `${point.name} aberta` };
    }
    if (point.keyItem && this.hasTool(point.keyItem)) {
      point.locked = false;
      this.open(point);
      return { ok: true, noise: 45, message: `${point.name} destrancada`, unlocked: true };
    }
    const tool = point.forceTool;
    if (this.hasTool(tool)) {
      point.integrity -= 1;
      if (point.integrity <= 0) {
        point.locked = false;
        this.open(point);
        return { ok: true, noise: 210, message: `${point.name} arrombada`, forced: true, damageTool: tool };
      }
      return { ok: true, noise: 180, message: `A fechadura cede... (${point.integrity})`, partial: true, damageTool: tool };
    }
    return {
      ok: false,
      reason: point.keyItem
        ? `Trancada. Precisa de ${ITEM_DEFS[point.keyItem]?.name || 'uma chave'}`
        : `Trancada. Precisa de ${ITEM_DEFS[tool]?.name || 'uma ferramenta'}`
    };
  }

  useBarricade(point, player) {
    const tool = ['crowbar', 'stone_axe', 'repair_hammer'].find(t => this.hasTool(t));
    if (!tool) return { ok: false, reason: 'Precisa de pé de cabra ou machado para arrancar as tábuas' };
    point.integrity -= tool === 'crowbar' ? 2 : 1;
    if (point.integrity <= 0) {
      this.open(point);
      point.consumed = true;
      return { ok: true, noise: 200, message: 'Tábuas arrancadas', forced: true, damageTool: tool, drops: { wood: 2, nails: 2 } };
    }
    return { ok: true, noise: 170, message: `As tábuas rangem... (${point.integrity})`, partial: true, damageTool: tool };
  }

  useShutter(point, player) {
    if (point.state === 'open') {
      this.close(point);
      return { ok: true, noise: 90, message: `${point.name} fechado` };
    }
    if (this.isPowered(point)) {
      this.open(point);
      return { ok: true, noise: 120, message: `${point.name} aberto` };
    }
    if (this.hasTool(point.forceTool)) {
      point.integrity -= 1;
      if (point.integrity <= 0) {
        this.open(point);
        return { ok: true, noise: 240, message: `${point.name} forçado`, forced: true, damageTool: point.forceTool };
      }
      return { ok: true, noise: 200, message: `O portão range... (${point.integrity})`, partial: true, damageTool: point.forceTool };
    }
    return { ok: false, reason: 'Sem energia. Ligue um gerador por perto ou traga um pé de cabra' };
  }

  useHatch(point, player) {
    if (point.locked && point.keyItem && !this.hasTool(point.keyItem)) {
      return { ok: false, reason: `Trancado. Precisa de ${ITEM_DEFS[point.keyItem]?.name || 'uma chave'}` };
    }
    player.x = point.targetX * CONFIG.TILE + 6;
    player.y = point.targetY * CONFIG.TILE - player.h - 2;
    player.vx = 0; player.vy = 0;
    return { ok: true, noise: 60, message: point.label || 'Você desce', teleport: true };
  }

  useTerminal(point) {
    if (point.needsPower && !this.isPowered(point)) {
      return { ok: false, reason: 'O terminal está sem energia' };
    }
    const first = !point.used;
    point.used = true;
    if (point.grants) this.flags.add(point.grants);
    if (first && point.note) this.log.push({ title: point.name, text: point.note });

    // a grant that names a real item hands it over the first time
    const giveItem = first && point.grants && ITEM_DEFS[point.grants] ? point.grants : null;
    // some panels bring their own area back online
    const powered = first && point.powers ? this.powerArea(this.areaFor(point)) : false;

    return {
      ok: true, noise: 30, message: point.note || `${point.name} acessado`,
      note: point.note, first, grants: point.grants, giveItem, powered
    };
  }

  useKeyHook(point) {
    point.consumed = true;
    if (point.grants) this.flags.add(point.grants);
    return { ok: true, noise: 20, message: `${ITEM_DEFS[point.grants]?.name || 'Chave'} recolhida`, giveItem: point.grants };
  }

  useFirepit(point) {
    if (point.state === 'lit') return { ok: false, reason: 'Já está acesa' };
    if (this.inventory.count('wood') < 1) return { ok: false, reason: 'Precisa de 1 madeira' };
    this.inventory.remove('wood', 1);
    point.state = 'lit';
    point.fuel = 180;
    return { ok: true, noise: 60, message: 'Fogueira acesa', lit: true };
  }

  useFuelPump(point) {
    if (!this.isPowered(point)) return { ok: false, reason: 'A bomba está sem energia' };
    if (this.inventory.count('empty_bottle') < 1) {
      return { ok: false, reason: 'Precisa de um recipiente vazio' };
    }
    if (point.drained) return { ok: false, reason: 'Os tanques estão secos' };
    point.uses = (point.uses || 0) + 1;
    if (point.uses >= 3) point.drained = true;
    return { ok: true, noise: 110, message: 'Galão de combustível cheio', giveItem: 'fuel_can', takeItem: 'empty_bottle', sound: 'pump' };
  }

  useLightSwitch(point) {
    if (!this.isPowered(point)) return { ok:false, reason:'Sem energia neste prédio' };
    point.state = point.state === 'on' ? 'off' : 'on';
    return { ok:true, noise:12, message:`${point.name} ${point.state === 'on' ? 'acesa' : 'apagada'}`, sound:'switch' };
  }

  useCurtain(point) {
    point.state = point.state === 'closed' ? 'open' : 'closed';
    return { ok:true, noise:8, message:`${point.name} ${point.state === 'open' ? 'aberta' : 'fechada'}`, sound:'cloth' };
  }

  useAlarm(point) {
    point.state = point.state === 'on' ? 'off' : 'on';
    point.alarmTimer = 0;
    return {
      ok:true,
      noise: point.state === 'on' ? 900 : 30,
      message: point.state === 'on' ? 'Alarme disparado — isso vai trazer companhia' : 'Alarme desligado',
      sound:'alarm',
      alarmOn: point.state === 'on'
    };
  }

  useMovable(point, player) {
    const dir = player.facing >= 0 ? 1 : -1;
    const nx = point.tileX + dir;
    const y = point.tileY;
    if (!this.world.inBounds(nx, y) || this.world.get(nx, y) !== TILE.AIR || !this.world.isSolid(nx, y + 1)) {
      return { ok:false, reason:'Não há espaço para empurrar' };
    }
    point.tileX = nx;
    point.x = nx * CONFIG.TILE;
    return { ok:true, noise:75, message:`${point.name} movido`, sound:'push' };
  }

  useFusePanel(point) {
    if (this.isPowered(point)) return { ok:false, reason:'A energia desta área já está ativa' };
    if (this.inventory.count('wire') < 2 || this.inventory.count('battery') < 1) {
      return { ok:false, reason:'Requer 2 Cabos elétricos + 1 Bateria' };
    }
    this.inventory.remove('wire', 2);
    this.inventory.remove('battery', 1);
    this.powerArea(this.areaFor(point));
    point.state = 'on';
    return { ok:true, noise:65, message:'Quadro reparado. Energia restaurada.', powered:true, sound:'power_on' };
  }

  useDistrictPanel(point) {
    const areas = point.areas || [];
    if (areas.length && areas.every(a => this.poweredAreas.has(a))) return { ok:false, reason:'A rede urbana já está energizada' };
    if (this.inventory.count('wire') < 4 || this.inventory.count('battery') < 2 || this.inventory.count('circuit_parts') < 1) {
      return { ok:false, reason:'Requer 4 Cabos + 2 Baterias + 1 Componentes elétricos' };
    }
    this.inventory.remove('wire', 4);
    this.inventory.remove('battery', 2);
    this.inventory.remove('circuit_parts', 1);
    for (const area of areas) this.powerArea(area);
    point.state = 'on';
    return { ok:true, noise:150, message:`Rede restaurada: ${areas.length} setores receberam energia.`, powered:true, district:true, sound:'power_on' };
  }

  activeLights() {
    return this.points.filter(p => p.kind === 'light_switch' && p.state === 'on' && this.isPowered(p));
  }

  areaHasSwitch(areaName) {
    return this.points.some(p => p.kind === 'light_switch' && this.areaFor(p) === areaName);
  }

  areaLightsOn(areaName) {
    return this.points.some(p => p.kind === 'light_switch' && this.areaFor(p) === areaName && p.state === 'on' && this.isPowered(p));
  }

  update(dt) {
    for (const p of this.points) {
      if (p.kind === 'firepit' && p.state === 'lit') {
        p.fuel -= dt;
        if (p.fuel <= 0) p.state = 'cold';
      }
      if (p.kind === 'alarm' && p.state === 'on') {
        p.alarmTimer = (p.alarmTimer || 0) - dt;
        if (p.alarmTimer <= 0) {
          p.alarmTimer = 2.1;
          this.danger.emitNoise((p.tileX + .5) * CONFIG.TILE, (p.tileY + .5) * CONFIG.TILE, 900, 'alarme');
        }
      }
    }
  }

  litFirepits() {
    return this.points.filter(p => p.kind === 'firepit' && p.state === 'lit');
  }

  /* ------------------------------------------------------------ drawing */

  draw(ctx, cameraX, cameraY) {
    const T = CONFIG.TILE;
    for (const p of this.points) {
      const x = p.tileX * T - cameraX;
      const y = p.tileY * T - cameraY;
      if (x < -120 || x > ctx.canvas.width + 120) continue;

      if (p.kind === 'door' && p.state === 'closed') {
        const h = (p.height || 2) * T;
        const top = y - h + T;
        ctx.fillStyle = 'rgba(0,0,0,.22)';
        ctx.fillRect(x + 2, top, T - 4, h);
        ctx.fillStyle = p.locked ? '#5f5140' : '#6b5b45';
        ctx.fillRect(x + 3, top + 2, T - 6, h - 4);
        ctx.fillStyle = 'rgba(226,216,186,.12)';
        ctx.fillRect(x + 3, top + 2, T - 6, 2);
        ctx.fillStyle = p.locked ? '#c6a85e' : '#9a8a6a';
        ctx.fillRect(x + T - 9, top + h / 2 - 2, 4, 4);
        if (p.locked) {
          ctx.fillStyle = 'rgba(198,168,94,.85)';
          ctx.fillRect(x + T / 2 - 3, top + h / 2 - 8, 6, 5);
        }
      }

      if (p.kind === 'shutter' && p.state === 'closed') {
        const w = (p.width || 1) * T, h = (p.height || 1) * T;
        const top = y - h + T;
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        ctx.fillRect(x, top, w, h);
        ctx.strokeStyle = 'rgba(20,22,24,.7)';
        ctx.lineWidth = 1;
        for (let i = 0; i < h; i += 6) {
          ctx.beginPath(); ctx.moveTo(x, top + i); ctx.lineTo(x + w, top + i); ctx.stroke();
        }
        ctx.fillStyle = this.isPowered(p) ? '#8da36c' : '#a2564c';
        ctx.fillRect(x + w - 7, top + h - 10, 5, 5);
      }

      if (p.kind === 'hatch') {
        ctx.fillStyle = '#3a4144';
        ctx.fillRect(x + 4, y + 18, T - 8, 10);
        ctx.fillStyle = '#6c7578';
        ctx.fillRect(x + 7, y + 20, T - 14, 3);
        ctx.fillStyle = p.locked ? '#c07a5c' : '#8da36c';
        ctx.fillRect(x + T - 12, y + 24, 4, 3);
      }

      if (p.kind === 'light_switch') {
        const powered = this.isPowered(p);
        ctx.fillStyle = '#303638'; ctx.fillRect(x + 10, y + 10, 12, 18);
        ctx.fillStyle = powered && p.state === 'on' ? '#d7c46d' : '#5b605d';
        ctx.fillRect(x + 14, y + 14, 4, 8);
      }

      if (p.kind === 'curtain') {
        if (p.state === 'closed') {
          ctx.fillStyle = 'rgba(91,72,62,.92)';
          ctx.fillRect(x + 2, y - 24, T - 4, 48);
          ctx.fillStyle = 'rgba(180,150,120,.18)';
          for (let i=5;i<T-4;i+=7) ctx.fillRect(x+i, y-22, 2, 44);
        } else {
          ctx.fillStyle = 'rgba(91,72,62,.86)';
          ctx.fillRect(x + 2, y - 24, 6, 48); ctx.fillRect(x + T - 8, y - 24, 6, 48);
        }
      }

      if (p.kind === 'alarm') {
        const pulse = p.state === 'on' ? (0.45 + Math.abs(Math.sin(performance.now() * .01)) * .55) : .2;
        ctx.fillStyle = `rgba(192,63,54,${pulse})`;
        ctx.beginPath(); ctx.arc(x + 16, y + 13, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#34393b'; ctx.fillRect(x + 9, y + 19, 14, 7);
      }

      if (p.kind === 'movable') {
        ctx.fillStyle = '#6f563f'; ctx.fillRect(x + 3, y + 5, T - 6, T - 8);
        ctx.strokeStyle = '#9b7a55'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 6, T - 8, T - 10);
        ctx.beginPath(); ctx.moveTo(x + 6, y + 8); ctx.lineTo(x + T - 6, y + T - 5); ctx.moveTo(x + T - 6, y + 8); ctx.lineTo(x + 6, y + T - 5); ctx.stroke();
      }

      if (p.kind === 'fuse_panel') {
        ctx.fillStyle = '#4c5557'; ctx.fillRect(x + 6, y + 4, T - 12, T - 8);
        ctx.fillStyle = this.isPowered(p) ? '#819b68' : '#a25f53'; ctx.fillRect(x + 10, y + 9, 5, 5);
        ctx.fillStyle = '#222728'; for (let i=0;i<3;i++) ctx.fillRect(x+10, y+18+i*3, 12, 1);
      }

      if (p.kind === 'terminal') {
        const on = !p.needsPower || this.isPowered(p);
        ctx.fillStyle = '#2b3235';
        ctx.fillRect(x + 4, y + 6, T - 8, 22);
        ctx.fillStyle = on ? '#5f8a7a' : '#39413f';
        ctx.fillRect(x + 7, y + 9, T - 14, 12);
        if (on) {
          ctx.fillStyle = 'rgba(180,220,200,.7)';
          for (let i = 0; i < 3; i++) ctx.fillRect(x + 9, y + 11 + i * 3, 4 + ((i * 7 + Math.floor(performance.now() / 400)) % 9), 1);
        }
        ctx.fillStyle = on ? '#c6a85e' : '#5a5148';
        ctx.fillRect(x + T - 10, y + 23, 4, 3);
      }

      if (p.kind === 'key_hook' && !p.consumed) {
        ctx.fillStyle = '#5a5148';
        ctx.fillRect(x + 6, y + 10, T - 12, 12);
        ctx.fillStyle = '#c6a85e';
        for (let i = 0; i < 3; i++) ctx.fillRect(x + 9 + i * 5, y + 14, 2, 6);
      }

      if (p.kind === 'firepit') {
        ctx.fillStyle = '#4a4237';
        ctx.fillRect(x + 6, y + 22, T - 12, 6);
        ctx.fillStyle = '#6a5a44';
        ctx.fillRect(x + 9, y + 18, T - 18, 5);
        if (p.state === 'lit') {
          const f = 0.6 + Math.abs(Math.sin(performance.now() * 0.006)) * 0.4;
          ctx.fillStyle = `rgba(226,140,62,${f})`;
          ctx.beginPath();
          ctx.moveTo(x + 16, y + 6);
          ctx.lineTo(x + 23, y + 22);
          ctx.lineTo(x + 9, y + 22);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = `rgba(244,214,146,${f})`;
          ctx.fillRect(x + 14, y + 14, 4, 7);
        }
      }

      if (p.kind === 'cave_mouth') {
        ctx.fillStyle = 'rgba(8,10,12,.55)';
        ctx.beginPath();
        ctx.ellipse(x + T / 2, y + T, 22, 16, 0, Math.PI, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
