// Stage 42 — county map 2.0.
// Zoom (wheel / buttons), drag to pan, a readable terrain profile, region
// names, place glyphs by kind, labels that never pile up, and the current
// journey step shaded as "PRÓXIMA ETAPA" — region-level, never a GPS pin.

const S42_MAP_GROUPS = [
  { key:'home', label:'moradia', color:'#b8a67a', types:['house', 'suburb', 'apartments', 'motel', 'trailer', 'cabin'] },
  { key:'trade', label:'comércio', color:'#d0ad62', types:['market', 'pharmacy', 'diner', 'gas_station', 'parking'] },
  { key:'civic', label:'cívico e saúde', color:'#a9bccb', types:['school', 'clinic', 'hospital', 'chapel', 'cemetery'] },
  { key:'security', label:'segurança', color:'#d0866c', types:['police', 'firestation'] },
  { key:'industry', label:'indústria', color:'#98a3a5', types:['warehouse', 'workshop', 'railyard', 'quarry', 'substation'] },
  { key:'rural', label:'rural e mata', color:'#93a872', types:['farm', 'farm_annex', 'ranger', 'camp', 'wreck'] },
  { key:'under', label:'subsolo', color:'#7f9fb4', types:['metro', 'mine', 'maintenance', 'drainage', 'underground_mall'] },
  { key:'blackridge', label:'Blackridge', color:'#c8574a', types:['blackridge'] }
];
const S42_MAP_GROUP_BY_TYPE = {};
for (const g of S42_MAP_GROUPS) for (const t of g.types) S42_MAP_GROUP_BY_TYPE[t] = g;
const S42_MAP_ZOOMS = [1, 1.5, 2, 3, 4, 6];

class CountyMapView {
  constructor(canvas) {
    this.canvas = canvas;
    this.zi = 2;                 // index into S42_MAP_ZOOMS
    this.cx = null; this.cy = null;
    this.drag = null;
    this.suppressClick = false;
    this.regionSpans = null;
    if (canvas) this.attach(canvas);
  }

  get zoom() { return S42_MAP_ZOOMS[this.zi]; }

  scales() {
    const W = this.canvas.width, H = this.canvas.height, z = this.zoom;
    const sx = W / CONFIG.WORLD_W * z;
    const sy = H / CONFIG.WORLD_H * (1 + (z - 1) * .45);
    return { W, H, sx, sy };
  }

  // Top-left tile of the view, clamped to the county.
  origin() {
    const { W, H, sx, sy } = this.scales();
    const vw = W / sx, vh = H / sy;
    if (this.cx == null) this.centerOn(CONFIG.WORLD_W / 2, CONFIG.WORLD_H / 2);
    const ox = Math.max(0, Math.min(CONFIG.WORLD_W - vw, this.cx - vw / 2));
    const oy = Math.max(0, Math.min(CONFIG.WORLD_H - vh, this.cy - vh / 2));
    return { ox, oy, vw, vh };
  }

  centerOn(tx, ty) { this.cx = tx; this.cy = ty; }

  clampCenter() {
    const { W, H, sx, sy } = this.scales();
    const vw = W / sx, vh = H / sy;
    this.cx = Math.max(vw / 2, Math.min(CONFIG.WORLD_W - vw / 2, this.cx));
    this.cy = Math.max(vh / 2, Math.min(CONFIG.WORLD_H - vh / 2, this.cy));
  }

  // Client (CSS) coordinates → map canvas pixels → tile.
  toTile(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const px = (clientX - rect.left) / Math.max(1, rect.width) * this.canvas.width;
    const py = (clientY - rect.top) / Math.max(1, rect.height) * this.canvas.height;
    const { sx, sy } = this.scales(), { ox, oy } = this.origin();
    return { tx:ox + px / sx, ty:oy + py / sy, px, py };
  }

  setZoom(index, anchor = null) {
    const next = Math.max(0, Math.min(S42_MAP_ZOOMS.length - 1, index));
    if (next === this.zi) return;
    const before = anchor ? this.toTile(anchor.clientX, anchor.clientY) : null;
    this.zi = next;
    if (before) {
      // keep the tile under the cursor where it was
      const { sx, sy, W, H } = this.scales();
      this.cx = before.tx - (before.px - W / 2) / sx;
      this.cy = before.ty - (before.py - H / 2) / sy;
    }
    this.clampCenter();
  }

