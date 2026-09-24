// Region table. Each stretch of Last County has its own ground cover,
// vegetation, terrain profile and danger flavour — the decoration and
// structure passes read from here so regions never blur together.
const REGIONS = [
  {
    id: 'coldwood', name: 'Mata Fria', from: 0, to: 96, profile: 'hills',
    ground: [TILE.WET_GRASS, TILE.GRASS, TILE.GRASS], sub: TILE.WET_DIRT,
    trees: 0.85, pines: 0.68, deadTrees: 0.08, bushes: 0.55, tallGrass: 0.66, flowers: 0.2
  },
  {
    id: 'pasture', name: 'Pastagem Harlow', from: 96, to: 176, profile: 'flat',
    ground: [TILE.GRASS, TILE.GRASS, TILE.DEAD_GRASS], sub: TILE.DIRT,
    trees: 0.2, pines: 0.12, deadTrees: 0.22, bushes: 0.3, tallGrass: 0.52, flowers: 0.32
  },
  {
    id: 'roadside', name: 'Corredor Rural', from: 176, to: 248, profile: 'rolling',
    ground: [TILE.GRASS, TILE.DEAD_GRASS, TILE.DRY_DIRT], sub: TILE.DIRT,
    trees: 0.3, pines: 0.22, deadTrees: 0.3, bushes: 0.28, tallGrass: 0.4, flowers: 0.24
  },
  {
    id: 'crossing', name: 'Entroncamento 17', from: 248, to: 300, profile: 'flat',
    ground: [TILE.DEAD_GRASS, TILE.GRAVEL, TILE.DRY_DIRT], sub: TILE.DIRT,
    trees: 0.12, pines: 0.06, deadTrees: 0.3, bushes: 0.18, tallGrass: 0.3, flowers: 0.16
  },
  {
    id: 'cedar', name: 'Bairro Cedar Row', from: 300, to: 392, profile: 'flat',
    ground: [TILE.DEAD_GRASS, TILE.GRASS, TILE.DRY_DIRT], sub: TILE.DIRT,
    trees: 0.16, pines: 0.05, deadTrees: 0.26, bushes: 0.24, tallGrass: 0.3, flowers: 0.22
  },
  {
    id: 'downtown', name: 'Centro de North County', from: 392, to: 500, profile: 'plateau',
    ground: [TILE.CRACKED_ASPHALT, TILE.CONCRETE, TILE.GRAVEL], sub: TILE.GRAVEL,
    trees: 0.06, pines: 0.01, deadTrees: 0.4, bushes: 0.1, tallGrass: 0.18, flowers: 0.08
  },
  {
    id: 'civic', name: 'Distrito Cívico', from: 500, to: 596, profile: 'flat',
    ground: [TILE.DEAD_GRASS, TILE.CRACKED_ASPHALT, TILE.GRAVEL], sub: TILE.DIRT,
    trees: 0.14, pines: 0.04, deadTrees: 0.32, bushes: 0.16, tallGrass: 0.26, flowers: 0.14
  },
  {
    id: 'dustbowl', name: 'Baixada Seca', from: 596, to: 684, profile: 'valley',
    ground: [TILE.DRY_DIRT, TILE.DEAD_GRASS, TILE.GRAVEL], sub: TILE.DRY_DIRT,
    trees: 0.18, pines: 0.03, deadTrees: 0.58, bushes: 0.22, tallGrass: 0.32, flowers: 0.28
  },
  {
    id: 'westline', name: 'Zona Industrial Westline', from: 684, to: 784, profile: 'flat',
    ground: [TILE.GRAVEL, TILE.INDUSTRIAL_FLOOR, TILE.DRY_DIRT], sub: TILE.GRAVEL,
    trees: 0.08, pines: 0.03, deadTrees: 0.34, bushes: 0.12, tallGrass: 0.2, flowers: 0.08
  },
  {
    id: 'ridge', name: 'Serra Oeste', from: 784, to: 860, profile: 'ridge',
    ground: [TILE.GRAVEL, TILE.DRY_DIRT, TILE.DEAD_GRASS], sub: TILE.DIRT,
    trees: 0.34, pines: 0.42, deadTrees: 0.3, bushes: 0.24, tallGrass: 0.26, flowers: 0.12
  },
  {
    id: 'blackridge', name: 'Complexo Blackridge', from: 860, to: 960, profile: 'plateau',
    ground: [TILE.CONCRETE, TILE.DEAD_GRASS, TILE.GRAVEL], sub: TILE.DRY_DIRT,
    trees: 0.05, pines: 0.02, deadTrees: 0.5, bushes: 0.08, tallGrass: 0.16, flowers: 0.05
  },
  {
    id: 'greenwater_pass', name: 'Passagem Greenwater', from: 960, to: 1050, profile: 'ridge',
    ground: [TILE.MOSS_STONE, TILE.WET_GRASS, TILE.GRASS], sub: TILE.WET_DIRT,
    trees: 0.72, pines: 0.38, deadTrees: 0.08, bushes: 0.62, tallGrass: 0.72, flowers: 0.28, stage40: true
  },
  {
    id: 'greenwater_forest', name: 'Mata Profunda Greenwater', from: 1050, to: 1200, profile: 'hills',
    ground: [TILE.WET_GRASS, TILE.LEAF_LITTER, TILE.GRASS], sub: TILE.WET_DIRT,
    trees: 0.98, pines: 0.24, deadTrees: 0.04, bushes: 0.84, tallGrass: 0.9, flowers: 0.38, stage40: true
  },
  {
    id: 'greenwater_marsh', name: 'Brejo Greenwater', from: 1200, to: 1360, profile: 'valley',
    ground: [TILE.MUD, TILE.WET_GRASS, TILE.WET_DIRT], sub: TILE.WET_DIRT,
    trees: 0.46, pines: 0.06, deadTrees: 0.12, bushes: 0.76, tallGrass: 0.96, flowers: 0.2, stage40: true
  },
  {
    id: 'greenwater_farms', name: 'Campos Greenwater', from: 1360, to: 1530, profile: 'rolling',
    ground: [TILE.GRASS, TILE.WET_GRASS, TILE.GRASS], sub: TILE.DIRT,
    trees: 0.34, pines: 0.08, deadTrees: 0.06, bushes: 0.52, tallGrass: 0.78, flowers: 0.52, stage40: true
  },
  {
    id: 'greenwater_meadow', name: 'Grande Planície Greenwater', from: 1530, to: 1900, profile: 'meadow',
    ground: [TILE.GRASS, TILE.WET_GRASS, TILE.GRASS], sub: TILE.DIRT,
    trees: 0.08, pines: 0.02, deadTrees: 0.01, bushes: 0.2, tallGrass: 0.58, flowers: 0.62, stage40: true, buildZone: true
  }
];

