// LAST COUNTY — HUD icons, filter icons, vehicle module icons and build previews.
const fs = require('fs');
const path = require('path');
const { Img, shade, hash } = require('./pixel');

const UI = path.join(__dirname, '..', 'assets', 'ui');
const BUILD = path.join(__dirname, '..', 'assets', 'build');

const INK = '#d9d2c0';
const DIM = '#8d897c';

/* ------------------------------------------------------------- HUD icons */
// 24x24, single accent colour, chunky enough to read at 18px on screen.

function hudIcon(size, draw) {
  const img = new Img(size, size);
  draw(img);
  img.contour([10, 11, 13, 190]);
  return img;
}

const HUD = {
  health: (img, c = '#c4645c') => { img.rect(9, 4, 6, 16, c); img.rect(4, 9, 16, 6, c); img.hline(9, 4, 6, shade(c, 0.3)); img.hline(4, 9, 16, shade(c, 0.22)); },
  hunger: (img, c = '#9aa863') => {
    img.rect(5, 3, 2, 10, c); img.rect(8, 3, 2, 10, c); img.rect(6, 12, 3, 9, c);  // fork
    img.ellipse(16, 8, 4, 5, c); img.rect(15, 12, 2, 9, c);                          // spoon
    img.hline(5, 3, 2, shade(c, 0.3));
  },
  thirst: (img, c = '#6d9cb4') => {
    for (let y = 2; y < 21; y++) { const w = y < 9 ? (y - 1) : Math.max(2, 20 - y + 6); img.rect(12 - Math.floor(w / 2), y, w, 1, y < 8 ? shade(c, 0.2) : c); }
    img.set(9, 14, shade(c, 0.45)); img.set(9, 15, shade(c, 0.35));
  },
  energy: (img, c = '#c6a85e') => {
    img.line(14, 2, 7, 12, c); img.line(15, 2, 8, 12, c); img.line(16, 2, 9, 12, shade(c, 0.24));
    img.rect(7, 11, 9, 2, c);
    img.line(13, 12, 8, 22, c); img.line(14, 12, 9, 22, shade(c, 0.2));
  },
  sleep: (img, c = '#8b93b0') => {
    for (let i = 0; i < 3; i++) {
      const s = 8 - i * 2, x = 4 + i * 6, y = 14 - i * 6;
      img.hline(x, y, s, c); img.hline(x, y + s - 1, s, c);
      for (let k = 0; k < s; k++) img.set(x + s - 1 - k, y + k, c);
    }
  },
  temp: (img, c = '#c08a72') => {
    img.rect(10, 2, 4, 14, '#b9b4a6'); img.ellipse(12, 18, 4, 4, '#b9b4a6');
    img.rect(11, 5, 2, 12, c); img.ellipse(12, 18, 2.4, 2.4, c);
    for (let y = 5; y < 15; y += 3) img.hline(14, y, 3, DIM);
  },
  wet: (img, c = '#6d9cb4') => {
    for (const [x, y, r] of [[8, 9, 3.4], [16, 13, 4], [11, 18, 3]]) {
      img.ellipse(x, y, r, r * 1.1, c);
      for (let k = 0; k < 4; k++) img.set(x + Math.round(Math.sin(k) * (r - 1)), y - r - k * 0.6, c);
      img.set(x - 1, y - 1, shade(c, 0.35));
    }
  },
  exposure: (img, c = '#9cb06a') => {
    img.ellipseOutline(12, 12, 9, 9, c);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - 1.6;
      img.ellipse(12 + Math.cos(a) * 5, 12 + Math.sin(a) * 5, 3.2, 3.2, c);
    }
    img.ellipse(12, 12, 2.2, 2.2, shade(c, 0.3));
  },
  noise: (img, c = '#b3ab8e') => {
    img.rect(5, 9, 4, 6, c); img.line(9, 9, 13, 4, c); img.line(9, 14, 13, 19, c); img.rect(9, 9, 4, 6, c);
    for (let i = 0; i < 2; i++) img.ellipseOutline(14, 12, 4 + i * 4, 5 + i * 4, shade(c, -0.1 * i));
  },
  threat: (img, c = '#c47a5c') => {
    for (let y = 2; y < 20; y++) { const w = Math.round((y - 1) * 1.1); img.rect(12 - Math.floor(w / 2), y, w, 1, c); }
    img.rect(11, 7, 2, 7, '#2a2722'); img.rect(11, 15, 2, 2, '#2a2722');
  }
};

