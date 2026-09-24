// Stage 42 — manuais/projetos e a bancada de armamento. Registered before
// assets.js so their icons load with the rest of the catalogue.
Object.assign(ITEM_DEFS, {
  bp_metal_tools:{ name:'Manual de ferramentas metálicas', category:'blueprint', weight:.08, stackable:false, color:'#7f8586',
    description:'Ensina a trabalhar sucata e aço na bancada: machadinha, facão, picareta de aço, marreta e estruturas reforçadas.' },
  bp_power:{ name:'Projeto de energia da base', category:'blueprint', weight:.08, stackable:false, color:'#c7a55a',
    description:'Esquemas de gerador, rede, baterias, bombas e refrigeração para uma base permanente.' },
  bp_armory:{ name:'Manual do armeiro', category:'blueprint', weight:.08, stackable:false, color:'#9b6654',
    description:'Como montar uma bancada de armamento e restaurar armas danificadas com peças recuperadas.' },
  bp_blackridge:{ name:'Protocolo técnico BR-7', category:'blueprint', weight:.08, stackable:false, color:'#5f8a7a',
    description:'Procedimentos Blackridge para restaurar protótipos e equipamentos de contenção.' }
});

Object.assign(BUILD_DEFS, {
  weapon_bench:{
    name:'Bancada de armamento', category:'CRAFTING',
    description:'Restaura armas danificadas e fabrica peças de armamento. Precisa de energia.',
    cost:{ steel_plate:3, scrap_metal:6, wire:4, maintenance_kit:1 },
    refund:{ steel_plate:1, scrap_metal:3, wire:2 },
    maxHealth:180, width:2, height:1, color:'#5f6a6c', objectOnly:true, stage42:true
  }
});

// Tier 1 must be reachable with wood, stone and a handful of nails.
BUILD_DEFS.workbench.cost = { wood:10, stone:4, nails:4 };
BUILD_DEFS.workbench.refund = { wood:5, stone:2, nails:2 };
BUILD_DEFS.workbench.description = 'Bancada simples. Abre as receitas de abrigo e, com os manuais certos, o trabalho em metal.';
BUILD_DEFS.crate.cost = { wood:6, nails:2 };
BUILD_DEFS.crate.refund = { wood:3, nails:1 };
