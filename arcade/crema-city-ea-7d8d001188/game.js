/* Crema City — game loop, player, interactions, gameplay, UI. */
"use strict";
(function (CC) {
var T = THREE, W = CC.W, S = null;
var $ = function (s) { return document.querySelector(s); };
var fmt = CC.fmt, clamp = CC.clamp;
var SAVEKEY = CC.SAVEKEY, V3KEY = "crema-tycoon-v3";

/* ================= state ================= */
var mode = "boot";            // city | drive | inside | build
var P = { x: 0, z: 0, ry: 0, mesh: null, hold: null };
var cam = { yaw: Math.PI, pitch: .58, dist: 19 };
var veh = null;               // { kind:'car'|'truck', ref, m, v, steer }
var here = null;              // interior context
var city = null;              // built city data
var acts = [];                // current interactables
var target = null;            // GPS target {x,z,label}
var trucks = [];              // truck runtime meshes
var rivalTrucks = [];
var lastSave = 0, clockAcc = 0, toastT = 0;
var keys = {}, joy = { x: 0, y: 0, on: false }, run = false;

/* ================= boot / saves ================= */
function load() { try { var s = JSON.parse(localStorage.getItem(SAVEKEY) || "null"); if (s && s.v === 4 && s.shops) return s; } catch (e) {} return null; }
function save() { if (!S) return; S.ts = Date.now(); if (P.mesh) { S.pos = { x: P.x, z: P.z, ry: P.ry, ci: S.city }; } try { localStorage.setItem(SAVEKEY, JSON.stringify(S)); } catch (e) {} if (window.LZ && window.LZ_GAME) try { LZ.save(LZ_GAME); } catch (e) {} }
CC.save = save;
function progressOf(d) { try { var g = JSON.parse(d); return Math.round((g.stats && g.stats.earned || 0) + (g.lvl || 0) * 1000); } catch (e) { return 0; } }
function lzBoot() {
  return new Promise(function (res) {
    if (!window.LZ_GAME) return res(); var done = false, fin = function () { if (!done) { done = true; res(); } };
    var go = function () { LZ.boot(LZ_GAME, { localKey: SAVEKEY, saveId: "crema4", major: 4, minor: 0, progressOf: progressOf }).then(fin, fin); };
    if (window.LZ) go(); else window.addEventListener("lz-ready", go, { once: true }); setTimeout(fin, 6000);
  });
}
// first launch: bring the whole v3 empire over (cloud save for your account, else this browser's)
async function importV3() {
  var src = null, from = "";
  try { if (window.LZ && LZ.signedIn()) { var c = await LZ.peekSave("crema"); if (c && c.major === 3 && c.data) { src = JSON.parse(c.data); from = "your account"; } } } catch (e) {}
  if (!src) { try { var owner = localStorage.getItem("lz.owner.crema"), me = window.LZ && LZ.user ? LZ.user.uid : "guest"; var l = JSON.parse(localStorage.getItem(V3KEY) || "null"); if (l && l.v === 3 && (!owner || owner === me || owner === "guest")) { src = l; from = "this browser"; } } catch (e) {} }
  if (src && src.locs && src.locs.length) { var s = CC.fromV3(src); s.importFrom = from; return s; }
  return null;
}

/* ================= helpers ================= */
function toast(t, kind) {
  var el = document.createElement("div"); el.className = "toast " + (kind || ""); el.textContent = t;
  $("#toasts").appendChild(el); setTimeout(function () { el.classList.add("out"); }, 3200); setTimeout(function () { el.remove(); }, 3700);
}
CC.toast = toast;
function news(t, kind) { S.news.unshift({ t: Date.now(), d: S.day, text: t, kind: kind || "" }); if (S.news.length > 60) S.news.length = 60; toast(t, kind); }
function spend(c) { if (S.cash < c) { toast("Not enough cash. You need " + fmt(c) + ".", "bad"); sfx("bad"); return false; } S.cash -= c; sfx("buy"); return true; }
function lvlUp(l) { news("Level " + l + "! New things to unlock around the city.", "good"); sfx("level"); }
function addXP(x) { CC.addXP(x, lvlUp); }
function shopById(id) { for (var i = 0; i < S.shops.length; i++) if (S.shops[i].id === id) return S.shops[i]; return null; }
function lotByKey(k) { if (!city) return null; for (var i = 0; i < W.lots.length; i++) if (W.lots[i].key === k) return W.lots[i]; return null; }
function D(id) { return CC.distById(id) || CC.DIST[0]; }

/* ================= audio ================= */
var AC = null;
function sfx(k) {
  if (S && S.mute) return; try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) { return; }
  var P2 = { cash: [[880, .07], [1320, .1]], buy: [[520, .08], [780, .12]], bad: [[220, .15]], level: [[523, .1], [659, .1], [784, .1], [1046, .2]], click: [[660, .04]], brew: [[400, .1]], ready: [[990, .08], [1320, .08]], door: [[300, .12]], horn: [[330, .25]], win: [[523, .12], [784, .12], [1046, .3]] }[k] || [[600, .05]];
  var t = AC.currentTime; P2.forEach(function (n, i) { var o = AC.createOscillator(), g = AC.createGain(); o.type = "triangle"; o.frequency.value = n[0]; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.08, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + n[1]); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + n[1] + .02); t += n[1] * .8; });
}

/* ================= city ================= */
function enterCity(ci, spawn) {
  S.city = ci; here = null; mode = "city";
  city = W.buildCity(ci); W.buildSuper();
  P.mesh = W.person({ shirt: 0x1d1410, apron: 0xffb83d, hat: 0x2a1a12 }); W.scene.add(P.mesh);
  // spawn: saved spot, else in front of your first shop in this city
  var mine = S.shops.filter(function (s) { return s.city === ci; })[0], L = mine && lotByKey(mine.lot);
  if (spawn) { P.x = spawn.x; P.z = spawn.z; P.ry = spawn.ry || 0; }
  else if (S.pos && S.pos.ci === ci && !inBuilding(S.pos.x, S.pos.z)) { P.x = S.pos.x; P.z = S.pos.z; P.ry = S.pos.ry || 0; }
  else if (L) { P.x = L.door.x; P.z = L.door.z + L.face * 2.5; P.ry = L.face > 0 ? Math.PI : 0; }
  else { P.x = 0; P.z = W.PITCH / 2; }
  cam.yaw = P.ry + Math.PI;
  // your car parks near you
  if (!S.car) S.car = { x: P.x + 5, z: P.z + (L ? L.face * 3 : 3), ry: 0, speed: 1 };
  spawnVehicles();
  W.setTime(CC.hour());
}
function spawnVehicles() {
  trucks.forEach(function (t) { W.scene.remove(t.m); }); trucks = [];
  if (S.car && (S.car.ci == null || S.car.ci === S.city)) { var c = W.car(0xffb83d); c.position.set(S.car.x, 0, S.car.z); c.rotation.y = S.car.ry; W.scene.add(c); trucks.push({ kind: "car", ref: S.car, m: c }); }
  S.trucks.forEach(function (tr) { if ((tr.ci || 0) !== S.city) return; var m = W.car(0xffffff, true); m.position.set(tr.x, 0, tr.z); m.rotation.y = tr.ry; W.scene.add(m); trucks.push({ kind: "truck", ref: tr, m: m }); });
  rivalTrucks.forEach(function (r) { W.scene.remove(r.m); }); rivalTrucks = [];
  if (S.lvl >= CC.TRUCK.rivalLvl) {
    var hot = W.lots.filter(function (L) { return L.kind === "rival"; }).slice(0, 4 + Math.min(6, S.lvl >> 3));
    hot.forEach(function (L) { var m = W.car(0x7a5ad8, true); var x = L.door.x + 6, z = L.door.z + L.face * 5.5; m.position.set(x, 0, z); m.rotation.y = Math.PI / 2; W.scene.add(m); rivalTrucks.push({ m: m, x: x, z: z, name: CC.pick(["Taco Tyrant", "Wok n Roll", "Brew Crew Truck", "Big Cheese"]) }); });
  }
}
// collision: building footprints (lots + superstore + landmarks)
function inBuilding(x, z) {
  if (!W.lots) return false;
  for (var i = 0; i < W.lots.length; i++) { var L = W.lots[i]; if (L.supBlock) continue; if (Math.abs(x - L.x) < 13.4 && Math.abs(z - L.z) < 13.4) return true; }
  var sb = W.blocks.filter(function (b) { return b.bx + "," + b.by === W.supBlock; })[0];
  if (sb && S.sup && S.sup.city === S.city && Math.abs(x - sb.x) < 31 && Math.abs(z - sb.z) < 30) return true;
  var lim = W.half + 6; if (Math.abs(x) > lim || Math.abs(z) > lim) return true;
  return false;
}
function cityActs() {
  var a = [];
  W.lots.forEach(function (L) {
    if (L.supBlock) return;
    var lab, fn, key = L.key, sub = "";
    if (L.shop) { lab = "Enter your " + CC.IND[L.shop.ind].name.toLowerCase(); sub = L.shop.name; fn = function () { goInside("shop", { shop: L.shop, lot: L }); }; }
    else if (L.rival) { lab = "Enter " + L.rival.name; sub = "Rival · strength " + Math.round(L.rival.S); fn = function () { goInside("rival", { rival: L.rival, lot: L }); }; }
    else if (L.landmark) { lab = "Enter " + { cityhall: "City Hall", bank: "the bank", realty: "the realty office", dealer: "the dealership", supplier: "the supply depot", airport: "the airport" }[L.landmark]; fn = function () { goInside(L.landmark, { lot: L }); }; }
    else if (L.kind === "empty") { var own = S.realty[key]; lab = own ? "Your empty building" : "Building for sale · " + fmt(CC.lotPrice(L)); sub = D(L.dist).name; fn = function () { emptyPanel(L); }; }
    else { lab = "Office building"; sub = S.realty[key] ? "You own it · rent " + fmt(S.realty[key].rent) + "/min" : "Buy for " + fmt(CC.lotPrice(L) * 1.4) + " and collect rent"; fn = function () { officePanel(L); }; }
    a.push({ x: L.door.x, z: L.door.z, r: 4.6, label: lab, sub: sub, fn: fn });
  });
  var sb = W.blocks.filter(function (b) { return b.bx + "," + b.by === W.supBlock; })[0];
  if (sb) {
    var sx = sb.x - 8, sz = sb.z + 18;
    if (S.sup && S.sup.city === S.city) a.push({ x: sx, z: sz, r: 5, label: "Enter your superstore", fn: function () { goInside("sup", {}); } });
    else a.push({ x: sb.x, z: sb.z + W.BLOCK / 2 + 1, r: 6, label: "Superstore site", sub: S.permits.super ? "Build here for " + fmt(superCost()) : "Needs superstore zoning from City Hall", fn: superSitePanel });
  }
  trucks.forEach(function (t) {
    var tr = t.ref;
    a.push({ x: t.m.position.x, z: t.m.position.z, r: t.kind === "truck" ? 4.5 : 3.6, label: t.kind === "car" ? "Drive your car" : (tr.open ? "Close truck window" : "Drive food truck"), sub: t.kind === "truck" ? (tr.open ? "Selling · " + fmt(truckIncomeOf(t)) + "/min" : "Lv " + (tr.lvl + 1)) : "",
      fn: function () { if (t.kind === "truck" && tr.open) { tr.open = false; toast("Window closed."); return; } enterVehicle(t); },
      alt: t.kind === "truck" && !tr.open ? { label: "Open window & sell", fn: function () { openTruck(t); } } : null });
  });
  return a;
}

