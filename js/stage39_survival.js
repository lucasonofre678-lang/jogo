// Stage 39 — camada integrada de água, produção de alimento, cômodos e mundo vivo.

Object.assign(CROP_DEFS, {
  carrot:{ id:'carrot',name:'Cenoura',seed:'seed_carrot',item:'carrot',growHours:34,yield:[3,6],seedReturn:[1,3],thirst:.8,coldFloor:-1,heatCeiling:32,color:'#6f8a4a',flower:'#c18448',description:'Rápida e resistente.' },
  pumpkin:{ id:'pumpkin',name:'Abóbora',seed:'seed_pumpkin',item:'pumpkin',growHours:82,yield:[2,4],seedReturn:[1,2],thirst:1.45,coldFloor:7,heatCeiling:38,color:'#66814b',flower:'#c58b40',description:'Lenta, pesada e muito nutritiva.' },
  cabbage:{ id:'cabbage',name:'Repolho',seed:'seed_cabbage',item:'cabbage',growHours:56,yield:[2,5],seedReturn:[1,2],thirst:1.05,coldFloor:0,heatCeiling:31,color:'#78945d',flower:'#a8b678',description:'Boa cultura para clima fresco.' },
  onion:{ id:'onion',name:'Cebola',seed:'seed_onion',item:'onion',growHours:48,yield:[3,6],seedReturn:[1,3],thirst:.75,coldFloor:-2,heatCeiling:34,color:'#758b50',flower:'#d0c6a0',description:'Durável na despensa.' },
  strawberry:{ id:'strawberry',name:'Morango',seed:'seed_strawberry',item:'strawberry',growHours:42,yield:[4,8],seedReturn:[1,2],thirst:1.4,coldFloor:5,heatCeiling:33,color:'#5e854c',flower:'#b84f55',description:'Rende rápido, mas a fruta estraga depressa.' }
});

CRAFT_RECIPES.push(
  { id:'vegetable_preserve',name:'Conserva de vegetais',category:'COZINHA',output:{id:'vegetable_preserve',qty:2},cost:{glass_jar:2,carrot:2,cabbage:1,onion:1},kitchen:true,description:'Transforma uma colheita variada em alimento durável.' },
  { id:'expedition_meal',name:'Refeição de expedição',category:'COZINHA',output:{id:'expedition_meal',qty:2},cost:{dried_meat:1,baked_potato:1,vegetable_preserve:1},kitchen:true,description:'Comida compacta para jornadas longas.' },
  { id:'herbal_tea',name:'Chá de ervas',category:'COZINHA',output:{id:'herbal_tea',qty:1},cost:{dried_herbs:1,water_bottle:1},cook:true,description:'Bebida quente preparada com ervas secas.' },
  { id:'pipe_batch',name:'Recuperar canos',category:'CONSTRUÇÃO',output:{id:'pipe',qty:3},cost:{scrap_metal:3},bench:true,description:'Prepara trechos de encanamento para a base.' },
  { id:'valve',name:'Montar válvula',category:'CONSTRUÇÃO',output:{id:'valve',qty:1},cost:{scrap_metal:2,wire:1},bench:true,description:'Controle simples para reservatórios.' },
  { id:'water_filter',name:'Montar filtro de água',category:'CONSTRUÇÃO',output:{id:'water_filter',qty:1},cost:{cloth:2,coal:2,scrap_metal:1},bench:true,description:'Filtro para a rede de abastecimento.' },
  { id:'sprinkler_head',name:'Montar irrigadores',category:'CONSTRUÇÃO',output:{id:'sprinkler_head',qty:2},cost:{scrap_metal:2,pipe:1},bench:true,description:'Bicos para irrigação automática.' },
  { id:'fuse_batch',name:'Montar fusíveis',category:'ELÉTRICA',output:{id:'fuse',qty:4},cost:{wire:2,copper_ingot:1},bench:true,description:'Proteção básica para circuitos da base.' },
  { id:'motion_sensor',name:'Montar sensor de presença',category:'ELÉTRICA',output:{id:'motion_sensor',qty:1},cost:{circuit_parts:1,wire:2,crystal_shard:1},bench:true,description:'Controla iluminação automática.' },
  { id:'power_timer',name:'Montar temporizador',category:'ELÉTRICA',output:{id:'power_timer',qty:1},cost:{circuit_parts:1,wire:2},bench:true,description:'Automação simples da rede.' },
  { id:'solar_cell',name:'Recuperar célula solar',category:'ELÉTRICA',output:{id:'solar_cell',qty:2},cost:{circuit_parts:1,copper_ingot:1,quartz:1},bench:true,description:'Recupera uma célula utilizável de peças técnicas.' },
  { id:'pump_parts',name:'Restaurar peças de bomba',category:'ELÉTRICA',output:{id:'pump_parts',qty:1},cost:{garage_parts:1,pipe:2,wire:1},bench:true,description:'Conjunto mecânico para bombeamento.' },
  { id:'grow_lamp',name:'Restaurar lâmpada de cultivo',category:'ELÉTRICA',output:{id:'grow_lamp',qty:1},cost:{circuit_parts:1,wire:2,quartz:1},bench:true,description:'Luz eficiente para estufas.' }
);

