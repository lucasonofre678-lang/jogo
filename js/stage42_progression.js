// Stage 42 — Progression & Crafting 2.0
// One readable spine: machado → bancada → metal → oficina/energia → armamento
// → expedições → Blackridge. Tiers now follow what the survivor *did* (built,
// learned, restored) instead of what they happened to see once. Recipes come
// in three kinds: known from the start, learned by use (Stage 31 skills) and
// projects found in the world. Firearms are restored, never built from scrap.

/* ------------------------------------------------------------ the ladder */

Object.assign(PROGRESSION_TIERS[0], { name:'SOBREVIVENTE', description:'Madeira, pedra e as próprias mãos.', hint:'Fabrique um machado improvisado e acenda uma fogueira.' });
Object.assign(PROGRESSION_TIERS[1], { name:'ABRIGO', description:'Uma bancada simples e um lugar seguro para dormir.', hint:'Construa uma bancada simples no seu abrigo.' });
Object.assign(PROGRESSION_TIERS[2], { name:'METAL', description:'Sucata trabalhada, aço e ferramentas confiáveis.', hint:'Encontre o Manual de ferramentas metálicas — ou funda ferro numa fornalha.' });
Object.assign(PROGRESSION_TIERS[3], { name:'OFICINA & ENERGIA', description:'Gerador, rede, água e uma base permanente.', hint:'Recupere o Projeto de energia da base.' });
Object.assign(PROGRESSION_TIERS[4], { name:'ARMAMENTO', description:'Bancada de armamento e restauração de armas.', hint:'Recupere o Manual do armeiro e ligue uma bancada de armamento.' });
Object.assign(PROGRESSION_TIERS[5], { name:'BLACKRIDGE', description:'Protótipos e tecnologia de contenção.', hint:'Recupere o Protocolo técnico BR-7.' });

const S42_SKILL_NAMES = { mining:'Mineração', mechanics:'Mecânica', construction:'Construção', medicine:'Medicina', stealth:'Furtividade', scavenging:'Coleta' };

// Projects: where they can be found and what they open. Several places carry
// a copy until one is learned; the others then quietly disappear.
const S42_BLUEPRINTS = {
  bp_metal_tools:{ tier:2, short:'MANUAL DE FERRAMENTAS', opens:'machadinha, facão, picareta de aço, marreta e estruturas de metal',
    sources:[{ name:'Oficina Westline' }, { type:'gas_station' }, { name:'Fazenda Harlow' }] },
  bp_power:{ tier:3, short:'PROJETO DE ENERGIA', opens:'gerador, rede, baterias, bomba, geladeira, estufa e oficina automotiva',
    sources:[{ type:'substation' }, { name:'Armazém Westline' }, { container:'Despensa de emergência' }] },
  bp_armory:{ tier:4, short:'MANUAL DO ARMEIRO', opens:'bancada de armamento, peças e restauração de armas',
    sources:[{ type:'police' }, { container:'Armário do xerife' }, { type:'firestation' }] },
  bp_blackridge:{ tier:5, short:'PROTOCOLO BR-7', opens:'protótipos Blackridge e extrator de contenção',
    sources:[{ container:'Cofre BR-7' }, { container:'Estoque do setor B' }] }
};
const S42_TIER_BLUEPRINT = { 2:'bp_metal_tools', 3:'bp_power', 4:'bp_armory', 5:'bp_blackridge' };

/* -------------------------------------------------------------- recipes */

