// LAST COUNTY — Stage 25 actor spritesheets.
//   node tools/gen_sprites.js [--player] [--infected] [--npc]
//
// Player body + every clothing overlay + the infected matrix (area context x
// infected form) + NPCs, all off the one rig in tools/character.js so overlays
// land on the body frame for frame.
const fs = require('fs');
const path = require('path');
const { Img, shade } = require('./pixel');
const C = require('./character');
const { playerPoses, npcPoses, infectedPoses, FORMS } = require('./poses');

const {
  FRAME, NPC_FRAME, buildSheet, finish, drawFoot,
  garmentTorso, garmentSleeves, garmentCoat, garmentVest, garmentLegs,
  garmentBoots, garmentHelmet, garmentBeanie, garmentCap, garmentMask,
  garmentGoggles, garmentPack
} = C;

const OUT = path.join(__dirname, '..', 'assets', 'sprites');

/* ------------------------------------------------------------- the player */

// The player sits in the middle of the screen for the whole game, so the
// palette is pushed a little harder than the world's: warmer skin, a lighter
// top highlight and darker legs, which keeps the silhouette legible against
// both the grass/dirt outside and the grey concrete interiors.
const PLAYER = {
  skin: '#caa276', skinShade: '#9b6f4e',
  hair: '#43301d', hairStyle: 'short',
  top: '#616d4a', topDark: '#3d4630', topLight: '#87956a',
  sleeve: '#55603f',
  pants: '#39414f', pantsDark: '#262d37',
  boots: '#2d2620', bootCap: '#57473a',
  belt: '#6a4326', brow: '#2b211a', eye: '#1e1b18',
  shoulderW: 13, waistW: 10
};

const BODY_OFF = { head: false, face: false, hair: false, torso: false, legs: false, boots: false, arms: false, hands: false };

// Every overlay is "the body rig, with only this garment drawn".
function overlay(garments, name = 'overlay') {
  const img = buildSheet(playerPoses(), { ...PLAYER, garments }, BODY_OFF);
  return finish(track(name, img), { volume: 0.11, contourColor: [13, 15, 18, 200] });
}

