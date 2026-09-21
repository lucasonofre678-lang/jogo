// Stage 23 — campaign director.
// Connects the living base, radio, world-state and Blackridge into longer
// stories without replacing any of those systems. Operations are intentionally
// systemic: the player receives a clue, travels to a real structure and solves
// a condition that already exists in the sandbox (reach, clear, restore power).

const CAMPAIGN_OPERATION_TEMPLATES = [
  {
    kind:'rescue', title:'SINAL DE SOCORRO',
    types:['house','apartments','motel','school','clinic'],
    text:'Uma voz fraca pede ajuda e cita um ponto conhecido do condado. Há movimento no local.',
    reward:{ canned_food:1, water_bottle:1, bandage:2 }, days:2, risk:'ALTO'
  },
  {
    kind:'recovery', title:'CAIXA DE EMERGÊNCIA',
    types:['hospital','police','firestation','warehouse','workshop','market'],
    text:'Uma transmissão antiga indica um estoque que nunca foi recolhido. O lugar provavelmente não está vazio.',
    reward:{ scrap_metal:2, battery:1, county_scrip:10 }, days:3, risk:'MÉDIO'
  },
  {
    kind:'power', title:'SETOR FORA DA REDE',
    types:['substation','hospital','metro','maintenance','underground_mall'],
    text:'Um circuito de monitoramento ainda responde, mas o setor está sem energia. Religá-lo pode recuperar dados e suprimentos.',
    reward:{ wire:3, circuit_parts:1, county_scrip:8 }, days:3, risk:'MÉDIO'
  },
  {
    kind:'recon', title:'CONTATO PERDIDO',
    types:['railyard','quarry','ranger','farm','gas_station'],
    text:'O rádio repete coordenadas incompletas. Alguém esteve ali recentemente e deixou uma marca para quem viesse depois.',
    reward:{ fuel_can:1, canned_food:1, county_scrip:6 }, days:2, risk:'BAIXO'
  }
];

const RESIDENT_REQUESTS = {
  mara: {
    title:'Reserva para a base', text:'Mara quer deixar comida e água separadas antes da próxima expedição.',
    requirements:{ canned_food:2, water_bottle:1 }, reward:{ berries:3 }, morale:7
  },
  lena: {
    title:'Prateleira da enfermaria', text:'Lena quer repor material básico antes que alguém volte ferido.',
    requirements:{ cloth:2, disinfectant:1 }, reward:{ bandage:2 }, morale:8
  },
  eli: {
    title:'Manutenção preventiva', text:'Eli quer peças reservadas para não desmontar o carro errado quando algo quebrar.',
    requirements:{ scrap_metal:3, nails:4 }, reward:{ garage_parts:1 }, morale:7
  }
};

class CampaignSystem {
  constructor({ structures, society, baseCamp, worldState, danger, hordes, places, inventory, lore, progression, weather, seed, getWorldMinutes }) {
    Object.assign(this, { structures, society, baseCamp, worldState, danger, hordes, places, inventory, lore, progression, weather });
    this.seed = seed >>> 0;
    this.getWorldMinutes = getWorldMinutes;
    this.operations = [];
    this.requests = [];
    this.majorEvent = null;
    this.completed = [];
    this.operationCounter = 1;
    this.lastOperationDay = -1;
    this.lastRequestDay = -1;
    this.lastMajorEventDay = -2;
    this.baseMorale = 55;
    this.lastMoraleDay = 0;
    this.blackridgeResolved = false;
    this.onNotice = null;
  }

