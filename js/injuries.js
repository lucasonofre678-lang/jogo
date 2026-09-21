class InjurySystem {
  constructor(seed = 1) {
    this.seed = seed >>> 0;
    this.counter = 0;
    this.parts = {
      head: [],
      torso: [],
      leftArm: [],
      rightArm: [],
      leftLeg: [],
      rightLeg: []
    };
  }

  reset() {
    for (const key of Object.keys(this.parts)) this.parts[key] = [];
  }

  all() {
    return Object.entries(this.parts).flatMap(([part, wounds]) => wounds.map(w => ({...w, part})));
  }

  bleedingRate() {
    return this.all().reduce((sum, w) => sum + (w.bleeding && !w.bandaged ? w.bleedRate : 0), 0);
  }

  infectionRisk() {
    const wounds = this.all();
    if (!wounds.length) return 0;
    return wounds.reduce((sum, w) => sum + w.infectionRisk, 0) / wounds.length;
  }

  addFromHit(damage) {
    this.counter += 1;
    const keys = Object.keys(this.parts);
    const part = keys[(this.counter * 7 + damage * 3 + this.seed) % keys.length];
    const heavy = damage >= 16;
    const wound = {
      id: `${part}-${this.counter}`,
      type: heavy ? "ferimento profundo" : "ferimento leve",
      severity: heavy ? 2 : 1,
      bleeding: damage >= 12,
      bleedRate: heavy ? .46 : .22,
      bandaged: false,
      infectionRisk: heavy ? 22 : 10
    };
    this.parts[part].push(wound);
    return { part, wound };
  }

  bandage() {
    const candidates = this.all()
      .filter(w => w.bleeding && !w.bandaged)
      .sort((a,b) => b.bleedRate - a.bleedRate);

    if (!candidates.length) return null;
    const target = candidates[0];
    const real = this.parts[target.part].find(w => w.id === target.id);
    real.bandaged = true;
    real.bleeding = false;
    real.infectionRisk = Math.max(0, real.infectionRisk - 3);
    return target;
  }

  disinfect() {
    const wounds = this.all().sort((a,b) => b.infectionRisk - a.infectionRisk);
    if (!wounds.length) return null;
    const target = wounds[0];
    const real = this.parts[target.part].find(w => w.id === target.id);
    real.infectionRisk = Math.max(0, real.infectionRisk - 35);
    return target;
  }

  healOne() {
    const wounds = this.all().sort((a,b) => b.severity - a.severity);
    if (!wounds.length) return null;
    const target = wounds[0];
    const list = this.parts[target.part];
    const idx = list.findIndex(w => w.id === target.id);
    if (idx >= 0) {
      if (list[idx].severity > 1) list[idx].severity -= 1;
      else list.splice(idx, 1);
    }
    return target;
  }

  update(dt, survival) {
    const bleed = this.bleedingRate();
    if (bleed > 0) {
      survival.health = Math.max(0, survival.health - bleed * dt);
      survival.energy = Math.max(0, survival.energy - bleed * .14 * dt);
    }

    // Risk slowly rises on untreated wounds, but this is kept non-graphic and abstract.
    for (const [part, wounds] of Object.entries(this.parts)) {
      for (const wound of wounds) {
        if (!wound.bandaged) wound.infectionRisk = Math.min(100, wound.infectionRisk + dt * .025);
      }
    }
  }

  partName(part) {
    return {
      head: "Cabeça",
      torso: "Torso",
      leftArm: "Braço E.",
      rightArm: "Braço D.",
      leftLeg: "Perna E.",
      rightLeg: "Perna D."
    }[part] || part;
  }

  summary() {
    return Object.entries(this.parts).map(([part, wounds]) => {
      if (!wounds.length) return { part, name:this.partName(part), status:"OK", bleeding:false, risk:0 };
      const bleeding = wounds.some(w => w.bleeding && !w.bandaged);
      const risk = Math.round(wounds.reduce((s,w)=>s+w.infectionRisk,0)/wounds.length);
      return {
        part,
        name:this.partName(part),
        status: bleeding ? "SANGRANDO" : wounds.some(w=>w.bandaged) ? "TRATADO" : "FERIDO",
        bleeding,
        risk
      };
    });
  }
}
