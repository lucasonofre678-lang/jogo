// LAST COUNTY — Stage 25 pose library.
//
// Frame indices here are the contract with js/animation.js. Cycles are
// generated (one stride description, not eight hand-typed frames) so walk, run
// and shamble all keep real weight transfer: a planted stance foot, a swing
// foot that lifts and reaches, a pelvis that drops on contact.
const { pose, REST, TAU, clamp } = require('./character');

/* ------------------------------------------------------------ locomotion */

// One foot through one stride. u = 0 is heel contact, stanceEnd is toe-off.
function legCycle(u, { stride, stanceEnd = 0.6, lift = 4, ankleY = REST.ankle, drag = 0 }) {
  u = ((u % 1) + 1) % 1;
  if (u < stanceEnd) {
    const k = u / stanceEnd;
    const toe = k < 0.22 ? -0.30 * (1 - k / 0.22) : k > 0.68 ? 0.5 * ((k - 0.68) / 0.32) : 0;
    return [stride * (1 - 2 * k), ankleY, toe];
  }
  const k = (u - stanceEnd) / (1 - stanceEnd);
  const h = Math.sin(k * Math.PI);
  return [
    -stride + 2 * stride * k,
    ankleY + lift * h * (1 - drag),
    0.5 * (1 - k) - 0.3 * k + drag * 0.35 * h
  ];
}

// Counter-swinging arm. bend pulls the hand up toward the chest (running).
function armCycle(u, { swing, bend = 0, base = REST.hand, lead = 0 }) {
  const a = ((u % 1) + 1) % 1 * TAU;
  return [lead - swing * Math.cos(a), base + bend - Math.abs(Math.sin(a)) * 0.9, -0.2];
}

// Shared gait builder: everything from a stroll to a sprint comes out of here.
function gait(t, o) {
  const F = legCycle(t, o), B = legCycle(t + 0.5, o);
  const dip = o.bob * (0.5 + 0.5 * Math.cos(2 * t * TAU));
  return pose({
    hipX: o.hipX ?? 0,
    hipY: (o.hipY ?? 23.4) - dip,
    lean: o.lean ?? 1,
    torso: o.torso ?? 13,
    headX: o.headX ?? 0,
    headY: (o.headY ?? 0) - dip * 0.25,
    headTilt: o.headTilt ?? 0,
    footF: [F[0] + (o.footX ?? 1.5), F[1], F[2]],
    footB: [B[0] - (o.footX ?? 1.5), B[1], B[2]],
    handF: armCycle(t + 0.5, o.arm),
    handB: armCycle(t, { ...o.arm, swing: o.arm.swing * 0.88 }),
    squash: o.squash || 0
  });
}

/* --------------------------------------------------------------- the player
 *
 * Frame map (must match PLAYER_ANIMATIONS in js/animation.js):
 *   0-3 idle · 4-11 walk · 12-19 run · 20-21 crouch_idle · 22-27 crouch_walk
 *   28-29 jump · 30-31 fall · 32-33 land · 34-37 climb
 *   38-43 attack_light windup/active/recover · 44-49 attack_heavy
 *   50 aim · 51-52 shoot · 53-56 reload · 57-60 mine · 61-62 use · 63-64 hurt
 */

const WALK = { stride: 5.4, stanceEnd: 0.6, lift: 3.4, bob: 1.3, lean: 1.2, hipY: 23.2, arm: { swing: 3.6, bend: 0 } };
const RUN  = { stride: 7.8, stanceEnd: 0.42, lift: 6.2, bob: 2.1, lean: 3.4, hipY: 23.6, torso: 12.6,
               headX: 0.6, arm: { swing: 5.4, bend: 7.2, lead: 1.4 }, footX: 1.2 };
const SNEAK = { stride: 3.6, stanceEnd: 0.64, lift: 2.2, bob: 0.7, lean: 4.2, hipY: 12.4, hipX: -3,
                torso: 11.6, headY: -0.6, arm: { swing: 2.4, bend: 1.5, lead: 2 }, footX: 2.2 };