const NAV = {
  nav_compass: (img, c = INK) => {
    img.ellipseOutline(12, 12, 9, 9, c);
    img.line(12, 12, 17, 6, c); img.line(12, 12, 7, 18, DIM);
    img.set(12, 12, shade(c, 0.4));
  },
  nav_day: (img, c = '#c6a85e') => {
    img.ellipse(12, 12, 5, 5, c);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; img.rect(Math.round(12 + Math.cos(a) * 8), Math.round(12 + Math.sin(a) * 8), 2, 2, c); }
  },
  nav_clock: (img, c = INK) => { img.ellipseOutline(12, 12, 9, 9, c); img.line(12, 12, 12, 6, c); img.line(12, 12, 16, 14, c); },
  nav_deaths: (img, c = '#b08a86') => {
    img.ellipse(12, 10, 6, 6, c); img.rect(8, 14, 8, 5, c);
    img.rect(9, 8, 3, 3, '#2a2722'); img.rect(13, 8, 3, 3, '#2a2722');
    img.rect(11, 14, 2, 4, '#2a2722');
  },
  nav_archive: (img, c = '#b3ab8e') => {
    img.rect(4, 4, 15, 17, c); img.rect(6, 2, 15, 17, shade(c, 0.14));
    img.hline(8, 6, 10, '#3a382f'); img.hline(8, 9, 8, '#3a382f'); img.hline(8, 12, 11, '#3a382f');
  },
  nav_vehicle: (img, c = '#94a099') => {
    img.rect(2, 11, 20, 6, c); img.rect(6, 6, 12, 6, shade(c, 0.1));
    img.rect(7, 7, 4, 4, '#39424a'); img.rect(13, 7, 4, 4, '#39424a');
    img.ellipse(7, 18, 3, 3, '#2b2e30'); img.ellipse(17, 18, 3, 3, '#2b2e30');
  },
  nav_people: (img, c = INK) => {
    img.ellipse(8, 8, 3.4, 3.4, c); img.rect(4, 12, 9, 8, c);
    img.ellipse(17, 9, 3, 3, DIM); img.rect(14, 13, 8, 7, DIM);
  },
  nav_build: (img, c = '#c0a473') => {
    img.rect(3, 12, 8, 9, c); img.rect(12, 8, 9, 13, shade(c, -0.12));
    img.hline(3, 12, 8, shade(c, 0.24)); img.hline(12, 8, 9, shade(c, 0.24));
    img.rect(6, 3, 12, 3, '#8b9296'); img.rect(11, 5, 3, 5, '#8b9296');
  },
  nav_inventory: (img, c = '#b08d5e') => {
    img.rect(4, 7, 16, 14, c); img.hline(4, 7, 16, shade(c, 0.26));
    img.rect(9, 3, 6, 5, shade(c, -0.2));
    img.rect(10, 12, 4, 4, '#3f372c');
    img.hline(4, 19, 16, shade(c, -0.3));
  },
  nav_radio: (img, c = '#94a099') => {
    img.rect(3, 9, 18, 12, c); img.rect(5, 12, 8, 6, '#2f3a3d');
    img.ellipse(17, 15, 2.4, 2.4, '#c6a85e');
    img.line(16, 9, 21, 2, DIM);
  }
};

