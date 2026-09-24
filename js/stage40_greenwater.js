// Stage 40 — regras locais, produção e ambientação do Vale Verde.
CRAFT_RECIPES.push(
  {id:'treated_wood',name:'Tratar madeira',category:'CONSTRUÇÃO',output:{id:'treated_wood',qty:2},cost:{wet_wood:3,tree_resin:1},bench:true,description:'Seca e sela madeira do Vale Verde.'},
  {id:'filtered_greenwater',name:'Filtrar água barrenta',category:'SOBREVIVÊNCIA',output:{id:'water_bottle',qty:1},cost:{muddy_water:1,water_filter:1},description:'Produz uma garrafa de água limpa.'},
  {id:'mint_tea',name:'Chá de hortelã',category:'COZINHA',output:{id:'herbal_tea',qty:1},cost:{mint:2,water_bottle:1},cook:true,description:'Bebida quente feita com ervas do vale.'}
);

class GreenwaterSystem {
  constructor({world,structures,building,inventory,farming,weather,getWorldMinutes}){
    Object.assign(this,{world,structures,building,inventory,farming,weather,getWorldMinutes});
    this.lastMinutes=null;this.lootSeeded=false;this.discovered=false;this.onNotice=null;
    this.seedLoot();
  }
  regionAtPlayer(player){return this.world.region(Math.floor((player.x+player.w/2)/CONFIG.TILE));}
  active(player){return Boolean(this.regionAtPlayer(player).stage40);}
  objects(type){return this.building.objects.filter(o=>o.type===type&&o.health>0);}
  seedLoot(){
    if(this.lootSeeded)return;
    const forage=['blueberry','edible_mushroom','mint','plant_fiber','tree_resin','fertile_soil','clay','muddy_water','wet_wood'];
    for(const c of this.structures.containers){const tx=Math.floor(c.x/CONFIG.TILE);if(tx<960||c.stage40Loot)continue;c.loot||(c.loot=[]);const rolls=2+(c.rare?2:0);for(let i=0;i<rolls;i++){const id=forage[(c.id*7+i*3)%forage.length],row=c.loot.find(v=>v.id===id);if(row)row.qty++;else c.loot.push({id,qty:1+(i%2)});}c.stage40Loot=true;}
    this.lootSeeded=true;
  }
  update(dt,player){
    const now=this.getWorldMinutes();if(this.lastMinutes==null)this.lastMinutes=now;const elapsed=Math.max(0,now-this.lastMinutes);this.lastMinutes=now;this.seedLoot();
    if(this.active(player)&&!this.discovered){this.discovered=true;this.onNotice?.('VALE VERDE DESCOBERTO · água, solo fértil e mata fechada','good');}
    for(const o of this.objects('apiary')){o.honeyProgress=(o.honeyProgress||0)+elapsed;if(o.honeyProgress>=720){o.honeyStored=Math.min(6,(o.honeyStored||0)+Math.floor(o.honeyProgress/720));o.honeyProgress%=720;}}
    for(const o of this.objects('rain_cistern')){if(o.waterCapacity==null)o.waterCapacity=120;if(o.water==null)o.water=0;if(this.weather.rainIntensity>0&&!this.world.isIndoors(o.tileX,o.tileY))o.water=Math.min(o.waterCapacity,o.water+elapsed/60*this.weather.rainIntensity*5);}
    for(const g of this.objects('reinforced_greenhouse'))for(const raw of this.farming.plots())if(Math.abs(raw.tileX-g.tileX)<=6&&Math.abs(raw.tileY-g.tileY)<=4){const p=this.farming.prepare(raw);p.boost=Math.max(p.boost||0,24);p.water=Math.max(p.water,48);}
  }
  interact(o){
    if(!o)return{ok:false};
    if(['watermill','reinforced_greenhouse'].includes(o.type))return{ok:true,openPanel:true};
    if(o.type==='apiary'){const n=Math.floor(o.honeyStored||0);if(n<1)return{ok:true,message:'O apiário ainda está produzindo',tone:'warn'};let moved=0;while(moved<n&&this.inventory.canAdd('honey',1)){this.inventory.add('honey',1);moved++;}o.honeyStored=n-moved;return{ok:true,message:`Mel coletado ×${moved}`,tone:'good',inventory:true};}
    if(o.type==='wood_dryer'){if(this.inventory.count('wet_wood')<3)return{ok:true,message:'Precisa de 3 madeiras úmidas',tone:'warn'};this.inventory.remove('wet_wood',3);this.inventory.add('treated_wood',2);return{ok:true,message:'Madeira tratada ×2',tone:'good',inventory:true};}
    if(o.type==='rain_cistern'){if(o.water==null)o.water=0;if(this.inventory.count('empty_bottle')<1||o.water<1)return{ok:true,message:`Cisterna: ${Math.floor(o.water)}/${o.waterCapacity||120} L`,tone:'warn'};this.inventory.remove('empty_bottle',1);this.inventory.add('water_bottle',1);o.water--;return{ok:true,message:'Garrafa abastecida na cisterna',tone:'good',inventory:true};}
    return{ok:true,message:BUILD_DEFS[o.type]?.description||'Estrutura do Vale Verde'};
  }
  draw(ctx,cameraX,cameraY,player,light){
    for(const o of this.building.objects){if(!BUILD_DEFS[o.type]?.stage40)continue;const x=o.tileX*CONFIG.TILE-cameraX,y=o.tileY*CONFIG.TILE-cameraY,w=o.width*CONFIG.TILE;if(x<-160||x>ctx.canvas.width+160)continue;ctx.save();ctx.lineWidth=2;
      if(o.type==='watermill'){ctx.fillStyle='#675943';ctx.fillRect(x+2,y-48,w-4,78);ctx.strokeStyle='#8ca08b';ctx.beginPath();ctx.arc(x+w-15,y+6,25,0,Math.PI*2);ctx.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(x+w-15,y+6);ctx.lineTo(x+w-15+Math.cos(a)*24,y+6+Math.sin(a)*24);ctx.stroke();}}
      else if(o.type==='apiary'){ctx.fillStyle='#8c7040';ctx.fillRect(x+3,y+8,26,22);ctx.fillStyle='#c4a14d';for(let i=0;i<3;i++)ctx.fillRect(x+7,y+12+i*5,18,2);}
      else if(o.type==='wood_dryer'){ctx.fillStyle='#67523d';ctx.fillRect(x+2,y-20,w-4,50);ctx.strokeStyle='#9a7955';for(let i=8;i<w-5;i+=10){ctx.beginPath();ctx.moveTo(x+i,y-16);ctx.lineTo(x+i,y+25);ctx.stroke();}}
      else if(o.type==='reinforced_greenhouse'){ctx.fillStyle='rgba(112,154,142,.22)';ctx.fillRect(x+2,y-62,w-4,92);ctx.strokeStyle='#789187';ctx.strokeRect(x+2,y-62,w-4,92);for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x+i*w/4,y-62);ctx.lineTo(x+i*w/4,y+30);ctx.stroke();}}
      else if(o.type==='rain_cistern'){ctx.fillStyle='#586f70';ctx.fillRect(x+3,y-25,w-6,55);ctx.fillStyle='rgba(70,130,150,.55)';ctx.fillRect(x+7,y+20-(o.water||0)/(o.waterCapacity||120)*40,w-14,(o.water||0)/(o.waterCapacity||120)*40);}
      else{ctx.fillStyle=o.type==='crop_scarecrow'?'#8b744b':'#6e5942';ctx.fillRect(x+9,y-(o.height-1)*CONFIG.TILE,Math.max(8,w-18),o.height*CONFIG.TILE);}
      ctx.restore();
    }
    if(!this.active(player)||light>.48)return;const t=this.getWorldMinutes()/18;ctx.save();for(let i=0;i<24;i++){const px=((i*157+t*(i%3+1)*4-cameraX*.06)%(ctx.canvas.width+80))-40,py=110+(i*73%420)+Math.sin(t+i)*12;ctx.globalAlpha=.3+.4*Math.abs(Math.sin(t*.7+i));ctx.fillStyle='#c9dd76';ctx.fillRect(px,py,2,2);}ctx.restore();
  }
  exportState(){return{version:1,lastMinutes:this.lastMinutes,lootSeeded:this.lootSeeded,discovered:this.discovered};}
  importState(d){if(!d)return false;this.lastMinutes=Number.isFinite(d.lastMinutes)?d.lastMinutes:null;this.lootSeeded=Boolean(d.lootSeeded);this.discovered=Boolean(d.discovered);return true;}
}