function playerPoses() {
  const P = [];

  // 0-3 idle — a slow breath, weight on the back foot, hands loose.
  for (let i = 0; i < 4; i++) {
    const b = Math.sin(i / 4 * TAU);
    P.push(pose({
      hipY: 24 + b * 0.35, torso: 13 + b * 0.35, lean: 0.6,
      headY: b * 0.3, headTilt: -0.02,
      footF: [3.4, REST.ankle, 0], footB: [-3.6, REST.ankle, 0],
      handF: [3.2, REST.hand + b * 0.5, -0.18], handB: [-3.4, REST.hand + b * 0.5, -0.18]
    }));
  }

  // 4-11 walk, 12-19 run
  for (let i = 0; i < 8; i++) P.push(gait(i / 8, WALK));
  for (let i = 0; i < 8; i++) P.push(gait(i / 8, RUN));

  // 20-21 crouch idle — hips back, knees forward, head low.
  for (let i = 0; i < 2; i++) {
    const b = i * 0.4;
    P.push(pose({
      hipX: -3, hipY: 12.4 - b, torso: 11.6, lean: 4.4, headY: -0.5, headTilt: 0.08,
      footF: [5, REST.ankle, 0], footB: [-4.4, REST.ankle, 0],
      handF: [5.4, 15.4 - b, -0.1], handB: [0.6, 14.6 - b, -0.1]
    }));
  }

  // 22-27 crouch walk
  for (let i = 0; i < 6; i++) P.push(gait(i / 6, SNEAK));

  // 28-29 jump (rising): legs gathering, arms swept back and up
  P.push(pose({ hipY: 25.6, lean: 2.2, torso: 13.4, headY: 0.4,
    footF: [5.2, 9.5, -0.35], footB: [-4.6, 6.2, 0.35],
    handF: [-1.5, 30, -0.5], handB: [-5.5, 28, -0.5] }));
  P.push(pose({ hipY: 26.2, lean: 1.4, torso: 13.4, headY: 0.6,
    footF: [4.2, 11.5, -0.3], footB: [-5.4, 8.5, 0.3],
    handF: [-2.5, 31.5, -0.6], handB: [-6, 29, -0.6] }));

  // 30-31 fall: legs reaching for the floor, arms out to balance
  P.push(pose({ hipY: 24.8, lean: 0.4, torso: 13.2, headY: -0.3,
    footF: [5.8, 6.5, 0.15], footB: [-4.2, 8.5, -0.1],
    handF: [6.5, 27, 0.1], handB: [-6.5, 26, 0.1] }));
  P.push(pose({ hipY: 24.4, lean: -0.4, torso: 13.2, headY: -0.5,
    footF: [6.4, 5.2, 0.2], footB: [-3.4, 7, -0.1],
    handF: [7.2, 25.5, 0.15], handB: [-7.2, 27.5, 0.15] }));

  // 32-33 land: absorb, then push back up
  P.push(pose({ hipX: -1, hipY: 16.5, torso: 12, lean: 3.6, headY: -0.8, headTilt: 0.12,
    footF: [5.6, REST.ankle, -0.1], footB: [-5, REST.ankle, 0.1],
    handF: [7.5, 17, 0.25], handB: [-5.5, 16, 0.25] }));
  P.push(pose({ hipX: -0.5, hipY: 20.2, torso: 12.6, lean: 2.2, headY: -0.3,
    footF: [4.6, REST.ankle, 0], footB: [-4.4, REST.ankle, 0],
    handF: [6, 20, 0.1], handB: [-5, 19, 0.1] }));

  // 34-37 climb: alternating reach up a ladder
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * TAU;
    const up = Math.sin(a), dn = Math.sin(a + Math.PI);
    P.push(pose({
      hipY: 23.6 + up * 0.6, lean: 0.4, torso: 13, headY: 0.4, headTilt: -0.06,
      footF: [2.6, REST.ankle + 5 + up * 4.5, -0.25], footB: [-2.8, REST.ankle + 1.5 + dn * 3, -0.2],
      handF: [2.4, 34 + up * 3.5, -0.45], handB: [-2.6, 34 + dn * 3.5, -0.45]
    }));
  }

  /* --- melee. The weapon layer is rotated separately in game.js; the body's
   * job is the coil, the transfer of weight and the follow-through. --- */

  // 38-39 light windup
  P.push(pose({ hipX: -1.4, hipY: 23, lean: -2.4, torso: 13, headX: 0.6, headTilt: -0.06,
    footF: [4.2, REST.ankle, -0.1], footB: [-5, REST.ankle, 0.12],
    handF: [-2.5, 29, -0.55], handB: [1.5, 24, -0.2] }));
  P.push(pose({ hipX: -2, hipY: 22.4, lean: -3.6, torso: 13.2, headX: 0.4, headTilt: -0.1,
    footF: [3.4, REST.ankle + 0.6, -0.2], footB: [-5.6, REST.ankle, 0.18],
    handF: [-4.5, 31.5, -0.8], handB: [2.5, 24.5, -0.2] }));
  // 40-41 light active (contact frame first — that is the one you read)
  P.push(pose({ hipX: 1.2, hipY: 22.2, lean: 4.6, torso: 12.6, headX: 1.4, headTilt: 0.14,
    footF: [7.4, REST.ankle, 0.12], footB: [-5.2, REST.ankle, 0.4],
    handF: [11.5, 25.5, 0.3], handB: [-3, 21, -0.1] }));
  P.push(pose({ hipX: 1.6, hipY: 22.6, lean: 4, torso: 12.8, headX: 1.2, headTilt: 0.1,
    footF: [7, REST.ankle, 0.1], footB: [-5, REST.ankle, 0.35],
    handF: [11, 22.5, 0.5], handB: [-3.4, 21.5, -0.1] }));
  // 42-43 light recover
  P.push(pose({ hipX: 0.8, hipY: 23, lean: 2.6, torso: 12.9, headX: 0.8, headTilt: 0.06,
    footF: [5.8, REST.ankle, 0], footB: [-4.6, REST.ankle, 0.2],
    handF: [8.5, 21, 0.3], handB: [-3.6, 22, -0.15] }));
  P.push(pose({ hipX: 0.3, hipY: 23.4, lean: 1.6, torso: 13, headX: 0.4,
    footF: [4.6, REST.ankle, 0], footB: [-4.2, REST.ankle, 0.08],
    handF: [6, 21.5, 0.1], handB: [-3.8, 22, -0.18] }));

  // 44-45 heavy windup: a bigger coil, weight fully on the back leg
  P.push(pose({ hipX: -2.4, hipY: 22.6, lean: -4, torso: 13.2, headX: 0.2, headTilt: -0.12,
    footF: [3.6, REST.ankle + 0.5, -0.2], footB: [-6, REST.ankle, 0.2],
    handF: [-4, 32, -0.9], handB: [0.5, 27, -0.5] }));
  P.push(pose({ hipX: -3.2, hipY: 21.8, lean: -5.6, torso: 13.4, headX: -0.4, headTilt: -0.2,
    footF: [2.6, REST.ankle + 1.2, -0.3], footB: [-6.6, REST.ankle, 0.26],
    handF: [-6.5, 35, -1.2], handB: [-1.5, 29.5, -0.7] }));
  // 46-47 heavy active: a committed lunge, all the way through the target
  P.push(pose({ hipX: 2.4, hipY: 20.8, lean: 6.4, torso: 12.2, headX: 2, headTilt: 0.22,
    footF: [9.6, REST.ankle, 0.1], footB: [-7.4, REST.ankle, 0.5],
    handF: [13.5, 24, 0.55], handB: [5, 20.5, 0.4] }));
  P.push(pose({ hipX: 2.6, hipY: 20.4, lean: 6, torso: 12.2, headX: 1.8, headTilt: 0.2,
    footF: [9.8, REST.ankle, 0.08], footB: [-7.6, REST.ankle, 0.5],
    handF: [13, 18.5, 0.8], handB: [5.5, 17, 0.6] }));
  // 48-49 heavy recover: heavy weapons cost you the recovery
  P.push(pose({ hipX: 1.4, hipY: 21.4, lean: 4.4, torso: 12.5, headX: 1.2, headTilt: 0.16,
    footF: [8, REST.ankle, 0], footB: [-6.4, REST.ankle, 0.3],
    handF: [10.5, 17.5, 0.6], handB: [4, 17, 0.5] }));
  P.push(pose({ hipX: 0.4, hipY: 22.6, lean: 2.6, torso: 12.8, headX: 0.6, headTilt: 0.08,
    footF: [6, REST.ankle, 0], footB: [-5, REST.ankle, 0.14],
    handF: [7.5, 19.5, 0.3], handB: [0.5, 19.5, 0.2] }));

  // 50 aim — bladed stance, support hand under the weapon, head over the sights
  P.push(pose({ hipX: -0.8, hipY: 23.2, lean: 1.6, torso: 13, headX: 1.2, headTilt: 0.05,
    footF: [5, REST.ankle, 0], footB: [-5.4, REST.ankle, 0.12],
    handF: [9.5, 29.5, 0], handB: [5, 28, 0] }));
  // 51-52 shoot — recoil back through the shoulder, then recover
  P.push(pose({ hipX: -1.4, hipY: 23.2, lean: 0.4, torso: 13.1, headX: 0.8, headTilt: -0.02,
    footF: [4.6, REST.ankle, 0], footB: [-5.8, REST.ankle, 0.14],
    handF: [7, 30.5, -0.1], handB: [3, 28.6, -0.1] }));
  P.push(pose({ hipX: -1, hipY: 23.2, lean: 1.1, torso: 13, headX: 1, headTilt: 0.02,
    footF: [4.8, REST.ankle, 0], footB: [-5.6, REST.ankle, 0.12],
    handF: [8.4, 30, -0.05], handB: [4.2, 28.3, -0.05] }));

  // 53-56 reload — drop the weapon, feed it, bring it back up
  P.push(pose({ hipX: -0.6, hipY: 23.2, lean: 1.4, torso: 13, headX: 1, headTilt: 0.14,
    footF: [4.4, REST.ankle, 0], footB: [-5, REST.ankle, 0.1],
    handF: [7.5, 25, 0.1], handB: [3.5, 24, 0.1] }));
  P.push(pose({ hipX: -0.6, hipY: 23.1, lean: 1.6, torso: 13, headX: 1, headTilt: 0.2,
    footF: [4.4, REST.ankle, 0], footB: [-5, REST.ankle, 0.1],
    handF: [7.2, 24.5, 0.1], handB: [1.5, 18.5, 0.3] }));
  P.push(pose({ hipX: -0.6, hipY: 23.1, lean: 1.5, torso: 13, headX: 1, headTilt: 0.16,
    footF: [4.4, REST.ankle, 0], footB: [-5, REST.ankle, 0.1],
    handF: [7.4, 25, 0.1], handB: [5, 23, 0.1] }));
  P.push(pose({ hipX: -0.8, hipY: 23.2, lean: 1.5, torso: 13, headX: 1.1, headTilt: 0.06,
    footF: [4.6, REST.ankle, 0], footB: [-5.2, REST.ankle, 0.1],
    handF: [8.6, 28, 0], handB: [4.6, 26.5, 0] }));

  // 57-60 mine / chop — raise, hold, strike, settle
  P.push(pose({ hipX: -1, hipY: 22.8, lean: -1.4, torso: 13, headX: 0.4, headTilt: -0.1,
    footF: [4.6, REST.ankle, 0], footB: [-5, REST.ankle, 0.12],
    handF: [0.5, 32, -0.7], handB: [-3, 29.5, -0.7] }));
  P.push(pose({ hipX: -1.4, hipY: 22.4, lean: -2.4, torso: 13.3, headX: 0, headTilt: -0.22,
    footF: [4.2, REST.ankle, 0], footB: [-5.4, REST.ankle, 0.14],
    handF: [-1.5, 36, -1.1], handB: [-4.5, 33, -1.1] }));
  P.push(pose({ hipX: 1.4, hipY: 21.6, lean: 4.6, torso: 12.4, headX: 1.6, headTilt: 0.24,
    footF: [6.6, REST.ankle, 0.08], footB: [-5.6, REST.ankle, 0.3],
    handF: [10.5, 21, 0.5], handB: [6, 20, 0.5] }));
  P.push(pose({ hipX: 0.6, hipY: 22.4, lean: 2.6, torso: 12.8, headX: 1, headTilt: 0.14,
    footF: [5.4, REST.ankle, 0], footB: [-5, REST.ankle, 0.18],
    handF: [7.5, 25, 0.2], handB: [3.5, 24, 0.2] }));

  // 61-62 use / build — reach out and work with both hands
  P.push(pose({ hipX: -0.6, hipY: 22.6, lean: 2.6, torso: 12.7, headX: 1.4, headTilt: 0.18,
    footF: [4.8, REST.ankle, 0], footB: [-4.8, REST.ankle, 0.1],
    handF: [9.5, 25.5, 0.15], handB: [6, 23.5, 0.15] }));
  P.push(pose({ hipX: -0.6, hipY: 22.2, lean: 2.9, torso: 12.6, headX: 1.5, headTilt: 0.2,
    footF: [4.8, REST.ankle, 0], footB: [-4.8, REST.ankle, 0.1],
    handF: [10.2, 23.5, 0.2], handB: [6.6, 22, 0.2] }));

  // 63-64 hurt — knocked off balance, guard coming up. No gore, just recoil.
  P.push(pose({ hipX: -2, hipY: 22.4, lean: -4.6, torso: 12.8, headX: -1.6, headY: -0.4, headTilt: -0.3,
    footF: [2.4, REST.ankle + 1.4, -0.3], footB: [-6.4, REST.ankle, 0.2],
    handF: [-1.5, 30.5, -0.6], handB: [-6, 27.5, -0.6] }));
  P.push(pose({ hipX: -1.4, hipY: 22.9, lean: -3, torso: 12.9, headX: -1, headY: -0.2, headTilt: -0.2,
    footF: [3.2, REST.ankle, -0.15], footB: [-5.8, REST.ankle, 0.14],
    handF: [0.5, 28.5, -0.4], handB: [-5, 26, -0.4] }));

  return P;
}

