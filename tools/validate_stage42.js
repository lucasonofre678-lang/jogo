const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..'),bad=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('js/stage42_zombie_base.js'),game=read('js/game.js'),save=read('js/savegame.js'),html=read('index.html'),building=read('js/building.js');
for(const token of ['class ZombiePopulationSystem','seedRegions()','fairColumn(','spawnRegional()','startRedNight()','spawnWave()','baseIntegrity()','exportState()','importState(data)'])if(!src.includes(token))bad.push(`sistema incompleto: ${token}`);
for(const token of ['perimeter_sensor','decoy_siren'])if(!src.includes(token)||!building.includes(token))bad.push(`defesa ausente: ${token}`);
if(!src.includes("phase:'calm'")||!src.includes("'warning'")||!src.includes("'active'")||!src.includes("'recovery'"))bad.push('estados da Noite Vermelha incompletos');
if(!src.includes('view * .58 + 7')||!src.includes('27 * CONFIG.TILE'))bad.push('regras de spawn justo ausentes');
if(!/version:42/.test(game)||!save.includes('41, 42'))bad.push('save v42 ausente');
if(!game.includes('stage42:stage42.exportState()')||!game.includes('stage42.importState(save.stage42)'))bad.push('roundtrip Stage 42 ausente');
if(!html.includes('js/stage42_zombie_base.js'))bad.push('script Stage 42 não carregado');
if(bad.length){console.error('STAGE42 FAILED');for(const x of bad)console.error('- '+x);process.exit(1);}
console.log('STAGE42 OK — população regional, atenção, migração, Noite Vermelha, defesas e save v42');
