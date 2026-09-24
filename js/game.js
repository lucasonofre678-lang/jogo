const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  day: document.getElementById("dayText"),
  time: document.getElementById("timeText"),
  seed: document.getElementById("seedText"),
  hotbar: document.getElementById("hotbar"),
  toast: document.getElementById("toast"),
  inventoryModal: document.getElementById("inventoryModal"),
  inventoryList: document.getElementById("inventoryList"),
  weightText: document.getElementById("weightText"),
  weightFill: document.getElementById("weightFill"),
  inventoryButton: document.getElementById("inventoryButton"),
  closeInventory: document.getElementById("closeInventory"),
  contextPrompt: document.getElementById("contextPrompt"),
  containerModal: document.getElementById("containerModal"),
  containerTitle: document.getElementById("containerTitle"),
  containerSubtitle: document.getElementById("containerSubtitle"),
  containerList: document.getElementById("containerList"),
  closeContainer: document.getElementById("closeContainer"),
  takeAllButton: document.getElementById("takeAllButton"),
  storeMaterialsButton: document.getElementById("storeMaterialsButton"),
  containerItemCount: document.getElementById("containerItemCount"),
  containerBackpackWeight: document.getElementById("containerBackpackWeight"),
  containerBackpackList: document.getElementById("containerBackpackList"),
  navArea: document.getElementById("navAreaText"),
  inventoryKillText: document.getElementById("inventoryKillText"),
  inventoryDeathText: document.getElementById("inventoryDeathText"),
  inventoryEquippedText: document.getElementById("inventoryEquippedText"),
  inventoryConditionText: document.getElementById("inventoryConditionText"),
  slotCountText: document.getElementById("slotCountText"),
  deathModal: document.getElementById("deathModal"),
  deathSummary: document.getElementById("deathSummary"),
  deathKillsText: document.getElementById("deathKillsText"),
  deathDayText: document.getElementById("deathDayText"),
  deathLootText: document.getElementById("deathLootText"),
  newSurvivorButton: document.getElementById("newSurvivorButton"),
  buildButton: document.getElementById("buildButton"),
  mapButton: document.getElementById("mapButton"),
  mapModal: document.getElementById("mapModal"),
  closeMap: document.getElementById("closeMap"),
  countyMap: document.getElementById("countyMap"),
  mapPositionText: document.getElementById("mapPositionText"),
  mapRegionText: document.getElementById("mapRegionText"),
  mapDiscoveryText: document.getElementById("mapDiscoveryText"),
  mapMarkerText: document.getElementById("mapMarkerText"),
  mapSignalText: document.getElementById("mapSignalText"),
  progressionTierText: document.getElementById("progressionTierText"),
  progressionHintText: document.getElementById("progressionHintText"),
  buildModal: document.getElementById("buildModal"),
  closeBuild: document.getElementById("closeBuild"),
  buildGrid: document.getElementById("buildGrid"),
  buildModeStatus: document.getElementById("buildModeStatus"),
  craftList: document.getElementById("craftList"),
  craftFilters: document.getElementById("craftFilters"),
  craftSearch: document.getElementById("craftSearch"),
  craftFavoritesButton: document.getElementById("craftFavoritesButton"),
  pinnedRecipe: document.getElementById("pinnedRecipe"),
  craftTracker: document.getElementById("craftTracker"),
  benchStatus: document.getElementById("benchStatus"),
  weatherText: document.getElementById("weatherText"),
  ambientText: document.getElementById("ambientText"),
  headClothingText: document.getElementById("headClothingText"),
  bodyClothingText: document.getElementById("bodyClothingText"),
  handsClothingText: document.getElementById("handsClothingText"),
  legsClothingText: document.getElementById("legsClothingText"),
  feetClothingText: document.getElementById("feetClothingText"),
  packClothingText: document.getElementById("packClothingText"),
  clothingStatsText: document.getElementById("clothingStatsText"),
  injuryList: document.getElementById("injuryList"),
  peopleButton: document.getElementById("peopleButton"),
  knownPeopleText: document.getElementById("knownPeopleText"),
  npcModal: document.getElementById("npcModal"),
  closeNpc: document.getElementById("closeNpc"),
  npcFactionText: document.getElementById("npcFactionText"),
  npcNameText: document.getElementById("npcNameText"),
  npcProfessionText: document.getElementById("npcProfessionText"),
  npcRelationLabel: document.getElementById("npcRelationLabel"),
  npcRelationText: document.getElementById("npcRelationText"),
  npcRelationFill: document.getElementById("npcRelationFill"),
  npcPersonalityText: document.getElementById("npcPersonalityText"),
  npcDialogueText: document.getElementById("npcDialogueText"),
  npcQuestTitle: document.getElementById("npcQuestTitle"),
  npcQuestStatus: document.getElementById("npcQuestStatus"),
  npcQuestDesc: document.getElementById("npcQuestDesc"),
  npcQuestProgress: document.getElementById("npcQuestProgress"),
  questActionButton: document.getElementById("questActionButton"),
  npcScripText: document.getElementById("npcScripText"),
  npcTradeStock: document.getElementById("npcTradeStock"),
  npcSellList: document.getElementById("npcSellList"),
  recruitButton: document.getElementById("recruitButton"),
  dismissButton: document.getElementById("dismissButton"),
  npcPortrait: document.getElementById("npcPortrait"),
  peopleModal: document.getElementById("peopleModal"),
  closePeople: document.getElementById("closePeople"),
  peopleList: document.getElementById("peopleList"),
  factionList: document.getElementById("factionList"),
  companionText: document.getElementById("companionText"),
  companionFollowButton: document.getElementById("companionFollowButton"),
  companionHoldButton: document.getElementById("companionHoldButton"),
  companionAvoidButton: document.getElementById("companionAvoidButton"),
  companionBaseButton: document.getElementById("companionBaseButton"),
  baseLevelText: document.getElementById("baseLevelText"),
  baseResidentText: document.getElementById("baseResidentText"),
  baseStations: document.getElementById("baseStations"),
  baseStockList: document.getElementById("baseStockList"),
  claimBaseStockButton: document.getElementById("claimBaseStockButton"),
  saveStatusText: document.getElementById("saveStatusText"),
  saveGameButton: document.getElementById("saveGameButton"),
  loadGameButton: document.getElementById("loadGameButton"),
  settlementMoraleText: document.getElementById("settlementMoraleText"),
  settlementEventText: document.getElementById("settlementEventText"),
  residentRequestList: document.getElementById("residentRequestList"),
  campaignOperationList: document.getElementById("campaignOperationList"),
  blackridgeCampaignText: document.getElementById("blackridgeCampaignText"),
  blackridgeCampaignHint: document.getElementById("blackridgeCampaignHint"),
  inventoryFilters: document.getElementById("inventoryFilters"),
  inventorySearch: document.getElementById("inventorySearch"),
  inventorySort: document.getElementById("inventorySort"),
  itemDetailPane: document.getElementById("itemDetailPane"),
  buildFilters: document.getElementById("buildFilters"),
  npcPortraitImage: document.getElementById("npcPortraitImage"),
  archiveButton: document.getElementById("archiveButton"),
  archiveCountText: document.getElementById("archiveCountText"),
  radioModal: document.getElementById("radioModal"),
  closeRadio: document.getElementById("closeRadio"),
  radioFreqText: document.getElementById("radioFreqText"),
  radioStationText: document.getElementById("radioStationText"),
  radioSignalFill: document.getElementById("radioSignalFill"),
  radioPrevButton: document.getElementById("radioPrevButton"),
  radioListenButton: document.getElementById("radioListenButton"),
  radioNextButton: document.getElementById("radioNextButton"),
  radioTranscript: document.getElementById("radioTranscript"),
  archiveModal: document.getElementById("archiveModal"),
  closeArchive: document.getElementById("closeArchive"),
  archiveSubtitle: document.getElementById("archiveSubtitle"),
  archiveDocList: document.getElementById("archiveDocList"),
  archiveReader: document.getElementById("archiveReader"),
  blackridgeAccessText: document.getElementById("blackridgeAccessText"),
  archiveExposureText: document.getElementById("archiveExposureText"),
  truthStatusText: document.getElementById("truthStatusText"),
  archiveChoiceBox: document.getElementById("archiveChoiceBox"),
  transmitArchiveButton: document.getElementById("transmitArchiveButton"),
  sealArchiveButton: document.getElementById("sealArchiveButton"),
  vehicleButton: document.getElementById("vehicleButton"),
  vehicleNavText: document.getElementById("vehicleNavText"),
  vehicleModal: document.getElementById("vehicleModal"),
  closeVehicle: document.getElementById("closeVehicle"),
  vehicleTitle: document.getElementById("vehicleTitle"),
  vehicleSubtitle: document.getElementById("vehicleSubtitle"),
  vehiclePreview: document.getElementById("vehiclePreview"),
  vehicleFuelText: document.getElementById("vehicleFuelText"),
  vehicleFuelFill: document.getElementById("vehicleFuelFill"),
  vehicleBatteryText: document.getElementById("vehicleBatteryText"),
  vehicleBatteryFill: document.getElementById("vehicleBatteryFill"),
  vehicleConditionText: document.getElementById("vehicleConditionText"),
  vehicleConditionFill: document.getElementById("vehicleConditionFill"),
  vehicleEngineButton: document.getElementById("vehicleEngineButton"),
  vehicleRefuelButton: document.getElementById("vehicleRefuelButton"),
  vehicleBatteryButton: document.getElementById("vehicleBatteryButton"),
  vehicleRepairButton: document.getElementById("vehicleRepairButton"),
  vehicleDrainButton: document.getElementById("vehicleDrainButton"),
  vehicleComponentList: document.getElementById("vehicleComponentList"),
  vehicleAssemblyModal: document.getElementById("vehicleAssemblyModal"),
  closeVehicleAssembly: document.getElementById("closeVehicleAssembly"),
  vehicleModuleGrid: document.getElementById("vehicleModuleGrid"),
  assemblyProgressText: document.getElementById("assemblyProgressText"),
  assemblyProgressFill: document.getElementById("assemblyProgressFill"),
  assemblyBenchStatus: document.getElementById("assemblyBenchStatus"),
  completeVehicleButton: document.getElementById("completeVehicleButton"),
  assemblyStatusPill: document.getElementById("assemblyStatusPill"),
  assemblyBodyVisual: document.getElementById("assemblyBodyVisual"),
  trunkWeightText: document.getElementById("trunkWeightText"),
  trunkList: document.getElementById("trunkList"),
  trunkInventoryList: document.getElementById("trunkInventoryList"),
  sustainabilityButton: document.getElementById("sustainabilityButton"),
  sustainabilityModal: document.getElementById("sustainabilityModal"),
  closeSustainability: document.getElementById("closeSustainability"),
  baseDaysText: document.getElementById("baseDaysText"),
  stage39FoodDays: document.getElementById("stage39FoodDays"),
  stage39Water: document.getElementById("stage39Water"),
  stage39Farm: document.getElementById("stage39Farm"),
  stage39Comfort: document.getElementById("stage39Comfort"),
  stage39PowerState: document.getElementById("stage39PowerState"),
  stage39Production: document.getElementById("stage39Production"),
  stage39Demand: document.getElementById("stage39Demand"),
  stage39Battery: document.getElementById("stage39Battery"),
  stage39ProductionFill: document.getElementById("stage39ProductionFill"),
  stage39DemandFill: document.getElementById("stage39DemandFill"),
  stage39BatteryFill: document.getElementById("stage39BatteryFill"),
  stage39Consumers: document.getElementById("stage39Consumers"),
  stage39Rooms: document.getElementById("stage39Rooms"),
  togglePowerOverlay: document.getElementById("togglePowerOverlay")
};

SaveSlots.migrateLegacy();
const pendingLoad = SaveSlots.takePending();
const pendingNew = SaveSlots.takeNew();
const bootSave = pendingLoad ? SaveSlots.read(pendingLoad.id, pendingLoad.mode) : null;
let currentSaveSlot = pendingLoad?.id || pendingNew?.id || null;
let currentGameMode = pendingLoad?.mode || pendingNew?.mode || bootSave?.mode || 'survival';
let mainMenuOpen = !pendingLoad && !pendingNew;
let creativeOpen = false;
let creativeThreats = false;
const seed = Number.isFinite(bootSave?.seed) ? bootSave.seed : Math.floor(Math.random() * 99999999);
const world = new World(seed);
const structures = new StructureManager(world, seed);
const player = new Player(world);
const inventory = new Inventory();
const mining = new MiningSystem(world, inventory);
const arsenal = new WeaponArsenalSystem(inventory);
const survival = new Survival();
const building = new BuildSystem(world, structures, inventory);
const creative = new CreativeSystem({ world, building, structures, player, inventory });
creative.enabled = currentGameMode === 'free';
creative.flying = creative.enabled;
const progression = new ProgressionSystem(inventory, structures, building);
const crafting = new CraftingSystem(inventory, building, progression);
const weather = new WeatherSystem(seed);
const injuries = new InjurySystem(seed);
// Lore builds the Blackridge annex and bunker, so it has to run before the
// infected are placed or nothing would ever spawn down there.
const lore = new LoreSystem(world, structures, inventory, null, seed);
world.cleanFloatingVegetation();
structures.cleanUnreachableNaturalLedges();
const worldState = new WorldStateSystem(world, structures, seed);
const danger = new DangerSystem(world, structures, seed);
lore.danger = danger;
if (lore.structure_) danger.populateStructure(lore.structure_, 5);
for (const spot of [[381, 93], [392, 93], [406, 93], [414, 93]]) danger.spawnUnderground(spot[0], spot[1]);
const power = new PowerSystem(building, inventory, danger);
const society = new SocietySystem(world, structures, inventory, danger, seed, building);
// Stage 31 — sustento: comida perecível, horta e fauna caçável.
const food = new FoodSystem({ inventory, survival, structures, building, power, weather, getWorldMinutes: () => worldMinutes });
const farming = new FarmingSystem({ building, world, inventory, structures, weather, danger, getWorldMinutes: () => worldMinutes });
const wildlife = new WildlifeSystem({ world, structures, danger, inventory, weather, seed, getWorldMinutes: () => worldMinutes });
const vehicles = new VehicleSystem(world, structures, inventory, danger, seed);
const vehicleCraft = new VehicleCraftSystem(building, vehicles, inventory, danger);
const fx = new FXSystem(seed);
const life = new LifeSystem(seed);
const terrain = new TerrainRenderer(world);
const lighting = new LightSystem(world, canvas);
const hud = new HUD();
const audio = new AudioSystem();
const places = new PlaceSystem(world, structures, inventory, danger);
worldState.applyInitialPower(places);

const hordes = new HordeSystem({
  world, danger, structures, player, worldState,
  getViewWidth: () => canvas.width,
  getWorldMinutes: () => worldMinutes
});
hordes.announce = (text, tone) => showToast(text, tone);
danger.onNoise = (x, y, radius, label) => worldState.onNoise(x, y, radius, label);

// Frames of frozen world time on a solid hit — the single biggest reason a
// swing reads as "heavy" instead of "the number went down".
let hitstop = 0;

// Stage 24: input buffering makes melee responsive without turning it into
// button-mashing. A click near the end of recovery becomes the next swing.
let bufferedMelee = null;
let meleeChain = { step: 0, timer: 0, weaponId: null };

const objectives = new ObjectiveSystem({
  inventory, survival, building, vehicles, lore, places, progression, mining, weather,
  clothingStats: () => clothingStats(),
  getWorldMinutes: () => worldMinutes
});

const events = new EventSystem({
  player, world, structures, danger, weather, places, hordes, worldState,
  getWorldMinutes: () => worldMinutes
});
events.announce = (text, tone) => showToast(text, tone);
// Stage 20: local structure events make sound and raise dust through the game
events.sound = (kind, x) => audio.world(kind, audioPan(x));
events.onDust = (x, y) => { fx.dust(x, y, 18, 1.6); fx.shake = Math.max(fx.shake, 3); };
// a body finishing its fall scuffs the ground it lands on
danger.onBodyDown = (enemy, dir) => fx.enemyDown(enemy, dir);

const baseCamp = new BaseCampSystem({
  building, society, inventory, structures, worldState, danger, weather, vehicles, farming, seed,
  getWorldMinutes: () => worldMinutes
});
society.baseCamp = baseCamp;
baseCamp.onNotice = (text, tone) => showToast(text, tone);
const stage42 = new ZombiePopulationSystem({
  world, danger, structures, player, building, baseCamp, society, power, hordes, seed,
  getViewWidth: () => canvas.width,
  getWorldMinutes: () => worldMinutes
});
stage42.announce = (text, tone) => showToast(text, tone);
danger.onNoise = (x, y, radius, label) => {
  worldState.onNoise(x, y, radius, label);
  stage42.onNoise(x, radius, label);
};
const sustainable = new SustainableSurvivalSystem({
  world, building, structures, inventory, farming, food, power, baseCamp, society, weather,
  getWorldMinutes: () => worldMinutes
});
sustainable.onNotice = (text, tone) => showToast(text, tone);
const greenwater = new GreenwaterSystem({world,structures,building,inventory,farming,weather,getWorldMinutes:()=>worldMinutes});
greenwater.onNotice=(text,tone)=>showToast(text,tone);
// Stage 42 — jornada de progressão, projetos e o mapa 2.0.
const journey42 = new Stage42Journey({
  progression, crafting, building, inventory, structures, places, lore, player,
  notify:(text, tone) => showToast(text, tone)
});
const countyMapView = new CountyMapView(ui.countyMap);
countyMapView.onChange = () => renderCountyMap();
const opening=new OpeningSequence({
  fresh:Boolean(pendingNew),mode:currentGameMode,
  onFinish:()=>showToast('Vasculhe o Ponto de Evacuação 12 e procure abrigo antes da noite','warn')
});

const campaign = new CampaignSystem({
  structures, society, baseCamp, worldState, danger, hordes, places, inventory, lore, progression, weather, seed,
  getWorldMinutes: () => worldMinutes
});
campaign.onNotice = (text, tone) => showToast(text, tone);

food.onNotice = (text, tone) => { showToast(text, tone); objectives.flag('food_spoiled'); };
farming.onNotice = (text, tone) => showToast(text, tone);
// Javali e lobo são as duas espécies que revidam — o resto só foge.
wildlife.onAttack = (animal, damage) => {
  damagePlayer(damage, animal.x + animal.w / 2);
  fx.shake = Math.max(fx.shake, 2.4);
  audio.impact('flesh', 1.1, audioPan(animal.x));
};
wildlife.onAlarm = (animal, kind) => {
  if (Math.abs(animal.x - player.x) > 700) return;
  if (kind === 'hunt') showToast(`${animal.def.name} veio para cima`, 'danger');
};
wildlife.onKill = (animal) => {
  audio.impact('flesh', 1.2, audioPan(animal.x));
  showToast(`${animal.def.name} abatido — use E para aproveitar a carcaça`, 'good');
};

const clothing = { head: null, body: null, hands: null, legs: null, feet: null, pack: null };
let flashlightOn = false;

let deathCount = 0;
let gameDead = false;
let footstepNoiseTimer = 0;
let lastTrapMinute = 0;

// A deliberately thin start: a knife, a little water, almost nothing else.
// Tools, materials and capacity are things the county has to give you.
function giveStarterInventory(full = true) {
  inventory.entries = [];
  inventory.uidCounter = 1;
  inventory.maxWeight = CONFIG.MAX_CARRY_WEIGHT;
  inventory.setBonusWeight?.(0);
  inventory.add("knife", 1);
  inventory.add("snack_bar", full ? 2 : 1);
  inventory.add("water_bottle", 1);
  inventory.add("empty_bottle", 1);
  inventory.add("bandage", full ? 2 : 1);
  inventory.add("cloth", full ? 2 : 1);
  inventory.add("wood", full ? 4 : 2);
  inventory.add("nails", full ? 4 : 2);
  inventory.add("county_scrip", full ? 6 : 2);
}

giveStarterInventory(true);

const hotbar = [...DEFAULT_HOTBAR];
let lastNoiseLabel = '';

const input = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false,
  jumpPressed: false,
  sprint: false,
  crouch: false
};

const camera = { x: 0, y: 0 };
const mouse = { x: 0, y: 0, tileX: -1, tileY: -1, tile: 0, mining: false, attackHeld: false, aiming: false };

let selected = 0;
let worldMinutes = 8 * 60;
let lastTime = performance.now();
let toastTimer = 0;
let mineCooldown = 0;
let autosaveTimer = 0;
let inventoryOpen = false;
let currentSprint = false;
let containerOpen = false;
let activeContainer = null;
let buildOpen = false;
let buildMode = false;
let npcOpen = false;
let activeNPC = null;
let peopleOpen = false;
let vehicleOpen = false;
let radioOpen = false;
let archiveOpen = false;
let mapOpen = false;
let sustainabilityOpen = false;
const mapMarkers = [];
let radioIndex = 0;
let selectedArchiveDoc = null;
let activeVehicleMenu = null;
let vehicleAssemblyOpen = false;
let activeVehicleProject = null;
let inventoryFilter = "all";
let inventoryQuery = "";
let inventorySortMode = localStorage.getItem("lc_inventory_sort") || "category";
let inventorySelectedId = null;
let craftQuery = "";
let craftFavoritesOnly = false;
let craftPinnedId = localStorage.getItem("lc_craft_pinned") || "";
let craftFavorites = new Set();
try { craftFavorites = new Set(JSON.parse(localStorage.getItem("lc_craft_favorites") || "[]")); } catch (_) {}
let buildFilter = "TODOS";

ui.seed.textContent = seed.toString();

function showToast(text, tone = '') {
  if (ui.toast.textContent !== text) {
    ui.toast.textContent = text;
    ui.toast.classList.remove("show");
    void ui.toast.offsetWidth;
  }
  ui.toast.classList.remove("hidden");
  ui.toast.classList.add("show");
  ui.toast.classList.toggle("danger", tone === 'danger');
  ui.toast.classList.toggle("warn", tone === 'warn');
  ui.toast.classList.toggle("good", tone === 'good');
  toastTimer = tone ? 4 : 2.6;
}

function selectedItemId() {
  return hotbar[selected] || null;
}

function selectedItemDef() {
  const id = selectedItemId();
  return id ? ITEM_DEFS[id] : null;
}

progression.onTierUp = tier => {
  showToast(`PROGRESSÃO ${tier.short} — ${tier.name}`, 'good');
  worldState.record('progression_tier', { tier: tier.id, name: tier.name });
};

function itemExists(id) {
  return id && inventory.count(id) > 0;
}


const itemIconImageCache = new Map();
function itemIconData(id, size = 28) { return `assets/items/${id}.png`; }
function itemIconImage(id, size = 28) { const key=id; if(!itemIconImageCache.has(key)){const img=new Image();img.src=itemIconData(id,size);itemIconImageCache.set(key,img);} return itemIconImageCache.get(key); }
function itemIconHtml(id, className='icon-img', size=28){return `<img class="${className}" src="${itemIconData(id,size)}" alt="">`;}


const INVENTORY_CATEGORY_GROUPS = {
  all: () => true,
  weapons: def => ["firearm","ammo"].includes(def.category) || Boolean(def.melee),
  tools: def => ["tool","light"].includes(def.category) && !def.melee,
  survival: def => ["food","drink","medical","container","seed"].includes(def.category),
  materials: def => ["material","currency"].includes(def.category),
  components: def => def.category === "component",
  clothing: def => def.category === "clothing",
  key: def => def.category === "key"
};

function categoryLabel(category) {
  return {
    tool:"FERRAMENTA", firearm:"ARMA", ammo:"MUNIÇÃO", light:"UTILIDADE", food:"COMIDA", drink:"BEBIDA", medical:"MEDICINA",
    container:"RECIPIENTE", material:"MATERIAL", component:"COMPONENTE", clothing:"ROUPA", seed:"SEMENTE",
    currency:"MOEDA", key:"CHAVE", blueprint:"PROJETO"
  }[category] || category.toUpperCase();
}

function categoryTone(category) {
  return {
    tool:"#a27b50", firearm:"#9b6654", ammo:"#a98655", light:"#b6a666", food:"#8a9d65", drink:"#638aa0", medical:"#a76866",
    container:"#7c8588", material:"#796a59", component:"#69787a", clothing:"#66786d", seed:"#7f9257",
    currency:"#b79a58", key:"#778a91", blueprint:"#c9b98f"
  }[category] || "#788083";
}

function inventoryVisibleEntries(entries) {
  const test = INVENTORY_CATEGORY_GROUPS[inventoryFilter] || INVENTORY_CATEGORY_GROUPS.all;
  const q = inventoryQuery.trim().toLowerCase();
  const filtered = entries.filter(entry => {
    const def = ITEM_DEFS[entry.id];
    if (!def || !test(def)) return false;
    if (!q) return true;
    const hay = [def.name, def.description, categoryLabel(def.category), arsenal?.classLabel?.(entry.id) || ""].join(" ").toLowerCase();
    return hay.includes(q);
  });
  const categoryOrder = { firearm:0, ammo:1, tool:2, light:3, clothing:4, medical:5, food:6, drink:7, seed:8, container:9, component:10, material:11, currency:12, key:13, blueprint:14 };
  return filtered.sort((a,b) => {
    const da=ITEM_DEFS[a.id], db=ITEM_DEFS[b.id];
    if (inventorySortMode === "name") return da.name.localeCompare(db.name);
    if (inventorySortMode === "weight") return (db.weight*b.qty)-(da.weight*a.qty) || da.name.localeCompare(db.name);
    if (inventorySortMode === "condition") {
      const ca = a.durability != null && da.maxDurability ? a.durability/da.maxDurability : 2;
      const cb = b.durability != null && db.maxDurability ? b.durability/db.maxDurability : 2;
      return ca-cb || da.name.localeCompare(db.name);
    }
    return (categoryOrder[da.category]??50)-(categoryOrder[db.category]??50) || da.name.localeCompare(db.name);
  });
}

function primaryItemAction(id) {
  const def = ITEM_DEFS[id];
  if (!def || !itemExists(id)) return;
  if (def.clothingRepair) {
    repairWornClothing(def.clothingRepair);
    return;
  }
  if (def.weaponMod) {
    const weaponId = selectedItemId();
    const result = arsenal.install(def.weaponMod, weaponId);
    showToast(result.ok ? `${def.name} instalado em ${ITEM_DEFS[weaponId]?.name || 'arma'}` : result.reason, result.ok ? 'good' : 'warn');
    return;
  }
  if (def.upgradeCarry) useItem(id);
  else if (["food","drink","medical"].includes(def.category)) useItem(id);
  else if (def.category === "clothing") equipClothing(id);
  else equipItem(id);
}

function itemComparisonHtml(id) {
  const def = ITEM_DEFS[id];
  if (!def) return "";
  let otherId = null, label = "";
  if (def.category === "clothing" && def.clothingSlot) { otherId = clothing[def.clothingSlot]; label = "EQUIPADO"; }
  else if (def.gun || def.melee) {
    const current = selectedItemId();
    if (current && current !== id) { const od=ITEM_DEFS[current]; if (od && ((def.gun&&od.gun)||(def.melee&&od.melee))) { otherId=current; label="EM MÃOS"; } }
  }
  if (!otherId || otherId === id || !ITEM_DEFS[otherId]) return "";
  const other = ITEM_DEFS[otherId];
  const rows=[];
  const add=(name,a,b,higher=true,suffix="")=>{ if(a==null||b==null)return; const d=a-b; const good=higher?d>0:d<0; rows.push(`<div class="compare-row ${d===0?'same':good?'better':'worse'}"><span>${name}</span><b>${a}${suffix}</b><em>${d===0?'=':(d>0?'+':'')+Number(d.toFixed(2))}${suffix}</em></div>`); };
  add("PESO", def.weight, other.weight, false, "kg");
  if(def.gun&&other.gun){ add("DANO",def.gun.damage,other.gun.damage); add("CAP.",def.gun.magazine,other.gun.magazine); }
  if(def.melee&&other.melee){ add("DANO",def.melee.damage,other.melee.damage); add("ALCANCE",def.melee.range,other.melee.range); add("FÔLEGO",def.melee.stamina,other.melee.stamina,false); }
  if(def.category==="clothing"){
    add("PROTEÇÃO",Math.round((def.armor||0)*100),Math.round((other.armor||0)*100),true,"%");
    add("CHUVA",Math.round((def.rainProtection||0)*100),Math.round((other.rainProtection||0)*100),true,"%");
    add("ISOL.",def.insulation||0,other.insulation||0);
    add("CARGA",def.carryBonus||0,other.carryBonus||0,true,"kg");
    add("MOB.",Math.round((def.moveBonus||0)*100),Math.round((other.moveBonus||0)*100),true,"%");
  }
  if(!rows.length)return "";
  return `<section class="item-compare"><header><span>COMPARAR COM ${label}</span><strong>${other.name}</strong></header>${rows.join("")}</section>`;
}

