// Stage 27 — Weapons & Combat Arsenal foundation.
// All firearm-related crafting here is intentionally abstract videogame logic.
// Recipes use fictional generic parts; there are no real-world construction steps.

const WEAPON_CLASS_DEFS = {
  melee_light: { label:'CORPO A CORPO LEVE', handling:5, maintenance:.65 },
  melee_medium:{ label:'CORPO A CORPO', handling:4, maintenance:.8 },
  melee_heavy: { label:'CORPO A CORPO PESADO', handling:2, maintenance:1.15 },
  sidearm:     { label:'ARMA CURTA', handling:5, maintenance:.8 },
  revolver:    { label:'REVÓLVER', handling:3, maintenance:.85 },
  shotgun:     { label:'ESPINGARDA', handling:2, maintenance:1.05 },
  carbine:     { label:'CARABINA', handling:4, maintenance:.95 },
  rifle:       { label:'RIFLE', handling:2, maintenance:1.1 },
  smg:         { label:'SUBMETRALHADORA', handling:4, maintenance:1.0 },
  blackridge:  { label:'BLACKRIDGE', handling:4, maintenance:1.15 }
};

const WEAPON_MOD_DEFS = {
  optic_module: {
    slot:'optic', label:'MÓDULO ÓPTICO',
    compatible:['sidearm','carbine','rifle','smg','blackridge'],
    effects:{ aimedSpreadMult:.72, spreadMult:.94 }
  },
  stability_module: {
    slot:'stability', label:'ESTABILIZADOR',
    compatible:['sidearm','revolver','shotgun','carbine','rifle','smg','blackridge'],
    effects:{ recoilMult:.80, spreadMult:.95 }
  },
  handling_module: {
    slot:'handling', label:'KIT DE MANEJO',
    compatible:['sidearm','revolver','shotgun','carbine','rifle','smg','blackridge'],
    effects:{ reloadMult:.90, fireRateMult:.94 }
  }
};

