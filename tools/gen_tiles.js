// LAST COUNTY — procedural tileset.
// 32x32, three variants per material, top-lit, rural post-apocalyptic palette.
const fs = require('fs');
const path = require('path');
const { Img, shade, mix, hash, vnoise } = require('./pixel');

const OUT = path.join(__dirname, '..', 'assets', 'tiles');
const S = 32;

/* ---------------------------------------------------------------- helpers */

function base(img, color, seed, opts = {}) {
  img.fill(color);
  img.weather(opts.blotchScale || 9, opts.blotch ?? 0.1, seed);
  img.grain(opts.grain ?? 0.045, seed + 17);
}

// Soft top highlight + bottom shade so stacked tiles read as volume.
function bevel(img, top = 0.1, bottom = 0.12) {
  for (let x = 0; x < S; x++) {
    img.shadeAt(x, 0, top);
    img.shadeAt(x, 1, top * 0.45);
    img.shadeAt(x, S - 1, -bottom);
    img.shadeAt(x, S - 2, -bottom * 0.5);
  }
  for (let y = 0; y < S; y++) {
    img.shadeAt(0, y, top * 0.3);
    img.shadeAt(S - 1, y, -bottom * 0.55);
  }
}

function pebbles(img, count, colors, seed, y0 = 0, y1 = S) {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(hash(i, seed, 3) * S);
    const y = y0 + Math.floor(hash(i, seed, 5) * (y1 - y0));
    const w = 1 + Math.floor(hash(i, seed, 7) * 2);
    const h = 1 + Math.floor(hash(i, seed, 11) * 2);
    const c = colors[Math.floor(hash(i, seed, 13) * colors.length)];
    img.rect(x, y, w, h, c);
    img.hline(x, y - 1 >= 0 ? y - 1 : y, w, shade(c, 0.18));
  }
}

function cracks(img, count, color, seed, len = 14) {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(hash(i, seed, 23) * S);
    const y = Math.floor(hash(i, seed, 29) * S);
    const dir = hash(i, seed, 31) * Math.PI * 2;
    img.crack(x, y, len + Math.floor(hash(i, seed, 37) * 8), dir, color, seed + i);
  }
}

/* ------------------------------------------------------------- vegetation */

function grassCrust(img, v, palette) {
  const { deep, mid, light, tip, soil } = palette;
  const heights = [];
  for (let x = 0; x < S; x++) {
    heights[x] = 6 + Math.round(vnoise(x, v * 40, 6, v) * 5);
  }
  for (let x = 0; x < S; x++) {
    const h = heights[x];
    for (let y = 0; y < h; y++) {
      const t = y / Math.max(1, h);
      let c = t < 0.18 ? tip : t < 0.5 ? light : t < 0.8 ? mid : deep;
      if (hash(x, y, v + 90) > 0.86) c = shade(c, -0.12);
      img.set(x, y, c);
    }
    // roots reaching into the soil
    if (hash(x, 3, v + 12) > 0.72) {
      const depth = h + 1 + Math.floor(hash(x, 9, v) * 4);
      for (let y = h; y < depth; y++) img.set(x, y, mix(deep, soil, (y - h) / 3));
    }
  }
  // blades standing above the crust line
  for (let i = 0; i < 9; i++) {
    const x = Math.floor(hash(i, v, 41) * S);
    const h = 2 + Math.floor(hash(i, v, 43) * 3);
    const lean = hash(i, v, 47) > 0.5 ? 1 : -1;
    for (let j = 0; j < h; j++) img.set(x + (j > 1 ? lean : 0), heights[x] - h + j - 1, j === 0 ? tip : light);
  }
}

function grassTile(v, palette, soilColor) {
  const img = new Img(S, S);
  base(img, soilColor, v * 7, { blotch: 0.13, blotchScale: 7, grain: 0.05 });
  pebbles(img, 5, [shade(soilColor, -0.2), shade(soilColor, 0.14)], v * 3, 12, S - 2);
  grassCrust(img, v, { ...palette, soil: soilColor });
  bevel(img, 0.06, 0.14);
  return img;
}

function tallGrassTile(v, palette) {
  const img = new Img(S, S);
  const blades = 11 + Math.floor(hash(v, 5, 1) * 5);
  for (let i = 0; i < blades; i++) {
    const x = 1 + Math.floor(hash(i, v, 61) * (S - 2));
    const h = 12 + Math.floor(hash(i, v, 67) * 17);
    const lean = (hash(i, v, 71) - 0.5) * 6;
    for (let j = 0; j < h; j++) {
      const t = j / h;
      const xx = Math.round(x + lean * t * t);
      const c = t > 0.82 ? palette.tip : t > 0.45 ? palette.light : palette.mid;
      img.set(xx, S - 1 - j, c);
      if (j < h * 0.5 && hash(i, j, v) > 0.7) img.set(xx + 1, S - 1 - j, palette.deep);
    }
  }
  // ground shadow at the base so it sits on the tile below
  for (let x = 0; x < S; x++) if (hash(x, v, 83) > 0.35) img.set(x, S - 1, palette.deep);
  return img;
}

function vineTile(v) {
  const img = new Img(S, S);
  const green = '#4a6b3c', dark = '#33512b', light = '#6b8c48';
  for (let k = 0; k < 2; k++) {
    let x = 6 + k * 14 + Math.floor(hash(k, v, 3) * 5);
    for (let y = 0; y < S; y++) {
      x += Math.round((vnoise(y, k * 10 + v, 7, v) - 0.5) * 1.6);
      img.set(x, y, dark);
      img.set(x + 1, y, green);
      if (y % 4 === (k + v) % 4) {
        const dir = y % 8 < 4 ? 1 : -1;
        img.rect(x + (dir > 0 ? 2 : -3), y, 3, 2, green);
        img.set(x + (dir > 0 ? 4 : -3), y, light);
      }
    }
  }
  return img;
}

function flowersTile(v) {
  const img = new Img(S, S);
  const stalk = '#7c7448', dry = '#8e8452';
  const heads = ['#9d7b5a', '#8a6f7a', '#a08a53'];
  for (let i = 0; i < 6 + (v % 3); i++) {
    const x = 3 + Math.floor(hash(i, v, 13) * (S - 6));
    const h = 8 + Math.floor(hash(i, v, 17) * 12);
    for (let j = 0; j < h; j++) img.set(x + Math.round(Math.sin(j * 0.3) * 1.2), S - 1 - j, j > h - 3 ? dry : stalk);
    const hc = heads[i % heads.length];
    img.rect(x - 1, S - 1 - h - 1, 3, 2, hc);
    img.set(x, S - 2 - h, shade(hc, 0.22));
  }
  return img;
}

