/* Stage 31 — Living County: world operations, resident memory, use-based skills,
   connected underworld and Blackridge endgame sectors. Additive over Stage 30. */
const STAGE31_SKILLS = {
  mining:{name:'MINERAÇÃO',icon:'⛏',desc:'Mais rendimento e menos desgaste ao extrair.',milestones:['Olho para veios','Golpe eficiente','Mineiro experiente','Especialista do subsolo','Mestre de extração']},
  mechanics:{name:'MECÂNICA',icon:'⚙',desc:'Reparos mais eficientes em veículos e equipamentos.',milestones:['Mãos firmes','Diagnóstico rápido','Mecânico de campo','Especialista em motores','Mestre mecânico']},
  construction:{name:'CONSTRUÇÃO',icon:'▦',desc:'Construções e reparos ficam mais eficientes.',milestones:['Improviso seguro','Medida certa','Construtor de campo','Estruturas reforçadas','Mestre construtor']},
  medicine:{name:'MEDICINA',icon:'✚',desc:'Tratamentos restauram um pouco mais.',milestones:['Primeiros cuidados','Mãos cuidadosas','Socorrista','Médico de campo','Especialista clínico']},
  stealth:{name:'FURTIVIDADE',icon:'◌',desc:'Mover-se agachado produz menos presença.',milestones:['Passo leve','Leitura de patrulha','Movimento baixo','Sombra do condado','Presença invisível']},
  scavenging:{name:'COLETA',icon:'⌁',desc:'Experiência em encontrar e transportar suprimentos.',milestones:['Separar o útil','Catador atento','Olho treinado','Especialista em recursos','Intendente']}
};
class UseSkillSystem {
  constructor(){this.rows={};for(const id of Object.keys(STAGE31_SKILLS))this.rows[id]={xp:0,level:0,uses:0};this.onLevel=null;this.stealthClock=0;}
  threshold(level){return [0,20,55,110,190,300][Math.max(0,Math.min(5,level))]||300;}
  add(id,amount=1,reason=''){const row=this.rows[id];if(!row)return;row.xp=Math.min(300,row.xp+amount);row.uses++;const old=row.level;while(row.level<5&&row.xp>=this.threshold(row.level+1))row.level++;if(row.level>old)this.onLevel?.(id,row.level,reason);}
  level(id){return this.rows[id]?.level||0;}
  bonus(id,step=.03){return this.level(id)*step;}
  update(dt){
    if(!player?.crouching||anyModalOpen?.())return;this.stealthClock+=dt;
    if(this.stealthClock<8)return;this.stealthClock=0;
    const close=danger.enemies.some(e=>e.alive&&Math.hypot(e.x-player.x,e.y-player.y)<260&&!['chase','attack'].includes(e.state));
    if(close)this.add('stealth',1,'movimento próximo a uma ameaça');
  }
  exportState(){return {version:1,rows:JSON.parse(JSON.stringify(this.rows))};}
  importState(data){if(!data?.rows)return false;for(const id of Object.keys(this.rows)){const r=data.rows[id];if(r)this.rows[id]={xp:Math.max(0,Math.min(300,r.xp||0)),level:Math.max(0,Math.min(5,r.level||0)),uses:r.uses||0};}return true;}
}

