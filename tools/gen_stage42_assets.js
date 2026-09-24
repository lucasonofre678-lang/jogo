// Pixel-art icons for Stage 42: field manuals / blueprints and the weapon bench.
// Same pipeline and palette rules as the Stage 39/40 generators.
const path = require('path');
const { Img, shade } = require('./pixel');
const root = path.join(__dirname, '..');

// A worn field manual: paper body, coloured spine band and a small diagram
// that hints at what the project teaches.
const manuals = {
  bp_metal_tools: { band:'#7f8586', mark:'tool' },
  bp_power: { band:'#c7a55a', mark:'bolt' },
  bp_armory: { band:'#9b6654', mark:'sight' },
  bp_blackridge: { band:'#5f8a7a', mark:'hex' }
};

function manual(id, { band, mark }) {
  const a = new Img(32, 32);
  const paper = '#cbbd98', ink = '#5e5040';
  a.rect(7, 5, 19, 23, shade(paper, -.22));      // back cover
  a.rect(6, 4, 19, 23, paper);                   // page block
  a.rect(6, 4, 4, 23, band);                     // spine
  a.vline(9, 4, 23, shade(band, -.25));
  a.hline(11, 7, 12, shade(paper, -.3));         // title lines
  a.hline(11, 9, 9, shade(paper, -.3));
  if (mark === 'tool') { a.line(13, 22, 21, 14, ink); a.rect(19, 12, 4, 3, ink); }
  else if (mark === 'bolt') { a.line(18, 12, 14, 18, band); a.line(14, 18, 19, 18, band); a.line(19, 18, 15, 24, band); }
  else if (mark === 'sight') { a.ellipseOutline(17, 18, 5, 5, ink); a.hline(11, 18, 13, ink); a.vline(17, 12, 13, ink); }
  else if (mark === 'hex') { a.ellipseOutline(17, 18, 5, 5, band); a.rect(16, 17, 3, 3, band); a.hline(12, 25, 11, shade(band, -.2)); }
  a.rect(22, 25, 3, 3, '#a2463c');               // bookmark
  a.volume(.1);
  a.contour([12, 15, 16, 230]);
  return a;
}

function weaponBench() {
  const a = new Img(48, 48), steel = '#5f6a6c', wood = '#6d5a44';
  a.rect(4, 26, 40, 5, wood);                    // bench top
  a.hline(4, 26, 40, shade(wood, .25));
  a.rect(6, 31, 4, 14, shade(wood, -.2)); a.rect(38, 31, 4, 14, shade(wood, -.2));
  a.rect(10, 36, 28, 3, shade(wood, -.1));       // lower shelf
  a.rect(6, 6, 36, 18, shade(steel, -.25));      // pegboard
  for (let y = 9; y < 23; y += 4) for (let x = 9; x < 41; x += 4) a.set(x, y, shade(steel, -.45));
  a.rect(10, 11, 20, 3, '#3b3f40'); a.rect(26, 13, 6, 2, '#3b3f40'); a.rect(12, 14, 3, 5, '#3b3f40'); // rifle silhouette
  a.rect(33, 10, 6, 10, '#8c6c4a');              // parts drawer
  a.rect(12, 22, 9, 4, steel); a.rect(24, 22, 6, 4, '#9a8a5a'); // vise and parts on the top
  a.rect(40, 8, 2, 2, '#8fb07a');                // power LED
  a.volume(.09);
  a.contour([12, 15, 16, 230]);
  return a;
}

for (const [id, spec] of Object.entries(manuals)) manual(id, spec).save(path.join(root, 'assets/items', id + '.png'), 16);
weaponBench().save(path.join(root, 'assets/build', 'weapon_bench.png'), 16);
console.log(`Stage 42 assets: ${Object.keys(manuals).length} manuais, 1 construção`);