function leafTile(v) {
  const img = new Img(S, S);
  const deep = '#243a24', mid = '#31492d', light = '#3e5c35', tip = '#4d7040';
  // clustered foliage with real gaps so canopies read as leaves, not a green wall
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = vnoise(x, y, 7, v * 3) * 0.6 + vnoise(x, y, 3.2, v * 5) * 0.4;
      if (n < 0.47) continue;
      let c = n > 0.76 ? light : n > 0.62 ? mid : deep;
      if (hash(x, y, v) > 0.88) c = shade(c, -0.2);
      img.set(x, y, c);
    }
  }
  for (let i = 0; i < 7; i++) {
    const x = Math.floor(hash(i, v, 5) * (S - 6)) + 3;
    const y = Math.floor(hash(i, v, 7) * (S - 6)) + 3;
    img.ellipse(x, y, 3.2, 2.2, mid);
    img.ellipse(x - 1, y - 1, 1.8, 1.2, tip);
    img.ellipseOutline(x, y, 3.6, 2.6, deep);
  }
  // dry / dying leaves scattered through the canopy
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(hash(i, v, 11) * S), y = Math.floor(hash(i, v, 13) * S);
    if (img.get(x, y)[3] < 8) continue;
    img.rect(x, y, 2, 1, '#6b5d33');
  }
  img.volume(0.15);
  return img;
}

function berryBushTile(v) {
  const img = new Img(S, S);
  const deep = '#2c4429', mid = '#3c5c34', light = '#4f7440';
  for (let y = 6; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const cx = (x - 16) / 15, cy = (y - 22) / 13;
      const n = vnoise(x, y, 5, v) * 0.5;
      if (cx * cx + cy * cy > 1.05 + n * 0.5) continue;
      let c = y < 14 ? light : y < 22 ? mid : deep;
      if (hash(x, y, v + 3) > 0.82) c = shade(c, 0.12);
      img.set(x, y, c);
    }
  }
  const berry = '#8e4450', hi = '#b1636a';
  for (let i = 0; i < 6; i++) {
    const x = 6 + Math.floor(hash(i, v, 19) * 20);
    const y = 12 + Math.floor(hash(i, v, 23) * 14);
    img.ellipse(x, y, 1.6, 1.6, berry);
    img.set(x - 1, y - 1, hi);
  }
  img.volume(0.12);
  return img;
}

/* ------------------------------------------------------------------ soils */

function dirtTile(v, color, opts = {}) {
  const img = new Img(S, S);
  base(img, color, v * 11, { blotch: opts.blotch ?? 0.15, blotchScale: 8, grain: 0.055 });
  pebbles(img, 9, [shade(color, -0.26), shade(color, 0.16), shade(color, -0.12)], v * 5);
  for (let i = 0; i < 4; i++) {
    const x = Math.floor(hash(i, v, 3) * S), y = Math.floor(hash(i, v, 9) * S);
    img.rect(x, y, 2 + (i % 2), 1, shade(color, -0.3));
  }
  if (opts.dryCracks) cracks(img, 3, shade(color, -0.3), v * 13, 10);
  if (opts.wetSheen) {
    for (let i = 0; i < 7; i++) {
      const x = Math.floor(hash(i, v, 27) * S), y = Math.floor(hash(i, v, 33) * S);
      img.hline(x, y, 2 + Math.floor(hash(i, v, 39) * 3), shade(color, 0.26));
    }
  }
  bevel(img, 0.07, 0.13);
  return img;
}

function mudTile(v) {
  const img = new Img(S, S);
  const c = '#4b3e2f';
  base(img, c, v * 19, { blotch: 0.22, blotchScale: 11, grain: 0.04 });
  // standing water pooling in the ruts
  for (let i = 0; i < 4; i++) {
    const x = 3 + Math.floor(hash(i, v, 41) * (S - 10));
    const y = 5 + Math.floor(hash(i, v, 43) * (S - 12));
    const w = 6 + Math.floor(hash(i, v, 47) * 10);
    img.ellipse(x + w / 2, y, w / 2, 2.2, '#3b3830');
    img.ellipse(x + w / 2, y, w / 2 - 1, 1.5, '#4a4f49');
    img.hline(x + 2, y - 1, Math.max(2, Math.floor(w / 2)), '#7e8a84');
  }
  // boot / tyre ruts
  for (let i = 0; i < 3; i++) {
    const y = 6 + Math.floor(hash(i, v, 53) * 22);
    img.hline(0, y, S, shade(c, -0.28));
    img.hline(0, y + 1, S, shade(c, 0.16));
  }
  pebbles(img, 5, [shade(c, -0.32), shade(c, 0.12)], v * 7);
  bevel(img, 0.05, 0.14);
  return img;
}

function gravelTile(v) {
  const img = new Img(S, S);
  base(img, '#4f4d48', v * 23, { blotch: 0.1, grain: 0.05 });
  const tones = ['#7b7871', '#6a6760', '#8a877e', '#5b5852', '#928f85'];
  for (let i = 0; i < 64; i++) {
    const x = Math.floor(hash(i, v, 53) * S), y = Math.floor(hash(i, v, 59) * S);
    const w = 2 + Math.floor(hash(i, v, 61) * 2), h = 1 + Math.floor(hash(i, v, 67) * 2);
    const c = tones[Math.floor(hash(i, v, 71) * tones.length)];
    img.rect(x, y, w, h, c);
    img.hline(x, y, w, shade(c, 0.2));
    img.hline(x, y + h, w, shade(c, -0.3));
  }
  bevel(img, 0.06, 0.12);
  return img;
}

/* ------------------------------------------------------------------ rocks */

function stoneTile(v, color, opts = {}) {
  const img = new Img(S, S);
  base(img, color, v * 29, { blotch: 0.05, grain: 0.035 });
  // faceted blocks
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = vnoise(x, y, 8, v * 3);
      const step = n > 0.66 ? 0.14 : n > 0.5 ? 0.05 : n > 0.34 ? -0.05 : -0.14;
      img.shadeAt(x, y, step);
    }
  }
  for (let i = 0; i < 5; i++) {
    const x = 2 + Math.floor(hash(i, v, 73) * (S - 8));
    const y = 2 + Math.floor(hash(i, v, 79) * (S - 8));
    const w = 5 + Math.floor(hash(i, v, 83) * 8), h = 3 + Math.floor(hash(i, v, 89) * 5);
    img.hline(x, y, w, shade(color, 0.2));
    img.hline(x, y + h, w, shade(color, -0.28));
    img.vline(x, y, h, shade(color, 0.1));
  }
  cracks(img, opts.crackCount ?? 2, shade(color, -0.38), v * 31, opts.crackLen ?? 12);
  if (opts.glints) {
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(hash(i, v, 97) * S), y = Math.floor(hash(i, v, 101) * S);
      img.set(x, y, opts.glintColor || shade(color, 0.42));
    }
  }
  bevel(img, 0.1, 0.16);
  return img;
}

/* ------------------------------------------------------------------ urban */

function concreteTile(v, cracked) {
  const img = new Img(S, S);
  const c = '#787a77';
  base(img, c, v * 37, { blotch: 0.075, blotchScale: 12, grain: 0.038 });
  // aggregate
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(hash(i, v, 103) * S), y = Math.floor(hash(i, v, 107) * S);
    img.set(x, y, hash(i, v, 109) > 0.5 ? shade(c, 0.2) : shade(c, -0.22));
  }
  // formwork seam
  const seam = 8 + ((v * 9) % 16);
  img.hline(0, seam, S, shade(c, -0.14));
  img.hline(0, seam + 1, S, shade(c, 0.08));
  img.patches('#6d7264', 13, 0.6, 0.35, v * 5); // damp / lichen
  if (cracked) {
    cracks(img, 3, shade(c, -0.42), v * 41, 17);
    // exposed rebar
    const ry = 18 + (v % 6);
    for (let x = 4; x < 22; x++) img.set(x, ry + Math.round(Math.sin(x * 0.6) * 0.6), '#7a5237');
    img.rect(3 + (v % 5) * 4, 24, 5, 4, shade(c, -0.3));
  }
  bevel(img, 0.09, 0.13);
  return img;
}

