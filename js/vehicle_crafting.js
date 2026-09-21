const VEHICLE_MODULES = [
  {key:"wheels",name:"Rodas",item:"wheel_set",qty:1,icon:"module_wheels",desc:"Permite que o projeto se mova."},
  {key:"engine",name:"Conjunto do motor",item:"engine_parts",qty:2,icon:"module_engine",desc:"Módulo de propulsão abstraído para o jogo."},
  {key:"battery",name:"Bateria",item:"battery",qty:1,icon:"module_battery",desc:"Alimenta partida e sistemas elétricos."},
  {key:"fuel",name:"Tanque",item:"fuel_tank",qty:1,icon:"module_fuel",desc:"Armazena combustível do veículo."},
  {key:"seats",name:"Bancos",item:"seat_kit",qty:1,icon:"module_seats",desc:"Completa o interior básico do veículo."},
  {key:"suspension",name:"Suspensão",item:"suspension_kit",qty:1,icon:"module_suspension",desc:"Módulo de rodagem simplificado."},
  {key:"body",name:"Carroceria",item:"body_panels",qty:2,icon:"module_body",desc:"Fecha e protege o projeto."},
  {key:"lights",name:"Iluminação",item:"headlight_kit",qty:1,icon:"module_lights",desc:"Conjunto elétrico de iluminação."}
];

class VehicleCraftSystem {
  constructor(building,vehicles,inventory,danger){
    this.building=building;this.vehicles=vehicles;this.inventory=inventory;this.danger=danger;
    this.projects=new Map();
  }

  sync(){
    const valid=new Set(this.building.objects.filter(o=>o.type==="vehicle_frame").map(o=>o.id));
    for(const id of [...this.projects.keys()]) if(!valid.has(id))this.projects.delete(id);
    for(const obj of this.building.objects){
      if(obj.type==="vehicle_frame"&&!this.projects.has(obj.id)){
        this.projects.set(obj.id,{objectId:obj.id,modules:Object.fromEntries(VEHICLE_MODULES.map(m=>[m.key,false])),name:"Projeto LC-01"});
      }
    }
  }

  projectForObject(obj){this.sync();return obj?this.projects.get(obj.id)||null:null;}
  nearestProject(player,r=3.3){this.sync();return this.building.nearest(player,r,o=>o.type==="vehicle_frame");}
  autoBenchNear(player,r=5.5){return this.building.nearest(player,r,o=>o.type==="auto_bench");}

  progress(project){
    const done=VEHICLE_MODULES.filter(m=>project.modules[m.key]).length;
    return {done,total:VEHICLE_MODULES.length,percent:done/VEHICLE_MODULES.length*100};
  }

  install(project,key,player){
    if(!project)return {ok:false,reason:"Projeto inválido"};
    if(!this.autoBenchNear(player))return {ok:false,reason:"Construa uma bancada automotiva próxima"};
    const module=VEHICLE_MODULES.find(m=>m.key===key);
    if(!module)return {ok:false,reason:"Módulo inválido"};
    if(project.modules[key])return {ok:false,reason:"Módulo já instalado"};
    if(this.inventory.count(module.item)<module.qty)return {ok:false,reason:`Requer ${module.qty} ${ITEM_DEFS[module.item]?.name||module.item}`};
    this.inventory.remove(module.item,module.qty);
    project.modules[key]=true;
    const obj=this.building.objects.find(o=>o.id===project.objectId);
    if(obj){const c=this.building.center(obj);this.danger.emitNoise(c.x,c.y,155,"montagem");}
    return {ok:true,module};
  }

  canComplete(project){return project&&VEHICLE_MODULES.every(m=>project.modules[m.key]);}

  complete(project,player){
    if(!this.canComplete(project))return {ok:false,reason:"Ainda faltam módulos"};
    if(!this.autoBenchNear(player))return {ok:false,reason:"Bancada automotiva fora de alcance"};
    const obj=this.building.objects.find(o=>o.id===project.objectId);
    if(!obj)return {ok:false,reason:"Armação não encontrada"};
    const tileX=obj.tileX;
    this.building.clearObjectTiles(obj);
    this.building.objects=this.building.objects.filter(o=>o.id!==obj.id);
    this.projects.delete(project.objectId);
    const v=this.vehicles.spawnBuiltVehicle(tileX,{name:"Buggy do Sobrevivente"});
    this.danger.emitNoise(v.x+v.w/2,v.y+v.h/2,230,"veículo concluído");
    return {ok:true,vehicle:v};
  }
}
