// Terrain renderer.
//
// The world is drawn through cached chunk canvases: every decorative pass
// (background walls, material blending, grass tufts, ambient occlusion) is
// baked once per chunk instead of per frame, which is what lets the world look
// hand-dressed without costing anything in the game loop.

const CHUNK_TILES_X = CONFIG.CHUNK_W;
const CHUNK_TILES_Y = CONFIG.CHUNK_H;
const CHUNK_PX_W = CHUNK_TILES_X * CONFIG.TILE;
const CHUNK_PX_H = CHUNK_TILES_Y * CONFIG.TILE;

function hash2(x, y, s) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (s | 0) * 2246822519;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Back walls that are room finishes (wallpaper, tile, lab panels) are dimmed
// less than raw masonry, so interiors read as rooms instead of dark boxes.
const INTERIOR_FINISH = new Set([TILE.WALLPAPER, TILE.WALLPAPER_WARM, TILE.WALLPAPER_BLUE, TILE.CARPET_BLUE, TILE.PEELING_WALL, TILE.PLASTER, TILE.WALL_TILE, TILE.STATION_TILE,
  TILE.LAB_WALL, TILE.CONTAINMENT, TILE.TECH_PANEL, TILE.CARPET, TILE.CERAMIC, TILE.OLD_WOOD, TILE.PLANK, TILE.PAINTED_WOOD]);
const WET_REGIONS = new Set(['coldwood', 'pasture', 'ridge', 'cedar']);
const METALS = new Set([TILE.METAL, TILE.RUST_METAL, TILE.ROOF_METAL, TILE.SHEET_METAL, TILE.CHAIN_FENCE, TILE.DARK_METAL]);

class TerrainRenderer {
  constructor(world) {
    this.world = world;
    this.chunks = new Map();
    this.order = [];
    this.maxChunks = 220;
    this.wallCache = new Map();
    this.built = 0;

    world.addListener((x, y) => this.invalidateAround(x, y));
    // Rebuilding on every single image load would thrash the cache while the
    // atlas streams in, so only flush once decoding has settled.
    let flush = null;
    ASSETS.onProgress((version, pending) => {
      if (flush) clearTimeout(flush);
      flush = setTimeout(() => { flush = null; this.invalidateAll(); }, pending > 0 ? 120 : 0);
    });
  }

  key(cx, cy) { return cy * 4096 + cx; }

  invalidateAll() {
    this.chunks.clear();
    this.order.length = 0;
    this.wallCache.clear();
  }

  invalidate(cx, cy) {
    const k = this.key(cx, cy);
    if (this.chunks.has(k)) {
      this.chunks.delete(k);
      const i = this.order.indexOf(k);
      if (i >= 0) this.order.splice(i, 1);
    }
  }

  // A tile edit can change the look of its neighbours (blends, tufts, AO).
  invalidateAround(x, y) {
    const cx = Math.floor(x / CHUNK_TILES_X);
    const cy = Math.floor(y / CHUNK_TILES_Y);
    this.invalidate(cx, cy);
    if (x % CHUNK_TILES_X === 0) this.invalidate(cx - 1, cy);
    if (x % CHUNK_TILES_X === CHUNK_TILES_X - 1) this.invalidate(cx + 1, cy);
    if (y % CHUNK_TILES_Y === 0) this.invalidate(cx, cy - 1);
    if (y % CHUNK_TILES_Y === CHUNK_TILES_Y - 1) this.invalidate(cx, cy + 1);
  }

  // Background copy of a tile: darker, desaturated, slightly blue.
  wallImage(tileId, variant) {
    const k = tileId * 8 + variant;
    let c = this.wallCache.get(k);
    if (c) return c;
    const src = ASSETS.ready(`tile:${tileId}:${variant}`);
    if (!src) return null;
    c = document.createElement('canvas');
    c.width = CONFIG.TILE;
    c.height = CONFIG.TILE;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(src, 0, 0, CONFIG.TILE, CONFIG.TILE);
    cx.globalCompositeOperation = 'source-atop';
    // interior finishes stay readable so every room keeps its own colour
    cx.fillStyle = INTERIOR_FINISH.has(tileId) ? 'rgba(18,20,24,0.42)' : 'rgba(18,22,28,0.62)';
    cx.fillRect(0, 0, CONFIG.TILE, CONFIG.TILE);
    cx.globalCompositeOperation = 'source-over';
    this.wallCache.set(k, c);
    return c;
  }

