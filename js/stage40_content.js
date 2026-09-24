// Stage 40 — recursos e construções do Vale Verde, registrados antes dos assets.
Object.assign(ITEM_DEFS, {
  blueberry:{name:'Mirtilo silvestre',category:'food',foodGroup:'fruit',weight:.04,stackable:true,maxStack:35,color:'#52658c',hunger:6,thirst:3,perishable:34,nutrition:1,description:'Fruta pequena encontrada nas áreas úmidas de Greenwater.'},
  edible_mushroom:{name:'Cogumelo comestível',category:'food',foodGroup:'vegetable',weight:.08,stackable:true,maxStack:24,color:'#9b8b70',hunger:8,perishable:30,nutrition:1,description:'Cogumelo identificado como seguro para cozinhar.'},
  mint:{name:'Hortelã silvestre',category:'material',weight:.02,stackable:true,maxStack:40,color:'#6d9b72',description:'Erva aromática que cresce perto dos canais.'},
  plant_fiber:{name:'Fibra vegetal',category:'material',weight:.06,stackable:true,maxStack:50,color:'#829361',description:'Fibra resistente obtida de plantas do brejo.'},
  tree_resin:{name:'Resina de árvore',category:'material',weight:.1,stackable:true,maxStack:30,color:'#a47d47',description:'Resina pegajosa usada para tratamento e reparos.'},
  fertile_soil:{name:'Terra fértil',category:'material',weight:.7,stackable:true,maxStack:20,color:'#62503c',description:'Solo escuro do Vale Verde, rico em matéria orgânica.'},
  clay:{name:'Argila',category:'material',weight:.55,stackable:true,maxStack:24,color:'#8e6955',description:'Argila retirada das margens do Greenwater.'},
  muddy_water:{name:'Água barrenta',category:'drink',weight:.5,stackable:true,maxStack:8,color:'#78806a',description:'Precisa ser filtrada antes do consumo.'},
  wet_wood:{name:'Madeira úmida',category:'material',weight:.8,stackable:true,maxStack:30,color:'#65705b',description:'Madeira abundante, mas ruim para fogo antes de secar.'},
  treated_wood:{name:'Madeira tratada',category:'material',weight:.65,stackable:true,maxStack:30,color:'#806448',description:'Madeira seca e selada, ideal para estruturas externas.'},
  honey:{name:'Mel',category:'food',foodGroup:'sweet',weight:.22,stackable:true,maxStack:16,color:'#c49b45',hunger:16,perishable:210,preserved:true,nutrition:2,description:'Alimento durável produzido por apiários.'}
});

Object.assign(BUILD_DEFS, {
  watermill:{name:'Moinho de água',category:'ENERGIA',description:'Produz energia constante perto dos canais do Vale Verde.',cost:{treated_wood:10,steel_plate:3,wire:5,pipe:3},refund:{treated_wood:5,steel_plate:1,wire:2},maxHealth:240,width:4,height:3,color:'#65745e',objectOnly:true,stage40:true,supportMode:'ground'},
  apiary:{name:'Apiário',category:'CULTIVO',description:'Produz mel lentamente quando instalado ao ar livre.',cost:{treated_wood:5,nails:5,cloth:2},refund:{treated_wood:2,nails:2},maxHealth:90,width:1,height:1,color:'#9b7b43',objectOnly:true,stage40:true},
  wood_dryer:{name:'Secador de madeira',category:'OFICINA',description:'Transforma madeira úmida em madeira tratada.',cost:{wood:6,nails:6,scrap_metal:2},refund:{wood:3,nails:2},maxHealth:120,width:2,height:2,color:'#705b43',objectOnly:true,stage40:true},
  reinforced_greenhouse:{name:'Estufa reforçada',category:'CULTIVO',description:'Protege canteiros da chuva excessiva e acelera o cultivo próximo.',cost:{quartz:8,treated_wood:8,steel_plate:3,wire:3},refund:{quartz:3,treated_wood:3,steel_plate:1},maxHealth:210,width:4,height:3,color:'#668378',objectOnly:true,stage40:true},
  swamp_walkway:{name:'Passarela de brejo',category:'PISO',description:'Travessia elevada para lama e canais rasos.',cost:{treated_wood:2,nails:2},refund:{treated_wood:1,nails:1},maxHealth:110,width:1,height:1,color:'#786249',tile:TILE.FLOOR_WOOD,stage40:true},
  lookout_tower:{name:'Torre de observação',category:'ESTRUTURA',description:'Ponto elevado para vigiar a mata e localizar eventos.',cost:{treated_wood:12,nails:10,plant_fiber:6},refund:{treated_wood:5,nails:4},maxHealth:220,width:2,height:4,color:'#6e5b45',objectOnly:true,stage40:true,supportMode:'ground'},
  rain_cistern:{name:'Cisterna rural',category:'ÁGUA',description:'Armazena grande volume de chuva para plantações.',cost:{clay:8,pipe:4,valve:1,water_filter:1},refund:{clay:3,pipe:2},maxHealth:180,width:2,height:2,color:'#65787a',objectOnly:true,stage40:true},
  crop_scarecrow:{name:'Espantalho',category:'CULTIVO',description:'Marca e protege a área produtiva da base.',cost:{treated_wood:3,cloth:3,plant_fiber:3},refund:{treated_wood:1,cloth:1},maxHealth:65,width:1,height:2,color:'#8a744f',objectOnly:true,stage40:true}
});

const STAGE40_BUILD_TYPES=new Set(Object.keys(BUILD_DEFS).filter(id=>BUILD_DEFS[id].stage40));