class SustainableSurvivalSystem {
  constructor({ world, building, structures, inventory, farming, food, power, baseCamp, society, weather, getWorldMinutes }) {
    Object.assign(this,{world,building,structures,inventory,farming,food,power,baseCamp,society,weather,getWorldMinutes});
    this.lastMinutes=null;
    this.lastRegrowthDay=-1;
    this.worldEnriched=false;
    this.overlay=false;
    this.onNotice=null;
    this.lastWaterNoticeDay=-1;
  }

  objects(type){return this.building.objects.filter(o=>o.type===type&&o.health>0);}
  reservoirs(){return this.objects('water_reservoir');}
  pumps(){return this.objects('electric_pump');}
  sprinklers(){return this.objects('sprinkler');}

  prepareWater(o){
    if(o.waterCapacity==null)o.waterCapacity=o.type==='water_reservoir'?80:12;
    if(o.water==null)o.water=0;
    return o;
  }

  ensureContainers(){
    for(const o of this.building.objects){
      if(!['pantry','cold_room','seed_storage'].includes(o.type)||o.containerId!=null)continue;
      const cold=o.type==='cold_room';
      const c={id:this.structures.nextContainerId++,name:o.type==='pantry'?`Despensa #${o.id}`:o.type==='cold_room'?`Câmara fria #${o.id}`:`Sementes #${o.id}`,x:o.tileX*CONFIG.TILE+4,y:(o.tileY-Math.max(0,o.height-1))*CONFIG.TILE+5,width:o.width*CONFIG.TILE-8,height:o.height*CONFIG.TILE-8,category:o.type==='seed_storage'?'farm':'kitchen',loot:[],discovered:true,builtObjectId:o.id,coldStorage:cold,powered:false};
      this.structures.containers.push(c);o.containerId=c.id;
    }
    for(const o of this.objects('cold_room')){
      const c=this.structures.containers.find(v=>v.builtObjectId===o.id);
      if(c){c.coldStorage=true;c.powered=Boolean(o.powered);}
    }
  }

  enrichWorld(){
    if(this.worldEnriched)return;
    let added=0;
    for(let x=9;x<CONFIG.WORLD_W-9;x+=7){
      const y=this.world.surface[x]-1,region=this.world.region(x);
      if(this.world.get(x,y)!==TILE.AIR||!this.world.isSolid(x,y+1))continue;
      const r=this.world.rand(x*1741+39);
      if(r<region.bushes*.34){this.world.set(x,y,TILE.BERRY_BUSH);added++;}
      else if(r<region.bushes*.34+region.flowers*.42){this.world.set(x,y,TILE.DRY_FLOWERS);added++;}
      else if(r<region.bushes*.34+region.flowers*.42+region.tallGrass*.48){this.world.set(x,y,TILE.TALL_GRASS);added++;}
    }
    // A atualização também precisa existir no ciclo de exploração: sementes
    // aparecem em locais rurais/comerciais e componentes avançados em áreas
    // técnicas. Cada container é enriquecido apenas uma vez e continua salvo.
    const seeds=['seed_carrot','seed_pumpkin','seed_cabbage','seed_onion','seed_strawberry'];
    const tech=['fuse','solar_cell','pump_parts','motion_sensor','power_timer','power_controller'];
    for(const c of this.structures.containers){
      if(c.stage39Seeded)continue;
      const key=`${c.name||''} ${c.category||''}`.toLowerCase();
      const pool=/(farm|fazenda|mercado|market|estufa|horta)/.test(key)?seeds:
        /(substation|maintenance|industrial|workshop|warehouse|blackridge|metro)/.test(key)?tech:null;
      if(!pool)continue;
      const rolls=pool===seeds?2:1;
      for(let i=0;i<rolls;i++){
        const id=pool[Math.floor(this.world.rand(c.id*419+i*83+39)*pool.length)%pool.length];
        const row=(c.loot||[]).find(v=>v.id===id);
        if(row)row.qty+=1;else(c.loot||(c.loot=[])).push({id,qty:1});
      }
      c.stage39Seeded=true;
    }
    this.worldEnriched=true;
    return added;
  }

