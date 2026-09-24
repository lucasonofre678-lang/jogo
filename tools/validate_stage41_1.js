const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),bad=[];
const world=read('js/world.js'),structures=read('js/structures.js'),player=read('js/player.js'),polish=read('js/stage41_1_polish.js'),game=read('js/game.js'),html=read('index.html'),css=read('stage41-1-polish.css');
if(!world.includes('A crown touching a roof'))bad.push('regra de árvore enraizada ausente');
if(!structures.includes('cleanUnreachableNaturalLedges'))bad.push('limpeza de plataformas inacessíveis ausente');
if(!/const tx = 33/.test(player))bad.push('spawn não foi movido para o acampamento');
for(const text of ['Ponto de Evacuação 12','OpeningSequence','VOCÊ FICOU PARA TRÁS','RÁDIO DE EMERGÊNCIA'])if(!polish.includes(text))bad.push(`abertura incompleta: ${text}`);
for(const id of ['openingSequence','openingKicker','openingTitle','openingCopy','openingHint'])if(!html.includes(`id="${id}"`))bad.push(`elemento ausente: ${id}`);
if(!html.includes('js/stage41_1_polish.js')||!html.includes('stage41-1-polish.css'))bad.push('arquivos Stage 41.1 não carregados');
if(!game.includes('opening.update(rawDt)')||!game.includes('opening.start()'))bad.push('abertura não integrada ao loop');
if(!css.includes('.opening-sequence')||!css.includes('@media'))bad.push('estilo da abertura incompleto');
if(bad.length){console.error('STAGE41.1 FAILED');bad.forEach(x=>console.error('- '+x));process.exit(1);}
console.log('STAGE41.1 OK — spawn imersivo, introdução e limpeza de blocos suspensos');