const STAGE31_EVENT_TYPES = [
  {id:'migration',title:'HORDA MIGRATÓRIA',tone:'danger',desc:'Uma massa de infectados está cruzando uma região do condado.',stages:['LOCALIZAR A ROTA','REDUZIR A PRESSÃO','CONFIRMAR PASSAGEM'],reward:{ammo_pistol:8,county_scrip:12}},
  {id:'blackout',title:'BLACKOUT REGIONAL',tone:'warn',desc:'A rede caiu e sinais de emergência surgiram perto de uma subestação.',stages:['ALCANÇAR O SETOR','PROTEGER O CIRCUITO','RELIGAR A REDE'],reward:{wire:4,battery:1,circuit_parts:1}},
  {id:'help',title:'PEDIDO DE AJUDA',tone:'info',desc:'Uma transmissão curta aponta um sobrevivente isolado.',stages:['RASTREAR O SINAL','TORNAR O LOCAL SEGURO','GUIAR O SOBREVIVENTE'],reward:{bandage:2,county_scrip:10}},
  {id:'accident',title:'ACIDENTE NA ESTRADA',tone:'warn',desc:'Ruído de impacto e uma coluna de fumaça marcam a rodovia.',stages:['CHEGAR AO ACIDENTE','VASCULHAR OS ARREDORES','RECUPERAR SUPRIMENTOS'],reward:{scrap_metal:4,garage_parts:1}},
  {id:'fire',title:'INCÊNDIO ESTRUTURAL',tone:'danger',desc:'Fumaça escura sobe de uma construção abandonada.',stages:['LOCALIZAR O FOCO','LIMPAR O ACESSO','ISOLAR O SETOR'],reward:{cloth:3,fire_axe:1}},
  {id:'vehicle',title:'VEÍCULO ABANDONADO',tone:'info',desc:'Um veículo intacto demais para ter sido esquecido está parado fora da rota.',stages:['ENCONTRAR O VEÍCULO','VERIFICAR A ÁREA','ABRIR O COMPARTIMENTO'],reward:{fuel_can:1,battery:1}},
  {id:'roadblock',title:'BLOQUEIO DE ESTRADA',tone:'warn',desc:'Uma barricada improvisada interrompe a passagem e esconde um depósito.',stages:['LOCALIZAR O BLOQUEIO','LIMPAR A ROTA','MARCAR CAMINHO SEGURO'],reward:{nails:6,wood:4}},
  {id:'generator',title:'GERADOR ATIVO',tone:'info',desc:'Um prédio vazio continua iluminado. O barulho está atraindo atenção.',stages:['ALCANÇAR O PRÉDIO','PROTEGER O GERADOR','ESTABILIZAR A ENERGIA'],reward:{battery:1,electronics:1,county_scrip:8}}
];
class LivingWorldDirector {
  constructor(){this.active=[];this.history=[];this.serial=1;this.timer=150;this.lastMinute=worldMinutes;this.blackoutAreas=[];}
  pickStructure(type){
    const mapping={blackout:['substation','maintenance'],help:['house','motel','school'],fire:['warehouse','apartments','market'],generator:['hospital','metro','workshop']};
    const types=mapping[type]||['gas_station','market','farm','workshop','railyard'];
    const pool=structures.structures.filter(s=>types.includes(s.type));return pool[Math.floor(Math.random()*pool.length)]||structures.structures[Math.floor(Math.random()*structures.structures.length)];
  }
  spawn(typeId=null){
    const def=STAGE31_EVENT_TYPES.find(e=>e.id===typeId)||STAGE31_EVENT_TYPES[Math.floor(Math.random()*STAGE31_EVENT_TYPES.length)];
    const s=this.pickStructure(def.id);if(!s)return null;const tx=Math.round((s.x+s.endX)*.5),ty=s.underground?Math.round(((s.yTop||s.groundY-7)+(s.yBottom||s.groundY+1))/2):world.groundY(tx)-1;
    const op={id:`county-${this.serial++}`,type:def.id,title:def.title,desc:def.desc,tone:def.tone,stages:[...def.stages],stage:0,status:'active',tileX:tx,tileY:ty,target:s.name,created:worldMinutes,expires:worldMinutes+720,reward:{...def.reward},hold:0,spawned:false};
    this.active.push(op);this.makeScene(op,s);this.history.unshift({title:op.title,target:op.target,result:'ATIVO',minute:worldMinutes});this.history=this.history.slice(0,16);showToast(`${op.title} · ${s.name}`,def.tone);worldState.record('stage31_event_started',{id:op.id,type:op.type,target:op.target});return op;
  }
  makeScene(op,s){
    const x=op.tileX,y=world.groundY(op.tileX)-1;
    const prop=(asset,dx=0,scale=.85)=>structures.addProp(asset,x+dx,y,{scale});
    if(op.type==='migration'){for(let i=0;i<6;i++){const e=danger.makeEnemy(i%3===0?'runner':'wanderer',x+5+i*2,danger.salt++,null);e.homeX=x*CONFIG.TILE;e.state='wander';danger.enemies.push(e);}op.spawned=true;}
    if(op.type==='blackout'){this.blackoutAreas=[...places.poweredAreas];places.poweredAreas.clear();structures.addPoint('fuse_panel',x,y-1,{name:'Relé regional',state:'off',area:s.name});}
    if(op.type==='help'){prop('bedroll',0);prop('burning_barrel',2,.7);structures.addContainer('Mochila do sobrevivente',x+1,y-1,'camp',structures.loot('camp',x*73,3,{guaranteed:true}));}
    if(op.type==='accident'){prop('wrecked_car',0,1);prop('traffic_cone',-2,.7);structures.addContainer('Carga do acidente',x+2,y-1,'garage',structures.loot('garage',x*79,4,{guaranteed:true}));}
    if(op.type==='fire'){prop('burning_barrel',0,1);prop('rubble_pile',2,.8);structures.addContainer('Armário resistente ao calor',x+3,y-1,'firestation',structures.loot('firestation',x*83,4));}
    if(op.type==='vehicle'){prop('wrecked_car',0,1);structures.addContainer('Compartimento do veículo',x+1,y-1,'garage',structures.loot('garage',x*89,5,{guaranteed:true}),{rare:true});}
    if(op.type==='roadblock'){prop('road_barrier',-1,.9);prop('road_barrier',2,.9);prop('wrecked_car',5,.9);structures.addContainer('Reserva do bloqueio',x+4,y-1,'police',structures.loot('police',x*97,4));}
    if(op.type==='generator'){places.powerArea(s.name);structures.addPoint('generator_switch',x,y-1,{name:'Gerador ainda ativo',state:'on',area:s.name});structures.addContainer('Reserva do gerador',x+2,y-1,'industrial',structures.loot('industrial',x*101,4));}
  }
  threat(op){const x=op.tileX*CONFIG.TILE,y=op.tileY*CONFIG.TILE;return danger.enemies.filter(e=>e.alive&&Math.hypot(e.x-x,e.y-y)<430).length;}
  finish(op){op.status='completed';for(const [id,q] of Object.entries(op.reward))baseCamp.addStock(id,q);campaign.baseMorale=Math.min(100,campaign.baseMorale+5);if(op.type==='blackout')for(const a of this.blackoutAreas)places.powerArea(a);if(op.type==='help'){const n=society.npcs.find(n=>!n.recruited);if(n){n.relation=Math.min(100,n.relation+6);n.memories.push('Você respondeu a um pedido de ajuda no condado.');}}
    const h=this.history.find(h=>h.title===op.title&&h.result==='ATIVO');if(h)h.result='CONCLUÍDO';showToast(`${op.title} concluído · recompensas enviadas à base`,'good');worldState.record('stage31_event_completed',{id:op.id,type:op.type,target:op.target});
  }
  update(dt){
    useSkills.update(dt);this.timer-=dt;if(this.timer<=0&&this.active.filter(o=>o.status==='active').length<2){this.timer=230+Math.random()*170;this.spawn();}
    const c=player.center();for(const op of this.active){if(op.status!=='active')continue;if(worldMinutes>op.expires){op.status='failed';if(op.type==='blackout')for(const a of this.blackoutAreas)places.powerArea(a);continue;}
      const dist=Math.hypot(c.x-op.tileX*CONFIG.TILE,c.y-op.tileY*CONFIG.TILE);
      if(op.stage===0&&dist<260){op.stage=1;showToast(`${op.title} · ${op.stages[1]}`,'info');}
      else if(op.stage===1&&dist<440&&this.threat(op)===0){op.stage=2;op.hold=0;showToast(`${op.title} · ${op.stages[2]}`,'good');}
      else if(op.stage===2&&dist<230){op.hold+=dt;if(op.hold>=4)this.finish(op);}
    }
  }
  exportState(){return {version:1,active:this.active.map(o=>({...o,reward:{...o.reward}})),history:this.history.map(h=>({...h})),serial:this.serial,timer:this.timer,blackoutAreas:[...this.blackoutAreas]};}
  importState(d){if(!d)return false;this.active=(d.active||[]).map(o=>({...o,reward:{...(o.reward||{})}}));this.history=(d.history||[]).map(h=>({...h}));this.serial=d.serial||1;this.timer=Number.isFinite(d.timer)?d.timer:160;this.blackoutAreas=[...(d.blackoutAreas||[])];return true;}
}

