// LAST COUNTY — Stage 31 art: comida, cultivo, caça e clima.
//
//   node tools/gen_stage31_assets.js [--items] [--build] [--animals] [--wear] [--held]
//
// Mesma pipeline do resto do jogo: nada de PNG externo, tudo desenhado pelos
// helpers de tools/pixel.js para que a paleta e o contorno batam com os 197
// ícones que já existiam.
const fs = require('fs');
const path = require('path');
const { Img, shade, mix, hash } = require('./pixel');

const ROOT = path.join(__dirname, '..');
const ITEMS_OUT = path.join(ROOT, 'assets', 'items');
const BUILD_OUT = path.join(ROOT, 'assets', 'build');
const SPRITE_OUT = path.join(ROOT, 'assets', 'sprites');

/* ========================================================== ícones 32x32 */

const S = 32;

function icon(draw) {
  const img = new Img(S, S);
  draw(img);
  img.volume(0.13);
  img.contour([13, 14, 16, 225]);
  return img;
}

function box(img, x, y, w, h, c) {
  img.rect(x, y, w, h, c);
  img.hline(x, y, w, shade(c, 0.22));
  img.hline(x, y + h - 1, w, shade(c, -0.3));
  img.vline(x, y, h, shade(c, 0.1));
  img.vline(x + w - 1, y, h, shade(c, -0.22));
}

function handle(img, x0, y0, x1, y1, w, c) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t);
    for (let k = 0; k < w; k++) img.set(x + k, y, k === 0 ? shade(c, 0.2) : k === w - 1 ? shade(c, -0.26) : c);
  }
}

// Corte de carne: massa irregular com veios de gordura e, quando assado, uma
// casca mais escura por cima.
function meatCut(img, c, fat, opts = {}) {
  const cx = opts.cx ?? 16, cy = opts.cy ?? 17, rx = opts.rx ?? 11, ry = opts.ry ?? 8;
  img.ellipse(cx, cy, rx, ry, c);
  img.ellipse(cx - rx * .3, cy - ry * .35, rx * .45, ry * .4, shade(c, 0.2));
  for (let i = 0; i < 5; i++) {
    const a = hash(i, 7, opts.seed || 3) * Math.PI * 2;
    const x = Math.round(cx + Math.cos(a) * rx * .5);
    const y = Math.round(cy + Math.sin(a) * ry * .5);
    img.rect(x - 1, y, 3, 1, fat);
  }
  if (opts.crust) {
    img.ellipseOutline(cx, cy, rx, ry, shade(c, -0.34));
    for (let i = 0; i < 7; i++) img.set(cx - rx + 2 + i * 3, cy - ry + 1 + (i % 2), shade(c, -0.42));
  }
  if (opts.bone) {
    img.rect(cx + rx - 3, cy - 2, 8, 4, '#cdc7b0');
    img.ellipse(cx + rx + 5, cy, 3, 3, '#ded8c2');
  }
}

// Vegetal com folhagem: uma base arredondada e duas folhas no topo.
function leafy(img, body, leaf, opts = {}) {
  const cx = opts.cx ?? 16, cy = opts.cy ?? 19;
  img.ellipse(cx, cy, opts.rx ?? 8, opts.ry ?? 8, body);
  img.ellipse(cx - 3, cy - 3, 3, 2.6, shade(body, 0.24));
  img.line(cx, cy - 8, cx, cy - 12, '#546b3c');
  img.ellipse(cx - 4, cy - 12, 4, 2.4, leaf);
  img.ellipse(cx + 4, cy - 11, 4, 2.4, shade(leaf, -0.14));
}

function jar(img, glass, fill, level) {
  img.rect(9, 8, 14, 20, glass);
  img.hline(9, 8, 14, shade(glass, 0.24));
  img.hline(9, 27, 14, shade(glass, -0.3));
  if (level > 0) {
    const h = Math.round(17 * level);
    img.rect(10, 27 - h, 12, h, fill);
    img.hline(10, 27 - h, 12, shade(fill, 0.22));
  }
  img.vline(11, 10, 16, shade(glass, 0.3));
  img.rect(8, 4, 16, 5, '#7c7466');
  img.hline(8, 4, 16, '#968d7c');
}

function bowl(img, broth, opts = {}) {
  const c = opts.bowl || '#8e8a7c';
  img.ellipse(16, 20, 12, 8, c);
  img.ellipse(16, 17, 11, 6, broth);
  img.ellipse(16, 17, 11, 6, broth);
  img.ellipseOutline(16, 17, 11, 6, shade(broth, -0.22));
  for (const [x, y, r] of opts.bits || []) img.ellipse(x, y, r, r * .7, opts.bitColor || shade(broth, 0.3));
  img.ellipse(16, 24, 12, 4, shade(c, -0.26));
  img.hline(6, 19, 21, shade(c, 0.2));
  if (opts.steam) {
    for (let i = 0; i < 3; i++) {
      const x = 11 + i * 5;
      for (let j = 0; j < 5; j++) img.set(x + Math.round(Math.sin(j * .9 + i) * 1.6), 9 - j, 'ccd6d0aa');
    }
  }
}

