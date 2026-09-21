// Stage 31 — clima com estações leves, visibilidade e som.
//
// Não são quatro estações completas com mecânicas próprias: é um ciclo lento
// que muda a temperatura base, a mesa de sorteio do tempo e a cara do céu. O
// que realmente muda o jogo são as CONDIÇÕES — chuva, frio, neblina,
// tempestade e vento — porque elas mexem em três coisas concretas:
//   visibilidade (o que você e os infectados enxergam),
//   som (o quanto o barulho viaja),
//   roupa (o quanto o corpo perde calor).

const SEASON_DAYS = 7;

const SEASONS = [
  {
    id: 'spring', name: 'PRIMAVERA', temp: 1.5, tint: [122, 150, 132],
    weights: { clear: .26, cloudy: .22, drizzle: .16, rain: .18, storm: .08, fog: .1, windstorm: 0, snow: 0 }
  },
  {
    id: 'summer', name: 'VERÃO', temp: 7.5, tint: [152, 152, 116],
    weights: { clear: .42, cloudy: .18, drizzle: .06, rain: .1, storm: .14, fog: .04, windstorm: .06, snow: 0 }
  },
  {
    id: 'autumn', name: 'OUTONO', temp: -1, tint: [140, 126, 100],
    weights: { clear: .2, cloudy: .24, drizzle: .14, rain: .16, storm: .07, fog: .14, windstorm: .05, snow: 0 }
  },
  {
    id: 'winter', name: 'INVERNO', temp: -9.5, tint: [124, 138, 152],
    weights: { clear: .18, cloudy: .22, drizzle: .03, rain: .06, storm: .04, fog: .13, windstorm: .1, snow: .24 }
  }
];

// Cada condição declara de uma vez o que faz com o mundo. Nada de espalhar
// números de tempestade por seis arquivos.
const WEATHER_CONDITIONS = {
  clear:     { name: 'LIMPO',       temp: 0,    rain: 0,   fog: 0,   wind: 0,   visibility: 1,   noise: 1,    dim: 0 },
  cloudy:    { name: 'NUBLADO',     temp: -1.5, rain: 0,   fog: .08, wind: .1,  visibility: .94, noise: 1,    dim: .18 },
  drizzle:   { name: 'GAROA',       temp: -2.5, rain: .3,  fog: .18, wind: .12, visibility: .84, noise: .88,  dim: .3 },
  rain:      { name: 'CHUVA',       temp: -3.5, rain: .62, fog: .12, wind: .2,  visibility: .7,  noise: .72,  dim: .45 },
  storm:     { name: 'TEMPESTADE',  temp: -5.5, rain: 1,   fog: .16, wind: .55, visibility: .48, noise: .55,  dim: .75 },
  fog:       { name: 'NEBLINA',     temp: -2.5, rain: 0,   fog: .62, wind: -.1, visibility: .36, noise: 1.12, dim: .34 },
  snow:      { name: 'NEVE',        temp: -6,   rain: 0,   fog: .3,  wind: .18, visibility: .55, noise: .78,  dim: .4 },
  windstorm: { name: 'VENDAVAL',    temp: -2,   rain: 0,   fog: .24, wind: .95, visibility: .62, noise: .6,   dim: .35 }
};

// Cada região tem seu microclima. É o que faz a Mata Fria pedir casaco e a
// Baixada Seca virar poeira no vendaval.
const REGION_CLIMATE = {
  coldwood:   { temp: -3.4, fog: .55, wind: -.12, snow: .5 },
  pasture:    { temp: 0.4,  fog: .3,  wind: .18,  snow: 0 },
  roadside:   { temp: 0.6,  fog: .1,  wind: .1,   snow: 0 },
  crossing:   { temp: 0.8,  fog: .05, wind: .16,  snow: 0 },
  cedar:      { temp: 0.9,  fog: 0,   wind: -.05, snow: -.1 },
  downtown:   { temp: 2.2,  fog: -.1, wind: -.18, snow: -.25 },
  civic:      { temp: 1.6,  fog: -.05, wind: -.1, snow: -.2 },
  dustbowl:   { temp: 3.6,  fog: -.2, wind: .34,  snow: -.4, dust: 1 },
  westline:   { temp: 1.8,  fog: .05, wind: .12,  snow: -.15 },
  ridge:      { temp: -4.2, fog: .35, wind: .45,  snow: .7 },
  blackridge: { temp: -1.2, fog: .2,  wind: .22,  snow: .2 }
};

