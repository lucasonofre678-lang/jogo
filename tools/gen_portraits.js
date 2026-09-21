// LAST COUNTY — 96x128 dialogue portraits. Same identities as the world sprites.
const fs = require('fs');
const path = require('path');
const { Img, shade, mix, hash, vnoise } = require('./pixel');

const OUT = path.join(__dirname, '..', 'assets', 'portraits');
const W = 96, H = 128;

function backdrop(img, tone) {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = vnoise(x, y, 30, 3) * 0.7 + vnoise(x, y, 13, 7) * 0.3;
      const t = 0.25 + (y / H) * 0.4 + v * 0.2;
      img.set(x, y, mix(shade(tone, -0.55), shade(tone, -0.2), t));
    }
  }
  // vignette
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - W / 2) / (W / 2), dy = (y - H / 2) / (H / 2);
    const d = Math.min(1, (dx * dx + dy * dy) * 0.6);
    img.shadeAt(x, y, -d * 0.45);
  }
}

function portrait(p) {
  const img = new Img(W, H);
  backdrop(img, p.backdrop || '#4a5250');

  const skin = p.skin, skinD = p.skinShade, skinL = shade(skin, 0.14);
  const cx = 48;

  // shoulders / garment
  const shoulderY = 96;
  for (let y = shoulderY; y < H; y++) {
    const t = (y - shoulderY) / (H - shoulderY);
    const w = Math.round(48 + t * 30);
    for (let x = cx - w / 2; x < cx + w / 2; x++) {
      const edge = x < cx - w / 2 + 3 ? shade(p.top, 0.16) : x > cx + w / 2 - 5 ? shade(p.top, -0.26) : p.top;
      img.set(Math.round(x), y, edge);
    }
  }
  if (p.collar) {
    img.rect(cx - 20, shoulderY, 12, 10, shade(p.collar, 0.08));
    img.rect(cx + 8, shoulderY, 12, 10, shade(p.collar, -0.14));
    for (let i = 0; i < 10; i++) { img.set(cx - 9 + i, shoulderY + i, shade(p.collar, -0.3)); img.set(cx + 8 - i, shoulderY + i, shade(p.collar, -0.3)); }
  }
  // neck
  img.rect(cx - 9, 80, 18, 18, skinD);
  img.rect(cx - 7, 80, 12, 14, shade(skin, -0.12));

  // head: rounded rectangle with a jaw
  const headTop = 24, headBot = 88, headW = 46;
  for (let y = headTop; y < headBot; y++) {
    const t = (y - headTop) / (headBot - headTop);
    let w = headW;
    if (t < 0.1) w = headW - (0.1 - t) * 180;
    if (t > 0.68) w = headW - (t - 0.68) * 78;
    if (t > 0.92) w = headW - (t - 0.92) * 300;
    w = Math.max(6, w);
    for (let x = cx - w / 2; x <= cx + w / 2; x++) {
      const nx = (x - cx) / (w / 2);
      const c = nx < -0.55 ? skinL : nx > 0.45 ? skinD : skin;
      img.set(Math.round(x), y, c);
    }
  }
  // cheek + jaw shading
  for (let y = 58; y < 82; y++) img.set(cx + 17 - Math.round((y - 58) * 0.35), y, shade(skin, -0.2));
  for (let y = 30; y < 50; y++) img.set(cx - 21 + Math.round((y - 30) * 0.2), y, shade(skin, 0.1));

  // eyes
  const eyeY = 52;
  for (const ex of [cx - 12, cx + 10]) {
    img.rect(ex - 5, eyeY - 1, 11, 2, shade(skin, -0.3));      // socket shadow
    img.rect(ex - 4, eyeY + 1, 9, 5, '#d8d2c4');
    img.rect(ex - 1, eyeY + 1, 4, 5, p.eye);
    img.rect(ex, eyeY + 2, 2, 2, shade(p.eye, -0.4));
    img.set(ex + 1, eyeY + 2, '#e8e4d8');
    img.hline(ex - 4, eyeY + 6, 9, shade(skin, -0.22));        // lower lid
  }
  // brows: thin, gently arched — heavy slabs read as an angry cartoon
  for (const [bx, dir] of [[cx - 18, -1], [cx + 6, 1]]) {
    for (let i = 0; i < 13; i++) {
      const arch = Math.round(Math.abs(i - (dir < 0 ? 8 : 4)) * 0.22);
      img.rect(bx + i, eyeY - 6 + arch, 1, 2, p.brow);
    }
  }
  // nose + mouth
  img.rect(cx - 2, 56, 4, 12, shade(skin, -0.12));
  img.rect(cx - 4, 66, 8, 3, shade(skin, -0.24));
  img.set(cx - 5, 64, shade(skin, -0.3)); img.set(cx + 5, 64, shade(skin, -0.3));
  img.rect(cx - 8, 74, 16, 2, shade(skin, -0.34));
  img.hline(cx - 6, 76, 12, shade(skin, -0.16));
  if (p.stubble) {
    for (let y = 62; y < 88; y++) for (let x = cx - 22; x < cx + 22; x++) {
      if (y < 70 && Math.abs(x - cx) < 9) continue;
      if (hash(x, y, 5) > 0.55 && img.get(x, y)[3] > 0) img.shadeAt(x, y, -0.16);
    }
  }
  if (p.beard) {
    for (let y = 66; y < 96; y++) {
      const t = (y - 66) / 30;
      const w = Math.round(38 - t * 12);
      for (let x = cx - w / 2; x < cx + w / 2; x++) {
        if (y < 74 && Math.abs(x - cx) < 10) continue;
        const n = vnoise(x, y, 5, 3);
        img.set(Math.round(x), y, shade(p.hair, (n - 0.5) * 0.3));
      }
    }
  }

  // hair
  const hair = p.hair;
  if (p.hairStyle !== 'bald') {
    // Hair is built from a hairline curve so the forehead stays clean.
    const hairline = x => {
      const nx = (x - cx) / 26;
      return headTop + 14 - Math.round(Math.cos(nx * 1.5) * 5) + Math.round(vnoise(x, 0, 9, 19) * 2);
    };
    for (let x = cx - 27; x <= cx + 27; x++) {
      const nx = (x - cx) / 27;
      const top = headTop - 7 + Math.round(Math.pow(Math.abs(nx), 2.2) * 12);
      const bottom = Math.abs(nx) > 0.78 ? headTop + 30 : hairline(x);
      for (let y = top; y <= bottom; y++) {
        const n = vnoise(x, y, 7, 11);
        img.set(x, y, shade(nx < -0.35 ? shade(hair, 0.16) : nx > 0.4 ? shade(hair, -0.2) : hair, (n - 0.5) * 0.22));
      }
    }
    // a lock of hair falling across the forehead
    for (let i = 0; i < 16; i++) {
      const x = cx - 16 + i;
      const len = 4 + Math.round(Math.sin(i * 0.4) * 3);
      for (let k = 0; k < len; k++) img.set(x, hairline(x) + k, shade(hair, -0.08));
    }
    if (p.hairStyle === 'long') {
      for (let y = headTop + 6; y < 100; y++) {
        const w = 54 + Math.sin((y - headTop) * 0.06) * 4;
        for (const side of [-1, 1]) {
          for (let k = 0; k < 8; k++) {
            const x = cx + side * (w / 2 - k);
            const n = vnoise(x, y, 6, 13);
            img.set(Math.round(x), y, shade(side < 0 ? shade(hair, 0.1) : shade(hair, -0.2), (n - 0.5) * 0.26));
          }
        }
      }
    }
    if (p.hairStyle === 'tied') {
      for (let y = headTop + 4; y < 92; y++) {
        for (let k = 0; k < 10; k++) {
          const x = cx + 24 + k - Math.round(Math.sin(y * 0.05) * 3);
          if (y < headTop + 14 && k > 5) continue;
          const n = vnoise(x, y, 6, 17);
          img.set(x, y, shade(shade(hair, -0.12), (n - 0.5) * 0.26));
        }
      }
      img.rect(cx + 22, headTop + 18, 10, 4, '#584a38');
    }
  }

  // headgear
  if (p.hat === 'cap') {
    img.rect(cx - 26, headTop - 6, 52, 14, p.hatColor);
    img.hline(cx - 26, headTop - 6, 52, shade(p.hatColor, 0.2));
    for (let y = headTop + 6; y < headTop + 12; y++) img.rect(cx - 30, y, 58, 1, shade(p.hatColor, -0.2));
    img.rect(cx - 34, headTop + 10, 30, 5, shade(p.hatColor, -0.3));
    img.rect(cx - 6, headTop - 2, 12, 8, shade(p.hatColor, -0.1));
  }
  if (p.hat === 'brim') {
    img.rect(cx - 38, headTop + 8, 76, 6, shade(p.hatColor, -0.22));
    img.hline(cx - 38, headTop + 8, 76, shade(p.hatColor, 0.05));
    img.rect(cx - 24, headTop - 12, 48, 21, p.hatColor);
    img.hline(cx - 24, headTop - 12, 48, shade(p.hatColor, 0.22));
    img.rect(cx - 24, headTop + 1, 48, 5, shade(p.hatColor, -0.34));
  }
  if (p.hat === 'beanie') {
    img.rect(cx - 26, headTop - 10, 52, 22, p.hatColor);
    img.hline(cx - 26, headTop - 10, 52, shade(p.hatColor, 0.22));
    img.rect(cx - 27, headTop + 8, 54, 7, shade(p.hatColor, 0.08));
    img.hline(cx - 27, headTop + 14, 54, shade(p.hatColor, -0.3));
    for (let x = cx - 26; x < cx + 26; x += 4) img.vline(x, headTop - 10, 22, shade(p.hatColor, -0.1));
  }

  // rim light from the left keeps the bust off the backdrop
  for (let y = 20; y < H; y++) {
    for (let x = 6; x < W; x++) {
      if (img.get(x, y)[3] < 8) continue;
      if (img.get(x - 1, y)[3] < 8) break;
    }
  }
  for (let y = 24; y < H - 2; y++) {
    for (let x = 8; x < W - 8; x++) {
      const here = img.get(x, y), left = img.get(x - 2, y);
      const lum = c => c[0] + c[1] + c[2];
      if (lum(here) - lum(left) > 60) { img.shadeAt(x, y, 0.16); break; }
    }
  }

  img.grain(0.018, 23);
  return img;
}