/* ================= vehicles ================= */
function enterVehicle(t) { veh = { t: t, v: 0 }; mode = "drive"; P.mesh.visible = false; cam.yaw = t.m.rotation.y + Math.PI; cam.pitch = Math.max(cam.pitch, .45); if (t.kind === "truck") t.ref.open = false; sfx("door"); }
function exitVehicle() {
  var t = veh.t, m = t.m, side = new T.Vector3(3.2, 0, 0).applyAxisAngle(new T.Vector3(0, 1, 0), m.rotation.y);
  var x = m.position.x + side.x, z = m.position.z + side.z;
  if (inBuilding(x, z)) { x = m.position.x - side.x; z = m.position.z - side.z; }
  P.x = x; P.z = z; P.ry = m.rotation.y; P.mesh.visible = true;
  t.ref.x = m.position.x; t.ref.z = m.position.z; t.ref.ry = m.rotation.y; t.ref.ci = S.city;
  veh = null; mode = "city"; sfx("door"); save();
}
function drive(dt) {
  var t = veh.t, m = t.m, fw = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0) + (-joy.y), st = (keys.a || keys.arrowleft ? 1 : 0) - (keys.d || keys.arrowright ? 1 : 0) + (-joy.x);
  fw = clamp(fw, -1, 1); st = clamp(st, -1, 1);
  var max = t.kind === "truck" ? 20 + 2 * (t.ref.lvl || 0) : 26 + 8 * ((S.car && S.car.speed) || 1);
  veh.v += fw * dt * (fw * veh.v < 0 ? 40 : 18); veh.v *= Math.pow(fw ? .995 : .2, dt); veh.v = clamp(veh.v, -max * .4, max);
  m.rotation.y += st * dt * 1.9 * clamp(veh.v / 10, -1, 1);
  var nx = m.position.x + Math.sin(m.rotation.y) * veh.v * dt, nz = m.position.z + Math.cos(m.rotation.y) * veh.v * dt;
  if (!inBuilding(nx, nz)) { m.position.x = nx; m.position.z = nz; } else { if (Math.abs(veh.v) > 12) sfx("bad"); veh.v *= -.3; }
  P.x = m.position.x; P.z = m.position.z; P.ry = m.rotation.y;
}
function truckIncomeOf(t) {
  var crowd = W.crowdAt(t.m.position.x, t.m.position.z), near = 0;
  rivalTrucks.forEach(function (r) { if (Math.hypot(r.x - t.m.position.x, r.z - t.m.position.z) < 30) near++; });
  return CC.truckRate(t.ref, crowd, near);
}
function openTruck(t) {
  if (!S.permits.truck) { toast("You need a food truck license from City Hall first.", "bad"); target = landmark("cityhall"); return; }
  var onRoad = !inBuilding(t.m.position.x, t.m.position.z);
  t.ref.open = true; t.ref.sales = 0; sfx("cash");
  var near = rivalTrucks.filter(function (r) { return Math.hypot(r.x - t.m.position.x, r.z - t.m.position.z) < 30; });
  toast("Window open! Crowd here: " + crowdWord(W.crowdAt(t.m.position.x, t.m.position.z)) + (near.length ? " · " + near[0].name + " is competing nearby" : ""), near.length ? "bad" : "good");
}
function crowdWord(c) { return c > 1.3 ? "packed" : c > .9 ? "busy" : c > .55 ? "steady" : "quiet"; }

/* ================= interiors ================= */
var RUN = null; // shift runtime inside a shop / superstore
function goInside(kind, data) {
  sfx("door"); here = { kind: kind, data: data, cityPos: { x: P.x, z: P.z, ry: P.ry } };
  var room = W.interior(kind === "sup" ? "sup" : kind, kind === "shop" ? { ind: data.shop.ind } : kind === "rival" ? { ind: data.rival.ind } : {});
  here.room = room; here.scene = room.scene;
  P.mesh.parent && P.mesh.parent.remove(P.mesh); room.scene.add(P.mesh);
  P.x = 0; P.z = room.d / 2 - 2; P.ry = Math.PI; cam.yaw = 0; P.mesh.visible = true;
  here.obst = []; here.acts = [{ x: 0, z: room.d / 2 - .8, r: 2.2, label: "Leave", fn: leave }];
  mode = "inside";
  if (kind === "shop") buildShop(room, data.shop);
  else if (kind === "rival") buildRival(room, data);
  else if (kind === "sup") buildSup(room);
  else buildCivic(room, kind);
}
function leave() {
  var cp = here.cityPos; here.scene.remove(P.mesh); W.scene.add(P.mesh);
  if (RUN) endShift(); RUN = null;
  here = null; mode = "city"; P.x = cp.x; P.z = cp.z; P.ry = cp.ry + Math.PI; cam.yaw = P.ry + Math.PI; sfx("door"); save();
}
function obst(x, z, w, d) { here.obst.push({ x: x, z: z, w: w / 2 + .45, d: d / 2 + .45 }); }
function blockedInside(x, z) {
  var r = here.room; if (Math.abs(x) > r.w / 2 - .8 || z < -r.d / 2 + .8 || z > r.d / 2 - .6) return true;
  for (var i = 0; i < here.obst.length; i++) { var o = here.obst[i]; if (Math.abs(x - o.x) < o.w && Math.abs(z - o.z) < o.d) return true; }
  return false;
}
function label3d(sc, text, x, y, z, w, bg, fg) { var m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: W.signTex(text, bg || "#1d1410", fg || "#ffb83d"), transparent: true })); m.scale.set(w || 4, (w || 4) / 4, 1); m.position.set(x, y, z); sc.add(m); return m; }
function npc(sc, x, z, ry, o) { var p = W.person(o); p.position.set(x, 0, z); p.rotation.y = ry || 0; sc.add(p); return p; }

/* ---------- your shop: serve customers yourself ---------- */
function buildShop(room, sh) {
  var sc = room.scene, I = CC.IND[sh.ind], d = room.d, w = room.w;
  var cz = -d / 2 + 5;
  W.box(w - 4, 1.1, 1.2, I.acc === 0xfff1d6 ? 0x8a5a3a : 0xa0663f, 0, 0, cz, sc); obst(0, cz, w - 4, 1.2);
  W.box(w - 4, .12, 1.4, 0xf4e8d6, 0, 1.1, cz, sc);
  label3d(sc, "CREMA " + I.name.toUpperCase(), 0, 5.4, -d / 2 + .25, 9);
  // stations along the back wall: one per menu item (more with bigger shops)
  var n = Math.min(I.items.length, 2 + sh.size), sw = (w - 4) / n;
  RUN = { sh: sh, stations: [], cust: [], staffT: 0, spawnT: 1.5, served: 0, missed: 0, cash: 0, pts: 0, t0: Date.now(), staff: [] };
  for (var i = 0; i < n; i++) {
    var x = -w / 2 + 2 + sw * (i + .5), z = -d / 2 + 1.6, item = I.items[i];
    var body = W.box(Math.min(2.4, sw - .4), 1.6, 1.4, 0x40464f, x, 0, z, sc); obst(x, z, 2.4, 1.4);
    var lamp = W.box(.5, .2, .5, 0x333333, x, 1.6, z, sc);
    label3d(sc, item[0], x, 2.6, z + .3, Math.min(2.6, sw - .2), "#ffffff", "#1d1410");
    var st = { x: x, z: z, item: item, t: 0, ready: false, lamp: lamp };
    RUN.stations.push(st);
    (function (st) { here.acts.push({ x: st.x, z: st.z + 1.6, r: 1.7, label: function () { return st.ready ? "Pick up " + st.item[0] : st.t > 0 ? "Brewing " + st.item[0] + "…" : "Make " + st.item[0]; }, fn: function () { useStation(st); } }); })(st);
  }
  // serving spot on the counter
  here.acts.push({ x: 0, z: cz - 1.4, r: 3.2, label: function () { var c = RUN.cust[0]; return P.hold ? (c && c.at ? "Serve " + P.hold[0] : "Nobody waiting yet") : (c && c.at ? c.want[0] + " for the next customer" : "Counter"); }, fn: serve });
  // manager office (back corner)
  W.box(2, 1, 1, 0x6b4a2b, w / 2 - 2.2, 0, d / 2 - 4, sc); obst(w / 2 - 2.2, d / 2 - 4, 2, 1);
  label3d(sc, "OFFICE", w / 2 - 2.2, 2.4, d / 2 - 4, 2.4, "#ffffff", "#1d1410");
  here.acts.push({ x: w / 2 - 2.2, z: d / 2 - 5.4, r: 1.8, label: "Run the shop (staff, prices, upgrades)", fn: function () { shopPanel(sh); } });
  // decor crate: place furniture physically
  W.box(1.2, 1, 1.2, 0xc7914e, -w / 2 + 1.8, 0, d / 2 - 4, sc); obst(-w / 2 + 1.8, d / 2 - 4, 1.2, 1.2);
  here.acts.push({ x: -w / 2 + 1.8, z: d / 2 - 5.4, r: 1.8, label: "Place furniture", sub: "Tables and plants raise decor", fn: function () { startPlace("shop"); } });
  // tables already bought
  (sh.furn || []).forEach(function (f) { placeFurnMesh(sc, f); });
  // staff behind the counter
  for (var k = 0; k < sh.staff; k++) { var p = npc(sc, -w / 2 + 3 + k * 2.2, cz - 2.2, Math.PI, { shirt: I.col, apron: 0xffffff }); RUN.staff.push(p); }
}
function placeFurnMesh(sc, f) {
  if (f.k === "table") { W.box(1.6, .9, 1.6, 0x8a5a3a, f.x, 0, f.z, sc); W.box(.6, .55, .6, 0x2a2e38, f.x + 1.2, 0, f.z, sc); W.box(.6, .55, .6, 0x2a2e38, f.x - 1.2, 0, f.z, sc); }
  else { var pot = W.box(.8, .7, .8, 0xc7914e, f.x, 0, f.z, sc); var lf = new T.Mesh(new T.SphereGeometry(.7, 8, 6), W.mat(0x3fa65a)); lf.position.set(f.x, 1.4, f.z); sc.add(lf); }
  if (here) obst(f.x, f.z, 1.8, 1.8);
}
function useStation(st) {
  if (st.ready) { if (P.hold) { toast("Your hands are full. Serve the " + P.hold[0] + " first."); return; } P.hold = st.item; st.ready = false; st.t = 0; sfx("click"); showHold(); return; }
  if (st.t > 0) return;
  st.t = 2.4 / (1 + .06 * CC.U("training")); sfx("brew");
}
function serve() {
  var c = RUN.cust[0];
  if (!P.hold) { if (c && c.at) toast("They want a " + c.want[0] + ". Make it at its station."); return; }
  if (!c || !c.at) { toast("Nobody is at the counter yet."); return; }
  if (c.want[0] !== P.hold[0]) {
    // anyone else in line want this?
    var j = RUN.cust.findIndex(function (q) { return q.at && q.want[0] === P.hold[0]; });
    if (j < 0) { toast("Wrong order: they want a " + c.want[0] + ".", "bad"); sfx("bad"); return; }
    c = RUN.cust[j];
  }
  var e = CC.shopEcon(RUN.sh, true), price = P.hold[1] * e.avg / avgItem(RUN.sh) * (1 + .08 * RUN.sh.lvl);
  var tip = price * (.05 + .25 * (c.pat / c.max));
  S.cash += price + tip; S.stats.earned += price + tip; S.stats.served++; RUN.served++; RUN.cash += price + tip;
  var pts = Math.round(60 + 90 * (c.pat / c.max)); CC.addPts(pts); RUN.pts += pts;
  addXP(1 + price * .05); CC.addFame(.15); RUN.sh.rep = clamp(RUN.sh.rep + .01, .5, 5); RUN.sh.earned += price + tip;
  floatText("+" + fmt(price + tip), c.m.position);
  c.leave = true; c.happy = true; P.hold = null; showHold(); sfx("cash");
  goalHit("serve");
}
function avgItem(sh) { var a = 0; CC.IND[sh.ind].items.forEach(function (it) { a += it[1]; }); return a / CC.IND[sh.ind].items.length; }
function shiftTick(dt) {
  var sh = RUN.sh, room = here.room, I = CC.IND[sh.ind], e = CC.shopEcon(sh, true), cz = -room.d / 2 + 5;
  RUN.stations.forEach(function (st) { if (st.t > 0) { st.t -= dt; if (st.t <= 0) { st.t = 0; st.ready = true; sfx("ready"); } } st.lamp.material = W.mat(st.ready ? 0x3fe39a : st.t > 0 ? 0xffb83d : 0x333333); });
  // customers arrive with the shop's real demand (sped up a bit while you're working)
  RUN.spawnT -= dt;
  if (RUN.spawnT <= 0 && e.open && RUN.cust.length < 6) {
    RUN.spawnT = clamp(60 / Math.max(4, e.demand) * 1.6, 1.6, 9) * CC.rnd(.7, 1.3);
    var m = npc(here.scene, CC.rnd(-2, 2), room.d / 2 - 1, Math.PI); var want = CC.pick(I.items.slice(0, RUN.stations.length));
    var max = 28 * (sh.staff > 3 ? 1.15 : 1);
    var bub = label3d(here.scene, want[0], 0, 2.9, 0, 2.4, "#ffffff", "#1d1410"); m.add(bub); bub.position.set(0, 2.9, 0);
    RUN.cust.push({ m: m, want: want, pat: max, max: max, at: false, bub: bub });
  }
  // staff serve on their own (no points; points are for your own work)
  RUN.staffT -= dt;
  if (sh.staff > 0 && RUN.staffT <= 0) {
    RUN.staffT = 7 / sh.staff / (1 + .06 * CC.U("training"));
    var c = RUN.cust.filter(function (q) { return q.at && !q.leave; }).slice(-1)[0];
    if (c) { var price = c.want[1] * e.avg / avgItem(sh) * (1 + .08 * sh.lvl); S.cash += price; S.stats.earned += price; RUN.cash += price; c.leave = true; c.happy = true; floatText("+" + fmt(price), c.m.position, "#9fe9ff"); }
  }
  // queue movement
  var slot = 0;
  RUN.cust.forEach(function (c) {
    var tx, tz;
    if (c.leave) { tx = c.m.position.x > 0 ? 3 : -3; tz = room.d / 2 + 2; }
    else { tx = (slot % 3 - 1) * 2.4; tz = cz + 1.8 + Math.floor(slot / 3) * 1.8; slot++; }
    var dx = tx - c.m.position.x, dz = tz - c.m.position.z, dd = Math.hypot(dx, dz);
    if (dd > .1) { c.m.position.x += dx / dd * Math.min(dd, dt * 3.2); c.m.position.z += dz / dd * Math.min(dd, dt * 3.2); c.m.rotation.y = Math.atan2(dx, dz); W.animPerson(c.m, dt, true); }
    else { if (!c.leave) c.at = true; W.animPerson(c.m, dt, false); }
    if (c.at && !c.leave) { c.pat -= dt; c.bub.material.opacity = 1; if (c.pat <= 0) { c.leave = true; RUN.missed++; sh.rep = clamp(sh.rep - .04, .5, 5); floatText("Left!", c.m.position, "#ff6b6b"); } }
    if (c.leave) c.bub.visible = false;
  });
  RUN.cust = RUN.cust.filter(function (c) { if (c.leave && c.m.position.z > room.d / 2 + 1) { here.scene.remove(c.m); return false; } return true; });
  RUN.staff.forEach(function (p, i) { p.position.x = -room.w / 2 + 3 + i * 2.2 + Math.sin(Date.now() / 600 + i) * .6; W.animPerson(p, dt, true); });
}
function endShift() {
  if (!RUN || !RUN.served && !RUN.missed) return;
  news("Shift at " + RUN.sh.name + ": served " + RUN.served + (RUN.missed ? ", " + RUN.missed + " walked out" : "") + ". Took in " + fmt(RUN.cash) + ".", RUN.missed > RUN.served ? "bad" : "good");
}

