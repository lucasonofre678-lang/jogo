// LAST COUNTY — pixel-art drawing helpers for the asset pipeline.
const { writePNG } = require('./png');

function hex(c) {
  if (Array.isArray(c)) return c;
  const s = c.replace('#', '');
  if (s.length === 8) return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), parseInt(s.slice(6, 8), 16)];
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), 255];
}

const clamp = (v, a = 0, b = 255) => (v < a ? a : v > b ? b : v);

// amount > 0 lightens, < 0 darkens. Keeps a little hue warmth on lighten.
function shade(c, amount) {
  const p = hex(c);
  const f = amount >= 0
    ? [p[0] + (255 - p[0]) * amount, p[1] + (255 - p[1]) * amount * 0.94, p[2] + (255 - p[2]) * amount * 0.82]
    : [p[0] * (1 + amount), p[1] * (1 + amount * 0.97), p[2] * (1 + amount * 0.9)];
  return [Math.round(clamp(f[0])), Math.round(clamp(f[1])), Math.round(clamp(f[2])), p[3]];
}

function mix(a, b, t) {
  const x = hex(a), y = hex(b);
  return [
    Math.round(x[0] + (y[0] - x[0]) * t),
    Math.round(x[1] + (y[1] - x[1]) * t),
    Math.round(x[2] + (y[2] - x[2]) * t),
    Math.round(x[3] + (y[3] - x[3]) * t)
  ];
}

// Deterministic hash noise in [0,1)
function hash(x, y, seed = 0) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (seed | 0) * 2246822519;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Smooth value noise (bilinear over a lattice)
function vnoise(x, y, scale, seed = 0) {
  const fx = x / scale, fy = y / scale;
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const tx = fx - x0, ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = hash(x0, y0, seed), b = hash(x0 + 1, y0, seed);
  const c = hash(x0, y0 + 1, seed), d = hash(x0 + 1, y0 + 1, seed);
  return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
}