const ITEMS = {
  /* ------------------------------------------------------------- caça */
  raw_meat: img => meatCut(img, '#9a5450', '#d7c3ad', { bone: true, seed: 11 }),
  raw_small_game: img => meatCut(img, '#a25e60', '#dcc9b2', { rx: 8, ry: 6, seed: 5 }),
  cooked_meat: img => meatCut(img, '#8a5a38', '#c9a878', { crust: true, bone: true, seed: 17 }),
  roast_haunch: img => {
    meatCut(img, '#96613a', '#cfae7c', { cx: 15, cy: 18, rx: 12, ry: 9, crust: true, seed: 23 });
    img.rect(24, 15, 7, 5, '#cdc7b0');
    img.ellipse(30, 17, 2.4, 3, '#e0dac4');
    for (let i = 0; i < 4; i++) img.set(8 + i * 4, 11 + (i % 2), '#6d8a4c');   // ervas
  },
  jerky: img => {
    img.hline(2, 5, 28, '#8a7f66');                                   // varal
    img.hline(2, 6, 28, '#6b6151');
    const strips = [[6, 21, 6], [14, 17, 5], [21, 23, 6]];
    strips.forEach(([x, len, w], i) => {
      const c = shade('#7a4a32', 0.06 - i * 0.05);
      img.set(x + 1, 4, '#9c9080');                                   // gancho
      img.set(x + 1, 5, '#9c9080');
      for (let j = 0; j < len; j++) {
        const y = 7 + j;
        const taper = j > len - 4 ? (len - j) * 0.5 : 0;
        const ww = Math.max(2, Math.round(w - taper));
        const ox = x + Math.round((w - ww) / 2) + (j % 5 === 0 ? 1 : 0);
        img.hline(ox, y, ww, j % 4 === 0 ? shade(c, -0.26) : c);
        img.set(ox, y, shade(c, 0.24));
        img.set(ox + ww - 1, y, shade(c, -0.3));
      }
      for (let k = 0; k < 3; k++) img.set(x + 1 + k, 9 + k * 4, shade(c, 0.3));   // veios de sal
    });
  },
  animal_fat: img => {
    img.ellipse(16, 18, 10, 8, '#cdbd93');
    img.ellipse(13, 15, 4, 3, '#e0d3ad');
    img.ellipseOutline(16, 18, 10, 8, '#a89a74');
    for (let i = 0; i < 4; i++) img.rect(10 + i * 4, 20 + (i % 2), 3, 1, '#b8a982');
  },
  animal_hide: img => {
    const c = '#7d6247';
    img.blob(6, 7, 20, 19, c);
    img.blob(9, 10, 8, 7, shade(c, 0.18));
    for (let i = 0; i < 5; i++) img.rect(8 + i * 4, 23, 2, 4, shade(c, -0.26));   // franja
    img.rect(5, 12, 3, 6, shade(c, -0.2)); img.rect(24, 12, 3, 6, shade(c, -0.2));
  },
  tanned_leather: img => {
    const c = '#6b4c34';
    img.blob(4, 9, 24, 15, c);                                        // peça inteira, canto mole
    img.blob(6, 11, 12, 6, shade(c, 0.18));                           // brilho da dobra
    // a dobra por cima, que é o que separa couro de tábua
    img.blob(7, 5, 18, 9, shade(c, 0.1));
    img.hline(8, 5, 16, shade(c, 0.3));
    img.hline(7, 13, 18, shade(c, -0.34));
    for (let i = 0; i < 7; i++) img.set(9 + i * 2, 7, shade(c, -0.2));            // costura da dobra
    for (let i = 0; i < 8; i++) img.set(6 + i * 2, 22, '#9c8b6c');                // costura da borda
    img.set(5, 16, shade(c, -0.3)); img.set(27, 17, shade(c, -0.3));
  },
  bone: img => {
    handle(img, 8, 20, 24, 12, 4, '#c3bda6');
    for (const [x, y] of [[7, 19], [7, 23], [25, 9], [25, 13]]) img.ellipse(x, y, 3.4, 3, '#d5cfb8');
    img.line(11, 18, 22, 12, shade('#c3bda6', -0.2));
  },
  feathers: img => {
    for (let i = 0; i < 3; i++) {
      const x = 8 + i * 7, tilt = i - 1;
      img.line(x, 26, x + tilt * 3, 6, '#7d7566');
      for (let j = 0; j < 8; j++) {
        const w = 5 - Math.abs(j - 3) * 0.6;
        const y = 9 + j * 2;
        img.hline(Math.round(x + tilt * (3 - j * .3) - w / 2), y, Math.round(w), shade('#9a9583', (j % 2) * 0.12));
      }
    }
  },

  /* ---------------------------------------------------------- cozinha */
  meat_stew: img => bowl(img, '#8d6340', { steam: true, bits: [[12, 16, 2], [19, 15, 2.2], [16, 19, 1.8]], bitColor: '#b08048' }),
  vegetable_soup: img => bowl(img, '#7e8a4f', { steam: true, bits: [[12, 16, 2], [20, 17, 2], [16, 15, 1.6]], bitColor: '#a9543f' }),
  bone_broth: img => bowl(img, '#a08a58', { steam: true, bits: [[14, 16, 2.4], [20, 16, 1.8]], bitColor: '#d5cfb8' }),
  baked_potato: img => {
    img.ellipse(16, 18, 10, 7, '#a9843f');
    img.ellipse(16, 18, 9, 6, '#8c6a31');
    img.rect(11, 14, 10, 3, '#e4cf94');                                          // polpa aberta
    img.rect(14, 12, 4, 3, '#f0e2b4');
    for (let i = 0; i < 5; i++) img.set(9 + i * 4, 22 + (i % 2), '#6d5225');
  },
  roasted_corn: img => {
    img.ellipse(16, 17, 6, 11, '#bb9a44');
    for (let y = 8; y < 27; y += 3) for (let x = 11; x < 22; x += 3) img.rect(x, y, 2, 2, shade('#d3b257', ((x + y) % 6) * 0.05));
    img.ellipse(11, 20, 3, 8, '#6d7f44');
    img.ellipse(21, 21, 3, 7, '#5f7340');
    img.rect(15, 26, 3, 5, '#8a7a4c');
  },
  flatbread: img => {
    img.ellipse(16, 18, 12, 8, '#b09763');
    img.ellipse(16, 17, 11, 7, '#c2a974');
    for (let i = 0; i < 7; i++) {
      const a = hash(i, 3, 9) * Math.PI * 2;
      img.ellipse(16 + Math.cos(a) * 6, 17 + Math.sin(a) * 4, 1.6, 1.3, '#8a6e42');
    }
    img.ellipseOutline(16, 18, 12, 8, '#8f7647');
  },
  flour: img => {
    img.rect(8, 9, 16, 18, '#b5aa8e');
    img.hline(8, 9, 16, '#c8bc9b');
    img.rect(10, 6, 12, 4, '#a49877');
    img.rect(12, 14, 8, 8, '#e0d7bd');
    for (let i = 0; i < 6; i++) img.set(11 + i * 2, 25 - (i % 3), '#d4c9a8');
  },
  pickled_vegetables: img => jar(img, '#9fb2ae', '#8a9455', 0.82),
  glass_jar: img => jar(img, '#9fb2ae', '#9fb2ae', 0),
  spoiled_food: img => {
    img.ellipse(16, 19, 10, 7, '#5f6347');
    img.ellipse(13, 17, 4, 3, '#727a52');
    for (let i = 0; i < 6; i++) {
      const a = hash(i, 2, 4) * Math.PI * 2;
      img.ellipse(16 + Math.cos(a) * 6, 19 + Math.sin(a) * 4, 2, 1.6, '#8d9a63');
    }
    for (let i = 0; i < 3; i++) { const x = 10 + i * 6; img.set(x, 9 - i % 2, '#7f8a66'); img.set(x + 1, 7, '#6d7a58'); }
  },
  salt: img => {
    img.rect(9, 12, 14, 15, '#b7b3a4');
    img.hline(9, 12, 14, '#cfd0c6');
    img.rect(11, 8, 10, 5, '#8f8c80');
    img.rect(13, 16, 6, 7, '#e6e6dc');
    for (let i = 0; i < 5; i++) img.set(7 + i * 5, 28, '#dcdcd2');
  },
  wild_herbs: img => {
    for (let i = 0; i < 3; i++) {
      const x = 10 + i * 6;
      img.line(x, 27, x + (i - 1) * 2, 8, '#54703c');
      for (let j = 0; j < 4; j++) {
        img.ellipse(x - 3 + (i - 1), 12 + j * 4, 3, 1.8, shade('#6f8a4f', j * 0.06));
        img.ellipse(x + 3 + (i - 1), 14 + j * 4, 3, 1.8, shade('#5f7a45', j * 0.06));
      }
    }
  },
  dried_herbs: img => {
    img.hline(4, 6, 24, '#8a7f66');
    for (let i = 0; i < 3; i++) {
      const x = 8 + i * 8;
      img.line(x, 8, x, 24, '#5c5f38');
      for (let j = 0; j < 4; j++) img.ellipse(x + (j % 2 ? 2 : -2), 11 + j * 4, 2.4, 1.4, shade('#7b7e4a', -j * 0.05));
      img.set(x, 7, '#a89a72');
    }
  },

  /* ------------------------------------------------------------ horta */
  potato: img => {
    img.ellipse(13, 17, 7, 6, '#9c8151');
    img.ellipse(21, 21, 6, 5, '#8d7448');
    img.ellipse(11, 15, 2.6, 2, '#b49a68');
    for (const [x, y] of [[10, 19], [15, 14], [20, 19], [23, 23]]) { img.set(x, y, '#6d5936'); img.set(x + 1, y + 1, '#6d5936'); }
  },
  corn: img => {
    img.ellipse(15, 16, 6, 11, '#c0a049');
    for (let y = 7; y < 26; y += 3) for (let x = 10; x < 21; x += 3) img.rect(x, y, 2, 2, shade('#d3b257', ((x * y) % 5) * 0.06));
    img.ellipse(22, 19, 4, 9, '#6d8a44');
    img.ellipse(24, 14, 3, 6, '#5c7a3c');
    img.line(15, 5, 15, 2, '#a8955c');
  },
  beans: img => {
    for (const [x, y, a] of [[11, 19, 0.5], [18, 16, -0.4], [20, 23, 0.3], [13, 11, -0.2]]) {
      img.ellipse(x, y, 5, 3.2, '#7a5a42');
      img.ellipse(x - 1.4, y - 0.8, 2, 1.3, '#9a7758');
      img.ellipseOutline(x, y, 5, 3.2, '#5d422f');
    }
  },
  tomato: img => {
    img.ellipse(16, 19, 9, 8, '#a4503f');
    img.ellipse(12, 15, 3.4, 2.6, '#c47060');
    img.ellipseOutline(16, 19, 9, 8, '#7e3b2e');
    img.ellipse(16, 10, 5, 2.4, '#5b7340');
    for (let i = 0; i < 4; i++) img.line(16, 10, 10 + i * 4, 8, '#4d6537');
    img.rect(15, 6, 2, 4, '#4d6537');
  },
  wheat_grain: img => {
    for (let i = 0; i < 3; i++) {
      const x = 9 + i * 7;
      img.line(x, 28, x, 10, '#8f8350');
      for (let j = 0; j < 6; j++) {
        img.ellipse(x - 2.4, 11 + j * 3, 2.4, 1.6, shade('#b8a76a', j * 0.04));
        img.ellipse(x + 2.4, 12 + j * 3, 2.4, 1.6, shade('#a89760', j * 0.04));
      }
      img.line(x, 10, x - 1, 5, '#c6b478');
    }
  },
  fertilizer: img => {
    img.ellipse(16, 21, 11, 7, '#5d5136');
    img.ellipse(13, 18, 4, 3, '#6f6143');
    for (let i = 0; i < 8; i++) {
      const a = hash(i, 5, 2) * Math.PI * 2;
      img.rect(Math.round(16 + Math.cos(a) * 7), Math.round(20 + Math.sin(a) * 4), 2, 2, i % 3 ? '#4c4229' : '#7d6a44');
    }
    img.ellipse(21, 13, 3, 2, '#6d8a4c');
    img.line(21, 15, 21, 18, '#54703c');
  },

  /* --------------------------------------------------------- sementes */
  ...seedIcons(),

  /* ------------------------------------------------------ ferramentas */
  watering_can: img => {
    const c = '#6d7a6a';
    box(img, 7, 13, 14, 13, c);
    img.rect(9, 9, 8, 5, shade(c, -0.14));                                        // gargalo
    handle(img, 9, 9, 14, 4, 2, shade(c, 0.1));                                   // alça
    handle(img, 20, 16, 29, 9, 3, c);                                             // bico
    img.rect(27, 6, 5, 5, shade(c, 0.18));
    for (let i = 0; i < 4; i++) img.set(28 + (i % 2), 5 - Math.floor(i / 2), '#8fb4be');
    img.hline(7, 13, 14, shade(c, 0.26));
  },
  butcher_knife: img => {
    const blade = '#b9beb8';
    img.rect(9, 8, 16, 10, blade);                                                // lâmina larga
    img.hline(9, 8, 16, shade(blade, 0.3));
    img.hline(9, 17, 16, shade(blade, -0.34));
    img.rect(23, 9, 3, 8, shade(blade, -0.2));
    img.ellipse(11, 11, 1.4, 1.4, shade(blade, -0.3));                            // furo
    handle(img, 8, 19, 5, 27, 4, '#5b4632');
    img.rect(6, 17, 5, 3, '#8d8478');
    for (let i = 0; i < 3; i++) img.set(6, 21 + i * 2, '#7c6448');
  }
};

