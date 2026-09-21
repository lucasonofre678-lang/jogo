// Stage 25 — animation data for the rebuilt actor art.
//
// Gameplay still never touches a frame number: player/enemy code asks for a
// STATE, this file maps the state onto frames of the sheets produced by
// tools/gen_sprites.js. Swapping the art again only means editing this file.

// Sheet geometry. `cx` is the figure's centre column and `ground` is the row
// the soles stand on, so a sprite can be anchored to any collision box:
//   offsetX = boxW / 2 - cx      offsetY = boxH - ground
// Frames are 48x64 with the figure ~51px tall, which leaves room for swung
// arms, long coats, raised tools and helmets without clipping the cell.
const PLAYER_SPRITE_LAYOUT = { frameW: 48, frameH: 64, drawW: 48, drawH: 64, cx: 24, ground: 62, offsetX: -13, offsetY: -12 };
const INFECTED_SPRITE_LAYOUT = { frameW: 48, frameH: 64, drawW: 48, drawH: 64, cx: 24, ground: 62, offsetX: -12, offsetY: -10 };

// Where the weapon hand actually is, per frame, read straight out of the same
// IK solver that drew the art (tools/character.js handAnchor). x is relative to
// the player's horizontal centre, y to the top of the collision box; both are
// already expressed for the box height that frame is drawn at, so the crouch
// frames are correct without extra bookkeeping.
const PLAYER_HAND_FRAMES = [
  [3, 28], [3, 28], [3, 28], [3, 29], [4, 28], [3, 29], [0, 29], [-3, 29],
  [-4, 28], [-3, 29], [0, 29], [3, 29], [7, 21], [5, 21], [1, 22], [-2, 21],
  [-4, 21], [-2, 21], [1, 22], [5, 21], [5, 19], [5, 19], [4, 11], [3, 11],
  [1, 11], [0, 11], [1, 11], [3, 11], [-1, 20], [-2, 19], [7, 23], [7, 25],
  [8, 33], [6, 30], [2, 16], [2, 13], [2, 16], [2, 20], [-2, 21], [-4, 19],
  [12, 25], [11, 28], [9, 29], [6, 29], [-4, 18], [-6, 15], [14, 26], [13, 32],
  [11, 33], [8, 31], [10, 21], [7, 20], [8, 20], [8, 25], [7, 26], [7, 25],
  [9, 22], [1, 18], [-1, 14], [11, 29], [8, 25], [10, 25], [10, 27], [-1, 20],
  [1, 22]
];

// Per-state fallback (used when the exact frame is unknown) plus the on-screen
// size the held item is drawn at for that state.
const PLAYER_HAND_ANCHORS = {
  default:              { x: 3, y: 28, size: 26 },
  walk:                 { x: 3, y: 29, size: 26 },
  run:                  { x: 5, y: 21, size: 26 },
  crouch_idle:          { x: 5, y: 19, size: 25 },
  crouch_walk:          { x: 3, y: 11, size: 25 },
  jump:                 { x: -1, y: 20, size: 26 },
  fall:                 { x: 7, y: 24, size: 26 },
  land:                 { x: 8, y: 33, size: 26 },
  climb:                { x: 2, y: 16, size: 24 },
  aim:                  { x: 10, y: 21, size: 27 },
  shoot:                { x: 7, y: 20, size: 27 },
  reload:               { x: 8, y: 25, size: 26 },
  attack_light_windup:  { x: -2, y: 21, size: 27 },
  attack_light_active:  { x: 12, y: 25, size: 27 },
  attack_light_recover: { x: 9, y: 29, size: 27 },
  attack_heavy_windup:  { x: -4, y: 18, size: 29 },
  attack_heavy_active:  { x: 14, y: 26, size: 29 },
  attack_heavy_recover: { x: 11, y: 33, size: 29 },
  mine:                 { x: 9, y: 22, size: 28 },
  use:                  { x: 10, y: 25, size: 26 },
  hurt:                 { x: -1, y: 20, size: 26 }
};

// frame is optional: pass the frame the player is actually drawing and the
// weapon tracks the hand through the swing instead of snapping per state.
function playerHandAnchor(state, crouching = false, frame = null) {
  const base = PLAYER_HAND_ANCHORS[state] || (crouching ? PLAYER_HAND_ANCHORS.crouch_idle : PLAYER_HAND_ANCHORS.default);
  const exact = frame != null ? PLAYER_HAND_FRAMES[frame] : null;
  return exact ? { x: exact[0], y: exact[1], size: base.size } : base;
}

/* ------------------------------------------------------- held weapon art */