{
  const byId = id => CRAFT_RECIPES.find(r => r.id === id);
  const set = (id, patch) => { const r = byId(id); if (r) Object.assign(r, patch); return r; };
  // Tier 0: the first tools are made by hand from what is lying around.
  set('stone_axe', { cost:{ wood:3, stone:3 }, bench:false, tier:0, description:'Pedra amarrada num cabo. Corta madeira e defende. Não precisa de bancada.' });
  set('stone_pickaxe', { cost:{ wood:2, stone:4 }, bench:false, tier:0, description:'Pedra lascada num cabo. Quebra pedra e os primeiros veios.' });
  set('nails_batch', { bench:false, tier:0 });
  set('daypack', { cost:{ cloth:5 }, bench:false, tier:0, description:'Saco de pano costurado à mão. +6 kg de capacidade.' });
  set('knife', { tier:0 });
  set('repair_hammer', { tier:1, bench:true });
  set('crowbar', { tier:1 });
  // Tier 2 metal work: the manual — or practice — opens it.
  set('hatchet', { tier:2, learn:{ skill:'construction', level:2 } });
  set('machete', { tier:2 });
  set('steel_pickaxe', { tier:2, learn:{ skill:'mining', level:2 } });
  set('sledgehammer', { tier:2, learn:{ skill:'construction', level:3 } });
  set('wrecking_bar', { tier:2, learn:{ skill:'scavenging', level:3 } });
  set('steel_spear', { tier:2 });
  set('maintenance_kit', { tier:2, cost:{ scrap_metal:2, cloth:2, wire:1 }, learn:{ skill:'mechanics', level:2 },
    description:'Óleo, panos e ferramentas finas. Mantém armas e ferramentas em condição.' });
  set('industrial_pickaxe', { tier:3 });
  // Armament: components and restorations happen at the weapon bench.
  for (const id of ['weapon_parts', 'spring_parts', 'handling_module', 'optic_module', 'stability_module'])
    set(id, { tier:4, bench:false, weaponBench:true, category:'ARMAS' });
  set('weapon_parts', { cost:{ scrap_metal:4, wire:1, nails:2 } });
  set('containment_cutter', { tier:5 });
  // Firearms are no longer assembled from common scrap.
  for (const id of ['civilian_carbine', 'compact_carbine', 'security_pistol']) {
    const i = CRAFT_RECIPES.findIndex(r => r.id === id);
    if (i >= 0) CRAFT_RECIPES.splice(i, 1);
  }
  const restore = (out, tier, cost, description) => CRAFT_RECIPES.push({
    id:`restore_${out}`, name:`Restaurar ${ITEM_DEFS[out]?.name || out}`, category:'ARMAS',
    output:{ id:out, qty:1 }, cost, tier, weaponBench:true, restore:true, description
  });
  const frame = 'damaged_weapon_frame';
  restore('pistol', 4, { [frame]:1, weapon_parts:2, maintenance_kit:1 }, 'Estrutura recuperada, mola nova, limpeza completa.');
  restore('revolver', 4, { [frame]:1, weapon_parts:2, spring_parts:1 }, 'Tambor e mecanismo ajustados a partir de uma estrutura danificada.');
  restore('shotgun', 4, { [frame]:1, weapon_parts:3, spring_parts:1, wood:2 }, 'Coronha nova e mecanismo recuperado.');
  restore('civilian_carbine', 4, { [frame]:1, weapon_parts:4, spring_parts:2, maintenance_kit:1 }, 'Carabina civil reconstruída sobre uma estrutura danificada.');
  restore('compact_carbine', 4, { [frame]:1, weapon_parts:5, spring_parts:2, precision_parts:1 }, 'Precisa de componentes de precisão recuperados.');
  restore('patrol_shotgun', 4, { [frame]:1, weapon_parts:5, spring_parts:2, precision_parts:1, maintenance_kit:1 }, 'Equipamento profissional: peças de delegacia e arsenal.');
  restore('smg_compact', 4, { [frame]:1, weapon_parts:5, precision_parts:2, maintenance_kit:1 }, 'Equipamento profissional: exige componentes de precisão.');
  restore('security_pistol', 4, { [frame]:1, maintenance_kit:1, precision_parts:2 }, 'Pistola de segurança recuperada.');
  restore('police_carbine', 4, { [frame]:1, weapon_parts:6, precision_parts:2, stability_module:1 }, 'Carabina profissional. Estabilidade e precisão recuperadas.');
  restore('blackridge_smg', 5, { [frame]:1, weapon_parts:4, precision_parts:3, circuit_parts:2, power_controller:1 }, 'Protótipo Blackridge restaurado com o protocolo BR-7.');
  restore('blackridge_marksman', 5, { [frame]:1, weapon_parts:5, precision_parts:3, optic_module:1, power_controller:1 }, 'Protótipo de precisão Blackridge.');
}

