// Builds the places of Last County: roads and trails, buildings with real
// interiors, basements and attics, and the interactive points (locked doors,
// barricades, hatches, terminals, caches) that make exploring worthwhile.

const LOOT_TABLES = {
  kitchen: [["canned_food", .78, [1, 3]], ["water_bottle", .62, [1, 2]], ["snack_bar", .7, [1, 3]], ["empty_bottle", .45, [1, 2]], ["cloth", .22, [1, 2]], ["knife", .22, [1, 1]], ["salt", .5, [1, 3]], ["glass_jar", .4, [1, 3]], ["pickled_vegetables", .16, [1, 2]], ["butcher_knife", .07, [1, 1]]],
  household: [["cloth", .72, [1, 4]], ["water_bottle", .3, [1, 2]], ["bandage", .28, [1, 2]], ["battery", .18, [1, 1]], ["snack_bar", .32, [1, 2]], ["rain_jacket", .10, [1, 1]], ["wool_hat", .14, [1, 1]], ["work_boots", .10, [1, 1]], ["knife", .16, [1, 1]], ["bat", .1, [1, 1]]],
  tools: [["nails", .85, [4, 14]], ["scrap_metal", .7, [1, 4]], ["weapon_parts", .18, [1, 3]], ["spring_parts", .10, [1, 2]], ["maintenance_kit", .045, [1, 1]], ["wood", .52, [1, 4]], ["stone_axe", .13, [1, 1]], ["crowbar", .18, [1, 1]], ["hatchet", .08, [1,1]], ["battery", .32, [1, 2]], ["ladder", .2, [1, 2]], ["metal_pipe", .16, [1, 1]], ["machete", .08, [1, 1]], ["hard_hat", .055, [1,1]], ["utility_vest", .045, [1,1]]],
  market: [["canned_food", .88, [1, 4]], ["water_bottle", .82, [1, 3]], ["snack_bar", .88, [1, 4]], ["soda", .66, [1, 3]], ["empty_bottle", .34, [1, 2]], ["salt", .56, [1, 4]], ["glass_jar", .44, [1, 3]], ["flour", .34, [1, 2]], ["seed_potato", .22, [1, 2]], ["seed_tomato", .18, [1, 2]]],
  medical: [["bandage", .9, [1, 4]], ["medicine", .55, [1, 2]], ["water_bottle", .42, [1, 2]], ["cloth", .48, [1, 3]], ["disinfectant", .48, [1, 2]], ["paramedic_jacket", .055, [1,1]]],
  pharmacy: [["medicine", .8, [1, 3]], ["bandage", .8, [2, 5]], ["disinfectant", .7, [1, 3]], ["county_scrip", .3, [4, 12]]],
  workshop: [["scrap_metal", .9, [2, 6]], ["nails", .78, [4, 15]], ["battery", .55, [1, 2]], ["wire", .62, [2, 6]], ["engine_parts", .42, [1, 2]], ["garage_parts", .46, [1, 3]], ["body_panels", .22, [1, 2]], ["wheel_set", .13, [1, 1]], ["suspension_kit", .12, [1, 1]], ["crowbar", .32, [1, 1]], ["fuel_can", .32, [1, 1]], ["stone_pickaxe", .14, [1, 1]], ["flashlight", .28, [1, 1]], ["work_boots", .12, [1, 1]], ["mechanic_overalls", .08, [1,1]], ["hard_hat", .06, [1,1]], ["steel_pickaxe", .045, [1,1]], ["sledgehammer", .035, [1,1]]],
  gas: [["fuel_can", .55, [1, 1]], ["water_bottle", .62, [1, 2]], ["soda", .72, [1, 2]], ["snack_bar", .68, [1, 3]], ["battery", .3, [1, 1]], ["engine_parts", .18, [1, 1]], ["fuel_tank", .14, [1, 1]], ["headlight_kit", .18, [1, 1]], ["seat_kit", .12, [1, 1]]],
  school: [["water_bottle", .5, [1, 2]], ["snack_bar", .62, [1, 3]], ["cloth", .58, [1, 3]], ["bandage", .34, [1, 2]], ["battery", .16, [1, 1]], ["county_scrip", .14, [2, 8]], ["bat", .28, [1, 1]], ["backpack_frame", .12, [1, 1]]],
  motel: [["cloth", .75, [1, 4]], ["water_bottle", .42, [1, 2]], ["snack_bar", .34, [1, 2]], ["battery", .22, [1, 1]], ["bandage", .26, [1, 2]], ["rain_jacket", .08, [1, 1]]],
  farm: [["wood", .7, [2, 6]], ["nails", .6, [3, 10]], ["cloth", .4, [1, 3]], ["canned_food", .5, [1, 2]], ["berries", .4, [2, 5]], ["fuel_can", .16, [1, 1]], ["ladder", .24, [1, 1]], ["seed_potato", .42, [1, 3]], ["seed_corn", .34, [1, 3]], ["seed_bean", .3, [1, 3]], ["seed_tomato", .26, [1, 2]], ["seed_wheat", .24, [1, 3]], ["fertilizer", .3, [1, 3]], ["watering_can", .12, [1, 1]], ["salt", .3, [1, 2]], ["jerky", .2, [1, 3]], ["ammo_shotgun", .24, [2, 6]], ["shotgun", .07, [1, 1]], ["civilian_carbine", .02, [1,1]], ["ammo_carbine", .10, [4,8]], ["machete", .14, [1, 1]]],
  camp: [["snack_bar", .6, [1, 2]], ["water_bottle", .5, [1, 2]], ["cloth", .5, [1, 3]], ["wood", .6, [2, 5]], ["bandage", .3, [1, 2]], ["flashlight", .12, [1, 1]], ["knife", .2, [1, 1]], ["ammo_rifle", .18, [3, 8]], ["rifle", .05, [1, 1]], ["civilian_carbine", .025, [1,1]], ["ammo_carbine", .12, [4,10]], ["hiking_boots", .05, [1,1]], ["denim_jacket", .045, [1,1]], ["ranger_jacket", .04, [1,1]]],
  firestation: [["bandage", .52, [1,3]], ["medicine", .22, [1,1]], ["flashlight", .42, [1,1]], ["battery", .38, [1,2]], ["crowbar", .24, [1,1]], ["fire_axe", .16, [1,1]], ["rescue_mallet", .07, [1,1]], ["maintenance_kit", .05, [1,1]], ["firefighter_coat", .16, [1,1]], ["firefighter_helmet", .12, [1,1]], ["firefighter_boots", .12, [1,1]], ["metal_pipe", .20, [1,1]]],
  police: [["crowbar", .34, [1, 1]], ["bandage", .5, [1, 3]], ["battery", .4, [1, 2]], ["flashlight", .35, [1, 1]], ["county_scrip", .4, [6, 18]], ["blackridge_keycard", .08, [1, 1]], ["weapon_parts", .42, [1,4]], ["spring_parts", .30, [1,3]], ["precision_parts", .14, [1,2]], ["damaged_weapon_frame", .08, [1,1]], ["maintenance_kit", .12, [1,1]], ["optic_module", .055, [1,1]], ["stability_module", .045, [1,1]], ["handling_module", .055, [1,1]], ["ammo_pistol", .62, [6, 20]], ["ammo_carbine", .44, [5,16]], ["ammo_rifle", .28, [4,12]], ["pistol", .19, [1, 1]], ["revolver", .1, [1, 1]], ["shotgun", .09, [1, 1]], ["security_pistol", .075, [1,1]], ["patrol_shotgun", .045, [1,1]], ["smg_compact", .045, [1,1]], ["compact_carbine", .04, [1,1]], ["police_carbine", .028, [1,1]], ["police_baton", .20, [1,1]], ["police_vest", .09, [1,1]], ["police_jacket", .09, [1,1]], ["police_helmet", .06, [1,1]]],
  garage: [["engine_parts", .6, [1, 3]], ["garage_parts", .6, [1, 3]], ["scrap_metal", .7, [2, 5]], ["fuel_can", .3, [1, 1]], ["wheel_set", .18, [1, 1]], ["body_panels", .3, [1, 2]], ["metal_pipe", .26, [1, 1]], ["crowbar", .2, [1, 1]]],
  industrial: [["scrap_metal", .9, [3, 8]], ["wire", .7, [3, 8]], ["battery", .5, [1, 2]], ["weapon_parts", .16, [1,3]], ["spring_parts", .12, [1,2]], ["precision_parts", .045, [1,1]], ["garage_parts", .5, [1, 3]], ["filter_cartridge", .3, [1, 2]], ["fuel_can", .25, [1, 1]], ["metal_pipe", .3, [1, 1]], ["wrecking_bar", .05, [1,1]], ["spear", .1, [1, 1]], ["rubber_boots", .055, [1,1]], ["hard_hat", .06, [1,1]], ["utility_vest", .05, [1,1]], ["expedition_frame", .02, [1,1]], ["sledgehammer", .025, [1,1]]],
  blackridge: [["filter_cartridge", .7, [1, 2]], ["battery", .6, [1, 2]], ["wire", .6, [2, 6]], ["medicine", .4, [1, 2]], ["disinfectant", .5, [1, 2]], ["respirator", .18, [1, 1]], ["hazmat_coat", .14, [1, 1]], ["blackridge_vest", .075, [1,1]], ["blackridge_helmet", .065, [1,1]], ["blackridge_keycard", .12, [1, 1]], ["precision_parts", .34, [1,3]], ["maintenance_kit", .18, [1,2]], ["optic_module", .14, [1,1]], ["stability_module", .12, [1,1]], ["handling_module", .12, [1,1]], ["county_scrip", .3, [4, 14]], ["ammo_rifle", .58, [5, 16]], ["ammo_carbine", .50, [5,18]], ["blackridge_carbine", .045, [1,1]], ["blackridge_smg", .034, [1,1]], ["blackridge_marksman", .024, [1,1]], ["police_carbine", .06, [1,1]], ["smg_compact", .055, [1,1]], ["rifle", .08, [1, 1]], ["ammo_pistol", .42, [6, 18]]],
  office: [["county_scrip", .42, [2, 10]], ["battery", .35, [1, 2]], ["wire", .30, [1, 4]], ["cloth", .32, [1, 2]], ["water_bottle", .25, [1, 1]], ["circuit_parts", .16, [1, 2]], ["flashlight", .08, [1, 1]]],
  mining: [["coal", .82, [2, 6]], ["iron_ore", .72, [1, 4]], ["copper_ore", .62, [1, 4]], ["quartz", .30, [1, 2]], ["nickel_ore", .18, [1, 2]], ["crystal_shard", .07, [1, 1]], ["scrap_metal", .55, [1, 4]], ["steel_pickaxe", .08, [1, 1]], ["industrial_pickaxe", .025, [1, 1]], ["geology_scanner", .035, [1, 1]], ["miner_helmet", .08, [1, 1]], ["battery", .25, [1, 2]]],
  apartment: [["cloth", .72, [1, 4]], ["water_bottle", .45, [1, 2]], ["canned_food", .36, [1, 2]], ["battery", .26, [1, 2]], ["bandage", .26, [1, 2]], ["denim_jacket", .08, [1, 1]], ["leather_jacket", .05, [1, 1]], ["apartment_key", .04, [1, 1]]],
  hotel: [["cloth", .76, [1, 4]], ["water_bottle", .42, [1, 2]], ["snack_bar", .38, [1, 2]], ["battery", .24, [1, 2]], ["bandage", .22, [1, 2]], ["hotel_master_key", .035, [1, 1]], ["hiking_boots", .06, [1, 1]]],
  hardware: [["nails", .90, [5, 16]], ["wire", .72, [2, 7]], ["scrap_metal", .78, [2, 6]], ["wood", .64, [2, 6]], ["steel_plate", .20, [1, 2]], ["circuit_parts", .18, [1, 2]], ["crowbar", .18, [1, 1]], ["steel_pickaxe", .07, [1, 1]]],
  rooftop: [["wire", .60, [1, 5]], ["battery", .45, [1, 2]], ["scrap_metal", .50, [1, 4]], ["circuit_parts", .22, [1, 2]], ["filter_cartridge", .14, [1, 1]], ["hard_hat", .08, [1, 1]]],
  // deliberately thin — not every container should pay out
  scraps: [["cloth", .5, [1, 2]], ["nails", .4, [1, 4]], ["wood", .3, [1, 2]]],
  // somebody held out here: water, bandages, a little food
  holdout: [["water_bottle", .8, [1, 3]], ["canned_food", .7, [1, 3]], ["bandage", .6, [1, 3]], ["battery", .4, [1, 2]], ["flashlight", .2, [1, 1]], ["ammo_pistol", .3, [4, 10]], ["crowbar", .15, [1, 1]]]
};

// Stage 30 — gear is found where it makes sense. Civilian clothes stay common;
// complete professional sets require visiting the relevant workplace.
LOOT_TABLES.household.push(
  ["hoodie", .10, [1,1]], ["jeans", .10, [1,1]], ["sneakers", .08, [1,1]],
  ["daypack", .055, [1,1]], ["cargo_pants", .06, [1,1]], ["field_gloves", .06, [1,1]],
  ["clothing_patch_kit", .035, [1,1]]
);
LOOT_TABLES.apartment.push(["hoodie", .11, [1,1]], ["jeans", .11, [1,1]], ["daypack", .06, [1,1]], ["sneakers", .08, [1,1]]);
LOOT_TABLES.hotel.push(["hiking_pack", .035, [1,1]], ["cargo_pants", .06, [1,1]], ["clothing_patch_kit", .04, [1,1]]);
LOOT_TABLES.camp.push(["hiking_pack", .045, [1,1]], ["field_gloves", .06, [1,1]], ["cargo_pants", .055, [1,1]]);
LOOT_TABLES.farm.push(["field_gloves", .08, [1,1]], ["work_pants", .055, [1,1]], ["tool_pack", .025, [1,1]]);
LOOT_TABLES.workshop.push(["work_pants", .08, [1,1]], ["industrial_gloves", .07, [1,1]], ["tool_pack", .045, [1,1]], ["clothing_patch_kit", .08, [1,2]]);
LOOT_TABLES.industrial.push(["work_pants", .08, [1,1]], ["industrial_gloves", .08, [1,1]], ["tool_pack", .04, [1,1]], ["rain_pants", .04, [1,1]]);
LOOT_TABLES.medical.push(["paramedic_pants", .05, [1,1]], ["medical_gloves", .065, [1,1]], ["medical_pack", .035, [1,1]]);
LOOT_TABLES.pharmacy.push(["medical_gloves", .045, [1,1]], ["clothing_patch_kit", .025, [1,1]]);
LOOT_TABLES.firestation.push(
  ["firefighter_pants", .14, [1,1]], ["rescue_gloves", .12, [1,1]], ["rescue_pack", .07, [1,1]], ["clothing_patch_kit", .07, [1,1]]
);
LOOT_TABLES.police.push(
  ["police_pants", .10, [1,1]], ["tactical_boots", .09, [1,1]], ["patrol_gloves", .08, [1,1]], ["patrol_pack", .055, [1,1]], ["clothing_patch_kit", .08, [1,2]]
);
LOOT_TABLES.mining.push(
  ["miner_overalls", .07, [1,1]], ["miner_pants", .08, [1,1]], ["miner_gloves", .09, [1,1]], ["mining_pack", .045, [1,1]], ["clothing_patch_kit", .06, [1,1]]
);
LOOT_TABLES.blackridge.push(
  ["blackridge_pants", .065, [1,1]], ["blackridge_gloves", .065, [1,1]], ["blackridge_boots", .055, [1,1]], ["blackridge_pack", .045, [1,1]], ["clothing_patch_kit", .10, [1,2]]
);
LOOT_TABLES.rooftop.push(["rain_pants", .035, [1,1]], ["insulated_gloves", .025, [1,1]]);

/* ------------------------------------------------------------ world state */

// Every structure carries a world state (structure.state, lootProfile,
// dangerLevel, ambientProfile, eventPool, secretRooms, powered, discovered,
// visits, alert). The dressing, loot, danger, lighting and event passes all
// read from it, so a looted market and an intact one look — and play —
// differently.
const STATE_WEIGHTS = { intact: 3, looted: 4, barricaded: 1.5, infested: 1.5, damaged: 1.5 };
const STATE_LABELS = { intact: 'intacto', looted: 'saqueado', barricaded: 'barricado', infested: 'infestado', damaged: 'danificado' };
const STATE_DANGER = { intact: 1, looted: 0.8, barricaded: 0.55, infested: 1.9, damaged: 1.1 };
const STATE_LOOT = { intact: 0.08, looted: 0.5, barricaded: 0.14, infested: 0.2, damaged: 0.3 };

const STRUCTURE_PROFILES = {
  camp: { loot: 'camp', ambient: 'forest', danger: 1, events: ['radio', 'noise_room'], states: { intact: 2, looted: 3, barricaded: 2 } },
  ranger: { loot: 'camp', ambient: 'forest', danger: 1, spawn: 1, events: ['radio', 'lights_flicker', 'noise_room'], states: { intact: 2, looted: 2, barricaded: 2, damaged: 1 } },
  wreck: { loot: 'garage', ambient: 'forest', danger: 1, spawn: 0, events: ['radio'], states: { looted: 1, intact: 1 } },
  cabin: { loot: 'household', ambient: 'forest', danger: 1, events: ['radio', 'noise_room'], states: { intact: 2, looted: 2, barricaded: 2, damaged: 1 } },
  farm: { loot: 'farm', ambient: 'rural', danger: 2, events: ['generator_start', 'noise_room', 'radio'] },
  farm_annex: { loot: 'farm', ambient: 'rural', danger: 1, spawn: 1, events: ['machine_noise', 'noise_room'] },
  trailer: { loot: 'household', ambient: 'rural', danger: 1, events: ['radio', 'noise_room'] },
  chapel: { loot: 'household', ambient: 'rural', danger: 1, events: ['bell', 'noise_room', 'lights_flicker'], states: { intact: 2, looted: 2, barricaded: 3, damaged: 1 } },
  cemetery: { loot: 'scraps', ambient: 'rural', danger: 1, spawn: 1, events: ['noise_room'] },
  gas_station: { loot: 'gas', ambient: 'road', danger: 2, events: ['alarm', 'lights_flicker', 'generator_start'] },
  diner: { loot: 'kitchen', ambient: 'road', danger: 1, events: ['radio', 'lights_flicker', 'noise_room'] },
  suburb: { loot: 'household', ambient: 'suburb', danger: 2, events: ['radio', 'lights_flicker', 'noise_room'] },
  house: { loot: 'household', ambient: 'suburb', danger: 2, events: ['radio', 'lights_flicker', 'noise_room'] },
  market: { loot: 'market', ambient: 'downtown', danger: 3, events: ['alarm', 'stock_unlock', 'power_fail', 'lights_flicker'] },
  pharmacy: { loot: 'pharmacy', ambient: 'downtown', danger: 2, events: ['alarm', 'lights_flicker', 'stock_unlock'] },
  police: { loot: 'police', ambient: 'downtown', danger: 3, events: ['alarm', 'radio', 'power_fail', 'stock_unlock'] },
  parking: { loot: 'garage', ambient: 'downtown', danger: 2, events: ['alarm', 'noise_room'] },
  school: { loot: 'school', ambient: 'civic', danger: 2, events: ['bell', 'lights_flicker', 'noise_room', 'sector_wake'] },
  clinic: { loot: 'medical', ambient: 'civic', danger: 3, events: ['emergency_lights', 'power_fail', 'sector_wake'] },
  apartments: { loot: 'apartment', ambient: 'civic', danger: 3, events: ['radio', 'lights_flicker', 'noise_room', 'sector_wake'] },
  firestation: { loot: 'firestation', ambient: 'industrial', danger: 2, events: ['alarm', 'generator_start', 'radio'] },
  motel: { loot: 'hotel', ambient: 'road', danger: 2, events: ['radio', 'lights_flicker', 'noise_room'] },
  hospital: { loot: 'medical', ambient: 'hospital', danger: 4, events: ['emergency_lights', 'power_fail', 'sector_wake', 'alarm'], states: { intact: 1, looted: 3, infested: 3, damaged: 2 } },
  warehouse: { loot: 'industrial', ambient: 'industrial', danger: 2, events: ['machine_noise', 'generator_start', 'power_fail'] },
  workshop: { loot: 'workshop', ambient: 'industrial', danger: 2, events: ['generator_start', 'machine_noise'] },
  railyard: { loot: 'industrial', ambient: 'industrial', danger: 2, events: ['metal_clang', 'radio'] },
  quarry: { loot: 'tools', ambient: 'mine', danger: 3, events: ['collapse', 'metal_clang', 'lights_flicker'] },
  substation: { loot: 'industrial', ambient: 'industrial', danger: 3, events: ['power_fail', 'generator_start', 'alarm', 'lights_flicker'] },
  underground_mall: { loot: 'market', ambient: 'metro', danger: 4, events: ['lights_flicker', 'alarm', 'horde_tunnel', 'stock_unlock'], states: { looted: 3, infested: 2, damaged: 2 } },
  maintenance: { loot: 'industrial', ambient: 'metro', danger: 4, events: ['metal_clang', 'power_fail', 'sector_wake', 'lights_flicker'], states: { looted: 2, infested: 2, damaged: 2 } },
  mine: { loot: 'mining', ambient: 'mine', danger: 4, events: ['collapse', 'metal_clang', 'sector_wake', 'lights_flicker'], states: { looted: 1, infested: 2, damaged: 3 } },
  metro: { loot: 'industrial', ambient: 'metro', danger: 4, events: ['lights_flicker', 'metal_clang', 'alarm', 'horde_tunnel'], states: { looted: 2, infested: 3, damaged: 2 } },
  drainage: { loot: 'scraps', ambient: 'metro', danger: 2, events: ['metal_clang', 'noise_room'], states: { looted: 2, infested: 1, damaged: 1 } },
  blackridge: { loot: 'blackridge', ambient: 'blackridge', danger: 5, events: ['containment_fail', 'partial_power', 'emergency_lights', 'alarm'], states: { intact: 1, infested: 2, damaged: 1 } }
};

// Room compositions. Each entry is a prop id ('a|b' = pick one, '?' = 50%,
// '~' = 30%). Packing runs left to right, so rooms read as arranged, not
// sprinkled — and the structure state then swaps, adds or breaks things.
const ROOM_THEMES = {
  living: { floor: ['couch|armchair', '?floor_lamp', 'old_tv', '?bookshelf|potted_plant', '~armchair'], wall: ['picture_frame', '?wall_clock', '~picture_frame'] },
  kitchen: { floor: ['fridge', 'kitchen_counter', 'stove', '?dining_set|table', '~trash_can'], wall: ['wall_clock'] },
  dining: { floor: ['dining_set', '?bookshelf|dresser'], wall: ['picture_frame'] },
  bedroom: { floor: ['bed', 'nightstand', '?wardrobe|dresser', '~clothes_pile'], wall: ['picture_frame'] },
  kids: { floor: ['bed', '?dresser', 'cardboard_box', '~bicycle'], wall: ['picture_frame'] },
  bath: { floor: ['bathtub', 'toilet', '?sink'], wall: [] },
  laundry: { floor: ['washing_machine', 'washing_machine|shelf', '?cardboard_box', '~clothes_pile'], wall: [] },
  storage: { floor: ['shelf', 'cardboard_box', '?crate_stack', '?box_open', '~barrel'], wall: [] },
  garage: { floor: ['workbench', 'tire_pile|tire_rack', '?oil_drum', '~gas_cylinders'], wall: [] },
  office: { floor: ['office_desk', '?filing_cabinet', 'computer_desk|filing_cabinet', '~potted_plant'], wall: ['corkboard', '?wall_clock'] },
  archive: { floor: ['filing_cabinet', 'filing_cabinet', 'bookshelf|shelf', 'filing_cabinet', '~cardboard_box'], wall: [] },
  reception: { floor: ['reception_desk', '?potted_plant', 'chair', '~magazine_rack'], wall: ['wall_clock', '?corkboard'] },
  store: { floor: ['store_shelf', 'store_shelf', 'store_shelf', '?drink_cooler'], wall: [] },
  checkout: { floor: ['checkout', '?magazine_rack', 'checkout', '~atm'], wall: [] },
  stockroom: { floor: ['pallet_goods', 'pallet_goods|cardboard_box', 'cardboard_box', '?box_open', '~freezer'], wall: [] },
  freezers: { floor: ['freezer', 'drink_cooler', 'freezer', 'drink_cooler'], wall: [] },
  ward: { floor: ['hospital_bed', 'monitor_stand|iv_stand', 'privacy_curtain', 'hospital_bed', '~iv_stand'], wall: ['wall_clock'] },
  triage: { floor: ['gurney', 'med_cart', '?gurney', '~wheelchair'], wall: ['?corkboard'] },
  isolation: { floor: ['hospital_bed', 'biohazard_bin', 'privacy_curtain', '?monitor_stand'], wall: ['biohazard_sign'] },
  lab: { floor: ['lab_console', 'specimen_shelf', 'computer_desk', '~biohazard_bin'], wall: ['biohazard_sign'] },
  pharmacy_room: { floor: ['shelf', 'medicine_cabinet', 'shelf', '~cardboard_box'], wall: [] },
  classroom: { floor: ['school_desk', 'school_desk', 'school_desk', '?school_desk'], wall: ['chalkboard', 'wall_clock'] },
  library: { floor: ['bookshelf', 'bookshelf', 'table', '?bookshelf'], wall: [] },
  computer_lab: { floor: ['computer_desk', 'computer_desk', '?computer_desk'], wall: ['wall_clock'] },
  cafeteria: { floor: ['cafeteria_table', '?cafeteria_table', 'drink_cooler|vending_machine'], wall: [] },
  locker_room: { floor: ['locker', 'locker', 'street_bench', 'locker'], wall: [] },
  gym: { floor: ['basketball_hoop', '~cardboard_box'], wall: [] },
  cells: { floor: ['jail_bars', 'bedroll', 'jail_bars'], wall: [] },
  evidence: { floor: ['shelf', 'cardboard_box', 'filing_cabinet', 'box_open'], wall: [] },
  motel_room: { floor: ['bed', 'nightstand', 'old_tv', '~suitcases'], wall: ['picture_frame'] },
  workshop: { floor: ['workbench', 'tool_cabinet', 'compressor', '?gas_cylinders', '~engine_block'], wall: [] },
  mechanical: { floor: ['generator|machinery', 'electrical_panel', 'pipe_vertical', '~cable_spool', '?hazard_barrel'], wall: [] },
  dorm: { floor: ['bunk_bed', 'locker', 'bunk_bed', '~clothes_pile'], wall: [] },
  gear: { floor: ['gear_rack', 'hose_reel', 'gear_rack'], wall: [] },
  server: { floor: ['server_rack', 'server_rack', 'computer_desk', 'server_rack'], wall: ['security_camera'] },
  containment: { floor: ['containment_pod', 'lab_console', 'containment_pod', '?hazard_barrel'], wall: ['biohazard_sign'] },
  security: { floor: ['office_desk', 'monitor_stand', 'locker', 'gun_rack'], wall: ['security_camera'] },
  barn: { floor: ['hay_bale', 'feed_sacks', 'wheelbarrow', 'hay_bale'], wall: [] },
  attic: { floor: ['cardboard_box', 'suitcases', '?box_open'], wall: [] },
  cellar: { floor: ['shelf', 'water_jugs|barrel', 'cardboard_box', '?crate_stack'], wall: [] },
  maintenance: { floor: ['tool_cabinet', 'electrical_panel', 'pipe_vertical', '~cable_spool'], wall: [] },
  hall: { floor: ['?potted_plant', '~street_bench'], wall: ['?picture_frame'] },
  lobby: { floor: ['mailbox_cluster', '?potted_plant', 'street_bench|armchair'], wall: ['picture_frame', '?wall_clock'] },
  cabin: { floor: ['bed', 'stove', '?table', 'wardrobe|bookshelf'], wall: ['gun_rack', '?picture_frame'] },
  gas_shop: { floor: ['checkout', 'store_shelf', 'drink_cooler', '?magazine_rack'], wall: ['wall_clock'] },
  diner: { floor: ['table', 'chair', 'table', 'chair', 'checkout'], wall: ['picture_frame', 'wall_clock'] },
  diner_kitchen: { floor: ['stove', 'fridge', '?kitchen_counter'], wall: [] },
  market_floor: { floor: ['checkout', 'store_shelf', 'store_shelf', 'store_shelf', 'drink_cooler', '~freezer'], wall: ['wall_clock'] },
  pharmacy_front: { floor: ['reception_desk', 'store_shelf', '?store_shelf', '~magazine_rack'], wall: ['wall_clock'] },
  warehouse_floor: { floor: ['pallet_rack', 'forklift', 'pallet_rack', 'pallet_goods', '?pallet_rack'], wall: [] },
  concourse: { floor: ['turnstile', 'turnstile', 'ticket_machine', 'street_bench', '?phone_booth', 'magazine_rack', 'atm', '~trash_can'], wall: ['metro_map', 'station_sign'] },
  platform: { floor: ['street_bench', 'trash_can', '?vending_machine', 'street_bench', '~trash_bags'], wall: ['station_sign', 'metro_map'] },
  kiosk: { floor: ['checkout', 'store_shelf', '?drink_cooler'], wall: [] },
  miners: { floor: ['bunk_bed', 'table', 'locker', '~bedroll'], wall: [] },
  explosives: { floor: ['dynamite_crate', 'cable_spool', 'generator', '?dynamite_crate'], wall: [] },
  observation: { floor: ['office_desk', 'monitor_stand', '?computer_desk'], wall: ['security_camera'] },
  power: { floor: ['generator', 'electrical_panel', 'server_rack', 'electrical_panel', '~cable_spool'], wall: [] },
  empty: { floor: [], wall: [] }
};

