// Stage 41 — High-Risk Expeditions
// Five authored loot sites form a readable risk/reward ladder across Last County.
// This file deliberately extends the existing world, doors, loot, lighting and
// infected systems instead of creating a second exploration framework.

const STAGE41_EXPEDITIONS = [
  {
    id:'sheriff_cache', tier:1, name:'Abrigo do Xerife', type:'expedition_1',
    x0:1080, x1:1112, floor:104, visual:'responder',
    wall:TILE.OLD_CONCRETE, back:TILE.WALL_TILE, floorTile:TILE.CHECKER_FLOOR,
    themes:['storage','security','evidence'], lights:['emergency','fluoro','emergency'],
    door:{name:'Grade do depósito', forceTool:'crowbar', integrity:4},
    loot:[
      ['Caixa de patrulha','police',1088,[['pistol',1],['ammo_pistol',16],['bandage',2],['flashlight',1]]],
      ['Armário do xerife','tools',1105,[['hatchet',1],['police_baton',1],['maintenance_kit',1],['ammo_pistol',10]]]
    ],
    spawns:[[1087,'responder'],[1098,'civilian'],[1107,'responder']],
    warning:'ABRIGO DO XERIFE · SUPRIMENTOS POLICIAIS'
  },
  {
    id:'quarantine_camp', tier:2, name:'Quarentena Estadual Harlow', type:'expedition_2',
    x0:622, x1:650, floor:119, visual:'patient',
    wall:TILE.CONCRETE, back:TILE.STATION_TILE, floorTile:TILE.HAZARD_FLOOR,
    themes:['triage','isolation','security'], lights:['emergency','emergency','fluoro'],
    door:{name:'Controle de quarentena', forceTool:'crowbar', integrity:6},
    loot:[
      ['Suprimentos de triagem','medical',630,[['medicine',3],['disinfectant',2],['bandage',4],['respirator',1]]],
      ['Contêiner da guarda','police',644,[['shotgun',1],['ammo_shotgun',14],['police_vest',1],['blackridge_keycard',1]]]
    ],
    spawns:[[628,'patient'],[634,'patient'],[642,'responder'],[647,'responder']],
    warning:'QUARENTENA HARLOW · ACESSO RESTRITO'
  },
  {
    id:'greenwater_bunker', tier:3, name:'Bunker Civil Greenwater', type:'expedition_3',
    x0:1304, x1:1344, floor:126, visual:'rural',
    wall:TILE.CONCRETE, back:TILE.OLD_CONCRETE, floorTile:TILE.INDUSTRIAL_FLOOR,
    themes:['dorm','cellar','power','security'], lights:['emergency','fluoro','emergency','fluoro'],
    door:{name:'Porta blindada Greenwater', keyItem:'blackridge_keycard', forceTool:'crowbar', integrity:8},
    loot:[
      ['Despensa de emergência','holdout',1311,[['canned_food',5],['water_bottle',4],['seed_corn',3],['seed_potato',3],['fertilizer',2]]],
      ['Cofre dos moradores','police',1337,[['civilian_carbine',1],['ammo_carbine',22],['hiking_pack',1],['maintenance_key',1],['battery',3]]]
    ],
    spawns:[[1310,'rural'],[1319,'civilian'],[1329,'rural'],[1339,'responder']],
    warning:'BUNKER GREENWATER · AUTONOMIA CIVIL'
  },
  {
    id:'county_arsenal', tier:4, name:'Arsenal Subterrâneo do Condado', type:'expedition_4',
    x0:738, x1:784, floor:148, visual:'responder',
    wall:TILE.RUST_METAL, back:TILE.TECH_WALL, floorTile:TILE.HAZARD_FLOOR,
    themes:['maintenance','security','gear','storage'], lights:['emergency','fluoro','emergency','fluoro'],
    door:{name:'Anteparo do arsenal', keyItem:'maintenance_key', forceTool:'crowbar', integrity:10},
    loot:[
      ['Reserva de manutenção','industrial',748,[['weapon_parts',5],['precision_parts',3],['maintenance_kit',2],['steel_plate',3]]],
      ['Cofre do arsenal','police',777,[['police_carbine',1],['patrol_shotgun',1],['ammo_carbine',30],['ammo_shotgun',18],['police_helmet',1]]]
    ],
    spawns:[[744,'worker'],[752,'responder'],[761,'responder'],[770,'responder'],[779,'responder']],
    warning:'ARSENAL DO CONDADO · AMEAÇA SEVERA'
  },
  {
    id:'blackridge_vault', tier:5, name:'Cofre Tecnológico Blackridge', type:'expedition_5',
    x0:880, x1:930, floor:164, entryX:880, entryY:154, entryTunnelFrom:854, visual:'blackridge',
    wall:TILE.TECH_WALL, back:TILE.WALL_PANEL, floorTile:TILE.INDUSTRIAL_FLOOR,
    themes:['isolation','lab','security','containment'], lights:['emergency','fluoro','emergency','fluoro'],
    door:{name:'Câmara tecnológica BR-7', keyItem:'blackridge_keycard', forceTool:'crowbar', integrity:12},
    loot:[
      ['Componentes experimentais','blackridge',891,[['precision_parts',5],['optic_module',1],['stability_module',1],['solar_cell',4],['circuit_parts',4]]],
      ['Cofre BR-7','blackridge',922,[['blackridge_carbine',1],['blackridge_marksman',1],['ammo_carbine',36],['ammo_rifle',24],['blackridge_vest',1]]]
    ],
    spawns:[[887,'blackridge'],[896,'blackridge'],[905,'blackridge'],[914,'blackridge'],[924,'blackridge']],
    warning:'BLACKRIDGE BR-7 · CONTENÇÃO MÁXIMA'
  }
];

