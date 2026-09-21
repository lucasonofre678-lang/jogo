const CONFIG = {
  TILE: 32,
  WORLD_W: 960,
  WORLD_H: 168,
  CHUNK_W: 8,           // terrain render chunk, in tiles
  CHUNK_H: 8,
  GRAVITY: 0.72,
  // Stage 24: movement is intentionally slower and more deliberate. The old
  // 6.6 -> 9.77 sprint range made the survivor feel like an arcade character.
  PLAYER_SPEED: 0.46,
  PLAYER_MAX_SPEED: 4.55,
  PLAYER_SPRINT_MULT: 1.34,
  PLAYER_JUMP: 12.8,
  PLAYER_GROUND_ACCEL: 0.52,
  PLAYER_SPRINT_ACCEL: 0.42,
  PLAYER_AIR_ACCEL: 0.22,
  PLAYER_GROUND_DECEL: 0.42,
  PLAYER_TURN_ACCEL: 0.68,
  PLAYER_SPRINT_RAMP: 4.4,
  PLAYER_CROUCH_SPEED_MULT: 0.48,
  PLAYER_REACH: 5.2,
  PLAYER_STEP_UP: 1,    // tiles the player walks over without jumping
  DAY_LENGTH_SECONDS: 180,
  MAX_CARRY_WEIGHT: 28,
  INTERACT_REACH: 2.8
};

const TILE = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
  LEAF: 5,
  BERRY_BUSH: 6,
  WATER_SOURCE: 7,
  CONCRETE: 8,
  BRICK: 9,
  PLANK: 10,
  GLASS: 11,
  ASPHALT: 12,
  METAL: 13,
  MUD: 14,
  GRAVEL: 15,
  DARK_STONE: 16,
  CRACKED_CONCRETE: 17,
  RUST_METAL: 18,
  FLOOR_WOOD: 19,
  ROOF_SHINGLE: 20,
  ROOF_METAL: 21,
  FENCE: 22,
  CERAMIC: 23,
  WALL_PANEL: 24,
  PAINTED_WOOD: 25,
  CHAIN_FENCE: 26,
  RUBBLE: 27,
  ROAD_LINE: 28,
  RAIL: 29,
  TALL_GRASS: 30,
  // Stage 15: surface + urban variety so no large area repeats one texture.
  DEAD_GRASS: 31,
  WET_GRASS: 32,
  DRY_DIRT: 33,
  WET_DIRT: 34,
  CRACKED_STONE: 35,
  CRACKED_ASPHALT: 36,
  INDUSTRIAL_FLOOR: 37,
  DARK_WOOD: 38,
  VINE: 39,
  DRY_FLOWERS: 40,
  LADDER: 41,
  CATWALK: 42,
  // Stage 20: material library — nature, city, industrial, metro, Blackridge.
  MOSS_STONE: 43,
  MOSSY_STONE: 43, // compatibility alias kept from Stage 17/19 saves and helpers
  WET_STONE: 44,
  LEAF_LITTER: 45,
  OLD_BRICK: 46,
  DAMAGED_BRICK: 47,
  SUB_BRICK: 48,
  DIRTY_CONCRETE: 49,
  OLD_CONCRETE: 50,
  WET_CONCRETE: 51,
  PLASTER: 52,
  WALLPAPER: 53,
  PEELING_WALL: 54,
  WALL_TILE: 55,
  LINOLEUM: 56,
  CHECKER_FLOOR: 57,
  CARPET: 58,
  OLD_WOOD: 59,
  SHEET_METAL: 60,
  GRATE: 61,
  IND_PANEL: 62,
  HAZARD_FLOOR: 63,
  STATION_TILE: 64,
  TECH_WALL: 65,
  TECH_PANEL: 66,
  DARK_METAL: 67,
  CONTAINMENT: 68,
  LAB_FLOOR: 69,
  TECH_FLOOR: 70,
  LAB_WALL: 71,
  HEDGE: 72,
  SANDBAG: 73,
  TIMBER: 74,
  WALLPAPER_WARM: 75,
  WALLPAPER_BLUE: 76,
  CARPET_BLUE: 77,
  // Stage 20.1: restored mining progression without colliding with Stage 20 materials.
  COAL_ORE: 78,
  IRON_ORE: 79,
  COPPER_ORE: 80,
  QUARTZ_ORE: 81,
  SLATE: 82
};

// File stem used by the tile atlas loader (assets/tiles/<name>_<variant>.png)
const TILE_ASSET_NAMES = {
  [1]: 'grass', [2]: 'dirt', [3]: 'stone', [4]: 'wood', [5]: 'leaf', [6]: 'berry_bush',
  [7]: 'water_source', [8]: 'concrete', [9]: 'brick', [10]: 'plank', [11]: 'glass',
  [12]: 'asphalt', [13]: 'metal', [14]: 'mud', [15]: 'gravel', [16]: 'dark_stone',
  [17]: 'cracked_concrete', [18]: 'rust_metal', [19]: 'floor_wood', [20]: 'roof_shingle',
  [21]: 'roof_metal', [22]: 'fence', [23]: 'ceramic', [24]: 'wall_panel', [25]: 'painted_wood',
  [26]: 'chain_fence', [27]: 'rubble', [28]: 'road_line', [29]: 'rail', [30]: 'tall_grass',
  [31]: 'dead_grass', [32]: 'wet_grass', [33]: 'dry_dirt', [34]: 'wet_dirt', [35]: 'cracked_stone',
  [36]: 'cracked_asphalt', [37]: 'industrial_floor', [38]: 'dark_wood', [39]: 'vine', [40]: 'dry_flowers',
  [41]: 'ladder', [42]: 'catwalk',
  [43]: 'moss_stone', [44]: 'wet_stone', [45]: 'leaf_litter', [46]: 'old_brick', [47]: 'damaged_brick', [48]: 'sub_brick', [49]: 'dirty_concrete', [50]: 'old_concrete', [51]: 'wet_concrete', [52]: 'plaster', [53]: 'wallpaper', [54]: 'peeling_wall', [55]: 'wall_tile', [56]: 'linoleum', [57]: 'checker_floor', [58]: 'carpet', [59]: 'old_wood', [60]: 'sheet_metal', [61]: 'grate', [62]: 'ind_panel', [63]: 'hazard_floor', [64]: 'station_tile', [65]: 'tech_wall', [66]: 'tech_panel', [67]: 'dark_metal', [68]: 'containment', [69]: 'lab_floor', [70]: 'tech_floor', [71]: 'lab_wall', [72]: 'hedge', [73]: 'sandbag', [74]: 'timber', [75]: 'wallpaper_warm', [76]: 'wallpaper_blue', [77]: 'carpet_blue',
  // Stage 20.1 restored geology, with real atlas assets rather than color fallbacks.
  [78]: 'coal_ore', [79]: 'iron_ore', [80]: 'copper_ore', [81]: 'quartz_ore', [82]: 'slate'
};

