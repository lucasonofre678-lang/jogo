// Renders real game frames to PNG using the headless canvas, so the world can
// be reviewed without a browser.
//   node tools/render.js out.png [tileX] [hour] [frames] [tileY]
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { Canvas, makeImageClass } = require('./canvas');

const ROOT = path.join(__dirname, '..');
const outFile = process.argv[2] || 'frame.png';
const spawnTile = process.argv[3] ? Number(process.argv[3]) : null;
const hour = process.argv[4] ? Number(process.argv[4]) : 10;
const warmFrames = process.argv[5] ? Number(process.argv[5]) : 12;
const spawnTileY = process.argv[6] ? Number(process.argv[6]) : null;   // optional: render underground

const listeners = new Map();
const elements = new Map();

function makeElement(tag = 'div', id = '') {
  if (tag === 'canvas') {
    const c = new Canvas(1280, 720);
    c.id = id;
    c.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
    c.style = new Proxy({ setProperty() {} }, { get: (t, k) => (k in t ? t[k] : ''), set: (t, k, v) => { t[k] = v; return true; } });
    c.addEventListener = () => {};
    c.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1280, height: 720 });
    c.focus = () => {};
    return c;
  }
  return {
    tagName: String(tag).toUpperCase(), id, className: '', textContent: '', innerHTML: '',
    value: '', dataset: {}, children: [], disabled: false, draggable: false,
    style: new Proxy({ setProperty() {} }, { get: (t, k) => (k in t ? t[k] : ''), set: (t, k, v) => { t[k] = v; return true; } }),
    classList: { _s: new Set(), add(...c) { c.forEach(x => this._s.add(x)); }, remove(...c) { c.forEach(x => this._s.delete(x)); }, toggle(c, on) { if (on === undefined) this._s.has(c) ? this._s.delete(c) : this._s.add(c); else if (on) this._s.add(c); else this._s.delete(c); }, contains(c) { return this._s.has(c); } },
    appendChild(c) { this.children.push(c); return c; },
    removeChild() {}, setAttribute() {}, getAttribute() { return null; },
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); },
    querySelectorAll: () => [], querySelector: () => null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    focus() {}, blur() {}, get offsetWidth() { return 100; }
  };
}

function getById(id) {
  if (!elements.has(id)) elements.set(id, makeElement(id === 'game' ? 'canvas' : 'div', id));
  return elements.get(id);
}

let now = 0;
const rafQueue = [];
const sandbox = {
  console,
  document: {
    getElementById: getById,
    createElement: makeElement,
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); },
    querySelectorAll: () => [],
    body: makeElement('body')
  },
  window: { addEventListener() {} },
  localStorage: (() => { const store = new Map(); return { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) }; })(),
  performance: { now: () => now },
  requestAnimationFrame: fn => { rafQueue.push(fn); return rafQueue.length; },
  Image: makeImageClass(ROOT),
  Math, Date, JSON, Map, Set, Array, Object, String, Number, Boolean, isNaN, parseInt, parseFloat,
  Uint8Array, Uint8ClampedArray, Int16Array, Float32Array,
  setTimeout: fn => fn(), clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {}
};
sandbox.globalThis = sandbox;
const context = vm.createContext(sandbox);

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const FILES = [...html.matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map(m => m[1]);
for (const file of FILES) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', file), 'utf8'), context, { filename: `js/${file}` });
}

vm.runInContext(`globalThis.__g = {
  CONFIG, world, player, camera, terrain, danger, society, vehicles, structures, lore,
  weather, survival, inventory, building, fx, lighting,
  get worldMinutes() { return worldMinutes; }, set worldMinutes(v) { worldMinutes = v; },
  set weatherCondition(v) { weather.condition = v; }
};`, context, { filename: 'bridge.js' });

const g = context.__g;
g.worldMinutes = hour * 60;

if (spawnTile != null) {
  g.player.x = spawnTile * g.CONFIG.TILE;
  g.player.y = (spawnTileY != null ? spawnTileY : g.world.groundY(spawnTile) - 2) * g.CONFIG.TILE - g.player.h;
  g.camera.x = g.player.x - 600;
  g.camera.y = g.player.y - 330;
}

// settle the camera and let animated systems reach a natural pose
for (let i = 0; i < warmFrames; i++) {
  now += 16;
  const fn = rafQueue.shift();
  if (fn) fn(now);
}

const canvas = getById('game');
canvas.save(path.isAbsolute(outFile) ? outFile : path.join(process.cwd(), outFile));
console.log(`rendered ${outFile} @ tile ${spawnTile ?? Math.round(g.player.x / g.CONFIG.TILE)}, ${hour}h`);
