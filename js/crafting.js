// Recipes are grouped into the six workbench tabs. `bench` needs a workbench
// nearby, `autoBench` the automotive bench, `fire` a lit campfire.
const CRAFT_RECIPES = [
  /* ------------------------------------------------------------ BÁSICO */
  {
    id: "nails_batch", name: "Bater pregos", category: "BÁSICO",
    output: { id: "nails", qty: 6 }, cost: { scrap_metal: 1 },
    bench: true, description: "Corta sucata em pregos reaproveitáveis."
  },
  {
    id: "plank_wood", name: "Serrar tábuas", category: "BÁSICO",
    output: { id: "plank_wood", qty: 3 }, cost: { wood: 2 },
    bench: true, description: "Transforma toras em tábuas prontas para construir."
  },
  {
    id: "gravel_crush", name: "Britar pedra", category: "BÁSICO",
    output: { id: "gravel", qty: 3 }, cost: { stone: 1 },
    bench: false, description: "Quebra pedra bruta em cascalho para pisos e caminhos."
  },
  {
    id: "cloth_strips", name: "Rasgar tecido", category: "BÁSICO",
    output: { id: "cloth", qty: 2 }, cost: { rain_jacket: 1 },
    bench: false, description: "Sacrifica uma peça de roupa para recuperar tecido."
  },
  {
    id: "ladder", name: "Escada de mão", category: "BÁSICO",
    output: { id: "ladder", qty: 2 }, cost: { wood: 3, nails: 2 },
    bench: false, description: "Sobe e desce onde não há escada. Essencial para porões e sótãos."
  },
  {
    id: "backpack_frame", name: "Ampliar mochila", category: "BÁSICO",
    output: { id: "backpack_frame", qty: 1 }, cost: { cloth: 6, scrap_metal: 2, wire: 2 },
    bench: true, description: "Armação reforçada: +8 kg de capacidade quando instalada."
  },
  {
    id: "expedition_frame", name: "Mochila de expedição", category: "BÁSICO",
    output: { id: "expedition_frame", qty: 1 }, cost: { cloth: 10, steel_plate: 2, wire: 3 },
    bench: true, description: "Estrutura grande para saques urbanos: +12 kg de capacidade quando instalada."
  },
  {
    id: "mechanic_overalls", name: "Macacão de mecânico", category: "BÁSICO",
    output: { id: "mechanic_overalls", qty: 1 }, cost: { cloth: 6, scrap_metal: 2 },
    bench: true, description: "Roupa resistente para oficina, estrada e exploração industrial."
  },
  {
    id: "boiled_water", name: "Ferver água", category: "BÁSICO",
    output: { id: "water_bottle", qty: 1 }, cost: { empty_bottle: 1 },
    fire: true, description: "Água potável fervida na fogueira. Exige uma fogueira por perto."
  },


  /* -------------------------------------------------------- MINERAÇÃO */
  {
    id: "iron_ingot", name: "Fundir ferro", category: "MINERAÇÃO",
    output: { id: "iron_ingot", qty: 1 }, cost: { iron_ore: 2, coal: 1 },
    furnace: true, description: "Processa minério de ferro na fornalha da base."
  },
  {
    id: "copper_ingot", name: "Fundir cobre", category: "MINERAÇÃO",
    output: { id: "copper_ingot", qty: 1 }, cost: { copper_ore: 2, coal: 1 },
    furnace: true, description: "Refina cobre bruto para projetos elétricos."
  },
  {
    id: "steel_plate", name: "Forjar placa reforçada", category: "MINERAÇÃO",
    output: { id: "steel_plate", qty: 1 }, cost: { iron_ingot: 2, coal: 1 },
    furnace: true, description: "Transforma ferro em uma placa resistente para construção pesada."
  },
  {
    id: "circuit_parts", name: "Montar componentes elétricos", category: "MINERAÇÃO",
    output: { id: "circuit_parts", qty: 2 }, cost: { copper_ingot: 1, quartz: 1, wire: 1 },
    bench: true, description: "Combina cobre, quartzo e fiação em componentes reutilizáveis."
  },
  {
    id: "steel_pickaxe", name: "Picareta reforçada", category: "MINERAÇÃO",
    output: { id: "steel_pickaxe", qty: 1 }, cost: { steel_plate: 2, wood: 2, nails: 3 },
    bench: true, description: "Ferramenta durável para minério, ardósia e exploração profunda."
  },
  {
    id: "steel_spear", name: "Lança reforçada", category: "FERRAMENTA",
    output: { id: "steel_spear", qty: 1 }, cost: { steel_plate: 1, wood: 3, cloth: 2 },
    bench: true, description: "Transforma materiais de metalurgia em uma arma de alcance durável."
  },
  {
    id: "sledgehammer", name: "Marreta industrial", category: "FERRAMENTA",
    output: { id: "sledgehammer", qty: 1 }, cost: { steel_plate: 2, wood: 3, nails: 2 },
    bench: true, description: "Ferramenta pesada de fim da progressão metalúrgica. Alto impacto e alto custo de fôlego."
  },
  {
    id: "miner_helmet", name: "Capacete de mineiro", category: "MINERAÇÃO",
    output: { id: "miner_helmet", qty: 1 }, cost: { steel_plate: 1, circuit_parts: 1, battery: 1 },
    bench: true, description: "Capacete com lâmpada frontal integrada para galerias escuras."
  },
  {
    id: "utility_vest", name: "Colete utilitário", category: "MINERAÇÃO",
    output: { id: "utility_vest", qty: 1 }, cost: { cloth: 5, steel_plate: 1 },
    bench: true, description: "Colete de trabalho reforçado para expedições urbanas e subterrâneas."
  },
  {
    id: "hard_hat", name: "Capacete industrial", category: "MINERAÇÃO",
    output: { id: "hard_hat", qty: 1 }, cost: { steel_plate: 1, cloth: 1 },
    bench: true, description: "Proteção de obra simples para prédios, pedreiras e túneis."
  },

  {
    id: "nickel_ingot", name: "Refinar níquel", category: "MINERAÇÃO",
    output: { id: "nickel_ingot", qty: 1 }, cost: { nickel_ore: 2, coal: 1 },
    furnace: true, description: "Processa minério profundo em metal industrial de jogo."
  },
  {
    id: "industrial_alloy", name: "Preparar liga industrial", category: "MINERAÇÃO",
    output: { id: "industrial_alloy", qty: 1 }, cost: { nickel_ingot: 1, steel_plate: 1, coal: 1 },
    furnace: true, description: "Combina materiais refinados em uma liga abstrata de alta durabilidade."
  },
  {
    id: "precision_parts", name: "Montar componentes de precisão", category: "MINERAÇÃO",
    output: { id: "precision_parts", qty: 1 }, cost: { crystal_shard: 2, nickel_ingot: 1, circuit_parts: 1 },
    bench: true, description: "Usa cristais profundos e componentes genéricos para criar peças avançadas de jogo."
  },
  {
    id: "geology_scanner", name: "Montar scanner geológico", category: "MINERAÇÃO",
    output: { id: "geology_scanner", qty: 1 }, cost: { copper_ingot: 1, quartz: 2, circuit_parts: 2, battery: 1 },
    bench: true, description: "Ferramenta de prospecção que indica a direção aproximada de minerais próximos."
  },
  {
    id: "industrial_pickaxe", name: "Picareta industrial", category: "MINERAÇÃO",
    output: { id: "industrial_pickaxe", qty: 1 }, cost: { industrial_alloy: 2, steel_plate: 1, garage_parts: 1, wood: 2 },
    bench: true, description: "Terceiro degrau da mineração: rápida, durável e capaz de abrir depósitos profundos."
  },
  {
    id: "containment_cutter", name: "Extrator de contenção BR", category: "MINERAÇÃO",
    output: { id: "containment_cutter", qty: 1 }, cost: { blackridge_mineral: 2, industrial_alloy: 2, circuit_parts: 2, precision_parts: 1 },
    bench: true, description: "Ferramenta de fim de jogo para materiais de contenção e depósitos extremos."
  },

  /* ------------------------------------------------------- CONSTRUÇÃO */
  {
    id: "floor_wood", name: "Piso de madeira", category: "CONSTRUÇÃO",
    output: { id: "floor_wood", qty: 3 }, cost: { wood: 2, nails: 2 },
    bench: true, description: "Tábuas aplainadas para o piso interno da base."
  },
  {
    id: "roof_shingle", name: "Telhas recuperadas", category: "CONSTRUÇÃO",
    output: { id: "roof_shingle", qty: 3 }, cost: { wood: 2, nails: 2 },
    bench: true, description: "Telhas improvisadas para cobrir construções."
  },
  {
    id: "roof_metal", name: "Chapa de telhado", category: "CONSTRUÇÃO",
    output: { id: "roof_metal", qty: 2 }, cost: { scrap_metal: 3, nails: 2 },
    bench: true, description: "Chapa corrugada resistente para coberturas."
  },
  {
    id: "brick_batch", name: "Moldar tijolos", category: "CONSTRUÇÃO",
    output: { id: "brick", qty: 3 }, cost: { mud_block: 2, gravel: 2 },
    bench: true, description: "Tijolos moldados com lama compactada e cascalho."
  },
  {
    id: "concrete_mix", name: "Misturar concreto", category: "CONSTRUÇÃO",
    output: { id: "concrete_chunk", qty: 2 }, cost: { gravel: 3, stone: 2 },
    bench: true, description: "Blocos de concreto para bases pesadas e garagens."
  },

  /* ---------------------------------------------------------- MEDICINA */
  {
    id: "bandage_pair", name: "Curativos improvisados", category: "MEDICINA",
    output: { id: "bandage", qty: 2 }, cost: { cloth: 2 },
    bench: false, description: "Transforma tecido recuperado em dois curativos."
  },
  {
    id: "disinfectant", name: "Antisséptico caseiro", category: "MEDICINA",
    output: { id: "disinfectant", qty: 1 }, cost: { cloth: 1, soda: 1 },
    fire: true, description: "Destilação grosseira. Reduz o risco de infecção."
  },
  {
    id: "medicine", name: "Kit médico", category: "MEDICINA",
    output: { id: "medicine", qty: 1 }, cost: { bandage: 3, disinfectant: 1, cloth: 2 },
    bench: true, description: "Junta suprimentos avulsos em um kit completo."
  },

  /* -------------------------------------------------------- FERRAMENTA */
  {
    id: "repair_hammer", name: "Martelo de reparo", category: "FERRAMENTA",
    output: { id: "repair_hammer", qty: 1 }, cost: { wood: 2, scrap_metal: 1, nails: 3 },
    bench: false, description: "Usado para reparar estruturas construídas."
  },
  {
    id: "knife", name: "Faca de campo", category: "FERRAMENTA",
    output: { id: "knife", qty: 1 }, cost: { scrap_metal: 1, wood: 1, cloth: 1 },
    bench: false, description: "Rápida e silenciosa. Boa para golpes pelas costas."
  },
  {
    id: "spear", name: "Lança improvisada", category: "FERRAMENTA",
    output: { id: "spear", qty: 1 }, cost: { wood: 3, knife: 1, cloth: 2 },
    bench: false, description: "Amarra uma lâmina num cabo longo. Alcance em troca de velocidade."
  },
  {
    id: "metal_pipe", name: "Cano de metal", category: "FERRAMENTA",
    output: { id: "metal_pipe", qty: 1 }, cost: { scrap_metal: 4 },
    bench: true, description: "Pesado, durável e sem surpresas."
  },
  {
    id: "machete", name: "Facão", category: "FERRAMENTA",
    output: { id: "machete", qty: 1 }, cost: { scrap_metal: 4, wood: 1, cloth: 1 },
    bench: true, description: "Lâmina larga: corta mais de um infectado por golpe."
  },
  {
    id: "bat", name: "Bastão reforçado", category: "FERRAMENTA",
    output: { id: "bat", qty: 1 }, cost: { wood: 4, nails: 6 },
    bench: true, description: "Madeira dura com pregos. Afasta um grupo inteiro."
  },
  {
    id: "stone_pickaxe", name: "Picareta improvisada", category: "FERRAMENTA",
    output: { id: "stone_pickaxe", qty: 1 }, cost: { wood: 2, stone: 4, nails: 2 },
    bench: true, description: "Ferramenta para mineração. Requer bancada próxima."
  },
  {
    id: "stone_axe", name: "Machado improvisado", category: "FERRAMENTA",
    output: { id: "stone_axe", qty: 1 }, cost: { wood: 3, stone: 3, nails: 2 },
    bench: true, description: "Ferramenta eficiente em madeira. Requer bancada."
  },
  {
    id: "crowbar", name: "Pé de cabra", category: "FERRAMENTA",
    output: { id: "crowbar", qty: 1 }, cost: { scrap_metal: 3, nails: 2 },
    bench: true, description: "Ferramenta robusta para desmontagem e combate."
  },

  /* ---------------------------------------------------------- ELÉTRICA */
  {
    id: "wire_bundle", name: "Recuperar fiação", category: "ELÉTRICA",
    output: { id: "wire", qty: 3 }, cost: { scrap_metal: 1, cloth: 1 },
    bench: true, description: "Transforma materiais recuperados em cabo utilizável."
  },
  {
    id: "flashlight", name: "Lanterna de campo", category: "ELÉTRICA",
    output: { id: "flashlight", qty: 1 }, cost: { scrap_metal: 2, wire: 3, battery: 1 },
    bench: true, description: "Monta uma lanterna a pilha com peças recuperadas."
  },
  {
    id: "antenna_part", name: "Peça de antena", category: "ELÉTRICA",
    output: { id: "antenna_part", qty: 1 }, cost: { scrap_metal: 3, wire: 3 },
    bench: true, description: "Segmento de antena para religar transmissores."
  },
  {
    id: "ammo_pistol", name: "Recarregar cartuchos", category: "ELÉTRICA",
    output: { id: "ammo_pistol", qty: 6 }, cost: { scrap_metal: 2, gravel: 2, wire: 1 },
    bench: true, description: "Remonta cartuchos usados. Trabalhoso e pouco rende."
  },
  {
    id: "battery_pack", name: "Recondicionar bateria", category: "ELÉTRICA",
    output: { id: "battery", qty: 1 }, cost: { scrap_metal: 3, wire: 4, filter_cartridge: 1 },
    bench: true, description: "Recupera uma bateria usando células ainda ativas."
  },

  /* ------------------------------------------------------------- ARMAS */
  {
    id: "weapon_parts", name: "Separar peças de armamento", category: "ARMAS",
    output: { id: "weapon_parts", qty: 2 }, cost: { scrap_metal: 3, wire: 1 },
    bench: true, description: "Recupera peças genéricas para o sistema fictício de arsenal."
  },
  {
    id: "spring_parts", name: "Recuperar mecanismos", category: "ARMAS",
    output: { id: "spring_parts", qty: 2 }, cost: { weapon_parts: 2, scrap_metal: 1 },
    bench: true, description: "Mecanismos abstratos reutilizados em equipamentos do jogo."
  },
  {
    id: "maintenance_kit", name: "Kit de manutenção", category: "ARMAS",
    output: { id: "maintenance_kit", qty: 1 }, cost: { weapon_parts: 2, cloth: 2, wire: 1 },
    bench: true, description: "Kit abstrato que recupera condição de armas e ferramentas."
  },
  {
    id: "handling_module", name: "Kit de manejo", category: "ARMAS",
    output: { id: "handling_module", qty: 1 }, cost: { weapon_parts: 2, spring_parts: 1, cloth: 1 },
    bench: true, description: "Acessório fictício para melhorar manejo e recarga no jogo."
  },
  {
    id: "optic_module", name: "Módulo óptico", category: "ARMAS",
    output: { id: "optic_module", qty: 1 }, cost: { precision_parts: 1, circuit_parts: 1, wire: 2 },
    bench: true, description: "Acessório abstrato para melhorar precisão ao mirar."
  },
  {
    id: "stability_module", name: "Módulo estabilizador", category: "ARMAS",
    output: { id: "stability_module", qty: 1 }, cost: { weapon_parts: 2, spring_parts: 2, steel_plate: 1 },
    bench: true, description: "Acessório abstrato para reduzir recuo e dispersão."
  },
  {
    id: "hatchet", name: "Machadinha de campo", category: "ARMAS",
    output: { id: "hatchet", qty: 1 }, cost: { scrap_metal: 3, wood: 2, cloth: 1 },
    bench: true, description: "Ferramenta leve de combate e exploração."
  },
  {
    id: "wrecking_bar", name: "Barra de demolição", category: "ARMAS",
    output: { id: "wrecking_bar", qty: 1 }, cost: { steel_plate: 1, scrap_metal: 3, cloth: 1 },
    bench: true, description: "Ferramenta industrial reforçada para controle de espaço."
  },
  {
    id: "civilian_carbine", name: "Recuperar carabina civil", category: "ARMAS",
    output: { id: "civilian_carbine", qty: 1 }, cost: { weapon_parts: 5, spring_parts: 2, steel_plate: 1, wood: 1 },
    bench: true, description: "Restauração fictícia usando módulos genéricos do jogo."
  },
  {
    id: "compact_carbine", name: "Recuperar carabina compacta", category: "ARMAS",
    output: { id: "compact_carbine", qty: 1 }, cost: { weapon_parts: 6, spring_parts: 2, precision_parts: 1, circuit_parts: 1 },
    bench: true, description: "Restauração abstrata de equipamento avançado do jogo."
  },
  {
    id: "security_pistol", name: "Recondicionar arma profissional", category: "ARMAS",
    output: { id: "security_pistol", qty: 1 }, cost: { damaged_weapon_frame: 1, maintenance_kit: 1, precision_parts: 2 },
    bench: true, description: "Recupera equipamento danificado usando componentes fictícios e abstratos."
  },

  /* ----------------------------------------------------------- GARAGEM */
  {
    id: "garage_parts", name: "Peças de garagem", category: "GARAGEM",
    output: { id: "garage_parts", qty: 2 }, cost: { scrap_metal: 3, nails: 4 },
    autoBench: true, description: "Peças genéricas para projetos automotivos."
  },
  {
    id: "wheel_set", name: "Conjunto de rodas", category: "GARAGEM",
    output: { id: "wheel_set", qty: 1 }, cost: { scrap_metal: 5, garage_parts: 2 },
    autoBench: true, description: "Módulo abstrato de rodas para projetos automotivos."
  },
  {
    id: "body_panels", name: "Painéis de carroceria", category: "GARAGEM",
    output: { id: "body_panels", qty: 1 }, cost: { scrap_metal: 5, nails: 3 },
    autoBench: true, description: "Painéis reaproveitados para montagem e restauração."
  },
  {
    id: "seat_kit", name: "Conjunto de bancos", category: "GARAGEM",
    output: { id: "seat_kit", qty: 1 }, cost: { scrap_metal: 2, cloth: 5, nails: 2 },
    autoBench: true, description: "Módulo de interior para um projeto de veículo."
  },
  {
    id: "fuel_tank", name: "Tanque veicular", category: "GARAGEM",
    output: { id: "fuel_tank", qty: 1 }, cost: { scrap_metal: 5, garage_parts: 1 },
    autoBench: true, description: "Módulo simplificado de tanque para veículos."
  },
  {
    id: "suspension_kit", name: "Conjunto de suspensão", category: "GARAGEM",
    output: { id: "suspension_kit", qty: 1 }, cost: { scrap_metal: 4, engine_parts: 1, garage_parts: 1 },
    autoBench: true, description: "Módulo abstrato de suspensão para montagem."
  },
  {
    id: "headlight_kit", name: "Conjunto de iluminação", category: "GARAGEM",
    output: { id: "headlight_kit", qty: 1 }, cost: { scrap_metal: 2, wire: 4, battery: 1 },
    autoBench: true, description: "Iluminação e fiação simplificadas em um módulo."
  }
];