function renderItemDetail(id) {
  if (!ui.itemDetailPane) return;
  if (!id || !itemExists(id)) {
    ui.itemDetailPane.innerHTML = `<div class="detail-empty"><img src="assets/ui/nav_inventory.png" alt=""><strong>SELECIONE UM ITEM</strong><span>Clique em um slot para ver detalhes.</span></div>`;
    return;
  }

  const def = ITEM_DEFS[id];
  const entry = inventory.list().find(e => e.id === id);
  const durability = def.maxDurability ? inventory.durability(id) : null;
  const stats = [];
  stats.push(`<div><span>PESO</span><strong>${(def.weight * (entry?.qty || 1)).toFixed(2)} kg</strong></div>`);
  stats.push(`<div><span>CATEGORIA</span><strong>${categoryLabel(def.category)}</strong></div>`);
  const gearTier = progression.gearLabel(id);
  if (gearTier) stats.push(`<div><span>PROGRESSÃO</span><strong>${gearTier}</strong></div>`);
  if (entry?.qty > 1) stats.push(`<div><span>QUANTIDADE</span><strong>${entry.qty}</strong></div>`);
  if (durability) stats.push(`<div><span>CONDIÇÃO</span><strong>${Math.round(durability.current / durability.max * 100)}%</strong></div>`);
  if (FoodSystem.perishable(id)) {
    const fresh = food.freshness(entry);
    const step = food.step(fresh);
    stats.push(`<div><span>FRESCOR</span><strong style=\"color:${step.tone}\">${Math.round(fresh)}% · ${step.label}</strong></div>`);
    if (def.preserved) stats.push(`<div><span>CONSERVA</span><strong>LONGA DURAÇÃO</strong></div>`);
  }
  if (def.raw) stats.push(`<div><span>CRU</span><strong>COZINHE ANTES</strong></div>`);
  if (def.nutrition) stats.push(`<div><span>REFEIÇÃO</span><strong>${'●'.repeat(def.nutrition)}${'○'.repeat(3 - def.nutrition)}</strong></div>`);
  if (def.hunger) stats.push(`<div><span>FOME</span><strong>+${def.hunger}</strong></div>`);
  if (def.thirst) stats.push(`<div><span>SEDE</span><strong>${def.thirst > 0 ? "+" : ""}${def.thirst}</strong></div>`);
  if (def.melee) {
    stats.push(`<div><span>DANO</span><strong>${def.melee.damage}</strong></div>`);
    stats.push(`<div><span>ALCANCE</span><strong>${def.melee.range}</strong></div>`);
    stats.push(`<div><span>FÔLEGO</span><strong>${def.melee.stamina}</strong></div>`);
  }
  if (def.gun) {
    const cls = arsenal.classDef(id);
    const mods = arsenal.modsFor(id);
    stats.push(`<div><span>CLASSE</span><strong>${arsenal.classLabel(id)}</strong></div>`);
    stats.push(`<div><span>DANO</span><strong>${def.gun.damage}${def.gun.pellets > 1 ? ` ×${def.gun.pellets}` : ''}</strong></div>`);
    stats.push(`<div><span>CAPACIDADE</span><strong>${def.gun.magazine}</strong></div>`);
    stats.push(`<div><span>MANEJO</span><strong>${'●'.repeat(cls?.handling || 3)}${'○'.repeat(5-(cls?.handling || 3))}</strong></div>`);
    stats.push(`<div><span>DISPARO</span><strong>${def.gun.auto ? 'AUTOMÁTICO' : 'SEMIAUTO'}</strong></div>`);
    stats.push(`<div><span>RUÍDO</span><strong>${def.gun.noise >= 900 ? 'EXTREMO' : def.gun.noise >= 760 ? 'ALTO' : 'MÉDIO'}</strong></div>`);
    stats.push(`<div><span>MÓDULOS</span><strong>${Object.values(mods).length ? Object.values(mods).map(m=>ITEM_DEFS[m]?.name || m).join(' · ') : 'NENHUM'}</strong></div>`);
  } else if (def.melee && def.arsenal) {
    const cls = arsenal.classDef(id);
    stats.push(`<div><span>CLASSE</span><strong>${arsenal.classLabel(id)}</strong></div>`);
    stats.push(`<div><span>MANEJO</span><strong>${'●'.repeat(cls?.handling || 3)}${'○'.repeat(5-(cls?.handling || 3))}</strong></div>`);
  }
  if (def.insulation) stats.push(`<div><span>ISOLAMENTO</span><strong>${def.insulation}</strong></div>`);
  if (def.armor) stats.push(`<div><span>PROTEÇÃO</span><strong>${Math.round(def.armor*100)}%</strong></div>`);
  if (def.rainProtection) stats.push(`<div><span>CHUVA</span><strong>${Math.round(def.rainProtection*100)}%</strong></div>`);
  if (def.moveBonus) stats.push(`<div><span>MOBILIDADE</span><strong>+${Math.round(def.moveBonus*100)}%</strong></div>`);
  if (def.contamProtection) stats.push(`<div><span>CONTAM.</span><strong>${Math.round(def.contamProtection*100)}%</strong></div>`);
  if (def.carryBonus) stats.push(`<div><span>CARGA</span><strong>+${def.carryBonus} kg</strong></div>`);
  if (def.noiseModifier) stats.push(`<div><span>RUÍDO</span><strong>${def.noiseModifier < 0 ? '' : '+'}${Math.round(def.noiseModifier*100)}%</strong></div>`);
  if (def.staminaModifier) stats.push(`<div><span>FÔLEGO</span><strong>${def.staminaModifier > 0 ? '+' : ''}${Math.round(def.staminaModifier*100)}%</strong></div>`);
  if (def.miningEfficiency) stats.push(`<div><span>MINERAÇÃO</span><strong>+${Math.round(def.miningEfficiency*100)}%</strong></div>`);
  if (def.medicalBonus) stats.push(`<div><span>MEDICINA</span><strong>+${Math.round(def.medicalBonus*100)}%</strong></div>`);
  if (def.repairBonus) stats.push(`<div><span>MANUTENÇÃO</span><strong>+${Math.round(def.repairBonus*100)}%</strong></div>`);
  if (def.gearSet) stats.push(`<div><span>CONJUNTO</span><strong>${def.gearSet.toUpperCase()}</strong></div>`);

  const clothingItem = def.category === "clothing";
  const usable = ["food","drink","medical"].includes(def.category) || Boolean(def.clothingRepair);
  let primary = def.clothingRepair ? "REPARAR ROUPA" : def.upgradeCarry ? "INSTALAR" : clothingItem ? (clothing[def.clothingSlot] === id ? "TIRAR" : "VESTIR") : usable ? "USAR" : "EQUIPAR";
  if (def.weaponMod) primary = "INSTALAR NA ARMA EQUIPADA";
  else if (!def.clothingRepair && (def.category === "currency" || def.category === "material" || def.category === "component" || def.category === "key" || def.category === "seed")) primary = "ATRIBUIR À HOTBAR";
  const maintainable = Boolean(def.maxDurability && (def.gun || def.melee) && durability && durability.current < durability.max * .98);

  ui.itemDetailPane.innerHTML = `
    <div class="detail-hero" style="--item-tone:${categoryTone(def.category)}">
      <div class="detail-icon">${itemIconHtml(id,"detail-icon-img",72)}</div>
      <div><span>${categoryLabel(def.category)}</span><h3>${def.name}</h3></div>
    </div>
    <p class="detail-description">${def.description}</p>
    ${durability ? `<div class="detail-condition"><span>CONDIÇÃO</span><i><b style="width:${durability.current/durability.max*100}%"></b></i><strong>${Math.round(durability.current/durability.max*100)}%</strong></div>` : ""}
    <div class="detail-stats">${stats.join("")}</div>
    ${itemComparisonHtml(id)}
    <div class="detail-actions">
      <button id="itemDetailPrimary" type="button">${primary}</button>
      ${maintainable ? `<button id="itemDetailMaintain" class="secondary" type="button">MANUTENÇÃO · ${inventory.count('maintenance_kit')} KIT</button>` : ''}
      <button id="itemDetailHotbar" class="secondary" type="button">HOTBAR · SLOT ${selected+1}</button>
    </div>
    <small class="detail-tip">Duplo clique no slot executa a ação principal.</small>
  `;

  const primaryBtn = document.getElementById("itemDetailPrimary");
  const maintainBtn = document.getElementById("itemDetailMaintain");
  const hotbarBtn = document.getElementById("itemDetailHotbar");
  primaryBtn?.addEventListener("click", () => {
    if (def.weaponMod || def.clothingRepair) primaryItemAction(id);
    else if (["currency","material","component","key"].includes(def.category)) equipItem(id);
    else primaryItemAction(id);
    renderInventory(); renderHotbar(); updateUI();
  });
  maintainBtn?.addEventListener("click", () => {
    const result = arsenal.maintain(id);
    showToast(result.ok ? `${def.name}: condição recuperada` : result.reason, result.ok ? 'good' : 'warn');
    renderInventory(); renderHotbar(); updateUI();
  });
  hotbarBtn?.addEventListener("click", () => {
    hotbar[selected] = id;
    showToast(`${def.name} atribuído ao slot ${selected+1}`);
    renderInventory(); renderHotbar(); updateUI();
  });
}

function renderHotbar() {
  ui.hotbar.innerHTML = '';

  hotbar.forEach((id, i) => {
    const def = id ? ITEM_DEFS[id] : null;
    const exists = id ? itemExists(id) : false;
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `slot ${selected === i ? 'selected' : ''}`;
    el.setAttribute('aria-label', `${i + 1}: ${def?.name || 'Mãos'}`);

    const color = def?.color || '#3c4246';
    const count = id && def?.stackable ? inventory.count(id) : '';
    const durability = id && def?.maxDurability ? inventory.durability(id) : null;
    const durHtml = durability ? `<span class="durability"><i style="width:${Math.max(0, durability.current / durability.max * 100)}%"></i></span>` : '';
    const iconHtml = id ? itemIconHtml(id, 'slot-icon', 24) : '<span class="empty-hands">✦</span>';

    el.innerHTML = `
      <span class="key">${i + 1}</span>
      <span class="swatch" style="background:${exists || !id ? color : '#24282b'};opacity:${exists || !id ? 1 : .28}">${iconHtml}</span>
      <span class="label">${def?.name || 'Mãos'}</span>
      <span class="count">${count}</span>
      ${durHtml}
    `;

    el.addEventListener('click', () => {
      selected = i;
      renderHotbar();
      renderInventory();
      updateUI();
    });
    el.addEventListener("dragover", e => {
      e.preventDefault();
      el.classList.add("drag-target");
    });
    el.addEventListener("dragleave", () => el.classList.remove("drag-target"));
    el.addEventListener("drop", e => {
      e.preventDefault();
      el.classList.remove("drag-target");
      const itemId = e.dataTransfer.getData("text/item-id");
      if (itemId && itemExists(itemId)) {
        hotbar[i] = itemId;
        selected = i;
        showToast(`${ITEM_DEFS[itemId].name} → slot ${i+1}`);
        renderHotbar(); renderInventory(); updateUI();
      }
    });

    ui.hotbar.appendChild(el);
  });
}


function clothingConditionFactor(id) {
  if (!id || !itemExists(id)) return 0;
  const d = inventory.durability(id);
  if (!d || !d.max) return 1;
  return Math.max(.35, Math.min(1, d.current / d.max));
}

function clothingStats() {
  let insulation = 0, rainProtection = 0, contamProtection = 0, armor = 0, moveBonus = 0;
  let carryBonus = 0, noiseModifier = 0, staminaModifier = 0, miningEfficiency = 0, medicalBonus = 0, repairBonus = 0;
  const sets = {};
  for (const id of Object.values(clothing)) {
    if (!id || !itemExists(id)) continue;
    const def = ITEM_DEFS[id];
    if (!def) continue;
    const condition = clothingConditionFactor(id);
    const protective = .55 + condition * .45;
    insulation += (def.insulation || 0) * protective;
    rainProtection += (def.rainProtection || 0) * protective;
    contamProtection += (def.contamProtection || 0) * protective;
    armor += (def.armor || 0) * protective;
    moveBonus += def.moveBonus || 0;
    carryBonus += def.carryBonus || 0;
    noiseModifier += def.noiseModifier || 0;
    staminaModifier += def.staminaModifier || 0;
    miningEfficiency += def.miningEfficiency || 0;
    medicalBonus += def.medicalBonus || 0;
    repairBonus += def.repairBonus || 0;
    if (def.gearSet) sets[def.gearSet] = (sets[def.gearSet] || 0) + 1;
  }

  // Small coherent set bonuses. They reward preparing for an expedition but
  // never replace the value of the individual pieces.
  const activeSets = [];
  if ((sets.field || 0) >= 3) { moveBonus += .02; noiseModifier -= .05; activeSets.push('CAMPO'); }
  if ((sets.police || 0) >= 3) { armor += .02; activeSets.push('PATRULHA'); }
  if ((sets.firefighter || 0) >= 3) { rainProtection += .08; insulation += 3; activeSets.push('RESGATE'); }
  if ((sets.medical || 0) >= 2) { medicalBonus += .08; activeSets.push('MÉDICO'); }
  if ((sets.industrial || 0) >= 3) { repairBonus += .08; activeSets.push('OFICINA'); }
  if ((sets.mining || 0) >= 3) { miningEfficiency += .08; activeSets.push('MINERAÇÃO'); }
  if ((sets.blackridge || 0) >= 4) { contamProtection += .12; armor += .02; activeSets.push('BLACKRIDGE'); }

  return {
    insulation: Math.round(insulation * 10) / 10,
    rainProtection: Math.min(.94, rainProtection),
    contamProtection: Math.min(.95, contamProtection),
    armor: Math.min(.46, armor),
    moveBonus: Math.max(-.10, Math.min(.14, moveBonus)),
    carryBonus: Math.max(0, carryBonus),
    noiseScale: Math.max(.68, Math.min(1.16, 1 + noiseModifier)),
    staminaUseScale: Math.max(.78, Math.min(1.15, 1 - staminaModifier)),
    miningEfficiency: Math.min(.30, miningEfficiency),
    medicalBonus: Math.min(.28, medicalBonus),
    repairBonus: Math.min(.28, repairBonus),
    activeSets
  };
}

function syncEquipmentCapacity() {
  inventory.setBonusWeight?.(clothingStats().carryBonus || 0);
}

function equipClothing(id) {
  const def = ITEM_DEFS[id];
  if (!def || def.category !== "clothing" || !itemExists(id)) return;
  const slot = def.clothingSlot;
  if (!Object.prototype.hasOwnProperty.call(clothing, slot)) return;
  if (clothing[slot] === id) {
    clothing[slot] = null;
    showToast(`${def.name} removido`);
  } else {
    clothing[slot] = id;
    showToast(`${def.name} equipado`);
  }
  syncEquipmentCapacity();
  renderInventory();
  updateUI();
}

function repairWornClothing(baseRestore = 60) {
  if (inventory.count('clothing_patch_kit') <= 0) return false;
  const worn = Object.values(clothing).filter(Boolean).map(id => {
    const d = inventory.durability(id); return { id, d, def: ITEM_DEFS[id] };
  }).filter(x => x.d && x.d.current < x.d.max);
  if (!worn.length) { showToast('Nenhuma roupa equipada precisa de reparo'); return false; }
  worn.sort((a,b) => a.d.current/a.d.max - b.d.current/b.d.max);
  const target = worn[0];
  const restore = Math.round(baseRestore * (1 + clothingStats().repairBonus));
  inventory.remove('clothing_patch_kit', 1);
  inventory.repairTool(target.id, restore);
  showToast(`${target.def.name} reparado`, 'good');
  renderInventory(); updateUI();
  return true;
}

function damageWornClothing(amount = 1) {
  const worn = Object.entries(clothing).filter(([,id]) => id && itemExists(id));
  if (!worn.length) return;
  // deterministic variation keeps tests reproducible while spreading wear.
  const pick = worn[Math.abs(Math.floor(stateTickSafe() + amount * 7)) % worn.length];
  const [slot, id] = pick;
  const wear = Math.max(1, Math.ceil(amount * .42));
  const result = inventory.damageTool(id, wear);
  if (result.broke) {
    clothing[slot] = null;
    syncEquipmentCapacity();
    showToast(`${ITEM_DEFS[id]?.name || 'Equipamento'} ficou inutilizável`, 'warn');
  }
}

function renderConditionPanels() {
  const slotRows = [
    ['head', ui.headClothingText], ['body', ui.bodyClothingText], ['hands', ui.handsClothingText],
    ['legs', ui.legsClothingText], ['feet', ui.feetClothingText], ['pack', ui.packClothingText]
  ];
  for (const [slot, el] of slotRows) {
    if (!el) continue;
    const id = clothing[slot];
    const def = id ? ITEM_DEFS[id] : null;
    const d = id ? inventory.durability(id) : null;
    el.innerHTML = id && def ? `${itemIconHtml(id,"equip-mini",22)}<span>${def.name}${d ? ` · ${Math.round(d.current/d.max*100)}%` : ''}</span>` : `<span>— vazio —</span>`;
  }

  const stats = clothingStats();
  const setText = stats.activeSets.length ? ` · Conjunto ${stats.activeSets.join(' / ')}` : '';
  ui.clothingStatsText.textContent = `Carga +${stats.carryBonus}kg · Prot. ${Math.round(stats.armor*100)}% · Chuva ${Math.round(stats.rainProtection*100)}% · Ruído ${Math.round(stats.noiseScale*100)}% · Isol. ${stats.insulation}${setText}`;

  ui.injuryList.innerHTML = "";
  for (const row of injuries.summary()) {
    const el = document.createElement("div");
    el.className = `injury-row ${row.status === "OK" ? "" : "bad"}`;
    el.innerHTML = `<span>${row.name}</span><strong>${row.status}${row.risk ? ` · ${row.risk}% risco` : ""}</strong>`;
    ui.injuryList.appendChild(el);
  }
}

function renderInventory() {
  const weight = inventory.totalWeight();
  const ratio = weight / (inventory.capacity?.() || inventory.maxWeight);
  ui.weightText.textContent = `${weight.toFixed(1)} / ${(inventory.capacity?.() || inventory.maxWeight).toFixed(0)} kg`;
  ui.weightFill.style.width = `${Math.min(100, ratio * 100)}%`;
  ui.weightFill.style.background = ratio > 1 ? "#a64f47" : ratio > .82 ? "#b27a43" : "#718a5d";

  const allEntries = inventory.list();
  const entries = inventoryVisibleEntries(allEntries);
  ui.slotCountText.textContent = `${allEntries.reduce((s, e) => s + e.qty, 0)} itens · ${weight.toFixed(1)} kg`;
  ui.inventoryKillText.textContent = danger.kills;
  ui.inventoryDeathText.textContent = deathCount;

  const equippedId = selectedItemId();
  const equippedDef = equippedId && itemExists(equippedId) ? ITEM_DEFS[equippedId] : null;
  ui.inventoryEquippedText.innerHTML = equippedDef ? `${itemIconHtml(equippedId,"loadout-mini",28)}<span>${equippedDef.name}</span>` : `<span>Mãos</span>`;
  const primarySlot = document.getElementById("loadoutPrimaryText");
  const secondarySlot = document.getElementById("loadoutSecondaryText");
  if (primarySlot) primarySlot.innerHTML = hotbar[0] && itemExists(hotbar[0]) ? `${itemIconHtml(hotbar[0],"loadout-mini",22)} ${ITEM_DEFS[hotbar[0]].name}` : "—";
  if (secondarySlot) secondarySlot.innerHTML = hotbar[1] && itemExists(hotbar[1]) ? `${itemIconHtml(hotbar[1],"loadout-mini",22)} ${ITEM_DEFS[hotbar[1]].name}` : "—";
  renderCrafting();
  renderConditionPanels();

  if (equippedDef?.maxDurability) {
    const d = inventory.durability(equippedId);
    ui.inventoryConditionText.textContent = d ? `Condição ${Math.round(d.current / d.max * 100)}%` : "Quebrado";
  } else ui.inventoryConditionText.textContent = equippedDef ? categoryLabel(equippedDef.category) : "Sem equipamento";

  ui.inventoryList.innerHTML = "";

  if (inventorySelectedId && !itemExists(inventorySelectedId)) inventorySelectedId = null;
  if (!inventorySelectedId && entries.length) inventorySelectedId = entries[0].id;

  if (!entries.length) {
    ui.inventoryList.innerHTML = `<div class="inventory-empty"><img src="assets/ui/nav_inventory.png" alt=""><strong>NENHUM ITEM</strong><span>Ajuste o filtro ou explore o condado.</span></div>`;
    renderItemDetail(null);
    return;
  }

  for (const entry of entries) {
    const def = ITEM_DEFS[entry.id];
    const durability = entry.durability != null ? Math.max(0, entry.durability / def.maxDurability * 100) : null;
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = `inventory-slot-v2 ${inventorySelectedId === entry.id ? "selected" : ""} ${selectedItemId() === entry.id ? "equipped" : ""}`;
    slot.dataset.itemId = entry.id;
    slot.draggable = true;
    slot.style.setProperty("--category-tone", categoryTone(def.category));
    slot.title = `${def.name}
${def.description}`;
    slot.innerHTML = `
      <span class="inv-slot-icon">${itemIconHtml(entry.id,"inventory-slot-icon",42)}</span>
      ${entry.qty > 1 ? `<b class="inv-slot-count">${entry.qty}</b>` : ""}
      <span class="inv-slot-name">${def.name}</span>
      <small>${categoryLabel(def.category)}</small>
      ${durability != null ? `<i class="inv-slot-dur"><b style="width:${durability}%"></b></i>` : ""}
      ${selectedItemId() === entry.id ? `<em class="equipped-mark">EM MÃOS</em>` : ""}
    `;
    slot.addEventListener("click", () => {
      inventorySelectedId = entry.id;
      renderInventory();
    });
    slot.addEventListener("dblclick", () => {
      primaryItemAction(entry.id);
      renderInventory(); renderHotbar(); updateUI();
    });
    slot.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/item-id", entry.id);
      e.dataTransfer.effectAllowed = "copy";
      slot.classList.add("dragging");
    });
    slot.addEventListener("dragend", () => slot.classList.remove("dragging"));
    ui.inventoryList.appendChild(slot);
  }

  renderItemDetail(inventorySelectedId);
}

function equipItem(id) {
  if (!itemExists(id)) {
    showToast("Você não possui esse item");
    return;
  }

  hotbar[selected] = id;
  showToast(`${ITEM_DEFS[id].name} equipado no slot ${selected + 1}`);
}

function useItem(id) {
  const def = ITEM_DEFS[id];
  if (!def || !itemExists(id)) return false;

  if (def.category === "food" && survival.hunger >= 99 && (!def.thirst || def.thirst <= 0)) {
    showToast("Você não está com fome");
    return false;
  }

  if (def.category === "drink" && survival.thirst >= 99) {
    showToast("Você não está com sede");
    return false;
  }

  // permanent upgrades are used straight from the backpack
  if (def.upgradeCarry) {
    inventory.remove(id, 1);
    inventory.maxWeight += def.upgradeCarry;
    showToast(`Capacidade permanente aumentada para ${(inventory.capacity?.() || inventory.maxWeight).toFixed(0)} kg`, 'good');
    renderHotbar(); renderInventory(); updateUI();
    return true;
  }

  if (!["food", "drink", "medical"].includes(def.category)) return false;

  if (def.category === "medical") {
    if (id === "bandage") {
      const treated = injuries.bandage();
      if (!treated && survival.health >= survival.maxHealth) {
        showToast("Nenhum sangramento para tratar");
        return false;
      }
    } else if (id === "disinfectant") {
      const treated = injuries.disinfect();
      if (!treated) {
        showToast("Nenhum ferimento para higienizar");
        return false;
      }
    } else if (id === "medicine" && survival.health >= survival.maxHealth && injuries.all().length === 0) {
      showToast("Você não precisa do kit médico agora");
      return false;
    }
  }

  // Stage 31: o frescor da porção decide o quanto ela realmente alimenta, e
  // comida crua ou passada é uma aposta com a própria saúde.
  const perishRow = FoodSystem.perishable(id) ? inventory.first(id) : null;
  const meal = def.category === "food" || def.category === "drink" ? food.consume(id, perishRow) : null;

  inventory.remove(id, 1);
  if (def.category === "medical") {
    if (id === "medicine") {
      survival.health = Math.min(survival.maxHealth, survival.health + Math.round((def.health || 0) * (1 + clothingStats().medicalBonus)));
      injuries.healOne();
    } else if (id === "bandage") {
      survival.health = Math.min(survival.maxHealth, survival.health + Math.round(5 * (1 + clothingStats().medicalBonus)));
    }
  } else if (meal) {
    survival.consume({ hunger: meal.hunger, thirst: meal.thirst });
  } else survival.consume(def);

  if (def.returnItem) inventory.add(def.returnItem, 1);

  if (meal?.sick) showToast('Aquilo caiu mal — você passou mal', 'danger');
  else if (meal && meal.warm) showToast(`${def.name}: refeição quente`, 'good');
  else if (meal && meal.potency < .7) showToast(`${def.name}: comida passada, alimentou pouco`, 'warn');
  else showToast(def.category === "drink" ? "Sede reduzida" : def.category === "medical" ? "Tratamento aplicado" : "Fome reduzida");
  renderHotbar();
  renderInventory();
  updateUI();
  return true;
}


let craftFilter = "TODOS";

function persistCraftUi() {
  localStorage.setItem("lc_craft_favorites", JSON.stringify([...craftFavorites]));
  localStorage.setItem("lc_craft_pinned", craftPinnedId || "");
}

function craftSourceHint(recipe) {
  // Stage 42: name the places for what is missing; otherwise say what it feeds.
  const missing = crafting.materialStatus(recipe).filter(r => r.have < r.need);
  if (missing.length) return missing.slice(0, 2).map(r => `${(r.def?.name || r.id).toUpperCase()}: ${s42Source(r.id)}`).join(' · ');
  const used = s42UsedIn(recipe.output?.id).filter(n => n !== recipe.name).slice(0, 3);
  if (used.length) return `USADO EM: ${used.join(', ')}`;
  if (recipe.category === "MINERAÇÃO") return "MINA / PEDREIRA / GALERIAS";
  if (recipe.category === "ARMAS") return "OFICINA / DELEGACIA / BLACKRIDGE";
  if (recipe.category === "MEDICINA") return "CLÍNICA / HOSPITAL / FARMÁCIA";
  if (recipe.category === "GARAGEM") return "OFICINA / GARAGEM / VEÍCULOS";
  if (recipe.category === "ELÉTRICA") return "SUBESTAÇÃO / INDUSTRIAL";
  if (recipe.category === "CONSTRUÇÃO") return "BASE / SUCATA / MADEIRA";
  return "EXPLORAÇÃO / BASE";
}

function craftIngredientHtml(recipe) {
  return crafting.materialStatus(recipe).map(row => {
    const ok = row.have >= row.need;
    return `<span class="ingredient-chip ${ok?'ok':'missing'}" title="${row.def?.description||''}">${row.def ? itemIconHtml(row.id,"ingredient-icon",18) : ''}<b>${row.def?.name||row.id}</b><em>${row.have}/${row.need}</em></span>`;
  }).join("");
}

function renderPinnedRecipe() {
  const recipe = CRAFT_RECIPES.find(r => r.id === craftPinnedId);
  if (!recipe) {
    if (ui.pinnedRecipe) { ui.pinnedRecipe.classList.add("hidden"); ui.pinnedRecipe.innerHTML=""; }
    if (ui.craftTracker) { ui.craftTracker.classList.add("hidden"); ui.craftTracker.innerHTML=""; }
    return;
  }
  const rows = crafting.materialStatus(recipe);
  const complete = rows.every(r => r.have >= r.need);
  const summary = rows.map(r => `${r.def?.name||r.id} ${Math.min(r.have,r.need)}/${r.need}`).join(" · ");
  if (ui.pinnedRecipe) {
    ui.pinnedRecipe.classList.remove("hidden");
    ui.pinnedRecipe.innerHTML = `<div><span>RECEITA FIXADA</span><strong>${recipe.name}</strong><small>${summary}</small></div><button id="unpinRecipeButton" type="button">×</button>`;
    document.getElementById("unpinRecipeButton")?.addEventListener("click",()=>{ craftPinnedId=""; persistCraftUi(); renderPinnedRecipe(); renderCrafting(); });
  }
  if (ui.craftTracker) {
    ui.craftTracker.classList.remove("hidden");
    ui.craftTracker.classList.toggle("ready",complete && crafting.isUnlocked(recipe,player));
    ui.craftTracker.innerHTML = `<span>PROJETO</span><strong>${recipe.name}</strong><small>${summary}</small>`;
  }
}

function renderCraftFilters() {
  if (!ui.craftFilters || ui.craftFilters.children.length) return;
  for (const category of CRAFT_CATEGORIES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = category;
    btn.className = category === craftFilter ? "active" : "";
    btn.addEventListener("click", () => {
      craftFilter = category;
      [...ui.craftFilters.children].forEach(c => c.classList.toggle("active", c === btn));
      renderCrafting();
    });
    ui.craftFilters.appendChild(btn);
  }
}

function craftRecipeMatches(recipe) {
  if (craftFilter !== "TODOS" && recipe.category !== craftFilter) return false;
  if (craftFavoritesOnly && !craftFavorites.has(recipe.id)) return false;
  const q=craftQuery.trim().toLowerCase();
  if(!q)return true;
  const out=ITEM_DEFS[recipe.output?.id];
  const ingredients=Object.keys(recipe.cost).map(id=>ITEM_DEFS[id]?.name||id).join(" ");
  return [recipe.name,recipe.description,recipe.category,out?.name||"",ingredients,craftSourceHint(recipe)].join(" ").toLowerCase().includes(q);
}