const FILTERS = {
  filter_all: (img, c = INK) => { for (const [x, y] of [[4, 4], [13, 4], [4, 13], [13, 13]]) { img.rect(x, y, 7, 7, c); img.hline(x, y, 7, shade(c, 0.25)); } },
  filter_tools: (img, c = '#b19169') => {
    img.line(5, 19, 15, 7, c); img.rect(13, 3, 7, 5, '#8b9296'); img.rect(4, 18, 4, 3, shade(c, -0.2));
  },
  filter_survival: (img, c = '#96a86b') => {
    img.rect(5, 6, 14, 14, '#b0aa9c'); img.hline(5, 6, 14, '#c6c0b0');
    img.rect(10, 9, 4, 8, c); img.rect(8, 11, 8, 4, c);
  },
  filter_materials: (img, c = '#9a8c73') => {
    img.rect(3, 12, 9, 8, c); img.rect(13, 12, 9, 8, shade(c, -0.14)); img.rect(8, 4, 9, 8, shade(c, 0.1));
    img.hline(3, 12, 9, shade(c, 0.25)); img.hline(8, 4, 9, shade(c, 0.3)); img.hline(13, 12, 9, shade(c, 0.2));
  },
  filter_clothing: (img, c = '#7d8f83') => {
    img.rect(7, 5, 10, 15, c); img.rect(3, 6, 5, 9, shade(c, -0.18)); img.rect(16, 6, 5, 9, shade(c, -0.24));
    img.rect(9, 3, 6, 3, shade(c, 0.2)); img.vline(12, 7, 13, shade(c, -0.3));
  },
  filter_key: (img, c = '#b3a276') => {
    img.ellipseOutline(8, 9, 5, 5, c); img.rect(10, 11, 10, 3, c); img.rect(16, 14, 3, 3, c); img.rect(12, 14, 2, 3, c);
  },
  filter_search: (img, c = INK) => { img.ellipseOutline(10, 10, 6.5, 6.5, c); img.ellipseOutline(10, 10, 5.5, 5.5, shade(c, -0.3)); img.line(15, 15, 21, 21, c); img.line(14, 15, 20, 21, c); }
};

const MODULES = {
  module_wheels: (img, c = '#24262a') => {
    img.ellipse(8, 14, 6, 6, c); img.ellipse(17, 14, 6, 6, c);
    img.ellipse(8, 14, 2.6, 2.6, '#7d858a'); img.ellipse(17, 14, 2.6, 2.6, '#7d858a');
    img.ellipseOutline(8, 14, 6, 6, '#41464c'); img.ellipseOutline(17, 14, 6, 6, '#41464c');
  },
  module_engine: (img, c = '#6a7174') => {
    img.rect(4, 8, 12, 11, c); img.hline(4, 8, 12, shade(c, 0.24));
    img.rect(6, 4, 3, 4, shade(c, 0.1)); img.rect(11, 4, 3, 4, shade(c, 0.1));
    img.ellipse(19, 13, 4.4, 4.4, shade(c, -0.1)); img.ellipse(19, 13, 1.8, 1.8, '#3f4648');
  },
  module_battery: (img, c = '#3f4a3c') => {
    img.rect(5, 7, 14, 13, c); img.hline(5, 7, 14, shade(c, 0.3));
    img.rect(7, 4, 3, 3, '#9aa0a2'); img.rect(14, 4, 3, 3, '#9aa0a2');
    img.rect(8, 11, 8, 5, '#93864b'); img.rect(11, 12, 2, 3, '#33302a');
  },
  module_fuel: (img, c = '#875b48') => {
    img.rect(4, 9, 16, 11, c); img.hline(4, 9, 16, shade(c, 0.24));
    img.rect(9, 5, 5, 4, '#5f6668'); img.rect(6, 13, 12, 2, shade(c, -0.3));
  },
  module_seats: (img, c = '#6a584c') => {
    img.rect(8, 4, 9, 10, c); img.rect(6, 14, 13, 5, shade(c, -0.12));
    img.hline(8, 4, 9, shade(c, 0.24)); img.rect(7, 19, 3, 3, '#4a4d4e'); img.rect(15, 19, 3, 3, '#4a4d4e');
  },
  module_suspension: (img, c = '#747c7e') => {
    img.rect(10, 3, 5, 4, c); img.rect(10, 18, 5, 4, c);
    for (let y = 7; y < 18; y += 3) { img.hline(7, y, 11, '#93999b'); img.hline(8, y + 1, 9, shade(c, -0.3)); }
  },
  module_body: (img, c = '#687377') => {
    img.rect(3, 6, 18, 6, c); img.hline(3, 6, 18, shade(c, 0.26));
    img.rect(5, 14, 16, 6, shade(c, -0.1)); img.hline(5, 14, 16, shade(c, 0.2));
  },
  module_lights: (img, c = '#c9bd82') => {
    img.ellipse(9, 12, 6, 6, '#4f5658'); img.ellipse(9, 12, 4.2, 4.2, c); img.ellipse(7.5, 10.5, 1.6, 1.6, shade(c, 0.4));
    for (let i = 0; i < 3; i++) img.line(15, 8 + i * 4, 21, 6 + i * 5, shade(c, 0.1));
  }
};

