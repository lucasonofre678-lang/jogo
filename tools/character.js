// LAST COUNTY — Stage 25 parametric character renderer.
//
// One rig drives the player, every clothing overlay, the infected and the NPCs
// so the whole cast shares proportions, lighting and weight.
//
// Poses are authored as IK targets — where the foot and the hand actually are —
// instead of joint angles. Feet therefore stay planted on the ground line by
// construction, and the hand position used to anchor held weapons can be read
// straight back out of the solver (see handAnchor()).
//
// Pose coordinates: x is pixels right of frame.cx, y is pixels UP from
// frame.ground. "the hip sits 24px above the floor" is literally what it says.
const { Img, shade, mix, hash } = require('./pixel');

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// Frame geometry. The player/infected frame is deliberately wider and taller
// than the collision box so swung arms, long coats and raised tools have room.
const FRAME     = { w: 48, h: 64, cx: 24, ground: 62 };
const NPC_FRAME = { w: 32, h: 56, cx: 16, ground: 54 };

const BONES = { thigh: 11, shin: 9, foot: 4, torso: 13, neck: 2, head: 11, headW: 9, upper: 8, fore: 7 };

// Rest heights above the ground line.
const REST = {
  ankle: BONES.foot,                                             //  4
  knee: BONES.foot + BONES.shin,                                 // 13
  hip: BONES.foot + BONES.shin + BONES.thigh,                    // 24
  shoulder: BONES.foot + BONES.shin + BONES.thigh + BONES.torso, // 37
  hand: BONES.foot + BONES.shin + BONES.thigh + BONES.torso - BONES.upper - BONES.fore // 22
};

// Key light: high and slightly in front. Mirroring the sprite mirrors the key,
// which is the usual side-scroller compromise and reads fine in motion.
const LIGHT = { x: 0.38, y: -0.92 };

/* ------------------------------------------------------------- primitives */

// Tapered thick line with a per-pixel lighting ramp across its width. Used for
// every limb, so arms and legs keep the same material read at any angle.
function stroke(img, ax, ay, bx, by, w0, w1, color, opts = {}) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy) || 0.0001;
  const px = -dy / len, py = dx / len;
  const lit = opts.light ?? 0.30;
  const steps = Math.max(2, Math.ceil(len * 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cxp = ax + dx * t, cyp = ay + dy * t;
    const w = w0 + (w1 - w0) * t;
    const n = Math.max(1, Math.round(w));
    const start = -Math.floor((n - 1) / 2);
    for (let k = 0; k < n; k++) {
      const off = start + k;
      const s = n === 1 ? 0 : off / Math.max(0.5, (n - 1) / 2);
      const l = px * s * LIGHT.x + py * s * LIGHT.y;
      const amt = l * lit * Math.min(1, Math.abs(s) * 1.45);
      img.set(Math.round(cxp + px * off), Math.round(cyp + py * off), shade(color, amt));
    }
  }
}

// Rounds off a joint so elbows/knees do not read as a snapped corner.
function joint(img, x, y, r, color) {
  img.ellipse(x, y, r, r, color);
  img.set(Math.round(x - r * 0.4), Math.round(y - r * 0.5), shade(color, 0.16));
}

// Two-bone IK. bend = +1 / -1 picks which side the knee/elbow falls on.
function ik(ax, ay, tx, ty, l1, l2, bend) {
  let dx = tx - ax, dy = ty - ay;
  let d = Math.hypot(dx, dy);
  if (d < 0.0001) { dx = 0; dy = 0.0001; d = 0.0001; }
  const ux = dx / d, uy = dy / d;
  const dc = clamp(d, Math.abs(l1 - l2) + 0.02, l1 + l2 - 0.02);
  const a = (l1 * l1 - l2 * l2 + dc * dc) / (2 * dc);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  return { x: ax + ux * a - uy * h * bend, y: ay + uy * a + ux * h * bend };
}

/* ------------------------------------------------------------------ poses */

const DEFAULT_POSE = {
  hipX: 0, hipY: REST.hip,
  lean: 0,                 // shoulder x offset from the hip (forward lean)
  torso: BONES.torso,      // shoulder height above the hip (shrinks when hunched)
  headX: 0, headY: 0, headTilt: 0,
  footF: [3, REST.ankle, 0],   // x, y, toe pitch (radians, + = toe down)
  footB: [-3, REST.ankle, 0],
  handF: [3, REST.hand, -0.2], // x, y, wrist roll
  handB: [-3, REST.hand, -0.2],
  squash: 0                // >0 compresses the whole figure vertically
};

function pose(p = {}) { return { ...DEFAULT_POSE, ...p }; }