/* ---------- rivals: buy them out, or play dirty ---------- */
function buildRival(room, data) {
  var sc = room.scene, r = data.rival, d = room.d;
  W.box(room.w - 4, 1.1, 1.2, 0x555a63, 0, 0, -d / 2 + 4, sc); obst(0, -d / 2 + 4, room.w - 4, 1.2);
  label3d(sc, r.name.toUpperCase(), 0, 5.2, -d / 2 + .25, 8, "#222", "#fff");
  var owner = npc(sc, 0, -d / 2 + 2.6, 0, { shirt: 0x2a2e38, hat: 0x111111 });
  for (var i = 0; i < Math.min(6, Math.round(r.S / 12)); i++) npc(sc, CC.rnd(-6, 6), CC.rnd(-1, 4), CC.rnd(0, 6));
  here.acts.push({ x: 0, z: -d / 2 + 5.6, r: 2.4, label: "Talk to the owner", sub: "Strength " + Math.round(r.S), fn: function () { rivalPanel(data); } });
}
function rivalPanel(data) {
  var r = data.rival, L = data.lot, price = CC.buyoutPrice(r, L.key);
  panel(r.name, "The owner sizes you up. " + (S.realty[L.key] ? "You're their landlord, so they're nervous." : "They're doing fine and they know it."), [
    { t: "Buy them out · " + fmt(price), sub: "Their shop becomes yours, staff and all.", fn: function () {
      if (!spend(price)) return;
      r.gone = true; var sh = CC.newShop(S.city, L.dist, r.ind); sh.size = 2; sh.staff = 1; sh.lot = L.key; sh.name = D(L.dist).name; sh.rep = 3.3; S.shops.push(sh);
      L.rival = null; L.shop = sh; L.kind = "shop"; W.rebuildLot(L); S.stats.deals++; CC.addPts(2500); addXP(price * .01); CC.addFame(20);
      news("You bought out " + r.name + "! It's now a Crema " + CC.IND[r.ind].name.toLowerCase() + ".", "good"); sfx("win"); goalHit("buyout"); closePanel(); leave();
    } },
    { t: "Spread rumors · " + fmt(250 + r.S * 8), sub: "Strength -15. 30% chance it backfires on your fame.", fn: function () {
      if (!spend(250 + r.S * 8)) return;
      if (Math.random() < Math.max(.08, .3 - .05 * CC.U("security"))) { CC.addFame(-60); news("The press caught you spreading rumors about " + r.name + ". Fame -60.", "bad"); }
      else { r.S = Math.max(5, r.S - 15); news(r.name + " is losing customers to the rumors. Their strength fell to " + Math.round(r.S) + ".", "good"); }
      closePanel(); } },
    { t: "Buy their building · " + fmt(CC.lotPrice(L)), sub: "Become their landlord: you collect rent, they weaken every day and buyouts get 40% cheaper.", hide: !!S.realty[L.key], fn: function () {
      if (!spend(CC.lotPrice(L))) return; S.realty[L.key] = { price: CC.lotPrice(L), rent: CC.lotRent(L) }; news("You now own the building " + r.name + " rents from you.", "good"); closePanel(); } }
  ]);
}

/* ---------- empty buildings & offices ---------- */
function emptyPanel(L) {
  var own = S.realty[L.key], price = CC.lotPrice(L), dd = D(L.dist);
  var opts = [];
  if (!own) opts.push({ t: "Buy this building · " + fmt(price), sub: dd.name + ". Then open a shop here or lease it out.", fn: function () { if (S.lvl < (dd.lvl || 1)) { toast(dd.name + " opens at level " + dd.lvl + ".", "bad"); return; } if (!spend(price)) return; S.realty[L.key] = { price: price, rent: 0, self: true }; W.rebuildLot(L); news("You bought a building in " + dd.name + ".", "good"); CC.addPts(600); goalHit("realty"); closePanel(); emptyPanel(L); } });
  else {
    CC.IND_ORDER.forEach(function (k) { var I = CC.IND[k]; if (S.lvl < I.lvl) return; var c = 1500 + I.lvl * 600; opts.push({ t: "Open a " + I.name.toLowerCase() + " here · " + fmt(c), sub: "A new Crema location in " + dd.name + ".", fn: function () {
      if (!spend(c)) return; var sh = CC.newShop(S.city, L.dist, k); sh.lot = L.key; S.shops.push(sh); S.realty[L.key].self = true; L.shop = sh; L.kind = "shop"; W.rebuildLot(L); CC.addPts(1500); addXP(c * .02); news("Grand opening: Crema " + I.name + " in " + dd.name + "!", "good"); sfx("win"); goalHit("open"); closePanel(); } }); });
    opts.push({ t: "Lease it to a tenant", sub: "Collect " + fmt(CC.lotRent(L)) + "/min in rent.", fn: function () { S.realty[L.key].self = false; S.realty[L.key].rent = CC.lotRent(L); L.kind = "office"; W.rebuildLot(L); news("New tenant moved in. Rent: " + fmt(CC.lotRent(L)) + "/min.", "good"); closePanel(); } });
  }
  panel(own ? "Your building" : "For sale", dd.name + (own ? "" : " · lot price grows as the city gets richer."), opts);
}
function officePanel(L) {
  var own = S.realty[L.key], p = Math.round(CC.lotPrice(L) * 1.4);
  if (own) { panel("Your office building", "Tenants pay you " + fmt(own.rent) + "/min.", [{ t: "Sell it · " + fmt(own.price * .9), fn: function () { S.cash += own.price * .9; delete S.realty[L.key]; closePanel(); toast("Sold."); } }]); return; }
  panel("Office building", D(L.dist).name, [{ t: "Buy it · " + fmt(p), sub: "Collect " + fmt(CC.lotRent(L) * 1.2) + "/min in rent forever.", fn: function () { if (!spend(p)) return; S.realty[L.key] = { price: p, rent: CC.lotRent(L) * 1.2 }; CC.addPts(800); goalHit("realty"); news("You're a landlord now.", "good"); closePanel(); } }]);
}