Object.assign(ITEM_DEFS, {
  weapon_parts: { name:'Peças de armamento', category:'component', weight:.32, stackable:true, maxStack:30, color:'#687174', description:'Conjunto abstrato de peças reaproveitáveis usado pelo sistema de arsenal do jogo.' },
  spring_parts: { name:'Mecanismos recuperados', category:'component', weight:.18, stackable:true, maxStack:24, color:'#777e80', description:'Peças mecânicas genéricas recuperadas de equipamentos danificados.' },
  precision_parts: { name:'Componentes de precisão', category:'component', weight:.22, stackable:true, maxStack:18, color:'#78888c', description:'Componentes raros para equipamentos avançados e manutenção especializada.' },
  damaged_weapon_frame: { name:'Equipamento danificado', category:'component', weight:1.05, stackable:true, maxStack:6, color:'#555d60', description:'Estrutura inutilizada de equipamento profissional. Serve apenas como componente abstrato de recuperação no jogo.' },
  maintenance_kit: { name:'Kit de manutenção', category:'component', weight:.42, stackable:true, maxStack:8, color:'#8b795d', description:'Kit abstrato de manutenção. Recupera parte da condição de armas e ferramentas.' },
  optic_module: { name:'Módulo óptico', category:'component', weight:.28, stackable:true, maxStack:4, color:'#60747b', weaponMod:'optic_module', description:'Acessório abstrato de jogo para melhorar precisão ao mirar.' },
  stability_module: { name:'Módulo estabilizador', category:'component', weight:.34, stackable:true, maxStack:4, color:'#59656a', weaponMod:'stability_module', description:'Acessório abstrato que reduz recuo visual e dispersão.' },
  handling_module: { name:'Kit de manejo', category:'component', weight:.26, stackable:true, maxStack:4, color:'#6f6757', weaponMod:'handling_module', description:'Acessório abstrato que melhora o manejo e a velocidade de recarga.' },
  ammo_carbine: { name:'Munição de carabina', category:'ammo', weight:.016, stackable:true, maxStack:72, color:'#7c8467', description:'Categoria fictícia de munição intermediária usada por carabinas do jogo.' },

  hatchet: { name:'Machadinha de campo', category:'tool', weight:1.15, stackable:false, maxDurability:170, color:'#755742', toolType:'axe',
    description:'Ferramenta curta e rápida. Boa para exploração e combate próximo.',
    arsenal:{ class:'melee_light', tier:1, rarity:'comum' },
    melee:{ damage:28, range:38, windup:.10, active:.06, recover:.16, stamina:5, knockback:2.8, targets:1, noise:100, impact:'metal', arc:[8,46], stagger:1.05 } },
  wrecking_bar: { name:'Barra de demolição', category:'tool', weight:2.35, stackable:false, maxDurability:250, color:'#677276', toolType:'crowbar',
    description:'Ferramenta industrial pesada. Ótima para abrir espaço, desmontar e controlar grupos.',
    arsenal:{ class:'melee_medium', tier:2, rarity:'incomum' },
    melee:{ damage:35, range:48, windup:.15, active:.07, recover:.21, stamina:8, knockback:5.1, targets:2, noise:145, impact:'metal', arc:[5,49], stagger:1.45 } },
  rescue_mallet: { name:'Marreta de resgate', category:'tool', weight:3.45, stackable:false, maxDurability:290, color:'#7a5f4b', toolType:'hammer',
    description:'Equipamento profissional de resgate. Pesado, lento e excelente para interromper avanço.',
    arsenal:{ class:'melee_heavy', tier:4, rarity:'profissional' },
    melee:{ damage:48, range:47, windup:.24, active:.09, recover:.31, stamina:14, knockback:7.2, targets:2, noise:175, impact:'metal', arc:[2,50], stagger:1.9 } },

  civilian_carbine: { name:'Carabina civil', category:'firearm', weight:2.55, stackable:false, maxDurability:255, color:'#665c4d',
    description:'Carabina simples de uso civil no universo do jogo. Boa ponte entre armas curtas e equipamento profissional.',
    arsenal:{ class:'carbine', tier:2, rarity:'incomum' },
    gun:{ damage:39, range:500, spread:.034, magazine:14, reload:1.9, fireRate:.27, recoil:2.4, noise:760, ammo:'ammo_carbine', sound:'carbine', pellets:1 } },
  compact_carbine: { name:'Carabina compacta', category:'firearm', weight:2.35, stackable:false, maxDurability:275, color:'#596064',
    description:'Arma compacta de segurança recuperada. Melhor manejo em áreas urbanas.',
    arsenal:{ class:'carbine', tier:3, rarity:'rara' },
    gun:{ damage:42, range:520, spread:.029, magazine:18, reload:1.72, fireRate:.20, recoil:2.2, noise:780, ammo:'ammo_carbine', sound:'carbine', pellets:1 } },
  security_pistol: { name:'Pistola de patrulha', category:'firearm', weight:1.05, stackable:false, maxDurability:285, color:'#50585c',
    description:'Equipamento profissional de segurança. Leve, confiável e raro fora da delegacia.',
    arsenal:{ class:'sidearm', tier:4, rarity:'profissional' },
    gun:{ damage:38, range:430, spread:.037, magazine:15, reload:1.35, fireRate:.24, recoil:2.15, noise:730, ammo:'ammo_pistol', sound:'pistol', pellets:1 } },
  patrol_shotgun: { name:'Espingarda de serviço', category:'firearm', weight:3.35, stackable:false, maxDurability:285, color:'#5d5a52',
    description:'Equipamento profissional de curto alcance. Muito barulhento, mas excelente para abrir espaço.',
    arsenal:{ class:'shotgun', tier:4, rarity:'profissional' },
    gun:{ damage:13, range:205, spread:.23, magazine:6, reload:2.0, fireRate:.78, recoil:5.3, noise:980, ammo:'ammo_shotgun', sound:'shotgun', pellets:7 } },
  blackridge_smg: { name:'BR-C9 Compacta', category:'firearm', weight:2.45, stackable:false, maxDurability:345, color:'#435158',
    description:'Equipamento compacto de contenção Blackridge. Recompensa rara de fim de jogo.',
    arsenal:{ class:'blackridge', tier:5, rarity:'blackridge' },
    gun:{ damage:35, range:455, spread:.035, magazine:26, reload:1.55, fireRate:.095, recoil:2.0, noise:770, ammo:'ammo_pistol', sound:'smg', pellets:1, auto:true } },
  blackridge_marksman: { name:'BR-M6 Precisão', category:'firearm', weight:3.35, stackable:false, maxDurability:360, color:'#45545a',
    description:'Equipamento Blackridge de precisão. Muito raro e voltado a disparos controlados.',
    arsenal:{ class:'blackridge', tier:5, rarity:'blackridge' },
    gun:{ damage:64, range:660, spread:.012, magazine:10, reload:1.9, fireRate:.42, recoil:3.2, noise:830, ammo:'ammo_rifle', sound:'blackridge', pellets:1 } }
});

const WEAPON_META = {
  knife:{class:'melee_light',tier:0}, machete:{class:'melee_light',tier:1}, bat:{class:'melee_medium',tier:1}, metal_pipe:{class:'melee_medium',tier:1}, spear:{class:'melee_medium',tier:0},
  police_baton:{class:'melee_light',tier:4}, fire_axe:{class:'melee_heavy',tier:4}, sledgehammer:{class:'melee_heavy',tier:2}, steel_spear:{class:'melee_medium',tier:2}, crowbar:{class:'melee_medium',tier:1}, repair_hammer:{class:'melee_medium',tier:1}, stone_axe:{class:'melee_heavy',tier:0}, stone_pickaxe:{class:'melee_medium',tier:0}, steel_pickaxe:{class:'melee_medium',tier:2},
  pistol:{class:'sidearm',tier:2}, revolver:{class:'revolver',tier:2}, shotgun:{class:'shotgun',tier:2}, rifle:{class:'rifle',tier:2}, smg_compact:{class:'smg',tier:4}, police_carbine:{class:'carbine',tier:4}, blackridge_carbine:{class:'blackridge',tier:5}
};
for (const [id, meta] of Object.entries(WEAPON_META)) if (ITEM_DEFS[id]) ITEM_DEFS[id].arsenal = { ...(ITEM_DEFS[id].arsenal || {}), ...meta };