class ResidentLifeSystem {
  constructor(){this.lastDay=-1;this.clock=0;this.bonds={};this.requests=[];this.seeded=false;}
  seed(){if(this.seeded)return;this.seeded=true;for(const n of society.npcs){n.needs={food:68,rest:70,safety:62,purpose:65,...n.needs};n.routine=n.routine||'Reconhecendo o condado';n.smallTalk=n.smallTalk||0;n.memories=n.memories||[];}for(const a of society.npcs)for(const b of society.npcs)if(a.id<b.id)this.bonds[`${a.id}:${b.id}`]=Math.round(35+society.rand((a.id+b.id).length*97)*30);}
  day(){return Math.floor(worldMinutes/1440)+1;}
  routineFor(n,hour){if(!n.recruited)return n.profession;if(hour<7)return'Dormindo';if(hour<9)return'Café e organização';if(hour<12)return baseCamp.jobFor(n).label;if(hour<14)return'Pausa na base';if(hour<18)return baseCamp.jobFor(n).label;if(hour<21)return'Conversa junto ao abrigo';return'Descansando';}
  makeRequest(n){const pools={mara:[['Reserva de alimentos',{canned_food:2}],['Madeira seca',{wood:4}]],lena:[['Material limpo',{cloth:3}],['Água para a enfermaria',{water_bottle:2}]],eli:[['Peças para manutenção',{scrap_metal:3}],['Componentes elétricos',{wire:3}]],jonah:[['Itens de troca',{county_scrip:8}],['Suprimento de viagem',{canned_food:2}]]};const p=(pools[n.id]||pools.mara)[this.day()%2];if(this.requests.some(r=>r.npcId===n.id&&r.status==='active'))return;this.requests.push({id:`resident-${n.id}-${this.day()}`,npcId:n.id,title:p[0],requirements:{...p[1]},status:'active',createdDay:this.day()});}
  fulfill(id){const r=this.requests.find(x=>x.id===id),n=r&&society.get(r.npcId);if(!r||!n||r.status!=='active')return false;for(const [item,q] of Object.entries(r.requirements))if(inventory.count(item)<q)return false;for(const [item,q] of Object.entries(r.requirements))inventory.remove(item,q);r.status='completed';n.relation=Math.min(100,n.relation+5);n.needs.purpose=Math.min(100,n.needs.purpose+18);n.needs.food=Math.min(100,n.needs.food+10);n.memories.push(`Você ajudou com “${r.title}” no dia ${this.day()}.`);n.memories=n.memories.slice(-8);showToast(`${n.name} vai lembrar disso.`,'good');return true;}
  update(dt){this.seed();this.clock+=dt;if(this.clock<4)return;this.clock=0;const day=this.day(),hour=(worldMinutes%1440)/60;for(const n of society.npcs){n.routine=this.routineFor(n,hour);if(n.recruited){n.needs.food=Math.max(0,n.needs.food-.18);n.needs.rest=Math.max(0,n.needs.rest-.12);n.needs.safety=Math.min(100,n.needs.safety+(baseCamp.has('guard_post')?.12:-.08));n.needs.purpose=Math.min(100,n.needs.purpose+(baseCamp.jobFor(n).id!=='idle'?.1:-.1));n.morale=Math.max(10,Math.min(100,(n.needs.food+n.needs.rest+n.needs.safety+n.needs.purpose)/4));}}
    if(day!==this.lastDay){this.lastDay=day;for(const n of society.baseResidents())if((day+n.id.length)%2===0)this.makeRequest(n);for(const key of Object.keys(this.bonds))this.bonds[key]=Math.max(0,Math.min(100,this.bonds[key]+(Math.random()>.55?1:-1)));}}
  dialogue(n){if(!n)return'';const low=Object.entries(n.needs||{}).sort((a,b)=>a[1]-b[1])[0];const lines={food:'As reservas estão ficando curtas.',rest:'Hoje eu preciso diminuir o ritmo.',safety:'Não gosto do silêncio fora das luzes da base.',purpose:'Me arrume alguma coisa útil para fazer.'};const memory=n.memories?.at(-1);return memory&&n.relation>65?`${lines[low?.[0]]||''} Eu ainda lembro: ${memory}`:lines[low?.[0]]||'';}
  exportState(){return {version:1,lastDay:this.lastDay,bonds:{...this.bonds},requests:this.requests.map(r=>({...r,requirements:{...r.requirements}})),npcs:society.npcs.map(n=>({id:n.id,needs:{...n.needs},routine:n.routine,memories:[...(n.memories||[])]}))};}
  importState(d){this.seed();if(!d)return false;this.lastDay=d.lastDay??-1;this.bonds={...(d.bonds||{})};this.requests=(d.requests||[]).map(r=>({...r,requirements:{...(r.requirements||{})}}));for(const row of d.npcs||[]){const n=society.get(row.id);if(n){n.needs={...n.needs,...row.needs};n.routine=row.routine||n.routine;n.memories=[...(row.memories||n.memories||[])].slice(-8);}}return true;}
}