class Img {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.data = new Uint8Array(w * h * 4);
  }

  idx(x, y) { return (y * this.w + x) * 4; }

  inside(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }

  set(x, y, c) {
    x |= 0; y |= 0;
    if (!this.inside(x, y)) return;
    const p = hex(c);
    if (p[3] === undefined) p[3] = 255;
    const o = this.idx(x, y);
    if (p[3] >= 255) { this.data[o] = p[0]; this.data[o + 1] = p[1]; this.data[o + 2] = p[2]; this.data[o + 3] = 255; return; }
    if (p[3] <= 0) return;
    const a = p[3] / 255;
    const da = this.data[o + 3] / 255;
    const oa = a + da * (1 - a);
    this.data[o] = Math.round((p[0] * a + this.data[o] * da * (1 - a)) / oa);
    this.data[o + 1] = Math.round((p[1] * a + this.data[o + 1] * da * (1 - a)) / oa);
    this.data[o + 2] = Math.round((p[2] * a + this.data[o + 2] * da * (1 - a)) / oa);
    this.data[o + 3] = Math.round(oa * 255);
  }

  get(x, y) {
    if (!this.inside(x, y)) return [0, 0, 0, 0];
    const o = this.idx(x, y);
    return [this.data[o], this.data[o + 1], this.data[o + 2], this.data[o + 3]];
  }

  // Only paints where a pixel already exists (for shading passes)
  shadeAt(x, y, amount) {
    if (!this.inside(x, y)) return;
    const o = this.idx(x, y);
    if (this.data[o + 3] < 8) return;
    const c = shade([this.data[o], this.data[o + 1], this.data[o + 2], 255], amount);
    this.data[o] = c[0]; this.data[o + 1] = c[1]; this.data[o + 2] = c[2];
  }

  fill(c) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) this.set(x, y, c); }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }

  outline(x, y, w, h, c) {
    for (let i = 0; i < w; i++) { this.set(x + i, y, c); this.set(x + i, y + h - 1, c); }
    for (let j = 0; j < h; j++) { this.set(x, y + j, c); this.set(x + w - 1, y + j, c); }
  }

  hline(x, y, w, c) { for (let i = 0; i < w; i++) this.set(x + i, y, c); }
  vline(x, y, h, c) { for (let j = 0; j < h; j++) this.set(x, y + j, c); }

  line(x0, y0, x1, y1, c) {
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  ellipse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / Math.max(0.5, rx), dy = (y - cy) / Math.max(0.5, ry);
        if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      }
    }
  }

  ellipseOutline(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / Math.max(0.5, rx), dy = (y - cy) / Math.max(0.5, ry);
        const d = dx * dx + dy * dy;
        if (d <= 1 && d > 0.48) this.set(x, y, c);
      }
    }
  }

  // Rounded-ish body blob used for characters and props
  blob(x, y, w, h, c) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const corner = (i === 0 || i === w - 1) && (j === 0 || j === h - 1);
        if (corner) continue;
        this.set(x + i, y + j, c);
      }
    }
  }

  // Per-pixel grain restricted to existing pixels
  grain(amount, seed = 0, area = null) {
    const [ax, ay, aw, ah] = area || [0, 0, this.w, this.h];
    for (let y = ay; y < ay + ah; y++) {
      for (let x = ax; x < ax + aw; x++) {
        const n = hash(x, y, seed);
        this.shadeAt(x, y, (n - 0.5) * 2 * amount);
      }
    }
  }

  // Blotchy weathering using smooth noise
  weather(scale, amount, seed = 0, area = null) {
    const [ax, ay, aw, ah] = area || [0, 0, this.w, this.h];
    for (let y = ay; y < ay + ah; y++) {
      for (let x = ax; x < ax + aw; x++) {
        const n = vnoise(x, y, scale, seed);
        this.shadeAt(x, y, (n - 0.5) * 2 * amount);
      }
    }
  }

  // Stains / moss / rust patches tinted toward a colour
  patches(color, scale, threshold, strength, seed = 0, area = null) {
    const [ax, ay, aw, ah] = area || [0, 0, this.w, this.h];
    for (let y = ay; y < ay + ah; y++) {
      for (let x = ax; x < ax + aw; x++) {
        const n = vnoise(x, y, scale, seed);
        if (n < threshold) continue;
        const t = Math.min(1, (n - threshold) / (1 - threshold)) * strength;
        const cur = this.get(x, y);
        if (cur[3] < 8) continue;
        this.set(x, y, [...mix(cur, color, t).slice(0, 3), 255]);
      }
    }
  }

  crack(x, y, len, dir, c, seed = 0) {
    let cx = x, cy = y, d = dir;
    for (let i = 0; i < len; i++) {
      this.set(Math.round(cx), Math.round(cy), c);
      d += (hash(i, seed, 7) - 0.5) * 1.1;
      cx += Math.cos(d); cy += Math.sin(d);
      if (cx < -2 || cy < -2 || cx > this.w + 2 || cy > this.h + 2) break;
    }
  }

  // Copies another image at x,y (alpha aware)
  blit(src, x, y, opts = {}) {
    const flip = opts.flip;
    for (let j = 0; j < src.h; j++) {
      for (let i = 0; i < src.w; i++) {
        const p = src.get(flip ? src.w - 1 - i : i, j);
        if (p[3] < 8) continue;
        this.set(x + i, y + j, p);
      }
    }
  }

  // Dark outline around opaque pixels (bottom/right heavier) — reads well on busy tiles
  contour(c = [12, 13, 15, 205], includeTop = true) {
    const src = new Uint8Array(this.data);
    const alphaAt = (x, y) => (x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : src[(y * this.w + x) * 4 + 3]);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (alphaAt(x, y) >= 8) continue;
        const near = alphaAt(x - 1, y) >= 8 || alphaAt(x + 1, y) >= 8 || alphaAt(x, y + 1) >= 8 || (includeTop && alphaAt(x, y - 1) >= 8);
        if (near) this.set(x, y, c);
      }
    }
  }

  // Top-light / bottom-shade pass on opaque silhouette
  volume(strength = 0.16) {
    const src = new Uint8Array(this.data);
    const alphaAt = (x, y) => (x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : src[(y * this.w + x) * 4 + 3]);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (alphaAt(x, y) < 8) continue;
        if (alphaAt(x, y - 1) < 8) this.shadeAt(x, y, strength);
        else if (alphaAt(x, y + 1) < 8) this.shadeAt(x, y, -strength * 1.25);
        if (alphaAt(x + 1, y) < 8) this.shadeAt(x, y, -strength * 0.6);
      }
    }
  }

  // Median-cut quantisation: keeps the art reading as deliberate pixel art
  // instead of per-pixel noise. Alpha is snapped to a few steps too.
  quantize(colors = 14, alphaSteps = 4) {
    const px = [];
    for (let i = 0; i < this.w * this.h; i++) {
      const o = i * 4;
      if (this.data[o + 3] < 8) continue;
      px.push([this.data[o], this.data[o + 1], this.data[o + 2]]);
    }
    if (!px.length) return this;

    let boxes = [px];
    while (boxes.length < colors) {
      let bi = -1, bestRange = -1;
      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i];
        if (b.length < 2) continue;
        let range = 0;
        for (let c = 0; c < 3; c++) {
          let lo = 255, hi = 0;
          for (const p of b) { if (p[c] < lo) lo = p[c]; if (p[c] > hi) hi = p[c]; }
          range = Math.max(range, (hi - lo) * (c === 1 ? 1.2 : c === 0 ? 1.0 : 0.8));
        }
        if (range > bestRange) { bestRange = range; bi = i; }
      }
      if (bi < 0 || bestRange <= 0) break;
      const box = boxes[bi];
      let ch = 0, best = -1;
      for (let c = 0; c < 3; c++) {
        let lo = 255, hi = 0;
        for (const p of box) { if (p[c] < lo) lo = p[c]; if (p[c] > hi) hi = p[c]; }
        if (hi - lo > best) { best = hi - lo; ch = c; }
      }
      box.sort((a, b) => a[ch] - b[ch]);
      const mid = box.length >> 1;
      boxes.splice(bi, 1, box.slice(0, mid), box.slice(mid));
    }

    const palette = boxes.filter(b => b.length).map(b => {
      const sum = [0, 0, 0];
      for (const p of b) { sum[0] += p[0]; sum[1] += p[1]; sum[2] += p[2]; }
      return [Math.round(sum[0] / b.length), Math.round(sum[1] / b.length), Math.round(sum[2] / b.length)];
    });

    const cache = new Map();
    for (let i = 0; i < this.w * this.h; i++) {
      const o = i * 4;
      if (this.data[o + 3] < 8) { this.data[o + 3] = 0; continue; }
      if (alphaSteps > 0 && this.data[o + 3] < 255) {
        const step = Math.round((this.data[o + 3] / 255) * alphaSteps) / alphaSteps;
        this.data[o + 3] = Math.max(24, Math.round(step * 255));
      }
      const k = (this.data[o] << 16) | (this.data[o + 1] << 8) | this.data[o + 2];
      let hit = cache.get(k);
      if (hit === undefined) {
        let bd = Infinity;
        for (const p of palette) {
          const dr = p[0] - this.data[o], dg = p[1] - this.data[o + 1], db = p[2] - this.data[o + 2];
          const d = dr * dr * 3 + dg * dg * 4 + db * db * 2;
          if (d < bd) { bd = d; hit = p; }
        }
        cache.set(k, hit);
      }
      this.data[o] = hit[0]; this.data[o + 1] = hit[1]; this.data[o + 2] = hit[2];
    }
    return this;
  }

  save(file, colors = 0) {
    if (colors) this.quantize(colors);
    writePNG(file, this.w, this.h, this.data);
    return this;
  }
}

module.exports = { Img, hex, shade, mix, hash, vnoise, clamp };
