// LAST COUNTY — world decoration props.
// Every prop is drawn bottom-aligned; the world renderer anchors them on the ground.
const fs = require('fs');
const path = require('path');
const { Img, shade, mix, hash, vnoise } = require('./pixel');

const OUT = path.join(__dirname, '..', 'assets', 'decor');

/* ------------------------------------------------------------- materials */

function box(img, x, y, w, h, c, opts = {}) {
  img.rect(x, y, w, h, c);
  img.hline(x, y, w, shade(c, opts.top ?? 0.2));
  img.hline(x, y + h - 1, w, shade(c, -(opts.bottom ?? 0.28)));
  img.vline(x, y, h, shade(c, 0.1));
  img.vline(x + w - 1, y, h, shade(c, -0.22));
  if (opts.grain) img.grain(opts.grain, opts.seed || 1, [x, y, w, h]);
}

function planks(img, x, y, w, h, c, seed = 0, vertical = false) {
  if (vertical) {
    for (let i = 0; i < w; i += 5) {
      const t = shade(c, (hash(i, seed, 3) - 0.5) * 0.24);
      img.rect(x + i, y, 4, h, t);
      img.vline(x + i, y, h, shade(t, 0.16));
      img.vline(x + i + 4, y, h, shade(t, -0.3));
    }
  } else {
    for (let j = 0; j < h; j += 5) {
      const t = shade(c, (hash(j, seed, 5) - 0.5) * 0.24);
      img.rect(x, y + j, w, 4, t);
      img.hline(x, y + j, w, shade(t, 0.16));
      img.hline(x, y + j + 4, w, shade(t, -0.3));
    }
  }
}

// Loose broken material heaped on the floor.
function chunkPile(img, tones, seed, floor = 3) {
  const H = img.h;
  for (let i = 0; i < 34; i++) {
    const x = Math.floor(hash(i, 3, seed) * (img.w - 5));
    const y = H - floor - Math.floor(hash(i, 5, seed) * (H - floor - 1));
    const w = 3 + Math.floor(hash(i, 7, seed) * 4), h = 2 + Math.floor(hash(i, 11, seed) * 3);
    const c = tones[i % tones.length];
    img.rect(x, y, w, h, c);
    img.hline(x, y, w, shade(c, 0.24));
    img.hline(x, y + h - 1, w, shade(c, -0.3));
  }
}

// A tool hung on a rack: a haft with a dark head, seen edge on.
function handleTool(img, x, head, haft) {
  img.rect(x, 4, 2, 22, haft);
  img.rect(x - 2, 2, 6, 4, head);
  img.hline(x - 2, 2, 6, shade(head, 0.26));
}

function rust(img, area, seed, strength = 0.7) {
  img.patches('#7a4a2b', 7, 0.5, strength, seed, area);
}

function metalBox(img, x, y, w, h, c, seed = 1) {
  box(img, x, y, w, h, c);
  for (let i = 3; i < w - 2; i += 6) { img.set(x + i, y + 2, shade(c, 0.3)); img.set(x + i, y + 3, shade(c, -0.25)); }
  rust(img, [x, y, w, h], seed, 0.55);
}

function signPost(img, cx, topY, bottomY, c = '#5e6466') {
  img.rect(cx - 1, topY, 3, bottomY - topY, c);
  img.vline(cx - 1, topY, bottomY - topY, shade(c, 0.22));
  img.vline(cx + 1, topY, bottomY - topY, shade(c, -0.3));
}

function text(img, x, y, rows, c) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) if (row[i] !== ' ') img.set(x + i, y + j, c);
  });
}

/* ----------------------------------------------------------------- props */