function asphaltTile(v, opts = {}) {
  const img = new Img(S, S);
  const c = '#3f4245';
  base(img, c, v * 43, { blotch: 0.09, blotchScale: 10, grain: 0.07 });
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(hash(i, v, 113) * S), y = Math.floor(hash(i, v, 127) * S);
    img.set(x, y, hash(i, v, 131) > 0.45 ? shade(c, 0.24) : shade(c, -0.2));
  }
  img.patches('#2b2d2f', 14, 0.62, 0.5, v * 7); // oil / tar
  if (opts.line) {
    const y0 = 13;
    for (let x = 0; x < S; x++) {
      if (hash(x, v, 137) > 0.78) continue; // worn away
      for (let y = y0; y < y0 + 5; y++) {
        const wear = hash(x, y, v + 3);
        if (wear > 0.62) continue;
        img.set(x, y, mix('#b29a4e', c, wear * 0.7));
      }
    }
  }
  if (opts.cracked) {
    cracks(img, 4, shade(c, -0.45), v * 47, 16);
    // pothole
    const px = 6 + ((v * 7) % 18), py = 16 + ((v * 5) % 10);
    img.ellipse(px, py, 4, 2.6, shade(c, -0.4));
    img.ellipse(px, py - 1, 3, 1.8, shade(c, -0.55));
    img.ellipseOutline(px, py, 4.4, 3, shade(c, 0.12));
  }
  bevel(img, 0.06, 0.1);
  return img;
}

function ceramicTile(v) {
  const img = new Img(S, S);
  const c = '#9aa09a';
  base(img, c, v * 53, { blotch: 0.05, grain: 0.028 });
  const grout = shade(c, -0.3);
  img.hline(0, 15, S, grout); img.hline(0, 16, S, shade(c, 0.1));
  img.vline(15, 0, S, grout); img.vline(16, 0, S, shade(c, 0.1));
  for (const [qx, qy] of [[0, 0], [17, 0], [0, 17], [17, 17]]) {
    const t = hash(qx, qy, v) ;
    if (t > 0.72) img.rect(qx, qy, 15, 15, shade(c, -0.1));
    if (t < 0.18) { // cracked / missing tile
      img.rect(qx, qy, 15, 15, '#5b5c58');
      cracks(img, 2, '#3f4340', v + qx, 8);
    }
    img.hline(qx, qy, 15, shade(c, 0.16));
  }
  img.patches('#7d8375', 11, 0.68, 0.4, v * 11);
  bevel(img, 0.08, 0.1);
  return img;
}

function industrialFloorTile(v) {
  const img = new Img(S, S);
  const c = '#565b5d';
  base(img, c, v * 59, { blotch: 0.06, grain: 0.04 });
  // raised diamond-plate studs, offset every other row
  const stud = (ox, oy, dir) => {
    for (let i = 0; i < 6; i++) {
      const x = ox + (dir > 0 ? i : 5 - i);
      img.set(x, oy + Math.floor(i / 2), shade(c, 0.3));
      img.set(x, oy + Math.floor(i / 2) + 1, shade(c, 0.12));
      img.set(x, oy + Math.floor(i / 2) + 2, shade(c, -0.26));
    }
  };
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const ox = col * 8 + (row % 2 ? 4 : 0);
      stud(ox % S, row * 8 + 1, row % 2 ? 1 : -1);
    }
  }
  img.hline(0, 0, S, shade(c, -0.22));
  img.vline(0, 0, S, shade(c, -0.22));
  img.patches('#6a5a44', 12, 0.72, 0.45, v * 13); // rust wash
  bevel(img, 0.08, 0.12);
  return img;
}

function metalTile(v, rusty) {
  const img = new Img(S, S);
  const c = rusty ? '#5c5147' : '#5e666a';
  base(img, c, v * 61, { blotch: 0.06, grain: 0.03 });
  // brushed streaks
  for (let y = 0; y < S; y++) {
    const n = hash(0, y, v * 3);
    if (n > 0.6) img.hline(0, y, S, shade(c, 0.07));
    else if (n < 0.24) img.hline(0, y, S, shade(c, -0.07));
  }
  // panel seam + rivets
  const seamX = v % 3 === 0 ? 7 : 24;
  img.vline(seamX, 0, S, shade(c, -0.3));
  img.vline(seamX + 1, 0, S, shade(c, 0.16));
  for (let y = 3; y < S; y += 7) {
    img.set(seamX - 2, y, shade(c, 0.3));
    img.set(seamX - 2, y + 1, shade(c, -0.25));
  }
  img.hline(0, 1, S, shade(c, 0.2));
  if (rusty) {
    img.patches('#7d4a2a', 9, 0.42, 0.85, v * 17);
    img.patches('#4a2b19', 5, 0.7, 0.6, v * 19);
    // perforations
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(hash(i, v, 139) * (S - 4)) + 2;
      const y = Math.floor(hash(i, v, 149) * (S - 4)) + 2;
      img.ellipse(x, y, 1.6, 1.4, '#2a211a');
    }
  } else {
    img.patches('#6d5a44', 12, 0.78, 0.4, v * 23);
  }
  bevel(img, 0.1, 0.14);
  return img;
}

function wallPanelTile(v) {
  const img = new Img(S, S);
  const c = '#6b7273';
  base(img, c, v * 67, { blotch: 0.05, grain: 0.03 });
  for (let x = 0; x < S; x += 8) {
    img.vline(x, 0, S, shade(c, -0.26));
    img.vline(x + 1, 0, S, shade(c, 0.18));
  }
  img.hline(0, 6, S, shade(c, -0.18));
  img.hline(0, 25, S, shade(c, -0.18));
  for (let x = 4; x < S; x += 8) { img.set(x, 7, shade(c, 0.3)); img.set(x, 26, shade(c, 0.3)); }
  img.patches('#5d5442', 11, 0.7, 0.45, v * 29);
  bevel(img, 0.1, 0.13);
  return img;
}

function chainFenceTile(v) {
  const img = new Img(S, S);
  const wire = [154, 160, 160, 210], dark = [60, 66, 66, 190];
  for (let i = -S; i < S * 2; i += 6) {
    for (let k = 0; k < S; k++) {
      img.set(i + k, k, wire);
      img.set(i + k + 1, k, dark);
      img.set(i - k + S, k, wire);
      img.set(i - k + S + 1, k, dark);
    }
  }
  if (v % 3 === 1) { // torn section
    for (let y = 10; y < 24; y++) for (let x = 12; x < 26; x++) {
      const o = img.idx(x, y); img.data[o + 3] = Math.max(0, img.data[o + 3] - 200);
    }
  }
  const post = '#6f7674';
  if (v % 3 === 0) { img.vline(2, 0, S, post); img.vline(3, 0, S, shade(post, -0.3)); }
  img.hline(0, 0, S, post); img.hline(0, 1, S, shade(post, -0.3));
  return img;
}