// What the state does to a room's contents.
const LOOTED_SWAP = { store_shelf: 'store_shelf_empty', wardrobe: 'wardrobe_open', cardboard_box: 'box_open', crate_stack: 'box_open', pallet_goods: 'cardboard_box' };
const STATE_CLUTTER = {
  looted: ['papers', 'box_open', 'broken_furniture', 'bottles', 'clothes_pile'],
  infested: ['trash_bags', 'papers', 'broken_furniture', 'clothes_pile', 'bottles'],
  damaged: ['rubble_pile', 'broken_furniture', 'papers'],
  barricaded: ['water_jugs', 'bedroll', 'candles', 'cardboard_box'],
  intact: []
};
// Props that hang on a wall or ceiling: no ground shadow.
const WALL_PROPS = new Set(['picture_frame', 'wall_clock', 'corkboard', 'chalkboard', 'curtain', 'metro_map', 'station_sign',
  'biohazard_sign', 'security_camera', 'gun_rack', 'fluoro_lamp', 'cable_bundle', 'lantern', 'boarded_window', 'neon_sign',
  'awning', 'pipe_run', 'vent_fan', 'ac_unit', 'medicine_cabinet', 'plank_barricade', 'jail_bars', 'pipe_vertical', 'mine_support']);
const NO_FLIP = new Set(['station_sign', 'metro_map', 'school_sign', 'motel_sign', 'gas_sign', 'billboard', 'wall_clock', 'flag_pole', 'dynamite_crate']);

class StructureManager {
  constructor(world, seed) {
    this.world = world;
    this.seed = seed >>> 0;
    this.structures = [];
    this.containers = [];
    this.props = [];
    this.points = [];              // interactive world points (see places.js)
    this.nextContainerId = 1;
    this.nextPointId = 1;
    this.roadY = new Int16Array(CONFIG.WORLD_W);
    // Stage 20: ambient emitters, light fixtures and the structure being built
    this.emitters = [];
    this.lamps = [];
    this.glows = [];
    this.cur = null;
    this.propBuckets = null;
    this.bucketCount = -1;
    this.time = 0;

    this.clearSpawn();
    this.generateRoad();
    this.generateRegions();
    this.restoreInteractiveLayer();
    this.decorateWorld();
    this.cur = null;
    this.computeWear();
  }

  // Standing cells the player can reach from the spawn (step 1, jump 3,
  // ladders, platforms, falls). Doors, barricades and shutters count as open.
  // strict: only doors that open by hand count (no crowbar, no power yet).
  walkable(strict = false) {
    const w = this.world, W = CONFIG.WORLD_W, H = CONFIG.WORLD_H;
    const open = new Set();
    for (const p of this.points) {
      if (p.kind !== 'door' && p.kind !== 'barricade' && p.kind !== 'shutter') continue;
      if (strict && (p.kind !== 'door' || p.locked)) continue;
      for (let a = 0; a < (p.width || 1); a++) for (let b = 0; b < (p.height || 1); b++) open.add((p.tileY - b) * W + p.tileX + a);
    }
    // flat lookup tables: this walk runs a few dozen times while the map is built
    const kind = new Uint8Array(W * H);          // 1 solid, 2 ladder, 3 platform
    const solidId = new Uint8Array(256), platId = new Uint8Array(256);
    for (const id in TILE_INFO) { solidId[id] = TILE_INFO[id].solid ? 1 : 0; platId[id] = TILE_INFO[id].platform ? 1 : 0; }
    for (let i = 0; i < W * H; i++) {
      const t = w.tiles[i];
      kind[i] = t === TILE.LADDER ? 2 : solidId[t] ? 1 : platId[t] ? 3 : 0;
    }
    for (const i of open) if (kind[i] === 1) kind[i] = 0;
    const solid = (x, y) => x < 0 || x >= W || y < 0 || y >= H ? true : kind[y * W + x] === 1;
    const ladder = (x, y) => x >= 0 && x < W && y >= 0 && y < H && kind[y * W + x] === 2;
    const platform = (x, y) => x >= 0 && x < W && y >= 0 && y < H && kind[y * W + x] === 3;
    const free = (x, y) => !solid(x, y) && !solid(x, y - 1);
    const supported = (x, y) => solid(x, y + 1) || platform(x, y + 1) || ladder(x, y) || ladder(x, y + 1);
    const seen = new Uint8Array(W * H);
    const q = [];
    const push = (x, y) => {
      if (x < 1 || x >= W - 1 || y < 2 || y >= H - 1) return;
      if (seen[y * W + x] || !free(x, y)) return;
      seen[y * W + x] = 1;
      let yy = y;
      while (!supported(x, yy) && yy < H - 2 && free(x, yy + 1)) { yy++; seen[yy * W + x] = 1; }
      q.push(x, yy);
    };
    push(24, w.groundY(24) - 1);
    while (q.length) {
      const y = q.pop(), x = q.pop();
      for (const dx of [-1, 1]) { push(x + dx, y); if (!solid(x, y - 2)) push(x + dx, y - 1); }
      for (let h = 1; h <= 3; h++) {
        if (solid(x, y - h - 1)) break;
        push(x, y - h);
        for (const dx of [-1, 1]) {
          if (!free(x + dx, y - h)) continue;
          push(x + dx, y - h);
          push(x + dx * 2, y - h);
        }
      }
      if (ladder(x, y) || ladder(x, y - 1)) push(x, y - 1);
      if (ladder(x, y + 1) || platform(x, y + 1)) push(x, y + 1);
    }
    return { seen, free, supported, solid };
  }

  // Levelled lots, carved cliffs and gated buildings can wall off the road
  // east. Walk the map from the spawn with bare hands; wherever the walk
  // stops, bolt a ladder up the obstacle (cutting through an eave or roof
  // edge if needed) so the player can always go over the top.
  fixPaths() {
    const w = this.world, W = CONFIG.WORLD_W, H = CONFIG.WORLD_H;
    const cuttable = t => t === TILE.AIR || t === TILE.LADDER || ((tileGroup(t) === 'built' || tileGroup(t) === 'wood') && t !== TILE.GLASS);
    let added = 0;
    for (let iter = 0; iter < 80; iter++) {
      const { seen, supported, solid } = this.walkable(true);
      // the street route: only cells at or above ground level count, so a
      // detour through the metro does not hide a gap on the surface
      let fx = -1;
      for (let x = 25; x < W - 6; x++) {
        let any = false;
        for (let y = 0; y <= w.surface[x] + 2 && y < H; y++) if (seen[y * W + x]) { any = true; break; }
        if (!any) { fx = x - 1; break; }
      }
      if (fx < 0) break;
      let best = null;
      for (let cx = fx; cx >= fx - 10 && cx > 1; cx--) {
        for (let fy = 2; fy <= Math.min(H - 2, w.surface[cx] + 2); fy++) {
          if (!seen[fy * W + cx] || !supported(cx, fy)) continue;
          let cuts = 0;
          for (let ty = fy - 1; ty >= Math.max(3, fy - 28); ty--) {
            const t = w.get(cx, ty - 1);
            if (TILE_INFO[t]?.solid) { if (!cuttable(t) || ++cuts > 3) break; }
            for (const dx of [1, -1]) {
              const nx = cx + dx;
              if (nx <= fx - 12 || seen[ty * W + nx]) continue;
              if (!solid(nx, ty) && !solid(nx, ty - 1) && supported(nx, ty) && nx >= cx) {
                const h = fy - ty + cuts * 2 + (fx - cx);
                if (!best || h < best.h) best = { cx, fy, ty, h };
              }
            }
          }
        }
        if (best) break;
      }
      if (!best) break;
      for (let y = best.ty - 1; y <= best.fy; y++) if (cuttable(w.get(best.cx, y))) w.set(best.cx, y, TILE.LADDER);
      added++;
    }
    // surface places the route passed under (e.g. through the metro) still
    // need a way in from the street
    for (let iter = 0; iter < 40; iter++) {
      const { seen, supported, solid } = this.walkable(true);
      const lost = this.structures.find(st => {
        if (st.underground) return false;
        for (let x = st.x; x <= st.endX; x++) for (let y = st.groundY - 20; y <= st.groundY + 1; y++) if (seen[y * W + x]) return false;
        return true;
      });
      if (!lost) break;
      let best = null;
      for (let cx = lost.x - 1; cx >= lost.x - 14 && cx > 1; cx--) {
        for (let fy = lost.groundY - 24; fy < lost.groundY + 14; fy++) {
          if (fy < 3 || fy >= H - 1 || !seen[fy * W + cx] || !supported(cx, fy)) continue;
          let cuts = 0;
          for (let ty = fy - 1; ty >= Math.max(3, fy - 28); ty--) {
            const t = w.get(cx, ty - 1);
            if (TILE_INFO[t]?.solid) { if (!cuttable(t) || ++cuts > 3) break; }
            const nx = cx + 1;
            if (!seen[ty * W + nx] && !solid(nx, ty) && !solid(nx, ty - 1) && supported(nx, ty)) {
              const h = fy - ty + (lost.x - cx);
              if (!best || h < best.h) best = { cx, fy, ty, h };
            }
          }
        }
      }
      if (!best) { lost.unreachable = true; break; }
      for (let y = best.ty - 1; y <= best.fy; y++) if (cuttable(w.get(best.cx, y))) w.set(best.cx, y, TILE.LADDER);
      added++;
    }
    this.pathLadders = added;
    return added;
  }

  // Per-column wear the terrain renderer reads: ruined places crack, stain
  // and grow vines; intact ones stay clean.
  computeWear() {
    const w = this.world;
    if (!w.wear) w.wear = new Uint8Array(CONFIG.WORLD_W);
    const base = { coldwood: 60, pasture: 50, roadside: 80, crossing: 110, cedar: 110, downtown: 140, civic: 120, dustbowl: 150, westline: 160, ridge: 70, blackridge: 120 };
    const byState = { intact: 40, looted: 120, barricaded: 100, infested: 175, damaged: 230 };
    for (let x = 0; x < CONFIG.WORLD_W; x++) w.wear[x] = base[w.region(x).id] ?? 90;
    for (const s of this.structures) {
      if (s.underground) continue;
      const v = byState[s.state] ?? 90;
      for (let x = Math.max(0, s.x - 1); x <= Math.min(CONFIG.WORLD_W - 1, s.endX + 1); x++) w.wear[x] = v;
    }
  }

  // No trunk or branch may box the player in on the first frame.
  clearSpawn() {
    const w = this.world;
    for (let x = 19; x <= 29; x++) {
      for (let y = 0; y < w.surface[x]; y++) {
        const t = w.get(x, y);
        if (t === TILE.WOOD || t === TILE.DARK_WOOD || t === TILE.LEAF || t === TILE.VINE) w.set(x, y, TILE.AIR);
      }
    }
  }