// Solves a pose into sprite-space joints. Everything downstream (body parts,
// garments, hand anchors) reads this one structure.
function solve(p, frame = FRAME, style = {}) {
  const sq = 1 - (p.squash || 0);
  const X = x => frame.cx + x;
  const Y = y => frame.ground - y * sq;

  const hip = { x: X(p.hipX), y: Y(p.hipY) };
  // `lean` is how far forward the shoulders are carried; `torso` is the spine
  // LENGTH, so leaning shortens the standing height instead of stretching the
  // body out of its frame. Clamped so a stacked lean can never go horizontal.
  const lean = clamp(p.lean, -p.torso * 0.78, p.torso * 0.78);
  const rise = Math.sqrt(Math.max(1, p.torso * p.torso - lean * lean));
  const sh = { x: X(p.hipX + lean), y: Y(p.hipY + rise) };

  // Spine direction, reused for the neck, head and every torso garment.
  const sdx = sh.x - hip.x, sdy = sh.y - hip.y;
  const slen = Math.hypot(sdx, sdy) || 1;
  const sux = sdx / slen, suy = sdy / slen;

  const neck = { x: sh.x + sux * BONES.neck, y: sh.y + suy * BONES.neck };
  const tilt = p.headTilt || 0;
  const hux = sux * Math.cos(tilt) - suy * Math.sin(tilt);
  const huy = sux * Math.sin(tilt) + suy * Math.cos(tilt);
  const headR = BONES.head / 2 + 0.5;
  // Safety rails so a stacked extreme (deep lean + reach + a wide helmet) can
  // never push art past its cell. They only bite at the very ends of the range.
  const reach = frame.w / 2;
  const head = {
    x: clamp(neck.x + hux * headR + (p.headX || 0), X(-(reach - 12)), X(reach - 12)),
    y: neck.y + huy * headR - (p.headY || 0),
    hw: (style.headW || BONES.headW) / 2,
    hh: BONES.head / 2
  };

  const legs = {};
  for (const [key, src, hx] of [['F', p.footF, 2], ['B', p.footB, -2]]) {
    const ankle = { x: clamp(X(src[0]), X(-(reach - 9)), X(reach - 9)), y: Y(src[1]) };
    const root = { x: hip.x + hx * 0.9, y: hip.y };
    const knee = ik(root.x, root.y, ankle.x, ankle.y, BONES.thigh, BONES.shin, -1);
    legs[key] = { hip: root, knee, ankle, toe: src[2] || 0 };
  }

  const arms = {};
  for (const [key, src, hx] of [['F', p.handF, 2.5], ['B', p.handB, -2.5]]) {
    const hand = { x: clamp(X(src[0]), X(-(reach - 5)), X(reach - 5)), y: Y(src[1]) };
    const root = { x: sh.x + hx, y: sh.y + 1 };
    const elbow = ik(root.x, root.y, hand.x, hand.y, BONES.upper, BONES.fore, 1);
    arms[key] = { sh: root, elbow, hand, roll: src[2] || 0 };
  }

  return { frame, hip, sh, neck, head, legs, arms, spine: { x: sux, y: suy },
    build: style.build || 0, sq, floor: frame.ground - 1 };
}

/* ------------------------------------------------------------- body parts */

function drawLeg(img, L, c, build, opts = {}) {
  const w = 5 + build;
  stroke(img, L.hip.x, L.hip.y, L.knee.x, L.knee.y, w + 1, w - 0.5, c);
  stroke(img, L.knee.x, L.knee.y, L.ankle.x, L.ankle.y, w - 0.5, w - 2, opts.shin || c);
  joint(img, L.knee.x, L.knee.y, (w - 1) / 2, c);
}

// Boot/shoe. Drawn from the ankle forward so the sole lands on the floor line.
function drawFoot(img, L, c, dir, opts = {}) {
  const len = opts.len || 7, back = opts.back || 2, h = opts.h || 4;
  const pitch = L.toe;
  const ax = L.ankle.x, ay = L.ankle.y;
  const fx = Math.cos(pitch) * dir, fy = Math.sin(pitch);
  const sole = shade(c, -0.34), top = shade(c, 0.17);
  // A pitched foot must never punch through the floor line: the sole flattens
  // against it instead, which is also what a foot pressed on the ground does.
  const floor = opts.floor ?? Infinity;
  for (let j = 0; j < h; j++) {
    const t = j / Math.max(1, h - 1);
    const fl = len - t * 0.8;
    for (let i = -back; i <= fl; i++) {
      const x = ax + fx * i, y = Math.min(floor, ay + fy * i + j);
      img.set(Math.round(x), Math.round(y), j === 0 && y < floor ? top : j === h - 1 || y >= floor ? sole : c);
    }
  }
  // ankle collar + toe cap read the boot as a boot even at a glance
  img.set(Math.round(ax - dir), Math.round(ay - 1), shade(c, 0.1));
  if (opts.cap) for (let j = 0; j < h - 1; j++) img.set(Math.round(ax + fx * (len - 1)), Math.round(ay + fy * (len - 1) + j), shade(opts.cap, j ? -0.1 : 0.2));
}