  attach(canvas) {
    canvas.addEventListener('wheel', e => {
      e.preventDefault?.();
      this.setZoom(this.zi + (e.deltaY < 0 ? 1 : -1), e);
      this.onChange?.();
    }, { passive:false });
    canvas.addEventListener('mousedown', e => {
      this.drag = { x:e.clientX, y:e.clientY, cx:this.cx, cy:this.cy, moved:false };
    });
    const move = e => {
      if (!this.drag) return;
      const rect = this.canvas.getBoundingClientRect();
      const k = this.canvas.width / Math.max(1, rect.width);
      const dx = (e.clientX - this.drag.x) * k, dy = (e.clientY - this.drag.y) * k;
      if (Math.abs(dx) + Math.abs(dy) > 5) this.drag.moved = true;
      if (!this.drag.moved) return;
      const { sx, sy } = this.scales();
      this.cx = this.drag.cx - dx / sx;
      this.cy = this.drag.cy - dy / sy;
      this.clampCenter();
      this.onChange?.();
    };
    const up = () => { if (this.drag?.moved) this.suppressClick = true; this.drag = null; };
    if (typeof window !== 'undefined') { window.addEventListener('mousemove', move); window.addEventListener('mouseup', up); }
  }

  takeClick() { const s = this.suppressClick; this.suppressClick = false; return !s; }

  spans() {
    if (this.regionSpans) return this.regionSpans;
    const out = [];
    let cur = null;
    for (let x = 0; x < CONFIG.WORLD_W; x++) {
      const r = world.region(x);
      if (!cur || cur.id !== r.id) { cur = { id:r.id, name:r.name, x0:x, x1:x }; out.push(cur); }
      else cur.x1 = x;
    }
    return (this.regionSpans = out);
  }

  /* ------------------------------------------------------------- render */