// Stage 30: civilian/field gear can be made at the bench, while professional
// emergency and Blackridge kits stay exploration rewards.
CRAFT_RECIPES.push(
  { id:'clothing_patch_kit', name:'Kit de reparo de roupa', category:'BÁSICO', output:{id:'clothing_patch_kit',qty:1}, cost:{cloth:3,nails:1}, bench:true, description:'Retalhos e pequenos fechos para recuperar roupas equipadas.' },
  { id:'daypack', name:'Mochila pequena', category:'BÁSICO', output:{id:'daypack',qty:1}, cost:{cloth:5,nails:2}, bench:true, description:'Mochila civil simples com +6 kg de capacidade.' },
  { id:'cargo_pants', name:'Calça cargo', category:'BÁSICO', output:{id:'cargo_pants',qty:1}, cost:{cloth:4}, bench:true, description:'Roupa de campo leve para expedições.' },
  { id:'field_gloves', name:'Luvas de campo', category:'BÁSICO', output:{id:'field_gloves',qty:1}, cost:{cloth:2}, bench:false, description:'Luvas simples para trabalho e exploração.' },
  { id:'rain_pants', name:'Calça impermeável', category:'BÁSICO', output:{id:'rain_pants',qty:1}, cost:{cloth:5,wire:1}, bench:true, description:'Camada improvisada resistente à chuva.' },
  { id:'hiking_pack', name:'Mochila de trilha', category:'FERRAMENTA', output:{id:'hiking_pack',qty:1}, cost:{cloth:8,wire:2,scrap_metal:1}, bench:true, description:'Mochila maior para expedições longas: +12 kg.' },
  { id:'tool_pack', name:'Mochila de ferramentas', category:'FERRAMENTA', output:{id:'tool_pack',qty:1}, cost:{cloth:7,scrap_metal:2,nails:2}, bench:true, description:'Mochila organizada para manutenção: +9 kg.' },
  { id:'mining_pack', name:'Mochila de mineração', category:'MINERAÇÃO', output:{id:'mining_pack',qty:1}, cost:{cloth:7,steel_plate:1,wire:2}, bench:true, description:'Mochila reforçada para amostras e minério: +11 kg.' },
  { id:'miner_gloves', name:'Luvas de mineração', category:'MINERAÇÃO', output:{id:'miner_gloves',qty:1}, cost:{cloth:3,scrap_metal:1}, bench:true, description:'Luvas reforçadas que reduzem o esforço de mineração.' },
  { id:'miner_overalls', name:'Macacão de mineração', category:'MINERAÇÃO', output:{id:'miner_overalls',qty:1}, cost:{cloth:6,steel_plate:1}, bench:true, description:'Roupa de trabalho para galerias profundas.' }
);

