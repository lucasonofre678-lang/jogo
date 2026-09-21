// Central image registry. Everything is loaded once, up front, and cached —
// nothing in the game loop is allowed to construct an Image.
const ASSETS = (() => {
  const images = new Map();
  let pending = 0;
  let version = 0;                 // bumps whenever a new image finishes decoding
  const listeners = [];

  function load(key, src) {
    const img = new Image();
    pending++;
    img.addEventListener('load', () => {
      pending--;
      version++;
      for (const fn of listeners) fn(version, pending);
    });
    img.addEventListener('error', () => {
      pending--;
      console.warn(`[assets] missing ${src}`);
    });
    img.src = src;
    images.set(key, img);
    return img;
  }

  const TILE_VARIANTS = 3;
  for (const [id, name] of Object.entries(TILE_ASSET_NAMES)) {
    for (let v = 0; v < TILE_VARIANTS; v++) load(`tile:${id}:${v}`, `assets/tiles/${name}_${v}.png`);
  }

  load('sprite:player', 'assets/sprites/player.png');
  // Stage 30: every wearable owns an overlay sheet. This makes new gear data-
  // driven and avoids maintaining a second hard-coded clothing list here.
  for (const [id, def] of Object.entries(ITEM_DEFS)) {
    if (def?.category === 'clothing' && def.clothingSlot) load(`sprite:player:${id}`, `assets/sprites/player_${id}.png`);
  }
  // Legacy neutral pack remains available as a fallback for old saves/art.
  load('sprite:player:backpack', 'assets/sprites/player_backpack.png');
  // One sheet per area context, plus one per (context x infected form) so a
  // Corredor in the hospital still reads as a Corredor. See INFECTED_SHEET_FORMS.
  for (const ctx of ['civilian', 'worker', 'patient', 'responder', 'rural', 'blackridge', 'heavy']) {
    load(`sprite:infected:${ctx}`, `assets/sprites/infected_${ctx}.png`);
    for (const form of INFECTED_SHEET_FORMS) load(`sprite:infected:${ctx}_${form}`, `assets/sprites/infected_${ctx}_${form}.png`);
  }
  for (const id of ['mara', 'lena', 'eli', 'jonah']) load(`sprite:npc:${id}`, `assets/sprites/npc_${id}.png`);
  // Stage 31 — fauna caçável, uma folha por espécie.
  for (const id of Object.keys(WILDLIFE_SPECIES)) load(`sprite:animal:${id}`, `assets/sprites/animal_${id}.png`);
  for (const id of ['wander', 'investigate', 'chase']) load(`ui:threat:${id}`, `assets/ui/threat_${id}.png`);

  // HUD glyphs drawn straight onto the canvas
  for (const id of ['health', 'hunger', 'thirst', 'energy', 'sleep', 'temp', 'wet', 'exposure',
    'noise', 'threat', 'nav_inventory', 'nav_vehicle', 'nav_build', 'nav_people', 'nav_archive',
    'nav_clock', 'nav_day', 'nav_compass', 'nav_deaths', 'nav_radio']) {
    load(`ui:${id}`, `assets/ui/${id}.png`);
  }

  // every prop the art pipeline produced (see tools/gen_props.js → js/decor_data.js)
  const DECOR = Object.keys(DECOR_SIZE);
  for (const id of DECOR) load(`decor:${id}`, `assets/decor/${id}.png`);

  for (const id of Object.keys(ITEM_DEFS)) load(`item:${id}`, `assets/items/${id}.png`);
  // weapons/tools also have a dedicated in-hand sprite (see HELD_ITEM_ANCHORS)
  for (const id of HELD_ITEM_IDS) load(`held:${id}`, `assets/items/held_${id}.png`);
  for (const id of Object.keys(BUILD_DEFS)) load(`build:${id}`, `assets/build/${id}.png`);

  function get(key) { return images.get(key) || null; }

  function ready(key) {
    const img = images.get(key);
    return img && img.complete && img.naturalWidth ? img : null;
  }

  // Deterministic per-position variant. A plain linear combination collapses
  // into diagonal stripes on big surfaces, so this mixes the bits properly.
  function variant(x, y) {
    let h = (x | 0) * 374761393 + (y | 0) * 668265263;
    h = (h ^ (h >>> 13)) >>> 0;
    h = Math.imul(h, 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) % TILE_VARIANTS;
  }

  function tile(id, x, y) {
    return ready(`tile:${id}:${variant(x, y)}`);
  }

  function onProgress(fn) { listeners.push(fn); }

  return {
    get, ready, tile, variant, images, onProgress,
    get pending() { return pending; },
    get version() { return version; }
  };
})();
