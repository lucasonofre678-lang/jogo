class Survival {
  constructor() {
    this.health = 100;
    this.maxHealth = 100;
    this.hunger = 86;
    this.thirst = 82;
    this.energy = 100;
    this.maxEnergy = 100;

    this.sleep = 92;
    this.maxSleep = 100;
    this.bodyTemp = 36.8;
    this.wetness = 0;
  }

  clampAll() {
    this.health = Math.max(0, Math.min(this.maxHealth, this.health));
    this.hunger = Math.max(0, Math.min(100, this.hunger));
    this.thirst = Math.max(0, Math.min(100, this.thirst));
    this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy));
    this.sleep = Math.max(0, Math.min(this.maxSleep, this.sleep));
    this.wetness = Math.max(0, Math.min(100, this.wetness));
    this.bodyTemp = Math.max(32, Math.min(41, this.bodyTemp));
  }

  update(dt, movement, environment = {}) {
    const exertion = movement.sprinting ? 1.75 : movement.crouching && movement.moving ? 0.95 : movement.moving ? 1.15 : 1;
    // Stage 31: comer bem economiza calorias; comer mal acelera a fome.
    this.hunger -= dt * 0.105 * exertion * (environment.hungerScale ?? 1);
    this.thirst -= dt * 0.16 * exertion;
    this.sleep -= dt * (movement.sprinting ? .095 : movement.moving ? .065 : .05);

    if (movement.sprinting && movement.moving) {
      const staminaScale = Math.max(.72, Math.min(1.18, movement.staminaUseScale || 1));
      this.energy -= dt * 17 * staminaScale;
    } else {
      let recovery = 14;
      if (this.hunger < 25) recovery *= 0.65;
      if (this.thirst < 25) recovery *= 0.55;
      if (this.sleep < 25) recovery *= .55;
      if (movement.crouching && !movement.moving) recovery *= 1.25;
      this.energy += dt * recovery * (environment.recoveryScale ?? 1);
    }

    const rain = environment.rainIntensity || 0;
    const sheltered = Boolean(environment.sheltered);
    const rainProtection = environment.rainProtection || 0;
    const nearFire = Boolean(environment.nearFire);

    if (rain > 0 && !sheltered) {
      this.wetness += dt * (9 + rain * 15) * (1 - rainProtection);
    } else {
      this.wetness -= dt * (nearFire ? 8.5 : sheltered ? 3.4 : 1.25);
    }

    const ambient = environment.ambientTemp ?? 16;
    const insulation = environment.insulation || 0;
    const activityHeat = movement.sprinting ? .35 : movement.moving ? .12 : 0;
    const wetPenalty = this.wetness / 100 * 5.5;
    const insulationBoost = insulation * .035;

    const targetTemp = 36.75 + activityHeat + insulationBoost - Math.max(0, 16 - ambient) * .055 - wetPenalty * .10 + (nearFire ? .55 : 0);
    this.bodyTemp += (targetTemp - this.bodyTemp) * dt * .045;

    if (this.hunger <= 0) this.health -= dt * 1.5;
    if (this.thirst <= 0) this.health -= dt * 2.4;

    if (this.bodyTemp < 35) {
      this.energy -= dt * (35 - this.bodyTemp) * 1.8;
      if (this.bodyTemp < 34.2) this.health -= dt * (34.2 - this.bodyTemp) * .7;
    }

    if (this.bodyTemp > 39) {
      this.thirst -= dt * .55;
      if (this.bodyTemp > 40) this.health -= dt * .5;
    }

    if (this.sleep < 15) {
      this.energy -= dt * .75;
    }

    this.clampAll();
  }

  canSprint() {
    return this.energy > 8 && this.thirst > 3 && this.sleep > 8 && this.bodyTemp > 34.2;
  }

  consume(def) {
    if (!def) return false;
    if (def.hunger) this.hunger += def.hunger;
    if (def.thirst) this.thirst += def.thirst;
    this.clampAll();
    return true;
  }

  rest(minutes = 30, nearFire = false) {
    const hours = minutes / 60;
    this.sleep += hours * (nearFire ? 24 : 17);
    this.energy += hours * (nearFire ? 48 : 34);
    this.hunger -= hours * 2.5;
    this.thirst -= hours * 3.2;
    if (nearFire) {
      this.wetness -= 18 * hours;
      this.bodyTemp += .18 * hours;
    }
    this.clampAll();
  }

  miningCost(amount = 1.4) {
    this.energy = Math.max(0, this.energy - amount);
  }
}
