// World validation: generates the county for several seeds and checks the
// things that break exploration — invalid tiles, missing sprites, props and
// containers buried in walls, and places the player cannot reach.
//   node tools/validate_world.js [seedCount]
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const seeds = Number(process.argv[2] || 4);

function boot(seed) {
  const ctx = vm.createContext({ console, Math, Map, Set, Array, Object, JSON, Uint8Array, Int16Array, Float32Array, Uint8ClampedArray, Number, String, Boolean });
  for (const f of ['config.js', 'decor_data.js', 'world.js', 'structures.js', 'underground.js', 'lore.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f });
  }
  vm.runInContext(`
    globalThis.__w = new World(${seed});
    globalThis.__s = new StructureManager(__w, ${seed});
    globalThis.__l = new LoreSystem(__w, __s, { count: () => 0 }, null, ${seed});
  `, ctx);
  return { world: ctx.__w, S: ctx.__s, TILE: vm.runInContext('TILE', ctx), TILE_INFO: vm.runInContext('TILE_INFO', ctx), DECOR_SIZE: vm.runInContext('DECOR_SIZE', ctx), CONFIG: vm.runInContext('CONFIG', ctx) };
}

// Standing cells reachable from the spawn column. Doors, barricades and
// shutters count as passable (they can be opened or forced); rubble and
// false walls count as solid, so secrets stay secret.
function reach(env, openCells) {
  const { world, TILE, TILE_INFO, CONFIG } = env;
  const W = CONFIG.WORLD_W, H = CONFIG.WORLD_H;
  const solid = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return true;
    if (openCells.has(y * W + x)) return false;
    const t = world.get(x, y);
    return Boolean(TILE_INFO[t]?.solid);
  };
  const ladder = (x, y) => world.get(x, y) === TILE.LADDER;
  const platform = (x, y) => Boolean(TILE_INFO[world.get(x, y)]?.platform);
  const free = (x, y) => !solid(x, y) && !solid(x, y - 1);
  const supported = (x, y) => solid(x, y + 1) || platform(x, y + 1) || ladder(x, y) || ladder(x, y + 1);
  const seen = new Uint8Array(W * H);
  const q = [];
  const push = (x, y) => {
    if (x < 1 || x >= W - 1 || y < 2 || y >= H - 1) return;
    const k = y * W + x;
    if (seen[k] || !free(x, y)) return;
    // falling: settle onto the first support below
    let yy = y;
    while (!supported(x, yy) && yy < H - 2 && free(x, yy + 1)) yy++;
    const k2 = yy * W + x;
    seen[k] = 1;
    if (!seen[k2]) { seen[k2] = 1; }
    q.push([x, yy]);
  };
  const sx = 24;
  push(sx, world.groundY(sx) - 1);
  while (q.length) {
    const [x, y] = q.pop();
    for (const dx of [-1, 1]) {
      push(x + dx, y);
      if (!solid(x, y - 2)) push(x + dx, y - 1);            // step up
    }
    // jump: up to 3 tiles, then sideways
    for (let h = 1; h <= 3; h++) {
      if (solid(x, y - h - 1)) break;
      push(x, y - h);
      for (const dx of [-1, 1]) {
        if (!free(x + dx, y - h)) continue;   // no jumping through walls
        push(x + dx, y - h);
        push(x + dx * 2, y - h);
      }
    }
    if (ladder(x, y) || ladder(x, y - 1)) { push(x, y - 1); }
    if (ladder(x, y + 1) || platform(x, y + 1)) push(x, y + 1);
  }
  return seen;
}

