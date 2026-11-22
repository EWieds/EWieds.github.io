/* Crema City — 3D world: city generation, buildings, traffic, people, interiors, day/night. */
"use strict";
(function (CC) {
var T = THREE;
var W = CC.W = {};
var BLOCK = 64, ROAD = 16, PITCH = BLOCK + ROAD, LOT = 28;
W.PITCH = PITCH; W.BLOCK = BLOCK; W.ROAD = ROAD;

/* ---------------- shared materials / geometry ---------------- */
var MAT = {}, GEO = {};
function lam(c, o) { return new T.MeshLambertMaterial(Object.assign({ color: c }, o || {})); }
function mat(c) { return MAT[c] || (MAT[c] = lam(c)); }
GEO.box = new T.BoxGeometry(1, 1, 1);
GEO.cyl = new T.CylinderGeometry(.5, .5, 1, 10);
GEO.sph = new T.SphereGeometry(.5, 10, 8);
GEO.plane = new T.PlaneGeometry(1, 1);
function box(w, h, d, c, x, y, z, parent) { var m = new T.Mesh(GEO.box, typeof c === "number" ? mat(c) : c); m.scale.set(w, h, d); m.position.set(x || 0, (y || 0) + h / 2, z || 0); if (parent) parent.add(m); return m; }
W.box = box; W.mat = mat;
function canvasTex(w, h, draw) { var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); var t = new T.CanvasTexture(c); t.anisotropy = 4; return t; }
W.canvasTex = canvasTex;
function signTex(text, bg, fg) {
  return canvasTex(512, 128, function (g, w, h) {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = "bold 64px system-ui, Arial"; g.textAlign = "center"; g.textBaseline = "middle";
    var s = text; while (g.measureText(s).width > w - 30 && s.length > 4) s = s.slice(0, -1);
    g.fillText(s === text ? s : s + "…", w / 2, h / 2 + 4);
  });
}
W.signTex = signTex;
var WIN = {};
function windowTex(style) {
  if (WIN[style]) return WIN[style];
  var pal = { street: ["#c9b59a", "#8b6f52"], campus: ["#b9473c", "#7d2e27"], towers: ["#9fb6d8", "#5c7598"], ocean: ["#f2e3c4", "#c4a77c"], old: ["#a87855", "#6e4a33"], mall: ["#e8e8ef", "#a7a7b8"], gen: ["#b8c2a8", "#7c8a6a"], res: ["#d9cbb2", "#9c8a6c"] }[style] || ["#bbb", "#888"];
  var tex = canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = pal[0]; g.fillRect(0, 0, w, h);
    for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) { g.fillStyle = "#26344a"; g.fillRect(x * 32 + 7, y * 32 + 8, 18, 18); g.fillStyle = pal[1]; g.fillRect(x * 32 + 7, y * 32 + 26, 18, 3); }
  });
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  var em = canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) { if (Math.random() < .55) { g.fillStyle = Math.random() < .5 ? "#ffd98a" : "#ffe9b8"; g.fillRect(x * 32 + 7, y * 32 + 8, 18, 18); } }
  });
  em.wrapS = em.wrapT = T.RepeatWrapping;
  return (WIN[style] = { map: tex, em: em });
}
function buildingMat(style, w, h) {
  var t = windowTex(style), m = t.map.clone(), e = t.em.clone(); m.needsUpdate = e.needsUpdate = true;
  m.repeat.set(w / 12, h / 12); e.repeat.set(w / 12, h / 12);
  var M = new T.MeshLambertMaterial({ map: m, emissive: 0xffffff, emissiveMap: e, emissiveIntensity: 0 });
  W.nightMats.push(M); return M;
}