  regrow(day){
    if(day===this.lastRegrowthDay)return 0;
    this.lastRegrowthDay=day;
    let added=0;
    for(let i=0;i<28;i++){
      const x=6+Math.floor(this.world.rand(day*911+i*131)*Math.max(1,CONFIG.WORLD_W-12));
      const y=this.world.surface[x]-1;
      if(this.world.get(x,y)!==TILE.AIR||!this.world.isSolid(x,y+1))continue;
      const region=this.world.region(x),r=this.world.rand(day*313+x*17+i);
      if(r<region.flowers*.25)this.world.set(x,y,TILE.DRY_FLOWERS);
      else if(r<region.tallGrass*.5)this.world.set(x,y,TILE.TALL_GRASS);
      else if(r<region.bushes*.16)this.world.set(x,y,TILE.BERRY_BUSH);
      else continue;
      added++;
    }
    return added;
  }

  update(dt){
    const minutes=this.getWorldMinutes();
    if(this.lastMinutes==null)this.lastMinutes=minutes;
    const elapsed=Math.max(0,minutes-this.lastMinutes);
    this.lastMinutes=minutes;
    this.ensureContainers();
    this.enrichWorld();
    const day=Math.floor(minutes/1440)+1;
    this.regrow(day);
    if(elapsed<=0)return;

    const hours=Math.min(24,elapsed/60),rain=this.weather.rainIntensity||0;
    const gutters=this.objects('roof_gutter').length;
    for(const r of this.reservoirs()){
      this.prepareWater(r);
      if(rain>0&&!this.world.isIndoors(r.tileX,r.tileY))r.water=Math.min(r.waterCapacity,r.water+hours*rain*(3.2+gutters*.35));
    }
    const reserves=this.reservoirs();
    for(const p of this.pumps()){
      if(!p.powered||!reserves.length)continue;
      const target=reserves.slice().sort((a,b)=>(a.water||0)-(b.water||0))[0];
      this.prepareWater(target);target.water=Math.min(target.waterCapacity,target.water+hours*4.5);
    }
    for(const s of this.sprinklers()){
      const source=reserves.find(r=>{this.prepareWater(r);return r.water>.2&&Math.abs(r.tileX-s.tileX)<=12;});
      if(!source)continue;
      for(const raw of this.farming.plots()){
        if(Math.abs(raw.tileX-s.tileX)>5||Math.abs(raw.tileY-s.tileY)>4)continue;
        const plot=this.farming.prepare(raw);if(plot.water>=72)continue;
        const dose=Math.min(30,source.water*2.2);plot.water=Math.min(100,plot.water+dose);source.water=Math.max(0,source.water-dose/2.2);
      }
    }
    for(const lamp of this.objects('grow_light_station')){
      if(!lamp.powered)continue;
      for(const plot of this.farming.plots())if(Math.abs(plot.tileX-lamp.tileX)<=4&&Math.abs(plot.tileY-lamp.tileY)<=3)plot.boost=Math.max(plot.boost||0,18);
    }
  }

  foodUnits(){
    const value=row=>(ITEM_DEFS[row.id]?.hunger||0)*(row.qty||0);
    const baseStorage=this.structures.containers.filter(c=>c.builtObjectId!=null);
    return this.inventory.entries.reduce((n,r)=>n+value(r),0)+this.baseCamp.stockEntries().reduce((n,r)=>n+value(r),0)+baseStorage.reduce((n,c)=>n+(c.loot||[]).reduce((s,r)=>s+value(r),0),0);
  }

  foodDays(){const people=Math.max(1,this.baseCamp.residents().length+1);return this.foodUnits()/(people*120);}
  waterStored(){return this.reservoirs().reduce((n,r)=>n+(this.prepareWater(r).water||0),0)+this.objects('rain_barrel').reduce((n,r)=>n+(r.water||0),0);}

  roomSummary(){
    const has=t=>this.building.objects.some(o=>o.type===t&&o.health>0);
    return [
      {id:'shelter',label:'Abrigo',online:this.building.objects.filter(o=>['wall','plank_wall','brick_wall','painted_wall','panel_wall'].includes(o.type)).length>=6&&this.building.objects.some(o=>String(o.type).startsWith('roof'))},
      {id:'kitchen',label:'Cozinha',online:has('kitchen_station')&&(has('stove')||has('campfire'))},
      {id:'pantry',label:'Despensa',online:has('pantry')||has('icebox')||has('cold_room')},
      {id:'water',label:'Água',online:has('water_reservoir')&&(has('electric_pump')||has('rain_barrel'))},
      {id:'power',label:'Sala elétrica',online:has('distribution_box')&&(has('generator')||has('solar_array'))},
      {id:'greenhouse',label:'Estufa',online:has('greenhouse_frame')&&has('garden_plot')},
      {id:'workshop',label:'Oficina',online:has('workbench')||has('auto_bench')},
      {id:'infirmary',label:'Enfermaria',online:has('medical_station')}
    ];
  }