// Weapons and tools have their own 48x20 sprites (tools/gen_held.js), drawn
// once pointing right with two anchors: `grip` is the pixel the hand closes on
// and `muzzle` is where the shot leaves. The inventory icon stays a 32x32
// diagonal composition for the grid; this is the version for a fist.
const HELD_ITEM_SIZE = { w: 48, h: 20 };

const HELD_ITEM_ANCHORS = {
  knife:              { grip: [8, 10] },
  machete:            { grip: [8, 10] },
  spear:              { grip: [8, 10] },
  steel_spear:        { grip: [8, 10] },
  bat:                { grip: [7, 10] },
  metal_pipe:         { grip: [8, 10] },
  police_baton:       { grip: [10, 10] },
  sledgehammer:       { grip: [8, 10] },
  repair_hammer:      { grip: [8, 10] },
  fire_axe:           { grip: [8, 10] },
  stone_axe:          { grip: [8, 10] },
  stone_pickaxe:      { grip: [8, 10] },
  steel_pickaxe:      { grip: [8, 10] },
  industrial_pickaxe: { grip: [8, 10] },
  containment_cutter: { grip: [9, 10] },
  geology_scanner:    { grip: [13, 11] },
  crowbar:            { grip: [14, 10] },
  pistol:             { grip: [11, 16], muzzle: [23, 8] },
  revolver:           { grip: [11, 16], muzzle: [25, 7] },
  shotgun:            { grip: [14, 14], muzzle: [33, 8] },
  rifle:              { grip: [15, 13], muzzle: [36, 8] },
  smg_compact:        { grip: [12, 13], muzzle: [27, 8] },
  police_carbine:     { grip: [14, 13], muzzle: [31, 8] },
  blackridge_carbine: { grip: [15, 13], muzzle: [33, 8] },
  hatchet:            { grip: [8, 10] },
  wrecking_bar:       { grip: [12, 10] },
  rescue_mallet:      { grip: [8, 10] },
  civilian_carbine:   { grip: [14, 13], muzzle: [32, 8] },
  compact_carbine:    { grip: [13, 13], muzzle: [29, 8] },
  security_pistol:    { grip: [11, 16], muzzle: [24, 8] },
  patrol_shotgun:     { grip: [14, 14], muzzle: [34, 8] },
  blackridge_smg:     { grip: [12, 13], muzzle: [29, 8] },
  blackridge_marksman:{ grip: [15, 13], muzzle: [37, 8] },
  butcher_knife:      { grip: [8, 10] },
  flashlight:         { grip: [11, 10], muzzle: [28, 10] }
};

const HELD_ITEM_IDS = Object.keys(HELD_ITEM_ANCHORS);

function heldItemAnchor(id) { return HELD_ITEM_ANCHORS[id] || null; }

const PLAYER_ANIMATIONS = {
  idle:                { frames: [0, 1, 2, 3],           fps: 2.6,  loop: true },
  walk:                { frames: [4, 5, 6, 7, 8, 9, 10, 11],     fps: 12.0, loop: true, group: 'stride' },
  run:                 { frames: [12, 13, 14, 15, 16, 17, 18, 19], fps: 17.0, loop: true, group: 'stride' },
  crouch_idle:         { frames: [20, 21],               fps: 1.5,  loop: true },
  crouch_walk:         { frames: [22, 23, 24, 25, 26, 27], fps: 7.0, loop: true, group: 'stride' },
  jump:                { frames: [28, 29],               fps: 6.0,  loop: false },
  fall:                { frames: [30, 31],               fps: 5.0,  loop: false },
  land:                { frames: [32, 33],               fps: 9.0,  loop: false },
  climb:               { frames: [34, 35, 36, 37],       fps: 6.5,  loop: true },
  attack_light_windup: { frames: [38, 39],               fps: 14,   loop: false },
  attack_light_active: { frames: [40, 41],               fps: 16,   loop: false },
  attack_light_recover:{ frames: [42, 43],               fps: 10,   loop: false },
  attack_heavy_windup: { frames: [44, 45],               fps: 10,   loop: false },
  attack_heavy_active: { frames: [46, 47],               fps: 14,   loop: false },
  attack_heavy_recover:{ frames: [48, 49],               fps: 8,    loop: false },
  aim:                 { frames: [50],                   fps: 1,    loop: true },
  shoot:               { frames: [51, 52],               fps: 15,   loop: false },
  reload:              { frames: [53, 54, 55, 56],       fps: 4,    loop: false },
  mine:                { frames: [57, 58, 59, 60],       fps: 8,    loop: true },
  use:                 { frames: [61, 62],               fps: 6,    loop: false },
  hurt:                { frames: [63, 64],               fps: 7,    loop: false }
};

