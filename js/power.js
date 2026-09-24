// Stage 39 — rede elétrica com capacidade, baterias e corte por prioridade.
class PowerSystem {
  constructor(building, inventory, danger) {
    this.building = building;
    this.inventory = inventory;
    this.danger = danger;
    this.noiseTimer = 0;
    this.reportState = { production:0, demand:0, served:0, stored:0, capacity:0, online:false, shed:0 };
    this.environment = { daylight:1, rain:0 };
  }

  consumerProfile(type) {
    return {
      icebox:{ demand:1.15, priority:1, label:'Geladeira' },
      cold_room:{ demand:2.8, priority:1, label:'Câmara fria' },
      electric_pump:{ demand:1.5, priority:2, label:'Bomba de água' },
      grow_light_station:{ demand:1.1, priority:2, label:'Luz de cultivo' },
      motion_floodlight:{ demand:.38, priority:3, label:'Refletor automático' },
      floodlight:{ demand:.55, priority:3, label:'Refletor' },
      wall_lamp:{ demand:.18, priority:3, label:'Luminária' },
      auto_bench:{ demand:.9, priority:4, label:'Bancada automotiva' },
      radio_station:{ demand:.32, priority:4, label:'Estação de rádio' },
      reinforced_greenhouse:{ demand:.85, priority:2, label:'Estufa reforçada' }
    }[type] || null;
  }

  prepare(obj) {
    if (!obj) return;
    if (obj.type === 'generator') {
      if (obj.fuel == null) obj.fuel = 0;
      if (obj.running == null) obj.running = false;
      obj.output = 6;
    }
    if (obj.type === 'battery_bank') {
      if (obj.capacity == null) obj.capacity = 18;
      if (obj.charge == null) obj.charge = 4;
    }
    if (obj.type === 'solar_array') obj.output = 3.4;
    const profile = this.consumerProfile(obj.type);
    if (profile) {
      if (obj.powerPriority == null) obj.powerPriority = profile.priority;
      if (obj.powerEnabled == null) obj.powerEnabled = true;
      if (obj.powered == null) obj.powered = false;
    }
  }

  generators() { const list=this.building.objects.filter(o=>o.type==='generator'&&o.health>0);list.forEach(o=>this.prepare(o));return list; }
  solarArrays() { const list=this.building.objects.filter(o=>o.type==='solar_array'&&o.health>0);list.forEach(o=>this.prepare(o));return list; }
  watermills() { const list=this.building.objects.filter(o=>o.type==='watermill'&&o.health>0);for(const o of list)o.output=2.4;return list; }
  batteries() { const list=this.building.objects.filter(o=>o.type==='battery_bank'&&o.health>0);list.forEach(o=>this.prepare(o));return list; }
  consumers() { const list=this.building.objects.filter(o=>o.health>0&&this.consumerProfile(o.type));list.forEach(o=>this.prepare(o));return list; }
  lights() { return this.building.objects.filter(o=>['floodlight','wall_lamp','motion_floodlight'].includes(o.type)&&o.health>0); }
  nodes() { return this.building.objects.filter(o=>['generator','solar_array','watermill','battery_bank','distribution_box'].includes(o.type)&&o.health>0); }

  nearestGenerator(player,r=3){return this.building.nearest(player,r,o=>o.type==='generator');}
  nearestLight(player,r=3){return this.building.nearest(player,r,o=>o.type==='floodlight'||o.type==='motion_floodlight');}

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

  networkNear(point, radiusTiles=18) {
    if (!point) return false;
    const r = radiusTiles * CONFIG.TILE;
    return this.nodes().some(n => { const c=this.building.center(n); return Math.hypot(point.x-c.x,point.y-c.y)<=r; });
  }

  poweredAt(point){ return Boolean(this.reportState.online && this.networkNear(point)); }
  powered(light){
    if(!light)return false;
    this.prepare(light);
    return Boolean(light.powered || (this.reportState.online && this.networkNear(this.building.center(light))));
  }

  setPriority(object, priority) {
    const profile = this.consumerProfile(object?.type);
    if (!profile) return false;
    object.powerPriority = Math.max(1, Math.min(4, Math.floor(priority || profile.priority)));
    return true;
  }

  cyclePriority(object) {
    if (!this.consumerProfile(object?.type)) return null;
    this.prepare(object);
    object.powerPriority = object.powerPriority >= 4 ? 1 : object.powerPriority + 1;
    return object.powerPriority;
  }

