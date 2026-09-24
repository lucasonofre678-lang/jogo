// Stage 39 — Living World & Sustainable Survival.
// Conteúdo é registrado antes de Assets para que todo item e construção ganhe
// ícone, apareça no criativo e continue dirigido por dados.

Object.assign(ITEM_DEFS, {
  seed_carrot: { name:'Sementes de cenoura', category:'seed', crop:'carrot', weight:.03, stackable:true, maxStack:40, color:'#b97b45', description:'Sementes rápidas, boas para começar uma horta.' },
  seed_pumpkin: { name:'Sementes de abóbora', category:'seed', crop:'pumpkin', weight:.04, stackable:true, maxStack:30, color:'#b78245', description:'Ocupam espaço, demoram, mas rendem refeições grandes.' },
  seed_cabbage: { name:'Sementes de repolho', category:'seed', crop:'cabbage', weight:.03, stackable:true, maxStack:35, color:'#728b56', description:'Cultura resistente para sopas e conservas.' },
  seed_onion: { name:'Sementes de cebola', category:'seed', crop:'onion', weight:.02, stackable:true, maxStack:40, color:'#9d8760', description:'Crescem bem no frio e melhoram refeições.' },
  seed_strawberry: { name:'Mudas de morango', category:'seed', crop:'strawberry', weight:.05, stackable:true, maxStack:24, color:'#a45156', description:'Mudas delicadas que produzem frutas leves.' },

  carrot: { name:'Cenoura', category:'food', foodGroup:'vegetable', weight:.12, stackable:true, maxStack:30, color:'#bd7440', hunger:10, thirst:1, perishable:78, nutrition:1, description:'Raiz fresca da horta. Dura mais que folhas e frutas.' },
  pumpkin: { name:'Abóbora', category:'food', foodGroup:'vegetable', weight:1.1, stackable:true, maxStack:8, color:'#ad7136', hunger:24, perishable:115, nutrition:1, description:'Pesada, durável e excelente para refeições comunitárias.' },
  cabbage: { name:'Repolho', category:'food', foodGroup:'vegetable', weight:.52, stackable:true, maxStack:14, color:'#758f57', hunger:14, thirst:2, perishable:88, nutrition:1, description:'Folhas firmes para sopa e conserva.' },
  onion: { name:'Cebola', category:'food', foodGroup:'vegetable', weight:.16, stackable:true, maxStack:28, color:'#a38b64', hunger:7, perishable:130, nutrition:1, description:'Ingrediente resistente que melhora receitas preparadas.' },
  strawberry: { name:'Morango', category:'food', foodGroup:'fruit', weight:.06, stackable:true, maxStack:30, color:'#ad4b50', hunger:7, thirst:3, perishable:38, nutrition:1, description:'Fruta leve e delicada. Estraga rapidamente fora do frio.' },
  vegetable_preserve: { name:'Conserva de vegetais', category:'food', foodGroup:'meal', weight:.42, stackable:true, maxStack:14, color:'#8b8552', hunger:30, thirst:-2, perishable:160, preserved:true, nutrition:2, description:'Pote durável para atravessar períodos de pouca colheita.' },
  expedition_meal: { name:'Refeição de expedição', category:'food', foodGroup:'meal', weight:.34, stackable:true, maxStack:12, color:'#7f7653', hunger:44, thirst:-3, perishable:190, preserved:true, nutrition:3, description:'Refeição compacta feita para viagens longas.' },
  herbal_tea: { name:'Chá de ervas', category:'drink', foodGroup:'drink', weight:.42, stackable:true, maxStack:8, color:'#7b8f62', hunger:3, thirst:30, perishable:55, nutrition:1, warm:true, returnItem:'empty_bottle', description:'Bebida quente que ajuda depois de chuva e frio.' },

  glass_jar: { name:'Pote de conserva', category:'container', weight:.18, stackable:true, maxStack:18, color:'#9aaca8', description:'Recipiente reutilizável para conservar colheitas.' },
  pipe: { name:'Cano reaproveitado', category:'component', weight:.65, stackable:true, maxStack:24, color:'#6d7878', description:'Trecho de encanamento para água e irrigação.' },
  valve: { name:'Válvula', category:'component', weight:.24, stackable:true, maxStack:16, color:'#7b7160', description:'Controla o fluxo de água de reservatórios e bombas.' },
  water_filter: { name:'Filtro de água', category:'component', weight:.48, stackable:true, maxStack:10, color:'#748985', description:'Camadas filtrantes recuperadas para sistemas de abastecimento.' },
  sprinkler_head: { name:'Bico irrigador', category:'component', weight:.2, stackable:true, maxStack:16, color:'#6d8588', description:'Distribui água automaticamente pelos canteiros próximos.' },
  fuse: { name:'Fusível', category:'component', weight:.04, stackable:true, maxStack:30, color:'#ad9b67', description:'Protege equipamentos contra sobrecarga.' },
  solar_cell: { name:'Célula solar', category:'component', weight:.34, stackable:true, maxStack:18, color:'#506c78', description:'Célula rara recuperada de telhados e instalações técnicas.' },
  motion_sensor: { name:'Sensor de presença', category:'component', weight:.16, stackable:true, maxStack:12, color:'#688083', description:'Ativa iluminação e equipamentos somente quando necessário.' },
  power_timer: { name:'Temporizador elétrico', category:'component', weight:.18, stackable:true, maxStack:12, color:'#7c806c', description:'Controlador simples para rotinas da base.' },
  power_controller: { name:'Controlador Blackridge', category:'component', weight:.72, stackable:true, maxStack:5, color:'#49666d', description:'Controlador avançado que reduz perdas da rede elétrica.' },
  pump_parts: { name:'Peças de bomba', category:'component', weight:.85, stackable:true, maxStack:10, color:'#617579', description:'Rotor, vedação e conexões para bombas de água.' },
  grow_lamp: { name:'Lâmpada de cultivo', category:'component', weight:.38, stackable:true, maxStack:8, color:'#8a7192', description:'Iluminação eficiente recuperada de uma instalação técnica.' }
});