// Cinco sementes com a mesma linguagem: um envelope de papel com o desenho da
// cultura estampado, para se lerem como um conjunto no inventário.
function seedIcons() {
  const crops = {
    seed_potato: { paper: '#8d7a52', mark: '#9c8151' },
    seed_corn: { paper: '#b39a52', mark: '#d3b257' },
    seed_bean: { paper: '#7a6249', mark: '#5d422f' },
    seed_tomato: { paper: '#96604f', mark: '#a4503f' },
    seed_wheat: { paper: '#ad9a63', mark: '#c6b478' }
  };
  const out = {};
  for (const [id, palette] of Object.entries(crops)) {
    out[id] = img => {
      box(img, 7, 7, 18, 19, palette.paper);
      img.rect(9, 9, 14, 8, shade(palette.paper, 0.16));
      // aba dobrada
      img.line(7, 7, 16, 14, shade(palette.paper, -0.28));
      img.line(25, 7, 16, 14, shade(palette.paper, -0.28));
      // amostra grande e legível da cultura, com sombra própria
      img.rect(10, 17, 12, 8, shade(palette.paper, -0.22));
      for (let i = 0; i < 3; i++) {
        img.ellipse(12.5 + i * 4, 21, 2.2, 3, palette.mark);
        img.ellipse(11.8 + i * 4, 20, 0.9, 1.2, shade(palette.mark, 0.3));
      }
      img.hline(10, 16, 12, shade(palette.paper, -0.34));
      img.hline(9, 27, 14, shade(palette.paper, -0.3));
    };
  }
  return out;
}