const OVERLAYS = {
  /* ---- carried ---- */
  backpack: { pack: (i, J, d) => garmentPack(i, J, '#5a4a37', d, { roll: '#6f5c41' }) },

  /* ---- civilian body ---- */
  rain_jacket: {
    torso: (i, J) => { garmentTorso(i, J, '#4a6b60', { zip: true, shoulderW: 14.5 }); garmentSleeves(i, J, '#4a6b60', { band: '#8ca79a', bandAt: 0.55 }); },
    head: (i, J, d) => { for (let k = -5; k <= 3; k++) i.set(Math.round(J.neck.x + k * 0.4 - d * 3), Math.round(J.neck.y + 2 + Math.abs(k) * 0.25), shade('#3c5a50', k < 0 ? 0.12 : -0.14)); }
  },
  wool_coat: {
    torso: (i, J) => { garmentTorso(i, J, '#6b5b4c', { shoulderW: 15 }); garmentSleeves(i, J, '#6b5b4c', { w: 5 }); },
    legs: (i, J) => garmentCoat(i, J, '#6b5b4c', 10, { w: 13.5, band: null })
  },
  hazmat_coat: {
    torso: (i, J) => { garmentTorso(i, J, '#9a9155', { shoulderW: 15, zip: true }); garmentSleeves(i, J, '#9a9155', { w: 5, band: '#6f6a3d', bandAt: 0.7 }); },
    legs: (i, J) => garmentCoat(i, J, '#9a9155', 12, { w: 14, band: '#6f6a3d' })
  },
  denim_jacket: {
    torso: (i, J) => { garmentTorso(i, J, '#4a6079', { shoulderW: 14, zip: true, collarShade: -0.34 }); garmentSleeves(i, J, '#4a6079', { cuff: '#33455a' }); }
  },
  leather_jacket: {
    torso: (i, J) => { garmentTorso(i, J, '#4e3c30', { shoulderW: 14.5, zip: true, collarShade: 0.16 }); garmentSleeves(i, J, '#4e3c30', { cuff: '#332720' }); }
  },
  utility_vest: {
    torso: (i, J) => garmentVest(i, J, '#5e6551', { w: 13.5, pouch: '#454b3a', patch: '#8b8f6a' })
  },
  mechanic_overalls: {
    torso: (i, J) => { garmentTorso(i, J, '#4f5960', { shoulderW: 12.5, waistW: 11.5, collar: false }); garmentSleeves(i, J, '#4f5960', { stop: 0.55, cuff: '#3a434a' }); },
    legs: (i, J) => garmentLegs(i, J, '#4f5960', { w: 6.4, band: '#3a434a' })
  },
  ranger_jacket: {
    torso: (i, J) => { garmentTorso(i, J, '#4e5b45', { shoulderW: 14.5, zip: true }); garmentSleeves(i, J, '#4e5b45', { cuff: '#3a452f' }); garmentVest(i, J, '#4a5742', { w: 12, top: 0.3, bottom: 0.78, pouch: '#3a452f' }); }
  },

  /* ---- public response ---- */
  police_jacket: {
    torso: (i, J) => {
      garmentTorso(i, J, '#33454f', { shoulderW: 14.5, zip: true, collarShade: -0.36 });
      garmentSleeves(i, J, '#33454f', { cuff: '#22303a', pad: '#2b3b44' });
      const p = { x: -J.spine.y, y: J.spine.x };
      i.rect(Math.round(J.sh.x + p.x * 2.4 - 1), Math.round(J.sh.y + 3), 2, 2, '#b9c4c9');
    }
  },
  police_vest: {
    torso: (i, J) => garmentVest(i, J, '#38424c', { w: 14, pouch: '#252d35', patch: '#b9c4c9', top: 0.06, bottom: 0.9 })
  },
  firefighter_coat: {
    torso: (i, J) => {
      garmentTorso(i, J, '#6f5b3c', { shoulderW: 15.5, collarShade: 0.1 });
      garmentSleeves(i, J, '#6f5b3c', { w: 5.2, band: '#cfcaa4', bandAt: 0.5 });
      garmentVest(i, J, '#6f5b3c', { w: 14.5, top: 0.18, bottom: 0.58, stripe: '#cfcaa4', stripeAt: [0.3, 0.42] });
    },
    legs: (i, J) => garmentCoat(i, J, '#6f5b3c', 7, { w: 14.5, band: '#cfcaa4' })
  },
  paramedic_jacket: {
    torso: (i, J) => {
      garmentTorso(i, J, '#3d6f68', { shoulderW: 14, zip: true });
      garmentSleeves(i, J, '#3d6f68', { band: '#cfe0d8', bandAt: 0.55 });
      const p = { x: -J.spine.y, y: J.spine.x };
      const x = Math.round(J.sh.x + p.x * 2.6), y = Math.round(J.sh.y + 3.4);
      i.rect(x - 1, y, 3, 1, '#dbe8e2'); i.rect(x, y - 1, 1, 3, '#dbe8e2');
    }
  },
  blackridge_vest: {
    torso: (i, J) => {
      garmentVest(i, J, '#44525a', { w: 14, pouch: '#2f3a41', top: 0.05, bottom: 0.9 });
      garmentSleeves(i, J, '#3c4a52', { stop: 0.42, pad: '#33414a' });
      const p = { x: -J.spine.y, y: J.spine.x };
      i.set(Math.round(J.sh.x + p.x * 2.8), Math.round(J.sh.y + 4), '#7fd0c6');
      i.set(Math.round(J.sh.x + p.x * 2.8), Math.round(J.sh.y + 5), '#3f7f79');
    }
  },

  /* ---- headgear ---- */
  wool_hat: { head: (i, J, d) => garmentBeanie(i, J, '#7a5f56', d, { pom: true }) },
  respirator: { head: (i, J, d) => garmentMask(i, J, '#6d7a73', d, { lens: '#9fb0a6' }) },
  miner_helmet: { head: (i, J, d) => garmentHelmet(i, J, '#a98c3f', d, { brim: '#8d7333', brimLen: 2.5, brimBack: 1, lamp: '#efe2ad', crown: 0.2 }) },
  hard_hat: { head: (i, J, d) => garmentHelmet(i, J, '#b79a4d', d, { brim: '#96793a', brimLen: 3, brimBack: 1.1, crest: '#cdb26a', crown: 0.15 }) },
  police_helmet: { head: (i, J, d) => garmentHelmet(i, J, '#39434b', d, { visor: '#2a3238', visorH: 5, crown: 0.75, grow: 1.6, crest: '#4d5a63' }) },
  firefighter_helmet: { head: (i, J, d) => garmentHelmet(i, J, '#b58a3c', d, { brim: '#8e6a2c', brimLen: 2.5, brimBack: 1, brimH: 2, crest: '#d8ae5c', crown: 0.1 }) },
  blackridge_helmet: { head: (i, J, d) => garmentHelmet(i, J, '#4a585e', d, { visor: '#365c5e', visorH: 5, crown: 0.7, grow: 1.5, lamp: '#9fe4da' }) },

  /* ---- boots ---- */
  work_boots: { legs: (i, J, d) => garmentBoots(i, J, '#4a3a2b', d, { shaft: 4, cap: '#6b543c' }) },
  hiking_boots: { legs: (i, J, d) => garmentBoots(i, J, '#5f4e3b', d, { shaft: 4, cap: '#8a7150', band: '#8a7150' }) },
  rubber_boots: { legs: (i, J, d) => garmentBoots(i, J, '#3f4846', d, { shaft: 8, len: 7 }) },
  firefighter_boots: { legs: (i, J, d) => garmentBoots(i, J, '#2f3335', d, { shaft: 8, band: '#c2a24e', len: 7 }) }
};

