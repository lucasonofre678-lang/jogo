#!/usr/bin/env node
// LAST COUNTY — validação da Stage 31 (comida, cultivo, clima e caça).
//
// Não basta conferir que os itens existem: as três mecânicas novas têm
// comportamento com o tempo, então este validador SIMULA cada uma e verifica
// o resultado. É o que separa "o arquivo está lá" de "a horta cresce".
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const errors = [];
const fail = m => errors.push(m);

/* ---------------------------------------------------- contexto de runtime */

const ctx = vm.createContext({
  console, Map, Set, Math, JSON, Array, Object, String, Number, Boolean,
  Uint8Array, Int16Array, Float32Array, isNaN, isFinite, parseInt, parseFloat, Date
});
for (const f of ['config.js', 'weapons.js', 'building.js', 'animation.js', 'wildlife.js',
                 'inventory.js', 'survival.js', 'weather.js', 'food.js', 'farming.js',
                 'crafting.js', 'power.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
}
vm.runInContext(`globalThis.__x = {
  ITEM_DEFS, BUILD_DEFS, CRAFT_RECIPES, CROP_DEFS, WILDLIFE_SPECIES, SEASONS, WEATHER_CONDITIONS,
  REGION_CLIMATE, ANIMAL_ANIMATIONS, Inventory, Survival, FoodSystem, FarmingSystem, WeatherSystem, CONFIG
};`, ctx);
const X = ctx.__x;

/* --------------------------------------------------------------- 1. itens */

const FOOD_ITEMS = ['raw_meat', 'raw_small_game', 'cooked_meat', 'roast_haunch', 'jerky', 'meat_stew',
  'vegetable_soup', 'bone_broth', 'baked_potato', 'roasted_corn', 'flatbread', 'pickled_vegetables', 'spoiled_food'];
const CROP_ITEMS = ['potato', 'corn', 'beans', 'tomato', 'wheat_grain', 'flour', 'wild_herbs', 'dried_herbs', 'salt', 'glass_jar', 'fertilizer'];
const SEEDS = ['seed_potato', 'seed_corn', 'seed_bean', 'seed_tomato', 'seed_wheat'];
const HUNT_ITEMS = ['animal_fat', 'animal_hide', 'tanned_leather', 'bone', 'feathers'];
const HUNTER_GEAR = ['leather_coat', 'fur_hood', 'leather_gloves', 'hide_boots'];
const TOOLS = ['watering_can', 'butcher_knife'];
const ALL_NEW = [...FOOD_ITEMS, ...CROP_ITEMS, ...SEEDS, ...HUNT_ITEMS, ...HUNTER_GEAR, ...TOOLS];

for (const id of ALL_NEW) {
  if (!X.ITEM_DEFS[id]) { fail(`item ausente: ${id}`); continue; }
  if (!fs.existsSync(path.join(ROOT, 'assets', 'items', `${id}.png`))) fail(`ícone ausente: ${id}`);
}
for (const id of HUNTER_GEAR) {
  if (!fs.existsSync(path.join(ROOT, 'assets', 'sprites', `player_${id}.png`))) fail(`overlay ausente: ${id}`);
}
if (!fs.existsSync(path.join(ROOT, 'assets', 'items', 'held_butcher_knife.png'))) fail('sprite em mão ausente: butcher_knife');

// Toda semente precisa apontar para uma cultura real e vice-versa.
for (const id of SEEDS) {
  const crop = X.ITEM_DEFS[id]?.crop;
  if (!crop || !X.CROP_DEFS[crop]) fail(`semente ${id} sem cultura válida`);
}
for (const [id, crop] of Object.entries(X.CROP_DEFS)) {
  if (!X.ITEM_DEFS[crop.seed]) fail(`cultura ${id} sem semente`);
  if (!X.ITEM_DEFS[crop.item]) fail(`cultura ${id} sem item de colheita`);
}

// Perecibilidade: comida crua tem de estragar e conserva tem de durar.
for (const id of ['raw_meat', 'raw_small_game', 'cooked_meat', 'berries', 'tomato']) {
  if (!X.ITEM_DEFS[id]?.perishable) fail(`${id} deveria ser perecível`);
}
for (const id of ['jerky', 'pickled_vegetables']) {
  if (!X.ITEM_DEFS[id]?.preserved) fail(`${id} deveria ser conservado`);
}
if (!(X.ITEM_DEFS.raw_meat.perishable < X.ITEM_DEFS.cooked_meat.perishable)) fail('carne assada deveria durar mais que a crua');

/* ------------------------------------------------------- 2. construções */

const NEW_BUILDS = ['garden_plot', 'water_trough', 'greenhouse_frame', 'snare_trap', 'stove', 'drying_rack', 'icebox'];
for (const id of NEW_BUILDS) {
  if (!X.BUILD_DEFS[id]) { fail(`construção ausente: ${id}`); continue; }
  if (!fs.existsSync(path.join(ROOT, 'assets', 'build', `${id}.png`))) fail(`ícone de construção ausente: ${id}`);
  for (const cost of Object.keys(X.BUILD_DEFS[id].cost || {})) {
    if (!X.ITEM_DEFS[cost]) fail(`construção ${id} pede item inexistente ${cost}`);
  }
}

/* ---------------------------------------------------------- 3. receitas */

const NEW_RECIPES = ['cook_meat', 'meat_stew', 'vegetable_soup', 'jerky', 'flatbread', 'pickled_vegetables',
  'fertilizer', 'watering_can', 'tanned_leather', 'leather_coat', 'butcher_knife'];
for (const id of NEW_RECIPES) {
  if (!X.CRAFT_RECIPES.some(r => r.id === id)) fail(`receita ausente: ${id}`);
}
for (const r of X.CRAFT_RECIPES) {
  if (!X.ITEM_DEFS[r.output.id]) fail(`receita ${r.id} produz item inexistente`);
  for (const c of Object.keys(r.cost)) if (!X.ITEM_DEFS[c]) fail(`receita ${r.id} pede item inexistente ${c}`);
}
const stations = X.CRAFT_RECIPES.filter(r => r.cook || r.kitchen || r.rack);
if (stations.length < 8) fail('poucas receitas usando as estações novas');
const building = fs.readFileSync(path.join(ROOT, 'js/building.js'), 'utf8');
for (const fn of ['hasCookingNear', 'hasKitchenNear', 'hasRackNear']) {
  if (!building.includes(fn)) fail(`BuildSystem sem ${fn}`);
}

/* ----------------------------------------------- 4. simulação: comida */

{
  const inv = new X.Inventory(400);
  const survival = new X.Survival();
  let minutes = 0;
  const containers = [];
  const food = new X.FoodSystem({
    inventory: inv, survival, structures: { containers }, building: { objects: [] },
    power: null, weather: { ambientTemp: 18 }, getWorldMinutes: () => minutes
  });

  food.update(0.016, 18);   // estabelece a linha de base de tempo
  inv.add('raw_meat', 4);
  const entry = inv.first('raw_meat');
  food.ensure(entry);
  if (food.freshness(entry) !== 100) fail('carne nova deveria começar 100% fresca');

  // Meio prazo de validade a 18 °C derruba o frescor para perto da metade.
  minutes = X.ITEM_DEFS.raw_meat.perishable * 60 * 0.5;
  food.update(0.016, 18);
  const half = food.freshness(inv.first('raw_meat'));
  if (!(half > 35 && half < 65)) fail(`decaimento fora da curva esperada: ${half.toFixed(1)}`);

  // Passado o prazo inteiro, vira comida estragada.
  minutes = X.ITEM_DEFS.raw_meat.perishable * 60 * 1.3;
  food.update(0.016, 18);
  if (inv.count('raw_meat') > 0) fail('carne vencida não estragou');
  if (inv.count('spoiled_food') <= 0) fail('comida vencida não virou composto');

  // Frio segura: a mesma carne numa geladeira ligada ainda está boa.
  const cold = { loot: [{ id: 'raw_meat', qty: 4 }], coldStorage: true, powered: true };
  containers.push(cold);
  let coldMinutes = 0;
  const food2 = new X.FoodSystem({
    inventory: new X.Inventory(400), survival, structures: { containers }, building: { objects: [] },
    power: null, weather: { ambientTemp: 18 }, getWorldMinutes: () => coldMinutes
  });
  food2.update(0.016, 18);
  coldMinutes = X.ITEM_DEFS.raw_meat.perishable * 60;
  food2.update(0.016, 18);
  const chilled = food2.freshness(cold.loot[0]);
  if (cold.loot[0].id !== 'raw_meat') fail('geladeira ligada deixou a carne estragar');
  if (!(chilled > 70)) fail(`geladeira conservou pouco: ${chilled.toFixed(1)}%`);

  // Calor acelera, frio segura.
  if (!(food.temperatureScale(32) > food.temperatureScale(18))) fail('calor não acelera o estrago');
  if (!(food.temperatureScale(2) < food.temperatureScale(18))) fail('frio não retarda o estrago');

  // Alimentação: refeição preparada sobe, repetição rende menos.
  const before = food.nourishment;
  food.consume('meat_stew', null, () => 1);
  if (!(food.nourishment > before)) fail('refeição preparada não melhorou a alimentação');
  const firstGain = food.nourishment - before;
  const mid = food.nourishment;
  food.consume('meat_stew', null, () => 1);
  if (!(food.nourishment - mid < firstGain)) fail('variedade não está penalizando repetição');

  const mods = food.modifiers();
  if (!(mods.hungerScale > 0.7 && mods.hungerScale <= 1.05)) fail('hungerScale fora de faixa');

  // Comida crua é aposta: com sorte zero, faz mal.
  const sick = food.consume('raw_meat', { id: 'raw_meat', fresh: 100 }, () => 0);
  if (!sick.sick) fail('carne crua deveria poder causar mal-estar');
}

/* --------------------------------------------- 5. simulação: cultivo */

{
  const inv = new X.Inventory(400);
  let minutes = 0;
  const objects = [];
  const world = {
    isIndoors: () => false,
    get: () => 1,
    isSolid: () => true
  };
  const farming = new X.FarmingSystem({
    building: { objects }, world, inventory: inv, structures: { containers: [] },
    weather: null, danger: null, getWorldMinutes: () => minutes
  });

  const plot = { type: 'garden_plot', health: 60, tileX: 100, tileY: 40, width: 1, height: 1 };
  objects.push(plot);
  farming.prepare(plot);

  farming.update(0.016, { rainIntensity: 0, ambientTemp: 18 });
  inv.add('seed_potato', 2);
  const planted = farming.plant(plot, 'seed_potato');
  if (!planted.ok) fail(`plantio falhou: ${planted.reason}`);
  if (farming.plant(plot, 'seed_potato').ok) fail('canteiro aceitou duas culturas');

  // Sem água a planta não anda.
  plot.water = 0;
  if (farming.growthRate(plot, X.CROP_DEFS.potato, 18) !== 0) fail('canteiro seco continuou crescendo');

  // Com o canteiro regado e temperatura boa, amadurece dentro do ciclo — em
  // passos de 12 h, que é como o jogo realmente roda (dormir, sair, voltar).
  plot.water = 100;
  for (let pass = 0; pass < 12 && !farming.ripe(plot); pass++) {
    minutes += 12 * 60;
    farming.update(0.016, { rainIntensity: 0, ambientTemp: 18 });
    farming.waterPlot(plot, 100);                 // regador do jogador ou do morador
  }
  if (!farming.ripe(plot)) fail(`batata não amadureceu com rega em dia (growth ${plot.growth.toFixed(2)})`);
  const cycles = (minutes / 60) / X.CROP_DEFS.potato.growHours;
  if (cycles > 2) fail(`batata levou ${cycles.toFixed(1)}x o ciclo declarado`);

  // Deixar o canteiro secar trava o crescimento: água é uma decisão real.
  {
    const dry = { type: 'garden_plot', health: 60, tileX: 140, tileY: 40, width: 1, height: 1 };
    objects.push(dry);
    farming.prepare(dry);
    inv.add('seed_bean', 1);
    farming.plant(dry, 'seed_bean');
    dry.water = 0;
    minutes += X.CROP_DEFS.beans.growHours * 60;
    farming.update(0.016, { rainIntensity: 0, ambientTemp: 18 });
    if (dry.growth > 0.05) fail('canteiro seco cresceu mesmo assim');
    if (dry.vigor >= 100) fail('canteiro seco não perdeu vigor');
    objects.splice(objects.indexOf(dry), 1);
  }

  const picked = farming.harvest(plot);
  if (!picked.ok) fail(`colheita falhou: ${picked.reason}`);
  if (inv.count('potato') < 1) fail('colheita não entregou batata');
  if (inv.count('seed_potato') < 1) fail('colheita não devolveu semente');
  if (plot.crop) fail('canteiro continuou plantado depois da colheita');

  // Chuva rega sozinha.
  plot.water = 10;
  minutes += 120;
  farming.update(0.016, { rainIntensity: 1, ambientTemp: 14 });
  if (!(plot.water > 30)) fail('chuva não regou o canteiro descoberto');

  // Estufa protege da geada.
  const greenhouse = { type: 'greenhouse_frame', health: 160, tileX: 99, tileY: 40, width: 3, height: 3 };
  objects.push(greenhouse);
  if (!farming.sheltered(plot)) fail('estufa não cobriu o canteiro vizinho');
  farming.plant(plot, 'seed_potato');
  plot.water = 100; plot.vigor = 100;
  minutes += 60 * 12;
  farming.update(0.016, { rainIntensity: 0, ambientTemp: -6, freezing: true });
  if (plot.vigor < 90) fail(`estufa não protegeu da geada (vigor ${plot.vigor.toFixed(0)})`);

  // Sem estufa, a mesma geada cobra o preço.
  objects.splice(objects.indexOf(greenhouse), 1);
  minutes += 60 * 12;
  farming.update(0.016, { rainIntensity: 0, ambientTemp: -6, freezing: true });
  if (plot.vigor >= 90) fail('geada a céu aberto não danificou a plantação');

  // Irrigação: a calha rega os canteiros vizinhos sozinha.
  const trough = { type: 'water_trough', health: 85, tileX: 101, tileY: 40, width: 2, height: 1, water: 10 };
  objects.push(trough);
  plot.water = 5;
  minutes += 90;
  farming.update(0.016, { rainIntensity: 0, ambientTemp: 16 });
  if (!(plot.water > 30)) fail(`calha de irrigação não regou o canteiro (${plot.water.toFixed(0)})`);
  if (!(trough.water < 10)) fail('calha regou sem consumir água');
}

/* ----------------------------------------------- 6. simulação: caça */

{
  const species = Object.keys(X.WILDLIFE_SPECIES);
  if (species.length < 5) fail('menos de cinco espécies caçáveis');
  for (const id of species) {
    const def = X.WILDLIFE_SPECIES[id];
    if (!fs.existsSync(path.join(ROOT, 'assets', 'sprites', `animal_${id}.png`))) fail(`folha de sprite ausente: ${id}`);
    if (!Object.keys(def.drops || {}).length) fail(`${id} não solta nada`);
    for (const drop of Object.keys(def.drops)) if (!X.ITEM_DEFS[drop]) fail(`${id} solta item inexistente ${drop}`);
    if (!Object.keys(def.regions || {}).length) fail(`${id} sem região`);
  }
  const fighters = species.filter(id => X.WILDLIFE_SPECIES[id].aggressive || X.WILDLIFE_SPECIES[id].predator);
  if (!fighters.length) fail('nenhuma espécie revida');

  // Quadro de animação dentro da folha.
  const maxFrame = Math.max(...Object.values(X.ANIMAL_ANIMATIONS).flatMap(a => a.frames));
  for (const id of species) {
    const file = path.join(ROOT, 'assets', 'sprites', `animal_${id}.png`);
    if (!fs.existsSync(file)) continue;
    const head = Buffer.alloc(24);
    const fd = fs.openSync(file, 'r');
    fs.readSync(fd, head, 0, 24, 0);
    fs.closeSync(fd);
    const width = head.readUInt32BE(16), height = head.readUInt32BE(20);
    const frames = Math.floor(width / 48);
    if (height !== 40) fail(`${id}: altura da folha deveria ser 40, é ${height}`);
    if (frames <= maxFrame) fail(`${id}: folha com ${frames} quadros, animação pede ${maxFrame + 1}`);
  }
}

/* ------------------------------------------------ 7. clima e estações */

{
  if (X.SEASONS.length !== 4) fail('deveriam existir quatro estações');
  const weather = new X.WeatherSystem(12345);
  const winter = X.SEASONS.find(s => s.id === 'winter');
  const summer = X.SEASONS.find(s => s.id === 'summer');
  if (!(winter.temp < summer.temp)) fail('inverno não é mais frio que o verão');

  // Todas as condições declaram visibilidade, som e escurecimento.
  for (const [id, c] of Object.entries(X.WEATHER_CONDITIONS)) {
    for (const key of ['name', 'visibility', 'noise', 'dim', 'temp']) {
      if (c[key] === undefined) fail(`condição ${id} sem ${key}`);
    }
    if (c.visibility <= 0 || c.visibility > 1) fail(`condição ${id} com visibilidade inválida`);
  }
  const clear = X.WEATHER_CONDITIONS.clear, fog = X.WEATHER_CONDITIONS.fog, storm = X.WEATHER_CONDITIONS.storm;
  if (!(fog.visibility < clear.visibility)) fail('neblina não reduz visibilidade');
  if (!(storm.noise < clear.noise)) fail('tempestade não abafa o som');

  // Estação muda com o calendário.
  const seen = new Set();
  for (let day = 0; day < 28; day++) seen.add(weather.season(day * 1440).id);
  if (seen.size !== 4) fail(`o ciclo de estações não cobriu as quatro (${[...seen].join(',')})`);

  // Microclima por região.
  for (const id of ['coldwood', 'ridge', 'dustbowl', 'downtown']) {
    if (!X.REGION_CLIMATE[id]) fail(`região sem microclima: ${id}`);
  }
  if (!(X.REGION_CLIMATE.coldwood.temp < X.REGION_CLIMATE.dustbowl.temp)) fail('Mata Fria deveria ser mais fria que a Baixada Seca');

  for (const fn of ['drawSnow', 'drawWind', 'drawSeasonTint', 'visibility', 'noiseScale', 'dimming', 'freezing']) {
    if (typeof weather[fn] !== 'function') fail(`WeatherSystem sem ${fn}`);
  }
}

/* --------------------------------------------------- 8. integração */

{
  const game = fs.readFileSync(path.join(ROOT, 'js/game.js'), 'utf8');
  for (const needle of ['new FoodSystem', 'new FarmingSystem', 'new WildlifeSystem',
                        'farming.draw', 'wildlife.draw', 'weather.drawSnow',
                        'interactCarcass', 'onGardenPlot', 'onSnare', 'sceneVisibilityScale',
                        'food.exportState', 'wildlife.exportState']) {
    if (!game.includes(needle)) fail(`game.js não integra: ${needle}`);
  }
  if (!game.includes('version:31')) fail('save não foi para a versão 31');

  const basecamp = fs.readFileSync(path.join(ROOT, 'js/basecamp.js'), 'utf8');
  for (const needle of ['tendGarden', 'cookFromStock', "id:'farmer'"]) {
    if (!basecamp.includes(needle)) fail(`basecamp.js não integra: ${needle}`);
  }

  const enemies = fs.readFileSync(path.join(ROOT, 'js/enemies.js'), 'utf8');
  if (!enemies.includes('environmentNoiseScale')) fail('o clima não afeta o alcance do ruído');

  const survivalSrc = fs.readFileSync(path.join(ROOT, 'js/survival.js'), 'utf8');
  if (!survivalSrc.includes('hungerScale')) fail('survival.js não usa hungerScale');

  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  for (const f of ['js/food.js', 'js/farming.js', 'js/wildlife.js']) {
    if (!html.includes(f)) fail(`index.html não carrega ${f}`);
  }
  if (html.indexOf('js/wildlife.js') > html.indexOf('js/assets.js')) fail('wildlife.js precisa carregar antes de assets.js');
}

/* ------------------------------------------------------------ resultado */

if (errors.length) {
  console.error('STAGE31 FAILED');
  errors.forEach(e => console.error('-', e));
  process.exit(1);
}

const foodCount = Object.values(X.ITEM_DEFS).filter(d => d?.category === 'food').length;
const perishables = Object.values(X.ITEM_DEFS).filter(d => d?.perishable).length;
const cooking = X.CRAFT_RECIPES.filter(r => r.category === 'COZINHA').length;
const farmingRecipes = X.CRAFT_RECIPES.filter(r => r.category === 'CULTIVO').length;
console.log([
  `Stage 31 OK: ${ALL_NEW.length} itens novos, ${foodCount} alimentos (${perishables} perecíveis),`,
  `${cooking} receitas de cozinha + ${farmingRecipes} de cultivo, ${NEW_BUILDS.length} construções,`,
  `${Object.keys(X.CROP_DEFS).length} culturas, ${Object.keys(X.WILDLIFE_SPECIES).length} espécies caçáveis,`,
  `${X.SEASONS.length} estações e ${Object.keys(X.WEATHER_CONDITIONS).length} condições climáticas.`
].join(' '));