/* ---------- civic buildings ---------- */
function landmark(k) { var L = W.lots.filter(function (x) { return x.landmark === k; })[0]; return L ? { x: L.door.x, z: L.door.z, label: k } : null; }
function buildCivic(room, kind) {
  var sc = room.scene, d = room.d, w = room.w;
  var desks = {
    cityhall: [["Permits office", permitsPanel, 0x2f8fd0], ["Tax office", taxPanel, 0x21a98d], ["Elections", electionPanel, 0xc0392b], ["Mayor's office", mayorPanel, 0xd99a12]],
    bank: [["Loans", loanPanel, 0x2f3a56], ["Investments", investPanel, 0x21a98d]],
    realty: [["Listings", listingsPanel, 0x21a98d], ["Your properties", propsPanel, 0x2f8fd0]],
    dealer: [["Food trucks", truckPanel, 0xffb83d], ["Your car", carPanel, 0xe2553f]],
    supplier: [["Supply chain", holdPanel, 0x6b3a1f], ["Empire upgrades", upgPanel, 0x7a5ad8]],
    airport: [["Departures", airportPanel, 0x2f8fd0]]
  }[kind] || [];
  label3d(sc, { cityhall: "CITY HALL", bank: "FIRST CREMA BANK", realty: "REALTY & PROPERTIES", dealer: "TRUCKS & CARS", supplier: "SUPPLY DEPOT", airport: "REGIONAL AIRPORT" }[kind], 0, 5.6, -d / 2 + .25, 10, "#13233f", "#ffffff");
  desks.forEach(function (dk, i) {
    var x = -w / 2 + (w / (desks.length + 1)) * (i + 1), z = -d / 2 + 4;
    W.box(3.2, 1.1, 1.4, dk[2], x, 0, z, sc); obst(x, z, 3.2, 1.4);
    npc(sc, x, z - 1.6, 0, { shirt: dk[2], hat: kind === "cityhall" && i === 3 ? 0x111 : null });
    label3d(sc, dk[0], x, 3.4, z - .5, 3.6, "#ffffff", "#13233f");
    here.acts.push({ x: x, z: z + 1.8, r: 2, label: dk[0], fn: dk[1] });
  });
  if (kind === "dealer") { var t = W.car(0xffffff, true); t.position.set(-6, 0, 3); t.rotation.y = .6; sc.add(t); var c = W.car(0xe2553f); c.position.set(6, 0, 3); c.rotation.y = -.6; sc.add(c); obst(-6, 3, 6, 7); obst(6, 3, 5, 5); }
}
function permitsPanel() {
  panel("Permits office", "Licenses unlock whole new ways to grow. As mayor they cost half.", Object.keys(CC.PERMITS).map(function (k) { var p = CC.PERMITS[k], c = p.cost * (S.office === "mayor" ? .5 : 1);
    return { t: (S.permits[k] ? "✓ " : "") + p.name + (S.permits[k] ? "" : " · " + fmt(c)), sub: p.desc + (S.lvl < p.lvl ? " Unlocks at level " + p.lvl + "." : ""), dis: !!S.permits[k] || S.lvl < p.lvl,
      fn: function () { if (!spend(c)) return; S.permits[k] = 1; news("Permit granted: " + p.name + ".", "good"); CC.addPts(400); goalHit("permit:" + k); if (k === "super") W.buildSuper(); closePanel(); permitsPanel(); } }; }));
}
function taxPanel() {
  var r = CC.taxRate();
  panel("Tax office", "Your business tax rate is " + Math.round(r * 100) + "%. Taxes come out of each day's profit. Aggressive strategies raise the chance of an audit (now " + Math.round(CC.auditRisk() * 100) + "% a day).", Object.keys(CC.TAX.laws).map(function (k) { var L = CC.TAX.laws[k];
    return { t: (S.laws[k] ? "✓ " : "") + L.name + (S.laws[k] ? "" : " · " + fmt(L.cost)), sub: L.desc + (L.need && S.shops.length < L.need.shops ? " Needs " + L.need.shops + " shops." : "") + (S.lvl < L.lvl ? " Unlocks at level " + L.lvl + "." : ""),
      dis: S.lvl < L.lvl || (L.need && S.shops.length < L.need.shops), fn: function () { if (S.laws[k]) { delete S.laws[k]; toast("Strategy dropped."); closePanel(); taxPanel(); return; } if (!spend(L.cost)) return; S.laws[k] = 1; news("New tax strategy: " + L.name + ".", "good"); closePanel(); taxPanel(); } }; }));
}
function electionPanel() {
  var opts = [];
  ["council", "mayor"].forEach(function (k) { var o = CC.POLITICS[k], has = S.office === k || (k === "council" && S.office === "mayor");
    opts.push({ t: (has ? "✓ " : "") + "Run for " + o.name + (has ? "" : " · " + fmt(o.cost)), sub: "Needs " + o.fame.toLocaleString() + " fame (you have " + Math.round(S.fame).toLocaleString() + ") and " + o.influence + " influence (you have " + Math.round(S.influence) + "). Influence grows with fame and your lobbying team.", dis: has || S.fame < o.fame || S.influence < o.influence || (k === "mayor" && S.office !== "council"),
      fn: function () { if (!spend(o.cost)) return; S.influence -= o.influence * .5; S.office = k; CC.addPts(5000); CC.addFame(200); news("Election night: you won! You're on the " + o.name.toLowerCase() + " now.", "good"); sfx("win"); closePanel(); } }); });
  opts.push({ t: "Donate to campaigns · " + fmt(5000 + S.lvl * 500), sub: "+25 influence.", fn: function () { if (!spend(5000 + S.lvl * 500)) return; S.influence += 25; toast("+25 influence"); closePanel(); electionPanel(); } });
  panel("Elections", "Power in this city comes from fame and influence. Council members get cheaper permits; the mayor sets the tax rate and rezones districts.", opts);
}
function mayorPanel() {
  if (S.office !== "mayor") { panel("Mayor's office", "The mayor's chair is occupied. Win an election to sit here.", []); return; }
  var opts = [[.15, "Business-friendly (15%)"], [.2, "Low (20%)"], [.25, "Standard (25%)"], [.32, "High (32%) · +influence"]].map(function (o) { return { t: (S.mayorTax === o[0] ? "✓ " : "") + "Set city tax: " + o[1], fn: function () { S.mayorTax = o[0]; if (o[0] > .3) S.influence += 40; else CC.addFame(-20); closePanel(); mayorPanel(); } }; });
  CC.DIST.concat(Object.keys(S.genDist || {}).map(function (k) { return S.genDist[k]; })).slice(0, 10).forEach(function (dd) { if (S.rezoned[dd.id]) return; opts.push({ t: "Rezone " + dd.name + " for business · 60 influence", sub: "+20% customers there, forever.", dis: S.influence < 60, fn: function () { S.influence -= 60; S.rezoned[dd.id] = 1; news(dd.name + " was rezoned for business. Expect crowds.", "good"); closePanel(); mayorPanel(); } }); });
  panel("Mayor's office", "You run this city. Influence: " + Math.round(S.influence), opts);
}
function loanPanel() {
  var lim = CC.creditLimit();
  panel("Loans", "Net worth " + fmt(CC.netWorth()) + ". You owe " + fmt(S.loans) + " at 2% per day.", [
    { t: "Borrow " + fmt(Math.floor(lim / 2)), dis: lim < 1000, fn: function () { var a = Math.floor(lim / 2); S.loans += a; S.cash += a; toast("+" + fmt(a)); closePanel(); loanPanel(); } },
    { t: "Repay " + fmt(Math.min(S.loans, S.cash)), dis: S.loans <= 0, fn: function () { var a = Math.min(S.loans, S.cash); S.loans -= a; S.cash -= a; closePanel(); loanPanel(); } }]);
}
function investPanel() {
  panel("Investments", "Index fund: " + fmt(S.invest) + ". Grows about 0.1% per minute, even while you're away.", [
    { t: "Invest " + fmt(Math.floor(S.cash * .5)), dis: S.cash < 100, fn: function () { var a = Math.floor(S.cash * .5); S.cash -= a; S.invest += a; closePanel(); investPanel(); } },
    { t: "Withdraw everything", dis: S.invest < 1, fn: function () { S.cash += S.invest; S.invest = 0; closePanel(); investPanel(); } }]);
}
function listingsPanel() {
  var forSale = W.lots.filter(function (L) { return L.kind === "empty" && !S.realty[L.key]; }).slice(0, 12);
  panel("Listings", "Empty buildings for sale in " + S.cities[S.city].name + ". Tap one to set a route there.", forSale.map(function (L) { var dd = D(L.dist); return { t: dd.name + " · " + fmt(CC.lotPrice(L)), sub: S.lvl < (dd.lvl || 1) ? "Opens at level " + dd.lvl : "Tap for directions", fn: function () { target = { x: L.door.x, z: L.door.z, label: "Building for sale" }; closePanel(); toast("Route set. Follow the arrow."); } }; }));
}
function propsPanel() {
  var ks = Object.keys(S.realty);
  panel("Your properties", ks.length + " buildings · rent " + fmt(CC.rentIncome()) + "/min", ks.slice(0, 20).map(function (k) { var o = S.realty[k]; return { t: (o.self ? "Your shop's building" : "Leased") + " · worth " + fmt(o.price), sub: o.self ? "" : "Rent " + fmt(o.rent) + "/min" }; }));
}
function truckPanel() {
  var opts = [{ t: "Buy a food truck · " + fmt(CC.TRUCK.cost * Math.pow(1.6, S.trucks.length)), sub: "Drive it to crowds and open the window. Needs a license from City Hall.", dis: S.lvl < CC.TRUCK.lvl, fn: function () {
    if (!spend(CC.TRUCK.cost * Math.pow(1.6, S.trucks.length))) return; var L = here.data.lot; S.trucks.push({ id: S.nid++, x: L.door.x + 8, z: L.door.z + L.face * 5, ry: Math.PI / 2, lvl: 0, ci: S.city }); news("Your new food truck is parked outside.", "good"); goalHit("truck"); closePanel(); } }];
  S.trucks.forEach(function (t, i) { var c = Math.round(CC.TRUCK.upCost * Math.pow(CC.TRUCK.upG, t.lvl)); opts.push({ t: "Upgrade truck " + (i + 1) + " to Lv " + (t.lvl + 2) + " · " + fmt(c), sub: "+35% sales and faster driving.", fn: function () { if (!spend(c)) return; t.lvl++; closePanel(); truckPanel(); } }); });
  panel("Food trucks", "Crowds move through the day: offices at breakfast, campus at lunch, the boardwalk at night. Rival trucks steal sales when they're close.", opts);
}
function carPanel() { var c = Math.round(2000 * Math.pow(2.2, S.car.speed)); panel("Your car", "Top speed level " + S.car.speed, [{ t: "Tune it up · " + fmt(c), sub: "Faster driving between your locations.", fn: function () { if (!spend(c)) return; S.car.speed++; closePanel(); carPanel(); } }]); }
function holdPanel() {
  var H = [["roastery", "Coffee roastery"], ["dairy", "Dairy farm"], ["mill", "Flour mill"], ["orchard", "Fruit orchard"], ["creamery", "Creamery"], ["logistics", "Freight company"], ["media", "Media company"], ["bank", "Private bank"]];
  panel("Supply chain", "Own the companies that supply you. Each level adds steady income, with no cap.", H.map(function (h, i) { var lv = S.hold[h[0]] || 0, c = Math.round(30000 * Math.pow(1.5, i) * Math.pow(1.7, lv)), need = 18 + i * 2;
    return { t: h[1] + " Lv " + lv + " → " + (lv + 1) + " · " + fmt(c), sub: "Unlocks at level " + need + ".", dis: S.lvl < need, fn: function () { if (!spend(c)) return; S.hold[h[0]] = lv + 1; CC.addPts(1000); closePanel(); holdPanel(); } }; }));
}
function upgPanel() {
  panel("Empire upgrades", "These never max out. Each level costs more and keeps adding.", Object.keys(CC.UPG).map(function (k) { var u = CC.UPG[k], c = CC.upgCost(k);
    return { t: u.name + " Lv " + CC.U(k) + " · " + fmt(c), sub: u.eff, fn: function () { if (!spend(c)) return; S.upg[k] = CC.U(k) + 1; CC.addPts(300); goalHit("upg"); closePanel(); upgPanel(); } }; }));
}
function airportPanel() {
  if (!S.permits.airport) { panel("Departures", "Flights to other cities need the regional expansion permit from City Hall.", []); return; }
  var opts = S.cities.map(function (c, i) { return { t: (i === S.city ? "✓ You're in " : "Fly to ") + c.name, dis: i === S.city, fn: function () { closePanel(); travel(i); } }; });
  var nc = S.cities.length, cost = 250000 * Math.pow(3, nc - 1);
  opts.push({ t: "Open a new city · " + fmt(cost), sub: "A whole new map. Bigger crowds and prices, and room to grow.", fn: function () { if (!spend(cost)) return; S.cities.push({ seed: 7771 + nc * 977, name: CC.CITY_NAMES[nc] || ("Metro " + (nc + 1)), grow: 0 }); var sh = CC.newShop(nc, "main", "coffee"); S.shops.push(sh); CC.addPts(8000); news("You expanded to " + S.cities[nc].name + "!", "good"); closePanel(); travel(nc); } });
  panel("Departures", "Your shops in other cities keep running with their managers.", opts);
}
function travel(i) { if (here) { here.scene.remove(P.mesh); here = null; RUN = null; } S.pos = null; S.car.ci = i; save(); enterCity(i); toast("Welcome to " + S.cities[i].name + "!", "good"); }

