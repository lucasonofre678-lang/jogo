const BUILD_DEFS = {
  wall: {
    name: "Parede de madeira",
    category: "DEFESA",
    description: "Parede simples de três blocos de altura.",
    cost: { wood: 4, nails: 4 },
    refund: { wood: 2, nails: 2 },
    maxHealth: 180,
    width: 1,
    height: 3,
    color: "#8b6544"
  },
  door: {
    name: "Porta reforçada",
    category: "ACESSO",
    description: "Porta de duas alturas que pode ser aberta com E.",
    cost: { wood: 5, nails: 5 },
    refund: { wood: 2, nails: 2 },
    maxHealth: 150,
    width: 1,
    height: 2,
    color: "#7d5a40"
  },
  barricade: {
    name: "Barricada",
    category: "DEFESA",
    description: "Bloqueio barato para corredores, portas ou janelas.",
    cost: { wood: 3, nails: 4 },
    refund: { wood: 1, nails: 2 },
    maxHealth: 120,
    width: 1,
    height: 2,
    color: "#6f5039"
  },
  crate: {
    name: "Caixa de armazenamento",
    category: "ARMAZENAMENTO",
    description: "Container persistente para guardar loot.",
    cost: { wood: 6, nails: 6 },
    refund: { wood: 3, nails: 3 },
    maxHealth: 100,
    width: 1,
    height: 1,
    color: "#72543b"
  },
  campfire: {
    name: "Fogueira",
    category: "UTILIDADE",
    description: "Use E para descansar. Consome 1 madeira, recupera energia e avança o tempo.",
    cost: { wood: 3, stone: 4 },
    refund: { wood: 1, stone: 2 },
    maxHealth: 80,
    width: 1,
    height: 1,
    color: "#b46c3c"
  },
  workbench: {
    name: "Bancada",
    category: "CRAFTING",
    description: "Desbloqueia receitas avançadas quando você está próximo.",
    cost: { wood: 8, nails: 8, scrap_metal: 2 },
    refund: { wood: 4, nails: 4, scrap_metal: 1 },
    maxHealth: 140,
    width: 2,
    height: 1,
    color: "#6d6252"
  },
  generator: {
    name: "Gerador portátil",
    category: "ENERGIA",
    description: "Produz eletricidade enquanto houver combustível. É barulhento.",
    cost: { scrap_metal: 8, nails: 6, battery: 1, wire: 4 },
    refund: { scrap_metal: 4, nails: 3, wire: 2 },
    maxHealth: 160,
    width: 2,
    height: 1,
    color: "#73583d"
  },
  plank_wall: { name:"Parede de tábuas", category:"ESTRUTURA", description:"Parede modular de tábuas envelhecidas.", cost:{wood:3,nails:2}, refund:{wood:1,nails:1}, maxHealth:125,width:1,height:2,color:"#79573d", tile:TILE.PLANK },
  brick_wall: { name:"Parede de tijolo", category:"ESTRUTURA", description:"Parede pesada de tijolo reaproveitado.", cost:{brick:4}, refund:{brick:2}, maxHealth:210,width:1,height:2,color:"#815348", tile:TILE.BRICK },
  metal_wall: { name:"Parede de chapa", category:"ESTRUTURA", description:"Chapa metálica improvisada para defesas.", cost:{scrap_metal:4,nails:2}, refund:{scrap_metal:2}, maxHealth:250,width:1,height:2,color:"#665d52", tile:TILE.RUST_METAL },
  window: { name:"Janela", category:"ESTRUTURA", description:"Janela simples para casas e postos de observação.", cost:{scrap_metal:1,concrete_chunk:1}, refund:{scrap_metal:1}, maxHealth:45,width:1,height:1,color:"#6f98a3", tile:TILE.GLASS },
  fence: { name:"Cerca de madeira", category:"DEFESA", description:"Cerca simples para dividir áreas e proteger hortas.", cost:{wood:2,nails:1}, refund:{wood:1}, maxHealth:70,width:1,height:1,color:"#77563c", tile:TILE.FENCE },
  wood_floor: { name:"Piso de madeira", category:"ESTRUTURA", description:"Piso interno de madeira recuperada.", cost:{wood:2,nails:1}, refund:{wood:1}, maxHealth:75,width:1,height:1,color:"#735039", tile:TILE.FLOOR_WOOD },
  roof_shingle: { name:"Telhado de telha", category:"TELHADO", description:"Cobertura inclinável visualmente em blocos.", cost:{wood:1,roof_shingle:1}, refund:{roof_shingle:1}, maxHealth:85,width:1,height:1,color:"#59453d", tile:TILE.ROOF_SHINGLE },
  roof_metal: { name:"Telhado metálico", category:"TELHADO", description:"Cobertura resistente de chapa corrugada.", cost:{scrap_metal:2,nails:1}, refund:{scrap_metal:1}, maxHealth:130,width:1,height:1,color:"#566164", tile:TILE.ROOF_METAL },
  gravel_floor: { name:"Piso de cascalho", category:"PISO", description:"Cascalho compactado para quintais e caminhos.", cost:{gravel:1}, refund:{gravel:1}, maxHealth:60,width:1,height:1,color:"#66635e", tile:TILE.GRAVEL },
  concrete_floor: { name:"Piso de concreto", category:"PISO", description:"Base sólida para oficinas e garagens.", cost:{concrete_chunk:2}, refund:{concrete_chunk:1}, maxHealth:160,width:1,height:1,color:"#777b7b", tile:TILE.CONCRETE },
  ceramic_floor: { name:"Piso cerâmico", category:"PISO", description:"Piso interno recuperado de clínicas e prédios públicos.", cost:{concrete_chunk:1}, refund:{concrete_chunk:1}, maxHealth:90,width:1,height:1,color:"#9ba3a0", tile:TILE.CERAMIC },
  painted_wall: { name:"Parede pintada", category:"ESTRUTURA", description:"Madeira reaproveitada com acabamento melhor para interiores.", cost:{wood:3,nails:2}, refund:{wood:1,nails:1}, maxHealth:135,width:1,height:2,color:"#6c7260", tile:TILE.PAINTED_WOOD },
  panel_wall: { name:"Painel industrial", category:"ESTRUTURA", description:"Painel modular de metal para oficinas e abrigos.", cost:{scrap_metal:3,nails:2}, refund:{scrap_metal:1}, maxHealth:175,width:1,height:2,color:"#6f7777", tile:TILE.WALL_PANEL },
  chain_fence: { name:"Tela metálica", category:"DEFESA", description:"Cerca metálica para perímetros e áreas industriais.", cost:{scrap_metal:2,wire:2}, refund:{scrap_metal:1,wire:1}, maxHealth:115,width:1,height:2,color:"#6e7777", tile:TILE.CHAIN_FENCE },
  rubble_floor: { name:"Entulho compactado", category:"PISO", description:"Piso improvisado usando restos de demolição.", cost:{concrete_chunk:1,stone:1}, refund:{stone:1}, maxHealth:70,width:1,height:1,color:"#646665", tile:TILE.RUBBLE },
  rail_section: { name:"Trecho de trilho", category:"ESTRUTURA", description:"Trilho pesado recuperado de pátios ferroviários.", cost:{scrap_metal:3}, refund:{scrap_metal:2}, maxHealth:190,width:1,height:1,color:"#555b5e", tile:TILE.RAIL },
  platform: {
    name:"Plataforma",
    category:"ESTRUTURA",
    description:"Passarela modular de madeira para bases em vários níveis.",
    cost:{wood:2,nails:1}, refund:{wood:1}, maxHealth:80,width:1,height:1,color:"#76553d",tile:TILE.FLOOR_WOOD, supportMode:"adjacent"
  },
  stairs_left: {
    name:"Escada inclinada ↗",
    category:"ESTRUTURA",
    description:"Escada em degraus para ligar dois níveis da base.",
    cost:{wood:6,nails:4}, refund:{wood:3,nails:1}, maxHealth:110,width:3,height:3,color:"#76553d",shape:"stairs_left",supportMode:"adjacent"
  },
  stairs_right: {
    name:"Escada inclinada ↖",
    category:"ESTRUTURA",
    description:"Versão espelhada da escada modular.",
    cost:{wood:6,nails:4}, refund:{wood:3,nails:1}, maxHealth:110,width:3,height:3,color:"#76553d",shape:"stairs_right",supportMode:"adjacent"
  },
  roof_slope_left: {
    name:"Telhado inclinado ↗",
    category:"TELHADO",
    description:"Trecho de telhado inclinado para quebrar o visual de caixas.",
    cost:{roof_shingle:3,wood:2}, refund:{roof_shingle:2}, maxHealth:90,width:3,height:3,color:"#5e4d46",shape:"roof_left",supportMode:"adjacent"
  },
  roof_slope_right: {
    name:"Telhado inclinado ↖",
    category:"TELHADO",
    description:"Trecho espelhado de telhado inclinado.",
    cost:{roof_shingle:3,wood:2}, refund:{roof_shingle:2}, maxHealth:90,width:3,height:3,color:"#5e4d46",shape:"roof_right",supportMode:"adjacent"
  },
  garage_door: {
    name:"Portão de garagem",
    category:"ACESSO",
    description:"Portão largo para bases com veículos. Abra ou feche com E.",
    cost:{scrap_metal:8,nails:6,wire:2}, refund:{scrap_metal:4,nails:2}, maxHealth:260,width:3,height:3,color:"#61696b",shape:"garage_door"
  },
  auto_bench: {
    name:"Bancada automotiva",
    category:"GARAGEM",
    description:"Libera fabricação e montagem de módulos de veículos.",
    cost:{scrap_metal:8,wood:4,nails:6,wire:3}, refund:{scrap_metal:4,wood:2,wire:1}, maxHealth:180,width:2,height:1,color:"#6b6255",objectOnly:true
  },
  vehicle_frame: {
    name:"Armação de veículo",
    category:"GARAGEM",
    description:"Base para montar um veículo improvisado módulo por módulo.",
    cost:{scrap_metal:10,nails:6,garage_parts:2}, refund:{scrap_metal:5,nails:2}, maxHealth:180,width:3,height:1,color:"#697174",objectOnly:true
  },
  shelf_build: {
    name:"Estante",
    category:"DECORAÇÃO",
    description:"Móvel simples para deixar interiores menos vazios.",
    cost:{wood:4,nails:3}, refund:{wood:2}, maxHealth:70,width:1,height:1,color:"#74563f",objectOnly:true,decor:"shelf"
  },
  table_build: {
    name:"Mesa",
    category:"DECORAÇÃO",
    description:"Mesa reaproveitada para interiores e abrigos.",
    cost:{wood:3,nails:2}, refund:{wood:1}, maxHealth:65,width:1,height:1,color:"#74563f",objectOnly:true,decor:"table"
  },
  bed_build: {
    name:"Cama improvisada",
    category:"DECORAÇÃO",
    description:"Peça de interior para tornar a base mais habitável.",
    cost:{wood:4,cloth:4,nails:2}, refund:{wood:2,cloth:1}, maxHealth:60,width:2,height:1,color:"#6b5c52",objectOnly:true,decor:"bed"
  },
  wall_lamp: {
    name:"Luminária elétrica",
    category:"ENERGIA",
    description:"Luz compacta que funciona perto de um gerador ligado.",
    cost:{scrap_metal:1,wire:2}, refund:{wire:1}, maxHealth:55,width:1,height:1,color:"#b7aa72",objectOnly:true,supportMode:"adjacent"
  },
  reinforced_wall: {
    name:"Parede reforçada", category:"ESTRUTURA",
    description:"Parede pesada feita com placas reforçadas e concreto.",
    cost:{steel_plate:2,concrete_chunk:1}, refund:{steel_plate:1}, maxHealth:420,width:1,height:2,color:"#596164", tile:TILE.METAL
  },
  metal_floor: {
    name:"Piso metálico", category:"PISO",
    description:"Piso industrial reforçado para oficinas e estruturas subterrâneas.",
    cost:{steel_plate:1,scrap_metal:1}, refund:{scrap_metal:1}, maxHealth:210,width:1,height:1,color:"#596164", tile:TILE.INDUSTRIAL_FLOOR
  },
  furnace: {
    name:"Fornalha de fundição", category:"CRAFTING",
    description:"Processa minérios em lingotes e placas reforçadas.",
    cost:{stone:8,brick:6,scrap_metal:4}, refund:{stone:3,brick:2,scrap_metal:2}, maxHealth:220,width:2,height:2,color:"#5f5550",objectOnly:true
  },
  storage_locker: {
    name:"Armário metálico", category:"ARMAZENAMENTO",
    description:"Armazenamento compacto feito para bases e oficinas.",
    cost:{steel_plate:2,nails:4}, refund:{steel_plate:1,nails:2}, maxHealth:180,width:1,height:2,color:"#5e6668",objectOnly:true,decor:"locker"
  },
  scaffold_tower: {
    name:"Torre de acesso", category:"ESTRUTURA",
    description:"Estrutura vertical com escada e pequena passarela superior.",
    cost:{steel_plate:2,wood:4,nails:6}, refund:{scrap_metal:2,wood:2}, maxHealth:180,width:2,height:4,color:"#687174",shape:"scaffold",supportMode:"ground"
  },
  catwalk_section: {
    name:"Passarela metálica", category:"ESTRUTURA",
    description:"Passarela estreita para bases verticais, torres e oficinas.",
    cost:{steel_plate:1,scrap_metal:2}, refund:{scrap_metal:1}, maxHealth:190,width:1,height:1,color:"#61696b",tile:TILE.CATWALK,supportMode:"adjacent"
  },
  ladder_section: {
    name:"Escada vertical", category:"ESTRUTURA",
    description:"Escada fixa para conectar andares sem ocupar muito espaço.",
    cost:{scrap_metal:2,nails:2}, refund:{scrap_metal:1}, maxHealth:100,width:1,height:1,color:"#765c42",tile:TILE.LADDER,supportMode:"adjacent"
  },
  reinforced_gate: {
    name:"Portão reforçado", category:"ACESSO",
    description:"Portão pesado para entradas de garagem e perímetros da base.",
    cost:{steel_plate:4,scrap_metal:4,wire:2}, refund:{steel_plate:2,scrap_metal:1}, maxHealth:430,width:3,height:3,color:"#555f62",shape:"garage_door"
  },
  large_locker: {
    name:"Armário de expedição", category:"ARMAZENAMENTO",
    description:"Armário alto para organizar grande quantidade de suprimentos.",
    cost:{steel_plate:3,nails:5}, refund:{steel_plate:1,nails:2}, maxHealth:230,width:2,height:2,color:"#596265",objectOnly:true,decor:"locker"
  },
  rain_barrel: {
    name: "Barril de chuva",
    category: "UTILIDADE",
    description: "Junta água da chuva. Use E com uma garrafa vazia para encher.",
    cost: { scrap_metal: 3, wood: 3, nails: 4 },
    refund: { scrap_metal: 1, wood: 1 },
    maxHealth: 90, width: 1, height: 1, color: "#6b5340", objectOnly: true
  },

  radio_station: {
    name: "Estação de rádio da base",
    category: "UTILIDADE",
    description: "Capta transmissões locais e gera oportunidades temporárias no mapa.",
    cost: { scrap_metal:4, wire:6, battery:1, circuit_parts:2 },
    refund: { scrap_metal:2, wire:3, circuit_parts:1 },
    maxHealth: 135, width: 2, height: 1, color: "#55666a", objectOnly: true
  },
  kitchen_station: {
    name: "Cozinha comunitária",
    category: "UTILIDADE",
    description: "Permite que sobreviventes organizem alimento e água para a base.",
    cost: { wood:6, nails:5, scrap_metal:2 },
    refund: { wood:3, nails:2, scrap_metal:1 },
    maxHealth: 120, width: 2, height: 1, color: "#725f4b", objectOnly: true
  },
  medical_station: {
    name: "Enfermaria da base",
    category: "UTILIDADE",
    description: "Posto simples para que um sobrevivente médico produza e organize suprimentos.",
    cost: { wood:4, cloth:6, nails:4, scrap_metal:2 },
    refund: { wood:2, cloth:2, nails:2 },
    maxHealth: 120, width: 2, height: 1, color: "#667d78", objectOnly: true
  },
  guard_post: {
    name: "Posto de vigia",
    category: "DEFESA",
    description: "Ponto de observação para sobreviventes designados à segurança da base.",
    cost: { wood:6, nails:6, scrap_metal:2 },
    refund: { wood:3, nails:2, scrap_metal:1 },
    maxHealth: 150, width: 1, height: 2, color: "#5d604e", objectOnly: true
  },
  floodlight: {
    name: "Refletor elétrico",
    category: "ENERGIA",
    description: "Ilumina a base quando existe um gerador ligado nas proximidades.",
    cost: { scrap_metal: 3, wire: 5, battery: 1 },
    refund: { scrap_metal: 1, wire: 2 },
    maxHealth: 95,
    width: 1,
    height: 1,
    color: "#77766c"
  }
};


