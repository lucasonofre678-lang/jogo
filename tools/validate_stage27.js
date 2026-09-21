#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const ctx = vm.createContext({ console, Map, Set, Math, JSON, Array, Object, String, Number, Boolean });
for (const f of ['config.js','weapons.js','inventory.js','building.js','progression.js','crafting.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT,'js',f),'utf8'), ctx, {filename:f});
}
vm.runInContext(`
  globalThis.__defs = ITEM_DEFS;
  globalThis.__mods = WEAPON_MOD_DEFS;
  globalThis.__classes = WEAPON_CLASS_DEFS;
  globalThis.__recipes = CRAFT_RECIPES;
  globalThis.__Inventory = Inventory;
  globalThis.__Arsenal = WeaponArsenalSystem;
`, ctx);
const defs=ctx.__defs, recipes=ctx.__recipes;
const errors=[];
const stage27Weapons=['hatchet','wrecking_bar','rescue_mallet','civilian_carbine','compact_carbine','security_pistol','patrol_shotgun','blackridge_smg','blackridge_marksman'];
const stage27Parts=['weapon_parts','spring_parts','precision_parts','damaged_weapon_frame','maintenance_kit','optic_module','stability_module','handling_module','ammo_carbine'];
for(const id of [...stage27Weapons,...stage27Parts]) if(!defs[id]) errors.push(`missing item ${id}`);
for(const id of stage27Weapons){
  const d=defs[id]; if(!d.arsenal) errors.push(`${id} missing arsenal meta`);
  if(!d.gun && !d.melee) errors.push(`${id} missing combat profile`);
  if(!fs.existsSync(path.join(ROOT,'assets/items',`${id}.png`))) errors.push(`${id} icon missing`);
  if(d.gun && !fs.existsSync(path.join(ROOT,'assets/items',`held_${id}.png`))) errors.push(`${id} held art missing`);
}
for(const id of ['hatchet','wrecking_bar','rescue_mallet']) if(!fs.existsSync(path.join(ROOT,'assets/items',`held_${id}.png`))) errors.push(`${id} held art missing`);
for(const id of ['weapon_parts','maintenance_kit','hatchet','wrecking_bar','civilian_carbine','compact_carbine','security_pistol']) if(!recipes.some(r=>r.id===id)) errors.push(`recipe missing ${id}`);
const Inventory=ctx.__Inventory, Arsenal=ctx.__Arsenal;
const inv=new Inventory(9999); inv.add('civilian_carbine',1); inv.add('optic_module',1); inv.add('maintenance_kit',1);
const arsenal=new Arsenal(inv);
const base=defs.civilian_carbine.gun;
const before=arsenal.effectiveGun('civilian_carbine',base,true);
const install=arsenal.install('optic_module','civilian_carbine');
const after=arsenal.effectiveGun('civilian_carbine',base,true);
if(!install.ok || !(after.spread < before.spread)) errors.push('optic module did not improve aimed spread');
inv.damageTool('civilian_carbine',80);
const damaged=inv.durability('civilian_carbine').current;
const maintained=arsenal.maintain('civilian_carbine');
if(!maintained.ok || !(inv.durability('civilian_carbine').current > damaged)) errors.push('maintenance did not restore condition');
const state=arsenal.exportState(); const arsenal2=new Arsenal(inv); arsenal2.importState(state);
if(!arsenal2.modsFor('civilian_carbine').optic) errors.push('arsenal save/import lost optic module');
if(errors.length){ console.error('STAGE27 FAILED'); for(const e of errors) console.error('-',e); process.exit(1); }
console.log(`Stage 27 OK: ${stage27Weapons.length} new weapons, ${stage27Parts.length} arsenal items, ${recipes.filter(r=>r.category==='ARMAS').length} arsenal recipes.`);
