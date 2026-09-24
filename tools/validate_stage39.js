// Static validation for Stage 39 assets, wiring, save compatibility and UI.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),fail=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const content=read('js/stage39_content.js'),survival=read('js/stage39_survival.js');
const html=read('index.html'),game=read('js/game.js'),save=read('js/savegame.js'),css=read('stage39-survival.css');
const itemBlock=content.match(/Object\.assign\(ITEM_DEFS,\s*\{([\s\S]*?)\n\}\);/)?.[1]||'';
const buildBlock=content.match(/Object\.assign\(BUILD_DEFS,\s*\{([\s\S]*?)\n\}\);/)?.[1]||'';
const items=[...itemBlock.matchAll(/^\s{2}([a-z_]+):\s*\{\s*name:/gm)].map(m=>m[1]);
const builds=[...buildBlock.matchAll(/^\s{2}([a-z_]+):\s*\{\s*name:/gm)].map(m=>m[1]);
if(items.length!==25)fail.push(`itens definidos: ${items.length}/25`);
if(builds.length!==15)fail.push(`construções definidas: ${builds.length}/15`);
for(const id of items)if(!fs.existsSync(path.join(root,'assets/items',`${id}.png`)))fail.push(`ícone de item ausente: ${id}`);
for(const id of builds)if(!fs.existsSync(path.join(root,'assets/build',`${id}.png`)))fail.push(`ícone de construção ausente: ${id}`);
for(const id of ['carrot','pumpkin','cabbage','onion','strawberry'])if(!new RegExp(`\\b${id}:\\{`).test(survival))fail.push(`cultura ausente: ${id}`);
for(const id of ['sustainabilityButton','baseDaysText','sustainabilityModal','stage39Consumers','stage39Rooms'])if(!html.includes(`id="${id}"`))fail.push(`elemento de UI ausente: ${id}`);
if(html.indexOf('js/stage39_content.js')>html.indexOf('js/assets.js'))fail.push('conteúdo carrega depois dos assets');
if(html.indexOf('js/stage39_survival.js')>html.indexOf('js/game.js'))fail.push('sistema sustentável carrega depois do jogo');
if(!/version:(39|40|41|42)/.test(game)||!/39/.test(save.match(/SUPPORTED\s*=\s*\[[^\]]+\]/)?.[0]||''))fail.push('save Stage 39 não está habilitado');
if(!game.includes('sustainable:sustainable.exportState()')||!game.includes('sustainable.importState(save.sustainable)'))fail.push('roundtrip sustentável ausente');
if(!css.includes('.survival-dashboard')||!css.includes('@media'))fail.push('layout responsivo ausente');
if(fail.length){console.error('STAGE39 FAILED');for(const x of fail)console.error('- '+x);process.exit(1);}
console.log(`STAGE39 OK — ${items.length} itens, ${builds.length} construções, 5 culturas, save v39`);