  variantFor(x, y) {
    return ASSETS.variant(x, y);
  }

  getChunk(cx, cy) {
    const k = this.key(cx, cy);
    let chunk = this.chunks.get(k);
    if (chunk) return chunk;

    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_PX_W;
    canvas.height = CHUNK_PX_H;
    chunk = { canvas, ctx: canvas.getContext('2d') };
    this.renderChunk(chunk, cx, cy);
    this.chunks.set(k, chunk);
    this.order.push(k);
    this.built++;

    while (this.order.length > this.maxChunks) {
      const old = this.order.shift();
      this.chunks.delete(old);
    }
    return chunk;
  }

  renderChunk(chunk, cx, cy) {
    const w = this.world;
    const ctx = chunk.ctx;
    const T = CONFIG.TILE;
    const x0 = cx * CHUNK_TILES_X;
    const y0 = cy * CHUNK_TILES_Y;

    ctx.clearRect(0, 0, CHUNK_PX_W, CHUNK_PX_H);
    ctx.imageSmoothingEnabled = false;

    // ---- pass 1: background walls -------------------------------------
    for (let ty = 0; ty < CHUNK_TILES_Y; ty++) {
      for (let tx = 0; tx < CHUNK_TILES_X; tx++) {
        const x = x0 + tx, y = y0 + ty;
        const wall = w.getWall(x, y);
        if (!wall) continue;
        const img = this.wallImage(wall, this.variantFor(x, y));
        if (img) ctx.drawImage(img, tx * T, ty * T);
      }
    }

    // ---- pass 2: foreground tiles -------------------------------------
    for (let ty = 0; ty < CHUNK_TILES_Y; ty++) {
      for (let tx = 0; tx < CHUNK_TILES_X; tx++) {
        const x = x0 + tx, y = y0 + ty;
        const t = w.get(x, y);
        if (t === TILE.AIR) continue;
        const img = ASSETS.tile(t, x, y);
        const px = tx * T, py = ty * T;
        if (img) ctx.drawImage(img, px, py, T, T);
        else {
          ctx.fillStyle = TILE_INFO[t]?.color || '#555';
          ctx.fillRect(px, py, T, T);
        }
      }
    }

    // ---- pass 2.5: wear and weathering --------------------------------
    // Procedural variants on top of the three atlas variants: brightness
    // drift, mottling, cracks, moss, rust runs, water stains, grime and
    // hanging growth. Driven by position, region and the structure wear map,
    // so no two walls in a row repeat and ruined buildings look ruined.
    this.renderWear(ctx, x0, y0);

    // ---- pass 3: material blending ------------------------------------
    // Softens the seam where two different materials meet so the terrain
    // stops reading as a spreadsheet of squares.
    for (let ty = 0; ty < CHUNK_TILES_Y; ty++) {
      for (let tx = 0; tx < CHUNK_TILES_X; tx++) {
        const x = x0 + tx, y = y0 + ty;
        const t = w.get(x, y);
        if (t === TILE.AIR) continue;
        const px = tx * T, py = ty * T;

        const above = w.get(x, y - 1);
        if (above !== TILE.AIR && TILE_INFO[above]?.solid && tileGroup(above) !== tileGroup(t)) {
          const src = ASSETS.tile(above, x, y - 1);
          if (src) this.blendDown(ctx, src, px, py, x, y);
        }
        const left = w.get(x - 1, y);
        if (left !== TILE.AIR && TILE_INFO[left]?.solid && tileGroup(left) !== tileGroup(t)) {
          const src = ASSETS.tile(left, x - 1, y);
          if (src) this.blendSide(ctx, src, px, py, x, y, 1);
        }
        const right = w.get(x + 1, y);
        if (right !== TILE.AIR && TILE_INFO[right]?.solid && tileGroup(right) !== tileGroup(t)) {
          const src = ASSETS.tile(right, x + 1, y);
          if (src) this.blendSide(ctx, src, px, py, x, y, -1);
        }
      }
    }

    // ---- pass 4: tufts, ambient occlusion, edge light ------------------
    for (let ty = 0; ty < CHUNK_TILES_Y; ty++) {
      for (let tx = 0; tx < CHUNK_TILES_X; tx++) {
        const x = x0 + tx, y = y0 + ty;
        const t = w.get(x, y);
        const px = tx * T, py = ty * T;

        if (t === TILE.AIR) {
          const below = w.get(x, y + 1);
          const tuft = TILE_TUFT[below];
          if (tuft) this.drawTufts(ctx, px, py, x, y, tuft);
          this.drawAO(ctx, px, py, x, y);
          continue;
        }

        // rim light on exposed tops, contact shadow under overhangs
        if (w.get(x, y - 1) === TILE.AIR && TILE_INFO[t]?.solid) {
          ctx.fillStyle = 'rgba(232,226,198,0.09)';
          ctx.fillRect(px, py, T, 2);
        }
        if (w.get(x, y + 1) !== TILE.AIR && TILE_INFO[t]?.solid) {
          ctx.fillStyle = 'rgba(0,0,0,0.10)';
          ctx.fillRect(px, py + T - 2, T, 2);
        }
      }
    }
  }