class WeatherSystem {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.condition = "clear";
    this.nextChangeMinute = 180;
    this.wind = 0.2;
    this.gust = 0;
    this.ambientTemp = 16;
    this.baseTemp = 16;
    this.rainIntensity = 0;
    this.fog = 0;
    this.lightning = 0;
    this.lightningTimer = 6;
    this.snowIntensity = 0;
    this.dust = 0;
    this.seasonId = 'spring';
    this.regionId = 'pasture';
    this.drops = [];
    this.splashes = [];
    this.leaves = [];
    this.time = 0;
  }

  rand(n) {
    let x = (n + this.seed * 37) | 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  /* ------------------------------------------------------------ estações */

  seasonIndex(worldMinutes) {
    const day = Math.floor(worldMinutes / 1440);
    return Math.floor(day / SEASON_DAYS) % SEASONS.length;
  }

  season(worldMinutes = 0) {
    return SEASONS[this.seasonIndex(worldMinutes)];
  }

  seasonName(worldMinutes = 0) { return this.season(worldMinutes).name; }

  // Dia dentro da estação, para o jogador conseguir se planejar.
  seasonProgress(worldMinutes = 0) {
    const day = Math.floor(worldMinutes / 1440);
    return { day: (day % SEASON_DAYS) + 1, total: SEASON_DAYS };
  }

  conditionName() {
    return WEATHER_CONDITIONS[this.condition]?.name || 'LIMPO';
  }

  profile() { return WEATHER_CONDITIONS[this.condition] || WEATHER_CONDITIONS.clear; }

  climate(regionId = this.regionId) {
    return REGION_CLIMATE[regionId] || REGION_CLIMATE.pasture;
  }

  /* ------------------------------------------------------------ sorteio */

  chooseCondition(worldMinutes) {
    const season = this.season(worldMinutes);
    const climate = this.climate();
    const day = Math.floor(worldMinutes / 1440);
    const slot = Math.floor(worldMinutes / 180);
    const roll = this.rand(day * 101 + slot * 17);

    // O microclima local puxa o sorteio: serra e mata fria nevam e neblinam
    // muito mais que o centro da cidade.
    const weights = { ...season.weights };
    weights.fog = Math.max(0, (weights.fog || 0) * (1 + (climate.fog || 0)));
    weights.snow = Math.max(0, (weights.snow || 0) * (1 + (climate.snow || 0)));
    weights.windstorm = Math.max(0, (weights.windstorm || 0) * (1 + (climate.wind || 0) * 1.6));

    let total = 0;
    const rows = [];
    for (const [id, weight] of Object.entries(weights)) {
      if (weight <= 0) continue;
      total += weight;
      rows.push([id, total]);
    }
    const pick = roll * total;
    this.condition = (rows.find(r => pick <= r[1]) || rows[rows.length - 1])[0];
    this.nextChangeMinute = worldMinutes + 150 + Math.floor(this.rand(slot * 91 + 11) * 260);
  }

  isSheltered(player, world) {
    const tx = Math.floor((player.x + player.w / 2) / CONFIG.TILE);
    const ty = Math.floor(player.y / CONFIG.TILE);
    for (let y = ty - 1; y >= Math.max(0, ty - 12); y--) {
      const t = world.get(tx, y);
      if (TILE_INFO[t]?.solid) return true;
    }
    return false;
  }

  // Underground zones have their own ambience (drips, dust, machinery).
  // Surface weather must not visually punch through dozens of tiles of rock.
  isUnderground(player, world) {
    const tx = Math.max(0, Math.min(CONFIG.WORLD_W - 1, Math.floor((player.x + player.w / 2) / CONFIG.TILE)));
    const ty = Math.floor((player.y + player.h / 2) / CONFIG.TILE);
    if (world.undergroundZoneAt?.(tx, ty)) return true;
    return ty > world.surface[tx] + 10;
  }

  /* ------------------------------------------------------------ efeitos */

  // Quanto o mundo some. 1 = dia limpo. Vale para o jogador e para quem caça
  // o jogador: na neblina ninguém vê ninguém.
  visibility() { return this.profile().visibility; }

  // Quanto o barulho viaja. Tempestade abafa passos e tiros; neblina, que é ar
  // parado, carrega som um pouco melhor que o normal.
  noiseScale() { return this.profile().noise; }

  dimming() { return this.profile().dim; }

  freezing() { return this.ambientTemp <= 0.5; }

  // Resumo curto para a barra superior e para o diário da base.
  report(worldMinutes = 0) {
    const season = this.season(worldMinutes);
    const p = this.seasonProgress(worldMinutes);
    return {
      season: season.name, seasonId: season.id, seasonDay: p.day, seasonLength: p.total,
      condition: this.conditionName(), temp: this.ambientTemp,
      wind: this.wind, visibility: this.visibility(), freezing: this.freezing()
    };
  }

  update(dt, worldMinutes, player, world) {
    if (worldMinutes >= this.nextChangeMinute) this.chooseCondition(worldMinutes);

    const tileX = Math.max(0, Math.min(CONFIG.WORLD_W - 1, Math.floor((player.x + player.w / 2) / CONFIG.TILE)));
    this.regionId = world.region(tileX)?.id || 'pasture';
    const climate = this.climate();
    const season = this.season(worldMinutes);
    this.seasonId = season.id;

    const minute = worldMinutes % 1440;
    const hour = minute / 60;
    const dayWave = Math.sin(((hour - 6) / 24) * Math.PI * 2);
    const profile = this.profile();

    // Noites de inverno são o momento em que roupa deixa de ser detalhe.
    const swing = season.id === 'winter' ? 7.5 : season.id === 'summer' ? 7 : 6.5;
    this.baseTemp = 13 + season.temp + dayWave * swing;
    this.ambientTemp = this.baseTemp + profile.temp + (climate.temp || 0);

    this.rainIntensity = profile.rain;
    this.snowIntensity = this.condition === 'snow' ? .8 : 0;
    this.fog = Math.max(0, profile.fog * (1 + (climate.fog || 0) * .45));
    this.dust = this.condition === 'windstorm' ? .5 + (climate.dust ? .5 : 0) : 0;

    // Chuva vira neve quando está frio o bastante, sem trocar a condição: é o
    // mesmo temporal, só que congelado.
    if (this.rainIntensity > 0 && this.ambientTemp < 0.5) {
      this.snowIntensity = Math.max(this.snowIntensity, this.rainIntensity * .9);
      this.rainIntensity *= .25;
    }

    const windBase = .18 + this.rand(Math.floor(worldMinutes / 90) + 5) * .5;
    this.wind = Math.max(.05, Math.min(1.6, windBase + profile.wind + (climate.wind || 0)));
    this.time += dt;
    // Rajadas dão vida ao vento sem exigir simulação de verdade.
    this.gust = Math.max(0, Math.sin(this.time * .7) * .5 + Math.sin(this.time * 1.9 + 1.3) * .3) * this.wind;

    this.lightning = Math.max(0, this.lightning - dt * 3.2);
    if (this.condition === "storm") {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightning = 1;
        this.lightningTimer = 5 + this.rand(Math.floor(this.time)) * 11;
      }
    }

    return {
      sheltered: this.isSheltered(player, world),
      ambientTemp: this.ambientTemp,
      rainIntensity: this.rainIntensity,
      snowIntensity: this.snowIntensity,
      wind: this.wind + this.gust,
      condition: this.condition,
      season: season.id,
      visibility: this.visibility(),
      noiseScale: this.noiseScale(),
      freezing: this.freezing()
    };
  }

  /* ------------------------------------------------------------ desenho */

  drawRain(ctx, sheltered = false) {
    if (this.rainIntensity <= 0) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const count = Math.floor((70 + this.rainIntensity * 150) * (sheltered ? .35 : 1));
    const offset = (this.time * 900) % 1000;
    const slant = 6 + (this.wind + this.gust) * 14;
    const len = 18 + this.rainIntensity * 16;

    ctx.save();
    ctx.globalAlpha = sheltered ? .4 : 1;
    ctx.strokeStyle = `rgba(178,204,218,${(.2 + this.rainIntensity * .22).toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const x = ((i * 97 + this.seed * 13) % (W + 120)) - 60;
      const y = ((i * 53 + offset * (1 + (i % 3) * .35)) % (H + 120)) - 60;
      ctx.moveTo(x, y);
      ctx.lineTo(x - slant, y + len);
    }
    ctx.stroke();

    // a few brighter foreground streaks for depth
    ctx.strokeStyle = `rgba(206,226,236,${(.16 + this.rainIntensity * .2).toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < Math.floor(count * .12); i++) {
      const x = ((i * 311 + this.seed * 7) % (W + 120)) - 60;
      const y = ((i * 197 + offset * 1.9) % (H + 160)) - 80;
      ctx.moveTo(x, y);
      ctx.lineTo(x - slant * 1.5, y + len * 1.7);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Neve cai devagar e deriva de lado: é o oposto visual da chuva e precisa
  // ler como frio, não como estática.
  drawSnow(ctx, sheltered = false) {
    if (this.snowIntensity <= 0) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const count = Math.floor((90 + this.snowIntensity * 160) * (sheltered ? .3 : 1));
    const drift = (this.wind + this.gust) * 40;

    ctx.save();
    ctx.globalAlpha = sheltered ? .45 : 1;
    for (let layer = 0; layer < 3; layer++) {
      const speed = 34 + layer * 26;
      const size = 1 + layer;
      ctx.fillStyle = `rgba(226,232,236,${(.26 + layer * .14).toFixed(2)})`;
      for (let i = 0; i < count / 3; i++) {
        const seedX = (i * 167 + layer * 613 + this.seed * 11);
        const sway = Math.sin(this.time * (.6 + layer * .25) + i) * (10 + layer * 8);
        const x = (((seedX % (W + 160)) - 80) + sway + this.time * drift * (.4 + layer * .3)) % (W + 160) - 20;
        const y = ((i * 89 + this.time * speed) % (H + 120)) - 60;
        ctx.fillRect(x, y, size, size);
      }
    }
    ctx.restore();
  }

  // Vendaval: folhas, areia e poeira cruzando a tela na horizontal.
  drawWind(ctx, cameraX = 0) {
    if (this.dust <= 0) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save();
    ctx.fillStyle = `rgba(164,146,110,${(this.dust * .1).toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) {
      const speed = 220 + (i % 5) * 90;
      const x = (W + 120 - ((i * 211 + this.time * speed) % (W + 240)));
      const y = ((i * 137 + Math.sin(this.time * 1.4 + i) * 22) % H);
      ctx.fillStyle = `rgba(190,172,132,${(this.dust * (.12 + (i % 4) * .05)).toFixed(3)})`;
      ctx.fillRect(x, y, 6 + (i % 4) * 5, 1);
    }
    ctx.restore();
  }

  drawLightning(ctx) {
    if (this.lightning <= 0.01) return;
    const flash = this.lightning > .75 ? 1 : this.lightning * .5;
    ctx.save();
    ctx.fillStyle = `rgba(196,214,236,${(flash * .32).toFixed(3)})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  drawFog(ctx, cameraX = 0) {
    if (this.fog <= 0) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const cold = this.snowIntensity > 0 || this.ambientTemp < 3;
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgba(${cold ? '182,194,204' : '170,184,184'},${(this.fog * .14).toFixed(3)})`);
    g.addColorStop(.55, `rgba(${cold ? '168,182,194' : '155,171,169'},${(this.fog * .24).toFixed(3)})`);
    g.addColorStop(1, `rgba(${cold ? '150,164,176' : '135,151,148'},${(this.fog * .1).toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // drifting banks so fog reads as weather rather than a flat wash
    for (let i = 0; i < 5; i++) {
      const y = 120 + i * 118 + Math.sin(this.time * .2 + i) * 18;
      const x = ((i * 421 - cameraX * (.08 + i * .03) - this.time * (7 + i * 4)) % (W + 700)) - 350;
      ctx.fillStyle = `rgba(${cold ? '190,200,208' : '178,190,188'},${(this.fog * .07).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 320, 44 + i * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Uma lavagem de cor por estação, fraca o bastante para não brigar com a
  // iluminação, forte o bastante para o inverno parecer inverno.
  drawSeasonTint(ctx, worldMinutes = 0, daylight = 1) {
    const season = this.season(worldMinutes);
    const strength = season.id === 'winter' ? .1 : season.id === 'autumn' ? .075 : season.id === 'summer' ? .05 : .04;
    const alpha = strength * (.35 + daylight * .65);
    if (alpha <= .005) return;
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = `rgba(${season.tint[0]},${season.tint[1]},${season.tint[2]},${alpha.toFixed(3)})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }
}