Object.assign(BUILD_DEFS, {
  distribution_box: { name:'Caixa de distribuição', category:'ENERGIA', description:'Conecta fontes, baterias e aparelhos. Use E para abrir o painel da base.', cost:{scrap_metal:3,wire:5,fuse:2}, refund:{scrap_metal:1,wire:2}, maxHealth:100,width:1,height:1,color:'#667274',objectOnly:true,stage39:true },
  battery_bank: { name:'Banco de baterias', category:'ENERGIA', description:'Armazena o excedente solar e mantém sistemas essenciais durante blackouts.', cost:{battery:3,wire:6,steel_plate:2,fuse:2}, refund:{battery:1,wire:3,steel_plate:1}, maxHealth:180,width:2,height:1,color:'#59686b',objectOnly:true,stage39:true },
  solar_array: { name:'Painel solar restaurado', category:'ENERGIA', description:'Gera energia durante o dia. Chuva e noite reduzem a produção.', cost:{solar_cell:6,wire:5,steel_plate:2,circuit_parts:2}, refund:{solar_cell:3,wire:2,steel_plate:1}, maxHealth:145,width:3,height:2,color:'#4b6874',objectOnly:true,stage39:true },
  motion_floodlight: { name:'Refletor automático', category:'ENERGIA', description:'Iluminação externa de baixo consumo controlada por sensor.', cost:{scrap_metal:3,wire:4,motion_sensor:1,fuse:1}, refund:{scrap_metal:1,wire:2}, maxHealth:90,width:1,height:2,color:'#c0a567',objectOnly:true,stage39:true },
  grow_light_station: { name:'Luz de cultivo', category:'CULTIVO', description:'Mantém a estufa produtiva no frio e em dias muito escuros.', cost:{grow_lamp:2,wire:4,circuit_parts:1}, refund:{grow_lamp:1,wire:2}, maxHealth:80,width:2,height:1,color:'#8a7192',objectOnly:true,stage39:true },
  water_reservoir: { name:'Reservatório de água', category:'ÁGUA', description:'Armazena chuva e água bombeada para irrigação e cozinha.', cost:{scrap_metal:7,pipe:4,valve:2,water_filter:1}, refund:{scrap_metal:3,pipe:2,valve:1}, maxHealth:190,width:2,height:2,color:'#55717a',objectOnly:true,stage39:true },
  electric_pump: { name:'Bomba elétrica', category:'ÁGUA', description:'Produz água para a rede quando possui energia.', cost:{pump_parts:2,wire:4,pipe:4,circuit_parts:1}, refund:{pump_parts:1,wire:2,pipe:2}, maxHealth:130,width:2,height:1,color:'#5c7174',objectOnly:true,stage39:true },
  sprinkler: { name:'Irrigador automático', category:'CULTIVO', description:'Usa a reserva de água para regar canteiros próximos.', cost:{pipe:3,valve:1,sprinkler_head:2}, refund:{pipe:1,sprinkler_head:1}, maxHealth:70,width:1,height:1,color:'#668284',objectOnly:true,stage39:true },
  compost_bin: { name:'Composteira', category:'CULTIVO', description:'Transforma comida estragada em composto. Use E para processar.', cost:{wood:5,nails:4}, refund:{wood:2,nails:2}, maxHealth:85,width:1,height:1,color:'#665a3f',objectOnly:true,stage39:true },
  pantry: { name:'Despensa', category:'ARMAZENAMENTO', description:'Armazenamento fresco para ingredientes e conservas.', cost:{wood:7,nails:6,cloth:2}, refund:{wood:3,nails:2}, maxHealth:115,width:2,height:2,color:'#765f45',objectOnly:true,stage39:true },
  cold_room: { name:'Câmara fria', category:'ENERGIA', description:'Grande armazenamento refrigerado com alta prioridade de energia.', cost:{steel_plate:5,wire:7,circuit_parts:3,water_filter:1}, refund:{steel_plate:2,wire:3,circuit_parts:1}, maxHealth:230,width:3,height:2,color:'#63777a',objectOnly:true,stage39:true },
  seed_storage: { name:'Armário de sementes', category:'ARMAZENAMENTO', description:'Organiza sementes e melhora o trabalho dos agricultores.', cost:{wood:5,nails:4,cloth:1}, refund:{wood:2,nails:2}, maxHealth:90,width:1,height:2,color:'#6f6048',objectOnly:true,stage39:true },
  porch_floor: { name:'Piso de varanda', category:'PISO', description:'Trecho externo com acabamento para casas e áreas comunitárias.', cost:{wood:2,nails:2}, refund:{wood:1,nails:1}, maxHealth:90,width:1,height:1,color:'#806043',tile:TILE.FLOOR_WOOD,stage39:true },
  support_pillar: { name:'Pilar estrutural', category:'ESTRUTURA', description:'Acabamento vertical para casas, varandas e galpões.', cost:{wood:3,nails:2}, refund:{wood:1,nails:1}, maxHealth:135,width:1,height:3,color:'#73543b',objectOnly:true,stage39:true,supportMode:'ground' },
  roof_gutter: { name:'Calha de telhado', category:'TELHADO', description:'Aumenta a coleta de chuva dos reservatórios próximos.', cost:{scrap_metal:2,pipe:1,nails:2}, refund:{scrap_metal:1}, maxHealth:75,width:2,height:1,color:'#677072',objectOnly:true,stage39:true,supportMode:'adjacent' }
});

const STAGE39_BUILD_TYPES = new Set(Object.keys(BUILD_DEFS).filter(id => BUILD_DEFS[id].stage39));