  render() {
    const mc = this.canvas.getContext('2d');
    const { W, H, sx, sy } = this.scales();
    const { ox, oy, vw } = this.origin();
    const X = tx => (tx - ox) * sx, Y = ty => (ty - oy) * sy;
    const s41Runtime = typeof stage41 !== 'undefined';
    const known = x => worldState.discoveredRegions.has(world.region(Math.max(0, Math.min(CONFIG.WORLD_W - 1, Math.floor(x)))).id);

    // sky and depth
    const g = mc.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#141c1f'); g.addColorStop(1, '#0a0e0f');
    mc.fillStyle = g; mc.fillRect(0, 0, W, H);

    // terrain profile: surface band, soil, deep rock, fog over the unknown
    const step = 2;
    for (let px = 0; px < W; px += step) {
      const tx = Math.floor(ox + px / sx);
      if (tx < 0 || tx >= CONFIG.WORLD_W) continue;
      const gy = world.surface[tx] ?? world.groundY(tx);
      const y = Y(gy);
      const isKnown = known(tx);
      if (isKnown) {
        mc.fillStyle = '#2f3a30'; mc.fillRect(px, y, step, Math.max(0, Y(gy + 14) - y));
        mc.fillStyle = '#232a27'; mc.fillRect(px, Y(gy + 14), step, Math.max(0, Y(gy + 55) - Y(gy + 14)));
        mc.fillStyle = '#191e1e'; mc.fillRect(px, Y(gy + 55), step, H);
        const tile = world.get(tx, gy);
        const road = [TILE.ASPHALT, TILE.CRACKED_ASPHALT, TILE.ROAD_LINE].includes(tile);
        const gravel = tile === TILE.GRAVEL || tile === TILE.DRY_DIRT;
        mc.fillStyle = road ? '#b1a27a' : gravel ? '#8d8062' : '#6f8a5a';
        mc.fillRect(px, y - 1, step, road ? 3 : 2);
      } else {
        mc.fillStyle = '#1b2123'; mc.fillRect(px, y, step, H - y);
        mc.fillStyle = 'rgba(80,90,92,.35)'; mc.fillRect(px, y - 1, step, 1);
      }
    }

    // region names along the top
    mc.font = '600 9px "Courier New", monospace';
    mc.textBaseline = 'middle';
    for (const r of this.spans()) {
      const a = X(r.x0), b = X(r.x1 + 1);
      if (b < 0 || a > W) continue;
      mc.fillStyle = 'rgba(214,208,184,.12)'; mc.fillRect(Math.round(a), 0, 1, 22);
      const isKnown = worldState.discoveredRegions.has(r.id);
      const label = isKnown ? r.name.toUpperCase() : '· · ·';
      const tw = mc.measureText(label).width;
      if (b - a > tw + 10) {
        mc.fillStyle = isKnown ? 'rgba(214,208,184,.72)' : 'rgba(150,150,140,.35)';
        mc.fillText(label, Math.max(a + 5, Math.min(b - tw - 5, (a + b) / 2 - tw / 2)), 11);
      }
    }

    // journey: the next step's places are shaded as a band, not pinned
    const targets = typeof journey42 !== 'undefined' ? journey42.mapTargets() : [];
    const journey = typeof journey42 !== 'undefined' ? journey42.current() : null;
    if (targets.length) {
      mc.save();
      mc.setLineDash?.([4, 4]);
      for (const s of targets) {
        const a = X(s.x - 6), b = X(s.endX + 6);
        if (b < 0 || a > W) continue;
        mc.fillStyle = 'rgba(226,189,106,.08)'; mc.fillRect(a, 24, b - a, H - 24);
        mc.strokeStyle = 'rgba(226,189,106,.55)'; mc.lineWidth = 1;
        mc.strokeRect(Math.round(a) + .5, 24.5, Math.round(b - a), H - 26);
      }
      mc.restore();
    }

    // discovered underground places as cut-away blocks
    for (const s of structures.structures) {
      if (!s.discovered || !s.underground || (s.stage41 && s41Runtime)) continue;
      const y1 = s.yTop ?? s.y1 ?? s.groundY - 8, y2 = s.yBottom ?? s.y2 ?? s.groundY + 2;
      const a = X(s.x), b = X(s.endX);
      if (b < 0 || a > W) continue;
      mc.fillStyle = 'rgba(127,159,180,.22)'; mc.fillRect(a, Y(y1), Math.max(2, b - a), Math.max(2, Y(y2) - Y(y1)));
      mc.strokeStyle = 'rgba(127,159,180,.55)'; mc.strokeRect(Math.round(a) + .5, Math.round(Y(y1)) + .5, Math.max(2, b - a), Math.max(2, Y(y2) - Y(y1)));
    }

    // places: glyph by kind, labels placed without overlapping
    const placed = [];
    const free = (x, y, w, h) => !placed.some(r => x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y);
    const places = structures.structures.filter(s => s.discovered && !(s.stage41 && s41Runtime))
      .map(s => ({ s, group:S42_MAP_GROUP_BY_TYPE[s.type] || S42_MAP_GROUPS[5], pt:this.placePoint(s) }))
      .filter(p => { const x = X(p.pt.tx); return x > -40 && x < W + 40; })
      .sort((a, b) => this.priority(b.s) - this.priority(a.s));
    for (const p of places) {
      const x = Math.round(X(p.pt.tx)), y = Math.round(Y(p.pt.ty));
      mc.fillStyle = 'rgba(8,11,12,.8)'; mc.fillRect(x - 5, y - 5, 10, 10);
      mc.fillStyle = p.group.color; mc.fillRect(x - 3, y - 3, 7, 7);
      placed.push({ x:x - 5, y:y - 5, w:10, h:10 });
    }
    mc.font = '600 9px "Courier New", monospace';
    for (const p of places) {
      if (this.zoom < 1.5 && this.priority(p.s) < 2) continue;
      const x = Math.round(X(p.pt.tx)), y = Math.round(Y(p.pt.ty));
      const label = String(p.s.name).toUpperCase(), w = mc.measureText(label).width + 8, h = 13;
      const spots = [[x + 8, y - 7], [x - w / 2, y - 22], [x - w / 2, y + 8], [x - w - 8, y - 7]];
      const spot = spots.find(([lx, ly]) => lx > 0 && lx + w < W && ly > 24 && ly + h < H && free(lx, ly, w, h));
      if (!spot) continue;
      placed.push({ x:spot[0], y:spot[1], w, h });
      mc.fillStyle = 'rgba(8,12,13,.8)'; mc.fillRect(spot[0], spot[1], w, h);
      mc.fillStyle = p.s.underground ? '#a8bac7' : '#dcd6bf'; mc.fillText(label, spot[0] + 4, spot[1] + 6.5);
    }

    // Stage 41 expeditions keep their own glyphs (drawn in world tile space)
    mc.save();
    mc.translate(-ox * sx, -oy * sy);
    mc.font = '600 9px "Courier New", monospace';
    if (s41Runtime) for (const s of structures.structures) if (s.stage41 && s.discovered) stage41.drawMapMarker(mc, s, sx, sy);
    mc.restore();

    // vehicles, radio opportunities, operations, base, markers
    for (const v of vehicles.vehicles || []) {
      const tx = (v.x + v.w / 2) / CONFIG.TILE, ty = (v.y + v.h / 2) / CONFIG.TILE;
      if (!known(tx)) continue;
      mc.fillStyle = '#b09061'; mc.fillRect(X(tx) - 3, Y(ty) - 2, 7, 4);
      mc.fillStyle = '#1a1c1c'; mc.fillRect(X(tx) - 2, Y(ty) + 2, 2, 2); mc.fillRect(X(tx) + 2, Y(ty) + 2, 2, 2);
    }
    for (const signal of baseCamp.activeMapSignals()) {
      const x = X(signal.tileX), y = Y(signal.tileY);
      mc.strokeStyle = '#c89a58'; mc.lineWidth = 2;
      mc.beginPath(); mc.arc(x, y, 10, 0, Math.PI * 2); mc.stroke();
      mc.fillStyle = 'rgba(200,154,88,.18)'; mc.beginPath(); mc.arc(x, y, 18, 0, Math.PI * 2); mc.fill();
    }
    for (const signal of campaign.activeMapSignals()) {
      const x = X(signal.tileX), y = Y(signal.tileY);
      mc.strokeStyle = '#d17a62'; mc.fillStyle = 'rgba(209,122,98,.18)'; mc.lineWidth = 2;
      mc.beginPath(); mc.moveTo(x, y - 10); mc.lineTo(x + 9, y + 7); mc.lineTo(x - 9, y + 7); mc.closePath(); mc.fill(); mc.stroke();
    }
    for (const event of campaign.majorEventMapSignal()) {
      const x = X(event.tileX), y = Y(event.tileY);
      mc.strokeStyle = '#c84f48'; mc.lineWidth = 2; mc.setLineDash?.([5, 4]);
      mc.beginPath(); mc.arc(x, y, 22, 0, Math.PI * 2); mc.stroke(); mc.setLineDash?.([]);
    }
    const baseAnchor = baseCamp.anchor();
    if (baseAnchor) {
      const bx = X(baseAnchor.x / CONFIG.TILE), by = Y(baseAnchor.y / CONFIG.TILE);
      mc.fillStyle = '#8daf87'; mc.fillRect(bx - 4, by - 4, 9, 9);
      mc.strokeStyle = '#d8d0bd'; mc.lineWidth = 1; mc.strokeRect(bx - 5.5, by - 5.5, 12, 12);
      mc.fillStyle = '#d8d0bd'; mc.fillText('BASE', bx + 9, by);
    }
    for (const marker of mapMarkers) {
      const x = X(marker.tileX), y = Y(marker.tileY);
      mc.strokeStyle = '#c36f59'; mc.lineWidth = 2;
      mc.beginPath(); mc.moveTo(x - 5, y); mc.lineTo(x + 5, y); mc.moveTo(x, y - 5); mc.lineTo(x, y + 5); mc.stroke();
    }

    // the survivor
    const pc = player.center();
    const px = X(pc.x / CONFIG.TILE), py = Y(pc.y / CONFIG.TILE);
    mc.fillStyle = 'rgba(224,216,156,.18)'; mc.beginPath(); mc.arc(px, py, 11, 0, Math.PI * 2); mc.fill();
    mc.fillStyle = '#e0d89c'; mc.beginPath(); mc.arc(px, py, 4.5, 0, Math.PI * 2); mc.fill();
    mc.strokeStyle = '#161a19'; mc.lineWidth = 2; mc.stroke();
    if (px < 0 || px > W) {
      // off-screen: arrow on the edge pointing home
      const ex = px < 0 ? 10 : W - 10, dir = px < 0 ? -1 : 1, ey = Math.max(30, Math.min(H - 20, py));
      mc.fillStyle = '#e0d89c'; mc.beginPath(); mc.moveTo(ex + dir * 6, ey); mc.lineTo(ex - dir * 4, ey - 6); mc.lineTo(ex - dir * 4, ey + 6); mc.closePath(); mc.fill();
    }

    // overlay: next step tag, legend, zoom and scale
    if (journey && !journey.complete && targets.length) {
      const label = `PRÓXIMA ETAPA · ${journey.step.short}`;
      mc.font = '700 9px "Courier New", monospace';
      const tw = mc.measureText(label).width + 12;
      const tags = [];
      for (const s of targets) {
        const a = X(s.x - 6), b = X(s.endX + 6);
        if (b < 0 || a > W) continue;
        const x = Math.max(4, Math.min(W - tw - 4, (a + b) / 2 - tw / 2));
        if (tags.some(t => x < t + tw + 4 && x + tw + 4 > t)) continue;   // neighbours share one tag
        tags.push(x);
        mc.fillStyle = 'rgba(12,14,14,.86)'; mc.fillRect(x, 28, tw, 14);
        mc.fillStyle = '#e2bd6a'; mc.fillText(label, x + 6, 35.5);
      }
    }
    this.drawLegend(mc, W, H);
    mc.font = '600 9px "Courier New", monospace';
    const zoomLabel = `ZOOM ${this.zoom}× · RODA DO MOUSE · ARRASTE`;
    const zw = mc.measureText(zoomLabel).width + 12;
    mc.fillStyle = 'rgba(8,11,12,.78)'; mc.fillRect(W - zw - 8, H - 22, zw, 15);
    mc.fillStyle = '#a9aa9d'; mc.fillText(zoomLabel, W - zw - 2, H - 14.5);
    const tiles = vw > 400 ? 200 : vw > 150 ? 50 : 20;
    const barW = tiles * sx;
    mc.fillStyle = 'rgba(214,208,184,.6)'; mc.fillRect(W - barW - 10, H - 30, barW, 2);
    mc.fillRect(W - barW - 10, H - 33, 1, 5); mc.fillRect(W - 11, H - 33, 1, 5);
    mc.fillText(`${tiles} m`, W - barW - 10, H - 38);
  }

