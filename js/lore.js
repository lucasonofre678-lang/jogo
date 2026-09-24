const LORE_DOCUMENTS = [
  {
    id: "newspaper",
    title: "Jornal do Condado — 18 de março",
    source: "Residência abandonada",
    body: "Quedas de energia atingiram três estados durante a madrugada. Autoridades insistem que a rede será restabelecida. Moradores próximos ao complexo Blackridge relatam comboios militares desde a semana passada.",
    hint: "Blackridge já estava ativo antes do Apagão."
  },
  {
    id: "clinic_memo",
    title: "Memorando clínico 04-17",
    source: "Clínica de Last County",
    body: "Pacientes vindos do leste apresentam febre, desorientação e respostas incomuns a ruído. A ordem é registrar os casos como intoxicação industrial e encaminhá-los para Blackridge.",
    hint: "Os primeiros casos foram escondidos."
  },
  {
    id: "westline_log",
    title: "Registro de manutenção Westline",
    source: "Oficina Westline",
    body: "Dois geradores Blackridge foram entregues sem identificação. A equipe pediu blindagem extra nos cabos e filtros industriais para o sistema de ventilação subterrâneo.",
    hint: "Blackridge possuía instalações subterrâneas."
  },
  {
    id: "evac_order",
    title: "Ordem de evacuação incompleta",
    source: "Perímetro Blackridge",
    body: "PROTOCOLO QUIET FALL. Evacuação civil suspensa. Prioridade: selar o Setor B e cortar retransmissão externa. Nenhum funcionário deve abandonar o perímetro após 02:10.",
    hint: "O Apagão foi acompanhado por um protocolo interno."
  },
  {
    id: "research_7b",
    title: "Log de pesquisa 7-B",
    source: "Bunker Blackridge",
    body: "O agente não foi criado como arma. Seu objetivo era restaurar atividade neural após trauma severo. A variante 7-B começou a responder a estímulos sonoros mesmo depois da falha cognitiva total.",
    hint: "A origem dos infectados está ligada ao Projeto 7-B."
  },
  {
    id: "director_note",
    title: "Nota da diretoria Blackridge",
    source: "Laboratório de contenção",
    body: "A contenção falhou antes da queda da rede. O desligamento nacional foi autorizado para impedir sincronização entre instalações. O apagão atrasou a propagação, mas condenou milhões sem comunicação.",
    hint: "O Apagão foi uma contenção deliberada."
  },
  {
    id: "archive_final",
    title: "Arquivo central — QUIET FALL",
    source: "Arquivo Blackridge",
    body: "O Projeto 7-B escapou durante testes de recuperação neural. Blackridge tentou isolar o agente destruindo comunicações e energia em escala nacional. O plano reduziu a velocidade da propagação, mas criou o colapso que agora define Last County.",
    hint: "Você encontrou a verdade sobre o Apagão."
  }
];

const RADIO_TRANSMISSIONS = [
  {
    id: "emergency",
    freq: "91.7",
    name: "Canal de Emergência",
    requirement: () => true,
    text: "— ...qualquer sobrevivente na região norte... evite a estrada leste após o anoitecer. Água limpa ainda pode ser encontrada nas áreas rurais. Repito: não siga luzes vindas de Blackridge..."
  },
  {
    id: "blackridge_service",
    freq: "103.4",
    name: "Serviço Blackridge",
    requirement: lore => lore.documentsFound().length >= 2,
    text: "BLACKRIDGE AUTOMATED SERVICE. Setor B permanece isolado. Funcionários autorizados devem apresentar credencial no elevador de acesso. Protocolo Quiet Fall continua ativo."
  },
  {
    id: "county_relay",
    freq: "107.9",
    name: "Relay do Condado",
    requirement: lore => lore.documentsFound().length >= 4,
    text: "Se alguém ainda recebe isto: nós encontramos registros. O Apagão não começou nas cidades. Começou no laboratório. Não destruam os arquivos. Alguém precisa saber."
  },
  {
    id: "archive_burst",
    freq: "113.6",
    name: "Pulso do Arquivo",
    requirement: lore => lore.enteredBunker,
    text: "QUIET FALL / ARCHIVE NODE 17. Integridade parcial. Terminal central disponível. Dados aguardando transmissão ou selamento."
  }
];

class LoreSystem {
  constructor(world, structures, inventory, danger, seed) {
    this.world = world;
    this.structures = structures;
    this.inventory = inventory;
    this.danger = danger;
    this.seed = seed >>> 0;

    this.readDocs = new Set();
    this.heardRadio = new Set();
    this.exposure = 0;
    this.maxExposure = 100;
    this.enteredBunker = false;
    this.archiveChoice = null;
    this.archiveUnlocked = false;
    this.containmentSealed = false;

    this.bunker = {
      surfaceX: 936,
      undergroundY: 132,
      startX: 866,
      endX: 952
    };

    this.interactables = [];
    this.generateBlackridge();
    this.generateLoreObjects();
  }

  structure(type) {
    return this.structures.structures.find(s => s.type === type) || null;
  }