// Stage 31 — a base deixa de ser só abrigo e passa a produzir comida.
// Tudo aqui é objectOnly: nenhuma dessas peças vira parede, então elas podem
// ser colocadas dentro de construções existentes sem quebrar o mundo.
Object.assign(BUILD_DEFS, {
  garden_plot: {
    name: "Canteiro",
    category: "CULTIVO",
    description: "Terra preparada para uma cultura. Use E para plantar, regar e colher.",
    cost: { wood: 2, nails: 2 },
    refund: { wood: 1 },
    maxHealth: 60, width: 1, height: 1, color: "#6d5b3f", objectOnly: true
  },
  water_trough: {
    name: "Calha de irrigação",
    category: "CULTIVO",
    description: "Junta chuva e rega sozinha os canteiros num raio de 4 tiles.",
    cost: { wood: 4, scrap_metal: 2, nails: 3 },
    refund: { wood: 2, scrap_metal: 1 },
    maxHealth: 85, width: 2, height: 1, color: "#5f6a5c", objectOnly: true
  },
  greenhouse_frame: {
    name: "Estufa",
    category: "CULTIVO",
    description: "Cobertura 3x3 que protege canteiros da geada e acelera o crescimento.",
    cost: { wood: 8, scrap_metal: 4, concrete_chunk: 3, nails: 8 },
    refund: { wood: 4, nails: 3 },
    maxHealth: 160, width: 3, height: 3, color: "#7d8a7f", objectOnly: true
  },
  snare_trap: {
    name: "Armadilha de laço",
    category: "CULTIVO",
    description: "Pega caça pequena sozinha com o tempo. Use E para recolher.",
    cost: { wire: 3, wood: 2 },
    refund: { wire: 1 },
    maxHealth: 40, width: 1, height: 1, color: "#6a6250", objectOnly: true
  },
  stove: {
    name: "Fogão a lenha",
    category: "UTILIDADE",
    description: "Cozinha de verdade na base: libera as receitas preparadas da cozinha.",
    cost: { scrap_metal: 6, brick: 4, nails: 4 },
    refund: { scrap_metal: 3, brick: 2 },
    maxHealth: 170, width: 2, height: 1, color: "#5c5a52", objectOnly: true
  },
  drying_rack: {
    name: "Varal de secagem",
    category: "UTILIDADE",
    description: "Cura carne e ervas. Necessário para carne seca e ervas secas.",
    cost: { wood: 5, cloth: 3, nails: 3 },
    refund: { wood: 2, cloth: 1 },
    maxHealth: 70, width: 2, height: 1, color: "#7a6a4c", objectOnly: true
  },
  icebox: {
    name: "Geladeira",
    category: "ENERGIA",
    description: "Container refrigerado. Com um gerador ligado por perto, a comida quase para de estragar.",
    cost: { scrap_metal: 6, wire: 4, circuit_parts: 1, cloth: 2 },
    refund: { scrap_metal: 3, wire: 2 },
    maxHealth: 140, width: 1, height: 2, color: "#69777a", objectOnly: true
  }
});

