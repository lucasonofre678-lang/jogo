const SOCIETY_FACTIONS = {
  harlow: { name: "Fazenda Harlow", tone: "#7f8d61" },
  clinic: { name: "Clínica Livre", tone: "#78969a" },
  westline: { name: "Westline Crew", tone: "#8b745e" },
  traders: { name: "Mercadores da 17", tone: "#a38655" }
};

class SocietySystem {
  constructor(world, structures, inventory, danger, seed, building = null) {
    this.world = world;
    this.structures = structures;
    this.inventory = inventory;
    this.danger = danger;
    this.building = building;
    this.seed = seed >>> 0;
    this.known = new Set();
    this.factionRep = { harlow: 0, clinic: 0, westline: 0, traders: 0 };
    this.npcs = [];
    this.activeCompanionId = null;
    this.companionMode = 'follow';
    this.holdPoint = null;
    this.baseCamp = null;
    this.generate();
  }

  rand(n) {
    let x = (n + this.seed * 29) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  structure(type) {
    return this.structures.structures.find(s => s.type === type) || null;
  }

  groundYAt(tileX, hintY) {
    return this.world.groundY(tileX, hintY);
  }

  makeNPC(def, structureType, offset = 4) {
    const s = this.structure(structureType);
    let tileX = s ? Math.min(s.endX - 2, s.x + offset) : 60 + this.npcs.length * 25;
    let groundY = this.groundYAt(tileX);
    // nudge to a column with standing room so nobody starts inside a wall
    for (let step = 1; step <= 8 && !this.world.hasHeadroom(tileX, groundY, 3); step++) {
      tileX += 1;
      groundY = this.groundYAt(tileX);
    }

    return {
      id: def.id,
      name: def.name,
      profession: def.profession,
      faction: def.faction,
      personality: def.personality,
      traits: [...(def.traits || [])],
      morale: Number.isFinite(def.morale) ? def.morale : 60,
      daysInBase: 0,
      memories: [],
      color: def.color,
      x: tileX * CONFIG.TILE + 4,
      y: groundY * CONFIG.TILE - 52,
      w: 24,
      h: 52,
      homeX: tileX * CONFIG.TILE + 4,
      relation: def.relation || 0,
      recruitable: Boolean(def.recruitable),
      recruited: false,
      baseResident: false,
      baseJob: def.baseJob || null,
      basePhase: this.rand(def.id.length * 181) * Math.PI * 2,
      followCooldown: 0,
      supportCooldown: 0,
      animTime: this.rand(def.id.length * 113) * 5,
      actionTimer: 0,
      dialogue: def.dialogue,
      quest: {
        ...def.quest,
        status: "available",
        killBaseline: 0
      },
      trade: def.trade.map(t => ({ ...t })),
      sellBonus: def.sellBonus || 1
    };
  }

  generate() {
    this.npcs = [
      this.makeNPC({
        id: "mara",
        name: "Mara Harlow",
        profession: "Agricultora",
        faction: "harlow",
        personality: "Prática, protetora e desconfiada de promessas.",
        traits: ['PROVEDORA','OTIMISTA'], morale: 68,
        color: "#7f8a61",
        relation: 16,
        recruitable: true,
        dialogue: [
          "A estrada parece tranquila até você precisar atravessá-la carregando comida.",
          "Minha família cultivava este lugar antes do Apagão. Agora eu cultivo tempo.",
          "Se vai ficar por aqui, prove que sabe construir algo que dure."
        ],
        quest: {
          id: "farm_repair",
          title: "Cercas antes do inverno",
          description: "Mara precisa reforçar os limites da fazenda antes que mais infectados atravessem.",
          type: "items",
          requirements: { wood: 6, nails: 4 },
          reward: { county_scrip: 18, canned_food: 2 },
          relationReward: 42,
          factionReward: 18
        },
        trade: [
          { id: "canned_food", price: 6, stock: 4 },
          { id: "water_bottle", price: 5, stock: 3 },
          { id: "berries", price: 2, stock: 8 },
          { id: "wool_hat", price: 12, stock: 1 }
        ],
        sellBonus: 1.05
      }, "farm", 7),

      this.makeNPC({
        id: "lena",
        name: "Dra. Lena Ortiz",
        profession: "Médica",
        faction: "clinic",
        personality: "Calma, objetiva e incapaz de ignorar alguém ferido.",
        traits: ['MÉDICA DE CAMPO','CALMA'], morale: 72,
        color: "#6d9297",
        relation: 20,
        recruitable: true,
        dialogue: [
          "Se está respirando, já temos alguma coisa para trabalhar.",
          "A clínica ainda tem paredes. O problema é o que não temos dentro delas.",
          "Tecido limpo e água valem mais do que discursos por aqui."
        ],
        quest: {
          id: "clinic_supplies",
          title: "Prateleiras vazias",
          description: "Lena precisa de materiais básicos para manter a clínica funcionando.",
          type: "items",
          requirements: { cloth: 4, water_bottle: 2 },
          reward: { county_scrip: 22, bandage: 3, medicine: 1 },
          relationReward: 38,
          factionReward: 20
        },
        trade: [
          { id: "bandage", price: 5, stock: 5 },
          { id: "disinfectant", price: 9, stock: 2 },
          { id: "medicine", price: 15, stock: 2 }
        ],
        sellBonus: .9
      }, "clinic", 7),

      this.makeNPC({
        id: "eli",
        name: "Eli Mercer",
        profession: "Mecânico",
        faction: "westline",
        personality: "Sarcástico, engenhoso e muito apegado à oficina.",
        traits: ['MECÂNICO NATO','TEIMOSO'], morale: 60,
        color: "#8a715a",
        relation: 12,
        recruitable: true,
        dialogue: [
          "Se uma máquina ainda faz barulho, provavelmente ainda dá para consertar.",
          "Se não faz barulho, bata nela. Estatisticamente melhora minhas chances.",
          "Preciso de uma bateria decente e metal que não desmanche na mão."
        ],
        quest: {
          id: "workshop_power",
          title: "Uma faísca basta",
          description: "Eli quer testar o circuito auxiliar da oficina.",
          type: "items",
          requirements: { battery: 1, scrap_metal: 4 },
          reward: { county_scrip: 24, flashlight: 1 },
          relationReward: 44,
          factionReward: 20
        },
        trade: [
          { id: "nails", price: 1, stock: 20 },
          { id: "scrap_metal", price: 4, stock: 5 },
          { id: "battery", price: 10, stock: 2 },
          { id: "crowbar", price: 22, stock: 1 }
        ],
        sellBonus: 1
      }, "workshop", 7),

      this.makeNPC({
        id: "jonah",
        name: "Jonah Pike",
        profession: "Comerciante",
        faction: "traders",
        personality: "Falante, oportunista e surpreendentemente bem informado.",
        traits: ['NEGOCIADOR','BEM INFORMADO'], morale: 64,
        color: "#a48656",
        relation: 8,
        recruitable: false,
        dialogue: [
          "Você tem cara de quem ainda acha que preço é uma coisa fixa.",
          "A estrada me paga em informação. Você pode me pagar em fichas.",
          "Três daqueles mortos estão rondando demais o mercado. Resolva isso e conversamos."
        ],
        quest: {
          id: "clear_market",
          title: "Clientela indesejada",
          description: "Elimine três infectados depois de aceitar o trabalho.",
          type: "kills",
          kills: 3,
          reward: { county_scrip: 32, water_bottle: 2, snack_bar: 2 },
          relationReward: 30,
          factionReward: 22
        },
        trade: [
          { id: "canned_food", price: 7, stock: 5 },
          { id: "soda", price: 4, stock: 4 },
          { id: "battery", price: 11, stock: 2 },
          { id: "rain_jacket", price: 26, stock: 1 }
        ],
        sellBonus: 1.18
      }, "market", 8)
    ];
  }

  get(id) {
    return this.npcs.find(n => n.id === id) || null;
  }

  factionName(id) {
    return SOCIETY_FACTIONS[id]?.name || id;
  }

  relationLabel(value) {
    if (value >= 70) return "CONFIANÇA ALTA";
    if (value >= 45) return "CONFIÁVEL";
    if (value >= 20) return "NEUTRO";
    if (value >= 0) return "DESCONFIADO";
    return "HOSTIL";
  }

  discover(npc) {
    if (npc) this.known.add(npc.id);
  }

  nearestNPC(player, reachTiles = 3) {
    const pc = player.center();
    let best = null;
    let bestDist = reachTiles * CONFIG.TILE;

    for (const npc of this.npcs) {
      if (npc.recruited && npc.id === this.activeCompanionId) continue;
      const d = Math.hypot(npc.x + npc.w/2 - pc.x, npc.y + npc.h/2 - pc.y);
      if (d < bestDist) {
        best = npc;
        bestDist = d;
      }
    }
    return best;
  }

  questProgress(npc) {
    const q = npc.quest;
    if (!q) return { current:0, target:0, complete:false, text:"" };

    if (q.type === "kills") {
      const current = q.status === "active" ? Math.max(0, this.danger.kills - q.killBaseline) : 0;
      return {
        current,
        target: q.kills,
        complete: current >= q.kills,
        text: `${Math.min(current,q.kills)}/${q.kills} infectados`
      };
    }

    const rows = Object.entries(q.requirements || {});
    const complete = rows.every(([id,qty]) => this.inventory.count(id) >= qty);
    return {
      current: rows.reduce((sum,[id,qty]) => sum + Math.min(this.inventory.count(id),qty),0),
      target: rows.reduce((sum,[id,qty]) => sum+qty,0),
      complete,
      text: rows.map(([id,qty]) => `${ITEM_DEFS[id]?.name || id} ${Math.min(this.inventory.count(id),qty)}/${qty}`).join(" · ")
    };
  }

  acceptQuest(npc) {
    if (!npc?.quest || npc.quest.status !== "available") return {ok:false, reason:"Trabalho indisponível"};
    npc.quest.status = "active";
    if (npc.quest.type === "kills") npc.quest.killBaseline = this.danger.kills;
    npc.relation += 2;
    this.discover(npc);
    return {ok:true};
  }

  completeQuest(npc) {
    if (!npc?.quest || npc.quest.status !== "active") return {ok:false, reason:"Nenhuma missão ativa"};
    const progress = this.questProgress(npc);
    if (!progress.complete) return {ok:false, reason:"Objetivo ainda incompleto"};

    if (npc.quest.type === "items") {
      for (const [id,qty] of Object.entries(npc.quest.requirements)) {
        this.inventory.remove(id, qty);
      }
    }

    for (const [id,qty] of Object.entries(npc.quest.reward || {})) {
      this.inventory.add(id, qty);
    }

    npc.quest.status = "completed";
    npc.relation = Math.min(100, npc.relation + npc.quest.relationReward);
    this.factionRep[npc.faction] = Math.min(100, (this.factionRep[npc.faction] || 0) + npc.quest.factionReward);
    return {ok:true};
  }

  baseAnchor() {
    if (!this.building?.objects?.length) return null;
    const priority = ['bed_build','workbench','large_locker','storage_locker','campfire'];
    for (const type of priority) {
      const o = this.building.objects.find(v => v.type === type && v.health > 0);
      if (o) return { x:(o.tileX + o.width*.5) * CONFIG.TILE, y:o.tileY * CONFIG.TILE, type };
    }
    return null;
  }

  baseResidents() {
    return this.npcs.filter(n => n.recruited && n.id !== this.activeCompanionId && n.baseResident);
  }

  activateCompanion(npc) {
    if (!npc?.recruited) return {ok:false, reason:'Essa pessoa ainda não faz parte do grupo'};
    const old = this.activeCompanionId ? this.get(this.activeCompanionId) : null;
    if (old && old.id !== npc.id) old.baseResident = true;
    npc.baseResident = false;
    this.activeCompanionId = npc.id;
    this.companionMode = 'follow';
    this.holdPoint = null;
    return {ok:true};
  }

  setCompanionMode(mode) {
    const npc = this.activeCompanionId ? this.get(this.activeCompanionId) : null;
    if (!npc?.recruited) return {ok:false, reason:'Nenhum companheiro ativo'};
    if (!['follow','hold','avoid'].includes(mode)) return {ok:false, reason:'Ordem inválida'};
    this.companionMode = mode;
    if (mode === 'hold') this.holdPoint = { x:npc.x, y:npc.y };
    else this.holdPoint = null;
    return {ok:true, mode};
  }

  sendToBase(npc) {
    if (!npc?.recruited) return {ok:false, reason:'Essa pessoa não faz parte do grupo'};
    npc.baseResident = true;
    if (this.activeCompanionId === npc.id) { this.activeCompanionId = null; this.companionMode = 'follow'; this.holdPoint = null; }
    return {ok:true};
  }

  canRecruit(npc) {
    return npc?.recruitable && npc.quest.status === "completed" && npc.relation >= 50;
  }

  recruit(npc) {
    if (!this.canRecruit(npc)) return {ok:false, reason:"Ainda não há confiança suficiente"};
    npc.recruited = true;
    npc.baseResident = false;
    return this.activateCompanion(npc);
  }

  dismiss(npc) {
    return this.sendToBase(npc).ok;
  }

  scrip() {
    return this.inventory.count("county_scrip");
  }

  buy(npc, itemId) {
    const offer = npc?.trade.find(t => t.id === itemId);
    if (!offer || offer.stock <= 0) return {ok:false, reason:"Sem estoque"};
    if (this.scrip() < offer.price) return {ok:false, reason:"Fichas insuficientes"};
    if (!this.inventory.canAdd(itemId, 1)) return {ok:false, reason:"Peso demais"};

    this.inventory.remove("county_scrip", offer.price);
    this.inventory.add(itemId, 1);
    offer.stock -= 1;
    npc.relation = Math.min(100, npc.relation + .5);
    return {ok:true};
  }

  sellPrice(npc, itemId) {
    const def = ITEM_DEFS[itemId];
    if (!def || itemId === "county_scrip") return 0;
    const base = {
      material: 1,
      component: 4,
      food: 2,
      drink: 2,
      medical: 5,
      tool: 8,
      clothing: 8,
      light: 9,
      container: 1
    }[def.category] || 1;

    return Math.max(1, Math.floor(base * (npc?.sellBonus || 1)));
  }

  sell(npc, itemId) {
    if (!npc || this.inventory.count(itemId) <= 0) return {ok:false, reason:"Você não possui esse item"};
    const price = this.sellPrice(npc, itemId);
    if (price <= 0) return {ok:false, reason:"Esse item não interessa"};
    this.inventory.remove(itemId, 1);
    this.inventory.add("county_scrip", price);
    npc.relation = Math.min(100, npc.relation + .2);
    return {ok:true, price};
  }

  dialogueFor(npc) {
    if (!npc) return "";
    const mood = (npc.morale ?? 60) < 35 ? ' Parece exausto e fala pouco.' : (npc.morale ?? 60) > 78 ? ' Hoje parece mais confiante.' : '';
    if (npc.quest.status === "completed") {
      if (npc.recruited) return `${npc.name} faz parte do grupo. ${npc.personality}${mood}`;
      if (this.canRecruit(npc)) return "Você cumpriu sua palavra. Isso ainda significa alguma coisa por aqui.";
      return `Trabalho entregue. Se precisar negociar, minhas coisas continuam aqui.${mood}`;
    }
    if (npc.quest.status === "active") {
      const p = this.questProgress(npc);
      return p.complete ? `Você conseguiu tudo. Vamos terminar esse acordo.${mood}` : `Ainda falta trabalho. ${p.text}.${mood}`;
    }
    return `${npc.dialogue[Math.min(npc.dialogue.length - 1, Math.floor(npc.relation / 24) % npc.dialogue.length)]}${mood}`;
  }

  update(dt, player) {
    // Recruited survivors that are not travelling stay around the first real
    // player-built home anchor. They idle between bed/workbench/storage instead
    // of vanishing back into the world, so returning from an expedition feels
    // like returning to a settlement.
    const anchor = this.baseAnchor();
    if (anchor) {
      let idx = 0;
      for (const npc of this.baseResidents()) {
        npc.animTime += dt * 1.8;
        npc.basePhase += dt * (.22 + idx * .03);
        const jobTarget = this.baseCamp?.targetFor?.(npc);
        npc.baseJob = jobTarget?.label || this.baseCamp?.jobFor?.(npc)?.label || 'Na base';
        const idleX = anchor.x + Math.sin(npc.basePhase + idx * 2.2) * (48 + idx * 18);
        const targetX = jobTarget?.x ?? idleX;
        const dx = targetX - npc.x;
        if (Math.abs(dx) > 5) npc.x += Math.sign(dx) * Math.min(1.15, Math.abs(dx) * .025);
        const tx = Math.max(1, Math.min(CONFIG.WORLD_W - 2, Math.floor((npc.x + npc.w/2) / CONFIG.TILE)));
        const hint = Math.floor((npc.y + npc.h) / CONFIG.TILE);
        const gy = this.groundYAt(tx, hint);
        npc.y += Math.max(-7, Math.min(7, gy * CONFIG.TILE - npc.h - npc.y));
        idx++;
      }
    }

    const companion = this.activeCompanionId ? this.get(this.activeCompanionId) : null;
    if (!companion || !companion.recruited) return;

    if (companion.followCooldown > 0) companion.followCooldown -= dt;
    if (companion.supportCooldown > 0) companion.supportCooldown -= dt;
    if (companion.actionTimer > 0) companion.actionTimer = Math.max(0, companion.actionTimer - dt);

    const targetX = this.companionMode === 'hold' && this.holdPoint ? this.holdPoint.x : player.x - player.facing * 48;
    companion.animTime += dt * (Math.abs(targetX - companion.x) > 38 ? 6 : 2.4);
    const dx = targetX - companion.x;
    const dist = Math.abs(dx);

    if (dist > 520 && this.companionMode !== 'hold') {
      companion.x = targetX;
    } else if (dist > 38) {
      companion.x += Math.sign(dx) * Math.min(2.1, dist * .04);
    }

    // follow the ground under the companion, using its current height as a
    // hint so it walks into buildings instead of snapping onto the roof
    const tx = Math.floor((companion.x + companion.w / 2) / CONFIG.TILE);
    const hint = Math.floor((companion.y + companion.h) / CONFIG.TILE);
    const targetY = this.companionMode === 'hold' && this.holdPoint ? this.holdPoint.y : this.groundYAt(tx, hint) * CONFIG.TILE - companion.h;
    companion.y += Math.max(-10, Math.min(10, targetY - companion.y));

    if (companion.supportCooldown <= 0 && this.companionMode !== 'avoid' && this.companionMode !== 'hold') {
      let target = null;
      let best = 90;
      for (const enemy of this.danger.enemies) {
        if (!enemy.alive) continue;
        const d = Math.hypot(enemy.x + enemy.w/2 - (companion.x + companion.w/2), enemy.y + enemy.h/2 - (companion.y + companion.h/2));
        if (d < best) { best = d; target = enemy; }
      }
      if (target) {
        target.hp -= 16;
        target.hurtTimer = .16;
        target.state = "chase";
        target.targetX = player.x;
        if (target.hp <= 0) {
          target.alive = false;
          this.danger.kills += 1;
        }
        this.danger.emitNoise(companion.x, companion.y, 105, "aliado");
        companion.supportCooldown = 1.15;
        companion.actionTimer = .28;
      }
    }
  }

  exportState() {
    return {
      version:1,
      known:[...this.known],
      factionRep:{...this.factionRep},
      activeCompanionId:this.activeCompanionId,
      companionMode:this.companionMode,
      holdPoint:this.holdPoint ? {...this.holdPoint} : null,
      npcs:this.npcs.map(n => ({
        id:n.id, relation:n.relation, recruited:Boolean(n.recruited), baseResident:Boolean(n.baseResident),
        baseJob:n.baseJob || null, x:n.x, y:n.y, morale:n.morale ?? 60, daysInBase:n.daysInBase || 0,
        traits:[...(n.traits || [])], memories:(n.memories || []).slice(-8),
        quest:n.quest ? { status:n.quest.status, killBaseline:n.quest.killBaseline || 0 } : null,
        trade:(n.trade || []).map(t => ({ id:t.id, stock:t.stock }))
      }))
    };
  }

  importState(data) {
    if (!data || data.version !== 1) return false;
    this.known = new Set(data.known || []);
    this.factionRep = { ...this.factionRep, ...(data.factionRep || {}) };
    this.activeCompanionId = data.activeCompanionId || null;
    this.companionMode = data.companionMode || 'follow';
    this.holdPoint = data.holdPoint ? {...data.holdPoint} : null;
    const byId = new Map(this.npcs.map(n => [n.id, n]));
    for (const row of data.npcs || []) {
      const n = byId.get(row.id); if (!n) continue;
      n.relation = Number.isFinite(row.relation) ? row.relation : n.relation;
      n.recruited = Boolean(row.recruited);
      n.baseResident = Boolean(row.baseResident);
      n.baseJob = row.baseJob || n.baseJob || null;
      if (Number.isFinite(row.morale)) n.morale = row.morale;
      if (Number.isFinite(row.daysInBase)) n.daysInBase = row.daysInBase;
      if (Array.isArray(row.traits) && row.traits.length) n.traits = [...row.traits];
      n.memories = Array.isArray(row.memories) ? row.memories.slice(-8) : [];
      if (Number.isFinite(row.x)) n.x = row.x;
      if (Number.isFinite(row.y)) n.y = row.y;
      if (row.quest && n.quest) { n.quest.status = row.quest.status || n.quest.status; n.quest.killBaseline = row.quest.killBaseline || 0; }
      for (const t of row.trade || []) { const cur = n.trade.find(v => v.id === t.id); if (cur) cur.stock = t.stock; }
    }
    if (this.activeCompanionId && !this.get(this.activeCompanionId)?.recruited) this.activeCompanionId = null;
    return true;
  }

  drawNPC(ctx, npc, cameraX, cameraY) {
    const x = Math.round(npc.x - cameraX), y = Math.round(npc.y - cameraY);
    if (x < -70 || x > ctx.canvas.width + 70) return;

    const moving = npc.recruited && this.activeCompanionId === npc.id && Math.abs(npc.x - npc.homeX) > 2;
    let frame = Math.floor((performance.now() * .003 + npc.x * .01)) % 2;
    if (npc.recruited) frame = 2 + (Math.floor(npc.animTime) % 4);
    if (npc.actionTimer > 0) frame = 7;

    const spr = ASSETS.ready(`sprite:npc:${npc.id}`);

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 52, 10, 4, 0, 0, Math.PI*2);
    ctx.fill();

    if (spr) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(spr, frame * 32, 0, 32, 56, x - 4, y - 3, 32, 56);
    } else {
      ctx.fillStyle=npc.color; ctx.fillRect(x+3,y+17,18,18);
      ctx.fillStyle="#c99a72"; ctx.fillRect(x+6,y+5,14,13);
    }

