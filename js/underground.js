// Stage 28B — underground identity pass.
//
// The world generator carves the rock; this dresses it. Nothing here changes
// mining, ore distribution, tiers or progression: it reads the finished world
// and adds props, light, ambience and a handful of themed rooms so the
// underground stops being one repeated stone field.
//
// Three families that must never be mistaken for each other:
//   cave  — natural, wet, irregular, grown over centuries
//   mine  — cut and propped by people, then abandoned mid-shift
//   br    — Blackridge: technical, cold, sealed on purpose
//
// Props in this game are decoration only (no collision), so the rule that
// matters is READABILITY: never bury a ladder, a container, an ore face or a
// route under scenery.

const UNDERGROUND_THEMES = ['crystal', 'camp', 'collapse', 'flooded', 'blackridge', 'bone_dry'];

// Depth bands, measured below the local surface. They decide the palette of
// the dressing, so descending actually looks like descending.
function undergroundBand(depth) {
  if (depth < 26) return 'shallow';
  if (depth < 58) return 'mid';
  if (depth < 92) return 'deep';
  return 'abyss';
}

const BAND_STYLE = {
  shallow: { roots: .34, moss: .30, fungus: .10, crystal: .00, drip: .22, stain: .10, dust: .10 },
  mid:     { roots: .10, moss: .18, fungus: .18, crystal: .05, drip: .30, stain: .20, dust: .16 },
  deep:    { roots: .02, moss: .08, fungus: .14, crystal: .16, drip: .24, stain: .30, dust: .22 },
  abyss:   { roots: .00, moss: .03, fungus: .08, crystal: .28, drip: .16, stain: .34, dust: .30 }
};

function dressUnderground(S) {
  const w = S.world;
  if (!w || !w.caveChambers) return;
  const T = CONFIG.TILE;
  const U = new UndergroundDresser(S);

  U.markProtected();
  U.dressChambers();
  U.dressTunnels();
  U.dressMineApproaches();
  return U.stats;
}

class UndergroundDresser {
  constructor(S) {
    this.S = S;
    this.w = S.world;
    this.salt = 90001;
    this.protectedCells = new Set();
    this.used = new Set();
    this.stats = { props: 0, lamps: 0, emitters: 0, chambers: 0, containers: 0 };
  }

  rand() { return this.S.rand(this.salt++); }
  key(x, y) { return x * 4096 + y; }

  air(x, y) { return this.w.inBounds(x, y) && this.w.get(x, y) === TILE.AIR; }

  solid(x, y) {
    if (!this.w.inBounds(x, y)) return true;
    const t = this.w.get(x, y);
    return t !== TILE.AIR && TILE_INFO[t]?.solid;
  }

  // Ore faces, ladders and anything interactive stay visually clear.
  isOre(x, y) {
    const t = this.w.get(x, y);
    return typeof MINING_NODES !== 'undefined'
      ? Boolean(MINING_NODES[t])
      : t === TILE.COAL_ORE || t === TILE.IRON_ORE || t === TILE.COPPER_ORE || t === TILE.QUARTZ_ORE;
  }

