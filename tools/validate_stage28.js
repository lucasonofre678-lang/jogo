#!/usr/bin/env node
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.join(__dirname,'..');
const ctx=vm.createContext({console,Map,Set,Math,JSON,Array,Object,String,Number,Boolean,Uint8Array,Int16Array});
for(const f of ['config.js','weapons.js','inventory.js','world.js','mining.js','building.js','progression.js','crafting.js']){
  vm.runInContext(fs.readFileSync(path.join(ROOT,'js',f),'utf8'),ctx,{filename:f});
}
vm.runInContext(`globalThis.__x={CONFIG,TILE,TILE_INFO,ITEM_DEFS,World,MiningSystem,Inventory,CRAFT_RECIPES,MINERAL_TILE_META,MINING_TIERS};`,ctx);
const {CONFIG,TILE,TILE_INFO,ITEM_DEFS,World,MiningSystem,Inventory,CRAFT_RECIPES,MINERAL_TILE_META,MINING_TIERS}=ctx.__x;
const errors=[];
const items=['nickel_ore','nickel_ingot','crystal_shard','blackridge_mineral','industrial_alloy','geology_scanner','industrial_pickaxe','containment_cutter'];
for(const id of items){
  if(!ITEM_DEFS[id]) errors.push(`missing item ${id}`);
  if(!fs.existsSync(path.join(ROOT,'assets/items',`${id}.png`))) errors.push(`missing icon ${id}`);
}
for(const id of ['industrial_pickaxe','containment_cutter','geology_scanner']) if(!fs.existsSync(path.join(ROOT,'assets/items',`held_${id}.png`))) errors.push(`missing held ${id}`);
for(const [id,name] of [[TILE.NICKEL_ORE,'nickel_ore'],[TILE.RICH_IRON_ORE,'rich_iron_ore'],[TILE.CRYSTAL_VEIN,'crystal_vein'],[TILE.BLACKRIDGE_MINERAL,'blackridge_mineral']]){
  if(!TILE_INFO[id]) errors.push(`missing tile info ${name}`);
  for(let v=0;v<3;v++) if(!fs.existsSync(path.join(ROOT,'assets/tiles',`${name}_${v}.png`))) errors.push(`missing tile ${name}_${v}`);
}
for(const id of ['nickel_ingot','industrial_alloy','precision_parts','geology_scanner','industrial_pickaxe','containment_cutter']) if(!CRAFT_RECIPES.some(r=>r.id===id)) errors.push(`missing recipe ${id}`);
if(ITEM_DEFS.stone_pickaxe.miningTier!==1) errors.push('stone pick tier');
if(ITEM_DEFS.steel_pickaxe.miningTier!==2) errors.push('steel pick tier');
if(ITEM_DEFS.industrial_pickaxe.miningTier!==3) errors.push('industrial pick tier');
if(ITEM_DEFS.containment_cutter.miningTier!==4) errors.push('containment cutter tier');

const counts={};
for(const seed of [17,1977,424242,999001]){
  const w=new World(seed);
  for(const t of [TILE.COAL_ORE,TILE.COPPER_ORE,TILE.IRON_ORE,TILE.QUARTZ_ORE,TILE.NICKEL_ORE,TILE.RICH_IRON_ORE,TILE.CRYSTAL_VEIN,TILE.BLACKRIDGE_MINERAL]){
    let c=0; for(const x of w.tiles) if(x===t)c++;
    counts[t]=(counts[t]||0)+c;
    if(c===0) errors.push(`seed ${seed} generated zero ${TILE_INFO[t]?.name}`);
  }
}
const inv=new Inventory(9999), w=new World(12345), mining=new MiningSystem(w,inv);
if(mining.canMine(TILE.CRYSTAL_VEIN,'stone_pickaxe').ok) errors.push('stone pick can mine crystal');
if(!mining.canMine(TILE.CRYSTAL_VEIN,'industrial_pickaxe').ok) errors.push('industrial pick cannot mine crystal');
if(mining.canMine(TILE.BLACKRIDGE_MINERAL,'industrial_pickaxe').ok) errors.push('industrial pick can mine blackridge mineral');
if(!mining.canMine(TILE.BLACKRIDGE_MINERAL,'containment_cutter').ok) errors.push('containment cutter cannot mine blackridge mineral');
let sx=100, sy=Math.min(CONFIG.WORLD_H-4,w.surface[sx]+60); w.set(sx,sy,TILE.NICKEL_ORE);
let scan=mining.scan(sx-5,sy,10);
if(!scan.ok||!scan.found) errors.push('scanner failed to find nearby ore');
const result=mining.onBroken(TILE.NICKEL_ORE,sx,sy,'steel_pickaxe');
if(!result.drops.some(d=>d.id==='nickel_ore')) errors.push('nickel yield missing');
const state=mining.exportState(), mining2=new MiningSystem(w,inv); mining2.importState(state);
if(!mining2.discovered.has('nickel_ore') || mining2.blocksMined!==mining.blocksMined) errors.push('mining save/import failed');
if(errors.length){console.error('STAGE28 FAILED'); for(const e of errors) console.error('-',e); process.exit(1);}
console.log(`Stage 28 OK: ${items.length} resource/tool items, ${Object.keys(MINERAL_TILE_META).length} mineral nodes, ${CRAFT_RECIPES.filter(r=>r.category==='MINERAÇÃO').length} mining recipes.`);
console.log('ore totals across 4 seeds:',Object.entries(counts).map(([t,c])=>`${TILE_INFO[t].name}=${c}`).join(' | '));