// Loose vegetation is cleared by construction instead of blocking it.
const BUILD_CLEARABLE = new Set([TILE.TALL_GRASS, TILE.DRY_FLOWERS, TILE.VINE, TILE.LEAF, TILE.BERRY_BUSH]);

class BuildSystem {
  constructor(world, structures, inventory) {
    this.world = world;
    this.structures = structures;
    this.inventory = inventory;
    this.objects = [];
    this.nextId = 1;
    this.activeBlueprint = null;
  }

  def(type) {
    return BUILD_DEFS[type] || null;
  }

  canAfford(type) {
    const def = this.def(type);
    if (!def) return false;
    return Object.entries(def.cost).every(([id, qty]) => this.inventory.count(id) >= qty);
  }

  costText(type) {
    const def = this.def(type);
    if (!def) return "";
    return Object.entries(def.cost)
      .map(([id, qty]) => `${qty} ${ITEM_DEFS[id]?.name || id}`)
      .join(" · ");
  }

  consumeCost(type) {
    const def = this.def(type);
    if (!def || !this.canAfford(type)) return false;
    for (const [id, qty] of Object.entries(def.cost)) this.inventory.remove(id, qty);
    return true;
  }

  playerIntersectsTiles(player, cells) {
    return cells.some(({ x, y }) => {
      const px = x * CONFIG.TILE;
      const py = y * CONFIG.TILE;
      return player.x < px + CONFIG.TILE &&
        player.x + player.w > px &&
        player.y < py + CONFIG.TILE &&
        player.y + player.h > py;
    });
  }

