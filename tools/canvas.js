// Minimal software Canvas2D — enough of the API for the game's renderer to run
// headless, so the world can be exported to a PNG and reviewed.
const { readPNG, writePNG } = require('./png');
const fs = require('fs');
const path = require('path');

function parseColor(c) {
  if (typeof c !== 'string') return [255, 0, 255, 255];
  c = c.trim();
  if (c.startsWith('#')) {
    const h = c.slice(1);
    if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16), 255];
    if (h.length === 6) return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 255];
    if (h.length === 8) return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), parseInt(h.slice(6, 8), 16)];
  }
  let m = c.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(',').map(v => parseFloat(v));
    return [p[0] | 0, p[1] | 0, p[2] | 0, p.length > 3 ? Math.round(p[3] * 255) : 255];
  }
  return [255, 0, 255, 255];
}

class Gradient {
  constructor(kind, coords) { this.kind = kind; this.coords = coords; this.stops = []; }
  addColorStop(offset, color) { this.stops.push([offset, parseColor(color)]); this.stops.sort((a, b) => a[0] - b[0]); }
  sample(t) {
    if (!this.stops.length) return [0, 0, 0, 0];
    if (t <= this.stops[0][0]) return this.stops[0][1];
    if (t >= this.stops[this.stops.length - 1][0]) return this.stops[this.stops.length - 1][1];
    for (let i = 1; i < this.stops.length; i++) {
      const [o1, c1] = this.stops[i - 1], [o2, c2] = this.stops[i];
      if (t <= o2) {
        const f = (t - o1) / Math.max(1e-6, o2 - o1);
        return [0, 1, 2, 3].map(k => Math.round(c1[k] + (c2[k] - c1[k]) * f));
      }
    }
    return this.stops[this.stops.length - 1][1];
  }
  at(x, y) {
    if (this.kind === 'linear') {
      const [x0, y0, x1, y1] = this.coords;
      const dx = x1 - x0, dy = y1 - y0;
      const len2 = dx * dx + dy * dy || 1;
      return this.sample(((x - x0) * dx + (y - y0) * dy) / len2);
    }
    const [x0, y0, r0, x1, y1, r1] = this.coords;
    const d = Math.hypot(x - x1, y - y1);
    return this.sample((d - r0) / Math.max(1e-6, r1 - r0));
  }
}

class Matrix {
  constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) { Object.assign(this, { a, b, c, d, e, f }); }
  clone() { return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f); }
  translate(x, y) { this.e += this.a * x + this.c * y; this.f += this.b * x + this.d * y; }
  scale(x, y) { this.a *= x; this.b *= x; this.c *= y; this.d *= y; }
  rotate(r) {
    const cos = Math.cos(r), sin = Math.sin(r);
    const a = this.a * cos + this.c * sin, b = this.b * cos + this.d * sin;
    const c = this.a * -sin + this.c * cos, d = this.b * -sin + this.d * cos;
    this.a = a; this.b = b; this.c = c; this.d = d;
  }
  apply(x, y) { return [this.a * x + this.c * y + this.e, this.b * x + this.d * y + this.f]; }
  invert() {
    const det = this.a * this.d - this.b * this.c || 1e-9;
    const a = this.d / det, b = -this.b / det, c = -this.c / det, d = this.a / det;
    return new Matrix(a, b, c, d, -(this.e * a + this.f * c), -(this.e * b + this.f * d));
  }
}