  rand(n) {
    let x = (n + this.seed * 17) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  chance(salt, p) { return this.rand(salt) < p; }

  /* ------------------------------------------------------------- terrain */

  clearAbove(x, topY, bottomY) {
    for (let y = Math.max(0, topY); y < bottomY; y++) this.world.set(x, y, TILE.AIR);
  }

  levelGround(startX, endX, groundY, topTile = TILE.ASPHALT, subTile = TILE.DIRT) {
    for (let x = startX; x <= endX; x++) {
      if (!this.world.inBounds(x, groundY)) continue;
      this.clearAbove(x, groundY - 16, groundY);
      this.world.set(x, groundY, topTile);
      const soil = 3 + Math.floor(this.rand(x * 37) * 3);
      for (let y = groundY + 1; y < Math.min(CONFIG.WORLD_H, groundY + 9); y++) {
        const d = y - groundY;
        let t = d < soil ? subTile : TILE.STONE;
        const r = this.rand(x * 131 + y * 71);
        if (d < soil && r > 0.86) t = TILE.GRAVEL;
        else if (d >= soil && r > 0.9) t = TILE.CRACKED_STONE;
        else if (d >= soil && r < 0.07) t = TILE.GRAVEL;
        this.world.set(x, y, t);
        this.world.setWall(x, y, d < soil ? subTile : TILE.STONE);
      }
      this.world.surface[x] = groundY;
    }
  }

  // Main highway, with a bridge where it crosses the ravine.
  generateRoad() {
    const START = 40, END = 930;
    let lastY = this.world.surface[START];
    const ravine = this.world.ravines[0];

    for (let x = START; x <= END; x++) {
      const natural = this.world.surface[x];
      const target = Math.round(lastY * 0.88 + natural * 0.12);
      let y = Math.max(lastY - 1, Math.min(lastY + 1, target));

      const onBridge = ravine && Math.abs(x - ravine.centerX) <= ravine.halfWidth;
      if (onBridge) y = ravine.rim;                    // deck stays level

      lastY = y;
      this.roadY[x] = y;
      this.clearAbove(x, y - 9, y);

      const centre = x % 9 >= 3 && x % 9 <= 5;
      const worn = this.rand(x * 71) > 0.78;
      this.world.set(x, y, centre && x > 54 ? TILE.ROAD_LINE : worn ? TILE.CRACKED_ASPHALT : TILE.ASPHALT);

      if (onBridge) {
        // deck structure: girders under, guard rails above
        this.world.set(x, y + 1, TILE.METAL);
        if (x % 6 === 0) for (let d = 2; d < 8; d++) this.world.set(x, y + d, TILE.METAL);
        this.world.set(x, y - 3, TILE.CHAIN_FENCE);
        this.world.set(x, y - 2, TILE.CHAIN_FENCE);
        this.world.surface[x] = y;
        continue;
      }

      for (let d = 1; d <= 5; d++) {
        if (y + d >= CONFIG.WORLD_H) break;
        this.world.set(x, y + d, d < 2 ? TILE.GRAVEL : d < 4 ? TILE.DIRT : TILE.STONE);
        this.world.setWall(x, y + d, d < 4 ? TILE.DIRT : TILE.STONE);
      }
      this.world.surface[x] = y;
    }

    for (let x = START; x <= END; x++) {
      if (this.rand(x * 13) > 0.55) continue;
      const y = this.world.surface[x] - 1;
      if (this.world.get(x, y) === TILE.AIR && this.rand(x * 29) > 0.6) this.world.set(x, y, TILE.RUBBLE);
    }
  }

  // A dirt spur leaving the highway — gives the map branches instead of one line.
  sideRoad(fromX, toX, tile = TILE.GRAVEL) {
    const lo = Math.min(fromX, toX), hi = Math.max(fromX, toX);
    let y = this.world.surface[lo];
    for (let x = lo; x <= hi; x++) {
      const natural = this.world.surface[x];
      y = Math.max(y - 1, Math.min(y + 1, Math.round(y * 0.75 + natural * 0.25)));
      this.clearAbove(x, y - 7, y);
      this.world.set(x, y, tile);
      for (let d = 1; d <= 3; d++) {
        this.world.set(x, y + d, d < 2 ? TILE.DIRT : TILE.STONE);
        this.world.setWall(x, y + d, TILE.DIRT);
      }
      this.world.surface[x] = y;
    }
    return y;
  }

  /* ----------------------------------------------------------- buildings */

  construct(opts) {
    const w = this.world;
    const {
      x, width, groundY,
      floors = 1, floorHeight = 5,
      material = TILE.PLANK, floorTile = TILE.FLOOR_WOOD, backWall = TILE.PLANK,
      roof = 'gable', roofTile = TILE.ROOF_SHINGLE,
      doorAt = 2, windows = true, partitions = [], eaves = 1, salt = 1,
      ladderAt = null
    } = opts;

    const levels = [];
    const windowsAt = [];
    for (let f = 0; f < floors; f++) {
      const floorY = groundY - f * (floorHeight + 1);
      const ceilY = floorY - floorHeight;
      levels.push({ floorY, ceilY });

      for (let tx = x; tx < x + width; tx++) {
        for (let ty = ceilY; ty <= floorY; ty++) w.setWall(tx, ty, backWall);
        for (let ty = ceilY + 1; ty <= floorY - 1; ty++) w.set(tx, ty, TILE.AIR);
      }
      for (let tx = x; tx < x + width; tx++) {
        w.set(tx, floorY, floorTile);
        if (f === floors - 1) w.set(tx, ceilY, material);
      }
      for (let ty = ceilY; ty <= floorY; ty++) {
        w.set(x, ty, material);
        w.set(x + width - 1, ty, material);
      }
      if (windows) {
        // windows sit above head height: low rooms keep two clear rows underneath
        const wy = floorY - (ceilY + 2) >= 3 ? ceilY + 2 : ceilY + 1;
        for (let wx = x + 2; wx < x + width - 2; wx += 4) {
          if (this.rand(salt * 31 + wx + f * 7) < 0.34) continue;
          const broken = this.rand(salt * 97 + wx) > 0.62;
          w.set(wx, wy, broken ? TILE.AIR : TILE.GLASS);
          w.set(wx + 1, wy, broken ? TILE.AIR : TILE.GLASS);
          windowsAt.push({ x: wx, y: wy, level: f, broken });
          w.set(wx, wy - 1, material);
          w.set(wx + 1, wy - 1, material);
        }
      }
      for (const px of partitions) {
        const tx = x + px;
        if (tx <= x || tx >= x + width - 1) continue;
        for (let ty = ceilY + 1; ty <= floorY - 1; ty++) {
          if (ty >= floorY - 2) continue;
          w.set(tx, ty, material);
        }
      }
    }

    // the entrance sits in the outer wall on the side doorAt points to —
    // interior columns used to leave every building sealed
    const doorX = opts.interiorDoor ? x + doorAt : doorAt < width / 2 ? x : x + width - 1;
    for (let ty = groundY - 1; ty >= groundY - 2; ty--) {
      w.set(doorX, ty, TILE.AIR);
      w.setWall(doorX, ty, backWall);
    }
    // a second way out through the opposite wall
    const backDoorX = opts.backDoor ? (doorX === x ? x + width - 1 : x) : null;
    if (backDoorX != null) for (let ty = groundY - 1; ty >= groundY - 2; ty--) { w.set(backDoorX, ty, TILE.AIR); w.setWall(backDoorX, ty, backWall); }

    // vertical link between floors: a ladder instead of the old step stack
    let ladderX = null;
    if (floors > 1) {
      const lx = ladderAt != null ? x + ladderAt : x + width - 3;
      ladderX = lx;
      for (let f = 1; f < floors; f++) {
        const from = levels[f - 1], to = levels[f];
        w.set(lx, to.floorY, TILE.AIR);             // hole through the slab
        for (let ty = to.floorY; ty <= from.floorY - 1; ty++) w.set(lx, ty, TILE.LADDER);
      }
    }

    const topCeil = levels[levels.length - 1].ceilY;
    this.buildRoof(x, width, topCeil, roof, roofTile, eaves, salt);

    // rooms between partitions, per level — the dressing pass furnishes these
    const cuts = [x, ...partitions.map(p => x + p).filter(t => t > x && t < x + width - 1).sort((a, b) => a - b), x + width - 1];
    const rooms = levels.map((lv, f) => {
      const ceiling = f < floors - 1 ? levels[f + 1].floorY : lv.ceilY;
      const out = [];
      for (let i = 0; i < cuts.length - 1; i++) {
        if (cuts[i + 1] - cuts[i] < 2) continue;
        out.push({ x0: cuts[i] + 1, x1: cuts[i + 1] - 1, floorY: lv.floorY, ceilY: ceiling, level: f, index: i });
      }
      return out;
    });
    const result = { levels, doorX, backDoorX, topCeil, x, width, groundY, rooms, windowsAt, ladderX, roof, material, backWall };
    if (this.cur) this.cur.rooms.push(...rooms.flat());
    return result;
  }

  buildRoof(x, width, ceilY, kind, roofTile, eaves, salt) {
    const w = this.world;
    if (kind === 'flat') {
      for (let tx = x - eaves; tx < x + width + eaves; tx++) w.set(tx, ceilY - 1, roofTile);
      w.set(x - eaves, ceilY - 2, roofTile);
      w.set(x + width + eaves - 1, ceilY - 2, roofTile);
      return;
    }
    if (kind === 'shed') {
      const dir = this.rand(salt * 17) > 0.5 ? 1 : -1;
      const rise = Math.max(2, Math.round(width / 6));
      for (let i = 0; i < width + eaves * 2; i++) {
        const tx = x - eaves + i;
        const t = i / (width + eaves * 2 - 1);
        const y = ceilY - 1 - Math.round((dir > 0 ? t : 1 - t) * rise);
        w.set(tx, y, roofTile);
        w.set(tx, y + 1, roofTile);
        for (let fy = y + 2; fy < ceilY; fy++) w.setWall(tx, fy, roofTile);
      }
      return;
    }
    const asym = this.rand(salt * 23) > 0.6;
    const peak = x + Math.floor(width * (asym ? 0.38 : 0.5));
    const rise = Math.max(3, Math.round(width / 4.5));
    for (let tx = x - eaves; tx < x + width + eaves; tx++) {
      const dist = tx <= peak ? (peak - tx) / Math.max(1, peak - (x - eaves)) : (tx - peak) / Math.max(1, (x + width + eaves - 1) - peak);
      const y = ceilY - 1 - Math.round((1 - dist) * rise);
      w.set(tx, y, roofTile);
      w.set(tx, y + 1, roofTile);
      for (let fy = y + 2; fy < ceilY; fy++) {
        w.set(tx, fy, TILE.AIR);
        w.setWall(tx, fy, roofTile);
      }
    }
    if (this.rand(salt * 41) > 0.55) {
      const cx = x + 1 + Math.floor(this.rand(salt * 47) * (width - 3));
      const topY = ceilY - 1 - rise;
      for (let ty = topY; ty > topY - 3; ty--) w.set(cx, ty, TILE.BRICK);
    }
  }

  // A cellar under a building, reached by a ladder behind a hatch.
  basement(x, width, groundY, opts = {}) {
    const w = this.world;
    const depth = opts.depth || 6;
    const top = groundY + 2;
    const bottom = top + depth;
    const wall = opts.wall || TILE.CONCRETE;

    for (let tx = x; tx < x + width; tx++) {
      for (let ty = top; ty <= bottom; ty++) {
        const edge = tx === x || tx === x + width - 1 || ty === bottom;
        w.set(tx, ty, edge ? wall : TILE.AIR);
        w.setWall(tx, ty, opts.backWall || TILE.CRACKED_CONCRETE);
      }
    }
    // shaft from the ground floor down
    const shaftX = x + (opts.shaftAt ?? 2);
    for (let ty = groundY; ty <= top; ty++) {
      w.set(shaftX, ty, TILE.LADDER);
      w.setWall(shaftX, ty, opts.backWall || TILE.CRACKED_CONCRETE);
    }
    for (let ty = top + 1; ty < bottom; ty++) w.set(shaftX, ty, TILE.LADDER);

    return { x, width, top, bottom, shaftX, floorY: bottom - 1 };
  }

  // Deck flush with the ground (a raised step at a doorway has no headroom),
  // posts behind the play plane, a tin roof over it.
  porch(x, width, groundY, salt) {
    const w = this.world;
    const y = groundY - 1;
    for (let tx = x; tx < x + width; tx++) {
      w.set(tx, groundY, TILE.FLOOR_WOOD);
      if (w.get(tx, y) === TILE.FENCE) w.set(tx, y, TILE.AIR);
      w.setWall(tx, y, TILE.PLANK);
    }
    for (let tx = x; tx < x + width; tx += Math.max(2, width - 1)) {
      for (let ty = y; ty > y - 3; ty--) w.setWall(tx, ty, TILE.WOOD);
    }
    for (let tx = x - 1; tx <= x + width; tx++) w.set(tx, y - 3, TILE.ROOF_METAL);
    if (this.rand(salt) > 0.5) this.addProp('chair', x + 1, y, { scale: 0.7 });
  }

  fenceLine(x1, x2, y, gaps = []) {
    for (let x = x1; x <= x2; x++) {
      if (gaps.includes(x)) continue;
      if (this.world.get(x, y) !== TILE.AIR) continue;
      if (this.world.getWall(x, y) !== TILE.AIR) continue;   // never inside a building
      if (this.rand(x * 53) > 0.9) continue;
      this.world.set(x, y, TILE.FENCE);
    }
  }

  chainPerimeter(x1, x2, y, height = 2) {
    for (let x = x1; x <= x2; x++) {
      for (let h = 0; h < height; h++) {
        if (this.world.get(x, y - h) !== TILE.AIR) continue;
        if (this.rand(x * 61 + h) > 0.94) continue;
        this.world.set(x, y - h, TILE.CHAIN_FENCE);
      }
    }
  }

  /* --------------------------------------------------------- inventory */

  addContainer(name, tileX, tileY, category, loot, opts = {}) {
    const box = {
      id: this.nextContainerId++, name,
      x: tileX * CONFIG.TILE + 4, y: tileY * CONFIG.TILE + 8,
      width: CONFIG.TILE - 8, height: CONFIG.TILE - 8,
      category, loot, discovered: false,
      rare: Boolean(opts.rare)
    };
    this.containers.push(box);
    return box;
  }

  addProp(asset, tileX, tileY, opts = {}) {
    const p = {
      asset, tileX, tileY,
      scale: opts.scale || 1,
      offsetX: opts.offsetX || 0,
      offsetY: opts.offsetY || 0,
      flip: Boolean(opts.flip) && !NO_FLIP.has(asset),
      alpha: opts.alpha ?? 1,
      behind: Boolean(opts.behind),
      wall: opts.wall ?? WALL_PROPS.has(asset),
      anim: opts.anim || null,
      tint: opts.tint || null,
      tilt: opts.tilt || 0,
      owner: opts.owner || this.cur || null,
      phase: this.rand(tileX * 7 + tileY * 13) * 6.28
    };
    this.props.push(p);
    return p;
  }

  /* ------------------------------------------------ Stage 20: world state */

  // Picks this run's state for a structure before it is built, so the
  // dressing, loot and danger passes all agree on it.
  plan(type, x, opts = {}) {
    const prof = STRUCTURE_PROFILES[type] || {};
    const weights = opts.states || prof.states || STATE_WEIGHTS;
    let total = 0;
    for (const k in weights) total += weights[k];
    let r = this.rand(x * 977 + type.length * 31) * total, state = 'intact';
    for (const k in weights) { r -= weights[k]; if (r <= 0) { state = k; break; } }
    this.cur = { type, x, state: opts.state || state, rooms: [], secretRooms: [], props: [] };
    return this.cur;
  }

  // Fills in the Stage 19 fields on a structure record.
  applyProfile(s, plan = null) {
    const prof = STRUCTURE_PROFILES[s.type] || {};
    const p = plan && plan.type === s.type ? plan : null;
    s.state = s.state || (p ? p.state : 'intact');
    s.lootProfile = s.lootProfile || prof.loot || 'household';
    s.dangerLevel = s.dangerLevel ?? Math.max(1, Math.round((prof.danger || 1) * (STATE_DANGER[s.state] || 1)));
    s.dangerMult = STATE_DANGER[s.state] || 1;
    s.ambientProfile = s.ambientProfile || prof.ambient || 'rural';
    s.eventPool = s.eventPool || [...(prof.events || [])];
    s.secretRooms = s.secretRooms || (p ? p.secretRooms : []);
    s.rooms = s.rooms || (p ? p.rooms : []);
    s.powered = Boolean(s.powered);
    s.discovered = false;
    s.visits = 0;
    s.alert = 0;
    s.surge = 0;
    s.flicker = 0;
    if (p) for (const prop of p.props) prop.owner = s;
    return s;
  }

  addGroundProp(asset, tileX, opts = {}) {
    if (tileX < 1 || tileX >= CONFIG.WORLD_W - 1) return;
    const y = this.world.groundY(tileX) - 1;
    this.addProp(asset, tileX, y, opts);
  }

  // Interactive point consumed by PlaceSystem.
  addPoint(kind, tileX, tileY, data = {}) {
    const point = {
      id: this.nextPointId++, kind,
      tileX, tileY,
      x: tileX * CONFIG.TILE, y: tileY * CONFIG.TILE,
      state: data.state || 'closed',
      ...data
    };
    this.points.push(point);
    return point;
  }

  // Door that blocks a doorway until opened, forced or unlocked.
  addDoor(tileX, tileY, opts = {}) {
    const w = this.world;
    const height = opts.height || 2;
    for (let i = 0; i < height; i++) w.set(tileX, tileY - i, opts.tile || TILE.PLANK);
    return this.addPoint('door', tileX, tileY, {
      name: opts.name || 'Porta',
      height,
      tile: opts.tile || TILE.PLANK,
      locked: Boolean(opts.locked),
      keyItem: opts.keyItem || null,
      forceTool: opts.forceTool || 'crowbar',
      integrity: opts.integrity ?? 3,
      area: opts.area || null
    });
  }

  addBarricade(tileX, tileY, opts = {}) {
    const w = this.world;
    const height = opts.height || 2;
    for (let i = 0; i < height; i++) w.set(tileX, tileY - i, TILE.PLANK);
    this.addProp('boarded_window', tileX, tileY, { scale: 0.62, offsetY: 6, behind: true });
    return this.addPoint('barricade', tileX, tileY, {
      name: opts.name || 'Barricada',
      height,
      integrity: opts.integrity ?? 4,
      area: opts.area || null
    });
  }

  addHatch(tileX, tileY, targetX, targetY, opts = {}) {
    return this.addPoint('hatch', tileX, tileY, {
      name: opts.name || 'Alçapão',
      targetX, targetY,
      locked: Boolean(opts.locked),
      keyItem: opts.keyItem || null,
      label: opts.label || null
    });
  }

  loot(tableName, salt, rolls = 3, opts = {}) {
    const table = LOOT_TABLES[tableName] || LOOT_TABLES.household;
    // the structure's state decides how picked-over it is
    const state = opts.state || this.cur?.state;
    if (state === 'looted' && !opts.guaranteed) rolls = Math.max(1, rolls - 1);
    if (state === 'intact') rolls += 1;
    // some containers are simply empty — searching has to be able to disappoint
    if (!opts.guaranteed && this.rand(salt * 613) < (opts.emptyChance ?? (state ? STATE_LOOT[state] : 0.18))) return [];

    const result = new Map();
    for (let i = 0; i < rolls; i++) {
      for (let j = 0; j < table.length; j++) {
        const [id, chance, range] = table[j];
        if (this.rand(salt * 97 + i * 31 + j * 17) <= chance / Math.max(1, rolls * .72)) {
          const q = range[0] + Math.floor(this.rand(salt * 131 + i * 19 + j * 43) * (range[1] - range[0] + 1));
          result.set(id, (result.get(id) || 0) + q);
        }
      }
    }
    if (!result.size) {
      const f = table[Math.floor(this.rand(salt * 777) * table.length)];
      result.set(f[0], f[2][0]);
    }
    return [...result.entries()].map(([id, qty]) => ({ id, qty }));
  }

  register(name, type, x, width, groundY, style = 'urban', opts = {}) {
    const s = { name, type, x, endX: x + width, groundY, style, ...opts };
    this.applyProfile(s, this.cur);
    // props, lamps and emitters created during the build point at the plan;
    // rebind them to the finished record
    if (this.cur) {
      for (const l of this.lamps) if (l.owner === this.cur) l.owner = s;
      for (const e of this.emitters) if (e.owner === this.cur) e.owner = s;
      for (const p of this.props) if (p.owner === this.cur) p.owner = s;
    }
    this.structures.push(s);
    this.cur = null;
    return s;
  }

  /* ------------------------------------------------ Stage 20: dressing */

  size(asset) { return (typeof DECOR_SIZE !== 'undefined' && DECOR_SIZE[asset]) || [32, 32]; }

  foot(asset, scale = 1) { return Math.max(1, Math.ceil(this.size(asset)[0] * scale / CONFIG.TILE - 0.2)); }

  // '?a' 50%, '~a' 30%, 'a|b' one of — returns null when the roll skips it.
  pick(spec, salt) {
    let s = spec;
    if (s[0] === '?') { if (this.rand(salt) < 0.5) return null; s = s.slice(1); }
    else if (s[0] === '~') { if (this.rand(salt) < 0.7) return null; s = s.slice(1); }
    const opts = s.split('|');
    return opts[Math.floor(this.rand(salt * 3 + 1) * opts.length) % opts.length];
  }

  floorProp(asset, tx, floorY, opts = {}) {
    const scale = opts.scale || 1.05;
    const w = this.size(asset)[0] * scale;
    const span = (opts.foot || this.foot(asset, scale)) * CONFIG.TILE;
    return this.addProp(asset, tx, floorY - 1, { behind: true, ...opts, scale, offsetX: (opts.offsetX || 0) + Math.round((span - w) / 2) });
  }

  // Hung on the back wall, heightPx above the floor.
  wallProp(asset, tx, floorY, heightPx, opts = {}) {
    return this.addProp(asset, tx, floorY - 1, { behind: true, wall: true, scale: 1, ...opts, offsetY: -heightPx });
  }

  // Hung from the ceiling slab above floorY.
  ceilProp(asset, tx, ceilY, floorY, opts = {}) {
    const h = this.size(asset)[1] * (opts.scale || 1);
    return this.wallProp(asset, tx, floorY, (floorY - ceilY - 1) * CONFIG.TILE - h, opts);
  }

  lamp(px, py, opts = {}) {
    const l = {
      x: px, y: py,
      radius: opts.radius || 170, strength: opts.strength ?? 0.8,
      color: opts.color || 'warm', mode: opts.mode || 'power',
      flicker: opts.flicker || 0, owner: opts.owner || this.cur,
      fixture: opts.fixture || null, phase: this.rand(px * 3 + py) * 6.28
    };
    this.lamps.push(l);
    return l;
  }

  emitter(kind, px, py, opts = {}) {
    const e = { kind, x: px, y: py, rate: opts.rate || 1, owner: opts.owner || this.cur, timer: this.rand(px + py * 7) * 3, w: opts.w || 0 };
    this.emitters.push(e);
    return e;
  }

  blockedCols(room) {
    const out = new Set();
    for (let x = room.x0; x <= room.x1; x++) {
      const t = this.world.get(x, room.floorY - 1);
      if (t === TILE.LADDER || (t !== TILE.AIR && TILE_INFO[t]?.solid)) out.add(x);
      if (this.world.get(x, room.floorY) === TILE.LADDER) out.add(x);
    }
    for (const p of this.points) {
      if ((p.kind === 'door' || p.kind === 'barricade' || p.kind === 'hatch') && p.tileY === room.floorY - 1) out.add(p.tileX);
    }
    return out;
  }

  // Lays out a themed room left to right, then lets the state break it.
  furnish(room, theme, opts = {}) {
    const def = ROOM_THEMES[theme];
    if (!def || room.x1 - room.x0 < 1) return;
    const state = opts.state || this.cur?.state || 'intact';
    const salt = room.x0 * 131 + room.floorY * 17 + (opts.salt || 0);
    const blocked = this.blockedCols(room);
    const scale = opts.scale || 1.05;
    let cx = room.x0 + (this.rand(salt) > 0.55 ? 1 : 0);
    const placed = [];
    def.floor.forEach((spec, i) => {
      let asset = this.pick(spec, salt + i * 37);
      if (!asset) return;
      if (state === 'looted' && LOOTED_SWAP[asset] && this.rand(salt + i) < 0.75) asset = LOOTED_SWAP[asset];
      if (state === 'damaged' && this.rand(salt + i * 5) < 0.18) asset = 'broken_furniture';
      const f = this.foot(asset, scale);
      for (let guard = 0; guard < 4; guard++) {
        let hit = false;
        for (let k = 0; k < f; k++) if (blocked.has(cx + k)) { hit = true; break; }
        if (!hit) break;
        cx++;
      }
      if (cx + f - 1 > room.x1) return;
      placed.push(this.floorProp(asset, cx, room.floorY, { scale, flip: this.rand(salt + i * 11) > 0.6 }));
      cx += f + (this.rand(salt + i * 13) < 0.35 ? 1 : 0);
    });

    // one or two things on the wall, never where a window is
    const height = (room.floorY - room.ceilY - 1) * CONFIG.TILE;
    (def.wall || []).forEach((spec, i) => {
      const asset = this.pick(spec, salt + 400 + i * 29);
      if (!asset) return;
      const tx = room.x0 + Math.floor(this.rand(salt + 500 + i) * (room.x1 - room.x0 + 1));
      if (this.world.get(tx, room.floorY - 3) === TILE.GLASS) return;
      const h = asset === 'chalkboard' || asset === 'corkboard' ? 54 : 58 + Math.floor(this.rand(salt + i) * 10);
      if (h + this.size(asset)[1] > height - 4) return;
      this.wallProp(asset, tx, room.floorY, h, { tilt: state === 'damaged' || state === 'infested' ? (this.rand(salt + i * 3) - 0.5) * 0.3 : 0 });
    });

    // the state leaves its mark
    const clutter = STATE_CLUTTER[state] || [];
    const n = state === 'intact' ? 0 : 1 + Math.floor(this.rand(salt + 700) * 2.2);
    for (let i = 0; i < n && clutter.length; i++) {
      const asset = clutter[Math.floor(this.rand(salt + 710 + i * 3) * clutter.length)];
      const tx = room.x0 + Math.floor(this.rand(salt + 720 + i) * (room.x1 - room.x0 + 1));
      if (blocked.has(tx)) continue;
      this.floorProp(asset, tx, room.floorY, { scale: 1, flip: this.rand(salt + i) > 0.5 });
    }
    if (state === 'infested' && this.rand(salt + 740) < 0.6) this.emitter('flies', (room.x0 + 1) * CONFIG.TILE, (room.floorY - 1) * CONFIG.TILE);
    if (state === 'barricaded' && this.rand(salt + 750) < 0.5) {
      const tx = room.x1 - 1;
      this.floorProp('candles', tx, room.floorY, { scale: 1 });
      this.lamp((tx + 0.5) * CONFIG.TILE, (room.floorY - 0.6) * CONFIG.TILE, { radius: 110, strength: 0.55, mode: 'always', flicker: 0.25, fixture: 'candle' });
    }
    return placed;
  }

  // Swaps the back wall / floor finish of a room so interiors stop being one
  // dark texture: wallpaper in the living room, tile in the bathroom, etc.
  skinRoom(room, wall, floor = null) {
    for (let x = room.x0; x <= room.x1; x++) {
      for (let y = room.ceilY + 1; y < room.floorY; y++) if (this.world.getWall(x, y) !== TILE.AIR) this.world.setWall(x, y, wall);
      if (floor && TILE_INFO[this.world.get(x, room.floorY)]?.solid) this.world.set(x, room.floorY, floor);
    }
  }

  // Structural damage: holes in the back wall, cracked finishes, rubble.
  damageRoom(room, salt) {
    const w = this.world;
    const hx = room.x0 + Math.floor(this.rand(salt) * Math.max(1, room.x1 - room.x0 - 1));
    for (let x = hx; x <= Math.min(room.x1, hx + 1 + Math.floor(this.rand(salt + 1) * 2)); x++) {
      for (let y = room.ceilY + 1; y <= room.ceilY + 1 + Math.floor(this.rand(salt + x) * 2); y++) w.setWall(x, y, TILE.AIR);
    }
    for (let x = room.x0; x <= room.x1; x++) {
      for (let y = room.ceilY + 1; y < room.floorY; y++) {
        if (w.getWall(x, y) === TILE.AIR || this.rand(salt + x * 7 + y) > 0.25) continue;
        const cur = w.getWall(x, y);
        w.setWall(x, y, cur === TILE.BRICK || cur === TILE.OLD_BRICK ? TILE.DAMAGED_BRICK : cur === TILE.WALLPAPER || cur === TILE.PLASTER ? TILE.PEELING_WALL : cur === TILE.CONCRETE ? TILE.CRACKED_CONCRETE : cur);
      }
    }
    // rubble mid-room, never against a partition gap (it would block the doorway)
    if (room.x1 - room.x0 >= 4 && room.floorY - room.ceilY > 4) {
      const rx = room.x0 + 2 + Math.floor(this.rand(salt + 9) * (room.x1 - room.x0 - 3));
      const headroom = [-1, 0, 1].every(dx => !TILE_INFO[w.get(rx + dx, room.floorY - 2)]?.solid && !TILE_INFO[w.get(rx + dx, room.floorY - 3)]?.solid);
      if (headroom && w.get(rx, room.floorY - 1) === TILE.AIR && w.get(rx, room.floorY) !== TILE.LADDER) w.set(rx, room.floorY - 1, TILE.RUBBLE);
    }
  }

  // Fluorescent strips for civic/commercial rooms; they only glow on power.
  lightRoom(room, kind = 'fluoro') {
    const tx = Math.floor((room.x0 + room.x1) / 2);
    if (kind === 'fluoro') {
      this.ceilProp('fluoro_lamp', tx, room.ceilY, room.floorY, { scale: 1, offsetX: -2 });
      this.lamp((tx + 0.5) * CONFIG.TILE, (room.ceilY + 1.4) * CONFIG.TILE, { radius: 200, strength: 0.85, color: 'cold', mode: 'power', flicker: this.rand(tx * 7) < 0.3 ? 0.5 : 0, fixture: 'tube' });
    } else if (kind === 'emergency') {
      this.lamp((tx + 0.5) * CONFIG.TILE, (room.ceilY + 1.2) * CONFIG.TILE, { radius: 150, strength: 0.6, color: 'red', mode: 'emergency', flicker: 0.4, fixture: 'emergency' });
    } else if (kind === 'lantern') {
      this.ceilProp('lantern', tx, room.ceilY, room.floorY, { scale: 1 });
      this.lamp((tx + 0.5) * CONFIG.TILE, (room.ceilY + 1.6) * CONFIG.TILE, { radius: 150, strength: 0.7, color: 'warm', mode: 'always', flicker: 0.2, fixture: 'lantern' });
    } else if (kind === 'bulb') {
      this.lamp((tx + 0.5) * CONFIG.TILE, (room.ceilY + 1.3) * CONFIG.TILE, { radius: 160, strength: 0.75, color: 'warm', mode: 'power', flicker: 0.15, fixture: 'bulb' });
    }
  }

  // Curtains, or boards when the occupants dug in.
  dressWindows(b, style = 'home') {
    const state = this.cur?.state || 'intact';
    b.windowsAt.forEach((wn, i) => {
      const salt = wn.x * 17 + wn.y;
      if (state === 'barricaded' || (state === 'infested' && this.rand(salt) < 0.3)) {
        this.addProp('boarded_window', wn.x, wn.y, { scale: 1, offsetY: 2, behind: true, wall: true, offsetX: 15 });
      } else if (style === 'home' && this.rand(salt + 3) < 0.6) {
        this.addProp('curtain', wn.x, wn.y, { scale: 0.95, offsetY: 30, offsetX: -2, behind: true, wall: true, anim: wn.broken ? 'sway' : null });
      }
    });
  }

  // Furnishes every room of a construct() result from a per-level theme plan.
  dressBuilding(b, plan, opts = {}) {
    const state = this.cur?.state || 'intact';
    b.rooms.forEach((level, f) => {
      level.forEach((room, i) => {
        const spec = plan[f]?.[i] ?? plan[f]?.[plan[f].length - 1] ?? 'empty';
        const theme = this.pick(spec, room.x0 * 7 + f * 3) || 'empty';
        room.theme = theme;
        const skins = opts.skins?.[theme] || opts.skin;
        if (skins) this.skinRoom(room, skins[0], skins[1] || null);
        this.furnish(room, theme, { scale: opts.scale });
        if (opts.lights) this.lightRoom(room, opts.lights);
        if (opts.emergency && this.rand(room.x0 * 5 + f) < 0.7) this.lightRoom(room, 'emergency');
        if (state === 'damaged' && this.rand(room.x0 * 11 + f) < 0.5) this.damageRoom(room, room.x0 * 13 + f);
      });
    });
    if (opts.windows !== false) this.dressWindows(b, opts.windowStyle || 'home');
  }

  // Flat roofs carry the building's machinery — and sometimes a way up.
  roofDress(b, kinds, opts = {}) {
    const y = b.topCeil - 2;
    let cx = b.x + 1;
    kinds.forEach((spec, i) => {
      const asset = this.pick(spec, b.x * 5 + i * 17);
      if (!asset) return;
      const f = this.foot(asset, 1);
      if (cx + f > b.x + b.width - 1) return;
      this.addProp(asset, cx, y, { scale: 1, behind: true });
      if (asset === 'vent_fan' || asset === 'roof_vent') this.emitter('steam', (cx + 0.5) * CONFIG.TILE, (y - 0.5) * CONFIG.TILE, { rate: 0.5 });
      cx += f + 1 + Math.floor(this.rand(b.x + i) * 2);
    });
    if (opts.access) {
      // roof hatch: a ladder from the top floor through the slab
      const lx = b.x + (opts.accessAt ?? b.width - 2);
      const top = b.levels[b.levels.length - 1];
      for (let ty = b.topCeil - 1; ty <= top.floorY - 1; ty++) this.world.set(lx, ty, TILE.LADDER);
    }
    if (opts.loot) this.addContainer(opts.loot.name, b.x + b.width - 3, y - 0, opts.loot.table, this.loot(opts.loot.table, b.x * 3 + 9, 3), { rare: true });
  }

  // A hidden room: carved out of the rock or wall, sealed by a false wall
  // that can be broken through. Something (a draft, a crack) gives it away.
  secretRoom(x0, x1, floorY, height, opts = {}) {
    const w = this.world;
    for (let x = x0 - 1; x <= x1 + 1; x++) {
      for (let y = floorY - height - 1; y <= floorY; y++) {
        const edge = x === x0 - 1 || x === x1 + 1 || y === floorY - height - 1 || y === floorY;
        w.set(x, y, edge ? (opts.wall || TILE.CONCRETE) : TILE.AIR);
        w.setWall(x, y, opts.backWall || TILE.OLD_CONCRETE);
      }
    }
    const sealX = opts.sealSide === 'left' ? x0 - 1 : x1 + 1;
    for (let y = floorY - 2; y <= floorY - 1; y++) {
      w.set(sealX, y, opts.seal || TILE.DAMAGED_BRICK);
      const beyond = sealX + (opts.sealSide === 'left' ? -1 : 1);
      if (opts.open) w.set(beyond, y, TILE.AIR);
    }
    this.emitter('draft', (sealX + 0.5) * CONFIG.TILE, (floorY - 1.5) * CONFIG.TILE, { rate: 0.6 });
    const rec = { kind: opts.kind || 'stash', x0, x1, y0: floorY - height, y1: floorY - 1, realized: true, found: false, label: opts.label || 'Esconderijo' };
    if (this.cur) this.cur.secretRooms.push(rec);
    for (const spec of opts.props || ['cardboard_box', 'bedroll']) {
      const asset = this.pick(spec, x0 * 3 + spec.length);
      if (asset) this.floorProp(asset, x0 + Math.floor(this.rand(x0 + spec.length * 7) * Math.max(1, x1 - x0)), floorY, { scale: 1 });
    }
    this.addContainer(opts.name || 'Esconderijo', x0 + Math.floor((x1 - x0) / 2), floorY - 2, opts.table || 'holdout',
      this.loot(opts.table || 'holdout', x0 * 19 + floorY, 4, { guaranteed: true }), { rare: true });
    return rec;
  }

  // A secret the level remembers but did not build this run — kept rare.
  hookSecret(kind, x, y) {
    if (this.cur) this.cur.secretRooms.push({ kind, x0: x, x1: x, y0: y, y1: y, realized: false, found: false });
  }

  // Environmental vignettes: small arrangements that tell what happened.
  story(kind, tx, floorY, opts = {}) {
    const F = (a, dx, o = {}) => this.floorProp(a, tx + dx, floorY, { scale: 1, ...o });
    switch (kind) {
      case 'fled': // packed bags by the door, wardrobe left open
        F('suitcases', 0); F('clothes_pile', 1); F('wardrobe_open', 2, { scale: 1.05 }); break;
      case 'last_meal': // table still set, radio on it, candles burnt down
        F('dining_set', 0, { scale: 1.05 }); F('radio', 1, { offsetY: -22, behind: true });
        this.floorProp('candles', tx + 1, floorY, { scale: 1, offsetY: -22, offsetX: 18 });
        break;
      case 'holdout': // someone lived in this room
        F('furniture_pile', 0, { scale: 1 }); F('bedroll', 2); F('water_jugs', 4); F('candles', 5);
        this.lamp((tx + 5.5) * CONFIG.TILE, (floorY - 0.6) * CONFIG.TILE, { radius: 120, strength: 0.6, mode: 'always', flicker: 0.3, fixture: 'candle' });
        break;
      case 'mechanic': // a job never finished
        F('car_frame', 0, { scale: 1 }); F('engine_block', 3); F('box_open', 4); F('workbench', 5); break;
      case 'triage': // gurneys lined up in a corridor, a door nailed shut
        F('gurney', 0); F('gurney', 2, { flip: true }); F('biohazard_bin', 4); F('wheelchair', 5); break;
      case 'commuter': // luggage left on the platform
        F('suitcases', 0); F('papers', 1); F('ticket_machine', 2); break;
      case 'last_stand': // sandbags and an empty rack
        F('police_car', 0, { scale: 1 }); F('papers', 3); F('box_open', 4); break;
      case 'campfire':
        F('tent', 0, { scale: 1 }); F('lawn_chair', 2); F('burning_barrel', 3);
        this.lamp((tx + 3.5) * CONFIG.TILE, (floorY - 1) * CONFIG.TILE, { radius: 200, strength: 0.9, mode: 'always', flicker: 0.35, fixture: 'fire' });
        this.emitter('smoke', (tx + 3.5) * CONFIG.TILE, (floorY - 1.4) * CONFIG.TILE, { rate: 1 });
        this.emitter('embers', (tx + 3.5) * CONFIG.TILE, (floorY - 1.2) * CONFIG.TILE, { rate: 1 });
        break;
      case 'quarantine': // a room someone sealed and marked
        F('plank_barricade', 0); F('trash_bags', 1); this.wallProp('biohazard_sign', tx + 1, floorY, 60); break;
      default: break;
    }
  }

  // Front/back yard of a home: varies per lot and per state.
  yard(x0, x1, groundY, salt) {
    const state = this.cur?.state || 'intact';
    const items = state === 'infested' || state === 'looted'
      ? ['trash_bags', '?broken_furniture', '~parked_car', '?bicycle', 'garden_bed']
      : ['garden_bed', '?doghouse|bbq_grill', '?lawn_chair', '~bicycle', '?parked_car'];
    let cx = x0;
    items.forEach((spec, i) => {
      const a = this.pick(spec, salt + i * 19);
      if (!a) return;
      const f = this.foot(a, 1);
      if (cx + f > x1) return;
      const tint = a === 'parked_car' ? ['#8a4a3a', '#4a6a8a', '#6a7a5a', '#b9b4a2', '#3a3d40'][Math.floor(this.rand(salt + 3) * 5)] : null;
      this.addProp(a, cx, groundY - 1, { scale: 1, flip: this.rand(salt + i) > 0.5, tint });
      cx += f + 1;
    });
  }

  lotY(centerX, width) {
    const values = [];
    for (let x = centerX; x < centerX + width; x++) values.push(this.world.surface[x]);
    values.sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  }

  /* -------------------------------------------------------------- places */

  generateRegions() {
    this.makeForestCamp(30);
    this.makeTrailhead(46);
    this.makeCabin(62, 'Cabana do Lenhador');
    this.makeRangerStation(79);
    this.makeFarm(104);
    this.makeFarmAnnex(154);
    this.makeTrailer(186);
    this.makeCamper(200);
    this.makeChapel(214);
    this.makeCemetery(234);
    this.makeGasStation(256);
    this.makeDiner(284);
    this.makeSuburb(304);
    this.makeHouse(368);
    this.makeMarket(398);
    this.makePharmacy(424);
    this.makePolice(446);
    this.makeParking(474);
    this.makeSchool(508);
    this.makeClinic(556);
    this.makeApartments(585);
    this.makeMotel(604);
    this.makeHospital(658);
    this.makeWarehouse(690);
    this.makeWorkshop(718);
    this.makeRailYard(750);
    this.makeFireStation(779);
    this.makeQuarry(800);
    this.makeSubstation(834);
    this.makeMetro();
    this.makeDrainage();
    this.makeUndergroundMall();
    this.makeMaintenanceGalleries();
    this.makeDeepMine();
  }

  // Stage 20.1: restore the interactive building layer that existed before
  // the visual overhaul.  The Stage 20 rooms/props stay untouched; these points
  // sit on top of them and make power, curtains, alarms and movable clutter
  // meaningful again.  Placement is structure-relative so it survives the much
  // richer Stage 20 layouts instead of hard-coding the old coordinates.
  restoreInteractiveLayer() {
    const poweredTypes = new Set(['cabin','ranger','farm','gas_station','diner','suburb','house','market','pharmacy','police','parking','school','clinic','apartments','motel','hospital','warehouse','workshop','firestation','substation','metro','drainage','underground_mall','maintenance','mine']);
    const alarmTypes = new Set(['gas_station','market','pharmacy','police','parking','school','apartments','motel','hospital','warehouse','firestation','substation','metro','underground_mall']);
    const curtainTypes = new Set(['cabin','farm','trailer','suburb','house','clinic','apartments','motel','hospital']);
    const movableTypes = new Set(['farm','suburb','market','school','firestation','warehouse','workshop']);

    const owned = (s, kind) => this.points.some(p => p.kind === kind && (p.area === s.name || (p.tileX >= s.x && p.tileX < s.endX && Math.abs(p.tileY - s.groundY) <= 12)));
    const supportedSpot = (s, frac = .25) => {
      const span = Math.max(4, s.endX - s.x);
      const target = s.x + Math.max(2, Math.min(span - 3, Math.floor(span * frac)));
      const candidates = [];
      for (let d = 0; d < span; d++) {
        const a = target + d, b = target - d;
        if (a > s.x && a < s.endX - 1) candidates.push(a);
        if (d && b > s.x && b < s.endX - 1) candidates.push(b);
      }
      for (const x of candidates) {
        const y = s.groundY - 1;
        if (this.world.inBounds(x,y) && this.world.get(x,y) === TILE.AIR && this.world.isSolid(x,y+1)) return {x,y};
      }
      return { x: Math.max(s.x+1, Math.min(s.endX-2, target)), y: s.groundY-1 };
    };

    for (const s of this.structures) {
      if (poweredTypes.has(s.type)) {
        if (!owned(s,'light_switch')) {
          const q = supportedSpot(s,.20);
          this.addPoint('light_switch', q.x, q.y, { name:`Luzes — ${s.name}`, state:'off', area:s.name });
        }
        if (!owned(s,'fuse_panel')) {
          const q = supportedSpot(s,.82);
          this.addPoint('fuse_panel', q.x, q.y, { name:`Quadro elétrico — ${s.name}`, state:'off', area:s.name });
        }
      }
      if (alarmTypes.has(s.type) && !owned(s,'alarm')) {
        const q = supportedSpot(s,.55);
        this.addPoint('alarm', q.x, q.y, { name:`Alarme — ${s.name}`, state:'off', area:s.name });
      }
      if (curtainTypes.has(s.type) && !owned(s,'curtain')) {
        const q = supportedSpot(s,.42);
        this.addPoint('curtain', q.x, q.y-1, { name:`Cortina — ${s.name}`, state: this.rand(s.x*31+s.groundY) < .62 ? 'closed' : 'open', area:s.name });
      }
      if (movableTypes.has(s.type) && !owned(s,'movable')) {
        const q = supportedSpot(s,.68);
        this.addPoint('movable', q.x, q.y, { name: s.type === 'workshop' ? 'Carrinho de peças' : s.type === 'warehouse' ? 'Caixote industrial' : 'Caixote pesado', area:s.name });
      }
    }
  }

  backDoor(b, name = 'Porta dos fundos', locked = false) {
    if (b.backDoorX == null) return null;
    return this.addDoor(b.backDoorX, b.groundY - 1, { name, locked, forceTool: 'crowbar', integrity: 3 });
  }

  // Residential finishes: every room type gets its own wall and floor.
  homeSkins(wall = TILE.WALLPAPER) {
    // each home picks its own palette: wallpaper colour and carpet
    const salt = this.cur ? this.cur.x * 7 + this.cur.rooms.length : 1;
    if (wall === TILE.WALLPAPER) wall = [TILE.WALLPAPER, TILE.WALLPAPER_WARM, TILE.WALLPAPER_BLUE][Math.floor(this.rand(salt) * 3)];
    const carpet = this.rand(salt + 5) < 0.5 ? TILE.CARPET : TILE.CARPET_BLUE;
    const second = [TILE.WALLPAPER_WARM, TILE.WALLPAPER_BLUE, TILE.WALLPAPER][Math.floor(this.rand(salt + 9) * 3)];
    return {
      living: [wall], dining: [wall], hall: [TILE.PLASTER], lobby: [TILE.PLASTER, TILE.LINOLEUM],
      bedroom: [second, carpet], kids: [TILE.PEELING_WALL, carpet],
      kitchen: [TILE.WALL_TILE, TILE.LINOLEUM], bath: [TILE.WALL_TILE, TILE.LINOLEUM],
      laundry: [TILE.PLASTER, TILE.LINOLEUM], storage: [TILE.OLD_CONCRETE], attic: [TILE.OLD_WOOD],
      office: [TILE.PLASTER, TILE.CARPET_BLUE], motel_room: [wall, carpet], reception: [TILE.PLASTER, TILE.LINOLEUM],
      maintenance: [TILE.OLD_CONCRETE, TILE.CONCRETE], mechanical: [TILE.OLD_CONCRETE, TILE.CONCRETE]
    };
  }

  // Attic under a gable roof: a ladder through the ceiling and whatever the
  // family stored up there.
  attic(b, name) {
    const cols = [];
    for (let x = b.x + 1; x < b.x + b.width - 1; x++) {
      if (this.world.get(x, b.topCeil - 1) === TILE.AIR && this.world.get(x, b.topCeil - 2) === TILE.AIR) cols.push(x);
    }
    if (cols.length < 3) return false;
    const top = b.levels[b.levels.length - 1];
    const lx = cols[0];
    for (let ty = b.topCeil; ty <= top.floorY - 1; ty++) this.world.set(lx, ty, TILE.LADDER);
    for (let i = 1; i < cols.length; i++) this.world.setWall(cols[i], b.topCeil - 1, TILE.OLD_WOOD);
    this.floorProp(this.rand(lx) > 0.5 ? 'suitcases' : 'cardboard_box', cols[1], b.topCeil, { scale: 0.9 });
    if (cols[2]) this.floorProp('box_open', cols[2], b.topCeil, { scale: 0.85 });
    this.addContainer(name || 'Sótão', cols[Math.min(cols.length - 1, 2)], b.topCeil - 1, 'household', this.loot('household', lx * 7, 3));
    return true;
  }

  // Wooden fire-lookout / hose tower: legs, ladder, a cabin on top.
  tower(x, groundY, h, opts = {}) {
    const w = this.world;
    const top = groundY - h;
    // legs stand behind the play plane so the tower never walls off the road
    for (let y = top; y < groundY; y++) {
      if (w.get(x, y) === TILE.AIR) w.setWall(x, y, opts.leg || TILE.WOOD);
      if (w.get(x + 4, y) === TILE.AIR) w.setWall(x + 4, y, opts.leg || TILE.WOOD);
      if ((groundY - y) % 5 === 0) for (let tx = x + 1; tx <= x + 3; tx++) if (w.get(tx, y) === TILE.AIR) w.setWall(tx, y, opts.leg || TILE.WOOD);
      w.set(x + 2, y, TILE.LADDER);
    }
    for (let tx = x - 1; tx <= x + 5; tx++) w.set(tx, top, opts.deck || TILE.FLOOR_WOOD);
    w.set(x + 2, top, TILE.LADDER);
    for (let y = top - 4; y < top; y++) {
      w.setWall(x, y, opts.wall || TILE.PLANK);
      for (let tx = x; tx <= x + 4; tx++) w.setWall(tx, y, opts.wall || TILE.PLANK);
    }
    for (const tx of [x - 1, x + 5]) { w.set(tx, top - 1, opts.rail || TILE.PAINTED_WOOD); w.set(tx, top - 4, opts.rail || TILE.PAINTED_WOOD); }
    for (let tx = x - 2; tx <= x + 6; tx++) w.set(tx, top - 5, opts.roof || TILE.ROOF_METAL);
    return top;
  }

  /* --- forest ---------------------------------------------------------- */

  makeForestCamp(x) {
    this.plan('camp', x);
    const groundY = this.lotY(x, 14);
    this.levelGround(x - 2, x + 14, groundY, TILE.DIRT, TILE.DIRT);
    for (const tx of [x - 1, x + 13, x + 14]) this.world.set(tx, groundY, TILE.LEAF_LITTER);
    this.addProp('fallen_log', x + 2, groundY - 1, { scale: 0.9 });
    this.addProp('fallen_log', x + 9, groundY - 1, { scale: 0.85, flip: true });
    this.addProp('stump', x + 6, groundY - 1, { scale: 0.8 });
    this.addProp('barrel', x + 12, groundY - 1, { scale: 0.8 });
    this.addContainer('Mochila esquecida', x + 5, groundY - 2, 'camp', this.loot('camp', x, 3));
    this.addContainer('Caixa do acampamento', x + 11, groundY - 2, 'camp', this.loot('camp', x + 7, 3));
    // a fire ring that can be relit
    this.addPoint('firepit', x + 7, groundY - 1, { name: 'Fogueira apagada', state: 'cold' });
    // Stage 20: the camp people left in a hurry
    this.addProp('tent', x - 1, groundY - 1, { scale: 1, behind: true, anim: 'sway' });
    this.addProp('woodpile', x + 10, groundY - 1, { scale: 0.9, behind: true });
    this.addProp('lawn_chair', x + 8, groundY - 1, { scale: 1, flip: true });
    this.addProp('washing_line', x + 3, groundY - 3, { scale: 0.9, behind: true, anim: 'sway' });
    this.addProp('lantern', x + 4, groundY - 1, { scale: 1 });
    this.lamp((x + 4.5) * CONFIG.TILE, (groundY - 0.7) * CONFIG.TILE, { radius: 160, strength: 0.75, mode: 'night', flicker: 0.2, fixture: 'lantern' });
    if (this.cur.state === 'looted') { this.addProp('papers', x + 6, groundY - 1, { scale: 1 }); this.addProp('box_open', x + 12, groundY - 1, { scale: 0.9 }); }
    else this.addProp('bedroll', x + 1, groundY - 1, { scale: 1 });
    this.register('Acampamento na Mata', 'camp', x, 14, groundY, 'rural');
  }

  // A car that left the trail and hit the trees — the first story the county tells.
  makeTrailhead(x) {
    this.plan('wreck', x);
    // the car took these trees down on its way off the trail
    for (let tx = x + 1; tx <= x + 9; tx++) {
      for (let y = 0; y < this.world.surface[tx]; y++) {
        const t = this.world.get(tx, y);
        if (t === TILE.WOOD || t === TILE.DARK_WOOD || t === TILE.LEAF || t === TILE.VINE || t === TILE.RUBBLE) this.world.set(tx, y, TILE.AIR);
      }
    }
    const g = tx => this.world.groundY(tx);
    this.addGroundProp('road_sign', x, { scale: 0.9 });
    this.addGroundProp('wrecked_car', x + 2, { scale: 1, tilt: 0.06 });
    this.addGroundProp('suitcases', x + 6, { scale: 1 });
    this.addGroundProp('papers', x + 7, { scale: 1 });
    this.addGroundProp('clothes_pile', x + 8, { scale: 1 });
    this.addGroundProp('boulder', x + 9, { scale: 1 });
    this.addGroundProp('fern', x + 5, { scale: 1 });
    this.addGroundProp('deer_stand', x + 12, { scale: 1, behind: true });
    this.addContainer('Porta-malas amassado', x + 3, g(x + 3) - 2, 'garage', this.loot('garage', x * 3, 3));
    this.addContainer('Mochila rasgada', x + 7, g(x + 7) - 1, 'camp', this.loot('camp', x * 5, 2));
    this.emitter('smoke', (x + 4) * CONFIG.TILE, (g(x + 4) - 1.2) * CONFIG.TILE, { rate: 0.35 });
    this.register('Trilha do Cervo', 'wreck', x, 14, g(x + 6), 'rural');
  }

  makeCabin(x, name) {
    this.plan('cabin', x);
    const width = 12;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 3, x + width + 3, groundY, TILE.DIRT, TILE.WET_DIRT);
    const b = this.construct({
      x: x + 1, width: 10, groundY, floors: 1, floorHeight: 5,
      material: TILE.WOOD, floorTile: TILE.FLOOR_WOOD, backWall: TILE.PLANK,
      roof: 'gable', roofTile: TILE.ROOF_SHINGLE, doorAt: 2, salt: x, backDoor: true
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Porta da cabana', locked: this.chance(x * 3, 0.5) });
    this.backDoor(b, 'Porta dos fundos da cabana');
    // a cellar with the good stuff
    const cellar = this.basement(x + 2, 8, groundY, { depth: 5, wall: TILE.STONE, backWall: TILE.PLANK, shaftAt: 1 });
    this.addContainer('Porão da cabana', cellar.x + 5, cellar.floorY - 1, 'tools', this.loot('tools', x + 5, 4, { guaranteed: true }), { rare: true });
    this.addContainer('Armário', x + 6, groundY - 2, 'household', this.loot('household', x + 3, 3));
    this.addProp('lamp_post', x - 2, groundY - 1, { scale: 0.8 });
    // Stage 20 interior
    this.dressBuilding(b, [['cabin']], { skin: [TILE.OLD_WOOD] });
    this.lightRoom(b.rooms[0][0], 'lantern');
    this.furnish({ x0: cellar.x + 1, x1: cellar.x + cellar.width - 2, floorY: cellar.bottom, ceilY: cellar.top - 1 }, 'cellar');
    this.addProp('woodpile', x + 11, groundY - 1, { scale: 1, behind: true });
    this.addProp('outhouse', x + 13, groundY - 1, { scale: 1, behind: true });
    this.addProp('stump', x - 1, groundY - 1, { scale: 0.9 });
    if (this.cur.state === 'barricaded' || this.cur.state === 'intact') this.emitter('smoke', (x + 6) * CONFIG.TILE, (b.topCeil - 4) * CONFIG.TILE, { rate: 0.8 });
    if (this.chance(x * 41, 0.4)) this.secretRoom(cellar.x + cellar.width, cellar.x + cellar.width + 2, cellar.bottom, 3,
      { sealSide: 'left', seal: TILE.PLANK, wall: TILE.STONE, backWall: TILE.PLANK, label: 'Adega escondida', props: ['barrel', 'water_jugs'] });
    else this.hookSecret('cellar_stash', cellar.x + cellar.width, cellar.bottom);
    this.register(name, 'cabin', x, width, groundY, 'rural');
  }

  // Ranger post with a fire lookout: the first building you see from spawn.
  makeRangerStation(x) {
    this.plan('ranger', x);
    const width = 17;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 1, x + width, groundY, TILE.DIRT, TILE.WET_DIRT);
    const b = this.construct({
      x: x + 1, width: 10, groundY, floors: 2, floorHeight: 5,
      material: TILE.OLD_WOOD, floorTile: TILE.FLOOR_WOOD, backWall: TILE.PLANK,
      roof: 'gable', roofTile: TILE.ROOF_METAL, doorAt: 1, partitions: [5], ladderAt: 8, salt: x, backDoor: true
    });
    this.backDoor(b);
    this.addDoor(b.doorX, groundY - 1, { name: 'Posto florestal', locked: this.chance(x * 5, 0.35), forceTool: 'crowbar' });
    this.dressBuilding(b, [['office', 'storage'], ['dorm', 'empty']], { skin: [TILE.PLANK], lights: 'bulb' });
    this.floorProp('radio', x + 3, groundY, { scale: 1, offsetY: -12 });
    this.addContainer('Armário do guarda', x + 7, groundY - 2, 'camp', this.loot('camp', x * 11, 3));
    this.addContainer('Beliche', x + 4, groundY - 8, 'household', this.loot('household', x * 13, 2));
    const top = this.tower(x + 12, groundY, 13);
    this.addContainer('Cabine da torre', x + 15, top - 1, 'camp', this.loot('camp', x * 17, 4, { guaranteed: true }), { rare: true });
    this.floorProp('radio', x + 13, top, { scale: 1 });
    this.lamp((x + 14.5) * CONFIG.TILE, (top - 2) * CONFIG.TILE, { radius: 190, strength: 0.7, mode: 'night', flicker: 0.1, fixture: 'lantern' });
    this.addProp('flag_pole', x - 1, groundY - 1, { scale: 1, anim: 'sway' });
    this.addProp('woodpile', x + 11, groundY - 1, { scale: 0.9, behind: true });
    this.addProp('warning_sign', x + 17, groundY - 1, { scale: 0.9 });
    this.register('Posto Florestal Harlow', 'ranger', x, width, groundY, 'rural');
  }

  /* --- farm ------------------------------------------------------------ */

  makeFarm(x) {
    this.plan('farm', x);
    const width = 46;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 3, x + width + 3, groundY, TILE.DEAD_GRASS, TILE.DIRT);

    const hx = x + 2, hw = 12;
    const house = this.construct({
      x: hx, width: hw, groundY, floors: 2, floorHeight: 5,
      material: TILE.PAINTED_WOOD, floorTile: TILE.FLOOR_WOOD, backWall: TILE.PLANK,
      roof: 'gable', roofTile: TILE.ROOF_SHINGLE, doorAt: 3, partitions: [7], salt: x, ladderAt: 9, backDoor: true
    });
    this.porch(hx + hw, 4, groundY, x * 3);
    this.backDoor(house, 'Porta da varanda');
    this.addDoor(house.doorX, groundY - 1, { name: 'Porta da fazenda' });

    const cellar = this.basement(hx + 1, 9, groundY, { depth: 6, wall: TILE.STONE, backWall: TILE.BRICK, shaftAt: 7 });
    this.addContainer('Despensa do porão', cellar.x + 3, cellar.floorY - 1, 'kitchen', this.loot('kitchen', x + 40, 4, { guaranteed: true }));
    this.addContainer('Conservas', cellar.x + 6, cellar.floorY - 1, 'farm', this.loot('farm', x + 41, 4));

    const bx = x + 24, bw = 16;
    this.construct({
      x: bx, width: bw, groundY, floors: 1, floorHeight: 10,
      material: TILE.WOOD, floorTile: TILE.DIRT, backWall: TILE.PLANK,
      roof: 'gable', roofTile: TILE.ROOF_METAL, doorAt: 2, windows: false, eaves: 2, salt: x * 5, backDoor: true
    });
    // big barn doors in the west wall
    for (let ty = groundY - 1; ty >= groundY - 4; ty--) this.world.set(bx, ty, TILE.AIR);
    // hay loft reached by ladder
    for (let tx = bx + 8; tx < bx + bw - 1; tx++) this.world.set(tx, groundY - 6, TILE.FLOOR_WOOD);
    for (let ty = groundY - 6; ty <= groundY - 1; ty++) this.world.set(bx + 7, ty, TILE.LADDER);
    this.world.set(bx + 8, groundY - 6, TILE.AIR);

    this.fenceLine(x - 2, x + 22, groundY - 1, [house.doorX - 1, house.doorX, house.doorX + 1, x + 14, x + 15]);
    this.fenceLine(x + 42, x + width + 2, groundY - 1);

    this.addContainer('Armário da cozinha', hx + 5, groundY - 2, 'kitchen', this.loot('kitchen', x + 1, 4));
    this.addContainer('Quarto do casal', hx + 6, groundY - 8, 'household', this.loot('household', x + 9, 3));
    this.addContainer('Baú de ferramentas', bx + 6, groundY - 2, 'tools', this.loot('tools', x + 2, 4));
    this.addContainer('Depósito do celeiro', bx + 11, groundY - 7, 'farm', this.loot('farm', x + 11, 4), { rare: true });

    this.addProp('silo', x + 44, groundY - 1, { scale: 1 });
    this.addProp('tractor_wreck', x + 18, groundY - 1, { scale: 0.95 });
    this.addProp('hay_bale', bx - 3, groundY - 1, { scale: 0.9 });
    this.addProp('hay_bale', bx - 6, groundY - 1, { scale: 0.8, flip: true });
    this.addProp('hay_bale', bx + 10, groundY - 7, { scale: 0.7 });
    this.addProp('crop_row', x + 6, groundY - 1, { scale: 1, offsetX: 120 });
    this.addProp('crop_row', x + 11, groundY - 1, { scale: 1, offsetX: 120 });
    this.addProp('well', x + 22, groundY - 1, { scale: 0.85 });
    this.addProp('water_trough', bx - 8, groundY - 1, { scale: 0.85 });
    this.addProp('mailbox', x - 1, groundY - 1, { scale: 0.85 });
    this.addProp('washing_line', hx + 13, groundY - 5, { scale: 0.8, anim: 'sway' });
    this.addProp('pallet', bx + 4, groundY - 1, { scale: 0.8 });
    this.addProp('barrel', bx + 13, groundY - 1, { scale: 0.85 });

    // Stage 20: a lived-in farmhouse, a working barn
    this.attic(house, 'Sótão da fazenda');
    this.dressBuilding(house, [['living', 'kitchen'], ['bedroom', 'bath|kids']], { skins: this.homeSkins(TILE.WALLPAPER), lights: 'bulb' });
    this.furnish({ x0: bx + 1, x1: bx + 6, floorY: groundY, ceilY: groundY - 11 }, 'barn');
    this.furnish({ x0: bx + 8, x1: bx + 14, floorY: groundY, ceilY: groundY - 6 }, 'workshop', { state: 'looted' });
    this.furnish({ x0: cellar.x + 1, x1: cellar.x + cellar.width - 2, floorY: cellar.bottom, ceilY: cellar.top - 1 }, 'cellar');
    this.lightRoom({ x0: bx + 2, x1: bx + 6, floorY: groundY, ceilY: groundY - 7 }, 'lantern');
    this.addProp('pickup_truck', x + 40, groundY - 1, { scale: 1, behind: true });
    this.addProp('scarecrow', x + 12, groundY - 1, { scale: 1, anim: 'sway' });
    this.addProp('feed_sacks', bx - 2, groundY - 1, { scale: 1 });
    this.addProp('bbq_grill', hx + hw + 4, groundY - 1, { scale: 1 });
    this.emitter('flies', (bx + 3) * CONFIG.TILE, (groundY - 1) * CONFIG.TILE);
    this.register('Fazenda Harlow', 'farm', x, width, groundY, 'rural');
  }