  prepareUndergroundRoom(x1, x2, y1, y2) {
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        const edge = x === x1 || x === x2 || y === y1 || y === y2;
        this.world.set(x, y, edge ? TILE.CONCRETE : TILE.AIR);
        // sealed rooms keep a panelled back wall so the bunker reads as built
        this.world.setWall(x, y, edge ? TILE.CONCRETE : TILE.WALL_PANEL);
      }
    }
    // floor plate
    for (let x = x1 + 1; x < x2; x++) this.world.set(x, y2 - 1, TILE.INDUSTRIAL_FLOOR);
  }

  // Blackridge is a whole facility, not a shed: checkpoint, fenced compound,
  // admin block, labs, comms tower, and a bunker underneath linked to the old
  // quarry gallery for anyone who finds the back way in.
  generateBlackridge() {
    const w = this.world;
    const S = this.structures;
    const b = this.bunker;

    const pad = S.lotY(866, 84);
    S.levelGround(860, 956, pad, TILE.CONCRETE, TILE.GRAVEL);
    // Stage 20: Blackridge has its own world state like every other place
    S.plan('blackridge', 858);

    /* --- checkpoint on the approach ---------------------------------- */
    for (let x = 858; x <= 866; x++) {
      w.set(x, pad, TILE.CRACKED_ASPHALT);
      w.set(x, pad - 4, x % 2 === 0 ? TILE.METAL : TILE.AIR);   // lifted barrier arm
    }
    // checkpoint posts stand behind the road; the lifted arm is overhead
    for (let y = pad - 1; y >= pad - 5; y--) { w.setWall(858, y, TILE.METAL); w.setWall(866, y, TILE.METAL); }
    S.construct({
      x: 861, width: 5, groundY: pad, floors: 1, floorHeight: 4,
      material: TILE.WALL_PANEL, floorTile: TILE.INDUSTRIAL_FLOOR, backWall: TILE.WALL_PANEL,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 4, windows: true, salt: 861
    });
    S.addProp('warning_sign', 857, pad - 1, { scale: 0.95 });
    S.addProp('floodlight_prop', 867, pad - 1, { scale: 0.95 });
    S.addContainer('Guarita', 863, pad - 2, 'police', S.loot('police', 863, 3));
    S.floorProp('monitor_stand', 863, pad, { scale: 0.9 });
    S.wallProp('security_camera', 864, pad, 88);
    S.lamp(867.5 * CONFIG.TILE, (pad - 1.7) * CONFIG.TILE, { radius: 260, strength: 0.9, color: 'cold', mode: 'power', fixture: 'tube' });

    /* --- perimeter fence + parking ----------------------------------- */
    S.chainPerimeter(868, 870, pad - 1, 4);
    // the perimeter gate was rammed open long ago
    S.addProp('road_barrier', 871, pad - 1, { scale: 0.9, tilt: 0.3 });
    S.chainPerimeter(950, 956, pad - 1, 4);
    S.addProp('containment_pod', 872, pad - 1, { scale: 0.9, behind: true });

    /* --- Stage 20: staff dormitory ------------------------------------ */
    const dorm = S.construct({
      x: 875, width: 12, groundY: pad, floors: 2, floorHeight: 5,
      material: TILE.CONCRETE, floorTile: TILE.LAB_FLOOR, backWall: TILE.LAB_WALL,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 0, partitions: [6], salt: 875, ladderAt: 9, backDoor: true
    });
    S.backDoor(dorm, 'Saída do alojamento');
    S.addDoor(dorm.doorX, pad - 1, { name: 'Alojamento dos técnicos', locked: true, forceTool: 'crowbar', integrity: 6 });
    S.dressBuilding(dorm, [['dorm', 'locker_room'], ['dorm', 'kitchen']], {
      skins: { dorm: [TILE.LAB_WALL, TILE.CARPET], locker_room: [TILE.WALL_TILE], kitchen: [TILE.WALL_TILE, TILE.LAB_FLOOR] }, lights: 'fluoro', windowStyle: 'lab'
    });
    S.addContainer('Armário do técnico', 882, pad - 2, 'blackridge', S.loot('blackridge', 882, 3));
    S.addContainer('Beliche do alojamento', 878, pad - 8, 'household', S.loot('household', 878, 3));
    S.roofDress(dorm, ['antenna', 'satellite_dish', 'roof_vent']);

    /* --- administration block (two floors) --------------------------- */
    const admin = S.construct({
      x: 888, width: 18, groundY: pad, floors: 2, floorHeight: 6,
      material: TILE.CONCRETE, floorTile: TILE.INDUSTRIAL_FLOOR, backWall: TILE.WALL_PANEL,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 3, partitions: [8, 13], salt: 888, ladderAt: 15
    });
    S.addDoor(admin.doorX, pad - 1, { name: 'Bloco administrativo', locked: true, keyItem: 'blackridge_keycard', forceTool: 'crowbar', integrity: 9 });
    S.addContainer('Sala do supervisor', 900, pad - 2, 'blackridge', S.loot('blackridge', 900, 4, { guaranteed: true }), { rare: true });
    S.addContainer('Arquivo administrativo', 895, pad - 9, 'blackridge', S.loot('blackridge', 895, 4));
    S.addPoint('terminal', 893, pad - 1, {
      name: 'Terminal administrativo', needsPower: true,
      note: 'Requisição 118: elevador de serviço liberado apenas com credencial de nível 2.',
      grants: 'blackridge_elevator'
    });
    S.dressBuilding(admin, [['reception', 'security', 'office'], ['archive', 'server', 'office']], {
      skins: { reception: [TILE.TECH_PANEL, TILE.TECH_FLOOR], security: [TILE.TECH_PANEL, TILE.TECH_FLOOR], office: [TILE.LAB_WALL, TILE.CARPET], archive: [TILE.LAB_WALL, TILE.TECH_FLOOR], server: [TILE.TECH_PANEL, TILE.TECH_FLOOR] },
      lights: 'fluoro', emergency: true, windowStyle: 'lab'
    });

    /* --- laboratory wing --------------------------------------------- */
    const lab = S.construct({
      x: 910, width: 22, groundY: pad, floors: 1, floorHeight: 9,
      material: TILE.METAL, floorTile: TILE.INDUSTRIAL_FLOOR, backWall: TILE.WALL_PANEL,
      roof: 'flat', roofTile: TILE.ROOF_METAL, doorAt: 2, partitions: [8, 15], salt: 910
    });
    S.addDoor(lab.doorX, pad - 1, { name: 'Laboratório', locked: true, forceTool: 'crowbar', integrity: 7 });
    for (let x = 914; x <= 918; x++) w.set(x, pad - 5, TILE.GLASS);
    S.addContainer('Bancada de análise', 916, pad - 2, 'blackridge', S.loot('blackridge', 916, 5, { guaranteed: true }), { rare: true });
    S.addContainer('Armário de contenção', 926, pad - 2, 'blackridge', S.loot('blackridge', 926, 4));
    S.addProp('containment_pod', 913, pad - 1, { scale: 0.95, behind: true });
    S.addProp('containment_pod', 920, pad - 1, { scale: 0.95, behind: true, flip: true });
    S.addProp('machinery', 928, pad - 1, { scale: 0.9, behind: true });
    S.addProp('pipe_run', 912, pad - 8, { scale: 0.95, behind: true });
    S.addProp('vent_fan', 930, pad - 7, { scale: 0.85 });
    for (const room of lab.rooms[0]) { S.skinRoom(room, TILE.LAB_WALL, TILE.LAB_FLOOR); S.lightRoom(room, 'fluoro'); S.lightRoom(room, 'emergency'); }
    S.floorProp('specimen_shelf', 915, pad, { scale: 1 });
    S.wallProp('biohazard_sign', 912, pad, 70);
    S.floorProp('lab_console', 922, pad, { scale: 1 });
    S.floorProp('biohazard_bin', 924, pad, { scale: 1 });
    S.floorProp('server_rack', 926, pad, { scale: 1 });
    S.floorProp('computer_desk', 929, pad, { scale: 0.95 });
    S.wallProp('security_camera', 919, pad, 150);

    /* --- comms tower -------------------------------------------------- */
    for (let y = pad - 1; y >= pad - 22; y--) {
      w.set(940, y, TILE.METAL);
      if (y % 3 === 0) { w.set(939, y, TILE.CHAIN_FENCE); w.set(941, y, TILE.CHAIN_FENCE); }
      w.set(938, y, TILE.LADDER);
    }
    for (let x = 936; x <= 944; x++) w.set(x, pad - 23, TILE.METAL);
    S.addProp('floodlight_prop', 943, pad - 1, { scale: 0.95 });
    S.lamp(943.5 * CONFIG.TILE, (pad - 1.7) * CONFIG.TILE, { radius: 260, strength: 0.9, color: 'cold', mode: 'power', fixture: 'tube' });
    S.lamp(940.5 * CONFIG.TILE, (pad - 23.6) * CONFIG.TILE, { radius: 90, strength: 0.6, color: 'red', mode: 'always', flicker: 0.95, fixture: 'signal' });
    // power yard beside the tower
    for (const [a, tx] of [['generator', 945], ['electrical_panel', 947], ['hazard_barrel', 948], ['gas_cylinders', 949]]) S.floorProp(a, tx, pad, { scale: 1 });
    S.emitter('sparks', 947.5 * CONFIG.TILE, (pad - 1.2) * CONFIG.TILE);
    S.addProp('wrecked_car', 951, pad - 1, { scale: 0.9, flip: true, behind: true });
    S.addContainer('Caixa da antena', 942, pad - 24, 'industrial', S.loot('industrial', 942, 4, { guaranteed: true }), { rare: true });
    S.addPoint('terminal', 937, pad - 1, {
      name: 'Base da torre', needsPower: true,
      note: 'Transmissor de campo operante. Antena principal danificada — peça de reposição necessária.',
      grants: 'radio_tower'
    });

    /* --- the bunker --------------------------------------------------- */
    const by = b.undergroundY;
    this.prepareUndergroundRoom(b.startX, b.startX + 26, by - 10, by + 2);
    this.prepareUndergroundRoom(b.startX + 28, b.startX + 54, by - 10, by + 2);
    this.prepareUndergroundRoom(b.startX + 56, b.endX - b.startX + b.startX, by - 10, by + 2);

    // corridors joining the three halls
    for (let x = b.startX + 24; x <= b.startX + 32; x++) {
      for (let y = by - 4; y <= by; y++) { w.set(x, y, TILE.AIR); w.setWall(x, y, TILE.WALL_PANEL); }
      w.set(x, by + 1, TILE.INDUSTRIAL_FLOOR);
    }
    for (let x = b.startX + 52; x <= b.startX + 60; x++) {
      for (let y = by - 4; y <= by; y++) { w.set(x, y, TILE.AIR); w.setWall(x, y, TILE.WALL_PANEL); }
      w.set(x, by + 1, TILE.INDUSTRIAL_FLOOR);
    }

    // service elevator shaft from the compound down into the bunker
    for (let y = pad; y <= by; y++) {
      w.set(b.surfaceX, y, TILE.LADDER);
      w.set(b.surfaceX - 1, y, TILE.METAL);
      w.set(b.surfaceX + 1, y, TILE.METAL);
      w.setWall(b.surfaceX, y, TILE.WALL_PANEL);
    }

    // hidden link: the old quarry gallery breaks into the bunker's west wall
    w.digTunnel(846, b.startX + 1, by - 6, 3, TILE.DARK_STONE, TILE.GRAVEL);
    // Keep the restored Westline deep-mine shaft continuous through the
    // gallery ceiling AND floor. digTunnel() lays a solid ceiling/floor after
    // StructureManager has already carved the shaft, so without reopening
    // these cells the ladder is split at the Blackridge junction.
    for (let y = by - 8; y <= by - 4; y++) {
      w.set(846, y, TILE.LADDER);
      w.setWall(846, y, TILE.DARK_STONE);
    }
    // the elevator shaft opens into Sector C at the bottom
    for (let y = by - 1; y <= by; y++) { w.set(b.surfaceX - 1, y, TILE.AIR); w.set(b.surfaceX + 1, y, TILE.AIR); }
    S.addPoint('cave_mouth', 848, by - 6, { name: 'Galeria da pedreira' });

    // containment area + generator room dressing
    S.addProp('containment_pod', b.startX + 6, by, { scale: 1, behind: true });
    S.addProp('containment_pod', b.startX + 12, by, { scale: 1, behind: true, flip: true });
    S.addProp('lab_console', b.startX + 18, by, { scale: 0.9, behind: true });
    S.addProp('machinery', b.startX + 34, by, { scale: 0.95, behind: true });
    S.addProp('machinery', b.startX + 40, by, { scale: 0.95, behind: true, flip: true });
    S.addProp('pipe_run', b.startX + 30, by - 8, { scale: 0.95, behind: true });
    S.addProp('vent_fan', b.startX + 48, by - 7, { scale: 0.9, behind: true });
    S.addProp('lab_console', b.startX + 62, by, { scale: 0.9, behind: true });
    S.addProp('medicine_cabinet', b.startX + 20, by, { scale: 0.8, behind: true });

    S.addContainer('Estoque do setor B', b.startX + 9, by - 1, 'blackridge', S.loot('blackridge', 909, 5, { guaranteed: true }), { rare: true });
    S.addContainer('Carrinho médico', b.startX + 22, by - 1, 'medical', S.loot('medical', 922, 4, { guaranteed: true }));
    S.addContainer('Sala técnica', b.startX + 38, by - 1, 'industrial', S.loot('industrial', 938, 5, { guaranteed: true }));
    S.addContainer('Gaveta do laboratório', b.startX + 64, by - 1, 'blackridge', S.loot('blackridge', 964, 5, { guaranteed: true }), { rare: true });

    /* --- Stage 20: three sectors with their own identity ------------- */
    const hallA = { x0: b.startX + 1, x1: b.startX + 25, floorY: by + 1, ceilY: by - 10 };
    const hallB = { x0: b.startX + 29, x1: b.startX + 53, floorY: by + 1, ceilY: by - 10 };
    const hallC = { x0: b.startX + 57, x1: b.endX - 1, floorY: by + 1, ceilY: by - 10 };
    S.skinRoom(hallA, TILE.CONTAINMENT, TILE.LAB_FLOOR);
    S.skinRoom(hallB, TILE.TECH_WALL, TILE.GRATE);
    S.skinRoom(hallC, TILE.LAB_WALL, TILE.LAB_FLOOR);
    // A — containment: an observation deck over the pods
    for (let x = b.startX + 2; x <= b.startX + 18; x++) w.set(x, by - 5, TILE.CATWALK);
    for (let y = by - 5; y <= by; y++) w.set(b.startX + 19, y, TILE.LADDER);
    S.furnish({ x0: b.startX + 2, x1: b.startX + 17, floorY: by - 5, ceilY: by - 10 }, 'observation', { scale: 1 });
    S.floorProp('specimen_shelf', b.startX + 2, by + 1, { scale: 1 });
    S.floorProp('hazard_barrel', b.startX + 16, by + 1, { scale: 1 });
    S.floorProp('biohazard_bin', b.startX + 24, by + 1, { scale: 1 });
    for (const tx of [b.startX + 4, b.startX + 14, b.startX + 22]) S.wallProp('biohazard_sign', tx, by + 1, 88);
    for (const tx of [b.startX + 5, b.startX + 12, b.startX + 21]) S.lightRoom({ x0: tx, x1: tx, floorY: by + 1, ceilY: by - 10 }, 'emergency');
    S.lightRoom({ x0: b.startX + 8, x1: b.startX + 10, floorY: by - 5, ceilY: by - 10 }, 'fluoro');
    // B — power: generators, racks, cabling, sparks
    S.furnish(hallB, 'power', { scale: 1.05 });
    S.furnish({ x0: b.startX + 42, x1: b.startX + 53, floorY: by + 1, ceilY: by - 10 }, 'server', { scale: 1 });
    S.addProp('pipe_vertical', b.startX + 30, by, { scale: 1.3, behind: true, wall: true, offsetY: -8 });
    S.addProp('cable_bundle', b.startX + 36, by - 8, { scale: 1.2, behind: true, wall: true });
    S.emitter('sparks', (b.startX + 33) * CONFIG.TILE, (by - 1) * CONFIG.TILE);
    S.emitter('steam', (b.startX + 47) * CONFIG.TILE, (by - 7) * CONFIG.TILE, { rate: 0.6 });
    for (const tx of [b.startX + 32, b.startX + 44]) {
      S.lightRoom({ x0: tx, x1: tx, floorY: by + 1, ceilY: by - 10 }, 'bulb');
      S.lightRoom({ x0: tx + 4, x1: tx + 4, floorY: by + 1, ceilY: by - 10 }, 'emergency');
    }
    // C — laboratories and the archive
    S.furnish({ x0: b.startX + 57, x1: b.startX + 68, floorY: by + 1, ceilY: by - 10 }, 'lab', { scale: 1 });
    S.furnish({ x0: b.startX + 73, x1: b.endX - 1, floorY: by + 1, ceilY: by - 10 }, 'containment', { scale: 1, state: 'damaged' });
    for (const tx of [b.startX + 60, b.startX + 66, b.startX + 76, b.startX + 82]) S.lightRoom({ x0: tx, x1: tx, floorY: by + 1, ceilY: by - 10 }, 'fluoro');
    S.lightRoom({ x0: b.startX + 79, x1: b.startX + 79, floorY: by + 1, ceilY: by - 10 }, 'emergency');
    S.addContainer('Setor C — bancada', b.startX + 80, by - 1, 'blackridge', S.loot('blackridge', 980, 4), { rare: true });
    for (let x = hallA.x0; x <= hallC.x1; x += 9) S.emitter('drip', (x + 0.5) * CONFIG.TILE, (by - 9) * CONFIG.TILE);

    /* --- Stage 20: level -2 — quarters, security, flooded maintenance -- */
    const ly = 150;
    this.prepareUndergroundRoom(876, 904, ly - 11, ly);
    this.prepareUndergroundRoom(906, 934, ly - 11, ly);
    for (let x = 902; x <= 908; x++) { for (let y = ly - 5; y <= ly - 2; y++) { w.set(x, y, TILE.AIR); w.setWall(x, y, TILE.TECH_WALL); } w.set(x, ly - 1, TILE.INDUSTRIAL_FLOOR); }
    for (let y = by + 1; y <= ly - 2; y++) { w.set(b.startX + 46, y, TILE.LADDER); w.setWall(b.startX + 46, y, TILE.DARK_METAL); }
    const lowA = { x0: 877, x1: 903, floorY: ly - 1, ceilY: ly - 11 };
    const lowB = { x0: 907, x1: 933, floorY: ly - 1, ceilY: ly - 11 };
    S.skinRoom(lowA, TILE.LAB_WALL, TILE.CARPET);
    S.skinRoom(lowB, TILE.WET_CONCRETE, TILE.WET_CONCRETE);
    for (let x = 920; x <= 933; x++) if (x % 3) w.set(x, ly - 1, TILE.MUD);
    S.furnish({ x0: 877, x1: 889, floorY: ly - 1, ceilY: ly - 11 }, 'dorm', { scale: 1 });
    S.furnish({ x0: 891, x1: 901, floorY: ly - 1, ceilY: ly - 11 }, 'security', { scale: 1 });
    S.furnish({ x0: 908, x1: 918, floorY: ly - 1, ceilY: ly - 11 }, 'maintenance', { scale: 1 });
    S.furnish({ x0: 921, x1: 933, floorY: ly - 1, ceilY: ly - 11 }, 'mechanical', { scale: 1, state: 'damaged' });
    for (const tx of [882, 896, 912, 926]) S.lightRoom({ x0: tx, x1: tx, floorY: ly - 1, ceilY: ly - 11 }, 'emergency');
    S.lightRoom({ x0: 884, x1: 884, floorY: ly - 1, ceilY: ly - 11 }, 'fluoro');
    for (let x = 910; x <= 932; x += 5) S.emitter('drip', (x + 0.5) * CONFIG.TILE, (ly - 10) * CONFIG.TILE);
    S.addContainer('Alojamento -2', 880, ly - 3, 'blackridge', S.loot('blackridge', 880, 3));
    S.addContainer('Arsenal da segurança', 897, ly - 3, 'police', S.loot('police', 897, 5, { guaranteed: true }), { rare: true });
    S.addContainer('Oficina alagada', 915, ly - 3, 'industrial', S.loot('industrial', 915, 4));
    S.addDoor(905, ly - 2, { name: 'Anteparo da manutenção', locked: true, keyItem: 'blackridge_keycard', forceTool: 'crowbar', integrity: 7 });
    // Sala Zero: behind a false panel at the far end of maintenance
    S.secretRoom(935, 939, ly - 1, 4, {
      sealSide: 'left', seal: TILE.DARK_METAL, wall: TILE.CONTAINMENT, backWall: TILE.TECH_PANEL,
      label: 'Sala Zero', props: ['specimen_shelf', 'computer_desk'], table: 'blackridge', name: 'Sala Zero'
    });
    S.lightRoom({ x0: 937, x1: 937, floorY: ly - 1, ceilY: ly - 6 }, 'emergency');
    S.hookSecret('vent_crawl', 950, by - 9);

    S.addPoint('terminal', b.startX + 32, by, {
      name: 'Quadro de energia do bunker', needsPower: false,
      note: 'Circuito auxiliar religado. As comportas do Setor B voltaram a responder.',
      grants: 'bunker_power', powers: true
    });
    S.addDoor(b.startX + 55, by, { name: 'Comporta do Setor B', locked: true, keyItem: 'blackridge_keycard', forceTool: 'crowbar', integrity: 10 });

    this.structure_ = {
      name: 'Complexo Blackridge',
      type: 'blackridge',
      x: 858,
      endX: 956,
      groundY: pad,
      style: 'industrial',
      depth: 100,
      emergencyLights: true,
      spawns: [[885, ly - 1, 'blackridge'], [925, ly - 1, 'blackridge'], [b.startX + 40, by + 1, 'blackridge']]
    };
    S.applyProfile(this.structure_, S.cur);
    for (const l of S.lamps) if (l.owner === S.cur) l.owner = this.structure_;
    for (const e of S.emitters) if (e.owner === S.cur) e.owner = this.structure_;
    for (const p of S.props) if (p.owner === S.cur) p.owner = this.structure_;
    S.cur = null;
    S.structures.push(this.structure_);
    S.computeWear();
    S.fixPaths();
    this.padY = pad;
  }

  addObject(id, type, name, tileX, tileY, data = {}) {
    this.interactables.push({
      id, type, name,
      x: tileX * CONFIG.TILE + 5,
      y: tileY * CONFIG.TILE + 4,
      w: CONFIG.TILE - 10,
      h: CONFIG.TILE - 8,
      used: false,
      ...data
    });
  }

  groundObjectY(tileX) {
    return this.world.surface[tileX] - 1;
  }

  generateLoreObjects() {
    const S = this.structures;
    const house = this.structure("house");
    const clinic = this.structure("clinic");
    const workshop = this.structure("workshop");
    const police = this.structure("police");
    const school = this.structure("school");
    const pad = this.padY;
    const by = this.bunker.undergroundY;

    if (house) this.addObject("doc-newspaper", "document", "Jornal antigo", house.x + 8, house.groundY - 2, { docId: "newspaper" });
    if (clinic) this.addObject("doc-clinic", "document", "Memorando clínico", clinic.x + 11, clinic.groundY - 2, { docId: "clinic_memo" });
    if (workshop) {
      this.addObject("doc-westline", "document", "Registro Westline", workshop.x + 10, workshop.groundY - 2, { docId: "westline_log" });
      this.addObject("respirator", "pickup", "Respirador industrial", workshop.x + 4, workshop.groundY - 2, { itemId: "respirator" });
    }
    if (police) {
      this.addObject("keycard", "pickup", "Cartão Blackridge", police.x + 16, police.groundY - 2, { itemId: "blackridge_keycard" });
      this.addObject("evidence-key", "pickup", "Chave de evidências", police.x + 5, police.groundY - 2, { itemId: "evidence_key" });
    }
    if (school) this.addObject("antenna", "pickup", "Peça de antena", school.x + 44, school.groundY - 2, { itemId: "antenna_part" });

    this.addObject("radio-road", "radio", "Rádio de emergência", 52, this.groundObjectY(52));
    this.addObject("doc-evac", "document", "Ordem de evacuação", 864, pad - 2, { docId: "evac_order" });
    this.addObject("surface-hatch", "hatch", "Elevador Blackridge", this.bunker.surfaceX + 2, pad - 1, { direction: "down" });

    this.addObject("doc-research", "document", "Terminal de pesquisa", this.bunker.startX + 4, by, { docId: "research_7b" });
    this.addObject("hazmat", "pickup", "Casaco de contenção", this.bunker.startX + 15, by, { itemId: "hazmat_coat" });
    this.addObject("radio-bunker", "radio", "Rádio interno", this.bunker.startX + 36, by);
    this.addObject("doc-director", "document", "Nota da diretoria", this.bunker.startX + 44, by, { docId: "director_note" });
    this.addObject("archive-console", "archive", "Arquivo central Blackridge", this.bunker.startX + 66, by);
    this.addObject("bunker-exit", "hatch", "Elevador de saída", this.bunker.surfaceX - 3, by, { direction: "up" });
  }

  documentsFound() {
    return LORE_DOCUMENTS.filter(d => this.readDocs.has(d.id));
  }

  docById(id) {
    return LORE_DOCUMENTS.find(d => d.id === id) || null;
  }

  availableTransmissions() {
    return RADIO_TRANSMISSIONS.filter(t => t.requirement(this));
  }

  protection(clothing) {
    let p = 0;
    for (const id of Object.values(clothing || {})) {
      if (!id || this.inventory.count(id) <= 0) continue;
      p += ITEM_DEFS[id]?.contamProtection || 0;
    }
    return Math.min(.92, p);
  }

  contaminationIntensity(player) {
    const tx = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
    const ty = Math.floor((player.y + player.h / 2) / CONFIG.TILE);
    const b = this.bunker;

    // underground: worst around the containment halls
    if (ty >= b.undergroundY - 14 && tx >= b.startX - 22 && tx <= b.endX + 6) {
      const seal = this.containmentSealed ? .62 : 1;
      if (tx >= b.startX + 56) return 1.0 * seal;
      if (tx >= b.startX + 28) return .72 * seal;
      if (tx >= b.startX) return .5 * seal;
      return .3 * seal;                                   // the quarry gallery leaks
    }

    // the compound above ground
    if (tx >= 858 && tx <= 958) {
      const edge = Math.min(1, Math.max(0, (tx - 858) / 60));
      return (.12 + edge * .4) * (this.containmentSealed ? .7 : 1);
    }
    return 0;
  }

  update(dt, player, survival, clothing) {
    const intensity = this.contaminationIntensity(player);
    const protection = this.protection(clothing);

    if (intensity > 0) {
      this.exposure += dt * (2.2 + intensity * 5.4) * (1 - protection);
    } else {
      this.exposure -= dt * .22;
    }

    this.exposure = Math.max(0, Math.min(this.maxExposure, this.exposure));

    if (this.exposure > 45) survival.energy = Math.max(0, survival.energy - dt * .5);
    if (this.exposure > 72) survival.health = Math.max(0, survival.health - dt * .16);
    if (this.exposure > 90) survival.health = Math.max(0, survival.health - dt * .34);

    this.archiveUnlocked =
      this.enteredBunker &&
      this.readDocs.has("research_7b") &&
      this.readDocs.has("director_note");

    return { intensity, protection };
  }

  nearest(player, reachTiles = 2.8) {
    const pc = player.center();
    let best = null;
    let bestD = reachTiles * CONFIG.TILE;
    for (const o of this.interactables) {
      const d = Math.hypot(o.x + o.w/2 - pc.x, o.y + o.h/2 - pc.y);
      if (d < bestD) { best = o; bestD = d; }
    }
    return best;
  }

  readDocument(docId) {
    const doc = this.docById(docId);
    if (!doc) return null;
    this.readDocs.add(docId);
    return doc;
  }

  hearTransmission(id) {
    const t = RADIO_TRANSMISSIONS.find(x => x.id === id);
    if (!t || !t.requirement(this)) return null;
    this.heardRadio.add(id);
    return t;
  }

  useObject(obj, player) {
    if (!obj) return { ok:false, reason:"Nada para interagir" };

    if (obj.type === "document") {
      const doc = this.readDocument(obj.docId);
      return { ok:true, action:"document", doc };
    }

    if (obj.type === "radio") {
      return { ok:true, action:"radio" };
    }

    if (obj.type === "pickup") {
      if (obj.used) return { ok:false, reason:"Já recolhido" };
      if (!this.inventory.canAdd(obj.itemId, 1)) return { ok:false, reason:"Peso demais" };
      this.inventory.add(obj.itemId, 1);
      obj.used = true;
      return { ok:true, action:"pickup", itemId:obj.itemId };
    }

    if (obj.type === "hatch") {
      if (obj.direction === "down") {
        if (this.inventory.count("blackridge_keycard") <= 0) return { ok:false, reason:"Acesso negado: cartão Blackridge necessário" };
        if (this.documentsFound().length < 3) return { ok:false, reason:"O painel pede três códigos de referência. Procure mais registros." };
        player.x = (this.bunker.surfaceX - 3) * CONFIG.TILE;
        player.y = this.bunker.undergroundY * CONFIG.TILE - player.h;
        player.vx = 0; player.vy = 0;
        this.enteredBunker = true;
        return { ok:true, action:"teleport", direction:"down" };
      } else {
        player.x = (this.bunker.surfaceX + 2) * CONFIG.TILE;
        player.y = (this.padY - 2) * CONFIG.TILE - player.h;
        player.vx = 0; player.vy = 0;
        return { ok:true, action:"teleport", direction:"up" };
      }
    }

    if (obj.type === "archive") {
      if (!this.archiveUnlocked) return { ok:false, reason:"Arquivo bloqueado. Dois registros internos ainda são necessários." };
      if (!this.readDocs.has("archive_final")) this.readDocument("archive_final");
      return { ok:true, action:"archive" };
    }

    return { ok:false, reason:"Sem resposta" };
  }

  chooseArchive(choice) {
    if (!this.archiveUnlocked || this.archiveChoice) return false;
    this.archiveChoice = choice;
    if (choice === "transmit") {
      this.heardRadio.add("archive_burst");
    }
    return true;
  }

  areaName(player) {
    const tx = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
    const ty = Math.floor((player.y + player.h / 2) / CONFIG.TILE);
    const b = this.bunker;
    if (ty >= b.undergroundY - 14 && tx >= b.startX - 24 && tx <= b.endX + 6) {
      if (tx < b.startX) return "Galeria da Pedreira";
      if (tx >= b.startX + 56) return "Setor B — Contenção";
      if (tx >= b.startX + 28) return "Bunker Blackridge — Técnico";
      return "Bunker Blackridge";
    }
    if (tx >= 858 && tx < 960) return "Complexo Blackridge";
    return null;
  }

  promptFor(obj) {
    if (!obj) return "";
    if (obj.type === "document") return `E — LER ${obj.name.toUpperCase()}`;
    if (obj.type === "radio") return `E — USAR ${obj.name.toUpperCase()}`;
    if (obj.type === "pickup") return obj.used ? "" : `E — PEGAR ${obj.name.toUpperCase()}`;
    if (obj.type === "hatch") return obj.direction === "down" ? "E — ACESSAR ELEVADOR BLACKRIDGE" : "E — VOLTAR À SUPERFÍCIE";
    if (obj.type === "archive") return "E — ACESSAR ARQUIVO CENTRAL";
    return "";
  }

  drawObject(ctx, obj, cameraX, cameraY) {
    if (obj.type === "pickup" && obj.used) return;

    const x = obj.x - cameraX;
    const y = obj.y - cameraY;
    if (x < -60 || x > ctx.canvas.width + 60 || y < -80 || y > ctx.canvas.height + 80) return;

    ctx.save();
    ctx.translate(x, y);

    if (obj.type === "document") {
      ctx.fillStyle = "#cbbd98";
      ctx.fillRect(4, 5, 20, 17);
      ctx.fillStyle = "#7a6548";
      ctx.fillRect(7, 9, 14, 2);
      ctx.fillRect(7, 13, 11, 2);
      ctx.fillRect(7, 17, 8, 2);
    } else if (obj.type === "radio") {
      ctx.fillStyle = "#4b5153";
      ctx.fillRect(3, 7, 24, 17);
      ctx.fillStyle = "#828e87";
      ctx.fillRect(7, 10, 9, 7);
      ctx.fillStyle = "#1d2021";
      ctx.fillRect(19, 10, 4, 4);
      ctx.strokeStyle = "#8e9692";
      ctx.beginPath();
      ctx.moveTo(22, 7); ctx.lineTo(27, 0); ctx.stroke();
    } else if (obj.type === "pickup") {
      ctx.fillStyle = ITEM_DEFS[obj.itemId]?.color || "#888";
      ctx.fillRect(7, 7, 16, 16);
      ctx.strokeStyle = "rgba(245,231,184,.8)";
      ctx.strokeRect(5.5, 5.5, 19, 19);
    } else if (obj.type === "hatch") {
      ctx.fillStyle = "#343b3e";
      ctx.fillRect(1, 8, 28, 18);
      ctx.fillStyle = "#6e7778";
      ctx.fillRect(4, 11, 22, 3);
      ctx.fillStyle = "#a44f48";
      ctx.fillRect(21, 18, 3, 3);
    } else if (obj.type === "archive") {
      ctx.fillStyle = "#242a2d";
      ctx.fillRect(2, 3, 27, 25);
      ctx.fillStyle = this.archiveUnlocked ? "#8fac85" : "#7d504c";
      ctx.fillRect(6, 7, 19, 9);
      ctx.fillStyle = "#151719";
      ctx.fillRect(7, 19, 17, 5);
    }

    ctx.restore();
  }

  draw(ctx, cameraX, cameraY) {
    for (const o of this.interactables) this.drawObject(ctx, o, cameraX, cameraY);

    const px1 = 858 * CONFIG.TILE - cameraX;
    const px2 = 958 * CONFIG.TILE - cameraX;
    if (px2 > 0 && px1 < ctx.canvas.width) {
      const left = Math.max(0, px1);
      const right = Math.min(ctx.canvas.width, px2);
      const g = ctx.createLinearGradient(left, 0, right, 0);
      g.addColorStop(0, "rgba(126,151,92,.02)");
      g.addColorStop(.55, "rgba(121,147,88,.07)");
      g.addColorStop(1, "rgba(121,147,88,.13)");
      ctx.fillStyle = g;
      ctx.fillRect(left, 0, right-left, ctx.canvas.height);
    }
  }

  drawContamination(ctx, player, cameraX, cameraY) {
    const intensity = this.contaminationIntensity(player);
    if (intensity <= 0) return;

    const alpha = Math.min(.15, intensity * .11);
    ctx.fillStyle = `rgba(115,142,86,${alpha})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.globalAlpha = .25 + intensity * .18;
    ctx.fillStyle = "#a3b879";
    for (let i = 0; i < 22; i++) {
      const x = ((i * 113 + performance.now() * .012 + this.seed) % (ctx.canvas.width + 80)) - 40;
      const y = ((i * 71 + performance.now() * .006) % ctx.canvas.height);
      const r = 1 + (i % 3);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}