/* ================================================ roupa de caçador 32x32 */

Object.assign(ITEMS, {
  leather_coat: img => {
    const c = '#5c4331';
    img.rect(11, 6, 10, 4, shade(c, 0.16));                           // ombro
    img.rect(10, 10, 12, 17, c);                                      // tronco
    img.rect(4, 8, 6, 15, shade(c, 0.06));                            // manga esquerda
    img.rect(22, 8, 6, 15, shade(c, -0.16));                          // manga direita
    img.rect(4, 22, 6, 3, shade(c, -0.3)); img.rect(22, 22, 6, 3, shade(c, -0.3));
    img.rect(15, 10, 2, 17, shade(c, -0.34));                         // zíper / frente
    img.rect(9, 4, 6, 4, shade(c, 0.24));                             // gola dobrada
    img.rect(17, 4, 6, 4, shade(c, 0.12));
    img.rect(11, 18, 4, 4, shade(c, -0.26)); img.rect(17, 18, 4, 4, shade(c, -0.26));   // bolsos
    for (let i = 0; i < 4; i++) img.set(14, 12 + i * 4, '#b09a72');   // botões
    img.hline(10, 26, 12, shade(c, -0.36));                           // barra
  },
  fur_hood: img => {
    const c = '#6b5642';
    img.ellipse(16, 17, 11, 10, c);
    img.ellipse(16, 18, 7, 7, '#3c3630');                                         // abertura
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      img.rect(Math.round(16 + Math.cos(a) * 10), Math.round(17 + Math.sin(a) * 9), 2, 2, shade('#8a735a', (i % 3) * 0.1));
    }
    img.ellipse(16, 8, 9, 3, shade(c, 0.16));
  },
  leather_gloves: img => {
    const c = '#61462f';
    for (const flip of [0, 1]) {
      const x = flip ? 17 : 5;
      img.rect(x, 12, 10, 12, c);
      img.hline(x, 12, 10, shade(c, 0.2));
      img.rect(x + (flip ? -2 : 8), 14, 3, 5, shade(c, -0.18));                   // polegar
      for (let i = 0; i < 3; i++) img.rect(x + 1 + i * 3, 8, 2, 5, shade(c, 0.06));
      img.rect(x, 22, 10, 3, shade(c, -0.3));
    }
  },
  hide_boots: img => {
    const c = '#55402e';
    for (const flip of [0, 1]) {
      const x = flip ? 17 : 4;
      img.rect(x + 1, 7, 8, 13, c);
      img.hline(x + 1, 7, 8, shade(c, 0.22));
      img.rect(x, 19, 11, 6, shade(c, -0.2));
      img.hline(x, 24, 11, '#2f261d');
      for (let i = 0; i < 3; i++) img.set(x + 5, 10 + i * 3, '#9c8b6c');          // cadarço de couro
    }
  }
});

