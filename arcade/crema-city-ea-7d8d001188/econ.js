/* Crema City — state, v3 import, economy simulation. */
"use strict";
(function (CC) {
var S = null;
CC.SAVEKEY = "crema-city-v4";
var SIZE_NAME = [null, "Kiosk", "Cafe", "Flagship", "Megastore"];
var SIZE_MULT = [0, 1, 1.5, 2.2, 3.2];
var SIZE_COST = [0, 0, 800, 4500, 24000];
CC.SIZE_NAME = SIZE_NAME; CC.SIZE_MULT = SIZE_MULT;
// v3 holdings paid this much per minute per level
var HOLD_INC = { roastery: 40, dairy: 55, mill: 70, logistics: 90, adagency: 110, orchard: 130, creamery: 150, bank: 200, media: 260 };

/* ---------------- state ---------------- */
function fresh() {
  return {
    v: 4, cash: 60, xp: 0, lvl: 1, fame: 0, influence: 0, office: "", day: 1, clock: CC.DAY_SEC * 0.33,
    city: 0, cities: [{ seed: 7771, name: CC.CITY_NAMES[0], grow: 0 }],
    shops: [], nid: 1, sup: null, trucks: [], realty: {}, permits: {}, laws: {}, upg: {}, hold: {},
    rivals: {}, loans: 0, invest: 0, mayorTax: null, rezoned: {},
    stats: { earned: 0, served: 0, passive: 0, taxes: 0, deals: 0 }, news: [], claims: {},
    pts: 0, dayPts: 0, ts: Date.now(), tut: 0, imported: "", car: null, mute: false
  };
}
CC.fresh = fresh;
CC.get = function () { return S; };
CC.set = function (s) { S = s; };

// Convert a Crema Rush v3 save into a Crema City save. Nothing is lost: cash, level, fame, every shop
// with its staff, reputation, decor and price tier, HQ upgrades and holdings carry over.
CC.fromV3 = function (g) {
  var s = fresh();
  s.cash = Math.max(60, +g.cash || 0); s.xp = g.xp || 0; s.lvl = g.lvl || 1; s.fame = g.fame || 0; s.day = g.day || 1;
  s.stats.earned = (g.stats && g.stats.earned) || 0; s.stats.served = (g.stats && g.stats.served) || 0;
  s.stats.passive = (g.stats && g.stats.passive) || 0; s.pts = (g.stats && g.stats.pts) || 0;
  var hq = g.hq || {};
  ["training", "loyalty", "quality", "offline", "security"].forEach(function (k) { if (hq[k]) s.upg[k] = hq[k]; });
  if (hq.ambassador) s.upg.marketing = hq.ambassador;
  if (hq.grind) s.upg.training = (s.upg.training || 0) + hq.grind;
  s.hold = Object.assign({}, g.hold || {});
  s.claims = Object.assign({}, g.claims || {});
  var nc = Math.max(1, g.cities || 1);
  for (var c = 1; c < nc; c++) s.cities.push({ seed: 7771 + c * 977, name: CC.CITY_NAMES[c] || ("Metro " + (c + 1)), grow: 0 });
  if (nc > 1) s.permits.airport = 1;
  (g.locs || []).forEach(function (l) {
    var staff = 0, st = l.staff || {}; Object.keys(st).forEach(function (k) { staff += st[k] || 0; });
    s.shops.push({
      id: s.nid++, city: l.city || 0, dist: l.did || "main", ind: CC.IND[l.ind] ? l.ind : "coffee", name: l.name || "Main Street",
      size: CC.clamp(l.size || 1, 1, 4), staff: staff, mgr: (st.manager || 0) > 0, rep: l.rep || 3, decor: l.decor || 0, price: l.price || 0,
      lvl: 0, earned: l.earned || 0, lot: null, rival: l.comp ? { name: l.comp.name, S: l.comp.S || 20 } : null, v3: 1
    });
  });
  if (!s.shops.length) s.shops.push(newShop(s, 0, "main", "coffee"));
  s.imported = "v3";
  return s;
};
function newShop(s, city, dist, ind) {
  var D = distById(dist);
  return { id: s.nid++, city: city, dist: dist, ind: ind, name: D ? D.name : "Shop", size: 1, staff: 0, mgr: false, rep: 3, decor: 0, price: 0, lvl: 0, earned: 0, lot: null, rival: null };
}
CC.newShop = function (city, dist, ind) { return newShop(S, city, dist, ind); };
function distById(id) {
  for (var i = 0; i < CC.DIST.length; i++) if (CC.DIST[i].id === id) return CC.DIST[i];
  var g = S && S.genDist && S.genDist[id]; return g || null;
}
CC.distById = distById;

/* ---------------- time ---------------- */
CC.hour = function () { return 24 * (S.clock / CC.DAY_SEC); };
CC.isNight = function () { var h = CC.hour(); return h < 6 || h >= 20; };
CC.open = function () { var h = CC.hour(); return (h >= CC.OPEN_H && h < CC.CLOSE_H) || !!S.permits.late; };
// demand curve through the day for a district: breakfast, lunch, evening peaks
CC.curve = function (D, h) {
  h = h == null ? CC.hour() : h;
  var am = Math.exp(-Math.pow((h - 8.5) / 1.6, 2)) * (D.am || 1);
  var lu = Math.exp(-Math.pow((h - 12.7) / 1.5, 2)) * (D.lunch || 1);
  var ev = Math.exp(-Math.pow((h - 18.5) / 2.0, 2)) * (D.eve || 1);
  var base = h >= 6 && h < 22 ? .35 : .08;
  return base + .9 * (am + lu + ev);
};

/* ---------------- modifiers ---------------- */
function U(k) { return (S.upg && S.upg[k]) || 0; }
CC.U = U;
CC.famMult = function () { return 1 + Math.log10(1 + S.fame / 200) * .6; };
CC.custMult = function () { return (1 + .06 * U("loyalty")) * (1 + .05 * U("marketing")); };
CC.priceMult = function () { return 1 + .04 * U("quality"); };
CC.costMult = function () { return Math.pow(.96, U("logistics")); };
CC.upgCost = function (k) { var u = CC.UPG[k]; return Math.round(u.base * Math.pow(u.g, U(k)) * (S.laws.rd ? .9 : 1)); };
CC.taxRate = function () {
  var r = S.mayorTax != null ? S.mayorTax : CC.TAX.base;
  Object.keys(S.laws).forEach(function (k) { var L = CC.TAX.laws[k]; if (L && L.rate) r += L.rate; });
  return CC.clamp(r, .05, .45);
};
CC.auditRisk = function () { var a = .01; Object.keys(S.laws).forEach(function (k) { var L = CC.TAX.laws[k]; if (L) a += L.audit || 0; }); if (S.office === "mayor") a *= .5; return a; };

/* ---------------- shop economics ($ per real minute) ---------------- */
CC.shopRent = function (sh) {
  var D = distById(sh.dist) || CC.DIST[0];
  var r = 6 * SIZE_MULT[sh.size] * (D.rent || 1) * Math.pow(1.25, sh.city);
  if (S.laws.enterprise && (sh.dist === "campus" || sh.dist === "old")) r *= .7;
  if (sh.lot && S.realty[sh.lot]) r = 0; // you own the building
  return r;
};
CC.shopEcon = function (sh, here) {
  var D = distById(sh.dist) || CC.DIST[0], I = CC.IND[sh.ind];
  var open = CC.open();
  var cityM = Math.pow(1.6, sh.city);
  var demand = 9 * SIZE_MULT[sh.size] * CC.curve(D) * (D.demand || 1) * (.55 + .15 * sh.rep) * CC.famMult() * CC.custMult() * (1 + .04 * sh.decor) * (S.rezoned[sh.dist] ? 1.2 : 1);
  if (sh.rival) demand *= .45 + .55 * (60 / (60 + sh.rival.S));
  var priceT = [.85, 1, 1.22, 1.5][sh.price || 0], demT = [1.16, 1, .84, .66][sh.price || 0];
  demand *= demT;
  var avg = 0; I.items.forEach(function (it) { avg += it[1]; }); avg /= I.items.length;
  var cap = 4 + sh.staff * 5 * (1 + .06 * U("training")) + (here ? 12 : 0);
  var served = Math.min(demand, cap);
  var rev = served * avg * I.base * priceT * CC.priceMult() * (D.price || 1) * cityM * (1 + .08 * sh.lvl);
  var cost = rev * .3 * CC.costMult() + sh.staff * 4 * cityM + CC.shopRent(sh);
  var running = open && (here || sh.mgr);
  return { demand: demand, served: served, rev: running ? rev : 0, cost: running ? cost : CC.shopRent(sh), net: running ? rev - cost : -CC.shopRent(sh), running: running, open: open, avg: avg * priceT * CC.priceMult() * (D.price || 1) * cityM };
};
CC.shopValue = function (sh) { var e = CC.shopEcon(sh, false); return Math.max(2000, (e.rev - e.cost + CC.shopRent(sh)) * 60 * 8 + SIZE_COST[sh.size] * 1.5 + 3000); };

/* ---------------- superstore ---------------- */
CC.supStats = function () {
  var sp = S.sup; if (!sp) return null;
  var rev = 0, comfort = 0, decor = 0, counters = 0, floors = 1;
  sp.items.forEach(function (it) {
    var d = CC.DEPT[it.k]; if (!d) return;
    rev += (d.rev || 0) * (1 + .15 * (it.lvl || 0)); comfort += d.comfort || 0; decor += d.decor || 0; if (d.rev) counters++; if (d.floor) floors++;
  });
  var parking = 80 + (sp.garage || 0) * CC.GARAGE.perLevel;
  var want = 50 + counters * 24;
  var traffic = Math.min(1.15, parking / want);
  var comfortF = Math.min(1.25, .55 + comfort / Math.max(1, counters) * .35);
  var decorF = 1 + Math.min(.6, decor * .04);
  var D = distById(sp.dist) || CC.DIST[0];
  var mult = traffic * comfortF * decorF * CC.curve(D) * CC.famMult() * CC.custMult() * CC.priceMult() * Math.pow(1.6, sp.city);
  var gross = CC.open() ? rev * mult : 0;
  var cost = gross * .38 * CC.costMult() + counters * 18 + (sp.garage || 0) * 25;
  return { gross: gross, cost: cost, net: gross - cost, parking: parking, want: want, traffic: traffic, comfort: comfortF, decor: decorF, counters: counters, floors: floors };
};
CC.deptCost = function (k) {
  var d = CC.DEPT[k], n = 0; if (S.sup) S.sup.items.forEach(function (it) { if (it.k === k) n++; });
  return Math.round(d.cost * Math.pow(1.35, n) * (S.laws.rd ? .9 : 1));
};

/* ---------------- trucks ---------------- */
CC.truckRate = function (t, crowd, rivalsNear) {
  if (!S.permits.truck) return 0;
  return CC.TRUCK.rate * (1 + .35 * t.lvl) * crowd * CC.famMult() * CC.priceMult() * Math.pow(1.6, S.city) / (1 + rivalsNear * .8);
};

/* ---------------- realty, rivals, buyouts ---------------- */
CC.lotPrice = function (lot) {
  var D = distById(lot.dist) || CC.DIST[0];
  return Math.round(12000 * Math.pow(D.rent || 1, 1.3) * Math.pow(1.6, S.city) * (lot.big ? 6 : 1) * (1 + S.lvl * .02));
};
CC.lotRent = function (lot) { return CC.lotPrice(lot) * .0045; }; // $/min collected when you own a building someone else uses
CC.rivalFor = function (key, ind, dist) {
  var r = S.rivals[key];
  if (!r) { var D = distById(dist) || CC.DIST[0]; r = S.rivals[key] = { name: CC.pick(CC.RIVALS[ind] || CC.RIVALS.coffee), ind: ind, S: Math.round(18 + S.lvl * .6 + (D.rent || 1) * 6), dist: dist }; }
  return r;
};
CC.buyoutPrice = function (r, lotKey) {
  var D = distById(r.dist) || CC.DIST[0];
  var p = 450 * Math.pow(r.S, 1.35) * (D.price || 1) * Math.pow(1.6, S.city);
  if (S.realty[lotKey]) p *= .6;            // you're their landlord
  if (S.office === "mayor") p *= .85;
  return Math.round(p);
};

/* ---------------- bank ---------------- */
CC.netWorth = function () {
  var w = S.cash + S.invest - S.loans;
  S.shops.forEach(function (sh) { w += CC.shopValue(sh); });
  Object.keys(S.realty).forEach(function (k) { w += S.realty[k].price || 0; });
  if (S.sup) w += S.sup.spent || 0;
  return w;
};
CC.creditLimit = function () { return Math.max(5000, CC.netWorth() * .5 - S.loans); };

/* ---------------- passive tick (real seconds) ---------------- */
CC.holdIncome = function () { var t = 0; Object.keys(S.hold || {}).forEach(function (k) { t += (HOLD_INC[k] || 60) * (S.hold[k] || 0); }); return t; };
CC.rentIncome = function () { var t = 0; Object.keys(S.realty).forEach(function (k) { if (!S.realty[k].self) t += S.realty[k].rent || 0; }); return t; };
CC.incomeNow = function (where) {
  var t = CC.holdIncome() + CC.rentIncome() + S.invest * .00002 * 60;
  S.shops.forEach(function (sh) { t += CC.shopEcon(sh, where && where.shop === sh.id).net; });
  var sp = CC.supStats(); if (sp) t += sp.net;
  t -= S.loans * .00004 * 60;
  return t;
};
// runs every frame; dt in real seconds. where = {shop:id} | {sup:1} | {truckOpen:[...]}
CC.tick = function (dt, where, truckIncome) {
  S.clock += dt; var newDay = false;
  if (S.clock >= CC.DAY_SEC) { S.clock -= CC.DAY_SEC; newDay = true; }
  var perMin = CC.incomeNow(where) + (truckIncome || 0);
  var gain = perMin * dt / 60;
  S.cash += gain; if (gain > 0) { S.stats.earned += gain; S.dayProfit = (S.dayProfit || 0) + gain; }
  S.invest *= 1 + .00002 * dt;
  S.influence += dt / 60 * (S.fame / 400) * (1 + .1 * U("lobbying")) * (S.office === "mayor" ? 3 : S.office === "council" ? 1.6 : 1);
  return newDay;
};
// end of an in-game day: taxes, audits, rivals move, city grows
CC.endDay = function () {
  var out = { lines: [] };
  var profit = Math.max(0, S.dayProfit || 0), rate = CC.taxRate(), tax = profit * rate;
  S.cash -= tax; S.stats.taxes += tax; out.tax = tax; out.rate = rate; out.profit = profit;
  out.lines.push("Taxes at " + Math.round(rate * 100) + "% on " + CC.fmt(profit) + " profit: " + CC.fmt(tax));
  if (Object.keys(S.laws).length && Math.random() < CC.auditRisk()) {
    var pen = tax * 1.5 + profit * .05; S.cash -= pen; S.fame = Math.max(0, S.fame - 40);
    out.lines.push("AUDIT: the tax office found problems. Penalty " + CC.fmt(pen) + " and some bad press.");
    out.audit = pen;
  }
  if (S.laws.charity) S.fame += profit * .0005;
  // rivals grow; owning their building squeezes them
  Object.keys(S.rivals).forEach(function (k) { var r = S.rivals[k]; r.S += S.realty[k] ? -2.5 : .8 + S.lvl * .02; r.S = Math.max(5, r.S); });
  // loan interest
  if (S.loans > 0) { var i = S.loans * .02; S.cash -= i; out.lines.push("Loan interest: " + CC.fmt(i)); }
  // the city expands as you grow
  var c = S.cities[S.city]; var want = Math.max(0, Math.floor((S.lvl - 12) / 4));
  if (want > (c.grow || 0)) { c.grow = want; out.grew = true; out.lines.push("The city is growing: a new district opened at the edge of town."); }
  S.dayProfit = 0; S.day++;
  return out;
};

/* ---------------- progression ---------------- */
CC.addXP = function (x, onLevel) { if (!(x > 0)) return; S.xp += x; while (S.xp >= CC.xpNeed(S.lvl)) { S.xp -= CC.xpNeed(S.lvl); S.lvl++; if (onLevel) onLevel(S.lvl); } };
CC.addFame = function (f) { S.fame = Math.max(0, S.fame + f * (f > 0 ? (1 + .05 * U("marketing")) * (S.laws.charity ? 1.2 : 1) : 1)); };
// active-play points → Lazer Points at end of day (idle income never earns points)
CC.addPts = function (p) { S.dayPts = (S.dayPts || 0) + p; S.pts += p; };

/* ---------------- offline ---------------- */
CC.offline = function () {
  var el = (Date.now() - (S.ts || Date.now())) / 1000; if (el < 90) return null;
  var capH = 4 + U("offline"); el = Math.min(el, capH * 3600);
  var eff = .3 + .06 * U("offline"), net = CC.holdIncome() + CC.rentIncome();
  S.shops.forEach(function (sh) { if (sh.mgr) net += Math.max(0, CC.shopEcon(sh, false).net); });
  var sp = CC.supStats(); if (sp) net += Math.max(0, sp.net);
  var gain = Math.max(0, net / 60 * el * eff); S.cash += gain; S.stats.passive += gain;
  return { sec: el, gain: gain };
};
})(window.CC);