const THREAT = {
  threat_wander: (img, c = '#8d897c') => { img.rect(8, 4, 4, 9, c); img.rect(8, 15, 4, 4, c); },
  threat_investigate: (img, c = '#c6a85e') => {
    img.rect(6, 3, 8, 4, c); img.rect(12, 6, 4, 5, c); img.rect(8, 10, 5, 4, c); img.rect(8, 16, 4, 4, c);
  },
  threat_chase: (img, c = '#c4645c') => { img.rect(8, 3, 5, 11, c); img.rect(8, 16, 5, 5, c); img.hline(8, 3, 5, shade(c, 0.35)); }
};

/* ------------------------------------------------------------ build cards */
// 48x48 previews for the construction menu.

function buildIcon(draw) {
  const img = new Img(48, 48);
  draw(img);
  img.volume(0.12);
  img.contour([12, 13, 15, 200]);
  return img;
}

function planksV(img, x, y, w, h, c, seed = 1) {
  for (let i = 0; i < w; i += 6) {
    const t = shade(c, (hash(i, seed, 3) - 0.5) * 0.22);
    img.rect(x + i, y, 5, h, t);
    img.vline(x + i, y, h, shade(t, 0.18));
    img.vline(x + i + 4, y, h, shade(t, -0.3));
  }
}
function planksH(img, x, y, w, h, c, seed = 1) {
  for (let j = 0; j < h; j += 6) {
    const t = shade(c, (hash(j, seed, 5) - 0.5) * 0.22);
    img.rect(x, y + j, w, 5, t);
    img.hline(x, y + j, w, shade(t, 0.18));
    img.hline(x, y + j + 4, w, shade(t, -0.3));
  }
}
function bricks(img, x, y, w, h, c) {
  img.rect(x, y, w, h, '#6d6459');
  for (let r = 0; r * 8 < h; r++) {
    const yy = y + r * 8;
    for (let bx = x - (r % 2 ? 8 : 0); bx < x + w; bx += 16) {
      const t = shade(c, (hash(bx, yy, 3) - 0.5) * 0.24);
      const x0 = Math.max(x, bx + 1), x1 = Math.min(x + w, bx + 15);
      if (x1 <= x0) continue;
      img.rect(x0, yy + 1, x1 - x0, 6, t);
      img.hline(x0, yy + 1, x1 - x0, shade(t, 0.18));
    }
  }
}
function metalSheet(img, x, y, w, h, c) {
  img.rect(x, y, w, h, c);
  for (let i = 0; i < w; i += 6) { img.vline(x + i, y, h, shade(c, -0.26)); img.vline(x + i + 2, y, h, shade(c, 0.2)); }
  img.hline(x, y, w, shade(c, 0.28));
  img.patches('#7a4a2b', 8, 0.6, 0.6, 11, [x, y, w, h]);
}