const PROPS = {

  /* ---------------------------------------------------------- generic ---*/
  barrel: () => {
    const img = new Img(20, 28);
    const c = '#6b5340';
    img.rect(2, 2, 16, 25, c);
    img.ellipse(10, 3, 8, 2.4, shade(c, 0.24));
    img.vline(2, 3, 24, shade(c, 0.12));
    img.vline(17, 3, 24, shade(c, -0.3));
    for (const y of [7, 14, 21]) { img.hline(2, y, 16, shade(c, -0.32)); img.hline(2, y + 1, 16, shade(c, 0.16)); }
    rust(img, [2, 2, 16, 25], 3, 0.85);
    img.contour(); return img;
  },

  oil_drum: () => {
    const img = new Img(20, 28);
    const c = '#5c6a5a';
    img.rect(2, 2, 16, 25, c);
    img.ellipse(10, 3, 8, 2.4, shade(c, 0.26));
    for (const y of [8, 18]) { img.hline(2, y, 16, shade(c, -0.3)); img.hline(2, y + 1, 16, shade(c, 0.18)); }
    img.rect(5, 11, 10, 5, '#b9a14e');
    text(img, 6, 12, ['XX XX', 'X X X', 'XX XX'], '#3b3527');
    rust(img, [2, 2, 16, 25], 7, 0.7);
    img.contour(); return img;
  },

  crate_stack: () => {
    const img = new Img(34, 32);
    planks(img, 2, 12, 18, 19, '#6f5236', 3);
    img.outline(2, 12, 18, 19, '#4a3623');
    img.line(2, 12, 19, 30, '#5c4229'); img.line(19, 12, 2, 30, '#5c4229');
    planks(img, 18, 4, 15, 16, '#7a5c3e', 9);
    img.outline(18, 4, 15, 16, '#4a3623');
    img.line(18, 4, 32, 19, '#63482d');
    img.contour(); return img;
  },

  pallet: () => {
    const img = new Img(30, 12);
    const c = '#6d5238';
    for (let i = 0; i < 30; i += 6) img.rect(i, 0, 4, 4, shade(c, (hash(i, 1, 2) - 0.5) * 0.2));
    img.rect(0, 4, 30, 3, shade(c, -0.14));
    img.rect(0, 7, 4, 5, shade(c, -0.24)); img.rect(13, 7, 4, 5, shade(c, -0.24)); img.rect(26, 7, 4, 5, shade(c, -0.24));
    img.contour(); return img;
  },

  trash_can: () => {
    const img = new Img(18, 24);
    const c = '#4f5a52';
    img.rect(2, 4, 14, 20, c);
    for (let y = 6; y < 24; y += 3) img.hline(2, y, 14, shade(c, -0.2));
    img.ellipse(9, 4, 8, 2.4, shade(c, 0.22));
    img.rect(1, 2, 16, 3, shade(c, 0.1));
    img.hline(1, 2, 16, shade(c, 0.3));
    img.rect(13, 0, 3, 4, '#6e7a70');
    rust(img, [2, 4, 14, 20], 11, 0.4);
    img.contour(); return img;
  },

  dumpster: () => {
    const img = new Img(42, 26);
    const c = '#4a5a4c';
    box(img, 2, 6, 38, 18, c);
    img.rect(0, 4, 42, 4, shade(c, 0.16));
    img.hline(0, 4, 42, shade(c, 0.34));
    for (let x = 6; x < 38; x += 8) img.vline(x, 8, 14, shade(c, -0.2));
    img.rect(4, 24, 5, 2, '#22262a'); img.rect(33, 24, 5, 2, '#22262a');
    img.rect(16, 0, 10, 5, '#5b6a5c');
    rust(img, [2, 4, 38, 20], 13, 0.8);
    img.contour(); return img;
  },

  rubble_pile: () => {
    const img = new Img(38, 20);
    const tones = ['#7b786f', '#655f57', '#8a6252', '#585550'];
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(hash(i, 3, 1) * 34);
      const y = 20 - Math.floor(hash(i, 5, 2) * 16) - 3;
      const w = 3 + Math.floor(hash(i, 7, 3) * 5), h = 2 + Math.floor(hash(i, 11, 4) * 4);
      const dist = Math.abs(x - 17) / 17;
      if (20 - y > 18 * (1 - dist * 0.8)) continue;
      const c = tones[i % tones.length];
      img.rect(x, y, w, h, c);
      img.hline(x, y, w, shade(c, 0.2));
    }
    for (let i = 0; i < 3; i++) {
      const x = 6 + i * 9;
      for (let k = 0; k < 8; k++) img.set(x + k, 12 - i + Math.round(Math.sin(k) * 2), '#7c5236');
    }
    img.contour(); return img;
  },

  scrap_heap: () => {
    const img = new Img(40, 22);
    const tones = ['#6b7275', '#565c5f', '#7a5a42', '#4a5052'];
    for (let i = 0; i < 34; i++) {
      const x = Math.floor(hash(i, 17, 1) * 36);
      const y = 22 - 3 - Math.floor(hash(i, 19, 2) * 15);
      const w = 4 + Math.floor(hash(i, 23, 3) * 7), h = 1 + Math.floor(hash(i, 29, 4) * 3);
      const c = tones[i % tones.length];
      img.rect(x, y, w, h, c);
      img.hline(x, y, w, shade(c, 0.24));
    }
    rust(img, [0, 0, 40, 22], 31, 0.9);
    img.contour(); return img;
  },

  tire_pile: () => {
    const img = new Img(34, 26);
    const c = '#24262a';
    const tire = (x, y, r) => {
      img.ellipse(x, y, r, r * 0.55, c);
      img.ellipseOutline(x, y, r, r * 0.55, shade(c, 0.35));
      img.ellipse(x, y, r * 0.45, r * 0.26, '#3c4046');
    };
    tire(10, 22, 9); tire(23, 22, 9); tire(16, 15, 9); tire(11, 8, 8); tire(21, 8, 8);
    img.contour(); return img;
  },

  traffic_cone: () => {
    const img = new Img(16, 20);
    for (let y = 2; y < 18; y++) {
      const w = Math.round(2 + (y - 2) * 0.55);
      const c = y > 8 && y < 12 ? '#d8d2c2' : '#a85a35';
      img.rect(8 - Math.floor(w / 2), y, w, 1, c);
      img.set(8 - Math.floor(w / 2), y, shade(c, 0.2));
    }
    img.rect(1, 17, 14, 3, '#8f4c2c');
    img.hline(1, 17, 14, '#b06438');
    img.contour(); return img;
  },

  road_barrier: () => {
    const img = new Img(40, 22);
    img.rect(2, 4, 36, 7, '#c2b39a');
    for (let i = 0; i < 36; i += 6) img.rect(2 + i, 4, 3, 7, '#a2502f');
    img.hline(2, 4, 36, '#d8ccb4');
    img.rect(2, 13, 36, 4, '#b6a88f');
    for (let i = 0; i < 36; i += 6) img.rect(4 + i, 13, 3, 4, '#a2502f');
    img.rect(4, 11, 4, 11, '#6b6a63'); img.rect(32, 11, 4, 11, '#6b6a63');
    img.contour(); return img;
  },

  fire_hydrant: () => {
    const img = new Img(14, 22);
    const c = '#8a4a3c';
    img.rect(4, 4, 6, 16, c);
    img.rect(2, 8, 10, 4, c);
    img.rect(3, 2, 8, 3, shade(c, 0.18));
    img.set(6, 0, shade(c, 0.3)); img.set(7, 0, shade(c, 0.3));
    img.rect(1, 9, 2, 2, shade(c, -0.2)); img.rect(11, 9, 2, 2, shade(c, -0.2));
    img.rect(2, 20, 10, 2, '#5f4038');
    img.vline(4, 4, 16, shade(c, 0.22));
    img.contour(); return img;
  },

  lamp_post: () => {
    const img = new Img(20, 76);
    const c = '#4e5456';
    img.rect(8, 6, 4, 68, c);
    img.vline(8, 6, 68, shade(c, 0.22));
    img.vline(11, 6, 68, shade(c, -0.3));
    img.rect(6, 72, 8, 4, shade(c, -0.15));
    img.line(10, 6, 16, 2, c); img.line(10, 7, 16, 3, shade(c, -0.2));
    img.rect(13, 2, 7, 4, '#5c6365');
    img.rect(14, 5, 5, 2, '#6f6a4c');
    rust(img, [8, 40, 4, 34], 37, 0.5);
    img.contour(); return img;
  },

  power_pole: () => {
    const img = new Img(28, 88);
    const c = '#5a4632';
    img.rect(12, 4, 5, 84, c);
    img.vline(12, 4, 84, shade(c, 0.2));
    img.vline(16, 4, 84, shade(c, -0.3));
    img.rect(2, 10, 24, 3, shade(c, -0.1));
    img.hline(2, 10, 24, shade(c, 0.2));
    img.rect(5, 18, 18, 3, shade(c, -0.1));
    for (const [x, y] of [[4, 8], [13, 8], [23, 8], [7, 16], [21, 16]]) {
      img.rect(x, y, 2, 3, '#6f7a70');
    }
    img.grain(0.05, 41, [12, 4, 5, 84]);
    img.contour(); return img;
  },

  street_bench: () => {
    const img = new Img(34, 20);
    const c = '#6a5238';
    for (let i = 0; i < 3; i++) img.rect(2, 4 + i * 3, 30, 2, shade(c, (i % 2 ? -0.1 : 0.06)));
    for (let i = 0; i < 3; i++) img.rect(2, 12 + i * 3, 30, 2, shade(c, (i % 2 ? -0.14 : 0)));
    img.rect(3, 12, 3, 8, '#4a4d4e'); img.rect(28, 12, 3, 8, '#4a4d4e');
    img.rect(3, 2, 2, 12, '#4a4d4e'); img.rect(29, 2, 2, 12, '#4a4d4e');
    img.contour(); return img;
  },

  picnic_table: () => {
    const img = new Img(40, 22);
    const c = '#6d5238';
    planks(img, 2, 2, 36, 5, c, 5);
    img.rect(6, 7, 3, 15, shade(c, -0.25)); img.rect(31, 7, 3, 15, shade(c, -0.25));
    img.rect(2, 13, 10, 3, shade(c, -0.1)); img.rect(28, 13, 10, 3, shade(c, -0.1));
    img.contour(); return img;
  },

  mailbox: () => {
    const img = new Img(16, 30);
    const c = '#5f6a63';
    img.rect(6, 12, 4, 18, '#5a4632');
    img.rect(2, 4, 12, 9, c);
    img.ellipse(8, 4, 6, 3, shade(c, 0.2));
    img.rect(2, 6, 2, 6, shade(c, -0.3));
    img.rect(12, 7, 2, 4, '#a55a44');
    rust(img, [2, 4, 12, 9], 43, 0.6);
    img.contour(); return img;
  },

  road_sign: () => {
    const img = new Img(26, 56);
    signPost(img, 13, 14, 56);
    img.rect(2, 2, 22, 14, '#5c6a4e');
    img.outline(2, 2, 22, 14, '#485840');
    img.hline(2, 2, 22, '#74836a');
    text(img, 5, 6, ['X  X XXX X', 'XX X X  X ', 'X  X XXX X'], '#cfd6c2');
    img.contour(); return img;
  },

  warning_sign: () => {
    const img = new Img(24, 48);
    signPost(img, 12, 16, 48);
    for (let y = 0; y < 16; y++) {
      const w = y < 8 ? y * 2 + 2 : (16 - y) * 2 + 2;
      img.rect(12 - Math.floor(w / 2), y, w, 1, '#b39a3e');
    }
    img.rect(11, 5, 2, 6, '#2c2a24'); img.rect(11, 12, 2, 2, '#2c2a24');
    img.contour(); return img;
  },

  newspaper_box: () => {
    const img = new Img(16, 26);
    const c = '#5a6a72';
    box(img, 2, 4, 12, 18, c);
    img.rect(4, 7, 8, 7, '#8f8b7a');
    img.rect(5, 8, 6, 5, '#b3ad99');
    img.rect(4, 22, 3, 4, '#3f4548'); img.rect(9, 22, 3, 4, '#3f4548');
    img.contour(); return img;
  },

  planter: () => {
    const img = new Img(24, 20);
    const c = '#7a6a58';
    box(img, 1, 8, 22, 12, c);
    img.rect(2, 6, 20, 3, shade(c, 0.14));
    img.rect(3, 8, 18, 3, '#4a3a28');
    for (let i = 0; i < 9; i++) {
      const x = 4 + i * 2;
      const h = 4 + Math.floor(hash(i, 3, 9) * 6);
      for (let j = 0; j < h; j++) img.set(x + Math.round(Math.sin(j * 0.5) * 1.2), 8 - j, j > h - 2 ? '#6d8a4a' : '#4e6b36');
    }
    img.contour(); return img;
  },

  /* ------------------------------------------------------------ nature ---*/
  dead_tree: () => {
    const img = new Img(52, 78);
    const c = '#4a3f33';
    const branch = (x, y, len, ang, w) => {
      let cx = x, cy = y;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const ww = Math.max(1, Math.round(w * (1 - t)));
        for (let k = 0; k < ww; k++) img.set(Math.round(cx) + k, Math.round(cy), k === 0 ? shade(c, 0.18) : shade(c, -0.12 * k));
        cx += Math.cos(ang) + (hash(i, x, 3) - 0.5) * 0.5;
        cy += Math.sin(ang);
        if (i === Math.floor(len * 0.55) && w > 2) branch(cx, cy, len * 0.5, ang + (hash(i, y, 5) > 0.5 ? 0.8 : -0.8), w - 2);
      }
    };
    img.rect(22, 30, 8, 48, c);
    for (let y = 30; y < 78; y++) {
      img.set(22, y, shade(c, 0.2));
      img.set(29, y, shade(c, -0.3));
      if (hash(y, 1, 7) > 0.6) img.set(24 + Math.floor(hash(y, 2, 9) * 4), y, shade(c, -0.3));
    }
    img.rect(18, 74, 16, 4, shade(c, -0.2));
    branch(26, 32, 26, -1.9, 5);
    branch(25, 38, 20, -2.6, 4);
    branch(27, 40, 20, -0.6, 4);
    branch(26, 48, 14, -0.3, 3);
    branch(25, 52, 13, -2.9, 3);
    img.contour(); return img;
  },

  pine_tree: () => {
    const img = new Img(56, 96);
    const trunk = '#4a3728';
    img.rect(25, 60, 7, 36, trunk);
    img.vline(25, 60, 36, shade(trunk, 0.2));
    img.vline(31, 60, 36, shade(trunk, -0.3));
    const deep = '#253b26', mid = '#32502f', light = '#3f6338';
    for (let layer = 0; layer < 5; layer++) {
      const cy = 18 + layer * 13;
      const halfW = 8 + layer * 4.4;
      for (let y = cy; y < cy + 20; y++) {
        const t = (y - cy) / 20;
        const w = Math.round(halfW * t);
        for (let x = -w; x <= w; x++) {
          const n = vnoise(x + 28, y, 4, layer);
          if (n < 0.28) continue;
          const c = x < -w * 0.4 ? light : x > w * 0.5 ? deep : n > 0.62 ? light : mid;
          img.set(28 + x, y, c);
        }
      }
    }
    img.volume(0.12);
    img.contour(); return img;
  },

  bush: () => {
    const img = new Img(30, 22);
    const deep = '#2c4429', mid = '#3b5a33', light = '#4e7240';
    for (let y = 0; y < 22; y++) for (let x = 0; x < 30; x++) {
      const dx = (x - 15) / 14, dy = (y - 18) / 17;
      const n = vnoise(x, y, 5, 3) * 0.45;
      if (dx * dx + dy * dy > 1 + n * 0.4) continue;
      img.set(x, y, y < 8 ? light : y < 15 ? mid : deep);
    }
    for (let i = 0; i < 8; i++) {
      const x = 3 + Math.floor(hash(i, 5, 2) * 24), y = 2 + Math.floor(hash(i, 7, 3) * 12);
      img.ellipse(x, y, 2.4, 1.6, light);
    }
    img.volume(0.12); img.contour(); return img;
  },

  fallen_log: () => {
    const img = new Img(46, 16);
    const c = '#57432f';
    img.rect(2, 3, 42, 11, c);
    img.hline(2, 3, 42, shade(c, 0.22));
    img.hline(2, 13, 42, shade(c, -0.3));
    for (let x = 2; x < 44; x++) if (hash(x, 1, 3) > 0.55) img.vline(x, 5, 7, shade(c, -0.16));
    img.ellipse(3, 8, 3, 5.5, '#6d563c');
    img.ellipseOutline(3, 8, 3, 5.5, shade(c, -0.25));
    img.ellipse(3, 8, 1.4, 2.6, '#5b4630');
    img.patches('#4e6a3e', 7, 0.55, 0.6, 9);
    img.contour(); return img;
  },

  stump: () => {
    const img = new Img(24, 18);
    const c = '#57432f';
    img.rect(3, 4, 18, 14, c);
    img.ellipse(12, 4, 9, 3, '#6f573c');
    img.ellipseOutline(12, 4, 9, 3, shade(c, -0.2));
    img.ellipseOutline(12, 4, 5.5, 1.8, shade(c, -0.14));
    img.ellipseOutline(12, 4, 2.6, 1, shade(c, -0.14));
    for (let x = 3; x < 21; x++) if (hash(x, 2, 5) > 0.6) img.vline(x, 6, 12, shade(c, -0.18));
    img.contour(); return img;
  },

  crop_row: () => {
    const img = new Img(48, 26);
    img.rect(0, 22, 48, 4, '#4e3a28');
    for (let i = 0; i < 9; i++) {
      const x = 3 + i * 5;
      const h = 12 + Math.floor(hash(i, 3, 7) * 9);
      for (let j = 0; j < h; j++) {
        const xx = x + Math.round(Math.sin(j * 0.25 + i) * 1.3);
        img.set(xx, 22 - j, j > h - 4 ? '#8a8a4a' : '#55703a');
        if (j % 4 === 2) img.set(xx + (j % 8 < 4 ? 2 : -2), 22 - j, '#5f7d3e');
      }
      img.rect(x - 1, 22 - h - 2, 3, 3, '#9a8c4e');
    }
    img.contour(); return img;
  },

  hay_bale: () => {
    const img = new Img(34, 26);
    const c = '#9a8248';
    img.ellipse(17, 14, 16, 12, c);
    for (let i = 0; i < 40; i++) {
      const a = hash(i, 3, 1) * Math.PI * 2, r = hash(i, 5, 2);
      const x = 17 + Math.cos(a) * 15 * r, y = 14 + Math.sin(a) * 11 * r;
      img.hline(Math.round(x), Math.round(y), 2 + Math.floor(hash(i, 7, 3) * 3), shade(c, (hash(i, 11, 4) - 0.5) * 0.4));
    }
    img.ellipseOutline(17, 14, 16, 12, shade(c, -0.3));
    img.ellipse(17, 14, 7, 5, shade(c, -0.12));
    img.ellipseOutline(17, 14, 7, 5, shade(c, -0.26));
    img.contour(); return img;
  },

  well: () => {
    const img = new Img(34, 40);
    const stone = '#6d6a62';
    img.rect(4, 22, 26, 18, stone);
    for (let y = 22; y < 40; y += 5) for (let x = 4; x < 30; x += 7) {
      const c = shade(stone, (hash(x, y, 3) - 0.5) * 0.3);
      img.rect(x + ((y / 5) % 2 ? 3 : 0), y, 6, 4, c);
      img.hline(x + ((y / 5) % 2 ? 3 : 0), y, 6, shade(c, 0.18));
    }
    img.ellipse(17, 22, 13, 3.4, '#2b2a28');
    img.ellipseOutline(17, 22, 13, 3.4, shade(stone, 0.2));
    img.rect(6, 6, 3, 18, '#5a4632'); img.rect(25, 6, 3, 18, '#5a4632');
    for (let i = 0; i < 16; i++) img.rect(2 + i, 4 - Math.abs(i - 8) / 2, 2, 3, '#6b5237');
    img.rect(16, 8, 3, 3, '#4a4d4e');
    img.line(17, 11, 17, 20, '#7a7468');
    img.contour(); return img;
  },

  water_trough: () => {
    const img = new Img(38, 16);
    const c = '#6a5942';
    box(img, 1, 3, 36, 12, c);
    img.rect(3, 5, 32, 4, '#3f5a62');
    img.hline(3, 5, 32, '#6f939c');
    img.patches('#4e6a3e', 6, 0.6, 0.5, 13);
    img.contour(); return img;
  },

  silo: () => {
    const img = new Img(46, 120);
    const c = '#8a8578';
    img.rect(4, 14, 38, 106, c);
    for (let y = 14; y < 120; y += 9) img.hline(4, y, 38, shade(c, -0.2));
    for (let x = 4; x < 42; x += 9) img.vline(x, 14, 106, shade(c, -0.12));
    img.vline(4, 14, 106, shade(c, 0.22));
    img.vline(41, 14, 106, shade(c, -0.3));
    for (let y = 0; y < 14; y++) {
      const w = Math.round(38 * Math.sqrt(1 - Math.pow((14 - y) / 14, 2)));
      img.rect(23 - Math.floor(w / 2), y, w, 1, shade('#6f7a72', y < 5 ? 0.16 : -0.05));
    }
    img.rect(18, 60, 10, 18, shade(c, -0.3));
    img.hline(18, 60, 10, shade(c, 0.1));
    rust(img, [4, 14, 38, 106], 53, 0.55);
    img.contour(); return img;
  },

  tractor_wreck: () => {
    const img = new Img(64, 42);
    const body = '#6a5a3c';
    img.rect(18, 14, 30, 16, body);
    img.hline(18, 14, 30, shade(body, 0.2));
    img.rect(10, 20, 10, 10, shade(body, -0.16));
    img.rect(30, 4, 16, 12, shade(body, -0.05));
    img.rect(33, 6, 10, 7, '#3f4a4c');
    img.rect(33, 6, 10, 3, '#5c6d70');
    img.rect(22, 6, 4, 9, '#4a4238');
    img.ellipse(44, 32, 11, 10, '#24262a');
    img.ellipseOutline(44, 32, 11, 10, '#3d4147');
    img.ellipse(44, 32, 5, 4.5, '#6a5a3c');
    img.ellipse(16, 34, 7, 6.5, '#24262a');
    img.ellipse(16, 34, 3, 2.8, '#6a5a3c');
    rust(img, [10, 4, 50, 30], 59, 0.95);
    img.contour(); return img;
  },

  wrecked_car: () => {
    const img = new Img(76, 34);
    const body = '#5a5d58';
    img.rect(6, 14, 64, 13, body);
    img.rect(20, 5, 34, 10, shade(body, -0.08));
    img.rect(23, 7, 12, 7, '#39424a');
    img.rect(38, 7, 12, 7, '#39424a');
    img.hline(20, 5, 34, shade(body, 0.2));
    img.hline(6, 14, 64, shade(body, 0.16));
    img.rect(2, 16, 6, 6, shade(body, -0.25));
    img.ellipse(20, 28, 9, 6, '#212429');
    img.ellipse(56, 28, 9, 6, '#212429');
    img.ellipse(20, 28, 4, 2.6, '#4a4f52');
    img.ellipse(56, 28, 4, 2.6, '#4a4f52');
    // caved-in roof + broken glass
    img.rect(30, 3, 12, 4, shade(body, -0.3));
    for (let i = 0; i < 12; i++) img.set(24 + Math.floor(hash(i, 3, 1) * 26), 8 + Math.floor(hash(i, 5, 2) * 5), '#8fa6ac');
    rust(img, [2, 3, 72, 26], 61, 1);
    img.contour(); return img;
  },

  /* ------------------------------------------------------------ indoor ---*/
  couch: () => {
    const img = new Img(48, 26);
    const c = '#5f5348';
    img.rect(2, 6, 44, 16, c);
    img.rect(2, 4, 44, 6, shade(c, 0.1));
    img.hline(2, 4, 44, shade(c, 0.26));
    img.rect(0, 8, 6, 14, shade(c, -0.12));
    img.rect(42, 8, 6, 14, shade(c, -0.2));
    img.rect(8, 10, 15, 8, shade(c, 0.08));
    img.rect(25, 10, 15, 8, shade(c, 0.08));
    img.rect(4, 22, 4, 4, '#3a3028'); img.rect(40, 22, 4, 4, '#3a3028');
    img.patches('#4a4038', 9, 0.6, 0.5, 67);
    img.contour(); return img;
  },

  chair: () => {
    const img = new Img(20, 30);
    const c = '#6a5238';
    img.rect(3, 14, 15, 4, c);
    img.hline(3, 14, 15, shade(c, 0.2));
    img.rect(3, 2, 3, 14, shade(c, -0.1));
    img.rect(15, 2, 3, 14, shade(c, -0.1));
    for (let y = 4; y < 14; y += 4) img.rect(5, y, 11, 2, shade(c, -0.05));
    img.rect(4, 18, 3, 12, shade(c, -0.22)); img.rect(14, 18, 3, 12, shade(c, -0.22));
    img.contour(); return img;
  },

  table: () => {
    const img = new Img(40, 24);
    const c = '#6d5238';
    planks(img, 1, 2, 38, 5, c, 3);
    img.hline(1, 2, 38, shade(c, 0.24));
    img.rect(4, 7, 4, 17, shade(c, -0.25));
    img.rect(32, 7, 4, 17, shade(c, -0.25));
    img.rect(6, 10, 28, 2, shade(c, -0.15));
    img.contour(); return img;
  },

  bed: () => {
    const img = new Img(52, 26);
    const frame = '#5a4632';
    img.rect(0, 4, 5, 22, frame);
    img.rect(47, 10, 5, 16, frame);
    img.rect(4, 12, 44, 9, '#7c7364');
    img.hline(4, 12, 44, '#938a78');
    img.rect(6, 8, 15, 6, '#a8a08c');
    img.hline(6, 8, 15, '#bcb4a0');
    img.rect(20, 12, 28, 4, '#5f6a5c');
    img.rect(4, 21, 44, 3, shade('#7c7364', -0.3));
    img.patches('#6a6156', 8, 0.55, 0.45, 71);
    img.contour(); return img;
  },

  hospital_bed: () => {
    const img = new Img(54, 28);
    const frame = '#8f979a';
    img.rect(0, 2, 4, 24, frame);
    img.rect(50, 8, 4, 18, frame);
    img.rect(4, 12, 46, 8, '#b6bcb4');
    img.hline(4, 12, 46, '#cdd2c9');
    img.rect(6, 7, 14, 6, '#d5d9d1');
    img.rect(22, 12, 26, 4, '#7d9299');
    img.rect(4, 20, 46, 3, '#8b9192');
    img.rect(6, 23, 3, 5, '#5c6265'); img.rect(44, 23, 3, 5, '#5c6265');
    img.patches('#9aa08f', 9, 0.65, 0.4, 73);
    img.contour(); return img;
  },

  fridge: () => {
    const img = new Img(26, 46);
    const c = '#9aa19a';
    box(img, 1, 0, 24, 46, c);
    img.hline(1, 16, 24, shade(c, -0.3));
    img.rect(20, 5, 2, 8, shade(c, -0.35));
    img.rect(20, 20, 2, 12, shade(c, -0.35));
    img.rect(4, 3, 8, 5, shade(c, 0.12));
    rust(img, [1, 0, 24, 46], 79, 0.35);
    img.patches('#7c8378', 9, 0.65, 0.4, 83);
    img.contour(); return img;
  },

  shelf: () => {
    const img = new Img(30, 42);
    const c = '#6a5238';
    img.rect(0, 0, 3, 42, shade(c, -0.1));
    img.rect(27, 0, 3, 42, shade(c, -0.25));
    for (let i = 0; i < 4; i++) {
      const y = 4 + i * 10;
      img.rect(2, y, 26, 3, c);
      img.hline(2, y, 26, shade(c, 0.22));
      for (let k = 0; k < 4; k++) {
        if (hash(i, k, 3) < 0.4) continue;
        const bw = 3 + Math.floor(hash(i, k, 5) * 3);
        const bc = ['#7c6a4a', '#5f6a5c', '#8a5a4a', '#6a707a'][Math.floor(hash(i, k, 7) * 4)];
        img.rect(4 + k * 6, y - 5, bw, 5, bc);
        img.hline(4 + k * 6, y - 5, bw, shade(bc, 0.2));
      }
    }
    img.contour(); return img;
  },

  locker: () => {
    const img = new Img(30, 48);
    const c = '#5f6a64';
    box(img, 1, 0, 28, 48, c);
    img.vline(15, 0, 48, shade(c, -0.35));
    for (const x of [3, 17]) {
      img.rect(x, 4, 9, 3, shade(c, -0.25));
      for (let i = 0; i < 3; i++) img.hline(x, 5 + i, 9, shade(c, -0.15));
      img.rect(x + 8, 22, 2, 4, shade(c, 0.3));
    }
    img.hline(1, 46, 28, shade(c, -0.35));
    rust(img, [1, 0, 28, 48], 89, 0.5);
    img.contour(); return img;
  },

  old_tv: () => {
    const img = new Img(30, 26);
    const c = '#4f4a42';
    box(img, 1, 2, 28, 22, c);
    img.rect(3, 4, 19, 16, '#2b3033');
    img.rect(4, 5, 17, 14, '#3d474a');
    for (let y = 5; y < 19; y += 2) img.hline(4, y, 17, '#454f52');
    img.rect(23, 5, 5, 4, shade(c, -0.2));
    img.ellipse(25, 13, 2, 2, '#6f6a55');
    img.rect(6, 24, 4, 2, '#2f2b26'); img.rect(20, 24, 4, 2, '#2f2b26');
    img.contour(); return img;
  },

  sink: () => {
    const img = new Img(26, 24);
    const c = '#a5aca4';
    img.rect(1, 6, 24, 8, c);
    img.hline(1, 6, 24, shade(c, 0.22));
    img.rect(3, 8, 20, 5, shade(c, -0.22));
    img.rect(12, 0, 2, 7, '#8c948f');
    img.rect(12, 0, 6, 2, '#8c948f');
    img.rect(8, 14, 10, 10, shade(c, -0.15));
    img.rect(11, 14, 4, 10, shade(c, -0.3));
    img.patches('#7d8378', 8, 0.65, 0.4, 97);
    img.contour(); return img;
  },

  school_desk: () => {
    const img = new Img(28, 26);
    const top = '#8a7550';
    img.rect(1, 6, 26, 4, top);
    img.hline(1, 6, 26, shade(top, 0.22));
    img.rect(3, 10, 3, 16, '#5c6467'); img.rect(22, 10, 3, 16, '#5c6467');
    img.rect(4, 15, 20, 3, '#6a5238');
    img.contour(); return img;
  },

  chalkboard: () => {
    const img = new Img(48, 28);
    const frame = '#6a5238';
    img.rect(0, 0, 48, 28, frame);
    img.rect(3, 3, 42, 20, '#33413a');
    for (let i = 0; i < 9; i++) {
      img.hline(6 + Math.floor(hash(i, 3, 1) * 10), 6 + i * 2, 6 + Math.floor(hash(i, 5, 2) * 20), '#7d8a80');
    }
    img.rect(2, 23, 44, 3, shade(frame, -0.2));
    img.rect(8, 22, 5, 2, '#c8c4b2');
    img.contour(); return img;
  },

  tool_cabinet: () => {
    const img = new Img(32, 40);
    const c = '#5a6470';
    box(img, 1, 0, 30, 40, c);
    for (let i = 0; i < 4; i++) {
      const y = 3 + i * 9;
      img.rect(3, y, 26, 7, shade(c, i % 2 ? -0.08 : 0.04));
      img.hline(3, y, 26, shade(c, 0.2));
      img.rect(12, y + 2, 8, 2, shade(c, -0.32));
    }
    img.rect(1, 38, 30, 2, shade(c, -0.35));
    rust(img, [1, 0, 30, 40], 101, 0.45);
    img.contour(); return img;
  },

  vending_machine: () => {
    const img = new Img(30, 52);
    const c = '#5a4a4a';
    box(img, 1, 0, 28, 52, c);
    img.rect(3, 3, 18, 36, '#2f3a3d');
    for (let r = 0; r < 4; r++) {
      img.hline(3, 6 + r * 9, 18, '#4a5457');
      for (let k = 0; k < 4; k++) {
        if (hash(r, k, 3) < 0.35) continue;
        const bc = ['#8a5a4a', '#6a7a4a', '#4a6a7a', '#8a7a4a'][Math.floor(hash(r, k, 5) * 4)];
        img.rect(5 + k * 4, 2 + r * 9, 3, 4, bc);
      }
    }
    img.rect(22, 4, 6, 20, shade(c, -0.2));
    for (let i = 0; i < 5; i++) img.rect(23, 6 + i * 3, 4, 2, '#6f6a5a');
    img.rect(3, 42, 18, 7, '#262b2d');
    img.hline(3, 42, 18, '#3f4648');
    img.contour(); return img;
  },

  ice_machine: () => {
    const img = new Img(28, 42);
    const c = '#6a7a80';
    box(img, 1, 0, 26, 42, c);
    img.rect(3, 4, 22, 14, '#86979c');
    text(img, 6, 8, ['X XXX XXX', 'X X   X  ', 'X XXX XXX'], '#2f3a3d');
    img.rect(3, 22, 22, 14, shade(c, -0.18));
    img.rect(8, 26, 12, 3, shade(c, -0.32));
    rust(img, [1, 0, 26, 42], 103, 0.5);
    img.contour(); return img;
  },

  ac_unit: () => {
    const img = new Img(26, 20);
    const c = '#8a908c';
    box(img, 0, 0, 26, 20, c);
    img.ellipse(13, 10, 8, 7, shade(c, -0.25));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      img.line(13, 10, 13 + Math.cos(a) * 7, 10 + Math.sin(a) * 6, shade(c, 0.1));
    }
    img.ellipse(13, 10, 2, 2, shade(c, -0.4));
    rust(img, [0, 0, 26, 20], 107, 0.6);
    img.contour(); return img;
  },

  /* ----------------------------------------------------------- signage ---*/
  gas_pump: () => {
    const img = new Img(24, 40);
    const c = '#8a5a4a';
    box(img, 3, 4, 18, 34, c);
    img.rect(5, 7, 14, 10, '#2f3a3d');
    img.rect(6, 8, 12, 8, '#5f7a74');
    text(img, 8, 10, ['XX X', 'X  X', 'XX X'], '#c4d2c8');
    img.rect(5, 20, 14, 5, shade(c, -0.2));
    img.rect(1, 22, 3, 10, '#3f4548');
    img.line(2, 22, 2, 14, '#3f4548');
    img.rect(3, 36, 18, 4, '#4a4d4e');
    img.rect(8, 0, 8, 5, '#b9a14e');
    rust(img, [3, 4, 18, 34], 109, 0.5);
    img.contour(); return img;
  },

  gas_sign: () => {
    const img = new Img(34, 72);
    signPost(img, 11, 26, 72); signPost(img, 23, 26, 72);
    img.rect(1, 2, 32, 24, '#5a6a72');
    img.outline(1, 2, 32, 24, '#3f4a50');
    img.rect(3, 4, 28, 12, '#b9a14e');
    text(img, 6, 7, ['XXX  X  XXX', 'X   XXX X  ', 'XXX X X XXX'], '#37342a');
    img.rect(3, 18, 28, 6, '#2f3a3d');
    for (let i = 0; i < 3; i++) img.rect(5 + i * 9, 19, 6, 4, '#7a8a5a');
    img.contour(); return img;
  },

  motel_sign: () => {
    const img = new Img(36, 84);
    signPost(img, 18, 40, 84, '#5a5148');
    img.rect(2, 2, 32, 40, '#6a4a4a');
    img.outline(2, 2, 32, 40, '#4a3434');
    img.rect(4, 4, 28, 22, '#3c3030');
    text(img, 7, 8, ['X X XXX XXX XX X', 'XXX X X   X X  X', 'X X XXX XXX XX X'], '#c2a05c');
    img.rect(4, 28, 28, 12, '#4a3c3c');
    text(img, 8, 31, ['X X  XXX XXX X', 'X X  X X X   X', 'XXX  XXX XXX X'], '#8a8a72');
    for (let i = 0; i < 6; i++) { img.set(3 + i * 6, 3, '#e0c078'); img.set(3 + i * 6, 41, '#e0c078'); }
    img.contour(); return img;
  },

  school_sign: () => {
    const img = new Img(40, 44);
    img.rect(2, 2, 36, 24, '#6a6255');
    img.outline(2, 2, 36, 24, '#4a453c');
    img.rect(4, 4, 32, 9, '#8a8270');
    text(img, 6, 6, ['XXX XXX X X XXX XXX X', 'X   X   XXX X X X   X', 'XXX XXX X X XXX XXX XXX'], '#33302a');
    img.rect(4, 15, 32, 9, '#3f4a44');
    img.rect(6, 26, 4, 18, '#5c5c5c'); img.rect(30, 26, 4, 18, '#5c5c5c');
    img.contour(); return img;
  },

  neon_sign: () => {
    const img = new Img(34, 20);
    img.rect(0, 0, 34, 20, '#2b2f33');
    img.outline(0, 0, 34, 20, '#43484c');
    const on = '#c4707a';
    img.rect(4, 5, 3, 10, on); img.rect(7, 5, 5, 3, on); img.rect(7, 9, 4, 2, on);
    img.rect(15, 5, 3, 10, on); img.rect(18, 12, 4, 3, on);
    img.rect(25, 5, 5, 3, on); img.rect(25, 8, 3, 7, on);
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(hash(i, 3, 1) * 34), y = Math.floor(hash(i, 5, 2) * 20);
      if (img.get(x, y)[0] > 150) img.set(x, y, '#e8a0a6');
    }
    img.contour(); return img;
  },

  bus_stop: () => {
    const img = new Img(48, 52);
    const c = '#5c6a6c';
    img.rect(2, 2, 44, 4, c);
    img.hline(2, 2, 44, shade(c, 0.26));
    img.rect(3, 6, 3, 46, c);
    img.rect(42, 6, 3, 46, c);
    img.rect(6, 8, 36, 26, [138, 166, 172, 90]);
    img.line(6, 8, 41, 33, [200, 222, 226, 70]);
    img.rect(8, 38, 32, 4, '#6a5238');
    img.rect(10, 42, 3, 10, '#4a4d4e'); img.rect(35, 42, 3, 10, '#4a4d4e');
    img.rect(12, 10, 12, 10, '#5f6a4e');
    img.contour(); return img;
  },

  awning: () => {
    const img = new Img(46, 18);
    for (let i = 0; i < 46; i += 8) {
      img.rect(i, 0, 4, 14, '#7a4a44');
      img.rect(i + 4, 0, 4, 14, '#9a8a72');
    }
    for (let i = 0; i < 46; i += 8) {
      img.rect(i, 14, 4, 3, '#63393a');
      img.rect(i + 4, 14, 4, 3, '#7d6f5c');
    }
    img.hline(0, 0, 46, '#4a4d4e');
    img.contour(); return img;
  },

  boarded_window: () => {
    const img = new Img(34, 34);
    img.rect(0, 0, 34, 34, '#2b2e2f');
    img.outline(0, 0, 34, 34, '#5a5148');
    for (let i = 0; i < 3; i++) {
      const y = 3 + i * 11;
      const c = shade('#7a5c3e', (hash(i, 3, 1) - 0.5) * 0.3);
      img.rect(-2 + Math.floor(hash(i, 5, 2) * 4), y, 38, 8, c);
      img.hline(0, y, 34, shade(c, 0.2));
      img.hline(0, y + 7, 34, shade(c, -0.3));
      img.set(4, y + 3, '#a8a49a'); img.set(28, y + 3, '#a8a49a');
    }
    img.contour(); return img;
  },

  stairs: () => {
    const img = new Img(40, 36);
    const c = '#6d6a62';
    for (let i = 0; i < 5; i++) {
      const y = 36 - (i + 1) * 7;
      img.rect(i * 8, y, 40 - i * 8, 7, shade(c, -0.05 * i));
      img.hline(i * 8, y, 40 - i * 8, shade(c, 0.22));
    }
    img.grain(0.05, 113);
    img.contour(); return img;
  },

  /* ------------------------------------------------------- industrial ---*/
  lift_jack: () => {
    const img = new Img(44, 34);
    const c = '#6a6a52';
    img.rect(2, 28, 40, 6, shade(c, -0.2));
    img.rect(18, 8, 8, 22, c);
    img.vline(18, 8, 22, shade(c, 0.22));
    img.rect(4, 4, 36, 5, c);
    img.hline(4, 4, 36, shade(c, 0.26));
    img.rect(2, 2, 8, 3, '#8a6a32'); img.rect(34, 2, 8, 3, '#8a6a32');
    rust(img, [2, 2, 40, 32], 127, 0.6);
    img.contour(); return img;
  },

  engine_block: () => {
    const img = new Img(30, 24);
    const c = '#6a7174';
    box(img, 2, 4, 26, 18, c);
    for (let i = 0; i < 4; i++) img.rect(4 + i * 6, 0, 4, 6, shade(c, 0.1));
    img.rect(5, 10, 20, 3, shade(c, -0.3));
    img.rect(8, 16, 14, 4, shade(c, -0.15));
    img.rect(26, 8, 4, 8, '#7a5a42');
    rust(img, [2, 0, 28, 22], 131, 0.7);
    img.contour(); return img;
  },

  machinery: () => {
    const img = new Img(40, 36);
    const c = '#5f6a64';
    box(img, 2, 8, 36, 28, c);
    img.rect(6, 12, 12, 10, '#2f3a3d');
    img.rect(7, 13, 10, 8, '#4a6a62');
    for (let i = 0; i < 3; i++) img.hline(7, 14 + i * 2, 10, '#5f8077');
    img.ellipse(28, 18, 6, 6, shade(c, -0.2));
    img.ellipseOutline(28, 18, 6, 6, shade(c, 0.2));
    img.rect(26, 16, 5, 2, shade(c, -0.4));
    img.rect(10, 26, 20, 4, shade(c, -0.25));
    img.rect(4, 2, 8, 7, '#4a5250');
    img.rect(14, 4, 4, 5, '#7a5a42');
    rust(img, [2, 2, 36, 34], 137, 0.65);
    img.contour(); return img;
  },

  pipe_run: () => {
    const img = new Img(48, 20);
    const c = '#6a7174';
    img.rect(0, 3, 48, 7, c);
    img.hline(0, 3, 48, shade(c, 0.28));
    img.hline(0, 9, 48, shade(c, -0.32));
    img.rect(0, 13, 48, 5, shade(c, -0.1));
    img.hline(0, 13, 48, shade(c, 0.18));
    for (const x of [8, 26, 42]) { img.rect(x, 2, 3, 9, shade(c, -0.2)); img.rect(x, 12, 3, 7, shade(c, -0.2)); }
    rust(img, [0, 0, 48, 20], 139, 0.8);
    img.contour(); return img;
  },

  vent_fan: () => {
    const img = new Img(30, 30);
    const c = '#5c6466';
    box(img, 0, 0, 30, 30, c);
    img.ellipse(15, 15, 12, 12, '#2f3538');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      img.line(15, 15, 15 + Math.cos(a) * 11, 15 + Math.sin(a) * 11, '#6f7a7c');
      img.line(15, 15, 15 + Math.cos(a + 0.3) * 10, 15 + Math.sin(a + 0.3) * 10, '#4a5254');
    }
    img.ellipse(15, 15, 3, 3, '#7a8284');
    for (const [x, y] of [[2, 2], [26, 2], [2, 26], [26, 26]]) img.rect(x, y, 2, 2, '#8a9294');
    rust(img, [0, 0, 30, 30], 149, 0.5);
    img.contour(); return img;
  },

  lab_console: () => {
    const img = new Img(38, 30);
    const c = '#4f585c';
    box(img, 1, 6, 36, 24, c);
    img.rect(4, 9, 18, 12, '#1f2729');
    for (let i = 0; i < 5; i++) img.hline(6, 11 + i * 2, 4 + Math.floor(hash(i, 3, 1) * 12), '#6f9a8a');
    img.rect(25, 9, 10, 6, '#2b3336');
    img.rect(26, 10, 3, 2, '#8a6a4a'); img.rect(30, 10, 3, 2, '#6a8a6a');
    img.rect(4, 23, 30, 4, shade(c, -0.25));
    for (let i = 0; i < 7; i++) img.rect(5 + i * 4, 24, 3, 2, i % 3 === 0 ? '#7a8a8c' : '#3f4648');
    img.rect(6, 2, 26, 4, shade(c, 0.1));
    img.contour(); return img;
  },

  containment_pod: () => {
    const img = new Img(28, 52);
    const c = '#5a6668';
    img.rect(2, 4, 24, 46, c);
    img.rect(5, 8, 18, 30, [122, 158, 152, 130]);
    img.line(6, 10, 20, 34, [180, 214, 206, 80]);
    img.rect(2, 0, 24, 6, shade(c, 0.12));
    img.rect(2, 44, 24, 8, shade(c, -0.18));
    for (let y = 8; y < 38; y += 6) { img.set(4, y, shade(c, 0.3)); img.set(24, y, shade(c, -0.3)); }
    img.rect(10, 46, 8, 3, '#7a8a5a');
    img.contour(); return img;
  },

  floodlight_prop: () => {
    const img = new Img(26, 60);
    const c = '#5a6062';
    img.rect(11, 12, 4, 44, c);
    img.rect(6, 54, 14, 5, shade(c, -0.2));
    img.rect(4, 2, 18, 11, shade(c, 0.05));
    img.rect(6, 4, 14, 7, '#c2b57e');
    img.hline(6, 4, 14, '#e2d8a6');
    img.outline(4, 2, 18, 11, shade(c, -0.3));
    img.contour(); return img;
  },

  rail_signal: () => {
    const img = new Img(20, 56);
    const c = '#4f5456';
    img.rect(8, 8, 4, 48, c);
    img.rect(5, 52, 10, 4, shade(c, -0.2));
    img.rect(4, 2, 12, 16, shade(c, 0.05));
    img.ellipse(10, 6, 3, 3, '#8a4a44');
    img.ellipse(10, 13, 3, 3, '#3f4a3f');
    img.outline(4, 2, 12, 16, shade(c, -0.3));
    rust(img, [8, 20, 4, 36], 151, 0.5);
    img.contour(); return img;
  },

  rail_cart: () => {
    const img = new Img(40, 26);
    const c = '#6a5f52';
    box(img, 2, 6, 36, 14, c);
    for (let x = 4; x < 36; x += 6) img.vline(x, 7, 12, shade(c, -0.2));
    img.hline(2, 6, 36, shade(c, 0.24));
    img.ellipse(10, 22, 5, 4, '#2b2e30');
    img.ellipse(30, 22, 5, 4, '#2b2e30');
    img.ellipse(10, 22, 2, 1.6, '#5f6668');
    img.ellipse(30, 22, 2, 1.6, '#5f6668');
    rust(img, [2, 6, 36, 14], 157, 0.8);
    img.contour(); return img;
  },

  shopping_cart: () => {
    const img = new Img(30, 26);
    const c = '#8a9296';
    for (let x = 4; x < 26; x += 4) img.vline(x, 6, 12, c);
    for (let y = 6; y < 18; y += 4) img.hline(4, y, 22, c);
    img.hline(4, 18, 22, shade(c, -0.25));
    img.line(26, 6, 29, 2, c);
    img.ellipse(8, 22, 3, 3, '#3a3f42');
    img.ellipse(22, 22, 3, 3, '#3a3f42');
    img.contour(); return img;
  },

  swing_set: () => {
    const img = new Img(52, 46);
    const c = '#6a6055';
    img.line(4, 46, 14, 4, c); img.line(5, 46, 15, 4, shade(c, -0.2));
    img.line(48, 46, 38, 4, c); img.line(47, 46, 37, 4, shade(c, -0.2));
    img.rect(12, 3, 28, 3, c);
    img.hline(12, 3, 28, shade(c, 0.24));
    for (const x of [18, 32]) {
      img.vline(x, 6, 20, '#5f6668');
      img.vline(x + 5, 6, 20, '#5f6668');
      img.rect(x - 1, 26, 8, 3, '#7a4a44');
    }
    img.contour(); return img;
  },

  iv_stand: () => {
    const img = new Img(16, 44);
    const c = '#96a09c';
    img.rect(7, 6, 2, 34, c);
    img.rect(3, 40, 10, 2, shade(c, -0.2));
    img.rect(5, 42, 2, 2, shade(c, -0.3)); img.rect(9, 42, 2, 2, shade(c, -0.3));
    img.rect(4, 2, 8, 4, c);
    img.rect(3, 8, 6, 12, [176, 196, 188, 190]);
    img.hline(3, 12, 6, [206, 226, 218, 220]);
    img.line(6, 20, 8, 30, '#8a9490');
    img.contour(); return img;
  },

  medicine_cabinet: () => {
    const img = new Img(28, 32);
    const c = '#a8aea6';
    box(img, 0, 0, 28, 32, c);
    img.rect(2, 2, 24, 22, '#8c948c');
    img.rect(12, 4, 4, 14, '#a05a56'); img.rect(7, 9, 14, 4, '#a05a56');
    img.rect(2, 26, 24, 4, shade(c, -0.25));
    img.contour(); return img;
  },

  reception_desk: () => {
    const img = new Img(46, 28);
    const c = '#6d5c44';
    box(img, 0, 6, 46, 22, c);
    img.rect(0, 4, 46, 4, shade(c, 0.14));
    img.hline(0, 4, 46, shade(c, 0.3));
    img.rect(4, 12, 14, 8, shade(c, -0.2));
    img.rect(26, 12, 16, 8, shade(c, -0.2));
    img.rect(30, 0, 10, 5, '#8a9096');
    img.rect(31, 1, 8, 3, '#39424a');
    img.contour(); return img;
  },

  washing_line: () => {
    const img = new Img(60, 34);
    img.line(0, 6, 60, 10, '#7a7468');
    const colors = ['#7a8a72', '#8a7a6a', '#6a7a8a', '#8a8a6a'];
    for (let i = 0; i < 4; i++) {
      const x = 6 + i * 14;
      const y = 7 + Math.round(i * 0.7);
      const c = colors[i];
      img.rect(x, y, 10, 14 + (i % 2) * 4, c);
      img.hline(x, y, 10, shade(c, 0.2));
      img.hline(x, y + 13 + (i % 2) * 4, 10, shade(c, -0.3));
      img.set(x + 2, y - 1, '#5f5a50'); img.set(x + 7, y - 1, '#5f5a50');
    }
    img.contour(); return img;
  },

  basketball_hoop: () => {
    const img = new Img(30, 60);
    const c = '#5f6668';
    img.rect(13, 14, 4, 46, c);
    img.rect(8, 56, 14, 4, shade(c, -0.2));
    img.rect(4, 2, 22, 14, '#9a9488');
    img.outline(4, 2, 22, 14, '#6a6458');
    img.outline(11, 7, 9, 7, '#7a4a44');
    img.rect(9, 15, 12, 2, '#a85a45');
    for (let i = 0; i < 5; i++) img.line(10 + i * 2, 17, 12 + i, 23, '#b6b0a2');
    img.contour(); return img;
  },

  air_pump: () => {
    const img = new Img(20, 28);
    const c = '#5a6a72';
    box(img, 2, 4, 16, 24, c);
    img.rect(4, 7, 12, 8, '#2f3a3d');
    img.rect(5, 8, 10, 6, '#5f7a74');
    img.ellipse(10, 20, 4, 4, shade(c, -0.25));
    img.rect(0, 12, 3, 8, '#3f4548');
    img.rect(6, 0, 8, 4, '#b9a14e');
    img.contour(); return img;
  }
};