/* ============================================== ícones de construção 48 */

const B = 48;

function buildIcon(draw) {
  const img = new Img(B, B);
  draw(img);
  img.volume(0.12);
  img.contour([16, 18, 20, 210]);
  return img;
}

const BUILDS = {
  garden_plot: img => {
    img.rect(5, 30, 38, 12, '#544732');
    img.hline(5, 30, 38, '#6d5b3f');
    for (let i = 0; i < 4; i++) img.rect(8 + i * 9, 33, 6, 3, '#3d3427');
    for (let i = 0; i < 3; i++) {
      const x = 13 + i * 10;
      img.line(x, 30, x + (i - 1) * 2, 14, '#6f8a4a');
      img.ellipse(x - 3, 20, 3.4, 2, '#7d9a52');
      img.ellipse(x + 3, 24, 3.4, 2, '#68824a');
      img.ellipse(x + (i - 1), 12, 3, 3, '#b5a05c');
    }
  },
  water_trough: img => {
    img.rect(4, 22, 40, 16, '#5c5442');
    img.hline(4, 22, 40, '#736a52');
    img.rect(7, 25, 34, 8, '#608ea0');
    img.hline(7, 25, 34, '#7fb0bf');
    img.rect(4, 36, 40, 4, '#443e30');
    for (let i = 0; i < 3; i++) img.rect(10 + i * 13, 38, 4, 6, '#4c4536');
    for (let i = 0; i < 5; i++) img.set(9 + i * 8, 18 - (i % 2) * 3, '#8fb4be');   // respingo
  },
  greenhouse_frame: img => {
    img.rect(6, 16, 36, 26, 'b9cfc84d');
    for (let y = 16; y < 42; y += 1) img.hline(6, y, 36, y % 2 ? 'a8c2ba33' : 'cfe0d833');
    img.line(6, 16, 24, 5, '#7d8a7f');
    img.line(42, 16, 24, 5, '#7d8a7f');
    img.outline(6, 16, 36, 26, '#7d8a7f');
    img.vline(18, 16, 26, '#8d9a8f'); img.vline(30, 16, 26, '#8d9a8f');
    img.hline(6, 29, 36, '#8d9a8f');
    img.rect(14, 33, 8, 8, '#6f8a4a');
    img.rect(26, 33, 8, 8, '#7d9a52');
  },
  snare_trap: img => {
    img.rect(4, 38, 40, 5, '#4f4a3a');
    img.ellipseOutline(22, 33, 11, 5, '#8a8068');
    img.ellipseOutline(22, 33, 10, 4, '#6f6656');
    img.line(22, 33, 34, 16, '#6b6250');
    img.rect(32, 8, 4, 12, '#6b5c40');
    img.hline(30, 8, 8, '#8a7658');
    for (let i = 0; i < 4; i++) img.set(12 + i * 6, 36 - (i % 2), '#6a6f4e');
  },
  stove: img => {
    img.rect(8, 14, 32, 28, '#3c4042');
    img.rect(11, 17, 26, 22, '#5a5248');
    img.rect(14, 22, 15, 13, '#22262a');
    img.rect(17, 25, 9, 7, '#b4703a');
    img.rect(19, 27, 5, 4, '#e0a552');
    img.rect(31, 21, 7, 4, '#6f7679');
    img.rect(31, 29, 7, 4, '#6f7679');
    img.rect(33, 2, 7, 13, '#3a3e40');
    for (let i = 0; i < 3; i++) img.set(35 + (i % 2), 1 - Math.floor(i / 2) + 1, 'b8bcb899');
    img.hline(8, 14, 32, '#585e60');
  },
  drying_rack: img => {
    img.rect(6, 8, 4, 34, '#6b5940');
    img.rect(38, 8, 4, 34, '#6b5940');
    img.rect(6, 8, 36, 4, '#7d6a4c');
    for (let i = 0; i < 4; i++) {
      const x = 11 + i * 8;
      img.rect(x, 13, 5, 14, shade('#8a6a52', (i % 2) * 0.1));
      img.hline(x, 13, 5, '#a3805f');
    }
    img.rect(10, 30, 28, 3, '#6c7a4d');
    img.rect(10, 35, 28, 3, '#7a8553');
  },
  icebox: img => {
    img.rect(10, 5, 28, 38, '#5f6b6e');
    img.rect(13, 8, 22, 32, '#717d80');
    img.hline(13, 24, 22, '#3d4547');
    img.rect(30, 12, 3, 9, '#8d999b');
    img.rect(30, 28, 3, 9, '#8d999b');
    img.rect(16, 11, 6, 5, '#86a36c');
    img.rect(10, 5, 28, 2, '#8a9699');
    for (let i = 0; i < 4; i++) img.set(17 + i * 4, 33, 'cfe0e699');
    img.rect(12, 43, 5, 4, '#3d4547'); img.rect(31, 43, 5, 4, '#3d4547');
  }
};

/* ========================================= folhas de animais 48x40 x13 */

// 40px de altura, não 32: os chifres do veado e as orelhas do coelho precisam
// de céu. O bicho se apoia na linha 36, o que deixa margem para a sombra.
const AF = { w: 48, h: 40, ground: 36, count: 13 };