const BUILDS = {
  wall: img => { planksV(img, 8, 4, 32, 40, '#7a5a3c'); img.rect(8, 12, 32, 3, '#63482d'); img.rect(8, 32, 32, 3, '#63482d'); },
  plank_wall: img => { planksH(img, 6, 8, 36, 32, '#79573d'); },
  brick_wall: img => bricks(img, 6, 8, 36, 32, '#8a5a4b'),
  metal_wall: img => metalSheet(img, 6, 8, 36, 32, '#5f676b'),
  painted_wall: img => { planksH(img, 6, 8, 36, 32, '#6f5a3f'); img.patches('#8a9184', 7, 0.35, 0.9, 5, [6, 8, 36, 32]); },
  panel_wall: img => { metalSheet(img, 6, 6, 36, 36, '#6b7273'); for (let y = 10; y < 40; y += 10) img.hline(6, y, 36, shade('#6b7273', -0.25)); },
  window: img => {
    img.rect(6, 8, 36, 32, '#5a4a36'); img.rect(10, 12, 28, 24, [126, 156, 163, 110]);
    img.line(11, 35, 37, 13, [206, 226, 232, 80]);
    img.vline(24, 12, 24, '#5a4a36'); img.hline(10, 24, 28, '#5a4a36');
  },
  door: img => {
    planksV(img, 10, 4, 28, 40, '#7d5a40');
    img.outline(10, 4, 28, 40, '#4e3a26');
    img.ellipse(33, 26, 2.4, 2.4, '#b3a276');
    img.rect(14, 10, 20, 10, shade('#7d5a40', -0.18));
  },
  garage_door: img => {
    metalSheet(img, 4, 6, 40, 36, '#61696b');
    for (let y = 6; y < 42; y += 9) img.hline(4, y, 40, '#3f4648');
    img.rect(20, 36, 8, 3, '#b3a276');
  },
  barricade: img => {
    planksV(img, 8, 10, 32, 28, '#6f5039');
    for (const a of [[6, 12, 42, 34], [42, 12, 6, 34]]) {
      const c = '#8a6a46';
      for (let i = 0; i < 40; i++) {
        const t = i / 40, x = a[0] + (a[2] - a[0]) * t, y = a[1] + (a[3] - a[1]) * t;
        img.rect(Math.round(x), Math.round(y), 4, 4, c);
      }
    }
  },
  fence: img => {
    for (const x of [8, 22, 36]) { img.rect(x, 12, 6, 30, '#77563c'); img.vline(x, 12, 30, '#8f6d4a'); img.rect(x, 9, 6, 3, '#6a4c34'); }
    img.rect(4, 18, 40, 4, '#6f5039'); img.rect(4, 32, 40, 4, '#6f5039');
  },
  chain_fence: img => {
    for (let i = -48; i < 96; i += 8) for (let k = 0; k < 48; k++) { img.set(i + k, k, [150, 158, 158, 220]); img.set(i - k + 48, k, [120, 128, 128, 200]); }
    img.rect(4, 2, 4, 44, '#6f7674'); img.rect(40, 2, 4, 44, '#6f7674');
  },
  wood_floor: img => { planksH(img, 2, 16, 44, 18, '#735039'); img.hline(2, 16, 44, '#8f6d4a'); },
  concrete_floor: img => {
    img.rect(2, 16, 44, 18, '#787a77'); img.grain(0.07, 3, [2, 16, 44, 18]);
    img.hline(2, 16, 44, '#94968f'); img.vline(24, 16, 18, '#666a68');
  },
  ceramic_floor: img => {
    img.rect(2, 14, 44, 20, '#9aa09a');
    for (let x = 2; x < 46; x += 11) img.vline(x, 14, 20, '#78807a');
    img.hline(2, 24, 44, '#78807a'); img.hline(2, 14, 44, '#b2b8b0');
  },
  gravel_floor: img => {
    img.rect(2, 16, 44, 18, '#4f4d48');
    for (let i = 0; i < 70; i++) { const x = 2 + Math.floor(hash(i, 3, 1) * 42), y = 16 + Math.floor(hash(i, 3, 2) * 17); const c = ['#7b7871', '#66635e', '#8f8c82'][i % 3]; img.rect(x, y, 2, 2, c); }
  },
  rubble_floor: img => {
    img.rect(2, 16, 44, 18, '#4a4a47');
    for (let i = 0; i < 26; i++) { const x = 2 + Math.floor(hash(i, 7, 1) * 40), y = 16 + Math.floor(hash(i, 7, 2) * 14); const c = ['#7c7a73', '#8a6252', '#5d5a55'][i % 3]; img.rect(x, y, 4, 3, c); img.hline(x, y, 4, shade(c, 0.22)); }
  },
  platform: img => { planksH(img, 2, 18, 44, 10, '#76553d'); img.rect(8, 28, 4, 12, '#5a4230'); img.rect(36, 28, 4, 12, '#5a4230'); },
  rail_section: img => {
    img.rect(2, 26, 44, 10, '#5a4633'); img.rect(2, 20, 44, 5, '#6e7477'); img.hline(2, 20, 44, '#9aa1a3');
    for (let x = 4; x < 46; x += 10) img.vline(x, 26, 10, '#4c3a2b');
  },
  roof_shingle: img => {
    for (let r = 0; r < 4; r++) for (let x = -10 + (r % 2 ? 6 : 0); x < 48; x += 12) {
      const c = shade('#584a42', (hash(x, r, 1) - 0.5) * 0.3);
      const x0 = Math.max(2, x), w = Math.min(11, 46 - x0);
      if (w <= 0) continue;
      img.rect(x0, 10 + r * 8, w, 7, c); img.hline(x0, 10 + r * 8, w, shade(c, 0.2));
    }
  },
  roof_metal: img => metalSheet(img, 2, 12, 44, 26, '#4f595c'),
  roof_slope_left: img => {
    for (let i = 0; i < 3; i++) { const x = 4 + i * 14, y = 34 - i * 11; img.rect(x, y, 15, 11, shade('#584a42', 0.05 - i * 0.05)); img.hline(x, y, 15, '#6f5f55'); }
  },
  roof_slope_right: img => {
    for (let i = 0; i < 3; i++) { const x = 30 - i * 14, y = 34 - i * 11; img.rect(x, y, 15, 11, shade('#584a42', 0.05 - i * 0.05)); img.hline(x, y, 15, '#6f5f55'); }
  },
  stairs_left: img => {
    for (let i = 0; i < 3; i++) { const x = 4 + i * 14, y = 34 - i * 11; planksH(img, x, y, 15, 11, '#76553d', i); img.hline(x, y, 15, '#9a7450'); }
  },
  stairs_right: img => {
    for (let i = 0; i < 3; i++) { const x = 30 - i * 14, y = 34 - i * 11; planksH(img, x, y, 15, 11, '#76553d', i); img.hline(x, y, 15, '#9a7450'); }
  },
  crate: img => {
    planksV(img, 8, 12, 32, 30, '#72543b');
    img.outline(8, 12, 32, 30, '#4a3623');
    img.line(8, 12, 39, 41, '#5c4229'); img.line(39, 12, 8, 41, '#5c4229');
  },
  campfire: img => {
    img.ellipse(24, 40, 16, 5, '#4a4237');
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI; img.ellipse(24 + Math.cos(a) * 13, 40 + Math.sin(a) * 3, 3, 2.4, '#6d675a'); }
    for (const [x0, y0, x1, y1] of [[12, 40, 30, 26], [36, 40, 18, 26], [24, 42, 24, 24]]) {
      for (let i = 0; i <= 20; i++) { const t = i / 20; img.rect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 3, 3, '#6a4e33'); }
    }
    for (let y = 8; y < 30; y++) { const w = Math.round((30 - y) * 0.7); img.rect(24 - Math.floor(w / 2), y, w, 1, y > 20 ? '#e0a44e' : y > 14 ? '#c47638' : '#8f4a2c'); }
    img.rect(22, 24, 4, 5, '#f2d79a');
  },
  workbench: img => {
    planksH(img, 2, 16, 44, 10, '#74583e');
    img.rect(6, 26, 5, 18, '#553f2c'); img.rect(37, 26, 5, 18, '#553f2c');
    img.rect(8, 10, 12, 6, '#6f7477'); img.rect(26, 8, 4, 8, '#8b9296'); img.rect(24, 12, 10, 4, '#7a5a3c');
    img.rect(4, 30, 40, 3, '#5f462f');
  },
  auto_bench: img => {
    img.rect(2, 18, 44, 8, '#5a6064'); img.hline(2, 18, 44, '#7a8286');
    img.rect(6, 26, 5, 18, '#41464a'); img.rect(37, 26, 5, 18, '#41464a');
    img.ellipse(14, 12, 7, 7, '#6a7174'); img.ellipseOutline(14, 12, 7, 7, '#8a9294'); img.ellipse(14, 12, 2.4, 2.4, '#3f4648');
    img.rect(26, 8, 14, 9, '#6a5a3c'); img.hline(26, 8, 14, '#8a7550');
    img.rect(8, 30, 32, 3, '#4a5054');
  },
  vehicle_frame: img => {
    img.rect(4, 22, 40, 5, '#697174'); img.hline(4, 22, 40, '#8a9294');
    img.line(12, 22, 18, 12, '#697174'); img.line(36, 22, 30, 12, '#697174'); img.rect(18, 10, 12, 3, '#697174');
    img.ellipse(13, 32, 7, 7, '#24262a'); img.ellipse(35, 32, 7, 7, '#24262a');
    img.ellipse(13, 32, 3, 3, '#6e7376'); img.ellipse(35, 32, 3, 3, '#6e7376');
  },
  generator: img => {
    img.rect(4, 16, 40, 22, '#3f4548'); img.hline(4, 16, 40, '#5f676a');
    img.rect(9, 20, 26, 12, '#8c6542'); img.hline(9, 20, 26, '#a67f55');
    img.ellipse(38, 26, 4, 4, '#86a36c');
    img.rect(8, 38, 8, 5, '#22262a'); img.rect(32, 38, 8, 5, '#22262a');
    img.rect(14, 10, 5, 6, '#5a6064'); img.rect(13, 8, 7, 3, '#6d7578');
  },
  rain_barrel: img => {
    const c = '#6b5340';
    img.rect(10, 10, 28, 34, c);
    img.hline(10, 10, 28, shade(c, 0.26));
    img.hline(10, 43, 28, shade(c, -0.3));
    for (const y of [17, 26, 35]) { img.hline(10, y, 28, shade(c, -0.32)); img.hline(10, y + 1, 28, shade(c, 0.14)); }
    img.rect(12, 12, 24, 5, '#4a6b78');
    img.hline(12, 12, 24, '#6f939c');
    img.rect(20, 2, 8, 8, '#5f676a');
    img.line(24, 4, 24, 10, '#8a9294');
  },
  floodlight: img => {
    img.rect(21, 20, 6, 24, '#565d60'); img.rect(15, 44, 18, 4, '#41464a');
    img.rect(10, 4, 28, 15, '#6b7274'); img.rect(13, 7, 22, 9, '#e2d5a0');
    img.hline(13, 7, 22, '#f6efcc');
    img.outline(10, 4, 28, 15, '#454b4d');
  },
  wall_lamp: img => {
    img.rect(22, 18, 4, 22, '#666d6f');
    img.rect(14, 8, 20, 10, '#5f6668');
    img.rect(17, 11, 14, 6, '#e2d08c'); img.hline(17, 11, 14, '#f4e7b6');
    img.rect(12, 4, 24, 4, '#4f5658');
  },
  shelf_build: img => {
    img.rect(6, 6, 4, 38, '#6a5238'); img.rect(38, 6, 4, 38, '#5c4630');
    for (let i = 0; i < 3; i++) { const y = 12 + i * 11; img.rect(8, y, 32, 4, '#74563f'); img.hline(8, y, 32, '#8f6d4a'); for (let k = 0; k < 4; k++) { if (hash(i, k, 3) < 0.4) continue; const c = ['#7c6a4a', '#5f6a5c', '#8a5a4a'][k % 3]; img.rect(11 + k * 7, y - 6, 5, 6, c); } }
  },
  table_build: img => { planksH(img, 4, 14, 40, 8, '#74563f'); img.rect(8, 22, 5, 22, '#5a4230'); img.rect(35, 22, 5, 22, '#5a4230'); img.rect(10, 28, 28, 3, '#63482d'); },
  bed_build: img => {
    img.rect(2, 12, 5, 30, '#5a4632'); img.rect(41, 20, 5, 22, '#5a4632');
    img.rect(6, 24, 36, 10, '#7c7364'); img.hline(6, 24, 36, '#938a78');
    img.rect(8, 18, 12, 7, '#a8a08c'); img.rect(20, 24, 22, 4, '#5f6a5c');
  }
};