/* ---------- shop management (at the office desk or from the phone) ---------- */
function shopPanel(sh) {
  var e = CC.shopEcon(sh, false), I = CC.IND[sh.ind], lvC = Math.round(2000 * Math.pow(1.55, sh.lvl) * Math.pow(1.6, sh.city) * (S.laws.rd ? .9 : 1));
  var sizeC = [0, 0, 800, 4500, 24000][sh.size + 1];
  panel("Crema " + I.name + " · " + sh.name, CC.SIZE_NAME[sh.size] + " · rep " + sh.rep.toFixed(1) + "★ · " + (e.running ? "making " + fmt(e.net) + "/min" : sh.mgr ? "closed for the night" : "idle without a manager"), [
    { t: "Hire staff (" + sh.staff + ") · " + fmt(300 * (sh.staff + 1)), sub: "More staff serve more customers. Wages come out of income.", fn: function () { if (!spend(300 * (sh.staff + 1))) return; sh.staff++; goalHit("hire"); closePanel(); shopPanel(sh); } },
    { t: sh.mgr ? "✓ Manager hired" : "Hire a manager · " + fmt(1200), sub: "The shop runs and earns while you're elsewhere.", dis: sh.mgr, fn: function () { if (!spend(1200)) return; sh.mgr = true; goalHit("manager"); closePanel(); shopPanel(sh); } },
    { t: "Prices: " + ["Budget", "Standard", "Premium", "Luxury"][sh.price || 0] + " (tap to change)", sub: "Higher prices, fewer customers.", fn: function () { sh.price = ((sh.price || 0) + 1) % 4; closePanel(); shopPanel(sh); } },
    { t: sh.size >= 4 ? "Biggest size" : "Expand to " + CC.SIZE_NAME[sh.size + 1] + " · " + fmt(sizeC), dis: sh.size >= 4, sub: "More customers and more stations.", fn: function () { if (!spend(sizeC)) return; sh.size++; news(sh.name + " is now a " + CC.SIZE_NAME[sh.size] + ".", "good"); closePanel(); } },
    { t: "Renovate (Lv " + sh.lvl + " → " + (sh.lvl + 1) + ") · " + fmt(lvC), sub: "+8% revenue per level. No cap.", fn: function () { if (!spend(lvC)) return; sh.lvl++; CC.addPts(200); closePanel(); shopPanel(sh); } },
    { t: "Directions", fn: function () { var L = lotByKey(sh.lot); if (L) { target = { x: L.door.x, z: L.door.z, label: sh.name }; closePanel(); } else toast("That shop is in another city."); } }
  ]);
}

/* ---------- superstore ---------- */
function superCost() { return Math.round(150000 * Math.pow(1.6, S.city)); }
function superSitePanel() {
  if (!S.permits.super) { panel("Superstore site", "This whole block can become a Crema superstore: bakery, juice bar, coffee, a restaurant, grocery, restrooms, seating and a parking garage, all laid out by you. First get superstore zoning at City Hall (level " + CC.PERMITS.super.lvl + ").", [{ t: "Directions to City Hall", fn: function () { target = landmark("cityhall"); closePanel(); } }]); return; }
  panel("Superstore site", "Build the shell, then design the floor however you want.", [{ t: "Build the superstore · " + fmt(superCost()), fn: function () {
    if (!spend(superCost())) return; var blk = W.supBlock; S.sup = { city: S.city, dist: "main", items: [{ k: "coffee", x: 4, y: 3, r: 0 }, { k: "seating", x: 10, y: 8, r: 0 }, { k: "restroom", x: 20, y: 2, r: 0 }], garage: 0, spent: superCost() };
    W.buildSuper(); CC.addPts(6000); addXP(5000); news("The Crema Superstore is open! Walk in and lay out your departments.", "good"); sfx("win"); goalHit("super"); closePanel(); } }]);
}
var SUPT = 2; // floor tile size
function buildSup(room) {
  var sc = room.scene, sp = S.sup;
  label3d(sc, "CREMA SUPERSTORE", 0, 6, -room.d / 2 + .3, 14);
  here.supMeshes = new T.Group(); sc.add(here.supMeshes);
  drawSup(); RUN = { sup: true, cust: [], spawnT: 1, served: 0, cash: 0, pts: 0 };
  here.acts.push({ x: room.w / 2 - 3, z: room.d / 2 - 3, r: 2.4, label: "Design the floor", sub: "Place departments anywhere", fn: function () { startPlace("sup"); } });
  W.box(2, 1.2, 1, 0x7a5ad8, room.w / 2 - 3, 0, room.d / 2 - 1.6, sc);
  here.acts.push({ x: -room.w / 2 + 3, z: room.d / 2 - 3, r: 2.4, label: "Parking garage", sub: (80 + (sp.garage || 0) * CC.GARAGE.perLevel) + " spaces", fn: garagePanel });
  W.box(2, 1.2, 1, 0x2f8fd0, -room.w / 2 + 3, 0, room.d / 2 - 1.6, sc);
}
function drawSup() {
  var g = here.supMeshes, room = here.room; while (g.children.length) g.remove(g.children[0]);
  here.obst = here.obst.filter(function (o) { return !o.sup; });
  here.acts = here.acts.filter(function (a) { return !a.sup; });
  S.sup.items.forEach(function (it, idx) {
    var d = CC.DEPT[it.k]; if (!d) return; var w = (it.r ? d.h : d.w) * SUPT, h = (it.r ? d.w : d.h) * SUPT;
    var x = -room.w / 2 + it.x * SUPT + w / 2, z = -room.d / 2 + it.y * SUPT + h / 2;
    var hgt = d.rev ? 1.2 : d.k === "restroom" ? 3 : .9;
    var b = W.box(w - .3, d.k === "escalator" ? 2.6 : (it.k === "restroom" ? 3 : it.k === "plants" ? .7 : 1.15), h - .3, d.col, x, 0, z, g);
    if (it.k === "plants") { var lf = new T.Mesh(new T.SphereGeometry(.8, 8, 6), W.mat(0x3fa65a)); lf.position.set(x, 1.3, z); g.add(lf); }
    if (it.k === "seating") { for (var q = -1; q <= 1; q += 2) W.box(.7, .5, .7, 0x2a2e38, x + q * 1.3, 0, z, g); }
    if (d.rev) { var s = label3d(g, d.name, x, 2.6, z, Math.min(w, 5), "#ffffff", "#1d1410"); }
    var o = { x: x, z: z, w: w / 2 + .3, d: h / 2 + .3, sup: true }; here.obst.push(o);
    if (d.rev) (function (it, x, z, h) { here.acts.push({ sup: true, x: x, z: z + h / 2 + 1, r: 2, label: function () { var n = (it.wait || 0); return n ? "Serve " + n + " waiting at the " + d.name.toLowerCase() : d.name + " (nobody waiting)"; }, fn: function () { supServe(it); } }); })(it, x, z, h);
  });
}
function supServe(it) {
  if (!(it.wait > 0)) { toast("Nobody waiting here right now."); return; }
  it.wait--; var d = CC.DEPT[it.k], I = CC.IND[d.ind]; var item = CC.pick(I.items);
  var price = item[1] * CC.priceMult() * Math.pow(1.6, S.city) * (1 + .15 * (it.lvl || 0)) * 1.2;
  S.cash += price; S.stats.earned += price; S.stats.served++; RUN.served++; RUN.cash += price;
  var pts = 110; CC.addPts(pts); RUN.pts += pts; addXP(1 + price * .05); floatText("+" + fmt(price), { x: P.x, y: 2, z: P.z }); sfx("cash"); goalHit("serve");
}
function supTick(dt) {
  var st = CC.supStats(), room = here.room;
  // waiting shoppers build up at departments; you can work any counter
  RUN.spawnT -= dt;
  if (RUN.spawnT <= 0) {
    RUN.spawnT = clamp(3.2 / Math.max(.3, st.traffic * st.comfort), .8, 6);
    var counters = S.sup.items.filter(function (it) { return CC.DEPT[it.k] && CC.DEPT[it.k].rev; });
    if (counters.length) { var it = CC.pick(counters); it.wait = Math.min(6, (it.wait || 0) + 1); }
    if (RUN.cust.length < 18) { var m = npc(here.scene, CC.rnd(-4, 4), room.d / 2 - 1, Math.PI); RUN.cust.push({ m: m, tx: CC.rnd(-room.w / 2 + 3, room.w / 2 - 3), tz: CC.rnd(-room.d / 2 + 3, room.d / 2 - 6), life: CC.rnd(14, 30) }); }
  }
  RUN.cust.forEach(function (c) {
    c.life -= dt; var tx = c.life > 0 ? c.tx : 0, tz = c.life > 0 ? c.tz : room.d / 2 + 2;
    var dx = tx - c.m.position.x, dz = tz - c.m.position.z, dd = Math.hypot(dx, dz);
    if (dd > .2) { var nx = c.m.position.x + dx / dd * dt * 2.6, nz = c.m.position.z + dz / dd * dt * 2.6; if (!blockedInside(nx, nz) || c.life <= 0) { c.m.position.x = nx; c.m.position.z = nz; } else { c.tx = CC.rnd(-room.w / 2 + 3, room.w / 2 - 3); c.tz = CC.rnd(-room.d / 2 + 3, room.d / 2 - 6); } c.m.rotation.y = Math.atan2(dx, dz); W.animPerson(c.m, dt, true); }
    else { W.animPerson(c.m, dt, false); if (c.life > 0 && Math.random() < dt * .3) { c.tx = CC.rnd(-room.w / 2 + 3, room.w / 2 - 3); c.tz = CC.rnd(-room.d / 2 + 3, room.d / 2 - 6); } }
  });
  RUN.cust = RUN.cust.filter(function (c) { if (c.life <= 0 && c.m.position.z > room.d / 2) { here.scene.remove(c.m); return false; } return true; });
}
function garagePanel() {
  var lv = S.sup.garage || 0, c = Math.round(CC.GARAGE.levelCost * Math.pow(CC.GARAGE.g, lv)), st = CC.supStats();
  panel("Parking garage", "Shoppers who can't park go elsewhere. " + st.parking + " spaces for about " + st.want + " cars at peak. Traffic is running at " + Math.round(st.traffic * 100) + "%.", [
    { t: "Add garage level " + (lv + 1) + " · " + fmt(c), sub: "+" + CC.GARAGE.perLevel + " spaces." + (S.permits.garage ? "" : " Needs a parking variance from City Hall."), dis: !S.permits.garage, fn: function () { if (!spend(c)) return; S.sup.garage = lv + 1; S.sup.spent += c; W.buildSuper(); closePanel(); garagePanel(); } }]);
}