const OVERFLOW = [];
function track(name, img) {
  if (img.overflow && img.overflow.length) OVERFLOW.push(`${name}: ${img.overflow.map(o => `f${o.frame}${o.left ? ` L${o.left}` : ''}${o.right ? ` R${o.right}` : ''}`).join(' ')}`);
  return img;
}

function playerSheet() {
  return finish(track('player', buildSheet(playerPoses(), PLAYER, {})), { volume: 0.10 });
}

/* --------------------------------------------------------------- infected */
// Stylised and non-graphic: pallid skin, sunken eyes, worn clothing. The area
// context supplies the wardrobe, the form supplies the silhouette.

const CONTEXTS = {
  civilian: {
    skin: '#8e9483', skinShade: '#697061', hair: '#3b3229', hairStyle: 'messy',
    top: '#6d5a53', pants: '#3f4652', boots: '#2b2722', eye: '#161d1b', eyeGlow: '#9aa892',
    garments: { torso: (i, J) => garmentSleeves(i, J, '#5f4e48', { stop: 0.62 }) }
  },
  worker: {
    skin: '#8d9484', skinShade: '#697061', hair: '#332b24', hairStyle: 'buzz',
    top: '#4e5a63', pants: '#3c4048', boots: '#2e2820', eye: '#161d1b', eyeGlow: '#9aa892',
    garments: {
      torso: (i, J) => garmentVest(i, J, '#8c7a3a', { w: 12.5, stripe: '#b9ad74', stripeAt: [0.36] }),
      head: (i, J, d) => garmentHelmet(i, J, '#8a6a32', d, { brim: '#6f5528', brimLen: 2, brimBack: 0.7, brimH: 1, crown: 0.15 })
    }
  },
  patient: {
    skin: '#98a091', skinShade: '#727a6c', hair: '#4a4038', hairStyle: 'messy',
    top: '#94a0a2', topDark: '#6d7778', topLight: '#aeb9ba', pants: '#8e9a9c', boots: '#7b8480',
    eye: '#161d1b', eyeGlow: '#a6b3a4',
    garments: {
      torso: (i, J) => { garmentSleeves(i, J, '#9aa6a8', { stop: 0.5 }); garmentCoat(i, J, '#94a0a2', 6, { w: 12, flare: 2 }); },
      head: (i, J) => { i.set(Math.round(J.arms.F.hand.x), Math.round(J.arms.F.hand.y - 2), '#c0c8b8'); }
    }
  },
  responder: {
    skin: '#8e9483', skinShade: '#6a7162', hair: '#2f2a24', hairStyle: 'buzz',
    top: '#39434e', pants: '#333a45', boots: '#26231f', eye: '#161d1b', eyeGlow: '#9aa892',
    garments: {
      torso: (i, J) => { garmentSleeves(i, J, '#39434e', {}); garmentVest(i, J, '#2d3640', { w: 12.5, pouch: '#20272f', patch: '#9aa7ad' }); }
    }
  },
  rural: {
    skin: '#8e9483', skinShade: '#6a7162', hair: '#4a3a2a', hairStyle: 'beard',
    top: '#7a5344', pants: '#4a4335', boots: '#3a2e22', eye: '#161d1b', eyeGlow: '#9aa892',
    garments: {
      torso: (i, J) => garmentSleeves(i, J, '#6d4a3d', {}),
      head: (i, J, d) => garmentCap(i, J, '#5c5138', d)
    }
  },
  blackridge: {
    skin: '#909887', skinShade: '#6c7464', hair: '#2e2a26', hairStyle: 'buzz',
    top: '#5c6a6c', pants: '#525f61', boots: '#2a2e2e', eye: '#161d1b',
    garments: {
      torso: (i, J) => { garmentTorso(i, J, '#5c6a6c', { shoulderW: 13.5, zip: true }); garmentSleeves(i, J, '#5c6a6c', {}); },
      head: (i, J, d) => { garmentMask(i, J, '#77837c', d, { lens: '#8fa39a' }); garmentGoggles(i, J, '#8fa39a', d); }
    }
  },
  heavy: {
    skin: '#8a9080', skinShade: '#666d5e', hair: '#2f2822', hairStyle: 'bald',
    top: '#4c4a42', pants: '#3a3a34', boots: '#2b2722', eye: '#161d1b', eyeGlow: '#96a390',
    garments: { torso: (i, J) => garmentSleeves(i, J, '#44423b', { stop: 0.6 }) }
  }
};

