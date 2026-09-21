// Objectives are not a quest log — they are the goals the world hands you.
// Each one stays hidden until something in play makes it relevant (an empty
// canteen, a locked door you cannot open, a truck with no fuel), then tracks
// itself until it is solved.

const OBJECTIVE_DEFS = [
  {
    id: 'water', title: 'Conseguir água', category: 'survival',
    hint: 'Garrafas cheias, uma nascente ou um riacho.',
    reveal: c => c.survival.thirst < 70 || c.count('water_bottle') === 0,
    done: c => c.count('water_bottle') >= 2,
    progress: c => `${c.count('water_bottle')}/2 garrafas`
  },
  {
    id: 'food', title: 'Estocar comida', category: 'survival',
    hint: 'Cozinhas, mercados e arbustos de bagas.',
    reveal: c => c.survival.hunger < 70,
    done: c => c.foodCount() >= 3,
    progress: c => `${c.foodCount()}/3 rações`
  },
  {
    id: 'cook_first_meal', title: 'Cozinhar em vez de só achar comida', category: 'survival',
    hint: 'Uma fogueira já assa carne e batata. Um fogão abre o resto da cozinha.',
    reveal: c => c.count('raw_meat') > 0 || c.count('raw_small_game') > 0 || c.count('potato') > 0,
    done: c => c.cookedCount() > 0,
    progress: c => c.cookedCount() > 0 ? 'refeição pronta' : 'asse no fogo'
  },
  {
    id: 'keep_food', title: 'Guardar comida antes que estrague', category: 'survival',
    hint: 'Carne seca e conserva duram meses. Uma geladeira ligada segura o resto.',
    reveal: c => c.flag('food_spoiled') || c.count('spoiled_food') > 0,
    done: c => c.preservedCount() >= 3 || c.hasBuilt('icebox'),
    progress: c => c.hasBuilt('icebox') ? 'geladeira instalada' : `${c.preservedCount()}/3 conservas`
  },
  {
    id: 'start_garden', title: 'Plantar a primeira horta', category: 'base',
    hint: 'Sementes vêm de fazendas, mercados e da própria colheita.',
    reveal: c => c.hasSeeds(),
    done: c => c.flag('harvested_crop'),
    progress: c => c.hasBuilt('garden_plot') ? 'canteiro pronto — plante e regue' : 'construa um canteiro'
  },
  {
    id: 'hunt_game', title: 'Caçar para comer', category: 'survival',
    hint: 'Coelho e veado aparecem no campo. Uma lâmina aproveita o animal abatido.',
    reveal: c => c.survival.hunger < 60 && c.foodCount() < 3,
    done: c => c.flag('butchered_game'),
    progress: c => c.flag('butchered_game') ? 'caça abatida' : 'abata e aproveite um animal'
  },
  {
    id: 'winter_clothes', title: 'Se preparar para o frio', category: 'gear',
    hint: 'Couro curtido no varal vira o casaco mais quente que a base produz.',
    reveal: c => c.coldOutside(),
    done: c => c.survival.bodyTemp > 36.4 && c.warmEnough(),
    progress: c => c.warmEnough() ? 'agasalhado' : 'isolamento insuficiente para esta temperatura'
  },
  {
    id: 'tool', title: 'Arrumar uma ferramenta de verdade', category: 'gear',
    hint: 'Oficinas, galpões e caixas de ferramentas.',
    reveal: () => true,
    done: c => c.count('stone_pickaxe') > 0 || c.count('stone_axe') > 0,
    progress: () => 'picareta ou machado'
  },
  {
    id: 'progress_salvage', title: 'Sair do improviso', category: 'progress',
    hint: 'Sucata, ferramentas e uma oficina colocam você no primeiro degrau.',
    reveal: () => true,
    done: c => (c.progression?.tier || 0) >= 1,
    progress: c => (c.progression?.tier || 0) >= 1 ? 'T1 alcançado' : 'encontre sucata / oficina'
  },
  {
    id: 'progress_metal', title: 'Dominar a metalurgia', category: 'progress',
    hint: 'Ferro bruto + uma fornalha abrem aço e ferramentas reforçadas.',
    reveal: c => (c.progression?.tier || 0) >= 1,
    done: c => (c.progression?.tier || 0) >= 2,
    progress: c => `T${c.progression?.tier || 0} → T2`
  },
  {
    id: 'progress_industrial', title: 'Entrar na era industrial', category: 'progress',
    hint: 'Cobre, quartzo e componentes elétricos conectam mineração à tecnologia.',
    reveal: c => (c.progression?.tier || 0) >= 2,
    done: c => (c.progression?.tier || 0) >= 3,
    progress: c => `T${c.progression?.tier || 0} → T3`
  },
  {
    id: 'progress_emergency', title: 'Recuperar equipamento profissional', category: 'progress',
    hint: 'Delegacia e Bombeiros guardam equipamentos que casas comuns não têm.',
    reveal: c => (c.progression?.tier || 0) >= 3,
    done: c => (c.progression?.tier || 0) >= 4,
    progress: c => `T${c.progression?.tier || 0} → T4`
  },
  {
    id: 'progress_blackridge', title: 'Preparar-se para Blackridge', category: 'progress',
    hint: 'O último degrau está nos setores restritos do complexo.',
    reveal: c => (c.progression?.tier || 0) >= 4,
    done: c => (c.progression?.tier || 0) >= 5,
    progress: c => `T${c.progression?.tier || 0} → T5`
  },
  {
    id: 'mining_first_vein', title: 'Encontrar um veio de minério', category: 'mining',
    hint: 'Pedreiras, cavernas e galerias profundas escondem os primeiros veios.',
    reveal: c => (c.progression?.tier || 0) >= 1,
    done: c => (c.mining?.blocksMined || 0) > 0 && (c.mining?.discovered?.size || 0) > 0,
    progress: c => `${c.mining?.discovered?.size || 0} minerais conhecidos`
  },
  {
    id: 'mining_deep', title: 'Descer até a geologia profunda', category: 'mining',
    hint: 'Quartzo e níquel aparecem mais fundo. Uma picareta reforçada muda a expedição.',
    reveal: c => c.mining?.discovered?.has('iron_ore') || c.mining?.discovered?.has('copper_ore'),
    done: c => c.mining?.discovered?.has('nickel_ore') || c.mining?.discovered?.has('crystal_shard'),
    progress: c => `profundidade máxima ${c.mining?.deepestDepth || 0}`
  },
  {
    id: 'mining_industrial', title: 'Montar mineração industrial', category: 'mining',
    hint: 'Níquel, cristal e liga industrial levam à picareta industrial.',
    reveal: c => c.mining?.discovered?.has('nickel_ore'),
    done: c => c.count('industrial_pickaxe') > 0,
    progress: c => c.count('industrial_pickaxe') ? 'picareta industrial pronta' : 'fabrique uma picareta industrial'
  },
  {
    id: 'mining_blackridge', title: 'Extrair material de Blackridge', category: 'mining',
    hint: 'As camadas mais profundas do leste escondem um material que ferramentas comuns não abrem.',
    reveal: c => (c.progression?.tier || 0) >= 4,
    done: c => c.mining?.discovered?.has('blackridge_mineral'),
    progress: c => c.count('containment_cutter') ? 'procure as camadas de contenção' : 'ferramenta M4 necessária'
  },
  {
    id: 'crowbar', title: 'Encontrar um pé de cabra', category: 'gear',
    hint: 'Portas trancadas e tapumes cedem com ele.',
    reveal: c => c.flag('saw_locked_door'),
    done: c => c.count('crowbar') > 0
  },
  {
    id: 'shelter', title: 'Montar um ponto de apoio', category: 'base',
    hint: 'Uma bancada e uma fogueira já mudam tudo.',
    reveal: c => c.day >= 1,
    done: c => c.hasBuilt('workbench') && (c.hasBuilt('campfire') || c.hasBuilt('crate')),
    progress: c => `${(c.hasBuilt('workbench') ? 1 : 0) + (c.hasBuilt('campfire') || c.hasBuilt('crate') ? 1 : 0)}/2 estruturas`
  },
  {
    id: 'power', title: 'Restaurar energia em algum lugar', category: 'world',
    hint: 'Um gerador com combustível acorda portões e terminais.',
    reveal: c => c.flag('saw_dead_power'),
    done: c => c.places.poweredAreas.size > 0
  },
  {
    id: 'fuel', title: 'Conseguir combustível', category: 'vehicle',
    hint: 'Postos, oficinas e galões esquecidos.',
    reveal: c => c.flag('saw_empty_vehicle'),
    done: c => c.count('fuel_can') > 0
  },
  {
    id: 'battery', title: 'Conseguir uma bateria', category: 'vehicle',
    hint: 'Oficinas e carros abandonados.',
    reveal: c => c.flag('saw_dead_battery'),
    done: c => c.count('battery') > 0
  },
  {
    id: 'drive', title: 'Deixar um veículo rodando', category: 'vehicle',
    hint: 'Combustível, bateria e condição acima de 20%.',
    reveal: c => c.flag('saw_vehicle'),
    done: c => c.vehicles.vehicles.some(v => v.fuel > 1 && v.battery > 5 && v.condition >= 20)
  },
  {
    id: 'backpack', title: 'Ampliar a mochila', category: 'gear',
    hint: 'Uma armação reforçada aumenta o que você carrega.',
    reveal: c => c.flag('was_overweight'),
    done: c => c.inventory.maxWeight > CONFIG.MAX_CARRY_WEIGHT
  },
  {
    id: 'evidence', title: 'Entrar na sala de evidências', category: 'explore',
    hint: 'A chave costuma estar com quem trabalhava ali.',
    reveal: c => c.flag('saw_evidence_door'),
    done: c => c.places.flags.has('evidence_opened')
  },
  {
    id: 'blackridge_lead', title: 'Descobrir o que é Blackridge', category: 'story',
    hint: 'Registros espalhados pelo condado contam a história.',
    reveal: c => c.lore.documentsFound().length >= 1,
    done: c => c.lore.documentsFound().length >= 3,
    progress: c => `${c.lore.documentsFound().length}/3 registros`
  },
  {
    id: 'blackridge_access', title: 'Entrar no complexo Blackridge', category: 'story',
    hint: 'Cartão de acesso, três registros e proteção contra contaminação.',
    reveal: c => c.lore.documentsFound().length >= 3 || c.count('blackridge_keycard') > 0,
    done: c => c.lore.enteredBunker
  },
  {
    id: 'truth', title: 'Decidir o destino do arquivo', category: 'story',
    hint: 'O terminal central ainda transmite.',
    reveal: c => c.lore.enteredBunker,
    done: c => Boolean(c.lore.archiveChoice)
  }
];