function buildStage31Underworld(){
  if(structures.structures.some(s=>s.stage31Zone))return;
  const zones=[
    {name:'Coletor Norte',type:'drainage',x0:220,x1:310,y:132,wall:TILE.WET_STONE,floor:TILE.OLD_CONCRETE,loot:'scraps'},
    {name:'Linha de Serviço Oeste',type:'metro',x0:310,x1:410,y:139,wall:TILE.CONCRETE,floor:TILE.INDUSTRIAL_FLOOR,loot:'industrial'},
    {name:'Arquivo Subterrâneo',type:'maintenance',x0:520,x1:620,y:140,wall:TILE.TECH_WALL,floor:TILE.INDUSTRIAL_FLOOR,loot:'industrial'},
    {name:'Cavernas de Sal',type:'mine',x0:620,x1:720,y:150,wall:TILE.DARK_STONE,floor:TILE.GRAVEL,loot:'mining'},
    {name:'Atalho dos Mineiros',type:'mine',x0:720,x1:806,y:154,wall:TILE.SLATE,floor:TILE.GRAVEL,loot:'mining'}
  ];
  for(const z of zones){world.digTunnel(z.x0,z.x1,z.y,4,z.wall,z.floor);for(let x=z.x0+8;x<z.x1-5;x+=18){structures.addProp(z.type==='mine'?'mine_support':'pipe_run',x,z.y-1,{scale:1,behind:true});if((x-z.x0)%36===8)structures.addContainer(`${z.name} · reserva`,x,z.y-2,z.loot,structures.loot(z.loot,x*131,3));}world.undergroundZones.push({name:z.name,kind:z.type,x1:z.x0,x2:z.x1,y1:z.y-5,y2:z.y+2});const s=structures.register(z.name,z.type,z.x0,z.x1-z.x0,z.y,'underground',{underground:true,yTop:z.y-5,yBottom:z.y+2});s.stage31Zone=true;s.secretRooms=[{id:`${z.type}-${z.x0}`,kind:'atalho',revealed:false}];}
  // Vertical shortcuts make the layers a connected second world.
  for(const [x,y0,y1] of [[306,132,139],[410,108,139],[520,115,140],[620,140,150],[720,145,154],[806,148,154]])for(let y=Math.min(y0,y1)-1;y<=Math.max(y0,y1);y++){world.set(x,y,TILE.LADDER);world.setWall(x,y,TILE.DARK_STONE);}
}
function buildStage31Blackridge(){
  if(structures.structures.some(s=>s.stage31Blackridge))return;const sectors=[
    {name:'Blackridge · Portaria Tática',x0:856,x1:878,y:136,loot:'police',door:'blackridge_keycard'},
    {name:'Blackridge · Pesquisa Aplicada',x0:878,x1:900,y:136,loot:'blackridge',door:'blackridge_keycard'},
    {name:'Blackridge · Manutenção Profunda',x0:900,x1:922,y:136,loot:'industrial',door:'maintenance_key'},
    {name:'Blackridge · Contenção Delta',x0:878,x1:906,y:151,loot:'blackridge',door:'containment_cutter'},
    {name:'Blackridge · Núcleo de Segurança',x0:906,x1:940,y:151,loot:'blackridge',door:'blackridge_keycard'}
  ];
  for(const [i,z] of sectors.entries()){world.digTunnel(z.x0,z.x1,z.y,6,TILE.TECH_WALL,TILE.INDUSTRIAL_FLOOR);for(let x=z.x0+4;x<z.x1-2;x+=8){structures.addProp(i===2?'tool_cabinet':i===3?'containment_pod':'computer_terminal',x,z.y-1,{scale:.9});structures.lamp?.((x+.5)*CONFIG.TILE,(z.y-3)*CONFIG.TILE,{radius:145,strength:.7,mode:'power',fixture:'fluoro'});}structures.addDoor(z.x0+1,z.y-1,{name:`Acesso ${z.name}`,locked:true,keyItem:z.door,forceTool:'containment_cutter',integrity:10,area:z.name});structures.addContainer(`${z.name} · cofre`,z.x1-5,z.y-2,z.loot,structures.loot(z.loot,7000+i*47,6,{guaranteed:true}),{rare:true});structures.addPoint(i===3?'containment_console':'terminal',z.x0+6,z.y-2,{name:`Terminal ${z.name}`,state:'off',needsPower:true,area:z.name,grants:i===1?'archive_lead':null});world.undergroundZones.push({name:z.name,kind:'blackridge',x1:z.x0,x2:z.x1,y1:z.y-7,y2:z.y+2});const s=structures.register(z.name,'blackridge',z.x0,z.x1-z.x0,z.y,'underground',{underground:true,yTop:z.y-7,yBottom:z.y+2});s.stage31Blackridge=true;s.dangerLevel=5;s.eventPool=['alarm','containment_fail','partial_power','sector_wake'];s.secretRooms=[{id:`br-secret-${i}`,kind:i===4?'rota_alternativa':'arquivo_selado',revealed:false}];}
  for(let y=136;y<=151;y++){world.set(876,y,TILE.LADDER);world.setWall(876,y,TILE.TECH_WALL);world.set(924,y,TILE.LADDER);world.setWall(924,y,TILE.TECH_WALL);}structures.addPoint('fuse_panel',916,134,{name:'Rede auxiliar Blackridge',state:'off',area:'Blackridge · Manutenção Profunda'});
}