// Form gear: protective equipment, never superpowers.
const FORM_GEAR = {
  // Public-order riot kit. Kept several steps lighter than the uniform under
  // it, or the whole figure collapses into one unreadable black silhouette.
  armored: (g) => {
    const prev = g.torso;
    g.torso = (i, J, d, st) => {
      if (prev) prev(i, J, d, st);
      garmentVest(i, J, '#525f68', { w: 14.5, pouch: '#39434b', patch: '#c3ced3', top: 0.04, bottom: 0.9 });
      garmentSleeves(i, J, '#4a5661', { stop: 0.4, pad: '#5d6b74' });
    };
    g.head = (i, J, d) => garmentHelmet(i, J, '#57646d', d, { visor: '#39474e', visorH: 5, crown: 0.8, grow: 1.7, crest: '#76848c' });
    g.legs = (i, J, d) => garmentBoots(i, J, '#3a4045', d, { shaft: 7, band: '#5e6a70' });
  },
  contained: (g) => {
    g.torso = (i, J) => {
      garmentTorso(i, J, '#6c7a7e', { shoulderW: 15, zip: true });
      garmentSleeves(i, J, '#6c7a7e', { w: 5.2, band: '#4e5c60' });
      garmentVest(i, J, '#526065', { w: 14, pouch: '#3a4448', top: 0.1, bottom: 0.8 });
    };
    g.head = (i, J, d) => { garmentHelmet(i, J, '#5e6c72', d, { crown: 0.8, grow: 1.4 }); garmentMask(i, J, '#8a9897', d, { lens: '#8fcac0' }); garmentGoggles(i, J, '#7fb6ad', d); };
    g.legs = (i, J, d) => { garmentLegs(i, J, '#6c7a7e', { w: 6.4 }); garmentBoots(i, J, '#3a4245', d, { shaft: 7 }); };
  },
  // Torn to the shoulder: the Corredor has to read as "stripped down and fast"
  // even standing still.
  runner: (g) => {
    g.torso = (i, J, d, st) => garmentSleeves(i, J, shade(st.top, -0.12), { stop: 0.32, cuff: shade(st.top, -0.36) });
  },
  heavy: (g, base) => {
    const prev = g.torso;
    g.torso = (i, J, d, st) => { if (prev) prev(i, J, d, st); garmentVest(i, J, shade(base.top, -0.22), { w: 14, top: 0.2, bottom: 0.72 }); };
  },
  screamer: (g) => {
    // A distended throat, not a monster jaw: the shape says "this one is loud".
    const prev = g.head;
    g.head = (i, J, d, st) => {
      if (prev) prev(i, J, d, st);
      const H = J.head;
      i.ellipse(H.x + d * 2.2, H.y + H.hh * 0.86, 3.1, 2.4, shade(st.skinShade, -0.12));
      i.set(Math.round(H.x + d * 3), Math.round(H.y + H.hh * 0.5), shade(st.skinShade, -0.3));
      i.ellipse(H.x + d * 2.6, H.y + 3, 1.8, 2.2, '#2a2420');
    };
  },
  stalker: (g) => {
    const prev = g.head;
    g.head = (i, J, d, st) => {
      if (prev) prev(i, J, d, st);
      // hood/hunched collar: reads as "watching you" from a long way off
      const p = { x: -J.spine.y, y: J.spine.x };
      for (let k = -4; k <= 4; k++) i.set(Math.round(J.neck.x + p.x * k - d * 1.2), Math.round(J.neck.y + p.y * k + 1.6 + Math.abs(k) * 0.3), shade(st.top, -0.3));
    };
  }
};