function brickTile(v) {
  const img = new Img(S, S);
  const mortar = '#6d6459';
  img.fill(mortar);
  img.grain(0.05, v * 71);
  const rows = [0, 8, 16, 24];
  for (let r = 0; r < rows.length; r++) {
    const y = rows[r];
    const offset = r % 2 ? -8 : 0;
    for (let bx = offset; bx < S; bx += 16) {
      const tone = hash(bx, y, v * 3);
      let c = tone > 0.72 ? '#8a5a4b' : tone > 0.45 ? '#7d5244' : tone > 0.22 ? '#916351' : '#6e4a3f';
      c = shade(c, (hash(bx, y, v + 5) - 0.5) * 0.14);
      img.rect(bx + 1, y + 1, 14, 6, c);
      img.hline(bx + 1, y + 1, 14, shade(c, 0.16));
      img.hline(bx + 1, y + 6, 14, shade(c, -0.18));
      // chipped corners / weathering
      if (hash(bx, y, v + 11) > 0.8) img.rect(bx + 1, y + 1, 3, 2, mortar);
      for (let i = 0; i < 4; i++) {
        const px = bx + 2 + Math.floor(hash(i, bx + y, v) * 12);
        const py = y + 2 + Math.floor(hash(i, bx - y, v) * 4);
        img.set(px, py, shade(c, hash(i, px, py) > 0.5 ? 0.16 : -0.16));
      }
    }
  }
  img.patches('#5f6a52', 10, 0.74, 0.4, v * 73); // moss in the mortar
  bevel(img, 0.08, 0.14);
  return img;
}

function rubbleTile(v) {
  const img = new Img(S, S);
  base(img, '#4a4a47', v * 79, { blotch: 0.12, grain: 0.05 });
  const tones = ['#7c7a73', '#6b6862', '#8a6252', '#5d5a55', '#918d83'];
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(hash(i, v, 151) * (S - 5));
    const y = Math.floor(hash(i, v, 157) * (S - 5));
    const w = 3 + Math.floor(hash(i, v, 163) * 5), h = 2 + Math.floor(hash(i, v, 167) * 4);
    const c = tones[Math.floor(hash(i, v, 173) * tones.length)];
    img.rect(x, y, w, h, c);
    img.hline(x, y, w, shade(c, 0.22));
    img.hline(x, y + h - 1, w, shade(c, -0.26));
  }
  // twisted rebar
  for (let i = 0; i < 2; i++) {
    const x = 4 + Math.floor(hash(i, v, 179) * 20), y = 6 + Math.floor(hash(i, v, 181) * 18);
    for (let k = 0; k < 10; k++) img.set(x + k, y + Math.round(Math.sin(k * 0.8) * 2), '#7c5236');
  }
  bevel(img, 0.07, 0.12);
  return img;
}

function railTile(v) {
  const img = new Img(S, S);
  base(img, '#4f4d48', v * 83, { blotch: 0.1, grain: 0.05 });
  const tones = ['#736f68', '#605c56', '#827d74'];
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(hash(i, v, 191) * S), y = 10 + Math.floor(hash(i, v, 193) * 22);
    img.rect(x, y, 2, 1, tones[Math.floor(hash(i, v, 197) * 3)]);
  }
  // sleeper
  img.rect(0, 12, S, 8, '#5a4633');
  for (let x = 0; x < S; x++) if (hash(x, 1, v) > 0.6) img.vline(x, 12, 8, '#4c3a2b');
  img.hline(0, 12, S, '#6b5540');
  // rail head
  img.rect(0, 8, S, 4, '#6e7477');
  img.hline(0, 8, S, '#9aa1a3');
  img.hline(0, 11, S, '#3f4446');
  img.patches('#7d4a2a', 8, 0.6, 0.5, v * 199, [0, 8, S, 4]);
  return img;
}

/* ------------------------------------------------------------------- wood */

function plankTile(v, palette) {
  const img = new Img(S, S);
  const { wood, dark, light } = palette;
  img.fill(wood);
  const rows = [0, 11, 22];
  for (const y of rows) {
    const t = hash(y, v, 3);
    const c = shade(wood, (t - 0.5) * 0.22);
    img.rect(0, y, S, 10, c);
    img.hline(0, y, S, shade(c, 0.18));
    img.hline(0, y + 9, S, shade(dark, -0.05));
    img.hline(0, y + 10, S, shade(dark, -0.25));
    // grain
    for (let g = 0; g < 4; g++) {
      const gy = y + 2 + Math.floor(hash(g, y, v) * 6);
      let x = 0;
      while (x < S) {
        const len = 3 + Math.floor(hash(x, gy, v) * 7);
        if (hash(x, gy, v + 1) > 0.4) img.hline(x, gy, len, shade(c, -0.12));
        x += len + 1 + Math.floor(hash(x, gy, v + 2) * 3);
      }
    }
    // knot
    if (hash(y, v, 9) > 0.6) {
      const kx = 4 + Math.floor(hash(y, v, 11) * 22);
      img.ellipse(kx, y + 4, 2.4, 1.8, shade(dark, -0.1));
      img.ellipse(kx, y + 4, 1.2, 0.9, shade(dark, -0.3));
    }
    // nails
    if (hash(y, v, 13) > 0.45) {
      img.set(3, y + 4, light); img.set(3, y + 5, shade(dark, -0.3));
      img.set(S - 4, y + 4, light); img.set(S - 4, y + 5, shade(dark, -0.3));
    }
  }
  img.grain(0.035, v * 101);
  bevel(img, 0.07, 0.12);
  return img;
}

function floorWoodTile(v) {
  const img = new Img(S, S);
  const wood = '#6f5138';
  img.fill(wood);
  for (let y = 0; y < S; y += 8) {
    const c = shade(wood, (hash(y, v, 5) - 0.5) * 0.24);
    img.rect(0, y, S, 7, c);
    img.hline(0, y, S, shade(c, 0.14));
    img.hline(0, y + 7, S, shade(wood, -0.35));
    const split = (v * 11 + y) % S;
    img.vline(split, y, 7, shade(wood, -0.3));
    for (let g = 0; g < 3; g++) {
      const gy = y + 1 + Math.floor(hash(g, y, v) * 5);
      img.hline(Math.floor(hash(g, y, v + 1) * 20), gy, 6 + Math.floor(hash(g, y, v + 2) * 10), shade(c, -0.1));
    }
    img.set(2, y + 3, '#9a9288'); img.set(S - 3, y + 3, '#9a9288');
  }
  img.patches('#4a3626', 11, 0.7, 0.4, v * 103);
  img.grain(0.03, v * 107);
  bevel(img, 0.06, 0.1);
  return img;
}

function trunkTile(v, dark) {
  const img = new Img(S, S);
  const wood = dark ? '#3f352c' : '#5b4331';
  img.fill(wood);
  for (let x = 0; x < S; x++) {
    const n = vnoise(x, v * 10, 4, v);
    const c = shade(wood, (n - 0.5) * 0.5);
    img.vline(x, 0, S, c);
  }
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(hash(i, v, 211) * S);
    const y0 = Math.floor(hash(i, v, 223) * 10);
    const len = 12 + Math.floor(hash(i, v, 227) * 20);
    for (let y = y0; y < Math.min(S, y0 + len); y++) {
      const xx = x + Math.round(Math.sin(y * 0.25 + i) * 0.8);
      img.set(xx, y, shade(wood, -0.35));
      img.set(xx + 1, y, shade(wood, 0.16));
    }
  }
  if (!dark) img.patches('#55663f', 9, 0.76, 0.45, v * 229); // moss on the north side
  else img.patches('#2b241e', 8, 0.6, 0.5, v * 233);
  img.grain(0.04, v * 239);
  bevel(img, 0.08, 0.12);
  return img;
}