const TILE_INFO = {
  [TILE.AIR]: { name: "Ar", solid: false, hp: 0, color: "transparent", mineable: false },
  [TILE.GRASS]: { name: "Terra com grama", solid: true, hp: 28, color: "#60784a", dropItem: "dirt", dropQty: 1 },
  [TILE.DIRT]: { name: "Terra", solid: true, hp: 24, color: "#775740", dropItem: "dirt", dropQty: 1 },
  [TILE.STONE]: { name: "Pedra", solid: true, hp: 55, color: "#66686b", dropItem: "stone", dropQty: 1 },
  [TILE.WOOD]: { name: "Madeira", solid: true, hp: 38, color: "#775039", dropItem: "wood", dropQty: 1 },
  [TILE.LEAF]: { name: "Folhagem", solid: false, hp: 14, color: "#4c6d46", dropItem: null, dropQty: 0 },
  [TILE.BERRY_BUSH]: { name: "Arbusto de bagas", solid: false, hp: 12, color: "#536f45", dropItem: "berries", dropQty: 2, mineable: true },
  [TILE.WATER_SOURCE]: { name: "Nascente", solid: false, hp: 0, color: "#56839b", mineable: false },
  [TILE.CONCRETE]: { name: "Concreto", solid: true, hp: 120, color: "#7a7d7c", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.BRICK]: { name: "Tijolo", solid: true, hp: 82, color: "#86584c", dropItem: "brick", dropQty: 1 },
  [TILE.PLANK]: { name: "Tábua", solid: true, hp: 44, color: "#8a6544", dropItem: "wood", dropQty: 1 },
  [TILE.GLASS]: { name: "Vidro", solid: true, hp: 18, color: "#8eb3bd", dropItem: null, dropQty: 0 },
  [TILE.ASPHALT]: { name: "Asfalto", solid: true, hp: 95, color: "#4c5052", dropItem: "stone", dropQty: 1 },
  [TILE.METAL]: { name: "Metal", solid: true, hp: 145, color: "#62696d", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.MUD]: { name: "Lama", solid: true, hp: 20, color: "#574a3a", dropItem: "mud_block", dropQty: 1 },
  [TILE.GRAVEL]: { name: "Cascalho", solid: true, hp: 34, color: "#66635e", dropItem: "gravel", dropQty: 1 },
  [TILE.DARK_STONE]: { name: "Pedra profunda", solid: true, hp: 72, color: "#41464a", dropItem: "dark_stone", dropQty: 1 },
  [TILE.CRACKED_CONCRETE]: { name: "Concreto rachado", solid: true, hp: 98, color: "#686b6b", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.RUST_METAL]: { name: "Chapa enferrujada", solid: true, hp: 112, color: "#6f5948", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.FLOOR_WOOD]: { name: "Piso de madeira", solid: true, hp: 40, color: "#75523a", dropItem: "wood", dropQty: 1 },
  [TILE.ROOF_SHINGLE]: { name: "Telha velha", solid: true, hp: 48, color: "#58463f", dropItem: "roof_shingle", dropQty: 1 },
  [TILE.ROOF_METAL]: { name: "Telhado metálico", solid: true, hp: 86, color: "#525d60", dropItem: "roof_metal", dropQty: 1 },
  [TILE.FENCE]: { name: "Cerca", solid: true, hp: 34, color: "#76543b", dropItem: "wood", dropQty: 1 },
  [TILE.CERAMIC]: { name: "Piso cerâmico", solid: true, hp: 58, color: "#9ba3a0", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.WALL_PANEL]: { name: "Painel de parede", solid: true, hp: 78, color: "#6f7777", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.PAINTED_WOOD]: { name: "Madeira pintada", solid: true, hp: 48, color: "#6c7260", dropItem: "wood", dropQty: 1 },
  [TILE.CHAIN_FENCE]: { name: "Tela metálica", solid: true, hp: 70, color: "#6e7777", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.RUBBLE]: { name: "Entulho", solid: true, hp: 36, color: "#646665", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.ROAD_LINE]: { name: "Asfalto sinalizado", solid: true, hp: 92, color: "#505457", dropItem: "stone", dropQty: 1 },
  [TILE.RAIL]: { name: "Trilho", solid: true, hp: 132, color: "#555b5e", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.TALL_GRASS]: { name: "Capim alto", solid: false, hp: 8, color: "#5f7f49", dropItem: "wild_herbs", dropQty: 1, mineable: true },
  [TILE.DEAD_GRASS]: { name: "Grama morta", solid: true, hp: 26, color: "#7d7442", dropItem: "dirt", dropQty: 1 },
  [TILE.WET_GRASS]: { name: "Grama úmida", solid: true, hp: 28, color: "#3f5f38", dropItem: "dirt", dropQty: 1 },
  [TILE.DRY_DIRT]: { name: "Terra seca", solid: true, hp: 22, color: "#7d6549", dropItem: "dirt", dropQty: 1 },
  [TILE.WET_DIRT]: { name: "Terra molhada", solid: true, hp: 20, color: "#4d3a2a", dropItem: "dirt", dropQty: 1 },
  [TILE.CRACKED_STONE]: { name: "Pedra rachada", solid: true, hp: 44, color: "#66686a", dropItem: "stone", dropQty: 1 },
  [TILE.CRACKED_ASPHALT]: { name: "Asfalto deteriorado", solid: true, hp: 78, color: "#45484a", dropItem: "gravel", dropQty: 1 },
  [TILE.INDUSTRIAL_FLOOR]: { name: "Piso industrial", solid: true, hp: 104, color: "#565b5d", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.DARK_WOOD]: { name: "Madeira morta", solid: true, hp: 34, color: "#3f352c", dropItem: "wood", dropQty: 1 },
  [TILE.VINE]: { name: "Trepadeira", solid: false, hp: 9, color: "#4a6b3c", dropItem: null, dropQty: 0 },
  [TILE.DRY_FLOWERS]: { name: "Flores secas", solid: false, hp: 6, color: "#8e8452", dropItem: "wild_herbs", dropQty: 1, mineable: true },
  [TILE.LADDER]: { name: "Escada de mão", solid: false, climb: true, hp: 30, color: "#7a5a3c", dropItem: "ladder", dropQty: 1 },
  [TILE.CATWALK]: { name: "Passarela", solid: false, platform: true, hp: 60, color: "#6a7174", dropItem: "scrap_metal", dropQty: 1 }
,
  [TILE.MOSS_STONE]: { name: "Pedra com musgo", solid: true, hp: 50, color: "#5c6a52", dropItem: "stone", dropQty: 1 },
  [TILE.WET_STONE]: { name: "Pedra úmida", solid: true, hp: 58, color: "#4a5153", dropItem: "stone", dropQty: 1 },
  [TILE.LEAF_LITTER]: { name: "Folhiço", solid: true, hp: 22, color: "#5a4430", dropItem: "dirt", dropQty: 1 },
  [TILE.OLD_BRICK]: { name: "Tijolo velho", solid: true, hp: 70, color: "#8e6c5a", dropItem: "brick", dropQty: 1 },
  [TILE.DAMAGED_BRICK]: { name: "Tijolo danificado", solid: true, hp: 46, color: "#6e4c40", dropItem: "brick", dropQty: 1 },
  [TILE.SUB_BRICK]: { name: "Tijolo subterrâneo", solid: true, hp: 80, color: "#553c34", dropItem: "brick", dropQty: 1 },
  [TILE.DIRTY_CONCRETE]: { name: "Concreto sujo", solid: true, hp: 112, color: "#626460", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.OLD_CONCRETE]: { name: "Concreto velho", solid: true, hp: 96, color: "#6c706a", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.WET_CONCRETE]: { name: "Concreto úmido", solid: true, hp: 100, color: "#5c605d", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.PLASTER]: { name: "Reboco", solid: true, hp: 40, color: "#b3a992", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.WALLPAPER]: { name: "Parede pintada", solid: true, hp: 40, color: "#7f8a6e", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.PEELING_WALL]: { name: "Parede descascada", solid: true, hp: 34, color: "#8f9a82", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.WALL_TILE]: { name: "Azulejo", solid: true, hp: 56, color: "#c9cdc4", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.LINOLEUM]: { name: "Piso residencial", solid: true, hp: 48, color: "#a89c7c", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.CHECKER_FLOOR]: { name: "Piso comercial", solid: true, hp: 58, color: "#7a7a72", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.CARPET]: { name: "Carpete", solid: true, hp: 30, color: "#6e3f36", dropItem: "cloth", dropQty: 1 },
  [TILE.OLD_WOOD]: { name: "Madeira velha", solid: true, hp: 32, color: "#7d7666", dropItem: "wood", dropQty: 1 },
  [TILE.SHEET_METAL]: { name: "Chapa corrugada", solid: true, hp: 90, color: "#6c7478", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.GRATE]: { name: "Grade de piso", solid: true, hp: 120, color: "#4c5254", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.IND_PANEL]: { name: "Painel industrial", solid: true, hp: 110, color: "#7a7560", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.HAZARD_FLOOR]: { name: "Concreto industrial", solid: true, hp: 118, color: "#6f6a55", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.STATION_TILE]: { name: "Azulejo de estação", solid: true, hp: 70, color: "#cfc8b0", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.TECH_WALL]: { name: "Parede técnica", solid: true, hp: 120, color: "#5b6163", dropItem: "wire", dropQty: 1 },
  [TILE.TECH_PANEL]: { name: "Painel técnico", solid: true, hp: 150, color: "#4a5864", dropItem: "wire", dropQty: 1 },
  [TILE.DARK_METAL]: { name: "Metal escuro", solid: true, hp: 165, color: "#3a3f42", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.CONTAINMENT]: { name: "Concreto de contenção", solid: true, hp: 220, color: "#9a9c94", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.LAB_FLOOR]: { name: "Piso de laboratório", solid: true, hp: 90, color: "#b9c0bc", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.TECH_FLOOR]: { name: "Piso técnico", solid: true, hp: 110, color: "#56606a", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.LAB_WALL]: { name: "Parede de laboratório", solid: true, hp: 120, color: "#c3c8c4", dropItem: "scrap_metal", dropQty: 1 },
  [TILE.HEDGE]: { name: "Cerca viva", solid: false, hp: 10, color: "#3b5a36", dropItem: null, dropQty: 0 },
  [TILE.SANDBAG]: { name: "Sacos de areia", solid: true, hp: 90, color: "#8a7b58", dropItem: "gravel", dropQty: 1 },
  [TILE.TIMBER]: { name: "Escora de madeira", solid: true, hp: 50, color: "#5e4630", dropItem: "wood", dropQty: 1 },
  [TILE.WALLPAPER_WARM]: { name: "Parede pintada (ocre)", solid: true, hp: 40, color: "#8a6f63", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.WALLPAPER_BLUE]: { name: "Parede pintada (azul)", solid: true, hp: 40, color: "#6f7f8a", dropItem: "concrete_chunk", dropQty: 1 },
  [TILE.CARPET_BLUE]: { name: "Carpete azul", solid: true, hp: 30, color: "#4a5566", dropItem: "cloth", dropQty: 1 },
  [TILE.COAL_ORE]: { name: "Veio de carvão", solid: true, hp: 62, color: "#343638", dropItem: "coal", dropQty: 2 },
  [TILE.IRON_ORE]: { name: "Minério de ferro", solid: true, hp: 82, color: "#6f625b", dropItem: "iron_ore", dropQty: 1 },
  [TILE.COPPER_ORE]: { name: "Minério de cobre", solid: true, hp: 70, color: "#745d49", dropItem: "copper_ore", dropQty: 1 },
  [TILE.QUARTZ_ORE]: { name: "Veio de quartzo", solid: true, hp: 92, color: "#7b7884", dropItem: "quartz", dropQty: 1 },
  [TILE.SLATE]: { name: "Ardósia profunda", solid: true, hp: 88, color: "#363b40", dropItem: "dark_stone", dropQty: 1 }
};