// Stage 21: a compact progression ladder. Recipes stay simple, but their
// place in the run is readable and permanent once that technology is reached.
const CRAFT_TIER_BY_ID = {
  backpack_frame:1, mechanic_overalls:1, metal_pipe:1, machete:1, bat:1, crowbar:1,
  flashlight:1, antenna_part:1, wire_bundle:1,
  iron_ingot:2, copper_ingot:2, steel_plate:2, circuit_parts:2, steel_pickaxe:2,
  steel_spear:2, sledgehammer:2, miner_helmet:2, utility_vest:2, hard_hat:2,
  expedition_frame:3, wheel_set:3, body_panels:3, seat_kit:3, fuel_tank:3,
  suspension_kit:3, headlight_kit:3,
  weapon_parts:1, spring_parts:1, maintenance_kit:1, hatchet:1, handling_module:2,
  wrecking_bar:2, civilian_carbine:2, optic_module:3, stability_module:3, compact_carbine:3,
  security_pistol:4,
  nickel_ingot:2, geology_scanner:2,
  industrial_alloy:3, precision_parts:3, industrial_pickaxe:3,
  containment_cutter:5
};
Object.assign(CRAFT_TIER_BY_ID, {
  butcher_knife:0, tanned_leather:0, leather_coat:1, fur_hood:0, leather_gloves:0, hide_boots:1,
  watering_can:1, glass_jar:1, flour:0, flatbread:0,
  clothing_patch_kit:0, daypack:0, cargo_pants:0, field_gloves:0, rain_pants:1,
  hiking_pack:1, tool_pack:1, mining_pack:2, miner_gloves:2, miner_overalls:2
});

