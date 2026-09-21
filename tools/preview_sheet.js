// LAST COUNTY — sprite sheet contact sheet.
//   node tools/preview_sheet.js out.png scale cols sheet[+overlay...] [sheet2...]
// Lays a sheet out in a grid at an integer zoom, with a ground line under each
// frame, so poses can be reviewed without opening the game.
const fs = require('fs');
const path = require('path');
const { Img, shade } = require('./pixel');
const { readPNG } = require('./png');

const ROOT = path.join(__dirname, '..');
const out = process.argv[2] || 'preview.png';
const scale = Number(process.argv[3] || 3);
const cols = Number(process.argv[4] || 12);
const specs = process.argv.slice(5);
if (!specs.length) { console.error('no sheets given'); process.exit(1); }

const FW = Number(process.env.FW || 48), FH = Number(process.env.FH || 64);
const GROUND = Number(process.env.GROUND || 62);

function load(name) {
  const p = name.includes('/') ? path.join(ROOT, name) : path.join(ROOT, 'assets', 'sprites', `${name}.png`);
  const { w, h, px } = readPNG(p);
  return { w, h, data: px };
}

const rows = [];
for (const spec of specs) {
  const layers = spec.split('+').map(load);
  const frames = Math.floor(layers[0].w / FW);
  rows.push({ layers, frames });
}

const total = rows.reduce((a, r) => a + Math.ceil(r.frames / cols), 0);
const W = cols * (FW + 2) * scale;
const H = total * (FH + 4) * scale;
const img = new Img(W, H);
img.fill('#20242a');

let rowY = 0;
for (const r of rows) {
  for (let f = 0; f < r.frames; f++) {
    const cxCell = (f % cols) * (FW + 2) * scale;
    const cyCell = (rowY + Math.floor(f / cols)) * (FH + 4) * scale;
    // checker so transparent pixels are obvious
    for (let y = 0; y < (FH + 3) * scale; y++) {
      for (let x = 0; x < (FW + 1) * scale; x++) {
        const c = ((x >> 3) + (y >> 3)) % 2 ? '#2b3038' : '#242830';
        img.set(cxCell + x, cyCell + y, c);
      }
    }
    for (let x = 0; x < (FW + 1) * scale; x++) {
      for (let k = 0; k < scale; k++) img.set(cxCell + x, cyCell + GROUND * scale + k, '#4a5a4a');
    }
    for (const L of r.layers) {
      for (let y = 0; y < FH; y++) {
        for (let x = 0; x < FW; x++) {
          const o = ((y) * L.w + f * FW + x) * 4;
          if (f * FW + x >= L.w) continue;
          const a = L.data[o + 3];
          if (a < 8) continue;
          for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) {
            img.set(cxCell + x * scale + sx, cyCell + y * scale + sy, [L.data[o], L.data[o + 1], L.data[o + 2], a]);
          }
        }
      }
    }
  }
  rowY += Math.ceil(r.frames / cols);
}

img.save(path.isAbsolute(out) ? out : path.join(process.cwd(), out));
console.log(`preview ${out}  ${W}x${H}`);