function paintedWoodTile(v) {
  const img = plankTile(v, { wood: '#6f5a3f', dark: '#4e3f2c', light: '#a89b86' });
  // paint covering the boards, chipped away in patches to show the wood
  const paint = ['#8a9184', '#79856f', '#94907c'][v % 3];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const n = vnoise(x, y, 8, v * 7) * 0.7 + hash(x, y, v) * 0.3;
      if (n < 0.34) continue;                       // chipped: bare wood shows
      const edge = n < 0.42;                        // ragged paint border
      const board = y % 11 === 10 ? -0.3 : 0;       // keep the plank seams readable
      img.set(x, y, shade(paint, (edge ? -0.22 : 0) + board + (hash(x, y, v + 5) - 0.5) * 0.1));
    }
  }
  for (const y of [0, 11, 22]) img.hline(0, y, S, shade(paint, 0.2));
  img.patches('#55604f', 12, 0.74, 0.35, v * 241);
  bevel(img, 0.07, 0.12);
  return img;
}

function fenceTile(v) {
  const img = new Img(S, S);
  const wood = '#6b4f36';
  // three vertical pickets with gaps
  const xs = [2, 12, 22];
  for (const x of xs) {
    const c = shade(wood, (hash(x, v, 3) - 0.5) * 0.24);
    img.rect(x, 0, 7, S, c);
    img.vline(x, 0, S, shade(c, 0.2));
    img.vline(x + 6, 0, S, shade(c, -0.3));
    for (let g = 0; g < 4; g++) {
      const gx = x + 1 + Math.floor(hash(g, x, v) * 5);
      img.vline(gx, Math.floor(hash(g, x, v + 1) * 12), 8 + Math.floor(hash(g, x, v + 2) * 14), shade(c, -0.12));
    }
  }
  // rails
  for (const y of [6, 21]) {
    img.rect(0, y, S, 4, shade(wood, -0.08));
    img.hline(0, y, S, shade(wood, 0.18));
    img.hline(0, y + 3, S, shade(wood, -0.3));
    for (const x of xs) { img.set(x + 3, y + 1, '#8f8880'); img.set(x + 3, y + 2, '#4a4038'); }
  }
  if (v % 3 === 2) { // broken picket
    for (let y = 0; y < 14; y++) for (let x = 22; x < 29; x++) {
      const o = img.idx(x, y); img.data[o + 3] = 0;
    }
  }
  return img;
}

/* ------------------------------------------------------------------ misc  */

function glassTile(v) {
  const img = new Img(S, S);
  const frame = '#54595b';
  img.rect(0, 0, S, S, [126, 156, 163, 86]);
  // reflections
  for (let i = 0; i < 3; i++) {
    const x0 = 3 + i * 9 + (v % 3);
    for (let k = 0; k < 20; k++) img.set(x0 + k, 26 - k, [212, 232, 236, 60]);
  }
  img.outline(0, 0, S, S, frame);
  img.outline(1, 1, S - 2, S - 2, shade(frame, 0.18));
  if (v % 3 === 1) {
    // cracked pane
    for (let i = 0; i < 4; i++) img.crack(16, 16, 14, (i / 4) * Math.PI * 2 + 0.4, [226, 236, 238, 150], v);
  }
  if (v % 3 === 2) {
    // broken out corner
    for (let y = 2; y < 13; y++) for (let x = 18; x < 30; x++) {
      if (x - 18 + (y - 2) > 12) continue;
      const o = img.idx(x, y); img.data[o + 3] = 0;
    }
  }
  img.patches('#7a7f6f', 10, 0.72, 0.35, v * 251);
  return img;
}

function waterTile(v) {
  const img = new Img(S, S);
  const soil = '#5a4633';
  // a spring pooling in a stone-ringed hollow
  img.rect(0, 14, S, 18, soil);
  img.weather(7, 0.16, v * 3, [0, 14, S, 18]);
  const water = '#39616f', deepW = '#2a4b58';
  for (let y = 18; y < 31; y++) {
    for (let x = 1; x < 31; x++) {
      const dx = (x - 16) / 15, dy = (y - 25) / 7.2;
      if (dx * dx + dy * dy > 1) continue;
      const n = vnoise(x, y * 2 + v * 5, 4.5, v);
      img.set(x, y, mix(deepW, water, 0.35 + n * 0.65));
    }
  }
  // ripples and sky glint
  for (let i = 0; i < 5; i++) {
    const y = 20 + i * 2;
    const w = 4 + ((i * 5 + v * 3) % 9);
    img.hline(6 + ((i * 7 + v * 5) % 14), y, w, [176, 208, 218, 120]);
  }
  img.hline(9, 21, 9, [206, 231, 238, 170]);
  // stone rim
  const rim = ['#6f6a60', '#5d584f', '#7d7769'];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.round(16 + Math.cos(a) * 15.5), y = Math.round(25 + Math.sin(a) * 7.6);
    if (y < 14) continue;
    const c = rim[i % 3];
    img.rect(x - 1, y - 1, 3, 2, c);
    img.hline(x - 1, y - 1, 3, shade(c, 0.2));
  }
  pebbles(img, 7, [shade(soil, 0.14), shade(soil, -0.22)], v * 13, 14, 19);
  return img;
}

function shingleTile(v) {
  const img = new Img(S, S);
  const c = '#584a42';
  base(img, c, v * 257, { blotch: 0.08, grain: 0.04 });
  for (let row = 0; row < 4; row++) {
    const y = row * 8;
    const offset = row % 2 ? 6 : 0;
    for (let x = -12 + offset; x < S; x += 12) {
      const t = hash(x, y, v * 3);
      const sc = shade(c, (t - 0.5) * 0.3);
      img.rect(x, y, 11, 8, sc);
      img.hline(x, y, 11, shade(sc, 0.16));
      img.hline(x, y + 7, 11, shade(sc, -0.3));
      img.vline(x + 11, y, 8, shade(sc, -0.35));
      if (t > 0.85) img.rect(x + 2, y + 2, 4, 4, shade(c, -0.35)); // missing chunk
    }
  }
  img.patches('#5d6a4d', 10, 0.7, 0.4, v * 263);
  bevel(img, 0.08, 0.13);
  return img;
}

function roofMetalTile(v) {
  const img = new Img(S, S);
  const c = '#4f595c';
  base(img, c, v * 269, { blotch: 0.05, grain: 0.03 });
  for (let x = 0; x < S; x += 6) {
    img.vline(x, 0, S, shade(c, -0.3));
    img.vline(x + 1, 0, S, shade(c, 0.05));
    img.vline(x + 2, 0, S, shade(c, 0.24));
    img.vline(x + 3, 0, S, shade(c, 0.08));
  }
  img.hline(0, 15, S, shade(c, -0.18));
  for (let x = 2; x < S; x += 6) { img.set(x, 3, shade(c, 0.3)); img.set(x, 4, shade(c, -0.3)); }
  img.patches('#7d4a2a', 9, 0.55, 0.7, v * 271);
  bevel(img, 0.09, 0.12);
  return img;
}