// Material family — drives edge blending, footstep dust and build support rules.
const TILE_GROUP = {
  [TILE.GRASS]: 'soil', [TILE.DEAD_GRASS]: 'soil', [TILE.WET_GRASS]: 'soil',
  [TILE.DIRT]: 'soil', [TILE.DRY_DIRT]: 'soil', [TILE.WET_DIRT]: 'soil', [TILE.MUD]: 'soil',
  [TILE.STONE]: 'rock', [TILE.CRACKED_STONE]: 'rock', [TILE.DARK_STONE]: 'rock',
  [TILE.GRAVEL]: 'rock', [TILE.RUBBLE]: 'rock',
  [TILE.ASPHALT]: 'road', [TILE.CRACKED_ASPHALT]: 'road', [TILE.ROAD_LINE]: 'road', [TILE.RAIL]: 'road',
  [TILE.CONCRETE]: 'built', [TILE.CRACKED_CONCRETE]: 'built', [TILE.BRICK]: 'built',
  [TILE.CERAMIC]: 'built', [TILE.WALL_PANEL]: 'built', [TILE.METAL]: 'built',
  [TILE.RUST_METAL]: 'built', [TILE.CHAIN_FENCE]: 'built', [TILE.INDUSTRIAL_FLOOR]: 'built',
  [TILE.GLASS]: 'built', [TILE.ROOF_SHINGLE]: 'built', [TILE.ROOF_METAL]: 'built',
  [TILE.WOOD]: 'wood', [TILE.DARK_WOOD]: 'wood', [TILE.PLANK]: 'wood', [TILE.FLOOR_WOOD]: 'wood',
  [TILE.PAINTED_WOOD]: 'wood', [TILE.FENCE]: 'wood',
  [TILE.LADDER]: 'built', [TILE.CATWALK]: 'built',
  [TILE.LEAF]: 'veg', [TILE.BERRY_BUSH]: 'veg', [TILE.TALL_GRASS]: 'veg',
  [TILE.VINE]: 'veg', [TILE.DRY_FLOWERS]: 'veg', [TILE.WATER_SOURCE]: 'water',
  [TILE.MOSS_STONE]: 'rock', [TILE.WET_STONE]: 'rock', [TILE.COAL_ORE]: 'rock', [TILE.IRON_ORE]: 'rock', [TILE.COPPER_ORE]: 'rock', [TILE.QUARTZ_ORE]: 'rock', [TILE.SLATE]: 'rock', [TILE.LEAF_LITTER]: 'soil', [TILE.OLD_BRICK]: 'built', [TILE.DAMAGED_BRICK]: 'built', [TILE.SUB_BRICK]: 'built', [TILE.DIRTY_CONCRETE]: 'built', [TILE.OLD_CONCRETE]: 'built', [TILE.WET_CONCRETE]: 'built', [TILE.PLASTER]: 'built', [TILE.WALLPAPER]: 'built', [TILE.PEELING_WALL]: 'built', [TILE.WALL_TILE]: 'built', [TILE.LINOLEUM]: 'built', [TILE.CHECKER_FLOOR]: 'built', [TILE.CARPET]: 'built', [TILE.OLD_WOOD]: 'wood', [TILE.SHEET_METAL]: 'built', [TILE.GRATE]: 'built', [TILE.IND_PANEL]: 'built', [TILE.HAZARD_FLOOR]: 'built', [TILE.STATION_TILE]: 'built', [TILE.TECH_WALL]: 'built', [TILE.TECH_PANEL]: 'built', [TILE.DARK_METAL]: 'built', [TILE.CONTAINMENT]: 'built', [TILE.LAB_FLOOR]: 'built', [TILE.TECH_FLOOR]: 'built', [TILE.LAB_WALL]: 'built', [TILE.HEDGE]: 'veg', [TILE.SANDBAG]: 'built', [TILE.TIMBER]: 'wood', [TILE.WALLPAPER_WARM]: 'built', [TILE.WALLPAPER_BLUE]: 'built', [TILE.CARPET_BLUE]: 'built'
};

// Tiles that grow a tuft overlay into the empty tile above them.
const TILE_TUFT = {
  [TILE.GRASS]: { color: '#5b8540', tip: '#76a252', height: 7 },
  [TILE.WET_GRASS]: { color: '#427043', tip: '#548653', height: 8 },
  [TILE.DEAD_GRASS]: { color: '#8f8149', tip: '#a3945a', height: 6 },
  [TILE.DIRT]: { color: '#5d7040', tip: '#6f8c4c', height: 3, sparse: true },
  [TILE.MUD]: { color: '#5a6a44', tip: '#6c7d4e', height: 3, sparse: true },
  [TILE.RUBBLE]: { color: '#6a7050', tip: '#7c8258', height: 3, sparse: true },
  [TILE.LEAF_LITTER]: { color: '#4d6a3a', tip: '#7a6a34', height: 4, sparse: true },
  [TILE.MOSS_STONE]: { color: '#4f6a3a', tip: '#6f8a48', height: 3, sparse: true }
};

const tileGroup = t => TILE_GROUP[t] || (t === TILE.AIR ? 'air' : 'built');


// Stage 28 — deeper geology and mining progression.
TILE.NICKEL_ORE = 83;
TILE.RICH_IRON_ORE = 84;
TILE.CRYSTAL_VEIN = 85;
TILE.BLACKRIDGE_MINERAL = 86;

Object.assign(TILE_ASSET_NAMES, {
  [TILE.NICKEL_ORE]: 'nickel_ore',
  [TILE.RICH_IRON_ORE]: 'rich_iron_ore',
  [TILE.CRYSTAL_VEIN]: 'crystal_vein',
  [TILE.BLACKRIDGE_MINERAL]: 'blackridge_mineral'
});

Object.assign(TILE_INFO, {
  [TILE.NICKEL_ORE]: { name:'Veio de níquel', solid:true, hp:105, color:'#646b69', dropItem:'nickel_ore', dropQty:1 },
  [TILE.RICH_IRON_ORE]: { name:'Bolsa de ferro rico', solid:true, hp:112, color:'#765f55', dropItem:'iron_ore', dropQty:2 },
  [TILE.CRYSTAL_VEIN]: { name:'Cristal profundo', solid:true, hp:138, color:'#6f788a', dropItem:'crystal_shard', dropQty:1 },
  [TILE.BLACKRIDGE_MINERAL]: { name:'Mineral Blackridge', solid:true, hp:175, color:'#3f5358', dropItem:'blackridge_mineral', dropQty:1 }
});
TILE_GROUP[TILE.NICKEL_ORE] = 'rock';
TILE_GROUP[TILE.RICH_IRON_ORE] = 'rock';
TILE_GROUP[TILE.CRYSTAL_VEIN] = 'rock';
TILE_GROUP[TILE.BLACKRIDGE_MINERAL] = 'rock';