/* ---------- free placement (superstore departments, shop furniture) ---------- */
var PL = null;
function startPlace(kind) {
  closePanel(); PL = { kind: kind, k: kind === "sup" ? "coffee" : "table", r: 0, ghost: null, x: 0, y: 0 };
  mode = "build"; $("#build").classList.remove("hide"); buildBar(); makeGhost();
  toast(kind === "sup" ? "Pick a department below, then tap the floor to place it. Tap a placed one to sell it." : "Tap the floor to place furniture. Done when finished.");
}
function buildBar() {
  var bar = $("#buildItems"); bar.innerHTML = "";
  var list = PL.kind === "sup" ? CC.DEPT_ORDER : ["table", "plant"];
  list.forEach(function (k) {
    var d = PL.kind === "sup" ? CC.DEPT[k] : { name: k === "table" ? "Table" : "Plant", cost: k === "table" ? 400 : 250, lvl: 1 };
    var cost = PL.kind === "sup" ? CC.deptCost(k) : d.cost, lock = S.lvl < (d.lvl || 1);
    var b = document.createElement("button"); b.className = "bi" + (PL.k === k ? " on" : "") + (lock ? " lock" : "");
    b.innerHTML = "<b>" + d.name + "</b><small>" + (lock ? "Level " + d.lvl : fmt(cost)) + "</small>";
    b.onclick = function () { if (lock) { toast("Unlocks at level " + d.lvl + "."); return; } PL.k = k; buildBar(); makeGhost(); };
    bar.appendChild(b);
  });
}
function makeGhost() {
  if (PL.ghost) here.scene.remove(PL.ghost);
  var w = 1.6, h = 1.6;
  if (PL.kind === "sup") { var d = CC.DEPT[PL.k]; w = (PL.r ? d.h : d.w) * SUPT; h = (PL.r ? d.w : d.h) * SUPT; }
  PL.ghost = new T.Mesh(new T.BoxGeometry(w, 1, h), new T.MeshBasicMaterial({ color: 0x3fe39a, transparent: true, opacity: .45 }));
  PL.ghost.position.y = .5; PL.gw = w; PL.gh = h; here.scene.add(PL.ghost);
}
function placeAt(x, z) {
  var room = here.room;
  if (PL.kind === "sup") {
    var d = CC.DEPT[PL.k], tw = PL.r ? d.h : d.w, th = PL.r ? d.w : d.h;
    var gx = Math.round((x + room.w / 2) / SUPT - tw / 2), gy = Math.round((z + room.d / 2) / SUPT - th / 2);
    var maxX = room.w / SUPT - tw - 1, maxY = room.d / SUPT - th - 4;
    gx = clamp(gx, 1, maxX); gy = clamp(gy, 1, maxY);
    return { gx: gx, gy: gy, x: -room.w / 2 + gx * SUPT + tw * SUPT / 2, z: -room.d / 2 + gy * SUPT + th * SUPT / 2, tw: tw, th: th };
  }
  return { x: clamp(Math.round(x), -room.w / 2 + 2, room.w / 2 - 2), z: clamp(Math.round(z), -room.d / 2 + 7, room.d / 2 - 3) };
}
function overlapsSup(gx, gy, tw, th, skip) {
  return S.sup.items.some(function (it, i) { if (i === skip) return false; var d = CC.DEPT[it.k]; var w = it.r ? d.h : d.w, h = it.r ? d.w : d.h; return gx < it.x + w && gx + tw > it.x && gy < it.y + h && gy + th > it.y; });
}
function placeTap(x, z) {
  var p = placeAt(x, z);
  if (PL.kind === "sup") {
    // tapping an existing department sells it
    var hit = -1; S.sup.items.forEach(function (it, i) { var d = CC.DEPT[it.k]; var w = it.r ? d.h : d.w, h = it.r ? d.w : d.h; var gx = (x + here.room.w / 2) / SUPT, gy = (z + here.room.d / 2) / SUPT; if (gx >= it.x && gx < it.x + w && gy >= it.y && gy < it.y + h) hit = i; });
    if (hit >= 0) { var it = S.sup.items[hit], back = Math.round(CC.DEPT[it.k].cost * .5); panel("Sell " + CC.DEPT[it.k].name + "?", "You get " + fmt(back) + " back.", [{ t: "Sell it", fn: function () { S.sup.items.splice(hit, 1); S.cash += back; drawSup(); closePanel(); } }]); return; }
    if (overlapsSup(p.gx, p.gy, p.tw, p.th, -1)) { toast("Something's already there.", "bad"); return; }
    var c = CC.deptCost(PL.k); if (!spend(c)) return;
    S.sup.items.push({ k: PL.k, x: p.gx, y: p.gy, r: PL.r, lvl: 0 }); S.sup.spent += c; CC.addPts(300); addXP(c * .01); drawSup(); buildBar(); goalHit("dept");
  } else {
    var sh = here.data.shop, c2 = PL.k === "table" ? 400 : 250; if (!spend(c2)) return;
    var f = { k: PL.k, x: p.x, z: p.z }; (sh.furn = sh.furn || []).push(f); sh.decor = (sh.decor || 0) + (PL.k === "table" ? 1 : .5); placeFurnMesh(here.scene, f); CC.addPts(80);
  }
}
function endPlace() { if (PL && PL.ghost) here.scene.remove(PL.ghost); PL = null; mode = "inside"; $("#build").classList.add("hide"); save(); }

/* ================= goals (a guide for new players, then endless) ================= */
var GOALS = [
  { id: "enter", t: "Walk into your coffee shop", hint: "Follow the arrow and press the action button at the door." },
  { id: "serve", n: 5, t: "Serve 5 customers yourself", hint: "Make what they ask for at its station, carry it to the counter." },
  { id: "hire", t: "Hire staff at the shop office", hint: "The OFFICE desk is at the front corner of your shop." },
  { id: "manager", t: "Hire a manager so the shop runs without you" },
  { id: "realty", t: "Buy a building (look for FOR SALE signs)" },
  { id: "open", t: "Open a second location in a building you own" },
  { id: "permit:truck", t: "Get a food truck license at City Hall" },
  { id: "truck", t: "Buy a food truck at the dealership and sell to a crowd" },
  { id: "upg", t: "Buy an empire upgrade at the Supply Depot" },
  { id: "buyout", t: "Buy out a rival shop" },
  { id: "permit:super", t: "Get superstore zoning (level 15)" },
  { id: "super", t: "Build the Crema Superstore" },
  { id: "dept", n: 4, t: "Place 4 departments in your superstore" }
];
function goalHit(id) {
  S.goals = S.goals || {}; S.goals[id] = (S.goals[id] || 0) + 1;
  var g = curGoal(); if (g && g.id === id && S.goals[id] >= (g.n || 1)) { S.gi = (S.gi || 0) + 1; CC.addPts(500); addXP(40); toast("Goal done: " + g.t, "good"); sfx("level"); }
}
function curGoal() {
  S.gi = S.gi || 0; while (S.gi < GOALS.length && (S.goals || {})[GOALS[S.gi].id] >= (GOALS[S.gi].n || 1)) S.gi++;
  if (S.gi < GOALS.length) return GOALS[S.gi];
  var nxt = Math.ceil((S.lvl + 1) / 5) * 5; return { id: "lvl", t: "Reach level " + nxt + " · " + (S.office !== "mayor" ? "then run for mayor" : "expand to a new city") };
}
function goalTarget(g) {
  if (!g || !city || here) return null;
  if (g.id === "enter" || g.id === "serve" || g.id === "hire" || g.id === "manager") { var sh = S.shops.filter(function (s) { return s.city === S.city; })[0]; var L = sh && lotByKey(sh.lot); return L ? { x: L.door.x, z: L.door.z } : null; }
  if (g.id === "realty" || g.id === "open") { var e = W.lots.filter(function (L) { return L.kind === "empty"; }).sort(function (a, b) { return Math.hypot(a.x - P.x, a.z - P.z) - Math.hypot(b.x - P.x, b.z - P.z); })[0]; return e ? { x: e.door.x, z: e.door.z } : null; }
  if (g.id === "permit:truck" || g.id === "permit:super") return landmark("cityhall");
  if (g.id === "truck") return landmark("dealer");
  if (g.id === "upg") return landmark("supplier");
  if (g.id === "buyout") { var r = W.lots.filter(function (L) { return L.rival; }).sort(function (a, b) { return a.rival.S - b.rival.S; })[0]; return r ? { x: r.door.x, z: r.door.z } : null; }
  if (g.id === "super" || g.id === "dept") { var sb = W.blocks.filter(function (b) { return b.bx + "," + b.by === W.supBlock; })[0]; return sb ? { x: sb.x - 8, z: sb.z + 18 } : null; }
  return null;
}

/* ================= panels (contextual, opened by walking up to things) ================= */
function panel(title, sub, opts) {
  var el = $("#panel"); el.classList.remove("hide");
  el.querySelector("h2").textContent = title; el.querySelector("p").textContent = sub || "";
  var box = el.querySelector(".opts"); box.innerHTML = "";
  opts.filter(function (o) { return !o.hide; }).forEach(function (o) {
    var b = document.createElement("button"); b.className = "opt"; b.disabled = !!o.dis || !o.fn;
    b.innerHTML = "<b>" + esc(o.t) + "</b>" + (o.sub ? "<small>" + esc(o.sub) + "</small>" : "");
    if (o.fn) b.onclick = function () { sfx("click"); o.fn(); hud(); };
    box.appendChild(b);
  });
  if (!opts.length) box.innerHTML = "<div class='empty'>Nothing here yet.</div>";
}
function closePanel() { $("#panel").classList.add("hide"); }
CC.closePanel = closePanel;
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

