const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('js/stage41_expeditions.js');
const game=read('js/game.js');
const save=read('js/savegame.js');
const html=read('index.html');
const errors=[];
const names=['Abrigo do Xerife','Quarentena Estadual Harlow','Bunker Civil Greenwater','Arsenal Subterrâneo do Condado','Cofre Tecnológico Blackridge'];
for(const name of names)if(!src.includes(name))errors.push(`expedição ausente: ${name}`);
for(let tier=1;tier<=5;tier++)if(!src.includes(`tier:${tier}`))errors.push(`nível de risco ${tier} ausente`);
for(const id of ['pistol','shotgun','civilian_carbine','police_carbine','blackridge_carbine'])if(!src.includes(`'${id}'`))errors.push(`progressão de recompensa sem ${id}`);
if(!src.includes('restoreStage41Terrain'))errors.push('migração de terreno para saves antigos ausente');
if(!/version:(?:41|42)/.test(game)||!/40, 41, 42/.test(save))errors.push('save v41+ ou compatibilidade v40 ausente');
if(!html.includes('js/stage41_expeditions.js'))errors.push('script Stage 41 não carregado no HTML');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('STAGE41 OK — 5 expedições, riscos 1–5, loot progressivo, save v41');