function drawArm(img, A, c, build, opts = {}) {
  const w = 4 + build * 0.8;
  // A dark under-stroke first: without it a relaxed arm disappears into the
  // torso it is hanging against, which was the weakest read in the old sheets.
  if (opts.edge !== false) {
    const e = opts.edge || shade(c, -0.48);
    stroke(img, A.sh.x, A.sh.y, A.elbow.x, A.elbow.y, w + 2, w + 1, e, { light: 0 });
    stroke(img, A.elbow.x, A.elbow.y, A.hand.x, A.hand.y, w + 1, w + 0.4, e, { light: 0 });
  }
  stroke(img, A.sh.x, A.sh.y, A.elbow.x, A.elbow.y, w + 0.6, w - 0.6, c);
  stroke(img, A.elbow.x, A.elbow.y, A.hand.x, A.hand.y, w - 0.6, w - 1.4, opts.fore || c);
  joint(img, A.elbow.x, A.elbow.y, (w - 1.4) / 2, c);
}

function drawHand(img, A, skin, dir) {
  img.ellipse(A.hand.x, A.hand.y, 1.9, 2.1, skin);
  img.set(Math.round(A.hand.x - dir), Math.round(A.hand.y - 1), shade(skin, 0.18));
  img.set(Math.round(A.hand.x), Math.round(A.hand.y + 2), shade(skin, -0.3));
}

function drawTorso(img, J, st) {
  const { hip, sh } = J;
  const b = J.build;
  const shW = (st.shoulderW || 13) + b * 2;
  const waistW = (st.waistW || 9.5) + b * 1.6;
  const top = st.top, light = st.topLight || shade(top, 0.18);
  stroke(img, hip.x, hip.y + 1, sh.x, sh.y, waistW, shW, top, { light: 0.26 });

  // shoulder cap + collar
  const perp = { x: -J.spine.y, y: J.spine.x };
  const half = shW / 2;
  for (let k = -half; k <= half; k += 0.6) {
    img.set(Math.round(sh.x + perp.x * k), Math.round(sh.y + perp.y * k), shade(top, k < 0 ? 0.16 : 0.04));
  }
  img.ellipse(J.neck.x, J.neck.y + 1.4, 2.8, 2.0, shade(top, -0.26));

  // a single fold down the front does more for volume than noise
  for (let t = 0.25; t < 0.9; t += 0.12) {
    const x = hip.x + (sh.x - hip.x) * t, y = hip.y + (sh.y - hip.y) * t;
    const w = waistW + (shW - waistW) * t;
    img.set(Math.round(x + perp.x * w * 0.24), Math.round(y + perp.y * w * 0.24), shade(top, -0.16));
    img.set(Math.round(x - perp.x * w * 0.4), Math.round(y - perp.y * w * 0.4), light);
  }
  if (st.belt) {
    for (let k = -waistW / 2; k <= waistW / 2; k += 0.6) img.set(Math.round(hip.x + perp.x * k), Math.round(hip.y - 1), st.belt);
    img.set(Math.round(hip.x + perp.x * 1.5), Math.round(hip.y - 1), shade(st.belt, 0.4));
  }
  // hips, so the legs do not look pinned onto a rectangle
  img.ellipse(hip.x, hip.y + 1, waistW / 2 + 0.4, 2.6, st.pantsDark || shade(st.pants || top, -0.32));
}