const ITEM_DEFS = {
  coal: { name: "Carvão mineral", category: "material", weight: 0.34, stackable: true, maxStack: 60, color: "#343638", description: "Combustível mineral encontrado em galerias profundas. Também entra em metalurgia." },
  iron_ore: { name: "Minério de ferro", category: "material", weight: 0.72, stackable: true, maxStack: 40, color: "#79675e", description: "Rocha rica em ferro. Precisa ser processada numa fornalha." },
  copper_ore: { name: "Minério de cobre", category: "material", weight: 0.58, stackable: true, maxStack: 40, color: "#8a654b", description: "Minério de cobre bruto, comum perto de túneis e pedreiras." },
  quartz: { name: "Quartzo", category: "material", weight: 0.22, stackable: true, maxStack: 40, color: "#b7afc3", description: "Cristal resistente encontrado nas camadas profundas. Útil em componentes elétricos." },
  iron_ingot: { name: "Lingote de ferro", category: "material", weight: 0.85, stackable: true, maxStack: 30, color: "#8a8d8e", description: "Ferro processado. Base para ferramentas e estruturas reforçadas." },
  copper_ingot: { name: "Lingote de cobre", category: "material", weight: 0.62, stackable: true, maxStack: 30, color: "#a36e4f", description: "Cobre refinado para fios e peças elétricas." },
  steel_plate: { name: "Placa reforçada", category: "material", weight: 1.15, stackable: true, maxStack: 24, color: "#6f7779", description: "Placa pesada produzida na fornalha. Excelente para fortificar bases." },
  circuit_parts: { name: "Componentes elétricos", category: "component", weight: 0.24, stackable: true, maxStack: 30, color: "#6f887b", description: "Contatos, pequenas placas e componentes reaproveitados para sistemas elétricos." },
  maintenance_key: { name: "Chave de manutenção do metrô", category: "key", weight: 0.03, stackable: false, color: "#8d7a51", description: "Chave antiga da manutenção subterrânea de North County." },
  steel_pickaxe: { name: "Picareta reforçada", category: "tool", weight: 2.8, stackable: false, maxDurability: 260, color: "#858c90", toolType: "pickaxe", miningPower: 38, description: "Picareta reforçada para mineração profunda. Muito mais eficiente em minério e ardósia." },
  denim_jacket: { name: "Jaqueta jeans", category: "clothing", clothingSlot: "body", weight: 1.05, stackable: false, color: "#4e6274", insulation: 12, rainProtection: 0.12, armor: 0.06, description: "Jaqueta resistente e comum. Dá proteção leve sem ser pesada." },
  utility_vest: { name: "Colete utilitário", category: "clothing", clothingSlot: "body", weight: 1.2, stackable: false, color: "#5e6551", insulation: 7, rainProtection: 0.08, armor: 0.16, description: "Colete reforçado de trabalho. Proteção moderada para exploração urbana." },
  miner_helmet: { name: "Capacete de mineiro", category: "clothing", clothingSlot: "head", weight: 0.74, stackable: false, color: "#8a7b4d", insulation: 4, rainProtection: 0.12, armor: 0.14, headlamp: true, description: "Capacete de mineração com luz frontal integrada. Ideal para túneis e metrô." },
  hiking_boots: { name: "Botas de trilha", category: "clothing", clothingSlot: "feet", weight: 1.18, stackable: false, color: "#5f4e3b", insulation: 9, rainProtection: 0.28, armor: 0.05, moveBonus: 0.07, description: "Botas firmes para terreno irregular e longas explorações. Melhoram levemente a mobilidade a pé." },
  rubber_boots: { name: "Botas impermeáveis", category: "clothing", clothingSlot: "feet", weight: 1.34, stackable: false, color: "#3f4846", insulation: 5, rainProtection: 0.72, armor: 0.03, description: "Botas de borracha para túneis úmidos, chuva e áreas alagadas." },
  leather_jacket: { name: "Jaqueta de couro", category: "clothing", clothingSlot: "body", weight: 1.35, stackable: false, color: "#5c4538", insulation: 16, rainProtection: 0.18, armor: 0.10, description: "Jaqueta urbana resistente. Boa proteção sem comprometer demais a mobilidade." },
  firefighter_coat: { name: "Casaco de bombeiro", category: "clothing", clothingSlot: "body", weight: 2.15, stackable: false, color: "#725d3d", insulation: 18, rainProtection: 0.48, armor: 0.20, description: "Casaco pesado de emergência. Excelente contra chuva e impactos leves." },
  police_vest: { name: "Colete de proteção", category: "clothing", clothingSlot: "body", weight: 2.0, stackable: false, color: "#424b50", insulation: 6, rainProtection: 0.06, armor: 0.27, description: "Colete recuperado da delegacia. Pesado, mas oferece a melhor proteção urbana comum." },
  mechanic_overalls: { name: "Macacão de mecânico", category: "clothing", clothingSlot: "body", weight: 1.25, stackable: false, color: "#4f5960", insulation: 10, rainProtection: 0.10, armor: 0.11, moveBonus: 0.03, description: "Roupa de oficina reforçada e confortável para longas expedições." },
  hard_hat: { name: "Capacete industrial", category: "clothing", clothingSlot: "head", weight: 0.62, stackable: false, color: "#b79a4d", insulation: 3, rainProtection: 0.10, armor: 0.12, description: "Capacete de obra encontrado em prédios e áreas industriais." },
  expedition_frame: { name: "Armação de mochila de expedição", category: "component", weight: 1.6, stackable: false, color: "#58614d", upgradeCarry: 12, description: "Estrutura grande para expedições urbanas. Amplia permanentemente a capacidade de carga." },
  apartment_key: { name: "Chave mestra residencial", category: "key", weight: 0.03, stackable: false, color: "#a88f5a", description: "Chave mestra da administração do Residencial Pine Court." },
  hotel_master_key: { name: "Chave mestra do Pine Rest", category: "key", weight: 0.03, stackable: false, color: "#a68b55", description: "Chave mestra da gerência do Motel Pine Rest." },
  dirt: { name: "Terra", category: "material", weight: 0.22, stackable: true, maxStack: 99, color: "#775740", placeTile: TILE.DIRT, description: "Terra compactada. Útil para aterros e construções simples." },
  stone: { name: "Pedra", category: "material", weight: 0.45, stackable: true, maxStack: 99, color: "#66696c", placeTile: TILE.STONE, description: "Pedra bruta. Pesada, resistente e útil para construção." },
  wood: { name: "Madeira", category: "material", weight: 0.32, stackable: true, maxStack: 99, color: "#775039", placeTile: TILE.WOOD, description: "Madeira cortada. Base para ferramentas e estruturas." },
  brick: { name: "Tijolo", category: "material", weight: 0.38, stackable: true, maxStack: 60, color: "#86584c", placeTile: TILE.BRICK, description: "Tijolo recuperado de construções abandonadas." },
  concrete_chunk: { name: "Pedaço de concreto", category: "material", weight: 0.7, stackable: true, maxStack: 40, color: "#7a7d7c", placeTile: TILE.CONCRETE, description: "Concreto quebrado. Muito pesado, mas resistente." },
  mud_block: { name: "Lama compactada", category: "material", weight: 0.25, stackable: true, maxStack: 99, color: "#574a3a", placeTile: TILE.MUD, description: "Lama compactada. Fraca, barata e útil em aterros." },
  gravel: { name: "Cascalho", category: "material", weight: 0.34, stackable: true, maxStack: 99, color: "#66635e", placeTile: TILE.GRAVEL, description: "Pedras pequenas para piso, estradas e drenagem." },
  dark_stone: { name: "Pedra profunda", category: "material", weight: 0.52, stackable: true, maxStack: 80, color: "#41464a", placeTile: TILE.DARK_STONE, description: "Rocha escura extraída das camadas profundas." },
  roof_shingle: { name: "Telha velha", category: "material", weight: 0.28, stackable: true, maxStack: 60, color: "#58463f", placeTile: TILE.ROOF_SHINGLE, description: "Telhas recuperadas de casas antigas." },
  roof_metal: { name: "Chapa de telhado", category: "material", weight: 0.62, stackable: true, maxStack: 40, color: "#525d60", placeTile: TILE.ROOF_METAL, description: "Chapa corrugada para telhados e coberturas." },
  floor_wood: { name: "Piso de madeira", category: "material", weight: 0.28, stackable: true, maxStack: 80, color: "#75523a", placeTile: TILE.FLOOR_WOOD, description: "Tábuas preparadas para piso interno." },
  ladder: { name: "Escada de mão", category: "material", weight: 0.9, stackable: true, maxStack: 20, color: "#7a5a3c", placeTile: TILE.LADDER, description: "Degraus de madeira. Permite subir e descer onde for fixada." },
  plank_wood: { name: "Tábua serrada", category: "material", weight: 0.3, stackable: true, maxStack: 80, color: "#7a5a3c", placeTile: TILE.PLANK, description: "Madeira beneficiada na bancada. Mais resistente que um tronco bruto." },
  scrap_metal: { name: "Sucata metálica", category: "material", weight: 0.55, stackable: true, maxStack: 40, color: "#697177", description: "Metal reaproveitável. Futuramente servirá para crafting e reparos." },
  nails: { name: "Pregos", category: "material", weight: 0.03, stackable: true, maxStack: 80, color: "#8d9295", description: "Pregos enferrujados, ainda úteis em construção." },
  cloth: { name: "Tecido", category: "material", weight: 0.12, stackable: true, maxStack: 30, color: "#9a8c73", description: "Retalhos de tecido recuperados de roupas e móveis." },
  battery: { name: "Bateria", category: "component", weight: 0.8, stackable: true, maxStack: 8, color: "#93864b", description: "Bateria antiga. Ainda pode ter carga útil." },
  wire: { name: "Cabo elétrico", category: "component", weight: 0.18, stackable: true, maxStack: 30, color: "#6d786f", description: "Fiação recuperada. Necessária para projetos elétricos." },
  engine_parts: { name: "Peças de motor", category: "component", weight: 1.1, stackable: true, maxStack: 12, color: "#747a7d", description: "Correias, filtros, mangueiras e peças reaproveitáveis de motores." },
  wheel_set: { name: "Conjunto de rodas", category: "component", weight: 4.8, stackable: false, color: "#666d70", description: "Conjunto abstrato de rodas para restauração e montagem de veículos." },
  body_panels: { name: "Painéis de carroceria", category: "component", weight: 3.6, stackable: true, maxStack: 6, color: "#687377", description: "Painéis reaproveitados para projetos automotivos no jogo." },
  seat_kit: { name: "Conjunto de bancos", category: "component", weight: 2.7, stackable: false, color: "#6a584c", description: "Bancos e suportes para um projeto de veículo." },
  fuel_tank: { name: "Tanque veicular", category: "component", weight: 3.4, stackable: false, color: "#875b48", description: "Módulo abstrato de armazenamento de combustível para veículos." },
  suspension_kit: { name: "Conjunto de suspensão", category: "component", weight: 3.9, stackable: false, color: "#747c7e", description: "Módulo automotivo abstrato usado em montagem e restauração." },
  headlight_kit: { name: "Conjunto de iluminação", category: "component", weight: 1.1, stackable: false, color: "#c0b16f", description: "Faróis, suportes e fiação simplificados como módulo de jogo." },
  garage_parts: { name: "Peças de garagem", category: "component", weight: 1.8, stackable: true, maxStack: 12, color: "#70787a", description: "Peças genéricas usadas em projetos de garagem e restauração." },
  evidence_key: { name: "Chave da sala de evidências", category: "key", weight: 0.03, stackable: false, color: "#8a8f74", description: "Chave presa a uma etiqueta da delegacia de North County." },
  clinic_key: { name: "Chave da farmácia interna", category: "key", weight: 0.03, stackable: false, color: "#7d9a90", description: "Abre o depósito trancado da clínica." },
  motel_key: { name: "Chave do quarto 05", category: "key", weight: 0.03, stackable: false, color: "#9a8a5c", description: "Chave pendurada no quadro da recepção do motel." },
  knife: { name: "Faca de cozinha", category: "tool", weight: 0.45, stackable: false, maxDurability: 90, color: "#9aa0a2", toolType: "knife",
    description: "Rápida e quase silenciosa. Alcance curto: você precisa chegar perto.",
    melee: { damage: 17, range: 30, windup: .06, active: .05, recover: .12, stamina: 3, knockback: 1.2, targets: 1, noise: 55, impact: 'flesh', arc: [12, 44], sneak: 3.4 } },

  machete: { name: "Facão", category: "tool", weight: 1.1, stackable: false, maxDurability: 130, color: "#9aa2a4", toolType: "blade",
    description: "Corta em arco: atinge mais de um infectado de uma vez.",
    melee: { damage: 26, range: 44, windup: .10, active: .07, recover: .16, stamina: 5, knockback: 2.2, targets: 2, noise: 95, impact: 'flesh', arc: [6, 48], sneak: 2.6 } },

  bat: { name: "Bastão de beisebol", category: "tool", weight: 1.2, stackable: false, maxDurability: 110, color: "#8a6a44", toolType: "blunt",
    description: "Balanço largo e pesado. Afasta um grupo, mas pede espaço.",
    melee: { damage: 24, range: 46, windup: .14, active: .07, recover: .20, stamina: 6, knockback: 4.8, targets: 2, noise: 120, impact: 'wood', arc: [6, 46], stagger: 1.2 } },

  metal_pipe: { name: "Cano de metal", category: "tool", weight: 1.6, stackable: false, maxDurability: 170, color: "#79807f", toolType: "blunt",
    description: "Durável e honesto. Nada excepcional, nunca falha.",
    melee: { damage: 22, range: 42, windup: .11, active: .06, recover: .17, stamina: 5, knockback: 3.4, targets: 1, noise: 115, impact: 'metal', arc: [8, 46] } },

  spear: { name: "Lança improvisada", category: "tool", weight: 1.7, stackable: false, maxDurability: 80, color: "#87694a", toolType: "polearm",
    description: "Estocada longa: acerta antes de ser alcançado, mas é lenta.",
    melee: { damage: 28, range: 70, windup: .16, active: .07, recover: .26, stamina: 7, knockback: 2.4, targets: 1, noise: 85, impact: 'flesh', arc: [14, 40], thrust: true } },


  police_baton: { name: "Bastão policial", category: "tool", weight: 0.85, stackable: false, maxDurability: 220, color: "#4d5458", toolType: "blunt",
    description: "Leve, rápido e resistente. Equipamento profissional encontrado em áreas de segurança.",
    melee: { damage: 23, range: 39, windup: .085, active: .055, recover: .135, stamina: 4, knockback: 3.8, targets: 1, noise: 82, impact: 'metal', arc: [9, 45], stagger: 1.15 } },

  fire_axe: { name: "Machado de resgate", category: "tool", weight: 2.65, stackable: false, maxDurability: 240, color: "#8b4d3d", toolType: "axe",
    description: "Ferramenta pesada de emergência. Excelente alcance e impacto, mas cobra bastante fôlego.",
    melee: { damage: 42, range: 50, windup: .19, active: .08, recover: .25, stamina: 11, knockback: 5.4, targets: 1, noise: 150, impact: 'metal', arc: [4, 49], stagger: 1.55 } },

  sledgehammer: { name: "Marreta industrial", category: "tool", weight: 4.1, stackable: false, maxDurability: 300, color: "#686d70", toolType: "hammer",
    description: "Lentíssima e pesada. Quando conecta, abre espaço ao redor do sobrevivente.",
    melee: { damage: 50, range: 46, windup: .27, active: .09, recover: .34, stamina: 15, knockback: 8.2, targets: 2, noise: 185, impact: 'metal', arc: [2, 50], stagger: 2.0 } },

  steel_spear: { name: "Lança reforçada", category: "tool", weight: 2.15, stackable: false, maxDurability: 185, color: "#7b8386", toolType: "polearm",
    description: "Versão reforçada da lança improvisada. Mantém distância e dura muito mais.",
    melee: { damage: 38, range: 80, windup: .15, active: .075, recover: .22, stamina: 7, knockback: 3.1, targets: 1, noise: 88, impact: 'metal', arc: [13, 41], thrust: true, sneak: 2.4 } },

  antenna_part: { name: "Peça de antena", category: "component", weight: 1.4, stackable: true, maxStack: 6, color: "#8a9294", description: "Segmento de antena usado para religar transmissores de campo." },
  backpack_frame: { name: "Armação de mochila", category: "component", weight: 1.2, stackable: false, color: "#6d5a42", upgradeCarry: 8, description: "Estrutura reforçada. Use para ampliar permanentemente o que você consegue carregar." },
  blackridge_keycard: { name: "Cartão Blackridge", category: "key", weight: 0.04, stackable: false, color: "#59656b", description: "Cartão de acesso marcado com o símbolo de Blackridge. Ainda parece legível." },
  respirator: { name: "Respirador industrial", category: "clothing", clothingSlot: "head", weight: 0.68, stackable: false, color: "#69756f", insulation: 2, rainProtection: 0.05, contamProtection: 0.72, description: "Proteção respiratória industrial encontrada perto de instalações de contenção." },
  hazmat_coat: { name: "Casaco de contenção", category: "clothing", clothingSlot: "body", weight: 1.7, stackable: false, color: "#9a8b52", insulation: 5, rainProtection: 0.38, contamProtection: 0.62, description: "Casaco técnico de contenção. Reduz bastante a exposição em áreas contaminadas." },
  filter_cartridge: { name: "Filtro selado", category: "component", weight: 0.28, stackable: true, maxStack: 8, color: "#78847c", description: "Cartucho de filtro lacrado. Pode ser trocado por equipamentos de contenção em versões futuras." },
  county_scrip: { name: "Fichas do Condado", category: "currency", weight: 0.01, stackable: true, maxStack: 999, color: "#b99557", description: "Vales aceitos por comerciantes e pequenas comunidades de Last County." },
  fuel_can: { name: "Galão de combustível", category: "component", weight: 4.8, stackable: false, color: "#9a5b45", description: "Combustível valioso. Pesado e difícil de encontrar." },
  medicine: { name: "Kit médico", category: "medical", weight: 0.65, stackable: true, maxStack: 6, color: "#b86f70", health: 32, description: "Materiais médicos básicos para recuperar ferimentos leves." },
  bandage: { name: "Curativo", category: "medical", weight: 0.12, stackable: true, maxStack: 12, color: "#d8d0bd", health: 14, description: "Curativo simples. Recupera uma pequena quantidade de vida." },
  stone_pickaxe: { name: "Picareta improvisada", category: "tool", weight: 2.4, stackable: false, maxDurability: 120, color: "#8d9294", toolType: "pickaxe",
    description: "Ferramenta de mineração. Equilibrada em combate, mas barulhenta.",
    melee: { damage: 24, range: 48, windup: .16, active: .07, recover: .22, stamina: 7, knockback: 3.2, targets: 1, noise: 145, impact: 'metal', arc: [6, 46] } },
  stone_axe: { name: "Machado improvisado", category: "tool", weight: 2.1, stackable: false, maxDurability: 105, color: "#8b6548", toolType: "axe",
    description: "Dano alto e golpe lento. Custa fôlego, mas derruba.",
    melee: { damage: 34, range: 46, windup: .18, active: .08, recover: .24, stamina: 9, knockback: 3.6, targets: 1, noise: 155, impact: 'flesh', arc: [4, 48] } },
  crowbar: { name: "Pé de cabra", category: "tool", weight: 1.8, stackable: false, maxDurability: 160, color: "#7d8589", toolType: "crowbar",
    description: "Arromba portas e barricadas, e ainda golpeia rápido. O melhor equilíbrio.",
    melee: { damage: 26, range: 44, windup: .10, active: .06, recover: .16, stamina: 5, knockback: 3.0, targets: 1, noise: 130, impact: 'metal', arc: [8, 46] } },
  repair_hammer: { name: "Martelo de reparo", category: "tool", weight: 1.35, stackable: false, maxDurability: 140, color: "#9b744f", toolType: "hammer",
    description: "Lento, mas o impacto joga o infectado longe e o deixa no chão.",
    melee: { damage: 30, range: 40, windup: .20, active: .08, recover: .26, stamina: 9, knockback: 6.4, targets: 1, noise: 140, impact: 'metal', arc: [10, 46], stagger: 1.5 } },
  pistol: { name: "Pistola .380", category: "firearm", weight: 1.1, stackable: false, maxDurability: 200, color: "#5c6366",
    description: "Resolve um problema imediatamente e chama outro de longe.",
    gun: { damage: 34, range: 400, spread: .05, magazine: 12, reload: 1.5, fireRate: .28, recoil: 2.4, noise: 720, ammo: 'ammo_pistol', sound: 'pistol', pellets: 1 } },

  revolver: { name: "Revólver .38", category: "firearm", weight: 1.3, stackable: false, maxDurability: 240, color: "#6a6f70",
    description: "Poucos tiros, cada um decide a briga. Recarga lenta.",
    gun: { damage: 48, range: 430, spread: .04, magazine: 6, reload: 2.4, fireRate: .46, recoil: 3.6, noise: 780, ammo: 'ammo_pistol', sound: 'revolver', pellets: 1 } },

  shotgun: { name: "Espingarda calibre 12", category: "firearm", weight: 3.2, stackable: false, maxDurability: 220, color: "#6d5a43",
    description: "Devastadora de perto, inútil de longe, ouvida por todo o condado.",
    gun: { damage: 15, range: 190, spread: .26, magazine: 5, reload: 2.8, fireRate: .78, recoil: 6.5, noise: 900, ammo: 'ammo_shotgun', sound: 'shotgun', pellets: 7 } },

  rifle: { name: "Rifle de caça .22", category: "firearm", weight: 2.8, stackable: false, maxDurability: 260, color: "#6b5945",
    description: "Alcance longo e preciso. O estouro viaja mais longe que a bala.",
    gun: { damage: 62, range: 640, spread: .012, magazine: 8, reload: 2.1, fireRate: .82, recoil: 4.2, noise: 850, ammo: 'ammo_rifle', sound: 'rifle', pellets: 1 } },



  smg_compact: { name: "Submetralhadora compacta", category: "firearm", weight: 2.35, stackable: false, maxDurability: 245, color: "#4f5659",
    description: "Arma automática compacta de segurança. Controlável de perto, muito barulhenta quando sustentada.",
    gun: { damage: 24, range: 330, spread: .082, magazine: 24, reload: 1.85, fireRate: .095, recoil: 2.1, noise: 760, ammo: 'ammo_pistol', sound: 'pistol', pellets: 1, auto: true } },

  police_carbine: { name: "Carabina policial", category: "firearm", weight: 2.9, stackable: false, maxDurability: 285, color: "#4d5658",
    description: "Equipamento raro da delegacia. Mais rápida que um rifle de caça e ainda precisa de disciplina com munição.",
    gun: { damage: 46, range: 560, spread: .024, magazine: 18, reload: 1.95, fireRate: .22, recoil: 3.0, noise: 825, ammo: 'ammo_rifle', sound: 'rifle', pellets: 1 } },

  blackridge_carbine: { name: "Carabina BR-7", category: "firearm", weight: 3.05, stackable: false, maxDurability: 330, color: "#48555a",
    description: "Equipamento de contenção Blackridge. Raro, preciso e pensado como recompensa de fim de jogo.",
    gun: { damage: 52, range: 590, spread: .018, magazine: 24, reload: 1.7, fireRate: .12, recoil: 2.6, noise: 790, ammo: 'ammo_rifle', sound: 'rifle', pellets: 1, auto: true } },

  ammo_pistol: { name: "Munição de pistola", category: "ammo", weight: 0.012, stackable: true, maxStack: 90, color: "#9a8a5c", description: "Cartuchos .380 / .38. Servem em pistola e revólver." },
  ammo_shotgun: { name: "Cartuchos calibre 12", category: "ammo", weight: 0.04, stackable: true, maxStack: 40, color: "#8a5a4c", description: "Cartuchos vermelhos. Pesados e escassos." },
  ammo_rifle: { name: "Munição de rifle", category: "ammo", weight: 0.018, stackable: true, maxStack: 60, color: "#7d8a6a", description: "Cartuchos .22 de caixa antiga." },

  flashlight: { name: "Lanterna", category: "light", weight: 0.65, stackable: false, maxDurability: 180, color: "#c9b978", description: "Lanterna a pilha. Equipada na hotbar, botão direito liga ou desliga. A carga diminui enquanto acesa." },

  police_jacket: { name: "Jaqueta policial", category: "clothing", clothingSlot: "body", weight: 1.45, stackable: false, color: "#37454d", insulation: 11, rainProtection: 0.18, armor: 0.17, description: "Jaqueta de patrulha reforçada. Menos proteção que um colete, mas muito mais leve." },
  police_helmet: { name: "Capacete policial", category: "clothing", clothingSlot: "head", weight: 1.05, stackable: false, color: "#3f484c", insulation: 3, rainProtection: 0.16, armor: 0.19, description: "Proteção profissional recuperada da delegacia." },
  firefighter_helmet: { name: "Capacete de bombeiro", category: "clothing", clothingSlot: "head", weight: 1.15, stackable: false, color: "#b09a58", insulation: 4, rainProtection: 0.34, armor: 0.20, description: "Capacete pesado de resgate. Excelente para áreas industriais e prédios danificados." },
  firefighter_boots: { name: "Botas de bombeiro", category: "clothing", clothingSlot: "feet", weight: 1.65, stackable: false, color: "#31383a", insulation: 9, rainProtection: 0.58, armor: 0.10, description: "Botas altas de emergência. Pesadas, impermeáveis e resistentes." },
  paramedic_jacket: { name: "Jaqueta de paramédico", category: "clothing", clothingSlot: "body", weight: 1.05, stackable: false, color: "#526e69", insulation: 9, rainProtection: 0.28, armor: 0.08, description: "Roupa de resposta médica. Leve e adequada para expedições urbanas." },
  ranger_jacket: { name: "Jaqueta de guarda florestal", category: "clothing", clothingSlot: "body", weight: 1.12, stackable: false, color: "#52604b", insulation: 13, rainProtection: 0.34, armor: 0.08, moveBonus: 0.04, description: "Roupa de campo resistente. Boa escolha para floresta e viagens longas." },
  blackridge_vest: { name: "Colete de contenção BR", category: "clothing", clothingSlot: "body", weight: 2.25, stackable: false, color: "#455359", insulation: 5, rainProtection: 0.18, armor: 0.32, contamProtection: 0.30, description: "Colete técnico de segurança Blackridge. Equipamento raro de fim de jogo." },
  blackridge_helmet: { name: "Capacete de contenção BR", category: "clothing", clothingSlot: "head", weight: 1.18, stackable: false, color: "#4c5a5e", insulation: 3, rainProtection: 0.14, armor: 0.20, contamProtection: 0.35, headlamp: true, description: "Capacete técnico com iluminação integrada e proteção de contenção." },

  rain_jacket: { name: "Jaqueta impermeável", category: "clothing", clothingSlot: "body", weight: 1.25, stackable: false, color: "#556b62", insulation: 10, rainProtection: 0.72, description: "Boa proteção contra chuva. Isolamento térmico moderado." },
  wool_coat: { name: "Casaco de lã", category: "clothing", clothingSlot: "body", weight: 1.65, stackable: false, color: "#6b5f55", insulation: 24, rainProtection: 0.18, description: "Muito quente, mas absorve água facilmente." },
  work_boots: { name: "Botas de trabalho", category: "clothing", clothingSlot: "feet", weight: 1.4, stackable: false, color: "#554638", insulation: 7, rainProtection: 0.16, description: "Botas resistentes que ajudam um pouco contra frio e chuva." },
  wool_hat: { name: "Gorro de lã", category: "clothing", clothingSlot: "head", weight: 0.22, stackable: false, color: "#735d57", insulation: 8, rainProtection: 0.08, description: "Pequeno, leve e útil durante noites frias." },
  disinfectant: { name: "Antisséptico", category: "medical", weight: 0.32, stackable: true, maxStack: 8, color: "#9bb0a2", infectionCare: 35, description: "Ajuda a reduzir o risco de complicações em ferimentos recentes." },
  canned_food: { name: "Comida enlatada", category: "food", weight: 0.48, stackable: true, maxStack: 12, color: "#a36f4c", hunger: 38, thirst: -2, description: "Ainda parece comestível. Saciante, embora bem salgada." },
  snack_bar: { name: "Barra de cereal", category: "food", weight: 0.09, stackable: true, maxStack: 12, color: "#b28d54", hunger: 18, thirst: -1, description: "Pequena, leve e ótima para viagens." },
  berries: { name: "Bagas silvestres", category: "food", weight: 0.08, stackable: true, maxStack: 30, color: "#9f4d58", hunger: 12, thirst: 3, perishable: 54, nutrition: 1, description: "Bagas encontradas em arbustos. Pouco alimento, mas melhor que nada." },
  water_bottle: { name: "Garrafa de água", category: "drink", weight: 0.75, stackable: true, maxStack: 8, color: "#639bb4", thirst: 48, returnItem: "empty_bottle", description: "Água limpa em uma garrafa reutilizável." },
  soda: { name: "Refrigerante", category: "drink", weight: 0.4, stackable: true, maxStack: 6, color: "#8d5b57", thirst: 24, hunger: 4, description: "Quente e sem gás, mas ainda mata a sede." },
  empty_bottle: { name: "Garrafa vazia", category: "container", weight: 0.12, stackable: true, maxStack: 8, color: "#94a5ad", fillable: true, description: "Pode ser preenchida em uma fonte de água." }
};