const useSkills=new UseSkillSystem(),residentLife=new ResidentLifeSystem(),livingWorld=new LivingWorldDirector();
useSkills.onLevel=(id,lvl)=>showToast(`${STAGE31_SKILLS[id].name} · nível ${lvl}: ${STAGE31_SKILLS[id].milestones[lvl-1]}`,'good');
buildStage31Underworld();buildStage31Blackridge();worldState.prepare();
// Hooks connect progress to actions the game already validates.
const oldMineBroken=mining.onBroken.bind(mining);mining.onBroken=function(...a){const r=oldMineBroken(...a);useSkills.add('mining',r.meta?.rich?3:1,'extração');if(r.drops?.length&&Math.random()<useSkills.bonus('mining',.025))r.drops[0].qty++;return r;};
const oldCraft=crafting.craftMany.bind(crafting);crafting.craftMany=function(...a){const r=oldCraft(...a);if(r.ok)useSkills.add('construction',Math.min(4,r.crafted||1),'fabricação');return r;};
const oldPlace=building.place.bind(building);building.place=function(...a){const r=oldPlace(...a);if(r.ok)useSkills.add('construction',3,'construção');return r;};
const oldRepair=building.repair.bind(building);building.repair=function(...a){const r=oldRepair(...a);if(r.ok)useSkills.add('construction',2,'reparo');return r;};
const oldVehicleRepair=vehicles.repair.bind(vehicles);vehicles.repair=function(...a){const v=a[0],before=v?.condition||0,r=oldVehicleRepair(...a);if(r.ok){useSkills.add('mechanics',4,'reparo de veículo');if(v)v.condition=Math.min(100,v.condition+useSkills.level('mechanics')*.5);}return r;};
for(const method of ['bandage','disinfect','medicine'])if(typeof injuries[method]==='function'){const old=injuries[method].bind(injuries);injuries[method]=function(...a){const before=survival.health,r=old(...a);if(r){useSkills.add('medicine',3,'tratamento');survival.health=Math.min(survival.maxHealth,survival.health+useSkills.level('medicine')*.35);}return r;};}
const oldContainerOpen=openNearbyContainer;openNearbyContainer=function(...a){const before=structures.nearestContainer(player);const was=before?.discovered;const r=oldContainerOpen(...a);if(before&&!was)useSkills.add('scavenging',2,'novo depósito');return r;};
const oldEventsUpdate=events.update.bind(events);events.update=function(dt){oldEventsUpdate(dt);livingWorld.update(dt);residentLife.update(dt);};
const oldDialogue=society.dialogueFor.bind(society);society.dialogueFor=function(n){const extra=residentLife.dialogue(n);return `${oldDialogue(n)}${extra?' '+extra:''}`;};

