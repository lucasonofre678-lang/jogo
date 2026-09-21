// Stage 28 — Mining & Resource Progression Overhaul.
// Keeps mining readable and gamey: better tools unlock deeper materials,
// prospecting helps locate veins, and rich deposits reward going farther down.

const MINING_TIERS = [
  { id:0, name:'MÃO/IMPROVISO', short:'M0' },
  { id:1, name:'PEDRA', short:'M1' },
  { id:2, name:'AÇO', short:'M2' },
  { id:3, name:'INDUSTRIAL', short:'M3' },
  { id:4, name:'BLACKRIDGE', short:'M4' }
];

const MINERAL_TILE_META = {
  [TILE.COAL_ORE]:            { id:'coal',              name:'Carvão',               tier:1, baseQty:2, rarity:1.0 },
  [TILE.COPPER_ORE]:          { id:'copper_ore',        name:'Cobre',                tier:1, baseQty:1, rarity:.85 },
  [TILE.IRON_ORE]:            { id:'iron_ore',          name:'Ferro',                tier:1, baseQty:1, rarity:.8 },
  [TILE.QUARTZ_ORE]:          { id:'quartz',            name:'Quartzo',              tier:2, baseQty:1, rarity:.55 },
  [TILE.NICKEL_ORE]:          { id:'nickel_ore',        name:'Níquel',               tier:2, baseQty:1, rarity:.42 },
  [TILE.RICH_IRON_ORE]:       { id:'iron_ore',          name:'Ferro rico',           tier:2, baseQty:2, rarity:.32, rich:true },
  [TILE.CRYSTAL_VEIN]:        { id:'crystal_shard',     name:'Cristal profundo',     tier:3, baseQty:1, rarity:.16, rich:true },
  [TILE.BLACKRIDGE_MINERAL]:  { id:'blackridge_mineral',name:'Mineral Blackridge',   tier:4, baseQty:1, rarity:.05, rich:true }
};

class MiningSystem {
  constructor(world, inventory) {
    this.world = world;
    this.inventory = inventory;
    this.discovered = new Set();
    this.mined = Object.create(null);
    this.blocksMined = 0;
    this.deepestDepth = 0;
    this.richDeposits = 0;
    this.scans = 0;
    this.lastScanAt = -999;
  }

  toolTier(itemId) {
    const def = itemId ? ITEM_DEFS[itemId] : null;
    return Math.max(0, Math.floor(def?.miningTier || 0));
  }

  toolPower(itemId, tile) {
    const def = itemId ? ITEM_DEFS[itemId] : null;
    if (def?.toolType === 'pickaxe') return Math.max(4, def.miningPower || 16);
    const meta = MINERAL_TILE_META[tile];
    if (meta) return 3;
    return null;
  }

  requiredTier(tile) {
    const meta = MINERAL_TILE_META[tile];
    if (meta) return meta.tier;
    if (tile === TILE.SLATE || tile === TILE.DARK_STONE) return 1;
    if ([TILE.CONTAINMENT, TILE.DARK_METAL, TILE.TECH_PANEL].includes(tile)) return 3;
    return 0;
  }

  canMine(tile, itemId) {
    const required = this.requiredTier(tile);
    if (required <= 0) return { ok:true, required, current:this.toolTier(itemId) };
    const current = this.toolTier(itemId);
    return { ok:current >= required, required, current };
  }

  depthAt(x, y) {
    const sx = Math.max(0, Math.min(CONFIG.WORLD_W - 1, x | 0));
    return Math.max(0, (y | 0) - (this.world.surface[sx] || 0));
  }

  yieldFor(tile, x, y, itemId) {
    const info = TILE_INFO[tile];
    const meta = MINERAL_TILE_META[tile];
    if (!meta) return info?.dropItem ? [{ id:info.dropItem, qty:info.dropQty || 1 }] : [];

    const def = itemId ? ITEM_DEFS[itemId] : null;
    const toolTier = this.toolTier(itemId);
    let qty = meta.baseQty;

    // Better tools are mostly about access/speed. A small yield edge makes the
    // upgrade feel rewarding without turning mining into exponential farming.
    const edge = Math.max(0, toolTier - meta.tier);
    const h = this.hash(x, y, this.blocksMined + tile * 19);
    if (edge > 0 && h < Math.min(.35, edge * .12)) qty += 1;
    if (meta.rich && h > .68) qty += 1;

    const drops = [{ id:meta.id, qty }];
    // Deep crystal pockets occasionally carry a generic precision component;
    // this connects mining to later crafting without real-world manufacturing detail.
    if (tile === TILE.CRYSTAL_VEIN && this.hash(x, y, 901) > .86) drops.push({ id:'precision_parts', qty:1 });
    if (tile === TILE.BLACKRIDGE_MINERAL && this.hash(x, y, 1201) > .80) drops.push({ id:'circuit_parts', qty:1 });
    return drops.filter(d => ITEM_DEFS[d.id]);
  }