  markProtected() {
    const S = this.S, T = CONFIG.TILE;
    for (const c of S.containers) {
      const tx = Math.floor(c.x / T), ty = Math.floor(c.y / T);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) this.protectedCells.add(this.key(tx + dx, ty + dy));
    }
    for (const p of S.points || []) {
      const tx = Math.floor((p.x ?? 0) / T), ty = Math.floor((p.y ?? 0) / T);
      for (let dx = -1; dx <= 1; dx++) this.protectedCells.add(this.key(tx + dx, ty));
    }
    for (const pr of S.props) {
      if (pr.tileY > 60) this.protectedCells.add(this.key(pr.tileX, pr.tileY));
    }
  }

  free(x, y) {
    if (this.protectedCells.has(this.key(x, y)) || this.used.has(this.key(x, y))) return false;
    if (this.w.get(x, y) === TILE.LADDER) return false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (this.w.inBounds(x + dx, y + dy) && this.isOre(x + dx, y + dy)) return false;
      }
    }
    return true;
  }

  take(x, y, span = 1) {
    for (let i = 0; i < span; i++) this.used.add(this.key(x + i, y));
  }

  prop(asset, x, y, opts = {}) {
    const p = this.S.addProp(asset, x, y, { behind: true, ...opts });
    this.stats.props++;
    return p;
  }

  // Every placement resolves the floor for THAT column. A chamber floor is
  // not flat, so trusting one sampled row buries props inside the rock.
  floorAt(x, nearY, slack = 9) {
    for (let d = 0; d <= slack; d++) {
      for (const y of d === 0 ? [nearY] : [nearY - d, nearY + d]) {
        if (this.air(x, y - 1) && this.solid(x, y)) return y;
      }
    }
    return null;
  }

  ceilAt(x, nearY, slack = 9) {
    for (let d = 0; d <= slack; d++) {
      for (const y of d === 0 ? [nearY] : [nearY + d, nearY - d]) {
        if (this.air(x, y + 1) && this.solid(x, y)) return y;
      }
    }
    return null;
  }

  // Bottom-aligned on the floor of this column.
  onFloor(asset, x, nearFloorY, opts = {}) {
    const floorY = this.floorAt(x, nearFloorY);
    if (floorY == null || !this.free(x, floorY - 1)) return null;
    this.take(x, floorY - 1, Math.max(1, Math.round((this.S.size(asset)[0] * (opts.scale || 1)) / CONFIG.TILE)));
    return this.prop(asset, x, floorY - 1, opts);
  }

  // Hung from the rock above: offsetY pulls it up to the ceiling slab.
  onCeiling(asset, x, nearCeilY, nearFloorY, opts = {}) {
    const ceilY = this.ceilAt(x, nearCeilY);
    const floorY = this.floorAt(x, nearFloorY);
    if (ceilY == null || floorY == null || floorY - ceilY < 3) return null;
    if (!this.free(x, ceilY + 1)) return null;
    const h = this.S.size(asset)[1] * (opts.scale || 1);
    this.take(x, ceilY + 1);
    return this.prop(asset, x, floorY - 1, { wall: true, ...opts, offsetY: -((floorY - ceilY - 1) * CONFIG.TILE - h) });
  }

  // Wall dressing hangs in the air cell in front of the rock face.
  onWall(asset, x, y, opts = {}) {
    if (!this.air(x, y) || !this.free(x, y)) return null;
    this.take(x, y);
    return this.prop(asset, x, y, { wall: true, ...opts });
  }

  lamp(x, y, opts) { this.stats.lamps++; return this.S.lamp(x * CONFIG.TILE + 16, y * CONFIG.TILE + 16, opts); }
  emitter(kind, x, y, opts) { this.stats.emitters++; return this.S.emitter(kind, x * CONFIG.TILE + 16, y * CONFIG.TILE + 16, opts); }

  /* ------------------------------------------------------------ pockets */

  // Walks a column and returns every air pocket with its floor and ceiling.
  pocketsAt(x) {
    const out = [];
    const top = this.w.surface[x] + 6;
    let y = top, start = -1;
    for (; y < CONFIG.WORLD_H - 2; y++) {
      if (this.air(x, y)) { if (start < 0) start = y; continue; }
      if (start >= 0) {
        if (this.solid(x, start - 1) && y - start >= 2) out.push({ ceilY: start - 1, floorY: y, h: y - start });
        start = -1;
      }
    }
    return out;
  }

  /* --------------------------------------------------- generic tunnels */

  // The long stretches between rooms: sparse, atmospheric, never cluttered.
  dressTunnels() {
    const W = CONFIG.WORLD_W;
    for (let x = 12; x < W - 12; x += 2) {
      const surf = this.w.surface[x];
      const pockets = this.pocketsAt(x);
      for (const p of pockets) {
        const depth = p.floorY - surf;
        if (depth < 12) continue;
        const st = BAND_STYLE[undergroundBand(depth)];
        const r = this.rand();

        // ceiling
        if (p.h >= 4 && r < 0.30) {
          const c = this.rand();
          if (c < st.roots) this.onCeiling('cave_roots', x, p.ceilY, p.floorY, { scale: 0.8 + this.rand() * 0.4, alpha: 0.95 });
          else if (c < st.roots + 0.5) this.onCeiling(this.rand() > 0.55 ? 'stalactite_cluster' : 'stalactite', x, p.ceilY, p.floorY, { scale: 0.7 + this.rand() * 0.6 });
        }

        // floor
        const f = this.rand();
        if (f < 0.20) this.onFloor(this.rand() > 0.5 ? 'stalagmite_cluster' : 'stalagmite', x, p.floorY, { scale: 0.7 + this.rand() * 0.5 });
        else if (f < 0.30) this.onFloor('cave_rubble', x, p.floorY, { scale: 0.7 + this.rand() * 0.5 });
        else if (f < 0.30 + st.moss) this.onFloor('cave_moss', x, p.floorY, { scale: 0.8 + this.rand() * 0.5, alpha: 0.9 });
        else if (f < 0.34 + st.moss + st.fungus) this.onFloor('cave_fungus', x, p.floorY, { scale: 0.7 + this.rand() * 0.4 });
        else if (f < 0.40 + st.moss + st.fungus && p.h >= 3) this.onFloor('cave_puddle', x, p.floorY, { scale: 0.7 + this.rand() * 0.6, alpha: 0.85 });

        // a column only where the room is short enough for one to have formed,
        // and only hugging a wall so it never sits in the middle of a route
        if (p.h >= 4 && p.h <= 7 && this.rand() < 0.07 && (this.solid(x - 1, p.floorY - 2) || this.solid(x + 1, p.floorY - 2))) {
          this.onFloor('cave_column', x, p.floorY, { scale: (p.h * CONFIG.TILE) / 64 * 0.94 });
        }

        // wall staining and drill scars deep down
        if (this.rand() < st.stain * 0.5 && p.h >= 3) {
          const facing = this.solid(x - 1, p.floorY - 2) || this.solid(x + 1, p.floorY - 2);
          if (facing) this.onWall(this.rand() > 0.6 ? 'mineral_stain' : 'cave_shelf', x, p.floorY - 2, { scale: 0.8, alpha: 0.92 });
        }

        // ambience
        if (this.rand() < st.drip * 0.06) this.emitter('drip', x, p.ceilY + 1);
        if (p.h >= 6 && this.rand() < st.dust * 0.05) this.emitter('dust', x, p.floorY - 2, { w: 10 * CONFIG.TILE });
      }
    }
  }

  /* ---------------------------------------------------------- chambers */

  dressChambers() {
    for (const c of this.w.caveChambers) {
      // Chambers are carved during world generation; structures are built on
      // top of them afterwards. Anything a metro/mall/mine gallery has since
      // paved over is no longer a cave, so it does not get cave dressing.
      if (this.occupied(c)) continue;
      const theme = this.themeFor(c);
      this.stats.chambers++;
      const floorY = this.chamberFloor(c);
      if (floorY == null) continue;
      const x0 = c.x - c.rx + 1, x1 = c.x + c.rx - 1;
      const ceilY = c.y - c.ry;

      // The theme owns the middle of the room; the rock pass dresses around
      // it. Run the other way and stalagmites eat every cell the camp or the
      // sealed door needed.
      const keep = [];
      for (let x = c.x - 4; x <= c.x + 5; x++) { keep.push(x); this.used.add(this.key(x, (this.floorAt(x, floorY) ?? floorY) - 1)); }
      this.chamberRock(c, x0, x1, floorY, ceilY);
      for (const x of keep) this.used.delete(this.key(x, (this.floorAt(x, floorY) ?? floorY) - 1));
      switch (theme) {
        case 'crystal': this.chamberCrystal(c, x0, x1, floorY, ceilY); break;
        case 'camp': this.chamberCamp(c, x0, x1, floorY, ceilY); break;
        case 'collapse': this.chamberCollapse(c, x0, x1, floorY, ceilY); break;
        case 'flooded': this.chamberFlooded(c, x0, x1, floorY, ceilY); break;
        case 'blackridge': this.chamberBlackridge(c, x0, x1, floorY, ceilY); break;
        default: this.chamberDry(c, x0, x1, floorY, ceilY); break;
      }
      c.theme = theme;
    }
  }

  occupied(c) {
    if (this.w.undergroundZoneAt?.(c.x, c.y)) return true;
    for (const s of this.S.structures) {
      if (c.x < s.x - 3 || c.x > s.endX + 3) continue;
      const y1 = s.y1 ?? s.yTop ?? (s.groundY - 22);
      const y2 = s.y2 ?? s.yBottom ?? (s.groundY + 3);
      if (c.y >= y1 - 4 && c.y <= y2 + 4) return true;
    }
    return false;
  }

  // A sealed pocket is a find, so it always carries something worth the dig.
  themeFor(c) {
    const band = undergroundBand(c.depth);
    if (c.sealed) {
      if (band === 'abyss' || band === 'deep') return c.roll < 0.55 ? 'crystal' : 'blackridge';
      return c.roll < 0.5 ? 'camp' : 'crystal';
    }
    if (band === 'shallow') return c.roll < 0.4 ? 'camp' : c.roll < 0.7 ? 'collapse' : 'bone_dry';
    if (band === 'mid') return c.roll < 0.3 ? 'camp' : c.roll < 0.55 ? 'collapse' : c.roll < 0.8 ? 'flooded' : 'crystal';
    if (band === 'deep') return c.roll < 0.35 ? 'crystal' : c.roll < 0.6 ? 'flooded' : c.roll < 0.85 ? 'collapse' : 'blackridge';
    return c.roll < 0.5 ? 'crystal' : c.roll < 0.75 ? 'blackridge' : 'bone_dry';
  }

  // The lowest row inside the room that actually has rock under it.
  chamberFloor(c) {
    for (let y = c.y + c.ry + 2; y >= c.y - c.ry; y--) {
      if (this.air(c.x, y - 1) && this.solid(c.x, y)) return y;
    }
    return null;
  }

  chamberRock(c, x0, x1, floorY, ceilY) {
    const st = BAND_STYLE[undergroundBand(c.depth)];
    for (let x = x0; x <= x1; x++) {
      if (this.rand() < 0.42) {
        this.onCeiling(this.rand() > 0.5 ? 'stalactite_cluster' : 'stalactite', x, ceilY, floorY, { scale: 0.8 + this.rand() * 0.7 });
      }
      if (this.rand() < 0.30) this.onFloor(this.rand() > 0.5 ? 'stalagmite_cluster' : 'stalagmite', x, floorY, { scale: 0.8 + this.rand() * 0.6 });
      else if (this.rand() < st.moss + 0.12) this.onFloor('cave_moss', x, floorY, { scale: 0.9, alpha: 0.9 });
    }
    // columns at the rim only
    for (const x of [x0, x1]) {
      if (this.rand() < 0.5) this.onFloor('cave_column', x, floorY, { scale: Math.max(0.5, ((floorY - ceilY - 1) * CONFIG.TILE) / 64) });
    }
    this.emitter('dust', c.x, floorY - 2, { w: (x1 - x0) * CONFIG.TILE });
  }

  chamberCrystal(c, x0, x1, floorY, ceilY) {
    const big = c.big || c.sealed;
    for (let x = x0; x <= x1; x++) {
      const r = this.rand();
      if (r < (big ? 0.42 : 0.26)) {
        const asset = big && this.rand() > 0.55 ? 'crystal_cluster_large' : 'crystal_cluster';
        const p = this.onFloor(asset, x, floorY, { scale: 0.7 + this.rand() * 0.6 });
        if (p) this.lamp(x, floorY - 2, { radius: 78 + this.rand() * 46, strength: 0.34, color: 'cold', mode: 'always', flicker: 0.06 });
      } else if (r < 0.5) {
        this.onFloor('crystal_shards', x, floorY, { scale: 0.8 + this.rand() * 0.4 });
      }
      if (this.rand() < 0.3) this.onWall('crystal_vein_wall', x, ceilY + 2, { scale: 0.75 + this.rand() * 0.4, alpha: 0.9 });
    }
    this.lamp(c.x, floorY - 3, { radius: 150, strength: 0.42, color: 'cold', mode: 'always', flicker: 0.1 });
    this.emitter('steam', c.x + 2, floorY - 2, { rate: 0.45 });
    if (c.sealed || c.big) this.stash(c, 'Bolsão cristalino', x0, x1, floorY, 'mining', true);
  }

  // Someone worked down here and did not come back.
  chamberCamp(c, x0, x1, floorY, ceilY) {
    const cx = c.x;
    this.onFloor('miner_bedroll', cx - 2, floorY, { scale: 0.95 });
    this.onFloor('tool_rack', cx + 2, floorY, { scale: 0.9 });
    if (this.rand() > 0.4) this.onFloor('ore_pile', cx + 4, floorY, { scale: 0.9 });
    if (this.rand() > 0.5) this.onFloor('crate_stack', x0 + 1, floorY, { scale: 0.8 });
    if (this.rand() > 0.6) this.onFloor('barrel', x1 - 1, floorY, { scale: 0.8 });
    this.onCeiling('lantern', cx, ceilY, floorY, { scale: 1 });
    this.lamp(cx, floorY - 3, { radius: 132, strength: 0.6, color: 'warm', mode: 'always', flicker: 0.24, fixture: 'lantern' });
    for (let x = x0; x <= x1; x += 3) if (this.rand() > 0.6) this.onFloor('cave_rubble', x, floorY, { scale: 0.7 });
    this.stash(c, 'Acampamento de mineiro', x0, x1, floorY, 'mining', c.sealed);
  }

  // The ceiling came down here. Read it from the broken timber outward.
  chamberCollapse(c, x0, x1, floorY, ceilY) {
    this.onFloor('broken_support', c.x - 1, floorY, { scale: 0.9 + this.rand() * 0.3 });
    for (let x = x0; x <= x1; x++) {
      if (this.rand() < 0.55) this.onFloor(this.rand() > 0.5 ? 'cave_rubble' : 'rubble_pile', x, floorY, { scale: 0.7 + this.rand() * 0.5 });
    }
    if (this.rand() > 0.45) this.onFloor('ore_cart_tipped', c.x + 3, floorY, { scale: 0.9, flip: this.rand() > 0.5 });
    if (this.rand() > 0.55) this.onFloor('mine_rail_broken', x0 + 1, floorY, { scale: 0.9 });
    this.onCeiling('mine_beam', c.x + 1, ceilY, floorY, { scale: 0.85, tilt: 0.12 });
    this.emitter('dust', c.x, floorY - 1, { w: (x1 - x0) * CONFIG.TILE, rate: 1.6 });
    if (this.rand() > 0.5) this.stash(c, 'Galeria desabada', x0, x1, floorY, 'mining', false);
  }

  chamberFlooded(c, x0, x1, floorY, ceilY) {
    for (let x = x0; x <= x1; x++) {
      if (this.rand() < 0.7) this.onFloor('cave_puddle', x, floorY, { scale: 0.9 + this.rand() * 0.5, alpha: 0.9 });
      if (this.rand() < 0.3) this.onFloor('cave_moss', x, floorY, { scale: 1, alpha: 0.9 });
      if (this.rand() < 0.22) this.onCeiling('cave_roots', x, ceilY, floorY, { scale: 0.9 });
    }
    for (let x = x0 + 1; x <= x1 - 1; x += 3) this.emitter('drip', x, ceilY + 1, { rate: 1.5 });
    if (this.rand() > 0.5) this.onFloor('cave_fungus', c.x + 2, floorY, { scale: 1.1 });
    this.emitter('steam', c.x, floorY - 1, { rate: 0.35 });
  }

  // Something was put down here and then shut in.
  chamberBlackridge(c, x0, x1, floorY, ceilY) {
    const cx = c.x;
    this.onFloor('br_sealed_door', cx, floorY, { scale: 0.95 });
    this.onWall('br_evac_mark', cx - 3, floorY - 3, { scale: 0.9, alpha: 0.95 });
    if (this.rand() > 0.35) this.onFloor('br_crate', cx + 3, floorY, { scale: 0.9 });
    if (this.rand() > 0.5) this.onFloor('br_crate', cx + 4, floorY, { scale: 0.8, flip: true });
    this.onWall('br_wall_panel', cx + 2, floorY - 4, { scale: 0.9 });
    this.onCeiling('br_cable_run', cx - 1, ceilY, floorY, { scale: 0.9 });
    this.onWall('br_sensor', cx - 2, floorY - 4, { scale: 0.9 });
    this.lamp(cx, floorY - 3, { radius: 128, strength: 0.5, color: 'cold', mode: 'always', flicker: 0.3 });
    this.lamp(cx + 4, floorY - 2, { radius: 74, strength: 0.28, color: 'red', mode: 'always', flicker: 0.5 });
    this.emitter('steam', cx + 1, floorY - 2, { rate: 0.5 });
    for (let x = x0; x <= x1; x += 4) if (this.rand() > 0.6) this.onFloor('cave_rubble', x, floorY, { scale: 0.7 });
    this.stash(c, 'Compartimento selado Blackridge', x0, x1, floorY, 'blackridge', true);
  }

  chamberDry(c, x0, x1, floorY, ceilY) {
    for (let x = x0; x <= x1; x++) {
      if (this.rand() < 0.4) this.onFloor('cave_rubble', x, floorY, { scale: 0.7 + this.rand() * 0.5 });
      if (this.rand() < 0.2) this.onWall('drill_marks', x, floorY - 3, { scale: 0.85, alpha: 0.9 });
    }
    if (this.rand() > 0.6) this.onFloor('boulder', c.x + 2, floorY, { scale: 0.9 });
    this.emitter('draft', c.x, floorY - 3);
  }

  // A stash is only worth placing where the player can actually get to it on
  // foot. Deep and sealed rooms keep their reward as what they ARE — a crystal
  // field, a collapsed gallery — rather than a crate nobody can open.
  // walkable() returns flat typed-array maps, not a Set: `seen` marks every
  // standing cell reachable from the spawn.
  reachable(x, y) {
    if (!this.reach) this.reach = this.S.walkable().seen;
    return Boolean(this.reach[y * CONFIG.WORLD_W + x]);
  }

  stash(c, name, x0, x1, nearFloorY, table, rare) {
    const S = this.S;
    for (let i = 0; i < 8; i++) {
      const x = x0 + 1 + Math.floor(this.rand() * Math.max(1, x1 - x0 - 1));
      const floorY = this.floorAt(x, nearFloorY);
      if (floorY == null) continue;
      if (!this.air(x, floorY - 1) || !this.air(x, floorY - 2)) continue;
      if (!this.free(x, floorY - 1)) continue;
      if (!this.reachable(x, floorY - 1)) continue;
      this.take(x, floorY - 1);
      S.addContainer(name, x, floorY - 2, table,
        S.loot(table, 90000 + c.x * 7 + c.y, rare ? 6 : 4, { guaranteed: rare }), { rare: Boolean(rare) });
      this.stats.containers++;
      return true;
    }
    return false;
  }

  /* ------------------------------------------- worked approaches to mines */

  // Where a natural cave runs close to a mine or quarry, the rock starts
  // showing tool work: rails, beams, ventilation. This is what separates
  // "a cave" from "someone's mine" without changing either generator.
  dressMineApproaches() {
    const S = this.S;
    const worked = S.structures.filter(s => s.type === 'mine' || s.type === 'quarry');
    for (const s of worked) {
      for (let x = s.x - 26; x < s.endX + 26; x += 2) {
        if (x < 6 || x >= CONFIG.WORLD_W - 6) continue;
        const inside = x >= s.x && x <= s.endX;
        for (const p of this.pocketsAt(x)) {
          const depth = p.floorY - this.w.surface[x];
          if (depth < 14 || p.h < 3) continue;
          const r = this.rand();
          if (r < (inside ? 0.30 : 0.16)) this.onFloor('mine_rail', x, p.floorY, { scale: 0.9 });
          else if (r < (inside ? 0.40 : 0.22)) this.onFloor('mine_rail_broken', x, p.floorY, { scale: 0.9 });
          if (p.h >= 4 && this.rand() < 0.22) this.onCeiling('mine_beam', x, p.ceilY, p.floorY, { scale: 0.85 });
          if (this.rand() < 0.10) this.onFloor('mine_support', x, p.floorY, { scale: 1.1 });
          if (this.rand() < 0.07) this.onWall('drill_marks', x, p.floorY - 2, { scale: 0.85, alpha: 0.9 });
          if (this.rand() < 0.05) this.onFloor('vent_pipe', x, p.floorY, { scale: 0.9 });
          if (this.rand() < 0.05) {
            this.onCeiling('lantern', x, p.ceilY, p.floorY, { scale: 1 });
            this.lamp(x, p.floorY - 2, { radius: 118, strength: 0.5, color: 'warm', mode: 'always', flicker: 0.3, fixture: 'lantern' });
          }
          if (this.rand() < 0.04) this.onFloor('mine_sign', x, p.floorY, { scale: 0.9 });
          if (this.rand() < 0.035) this.onFloor('mine_winch', x, p.floorY, { scale: 0.95 });
          if (this.rand() < 0.03) this.onFloor('ore_pile', x, p.floorY, { scale: 0.85 });
        }
      }
    }
  }
}