// Corpo quadrúpede paramétrico. Coelho, veado, javali e lobo saem da mesma
// função mudando proporção; a ave troca as patas dianteiras por asa e cauda.
function drawAnimal(img, ox, spec, pose) {
  const g = AF.ground;
  const cx = ox + 24;
  const bob = pose.bob || 0;
  const by = g - spec.legLen - spec.bodyH + bob;      // topo do corpo
  const bottom = by + spec.bodyH;

  // --- pernas: as de trás primeiro e mais escuras, para separar os planos ---
  const legCount = spec.bird ? 2 : 4;
  for (let i = legCount - 1; i >= 0; i--) {
    const front = i < 2;
    const far = i % 2 === 1;
    const lx = cx + (front ? spec.bodyW * 0.3 : -spec.bodyW * 0.32) + (far ? 2 : -1);
    const swing = (pose.legs && pose.legs[i]) || 0;
    const top = bottom - 2;
    const foot = g - Math.abs(swing) * 0.22;
    const c = shade(spec.color, far ? -0.45 : -0.28);
    for (let y = top; y < foot; y++) {
      const tt = (y - top) / Math.max(1, foot - top);
      const x = Math.round(lx + swing * tt);
      img.set(x, Math.round(y), c);
      if (spec.bodyW > 20) img.set(x + 1, Math.round(y), shade(spec.color, far ? -0.5 : -0.36));
    }
    // casco / pata no contato
    img.rect(Math.round(lx + swing - (spec.bodyW > 20 ? 1 : 0)), Math.round(foot) - 1, spec.bodyW > 20 ? 4 : 3, 2, shade(spec.color, -0.52));
  }

  // --- corpo ---------------------------------------------------------------
  const rx = spec.bodyW / 2, ry = spec.bodyH / 2;
  img.ellipse(cx, by + ry, rx, ry, spec.color);
  img.ellipse(cx - rx * 0.2, by + ry * 0.62, rx * 0.55, ry * 0.42, shade(spec.color, 0.15));
  if (spec.belly) img.ellipse(cx, by + spec.bodyH * 0.76, rx * 0.62, ry * 0.34, spec.belly);
  img.ellipseOutline(cx, by + ry, rx, ry, shade(spec.color, -0.34));

  // --- pescoço e cabeça ----------------------------------------------------
  const hx = cx + rx * 0.72 + spec.neck;
  const hy = by + spec.headDrop + (pose.headDrop || 0);
  if (spec.neck > 0) {
    const nw = spec.bodyW > 22 ? 4 : 3;
    for (let k = 0; k < nw; k++) {
      img.line(cx + rx * 0.45 + k * 0.6, by + ry * 0.55, hx - 1 + k * 0.4, hy + 4,
        shade(spec.color, k === 0 ? 0.1 : -0.12));
    }
  }
  img.ellipse(hx, hy + 3, spec.headW / 2, spec.headH / 2, shade(spec.color, 0.08));
  img.ellipseOutline(hx, hy + 3, spec.headW / 2, spec.headH / 2, shade(spec.color, -0.32));
  // focinho projetado para frente, que é o que faz a cabeça ler de perfil
  img.ellipse(hx + spec.headW * 0.42, hy + 4, spec.headW * 0.22, spec.headH * 0.24, shade(spec.color, -0.06));
  img.set(Math.round(hx + spec.headW * 0.6), Math.round(hy + 4), '#2a2420');
  img.set(Math.round(hx + spec.headW * 0.12), Math.round(hy + 2), '#1d1a17');   // olho

  // --- adornos -------------------------------------------------------------
  if (spec.antlers) {
    for (const side of [-1, 1]) {
      const ax = hx - 1 + side * 1.5;
      img.line(ax, hy + 1, ax + side * 2, hy - 5, '#9c8a68');
      img.line(ax + side * 2, hy - 5, ax + side * 5, hy - 4, '#9c8a68');
      img.line(ax + side * 1, hy - 2, ax + side * 4, hy - 6, '#8a7756');
    }
  } else if (spec.longEars) {
    for (const side of [0, 1]) {
      const ex = hx - 2 + side * 2.6;
      const flat = pose.earFlat;
      if (flat) img.ellipse(ex - 3, hy + 1, 3, 1.4, shade(spec.color, -0.12));
      else {
        img.ellipse(ex - 1, hy - 2, 1.4, 3.4, shade(spec.color, -0.1));
        img.set(Math.round(ex - 1), Math.round(hy - 5), shade(spec.color, -0.22));
      }
    }
  } else if (spec.bird) {
    img.rect(Math.round(hx + spec.headW * 0.5), Math.round(hy + 3), 3, 2, '#b08a44');
    img.ellipse(hx - 1, hy - 1, 2, 2, '#a2483f');                                 // crista
    img.ellipse(hx + 1, hy + 6, 1.6, 1.6, '#a2483f');                             // barbela
  } else {
    for (const side of [0, 1]) {
      img.ellipse(hx - 2 + side * 3, hy, 1.8, 2.2, shade(spec.color, -0.18));     // orelhas curtas
    }
  }
  if (spec.tusks) {
    img.set(Math.round(hx + spec.headW * 0.46), Math.round(hy + 2), '#e0dac4');
    img.set(Math.round(hx + spec.headW * 0.52), Math.round(hy + 1), '#e0dac4');
  }

  // --- cauda / asa ---------------------------------------------------------
  const tx = cx - rx;
  if (spec.bird) {
    // asa dobrada sobre o corpo + leque curto de cauda apontando para trás
    img.ellipse(cx - 1, by + spec.bodyH * 0.45, rx * 0.55, ry * 0.52, shade(spec.color, -0.2));
    img.ellipseOutline(cx - 1, by + spec.bodyH * 0.45, rx * 0.55, ry * 0.52, shade(spec.color, -0.34));
    for (let i = 0; i < 3; i++) {
      const len = 7 - i;
      const lift = by + spec.bodyH * 0.34 - i * 2.4;
      img.line(tx + 1, by + spec.bodyH * 0.52, tx - len, lift, shade(spec.color, 0.08 - i * 0.1));
      img.line(tx + 1, by + spec.bodyH * 0.58, tx - len, lift + 1, shade(spec.color, -0.16 - i * 0.06));
    }
  } else if (spec.bushyTail) {
    img.ellipse(tx - 3, by + spec.bodyH * 0.3, 4.5, 3, shade(spec.color, -0.14));
    img.ellipse(tx - 4, by + spec.bodyH * 0.24, 2, 1.6, shade(spec.color, 0.1));
  } else if (spec.puffTail) {
    img.ellipse(tx - 1, by + spec.bodyH * 0.42, 3, 2.8, '#d5cfc0');
    img.ellipse(tx - 2, by + spec.bodyH * 0.34, 1.4, 1.2, '#eae6da');
  } else {
    img.line(tx + 1, by + spec.bodyH * 0.3, tx - 4, by + spec.bodyH * 0.05, shade(spec.color, -0.26));
    img.ellipse(tx - 4, by + spec.bodyH * 0.02, 1.4, 2, shade(spec.color, -0.16));
  }
}