const PLAYER_FRAME_COUNT = 65;

/* ------------------------------------------------------------------- NPCs */
// society.js still draws NPCs on the legacy 8-frame layout: idle x2, walk x4,
// talk, work. Same rig, smaller frame.
function npcPoses() {
  const all = playerPoses();
  return [all[0], all[2], all[4], all[6], all[8], all[10], all[61], all[59]];
}

/* --------------------------------------------------------------- infected
 *
 * Frame map (must match INFECTED_ANIMATIONS):
 *   0-1 idle · 2-7 walk · 8-11 investigate · 12-17 chase · 18-21 lurch
 *   22-23 attack_windup · 24-25 attack · 26 hurt · 27-28 stagger
 *   29 knocked · 30-31 getup · 32 dormant
 */

// Per-form posture. This is where "Corredor" stops looking like "Errante".
const FORMS = {
  wanderer: { lean: 3.4, torso: 12.4, headX: 1.4, headY: -1, headTilt: 0.2, arm: 5, armY: 19.5, spread: 2.4, stride: 4.4, speed: 1 },
  runner:   { lean: 5.6, torso: 12, headX: 2, headY: -1.6, headTilt: 0.34, arm: -1.5, armY: 24, spread: 1.4, stride: 7.4, speed: 1.35, lift: 5.6 },
  stalker:  { lean: 1.8, torso: 13.4, headX: 2, headY: -0.6, headTilt: 0.26, arm: 2, armY: 18, spread: 1.2, stride: 3.6, speed: .9 },
  heavy:    { lean: 2.8, torso: 12.8, headX: 1, headY: -1.4, headTilt: 0.16, arm: 6, armY: 20.5, spread: 3.8, stride: 3.6, speed: .8, build: 2 },
  screamer: { lean: -1.4, torso: 13.4, headX: 0.2, headY: 1.4, headTilt: -0.34, arm: -3, armY: 25.5, spread: 3, stride: 4, speed: 1.05 },
  lurcher:  { lean: 4, torso: 11.8, headX: 1.8, headY: -1.4, headTilt: 0.26, arm: 4.5, armY: 20.5, spread: 2.8, stride: 4.6, speed: 1, drag: 0.85 },
  armored:  { lean: 2.4, torso: 12.8, headX: 0.8, headY: -0.6, headTilt: 0.12, arm: 4.5, armY: 21, spread: 3.2, stride: 3.4, speed: .82, build: 1 },
  contained:{ lean: 2, torso: 13, headX: 0.6, headY: -0.4, headTilt: 0.1, arm: 4, armY: 21.5, spread: 3, stride: 3.2, speed: .78, build: 1.4 }
};