/* ---------- phone ---------- */
function phone(tab) {
  tab = tab || "empire"; var el = $("#phone"); el.classList.remove("hide");
  el.querySelectorAll(".tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.t === tab); b.onclick = function () { phone(b.dataset.t); }; });
  var c = el.querySelector(".pbody"), h = "";
  if (tab === "empire") {
    var inc = CC.incomeNow(here && here.kind === "shop" ? { shop: here.data.shop.id } : null);
    h += row("Cash", fmt(S.cash)) + row("Income", fmt(inc) + "/min") + row("Net worth", fmt(CC.netWorth())) + row("Level", S.lvl + " · " + Math.round(S.xp / CC.xpNeed(S.lvl) * 100) + "%") + row("Fame", Math.round(S.fame).toLocaleString()) + row("Influence", Math.round(S.influence)) + row("Office", S.office ? CC.POLITICS[S.office].name : "Private citizen") + row("Tax rate", Math.round(CC.taxRate() * 100) + "%") + row("Shops", S.shops.length) + row("Properties", Object.keys(S.realty).length) + row("Trucks", S.trucks.length) + row("Day", S.day + " · " + clockStr()) + row("Points today", (S.dayPts || 0).toLocaleString());
    if (S.importFrom) h += "<p class='note'>Your Crema Rush empire was brought over from " + esc(S.importFrom) + ". Your old save is untouched.</p>";
  } else if (tab === "shops") {
    S.shops.forEach(function (sh) { var e = CC.shopEcon(sh, false); h += "<button class='prow' data-s='" + sh.id + "'><b>" + esc(CC.IND[sh.ind].name + " · " + sh.name) + "</b><small>" + S.cities[sh.city].name + " · " + CC.SIZE_NAME[sh.size] + " · " + (e.running ? fmt(e.net) + "/min" : sh.mgr ? "closed" : "needs a manager") + "</small></button>"; });
  } else if (tab === "map") {
    h += "<canvas id='bigmap' width='560' height='560'></canvas><p class='note'>Tap the map to set a route.</p>";
  } else if (tab === "news") {
    h += S.news.slice(0, 30).map(function (n) { return "<div class='nrow " + n.kind + "'><small>Day " + n.d + "</small>" + esc(n.text) + "</div>"; }).join("") || "<div class='empty'>Quiet so far.</div>";
  } else if (tab === "goals") {
    var g = curGoal(); h += "<div class='goal'><small>Now</small><b>" + esc(g.t) + "</b>" + (g.hint ? "<p>" + esc(g.hint) + "</p>" : "") + "</div>";
    h += "<div class='ideas'><b>Ways to grow</b><ul><li>Buy empty buildings and open new shops, or lease them for rent.</li><li>Buy rivals' buildings to squeeze them, then buy them out cheap.</li><li>Food trucks: follow the crowds through the day.</li><li>City Hall: permits, tax strategies, then run for council and mayor.</li><li>Superstore: lay out any mix of departments, and add parking.</li><li>Supply Depot: own your supply chain, with no level cap.</li><li>Fly to new cities with the regional expansion permit.</li></ul></div>";
  } else if (tab === "settings") {
    h += "<button class='prow' id='pMute'><b>Sound: " + (S.mute ? "off" : "on") + "</b></button><button class='prow' id='pSave'><b>Save now</b></button><button class='prow' id='pArc'><b>Back to Lazer Arcade</b></button><button class='prow' id='pV3'><b>Play Crema Rush v3</b><small>Your v3 save keeps working separately.</small></button>";
  }
  c.innerHTML = h;
  c.querySelectorAll("[data-s]").forEach(function (b) { b.onclick = function () { var sh = shopById(+b.dataset.s); closePhone(); shopPanel(sh); }; });
  var bm = c.querySelector("#bigmap");
  if (bm) { W.drawMinimap(bm, P, marks(), target); bm.onclick = function (e) { var r = bm.getBoundingClientRect(), k = bm.width / (W.half * 2 + 30); var x = ((e.clientX - r.left) / r.width * bm.width - bm.width / 2) / k, z = ((e.clientY - r.top) / r.height * bm.height - bm.height / 2) / k; target = { x: x, z: z, label: "Marker" }; W.drawMinimap(bm, P, marks(), target); toast("Route set."); }; }
  var m = c.querySelector("#pMute"); if (m) m.onclick = function () { S.mute = !S.mute; phone("settings"); };
  var sv = c.querySelector("#pSave"); if (sv) sv.onclick = function () { save(); toast("Saved."); };
  var ar = c.querySelector("#pArc"); if (ar) ar.onclick = function () { save(); location.href = "/arcade/"; };
  var v3 = c.querySelector("#pV3"); if (v3) v3.onclick = function () { save(); location.href = "/arcade/crema-rush/"; };
}
function row(a, b) { return "<div class='kv'><span>" + a + "</span><b>" + b + "</b></div>"; }
function closePhone() { $("#phone").classList.add("hide"); }
function marks() {
  var m = [];
  W.lots.forEach(function (L) { if (L.shop) m.push({ x: L.x, z: L.z, c: "#3fe39a", r: 4 }); else if (L.rival) m.push({ x: L.x, z: L.z, c: "#ff6b6b", r: 2.5 }); else if (L.landmark) m.push({ x: L.x, z: L.z, c: "#9fe9ff", r: 4 }); else if (S.realty[L.key]) m.push({ x: L.x, z: L.z, c: "#ffb83d", r: 3 }); });
  trucks.forEach(function (t) { m.push({ x: t.m.position.x, z: t.m.position.z, c: t.kind === "truck" ? "#fff" : "#ffb83d", r: 2.5 }); });
  return m;
}
function clockStr() { var h = CC.hour(), hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return ((hh + 11) % 12 + 1) + ":" + (mm < 10 ? "0" : "") + mm + (hh < 12 ? " am" : " pm"); }

/* ================= HUD ================= */
var hudT = 0;
function hud() {
  if (!S) return;
  $("#hCash").textContent = fmt(S.cash);
  var inc = CC.incomeNow(here && here.kind === "shop" ? { shop: here.data.shop.id } : null) + truckIncome();
  $("#hInc").textContent = (inc >= 0 ? "+" : "") + fmt(inc) + "/min";
  $("#hLvl").textContent = "Lv " + S.lvl; $("#hXp").style.width = Math.round(S.xp / CC.xpNeed(S.lvl) * 100) + "%";
  $("#hTime").textContent = "Day " + S.day + " · " + clockStr() + (CC.open() ? "" : " · closed");
  $("#hCity").textContent = here ? (here.kind === "shop" ? "Crema " + CC.IND[here.data.shop.ind].name : here.kind === "rival" ? here.data.rival.name : here.kind === "sup" ? "Superstore" : here.kind.replace("cityhall", "City Hall")) : nearestDistrict();
  var g = curGoal(); $("#goal").innerHTML = "<small>Goal</small>" + esc(g.t);
}
function nearestDistrict() { var best = null, bd = 1e9; (W.blocks || []).forEach(function (b) { var d = Math.hypot(b.x - P.x, b.z - P.z); if (d < bd) { bd = d; best = b; } }); return best ? D(best.dist).name + ", " + S.cities[S.city].name : ""; }
function showHold() { var h = $("#hold"); if (P.hold) { h.textContent = "Holding: " + P.hold[0]; h.classList.remove("hide"); } else h.classList.add("hide"); }
function floatText(t, pos, col) {
  var v = new T.Vector3(pos.x, (pos.y || 0) + 2.6, pos.z).project(W.camera);
  var el = document.createElement("div"); el.className = "float"; el.textContent = t; if (col) el.style.color = col;
  el.style.left = ((v.x + 1) / 2 * window.innerWidth) + "px"; el.style.top = ((1 - v.y) / 2 * window.innerHeight) + "px";
  document.body.appendChild(el); setTimeout(function () { el.remove(); }, 1200);
}
function truckIncome() { var t = 0; trucks.forEach(function (tr) { if (tr.kind === "truck" && tr.ref.open && !here) t += truckIncomeOf(tr); }); return t; }

/* ================= interaction ================= */
var curAct = null;
function updateActs() {
  var list = mode === "inside" ? here.acts : mode === "city" ? (acts = cityActs()) : [];
  var best = null, bd = 1e9;
  list.forEach(function (a) { var d = Math.hypot(a.x - P.x, a.z - P.z); if (d < a.r && d < bd) { bd = d; best = a; } });
  curAct = best;
  var el = $("#act");
  if (mode === "drive") { el.innerHTML = "<b>Get out</b><small>" + (veh.t.kind === "truck" ? "Park, then open the window to sell" : "") + "</small>"; el.classList.remove("hide"); $("#act2").classList.add("hide"); return; }
  if (best) {
    var lab = typeof best.label === "function" ? best.label() : best.label;
    el.innerHTML = "<b>" + esc(lab) + "</b>" + (best.sub ? "<small>" + esc(typeof best.sub === "function" ? best.sub() : best.sub) + "</small>" : ""); el.classList.remove("hide");
    var a2 = $("#act2"); if (best.alt) { a2.innerHTML = "<b>" + esc(best.alt.label) + "</b>"; a2.classList.remove("hide"); } else a2.classList.add("hide");
  } else { el.classList.add("hide"); $("#act2").classList.add("hide"); }
}
function doAct(alt) {
  if (!$("#panel").classList.contains("hide")) return;
  if (mode === "drive") { exitVehicle(); return; }
  if (mode === "build") return;
  if (!curAct) return;
  if (alt && curAct.alt) curAct.alt.fn(); else curAct.fn();
  if (curAct && curAct.label === "Leave") return;
  if (here && here.kind === "shop" && curAct && /^Enter your/.test(curAct.label)) goalHit("enter");
  hud();
}

/* ================= input ================= */
function bindInput() {
  window.addEventListener("keydown", function (e) {
    var k = e.key.toLowerCase(); keys[k] = true;
    if (k === "e" || k === "enter") { if (!$("#panel").classList.contains("hide")) return; doAct(false); }
    if (k === "f") doAct(true);
    if (k === "shift") run = true;
    if (k === "p" || k === "tab") { e.preventDefault(); if ($("#phone").classList.contains("hide")) phone(); else closePhone(); }
    if (k === "escape") { if (!$("#panel").classList.contains("hide")) closePanel(); else if (!$("#phone").classList.contains("hide")) closePhone(); else if (mode === "build") endPlace(); }
    if (k === "r" && PL && PL.kind === "sup") { PL.r = PL.r ? 0 : 1; makeGhost(); }
  });
  window.addEventListener("keyup", function (e) { var k = e.key.toLowerCase(); keys[k] = false; if (k === "shift") run = false; });
  // camera drag (mouse or right-side touch); tap on floor in build mode
  var cv = $("#cv"), drag = null;
  cv.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false }; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
  cv.addEventListener("pointermove", function (e) {
    if (mode === "build") moveGhost(e.clientX, e.clientY);
    if (!drag || drag.id !== e.pointerId) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    cam.yaw -= dx * .006; cam.pitch = clamp(cam.pitch + dy * .004, .12, 1.25); drag.x = e.clientX; drag.y = e.clientY;
  });
  cv.addEventListener("pointerup", function (e) { if (drag && !drag.moved && mode === "build") { var p = floorPoint(e.clientX, e.clientY); if (p) placeTap(p.x, p.z); } drag = null; });
  cv.addEventListener("wheel", function (e) { cam.dist = clamp(cam.dist + e.deltaY * .01, 6, 34); }, { passive: true });
  // joystick
  var js = $("#joy"), knob = js.querySelector("i"), jid = null, jc = null;
  js.addEventListener("pointerdown", function (e) { jid = e.pointerId; var r = js.getBoundingClientRect(); jc = { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; joy.on = true; js.setPointerCapture(e.pointerId); jmove(e); });
  js.addEventListener("pointermove", function (e) { if (e.pointerId === jid) jmove(e); });
  function jmove(e) { var dx = (e.clientX - jc.x) / jc.r, dy = (e.clientY - jc.y) / jc.r, l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } joy.x = dx; joy.y = dy; knob.style.transform = "translate(" + dx * 34 + "px," + dy * 34 + "px)"; run = l > .92; }
  function jend() { jid = null; joy.x = joy.y = 0; joy.on = false; knob.style.transform = ""; run = false; }
  js.addEventListener("pointerup", jend); js.addEventListener("pointercancel", jend);
  $("#act").onclick = function () { doAct(false); }; $("#act2").onclick = function () { doAct(true); };
  $("#bPhone").onclick = function () { sfx("click"); if ($("#phone").classList.contains("hide")) phone(); else closePhone(); };
  $("#phone .close").onclick = closePhone; $("#panel .close").onclick = closePanel;
  $("#bDone").onclick = endPlace; $("#bRot").onclick = function () { if (PL) { PL.r = PL.r ? 0 : 1; makeGhost(); } };
  $("#goal").onclick = function () { phone("goals"); };
  window.addEventListener("resize", W.resize);
}
var ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0);
function floorPoint(cx, cy) { var v = new T.Vector2(cx / window.innerWidth * 2 - 1, -(cy / window.innerHeight) * 2 + 1); ray.setFromCamera(v, W.camera); var p = new T.Vector3(); return ray.ray.intersectPlane(plane, p) ? p : null; }
function moveGhost(cx, cy) { if (!PL || !PL.ghost) return; var p = floorPoint(cx, cy); if (!p) return; var q = placeAt(p.x, p.z); PL.ghost.position.x = q.x; PL.ghost.position.z = q.z; var bad = PL.kind === "sup" && overlapsSup(q.gx, q.gy, q.tw, q.th, -1); PL.ghost.material.color.setHex(bad ? 0xff4d63 : 0x3fe39a); }