// Stage 28 resource ladder. These are intentionally abstract game materials,
// feeding progression without mirroring real-world industrial recipes.
Object.assign(ITEM_DEFS, {
  nickel_ore: { name:'Minério de níquel', category:'material', weight:.76, stackable:true, maxStack:36, color:'#68706d', description:'Minério profundo usado na progressão industrial do jogo.' },
  nickel_ingot: { name:'Lingote de níquel', category:'material', weight:.82, stackable:true, maxStack:28, color:'#7b8380', description:'Metal refinado usado em ligas industriais abstratas.' },
  crystal_shard: { name:'Cristal profundo', category:'material', weight:.24, stackable:true, maxStack:30, color:'#7f8ca1', description:'Cristal raro encontrado em bolsões profundos. Componente de sensores e equipamentos avançados.' },
  blackridge_mineral: { name:'Mineral Blackridge', category:'material', weight:.68, stackable:true, maxStack:18, color:'#48646a', description:'Material incomum encontrado perto das camadas de contenção de Blackridge.' },
  industrial_alloy: { name:'Liga industrial', category:'material', weight:1.08, stackable:true, maxStack:24, color:'#606a6c', description:'Material avançado de jogo produzido a partir da metalurgia de alto nível.' },
  geology_scanner: { name:'Scanner geológico', category:'tool', weight:1.15, stackable:false, maxDurability:90, color:'#61747a', toolType:'scanner', description:'Ferramenta de prospecção. Botão direito procura assinaturas minerais próximas sem revelar a posição exata.' },
  industrial_pickaxe: { name:'Picareta industrial', category:'tool', weight:3.05, stackable:false, maxDurability:420, color:'#697476', toolType:'pickaxe', miningTier:3, miningPower:56, description:'Ferramenta industrial de mineração. Abre depósitos profundos e trabalha muito mais rápido.', melee:{ damage:31, range:49, windup:.17, active:.07, recover:.22, stamina:8, knockback:3.8, targets:1, noise:150, impact:'metal', arc:[6,46] } },
  containment_cutter: { name:'Extrator de contenção BR', category:'tool', weight:3.25, stackable:false, maxDurability:520, color:'#44585d', toolType:'pickaxe', miningTier:4, miningPower:72, description:'Equipamento Blackridge adaptado para materiais de contenção e geologia extrema.', melee:{ damage:34, range:48, windup:.15, active:.07, recover:.20, stamina:8, knockback:4.1, targets:1, noise:145, impact:'metal', arc:[6,46] } }
});
ITEM_DEFS.stone_pickaxe.miningTier = 1;
ITEM_DEFS.stone_pickaxe.miningPower = ITEM_DEFS.stone_pickaxe.miningPower || 22;
ITEM_DEFS.steel_pickaxe.miningTier = 2;
ITEM_DEFS.steel_pickaxe.miningPower = ITEM_DEFS.steel_pickaxe.miningPower || 38;