let totalIssues = 0;
for (let i = 0; i < seeds; i++) {
  const seed = 1000 + i * 7919;
  const env = boot(seed);
  const { world, S, TILE, TILE_INFO, DECOR_SIZE, CONFIG } = env;
  const W = CONFIG.WORLD_W, H = CONFIG.WORLD_H;
  const issues = [];

  // 1. every tile id is known
  let bad = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!TILE_INFO[world.get(x, y)]) bad++;
    const wl = world.getWall(x, y);
    if (wl && !TILE_INFO[wl]) bad++;
  }
  if (bad) issues.push(`${bad} tiles com id inválido`);

  // 2. every prop has a sprite and sits inside the map
  const missing = new Set();
  let outside = 0, buried = 0;
  const buriedEx = [];
  for (const p of S.props) {
    if (!DECOR_SIZE[p.asset]) missing.add(p.asset);
    if (p.tileX < 0 || p.tileX >= W || p.tileY < 0 || p.tileY >= H) { outside++; continue; }
    if (p.wall || p.offsetY < -8) continue;
    const t = world.get(p.tileX, p.tileY);
    if (TILE_INFO[t]?.solid && t !== TILE.RUBBLE && t !== TILE.FENCE && t !== TILE.CHAIN_FENCE && t !== TILE.SANDBAG) { buried++; if (buriedEx.length < 6) buriedEx.push(`${p.asset}@${p.tileX},${p.tileY}`); }
  }
  if (missing.size) issues.push(`sprites inexistentes: ${[...missing].join(', ')}`);
  if (outside) issues.push(`${outside} props fora do mapa`);
  if (buried > 30) issues.push(`${buried} props dentro de blocos sólidos (ex.: ${buriedEx.join(' ')})`);

  // 3. containers not inside walls, and reachable from spawn
  const open = new Set();
  for (const p of S.points) {
    if (!['door', 'barricade', 'shutter'].includes(p.kind)) continue;
    const w = p.width || 1, h = p.height || 1;
    for (let a = 0; a < w; a++) for (let b = 0; b < h; b++) open.add((p.tileY - b) * W + p.tileX + a);
  }
  const seen = reach(env, open);
  const near = (cx, cy, r) => {
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      if (seen[y * W + x]) return true;
    }
    return false;
  };
  const secretBoxes = new Set();
  for (const s of S.structures) for (const r of s.secretRooms || []) if (r.realized) {
    for (const c of S.containers) {
      const cx = Math.floor(c.x / 32), cy = Math.floor(c.y / 32);
      if (cx >= r.x0 - 1 && cx <= r.x1 + 1 && cy >= r.y0 - 2 && cy <= r.y1 + 1) secretBoxes.add(c);
    }
  }
  const unreachable = [];
  let inWall = 0;
  const inWallNames = [];
  for (const c of S.containers) {
    const cx = Math.floor((c.x + c.width / 2) / 32), cy = Math.floor((c.y + c.height / 2) / 32);
    if (TILE_INFO[world.get(cx, cy)]?.solid && !open.has(cy * W + cx)) { inWall++; inWallNames.push(`${c.name}@${cx},${cy}`); }
    if (secretBoxes.has(c)) continue;
    if (!near(cx, cy, 2)) unreachable.push(`${c.name}@${cx},${cy}`);
  }
  if (inWall) issues.push(`${inWall} containers dentro de parede: ${inWallNames.join(' | ')}`);
  if (unreachable.length) issues.push(`${unreachable.length} containers inacessíveis: ${unreachable.slice(0, 12).join(' | ')}`);

  // 4. doors and interactive points reachable
  const lostPoints = S.points.filter(p => p.kind !== 'cave_mouth' && !near(p.tileX, p.tileY, 2)).map(p => `${p.kind}:${p.name}@${p.tileX},${p.tileY}`);
  if (lostPoints.length) issues.push(`${lostPoints.length} pontos inacessíveis: ${lostPoints.slice(0, 10).join(' | ')}`);

  // 5. every structure can be entered
  const lostStructures = S.structures.filter(s => {
    for (let x = s.x; x <= s.endX; x++) for (let y = (s.yTop ?? s.groundY - 20); y <= (s.yBottom ?? s.groundY + 2); y++) if (seen[y * W + x]) return false;
    return true;
  }).map(s => s.name);
  if (lostStructures.length) issues.push(`estruturas inalcançáveis: ${lostStructures.join(', ')}`);
  if (lostStructures.length && process.env.LC_DEBUG) {
    // where the walk east stops: print the tiles around the frontier
    let fx = 0;
    const st = S.walkable(true).seen;
    for (let x = 0; x < W; x++) for (let y = 0; y <= world.surface[x] + 2; y++) if (st[y * W + x] && x > fx) fx = x;
    const ch = (x, y) => st[y * W + x] ? 'o' : world.get(x, y) === TILE.AIR ? '.' : world.get(x, y) === TILE.LADDER ? 'H' : TILE_INFO[world.get(x, y)]?.solid ? '#' : '~';
    console.log(`  fronteira em x=${fx}`);
    for (let y = world.surface[fx] - 14; y <= world.surface[fx] + 4; y++) {
      let row = '';
      for (let x = fx - 8; x <= fx + 12; x++) row += ch(x, y);
      console.log('   ' + String(y).padStart(3) + ' ' + row);
    }
  }

  // the route east must be walkable with nothing but hands (unlocked doors only)
  const strict = S.walkable(true).seen;
  let east = 0;
  for (let x = 0; x < W; x++) for (let y = 0; y <= world.surface[x] + 2; y++) if (strict[y * W + x] && x > east) east = x;
  if (east < 940) issues.push(`rota principal sem ferramentas para em x=${east}`);

  const realized = S.structures.reduce((n, s) => n + (s.secretRooms || []).filter(r => r.realized).length, 0);
  console.log(`seed ${seed}: ${S.structures.length} estruturas, ${S.props.length} props, ${S.containers.length} containers, ${S.lamps.length} luzes, ${S.emitters.length} emissores, ${realized} segredos`);
  console.log(`  estados: ${S.structures.map(s => s.state[0]).join('')}`);
  for (const m of issues) console.log('  - ' + m);
  totalIssues += issues.length;
}
console.log(totalIssues ? `\n${totalIssues} problema(s)` : '\nOK');
process.exitCode = totalIssues ? 1 : 0;