  renderWear(ctx, x0, y0) {
    const w = this.world;
    const T = CONFIG.TILE;
    const wearMap = w.wear;
    for (let ty = 0; ty < CHUNK_TILES_Y; ty++) {
      for (let tx = 0; tx < CHUNK_TILES_X; tx++) {
        const x = x0 + tx, y = y0 + ty;
        if (x < 0 || x >= CONFIG.WORLD_W || y < 0 || y >= CONFIG.WORLD_H) continue;
        const px = tx * T, py = ty * T;
        const t = w.get(x, y);
        const wear = wearMap ? wearMap[x] / 255 : 0.2;
        const h = hash2(x, y, 21);
        if (t !== TILE.AIR) {
          if (!TILE_INFO[t]?.solid) continue;
          const g = tileGroup(t);
          if (g === 'veg' || g === 'water') continue;
          // brightness drift + low-frequency mottling
          const m = hash2(x >> 2, y >> 2, 23);
          const d = (h - 0.5) * 0.1 + (m - 0.5) * 0.08;
          ctx.fillStyle = d < 0 ? `rgba(0,0,0,${(-d).toFixed(3)})` : `rgba(255,248,230,${(d * 0.6).toFixed(3)})`;
          ctx.fillRect(px, py, T, T);
          const above = w.get(x, y - 1);
          if ((g === 'built' || g === 'rock') && h < 0.05 + wear * 0.12) this.drawCrack(ctx, px, py, x, y);
          // moss on exposed stone and masonry in the damp regions
          if ((g === 'rock' || t === TILE.BRICK || t === TILE.OLD_BRICK || t === TILE.OLD_CONCRETE) && above === TILE.AIR &&
            WET_REGIONS.has(w.region(x).id) && hash2(x, y, 25) < 0.55) {
            for (let i = 0; i < 5; i++) {
              const mx = px + Math.floor(hash2(x * 3 + i, y, 27) * 28);
              ctx.fillStyle = i % 2 ? 'rgba(92,128,66,0.75)' : 'rgba(70,102,52,0.7)';
              ctx.fillRect(mx, py, 3 + (i % 3), 2 + (i % 2));
            }
          }
          // rust runs under metal
          if (METALS.has(above) && !METALS.has(t) && g === 'built' && h < 0.6) {
            for (let i = 0; i < 3; i++) {
              const rx = px + Math.floor(hash2(x, y * 5 + i, 29) * 30);
              ctx.fillStyle = 'rgba(122,70,38,0.35)';
              ctx.fillRect(rx, py, 2, 6 + Math.floor(hash2(x + i, y, 31) * 14));
            }
          }
          continue;
        }
        const wall = w.getWall(x, y);
        if (wall) {
          const up = w.get(x, y - 1), down = w.get(x, y + 1);
          // water stains under ceilings — more of them where the roof has gone
          if (up !== TILE.AIR && TILE_INFO[up]?.solid && h < 0.18 + wear * 0.4) {
            const sx = px + Math.floor(hash2(x, y, 33) * 20);
            const len = 10 + Math.floor(hash2(x, y, 35) * 22);
            const sw = 4 + Math.floor(hash2(x, y, 37) * 7);
            for (let k = 0; k < len; k += 2) {
              ctx.fillStyle = `rgba(58,44,26,${(0.22 * (1 - k / len)).toFixed(3)})`;
              ctx.fillRect(sx + Math.round(Math.sin(k * 0.4 + x)), py + k, sw - Math.floor(k / len * 3), 2);
            }
          }
          // grime line where the wall meets the floor
          if (down !== TILE.AIR && TILE_INFO[down]?.solid) {
            ctx.fillStyle = 'rgba(20,16,12,0.16)';
            ctx.fillRect(px, py + T - 7, T, 7);
            ctx.fillStyle = 'rgba(20,16,12,0.12)';
            ctx.fillRect(px, py + T - 3, T, 3);
          }
          // damp and soot on ruined or buried walls
          const buried = y > w.surface[x] + 8;
          if (h > 1 - wear * 0.35 || (buried && h > 0.82)) {
            ctx.fillStyle = buried ? 'rgba(30,48,44,0.13)' : 'rgba(22,20,18,0.15)';
            ctx.beginPath();
            ctx.ellipse(px + 16, py + 16, 10 + h * 8, 7 + h * 6, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          // growth creeping down from a broken roof
          if (up !== TILE.AIR && tileGroup(up) === 'built' && wear > 0.4 && hash2(x, y, 39) < wear * 0.3) this.drawVines(ctx, px, py, x, y);
        } else if (y < w.surface[x]) {
          // outdoors: vines hanging off eaves and ledges of abandoned buildings
          const up = w.get(x, y - 1);
          if (up !== TILE.AIR && (tileGroup(up) === 'built' || tileGroup(up) === 'wood') && hash2(x, y, 41) < 0.1 + wear * 0.25) this.drawVines(ctx, px, py, x, y);
        }
      }
    }
  }

  drawCrack(ctx, px, py, x, y) {
    ctx.strokeStyle = 'rgba(18,16,14,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    let cx = px + 4 + hash2(x, y, 43) * 24, cy = py + 2;
    ctx.moveTo(cx, cy);
    for (let i = 0; i < 4; i++) {
      cx += (hash2(x, y * 3 + i, 45) - 0.5) * 12;
      cy += 5 + hash2(x + i, y, 47) * 6;
      ctx.lineTo(Math.max(px, Math.min(px + 31, cx)), Math.min(py + 31, cy));
    }
    ctx.stroke();
  }

  drawVines(ctx, px, py, x, y) {
    for (let i = 0; i < 3; i++) {
      const vx = px + 3 + Math.floor(hash2(x * 7 + i, y, 49) * 26);
      const len = 6 + Math.floor(hash2(x, y * 7 + i, 51) * 20);
      ctx.fillStyle = 'rgba(66,96,52,0.85)';
      ctx.fillRect(vx, py, 1, len);
      for (let k = 3; k < len; k += 4) {
        ctx.fillStyle = k % 8 ? 'rgba(84,122,60,0.9)' : 'rgba(104,140,70,0.9)';
        ctx.fillRect(vx + (k % 8 ? -1 : 1), py + k, 2, 2);
      }
    }
  }

  // Interlocking dithered band of the upper material spilling onto this tile.
  blendDown(ctx, src, px, py, x, y) {
    const T = CONFIG.TILE;
    for (let i = 0; i < T; i += 2) {
      const h = 2 + Math.round(hash2(x * 32 + i, y, 7) * 6);
      ctx.drawImage(src, i, T - h, 2, h, px + i, py, 2, h);
    }
  }

  blendSide(ctx, src, px, py, x, y, dir) {
    const T = CONFIG.TILE;
    for (let i = 0; i < T; i += 2) {
      const wdt = 1 + Math.round(hash2(x, y * 32 + i, 11) * 4);
      const sx = dir > 0 ? T - wdt : 0;
      const dx = dir > 0 ? px : px + T - wdt;
      ctx.drawImage(src, sx, i, wdt, 2, dx, py + i, wdt, 2);
    }
  }

  drawTufts(ctx, px, py, x, y, tuft) {
    const T = CONFIG.TILE;
    const count = tuft.sparse ? 3 : 7;
    for (let i = 0; i < count; i++) {
      const r = hash2(x, y * 7 + i, 3);
      if (tuft.sparse && r > 0.45) continue;
      const bx = px + Math.floor(hash2(x * 5 + i, y, 5) * T);
      const h = Math.max(2, Math.round((tuft.height || 6) * (0.45 + r * 0.75)));
      const lean = hash2(x + i, y, 13) > 0.5 ? 1 : -1;
      ctx.fillStyle = tuft.color;
      ctx.fillRect(bx, py + T - h, 1, h);
      if (h > 3) ctx.fillRect(bx + lean, py + T - h - 1, 1, 2);
      ctx.fillStyle = tuft.tip;
      ctx.fillRect(bx + (h > 3 ? lean : 0), py + T - h - (h > 3 ? 1 : 0), 1, 1);
    }
  }

  // Soft occlusion inside the empty tile next to solid neighbours.
  drawAO(ctx, px, py, x, y) {
    const T = CONFIG.TILE;
    const w = this.world;
    const solid = (dx, dy) => {
      const t = w.get(x + dx, y + dy);
      return t !== TILE.AIR && TILE_INFO[t]?.solid;
    };
    const hasWall = w.getWall(x, y) !== TILE.AIR;
    const strength = hasWall ? 1 : 0.55;
    if (!hasWall && !solid(0, -1) && !solid(-1, 0) && !solid(1, 0) && !solid(0, 1)) return;

    for (let i = 0; i < 3; i++) {
      const a = (0.16 - i * 0.05) * strength;
      if (a <= 0) continue;
      ctx.fillStyle = `rgba(0,0,0,${a.toFixed(3)})`;
      const s = 4 + i * 3;
      if (solid(0, -1)) ctx.fillRect(px, py, T, s);
      if (solid(0, 1)) ctx.fillRect(px, py + T - s, T, s);
      if (solid(-1, 0)) ctx.fillRect(px, py, s, T);
      if (solid(1, 0)) ctx.fillRect(px + T - s, py, s, T);
    }
  }

  draw(ctx, cameraX, cameraY, viewW, viewH) {
    const T = CONFIG.TILE;
    const cx0 = Math.floor(cameraX / CHUNK_PX_W);
    const cx1 = Math.floor((cameraX + viewW) / CHUNK_PX_W);
    const cy0 = Math.floor(cameraY / CHUNK_PX_H);
    const cy1 = Math.floor((cameraY + viewH) / CHUNK_PX_H);
    const maxCX = Math.ceil(CONFIG.WORLD_W / CHUNK_TILES_X);
    const maxCY = Math.ceil(CONFIG.WORLD_H / CHUNK_TILES_Y);

    ctx.imageSmoothingEnabled = false;
    for (let cy = Math.max(0, cy0); cy <= Math.min(maxCY - 1, cy1); cy++) {
      for (let cx = Math.max(0, cx0); cx <= Math.min(maxCX - 1, cx1); cx++) {
        const chunk = this.getChunk(cx, cy);
        ctx.drawImage(chunk.canvas, Math.round(cx * CHUNK_PX_W - cameraX), Math.round(cy * CHUNK_PX_H - cameraY));
      }
    }

    // mining damage is dynamic, so it is drawn on top of the cached chunks
    if (this.world.damage.size) {
      const startX = Math.floor(cameraX / T), endX = Math.ceil((cameraX + viewW) / T);
      const startY = Math.floor(cameraY / T), endY = Math.ceil((cameraY + viewH) / T);
      for (const [key, dmg] of this.world.damage) {
        const x = key % CONFIG.WORLD_W;
        const y = (key - x) / CONFIG.WORLD_W;
        if (x < startX || x > endX || y < startY || y > endY) continue;
        const info = TILE_INFO[this.world.get(x, y)];
        if (!info || !info.hp) continue;
        const ratio = Math.min(1, dmg / info.hp);
        const px = x * T - cameraX, py = y * T - cameraY;
        ctx.strokeStyle = `rgba(16,14,12,${(0.25 + ratio * 0.6).toFixed(2)})`;
        ctx.lineWidth = 1 + ratio * 2.5;
        ctx.beginPath();
        ctx.moveTo(px + 6, py + 4);
        ctx.lineTo(px + 15, py + 14);
        ctx.lineTo(px + 9, py + 27);
        ctx.moveTo(px + 20, py + 5);
        ctx.lineTo(px + 15, py + 15);
        ctx.lineTo(px + 27, py + 24);
        if (ratio > 0.55) {
          ctx.moveTo(px + 4, py + 20);
          ctx.lineTo(px + 13, py + 22);
          ctx.moveTo(px + 24, py + 8);
          ctx.lineTo(px + 30, py + 12);
        }
        ctx.stroke();
      }
    }
  }
}

/* ------------------------------------------------------------------ light */

// Tile-resolution lightmap with sky propagation, rendered at low resolution
// and scaled up so interiors, caves and the bunker get soft falloff instead of
// a flat black rectangle.
class LightSystem {
  constructor(world, canvas) {
    this.world = world;
    this.canvas = canvas;
    this.skyHeight = new Int16Array(CONFIG.WORLD_W);
    this.rebuildSky();
    world.addListener(x => this.recomputeColumn(x));

    this.cols = 0;
    this.rows = 0;
    this.grid = null;
    this.buffer = document.createElement('canvas');
    this.bctx = this.buffer.getContext('2d');
    this.image = null;
    this.lights = [];
  }

  rebuildSky() {
    for (let x = 0; x < CONFIG.WORLD_W; x++) this.recomputeColumn(x);
  }

  recomputeColumn(x) {
    const w = this.world;
    for (let y = 0; y < CONFIG.WORLD_H; y++) {
      const t = w.get(x, y);
      if (t !== TILE.AIR && TILE_INFO[t]?.solid) { this.skyHeight[x] = y; return; }
      if (w.getWall(x, y) !== TILE.AIR) { this.skyHeight[x] = y; return; }
    }
    this.skyHeight[x] = CONFIG.WORLD_H;
  }

  // tint: null (warm/neutral), 'cold' (fluorescent, Blackridge) or 'red' (emergency)
  addLight(x, y, radius, strength, warm = 1, tint = null) {
    this.lights.push({ x, y, radius, strength, warm, tint: tint === 'cold' ? 1 : tint === 'red' ? 2 : 0 });
  }

  resize(cols, rows) {
    if (this.cols === cols && this.rows === rows) return;
    this.cols = cols;
    this.rows = rows;
    this.grid = new Float32Array(cols * rows);
    this.warmGrid = new Float32Array(cols * rows);
    this.coolGrid = new Float32Array(cols * rows);
    this.redGrid = new Float32Array(cols * rows);
    this.buffer.width = cols;
    this.buffer.height = rows;
    this.image = this.bctx.createImageData(cols, rows);
  }

  // daylight: 0 (deep night) .. 1 (noon)
  // Light changes slowly, so the propagation only re-runs a few times a second;
  // the baked buffer is reused in between and still follows the camera.
  update(cameraX, cameraY, viewW, viewH, daylight, weatherDim = 0, force = false) {
    const T0 = CONFIG.TILE;
    const originTx = Math.floor(cameraX / T0) - 1;
    const originTy = Math.floor(cameraY / T0) - 1;
    const moved = originTx !== this.originX || originTy !== this.originY;
    this.sinceBake = (this.sinceBake || 0) + 1;
    const stale = this.sinceBake >= 3 || Math.abs((this.lastDaylight ?? -1) - daylight) > 0.02;
    if (!force && !moved && !stale && this.image) {
      this.lights.length = 0;
      return;
    }
    this.sinceBake = 0;
    this.lastDaylight = daylight;
    this.bake(cameraX, cameraY, viewW, viewH, daylight, weatherDim);
  }

  bake(cameraX, cameraY, viewW, viewH, daylight, weatherDim = 0) {
    const T = CONFIG.TILE;
    const tx0 = Math.floor(cameraX / T) - 1;
    const ty0 = Math.floor(cameraY / T) - 1;
    const cols = Math.ceil(viewW / T) + 3;
    const rows = Math.ceil(viewH / T) + 3;
    this.resize(cols, rows);
    this.originX = tx0;
    this.originY = ty0;

    const grid = this.grid;
    const warm = this.warmGrid;
    const cool = this.coolGrid;
    const red = this.redGrid;
    const w = this.world;
    const ambient = Math.max(0.06, daylight * (1 - weatherDim * 0.45));

    for (let j = 0; j < rows; j++) {
      const y = ty0 + j;
      for (let i = 0; i < cols; i++) {
        const x = tx0 + i;
        const o = j * cols + i;
        warm[o] = 0;
        cool[o] = 0;
        red[o] = 0;
        if (x < 0 || x >= CONFIG.WORLD_W || y < 0) { grid[o] = ambient; continue; }
        // indoors keeps a floor of bounced light so daytime interiors stay readable
        grid[o] = y < this.skyHeight[x] ? ambient : ambient * 0.2;
      }
    }

    // propagate: open air carries light further than solid rock
    for (let pass = 0; pass < 6; pass++) {
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const o = j * cols + i;
          const x = tx0 + i, y = ty0 + j;
          const t = x >= 0 && x < CONFIG.WORLD_W && y >= 0 && y < CONFIG.WORLD_H ? w.get(x, y) : TILE.STONE;
          const solid = t !== TILE.AIR && TILE_INFO[t]?.solid;
          const decay = solid ? 0.42 : 0.86;
          let best = grid[o];
          if (i > 0) best = Math.max(best, grid[o - 1] * decay);
          if (i < cols - 1) best = Math.max(best, grid[o + 1] * decay);
          if (j > 0) best = Math.max(best, grid[o - cols] * decay);
          if (j < rows - 1) best = Math.max(best, grid[o + cols] * decay);
          grid[o] = best;
        }
      }
    }

    // point lights
    for (const light of this.lights) {
      const lx = (light.x - cameraX) / T + 1;
      const ly = (light.y - cameraY) / T + 1;
      const r = light.radius / T;
      const i0 = Math.max(0, Math.floor(lx - r)), i1 = Math.min(cols - 1, Math.ceil(lx + r));
      const j0 = Math.max(0, Math.floor(ly - r)), j1 = Math.min(rows - 1, Math.ceil(ly + r));
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const d = Math.hypot(i - lx, j - ly) / r;
          if (d >= 1) continue;
          const f = (1 - d) * (1 - d) * light.strength;
          const o = j * cols + i;
          grid[o] = Math.min(1.35, grid[o] + f);
          warm[o] = Math.min(1, warm[o] + f * light.warm);
          if (light.tint === 1) cool[o] = Math.min(1, cool[o] + f);
          else if (light.tint === 2) red[o] = Math.min(1, red[o] + f * 1.3);
        }
      }
    }
    this.lights.length = 0;

    // bake to the low-res buffer
    const data = this.image.data;
    const nightR = 9, nightG = 13, nightB = 22;
    for (let o = 0; o < cols * rows; o++) {
      const l = Math.min(1, grid[o]);
      const a = Math.max(0, 1 - l);
      const wm = Math.min(1, warm[o]);
      const cl = cool[o], rd = red[o];
      const p = o * 4;
      data[p] = Math.min(255, nightR + wm * 60 + rd * 120);
      data[p + 1] = nightG + wm * 34 + cl * 34;
      data[p + 2] = nightB + wm * 6 + cl * 70;
      // coloured light also tints the lit area, not only the falloff
      data[p + 3] = Math.round(Math.max(Math.pow(a, 1.15) * 236, (rd * 0.22 + cl * 0.1) * 255 * (1 - a * 0.3)));
    }
    this.bctx.putImageData(this.image, 0, 0);
  }

  // What the light looks like at a world point, plus the direction it is
  // coming from (the gradient of the baked grid). Actors use this to catch a
  // rim on their lit side instead of sitting flat on top of the scene.
  sampleAt(worldX, worldY) {
    if (!this.grid || !this.cols) return null;
    const T = CONFIG.TILE;
    const i = Math.round(worldX / T) - this.originX;
    const j = Math.round(worldY / T) - this.originY;
    if (i < 1 || j < 1 || i >= this.cols - 1 || j >= this.rows - 1) return null;
    const o = j * this.cols + i;
    return {
      l: this.grid[o],
      warm: this.warmGrid[o], cool: this.coolGrid[o], red: this.redGrid[o],
      gx: this.grid[o + 1] - this.grid[o - 1],
      gy: this.grid[o + this.cols] - this.grid[o - this.cols]
    };
  }

  draw(ctx, cameraX, cameraY) {
    const T = CONFIG.TILE;
    const dx = this.originX * T - cameraX;
    const dy = this.originY * T - cameraY;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.buffer, dx, dy, this.cols * T, this.rows * T);
    ctx.restore();
  }
}