// Stage 30 — clothing is now a real loadout rather than three passive slots.
// Values stay deliberately small: the interesting choice is specialization,
// not stacking a giant RPG armour number.
Object.assign(ITEM_DEFS, {
  hoodie: { name:'Moletom civil', category:'clothing', clothingSlot:'body', gearSet:'civil', weight:.82, stackable:false, color:'#596166', insulation:14, rainProtection:.08, armor:.035, description:'Roupa civil confortável. Boa para noites frias e exploração leve.' },
  cargo_pants: { name:'Calça cargo', category:'clothing', clothingSlot:'legs', gearSet:'field', weight:.74, stackable:false, color:'#5b604f', insulation:6, rainProtection:.08, armor:.035, moveBonus:.015, description:'Calça resistente com bolsos e bom conforto para viagens.' },
  jeans: { name:'Calça jeans', category:'clothing', clothingSlot:'legs', gearSet:'civil', weight:.78, stackable:false, color:'#48596b', insulation:7, rainProtection:.05, armor:.045, description:'Calça civil comum e resistente.' },
  sneakers: { name:'Tênis leve', category:'clothing', clothingSlot:'feet', gearSet:'civil', weight:.62, stackable:false, color:'#596267', insulation:3, rainProtection:.03, armor:.015, moveBonus:.035, noiseModifier:-.12, staminaModifier:.04, description:'Calçado leve. Mais silencioso e econômico para caminhadas, mas pouco protetor.' },
  field_gloves: { name:'Luvas de campo', category:'clothing', clothingSlot:'hands', gearSet:'field', weight:.22, stackable:false, color:'#615747', insulation:4, rainProtection:.08, armor:.025, description:'Luvas simples para trabalho, mato e exploração.' },
  daypack: { name:'Mochila pequena', category:'clothing', clothingSlot:'pack', gearSet:'civil', weight:.85, stackable:false, color:'#5b6659', carryBonus:6, moveBonus:-.01, description:'Mochila civil compacta. Acrescenta 6 kg de capacidade enquanto equipada.' },
  hiking_pack: { name:'Mochila de trilha', category:'clothing', clothingSlot:'pack', gearSet:'field', weight:1.45, stackable:false, color:'#58604b', carryBonus:12, moveBonus:-.02, staminaModifier:-.02, description:'Mochila de campo espaçosa para expedições longas. +12 kg de capacidade.' },

  police_pants: { name:'Calça de patrulha', category:'clothing', clothingSlot:'legs', gearSet:'police', weight:.88, stackable:false, color:'#37434a', insulation:6, rainProtection:.12, armor:.075, description:'Calça reforçada recuperada de equipamento policial.' },
  tactical_boots: { name:'Botas de patrulha', category:'clothing', clothingSlot:'feet', gearSet:'police', weight:1.3, stackable:false, color:'#30373a', insulation:6, rainProtection:.22, armor:.075, noiseModifier:.02, description:'Botas profissionais resistentes para cidade e estruturas.' },
  patrol_gloves: { name:'Luvas de patrulha', category:'clothing', clothingSlot:'hands', gearSet:'police', weight:.28, stackable:false, color:'#353d41', insulation:3, armor:.045, description:'Luvas profissionais leves de resposta urbana.' },
  patrol_pack: { name:'Mochila de patrulha', category:'clothing', clothingSlot:'pack', gearSet:'police', weight:1.55, stackable:false, color:'#3f4b50', carryBonus:10, armor:.015, moveBonus:-.015, description:'Mochila profissional compacta. +10 kg de carga e boa distribuição de peso.' },

  firefighter_pants: { name:'Calça de bombeiro', category:'clothing', clothingSlot:'legs', gearSet:'firefighter', weight:1.65, stackable:false, color:'#665943', insulation:12, rainProtection:.38, armor:.12, moveBonus:-.025, description:'Calça pesada de emergência, muito resistente e impermeável.' },
  rescue_gloves: { name:'Luvas de resgate', category:'clothing', clothingSlot:'hands', gearSet:'firefighter', weight:.42, stackable:false, color:'#6b5c43', insulation:8, rainProtection:.20, armor:.07, description:'Luvas grossas de resgate para áreas danificadas.' },
  rescue_pack: { name:'Mochila de resgate', category:'clothing', clothingSlot:'pack', gearSet:'firefighter', weight:1.8, stackable:false, color:'#775c3e', carryBonus:8, armor:.02, rainProtection:.12, moveBonus:-.025, description:'Mochila de resposta civil. +8 kg de capacidade e proteção robusta.' },

  paramedic_pants: { name:'Calça de paramédico', category:'clothing', clothingSlot:'legs', gearSet:'medical', weight:.72, stackable:false, color:'#486a66', insulation:5, rainProtection:.16, armor:.035, moveBonus:.015, description:'Roupa leve de resposta médica.' },
  medical_gloves: { name:'Luvas médicas reforçadas', category:'clothing', clothingSlot:'hands', gearSet:'medical', weight:.16, stackable:false, color:'#728f89', armor:.015, medicalBonus:.08, description:'Luvas de atendimento que ajudam a manter o kit médico organizado e eficiente.' },
  medical_pack: { name:'Mochila médica', category:'clothing', clothingSlot:'pack', gearSet:'medical', weight:1.2, stackable:false, color:'#536e69', carryBonus:8, medicalBonus:.10, description:'Bolsa médica de campo. +8 kg e pequeno bônus ao usar suprimentos médicos.' },

  work_pants: { name:'Calça industrial', category:'clothing', clothingSlot:'legs', gearSet:'industrial', weight:.95, stackable:false, color:'#4b555a', insulation:6, rainProtection:.08, armor:.065, description:'Calça de trabalho reforçada para oficinas e indústria.' },
  industrial_gloves: { name:'Luvas industriais', category:'clothing', clothingSlot:'hands', gearSet:'industrial', weight:.35, stackable:false, color:'#596064', insulation:4, armor:.06, repairBonus:.08, description:'Luvas de oficina que ajudam no manuseio de peças e manutenção.' },
  tool_pack: { name:'Mochila de ferramentas', category:'clothing', clothingSlot:'pack', gearSet:'industrial', weight:1.65, stackable:false, color:'#505a5d', carryBonus:9, repairBonus:.10, moveBonus:-.02, description:'Mochila organizada para peças e ferramentas. +9 kg de capacidade.' },

  miner_overalls: { name:'Macacão de mineração', category:'clothing', clothingSlot:'body', gearSet:'mining', weight:1.4, stackable:false, color:'#625d4d', insulation:9, rainProtection:.10, armor:.10, miningEfficiency:.08, description:'Macacão resistente para galerias e trabalhos subterrâneos.' },
  miner_pants: { name:'Calça de mineração', category:'clothing', clothingSlot:'legs', gearSet:'mining', weight:1.0, stackable:false, color:'#5d5849', insulation:7, armor:.075, miningEfficiency:.05, description:'Calça reforçada de mineração.' },
  miner_gloves: { name:'Luvas de mineração', category:'clothing', clothingSlot:'hands', gearSet:'mining', weight:.34, stackable:false, color:'#665b47', insulation:4, armor:.055, miningEfficiency:.07, description:'Luvas grossas que reduzem o esforço durante mineração.' },
  mining_pack: { name:'Mochila de mineração', category:'clothing', clothingSlot:'pack', gearSet:'mining', weight:1.7, stackable:false, color:'#665f4d', carryBonus:11, miningEfficiency:.05, moveBonus:-.025, description:'Mochila preparada para amostras e minério. +11 kg de capacidade.' },

  rain_pants: { name:'Calça impermeável', category:'clothing', clothingSlot:'legs', gearSet:'rain', weight:.72, stackable:false, color:'#52665f', insulation:4, rainProtection:.52, armor:.02, description:'Camada impermeável leve para tempestades e áreas alagadas.' },
  insulated_gloves: { name:'Luvas térmicas', category:'clothing', clothingSlot:'hands', gearSet:'winter', weight:.26, stackable:false, color:'#655d59', insulation:8, rainProtection:.05, description:'Luvas quentes para noites frias.' },
  insulated_pants: { name:'Calça térmica', category:'clothing', clothingSlot:'legs', gearSet:'winter', weight:1.05, stackable:false, color:'#645d59', insulation:15, rainProtection:.10, armor:.025, moveBonus:-.01, description:'Calça pesada para frio intenso.' },

  blackridge_pants: { name:'Calça de contenção BR', category:'clothing', clothingSlot:'legs', gearSet:'blackridge', weight:1.22, stackable:false, color:'#425257', insulation:5, rainProtection:.18, armor:.11, contamProtection:.18, description:'Proteção técnica Blackridge para a parte inferior do corpo.' },
  blackridge_gloves: { name:'Luvas de contenção BR', category:'clothing', clothingSlot:'hands', gearSet:'blackridge', weight:.32, stackable:false, color:'#46575b', armor:.055, contamProtection:.14, description:'Luvas seladas de contenção.' },
  blackridge_boots: { name:'Botas de contenção BR', category:'clothing', clothingSlot:'feet', gearSet:'blackridge', weight:1.42, stackable:false, color:'#3d4a4e', insulation:5, rainProtection:.38, armor:.085, contamProtection:.14, description:'Botas técnicas para setores contaminados.' },
  blackridge_pack: { name:'Mochila técnica BR', category:'clothing', clothingSlot:'pack', gearSet:'blackridge', weight:1.65, stackable:false, color:'#43565b', carryBonus:10, contamProtection:.08, armor:.015, description:'Mochila técnica selada. +10 kg de capacidade e proteção de contenção.' },

  clothing_patch_kit: { name:'Kit de reparo de roupa', category:'component', weight:.34, stackable:true, maxStack:8, color:'#85745f', clothingRepair:70, description:'Retalhos, linha e fechos para recuperar a condição de roupas e mochilas.' }
});