  report(){
    const farm=this.farming.summary(),power=this.power.report(),rooms=this.roomSummary();
    return {foodDays:this.foodDays(),water:this.waterStored(),farm,power,rooms,comfort:Math.round(rooms.filter(r=>r.online).length/rooms.length*100),residents:this.baseCamp.residents().length};
  }

  interact(object){
    if(!object)return {ok:false};
    if(['distribution_box','battery_bank','solar_array','electric_pump','motion_floodlight','grow_light_station','cold_room'].includes(object.type))return {ok:true,openPanel:true};
    if(object.type==='water_reservoir'){
      this.prepareWater(object);
      if(this.inventory.count('empty_bottle')<1)return {ok:true,message:`Reservatório: ${object.water.toFixed(0)}/${object.waterCapacity} · precisa de garrafa vazia`,tone:'warn'};
      if(object.water<1)return {ok:true,message:'Reservatório vazio',tone:'warn'};
      object.water-=1;this.inventory.remove('empty_bottle',1);this.inventory.add('water_bottle',1);return {ok:true,message:`Água coletada · reserva ${object.water.toFixed(0)}/${object.waterCapacity}`,tone:'good',inventory:true};
    }
    if(object.type==='compost_bin'){
      const have=this.inventory.count('spoiled_food');
      if(have<2)return {ok:true,message:'A composteira precisa de 2 comidas estragadas',tone:'warn'};
      this.inventory.remove('spoiled_food',2);this.inventory.add('fertilizer',1);return {ok:true,message:'Composto produzido',tone:'good',inventory:true};
    }
    if(['pantry','seed_storage'].includes(object.type))return {ok:true,containerId:object.containerId};
    return {ok:false};
  }