function doCraft(recipeId, amount=1) {
  const result = crafting.craftMany(recipeId, player, amount);
  showToast(result.ok ? `${result.recipe.name}: ${result.crafted} lote${result.crafted>1?'s':''}` : result.reason, result.ok ? 'good' : 'warn');
  if (result.ok) {
    inventorySelectedId = result.recipe.output.id;
    fx.grit(player.x + player.w / 2, player.y + player.h, Math.min(8,3+result.crafted), .5);
  }
  renderHotbar(); renderInventory(); updateUI(); renderPinnedRecipe();
}

// Stage 42: the journey on top of the crafting pane — where you are, what to
// do next and what it opens. One glance, no manual.
function renderJourneyStrip() {
  const el = document.getElementById('journeyStrip');
  if (!el) return;
  // The field inventory (Stage 29) folds crafting into a collapsed panel: the
  // journey goes to the top of that column and crafting starts open, with a
  // count of what can be made right now.
  const column = el.closest?.('.field-transfer');
  if (column && el.parentElement !== column) column.querySelector?.('header')?.after?.(el);
  const fold = document.querySelector?.('.field-crafting');
  if (fold) {
    if (!fold.dataset.s42) { fold.open = true; fold.dataset.s42 = '1'; }
    const ready = CRAFT_RECIPES.filter(r => crafting.isUnlocked(r, player) && crafting.canAfford(r)).length;
    const summary = fold.querySelector?.('summary');
    if (summary) summary.textContent = `FABRICAÇÃO DE CAMPO · ${ready} pronta${ready === 1 ? '' : 's'}`;
  }
  const j = journey42.current();
  const steps = S42_JOURNEY.map((st, i) => `<i class="${i < j.index || j.complete ? 'done' : i === j.index ? 'now' : ''}" title="${st.title}">${st.short}</i>`).join('');
  const tasks = j.complete ? '' : j.tasks.map(t => `<li class="${t.done ? 'done' : ''}">${t.done ? '✓' : '·'} ${t.label}</li>`).join('');
  el.innerHTML = `<div class="journey-steps">${steps}</div>
    <strong>${j.complete ? 'JORNADA COMPLETA' : `ETAPA ${j.index + 1}/${j.total} · ${j.step.title.toUpperCase()}`}</strong>
    <p>${j.complete ? 'Toda a tecnologia conhecida do condado está liberada.' : j.step.goal}</p>
    ${j.complete ? '' : `<ul>${tasks}</ul><small>PRÓXIMO DESBLOQUEIO · ${j.step.unlock.toUpperCase()} — ${j.step.where}</small>`}`;
}

function renderCrafting() {
  if (!ui.craftList) return;
  progression.observe();
  renderCraftFilters();
  if (ui.craftFavoritesButton) ui.craftFavoritesButton.classList.toggle("active", craftFavoritesOnly);

  const bench = building.hasWorkbenchNear(player);
  const autoBench = building.hasAutoBenchNear(player);
  const furnace = building.hasFurnaceNear(player);
  const fire = nearActiveCampfire(3.4);
  const tier = progression.current();
  const weaponBench = journey42.weaponBenchNear(player, false);
  const station = weaponBench ? (weaponBench.powered ? "ARMAMENTO" : "ARMAMENTO SEM ENERGIA") : autoBench ? "GARAGEM" : furnace ? "FORNALHA" : bench ? "BANCADA" : fire ? "FOGUEIRA" : "CAMPO";
  ui.benchStatus.textContent = `${tier.short} ${tier.name} · ${station}`;
  ui.benchStatus.classList.toggle("online", bench || autoBench || furnace || fire || Boolean(weaponBench?.powered));
  renderJourneyStrip();
  ui.craftList.innerHTML = "";

  const recipes = CRAFT_RECIPES.filter(craftRecipeMatches);
  if (!recipes.length) {
    ui.craftList.innerHTML = `<div class="loot-empty"><strong>NENHUMA RECEITA</strong><span>Altere busca, categoria ou favoritas.</span></div>`;
    renderPinnedRecipe();
    return;
  }

  recipes.sort((a,b)=>{
    const fav=(r)=>craftFavorites.has(r.id)?4:0;
    const score=r=>fav(r)+(crafting.isUnlocked(r,player)?2:0)+(crafting.canAfford(r)?1:0);
    return score(b)-score(a)||a.name.localeCompare(b.name);
  });

  for (const recipe of recipes) {
    const unlocked=crafting.isUnlocked(recipe,player);
    const affordable=crafting.canAfford(recipe);
    const max=crafting.maxCraftable(recipe,player);
    const favorite=craftFavorites.has(recipe.id);
    const pinned=craftPinnedId===recipe.id;
    const out=recipe.output?.id||recipe.id;
    const card=document.createElement("article");
    card.className=`craft-card craft-card-v2 ${unlocked?'':'locked'} ${affordable&&unlocked?'affordable':''} ${pinned?'pinned':''}`;
    card.innerHTML=`
      <div class="craft-icon">${ITEM_DEFS[out]?itemIconHtml(out,"craft-item-icon",40):""}</div>
      <div class="craft-copy">
        <header><h3>${recipe.name}${recipe.output.qty>1?` ×${recipe.output.qty}`:""}</h3><span class="tag">${recipe.category} · ${journey42.recipeKind(recipe)}</span></header>
        <p>${recipe.description}</p>
        <div class="ingredient-list">${craftIngredientHtml(recipe)}</div>
        <small class="craft-source">${crafting.canAfford(recipe) ? '' : 'ONDE BUSCAR · '}${craftSourceHint(recipe)}</small>
      </div>
      <div class="craft-card-tools">
        <button type="button" class="craft-star ${favorite?'active':''}" data-favorite="${recipe.id}" title="Favoritar">★</button>
        <button type="button" class="craft-pin ${pinned?'active':''}" data-pin="${recipe.id}" title="Fixar na HUD">⌖</button>
      </div>
      <div class="craft-actions-v2">
        ${!unlocked ? `<button disabled>${crafting.requirementLabel(recipe)}</button>` : !affordable ? `<button disabled>FALTAM RECURSOS</button>` : `
          <button data-craft="${recipe.id}" data-amount="1">×1</button>
          <button data-craft="${recipe.id}" data-amount="5" ${max<5?'disabled':''}>×5</button>
          <button data-craft="${recipe.id}" data-amount="max" ${max<1?'disabled':''}>MÁX ${max}</button>`}
      </div>`;
    ui.craftList.appendChild(card);
  }

  ui.craftList.querySelectorAll("button[data-craft]").forEach(btn=>btn.addEventListener("click",()=>doCraft(btn.dataset.craft,btn.dataset.amount)));
  ui.craftList.querySelectorAll("button[data-favorite]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.dataset.favorite; craftFavorites.has(id)?craftFavorites.delete(id):craftFavorites.add(id); persistCraftUi(); renderCrafting();
  }));
  ui.craftList.querySelectorAll("button[data-pin]").forEach(btn=>btn.addEventListener("click",()=>{
    craftPinnedId=craftPinnedId===btn.dataset.pin?"":btn.dataset.pin; persistCraftUi(); renderCrafting(); renderPinnedRecipe();
  }));
  renderPinnedRecipe();
}

const BUILD_CATEGORIES = ["TODOS", ...new Set(Object.values(BUILD_DEFS).map(d => d.category))];

function renderBuildFilters() {
  if (!ui.buildFilters || ui.buildFilters.children.length) return;
  for (const category of BUILD_CATEGORIES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = category;
    btn.className = category === buildFilter ? "active" : "";
    btn.addEventListener("click", () => {
      buildFilter = category;
      [...ui.buildFilters.children].forEach(c => c.classList.toggle("active", c === btn));
      renderBuildGrid();
    });
    ui.buildFilters.appendChild(btn);
  }
}

function renderBuildGrid() {
  if (!ui.buildGrid) return;
  renderBuildFilters();
  ui.buildGrid.innerHTML = "";

  for (const [type, def] of Object.entries(BUILD_DEFS)) {
    if (buildFilter !== "TODOS" && def.category !== buildFilter) continue;
    const lock = currentGameMode === 'free' ? null : journey42.buildLock(type);
    const affordable = currentGameMode === 'free' || (!lock && building.canAfford(type));
    const card = document.createElement("article");
    card.className = `build-card ${affordable ? "affordable" : ""} ${lock ? "locked" : ""}`;
    card.style.setProperty("--build-tone", def.color || "#776a55");
    card.innerHTML = `
      <div class="build-icon"><img src="assets/build/${type}.png" alt=""></div>
      <div class="build-card-copy">
        <span class="build-category">${def.category}</span>
        <h3>${def.name}</h3>
        <p>${def.description}</p>
        <span class="cost">${lock ? lock.replace(/^[^:]*: /, '').toUpperCase() : building.costText(type)}</span>
      </div>
      <button type="button" data-build="${type}" ${affordable ? "" : "disabled"}>${currentGameMode === 'free' ? "CRIAR" : lock ? "BLOQUEADO" : affordable ? "CONSTRUIR" : "RECURSOS"}</button>`;
    ui.buildGrid.appendChild(card);
  }

  ui.buildGrid.querySelectorAll("button[data-build]").forEach(btn => {
    btn.addEventListener("click", () => {
      building.activeBlueprint = btn.dataset.build;
      buildMode = true;
      buildOpen = false;
      ui.buildModal.classList.add("hidden");
      ui.buildModeStatus.textContent = `Projeto: ${BUILD_DEFS[building.activeBlueprint].name}`;
      showToast(`${BUILD_DEFS[building.activeBlueprint].name}: clique esquerdo para construir`);
    });
  });
}

function toggleBuild(force) {
  if (gameDead) return;
  buildOpen = typeof force === "boolean" ? force : !buildOpen;
  if (buildOpen) {
    if (inventoryOpen) toggleInventory(false);
    if (containerOpen) closeContainerModal();
    renderBuildGrid();
  }
  ui.buildModal.classList.toggle("hidden", !buildOpen);
}

function cancelBuildMode() {
  buildMode = false;
  building.activeBlueprint = null;
  showToast("Modo de construção cancelado");
}

function placeBlueprintAtMouse() {
  if (!buildMode || !building.activeBlueprint) return false;
  if (!withinReach(mouse.tileX, mouse.tileY)) {
    showToast("Fora de alcance");
    return true;
  }
  const result = building.place(building.activeBlueprint, mouse.tileX, mouse.tileY, player, { free:currentGameMode === 'free' });
  if (!result.ok) {
    showToast(result.reason);
    return true;
  }
  danger.emitNoise(player.x + player.w/2, player.y + player.h/2, 180, "construção");
  fx.build(result.object.tileX * CONFIG.TILE + CONFIG.TILE / 2, result.object.tileY * CONFIG.TILE + CONFIG.TILE);
  showToast(`${BUILD_DEFS[result.object.type].name} construída`);
  renderHotbar(); renderInventory(); renderBuildGrid(); updateUI();
  return true;
}

function repairNearby() {
  if (currentGameMode === 'free') {
    const obj=building.nearestRepairable(player),result=building.repair(obj,{free:true});
    showToast(result.ok?'Estrutura restaurada':result.reason,result.ok?'good':'warn');
    if(result.ok){renderBuildGrid();updateUI();}
    return;
  }
  const hammer = selectedItemId() === "repair_hammer" && itemExists("repair_hammer");
  if (!hammer) {
    showToast("Equipe o Martelo de reparo");
    return;
  }
  const obj = building.nearestRepairable(player);
  const result = building.repair(obj);
  if (!result.ok) {
    showToast(result.reason);
    return;
  }
  const tool = inventory.damageTool("repair_hammer", 2);
  if (tool.broke) {
    cleanupBrokenItem("repair_hammer");
    showToast("Estrutura reparada, mas o martelo quebrou");
  } else showToast("Estrutura reparada");
  danger.emitNoise(player.x + player.w/2, player.y + player.h/2, 125, "reparo");
  fx.impact(player.x + player.w/2, player.y + player.h/2, "#c6baa0", 5);
  renderHotbar(); renderInventory(); updateUI();
}

function dismantleNearby() {
  if (selectedItemId() !== "crowbar" || !itemExists("crowbar")) {
    showToast("Equipe o Pé de cabra para desmontar");
    return;
  }
  const obj = building.nearestRepairable(player);
  const result = building.dismantle(obj);
  if (!result.ok) {
    showToast(result.reason);
    return;
  }
  const tool = inventory.damageTool("crowbar", 2);
  if (tool.broke) cleanupBrokenItem("crowbar");
  danger.emitNoise(player.x + player.w/2, player.y + player.h/2, 190, "desmontagem");
  fx.grit(player.x + player.w / 2, player.y + player.h, 6, .7);
  showToast(`${result.name} desmontada`);
  renderHotbar(); renderInventory(); updateUI();
}

// Doors, barricades, shutters, hatches, terminals, key hooks, fire pits.
function interactPlace() {
  const point = places.nearest(player);
  if (!point) return false;
  const result = places.use(point, player);

  if (!result.ok) {
    showToast(result.reason || 'Nada acontece', 'warn');
    if (point.kind === 'door' || point.kind === 'barricade') objectives.flag('saw_locked_door');
    if (point.needsPower) objectives.flag('saw_dead_power');
    return true;
  }

  if (result.noise) {
    const nx = player.x + player.w / 2, ny = player.y + player.h / 2;
    danger.emitNoise(nx, ny, result.noise, point.kind);
    if (result.noise >= 220) hordes.onLoudNoise(nx, result.noise);
  }
  if (result.sound === 'switch') audio.world('switch', audioPan(player.x));
  else if (result.sound === 'power_on') audio.world('power_on', audioPan(player.x));
  else if (result.sound === 'alarm') audio.world('alarm', audioPan(player.x));
  else if (result.sound === 'push') audio.world('push', audioPan(player.x));
  else if (result.sound === 'cloth') audio.world('cloth', audioPan(player.x));
  else if (result.sound === 'pump') audio.world('pump', audioPan(player.x));
  if (result.alarmOn) hordes.onLoudNoise(point.tileX * CONFIG.TILE, 900);
  if (result.damageTool) {
    const t = inventory.damageTool(result.damageTool, 2);
    if (t.broke) { cleanupBrokenItem(result.damageTool); showToast('Sua ferramenta quebrou', 'warn'); }
  }
  if (result.drops) {
    for (const [id, qty] of Object.entries(result.drops)) inventory.add(id, qty);
  }
  if (result.giveItem) {
    inventory.add(result.giveItem, 1);
    if (result.takeItem) inventory.remove(result.takeItem, 1);
    showToast(`${ITEM_DEFS[result.giveItem]?.name || 'Item'} recolhido`, 'good');
  }
  if (result.powered) showToast('Energia auxiliar religada nesta área', 'good');
  if (result.forced || result.partial) {
    player.actionTimer = .3;
    player.actionType = 'use';
    fx.debris(point.tileX * CONFIG.TILE + 16, point.tileY * CONFIG.TILE + 16, '#8a7a5c', result.forced ? 10 : 5, true);
    fx.shake = Math.max(fx.shake, result.forced ? 3 : 1.5);
  }
  if (result.note) {
    showToast(result.note, 'good');
    if (result.first) fx.screenFlash = Math.max(fx.screenFlash, .12);
  } else if (result.message) {
    showToast(result.message, result.forced ? 'good' : '');
  }
  if (point.kind === 'door' && point.name.includes('evidência') && point.state === 'open') {
    places.flags.add('evidence_opened');
  }
  renderHotbar(); renderInventory(); updateUI();
  return true;
}

// Abater a carcaça é o passo entre matar e comer. Exige lâmina, cansa e faz
// barulho suficiente para virar um problema se você caçou perto da cidade.
function interactCarcass() {
  const carcass = wildlife.nearestCarcass(player);
  if (!carcass) return false;

  // A faca na mão vale primeiro; sem ela, a melhor lâmina da mochila serve.
  const blades = ['butcher_knife', 'machete', 'knife', 'hatchet', 'fire_axe', 'stone_axe'];
  const held = selectedItemId();
  const blade = blades.includes(held) && itemExists(held) ? held : blades.find(id => itemExists(id));
  const res = wildlife.butcher(carcass, {
    hasBlade: Boolean(blade),
    bonus: blade ? (ITEM_DEFS[blade]?.butcherBonus ?? (blade === 'machete' || blade === 'hatchet' ? .12 : 0)) : 0
  });
  if (!res.ok) { showToast(res.reason, 'warn'); return true; }

  const parts = Object.entries(res.gained).filter(([id]) => id !== '__overflow')
    .map(([id, q]) => `${q} ${ITEM_DEFS[id]?.name || id}`);
  showToast(parts.length ? `${res.species.name}: ${parts.join(' · ')}` : 'Mochila cheia — nada coube', parts.length ? 'good' : 'warn');
  if (res.gained.__overflow) showToast('Parte do animal ficou para trás por peso', 'warn');

  survival.energy = Math.max(0, survival.energy - 8);
  danger.emitNoise(carcass.x, carcass.y, 95, 'abate');
  if (blade && ITEM_DEFS[blade]?.maxDurability) {
    const worn = inventory.damageTool(blade, 3);
    if (worn.broke) { cleanupBrokenItem(blade); showToast(`${ITEM_DEFS[blade].name} quebrou no abate`, 'warn'); }
  }
  objectives.flag?.('butchered_game');
  renderHotbar(); renderInventory(); updateUI();
  return true;
}

function interactBuiltObject() {
  const obj = building.nearestInteractable(player);
  if (!obj) return false;

  return building.interact(obj, {
    onDoor(open) {
      showToast(open ? "Porta aberta" : "Porta fechada");
      danger.emitNoise(player.x + player.w/2, player.y + player.h/2, 65, "porta");
    },
    onCampfire() {
      if (inventory.count("wood") < 1) {
        showToast("A fogueira precisa de 1 Madeira");
        return;
      }
      inventory.remove("wood", 1);
      survival.rest(90, true);
      worldMinutes += 90;
      danger.emitNoise(player.x + player.w/2, player.y + player.h/2, 70, "fogueira");
      showToast("Você descansou por 90 minutos");
      renderHotbar(); renderInventory(); updateUI();
    },
    onWorkbench() {
      toggleInventory(true);
      showToast("Bancada disponível: receitas avançadas liberadas");
    },
    onAutoBench() {
      toggleInventory(true);
      showToast("Garagem disponível: módulos automotivos liberados");
    },
    // Sleeping is the real payoff of having a base: it skips the night, but
    // only when nothing is hunting you.
    onBed(bed) {
      if (stage42.event.phase === 'active') {
        showToast("A base está sob pressão. Não é hora de dormir.", 'danger');
        return;
      }
      const threat = danger.nearbyThreat(player, 14);
      if (threat.count > 0) {
        showToast("Perigoso demais para dormir com infectados por perto", 'warn');
        return;
      }
      const minute = worldMinutes % 1440;
      const untilMorning = minute > 360 ? 1440 - minute + 360 : 360 - minute;
      const crossesEvent = stage42.event.nextAt > worldMinutes && stage42.event.nextAt < worldMinutes + untilMorning;
      const restMinutes = crossesEvent ? Math.max(30, stage42.event.nextAt - worldMinutes - 120) : untilMorning;
      const hours = Math.max(.5, restMinutes / 60);
      survival.rest(restMinutes, nearActiveCampfire());
      worldMinutes += restMinutes;
      danger.noiseLevel = 0;
      showToast(crossesEvent ? `Você acordou após ${hours.toFixed(1)}h — há movimento nas estradas` : `Você dormiu ${hours.toFixed(0)}h e acordou ao amanhecer`, crossesEvent ? 'warn' : 'good');
      renderHotbar(); renderInventory(); updateUI();
    },
    onBarrel(barrel) {
      if ((barrel.water || 0) < 1) {
        showToast("O barril ainda está vazio. Deixe a chuva trabalhar.", 'warn');
        return;
      }
      if (inventory.count("empty_bottle") < 1) {
        showToast("Precisa de uma garrafa vazia");
        return;
      }
      barrel.water -= 1;
      inventory.remove("empty_bottle", 1);
      inventory.add("water_bottle", 1);
      showToast("Garrafa cheia com água da chuva", 'good');
      renderHotbar(); renderInventory(); updateUI();
    },
    onRadioStation() {
      toggleRadio(true);
      showToast("Estação da base conectada ao receptor", 'good');
    },
    onStage42Defense(object) {
      const result = stage42.interactDefense(object);
      showToast(result.reason, result.ok ? 'good' : 'warn');
      if (result.ok && object.type === 'decoy_siren') audio.world('alarm', audioPan(object.tileX * CONFIG.TILE));
    },
    // --------------------------------------------------- Stage 31: horta
    onGardenPlot(plot) {
      farming.prepare(plot);
      const crop = farming.crop(plot);

      if (!crop) {
        const held = selectedItemId();
        const seed = ITEM_DEFS[held]?.category === 'seed' && itemExists(held)
          ? held
          : inventory.entries.find(e => ITEM_DEFS[e.id]?.category === 'seed')?.id;
        if (!seed) { showToast('Equipe ou carregue uma semente para plantar', 'warn'); return; }
        const res = farming.plant(plot, seed);
        showToast(res.ok ? `${res.crop.name} plantado` : res.reason, res.ok ? 'good' : 'warn');
        renderHotbar(); renderInventory(); updateUI();
        return;
      }

      if (farming.ripe(plot) || plot.vigor <= 0) {
        const res = farming.harvest(plot);
        if (!res.ok) { showToast(res.reason, 'warn'); return; }
        if (res.dead) { showToast('Canteiro limpo — a planta tinha se perdido', 'warn'); return; }
        const parts = Object.entries(res.items).filter(([, q]) => q > 0)
          .map(([id, q]) => `${q} ${ITEM_DEFS[id]?.name || id}`);
        showToast(`Colheita: ${parts.join(' · ')}`, 'good');
        objectives.flag?.('harvested_crop');
        renderHotbar(); renderInventory(); updateUI();
        return;
      }

      // Plantado e verde: o que o canteiro pede é água ou adubo.
      if (plot.water < 92) {
        const can = itemExists('watering_can') ? 'watering_can' : null;
        if (can) {
          const wear = inventory.damageTool('watering_can', 6);
          if (wear.broke) { cleanupBrokenItem('watering_can'); showToast('O regador se desfez', 'warn'); }
          farming.waterPlot(plot, 70);
          showToast(`${farming.statusText(plot)} · regado`, 'good');
        } else if (itemExists('water_bottle')) {
          inventory.remove('water_bottle', 1);
          inventory.add('empty_bottle', 1);
          farming.waterPlot(plot, 55);
          showToast(`${farming.statusText(plot)} · regado com a garrafa`, 'good');
        } else {
          showToast(`${farming.statusText(plot)} — precisa de água`, 'warn');
          renderHotbar(); renderInventory(); updateUI();
          return;
        }
        renderHotbar(); renderInventory(); updateUI();
        return;
      }

      const fert = farming.fertilize(plot);
      showToast(fert.ok ? `${crop.name}: composto aplicado` : farming.statusText(plot), fert.ok ? 'good' : '');
      renderHotbar(); renderInventory(); updateUI();
    },

    onTrough(trough) {
      if (trough.water == null) trough.water = 0;
      if (inventory.count('water_bottle') < 1) {
        showToast(`Calha de irrigação · ${(trough.water).toFixed(1)}/10 · encha com garrafas cheias`, trough.water > 0 ? '' : 'warn');
        return;
      }
      inventory.remove('water_bottle', 1);
      inventory.add('empty_bottle', 1);
      trough.water = Math.min(10, trough.water + 3);
      showToast(`Calha abastecida · ${trough.water.toFixed(1)}/10`, 'good');
      renderHotbar(); renderInventory(); updateUI();
    },

    onSnare(trap) {
      const res = wildlife.collectTrap(trap);
      if (!res.ok) { showToast(res.reason, 'warn'); return; }
      const parts = Object.entries(res.gained).map(([id, q]) => `${q} ${ITEM_DEFS[id]?.name || id}`);
      showToast(parts.length ? `${res.species.name} na armadilha: ${parts.join(' · ')}` : 'Mochila cheia demais', parts.length ? 'good' : 'warn');
      renderHotbar(); renderInventory(); updateUI();
    },

    onCookStation(object) {
      toggleInventory(true);
      showToast(object.type === 'stove'
        ? 'Fogão aceso: receitas preparadas liberadas'
        : 'Varal disponível: conservas e curtume liberados', 'good');
    },

    onBaseStation(object) {
      togglePeople(true);
      const label = BUILD_DEFS[object.type]?.name || 'Estação da base';
      showToast(`${label}: equipe da base disponível`, 'good');
    },
    onStage39(object) {
      const result = sustainable.interact(object);
      if (!result.ok) return;
      if (result.openPanel) toggleSustainability(true);
      if (result.message) showToast(result.message, result.tone || '');
      if (result.inventory) { renderHotbar(); renderInventory(); updateUI(); }
      if (result.containerId != null) {
        const box = structures.containers.find(c => c.id === result.containerId);
        if (box) { activeContainer=box;box.discovered=true;containerOpen=true;ui.containerModal.classList.remove('hidden');renderContainer(); }
      }
    },
    onStage40(object) {
      const result=greenwater.interact(object);if(!result.ok)return;
      if(result.openPanel)toggleSustainability(true);
      if(result.message)showToast(result.message,result.tone||'');
      if(result.inventory){renderHotbar();renderInventory();updateUI();}
    }
  });
}


function questStatusLabel(status) {
  return status === "active" ? "ATIVO" : status === "completed" ? "CONCLUÍDO" : "DISPONÍVEL";
}

function renderNpcModal() {
  if (!activeNPC) return;
  const npc = activeNPC;
  society.discover(npc);

  ui.npcFactionText.textContent = society.factionName(npc.faction).toUpperCase();
  ui.npcNameText.textContent = npc.name.toUpperCase();
  ui.npcProfessionText.textContent = npc.profession;
  ui.npcRelationLabel.textContent = society.relationLabel(npc.relation);
  ui.npcRelationText.textContent = Math.round(npc.relation);
  ui.npcRelationFill.style.width = `${Math.max(0, Math.min(100, npc.relation))}%`;
  const traits = (npc.traits || []).join(' · ');
  ui.npcPersonalityText.textContent = `${npc.personality}${traits ? ` · ${traits}` : ''} · Moral ${Math.round(npc.morale ?? 60)}%`;
  ui.npcDialogueText.textContent = society.dialogueFor(npc);
  if (ui.npcPortraitImage) {
    ui.npcPortraitImage.src = `assets/portraits/${npc.id}.png`;
    ui.npcPortraitImage.alt = npc.name;
  }
  ui.npcPortrait.style.setProperty("--npc-tone", npc.color);

  const q = npc.quest;
  const progress = society.questProgress(npc);
  ui.npcQuestTitle.textContent = q.title;
  ui.npcQuestStatus.textContent = questStatusLabel(q.status);
  ui.npcQuestDesc.textContent = q.description;
  ui.npcQuestProgress.textContent = q.status === "available" ? "Ainda não aceito" : q.status === "completed" ? "Trabalho entregue" : progress.text;

  if (q.status === "available") {
    ui.questActionButton.textContent = "ACEITAR TRABALHO";
    ui.questActionButton.disabled = false;
  } else if (q.status === "active") {
    ui.questActionButton.textContent = progress.complete ? "ENTREGAR / CONCLUIR" : "OBJETIVO INCOMPLETO";
    ui.questActionButton.disabled = !progress.complete;
  } else {
    ui.questActionButton.textContent = "TRABALHO CONCLUÍDO";
    ui.questActionButton.disabled = true;
  }

  ui.npcScripText.textContent = society.scrip();
  ui.npcTradeStock.innerHTML = "";
  for (const offer of npc.trade) {
    const def = ITEM_DEFS[offer.id];
    const row = document.createElement("div");
    row.className = "trade-row";
    row.innerHTML = `<span class="trade-icon">${itemIconHtml(offer.id,"trade-item-icon",30)}</span><div><strong>${def.name}</strong><small>${offer.stock} estoque · ${offer.price} fichas</small></div><button type="button" data-buy="${offer.id}" ${offer.stock <= 0 || society.scrip() < offer.price ? "disabled" : ""}>COMPRAR</button>`;
    ui.npcTradeStock.appendChild(row);
  }

  ui.npcSellList.innerHTML = "";
  const sellable = inventory.list().filter(e => e.id !== "county_scrip");
  if (!sellable.length) {
    ui.npcSellList.innerHTML = `<div class="trade-row"><div><strong>NADA PARA VENDER</strong><small>Sua mochila está vazia.</small></div></div>`;
  } else {
    for (const entry of sellable) {
      const def = ITEM_DEFS[entry.id];
      const price = society.sellPrice(npc, entry.id);
      const row = document.createElement("div");
      row.className = "trade-row";
      row.innerHTML = `<span class="trade-icon">${itemIconHtml(entry.id,"trade-item-icon",30)}</span><div><strong>${def.name}</strong><small>×${entry.qty} · recebe ${price} ficha${price === 1 ? "" : "s"}</small></div><button type="button" data-sell="${entry.id}" ${price <= 0 ? "disabled" : ""}>VENDER 1</button>`;
      ui.npcSellList.appendChild(row);
    }
  }

  ui.npcTradeStock.querySelectorAll("button[data-buy]").forEach(btn => btn.addEventListener("click", () => {
    const result = society.buy(npc, btn.dataset.buy);
    showToast(result.ok ? "Troca concluída" : result.reason);
    renderNpcModal(); renderInventory(); renderHotbar(); updateUI();
  }));

  ui.npcSellList.querySelectorAll("button[data-sell]").forEach(btn => btn.addEventListener("click", () => {
    const result = society.sell(npc, btn.dataset.sell);
    showToast(result.ok ? `+${result.price} fichas` : result.reason);
    renderNpcModal(); renderInventory(); renderHotbar(); updateUI();
  }));

  const canRecruit = society.canRecruit(npc);
  ui.recruitButton.classList.toggle("hidden", !canRecruit || npc.recruited);
  ui.dismissButton.classList.toggle("hidden", !npc.recruited);
  if (npc.recruited) ui.dismissButton.textContent = society.activeCompanionId === npc.id ? "MANDAR PARA BASE" : "VIAJAR COMIGO";
}