/* ---------------- people ---------------- */
var SKIN = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
var SHIRT = [0xe2553f, 0x2f8fd0, 0x21a98d, 0xd99a12, 0x7a5ad8, 0xff79b4, 0x3a3f4b, 0xf4f4f4, 0x6b8f3a];
W.person = function (o) {
  o = o || {}; var g = new T.Group();
  var legs = box(.5, .8, .32, o.pants || 0x2b3550, 0, 0, 0, g);
  var body = box(.62, .8, .38, o.shirt != null ? o.shirt : CC.pick(SHIRT), 0, .78, 0, g);
  var head = new T.Mesh(GEO.sph, mat(o.skin || CC.pick(SKIN))); head.scale.set(.46, .5, .46); head.position.y = 1.85; g.add(head);
  if (o.hat) { var h = box(.5, .14, .5, o.hat, 0, 2.06, 0, g); }
  if (o.apron) box(.64, .62, .05, o.apron, 0, .62, .2, g);
  var sh = new T.Mesh(GEO.plane, W.shadowMat); sh.rotation.x = -Math.PI / 2; sh.scale.set(1, 1, 1); sh.position.y = .02; g.add(sh);
  g.userData = { legs: legs, body: body, head: head, t: Math.random() * 10 };
  return g;
};
W.animPerson = function (p, dt, moving) {
  var u = p.userData; u.t += dt * (moving ? 10 : 2);
  u.body.position.y = .78 + (moving ? Math.abs(Math.sin(u.t)) * .06 : 0);
  u.head.position.y = 1.85 + (moving ? Math.abs(Math.sin(u.t)) * .06 : Math.sin(u.t) * .01);
  u.legs.scale.y = moving ? .8 + Math.abs(Math.sin(u.t)) * .06 : .8;
};

/* ---------------- vehicles ---------------- */
var CARCOL = [0xe2553f, 0x2f8fd0, 0xf4f4f4, 0x2a2e38, 0xd99a12, 0x21a98d, 0x9aa2b0, 0x7a5ad8];
W.car = function (col, truck) {
  var g = new T.Group(), c = col != null ? col : CC.pick(CARCOL);
  if (truck) {
    box(2.6, 2.6, 6.2, c, 0, .55, -.3, g); box(2.5, 1.2, 1.8, 0x223, 0, 1.9, 2.6, g);
    box(2.5, 1.4, 1.9, c, 0, .55, 2.6, g); box(.05, 1.1, 2.4, 0x111, 1.31, 1.4, -.5, g); // serving window
    var aw = box(.9, .08, 2.6, 0xffb83d, 1.7, 2.7, -.5, g); aw.rotation.z = -.35;
    var sg = new T.Mesh(GEO.plane, new T.MeshBasicMaterial({ map: signTex("CREMA TRUCK", "#2a1a12", "#ffb83d") })); sg.scale.set(4, 1, 1); sg.position.set(1.32, 3.0, -.3); sg.rotation.y = Math.PI / 2; g.add(sg);
  } else {
    box(2.2, .9, 4.6, c, 0, .45, 0, g); box(2, .8, 2.4, 0x1c2433, 0, 1.3, -.2, g);
  }
  [[-1.1, 1.5], [1.1, 1.5], [-1.1, -1.5], [1.1, -1.5]].forEach(function (p) { var w = new T.Mesh(GEO.cyl, mat(0x111111)); w.scale.set(.8, .4, .8); w.rotation.z = Math.PI / 2; w.position.set(p[0] * (truck ? 1.2 : 1), .4, p[1] * (truck ? 1.4 : 1)); g.add(w); });
  var sh = new T.Mesh(GEO.plane, W.shadowMat); sh.rotation.x = -Math.PI / 2; sh.scale.set(truck ? 3.4 : 2.8, truck ? 8 : 5.4, 1); sh.position.y = .03; g.add(sh);
  return g;
};

