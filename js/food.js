// Stage 31 — comida perecível, cozinha e alimentação.
//
// Regra de projeto: nada aqui pode virar micro-gestão. O jogador tem UM número
// novo para acompanhar ("alimentação") e ele se move devagar. Todo o resto —
// frescor, temperatura de armazenagem, energia da geladeira — acontece sozinho
// e só aparece na interface quando muda a decisão do jogador.

// Estágios de frescor. O rótulo é o que aparece no item; o número é o piso.
const FRESHNESS_STEPS = [
  { min: 78, label: 'FRESCO', tone: '#8a9d65' },
  { min: 46, label: 'BOM', tone: '#a89a5c' },
  { min: 18, label: 'PASSANDO', tone: '#b0793f' },
  { min: 0, label: 'QUASE ESTRAGADO', tone: '#a2574c' }
];

// Multiplicadores de decaimento por tipo de armazenagem.
const FOOD_STORAGE = {
  cold: { rate: 0.16, label: 'GELADEIRA LIGADA' },   // geladeira com energia
  cool: { rate: 0.55, label: 'ARMÁRIO FRIO' },       // geladeira sem energia, porão
  carried: { rate: 1, label: 'MOCHILA' }
};

class FoodSystem {
  constructor({ inventory, survival, structures, building, power, weather, getWorldMinutes }) {
    this.inventory = inventory;
    this.survival = survival;
    this.structures = structures;
    this.building = building;
    this.power = power;
    this.weather = weather;
    this.getWorldMinutes = getWorldMinutes;

    // 0..100. 50 é "comendo o suficiente para não piorar". Sobe com refeições
    // preparadas e variadas, cai sozinho ao longo de alguns dias.
    this.nourishment = 48;
    this.recent = [];            // últimos alimentos distintos, para variedade
    this.malaise = 0;            // segundos de mal-estar depois de comida ruim
    this.lastMinutes = null;
    this.sweepTimer = 0;
    this.onNotice = null;
    this.spoiledSinceNotice = 0;
  }

  /* ------------------------------------------------------------ frescor */

  static perishable(id) {
    const def = ITEM_DEFS[id];
    return Boolean(def && def.perishable);
  }

  shelfHours(id) {
    const def = ITEM_DEFS[id];
    if (!def?.perishable) return Infinity;
    return def.perishable * (def.preserved ? 6 : 1);
  }

  // Todo item perecível começa a vida em 100 e nunca volta a subir.
  ensure(row) {
    if (!row || !FoodSystem.perishable(row.id)) return null;
    if (typeof row.fresh !== 'number' || !Number.isFinite(row.fresh)) row.fresh = 100;
    return row.fresh;
  }

  freshness(row) {
    if (!row) return 100;
    if (!FoodSystem.perishable(row.id)) return 100;
    return typeof row.fresh === 'number' ? Math.max(0, Math.min(100, row.fresh)) : 100;
  }

  step(fresh) {
    return FRESHNESS_STEPS.find(s => fresh >= s.min) || FRESHNESS_STEPS[FRESHNESS_STEPS.length - 1];
  }

  label(row) {
    if (!FoodSystem.perishable(row?.id)) return null;
    return this.step(this.freshness(row)).label;
  }

  // Calor acelera, frio segura. A referência são 18 °C.
  temperatureScale(tempC) {
    const t = Number.isFinite(tempC) ? tempC : 16;
    const scale = t >= 18 ? 1 + (t - 18) * 0.055 : 1 - (18 - t) * 0.028;
    return Math.max(0.3, Math.min(2.6, scale));
  }

  // Onde este container guarda comida: geladeira ligada, geladeira desligada
  // ou prateleira comum.
  containerStorage(container) {
    if (!container) return FOOD_STORAGE.carried;
    if (container.coldStorage) return container.powered ? FOOD_STORAGE.cold : FOOD_STORAGE.cool;
    // Porões e despensas subterrâneas já são naturalmente mais frescos.
    if (container.category === 'kitchen' || container.category === 'farm') return FOOD_STORAGE.cool;
    return FOOD_STORAGE.carried;
  }

  // Geladeiras dependem de energia: um gerador ligado por perto mantém o
  // compressor rodando. Sem energia elas viram apenas uma caixa isolada.
  syncIceboxes() {
    if (!this.building || !this.structures) return;
    const boxes = this.building.objects.filter(o => o.type === 'icebox' && o.health > 0);
    if (!boxes.length) return;
    for (const box of boxes) {
      const container = this.structures.containers.find(c => c.builtObjectId === box.id);
      if (!container) continue;
      const powered = Boolean(this.power?.poweredAt?.(this.building.center(box)));
      box.powered = powered;
      container.coldStorage = true;
      container.powered = powered;
    }
  }