// Build gating by tier (the project that unlocks it is the tier's blueprint).
const S42_BUILD_TIER = {};
{
  const put = (tier, ids) => { for (const id of ids) if (BUILD_DEFS[id]) S42_BUILD_TIER[id] = tier; };
  put(1, ['furnace', 'kitchen_station', 'medical_station', 'guard_post', 'roof_metal', 'shelf_build', 'table_build']);
  put(2, ['metal_wall', 'panel_wall', 'reinforced_wall', 'metal_floor', 'storage_locker', 'large_locker', 'chain_fence', 'garage_door',
    'stove', 'catwalk_section', 'scaffold_tower', 'ladder_section', 'rail_section', 'water_trough', 'wood_dryer']);
  put(3, ['generator', 'distribution_box', 'battery_bank', 'solar_array', 'floodlight', 'motion_floodlight', 'wall_lamp', 'icebox', 'cold_room',
    'electric_pump', 'water_reservoir', 'grow_light_station', 'radio_station', 'greenhouse_frame', 'reinforced_greenhouse', 'watermill',
    'auto_bench', 'reinforced_gate', 'vehicle_frame', 'perimeter_sensor', 'decoy_siren']);
  put(4, ['weapon_bench']);
}

/* --------------------------------------------------- where things come from */

const S42_TABLE_PLACES = {
  household:'casas', kitchen:'cozinhas', apartment:'apartamentos', garage:'garagens', gas:'postos', market:'mercado', pharmacy:'farmácia',
  medical:'clínica e hospital', police:'delegacia', firestation:'bombeiros', school:'escola', hotel:'motel', industrial:'armazéns e pátio',
  workshop:'oficinas', tools:'pedreira', camp:'acampamentos', farm:'fazendas', scraps:'destroços', mining:'mina', blackridge:'Blackridge',
  holdout:'abrigos', evidence:'evidências'
};
const S42_SOURCES = {
  wood:'árvores — até com as mãos', stone:'rochas e encostas — até com as mãos', cloth:'casas e roupas velhas', gravel:'pedra triturada',
  scrap_metal:'carros abandonados, garagens e oficinas', nails:'garagens · 1 sucata vira 6 pregos', brick:'paredes demolidas',
  concrete_chunk:'concreto quebrado', coal:'veios escuros na pedreira e cavernas', iron_ore:'veios na pedreira, cavernas e mina',
  copper_ore:'veios em cavernas e galerias', quartz:'cavernas profundas', nickel_ore:'mina profunda', crystal_shard:'mina profunda',
  iron_ingot:'fornalha + minério de ferro', copper_ingot:'fornalha + minério de cobre', steel_plate:'fornalha (lingote de ferro) · armazéns',
  damaged_weapon_frame:'delegacia, bombeiros e expedições', precision_parts:'arsenal, hospital e Blackridge',
  power_controller:'Blackridge e cofre BR-7', animal_hide:'caça', raw_meat:'caça', plant_fiber:'Vale Greenwater', treated_wood:'secador de madeira'
};

function s42Source(id) {
  if (S42_SOURCES[id]) return S42_SOURCES[id];
  const hits = [];
  for (const [table, rows] of Object.entries(typeof LOOT_TABLES !== 'undefined' ? LOOT_TABLES : {})) {
    const row = rows.find(r => r[0] === id);
    if (row && S42_TABLE_PLACES[table]) hits.push([row[1], S42_TABLE_PLACES[table]]);
  }
  hits.sort((a, b) => b[0] - a[0]);
  const craft = CRAFT_RECIPES.find(r => r.output.id === id);
  const places = [...new Set(hits.map(h => h[1]))].slice(0, 3).join(', ');
  if (places && craft) return `${places} · ou fabrique`;
  return places || (craft ? 'fabricação' : 'exploração');
}

const S42_USED_IN = new Map();
function s42UsedIn(id) {
  if (!S42_USED_IN.size) {
    const add = (mat, name) => { if (!S42_USED_IN.has(mat)) S42_USED_IN.set(mat, []); const l = S42_USED_IN.get(mat); if (!l.includes(name)) l.push(name); };
    for (const r of CRAFT_RECIPES) for (const mat of Object.keys(r.cost)) add(mat, r.name);
    for (const [, d] of Object.entries(BUILD_DEFS)) for (const mat of Object.keys(d.cost || {})) add(mat, d.name);
  }
  return S42_USED_IN.get(id) || [];
}

