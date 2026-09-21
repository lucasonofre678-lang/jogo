const PLAYER_HEIGHT = 50;
const PLAYER_CROUCH_HEIGHT = 34;

class Player {
  constructor(world) {
    this.world = world;
    this.w = 22;
    this.h = PLAYER_HEIGHT;
    this.crouching = false;
    this.climbing = false;
    this.onPlatform = false;
    // Attack is a committed three-phase action, not a timer: you can read the
    // wind-up, the hit only lands in the active window, and the recovery is
    // the window an infected can punish.
    this.attack = { phase: null, timer: 0, total: 0, kind: 'light', profile: null };
    this.recoil = 0;
    this.reload = { timer: 0, total: 0, weapon: null };
    this.gunCooldown = 0;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.hitCooldown = 0;
    this.attackTimer = 0;
    this.actionTimer = 0;
    this.actionType = null;
    this.coyoteTimer = 0;
    this.jumpBuffer = 0;
    this.squash = 0;
    this.stretch = 0;
    this.landTimer = 0;
    this.runCycle = 0;
    this.idleBreath = 0;
    this.stepUpAnim = 0;

    // Stage 24 gameplay/animation foundation. Visual assets can be replaced
    // later without touching movement or combat state transitions.
    this.animator = new SpriteAnimator(PLAYER_ANIMATIONS, 'idle');
    this.animState = 'idle';
    this.spriteFrame = 0;
    this.animSpeed = 0;
    this.airTime = 0;
    this.sprintBlend = 0;
    this.moveIntent = 0;
    this.speedRatio = 0;
    this.wasSprinting = false;
    this.aiming = false;
    this.attackImpulse = 0;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.lastAttackKind = 'light';
    this.spawn();
  }

  spawn() {
    const tx = 24;
    const sy = this.world.groundY(tx);
    this.x = tx * CONFIG.TILE + 5;
    this.y = sy * CONFIG.TILE - this.h - 2;
    this.vx = 0;
    this.vy = 0;
    this.coyoteTimer = 0;
    this.jumpBuffer = 0;
    this.squash = 0;
    this.stretch = 0;
    this.landTimer = 0;
    this.actionTimer = 0;
    this.actionType = null;
    this.sprintBlend = 0;
    this.attackImpulse = 0;
    this.comboStep = 0;
    this.comboTimer = 0;
    this.animator?.set('idle', true);
    this.animSpeed = 0;
    this.airTime = 0;
  }

  // True while the player's body overlaps a climbable tile.
  onLadder() {
    const T = CONFIG.TILE;
    const cx = Math.floor((this.x + this.w / 2) / T);
    const top = Math.floor((this.y + 6) / T);
    const bottom = Math.floor((this.y + this.h - 4) / T);
    for (let ty = top; ty <= bottom; ty++) {
      if (TILE_INFO[this.world.get(cx, ty)]?.climb) return true;
    }
    return false;
  }

  setCrouch(on) {
    if (on === this.crouching) return;
    if (!on) {
      // only stand up when there is room overhead
      const T = CONFIG.TILE;
      const head = Math.floor((this.y + this.h - PLAYER_HEIGHT) / T);
      const left = Math.floor((this.x + 2) / T), right = Math.floor((this.x + this.w - 3) / T);
      for (let tx = left; tx <= right; tx++) if (this.world.isSolid(tx, head)) return;
    }
    const bottom = this.y + this.h;
    this.crouching = on;
    this.h = on ? PLAYER_CROUCH_HEIGHT : PLAYER_HEIGHT;
    this.y = bottom - this.h;
  }

  /* ------------------------------------------------------------- attack */

  busy() { return Boolean(this.attack.phase); }

  canAttack() { return !this.attack.phase && this.reload.timer <= 0; }

  startAttack(profile, kind = 'light') {
    if (!this.canAttack()) return false;
    const scale = kind === 'heavy' ? 1.55 : 1;
    this.attack = {
      phase: 'windup',
      timer: profile.windup * scale,
      total: profile.windup * scale,
      kind, profile
    };
    return true;
  }