function drawHead(img, J, st, dir) {
  const H = J.head;
  const hw = H.hw, hh = H.hh;
  const skin = st.skin, dk = st.skinShade || shade(skin, -0.3);
  const lt = shade(skin, 0.15);

  // neck — kept narrow so the head reads as a head and not as a shoulder lump
  stroke(img, J.neck.x + J.spine.x * 1.4, J.neck.y + 2, J.neck.x, J.neck.y - 1.2, 4, 3.2, shade(dk, -0.26));

  // skull: rounded cranium, cheekbone, jaw tapering to a chin on the facing side
  for (let j = -hh; j <= hh; j++) {
    const t = j / hh;
    let w = hw * Math.sqrt(Math.max(0, 1 - t * t * 0.86));
    if (t > 0.34) w *= 1 - (t - 0.34) * 0.86;
    const shift = t > 0.1 ? (t - 0.1) * 1.3 * dir : 0;
    const cxr = H.x + shift;
    for (let i = -Math.round(w); i <= Math.round(w); i++) {
      const e = i * dir;
      const c = e > w * 0.45 ? dk : e < -w * 0.55 ? shade(skin, -0.12) : j < -hh * 0.35 ? lt : skin;
      img.set(Math.round(cxr + i), Math.round(H.y + j), c);
    }
  }
  // brow ridge and a nose on the silhouette edge: cheap, but it makes a profile
  img.set(Math.round(H.x + dir * (hw + 0.2)), Math.round(H.y - 0.2), skin);
  img.set(Math.round(H.x + dir * (hw + 0.2)), Math.round(H.y + 0.8), dk);

  if (st.face !== false) {
    const ec = st.eye || '#23201d';
    const ey = Math.round(H.y - 0.4);
    img.set(Math.round(H.x + dir * 1.9), ey, ec);
    img.set(Math.round(H.x + dir * 1.9), ey + 1, shade(skin, -0.34));
    if (st.eyeGlow) img.set(Math.round(H.x + dir * 2.9), ey, st.eyeGlow);
    if (st.brow) for (let i = 0; i <= 2; i++) img.set(Math.round(H.x + dir * (0.9 + i)), ey - 2, st.brow);
    img.set(Math.round(H.x - dir * 2.2), Math.round(H.y + 0.4), dk);            // ear
    img.set(Math.round(H.x + dir * 1.4), Math.round(H.y + 2.6), shade(dk, -0.1)); // mouth
    img.set(Math.round(H.x + dir * 0.4), Math.round(H.y + 2.6), shade(dk, -0.1));
    if (st.stubble) for (let i = -1; i <= 2; i++) {
      if (hash(i, 3, 5) > 0.35) img.set(Math.round(H.x + dir * i), Math.round(H.y + 3.6), st.stubble);
    }
  }

  if (st.hair) {
    const hc = st.hair, style = st.hairStyle || 'short';
    const lo = shade(hc, -0.26), hi = shade(hc, 0.06);
    // A hairline, not a slab: long at the back, short over the temple, with a
    // fringe breaking onto the forehead.
    for (let j = -hh - 2; j <= hh * 0.45; j++) {
      const t = j / hh;
      const w = hw * Math.sqrt(Math.max(0, 1 - t * t * 0.92)) + 0.4;
      if (w < 1.1) continue;                       // no single-pixel spike on the crown
      for (let i = -Math.round(w); i <= Math.round(w); i++) {
        const e = i * dir / Math.max(0.6, w);              // -1 back .. +1 front
        let bottom;
        if (style === 'bald') bottom = -0.66;
        else if (style === 'buzz') bottom = e > 0.2 ? -0.5 : -0.1;
        else if (style === 'long') bottom = e < -0.2 ? 0.95 : e > 0.35 ? -0.28 : -0.05;
        else bottom = e < -0.25 ? 0.2 : e > 0.36 ? -0.46 : -0.22;   // short / messy
        if (style === 'messy' && Math.abs(e) < 0.7 && hash(i, j, 9) > 0.72) bottom += 0.18;
        if (t > bottom) continue;
        img.set(Math.round(H.x + i), Math.round(H.y + j), j <= -hh + 1 ? hi : e > 0.42 ? lo : e < -0.6 ? shade(hc, -0.12) : hc);
      }
    }
    if (style === 'messy') {
      img.set(Math.round(H.x - dir * (hw - 1.5)), Math.round(H.y - hh - 1), hc);
      img.set(Math.round(H.x + dir * 0.5), Math.round(H.y - hh - 1), hi);
      img.set(Math.round(H.x + dir * (hw - 1)), Math.round(H.y - hh * 0.2), lo);
    }
    if (style === 'ponytail') {
      const bx = H.x - dir * (hw - 0.2);
      for (let j = 0; j < 8; j++) for (let i = 0; i < (j > 2 ? 2 : 3); i++) {
        img.set(Math.round(bx - dir * i), Math.round(H.y - hh * 0.2 + j), i === 0 ? hc : lo);
      }
    }
    if (style === 'beard') {
      for (let j = 1; j <= 4; j++) {
        const w = hw * (0.95 - j * 0.16);
        for (let i = -Math.round(w); i <= Math.round(w); i++) img.set(Math.round(H.x + dir * 0.5 + i), Math.round(H.y + 1.4 + j), j > 3 ? lo : shade(hc, -0.05));
      }
    }
  }
}

/* --------------------------------------------------------------- garments */

// Everything below is drawn from the solved skeleton, so an overlay sheet lines
// up with the body sheet frame for frame without any hand-tuned offsets.

function garmentTorso(img, J, c, opts = {}) {
  const { hip, sh } = J;
  const w0 = (opts.waistW || 11) + J.build * 1.6;
  const w1 = (opts.shoulderW || 14) + J.build * 2;
  const from = opts.from ?? 0;
  const ax = hip.x + (sh.x - hip.x) * from, ay = hip.y + (sh.y - hip.y) * from + (opts.drop || 0);
  stroke(img, ax, ay, sh.x, sh.y - (opts.rise || 0), w0 + (w1 - w0) * from, w1, c, { light: 0.24 });
  const perp = { x: -J.spine.y, y: J.spine.x };
  if (opts.collar !== false) {
    img.ellipse(J.neck.x, J.neck.y + 1.4, 3.6, 2.4, shade(c, opts.collarShade ?? -0.26));
    for (let k = -w1 / 2; k <= w1 / 2; k += 0.6) img.set(Math.round(sh.x + perp.x * k), Math.round(sh.y - (opts.rise || 0) + perp.y * k), shade(c, k < 0 ? 0.22 : 0.06));
  }
  if (opts.zip) {
    for (let t = 0.05; t < 0.95; t += 0.09) {
      const x = ax + (sh.x - ax) * t, y = ay + (sh.y - ay) * t;
      const w = (w0 + (w1 - w0) * t) * 0.2;
      img.set(Math.round(x + perp.x * w), Math.round(y + perp.y * w), shade(c, -0.34));
    }
  }
  return { perp, w0, w1 };
}

