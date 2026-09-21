#!/usr/bin/env node
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..');
const errors=[];
const ctx=vm.createContext({console,Map,Set,Math,JSON,Array,Object,String,Number,Boolean});
for(const f of ['config.js','weapons.js','inventory.js','crafting.js']) vm.runInContext(fs.readFileSync(path.join(ROOT,'js',f),'utf8'),ctx,{filename:f});
vm.runInContext('globalThis.__x={ITEM_DEFS,Inventory,CraftingSystem,CRAFT_RECIPES,CRAFT_CATEGORIES};',ctx);
const {ITEM_DEFS,Inventory,CraftingSystem,CRAFT_RECIPES,CRAFT_CATEGORIES}=ctx.__x;
const inv=new Inventory(9999);
inv.add('scrap_metal',20);
const build={hasAutoBenchNear:()=>true,hasFurnaceNear:()=>true,hasWorkbenchNear:()=>true,nearest:()=>({type:'campfire'})};
const crafting=new CraftingSystem(inv,build,null);
const nails=CRAFT_RECIPES.find(r=>r.id==='nails_batch');
if(!nails)errors.push('nails recipe missing');
if(crafting.maxCraftable(nails,{})<5)errors.push('maxCraftable failed');
const before=inv.count('nails');
const batch=crafting.craftMany('nails_batch',{},5);
if(!batch.ok||batch.crafted!==5||inv.count('nails')<=before)errors.push('craftMany x5 failed');
const st=crafting.materialStatus(nails);
if(!Array.isArray(st)||!st.length||!('have' in st[0])||!('need' in st[0]))errors.push('materialStatus failed');

const weaponId=Object.keys(ITEM_DEFS).find(id=>ITEM_DEFS[id]?.maxDurability&&!ITEM_DEFS[id]?.stackable);
if(!weaponId)errors.push('no nonstackable durable item found');
else{
  const added=inv.addEntryData(weaponId,1,{durability:7});
  const e=inv.entries.find(x=>x.id===weaponId&&x.durability===7);
  if(!added||!e)errors.push('addEntryData durability failed');
  else if(!inv.removeUid(e.uid))errors.push('removeUid failed');
}

const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
for(const id of ['craftSearch','craftFavoritesButton','pinnedRecipe','craftTracker','inventorySort','containerBackpackList','storeMaterialsButton']) if(!html.includes(`id="${id}"`))errors.push(`missing UI ${id}`);
const game=fs.readFileSync(path.join(ROOT,'js/game.js'),'utf8');
for(const fn of ['renderPinnedRecipe','craftIngredientHtml','storeItemInContainer','storeMaterialsInContainer','itemComparisonHtml']) if(!game.includes(`function ${fn}`))errors.push(`missing function ${fn}`);
if(!CRAFT_CATEGORIES.includes('MINERAÇÃO')||!CRAFT_CATEGORIES.includes('ARMAS'))errors.push('craft categories regressed');
if(errors.length){console.error('STAGE29 FAILED');errors.forEach(e=>console.error('-',e));process.exit(1);}
console.log(`Stage 29 OK: ${CRAFT_RECIPES.length} recipes, batch crafting, favorites/pinning/search, comparison and bidirectional container transfer.`);