/* ============================================================== STAGE 31 ===
   Cozinha, cultivo e caça.

   As estações novas são três e a diferença entre elas é clara:
     cook    — fogueira, fogão OU cozinha comunitária. Assar e ferver.
     kitchen — só fogão ou cozinha comunitária. Refeições preparadas.
     rack    — varal de secagem. Conservar sem depender de energia.
   Nenhuma receita aqui passa de T1: comida não pode ficar atrás da metalurgia,
   ou a base nunca aprende a se alimentar sozinha.                          */
CRAFT_RECIPES.push(
  /* ------------------------------------------------------------ COZINHA */
  {
    id: "cook_meat", name: "Assar carne", category: "COZINHA",
    output: { id: "cooked_meat", qty: 1 }, cost: { raw_meat: 1 },
    cook: true, description: "Carne de caça direto no fogo. Tira o risco e dobra o valor."
  },
  {
    id: "cook_small_game", name: "Assar caça miúda", category: "COZINHA",
    output: { id: "cooked_meat", qty: 1 }, cost: { raw_small_game: 2 },
    cook: true, description: "Duas porções pequenas viram uma refeição decente."
  },
  {
    id: "baked_potato", name: "Assar batatas", category: "COZINHA",
    output: { id: "baked_potato", qty: 2 }, cost: { potato: 2 },
    cook: true, description: "Batatas nas brasas. O jeito mais barato de comer bem."
  },
  {
    id: "roasted_corn", name: "Assar milho", category: "COZINHA",
    output: { id: "roasted_corn", qty: 2 }, cost: { corn: 2 },
    cook: true, description: "Espigas tostadas na fogueira."
  },
  {
    id: "bone_broth", name: "Caldo de ossos", category: "COZINHA",
    output: { id: "bone_broth", qty: 2 }, cost: { bone: 2, wild_herbs: 1, water_bottle: 1 },
    cook: true, description: "Ferve por horas e aquece por horas."
  },
  {
    id: "vegetable_soup", name: "Sopa de legumes", category: "COZINHA",
    output: { id: "vegetable_soup", qty: 2 }, cost: { potato: 1, tomato: 1, corn: 1, water_bottle: 1 },
    cook: true, description: "Sopa da horta: alimenta e hidrata na mesma colherada."
  },
  {
    id: "meat_stew", name: "Ensopado de caça", category: "COZINHA",
    output: { id: "meat_stew", qty: 2 }, cost: { raw_meat: 2, potato: 1, beans: 1, water_bottle: 1 },
    kitchen: true, description: "A refeição completa da base. Exige fogão ou cozinha comunitária."
  },
  {
    id: "roast_haunch", name: "Pernil assado", category: "COZINHA",
    output: { id: "roast_haunch", qty: 1 }, cost: { raw_meat: 3, animal_fat: 1, dried_herbs: 1 },
    kitchen: true, description: "Peça grande, assada devagar. O melhor uso de uma caçada grande."
  },
  {
    id: "flour", name: "Moer farinha", category: "COZINHA",
    output: { id: "flour", qty: 1 }, cost: { wheat_grain: 3 },
    bench: true, description: "Mói grão de trigo na bancada."
  },
  {
    id: "flatbread", name: "Pão rústico", category: "COZINHA",
    output: { id: "flatbread", qty: 2 }, cost: { flour: 1, water_bottle: 1 },
    kitchen: true, description: "Pão chato na chapa. Rende bem e viaja bem."
  },
  {
    id: "jerky", name: "Carne seca", category: "COZINHA",
    output: { id: "jerky", qty: 3 }, cost: { raw_meat: 2, salt: 1 },
    rack: true, description: "Cura a carne no varal. Dura meses e pesa quase nada."
  },
  {
    id: "dried_herbs", name: "Secar ervas", category: "COZINHA",
    output: { id: "dried_herbs", qty: 1 }, cost: { wild_herbs: 3 },
    rack: true, description: "Ervas curadas no varal, prontas para tempero e chá."
  },
  {
    id: "pickled_vegetables", name: "Conserva de legumes", category: "COZINHA",
    output: { id: "pickled_vegetables", qty: 2 }, cost: { tomato: 2, beans: 1, salt: 1, glass_jar: 1 },
    kitchen: true, description: "A despensa que atravessa o inverno."
  },
  {
    id: "glass_jar", name: "Potes de vidro", category: "COZINHA",
    output: { id: "glass_jar", qty: 2 }, cost: { concrete_chunk: 1, scrap_metal: 1 },
    bench: true, description: "Reaproveita cacos e tampas em potes de conserva."
  },

  /* ------------------------------------------------------------ CULTIVO */
  {
    id: "seed_potato", name: "Separar semente de batata", category: "CULTIVO",
    output: { id: "seed_potato", qty: 2 }, cost: { potato: 1 },
    description: "Guarda um tubérculo para o próximo plantio."
  },
  {
    id: "seed_corn", name: "Separar semente de milho", category: "CULTIVO",
    output: { id: "seed_corn", qty: 2 }, cost: { corn: 1 },
    description: "Debulha uma espiga para semente."
  },
  {
    id: "seed_bean", name: "Separar semente de feijão", category: "CULTIVO",
    output: { id: "seed_bean", qty: 2 }, cost: { beans: 1 },
    description: "Separa os grãos mais firmes para plantar."
  },
  {
    id: "seed_tomato", name: "Separar semente de tomate", category: "CULTIVO",
    output: { id: "seed_tomato", qty: 2 }, cost: { tomato: 1 },
    description: "Retira e seca as sementes do fruto."
  },
  {
    id: "seed_wheat", name: "Separar semente de trigo", category: "CULTIVO",
    output: { id: "seed_wheat", qty: 2 }, cost: { wheat_grain: 2 },
    description: "Guarda grão para a próxima safra."
  },
  {
    id: "fertilizer", name: "Preparar composto", category: "CULTIVO",
    output: { id: "fertilizer", qty: 2 }, cost: { spoiled_food: 2, bone: 1 },
    description: "Transforma o que estragou em colheita melhor."
  },
  {
    id: "watering_can", name: "Regador", category: "CULTIVO",
    output: { id: "watering_can", qty: 1 }, cost: { scrap_metal: 2, nails: 2 },
    bench: true, description: "Rega vários canteiros sem gastar garrafa."
  },

  /* --------------------------------------------------------------- CAÇA */
  {
    id: "butcher_knife", name: "Faca de abate", category: "FERRAMENTA",
    output: { id: "butcher_knife", qty: 1 }, cost: { scrap_metal: 2, wood: 1, cloth: 1 },
    bench: true, description: "Lâmina larga de abate: aproveita muito mais de cada animal."
  },
  {
    id: "tanned_leather", name: "Curtir couro", category: "FERRAMENTA",
    output: { id: "tanned_leather", qty: 1 }, cost: { animal_hide: 2, salt: 1 },
    rack: true, description: "Cura a pele no varal até virar couro de trabalho."
  },
  {
    id: "leather_coat", name: "Casaco de couro", category: "FERRAMENTA",
    output: { id: "leather_coat", qty: 1 }, cost: { tanned_leather: 4, cloth: 2 },
    bench: true, description: "A melhor roupa de inverno que a base produz sozinha."
  },
  {
    id: "fur_hood", name: "Capuz de pele", category: "FERRAMENTA",
    output: { id: "fur_hood", qty: 1 }, cost: { animal_hide: 2, cloth: 1 },
    bench: true, description: "Capuz forrado para noites de neve."
  },
  {
    id: "leather_gloves", name: "Luvas de couro", category: "FERRAMENTA",
    output: { id: "leather_gloves", qty: 1 }, cost: { tanned_leather: 1, cloth: 1 },
    bench: true, description: "Luvas curtidas para frio e trabalho de faca."
  },
  {
    id: "hide_boots", name: "Botas de couro cru", category: "FERRAMENTA",
    output: { id: "hide_boots", qty: 1 }, cost: { tanned_leather: 2, cloth: 1 },
    bench: true, description: "Quentes, silenciosas e feitas do que você caçou."
  }
);