function garmentSleeves(img, J, c, opts = {}) {
  const w = (opts.w || 4.6) + J.build * 0.8;
  const cuff = opts.cuff || shade(c, -0.28);
  const stop = opts.stop ?? 1;              // 1 = full sleeve, <1 = short
  for (const key of ['B', 'F']) {
    const A = J.arms[key];
    const tint = key === 'B' ? shade(c, -0.2) : c;
    if (stop >= 0.9) {
      stroke(img, A.sh.x, A.sh.y, A.elbow.x, A.elbow.y, w + 0.8, w - 0.4, tint);
      const ex = A.hand.x - (A.hand.x - A.elbow.x) * 0.18, ey = A.hand.y - (A.hand.y - A.elbow.y) * 0.18;
      stroke(img, A.elbow.x, A.elbow.y, ex, ey, w - 0.4, w - 1.2, tint);
      joint(img, A.elbow.x, A.elbow.y, (w - 1.2) / 2, tint);
      img.ellipse(ex, ey, 1.9, 1.9, cuff);
      if (opts.band) {
        const t = opts.bandAt ?? 0.62;
        img.ellipse(A.elbow.x + (A.hand.x - A.elbow.x) * t, A.elbow.y + (A.hand.y - A.elbow.y) * t, 2.3, 1.7, opts.band);
      }
    } else {
      const ex = A.sh.x + (A.elbow.x - A.sh.x) * stop, ey = A.sh.y + (A.elbow.y - A.sh.y) * stop;
      stroke(img, A.sh.x, A.sh.y, ex, ey, w + 0.8, w - 0.2, tint);
      img.ellipse(ex, ey, 2.1, 1.7, cuff);
    }
    if (opts.pad) {
      img.ellipse(A.sh.x + (key === 'F' ? 0.5 : -0.5), A.sh.y - 0.5, 3.4 + J.build * 0.6, 2.8, opts.pad);
      img.ellipse(A.sh.x + (key === 'F' ? 0.5 : -0.5), A.sh.y - 1.4, 3.0 + J.build * 0.6, 1.4, shade(opts.pad, 0.2));
    }
  }
}

// Long coat: hangs from the hip and swings with the legs.
function garmentCoat(img, J, c, len = 10, opts = {}) {
  const swing = (J.legs.F.ankle.x - J.legs.B.ankle.x) * 0.16;
  const w = (opts.w || 13) + J.build * 2;
  for (let j = 0; j < len; j++) {
    const t = j / Math.max(1, len - 1);
    const ww = w + t * (opts.flare ?? 3);
    const cxr = J.hip.x + swing * t * t;
    const y = J.hip.y - 1 + j;
    for (let i = -Math.round(ww / 2); i <= Math.round(ww / 2); i++) {
      // A seam line near the front edge, not a hole through the middle: a gap
      // in the silhouette gets outlined by contour() and splits the garment.
      const seam = t > 0.2 && i > ww * 0.2 && i < ww * 0.3;
      const edge = i < -ww * 0.34 ? shade(c, 0.16) : i > ww * 0.3 ? shade(c, -0.3) : c;
      img.set(Math.round(cxr + i), Math.round(y), j === len - 1 ? shade(c, -0.36) : seam ? shade(c, -0.34) : edge);
    }
  }
  if (opts.band) {
    const j = Math.max(1, Math.round(len * 0.45));
    const ww = w + (j / len) * (opts.flare ?? 3);
    for (let i = -Math.round(ww / 2); i <= Math.round(ww / 2); i++) {
      img.set(Math.round(J.hip.x + i), Math.round(J.hip.y - 1 + j), i % 3 === 0 ? shade(opts.band, 0.25) : opts.band);
    }
  }
}

function garmentVest(img, J, c, opts = {}) {
  const perp = { x: -J.spine.y, y: J.spine.x };
  const w = (opts.w || 13) + J.build * 2;
  const top = opts.top ?? 0.12, bottom = opts.bottom ?? 0.94;
  for (let t = top; t <= bottom; t += 0.055) {
    const x = J.sh.x + (J.hip.x - J.sh.x) * t, y = J.sh.y + (J.hip.y - J.sh.y) * t;
    const ww = w - t * 1.4;
    for (let k = -ww / 2; k <= ww / 2; k += 0.6) {
      const edge = k < -ww * 0.3 ? shade(c, 0.18) : k > ww * 0.28 ? shade(c, -0.3) : c;
      img.set(Math.round(x + perp.x * k), Math.round(y + perp.y * k), edge);
    }
  }
  for (const tt of opts.stripe ? (opts.stripeAt || [0.34, 0.52]) : []) {
    const x = J.sh.x + (J.hip.x - J.sh.x) * tt, y = J.sh.y + (J.hip.y - J.sh.y) * tt;
    const ww = w - tt * 1.4;
    for (let k = -ww / 2; k <= ww / 2; k += 0.6) img.set(Math.round(x + perp.x * k), Math.round(y + perp.y * k), opts.stripe);
  }
  if (opts.pouch) {
    const x = J.sh.x + (J.hip.x - J.sh.x) * 0.62, y = J.sh.y + (J.hip.y - J.sh.y) * 0.62;
    for (const side of [-1, 1]) {
      img.ellipse(x + perp.x * side * w * 0.28, y + perp.y * side * w * 0.28, 2.3, 2.6, opts.pouch);
      img.set(Math.round(x + perp.x * side * w * 0.28), Math.round(y + perp.y * side * w * 0.28 - 2), shade(opts.pouch, 0.28));
    }
  }
  if (opts.patch) {
    const x = J.sh.x + (J.hip.x - J.sh.x) * 0.3, y = J.sh.y + (J.hip.y - J.sh.y) * 0.3;
    img.rect(Math.round(x + perp.x * w * 0.16), Math.round(y - 1), 3, 3, opts.patch);
  }
}