// The infected gait is a shamble: a long, flat-footed stance and a swing leg
// that barely clears the floor. Speed scales the stride, not the anatomy.
function shamble(t, f, rate = 1, extra = {}) {
  const stride = f.stride * rate;
  const drag = f.drag || 0;
  const F = legCycle(t, { stride, stanceEnd: rate > 1.1 ? 0.48 : 0.62, lift: (f.lift || 2.6) * rate, drag: 0 });
  const B = legCycle(t + 0.5, { stride: stride * (drag ? 0.55 : 1), stanceEnd: drag ? 0.74 : (rate > 1.1 ? 0.48 : 0.62), lift: (f.lift || 2.6) * rate, drag });
  const dip = (rate > 1.1 ? 1.5 : 0.9) * (0.5 + 0.5 * Math.cos(2 * t * TAU));
  const sway = Math.sin(t * TAU) * (drag ? 1.5 : 0.6);
  return pose({
    hipX: (extra.hipX || 0) - 0.6,
    hipY: 23.4 - dip,
    lean: f.lean + (extra.lean || 0),
    torso: f.torso - (drag ? Math.max(0, sway) * 0.5 : 0),
    headX: f.headX + (extra.headX || 0) + sway * 0.3,
    headY: f.headY - dip * 0.3,
    headTilt: f.headTilt,
    footF: [F[0] + 1.6, F[1], F[2]],
    footB: [B[0] - 1.6, B[1], B[2]],
    handF: [f.arm + f.spread + Math.sin(t * TAU) * 1.4, f.armY + Math.cos(t * TAU) * 1.1, 0.2],
    handB: [f.arm - f.spread * 0.7 + Math.sin(t * TAU + 2) * 1.2, f.armY - 1 + Math.cos(t * TAU + 2) * 1, 0.2]
  });
}