  // The farm's fields, windmill and outbuildings along the dirt track.
  makeFarmAnnex(x) {
    this.plan('farm_annex', x);
    const width = 28;
    const groundY = this.lotY(x, width);
    this.levelGround(x, x + width, groundY, TILE.GRASS, TILE.DIRT);
    // ploughed field with crop rows, fenced at both ends
    for (let tx = x + 1; tx <= x + 14; tx++) this.world.set(tx, groundY, tx % 3 === 0 ? TILE.WET_DIRT : TILE.DIRT);
    for (let tx = x + 1; tx <= x + 13; tx += 3) this.addProp('crop_row', tx, groundY - 1, { scale: 1, behind: true, anim: 'sway' });
    this.addProp('scarecrow', x + 7, groundY - 1, { scale: 1, anim: 'sway' });
    for (const tx of [x, x + 15]) for (let h = 1; h <= 2; h++) this.world.set(tx, groundY - h, TILE.FENCE);
    for (let tx = x + 16; tx <= x + 23; tx++) this.world.set(tx, groundY, TILE.DRY_DIRT);
    this.addProp('windmill', x + 16, groundY - 1, { scale: 1, behind: true });
    this.addProp('water_trough', x + 18, groundY - 1, { scale: 0.9 });
    this.addProp('chicken_coop', x + 20, groundY - 1, { scale: 1, behind: true });
    this.addProp('wheelbarrow', x + 19, groundY - 1, { scale: 1 });
    const shed = this.construct({
      x: x + 23, width: 5, groundY, floors: 1, floorHeight: 4,
      material: TILE.OLD_WOOD, floorTile: TILE.DIRT, backWall: TILE.PLANK,
      roof: 'shed', roofTile: TILE.SHEET_METAL, doorAt: 0, windows: false, salt: x
    });
    this.addDoor(shed.doorX, groundY - 1, { name: 'Galpão de ferramentas', locked: this.chance(x * 7, 0.5) });
    this.furnish(shed.rooms[0][0], 'storage');
    this.addContainer('Galpão de ferramentas', x + 25, groundY - 2, 'tools', this.loot('tools', x * 9, 3));
    this.emitter('flies', (x + 21) * CONFIG.TILE, (groundY - 1) * CONFIG.TILE);
    this.register('Lavoura Harlow', 'farm_annex', x, width, groundY, 'rural');
  }