// Persistent state is nested, so Stage 28 saves remain valid.
const stage31Export=exportGameState;exportGameState=function(){const data=stage31Export();data.stage31={skills:useSkills.exportState(),residents:residentLife.exportState(),worldEvents:livingWorld.exportState()};return data;};
const stage31Load=loadGameState;loadGameState=function(data=null,silent=false){const source=data||SaveGameSystem.peek();const ok=stage31Load(data,silent);if(ok&&source?.stage31){useSkills.importState(source.stage31.skills);residentLife.importState(source.stage31.residents);livingWorld.importState(source.stage31.worldEvents);}return ok;};
// game.js restores the base save before this additive module is evaluated.
// Import the Stage 31 payload once here as well, so reloads keep progression.
if(typeof bootSave!=='undefined'&&bootSave?.stage31){useSkills.importState(bootSave.stage31.skills);residentLife.importState(bootSave.stage31.residents);livingWorld.importState(bootSave.stage31.worldEvents);}

const Stage31UI={
  tab:'events',open:false,
  mount(){
    const host=document.querySelector?.('.game-wrap'),actions=document.querySelector?.('.actions');
    if(!host||!actions)return;
    const btn=document.createElement('button');btn.id='stage31Button';btn.className='act';btn.type='button';btn.title='Condado vivo [O]';btn.innerHTML='<span class="stage31-nav-icon">LC</span><kbd>O</kbd>';actions.prepend(btn);
    const modal=document.createElement('div');modal.id='stage31Modal';modal.className='modal hidden';modal.innerHTML=`<section class="stage31-panel"><header><div><span>LAST COUNTY / REGISTRO VIVO</span><h2>O CONDADO CONTINUA.</h2></div><button id="stage31Close" class="square-button">×</button></header><nav>${[['events','OPERAÇÕES'],['people','MORADORES'],['skills','PROFISSÕES'],['under','SUBTERRÂNEO'],['blackridge','BLACKRIDGE']].map(([id,n])=>`<button data-stage31-tab="${id}">${n}</button>`).join('')}</nav><div id="stage31Body"></div></section>`;document.querySelector('.game-wrap')?.appendChild(modal);
    btn.addEventListener('click',()=>this.toggle());modal.querySelector('#stage31Close').addEventListener('click',()=>this.toggle(false));modal.addEventListener('mousedown',e=>{if(e.target===modal)this.toggle(false);});modal.querySelectorAll('[data-stage31-tab]').forEach(b=>b.addEventListener('click',()=>{this.tab=b.dataset.stage31Tab;this.render();}));
    document.addEventListener('keydown',e=>{if(e.target?.matches?.('input,textarea,select'))return;if(e.key.toLowerCase()==='o'){e.preventDefault();this.toggle();}});this.render();
  },toggle(force){this.open=typeof force==='boolean'?force:!this.open;document.getElementById('stage31Modal').classList.toggle('hidden',!this.open);if(this.open)this.render();},
  distance(tx,ty){const c=player.center();return Math.round(Math.hypot(c.x-tx*CONFIG.TILE,c.y-ty*CONFIG.TILE)/CONFIG.TILE);},
  render(){const body=document.getElementById('stage31Body');if(!body)return;document.querySelectorAll('[data-stage31-tab]').forEach(b=>b.classList.toggle('active',b.dataset.stage31Tab===this.tab));
    if(this.tab==='events'){const ops=livingWorld.active.filter(o=>o.status==='active');body.innerHTML=`<div class="stage31-heading"><span>TRANSMISSÕES ATIVAS</span><strong>${ops.length} operação(ões)</strong></div><div class="stage31-list">${ops.length?ops.map(o=>`<article class="stage31-op ${o.tone}"><div class="stage31-index">${String(o.stage+1).padStart(2,'0')}</div><div><span>${o.title}</span><h3>${o.stages[o.stage]}</h3><p>${o.desc}</p><small>${o.target} · ${this.distance(o.tileX,o.tileY)} blocos · expira no dia ${Math.floor(o.expires/1440)+1}</small><i><b style="width:${(o.stage+(o.hold||0)/4)/3*100}%"></b></i></div></article>`).join(''):'<p class="stage31-empty">O rádio está quieto. O próximo evento surgirá enquanto você explora.</p>'}</div><details><summary>Histórico do condado</summary>${livingWorld.history.map(h=>`<p>${h.result} · ${h.title} · ${h.target}</p>`).join('')}</details>`;}
    if(this.tab==='people'){residentLife.seed();const residents=society.npcs.filter(n=>n.recruited||society.known.has(n.id));body.innerHTML=`<div class="stage31-heading"><span>MEMÓRIA DA BASE</span><strong>${society.baseResidents().length} na base</strong></div><div class="stage31-residents">${residents.map(n=>{const req=residentLife.requests.find(r=>r.npcId===n.id&&r.status==='active');return `<article><header><div><span>${n.profession}</span><h3>${n.name}</h3></div><b>${Math.round(n.morale)}%</b></header><p>${n.personality}</p><strong>${n.routine||'Sobrevivendo'}</strong><div class="need-bars">${Object.entries(n.needs||{}).map(([k,v])=>`<label>${{food:'COMIDA',rest:'DESCANSO',safety:'SEGURANÇA',purpose:'PROPÓSITO'}[k]}<i><b style="width:${v}%"></b></i></label>`).join('')}</div>${req?`<button data-resident-request="${req.id}">${req.title} · ${Object.entries(req.requirements).map(([id,q])=>`${ITEM_DEFS[id]?.name||id} ×${q}`).join(' / ')}</button>`:''}<small>${n.memories?.at(-1)||'Nenhuma lembrança marcante ainda.'}</small></article>`;}).join('')}</div><div class="stage31-bonds"><h3>RELAÇÕES NA BASE</h3>${Object.entries(residentLife.bonds).map(([k,v])=>`<p>${k.split(':').map(id=>society.get(id)?.name||id).join(' ↔ ')} <strong>${v}%</strong></p>`).join('')}</div>`;body.querySelectorAll('[data-resident-request]').forEach(b=>b.addEventListener('click',()=>{residentLife.fulfill(b.dataset.residentRequest);this.render();renderInventory();}));}
    if(this.tab==='skills'){body.innerHTML=`<div class="stage31-heading"><span>APRENDER FAZENDO</span><strong>Sem árvore complicada</strong></div><div class="stage31-skills">${Object.entries(STAGE31_SKILLS).map(([id,d])=>{const r=useSkills.rows[id],from=useSkills.threshold(r.level),to=useSkills.threshold(Math.min(5,r.level+1)),pct=r.level===5?100:(r.xp-from)/(to-from)*100;return `<article><b>${d.icon}</b><div><span>NÍVEL ${r.level} / 5</span><h3>${d.name}</h3><p>${d.desc}</p><i><b style="width:${pct}%"></b></i><small>${r.level?d.milestones[r.level-1]:'Ainda sem experiência'} · ${r.uses} ações</small></div></article>`;}).join('')}</div>`;}
    if(this.tab==='under'){const rows=structures.structures.filter(s=>s.stage31Zone);body.innerHTML=`<div class="stage31-heading"><span>O SEGUNDO MUNDO</span><strong>${rows.length} novos setores conectados</strong></div><div class="stage31-mapline">${rows.map((s,i)=>`<article><b>${String(i+1).padStart(2,'0')}</b><h3>${s.name}</h3><p>${s.type.toUpperCase()} · ${s.discovered?'DESCOBERTO':'NÃO MAPEADO'}</p><small>${this.distance((s.x+s.endX)/2,s.groundY)} blocos</small></article>`).join('')}</div><p class="stage31-note">Metrô, drenagem, arquivo técnico, cavernas e mina agora formam rotas com escadas e atalhos verticais. Salas raras aparecem como segredos do mapa e persistem no mundo.</p>`;}
    if(this.tab==='blackridge'){const rows=structures.structures.filter(s=>s.stage31Blackridge),found=rows.filter(s=>s.discovered).length;body.innerHTML=`<div class="stage31-blackridge"><span>PROTOCOLO BLACKRIDGE / ACESSO RESTRITO</span><h2>${campaign.blackridgeResolved?'OPERAÇÃO ENCERRADA':found?`${found}/${rows.length} SETORES MAPEADOS`:'SINAL SUBTERRÂNEO DETECTADO'}</h2><p>O complexo final agora possui portaria, pesquisa, manutenção, contenção e núcleo de segurança. Credenciais, energia, ferramentas e rotas alternativas abrem caminhos diferentes.</p><div>${rows.map((s,i)=>`<article class="${s.discovered?'found':''}"><b>BR-${i+1}</b><strong>${s.name.replace('Blackridge · ','')}</strong><small>${s.discovered?'MAPEADO':i===0?'COORDENADAS PARCIAIS':'BLOQUEADO'}</small></article>`).join('')}</div></div>`;}
  }
};
Stage31UI.mount();
