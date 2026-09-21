// LAST COUNTY — Stage 25 held-weapon sprites.
//
// Inventory icons are composed diagonally inside a 32x32 cell, which is right
// for the grid and wrong for a hand: rotated into a fist they read as an object
// floating in front of the arm. These are the same weapons drawn ONCE, pointing
// right, on a flat baseline, with two anchors declared per item:
//
//   grip   — the pixel the hand closes on. drawHeldItem puts this on the hand.
//   muzzle — where the shot leaves, so the flash and smoke sit on the barrel.
//
// Run: node tools/gen_held.js   (prints the anchor table for js/animation.js)
const fs = require('fs');
const path = require('path');
const { Img, shade, hash } = require('./pixel');

const OUT = path.join(__dirname, '..', 'assets', 'items');
const W = 48, H = 20, MID = 10;

/* ----------------------------------------------------------- primitives */

// Horizontal tapered shaft with a top light / bottom shade ramp.
function shaft(img, x0, x1, y, w0, w1, c) {
  for (let x = x0; x <= x1; x++) {
    const t = (x - x0) / Math.max(1, x1 - x0);
    const w = Math.max(1, Math.round(w0 + (w1 - w0) * t));
    const top = Math.round(y - (w - 1) / 2);
    for (let k = 0; k < w; k++) {
      img.set(x, top + k, k === 0 ? shade(c, 0.24) : k === w - 1 ? shade(c, -0.3) : c);
    }
  }
}

// Solid block with the same lighting convention.
function slab(img, x, y, w, h, c) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      img.set(x + i, y + j, j === 0 ? shade(c, 0.26) : j === h - 1 ? shade(c, -0.32) : i === w - 1 ? shade(c, -0.18) : c);
    }
  }
}

// Wrapped grip: the detail that makes a handle read as a handle.
function wrap(img, x0, x1, y, w, c) {
  shaft(img, x0, x1, y, w, w, c);
  for (let x = x0 + 1; x < x1; x += 2) {
    const top = Math.round(y - (w - 1) / 2);
    for (let k = 0; k < w; k++) img.set(x, top + k, shade(c, -0.26));
  }
}

// Edged blade: a spine, a bevel and a bright cutting edge along the bottom.
function blade(img, x0, x1, y, h0, h1, steel, opts = {}) {
  const edge = shade(steel, 0.34), spine = shade(steel, -0.28);
  for (let x = x0; x <= x1; x++) {
    const t = (x - x0) / Math.max(1, x1 - x0);
    let h = h0 + (h1 - h0) * t;
    if (opts.point && t > 0.78) h *= 1 - (t - 0.78) / 0.22 * 0.86;   // taper to a tip
    if (opts.belly) h += Math.sin(t * Math.PI) * opts.belly;
    const n = Math.max(1, Math.round(h));
    const top = Math.round(y - (n - 1) / 2 + (opts.drop || 0) * t);
    for (let k = 0; k < n; k++) {
      img.set(x, top + k, k === 0 ? spine : k === n - 1 ? edge : k === n - 2 ? shade(steel, 0.12) : steel);
    }
  }
}

/* ------------------------------------------------------------- the rack */

const STEEL = '#b2bcc0', DARK_STEEL = '#6f787c', WOOD = '#8a6a44', DARK_WOOD = '#513d2a';
const GUNMETAL = '#5c6366', POLY = '#3a4145';