/* ------------------------------------------------ Stage 20: prop library */

function legs(img, xs, y, h, c) { for (const x of xs) { img.rect(x, y, 2, h, c); img.vline(x + 1, y, h, shade(c, -0.3)); } }

function goods(img, x, y, w, seed, fill = 0.8, h = 6) {
  const cols = ['#b5563f', '#d0a84a', '#5b8a55', '#4f6fa0', '#c9c2a8', '#8a4f7a', '#d67f3a', '#6d8f9a'];
  for (let i = 0; i < w; i += 4) {
    if (hash(i, seed, 3) > fill) continue;
    const c = cols[Math.floor(hash(i, seed, 5) * cols.length)];
    const hh = h - Math.floor(hash(i, seed, 7) * 3);
    img.rect(x + i, y - hh, 3, hh, c);
    img.hline(x + i, y - hh, 3, shade(c, 0.25));
    img.set(x + i + 2, y - 1, shade(c, -0.3));
  }
}

function hole(img, cx, cy, rx, ry) {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
    if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 && img.inside(x, y)) img.data[img.idx(x, y) + 3] = 0;
  }
}

function wheel(img, cx, cy, r) {
  img.ellipse(cx, cy, r, r * 0.95, '#1d2024');
  img.ellipse(cx, cy, r * 0.45, r * 0.42, '#5a5f62');
  img.set(cx, cy, '#8a8f92');
}