class World {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.tiles = new Uint8Array(CONFIG.WORLD_W * CONFIG.WORLD_H);
    this.walls = new Uint8Array(CONFIG.WORLD_W * CONFIG.WORLD_H);
    this.damage = new Map();
    this.surface = new Int16Array(CONFIG.WORLD_W);
    this.regionAt = new Uint8Array(CONFIG.WORLD_W);
    this.listeners = [];
    // Landmarks the structure and objective passes can hook into.
    this.caveMouths = [];
    this.caveChambers = [];
    this.ravines = [];
    this.creeks = [];
    // Stage 20.1: restored underground metadata used by mining/progression and saves.
    this.undergroundZones = [];
    this.oreVeins = [];
    this.generate();
  }

  idx(x, y) { return y * CONFIG.WORLD_W + x; }

  addListener(fn) { this.listeners.push(fn); }

  notify(x, y) {
    for (let i = 0; i < this.listeners.length; i++) this.listeners[i](x, y);
  }

  inBounds(x, y) {
    return x >= 0 && x < CONFIG.WORLD_W && y >= 0 && y < CONFIG.WORLD_H;
  }

  get(x, y) {
    if (!this.inBounds(x, y)) return TILE.STONE;
    return this.tiles[this.idx(x, y)];
  }

  getWall(x, y) {
    if (!this.inBounds(x, y)) return TILE.AIR;
    return this.walls[this.idx(x, y)];
  }

  set(x, y, value) {
    if (!this.inBounds(x, y)) return;
    const i = this.idx(x, y);
    if (this.tiles[i] === value) return;
    this.tiles[i] = value;
    if (this.damage.size) this.damage.delete(i);
    this.notify(x, y);
  }

  setWall(x, y, value) {
    if (!this.inBounds(x, y)) return;
    const i = this.idx(x, y);
    if (this.walls[i] === value) return;
    this.walls[i] = value;
    this.notify(x, y);
  }

  fillWall(x0, y0, x1, y1, value) {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.setWall(x, y, value);
  }

  isSolid(x, y) {
    const info = TILE_INFO[this.get(x, y)];
    return info ? info.solid : true;
  }

  region(x) {
    return REGIONS[this.regionAt[Math.max(0, Math.min(CONFIG.WORLD_W - 1, x | 0))]] || REGIONS[0];
  }

  // kept for older call sites
  biome(x) { return this.region(x); }

  rand(n) {
    let x = (n + this.seed) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = x ^ (x >>> 16);
    return (x >>> 0) / 4294967295;
  }

  noise(x, scale, salt) {
    const f = x / scale;
    const i = Math.floor(f);
    const t = f - i;
    const s = t * t * (3 - 2 * t);
    const a = this.rand(i * 1013 + salt * 7919);
    const b = this.rand((i + 1) * 1013 + salt * 7919);
    return a + (b - a) * s;
  }

  noise2(x, y, scale, salt) {
    const fx = x / scale, fy = y / scale;
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = fx - x0, ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const h = (i, j) => this.rand(i * 1013 + j * 7717 + salt * 104729);
    const a = h(x0, y0), b = h(x0 + 1, y0), c = h(x0, y0 + 1), d = h(x0 + 1, y0 + 1);
    const top = a + (b - a) * sx;
    const bottom = c + (d - c) * sx;
    return top + (bottom - top) * sy;
  }

  // Region-specific landforms give the map real hills, shelves and valleys.
  terrainHeight(x) {
    const region = this.region(x);
    const base = 78;
    const broad = (this.noise(x, 74, 1) - 0.5) * 16;
    const rolling = (this.noise(x, 27, 2) - 0.5) * 8;
    const detail = (this.noise(x, 7, 3) - 0.5) * 2.4;

    let profile = 0;
    switch (region.profile) {
      case 'hills': profile = -6 + (this.noise(x, 38, 5) - 0.5) * 16; break;
      case 'rolling': profile = (this.noise(x, 21, 6) - 0.5) * 12; break;
      case 'plateau': profile = -9; break;
      case 'valley': profile = 9 + (this.noise(x, 30, 7) - 0.5) * 5; break;
      case 'ridge': {
        // a long climb with a flat crest, so the west end is genuinely higher
        const t = (x - region.from) / (region.to - region.from);
        profile = -26 * Math.sin(Math.min(1, Math.max(0, t)) * Math.PI * 0.85);
        break;
      }
      default: profile = 0;
    }

    // Towns sit on graded ground: quantise the height so streets read flat.
    let h = region.profile === 'meadow'
      ? base + (this.noise(x, 120, 71) - .5) * 3 + (this.noise(x, 32, 73) - .5) * 1.5
      : base + broad + rolling + detail + profile;
    if (region.profile === 'plateau' || region.profile === 'flat') {
      h = Math.round(h / 3) * 3;
    }
    return Math.floor(h);
  }

  // Remove componentes de madeira/folhas que não possuem qualquer ligação
  // com um bloco sólido. Corrige árvores deixadas no ar por remodelações do
  // terreno e também repara saves que já registraram o defeito.
  cleanFloatingVegetation(fromX=0,toX=CONFIG.WORLD_W-1){
    const vegetation=new Set([TILE.WOOD,TILE.DARK_WOOD,TILE.LEAF,TILE.VINE]);
    const seen=new Uint8Array(CONFIG.WORLD_W*CONFIG.WORLD_H);let removed=0;
    const lo=Math.max(0,fromX|0),hi=Math.min(CONFIG.WORLD_W-1,toX|0);
    for(let sx=lo;sx<=hi;sx++)for(let sy=0;sy<CONFIG.WORLD_H;sy++){
      const start=this.idx(sx,sy);if(seen[start]||!vegetation.has(this.tiles[start]))continue;
      const stack=[[sx,sy]],cells=[];seen[start]=1;let anchored=false;
      while(stack.length){const [x,y]=stack.pop(),i=this.idx(x,y);cells.push(i);const here=this.tiles[i],below=y+1<CONFIG.WORLD_H?this.get(x,y+1):TILE.STONE;
        // A crown touching a roof or a stray block is not a rooted tree. Only
        // a trunk cell supported by solid terrain keeps the component alive.
        if((here===TILE.WOOD||here===TILE.DARK_WOOD)&&!vegetation.has(below)&&TILE_INFO[below]?.solid)anchored=true;
        for(const [nx,ny]of[[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(nx<lo||nx>hi||ny<0||ny>=CONFIG.WORLD_H)continue;const ni=this.idx(nx,ny);if(!seen[ni]&&vegetation.has(this.tiles[ni])){seen[ni]=1;stack.push([nx,ny]);}}
      }
      if(!anchored)for(const i of cells){this.tiles[i]=TILE.AIR;this.walls[i]=TILE.AIR;removed++;}
    }
    return removed;
  }

  generate() {
    for (let x = 0; x < CONFIG.WORLD_W; x++) {
      let ri = 0;
      for (let i = 0; i < REGIONS.length; i++) if (x >= REGIONS[i].from) ri = i;
      this.regionAt[x] = ri;
    }

    for (let x = 0; x < CONFIG.WORLD_W; x++) {
      const sy = this.terrainHeight(x);
      this.surface[x] = sy;
      const region = this.region(x);
      const soilDepth = 5 + Math.floor(this.noise(x, 23, 11) * 5);
      const stoneDepth = soilDepth + 22 + Math.floor(this.noise(x, 31, 13) * 14);

      for (let y = 0; y < CONFIG.WORLD_H; y++) {
        let t = TILE.AIR;
        const d = y - sy;

        if (d === 0) {
          const pick = this.noise(x, 9, 17);
          t = pick > 0.66 ? region.ground[0] : pick > 0.33 ? region.ground[1] : region.ground[2];
          if (this.rand(x * 181) > 0.95) t = TILE.MUD;
        } else if (d > 0 && d < soilDepth) {
          t = region.sub;
          if (this.rand(x * 227 + y * 17) > 0.88) t = TILE.GRAVEL;
          if (d > 2 && this.rand(x * 331 + y * 29) > 0.93) t = TILE.CRACKED_STONE;
        } else if (d >= soilDepth && d < stoneDepth) {
          t = TILE.STONE;
          const vein = this.noise2(x, y, 9, 19);
          if (vein > 0.78) t = TILE.GRAVEL;
          else if (vein < 0.17) t = TILE.CRACKED_STONE;
          if (this.rand(x * 617 + y * 41) > 0.975) t = TILE.DARK_STONE;
        } else if (d >= stoneDepth) {
          t = TILE.DARK_STONE;
          if (this.noise2(x, y, 8, 23) > 0.82) t = TILE.STONE;
        }

        const i = this.idx(x, y);
        this.tiles[i] = t;
        if (d >= 1) this.walls[i] = d < soilDepth ? region.sub : d < stoneDepth ? TILE.STONE : TILE.DARK_STONE;
      }
    }

    this.carveCliffs();
    this.carveRavine(640, 16, 26);
    this.carveCreeks();
    this.carveGreenwater();
    this.carveCaves();
    this.carveCaveChambers();
    this.generateOreVeins();
    this.plantVegetation();
    this.generateForage();
    this.generateWaterSources();
  }

  /* ------------------------------------------------------------ landforms */

  // Steps some hillsides into ledges so there is something to climb.
  carveCliffs() {
    for (let x = 1; x < CONFIG.WORLD_W; x++) {
      const drop = this.surface[x] - this.surface[x - 1];
      if (Math.abs(drop) < 3) continue;
      const step = drop > 0 ? 1 : -1;
      for (let y = this.surface[x - 1]; y !== this.surface[x]; y += step) {
        if (!this.inBounds(x, y)) break;
        const i = this.idx(x, y);
        if (step > 0) {
          this.tiles[i] = this.rand(x * 53 + y) > 0.75 ? TILE.CRACKED_STONE : TILE.STONE;
          this.walls[i] = TILE.STONE;
        }
      }
    }
  }

  // A dry ravine that the road crosses on a bridge — the main bit of
  // verticality on the eastern half of the map.
  carveRavine(centerX, halfWidth, depth) {
    const rim = this.surface[centerX];
    const floorY = rim + depth;

    for (let x = centerX - halfWidth; x <= centerX + halfWidth; x++) {
      if (!this.inBounds(x, 0)) continue;
      const t = 1 - Math.abs(x - centerX) / (halfWidth + 1);
      // eroded, stepped walls instead of a clean parabola
      const noise = (this.noise(x, 5, 41) - 0.5) * 3;
      const cut = Math.max(0, Math.round(depth * Math.pow(t, 0.55) + noise));
      if (cut <= 0) continue;

      const top = this.surface[x];
      for (let y = top; y < top + cut; y++) {
        this.set(x, y, TILE.AIR);
        // exposed strata: soil near the rim, rock deeper down
        this.setWall(x, y, y > top + cut - 5 ? TILE.DARK_STONE : y > top + cut - 10 ? TILE.STONE : TILE.DRY_DIRT);
      }
      const bed = top + cut;
      this.set(x, bed, this.rand(x * 71) > 0.55 ? TILE.GRAVEL : TILE.RUBBLE);
      this.surface[x] = bed;

      // ledges clinging to the wall give a way down and something to find
      if (Math.abs(x - centerX) > halfWidth * 0.45 && this.rand(x * 131) > 0.66) {
        const ledgeY = top + Math.round(cut * (0.35 + this.rand(x * 17) * 0.4));
        for (let i = 0; i < 2 + Math.floor(this.rand(x * 19) * 3); i++) {
          this.set(x + i, ledgeY, TILE.STONE);
        }
      }
    }

    // a seep of water at the lowest point
    const bottom = this.surface[centerX];
    this.set(centerX, bottom - 1, TILE.WATER_SOURCE);
    this.set(centerX + 2, bottom, TILE.WET_DIRT);

    this.ravines.push({ centerX, halfWidth, rim, depth, floorY });
  }

  carveCreeks() {
    for (const cx of [58, 214, 612]) {
      const width = 7 + Math.floor(this.rand(cx) * 5);
      const depth = 3 + Math.floor(this.rand(cx * 3) * 2);
      for (let x = cx - width; x <= cx + width; x++) {
        if (!this.inBounds(x, 0)) continue;
        const t = 1 - Math.abs(x - cx) / (width + 1);
        const cut = Math.round(depth * t * t);
        if (cut <= 0) continue;
        const sy = this.surface[x];
        for (let y = sy; y < sy + cut; y++) this.set(x, y, TILE.AIR);
        const bed = sy + cut;
        this.set(x, bed, cut >= depth - 1 ? TILE.WET_DIRT : TILE.MUD);
        for (let y = sy; y < bed; y++) this.setWall(x, y, TILE.WET_DIRT);
        this.surface[x] = bed;
        if (cut >= depth) this.set(x, bed - 1, TILE.WATER_SOURCE);
      }
      this.creeks.push({ x: cx, width });
    }
  }

  // Stage 40: canais rasos e ilhas naturais tornam o brejo uma região com
  // silhueta e travessia próprias, sem criar paredes de água intransponíveis.
  carveGreenwater() {
    for (const cx of [1088, 1160, 1188, 1268]) {
      const width = cx === 1160 ? 13 : 8;
      for (let x=cx-width;x<=cx+width;x++) {
        if(!this.inBounds(x,0))continue;
        const edge=1-Math.abs(x-cx)/(width+1),cut=Math.max(0,Math.round(edge*edge*4));
        if(!cut)continue;
        const top=this.surface[x];
        for(let y=top;y<top+cut;y++){this.set(x,y,TILE.AIR);this.setWall(x,y,TILE.WET_DIRT);}
        const bed=top+cut;this.set(x,bed,cut>=3?TILE.WET_DIRT:TILE.MUD);this.surface[x]=bed;
        if(cut>=3&&x%3!==0)this.set(x,bed-1,TILE.WATER_SOURCE);
      }
      this.creeks.push({x:cx,width,greenwater:true});
    }
  }

  /* ---------------------------------------------------------------- caves */

  // Worm-carved caves with a few mouths opening on the surface, so the
  // underground is somewhere you find rather than fall into.
  carveCaves() {
    const count = 26;
    for (let i = 0; i < count; i++) {
      const startX = 20 + Math.floor(this.rand(i * 733) * (CONFIG.WORLD_W - 40));
      const openToSky = this.rand(i * 941) > 0.62;
      let x = startX;
      let y = openToSky ? this.surface[startX] + 2 : this.surface[startX] + 14 + Math.floor(this.rand(i * 331) * 26);
      let angle = openToSky ? 1.35 + (this.rand(i * 97) - 0.5) * 0.7 : (this.rand(i * 97) - 0.5) * 2.4;
      const length = 50 + Math.floor(this.rand(i * 199) * 150);
      let radius = 1.6 + this.rand(i * 277) * 1.5;

      if (openToSky) this.caveMouths.push({ x: startX, y: this.surface[startX] });

      for (let step = 0; step < length; step++) {
        angle += (this.noise2(step, i * 30, 12, 29) - 0.5) * 0.55;
        // keep tunnels inside the rock
        if (y < this.surface[Math.max(0, Math.min(CONFIG.WORLD_W - 1, Math.round(x)))] + 3) angle = Math.abs(angle) + 0.2;
        if (y > CONFIG.WORLD_H - 12) angle = -Math.abs(angle);
        x += Math.cos(angle) * 1.1;
        y += Math.sin(angle) * 1.1;
        if (x < 6 || x > CONFIG.WORLD_W - 6) break;
        radius = Math.max(1.3, Math.min(3.4, radius + (this.rand(step * 13 + i) - 0.5) * 0.3));
        this.carveBlob(Math.round(x), Math.round(y), radius);
      }
    }
  }

  // Stage 28B — rooms, so the underground is not one long worm tunnel.
  //
  // Most chambers are grown around a tile the cave network already reached, so
  // they are connected by construction. A few are deliberately sealed pockets:
  // you only find those by digging, and they carry the best of what is down
  // here. Ore seeding runs afterwards and fills the new rock faces normally.
  carveCaveChambers() {
    const W = CONFIG.WORLD_W, H = CONFIG.WORLD_H;
    const TARGET = 34;
    let tries = 0;

    while (this.caveChambers.length < TARGET && tries < TARGET * 40) {
      const i = tries++;
      const x = 24 + Math.floor(this.rand(i * 1301) * (W - 48));
      const surf = this.surface[x];
      const maxY = H - 8;
      const minY = surf + 26;
      if (minY >= maxY) continue;
      const y = minY + Math.floor(this.rand(i * 1409) * (maxY - minY));

      // Prefer growing the room around rock the caves already reached, so most
      // chambers are connected. Only when nothing is near does it become a
      // sealed pocket you have to dig for, and those are kept rare.
      const spot = this.nearestCaveAir(x, y, 9);
      const sealedSoFar = this.caveChambers.filter(c => c.sealed).length;
      const sealed = !spot;
      if (sealed && (sealedSoFar >= 9 || this.rand(i * 1487) > 0.5)) continue;
      const ax = spot ? spot.x : x, ay = spot ? spot.y : y;

      // keep them apart so the map does not turn into one cavity
      if (this.caveChambers.some(c => Math.abs(c.x - ax) < 26 && Math.abs(c.y - ay) < 18)) continue;

      const depth = ay - surf;
      const big = this.rand(i * 1523) > 0.66;
      const rx = (big ? 9 : 6) + this.rand(i * 1571) * (big ? 6 : 4);
      const ry = (big ? 5 : 3.5) + this.rand(i * 1613) * (big ? 3 : 2);

      // A room must have a real roof over its whole width, or it undermines
      // the ground people are standing on up top.
      if (!this.chamberHasRoof(ax, ay, rx, ry)) continue;

      this.carveChamber(ax, ay, rx, ry, i);
      this.caveChambers.push({
        x: ax, y: ay, rx: Math.round(rx), ry: Math.round(ry), depth, sealed, big,
        // the dressing pass in js/underground.js picks the theme from this
        roll: this.rand(i * 1699)
      });
    }
  }

  // True when every column the room spans keeps at least ROOF tiles of rock
  // between the room's ceiling and the surface.
  chamberHasRoof(cx, cy, rx, ry) {
    const ROOF = 14;
    const top = Math.floor(cy - ry) - 2;
    for (let x = Math.floor(cx - rx) - 2; x <= Math.ceil(cx + rx) + 2; x++) {
      if (x < 2 || x >= CONFIG.WORLD_W - 2) return false;
      if (top - this.surface[x] < ROOF) return false;
    }
    return true;
  }

  // Closest carved cave tile within `r`, or null. Used to hang new rooms off
  // the existing network instead of scattering disconnected holes.
  nearestCaveAir(cx, cy, r) {
    let best = null, bestD = Infinity;
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (!this.inBounds(x, y) || y <= this.surface[x] + 6) continue;
        if (this.get(x, y) !== TILE.AIR) continue;
        const d = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (d < bestD) { bestD = d; best = { x, y }; }
      }
    }
    return best;
  }

  // An irregular room: an ellipse with a noisy rim so it never reads as a
  // stamped circle, and a flattened floor so it is somewhere you can stand.
  carveChamber(cx, cy, rx, ry, salt) {
    const ri = Math.ceil(rx) + 2, rj = Math.ceil(ry) + 2;
    for (let y = cy - rj; y <= cy + rj; y++) {
      for (let x = cx - ri; x <= cx + ri; x++) {
        if (!this.inBounds(x, y) || y < 2) continue;
        if (y <= this.surface[x] + 3) continue;             // never break the surface
        const wob = (this.noise2(x * 2, y * 2, 5, salt * 7 + 11) - 0.5) * 0.42;
        const dx = (x - cx) / (rx * (1 + wob));
        const dy = (y - cy) / (ry * (1 + wob));
        if (dx * dx + dy * dy > 1) continue;
        const i = this.idx(x, y);
        this.tiles[i] = TILE.AIR;
        if (!this.walls[i]) this.walls[i] = TILE.DARK_STONE;
      }
    }
    // a floor to stand on, one tile below the rim
    const fy = cy + Math.round(ry);
    for (let x = cx - Math.round(rx); x <= cx + Math.round(rx); x++) {
      if (!this.inBounds(x, fy)) continue;
      if (this.get(x, fy) !== TILE.AIR) continue;
      const below = this.get(x, fy + 1);
      if (below === TILE.AIR) this.set(x, fy + 1, this.rand(x * 31 + salt) > 0.5 ? TILE.GRAVEL : TILE.DARK_STONE);
    }
  }

  carveBlob(cx, cy, r) {
    const ri = Math.ceil(r);
    for (let y = cy - ri; y <= cy + ri; y++) {
      for (let x = cx - ri; x <= cx + ri; x++) {
        if (!this.inBounds(x, y) || y < 2) continue;
        const dx = (x - cx) / r, dy = (y - cy) / (r * 0.82);
        if (dx * dx + dy * dy > 1) continue;
        if (y <= this.surface[x]) continue;      // never cut into the sky
        const i = this.idx(x, y);
        this.tiles[i] = TILE.AIR;
        if (!this.walls[i]) this.walls[i] = TILE.STONE;
      }
    }
  }

  // Straight service tunnel used by structures (drainage, mine, bunker links).
  digTunnel(x0, x1, y, height = 3, wall = TILE.CONCRETE, floor = TILE.GRAVEL) {
    const lo = Math.min(x0, x1), hi = Math.max(x0, x1);
    for (let x = lo; x <= hi; x++) {
      for (let h = 0; h < height; h++) {
        this.set(x, y - h, TILE.AIR);
        this.setWall(x, y - h, wall);
      }
      this.set(x, y + 1, floor);
      this.set(x, y - height, wall === TILE.AIR ? TILE.STONE : wall);
    }
  }

  /* ------------------------------------------------------ underground ore */

  generateOreVeins() {
    const defs = [
      { tile:TILE.COAL_ORE, count:78, minDepth:12, maxDepth:72, steps:[5,13], radius:[1,2] },
      { tile:TILE.COPPER_ORE, count:54, minDepth:18, maxDepth:84, steps:[4,11], radius:[1,2] },
      { tile:TILE.IRON_ORE, count:48, minDepth:24, maxDepth:96, steps:[4,10], radius:[1,2] },
      { tile:TILE.QUARTZ_ORE, count:28, minDepth:38, maxDepth:112, steps:[3,8], radius:[1,2] },
      // Stage 28: deeper progression nodes. Rich pockets are intentionally rarer
      // so a good find feels like an expedition result rather than background noise.
      { tile:TILE.NICKEL_ORE, count:22, minDepth:52, maxDepth:122, steps:[3,7], radius:[1,2] },
      { tile:TILE.RICH_IRON_ORE, count:18, minDepth:58, maxDepth:128, steps:[3,6], radius:[1,2] },
      { tile:TILE.CRYSTAL_VEIN, count:11, minDepth:72, maxDepth:136, steps:[2,5], radius:[1,1] },
      { tile:TILE.BLACKRIDGE_MINERAL, count:7, minDepth:88, maxDepth:144, steps:[2,4], radius:[1,1], minX:790, maxX:952 }
    ];

    let salt = 5001;
    for (const def of defs) {
      for (let n = 0; n < def.count; n++) {
        const minX = Math.max(8, def.minX ?? 8);
        const maxX = Math.min(CONFIG.WORLD_W - 8, def.maxX ?? (CONFIG.WORLD_W - 8));
        const x0 = minX + Math.floor(this.rand(salt++) * Math.max(1, maxX - minX));
        const depth = def.minDepth + Math.floor(this.rand(salt++) * (def.maxDepth - def.minDepth + 1));
        let x = x0;
        let y = Math.min(CONFIG.WORLD_H - 6, this.surface[x0] + depth);
        const steps = def.steps[0] + Math.floor(this.rand(salt++) * (def.steps[1] - def.steps[0] + 1));
        let placed = 0;

        for (let step = 0; step < steps; step++) {
          const r = def.radius[0] + Math.floor(this.rand(salt++) * (def.radius[1] - def.radius[0] + 1));
          for (let oy = -r; oy <= r; oy++) {
            for (let ox = -r; ox <= r; ox++) {
              if (ox * ox + oy * oy > r * r + .6) continue;
              const tx = x + ox, ty = y + oy;
              if (!this.inBounds(tx, ty)) continue;
              const current = this.get(tx, ty);
              if (![TILE.STONE, TILE.CRACKED_STONE, TILE.DARK_STONE, TILE.SLATE, TILE.MOSS_STONE, TILE.WET_STONE].includes(current)) continue;
              this.tiles[this.idx(tx, ty)] = def.tile;
              placed++;
            }
          }
          x += Math.round((this.rand(salt++) - .5) * 4);
          y += Math.round((this.rand(salt++) - .5) * 3);
          x = Math.max(3, Math.min(CONFIG.WORLD_W - 4, x));
          y = Math.max(this.surface[x] + def.minDepth, Math.min(CONFIG.WORLD_H - 5, y));
        }
        if (placed) this.oreVeins.push({ tile:def.tile, x:x0, y, placed });
      }
    }

    // Deep geology now uses both the Stage 20 material library and the restored
    // mining progression, so caves stop looking like one repeated stone field.
    for (let x = 2; x < CONFIG.WORLD_W - 2; x++) {
      const sy = this.surface[x];
      for (let y = Math.min(CONFIG.WORLD_H - 2, sy + 34); y < CONFIG.WORLD_H - 2; y++) {
        const i = this.idx(x, y);
        if (this.tiles[i] === TILE.DARK_STONE && this.noise2(x, y, 10, 211) > .82) this.tiles[i] = TILE.SLATE;
        if ((this.tiles[i] === TILE.STONE || this.tiles[i] === TILE.CRACKED_STONE) && this.noise2(x, y, 7, 223) > .90) this.tiles[i] = TILE.MOSS_STONE;
        if (this.tiles[i] === TILE.STONE && this.noise2(x, y, 9, 233) > .94) this.tiles[i] = TILE.WET_STONE;
      }
    }
  }

  undergroundZoneAt(tileX, tileY) {
    return this.undergroundZones.find(z => tileX >= z.x1 && tileX <= z.x2 && tileY >= z.y1 && tileY <= z.y2) || null;
  }

  /* ----------------------------------------------------------- vegetation */

  plantVegetation() {
    for (let x = 4; x < CONFIG.WORLD_W - 4; x++) {
      const region = this.region(x);
      const r = this.rand(x * 41);
      if (r < region.trees * 0.27) {
        const kind = this.rand(x * 97) < region.pines ? 'pine' : this.rand(x * 53) < region.deadTrees ? 'dead' : 'broadleaf';
        this.makeTree(x, kind);
        x += 2 + Math.floor(this.rand(x * 13) * 3);
      }
    }

    for (let x = 2; x < CONFIG.WORLD_W - 2; x++) {
      const region = this.region(x);
      const y = this.surface[x] - 1;
      if (this.get(x, y) !== TILE.AIR || !this.isSolid(x, y + 1)) continue;
      const r = this.rand(x * 313 + 7);
      if (r < region.tallGrass * 0.68) this.set(x, y, TILE.TALL_GRASS);
      else if (r < region.tallGrass * 0.68 + region.flowers * 0.24) this.set(x, y, TILE.DRY_FLOWERS);
    }
  }

  makeTree(x, kind = 'broadleaf') {
    const groundY = this.surface[x];
    if (!this.isSolid(x, groundY)) return;

    if (kind === 'dead') {
      const height = 4 + Math.floor(this.rand(x * 73) * 4);
      for (let i = 1; i <= height; i++) this.set(x, groundY - i, TILE.DARK_WOOD);
      for (let i = 0; i < 3; i++) {
        const by = groundY - height + i * 2;
        const dir = this.rand(x * 17 + i) > 0.5 ? 1 : -1;
        this.set(x + dir, by, TILE.DARK_WOOD);
        if (this.rand(x * 29 + i) > 0.5) this.set(x + dir * 2, by - 1, TILE.DARK_WOOD);
      }
      return;
    }

    if (kind === 'pine') {
      const height = 7 + Math.floor(this.rand(x * 73) * 6);
      for (let i = 1; i <= height; i++) this.set(x, groundY - i, TILE.WOOD);
      for (let layer = 0; layer < height - 2; layer++) {
        const y = groundY - 2 - layer;
        const spread = Math.max(1, Math.round((height - layer) * 0.32));
        for (let ox = -spread; ox <= spread; ox++) {
          if (ox === 0) continue;
          const tx = x + ox;
          if (this.inBounds(tx, y) && this.get(tx, y) === TILE.AIR) this.set(tx, y, TILE.LEAF);
        }
      }
      this.set(x, groundY - height - 1, TILE.LEAF);
      return;
    }

    const height = 4 + Math.floor(this.rand(x * 73) * 4);
    for (let i = 1; i <= height; i++) this.set(x, groundY - i, TILE.WOOD);
    const crownY = groundY - height;
    const rx = 2 + Math.floor(this.rand(x * 211) * 2);
    const ry = 2 + Math.floor(this.rand(x * 223) * 2);
    for (let ox = -rx; ox <= rx; ox++) {
      for (let oy = -ry; oy <= 1; oy++) {
        const d = (ox * ox) / (rx * rx) + (oy * oy) / (ry * ry);
        if (d > 1.15) continue;
        if (d > 0.8 && this.rand(x * 31 + ox * 13 + oy * 7) > 0.55) continue;
        const tx = x + ox, ty = crownY + oy;
        if (this.inBounds(tx, ty) && this.get(tx, ty) === TILE.AIR) this.set(tx, ty, TILE.LEAF);
      }
    }
    if (this.rand(x * 601) > 0.72) {
      const vx = x + (this.rand(x * 607) > 0.5 ? rx : -rx);
      for (let i = 0; i < 2 + Math.floor(this.rand(x * 613) * 3); i++) {
        const vy = crownY + 1 + i;
        if (this.inBounds(vx, vy) && this.get(vx, vy) === TILE.AIR) this.set(vx, vy, TILE.VINE);
      }
    }
  }

  generateForage() {
    for (let x = 14; x < CONFIG.WORLD_W - 10; x += 5) {
      const region = this.region(x);
      const y = this.surface[x] - 1;
      if (this.rand(x * 313) < region.bushes && this.get(x, y) === TILE.AIR && this.isSolid(x, y + 1)) {
        this.set(x, y, TILE.BERRY_BUSH);
      }
    }
  }

  generateWaterSources() {
    for (let x = 30; x < CONFIG.WORLD_W - 20; x += 37) {
      if (this.rand(x * 911) < 0.45) continue;
      const y = this.surface[x] - 1;
      if (this.get(x, y) === TILE.AIR && this.isSolid(x, y + 1)) this.set(x, y, TILE.WATER_SOURCE);
    }
  }

  /* ---------------------------------------------------------------- mining */

  mine(x, y, power = 12) {
    if (!this.inBounds(x, y)) return null;

    const tile = this.get(x, y);
    if (tile === TILE.AIR) return null;

    const info = TILE_INFO[tile];
    if (info.mineable === false || info.hp <= 0) return { blocked: true, tile };

    const key = this.idx(x, y);
    const current = (this.damage.get(key) || 0) + power;

    if (current >= info.hp) {
      this.set(x, y, TILE.AIR);
      this.damage.delete(key);
      return {
        broken: true,
        tile,
        dropItem: info.dropItem || null,
        dropQty: info.dropQty || 0
      };
    }

    this.damage.set(key, current);
    this.notify(x, y);
    return { broken: false, tile, progress: current / info.hp };
  }

  damageAt(x, y) {
    return this.damage.get(this.idx(x, y)) || 0;
  }

  canPlace(x, y) {
    if (!this.inBounds(x, y)) return false;
    if (this.get(x, y) !== TILE.AIR) return false;

    return (
      this.get(x + 1, y) !== TILE.AIR ||
      this.get(x - 1, y) !== TILE.AIR ||
      this.get(x, y + 1) !== TILE.AIR ||
      this.get(x, y - 1) !== TILE.AIR ||
      this.getWall(x, y) !== TILE.AIR
    );
  }

  groundY(tileX, hintY) {
    tileX = Math.max(1, Math.min(CONFIG.WORLD_W - 2, tileX | 0));
    const hint = Math.max(0, Math.min(CONFIG.WORLD_H - 1, hintY == null ? this.surface[tileX] : hintY | 0));

    for (let y = hint; y < CONFIG.WORLD_H - 1; y++) {
      if (this.isSolid(tileX, y)) return y;
    }
    for (let y = hint - 1; y >= 1; y--) {
      if (this.isSolid(tileX, y)) return y;
    }
    return this.surface[tileX];
  }

  hasHeadroom(tileX, groundY, height = 2) {
    for (let i = 1; i <= height; i++) if (this.isSolid(tileX, groundY - i)) return false;
    return true;
  }

  // True when the column is open sky above — used to keep spawns outdoors or
  // indoors deliberately rather than by accident.
  isIndoors(tileX, tileY) {
    for (let y = tileY - 1; y >= Math.max(0, tileY - 22); y--) {
      if (this.isSolid(tileX, y)) return true;
    }
    return false;
  }
}