function main() {
  fs.mkdirSync(UI, { recursive: true });
  fs.mkdirSync(BUILD, { recursive: true });
  let n = 0;
  for (const [name, draw] of Object.entries({ ...HUD, ...NAV, ...FILTERS, ...MODULES, ...THREAT })) {
    hudIcon(24, draw).save(path.join(UI, `${name}.png`), 10); n++;
  }
  // close button glyph
  hudIcon(24, img => { for (let i = 0; i < 14; i++) { img.set(5 + i, 5 + i, INK); img.set(6 + i, 5 + i, INK); img.set(18 - i, 5 + i, INK); img.set(19 - i, 5 + i, INK); } }).save(path.join(UI, 'ui_close.png'), 6); n++;

  // brand mark: a county road sign silhouette with a cracked stripe
  const logo = new Img(48, 48);
  logo.rect(4, 8, 40, 32, '#4a4f45');
  logo.outline(4, 8, 40, 32, '#2b2f29');
  logo.rect(7, 11, 34, 26, '#5e6554');
  logo.rect(10, 20, 28, 5, '#c4a85e');
  for (let i = 0; i < 28; i++) if (hash(i, 3, 1) > 0.72) logo.rect(10 + i, 20, 2, 5, '#5e6554');
  logo.rect(10, 14, 12, 4, '#8f9483');
  logo.rect(24, 28, 14, 4, '#8f9483');
  logo.contour([12, 13, 15, 200]);
  logo.save(path.join(UI, 'logo.png'), 10); n++;

  for (const [name, draw] of Object.entries(BUILDS)) {
    buildIcon(draw).save(path.join(BUILD, `${name}.png`), 18); n++;
  }
  console.log(`ui + build: ${n}`);
}

main();