  cellsFor(type, tx, ty) {
    if (type === "wall") return [{x:tx,y:ty},{x:tx,y:ty-1},{x:tx,y:ty-2}];
    if (type === "door" || type === "barricade") return [{x:tx,y:ty},{x:tx,y:ty-1}];
    if (type === "garage_door") {
      const cells=[];
      for(let x=0;x<3;x++) for(let y=0;y<3;y++) cells.push({x:tx+x,y:ty-y});
      return cells;
    }
    if (type === "workbench" || type === "generator" || type === "auto_bench") return [{x:tx,y:ty},{x:tx+1,y:ty}];
    if (type === "vehicle_frame") return [{x:tx,y:ty},{x:tx+1,y:ty},{x:tx+2,y:ty}];
    if (type === "scaffold_tower") return [
      {x:tx,y:ty},{x:tx,y:ty-1},{x:tx,y:ty-2},{x:tx,y:ty-3},
      {x:tx+1,y:ty-3}
    ];
    if (type === "stairs_left") return [{x:tx,y:ty},{x:tx+1,y:ty-1},{x:tx+2,y:ty-2}];
    if (type === "stairs_right") return [{x:tx,y:ty-2},{x:tx+1,y:ty-1},{x:tx+2,y:ty}];
    if (type === "roof_slope_left") return [{x:tx,y:ty},{x:tx+1,y:ty-1},{x:tx+2,y:ty-2}];
    if (type === "roof_slope_right") return [{x:tx,y:ty-2},{x:tx+1,y:ty-1},{x:tx+2,y:ty}];

    const def=this.def(type);
    if(def?.tile && def.height===2) return [{x:tx,y:ty},{x:tx,y:ty-1}];
    if(!def) return [{x:tx,y:ty}];
    const cells=[];
    for(let i=0;i<Math.max(1,def.width);i++)
      for(let j=0;j<Math.max(1,def.height);j++) cells.push({x:tx+i,y:ty-j});
    return cells;
  }

  isAreaFree(type, tx, ty, player) {
    const def = this.def(type);
    if (!def) return false;
    const cells = this.cellsFor(type, tx, ty);

    const footprint = cells.length ? cells : Array.from({length:def.width},(_,i)=>({x:tx+i,y:ty}));
    for (const c of footprint) {
      if (!this.world.inBounds(c.x, c.y)) return false;
      const t = this.world.get(c.x, c.y);
      // solid terrain blocks; grass and vines are simply cleared away
      if (t !== TILE.AIR && !BUILD_CLEARABLE.has(t)) return false;
    }

    const supportMode = def.supportMode || "ground";
    if (supportMode === "ground") {
      let supported = false;
      for (let x = tx; x < tx + def.width; x++) {
        const below = this.world.get(x, ty + 1);
        if (below !== TILE.AIR && !BUILD_CLEARABLE.has(below)) supported = true;
      }
      if (!supported) return false;
    } else if (supportMode === "adjacent") {
      const around = footprint.some(c => [
        [c.x-1,c.y],[c.x+1,c.y],[c.x,c.y-1],[c.x,c.y+1]
      ].some(([x,y]) => this.world.inBounds(x,y) && this.world.get(x,y) !== TILE.AIR));
      if (!around) return false;
    }

    if (player && this.playerIntersectsTiles(player, footprint)) return false;

    const centerX = tx + def.width*.5;
    const centerY = ty - Math.max(0,def.height-1)*.5;
    return !this.objects.some(o => {
      const ocx=o.tileX+o.width*.5, ocy=o.tileY-Math.max(0,o.height-1)*.5;
      const dx=Math.abs(ocx-centerX), dy=Math.abs(ocy-centerY);
      return dx < Math.max(1,(o.width+def.width)*.36) && dy < Math.max(1,(o.height+def.height)*.34);
    });
  }

