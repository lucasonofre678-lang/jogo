// Stage 32 — Modo Livre.
//
// A ideia é curta: fora do sistema de sobrevivência, TODO material do jogo é
// um bloco que você pega e coloca. Nada de receita, nada de peso, nada de
// fome. O que este arquivo faz é montar essa paleta a partir do que o jogo já
// tem (os 86 tiles com arte e as 57 construções), guardar o que está na mão e
// executar colocar/remover sem passar pelo inventário.

// Famílias da paleta. A ordem aqui é a ordem das abas.
const CREATIVE_GROUPS = [
  { id: 'natureza', name: 'NATUREZA' },
  { id: 'terra', name: 'TERRA & ROCHA' },
  { id: 'madeira', name: 'MADEIRA' },
  { id: 'alvenaria', name: 'ALVENARIA' },
  { id: 'metal', name: 'METAL' },
  { id: 'interior', name: 'INTERIOR' },
  { id: 'urbano', name: 'URBANO' },
  { id: 'tecnico', name: 'TÉCNICO' },
  { id: 'minerio', name: 'MINÉRIO' },
  { id: 'construcao', name: 'CONSTRUÇÕES' },
  { id: 'recursos', name: 'RECURSOS' },
  { id: 'ferramentas', name: 'FERRAMENTAS' },
  { id: 'armas', name: 'ARMAS' },
  { id: 'equipamentos', name: 'EQUIPAMENTOS' },
  { id: 'consumiveis', name: 'CONSUMÍVEIS' },
  { id: 'especiais', name: 'BLACKRIDGE & ESPECIAIS' }
];

// De qual família cada tile faz parte. Vale a pena ser explícito: agrupar por
// heurística de nome erra justamente nos materiais que mais se parecem.
const CREATIVE_TILE_GROUPS = {
  grass: 'natureza', wet_grass: 'natureza', dead_grass: 'natureza', tall_grass: 'natureza',
  leaf: 'natureza', berry_bush: 'natureza', vine: 'natureza', dry_flowers: 'natureza',
  leaf_litter: 'natureza', hedge: 'natureza', water_source: 'natureza', mud: 'natureza',

  dirt: 'terra', dry_dirt: 'terra', wet_dirt: 'terra', gravel: 'terra', stone: 'terra',
  dark_stone: 'terra', cracked_stone: 'terra', moss_stone: 'terra', wet_stone: 'terra', slate: 'terra',

  wood: 'madeira', plank: 'madeira', floor_wood: 'madeira', dark_wood: 'madeira',
  old_wood: 'madeira', painted_wood: 'madeira', timber: 'madeira', fence: 'madeira',

  brick: 'alvenaria', old_brick: 'alvenaria', damaged_brick: 'alvenaria', sub_brick: 'alvenaria',
  concrete: 'alvenaria', cracked_concrete: 'alvenaria', dirty_concrete: 'alvenaria',
  old_concrete: 'alvenaria', wet_concrete: 'alvenaria', plaster: 'alvenaria', ceramic: 'alvenaria',

  metal: 'metal', rust_metal: 'metal', sheet_metal: 'metal', grate: 'metal', dark_metal: 'metal',
  chain_fence: 'metal', catwalk: 'metal', ladder: 'metal', rail: 'metal', roof_metal: 'metal',

  wallpaper: 'interior', wallpaper_warm: 'interior', wallpaper_blue: 'interior',
  peeling_wall: 'interior', wall_tile: 'interior', linoleum: 'interior', checker_floor: 'interior',
  carpet: 'interior', carpet_blue: 'interior', wall_panel: 'interior', glass: 'interior',

  asphalt: 'urbano', cracked_asphalt: 'urbano', road_line: 'urbano', rubble: 'urbano',
  roof_shingle: 'urbano', sandbag: 'urbano', industrial_floor: 'urbano', ind_panel: 'urbano',
  hazard_floor: 'urbano', station_tile: 'urbano',

  tech_wall: 'tecnico', tech_panel: 'tecnico', tech_floor: 'tecnico', lab_wall: 'tecnico',
  lab_floor: 'tecnico', containment: 'tecnico',

  coal_ore: 'minerio', iron_ore: 'minerio', copper_ore: 'minerio', quartz_ore: 'minerio'
};

class CreativeSystem {
  constructor({ world, building, structures, player, inventory }) {
    this.world = world;
    this.building = building;
    this.structures = structures;
    this.player = player;
    this.playerInventory = inventory;

    this.enabled = false;
    this.flying = false;
    this.selection = null;        // { kind:'tile'|'build', id, name }
    this.group = 'natureza';
    this.query = '';
    this.recent = [];
    this.onNotice = null;
    this.catalog = null;
  }

  /* ----------------------------------------------------------- catálogo */

  // Construído uma vez, a partir das mesmas tabelas que o jogo usa para
  // desenhar. Um tile novo em TILE_ASSET_NAMES entra aqui sozinho.
  build() {
    if (this.catalog) return this.catalog;
    const entries = [];

    for (const [rawId, asset] of Object.entries(TILE_ASSET_NAMES)) {
      const id = Number(rawId);
      const info = TILE_INFO[id];
      if (!info) continue;
      entries.push({
        kind: 'tile', id, asset,
        name: info.name || asset,
        group: CREATIVE_TILE_GROUPS[asset] || 'urbano',
        solid: Boolean(info.solid),
        color: info.color || '#6b6a62'
      });
    }

    for (const [type, def] of Object.entries(BUILD_DEFS)) {
      entries.push({
        kind: 'build', id: type,
        name: def.name,
        group: 'construcao',
        category: def.category,
        color: def.color || '#776a55'
      });
    }

    for (const [id, def] of Object.entries(ITEM_DEFS)) {
      let group='recursos';
      if(def.gun||def.melee||def.category==='weapon')group='armas';
      else if(def.category==='tool')group='ferramentas';
      else if(def.slot||def.armor||['clothing','backpack','equipment'].includes(def.category))group='equipamentos';
      else if(['food','drink','medical'].includes(def.category))group='consumiveis';
      else if(/blackridge|key|card|document|quest|unique|special/i.test(`${id} ${def.category||''}`))group='especiais';
      entries.push({kind:'item',id,name:def.name||id,group,category:def.category,color:'#8a8068'});
    }

    this.catalog = entries;
    return entries;
  }