// Clothing overlays are generated from the same rig and the same pose list, so
// they share the player's frame map. Kept as its own table because the two are
// allowed to diverge: an overlay sheet may lag a future body-art pass.
const PLAYER_CLOTHING_ANIMATIONS = PLAYER_ANIMATIONS;

const INFECTED_ANIMATIONS = {
  idle:          { frames: [0, 1],                 fps: 1.1, loop: true },
  walk:          { frames: [2, 3, 4, 5, 6, 7],     fps: 6.4, loop: true, group: 'stride' },
  investigate:   { frames: [8, 9, 10, 11],         fps: 5.6, loop: true, group: 'stride' },
  chase:         { frames: [12, 13, 14, 15, 16, 17], fps: 9.6, loop: true, group: 'stride' },
  lurch:         { frames: [18, 19, 20, 21],       fps: 9.0, loop: true, group: 'stride' },
  attack_windup: { frames: [22, 23],               fps: 8,   loop: false },
  attack:        { frames: [24, 25],               fps: 9,   loop: false },
  hurt:          { frames: [26],                   fps: 1,   loop: false },
  stagger:       { frames: [27, 28],               fps: 6,   loop: false },
  knocked:       { frames: [29],                   fps: 1,   loop: false },
  getup:         { frames: [30, 31],               fps: 3.5, loop: false },
  dormant:       { frames: [32],                   fps: 1,   loop: true }
};

// Which sheet an infected draws from. The area context supplies the wardrobe
// (hospital gowns, hi-vis, patrol uniforms) and the type supplies the
// silhouette, so a Corredor in the metro still looks like a Corredor.
const INFECTED_SHEET_FORMS = ['wanderer', 'runner', 'stalker', 'heavy', 'screamer', 'lurcher', 'armored', 'contained'];

function infectedSheetKey(visual, type) {
  const ctx = visual || 'civilian';
  return INFECTED_SHEET_FORMS.includes(type) ? `${ctx}_${type}` : ctx;
}

// Rim light for an actor. The scene's light overlay already darkens and tints
// everything uniformly; what it cannot give is a sense of WHERE the light is.
// Re-blitting the sprite additively, nudged toward the brighter side, puts a
// bright fringe on that edge — cheap, and it stops actors reading as stickers.
// Returns the offset to draw at, or null when there is nothing worth doing.
function actorRimOffset(sample, strength = 1) {
  if (!sample) return null;
  const g = Math.hypot(sample.gx, sample.gy);
  if (g < 0.05 || sample.l < 0.12) return null;
  const a = Math.min(.34, g * 1.5) * strength;
  if (a < 0.04) return null;
  return { x: (sample.gx / g) * 1.3, y: (sample.gy / g) * 1.3, alpha: a };
}

function spriteAnimationFrame(defs, state, time = 0, progress = null) {
  const def = defs[state] || defs.idle || Object.values(defs)[0];
  const frames = def?.frames?.length ? def.frames : [0];
  if (frames.length === 1) return frames[0];
  if (progress != null && Number.isFinite(progress)) {
    const p = Math.max(0, Math.min(.9999, progress));
    return frames[Math.min(frames.length - 1, Math.floor(p * frames.length))];
  }
  const raw = Math.floor(Math.max(0, time) * (def.fps || 1));
  return def.loop === false ? frames[Math.min(frames.length - 1, raw)] : frames[raw % frames.length];
}

class SpriteAnimator {
  constructor(defs, initial = 'idle') {
    this.defs = defs;
    this.state = initial;
    this.time = 0;
    this.previous = initial;
  }

  set(state, restart = false) {
    if (!this.defs[state]) state = Object.keys(this.defs)[0];
    if (state === this.state && !restart) return false;
    const from = this.defs[this.state], to = this.defs[state];
    this.previous = this.state;
    this.state = state;
    // Cycles in the same group hand over their stride phase instead of
    // restarting: breaking into a run, or one bad frame of state flicker,
    // must never snap the legs back to the first frame of the walk.
    if (!restart && from && to && from.group && from.group === to.group) {
      const d0 = from.frames.length / (from.fps || 1);
      const d1 = to.frames.length / (to.fps || 1);
      this.time = d0 > 0 ? ((this.time % d0) / d0) * d1 : 0;
    } else this.time = 0;
    return true;
  }

  update(dt, rate = 1) {
    this.time += Math.max(0, dt) * Math.max(0.05, rate);
  }

  definition(state = this.state) {
    return this.defs[state] || this.defs.idle || Object.values(this.defs)[0];
  }

  frame(progress = null) {
    return spriteAnimationFrame(this.defs, this.state, this.time, progress);
  }
}