function carBody(img, w, body, opts = {}) {
  const H = img.h;
  img.rect(4, H - 20, w - 8, 12, body);
  img.rect(Math.round(w * 0.26), H - 29, Math.round(w * 0.46), 10, shade(body, -0.05));
  img.hline(Math.round(w * 0.26), H - 29, Math.round(w * 0.46), shade(body, 0.22));
  img.hline(4, H - 20, w - 8, shade(body, 0.18));
  const glass = opts.glass || '#3d4a55';
  img.rect(Math.round(w * 0.29), H - 27, Math.round(w * 0.18), 7, glass);
  img.rect(Math.round(w * 0.50), H - 27, Math.round(w * 0.19), 7, glass);
  img.hline(Math.round(w * 0.29), H - 27, Math.round(w * 0.18), '#7d93a0');
  img.rect(2, H - 17, 4, 5, '#c9c08a'); img.rect(w - 6, H - 17, 4, 5, '#8a3a32');
  img.hline(4, H - 12, w - 8, shade(body, -0.3));
  img.vline(Math.round(w * 0.49), H - 19, 8, shade(body, -0.25));
  if (!opts.noWheels) { wheel(img, Math.round(w * 0.22), H - 6, 6); wheel(img, Math.round(w * 0.78), H - 6, 6); }
}

function flame(img, cx, by, h) {
  for (let y = 0; y < h; y++) {
    const t = y / h, wdt = Math.max(1, Math.round((1 - t) * 4 + Math.sin(y) * 1));
    img.hline(cx - wdt, by - y, wdt * 2, t < 0.4 ? '#f2c04a' : t < 0.75 ? '#e07a2e' : '#b5452a');
  }
}