  makeTrailer(x) {
    this.plan('trailer', x);
    const width = 12;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.GRAVEL, TILE.DIRT);
    const b = this.construct({
      x: x + 1, width: 10, groundY, floors: 1, floorHeight: 4,
      material: TILE.RUST_METAL, floorTile: TILE.FLOOR_WOOD, backWall: TILE.WALL_PANEL,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 8, salt: x, backDoor: true
    });
    this.addBarricade(b.doorX, groundY - 1, { name: 'Porta emperrada' });
    this.backDoor(b, 'Porta traseira do trailer');
    this.addContainer('Trailer — armário', x + 4, groundY - 2, 'household', this.loot('household', x, 3));
    this.addProp('trash_can', x + 12, groundY - 1, { scale: 0.8 });
    // Stage 20
    this.furnish(b.rooms[0][0], 'bedroom|living', { scale: 0.95 });
    this.skinRoom(b.rooms[0][0], TILE.PEELING_WALL, TILE.LINOLEUM);
    this.dressWindows(b, 'home');
    this.addProp('lawn_chair', x - 1, groundY - 1, { scale: 1 });
    this.addProp('bbq_grill', x - 2, groundY - 1, { scale: 1 });
    this.addProp('satellite_dish', x + 2, b.topCeil - 2, { scale: 0.9, behind: true });
    this.register('Trailer da Estrada', 'trailer', x, width, groundY, 'roadside');
  }

  makeCamper(x) {
    this.plan('trailer', x);
    const width = 11;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 1, x + width, groundY, TILE.GRAVEL, TILE.DIRT);
    const b = this.construct({
      x: x + 1, width: 8, groundY, floors: 1, floorHeight: 4,
      material: TILE.SHEET_METAL, floorTile: TILE.FLOOR_WOOD, backWall: TILE.WALL_PANEL,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 0, salt: x, backDoor: true
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Trailer do parque', locked: this.chance(x, 0.4) });
    this.backDoor(b, 'Porta traseira do trailer');
    this.skinRoom(b.rooms[0][0], TILE.WALLPAPER, TILE.CARPET);
    if (this.cur.state === 'barricaded') {
      this.story('holdout', x + 2, groundY);
      this.addContainer('Estoque improvisado', x + 6, groundY - 2, 'holdout', this.loot('holdout', x * 3, 4, { guaranteed: true }), { rare: true });
    } else {
      this.furnish(b.rooms[0][0], 'kitchen|bedroom', { scale: 0.95 });
      this.addContainer('Armário do trailer', x + 5, groundY - 2, 'household', this.loot('household', x * 3, 3));
    }
    this.addProp('awning', x + 1, groundY - 4, { scale: 1, behind: true });
    this.addProp('tent', x + 9, groundY - 1, { scale: 0.9, behind: true });
    this.register('Trailer do Parque', 'trailer', x, width, groundY, 'roadside');
  }

  makeChapel(x) {
    this.plan('chapel', x);
    const width = 16;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.DEAD_GRASS, TILE.DIRT);
    const b = this.construct({
      x: x + 2, width: 12, groundY, floors: 1, floorHeight: 8,
      material: TILE.PAINTED_WOOD, floorTile: TILE.FLOOR_WOOD, backWall: TILE.PLANK,
      roof: 'gable', roofTile: TILE.ROOF_SHINGLE, doorAt: 6, partitions: [3], salt: x, eaves: 2, backDoor: true
    });
    this.backDoor(b, 'Porta da sacristia');
    // steeple
    for (let ty = b.topCeil - 5; ty < b.topCeil - 1; ty++) this.world.set(x + 8, ty, TILE.PAINTED_WOOD);
    this.addDoor(b.doorX, groundY - 1, { name: 'Porta da capela', locked: true, forceTool: 'crowbar' });
    this.addContainer('Sacristia', x + 4, groundY - 2, 'household', this.loot('household', x + 5, 3));
    this.addContainer('Caixa de doações', x + 11, groundY - 2, 'scraps', this.loot('scraps', x + 6, 2), { rare: true });
    this.addProp('picnic_table', x + 15, groundY - 1, { scale: 0.75 });
    // Stage 20: nave, altar, sacristy and a cellar under the floor
    const [sacristy, nave] = b.rooms[0];
    this.skinRoom(sacristy, TILE.PLASTER);
    this.skinRoom(nave, TILE.PLASTER);
    this.floorProp('bookshelf', sacristy.x0, groundY, { scale: 0.95 });
    this.floorProp('altar', nave.x0, groundY, { scale: 1 });
    const pews = this.cur.state === 'barricaded' ? ['furniture_pile', 'bedroll', 'bedroll'] : this.cur.state === 'damaged' ? ['pew', 'broken_furniture', 'rubble_pile'] : ['pew', 'pew'];
    pews.forEach((p, i) => this.floorProp(p, nave.x0 + 2 + i * 2, groundY, { scale: 1 }));
    for (const tx of [nave.x0, nave.x0 + 1]) this.lamp((tx + 0.5) * CONFIG.TILE, (groundY - 1.6) * CONFIG.TILE, { radius: 120, strength: 0.55, mode: 'always', flicker: 0.3, fixture: 'candle' });
    this.wallProp('picture_frame', nave.x0 + 4, groundY, 110, { scale: 1.3 });
    const cellar = this.basement(x + 3, 10, groundY, { depth: 5, wall: TILE.STONE, backWall: TILE.OLD_BRICK, shaftAt: 1 });
    this.furnish({ x0: cellar.x + 2, x1: cellar.x + cellar.width - 2, floorY: cellar.bottom, ceilY: cellar.top - 1 }, 'storage');
    this.addContainer('Porão da capela', cellar.x + 6, cellar.floorY - 1, 'household', this.loot('household', x * 7, 3));
    if (this.chance(x * 43, 0.45)) this.secretRoom(cellar.x + cellar.width, cellar.x + cellar.width + 2, cellar.bottom, 3,
      { sealSide: 'left', seal: TILE.OLD_BRICK, wall: TILE.STONE, label: 'Cripta', props: ['candles', 'cardboard_box'], table: 'holdout' });
    else this.hookSecret('crypt', cellar.x + cellar.width, cellar.bottom);
    this.register('Capela da Estrada', 'chapel', x, width, groundY, 'civic');
  }

  makeCemetery(x) {
    this.plan('cemetery', x);
    const width = 18;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 1, x + width, groundY, TILE.DEAD_GRASS, TILE.DIRT);
    for (const tx of [x, x + width - 1]) for (let h = 1; h <= 2; h++) this.world.set(tx, groundY - h, TILE.CHAIN_FENCE);
    for (let i = 0; i < 6; i++) {
      const tx = x + 2 + i * 2;
      if (i === 4) continue;
      this.addProp(this.rand(tx * 3) > 0.4 ? 'gravestone' : 'grave_cross', tx, groundY - 1,
        { scale: 0.9 + this.rand(tx) * 0.25, tilt: (this.rand(tx * 5) - 0.5) * 0.25, behind: true });
    }
    // a fresh grave, still open
    this.world.set(x + 10, groundY, TILE.MUD);
    this.addProp('wheelbarrow', x + 11, groundY - 1, { scale: 1 });
    this.addProp('candles', x + 10, groundY - 1, { scale: 1 });
    this.addProp('dead_tree', x + 13, groundY - 1, { scale: 1, behind: true });
    this.addProp('wildflowers', x + 3, groundY - 1, { scale: 1 });
    const tomb = this.construct({
      x: x + 14, width: 4, groundY, floors: 1, floorHeight: 4,
      material: TILE.OLD_CONCRETE, floorTile: TILE.OLD_CONCRETE, backWall: TILE.OLD_CONCRETE,
      roof: 'gable', roofTile: TILE.ROOF_SHINGLE, doorAt: 0, windows: false, salt: x
    });
    this.addDoor(tomb.doorX, groundY - 1, { name: 'Jazigo da família Harlow', locked: true, forceTool: 'crowbar', integrity: 4 });
    this.addContainer('Jazigo', x + 16, groundY - 1, 'holdout', this.loot('holdout', x * 11, 3), { rare: true });
    this.register('Cemitério da Capela', 'cemetery', x, width, groundY, 'rural');
  }

  /* --- crossing -------------------------------------------------------- */

  makeGasStation(x) {
    this.plan('gas_station', x);
    const width = 30;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.CRACKED_ASPHALT, TILE.GRAVEL);

    const sx = x + 1, sw = 12;
    const shop = this.construct({
      x: sx, width: sw, groundY, floors: 1, floorHeight: 6,
      material: TILE.WALL_PANEL, floorTile: TILE.CERAMIC, backWall: TILE.WALL_PANEL,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 2, partitions: [8], salt: x
    });
    for (let tx = sx + 2; tx <= sx + 6; tx++) this.world.set(tx, groundY - 4, TILE.GLASS);
    this.addDoor(shop.doorX, groundY - 1, { name: 'Loja do posto' });

    const canopyY = groundY - 7;
    for (let tx = x + 15; tx <= x + 26; tx++) {
      this.world.set(tx, canopyY, TILE.ROOF_METAL);
      this.world.set(tx, canopyY + 1, TILE.WALL_PANEL);
    }
    for (let y = canopyY + 2; y < groundY; y++) {
      this.world.setWall(x + 16, y, TILE.METAL);
      this.world.setWall(x + 25, y, TILE.METAL);
    }

    // fuel store room behind a locked door — a real reason to find a crowbar
    this.addDoor(sx + 8, groundY - 1, { name: 'Depósito de combustível', locked: true, keyItem: null, forceTool: 'crowbar', integrity: 4 });
    this.addContainer('Caixa do posto', sx + 3, groundY - 2, 'gas', this.loot('gas', x + 11, 4));
    this.addContainer('Estoque dos fundos', sx + 10, groundY - 2, 'gas', this.loot('gas', x + 12, 5, { guaranteed: true }), { rare: true });

    this.addPoint('fuel_pump', x + 18, groundY - 1, { name: 'Bomba de combustível', state: 'off', needsPower: true });

    this.addProp('gas_pump', x + 18, groundY - 1, { scale: 0.95 });
    this.addProp('gas_pump', x + 23, groundY - 1, { scale: 0.95, flip: true });
    this.addProp('air_pump', x + 28, groundY - 1, { scale: 0.85 });
    this.addProp('gas_sign', x + 13, groundY - 1, { scale: 1 });
    this.addProp('wrecked_car', x + 20, groundY - 1, { scale: 0.9, flip: true });
    this.addProp('oil_drum', x + 14, groundY - 1, { scale: 0.9 });
    this.addProp('tire_pile', x + 29, groundY - 1, { scale: 0.75 });
    // Stage 20: a real shop floor, canopy lights, the forecourt
    this.dressBuilding(shop, [['gas_shop', 'storage']], { skin: [TILE.WALL_TILE, TILE.CHECKER_FLOOR], lights: 'fluoro', windows: false });
    for (const tx of [x + 18, x + 23]) {
      this.ceilProp('fluoro_lamp', tx, canopyY + 1, groundY, { scale: 1 });
      this.lamp((tx + 0.5) * CONFIG.TILE, (canopyY + 2.4) * CONFIG.TILE, { radius: 230, strength: 0.9, color: 'cold', mode: 'power', fixture: 'tube' });
    }
    this.addProp('freezer', x - 1, groundY - 1, { scale: 0.9, behind: true });
    this.addProp('trash_bags', x + 27, groundY - 1, { scale: 1 });
    this.addProp('traffic_cone', x + 21, groundY - 1, { scale: 0.9 });
    this.addProp('pickup_truck', x + 25, groundY - 1, { scale: 1, behind: true, tint: '#4a5a6a' });
    this.roofDress(shop, ['ac_unit', 'roof_vent']);
    this.register('Posto Route 17', 'gas_station', x, width, groundY, 'roadside');
  }

  makeDiner(x) {
    this.plan('diner', x);
    const width = 16;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.CRACKED_ASPHALT, TILE.GRAVEL);
    const b = this.construct({
      x: x + 1, width: 14, groundY, floors: 1, floorHeight: 6,
      material: TILE.PAINTED_WOOD, floorTile: TILE.CERAMIC, backWall: TILE.CERAMIC,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 3, partitions: [10], salt: x, backDoor: true
    });
    for (let tx = x + 4; tx <= x + 8; tx++) this.world.set(tx, groundY - 4, TILE.GLASS);
    this.addDoor(b.doorX, groundY - 1, { name: 'Entrada do restaurante' });
    this.backDoor(b, 'Porta da cozinha');
    this.addContainer('Cozinha do restaurante', x + 12, groundY - 2, 'kitchen', this.loot('kitchen', x + 3, 5, { guaranteed: true }));
    this.addContainer('Balcão', x + 6, groundY - 2, 'market', this.loot('market', x + 4, 3));
    this.addProp('neon_sign', x + 8, groundY - 7, { scale: 0.85 });
    // Stage 20
    this.dressBuilding(b, [['diner', 'diner_kitchen']], {
      skins: { diner: [TILE.WALL_TILE, TILE.CHECKER_FLOOR], diner_kitchen: [TILE.WALL_TILE, TILE.LINOLEUM] }, lights: 'fluoro', windows: false
    });
    this.lamp((x + 9) * CONFIG.TILE, (groundY - 6.6) * CONFIG.TILE, { radius: 150, strength: 0.7, color: 'red', mode: 'power', flicker: 0.6, fixture: 'neon' });
    this.addProp('dumpster', x + 15, groundY - 1, { scale: 0.85 });
    this.addProp('trash_bags', x - 1, groundY - 1, { scale: 1 });
    this.emitter('flies', (x + 15.5) * CONFIG.TILE, (groundY - 1) * CONFIG.TILE);
    this.emitter('steam', (x + 13) * CONFIG.TILE, (b.topCeil - 2) * CONFIG.TILE, { rate: 0.3 });
    this.roofDress(b, ['vent_fan', 'ac_unit']);
    this.register('Lanchonete Route 17', 'diner', x, width, groundY, 'commercial');
  }

  /* --- neighbourhood --------------------------------------------------- */

  makeSuburb(x) {
    this.plan('suburb', x);
    const width = 58;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.DEAD_GRASS, TILE.DIRT);

    const homes = [
      { o: 0, m: TILE.PAINTED_WOOD, r: TILE.ROOF_SHINGLE, roof: 'gable', floors: 2, cellar: true, wall: TILE.WALLPAPER },
      { o: 16, m: TILE.BRICK, r: TILE.ROOF_SHINGLE, roof: 'gable', floors: 1, cellar: false, wall: TILE.PEELING_WALL },
      { o: 32, m: TILE.WALL_PANEL, r: TILE.ROOF_METAL, roof: 'shed', floors: 2, cellar: false, wall: TILE.PLASTER },
      { o: 46, m: TILE.OLD_BRICK, r: TILE.ROOF_SHINGLE, roof: 'gable', floors: 1, cellar: true, wall: TILE.WALLPAPER }
    ];
    const layouts = [
      [['living', 'kitchen'], ['bedroom', 'bath']],
      [['living|dining', 'kitchen|bath']],
      [['dining', 'laundry|kitchen'], ['kids', 'bedroom']],
      [['bedroom|living', 'kitchen']]
    ];
    const stories = ['fled', 'last_meal', 'holdout'];
    const storyHome = Math.floor(this.rand(x * 71) * homes.length);

    homes.forEach((h, i) => {
      const hx = x + h.o, hw = 11;
      const b = this.construct({
        x: hx, width: hw, groundY, floors: h.floors, floorHeight: 5,
        material: h.m, floorTile: TILE.FLOOR_WOOD, backWall: h.m,
        roof: h.roof, roofTile: h.r, doorAt: i % 2 ? 2 : 8, partitions: [6], salt: x + i * 37, ladderAt: 4, backDoor: true
      });
      this.backDoor(b, `Casa ${i + 1} — fundos`, this.rand(x + i * 3) < 0.25);
      if (i === 1) this.porch(hx + hw, 3, groundY, x + i);

      // half the doors are locked or boarded: bring a tool or find the key
      if (i % 2 === 0) this.addDoor(b.doorX, groundY - 1, { name: `Casa ${i + 1}`, locked: true, forceTool: 'crowbar' });
      else this.addBarricade(b.doorX, groundY - 1, { name: `Casa ${i + 1} — tapume` });

      this.addContainer(`Casa ${i + 1} — armário`, hx + 5, groundY - 2, 'household', this.loot('household', x + 40 + i, 3));
      if (h.floors > 1) this.addContainer(`Casa ${i + 1} — quarto`, hx + 4, groundY - 8, 'household', this.loot('household', x + 60 + i, 2));
      let cellar = null;
      if (h.cellar) {
        cellar = this.basement(hx + 1, 9, groundY, { depth: 5, shaftAt: 7, backWall: TILE.BRICK });
        this.addContainer(`Casa ${i + 1} — porão`, cellar.x + 4, cellar.floorY - 1, 'tools', this.loot('tools', x + 80 + i, 4, { guaranteed: true }), { rare: true });
        this.addProp('shelf', cellar.x + 2, cellar.floorY - 1, { scale: 0.7, behind: true });
      }
      this.addProp('mailbox', hx - 1, groundY - 1, { scale: 0.8 });
      this.fenceLine(hx - 1, hx + hw + 1, groundY - 1, [b.doorX - 1, b.doorX, b.doorX + 1]);

      // Stage 20: every home laid out differently
      if (h.roof === 'gable' && h.floors > 1) this.attic(b, `Casa ${i + 1} — sótão`);
      const plan = layouts[i].map(level => level.slice());
      if (i === storyHome) plan[0][0] = 'empty';
      this.dressBuilding(b, plan, { skins: this.homeSkins(h.wall) });
      if (i === storyHome) this.story(this.cur.state === 'barricaded' ? 'holdout' : stories[Math.floor(this.rand(x + i) * 2)], hx + 1, groundY);
      if (cellar) this.furnish({ x0: cellar.x + 3, x1: cellar.x + cellar.width - 2, floorY: cellar.bottom, ceilY: cellar.top - 1 }, 'laundry|storage');
      this.yard(hx + hw + (i === 0 ? 2 : 1), hx + hw + 5, groundY, x + i * 13);
      if (this.rand(hx) < 0.5) this.lamp((hx + 3) * CONFIG.TILE, (groundY - 2) * CONFIG.TILE, { radius: 150, strength: 0.7, mode: 'power', fixture: 'bulb' });
    });

    // back alley behind the row, reached from either end
    this.addProp('dumpster', x + 13, groundY - 1, { scale: 0.8 });
    this.addProp('street_bench', x + 29, groundY - 1, { scale: 0.85 });
    this.addProp('fire_hydrant', x + 43, groundY - 1, { scale: 0.85 });
    this.addProp('lamp_post', x + 14, groundY - 1, { scale: 0.9 });
    this.addProp('lamp_post', x + 44, groundY - 1, { scale: 0.9 });
    this.addProp('shopping_cart', x + 24, groundY - 1, { scale: 0.8, flip: true });
    this.addProp('swing_set', x + 28, groundY - 1, { scale: 0.8, anim: 'sway' });
    this.addProp('trash_bags', x + 12, groundY - 1, { scale: 1 });
    // storm drain: the back way under the county
    this.drainX = x + 11;
    this.register('Bairro Cedar Row', 'suburb', x, width, groundY, 'residential');
  }

  makeHouse(x) {
    this.plan('house', x);
    const width = 20;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.DEAD_GRASS, TILE.DIRT);

    const b = this.construct({
      x: x + 1, width: 13, groundY, floors: 2, floorHeight: 5,
      material: TILE.BRICK, floorTile: TILE.FLOOR_WOOD, backWall: TILE.BRICK,
      roof: 'gable', roofTile: TILE.ROOF_SHINGLE, doorAt: 3, partitions: [8], salt: x, ladderAt: 10
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Residência' });

    const gx = x + 14, gw = 6;
    const garage = this.construct({
      x: gx, width: gw, groundY, floors: 1, floorHeight: 4,
      material: TILE.PAINTED_WOOD, floorTile: TILE.CONCRETE, backWall: TILE.PAINTED_WOOD,
      roof: 'shed', roofTile: TILE.ROOF_METAL, doorAt: 5, windows: false, salt: x * 3
    });
    // garage shutter faces the street: needs power or a crowbar
    for (let ty = groundY - 1; ty >= groundY - 3; ty--) this.world.set(gx + gw - 1, ty, TILE.METAL);
    this.addPoint('shutter', gx + gw - 1, groundY - 1, {
      name: 'Portão da garagem', width: 1, height: 3, tile: TILE.METAL, needsPower: true, forceTool: 'crowbar', integrity: 6
    });
    // and a door straight through from the kitchen
    for (const tx of [x + 13, gx]) for (let ty = groundY - 1; ty >= groundY - 2; ty--) this.world.set(tx, ty, TILE.AIR);
    this.addDoor(gx, groundY - 1, { name: 'Porta da garagem', locked: this.chance(x * 9, 0.5) });
    this.addContainer('Bancada da garagem', gx + 3, groundY - 2, 'garage', this.loot('garage', x + 30, 4, { guaranteed: true }), { rare: true });

    this.fenceLine(x - 2, x + width + 2, groundY - 1, [b.doorX - 1, b.doorX, b.doorX + 1, gx + gw - 1, gx + gw, gx + gw + 1]);
    this.addContainer('Armário da sala', x + 6, groundY - 2, 'household', this.loot('household', x + 3, 4));
    this.addContainer('Quarto de cima', x + 6, groundY - 8, 'household', this.loot('household', x + 17, 3));
    // Stage 20
    this.attic(b, 'Sótão da residência');
    this.dressBuilding(b, [['living', 'kitchen'], ['bedroom', 'bath']], { skins: this.homeSkins(TILE.WALLPAPER), lights: 'bulb' });
    this.floorProp('car_frame', gx + 1, groundY, { scale: 0.95 });
    this.floorProp('engine_block', gx + 4, groundY, { scale: 0.8 });
    this.wallProp('picture_frame', gx + 2, groundY, 70, { scale: 0.8 });
    this.yard(x + width, x + width + 3, groundY, x * 5);
    this.register('Casa da Esquina', 'house', x, width, groundY, 'residential');
  }

  /* --- downtown -------------------------------------------------------- */

  makeMarket(x) {
    this.plan('market', x);
    const width = 24;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.CRACKED_ASPHALT, TILE.GRAVEL);

    const b = this.construct({
      x: x + 1, width: 20, groundY, floors: 1, floorHeight: 7,
      material: TILE.CRACKED_CONCRETE, floorTile: TILE.CERAMIC, backWall: TILE.CRACKED_CONCRETE,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 2, partitions: [13], salt: x
    });
    for (let tx = x + 3; tx <= x + 11; tx++) this.world.set(tx, groundY - 5, TILE.GLASS);
    this.addDoor(b.doorX, groundY - 1, { name: 'Mercado' });

    // stockroom behind a shutter in the partition
    this.addPoint('shutter', x + 14, groundY - 1, {
      name: 'Estoque do mercado', width: 1, height: 3, tile: TILE.METAL, needsPower: true, forceTool: 'crowbar', integrity: 5
    });
    for (let ty = groundY - 1; ty >= groundY - 3; ty--) this.world.set(x + 14, ty, TILE.METAL);
    // loading dock out the back
    this.addDoor(x + 20, groundY - 1, { name: 'Doca do mercado', locked: true, forceTool: 'crowbar', integrity: 5 });

    this.addContainer('Prateleira de mantimentos', x + 5, groundY - 2, 'market', this.loot('market', x + 5, 5));
    this.addContainer('Estoque dos fundos', x + 19, groundY - 2, 'market', this.loot('market', x + 6, 5, { guaranteed: true }), { rare: true });
    this.addProp('awning', x + 3, groundY - 6, { scale: 1 });
    this.addProp('dumpster', x + 23, groundY - 1, { scale: 0.8 });
    // Stage 20: aisles, checkout, stock, a manager's mezzanine
    this.dressBuilding(b, [['market_floor', 'stockroom']], { skin: [TILE.PLASTER, TILE.CHECKER_FLOOR], lights: 'fluoro', windows: false });
    for (let tx = x + 15; tx <= x + 19; tx++) this.world.set(tx, groundY - 4, TILE.CATWALK);
    for (let ty = groundY - 4; ty <= groundY - 1; ty++) this.world.set(x + 15, ty, TILE.LADDER);
    this.floorProp('office_desk', x + 16, groundY - 4, { scale: 0.9 });
    this.addContainer('Escritório do gerente', x + 18, groundY - 5, 'police', this.loot('scraps', x * 3, 2));
    this.addProp('shopping_cart', x - 1, groundY - 1, { scale: 1, flip: true });
    this.addProp('shopping_cart', x + 21, groundY - 1, { scale: 1 });
    this.addProp('pallet_goods', x + 21, groundY - 1, { scale: 0.9, behind: true });
    this.roofDress(b, ['ac_unit', 'vent_fan', '?water_tank', 'roof_vent'], { access: true, accessAt: 18, loot: this.chance(x, 0.4) ? { name: 'Caixa no telhado', table: 'market' } : null });
    this.register('Mercado County Mart', 'market', x, width, groundY, 'commercial');
  }

  makePharmacy(x) {
    this.plan('pharmacy', x);
    const width = 18;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.CRACKED_ASPHALT, TILE.GRAVEL);
    const b = this.construct({
      x: x + 1, width: 15, groundY, floors: 2, floorHeight: 6,
      material: TILE.CONCRETE, floorTile: TILE.CERAMIC, backWall: TILE.CERAMIC,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 3, partitions: [11], salt: x, ladderAt: 13, backDoor: true
    });
    this.backDoor(b, 'Entrada de serviço da farmácia', true);
    this.addDoor(b.doorX, groundY - 1, { name: 'Farmácia', locked: true, forceTool: 'crowbar', integrity: 4 });
    this.addContainer('Balcão da farmácia', x + 6, groundY - 2, 'pharmacy', this.loot('pharmacy', x + 2, 4));
    this.addContainer('Sala de medicamentos', x + 13, groundY - 2, 'pharmacy', this.loot('pharmacy', x + 3, 5, { guaranteed: true }), { rare: true });
    this.addProp('medicine_cabinet', x + 12, groundY - 4, { scale: 0.8, behind: true });
    // Stage 20: the pharmacist's flat upstairs
    this.dressBuilding(b, [['pharmacy_front', 'pharmacy_room'], ['living', 'bedroom|kitchen']], {
      skins: { ...this.homeSkins(TILE.WALLPAPER), pharmacy_front: [TILE.WALL_TILE, TILE.CHECKER_FLOOR], pharmacy_room: [TILE.WALL_TILE] }, lights: 'fluoro'
    });
    this.addContainer('Apartamento do farmacêutico', x + 5, groundY - 9, 'household', this.loot('household', x * 7, 3));
    this.roofDress(b, ['satellite_dish', 'antenna', 'ac_unit']);
    this.register('Farmácia County', 'pharmacy', x, width, groundY, 'medical');
  }

  makePolice(x) {
    this.plan('police', x);
    const width = 20;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.CONCRETE, TILE.GRAVEL);
    const b = this.construct({
      x: x + 1, width: 17, groundY, floors: 2, floorHeight: 7,
      material: TILE.BRICK, floorTile: TILE.CERAMIC, backWall: TILE.BRICK,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 3, partitions: [9, 13], salt: x, ladderAt: 12
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Delegacia' });
    // evidence room: the door needs a key found elsewhere in the district
    this.addDoor(x + 14, groundY - 1, {
      name: 'Sala de evidências', locked: true, keyItem: 'evidence_key', forceTool: 'crowbar', integrity: 8
    });
    this.addContainer('Armário de evidências', x + 16, groundY - 2, 'police', this.loot('police', x + 4, 5, { guaranteed: true }), { rare: true });
    this.addContainer('Armário de armamento', x + 15, groundY - 2, 'police', this.loot('police', x * 37, 6, { guaranteed: true, state: 'intact' }), { rare: true });
    this.addContainer('Recepção', x + 5, groundY - 2, 'police', this.loot('police', x + 5, 3));
    this.addPoint('terminal', x + 11, groundY - 1, {
      name: 'Terminal da delegacia', needsPower: true,
      note: 'Registro final: comboios da Blackridge cruzaram a 17 a noite toda. Ordem para não registrar nada.',
      grants: 'blackridge_lead'
    });
    this.addProp('road_sign', x - 1, groundY - 1, { scale: 0.85 });
    // Stage 20: offices and archive upstairs, holding cells below
    this.dressBuilding(b, [['reception', 'security', 'evidence'], ['office', 'archive', 'locker_room']], {
      skins: { reception: [TILE.PLASTER, TILE.LINOLEUM], office: [TILE.PLASTER, TILE.CARPET], archive: [TILE.OLD_CONCRETE], locker_room: [TILE.WALL_TILE], security: [TILE.PLASTER], evidence: [TILE.OLD_CONCRETE] },
      lights: 'fluoro'
    });
    this.addContainer('Vestiário', x + 16, groundY - 10, 'police', this.loot('police', x * 9, 3));
    const cells = this.basement(x + 2, 12, groundY, { depth: 5, wall: TILE.CONCRETE, backWall: TILE.DIRTY_CONCRETE, shaftAt: 1 });
    this.furnish({ x0: cells.x + 2, x1: cells.x + cells.width - 2, floorY: cells.bottom, ceilY: cells.top - 1 }, 'cells');
    this.lightRoom({ x0: cells.x + 4, x1: cells.x + 6, floorY: cells.bottom, ceilY: cells.top - 1 }, 'emergency');
    this.addContainer('Cela 2', cells.x + 9, cells.floorY - 1, 'police', this.loot('police', x * 13, 2));
    this.addProp('police_car', x + 18, groundY - 1, { scale: 1, behind: true });
    this.addProp('flag_pole', x + 21, groundY - 1, { scale: 1, anim: 'sway' });
    if (this.cur.state === 'barricaded' || this.cur.state === 'damaged') {
      this.world.set(x - 1, groundY - 1, TILE.SANDBAG);
      this.addProp('papers', x + 19, groundY - 1, { scale: 1 });
    }
    this.roofDress(b, ['antenna', 'satellite_dish', 'ac_unit'], { access: true, accessAt: 15 });
    this.register('Delegacia de North County', 'police', x, width, groundY, 'civic');
  }

  makeParking(x) {
    this.plan('parking', x);
    const width = 22;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.CONCRETE, TILE.GRAVEL);
    // two open decks, reached by a ladder — vertical space with sightlines
    for (let deck = 1; deck <= 2; deck++) {
      const y = groundY - deck * 6;
      for (let tx = x; tx < x + width; tx++) this.world.set(tx, y, TILE.CONCRETE);
      // pillars stand behind the play plane so each level stays one open floor
      for (let tx = x; tx < x + width; tx += 6) {
        for (let ty = y + 1; ty < y + 6; ty++) this.world.setWall(tx, ty, TILE.CONCRETE);
      }
      for (let ty = y; ty <= y + 5; ty++) this.world.set(x + 3, ty, TILE.LADDER);
      this.world.set(x + 3, y, TILE.AIR);
    }
    this.addContainer('Carro abandonado', x + 9, groundY - 2, 'garage', this.loot('garage', x + 2, 3));
    this.addContainer('Porta-malas', x + 14, groundY - 8, 'garage', this.loot('garage', x + 3, 3));
    this.addProp('wrecked_car', x + 7, groundY - 1, { scale: 0.85, behind: true });
    this.addProp('wrecked_car', x + 16, groundY - 7, { scale: 0.85, flip: true, behind: true });
    this.addProp('traffic_cone', x + 4, groundY - 1, { scale: 0.8 });
    // Stage 20: cars on every level, lamps, a story on the roof deck
    const tints = ['#8a4a3a', '#4a6a8a', '#b9b4a2', '#6a7a5a', '#3a3d40'];
    this.addProp('parked_car', x + 12, groundY - 1, { scale: 1, behind: true, tint: tints[Math.floor(this.rand(x) * 5)] });
    this.addProp('parked_car', x + 8, groundY - 7, { scale: 1, behind: true, tint: tints[Math.floor(this.rand(x + 1) * 5)], flip: true });
    this.addProp('parked_car', x + 13, groundY - 13, { scale: 1, behind: true, tint: tints[Math.floor(this.rand(x + 2) * 5)] });
    this.addProp('suitcases', x + 17, groundY - 13, { scale: 1 });
    this.addProp('papers', x + 10, groundY - 13, { scale: 1 });
    this.addContainer('Bagagem no terraço', x + 17, groundY - 14, 'household', this.loot('household', x * 3, 3));
    for (const [tx, dy] of [[x + 9, 6], [x + 15, 12]]) {
      this.lamp((tx + 0.5) * CONFIG.TILE, (groundY - dy + 1.4) * CONFIG.TILE, { radius: 210, strength: 0.8, color: 'cold', mode: 'power', flicker: 0.4, fixture: 'tube' });
      this.ceilProp('fluoro_lamp', tx, groundY - dy, groundY, { scale: 1 });
    }
    this.addProp('traffic_cone', x + 19, groundY - 7, { scale: 0.9 });
    this.addProp('phone_booth', x + 20, groundY - 1, { scale: 0.95, behind: true });
    this.register('Estacionamento Central', 'parking', x, width, groundY, 'urban');
  }

  /* --- civic ----------------------------------------------------------- */

  makeSchool(x) {
    this.plan('school', x);
    const width = 48;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.CRACKED_ASPHALT, TILE.GRAVEL);

    const b = this.construct({
      x: x + 6, width: 30, groundY, floors: 2, floorHeight: 6,
      material: TILE.BRICK, floorTile: TILE.CERAMIC, backWall: TILE.BRICK,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 15, partitions: [10, 20], salt: x, ladderAt: 26, backDoor: true
    });
    this.backDoor(b, 'Entrada da secretaria');
    this.addDoor(b.doorX, groundY - 1, { name: 'Escola' });

    // gym annexe
    const gym = this.construct({
      x: x + 37, width: 11, groundY, floors: 1, floorHeight: 9,
      material: TILE.BRICK, floorTile: TILE.FLOOR_WOOD, backWall: TILE.BRICK,
      roof: 'shed', roofTile: TILE.ROOF_METAL, doorAt: 1, windows: true, salt: x * 7, backDoor: true
    });
    this.backDoor(gym, 'Saída do ginásio');
    this.addBarricade(gym.doorX, groundY - 1, { name: 'Entrada do ginásio', integrity: 5 });

    this.chainPerimeter(x - 1, x + 4, groundY - 1, 3);
    this.addContainer('Armário de emergência', x + 9, groundY - 2, 'school', this.loot('school', x + 21, 4));
    this.addContainer('Cantina abandonada', x + 30, groundY - 2, 'school', this.loot('school', x + 22, 4));
    this.addContainer('Sala dos professores', x + 14, groundY - 9, 'school', this.loot('school', x + 33, 3), { rare: true });
    this.addContainer('Ginásio — depósito', x + 44, groundY - 2, 'camp', this.loot('camp', x + 44, 4, { guaranteed: true }));

    this.addProp('school_sign', x + 3, groundY - 1, { scale: 1 });
    this.addProp('basketball_hoop', x + 2, groundY - 1, { scale: 0.9 });
    // Stage 20: office, library, canteen; classrooms and labs upstairs
    this.dressBuilding(b, [['office', 'library', 'cafeteria'], ['office', 'classroom', 'lab|computer_lab']], {
      skins: {
        office: [TILE.PLASTER, TILE.CARPET], library: [TILE.WALLPAPER, TILE.CARPET], cafeteria: [TILE.WALL_TILE, TILE.CHECKER_FLOOR],
        classroom: [TILE.PEELING_WALL, TILE.LINOLEUM], lab: [TILE.WALL_TILE, TILE.LAB_FLOOR], computer_lab: [TILE.PLASTER, TILE.LINOLEUM]
      },
      lights: 'fluoro'
    });
    this.furnish(gym.rooms[0][0], this.cur.state === 'barricaded' ? 'dorm' : 'gym');
    this.skinRoom(gym.rooms[0][0], TILE.OLD_BRICK);
    this.lightRoom(gym.rooms[0][0], 'fluoro');
    if (this.cur.state === 'barricaded') this.story('holdout', x + 38, groundY);
    const boiler = this.basement(x + 7, 9, groundY, { depth: 5, wall: TILE.CONCRETE, backWall: TILE.OLD_CONCRETE, shaftAt: 1 });
    this.furnish({ x0: boiler.x + 2, x1: boiler.x + boiler.width - 2, floorY: boiler.bottom, ceilY: boiler.top - 1 }, 'mechanical');
    this.addContainer('Casa de caldeiras', boiler.x + 6, boiler.floorY - 1, 'industrial', this.loot('industrial', x * 5, 3));
    this.addProp('flag_pole', x + 5, groundY - 1, { scale: 1, anim: 'sway' });
    this.addProp('bicycle', x + 36, groundY - 1, { scale: 1 });
    this.roofDress(b, ['water_tank', 'ac_unit', 'vent_fan', 'antenna', 'ac_unit'], { access: true, accessAt: 27, loot: this.chance(x, 0.35) ? { name: 'Caixa do zelador', table: 'tools' } : null });
    this.register('Escola North County', 'school', x, width, groundY, 'civic');
  }

  makeClinic(x) {
    this.plan('clinic', x);
    const width = 26;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.CONCRETE, TILE.GRAVEL);

    const b = this.construct({
      x: x + 1, width: 22, groundY, floors: 1, floorHeight: 7,
      material: TILE.CRACKED_CONCRETE, floorTile: TILE.CERAMIC, backWall: TILE.CERAMIC,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 3, partitions: [8, 14, 19], salt: x
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Clínica' });
    this.addDoor(x + 20, groundY - 1, { name: 'Farmácia interna', locked: true, keyItem: 'clinic_key', forceTool: 'crowbar', integrity: 6 });
    this.addContainer('Armário médico', x + 6, groundY - 2, 'medical', this.loot('medical', x + 7, 5));
    this.addContainer('Sala de suprimentos', x + 16, groundY - 2, 'medical', this.loot('medical', x + 8, 4));
    this.addContainer('Farmácia lacrada', x + 21, groundY - 2, 'pharmacy', this.loot('pharmacy', x + 9, 5, { guaranteed: true }), { rare: true });
    this.addPoint('terminal', x + 12, groundY - 1, {
      name: 'Terminal da clínica', needsPower: true,
      note: 'Fichas de internação: 14 pacientes transferidos para Blackridge sem prontuário de retorno. Uma chave estava presa ao teclado.',
      grants: 'clinic_key'
    });
    this.addProp('ac_unit', x + 24, groundY - 6, { scale: 0.85 });
    // Stage 20
    this.dressBuilding(b, [['reception', 'ward', 'triage|storage', 'pharmacy_room']], {
      skins: { reception: [TILE.PLASTER, TILE.LINOLEUM], ward: [TILE.WALL_TILE], triage: [TILE.WALL_TILE], storage: [TILE.OLD_CONCRETE], pharmacy_room: [TILE.WALL_TILE] },
      lights: 'fluoro', emergency: true, windows: false
    });
    this.addProp('wheelchair', x + 24, groundY - 1, { scale: 1 });
    this.roofDress(b, ['ac_unit', 'vent_fan', 'roof_vent']);
    this.register('Clínica de Last County', 'clinic', x, width, groundY, 'medical');
  }

  // Four storeys of flats around a stairwell. Every unit gets its own fate.
  makeApartments(x) {
    this.plan('apartments', x);
    const width = 15;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 1, x + width + 1, groundY, TILE.CONCRETE, TILE.GRAVEL);
    const b = this.construct({
      x, width, groundY, floors: 4, floorHeight: 5,
      material: TILE.OLD_BRICK, floorTile: TILE.FLOOR_WOOD, backWall: TILE.OLD_BRICK,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 0, partitions: [5, 9], salt: x, ladderAt: 7, backDoor: true
    });
    if (b.backDoorX != null) this.addDoor(b.backDoorX, b.groundY - 1, { name:'Porta da administração', locked:true, keyItem:'apartment_key', forceTool:'crowbar', integrity:4 });
    this.addDoor(b.doorX, groundY - 1, { name: 'Portaria do Pine Court' });
    const fates = ['intact', 'looted', 'looted', 'barricaded', 'infested', 'damaged'];
    const themes = ['living', 'bedroom', 'kitchen', 'kids', 'laundry', 'bedroom|living'];
    b.rooms.forEach((level, f) => {
      level.forEach((room, i) => {
        const hall = i === 1;
        if (f === 0) {
          // lobby with mailboxes, admin office opposite
          const theme = i === 0 ? 'lobby' : hall ? 'hall' : 'office';
          this.skinRoom(room, TILE.PLASTER, TILE.LINOLEUM);
          this.furnish(room, theme, { state: this.cur.state });
          this.lightRoom(room, 'fluoro');
          return;
        }
        if (hall) {
          this.skinRoom(room, TILE.PEELING_WALL);
          this.lightRoom(room, 'fluoro');
          if (f === 2) this.floorProp('trash_bags', room.x0, room.floorY);
          return;
        }
        const fate = fates[Math.floor(this.rand(x * 13 + f * 7 + i) * fates.length)];
        const theme = f === 2 && i === 0 ? 'laundry' : themes[Math.floor(this.rand(x + f * 5 + i * 3) * themes.length)];
        const skins = this.homeSkins([TILE.WALLPAPER, TILE.PEELING_WALL, TILE.PLASTER][(f + i) % 3]);
        const sk = skins[theme.split('|')[0]] || [TILE.WALLPAPER];
        this.skinRoom(room, sk[0], sk[1] || null);
        this.furnish(room, theme.split('|')[f % 2] || theme, { state: fate, salt: f * 31 });
        if (fate === 'damaged') this.damageRoom(room, x + f * 17 + i);
        if (fate === 'barricaded') this.addBarricade(i === 0 ? x + 5 : x + 9, room.floorY - 1, { name: `Apto ${f}${i === 0 ? 'A' : 'B'} — barricada`, integrity: 3 });
        else if (this.rand(x * 3 + f * 11 + i) < 0.55) this.addDoor(i === 0 ? x + 5 : x + 9, room.floorY - 1, { name: `Apto ${f}${i === 0 ? 'A' : 'B'}`, locked: this.rand(x + f + i * 9) < 0.5, forceTool: 'crowbar', integrity: 3 });
        const table = fate === 'barricaded' ? 'holdout' : 'household';
        this.addContainer(`Apto ${f}${i === 0 ? 'A' : 'B'}`, room.x0 + 1 + (i ? 1 : 0), room.floorY - 2, table,
          this.loot(table, x * 7 + f * 13 + i, 3, { state: fate }), { rare: fate === 'barricaded' });
        if (this.rand(x + f * 3 + i) < 0.5) this.lamp((room.x0 + 2) * CONFIG.TILE, (room.ceilY + 1.5) * CONFIG.TILE, { radius: 140, strength: 0.65, mode: 'power', fixture: 'bulb' });
      });
    });
    this.dressWindows(b, 'home');
    // the fire escape: a second way in, through a blown-out wall on the third floor
    const lv = b.levels[2];
    for (let ty = lv.floorY - 1; ty <= groundY - 1; ty++) this.world.set(x + width, ty, TILE.LADDER);
    for (let ty = lv.floorY - 2; ty <= lv.floorY - 1; ty++) this.world.set(x + width - 1, ty, TILE.AIR);
    this.world.set(x + width, lv.floorY, TILE.CATWALK);
    // basement: shared laundry and maintenance
    const base = this.basement(x + 1, 13, groundY, { depth: 5, wall: TILE.CONCRETE, backWall: TILE.OLD_CONCRETE, shaftAt: 2 });
    this.furnish({ x0: base.x + 4, x1: base.x + 7, floorY: base.bottom, ceilY: base.top - 1 }, 'laundry');
    this.furnish({ x0: base.x + 8, x1: base.x + 11, floorY: base.bottom, ceilY: base.top - 1 }, 'maintenance');
    this.addContainer('Manutenção do prédio', base.x + 10, base.floorY - 1, 'tools', this.loot('tools', x * 17, 3));
    if (this.chance(x * 29, 0.5)) this.secretRoom(base.x - 3, base.x - 1, base.bottom, 3, { sealSide: 'right', seal: TILE.DAMAGED_BRICK, label: 'Depósito lacrado', props: ['crate_stack', 'water_jugs'] });
    else this.hookSecret('sealed_storage', base.x - 1, base.bottom);
    this.roofDress(b, ['water_tank', 'antenna', 'satellite_dish', 'roof_vent'], { access: true, accessAt: 12, loot: { name: 'Caixa na cobertura', table: 'holdout' } });
    this.addProp('antenna', x + 1, b.topCeil - 2, { scale: 1.2, behind: true });
    this.addProp('dumpster', x + width + 1, groundY - 1, { scale: 0.85 });
    this.addProp('parked_car', x - 3, groundY - 1, { scale: 1, behind: true, tint: '#6a5a4a' });
    this.register('Residencial Pine Court', 'apartments', x, width, groundY, 'residential');
  }

  makeMotel(x) {
    this.plan('motel', x);
    const width = 42;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.CRACKED_ASPHALT, TILE.GRAVEL);

    const mx = x + 4, mw = 32;
    const b = this.construct({
      x: mx, width: mw, groundY, floors: 2, floorHeight: 5,
      material: TILE.PAINTED_WOOD, floorTile: TILE.CERAMIC, backWall: TILE.PAINTED_WOOD,
      roof: 'shed', roofTile: TILE.ROOF_METAL, doorAt: 30, windows: true,
      partitions: [7, 14, 21, 27], salt: x, ladderAt: 29
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Recepção do motel' });
    this.addDoor(mx, groundY - 1, { name: 'Saída dos fundos', locked: true, forceTool: 'crowbar', integrity: 4 });
    // rooms off the corridor: a locked one (key at reception), a boarded one
    this.addDoor(mx + 14, groundY - 1, { name: 'Quarto 3', locked: true, keyItem: 'motel_key', forceTool: 'crowbar' });
    this.addBarricade(mx + 21, groundY - 1, { name: 'Quarto 5 — tapume' });

    this.addContainer('Quarto 03', mx + 17, groundY - 2, 'motel', this.loot('motel', x + 31, 3));
    this.addContainer('Quarto 07', mx + 23, groundY - 2, 'motel', this.loot('motel', x + 35, 3));
    this.addContainer('Recepção do motel', mx + 29, groundY - 2, 'motel', this.loot('motel', x + 32, 4, { guaranteed: true }));
    this.addContainer('Quarto lacrado', mx + 10, groundY - 2, 'camp', this.loot('camp', x + 36, 4, { guaranteed: true }), { rare: true });
    this.addPoint('key_hook', mx + 30, groundY - 2, { name: 'Quadro de chaves', grants: 'motel_key' });
    this.addDoor(mx + 7, b.levels[1].floorY - 1, { name:'Arquivo da gerência', locked:true, keyItem:'hotel_master_key', forceTool:'crowbar', integrity:5 });

    this.addProp('motel_sign', x + 1, groundY - 1, { scale: 1 });
    this.addProp('wrecked_car', x + 38, groundY - 1, { scale: 0.9 });
    // Stage 20: every room its own story, laundry and maintenance upstairs
    const fates = ['intact', 'looted', 'looted', 'infested', 'damaged', 'barricaded'];
    b.rooms.forEach((level, f) => level.forEach((room, i) => {
      let theme = 'motel_room';
      if (f === 0 && i === 4) theme = 'reception';
      else if (f === 0 && i === 0) theme = 'maintenance';
      else if (f === 1 && i === 4) theme = 'laundry';
      else if (f === 1 && i === 0) theme = 'storage';
      const fate = theme === 'motel_room' ? fates[Math.floor(this.rand(x * 3 + f * 7 + i * 11) * fates.length)] : this.cur.state;
      const sk = this.homeSkins([TILE.WALLPAPER, TILE.PEELING_WALL, TILE.CARPET][i % 3])[theme] || [TILE.PLASTER];
      this.skinRoom(room, sk[0] === TILE.CARPET ? TILE.WALLPAPER : sk[0], sk[1] || TILE.CARPET);
      this.furnish(room, theme, { state: fate, salt: f * 19 + i });
      if (fate === 'damaged') this.damageRoom(room, x + f * 7 + i);
      if (theme === 'reception') this.floorProp('ice_machine', room.x1, groundY, { scale: 0.9 });
      if (f === 1 && theme === 'motel_room') this.addContainer(`Quarto 1${i}`, room.x0 + 2, room.floorY - 2, 'motel', this.loot('motel', x * 5 + i, 2, { state: fate }));
      if (this.rand(x + f * 5 + i) < 0.5) this.lamp((room.x0 + 2) * CONFIG.TILE, (room.ceilY + 1.5) * CONFIG.TILE, { radius: 140, strength: 0.6, mode: 'power', flicker: 0.3, fixture: 'bulb' });
    }));
    this.dressWindows(b, 'home');
    this.lamp((x + 2) * CONFIG.TILE, (groundY - 2.6) * CONFIG.TILE, { radius: 180, strength: 0.8, color: 'red', mode: 'power', flicker: 0.5, fixture: 'neon' });
    this.addProp('vending_machine', x + 37, groundY - 1, { scale: 0.95, behind: true });
    this.addProp('parked_car', x - 1, groundY - 1, { scale: 1, behind: true, tint: '#7a6a4a', flip: true });
    this.addProp('trash_bags', x + 40, groundY - 1, { scale: 1 });
    this.register('Motel Pine Rest', 'motel', x, width, groundY, 'roadside');
  }

  // The best place in the county to get lost in: three floors, a sealed
  // isolation wing, a lab you can only reach from outside, a plant room.
  makeHospital(x) {
    this.plan('hospital', x);
    const width = 29;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 1, groundY, TILE.CONCRETE, TILE.GRAVEL);
    const b = this.construct({
      x, width, groundY, floors: 3, floorHeight: 6,
      material: TILE.DIRTY_CONCRETE, floorTile: TILE.CERAMIC, backWall: TILE.PLASTER,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 0, partitions: [8, 15, 22], salt: x, ladderAt: 12
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Pronto-socorro' });
    this.addDoor(x + width - 1, groundY - 1, { name: 'Baia das ambulâncias', locked: true, forceTool: 'crowbar', integrity: 6 });
    const L = f => b.levels[f].floorY;
    // ground floor: reception, triage, pharmacy (locked), administration
    this.addDoor(x + 15, L(0) - 1, { name: 'Farmácia do hospital', locked: true, forceTool: 'crowbar', integrity: 7 });
    this.addContainer('Recepção do hospital', x + 3, L(0) - 2, 'medical', this.loot('medical', x * 3, 3));
    this.addContainer('Farmácia do hospital', x + 19, L(0) - 2, 'pharmacy', this.loot('pharmacy', x * 5, 5, { guaranteed: true }), { rare: true });
    this.addContainer('Administração', x + 26, L(0) - 2, 'police', this.loot('scraps', x * 7, 3));
    this.addPoint('terminal', x + 25, L(0) - 1, {
      name: 'Terminal do hospital', needsPower: true,
      note: 'Plano de contingência 4: pacientes com febre negra para a ala de isolamento, 3º andar. Transferências para Blackridge suspensas "até segunda ordem".',
      grants: 'hospital_lead'
    });
    // first floor: the looted ward, the gurney corridor, a lab reached from outside
    this.addContainer('Enfermaria saqueada', x + 4, L(1) - 2, 'medical', this.loot('medical', x * 11, 2, { state: 'looted' }));
    this.addContainer('Quartos do 2º andar', x + 18, L(1) - 2, 'medical', this.loot('medical', x * 13, 3));
    this.addContainer('Laboratório clínico', x + 25, L(1) - 2, 'blackridge', this.loot('medical', x * 17, 4, { guaranteed: true }), { rare: true });
    for (let ty = L(1) - 3; ty <= L(1) - 1; ty++) this.world.set(x + 22, ty, TILE.RUBBLE);   // collapsed corridor
    for (let ty = L(1) - 1; ty <= groundY - 1; ty++) this.world.set(x + width, ty, TILE.LADDER);
    for (let ty = L(1) - 2; ty <= L(1) - 1; ty++) this.world.set(x + width - 1, ty, TILE.AIR);
    this.world.set(x + width, L(1), TILE.CATWALK);
    // second floor: a sealed isolation wing, the plant room, the infested ward
    this.addBarricade(x + 8, L(2) - 1, { name: 'Ala de isolamento — lacrada', integrity: 6 });
    this.addContainer('Isolamento', x + 3, L(2) - 2, 'medical', this.loot('pharmacy', x * 19, 4, { guaranteed: true, state: 'intact' }), { rare: true });
    this.addContainer('Sala elétrica', x + 18, L(2) - 2, 'industrial', this.loot('industrial', x * 23, 3));
    this.addContainer('Ala leste', x + 25, L(2) - 2, 'medical', this.loot('medical', x * 29, 3));

    const plan = [['reception', 'triage', 'pharmacy_room', 'office'], ['ward', 'empty', 'ward', 'lab'], ['isolation', 'hall', 'maintenance', 'ward']];
    const fate = [[null, null, 'intact', null], ['looted', 'looted', 'looted', 'intact'], ['intact', null, null, 'infested']];
    const skin = { reception: [TILE.PLASTER, TILE.LINOLEUM], triage: [TILE.WALL_TILE], pharmacy_room: [TILE.WALL_TILE], office: [TILE.PLASTER, TILE.CARPET],
      ward: [TILE.WALL_TILE, TILE.LINOLEUM], lab: [TILE.LAB_WALL, TILE.LAB_FLOOR], isolation: [TILE.LAB_WALL, TILE.LAB_FLOOR], hall: [TILE.PEELING_WALL], maintenance: [TILE.OLD_CONCRETE, TILE.CONCRETE], empty: [TILE.PEELING_WALL] };
    b.rooms.forEach((level, f) => level.forEach((room, i) => {
      const theme = plan[f][i];
      room.theme = theme;
      this.skinRoom(room, skin[theme][0], skin[theme][1] || null);
      this.furnish(room, theme, { state: fate[f][i] || this.cur.state, salt: f * 7 + i });
      this.lightRoom(room, 'fluoro');
      this.lightRoom(room, 'emergency');
    }));
    this.story('triage', x + 9, L(1));
    this.story('quarantine', x + 6, L(2));
    this.floorProp('wheelchair', x + 2, L(1), { scale: 1 });
    this.dressWindows(b, 'clinic');
    // infected patients still in the east ward
    this.spawns = [[x + 24, L(2), 'patient'], [x + 26, L(2), 'patient'], [x + 5, L(1), 'patient']];
    // basement: storage and the plant room, with a panel that brings the building back
    const base = this.basement(x + 1, 26, groundY, { depth: 6, wall: TILE.CONCRETE, backWall: TILE.OLD_CONCRETE, shaftAt: 3 });
    this.furnish({ x0: base.x + 5, x1: base.x + 13, floorY: base.bottom, ceilY: base.top - 1 }, 'storage');
    this.furnish({ x0: base.x + 15, x1: base.x + 24, floorY: base.bottom, ceilY: base.top - 1 }, 'power');
    this.lightRoom({ x0: base.x + 8, x1: base.x + 10, floorY: base.bottom, ceilY: base.top - 1 }, 'emergency');
    this.addContainer('Almoxarifado', base.x + 7, base.floorY - 1, 'medical', this.loot('medical', x * 31, 4));
    this.addPoint('terminal', base.x + 20, base.floorY, {
      name: 'Quadro de energia do hospital', needsPower: false, powers: true,
      note: 'Gerador de emergência reiniciado. As luzes do hospital voltam — e todo o prédio ouve.',
      grants: 'hospital_power'
    });
    this.emitter('drip', (base.x + 12) * CONFIG.TILE, (base.top) * CONFIG.TILE);
    this.roofDress(b, ['water_tank', 'ac_unit', 'vent_fan', 'antenna', 'ac_unit', 'satellite_dish'], { access: true, accessAt: 13, loot: { name: 'Suprimentos do heliponto', table: 'medical' } });
    this.addProp('flag_pole', x - 2, groundY - 1, { scale: 1, anim: 'sway' });
    this.addProp('gurney', x + width + 1, groundY - 1, { scale: 1 });
    this.addProp('traffic_cone', x - 1, groundY - 1, { scale: 0.9 });
    const s = this.register('Hospital Regional Harlow', 'hospital', x, width, groundY, 'medical');
    s.spawns = this.spawns;
    this.spawns = null;
  }

  /* --- industrial ------------------------------------------------------ */

  makeWarehouse(x) {
    this.plan('warehouse', x);
    const width = 26;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.INDUSTRIAL_FLOOR, TILE.GRAVEL);
    const b = this.construct({
      x: x + 1, width: 24, groundY, floors: 1, floorHeight: 11,
      material: TILE.WALL_PANEL, floorTile: TILE.INDUSTRIAL_FLOOR, backWall: TILE.WALL_PANEL,
      roof: 'shed', roofTile: TILE.ROOF_METAL, doorAt: 22, windows: true, eaves: 2, salt: x
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Porta lateral do armazém', locked: this.chance(x, 0.5), forceTool: 'crowbar' });
    // mezzanine catwalk with ladder access
    for (let tx = x + 3; tx <= x + 16; tx++) this.world.set(tx, groundY - 6, TILE.CATWALK);
    for (let ty = groundY - 6; ty <= groundY - 1; ty++) this.world.set(x + 17, ty, TILE.LADDER);
    // loading dock shutter in the west wall
    for (let ty = groundY - 1; ty >= groundY - 5; ty--) this.world.set(x + 1, ty, TILE.METAL);
    this.addPoint('shutter', x + 1, groundY - 1, {
      name: 'Doca de carga', width: 1, height: 5, tile: TILE.METAL, needsPower: true, forceTool: 'crowbar', integrity: 8
    });
    this.addContainer('Palete de suprimentos', x + 12, groundY - 2, 'industrial', this.loot('industrial', x + 1, 5, { guaranteed: true }));
    this.addContainer('Caixa da mezanino', x + 8, groundY - 7, 'industrial', this.loot('industrial', x + 2, 4), { rare: true });
    this.addProp('pipe_run', x + 5, groundY - 9, { scale: 0.9, behind: true });
    this.addProp('vent_fan', x + 22, groundY - 8, { scale: 0.8 });
    // Stage 20: racking, forklift, a foreman's desk on the mezzanine
    const floor = { x0: x + 2, x1: x + 16, floorY: groundY, ceilY: groundY - 6 };
    this.skinRoom({ x0: x + 2, x1: x + 23, floorY: groundY, ceilY: groundY - 12 }, TILE.SHEET_METAL);
    for (let tx = x + 2; tx <= x + 6; tx++) this.world.set(tx, groundY, TILE.HAZARD_FLOOR);
    this.furnish(floor, 'warehouse_floor', { scale: 1 });
    this.furnish({ x0: x + 18, x1: x + 23, floorY: groundY, ceilY: groundY - 12 }, 'stockroom');
    this.furnish({ x0: x + 3, x1: x + 12, floorY: groundY - 6, ceilY: groundY - 12 }, 'office');
    for (const tx of [x + 6, x + 14, x + 20]) this.lightRoom({ x0: tx, x1: tx, floorY: groundY - 6, ceilY: groundY - 12 }, 'fluoro');
    this.addProp('pallet', x - 1, groundY - 1, { scale: 1 });
    this.addProp('oil_drum', x + 25, groundY - 1, { scale: 0.9 });
    this.addProp('hazard_barrel', x + 26, groundY - 1, { scale: 0.9 });
    this.register('Armazém Westline', 'warehouse', x, width, groundY, 'industrial');
  }

  makeWorkshop(x) {
    this.plan('workshop', x);
    const width = 28;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.INDUSTRIAL_FLOOR, TILE.GRAVEL);

    const b = this.construct({
      x: x + 1, width: 22, groundY, floors: 1, floorHeight: 9,
      material: TILE.RUST_METAL, floorTile: TILE.INDUSTRIAL_FLOOR, backWall: TILE.WALL_PANEL,
      roof: 'gable', roofTile: TILE.ROOF_METAL, doorAt: 18, windows: true, eaves: 2, salt: x, partitions: [16]
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Porta do escritório', locked: this.chance(x * 3, 0.4) });
    // the bay door in the west wall stands open
    for (let ty = groundY - 1; ty >= groundY - 5; ty--) this.world.set(x + 1, ty, TILE.AIR);
    this.world.set(x + 1, groundY - 6, TILE.METAL);

    this.chainPerimeter(x + 24, x + width + 2, groundY - 1, 3);
    this.addContainer('Armário de ferramentas', x + 10, groundY - 2, 'workshop', this.loot('workshop', x + 9, 5));
    this.addContainer('Depósito de peças', x + 16, groundY - 2, 'workshop', this.loot('workshop', x + 10, 5, { guaranteed: true }), { rare: true });
    this.addContainer('Caixa da oficina', x + 20, groundY - 2, 'tools', this.loot('tools', x + 27, 4));
    this.addPoint('workbench_spot', x + 13, groundY - 1, { name: 'Bancada da oficina' });
    this.addProp('scrap_heap', x + 25, groundY - 1, { scale: 0.9 });
    this.addProp('oil_drum', x + 23, groundY - 1, { scale: 0.9 });
    // Stage 20: a car up on the lift, a wall of tools, the office
    this.addProp('lift_jack', x + 3, groundY - 1, { scale: 1.05, behind: true });
    this.addProp('car_frame', x + 2, groundY - 1, { scale: 1, behind: true, offsetY: -30 });
    this.furnish({ x0: x + 6, x1: x + 16, floorY: groundY, ceilY: groundY - 10 }, 'workshop', { scale: 1.05 });
    this.floorProp('tire_rack', x + 15, groundY, { scale: 1 });
    this.skinRoom(b.rooms[0][1], TILE.PLASTER, TILE.LINOLEUM);
    this.furnish(b.rooms[0][1], 'office');
    this.floorProp('radio', x + 19, groundY, { scale: 1, offsetY: -18 });
    for (const tx of [x + 5, x + 12]) this.lightRoom({ x0: tx, x1: tx, floorY: groundY, ceilY: groundY - 10 }, 'fluoro');
    this.addProp('generator', x + 26, groundY - 1, { scale: 1 });
    this.addProp('tire_pile', x + 28, groundY - 1, { scale: 0.9 });
    this.addProp('parked_car', x - 2, groundY - 1, { scale: 1, behind: true, tint: '#5a3a2a' });
    this.register('Oficina Westline', 'workshop', x, width, groundY, 'industrial');
  }

  makeRailYard(x) {
    this.plan('railyard', x);
    const width = 28;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.GRAVEL, TILE.GRAVEL);
    for (let tx = x; tx < x + width; tx++) this.world.set(tx, groundY, TILE.RAIL);

    // shipping containers stacked into climbable cover
    const stacks = [[x + 4, 2], [x + 12, 1], [x + 18, 2], [x + 24, 1]];
    for (const [sx, high] of stacks) {
      for (let level = 0; level < high; level++) {
        const y = groundY - 1 - level * 4;
        for (let tx = sx; tx < sx + 5; tx++) {
          for (let ty = y; ty > y - 4; ty--) {
            const edge = tx === sx || tx === sx + 4 || ty === y - 3 || ty === y;
            this.world.set(tx, ty, edge ? TILE.RUST_METAL : TILE.AIR);
            this.world.setWall(tx, ty, TILE.RUST_METAL);
          }
        }
        this.world.set(sx + 2, y, TILE.AIR);
        // doors swung open on the west end, so every box can be entered
        for (let ty = y - 2; ty <= y - 1; ty++) this.world.set(sx, ty, TILE.AIR);
      }
      for (let ty = groundY - 1 - (high - 1) * 4 - 4; ty <= groundY - 1; ty++) if (this.world.get(sx - 1, ty) === TILE.AIR) this.world.set(sx - 1, ty, TILE.LADDER);
      this.addContainer('Contêiner', sx + 2, groundY - 2, 'industrial', this.loot('industrial', sx, 3));
    }
    this.addProp('rail_signal', x + 2, groundY - 1, { scale: 0.85 });
    this.addProp('rail_cart', x + 9, groundY - 1, { scale: 0.85 });
    this.addProp('scrap_heap', x + 21, groundY - 1, { scale: 0.85 });
    // Stage 20: someone lived in the top container; the signal still blinks
    this.floorProp('bedroll', x + 5, groundY - 5, { scale: 0.8 });
    this.floorProp('candles', x + 7, groundY - 5, { scale: 1 });
    this.lamp((x + 7.5) * CONFIG.TILE, (groundY - 5.6) * CONFIG.TILE, { radius: 110, strength: 0.5, mode: 'always', flicker: 0.3, fixture: 'candle' });
    this.addContainer('Esconderijo no contêiner', x + 6, groundY - 6, 'holdout', this.loot('holdout', x * 13, 3), { rare: true });
    this.lamp((x + 2.5) * CONFIG.TILE, (groundY - 1.6) * CONFIG.TILE, { radius: 90, strength: 0.6, color: 'red', mode: 'always', flicker: 0.9, fixture: 'signal' });
    this.addProp('cable_spool', x + 10, groundY - 1, { scale: 0.9 });
    this.addProp('pallet_goods', x + 17, groundY - 1, { scale: 0.9, behind: true });
    this.addProp('crate_stack', x + 19, groundY - 9, { scale: 0.9 });
    this.addProp('subway_car', x - 3, groundY - 1, { scale: 1, behind: true, tint: '#6a4a3a', alpha: 0.95 });
    this.register('Pátio Ferroviário', 'railyard', x, width, groundY, 'industrial');
  }

  makeFireStation(x) {
    this.plan('firestation', x);
    const width = 15;
    const groundY = this.lotY(x, 13);
    this.levelGround(x - 1, x + 14, groundY, TILE.CONCRETE, TILE.GRAVEL);
    const b = this.construct({
      x, width: 13, groundY, floors: 2, floorHeight: 6,
      material: TILE.BRICK, floorTile: TILE.CONCRETE, backWall: TILE.BRICK,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 12, partitions: [8], salt: x, ladderAt: 10
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Porta lateral dos bombeiros', locked: this.chance(x, 0.3) });
    // the engine bay door in the west wall
    for (let ty = groundY - 1; ty >= groundY - 4; ty--) this.world.set(x, ty, TILE.METAL);
    this.addPoint('shutter', x, groundY - 1, { name: 'Portão da garagem dos bombeiros', width: 1, height: 4, tile: TILE.METAL, needsPower: true, forceTool: 'crowbar', integrity: 7 });
    const [bay, gear] = b.rooms[0];
    this.skinRoom(bay, TILE.OLD_BRICK, TILE.HAZARD_FLOOR);
    this.floorProp('fire_truck', bay.x0, groundY, { scale: 0.95 });
    this.floorProp('hose_reel', bay.x1, groundY, { scale: 1 });
    this.skinRoom(gear, TILE.PLASTER);
    this.furnish(gear, 'gear');
    this.lightRoom(bay, 'fluoro');
    const [dorm, kitchen] = b.rooms[1];
    this.skinRoom(dorm, TILE.WALLPAPER, TILE.CARPET);
    this.furnish(dorm, 'dorm');
    this.skinRoom(kitchen, TILE.WALL_TILE, TILE.LINOLEUM);
    this.furnish(kitchen, 'kitchen');
    this.lightRoom(dorm, 'bulb');
    this.addContainer('Armário dos bombeiros', x + 10, groundY - 2, 'firestation', this.loot('firestation', x * 3, 5, { guaranteed: true }));
    this.addContainer('Alojamento', x + 3, b.levels[1].floorY - 2, 'household', this.loot('household', x * 5, 3));
    this.addContainer('Cozinha do quartel', x + 10, b.levels[1].floorY - 2, 'kitchen', this.loot('kitchen', x * 7, 3));
    // hose-drying tower on the roof, with a view over Westline
    this.roofDress(b, ['ac_unit', 'antenna'], { access: true, accessAt: 2 });
    const top = this.tower(x + 7, b.topCeil - 1, 8, { leg: TILE.BRICK, deck: TILE.CATWALK, wall: TILE.OLD_BRICK, rail: TILE.METAL });
    this.addContainer('Torre de mangueiras', x + 10, top - 1, 'firestation', this.loot('firestation', x * 11, 5, { guaranteed: true }), { rare: true });
    this.lamp((x + 9) * CONFIG.TILE, (top - 2) * CONFIG.TILE, { radius: 140, strength: 0.7, color: 'red', mode: 'alert', flicker: 0.8, fixture: 'emergency' });
    this.addProp('fire_hydrant', x - 1, groundY - 1, { scale: 0.9 });
    this.addProp('flag_pole', x + 14, groundY - 1, { scale: 1, anim: 'sway' });
    this.register('Bombeiros de Westline', 'firestation', x, width, groundY, 'industrial');
  }

  makeQuarry(x) {
    this.plan('quarry', x);
    const width = 26;
    const groundY = this.lotY(x, width);
    this.levelGround(x - 2, x + width + 2, groundY, TILE.GRAVEL, TILE.STONE);
    // stepped rock face down into a mine adit
    for (let step = 0; step < 4; step++) {
      const sx = x + 4 + step * 4;
      for (let tx = sx; tx < x + width; tx++) {
        for (let ty = groundY + step * 2; ty < groundY + step * 2 + 2; ty++) this.world.set(tx, ty, TILE.AIR);
      }
      for (let tx = sx; tx < x + width; tx++) this.world.surface[tx] = groundY + step * 2 + 2;
    }
    const mineY = groundY + 8;
    this.world.digTunnel(x + 20, x + 46, mineY, 3, TILE.DARK_STONE, TILE.GRAVEL);
    for (let ty = groundY + 6; ty <= mineY; ty++) this.world.set(x + 21, ty, TILE.LADDER);
    this.addContainer('Depósito da pedreira', x + 30, mineY - 1, 'tools', this.loot('tools', x + 12, 4, { guaranteed: true }), { rare: true });
    this.addContainer('Carrinho de minério', x + 40, mineY - 1, 'industrial', this.loot('industrial', x + 13, 3));
    this.addProp('machinery', x + 6, groundY - 1, { scale: 0.9 });
    this.addProp('oil_drum', x + 10, groundY - 1, { scale: 0.85 });
    this.addPoint('terminal', x + 8, groundY - 1, {
      name: 'Quadro da pedreira', needsPower: false,
      note: 'Aviso: galeria leste conectada ao duto da Blackridge. Entrada proibida sem autorização.',
      grants: 'quarry_lead'
    });
    // Stage 20: the mine proper — timbered galleries, rails, a lower level,
    // the miners' camp, a collapse, and the shaft down toward Blackridge
    for (let tx = x + 22; tx <= x + 45; tx++) this.world.set(tx, mineY + 1, TILE.RAIL);
    for (let tx = x + 20; tx <= x + 46; tx++) for (let ty = mineY - 2; ty <= mineY; ty++) this.world.setWall(tx, ty, TILE.DARK_STONE);
    for (let tx = x + 23; tx <= x + 44; tx += 5) {
      this.addProp('mine_support', tx, mineY, { scale: 1.3, behind: true, offsetY: 0 });
      this.world.set(tx + 1, mineY - 3, TILE.TIMBER);
    }
    for (let tx = x + 25; tx <= x + 44; tx += 8) {
      this.ceilProp('lantern', tx, mineY - 3, mineY + 1, { scale: 1 });
      this.lamp((tx + 0.5) * CONFIG.TILE, (mineY - 1.3) * CONFIG.TILE, { radius: 150, strength: 0.7, mode: 'always', flicker: 0.25, fixture: 'lantern' });
    }
    this.floorProp('ore_cart', x + 34, mineY + 1, { scale: 1 });
    this.emitter('dust', (x + 32) * CONFIG.TILE, (mineY - 1) * CONFIG.TILE, { w: 18 * CONFIG.TILE });
    this.emitter('drip', (x + 38) * CONFIG.TILE, (mineY - 2) * CONFIG.TILE);
    // lower level
    const lowY = mineY + 10;
    this.world.digTunnel(x + 4, x + 46, lowY, 4, TILE.DARK_STONE, TILE.GRAVEL);
    for (let tx = x + 4; tx <= x + 46; tx++) for (let ty = lowY - 3; ty <= lowY; ty++) this.world.setWall(tx, ty, TILE.WET_STONE);
    for (let ty = mineY - 2; ty <= lowY; ty++) this.world.set(x + 44, ty, TILE.LADDER);
    this.world.set(x + 44, mineY + 1, TILE.LADDER);
    for (let tx = x + 6; tx <= x + 42; tx += 6) {
      this.addProp('mine_support', tx, lowY, { scale: 1.6, behind: true });
      this.world.set(tx + 1, lowY - 4, TILE.TIMBER);
    }
    // the miners' own way down, from the first bench of the pit
    for (let ty = this.world.surface[x + 6]; ty <= lowY; ty++) { this.world.set(x + 6, ty, TILE.LADDER); this.world.setWall(x + 6, ty, TILE.DARK_STONE); }
    const camp = { x0: x + 5, x1: x + 13, floorY: lowY + 1, ceilY: lowY - 4 };
    this.furnish(camp, 'miners', { scale: 1 });
    this.lightRoom(camp, 'lantern');
    this.addContainer('Acampamento dos mineiros', x + 9, lowY - 1, 'camp', this.loot('camp', x * 3, 4, { guaranteed: true }));
    // the collapse: rubble to dig through
    for (let tx = x + 16; tx <= x + 18; tx++) for (let ty = lowY - 3; ty <= lowY; ty++) if (this.rand(tx * 5 + ty) < 0.8) this.world.set(tx, ty, TILE.RUBBLE);
    const depot = { x0: x + 26, x1: x + 36, floorY: lowY + 1, ceilY: lowY - 4 };
    this.furnish(depot, 'explosives', { scale: 1 });
    this.lightRoom(depot, 'lantern');
    this.addContainer('Depósito de explosivos', x + 33, lowY - 1, 'tools', this.loot('tools', x * 7, 5, { guaranteed: true }), { rare: true });
    this.emitter('dust', (x + 20) * CONFIG.TILE, (lowY - 2) * CONFIG.TILE, { w: 20 * CONFIG.TILE });
    this.emitter('drip', (x + 24) * CONFIG.TILE, (lowY - 3) * CONFIG.TILE);
    // the old shaft down to the Blackridge gallery
    for (let ty = lowY - 3; ty <= 126; ty++) {
      this.world.set(x + 46, ty, TILE.LADDER);
      this.world.setWall(x + 46, ty, TILE.DARK_STONE);
      if (this.world.get(x + 45, ty) === TILE.AIR && ty > lowY + 1) this.world.set(x + 45, ty, TILE.DARK_STONE);
      if (this.world.get(x + 47, ty) === TILE.AIR && ty > lowY + 1 && ty < 123) this.world.set(x + 47, ty, TILE.DARK_STONE);
    }
    this.addProp('warning_sign', x + 45, lowY, { scale: 0.9 });
    // surface works
    this.addProp('dynamite_crate', x + 2, groundY - 1, { scale: 1 });
    this.addProp('cable_spool', x + 3, groundY - 1, { scale: 0.9 });
    this.addGroundProp('ore_cart', x + 12, { scale: 1 });
    this.emitter('dust', (x + 14) * CONFIG.TILE, (groundY + 3) * CONFIG.TILE, { w: 10 * CONFIG.TILE });
    this.register('Pedreira Serra Oeste', 'quarry', x, width, groundY, 'industrial', { depth: 64 });
  }

  // Stage 20.1: the old district-grid objective returns without flattening
  // the quarry tunnel that runs underneath it.
  makeSubstation(x) {
    this.plan('substation', x);
    const width = 18;
    const groundY = this.lotY(x, width);
    for (let tx = x - 1; tx <= x + width + 1; tx++) {
      this.clearAbove(tx, groundY - 15, groundY);
      this.world.set(tx, groundY, tx % 4 === 0 ? TILE.GRATE : TILE.INDUSTRIAL_FLOOR);
      this.world.surface[tx] = groundY;
    }
    const b = this.construct({
      x: x + 4, width: 10, groundY, floors: 2, floorHeight: 5,
      material: TILE.WALL_PANEL, floorTile: TILE.INDUSTRIAL_FLOOR, backWall: TILE.TECH_WALL,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 2, partitions: [6], salt: x, ladderAt: 8
    });
    this.addDoor(b.doorX, groundY - 1, { name: 'Subestação elétrica', locked: true, forceTool: 'crowbar', integrity: 6 });
    this.dressBuilding(b, [['power','maintenance'], ['office','storage']], { skin: [TILE.TECH_WALL, TILE.INDUSTRIAL_FLOOR], lights: 'fluoro' });
    this.addContainer('Armário de alta tensão', x + 8, groundY - 2, 'industrial', this.loot('industrial', x + 301, 5, { guaranteed: true }), { rare: true });
    this.addContainer('Sala dos técnicos', x + 9, b.levels[1].floorY - 2, 'office', this.loot('office', x + 302, 4));
    this.floorProp('electrical_panel', x + 2, groundY, { scale: 1 });
    this.floorProp('cable_spool', x + 15, groundY, { scale: 1 });
    this.addProp('warning_sign', x - 1, groundY - 1, { scale: .82 });
    this.lamp((x + 2) * CONFIG.TILE, (groundY - 3) * CONFIG.TILE, { radius: 190, strength: .75, color: 'cold', mode: 'power', flicker: .12, fixture: 'fluoro' });
    this.addPoint('district_panel', x + 11, groundY - 2, {
      name: 'Painel mestre de North County', state: 'off',
      areas: ['Mercado County Mart','Farmácia County','Delegacia de North County','Garagem Central','Escola North County','Hospital Regional Harlow','Pine Court','Motel Pine Rest','Estação Central (metrô)','Galeria Subterrânea Central','Galerias de Manutenção']
    });
    this.addPoint('light_switch', x + 7, groundY - 2, { name: 'Luzes da subestação', state: 'off', area: 'Subestação North County' });
    this.addPoint('fuse_panel', x + 12, groundY - 2, { name: 'Quadro local da subestação', state: 'off', area: 'Subestação North County' });
    this.register('Subestação North County', 'substation', x, width, groundY, 'industrial', { floors: 2, content: 'high' });
  }

  /* --- underground ----------------------------------------------------- */

  // Carves a rectangular underground room with finished walls.
  vault(x0, x1, y0, y1, wall, back, floor = null) {
    const w = this.world;
    for (let x = x0 - 1; x <= x1 + 1; x++) {
      for (let y = y0 - 1; y <= y1 + 1; y++) {
        const edge = x === x0 - 1 || x === x1 + 1 || y === y0 - 1 || y === y1 + 1;
        if (edge) { if (w.get(x, y) === TILE.AIR && w.getWall(x, y) === TILE.AIR) w.set(x, y, wall); else if (y === y1 + 1 || y === y0 - 1) w.set(x, y, wall); }
        else w.set(x, y, TILE.AIR);
        w.setWall(x, y, back);
      }
    }
    if (floor) for (let x = x0; x <= x1; x++) w.set(x, y1 + 1, floor);
  }

  // Central station under downtown: concourse over platforms, service
  // rooms, and tunnels running off under the neighbourhoods.
  makeMetro() {
    const x0 = 372, x1 = 522, floor = 93;
    this.plan('metro', x0);
    const w = this.world;
    // running tunnels: 4 tall, rails on the floor
    w.digTunnel(x0, x1, floor - 1, 4, TILE.SUB_BRICK, TILE.RAIL);
    for (let x = x0; x <= x1; x++) for (let y = floor - 4; y <= floor - 1; y++) w.setWall(x, y, x % 17 < 2 ? TILE.WET_CONCRETE : TILE.SUB_BRICK);
    // station hall: two levels (concourse slab at 85)
    const hx0 = 400, hx1 = 484, top = 78;
    this.vault(hx0, hx1, top, floor - 1, TILE.CONCRETE, TILE.STATION_TILE, TILE.HAZARD_FLOOR);
    for (let x = hx0; x <= hx1; x++) w.set(x, floor, x < 406 || x > 478 ? TILE.RAIL : TILE.HAZARD_FLOOR);
    for (let x = hx0; x <= hx1; x++) w.set(x, 85, TILE.CONCRETE);
    for (const lx of [412, 472]) for (let y = 85; y <= floor - 1; y++) w.set(lx, y, TILE.LADDER);
    // concourse partitions: toilets/storage left, ticket office right
    for (const px of [409, 476]) for (let y = top; y <= 82; y++) w.set(px, y, TILE.STATION_TILE);
    const upper = f => ({ x0: f[0], x1: f[1], floorY: 85, ceilY: top - 1 });
    const lower = f => ({ x0: f[0], x1: f[1], floorY: floor, ceilY: 85 });
    this.skinRoom(upper([hx0, 408]), TILE.WALL_TILE, TILE.CHECKER_FLOOR);
    this.furnish(upper([hx0, 408]), 'bath');
    this.furnish(upper([413, 440]), 'concourse', { scale: 1 });
    this.furnish(upper([444, 452]), 'kiosk', { scale: 1 });
    this.furnish(upper([455, 470]), 'concourse', { scale: 1, salt: 9 });
    this.skinRoom(upper([477, hx1]), TILE.PLASTER, TILE.LINOLEUM);
    this.furnish(upper([477, hx1]), 'security');
    this.furnish(lower([hx0 + 1, 440]), 'platform', { scale: 1 });
    this.furnish(lower([446, 470]), 'platform', { scale: 1, salt: 5 });
    this.story('commuter', 441, floor);
    for (let x = 404; x <= 480; x += 12) { this.lightRoom(upper([x, x + 2]), 'fluoro'); this.lightRoom(lower([x + 6, x + 8]), 'fluoro'); }
    for (let x = 404; x <= 480; x += 16) this.lightRoom(lower([x, x + 1]), 'emergency');
    this.addProp('cable_bundle', 420, 86, { scale: 1, behind: true, wall: true, offsetY: -8 });
    this.addProp('cable_bundle', 455, 79, { scale: 1, behind: true, wall: true, offsetY: -8 });
    // the gate between the street stairs and the platforms
    for (let y = 82; y <= 84; y++) w.set(474, y, TILE.METAL);
    this.addPoint('shutter', 474, 84, { name: 'Portão da estação', width: 1, height: 3, tile: TILE.METAL, needsPower: true, forceTool: 'crowbar', integrity: 6 });
    this.addContainer('Bilheteria', 480, 83, 'police', this.loot('police', 480, 3));
    this.addContainer('Banca do metrô', 448, 83, 'market', this.loot('market', 448, 4));
    this.addContainer('Achados e perdidos', 404, 83, 'household', this.loot('household', 404, 4), { rare: true });
    this.addContainer('Mala abandonada', 442, floor - 1, 'household', this.loot('household', 442, 3));
    // street stairs: west one down from between the pharmacy and police
    for (let y = 60; y <= 84; y++) { if (y >= 67) w.set(444, y, TILE.LADDER); w.setWall(444, y, TILE.STATION_TILE); }
    for (let y = 67; y <= 77; y++) { w.set(443, y, TILE.CONCRETE); w.set(445, y, TILE.CONCRETE); }
    for (let x = 443; x <= 445; x++) w.set(x, 62, TILE.ROOF_METAL);
    this.addProp('station_sign', 441, 63, { scale: 0.7, behind: true, wall: true });
    this.addPoint('hatch', 444, 66, { name: 'Escadaria do metrô', targetX: 444, targetY: 84, label: 'DESCER AO METRÔ' });
    // east stairs down to the running tunnel between the car park and the school
    const ex = 501;
    for (let y = w.surface[ex]; y <= floor - 1; y++) { w.set(ex, y, TILE.LADDER); w.setWall(ex, y, TILE.OLD_CONCRETE); }
    for (let y = w.surface[ex]; y <= floor - 5; y++) { w.set(ex - 1, y, TILE.CONCRETE); w.set(ex + 1, y, TILE.CONCRETE); }
    for (let x = ex - 1; x <= ex + 1; x++) w.set(x, w.surface[ex] - 5, TILE.ROOF_METAL);
    this.addProp('road_sign', ex + 2, w.surface[ex] - 1, { scale: 0.9 });
    // abandoned train in the east tunnel, power room above it
    this.floorProp('subway_car', 486, floor, { scale: 1 });
    this.addContainer('Vagão abandonado', 490, floor - 2, 'household', this.loot('household', 490, 3));
    this.vault(506, 516, 82, 87, TILE.CONCRETE, TILE.TECH_WALL, TILE.GRATE);
    for (let y = 88; y <= floor - 1; y++) w.set(508, y, TILE.LADDER);
    this.furnish({ x0: 509, x1: 516, floorY: 88, ceilY: 81 }, 'power', { scale: 1 });
    this.lightRoom({ x0: 510, x1: 512, floorY: 88, ceilY: 81 }, 'emergency');
    this.addPoint('terminal', 514, 87, {
      name: 'Quadro elétrico da estação', needsPower: false, powers: true,
      note: 'Disjuntor geral religado. A estação acende inteira — e o eco leva o barulho por todos os túneis.',
      grants: 'metro_power'
    });
    this.addContainer('Sala de energia', 511, 86, 'industrial', this.loot('industrial', 511, 4, { guaranteed: true }), { rare: true });
    // collapse at the east end
    for (let x = 518; x <= x1; x++) for (let y = floor - 4; y <= floor - 1; y++) if (this.rand(x * 3 + y) < 0.85) w.set(x, y, TILE.RUBBLE);
    // ventilation room off the west tunnel
    this.vault(384, 394, 86, floor - 1, TILE.CONCRETE, TILE.TECH_WALL, TILE.GRATE);
    this.furnish({ x0: 385, x1: 394, floorY: floor, ceilY: 85 }, 'maintenance', { scale: 1 });
    this.addProp('vent_fan', 389, 87, { scale: 1.2, behind: true, wall: true });
    this.addContainer('Manutenção do túnel', 392, floor - 1, 'industrial', this.loot('industrial', 392, 3));
    // tunnel dressing: cables, pipes, drips, red lamps, the odd suitcase
    for (let x = x0 + 2; x <= x1 - 6; x += 9) {
      if (x >= hx0 - 1 && x <= hx1 + 1) continue;
      this.addProp(this.rand(x) > 0.5 ? 'cable_bundle' : 'pipe_run', x, floor - 3, { scale: 1, behind: true, wall: true, offsetY: -6 });
      if (this.rand(x * 3) < 0.45) this.lamp((x + 0.5) * CONFIG.TILE, (floor - 3.4) * CONFIG.TILE, { radius: 120, strength: 0.55, color: 'red', mode: 'emergency', flicker: 0.5, fixture: 'emergency' });
      if (this.rand(x * 5) < 0.5) this.emitter('drip', (x + 1.5) * CONFIG.TILE, (floor - 4) * CONFIG.TILE);
      if (this.rand(x * 7) < 0.3) this.floorProp(['trash_bags', 'papers', 'suitcases', 'rubble_pile'][Math.floor(this.rand(x * 11) * 4)], x + 3, floor, { scale: 1 });
    }
    for (let x = hx0 + 4; x <= hx1 - 4; x += 14) this.emitter('drip', x * CONFIG.TILE, (top) * CONFIG.TILE);
    this.emitter('dust', 440 * CONFIG.TILE, 88 * CONFIG.TILE, { w: 60 * CONFIG.TILE });
    const s = this.register('Estação Central (metrô)', 'metro', x0, x1 - x0, floor, 'underground', { underground: true, yTop: 76, yBottom: floor + 2 });
    s.spawns = [[430, floor, 'civilian'], [462, floor, 'civilian'], [495, floor, 'worker'], [450, 85, 'civilian']];
  }

  // Storm drain from Cedar Row down into the metro's west tunnel.
  makeDrainage() {
    const w = this.world;
    const mx = this.drainX || 315;
    const floor = 93;
    this.plan('drainage', mx);
    // manhole shaft from the street
    const sy = w.surface[mx];
    for (let y = sy; y <= floor - 1; y++) { w.set(mx, y, TILE.LADDER); w.setWall(mx, y, TILE.WET_CONCRETE); }
    // the culvert itself: 3 tall, wet, running east to the metro
    w.digTunnel(mx - 4, 372, floor - 1, 3, TILE.WET_CONCRETE, TILE.MUD);
    for (let x = mx - 4; x <= 372; x++) {
      for (let y = floor - 3; y <= floor - 1; y++) w.setWall(x, y, x % 11 < 2 ? TILE.MOSS_STONE : TILE.WET_CONCRETE);
      if (x % 7 === 0) w.set(x, floor, TILE.WET_CONCRETE);
    }
    // a second way up, between Cedar Row and the corner house
    const up = 364;
    const uy = w.surface[up];
    for (let y = uy; y <= floor - 1; y++) { w.set(up, y, TILE.LADDER); w.setWall(up, y, TILE.WET_CONCRETE); }
    for (let x = mx; x <= 370; x += 6) {
      this.emitter('drip', (x + 0.5) * CONFIG.TILE, (floor - 3) * CONFIG.TILE);
      if (this.rand(x) < 0.5) this.addProp('pipe_run', x, floor - 2, { scale: 1, behind: true, wall: true, offsetY: -4 });
      if (this.rand(x * 3) < 0.35) this.floorProp(['trash_bags', 'bottles', 'papers'][Math.floor(this.rand(x * 5) * 3)], x + 2, floor, { scale: 1 });
    }
    this.emitter('flies', (mx + 20) * CONFIG.TILE, (floor - 1) * CONFIG.TILE);
    this.addContainer('Grade entupida', mx + 26, floor - 1, 'scraps', this.loot('scraps', mx * 3, 2));
    // someone's hideout behind a cracked wall
    if (this.chance(mx * 7, 0.6)) this.secretRoom(mx - 9, mx - 6, floor, 3, { sealSide: 'right', seal: TILE.DAMAGED_BRICK, wall: TILE.WET_CONCRETE, backWall: TILE.OLD_CONCRETE, label: 'Abrigo no bueiro', props: ['bedroll', 'candles', 'water_jugs'] });
    else this.hookSecret('drain_hideout', mx - 6, floor);
    const s = this.register('Galeria de drenagem', 'drainage', mx - 4, 372 - mx + 4, floor, 'underground', { underground: true, yTop: 84, yBottom: floor + 2 });
    s.spawns = [[mx + 30, floor, 'civilian']];
  }

  // A second underground layer: an abandoned shopping concourse below the
  // station, deliberately dense with storefronts and technical routes.
  makeUndergroundMall() {
    const w = this.world, floor = 112, x0 = 402, x1 = 488;
    this.plan('underground_mall', x0);
    this.vault(x0, x1, floor - 7, floor - 1, TILE.OLD_CONCRETE, TILE.STATION_TILE, TILE.CHECKER_FLOOR);
    for (let y = 93; y <= floor - 1; y++) { w.set(418, y, TILE.LADDER); w.set(474, y, TILE.LADDER); }
    for (const sx of [420, 438, 456, 476]) for (let y = floor - 6; y <= floor - 2; y++) if (y < floor - 3) w.set(sx, y, TILE.OLD_BRICK);
    const rooms = [
      [{x0:403,x1:418,floorY:floor,ceilY:floor-8}, 'kiosk'],
      [{x0:421,x1:437,floorY:floor,ceilY:floor-8}, 'market_floor'],
      [{x0:439,x1:455,floorY:floor,ceilY:floor-8}, 'office'],
      [{x0:457,x1:475,floorY:floor,ceilY:floor-8}, 'laundry'],
      [{x0:477,x1:487,floorY:floor,ceilY:floor-8}, 'maintenance']
    ];
    for (const [room, theme] of rooms) { this.furnish(room, theme, { scale: 1 }); this.lightRoom(room, 'fluoro'); }
    this.addContainer('Quiosque saqueado', 410, floor - 2, 'market', this.loot('market', 2601, 3));
    this.addContainer('Ferragens subterrâneas', 430, floor - 2, 'hardware', this.loot('hardware', 2602, 5, { guaranteed: true }), { rare: true });
    this.addContainer('Administração da galeria', 448, floor - 2, 'office', this.loot('office', 2603, 4));
    this.addContainer('Lavanderia abandonada', 466, floor - 2, 'apartment', this.loot('apartment', 2604, 4));
    this.addContainer('Sala técnica da galeria', 482, floor - 2, 'rooftop', this.loot('rooftop', 2605, 4, { guaranteed: true }), { rare: true });
    this.addPoint('light_switch', 472, floor - 2, { name: 'Luzes da galeria subterrânea', state: 'off', area: 'Galeria Subterrânea Central' });
    this.addPoint('fuse_panel', 484, floor - 2, { name: 'Quadro da galeria subterrânea', state: 'off', area: 'Galeria Subterrânea Central' });
    this.addPoint('alarm', 432, floor - 3, { name: 'Alarme da galeria', state: 'off', area: 'Galeria Subterrânea Central' });
    for (let x = x0 + 5; x < x1 - 4; x += 12) { this.emitter('drip', x * CONFIG.TILE, (floor - 7) * CONFIG.TILE); if (x % 24) this.emitter('draft', x * CONFIG.TILE, (floor - 4) * CONFIG.TILE); }
    w.undergroundZones.push({ name:'Galeria Subterrânea Central', kind:'underground_mall', x1:x0, x2:x1, y1:floor-9, y2:floor+2 });
    const s = this.register('Galeria Subterrânea Central', 'underground_mall', x0, x1-x0, floor, 'underground', { underground:true, y1:floor-9, y2:floor+2 });
    s.spawns = [[426, floor, 'civilian'], [458, floor, 'civilian'], [482, floor, 'worker']];
  }

  // Locked technical level under the mall. The restored maintenance key has a
  // real purpose again and the metro now has a deeper exploration loop.
  makeMaintenanceGalleries() {
    const w = this.world, floor = 134, x0 = 420, x1 = 520;
    this.plan('maintenance', x0);
    this.vault(x0, x1, floor - 6, floor - 1, TILE.RUST_METAL, TILE.TECH_WALL, TILE.INDUSTRIAL_FLOOR);
    for (let y = 112; y <= floor - 1; y++) { w.set(428, y, TILE.LADDER); w.set(500, y, TILE.LADDER); }
    for (const sx of [446, 474, 504]) for (let y = floor - 5; y <= floor - 2; y++) if (y < floor - 3) w.set(sx, y, TILE.WALL_PANEL);
    this.addDoor(446, floor - 1, { name:'Sala de manutenção', locked:true, keyItem:'maintenance_key', forceTool:'crowbar', integrity:7, area:'Galerias de Manutenção' });
    this.addPoint('key_hook', 414, 109, { name:'Chaves da manutenção', grants:'maintenance_key', area:'Galeria Subterrânea Central' });
    const a={x0:421,x1:445,floorY:floor,ceilY:floor-7}, b={x0:447,x1:473,floorY:floor,ceilY:floor-7}, c={x0:475,x1:503,floorY:floor,ceilY:floor-7};
    this.furnish(a,'maintenance',{scale:1}); this.furnish(b,'power',{scale:1}); this.furnish(c,'storage',{scale:1});
    this.lightRoom(a,'emergency'); this.lightRoom(b,'fluoro'); this.lightRoom(c,'emergency');
    this.addContainer('Armário dos eletricistas', 440, floor - 2, 'industrial', this.loot('industrial', 2991, 5, { guaranteed:true }), { rare:true });
    this.addContainer('Depósito subterrâneo', 488, floor - 2, 'mining', this.loot('mining', 2992, 5, { guaranteed:true }), { rare:true });
    this.addContainer('Peças do painel', 512, floor - 2, 'hardware', this.loot('hardware', 2993, 4));
    this.addPoint('light_switch', 492, floor - 2, { name:'Luzes da manutenção', state:'off', area:'Galerias de Manutenção' });
    this.addPoint('fuse_panel', 496, floor - 2, { name:'Quadro da manutenção', state:'off', area:'Galerias de Manutenção' });
    for (let x=x0+6;x<x1-4;x+=14) { this.addProp('pipe_run',x,floor-4,{scale:1,behind:true,wall:true,offsetY:-6}); this.emitter('drip',x*CONFIG.TILE,(floor-5)*CONFIG.TILE); }
    w.undergroundZones.push({ name:'Galerias de Manutenção', kind:'maintenance', x1:x0, x2:x1, y1:floor-8, y2:floor+2 });
    const s=this.register('Galerias de Manutenção','maintenance',x0,x1-x0,floor,'underground',{underground:true,y1:floor-8,y2:floor+2});
    s.spawns=[[452,floor,'worker'],[486,floor,'worker'],[514,floor,'worker']];
  }

  // The quarry already has a rich upper mine in Stage 20; this restores the
  // missing deep expedition level and ties the ore economy back into it.
  makeDeepMine() {
    const w=this.world, floor=154, x0=806, x1=854;
    this.plan('mine', x0);
    this.vault(x0,x1,floor-6,floor-1,TILE.SLATE,TILE.WET_STONE,TILE.GRAVEL);
    for (let y=126;y<=floor-1;y++) { w.set(846,y,TILE.LADDER); w.setWall(846,y,TILE.DARK_STONE); }
    for (let x=x0+4;x<x1-3;x+=7) {
      this.addProp('mine_support',x,floor-1,{scale:1.35,behind:true});
      if (x%14===0) { this.ceilProp('lantern',x+2,floor-6,floor,{scale:1}); this.lamp((x+2.5)*CONFIG.TILE,(floor-3)*CONFIG.TILE,{radius:145,strength:.68,mode:'always',flicker:.22,fixture:'lantern'}); }
    }
    this.floorProp('ore_cart',826,floor,{scale:1});
    this.floorProp('ore_cart',840,floor,{scale:.9,flip:true});
    for (const [tx,tile] of [[812,TILE.COAL_ORE],[816,TILE.IRON_ORE],[833,TILE.COPPER_ORE],[850,TILE.QUARTZ_ORE]]) {
      for (let y=floor-5;y<=floor-3;y++) w.set(tx,y,tile);
    }
    this.addContainer('Carrinho dos mineiros',828,floor-2,'mining',this.loot('mining',3201,6,{guaranteed:true}),{rare:true});
    this.addContainer('Armário do turno',844,floor-2,'mining',this.loot('mining',3202,5));
    this.addContainer('Caixa de segurança mineral',814,floor-2,'mining',this.loot('mining',3203,5,{guaranteed:true}),{rare:true});
    this.emitter('dust',830*CONFIG.TILE,(floor-4)*CONFIG.TILE,{w:18*CONFIG.TILE});
    this.emitter('drip',848*CONFIG.TILE,(floor-5)*CONFIG.TILE);
    w.undergroundZones.push({name:'Mina Profunda Westline',kind:'mine',x1:x0,x2:x1,y1:floor-8,y2:floor+2});
    const s=this.register('Mina Profunda Westline','mine',x0,x1-x0,floor,'underground',{underground:true,y1:floor-8,y2:floor+2});
    s.spawns=[[818,floor,'worker'],[836,floor,'worker'],[850,floor,'worker']];
  }

  /* ----------------------------------------------------- world dressing */

  inStructure(x, margin = 2) {
    return this.structures.some(s => !s.underground && x >= s.x - margin && x <= s.endX + margin);
  }

  decorateWorld() {
    const w = this.world;

    for (let x = 48; x < 920; x += 13) {
      if (this.inStructure(x, 1)) continue;
      this.addGroundProp('power_pole', x, { scale: 0.9, behind: true });
    }

    const roadside = [
      ['road_sign', 52], ['bus_stop', 168], ['road_barrier', 200], ['warning_sign', 240],
      ['street_bench', 296], ['traffic_cone', 340], ['road_barrier', 396], ['wrecked_car', 440],
      ['warning_sign', 500], ['traffic_cone', 548], ['rubble_pile', 590], ['road_sign', 660],
      ['warning_sign', 676], ['road_barrier', 700], ['wrecked_car', 780], ['warning_sign', 856]
    ];
    for (const [asset, x] of roadside) {
      if (this.inStructure(x)) continue;
      this.addGroundProp(asset, x, { scale: 0.85 });
    }

    // Stage 20: each region dresses the ground between buildings its own way
    const dressing = {
      coldwood: [['pine_tree', 0.08, 1], ['birch_tree', 0.05, 1], ['fern', 0.16, 0], ['mushrooms', 0.06, 0], ['boulder', 0.04, 0], ['fallen_log', 0.04, 0], ['stump', 0.04, 0], ['bush', 0.06, 0]],
      pasture: [['wildflowers', 0.14, 0], ['bush', 0.05, 0], ['hay_bale', 0.03, 0], ['boulder', 0.02, 0], ['birch_tree', 0.02, 1], ['fern', 0.03, 0]],
      roadside: [['bush', 0.06, 0], ['wildflowers', 0.07, 0], ['trash_can', 0.02, 0], ['tire_pile', 0.02, 0], ['boulder', 0.02, 0], ['dead_tree', 0.02, 1], ['pine_tree', 0.03, 1]],
      crossing: [['trash_bags', 0.04, 0], ['tire_pile', 0.03, 0], ['wildflowers', 0.05, 0], ['traffic_cone', 0.03, 0], ['bush', 0.04, 0]],
      cedar: [['bush', 0.07, 0], ['garden_bed', 0.04, 0], ['trash_bags', 0.03, 0], ['fire_hydrant', 0.02, 0], ['bicycle', 0.015, 0], ['wildflowers', 0.03, 0]],
      downtown: [['trash_bags', 0.07, 0], ['newspaper_box', 0.03, 0], ['papers', 0.07, 0], ['planter', 0.03, 0], ['trash_can', 0.03, 0], ['street_bench', 0.02, 0]],
      civic: [['bush', 0.05, 0], ['planter', 0.03, 0], ['trash_can', 0.03, 0], ['papers', 0.04, 0], ['bicycle', 0.015, 0]],
      dustbowl: [['dead_tree', 0.04, 1], ['boulder', 0.05, 0], ['tire_pile', 0.03, 0], ['scrap_heap', 0.02, 0], ['wildflowers', 0.03, 0], ['reeds', 0.03, 0]],
      westline: [['pallet', 0.05, 0], ['oil_drum', 0.04, 0], ['hazard_barrel', 0.02, 0], ['cable_spool', 0.02, 0], ['scrap_heap', 0.03, 0], ['tire_pile', 0.02, 0], ['gas_cylinders', 0.01, 0]],
      ridge: [['pine_tree', 0.08, 1], ['boulder', 0.08, 0], ['fern', 0.06, 0], ['birch_tree', 0.03, 1], ['stump', 0.03, 0]],
      blackridge: [['warning_sign', 0.03, 0], ['hazard_barrel', 0.03, 0], ['boulder', 0.02, 0], ['dead_tree', 0.03, 1]]
    };
    for (let x = 4; x < CONFIG.WORLD_W - 4; x += 2) {
      if (this.inStructure(x, 1)) continue;
      const region = w.region(x);
      const table = dressing[region.id] || [];
      let r = this.rand(x * 313);
      for (const [asset, p, back] of table) {
        if (r < p) {
          const big = asset.endsWith('_tree');
          this.addGroundProp(asset, x, { scale: big ? 0.85 + this.rand(x) * 0.35 : 0.85 + this.rand(x) * 0.25, behind: Boolean(back), flip: this.rand(x * 7) > 0.5, anim: big || asset === 'fern' || asset === 'reeds' || asset === 'wildflowers' ? 'sway' : null });
          break;
        }
        r -= p;
      }
      if (x % 3 === 0 && this.rand(x * 97) < 0.12 && (region.id === 'coldwood' || region.id === 'ridge')) {
        const y = w.surface[x];
        if (w.get(x, y) === TILE.GRASS || w.get(x, y) === TILE.WET_GRASS) w.set(x, y, TILE.LEAF_LITTER);
        else if (w.get(x, y + 2) === TILE.STONE) w.set(x, y + 2, TILE.MOSS_STONE);
      }
    }

    // reeds along the creeks
    for (const c of w.creeks || []) {
      for (let dx = -2; dx <= 2; dx += 2) this.addGroundProp('reeds', c.x + dx - (c.width || 0), { scale: 1, anim: 'sway' });
    }

    // towns: street lights (a few still sputter), abandoned cars, bins, signals
    const tints = ['#8a4a3a', '#4a6a8a', '#b9b4a2', '#6a7a5a', '#3a3d40', '#7a6a4a'];
    for (let x = 300; x < 600; x += 9) {
      const region = w.region(x).id;
      if (region !== 'cedar' && region !== 'downtown' && region !== 'civic') continue;
      if (this.inStructure(x, 0)) continue;
      const y = w.groundY(x) - 1;
      this.addProp('lamp_post', x, y, { scale: 1, behind: true });
      const alive = this.rand(x * 29) < 0.28;
      this.lamp((x + 0.4) * CONFIG.TILE, (y - 1.4) * CONFIG.TILE, { radius: 220, strength: 0.85, color: 'warm', mode: alive ? 'night' : 'street', flicker: alive ? 0.7 : 0.2, owner: null, fixture: 'bulb' });
    }
    for (let x = 60; x < 900; x += 23) {
      if (this.inStructure(x, 1)) continue;
      const region = w.region(x).id;
      if (region === 'coldwood' || region === 'ridge' || region === 'blackridge') continue;
      if (this.rand(x * 41) > 0.5) continue;
      const wreck = this.rand(x * 43) < 0.4;
      this.addGroundProp(wreck ? 'wrecked_car' : 'parked_car', x, { scale: 1, behind: true, flip: this.rand(x) > 0.5, tint: wreck ? null : tints[Math.floor(this.rand(x * 3) * tints.length)] });
      if (this.rand(x * 47) < 0.35) this.addContainer('Porta-luvas', x + 1, w.groundY(x + 1) - 2, 'garage', this.loot('garage', x * 5, 2));
    }
    for (const [asset, x] of [['traffic_light', 397], ['traffic_light', 470], ['traffic_light', 498], ['phone_booth', 390], ['phone_booth', 541],
      ['billboard', 242], ['billboard', 598], ['billboard', 684], ['mailbox_cluster', 366], ['newspaper_box', 469], ['bus_stop', 507]]) {
      if (this.inStructure(x, 0) && asset !== 'traffic_light') continue;
      this.addGroundProp(asset, x, { scale: 1, behind: true });
    }
    // survivors' burning barrels: warm light and smoke to walk toward at night
    for (const x of [58, 180, 386, 652, 787, 857]) {
      const y = w.groundY(x) - 1;
      this.addProp('burning_barrel', x, y, { scale: 1 });
      this.lamp((x + 0.5) * CONFIG.TILE, (y - 0.4) * CONFIG.TILE, { radius: 210, strength: 0.95, mode: 'always', flicker: 0.35, owner: null, fixture: 'fire' });
      this.emitter('smoke', (x + 0.5) * CONFIG.TILE, (y - 0.3) * CONFIG.TILE, { owner: null });
      this.emitter('embers', (x + 0.5) * CONFIG.TILE, (y - 0.2) * CONFIG.TILE, { owner: null });
    }
    // industrial stacks keep smoking
    for (const x of [704, 736, 768]) this.emitter('smoke', x * CONFIG.TILE, (w.groundY(x) - 12) * CONFIG.TILE, { owner: null, rate: 0.6 });

    // the ravine floor: worth the climb down
    for (const r of w.ravines) {
      const floor = w.groundY(r.centerX) - 1;
      this.addProp('wrecked_car', r.centerX - 4, floor, { scale: 0.85 });
      this.addProp('rubble_pile', r.centerX + 3, floor, { scale: 0.8 });
      this.addContainer('Destroços no fundo', r.centerX - 3, floor - 1, 'garage',
        this.loot('garage', r.centerX, 4, { guaranteed: true }), { rare: true });
      this.addPoint('firepit', r.centerX + 1, floor, { name: 'Fogueira improvisada', state: 'cold' });
      this.addProp('fern', r.centerX - 7, floor, { scale: 1 });
      this.addProp('boulder', r.centerX + 6, floor, { scale: 1 });
      this.emitter('drip', r.centerX * CONFIG.TILE, (floor - 8) * CONFIG.TILE, { owner: null });
    }

    // cave mouths get a marker so they read as enterable
    for (const mouth of w.caveMouths.slice(0, 12)) {
      this.addProp('rubble_pile', mouth.x + 2, mouth.y - 1, { scale: 0.75 });
      this.addPoint('cave_mouth', mouth.x, mouth.y - 1, { name: 'Entrada de caverna' });
      this.addProp('mushrooms', mouth.x - 1, w.groundY(mouth.x - 1) - 1, { scale: 1 });
    }
  }

  /* ------------------------------------------------------------ queries */

  // The structure a tile belongs to. Underground places win below ground;
  // a building's footprint only counts down to its cellar.
  structureAt(tileX, tileY = null, margin = 2) {
    if (tileY != null) {
      for (const s of this.structures) {
        if (s.underground && tileX >= s.x - 1 && tileX <= s.endX + 1 && tileY >= s.yTop && tileY <= s.yBottom) return s;
      }
    }
    for (const s of this.structures) {
      if (s.underground) continue;
      if (tileX < s.x - margin || tileX > s.endX + margin) continue;
      if (tileY != null && tileY > s.groundY + (s.depth || 12)) continue;
      return s;
    }
    return null;
  }

  areaAt(tileX, tileY = null) {
    const s = this.structureAt(tileX, tileY);
    if (s) return s.name;
    return this.world.region(tileX).name;
  }

  nearestContainer(player, reachTiles = CONFIG.INTERACT_REACH) {
    const c = player.center();
    let nearest = null, best = reachTiles * CONFIG.TILE;
    for (const box of this.containers) {
      const d = Math.hypot(c.x - (box.x + box.width / 2), c.y - (box.y + box.height / 2));
      if (d <= best) { nearest = box; best = d; }
    }
    return nearest;
  }

  /* ------------------------------------------------ Stage 20: runtime */

  // Props, lamps and emitters are bucketed by 16-tile column so drawing and
  // ambience only ever touch what is near the camera.
  signature() { return this.props.length + this.lamps.length * 7919 + this.emitters.length * 104729; }

  rebuildBuckets() {
    const B = new Map();
    const put = (key, list, item) => {
      let b = B.get(key);
      if (!b) { b = { back: [], front: [], lamps: [], emitters: [] }; B.set(key, b); }
      b[list].push(item);
    };
    for (const p of this.props) put(p.tileX >> 4, p.behind ? 'back' : 'front', p);
    for (const l of this.lamps) put(Math.floor(l.x / CONFIG.TILE) >> 4, 'lamps', l);
    for (const e of this.emitters) put(Math.floor(e.x / CONFIG.TILE) >> 4, 'emitters', e);
    this.propBuckets = B;
    this.bucketCount = this.signature();
  }

  visibleBuckets(cameraX, viewW) {
    if (!this.propBuckets || this.signature() !== this.bucketCount) this.rebuildBuckets();
    const b0 = Math.floor(cameraX / CONFIG.TILE / 16) - 1;
    const b1 = Math.floor((cameraX + viewW) / CONFIG.TILE / 16) + 1;
    const out = [];
    for (let k = b0; k <= b1; k++) { const b = this.propBuckets.get(k); if (b) out.push(b); }
    return out;
  }

  lampOn(l, daylight) {
    const o = l.owner;
    switch (l.mode) {
      case 'always': return true;
      case 'night': return daylight < 0.55;
      case 'power': return Boolean(o && (o.powered || o.surge > 0));
      case 'emergency': return Boolean(o && !o.powered && (o.alert > 0 || o.emergencyLights));
      case 'alert': return Boolean(o && o.alert > 0);
      case 'street': return daylight < 0.5 && this.streetSurge > 0;
      default: return false;
    }
  }

  lampLevel(l, t) {
    let f = 1;
    if (l.flicker) {
      const n = Math.sin(t * 13 + l.phase) * Math.sin(t * 7.3 + l.phase * 2);
      f = n > 1 - l.flicker * 0.55 ? 0.12 : 1 - l.flicker * 0.18 * Math.abs(Math.sin(t * 3 + l.phase));
    }
    const o = l.owner;
    if (o && o.flicker > 0 && l.mode === 'power') f *= Math.sin(t * 37 + l.phase) > 0.1 ? 1 : 0.08;
    if (l.mode === 'alert' || (l.mode === 'emergency' && o && o.alert > 0)) f *= 0.5 + 0.5 * Math.abs(Math.sin(t * 4 + l.phase));
    return f;
  }

  collectLights(lighting, cameraX, cameraY, viewW, viewH, daylight) {
    const t = this.time;
    for (const b of this.visibleBuckets(cameraX, viewW)) {
      for (const l of b.lamps) {
        if (l.y < cameraY - 260 || l.y > cameraY + viewH + 260) continue;
        if (!this.lampOn(l, daylight)) continue;
        const f = this.lampLevel(l, t);
        if (f < 0.2) continue;
        lighting.addLight(l.x, l.y, l.radius * (0.86 + f * 0.14), l.strength * f, l.color === 'warm' ? 1 : 0.1, l.color);
      }
    }
  }

  // Which structure the player is in; first visits and secret rooms.
  visit(tileX, tileY) {
    const s = this.structureAt(tileX, tileY, 0);
    let fresh = null, secret = null;
    if (s !== this.current) {
      if (s) {
        s.visits++;
        if (!s.discovered) { s.discovered = true; fresh = s; }
      }
      this.current = s;
    }
    for (const st of this.structures) {
      for (const r of st.secretRooms || []) {
        if (!r.realized || r.found) continue;
        if (tileX >= r.x0 && tileX <= r.x1 && tileY >= r.y0 - 1 && tileY <= r.y1 + 1) { r.found = true; secret = r; }
      }
    }
    return { structure: s, fresh, secret };
  }

  // Emitters near the camera, region ambience, glowing particles.
  updateAmbience(dt, fx, camera, viewW, viewH, env = {}) {
    this.time += dt;
    this.wind = env.wind ?? 0.3;
    if (this.streetSurge > 0) this.streetSurge -= dt;
    for (const s of this.structures) {
      if (env.poweredAreas) s.powered = env.poweredAreas.has(s.name);
      if (s.alert > 0) s.alert = Math.max(0, s.alert - dt);
      if (s.surge > 0) s.surge -= dt;
      if (s.flicker > 0) s.flicker -= dt;
    }
    for (const b of this.visibleBuckets(camera.x, viewW)) {
      for (const e of b.emitters) {
        if (e.y < camera.y - 140 || e.y > camera.y + viewH + 140) continue;
        e.timer -= dt * e.rate;
        if (e.timer > 0) continue;
        this.emit(e, fx);
      }
    }

    // region ambience around the camera
    const R = Math.random;
    this.ambTimer = (this.ambTimer || 0) - dt;
    if (this.ambTimer <= 0) {
      this.ambTimer = 0.12 + R() * 0.2;
      const x = camera.x + R() * viewW;
      const tx = Math.floor(x / CONFIG.TILE);
      const region = this.world.region(tx).id;
      const ground = this.world.surface[Math.max(0, Math.min(CONFIG.WORLD_W - 1, tx))] * CONFIG.TILE;
      const night = (env.daylight ?? 1) < 0.4;
      if (env.underground) {
        fx.particle(camera.x + R() * viewW, camera.y + R() * viewH, { vx: (R() - 0.5) * 5, vy: (R() - 0.5) * 3, life: 3, size: 1 + R(), color: '#b9ae90', alpha: 0.28, kind: 'circle', drag: 1 });
      } else if (night && (region === 'coldwood' || region === 'pasture' || region === 'roadside' || region === 'ridge') && this.glows.length < 46 && !(env.rain > 0.3)) {
        this.glows.push({ x, y: ground - 20 - R() * 110, vx: (R() - 0.5) * 16, vy: (R() - 0.5) * 8, life: 3 + R() * 3, max: 5, color: '210,240,120', size: 1.4, firefly: true });
      } else if (!night && region === 'pasture' && R() < 0.5) {
        fx.particle(x, ground - 10 - R() * 60, { vx: 6 + R() * 10, vy: -3 - R() * 4, life: 3, size: 1.2, color: '#e8e0b0', alpha: 0.5, kind: 'circle', drag: 1 });
      } else if (region === 'downtown' && R() < 0.35 + (env.wind || 0) * 0.3) {
        fx.particle(camera.x - 10, ground - 8 - R() * 30, { vx: 40 + (env.wind || 0) * 80, vy: -8 + R() * 6, gravity: 12, life: 4.5, size: 3, color: '#cfc8b0', alpha: 0.7, spin: (R() - 0.5) * 9 });
      } else if (region === 'westline' && R() < 0.6) {
        fx.particle(x, ground - 40 - R() * 140, { vx: 10 + R() * 12, vy: -2, life: 4, size: 3 + R() * 4, color: '#6a6660', alpha: 0.12, kind: 'circle', drag: 1 });
      } else if (region === 'coldwood' && !night && R() < 0.25) {
        fx.particle(x, ground - 4 - R() * 20, { vx: 8 + R() * 6, vy: -1, life: 5, size: 8 + R() * 8, color: '#d8dccf', alpha: 0.07, kind: 'circle', drag: 1 });
      }
    }
    this.interference = env.region === 'blackridge' ? (env.underground ? 0.9 : 0.4) : Math.max(0, (this.interference || 0) - dt);

    for (let i = this.glows.length - 1; i >= 0; i--) {
      const g = this.glows[i];
      g.life -= dt;
      if (g.firefly) { g.vx += (R() - 0.5) * 40 * dt; g.vy += (R() - 0.5) * 30 * dt; }
      else g.vy += 14 * dt;
      g.x += g.vx * dt; g.y += g.vy * dt;
      if (g.life <= 0) this.glows.splice(i, 1);
    }
  }

  emit(e, fx) {
    const r = Math.random;
    switch (e.kind) {
      case 'drip':
        e.timer = 0.7 + r() * 2.4;
        fx.particle(e.x + (r() - 0.5) * 24, e.y + 3, { vy: 30, gravity: 620, life: 0.9, size: 2, color: '#8fb3c2', alpha: 0.8, drag: 1 });
        break;
      case 'steam':
        e.timer = 0.25 + r() * 0.45;
        fx.particle(e.x + (r() - 0.5) * 8, e.y, { vx: (r() - 0.5) * 8, vy: -16 - r() * 12, life: 2.2, size: 4 + r() * 4, color: '#c9cfd2', alpha: 0.16, kind: 'circle', drag: 0.99 });
        break;
      case 'smoke':
        e.timer = 0.3 + r() * 0.5;
        fx.particle(e.x + (r() - 0.5) * 6, e.y, { vx: 3 + r() * 8 + (this.wind || 0) * 20, vy: -15 - r() * 10, life: 3.6, size: 5 + r() * 6, color: '#55524c', alpha: 0.22, kind: 'circle', drag: 0.995 });
        break;
      case 'dust':
        e.timer = 0.3 + r() * 0.6;
        fx.particle(e.x + r() * (e.w || 64), e.y - r() * 64, { vx: (r() - 0.5) * 6, vy: (r() - 0.5) * 4, life: 3 + r() * 2, size: 1 + r() * 1.5, color: '#c9b999', alpha: 0.35, kind: 'circle', drag: 1 });
        break;
      case 'flies':
        e.timer = 0.12 + r() * 0.25;
        fx.particle(e.x + (r() - 0.5) * 30, e.y - r() * 22, { vx: (r() - 0.5) * 70, vy: (r() - 0.5) * 50, life: 0.35, size: 1.5, color: '#141412', alpha: 0.85, drag: 0.9 });
        break;
      case 'draft':
        e.timer = 0.5 + r() * 1.2;
        fx.particle(e.x, e.y + (r() - 0.5) * 26, { vx: (r() - 0.5) * 34, vy: -5, life: 1.6, size: 1.4, color: '#c9c2a8', alpha: 0.45, kind: 'circle', drag: 0.98 });
        break;
      case 'sparks':
        e.timer = 1.5 + r() * 4;
        for (let i = 0; i < 5; i++) fx.particle(e.x, e.y, { vx: (r() - 0.5) * 120, vy: -40 - r() * 60, gravity: 420, life: 0.5, size: 1.5, color: '#f2d06a', drag: 0.97 });
        break;
      case 'embers':
        e.timer = 0.18 + r() * 0.4;
        if (this.glows.length < 80) this.glows.push({ x: e.x + (r() - 0.5) * 10, y: e.y, vx: (r() - 0.5) * 12 + (this.wind || 0) * 10, vy: -30 - r() * 30, life: 1.5, max: 1.5, color: '255,150,60', size: 1.6 });
        break;
      default: e.timer = 5;
    }
  }

  /* ------------------------------------------------------------ drawing */

  propImage(p) {
    const img = ASSETS.ready(`decor:${p.asset}`);
    if (!img || !p.tint) return img;
    this.tintCache = this.tintCache || new Map();
    const key = p.asset + p.tint;
    let c = this.tintCache.get(key);
    if (c) return c;
    c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(img, 0, 0);
    cx.globalCompositeOperation = 'source-atop';
    cx.globalAlpha = 0.4;
    cx.fillStyle = p.tint;
    cx.fillRect(0, 0, c.width, c.height);
    this.tintCache.set(key, c);
    return c;
  }

  drawProp(ctx, p, cameraX, cameraY) {
    const img = this.propImage(p);
    if (!img) return;
    const scale = p.scale || 1;
    const w = img.width * scale, h = img.height * scale;
    const x = p.tileX * CONFIG.TILE - cameraX + p.offsetX;
    const bottom = (p.tileY + 1) * CONFIG.TILE - cameraY + p.offsetY;
    if (x + w < -80 || x > ctx.canvas.width + 80 || bottom < -100 || bottom - h > ctx.canvas.height + 100) return;

    let rot = p.tilt || 0;
    if (p.anim === 'sway') rot += Math.sin(this.time * 1.6 + p.phase) * 0.03 * (0.4 + (this.wind || 0.3) * 1.4);
    let shakeX = 0;
    if (p.anim === 'shake') shakeX = Math.sin(this.time * 55 + p.phase) * 1.5;
    ctx.save();
    ctx.globalAlpha = p.alpha ?? 1;
    ctx.imageSmoothingEnabled = false;
    if (!p.wall) {
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, bottom - 1, Math.max(6, w * 0.4), Math.max(2, h * 0.06), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.translate(Math.round(x + w / 2 + shakeX), Math.round(bottom));
    if (rot) ctx.rotate(rot);
    if (p.flip) ctx.scale(-1, 1);
    ctx.drawImage(img, Math.round(-w / 2), Math.round(-h), Math.round(w), Math.round(h));
    ctx.restore();
  }

  drawBackProps(ctx, cameraX, cameraY) {
    for (const b of this.visibleBuckets(cameraX, ctx.canvas.width)) for (const p of b.back) this.drawProp(ctx, p, cameraX, cameraY);
  }

  drawDecorations(ctx, cameraX, cameraY) {
    for (const b of this.visibleBuckets(cameraX, ctx.canvas.width)) for (const p of b.front) this.drawProp(ctx, p, cameraX, cameraY);

    for (const box of this.containers) {
      const x = box.x - cameraX, y = box.y - cameraY;
      if (x + box.width < -20 || x > ctx.canvas.width + 20 || y < -40 || y > ctx.canvas.height + 40) continue;
      const empty = !box.loot.length;
      const fill = box.category === 'medical' || box.category === 'pharmacy' ? '#8d6f70'
        : box.category === 'market' || box.category === 'gas' ? '#8c744c'
        : box.category === 'workshop' || box.category === 'tools' || box.category === 'garage' ? '#5f6a71'
        : box.category === 'corpse' ? '#6a5a52' : '#795d46';
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.24)';
      ctx.beginPath();
      ctx.ellipse(x + box.width / 2, y + box.height + 1, box.width * 0.55, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = box.discovered && empty ? 0.5 : 1;
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, box.width, box.height);
      ctx.fillStyle = 'rgba(255,255,255,.1)';
      ctx.fillRect(x + 1, y + 1, box.width - 2, 3);
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.fillRect(x + 1, y + box.height - 3, box.width - 2, 2);
      ctx.strokeStyle = '#25221f';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, box.width - 2, box.height - 2);
      ctx.fillStyle = box.discovered ? 'rgba(180,172,150,.4)' : 'rgba(226,214,178,.75)';
      ctx.fillRect(x + 5, y + 6, box.width - 10, 3);
      // untouched rare stashes carry a small brass catch
      ctx.fillStyle = box.rare && !box.discovered ? '#d8b268' : '#b9a46d';
      ctx.fillRect(x + box.width / 2 - 2, y + box.height / 2, 4, 4);
      ctx.restore();
    }
  }

  // Additive pass after lighting: bulbs, tubes, fire, neon, fireflies, embers.
  drawGlows(ctx, cameraX, cameraY, daylight) {
    const t = this.time;
    const dark = Math.max(0, 1 - daylight);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const b of this.visibleBuckets(cameraX, ctx.canvas.width)) {
      for (const l of b.lamps) {
        if (!l.fixture || !this.lampOn(l, daylight)) continue;
        const f = this.lampLevel(l, t);
        if (f < 0.2) continue;
        const x = l.x - cameraX, y = l.y - cameraY;
        if (x < -60 || x > ctx.canvas.width + 60 || y < -60 || y > ctx.canvas.height + 60) continue;
        const col = l.color === 'red' ? '255,72,52' : l.color === 'cold' ? '196,228,255' : '255,194,112';
        const r = l.fixture === 'fire' ? 30 : l.fixture === 'tube' ? 24 : l.fixture === 'neon' ? 28 : l.fixture === 'emergency' ? 18 : 14;
        const a = (0.14 + dark * 0.42) * f;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${col},${a.toFixed(3)})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        if (l.fixture === 'emergency' || l.fixture === 'signal') {
          ctx.fillStyle = `rgba(${col},${(0.7 * f).toFixed(3)})`;
          ctx.fillRect(Math.round(x - 3), Math.round(y - 2), 6, 3);
        }
      }
    }
    for (const g of this.glows) {
      const x = g.x - cameraX, y = g.y - cameraY;
      if (x < -10 || x > ctx.canvas.width + 10 || y < -10 || y > ctx.canvas.height + 10) continue;
      const k = g.firefly ? Math.max(0, Math.sin((g.life / g.max) * Math.PI * 3)) * dark : Math.min(1, g.life / g.max * 1.4);
      if (k <= 0.02) continue;
      ctx.fillStyle = `rgba(${g.color},${(0.9 * k).toFixed(3)})`;
      ctx.fillRect(Math.round(x), Math.round(y), g.size + 0.5, g.size + 0.5);
      ctx.fillStyle = `rgba(${g.color},${(0.18 * k).toFixed(3)})`;
      ctx.fillRect(Math.round(x - 3), Math.round(y - 3), 7, 7);
    }
    ctx.restore();
  }

  // Blackridge: the air itself hums — faint scanlines and tearing.
  drawInterference(ctx) {
    const k = this.interference || 0;
    if (k <= 0.02) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save();
    ctx.fillStyle = `rgba(150,200,210,${(0.025 * k).toFixed(3)})`;
    for (let y = Math.floor((this.time * 40) % 4); y < H; y += 4) ctx.fillRect(0, y, W, 1);
    if (Math.sin(this.time * 2.3) > 0.97) {
      const y = (Math.sin(this.time * 91) * 0.5 + 0.5) * H;
      ctx.fillStyle = `rgba(200,230,240,${(0.08 * k).toFixed(3)})`;
      ctx.fillRect(0, y, W, 3 + k * 6);
    }
    ctx.restore();
  }

  drawAreaLabels(ctx, cameraX, cameraY) {
    for (const s of this.structures) {
      const sx = s.x * CONFIG.TILE - cameraX;
      const width = (s.endX - s.x) * CONFIG.TILE;
      if (sx + width < -40 || sx > ctx.canvas.width + 40) continue;
      const sy = (s.groundY - 1) * CONFIG.TILE - cameraY;
      if (sy < -60 || sy > ctx.canvas.height + 60) continue;
      const label = s.name.toUpperCase();
      ctx.save();
      ctx.font = '600 10px "Courier New", monospace';
      const tw = ctx.measureText(label).width;
      const bx = sx + width / 2 - tw / 2 - 8;
      const by = sy - 26;
      ctx.fillStyle = 'rgba(12,14,15,.62)';
      ctx.fillRect(bx, by, tw + 16, 16);
      ctx.fillStyle = 'rgba(200,186,140,.5)';
      ctx.fillRect(bx, by, 2, 16);
      ctx.fillStyle = 'rgba(224,214,189,.82)';
      ctx.fillText(label, bx + 8, by + 11);
      ctx.restore();
    }
  }
}