  drawLegend(mc, W, H) {
    mc.save();
    mc.font = '600 9px "Courier New", monospace';
    const rows = S42_MAP_GROUPS.filter(g => structures.structures.some(s => s.discovered && g.types.includes(s.type)));
    if (!rows.length) { mc.restore(); return; }
    const h = rows.length * 12 + 10;
    const top = H - h - 40;
    mc.fillStyle = 'rgba(8,11,12,.72)'; mc.fillRect(8, top, 118, h);
    rows.forEach((g, i) => {
      const y = top + 11 + i * 12;
      mc.fillStyle = g.color; mc.fillRect(14, y - 3, 6, 6);
      mc.fillStyle = 'rgba(214,208,184,.78)'; mc.fillText(g.label.toUpperCase(), 25, y);
    });
    mc.restore();
    if (typeof stage41 !== 'undefined') {
      mc.save(); mc.translate(126, 0); stage41.drawMapLegend(mc, W, H); mc.restore();
    }
  }

  priority(s) {
    if (['hospital', 'police', 'firestation', 'blackridge', 'metro', 'substation', 'market', 'school'].includes(s.type)) return 3;
    if ((s.endX - s.x) >= 22) return 2;
    return 1;
  }

  placePoint(s) {
    const tx = (s.x + s.endX) * .5;
    if (s.underground) return { tx, ty:((s.y1 ?? s.yTop ?? s.groundY - 8) + (s.y2 ?? s.yBottom ?? s.groundY + 2)) * .5 };
    return { tx, ty:Math.max(4, (s.groundY ?? world.groundY(Math.floor(tx))) - 5) };
  }
}
