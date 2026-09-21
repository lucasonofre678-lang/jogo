// Debug helper: prints an ASCII map + palette for a PNG so art can be reviewed in a terminal.
const { readPNG } = require('./png');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';

function key(px, o) {
  if (px[o + 3] < 8) return '.';
  return '#' + [px[o], px[o + 1], px[o + 2]].map(v => v.toString(16).padStart(2, '0')).join('');
}

for (const file of process.argv.slice(2)) {
  const map = process.env.MAP !== '0';
  try {
    const { w, h, px } = readPNG(file);
    const counts = new Map();
    for (let i = 0; i < w * h; i++) {
      const k = key(px, i * 4);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const order = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const glyph = new Map();
    let n = 0;
    for (const [k] of order) glyph.set(k, k === '.' ? '.' : CHARS[n++ % CHARS.length]);
    console.log(`${file}  ${w}x${h}  colors=${counts.size}`);
    if (map && w <= 128 && h <= 128) {
      for (let y = 0; y < h; y++) {
        let line = '';
        for (let x = 0; x < w; x++) line += glyph.get(key(px, (y * w + x) * 4));
        console.log(line);
      }
    }
    console.log(order.slice(0, 26).map(([k, v]) => `${glyph.get(k)}=${k}(${v})`).join(' '));
    console.log('');
  } catch (e) {
    console.log(file, 'ERR', e.message);
  }
}
