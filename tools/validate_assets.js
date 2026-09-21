// LAST COUNTY — static asset validation.
// Checks every runtime image path that assets.js registers, without needing a browser.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ctx = vm.createContext({ console, Math, Map, Set, Array, Object, JSON, Uint8Array, Int16Array, Float32Array, Uint8ClampedArray, Number, String, Boolean });
for (const f of ['config.js', 'weapons.js', 'decor_data.js', 'building.js', 'animation.js', 'wildlife.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
}
const TILE_ASSET_NAMES = vm.runInContext('TILE_ASSET_NAMES', ctx);
const ITEM_DEFS = vm.runInContext('ITEM_DEFS', ctx);
const BUILD_DEFS = vm.runInContext('BUILD_DEFS', ctx);
const DECOR_SIZE = vm.runInContext('DECOR_SIZE', ctx);

const wanted = [];
for (const name of Object.values(TILE_ASSET_NAMES)) for (let v = 0; v < 3; v++) wanted.push(`assets/tiles/${name}_${v}.png`);
for (const id of Object.keys(ITEM_DEFS)) wanted.push(`assets/items/${id}.png`);
const HELD_IDS = vm.runInContext('HELD_ITEM_IDS', ctx);
for (const id of HELD_IDS) wanted.push(`assets/items/held_${id}.png`);
for (const id of Object.keys(BUILD_DEFS)) wanted.push(`assets/build/${id}.png`);
for (const id of Object.keys(DECOR_SIZE)) wanted.push(`assets/decor/${id}.png`);

wanted.push('assets/sprites/player.png');
for (const id of ['rain_jacket','wool_coat','hazmat_coat','wool_hat','respirator','work_boots','backpack','denim_jacket','utility_vest','miner_helmet','hiking_boots','rubber_boots','leather_jacket','firefighter_coat','police_vest','mechanic_overalls','hard_hat','police_jacket','police_helmet','firefighter_helmet','firefighter_boots','paramedic_jacket','ranger_jacket','blackridge_vest','blackridge_helmet']) wanted.push(`assets/sprites/player_${id}.png`);
const INFECTED_FORMS = ['wanderer','runner','stalker','heavy','screamer','lurcher','armored','contained'];
for (const ctx of ['civilian','worker','patient','responder','rural','blackridge','heavy']) {
  wanted.push(`assets/sprites/infected_${ctx}.png`);
  for (const form of INFECTED_FORMS) wanted.push(`assets/sprites/infected_${ctx}_${form}.png`);
}
for (const id of ['mara','lena','eli','jonah']) wanted.push(`assets/sprites/npc_${id}.png`);
// Stage 31 — uma folha por espécie caçável.
const WILDLIFE_SPECIES = vm.runInContext('WILDLIFE_SPECIES', ctx);
for (const id of Object.keys(WILDLIFE_SPECIES)) wanted.push(`assets/sprites/animal_${id}.png`);
for (const id of ['wander','investigate','chase']) wanted.push(`assets/ui/threat_${id}.png`);
for (const id of ['health','hunger','thirst','energy','sleep','temp','wet','exposure','noise','threat','nav_inventory','nav_vehicle','nav_build','nav_people','nav_archive','nav_clock','nav_day','nav_compass','nav_deaths','nav_radio']) wanted.push(`assets/ui/${id}.png`);

// Every frame an animation can ask for must exist inside its sheet. Reading
// the PNG header is enough — no need to decode the pixels.
function pngSize(rel) {
  const fd = fs.openSync(path.join(ROOT, rel), 'r');
  const head = Buffer.alloc(24);
  fs.readSync(fd, head, 0, 24, 0);
  fs.closeSync(fd);
  return { w: head.readUInt32BE(16), h: head.readUInt32BE(20) };
}

const PLAYER_ANIMATIONS = vm.runInContext('PLAYER_ANIMATIONS', ctx);
const PLAYER_CLOTHING_ANIMATIONS = vm.runInContext('PLAYER_CLOTHING_ANIMATIONS', ctx);
const INFECTED_ANIMATIONS = vm.runInContext('INFECTED_ANIMATIONS', ctx);
const PLAYER_SPRITE_LAYOUT = vm.runInContext('PLAYER_SPRITE_LAYOUT', ctx);
const INFECTED_SPRITE_LAYOUT = vm.runInContext('INFECTED_SPRITE_LAYOUT', ctx);
const PLAYER_HAND_FRAMES = vm.runInContext('PLAYER_HAND_FRAMES', ctx);

const maxFrame = defs => Math.max(...Object.values(defs).flatMap(d => d.frames));
const outOfRange = [];
function checkSheet(rel, layout, need) {
  if (!fs.existsSync(path.join(ROOT, rel))) return;
  const { w, h } = pngSize(rel);
  const have = Math.floor(w / layout.frameW);
  if (have <= need || h < layout.frameH) outOfRange.push(`${rel}: ${have} frames (${w}x${h}), animations need ${need + 1}`);
}

const playerNeed = Math.max(maxFrame(PLAYER_ANIMATIONS), maxFrame(PLAYER_CLOTHING_ANIMATIONS));
checkSheet('assets/sprites/player.png', PLAYER_SPRITE_LAYOUT, playerNeed);
for (const id of ['rain_jacket','wool_coat','hazmat_coat','wool_hat','respirator','work_boots','backpack','denim_jacket','utility_vest','miner_helmet','hiking_boots','rubber_boots','leather_jacket','firefighter_coat','police_vest','mechanic_overalls','hard_hat','police_jacket','police_helmet','firefighter_helmet','firefighter_boots','paramedic_jacket','ranger_jacket','blackridge_vest','blackridge_helmet']) {
  checkSheet(`assets/sprites/player_${id}.png`, PLAYER_SPRITE_LAYOUT, playerNeed);
}
const infectedNeed = maxFrame(INFECTED_ANIMATIONS);
for (const ctxName of ['civilian','worker','patient','responder','rural','blackridge','heavy']) {
  checkSheet(`assets/sprites/infected_${ctxName}.png`, INFECTED_SPRITE_LAYOUT, infectedNeed);
  for (const form of INFECTED_FORMS) checkSheet(`assets/sprites/infected_${ctxName}_${form}.png`, INFECTED_SPRITE_LAYOUT, infectedNeed);
}
if (PLAYER_HAND_FRAMES.length <= playerNeed) outOfRange.push(`PLAYER_HAND_FRAMES: ${PLAYER_HAND_FRAMES.length} entries, animations need ${playerNeed + 1}`);

const missing = wanted.filter(rel => !fs.existsSync(path.join(ROOT, rel)));
const empty = wanted.filter(rel => { try { return fs.statSync(path.join(ROOT, rel)).size <= 16; } catch { return false; } });
console.log(`tiles: ${Object.keys(TILE_ASSET_NAMES).length} x3, items: ${Object.keys(ITEM_DEFS).length}, builds: ${Object.keys(BUILD_DEFS).length}, decor: ${Object.keys(DECOR_SIZE).length}`);
console.log(`runtime image paths checked: ${wanted.length}`);
console.log(`sprite frame ranges: player needs ${playerNeed + 1} frames, infected ${infectedNeed + 1}`);
console.log(`held weapon sprites: ${HELD_IDS.length}`);
if (missing.length) console.log('missing:', missing.join('\n  '));
if (empty.length) console.log('empty/tiny:', empty.join('\n  '));
if (outOfRange.length) console.log('frame out of range:', outOfRange.join('; '));
if (!missing.length && !empty.length && !outOfRange.length) console.log('OK');
process.exitCode = missing.length || empty.length || outOfRange.length ? 1 : 0;
