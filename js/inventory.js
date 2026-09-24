class Inventory {
  constructor(maxWeight = CONFIG.MAX_CARRY_WEIGHT) {
    this.maxWeight = maxWeight;
    // Stage 30: worn packs add temporary carrying capacity without corrupting
    // permanent upgrades saved in maxWeight.
    this.bonusWeight = 0;
    this.entries = [];
    this.uidCounter = 1;
  }

  def(id) {
    return ITEM_DEFS[id];
  }

  capacity() {
    return Math.max(1, this.maxWeight + (this.bonusWeight || 0));
  }

  setBonusWeight(value = 0) {
    this.bonusWeight = Math.max(0, Number(value) || 0);
    return this.capacity();
  }

  totalWeight() {
    return this.entries.reduce((sum, entry) => {
      const def = this.def(entry.id);
      return sum + (def ? def.weight * entry.qty : 0);
    }, 0);
  }

  canAdd(id, qty = 1) {
    const def = this.def(id);
    if (!def) return false;
    return this.totalWeight() + def.weight * qty <= this.capacity() * 1.35;
  }

  add(id, qty = 1) {
    const def = this.def(id);
    if (!def || qty <= 0) return 0;

    let added = 0;

    if (def.stackable) {
      let entry = this.entries.find(e => e.id === id);
      if (!entry) {
        entry = { uid: this.uidCounter++, id, qty: 0, durability: null };
        this.entries.push(entry);
      }

      while (qty > 0 && entry.qty < def.maxStack && this.canAdd(id, 1)) {
        entry.qty += 1;
        qty -= 1;
        added += 1;
      }
    } else {
      while (qty > 0 && this.canAdd(id, 1)) {
        this.entries.push({
          uid: this.uidCounter++,
          id,
          qty: 1,
          durability: def.maxDurability || null
        });
        qty -= 1;
        added += 1;
      }
    }

    return added;
  }

  addEntryData(id, qty = 1, data = {}) {
    const def = this.def(id);
    if (!def || qty <= 0) return 0;
    if (def.stackable) return this.add(id, qty);
    let added = 0;
    while (qty > 0 && this.canAdd(id, 1)) {
      this.entries.push({
        uid: this.uidCounter++, id, qty: 1,
        durability: data.durability != null ? data.durability : (def.maxDurability || null)
      });
      qty--; added++;
    }
    return added;
  }

  removeUid(uid) {
    const index = this.entries.findIndex(e => e.uid === uid);
    if (index < 0) return null;
    return this.entries.splice(index, 1)[0] || null;
  }

  entry(uid) {
    return this.entries.find(e => e.uid === uid) || null;
  }

  count(id) {
    return this.entries
      .filter(e => e.id === id)
      .reduce((sum, e) => sum + e.qty, 0);
  }

  first(id) {
    return this.entries.find(e => e.id === id) || null;
  }

  remove(id, qty = 1) {
    let remaining = qty;

    for (let i = this.entries.length - 1; i >= 0 && remaining > 0; i--) {
      const entry = this.entries[i];
      if (entry.id !== id) continue;

      const take = Math.min(entry.qty, remaining);
      entry.qty -= take;
      remaining -= take;

      if (entry.qty <= 0) this.entries.splice(i, 1);
    }

    return qty - remaining;
  }

  damageTool(id, amount = 1) {
    const entry = this.entries.find(e => e.id === id && e.durability != null);
    if (!entry) return { exists: false, broke: false };

    entry.durability = Math.max(0, entry.durability - amount);

    if (entry.durability <= 0) {
      this.entries = this.entries.filter(e => e.uid !== entry.uid);
      return { exists: true, broke: true };
    }

    return { exists: true, broke: false, durability: entry.durability };
  }

  durability(id) {
    const entry = this.entries.find(e => e.id === id && e.durability != null);
    if (!entry) return null;
    const def = this.def(id);
    return { current: entry.durability, max: def.maxDurability };
  }

  repairTool(id, amount = 1) {
    const entry = this.entries.find(e => e.id === id && e.durability != null);
    const def = this.def(id);
    if (!entry || !def?.maxDurability) return { exists: false, restored: 0 };
    const before = entry.durability;
    entry.durability = Math.min(def.maxDurability, entry.durability + Math.max(0, amount));
    return { exists: true, restored: entry.durability - before, durability: entry.durability, max: def.maxDurability };
  }

  list() {
    return [...this.entries].sort((a, b) => {
      const da = this.def(a.id);
      const db = this.def(b.id);
      const order = { currency: 0, firearm: 1, ammo: 2, tool: 3, light: 4, clothing: 5, medical: 6, food: 7, drink: 8, seed: 9, container: 10, component: 11, material: 12, key: 13, blueprint: 14 };
      return (order[da.category] ?? 9) - (order[db.category] ?? 9) || da.name.localeCompare(db.name);
    });
  }
}