const HELD = {
  /* ---- edged ---- */
  knife: img => {
    wrap(img, 4, 13, MID, 4, DARK_WOOD);
    slab(img, 13, MID - 3, 2, 6, shade(DARK_STEEL, -0.2));
    blade(img, 15, 30, MID, 5, 4, STEEL, { point: true });
    return { grip: [8, MID] };
  },
  machete: img => {
    wrap(img, 3, 13, MID, 5, '#3f3126');
    slab(img, 13, MID - 4, 2, 8, shade(DARK_STEEL, -0.25));
    blade(img, 15, 44, MID, 6, 5, STEEL, { point: true, belly: 1.6 });
    return { grip: [8, MID] };
  },
  spear: img => {
    shaft(img, 2, 34, MID, 3, 3, WOOD);
    wrap(img, 4, 12, MID, 4, '#6d5436');
    for (let i = 0; i < 4; i++) img.set(33 + i, MID - 1, '#9a8c73');
    blade(img, 35, 46, MID, 6, 2, STEEL, { point: true, belly: 1.2 });
    return { grip: [8, MID] };
  },
  steel_spear: img => {
    shaft(img, 2, 34, MID, 3, 3, '#4d545a');
    wrap(img, 4, 12, MID, 4, '#3a4045');
    blade(img, 34, 47, MID, 6, 2, '#c6d0d4', { point: true, belly: 1.2 });
    return { grip: [8, MID] };
  },

  /* ---- blunt ---- */
  bat: img => {
    wrap(img, 3, 13, MID, 4, '#4f3f2e');
    shaft(img, 13, 42, MID, 4, 9, WOOD);
    img.ellipse(42, MID, 2, 4.5, shade(WOOD, 0.1));
    return { grip: [7, MID] };
  },
  metal_pipe: img => {
    shaft(img, 3, 42, MID, 5, 5, '#79807f');
    slab(img, 3, MID - 3, 3, 6, shade('#79807f', -0.22));
    slab(img, 30, MID - 4, 3, 8, shade('#79807f', -0.1));
    img.patches('#7a4a2b', 6, 0.66, 0.55, 31);
    return { grip: [8, MID] };
  },
  police_baton: img => {
    shaft(img, 4, 36, MID, 5, 4, '#2f3438');
    img.ellipse(36, MID, 2, 2.6, '#454c50');
    shaft(img, 8, 14, MID + 5, 4, 4, '#23282b');                 // side handle
    img.set(8, MID + 3, shade('#454c50', 0.2));
    return { grip: [10, MID] };
  },
  sledgehammer: img => {
    shaft(img, 3, 34, MID, 4, 4, '#6d5a43');
    wrap(img, 4, 13, MID, 5, '#4a3c2c');
    slab(img, 33, MID - 6, 13, 12, '#8d969a');
    slab(img, 44, MID - 5, 3, 10, shade('#8d969a', -0.26));
    return { grip: [8, MID] };
  },
  repair_hammer: img => {
    shaft(img, 3, 31, MID, 4, 4, WOOD);
    wrap(img, 4, 12, MID, 5, '#4a3c2c');
    slab(img, 31, MID - 5, 10, 10, '#7d868a');
    slab(img, 39, MID - 4, 3, 8, shade('#7d868a', -0.22));
    for (let i = 0; i < 8; i++) {
      const x = 30 - i, y = MID - 5 - Math.round(Math.pow(i / 7, 1.6) * 5);
      img.set(x, y, '#8d969a'); img.set(x, y + 1, '#5e686c');
      if (i > 4) img.set(x, y + 2, '#3f4749');
    }
    return { grip: [8, MID] };
  },

  /* ---- axes and picks: the head is the whole read ---- */
  fire_axe: img => {
    shaft(img, 2, 34, MID, 4, 4, '#4c3a2c');
    wrap(img, 4, 13, MID, 5, '#33271e');
    slab(img, 29, MID - 4, 5, 8, '#6f2f26');
    axeBit(img, 33, 46, 6, 10, '#bb4f3a', '#d4694a', '#8e3b2c');
    return { grip: [8, MID] };
  },
  stone_axe: img => {
    shaft(img, 2, 33, MID, 4, 4, WOOD);
    wrap(img, 4, 12, MID, 5, '#5c4630');
    axeBit(img, 31, 42, 5, 7, '#787c72', '#9aa096', '#565a52');
    for (let i = 0; i < 3; i++) img.vline(29 + i, MID - 5, 11, '#6b5a3c');
    return { grip: [8, MID] };
  },
  stone_pickaxe: img => {
    shaft(img, 2, 30, MID, 4, 4, WOOD);
    wrap(img, 4, 12, MID, 5, '#5c4630');
    pickHead(img, '#787c72', '#c3c8c2');
    for (let i = 0; i < 3; i++) img.vline(27 + i, MID - 4, 8, '#6b5a3c');
    return { grip: [8, MID] };
  },
  steel_pickaxe: img => {
    shaft(img, 2, 30, MID, 4, 4, '#5a4a38');
    wrap(img, 4, 12, MID, 5, '#3c3225');
    pickHead(img, '#7f888c', '#d2dadd');
    return { grip: [8, MID] };
  },
  crowbar: img => {
    shaft(img, 6, 34, MID, 5, 5, '#4a5054');
    // claw: leaves the bar, curls up and back, and splits at the tip
    const hook = [[34, 0], [36, -1], [38, -2], [39, -4], [39, -6], [38, -7], [36, -8], [34, -8], [32, -7]];
    for (const [hx, hy] of hook) {
      for (let k = 0; k < 4; k++) img.set(hx + k - 1, MID + hy, k === 0 ? '#7a8286' : k >= 3 ? '#2f3438' : '#4e565a');
    }
    img.set(31, MID - 7, '#aab3b7'); img.set(30, MID - 6, '#aab3b7');
    for (let i = 0; i < 6; i++) {                                    // flattened pry end
      img.set(6 - i, MID + Math.round(i * 0.8), '#5e666a');
      img.set(6 - i, MID + 1 + Math.round(i * 0.8), '#3c4246');
      if (i > 3) img.set(5 - i, MID + Math.round(i * 0.8), '#96a0a4');
    }
    return { grip: [14, MID] };
  },

  /* ---- firearms: each silhouette has to be telegraphed at a glance ---- */
  // Length matters: a rifle is roughly 0.6x a person, so on a 51px character it
  // reads right at ~34px. Drawn longer it looks like a prop, not a weapon.
  pistol: img => {
    slab(img, 6, MID - 4, 16, 5, GUNMETAL);                         // slide
    img.hline(7, MID - 5, 3, shade(GUNMETAL, 0.34));                // rear sight
    img.set(20, MID - 5, shade(GUNMETAL, 0.34));                    // front sight
    slab(img, 7, MID + 1, 11, 3, shade(GUNMETAL, -0.14));
    gripBlock(img, 8, MID + 3, 6, 9, 2, shade(GUNMETAL, -0.3));
    triggerGuard(img, 14, MID + 3, 5, 5, shade(GUNMETAL, -0.36));
    return { grip: [11, MID + 6], muzzle: [23, MID - 2] };
  },
  revolver: img => {
    shaft(img, 15, 24, MID - 3, 4, 4, '#767c7e');
    slab(img, 8, MID - 4, 8, 5, '#6a7072');
    img.ellipse(14, MID - 1, 3.6, 3.6, '#5b6163');
    img.ellipseOutline(14, MID - 1, 3.6, 3.6, shade('#6a7072', 0.32));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      img.set(Math.round(14 + Math.cos(a) * 2), Math.round(MID - 1 + Math.sin(a) * 2), '#2b2f30');
    }
    gripBlock(img, 8, MID + 3, 6, 9, 2, '#5a4634');
    triggerGuard(img, 13, MID + 3, 5, 5, '#3a4042');
    img.set(8, MID - 5, shade('#6a7072', 0.3));                     // hammer spur
    return { grip: [11, MID + 6], muzzle: [25, MID - 3] };
  },
  shotgun: img => {
    slab(img, 2, MID - 1, 10, 6, '#6d5a43');                        // stock
    slab(img, 11, MID - 3, 9, 6, GUNMETAL);                         // receiver
    shaft(img, 19, 32, MID - 2, 4, 4, '#5f676a');                   // barrel
    slab(img, 20, MID + 2, 7, 3, '#4d4335');                        // pump
    img.rect(13, MID + 3, 2, 3, '#2b2f30');
    return { grip: [14, MID + 4], muzzle: [33, MID - 2] };
  },
  rifle: img => {
    slab(img, 2, MID - 1, 11, 6, '#6b5945');                        // stock
    slab(img, 12, MID - 3, 9, 6, '#61686a');                        // receiver
    shaft(img, 20, 35, MID - 2, 3, 3, '#5a6164');                   // barrel
    slab(img, 15, MID - 6, 7, 3, '#4e5558');                        // scope
    img.hline(15, MID - 6, 7, shade('#4e5558', 0.32));
    img.rect(14, MID + 3, 2, 3, '#2b2f30');
    slab(img, 17, MID + 3, 4, 5, '#55483a');                        // magazine
    return { grip: [15, MID + 3], muzzle: [36, MID - 2] };
  },
  smg_compact: img => {
    slab(img, 3, MID - 2, 6, 5, POLY);                              // folded stock
    slab(img, 8, MID - 3, 12, 6, '#474e52');
    shaft(img, 19, 26, MID - 2, 3, 3, '#5a6164');
    slab(img, 13, MID + 3, 4, 6, '#333a3e');                        // magazine
    img.rect(11, MID + 3, 2, 3, '#232829');
    return { grip: [12, MID + 3], muzzle: [27, MID - 2] };
  },
  police_carbine: img => {
    slab(img, 2, MID - 2, 9, 5, '#39474f');
    slab(img, 10, MID - 3, 11, 6, '#3f4d56');
    shaft(img, 20, 30, MID - 2, 3, 3, '#4a585f');
    slab(img, 13, MID - 6, 7, 3, '#5b6f79');                        // optic
    slab(img, 16, MID + 3, 4, 5, '#2e3940');
    img.rect(13, MID + 3, 2, 3, '#20282d');
    return { grip: [14, MID + 3], muzzle: [31, MID - 2] };
  },
  blackridge_carbine: img => {
    slab(img, 2, MID - 2, 9, 5, '#2c3639');
    slab(img, 10, MID - 3, 12, 6, '#333f42');
    shaft(img, 21, 32, MID - 2, 3, 3, '#3d4a4d');
    slab(img, 13, MID - 6, 8, 3, '#3f5c5d');
    img.hline(14, MID - 5, 6, '#7fd0c6');                           // status strip
    slab(img, 17, MID + 3, 4, 5, '#242d30');
    img.rect(14, MID + 3, 2, 3, '#1b2225');
    return { grip: [15, MID + 3], muzzle: [33, MID - 2] };
  },

  /* ---- Stage 27 arsenal --------------------------------------------
   * Three reads, held apart on purpose: civilian kit is scavenged and worn,
   * service kit is issued and uniform, Blackridge is technical and contained.
   * Grips and muzzles match the anchors already declared in js/animation.js.
   */

  // Civilian: a short camp hatchet, taped handle, chipped edge.
  hatchet: img => {
    shaft(img, 3, 27, MID, 4, 4, '#755742');
    wrap(img, 4, 13, MID, 5, '#3d3226');
    for (let i = 0; i < 3; i++) img.vline(15 + i * 3, MID - 2, 5, '#5a4a3a');   // tape
    slab(img, 24, MID - 4, 4, 8, '#5f666a');                                    // poll
    axeBit(img, 27, 37, 4, 7, '#8a9094', '#a6adb0', '#5f666a', 1.05);
    img.set(35, MID - 2, '#6c7376');                                            // chipped edge
    return { grip: [8, MID] };
  },

  // Industrial: heavier and squarer than a crowbar — a chisel end, an octagon
  // shaft and a short blunt claw.
  wrecking_bar: img => {
    shaft(img, 6, 36, MID, 6, 6, '#677276');
    for (const x of [18, 19, 27, 28]) img.vline(x, MID - 3, 6, shade('#677276', -0.18));
    const hook = [[36, 0], [38, -1], [39, -3], [39, -5], [38, -6], [36, -7]];
    for (const [hx, hy] of hook) {
      for (let k = 0; k < 5; k++) img.set(hx + k - 2, MID + hy, k === 0 ? '#9aa3a7' : k >= 4 ? '#3b4448' : '#5c666a');
    }
    img.set(34, MID - 7, '#c2cacd'); img.set(33, MID - 6, '#c2cacd');
    for (let i = 0; i < 7; i++) {                                               // chisel
      img.set(6 - i, MID - 1 + Math.round(i * 0.35), '#7e888c');
      img.set(6 - i, MID + Math.round(i * 0.35), '#485054');
      if (i > 4) img.set(5 - i, MID - 1 + Math.round(i * 0.35), '#cfd7da');
    }
    img.patches('#6b4326', 7, 0.7, 0.45, 19);
    return { grip: [12, MID] };
  },

  // Service: a rescue mallet — fibreglass haft with a hi-vis band and a big
  // two-faced head.
  rescue_mallet: img => {
    shaft(img, 3, 32, MID, 5, 5, '#7a5f4b');
    wrap(img, 4, 13, MID, 6, '#2f3a3e');
    for (let i = 0; i < 3; i++) img.vline(22 + i, MID - 3, 6, '#c8a34e');        // hi-vis band
    slab(img, 31, MID - 7, 14, 14, '#8a9195');
    slab(img, 31, MID - 7, 3, 14, shade('#8a9195', 0.16));
    slab(img, 43, MID - 6, 3, 12, shade('#8a9195', -0.3));
    img.rect(36, MID - 2, 4, 4, shade('#8a9195', -0.14));                        // eye
    return { grip: [8, MID] };
  },

  // Civilian carbine: wood furniture, plain iron sights, nothing matched.
  civilian_carbine: img => {
    slab(img, 2, MID - 1, 10, 6, '#6b5a43');
    slab(img, 11, MID - 3, 9, 6, '#7a6a4f');                                     // wood receiver cover
    slab(img, 13, MID - 4, 5, 2, '#5a6164');
    shaft(img, 19, 31, MID - 2, 3, 3, '#5a6164');
    slab(img, 20, MID + 1, 6, 3, '#6b5a43');                                     // fore-end
    img.set(30, MID - 4, '#8b9296'); img.set(15, MID - 5, '#8b9296');            // iron sights
    img.rect(13, MID + 3, 2, 3, '#2b2f30');
    img.patches('#4a3a26', 6, 0.72, 0.4, 23);
    return { grip: [14, MID + 3], muzzle: [32, MID - 2] };
  },

  // Security compact: polymer, folding stock, short rail.
  compact_carbine: img => {
    slab(img, 3, MID - 2, 7, 5, '#3f4548');                                      // folded stock
    slab(img, 9, MID - 3, 11, 6, '#596064');
    slab(img, 12, MID - 6, 8, 2, '#464d51');                                     // rail
    slab(img, 19, MID + 1, 7, 3, '#3f4649');                                     // handguard
    shaft(img, 20, 29, MID - 2, 3, 3, '#4e5559');
    slab(img, 14, MID + 3, 4, 6, '#3a4145');                                     // magazine
    img.rect(11, MID + 3, 2, 3, '#22282b');
    img.set(27, MID - 4, '#8f979b');
    return { grip: [13, MID + 3], muzzle: [29, MID - 2] };
  },

  // Service sidearm: navy polymer frame, accessory rail under the dust cover.
  security_pistol: img => {
    slab(img, 6, MID - 4, 17, 5, '#50585c');
    img.hline(7, MID - 5, 3, shade('#50585c', 0.36));
    img.set(21, MID - 5, shade('#50585c', 0.36));
    slab(img, 7, MID + 1, 12, 3, '#3f474b');
    for (let x = 15; x < 20; x += 2) img.set(x, MID + 4, '#2b3236');             // rail slots
    gripBlock(img, 8, MID + 3, 6, 9, 2, '#2f3639');
    triggerGuard(img, 14, MID + 3, 5, 5, '#242a2d');
    return { grip: [11, MID + 6], muzzle: [24, MID - 2] };
  },

  // Service shotgun: navy, ribbed heat shield over the barrel, short pump.
  patrol_shotgun: img => {
    slab(img, 2, MID - 1, 10, 6, '#3f464a');
    slab(img, 11, MID - 3, 9, 6, '#4d565a');
    shaft(img, 19, 33, MID - 2, 5, 5, '#5a6367');
    slab(img, 21, MID - 5, 11, 3, '#414a4e');                                    // heat shield
    for (const x of [24, 28]) img.vline(x, MID - 4, 2, '#2a3134');               // vents
    slab(img, 20, MID + 2, 8, 3, '#2f3639');                                     // pump
    img.rect(13, MID + 3, 2, 3, '#22282b');
    img.set(32, MID - 5, '#93a0a4');
    return { grip: [14, MID + 4], muzzle: [34, MID - 2] };
  },

  // Blackridge compact: slate, integrated handguard, one small status strip.
  blackridge_smg: img => {
    slab(img, 3, MID - 2, 6, 5, '#2f3a40');
    slab(img, 8, MID - 3, 13, 6, '#435158');
    slab(img, 12, MID - 6, 8, 2, '#37444a');
    shaft(img, 20, 28, MID - 2, 4, 3, '#3c4950');
    for (let x = 22; x < 27; x += 2) img.vline(x, MID - 3, 2, '#2c3740');        // vents
    img.hline(13, MID - 5, 5, '#6fc4bb');                                        // status strip
    slab(img, 13, MID + 3, 4, 6, '#263035');
    img.rect(10, MID + 3, 2, 3, '#1b2327');
    return { grip: [12, MID + 3], muzzle: [29, MID - 2] };
  },

  // Blackridge marksman: longer, thinner, a real optic and a slim suppressor
  // can — technical, not futuristic.
  blackridge_marksman: img => {
    slab(img, 2, MID - 1, 11, 6, '#38444a');
    slab(img, 12, MID - 3, 11, 6, '#45545a');
    shaft(img, 22, 32, MID - 2, 3, 3, '#3d4a50');
    shaft(img, 31, 38, MID - 2, 5, 5, '#333f45');                                // can
    for (let x = 33; x < 38; x += 2) img.vline(x, MID - 4, 5, '#2a343a');
    slab(img, 14, MID - 8, 11, 4, '#3a484e');                                    // optic
    img.hline(14, MID - 8, 11, shade('#3a484e', 0.32));
    img.set(24, MID - 7, '#8fd6cc'); img.set(24, MID - 6, '#4e8f88');            // lens
    slab(img, 17, MID + 3, 4, 6, '#263035');
    img.rect(14, MID + 3, 2, 3, '#1b2327');
    return { grip: [15, MID + 3], muzzle: [37, MID - 2] };
  },

  /* ---- tools that are not weapons but are still carried ---- */
  flashlight: img => {
    shaft(img, 6, 22, MID, 6, 6, '#4a5054');
    wrap(img, 7, 13, MID, 6, '#373d41');
    slab(img, 22, MID - 4, 5, 8, '#666e72');
    img.ellipse(27, MID, 1.8, 3.4, '#f4ecc4');
    img.set(27, MID - 1, '#fffbe6');
    return { grip: [11, MID], muzzle: [28, MID] };
  }
};