/* ---------------- renderer ---------------- */
W.init = function (canvas) {
  var r = W.renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  r.outputEncoding = T.sRGBEncoding;
  W.camera = new T.PerspectiveCamera(55, 1, .3, 900);
  W.shadowMat = new T.MeshBasicMaterial({ map: canvasTex(64, 64, function (g) { var gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, "rgba(0,0,0,.45)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false });
  W.nightMats = [];
  W.resize();
};
W.resize = function () {
  var w = window.innerWidth, h = window.innerHeight;
  W.renderer.setSize(w, h, false); W.camera.aspect = w / h; W.camera.fov = w < h ? 68 : 55; W.camera.updateProjectionMatrix();
  W.portrait = w < h;
};

/* ---------------- city ---------------- */
// Deterministic layout: same seed, same city. Blocks hold four lots; districts are regions of blocks.
W.buildCity = function (ci) {
  var S = CC.get(), cdef = S.cities[ci], rand = CC.rng(cdef.seed);
  var scene = new T.Scene(); W.nightMats = [];
  scene.fog = new T.Fog(0xbfd9f2, 120, 520);
  var hemi = new T.HemisphereLight(0xdfeeff, 0x4b5a3a, .75); scene.add(hemi);
  var sun = new T.DirectionalLight(0xfff2dd, .9); sun.position.set(80, 140, 60); scene.add(sun);
  W.hemi = hemi; W.sun = sun;
  var R = 2 + Math.min(6, cdef.grow || 0) * 0; // base radius in blocks
  var N = 6 + Math.min(6, (cdef.grow || 0)) ; // grid N x N blocks, grows with the city
  var half = (N * PITCH) / 2;
  // ground and roads
  var ground = new T.Mesh(GEO.plane, mat(0x3d4a37)); ground.rotation.x = -Math.PI / 2; ground.scale.set(N * PITCH + 400, N * PITCH + 400, 1); ground.position.y = -.05; scene.add(ground);
  var road = new T.Mesh(GEO.plane, lam(0x3a3d44)); road.rotation.x = -Math.PI / 2; road.scale.set(N * PITCH + ROAD, N * PITCH + ROAD, 1); scene.add(road);
  // lane markings
  var markTex = canvasTex(64, 64, function (g) { g.fillStyle = "#3a3d44"; g.fillRect(0, 0, 64, 64); g.fillStyle = "#e8d36a"; g.fillRect(0, 30, 34, 4); });
  markTex.wrapS = markTex.wrapT = T.RepeatWrapping;
  var lots = [], blocks = [], dists = districtsFor(ci, N);
  W.cityN = N; W.half = half;
  for (var by = 0; by < N; by++) for (var bx = 0; bx < N; bx++) {
    var cx = -half + PITCH / 2 + bx * PITCH, cz = -half + PITCH / 2 + by * PITCH;
    var dist = dists[by * N + bx];
    var D = CC.distById(dist) || CC.DIST[0];
    // sidewalk slab
    box(BLOCK, .25, BLOCK, D.style === "ocean" ? 0xe8d8b0 : 0xb9bcc4, cx, 0, cz, scene);
    var blk = { bx: bx, by: by, x: cx, z: cz, dist: dist };
    blocks.push(blk);
    if (D.style === "ocean" && by === N - 1) { // boardwalk: beach + water beyond
      box(BLOCK, .1, 30, 0xf0deb0, cx, 0, cz + BLOCK / 2 + ROAD + 15, scene);
    }
    for (var q = 0; q < 4; q++) {
      var qx = q % 2, qz = q >> 1;
      var lx = cx + (qx ? 1 : -1) * (LOT / 2 + 2), lz = cz + (qz ? 1 : -1) * (LOT / 2 + 2);
      var face = qz ? 1 : -1; // doors face the road on the z side
      lots.push({ key: ci + ":" + bx + "," + by + ":" + q, ci: ci, bx: bx, by: by, q: q, x: lx, z: lz, dist: dist, face: face,
        door: { x: lx, z: lz + face * (LOT / 2 + 1.2) } });
    }
  }
  // markings between blocks
  for (var i = 0; i <= N; i++) {
    var p = -half + i * PITCH;
    var mx = new T.Mesh(GEO.plane, new T.MeshLambertMaterial({ map: markTex.clone() })); mx.material.map.needsUpdate = true; mx.material.map.repeat.set(N * PITCH / 8, 1);
    mx.rotation.x = -Math.PI / 2; mx.scale.set(N * PITCH, 1, 1); mx.position.set(0, .02, p); scene.add(mx);
    var mz = mx.clone(); mz.rotation.z = Math.PI / 2; mz.position.set(p, .02, 0); scene.add(mz);
  }
  W.scene = scene; W.lots = lots; W.blocks = blocks; W.ci = ci;
  assignLots(ci, lots, rand);
  lots.forEach(function (L) { buildLot(scene, L, rand); });
  dressing(scene, blocks, rand);
  W.traffic = makeTraffic(scene, N, half, rand);
  W.peds = makePeds(scene, blocks, rand);
  W.water = null;
  return { lots: lots, blocks: blocks, half: half, N: N };
};
// region map: center = main street, then v3 districts around it, generated districts at the edges
function districtsFor(ci, N) {
  var S = CC.get(), out = [], c = (N - 1) / 2;
  var unlocked = CC.DIST.map(function (d) { return d.id; });
  S.genDist = S.genDist || {};
  for (var by = 0; by < N; by++) for (var bx = 0; bx < N; bx++) {
    var dx = bx - c, dz = by - c, r = Math.max(Math.abs(dx), Math.abs(dz)), id;
    if (r <= .5 || (Math.abs(dx) < 1 && Math.abs(dz) < 1)) id = "main";
    else if (by === N - 1) id = "board";
    else if (r >= 3) {
      var ring = Math.floor(r) - 2, sector = (Math.atan2(dz, dx) + Math.PI) / (Math.PI * 2);
      var gi = ci * 100 + ring * 10 + Math.floor(sector * 4);
      id = "g" + gi;
      if (!S.genDist[id]) { var rr = CC.rng(gi * 7919 + 13); S.genDist[id] = { id: id, name: CC.GEN_PREFIX[Math.floor(rr() * 12)] + " " + CC.GEN_SUFFIX[Math.floor(rr() * 12)], lvl: 12 + ring * 4, demand: 1.1 + ring * .12, price: 1 + ring * .1, rent: 1 + ring * .3, style: "gen", am: .8 + rr() * .8, lunch: .8 + rr() * .8, eve: .8 + rr() * .8 }; }
    } else {
      var a = Math.atan2(dz, dx), k = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 4) % 4;
      id = ["campus", "finance", "old", "mall"][k];
    }
    out.push(id);
  }
  return out;
}
// who's on each lot: your shops, rivals, landmarks, your superstore, empty lots for sale
function assignLots(ci, lots, rand) {
  var S = CC.get(), byKey = {};
  lots.forEach(function (L) { byKey[L.key] = L; });
  // landmarks (city 0 has the full civic center; other cities get hall + bank + dealer)
  var c = Math.floor((W.cityN - 1) / 2);
  var LM = [["cityhall", c, c, 0], ["bank", c, c, 1], ["realty", c + 1, c, 2], ["dealer", c - 1, c, 3], ["supplier", c, c + 1, 1], ["airport", 0, 0, 0]];
  LM.forEach(function (m) { var k = ci + ":" + m[1] + "," + m[2] + ":" + m[3]; if (byKey[k]) byKey[k].landmark = m[0]; });
  // superstore block
  W.supBlock = (c + 1) + "," + (c + 1);
  lots.forEach(function (L) { if (L.bx + "," + L.by === W.supBlock && ci === (S.sup ? S.sup.city : ci)) L.supBlock = true; });
  // place your shops: keep their lot if they have one, else nearest free lot in their district
  S.shops.filter(function (sh) { return sh.city === ci; }).forEach(function (sh) {
    var L = sh.lot && byKey[sh.lot];
    if (!L || L.landmark || L.supBlock || (L.shop && L.shop !== sh)) {
      var cands = lots.filter(function (x) { return !x.landmark && !x.supBlock && !x.shop && x.dist === sh.dist; });
      if (!cands.length) cands = lots.filter(function (x) { return !x.landmark && !x.supBlock && !x.shop; });
      cands.sort(function (a, b) { return Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z); });
      L = cands[0];
    }
    if (L) { L.shop = sh; sh.lot = L.key; }
  });
  // everything else: some rivals, some homes/offices, some empty buildings for sale
  lots.forEach(function (L) {
    if (L.shop || L.landmark || L.supBlock) return;
    var r = CC.rng(CC.hash(L.key))();
    var D = CC.distById(L.dist) || CC.DIST[0];
    if (S.rivals[L.key] && S.rivals[L.key].gone) { L.kind = "empty"; return; }
    if (r < .38) { L.kind = "rival"; var ind = CC.IND_ORDER[Math.floor(CC.rng(CC.hash(L.key) + 5)() * (S.lvl >= 22 ? 5 : S.lvl >= 13 ? 3 : 2))]; L.rival = CC.rivalFor(L.key, ind, L.dist); }
    else if (r < .62) L.kind = "empty";
    else L.kind = "office";
  });
}
function buildLot(scene, L, rand) {
  var S = CC.get(), D = CC.distById(L.dist) || CC.DIST[0], st = D.style || "street";
  var g = new T.Group(); g.position.set(L.x, 0, L.z); scene.add(g); L.group = g;
  var rr = CC.rng(CC.hash(L.key) + 1);
  if (L.supBlock && L.q === 0) { return; } // superstore drawn per block
  if (L.supBlock) return;
  var h = { street: 14, campus: 16, towers: 46, ocean: 10, old: 12, mall: 18, gen: 22 }[st] || 14;
  h = Math.round(h * (.7 + rr() * .7));
  if (L.landmark) h = { cityhall: 22, bank: 30, realty: 16, dealer: 8, supplier: 12, airport: 10 }[L.landmark];
  var w = LOT - 2, d = LOT - 2;
  var body = new T.Mesh(GEO.box, buildingMat(st, w, h)); body.scale.set(w, h, d); body.position.y = h / 2 + .25; g.add(body);
  box(w + .6, .6, d + .6, 0x5a5f6a, 0, h + .25, 0, g); // roof lip
  // storefront
  var f = L.face, col = 0x6c7380, label = "", sub = "";
  if (L.shop) { col = CC.IND[L.shop.ind].col; label = "CREMA " + CC.IND[L.shop.ind].name.toUpperCase(); }
  else if (L.rival) { col = CC.IND[L.rival.ind].col; label = L.rival.name.toUpperCase(); }
  else if (L.landmark) { col = { cityhall: 0xe9e2d0, bank: 0x2f3a56, realty: 0x21a98d, dealer: 0xd99a12, supplier: 0x6b3a1f, airport: 0x9fb6d8 }[L.landmark]; label = { cityhall: "CITY HALL", bank: "FIRST CREMA BANK", realty: "REALTY & PROPERTIES", dealer: "TRUCKS & CARS", supplier: "SUPPLY DEPOT", airport: "REGIONAL AIRPORT" }[L.landmark]; }
  else if (L.kind === "empty") { col = 0x8a8f99; label = S.realty[L.key] ? "YOUR PROPERTY" : "FOR SALE"; }
  else { label = ""; }
  var front = box(w - 2, 5, .6, col, 0, .25, f * (d / 2), g);
  if (label) {
    var bg = L.shop ? "#1d1410" : L.landmark ? "#13233f" : L.kind === "empty" ? "#ffffff" : "#222";
    var fg = L.shop ? "#ffb83d" : L.landmark ? "#ffffff" : L.kind === "empty" ? "#c0392b" : "#ffffff";
    var sm = new T.MeshBasicMaterial({ map: signTex(label, bg, fg) });
    var sign = new T.Mesh(GEO.plane, sm); sign.scale.set(w - 4, (w - 4) / 4, 1); sign.position.set(0, 6.6, f * (d / 2 + .35)); if (f < 0) sign.rotation.y = Math.PI; g.add(sign);
    L.sign = sign;
  }
  // door + windows
  box(3, 3.6, .3, 0x2a3442, 0, .25, f * (d / 2 + .35), g);
  box(7, 2.6, .25, 0x8fd3ff, -7, 1.5, f * (d / 2 + .35), g).material = glassMat();
  box(7, 2.6, .25, 0x8fd3ff, 7, 1.5, f * (d / 2 + .35), g).material = glassMat();
  // awning for shops
  if (L.shop || L.rival) { var aw = box(w - 3, .25, 3, L.shop ? CC.IND[L.shop.ind].acc : 0xdddddd, 0, 5.4, f * (d / 2 + 1.6), g); aw.rotation.x = f * .25; }
  if (L.shop) { // your flag
    var pole = box(.2, 6, .2, 0xdddddd, w / 2 - 1, h + .25, f * (d / 2 - 1), g);
    var fl = box(.05, 1.4, 2.2, 0xffb83d, w / 2 - 1, h + 4.6, f * (d / 2 - 1) - 1.1, g);
  }
  if (L.landmark === "cityhall") { for (var i = -2; i <= 2; i++) box(1.2, 9, 1.2, 0xf5efe0, i * 4.5, .25, f * (d / 2 + 2), g); box(w, 1.2, 5, 0xf5efe0, 0, 9.2, f * (d / 2 + 1.4), g); }
  L.h = h;
}
var GLASS = null;
function glassMat() { return GLASS || (GLASS = new T.MeshLambertMaterial({ color: 0x9fd8ff, emissive: 0x335577, emissiveIntensity: .25, transparent: true, opacity: .85 })); }
W.rebuildLot = function (L) { if (L.group) { W.scene.remove(L.group); } buildLot(W.scene, L); };
// the superstore: one big building over a full block with a parking garage beside it
W.buildSuper = function () {
  var S = CC.get(); if (W.supGroup) { W.scene.remove(W.supGroup); W.supGroup = null; }
  var blk = W.blocks.filter(function (b) { return b.bx + "," + b.by === W.supBlock; })[0]; if (!blk) return;
  var g = new T.Group(); g.position.set(blk.x, 0, blk.z); W.scene.add(g); W.supGroup = g;
  if (!S.sup || S.sup.city !== W.ci) {
    box(BLOCK - 4, .3, BLOCK - 4, 0x8a8f99, 0, .25, 0, g);
    var sg = new T.Mesh(GEO.plane, new T.MeshBasicMaterial({ map: signTex("SUPERSTORE SITE · ZONING REQUIRED", "#ffffff", "#c0392b") })); sg.scale.set(30, 7.5, 1); sg.position.set(0, 4, BLOCK / 2 - 3); g.add(sg);
    box(.4, 4, .4, 0x777777, -12, .25, BLOCK / 2 - 3, g); box(.4, 4, .4, 0x777777, 12, .25, BLOCK / 2 - 3, g);
    return;
  }
  var floors = Math.max(1, CC.supStats().floors), h = 12 + floors * 6;
  var body = new T.Mesh(GEO.box, buildingMat("mall", 44, h)); body.scale.set(44, h, 40); body.position.set(-8, h / 2 + .25, -4); g.add(body);
  box(46, 1, 42, 0x3a3f4b, -8, h + .25, -4, g);
  box(30, 6, .8, 0xffb83d, -8, .25, 16.3, g);
  var sm = new T.Mesh(GEO.plane, new T.MeshBasicMaterial({ map: signTex("CREMA SUPERSTORE", "#1d1410", "#ffb83d") })); sm.scale.set(34, 8.5, 1); sm.position.set(-8, h - 3, 16.5); g.add(sm);
  box(10, 4.5, .4, 0x9fd8ff, -8, .25, 16.8, g).material = glassMat();
  // garage
  var lv = S.sup.garage || 0;
  if (lv) { for (var i = 0; i < lv; i++) { box(14, .6, 40, 0x9aa0aa, 22, i * 3.4, -4, g); for (var c = -1; c <= 1; c += 2) for (var z = -1; z <= 1; z++) box(.6, 3, .6, 0x9aa0aa, 22 + c * 6.5, i * 3.4, -4 + z * 18, g); }
    var gs = new T.Mesh(GEO.plane, new T.MeshBasicMaterial({ map: signTex("P  " + (80 + S.sup.garage * CC.GARAGE.perLevel) + " SPACES", "#2f8fd0", "#fff") })); gs.scale.set(12, 3, 1); gs.position.set(22, lv * 3.4 + 2.5, 16.2); g.add(gs);
  } else { box(14, .2, 40, 0x555a63, 22, .25, -4, g); }
};

/* ---------------- dressing: trees, lamps, benches ---------------- */
function dressing(scene, blocks, rand) {
  var trunk = mat(0x6b4a2b), leaf = mat(0x3f8f4a), lampM = mat(0x2a2e38), bulb = new T.MeshBasicMaterial({ color: 0xfff1c0 });
  W.bulbs = [];
  blocks.forEach(function (b) {
    for (var k = 0; k < 8; k++) {
      var side = k % 4, t = (k >> 2) ? .3 : -.3;
      var x = b.x + (side === 0 ? -BLOCK / 2 + 1.5 : side === 1 ? BLOCK / 2 - 1.5 : t * BLOCK), z = b.z + (side === 2 ? -BLOCK / 2 + 1.5 : side === 3 ? BLOCK / 2 - 1.5 : t * BLOCK);
      if (k % 2) {
        var tr = new T.Mesh(GEO.cyl, trunk); tr.scale.set(.4, 2.4, .4); tr.position.set(x, 1.45, z); scene.add(tr);
        var lf = new T.Mesh(GEO.sph, leaf); lf.scale.set(2.6, 2.6, 2.6); lf.position.set(x, 3.6, z); scene.add(lf);
      } else {
        var lp = new T.Mesh(GEO.cyl, lampM); lp.scale.set(.18, 5, .18); lp.position.set(x, 2.75, z); scene.add(lp);
        var bl = new T.Mesh(GEO.sph, bulb); bl.scale.set(.6, .6, .6); bl.position.set(x, 5.3, z); scene.add(bl); W.bulbs.push(bl);
      }
    }
  });
}

/* ---------------- traffic ---------------- */
function makeTraffic(scene, N, half, rand) {
  var cars = [], n = 10 + N * 2;
  for (var i = 0; i < n; i++) {
    var c = W.car(); scene.add(c);
    var horiz = rand() < .5, line = Math.floor(rand() * (N + 1)), dir = rand() < .5 ? 1 : -1;
    var lane = -half + line * PITCH + (horiz ? dir * 3.5 : -dir * 3.5);
    var car = { m: c, horiz: horiz, lane: lane, dir: dir, p: -half + rand() * N * PITCH, v: 9 + rand() * 6 };
    cars.push(car);
  }
  return cars;
}
W.updateTraffic = function (dt, player) {
  var lim = W.half + 20;
  (W.traffic || []).forEach(function (c) {
    var v = c.v;
    // brake for the player standing in the lane
    if (player) { var px = c.horiz ? player.x : player.z, pl = c.horiz ? player.z : player.x; if (Math.abs(pl - c.lane) < 2.4 && (px - c.p) * c.dir > 0 && (px - c.p) * c.dir < 9) v = 0; }
    c.p += c.dir * v * dt; if (c.p > lim) c.p = -lim; if (c.p < -lim) c.p = lim;
    if (c.horiz) { c.m.position.set(c.p, 0, c.lane); c.m.rotation.y = c.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
    else { c.m.position.set(c.lane, 0, c.p); c.m.rotation.y = c.dir > 0 ? 0 : Math.PI; }
  });
};

/* ---------------- pedestrians (crowds follow the time of day) ---------------- */
function makePeds(scene, blocks, rand) {
  var peds = [], n = 70;
  for (var i = 0; i < n; i++) {
    var b = blocks[Math.floor(rand() * blocks.length)], p = W.person(); scene.add(p);
    var ped = { m: p, b: b, t: rand() * 4, s: 1.4 + rand() * .9, dir: rand() < .5 ? 1 : -1 };
    peds.push(ped);
  }
  return peds;
}
function perim(b, t) { // walk around the block's sidewalk edge, t in [0,4)
  var e = BLOCK / 2 - 1.2, s = t % 4, f = s - Math.floor(s), side = Math.floor(s);
  if (side === 0) return [b.x - e + f * 2 * e, b.z - e]; if (side === 1) return [b.x + e, b.z - e + f * 2 * e];
  if (side === 2) return [b.x + e - f * 2 * e, b.z + e]; return [b.x - e, b.z + e - f * 2 * e];
}
W.updatePeds = function (dt) {
  var h = CC.hour();
  (W.peds || []).forEach(function (p, i) {
    var D = CC.distById(p.b.dist) || CC.DIST[0], dens = CC.curve(D, h) / 1.6;
    var vis = (i / W.peds.length) < Math.min(1, .15 + dens);
    p.m.visible = vis; if (!vis) return;
    p.t = (p.t + p.dir * dt * p.s / (BLOCK * 2) * 4 + 4) % 4;
    var a = perim(p.b, p.t), b2 = perim(p.b, p.t + p.dir * .01);
    p.m.position.set(a[0], .25, a[1]); p.m.rotation.y = Math.atan2(b2[0] - a[0], b2[1] - a[1]);
    W.animPerson(p.m, dt, true);
  });
};
// crowd density at a world point right now (for food trucks): pedestrians nearby + district curve
W.crowdAt = function (x, z) {
  var best = null, bd = 1e9;
  (W.blocks || []).forEach(function (b) { var d = Math.hypot(b.x - x, b.z - z); if (d < bd) { bd = d; best = b; } });
  if (!best) return 0;
  var D = CC.distById(best.dist) || CC.DIST[0];
  var onCurb = bd < BLOCK * .9 ? 1 : .4;
  return CC.curve(D) * (D.demand || 1) * onCurb;
};

/* ---------------- day / night ---------------- */
W.setTime = function (h) {
  var day = CC.clamp(Math.sin((h - 6) / 12 * Math.PI) * 1.3, 0, 1);
  var dusk = Math.max(0, 1 - Math.abs(h - 19) / 1.5) + Math.max(0, 1 - Math.abs(h - 6.5) / 1.2);
  var sky = new T.Color(0x0d1730).lerp(new T.Color(0x8fc6ef), day);
  if (dusk > 0) sky.lerp(new T.Color(0xf09060), Math.min(.45, dusk * .45));
  if (W.scene) { W.scene.background = sky; if (W.scene.fog) W.scene.fog.color.copy(sky); }
  if (W.hemi) W.hemi.intensity = .25 + .55 * day;
  if (W.sun) { W.sun.intensity = .1 + .85 * day; var a = (h - 6) / 12 * Math.PI; W.sun.position.set(Math.cos(a) * 150, 30 + Math.sin(a) * 140, 60); }
  var night = 1 - day;
  W.nightMats.forEach(function (m) { m.emissiveIntensity = night * .9; });
  (W.bulbs || []).forEach(function (b) { b.visible = night > .3; });
  W.night = night;
};

/* ---------------- interiors ---------------- */
// Builds a room scene. kind: shop | rival | sup | cityhall | bank | realty | dealer | supplier | airport
W.interior = function (kind, data) {
  var sc = new T.Scene(); sc.background = new T.Color(0x2a2420);
  sc.add(new T.HemisphereLight(0xfff4e6, 0x554433, .9));
  var dl = new T.DirectionalLight(0xffffff, .5); dl.position.set(10, 20, 15); sc.add(dl);
  var cfg = { shop: [18, 14], rival: [16, 12], sup: [48, 36], cityhall: [26, 20], bank: [20, 16], realty: [18, 14], dealer: [26, 20], supplier: [20, 16], airport: [24, 18] }[kind] || [18, 14];
  var w = cfg[0], d = cfg[1];
  var themeCol = kind === "shop" ? CC.IND[data.ind].col : kind === "rival" ? CC.IND[data.ind].col : kind === "sup" ? 0x3a3f4b : 0x6a7590;
  var floorTex = canvasTex(64, 64, function (g) { g.fillStyle = "#e8dcc4"; g.fillRect(0, 0, 64, 64); g.fillStyle = "#d4c4a4"; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); });
  floorTex.wrapS = floorTex.wrapT = T.RepeatWrapping; floorTex.repeat.set(w / 2, d / 2);
  var fl = new T.Mesh(GEO.plane, new T.MeshLambertMaterial({ map: floorTex })); fl.rotation.x = -Math.PI / 2; fl.scale.set(w, d, 1); sc.add(fl);
  box(w, 7, .4, themeCol, 0, 0, -d / 2, sc); box(.4, 7, d, themeCol, -w / 2, 0, 0, sc); box(.4, 7, d, themeCol, w / 2, 0, 0, sc);
  box(w, 1.1, .4, 0x2a3442, 0, 0, d / 2, sc).material = glassMat();
  var out = new T.Mesh(GEO.plane, mat(0x6f7480)); out.rotation.x = -Math.PI / 2; out.scale.set(w + 40, 30, 1); out.position.set(0, -.01, d / 2 + 15); sc.add(out);
  return { scene: sc, w: w, d: d, door: { x: 0, z: d / 2 - 1.2 } };
};

/* ---------------- minimap ---------------- */
W.drawMinimap = function (cv, player, marks, target) {
  var g = cv.getContext("2d"), s = cv.width, half = W.half || 200, k = s / (half * 2 + 30);
  g.fillStyle = "#26302a"; g.fillRect(0, 0, s, s);
  g.save(); g.translate(s / 2, s / 2);
  g.fillStyle = "#4a4e57"; g.fillRect(-(half + ROAD / 2) * k, -(half + ROAD / 2) * k, (half * 2 + ROAD) * k, (half * 2 + ROAD) * k);
  (W.blocks || []).forEach(function (b) { var D = CC.distById(b.dist) || CC.DIST[0]; g.fillStyle = { ocean: "#cdbb8c", towers: "#8794a8", campus: "#9a7a6a", old: "#a08070", mall: "#b0b0c0", gen: "#90a080" }[D.style] || "#a9a294"; g.fillRect((b.x - BLOCK / 2) * k, (b.z - BLOCK / 2) * k, BLOCK * k, BLOCK * k); });
  (marks || []).forEach(function (m) { g.fillStyle = m.c; g.beginPath(); g.arc(m.x * k, m.z * k, m.r || 3, 0, 7); g.fill(); });
  if (target) { g.strokeStyle = "#ffb83d"; g.lineWidth = 2; g.beginPath(); g.arc(target.x * k, target.z * k, 6, 0, 7); g.stroke(); }
  if (player) { g.save(); g.translate(player.x * k, player.z * k); g.rotate(-player.ry + Math.PI); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(0, -6); g.lineTo(4, 4); g.lineTo(-4, 4); g.closePath(); g.fill(); g.restore(); }
  g.restore();
};
})(window.CC);