for (const def of STAGE41_EXPEDITIONS) {
  STRUCTURE_PROFILES[def.type] = {
    loot:def.tier >= 5 ? 'blackridge' : def.tier >= 4 ? 'police' : def.tier === 3 ? 'holdout' : def.tier === 2 ? 'medical' : 'police',
    ambient:def.tier >= 5 ? 'blackridge' : def.tier >= 3 ? 'metro' : 'industrial',
    danger:def.tier,
    events:def.tier >= 4 ? ['alarm','sector_wake','power_fail','lights_flicker'] : ['noise_room','lights_flicker','sector_wake'],
    states:{intact:1}
  };
  AREA_PROFILES[def.type] = {
    visual:def.visual,
    types:def.tier >= 5 ? ['contained','armored','stalker','screamer']
      : def.tier >= 4 ? ['armored','heavy','runner','screamer']
      : def.tier === 3 ? ['heavy','stalker','runner','wanderer']
      : def.tier === 2 ? ['lurcher','stalker','runner','wanderer']
      : ['wanderer','runner','armored']
  };
}

StructureManager.prototype.stage41CarveSite = function(def) {
  const w=this.world, top=def.floor-7, shaftX=def.entryX??(def.x0+3);
  this.vault(def.x0,def.x1,top,def.floor-1,def.wall,def.back,def.floorTile);
  const roomCount=def.themes.length;
  const span=def.x1-def.x0-2;
  for(let i=1;i<roomCount;i++){
    const px=def.x0+1+Math.floor(span*i/roomCount);
    for(let y=top+1;y<=def.floor-2;y++) w.set(px,y,def.wall);
    // Every internal division except the final secured room has a clear
    // two-tile doorway. The final division is replaced by the authored door.
    if(i<roomCount-1){w.set(px,def.floor-1,TILE.AIR);w.set(px,def.floor-2,TILE.AIR);}
  }
  const surfaceY=def.entryY??w.surface[shaftX];
  if(def.entryTunnelFrom!=null) w.digTunnel(def.entryTunnelFrom,shaftX,surfaceY-1,3,TILE.DARK_STONE,TILE.GRAVEL);
  for(let y=surfaceY;y<=def.floor-1;y++){
    w.set(shaftX,y,TILE.LADDER);
    w.setWall(shaftX,y,def.back);
  }
  return {top,shaftX,surfaceY};
};

StructureManager.prototype.stage41BuildSite = function(def) {
  this.plan(def.type,def.x0,{state:'intact'});
  const geo=this.stage41CarveSite(def);
  const roomCount=def.themes.length, span=def.x1-def.x0-2;
  const rooms=[];
  for(let i=0;i<roomCount;i++){
    const x0=def.x0+1+Math.floor(span*i/roomCount)+(i?1:0);
    const x1=def.x0+1+Math.floor(span*(i+1)/roomCount)-1;
    const room={x0,x1,floorY:def.floor,ceilY:geo.top-1};
    rooms.push(room);
    this.furnish(room,def.themes[i],{scale:1,salt:def.tier*100+i});
    this.lightRoom(room,def.lights[i]||'emergency');
  }
  const gateX=rooms[Math.max(0,rooms.length-1)].x0-1;
  this.addDoor(gateX,def.floor-1,{...def.door,area:def.name,tile:def.tier>=4?TILE.METAL:TILE.CONCRETE});
  this.addPoint('hatch',geo.shaftX,geo.surfaceY-1,{name:`Entrada — ${def.name}`,targetX:geo.shaftX,targetY:def.floor-2,label:`DESCER · RISCO ${def.tier}/5`});
  this.addPoint('light_switch',def.x1-3,def.floor-2,{name:`Luzes — ${def.name}`,state:'off',area:def.name});
  if(def.tier>=3) this.addPoint('alarm',def.x0+Math.floor((def.x1-def.x0)/2),def.floor-3,{name:`Alarme — ${def.name}`,state:'off',area:def.name});
  this.addProp('warning_sign',geo.shaftX+2,geo.surfaceY-1,{scale:.9,behind:true});
  this.addProp('station_sign',def.x0+5,def.floor-4,{scale:.72,behind:true,wall:true});
  for(const [name,category,x,loot] of def.loot){
    const box=this.addContainer(name,x,def.floor-2,category,loot.map(([id,qty])=>({id,qty})),{rare:true});
    box.stage41=true; box.expeditionId=def.id; box.riskTier=def.tier;
  }
  this.world.undergroundZones.push({name:def.name,kind:def.type,x1:def.x0,x2:def.x1,y1:geo.top-2,y2:def.floor+2,riskTier:def.tier});
  const s=this.register(def.name,def.type,def.x0,def.x1-def.x0,def.floor,'underground',{
    underground:true,y1:geo.top-2,y2:def.floor+2,riskTier:def.tier,expeditionId:def.id,
    stage41:true,content:def.tier>=4?'high':'medium',warning:def.warning
  });
  s.spawns=def.spawns.map(([x,visual])=>[x,def.floor,visual]);
  return s;
};

StructureManager.prototype.makeHighRiskExpeditions = function(){
  for(const def of STAGE41_EXPEDITIONS) this.stage41BuildSite(def);
};

StructureManager.prototype.restoreStage41Terrain = function(){
  for(const def of STAGE41_EXPEDITIONS) this.stage41CarveSite(def);
};

const stage41GenerateRegions=StructureManager.prototype.generateRegions;
StructureManager.prototype.generateRegions=function(){
  stage41GenerateRegions.call(this);
  this.makeHighRiskExpeditions();
};