  place(type, tx, ty, player, opts = {}) {
    const def = this.def(type);
    if (!def) return { ok:false, reason:"Projeto inválido" };
    const free = Boolean(opts.free);
    if (!free && !this.canAfford(type)) return { ok:false, reason:"Materiais insuficientes" };
    if (!this.isAreaFree(type, tx, ty, player)) return { ok:false, reason:"Não pode construir aqui" };

    if (!free && !this.consumeCost(type)) return { ok:false, reason:"Materiais insuficientes" };

    for (const c of this.cellsFor(type, tx, ty)) {
      if (BUILD_CLEARABLE.has(this.world.get(c.x, c.y))) this.world.set(c.x, c.y, TILE.AIR);
    }

    const object = {
      id: this.nextId++,
      type,
      tileX: tx,
      tileY: ty,
      width: def.width,
      height: def.height,
      health: def.maxHealth,
      maxHealth: def.maxHealth,
      open: false,
      containerId: null
    };

    this.objects.push(object);
    this.applyObjectTiles(object);

    if (type === "rain_barrel") object.water = 0;

    if (type === "storage_locker" || type === "large_locker") {
      const container = {
        id: this.structures.nextContainerId++,
        name: type === "large_locker" ? `Armário de expedição #${object.id}` : `Armário construído #${object.id}`,
        x: tx * CONFIG.TILE + 4,
        y: (ty - 1) * CONFIG.TILE + 5,
        width: type === "large_locker" ? CONFIG.TILE * 2 - 8 : CONFIG.TILE - 8,
        height: CONFIG.TILE * 2 - 8,
        category: "player_crate",
        loot: [], discovered: true, builtObjectId: object.id
      };
      this.structures.containers.push(container);
      object.containerId = container.id;
    }

    // A geladeira é um container como os outros — o que muda é que o
    // FoodSystem marca este como armazenamento frio e liga na energia.
    if (type === "icebox") {
      const container = {
        id: this.structures.nextContainerId++,
        name: `Geladeira #${object.id}`,
        x: tx * CONFIG.TILE + 3,
        y: (ty - 1) * CONFIG.TILE + 5,
        width: CONFIG.TILE - 6,
        height: CONFIG.TILE * 2 - 8,
        category: "player_crate",
        loot: [], discovered: true, builtObjectId: object.id,
        coldStorage: true, powered: false
      };
      this.structures.containers.push(container);
      object.containerId = container.id;
    }

    if (type === "crate") {
      const container = {
        id: this.structures.nextContainerId++,
        name: `Caixa construída #${object.id}`,
        x: tx * CONFIG.TILE + 3,
        y: ty * CONFIG.TILE + 5,
        width: CONFIG.TILE - 6,
        height: CONFIG.TILE - 7,
        category: "player_crate",
        loot: [],
        discovered: true,
        builtObjectId: object.id
      };
      this.structures.containers.push(container);
      object.containerId = container.id;
    }

    return { ok:true, object };
  }

  applyObjectTiles(object) {
    const { type, tileX:tx, tileY:ty } = object;
    if (type === "wall") {
      this.world.set(tx, ty, TILE.PLANK);
      this.world.set(tx, ty-1, TILE.PLANK);
      this.world.set(tx, ty-2, TILE.PLANK);
    } else if (type === "door") {
      const tile = object.open ? TILE.AIR : TILE.PLANK;
      this.world.set(tx, ty, tile);
      this.world.set(tx, ty-1, tile);
    } else if (type === "barricade") {
      this.world.set(tx, ty, TILE.PLANK);
      this.world.set(tx, ty-1, TILE.PLANK);
    } else if (type === "garage_door") {
      const tile = object.open ? TILE.AIR : TILE.METAL;
      for(const c of this.cellsFor(type,tx,ty)) this.world.set(c.x,c.y,tile);
    } else if (type === "stairs_left" || type === "stairs_right") {
      for(const c of this.cellsFor(type,tx,ty)) this.world.set(c.x,c.y,TILE.PLANK);
    } else if (type === "roof_slope_left" || type === "roof_slope_right") {
      for(const c of this.cellsFor(type,tx,ty)) this.world.set(c.x,c.y,TILE.ROOF_SHINGLE);
    } else if (type === "scaffold_tower") {
      for (let yy=ty; yy>=ty-3; yy--) this.world.set(tx,yy,TILE.LADDER);
      this.world.set(tx+1,ty-3,TILE.CATWALK);
    } else {
      const def=this.def(type);
      if(def?.tile){
        for(const c of this.cellsFor(type,tx,ty)) this.world.set(c.x,c.y,def.tile);
      }
    }
  }

  clearObjectTiles(object) {
    const def = this.def(object.type);
    if (def?.objectOnly) return;
    for (const c of this.cellsFor(object.type, object.tileX, object.tileY)) {
      if (this.world.inBounds(c.x, c.y)) this.world.set(c.x, c.y, TILE.AIR);
    }
  }

  center(object) {
    return {
      x: (object.tileX + object.width * .5) * CONFIG.TILE,
      y: (object.tileY - Math.max(0, object.height - 1) + object.height * .5) * CONFIG.TILE
    };
  }

  objectAt(tx, ty) {
    for (const obj of this.objects) {
      for (const c of this.cellsFor(obj.type, obj.tileX, obj.tileY)) {
        if (c.x === tx && c.y === ty) return obj;
      }
    }
    return null;
  }

  nearest(player, maxTiles = 2.7, filter = null) {
    const pc = player.center();
    let best = null;
    let bestD = maxTiles * CONFIG.TILE;
    for (const obj of this.objects) {
      if (filter && !filter(obj)) continue;
      const c = this.center(obj);
      const d = Math.hypot(c.x - pc.x, c.y - pc.y);
      if (d < bestD) {
        best = obj;
        bestD = d;
      }
    }
    return best;
  }

  nearestInteractable(player) {
    return this.nearest(player, 2.8, o =>
      ["door", "garage_door", "campfire", "workbench", "auto_bench", "furnace", "bed_build", "rain_barrel", "radio_station", "kitchen_station", "medical_station", "guard_post", "garden_plot", "water_trough", "snare_trap", "stove", "drying_rack", "perimeter_sensor", "decoy_siren"].includes(o.type) ||
      (typeof STAGE39_BUILD_TYPES !== "undefined" && STAGE39_BUILD_TYPES.has(o.type)) ||
      (typeof STAGE40_BUILD_TYPES !== "undefined" && STAGE40_BUILD_TYPES.has(o.type)));
  }

  nearestRepairable(player) {
    return this.nearest(player, 2.7);
  }

  hasWorkbenchNear(player, radiusTiles = 4.2) {
    return Boolean(this.nearest(player, radiusTiles, o => o.type === "workbench"));
  }

  hasAutoBenchNear(player, radiusTiles = 5.2) {
    return Boolean(this.nearest(player, radiusTiles, o => o.type === "auto_bench"));
  }

  hasFurnaceNear(player, radiusTiles = 4.6) {
    return Boolean(this.nearest(player, radiusTiles, o => o.type === "furnace"));
  }

  // Stage 31 — estações de cozinha. Fogueira serve para o básico; fogão e
  // cozinha comunitária liberam as receitas preparadas.
  hasCookingNear(player, radiusTiles = 4) {
    return Boolean(this.nearest(player, radiusTiles, o =>
      (o.type === "campfire" || o.type === "stove" || o.type === "kitchen_station") && o.health > 0));
  }

  hasKitchenNear(player, radiusTiles = 4.2) {
    return Boolean(this.nearest(player, radiusTiles, o =>
      (o.type === "stove" || o.type === "kitchen_station") && o.health > 0));
  }

  hasRackNear(player, radiusTiles = 4) {
    return Boolean(this.nearest(player, radiusTiles, o => o.type === "drying_rack" && o.health > 0));
  }

  // Rain barrels fill while it is raining and they are not under a roof.
  updateUtilities(dt, rainIntensity) {
    if (rainIntensity <= 0) return;
    for (const obj of this.objects) {
      if (obj.type !== 'rain_barrel') continue;
      if (this.world.isIndoors(obj.tileX, obj.tileY)) continue;
      obj.water = Math.min(4, (obj.water || 0) + dt * rainIntensity * 0.12);
    }
  }