/* ============================================================== STAGE 31 ===
   Sustento: comida perecível, cozinha, cultivo e caça.

   Três campos movem toda a camada de comida e nada mais precisa conhecê-los:
     perishable — validade em HORAS DE JOGO a ~18 °C. Calor encurta, um
                  armazenamento frio estica. Ausente = nunca estraga.
     nutrition  — qualidade da refeição 0..3. Alimenta a "alimentação", que é
                  um bônus lento e não uma quinta barra para vigiar.
     raw        — comer sem cozinhar é aposta.
   O que estiver marcado como `preserved` decai bem mais devagar: essa é a
   razão inteira de existir carne seca, conserva e uma geladeira ligada.     */
Object.assign(ITEM_DEFS, {
  /* ---------------------------------------------------------- caça: cru */
  raw_meat: { name:'Carne de caça', category:'food', weight:.55, stackable:true, maxStack:12, color:'#8e4f4c', hunger:16, raw:true, perishable:30, nutrition:0, description:'Carne fresca de um animal abatido. Estraga rápido e não deve ser comida crua.' },
  raw_small_game: { name:'Carne miúda', category:'food', weight:.22, stackable:true, maxStack:16, color:'#96585a', hunger:9, raw:true, perishable:26, nutrition:0, description:'Porção pequena de coelho ou ave do mato. Rende pouco, mas rende sempre.' },
  animal_fat: { name:'Gordura animal', category:'material', weight:.2, stackable:true, maxStack:20, color:'#cdbd93', perishable:120, description:'Gordura separada no abate. Dá corpo a assados e ensopados.' },
  animal_hide: { name:'Couro cru', category:'material', weight:.62, stackable:true, maxStack:12, color:'#7d6247', description:'Pele bruta. Precisa ser curtida antes de virar roupa.' },
  tanned_leather: { name:'Couro curtido', category:'material', weight:.48, stackable:true, maxStack:14, color:'#6b4c34', description:'Couro tratado com sal. Base de roupas quentes e resistentes.' },
  bone: { name:'Osso', category:'material', weight:.28, stackable:true, maxStack:24, color:'#c3bda6', description:'Ossos limpos. Viram caldo, adubo e cabos de ferramenta.' },
  feathers: { name:'Penas', category:'material', weight:.04, stackable:true, maxStack:40, color:'#9a9583', description:'Penas de aves do mato. Servem de forro e isolamento leve.' },

  /* ------------------------------------------------------ cozinha: pronto */
  cooked_meat: { name:'Carne assada', category:'food', weight:.42, stackable:true, maxStack:12, color:'#8a5a38', hunger:34, thirst:-3, perishable:60, nutrition:2, warm:true, description:'Carne assada no fogo. Segura a fome por um bom tempo.' },
  roast_haunch: { name:'Pernil assado', category:'food', weight:.95, stackable:true, maxStack:6, color:'#96613a', hunger:54, thirst:-4, perishable:48, nutrition:3, warm:true, description:'Peça grande assada devagar. Refeição de verdade depois de uma caçada boa.' },
  jerky: { name:'Carne seca', category:'food', weight:.14, stackable:true, maxStack:20, color:'#6f4630', hunger:22, thirst:-5, preserved:true, perishable:900, nutrition:1, description:'Carne curada no varal. Leve, durável e feita para a estrada.' },
  meat_stew: { name:'Ensopado', category:'food', weight:.85, stackable:true, maxStack:6, color:'#8d6340', hunger:46, thirst:16, perishable:24, nutrition:3, warm:true, description:'Carne, raízes e caldo. A refeição que faz uma base parecer uma casa.' },
  vegetable_soup: { name:'Sopa de legumes', category:'food', weight:.78, stackable:true, maxStack:6, color:'#7e8a4f', hunger:30, thirst:20, perishable:24, nutrition:2, warm:true, description:'Sopa quente da horta. Alimenta e hidrata ao mesmo tempo.' },
  bone_broth: { name:'Caldo de ossos', category:'food', weight:.7, stackable:true, maxStack:6, color:'#a08a58', hunger:14, thirst:26, perishable:20, nutrition:2, warm:true, description:'Caldo fervido por horas. Aquece o corpo numa noite ruim.' },
  baked_potato: { name:'Batata assada', category:'food', weight:.26, stackable:true, maxStack:14, color:'#a9843f', hunger:24, perishable:80, nutrition:1, warm:true, description:'Batata direto nas brasas. Simples e confiável.' },
  roasted_corn: { name:'Milho assado', category:'food', weight:.22, stackable:true, maxStack:14, color:'#bb9a44', hunger:18, thirst:4, perishable:70, nutrition:1, warm:true, description:'Espiga tostada na fogueira.' },
  flatbread: { name:'Pão rústico', category:'food', weight:.3, stackable:true, maxStack:12, color:'#b09763', hunger:28, thirst:-4, perishable:110, nutrition:2, description:'Pão chato assado na chapa. Rende bem e viaja bem.' },
  pickled_vegetables: { name:'Conserva de legumes', category:'food', weight:.6, stackable:true, maxStack:8, color:'#8a9455', hunger:20, thirst:6, preserved:true, perishable:1400, nutrition:2, description:'Legumes em conserva. A despensa que sobrevive ao inverno.' },
  spoiled_food: { name:'Comida estragada', category:'material', weight:.3, stackable:true, maxStack:16, color:'#5f6347', description:'Passou do ponto. Não serve de comida, mas serve de adubo.' },

  /* --------------------------------------------------------------- horta */
  potato: { name:'Batata', category:'food', weight:.28, stackable:true, maxStack:20, color:'#9c8151', hunger:14, raw:true, perishable:200, nutrition:0, description:'Raiz da horta. Assada rende muito mais do que crua.' },
  corn: { name:'Milho', category:'food', weight:.24, stackable:true, maxStack:20, color:'#c0a049', hunger:11, thirst:3, raw:true, perishable:140, nutrition:0, description:'Espiga colhida. Vira comida, farinha ou semente.' },
  beans: { name:'Feijão', category:'food', weight:.2, stackable:true, maxStack:24, color:'#7a5a42', hunger:10, raw:true, perishable:220, nutrition:0, description:'Grão resistente. Guarda bem e engrossa qualquer panela.' },
  tomato: { name:'Tomate', category:'food', weight:.18, stackable:true, maxStack:20, color:'#a4503f', hunger:7, thirst:9, perishable:70, nutrition:1, description:'Fruto suculento. Mata um pouco da sede junto com a fome.' },
  wheat_grain: { name:'Grãos de trigo', category:'material', weight:.16, stackable:true, maxStack:30, color:'#b8a76a', perishable:520, description:'Grãos debulhados. Moídos viram farinha.' },
  flour: { name:'Farinha', category:'material', weight:.24, stackable:true, maxStack:20, color:'#c8bc9b', perishable:600, description:'Farinha moída na bancada. Base do pão.' },
  wild_herbs: { name:'Ervas silvestres', category:'food', weight:.05, stackable:true, maxStack:30, color:'#6f8a4f', hunger:3, thirst:2, perishable:90, nutrition:1, description:'Ervas de beira de mata. Temperam a comida e rendem chá.' },
  dried_herbs: { name:'Ervas secas', category:'material', weight:.03, stackable:true, maxStack:30, color:'#7b7e4a', preserved:true, description:'Ervas curadas no varal. Guardam sabor e propriedades por meses.' },
  salt: { name:'Sal', category:'material', weight:.1, stackable:true, maxStack:30, color:'#cfd0c6', description:'Sal de despensa. Conserva carne e curte couro.' },
  glass_jar: { name:'Pote de vidro', category:'container', weight:.18, stackable:true, maxStack:12, color:'#9fb2ae', description:'Pote com tampa. Guarda conservas sem estragar.' },
  fertilizer: { name:'Composto', category:'material', weight:.35, stackable:true, maxStack:16, color:'#5d5136', description:'Adubo feito de restos e ossos. Acelera e engorda a colheita.' },

  /* ------------------------------------------------------------ sementes */
  seed_potato: { name:'Semente de batata', category:'seed', crop:'potato', weight:.06, stackable:true, maxStack:24, color:'#8d7a52', description:'Tubérculo de plantio. Colheita lenta, porém farta.' },
  seed_corn: { name:'Semente de milho', category:'seed', crop:'corn', weight:.05, stackable:true, maxStack:24, color:'#b39a52', description:'Grãos de plantio. Gosta de sol e de água.' },
  seed_bean: { name:'Semente de feijão', category:'seed', crop:'beans', weight:.05, stackable:true, maxStack:24, color:'#7a6249', description:'Semente rústica. Cresce rápido e aguenta o frio.' },
  seed_tomato: { name:'Semente de tomate', category:'seed', crop:'tomato', weight:.04, stackable:true, maxStack:24, color:'#96604f', description:'Semente delicada. Rende muito, mas odeia geada.' },
  seed_wheat: { name:'Semente de trigo', category:'seed', crop:'wheat', weight:.05, stackable:true, maxStack:24, color:'#ad9a63', description:'Semente de cereal. Vira grão, farinha e pão.' },

  /* --------------------------------------------------------- ferramentas */
  watering_can: { name:'Regador', category:'tool', weight:.9, stackable:false, maxDurability:120, color:'#6d7a6a', toolType:'watering', description:'Regador de metal. Encha numa fonte de água e mantenha a horta viva.' },
  butcher_knife: { name:'Faca de abate', category:'tool', weight:.62, stackable:false, maxDurability:190, color:'#8d8478', toolType:'butcher', butcherBonus:.45, description:'Lâmina larga de abate. Aproveita muito mais carne e couro de cada animal.', melee:{ damage:17, range:34, windup:.1, active:.05, recover:.17, stamina:4, knockback:1.6, targets:1, noise:62, impact:'flesh', arc:[10,44] } },

  /* ----------------------------------------------------- roupa de caçador */
  leather_coat: { name:'Casaco de couro', category:'clothing', clothingSlot:'body', gearSet:'hunter', weight:1.5, stackable:false, color:'#5c4331', insulation:21, rainProtection:.22, armor:.09, description:'Casaco curtido na base. Quente, resistente e feito do que você caçou.' },
  fur_hood: { name:'Capuz de pele', category:'clothing', clothingSlot:'head', gearSet:'hunter', weight:.4, stackable:false, color:'#6b5642', insulation:15, rainProtection:.12, armor:.03, description:'Capuz forrado de pele. A diferença entre uma noite fria e uma noite perigosa.' },
  leather_gloves: { name:'Luvas de couro', category:'clothing', clothingSlot:'hands', gearSet:'hunter', weight:.24, stackable:false, color:'#61462f', insulation:7, rainProtection:.1, armor:.045, description:'Luvas curtidas. Boas para frio, mato e trabalho de faca.' },
  hide_boots: { name:'Botas de couro cru', category:'clothing', clothingSlot:'feet', gearSet:'hunter', weight:1.05, stackable:false, color:'#55402e', insulation:11, rainProtection:.16, armor:.05, noiseModifier:-.08, description:'Botas de couro costurado. Silenciosas no mato e quentes no inverno.' }
});

// Existing clothes join the condition system automatically. Professional gear
// lasts longer; lightweight civilian clothes wear faster.
for (const def of Object.values(ITEM_DEFS)) {
  if (def?.category !== 'clothing') continue;
  if (!def.maxDurability) {
    const base = def.clothingSlot === 'pack' ? 190 : def.clothingSlot === 'head' ? 170 : def.clothingSlot === 'hands' ? 130 : def.clothingSlot === 'feet' ? 190 : 210;
    const professional = ['police','firefighter','industrial','mining','blackridge'].includes(def.gearSet) ? 1.25 : 1;
    def.maxDurability = Math.round(base * professional);
  }
}


// Bare hands, so unarmed combat goes through exactly the same pipeline.
const FIST_PROFILE = {
  damage: 8, range: 28, windup: .07, active: .05, recover: .15,
  stamina: 3, knockback: 1.0, targets: 1, noise: 60, impact: 'flesh', arc: [12, 44]
};

const DEFAULT_HOTBAR = [
  "knife",
  "stone_pickaxe",
  "stone_axe",
  "bandage",
  "water_bottle",
  "snack_bar",
  "empty_bottle",
  "wood",
  null
];