/* ------------------------------------------------------------- definitions */

const GRASS_PAL = { deep: '#33502c', mid: '#456a34', light: '#5b8540', tip: '#76a252' };
const DEAD_PAL = { deep: '#5b5332', mid: '#756a3c', light: '#8f8149', tip: '#a3945a' };
const WET_PAL = { deep: '#27422a', mid: '#345634', light: '#427043', tip: '#548653' };

function ladderTile(v) {
  const img = new Img(S, S);
  const wood = '#7a5a3c';
  for (const x of [5, 22]) {
    const c = shade(wood, (hash(x, v, 3) - 0.5) * 0.2);
    img.rect(x, 0, 5, S, c);
    img.vline(x, 0, S, shade(c, 0.2));
    img.vline(x + 4, 0, S, shade(c, -0.32));
  }
  for (let y = 3; y < S; y += 8) {
    const c = shade(wood, 0.08);
    img.rect(4, y, 24, 4, c);
    img.hline(4, y, 24, shade(c, 0.22));
    img.hline(4, y + 3, 24, shade(c, -0.3));
    img.set(6, y + 1, '#9a948a');
    img.set(25, y + 1, '#9a948a');
  }
  img.grain(0.04, v * 17);
  return img;
}

function catwalkTile(v) {
  const img = new Img(S, S);
  const c = '#6a7174';
  img.rect(0, 2, S, 7, c);
  img.hline(0, 2, S, shade(c, 0.28));
  img.hline(0, 8, S, shade(c, -0.34));
  for (let x = 2; x < S; x += 5) img.vline(x, 3, 5, shade(c, -0.18));
  // grating + side rail shadow
  img.rect(0, 9, S, 2, shade(c, -0.42));
  for (let x = 1; x < S; x += 8) { img.set(x, 3, shade(c, 0.35)); img.set(x, 7, shade(c, -0.3)); }
  img.patches('#7a4a2b', 7, 0.62, 0.55, v * 23, [0, 2, S, 9]);
  return img;
}

const TILES = {
  ladder: v => ladderTile(v),
  catwalk: v => catwalkTile(v),
  grass: v => grassTile(v, GRASS_PAL, '#63482f'),
  dead_grass: v => grassTile(v, DEAD_PAL, '#6d5539'),
  wet_grass: v => grassTile(v, WET_PAL, '#4a3828'),
  tall_grass: v => tallGrassTile(v, GRASS_PAL),
  dry_flowers: v => flowersTile(v),
  vine: v => vineTile(v),
  dirt: v => dirtTile(v, '#6b4e38'),
  dry_dirt: v => dirtTile(v, '#7d6549', { dryCracks: true, blotch: 0.12 }),
  wet_dirt: v => dirtTile(v, '#4d3a2a', { wetSheen: true, blotch: 0.18 }),
  mud: v => mudTile(v),
  gravel: v => gravelTile(v),
  stone: v => stoneTile(v, '#6a6d70'),
  cracked_stone: v => stoneTile(v, '#66686a', { crackCount: 5, crackLen: 20 }),
  dark_stone: v => stoneTile(v, '#3c4246', { glints: true, glintColor: '#7e8b93' }),
  concrete: v => concreteTile(v, false),
  cracked_concrete: v => concreteTile(v, true),
  asphalt: v => asphaltTile(v),
  cracked_asphalt: v => asphaltTile(v, { cracked: true }),
  road_line: v => asphaltTile(v, { line: true }),
  ceramic: v => ceramicTile(v),
  industrial_floor: v => industrialFloorTile(v),
  metal: v => metalTile(v, false),
  rust_metal: v => metalTile(v, true),
  wall_panel: v => wallPanelTile(v),
  chain_fence: v => chainFenceTile(v),
  brick: v => brickTile(v),
  rubble: v => rubbleTile(v),
  rail: v => railTile(v),
  plank: v => plankTile(v, { wood: '#7a5a3c', dark: '#4f3a26', light: '#b3a48c' }),
  floor_wood: v => floorWoodTile(v),
  wood: v => trunkTile(v, false),
  dark_wood: v => trunkTile(v, true),
  painted_wood: v => paintedWoodTile(v),
  fence: v => fenceTile(v),
  glass: v => glassTile(v),
  leaf: v => leafTile(v),
  berry_bush: v => berryBushTile(v),
  water_source: v => waterTile(v),
  roof_shingle: v => shingleTile(v),
  roof_metal: v => roofMetalTile(v)
};

/* ------------------------------------------------ Stage 20: new materials */

function brickPal(v, pal, opts = {}) {
  const img = new Img(S, S);
  img.fill(pal.mortar);
  img.grain(0.05, v * 71 + 3);
  const rows = [0, 8, 16, 24];
  for (let r = 0; r < rows.length; r++) {
    const y = rows[r];
    const offset = r % 2 ? -8 : 0;
    for (let bx = offset; bx < S; bx += 16) {
      const tone = hash(bx, y, v * 3 + 7);
      if (opts.missing && tone < opts.missing) { // knocked-out brick: dark cavity
        img.rect(bx + 1, y + 1, 14, 6, shade(pal.mortar, -0.45));
        img.hline(bx + 1, y + 6, 14, shade(pal.mortar, -0.2));
        continue;
      }
      let c = pal.tones[Math.floor(tone * pal.tones.length) % pal.tones.length];
      c = shade(c, (hash(bx, y, v + 5) - 0.5) * 0.16);
      img.rect(bx + 1, y + 1, 14, 6, c);
      img.hline(bx + 1, y + 1, 14, shade(c, 0.14));
      img.hline(bx + 1, y + 6, 14, shade(c, -0.2));
      if (hash(bx, y, v + 11) > (opts.chip ?? 0.8)) img.rect(bx + 1 + Math.floor(hash(bx, y, 2) * 9), y + 1, 4, 2, pal.mortar);
    }
  }
  if (opts.soot) img.patches('#22211f', 9, 0.55, opts.soot, v * 77);
  if (opts.moss) img.patches('#556640', 10, 0.62, opts.moss, v * 73);
  if (opts.cracks) cracks(img, opts.cracks, shade(pal.mortar, -0.5), v * 19, 16);
  bevel(img, 0.07, 0.14);
  return img;
}

function plasterTile(v, c, opts = {}) {
  const img = new Img(S, S);
  base(img, c, v * 211, { blotch: opts.blotch ?? 0.06, blotchScale: 14, grain: 0.03 });
  if (opts.stripes) {
    for (let x = 0; x < S; x += 8) {
      img.vline(x + 2, 0, S, shade(opts.stripes, (hash(x, v, 3) - 0.5) * 0.06));
      img.vline(x + 3, 0, S, shade(opts.stripes, -0.08));
      for (let y = 4; y < S; y += 8) img.set(x + 6, y, shade(opts.stripes, 0.1));
    }
  }
  if (opts.peel) {
    img.patches(opts.under || '#8f8778', 7, 0.58, 1, v * 17);
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(hash(i, v, 41) * 26), y = Math.floor(hash(i, v, 43) * 26);
      img.hline(x, y, 5, shade(c, 0.2));
      img.set(x + 5, y + 1, shade(c, -0.35));
    }
  }
  if (opts.stain) img.patches('#7a6848', 10, 0.66, opts.stain, v * 29);
  cracks(img, opts.cracks ?? 1, shade(c, -0.3), v * 47, 9);
  bevel(img, 0.05, 0.08);
  return img;
}

