// Stage 32 — modos de jogo e saves em slots.
//
// Duas ideias separadas moram aqui:
//   GAME_MODES  — o que o mundo cobra de você. Sobrevivência é o jogo inteiro;
//                 Modo Livre desliga fome, perigo e custo de material para que
//                 a construção seja a única coisa que resta.
//   SaveSlots   — três slots nomeados mais um autosave, cada um guardando o
//                 modo e um resumo legível, para a tela inicial poder mostrar
//                 "DIA 14 · MODO LIVRE" sem carregar 480 KB de mundo.

const GAME_MODES = {
  survival: {
    id: 'survival',
    name: 'SOBREVIVÊNCIA',
    tagline: 'O condado inteiro, do jeito que ele é.',
    description: 'Fome, sede, frio, infectados, saque e uma base para erguer do zero.',
    // Regras que o resto do jogo consulta em vez de perguntar "é criativo?".
    rules: {
      survivalDrain: true,      // fome, sede, sono, temperatura
      canDie: true,
      infected: true,
      materialCost: true,       // construir e colocar bloco consome item
      instantMining: false,
      flight: false,
      reachBonus: 0,
      creativePalette: false
    }
  },
  free: {
    id: 'free',
    name: 'MODO CRIATIVO',
    tagline: 'Só você, o condado e todos os blocos.',
    description: 'Sem fome, sem perigo e sem custo. Voo livre, quebra instantânea e a paleta completa de materiais e construções.',
    rules: {
      survivalDrain: false,
      canDie: false,
      infected: false,
      materialCost: false,
      instantMining: true,
      flight: true,
      reachBonus: 4,
      creativePalette: true
    }
  }
};

function gameModeDef(id) {
  return GAME_MODES[id] || GAME_MODES.survival;
}

class SaveSlots {
  static SLOT_IDS = ['slot1', 'slot2', 'slot3'];
  static AUTO_ID = 'auto';
  static LEGACY_KEY = 'last-county-stage22-slot1';
  static PENDING_KEY = 'lc_pending_load';
  static NEW_KEY = 'lc_pending_new_game';

  static key(id, mode = 'survival') {
    return `lc_save_${mode === 'free' ? 'free' : 'survival'}_${id}`;
  }

  static store() {
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (_) { return null; }
  }

  static all() { return [...this.SLOT_IDS, this.AUTO_ID]; }
  static modes() { return ['survival', 'free']; }

  static label(id) {
    return id === this.AUTO_ID ? 'AUTOSAVE' : `SLOT ${this.SLOT_IDS.indexOf(id) + 1}`;
  }

  // O save antigo de slot único vira o Slot 1 na primeira execução, para que
  // ninguém perca uma partida ao atualizar.
  static migrateLegacy() {
    const store = this.store();
    if (!store) return false;
    try {
      const legacy = store.getItem(this.LEGACY_KEY);
      let changed = false;
      if (legacy) {
        if (!store.getItem(this.key('slot1','survival'))) store.setItem(this.key('slot1','survival'), legacy);
        store.removeItem(this.LEGACY_KEY);changed = true;
      }
      for (const id of this.all()) {
        const oldKey = id === this.AUTO_ID ? 'lc_save_auto' : `lc_save_${id}`;
        const old = store.getItem(oldKey);
        if (old && !store.getItem(this.key(id,'survival'))) store.setItem(this.key(id,'survival'), old);
        if (old) { store.removeItem(oldKey); changed = true; }
      }
      return changed;
    } catch (_) { return false; }
  }

  static read(id, mode = 'survival') {
    const store = this.store();
    if (!store) return null;
    try {
      const raw = store.getItem(this.key(id, mode));
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data && SaveGameSystem.isSupported(data.version) ? data : null;
    } catch (_) { return null; }
  }

  static write(id, data, mode = data?.mode || 'survival') {
    const store = this.store();
    if (!store) return { ok: false, reason: 'Armazenamento local indisponível' };
    try {
      store.setItem(this.key(id, mode), JSON.stringify(data));
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: e?.name === 'QuotaExceededError' ? 'Sem espaço no navegador para salvar' : (e?.message || 'Falha ao salvar') };
    }
  }

  static erase(id, mode = 'survival') {
    const store = this.store();
    if (!store) return false;
    try { store.removeItem(this.key(id, mode)); return true; } catch (_) { return false; }
  }

  // Resumo barato para a tela inicial: lê o JSON uma vez e devolve só o que a
  // lista precisa mostrar.
  static summary(id, mode = 'survival') {
    const data = this.read(id, mode);
    if (!data) return { id, mode, label: this.label(id), empty: true };
    const minutes = data.worldMinutes || 0;
    return {
      id,
      label: this.label(id),
      empty: false,
      seed: data.seed,
      version: data.version,
      mode: data.mode || mode,
      modeName: gameModeDef(data.mode).name,
      day: Math.floor(minutes / 1440) + 1,
      clock: `${String(Math.floor((minutes % 1440) / 60)).padStart(2, '0')}:${String(Math.floor(minutes % 60)).padStart(2, '0')}`,
      area: data.areaName || '—',
      deaths: data.deathCount || 0,
      savedAt: data.savedAt || 0
    };
  }

  static list(mode = 'survival') { return this.all().map(id => this.summary(id, mode)); }

  static newest(mode = null) {
    const rows = (mode ? this.list(mode) : this.modes().flatMap(m => this.list(m))).filter(r => !r.empty);
    if (!rows.length) return null;
    rows.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    return rows[0];
  }

  /* --------------------------------------------------------- recarga */

  // Cada save guarda a semente que gerou o mundo. Carregar um slot de outra
  // semente exige regenerar o terreno inteiro, e a forma honesta de fazer isso
  // é recarregar a página anotando qual slot abrir.
  static setPending(id, mode = 'survival') {
    const store = this.store();
    if (!store) return false;
    try { store.setItem(this.PENDING_KEY, JSON.stringify({id,mode})); return true; } catch (_) { return false; }
  }

  static takePending() {
    const store = this.store();
    if (!store) return null;
    try {
      const raw = store.getItem(this.PENDING_KEY);
      if (raw) store.removeItem(this.PENDING_KEY);
      if (!raw) return null;
      let row;try{row=JSON.parse(raw);}catch(_){row={id:raw,mode:'survival'};}
      return this.all().includes(row.id)?{id:row.id,mode:row.mode==='free'?'free':'survival'}:null;
    } catch (_) { return null; }
  }

  static setNew(id, mode='survival') {
    const store=this.store();if(!store)return false;
    try{store.setItem(this.NEW_KEY,JSON.stringify({id,mode}));return true;}catch(_){return false;}
  }

  static takeNew() {
    const store=this.store();if(!store)return null;
    try{const raw=store.getItem(this.NEW_KEY);if(raw)store.removeItem(this.NEW_KEY);if(!raw)return null;const row=JSON.parse(raw);return this.SLOT_IDS.includes(row.id)?{id:row.id,mode:row.mode==='free'?'free':'survival'}:null;}catch(_){return null;}
  }
}