  onBroken(tile, x, y, itemId) {
    this.blocksMined += 1;
    const depth = this.depthAt(x, y);
    this.deepestDepth = Math.max(this.deepestDepth, depth);
    const meta = MINERAL_TILE_META[tile];
    const drops = this.yieldFor(tile, x, y, itemId);
    if (meta) {
      this.discovered.add(meta.id);
      this.mined[meta.id] = (this.mined[meta.id] || 0) + drops.filter(d => d.id === meta.id).reduce((a,d)=>a+d.qty,0);
      if (meta.rich) this.richDeposits += 1;
    }
    return { drops, depth, meta, milestone:this.milestone() };
  }

  milestone() {
    if (this.discovered.has('blackridge_mineral')) return 4;
    if (this.discovered.has('crystal_shard')) return 3;
    if (this.discovered.has('nickel_ore') || this.discovered.has('quartz')) return 2;
    if (this.discovered.has('iron_ore') || this.discovered.has('copper_ore') || this.discovered.has('coal')) return 1;
    return 0;
  }

  scan(tileX, tileY, nowSeconds = 0) {
    if (nowSeconds - this.lastScanAt < 3.5) return { ok:false, reason:'O scanner ainda está recalibrando.' };
    this.lastScanAt = nowSeconds;
    this.scans += 1;
    const radius = 18;
    let best = null;
    for (let y = Math.max(1, tileY-radius); y <= Math.min(CONFIG.WORLD_H-2, tileY+radius); y++) {
      for (let x = Math.max(1, tileX-radius); x <= Math.min(CONFIG.WORLD_W-2, tileX+radius); x++) {
        const tile = this.world.get(x,y);
        const meta = MINERAL_TILE_META[tile];
        if (!meta) continue;
        const dx=x-tileX, dy=y-tileY, dist=Math.hypot(dx,dy);
        if (dist > radius) continue;
        const score = (1 / Math.max(2,dist)) * (1 + (1-meta.rarity)*.7) * (meta.rich ? 1.2 : 1);
        if (!best || score > best.score) best={x,y,tile,meta,dist,dx,dy,score};
      }
    }
    if (!best) return { ok:true, found:false, text:'Nenhuma assinatura mineral forte por perto.' };
    const horiz = Math.abs(best.dx) < 2 ? '' : best.dx > 0 ? 'leste' : 'oeste';
    const vert = Math.abs(best.dy) < 2 ? '' : best.dy > 0 ? 'abaixo' : 'acima';
    const dir = [vert,horiz].filter(Boolean).join(' e ') || 'muito perto';
    const strength = best.dist < 5 ? 'MUITO FORTE' : best.dist < 10 ? 'FORTE' : 'MODERADO';
    return { ok:true, found:true, tile:best.tile, meta:best.meta, distance:best.dist, text:`Sinal ${strength}: ${best.meta.name} ${dir}.` };
  }

  summary() {
    return {
      blocksMined:this.blocksMined,
      deepestDepth:this.deepestDepth,
      richDeposits:this.richDeposits,
      scans:this.scans,
      milestone:this.milestone(),
      discovered:[...this.discovered],
      mined:{...this.mined}
    };
  }

  exportState() { return this.summary(); }
  importState(state) {
    if (!state) return;
    this.blocksMined = state.blocksMined || 0;
    this.deepestDepth = state.deepestDepth || 0;
    this.richDeposits = state.richDeposits || 0;
    this.scans = state.scans || 0;
    this.discovered = new Set(state.discovered || []);
    this.mined = {...(state.mined || {})};
  }

  hash(x,y,salt=0) {
    let h = Math.imul((x|0)+salt*17, 374761393) ^ Math.imul((y|0)-salt*13, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
}