/* ---------------------------------------------------------- the journey */

// Each step is a short checklist the survivor can read without a manual.
// `where` names the places; the map shades their regions as the next step.
const S42_JOURNEY = [
  { id:'survivor', short:'SOBREVIVENTE', title:'Sobrevivente perdido', unlock:'Bancada simples',
    goal:'Recolha madeira e pedra. Fabrique um machado e prepare uma fogueira antes do anoitecer.',
    where:'Árvores e pedras em volta do Ponto de Evacuação — as mãos bastam, só são lentas.',
    tasks:[
      ['s0_mat', 'Madeira e pedra (3 de cada)', c => (c.count('wood') >= 3 && c.count('stone') >= 3) || c.owns('stone_axe', 'stone_pickaxe')],
      ['s0_axe', 'Machado improvisado', c => c.owns('stone_axe', 'hatchet', 'fire_axe')],
      ['s0_fire', 'Fogueira construída', c => c.built('campfire')]
    ] },
  { id:'shelter', short:'ABRIGO', title:'Abrigo provisório', unlock:'Ferramentas metálicas',
    goal:'Monte uma bancada simples e transforme seu abrigo em um lugar seguro.',
    where:'Casas vazias perto da estrada servem de abrigo. Pregos e sucata saem de carros e garagens.',
    tasks:[
      ['s1_bench', 'Bancada simples', c => c.built('workbench')],
      ['s1_bed', 'Cama ou baú', c => c.built('bed_build') || c.built('crate')],
      ['s1_door', 'Porta ou parede', c => c.built('door') || c.built('wall') || c.built('plank_wall') || c.built('barricade')]
    ] },
  { id:'metal', short:'METAL', title:'Ferramentas metálicas', unlock:'Oficina e energia',
    goal:'Recupere o Manual de ferramentas metálicas e troque a pedra pelo aço.',
    where:'Oficina Westline · Posto Route 17 · Fazenda Harlow. Sem o manual: fornalha + lingote de ferro, ou muita prática.',
    targets:[{ name:'Oficina Westline' }, { type:'gas_station' }, { name:'Fazenda Harlow' }],
    tasks:[
      ['s2_scrap', 'Sucata recuperada', c => c.count('scrap_metal') > 0 || c.seen('scrap_metal')],
      ['s2_manual', 'Manual de ferramentas (ou fornalha)', c => c.tier >= 2],
      ['s2_tool', 'Ferramenta metálica', c => c.owns('hatchet', 'machete', 'steel_pickaxe', 'sledgehammer', 'wrecking_bar', 'crowbar')]
    ] },
  { id:'power', short:'ENERGIA', title:'Oficina e energia', unlock:'Bancada de armamento',
    goal:'Restaure energia, produza água e prepare a base para resistir a uma invasão.',
    where:'Projeto de energia: Subestação North County · Armazém Westline · Bunker Greenwater.',
    targets:[{ type:'substation' }, { name:'Armazém Westline' }, { name:'Bunker Civil Greenwater' }],
    tasks:[
      ['s3_manual', 'Projeto de energia da base', c => c.knows('bp_power')],
      ['s3_power', 'Gerador, painel solar ou moinho', c => c.built('generator') || c.built('solar_array') || c.built('watermill')],
      ['s3_water', 'Água na base', c => c.built('rain_barrel') || c.built('water_reservoir') || c.built('rain_cistern') || c.built('electric_pump')]
    ] },
  { id:'armory', short:'ARMAMENTO', title:'Bancada de armamento', unlock:'Equipamento profissional',
    goal:'Monte a bancada de armamento, ligue-a na rede e restaure sua primeira arma.',
    where:'Manual do armeiro: Delegacia · Abrigo do Xerife · Bombeiros. Estruturas danificadas: delegacia e bombeiros.',
    targets:[{ type:'police' }, { name:'Abrigo do Xerife' }, { type:'firestation' }],
    tasks:[
      ['s4_manual', 'Manual do armeiro', c => c.knows('bp_armory')],
      ['s4_bench', 'Bancada de armamento com energia', c => c.poweredBench()],
      ['s4_restore', 'Primeira arma restaurada', c => c.flag('restored_gun')]
    ] },
  { id:'expedition', short:'EXPEDIÇÕES', title:'Expedições de alto risco', unlock:'Tecnologia Blackridge',
    goal:'Prepare carga, energia e armas: as expedições de risco 3 ou mais guardam o equipamento profissional.',
    where:'Bunker Civil Greenwater (risco 3) · Arsenal Subterrâneo do Condado (risco 4).',
    targets:[{ name:'Bunker Civil Greenwater' }, { name:'Arsenal Subterrâneo do Condado' }],
    tasks:[
      ['s5_site', 'Cofre de uma expedição de risco 3+ aberto', c => c.opened('Cofre dos moradores') || c.opened('Cofre do arsenal') || c.opened('Cofre BR-7')],
      ['s5_gear', 'Equipamento profissional', c => c.ownsTier(4)]
    ] },
  { id:'blackridge', short:'BLACKRIDGE', title:'Blackridge', unlock:'Tecnologia avançada',
    goal:'Entre em Blackridge e recupere o Protocolo técnico BR-7.',
    where:'Complexo Blackridge · Cofre BR-7 (cartão, traje de contenção e filtro).',
    targets:[{ name:'Complexo Blackridge' }, { name:'Cofre Tecnológico Blackridge' }],
    tasks:[
      ['s6_enter', 'Entrar nos níveis de Blackridge', c => c.enteredBlackridge()],
      ['s6_protocol', 'Protocolo técnico BR-7', c => c.knows('bp_blackridge')]
    ] }
];