const PEOPLE = {
  player: {
    skin: '#bd8a66', skinShade: '#92644a', hair: '#3a2c23', hairStyle: 'short',
    eye: '#3b4a3c', brow: '#2b211a', top: '#5b6349', collar: '#4a5240', stubble: true, backdrop: '#4c5348'
  },
  mara: {
    skin: '#c08f68', skinShade: '#96694b', hair: '#6a4a2e', hairStyle: 'tied',
    eye: '#4a5a3c', brow: '#4a3120', top: '#6f7a4e', collar: '#5c6642', backdrop: '#535c43'
  },
  lena: {
    skin: '#b3805e', skinShade: '#8a5f45', hair: '#2b2420', hairStyle: 'short',
    eye: '#3c3630', brow: '#241d19', top: '#d3d8d4', collar: '#8f9ba0', backdrop: '#48565a'
  },
  eli: {
    skin: '#a9764f', skinShade: '#80573a', hair: '#37281f', hairStyle: 'short', beard: true,
    eye: '#46392c', brow: '#2a1f18', top: '#4a5560', collar: '#3d4750',
    hat: 'cap', hatColor: '#5a4a38', backdrop: '#4a5058'
  },
  jonah: {
    skin: '#b98a63', skinShade: '#8e6548', hair: '#4a3b2b', hairStyle: 'short', stubble: true,
    eye: '#4a4030', brow: '#332618', top: '#7d6a4a', collar: '#6d5c45',
    hat: 'brim', hatColor: '#5d4f3a', backdrop: '#524a3c'
  }
};

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let n = 0;
  for (const [id, p] of Object.entries(PEOPLE)) {
    portrait(p).save(path.join(OUT, `${id}.png`), 26);
    n++;
  }
  console.log(`portraits: ${n}`);
}

main();