function garmentLegs(img, J, c, opts = {}) {
  const w = (opts.w || 6) + J.build;
  const to = opts.to ?? 1;
  for (const key of ['B', 'F']) {
    const L = J.legs[key];
    const tint = key === 'B' ? shade(c, -0.22) : c;
    stroke(img, L.hip.x, L.hip.y, L.knee.x, L.knee.y, w + 1, w - 0.4, tint);
    if (to > 0.5) {
      const ex = L.knee.x + (L.ankle.x - L.knee.x) * to, ey = L.knee.y + (L.ankle.y - L.knee.y) * to;
      stroke(img, L.knee.x, L.knee.y, ex, ey, w - 0.4, w - 1.6, tint);
      if (opts.band) img.ellipse(ex, ey - 0.5, w / 2 + 0.2, 1.4, opts.band);
    }
  }
}

function garmentBoots(img, J, c, dir, opts = {}) {
  const h = opts.shaft || 4;
  for (const key of ['B', 'F']) {
    const L = J.legs[key];
    const tint = key === 'B' ? shade(c, -0.22) : c;
    const dx = L.knee.x - L.ankle.x, dy = L.knee.y - L.ankle.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    stroke(img, L.ankle.x, L.ankle.y, L.ankle.x + ux * h, L.ankle.y + uy * h, 6 + J.build, 5.4 + J.build, tint);
    drawFoot(img, L, tint, dir, { len: opts.len || 7, h: opts.h || 4, cap: opts.cap, floor: J.floor });
    if (opts.band) img.ellipse(L.ankle.x + ux * h, L.ankle.y + uy * h, 3.2, 1.3, opts.band);
  }
}

function garmentHelmet(img, J, c, dir, opts = {}) {
  const H = J.head;
  const hw = H.hw + (opts.grow ?? 1.4), hh = H.hh;
  const crown = opts.crown ?? 0.55;
  for (let j = -hh - 2; j <= hh * crown; j++) {
    const t = j / hh;
    let w = hw * Math.sqrt(Math.max(0, 1 - t * t * 0.88));
    if (j < -hh * 0.9) w *= 0.9;
    if (w < 1.1) continue;
    for (let i = -Math.round(w); i <= Math.round(w); i++) {
      const edge = i * dir < -w * 0.5 ? shade(c, 0.22) : i * dir > w * 0.45 ? shade(c, -0.3) : c;
      img.set(Math.round(H.x + i), Math.round(H.y + j), j <= -hh ? shade(c, 0.3) : edge);
    }
  }
  if (opts.brim) {
    const by = Math.round(H.y - hh * 0.12);
    const bl = opts.brimLen || 5;
    for (let j = 0; j < (opts.brimH || 2); j++) {
      for (let i = -Math.round(hw * (opts.brimBack ?? 0.9)); i <= Math.round(hw + bl); i++) {
        img.set(Math.round(H.x + i * dir), by + j, j === 0 ? shade(opts.brim, 0.18) : shade(opts.brim, -0.22));
      }
    }
  }
  if (opts.visor) {
    for (let j = 0; j < (opts.visorH || 4); j++) {
      for (let i = -2; i <= Math.round(hw + 0.5); i++) {
        img.set(Math.round(H.x + i * dir), Math.round(H.y - hh * 0.1 + j), j === 0 ? shade(opts.visor, 0.34) : i * dir > hw * 0.4 ? shade(opts.visor, -0.25) : opts.visor);
      }
    }
  }
  if (opts.lamp) {
    img.ellipse(H.x + dir * (hw - 1.4), H.y - hh * 0.75, 2.1, 2.0, opts.lamp);
    img.set(Math.round(H.x + dir * (hw - 0.6)), Math.round(H.y - hh * 0.75), shade(opts.lamp, 0.45));
  }
  if (opts.crest) for (let i = -Math.round(hw * 0.55); i <= Math.round(hw * 0.55); i++) img.set(Math.round(H.x + i), Math.round(H.y - hh - 1), opts.crest);
  if (opts.stripe) for (let i = -Math.round(hw * 0.8); i <= Math.round(hw * 0.8); i++) img.set(Math.round(H.x + i), Math.round(H.y - hh * 0.55), opts.stripe);
}