/* ----------------------------------------------------- system overrides */

function s42SkillLevel(skill) {
  try { return typeof useSkills !== 'undefined' ? useSkills.level(skill) : 0; } catch (_) { return 0; }
}

{
  const legacyEvaluate = ProgressionSystem.prototype.evaluate;
  ProgressionSystem.prototype.legacyTier = function() {
    const saved = this.tier, cb = this.onTierUp;
    this.tier = 0; this.onTierUp = null;
    legacyEvaluate.call(this);
    const t = this.tier;
    this.tier = saved; this.onTierUp = cb;
    return t;
  };
  ProgressionSystem.prototype.evaluate = function() {
    if (!this.stage42) return legacyEvaluate.call(this);
    const next = this.stage42.computeTier();
    if (next > this.tier) {
      const old = this.tier;
      this.tier = next;
      for (let i = 0; i <= next; i++) this.unlocked.add(PROGRESSION_TIERS[i].key);
      this.onTierUp?.(PROGRESSION_TIERS[next], PROGRESSION_TIERS[old]);
    }
  };
  ProgressionSystem.prototype.canCraft = function(recipe) {
    if ((recipe.tier ?? 0) <= this.tier) return true;
    return Boolean(recipe.learn && s42SkillLevel(recipe.learn.skill) >= recipe.learn.level);
  };

  const isUnlocked = CraftingSystem.prototype.isUnlocked;
  CraftingSystem.prototype.isUnlocked = function(recipe, player) {
    if (recipe.weaponBench) {
      if (this.progression && !this.progression.canCraft(recipe)) return false;
      return Boolean(this.stage42?.weaponBenchNear(player, true));
    }
    return isUnlocked.call(this, recipe, player);
  };
  const requirementLabel = CraftingSystem.prototype.requirementLabel;
  CraftingSystem.prototype.requirementLabel = function(recipe) {
    if (this.progression && !this.progression.canCraft(recipe)) return this.stage42?.lockReason(recipe) || requirementLabel.call(this, recipe);
    if (recipe.weaponBench) {
      const bench = this.stage42?.weaponBenchNear(this.stage42.player, false);
      return bench ? 'BANCADA DE ARMAMENTO SEM ENERGIA' : 'BANCADA DE ARMAMENTO';
    }
    return requirementLabel.call(this, recipe);
  };
  const craft = CraftingSystem.prototype.craft;
  CraftingSystem.prototype.craft = function(recipeId, player) {
    const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (recipe?.weaponBench && !this.isUnlocked(recipe, player) && this.progression?.canCraft(recipe)) {
      return { ok:false, reason:this.stage42?.weaponBenchNear(player, false) ? 'A bancada de armamento está sem energia' : 'Aproxime-se de uma bancada de armamento' };
    }
    const r = craft.call(this, recipeId, player);
    if (r.ok && recipe?.restore) this.stage42?.flags.add('restored_gun');
    return r;
  };

  const place = BuildSystem.prototype.place;
  BuildSystem.prototype.place = function(type, tx, ty, player, opts = {}) {
    if (!opts.free && this.stage42) {
      const reason = this.stage42.buildLock(type);
      if (reason) return { ok:false, reason };
    }
    return place.call(this, type, tx, ty, player, opts);
  };

  const consumerProfile = PowerSystem.prototype.consumerProfile;
  PowerSystem.prototype.consumerProfile = function(type) {
    if (type === 'weapon_bench') return { demand:.7, priority:3, label:'Bancada de armamento' };
    return consumerProfile.call(this, type);
  };

  // Common places hand out worn tools; special places and crafting give
  // reliable ones. Deterministic, so every seed stays reproducible.
  const S42_COMMON = new Set(['household', 'kitchen', 'apartment', 'garage', 'gas', 'market', 'school', 'hotel', 'camp', 'farm', 'scraps', 'workshop', 'tools', 'motel', 'rooftop']);
  const loot = StructureManager.prototype.loot;
  StructureManager.prototype.loot = function(tableName, salt, rolls = 3, opts = {}) {
    const rows = loot.call(this, tableName, salt, rolls, opts);
    if (!S42_COMMON.has(tableName)) return rows;
    const workshop = tableName === 'workshop' || tableName === 'garage' || tableName === 'tools';
    rows.forEach((row, i) => {
      const def = ITEM_DEFS[row.id];
      if (!def?.maxDurability || def.stackable || (def.category !== 'tool' && def.category !== 'firearm')) return;
      const f = (workshop ? .42 : .22) + this.rand(salt * 419 + i * 23) * .28;
      row.durability = Math.max(1, Math.round(def.maxDurability * f));
    });
    return rows;
  };
}