  toggleDoor(object) {
    if (!object || !["door","garage_door"].includes(object.type)) return false;
    object.open = !object.open;
    this.applyObjectTiles(object);
    return true;
  }

  // True when any tile of a tile-backed build has been broken or damaged.
  objectNeedsRepair(object) {
    if (!object) return false;
    const def = this.def(object.type);
    if (!def || def.objectOnly) return false;
    const solidBuild = ["wall", "door", "garage_door", "barricade", "stairs_left", "stairs_right",
      "roof_slope_left", "roof_slope_right"].includes(object.type) || Boolean(def.tile);
    const cells = this.cellsFor(object.type, object.tileX, object.tileY);
    return cells.some(c => {
      const missing = solidBuild && !object.open && this.world.get(c.x, c.y) === TILE.AIR;
      return missing || this.world.damageAt(c.x, c.y) > 0;
    });
  }

  // Half of the original cost, rounded up — repairing a brick wall wants
  // bricks, not the universal wood + nails of the old version.
  repairCost(object) {
    const def = this.def(object.type);
    const cost = {};
    for (const [id, qty] of Object.entries(def?.cost || {})) cost[id] = Math.max(1, Math.ceil(qty / 2));
    return cost;
  }

  repairCostText(object) {
    return Object.entries(this.repairCost(object))
      .map(([id, qty]) => `${qty} ${ITEM_DEFS[id]?.name || id}`).join(" + ");
  }

  repair(object, opts = {}) {
    if (!object) return {ok:false, reason:"Nenhuma estrutura próxima"};
    if (!this.objectNeedsRepair(object)) return {ok:false, reason:"Estrutura já está íntegra"};
    const cost = this.repairCost(object);
    for (const [id, qty] of Object.entries(cost)) {
      if (opts.free) continue;
      if (this.inventory.count(id) < qty) return {ok:false, reason:`Reparo exige ${this.repairCostText(object)}`};
    }
    if (!opts.free) for (const [id, qty] of Object.entries(cost)) this.inventory.remove(id, qty);
    this.applyObjectTiles(object);
    for (const c of this.cellsFor(object.type, object.tileX, object.tileY)) {
      this.world.damage.delete(c.y * CONFIG.WORLD_W + c.x);
    }
    object.health = object.maxHealth;
    return {ok:true};
  }

  // remove() é o desmonte cru, sem devolução e sem a trava da caixa cheia:
  // o Modo Livre usa isto, a sobrevivência usa dismantle().
  remove(object, opts = {}) {
    return this.dismantle(object, { refund: false, force: true, ...opts });
  }

  dismantle(object, opts = {}) {
    if (!object) return {ok:false, reason:"Nenhuma construção próxima"};

    if (object.type === "crate" && !opts.force) {
      const box = this.structures.containers.find(c => c.id === object.containerId);
      if (box && box.loot.length) return {ok:false, reason:"Esvazie a caixa antes de desmontar"};
    }

    const def = this.def(object.type);
    this.clearObjectTiles(object);

    if (object.containerId != null) {
      this.structures.containers = this.structures.containers.filter(c => c.id !== object.containerId);
    }

    this.objects = this.objects.filter(o => o.id !== object.id);

    if (opts.refund !== false) {
      for (const [id, qty] of Object.entries(def.refund || {})) this.inventory.add(id, qty);
    }

    return {ok:true, name:def.name};
  }

  interact(object, callbacks={}) {
    if (!object) return false;
    if (object.type === "door" || object.type === "garage_door") {
      this.toggleDoor(object);
      callbacks.onDoor?.(object.open, object.type);
      return true;
    }
    if (object.type === "campfire") {
      callbacks.onCampfire?.(object);
      return true;
    }
    if (object.type === "workbench") {
      callbacks.onWorkbench?.(object);
      return true;
    }
    if (object.type === "auto_bench") {
      callbacks.onAutoBench?.(object);
      return true;
    }
    if (object.type === "furnace") {
      callbacks.onFurnace?.(object);
      return true;
    }
    if (object.type === "bed_build") {
      callbacks.onBed?.(object);
      return true;
    }
    if (object.type === "rain_barrel") {
      callbacks.onBarrel?.(object);
      return true;
    }
    if (object.type === "radio_station") {
      callbacks.onRadioStation?.(object);
      return true;
    }
    if (object.type === "garden_plot") {
      callbacks.onGardenPlot?.(object);
      return true;
    }
    if (object.type === "water_trough") {
      callbacks.onTrough?.(object);
      return true;
    }
    if (object.type === "snare_trap") {
      callbacks.onSnare?.(object);
      return true;
    }
    if (object.type === "stove" || object.type === "drying_rack") {
      callbacks.onCookStation?.(object);
      return true;
    }
    if (["kitchen_station","medical_station","guard_post"].includes(object.type)) {
      callbacks.onBaseStation?.(object);
      return true;
    }
    if (["perimeter_sensor","decoy_siren"].includes(object.type)) {
      callbacks.onStage42Defense?.(object);
      return true;
    }
    if (typeof STAGE39_BUILD_TYPES !== "undefined" && STAGE39_BUILD_TYPES.has(object.type)) {
      callbacks.onStage39?.(object);
      return true;
    }
    if (typeof STAGE40_BUILD_TYPES !== "undefined" && STAGE40_BUILD_TYPES.has(object.type)) {
      callbacks.onStage40?.(object);
      return true;
    }
    return false;
  }