class Context2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.data = canvas._data;
    this.w = canvas.width;
    this.h = canvas.height;
    this.m = new Matrix();
    this.stack = [];
    this.fillStyle = '#000';
    this.strokeStyle = '#000';
    this.lineWidth = 1;
    this.globalAlpha = 1;
    this.globalCompositeOperation = 'source-over';
    this.font = '';
    this.textAlign = 'left';
    this.imageSmoothingEnabled = true;
    this._path = [];
  }

  save() { this.stack.push({ m: this.m.clone(), fillStyle: this.fillStyle, strokeStyle: this.strokeStyle, globalAlpha: this.globalAlpha, lineWidth: this.lineWidth, gco: this.globalCompositeOperation, textAlign: this.textAlign }); }
  restore() {
    const s = this.stack.pop();
    if (!s) return;
    this.m = s.m; this.fillStyle = s.fillStyle; this.strokeStyle = s.strokeStyle;
    this.globalAlpha = s.globalAlpha; this.lineWidth = s.lineWidth;
    this.globalCompositeOperation = s.gco; this.textAlign = s.textAlign;
  }
  translate(x, y) { this.m.translate(x, y); }
  scale(x, y) { this.m.scale(x, y); }
  rotate(r) { this.m.rotate(r); }
  setTransform(a, b, c, d, e, f) { this.m = new Matrix(a, b, c, d, e, f); }

  _blend(x, y, c, alpha) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const a = (c[3] / 255) * alpha;
    if (a <= 0) return;
    const o = (y * this.w + x) * 4;
    const d = this.data;
    if (this.globalCompositeOperation === 'lighter') {
      d[o] = Math.min(255, d[o] + c[0] * a);
      d[o + 1] = Math.min(255, d[o + 1] + c[1] * a);
      d[o + 2] = Math.min(255, d[o + 2] + c[2] * a);
      d[o + 3] = 255;
      return;
    }
    d[o] = c[0] * a + d[o] * (1 - a);
    d[o + 1] = c[1] * a + d[o + 1] * (1 - a);
    d[o + 2] = c[2] * a + d[o + 2] * (1 - a);
    d[o + 3] = Math.max(d[o + 3], Math.round(a * 255));
  }

  _fillPolygon(pts, style) {
    const grad = style instanceof Gradient ? style : null;
    const color = grad ? null : parseColor(style);
    let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
    for (const [x, y] of pts) {
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    }
    minY = Math.max(0, Math.floor(minY)); maxY = Math.min(this.h - 1, Math.ceil(maxY));
    for (let y = minY; y <= maxY; y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
          xs.push(x1 + ((y + 0.5 - y1) / (y2 - y1)) * (x2 - x1));
        }
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const x0 = Math.max(0, Math.floor(xs[i])), x1 = Math.min(this.w - 1, Math.ceil(xs[i + 1]) - 1);
        for (let x = x0; x <= x1; x++) this._blend(x, y, grad ? grad.at(x, y) : color, this.globalAlpha);
      }
    }
  }

  fillRect(x, y, w, h) {
    const p = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => this.m.apply(px, py));
    this._fillPolygon(p, this.fillStyle);
  }
  clearRect(x, y, w, h) {
    const saved = this.fillStyle, a = this.globalAlpha;
    this.fillStyle = 'rgba(0,0,0,0)';
    const p = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => this.m.apply(px, py));
    let minX = Math.max(0, Math.floor(Math.min(...p.map(q => q[0]))));
    let maxX = Math.min(this.w - 1, Math.ceil(Math.max(...p.map(q => q[0]))));
    let minY = Math.max(0, Math.floor(Math.min(...p.map(q => q[1]))));
    let maxY = Math.min(this.h - 1, Math.ceil(Math.max(...p.map(q => q[1]))));
    for (let yy = minY; yy <= maxY; yy++) for (let xx = minX; xx <= maxX; xx++) {
      const o = (yy * this.w + xx) * 4;
      this.data[o] = 0; this.data[o + 1] = 0; this.data[o + 2] = 0; this.data[o + 3] = 0;
    }
    this.fillStyle = saved; this.globalAlpha = a;
  }
  strokeRect(x, y, w, h) {
    const s = this.fillStyle;
    this.fillStyle = this.strokeStyle;
    const lw = Math.max(1, this.lineWidth);
    this.fillRect(x, y, w, lw); this.fillRect(x, y + h - lw, w, lw);
    this.fillRect(x, y, lw, h); this.fillRect(x + w - lw, y, lw, h);
    this.fillStyle = s;
  }

  drawImage(img, ...a) {
    if (!img || !img._px) return;
    let sx = 0, sy = 0, sw = img.width, sh = img.height, dx, dy, dw, dh;
    if (a.length === 2) { [dx, dy] = a; dw = sw; dh = sh; }
    else if (a.length === 4) { [dx, dy, dw, dh] = a; }
    else { [sx, sy, sw, sh, dx, dy, dw, dh] = a; }
    if (dw <= 0 || dh <= 0) return;

    const corners = [[dx, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx, dy + dh]].map(([x, y]) => this.m.apply(x, y));
    const minX = Math.max(0, Math.floor(Math.min(...corners.map(c => c[0]))));
    const maxX = Math.min(this.w - 1, Math.ceil(Math.max(...corners.map(c => c[0]))));
    const minY = Math.max(0, Math.floor(Math.min(...corners.map(c => c[1]))));
    const maxY = Math.min(this.h - 1, Math.ceil(Math.max(...corners.map(c => c[1]))));
    const inv = this.m.invert();

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const [lx, ly] = inv.apply(x + 0.5, y + 0.5);
        const u = (lx - dx) / dw, v = (ly - dy) / dh;
        if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
        const px = Math.min(img.width - 1, Math.max(0, Math.floor(sx + u * sw)));
        const py = Math.min(img.height - 1, Math.max(0, Math.floor(sy + v * sh)));
        const o = (py * img.width + px) * 4;
        const src = img._px;
        this._blend(x, y, [src[o], src[o + 1], src[o + 2], src[o + 3]], this.globalAlpha);
      }
    }
  }

  beginPath() { this._path = []; this._sub = []; }
  closePath() { if (this._sub && this._sub.length) { this._path.push(this._sub); this._sub = []; } }
  moveTo(x, y) { if (this._sub && this._sub.length) this._path.push(this._sub); this._sub = [this.m.apply(x, y)]; }
  lineTo(x, y) { if (!this._sub) this._sub = []; this._sub.push(this.m.apply(x, y)); }
  quadraticCurveTo(cx, cy, x, y) {
    if (!this._sub || !this._sub.length) return this.moveTo(x, y);
    const [x0, y0] = this._sub[this._sub.length - 1];
    const [tcx, tcy] = this.m.apply(cx, cy), [tx, ty] = this.m.apply(x, y);
    for (let i = 1; i <= 8; i++) {
      const t = i / 8, mt = 1 - t;
      this._sub.push([mt * mt * x0 + 2 * mt * t * tcx + t * t * tx, mt * mt * y0 + 2 * mt * t * tcy + t * t * ty]);
    }
  }
  arc(cx, cy, r, a0, a1) {
    if (!this._sub) this._sub = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = a0 + (a1 - a0) * (i / steps);
      this._sub.push(this.m.apply(cx + Math.cos(t) * r, cy + Math.sin(t) * r));
    }
  }
  ellipse(cx, cy, rx, ry, rot, a0, a1) {
    if (this._sub && this._sub.length) { this._path.push(this._sub); }
    this._sub = [];
    const steps = 22;
    for (let i = 0; i <= steps; i++) {
      const t = a0 + (a1 - a0) * (i / steps);
      this._sub.push(this.m.apply(cx + Math.cos(t) * rx, cy + Math.sin(t) * ry));
    }
  }
  fill() {
    this.closePath();
    for (const sub of this._path) if (sub.length > 2) this._fillPolygon(sub, this.fillStyle);
  }
  stroke() {
    this.closePath();
    const color = this.strokeStyle instanceof Gradient ? null : parseColor(this.strokeStyle);
    const lw = Math.max(1, Math.round(this.lineWidth));
    for (const sub of this._path) {
      for (let i = 0; i + 1 < sub.length; i++) {
        const [x0, y0] = sub[i], [x1, y1] = sub[i + 1];
        const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
        for (let k = 0; k <= steps; k++) {
          const x = x0 + (x1 - x0) * (k / steps), y = y0 + (y1 - y0) * (k / steps);
          for (let oy = 0; oy < lw; oy++) for (let ox = 0; ox < lw; ox++) {
            this._blend(x + ox - (lw >> 1), y + oy - (lw >> 1), color || this.strokeStyle.at(x, y), this.globalAlpha);
          }
        }
      }
    }
  }
  clip() {}
  createLinearGradient(x0, y0, x1, y1) { return new Gradient('linear', [x0, y0, x1, y1]); }
  createRadialGradient(x0, y0, r0, x1, y1, r1) { return new Gradient('radial', [x0, y0, r0, x1, y1, r1]); }
  createPattern() { return null; }
  measureText(t) { return { width: String(t).length * 6 }; }
  // Blocky stand-in so HUD text occupies the right space in exported frames.
  fillText(text, x, y) {
    const s = String(text);
    const color = parseColor(this.fillStyle instanceof Gradient ? '#ded6c0' : this.fillStyle);
    const startX = this.textAlign === 'center' ? x - s.length * 3 : x;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === ' ') continue;
      for (let oy = 0; oy < 7; oy++) {
        for (let ox = 0; ox < 4; ox++) {
          if ((i * 7 + ox * 3 + oy * 5) % 4 === 0) continue;
          const [px, py] = this.m.apply(startX + i * 6 + ox, y - 7 + oy);
          this._blend(px, py, color, this.globalAlpha * 0.9);
        }
      }
    }
  }
  strokeText() {}
  createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  getImageData(x, y, w, h) { return this.createImageData(w, h); }
  putImageData(img, dx, dy) {
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const o = (y * img.width + x) * 4;
        const tx = dx + x, ty = dy + y;
        if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
        const d = (ty * this.w + tx) * 4;
        this.data[d] = img.data[o];
        this.data[d + 1] = img.data[o + 1];
        this.data[d + 2] = img.data[o + 2];
        this.data[d + 3] = img.data[o + 3];
      }
    }
  }
}