  groups() {
    const catalog = this.build();
    return CREATIVE_GROUPS.filter(g => catalog.some(e => e.group === g.id));
  }

  entries(group = this.group, query = this.query) {
    const q = String(query || '').trim().toLowerCase();
    return this.build().filter(e => {
      if (!q && e.group !== group) return false;
      if (!q) return true;
      return e.name.toLowerCase().includes(q) || String(e.asset || e.id).toLowerCase().includes(q);
    });
  }

  find(kind, id) {
    return this.build().find(e => e.kind === kind && String(e.id) === String(id)) || null;
  }

  iconFor(entry) {
    if (!entry) return null;
    if (entry.kind === 'item') return `assets/items/${entry.id}.png`;
    return entry.kind === 'build'
      ? `assets/build/${entry.id}.png`
      : `assets/tiles/${entry.asset}_0.png`;
  }

  select(kind, id) {
    const entry = this.find(kind, id);
    if (!entry) return null;
    this.selection = entry;
    this.recent = [entry, ...this.recent.filter(e => !(e.kind === entry.kind && e.id === entry.id))].slice(0, 9);
    return entry;
  }

  selectRecent(index) {
    const entry = this.recent[index];
    return entry ? this.select(entry.kind, entry.id) : null;
  }

  grantItem(id) {
    if(!this.enabled||!ITEM_DEFS[id])return{ok:false,reason:'Item indisponível'};
    const def=ITEM_DEFS[id],qty=def.stackable?Math.min(99,def.maxStack||64):1;
    this.playerInventory.maxWeight=Math.max(this.playerInventory.maxWeight,99999);
    const added=this.playerInventory.add(id,qty);
    return{ok:added>0,added,id};
  }

  /* ------------------------------------------------------------ ações */

  // Colocar no Modo Livre ignora inventário e apoio: a regra é "o que você vê
  // na mão é o que aparece no mundo".
  place(tileX, tileY) {
    if (!this.enabled || !this.selection) return { ok: false, reason: 'Nenhum bloco na mão' };
    if (!this.world.inBounds(tileX, tileY)) return { ok: false, reason: 'Fora do mundo' };

    if (this.selection.kind === 'build') {
      const result = this.building.place(this.selection.id, tileX, tileY, this.player, { free: true });
      return result.ok ? { ok: true, kind: 'build' } : { ok: false, reason: result.reason };
    }

    if (this.world.get(tileX, tileY) === this.selection.id) return { ok: false, silent: true };
    this.world.set(tileX, tileY, this.selection.id);
    this.world.damage.delete(this.world.idx(tileX, tileY));
    return { ok: true, kind: 'tile', tile: this.selection.id };
  }

  // Remover é instantâneo e apaga também a construção que ocupa a célula.
  remove(tileX, tileY) {
    if (!this.enabled) return { ok: false };
    const built = this.building.objects.find(o => {
      const cells = this.building.cellsFor(o.type, o.tileX, o.tileY);
      return cells.some(c => c.x === tileX && c.y === tileY);
    });
    if (built) {
      this.building.remove(built, { refund: false });
      return { ok: true, kind: 'build' };
    }
    const tile = this.world.get(tileX, tileY);
    if (tile === TILE.AIR) return { ok: false, silent: true };
    this.world.set(tileX, tileY, TILE.AIR);
    this.world.damage.delete(this.world.idx(tileX, tileY));
    return { ok: true, kind: 'tile', tile };
  }

  // Botão do meio: copia o que está sob o cursor para a mão, como todo
  // criativo faz.
  pick(tileX, tileY) {
    const built = this.building.objects.find(o => {
      const cells = this.building.cellsFor(o.type, o.tileX, o.tileY);
      return cells.some(c => c.x === tileX && c.y === tileY);
    });
    if (built) return this.select('build', built.type);
    const tile = this.world.get(tileX, tileY);
    if (tile === TILE.AIR) return null;
    return this.select('tile', tile);
  }

  /* -------------------------------------------------------------- voo */

  toggleFlight() {
    this.flying = !this.flying;
    if (!this.flying) this.player.vy = 0;
    return this.flying;
  }

  // Chamado no lugar da gravidade enquanto o voo está ligado.
  updateFlight(dt, input) {
    if (!this.flying) return false;
    const speed = 7.4 * (input.sprint ? 2.1 : 1);
    const up = input.up || input.jump;
    const down = input.down || input.crouch;
    this.player.vy = (up ? -speed : 0) + (down ? speed : 0);
    this.player.onGround = false;
    this.player.coyoteTimer = 0;
    return true;
  }

  exportState() {
    return {
      version: 1, flying: this.flying,
      selection: this.selection ? { kind: this.selection.kind, id: this.selection.id } : null,
      recent: this.recent.map(e => ({ kind: e.kind, id: e.id })),
      group: this.group
    };
  }

  importState(data) {
    if (!data || data.version !== 1) return false;
    this.flying = Boolean(data.flying);
    this.group = data.group || 'natureza';
    this.recent = (data.recent || []).map(r => this.find(r.kind, r.id)).filter(Boolean);
    if (data.selection) this.select(data.selection.kind, data.selection.id);
    return true;
  }
}
