// Stage 22 — living base layer. Keeps settlement jobs, daily production and
// radio opportunities small and systemic so the content pass can build on it.
class BaseCampSystem {
  constructor({ building, society, inventory, structures, worldState, danger, weather, vehicles, farming, seed, getWorldMinutes }) {
    this.building = building;
    this.society = society;
    this.inventory = inventory;
    this.structures = structures;
    this.worldState = worldState;
    this.danger = danger;
    this.weather = weather;
    this.vehicles = vehicles;
    this.farming = farming || null;
    this.seed = seed >>> 0;
    this.getWorldMinutes = getWorldMinutes;
    this.stock = new Map();
    this.signals = [];
    this.lastProductionDay = 0;
    this.lastSignalDay = -1;
    this.signalCounter = 1;
    this.onNotice = null;
  }

  rand(n) {
    let x = (n + this.seed * 41) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  anchor() { return this.society?.baseAnchor?.() || null; }
  residents() { return this.society?.baseResidents?.() || []; }

  station(type) {
    const alive = this.building?.objects?.filter(o => o.health > 0 && o.type === type) || [];
    if (!alive.length) return null;
    const a = this.anchor();
    if (!a) return alive[0];
    alive.sort((p, q) => Math.abs((p.tileX + p.width * .5) * CONFIG.TILE - a.x) - Math.abs((q.tileX + q.width * .5) * CONFIG.TILE - a.x));
    return alive[0];
  }

  has(type) { return Boolean(this.station(type)); }

  stationSummary() {
    return [
      ['radio_station', 'Rádio'], ['kitchen_station', 'Cozinha'], ['medical_station', 'Enfermaria'],
      ['auto_bench', 'Garagem'], ['workbench', 'Oficina'], ['guard_post', 'Guarda'], ['generator', 'Energia'],
      ['garden_plot', 'Horta'], ['stove', 'Fogão'], ['icebox', 'Geladeira'], ['drying_rack', 'Varal']
    ].map(([type, label]) => ({ type, label, online: this.has(type) }));
  }

  jobFor(npc) {
    if (!npc) return { id:'idle', label:'Sem função', station:null };
    const prof = String(npc.profession || '').toLowerCase();
    let job = { id:'idle', label:'Sem função', station:null };
    if (prof.includes('méd')) job = { id:'medic', label:'Enfermaria', station:'medical_station' };
    else if (prof.includes('mec')) job = { id:'mechanic', label:'Oficina', station:this.has('auto_bench') ? 'auto_bench' : 'workbench' };
    // Stage 31: quem entende de terra vai para a horta assim que existir uma.
    // Sem canteiros, a mesma pessoa volta a ser a responsável pela despensa.
    else if (prof.includes('agric')) {
      job = this.has('garden_plot')
        ? { id:'farmer', label:'Horta da base', station:'garden_plot' }
        : { id:'quartermaster', label:'Cozinha & suprimentos', station:'kitchen_station' };
    }
    if (job.id === 'idle' && this.has('garden_plot') && !this.has('guard_post')) {
      job = { id:'farmer', label:'Horta da base', station:'garden_plot' };
    }
    if (job.station && this.has(job.station)) return job;
    if (this.has('guard_post')) return { id:'guard', label:'Vigia', station:'guard_post' };
    return job;
  }

  targetFor(npc) {
    const job = this.jobFor(npc);
    const o = job.station ? this.station(job.station) : null;
    if (!o) return null;
    return {
      x: (o.tileX + o.width * .5) * CONFIG.TILE,
      y: (o.tileY - Math.max(0, o.height - 1)) * CONFIG.TILE,
      type: o.type,
      label: job.label
    };
  }

  level() {
    const residents = this.residents().length;
    const stations = this.stationSummary().filter(s => s.online).length;
    if (!this.anchor()) return 0;
    if (residents >= 3 && stations >= 5) return 4;
    if (residents >= 2 && stations >= 3) return 3;
    if (residents >= 1 && stations >= 2) return 2;
    return 1;
  }

  levelName() {
    return ['Abrigo improvisado','Acampamento','Base habitada','Posto avançado','Assentamento'][this.level()] || 'Abrigo';
  }

  addStock(id, qty = 1) {
    if (!ITEM_DEFS[id] || qty <= 0) return 0;
    this.stock.set(id, (this.stock.get(id) || 0) + qty);
    return qty;
  }

  stockEntries() {
    return [...this.stock.entries()].filter(([, qty]) => qty > 0).map(([id, qty]) => ({ id, qty, def: ITEM_DEFS[id] }));
  }

  claimStock() {
    let moved = 0;
    for (const [id, qty] of [...this.stock.entries()]) {
      let remaining = qty;
      while (remaining > 0 && this.inventory.canAdd(id, 1)) {
        if (!this.inventory.add(id, 1)) break;
        remaining--; moved++;
      }
      if (remaining > 0) this.stock.set(id, remaining); else this.stock.delete(id);
    }
    return moved;
  }

  dailyProduction(day) {
    if (day <= this.lastProductionDay || !this.anchor()) return [];
    this.lastProductionDay = day;
    const made = [];
    for (const npc of this.residents()) {
      const job = this.jobFor(npc);
      if (!job.station || !this.has(job.station)) continue;
      // Stage 23: morale changes efficiency without turning the settlement into
      // a spreadsheet. Very low morale can cost a workday; strong traits add
      // small, readable bonuses to the job they already perform.
      const morale = npc.morale ?? 60;
      if (morale < 25 && (day + npc.id.length) % 2 === 0) { made.push(`${npc.name}: descansou hoje`); continue; }
      if (job.id === 'medic') {
        this.addStock('bandage', 1); made.push(`${npc.name}: 1 curativo`);
        if ((npc.traits || []).includes('MÉDICA DE CAMPO') && day % 2 === 0) this.addStock('bandage', 1);
        if (day % 3 === 0) { this.addStock('disinfectant', 1); made.push(`${npc.name}: 1 antisséptico`); }
      } else if (job.id === 'mechanic') {
        this.addStock('nails', 2); this.addStock('scrap_metal', 1);
        if ((npc.traits || []).includes('MECÂNICO NATO') && day % 2 === 1) this.addStock('scrap_metal', 1);
        made.push(`${npc.name}: peças e sucata`);
      } else if (job.id === 'farmer') {
        // O morador da horta rega tudo e colhe o que estiver pronto. É isso
        // que transforma a base num lugar que produz comida sozinho.
        const work = this.tendGarden(npc);
        if (work.harvested.length) made.push(`${npc.name}: ${work.harvested.join(', ')}`);
        else made.push(`${npc.name}: cuidou da horta (${work.watered} canteiro${work.watered === 1 ? '' : 's'} regado${work.watered === 1 ? '' : 's'})`);
        if ((npc.traits || []).includes('PROVEDORA')) this.addStock('wild_herbs', 2);
      } else if (job.id === 'quartermaster') {
        this.addStock('berries', 3); made.push(`${npc.name}: alimento coletado`);
        if ((npc.traits || []).includes('PROVEDORA')) this.addStock('berries', 1);
        if (day % 2 === 0) this.addStock('water_bottle', 1);
        const cooked = this.cookFromStock();
        if (cooked) made.push(`${npc.name}: ${cooked}`);
      } else if (job.id === 'guard') {
        this.worldState?.record?.('base_patrol', { npc:npc.name, day });
      }
    }
    if (made.length) this.worldState?.record?.('base_production', { day, made });
    return made;
  }

  // Rega todos os canteiros e colhe os maduros direto para o estoque.
  tendGarden(npc) {
    const result = { watered:0, harvested:[] };
    if (!this.farming) return result;
    for (const raw of this.farming.plots()) {
      const plot = this.farming.prepare(raw);
      if (plot.water < 70) { this.farming.waterPlot(plot, 60); result.watered++; }
      const picked = this.farming.harvestInto(plot, (id, qty) => this.addStock(id, qty));
      if (picked) result.harvested.push(`${picked.qty} ${ITEM_DEFS[picked.crop.item]?.name || picked.crop.name}`);
    }
    return result;
  }

  // A cozinha só vale a pena se transformar o que a horta e a caça trouxeram
  // em refeição de verdade. Uma panela por dia, sem inventar economia nova.
  cookFromStock() {
    if (!this.has('kitchen_station') && !this.has('stove')) return null;
    const take = (id, qty) => {
      const have = this.stock.get(id) || 0;
      if (have < qty) return false;
      const left = have - qty;
      if (left > 0) this.stock.set(id, left); else this.stock.delete(id);
      return true;
    };
    const menu = [
      { out:'meat_stew', qty:2, cost:{ raw_meat:2, potato:1, beans:1 }, label:'ensopado para a base' },
      { out:'vegetable_soup', qty:2, cost:{ potato:1, tomato:1, corn:1 }, label:'sopa de legumes' },
      { out:'cooked_meat', qty:2, cost:{ raw_meat:2 }, label:'carne assada' },
      { out:'baked_potato', qty:2, cost:{ potato:2 }, label:'batatas assadas' }
    ];
    for (const dish of menu) {
      if (!Object.entries(dish.cost).every(([id, qty]) => (this.stock.get(id) || 0) >= qty)) continue;
      for (const [id, qty] of Object.entries(dish.cost)) take(id, qty);
      this.addStock(dish.out, dish.qty);
      return dish.label;
    }
    return null;
  }

  structureByTypes(types) {
    const list = this.structures.structures.filter(s => types.includes(s.type));
    if (!list.length) return null;
    return list[Math.floor(this.rand(this.signalCounter * 197 + list.length * 13) * list.length) % list.length];
  }

  makeSignal(day) {
    const templates = [
      { kind:'medical', title:'Pedido médico interrompido', types:['hospital','clinic','pharmacy'], text:'Uma transmissão curta cita caixas médicas ainda não recolhidas. O sinal vem de uma área de saúde.', reward:{ bandage:2, medicine:1 } },
      { kind:'mechanic', title:'Peças deixadas para trás', types:['workshop','warehouse','railyard'], text:'Um operador da Westline menciona um lote de peças que não chegou a ser retirado.', reward:{ scrap_metal:3, engine_parts:1 } },
      { kind:'food', title:'Reserva civil', types:['market','farm','diner','gas_station'], text:'Um canal civil repete coordenadas aproximadas de suprimentos de comida e água.', reward:{ canned_food:2, water_bottle:2 } },
      { kind:'power', title:'Pulso de energia', types:['substation','maintenance','metro'], text:'O rádio capta um pulso elétrico periódico. Pode haver componentes úteis perto da origem.', reward:{ wire:3, circuit_parts:1, battery:1 } },
      { kind:'security', title:'Canal de serviço público', types:['police','firestation','ranger'], text:'Uma mensagem automática de serviço continua ativa. Equipamento profissional pode ter ficado para trás.', reward:{ county_scrip:8, bandage:1 } }
    ];
    const t = templates[Math.floor(this.rand(day * 71 + this.signalCounter * 101) * templates.length) % templates.length];
    const s = this.structureByTypes(t.types);
    if (!s) return null;
    const tx = Math.round((s.x + s.endX) * .5);
    const ty = s.underground ? Math.round(((s.y1 ?? s.groundY - 8) + (s.y2 ?? s.groundY + 2)) * .5) : Math.max(3, (s.groundY || 20) - 3);
    const id = `base-${day}-${this.signalCounter++}`;
    return {
      id, kind:t.kind, title:t.title, text:t.text,
      freq:`${88 + (Math.floor(this.rand(day * 97 + this.signalCounter) * 230) / 10).toFixed(1)}`,
      targetName:s.name, targetType:s.type, tileX:tx, tileY:ty,
      createdDay:day, expiresDay:day + 2, heard:false, resolved:false, reward:{...t.reward}
    };
  }

  maybeGenerateSignal(day) {
    if (!this.has('radio_station') || day === this.lastSignalDay) return null;
    this.lastSignalDay = day;
    this.signals = this.signals.filter(s => !s.resolved && day <= s.expiresDay);
    if (this.signals.length >= 2) return null;
    const signal = this.makeSignal(day);
    if (!signal) return null;
    this.signals.push(signal);
    this.worldState?.record?.('radio_signal', { id:signal.id, title:signal.title, target:signal.targetName, day });
    return signal;
  }

  radioEntries() {
    return this.signals.filter(s => !s.resolved).map(s => ({
      id:s.id, freq:s.freq, name:`Base · ${s.title}`,
      text:`${s.text} Região aproximada registrada no mapa. Sinal válido até o dia ${s.expiresDay}.`,
      baseSignal:true, heard:s.heard
    }));
  }

  hearSignal(id) {
    const s = this.signals.find(v => v.id === id);
    if (!s) return null;
    s.heard = true;
    this.worldState?.record?.('radio_signal_heard', { id:s.id, target:s.targetName });
    return s;
  }

  activeMapSignals() { return this.signals.filter(s => s.heard && !s.resolved); }

  resolveNearby(player) {
    const structure = this.worldState?.currentStructure;
    if (!structure) return null;
    const day = Math.floor(this.getWorldMinutes() / 1440) + 1;
    const signal = this.signals.find(s => s.heard && !s.resolved && day <= s.expiresDay && s.targetName === structure.name);
    if (!signal) return null;
    signal.resolved = true;
    for (const [id, qty] of Object.entries(signal.reward || {})) this.addStock(id, qty);
    this.worldState?.record?.('radio_signal_resolved', { id:signal.id, target:signal.targetName, reward:signal.reward });
    return signal;
  }

  update(dt, player) {
    const minutes = this.getWorldMinutes();
    const day = Math.floor(minutes / 1440) + 1;
    const guards = this.residents().filter(n => this.jobFor(n).id === 'guard').length;
    const a = this.anchor();
    if (guards && a) {
      const region = this.structures.world?.region?.(Math.max(0, Math.min(CONFIG.WORLD_W - 1, Math.floor(a.x / CONFIG.TILE))));
      const row = region ? this.worldState?.regionNoise?.get(region.id) : null;
      if (row) row.value = Math.max(0, row.value - dt * .045 * guards);
    }
    const made = this.dailyProduction(day);
    if (made.length) this.onNotice?.(`A base produziu novos suprimentos`, 'good');
    const signal = this.maybeGenerateSignal(day);
    if (signal) this.onNotice?.(`Novo sinal no rádio da base: ${signal.title}`, 'warn');
    const resolved = this.resolveNearby(player);
    if (resolved) this.onNotice?.(`Sinal concluído: ${resolved.title} · recompensa enviada para a base`, 'good');
    this.signals = this.signals.filter(s => s.resolved || day <= s.expiresDay);
  }

  exportState() {
    return {
      version:1,
      stock:[...this.stock.entries()],
      signals:this.signals.map(s => ({...s, reward:{...(s.reward || {})}})),
      lastProductionDay:this.lastProductionDay,
      lastSignalDay:this.lastSignalDay,
      signalCounter:this.signalCounter
    };
  }

  importState(data) {
    if (!data || data.version !== 1) return false;
    this.stock = new Map(data.stock || []);
    this.signals = (data.signals || []).map(s => ({...s, reward:{...(s.reward || {})}}));
    this.lastProductionDay = data.lastProductionDay || 0;
    this.lastSignalDay = Number.isFinite(data.lastSignalDay) ? data.lastSignalDay : -1;
    this.signalCounter = data.signalCounter || 1;
    return true;
  }
}