class Canvas {
  constructor(w = 300, h = 150) {
    this._w = w; this._h = h;
    this._data = new Uint8ClampedArray(w * h * 4);
    this._ctx = null;
  }
  get width() { return this._w; }
  set width(v) { this._w = v; this._data = new Uint8ClampedArray(this._w * this._h * 4); this._ctx = null; }
  get height() { return this._h; }
  set height(v) { this._h = v; this._data = new Uint8ClampedArray(this._w * this._h * 4); this._ctx = null; }
  getContext() { if (!this._ctx) this._ctx = new Context2D(this); return this._ctx; }
  get _px() { return this._data; }
  save(file) {
    const out = new Uint8Array(this._data.length);
    out.set(this._data);
    writePNG(file, this._w, this._h, out);
  }
}

// Images resolve straight off disk, synchronously.
function makeImageClass(root) {
  return class HeadlessImage {
    constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; this.width = 0; this.height = 0; this._px = null; this._handlers = {}; }
    addEventListener(type, fn) { this._handlers[type] = fn; }
    set src(v) {
      this._src = v;
      const file = path.join(root, v);
      try {
        const { w, h, px } = readPNG(file);
        this.width = w; this.height = h;
        this.naturalWidth = w; this.naturalHeight = h;
        this._px = px;
        this.complete = true;
        if (this._handlers.load) this._handlers.load();
      } catch (e) {
        this.complete = true;
        if (this._handlers.error) this._handlers.error();
      }
    }
    get src() { return this._src; }
  };
}

module.exports = { Canvas, Context2D, makeImageClass, parseColor };