  update(dt, environment={}) {
    this.environment.daylight = Math.max(0, Math.min(1, environment.daylight ?? this.environment.daylight));
    this.environment.rain = Math.max(0, Math.min(1, environment.rainIntensity ?? this.environment.rain));
    const generators=this.generators().filter(g=>g.running&&g.fuel>0);
    const solar=this.solarArrays();
    const watermills=this.watermills();
    const batteries=this.batteries();
    const consumers=this.consumers().filter(c=>c.powerEnabled!==false&&this.networkNear(this.building.center(c)));
    const solarScale=Math.max(0,this.environment.daylight-.12)*(1-this.environment.rain*.45);
    const genProduction=generators.reduce((n,g)=>n+g.output,0);
    const solarProduction=solar.reduce((n,s)=>n+s.output*solarScale,0);
    const hydroProduction=watermills.reduce((n,m)=>n+m.output,0);
    let available=genProduction+solarProduction+hydroProduction;
    const demand=consumers.reduce((n,c)=>n+this.consumerProfile(c.type).demand,0);
    const capacity=batteries.reduce((n,b)=>n+b.capacity,0);
    let stored=batteries.reduce((n,b)=>n+b.charge,0);
    const tickHours=dt/120;

    if (available < demand && stored > 0) {
      const need=Math.min(demand-available, stored/Math.max(.0001,tickHours));
      available+=need;
      let take=need*tickHours;
      for(const b of batteries){const v=Math.min(b.charge,take);b.charge-=v;take-=v;if(take<=0)break;}
    }

    let remaining=available,served=0,shed=0;
    consumers.sort((a,b)=>(a.powerPriority-b.powerPriority)||(a.id-b.id));
    for(const c of consumers){
      const use=this.consumerProfile(c.type).demand;
      c.powered=remaining+1e-6>=use;
      if(c.powered){remaining-=use;served+=use;}else shed++;
    }
    for(const c of this.consumers()) if(!consumers.includes(c)) c.powered=false;

    if (remaining > 0 && capacity > 0) {
      let add=remaining*tickHours;
      for(const b of batteries){const room=b.capacity-b.charge;const v=Math.min(room,add);b.charge+=v;add-=v;if(add<=0)break;}
    }

    const actualGeneratorLoad = genProduction > 0 ? Math.max(.18, Math.min(1, served/Math.max(.01,genProduction))) : 0;
    for(const g of generators){g.fuel=Math.max(0,g.fuel-dt*.034*actualGeneratorLoad);if(g.fuel<=0)g.running=false;}
    this.noiseTimer-=dt;
    if(generators.length&&this.noiseTimer<=0){for(const g of generators){const c=this.building.center(g);this.danger.emitNoise(c.x,c.y,210,'gerador');}this.noiseTimer=1.1;}

    stored=batteries.reduce((n,b)=>n+b.charge,0);
    this.reportState={production:genProduction+solarProduction+hydroProduction,demand,served,stored,capacity,online:served>0||stored>0||available>0,shed};
    return this.reportState;
  }

  report(){ return {...this.reportState}; }

  draw(ctx,cameraX,cameraY){
    for(const g of this.generators()){
      const x=g.tileX*CONFIG.TILE-cameraX,y=g.tileY*CONFIG.TILE-cameraY;if(x<-100||x>ctx.canvas.width+100)continue;
      ctx.fillStyle='#33383a';ctx.fillRect(x+2,y+7,60,23);ctx.fillStyle='#8c6542';ctx.fillRect(x+7,y+10,45,16);
      ctx.fillStyle=g.running?'#86a36c':'#744b45';ctx.fillRect(x+49,y+13,6,6);ctx.fillStyle='#1c1f20';ctx.fillRect(x+10,y+28,9,4);ctx.fillRect(x+46,y+28,9,4);
    }
    for(const l of this.lights()){
      const x=l.tileX*CONFIG.TILE-cameraX,y=l.tileY*CONFIG.TILE-cameraY,on=this.powered(l);
      if(l.type==='wall_lamp'){
        ctx.strokeStyle='#555d60';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+16,y+27);ctx.lineTo(x+16,y+10);ctx.stroke();ctx.fillStyle=on?'#f0d896':'#595b58';ctx.fillRect(x+8,y+5,16,8);
        if(on){ctx.fillStyle='rgba(244,222,157,.13)';ctx.beginPath();ctx.arc(x+16,y+10,28,0,Math.PI*2);ctx.fill();}
      } else {
        ctx.strokeStyle='#555d60';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+16,y+30);ctx.lineTo(x+16,y-44);ctx.stroke();ctx.fillStyle=on?'#f0d896':'#595b58';ctx.fillRect(x+7,y-50,19,10);
        if(on){ctx.fillStyle='rgba(244,222,157,.16)';ctx.beginPath();ctx.arc(x+16,y-44,38,0,Math.PI*2);ctx.fill();}
      }
    }
  }
}