// legLen + bodyH tem de caber abaixo de AF.ground deixando céu para a cabeça:
// veado 10+13 = 23 de 36, com a galhada terminando por volta de y=2.
const ANIMAL_SPECS = {
  rabbit:   { color: '#8b7d68', belly: '#c6bca8', bodyW: 17, bodyH: 10, headW: 8,  headH: 7, neck: 0, headDrop: -4, legLen: 4,  longEars: true, puffTail: true },
  pheasant: { color: '#7d6a4a', belly: '#9c8a64', bodyW: 16, bodyH: 12, headW: 7,  headH: 6, neck: 4, headDrop: -7, legLen: 6,  bird: true },
  deer:     { color: '#7a6047', belly: '#b0a086', bodyW: 24, bodyH: 13, headW: 9,  headH: 7, neck: 5, headDrop: -7, legLen: 10, antlers: true },
  boar:     { color: '#5b4c3f', belly: '#6f6053', bodyW: 24, bodyH: 14, headW: 11, headH: 9, neck: 1, headDrop: -1, legLen: 6,  tusks: true, bushyTail: true },
  wolf:     { color: '#5f5c55', belly: '#87847d', bodyW: 23, bodyH: 11, headW: 10, headH: 7, neck: 3, headDrop: -5, legLen: 8,  bushyTail: true }
};

// idle(2) walk(4) run(4) alert(1) hurt(1) dead(1)
function animalPoses(spec) {
  const gait = spec.legLen * 0.8;
  return [
    { bob: 0 },                                                                  // 0 idle
    { bob: 1, headDrop: 1 },                                                     // 1 idle respirando
    { bob: 0, legs: [gait, -gait, -gait, gait] },                                // 2..5 walk
    { bob: -1, legs: [gait * 0.3, -gait * 0.3, -gait * 0.3, gait * 0.3] },
    { bob: 0, legs: [-gait, gait, gait, -gait] },
    { bob: -1, legs: [-gait * 0.3, gait * 0.3, gait * 0.3, -gait * 0.3] },
    { bob: -2, legs: [gait * 1.6, gait * 1.3, -gait * 1.5, -gait * 1.2] },       // 6..9 run
    { bob: -3, legs: [gait * 0.4, gait * 0.2, gait * 0.3, gait * 0.5] },
    { bob: -2, legs: [-gait * 1.5, -gait * 1.3, gait * 1.6, gait * 1.2] },
    { bob: -3, legs: [-gait * 0.4, -gait * 0.2, -gait * 0.3, -gait * 0.5] },
    { bob: -1, headDrop: -3 },                                                   // 10 alerta
    { bob: 1, headDrop: 3, earFlat: true },                                      // 11 ferido
    { dead: true }                                                               // 12 morto
  ];
}

// O bicho caído: corpo no chão, pernas para fora, cabeça largada para frente.
function drawCarcass(img, ox, spec) {
  const cx = ox + 24;
  const y = AF.ground - 5;
  const rx = spec.bodyW / 2 + 1;

  for (let i = 0; i < 3; i++) {
    const lx = cx - 5 + i * 5;
    img.line(lx, y, lx - 4 - i, y - 5 - (i % 2) * 2, shade(spec.color, -0.4));
    img.rect(Math.round(lx - 5 - i), Math.round(y - 6 - (i % 2) * 2), 2, 2, shade(spec.color, -0.5));
  }

  img.ellipse(cx, y, rx, 4, spec.color);
  img.ellipse(cx - rx * 0.2, y - 1, rx * 0.5, 2, shade(spec.color, 0.12));
  img.ellipseOutline(cx, y, rx, 4, shade(spec.color, -0.34));

  const hx = cx + rx * 0.85;
  img.ellipse(hx, y + 1, spec.headW / 2, spec.headH / 2 - 1, shade(spec.color, 0.04));
  img.ellipseOutline(hx, y + 1, spec.headW / 2, spec.headH / 2 - 1, shade(spec.color, -0.3));
  img.set(Math.round(hx + spec.headW * 0.25), Math.round(y + 1), '#1d1a17');
  if (spec.antlers) {
    img.line(hx + 1, y - 1, hx + 5, y - 5, '#9c8a68');
    img.line(hx + 5, y - 5, hx + 8, y - 4, '#9c8a68');
  }
  if (spec.bird) for (let i = 0; i < 3; i++) img.line(cx - rx, y, cx - rx - 7, y - 3 - i * 2, shade(spec.color, -0.1));
}