function openNpc(npc) {
  if (!npc || gameDead) return;
  activeNPC = npc;
  npcOpen = true;
  society.discover(npc);
  ui.npcModal.classList.remove("hidden");
  renderNpcModal();
  renderPeoplePanel();
}

function closeNpcModal() {
  npcOpen = false;
  activeNPC = null;
  ui.npcModal.classList.add("hidden");
}

function renderPeoplePanel() {
  if (!ui.peopleList) return;
  const known = society.knownNPCs();
  ui.knownPeopleText.textContent = known.length;
  ui.peopleList.innerHTML = "";

  if (!known.length) {
    ui.peopleList.innerHTML = `<div class="person-row"><div><strong>NENHUM CONTATO</strong><small>Converse com sobreviventes pelo mundo.</small></div></div>`;
  } else {
    for (const npc of known) {
      const row = document.createElement("div");
      row.className = "person-row";
      const q = npc.quest.status === "active" ? ` · missão ${society.questProgress(npc).text}` : npc.quest.status === "completed" ? " · trabalho concluído" : "";
      const baseRole = npc.baseResident ? ` · BASE: ${baseCamp.jobFor(npc).label}` : society.activeCompanionId === npc.id ? ' · EM EXPEDIÇÃO' : '';
      const traits = (npc.traits || []).slice(0,2).join(' · ');
      row.innerHTML = `<div><strong>${npc.name}</strong><small>${npc.profession} · ${society.relationLabel(npc.relation)} · moral ${Math.round(npc.morale ?? 60)}%${baseRole}${q}</small>${traits ? `<span class="npc-traits">${traits}</span>` : ''}</div><button type="button" data-person="${npc.id}">DETALHES</button>`;
      ui.peopleList.appendChild(row);
    }
  }

  ui.factionList.innerHTML = "";
  for (const [id, def] of Object.entries(SOCIETY_FACTIONS)) {
    const value = society.factionRep[id] || 0;
    const row = document.createElement("div");
    row.className = "faction-row";
    row.innerHTML = `<div><strong>${def.name}</strong><small>${Math.round(value)}</small></div><div class="faction-meter"><i style="width:${Math.max(0,Math.min(100,value))}%;background:${def.tone}"></i></div>`;
    ui.factionList.appendChild(row);
  }

  const companion = society.activeCompanionId ? society.get(society.activeCompanionId) : null;
  const residents = society.baseResidents();
  ui.companionText.textContent = companion ? `${companion.name} · ${companion.profession} · ${residents.length} na base` : residents.length ? `${residents.length} sobrevivente${residents.length>1?"s":""} na base` : "Nenhum";
  for (const [btn, mode] of [[ui.companionFollowButton,'follow'],[ui.companionHoldButton,'hold'],[ui.companionAvoidButton,'avoid']]) {
    if (!btn) continue;
    btn.disabled = !companion;
    btn.classList.toggle('active', Boolean(companion && society.companionMode === mode));
  }
  if (ui.companionBaseButton) ui.companionBaseButton.disabled = !companion;

  if (ui.baseLevelText) ui.baseLevelText.textContent = baseCamp.anchor() ? `NÍVEL ${baseCamp.level()} · ${baseCamp.levelName().toUpperCase()}` : 'SEM BASE DEFINIDA';
  if (ui.baseResidentText) {
    const jobs = residents.map(n => `${n.name.split(' ')[0]}: ${baseCamp.jobFor(n).label}`).join(' · ');
    ui.baseResidentText.textContent = residents.length ? `${residents.length} residente${residents.length>1?'s':''} · ${jobs}` : 'Construa uma cama e recrute sobreviventes';
  }
  if (ui.baseStations) {
    ui.baseStations.innerHTML = baseCamp.stationSummary().map(s => `<span class="${s.online?'on':''}">${s.label}</span>`).join('');
  }
  if (ui.baseStockList) {
    const stock = baseCamp.stockEntries();
    ui.baseStockList.innerHTML = stock.length ? stock.map(e => `<div class="base-stock-row"><span>${e.def?.name || e.id}</span><strong>×${e.qty}</strong></div>`).join('') : '<small>Nenhum suprimento produzido.</small>';
  }
  if (ui.settlementMoraleText || ui.settlementEventText) {
    const ss = campaign.settlementSummary();
    if (ui.settlementMoraleText) ui.settlementMoraleText.textContent = `MORAL ${ss.morale}% · ${ss.active} OPERAÇÃO${ss.active===1?'':'ÕES'}`;
    if (ui.settlementEventText) ui.settlementEventText.textContent = ss.event;
  }
  if (ui.residentRequestList) {
    const requests = campaign.requests.filter(r => r.status === 'active');
    ui.residentRequestList.innerHTML = requests.length ? requests.map(r => {
      const npc = society.get(r.npcId); const p = campaign.requestProgress(r);
      return `<div class="resident-request-row"><strong>${npc?.name || 'Morador'} · ${r.title}</strong><small>${r.text}<br>${p.text}</small><button type="button" data-request="${r.id}" ${p.complete?'':'disabled'}>ENTREGAR</button></div>`;
    }).join('') : '<small>Nenhum pedido pessoal agora.</small>';
    ui.residentRequestList.querySelectorAll('button[data-request]').forEach(btn => btn.addEventListener('click', () => {
      const r = campaign.fulfillRequest(btn.dataset.request);
      showToast(r.ok ? `${r.npc?.name || 'Morador'}: pedido concluído` : r.reason, r.ok ? 'good' : 'warn');
      renderPeoplePanel(); renderInventory(); renderHotbar();
    }));
  }
  if (ui.campaignOperationList) {
    const ops = campaign.operations.filter(o => o.status === 'active' && o.heard);
    ui.campaignOperationList.innerHTML = ops.length ? ops.map(o => `<div class="campaign-operation-row"><strong>${o.title}</strong><small>${o.targetName} · ${o.kind === 'power' ? 'restaure a energia' : o.kind === 'rescue' ? 'localize e torne a área segura' : 'investigue a área'} · dia ${o.expiresDay}</small><span class="risk">RISCO ${o.risk}</span></div>`).join('') : '<small>Ouça o rádio da base para descobrir operações maiores.</small>';
  }

  if (ui.saveStatusText) {
    const saved = SaveGameSystem.peek();
    ui.saveStatusText.textContent = saved ? `SLOT 1 · DIA ${Math.floor((saved.worldMinutes || 0)/1440)+1}` : 'AUTOSAVE ATIVO · SEM SAVE';
  }

  ui.peopleList.querySelectorAll("button[data-person]").forEach(btn => btn.addEventListener("click", () => {
    const npc = society.get(btn.dataset.person);
    peopleOpen = false;
    ui.peopleModal.classList.add("hidden");
    openNpc(npc);
  }));
}

function togglePeople(force) {
  if (gameDead) return;
  peopleOpen = typeof force === "boolean" ? force : !peopleOpen;
  if (peopleOpen) {
    if (inventoryOpen) toggleInventory(false);
    if (buildOpen) toggleBuild(false);
    if (containerOpen) closeContainerModal();
    if (npcOpen) closeNpcModal();
    renderPeoplePanel();
  }
  ui.peopleModal.classList.toggle("hidden", !peopleOpen);
}

function interactNPC() {
  const npc = society.nearestNPC(player);
  if (!npc) return false;
  openNpc(npc);
  return true;
}


function mapStructurePoint(s) {
  const tx = (s.x + s.endX) * .5;
  let ty;
  if (s.underground) ty = ((s.y1 ?? s.yTop ?? s.groundY - 8) + (s.y2 ?? s.yBottom ?? s.groundY + 2)) * .5;
  else ty = Math.max(4, (s.groundY ?? world.groundY(Math.floor(tx))) - 5);
  return { tx, ty };
}

function renderCountyMap() {
  if (!ui.countyMap) return;
  countyMapView.render();
  const pc = player.center();
  const ptx = pc.x / CONFIG.TILE, pty = pc.y / CONFIG.TILE;
  const region = world.region(Math.max(0, Math.min(CONFIG.WORLD_W - 1, Math.floor(ptx))));
  ui.mapPositionText.textContent = `X ${Math.floor(ptx)} · Y ${Math.floor(pty)}`;
  ui.mapRegionText.textContent = region.name;
  const discovered = structures.structures.filter(s => s.discovered).length;
  ui.mapDiscoveryText.textContent = `${discovered}/${structures.structures.length} locais`;
  ui.mapMarkerText.textContent = `${mapMarkers.length} marcador${mapMarkers.length === 1 ? '' : 'es'}`;
  if (ui.mapSignalText) {
    const signals = baseCamp.activeMapSignals().length + campaign.activeMapSignals().length + campaign.majorEventMapSignal().length;
    ui.mapSignalText.textContent = `${signals} sinal${signals === 1 ? '' : 'is'} de rádio`;
  }
  // Stage 42: the side panel is the journey — where you are, what next, where.
  const j = journey42.current(), prog = progression.summary();
  ui.progressionTierText.textContent = j.complete ? 'JORNADA COMPLETA' : `ETAPA ${j.index + 1}/${j.total} · ${j.step.title}`;
  ui.progressionHintText.textContent = j.complete ? 'A tecnologia de Blackridge está nas suas mãos.' : j.step.goal;
  const whereEl = document.getElementById('journeyWhereText');
  if (whereEl) whereEl.textContent = j.complete ? '' : `ONDE · ${j.step.where}`;
  const nextEl = document.getElementById('journeyNextText');
  if (nextEl) nextEl.textContent = `${prog.current.short} · ${prog.current.name}${j.complete ? '' : ` · PRÓXIMO: ${j.step.unlock}`}`;
}

function toggleMap(force) {
  if (gameDead) return;
  mapOpen = typeof force === 'boolean' ? force : !mapOpen;
  if (mapOpen) {
    if (inventoryOpen) toggleInventory(false);
    if (buildOpen) toggleBuild(false);
    if (containerOpen) closeContainerModal();
    if (npcOpen) closeNpcModal();
    if (peopleOpen) togglePeople(false);
    if (radioOpen) toggleRadio(false);
    if (archiveOpen) toggleArchive(false);
    if (vehicleOpen) closeVehicleModal();
    { const pc = player.center(); countyMapView.centerOn(pc.x / CONFIG.TILE, pc.y / CONFIG.TILE); countyMapView.clampCenter(); }
    renderCountyMap();
  }
  ui.mapModal.classList.toggle('hidden', !mapOpen);
}

function renderSustainability() {
  if (!ui.sustainabilityModal) return;
  const r = sustainable.report(), p = r.power;
  ui.stage39FoodDays.textContent = `${r.foodDays.toFixed(1)} dias`;
  ui.stage39Water.textContent = `${r.water.toFixed(0)} L`;
  ui.stage39Farm.textContent = `${r.farm.planted}/${r.farm.total} · ${r.farm.ripe} pronto${r.farm.ripe === 1 ? '' : 's'}`;
  ui.stage39Comfort.textContent = `${r.comfort}%`;
  ui.stage39PowerState.textContent = !power.nodes().length ? 'SEM REDE' : p.shed ? `${p.shed} SISTEMA${p.shed === 1 ? '' : 'S'} CORTADO${p.shed === 1 ? '' : 'S'}` : p.online ? 'REDE ESTÁVEL' : 'BLACKOUT';
  ui.stage39Production.textContent = `${p.production.toFixed(1)} kW`;
  ui.stage39Demand.textContent = `${p.demand.toFixed(1)} kW`;
  ui.stage39Battery.textContent = `${p.stored.toFixed(1)}/${p.capacity.toFixed(0)} kWh`;
  const scale = Math.max(1, p.production, p.demand);
  ui.stage39ProductionFill.style.width = `${Math.min(100,p.production/scale*100)}%`;
  ui.stage39DemandFill.style.width = `${Math.min(100,p.demand/scale*100)}%`;
  ui.stage39BatteryFill.style.width = `${p.capacity ? Math.min(100,p.stored/p.capacity*100) : 0}%`;
  const priorityLabel = ['','ESSENCIAL','IMPORTANTE','NORMAL','DESLIGA PRIMEIRO'];
  const consumers = power.consumers();
  ui.stage39Consumers.innerHTML = consumers.length ? consumers.map(o => {
    const d=power.consumerProfile(o.type);return `<div class="consumer-row ${o.powered?'on':''}"><div><strong>${d.label}</strong><small>${d.demand.toFixed(2)} kW · ${o.powered?'LIGADO':'SEM ENERGIA'}</small></div><span>P${o.powerPriority}</span><button type="button" data-power-priority="${o.id}">${priorityLabel[o.powerPriority]}</button></div>`;
  }).join('') : '<small>Nenhum aparelho conectado.</small>';
  ui.stage39Consumers.querySelectorAll('[data-power-priority]').forEach(btn=>btn.addEventListener('click',()=>{const o=building.objects.find(v=>v.id===Number(btn.dataset.powerPriority));power.cyclePriority(o);renderSustainability();}));
  ui.stage39Rooms.innerHTML = r.rooms.map(room=>`<div class="room-chip ${room.online?'on':''}">${room.label}</div>`).join('');
  ui.togglePowerOverlay.textContent = sustainable.overlay ? 'OCULTAR REDE' : 'VER REDE';
}

function toggleSustainability(force) {
  if (gameDead || !ui.sustainabilityModal) return;
  const opening = typeof force === 'boolean' ? force : !sustainabilityOpen;
  if (opening) {
    sustainabilityOpen = false;
    closeTopModal();
    sustainabilityOpen = true;
    renderSustainability();
  } else sustainabilityOpen = false;
  ui.sustainabilityModal.classList.toggle('hidden', !sustainabilityOpen);
}

function mapClick(e) {
  if (!mapOpen || !ui.countyMap) return;
  if (!countyMapView.takeClick()) return;
  const hit = countyMapView.toTile(e.clientX, e.clientY);
  const tx = Math.max(0, Math.min(CONFIG.WORLD_W - 1, Math.floor(hit.tx)));
  const ty = Math.max(0, Math.min(CONFIG.WORLD_H - 1, Math.floor(hit.ty)));
  const existing = mapMarkers.findIndex(m => Math.abs(m.tileX - tx) <= 5 && Math.abs(m.tileY - ty) <= 5);
  if (existing >= 0) mapMarkers.splice(existing, 1);
  else mapMarkers.push({ tileX: tx, tileY: ty });
  renderCountyMap();
}

function vehicleForMenu() { return activeVehicleMenu || vehicles.active() || vehicles.nearest(player, 5); }

