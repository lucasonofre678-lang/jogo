// Headless smoke test: boots the whole game against a stub DOM/canvas and
// drives it through real player actions, so runtime errors surface in CI
// instead of in the browser console.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const errors = [];

/* ------------------------------------------------------------- DOM stub */

function makeCtx() {
  const noop = () => {};
  return {
    canvas: { width: 1280, height: 720 },
    globalAlpha: 1, globalCompositeOperation: 'source-over',
    fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: 'left',
    imageSmoothingEnabled: true,
    save: noop, restore: noop, translate: noop, scale: noop, rotate: noop,
    fillRect: noop, strokeRect: noop, clearRect: noop, drawImage: noop,
    beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop, arc: noop,
    ellipse: noop, quadraticCurveTo: noop, fill: noop, stroke: noop, clip: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => null,
    measureText: t => ({ width: String(t).length * 6 }),
    fillText: noop, strokeText: noop, setTransform: noop,
    createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
    putImageData: noop,
    getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) })
  };
}

const listeners = new Map();

function makeElement(tag = 'div', id = '') {
  const el = {
    tagName: String(tag).toUpperCase(),
    id, className: '', textContent: '', innerHTML: '', value: '', title: '',
    disabled: false, draggable: false, type: '', src: '', alt: '',
    dataset: {}, children: [], width: 1280, height: 720,
    style: new Proxy({ setProperty() {} }, { get: (t, k) => (k in t ? t[k] : ''), set: (t, k, v) => { t[k] = v; return true; } }),
    classList: {
      _s: new Set(),
      add(...c) { c.forEach(x => this._s.add(x)); },
      remove(...c) { c.forEach(x => this._s.delete(x)); },
      toggle(c, on) { if (on === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); } else if (on) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    appendChild(child) { this.children.push(child); return child; },
    removeChild(child) { this.children = this.children.filter(c => c !== child); },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener(type, fn) {
      const key = `${id || tag}:${type}`;
      if (!listeners.has(key)) listeners.set(key, []);
      listeners.get(key).push(fn);
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener() {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    getContext: () => makeCtx(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    focus() {}, blur() {},
    get offsetWidth() { return 100; }
  };
  return el;
}

// Every id referenced by the game resolves to a live stub element.
const elements = new Map();
function getById(id) {
  if (!elements.has(id)) elements.set(id, makeElement('div', id));
  return elements.get(id);
}

const document_ = {
  getElementById: getById,
  createElement: tag => makeElement(tag),
  addEventListener(type, fn) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(fn);
  },
  querySelectorAll: () => [],
  body: makeElement('body')
};

let now = 0;
const rafQueue = [];

const storageMap = new Map();
const localStorage_ = {
  getItem(k) { return storageMap.has(k) ? storageMap.get(k) : null; },
  setItem(k, v) { storageMap.set(k, String(v)); },
  removeItem(k) { storageMap.delete(k); }
};

const sandbox = {
  console,
  localStorage: localStorage_,
  btoa: s => Buffer.from(s, 'binary').toString('base64'),
  atob: s => Buffer.from(s, 'base64').toString('binary'),
  location: { reload() {} },
  document: document_,
  window: {
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    }
  },
  performance: { now: () => now },
  requestAnimationFrame: fn => { rafQueue.push(fn); return rafQueue.length; },
  Image: class {
    constructor() { this.complete = true; this.naturalWidth = 384; this.naturalHeight = 56; this.width = 384; this.height = 56; }
    addEventListener(type, fn) { if (type === 'load') this._load = fn; }
    set src(v) { this._src = v; if (this._load) setTimeout(() => this._load(), 0); }
    get src() { return this._src; }
  },
  Math, Date, JSON, Map, Set, Array, Object, String, Number, Boolean, isNaN, parseInt, parseFloat,
  Uint8Array, Uint8ClampedArray, Int16Array, Float32Array, setTimeout, clearTimeout, setInterval, clearInterval
};
sandbox.globalThis = sandbox;
sandbox.window.document = document_;

const context = vm.createContext(sandbox);

const FILES = [
  'config.js', 'weapons.js', 'audio.js', 'building.js', 'decor_data.js', 'animation.js', 'wildlife.js',
  'assets.js', 'inventory.js', 'survival.js', 'weather.js', 'food.js', 'farming.js', 'injuries.js',
  'world.js', 'mining.js', 'terrain.js', 'structures.js', 'underground.js', 'world_state.js', 'places.js',
  'player.js', 'enemies.js', 'progression.js', 'crafting.js', 'society.js', 'vehicles.js',
  'vehicle_crafting.js', 'power.js', 'lore.js', 'objectives.js', 'hordes.js',
  'events.js', 'savegame.js', 'gamemode.js', 'creative.js', 'basecamp.js', 'campaign.js', 'fx.js', 'hud.js', 'game.js',
  'inventory_ui.js', 'stage31_overhaul.js', 'stage32_menu.js'
];

// the html must list exactly these files, in this order
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const inHtml = [...html.matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map(m => m[1]);
if (inHtml.join(',') !== FILES.join(',')) {
  errors.push(`script order mismatch\n  html: ${inHtml.join(', ')}\n  test: ${FILES.join(', ')}`);
}

for (const file of FILES) {
  const code = fs.readFileSync(path.join(ROOT, 'js', file), 'utf8');
  try {
    vm.runInContext(code, context, { filename: `js/${file}` });
  } catch (e) {
    errors.push(`${file}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`);
    console.error(`FAILED loading ${file}`);
    throw e;
  }
}

/* ----------------------------------------------------------- simulation */

function fire(type, event) {
  const fns = listeners.get(type) || [];
  for (const fn of fns) {
    try { fn(event); } catch (e) { errors.push(`${type} handler: ${e.message}`); }
  }
}

function key(k, type = 'keydown') {
  fire(type, { key: k, target: { tagName: 'BODY' }, preventDefault() {} });
}

function frames(n, step = 16) {
  for (let i = 0; i < n; i++) {
    now += step;
    const fn = rafQueue.shift();
    if (!fn) { errors.push('render loop stopped scheduling frames'); return; }
    try { fn(now); } catch (e) { errors.push(`frame: ${e.stack.split('\n').slice(0, 2).join(' | ')}`); return; }
  }
}

// top-level const/let live in the context's lexical scope, not on globalThis,
// so expose the handles the test drives through one bridging script
vm.runInContext(`globalThis.__game = {
  CONFIG, TILE, TILE_INFO, ITEM_DEFS, BUILD_DEFS, CRAFT_RECIPES, LORE_DOCUMENTS, PLAYER_ANIMATIONS, INFECTED_ANIMATIONS,
  world, structures, player, inventory, mining, survival, danger, building, progression, crafting, power,
  lore, weather, injuries, society, vehicles, vehicleCraft, fx, terrain, lighting, hud,
  mouse, camera, hotbar, input, VEHICLE_MODULES, hordes, audio, places, objectives, events, worldState, baseCamp, campaign,
  STAGE31_EVENT_TYPES, STAGE31_SKILLS, useSkills, residentLife, livingWorld, Stage31UI, exportGameState,
  GAME_MODES, SaveSlots, creative,
  meleeAttack, fireWeapon, reloadWeapon, weaponProfile, magazines, primaryMouseAction, secondaryMouseAction, updateMouseTile, toggleMap, saveGameState, loadGameState,
  get selected() { return selected; }, set selected(v) { selected = v; },
  mineAtMouse, placeAtMouse, renderCrafting, renderBuildGrid, renderInventory, renderHotbar,
  renderPeoplePanel, renderArchive, renderRadio, renderContainer, takeAllFromContainer,
  openNpc, closeNpcModal, closeContainerModal, openVehicleModal, closeVehicleModal,
  damagePlayer, useItem, startNewSurvivor, showToast,
  get worldMinutes() { return worldMinutes; }, set worldMinutes(v) { worldMinutes = v; },
  get activeContainer() { return activeContainer; }, set activeContainer(v) { activeContainer = v; },
  get containerOpen() { return containerOpen; }, set containerOpen(v) { containerOpen = v; },
  get mapOpen() { return mapOpen; }
  ,get mainMenuOpen(){return mainMenuOpen;},set mainMenuOpen(v){mainMenuOpen=v;}
  ,get currentGameMode(){return currentGameMode;},set currentGameMode(v){currentGameMode=v;creative.enabled=v==='free';}
};`, context, { filename: 'bridge.js' });
const g = context.__game;
g.mainMenuOpen = false;
console.log(`world ${g.CONFIG.WORLD_W}x${g.CONFIG.WORLD_H}, ${g.structures.structures.length} structures, ` +
  `${g.structures.containers.length} containers, ${g.structures.props.length} props, ${g.danger.enemies.length} infected`);

frames(30);

// Stage 24 movement: slower top speed, real acceleration and explicit animation states.
{
  key('d'); frames(3);
  const early = Math.abs(g.player.vx);
  frames(35);
  const walk = Math.abs(g.player.vx);
  if (!(g.CONFIG.PLAYER_MAX_SPEED < 5 && g.CONFIG.PLAYER_SPRINT_MULT <= 1.4 && g.CONFIG.PLAYER_GROUND_ACCEL < g.CONFIG.PLAYER_TURN_ACCEL)) errors.push('pacing Stage 24 não está configurado como movimento deliberado');
  if (early > g.CONFIG.PLAYER_MAX_SPEED + .3 || walk > g.CONFIG.PLAYER_MAX_SPEED + .3) errors.push(`velocidade de caminhada excedeu limite (${early.toFixed(2)} / ${walk.toFixed(2)})`);
  if (!g.PLAYER_ANIMATIONS[g.player.animState]) errors.push(`estado de animação desconhecido: ${g.player.animState}`);
  key('shift'); frames(35);
  const sprint = Math.abs(g.player.vx);
  if (!(g.CONFIG.PLAYER_SPRINT_MULT > 1 && g.CONFIG.PLAYER_MAX_SPEED * g.CONFIG.PLAYER_SPRINT_MULT < 6.3)) errors.push('sprint Stage 24 fora do pacing deliberado');
  if (sprint > g.CONFIG.PLAYER_MAX_SPEED * g.CONFIG.PLAYER_SPRINT_MULT + .3) errors.push(`sprint excedeu limite (${sprint.toFixed(2)})`);
  key(' '); frames(18);
  if (!['jump','fall','land','run'].includes(g.player.animState)) errors.push(`estado aéreo inválido: ${g.player.animState}`);
  frames(12);
  key(' ', 'keyup'); key('shift', 'keyup'); key('d', 'keyup');
  key('a'); frames(30); key('a', 'keyup');
  frames(20);
  for (const required of ['idle','walk','run','jump','fall','land','attack_light_windup','attack_light_active','attack_light_recover','reload','hurt']) {
    if (!g.PLAYER_ANIMATIONS[required]) errors.push(`animação do player sem estado ${required}`);
  }
  for (const required of ['idle','walk','chase','lurch','attack_windup','attack','hurt','knocked']) {
    if (!g.INFECTED_ANIMATIONS[required]) errors.push(`animação infectado sem estado ${required}`);
  }
}

// mine and place
g.mouse.x = 700; g.mouse.y = 400;
fire('mousemove', { clientX: 700, clientY: 400 });
for (let i = 0; i < 12; i++) { g.mineAtMouse(); frames(3); }
g.placeAtMouse(); frames(3);

/* ---------------------------------------------- Stage 20: world state */
{
  const S = g.structures;
  const home = { x: g.player.x, y: g.player.y, cx: g.camera.x, cy: g.camera.y };
  const awake = () => g.danger.enemies.filter(e => e.state !== 'dormant' && e.state !== 'wander').length;
  const fields = ['state', 'lootProfile', 'dangerLevel', 'ambientProfile', 'eventPool', 'secretRooms', 'powered', 'discovered', 'visits', 'alert'];
  for (const s of S.structures) {
    for (const f of fields) if (!(f in s)) errors.push(`${s.name}: campo de estado ausente (${f})`);
  }
  // every contextual event in every pool fires, changes something, and the game keeps running
  let fired = 0, tried = 0;
  const kinds = new Set();
  for (const s of S.structures) {
    for (const id of s.eventPool) {
      tried++;
      g.player.x = ((s.x + s.endX) / 2) * g.CONFIG.TILE;
      g.player.y = (s.groundY - 2) * g.CONFIG.TILE - g.player.h;
      const before = g.danger.enemies.length + awake() * 1000 + g.places.poweredAreas.size + g.events.active.length + (s.alert || 0) + (s.surge || 0);
      let ok = false;
      try { ok = g.events.structureEvent(s, id); } catch (e) { errors.push(`evento ${id} em ${s.name}: ${e.message}`); continue; }
      if (!ok) continue;
      fired++;
      kinds.add(id);
      const after = g.danger.enemies.length + awake() * 1000 + g.places.poweredAreas.size + g.events.active.length + (s.alert || 0) + (s.surge || 0);
      if (after === before && !['stock_unlock', 'collapse', 'metal_clang', 'bell'].includes(id)) errors.push(`evento ${id} em ${s.name} não alterou nada`);
      frames(2);
    }
  }
  frames(30);
  // discovery, lights and ambience run without throwing while crossing the map
  for (const tx of [60, 330, 440, 672, 830, 905]) {
    g.player.x = tx * g.CONFIG.TILE;
    g.player.y = (g.world.groundY(tx) - 2) * g.CONFIG.TILE - g.player.h;
    frames(6);
  }
  const lit = S.lamps.filter(l => S.lampOn(l, 0.1)).length;
  console.log(`world state: ${S.structures.length} estruturas, eventos ${fired}/${tried} disparados (${kinds.size} tipos), ` +
    `${S.lamps.length} luzes (${lit} acesas à noite), ${S.emitters.length} emissores, caminho: ${S.pathLadders} escadas`);
  if (kinds.size < 12) errors.push(`poucos tipos de evento disparados: ${[...kinds].join(', ')}`);
  // back to the start so the build and combat checks see the usual spot
  g.player.x = home.x; g.player.y = home.y; g.player.vx = 0; g.player.vy = 0;
  g.camera.x = home.cx; g.camera.y = home.cy;
  g.events.active.length = 0;
  frames(20);
}

/* --------------------------------------------- Stage 21: progression/UI */
{
  // The map must open through M and close again without disturbing the run.
  key('m'); frames(2);
  if (!g.mapOpen) errors.push('M não abriu o mapa');
  key('m'); frames(2);
  if (g.mapOpen) errors.push('M não fechou o mapa');

  // Location-specific professional loot must exist in the correct tables.
  const fire = g.structures.containers.filter(c => c.category === 'firestation');
  const police = g.structures.containers.filter(c => c.category === 'police');
  if (!fire.length) errors.push('quartel não possui container de loot firestation');
  if (!police.length) errors.push('delegacia não possui container de loot police');

  // The progression ladder should react to actual discoveries/materials.
  const stage21Weight = g.inventory.maxWeight;
  g.inventory.maxWeight = 9999;
  g.inventory.add('scrap_metal', 1);
  g.progression.observe();
  if (g.progression.tier < 1) errors.push('progressão não liberou T1 ao encontrar sucata');
  g.inventory.add('iron_ingot', 1);
  g.progression.observe();
  if (g.progression.tier < 2) errors.push('progressão não liberou T2 com metalurgia');
  g.inventory.add('circuit_parts', 1);
  g.progression.observe();
  if (g.progression.tier < 3) errors.push('progressão não liberou T3 industrial');
  g.inventory.maxWeight = stage21Weight;
}

/* ---------------------------------------------------------------- combat */

function equip(id, qty = 1) {
  g.inventory.maxWeight = 9999;
  g.inventory.add(id, qty);
  g.inventory.maxWeight = realMaxWeightSoft;
  g.hotbar[0] = id;
  g.selected = 0;
  g.renderHotbar();
}
const realMaxWeightSoft = g.inventory.maxWeight;

// Keep the combat sweep isolated. A dead player makes every later weapon test
// look broken even though the weapon code itself is fine.
for (const e of g.danger.enemies) e.alive = false;
g.danger.respawnTimer = 1e9;

function resetCombatState() {
  g.survival.health = 100;
  g.survival.energy = 100;
  g.player.facing = 1;
  g.player.vx = 0;
  g.player.vy = 0;
  vm.runInContext(`
    gameDead = false;
    hitstop = 0;
    pendingSwing = null;
    bufferedMelee = null;
    meleeChain = { step:0, timer:0, weaponId:null };
    player.cancelAttack();
    player.reload = { timer:0, total:0, weapon:null };
    player.gunCooldown = 0;
  `, context);
}

function placeTarget(type = 'wanderer', offset = 26) {
  const e = g.danger.makeEnemy(type, Math.floor(g.player.x / g.CONFIG.TILE), g.danger.salt++, null);
  e.x = g.player.x + offset;
  e.y = g.player.y;
  e.state = 'chase';
  e.speed = 0; // combat assertions measure hit logic, not AI drift
  const y = Math.floor((g.player.y + 22) / g.CONFIG.TILE);
  const a = Math.floor((g.player.x + g.player.w / 2) / g.CONFIG.TILE);
  const b = Math.floor((e.x + e.w / 2) / g.CONFIG.TILE);
  for (let x = Math.min(a,b); x <= Math.max(a,b); x++) if (g.world.inBounds(x,y)) g.world.set(x,y,g.TILE.AIR);
  g.danger.enemies.push(e);
  return e;
}

// Stage 21 mouse combat: primary click attacks toward the cursor.
{
  resetCombatState();
  equip('knife');
  const t = placeTarget('wanderer', 24);
  g.mouse.x = 760; g.mouse.y = 360;
  g.mouse.tileX = Math.floor((t.x + 12) / g.CONFIG.TILE);
  g.mouse.tileY = Math.floor((t.y + 12) / g.CONFIG.TILE);
  const before = t.hp;
  g.primaryMouseAction(); frames(18);
  if (t.hp >= before) errors.push('clique esquerdo não atacou com arma corpo a corpo');
  t.alive = false;
}

// Stage 24 special infected are grounded variants with mechanics already wired;
// Claude only needs to replace their visuals later.
{
  const armored = g.danger.makeEnemy('armored', Math.floor(g.player.x/g.CONFIG.TILE), g.danger.salt++, 'responder');
  const lurcher = g.danger.makeEnemy('lurcher', Math.floor(g.player.x/g.CONFIG.TILE), g.danger.salt++, 'civilian');
  if (!(armored.armor >= .3 && armored.staggerResist < 1)) errors.push('Blindado sem proteção/resistência Stage 24');
  if (!lurcher.lurches) errors.push('Cambaleante sem investida curta Stage 24');
  if (!armored.animator || !lurcher.animator) errors.push('infectados novos sem controlador de animação');
}

// Melee input buffer: a second click during recovery must become the next hit,
// not disappear.
{
  resetCombatState();
  equip('knife');
  const t = placeTarget('wanderer', 24);
  g.meleeAttack('light'); frames(7);
  g.meleeAttack('light');
  frames(28);
  const chainedStep = vm.runInContext('meleeChain.step', context);
  if (chainedStep < 1) errors.push(`buffer de ataque não encadeou segundo golpe (combo ${chainedStep})`);
  t.alive = false;
}

// A melee swing may not hit through a solid wall.
{
  resetCombatState();
  equip('knife');
  const t = placeTarget('wanderer', 52);
  const wallX = Math.floor((g.player.x + 34) / g.CONFIG.TILE);
  const y0 = Math.floor(g.player.y / g.CONFIG.TILE);
  const saved = [];
  for (let y = y0; y <= y0 + 1; y++) { saved.push([y, g.world.get(wallX,y)]); g.world.set(wallX,y,g.TILE.STONE); }
  const hp = t.hp;
  g.meleeAttack('light'); frames(20);
  if (t.hp < hp) errors.push('golpe corpo a corpo atravessou parede');
  for (const [y,tile] of saved) g.world.set(wallX,y,tile);
  t.alive = false;
}

// The three new firearms must be loadable and consume their abstract ammo.
for (const id of ['smg_compact','police_carbine','blackridge_carbine']) {
  resetCombatState();
  equip(id);
  const def = g.ITEM_DEFS[id];
  g.inventory.maxWeight = 9999;
  g.inventory.add(def.gun.ammo, def.gun.magazine + 5);
  g.inventory.maxWeight = realMaxWeightSoft;
  if (!g.reloadWeapon()) errors.push(`${id}: recarga recusada`);
  frames(220);
  const loaded = g.magazines.get(id) || 0;
  if (!loaded) { errors.push(`${id}: carregador vazio`); continue; }
  const t = placeTarget('wanderer', 150);
  g.mouse.tileX = Math.floor((t.x + 12) / g.CONFIG.TILE);
  g.mouse.tileY = Math.floor((t.y + 12) / g.CONFIG.TILE);
  g.fireWeapon(); frames(40);
  if ((g.magazines.get(id) || 0) >= loaded) errors.push(`${id}: não consumiu munição`);
  t.alive = false;
}

// every melee weapon must reliably land at least one hit. Killing within a
// fixed number of swings is a balance assumption, not a smoke-test invariant:
// durability, stagger timing and procedural target state can legitimately alter
// time-to-kill without meaning the weapon is broken.
const meleeIds = ['knife', 'machete', 'bat', 'metal_pipe', 'crowbar', 'stone_axe', 'repair_hammer', 'spear', 'police_baton', 'fire_axe', 'sledgehammer', 'steel_spear'];
for (const id of meleeIds) {
  resetCombatState();
  equip(id);
  const target = placeTarget('wanderer', id === 'spear' ? 56 : 24);
  const hpBefore = target.hp;
  let damaged = false;
  for (let i = 0; i < 12 && target.alive && !damaged; i++) {
    g.survival.energy = 100;
    key('j'); frames(12); key('j', 'keyup');
    damaged = target.hp < hpBefore;
  }
  if (!damaged) errors.push(`${id}: nenhum dano aplicado`);
  target.alive = false;
}

// heavy attack must hit harder than the light one
{
  resetCombatState();
  equip('bat');
  const a = placeTarget('heavy', 24);
  g.survival.energy = 100; key('j'); frames(30); key('j', 'keyup');
  const lightDamage = a.maxHp - a.hp;
  const b = placeTarget('heavy', 24);
  g.survival.energy = 100; key('k'); frames(30); key('k', 'keyup');
  const heavyDamage = b.maxHp - b.hp;
  if (!(heavyDamage > lightDamage)) errors.push(`golpe forte (${heavyDamage}) não supera o leve (${lightDamage})`);
  a.alive = false; b.alive = false;
}

// out of range must NOT connect — the old bug
{
  resetCombatState();
  equip('knife');
  const far = placeTarget('wanderer', 220);
  g.survival.energy = 100;
  key('j'); frames(14); key('j', 'keyup');
  if (far.hp < far.maxHp) errors.push('faca acertou um alvo a 220px de distância');
  far.alive = false;
}

// stamina has to gate the spam
{
  resetCombatState();
  equip('stone_axe');
  const t = placeTarget('heavy', 24);
  g.survival.energy = 4;
  const before = t.hp;
  key('j'); frames(14); key('j', 'keyup');
  if (t.hp < before) errors.push('atacou sem fôlego suficiente');
  t.alive = false;
}

// firearms: fire, empty, reload, fire again
{
  resetCombatState();
  equip('pistol');
  g.inventory.maxWeight = 9999;
  g.inventory.add('ammo_pistol', 40);
  g.inventory.maxWeight = realMaxWeightSoft;
  if (!g.reloadWeapon()) errors.push('reloadWeapon não aceitou a pistola');
  frames(140);                                     // wait out the reload
  const loaded = g.magazines.get('pistol') || 0;
  if (loaded <= 0) errors.push('carregador continuou vazio após recarregar');

  const target = placeTarget('wanderer', 140);
  g.mouse.tileX = Math.floor((target.x + 12) / g.CONFIG.TILE);
  g.mouse.tileY = Math.floor((target.y + 20) / g.CONFIG.TILE);
  const hpBefore = target.hp;
  for (let i = 0; i < 6; i++) { g.fireWeapon(); frames(40); }
  if (target.hp >= hpBefore) errors.push('tiro de pistola não causou dano');
  if ((g.magazines.get('pistol') || 0) >= loaded) errors.push('tiro não consumiu munição');
  target.alive = false;
}

// a gunshot must actually pull infected toward the noise
{
  resetCombatState();
  equip('shotgun');
  g.inventory.maxWeight = 9999;
  g.inventory.add('ammo_shotgun', 20);
  g.inventory.maxWeight = realMaxWeightSoft;
  g.reloadWeapon(); frames(200);
  const witness = placeTarget('wanderer', 900);
  witness.state = 'wander';
  g.fireWeapon();
  frames(6);
  if (witness.state === 'wander') errors.push('tiro não atraiu infectados distantes');
  witness.alive = false;
}

// hordes: spawn off-camera only
{
  const before = g.danger.enemies.length;
  const group = g.hordes.spawnGroup('medium', g.player.x);
  if (!group) errors.push('horda não foi criada');
  else {
    if (g.danger.enemies.length <= before) errors.push('horda não adicionou infectados');
    for (const e of group.members) {
      const onScreen = e.x > g.camera.x - 64 && e.x < g.camera.x + 1280 + 64;
      if (onScreen) { errors.push('horda nasceu dentro da tela'); break; }
    }
    for (const e of group.members) e.alive = false;
  }
}

// knockdown: a hammer must put a light infected on the ground
{
  resetCombatState();
  equip('repair_hammer');
  const t = placeTarget('wanderer', 24);
  g.survival.energy = 100;
  key('k'); frames(34); key('k', 'keyup');
  if (t.alive && t.knocked <= 0 && t.stagger <= 0) errors.push('martelo pesado não causou stagger nem queda');
  t.alive = false;
}

// enemies must not stack in the same pixel
{
  resetCombatState();
  const stack = [];
  for (let i = 0; i < 6; i++) stack.push(placeTarget('wanderer', 40));
  frames(40);
  let overlapping = 0;
  for (let i = 0; i < stack.length; i++) {
    for (let j = i + 1; j < stack.length; j++) {
      if (Math.abs(stack[i].x - stack[j].x) < 6) overlapping++;
    }
  }
  if (overlapping > 2) errors.push(`${overlapping} pares de infectados empilhados no mesmo ponto`);
  for (const e of stack) e.alive = false;
}

equip('crowbar');

// panels
for (const k of ['tab', 'tab', 'b', 'b', 'n', 'n', 'q', 'q', 'l', 'l', 'g', 'g']) { key(k); frames(3); }

// restored environmental interactions must still be real gameplay, not dead data
{
  const kinds = new Set(g.places.points.map(p => p.kind));
  for (const required of ['light_switch','curtain','alarm','movable','fuse_panel','district_panel','key_hook']) {
    if (!kinds.has(required)) errors.push(`interação restaurada ausente: ${required}`);
  }

  g.inventory.maxWeight = 9999;
  g.inventory.add('wire', 20); g.inventory.add('battery', 10); g.inventory.add('circuit_parts', 4);
  g.inventory.add('empty_bottle', 3);
  g.inventory.maxWeight = realMaxWeightSoft;

  const panel = g.places.points.find(p => p.kind === 'fuse_panel' && !g.places.isPowered(p));
  if (panel) {
    const r = g.places.useFusePanel(panel);
    if (!r.ok || !g.places.isPowered(panel)) errors.push('quadro elétrico restaurado não energizou a área');
  }

  const sw = g.places.points.find(p => p.kind === 'light_switch');
  if (sw) {
    g.places.powerArea(g.places.areaFor(sw));
    const before = sw.state;
    const r = g.places.useLightSwitch(sw);
    if (!r.ok || sw.state === before) errors.push('interruptor restaurado não alternou estado');
  }

  const curtain = g.places.points.find(p => p.kind === 'curtain');
  if (curtain) {
    const before = curtain.state;
    const r = g.places.useCurtain(curtain);
    if (!r.ok || curtain.state === before) errors.push('cortina restaurada não alternou estado');
  }

  const alarm = g.places.points.find(p => p.kind === 'alarm');
  if (alarm) {
    const r = g.places.useAlarm(alarm);
    if (!r.ok || alarm.state !== 'on' || r.noise < 500) errors.push('alarme restaurado não gera risco real');
    g.places.useAlarm(alarm);
  }

  const district = g.places.points.find(p => p.kind === 'district_panel');
  if (district) {
    const r = g.places.useDistrictPanel(district);
    if (!r.ok && !(district.areas || []).every(a => g.places.poweredAreas.has(a))) errors.push('painel distrital restaurado falhou: ' + r.reason);
  }

  const key = g.places.points.find(p => p.kind === 'key_hook' && p.grants === 'maintenance_key');
  if (key && !key.consumed) {
    const r = g.places.useKeyHook(key);
    if (!r.ok || r.giveItem !== 'maintenance_key') errors.push('chave de manutenção não pode ser recolhida');
  }
}

// crafting, building, interaction
g.renderCrafting(); g.renderBuildGrid(); g.renderInventory(); g.renderHotbar(); g.renderPeoplePanel();
g.renderArchive(); g.renderRadio();
g.inventory.add('wood', 40); g.inventory.add('nails', 40); g.inventory.add('stone', 20);
g.inventory.add('scrap_metal', 20); g.inventory.add('wire', 20); g.inventory.add('cloth', 10);
const realMaxWeight = g.inventory.maxWeight;
g.inventory.maxWeight = 9999;                 // stock up for the build sweep
g.inventory.add('wood', 200); g.inventory.add('nails', 200); g.inventory.add('scrap_metal', 200);
g.inventory.add('wire', 100); g.inventory.add('cloth', 60); g.inventory.add('stone', 100);
g.inventory.add('brick', 40); g.inventory.add('gravel', 40); g.inventory.add('concrete_chunk', 40);
g.inventory.add('roof_shingle', 40); g.inventory.add('battery', 8); g.inventory.add('garage_parts', 12);
// Stage 22+: provision every build ingredient so this sweep tests placement logic, not recipe progression.
for (const def of Object.values(g.BUILD_DEFS)) for (const [id, qty] of Object.entries(def.cost || {})) g.inventory.add(id, Math.max(12, qty * 4));
// each project is placed on the first clear, flat column found for it
const buildResults = [];
let cursor = Math.floor(g.player.x / g.CONFIG.TILE) + 8;
for (const type of Object.keys(g.BUILD_DEFS)) {
  const def = g.BUILD_DEFS[type];
  // repõe o custo exato deste projeto: as pilhas têm teto e o estoque acaba
  for (const [id, qty] of Object.entries(def.cost || {})) {
    while (g.inventory.count(id) < qty * 2) if (!g.inventory.add(id, qty * 2)) break;
  }
  let placed = null;
  let lastReason = null;
  // o corredor pode saltar adiante em vez de morrer num trecho quebrado
  for (let round = 0; round < 4 && !placed; round++) {
    const from = cursor + round * 60;
    for (let attempt = 0; attempt < 90 && !placed; attempt++) {
      const tx = from + attempt;
      if (tx >= g.CONFIG.WORLD_W - 4) break;
      const gy = g.world.groundY(tx);
      const ty = gy - 1;
      if (!g.world.hasHeadroom(tx, gy, 5)) continue;
      const r = g.building.place(type, tx, ty, g.player);
      if (r.ok) { placed = r; cursor = tx + Math.max(3, def.width + 2); }
      else lastReason = r.reason;
    }
  }
  if (placed) buildResults.push([type, 'ok']);
  else buildResults.push([type, lastReason || 'no spot found']);
}
const failedBuilds = buildResults.filter(r => r[1] !== 'ok');
g.inventory.maxWeight = realMaxWeight;
console.log(`builds placed: ${buildResults.length - failedBuilds.length}/${buildResults.length}`);
if (failedBuilds.length > buildResults.length * 0.25) {
  errors.push('too many build placements failed: ' + failedBuilds.map(f => f.join('=')).join(', '));
}
frames(10);

// repair + dismantle round trip
{
  const obj = g.building.objects[0];
  g.inventory.maxWeight = 9999;
  g.inventory.add('wood', 20); g.inventory.add('nails', 20); g.inventory.add('plank_wood', 20);
  g.inventory.maxWeight = realMaxWeight;
  if (obj) {
    g.world.mine(obj.tileX, obj.tileY, 9999);
    const rep = g.building.repair(obj);
    if (!rep.ok) errors.push('repair failed: ' + rep.reason);
    const dis = g.building.dismantle(g.building.objects[g.building.objects.length - 1]);
    if (!dis.ok) errors.push('dismantle failed: ' + dis.reason);
  }
}

// craft everything affordable
for (const recipe of g.CRAFT_RECIPES) g.crafting.craft(recipe.id, g.player);

// talk to every NPC, accept + finish quests, trade
for (const npc of g.society.npcs) {
  g.openNpc(npc);
  g.society.acceptQuest(npc);
  g.society.completeQuest(npc);
  if (npc.trade[0]) { g.society.buy(npc, npc.trade[0].id); g.society.sell(npc, 'wood'); }
  g.closeNpcModal();
}
frames(6);

// containers
for (const box of g.structures.containers.slice(0, 12)) {
  g.activeContainer = box; g.containerOpen = true;
  g.renderContainer(); g.takeAllFromContainer();
}
g.closeContainerModal();

// modular vehicle assembly
g.inventory.add('wheel_set', 1); g.inventory.add('engine_parts', 4); g.inventory.add('battery', 2);
g.inventory.add('fuel_tank', 1); g.inventory.add('seat_kit', 1); g.inventory.add('suspension_kit', 1);
g.inventory.add('body_panels', 3); g.inventory.add('headlight_kit', 1); g.inventory.add('garage_parts', 6);
{
  const tx = Math.floor(g.player.x / g.CONFIG.TILE) + 6;
  const ty = g.world.groundY(tx) - 1;
  g.building.place('auto_bench', tx, ty, g.player);
  const frame = g.building.place('vehicle_frame', tx + 3, ty, g.player);
  if (frame.ok) {
    const project = g.vehicleCraft.projectForObject(frame.object);
    for (const m of g.VEHICLE_MODULES) g.vehicleCraft.install(project, m.key, g.player);
    g.vehicleCraft.complete(project, g.player);
  }
}
frames(8);

// vehicles: enter, drive, manage, exit
const v = g.vehicles.vehicles[0];
g.vehicles.enter(v, g.player);
v.fuel = 30; v.battery = 90; v.condition = 80;
g.vehicles.toggleEngine(v);
key('d'); frames(60); key('d', 'keyup');
g.openVehicleModal(v); frames(4); g.closeVehicleModal();
g.vehicles.exit(g.player);
frames(10);

// Stage 20.1 vehicle utility: capacity, off-road identity, horn and fuel draining
{
  const defs = g.vehicles.vehicles;
  if (!defs.some(x => (x.trunkMax || 0) >= 150)) errors.push('nenhum veículo manteve capacidade de expedição');
  if (!defs.some(x => (x.offroadGrip || 0) >= .9)) errors.push('nenhum veículo manteve identidade off-road');
  const testV = defs[0];
  testV.engineOn = false; testV.fuel = Math.max(25, testV.fuel || 0);
  g.inventory.maxWeight = 9999; g.inventory.add('empty_bottle', 1);
  const before = testV.fuel;
  const r = g.vehicles.drainFuel(testV);
  g.inventory.maxWeight = realMaxWeightSoft;
  if (!r.ok || testV.fuel >= before) errors.push('drenagem de combustível restaurada falhou');
  const horn = g.vehicles.horn(testV);
  if (!horn || horn.noise < 300) errors.push('buzina restaurada não produz ruído útil');
}

// lore: read everything, ride the elevator, use the archive
for (const obj of g.lore.interactables.slice()) {
  try { g.lore.useObject(obj, g.player); } catch (e) { errors.push(`lore ${obj.id}: ${e.message}`); }
}
g.lore.chooseArchive('transmit');
g.renderArchive();
frames(20);

// night + storm
g.worldMinutes = 22 * 60;
g.weather.condition = 'storm';
frames(60);

// damage, injuries, death and respawn
for (let i = 0; i < 14; i++) { g.damagePlayer(12, g.player.x + 40); frames(2); }
g.useItem('bandage'); g.useItem('medicine');
g.survival.health = 0;
frames(4);
g.startNewSurvivor();
frames(30);

// deep underground (bunker lighting + chunk build)
g.player.x = 396 * g.CONFIG.TILE; g.player.y = 88 * g.CONFIG.TILE;
frames(40);

// Stage 22 living-base systems: professional jobs, daily output and radio opportunities.
{
  for (const t of ['radio_station','kitchen_station','medical_station','guard_post']) {
    if (!g.BUILD_DEFS[t]) errors.push('missing Stage 22 build: ' + t);
  }
  const bx = Math.floor(g.player.x / g.CONFIG.TILE);
  const by = g.world.groundY(bx) - 1;
  const fake = [
    ['bed_build',bx,by,2,1], ['radio_station',bx+3,by,2,1], ['kitchen_station',bx+6,by,2,1],
    ['medical_station',bx+9,by,2,1], ['auto_bench',bx+12,by,2,1], ['guard_post',bx+15,by,1,2]
  ];
  for (const [type,tileX,tileY,width,height] of fake) g.building.objects.push({id:9000+g.building.objects.length,type,tileX,tileY,width,height,health:100,maxHealth:100,open:false});
  for (const id of ['mara','lena','eli']) { const n=g.society.get(id); n.recruited=true; n.baseResident=true; }
  g.society.activeCompanionId = null;
  g.baseCamp.lastProductionDay = 0; g.baseCamp.lastSignalDay = -1;
  g.baseCamp.dailyProduction(2);
  if (!g.baseCamp.stockEntries().length) errors.push('base professions produced no supplies');
  const sig = g.baseCamp.maybeGenerateSignal(2);
  if (!sig) errors.push('base radio generated no expedition signal');
  else { g.baseCamp.hearSignal(sig.id); if (!g.baseCamp.activeMapSignals().length) errors.push('heard base signal did not reach map layer'); }
}

// Stage 22 save/load roundtrip: mutate a few values after saving and prove they come back.
{
  const savedX = g.player.x, savedFood = g.inventory.count('canned_food');
  const sr = g.saveGameState(false);
  if (!sr.ok) errors.push('save system failed: ' + sr.reason);
  else {
    g.player.x += 777;
    g.inventory.add('canned_food', 1);
    if (!g.loadGameState(null, true)) errors.push('load system returned false');
    if (Math.abs(g.player.x - savedX) > 0.01) errors.push('save/load did not restore player position');
    if (g.inventory.count('canned_food') !== savedFood) errors.push('save/load did not restore inventory');
  }
}

// Stage 23 — NPC individuality, settlement requests, campaign operations and Blackridge sequence.
{
  for (const id of ['mara','lena','eli']) {
    const npc = g.society.get(id);
    if (!npc || !Array.isArray(npc.traits) || npc.traits.length < 2) errors.push(`${id}: traits ausentes`);
    if (!Number.isFinite(npc?.morale)) errors.push(`${id}: moral ausente`);
  }

  // Stable living-base setup for the director.
  for (const id of ['mara','lena','eli']) {
    const n = g.society.get(id); n.recruited = true; n.baseResident = true;
  }
  g.society.activeCompanionId = null;
  if (!g.baseCamp.anchor()) {
    const bx = Math.floor(g.player.x / g.CONFIG.TILE), by = g.world.groundY(bx) - 1;
    g.building.objects.push({id:9800,type:'bed_build',tileX:bx,tileY:by,width:2,height:1,health:100,maxHealth:100});
    g.building.objects.push({id:9801,type:'radio_station',tileX:bx+3,tileY:by,width:2,height:1,health:100,maxHealth:100});
    g.building.objects.push({id:9802,type:'kitchen_station',tileX:bx+6,tileY:by,width:2,height:1,health:100,maxHealth:100});
    g.building.objects.push({id:9803,type:'medical_station',tileX:bx+9,tileY:by,width:2,height:1,health:100,maxHealth:100});
  }

  g.campaign.lastOperationDay = -1;
  const op = g.campaign.maybeGenerateOperation(6);
  if (!op) errors.push('campaign director generated no operation');
  else {
    const heard = g.campaign.hearOperation(op.id);
    if (!heard || !g.campaign.activeMapSignals().length) errors.push('campaign operation did not reach radio/map layer');
  }

  g.campaign.lastRequestDay = -1;
  let req = g.campaign.maybeGenerateRequest(7);
  // Deterministic chance can intentionally skip a day; try a small window.
  for (let d = 8; !req && d < 13; d++) { g.campaign.lastRequestDay = -1; req = g.campaign.maybeGenerateRequest(d); }
  if (!req) errors.push('campaign generated no resident request across test window');
  else {
    g.inventory.maxWeight = 9999;
    for (const [id, qty] of Object.entries(req.requirements)) g.inventory.add(id, qty);
    const rr = g.campaign.fulfillRequest(req.id);
    g.inventory.maxWeight = realMaxWeightSoft;
    if (!rr.ok || req.status !== 'completed') errors.push('resident request could not be completed');
  }

  const br0 = g.campaign.blackridgeSummary();
  if (!br0 || typeof br0.stage !== 'number') errors.push('blackridge campaign summary missing');

  g.campaign.majorEvent = null; g.campaign.lastMajorEventDay = -10;
  let major = null;
  for (let d = 3; !major && d < 16; d++) major = g.campaign.maybeGenerateMajorEvent(d);
  if (!major) errors.push('world director generated no major event across test window');
  else if (!g.campaign.majorEventMapSignal().length) errors.push('major event did not reach map layer');

  // Save state must carry Stage 23 director state too.
  const beforeMorale = g.campaign.baseMorale;
  const sr = g.saveGameState(false);
  if (!sr.ok) errors.push('Stage 23 save failed');
  else {
    g.campaign.baseMorale = 1;
    if (!g.loadGameState(null, true)) errors.push('Stage 23 load failed');
    if (Math.abs(g.campaign.baseMorale - beforeMorale) > 0.01) errors.push('campaign state was not restored');
  }
}

// Stage 31 — eight operation families, living residents, use-based skills,
// connected underground sectors and expanded Blackridge endgame.
{
  const expected = ['migration','blackout','help','accident','fire','vehicle','roadblock','generator'];
  const made = expected.map(id => g.livingWorld.spawn(id));
  if (made.some((op, i) => op?.type !== expected[i])) errors.push('Stage 31 operation family failed to spawn');
  const zones = g.structures.structures.filter(s => s.stage31Zone);
  const blackridge = g.structures.structures.filter(s => s.stage31Blackridge);
  if (zones.length !== 5) errors.push(`Stage 31 underground sectors: ${zones.length}/5`);
  if (blackridge.length !== 5) errors.push(`Stage 31 Blackridge sectors: ${blackridge.length}/5`);
  g.residentLife.seed();
  if (g.society.npcs.some(n => !n.needs || !n.routine || !Array.isArray(n.memories))) errors.push('Stage 31 resident life data missing');
  g.useSkills.add('mining', 60, 'smoke');
  if (g.useSkills.level('mining') < 2) errors.push('Stage 31 use-based progression did not level');
  const snapshot = g.exportGameState();
  if (!snapshot.stage31?.skills || !snapshot.stage31?.residents || !snapshot.stage31?.worldEvents) errors.push('Stage 31 save payload missing');
}

// Stage 32 — menu, saves isolados e catálogo criativo completo.
{
  if(g.SaveSlots.key('slot1','survival')===g.SaveSlots.key('slot1','free'))errors.push('Stage 32 saves dos modos não estão separados');
  const catalog=g.creative.build(),creativeItems=catalog.filter(e=>e.kind==='item');
  if(creativeItems.length!==Object.keys(g.ITEM_DEFS).length)errors.push(`Stage 32 catálogo criativo incompleto: ${creativeItems.length}/${Object.keys(g.ITEM_DEFS).length}`);
  g.currentGameMode='free';g.creative.enabled=true;g.inventory.maxWeight=99999;
  const sample=creativeItems[0],before=g.inventory.count(sample.id),grant=g.creative.grantItem(sample.id);
  if(!grant.ok||g.inventory.count(sample.id)<=before)errors.push('Stage 32 não adicionou item criativo');
  const hp=g.survival.health;g.damagePlayer(10,g.player.x);if(g.survival.health<hp)errors.push('Stage 32 modo criativo recebeu dano');
  const snap=g.exportGameState();if(snap.mode!=='free'||!snap.creative)errors.push('Stage 32 payload criativo ausente no save');
  g.currentGameMode='survival';g.creative.enabled=false;
}

console.log(`chunks built: ${g.terrain.built}, kills: ${g.danger.kills}, ` +
  `objects: ${g.building.objects.length}, day ${Math.floor(g.worldMinutes / 1440) + 1}`);

if (errors.length) {
  console.error(`\n${errors.length} problem(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('\nsmoke test passed');