function infectedStyle(ctxName, form) {
  const base = CONTEXTS[ctxName] || CONTEXTS.civilian;
  const g = { ...(base.garments || {}) };
  if (FORM_GEAR[form]) FORM_GEAR[form](g, base);
  const st = { ...base, garments: g, build: (base.build || 0) + (FORMS[form]?.build || 0) };
  if (form === 'runner' || form === 'screamer') st.headW = 10.2;
  if (form === 'heavy' || form === 'contained') st.headW = 12;
  return st;
}

function infectedSheet(ctxName, form) {
  const img = track(`${ctxName}/${form}`, buildSheet(infectedPoses(form), infectedStyle(ctxName, form), {}));
  // Wear applied after the body so every infected reads worn down. Smooth
  // noise, not a per-pixel pattern: the old modulo grime tiled into visible
  // diagonal stripes on the darker sheets.
  img.weather(7, 0.13, 17);
  img.patches('#4b4638', 11, 0.7, 0.2, 29);
  img.grain(0.045, 41);
  return finish(img, { volume: 0.15, contourColor: [11, 13, 15, 228] });
}

/* ------------------------------------------------------------------ NPCs */

const NPCS = {
  mara: {
    skin: '#c08f68', skinShade: '#96694b', hair: '#6a4a2e', hairStyle: 'ponytail',
    top: '#6f7a4e', pants: '#4f4536', boots: '#4a3a29', belt: '#3d3125', brow: '#4a3120',
    garments: { torso: (i, J) => garmentSleeves(i, J, '#66734a', {}) }
  },
  lena: {
    skin: '#b3805e', skinShade: '#8a5f45', hair: '#2b2420', hairStyle: 'short',
    top: '#8f9ba0', pants: '#556067', boots: '#39403f', brow: '#241d19',
    garments: {
      torso: (i, J) => { garmentTorso(i, J, '#cdd3ce', { shoulderW: 14 }); garmentSleeves(i, J, '#cdd3ce', {}); },
      legs: (i, J) => garmentCoat(i, J, '#cdd3ce', 10, { w: 13 })
    }
  },
  eli: {
    skin: '#a9764f', skinShade: '#80573a', hair: '#37281f', hairStyle: 'beard',
    top: '#4a5560', pants: '#3f4751', boots: '#2f2a24', brow: '#2a1f18',
    garments: {
      torso: (i, J) => { garmentSleeves(i, J, '#44505a', {}); garmentVest(i, J, '#6b5b45', { w: 12.5, pouch: '#4e4133' }); },
      head: (i, J, d) => garmentCap(i, J, '#5a4a38', d)
    }
  },
  jonah: {
    skin: '#b98a63', skinShade: '#8e6548', hair: '#4a3b2b', hairStyle: 'short',
    top: '#6d5c45', pants: '#464038', boots: '#3a3129', brow: '#332618', stubble: '#4a3b2b',
    garments: {
      torso: (i, J) => { garmentTorso(i, J, '#7d6a4a', { shoulderW: 14.5 }); garmentSleeves(i, J, '#7d6a4a', {}); },
      legs: (i, J) => garmentCoat(i, J, '#7d6a4a', 11, { w: 13 }),
      head: (i, J, d) => garmentHelmet(i, J, '#5d4f3a', d, { brim: '#483d2d', brimLen: 3, brimBack: 1.3, crown: 0.1 }),
      pack: (i, J, d) => garmentPack(i, J, '#5f4e38', d, { h: 11, roll: '#6f5c41' })
    }
  }
};

