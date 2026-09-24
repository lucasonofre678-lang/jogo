// Stage 42 — Progression & Crafting 2.0 (journey42): static rules + generation over seeds.
// The zombie population half of Stage 42 has its own tools/validate_stage42.js.
// Runtime journey, restoration, saves and the zoomed map are covered by smoke.js.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const bad = [];
const html = read('index.html'), game = read('js/game.js'), prog = read('js/stage42_progression.js');

for (const f of ['js/stage42_content.js', 'js/stage42_progression.js', 'js/stage42_map.js', 'stage42-progression.css'])
  if (!html.includes(f)) bad.push(`não carregado no HTML: ${f}`);
if (html.indexOf('js/stage42_content.js') > html.indexOf('js/assets.js')) bad.push('conteúdo Stage 42 carrega depois dos assets');
if (html.indexOf('js/stage42_progression.js') > html.indexOf('js/game.js')) bad.push('progressão Stage 42 carrega depois do game.js');
for (const id of ['journeyStrip', 'mapZoomIn', 'mapZoomOut', 'mapCenter', 'journeyWhereText']) if (!html.includes(`id="${id}"`)) bad.push(`elemento ausente: ${id}`);
for (const hook of ['journey42:journey42.exportState()', 'journey42.importState(save.journey42', 'journey42.update(dt)', 'countyMapView.render()', 'renderJourneyStrip()', 'journey42.buildLock(type)', 'countyMapView.toTile('])
  if (!game.includes(hook)) bad.push(`integração ausente no game.js: ${hook}`);
for (const text of ['Recolha madeira e pedra. Fabrique um machado e prepare uma fogueira antes do anoitecer.', 'Monte uma bancada simples', 'Restaure energia, produza água e prepare a base para resistir a uma invasão.'])
  if (!prog.includes(text)) bad.push(`objetivo da jornada ausente: ${text}`);
for (const id of ['bp_metal_tools', 'bp_power', 'bp_armory', 'bp_blackridge']) if (!fs.existsSync(path.join(root, 'assets/items', id + '.png'))) bad.push(`ícone ausente: ${id}`);
if (!fs.existsSync(path.join(root, 'assets/build/weapon_bench.png'))) bad.push('ícone ausente: weapon_bench');

function boot(seed) {
  const ctx = vm.createContext({ console, Math, Map, Set, Array, Object, JSON, Uint8Array, Int16Array, Float32Array, Uint8ClampedArray, Number, String, Boolean });
  for (const f of ['config.js', 'weapons.js', 'building.js', 'stage39_content.js', 'stage40_content.js', 'stage42_content.js', 'decor_data.js', 'world.js', 'structures.js', 'underground.js'])
    vm.runInContext(read('js/' + f), ctx, { filename:f });
  vm.runInContext('const AREA_PROFILES={};', ctx);
  for (const f of ['stage41_expeditions.js', 'progression.js', 'crafting.js', 'power.js', 'lore.js', 'objectives.js', 'stage42_progression.js'])
    vm.runInContext(read('js/' + f), ctx, { filename:f });
  vm.runInContext(`
    globalThis.__w = new World(${seed});
    globalThis.__s = new StructureManager(__w, ${seed});
    globalThis.__l = new LoreSystem(__w, __s, { count:() => 0 }, null, ${seed});
    const inventory = { entries:[], count:() => 0, remove(){}, add(){} };
    const building = { objects:[], nearest:() => null };
    const progression = new ProgressionSystem(inventory, __s, building);
    globalThis.__j = new Stage42Journey({ progression, crafting:{}, building, inventory, structures:__s, places:{}, lore:__l, player:null, notify(){} });
    globalThis.__p = progression;
  `, ctx);
  return { S:ctx.__s, J:ctx.__j, P:ctx.__p, ctx };
}

const { ctx } = boot(1000);
const R = vm.runInContext('CRAFT_RECIPES', ctx), D = vm.runInContext('ITEM_DEFS', ctx), B = vm.runInContext('BUILD_DEFS', ctx);
const JOURNEY = vm.runInContext('S42_JOURNEY', ctx), BP = vm.runInContext('S42_BLUEPRINTS', ctx);
const recipe = id => R.find(r => r.id === id);
if (JOURNEY.length !== 7) bad.push(`jornada com ${JOURNEY.length}/7 etapas`);
for (const id of ['stone_axe', 'stone_pickaxe']) {
  const r = recipe(id);
  if (!r || r.bench || r.tier !== 0 || Object.keys(r.cost).some(k => !['wood', 'stone'].includes(k))) bad.push(`${id} não é feito à mão só com madeira e pedra`);
}
if (B.workbench.cost.scrap_metal || (B.workbench.cost.nails || 0) > 4) bad.push('bancada simples cara demais para o T1');
for (const r of R.filter(r => D[r.output.id]?.gun))
  if (!r.restore || !r.weaponBench || !r.cost.damaged_weapon_frame) bad.push(`arma fabricada do zero: ${r.id}`);
for (const id of ['weapon_parts', 'spring_parts']) if (!recipe(id)?.weaponBench) bad.push(`${id} fora da bancada de armamento`);
for (const r of R.filter(r => r.learn)) if (!['mining', 'mechanics', 'construction', 'medicine', 'stealth', 'scavenging'].includes(r.learn.skill)) bad.push(`habilidade inexistente em ${r.id}`);
for (const r of R) for (const id of [r.output.id, ...Object.keys(r.cost)]) if (!D[id]) bad.push(`item inexistente em ${r.id}: ${id}`);
const kinds = { known:R.filter(r => (r.tier ?? 0) === 0).length, learned:R.filter(r => r.learn).length, project:R.filter(r => (r.tier ?? 0) >= 2).length };
if (!kinds.known || !kinds.learned || !kinds.project) bad.push('faltam os três tipos de receita');

let seeds = 0;
for (const seed of [1000, 8919, 16838, 24757, 32676, 40595]) {
  const { S, J, P } = boot(seed);
  if (P.tier !== 0) bad.push(`seed ${seed}: jogo novo começa no T${P.tier}`);
  for (const [bp, def] of Object.entries(BP)) {
    const holders = S.containers.filter(c => (c.loot || []).some(r => r.id === bp));
    if (holders.length < Math.min(2, def.sources.length)) bad.push(`seed ${seed}: ${bp} em ${holders.length} local(is)`);
  }
  for (const step of JOURNEY) for (const t of step.targets || []) {
    if (!S.structures.some(s => t.name ? s.name === t.name : s.type === t.type)) bad.push(`seed ${seed}: destino da etapa ${step.id} inexistente: ${t.name || t.type}`);
  }
  if (!J.buildLock('generator') || J.buildLock('workbench') || J.buildLock('campfire')) bad.push(`seed ${seed}: bloqueio de construção incorreto no início`);
  seeds++;
}

if (bad.length) { console.error('STAGE42 PROGRESSÃO FAILED'); for (const x of [...new Set(bad)]) console.error('- ' + x); process.exit(1); }
console.log(`STAGE42 PROGRESSÃO OK — jornada de 7 etapas, receitas ${kinds.known} conhecidas / ${kinds.learned} por prática / ${kinds.project} por projeto, 4 projetos no mundo, armas só por restauração, ${seeds} seeds`);