function renderVehicleModal() {
  const v=vehicleForMenu(); if(!v)return;
  activeVehicleMenu=v;
  ui.vehicleTitle.textContent=v.name.toUpperCase();
  ui.vehicleSubtitle.textContent=`${v.type.toUpperCase()} · velocidade ${v.maxSpeed.toFixed(1)} · carga ${v.trunkMax} kg · ${Math.round((v.offroadGrip || 1)*100)}% off-road · ${v.odometer.toFixed(1)} km`;
  ui.vehiclePreview.textContent=v.type==='pickup'?'PICKUP':v.type==='van'?'VAN':v.type==='buggy'?'BUGGY':'SEDAN';
  ui.vehiclePreview.style.color=v.color;
  ui.vehicleFuelText.textContent=`${v.fuel.toFixed(1)} / ${v.maxFuel} L`;
  ui.vehicleFuelFill.style.width=`${v.fuel/v.maxFuel*100}%`;
  ui.vehicleBatteryText.textContent=`${Math.round(v.battery)}%`;
  ui.vehicleBatteryFill.style.width=`${v.battery}%`;
  ui.vehicleConditionText.textContent=`${Math.round(v.condition)}%`;
  ui.vehicleConditionFill.style.width=`${v.condition}%`;
  ui.vehicleEngineButton.textContent=v.engineOn?'DESLIGAR MOTOR':'LIGAR MOTOR';
  if (ui.vehicleDrainButton) ui.vehicleDrainButton.disabled = v.fuel < 8 || v.engineOn;

  ui.vehicleComponentList.innerHTML="";
  const componentDefs=vehicles.componentDefs();
  for(const [key,def] of Object.entries(componentDefs)){
    const value=Math.round(v.components?.[key]??100);
    const row=document.createElement("div");
    row.className="vehicle-component-row";
    row.innerHTML=`<div><span>${def.name.toUpperCase()}</span><div class="vehicle-component-meter"><i style="width:${value}%"></i></div></div><strong>${value}%</strong><button data-restore-component="${key}" ${value>=95?"disabled":""}>RESTAURAR</button>`;
    ui.vehicleComponentList.appendChild(row);
  }
  ui.vehicleComponentList.querySelectorAll("[data-restore-component]").forEach(btn=>btn.addEventListener("click",()=>{
    if(!building.hasAutoBenchNear(player)){showToast("Aproxime o veículo de uma bancada automotiva");return;}
    const r=vehicles.restoreComponent(v,btn.dataset.restoreComponent);
    showToast(r.ok?`${r.name} restaurado`:r.reason);
    renderVehicleModal();renderInventory();renderHotbar();updateUI();
  }));

  ui.trunkWeightText.textContent=`${vehicles.trunkWeight(v).toFixed(1)} / ${v.trunkMax} kg`;
  ui.trunkList.innerHTML='';
  if(!v.trunk.length)ui.trunkList.innerHTML='<div class="trade-row"><div><strong>VAZIO</strong><small>Nada no porta-malas.</small></div></div>';
  for(const row of v.trunk){const def=ITEM_DEFS[row.id];const el=document.createElement('div');el.className='trade-row';el.innerHTML=`<span class="trade-icon">${itemIconHtml(row.id,"trade-item-icon",30)}</span><div><strong>${def.name}</strong><small>×${row.qty} · ${(def.weight*row.qty).toFixed(1)} kg</small></div><button data-trunk-take="${row.id}">PEGAR 1</button>`;ui.trunkList.appendChild(el);}
  ui.trunkInventoryList.innerHTML='';
  for(const row of inventory.list().filter(e=>e.id!=='county_scrip')){const def=ITEM_DEFS[row.id];const el=document.createElement('div');el.className='trade-row';el.innerHTML=`<span class="trade-icon">${itemIconHtml(row.id,"trade-item-icon",30)}</span><div><strong>${def.name}</strong><small>×${row.qty} · ${def.weight.toFixed(2)} kg cada</small></div><button data-trunk-store="${row.id}">GUARDAR 1</button>`;ui.trunkInventoryList.appendChild(el);}
  ui.trunkList.querySelectorAll('[data-trunk-take]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.trunkTake;if(!inventory.canAdd(id,1)){showToast('Peso demais');return;}if(vehicles.removeFromTrunk(v,id,1)){inventory.add(id,1);renderVehicleModal();renderInventory();renderHotbar();}}));
  ui.trunkInventoryList.querySelectorAll('[data-trunk-store]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.trunkStore;const added=vehicles.addToTrunk(v,id,1);if(!added){showToast('Porta-malas cheio');return;}inventory.remove(id,1);renderVehicleModal();renderInventory();renderHotbar();}));
}

function openVehicleModal(v=null){
  const target=v||vehicles.active()||vehicles.nearest(player,5);if(!target){showToast('Nenhum veículo próximo');return false;}
  if(inventoryOpen)toggleInventory(false);if(buildOpen)toggleBuild(false);if(peopleOpen)togglePeople(false);if(npcOpen)closeNpcModal();if(containerOpen)closeContainerModal();
  activeVehicleMenu=target;vehicleOpen=true;ui.vehicleModal.classList.remove('hidden');renderVehicleModal();return true;
}
function closeVehicleModal(){vehicleOpen=false;activeVehicleMenu=null;ui.vehicleModal.classList.add('hidden');}

function interactVehicle(){
  const active=vehicles.active();
  if(active){vehicles.exit(player);showToast('Você saiu do veículo');return true;}
  const near=vehicles.nearest(player);if(!near)return false;
  const result=vehicles.enter(near,player);if(result.ok)showToast(`${near.name}: pressione R para ligar o motor`);else showToast(result.reason);return true;
}

function interactPower() {
  const gen = power.nearestGenerator(player, 3);
  if (!gen) return false;
  power.prepare(gen);
  if (gen.fuel <= 0 && inventory.count('fuel_can') > 0) {
    const f = power.refuel(gen);
    if (f.ok) { showToast('Gerador abastecido', 'good'); renderInventory(); renderHotbar(); }
    return true;
  }
  const r = power.toggle(gen);
  showToast(r.ok ? (r.on ? 'Gerador ligado' : 'Gerador desligado') : r.reason, r.ok ? 'good' : 'warn');
  if (r.ok && r.on) {
    // a running generator wakes up the shutters and terminals of this place
    const tx = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
    const area = structures.areaAt(tx);
    if (places.powerArea(area)) showToast(`Energia restaurada: ${area}`, 'good');
  }
  return true;
}


function nearestVehicleProject() {
  return vehicleCraft.nearestProject(player,3.5);
}

function renderVehicleAssembly() {
  if (!activeVehicleProject) return;
  vehicleCraft.sync();
  const project=vehicleCraft.projectForObject(activeVehicleProject);
  if(!project){closeVehicleAssembly();return;}

  const progress=vehicleCraft.progress(project);
  const bench=vehicleCraft.autoBenchNear(player);
  ui.assemblyProgressText.textContent=`${progress.done} / ${progress.total} módulos`;
  ui.assemblyProgressFill.style.width=`${progress.percent}%`;
  ui.assemblyBenchStatus.textContent=bench?"Bancada automotiva conectada ao projeto.":"Construa uma bancada automotiva próxima.";
  ui.assemblyBenchStatus.classList.toggle("online",Boolean(bench));
  ui.completeVehicleButton.disabled=!vehicleCraft.canComplete(project)||!bench;
  ui.assemblyStatusPill.textContent=vehicleCraft.canComplete(project)?"PRONTO":"EM MONTAGEM";
  ui.assemblyBodyVisual.classList.toggle("visible",project.modules.body);

  ui.vehicleModuleGrid.innerHTML="";
  for(const module of VEHICLE_MODULES){
    const installed=project.modules[module.key];
    const def=ITEM_DEFS[module.item];
    const have=inventory.count(module.item);
    const card=document.createElement("article");
    card.className=`vehicle-module-card ${installed?"installed":""}`;
    card.innerHTML=`
      <div class="vehicle-module-icon"><img src="assets/ui/${module.icon}.png" alt=""></div>
      <div>
        <span class="eyebrow">${installed?"INSTALADO":"MÓDULO"}</span>
        <h3>${module.name}</h3>
        <p>${module.desc}</p>
        <small>Requer ${module.qty}× ${def.name} · você tem ${have}</small>
      </div>
      <button data-install-module="${module.key}" ${installed||!bench||have<module.qty?"disabled":""}>${installed?"INSTALADO":"INSTALAR"}</button>`;
    ui.vehicleModuleGrid.appendChild(card);
  }
  ui.vehicleModuleGrid.querySelectorAll("[data-install-module]").forEach(btn=>btn.addEventListener("click",()=>{
    const r=vehicleCraft.install(project,btn.dataset.installModule,player);
    showToast(r.ok?`${r.module.name} instalado`:r.reason);
    renderVehicleAssembly();renderInventory();renderHotbar();updateUI();
  }));
}

function openVehicleAssembly(obj=null){
  const target=obj||nearestVehicleProject();
  if(!target){showToast("Nenhuma armação de veículo próxima");return false;}
  if(inventoryOpen)toggleInventory(false);
  if(buildOpen)toggleBuild(false);
  if(peopleOpen)togglePeople(false);
  if(npcOpen)closeNpcModal();
  if(containerOpen)closeContainerModal();
  if(vehicleOpen)closeVehicleModal();
  activeVehicleProject=target;
  vehicleAssemblyOpen=true;
  ui.vehicleAssemblyModal.classList.remove("hidden");
  renderVehicleAssembly();
  return true;
}

function closeVehicleAssembly(){
  vehicleAssemblyOpen=false;
  activeVehicleProject=null;
  ui.vehicleAssemblyModal.classList.add("hidden");
}

function interactVehicleProject(){
  const project=nearestVehicleProject();
  if(!project)return false;
  openVehicleAssembly(project);
  return true;
}

function availableRadioEntries() {
  const base = baseCamp.radioEntries();
  const operations = campaign.radioEntries();
  const loreRows = lore.availableTransmissions().map(t => ({...t, baseSignal:false, heard:lore.heardRadio.has(t.id)}));
  return [...operations, ...base, ...loreRows];
}

function renderRadio() {
  const available = availableRadioEntries();
  if (!available.length) return;
  radioIndex = ((radioIndex % available.length) + available.length) % available.length;
  const t = available[radioIndex];
  ui.radioFreqText.textContent = t.freq;
  ui.radioStationText.textContent = t.name.toUpperCase();
  const boost = baseCamp.has('radio_station') ? 15 : 0;
  ui.radioSignalFill.style.width = `${Math.min(100, 50 + boost + Math.min(35, lore.documentsFound().length * 5))}%`;
  const heard = t.campaignSignal ? Boolean(t.heard) : t.baseSignal ? Boolean(t.heard) : lore.heardRadio.has(t.id);
  ui.radioTranscript.textContent = heard ? t.text : "Sinal detectado. Pressione OUVIR TRANSMISSÃO.";
}

function toggleRadio(force) {
  if (gameDead || vehicles.active()) return;
  radioOpen = typeof force === "boolean" ? force : !radioOpen;
  if (radioOpen) {
    if (inventoryOpen) toggleInventory(false);
    if (peopleOpen) togglePeople(false);
    if (buildOpen) toggleBuild(false);
    if (npcOpen) closeNpcModal();
    if (vehicleOpen) closeVehicleModal();
    if (vehicleAssemblyOpen) closeVehicleAssembly();
    archiveOpen = false;
    ui.archiveModal.classList.add("hidden");
    renderRadio();
  }
  ui.radioModal.classList.toggle("hidden", !radioOpen);
}

function renderArchiveReader(docId) {
  const doc = lore.docById(docId);
  if (!doc || !lore.readDocs.has(docId)) {
    ui.archiveReader.innerHTML = `<span class="eyebrow">REGISTRO</span><h3>Registro indisponível</h3><p>Encontre este documento no mundo.</p>`;
    return;
  }
  selectedArchiveDoc = docId;
  ui.archiveReader.innerHTML = `<span class="eyebrow">${doc.source.toUpperCase()}</span><h3>${doc.title}</h3><p>${doc.body}</p><p class="hint">${doc.hint}</p>`;
}

function renderArchive() {
  const found = lore.documentsFound();
  ui.archiveSubtitle.textContent = `Registros encontrados: ${found.length} / ${LORE_DOCUMENTS.length}`;
  ui.archiveCountText.textContent = `${found.length}/${LORE_DOCUMENTS.length}`;
  ui.archiveExposureText.textContent = `${Math.round(lore.exposure)}%`;
  ui.blackridgeAccessText.textContent =
    lore.enteredBunker ? "BUNKER ACESSADO" :
    inventory.count("blackridge_keycard") > 0 && found.length >= 3 ? "ACESSO PRONTO" :
    inventory.count("blackridge_keycard") > 0 ? "FALTAM REGISTROS" : "SEM CREDENCIAL";
  ui.truthStatusText.textContent = lore.archiveChoice ? (lore.archiveChoice === "transmit" ? "TRANSMITIDA" : "SELADA") :
    lore.readDocs.has("archive_final") ? "DESCOBERTA" :
    found.length >= 5 ? "QUASE COMPLETA" : "INCOMPLETA";
  const br = campaign.blackridgeSummary();
  if (ui.blackridgeCampaignText) ui.blackridgeCampaignText.textContent = br.title;
  if (ui.blackridgeCampaignHint) ui.blackridgeCampaignHint.textContent = br.text;

  ui.archiveDocList.innerHTML = "";
  for (const doc of LORE_DOCUMENTS) {
    const known = lore.readDocs.has(doc.id);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `archive-doc ${known ? "" : "locked"}`;
    btn.disabled = !known;
    btn.innerHTML = `<strong>${known ? doc.title : "REGISTRO NÃO ENCONTRADO"}</strong><small>${known ? doc.source : "Explore o condado"}</small>`;
    if (known) btn.addEventListener("click", () => renderArchiveReader(doc.id));
    ui.archiveDocList.appendChild(btn);
  }

  if (!selectedArchiveDoc || !lore.readDocs.has(selectedArchiveDoc)) {
    if (found.length) renderArchiveReader(found[found.length - 1].id);
  }

  ui.archiveChoiceBox.classList.toggle("hidden", !lore.archiveUnlocked || Boolean(lore.archiveChoice));
}

function toggleArchive(force) {
  if (gameDead || vehicles.active()) return;
  archiveOpen = typeof force === "boolean" ? force : !archiveOpen;
  if (archiveOpen) {
    if (inventoryOpen) toggleInventory(false);
    if (peopleOpen) togglePeople(false);
    if (buildOpen) toggleBuild(false);
    if (npcOpen) closeNpcModal();
    if (vehicleOpen) closeVehicleModal();
    if (vehicleAssemblyOpen) closeVehicleAssembly();
    radioOpen = false;
    ui.radioModal.classList.add("hidden");
    renderArchive();
  }
  ui.archiveModal.classList.toggle("hidden", !archiveOpen);
}

function interactLore() {
  const obj = lore.nearest(player);
  if (!obj) return false;
  const result = lore.useObject(obj, player);
  if (!result.ok) {
    showToast(result.reason);
    return true;
  }

  if (result.action === "document") {
    selectedArchiveDoc = result.doc.id;
    showToast(`Registro encontrado: ${result.doc.title}`);
    toggleArchive(true);
    renderArchiveReader(result.doc.id);
  } else if (result.action === "radio") {
    toggleRadio(true);
  } else if (result.action === "pickup") {
    showToast(`${ITEM_DEFS[result.itemId].name} recolhido`);
    renderInventory(); renderHotbar();
  } else if (result.action === "teleport") {
    fx.shake = Math.max(fx.shake, 2);
    showToast(result.direction === "down" ? "Elevador descendo para Blackridge" : "Você voltou à superfície");
  } else if (result.action === "archive") {
    selectedArchiveDoc = "archive_final";
    toggleArchive(true);
    renderArchiveReader("archive_final");
  }
  renderArchive();
  return true;
}

function syncHotbarAfterTransfer(id) {
  if (inventory.count(id) > 0) return;
  for (let i=0;i<hotbar.length;i++) if (hotbar[i]===id) hotbar[i]=null;
  if (inventorySelectedId===id) inventorySelectedId=null;
}

function renderContainer() {
  if (!activeContainer) return;
  ui.containerTitle.textContent = activeContainer.name;
  const total = activeContainer.loot.reduce((s,i)=>s+i.qty,0);
  ui.containerSubtitle.textContent = total ? `${total} itens armazenados` : "Container vazio — você pode guardar suprimentos aqui";
  if (ui.containerItemCount) ui.containerItemCount.textContent = `${total} ITENS`;
  if (ui.containerBackpackWeight) ui.containerBackpackWeight.textContent = `${inventory.totalWeight().toFixed(1)} / ${(inventory.capacity?.() || inventory.maxWeight).toFixed(0)} KG`;
  ui.containerList.innerHTML = "";
  if (ui.containerBackpackList) ui.containerBackpackList.innerHTML = "";

  if (!activeContainer.loot.length) ui.containerList.innerHTML = `<div class="loot-empty"><strong>VAZIO</strong><span>Use a coluna ao lado para guardar itens.</span></div>`;
  activeContainer.loot.forEach((loot,index)=>{
    const def=ITEM_DEFS[loot.id]; if(!def)return;
    const card=document.createElement("button"); card.type="button"; card.className="loot-slot-v2"; card.style.setProperty("--category-tone",categoryTone(def.category));
    const condition = loot.durability != null && def.maxDurability ? Math.round(loot.durability/def.maxDurability*100) : null;
    card.innerHTML=`<span class="loot-slot-icon">${itemIconHtml(loot.id,"loot-slot-icon-img",44)}</span><b>×${loot.qty}</b><strong>${def.name}</strong><small>${(def.weight*loot.qty).toFixed(2)} kg${condition!=null?` · ${condition}%`:''}</small><em>PEGAR</em>`;
    card.addEventListener("click",()=>takeFromContainer(index)); ui.containerList.appendChild(card);
  });

  if (ui.containerBackpackList) {
    const entries=inventory.list().filter(e=>ITEM_DEFS[e.id]);
    if(!entries.length) ui.containerBackpackList.innerHTML=`<div class="loot-empty"><strong>MOCHILA VAZIA</strong><span>Nada para armazenar.</span></div>`;
    for(const entry of entries){
      const def=ITEM_DEFS[entry.id]; const card=document.createElement("div"); card.className="loot-slot-v2 transfer-inventory-card"; card.style.setProperty("--category-tone",categoryTone(def.category));
      card.innerHTML=`<span class="loot-slot-icon">${itemIconHtml(entry.id,"loot-slot-icon-img",40)}</span><b>×${entry.qty}</b><strong>${def.name}</strong><small>${(def.weight*entry.qty).toFixed(2)} kg</small><div class="mini-transfer-actions"><button data-store-one="${entry.uid}">1</button><button data-store-all="${entry.id}">TUDO</button></div>`;
      ui.containerBackpackList.appendChild(card);
    }
    ui.containerBackpackList.querySelectorAll("[data-store-one]").forEach(btn=>btn.addEventListener("click",()=>storeEntryInContainer(Number(btn.dataset.storeOne),1)));
    ui.containerBackpackList.querySelectorAll("[data-store-all]").forEach(btn=>btn.addEventListener("click",()=>storeItemInContainer(btn.dataset.storeAll,"all")));
  }
}

function takeFromContainer(index) {
  if (!activeContainer || !activeContainer.loot[index]) return;
  const loot=activeContainer.loot[index]; const def=ITEM_DEFS[loot.id]; let taken=0;
  // Guardado o frescor da remessa antes de ela se misturar ao que já existe.
  const incomingFresh = food.freshness(loot);
  if(def?.stackable){ while(loot.qty>0&&inventory.canAdd(loot.id,1)){ const a=inventory.add(loot.id,1); if(!a)break; loot.qty--; taken++; } }
  else { if(inventory.canAdd(loot.id,1)){ const a=inventory.addEntryData(loot.id,1,{durability:loot.durability}); if(a){loot.qty--;taken++;} } }
  if(taken) food.blendIntoInventory(loot.id, taken, incomingFresh);
  if(loot.qty<=0)activeContainer.loot.splice(index,1);
  showToast(taken?`${def?.name||loot.id}: +${taken}`:"Peso demais para carregar");
  renderContainer();renderHotbar();renderInventory();updateUI();renderPinnedRecipe();
}

function storeEntryInContainer(uid, qty=1) {
  if(!activeContainer)return; const entry=inventory.entry(uid); if(!entry)return; const def=ITEM_DEFS[entry.id];
  if(def?.category==="clothing"&&Object.values(clothing).includes(entry.id)&&inventory.count(entry.id)<=1){showToast("Tire a roupa antes de armazenar",'warn');return;}
  if(def?.stackable)return storeItemInContainer(entry.id,qty);
  const removed=inventory.removeUid(uid); if(!removed)return;
  activeContainer.loot.push({id:removed.id,qty:1,durability:removed.durability}); syncHotbarAfterTransfer(removed.id);
  showToast(`${def.name} guardado`,'good'); renderContainer();renderHotbar();renderInventory();updateUI();renderPinnedRecipe();
}

function storeItemInContainer(id, amount="all") {
  if(!activeContainer||!ITEM_DEFS[id])return; const def=ITEM_DEFS[id]; let want=amount==="all"?inventory.count(id):Math.max(1,Number(amount)||1);
  if(def.category==="clothing"&&Object.values(clothing).includes(id)&&inventory.count(id)<=want){showToast("Tire a roupa antes de armazenar",'warn');return;}
  if(!def.stackable){ const entries=inventory.entries.filter(e=>e.id===id).slice(0,want); for(const e of entries)storeEntryInContainer(e.uid,1); return; }
  const storedFresh=food.freshness(inventory.first(id));
  const removed=inventory.remove(id,want); if(!removed)return;
  const existing=activeContainer.loot.find(x=>x.id===id&&x.durability==null);
  if(existing){ existing.qty+=removed; food.blendInto(existing, removed, storedFresh); }
  else { const row={id,qty:removed}; if(FoodSystem.perishable(id)) row.fresh=storedFresh; activeContainer.loot.push(row); }
  syncHotbarAfterTransfer(id); showToast(`${def.name}: ${removed} guardado${removed>1?'s':''}`,'good'); renderContainer();renderHotbar();renderInventory();updateUI();renderPinnedRecipe();
}

function storeMaterialsInContainer(){
  if(!activeContainer)return; const ids=[...new Set(inventory.entries.map(e=>e.id))].filter(id=>["material","component","currency","ammo"].includes(ITEM_DEFS[id]?.category));
  let moved=0; for(const id of ids){const before=inventory.count(id);storeItemInContainer(id,"all");moved+=Math.max(0,before-inventory.count(id));}
  showToast(moved?`${moved} suprimentos organizados no container`:"Nenhum material para guardar",moved?'good':'warn');
}

function takeAllFromContainer() {
  if (!activeContainer) return;
  for (let i=activeContainer.loot.length-1;i>=0;i--) takeFromContainer(i);
  renderContainer();
}

function openNearbyContainer() {
  if (inventoryOpen || containerOpen) return;
  const box = structures.nearestContainer(player);
  if (!box) return;
  activeContainer = box;
  box.discovered = true;
  containerOpen = true;
  ui.containerModal.classList.remove("hidden");
  renderContainer();
}

function closeContainerModal() {
  containerOpen = false;
  activeContainer = null;
  ui.containerModal.classList.add("hidden");
}

function toggleInventory(force) {
  inventoryOpen = typeof force === "boolean" ? force : !inventoryOpen;
  ui.inventoryModal.classList.toggle("hidden", !inventoryOpen);
  if (inventoryOpen) renderInventory();
}

function updateMouseTile() {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const sx = mouse.x * scaleX;
  const sy = mouse.y * scaleY;

  mouse.tileX = Math.floor((sx + camera.x) / CONFIG.TILE);
  mouse.tileY = Math.floor((sy + camera.y) / CONFIG.TILE);

  mouse.tile = world.get(mouse.tileX, mouse.tileY);
}

function withinReach(tx, ty) {
  const c = player.center();
  const bx = tx * CONFIG.TILE + CONFIG.TILE / 2;
  const by = ty * CONFIG.TILE + CONFIG.TILE / 2;
  const bonus = currentGameMode === 'free' ? gameModeDef('free').rules.reachBonus : 0;
  return Math.hypot(c.x - bx, c.y - by) <= (CONFIG.PLAYER_REACH + bonus) * CONFIG.TILE;
}

function toolPower(itemId, tile) {
  const def = itemId ? ITEM_DEFS[itemId] : null;

  if (!def || def.category !== "tool") {
    if (tile === TILE.LEAF || tile === TILE.BERRY_BUSH) return 10;
    if (tile === TILE.DIRT || tile === TILE.GRASS) return 7;
    if (tile === TILE.WOOD) return 5;
    return 4;
  }

  if (def.toolType === "pickaxe") {
    const miningPower = mining.toolPower(itemId, tile);
    if (miningPower != null) return miningPower;
    if (tile === TILE.DIRT || tile === TILE.GRASS) return Math.max(14, (def.miningPower || 18) * .55);
    if (tile === TILE.WOOD) return 5;
    return Math.max(8, (def.miningPower || 18) * .45);
  }

  if (def.toolType === "axe") {
    if (tile === TILE.WOOD || tile === TILE.PLANK) return 21;
    if (tile === TILE.LEAF || tile === TILE.BERRY_BUSH) return 22;
    if (tile === TILE.DIRT || tile === TILE.GRASS) return 8;
    return 4;
  }

  if (def.toolType === "crowbar") {
    if ([TILE.METAL, TILE.GLASS, TILE.BRICK].includes(tile)) return 22;
    if ([TILE.CONCRETE, TILE.ASPHALT].includes(tile)) return 14;
    return 7;
  }

  return 6;
}

function cleanupBrokenItem(id) {
  for (let i = 0; i < hotbar.length; i++) {
    if (hotbar[i] === id && !itemExists(id)) hotbar[i] = null;
  }
}

function mineAtMouse() {
  if (mineCooldown > 0 || anyModalOpen() || gameDead || vehicles.active()) return;

  if (!withinReach(mouse.tileX, mouse.tileY)) {
    showToast("Fora de alcance");
    return;
  }

  const tile = world.get(mouse.tileX, mouse.tileY);
  if (tile === TILE.WATER_SOURCE) {
    showToast("Uma nascente. Use uma garrafa vazia com o botão direito.");
    return;
  }

  const itemId = selectedItemId();
  const def = itemId ? ITEM_DEFS[itemId] : null;
  const gate = mining.canMine(tile, itemId);
  if (!gate.ok) {
    const need = MINING_TIERS[gate.required]?.name || `TIER ${gate.required}`;
    showToast(`Mineração insuficiente · exige ${need}`, "warn");
    return;
  }
  const power = toolPower(itemId, tile);
  const result = world.mine(mouse.tileX, mouse.tileY, power);
  if (!result) return;
  player.actionTimer = .24;
  player.actionType = "mine";
  fx.mining(mouse.tileX * CONFIG.TILE + CONFIG.TILE / 2, mouse.tileY * CONFIG.TILE + CONFIG.TILE / 2, tile, Boolean(result.broken));

  if (result.blocked) {
    showToast("Isso não pode ser quebrado assim");
    return;
  }

  mineCooldown = .1;
  const miningWearScale = 1 - clothingStats().miningEfficiency;
  survival.miningCost((def?.category === "tool" ? 1.0 : 1.65) * miningWearScale);
  let mineNoise = tile === TILE.STONE || tile === TILE.METAL || tile === TILE.CONCRETE ? 230 : def?.toolType === "axe" ? 185 : 130;
  if (player.crouching) mineNoise *= .65;
  danger.emitNoise(player.x + player.w / 2, player.y + player.h / 2, mineNoise, "mineração");

  if (def?.category === "tool") {
    const toolResult = inventory.damageTool(itemId, 1);
    if (toolResult.broke) {
      cleanupBrokenItem(itemId);
      showToast(`${def.name} quebrou`);
    }
  }

  if (result.broken) {
    const knownBefore = MINERAL_TILE_META[tile]?.id ? mining.discovered.has(MINERAL_TILE_META[tile].id) : true;
    const mined = mining.onBroken(tile, mouse.tileX, mouse.tileY, itemId);
    const drops = mined.drops.length ? mined.drops : (result.dropItem ? [{ id:result.dropItem, qty:result.dropQty || 1 }] : []);
    let carried = 0;
    for (const drop of drops) carried += inventory.add(drop.id, drop.qty || 1);
    if (drops.length && carried <= 0) showToast("Peso demais: você não conseguiu carregar o recurso");
    if (mined.meta && !knownBefore) showToast(`NOVO MINERAL · ${mined.meta.name.toUpperCase()} · profundidade ${mined.depth}`, "good");
    else if (mined.meta?.rich) showToast(`${mined.meta.name} · depósito rico`, "good");
    progression.observe();
  }

  renderHotbar();
  if (inventoryOpen) renderInventory();
  updateUI();
}

function playerIntersectsTile(tx, ty) {
  const x = tx * CONFIG.TILE;
  const y = ty * CONFIG.TILE;

  return (
    player.x < x + CONFIG.TILE &&
    player.x + player.w > x &&
    player.y < y + CONFIG.TILE &&
    player.y + player.h > y
  );
}

function fillBottleAtMouse() {
  if (world.get(mouse.tileX, mouse.tileY) !== TILE.WATER_SOURCE) return false;
  if (selectedItemId() !== "empty_bottle" || inventory.count("empty_bottle") <= 0) return false;

  if (!withinReach(mouse.tileX, mouse.tileY)) {
    showToast("Fora de alcance");
    return true;
  }

  inventory.remove("empty_bottle", 1);
  inventory.add("water_bottle", 1);
  showToast("Garrafa preenchida");
  renderHotbar();
  updateUI();
  return true;
}

function placeAtMouse() {
  if (inventoryOpen || containerOpen) return;

  const id = selectedItemId();
  const def = id ? ITEM_DEFS[id] : null;

  if (fillBottleAtMouse()) return;

  if (def && ["food", "drink", "medical"].includes(def.category)) {
    useItem(id);
    return;
  }

  if (!def?.placeTile) {
    if (world.get(mouse.tileX, mouse.tileY) === TILE.WATER_SOURCE) {
      showToast("Equipe uma garrafa vazia para coletar água");
    }
    return;
  }

  if (!withinReach(mouse.tileX, mouse.tileY)) {
    showToast("Fora de alcance");
    return;
  }

  if (inventory.count(id) <= 0) {
    showToast("Sem material");
    return;
  }

  if (!world.canPlace(mouse.tileX, mouse.tileY)) {
    showToast("Não pode construir aqui");
    return;
  }

  if (playerIntersectsTile(mouse.tileX, mouse.tileY)) {
    showToast("Espaço ocupado");
    return;
  }

  world.set(mouse.tileX, mouse.tileY, def.placeTile);
  fx.build(mouse.tileX * CONFIG.TILE + CONFIG.TILE / 2, mouse.tileY * CONFIG.TILE + CONFIG.TILE);
  danger.emitNoise(player.x + player.w / 2, player.y + player.h / 2, 95, "construção");
  inventory.remove(id, 1);
  renderHotbar();
  updateUI();
}

function weightSpeedScale() {
  if (currentGameMode === 'free') return 1;
  const ratio = inventory.totalWeight() / (inventory.capacity?.() || inventory.maxWeight);
  if (ratio <= .85) return 1;
  if (ratio <= 1) return 1 - (ratio - .85) * 1.25;
  return Math.max(.48, .81 - (ratio - 1) * 1.15);
}

let cameraLook = 0;
function updateCamera(dt = 0.016) {
  // look-ahead eases in so the camera never snaps when the player turns
  const targetLook = Math.max(-96, Math.min(96, player.vx * 9.5)) + player.facing * 34;
  cameraLook += (targetLook - cameraLook) * Math.min(1, dt * 2.55);
  const verticalLook = Math.max(-20, Math.min(46, player.vy * 3.4));
  const targetX = player.x + player.w / 2 - canvas.width * .5 + cameraLook;
  const targetY = player.y + player.h / 2 - canvas.height * .54 + verticalLook;

  const ease = 1 - Math.pow(0.0009, dt);
  camera.x += (targetX - camera.x) * ease;
  camera.y += (targetY - camera.y) * ease * 0.86;

  camera.x = Math.max(0, Math.min(CONFIG.WORLD_W * CONFIG.TILE - canvas.width, camera.x));
  camera.y = Math.max(0, Math.min(CONFIG.WORLD_H * CONFIG.TILE - canvas.height, camera.y));
  camera.x = Math.round(camera.x * 4) / 4;
  camera.y = Math.round(camera.y * 4) / 4;
}

function daylightFactor() {
  const dayMinute = worldMinutes % 1440;
  const angle = ((dayMinute - 360) / 1440) * Math.PI * 2;
  return Math.max(.12, Math.min(1, (Math.sin(angle) + 1) / 2 * 1.15));
}

function updateClock(dt) {
  const minutesPerRealSecond = 1440 / CONFIG.DAY_LENGTH_SECONDS;
  worldMinutes += dt * minutesPerRealSecond;

  const day = Math.floor(worldMinutes / 1440) + 1;
  const minute = Math.floor(worldMinutes % 1440);
  const hh = String(Math.floor(minute / 60)).padStart(2, "0");
  const mm = String(minute % 60).padStart(2, "0");

  ui.day.textContent = day;
  ui.time.textContent = `${hh}:${mm}`;
}

function createAbandonedPack() {
  const combined = new Map();
  for (const entry of inventory.entries) combined.set(entry.id, (combined.get(entry.id) || 0) + entry.qty);
  const loot = [...combined.entries()].map(([id, qty]) => ({ id, qty }));
  if (!loot.length) return null;
  const box = {
    id: structures.nextContainerId++,
    name: `Mochila abandonada #${deathCount}`,
    x: player.x,
    y: player.y + Math.max(0, player.h - 28),
    width: 28,
    height: 24,
    category: "corpse",
    loot,
    discovered: true
  };
  structures.containers.push(box);
  return box;
}

function triggerDeath(reason = "Você não sobreviveu aos ferimentos.") {
  if (currentGameMode === 'free') { survival.health = survival.maxHealth; return; }
  if (gameDead) return;
  gameDead = true;
  // step out of the vehicle first, otherwise the next survivor spawns driving it
  if (vehicles.active()) vehicles.exit(player);
  if (buildMode) { buildMode = false; building.activeBlueprint = null; }
  deathCount += 1;
  const pack = createAbandonedPack();
  inventory.entries = [];
  hotbar.fill(null);
  renderHotbar();
  ui.deathSummary.textContent = reason;
  ui.deathKillsText.textContent = danger.kills;
  ui.deathDayText.textContent = Math.floor(worldMinutes / 1440) + 1;
  ui.deathLootText.textContent = pack ? "marcada no mundo" : "vazia";
  if (npcOpen) closeNpcModal();
  if (peopleOpen) togglePeople(false);
  if (radioOpen) toggleRadio(false);
  if (archiveOpen) toggleArchive(false);
  if (vehicleAssemblyOpen) closeVehicleAssembly();
  ui.deathModal.classList.remove("hidden");
  updateTopBar();
}

function startNewSurvivor() {
  gameDead = false;
  survival.health = survival.maxHealth;
  survival.hunger = 82;
  survival.thirst = 80;
  survival.energy = survival.maxEnergy;
  survival.sleep = 88;
  survival.bodyTemp = 36.8;
  survival.wetness = 0;
  injuries.reset();
  lore.exposure = 0;
  clothing.head = null; clothing.body = null; clothing.hands = null; clothing.legs = null; clothing.feet = null; clothing.pack = null;
  syncEquipmentCapacity();
  flashlightOn = false;
  currentSprint = false;
  survival.clampAll();
  player.hitCooldown = 0;
  player.attackTimer = 0;
  player.spawn();
  giveStarterInventory(false);
  for (let i = 0; i < hotbar.length; i++) hotbar[i] = DEFAULT_HOTBAR[i] || null;
  ui.deathModal.classList.add("hidden");
  renderHotbar(); renderInventory(); updateUI();
  showToast("Novo sobrevivente. O mundo anterior permanece.");
}

function exportGameState() {
  return {
    version:42,
    seed,
    savedAt:Date.now(),
    mode:currentGameMode,
    areaName:lore.areaName(player) || structures.areaAt(Math.floor(player.x/CONFIG.TILE),Math.floor(player.y/CONFIG.TILE)) || 'Condado',
    creative:creative.exportState(),
    worldMinutes,
    deathCount,
    player:{ x:player.x, y:player.y, facing:player.facing },
    inventory:{ maxWeight:inventory.maxWeight, uidCounter:inventory.uidCounter, entries:inventory.entries.map(e => ({...e})) },
    survival:{ health:survival.health, maxHealth:survival.maxHealth, hunger:survival.hunger, thirst:survival.thirst, energy:survival.energy, maxEnergy:survival.maxEnergy, sleep:survival.sleep, maxSleep:survival.maxSleep, bodyTemp:survival.bodyTemp, wetness:survival.wetness },
    injuries:JSON.parse(JSON.stringify(injuries.parts)),
    clothing:{...clothing},
    hotbar:[...hotbar], selected,
    arsenal:arsenal.exportState(),
    mining:mining.exportState(),
    magazines:[...magazines.entries()],
    mapMarkers:mapMarkers.map(m => ({...m})),
    world:{
      width:CONFIG.WORLD_W,
      height:CONFIG.WORLD_H,
      tiles:SaveGameSystem.encodeBytes(world.tiles),
      walls:SaveGameSystem.encodeBytes(world.walls),
      damage:[...world.damage.entries()]
    },
    building:{ nextId:building.nextId, objects:building.objects.map(o => ({...o})) },
    containers:structures.containers.map(c => ({...c, loot:(c.loot || []).map(v => ({...v}))})),
    points:structures.points.map(p => ({ id:p.id, state:p.state, locked:p.locked, consumed:p.consumed, integrity:p.integrity, active:p.active, restored:p.restored })),
    worldState:worldState.exportState(),
    poweredAreas:[...places.poweredAreas],
    placeFlags:[...places.flags],
    vehicles:vehicles.vehicles.map(v => ({...v, trunk:(v.trunk || []).map(i => ({...i})), components:{...(v.components || {})}})),
    society:society.exportState(),
    baseCamp:baseCamp.exportState(),
    campaign:campaign.exportState(),
    lore:{ readDocs:[...lore.readDocs], heardRadio:[...lore.heardRadio], exposure:lore.exposure, enteredBunker:lore.enteredBunker, archiveChoice:lore.archiveChoice, archiveUnlocked:lore.archiveUnlocked, containmentSealed:Boolean(lore.containmentSealed) },
    weather:{ condition:weather.condition, nextChangeMinute:weather.nextChangeMinute, wind:weather.wind, ambientTemp:weather.ambientTemp, rainIntensity:weather.rainIntensity, fog:weather.fog, snowIntensity:weather.snowIntensity, seasonId:weather.seasonId },
    food:food.exportState(),
    wildlife:wildlife.exportState(),
    farming:{ version:1, lastMinutes:farming.lastMinutes, harvestedTotal:farming.harvestedTotal, lastTrapMinute },
    sustainable:sustainable.exportState(),
    greenwater:greenwater.exportState(),
    stage42:stage42.exportState(),
    journey42:journey42.exportState(),
    danger:{ kills:danger.kills }
  };
}

function saveGameState(notify = true, slotId = currentSaveSlot || 'slot1') {
  if (!currentSaveSlot && slotId !== SaveSlots.AUTO_ID) currentSaveSlot = slotId;
  const result = SaveSlots.write(slotId, exportGameState(), currentGameMode);
  if (notify) showToast(result.ok ? `Partida salva · ${SaveSlots.label(slotId)}` : result.reason, result.ok ? 'good' : 'warn');
  if (ui.saveStatusText && result.ok) ui.saveStatusText.textContent = `${SaveSlots.label(slotId)} · ${gameModeDef(currentGameMode).name} · DIA ${Math.floor(worldMinutes/1440)+1}`;
  return result;
}

function loadGameState(data = null, silent = false) {
  const save = data || SaveSlots.read(currentSaveSlot || 'slot1', currentGameMode);
  if (!save || !SaveGameSystem.isSupported(save.version)) { if (!silent) showToast('Nenhuma partida salva', 'warn'); return false; }
  if (save.seed !== seed) {
    if (!silent && typeof location !== 'undefined') { showToast('Reabrindo o mundo salvo...', 'good'); setTimeout(() => location.reload(), 80); }
    return false;
  }

  const size = CONFIG.WORLD_W * CONFIG.WORLD_H;
  const savedW=Math.max(1,save.world?.width||960),savedH=Math.max(1,save.world?.height||168),savedSize=savedW*savedH;
  const tiles = SaveGameSystem.decodeBytes(save.world?.tiles, savedSize);
  const walls = SaveGameSystem.decodeBytes(save.world?.walls, savedSize);
  const restoreGrid=(source,target)=>{
    if(!source)return;
    if(savedW===CONFIG.WORLD_W&&savedH===CONFIG.WORLD_H){target.set(source);return;}
    const copyW=Math.min(savedW,CONFIG.WORLD_W),copyH=Math.min(savedH,CONFIG.WORLD_H);
    for(let y=0;y<copyH;y++)target.set(source.subarray(y*savedW,y*savedW+copyW),y*CONFIG.WORLD_W);
  };
  restoreGrid(tiles,world.tiles);restoreGrid(walls,world.walls);
  // Stage 41 authored zones occupy previously unused underground space. Old
  // saves restore their Stage 40 tile grid, so carve only the new geometry
  // again without touching the player's inventory, containers or buildings.
  if((save.version||0)<41) structures.restoreStage41Terrain?.();
  world.damage = new Map((save.world?.damage||[]).map(([i,v])=>{const y=Math.floor(i/savedW),x=i%savedW;return [y*CONFIG.WORLD_W+x,v];}).filter(([i])=>i>=0&&i<size));
  world.cleanFloatingVegetation();
  terrain.invalidateAll?.();

  worldMinutes = Number.isFinite(save.worldMinutes) ? save.worldMinutes : worldMinutes;
  deathCount = save.deathCount || 0;
  if (save.player) { player.x = save.player.x; player.y = save.player.y; player.facing = save.player.facing || 1; player.vx = 0; player.vy = 0; }

  if (save.inventory) {
    inventory.maxWeight = save.inventory.maxWeight || CONFIG.MAX_CARRY_WEIGHT;
    inventory.uidCounter = save.inventory.uidCounter || 1;
    inventory.entries = (save.inventory.entries || []).filter(e => ITEM_DEFS[e.id]).map(e => ({...e}));
  }
  if (save.survival) Object.assign(survival, save.survival);
  if (save.injuries) injuries.parts = JSON.parse(JSON.stringify(save.injuries));
  if (save.clothing) Object.assign(clothing, save.clothing);
  syncEquipmentCapacity();
  if (Array.isArray(save.hotbar)) for (let i=0;i<hotbar.length;i++) hotbar[i] = save.hotbar[i] || null;
  selected = Math.max(0, Math.min(hotbar.length - 1, save.selected || 0));
  arsenal.importState(save.arsenal);
  mining.importState(save.mining);
  magazines.clear();
  for (const row of save.magazines || []) if (Array.isArray(row) && ITEM_DEFS[row[0]]?.gun) magazines.set(row[0], Math.max(0, Math.floor(row[1] || 0)));
  mapMarkers.splice(0, mapMarkers.length, ...(save.mapMarkers || []).map(m => ({...m})));

  if (save.building) {
    building.objects = (save.building.objects || []).map(o => ({...o}));
    building.nextId = save.building.nextId || (Math.max(0, ...building.objects.map(o => o.id || 0)) + 1);
  }
  if (Array.isArray(save.containers)) {
    const generatedContainers=structures.containers.map(c=>({...c,loot:(c.loot||[]).map(v=>({...v}))}));
    const expansionContainers=savedW<CONFIG.WORLD_W?generatedContainers.filter(c=>Math.floor(c.x/CONFIG.TILE)>=savedW):[];
    structures.containers = save.containers.map(c => ({...c, loot:(c.loot || []).map(v => ({...v}))}));
    let expansionId=Math.max(0,...structures.containers.map(c=>c.id||0))+1;
    for(const c of expansionContainers)structures.containers.push({...c,id:expansionId++,loot:(c.loot||[]).map(v=>({...v}))});
    // Stage 40.2 adds content inside the already-expanded 1900-wide map.
    // Merge only missing Greenwater containers so old saves gain the new
    // locations without refilling anything the player has already searched.
    const existingContainerKeys=new Set(structures.containers.map(c=>`${c.name}|${Math.round(c.x)}|${Math.round(c.y)}`));
    for(const c of generatedContainers){
      const tx=Math.floor(c.x/CONFIG.TILE);
      const key=`${c.name}|${Math.round(c.x)}|${Math.round(c.y)}`;
      if((tx<1530&&!c.stage41)||existingContainerKeys.has(key))continue;
      structures.containers.push({...c,id:expansionId++,loot:(c.loot||[]).map(v=>({...v}))});
      existingContainerKeys.add(key);
    }
    structures.nextContainerId = Math.max(1, ...structures.containers.map(c => (c.id || 0) + 1));
  }
  const pointById = new Map(structures.points.map(p => [p.id, p]));
  for (const row of save.points || []) {
    const p = pointById.get(row.id); if (!p) continue;
    if (row.state != null) p.state = row.state;
    if (row.locked != null) p.locked = row.locked;
    if (row.consumed != null) p.consumed = row.consumed;
    if (row.integrity != null) p.integrity = row.integrity;
    if (row.active != null) p.active = row.active;
    if (row.restored != null) p.restored = row.restored;
  }

  places.poweredAreas = new Set(save.poweredAreas || []);
  places.flags = new Set(save.placeFlags || []);
  worldState.importState(save.worldState, places);
  if (Array.isArray(save.vehicles)) vehicles.vehicles = save.vehicles.map(v => ({...v, trunk:(v.trunk || []).map(i => ({...i})), components:{...(v.components || {})}}));
  vehicles.activeId = null;
  society.importState(save.society);
  baseCamp.importState(save.baseCamp);
  if (save.campaign) campaign.importState(save.campaign);
  if (save.lore) {
    lore.readDocs = new Set(save.lore.readDocs || []); lore.heardRadio = new Set(save.lore.heardRadio || []);
    lore.exposure = save.lore.exposure || 0; lore.enteredBunker = Boolean(save.lore.enteredBunker);
    lore.archiveChoice = save.lore.archiveChoice || null; lore.archiveUnlocked = Boolean(save.lore.archiveUnlocked); lore.containmentSealed = Boolean(save.lore.containmentSealed || save.placeFlags?.includes('blackridge_sealed'));
  }
  if (save.weather) Object.assign(weather, save.weather);
  // Stage 31 — saves antigos simplesmente entram sem horta, sem caça e com a
  // alimentação no valor inicial; nada quebra por faltar o bloco.
  food.importState(save.food);
  wildlife.importState(save.wildlife);
  if (save.farming?.version === 1) {
    farming.lastMinutes = Number.isFinite(save.farming.lastMinutes) ? save.farming.lastMinutes : null;
    farming.harvestedTotal = save.farming.harvestedTotal || 0;
    lastTrapMinute = save.farming.lastTrapMinute || 0;
  } else {
    farming.lastMinutes = null;
    lastTrapMinute = 0;
  }
  sustainable.importState(save.sustainable);
  greenwater.importState(save.greenwater);
  // Stage 42 progression (a save written by the standalone progression build kept it under "stage42")
  journey42.importState(save.journey42 ?? (Array.isArray(save.stage42?.known) ? save.stage42 : undefined));
  if (save.danger) danger.kills = save.danger.kills || 0;
  if (!stage42.importState(save.stage42)) {
    stage42.lastKills = danger.kills;
    stage42.lastMinutes = worldMinutes;
    if (stage42.event.nextAt <= worldMinutes + 60) stage42.event.nextAt = worldMinutes + 1440;
  }
  currentGameMode = save.mode === 'free' ? 'free' : 'survival';
  creative.enabled = currentGameMode === 'free';
  if (save.creative) creative.importState(save.creative);
  if (creative.enabled) inventory.maxWeight = Math.max(inventory.maxWeight, 99999);

  gameDead = false;
  autosaveTimer = 0;
  renderHotbar(); renderInventory(); renderBuildGrid(); renderPeoplePanel(); renderArchive(); renderRadio(); renderSustainability(); updateUI();
  if (!silent) showToast('Partida carregada do Slot 1', 'good');
  return true;
}

function stateTickSafe() {
  return Math.floor(performance.now() / 100);
}

function damagePlayer(amount, sourceX) {
  if (currentGameMode === 'free') { survival.health = survival.maxHealth; return; }
  if (gameDead || player.hitCooldown > 0) return;
  const protection = clothingStats().armor || 0;
  amount = Math.max(1, Math.round(amount * (1 - protection)));
  survival.health = Math.max(0, survival.health - amount);
  damageWornClothing(amount);
  player.hitCooldown = .72;
  player.vx = (player.x + player.w / 2 < sourceX ? -1 : 1) * 5.8;
  player.vy = -4.5;
  danger.emitNoise(player.x + player.w / 2, player.y + player.h / 2, 105, "impacto");
  fx.hitPlayer(player);
  if (amount >= 10 && (Math.floor(stateTickSafe() + amount) % 3 !== 0)) {
    const wound = injuries.addFromHit(amount);
    showToast(`${injuries.partName(wound.part)} ferido`);
  } else {
    showToast(`Você sofreu ${amount} de dano`);
  }
  if (survival.health <= 0) triggerDeath("Um ataque encerrou a história deste sobrevivente. A mochila ficou onde ele caiu.");
}

/* ========================================================================
   COMBATE
   ======================================================================== */

// Ammo lives in the backpack, not in the gun: reloading moves rounds across.
const magazines = new Map();          // weapon item id -> rounds chambered

function magazineOf(id) {
  if (!magazines.has(id)) magazines.set(id, 0);
  return magazines.get(id);
}

// What a weapon throws off when it connects. Purely cosmetic: it picks the
// particle set in FXSystem.MATERIALS, never a damage number.
const WEAPON_IMPACT_MATERIAL = {
  metal_pipe: 'metal', crowbar: 'metal', police_baton: 'metal', sledgehammer: 'metal',
  steel_spear: 'metal', steel_pickaxe: 'metal', repair_hammer: 'metal',
  fire_axe: 'metal', machete: 'metal', knife: 'metal', hatchet: 'metal',
  wrecking_bar: 'metal', rescue_mallet: 'metal',
  bat: 'wood', spear: 'wood', stone_axe: 'stone', stone_pickaxe: 'stone'
};

function weaponImpactMaterial(id) { return WEAPON_IMPACT_MATERIAL[id] || 'blunt'; }

function weaponProfile() {
  const id = selectedItemId();
  const def = id && itemExists(id) ? ITEM_DEFS[id] : null;
  if (!def) return { id: null, def: null, kind: 'melee', melee: FIST_PROFILE, label: 'Mãos' };
  if (def.gun) return { id, def, kind: 'gun', gun: def.gun, label: def.name };
  return { id, def, kind: 'melee', melee: def.melee || FIST_PROFILE, label: def.name };
}

// The box a swing actually covers. Thrust weapons are narrow and long, swung
// weapons are shorter and cover more vertical space.
function swingBox(profile, heavy) {
  const reach = profile.range * (heavy ? 1.12 : 1);
  const [top, bottom] = profile.arc || [8, 46];
  const y = player.y + top * (player.crouching ? .7 : 1);
  const h = Math.max(14, (bottom - top) * (player.crouching ? .72 : 1));
  const x = player.facing > 0
    ? player.x + player.w * 0.45
    : player.x + player.w * 0.55 - reach;
  return { x, y, w: reach, h };
}

function meleeAttack(kind = 'light') {
  if (gameDead || anyModalOpen() || vehicles.active()) return;

  // Accept the player's next click during recovery. The actual stamina cost is
  // only paid when that buffered attack really starts.
  if (!player.canAttack()) {
    if (player.attack.phase && player.reload.timer <= 0) {
      bufferedMelee = { kind, expires: .42 };
    }
    return;
  }

  const w = weaponProfile();
  if (w.kind === 'gun') { fireWeapon(); return; }

  const heavy = kind === 'heavy';
  const sameChain = !heavy && meleeChain.timer > 0 && meleeChain.weaponId === w.id;
  const comboStep = heavy ? 0 : (sameChain ? (meleeChain.step + 1) % 3 : 0);
  const comboCost = comboStep === 2 ? 1.08 : 1;
  const cost = w.melee.stamina * (heavy ? 1.8 : 1) * comboCost;
  if (survival.energy < cost + 2) {
    bufferedMelee = null;
    showToast('Sem fôlego para atacar', 'warn');
    audio.ui('bad');
    return;
  }

  if (!player.startAttack(w.melee, kind)) return;
  player.setCombo(comboStep, kind);
  survival.energy = Math.max(0, survival.energy - cost);
  pendingSwing = { profile: w.melee, heavy, weaponId: w.id, def: w.def, comboStep };

  if (heavy) meleeChain = { step: 0, timer: 0, weaponId: w.id };
  else meleeChain = { step: comboStep, timer: .54, weaponId: w.id };
  bufferedMelee = null;
  audio.swing(heavy ? 1.6 : (comboStep === 2 ? 1.16 : 1), audioPan(player.x));
}

let pendingSwing = null;

// Called on the exact frame the active window opens.
function resolveSwing() {
  if (!pendingSwing) return;
  const { profile, heavy, weaponId, def, comboStep = 0 } = pendingSwing;
  pendingSwing = null;

  const box = swingBox(profile, heavy);
  const comboDamage = !heavy && comboStep === 2 ? 1.10 : 1;
  const comboKnock = !heavy && comboStep === 2 ? 1.16 : 1;
  const damage = profile.damage * (heavy ? 1.75 : 1) * comboDamage;
  const knockback = (profile.knockback || 2) * (heavy ? 2 : 1) * comboKnock;
  const noise = profile.noise * (player.crouching ? .45 : 1) * (heavy ? 1.3 : 1);

  const result = danger.swing(box, {
    damage,
    knockback,
    targets: profile.targets || 1,
    stagger: (profile.stagger || 1) * (heavy ? 1.6 : 1),
    sneakMultiplier: profile.sneak || 2.2,
    fromX: player.x + player.w / 2,
    fromY: player.y + player.h * .46
  });

  fx.slash(player, profile.range, def?.category === 'tool' ? '#e7d9b8' : '#c8c0ad');
  danger.emitNoise(player.x + player.w / 2, player.y + player.h / 2, result.hit ? noise : noise * .55, 'combate');

  // Nenhum infectado no arco: talvez haja um bicho. A caça entra pelo mesmo
  // golpe, com o mesmo alcance, sem um botão dedicado.
  if (!result.hit) {
    const game = wildlife.swing(box, { damage, fromX: player.x + player.w / 2 });
    if (game.hit) {
      hitstop = Math.max(hitstop, .04);
      fx.shake = Math.max(fx.shake, 1.6);
      fx.impactAt(game.animal.x + game.animal.w / 2, game.animal.y + game.animal.h / 2, 'flesh', -player.facing, -.3, 1);
      audio.impact('flesh', 1, audioPan(game.animal.x));
      if (!game.killed) showToast(`${game.animal.def.name} ferido — vai fugir`, 'warn');
      if (weaponId && def?.maxDurability) {
        const worn = inventory.damageTool(weaponId, 1);
        if (worn.broke) { cleanupBrokenItem(weaponId); showToast(`${def.name} quebrou`, 'warn'); }
      }
      renderHotbar();
      return;
    }
  }

  if (!result.hit) {
    if (heavy) fx.shake = Math.max(fx.shake, .8);
    return;
  }

  // a landed hit stops the world for a couple of frames — this is most of
  // what makes a swing feel like it connected
  hitstop = Math.max(hitstop, heavy ? .07 : .045);
  fx.shake = Math.max(fx.shake, Math.min(4.2, knockback * (result.killed ? .9 : .55)));

  const pan = audioPan(box.x + box.w / 2);
  audio.impact(profile.impact || 'flesh', heavy ? 1.5 : 1, pan);

  const impactMaterial = weaponImpactMaterial(selectedItemId());
  for (const res of result.results) {
    fx.hitEnemy(res.enemy, res.killed, { material: impactMaterial, dir: player.facing });
    if (res.killed) audio.kill(pan);
    else audio.groan('hurt', pan, .8);
    if (res.sneak) showToast(res.killed ? 'Golpe silencioso' : 'Pego de surpresa', 'good');
  }

  if (result.killed) {
    const label = result.results.find(r => r.killed)?.enemy.label || 'Infectado';
    showToast(`${label} neutralizado`, 'good');
  }

  if (weaponId && def?.maxDurability) {
    const toolResult = inventory.damageTool(weaponId, heavy ? 2 : 1);
    if (toolResult.broke) {
      cleanupBrokenItem(weaponId);
      showToast(`${def.name} quebrou`, 'warn');
      audio.impact('metal', 1.2, pan);
    }
  }
  renderHotbar();
}

/* ----------------------------------------------------------- firearms --- */

function ammoInBag(gun) { return inventory.count(gun.ammo); }

function reloadWeapon() {
  const w = weaponProfile();
  if (w.kind !== 'gun') return false;
  if (player.reload.timer > 0) return true;

  const loaded = magazineOf(w.id);
  if (loaded >= w.gun.magazine) { showToast('Carregado', 'warn'); return true; }
  if (ammoInBag(w.gun) <= 0) {
    showToast(`Sem ${ITEM_DEFS[w.gun.ammo]?.name || 'munição'}`, 'warn');
    audio.dryFire();
    return true;
  }

  player.startReload(w.id, w.gun.reload);
  audio.reload('out', audioPan(player.x));
  return true;
}

function finishReload() {
  const id = player.reload.weapon;
  player.reload = { timer: 0, total: 0, weapon: null };
  if (!id) return;
  const def = ITEM_DEFS[id];
  if (!def?.gun) return;
  const need = def.gun.magazine - magazineOf(id);
  const take = Math.min(need, inventory.count(def.gun.ammo));
  if (take <= 0) return;
  inventory.remove(def.gun.ammo, take);
  magazines.set(id, magazineOf(id) + take);
  audio.reload('in', audioPan(player.x));
  showToast(`${def.name}: ${magazineOf(id)}/${def.gun.magazine}`, 'good');
  renderHotbar(); renderInventory();
}

// Guns are the strongest answer in the game and the loudest problem you can
// create. Every shot is a 700+ noise event the whole region reacts to.
function fireWeapon() {
  const w = weaponProfile();
  if (w.kind !== 'gun' || gameDead || anyModalOpen()) return;
  if (player.reload.timer > 0 || player.gunCooldown > 0) return;

  const gun = arsenal.effectiveGun(w.id, w.gun, mouse.aiming);
  if (magazineOf(w.id) <= 0) {
    audio.dryFire(audioPan(player.x));
    showToast('Carregador vazio — R para recarregar', 'warn');
    return;
  }

  magazines.set(w.id, magazineOf(w.id) - 1);
  player.gunCooldown = gun.fireRate;
  player.recoil = Math.min(1.4, gun.recoil * .2);
  player.cancelAttack();
  player.actionTimer = .18;
  player.actionType = 'use';

  const originX = player.x + player.w / 2 + player.facing * 12;
  const originY = player.y + (player.crouching ? 14 : 22);
  const pan = audioPan(originX);

  // aim toward the cursor, clamped to the facing side
  const aimX = mouse.tileX * CONFIG.TILE + 16 - originX;
  const aimY = mouse.tileY * CONFIG.TILE + 16 - originY;
  let baseAngle = Math.atan2(aimY, aimX);
  if (player.facing > 0) baseAngle = Math.max(-1.0, Math.min(1.0, baseAngle));
  else {
    const flipped = Math.atan2(aimY, -Math.abs(aimX));
    baseAngle = flipped;
  }

  const spread = gun.spread * (mouse.aiming ? .58 : 1) * (player.crouching ? .62 : 1) * (player.onGround ? 1 : 1.8);
  // visual only — the shot itself still leaves from originX/originY
  const held = heldItemTransform();
  const muzzle = held ? heldMuzzlePoint(held) : null;
  let anyHit = false;
  let killed = 0;
  let gameKills = 0;

  for (let i = 0; i < (gun.pellets || 1); i++) {
    const angle = baseAngle + (Math.random() - .5) * spread * 2;
    let res = danger.shoot(originX, originY, Math.cos(angle), Math.sin(angle), {
      damage: gun.damage,
      range: gun.range,
      knockback: gun.recoil * .6,
      ignoreArmor: w.id === 'rifle'
    });
    // O tiro atravessa o mesmo raio para a fauna: vale quem estiver mais perto.
    const gameShot = wildlife.shoot(originX, originY, Math.cos(angle), Math.sin(angle), {
      damage: gun.damage, range: gun.range
    });
    if (gameShot.hit && gameShot.distance < res.distance) {
      res = { ...gameShot, killed: false, hit: true };
      if (gameShot.killed) gameKills++;
    }
    fx.tracer(muzzle ? muzzle.x : originX, muzzle ? muzzle.y : originY, res.x, res.y);
    if (res.hit) {
      anyHit = true;
      if (res.killed) killed++;
      fx.impactAt(res.x, res.y, 'flesh', -Math.cos(angle), -Math.sin(angle) - .3, 1.1);
    } else if (res.blocked) {
      fx.impactAt(res.x, res.y, 'stone', -Math.cos(angle), -Math.sin(angle) - .4, 1);
    }
  }

  // Flash, smoke and brass come off the weapon sprite's declared muzzle, not
  // off the middle of the player.
  const flashPower = Math.min(1.6, .5 + gun.recoil * .9);
  fx.muzzleFlash(muzzle ? muzzle.x : originX, muzzle ? muzzle.y : originY,
    muzzle ? muzzle.angle : (player.facing > 0 ? 0 : Math.PI), flashPower);
  const shellClass = arsenal.meta(w.id)?.class;
  fx.shellEject(muzzle ? muzzle.x - player.facing * 10 : originX, (muzzle ? muzzle.y : originY) + 2,
    player.facing, gun.pellets > 1 ? 'shotgun' : ['rifle','carbine','blackridge'].includes(shellClass) ? 'rifle' : 'pistol');
  fx.shake = Math.max(fx.shake, gun.recoil * .55);
  hitstop = Math.max(hitstop, anyHit ? .05 : .02);
  player.vx -= player.facing * gun.recoil * .18;
  audio.gunshot(gun.sound, pan);

  // the whole neighbourhood hears this
  danger.emitNoise(originX, originY, gun.noise, 'tiro');
  hordes.onLoudNoise(originX, gun.noise);

  survival.energy = Math.max(0, survival.energy - 2);
  if (killed) showToast(`${killed} infectado${killed > 1 ? 's' : ''} abatido${killed > 1 ? 's' : ''}`, 'good');
  else if (gameKills) showToast(`Caça abatida — use E na carcaça`, 'good');
  else if (!anyHit) showToast('Errou — e agora todo mundo ouviu', 'warn');

  if (w.def?.maxDurability) {
    const t = inventory.damageTool(w.id, 1);
    if (t.broke) { cleanupBrokenItem(w.id); showToast(`${w.def.name} emperrou de vez`, 'warn'); }
  }
  renderHotbar();
}

function audioPan(worldX) {
  const rel = (worldX - (camera.x + canvas.width / 2)) / (canvas.width * .6);
  return Math.max(-1, Math.min(1, rel));
}

function drawBackground(light) {
  const green=world.region(Math.floor((player.x+player.w/2)/CONFIG.TILE)).stage40;
  const top = mixColor([13, 18, 27], green?[105,158,154]:[124,172,206], light);
  const mid = mixColor([26, 30, 36], green?[151,176,151]:[186,190,178], light);
  const bottom = mixColor([36, 36, 36], green?[169,176,128]:[214,198,156], light);
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, `rgb(${top.join(',')})`);
  g.addColorStop(.55, `rgb(${mid.join(',')})`);
  g.addColorStop(1, `rgb(${bottom.join(',')})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const dayMinute = worldMinutes % 1440;
  const sunT = (dayMinute - 300) / 840;
  const bodyX = canvas.width * (0.1 + sunT * 0.8);
  const bodyY = canvas.height * (.72 - Math.sin(Math.max(0, Math.min(1, sunT)) * Math.PI) * .48);
  const nightStrength = 1 - light;

  if (nightStrength > .25) {
    ctx.fillStyle = `rgba(235,238,255,${nightStrength * .8})`;
    for (let i = 0; i < 60; i++) {
      const sx = (i * 127 + seed * 13) % canvas.width;
      const sy = 20 + ((i * 59 + seed * 3) % Math.floor(canvas.height * .45));
      const tw = 0.6 + Math.abs(Math.sin(worldMinutes * 0.1 + i)) * 0.4;
      ctx.globalAlpha = nightStrength * tw;
      ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
    }
    ctx.globalAlpha = 1;
    const moon = ctx.createRadialGradient(bodyX, bodyY, 4, bodyX, bodyY, 46);
    moon.addColorStop(0, `rgba(226,232,246,${nightStrength * .85})`);
    moon.addColorStop(1, 'rgba(226,232,246,0)');
    ctx.fillStyle = moon;
    ctx.beginPath(); ctx.arc(bodyX, bodyY, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(244,246,255,${nightStrength * .8})`;
    ctx.beginPath(); ctx.arc(bodyX, bodyY, 15, 0, Math.PI * 2); ctx.fill();
  } else {
    const sunGrad = ctx.createRadialGradient(bodyX, bodyY, 6, bodyX, bodyY, 58);
    sunGrad.addColorStop(0, 'rgba(255,245,207,.9)');
    sunGrad.addColorStop(.45, 'rgba(255,220,150,.45)');
    sunGrad.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath(); ctx.arc(bodyX, bodyY, 58, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.arc(bodyX, bodyY, 17, 0, Math.PI * 2); ctx.fill();
  }

  drawClouds(light);
  drawParallax(light);
}

function mixColor(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function drawClouds(light) {
  const bands = weather.condition === 'clear' ? 2 : weather.condition === 'storm' ? 6 : 4;
  ctx.save();
  for (let i = 0; i < bands; i++) {
    const speed = 0.02 + i * 0.012;
    const y = 40 + i * 46 + Math.sin(i * 2.3) * 14;
    const w = 220 + i * 70;
    const x = ((i * 337 - camera.x * speed - worldMinutes * (2 + i)) % (canvas.width + w * 2)) - w;
    const dark = weather.condition === 'storm' ? 0.34 : weather.condition === 'rain' ? 0.26 : 0.16;
    ctx.fillStyle = `rgba(${Math.round(60 + light * 130)},${Math.round(64 + light * 132)},${Math.round(72 + light * 130)},${dark})`;
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.5, 22 + i * 4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.28, y + 6, w * 0.32, 16 + i * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawParallax(light) {
  const horizon = canvas.height * .72;
  const layers = [
    { speed: .05, color: light > .45 ? '#79826f' : '#1c2321', peak: 86, width: 420, alpha: .2 },
    { speed: .11, color: light > .45 ? '#5c6656' : '#161c1a', peak: 62, width: 300, alpha: .32 },
    { speed: .2, color: light > .45 ? '#414a3e' : '#101513', peak: 44, width: 200, alpha: .52 }
  ];

  for (const layer of layers) {
    ctx.save();
    ctx.globalAlpha = layer.alpha;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(-layer.width, canvas.height);
    for (let i = -2; i < 12; i++) {
      const x = ((i * layer.width - camera.x * layer.speed) % (canvas.width + layer.width * 2)) - layer.width;
      const h = layer.peak + (i % 3) * (layer.peak * .24);
      ctx.moveTo(x - layer.width * .55, horizon + 90);
      ctx.quadraticCurveTo(x - layer.width * .2, horizon - h * .25, x, horizon - h);
      ctx.quadraticCurveTo(x + layer.width * .24, horizon - h * .3, x + layer.width * .6, horizon + 90);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // treeline sitting just behind the playfield
  ctx.save();
  ctx.fillStyle = light > .45 ? 'rgba(44,56,44,.55)' : 'rgba(9,13,12,.72)';
  for (let i = 0; i < 70; i++) {
    const x = ((i * 27 - camera.x * .3) % (canvas.width + 120)) - 60;
    const y = horizon + 34;
    const h = 14 + (i * 7 % 13);
    const w = 5 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y - h);
    ctx.lineTo(x + w * 2, y);
    ctx.closePath();
    ctx.fill();
  }
  // haze band that separates the backdrop from the playable terrain
  const haze = ctx.createLinearGradient(0, horizon - 10, 0, horizon + 60);
  haze.addColorStop(0, `rgba(${Math.round(150 + light * 60)},${Math.round(150 + light * 58)},${Math.round(140 + light * 54)},0)`);
  haze.addColorStop(1, `rgba(${Math.round(150 + light * 60)},${Math.round(150 + light * 58)},${Math.round(140 + light * 54)},${(0.1 + light * 0.16).toFixed(2)})`);
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizon - 10, canvas.width, 70);
  ctx.restore();
}

// Anything currently burning, for smoke and light.
function ambienceFor(tx, ty) {
  const region = world.region(tx).id;
  const deep = ty > world.surface[Math.max(0, Math.min(CONFIG.WORLD_W - 1, tx))] + 6;
  if (region === 'blackridge') return 'blackridge';
  if (deep) return region === 'ridge' ? 'mine' : 'underground';
  if (region === 'westline') return 'industrial';
  if (region === 'coldwood' || region === 'ridge') return 'forest';
  if (region === 'pasture' || region === 'roadside') return 'rural';
  return 'town';
}

// Feeds the persistent ambience layers from what is actually happening.
let heartbeatTimer = 0;
let alarmAudioTimer = 0;

function playerVisibilityScale() {
  const tx = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
  const ty = Math.floor((player.y + player.h / 2) / CONFIG.TILE);
  const personalLight = flashlightOn || minerHeadlampActive();
  const underground = world.undergroundZoneAt?.(tx, ty);
  if (!world.isIndoors(tx, ty) && !underground) return personalLight ? 1.12 : 1;

  const nearbyClosedCurtain = places.points.some(p => p.kind === 'curtain' && p.state === 'closed' && Math.abs(p.tileX - tx) <= 5 && Math.abs(p.tileY - ty) <= 5);
  const area = structures.areaAt(tx, ty);
  const lights = area && places.areaLightsOn(area);
  let scale = lights ? 1.06 : .72;
  if (nearbyClosedCurtain) scale *= .76;
  if (personalLight) scale = Math.max(scale, 1.12);
  return scale;
}

// O quanto o mundo consegue enxergar o sobrevivente. Neblina e tempestade
// escondem o jogador dos infectados exatamente como escondem os infectados
// do jogador — o clima corta para os dois lados.
function sceneVisibilityScale() {
  return playerVisibilityScale() * (0.45 + weather.visibility() * 0.55);
}

function updateAlarmAudio(dt) {
  const active = places.points.filter(p => p.kind === 'alarm' && p.state === 'on');
  if (!active.length) { alarmAudioTimer = 0; return; }
  alarmAudioTimer -= dt;
  if (alarmAudioTimer > 0) return;
  const nearest = active.reduce((best,p) => !best || Math.abs(p.x-player.x) < Math.abs(best.x-player.x) ? p : best, null);
  if (nearest && Math.abs(nearest.x - player.x) < 1500) audio.world('alarm', audioPan(nearest.x));
  alarmAudioTimer = 1.9;
}

function updateAudioScene(dt) {
  const tx = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
  const ty = Math.floor((player.y + player.h / 2) / CONFIG.TILE);
  const av = vehicles.active();
  const runningGen = power.generators().find(g => g.running);
  const genDistance = runningGen
    ? Math.abs(building.center(runningGen).x - player.x)
    : Infinity;

  audio.update(dt, {
    listenerX: camera.x + canvas.width / 2,
    viewWidth: canvas.width,
    indoor: world.isIndoors(tx, ty),
    region: world.region(tx).id,
    wind: weather.wind,
    rain: weather.rainIntensity,
    generator: genDistance < 520 ? 1 - genDistance / 520 : 0,
    engine: av && av.engineOn ? 1 : 0,
    engineSpeed: av ? Math.min(1, Math.abs(av.vx) / 9) : 0,
    nearbyInfected: cachedThreat.count,
    // Stage 20: region ambience (birds, crickets, drips, clangs, hum)
    ambience: ambienceFor(tx, ty),
    night: daylightFactor() < 0.35
  });

  // the county gets loud in your ears when something is actually on you
  if (cachedThreat.chasing > 0) {
    heartbeatTimer -= dt;
    if (heartbeatTimer <= 0) {
      heartbeatTimer = Math.max(0.42, 0.95 - cachedThreat.chasing * 0.12);
      audio.world('heartbeat');
    }
  } else heartbeatTimer = 0;

  if (weather.lightning > 0.98) audio.world('thunder');
  updateAlarmAudio(dt);
}

// What the HUD needs to know about what is in the player's hands.
function hudWeaponState() {
  const w = weaponProfile();
  if (!w.id) return { kind: 'melee', label: 'Mãos', durability: null, reloading: 0 };
  if (w.kind === 'gun') {
    return {
      kind: 'gun',
      label: w.def.name,
      loaded: magazineOf(w.id),
      magazine: w.gun.magazine,
      reserve: inventory.count(w.gun.ammo),
      reloading: player.reload.timer > 0 ? player.reload.timer / player.reload.total : 0
    };
  }
  const d = w.def?.maxDurability ? inventory.durability(w.id) : null;
  return {
    kind: 'melee',
    label: w.def.name,
    durability: d ? d.current / d.max : null,
    reloading: 0
  };
}

function collectFireSources() {
  const out = [];
  for (const obj of building.objects) {
    if (obj.type === 'campfire') out.push({ x: obj.tileX * CONFIG.TILE + 16, y: obj.tileY * CONFIG.TILE + 10 });
  }
  for (const p of places.litFirepits()) out.push({ x: p.tileX * CONFIG.TILE + 16, y: p.tileY * CONFIG.TILE + 10 });
  return out;
}

// Every light source in view is registered with the lighting pass.
function minerHeadlampActive() {
  return clothing.head === "miner_helmet" && itemExists("miner_helmet");
}

function collectLights() {
  for (const obj of building.objects) {
    if (obj.type === 'campfire') {
      const flicker = 0.88 + Math.sin(performance.now() * 0.009 + obj.id) * 0.12;
      lighting.addLight(obj.tileX * CONFIG.TILE + 16, obj.tileY * CONFIG.TILE + 16, 168 * flicker, 1.05, 1);
    }
  }
  for (const lightObj of power.lights()) {
    if (!power.powered(lightObj)) continue;
    const lx = lightObj.tileX * CONFIG.TILE + 16;
    const ly = lightObj.type === 'wall_lamp' ? lightObj.tileY * CONFIG.TILE + 10 : lightObj.tileY * CONFIG.TILE - 38;
    lighting.addLight(lx, ly, lightObj.type === 'wall_lamp' ? 120 : 240, 1, 0.75);
  }
  for (const gen of power.generators()) {
    if (gen.running) lighting.addLight(gen.tileX * CONFIG.TILE + 32, gen.tileY * CONFIG.TILE + 16, 70, 0.5, 0.6);
  }
  if (flashlightOn && selectedItemId() === 'flashlight' && itemExists('flashlight')) {
    const px = player.x + player.w / 2 + player.facing * 56;
    const py = player.y + 22;
    lighting.addLight(px, py, 190, 1.05, 0.5);
    lighting.addLight(px + player.facing * 110, py, 140, 0.6, 0.45);
  }
  if (minerHeadlampActive()) {
    const px = player.x + player.w / 2 + player.facing * 34;
    const py = player.y + 13;
    lighting.addLight(px, py, 150, .92, .55);
    lighting.addLight(px + player.facing * 80, py, 105, .48, .48);
  }
  const night = daylightFactor() < 0.55;
  vehicles.collectLights(lighting, night);
  for (const obj of lore.interactables) {
    if (obj.type === 'archive' && lore.archiveUnlocked) lighting.addLight(obj.x + 14, obj.y + 12, 90, 0.7, 0.2);
  }
  for (const p of places.litFirepits()) {
    const flicker = 0.85 + Math.sin(performance.now() * 0.008 + p.id) * 0.15;
    lighting.addLight(p.tileX * CONFIG.TILE + 16, p.tileY * CONFIG.TILE + 16, 150 * flicker, 1, 1);
  }
  // Stage 20: every lamp, tube, candle and fire the structures placed
  structures.collectLights(lighting, camera.x, camera.y, canvas.width, canvas.height, daylightFactor());
  // Stage 20.1 restored manual switches: they add a local pool of light and
  // can intentionally black out an otherwise powered building for stealth.
  for (const p of places.activeLights()) {
    lighting.addLight(p.tileX * CONFIG.TILE + 16, p.tileY * CONFIG.TILE + 8, 155, .82, .72);
  }
  // powered areas glow from inside, which is what makes them worth walking to
  for (const s of structures.structures) {
    if (!places.poweredAreas.has(s.name)) continue;
    if (places.areaHasSwitch(s.name) && !places.areaLightsOn(s.name)) continue;
    const cx = (s.x + s.endX) / 2 * CONFIG.TILE;
    const cy = (s.groundY - 3) * CONFIG.TILE;
    if (Math.abs(cx - (camera.x + canvas.width / 2)) > canvas.width) continue;
    lighting.addLight(cx, cy, 300, 0.75, 0.7);
  }
}

function drawFlashlightCone() {
  const torch = flashlightOn && selectedItemId() === 'flashlight' && itemExists('flashlight');
  const helmet = minerHeadlampActive();
  if (!torch && !helmet) return;

  // A hand torch swings with the body and throws a wide, warm, soft-edged
  // cone. A helmet lamp is locked to the head: narrower, whiter, steadier.
  const t = performance.now() * .001;
  const beams = [];
  if (torch) {
    const sway = Math.sin(t * 1.7) * .035 + Math.sin(t * 4.3) * .012;
    beams.push({
      x: player.x + player.w / 2 - camera.x + player.facing * 11,
      y: player.y + (player.crouching ? 14 : 23) - camera.y,
      angle: sway, len: 250, spread: .30, color: '248,238,196', power: .20
    });
  }
  if (helmet) {
    beams.push({
      x: player.x + player.w / 2 - camera.x + player.facing * 8,
      y: player.y + (player.crouching ? 6 : 12) - camera.y,
      angle: Math.sin(t * 2.4) * .012, len: 190, spread: .17, color: '236,242,228', power: .17
    });
  }

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const b of beams) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(player.facing, 1);
    ctx.rotate(b.angle);
    // three nested cones: hot core, body, and a wide soft wash
    for (const [scale, alpha, spread] of [[.34, 1, .55], [.72, .58, .82], [1, .32, 1]]) {
      const len = b.len * scale, half = Math.tan(b.spread * spread) * len;
      const g = ctx.createLinearGradient(0, 0, len, 0);
      g.addColorStop(0, `rgba(${b.color},${(b.power * alpha).toFixed(3)})`);
      g.addColorStop(.55, `rgba(${b.color},${(b.power * alpha * .45).toFixed(3)})`);
      g.addColorStop(1, `rgba(${b.color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(len, -half);
      ctx.lineTo(len, half);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
    }
    // the bulb itself
    const bulb = ctx.createRadialGradient(0, 0, 0, 0, 0, 9);
    bulb.addColorStop(0, `rgba(${b.color},${(b.power * 1.8).toFixed(3)})`);
    bulb.addColorStop(1, `rgba(${b.color},0)`);
    ctx.fillStyle = bulb;
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawTarget() {
  if (!world.inBounds(mouse.tileX, mouse.tileY)) return;
  if (vehicles.active() || inventoryOpen) return;

  // Firearms use the actual mouse position instead of a tile selector. This
  // makes aiming feel like a shooter while mining/building stays grid based.
  const weapon = weaponProfile();
  if (weapon.kind === 'gun') {
    const rect = canvas.getBoundingClientRect();
    const mx = mouse.x * (canvas.width / rect.width);
    const my = mouse.y * (canvas.height / rect.height);
    const r = mouse.aiming ? 8 : 11 + Math.min(8, player.recoil * 6);
    ctx.save();
    ctx.strokeStyle = mouse.aiming ? 'rgba(224,231,215,.92)' : 'rgba(215,220,206,.72)';
    ctx.lineWidth = mouse.aiming ? 1.5 : 1;
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.moveTo(mx-r-6, my); ctx.lineTo(mx-r+1, my);
    ctx.moveTo(mx+r-1, my); ctx.lineTo(mx+r+6, my);
    ctx.moveTo(mx, my-r-6); ctx.lineTo(mx, my-r+1);
    ctx.moveTo(mx, my+r-1); ctx.lineTo(mx, my+r+6);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const x = mouse.tileX * CONFIG.TILE - camera.x;
  const y = mouse.tileY * CONFIG.TILE - camera.y;
  const inReach = withinReach(mouse.tileX, mouse.tileY);
  const empty = world.get(mouse.tileX, mouse.tileY) === TILE.AIR;
  ctx.save();
  ctx.strokeStyle = inReach ? (empty ? 'rgba(220,210,180,.5)' : 'rgba(245,220,125,.85)') : 'rgba(200,96,86,.7)';
  ctx.lineWidth = 2;
  const s = CONFIG.TILE;
  const cx = Math.floor(x), cy = Math.floor(y);
  const c = 7;
  ctx.beginPath();
  ctx.moveTo(cx + 1, cy + c); ctx.lineTo(cx + 1, cy + 1); ctx.lineTo(cx + c, cy + 1);
  ctx.moveTo(cx + s - c, cy + 1); ctx.lineTo(cx + s - 1, cy + 1); ctx.lineTo(cx + s - 1, cy + c);
  ctx.moveTo(cx + s - 1, cy + s - c); ctx.lineTo(cx + s - 1, cy + s - 1); ctx.lineTo(cx + s - c, cy + s - 1);
  ctx.moveTo(cx + c, cy + s - 1); ctx.lineTo(cx + 1, cy + s - 1); ctx.lineTo(cx + 1, cy + s - c);
  ctx.stroke();
  ctx.restore();
}

// Where the weapon is, in screen space, and at what angle. Shared by the item
// draw and by the muzzle flash so the two can never disagree.
function heldItemTransform() {
  const id = selectedItemId();
  const def = id ? ITEM_DEFS[id] : null;
  if (!def || !itemExists(id)) return null;

  const state = player.animState || player.animationState();
  const hand = playerHandAnchor(state, player.crouching, player.spriteFrame);
  const anchor = heldItemAnchor(id);
  let angle;

  if (def.gun && (mouse.aiming || player.recoil > .05)) {
    const aimWorldX = mouse.tileX * CONFIG.TILE + CONFIG.TILE / 2;
    const aimWorldY = mouse.tileY * CONFIG.TILE + CONFIG.TILE / 2;
    const dx = Math.max(8, Math.abs(aimWorldX - (player.x + player.w / 2)));
    const dy = aimWorldY - (player.y + player.h * .45);
    angle = Math.max(-.72, Math.min(.72, Math.atan2(dy, dx))) - player.recoil * .3;
  } else if (player.attack.phase) {
    const p = 1 - player.attack.timer / Math.max(.001, player.attack.total);
    const comboFlip = player.comboStep === 1 ? .14 : player.comboStep === 2 ? -.08 : 0;
    const heavy = player.attack.kind === 'heavy' ? 1.18 : 1;
    if (player.attack.phase === 'windup') angle = (-.9 - p * .7) * heavy + comboFlip;
    else if (player.attack.phase === 'active') angle = (.5 + p * .34) * heavy + comboFlip;
    else angle = (.84 - p * 1.1) * heavy + comboFlip;
  } else if (player.actionTimer > 0 && player.actionType === "mine") {
    const step = PLAYER_ANIMATIONS.mine.frames.indexOf(player.spriteFrame);
    angle = [-0.8, -1.35, 0.62, 0.1][step < 0 ? 0 : step];
  } else if (def.gun) {
    angle = state === 'reload' ? .5 : .12;
  } else {
    angle = state === 'run' ? .62 : player.crouching ? .2 : .34;
  }

  return {
    id, def, anchor,
    x: player.x + player.w / 2 + player.facing * hand.x,   // world space
    y: player.y + hand.y,
    angle,
    recoil: def.gun ? player.recoil : 0,
    fallbackSize: hand.size
  };
}

// The barrel end in screen space, for muzzle flash and smoke.
function heldMuzzlePoint(t) {
  if (!t || !t.anchor || !t.anchor.muzzle) return null;
  const [mx, my] = t.anchor.muzzle;
  const [gx, gy] = t.anchor.grip;
  const dx = (mx - gx) - t.recoil * 3.4, dy = my - gy;
  const c = Math.cos(t.angle), sn = Math.sin(t.angle);
  return {
    x: t.x + player.facing * (dx * c - dy * sn),
    y: t.y + (dx * sn + dy * c),
    // mirroring the sprite mirrors the barrel: (1,0) rotated by `angle` then
    // scaled by facing points along facing*cos(a), sin(a)
    angle: player.facing > 0 ? t.angle : Math.PI - t.angle
  };
}

function drawHeldItem() {
  const t = heldItemTransform();
  if (!t) return;
  if (["material", "component", "currency"].includes(t.def.category) && player.attackTimer <= 0 && player.actionTimer <= 0) return;

  ctx.save();
  ctx.translate(t.x - camera.x, t.y - camera.y);
  ctx.scale(player.facing, 1);
  ctx.rotate(t.angle);
  if (t.recoil > 0) ctx.translate(-t.recoil * 3.4, 0);
  ctx.imageSmoothingEnabled = false;

  // Held sprites are drawn so their declared grip pixel lands on the hand, so
  // the weapon is gripped instead of floating in front of the arm.
  const held = t.anchor ? ASSETS.ready(`held:${t.id}`) : null;
  if (held) {
    ctx.drawImage(held, -t.anchor.grip[0], -t.anchor.grip[1]);
  } else {
    const img = ASSETS.ready(`item:${t.id}`);
    if (img) ctx.drawImage(img, -5, -t.fallbackSize / 2, t.fallbackSize, t.fallbackSize);
  }
  ctx.restore();
}

function draw(dt) {
  const light = daylightFactor();
  const shake = fx.cameraOffset();

  ctx.save();
  ctx.translate(shake.x, shake.y);

  drawBackground(light);
  terrain.draw(ctx, camera.x, camera.y, canvas.width, canvas.height);
  structures.drawBackProps(ctx, camera.x, camera.y);
  places.draw(ctx, camera.x, camera.y);
  building.draw(ctx, camera.x, camera.y, mouse.tileX, mouse.tileY, player);
  farming.draw(ctx, camera.x, camera.y);
  power.draw(ctx, camera.x, camera.y);
  sustainable.draw(ctx, camera.x, camera.y);
  greenwater.draw(ctx,camera.x,camera.y,player,light);
  lore.draw(ctx, camera.x, camera.y);
  vehicles.draw(ctx, camera.x, camera.y);
  danger.draw(ctx, camera.x, camera.y, lighting);
  wildlife.draw(ctx, camera.x, camera.y);
  society.draw(ctx, camera.x, camera.y);
  if (!vehicles.active()) {
    player.draw(ctx, camera.x, camera.y, {
      sprinting: currentSprint, aiming: mouse.aiming, clothing,
      light: lighting.sampleAt(player.x + player.w / 2, player.y + player.h * .4)
    });
    drawHeldItem();
  }
  structures.drawDecorations(ctx, camera.x, camera.y);
  life.draw(ctx, camera.x, camera.y, light);
  fx.drawWorld(ctx, camera.x, camera.y);
  drawFlashlightCone();
  drawTarget();

  // lighting, then weather on top of it so rain is not swallowed by the dark
  collectLights();
  const weatherDim = weather.dimming();
  lighting.update(camera.x, camera.y, canvas.width, canvas.height, light, weatherDim);
  lighting.draw(ctx, camera.x, camera.y);
  structures.drawGlows(ctx, camera.x, camera.y, light);

  const undergroundWeather = weather.isUnderground(player, world);
  if (!undergroundWeather) {
    const sheltered = weather.isSheltered(player, world);
    weather.drawRain(ctx, sheltered);
    weather.drawSnow(ctx, sheltered);
    weather.drawWind(ctx, camera.x);
    weather.drawFog(ctx, camera.x);
    weather.drawLightning(ctx);
    weather.drawSeasonTint(ctx, worldMinutes, light);
  }
  lore.drawContamination(ctx, player, camera.x, camera.y);
  structures.drawAreaLabels(ctx, camera.x, camera.y);
  ctx.restore();

  const tension = Math.min(1, cachedThreat.chasing * .5 + (survival.health < 30 ? .4 : 0));
  fx.drawScreen(ctx, tension);
  structures.drawInterference(ctx);
  stage42.drawAtmosphere(ctx);

  hud.draw(ctx, {
    survival, injuries, lore, danger, weather, player,
    objectives: objectives.active(),
    crouching: player.crouching,
    weapon: hudWeaponState(),
    siege: hordes.siegeLevel(),
    staminaLocked: survival.energy < 12,
    vehicle: vehicles.active(),
    weight: inventory.totalWeight(),
    maxWeight: inventory.maxWeight,
    threat: cachedThreat,
    sprinting: currentSprint,
    clothing,
    nutrition: { state: food.state(), value: food.nourishment, malaise: food.malaise > 0 },
    season: weather.report(worldMinutes),
    game: wildlife.nearestAnimal(player)
  }, dt);
  stage42.drawHUD(ctx);
}

// The DOM top bar only carries slow-moving information, and it is only
// touched when a value actually changes — no per-frame layout work.
const topBarCache = { area: '', time: '', day: '', weather: '', temp: '', people: '', docs: '', vehicle: '' };

function setText(el, key, value) {
  if (!el || topBarCache[key] === value) return;
  topBarCache[key] = value;
  el.textContent = value;
}

function updateTopBar() {
  const tx = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
  const ty = Math.floor((player.y + player.h / 2) / CONFIG.TILE);
  const areaName = lore.areaName(player) || structures.areaAt(tx, ty) || world.region(tx).name;
  setText(ui.navArea, 'area', areaName);
  setText(ui.weatherText, 'weather', `${weather.seasonName(worldMinutes)} · ${weather.conditionName()}`);
  setText(ui.ambientText, 'temp', `${weather.ambientTemp.toFixed(0)}°C`);
  setText(ui.knownPeopleText, 'people', String(society.knownNPCs().length));
  setText(ui.archiveCountText, 'docs', `${lore.documentsFound().length}/${LORE_DOCUMENTS.length}`);
  const av = vehicles.active();
  setText(ui.vehicleNavText, 'vehicle', av ? 'DIRIGINDO' : vehicles.nearest(player, 5) ? 'PRÓXIMO' : '—');
  if (ui.baseDaysText) ui.baseDaysText.textContent = `${sustainable.foodDays().toFixed(1)}D`;

  const minute = Math.floor(worldMinutes % 1440);
  const hh = String(Math.floor(minute / 60)).padStart(2, '0');
  const mm = String(minute % 60).padStart(2, '0');
  setText(ui.time, 'time', `${hh}:${mm}`);
  setText(ui.day, 'day', String(Math.floor(worldMinutes / 1440) + 1));
}

let cachedThreat = { count: 0, chasing: 0, heavy: false, stalkerChasing: false };
let threatTimer = 0;
let uiTimer = 0;

function updateUI() {
  updateTopBar();
  if (ui.buildModeStatus) {
    ui.buildModeStatus.textContent = buildMode && building.activeBlueprint
      ? `Projeto: ${BUILD_DEFS[building.activeBlueprint].name}`
      : 'Nenhum projeto selecionado';
  }
  if (npcOpen && activeNPC) renderNpcModal();
  if (vehicleOpen) renderVehicleModal();
}

function nearActiveCampfire(radiusTiles = 3.2) {
  if (building.nearest(player, radiusTiles, o => o.type === "campfire")) return true;
  const pc = player.center();
  return places.litFirepits().some(p =>
    Math.hypot((p.tileX + .5) * CONFIG.TILE - pc.x, (p.tileY + .5) * CONFIG.TILE - pc.y) <= radiusTiles * CONFIG.TILE);
}

const anyModalOpen = () =>
  inventoryOpen || containerOpen || buildOpen || npcOpen || peopleOpen ||
  vehicleOpen || vehicleAssemblyOpen || radioOpen || archiveOpen || mapOpen ||
  sustainabilityOpen || mainMenuOpen || creativeOpen || opening.active;

// Context prompt: one scan per frame over the candidates, closest wins.
let promptTimer = 0;
let promptText = '';
function updateContextPrompt(dt) {
  const activeVehicle = vehicles.active();
  if (activeVehicle) {
    ui.contextPrompt.classList.remove('hidden');
    ui.contextPrompt.textContent = 'E — SAIR DO VEÍCULO';
    return;
  }
  if (anyModalOpen() || gameDead) {
    ui.contextPrompt.classList.add('hidden');
    return;
  }

  // the proximity sweep is several full scans, so it runs a few times a second
  promptTimer -= dt;
  if (promptTimer > 0) {
    ui.contextPrompt.classList.toggle('hidden', !promptText);
    if (promptText) ui.contextPrompt.textContent = promptText;
    return;
  }
  promptTimer = .12;

  const placePoint = places.nearest(player);
  const placePrompt = placePoint ? places.prompt(placePoint) : '';
  const lorePrompt = lore.nearest(player);
  const project = nearestVehicleProject();
  const vehicle = vehicles.nearest(player);
  const generator = power.nearestGenerator(player, 3);
  const npc = society.nearestNPC(player);
  const built = building.nearestInteractable(player);
  const container = structures.nearestContainer(player);

  let text = '';
  if (placePrompt) text = placePrompt;
  if (!text && lorePrompt) text = lore.promptFor(lorePrompt);
  if (!text && project) text = 'E — MONTAR PROJETO DE VEÍCULO';
  if (!text && vehicle) text = `E — ENTRAR EM ${vehicle.name.toUpperCase()}   ·   G GERENCIAR`;
  if (!text && generator) { power.prepare(generator); text = `E — ${generator.running ? 'DESLIGAR' : 'LIGAR / ABASTECER'} GERADOR`; }
  if (!text && npc) text = `E — FALAR COM ${npc.name.toUpperCase()}`;
  if (!text && built) {
    const label = built.type === 'door' || built.type === 'garage_door' ? (built.open ? 'FECHAR ACESSO' : 'ABRIR ACESSO')
      : built.type === 'campfire' ? 'DESCANSAR NA FOGUEIRA'
      : built.type === 'auto_bench' ? 'USAR BANCADA AUTOMOTIVA'
      : built.type === 'bed_build' ? 'DORMIR ATÉ AMANHECER'
      : built.type === 'rain_barrel' ? 'ENCHER GARRAFA'
      : built.type === 'radio_station' ? 'USAR RÁDIO DA BASE'
      : built.type === 'garden_plot' ? (() => {
          farming.prepare(built);
          if (!farming.crop(built)) return 'PLANTAR NO CANTEIRO';
          if (built.vigor <= 0) return 'LIMPAR CANTEIRO PERDIDO';
          if (farming.ripe(built)) return `COLHER ${farming.crop(built).name.toUpperCase()}`;
          if (built.water < 92) return `REGAR · ${farming.statusText(built)}`;
          return `ADUBAR · ${farming.statusText(built)}`;
        })()
      : built.type === 'water_trough' ? `ABASTECER CALHA (${Math.round(built.water || 0)}/10)`
      : built.type === 'snare_trap' ? (built.catch ? 'RECOLHER CAÇA DA ARMADILHA' : 'VERIFICAR ARMADILHA')
      : built.type === 'stove' ? 'COZINHAR NO FOGÃO'
      : built.type === 'drying_rack' ? 'USAR VARAL DE SECAGEM'
      : built.type === 'kitchen_station' ? 'VER COZINHA DA BASE'
      : built.type === 'medical_station' ? 'VER ENFERMARIA DA BASE'
      : built.type === 'guard_post' ? 'VER POSTO DE VIGIA'
      : built.type === 'water_reservoir' ? `COLETAR ÁGUA (${Math.round(built.water || 0)}/${built.waterCapacity || 80})`
      : built.type === 'compost_bin' ? 'PRODUZIR COMPOSTO'
      : built.type === 'pantry' ? 'ABRIR DESPENSA'
      : built.type === 'seed_storage' ? 'ABRIR SEMENTES'
      : BUILD_DEFS[built.type]?.stage39 ? 'GERENCIAR BASE SUSTENTÁVEL' : 'USAR BANCADA';
    text = `E — ${label}`;
  }
  if (!text) {
    const carcass = wildlife.nearestCarcass(player);
    if (carcass) text = `E — ABATER ${carcass.def.name.toUpperCase()}`;
  }
  if (!text && container) text = `E — ${container.name.toUpperCase()}${container.loot.length ? '' : ' (VAZIO)'}`;

  if (placePoint) {
    if ((placePoint.kind === 'door' && placePoint.locked) || placePoint.kind === 'barricade') objectives.flag('saw_locked_door');
    if (placePoint.needsPower && !places.isPowered(placePoint)) objectives.flag('saw_dead_power');
    if (placePoint.name && placePoint.name.includes('evidência')) objectives.flag('saw_evidence_door');
  }
  if (vehicle) {
    objectives.flag('saw_vehicle');
    if (vehicle.fuel <= 1) objectives.flag('saw_empty_vehicle');
    if (vehicle.battery <= 5) objectives.flag('saw_dead_battery');
  }

  promptText = text;
  ui.contextPrompt.classList.toggle('hidden', !text);
  if (text) ui.contextPrompt.textContent = text;
}

function update(rawDt) {
  opening.update(rawDt);
  // hit-stop slows the simulation briefly without touching the framerate
  let dt = rawDt;
  if (hitstop > 0) {
    hitstop = Math.max(0, hitstop - rawDt);
    dt = rawDt * 0.12;
  }
  const paused = anyModalOpen() || gameDead;

  if (!paused) {
    const moving = input.left || input.right;
    const ratio = inventory.totalWeight() / (inventory.capacity?.() || inventory.maxWeight);
    currentSprint = Boolean(input.sprint && moving && survival.canSprint() && ratio <= 1.1);

    if (vehicles.active()) {
      currentSprint = false;
      vehicles.update(dt, input, player);
    } else {
      player.update(input, {
        speedScale: weightSpeedScale() * (1 + clothingStats().moveBonus) * arsenal.movementScale(selectedItemId(), mouse.aiming),
        sprinting: currentSprint,
        aiming: mouse.aiming,
        flight: creative.enabled && creative.flying,
        dt
      });
      currentSprint = player.wasSprinting;
      meleeChain.timer = Math.max(0, meleeChain.timer - dt);
      if (bufferedMelee) {
        bufferedMelee.expires -= dt;
        if (bufferedMelee.expires <= 0) bufferedMelee = null;
      }
      const phase = player.updateAttack(dt);
      if (phase === 'hit') resolveSwing();
      if (phase === 'done' && bufferedMelee) {
        const next = bufferedMelee.kind;
        bufferedMelee = null;
        meleeAttack(next);
      }
      if (player.reload.timer <= 0 && player.reload.weapon) finishReload();
      const heldWeapon = weaponProfile();
      if (mouse.attackHeld && heldWeapon.kind === "gun" && heldWeapon.gun.auto) { faceMouse(); fireWeapon(); }
    }

    const env = weather.update(dt, worldMinutes, player, world);
    const clothes = clothingStats();
    // Chuva e tempestade abafam o mundo inteiro: passos, tiros e gritos viajam
    // menos. Neblina, que é ar parado, carrega som um pouco melhor.
    danger.environmentNoiseScale = env.noiseScale ?? 1;
    const nutrition = food.modifiers();
    if (currentGameMode === 'free') {
      survival.health=survival.maxHealth;survival.hunger=100;survival.thirst=100;
      survival.energy=survival.maxEnergy;survival.sleep=survival.maxSleep;survival.bodyTemp=36.8;survival.wetness=0;
    } else {
      survival.update(
        dt,
        { moving: vehicles.active() ? false : moving, sprinting: currentSprint, crouching: vehicles.active() ? false : player.crouching, staminaUseScale: clothes.staminaUseScale },
        {
          ...env,
          sheltered: vehicles.active() ? true : env.sheltered,
          insulation: clothes.insulation + nutrition.insulationBonus,
          rainProtection: clothes.rainProtection,
          nearFire: nearActiveCampfire(),
          hungerScale: nutrition.hungerScale,
          recoveryScale: nutrition.recoveryScale
        }
      );
      injuries.update(dt, survival);
    }
    lore.update(dt, player, survival, clothing);

    if (flashlightOn) {
      if (selectedItemId() !== "flashlight" || !itemExists("flashlight")) flashlightOn = false;
      else {
        const drain = inventory.damageTool("flashlight", dt * 1.15);
        if (drain.broke) {
          cleanupBrokenItem("flashlight");
          flashlightOn = false;
          showToast("A lanterna ficou sem carga");
        }
      }
    }

    input.jumpPressed = false;

    // Footsteps: crouching is genuinely quiet, sprinting carries a long way.
    footstepNoiseTimer -= dt;
    if (!vehicles.active() && moving && footstepNoiseTimer <= 0) {
      const radius = (currentSprint ? 150 : player.crouching ? 22 : 62) * clothes.noiseScale;
      danger.emitNoise(player.x + player.w / 2, player.y + player.h, radius, "passos");
      footstepNoiseTimer = currentSprint ? .4 : player.crouching ? 1.1 : .78;
    }
    // the sound itself is driven by the animation, not the noise timer
    if (fx.takeStep() && !vehicles.active()) {
      audio.footstep(fx.groundGroup || 'soil', { running: currentSprint, crouching: player.crouching });
    }

    if (currentGameMode !== 'free' || creativeThreats) danger.update(dt, player, {
      camera, viewW: canvas.width, viewH: canvas.height,
      visibilityScale: sceneVisibilityScale(),
      onWake: enemy => {
        audio.groan('idle', audioPan(enemy.x), 1);
        if (Math.abs(enemy.x - player.x) < 340) showToast('Algo se move aqui dentro', 'warn');
      },
      onVoice: (enemy, kind) => {
        if (Math.abs(enemy.x - player.x) > 760) return;
        audio.groan(kind, audioPan(enemy.x), kind === 'attack' ? .8 : .55);
      },
      onWindup: enemy => audio.groan('attack', audioPan(enemy.x), .7),
      onGetUp: enemy => audio.impact('flesh', .5, audioPan(enemy.x)),
      onSpot: enemy => audio.groan('screech', audioPan(enemy.x), .8),
      onScream: enemy => {
        audio.groan('screech', audioPan(enemy.x), 1.3);
        hordes.onLoudNoise(enemy.x, 820);
        if (Math.abs(enemy.x - player.x) < 900) showToast('Um berrador está chamando a rua inteira', 'danger');
      },
      onPlayerHit: (amount, sourceX) => {
        if (vehicles.active()) {
          vehicles.damageActive(amount);
          fx.shake = Math.max(fx.shake, 1.8);
          showToast('Impacto no veículo');
        } else damagePlayer(amount, sourceX);
      },
      onBreak: (enemy, cell) => {
        fx.debris(cell.x * CONFIG.TILE + 16, cell.y * CONFIG.TILE + 16, '#8a7a5c', 8, true);
        fx.shake = Math.max(fx.shake, 2);
        audio.world('break', audioPan(cell.x * CONFIG.TILE));
      }
    });
    if (!vehicles.active()) society.update(dt, player);
    power.update(dt, { daylight:daylightFactor(), rainIntensity:weather.rainIntensity });
    sustainable.update(dt);
    greenwater.update(dt,player);
    journey42.update(dt);
    food.update(dt, weather.ambientTemp+(greenwater.active(player)?2.5:0));
    food.applyRegen(dt);
    farming.update(dt, { rainIntensity: weather.rainIntensity, ambientTemp: weather.ambientTemp, freezing: weather.freezing() });
    wildlife.update(dt, player, {
      camera, viewW: canvas.width,
      stealth: playerVisibilityScale(),
      visibility: weather.visibility(),
      noiseScale: weather.noiseScale()
    });
    // Armadilhas trabalham em tempo de mundo, não em frames.
    if (worldMinutes - lastTrapMinute >= 10) {
      const caught = wildlife.updateTraps(worldMinutes - lastTrapMinute, building);
      lastTrapMinute = worldMinutes;
      if (caught) showToast(`${caught} armadilha${caught > 1 ? 's' : ''} com caça presa`, 'good');
    }
    places.update(dt);
    if (currentGameMode !== 'free' || creativeThreats) hordes.update(dt);
    stage42.update(dt, currentGameMode !== 'free' || creativeThreats);
    building.updateUtilities(dt, weather.rainIntensity);
    objectives.update(dt);
    // Stage 20: which structure we are in, first visits, secret rooms, ambience
    {
      const ptx = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
      const pty = Math.floor((player.y + player.h / 2) / CONFIG.TILE);
      const visit = structures.visit(ptx, pty);
      worldState.update(dt, player, places, visit);
      progression.observe();
      if (visit.fresh && visit.fresh.type !== 'blackridge') showToast(`${visit.fresh.name}${visit.fresh.state && visit.fresh.state !== 'intact' ? ' — ' + STATE_LABELS[visit.fresh.state] : ''}`, 'info');
      if (visit.secret) { showToast(`Você encontrou: ${visit.secret.label}`, 'good'); audio.world('pickup', 0); }
      const underground = pty > world.surface[Math.max(0, Math.min(CONFIG.WORLD_W - 1, ptx))] + 6;
      structures.updateAmbience(dt, fx, camera, canvas.width, canvas.height, {
        daylight: daylightFactor(), wind: weather.wind, rain: weather.rainIntensity,
        region: world.region(ptx).id, underground, poweredAreas: places.poweredAreas
      });
    }
    baseCamp.update(dt, player);
    campaign.update(dt, player);
    events.update(dt);
    for (const note of objectives.takeRecent()) {
      showToast(note.kind === 'new' ? `Novo objetivo: ${note.title}` : `Objetivo concluído: ${note.title}`,
        note.kind === 'new' ? 'warn' : 'good');
    }
    if (inventory.totalWeight() > inventory.maxWeight) objectives.flag('was_overweight');
    fx.setGroundTile(world.get(Math.floor((player.x + player.w / 2) / CONFIG.TILE), Math.floor((player.y + player.h + 2) / CONFIG.TILE)));
    fx.update(dt, player, camera, {
      sprinting: currentSprint, moving,
      wind: weather.wind, width: canvas.width, height: canvas.height
    });
    updateAudioScene(dt);
    life.update(dt, camera, world, {
      width: canvas.width, wind: weather.wind,
      fires: collectFireSources()
    });

    if (survival.health <= 0) {
      const reason = survival.bodyTemp < 34.2 ? "O frio venceu este sobrevivente." :
        injuries.bleedingRate() > 0 ? "Os ferimentos não tratados foram fatais." :
        "Fome, sede ou ferimentos venceram este sobrevivente.";
      triggerDeath(reason);
    }
    autosaveTimer += dt;
    if (autosaveTimer >= 120) { autosaveTimer = 0; saveGameState(false, SaveSlots.AUTO_ID); }
    updateClock(dt);
    updateCamera(dt);
  } else {
    currentSprint = false;
    input.jumpPressed = false;
  }

  threatTimer -= dt;
  if (threatTimer <= 0) {
    threatTimer = .2;
    cachedThreat = danger.nearbyThreat(player);
  }

  if (mineCooldown > 0) mineCooldown -= dt;
  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) ui.toast.classList.add("hidden");
  }

  updateMouseTile();
  if (mouse.mining && !paused && !vehicles.active() && !buildMode) mineAtMouse();
  updateContextPrompt(dt);

  uiTimer -= dt;
  if (uiTimer <= 0) {
    uiTimer = .2;
    updateUI();
  }
}

function frame(now) {
  const dt = Math.min(.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw(dt);
  requestAnimationFrame(frame);
}


function faceMouse() {
  const wx = mouse.tileX * CONFIG.TILE + CONFIG.TILE / 2;
  const cx = player.x + player.w / 2;
  if (Math.abs(wx - cx) > 4) player.facing = wx >= cx ? 1 : -1;
}

function miningToolOnTarget() {
  const def = selectedItemDef();
  if (!def || !['pickaxe','axe'].includes(def.toolType)) return false;
  if (!world.inBounds(mouse.tileX, mouse.tileY) || !withinReach(mouse.tileX, mouse.tileY)) return false;
  const tile = world.get(mouse.tileX, mouse.tileY);
  return tile !== TILE.AIR && TILE_INFO[tile]?.mineable !== false;
}

function enemyUnderCursor(radius = 34) {
  const wx = mouse.tileX * CONFIG.TILE + CONFIG.TILE / 2;
  const wy = mouse.tileY * CONFIG.TILE + CONFIG.TILE / 2;
  let best = null, bestD = radius;
  for (const enemy of danger.enemies) {
    if (!enemy.alive) continue;
    const ex = enemy.x + enemy.w / 2, ey = enemy.y + enemy.h / 2;
    const d = Math.hypot(ex - wx, ey - wy);
    if (d < bestD) { best = enemy; bestD = d; }
  }
  return best;
}

function primaryMouseAction() {
  updateMouseTile();
  faceMouse();
  if (creative.enabled) {
    const r=creative.remove(mouse.tileX,mouse.tileY);
    if(r.ok){terrain.invalidateAll?.();fx.mining(mouse.tileX*CONFIG.TILE+16,mouse.tileY*CONFIG.TILE+16,r.tile||TILE.DIRT,true);}
    return;
  }
  const w = weaponProfile();
  if (w.kind === 'gun') {
    mouse.attackHeld = true;
    fireWeapon();
    return;
  }
  const def = selectedItemDef();
  if (def?.toolType === 'scanner') {
    showToast('Scanner geológico: use o botão direito para prospectar.', 'warn');
    return;
  }
  if (def?.melee && (enemyUnderCursor() || !miningToolOnTarget())) {
    mouse.attackHeld = true;
    meleeAttack('light');
    return;
  }
  if (!def) {
    mouse.attackHeld = true;
    meleeAttack('light');
    return;
  }
  mouse.mining = true;
  mineAtMouse();
}

function secondaryMouseAction() {
  updateMouseTile();
  faceMouse();
  if (creative.enabled) {
    const r=creative.place(mouse.tileX,mouse.tileY);
    if(!r.ok&&!r.silent)showToast(r.reason,'warn');
    else if(r.ok){terrain.invalidateAll?.();fx.build(mouse.tileX*CONFIG.TILE+16,mouse.tileY*CONFIG.TILE+16);}
    return;
  }
  const w = weaponProfile();
  if (w.kind === 'gun') {
    mouse.aiming = true;
    return;
  }
  const def = selectedItemDef();
  if (def?.toolType === 'scanner') {
    const tx = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
    const ty = Math.floor((player.y + player.h / 2) / CONFIG.TILE);
    const scan = mining.scan(tx, ty, performance.now() / 1000);
    if (!scan.ok) { showToast(scan.reason, 'warn'); return; }
    const wear = inventory.damageTool(selectedItemId(), 1);
    if (wear.broke) { cleanupBrokenItem(selectedItemId()); showToast('O scanner parou de funcionar', 'warn'); }
    else showToast(scan.text, scan.found ? 'good' : 'warn');
    audio.world('radio', audioPan(player.x + player.w / 2));
    return;
  }
  if (def?.melee) {
    meleeAttack('heavy');
    return;
  }
  placeAtMouse();
}

function typingInField(e) {
  const t = e.target;
  return Boolean(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable));
}

// Closes whatever is on top; returns true if something was closed.
function closeTopModal() {
  if (sustainabilityOpen) { toggleSustainability(false); return true; }
  if (mapOpen) { toggleMap(false); return true; }
  if (vehicleAssemblyOpen) { closeVehicleAssembly(); return true; }
  if (vehicleOpen) { closeVehicleModal(); return true; }
  if (npcOpen) { closeNpcModal(); return true; }
  if (containerOpen) { closeContainerModal(); return true; }
  if (radioOpen) { toggleRadio(false); return true; }
  if (archiveOpen) { toggleArchive(false); return true; }
  if (peopleOpen) { togglePeople(false); return true; }
  if (buildOpen) { toggleBuild(false); return true; }
  if (inventoryOpen) { toggleInventory(false); return true; }
  if (buildMode) { cancelBuildMode(); return true; }
  return false;
}

const GAME_KEYS = ["a", "d", "w", "s", "c", " ", "arrowleft", "arrowright", "arrowup", "arrowdown",
  "tab", "j", "k", "e", "q", "b", "n", "g", "f", "x", "v", "l", "r", "m", "h", "y", "f10"];

document.addEventListener("keydown", e => {
  audio.unlock();
  // never steal keys from the inventory search box
  if (typingInField(e)) {
    if (e.key === "Escape") e.target.blur();
    return;
  }

  const k = e.key.toLowerCase();
  if(opening.active){e.preventDefault();opening.handleKey(k);return;}
  if (k === 'escape' && !mainMenuOpen) { if(!closeTopModal()){mainMenuOpen=true;window.Stage32Menu?.open();} return; }
  if (mainMenuOpen) return;
  if (currentGameMode === 'free' && k === 'p') { window.Stage32Menu?.toggleCreative(); return; }
  if (currentGameMode === 'free' && k === 'z') { creative.toggleFlight(); window.Stage32Menu?.syncCreativeHud(); showToast(creative.flying?'Voo ativado':'Voo desativado','good'); return; }
  if (k === "f10") {
    const muted = audio.toggleMute();
    showToast(muted ? "Som desligado" : "Som ligado");
    return;
  }
  if (k === "m") { toggleMap(); return; }
  if (k === "y") { toggleSustainability(); return; }
  if (GAME_KEYS.includes(k)) e.preventDefault();

  if (gameDead) {
    if (k === "enter" || k === " ") startNewSurvivor();
    return;
  }

  // hotbar selection always works, even with a panel open
  const num = Number(k);
  if (num >= 1 && num <= hotbar.length) {
    selected = num - 1;
    renderHotbar();
    if (inventoryOpen) renderInventory();
    updateUI();
    return;
  }

  if (k === "f6") { saveGameState(true); return; }
  if (k === "f9") { loadGameState(null, false); return; }
  if (k === "escape") return;

  // panel toggles: each key closes its own panel, or swaps to it
  if (k === "tab") { if (!containerOpen) toggleInventory(); return; }
  if (k === "b") {
    if (buildMode) { cancelBuildMode(); return; }
    if (!containerOpen && !vehicles.active()) toggleBuild();
    return;
  }
  if (k === "n") { if (!containerOpen) togglePeople(); return; }
  if (k === "q") { if (!containerOpen && !vehicles.active()) toggleRadio(); return; }
  if (k === "l") { if (!containerOpen) toggleArchive(); return; }
  if (k === "g") {
    if (vehicleOpen) { closeVehicleModal(); return; }
    if (!containerOpen && !vehicleAssemblyOpen) openVehicleModal();
    return;
  }

  if (anyModalOpen()) {
    if (k === "e") closeTopModal();
    return;
  }

  if (k === "h" && vehicles.active()) {
    const v = vehicles.active();
    const horn = vehicles.horn(v);
    if (horn.ok) {
      audio.world('horn', audioPan(v.x + v.w / 2));
      hordes.onLoudNoise(v.x + v.w / 2, horn.noise);
      showToast("Buzina — isso vai chamar atenção", "warn");
    }
    return;
  }
  if (k === "r") {
    if (vehicles.active()) {
      const r = vehicles.toggleEngine(vehicles.active());
      showToast(r.ok ? (r.on ? "Motor ligado" : "Motor desligado") : r.reason);
      if (r.ok && r.on) {
        audio.world('engine_start', audioPan(player.x));
        const v = vehicles.active();
        hordes.onLoudNoise(v.x, 420);
      }
      return;
    }
    if (reloadWeapon()) return;
    return;
  }
  if (k === "f") { repairNearby(); return; }
  if (k === "x") { dismantleNearby(); return; }
  if (k === "v") {
    if (selectedItemId() === "flashlight" && itemExists("flashlight")) {
      flashlightOn = !flashlightOn;
      showToast(flashlightOn ? "Lanterna ligada" : "Lanterna desligada");
    } else showToast("Equipe a lanterna primeiro");
    return;
  }
  if (k === "e") {
    if (!interactPlace() && !interactLore() && !interactVehicleProject() && !interactVehicle() &&
        !interactPower() && !interactNPC() && !interactBuiltObject() && !interactCarcass()) {
      openNearbyContainer();
    }
    return;
  }
  if (k === "j") { meleeAttack('light'); return; }
  if (k === "k") { meleeAttack('heavy'); return; }

  if (k === "a" || k === "arrowleft") input.left = true;
  if (k === "d" || k === "arrowright") input.right = true;
  if (k === "w" || k === "arrowup") input.up = true;
  if (k === "s" || k === "arrowdown") input.down = true;
  if (k === "shift") input.sprint = true;
  if (k === "control" || k === "c") input.crouch = true;
  if (k === " " || k === "arrowup" || k === "w") {
    if (!input.jump) input.jumpPressed = true;
    input.jump = true;
  }
});

document.addEventListener("keyup", e => {
  const k = e.key.toLowerCase();
  if (k === "a" || k === "arrowleft") input.left = false;
  if (k === "d" || k === "arrowright") input.right = false;
  if (k === "w" || k === "arrowup") input.up = false;
  if (k === "s" || k === "arrowdown") input.down = false;
  if (k === "shift") input.sprint = false;
  if (k === "control" || k === "c") input.crouch = false;
  if (k === " " || k === "arrowup" || k === "w") input.jump = false;
});

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", e => {
  e.preventDefault();
  audio.unlock();
  canvas.focus?.();
  if (anyModalOpen() || vehicles.active() || gameDead) return;
  if (buildMode) {
    if (e.button === 0) placeBlueprintAtMouse();
    if (e.button === 2) cancelBuildMode();
    return;
  }
  if (e.button === 0) primaryMouseAction();
  if (e.button === 2) secondaryMouseAction();
});

window.addEventListener("mouseup", e => {
  if (e.button === 0) { mouse.mining = false; mouse.attackHeld = false; }
  if (e.button === 2) mouse.aiming = false;
});
canvas.addEventListener("mouseleave", () => { mouse.mining = false; mouse.attackHeld = false; mouse.aiming = false; });

canvas.addEventListener("contextmenu", e => e.preventDefault());

ui.archiveButton.addEventListener("click", () => { if (!vehicles.active()) toggleArchive(); });
ui.closeArchive.addEventListener("click", () => toggleArchive(false));
ui.archiveModal.addEventListener("mousedown", e => { if (e.target === ui.archiveModal) toggleArchive(false); });

ui.closeRadio.addEventListener("click", () => toggleRadio(false));
ui.radioModal.addEventListener("mousedown", e => { if (e.target === ui.radioModal) toggleRadio(false); });
ui.radioPrevButton.addEventListener("click", () => { radioIndex -= 1; renderRadio(); });
ui.radioNextButton.addEventListener("click", () => { radioIndex += 1; renderRadio(); });
ui.radioListenButton.addEventListener("click", () => {
  const available = availableRadioEntries();
  if (!available.length) return;
  radioIndex = ((radioIndex % available.length) + available.length) % available.length;
  const row = available[radioIndex];
  if (row.campaignSignal) {
    const s = campaign.hearOperation(row.id);
    if (!s) return;
    ui.radioTranscript.textContent = row.text;
    showToast(`Operação marcada no mapa: ${s.title}`, 'warn');
    worldState.record('campaign_map_marker', { id:s.id, x:s.tileX, y:s.tileY });
  } else if (row.baseSignal) {
    const s = baseCamp.hearSignal(row.id);
    if (!s) return;
    ui.radioTranscript.textContent = row.text;
    showToast(`Sinal marcado no mapa: ${s.title}`, 'warn');
    worldState.record('radio_map_marker', { id:s.id, x:s.tileX, y:s.tileY });
  } else {
    const t = lore.hearTransmission(row.id);
    if (!t) return;
    ui.radioTranscript.textContent = t.text;
    showToast(`Transmissão registrada: ${t.freq}`);
  }
  renderRadio();
});

ui.transmitArchiveButton.addEventListener("click", () => {
  if (!lore.chooseArchive("transmit")) return;
  campaign.applyBlackridgeOutcome();
  showToast("Os arquivos Blackridge foram transmitidos pelo relay");
  renderArchive();
});
ui.sealArchiveButton.addEventListener("click", () => {
  if (!lore.chooseArchive("seal")) return;
  campaign.applyBlackridgeOutcome();
  showToast("O arquivo Blackridge foi selado");
  renderArchive();
});

ui.closeVehicleAssembly.addEventListener("click",closeVehicleAssembly);
ui.vehicleAssemblyModal.addEventListener("mousedown",e=>{if(e.target===ui.vehicleAssemblyModal)closeVehicleAssembly();});
ui.completeVehicleButton.addEventListener("click",()=>{
  if(!activeVehicleProject)return;
  const project=vehicleCraft.projectForObject(activeVehicleProject);
  const r=vehicleCraft.complete(project,player);
  if(!r.ok){showToast(r.reason);return;}
  showToast(`${r.vehicle.name} concluído`);
  closeVehicleAssembly();
  renderBuildGrid();renderInventory();renderHotbar();updateUI();
});

ui.vehicleButton.addEventListener("click",()=>openVehicleModal());
ui.closeVehicle.addEventListener("click",closeVehicleModal);
ui.vehicleModal.addEventListener("mousedown",e=>{if(e.target===ui.vehicleModal)closeVehicleModal();});
ui.vehicleEngineButton.addEventListener("click",()=>{const v=vehicleForMenu();if(!v)return;const r=vehicles.toggleEngine(v);showToast(r.ok?(r.on?'Motor ligado':'Motor desligado'):r.reason);renderVehicleModal();});
ui.vehicleRefuelButton.addEventListener("click",()=>{const r=vehicles.refuel(vehicleForMenu());showToast(r.ok?'Veículo abastecido':r.reason);renderVehicleModal();renderInventory();renderHotbar();});
ui.vehicleBatteryButton.addEventListener("click",()=>{const r=vehicles.installBattery(vehicleForMenu());showToast(r.ok?'Bateria instalada':r.reason);renderVehicleModal();renderInventory();renderHotbar();});
ui.vehicleRepairButton.addEventListener("click",()=>{const r=vehicles.repair(vehicleForMenu());showToast(r.ok?'Veículo reparado':r.reason);renderVehicleModal();renderInventory();renderHotbar();});
ui.vehicleDrainButton?.addEventListener("click",()=>{const r=vehicles.drainFuel(vehicleForMenu());showToast(r.ok?`Combustível drenado (${r.amount} L)` : r.reason, r.ok?'good':'warn');renderVehicleModal();renderInventory();renderHotbar();});

ui.inventoryButton.addEventListener("click", () => { if (!containerOpen && !buildOpen && !npcOpen && !peopleOpen) toggleInventory(); });
ui.peopleButton.addEventListener("click", () => { if (!inventoryOpen && !containerOpen && !buildOpen && !npcOpen) togglePeople(); });
ui.closeNpc.addEventListener("click", closeNpcModal);
ui.closePeople.addEventListener("click", () => togglePeople(false));

ui.questActionButton.addEventListener("click", () => {
  if (!activeNPC) return;
  const q = activeNPC.quest;
  const result = q.status === "available" ? society.acceptQuest(activeNPC) : society.completeQuest(activeNPC);
  showToast(result.ok ? (q.status === "active" ? "Trabalho aceito" : "Trabalho concluído") : result.reason);
  renderNpcModal(); renderPeoplePanel(); renderInventory(); renderHotbar(); updateUI();
});

ui.recruitButton.addEventListener("click", () => {
  if (!activeNPC) return;
  const result = society.recruit(activeNPC);
  showToast(result.ok ? `${activeNPC.name} entrou no seu grupo` : result.reason);
  renderNpcModal(); renderPeoplePanel();
});

ui.dismissButton.addEventListener("click", () => {
  if (!activeNPC) return;
  if (society.activeCompanionId === activeNPC.id) {
    society.sendToBase(activeNPC);
    showToast(`${activeNPC.name} ficou na sua base`);
  } else {
    const result = society.activateCompanion(activeNPC);
    showToast(result.ok ? `${activeNPC.name} vai viajar com você` : result.reason);
  }
  renderNpcModal(); renderPeoplePanel();
});
ui.companionFollowButton?.addEventListener("click", () => { const r=society.setCompanionMode('follow'); showToast(r.ok?'Companheiro seguindo você':r.reason, r.ok?'good':'warn'); renderPeoplePanel(); });
ui.companionHoldButton?.addEventListener("click", () => { const r=society.setCompanionMode('hold'); showToast(r.ok?'Companheiro vai esperar aqui':r.reason, r.ok?'good':'warn'); renderPeoplePanel(); });
ui.companionAvoidButton?.addEventListener("click", () => { const r=society.setCompanionMode('avoid'); showToast(r.ok?'Companheiro evitará combate':r.reason, r.ok?'good':'warn'); renderPeoplePanel(); });
ui.companionBaseButton?.addEventListener("click", () => { const n=society.activeCompanionId?society.get(society.activeCompanionId):null; if(!n){showToast('Nenhum companheiro ativo','warn');return;} society.sendToBase(n); showToast(`${n.name} voltou para a base`,'good'); renderPeoplePanel(); });

ui.claimBaseStockButton?.addEventListener("click", () => {
  const moved = baseCamp.claimStock();
  showToast(moved ? `${moved} item${moved === 1 ? '' : 's'} retirado${moved === 1 ? '' : 's'} da base` : 'Nada cabe na mochila ou o estoque está vazio', moved ? 'good' : 'warn');
  renderPeoplePanel(); renderInventory(); renderHotbar(); updateUI();
});
ui.saveGameButton?.addEventListener("click", () => saveGameState(true));
ui.loadGameButton?.addEventListener("click", () => loadGameState(null, false));

ui.mapButton?.addEventListener("click", () => toggleMap());
ui.closeMap?.addEventListener("click", () => toggleMap(false));
ui.mapModal?.addEventListener("mousedown", e => { if (e.target === ui.mapModal) toggleMap(false); });
ui.countyMap?.addEventListener("click", mapClick);
document.getElementById('mapZoomIn')?.addEventListener('click', () => { countyMapView.setZoom(countyMapView.zi + 1); renderCountyMap(); });
document.getElementById('mapZoomOut')?.addEventListener('click', () => { countyMapView.setZoom(countyMapView.zi - 1); renderCountyMap(); });
document.getElementById('mapCenter')?.addEventListener('click', () => { const pc = player.center(); countyMapView.centerOn(pc.x / CONFIG.TILE, pc.y / CONFIG.TILE); countyMapView.clampCenter(); renderCountyMap(); });
ui.sustainabilityButton?.addEventListener("click", () => toggleSustainability());
ui.closeSustainability?.addEventListener("click", () => toggleSustainability(false));
ui.sustainabilityModal?.addEventListener("mousedown", e => { if (e.target === ui.sustainabilityModal) toggleSustainability(false); });
ui.togglePowerOverlay?.addEventListener("click", () => { sustainable.overlay=!sustainable.overlay; renderSustainability(); showToast(sustainable.overlay?'Rede elétrica visível':'Rede elétrica oculta'); });
ui.buildButton.addEventListener("click", () => { if (!inventoryOpen && !containerOpen) toggleBuild(); });
ui.closeBuild.addEventListener("click", () => toggleBuild(false));
ui.closeContainer.addEventListener("click", closeContainerModal);
ui.takeAllButton.addEventListener("click", takeAllFromContainer);
ui.closeInventory.addEventListener("click", () => toggleInventory(false));
ui.newSurvivorButton.addEventListener("click", startNewSurvivor);

ui.inventoryModal.addEventListener("mousedown", e => {
  if (e.target === ui.inventoryModal) toggleInventory(false);
});
ui.containerModal.addEventListener("mousedown", e => {
  if (e.target === ui.containerModal) closeContainerModal();
});
ui.buildModal.addEventListener("mousedown", e => {
  if (e.target === ui.buildModal) toggleBuild(false);
});
ui.npcModal.addEventListener("mousedown", e => {
  if (e.target === ui.npcModal) closeNpcModal();
});
ui.peopleModal.addEventListener("mousedown", e => {
  if (e.target === ui.peopleModal) togglePeople(false);
});

window.addEventListener("beforeunload", () => { if(currentSaveSlot&&!mainMenuOpen)saveGameState(false); });

window.addEventListener("blur", () => {
  input.left = false;
  input.right = false;
  input.up = false;
  input.down = false;
  input.jump = false;
  input.jumpPressed = false;
  input.sprint = false;
  input.crouch = false;
  mouse.mining = false;
});


if (ui.inventoryFilters) {
  ui.inventoryFilters.querySelectorAll("[data-inv-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      inventoryFilter = btn.dataset.invFilter;
      ui.inventoryFilters.querySelectorAll("[data-inv-filter]").forEach(x => x.classList.toggle("active", x === btn));
      inventorySelectedId = null;
      renderInventory();
    });
  });
}
if (ui.inventorySearch) {
  ui.inventorySearch.addEventListener("input", () => {
    inventoryQuery = ui.inventorySearch.value;
    inventorySelectedId = null;
    renderInventory();
  });
}
if (ui.inventorySort) {
  ui.inventorySort.value = inventorySortMode;
  ui.inventorySort.addEventListener("change", () => { inventorySortMode=ui.inventorySort.value; localStorage.setItem("lc_inventory_sort",inventorySortMode); renderInventory(); });
}
if (ui.craftSearch) ui.craftSearch.addEventListener("input",()=>{ craftQuery=ui.craftSearch.value; renderCrafting(); });
if (ui.craftFavoritesButton) ui.craftFavoritesButton.addEventListener("click",()=>{ craftFavoritesOnly=!craftFavoritesOnly; renderCrafting(); });
if (ui.storeMaterialsButton) ui.storeMaterialsButton.addEventListener("click",storeMaterialsInContainer);

if (bootSave) loadGameState(bootSave, true);

renderHotbar();
renderInventory();
renderPinnedRecipe();
renderBuildGrid();
renderPeoplePanel();
renderArchive();
renderRadio();
renderSustainability();
updateUI();
opening.start();
requestAnimationFrame(frame);