class Stage42Journey {
  constructor(deps) {
    Object.assign(this, deps);
    this.known = new Set();
    this.done = new Set();
    this.flags = new Set();
    this.floor = 0;
    this.reached = 0;
    this.stepIndex = 0;
    this.timer = 0;
    this.progression.stage42 = this;
    this.crafting.stage42 = this;
    this.building.stage42 = this;
    this.seedBlueprints();
  }

  /* --------------------------------------------------------- knowledge */

  knows(bp) { return this.known.has(bp); }

  computeTier() {
    const p = this.progression;
    let t = 0;
    if (this.built('workbench') || this.done.has('s1_bench')) t = 1;
    if (t >= 1 && (this.knows('bp_metal_tools') || (this.built('furnace') && (p.hasSeen('iron_ingot') || this.inventory.count('iron_ingot') > 0)))) t = 2;
    if (t >= 2 && this.knows('bp_power')) t = 3;
    if (t >= 3 && this.knows('bp_armory')) t = 4;
    if (t >= 4 && this.knows('bp_blackridge')) t = 5;
    this.reached = Math.max(this.reached, t, this.floor);
    return this.reached;
  }

  learn(bp, silent = false) {
    if (!S42_BLUEPRINTS[bp] || this.known.has(bp)) return false;
    this.known.add(bp);
    for (const c of this.structures.containers) c.loot = (c.loot || []).filter(r => r.id !== bp);
    if (!silent) this.notify(`PROJETO APRENDIDO · ${ITEM_DEFS[bp].name} — libera ${S42_BLUEPRINTS[bp].opens}`, 'good');
    this.progression.evaluate();
    return true;
  }

  grantAll() { for (const bp of Object.keys(S42_BLUEPRINTS)) this.known.add(bp); this.floor = 5; this.reached = 5; this.progression.evaluate(); }