// A pick reads as mass swinging on an arc, so the spike keeps real thickness
// most of its length and only sharpens near the tip.
function pickHead(img, stone, edge) {
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const x = 28 + i * 0.92;
    const y = MID - 1 - Math.round(Math.pow(t, 1.4) * 6);
    const n = Math.max(2, Math.round(6 - Math.pow(t, 0.85) * 4));
    for (let k = 0; k < n; k++) {
      img.set(Math.round(x), y + k, t > 0.86 ? edge : k === 0 ? shade(stone, 0.24) : k === n - 1 ? shade(stone, -0.3) : stone);
    }
  }
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const x = 28 - i, y = MID + 1 + Math.round(t * 3);
    const n = Math.max(1, Math.round(5 - t * 3));
    for (let k = 0; k < n; k++) img.set(x, y + k, k === 0 ? shade(stone, 0.2) : k === n - 1 ? shade(stone, -0.26) : stone);
  }
  slab(img, 27, MID - 4, 4, 9, shade(stone, -0.06));
}

// An axe bit drawn row by row: the wedge narrows toward the tips and the
// cutting edge bulges forward in the middle. Column by column it read as a cone.
function axeBit(img, x0, x1, up, down, body, light, dark, curl = 1.7) {
  const len = x1 - x0;
  for (let j = -up; j <= down; j++) {
    const t = j < 0 ? j / up : j / down;
    const start = x0 + Math.round(Math.pow(Math.abs(t), curl) * len * 0.5);
    const end = x1 - Math.round(Math.pow(Math.abs(t), 2) * 3);
    for (let x = start; x <= end; x++) {
      const c = x >= end - 1 ? '#e4ebed' : j === -up ? light : j >= down - 1 ? dark : x < start + 2 ? dark : body;
      img.set(x, MID + j, c);
    }
  }
}

