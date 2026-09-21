// LAST COUNTY — inventory item icons (32x32, consistent lighting and outline).
const fs = require('fs');
const path = require('path');
const { Img, shade, hash } = require('./pixel');

const OUT = path.join(__dirname, '..', 'assets', 'items');
const S = 32;

function icon(draw) {
  const img = new Img(S, S);
  draw(img);
  img.volume(0.13);
  img.contour([13, 14, 16, 225]);
  return img;
}

function box(img, x, y, w, h, c) {
  img.rect(x, y, w, h, c);
  img.hline(x, y, w, shade(c, 0.22));
  img.hline(x, y + h - 1, w, shade(c, -0.3));
  img.vline(x, y, h, shade(c, 0.1));
  img.vline(x + w - 1, y, h, shade(c, -0.22));
}

function chunkPile(img, colors, seed, y0 = 8) {
  for (let i = 0; i < 12; i++) {
    const x = 4 + Math.floor(hash(i, seed, 1) * 22);
    const y = y0 + Math.floor(hash(i, seed, 2) * (24 - y0));
    const w = 4 + Math.floor(hash(i, seed, 3) * 6);
    const h = 3 + Math.floor(hash(i, seed, 4) * 5);
    const c = colors[i % colors.length];
    img.rect(x, y, w, h, c);
    img.hline(x, y, w, shade(c, 0.24));
    img.hline(x, y + h - 1, w, shade(c, -0.28));
  }
}

function handle(img, x0, y0, x1, y1, w, c) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t);
    for (let k = 0; k < w; k++) img.set(x + k, y, k === 0 ? shade(c, 0.2) : k === w - 1 ? shade(c, -0.26) : c);
  }
}

function bottle(img, glass, liquid, level) {
  img.rect(13, 3, 6, 4, shade(glass, -0.2));       // neck
  img.rect(12, 6, 8, 3, shade(glass, 0.1));        // shoulder
  img.rect(9, 8, 14, 20, glass);
  img.hline(9, 8, 14, shade(glass, 0.22));
  img.hline(9, 27, 14, shade(glass, -0.3));
  if (level > 0) {
    const h = Math.round(18 * level);
    img.rect(10, 27 - h, 12, h, liquid);
    img.hline(10, 27 - h, 12, shade(liquid, 0.25));
  }
  img.vline(11, 10, 16, shade(glass, 0.3));
  img.rect(13, 1, 6, 3, '#5f5a4e');                // cap
}

function label(img, x, y, w, h, c, mark) {
  img.rect(x, y, w, h, c);
  img.hline(x, y, w, shade(c, 0.2));
  img.hline(x, y + h - 1, w, shade(c, -0.25));
  if (mark) for (let i = 0; i < 3; i++) img.hline(x + 2, y + 2 + i * 2, w - 4 - (i % 2) * 2, mark);
}

function keyIcon(img, body, tag) {
  img.ellipseOutline(9, 11, 5.5, 5.5, body);
  img.ellipse(9, 11, 2, 2, '#2b2f30');
  img.rect(12, 14, 12, 3, body);
  img.rect(20, 17, 3, 4, body);
  img.rect(15, 17, 2, 3, body);
  img.hline(12, 14, 12, shade(body, 0.25));
  img.rect(19, 5, 9, 7, tag);
  img.hline(19, 5, 9, shade(tag, 0.25));
  img.hline(21, 8, 5, shade(tag, -0.35));
}