function smallTileWall(v, c, grout, size, opts = {}) {
  const img = new Img(S, S);
  base(img, c, v * 223, { blotch: 0.035, grain: 0.02 });
  const h = opts.brickH || size;
  for (let y = 0; y < S; y += h) {
    const off = opts.offset && (y / h) % 2 ? size / 2 : 0;
    img.hline(0, y, S, grout);
    for (let x = -off; x < S; x += size) {
      img.vline(x, y, h, grout);
      const t = hash(x + 40, y, v);
      if (t > 0.8) img.rect(x + 1, y + 1, size - 1, h - 1, shade(c, -0.08));
      if (t < 0.07) { img.rect(x + 1, y + 1, size - 1, h - 1, shade(grout, -0.2)); }
      img.hline(x + 1, y + 1, size - 2, shade(c, 0.12));
    }
  }
  if (opts.band != null) {
    img.rect(0, opts.band, S, 4, opts.bandColor);
    img.hline(0, opts.band, S, shade(opts.bandColor, 0.2));
    img.hline(0, opts.band + 3, S, shade(opts.bandColor, -0.25));
  }
  if (opts.grime) img.patches('#5f5a48', 9, 0.6, opts.grime, v * 31);
  bevel(img, 0.05, 0.08);
  return img;
}

function checkerTile(v, a, b) {
  const img = new Img(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) img.set(x, y, ((x >> 3) + (y >> 3)) % 2 ? a : b);
  img.grain(0.03, v * 227);
  img.patches('#6a6250', 11, 0.7, 0.35, v * 229);
  cracks(img, 1, '#3c3c38', v * 233, 8);
  bevel(img, 0.06, 0.1);
  return img;
}

function carpetTile(v, c) {
  const img = new Img(S, S);
  base(img, c, v * 239, { blotch: 0.12, blotchScale: 6, grain: 0.09 });
  for (let y = 2; y < S; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < S; x += 6) img.set(x, y, shade(c, 0.16));
  img.patches('#4a3a2c', 8, 0.72, 0.4, v * 241);
  bevel(img, 0.03, 0.08);
  return img;
}

function corrugatedTile(v, c, rusty) {
  const img = new Img(S, S);
  base(img, c, v * 251, { blotch: 0.05, grain: 0.03 });
  for (let x = 0; x < S; x++) {
    const p = x % 6;
    img.vline(x, 0, S, shade(c, p === 0 ? 0.22 : p === 1 ? 0.1 : p === 4 ? -0.18 : p === 5 ? -0.26 : 0));
  }
  if (rusty) { img.patches('#7d4a2a', 8, 0.5, 0.8, v * 257); img.patches('#4a2b19', 5, 0.72, 0.6, v * 263); }
  for (let x = 2; x < S; x += 12) { img.set(x, 2, shade(c, 0.35)); img.set(x, 29, shade(c, 0.35)); }
  bevel(img, 0.08, 0.12);
  return img;
}

function grateTile(v) {
  const img = new Img(S, S);
  const c = '#4c5254';
  base(img, c, v * 269, { blotch: 0.05, grain: 0.03 });
  for (let y = 3; y < S; y += 6) for (let x = 2; x < S; x += 6) {
    img.rect(x, y, 4, 3, '#1c1f21');
    img.hline(x, y + 3, 4, shade(c, 0.18));
  }
  img.patches('#7a4a2b', 8, 0.66, 0.55, v * 271);
  bevel(img, 0.1, 0.15);
  return img;
}

function panelTile(v, c, opts = {}) {
  const img = new Img(S, S);
  base(img, c, v * 277, { blotch: 0.04, grain: 0.025 });
  const seam = shade(c, -0.3);
  img.rect(0, 0, S, 1, seam); img.rect(0, 0, 1, S, seam);
  img.hline(1, 1, S - 1, shade(c, 0.16));
  if (opts.split) { img.hline(0, 16, S, seam); img.hline(0, 17, S, shade(c, 0.12)); }
  for (const [x, y] of [[3, 3], [28, 3], [3, 28], [28, 28]]) { img.set(x, y, shade(c, 0.35)); img.set(x + 1, y + 1, shade(c, -0.3)); }
  if (opts.leds) {
    const cols = ['#58c46a', '#c9b24c', '#5aa7c9', '#c45a4a'];
    for (let i = 0; i < 4; i++) {
      if (hash(i, v, 5) > 0.55) continue;
      img.rect(6 + i * 5, 7, 2, 2, cols[(i + v) % cols.length]);
    }
    img.rect(6, 12, 20, 6, shade(c, -0.25));
    for (let x = 7; x < 25; x += 2) img.vline(x, 13, 4, shade(c, -0.45));
  }
  if (opts.stripe) {
    for (let x = 0; x < S; x++) for (let y = 26; y < 31; y++) img.set(x, y, ((x + y) >> 2) % 2 ? '#c9a23a' : '#2a2724');
  }
  if (opts.cable) {
    img.rect(0, 8, S, 5, shade(c, -0.28));
    for (let x = 0; x < S; x += 2) { img.set(x, 9, '#3a3f34'); img.set(x + 1, 10, '#6a4a2a'); img.set(x, 11, '#2d3a44'); }
    img.hline(0, 7, S, shade(c, 0.18));
  }
  if (opts.bolts) for (let y = 6; y < S; y += 10) for (let x = 6; x < S; x += 10) { img.set(x, y, shade(c, 0.3)); img.set(x + 1, y, shade(c, -0.28)); }
  if (opts.rust) img.patches('#6d5040', 9, 0.64, opts.rust, v * 281);
  if (opts.grime) img.patches('#4d4a40', 10, 0.6, opts.grime, v * 283);
  bevel(img, 0.08, 0.12);
  return img;
}

function hazardFloorTile(v) {
  const img = concreteTile(v, false);
  for (let x = 0; x < S; x++) for (let y = 2; y < 8; y++) {
    const on = ((x + y + v * 3) >> 2) % 2;
    if (hash(x, y, v) > 0.8) continue; // worn paint
    img.set(x, y, on ? '#b8932f' : '#2a2724');
  }
  img.patches('#4a4538', 9, 0.6, 0.45, v * 293);
  return img;
}

function wetConcreteTile(v, c) {
  const img = new Img(S, S);
  base(img, c, v * 307, { blotch: 0.12, blotchScale: 9, grain: 0.04 });
  for (let i = 0; i < 5; i++) { // drip streaks
    const x = Math.floor(hash(i, v, 311) * S), len = 8 + Math.floor(hash(i, v, 313) * 22);
    for (let y = 0; y < len; y++) img.shadeAt(x, y, -0.2 * (1 - y / len));
    img.set(x, len, shade(c, 0.25));
  }
  img.patches('#3f4d44', 10, 0.64, 0.55, v * 317);
  for (let i = 0; i < 6; i++) img.set(Math.floor(hash(i, v, 331) * S), Math.floor(hash(i, v, 337) * S), '#8a9a98');
  cracks(img, 2, shade(c, -0.4), v * 347, 12);
  bevel(img, 0.06, 0.12);
  return img;
}