// Angled pistol grip (leans back) and an open trigger guard.
function gripBlock(img, x, y, w, h, lean, c) {
  for (let j = 0; j < h; j++) {
    const off = Math.round((j / h) * -lean);
    for (let i = 0; i < w; i++) {
      img.set(x + i + off, y + j, i === 0 ? shade(c, 0.22) : i === w - 1 ? shade(c, -0.28) : j % 2 === 0 && i > 1 && i < w - 1 ? shade(c, -0.14) : c);
    }
  }
}

function triggerGuard(img, x, y, w, h, c) {
  for (let i = 0; i < w; i++) img.set(x + i, y + h - 1, c);
  img.set(x, y + h - 2, c); img.set(x + w - 1, y + h - 2, c);
  img.set(x + 1, y + 1, '#23282a');
  img.set(x + 1, y + 2, '#23282a');
}

/* ------------------------------------------------------------------ main */

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const anchors = {};
  for (const [id, draw] of Object.entries(HELD)) {
    const img = new Img(W, H);
    const a = draw(img) || {};
    img.volume(0.12);
    img.contour([13, 14, 16, 228]);
    img.save(path.join(OUT, `held_${id}.png`), 18);
    anchors[id] = a;
  }

  const lines = Object.entries(anchors).map(([id, a]) => {
    const m = a.muzzle ? `, muzzle: [${a.muzzle[0]}, ${a.muzzle[1]}]` : '';
    return `  ${id.padEnd(20)}{ grip: [${a.grip[0]}, ${a.grip[1]}]${m} },`;
  });
  console.log(`held sprites: ${Object.keys(HELD).length} (${W}x${H})`);
  console.log('--- anchor table for js/animation.js ---');
  console.log('const HELD_ITEM_ANCHORS = {\n' + lines.join('\n') + '\n};');
}

if (require.main === module) main();
module.exports = { HELD, W, H, MID };