/* ------------------------------------------------------------------- main */

function main() {
  const args = process.argv.slice(2);
  const only = k => !args.length || args.includes(`--${k}`);
  fs.mkdirSync(OUT, { recursive: true });
  let n = 0;

  if (only('player')) {
    playerSheet().save(path.join(OUT, 'player.png'), 48); n++;
    for (const [id, garments] of Object.entries(OVERLAYS)) {
      overlay(garments, id).save(path.join(OUT, `player_${id}.png`), 18); n++;
    }
  }

  if (only('infected')) {
    for (const ctx of Object.keys(CONTEXTS)) {
      for (const form of Object.keys(FORMS)) {
        infectedSheet(ctx, form).save(path.join(OUT, `infected_${ctx}_${form}.png`), 26); n++;
      }
      // plain context sheet, used as the fallback when a form sheet is missing
      infectedSheet(ctx, 'wanderer').save(path.join(OUT, `infected_${ctx}.png`), 26); n++;
    }
  }

  if (only('npc')) {
    for (const [id, style] of Object.entries(NPCS)) {
      finish(track(`npc:${id}`, buildSheet(npcPoses(), style, {}, NPC_FRAME)), { volume: 0.13 })
        .save(path.join(OUT, `npc_${id}.png`), 28); n++;
    }
  }

  console.log(`sprites: ${n} sheets`);
  if (OVERFLOW.length) {
    console.log(`FRAME OVERFLOW (${OVERFLOW.length} sheets) — art is being clipped at the cell edge:`);
    for (const line of OVERFLOW.slice(0, 20)) console.log('  ' + line);
    process.exitCode = 1;
  } else console.log('frame bounds: OK');
}

if (require.main === module) main();
module.exports = { PLAYER, OVERLAYS, CONTEXTS, FORM_GEAR, infectedStyle, playerSheet, overlay };