  // Um decaimento por varredura, com o tempo de jogo decorrido como base.
  decayRow(row, minutes, storage, ambientTemp) {
    const def = ITEM_DEFS[row.id];
    if (!def?.perishable) return 0;
    this.ensure(row);
    const hours = minutes / 60;
    const perHour = 100 / this.shelfHours(row.id);
    const rate = perHour * storage.rate * this.temperatureScale(ambientTemp);
    row.fresh = Math.max(0, row.fresh - hours * rate);
    return row.fresh;
  }

  // Comida no zero vira comida estragada — que ainda serve de adubo.
  rot(row) {
    const qty = Math.max(1, Math.floor(row.qty));
    row.id = 'spoiled_food';
    row.qty = Math.max(1, Math.round(qty * 0.75));
    row.fresh = undefined;
    row.durability = null;
    return qty;
  }

  update(dt, ambientTemp) {
    const minutes = this.getWorldMinutes();
    if (this.lastMinutes == null) this.lastMinutes = minutes;
    const elapsed = Math.max(0, minutes - this.lastMinutes);

    this.malaise = Math.max(0, this.malaise - dt);
    // A alimentação escorre sozinha: cerca de 30 pontos por dia de jogo.
    this.nourishment = Math.max(0, Math.min(100, this.nourishment - dt * 0.17));

    this.sweepTimer -= dt;
    if (this.sweepTimer > 0 && elapsed < 45) return;
    this.sweepTimer = 1.6;
    this.lastMinutes = minutes;
    if (elapsed <= 0) return;

    this.syncIceboxes();
    const temp = Number.isFinite(ambientTemp) ? ambientTemp : (this.weather?.ambientTemp ?? 16);
    let rotted = 0;

    // Mochila: o corpo do sobrevivente é o pior lugar possível para guardar carne.
    for (let i = this.inventory.entries.length - 1; i >= 0; i--) {
      const entry = this.inventory.entries[i];
      if (!FoodSystem.perishable(entry.id)) continue;
      if (this.decayRow(entry, elapsed, FOOD_STORAGE.carried, temp) <= 0) {
        rotted += this.rot(entry);
      }
    }

    // Containers do mundo, incluindo geladeiras e armários construídos.
    for (const container of this.structures?.containers || []) {
      if (!container.loot?.length) continue;
      const storage = this.containerStorage(container);
      for (let i = container.loot.length - 1; i >= 0; i--) {
        const row = container.loot[i];
        if (!FoodSystem.perishable(row.id)) continue;
        if (this.decayRow(row, elapsed, storage, temp) <= 0) {
          this.rot(row);
          rotted++;
        }
      }
    }

    if (rotted) {
      this.spoiledSinceNotice += rotted;
      if (this.spoiledSinceNotice >= 1) {
        this.onNotice?.('Parte da comida estragou', 'warn');
        this.spoiledSinceNotice = 0;
      }
    }
  }

  /* ---------------------------------------------------- transferências */

  // Mistura o frescor de uma remessa no estoque que o jogador já tem, pesando
  // pela quantidade. Evita que guardar um pedaço velho num lote novo "cure" o
  // lote, e evita obrigar o jogador a rastrear cada pedaço.
  blendInto(target, qty, incomingFresh) {
    if (!target || !FoodSystem.perishable(target.id)) return;
    this.ensure(target);
    const incoming = Math.max(0, Math.min(100, incomingFresh ?? 100));
    const have = Math.max(0, target.qty - qty);
    if (have <= 0) { target.fresh = incoming; return; }
    target.fresh = (target.fresh * have + incoming * qty) / (have + qty);
  }

  blendIntoInventory(id, qty, incomingFresh) {
    if (!qty || !FoodSystem.perishable(id)) return;
    const entry = this.inventory.entries.find(e => e.id === id);
    this.blendInto(entry, qty, incomingFresh);
  }

  /* ------------------------------------------------------- alimentação */

  // Comer a mesma coisa cinco vezes seguidas alimenta menos. Três refeições
  // distintas de memória são o bastante para premiar variedade sem virar
  // planilha nutricional.
  varietyScale(id) {
    const seen = this.recent.filter(v => v === id).length;
    return seen >= 3 ? 0.4 : seen === 2 ? 0.62 : seen === 1 ? 0.84 : 1;
  }