  sourceBox(src) {
    const C = this.structures.containers, T = CONFIG.TILE;
    if (src.key) return C.find(c => c.stage41Key === src.key) || null;
    if (src.container) return C.find(c => c.name === src.container) || null;
    const s = this.structures.structures.find(s => (src.name ? s.name === src.name : s.type === src.type) && !s.underground && !s.stage41);
    if (!s) return null;
    const inside = C.filter(c => { const x = c.x / T, y = c.y / T; return x >= s.x && x <= s.endX && y >= s.groundY - 24 && y <= s.groundY + 2 && !c.stage41; });
    return inside.find(c => c.rare) || inside[0] || null;
  }

  // Idempotent: a missing project is placed in every source that lacks it.
  seedBlueprints() {
    for (const [bp, def] of Object.entries(S42_BLUEPRINTS)) {
      if (this.known.has(bp) || this.inventory.count(bp) > 0) continue;
      for (const src of def.sources) {
        const box = this.sourceBox(src);
        if (box && !(box.loot || []).some(r => r.id === bp)) (box.loot = box.loot || []).push({ id:bp, qty:1 });
      }
    }
  }

  /* ------------------------------------------------------------ checks */

  built(type) { return this.building.objects.some(o => o.type === type && o.health > 0); }

  context() {
    const inv = this.inventory, p = this.progression;
    return {
      tier:p.tier,
      count:id => inv.count(id),
      seen:id => p.hasSeen(id),
      owns:(...ids) => ids.some(id => inv.count(id) > 0),
      built:type => this.built(type),
      knows:bp => this.knows(bp),
      flag:f => this.flags.has(f),
      poweredBench:() => this.building.objects.some(o => o.type === 'weapon_bench' && o.health > 0 && o.powered),
      opened:name => this.structures.containers.some(b => b.name === name && b.discovered),
      ownsTier:n => inv.entries.some(e => (GEAR_TIER_BY_ID[e.id] ?? -1) >= n),
      enteredBlackridge:() => Boolean(this.lore?.enteredBunker || this.structures.structures.some(s => s.expeditionId === 'blackridge_vault' && s.visits > 0))
    };
  }

  update(dt) {
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = .4;
    for (const bp of Object.keys(S42_BLUEPRINTS)) {
      if (this.inventory.count(bp) > 0) { this.inventory.remove(bp, this.inventory.count(bp)); this.learn(bp); }
    }
    this.progression.evaluate();
    const c = this.context();
    for (const step of S42_JOURNEY) for (const [id, , check] of step.tasks) if (!this.done.has(id) && check(c)) this.done.add(id);
    const before = this.stepIndex;
    this.stepIndex = this.currentIndex();
    if (this.stepIndex > before) {
      const finished = S42_JOURNEY[this.stepIndex - 1];
      const next = S42_JOURNEY[this.stepIndex];
      this.notify(next ? `ETAPA CONCLUÍDA · ${finished.title} — próximo: ${next.title}` : 'JORNADA COMPLETA · a tecnologia de Blackridge está nas suas mãos', 'good');
    }
  }

  currentIndex() {
    for (let i = 0; i < S42_JOURNEY.length; i++) if (!S42_JOURNEY[i].tasks.every(([id]) => this.done.has(id))) return i;
    return S42_JOURNEY.length;
  }

  current() {
    const i = Math.min(this.stepIndex, S42_JOURNEY.length - 1);
    const step = S42_JOURNEY[i];
    return {
      index:i, total:S42_JOURNEY.length, step, complete:this.stepIndex >= S42_JOURNEY.length,
      tasks:step.tasks.map(([id, label]) => ({ id, label, done:this.done.has(id) }))
    };
  }

  nextTask() {
    const cur = this.current();
    if (cur.complete) return 'Jornada completa';
    const t = cur.tasks.find(x => !x.done);
    return t ? t.label : cur.step.unlock;
  }

  /* -------------------------------------------------------------- labels */

  recipeKind(recipe) {
    const t = recipe.tier ?? 0;
    if (recipe.learn && t > this.progression.tier) return `PRÁTICA · ${S42_SKILL_NAMES[recipe.learn.skill] || recipe.learn.skill} ${recipe.learn.level}`;
    if (t === 0) return 'CONHECIDA';
    if (t === 1) return 'BANCADA';
    return `PROJETO · ${S42_BLUEPRINTS[S42_TIER_BLUEPRINT[t]]?.short || PROGRESSION_TIERS[t].name}`;
  }