const ITEMS = {
  evidence_key: img => keyIcon(img, '#8a8f74', '#6e7a66'),
  clinic_key: img => keyIcon(img, '#7d9a90', '#5f7a74'),
  motel_key: img => keyIcon(img, '#9a8a5c', '#7a6a44'),
  knife: img => {
    handle(img, 8, 25, 13, 18, 4, '#4a3a2c');
    img.rect(6, 24, 6, 5, '#3f3126');
    for (let i = 0; i < 14; i++) {
      const x = 13 + i, y = 18 - i;
      img.set(x, y, '#c6ccd0'); img.set(x, y + 1, '#9aa2a6'); img.set(x, y + 2, '#6f767a');
      if (i > 2) img.set(x - 1, y + 3, '#565c60');
    }
    img.set(26, 5, '#e2e8ea');
  },
  machete: img => {
    handle(img, 7, 27, 12, 20, 5, '#3f3126');
    img.rect(5, 25, 7, 5, '#4a3a2c');
    for (let i = 0; i < 17; i++) {
      const x = 11 + i, y = 21 - i;
      img.set(x, y, '#cdd3d6'); img.set(x, y + 1, '#a2aaae');
      img.set(x, y + 2, '#7a8286'); img.set(x, y + 3, '#5c6468');
      if (i > 4) img.set(x - 1, y + 4, '#4a5154');
    }
    img.set(28, 3, '#e8eef0');
  },
  bat: img => {
    const c = '#8a6a44';
    for (let i = 0; i < 26; i++) {
      const x = 4 + i, y = 27 - i;
      const w = 2 + Math.round(i / 5);
      for (let k = 0; k < w; k++) {
        img.set(x + k, y, k === 0 ? shade(c, 0.22) : k === w - 1 ? shade(c, -0.28) : c);
      }
    }
    img.rect(3, 25, 5, 5, '#4f3f2e');
    for (let i = 0; i < 3; i++) img.hline(4, 26 + i, 4, '#3f3226');
    img.set(28, 2, shade(c, 0.35));
  },
  metal_pipe: img => {
    const c = '#79807f';
    for (let i = 0; i < 28; i++) {
      const x = 3 + i, y = 28 - i;
      img.set(x, y, shade(c, 0.24)); img.set(x + 1, y, c);
      img.set(x + 2, y, shade(c, -0.26));
    }
    img.rect(2, 25, 6, 5, shade(c, -0.14));
    img.rect(25, 2, 5, 5, shade(c, -0.1));
    img.patches('#7a4a2b', 6, 0.68, 0.5, 31);
  },
  spear: img => {
    const shaft = '#87694a';
    for (let i = 0; i < 26; i++) {
      const x = 3 + i, y = 28 - i;
      img.set(x, y, shade(shaft, 0.2)); img.set(x + 1, y, shaft);
      img.set(x + 2, y, shade(shaft, -0.3));
    }
    // lashed blade
    for (let i = 0; i < 7; i++) {
      const x = 23 + i, y = 8 - i;
      img.set(x, y, '#c6ccd0'); img.set(x + 1, y, '#8f9799'); img.set(x, y + 1, '#6f7779');
    }
    img.rect(21, 8, 5, 4, '#9a8c73');
    for (let i = 0; i < 4; i++) img.line(21 + i, 8, 21 + i, 11, '#7c6f58');
  },
  pistol: img => {
    const c = '#5c6366';
    img.rect(4, 11, 22, 6, c);
    img.hline(4, 11, 22, shade(c, 0.28));
    img.hline(4, 16, 22, shade(c, -0.32));
    img.rect(24, 12, 4, 3, shade(c, 0.1));
    img.rect(7, 17, 7, 11, shade(c, -0.12));      // grip
    for (let y = 19; y < 27; y += 2) img.hline(8, y, 5, shade(c, -0.3));
    img.rect(13, 17, 3, 4, shade(c, -0.24));      // trigger guard
    img.set(14, 18, '#2b2f30');
    img.rect(5, 9, 3, 2, shade(c, 0.2));
  },
  revolver: img => {
    const c = '#6a6f70';
    img.rect(5, 11, 20, 5, c);
    img.hline(5, 11, 20, shade(c, 0.3));
    img.ellipse(12, 15, 5, 5, shade(c, -0.1));
    img.ellipseOutline(12, 15, 5, 5, shade(c, 0.24));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      img.set(Math.round(12 + Math.cos(a) * 3), Math.round(15 + Math.sin(a) * 3), '#2b2f30');
    }
    img.rect(7, 19, 7, 10, '#5a4634');
    img.rect(14, 17, 3, 4, shade(c, -0.26));
    img.set(15, 18, '#2b2f30');
  },
  shotgun: img => {
    const barrel = '#5f676a', stock = '#6d5a43';
    for (let i = 0; i < 20; i++) {
      const x = 9 + i, y = 16 - Math.round(i * 0.25);
      img.set(x, y, shade(barrel, 0.24)); img.set(x, y + 1, barrel);
      img.set(x, y + 2, shade(barrel, -0.3));
    }
    for (let i = 0; i < 9; i++) {
      const x = 2 + i, y = 19 - Math.round(i * 0.3);
      img.set(x, y, shade(stock, 0.2)); img.set(x, y + 1, stock);
      img.set(x, y + 2, stock); img.set(x, y + 3, shade(stock, -0.3));
    }
    img.rect(12, 19, 8, 3, shade(barrel, -0.14));  // pump
    img.rect(10, 18, 3, 3, '#2b2f30');
  },
  rifle: img => {
    const barrel = '#6b5945', metal = '#61686a';
    for (let i = 0; i < 24; i++) {
      const x = 6 + i, y = 15 - Math.round(i * 0.12);
      img.set(x, y, shade(metal, 0.22)); img.set(x, y + 1, metal);
      img.set(x, y + 2, shade(metal, -0.3));
    }
    for (let i = 0; i < 12; i++) {
      const x = 2 + i, y = 17 - Math.round(i * 0.15);
      img.set(x, y, shade(barrel, 0.2)); img.set(x, y + 1, barrel);
      img.set(x, y + 2, shade(barrel, -0.28));
    }
    img.rect(13, 10, 6, 3, shade(metal, -0.1));    // scope
    img.rect(12, 9, 2, 5, shade(metal, -0.25));
    img.rect(11, 18, 3, 4, '#2b2f30');
  },
  ammo_pistol: img => {
    for (let i = 0; i < 5; i++) {
      const x = 4 + i * 5, y = 12 + (i % 2) * 6;
      img.rect(x, y, 4, 9, '#9a8a5c');
      img.hline(x, y, 4, '#c0ad76');
      img.rect(x, y + 9, 4, 3, '#7d7048');
      img.rect(x + 1, y - 2, 2, 2, '#b8a06a');
    }
  },
  ammo_shotgun: img => {
    for (let i = 0; i < 3; i++) {
      const x = 5 + i * 8, y = 9 + (i % 2) * 5;
      img.rect(x, y, 6, 13, '#8a5a4c');
      img.hline(x, y, 6, '#a97265');
      img.rect(x, y + 13, 6, 5, '#9a8a5c');
      img.hline(x, y + 13, 6, '#c0ad76');
    }
  },
  ammo_rifle: img => {
    for (let i = 0; i < 4; i++) {
      const x = 5 + i * 6, y = 10 + (i % 2) * 7;
      img.rect(x, y, 4, 11, '#7d8a6a');
      img.hline(x, y, 4, '#9aa885');
      img.rect(x + 1, y - 3, 2, 3, '#b8a06a');
      img.rect(x, y + 11, 4, 2, '#6a7458');
    }
  },
  ladder: img => {
    const wood = '#7a5a3c';
    for (const x of [8, 20]) {
      img.rect(x, 3, 4, 26, wood);
      img.vline(x, 3, 26, shade(wood, 0.22));
      img.vline(x + 3, 3, 26, shade(wood, -0.3));
    }
    for (let y = 6; y < 28; y += 6) {
      img.rect(8, y, 16, 3, shade(wood, 0.08));
      img.hline(8, y, 16, shade(wood, 0.26));
      img.set(10, y + 1, '#9a948a'); img.set(21, y + 1, '#9a948a');
    }
  },
  antenna_part: img => {
    const c = '#8a9294';
    img.rect(14, 4, 4, 22, c);
    img.hline(14, 4, 4, shade(c, 0.3));
    for (let i = 0; i < 4; i++) {
      const y = 8 + i * 5;
      img.rect(6, y, 20, 2, shade(c, -0.12));
      img.hline(6, y, 20, shade(c, 0.2));
    }
    img.rect(11, 26, 10, 3, '#5f676a');
  },
  backpack_frame: img => {
    const c = '#6d5a42';
    img.rect(8, 5, 16, 22, c);
    img.hline(8, 5, 16, shade(c, 0.26));
    img.hline(8, 26, 16, shade(c, -0.3));
    img.rect(10, 10, 12, 7, shade(c, -0.22));
    img.rect(5, 8, 3, 14, shade(c, -0.1));
    img.rect(24, 8, 3, 14, shade(c, -0.24));
    img.rect(13, 3, 6, 3, '#8a9294');
    img.set(15, 13, '#a89c84');
  },
  /* ------------------------------------------------------------ material */
  dirt: img => { chunkPile(img, ['#6b4e38', '#7a5a41', '#5a412f'], 3, 10); },
  stone: img => { chunkPile(img, ['#70747a', '#5c6065', '#848890'], 5, 9); },
  gravel: img => {
    for (let i = 0; i < 22; i++) {
      const x = 4 + Math.floor(hash(i, 7, 1) * 24), y = 10 + Math.floor(hash(i, 7, 2) * 16);
      const c = ['#7b7871', '#66635e', '#8f8c82'][i % 3];
      img.rect(x, y, 3, 2, c); img.hline(x, y, 3, shade(c, 0.22));
    }
  },
  dark_stone: img => { chunkPile(img, ['#3f454a', '#4d555b', '#333940'], 11, 9); for (let i = 0; i < 4; i++) img.set(8 + i * 5, 14 + (i % 3) * 4, '#8fa0a8'); },
  mud_block: img => { box(img, 6, 10, 20, 16, '#4b3e2f'); img.ellipse(13, 16, 4, 2, '#3b3830'); img.hline(11, 15, 5, '#7e8a84'); },
  brick: img => {
    box(img, 4, 11, 24, 12, '#8a5a4b');
    img.hline(4, 17, 24, '#6d6459');
    img.vline(15, 11, 6, '#6d6459'); img.vline(9, 17, 6, '#6d6459'); img.vline(21, 17, 6, '#6d6459');
    img.grain(0.06, 13, [4, 11, 24, 12]);
  },
  concrete_chunk: img => { chunkPile(img, ['#7b7d7b', '#8c8e8b', '#666a68'], 17, 9); for (let k = 0; k < 7; k++) img.set(9 + k, 20 + (k % 2), '#7c5236'); },
  wood: img => {
    for (let i = 0; i < 3; i++) {
      const y = 8 + i * 6;
      const c = shade('#7a5a3c', (i - 1) * 0.1);
      img.rect(4, y, 24, 5, c);
      img.hline(4, y, 24, shade(c, 0.2));
      img.hline(4, y + 4, 24, shade(c, -0.3));
      img.ellipse(10 + i * 6, y + 2, 1.6, 1.2, shade(c, -0.3));
    }
  },
  floor_wood: img => {
    for (let i = 0; i < 4; i++) {
      const y = 7 + i * 5;
      const c = shade('#6f5138', (hash(i, 3, 1) - 0.5) * 0.24);
      img.rect(3, y, 26, 4, c);
      img.hline(3, y, 26, shade(c, 0.18));
      img.set(5, y + 1, '#a8a49a'); img.set(26, y + 1, '#a8a49a');
    }
  },
  plank_wood: img => { for (let i = 0; i < 3; i++) { const y = 9 + i * 5; img.rect(3, y, 26, 4, '#7a5a3c'); img.hline(3, y, 26, '#8f6d4a'); } },
  roof_shingle: img => {
    for (let r = 0; r < 3; r++) for (let x = -6 + (r % 2 ? 5 : 0); x < 30; x += 10) {
      const c = shade('#584a42', (hash(x, r, 1) - 0.5) * 0.3);
      img.rect(Math.max(3, x), 9 + r * 6, Math.min(9, 29 - Math.max(3, x)), 5, c);
      img.hline(Math.max(3, x), 9 + r * 6, Math.min(9, 29 - Math.max(3, x)), shade(c, 0.2));
    }
  },
  roof_metal: img => {
    img.rect(3, 9, 26, 15, '#4f595c');
    for (let x = 3; x < 29; x += 4) { img.vline(x, 9, 15, shade('#4f595c', -0.3)); img.vline(x + 1, 9, 15, shade('#4f595c', 0.26)); }
    img.patches('#7a4a2b', 6, 0.55, 0.7, 19, [3, 9, 26, 15]);
  },
  scrap_metal: img => {
    for (let i = 0; i < 7; i++) {
      const x = 3 + Math.floor(hash(i, 23, 1) * 20), y = 9 + Math.floor(hash(i, 23, 2) * 14);
      const w = 6 + Math.floor(hash(i, 23, 3) * 9), h = 2 + Math.floor(hash(i, 23, 4) * 3);
      const c = ['#6b7275', '#565c5f', '#7d858a'][i % 3];
      img.rect(x, y, w, h, c); img.hline(x, y, w, shade(c, 0.26));
    }
    img.patches('#7a4a2b', 6, 0.6, 0.6, 29);
  },
  nails: img => {
    for (let i = 0; i < 6; i++) {
      const x = 5 + (i % 3) * 8, y = 9 + Math.floor(i / 3) * 9;
      const a = (hash(i, 31, 1) - 0.5) * 0.9;
      handle(img, x, y, x + Math.cos(a) * 7, y + 7, 2, '#8d9295');
      img.rect(x - 1, y - 1, 4, 2, '#a5aaad');
    }
  },
  cloth: img => {
    const c = '#9a8c73';
    img.rect(5, 9, 22, 15, c);
    for (let y = 9; y < 24; y += 3) img.hline(5, y, 22, shade(c, -0.12));
    for (let x = 5; x < 27; x += 3) img.vline(x, 9, 15, shade(c, 0.08));
    img.rect(5, 9, 22, 1, shade(c, 0.25));
    img.rect(20, 20, 7, 4, shade(c, -0.25));
  },
  wire: img => {
    const c = '#6d786f';
    for (let i = 0; i < 3; i++) {
      const r = 10 - i * 2.5;
      img.ellipseOutline(16, 17, r, r * 0.7, i % 2 ? c : shade(c, 0.2));
    }
    img.rect(22, 8, 5, 3, '#a8703c');
  },
  battery: img => {
    box(img, 8, 7, 16, 20, '#3f4a3c');
    img.rect(11, 4, 4, 3, '#9aa0a2'); img.rect(17, 4, 4, 3, '#9aa0a2');
    label(img, 10, 12, 12, 9, '#93864b');
    img.rect(14, 14, 3, 5, '#3b3527'); img.hline(13, 16, 5, '#3b3527');
  },
  engine_parts: img => {
    box(img, 5, 10, 14, 14, '#6a7174');
    img.ellipse(22, 16, 6, 6, '#5c6467');
    img.ellipseOutline(22, 16, 6, 6, '#7d878a');
    img.ellipse(22, 16, 2, 2, '#3f4648');
    img.rect(7, 6, 4, 5, '#7d858a'); img.rect(13, 6, 4, 5, '#7d858a');
    img.patches('#7a4a2b', 5, 0.6, 0.55, 37);
  },
  garage_parts: img => {
    img.rect(4, 12, 11, 4, '#70787a'); img.rect(4, 18, 14, 3, '#5f676a');
    img.ellipse(23, 13, 5, 5, '#6a7174'); img.ellipseOutline(23, 13, 5, 5, '#8a9294');
    img.rect(18, 20, 10, 4, '#7a5a42');
    for (let i = 0; i < 3; i++) img.set(6 + i * 4, 23, '#9aa0a2');
  },
  wheel_set: img => {
    const tyre = '#24262a';
    img.ellipse(11, 18, 9, 9, tyre); img.ellipseOutline(11, 18, 9, 9, '#3c4046');
    img.ellipse(11, 18, 4.5, 4.5, '#7d858a'); img.ellipse(11, 18, 1.6, 1.6, '#4a5052');
    img.ellipse(23, 14, 7, 7, tyre); img.ellipseOutline(23, 14, 7, 7, '#3c4046');
    img.ellipse(23, 14, 3.4, 3.4, '#7d858a');
  },
  body_panels: img => {
    img.rect(3, 8, 24, 8, '#687377'); img.hline(3, 8, 24, '#8a9599');
    img.rect(6, 17, 22, 8, '#5d686c'); img.hline(6, 17, 22, '#7e898d');
    img.patches('#7a4a2b', 6, 0.62, 0.6, 41);
  },
  seat_kit: img => {
    const c = '#6a584c';
    img.rect(8, 6, 13, 13, c); img.hline(8, 6, 13, shade(c, 0.22));
    img.rect(6, 19, 17, 6, shade(c, -0.1)); img.hline(6, 19, 17, shade(c, 0.16));
    for (let y = 8; y < 18; y += 3) img.hline(9, y, 11, shade(c, -0.18));
    img.rect(7, 25, 3, 3, '#4a4d4e'); img.rect(19, 25, 3, 3, '#4a4d4e');
  },
  fuel_tank: img => {
    box(img, 4, 10, 24, 14, '#875b48');
    img.rect(12, 6, 7, 5, '#5f6668'); img.hline(12, 6, 7, '#7d858a');
    img.rect(6, 14, 20, 2, shade('#875b48', -0.3));
    img.patches('#7a4a2b', 6, 0.6, 0.55, 43);
  },
  suspension_kit: img => {
    const c = '#747c7e';
    img.rect(13, 4, 6, 5, c);
    for (let y = 9; y < 23; y += 3) { img.hline(10, y, 12, '#93999b'); img.hline(11, y + 1, 10, shade(c, -0.3)); }
    img.rect(13, 23, 6, 5, c);
    img.vline(16, 9, 14, shade(c, -0.15));
  },
  headlight_kit: img => {
    img.ellipse(11, 15, 8, 8, '#4f5658');
    img.ellipse(11, 15, 6, 6, '#c9bd82'); img.ellipse(9, 13, 2.4, 2.4, '#efe6bd');
    img.ellipse(23, 19, 5, 5, '#4f5658'); img.ellipse(23, 19, 3.4, 3.4, '#c9bd82');
    handle(img, 16, 24, 26, 27, 2, '#6d786f');
  },
  filter_cartridge: img => {
    box(img, 9, 6, 14, 20, '#78847c');
    img.rect(11, 9, 10, 4, '#5c6864');
    for (let y = 15; y < 24; y += 3) img.hline(11, y, 10, '#909c94');
    img.rect(12, 3, 8, 4, '#5f6a66');
  },
  blackridge_keycard: img => {
    box(img, 5, 9, 22, 15, '#59656b');
    img.rect(7, 11, 8, 6, '#8fa39a');
    img.rect(17, 12, 8, 2, '#3b4348'); img.rect(17, 15, 6, 2, '#3b4348');
    img.rect(7, 19, 18, 3, '#2f373a');
    img.set(23, 20, '#9ab0a4');
  },
  county_scrip: img => {
    for (let i = 0; i < 3; i++) {
      const y = 9 + i * 5;
      img.rect(4 + i, y, 24, 5, i === 2 ? '#b99557' : shade('#b99557', -0.12));
      img.hline(4 + i, y, 24, '#d4b478');
      img.rect(13 + i, y + 1, 6, 3, '#8a6f3f');
    }
  },
  fuel_can: img => {
    const c = '#9a5b45';
    box(img, 5, 8, 20, 19, c);
    img.rect(9, 4, 5, 5, shade(c, -0.2));
    handle(img, 14, 5, 22, 8, 3, shade(c, -0.15));
    img.rect(8, 13, 14, 8, shade(c, -0.22));
    img.rect(11, 15, 8, 4, '#c4b078');
    img.hline(6, 24, 18, shade(c, -0.35));
  },

  /* ------------------------------------------------------------- tools */
  stone_pickaxe: img => {
    handle(img, 9, 27, 20, 8, 3, '#7a5a3c');
    img.rect(13, 4, 12, 4, '#8d9294');
    img.line(13, 7, 8, 11, '#7d8285'); img.line(25, 7, 29, 11, '#7d8285');
    img.rect(12, 3, 14, 2, '#a3a8aa');
    img.rect(16, 8, 5, 3, '#5a4632');
  },
  stone_axe: img => {
    handle(img, 11, 28, 18, 7, 3, '#8b6548');
    img.rect(16, 4, 9, 11, '#8d9294');
    img.rect(15, 6, 3, 8, '#6f7477');
    img.hline(16, 4, 9, '#a9aeb0');
    img.line(25, 4, 25, 14, '#b6bbbd');
    img.rect(15, 14, 5, 3, '#5a4632');
  },
  crowbar: img => {
    handle(img, 7, 26, 22, 8, 3, '#7d8589');
    img.rect(20, 4, 4, 6, '#8e979b');
    img.line(22, 4, 27, 7, '#8e979b'); img.line(22, 5, 27, 8, '#6f787c');
    img.rect(6, 25, 5, 4, '#6a7276');
    img.patches('#7a4a2b', 5, 0.68, 0.5, 47);
  },
  repair_hammer: img => {
    handle(img, 12, 28, 16, 9, 3, '#9b744f');
    img.rect(9, 5, 15, 6, '#6f767a');
    img.rect(8, 6, 3, 4, '#8b9296');
    img.rect(22, 4, 4, 8, '#5f676a');
    img.hline(9, 5, 15, '#9aa1a5');
  },
  flashlight: img => {
    const c = '#5f6a66';
    img.rect(6, 12, 15, 8, c);
    img.hline(6, 12, 15, shade(c, 0.24));
    img.rect(21, 9, 6, 14, shade(c, -0.1));
    img.rect(26, 11, 3, 10, '#c9b978');
    img.rect(27, 13, 3, 6, '#efe2ab');
    img.rect(9, 14, 8, 2, shade(c, -0.3));
    img.rect(4, 14, 3, 4, '#3f4648');
  },

  /* -------------------------------------------------------- consumables */
  canned_food: img => {
    const c = '#8c8f8a';
    img.rect(8, 6, 16, 21, c);
    img.ellipse(16, 6, 8, 2.6, shade(c, 0.26));
    img.ellipse(16, 26, 8, 2.4, shade(c, -0.3));
    label(img, 8, 11, 16, 11, '#a36f4c', '#e0cba0');
    img.vline(10, 8, 18, shade(c, 0.3));
    img.ellipseOutline(16, 6, 6, 1.8, shade(c, -0.2));
  },
  snack_bar: img => {
    const c = '#b28d54';
    img.rect(4, 11, 24, 11, c);
    img.hline(4, 11, 24, shade(c, 0.24));
    img.hline(4, 21, 24, shade(c, -0.3));
    for (let x = 6; x < 27; x += 4) img.vline(x, 11, 11, shade(c, -0.1));
    img.rect(2, 13, 3, 7, shade(c, -0.25)); img.rect(27, 13, 3, 7, shade(c, -0.25));
    img.rect(10, 14, 12, 4, '#6a4a30');
  },
  berries: img => {
    const berry = '#9f4d58', hi = '#c0757c';
    for (const [x, y, r] of [[11, 18, 4], [20, 16, 4], [15, 23, 3.4], [22, 23, 3]]) {
      img.ellipse(x, y, r, r, berry);
      img.ellipse(x - r * 0.35, y - r * 0.35, r * 0.35, r * 0.35, hi);
    }
    img.line(15, 14, 13, 7, '#4e6b36'); img.line(16, 14, 19, 8, '#4e6b36');
    img.ellipse(12, 7, 3, 2, '#55763c'); img.ellipse(20, 8, 3, 2, '#55763c');
  },
  water_bottle: img => bottle(img, '#8ca6ae', '#5f93ab', 0.85),
  soda: img => {
    const c = '#8d5b57';
    img.rect(9, 6, 14, 21, c);
    img.ellipse(16, 6, 7, 2.4, shade(c, 0.24));
    label(img, 9, 12, 14, 9, '#b9a14e');
    img.rect(13, 14, 7, 5, '#6a3f3c');
    img.rect(13, 4, 6, 2, '#a5aaad');
  },
  empty_bottle: img => bottle(img, '#94a5ad', '#94a5ad', 0),
  medicine: img => {
    box(img, 4, 9, 24, 17, '#b0aa9c');
    img.rect(4, 9, 24, 3, '#c6c0b0');
    img.rect(13, 13, 6, 10, '#a83f3c'); img.rect(9, 15, 14, 6, '#a83f3c');
    img.rect(6, 24, 20, 2, '#8a8478');
    img.rect(13, 6, 6, 3, '#7d786c');
  },
  bandage: img => {
    const c = '#d8d0bd';
    img.ellipse(16, 16, 11, 9, c);
    img.ellipse(16, 16, 6, 5, shade(c, -0.14));
    img.ellipse(16, 16, 3, 2.4, shade(c, -0.28));
    for (let i = 0; i < 4; i++) img.line(8 + i * 4, 8, 6 + i * 4, 24, shade(c, -0.08));
    img.rect(5, 12, 5, 8, shade(c, 0.1));
  },
  disinfectant: img => {
    const c = '#9bb0a2';
    img.rect(10, 8, 12, 19, c);
    img.hline(10, 8, 12, shade(c, 0.24));
    img.rect(12, 4, 8, 5, '#5f6a66');
    img.rect(13, 2, 6, 3, '#4f5a56');
    label(img, 11, 13, 10, 9, '#d8d0bd');
    img.rect(14, 15, 4, 5, '#6d8a76');
  },

  /* ---------------------------------------------------------- clothing */
  rain_jacket: img => {
    const c = '#4a6259';
    img.rect(8, 7, 16, 18, c);
    img.rect(4, 8, 5, 12, shade(c, -0.15)); img.rect(23, 8, 5, 12, shade(c, -0.22));
    img.hline(8, 7, 16, shade(c, 0.26));
    img.rect(10, 4, 12, 4, shade(c, 0.1));
    img.vline(16, 9, 16, shade(c, -0.35));
    img.rect(10, 18, 4, 4, shade(c, -0.22)); img.rect(18, 18, 4, 4, shade(c, -0.22));
  },
  wool_coat: img => {
    const c = '#6b5f55';
    img.rect(7, 6, 18, 22, c);
    img.rect(3, 8, 5, 13, shade(c, -0.15)); img.rect(24, 8, 5, 13, shade(c, -0.22));
    img.rect(10, 3, 12, 4, shade(c, 0.14));
    img.vline(16, 8, 20, shade(c, -0.3));
    img.grain(0.07, 53, [7, 6, 18, 22]);
    for (let y = 10; y < 24; y += 5) img.set(14, y, '#a49685');
  },
  hazmat_coat: img => {
    const c = '#9a8b52';
    img.rect(7, 6, 18, 22, c);
    img.rect(3, 8, 5, 13, shade(c, -0.15)); img.rect(24, 8, 5, 13, shade(c, -0.22));
    img.rect(10, 3, 12, 4, shade(c, 0.16));
    img.vline(16, 8, 20, shade(c, -0.3));
    img.rect(9, 11, 6, 5, '#3f4a3f');
    img.rect(18, 20, 6, 4, '#c4b878');
  },
  wool_hat: img => {
    const c = '#735d57';
    img.ellipse(16, 16, 10, 8, c);
    img.rect(6, 17, 20, 5, shade(c, 0.14));
    img.hline(6, 17, 20, shade(c, 0.3));
    img.hline(6, 21, 20, shade(c, -0.3));
    img.grain(0.08, 59, [6, 8, 20, 14]);
    img.ellipse(16, 7, 3, 2, shade(c, 0.2));
  },
  work_boots: img => {
    const c = '#554638';
    img.rect(5, 12, 10, 10, c); img.rect(3, 20, 14, 5, shade(c, -0.25));
    img.rect(17, 14, 10, 8, c); img.rect(15, 20, 14, 5, shade(c, -0.25));
    img.hline(5, 12, 10, shade(c, 0.22)); img.hline(17, 14, 10, shade(c, 0.22));
    img.hline(3, 24, 14, '#2f2822'); img.hline(15, 24, 14, '#2f2822');
    for (let i = 0; i < 3; i++) { img.set(8 + i, 15 + i, '#a89c84'); img.set(20 + i, 17 + i, '#a89c84'); }
  },
  respirator: img => {
    const c = '#69756f';
    img.ellipse(16, 16, 10, 9, c);
    img.rect(6, 12, 20, 3, shade(c, -0.25));
    img.ellipse(11, 18, 4, 4, shade(c, -0.15)); img.ellipse(21, 18, 4, 4, shade(c, -0.15));
    img.ellipse(11, 18, 2, 2, '#3f4a46'); img.ellipse(21, 18, 2, 2, '#3f4a46');
    img.rect(13, 9, 6, 4, '#8fa39a');
    img.hline(4, 13, 4, shade(c, -0.3)); img.hline(24, 13, 4, shade(c, -0.3));
  },

  /* ---- Stage 27 arsenal ------------------------------------------------
   * Civilian kit is scavenged and mismatched, service kit is issued navy with
   * a hi-vis marker, Blackridge is slate with one cyan status accent. Nothing
   * here copies a real product; they are game silhouettes.
   */

  hatchet: img => {
    handle(img, 6, 27, 17, 17, 5, '#755742');
    img.rect(4, 25, 6, 5, '#3d3226');
    for (const y of [24, 21]) img.rect(8 + (27 - y), y, 4, 2, '#5a4a3a');   // tape
    img.rect(15, 13, 5, 6, '#5f666a');                                      // poll / eye
    // wedge head: widens away from the haft and ends on a bright straight edge
    for (let i = 0; i < 10; i++) {
      const x = 19 + i;
      const up = 3 + Math.round(i * .62), dn = 3 + Math.round(i * .38);
      for (let y = 16 - up; y <= 16 + dn; y++) {
        img.set(x, y, i > 7 ? '#dfe6e8' : y === 16 - up ? '#a6adb0' : y === 16 + dn ? '#5f666a' : '#8a9094');
      }
    }
  },
  wrecking_bar: img => {
    handle(img, 5, 26, 23, 10, 5, '#677276');
    for (const [x, y] of [[11, 20], [16, 15]]) img.rect(x, y, 4, 2, '#4d585c');
    // claw: out of the bar, curled back
    for (const [x, y] of [[23, 10], [25, 8], [27, 6], [28, 4], [26, 3], [24, 3]]) img.rect(x, y, 3, 3, '#5c666a');
    img.rect(23, 2, 3, 2, '#c2cacd');
    // flattened chisel end
    img.rect(2, 25, 6, 5, '#485054');
    img.rect(1, 28, 4, 2, '#cfd7da');
    img.patches('#6b4326', 7, 0.72, 0.42, 19);
  },
  rescue_mallet: img => {
    handle(img, 6, 27, 19, 12, 4, '#7a5f4b');
    img.rect(4, 25, 6, 5, '#2f3a3e');
    img.rect(13, 18, 4, 3, '#c8a34e');                                // hi-vis band
    box(img, 17, 4, 12, 11, '#8a9195');
    img.rect(20, 8, 5, 4, shade('#8a9195', -0.16));
  },

  civilian_carbine: img => {
    const wood = '#7a6a4f', metal = '#5a6164';
    for (let i = 0; i < 10; i++) { const x = 2 + i, y = 19 - Math.round(i * .18); img.set(x, y, shade(wood, .2)); img.set(x, y + 1, wood); img.set(x, y + 2, wood); img.set(x, y + 3, shade(wood, -.3)); }
    img.rect(11, 14, 9, 5, wood);
    img.hline(11, 14, 9, shade(wood, .22));
    for (let i = 0; i < 12; i++) { const x = 19 + i, y = 14; img.set(x, y, shade(metal, .22)); img.set(x, y + 1, metal); img.set(x, y + 2, shade(metal, -.3)); }
    img.rect(19, 18, 7, 3, wood);
    img.set(30, 12, '#8b9296'); img.set(14, 12, '#8b9296');
    img.rect(13, 19, 3, 4, '#2b2f30');
    img.patches('#4a3a26', 6, 0.72, 0.42, 23);
  },
  compact_carbine: img => {
    const body = '#596064';
    img.rect(3, 15, 8, 5, '#3f4548');
    box(img, 10, 13, 11, 7, body);
    img.rect(12, 10, 8, 2, '#464d51');                                // rail
    for (let i = 0; i < 9; i++) { const x = 20 + i; img.set(x, 14, shade(body, .22)); img.set(x, 15, body); img.set(x, 16, shade(body, -.3)); }
    img.rect(20, 18, 6, 3, '#3f4649');
    img.rect(14, 20, 4, 7, '#3a4145');                                // magazine
    img.rect(12, 20, 2, 3, '#22282b');
  },
  security_pistol: img => {
    const c = '#50585c';
    box(img, 4, 10, 22, 6, c);
    img.rect(24, 11, 4, 3, shade(c, .08));
    img.rect(5, 8, 3, 2, shade(c, .32));
    img.rect(7, 16, 8, 12, '#2f3639');                                // grip
    for (let y = 18; y < 27; y += 2) img.hline(8, y, 6, shade('#2f3639', -0.3));
    img.rect(15, 16, 4, 4, '#3f474b');
    img.set(16, 17, '#23282a');
    for (let x = 17; x < 23; x += 2) img.set(x, 17, '#2b3236');       // rail
  },
  patrol_shotgun: img => {
    const navy = '#4d565a';
    for (let i = 0; i < 10; i++) { const x = 2 + i, y = 19 - Math.round(i * .3); img.set(x, y, shade('#3f464a', .2)); img.set(x, y + 1, '#3f464a'); img.set(x, y + 2, '#3f464a'); img.set(x, y + 3, shade('#3f464a', -.3)); }
    box(img, 11, 13, 8, 7, navy);
    for (let i = 0; i < 13; i++) { const x = 18 + i; img.set(x, 13, shade('#5a6367', .22)); img.set(x, 14, '#5a6367'); img.set(x, 15, shade('#5a6367', -.3)); }
    img.rect(20, 11, 10, 2, '#414a4e');                               // heat shield
    for (const x of [23, 27]) img.vline(x, 11, 2, '#2a3134');
    img.rect(19, 17, 8, 3, '#2f3639');                                // pump
    img.rect(12, 19, 3, 4, '#22282b');
  },
  blackridge_smg: img => {
    const c = '#435158';
    img.rect(3, 14, 6, 5, '#2f3a40');
    box(img, 8, 12, 13, 7, c);
    img.rect(11, 9, 8, 2, '#37444a');
    for (let i = 0; i < 8; i++) { const x = 20 + i; img.set(x, 13, shade(c, .2)); img.set(x, 14, c); img.set(x, 15, shade(c, -.3)); }
    img.hline(12, 10, 5, '#6fc4bb');                                  // status strip
    img.rect(13, 19, 4, 8, '#263035');
    img.rect(10, 19, 2, 3, '#1b2327');
  },
  blackridge_marksman: img => {
    const c = '#45545a';
    for (let i = 0; i < 10; i++) { const x = 1 + i, y = 18; img.set(x, y, shade('#38444a', .2)); img.set(x, y + 1, '#38444a'); img.set(x, y + 2, shade('#38444a', -.3)); }
    box(img, 10, 13, 11, 7, c);
    for (let i = 0; i < 9; i++) { const x = 20 + i; img.set(x, 14, shade(c, .2)); img.set(x, 15, c); img.set(x, 16, shade(c, -.3)); }
    img.rect(27, 13, 4, 5, '#333f45');                                // can
    img.rect(11, 8, 11, 4, '#3a484e');                                // optic
    img.hline(11, 8, 11, shade('#3a484e', .34));
    img.rect(21, 9, 2, 2, '#8fd6cc');
    img.rect(15, 20, 4, 7, '#263035');
    img.rect(12, 20, 2, 3, '#1b2327');
  },

  /* ---- Stage 27 components: abstract salvage, not blueprints ---- */

  weapon_parts: img => {
    chunkPile(img, ['#687174', '#7d8689', '#525a5d'], 11, 12);
    img.rect(8, 9, 12, 3, '#7d8689');
    img.hline(8, 9, 12, '#99a2a5');
    for (let i = 0; i < 4; i++) img.set(10 + i * 3, 10, '#3f4649');   // pin holes
  },
  spring_parts: img => {
    for (const [ox, oy, h] of [[6, 8, 14], [16, 12, 12], [23, 7, 10]]) {
      for (let j = 0; j < h; j++) {
        const w = 5 - Math.abs((j % 4) - 2);
        img.hline(ox, oy + j, w, j % 2 ? '#8d9598' : '#666e71');
      }
    }
  },
  precision_parts: img => {
    box(img, 5, 12, 9, 9, '#78888c');
    img.ellipse(9.5, 16.5, 3, 3, '#a9bcc0');
    img.ellipse(9.5, 16.5, 1.4, 1.4, '#48585c');
    for (const [x, y] of [[18, 9], [24, 13], [19, 20], [25, 22]]) {
      img.rect(x, y, 4, 3, '#8d9ea2');
      img.hline(x, y, 4, '#b3c3c6');
    }
  },
  damaged_weapon_frame: img => {
    const c = '#555d60';
    box(img, 4, 12, 20, 7, c);
    img.rect(20, 15, 8, 5, shade(c, -0.2));                           // bent section
    img.rect(24, 17, 5, 4, shade(c, -0.34));
    for (let i = 0; i < 5; i++) img.set(11 + i, 12 + (i % 2), '#2c3234');  // crack
    img.rect(8, 19, 5, 7, shade(c, -0.12));
    img.patches('#7a4a2b', 6, 0.6, 0.55, 41);
  },
  maintenance_kit: img => {
    box(img, 3, 13, 20, 13, '#8b795d');
    img.hline(3, 17, 20, '#6a5a44');
    img.rect(10, 11, 6, 3, '#6a5a44');                                // handle
    handle(img, 22, 22, 28, 9, 3, '#5d4e3a');                         // brush
    img.rect(26, 6, 5, 5, '#39434a');
    bottle(img, '#4d6b5e', '#b9a44c', 0.5);
  },
  optic_module: img => {
    const c = '#60747b';
    for (let i = 0; i < 18; i++) { const x = 7 + i; img.set(x, 12, shade(c, .26)); img.set(x, 13, c); img.set(x, 14, c); img.set(x, 15, shade(c, -.3)); }
    img.rect(5, 10, 4, 8, shade(c, -0.12));                           // eyepiece
    img.rect(23, 9, 5, 10, shade(c, -0.12));                          // objective
    img.ellipse(25.5, 14, 2, 3.6, '#a8d2d6');
    img.set(25, 12, '#dff0f2');
    img.rect(13, 8, 4, 3, '#44555b');                                 // turret
    img.rect(11, 18, 12, 3, '#3b4a4f');                               // mount
  },
  stability_module: img => {
    const c = '#59656a';
    box(img, 6, 10, 16, 12, c);
    for (const y of [13, 17]) { img.hline(7, y, 14, shade(c, -0.34)); img.hline(7, y + 1, 14, shade(c, 0.1)); }
    img.rect(21, 13, 6, 6, shade(c, -0.2));                           // port
    img.rect(3, 14, 4, 4, shade(c, 0.16));
  },
  handling_module: img => {
    const c = '#6f6757';
    img.rect(9, 7, 8, 5, shade(c, 0.12));                             // rail clamp
    for (let j = 0; j < 12; j++) {
      const w = 7 - Math.round(j * 0.25);
      img.rect(10 + Math.round(j * 0.3), 12 + j, w, 1, j % 3 === 0 ? shade(c, -0.26) : c);
    }
    for (let i = 0; i < 12; i++) img.set(3 + i, 22 + Math.round(i * -0.3), '#4a4437');   // sling
    img.rect(2, 21, 4, 4, '#3a3529');
  },
  ammo_carbine: img => {
    for (let i = 0; i < 4; i++) {
      const x = 5 + i * 6, y = 10 + (i % 2) * 5;
      img.rect(x, y, 4, 10, '#7c8467');                               // case
      img.hline(x, y, 4, '#9aa384');
      img.rect(x, y + 10, 4, 3, '#606850');                           // rim
      img.rect(x + 1, y - 3, 2, 3, '#b8a06a');                        // bullet
      img.set(x + 1, y - 4, '#d0bb84');
    }
  }

};

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let n = 0;
  for (const [name, draw] of Object.entries(ITEMS)) {
    icon(draw).save(path.join(OUT, `${name}.png`), 16);
    n++;
  }
  console.log(`items: ${n}`);
}

main();