function sandbagTile(v) {
  const img = new Img(S, S);
  img.fill('#3d382c');
  const c = '#8a7b58';
  for (let r = 0; r < 4; r++) {
    const off = r % 2 ? -8 : 0;
    for (let x = off; x < S; x += 16) {
      const t = shade(c, (hash(x, r, v) - 0.5) * 0.2);
      img.ellipse(x + 8, r * 8 + 4, 7.5, 3.8, t);
      img.hline(x + 3, r * 8 + 1, 10, shade(t, 0.2));
      img.hline(x + 3, r * 8 + 7, 10, shade(t, -0.3));
      img.set(x + 8, r * 8 + 3, shade(t, -0.3));
    }
  }
  img.grain(0.06, v * 349);
  return img;
}

function timberTile(v) {
  const img = plankTile(v, { wood: '#5e4630', dark: '#3a2a1c', light: '#8a7458' });
  img.patches('#2d251c', 8, 0.6, 0.6, v * 353);
  for (let x = 4; x < S; x += 14) { img.rect(x, 4, 2, 2, '#8a8e90'); img.rect(x, 26, 2, 2, '#8a8e90'); }
  return img;
}

function leafLitterTile(v) {
  const img = dirtTile(v, '#4f3b29', { blotch: 0.2, wetSheen: false });
  const leaves = ['#7a5a2a', '#8f6a2e', '#5f6a34', '#6e4526', '#94702f'];
  for (let i = 0; i < 46; i++) {
    const x = Math.floor(hash(i, v, 359) * S), y = Math.floor(hash(i, v, 367) * S);
    const c = leaves[Math.floor(hash(i, v, 373) * leaves.length)];
    img.rect(x, y, 2 + (i % 2), 1 + (i % 3 === 0 ? 1 : 0), c);
    img.set(x, y, shade(c, 0.2));
  }
  bevel(img, 0.06, 0.12);
  return img;
}

function hedgeTile(v) {
  const img = leafTile(v);
  img.patches('#1f3322', 6, 0.45, 0.5, v * 379);
  return img;
}

Object.assign(TILES, {
  moss_stone: v => { const i = stoneTile(v, '#5f6663'); i.patches('#4f6a3a', 7, 0.45, 0.9, v * 401); i.patches('#6f8a48', 5, 0.7, 0.7, v * 409); return i; },
  wet_stone: v => { const i = stoneTile(v, '#4a5153', { crackCount: 2 }); i.patches('#2e3a3c', 9, 0.5, 0.6, v * 419); for (let k = 0; k < 8; k++) i.hline(Math.floor(hash(k, v, 5) * 28), Math.floor(hash(k, v, 7) * 30), 3, '#8fa3a6'); return i; },
  leaf_litter: v => leafLitterTile(v),
  old_brick: v => brickPal(v, { mortar: '#7a7266', tones: ['#94705e', '#876453', '#a07c68', '#7a5a4c'] }, { chip: 0.62, moss: 0.35 }),
  damaged_brick: v => brickPal(v, { mortar: '#5f574d', tones: ['#7d5244', '#6e4a3f', '#8a5a4b'] }, { missing: 0.22, chip: 0.5, cracks: 3, soot: 0.4 }),
  sub_brick: v => brickPal(v, { mortar: '#3f3c38', tones: ['#5e4038', '#533a33', '#664840', '#4a342e'] }, { soot: 0.6, moss: 0.25 }),
  dirty_concrete: v => { const i = concreteTile(v, false); i.patches('#3e3b33', 8, 0.5, 0.7, v * 431); for (let k = 0; k < 4; k++) { const x = Math.floor(hash(k, v, 3) * 30); for (let y = 0; y < 20; y++) i.shadeAt(x, y, -0.12); } return i; },
  old_concrete: v => { const i = concreteTile(v, v === 2); i.weather(6, 0.12, v * 433); i.patches('#59604f', 9, 0.55, 0.55, v * 439); return i; },
  wet_concrete: v => wetConcreteTile(v, '#5c605d'),
  plaster: v => plasterTile(v, '#b3a992', { cracks: 2, stain: 0.35 }),
  wallpaper: v => plasterTile(v, '#7f8a6e', { stripes: '#7f8a6e', stain: 0.3 }),
  wallpaper_warm: v => plasterTile(v, '#8a6f63', { stripes: '#8a6f63', stain: 0.3 }),
  wallpaper_blue: v => plasterTile(v, '#6f7f8a', { stripes: '#6f7f8a', stain: 0.3 }),
  peeling_wall: v => plasterTile(v, '#8f9a82', { stripes: '#8f9a82', peel: true, under: '#b0a58c', stain: 0.5, cracks: 2 }),
  wall_tile: v => smallTileWall(v, '#c9cdc4', '#8d918a', 8, { grime: 0.35 }),
  linoleum: v => smallTileWall(v, '#a89c7c', '#7c7258', 16, { grime: 0.4 }),
  checker_floor: v => checkerTile(v, '#2f3232', '#c4c2b4'),
  carpet: v => carpetTile(v, '#6e3f36'),
  carpet_blue: v => carpetTile(v, '#4a5566'),
  old_wood: v => { const i = plankTile(v, { wood: '#7d7666', dark: '#4a453b', light: '#a9a390' }); i.patches('#4c5a3c', 8, 0.66, 0.5, v * 449); return i; },
  sheet_metal: v => corrugatedTile(v, '#6c7478', v === 1),
  grate: v => grateTile(v),
  ind_panel: v => panelTile(v, '#7a7560', { split: true, bolts: true, rust: 0.45 }),
  hazard_floor: v => hazardFloorTile(v),
  station_tile: v => smallTileWall(v, '#cfc8b0', '#8a8676', 16, { brickH: 8, offset: true, band: 12, bandColor: '#3f6b5a', grime: 0.45 }),
  tech_wall: v => panelTile(v, '#5b6163', { cable: true, grime: 0.5 }),
  tech_panel: v => panelTile(v, '#4a5864', { leds: true }),
  dark_metal: v => { const i = metalTile(v, false); i.weather(8, 0.08, v); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) i.shadeAt(x, y, -0.35); return i; },
  containment: v => panelTile(v, '#9a9c94', { bolts: true, stripe: v === 0, grime: 0.3 }),
  lab_floor: v => { const i = smallTileWall(v, '#b9c0bc', '#9aa19d', 16, { grime: 0.15 }); return i; },
  tech_floor: v => panelTile(v, '#56606a', { split: true, bolts: true }),
  lab_wall: v => panelTile(v, '#c3c8c4', { split: v !== 1, grime: 0.2 }),
  hedge: v => hedgeTile(v),
  sandbag: v => sandbagTile(v),
  timber: v => timberTile(v)
});

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let count = 0;
  for (const [name, fn] of Object.entries(TILES)) {
    for (let v = 0; v < 3; v++) {
      fn(v).save(path.join(OUT, `${name}_${v}.png`), 15);
      count++;
    }
  }
  console.log(`tiles: ${count} files (${Object.keys(TILES).length} materials)`);
}

main();