class WeaponArsenalSystem {
  constructor(inventory) {
    this.inventory = inventory;
    this.mods = new Map(); // weapon id -> {slot: modId}; inventory currently equips by id
  }

  meta(id) { return ITEM_DEFS[id]?.arsenal || null; }
  classDef(id) { return WEAPON_CLASS_DEFS[this.meta(id)?.class] || null; }
  classLabel(id) { return this.classDef(id)?.label || 'EQUIPAMENTO'; }
  modsFor(id) { return { ...(this.mods.get(id) || {}) }; }

  condition01(id) {
    const d = this.inventory.durability(id);
    return d?.max ? Math.max(0, Math.min(1, d.current / d.max)) : 1;
  }

  install(modId, weaponId) {
    const mod = WEAPON_MOD_DEFS[modId];
    const def = ITEM_DEFS[weaponId];
    const cls = def?.arsenal?.class;
    if (!mod || !def?.gun) return { ok:false, reason:'Selecione uma arma de fogo na hotbar' };
    if (!mod.compatible.includes(cls)) return { ok:false, reason:'Módulo incompatível com esta classe' };
    if (this.inventory.count(modId) <= 0) return { ok:false, reason:'Módulo não encontrado' };
    const slots = this.mods.get(weaponId) || {};
    const old = slots[mod.slot];
    if (old) this.inventory.add(old, 1);
    this.inventory.remove(modId, 1);
    slots[mod.slot] = modId;
    this.mods.set(weaponId, slots);
    return { ok:true, replaced:old, slot:mod.slot };
  }

  removeMod(weaponId, slot) {
    const slots = this.mods.get(weaponId);
    const modId = slots?.[slot];
    if (!modId) return { ok:false, reason:'Slot vazio' };
    if (!this.inventory.canAdd(modId, 1)) return { ok:false, reason:'Sem espaço na mochila' };
    this.inventory.add(modId, 1);
    delete slots[slot];
    this.mods.set(weaponId, slots);
    return { ok:true, modId };
  }

  movementScale(id, aiming=false) {
    const cls = this.meta(id)?.class;
    const base = { melee_heavy:.91, melee_medium:.97, melee_light:1, sidearm:1, revolver:.99, shotgun:.94, carbine:.97, rifle:.93, smg:.98, blackridge:.97 }[cls] || 1;
    return base * (aiming && ITEM_DEFS[id]?.gun ? .90 : 1);
  }

  effects(id) {
    const out = { spreadMult:1, aimedSpreadMult:1, recoilMult:1, reloadMult:1, fireRateMult:1 };
    const slots = this.mods.get(id) || {};
    for (const modId of Object.values(slots)) {
      const e = WEAPON_MOD_DEFS[modId]?.effects || {};
      for (const key of Object.keys(out)) if (Number.isFinite(e[key])) out[key] *= e[key];
    }
    return out;
  }

  effectiveGun(id, base, aiming=false) {
    const c = this.condition01(id);
    const worn = c < .65 ? (1 - c / .65) : 0;
    const fx = this.effects(id);
    return {
      ...base,
      spread: base.spread * (1 + worn * .45) * fx.spreadMult * (aiming ? fx.aimedSpreadMult : 1),
      recoil: base.recoil * (1 + worn * .18) * fx.recoilMult,
      reload: base.reload * (1 + worn * .22) * fx.reloadMult,
      fireRate: base.fireRate * (1 + worn * .12) * fx.fireRateMult
    };
  }

  maintain(id) {
    const def = ITEM_DEFS[id];
    if (!def?.maxDurability || (!def.gun && !def.melee)) return { ok:false, reason:'Este item não usa manutenção de arsenal' };
    const d = this.inventory.durability(id);
    if (!d) return { ok:false, reason:'Equipamento não encontrado' };
    if (d.current >= d.max * .98) return { ok:false, reason:'Condição já está ótima' };
    if (this.inventory.count('maintenance_kit') <= 0) return { ok:false, reason:'Precisa de um Kit de manutenção' };
    this.inventory.remove('maintenance_kit', 1);
    const gain = Math.ceil(d.max * .38);
    const result = this.inventory.repairTool(id, gain);
    return { ok:true, restored:result.restored || 0, current:result.durability, max:d.max };
  }

  exportState() {
    return { mods:[...this.mods.entries()].map(([id, slots]) => [id, {...slots}]) };
  }
  importState(data) {
    this.mods.clear();
    for (const row of data?.mods || []) {
      if (!Array.isArray(row) || !ITEM_DEFS[row[0]]) continue;
      this.mods.set(row[0], { ...(row[1] || {}) });
    }
  }
}