class ObjectiveSystem {
  constructor(deps) {
    this.deps = deps;
    this.state = new Map();            // id -> 'active' | 'done'
    this.flags = new Set();
    this.recent = [];                  // toasts for newly revealed/completed goals
    this.timer = 0;
  }

  flag(name) {
    if (this.flags.has(name)) return false;
    this.flags.add(name);
    return true;
  }

  context() {
    const d = this.deps;
    return {
      ...d,
      day: Math.floor(d.getWorldMinutes() / 1440) + 1,
      count: id => d.inventory.count(id),
      foodCount: () => d.inventory.entries.reduce((n, e) => {
        const def = ITEM_DEFS[e.id];
        return n + (def && (def.category === 'food') ? e.qty : 0);
      }, 0),
      flag: name => this.flags.has(name),
      hasBuilt: type => d.building.objects.some(o => o.type === type),
      cookedCount: () => d.inventory.entries.reduce((n, e) => {
        const def = ITEM_DEFS[e.id];
        return n + (def?.category === 'food' && def.nutrition >= 1 && !def.raw ? e.qty : 0);
      }, 0),
      preservedCount: () => d.inventory.entries.reduce((n, e) => {
        return n + (ITEM_DEFS[e.id]?.preserved ? e.qty : 0);
      }, 0),
      hasSeeds: () => d.inventory.entries.some(e => ITEM_DEFS[e.id]?.category === 'seed'),
      coldOutside: () => (d.weather?.ambientTemp ?? 16) < 4,
      warmEnough: () => (d.clothingStats?.().insulation ?? 0) >= 28
    };
  }

  update(dt) {
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = 0.6;

    const ctx = this.context();
    for (const def of OBJECTIVE_DEFS) {
      const current = this.state.get(def.id);
      if (current === 'done') continue;
      if (!current) {
        if (def.reveal(ctx) && !def.done(ctx)) {
          this.state.set(def.id, 'active');
          this.recent.push({ kind: 'new', title: def.title });
        }
        continue;
      }
      if (def.done(ctx)) {
        this.state.set(def.id, 'done');
        this.recent.push({ kind: 'done', title: def.title });
      }
    }
  }

  active() {
    const ctx = this.context();
    return OBJECTIVE_DEFS
      .filter(d => this.state.get(d.id) === 'active')
      .map(d => ({ ...d, text: d.progress ? d.progress(ctx) : d.hint }));
  }

  completedCount() {
    let n = 0;
    for (const v of this.state.values()) if (v === 'done') n++;
    return n;
  }

  takeRecent() {
    const out = this.recent;
    this.recent = [];
    return out;
  }
}