  // Returns 'hit' on the frame the active window opens, so the game resolves
  // the swing exactly once and exactly when the animation shows it.
  updateAttack(dt) {
    const a = this.attack;
    if (!a.phase) return null;
    a.timer -= dt;
    if (a.timer > 0) return null;
    const scale = a.kind === 'heavy' ? 1.55 : 1;
    if (a.phase === 'windup') {
      a.phase = 'active';
      a.timer = a.profile.active * scale;
      a.total = a.timer;
      this.addAttackImpulse(a.profile, a.kind);
      return 'hit';
    }
    if (a.phase === 'active') {
      a.phase = 'recover';
      a.timer = a.profile.recover * scale;
      a.total = a.timer;
      return null;
    }
    this.attack = { phase: null, timer: 0, total: 0, kind: 'light', profile: null };
    return 'done';
  }

  cancelAttack() {
    this.attack = { phase: null, timer: 0, total: 0, kind: 'light', profile: null };
  }

  // How much control the player keeps mid-swing. Never zero: being frozen in
  // place is what made the old combat feel broken.
  attackMoveScale() {
    if (!this.attack.phase) return 1;
    // A swing commits the player without turning them into a statue.
    if (this.attack.phase === 'windup') return .56;
    if (this.attack.phase === 'active') return .44;
    return .72;
  }

  setCombo(step = 0, kind = 'light') {
    this.comboStep = Math.max(0, step | 0);
    this.comboTimer = kind === 'light' ? .52 : 0;
    this.lastAttackKind = kind;
  }

  addAttackImpulse(profile, kind = 'light') {
    const base = profile?.thrust ? .72 : .42;
    const heavyScale = kind === 'heavy' ? .72 : 1;
    this.attackImpulse += this.facing * base * heavyScale;
  }

  startReload(weaponId, seconds) {
    if (this.reload.timer > 0) return false;
    this.reload = { timer: seconds, total: seconds, weapon: weaponId };
    this.cancelAttack();
    return true;
  }

  update(input, modifiers = {}) {
    const dt = modifiers.dt || .016;
    const k = Math.min(2.4, dt * 60);
    const speedScale = modifiers.speedScale ?? 1;
    const groundedStart = this.onGround;
    const target = (input.left ? -1 : 0) + (input.right ? 1 : 0);

    this.moveIntent = target;
    this.aiming = Boolean(modifiers.aiming);
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer <= 0 && !this.attack.phase) this.comboStep = 0;

    const wantsSprint = Boolean(modifiers.sprinting && target !== 0 && !this.attack.phase && !input.crouch);
    const blendStep = CONFIG.PLAYER_SPRINT_RAMP * dt;
    const sprintTarget = wantsSprint ? 1 : 0;
    if (this.sprintBlend < sprintTarget) this.sprintBlend = Math.min(sprintTarget, this.sprintBlend + blendStep);
    else if (this.sprintBlend > sprintTarget) this.sprintBlend = Math.max(sprintTarget, this.sprintBlend - blendStep * 1.35);
    this.wasSprinting = this.sprintBlend > .42;