    if (npc.recruited) {
      ctx.fillStyle = npc.id === this.activeCompanionId ? "#a6bd86" : "#c3aa72";
      ctx.fillRect(x+8,y-8,8,4);
    }
    ctx.restore();

    if (this.known.has(npc.id) || Math.abs(x - ctx.canvas.width / 2) < 220) {
      const role = npc.baseResident && npc.baseJob ? npc.baseJob : npc.profession;
      const label = `${npc.name.split(" ")[0].toUpperCase()} · ${String(role).toUpperCase()}`;
      ctx.save();
      ctx.font = '600 9px "Courier New", monospace';
      ctx.textAlign = "center";
      const w = ctx.measureText(label).width + 14;
      ctx.fillStyle = "rgba(12,14,15,.68)";
      ctx.fillRect(x + 12 - w / 2, y - 24, w, 14);
      ctx.fillStyle = npc.color;
      ctx.fillRect(x + 12 - w / 2, y - 24, 2, 14);
      ctx.fillStyle = "#d8d0bd";
      ctx.fillText(label, x + 12, y - 14);
      ctx.restore();
    }
  }

  draw(ctx, cameraX, cameraY) {
    for (const npc of this.npcs) this.drawNPC(ctx, npc, cameraX, cameraY);
  }

  knownNPCs() {
    return this.npcs.filter(n => this.known.has(n.id));
  }
}