function animalSheet(id) {
  const spec = ANIMAL_SPECS[id];
  const img = new Img(AF.w * AF.count, AF.h);
  const poses = animalPoses(spec);

  for (let f = 0; f < AF.count; f++) {
    const ox = f * AF.w;
    const pose = poses[f];
    if (pose.dead) drawCarcass(img, ox, spec);
    else drawAnimal(img, ox, spec, pose);
  }

  img.volume(0.1);
  img.contour([13, 15, 18, 200]);
  return img;
}

/* =========================================== overlays de roupa 48x64x65 */

function wearableOverlays() {
  const C = require('./character');
  const { playerPoses } = require('./poses');
  const { buildSheet, finish, garmentTorso, garmentSleeves, garmentCoat, garmentBeanie, garmentBoots, garmentLegs } = C;

  const PLAYER = {
    skin: '#caa276', skinShade: '#9b6f4e', hair: '#43301d', hairStyle: 'short',
    top: '#616d4a', topDark: '#3d4630', topLight: '#87956a', sleeve: '#55603f',
    pants: '#39414f', pantsDark: '#262d37', boots: '#2d2620', bootCap: '#57473a',
    belt: '#6a4326', brow: '#2b211a', eye: '#1e1b18', shoulderW: 13, waistW: 10
  };
  const BODY_OFF = { head: false, face: false, hair: false, torso: false, legs: false, boots: false, arms: false, hands: false };

  // Couro curtido e pele: tudo que a base produz a partir da caça.
  const OVERLAYS = {
    leather_coat: {
      torso: (i, J) => {
        garmentTorso(i, J, '#5c4331', { shoulderW: 15, zip: true, collarShade: 0.18 });
        garmentSleeves(i, J, '#5c4331', { w: 5, cuff: '#3f2e22' });
      },
      legs: (i, J) => garmentCoat(i, J, '#5c4331', 9, { w: 13.5, band: '#7d6247' })
    },
    fur_hood: {
      head: (i, J, d) => garmentBeanie(i, J, '#6b5642', d, { brim: '#8a735a' })
    },
    leather_gloves: {
      torso: (i, J) => garmentSleeves(i, J, '#61462f', { stop: 0.9, w: 4, cuff: '#48331f' })
    },
    hide_boots: {
      legs: (i, J, d) => garmentBoots(i, J, '#55402e', d, { shaft: 5, cap: '#75593f', band: '#8a6f4c' })
    }
  };

  const out = [];
  for (const [id, garments] of Object.entries(OVERLAYS)) {
    const img = buildSheet(playerPoses(), { ...PLAYER, garments }, BODY_OFF);
    out.push([id, finish(img, { volume: 0.11, contourColor: [13, 15, 18, 200] })]);
  }
  return out;
}

/* ============================================ faca de abate na mão 48x20 */

function heldButcherKnife() {
  const img = new Img(48, 20);
  const blade = '#b9beb8', grip = '#5b4632';
  // cabo à esquerda, lâmina para a direita: mesma convenção do resto do arsenal
  for (let x = 4; x < 14; x++) img.rect(x, 8, 1, 5, x % 3 === 0 ? shade(grip, -0.2) : grip);
  img.rect(4, 8, 10, 1, shade(grip, 0.22));
  img.rect(4, 12, 10, 1, shade(grip, -0.3));
  img.rect(14, 7, 2, 7, '#8d8478');
  for (let x = 16; x < 38; x++) {
    const t = (x - 16) / 22;
    const top = Math.round(6 - t * 1.5), h = Math.round(6 + t * 3);
    for (let k = 0; k < h; k++) img.set(x, top + k, k === 0 ? shade(blade, 0.3) : k === h - 1 ? shade(blade, -0.36) : blade);
  }
  img.ellipse(18, 8, 1.2, 1.2, shade(blade, -0.3));
  img.line(38, 5, 41, 11, shade(blade, 0.12));
  img.volume(0.12);
  img.contour([13, 15, 18, 205]);
  return img;
}

/* =============================================================== main */

function main() {
  const args = process.argv.slice(2);
  const only = k => !args.length || args.includes(`--${k}`);
  let n = 0;

  if (only('items')) {
    fs.mkdirSync(ITEMS_OUT, { recursive: true });
    for (const [name, draw] of Object.entries(ITEMS)) {
      icon(draw).save(path.join(ITEMS_OUT, `${name}.png`), 16);
      n++;
    }
    console.log(`items: ${Object.keys(ITEMS).length}`);
  }

  if (only('build')) {
    fs.mkdirSync(BUILD_OUT, { recursive: true });
    for (const [name, draw] of Object.entries(BUILDS)) {
      buildIcon(draw).save(path.join(BUILD_OUT, `${name}.png`), 18);
      n++;
    }
    console.log(`build: ${Object.keys(BUILDS).length}`);
  }

  if (only('animals')) {
    fs.mkdirSync(SPRITE_OUT, { recursive: true });
    for (const id of Object.keys(ANIMAL_SPECS)) {
      animalSheet(id).save(path.join(SPRITE_OUT, `animal_${id}.png`), 22);
      n++;
    }
    console.log(`animals: ${Object.keys(ANIMAL_SPECS).length} sheets x ${AF.count} frames (${AF.w}x${AF.h})`);
  }

  if (only('wear')) {
    fs.mkdirSync(SPRITE_OUT, { recursive: true });
    for (const [id, img] of wearableOverlays()) {
      img.save(path.join(SPRITE_OUT, `player_${id}.png`), 18);
      n++;
    }
    console.log('wearables: 4');
  }

  if (only('held')) {
    heldButcherKnife().save(path.join(ITEMS_OUT, 'held_butcher_knife.png'), 16);
    n++;
    console.log('held: 1');
  }

  console.log(`stage31 assets written: ${n}`);
}

main();
