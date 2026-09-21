// Stage 21 — progression that turns scavenging into a readable ladder.
// It observes what the survivor has actually found and which places were
// discovered, then permanently unlocks broader crafting tiers for this run.

const PROGRESSION_TIERS = [
  {
    id: 0, key: 'improvised', name: 'IMPROVISO', short: 'T0',
    description: 'Madeira, pedra e o que couber na mochila.',
    hint: 'Procure oficinas, garagens e sucata para sair do improviso.'
  },
  {
    id: 1, key: 'salvage', name: 'SUCATA', short: 'T1',
    description: 'Metal recuperado, ferramentas melhores e uma base funcional.',
    hint: 'Consiga sucata e encontre uma oficina, posto ou garagem.'
  },
  {
    id: 2, key: 'metallurgy', name: 'METALURGIA', short: 'T2',
    description: 'Minério refinado, aço e ferramentas de longa duração.',
    hint: 'Extraia ferro, construa uma fornalha e produza seu primeiro lingote.'
  },
  {
    id: 3, key: 'industrial', name: 'INDUSTRIAL', short: 'T3',
    description: 'Eletricidade, componentes e estruturas pesadas.',
    hint: 'Encontre componentes elétricos ou restaure uma instalação industrial.'
  },
  {
    id: 4, key: 'security', name: 'EMERGÊNCIA', short: 'T4',
    description: 'Equipamento profissional de polícia, bombeiros e resposta civil.',
    hint: 'Explore a delegacia ou o quartel de bombeiros e recupere equipamento profissional.'
  },
  {
    id: 5, key: 'blackridge', name: 'BLACKRIDGE', short: 'T5',
    description: 'Tecnologia de contenção e equipamento de fim de jogo.',
    hint: 'Descubra Blackridge e encontre um meio de acessar seus setores restritos.'
  }
];


const GEAR_TIER_BY_ID = {
  knife:0, stone_pickaxe:0, stone_axe:0, spear:0, bat:0,
  metal_pipe:1, crowbar:1, machete:1, repair_hammer:1,
  steel_pickaxe:2, steel_spear:2, sledgehammer:2, miner_helmet:2, utility_vest:2, geology_scanner:2,
  pistol:2, revolver:2, shotgun:2, rifle:2,
  hard_hat:3, mechanic_overalls:3, ranger_jacket:3, paramedic_jacket:3, industrial_pickaxe:3,
  hatchet:1,
  wrecking_bar:2, civilian_carbine:2,
  compact_carbine:3,
  police_baton:4, fire_axe:4, rescue_mallet:4, smg_compact:4, police_carbine:4, security_pistol:4, patrol_shotgun:4,
  police_vest:4, police_jacket:4, police_helmet:4, firefighter_coat:4, firefighter_helmet:4, firefighter_boots:4,
  blackridge_carbine:5, blackridge_smg:5, blackridge_marksman:5, containment_cutter:5, blackridge_vest:5, blackridge_helmet:5, hazmat_coat:5, respirator:5
};
Object.assign(GEAR_TIER_BY_ID, {
  hoodie:0, jeans:0, sneakers:0, daypack:0, cargo_pants:1, field_gloves:1, hiking_pack:1, rain_pants:1, insulated_gloves:1, insulated_pants:1,
  work_pants:3, industrial_gloves:3, tool_pack:3, miner_overalls:2, miner_pants:2, miner_gloves:2, mining_pack:2,
  police_pants:4, tactical_boots:4, patrol_gloves:4, patrol_pack:4, firefighter_pants:4, rescue_gloves:4, rescue_pack:4,
  paramedic_pants:4, medical_gloves:4, medical_pack:4,
  blackridge_pants:5, blackridge_gloves:5, blackridge_boots:5, blackridge_pack:5
});

class ProgressionSystem {
  constructor(inventory, structures, building) {
    this.inventory = inventory;
    this.structures = structures;
    this.building = building;
    this.tier = 0;
    this.everSeen = new Set();
    this.unlocked = new Set(['improvised']);
    this.onTierUp = null;
    this.lastTier = 0;
  }

  observe() {
    for (const entry of this.inventory.entries || []) if (entry.qty > 0) this.everSeen.add(entry.id);
    this.evaluate();
  }

  discoveredType(type) {
    return this.structures.structures.some(s => s.type === type && s.discovered);
  }

  built(type) {
    return Boolean(this.building?.objects?.some(o => o.type === type && o.health > 0));
  }

  hasSeen(...ids) { return ids.some(id => this.everSeen.has(id)); }

  evaluate() {
    let next = 0;
    const salvage = this.hasSeen('scrap_metal', 'crowbar', 'metal_pipe', 'garage_parts', 'weapon_parts', 'hatchet') ||
      this.discoveredType('workshop') || this.discoveredType('gas_station') || this.discoveredType('parking');
    if (salvage) next = 1;

    const metallurgy = this.hasSeen('iron_ingot', 'steel_plate', 'steel_pickaxe') ||
      (this.hasSeen('iron_ore') && this.built('furnace'));
    if (metallurgy) next = 2;

    const industrial = this.hasSeen('circuit_parts', 'copper_ingot', 'expedition_frame', 'precision_parts', 'compact_carbine', 'nickel_ingot', 'industrial_alloy', 'industrial_pickaxe') ||
      this.discoveredType('substation') || this.discoveredType('warehouse') || this.discoveredType('railyard');
    if (industrial && next >= 2) next = 3;

    const emergency = this.discoveredType('police') || this.discoveredType('firestation') ||
      this.hasSeen('police_vest', 'police_jacket', 'police_helmet', 'firefighter_coat', 'firefighter_helmet', 'smg_compact', 'police_carbine', 'security_pistol', 'patrol_shotgun');
    if (emergency && next >= 2) next = Math.max(next, 4);

    const blackridge = this.discoveredType('blackridge') &&
      this.hasSeen('blackridge_keycard', 'blackridge_vest', 'blackridge_helmet', 'blackridge_carbine', 'blackridge_smg', 'blackridge_marksman');
    if (blackridge) next = 5;

    if (next > this.tier) {
      const old = this.tier;
      this.tier = next;
      for (let i = 0; i <= next; i++) this.unlocked.add(PROGRESSION_TIERS[i].key);
      this.onTierUp?.(PROGRESSION_TIERS[next], PROGRESSION_TIERS[old]);
    }
  }

  canCraft(recipe) {
    return (recipe.tier ?? 0) <= this.tier;
  }

  current() { return PROGRESSION_TIERS[this.tier]; }
  next() { return PROGRESSION_TIERS[Math.min(PROGRESSION_TIERS.length - 1, this.tier + 1)]; }
  labelFor(recipe) {
    const tier = PROGRESSION_TIERS[recipe.tier ?? 0] || PROGRESSION_TIERS[0];
    return `${tier.short} · ${tier.name}`;
  }

  gearTier(id) { return GEAR_TIER_BY_ID[id] ?? null; }
  gearLabel(id) {
    const n = this.gearTier(id);
    if (n == null) return null;
    const tier = PROGRESSION_TIERS[n] || PROGRESSION_TIERS[0];
    return `${tier.short} · ${tier.name}`;
  }

  summary() {
    const current = this.current();
    const next = this.tier < PROGRESSION_TIERS.length - 1 ? this.next() : null;
    return {
      tier: this.tier,
      current,
      next,
      hint: next ? next.hint : 'Você alcançou o topo tecnológico conhecido de Last County.'
    };
  }
}