    this.setCrouch(Boolean(input.crouch) && !wantsSprint && !this.attack.phase);
    const crouchScale = this.crouching ? CONFIG.PLAYER_CROUCH_SPEED_MULT : 1;
    const swingScale = this.attackMoveScale();
    const sprintScale = 1 + (CONFIG.PLAYER_SPRINT_MULT - 1) * this.sprintBlend;

    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 6);
    if (this.gunCooldown > 0) this.gunCooldown = Math.max(0, this.gunCooldown - dt);
    if (this.reload.timer > 0) this.reload.timer = Math.max(0, this.reload.timer - dt);
    this.attackImpulse *= Math.pow(.72, k);
    if (Math.abs(this.attackImpulse) < .015) this.attackImpulse = 0;

    // Voo do Modo Criativo: mantém colisão com o mundo, mas ignora gravidade.
    if (modifiers.flight) {
      const flySpeed = 7.2 * (input.sprint ? 1.8 : 1);
      this.vx = target * flySpeed;
      this.vy = ((input.up || input.jump) ? -flySpeed : 0) + ((input.down || input.crouch) ? flySpeed : 0);
      if (target) this.facing = target;
      this.onGround = false;
      this.crouching = false;
      this.moveX(k);
      this.moveY(k, input);
      this.runCycle += dt * (Math.abs(this.vx) + Math.abs(this.vy) > .1 ? 5 : 1);
      this.updateAnimation(dt);
      input.jumpPressed = false;
      return;
    }

    // --- ladders ---------------------------------------------------------
    const ladder = this.onLadder();
    this.climbing = ladder && (input.up || input.down || (this.climbing && !this.onGround));
    if (this.climbing) {
      const climbSpeed = 2.85 * (wantsSprint ? 1.22 : 1);
      this.vy = (input.up ? -climbSpeed : input.down ? climbSpeed : 0);
      this.vx *= Math.pow(.68, k);
      if (target) { this.vx += (target * 1.7 - this.vx) * Math.min(1, .35 * k); this.facing = target; }
      if (input.jumpPressed) {
        this.climbing = false;
        this.vy = -CONFIG.PLAYER_JUMP * .76;
      } else {
        this.moveX(k);
        this.moveY(k, input);
        this.runCycle += dt * 4.2;
        this.idleBreath += dt;
        if (this.hitCooldown > 0) this.hitCooldown = Math.max(0, this.hitCooldown - dt);
        if (this.attackTimer > 0) this.attackTimer = Math.max(0, this.attackTimer - dt);
        if (this.actionTimer > 0) {
          this.actionTimer = Math.max(0, this.actionTimer - dt);
          if (this.actionTimer <= 0) this.actionType = null;
        }
        this.updateAnimation(dt);
        return;
      }
    }

    const maxSpeed = CONFIG.PLAYER_MAX_SPEED * speedScale * sprintScale * crouchScale * swingScale;

    if (this.hitCooldown > 0) this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    this.attackTimer = this.attack.phase ? this.attack.timer : 0;
    if (this.actionTimer > 0) {
      this.actionTimer = Math.max(0, this.actionTimer - dt);
      if (this.actionTimer <= 0) this.actionType = null;
    }
    this.landTimer = Math.max(0, this.landTimer - dt * 2.6);
    this.stepUpAnim = Math.max(0, this.stepUpAnim - dt * 5);
    this.squash *= Math.pow(.84, k);
    this.stretch *= Math.pow(.86, k);
    this.idleBreath += dt * (groundedStart ? 2 : 1.2);

    if (target !== 0) {
      const desired = target * maxSpeed;
      let accel = groundedStart
        ? (this.sprintBlend > .35 ? CONFIG.PLAYER_SPRINT_ACCEL : CONFIG.PLAYER_GROUND_ACCEL)
        : CONFIG.PLAYER_AIR_ACCEL;
      if (groundedStart && this.vx !== 0 && Math.sign(this.vx) !== target) accel = CONFIG.PLAYER_TURN_ACCEL;
      const delta = desired - this.vx;
      const step = accel * k;
      this.vx += Math.max(-step, Math.min(step, delta));
      this.facing = target;
    } else {
      const decel = CONFIG.PLAYER_GROUND_DECEL * k;
      if (Math.abs(this.vx) <= decel) this.vx = 0;
      else this.vx -= Math.sign(this.vx) * decel;
    }
    this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));
    this.speedRatio = Math.min(1, Math.abs(this.vx) / Math.max(.01, maxSpeed));

    if (groundedStart) this.coyoteTimer = .12;
    else this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);

    if (input.jumpPressed) this.jumpBuffer = .14;
    else this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);

    if (this.jumpBuffer > 0 && this.coyoteTimer > 0) {
      this.vy = -CONFIG.PLAYER_JUMP * Math.max(.86, speedScale);
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBuffer = 0;
      this.stretch = .22;
      this.squash = -.08;
    }

    // short hop when the jump key is released early
    if (!input.jump && this.vy < -4) this.vy += CONFIG.GRAVITY * 1.18 * k;

    this.vy += CONFIG.GRAVITY * k;
    this.vy = Math.min(this.vy, 18);

    this.moveX(k);
    const fallingBefore = this.vy > 1;
    this.moveY(k, input);

    if (!groundedStart && this.onGround && fallingBefore) {
      this.landTimer = .28;
      this.squash = .24;
      this.stretch = -.08;
    }

    const runFactor = Math.min(1.25, Math.abs(this.vx) / Math.max(1, maxSpeed));
    this.runCycle += dt * (groundedStart ? 6.2 : 3.4) * Math.max(.28, runFactor);
    this.updateAnimation(dt);

    if (this.y > CONFIG.WORLD_H * CONFIG.TILE + 200) this.spawn();
  }

  moveX(k) {
    const T = CONFIG.TILE;
    const step = (this.vx + this.attackImpulse) * k;
    if (step === 0) return;
    this.x += step;

    const top = Math.floor(this.y / T);
    const bottom = Math.floor((this.y + this.h - 1) / T);
    let hitX = null;

    if (step > 0) {
      const right = Math.floor((this.x + this.w - 1) / T);
      for (let ty = top; ty <= bottom; ty++) {
        if (this.world.isSolid(right, ty)) { hitX = right; break; }
      }
      if (hitX !== null && !this.tryStepUp(hitX, 1)) { this.x = hitX * T - this.w - 0.01; this.vx = 0; }
    } else {
      const left = Math.floor(this.x / T);
      for (let ty = top; ty <= bottom; ty++) {
        if (this.world.isSolid(left, ty)) { hitX = left; break; }
      }
      if (hitX !== null && !this.tryStepUp(hitX, -1)) { this.x = (hitX + 1) * T + 0.01; this.vx = 0; }
    }
  }

  // Walk over a single-tile kerb without needing a jump — removes the main
  // source of "the player gets stuck on the scenery".
  tryStepUp(tileX, dir) {
    if (!this.onGround) return false;
    const T = CONFIG.TILE;
    const footY = Math.floor((this.y + this.h - 1) / T);
    const headroomTop = Math.floor((this.y - T) / T);
    if (!this.world.isSolid(tileX, footY)) return false;
    if (this.world.isSolid(tileX, footY - 1)) return false;
    for (let ty = headroomTop; ty < footY - 1; ty++) {
      if (this.world.isSolid(tileX, ty)) return false;
      if (this.world.isSolid(Math.floor((this.x + this.w / 2) / T), ty)) return false;
    }
    this.y = footY * T - this.h;
    this.x += dir * 1.5;
    this.stepUpAnim = .18;
    return true;
  }

  moveY(k, input = {}) {
    const T = CONFIG.TILE;
    const prevBottom = this.y + this.h;
    this.y += this.vy * k;
    this.onGround = false;
    this.onPlatform = false;
    const left = Math.floor((this.x + 2) / T);
    const right = Math.floor((this.x + this.w - 3) / T);
    const top = Math.floor(this.y / T);
    // The row the soles stand IN, not the last row the body occupies. Using
    // `y + h - 1` here was an off-by-one: once a landing snaps y to
    // `row * T - h` the feet sit exactly on the boundary, so the floor row was
    // never tested again and onGround flickered off every other frame on
    // perfectly flat ground — which re-triggered the landing squash and reset
    // the walk cycle to its first frame forever.
    const feet = Math.floor((this.y + this.h) / T);

    if (this.vy > 0) {
      for (let tx = left; tx <= right; tx++) {
        if (this.world.isSolid(tx, feet)) { this.y = feet * T - this.h; this.vy = 0; this.onGround = true; return; }
      }
      // catwalks and platforms are only solid from above, and can be dropped
      // through by holding down
      if (!input.down && !this.climbing) {
        for (let tx = left; tx <= right; tx++) {
          const info = TILE_INFO[this.world.get(tx, feet)];
          if (info?.platform && prevBottom <= feet * T + 2) {
            this.y = feet * T - this.h;
            this.vy = 0;
            this.onGround = true;
            this.onPlatform = true;
            return;
          }
        }
      }
    } else if (this.vy < 0) {
      for (let tx = left; tx <= right; tx++) {
        if (this.world.isSolid(tx, top)) { this.y = (top + 1) * T; this.vy = 0; break; }
      }
    }
  }

  center() { return { x: this.x + this.w / 2, y: this.y + this.h / 2 }; }

  // Reads only smoothed signals (animSpeed, airTime), never the raw per-frame
  // vx/onGround. A single frame of clipping a wall or of the ground test
  // missing must not be able to change what the body is doing.
  animationState() {
    const moving = this.animSpeed > .16;
    if (this.climbing) return 'climb';
    if (this.hitCooldown > .52) return 'hurt';
    if (this.reload.timer > 0) return 'reload';
    if (this.actionTimer > 0 && this.actionType === 'mine') return 'mine';
    if (this.actionTimer > 0 && this.actionType === 'use') return 'use';
    if (this.attack.phase) return `attack_${this.attack.kind}_${this.attack.phase}`;
    // Real vertical movement reads instantly; only a near-zero vy has to prove
    // it is airborne for a couple of frames, which is the shape a bad ground
    // test has and a jump or a fall never does.
    if (!this.onGround && (Math.abs(this.vy) > 3 || this.airTime > .04)) return this.vy < -1 ? 'jump' : 'fall';
    if (this.landTimer > .1) return 'land';
    if (this.crouching) return moving ? 'crouch_walk' : 'crouch_idle';
    if (moving) return this.sprintBlend > .45 ? 'run' : 'walk';
    if (this.recoil > .12) return 'shoot';
    if (this.aiming) return 'aim';
    return 'idle';
  }

  animationProgress() {
    if (this.attack.phase && this.attack.total > 0) return 1 - this.attack.timer / this.attack.total;
    if (this.reload.timer > 0 && this.reload.total > 0) return 1 - this.reload.timer / this.reload.total;
    return null;
  }

  updateAnimation(dt) {
    // Smoothed so that hitting a wall (vx snaps to 0 and back for one frame)
    // reads as slowing down instead of flickering between walk and idle.
    this.animSpeed += (Math.abs(this.vx) - this.animSpeed) * Math.min(1, dt * 16);
    this.airTime = this.onGround ? 0 : this.airTime + dt;
    const state = this.animationState();
    this.animState = state;
    this.animator.set(state);
    this.spriteFrame = this.animator.frame(this.animationProgress());
    const moveRate = state === 'walk' || state === 'run' || state === 'crouch_walk'
      ? Math.max(.55, this.speedRatio) : 1;
    this.animator.update(dt, moveRate);
  }

  draw(ctx, cameraX, cameraY, options = {}) {
    const px = Math.round(this.x - cameraX);
    const py = Math.round(this.y - cameraY);
    const running = this.animSpeed > .16 && this.sprintBlend > .45;
    const state = this.animationState();
    if (state !== this.animState) { this.animState = state; this.animator.set(state); }
    const progress = this.animationProgress();
    const frame = this.animator.frame(progress);
    this.spriteFrame = frame;          // game.js anchors the held item off this

    const layout = PLAYER_SPRITE_LAYOUT;
    const groundY = py + this.h;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Contact shadow: a tight dark core inside a softer pool. It shrinks and
    // fades with height, which is most of what sells "the feet are on the floor".
    const air = this.onGround ? 0 : Math.min(1, Math.abs(this.vy) * .045 + .18);
    const spread = 1 - air * .42;
    const stance = this.crouching ? 1.15 : 1;
    ctx.fillStyle = `rgba(8,10,9,${(.20 * (1 - air * .55)).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(px + this.w / 2, groundY + 1, 13 * spread * stance, 4.2 * spread, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(6,8,8,${(.26 * (1 - air * .7)).toFixed(3)})`;
    ctx.beginPath();
    ctx.ellipse(px + this.w / 2, groundY + 1, 7 * spread * stance, 2.4 * spread, 0, 0, Math.PI * 2);
    ctx.fill();

    // invulnerability blink hides the body, never the shadow
    if (this.hitCooldown > 0 && this.hitCooldown < .52 && Math.floor(this.hitCooldown * 20) % 2 === 0) { ctx.restore(); return; }

    if (this.facing < 0) {
      ctx.translate(px + this.w, 0);
      ctx.scale(-1, 1);
    } else ctx.translate(px, 0);

    // The swing lean lives in the art now; what is left here is the impact
    // kick, which has to move with the frame rather than with the sheet.
    if (this.recoil > 0) ctx.translate(-this.recoil * 2.4, 0);

    const sq = 1 + this.squash * .5 - this.stretch * .4;
    const st = 1 - this.squash * .35 + this.stretch * .5;
    ctx.translate(this.w / 2, groundY);
    ctx.scale(sq, st);
    ctx.translate(-this.w / 2, -groundY);

    const ox = Math.round(this.w / 2 - layout.cx);
    const oy = groundY - layout.ground;
    const drawSheet = (img, layer = 'base') => {
      if (!img) return false;
      const layerFrame = layer === 'base'
        ? frame
        : spriteAnimationFrame(PLAYER_CLOTHING_ANIMATIONS, state, this.animator.time, progress);
      ctx.drawImage(img, layerFrame * layout.frameW, 0, layout.frameW, layout.frameH,
        ox, oy, layout.drawW, layout.drawH);
      return true;
    };

    if (!drawSheet(ASSETS.ready("sprite:player"), 'base')) {
      ctx.fillStyle = "#5c6349"; ctx.fillRect(2, py + 14, 18, 22);
      ctx.fillStyle = "#c08f6b"; ctx.fillRect(6, py + 3, 11, 12);
      ctx.fillStyle = "#2e2823"; ctx.fillRect(4, py + 36, 6, 14); ctx.fillRect(12, py + 36, 6, 14);
    }

    // Stage 30 equipment layering: legs/feet under the torso, then gloves/head,
    // with the equipped pack always on top. This gives Claude/art passes a
    // stable compositing contract without touching gameplay code.
    const clothes = options.clothing || {};
    if (clothes.legs) drawSheet(ASSETS.ready(`sprite:player:${clothes.legs}`), 'clothing');
    if (clothes.feet) drawSheet(ASSETS.ready(`sprite:player:${clothes.feet}`), 'clothing');
    if (clothes.body) drawSheet(ASSETS.ready(`sprite:player:${clothes.body}`), 'clothing');
    if (clothes.hands) drawSheet(ASSETS.ready(`sprite:player:${clothes.hands}`), 'clothing');
    if (clothes.head) drawSheet(ASSETS.ready(`sprite:player:${clothes.head}`), 'clothing');
    if (clothes.pack) drawSheet(ASSETS.ready(`sprite:player:${clothes.pack}`), 'clothing');

    // catch the light on the side it is coming from
    const rim = actorRimOffset(options.light);
    if (rim) {
      const base = ASSETS.ready("sprite:player");
      if (base) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = rim.alpha;
        ctx.drawImage(base, frame * layout.frameW, 0, layout.frameW, layout.frameH,
          ox + rim.x, oy + rim.y, layout.drawW, layout.drawH);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    if (running && this.onGround) {
      const t = Math.min(1, (this.sprintBlend - .45) * 2.4);
      ctx.strokeStyle = `rgba(222,216,196,${(.20 * t).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, py + 20); ctx.lineTo(-20 - t * 6, py + 20);
      ctx.moveTo(-6, py + 29); ctx.lineTo(-15 - t * 5, py + 29);
      ctx.moveTo(-9, py + 38); ctx.lineTo(-18 - t * 4, py + 38);
      ctx.stroke();
    }

    ctx.restore();
  }
}