  rememberMeal(id) {
    if (!(ITEM_DEFS[id]?.nutrition > 0)) return;
    this.recent.push(id);
    while (this.recent.length > 4) this.recent.shift();
  }

  // Chamado pelo useItem antes de consumir: devolve o que aquela porção
  // realmente vale e se ela vai cair mal.
  evaluate(id, row) {
    const def = ITEM_DEFS[id];
    if (!def) return null;
    const fresh = this.freshness(row);
    const perishable = FoodSystem.perishable(id);
    // Frescor puxa o valor nutricional para baixo, nunca abaixo de 45%.
    const potency = perishable ? 0.45 + (fresh / 100) * 0.55 : 1;
    const rawRisk = def.raw ? 0.34 : 0;
    const spoilRisk = perishable && fresh < 32 ? (32 - fresh) / 32 * 0.55 : 0;
    return {
      def, fresh, potency,
      hunger: Math.round((def.hunger || 0) * potency),
      thirst: Math.round((def.thirst || 0) * (def.thirst > 0 ? potency : 1)),
      nutrition: (def.nutrition || 0) * potency * this.varietyScale(id),
      warm: Boolean(def.warm),
      risk: Math.min(0.8, rawRisk + spoilRisk)
    };
  }

  // Aplica o efeito da refeição. A fome/sede em si ficam com o Survival; aqui
  // mora só a camada longa: alimentação, calor da refeição e mal-estar.
  consume(id, row, rng = Math.random) {
    const info = this.evaluate(id, row);
    if (!info) return null;
    this.rememberMeal(id);
    this.nourishment = Math.max(0, Math.min(100, this.nourishment + info.nutrition * 8.5));

    if (info.warm) {
      this.survival.bodyTemp = Math.min(38.4, this.survival.bodyTemp + 0.32);
      this.survival.wetness = Math.max(0, this.survival.wetness - 7);
    }

    let sick = false;
    if (info.risk > 0 && rng() < info.risk) {
      sick = true;
      this.malaise = Math.max(this.malaise, 42);
      this.survival.health = Math.max(1, this.survival.health - 7);
      this.survival.energy = Math.max(0, this.survival.energy - 18);
      this.nourishment = Math.max(0, this.nourishment - 9);
    }
    return { ...info, sick };
  }

  /* ---------------------------------------------------------- efeitos */

  state() {
    const n = this.nourishment;
    if (n >= 78) return { key: 'strong', label: 'BEM ALIMENTADO', tone: '#8a9d65' };
    if (n >= 52) return { key: 'ok', label: 'ALIMENTADO', tone: '#9a9a6a' };
    if (n >= 28) return { key: 'low', label: 'MAL ALIMENTADO', tone: '#b0793f' };
    return { key: 'bad', label: 'DESNUTRIDO', tone: '#a2574c' };
  }

  // Um único lugar traduz "alimentação" em números que o resto do jogo usa.
  modifiers() {
    const t = (this.nourishment - 50) / 50;             // -1 .. +1
    const malaise = this.malaise > 0 ? 0.62 : 1;
    return {
      hungerScale: Math.max(0.74, 1 - t * 0.26),        // bem alimentado economiza fome
      recoveryScale: Math.max(0.55, 1 + t * 0.22) * malaise,
      insulationBonus: Math.max(-3, t * 5),             // calorias viram calor
      healthRegen: t > 0.4 && this.malaise <= 0 ? 0.35 : 0,
      malaise: this.malaise > 0
    };
  }

  // Regeneração lenta só existe quando o sobrevivente está realmente comendo
  // bem — é a recompensa de manter uma cozinha funcionando.
  applyRegen(dt) {
    const mod = this.modifiers();
    if (mod.healthRegen <= 0) return;
    if (this.survival.hunger < 45 || this.survival.thirst < 35) return;
    this.survival.health = Math.min(this.survival.maxHealth, this.survival.health + dt * mod.healthRegen);
  }

  /* -------------------------------------------------------- persistência */

  exportState() {
    return { version: 1, nourishment: this.nourishment, recent: [...this.recent], malaise: this.malaise, lastMinutes: this.lastMinutes };
  }

  importState(data) {
    if (!data || data.version !== 1) return false;
    this.nourishment = Number.isFinite(data.nourishment) ? data.nourishment : 48;
    this.recent = Array.isArray(data.recent) ? data.recent.slice(-4) : [];
    this.malaise = data.malaise || 0;
    this.lastMinutes = Number.isFinite(data.lastMinutes) ? data.lastMinutes : null;
    return true;
  }
}