  draw(ctx,cameraX,cameraY){
    for(const o of this.building.objects){
      if(!BUILD_DEFS[o.type]?.stage39)continue;
      const x=o.tileX*CONFIG.TILE-cameraX,y=o.tileY*CONFIG.TILE-cameraY,w=o.width*CONFIG.TILE;
      if(x<-140||x>ctx.canvas.width+140)continue;
      const on=o.powered!==false;
      ctx.save();ctx.lineWidth=2;
      if(o.type==='solar_array'){ctx.fillStyle='#395762';ctx.fillRect(x+2,y-28,w-4,28);ctx.strokeStyle='#7fa0a5';ctx.strokeRect(x+2,y-28,w-4,28);for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x+i*w/4,y-28);ctx.lineTo(x+i*w/4,y);ctx.stroke();}}
      else if(o.type==='battery_bank'){ctx.fillStyle='#465456';ctx.fillRect(x+3,y+8,w-6,22);ctx.fillStyle='#1f292b';ctx.fillRect(x+8,y+13,w-16,8);ctx.fillStyle='#77a172';ctx.fillRect(x+8,y+13,(w-16)*Math.min(1,(o.charge||0)/(o.capacity||18)),8);}
      else if(o.type==='distribution_box'){ctx.fillStyle='#596467';ctx.fillRect(x+5,y+4,22,26);ctx.fillStyle=on?'#85a06d':'#9b665b';ctx.fillRect(x+10,y+9,4,4);ctx.fillStyle='#c1a86a';ctx.fillRect(x+18,y+9,4,4);}
      else if(o.type==='water_reservoir'){ctx.fillStyle='#465e66';ctx.fillRect(x+3,y-28,w-6,58);ctx.fillStyle='#6e8990';ctx.fillRect(x+6,y-25,w-12,52);const p=Math.min(1,(o.water||0)/(o.waterCapacity||80));ctx.fillStyle='rgba(78,139,164,.58)';ctx.fillRect(x+7,y+26-50*p,w-14,50*p);}
      else if(o.type==='electric_pump'){ctx.fillStyle='#4e6265';ctx.fillRect(x+3,y+11,w-6,19);ctx.fillStyle=o.powered?'#83a274':'#8e5b55';ctx.fillRect(x+9,y+16,8,8);ctx.strokeStyle='#75888b';ctx.beginPath();ctx.arc(x+39,y+20,10,0,Math.PI*2);ctx.stroke();}
      else if(o.type==='sprinkler'){ctx.strokeStyle='#6f8585';ctx.beginPath();ctx.moveTo(x+16,y+29);ctx.lineTo(x+16,y+8);ctx.moveTo(x+7,y+9);ctx.lineTo(x+25,y+9);ctx.stroke();ctx.fillStyle='#7aa0a4';ctx.fillRect(x+13,y+5,6,6);}
      else if(o.type==='compost_bin'){ctx.fillStyle='#5c5039';ctx.fillRect(x+3,y+9,26,21);ctx.fillStyle='#7d714c';ctx.fillRect(x+1,y+7,30,5);ctx.fillStyle='#54643e';ctx.fillRect(x+7,y+13,18,4);}
      else if(['pantry','seed_storage'].includes(o.type)){ctx.fillStyle='#6d5942';ctx.fillRect(x+3,y-(o.height-1)*CONFIG.TILE+4,w-6,o.height*CONFIG.TILE-8);ctx.strokeStyle='#947a57';ctx.strokeRect(x+6,y-(o.height-1)*CONFIG.TILE+8,w-12,o.height*CONFIG.TILE-16);}
      else if(o.type==='cold_room'){ctx.fillStyle='#586b6e';ctx.fillRect(x+2,y-28,w-4,58);ctx.fillStyle='#334044';ctx.fillRect(x+12,y-19,26,45);ctx.fillStyle=o.powered?'#87a77c':'#8e5b55';ctx.fillRect(x+w-16,y-20,6,6);}
      else if(o.type==='motion_floodlight'){ctx.strokeStyle='#596164';ctx.beginPath();ctx.moveTo(x+16,y+30);ctx.lineTo(x+16,y-28);ctx.stroke();ctx.fillStyle=o.powered?'#e1cc8c':'#5e5e58';ctx.fillRect(x+7,y-34,19,9);}
      else if(o.type==='grow_light_station'){ctx.strokeStyle='#626d70';ctx.beginPath();ctx.moveTo(x+5,y+6);ctx.lineTo(x+w-5,y+6);ctx.stroke();ctx.fillStyle=o.powered?'#b393b9':'#615966';ctx.fillRect(x+9,y+9,w-18,5);}
      else if(o.type==='support_pillar'){ctx.fillStyle='#72543b';ctx.fillRect(x+11,y-64,10,94);ctx.fillStyle='#987250';ctx.fillRect(x+9,y-64,14,6);}
      else if(o.type==='roof_gutter'){ctx.strokeStyle='#697476';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+2,y+2);ctx.lineTo(x+w-3,y+2);ctx.lineTo(x+w-3,y+24);ctx.stroke();}
      ctx.restore();
    }
    if(this.overlay)this.drawNetwork(ctx,cameraX,cameraY);
  }

  drawNetwork(ctx,cameraX,cameraY){
    const nodes=this.power.nodes();if(!nodes.length)return;
    ctx.save();ctx.setLineDash([7,5]);ctx.lineWidth=2;
    for(const c of this.power.consumers()){
      const cc=this.building.center(c),nearest=nodes.slice().sort((a,b)=>Math.hypot(this.building.center(a).x-cc.x,this.building.center(a).y-cc.y)-Math.hypot(this.building.center(b).x-cc.x,this.building.center(b).y-cc.y))[0];
      if(!nearest)continue;const nc=this.building.center(nearest);ctx.strokeStyle=c.powered?'rgba(135,190,132,.72)':'rgba(194,92,78,.7)';ctx.beginPath();ctx.moveTo(nc.x-cameraX,nc.y-cameraY);ctx.lineTo(cc.x-cameraX,cc.y-cameraY);ctx.stroke();
    }
    ctx.setLineDash([]);for(const n of nodes){const c=this.building.center(n);ctx.fillStyle='#c9ab67';ctx.beginPath();ctx.arc(c.x-cameraX,c.y-cameraY,5,0,Math.PI*2);ctx.fill();}ctx.restore();
  }

  exportState(){return {version:1,lastMinutes:this.lastMinutes,lastRegrowthDay:this.lastRegrowthDay,worldEnriched:this.worldEnriched,overlay:this.overlay};}
  importState(data){if(!data)return false;this.lastMinutes=Number.isFinite(data.lastMinutes)?data.lastMinutes:null;this.lastRegrowthDay=Number.isFinite(data.lastRegrowthDay)?data.lastRegrowthDay:-1;this.worldEnriched=Boolean(data.worldEnriched);this.overlay=Boolean(data.overlay);return true;}
}