  tierLockReason(t) {
    if (t <= this.progression.tier) return null;
    if (t === 1) return 'CONSTRUA UMA BANCADA';
    const bp = S42_TIER_BLUEPRINT[t];
    if (t >= 2 && !this.knows(bp)) return `PRECISA: ${S42_BLUEPRINTS[bp].short}`;
    return `ANTES: ${PROGRESSION_TIERS[t - 1].name}`;
  }

  lockReason(recipe) {
    const base = this.tierLockReason(recipe.tier ?? 0);
    if (!base) return '';
    if (recipe.learn) return `${base} · OU ${S42_SKILL_NAMES[recipe.learn.skill].toUpperCase()} ${recipe.learn.level}`;
    return base;
  }

  buildTier(type) { return S42_BUILD_TIER[type] ?? 0; }
  buildLock(type) {
    const r = this.tierLockReason(this.buildTier(type));
    return r ? `${BUILD_DEFS[type]?.name || type}: ${r.toLowerCase()}` : null;
  }

  weaponBenchNear(player, needPower) {
    if (!player) return null;
    const bench = this.building.nearest(player, 4.2, o => o.type === 'weapon_bench');
    if (!bench) return null;
    return !needPower || bench.powered ? bench : null;
  }

  // Structures to shade on the county map for the current step.
  mapTargets() {
    const step = this.current().complete ? null : this.current().step;
    const out = [];
    for (const t of step?.targets || []) {
      const s = this.structures.structures.find(s => t.name ? s.name === t.name : s.type === t.type);
      if (s) out.push(s);
    }
    return out;
  }

  /* ---------------------------------------------------------- save/load */

  exportState() {
    return { version:1, known:[...this.known], done:[...this.done], flags:[...this.flags], floor:this.floor, reached:this.reached };
  }

  importState(data) {
    this.known = new Set(); this.done = new Set(); this.flags = new Set();
    this.floor = 0; this.reached = 0;
    if (data) {
      for (const bp of data.known || []) if (S42_BLUEPRINTS[bp]) this.known.add(bp);
      this.done = new Set(data.done || []);
      this.flags = new Set(data.flags || []);
      this.floor = Number(data.floor) || 0;
      this.reached = Number(data.reached) || 0;
    } else {
      // Saves from before Stage 42: nobody loses what they already reached.
      this.progression.observe();
      let floor = this.progression.legacyTier();
      for (const o of this.building.objects) if (o.health > 0) floor = Math.max(floor, this.buildTier(o.type));
      if (floor >= 1 || this.built('workbench')) floor = Math.max(floor, 1);
      this.floor = floor;
      for (let t = 2; t <= floor; t++) this.known.add(S42_TIER_BLUEPRINT[t]);
      const stepsDone = Math.min(S42_JOURNEY.length, floor);
      for (let i = 0; i < stepsDone; i++) for (const [id] of S42_JOURNEY[i].tasks) this.done.add(id);
    }
    const cb = this.progression.onTierUp;
    this.progression.onTierUp = null;
    this.progression.tier = 0;
    this.progression.evaluate();
    this.progression.onTierUp = cb;
    this.stepIndex = this.currentIndex();
    this.seedBlueprints();
    return true;
  }
}

// Objectives: the journey is always the first live goal on the HUD. The old
// tier goals and the duplicated tool/shelter goals are folded into it.
{
  for (const id of ['tool', 'shelter', 'progress_salvage', 'progress_metal', 'progress_industrial', 'progress_emergency', 'progress_blackridge']) {
    const i = OBJECTIVE_DEFS.findIndex(d => d.id === id);
    if (i >= 0) OBJECTIVE_DEFS.splice(i, 1);
  }
  const journey = () => (typeof journey42 !== 'undefined' ? journey42 : null);
  OBJECTIVE_DEFS.unshift({
    id:'journey', category:'progress', journey:true,
    get title() { const c = journey()?.current(); return !c ? 'Jornada' : c.complete ? 'Jornada completa' : `${c.index + 1}/${c.total} · ${c.step.title}`; },
    get hint() { return journey()?.current().step.goal || ''; },
    reveal:() => true,
    done:() => Boolean(journey()?.current().complete),
    progress:() => journey()?.nextTask() || ''
  });
}