for (const recipe of CRAFT_RECIPES) recipe.tier = CRAFT_TIER_BY_ID[recipe.id] ?? 0;

const CRAFT_CATEGORIES = ["TODOS", "BÁSICO", "COZINHA", "CULTIVO", "MINERAÇÃO", "CONSTRUÇÃO", "MEDICINA", "FERRAMENTA", "ARMAS", "ELÉTRICA", "GARAGEM"];

class CraftingSystem {
  constructor(inventory, buildSystem, progression = null) {
    this.inventory = inventory;
    this.buildSystem = buildSystem;
    this.progression = progression;
  }

  canAfford(recipe) {
    return Object.entries(recipe.cost).every(([id, qty]) => this.inventory.count(id) >= qty);
  }

  isUnlocked(recipe, player) {
    if (this.progression && !this.progression.canCraft(recipe)) return false;
    if (recipe.autoBench) return this.buildSystem.hasAutoBenchNear(player);
    if (recipe.furnace) return this.buildSystem.hasFurnaceNear(player);
    if (recipe.fire) return Boolean(this.buildSystem.nearest(player, 3.4, o => o.type === "campfire"));
    if (recipe.kitchen) return this.buildSystem.hasKitchenNear(player);
    if (recipe.cook) return this.buildSystem.hasCookingNear(player);
    if (recipe.rack) return this.buildSystem.hasRackNear(player);
    return !recipe.bench || this.buildSystem.hasWorkbenchNear(player);
  }

