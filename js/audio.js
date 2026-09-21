// LAST COUNTY — áudio procedural.
//
// Tudo é sintetizado em tempo real com WebAudio: nenhum arquivo de som, nenhuma
// biblioteca. Ruído filtrado e osciladores curtos cobrem passos, impacto,
// tiros e ambiente. O silêncio é parte da mistura — as camadas ambientes ficam
// baixas de propósito para que um grunhido próximo se destaque.

const MATERIAL_STEP = {
  soil: { freq: 380, q: 1.1, gain: 0.30, decay: 0.09, body: 90 },
  rock: { freq: 1500, q: 1.6, gain: 0.26, decay: 0.07, body: 140 },
  road: { freq: 900, q: 1.3, gain: 0.22, decay: 0.06, body: 120 },
  built: { freq: 1200, q: 2.2, gain: 0.24, decay: 0.07, body: 150 },
  wood: { freq: 620, q: 3.0, gain: 0.30, decay: 0.10, body: 110 },
  veg: { freq: 2600, q: 0.8, gain: 0.22, decay: 0.12, body: 0 },
  water: { freq: 1800, q: 0.7, gain: 0.30, decay: 0.16, body: 0 },
  air: { freq: 500, q: 1, gain: 0.14, decay: 0.06, body: 80 }
};

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.muted = false;
    this.listenerX = 0;
    this.viewWidth = 1280;
    this.lastStep = 0;
    this.groanTimer = 2;
    this.buses = {};
    this.loops = {};
  }

  /* --------------------------------------------------------------- setup */

  // Browsers only allow audio after a gesture, so this is called from the
  // first key press or click.
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();

    const master = this.ctx.createGain();
    master.gain.value = 0.85;
    master.connect(this.ctx.destination);

    // gentle limiter so gunshots never clip the mix
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 20;
    comp.ratio.value = 8;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;
    comp.connect(master);

    for (const name of ['sfx', 'ambient', 'ui', 'voice']) {
      const g = this.ctx.createGain();
      g.gain.value = name === 'ambient' ? 0.5 : name === 'ui' ? 0.5 : 0.9;
      g.connect(comp);
      this.buses[name] = g;
    }

    this.noiseBuffer = this.makeNoise(2.2);
    this.buildLoops();
    this.ready = true;
  }

  makeNoise(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;   // slight brown tilt, less hissy
      data[i] = white * 0.7 + last * 3;
    }
    return buf;
  }

  now() { return this.ctx.currentTime; }

  /* ---------------------------------------------------------- primitives */

  // Panning and attenuation from the distance to the camera centre.
  spatial(worldX, maxDistance = 900) {
    const dx = worldX - this.listenerX;
    const dist = Math.abs(dx);
    if (dist > maxDistance) return null;
    const falloff = 1 - dist / maxDistance;
    return { pan: Math.max(-1, Math.min(1, dx / (this.viewWidth * 0.6))), gain: falloff * falloff };
  }

  node(bus = 'sfx', pan = 0, gain = 1) {
    const g = this.ctx.createGain();
    g.gain.value = gain;
    if (this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p);
      p.connect(this.buses[bus] || this.buses.sfx);
    } else {
      g.connect(this.buses[bus] || this.buses.sfx);
    }
    return g;
  }

  // Filtered noise burst — the workhorse for steps, impacts and gunfire.
  burst(opts = {}) {
    if (!this.ready || this.muted) return;
    const t = this.now();
    const {
      freq = 800, q = 1, gain = 0.3, decay = 0.1, attack = 0.002,
      type = 'bandpass', pan = 0, bus = 'sfx', sweep = 0, delay = 0
    } = opts;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    if (sweep) filter.frequency.exponentialRampToValueAtTime(Math.max(60, freq * sweep), t + delay + decay);

    const env = this.node(bus, pan, 0);
    src.connect(filter);
    filter.connect(env);

    const start = t + delay;
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(gain, start + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
    src.start(start, Math.random() * 1.5);
    src.stop(start + attack + decay + 0.05);
  }

  // Short pitched body — thuds, clanks, beeps.
  tone(opts = {}) {
    if (!this.ready || this.muted) return;
    const t = this.now();
    const {
      freq = 220, type = 'sine', gain = 0.2, decay = 0.15, attack = 0.004,
      slideTo = 0, pan = 0, bus = 'sfx', delay = 0
    } = opts;

    const osc = this.ctx.createOscillator();
    osc.type = type;
    const start = t + delay;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), start + decay);

    const env = this.node(bus, pan, 0);
    osc.connect(env);
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(gain, start + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
    osc.start(start);
    osc.stop(start + attack + decay + 0.05);
  }

  /* ---------------------------------------------------- ambient machinery */

  buildLoops() {
    const mk = (freq, q, type, gain) => {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = freq;
      filter.Q.value = q;
      const g = this.ctx.createGain();
      g.gain.value = 0;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.buses.ambient);
      src.start(0);
      return { src, filter, gain: g, target: gain };
    };

    this.loops.wind = mk(420, 0.6, 'bandpass', 0.16);
    this.loops.rain = mk(3200, 0.5, 'lowpass', 0.3);
    this.loops.room = mk(180, 0.8, 'lowpass', 0.1);

    // generator and engine share one hum chain each, pitched by state
    const hum = (freq) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      const g = this.ctx.createGain();
      g.gain.value = 0;
      osc.connect(filter);
      filter.connect(g);
      g.connect(this.buses.ambient);
      osc.start(0);
      return { osc, filter, gain: g };
    };
    this.loops.generator = hum(56);
    this.loops.engine = hum(72);
  }

  set(loop, value, time = 0.4) {
    if (!this.ready) return;
    const l = this.loops[loop];
    if (!l) return;
    const target = this.muted ? 0 : Math.max(0, value);
    l.gain.gain.setTargetAtTime(target, this.now(), time);
  }

  /* -------------------------------------------------------------- events */

  // A run is not a walk played louder: the heel lands harder and shorter, the
  // body thump drops, and there is a scuff as the foot leaves. A crouch loses
  // the thump entirely and keeps only a soft brush.
  footstep(materialGroup, opts = {}) {
    if (!this.ready) return;
    const m = MATERIAL_STEP[materialGroup] || MATERIAL_STEP.soil;
    const run = Boolean(opts.running), crouch = Boolean(opts.crouching) && !run;
    const loud = run ? 1.3 : crouch ? 0.4 : 1;
    const pan = opts.pan || 0;
    const jitter = 0.85 + Math.random() * 0.3;

    this.burst({
      freq: m.freq * jitter * (run ? 1.12 : crouch ? 0.88 : 1),
      q: m.q * (run ? 1.3 : 1),
      gain: m.gain * loud,
      decay: m.decay * (run ? 0.72 : crouch ? 1.15 : 1),
      pan
    });
    if (m.body && !crouch) {
      this.tone({
        freq: m.body * (run ? 0.86 : 1), type: 'sine',
        gain: (run ? 0.15 : 0.1) * loud, decay: run ? 0.09 : 0.07,
        slideTo: m.body * 0.55, pan
      });
    }
    // scuff as the foot pushes off — only when there is real speed behind it
    if (run) this.burst({ freq: m.freq * 1.8, q: 0.5, gain: m.gain * 0.3, decay: 0.07, sweep: 0.8, pan, delay: 0.045 });
  }

  // kind: 'blade' (fast, bright), 'blunt' (dull club), 'heavy' (slow mass),
  // 'pole' (long airy), or null for fists.
  swing(weight = 1, pan = 0, kind = 'blunt') {
    const w = Math.max(.6, weight);
    if (kind === 'blade') {
      this.burst({ freq: 2200 / w, q: 1.6, gain: 0.15, decay: 0.09, sweep: 1.1, pan });
      this.burst({ freq: 4200, q: 2.4, gain: 0.05 * w, decay: 0.06, sweep: 1.4, pan, delay: 0.015 });
    } else if (kind === 'heavy') {
      this.burst({ freq: 620 / w, q: 0.5, gain: 0.2, decay: 0.2, sweep: 0.45, pan });
      this.tone({ freq: 74, type: 'sine', gain: 0.1 * w, decay: 0.16, slideTo: 48, pan });
    } else if (kind === 'pole') {
      this.burst({ freq: 1500 / w, q: 0.85, gain: 0.13, decay: 0.16, sweep: 0.9, pan });
    } else if (kind === 'fist') {
      this.burst({ freq: 900 / w, q: 0.5, gain: 0.09, decay: 0.09, sweep: 0.5, pan });
    } else {
      this.burst({ freq: 1100 / w, q: 0.7, gain: 0.16, decay: 0.13, sweep: 0.35, pan });
      this.tone({ freq: 120, type: 'triangle', gain: 0.05 * w, decay: 0.1, slideTo: 80, pan });
    }
  }

  // Impact character depends on what was hit and with what.
  impact(kind = 'flesh', power = 1, pan = 0) {
    const p = Math.min(2, power);
    if (kind === 'flesh') {
      this.burst({ freq: 300, q: 1.4, gain: 0.34 * p, decay: 0.11, sweep: 0.4, pan });
      this.tone({ freq: 90, type: 'sine', gain: 0.24 * p, decay: 0.13, slideTo: 45, pan });
    } else if (kind === 'metal') {
      this.tone({ freq: 1400, type: 'square', gain: 0.14 * p, decay: 0.24, slideTo: 900, pan });
      this.burst({ freq: 2600, q: 3, gain: 0.2 * p, decay: 0.2, pan });
    } else if (kind === 'wood') {
      this.burst({ freq: 480, q: 2.4, gain: 0.3 * p, decay: 0.13, sweep: 0.5, pan });
      this.tone({ freq: 150, type: 'triangle', gain: 0.16 * p, decay: 0.1, slideTo: 90, pan });
    } else if (kind === 'stone') {
      this.burst({ freq: 900, q: 1.1, gain: 0.3 * p, decay: 0.14, sweep: 0.3, pan });
      this.tone({ freq: 110, type: 'sine', gain: 0.18 * p, decay: 0.12, slideTo: 60, pan });
    } else if (kind === 'blunt') {
      this.burst({ freq: 240, q: 1.1, gain: 0.32 * p, decay: 0.15, sweep: 0.35, pan });
      this.tone({ freq: 76, type: 'sine', gain: 0.26 * p, decay: 0.17, slideTo: 40, pan });
    } else if (kind === 'glass') {
      for (let i = 0; i < 4; i++) {
        this.burst({ freq: 3000 + Math.random() * 2500, q: 6, gain: 0.14, decay: 0.16, pan, delay: i * 0.03 });
      }
    }
  }

  kill(pan = 0) {
    this.tone({ freq: 140, type: 'sine', gain: 0.3, decay: 0.3, slideTo: 40, pan });
    this.burst({ freq: 420, q: 1, gain: 0.26, decay: 0.26, sweep: 0.2, pan });
  }

  // Each class gets its own crack, body and tail. `action` is the mechanical
  // clack of the slide/bolt, which is most of what tells them apart up close.
  gunshot(kind = 'pistol', pan = 0) {
    const cfg = {
      pistol:     { gain: 0.50, decay: 0.20, freq: 1500, body: 120, tail: 0.22, action: 2100 },
      revolver:   { gain: 0.58, decay: 0.26, freq: 1300, body: 100, tail: 0.30, action: 0 },
      shotgun:    { gain: 0.74, decay: 0.36, freq: 780,  body: 62,  tail: 0.42, action: 0, thump: 1.5 },
      rifle:      { gain: 0.66, decay: 0.24, freq: 2300, body: 150, tail: 0.52, action: 1500, crack: 1.4 },
      smg:        { gain: 0.40, decay: 0.13, freq: 1900, body: 135, tail: 0.12, action: 2600, crack: 0.9 },
      carbine:    { gain: 0.58, decay: 0.19, freq: 2050, body: 140, tail: 0.36, action: 1800, crack: 1.2 },
      blackridge: { gain: 0.52, decay: 0.17, freq: 2400, body: 155, tail: 0.28, action: 3000, crack: 1.1 }
    }[kind] || { gain: 0.5, decay: 0.2, freq: 1500, body: 120, tail: 0.22, action: 2100 };

    this.burst({ freq: cfg.freq, q: 0.6, gain: cfg.gain * (cfg.crack || 1), decay: cfg.decay * 0.35, type: 'highpass', pan });
    this.burst({ freq: 400, q: 0.5, gain: cfg.gain * 0.8, decay: cfg.decay, sweep: 0.25, pan });
    this.tone({ freq: cfg.body, type: 'sine', gain: 0.4 * (cfg.thump || 1), decay: cfg.decay * 0.8, slideTo: 40, pan });
    if (cfg.action) this.tone({ freq: cfg.action, type: 'square', gain: 0.055, decay: 0.035, pan, delay: 0.045 });
    // tail: the county answering back
    this.burst({ freq: 700, q: 0.4, gain: cfg.gain * 0.22, decay: 0.55 + cfg.tail, sweep: 0.3, pan, delay: 0.09 });
  }

  reload(stage = 'out', pan = 0) {
    if (stage === 'out') this.tone({ freq: 900, type: 'square', gain: 0.1, decay: 0.05, pan });
    else if (stage === 'in') this.tone({ freq: 620, type: 'square', gain: 0.12, decay: 0.07, pan });
    else this.tone({ freq: 1400, type: 'square', gain: 0.1, decay: 0.05, pan });
  }

  dryFire(pan = 0) {
    this.tone({ freq: 1800, type: 'square', gain: 0.08, decay: 0.03, pan });
  }

  // Infected voices: short, breathy, never musical.
  groan(kind = 'idle', pan = 0, gain = 1) {
    if (kind === 'screech') {
      this.tone({ freq: 420, type: 'sawtooth', gain: 0.22 * gain, decay: 0.7, slideTo: 900, pan, bus: 'voice' });
      this.burst({ freq: 1800, q: 1.2, gain: 0.22 * gain, decay: 0.6, sweep: 1.6, pan, bus: 'voice' });
      return;
    }
    if (kind === 'attack') {
      this.tone({ freq: 190, type: 'sawtooth', gain: 0.2 * gain, decay: 0.28, slideTo: 90, pan, bus: 'voice' });
      this.burst({ freq: 700, q: 1.4, gain: 0.18 * gain, decay: 0.24, sweep: 0.5, pan, bus: 'voice' });
      return;
    }
    if (kind === 'hurt') {
      this.tone({ freq: 260, type: 'sawtooth', gain: 0.2 * gain, decay: 0.2, slideTo: 130, pan, bus: 'voice' });
      return;
    }
    const base = 110 + Math.random() * 70;
    this.tone({ freq: base, type: 'sawtooth', gain: 0.11 * gain, decay: 0.55, slideTo: base * 0.7, pan, bus: 'voice' });
    this.burst({ freq: 520, q: 2, gain: 0.08 * gain, decay: 0.5, sweep: 0.6, pan, bus: 'voice' });
  }

  playerHurt() {
    this.tone({ freq: 300, type: 'triangle', gain: 0.24, decay: 0.22, slideTo: 150, bus: 'voice' });
    this.burst({ freq: 600, q: 1, gain: 0.2, decay: 0.2, sweep: 0.4, bus: 'voice' });
  }

  ui(kind = 'click') {
    const map = {
      click: { freq: 1200, gain: 0.07, decay: 0.04 },
      open: { freq: 700, gain: 0.09, decay: 0.09, slideTo: 1100 },
      close: { freq: 900, gain: 0.08, decay: 0.08, slideTo: 500 },
      good: { freq: 780, gain: 0.1, decay: 0.16, slideTo: 1180 },
      bad: { freq: 300, gain: 0.1, decay: 0.2, slideTo: 170 }
    }[kind] || { freq: 1000, gain: 0.07, decay: 0.05 };
    this.tone({ ...map, type: 'square', bus: 'ui' });
  }

  world(kind, pan = 0) {
    switch (kind) {
      case 'door_open': this.burst({ freq: 380, q: 3, gain: 0.2, decay: 0.3, sweep: 0.55, pan }); break;
      case 'door_close': this.impact('wood', 0.8, pan); break;
      case 'lock': this.tone({ freq: 2200, type: 'square', gain: 0.1, decay: 0.05, pan }); break;
      case 'pry': this.burst({ freq: 700, q: 4, gain: 0.3, decay: 0.28, sweep: 0.35, pan }); break;
      case 'break': this.impact('wood', 1.4, pan); this.burst({ freq: 1600, q: 1, gain: 0.2, decay: 0.4, pan }); break;
      case 'container': this.burst({ freq: 900, q: 2.6, gain: 0.16, decay: 0.16, sweep: 0.6, pan }); break;
      case 'pickup': this.tone({ freq: 820, type: 'triangle', gain: 0.1, decay: 0.1, slideTo: 1200, pan }); break;
      case 'craft': this.burst({ freq: 1400, q: 2, gain: 0.16, decay: 0.2, sweep: 0.4, pan }); this.tone({ freq: 500, type: 'square', gain: 0.08, decay: 0.12, pan }); break;
      case 'build': this.impact('wood', 1, pan); this.tone({ freq: 1600, type: 'square', gain: 0.07, decay: 0.06, pan }); break;
      case 'mine': this.impact('stone', 0.7, pan); break;
      case 'switch': this.tone({ freq: 1500, type: 'square', gain: 0.1, decay: 0.05, pan }); this.tone({ freq: 700, type: 'square', gain: 0.08, decay: 0.07, pan, delay: 0.05 }); break;
      case 'pump':
        this.tone({ freq: 86, type:'sawtooth', gain:.12, decay:.5, slideTo:72, pan });
        this.burst({ freq: 420, q:1.2, gain:.09, decay:.28, sweep:.5, pan, delay:.08 });
        break;
      case 'push':
        this.impact('wood', .75, pan);
        this.tone({ freq:115, type:'triangle', gain:.08, decay:.18, slideTo:75, pan });
        break;
      case 'cloth': this.burst({ freq:1300, q:.45, gain:.045, decay:.1, sweep:.7, pan }); break;
      case 'power_on': this.tone({ freq: 120, type: 'sawtooth', gain: 0.14, decay: 0.7, slideTo: 260, pan }); break;
      case 'engine_start': this.tone({ freq: 60, type: 'sawtooth', gain: 0.22, decay: 0.8, slideTo: 90, pan }); this.burst({ freq: 300, q: 1, gain: 0.2, decay: 0.7, pan }); break;
      case 'horn': this.tone({ freq: 390, type: 'square', gain: 0.20, decay: 0.32, slideTo: 330, pan }); this.tone({ freq: 520, type: 'square', gain: 0.12, decay: 0.25, pan, delay: 0.04 }); break;
      case 'thunder':
        this.burst({ freq: 180, q: 0.4, gain: 0.5, decay: 1.6, sweep: 0.25, pan });
        this.burst({ freq: 700, q: 0.5, gain: 0.3, decay: 0.5, sweep: 0.2, pan, delay: 0.05 });
        break;
      case 'alarm':
        this.tone({ freq: 660, type: 'square', gain: 0.18, decay: 0.45, slideTo: 990 });
        this.tone({ freq: 990, type: 'square', gain: 0.18, decay: 0.45, slideTo: 660, delay: 0.45 });
        break;
      case 'radio': this.burst({ freq: 2400, q: 0.8, gain: 0.12, decay: 0.5, pan }); break;
      // Stage 20: region ambience one-shots
      case 'drip': this.tone({ freq: 1600 + Math.random() * 700, type: 'sine', gain: 0.05, decay: 0.07, slideTo: 800, pan }); break;
      case 'clang': this.impact('metal', 0.35, pan); this.burst({ freq: 220, q: 2, gain: 0.08, decay: 0.9, pan, delay: 0.02 }); break;
      case 'creak': this.tone({ freq: 95, type: 'sawtooth', gain: 0.045, decay: 0.6, slideTo: 68, pan }); break;
      // Stage 28B — underground voices. All quiet and far away on purpose:
      // the point is that the rock is not silent, not that it is noisy.
      case 'cave_drip':                                  // a drip with its own tail
        this.tone({ freq: 1500 + Math.random() * 900, type: 'sine', gain: 0.055, decay: 0.09, slideTo: 700, pan });
        this.burst({ freq: 2600, q: 5, gain: 0.03, decay: 0.28, pan, delay: 0.03 });
        break;
      case 'cave_settle':                                // rock shifting somewhere
        this.tone({ freq: 48 + Math.random() * 20, type: 'sine', gain: 0.075, decay: 1.1, slideTo: 30, pan });
        this.burst({ freq: 180, q: 1.2, gain: 0.035, decay: 0.7, sweep: 0.3, pan, delay: 0.06 });
        break;
      case 'cave_breath':                                // air moving through a crack
        this.burst({ freq: 420, q: 0.5, gain: 0.05, decay: 2.2, sweep: 0.5, pan });
        break;
      case 'pebble':                                     // something small comes loose
        for (let i = 0; i < 3; i++) this.burst({ freq: 900 + Math.random() * 1400, q: 4, gain: 0.035, decay: 0.09, pan, delay: i * 0.09 + Math.random() * 0.05 });
        break;
      case 'crystal_ring':                               // deep crystal, barely there
        this.tone({ freq: 1760, type: 'sine', gain: 0.032, decay: 1.5, slideTo: 1755, pan });
        this.tone({ freq: 2640, type: 'sine', gain: 0.018, decay: 1.2, slideTo: 2630, pan, delay: 0.05 });
        break;
      case 'deep_groan':                                 // the weight of everything above
        this.tone({ freq: 34, type: 'sine', gain: 0.1, decay: 2.6, slideTo: 26, pan });
        break;
      case 'mine_clank':                                 // dead machinery, still cooling
        this.burst({ freq: 1200, q: 3.4, gain: 0.05, decay: 0.34, pan });
        this.tone({ freq: 160, type: 'square', gain: 0.03, decay: 0.5, slideTo: 110, pan, delay: 0.02 });
        break;
      case 'br_pulse':                                   // something still has power
        this.tone({ freq: 640, type: 'square', gain: 0.026, decay: 0.1, pan });
        this.tone({ freq: 96, type: 'sine', gain: 0.04, decay: 0.9, slideTo: 88, pan, delay: 0.08 });
        break;
      case 'hum':
        this.tone({ freq: 60, type: 'square', gain: 0.035, decay: 1.1, slideTo: 59, pan });
        this.tone({ freq: 1900, type: 'square', gain: 0.02, decay: 0.05, pan, delay: 0.3 });
        break;
      case 'bird':
        this.tone({ freq: 2500 + Math.random() * 500, type: 'sine', gain: 0.045, decay: 0.1, slideTo: 3400, pan });
        this.tone({ freq: 3100, type: 'sine', gain: 0.04, decay: 0.1, slideTo: 2300, pan, delay: 0.16 });
        break;
      case 'cricket':
        for (let i = 0; i < 3; i++) this.burst({ freq: 4300, q: 9, gain: 0.025, decay: 0.04, pan, delay: i * 0.09 });
        break;
      case 'heartbeat':
        this.tone({ freq: 62, type: 'sine', gain: 0.3, decay: 0.16, slideTo: 40 });
        this.tone({ freq: 55, type: 'sine', gain: 0.22, decay: 0.2, slideTo: 36, delay: 0.19 });
        break;
      default: break;
    }
  }

  /* --------------------------------------------------------------- frame */

  // Drives the persistent layers from the world state.
  update(dt, state) {
    if (!this.ready) return;
    this.listenerX = state.listenerX;
    this.viewWidth = state.viewWidth || 1280;

    const indoor = state.indoor ? 1 : 0;
    const windBase = state.region === 'coldwood' ? 0.10 : state.region === 'ridge' ? 0.13 : 0.07;
    this.set('wind', this.muted ? 0 : windBase * (1 - indoor * 0.65) * (0.6 + state.wind * 0.8), 0.8);
    this.loops.wind.filter.frequency.setTargetAtTime(340 + state.wind * 420, this.now(), 1.2);

    this.set('rain', this.muted ? 0 : state.rain * (indoor ? 0.16 : 0.34), 0.6);
    this.loops.rain.filter.frequency.setTargetAtTime(indoor ? 900 : 5200, this.now(), 0.8);

    this.set('room', this.muted ? 0 : indoor * 0.06, 1.2);

    this.set('generator', this.muted ? 0 : state.generator * 0.1, 0.5);
    this.set('engine', this.muted ? 0 : state.engine * 0.13, 0.25);
    if (state.engine > 0) {
      this.loops.engine.osc.frequency.setTargetAtTime(58 + state.engineSpeed * 90, this.now(), 0.15);
      this.loops.engine.filter.frequency.setTargetAtTime(300 + state.engineSpeed * 900, this.now(), 0.2);
    }

    // occasional distant groans so the county never feels empty
    this.groanTimer -= dt;
    if (this.groanTimer <= 0) {
      this.groanTimer = 4 + Math.random() * 9;
      if (state.nearbyInfected > 0 && Math.random() < 0.7) {
        const pan = (Math.random() - 0.5) * 1.4;
        this.groan('idle', Math.max(-1, Math.min(1, pan)), 0.5 + Math.random() * 0.4);
      }
    }
    this.ambienceTick(dt, state);
  }

  // Stage 20: small sounds that tell regions apart with eyes closed
  ambienceTick(dt, state) {
    this.ambTimer = (this.ambTimer ?? 3) - dt;
    if (this.ambTimer > 0 || this.muted || !this.ready) return;
    this.ambTimer = 2.2 + Math.random() * 5;
    const pan = (Math.random() - 0.5) * 1.6;
    const a = state.ambience;
    const depth = state.depth || 0;
    if (a === 'underground' || a === 'cave_deep') {
      // the deeper it gets, the less it drips and the more it groans
      const deep = a === 'cave_deep' || depth > 60;
      this.ambTimer = 1.6 + Math.random() * 4;
      const r = Math.random();
      if (deep) {
        this.world(r < 0.24 ? 'cave_drip' : r < 0.44 ? 'deep_groan' : r < 0.62 ? 'cave_settle'
          : r < 0.78 ? 'crystal_ring' : r < 0.92 ? 'cave_breath' : 'pebble', pan);
      } else {
        this.world(r < 0.42 ? 'cave_drip' : r < 0.62 ? 'pebble' : r < 0.8 ? 'cave_breath' : 'cave_settle', pan);
      }
    } else if (a === 'mine') {
      this.ambTimer = 1.8 + Math.random() * 4.2;
      const r = Math.random();
      this.world(r < 0.3 ? 'creak' : r < 0.52 ? 'cave_drip' : r < 0.72 ? 'mine_clank' : r < 0.88 ? 'cave_settle' : 'pebble', pan);
    } else if (a === 'blackridge') {
      const r = Math.random();
      this.world(r < 0.45 ? 'hum' : r < 0.7 ? 'br_pulse' : r < 0.88 ? 'cave_settle' : 'cave_drip', pan);
    }
    else if (a === 'industrial') { if (Math.random() < 0.5) this.world('clang', pan); }
    else if (!state.indoor && state.night) this.world('cricket', pan);
    else if (!state.indoor && (a === 'forest' || a === 'rural')) this.world('bird', pan);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.ready) {
      for (const key of Object.keys(this.loops)) this.set(key, 0, 0.1);
    }
    return this.muted;
  }
}
