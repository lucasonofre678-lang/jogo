class VehicleSystem {
  constructor(world, structures, inventory, danger, seed) {
    this.world = world;
    this.structures = structures;
    this.inventory = inventory;
    this.danger = danger;
    this.seed = seed >>> 0;
    this.vehicles = [];
    this.activeId = null;
    this.noiseTimer = 0;
    this.generate();
  }

  groundYAt(tileX, hintY) {
    return this.world.groundY(tileX, hintY);
  }

  structure(type) { return this.structures.structures.find(s => s.type === type) || null; }

  create(def, structureType, offset) {
    const s = this.structure(structureType);
    const tileX = s ? Math.min(s.endX + offset, CONFIG.WORLD_W - 8) : def.tileX;
    const gy = this.groundYAt(tileX);
    return {
      id: def.id,
      name: def.name,
      type: def.type,
      x: tileX * CONFIG.TILE,
      y: gy * CONFIG.TILE - def.h,
      w: def.w,
      h: def.h,
      vx: 0,
      facing: 1,
      fuel: def.fuel,
      maxFuel: def.maxFuel,
      battery: def.battery,
      condition: def.condition,
      maxCondition: 100,
      engineOn: false,
      maxSpeed: def.maxSpeed,
      accel: def.accel,
      offroadGrip: def.offroadGrip ?? .75,
      color: def.color,
      trunkMax: def.trunkMax,
      trunk: def.trunk.map(x => ({...x})),
      odometer: 0,
      wheelAngle: 0,
      bounce: 0,
      tilt: 0,
      smoke: 0,
      lightsOn: false,
      builtByPlayer: Boolean(def.builtByPlayer),
      components: {
        wheels: def.components?.wheels ?? Math.max(20,def.condition-5),
        engine: def.components?.engine ?? Math.max(15,def.condition-12),
        electrical: def.components?.electrical ?? Math.max(10,def.battery),
        fuel: def.components?.fuel ?? Math.max(20,def.condition-8),
        body: def.components?.body ?? Math.max(15,def.condition),
        suspension: def.components?.suspension ?? Math.max(20,def.condition-4)
      }
    };
  }

  generate() {
    this.vehicles = [
      this.create({id:'pickup-01',name:'Picape Harlow',type:'pickup',w:92,h:44,fuel:12,maxFuel:55,battery:68,condition:74,maxSpeed:14.0,accel:.40,offroadGrip:.92,color:'#657258',trunkMax:150,trunk:[{id:'wood',qty:5},{id:'nails',qty:6}]}, 'farm', 5),
      this.create({id:'sedan-01',name:'Sedã County',type:'sedan',w:86,h:39,fuel:4,maxFuel:45,battery:31,condition:58,maxSpeed:16.2,accel:.46,offroadGrip:.68,color:'#5c6672',trunkMax:110,trunk:[{id:'water_bottle',qty:1},{id:'snack_bar',qty:2}]}, 'market', 5),
      this.create({id:'van-01',name:'Van Westline',type:'van',w:101,h:50,fuel:0,maxFuel:70,battery:0,condition:43,maxSpeed:12.0,accel:.34,offroadGrip:.76,color:'#786552',trunkMax:240,trunk:[{id:'scrap_metal',qty:3},{id:'wire',qty:4},{id:'engine_parts',qty:1}]}, 'workshop', 5)
    ];
  }

  active() { return this.vehicles.find(v => v.id === this.activeId) || null; }

  center(v) { return {x:v.x+v.w/2,y:v.y+v.h/2}; }

  nearest(player, reachTiles=3.3) {
    const pc = player.center(); let best=null, bestD=reachTiles*CONFIG.TILE;
    for (const v of this.vehicles) {
      const c=this.center(v); const d=Math.hypot(c.x-pc.x,c.y-pc.y);
      if(d<bestD){best=v;bestD=d;}
    }
    return best;
  }

  canStart(v) {
    if (!v) return {ok:false,reason:'Veículo inválido'};
    if (v.condition < 20) return {ok:false,reason:'Condição mecânica muito baixa'};
    if (v.battery <= 0) return {ok:false,reason:'Sem bateria'};
    if (v.fuel <= 0) return {ok:false,reason:'Sem combustível'};
    return {ok:true};
  }

  enter(v, player) {
    if (!v) return {ok:false,reason:'Nenhum veículo próximo'};
    this.activeId=v.id;
    player.x=v.x+v.w*.48-player.w/2; player.y=v.y+5; player.vx=0; player.vy=0;
    return {ok:true};
  }

  exit(player) {
    const v=this.active(); if(!v) return false;
    v.engineOn=false; v.vx=0;
    const side=v.facing>0?-1:1;                   // step out behind the vehicle
    player.x=v.x+(side>0?v.w+6:-player.w-6);
    const tx=Math.floor((player.x+player.w/2)/CONFIG.TILE);
    const gy=this.groundYAt(tx,Math.floor((v.y+v.h)/CONFIG.TILE));
    player.y=gy*CONFIG.TILE-player.h-1;
    player.vx=0; player.vy=0; player.onGround=true;
    this.activeId=null; return true;
  }

  toggleEngine(v) {
    if(!v) return {ok:false,reason:'Nenhum veículo'};
    if(v.engineOn){v.engineOn=false;v.vx*=.65;return {ok:true,on:false};}
    const can=this.canStart(v); if(!can.ok)return can;
    v.engineOn=true; v.battery=Math.max(0,v.battery-.7); return {ok:true,on:true};
  }

  update(dt,input,player) {
    const v=this.active(); if(!v)return;
    const dir=(input.left?-1:0)+(input.right?1:0);
    if(v.engineOn && dir!==0){v.vx+=dir*v.accel;v.facing=dir;}
    else v.vx*=v.engineOn?.94:.82;

    const centerTile = Math.max(1, Math.min(CONFIG.WORLD_W - 2, Math.floor((v.x + v.w / 2) / CONFIG.TILE)));
    const groundY = this.groundYAt(centerTile, Math.floor((v.y + v.h) / CONFIG.TILE));
    const groundTile = this.world.get(centerTile, groundY);
    const group = typeof tileGroup === 'function' ? tileGroup(groundTile) : 'road';
    const roadLike = group === 'road' || group === 'built' || groundTile === TILE.GRAVEL;
    const speedLimit = v.maxSpeed * (roadLike ? 1 : v.offroadGrip);
    v.vx=Math.max(-speedLimit,Math.min(speedLimit,v.vx));
    if(!v.engineOn && Math.abs(v.vx)<.03)v.vx=0;

    // block on walls instead of driving through them
    const probe=Math.floor((v.x+(v.vx>0?v.w+4:-4))/CONFIG.TILE);
    const probeY=Math.floor((v.y+v.h*.4)/CONFIG.TILE);
    if(Math.abs(v.vx)>.1&&this.world.isSolid(probe,probeY)&&this.world.isSolid(probe,probeY-1)){
      v.vx*=-.15;
    } else {
      v.x+=v.vx;
    }
    v.x=Math.max(CONFIG.TILE,Math.min(CONFIG.WORLD_W*CONFIG.TILE-v.w-CONFIG.TILE,v.x));

    // ride the terrain: sample both axles so the body tilts on slopes
    const hint=Math.floor((v.y+v.h)/CONFIG.TILE);
    const frontTile=Math.floor((v.x+v.w-14)/CONFIG.TILE);
    const rearTile=Math.floor((v.x+14)/CONFIG.TILE);
    const frontY=this.groundYAt(frontTile,hint)*CONFIG.TILE;
    const rearY=this.groundYAt(rearTile,hint)*CONFIG.TILE;
    const targetY=Math.min(frontY,rearY)-v.h;
    v.y+=Math.max(-14,Math.min(14,targetY-v.y))*Math.min(1,dt*9);
    v.tilt+=((rearY-frontY)/(v.w*2)-v.tilt)*Math.min(1,dt*6);

    v.wheelAngle+=v.vx*dt*7;
    const rough=Math.abs(v.vx)*(1-v.condition/140);
    v.bounce=Math.sin(performance.now()*.017)*rough*.55;

    if(v.engineOn){
      const speed=Math.abs(v.vx);
      v.fuel=Math.max(0,v.fuel-dt*(.009+speed*.0036));
      v.battery=Math.min(100,Math.max(0,v.battery+dt*(speed>.5?.06:-.035)));
      v.odometer+=speed*dt*.002;
      v.smoke=Math.min(1,v.smoke+dt*(v.condition<55?1.4:.5));
      this.noiseTimer-=dt;
      if(this.noiseTimer<=0){this.danger.emitNoise(v.x+v.w/2,v.y+v.h/2,260+speed*18,'motor');this.noiseTimer=.7;}
      if(v.fuel<=0){v.engineOn=false;v.vx*=.7;}
    } else {
      v.smoke=Math.max(0,v.smoke-dt*.8);
    }

    this.ramInfected(v);
    player.x=v.x+v.w*.48-player.w/2; player.y=v.y+5; player.vx=v.vx; player.vy=0; player.onGround=true;
  }

  ramInfected(v) {
    const speed = Math.abs(v.vx);
    if (speed < 4.2) return;
    const now = performance.now();
    for (const enemy of this.danger.enemies) {
      if (!enemy.alive) continue;
      if (enemy.x + enemy.w < v.x || enemy.x > v.x + v.w || enemy.y + enemy.h < v.y || enemy.y > v.y + v.h) continue;
      if (enemy.lastVehicleHit && now - enemy.lastVehicleHit < 520) continue;
      enemy.lastVehicleHit = now;
      const damage = Math.min(58, 8 + speed * 3.3);
      this.danger.applyHit(enemy, damage, {
        fromX: v.x + v.w / 2,
        knockback: 3.2 + speed * .42,
        stagger: 2.4,
        sneakMultiplier: 1
      });
      v.condition = Math.max(0, v.condition - Math.max(.25, enemy.mass * .45));
      v.vx *= enemy.mass > 1.8 ? .68 : .84;
      this.danger.emitNoise(v.x + v.w / 2, v.y + v.h / 2, 360 + speed * 18, 'impacto de veículo');
      if (v.condition <= 0) { v.engineOn = false; v.vx = 0; }
    }
  }

  horn(v) {
    if (!v) return {ok:false,reason:'Nenhum veículo'};
    this.danger.emitNoise(v.x + v.w / 2, v.y + v.h / 2, 900, 'buzina');
    return {ok:true,noise:900};
  }

  damageActive(amount) {
    const v=this.active(); if(!v)return false;
    v.condition=Math.max(0,v.condition-amount*.35);
    if(v.condition<=0){v.engineOn=false;v.vx=0;}
    return true;
  }

  refuel(v) {
    if(!v)return {ok:false,reason:'Nenhum veículo'};
    if(this.inventory.count('fuel_can')<1)return {ok:false,reason:'Você precisa de um galão de combustível'};
    if(v.fuel>=v.maxFuel-1)return {ok:false,reason:'Tanque já está cheio'};
    this.inventory.remove('fuel_can',1); v.fuel=Math.min(v.maxFuel,v.fuel+22); return {ok:true};
  }

  installBattery(v) {
    if(!v)return {ok:false,reason:'Nenhum veículo'};
    if(this.inventory.count('battery')<1)return {ok:false,reason:'Você precisa de uma bateria'};
    if(v.battery>80)return {ok:false,reason:'A bateria atual ainda está boa'};
    this.inventory.remove('battery',1); v.battery=100; return {ok:true};
  }

  drainFuel(v) {
    if(!v)return {ok:false,reason:'Nenhum veículo'};
    if(v.engineOn)return {ok:false,reason:'Desligue o motor primeiro'};
    if(v.fuel<8)return {ok:false,reason:'Combustível insuficiente para drenar'};
    if(this.inventory.count('empty_bottle')<1)return {ok:false,reason:'Precisa de um recipiente vazio'};
    if(!this.inventory.canAdd('fuel_can',1))return {ok:false,reason:'Peso demais para carregar o galão'};
    this.inventory.remove('empty_bottle',1);
    v.fuel=Math.max(0,v.fuel-12);
    this.inventory.add('fuel_can',1);
    return {ok:true,amount:12};
  }

  repair(v) {
    if(!v)return {ok:false,reason:'Nenhum veículo'};
    if(v.condition>=96)return {ok:false,reason:'Veículo já está em bom estado'};
    if(this.inventory.count('scrap_metal')<2||this.inventory.count('engine_parts')<1)return {ok:false,reason:'Requer 2 Sucata + 1 Peças de motor'};
    this.inventory.remove('scrap_metal',2);this.inventory.remove('engine_parts',1);v.condition=Math.min(100,v.condition+24);return {ok:true};
  }

  componentDefs() {
    return {
      wheels:{name:"Rodas",item:"wheel_set",qty:1},
      engine:{name:"Conjunto do motor",item:"engine_parts",qty:2},
      electrical:{name:"Sistema elétrico",item:"battery",qty:1,extra:{wire:2}},
      fuel:{name:"Sistema de combustível",item:"fuel_tank",qty:1},
      body:{name:"Carroceria",item:"body_panels",qty:1,extra:{scrap_metal:2}},
      suspension:{name:"Suspensão",item:"suspension_kit",qty:1}
    };
  }

  recalcCondition(v) {
    const vals=Object.values(v.components||{});
    if(vals.length) v.condition=Math.max(1,Math.min(100,vals.reduce((a,b)=>a+b,0)/vals.length));
  }

  restoreComponent(v,key) {
    if(!v)return {ok:false,reason:"Nenhum veículo"};
    const def=this.componentDefs()[key];
    if(!def)return {ok:false,reason:"Componente inválido"};
    if((v.components?.[key]??100)>=95)return {ok:false,reason:`${def.name} já está em bom estado`};
    if(this.inventory.count(def.item)<def.qty)return {ok:false,reason:`Falta ${ITEM_DEFS[def.item]?.name||def.item}`};
    for(const [id,qty] of Object.entries(def.extra||{})) if(this.inventory.count(id)<qty)return {ok:false,reason:`Falta ${ITEM_DEFS[id]?.name||id}`};

    this.inventory.remove(def.item,def.qty);
    for(const [id,qty] of Object.entries(def.extra||{})) this.inventory.remove(id,qty);
    v.components[key]=100;
    if(key==="electrical")v.battery=Math.max(v.battery,85);
    this.recalcCondition(v);
    return {ok:true,name:def.name};
  }

  spawnBuiltVehicle(tileX, options={}) {
    const gy=this.groundYAt(tileX);
    const v={
      id:`built-${Date.now()}-${this.vehicles.length}`,
      name:options.name||"Buggy do Sobrevivente",
      type:"buggy",
      x:tileX*CONFIG.TILE,
      y:gy*CONFIG.TILE-42,
      w:88,h:42,vx:0,facing:1,
      fuel:8,maxFuel:42,battery:100,condition:100,maxCondition:100,
      engineOn:false,maxSpeed:15.0,accel:.48,offroadGrip:1.0,color:"#6c745f",
      trunkMax:90,trunk:[],odometer:0,wheelAngle:0,bounce:0,tilt:0,smoke:0,lightsOn:false,builtByPlayer:true,
      components:{wheels:100,engine:100,electrical:100,fuel:100,body:100,suspension:100}
    };
    this.vehicles.push(v);
    return v;
  }

  trunkWeight(v) {
    return v.trunk.reduce((s,e)=>s+(ITEM_DEFS[e.id]?.weight||0)*e.qty,0);
  }

  addToTrunk(v,id,qty=1) {
    const def=ITEM_DEFS[id]; if(!def)return 0;
    const free=v.trunkMax-this.trunkWeight(v); const max=Math.floor(free/Math.max(.01,def.weight)); const actual=Math.max(0,Math.min(qty,max));
    if(actual<=0)return 0; const row=v.trunk.find(e=>e.id===id); if(row)row.qty+=actual; else v.trunk.push({id,qty:actual}); return actual;
  }

  removeFromTrunk(v,id,qty=1) {
    const row=v.trunk.find(e=>e.id===id); if(!row)return 0; const n=Math.min(qty,row.qty); row.qty-=n; if(row.qty<=0)v.trunk=v.trunk.filter(e=>e!==row); return n;
  }

  bodyPalette(v) {
    const base = v.color;
    return {
      base,
      light: this.shade(base, 0.18),
      dark: this.shade(base, -0.26),
      deep: this.shade(base, -0.45)
    };
  }

  shade(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const f = c => Math.max(0, Math.min(255, Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount))));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }

  drawWheel(ctx, cx, cy, r, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#191c1f';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2f3438';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r - 1, 0, Math.PI * 2); ctx.stroke();
    ctx.rotate(angle);
    ctx.fillStyle = '#6e7376';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#464c50';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
      ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Registers head/tail light sources with the lighting pass.
  collectLights(lightSystem, night) {
    for (const v of this.vehicles) {
      v.lightsOn = v.engineOn && v.battery > 5 && night;
      if (!v.lightsOn) continue;
      const fx = v.x + (v.facing > 0 ? v.w - 4 : 4);
      lightSystem.addLight(fx, v.y + v.h * 0.55, 190, 0.95, 0.85);
      lightSystem.addLight(fx + v.facing * 120, v.y + v.h * 0.6, 150, 0.5, 0.8);
    }
  }

  draw(ctx, cameraX, cameraY) {
    for (const v of this.vehicles) {
      const x = Math.round(v.x - cameraX);
      const y = Math.round(v.y - cameraY + (v.bounce || 0));
      if (x < -160 || x > ctx.canvas.width + 160) continue;
      const p = this.bodyPalette(v);
      const wheelR = v.type === 'van' ? 11 : v.type === 'pickup' ? 11 : 10;

      ctx.save();
      ctx.translate(x + v.w / 2, y + v.h / 2);
      ctx.rotate(Math.max(-0.22, Math.min(0.22, v.tilt || 0)) * (v.facing > 0 ? 1 : -1));
      ctx.scale(v.facing, 1);
      ctx.translate(-v.w / 2, -v.h / 2);

      // ground shadow
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.beginPath();
      ctx.ellipse(v.w / 2, v.h - 1, v.w * .44, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      const axleFront = v.w - 20, axleRear = 20;
      this.drawWheel(ctx, axleRear, v.h - 8, wheelR, v.wheelAngle || 0);
      this.drawWheel(ctx, axleFront, v.h - 8, wheelR, v.wheelAngle || 0);

      // suspension arms
      ctx.strokeStyle = '#3a4042';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(axleRear, v.h - 8); ctx.lineTo(axleRear + 6, v.h - 16);
      ctx.moveTo(axleFront, v.h - 8); ctx.lineTo(axleFront - 6, v.h - 16);
      ctx.stroke();

      // chassis + body
      ctx.fillStyle = p.deep;
      ctx.fillRect(10, v.h - 20, v.w - 20, 6);
      ctx.fillStyle = p.base;
      ctx.fillRect(6, 14, v.w - 12, v.h - 26);
      ctx.fillStyle = p.light;
      ctx.fillRect(6, 14, v.w - 12, 3);
      ctx.fillStyle = p.dark;
      ctx.fillRect(6, v.h - 16, v.w - 12, 4);

      if (v.type === 'van') {
        ctx.fillStyle = p.base;
        ctx.fillRect(8, 2, v.w - 18, 14);
        ctx.fillStyle = p.light;
        ctx.fillRect(8, 2, v.w - 18, 2);
        ctx.fillStyle = 'rgba(150,183,196,.6)';
        ctx.fillRect(v.w - 30, 5, 18, 10);
        ctx.fillStyle = p.dark;
        ctx.fillRect(14, 6, 2, 10);
      } else if (v.type === 'pickup') {
        ctx.fillStyle = p.base;
        ctx.fillRect(v.w * .40, 4, v.w * .34, 12);
        ctx.fillStyle = 'rgba(150,183,196,.62)';
        ctx.fillRect(v.w * .43, 6, v.w * .28, 9);
        ctx.fillStyle = p.dark;
        ctx.fillRect(8, 10, v.w * .34, 6);              // bed wall
        ctx.fillStyle = p.deep;
        ctx.fillRect(8, 15, v.w * .34, 2);
      } else if (v.type === 'buggy') {
        ctx.strokeStyle = '#7d8583';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(14, 14); ctx.lineTo(26, 2); ctx.lineTo(v.w - 26, 2); ctx.lineTo(v.w - 14, 14);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(26, 2); ctx.lineTo(26, 14);
        ctx.moveTo(v.w - 26, 2); ctx.lineTo(v.w - 26, 14);
        ctx.stroke();
        ctx.fillStyle = 'rgba(147,174,181,.45)';
        ctx.fillRect(v.w * .44, 4, v.w * .2, 10);
      } else {
        ctx.fillStyle = p.base;
        ctx.fillRect(v.w * .24, 4, v.w * .52, 12);
        ctx.fillStyle = p.light;
        ctx.fillRect(v.w * .24, 4, v.w * .52, 2);
        ctx.fillStyle = 'rgba(150,183,196,.62)';
        ctx.fillRect(v.w * .27, 6, v.w * .2, 9);
        ctx.fillRect(v.w * .52, 6, v.w * .21, 9);
      }

      // trim, lights, plate
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      ctx.fillRect(9, 17, v.w - 20, 2);
      ctx.fillStyle = v.lightsOn ? '#f4e6a8' : '#b6a86e';
      ctx.fillRect(v.w - 9, 22, 5, 7);
      ctx.fillStyle = '#9c4e45';
      ctx.fillRect(4, 22, 4, 6);
      ctx.fillStyle = '#4a4f52';
      ctx.fillRect(v.w * .45, v.h - 15, 10, 4);

      // damage: dents and a missing panel as condition drops
      if (v.condition < 70) {
        ctx.fillStyle = 'rgba(30,26,22,.35)';
        ctx.fillRect(12 + (v.id.length * 7) % 20, 18, 10, 5);
      }
      if (v.condition < 40) {
        ctx.fillStyle = 'rgba(20,18,16,.55)';
        ctx.fillRect(v.w * .55, 16, 12, 8);
      }

      ctx.restore();

      // headlight cone (drawn unrotated so it reads at any tilt)
      if (v.lightsOn) {
        const hx = x + (v.facing > 0 ? v.w - 6 : 6);
        const hy = y + v.h * 0.55;
        const g = ctx.createLinearGradient(hx, hy, hx + v.facing * 170, hy);
        g.addColorStop(0, 'rgba(246,232,166,.30)');
        g.addColorStop(1, 'rgba(246,232,166,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(hx, hy - 5);
        ctx.lineTo(hx + v.facing * 170, hy - 42);
        ctx.lineTo(hx + v.facing * 170, hy + 42);
        ctx.lineTo(hx, hy + 5);
        ctx.closePath();
        ctx.fill();
      }

      // exhaust smoke, heavier on a damaged engine
      if (v.smoke > 0.02) {
        const ex = x + (v.facing > 0 ? 4 : v.w - 4);
        const t = performance.now() * .003;
        for (let i = 0; i < 3; i++) {
          const ph = (t + i * .33) % 1;
          const alpha = (1 - ph) * v.smoke * (v.condition < 55 ? .4 : .22);
          ctx.fillStyle = v.condition < 55 ? `rgba(58,56,52,${alpha})` : `rgba(186,190,186,${alpha})`;
          ctx.beginPath();
          ctx.arc(ex - v.facing * ph * 26, y + v.h - 14 - ph * 20, 3 + ph * 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}