function infectedPoses(formName = 'wanderer') {
  const f = FORMS[formName] || FORMS.wanderer;
  const P = [];

  // 0-1 idle: swaying on the spot
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1;
    P.push(pose({
      hipX: -0.6 + s * 0.4, hipY: 23.6, lean: f.lean - 0.6, torso: f.torso,
      headX: f.headX + s * 0.5, headY: f.headY, headTilt: f.headTilt,
      footF: [3.2, REST.ankle, 0], footB: [-3.8, REST.ankle, 0],
      handF: [f.arm + f.spread, f.armY + s * 0.6, 0.2],
      handB: [f.arm - f.spread * 0.8, f.armY - 1 - s * 0.6, 0.2]
    }));
  }

  // 2-7 walk, 8-11 investigate (a shade quicker, head scanning), 12-17 chase
  for (let i = 0; i < 6; i++) P.push(shamble(i / 6, f));
  for (let i = 0; i < 4; i++) P.push(shamble(i / 4, f, 1.05, { headX: (i % 2 ? 1.4 : -1), lean: 0.6 }));
  for (let i = 0; i < 6; i++) P.push(shamble(i / 6, f, f.speed > 1.2 ? 1.25 : 1.2, { lean: 2 }));

  // 18-21 lurch: the committed short charge — arms thrown forward, body ahead
  // of the feet. This is the read the Cambaleante needs.
  for (let i = 0; i < 4; i++) {
    const k = i / 4;
    const throwOut = Math.sin(k * Math.PI);
    P.push(pose({
      hipX: 0.6, hipY: 22.6 - throwOut * 0.9,
      lean: f.lean + 2.6 + throwOut * 1.6, torso: f.torso - 0.4,
      headX: f.headX + 0.8, headY: f.headY - 0.4, headTilt: f.headTilt + 0.12,
      footF: [4 + throwOut * 5.5, REST.ankle + throwOut * 3.5, -0.2],
      footB: [-5.5 - throwOut * 2, REST.ankle, 0.4],
      handF: [f.arm + 4 + throwOut * 3.4, f.armY + 2 + throwOut * 1.5, 0.35],
      handB: [f.arm + 1.5 + throwOut * 3.5, f.armY + 0.5 + throwOut * 1.2, 0.35]
    }));
  }

  // 22-23 attack windup: pull back and rise — the tell the player reads
  P.push(pose({
    hipX: -1.6, hipY: 23.2, lean: f.lean - 3.4, torso: f.torso + 1.4,
    headX: f.headX - 0.6, headY: f.headY + 1.4, headTilt: f.headTilt - 0.26,
    footF: [3, REST.ankle, -0.1], footB: [-5.4, REST.ankle, 0.16],
    handF: [f.arm - 3.5, f.armY + 7.5, -0.5], handB: [f.arm - 5.5, f.armY + 6, -0.5]
  }));
  P.push(pose({
    hipX: -2.4, hipY: 22.8, lean: f.lean - 5, torso: f.torso + 2,
    headX: f.headX - 1.2, headY: f.headY + 2.2, headTilt: f.headTilt - 0.36,
    footF: [2.2, REST.ankle + 0.8, -0.2], footB: [-6, REST.ankle, 0.2],
    handF: [f.arm - 5.5, f.armY + 10.5, -0.8], handB: [f.arm - 7.5, f.armY + 8.5, -0.8]
  }));
  // 24-25 attack: both arms driven forward and down
  P.push(pose({
    hipX: 1.8, hipY: 22.2, lean: f.lean + 4.6, torso: f.torso - 0.6,
    headX: f.headX + 2.4, headY: f.headY - 0.6, headTilt: f.headTilt + 0.22,
    footF: [7.6, REST.ankle, 0.1], footB: [-5.6, REST.ankle, 0.44],
    handF: [f.arm + 6.5, f.armY + 3.5, 0.5], handB: [f.arm + 4.5, f.armY + 1.5, 0.5]
  }));
  P.push(pose({
    hipX: 1.4, hipY: 22.6, lean: f.lean + 3.4, torso: f.torso - 0.4,
    headX: f.headX + 1.8, headY: f.headY - 0.4, headTilt: f.headTilt + 0.16,
    footF: [6.8, REST.ankle, 0.08], footB: [-5.2, REST.ankle, 0.36],
    handF: [f.arm + 7, f.armY - 1, 0.6], handB: [f.arm + 5, f.armY - 2, 0.6]
  }));

  // 26 hurt — folded around the hit
  P.push(pose({
    hipX: -2.2, hipY: 22.4, lean: f.lean - 4.2, torso: f.torso - 0.8,
    headX: f.headX - 2.4, headY: f.headY - 1, headTilt: f.headTilt - 0.3,
    footF: [2, REST.ankle + 1.2, -0.3], footB: [-6.2, REST.ankle, 0.2],
    handF: [f.arm - 2, f.armY + 4, -0.4], handB: [f.arm - 5, f.armY + 2.5, -0.4]
  }));
  // 27-28 stagger — losing the feet, arms flailing for balance
  P.push(pose({
    hipX: -3.4, hipY: 21.6, lean: f.lean - 6, torso: f.torso - 1,
    headX: f.headX - 3.4, headY: f.headY - 1.6, headTilt: f.headTilt - 0.42,
    footF: [-1, REST.ankle + 2.4, -0.4], footB: [-7.4, REST.ankle, 0.26],
    handF: [f.arm - 4, f.armY + 8, -0.7], handB: [f.arm - 8, f.armY + 5, -0.7]
  }));
  P.push(pose({
    hipX: -3.8, hipY: 20.4, lean: f.lean - 6.4, torso: f.torso - 1.4,
    headX: f.headX - 4.4, headY: f.headY - 2.4, headTilt: f.headTilt - 0.5,
    footF: [-2.6, REST.ankle + 1, -0.3], footB: [-8.4, REST.ankle, 0.3],
    handF: [f.arm - 4.5, f.armY + 9.5, -0.9], handB: [f.arm - 7.5, f.armY + 6, -0.9]
  }));
  // 29 knocked — down and folded (enemies.js also rotates the sprite)
  P.push(pose({
    hipX: -3, hipY: 8.5, lean: 3, torso: 10.5,
    headX: 2.2, headY: -1.6, headTilt: 0.4,
    footF: [4.5, REST.ankle, 0.1], footB: [-5.5, REST.ankle, 0.1],
    handF: [6.5, 6.5, 0.4], handB: [1.5, 6, 0.4]
  }));
  // 30-31 getup — pushing off the floor onto one knee, then rising
  P.push(pose({
    hipX: -2.4, hipY: 12.5, lean: 4.6, torso: 11.4,
    headX: 2.4, headY: -1, headTilt: 0.34,
    footF: [5.5, REST.ankle, 0], footB: [-6, REST.ankle, 0.1],
    handF: [8.5, 10, 0.4], handB: [2.5, 9, 0.4]
  }));
  P.push(pose({
    hipX: -1.6, hipY: 18, lean: f.lean + 2.4, torso: f.torso - 0.6,
    headX: f.headX + 1, headY: f.headY - 0.6, headTilt: f.headTilt + 0.14,
    footF: [5, REST.ankle, 0], footB: [-5.4, REST.ankle, 0.1],
    handF: [f.arm + 3.5, f.armY - 5, 0.3], handB: [f.arm - 1, f.armY - 6, 0.3]
  }));
  // 32 dormant — slumped, head down, barely upright
  P.push(pose({
    hipX: -2.6, hipY: 15.5, lean: 5.4, torso: 10.8,
    headX: 2.8, headY: -2.6, headTilt: 0.5,
    footF: [4.4, REST.ankle, 0.1], footB: [-4.8, REST.ankle, 0.1],
    handF: [6.5, 12.5, 0.35], handB: [1.5, 11.5, 0.35]
  }));

  return P;
}

const INFECTED_FRAME_COUNT = 33;

module.exports = { playerPoses, npcPoses, infectedPoses, gait, legCycle, armCycle, FORMS, PLAYER_FRAME_COUNT, INFECTED_FRAME_COUNT };