  rand(n) {
    let x = (n + this.seed * 67) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  day() { return Math.floor(this.getWorldMinutes() / 1440) + 1; }
  notice(text, tone='') { this.onNotice?.(text, tone); }

  structureByTypes(types, salt = 0) {
    const rows = this.structures.structures.filter(s => types.includes(s.type));
    if (!rows.length) return null;
    return rows[Math.floor(this.rand(salt + rows.length * 31) * rows.length) % rows.length];
  }

  operationMarker(op) {
    return { ...op, campaignSignal:true, tileX:op.tileX, tileY:op.tileY };
  }

  activeMapSignals() {
    return this.operations.filter(o => o.heard && o.status === 'active').map(o => this.operationMarker(o));
  }

  radioEntries() {
    const rows = this.operations.filter(o => o.status === 'active').map(o => ({
      id:o.id, freq:o.freq, name:`Operação · ${o.title}`,
      text:`${o.text} ${o.targetHint} Risco: ${o.risk}. Prazo: dia ${o.expiresDay}.`,
      campaignSignal:true, heard:o.heard
    }));
    if (this.majorEvent) rows.unshift({
      id:this.majorEvent.id, freq:'91.7', name:`Alerta · ${this.majorEvent.title}`,
      text:this.majorEvent.text, campaignSignal:true, campaignMajor:true, heard:Boolean(this.majorEvent.heard)
    });
    return rows;
  }

  hearOperation(id) {
    const op = this.operations.find(o => o.id === id);
    if (op && op.status === 'active') {
      op.heard = true;
      this.worldState?.record?.('campaign_operation_heard', { id:op.id, kind:op.kind, target:op.targetName });
      return op;
    }
    if (this.majorEvent?.id === id) {
      this.majorEvent.heard = true;
      this.worldState?.record?.('major_event_heard', { id:this.majorEvent.id, type:this.majorEvent.type, target:this.majorEvent.targetName });
      return this.majorEvent;
    }
    return null;
  }

  makeOperation(day) {
    const tier = this.progression?.tier || 0;
    const pool = CAMPAIGN_OPERATION_TEMPLATES.filter(t => t.kind !== 'power' || tier >= 2);
    const t = pool[Math.floor(this.rand(day * 311 + this.operationCounter * 71) * pool.length) % pool.length];
    const s = this.structureByTypes(t.types, day * 101 + this.operationCounter * 13);
    if (!s) return null;
    const tx = Math.round((s.x + s.endX) * .5);
    const ty = s.underground ? Math.round(((s.y1 ?? s.groundY - 8) + (s.y2 ?? s.groundY + 2)) * .5) : Math.max(2, (s.groundY || 20) - 3);
    const id = `op-${day}-${this.operationCounter++}`;
    return {
      id, kind:t.kind, title:t.title, text:t.text, risk:t.risk,
      freq:`${92 + (Math.floor(this.rand(day * 149 + this.operationCounter) * 150) / 10).toFixed(1)}`,
      targetName:s.name, targetType:s.type, tileX:tx, tileY:ty,
      targetHint:`Sinal associado a ${s.name}.`,
      createdDay:day, expiresDay:day + t.days, heard:false, status:'active',
      engaged:false, spawned:false, progress:0, reward:{...t.reward}
    };
  }

  maybeGenerateOperation(day) {
    if (!this.baseCamp?.has?.('radio_station') || day === this.lastOperationDay) return null;
    this.lastOperationDay = day;
    const active = this.operations.filter(o => o.status === 'active' && day <= o.expiresDay);
    if (active.length >= 2) return null;
    // Bigger operations start once the settlement has at least one resident or
    // the survivor has reached the metalworking tier.
    if ((this.baseCamp.residents()?.length || 0) < 1 && (this.progression?.tier || 0) < 2) return null;
    const op = this.makeOperation(day);
    if (!op) return null;
    this.operations.push(op);
    this.worldState?.record?.('campaign_operation_created', { id:op.id, kind:op.kind, target:op.targetName, day });
    return op;
  }

  localThreat(structure, padding = 4) {
    if (!structure) return 0;
    const x0 = (structure.x - padding) * CONFIG.TILE;
    const x1 = (structure.endX + padding) * CONFIG.TILE;
    let n = 0;
    for (const e of this.danger.enemies) if (e.alive && e.x + e.w >= x0 && e.x <= x1) n++;
    return n;
  }

  resolveOperation(op, message = null) {
    if (!op || op.status !== 'active') return false;
    op.status = 'completed';
    op.completedDay = this.day();
    this.completed.push(op.id);
    for (const [id, qty] of Object.entries(op.reward || {})) this.baseCamp.addStock(id, qty);
    this.baseMorale = Math.min(100, this.baseMorale + (op.kind === 'rescue' ? 8 : 4));
    for (const npc of this.baseCamp.residents()) npc.morale = Math.min(100, (npc.morale ?? 60) + (op.kind === 'rescue' ? 6 : 2));
    this.worldState?.record?.('campaign_operation_completed', { id:op.id, kind:op.kind, target:op.targetName, day:op.completedDay });
    this.notice(message || `Operação concluída: ${op.title} · recompensa enviada para a base`, 'good');
    return true;
  }

  updateOperations(dt, player) {
    const day = this.day();
    const here = this.worldState?.currentStructure;
    for (const op of this.operations) {
      if (op.status !== 'active') continue;
      if (day > op.expiresDay) {
        op.status = 'failed';
        this.baseMorale = Math.max(0, this.baseMorale - 3);
        this.worldState?.record?.('campaign_operation_failed', { id:op.id, target:op.targetName, day });
        if (op.heard) this.notice(`O sinal de ${op.targetName} desapareceu`, 'warn');
        continue;
      }
      if (!op.heard || !here || here.name !== op.targetName) continue;

      if (!op.engaged) {
        op.engaged = true;
        this.worldState?.record?.('campaign_operation_started', { id:op.id, target:op.targetName });
        this.notice(`${op.title}: objetivo localizado em ${op.targetName}`, 'warn');
      }

      if (op.kind === 'power') {
        if (this.places.poweredAreas.has(op.targetName)) this.resolveOperation(op, `Rede restaurada em ${op.targetName}`);
        continue;
      }

      if (op.kind === 'rescue' && !op.spawned) {
        op.spawned = true;
        const g = this.hordes.spawnGroup('small', player.x, { minTiles:28, maxTiles:44, life:160 });
        if (g) this.notice('O pedido de socorro era real. Movimento chegando pelas ruas.', 'danger');
      }

      const threat = this.localThreat(here, op.kind === 'rescue' ? 7 : 4);
      const safeEnough = op.kind === 'rescue' ? threat <= 2 : threat <= 4;
      if (safeEnough) op.progress += dt; else op.progress = Math.max(0, op.progress - dt * .4);
      const needed = op.kind === 'recon' ? 2.5 : op.kind === 'recovery' ? 5 : 6;
      if (op.progress >= needed) {
        this.resolveOperation(op, op.kind === 'rescue' ? 'Sobreviventes foram retirados da área e seguiram para um ponto seguro.' : null);
      }
    }
  }

  requestTemplate(npc) {
    return RESIDENT_REQUESTS[npc?.id] || null;
  }

  maybeGenerateRequest(day) {
    if (day === this.lastRequestDay || !this.baseCamp.anchor()) return null;
    this.lastRequestDay = day;
    if (this.requests.some(r => r.status === 'active')) return null;
    const candidates = this.baseCamp.residents().filter(n => this.requestTemplate(n));
    if (!candidates.length || this.rand(day * 173 + 9) < .28) return null;
    const npc = candidates[Math.floor(this.rand(day * 211 + 17) * candidates.length) % candidates.length];
    const t = this.requestTemplate(npc);
    const req = {
      id:`request-${npc.id}-${day}`, npcId:npc.id, title:t.title, text:t.text,
      requirements:{...t.requirements}, reward:{...t.reward}, morale:t.morale,
      createdDay:day, expiresDay:day + 3, status:'active'
    };
    this.requests.push(req);
    this.notice(`${npc.name} tem um pedido para a base`, 'info');
    return req;
  }

  requestProgress(req) {
    if (!req) return { complete:false, text:'' };
    const rows = Object.entries(req.requirements || {});
    const complete = rows.every(([id, qty]) => this.inventory.count(id) >= qty);
    return {
      complete,
      text:rows.map(([id, qty]) => `${ITEM_DEFS[id]?.name || id} ${Math.min(qty, this.inventory.count(id))}/${qty}`).join(' · ')
    };
  }

  fulfillRequest(id) {
    const req = this.requests.find(r => r.id === id && r.status === 'active');
    if (!req) return {ok:false, reason:'Pedido indisponível'};
    const p = this.requestProgress(req);
    if (!p.complete) return {ok:false, reason:'Ainda faltam recursos'};
    for (const [item, qty] of Object.entries(req.requirements)) this.inventory.remove(item, qty);
    for (const [item, qty] of Object.entries(req.reward || {})) this.baseCamp.addStock(item, qty);
    const npc = this.society.get(req.npcId);
    if (npc) {
      npc.relation = Math.min(100, npc.relation + 7);
      npc.morale = Math.min(100, (npc.morale ?? 60) + req.morale);
      npc.memories = Array.isArray(npc.memories) ? npc.memories : [];
      npc.memories.push({ type:'request', day:this.day(), text:req.title });
      if (npc.memories.length > 8) npc.memories.shift();
    }
    this.baseMorale = Math.min(100, this.baseMorale + req.morale * .6);
    req.status = 'completed';
    this.worldState?.record?.('resident_request_completed', { id:req.id, npc:req.npcId, day:this.day() });
    return {ok:true, npc, request:req};
  }

  updateMorale(day) {
    if (day <= this.lastMoraleDay || !this.baseCamp.anchor()) return;
    this.lastMoraleDay = day;
    const level = this.baseCamp.level();
    const residents = this.baseCamp.residents();
    const comfort = (this.baseCamp.has('kitchen_station') ? 2 : 0) + (this.baseCamp.has('medical_station') ? 1 : 0) + (this.baseCamp.has('generator') ? 1 : 0);
    let delta = level >= 3 ? 1 : 0;
    delta += comfort * .35;
    if (residents.length >= 3 && !this.baseCamp.has('kitchen_station')) delta -= 1.5;
    this.baseMorale = Math.max(0, Math.min(100, this.baseMorale + delta));
    for (const npc of residents) {
      const traitBonus = (npc.traits || []).includes('OTIMISTA') ? .8 : 0;
      npc.morale = Math.max(10, Math.min(100, (npc.morale ?? 60) + delta * .7 + traitBonus));
      npc.daysInBase = (npc.daysInBase || 0) + 1;
    }
  }

  maybeGenerateMajorEvent(day) {
    if (!this.baseCamp?.has?.('radio_station') || this.majorEvent || day - this.lastMajorEventDay < 2) return null;
    if (day < 3 || this.rand(day * 499 + 29) > .55) return null;
    this.lastMajorEventDay = day;
    const noisy = this.worldState?.noiseHotspot?.(.8);
    let type = this.rand(day * 613 + 7) > .48 ? 'migration' : 'grid_failure';
    if (type === 'grid_failure' && !this.places.poweredAreas.size) type = 'migration';

    if (type === 'migration') {
      const target = noisy ? this.structureByTypes(['market','hospital','apartments','police','school','suburb'], day*19) : this.structureByTypes(['market','hospital','apartments','police','school','suburb'], day*23);
      if (!target) return null;
      this.majorEvent = {
        id:`major-${day}`, type, title:'MIGRAÇÃO DE HORDA',
        text:`Movimento em massa foi detectado perto de ${target.name}. A área ficará instável por algumas horas.`,
        targetName:target.name, tileX:Math.round((target.x+target.endX)/2), tileY:Math.max(2,target.groundY-3),
        createdDay:day, expiresMinute:this.getWorldMinutes()+420, spawned:false
      };
    } else {
      const areas = [...this.places.poweredAreas];
      const area = areas[Math.floor(this.rand(day*37) * areas.length) % areas.length];
      if (!area) return null;
      this.places.poweredAreas.delete(area);
      const target = this.structures.structures.find(s => s.name === area);
      const point = !target ? this.places.points.find(p => this.places.areaFor(p) === area) : null;
      const tileX = target ? Math.round((target.x + target.endX) / 2) : (point?.tileX ?? Math.round(CONFIG.WORLD_W / 2));
      const tileY = target ? Math.max(2, target.groundY - 3) : (point?.tileY ?? Math.round(CONFIG.WORLD_H / 2));
      this.majorEvent = {
        id:`major-${day}`, type, title:'FALHA NA REDE',
        text:`Uma sobrecarga derrubou ${area}. A energia não voltará sozinha enquanto o setor não for reativado.`,
        targetName:area, tileX, tileY,
        createdDay:day, expiresMinute:this.getWorldMinutes()+720
      };
    }
    this.worldState?.record?.('major_event_started', { ...this.majorEvent });
    this.notice(`${this.majorEvent.title}: ${this.majorEvent.targetName}`, 'danger');
    return this.majorEvent;
  }

  updateMajorEvent() {
    const e = this.majorEvent;
    if (!e) return;
    const here = this.worldState?.currentStructure;
    if (e.type === 'migration' && !e.spawned && here?.name === e.targetName) {
      e.spawned = true;
      const targetX = e.tileX * CONFIG.TILE;
      const g = this.hordes.spawnGroup('large', targetX, { minTiles:38, maxTiles:64, life:360 });
      if (g) this.notice('A migração chegou. As ruas estão enchendo.', 'danger');
    }
    if (e.type === 'grid_failure' && this.places.poweredAreas.has(e.targetName)) {
      this.worldState?.record?.('major_event_resolved', { id:e.id, type:e.type, target:e.targetName });
      this.baseMorale = Math.min(100, this.baseMorale + 5);
      this.notice(`Rede estabilizada: ${e.targetName}`, 'good');
      this.majorEvent = null;
      return;
    }
    if (this.getWorldMinutes() >= e.expiresMinute) {
      this.worldState?.record?.('major_event_ended', { id:e.id, type:e.type, target:e.targetName });
      this.majorEvent = null;
    }
  }

  majorEventMapSignal() {
    if (!this.majorEvent || this.majorEvent.tileX <= 0) return [];
    return [{ ...this.majorEvent, campaignMajor:true }];
  }

  blackridgeSummary() {
    const docs = this.lore.documentsFound().length;
    const keycard = this.inventory.count('blackridge_keycard') > 0;
    const bunkerPower = this.places.flags.has('bunker_power');
    const internal = this.lore.readDocs.has('research_7b') && this.lore.readDocs.has('director_note');
    if (this.lore.archiveChoice) {
      return {
        stage:5, title:'EPÍLOGO BLACKRIDGE',
        text:this.lore.archiveChoice === 'transmit'
          ? 'Os dados foram transmitidos. Last County agora sabe o que aconteceu.'
          : 'O arquivo foi selado e os protocolos de contenção foram priorizados.',
        done:true
      };
    }
    if (this.lore.archiveUnlocked && internal) return {stage:4,title:'ARQUIVO CENTRAL',text:'Chegue ao arquivo e decida o destino dos dados.',done:false};
    if (this.lore.enteredBunker && bunkerPower) return {stage:3,title:'SETORES INTERNOS',text:'Localize os registros de pesquisa e da diretoria dentro do bunker.',done:false};
    if (this.lore.enteredBunker) return {stage:2,title:'ENERGIA DO BUNKER',text:'Encontre o quadro interno e restaure energia aos setores técnicos.',done:false};
    if (keycard && docs >= 3) return {stage:1,title:'ENTRAR EM BLACKRIDGE',text:'Você tem credencial e referências suficientes. Encontre o elevador do complexo.',done:false};
    return {stage:0,title:'INVESTIGAR BLACKRIDGE',text:`Reúna três registros e uma credencial. Registros: ${docs}/3 · cartão: ${keycard?'sim':'não'}.`,done:false};
  }

  applyBlackridgeOutcome() {
    if (this.blackridgeResolved || !this.lore.archiveChoice) return false;
    this.blackridgeResolved = true;
    if (this.lore.archiveChoice === 'transmit') {
      this.baseMorale = Math.min(100, this.baseMorale + 10);
      this.baseCamp.addStock('county_scrip', 20);
      this.baseCamp.addStock('circuit_parts', 2);
      for (const id of Object.keys(this.society.factionRep)) this.society.factionRep[id] = Math.min(100, (this.society.factionRep[id] || 0) + 6);
      this.worldState?.record?.('blackridge_endgame', { choice:'transmit', day:this.day() });
      this.notice('A verdade atravessa o rádio do condado. A base inteira para para ouvir.', 'good');
    } else {
      this.places.flags.add('blackridge_sealed');
      this.lore.containmentSealed = true;
      this.baseMorale = Math.min(100, this.baseMorale + 5);
      this.baseCamp.addStock('medicine', 2);
      this.baseCamp.addStock('battery', 2);
      this.worldState?.record?.('blackridge_endgame', { choice:'seal', day:this.day() });
      this.notice('Protocolos de contenção confirmados. Blackridge fica mais silenciosa.', 'good');
    }
    return true;
  }

  update(dt, player) {
    const day = this.day();
    this.updateMorale(day);
    const op = this.maybeGenerateOperation(day);
    if (op) this.notice(`Nova operação no rádio: ${op.title}`, 'warn');
    this.maybeGenerateRequest(day);
    this.maybeGenerateMajorEvent(day);
    this.updateOperations(dt, player);
    this.updateMajorEvent();
    this.applyBlackridgeOutcome();
    this.requests = this.requests.filter(r => r.status === 'completed' || day <= r.expiresDay);
  }

  settlementSummary() {
    const active = this.operations.filter(o => o.status === 'active').length;
    const requests = this.requests.filter(r => r.status === 'active').length;
    return {
      morale:Math.round(this.baseMorale), active, requests,
      event:this.majorEvent ? `${this.majorEvent.title} · ${this.majorEvent.targetName}` : 'Condado relativamente estável'
    };
  }

  exportState() {
    return {
      version:1,
      operations:this.operations.map(o => ({...o, reward:{...(o.reward||{})}})),
      requests:this.requests.map(r => ({...r, requirements:{...(r.requirements||{})}, reward:{...(r.reward||{})}})),
      majorEvent:this.majorEvent ? {...this.majorEvent} : null,
      completed:[...this.completed], operationCounter:this.operationCounter,
      lastOperationDay:this.lastOperationDay, lastRequestDay:this.lastRequestDay,
      lastMajorEventDay:this.lastMajorEventDay, baseMorale:this.baseMorale,
      lastMoraleDay:this.lastMoraleDay, blackridgeResolved:this.blackridgeResolved
    };
  }

  importState(data) {
    if (!data || data.version !== 1) return false;
    this.operations = (data.operations || []).map(o => ({...o, reward:{...(o.reward||{})}}));
    this.requests = (data.requests || []).map(r => ({...r, requirements:{...(r.requirements||{})}, reward:{...(r.reward||{})}}));
    this.majorEvent = data.majorEvent ? {...data.majorEvent} : null;
    this.completed = [...(data.completed || [])];
    this.operationCounter = data.operationCounter || 1;
    this.lastOperationDay = Number.isFinite(data.lastOperationDay) ? data.lastOperationDay : -1;
    this.lastRequestDay = Number.isFinite(data.lastRequestDay) ? data.lastRequestDay : -1;
    this.lastMajorEventDay = Number.isFinite(data.lastMajorEventDay) ? data.lastMajorEventDay : -2;
    this.baseMorale = Number.isFinite(data.baseMorale) ? data.baseMorale : 55;
    this.lastMoraleDay = data.lastMoraleDay || 0;
    this.blackridgeResolved = Boolean(data.blackridgeResolved);
    return true;
  }
}