  draw(ctx, cameraX, cameraY, mouseTileX, mouseTileY, player) {
    for (const obj of this.objects) {
      const x = obj.tileX * CONFIG.TILE - cameraX;
      const y = obj.tileY * CONFIG.TILE - cameraY;

      if (obj.type === "crate") {
        ctx.fillStyle = "#654a34";
        ctx.fillRect(x+3,y+7,CONFIG.TILE-6,CONFIG.TILE-9);
        ctx.fillStyle = "#8a6647";
        ctx.fillRect(x+4,y+7,CONFIG.TILE-8,6);
        ctx.fillStyle = "#a38a59";
        ctx.fillRect(x+14,y+14,4,7);
      }

      if (obj.type === "campfire") {
        ctx.fillStyle = "#4a4037";
        ctx.fillRect(x+5,y+22,22,6);
        ctx.fillStyle = "#8e4c31";
        ctx.beginPath();
        ctx.moveTo(x+16,y+3); ctx.lineTo(x+26,y+23); ctx.lineTo(x+7,y+23);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#d69b49";
        ctx.beginPath();
        ctx.moveTo(x+16,y+8); ctx.lineTo(x+22,y+22); ctx.lineTo(x+11,y+22);
        ctx.closePath(); ctx.fill();
      }

      if (obj.type === "workbench") {
        ctx.fillStyle = "#55493c";
        ctx.fillRect(x+2,y+13,CONFIG.TILE*2-4,10);
        ctx.fillStyle = "#74583e";
        ctx.fillRect(x+5,y+6,CONFIG.TILE*2-10,8);
        ctx.fillStyle = "#4b3d33";
        ctx.fillRect(x+8,y+23,6,9);
        ctx.fillRect(x+CONFIG.TILE*2-14,y+23,6,9);
      }

      if (obj.type === "generator") {
        ctx.fillStyle = "#34383a";
        ctx.fillRect(x+2,y+7,CONFIG.TILE*2-4,23);
        ctx.fillStyle = "#775c3e";
        ctx.fillRect(x+8,y+11,42,15);
        ctx.fillStyle = "#1b1e20";
        ctx.fillRect(x+7,y+27,10,4);
        ctx.fillRect(x+47,y+27,10,4);
      }

      if (obj.type === "floodlight") {
        ctx.strokeStyle = "#565d60";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x+16,y+30); ctx.lineTo(x+16,y-44); ctx.stroke();
        ctx.fillStyle = "#77766c";
        ctx.fillRect(x+7,y-50,19,10);
      }

      if (obj.type === "garage_door") {
        if (obj.open) {
          ctx.strokeStyle="#656d6f";ctx.lineWidth=3;
          ctx.strokeRect(x+2,y-CONFIG.TILE*2+2,CONFIG.TILE*3-4,12);
        } else {
          ctx.fillStyle="#5c6466";
          ctx.fillRect(x+2,y-CONFIG.TILE*2+2,CONFIG.TILE*3-4,CONFIG.TILE*3-4);
          ctx.strokeStyle="#363c3e";ctx.lineWidth=2;
          for(let yy=0;yy<3;yy++) ctx.strokeRect(x+3,y-CONFIG.TILE*2+3+yy*CONFIG.TILE,CONFIG.TILE*3-6,CONFIG.TILE-2);
          ctx.fillStyle="#c09d58";ctx.fillRect(x+CONFIG.TILE*2+17,y-12,6,6);
        }
      }

      if (obj.type === "auto_bench") {
        ctx.fillStyle="#43494a";ctx.fillRect(x+3,y+22,CONFIG.TILE*2-6,8);
        ctx.fillStyle="#72563e";ctx.fillRect(x+6,y+11,CONFIG.TILE*2-12,12);
        ctx.fillStyle="#6c7476";ctx.fillRect(x+10,y+5,16,8);
        ctx.strokeStyle="#a78559";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+44,y+10,8,0,Math.PI*2);ctx.stroke();
      }

