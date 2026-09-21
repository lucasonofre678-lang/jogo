class PowerSystem {
  constructor(building,inventory,danger){this.building=building;this.inventory=inventory;this.danger=danger;this.noiseTimer=0;}

  prepare(obj){
    if(!obj)return;
    if(obj.type==='generator'){
      if(obj.fuel==null)obj.fuel=0;
      if(obj.running==null)obj.running=false;
      if(obj.output==null)obj.output=100;
    }
  }

  generators(){const list=this.building.objects.filter(o=>o.type==='generator');list.forEach(o=>this.prepare(o));return list;}
  lights(){return this.building.objects.filter(o=>o.type==='floodlight'||o.type==='wall_lamp');}

  nearestGenerator(player,r=3){return this.building.nearest(player,r,o=>o.type==='generator');}
  nearestLight(player,r=3){return this.building.nearest(player,r,o=>o.type==='floodlight');}

  refuel(obj){
    this.prepare(obj);
    if(!obj)return {ok:false,reason:'Nenhum gerador próximo'};
    if(this.inventory.count('fuel_can')<1)return {ok:false,reason:'Você precisa de um galão de combustível'};
    if(obj.fuel>=38)return {ok:false,reason:'Tanque do gerador está cheio'};
    this.inventory.remove('fuel_can',1);obj.fuel=Math.min(40,obj.fuel+20);return {ok:true};
  }

  toggle(obj){
    this.prepare(obj);if(!obj)return {ok:false,reason:'Nenhum gerador'};
    if(obj.running){obj.running=false;return {ok:true,on:false};}
    if(obj.fuel<=0)return {ok:false,reason:'Gerador sem combustível'};
    obj.running=true;return {ok:true,on:true};
  }

  // Stage 31 — a geladeira pergunta pela posição, não por um objeto de luz.
  poweredAt(point){
    if(!point)return false;
    return this.generators().some(g=>{if(!g.running||g.fuel<=0)return false;const gc=this.building.center(g);return Math.hypot(point.x-gc.x,point.y-gc.y)<=12*CONFIG.TILE;});
  }

  powered(light){
    if(!light)return false;
    const c=this.building.center(light);
    return this.generators().some(g=>{if(!g.running||g.fuel<=0)return false;const gc=this.building.center(g);return Math.hypot(c.x-gc.x,c.y-gc.y)<=12*CONFIG.TILE;});
  }

  update(dt){
    const running=this.generators().filter(g=>g.running);
    for(const g of running){g.fuel=Math.max(0,g.fuel-dt*.055);if(g.fuel<=0)g.running=false;}
    this.noiseTimer-=dt;
    if(running.length&&this.noiseTimer<=0){for(const g of running){const c=this.building.center(g);this.danger.emitNoise(c.x,c.y,210,'gerador');}this.noiseTimer=1.1;}
  }

  draw(ctx,cameraX,cameraY){
    for(const g of this.generators()){
      const x=g.tileX*CONFIG.TILE-cameraX,y=g.tileY*CONFIG.TILE-cameraY;
      if(x<-100||x>ctx.canvas.width+100)continue;
      ctx.fillStyle='#33383a';ctx.fillRect(x+2,y+7,60,23);
      ctx.fillStyle='#8c6542';ctx.fillRect(x+7,y+10,45,16);
      ctx.fillStyle=g.running?'#86a36c':'#744b45';ctx.fillRect(x+49,y+13,6,6);
      ctx.fillStyle='#1c1f20';ctx.fillRect(x+10,y+28,9,4);ctx.fillRect(x+46,y+28,9,4);
    }
    for(const l of this.lights()){
      const x=l.tileX*CONFIG.TILE-cameraX,y=l.tileY*CONFIG.TILE-cameraY;
      const on=this.powered(l);
      if(l.type==='wall_lamp'){
        ctx.strokeStyle='#555d60';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+16,y+27);ctx.lineTo(x+16,y+10);ctx.stroke();
        ctx.fillStyle=on?'#f0d896':'#595b58';ctx.fillRect(x+8,y+5,16,8);
        if(on){ctx.fillStyle='rgba(244,222,157,.13)';ctx.beginPath();ctx.arc(x+16,y+10,28,0,Math.PI*2);ctx.fill();}
      }else{
        ctx.strokeStyle='#555d60';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+16,y+30);ctx.lineTo(x+16,y-44);ctx.stroke();
        ctx.fillStyle=on?'#f0d896':'#595b58';ctx.fillRect(x+7,y-50,19,10);
        if(on){ctx.fillStyle='rgba(244,222,157,.16)';ctx.beginPath();ctx.arc(x+16,y-44,38,0,Math.PI*2);ctx.fill();}
      }
    }
  }
}