function garmentBeanie(img, J, c, dir, opts = {}) {
  const H = J.head;
  const hw = H.hw + 0.8, hh = H.hh;
  for (let j = -hh - 3; j <= hh * 0.18; j++) {
    const t = j / (hh + 1);
    const w = (hw + 0.4) * Math.sqrt(Math.max(0, 1 - t * t * 0.9));
    if (w < 1.1) continue;
    for (let i = -Math.round(w); i <= Math.round(w); i++) {
      img.set(Math.round(H.x + i), Math.round(H.y + j), j >= hh * 0.02 ? shade(c, -0.26) : i * dir < -w * 0.5 ? shade(c, 0.2) : i * dir > w * 0.45 ? shade(c, -0.24) : c);
    }
  }
  if (opts.pom) img.ellipse(H.x - dir * 0.5, H.y - hh - 3, 1.8, 1.6, shade(c, 0.28));
}

function garmentCap(img, J, c, dir) {
  const H = J.head;
  const hw = H.hw + 0.6, hh = H.hh;
  for (let j = -hh - 2; j <= -hh * 0.1; j++) {
    const t = j / hh;
    const w = hw * Math.sqrt(Math.max(0, 1 - t * t * 0.9));
    if (w < 1.1) continue;
    for (let i = -Math.round(w); i <= Math.round(w); i++) img.set(Math.round(H.x + i), Math.round(H.y + j), j <= -hh + 1 ? shade(c, 0.26) : i * dir > w * 0.45 ? shade(c, -0.28) : c);
  }
  for (let i = 0; i <= 4; i++) {
    img.set(Math.round(H.x + dir * (hw - 0.5 + i)), Math.round(H.y - hh * 0.1), shade(c, -0.14));
    img.set(Math.round(H.x + dir * (hw - 0.5 + i)), Math.round(H.y - hh * 0.1 + 1), shade(c, -0.34));
  }
}

function garmentMask(img, J, c, dir, opts = {}) {
  const H = J.head;
  const hw = H.hw, hh = H.hh;
  for (let j = 0; j <= hh * 0.62; j++) {
    const t = j / hh;
    const w = hw * (0.95 - t * 0.35);
    for (let i = -Math.round(w); i <= Math.round(w * 1.05); i++) {
      img.set(Math.round(H.x + i * dir), Math.round(H.y + j), j === 0 ? shade(c, 0.24) : i * dir > w * 0.4 ? shade(c, -0.26) : c);
    }
  }
  // filter canister on the facing side
  img.ellipse(H.x + dir * (hw + 0.4), H.y + 2.4, 2.4, 2.2, shade(c, -0.22));
  img.set(Math.round(H.x + dir * (hw + 1.2)), Math.round(H.y + 1.6), shade(c, 0.3));
  for (let i = -Math.round(hw); i <= -1; i++) img.set(Math.round(H.x + i * dir), Math.round(H.y - 0.6), shade(c, -0.3));  // strap
  if (opts.lens) {
    img.ellipse(H.x + dir * 2.2, H.y - 1.4, 2.6, 2.0, opts.lens);
    img.set(Math.round(H.x + dir * 1.4), Math.round(H.y - 2), shade(opts.lens, 0.4));
  }
}

function garmentGoggles(img, J, c, dir) {
  const H = J.head;
  const hw = H.hw;
  for (let i = -Math.round(hw); i <= Math.round(hw * 0.95); i++) {
    img.set(Math.round(H.x + i * dir), Math.round(H.y - 1.6), shade(c, -0.3));
    img.set(Math.round(H.x + i * dir), Math.round(H.y - 0.6), i * dir > 0 ? c : shade(c, -0.18));
  }
  img.set(Math.round(H.x + dir * 2.4), Math.round(H.y - 1.6), shade(c, 0.45));
}

function garmentPack(img, J, c, dir, opts = {}) {
  const perp = { x: -J.spine.y, y: J.spine.x };
  const back = dir > 0 ? -1 : 1;
  const bx = J.sh.x + perp.x * back * 5.2 + (J.hip.x - J.sh.x) * 0.1;
  const by = J.sh.y + perp.y * back * 5.2 + (J.hip.y - J.sh.y) * 0.1;
  const h = opts.h || 11, w = opts.w || 6;
  for (let j = -2; j < h - 2; j++) {
    const t = (j + 2) / h;
    const ww = w * (j < 0 || j > h - 5 ? 0.82 : 1);
    for (let i = -Math.round(ww / 2); i <= Math.round(ww / 2); i++) {
      const edge = i * dir < -ww * 0.3 ? shade(c, 0.2) : i * dir > ww * 0.25 ? shade(c, -0.3) : c;
      img.set(Math.round(bx + i), Math.round(by + j), j === -2 ? shade(c, 0.26) : j === h - 3 ? shade(c, -0.36) : edge);
    }
    if (t > 0.3 && t < 0.62) for (let i = -2; i <= 2; i++) img.set(Math.round(bx + i), Math.round(by + j), shade(c, -0.2));
  }
  // straps over the shoulders
  for (let k = 0; k <= 6; k++) {
    img.set(Math.round(bx + (J.sh.x - bx) * (k / 6)), Math.round(by - 1 + (J.sh.y - 1 - by) * (k / 6)), shade(c, -0.12));
  }
  if (opts.roll) img.ellipse(bx, by + h - 2.5, w / 2 + 0.6, 1.8, shade(opts.roll, -0.05));
}