/* ================= main loop ================= */
var last = 0, arrow = null;
function loop(t) {
  requestAnimationFrame(loop);
  var dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
  if (!S || mode === "boot") return;
  if (window.LZ && LZ.lockOk && !LZ.lockOk()) return; // frozen in another tab
  // player movement
  if (mode === "city" || mode === "inside") {
    var fx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + joy.x, fz = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0) + joy.y;
    var l = Math.hypot(fx, fz);
    if (l > .1 && $("#panel").classList.contains("hide")) {
      if (l > 1) { fx /= l; fz /= l; }
      var sp = (run || keys.shift ? 11 : 6.5) * (mode === "inside" ? .8 : 1);
      var s = Math.sin(cam.yaw), c = Math.cos(cam.yaw);
      var mx = (fx * c + fz * s) * sp * dt, mz = (-fx * s + fz * c) * sp * dt;
      var nx = P.x + mx, nz = P.z + mz;
      var blocked = mode === "inside" ? blockedInside : inBuilding;
      if (!blocked(nx, P.z)) P.x = nx; if (!blocked(P.x, nz)) P.z = nz;
      P.ry = Math.atan2(mx, mz);
      W.animPerson(P.mesh, dt, true);
    } else W.animPerson(P.mesh, dt, false);
    P.mesh.position.set(P.x, mode === "city" ? .25 : 0, P.z); P.mesh.rotation.y = P.ry;
  } else if (mode === "drive") drive(dt);
  // simulation
  var newDay = CC.tick(dt, here && here.kind === "shop" ? { shop: here.data.shop.id } : null, truckIncome());
  // truck sales count as active play only while you're with the truck
  trucks.forEach(function (tr) { if (tr.kind === "truck" && tr.ref.open && !here && Math.hypot(tr.m.position.x - P.x, tr.m.position.z - P.z) < 30) { tr.acc = (tr.acc || 0) + dt; if (tr.acc > 3) { tr.acc = 0; var r = truckIncomeOf(tr); if (r > 0) { CC.addPts(Math.round(18 * Math.min(2, r / 30))); floatText("+" + fmt(r / 20), tr.m.position); } } } });
  if (newDay) dayEnd();
  if (mode === "inside" || mode === "build") { if (RUN && RUN.sh) shiftTick(dt); else if (RUN && RUN.sup) supTick(dt); }
  else { W.updateTraffic(dt, mode === "city" ? P : null); W.updatePeds(dt); }
  W.setTime(CC.hour());
  // camera
  var focus = mode === "drive" ? veh.t.m.position : P.mesh.position;
  if (mode === "drive") cam.yaw += ((P.ry + Math.PI) - cam.yaw) * Math.min(1, dt * 2.5) * 0; // free look while driving
  var inRoom = mode === "inside" || mode === "build";
  var big = inRoom && here && here.kind === "sup";
  var dist = (mode === "drive" ? Math.max(cam.dist, 16) : inRoom ? (big ? 24 : Math.min(cam.dist, 13)) : cam.dist) * (W.portrait ? (inRoom ? 1.2 : 1.35) : 1);
  var pitch = inRoom ? Math.max(cam.pitch, .9) : cam.pitch;
  var cp = new T.Vector3(focus.x + Math.sin(cam.yaw) * Math.cos(pitch) * dist, focus.y + 1.5 + Math.sin(pitch) * dist, focus.z + Math.cos(cam.yaw) * Math.cos(pitch) * dist);
  if (inRoom) { var rw = here.room.w / 2 - .8, rd = here.room.d / 2; cp.x = clamp(cp.x, -rw, rw); cp.z = clamp(cp.z, -rd + 1, rd - .5); }
  else camOcclude(focus, cp);
  if (mode === "drive") { var behind = P.ry + Math.PI; cam.yaw += angDiff(cam.yaw, behind) * Math.min(1, dt * 1.8); }
  W.camera.position.lerp(cp, Math.min(1, dt * 10)); W.camera.lookAt(focus.x, focus.y + 1.6, focus.z);
  // gps arrow
  var tg = target || goalTarget(curGoal());
  if (tg && !here) { if (Math.hypot(tg.x - P.x, tg.z - P.z) < 6 && target) target = null; arrowAt(tg); } else if (arrow) arrow.visible = false;
  updateActs();
  var scene = here ? here.scene : W.scene;
  W.renderer.render(scene, W.camera);
  hudT -= dt; if (hudT <= 0) { hudT = .25; hud(); W.drawMinimap($("#mini"), P, marks(), tg); }
  if (Date.now() - lastSave > 20000) { lastSave = Date.now(); save(); }
}
// pull the camera in front of any building between it and you
function camOcclude(f, cp) {
  for (var i = 1; i <= 10; i++) {
    var k = i / 10, x = f.x + (cp.x - f.x) * k, y = f.y + (cp.y - f.y) * k, z = f.z + (cp.z - f.z) * k;
    for (var j = 0; j < W.lots.length; j++) { var L = W.lots[j]; if (L.supBlock || !L.h) continue; if (Math.abs(x - L.x) < 13.6 && Math.abs(z - L.z) < 13.6 && y < L.h + 1) { var kk = Math.max(.15, (i - 1.3) / 10); cp.set(f.x + (cp.x - f.x) * kk, Math.max(f.y + 3, f.y + (cp.y - f.y) * kk + 2), f.z + (cp.z - f.z) * kk); return; } }
  }
}
function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }
function arrowAt(tg) {
  if (!arrow) { arrow = new T.Mesh(new T.ConeGeometry(.6, 1.6, 8), new T.MeshBasicMaterial({ color: 0xffb83d })); arrow.rotation.x = Math.PI / 2; }
  if (arrow.parent !== W.scene) W.scene.add(arrow);
  arrow.visible = true; var f = mode === "drive" ? veh.t.m.position : P.mesh.position;
  var a = Math.atan2(tg.x - f.x, tg.z - f.z); arrow.position.set(f.x + Math.sin(a) * 2.6, (mode === "drive" ? 4 : 3) + Math.sin(Date.now() / 200) * .15, f.z + Math.cos(a) * 2.6); arrow.rotation.set(Math.PI / 2, 0, -a); arrow.rotation.order = "YXZ"; arrow.rotation.y = a; arrow.rotation.x = Math.PI / 2;
}
function dayEnd() {
  var r = CC.endDay(), pts = S.dayPts || 0; S.dayPts = 0;
  r.lines.forEach(function (l) { news(l, /AUDIT/.test(l) ? "bad" : ""); });
  if (r.grew && city && !here) { var pos = { x: P.x, z: P.z, ry: P.ry }; W.scene.remove(P.mesh); enterCity(S.city, pos); }
  if (pts > 0 && window.LZ && window.LZ_GAME) { try { LZ.endSession(LZ_GAME, pts, { day: S.day - 1, v: 4 }); } catch (e) {} }
  save();
}

/* ================= grants (staff gifts) ================= */
function applyGrants() { if (!S || !window.LZ || !LZ.grants) return; LZ.grants("crema").then(function (list) { var n = 0; S.claims = S.claims || {}; list.forEach(function (g) { if (S.claims[g.id]) return; S.claims[g.id] = Date.now(); if (g.cash > 0) { S.cash += g.cash; n += g.cash; } }); if (n) { save(); toast("Gift from Lazer Arcade staff: +" + fmt(n) + " cash", "good"); } }).catch(function () {}); }

/* ================= start ================= */
CC.start = async function () {
  W.init($("#cv")); bindInput();
  $("#load").textContent = "Signing in…";
  await lzBoot();
  S = load();
  var imported = false;
  if (!S) { $("#load").textContent = "Looking for your Crema Rush empire…"; S = await importV3(); imported = !!S; if (!S) { S = CC.fresh(); CC.set(S); S.shops.push(CC.newShop(0, "main", "coffee")); } }
  CC.set(S);
  var off = CC.offline();
  enterCity(S.city || 0);
  mode = "city"; $("#load").remove(); $("#hud").classList.remove("hide");
  if (imported) { news("Welcome to Crema City! Your whole Crema Rush empire came with you: " + S.shops.length + " shop" + (S.shops.length > 1 ? "s" : "") + " and " + fmt(S.cash) + ".", "good"); }
  else if (off && off.gain > 1) news("While you were away your managers made " + fmt(off.gain) + ".", "good");
  else if (S.day === 1 && !S.goals) toast("Welcome to Crema City. Follow the arrow to your coffee shop.", "good");
  save(); applyGrants(); setInterval(applyGrants, 60000);
  requestAnimationFrame(loop);
};
window.__CC = { state: function () { return { mode: mode, S: S, P: { x: P.x, z: P.z }, here: here && here.kind, act: curAct && (typeof curAct.label === "function" ? curAct.label() : curAct.label), goal: curGoal().t }; }, act: function (alt) { doAct(alt); }, tp: function (x, z) { P.x = x; P.z = z; }, lots: function () { return W.lots; }, keys: keys };
})(window.CC);