Object.assign(PROPS, {
  /* ---- home ---- */
  stove: () => {
    const img = new Img(28, 32); const c = '#c9c3b0';
    box(img, 1, 6, 26, 26, c); img.rect(1, 2, 26, 5, shade(c, -0.1));
    img.rect(3, 4, 6, 2, '#2a2a2a'); img.rect(15, 4, 6, 2, '#2a2a2a');
    for (let i = 0; i < 4; i++) img.set(5 + i * 5, 8, '#3a3a3a');
    img.rect(4, 12, 20, 14, shade(c, -0.18)); img.rect(6, 14, 16, 8, '#3a3632'); img.hline(6, 13, 16, '#8a8a82');
    img.patches('#7a6a4a', 7, 0.6, 0.5, 5); img.contour(); return img;
  },
  kitchen_counter: () => {
    const img = new Img(48, 34); const c = '#7a5f45';
    box(img, 0, 12, 48, 22, c); img.rect(0, 10, 48, 3, '#a39b88'); img.hline(0, 10, 48, '#c4bca6');
    for (let x = 1; x < 48; x += 12) { img.outline(x + 1, 15, 10, 16, shade(c, -0.3)); img.set(x + 8, 22, '#c9b27a'); }
    img.rect(28, 10, 12, 2, '#6a7478');
    img.rect(6, 4, 4, 6, '#5b8a55'); img.rect(12, 6, 8, 4, '#3a3a3a'); img.hline(20, 7, 4, '#3a3a3a');
    img.patches('#4a3a2a', 8, 0.62, 0.4, 7); img.contour(); return img;
  },
  wardrobe: () => {
    const img = new Img(32, 50); const c = '#6b4f38';
    box(img, 1, 2, 30, 48, c, { grain: 0.04, seed: 3 }); img.rect(0, 0, 32, 3, shade(c, 0.1));
    img.vline(16, 4, 44, shade(c, -0.35)); img.set(14, 26, '#c9b27a'); img.set(18, 26, '#c9b27a');
    img.outline(3, 5, 11, 40, shade(c, -0.2)); img.outline(18, 5, 11, 40, shade(c, -0.2));
    img.contour(); return img;
  },
  wardrobe_open: () => {
    const img = new Img(40, 50); const c = '#6b4f38';
    box(img, 5, 2, 30, 48, c); img.rect(8, 5, 24, 42, '#2b241e');
    img.hline(8, 9, 24, '#8a8a82');
    for (let i = 0; i < 3; i++) img.line(11 + i * 7, 9, 13 + i * 7, 12, '#8a8a82');
    img.rect(22, 11, 6, 18, '#5a6a7a'); img.rect(10, 38, 12, 5, '#6a5a4a');
    img.rect(0, 4, 5, 44, shade(c, -0.1)); img.rect(35, 4, 5, 44, shade(c, -0.15));
    img.contour(); return img;
  },
  bookshelf: () => {
    const img = new Img(32, 48); const c = '#5e4632';
    box(img, 0, 0, 32, 48, c);
    for (let r = 0; r < 4; r++) {
      const y = 11 + r * 11; img.rect(2, y, 28, 2, shade(c, 0.15)); img.rect(2, y - 9, 28, 9, '#2e241c');
      for (let x = 3; x < 29;) {
        const w = 2 + Math.floor(hash(x, r, 9) * 3), h = 6 + Math.floor(hash(x, r, 11) * 3);
        if (hash(x, r, 13) > 0.18) {
          const bc = ['#7a3a32', '#3a5a6a', '#6a6a3a', '#4a3a5a', '#8a7a5a', '#3a5a3a'][Math.floor(hash(x, r, 5) * 6)];
          img.rect(x, y - h, w, h, bc); img.set(x, y - h, shade(bc, 0.3));
        }
        x += w;
      }
    }
    img.contour(); return img;
  },
  dresser: () => {
    const img = new Img(34, 40); const c = '#735640';
    box(img, 0, 14, 34, 26, c);
    for (let i = 0; i < 3; i++) { img.outline(2, 16 + i * 8, 30, 7, shade(c, -0.28)); img.rect(15, 19 + i * 8, 4, 1, '#c9b27a'); }
    img.rect(6, 0, 16, 13, '#6a7a82'); img.outline(5, 0, 18, 14, '#4a3a2a'); img.line(8, 3, 12, 7, '#aabbc2');
    img.rect(26, 8, 4, 6, '#b5563f'); img.contour(); return img;
  },
  nightstand: () => {
    const img = new Img(18, 32); const c = '#6b4f38';
    box(img, 1, 16, 16, 16, c); img.outline(3, 19, 12, 5, shade(c, -0.3));
    img.rect(8, 8, 2, 8, '#8a8a82'); img.rect(4, 3, 10, 6, '#d6c9a0'); img.hline(4, 3, 10, '#efe3bc');
    img.contour(); return img;
  },
  floor_lamp: () => {
    const img = new Img(16, 48);
    img.rect(7, 12, 2, 34, '#5a5a56'); img.rect(3, 45, 10, 3, '#3a3a38');
    img.rect(2, 2, 12, 10, '#cdbf94'); img.hline(1, 11, 14, '#a8996e'); img.hline(3, 2, 10, '#e6dab2');
    img.contour(); return img;
  },
  picture_frame: () => {
    const img = new Img(22, 18);
    img.rect(0, 0, 22, 18, '#5a4030'); img.rect(2, 2, 18, 14, '#6f8a9a');
    img.rect(2, 10, 18, 6, '#5a7a4a'); img.ellipse(14, 6, 2, 2, '#e6d59a'); img.line(2, 11, 9, 7, '#4a5a3a'); img.line(9, 7, 14, 11, '#4a5a3a');
    img.patches('#3a3a30', 6, 0.6, 0.6, 3); img.contour(); return img;
  },
  wall_clock: () => {
    const img = new Img(14, 14);
    img.ellipse(7, 7, 6.5, 6.5, '#3a3a38'); img.ellipse(7, 7, 5, 5, '#d8d2bc');
    img.vline(7, 3, 4, '#222'); img.hline(7, 7, 3, '#222'); img.contour(); return img;
  },
  curtain: () => {
    const img = new Img(34, 40);
    img.hline(0, 1, 34, '#6a6a62'); img.hline(0, 2, 34, '#4a4a44');
    for (const [x0, w] of [[1, 11], [22, 11]]) {
      for (let x = 0; x < w; x++) {
        const t = x % 4; const c = t === 0 ? '#8a5a4a' : t === 3 ? '#5e3a30' : '#7a4c3e';
        img.vline(x0 + x, 3, 36 - Math.round(Math.abs(x - w / 2) * 0.4), c);
      }
    }
    img.patches('#4a3a30', 7, 0.6, 0.45, 9); img.contour(); return img;
  },
  bathtub: () => {
    const img = new Img(50, 24); const c = '#d2cfc2';
    img.rect(1, 6, 48, 14, c); img.hline(1, 6, 48, '#eae6d8'); img.rect(3, 8, 44, 4, shade(c, -0.2));
    legs(img, [5, 42], 20, 4, '#8a8a82'); img.rect(44, 0, 2, 7, '#8a8f92'); img.rect(42, 0, 5, 2, '#8a8f92');
    img.patches('#8a7a5a', 7, 0.66, 0.5, 13); img.contour(); return img;
  },
  toilet: () => {
    const img = new Img(20, 26); const c = '#d2cfc2';
    img.rect(12, 0, 7, 14, c); img.hline(12, 0, 7, '#eae6d8');
    img.rect(2, 12, 16, 5, c); img.rect(5, 17, 9, 9, shade(c, -0.08)); img.hline(2, 12, 16, '#eae6d8');
    img.patches('#8a7a5a', 5, 0.7, 0.5, 17); img.contour(); return img;
  },
  washing_machine: () => {
    const img = new Img(26, 30); const c = '#cbc8bb';
    box(img, 0, 0, 26, 30, c); img.rect(1, 1, 24, 5, shade(c, -0.12));
    img.ellipse(13, 17, 8, 8, '#4a4f52'); img.ellipse(13, 17, 6, 6, '#6f8a9a'); img.set(20, 3, '#c45a4a');
    img.patches('#7a6a4a', 7, 0.66, 0.5, 19); img.contour(); return img;
  },
  suitcases: () => {
    const img = new Img(32, 24);
    box(img, 1, 6, 16, 18, '#6a4a3a'); img.rect(6, 3, 6, 3, '#3a2a22'); img.hline(1, 14, 16, '#4a3226');
    box(img, 16, 10, 15, 14, '#3f5566'); img.rect(20, 7, 6, 3, '#2a3642'); img.vline(23, 10, 14, '#2e3e4a');
    img.contour(); return img;
  },
  clothes_pile: () => {
    const img = new Img(28, 10);
    img.blob(1, 4, 12, 6, '#5a6a7a'); img.blob(9, 2, 12, 8, '#8a5a4a'); img.blob(17, 5, 10, 5, '#6a6a4a');
    img.grain(0.08, 3); img.contour(); return img;
  },
  trash_bags: () => {
    const img = new Img(32, 20);
    for (const [x, y, rx, ry] of [[9, 12, 8, 7], [21, 13, 9, 6.5], [15, 8, 7, 6]]) { img.ellipse(x, y, rx, ry, '#26292b'); img.ellipse(x - 2, y - 3, 2, 1.5, '#4a4f52'); }
    img.line(14, 2, 16, 4, '#1a1c1e'); img.rect(26, 16, 3, 2, '#c9c2a8'); img.contour(); return img;
  },
  cardboard_box: () => {
    const img = new Img(24, 18); const c = '#9a7a52';
    box(img, 1, 2, 22, 16, c); img.vline(12, 2, 16, shade(c, -0.2)); img.rect(8, 2, 8, 3, '#b9a47a');
    img.patches('#6a5236', 6, 0.66, 0.5, 23); img.contour(); return img;
  },
  box_open: () => {
    const img = new Img(28, 22); const c = '#9a7a52';
    box(img, 3, 8, 22, 14, c); img.line(3, 8, 0, 2, shade(c, 0.1)); img.line(25, 8, 27, 3, shade(c, -0.1));
    img.rect(6, 5, 5, 4, '#6a707a'); img.rect(13, 6, 6, 3, '#c9c2a8'); img.rect(0, 20, 5, 2, '#c9c2a8');
    img.contour(); return img;
  },
  papers: () => {
    const img = new Img(36, 6);
    for (let i = 0; i < 6; i++) { const x = Math.floor(hash(i, 1, 2) * 30); img.rect(x, 3 + (i % 3), 6, 1, i % 2 ? '#d8d2bc' : '#c9c2a8'); img.set(x + 1, 3 + (i % 3), '#6a6a62'); }
    img.rect(2, 4, 8, 2, '#b9b19a'); return img;
  },
  bottles: () => {
    const img = new Img(20, 12);
    for (const [x, c, h] of [[2, '#5a7a4a', 9], [6, '#6a4a2a', 7], [11, '#8a9a9a', 10]]) { img.rect(x, 12 - h, 3, h, c); img.rect(x + 1, 12 - h - 2, 1, 2, c); img.set(x, 12 - h + 1, shade(c, 0.4)); }
    img.rect(15, 10, 4, 2, '#8a8f92'); img.contour(); return img;
  },
  radio: () => {
    const img = new Img(20, 18); const c = '#6a5a44';
    box(img, 0, 6, 20, 12, c); img.rect(2, 8, 9, 8, '#3a3632');
    for (let y = 9; y < 16; y += 2) img.hline(2, y, 9, '#4f4a42');
    img.rect(13, 9, 5, 2, '#c9b27a'); img.set(15, 14, '#8a8a82'); img.line(15, 6, 19, 0, '#8a8f92'); img.contour(); return img;
  },
  computer_desk: () => {
    const img = new Img(42, 36); const c = '#6a6258';
    img.rect(0, 18, 42, 3, c); img.hline(0, 18, 42, shade(c, 0.2)); legs(img, [1, 38], 21, 15, shade(c, -0.2));
    img.rect(26, 21, 12, 14, shade(c, -0.1)); img.outline(27, 23, 10, 5, shade(c, -0.3));
    box(img, 6, 2, 18, 15, '#b9b4a2'); img.rect(8, 4, 14, 10, '#1f2a2a'); img.rect(12, 16, 6, 2, '#8a867a');
    img.rect(4, 16, 14, 2, '#3a3a38'); img.rect(30, 12, 6, 6, '#c9c2a8'); img.contour(); return img;
  },
  dining_set: () => {
    const img = new Img(56, 32); const c = '#6d5038';
    img.rect(8, 14, 40, 3, c); img.hline(8, 14, 40, shade(c, 0.22)); legs(img, [10, 44], 17, 15, shade(c, -0.2));
    img.rect(8, 12, 40, 2, '#c9c2a8');
    for (const x of [13, 25, 37]) { img.ellipse(x + 2, 11, 4, 1.5, '#e6e0cc'); img.ellipse(x + 2, 11, 2, 0.8, '#a8563f'); }
    img.rect(31, 5, 2, 6, '#e6dcb4'); img.set(31, 4, '#f2c04a');
    for (const x of [0, 50]) { img.rect(x + 1, 6, 2, 26, '#5a4030'); img.rect(x, 18, 6, 2, '#5a4030'); img.vline(x + 5, 20, 12, '#5a4030'); }
    img.contour(); return img;
  },
  bunk_bed: () => {
    const img = new Img(52, 46); const f = '#5a5f62';
    for (const x of [0, 49]) img.rect(x, 0, 3, 46, f);
    for (const y of [14, 36]) { img.rect(3, y, 46, 5, '#7c7364'); img.hline(3, y, 46, '#938a78'); img.rect(5, y - 3, 12, 4, '#a8a08c'); img.rect(18, y - 1, 30, 2, '#4f5a4c'); img.rect(3, y + 5, 46, 2, f); }
    img.patches('#6a6156', 8, 0.6, 0.4, 29); img.contour(); return img;
  },
  armchair: () => {
    const img = new Img(28, 28); const c = '#6a4a3e';
    img.rect(2, 2, 20, 16, c); img.rect(0, 12, 28, 10, shade(c, -0.05)); img.rect(0, 10, 5, 8, shade(c, 0.1)); img.rect(23, 10, 5, 8, shade(c, 0.1));
    img.hline(2, 2, 20, shade(c, 0.2)); legs(img, [2, 24], 22, 6, '#3a2a22'); img.patches('#4a3a30', 6, 0.6, 0.5, 31); img.contour(); return img;
  },
  potted_plant: () => {
    const img = new Img(18, 30);
    img.rect(4, 20, 10, 10, '#8a5a3a'); img.hline(3, 20, 12, '#a06a44');
    for (let i = 0; i < 7; i++) img.line(9, 20, 2 + i * 2, 4 + Math.floor(hash(i, 3, 3) * 8), i % 2 ? '#6a6a3a' : '#7a6a3a');
    img.contour(); return img;
  },
  broken_furniture: () => {
    const img = new Img(36, 16);
    img.line(0, 15, 14, 6, '#6a4c36'); img.line(1, 15, 15, 6, '#6a4c36');
    img.rect(10, 9, 18, 3, '#735640'); img.line(26, 12, 34, 15, '#5a4030'); img.rect(18, 12, 2, 4, '#5a4030');
    img.rect(3, 12, 8, 4, '#7a6a5a'); img.contour(); return img;
  },
  plank_barricade: () => {
    const img = new Img(34, 44);
    for (const [y, a] of [[6, 0.15], [16, -0.2], [27, 0.1], [36, -0.1]]) {
      const c = shade('#7a5a3c', a); img.rect(0, y, 34, 5, c); img.hline(0, y, 34, shade(c, 0.2)); img.hline(0, y + 4, 34, shade(c, -0.3));
      img.set(3, y + 2, '#8a8f92'); img.set(30, y + 2, '#8a8f92');
    }
    img.line(2, 2, 32, 42, '#6a4c36'); img.line(3, 2, 33, 42, '#5a4030'); img.contour(); return img;
  },
  furniture_pile: () => {
    const img = new Img(54, 44);
    img.rect(2, 20, 16, 24, '#6a4a3e'); img.rect(4, 22, 12, 20, '#5a3e34');
    img.rect(14, 26, 30, 4, '#6d5038'); legs(img, [16, 40], 30, 14, '#5a4030');
    box(img, 30, 4, 20, 22, '#735640'); img.outline(32, 7, 16, 6, '#4a3a2a'); img.outline(32, 15, 16, 6, '#4a3a2a');
    img.line(20, 26, 30, 8, '#5a4030'); img.line(21, 26, 31, 8, '#5a4030'); img.rect(44, 36, 10, 8, '#9a7a52');
    img.contour(); return img;
  },
  candles: () => {
    const img = new Img(14, 12);
    for (const [x, h] of [[2, 6], [6, 8], [10, 5]]) { img.rect(x, 12 - h, 2, h, '#e6dcb4'); img.set(x, 12 - h - 1, '#f2c04a'); }
    img.hline(0, 11, 14, '#b9ae8a'); return img;
  },
  bedroll: () => {
    const img = new Img(40, 10);
    img.rect(2, 4, 36, 6, '#5a6a4a'); img.hline(2, 4, 36, '#6f8058'); img.ellipse(36, 5, 4, 4, '#4a5a3c'); img.rect(3, 2, 9, 3, '#8a7a5a');
    img.contour(); return img;
  },
  water_jugs: () => {
    const img = new Img(24, 20);
    for (const x of [1, 12]) { img.rect(x, 4, 10, 16, '#6f9ab0'); img.rect(x + 3, 1, 4, 3, '#4f6f80'); img.vline(x + 1, 5, 12, '#a6c8d6'); }
    img.contour(); return img;
  },

  /* ---- commerce ---- */
  store_shelf: () => {
    const img = new Img(46, 46); const c = '#8a8f8a';
    img.rect(0, 0, 3, 46, c); img.rect(43, 0, 3, 46, shade(c, -0.2)); img.rect(3, 1, 40, 44, '#4a4f4c');
    for (let r = 0; r < 4; r++) { const y = 12 + r * 11; img.rect(2, y, 42, 2, shade(c, 0.15)); goods(img, 4, y, 38, r * 7 + 1, 0.9, 8); }
    img.contour(); return img;
  },
  store_shelf_empty: () => {
    const img = new Img(46, 46); const c = '#7d827d';
    img.rect(0, 0, 3, 46, c); img.rect(43, 0, 3, 46, shade(c, -0.2)); img.rect(3, 1, 40, 44, '#3e4240');
    for (let r = 0; r < 4; r++) { const y = 12 + r * 11; img.rect(2, y, 42, 2, shade(c, 0.1)); goods(img, 4, y, 38, r * 13 + 5, 0.16, 7); }
    img.line(28, 23, 34, 30, shade(c, 0.1)); img.patches('#5a4a3a', 8, 0.6, 0.4, 37); img.contour(); return img;
  },
  checkout: () => {
    const img = new Img(46, 30); const c = '#6a6f6c';
    box(img, 0, 12, 46, 18, c); img.rect(0, 10, 30, 3, '#2d2f30'); img.hline(0, 10, 30, '#4a4d4f');
    box(img, 31, 3, 13, 9, '#3a3d40'); img.rect(33, 5, 9, 3, '#5a7a6a'); img.rect(34, 0, 5, 3, '#2a2d30');
    img.rect(4, 16, 22, 3, '#b5563f'); img.contour(); return img;
  },
  drink_cooler: () => {
    const img = new Img(30, 50); const c = '#b9b4a2';
    box(img, 0, 0, 30, 50, c); img.rect(0, 0, 30, 6, '#8a3a32'); img.rect(3, 8, 24, 38, '#28343a');
    for (let r = 0; r < 4; r++) { img.hline(3, 17 + r * 9, 24, '#6a7478'); goods(img, 5, 17 + r * 9, 20, r * 5 + 3, 0.6, 7); }
    img.vline(3, 8, 38, '#8fa6ac'); img.contour(); return img;
  },
  freezer: () => {
    const img = new Img(46, 26); const c = '#c9c6ba';
    box(img, 0, 4, 46, 22, c); img.rect(2, 0, 42, 5, '#8fa6ac'); img.hline(2, 0, 42, '#c2d4d8');
    img.rect(3, 8, 40, 3, shade(c, -0.18)); img.rect(38, 14, 5, 2, '#5a7a8a'); img.patches('#8a7a5a', 8, 0.64, 0.5, 41); img.contour(); return img;
  },
  pallet_goods: () => {
    const img = new Img(34, 32);
    img.rect(0, 26, 34, 6, '#6d5238'); img.rect(0, 30, 4, 2, '#4a3623'); img.rect(15, 30, 4, 2, '#4a3623'); img.rect(30, 30, 4, 2, '#4a3623');
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { const c = shade('#9a7a52', (hash(r, k, 3) - 0.5) * 0.2); box(img, 1 + k * 11, 2 + r * 8, 10, 8, c); }
    for (let y = 2; y < 26; y += 3) img.hline(1, y, 32, [210, 220, 225, 50]);
    img.contour(); return img;
  },
  magazine_rack: () => {
    const img = new Img(22, 32);
    img.rect(1, 0, 2, 32, '#6a6f6c'); img.rect(19, 0, 2, 32, '#6a6f6c');
    for (let r = 0; r < 3; r++) { img.hline(1, 9 + r * 9, 20, '#8a8f8a'); for (let k = 0; k < 3; k++) img.rect(4 + k * 5, 2 + r * 9, 4, 7, ['#b5563f', '#4f6fa0', '#d0a84a', '#5b8a55'][(r + k) % 4]); }
    img.contour(); return img;
  },
  atm: () => {
    const img = new Img(22, 38); const c = '#5a6068';
    box(img, 0, 0, 22, 38, c); img.rect(3, 4, 16, 10, '#1f2a2a'); img.rect(4, 17, 10, 8, '#8a8f92');
    for (let i = 0; i < 9; i++) img.set(5 + (i % 3) * 3, 18 + Math.floor(i / 3) * 2, '#3a3d40');
    img.rect(4, 28, 14, 2, '#1a1c1e'); img.contour(); return img;
  },

  /* ---- medical ---- */
  gurney: () => {
    const img = new Img(52, 22);
    img.rect(2, 6, 48, 4, '#b9c0bc'); img.hline(2, 6, 48, '#d8dedb'); img.rect(4, 3, 12, 3, '#d8d2bc');
    img.rect(2, 10, 48, 2, '#8a8f92'); legs(img, [6, 44], 12, 7, '#8a8f92'); img.line(8, 12, 44, 19, '#6a6f72');
    for (const x of [7, 45]) img.ellipse(x, 20, 2, 2, '#2a2d30'); img.patches('#8a7a5a', 7, 0.7, 0.4, 43); img.contour(); return img;
  },
  wheelchair: () => {
    const img = new Img(26, 26);
    img.ellipse(10, 17, 8.5, 8.5, '#3a3d40'); hole(img, 10, 17, 7, 7); img.ellipse(10, 17, 2, 2, '#8a8f92');
    img.rect(6, 2, 2, 14, '#8a8f92'); img.rect(6, 10, 14, 3, '#3a4a5a'); img.rect(18, 13, 2, 9, '#8a8f92'); img.ellipse(21, 23, 2, 2, '#2a2d30');
    img.contour(); return img;
  },
  privacy_curtain: () => {
    const img = new Img(44, 48);
    img.hline(0, 0, 44, '#8a8f92'); img.hline(0, 1, 44, '#5a5f62');
    for (let x = 1; x < 43; x++) { const t = x % 5; img.vline(x, 2, 44, t === 0 ? '#7fa29a' : t === 4 ? '#557a70' : '#6a9088'); }
    img.patches('#8a8a6a', 9, 0.64, 0.4, 47); img.contour(); return img;
  },
  med_cart: () => {
    const img = new Img(24, 30); const c = '#a8463a';
    box(img, 1, 4, 22, 22, c); for (let i = 0; i < 4; i++) { img.hline(2, 9 + i * 5, 20, shade(c, -0.3)); img.rect(10, 7 + i * 5, 4, 1, '#d8d2bc'); }
    img.rect(3, 0, 14, 4, '#d8d2bc'); img.rect(5, 1, 4, 2, '#5a8a6a'); for (const x of [3, 20]) img.ellipse(x, 28, 2, 2, '#2a2d30'); img.contour(); return img;
  },
  biohazard_bin: () => {
    const img = new Img(16, 20);
    img.rect(1, 3, 14, 17, '#c9a23a'); img.rect(0, 1, 16, 3, '#a8852a'); img.ellipse(8, 11, 3, 3, '#2a2724'); img.ellipse(8, 11, 1.5, 1.5, '#c9a23a');
    img.contour(); return img;
  },
  monitor_stand: () => {
    const img = new Img(22, 44);
    img.rect(10, 16, 2, 26, '#8a8f92'); img.rect(4, 42, 14, 2, '#5a5f62');
    box(img, 2, 2, 18, 14, '#b9b4a2'); img.rect(4, 4, 14, 9, '#0f1a18');
    for (let x = 0; x < 13; x++) img.set(5 + x, 8 + Math.round(Math.sin(x * 1.3) * (x % 5 === 2 ? 3 : 0.5)), '#4ac46a');
    img.contour(); return img;
  },

  /* ---- office / civic ---- */
  filing_cabinet: () => {
    const img = new Img(20, 38); const c = '#6a7068';
    box(img, 0, 0, 20, 38, c); for (let i = 0; i < 4; i++) { img.outline(2, 2 + i * 9, 16, 8, shade(c, -0.28)); img.rect(8, 5 + i * 9, 4, 1, '#c9c2a8'); }
    rust(img, [0, 0, 20, 38], 53, 0.4); img.contour(); return img;
  },
  office_desk: () => {
    const img = new Img(46, 32); const c = '#6d5a44';
    img.rect(0, 12, 46, 4, c); img.hline(0, 12, 46, shade(c, 0.22)); box(img, 30, 16, 14, 16, shade(c, -0.1));
    img.outline(32, 18, 10, 5, shade(c, -0.35)); img.outline(32, 25, 10, 5, shade(c, -0.35)); legs(img, [2], 16, 16, shade(c, -0.25));
    img.rect(4, 9, 10, 3, '#d8d2bc'); img.rect(6, 7, 10, 2, '#c9c2a8'); img.rect(22, 3, 2, 9, '#5a5a56'); img.rect(20, 1, 8, 4, '#3f6b5a');
    img.contour(); return img;
  },
  jail_bars: () => {
    const img = new Img(34, 64);
    img.rect(0, 0, 34, 3, '#4a4f52'); img.rect(0, 61, 34, 3, '#4a4f52'); img.rect(0, 30, 34, 2, '#4a4f52');
    for (let x = 2; x < 34; x += 5) { img.vline(x, 3, 58, '#6a7074'); img.vline(x + 1, 3, 58, '#3a3f42'); }
    rust(img, [0, 0, 34, 64], 59, 0.5); return img;
  },
  gun_rack: () => {
    const img = new Img(30, 30); const c = '#5a4030';
    img.rect(0, 0, 30, 30, c); img.outline(0, 0, 30, 30, shade(c, -0.3));
    for (let x = 4; x < 28; x += 7) { img.rect(x, 4, 3, 3, shade(c, -0.4)); img.rect(x, 24, 3, 3, shade(c, -0.4)); }
    img.line(18, 6, 19, 25, '#2a2a2a'); img.line(19, 6, 20, 25, '#3a3a3a'); img.contour(); return img;
  },
  corkboard: () => {
    const img = new Img(34, 24);
    img.rect(0, 0, 34, 24, '#5a4030'); img.rect(2, 2, 30, 20, '#a07a4a'); img.grain(0.1, 61, [2, 2, 30, 20]);
    const notes = [[4, 4, '#e6e0cc'], [13, 6, '#d8c46a'], [22, 3, '#e6e0cc'], [7, 13, '#c9c2a8'], [20, 13, '#b9c9d8']];
    for (const [x, y, c] of notes) { img.rect(x, y, 7, 6, c); img.set(x + 3, y, '#c45a4a'); img.hline(x + 1, y + 2, 5, '#6a6a62'); }
    img.line(8, 7, 24, 16, '#b5453a'); img.line(16, 9, 10, 16, '#b5453a'); img.contour(); return img;
  },
  cafeteria_table: () => {
    const img = new Img(58, 22); const c = '#8a8f8a';
    img.rect(4, 6, 50, 3, '#b9b19a'); img.hline(4, 6, 50, '#d8d0b8'); legs(img, [8, 48], 9, 13, c);
    img.rect(0, 13, 58, 2, '#5a6068'); legs(img, [2, 54], 15, 7, c); img.rect(14, 3, 6, 3, '#c9c2a8'); img.rect(36, 4, 5, 2, '#b5563f');
    img.contour(); return img;
  },
  flag_pole: () => {
    const img = new Img(26, 84);
    img.rect(1, 0, 2, 84, '#8a8f92'); img.rect(0, 80, 5, 4, '#5a5f62');
    for (let y = 0; y < 14; y++) for (let x = 0; x < 20; x++) img.set(3 + x, 3 + y + Math.round(Math.sin(x * 0.4) * 1), y < 5 ? '#3f5566' : y % 4 < 2 ? '#8a3a32' : '#c9c2a8');
    img.patches('#4a4a44', 6, 0.6, 0.5, 67, [3, 3, 20, 16]); img.contour(); return img;
  },

  /* ---- garage / industrial ---- */
  workbench: () => {
    const img = new Img(50, 44); const c = '#6d5238';
    img.rect(0, 0, 50, 16, '#5a5040'); for (let y = 2; y < 16; y += 3) for (let x = 2; x < 50; x += 3) img.set(x, y, '#3a3428');
    img.rect(6, 3, 2, 9, '#8a8f92'); img.rect(4, 3, 6, 2, '#8a8f92'); img.rect(16, 4, 10, 2, '#b5563f'); img.rect(24, 3, 2, 6, '#6a4c36');
    img.ellipse(36, 8, 4, 4, '#3a3d40'); img.ellipse(36, 8, 2, 2, '#5a5040');
    img.rect(0, 26, 50, 4, c); img.hline(0, 26, 50, shade(c, 0.22)); legs(img, [2, 46], 30, 14, shade(c, -0.25));
    img.rect(38, 20, 8, 6, '#4a5a6a'); img.rect(40, 22, 4, 2, '#8a8f92'); img.rect(8, 23, 10, 3, '#8a8f92'); img.rect(14, 36, 26, 3, shade(c, -0.1));
    img.rect(18, 32, 8, 4, '#b5563f'); img.contour(); return img;
  },
  car_frame: () => {
    const img = new Img(78, 38); const body = '#6a7a8a';
    carBody(img, 78, body, { noWheels: true, glass: '#1f2a30' });
    img.rect(56, 4, 18, 3, shade(body, 0.1)); img.line(56, 7, 70, 16, shade(body, -0.2));
    img.rect(58, 12, 14, 6, '#2a2d30'); rust(img, [2, 8, 74, 24], 71, 0.9);
    for (const x of [14, 58]) { img.rect(x, 30, 8, 8, '#5a5f62'); img.rect(x - 1, 29, 10, 2, '#8a8f92'); }
    img.contour(); return img;
  },
  tire_rack: () => {
    const img = new Img(36, 44);
    img.rect(0, 0, 2, 44, '#5a5f62'); img.rect(34, 0, 2, 44, '#5a5f62');
    for (let r = 0; r < 3; r++) { img.hline(0, 14 + r * 14, 36, '#8a8f92'); for (let k = 0; k < 3; k++) { img.ellipse(7 + k * 11, 8 + r * 14, 5, 6, '#1d2024'); img.ellipse(7 + k * 11, 8 + r * 14, 2, 2.4, '#3a3d40'); } }
    img.contour(); return img;
  },
  gas_cylinders: () => {
    const img = new Img(22, 36);
    for (const [x, c] of [[1, '#3f6b5a'], [11, '#8a3a32']]) { img.rect(x, 6, 9, 30, c); img.ellipse(x + 4.5, 6, 4.5, 2.5, shade(c, 0.2)); img.rect(x + 3, 0, 3, 5, '#8a8f92'); img.vline(x + 1, 7, 26, shade(c, 0.25)); }
    img.hline(0, 16, 22, '#2a2a2a'); img.contour(); return img;
  },
  compressor: () => {
    const img = new Img(32, 28); const c = '#a8463a';
    img.ellipse(16, 18, 14, 7, c); img.rect(2, 12, 28, 10, c); img.hline(4, 12, 24, shade(c, 0.25));
    box(img, 8, 2, 14, 10, '#3a3d40'); img.ellipse(26, 6, 4, 4, '#5a5f62'); for (const x of [6, 26]) img.ellipse(x, 25, 3, 3, '#1d2024');
    rust(img, [2, 2, 28, 22], 79, 0.6); img.contour(); return img;
  },
  forklift: () => {
    const img = new Img(52, 46); const c = '#c9a23a';
    box(img, 12, 20, 30, 18, c); img.rect(16, 4, 2, 18, '#3a3a3a'); img.rect(36, 4, 2, 18, '#3a3a3a'); img.rect(16, 3, 22, 2, '#3a3a3a');
    img.rect(6, 0, 3, 40, '#5a5f62'); img.rect(0, 38, 12, 2, '#8a8f92'); img.rect(0, 30, 10, 2, '#8a8f92');
    wheel(img, 18, 39, 6); wheel(img, 38, 40, 5); img.rect(40, 14, 8, 8, '#3a3d40'); rust(img, [12, 20, 30, 18], 83, 0.6);
    img.contour(); return img;
  },
  pallet_rack: () => {
    const img = new Img(62, 66);
    for (const x of [0, 30, 58]) { img.rect(x, 0, 4, 66, '#3f6b8a'); img.vline(x + 1, 0, 66, '#5a88a8'); }
    for (const y of [20, 42, 62]) img.rect(0, y, 62, 3, '#c9742a');
    for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) {
      if (hash(r, k, 5) < 0.25) continue;
      const bx = 5 + k * 29, by = r * 22;
      img.rect(bx, by + 17, 22, 3, '#6d5238');
      for (let q = 0; q < 2; q++) box(img, bx + 1 + q * 11, by + 6, 10, 11, shade('#9a7a52', (hash(r, k + q, 7) - 0.5) * 0.25));
    }
    img.contour(); return img;
  },
  generator: () => {
    const img = new Img(38, 28); const c = '#c9742a';
    img.rect(0, 4, 38, 2, '#2a2a2a'); img.rect(0, 26, 38, 2, '#2a2a2a'); img.vline(0, 4, 24, '#2a2a2a'); img.vline(37, 4, 24, '#2a2a2a');
    box(img, 3, 8, 20, 16, c); box(img, 24, 10, 11, 14, '#3a3d40'); img.rect(6, 6, 10, 3, shade(c, -0.2));
    for (let y = 11; y < 22; y += 2) img.hline(26, y, 7, '#5a5f62'); img.rect(6, 14, 6, 3, '#1f2a2a'); img.set(14, 15, '#4ac46a');
    rust(img, [3, 8, 20, 16], 89, 0.5); img.contour(); return img;
  },
  cable_spool: () => {
    const img = new Img(28, 28);
    img.ellipse(14, 14, 13, 13, '#7a5a3c'); img.ellipse(14, 14, 10, 10, '#3a3f34'); img.ellipse(14, 14, 4, 4, '#5a4030');
    for (let a = 0; a < 6; a++) img.line(14, 14, 14 + Math.round(Math.cos(a) * 9), 14 + Math.round(Math.sin(a) * 9), '#2a3028');
    img.contour(); return img;
  },
  hazard_barrel: () => {
    const img = new Img(20, 28); const c = '#c9a23a';
    img.rect(2, 2, 16, 25, c); img.ellipse(10, 3, 8, 2.4, shade(c, 0.24));
    for (const y of [8, 19]) img.hline(2, y, 16, shade(c, -0.35));
    img.ellipse(10, 14, 3.5, 3.5, '#2a2724'); img.ellipse(10, 14, 1.5, 1.5, c); rust(img, [2, 2, 16, 25], 97, 0.6);
    img.contour(); return img;
  },
  electrical_panel: () => {
    const img = new Img(26, 36); const c = '#7a8078';
    box(img, 0, 0, 26, 30, c); img.rect(3, 3, 20, 24, shade(c, -0.18));
    for (let i = 0; i < 8; i++) img.rect(5 + (i % 4) * 4, 6 + Math.floor(i / 4) * 8, 2, 5, i === 5 ? '#c45a4a' : '#2a2d30');
    img.rect(8, 20, 10, 3, '#c9a23a'); img.vline(8, 30, 6, '#2a2a2a'); img.vline(12, 30, 6, '#6a4a2a'); img.vline(16, 30, 6, '#2d3a44');
    rust(img, [0, 0, 26, 30], 101, 0.5); img.contour(); return img;
  },
  pipe_vertical: () => {
    const img = new Img(18, 64);
    for (const [x, c] of [[2, '#6a7074'], [10, '#7a5a44']]) { img.rect(x, 0, 5, 64, c); img.vline(x + 1, 0, 64, shade(c, 0.25)); img.vline(x + 4, 0, 64, shade(c, -0.3)); for (let y = 8; y < 64; y += 20) img.rect(x - 1, y, 7, 3, shade(c, -0.15)); }
    img.ellipse(12, 30, 4, 4, '#a8463a'); img.ellipse(12, 30, 2, 2, '#6a2a22'); rust(img, [0, 0, 18, 64], 103, 0.6); return img;
  },
  fire_truck: () => {
    const img = new Img(116, 52); const c = '#9a3a30';
    img.rect(4, 18, 108, 24, c); img.rect(86, 6, 26, 14, c); img.rect(90, 8, 18, 8, '#2d3a44'); img.hline(86, 6, 26, shade(c, 0.25));
    for (let x = 8; x < 82; x += 18) img.outline(x, 22, 16, 14, shade(c, -0.3));
    img.rect(8, 12, 74, 4, '#8a8f92'); for (let x = 10; x < 80; x += 6) img.vline(x, 12, 4, '#5a5f62');
    img.rect(88, 2, 10, 4, '#c45a4a'); img.rect(100, 2, 8, 4, '#4a6fa0'); img.hline(4, 34, 108, '#c9c2a8');
    wheel(img, 20, 44, 7); wheel(img, 40, 44, 7); wheel(img, 96, 44, 7); rust(img, [4, 6, 108, 36], 107, 0.9);
    img.contour(); return img;
  },
  hose_reel: () => {
    const img = new Img(26, 28);
    img.rect(2, 26, 22, 2, '#5a5f62'); img.rect(3, 6, 2, 20, '#8a8f92'); img.rect(21, 6, 2, 20, '#8a8f92');
    img.ellipse(13, 14, 10, 10, '#b5453a'); img.ellipse(13, 14, 8, 8, '#8a3a32'); img.ellipse(13, 14, 3, 3, '#5a5f62');
    for (let r = 4; r < 10; r += 2) img.ellipseOutline(13, 14, r, r, '#c9563f'); img.contour(); return img;
  },
  gear_rack: () => {
    const img = new Img(44, 48);
    img.rect(0, 0, 44, 3, '#5a5f62'); img.rect(0, 44, 44, 4, '#5a5f62');
    for (let k = 0; k < 3; k++) {
      const x = 2 + k * 14;
      img.rect(x, 12, 12, 22, '#8a6a3a'); img.hline(x, 22, 12, '#c9c24a'); img.hline(x, 28, 12, '#c9c24a');
      img.ellipse(x + 6, 7, 6, 4, k === 1 ? '#c9c2a8' : '#2a2724'); img.rect(x + 2, 36, 8, 8, '#2a2724');
    }
    img.contour(); return img;
  },

  /* ---- church ---- */
  pew: () => {
    const img = new Img(58, 22); const c = '#5e4230';
    img.rect(0, 0, 58, 10, c); img.hline(0, 0, 58, shade(c, 0.22)); img.rect(0, 11, 58, 3, shade(c, 0.1));
    legs(img, [2, 28, 54], 14, 8, shade(c, -0.25)); img.grain(0.05, 109); img.contour(); return img;
  },
  altar: () => {
    const img = new Img(42, 44); const c = '#6d5038';
    box(img, 2, 22, 38, 22, c); img.rect(0, 20, 42, 4, '#d8d2bc'); img.rect(14, 24, 14, 20, '#8a3a32');
    img.rect(20, 2, 2, 18, '#c9b27a'); img.rect(16, 7, 10, 2, '#c9b27a');
    for (const x of [6, 34]) { img.rect(x, 12, 2, 8, '#e6dcb4'); img.set(x, 11, '#f2c04a'); }
    img.contour(); return img;
  },
  gravestone: () => {
    const img = new Img(18, 24); const c = '#7a7a74';
    img.rect(2, 6, 14, 18, c); img.ellipse(9, 6, 7, 5, c); img.hline(5, 10, 8, shade(c, -0.3)); img.hline(5, 13, 8, shade(c, -0.3));
    img.patches('#556640', 6, 0.55, 0.8, 113); img.contour(); return img;
  },
  grave_cross: () => {
    const img = new Img(18, 30); const c = '#6a5238';
    img.rect(7, 0, 4, 30, c); img.rect(1, 7, 16, 4, c); img.patches('#3a3a30', 5, 0.6, 0.5, 127); img.contour(); return img;
  },

  /* ---- metro ---- */
  turnstile: () => {
    const img = new Img(26, 28); const c = '#8a8f92';
    box(img, 0, 6, 10, 22, '#5a6068'); img.rect(2, 8, 6, 3, '#3a4a3a'); img.set(4, 9, '#4ac46a');
    img.rect(10, 12, 14, 2, c); img.rect(10, 16, 12, 2, c); img.rect(10, 20, 14, 2, c); img.contour(); return img;
  },
  subway_car: () => {
    const img = new Img(160, 60); const c = '#8a9094';
    img.rect(2, 6, 156, 46, c); img.hline(2, 6, 156, shade(c, 0.25)); img.rect(2, 2, 156, 5, shade(c, -0.1));
    img.rect(2, 30, 156, 4, '#3f6b5a');
    for (let x = 8; x < 150; x += 24) { img.rect(x, 12, 16, 12, '#26323a'); img.hline(x, 12, 16, '#5a6f7a'); if (hash(x, 1, 3) > 0.6) for (let i = 0; i < 6; i++) img.set(x + Math.floor(hash(i, x, 1) * 15), 13 + Math.floor(hash(i, x, 2) * 10), '#8fa6ac'); }
    for (const x of [50, 104]) { img.rect(x, 10, 14, 40, shade(c, -0.12)); img.vline(x + 7, 10, 40, '#2a2d30'); }
    img.rect(0, 52, 160, 4, '#2a2d30'); for (const x of [18, 34, 124, 140]) wheel(img, x, 55, 5);
    rust(img, [2, 2, 156, 50], 131, 0.8); img.patches('#3a3a34', 12, 0.6, 0.6, 137); img.contour(); return img;
  },
  metro_map: () => {
    const img = new Img(46, 30);
    img.rect(0, 0, 46, 30, '#3a3d40'); img.rect(2, 2, 42, 26, '#d8d2bc');
    img.line(4, 20, 42, 8, '#b5453a'); img.line(4, 8, 42, 22, '#3f6b8a'); img.hline(4, 15, 38, '#5b8a55');
    for (const x of [8, 18, 28, 38]) { img.ellipse(x, 15, 1.5, 1.5, '#2a2a2a'); }
    img.patches('#8a7a5a', 8, 0.58, 0.6, 139); return img;
  },
  station_sign: () => {
    const img = new Img(62, 16);
    img.rect(0, 0, 62, 16, '#2e4f44'); img.outline(0, 0, 62, 16, '#1c2f2a');
    text(img, 8, 5, ['XXX X  X XXX XXX XXX X   ', 'X   XX X  X  XX  X X X   ', 'XXX X XX  X  XXX X X XXX'], '#d8d2bc');
    img.patches('#3a3a30', 8, 0.6, 0.5, 149); return img;
  },
  fluoro_lamp: () => {
    const img = new Img(34, 8);
    img.rect(0, 0, 34, 3, '#6a6f72'); img.rect(2, 3, 30, 3, '#e8eee6'); img.hline(2, 5, 30, '#b9c0bc'); img.vline(0, 3, 2, '#4a4f52'); img.vline(33, 3, 2, '#4a4f52');
    return img;
  },
  cable_bundle: () => {
    const img = new Img(64, 12);
    for (const [c, a] of [['#2a2d30', 5], ['#6a4a2a', 7], ['#2d3a44', 9]]) for (let x = 0; x < 64; x++) img.set(x, Math.round(2 + a * 0.5 + Math.sin(x / 64 * Math.PI) * 3), c);
    img.rect(0, 0, 3, 8, '#5a5f62'); img.rect(61, 0, 3, 8, '#5a5f62'); return img;
  },
  ticket_machine: () => {
    const img = new Img(24, 42); const c = '#3f6b5a';
    box(img, 0, 0, 24, 42, c); img.rect(3, 4, 18, 10, '#1f2a2a'); img.rect(5, 17, 14, 8, '#8a8f92'); img.rect(7, 30, 10, 3, '#1a1c1e');
    for (let i = 0; i < 6; i++) img.set(6 + (i % 3) * 4, 19 + Math.floor(i / 3) * 3, '#2a2d30');
    rust(img, [0, 0, 24, 42], 151, 0.5); img.contour(); return img;
  },

  /* ---- mine ---- */
  mine_support: () => {
    const img = new Img(44, 72); const c = '#5e4630';
    img.rect(2, 6, 6, 66, c); img.rect(36, 6, 6, 66, c); img.rect(0, 0, 44, 7, shade(c, 0.1));
    img.line(8, 20, 20, 7, shade(c, -0.1)); img.line(36, 20, 24, 7, shade(c, -0.1));
    for (const x of [3, 37]) img.vline(x, 6, 66, shade(c, 0.2)); img.grain(0.08, 157); img.contour(); return img;
  },
  lantern: () => {
    const img = new Img(12, 18);
    img.rect(5, 0, 2, 4, '#5a5f62'); img.rect(2, 4, 8, 2, '#3a3d40'); img.rect(3, 6, 6, 8, '#f2c86a'); img.vline(3, 6, 8, '#3a3d40'); img.vline(8, 6, 8, '#3a3d40');
    img.rect(2, 14, 8, 2, '#3a3d40'); img.contour(); return img;
  },
  ore_cart: () => {
    const img = new Img(38, 28); const c = '#5a5048';
    img.rect(2, 8, 34, 14, c); img.hline(0, 8, 38, shade(c, 0.2)); rust(img, [2, 8, 34, 14], 163, 0.9);
    for (let i = 0; i < 12; i++) img.rect(4 + Math.floor(hash(i, 1, 3) * 28), 3 + Math.floor(hash(i, 2, 3) * 5), 4, 4, ['#6a6d70', '#4a4d50', '#7a6a5a'][i % 3]);
    for (const x of [9, 29]) wheel(img, x, 24, 4); img.contour(); return img;
  },
  dynamite_crate: () => {
    const img = new Img(26, 18); const c = '#7a5a3c';
    box(img, 0, 2, 26, 16, c); img.rect(4, 7, 18, 6, '#a8463a'); text(img, 6, 8, ['X X XXX X', 'XXX  X  X'], '#e6d8a8');
    img.contour(); return img;
  },

  /* ================================================================
   * Stage 28B — underground set dressing.
   *
   * Three families that must never be mistaken for each other:
   *   cave_*    natural, wet, irregular, grown over centuries
   *   mine_*    cut and propped by people, then abandoned mid-shift
   *   br_*      technical, cold, sealed on purpose
   * Ceiling props are drawn top-aligned (they hang); everything else is
   * bottom-aligned like the rest of the prop library.
   * ================================================================ */

  /* ---- natural cave ---- */

  stalactite: () => {
    const img = new Img(10, 26); const c = '#6d6a63';
    for (let y = 0; y < 26; y++) {
      const w = Math.max(1, Math.round(5 - Math.pow(y / 25, 0.7) * 4.6));
      const x = 5 - Math.floor(w / 2);
      for (let k = 0; k < w; k++) img.set(x + k, y, k === 0 ? shade(c, 0.22) : k === w - 1 ? shade(c, -0.3) : c);
    }
    img.set(5, 25, '#8fb3c2');                       // a bead about to fall
    img.grain(0.1, 311); img.contour(); return img;
  },
  stalactite_cluster: () => {
    const img = new Img(30, 22); const c = '#6a6760';
    for (const [ox, h] of [[3, 20], [10, 13], [15, 22], [22, 11], [26, 16]]) {
      for (let y = 0; y < h; y++) {
        const w = Math.max(1, Math.round(4 - (y / h) * 3.4));
        for (let k = 0; k < w; k++) img.set(ox + k, y, k === 0 ? shade(c, 0.2) : k === w - 1 ? shade(c, -0.3) : c);
      }
    }
    img.rect(0, 0, 30, 3, shade(c, 0.12));
    img.grain(0.12, 317); img.contour(); return img;
  },
  stalagmite: () => {
    const img = new Img(12, 20); const c = '#6f6c64';
    for (let y = 0; y < 20; y++) {
      const w = Math.max(1, Math.round(1 + Math.pow(y / 19, 0.8) * 6));
      const x = 6 - Math.floor(w / 2);
      for (let k = 0; k < w; k++) img.set(x + k, y, k === 0 ? shade(c, 0.22) : k === w - 1 ? shade(c, -0.3) : c);
    }
    img.grain(0.1, 323); img.contour(); return img;
  },
  stalagmite_cluster: () => {
    const img = new Img(28, 16); const c = '#6c6961';
    for (const [ox, h] of [[2, 11], [8, 16], [14, 8], [19, 14], [24, 9]]) {
      for (let y = 0; y < h; y++) {
        const w = Math.max(1, Math.round(1 + (y / h) * 4));
        for (let k = 0; k < w; k++) img.set(ox + k, 16 - h + y, k === 0 ? shade(c, 0.2) : k === w - 1 ? shade(c, -0.3) : c);
      }
    }
    img.grain(0.12, 331); img.contour(); return img;
  },
  cave_column: () => {
    const img = new Img(16, 64); const c = '#706d65';
    for (let y = 0; y < 64; y++) {
      const pinch = Math.sin((y / 63) * Math.PI);
      const w = Math.round(6 + (1 - pinch) * 7);
      const x = 8 - Math.floor(w / 2);
      for (let k = 0; k < w; k++) img.set(x + k, y, k < 2 ? shade(c, 0.2) : k >= w - 2 ? shade(c, -0.3) : c);
    }
    img.patches('#4f6a5a', 9, 0.68, 0.45, 337);      // damp growth on the base
    img.grain(0.1, 341); img.contour(); return img;
  },
  cave_rubble: () => {
    const img = new Img(30, 13);
    chunkPile(img, ['#6a6760', '#565349', '#7b786e'], 347, 3);
    img.rect(0, 11, 30, 2, '#4e4b44');
    img.contour(); return img;
  },
  cave_puddle: () => {
    const img = new Img(34, 7);
    for (let y = 0; y < 7; y++) {
      const w = Math.round(34 - Math.abs(y - 3) * 7);
      const x = 17 - Math.floor(w / 2);
      for (let k = 0; k < w; k++) {
        const edge = k < 2 || k > w - 3;
        img.set(x + k, y, edge ? '#3f4f55' : y < 3 ? '#4f6870' : '#44585f');
      }
    }
    for (const [x, y] of [[9, 2], [14, 2], [21, 3], [25, 2]]) img.set(x, y, '#93b4bd');   // sky-less sheen
    return img;
  },
  cave_moss: () => {
    const img = new Img(26, 9); const c = '#4a6340';
    for (let i = 0; i < 46; i++) {
      const x = Math.floor(hash(i, 3, 7) * 26), y = Math.floor(hash(i, 5, 7) * 9);
      img.set(x, y, hash(i, 7, 7) > 0.6 ? shade(c, 0.22) : shade(c, -0.18));
      if (hash(i, 9, 7) > 0.7) img.set(x, y + 1, shade(c, -0.3));
    }
    return img;
  },
  cave_roots: () => {
    const img = new Img(26, 24); const c = '#5a4632';
    for (const [ox, len, bend] of [[4, 22, 0.5], [11, 16, -0.4], [17, 20, 0.3], [22, 12, -0.2]]) {
      let x = ox;
      for (let y = 0; y < len; y++) {
        x += Math.sin(y * 0.4) * bend;
        img.set(Math.round(x), y, c);
        img.set(Math.round(x) + 1, y, shade(c, -0.28));
        if (y % 7 === 3) img.set(Math.round(x) - 1, y, shade(c, 0.18));
      }
    }
    img.rect(0, 0, 26, 2, shade(c, 0.1));
    img.contour(); return img;
  },
  cave_shelf: () => {
    const img = new Img(28, 10); const c = '#6b6860';
    for (let y = 0; y < 10; y++) {
      const w = 28 - y * 2;
      img.rect(0, y, w, 1, y === 0 ? shade(c, 0.26) : y > 6 ? shade(c, -0.3) : c);
    }
    img.grain(0.12, 359); img.contour(); return img;
  },
  mineral_stain: () => {
    const img = new Img(22, 26);
    img.patches('#8a6a3c', 8, 0.3, 0.85, 367, [0, 0, 22, 26]);
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(hash(i, 2, 11) * 22), y = Math.floor(hash(i, 4, 11) * 26);
      if (hash(i, 6, 11) > 0.55) img.set(x, y, hash(i, 8, 11) > 0.5 ? '#9a7a44' : '#6d5730');
    }
    return img;
  },
  cave_fungus: () => {
    const img = new Img(20, 12);
    for (const [x, y, r] of [[4, 8, 3], [10, 6, 4], [16, 9, 2.5]]) {
      img.ellipse(x, y, r, r * 0.62, '#7c8f6a');
      img.ellipse(x, y - 0.6, r * 0.7, r * 0.4, '#9db183');
      img.rect(x - 1, y + 1, 2, 12 - y - 1, '#6b705c');
      img.set(x, y - 1, '#c3d3a4');                  // faint bioluminescent cap
    }
    img.contour(); return img;
  },

  /* ---- crystal pockets: the reward the deep layers are hiding ---- */

  crystal_cluster: () => {
    const img = new Img(24, 22);
    const faces = [['#6fb6c4', '#a9e2ea', '#3d7f8c'], ['#7fc2cc', '#b8e9ef', '#4a8b95']];
    for (const [ox, h, w, fi] of [[3, 16, 5, 0], [9, 22, 6, 1], [16, 13, 5, 0], [20, 9, 4, 1]]) {
      const [c, hi, lo] = faces[fi];
      for (let y = 0; y < h; y++) {
        const t = y / h;
        const ww = Math.max(1, Math.round(w * (0.25 + t * 0.75)));
        const x = ox + Math.floor((w - ww) / 2);
        for (let k = 0; k < ww; k++) img.set(x + k, 22 - h + y, k === 0 ? hi : k === ww - 1 ? lo : c);
      }
      img.set(ox + Math.floor(w / 2), 22 - h, '#e2f6f9');
    }
    img.contour([12, 20, 24, 210]); return img;
  },
  crystal_cluster_large: () => {
    const img = new Img(40, 38);
    const faces = [['#6fb6c4', '#b4e7ee', '#37727f'], ['#84c8d2', '#c6f0f5', '#468892']];
    for (const [ox, h, w, fi] of [[2, 20, 7, 0], [10, 34, 9, 1], [20, 26, 8, 0], [29, 38, 8, 1], [35, 15, 5, 0]]) {
      const [c, hi, lo] = faces[fi];
      for (let y = 0; y < h; y++) {
        const t = y / h;
        const ww = Math.max(1, Math.round(w * (0.22 + t * 0.78)));
        const x = ox + Math.floor((w - ww) / 2);
        for (let k = 0; k < ww; k++) img.set(x + k, 38 - h + y, k === 0 ? hi : k === ww - 1 ? lo : c);
      }
      img.set(ox + Math.floor(w / 2), 38 - h, '#eafbfd');
    }
    img.contour([12, 20, 24, 210]); return img;
  },
  crystal_shards: () => {
    const img = new Img(24, 8);
    for (let i = 0; i < 9; i++) {
      const x = 1 + Math.floor(hash(i, 3, 13) * 21);
      const y = 3 + Math.floor(hash(i, 5, 13) * 4);
      const h = 2 + Math.floor(hash(i, 7, 13) * 3);
      for (let k = 0; k < h; k++) img.set(x, y + k - h + 4, k === 0 ? '#b8e9ef' : '#6fb6c4');
      img.set(x + 1, y, '#3d7f8c');
    }
    return img;
  },
  crystal_vein_wall: () => {
    const img = new Img(26, 30); const c = '#5f6d70';
    img.rect(0, 0, 26, 30, c);
    img.grain(0.14, 373);
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(hash(i, 2, 17) * 24) + 1;
      const y = Math.floor(hash(i, 4, 17) * 28) + 1;
      if (hash(i, 6, 17) < 0.45) continue;
      img.set(x, y, '#8ed4de'); img.set(x, y + 1, '#4d919c');
      if (hash(i, 8, 17) > 0.7) img.set(x + 1, y, '#c6f0f5');
    }
    return img;
  },

  /* ---- worked mine ---- */

  mine_beam: () => {
    const img = new Img(48, 12); const c = '#5e4630';
    planks(img, 0, 0, 48, 10, c, 379);
    img.rect(2, 9, 6, 3, shade(c, -0.3)); img.rect(40, 9, 6, 3, shade(c, -0.3));
    for (const x of [6, 22, 41]) { img.set(x, 3, '#3a3f42'); img.set(x, 6, '#3a3f42'); }   // bolts
    img.grain(0.1, 383); img.contour(); return img;
  },
  broken_support: () => {
    const img = new Img(40, 58); const c = '#55402c';
    img.rect(3, 12, 6, 46, c);
    for (let y = 0; y < 30; y++) img.rect(30 + Math.round(Math.sin(y * 0.2) * 3), 28 + y, 6, 1, shade(c, -0.1));
    img.rect(0, 6, 26, 6, shade(c, 0.06));                              // cracked header
    for (let i = 0; i < 6; i++) img.set(24 + i, 6 + (i % 3), '#2f2318');
    for (let i = 0; i < 10; i++) img.set(26 + Math.floor(hash(i, 1, 5) * 12), 10 + Math.floor(hash(i, 2, 5) * 6), '#43331f');
    img.grain(0.12, 389); img.contour(); return img;
  },
  mine_rail: () => {
    const img = new Img(48, 8); const tie = '#4d3b28', steel = '#7b7f82';
    for (let x = 2; x < 48; x += 12) img.rect(x, 4, 8, 4, tie);
    img.rect(0, 2, 48, 2, steel); img.hline(0, 2, 48, shade(steel, 0.3));
    img.rect(0, 6, 48, 1, shade(steel, -0.2));
    rust(img, [0, 2, 48, 5], 397, 0.7);
    return img;
  },
  mine_rail_broken: () => {
    const img = new Img(44, 14); const tie = '#4d3b28', steel = '#7b7f82';
    for (let x = 1; x < 26; x += 12) img.rect(x, 10, 8, 4, tie);
    img.rect(0, 8, 26, 2, steel);
    for (let i = 0; i < 16; i++) img.set(26 + i, 8 - Math.round(Math.pow(i / 15, 1.6) * 7), steel);   // rail curling up
    for (let i = 0; i < 14; i++) img.set(27 + i, 9 - Math.round(Math.pow(i / 13, 1.6) * 6), shade(steel, -0.3));
    rust(img, [0, 6, 44, 8], 401, 0.9);
    img.contour(); return img;
  },
  ore_cart_tipped: () => {
    const img = new Img(40, 26); const c = '#5a5048';
    img.rect(4, 6, 30, 14, c);
    img.hline(4, 6, 30, shade(c, 0.2)); rust(img, [4, 6, 30, 14], 409, 1);
    for (let i = 0; i < 14; i++) img.rect(2 + Math.floor(hash(i, 1, 9) * 34), 19 + Math.floor(hash(i, 2, 9) * 6), 4, 4, ['#6a6d70', '#4a4d50', '#7a6a5a'][i % 3]);
    wheel(img, 9, 4, 4); wheel(img, 29, 3, 4);
    img.contour(); return img;
  },
  ore_pile: () => {
    const img = new Img(28, 14);
    chunkPile(img, ['#4e4a45', '#6b5f4e', '#3f3c38'], 419, 4);
    for (let i = 0; i < 5; i++) img.set(5 + i * 4, 6 + (i % 3), '#8a7a4c');    // flecks of value
    img.contour(); return img;
  },
  mine_winch: () => {
    const img = new Img(34, 40); const c = '#5c6164';
    img.rect(2, 30, 6, 10, '#4a3a28'); img.rect(26, 30, 6, 10, '#4a3a28');
    box(img, 4, 18, 26, 12, c);
    img.ellipse(17, 24, 7, 7, shade(c, -0.18)); img.ellipseOutline(17, 24, 7, 7, shade(c, 0.28));
    img.ellipse(17, 24, 2, 2, '#2f3437');
    for (let y = 0; y < 18; y++) img.set(17 + (y % 2), y, '#8a8f92');          // cable to the ceiling
    rust(img, [4, 18, 26, 12], 421, 0.8);
    img.contour(); return img;
  },
  mine_cage: () => {
    const img = new Img(30, 46); const c = '#585e61';
    img.rect(0, 6, 30, 3, c); img.rect(0, 43, 30, 3, shade(c, -0.24));
    img.vline(1, 6, 38, c); img.vline(28, 6, 38, c);
    for (let y = 10; y < 43; y += 6) img.hline(2, y, 26, shade(c, -0.14));
    for (let x = 7; x < 28; x += 7) img.vline(x, 9, 34, shade(c, -0.1));
    for (let y = 0; y < 6; y++) img.set(14 + (y % 2), y, '#8a8f92');
    rust(img, [0, 6, 30, 40], 431, 0.75);
    img.contour(); return img;
  },
  tool_rack: () => {
    const img = new Img(28, 32); const c = '#5a462f';
    img.rect(0, 0, 28, 4, c); img.rect(0, 28, 28, 4, shade(c, -0.2));
    img.vline(1, 0, 32, shade(c, 0.16)); img.vline(26, 0, 32, shade(c, -0.24));
    handleTool(img, 6, '#7b7f82', '#6d5436');
    handleTool(img, 14, '#8a8f92', '#4c3a2c');
    handleTool(img, 21, '#6d7477', '#5c4630');
    img.contour(); return img;
  },
  miner_bedroll: () => {
    const img = new Img(34, 12); const c = '#6a5a44';
    img.rect(0, 5, 34, 7, c); img.hline(0, 5, 34, shade(c, 0.2)); img.hline(0, 11, 34, shade(c, -0.3));
    img.ellipse(6, 5, 6, 3.5, '#7d6c52');                                  // rolled head end
    for (let i = 0; i < 5; i++) img.hline(12 + i * 4, 8, 2, shade(c, -0.2));
    img.grain(0.1, 433); img.contour(); return img;
  },
  mine_sign: () => {
    const img = new Img(24, 26);
    img.rect(11, 12, 3, 14, '#4a3a28');
    box(img, 0, 2, 24, 12, '#8a7a3c');
    img.rect(2, 4, 20, 8, '#c8b356');
    text(img, 4, 6, ['XX  X XX', 'X X X  X'], '#3a3018');
    rust(img, [0, 2, 24, 12], 439, 0.5);
    img.contour(); return img;
  },
  drill_marks: () => {
    const img = new Img(20, 24); const c = '#5c5952';
    img.rect(0, 0, 20, 24, c); img.grain(0.15, 443);
    for (let i = 0; i < 6; i++) {
      const x = 3 + (i % 3) * 7, y = 3 + Math.floor(i / 3) * 11;
      img.ellipse(x, y, 2.2, 2.6, shade(c, -0.4));
      img.ellipse(x - 0.4, y - 0.6, 1.2, 1.4, shade(c, -0.6));
      img.set(x + 2, y - 2, shade(c, 0.26));
    }
    return img;
  },
  vent_pipe: () => {
    const img = new Img(16, 40); const c = '#6a6f72';
    img.rect(3, 0, 10, 40, c);
    img.vline(4, 0, 40, shade(c, 0.24)); img.vline(11, 0, 40, shade(c, -0.3));
    for (let y = 5; y < 40; y += 11) { img.rect(1, y, 14, 3, shade(c, -0.14)); img.hline(1, y, 14, shade(c, 0.2)); }
    rust(img, [3, 0, 10, 40], 449, 0.85);
    img.contour(); return img;
  },

  /* ---- Blackridge underground ---- */

  br_sealed_door: () => {
    const img = new Img(34, 52); const c = '#48565c';
    box(img, 0, 0, 34, 52, c);
    img.rect(3, 3, 28, 46, shade(c, -0.14));
    img.vline(17, 3, 46, shade(c, -0.34));                                 // split line
    for (const y of [10, 40]) { img.rect(5, y, 24, 3, shade(c, 0.16)); img.hline(5, y, 24, shade(c, 0.3)); }
    img.rect(12, 22, 10, 7, '#25353a');                                    // dead indicator
    img.rect(14, 24, 6, 3, '#7a3b34');
    for (let i = 0; i < 5; i++) img.set(6 + i * 5, 51, '#c8a34e');         // hazard hatching at the sill
    img.contour(); return img;
  },
  br_wall_panel: () => {
    const img = new Img(28, 22); const c = '#495a60';
    box(img, 0, 0, 28, 22, c);
    img.rect(2, 2, 24, 10, shade(c, -0.2));
    for (let i = 0; i < 3; i++) img.rect(4 + i * 7, 4, 4, 6, i === 1 ? '#6fc4bb' : '#2f4046');
    for (let i = 0; i < 6; i++) img.set(4 + i * 4, 16, '#8fa0a6');
    img.contour(); return img;
  },
  br_cable_run: () => {
    const img = new Img(40, 14); const c = '#2f383c';
    img.rect(0, 0, 40, 4, '#3f4a50'); img.hline(0, 0, 40, '#55646b');
    for (const [y, col] of [[5, c], [8, '#3a4a44'], [11, '#4a3f3a']]) {
      for (let x = 0; x < 40; x++) img.set(x, y + Math.round(Math.sin(x * 0.35) * 1.2), col);
    }
    for (const x of [8, 24, 36]) img.rect(x, 3, 3, 9, '#59666c');
    img.contour(); return img;
  },
  br_sensor: () => {
    const img = new Img(14, 18); const c = '#4c5b61';
    img.rect(5, 0, 4, 6, shade(c, -0.2));
    box(img, 0, 6, 14, 12, c);
    img.ellipse(7, 12, 3.4, 3.4, '#22333a');
    img.ellipse(7, 12, 1.8, 1.8, '#6fc4bb');
    img.set(6, 11, '#c8f2ec');
    img.contour(); return img;
  },
  br_crate: () => {
    const img = new Img(26, 20); const c = '#44525a';
    box(img, 0, 0, 26, 20, c);
    img.rect(3, 4, 20, 3, shade(c, -0.26));
    img.rect(9, 10, 8, 6, '#2c3a41');
    img.hline(10, 12, 6, '#6fc4bb');
    for (let i = 0; i < 4; i++) img.set(3 + i * 6, 18, '#c8a34e');
    img.contour(); return img;
  },
  br_evac_mark: () => {
    const img = new Img(26, 20);
    for (let i = 0; i < 5; i++) {
      for (let k = 0; k < 3; k++) img.set(2 + i * 5 + k, 2 + k, '#c8a34e');
      for (let k = 0; k < 3; k++) img.set(2 + i * 5 + k, 8 + k, '#b4913f');
    }
    img.rect(4, 13, 18, 5, '#7a3b34');
    for (let i = 0; i < 4; i++) img.set(6 + i * 4, 15, '#e0c9a0');
    return img;
  },

  /* ---- Blackridge ---- */
  server_rack: () => {
    const img = new Img(28, 58); const c = '#23282c';
    box(img, 0, 0, 28, 58, c);
    for (let r = 0; r < 9; r++) { img.rect(3, 3 + r * 6, 22, 5, '#31383d'); for (let k = 0; k < 4; k++) if (hash(r, k, 167) > 0.4) img.set(5 + k * 2, 5 + r * 6, ['#4ac46a', '#c9a23a', '#4a9ac4'][(r + k) % 3]); img.hline(14, 5 + r * 6, 9, '#1a1e21'); }
    img.contour(); return img;
  },
  specimen_shelf: () => {
    const img = new Img(36, 42);
    img.rect(0, 0, 2, 42, '#8a8f92'); img.rect(34, 0, 2, 42, '#8a8f92');
    for (let r = 0; r < 3; r++) { img.rect(0, 13 + r * 14, 36, 2, '#8a8f92'); for (let k = 0; k < 4; k++) { const x = 4 + k * 8; img.rect(x, 4 + r * 14, 6, 9, '#6a9a7a'); img.rect(x, 3 + r * 14, 6, 2, '#5a5f62'); if (hash(r, k, 5) > 0.5) img.rect(x + 2, 7 + r * 14, 2, 4, '#3a2a2a'); img.vline(x, 5 + r * 14, 7, '#aad0b8'); } }
    img.contour(); return img;
  },
  security_camera: () => {
    const img = new Img(20, 14);
    img.rect(0, 0, 3, 8, '#5a5f62'); img.line(3, 3, 7, 5, '#5a5f62'); img.rect(6, 4, 12, 6, '#c9c6ba'); img.rect(17, 5, 3, 4, '#2a2d30'); img.set(8, 5, '#c45a4a');
    img.contour(); return img;
  },
  biohazard_sign: () => {
    const img = new Img(24, 24);
    img.rect(0, 0, 24, 24, '#c9a23a'); img.outline(0, 0, 24, 24, '#2a2724'); img.ellipse(12, 12, 6, 6, '#2a2724'); img.ellipse(12, 12, 3, 3, '#c9a23a');
    for (const [x, y] of [[12, 5], [6, 16], [18, 16]]) img.ellipse(x, y, 3, 3, '#2a2724'); img.ellipse(12, 12, 1.2, 1.2, '#2a2724');
    img.patches('#5a4a2a', 7, 0.6, 0.5, 173); return img;
  },

  /* ---- rooftops ---- */
  water_tank: () => {
    const img = new Img(42, 56); const c = '#6a7478';
    for (const x of [4, 34]) { img.rect(x, 30, 3, 26, '#4a4f52'); } img.line(6, 34, 35, 54, '#4a4f52'); img.line(35, 34, 6, 54, '#4a4f52');
    img.rect(2, 4, 38, 28, c); img.ellipse(21, 4, 19, 4, shade(c, 0.2)); for (let x = 4; x < 40; x += 6) img.vline(x, 5, 26, shade(c, -0.15));
    rust(img, [2, 2, 38, 30], 179, 0.8); img.contour(); return img;
  },
  antenna: () => {
    const img = new Img(28, 72);
    img.rect(13, 6, 2, 66, '#8a8f92'); for (let i = 0; i < 5; i++) img.hline(6 + i, 8 + i * 7, 16 - i * 2, '#8a8f92');
    img.line(14, 40, 2, 71, '#6a6f72'); img.line(14, 40, 26, 71, '#6a6f72'); img.contour(); return img;
  },
  satellite_dish: () => {
    const img = new Img(32, 32);
    img.ellipse(14, 12, 12, 11, '#b9b4a2'); img.ellipse(16, 12, 9, 9, '#9a968a'); img.line(14, 12, 26, 4, '#5a5f62'); img.rect(12, 22, 4, 10, '#5a5f62'); img.rect(8, 30, 12, 2, '#4a4f52');
    img.patches('#6a5a44', 7, 0.6, 0.5, 181); img.contour(); return img;
  },
  roof_vent: () => {
    const img = new Img(20, 22); const c = '#7a8086';
    img.rect(6, 8, 8, 14, c); img.rect(1, 3, 18, 6, shade(c, 0.1)); img.ellipse(10, 3, 9, 3, shade(c, 0.2)); rust(img, [1, 0, 18, 22], 191, 0.6);
    img.contour(); return img;
  },

  /* ---- streets & yards ---- */
  parked_car: () => { const img = new Img(76, 36); carBody(img, 76, '#6a7f8e'); img.patches('#8a8a78', 10, 0.55, 0.6, 193); img.contour(); return img; },
  pickup_truck: () => {
    const img = new Img(86, 40); const c = '#7a5a44';
    img.rect(4, 18, 78, 12, c); img.rect(46, 6, 26, 13, c); img.rect(50, 8, 18, 8, '#2d3a44'); img.hline(46, 6, 26, shade(c, 0.22));
    img.rect(4, 14, 40, 4, shade(c, -0.1)); img.rect(8, 10, 12, 8, '#9a7a52'); img.rect(22, 12, 10, 6, '#3a3d40');
    img.rect(80, 20, 4, 4, '#c9c08a'); wheel(img, 18, 33, 7); wheel(img, 66, 33, 7); rust(img, [4, 6, 78, 24], 197, 0.9); img.contour(); return img;
  },
  police_car: () => {
    const img = new Img(78, 38); carBody(img, 78, '#d0cdc2');
    img.rect(4, 22, 70, 5, '#2a2d30'); img.rect(30, 5, 8, 3, '#b5453a'); img.rect(38, 5, 8, 3, '#3f6b9a');
    rust(img, [2, 8, 74, 24], 199, 0.6); img.contour(); return img;
  },
  traffic_light: () => {
    const img = new Img(28, 84);
    img.rect(12, 20, 3, 64, '#4a4f52'); img.rect(8, 80, 11, 4, '#3a3d40'); img.rect(12, 18, 16, 3, '#4a4f52');
    box(img, 18, 2, 10, 26, '#2a2d30'); for (let i = 0; i < 3; i++) img.ellipse(23, 7 + i * 8, 3, 3, ['#5a2a24', '#5a4a24', '#244a2a'][i]);
    rust(img, [8, 0, 20, 84], 211, 0.4); img.contour(); return img;
  },
  phone_booth: () => {
    const img = new Img(28, 64); const c = '#6a7a8a';
    img.rect(0, 0, 28, 64, c); img.rect(3, 8, 22, 44, '#2d3a44'); img.rect(0, 0, 28, 6, '#8a3a32');
    for (let i = 0; i < 10; i++) img.set(4 + Math.floor(hash(i, 1, 7) * 20), 10 + Math.floor(hash(i, 2, 7) * 40), '#8fa6ac');
    img.rect(8, 22, 8, 10, '#3a3d40'); rust(img, [0, 0, 28, 64], 223, 0.7); img.contour(); return img;
  },
  billboard: () => {
    const img = new Img(96, 74);
    for (const x of [16, 76]) img.rect(x, 40, 4, 34, '#4a4f52'); img.rect(0, 38, 96, 3, '#5a5f62');
    img.rect(0, 0, 96, 38, '#3a3d40'); img.rect(2, 2, 92, 34, '#c9b27a'); img.rect(2, 2, 46, 34, '#6a8a9a');
    img.ellipse(24, 22, 12, 10, '#d8b89a'); img.rect(52, 8, 36, 5, '#8a3a32'); img.rect(52, 16, 28, 3, '#4a3a2a'); img.rect(52, 22, 30, 3, '#4a3a2a');
    img.patches('#6a6a5a', 9, 0.52, 0.8, 227, [2, 2, 92, 34]);
    for (let y = 2; y < 36; y++) if (hash(y, 3, 7) > 0.7) img.hline(60 + Math.floor(hash(y, 1, 3) * 20), y, 10, '#3a3d40');
    img.contour(); return img;
  },
  mailbox_cluster: () => {
    const img = new Img(32, 40); const c = '#6a7478';
    img.rect(14, 26, 4, 14, '#4a4f52'); box(img, 0, 0, 32, 26, c);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { img.outline(2 + k * 7, 2 + r * 8, 6, 7, shade(c, -0.3)); img.set(6 + k * 7, 5 + r * 8, '#c9b27a'); }
    img.rect(9, 10, 6, 7, '#2a2d30'); rust(img, [0, 0, 32, 26], 229, 0.5); img.contour(); return img;
  },
  doghouse: () => {
    const img = new Img(32, 28); const c = '#8a5a3a';
    img.rect(2, 12, 28, 16, c); for (let i = 0; i < 10; i++) img.hline(1 + i, 12 - i, 30 - i * 2, '#5a4a3a');
    img.ellipse(16, 22, 5, 6, '#1f1a16'); img.rect(11, 22, 10, 6, '#1f1a16'); planks(img, 2, 12, 8, 16, c, 3, true); img.rect(24, 26, 6, 2, '#8a8f92');
    img.contour(); return img;
  },
  bbq_grill: () => {
    const img = new Img(24, 30);
    img.ellipse(12, 12, 10, 7, '#2a2d30'); img.rect(2, 8, 20, 5, '#3a3d40'); img.hline(2, 8, 20, '#5a5f62');
    legs(img, [5, 17], 17, 13, '#4a4f52'); img.ellipse(12, 5, 8, 3, '#3a3d40'); img.contour(); return img;
  },
  lawn_chair: () => {
    const img = new Img(22, 22);
    img.line(2, 21, 14, 6, '#8a8f92'); img.line(18, 21, 8, 11, '#8a8f92');
    for (let i = 0; i < 5; i++) img.line(4 + i, 18 - i * 2, 14 + i, 6 + i, i % 2 ? '#3f6b8a' : '#c9c2a8');
    img.rect(6, 12, 12, 2, '#3f6b8a'); img.contour(); return img;
  },
  garden_bed: () => {
    const img = new Img(42, 16);
    img.rect(0, 10, 42, 6, '#6a4c36'); img.hline(0, 10, 42, '#8a6a4a');
    for (let i = 0; i < 14; i++) { const x = 2 + i * 3; const h = 3 + Math.floor(hash(i, 3, 5) * 6); img.vline(x, 10 - h, h, '#4f6a3a'); if (hash(i, 5, 5) > 0.5) img.set(x, 9 - h, ['#c9563f', '#d0a84a', '#8a5a9a'][i % 3]); }
    img.contour(); return img;
  },
  bicycle: () => {
    const img = new Img(36, 22);
    img.ellipseOutline(7, 15, 6, 6, '#2a2d30'); img.ellipseOutline(28, 15, 6, 6, '#2a2d30');
    img.line(7, 15, 15, 8, '#8a3a32'); img.line(15, 8, 26, 8, '#8a3a32'); img.line(26, 8, 28, 15, '#8a3a32'); img.line(15, 8, 18, 15, '#8a3a32'); img.line(18, 15, 7, 15, '#8a3a32');
    img.rect(12, 5, 6, 2, '#2a2d30'); img.line(26, 8, 25, 3, '#5a5f62'); img.hline(22, 3, 6, '#5a5f62'); return img;
  },
  burning_barrel: () => {
    const img = new Img(22, 36); const c = '#4a3a30';
    img.rect(3, 10, 16, 26, c); for (const y of [15, 24, 32]) img.hline(3, y, 16, shade(c, -0.35));
    for (let i = 0; i < 6; i++) img.rect(5 + Math.floor(hash(i, 1, 3) * 11), 16 + Math.floor(hash(i, 2, 3) * 14), 2, 2, '#e07a2e');
    flame(img, 8, 10, 8); flame(img, 14, 10, 10); img.ellipse(11, 10, 8, 2, '#1f1a16'); rust(img, [3, 10, 16, 26], 233, 1); img.contour(); return img;
  },
  tent: () => {
    const img = new Img(54, 32); const c = '#5a6a4a';
    for (let y = 0; y < 30; y++) { const hw = Math.round(y * 0.85); img.hline(27 - hw, y + 2, hw * 2, y % 6 === 0 ? shade(c, -0.15) : c); }
    for (let y = 8; y < 32; y++) { const hw = Math.round((y - 8) * 0.35); img.hline(27 - hw, y, hw * 2, '#1f241c'); }
    img.line(27, 0, 27, 3, '#5a4030'); img.rect(0, 30, 54, 2, '#3a4030'); img.patches('#4a4a3a', 8, 0.6, 0.5, 239); img.contour(); return img;
  },

  /* ---- nature / rural ---- */
  fern: () => {
    const img = new Img(28, 18);
    for (let i = 0; i < 7; i++) { const a = -Math.PI + (i + 0.5) * Math.PI / 7; for (let t = 0; t < 12; t++) { const x = 14 + Math.round(Math.cos(a) * t), y = 17 + Math.round(Math.sin(a) * t * 0.9 + t * t * 0.04); img.set(x, y, t % 3 ? '#4f7a3a' : '#6f9a48'); if (t % 2) img.set(x, y - 1, '#3f6a30'); } }
    return img;
  },
  mushrooms: () => {
    const img = new Img(18, 10);
    for (const [x, h, c] of [[3, 5, '#b5563f'], [9, 7, '#c9b27a'], [14, 4, '#b5563f']]) { img.rect(x, 10 - h, 2, h, '#d8d2bc'); img.ellipse(x + 1, 10 - h, 3, 1.6, c); img.set(x, 10 - h - 1, '#e6d8b8'); }
    img.contour(); return img;
  },
  boulder: () => {
    const img = new Img(44, 28); const c = '#6a6d70';
    img.ellipse(22, 17, 20, 11, c); img.ellipse(14, 12, 10, 7, shade(c, 0.1)); img.weather(6, 0.15, 241);
    img.crack(20, 8, 12, 1.4, shade(c, -0.4), 3); img.patches('#4f6a3a', 7, 0.55, 0.8, 251, [0, 0, 44, 14]); img.contour(); return img;
  },
  birch_tree: () => {
    const img = new Img(48, 104);
    img.rect(21, 30, 6, 74, '#d8d4c6'); for (let y = 32; y < 104; y += 5) if (hash(y, 1, 3) > 0.35) img.hline(21 + Math.floor(hash(y, 2, 3) * 3), y, 3, '#2a2724');
    img.vline(26, 30, 74, '#a8a496');
    for (let i = 0; i < 22; i++) { const x = 6 + Math.floor(hash(i, 3, 5) * 36), y = 2 + Math.floor(hash(i, 4, 5) * 44); img.blob(x - 4, y - 3, 9, 7, ['#6a8a3a', '#7a9a44', '#5a7a34', '#8a9a4a'][i % 4]); }
    img.line(24, 50, 12, 36, '#b9b4a2'); img.line(24, 44, 36, 30, '#b9b4a2'); img.contour(); return img;
  },
  reeds: () => {
    const img = new Img(24, 28);
    for (let i = 0; i < 9; i++) { const x = 2 + i * 2 + Math.floor(hash(i, 1, 3) * 2); const h = 14 + Math.floor(hash(i, 2, 3) * 12); img.line(x, 27, x + (i % 3) - 1, 27 - h, i % 2 ? '#6a7a3a' : '#8a8a4a'); if (i % 3 === 0) img.rect(x + (i % 3) - 1, 27 - h, 2, 4, '#5a3a24'); }
    return img;
  },
  wildflowers: () => {
    const img = new Img(30, 12);
    for (let i = 0; i < 12; i++) { const x = 1 + i * 2 + Math.floor(hash(i, 3, 1) * 2), h = 3 + Math.floor(hash(i, 4, 1) * 7); img.vline(x, 12 - h, h, '#5a7a3a'); img.set(x, 11 - h, ['#e6d8b8', '#d0a84a', '#b98ac9', '#c9563f'][i % 4]); }
    return img;
  },
  deer_stand: () => {
    const img = new Img(38, 96); const c = '#5e4630';
    img.line(6, 95, 12, 30, c); img.line(7, 95, 13, 30, c); img.line(31, 95, 25, 30, c); img.line(32, 95, 26, 30, c);
    for (let y = 40; y < 94; y += 14) img.hline(9 + Math.round((94 - y) * -0.06 + 3), y, 20, shade(c, -0.1));
    img.rect(6, 14, 26, 16, '#5a6a4a'); img.rect(4, 28, 30, 3, c); img.rect(6, 10, 26, 4, '#4a3a2a'); img.rect(10, 17, 18, 5, '#1f241c');
    for (let y = 32; y < 94; y += 5) img.hline(17, y, 4, '#7a5a3c'); img.contour(); return img;
  },
  scarecrow: () => {
    const img = new Img(30, 54);
    img.rect(14, 10, 2, 44, '#5e4630'); img.rect(2, 16, 26, 2, '#5e4630');
    img.rect(8, 16, 14, 16, '#6a5a8a'); img.rect(2, 16, 6, 4, '#6a5a8a'); img.rect(22, 16, 6, 4, '#6a5a8a');
    img.ellipse(15, 9, 5, 5, '#c9b27a'); img.rect(8, 2, 14, 3, '#6a4c36'); img.rect(11, 0, 8, 3, '#6a4c36'); img.set(13, 9, '#2a2724'); img.set(17, 9, '#2a2724');
    for (const x of [1, 27]) img.vline(x, 18, 4, '#c9b27a'); img.contour(); return img;
  },
  windmill: () => {
    const img = new Img(56, 150);
    img.line(20, 149, 27, 30, '#6a6f72'); img.line(36, 149, 29, 30, '#6a6f72');
    for (let y = 50; y < 148; y += 16) img.line(20 + (149 - y) * 0.06, y, 36 - (149 - y) * 0.06, y + 12, '#5a5f62');
    for (let a = 0; a < 12; a++) { const ang = a / 12 * Math.PI * 2; img.line(28, 24, 28 + Math.round(Math.cos(ang) * 22), 24 + Math.round(Math.sin(ang) * 22), '#8a8f92'); }
    img.ellipseOutline(28, 24, 22, 22, '#6a6f72'); img.ellipse(28, 24, 3, 3, '#3a3d40'); img.rect(30, 22, 18, 3, '#6a6f72'); img.rect(44, 18, 6, 10, '#8a8f92');
    rust(img, [0, 0, 56, 150], 257, 0.6); img.contour(); return img;
  },
  chicken_coop: () => {
    const img = new Img(46, 36); const c = '#8a6a44';
    planks(img, 2, 12, 42, 16, c, 11, true); for (let i = 0; i < 12; i++) img.hline(i * 2, 12 - i, 46 - i * 4, '#6a5a4a');
    img.rect(8, 18, 8, 10, '#2a2420'); for (const x of [6, 40]) img.rect(x, 28, 3, 8, '#5a4030'); img.line(14, 28, 22, 35, '#6a4c36'); img.contour(); return img;
  },
  wheelbarrow: () => {
    const img = new Img(32, 20);
    img.rect(8, 4, 20, 8, '#5a7a6a'); img.line(8, 4, 12, 12, '#3a5a4a'); img.hline(0, 6, 10, '#6a4c36'); img.hline(0, 8, 8, '#6a4c36');
    wheel(img, 26, 15, 4); legs(img, [12], 12, 7, '#4a4f52'); rust(img, [8, 4, 20, 8], 263, 0.7); img.contour(); return img;
  },
  feed_sacks: () => {
    const img = new Img(32, 22);
    for (const [x, y, c] of [[1, 8, '#b9a77a'], [14, 9, '#a8966a'], [7, 1, '#c9b78a']]) { img.blob(x, y, 16, 12, c); img.hline(x + 3, y + 5, 10, shade(c, -0.25)); img.rect(x + 5, y + 2, 5, 2, '#8a3a32'); }
    img.contour(); return img;
  },
  woodpile: () => {
    const img = new Img(44, 24);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 7 - r; k++) { const x = 3 + k * 6 + r * 3, y = 20 - r * 6; img.ellipse(x, y, 3, 3, '#7a5a3c'); img.ellipse(x, y, 1.5, 1.5, '#b39a6c'); }
    img.contour(); return img;
  },
  outhouse: () => {
    const img = new Img(26, 52); const c = '#6a5238';
    planks(img, 1, 8, 24, 44, c, 13, true); img.rect(0, 3, 26, 6, shade(c, -0.3)); img.rect(10, 14, 6, 4, '#1f1a16');
    img.set(20, 30, '#c9b27a'); img.patches('#4a5a3a', 8, 0.62, 0.5, 269); img.contour(); return img;
  }
});

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let n = 0;
  const sizes = {};
  for (const [name, fn] of Object.entries(PROPS)) {
    const img = fn();
    img.save(path.join(OUT, `${name}.png`), 18);
    sizes[name] = [img.w, img.h];
    n++;
  }
  // the game reads prop sizes at load time (placement, culling) and loads every listed sprite
  const NL = String.fromCharCode(10);
  const rows = Object.entries(sizes).map(([k, v]) => `  ${k}: [${v[0]}, ${v[1]}]`).join(',' + NL);
  const header = '// Generated by tools/gen_props.js — sprite sizes of every decoration prop.' + NL;
  fs.writeFileSync(path.join(__dirname, '..', 'js', 'decor_data.js'), header + 'const DECOR_SIZE = {' + NL + rows + NL + '};' + NL);
  console.log(`props: ${n}`);
}

main();