  requirementLabel(recipe) {
    if (this.progression && !this.progression.canCraft(recipe)) return this.progression.labelFor(recipe);
    if (recipe.autoBench) return "GARAGEM";
    if (recipe.furnace) return "FORNALHA";
    if (recipe.fire) return "FOGUEIRA";
    if (recipe.kitchen) return "FOGÃO / COZINHA";
    if (recipe.cook) return "FOGO";
    if (recipe.rack) return "VARAL";
    if (recipe.bench) return "BANCADA";
    return "";
  }

  costText(recipe) {
    return Object.entries(recipe.cost)
      .map(([id, qty]) => `${qty} ${ITEM_DEFS[id]?.name || id}`)
      .join(" · ");
  }

  materialStatus(recipe) {
    return Object.entries(recipe.cost).map(([id, qty]) => ({
      id, need: qty, have: this.inventory.count(id), def: ITEM_DEFS[id] || null
    }));
  }

  maxCraftable(recipe, player, cap = 99) {
    if (!recipe || !this.isUnlocked(recipe, player)) return 0;
    let max = Infinity;
    for (const [id, qty] of Object.entries(recipe.cost)) {
      max = Math.min(max, Math.floor(this.inventory.count(id) / Math.max(1, qty)));
    }
    if (!Number.isFinite(max)) max = 0;
    const out = ITEM_DEFS[recipe.output.id];
    if (out && out.weight > 0) {
      const room = Math.max(0, this.inventory.maxWeight * 1.35 - this.inventory.totalWeight());
      max = Math.min(max, Math.floor(room / Math.max(.0001, out.weight * recipe.output.qty)));
    }
    return Math.max(0, Math.min(cap, max));
  }