      if (obj.type === "vehicle_frame") {
        ctx.strokeStyle="#6f7779";ctx.lineWidth=4;
        ctx.beginPath();ctx.moveTo(x+8,y+20);ctx.lineTo(x+CONFIG.TILE*3-8,y+20);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x+22,y+20);ctx.lineTo(x+34,y+6);ctx.lineTo(x+65,y+6);ctx.lineTo(x+78,y+20);ctx.stroke();
        ctx.fillStyle="#1b1e1f";ctx.beginPath();ctx.arc(x+22,y+24,10,0,Math.PI*2);ctx.arc(x+CONFIG.TILE*3-22,y+24,10,0,Math.PI*2);ctx.fill();
      }

      if (["shelf_build","table_build","bed_build"].includes(obj.type)) {
        const assetId = BUILD_DEFS[obj.type].decor;
        const img = ASSETS.ready(`decor:${assetId}`);
        if (img) {
          ctx.imageSmoothingEnabled = false;
          const w = obj.type === "bed_build" ? CONFIG.TILE * 2 : CONFIG.TILE;
          const h = Math.round(img.height * (w / img.width));
          ctx.fillStyle = "rgba(0,0,0,.22)";
          ctx.beginPath();
          ctx.ellipse(x + w / 2, y + CONFIG.TILE - 1, w * .4, 3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(img, x, y + CONFIG.TILE - h, w, h);
        }
      }

      if (obj.type === "radio_station") {
        ctx.fillStyle="#2c3436";ctx.fillRect(x+3,y+8,CONFIG.TILE*2-6,22);
        ctx.fillStyle="#56666a";ctx.fillRect(x+7,y+12,34,12);
        ctx.fillStyle="#a7b685";ctx.fillRect(x+12,y+15,14,5);
        ctx.strokeStyle="#7f8a88";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+48,y+12);ctx.lineTo(x+56,y-18);ctx.stroke();
        ctx.beginPath();ctx.arc(x+56,y-18,4,0,Math.PI*2);ctx.stroke();
      }

      if (obj.type === "kitchen_station") {
        ctx.fillStyle="#695442";ctx.fillRect(x+3,y+15,CONFIG.TILE*2-6,15);
        ctx.fillStyle="#9a8a70";ctx.fillRect(x+7,y+10,CONFIG.TILE*2-14,6);
        ctx.fillStyle="#303638";ctx.fillRect(x+12,y+18,14,9);
        ctx.fillStyle="#6b7470";ctx.fillRect(x+40,y+18,15,9);
      }

      if (obj.type === "medical_station") {
        ctx.fillStyle="#556b68";ctx.fillRect(x+3,y+13,CONFIG.TILE*2-6,17);
        ctx.fillStyle="#d4d0bd";ctx.fillRect(x+8,y+8,CONFIG.TILE*2-16,8);
        ctx.fillStyle="#9d6565";ctx.fillRect(x+29,y+10,6,4);
        ctx.fillRect(x+30,y+9,4,6);
      }

      if (obj.type === "guard_post") {
        ctx.fillStyle="#4b4f42";ctx.fillRect(x+6,y-26,CONFIG.TILE-12,56);
        ctx.fillStyle="#6b735d";ctx.fillRect(x+3,y-29,CONFIG.TILE-6,10);
        ctx.fillStyle="#252b2b";ctx.fillRect(x+11,y-18,CONFIG.TILE-22,12);
      }

      // Stage 31 — cozinha, conservação e caça. Canteiros, calhas e estufa são
      // desenhados pelo FarmingSystem, que conhece o estado da plantação.
      if (obj.type === "stove") {
        ctx.fillStyle="#3c4042"; ctx.fillRect(x+2,y+8,CONFIG.TILE*2-4,22);
        ctx.fillStyle="#5a5248"; ctx.fillRect(x+5,y+11,CONFIG.TILE*2-10,16);
        ctx.fillStyle="#22262a"; ctx.fillRect(x+9,y+16,16,10);
        ctx.fillStyle=obj.lit===false?"#4a3f38":"#b4703a"; ctx.fillRect(x+12,y+19,10,6);
        ctx.fillStyle="#6f7679"; ctx.fillRect(x+36,y+12,18,4); ctx.fillRect(x+36,y+20,18,4);
        ctx.fillStyle="#3a3e40"; ctx.fillRect(x+50,y-16,7,26);
      }

      if (obj.type === "drying_rack") {
        ctx.fillStyle="#6b5940";
        ctx.fillRect(x+3,y+4,3,26); ctx.fillRect(x+CONFIG.TILE*2-7,y+4,3,26);
        ctx.fillStyle="#7d6a4c"; ctx.fillRect(x+3,y+4,CONFIG.TILE*2-6,3);
        ctx.fillStyle="#8a6a52";
        for (let i=0;i<4;i++) ctx.fillRect(x+9+i*12,y+8,5,11);
        ctx.fillStyle="#6c7a4d";
        ctx.fillRect(x+10,y+21,CONFIG.TILE*2-20,3);
      }

      if (obj.type === "icebox") {
        const lit = Boolean(obj.powered);
        ctx.fillStyle="#5f6b6e"; ctx.fillRect(x+3,y-CONFIG.TILE+4,CONFIG.TILE-6,CONFIG.TILE*2-8);
        ctx.fillStyle="#717d80"; ctx.fillRect(x+5,y-CONFIG.TILE+6,CONFIG.TILE-10,CONFIG.TILE*2-12);
        ctx.fillStyle="#3d4547"; ctx.fillRect(x+5,y-1,CONFIG.TILE-10,2);
        ctx.fillStyle="#8d999b"; ctx.fillRect(x+CONFIG.TILE-11,y-CONFIG.TILE+12,3,9);
        ctx.fillStyle=lit?"#86a36c":"#5c4a46"; ctx.fillRect(x+8,y-CONFIG.TILE+9,4,4);
        if (lit) { ctx.fillStyle="rgba(150,190,200,.10)"; ctx.fillRect(x+1,y-CONFIG.TILE+2,CONFIG.TILE-2,CONFIG.TILE*2-4); }
      }

      if (obj.type === "snare_trap") {
        ctx.strokeStyle="#7d7460"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.ellipse(x+16,y+26,9,4,0,0,Math.PI*2); ctx.stroke();
        ctx.strokeStyle="#5f5847";
        ctx.beginPath(); ctx.moveTo(x+16,y+26); ctx.lineTo(x+24,y+16); ctx.stroke();
        ctx.fillStyle="#6b5c40"; ctx.fillRect(x+23,y+10,3,8);
        if (obj.catch) {
          ctx.fillStyle="#8b7d68"; ctx.fillRect(x+10,y+20,13,7);
          ctx.fillStyle="#6d6153"; ctx.fillRect(x+21,y+18,5,4);
        }
      }

      if (obj.type === "furnace") {
        ctx.fillStyle="#3d4142";ctx.fillRect(x+2,y-18,CONFIG.TILE*2-4,48);
        ctx.fillStyle="#6e6258";ctx.fillRect(x+6,y-13,CONFIG.TILE*2-12,40);
        ctx.fillStyle="#202326";ctx.fillRect(x+15,y+1,34,20);
        ctx.fillStyle="#a05d37";ctx.fillRect(x+19,y+6,26,10);
        ctx.fillStyle="#d2934a";ctx.fillRect(x+23,y+8,18,6);
        ctx.fillStyle="#2d3133";ctx.fillRect(x+48,y-28,8,16);
      }

      if (obj.type === "storage_locker" || obj.type === "large_locker") {
        const img=ASSETS.ready('decor:locker');
        if(img){ctx.imageSmoothingEnabled=false;ctx.drawImage(img,x,y-CONFIG.TILE,CONFIG.TILE,CONFIG.TILE*2);}
      }

      if (obj.type === "rain_barrel") {
        const c = "#6b5340";
        ctx.fillStyle = c;
        ctx.fillRect(x + 5, y + 8, CONFIG.TILE - 10, CONFIG.TILE - 10);
        ctx.fillStyle = "rgba(255,255,255,.12)";
        ctx.fillRect(x + 5, y + 8, CONFIG.TILE - 10, 2);
        ctx.fillStyle = "#4a3a2c";
        ctx.fillRect(x + 5, y + 14, CONFIG.TILE - 10, 2);
        ctx.fillRect(x + 5, y + 22, CONFIG.TILE - 10, 2);
        const level = Math.min(1, (obj.water || 0) / 4);
        if (level > 0.02) {
          ctx.fillStyle = "rgba(90,138,158,.75)";
          ctx.fillRect(x + 7, y + 10, CONFIG.TILE - 14, Math.round(4 * level) + 1);
        }
      }

      if (obj.type === "wall_lamp") {
        ctx.strokeStyle="#666d6f";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+16,y+28);ctx.lineTo(x+16,y+10);ctx.stroke();
        ctx.fillStyle="#cbbd7c";ctx.fillRect(x+8,y+5,16,8);
      }
    }

    if (!this.activeBlueprint) return;
    const def = this.def(this.activeBlueprint);
    const tx = mouseTileX;
    const ty = mouseTileY;
    const valid = this.isAreaFree(this.activeBlueprint, tx, ty, player) && this.canAfford(this.activeBlueprint);
    const cells = this.cellsFor(this.activeBlueprint, tx, ty);

    ctx.save();
    ctx.globalAlpha = .35;
    ctx.fillStyle = valid ? "#7ea15f" : "#b2574f";
    for (const c of cells) {
      ctx.fillRect(c.x * CONFIG.TILE - cameraX + 1, c.y * CONFIG.TILE - cameraY + 1, CONFIG.TILE - 2, CONFIG.TILE - 2);
    }

    // footprint outline + the blueprint icon so you can see what you are placing
    ctx.globalAlpha = valid ? .85 : .6;
    ctx.strokeStyle = valid ? "rgba(198,168,94,.9)" : "rgba(209,89,77,.9)";
    ctx.lineWidth = 1;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of cells) {
      minX = Math.min(minX, c.x); maxX = Math.max(maxX, c.x);
      minY = Math.min(minY, c.y); maxY = Math.max(maxY, c.y);
    }
    const bx = minX * CONFIG.TILE - cameraX, by = minY * CONFIG.TILE - cameraY;
    const bw = (maxX - minX + 1) * CONFIG.TILE, bh = (maxY - minY + 1) * CONFIG.TILE;
    ctx.strokeRect(bx + .5, by + .5, bw - 1, bh - 1);

    const icon = ASSETS.ready(`build:${this.activeBlueprint}`);
    if (icon) {
      ctx.globalAlpha = valid ? .75 : .4;
      ctx.imageSmoothingEnabled = false;
      const size = Math.min(bw, bh);
      ctx.drawImage(icon, bx + (bw - size) / 2, by + (bh - size) / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}
