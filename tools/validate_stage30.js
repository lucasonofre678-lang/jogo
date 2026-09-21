#!/usr/bin/env node
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const errors=[];
const ctx=vm.createContext({console,Map,Set,Math,JSON,Array,Object,String,Number,Boolean});
for(const f of ['config.js','inventory.js']) vm.runInContext(fs.readFileSync(path.join(ROOT,'js',f),'utf8'),ctx,{filename:f});
vm.runInContext('globalThis.__x={ITEM_DEFS,Inventory};',ctx);
const {ITEM_DEFS,Inventory}=ctx.__x;
const required=['hoodie','cargo_pants','jeans','sneakers','field_gloves','daypack','hiking_pack','police_pants','tactical_boots','patrol_gloves','patrol_pack','firefighter_pants','rescue_gloves','rescue_pack','paramedic_pants','medical_gloves','medical_pack','work_pants','industrial_gloves','tool_pack','miner_overalls','miner_pants','miner_gloves','mining_pack','rain_pants','insulated_gloves','insulated_pants','blackridge_pants','blackridge_gloves','blackridge_boots','blackridge_pack','clothing_patch_kit'];
for(const id of required) if(!ITEM_DEFS[id]) errors.push(`missing item ${id}`);
const slots=new Set(Object.values(ITEM_DEFS).filter(d=>d?.category==='clothing').map(d=>d.clothingSlot));
for(const slot of ['head','body','hands','legs','feet','pack']) if(!slots.has(slot))errors.push(`missing clothing slot ${slot}`);
for(const [id,d] of Object.entries(ITEM_DEFS)) if(d?.category==='clothing' && (!d.maxDurability || d.maxDurability<1)) errors.push(`clothing durability missing ${id}`);
const inv=new Inventory(28); inv.setBonusWeight(12); if(inv.capacity()!==40)errors.push('pack capacity API failed');
const game=fs.readFileSync(path.join(ROOT,'js/game.js'),'utf8');
for(const fn of ['clothingStats','syncEquipmentCapacity','repairWornClothing','damageWornClothing']) if(!game.includes(`function ${fn}`)) errors.push(`missing ${fn}`);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
for(const id of ['handsClothingText','legsClothingText','packClothingText']) if(!html.includes(`id="${id}"`)) errors.push(`missing UI ${id}`);
const structures=fs.readFileSync(path.join(ROOT,'js/structures.js'),'utf8');
for(const id of ['police_pants','firefighter_pants','miner_overalls','blackridge_pack','medical_pack']) if(!structures.includes(id))errors.push(`loot integration missing ${id}`);
const crafting=fs.readFileSync(path.join(ROOT,'js/crafting.js'),'utf8');
for(const id of ['clothing_patch_kit','daypack','hiking_pack','mining_pack']) if(!crafting.includes(`id:'${id}'`)&&!crafting.includes(`id: "${id}"`))errors.push(`crafting missing ${id}`);
for(const id of required.filter(x=>x!=='clothing_patch_kit')){
  if(!fs.existsSync(path.join(ROOT,'assets','items',`${id}.png`)))errors.push(`missing icon ${id}`);
  if(!fs.existsSync(path.join(ROOT,'assets','sprites',`player_${id}.png`)))errors.push(`missing overlay ${id}`);
}
if(!fs.existsSync(path.join(ROOT,'assets','items','clothing_patch_kit.png')))errors.push('missing patch kit icon');
if(errors.length){console.error('STAGE30 FAILED');errors.forEach(e=>console.error('-',e));process.exit(1);}
const clothes=Object.values(ITEM_DEFS).filter(d=>d?.category==='clothing');
console.log(`Stage 30 OK: ${required.length-1} new wearables, ${clothes.length} total clothing pieces, 6 equipment slots, pack capacity, condition/repair and contextual loot.`);