/* ------------------------------------------------------------ composition */

// layers switches body parts off; style.garments injects overlay art at the
// right depth (behind the torso, over the legs, on the head, and so on).
function drawCharacter(img, ox, style, p, layers = {}, frame = FRAME) {
  const want = k => layers[k] !== false;
  const dir = 1;
  const J = solve(p, frame, style);
  J.hip.x += ox; J.sh.x += ox; J.neck.x += ox; J.head.x += ox;
  for (const k of ['F', 'B']) {
    J.legs[k].hip.x += ox; J.legs[k].knee.x += ox; J.legs[k].ankle.x += ox;
    J.arms[k].sh.x += ox; J.arms[k].elbow.x += ox; J.arms[k].hand.x += ox;
  }

  const st = { skin: '#c08d68', top: '#4f5a45', pants: '#39414c', boots: '#2c2722', ...style };
  st.skinShade = st.skinShade || shade(st.skin, -0.3);
  st.topDark = st.topDark || shade(st.top, -0.3);
  st.topLight = st.topLight || shade(st.top, 0.18);
  st.pantsDark = st.pantsDark || shade(st.pants, -0.3);

  const g = style.garments || {};
  const run = slot => { const fn = g[slot]; if (fn) fn(img, J, dir, st); };

  if (want('arms')) { drawArm(img, J.arms.B, shade(st.top, -0.34), J.build); if (want('hands')) drawHand(img, J.arms.B, st.skinShade, dir); }
  if (want('legs')) drawLeg(img, J.legs.B, st.pantsDark, J.build);
  if (want('boots')) drawFoot(img, J.legs.B, shade(st.boots, -0.2), dir, { floor: J.floor });
  run('behind');

  if (want('torso')) drawTorso(img, J, st);
  run('pack');
  run('torso');
  if (want('legs')) drawLeg(img, J.legs.F, st.pants, J.build);
  if (want('boots')) drawFoot(img, J.legs.F, st.boots, dir, { cap: st.bootCap, floor: J.floor });
  run('legs');

  if (want('head')) drawHead(img, J, st, dir);
  run('head');
  if (want('arms')) { drawArm(img, J.arms.F, st.sleeve || shade(st.top, -0.1), J.build); if (want('hands')) drawHand(img, J.arms.F, st.skin, dir); }
  run('front');
  return J;
}

// Each frame is drawn into its own padded canvas and then blitted in, so a limb
// that overruns its cell is reported (and clipped) instead of silently bleeding
// into the neighbouring frame at runtime.
const SHEET_PAD = 24;

function buildSheet(poses, style, layers, frame = FRAME) {
  const img = new Img(frame.w * poses.length, frame.h);
  const overflow = [];
  img.joints = poses.map((p, i) => {
    const cell = new Img(frame.w + SHEET_PAD * 2, frame.h);
    const J = drawCharacter(cell, SHEET_PAD, style, p, layers || {}, frame);
    let left = 0, right = 0;
    for (let y = 0; y < cell.h; y++) {
      for (let x = 0; x < cell.w; x++) {
        if (cell.data[(y * cell.w + x) * 4 + 3] < 8) continue;
        if (x < SHEET_PAD) left = Math.max(left, SHEET_PAD - x);
        else if (x >= SHEET_PAD + frame.w) right = Math.max(right, x - (SHEET_PAD + frame.w) + 1);
      }
    }
    if (left || right) overflow.push({ frame: i, left, right });
    for (let y = 0; y < frame.h; y++) {
      for (let x = 0; x < frame.w; x++) {
        const o = (y * cell.w + SHEET_PAD + x) * 4;
        if (cell.data[o + 3] < 8) continue;
        img.set(i * frame.w + x, y, [cell.data[o], cell.data[o + 1], cell.data[o + 2], cell.data[o + 3]]);
      }
    }
    return J;
  });
  img.overflow = overflow;
  return img;
}

function finish(img, opts = {}) {
  if (opts.volume !== false) img.volume(opts.volume || 0.13);
  if (opts.contour !== false) img.contour(opts.contourColor || [13, 15, 18, 220]);
  return img;
}

// Hand position for a pose in the coordinates game.js expects: x relative to
// the player's horizontal centre, y relative to the top of the collision box.
// Read out of the same solver the art uses, so held weapons cannot drift.
function handAnchor(p, frame = FRAME, boxH = 50) {
  const J = solve(p, frame);
  return { x: Math.round(J.arms.F.hand.x - frame.cx), y: Math.round(J.arms.F.hand.y - (frame.ground - boxH)) };
}

module.exports = {
  FRAME, NPC_FRAME, BONES, REST, TAU, LIGHT, clamp,
  pose, solve, ik, stroke, joint,
  drawCharacter, buildSheet, finish, handAnchor,
  drawLeg, drawFoot, drawArm, drawHand, drawTorso, drawHead,
  garmentTorso, garmentSleeves, garmentCoat, garmentVest, garmentLegs,
  garmentBoots, garmentHelmet, garmentBeanie, garmentCap, garmentMask,
  garmentGoggles, garmentPack
};