  craftMany(recipeId, player, amount = 1) {
    const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return { ok: false, reason: "Receita inválida", crafted: 0 };
    const target = amount === "max" ? this.maxCraftable(recipe, player) : Math.max(1, Math.floor(Number(amount) || 1));
    if (target <= 0) {
      if (!this.isUnlocked(recipe, player)) return { ok: false, reason: this.requirementLabel(recipe) || "Receita bloqueada", crafted: 0 };
      return { ok: false, reason: "Materiais insuficientes", crafted: 0 };
    }
    let crafted = 0, last = null;
    for (let i = 0; i < target; i++) {
      const result = this.craft(recipeId, player);
      last = result;
      if (!result.ok) break;
      crafted++;
    }
    return crafted ? { ok: true, recipe, crafted } : { ...(last || { ok:false, reason:"Não foi possível fabricar" }), crafted: 0 };
  }

  craft(recipeId, player) {
    const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return { ok: false, reason: "Receita inválida" };
    if (!this.isUnlocked(recipe, player)) {
      if (this.progression && !this.progression.canCraft(recipe)) return { ok: false, reason: `Progressão necessária: ${this.progression.labelFor(recipe)}` };
      return { ok: false, reason: recipe.autoBench ? "Aproxime-se de uma bancada automotiva" : recipe.furnace ? "Aproxime-se de uma fornalha" : recipe.kitchen ? "Precisa de um fogão ou da cozinha da base" : recipe.rack ? "Precisa de um varal de secagem" : recipe.cook || recipe.fire ? "Acenda um fogo por perto" : "Aproxime-se de uma bancada" };
    }
    if (!this.canAfford(recipe)) return { ok: false, reason: "Materiais insuficientes" };

    const outDef = ITEM_DEFS[recipe.output.id];
    if (!outDef) return { ok: false, reason: "Item de saída inválido" };
    if (!this.inventory.canAdd(recipe.output.id, recipe.output.qty)) {
      return { ok: false, reason: "Peso demais para carregar" };
    }

    for (const [id, qty] of Object.entries(recipe.cost)) this.inventory.remove(id, qty);
    const added = this.inventory.add(recipe.output.id, recipe.output.qty);
    if (added < recipe.output.qty) return { ok: false, reason: "Sem espaço suficiente" };
    return { ok: true, recipe };
  }
}
