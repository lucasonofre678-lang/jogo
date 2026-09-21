// Builds an upscaled contact sheet from a folder of PNGs so the art can be reviewed visually.
// usage: node tools/sheet.js <folder> <out.png> [scale] [cols] [filter]
const fs = require('fs');
const path = require('path');
const { readPNG, writePNG } = require('./png');

const folder = process.argv[2];
const out = process.argv[3] || 'sheet.png';
const scale = Number(process.argv[4] || 3);
const cols = Number(process.argv[5] || 10);
const filter = process.argv[6] || '';

const files = fs.readdirSync(folder).filter(f => f.endsWith('.png') && f.includes(filter)).sort();
const imgs = files.map(f => ({ name: f, ...readPNG(path.join(folder, f)) }));

const cellW = Math.max(...imgs.map(i => i.w)) * scale + 6;
const cellH = Math.max(...imgs.map(i => i.h)) * scale + 6;
const rows = Math.ceil(imgs.length / cols);
const W = cellW * cols, H = cellH * rows;
const px = new Uint8Array(W * H * 4);

// checkerboard background so alpha is visible
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const o = (y * W + x) * 4;
  const c = (((x >> 3) + (y >> 3)) & 1) ? 58 : 44;
  px[o] = c; px[o + 1] = c; px[o + 2] = c + 4; px[o + 3] = 255;
}

imgs.forEach((img, i) => {
  const ox = (i % cols) * cellW + 3;
  const oy = Math.floor(i / cols) * cellH + 3;
  for (let y = 0; y < img.h * scale; y++) {
    for (let x = 0; x < img.w * scale; x++) {
      const s = ((Math.floor(y / scale) * img.w) + Math.floor(x / scale)) * 4;
      const a = img.px[s + 3] / 255;
      if (a <= 0) continue;
      const o = ((oy + y) * W + ox + x) * 4;
      px[o] = Math.round(img.px[s] * a + px[o] * (1 - a));
      px[o + 1] = Math.round(img.px[s + 1] * a + px[o + 1] * (1 - a));
      px[o + 2] = Math.round(img.px[s + 2] * a + px[o + 2] * (1 - a));
      px[o + 3] = 255;
    }
  }
});

writePNG(out, W, H, px);
console.log(`${out}  ${W}x${H}  ${imgs.length} images`);
console.log(files.join(' '));
