/* ============================================================================
   HEIST PLANNER — shared engine + levels + auto-solver.
   Loaded by the game page (index.html), the level maker (make.html) and the
   Node verification tests. No DOM access; safe as a classic script or require().
   ========================================================================== */
var HE = (function () {
  "use strict";
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];            // N E S W
  var DIRS = { N: 0, E: 1, S: 2, W: 3 };
  var WAIT = 4, ACT = 5;
  var ROLES = {
    G: { name: "Ghost", icon: "G", desc: "Quick hands. Grabs loot and keycards." },
    H: { name: "Hacker", icon: "H", desc: "Hacks terminals: kills cameras, lasers or locked doors." },
    C: { name: "Cracker", icon: "C", desc: "The only one who can crack a safe." },
    M: { name: "Muscle", icon: "M", desc: "Knocks out any guard he gets beside without being seen." }
  };
  var NEED = { T: 2, S: 3 };                              // action ticks: terminal, safe

  /* ------------------------------------------------------------ parse */
  function parse(L) {
    var rows = L.map, h = rows.length, w = rows[0].length;
    var M = { w: w, h: h, cell: [], items: [], itemAt: {}, exits: {}, starts: [], lasers: {}, doors: {}, nDoors: 0, roles: (L.crew || "G").split("") };
    for (var r = 0; r < h; r++) for (var c = 0; c < w; c++) {
      var ch = rows[r][c] || "#", i = r * w + c, t = ".";
      if (ch === "#") t = "#";
      else if (ch === ",") t = ",";
      else if (ch === "E") M.exits[i] = 1;
      else if (ch === "L") M.lasers[i] = 1;
      else if (ch === "D") { M.doors[i] = 1; M.nDoors++; }
      else if (ch >= "1" && ch <= "4") M.starts[+ch - 1] = { c: c, r: r };
      else if ("$*KTS".indexOf(ch) >= 0) {
        var it = { k: ch, c: c, r: r, id: M.items.length };
        if (ch === "T") { var tc = (L.term || {})[c + "," + r] || L.termAll || { fx: "cams", dur: 12 }; it.fx = tc.fx; it.dur = tc.dur || 0; }
        M.items.push(it); M.itemAt[i] = it;
      }
      M.cell.push(t);
    }
    M.starts = M.starts.filter(Boolean);
    M.required = M.items.filter(function (it) { return it.k === "*" || it.k === "S"; }).map(function (it) { return it.id; });
    M.bonus = M.items.filter(function (it) { return it.k === "$"; }).map(function (it) { return it.id; });
    M.guards = (L.guards || []).map(function (g) { return expandGuard(M, g); });
    M.cams = (L.cams || []).map(function (k) {
      return { c: k.c, r: k.r, dirs: k.dirs.split("").map(function (d) { return DIRS[d]; }), hold: k.hold || 4, range: k.range || 4, phase: k.phase || 0 };
    });
    M.laser = L.laser || { on: 3, off: 3, phase: 0 };
    M.maxT = L.maxT || 260;
    return M;
  }
  function idx(M, c, r) { return r * M.w + c; }
  function inB(M, c, r) { return c >= 0 && r >= 0 && c < M.w && r < M.h; }
  function isWall(M, c, r) { return !inB(M, c, r) || M.cell[idx(M, c, r)] === "#"; }
  function blocks(M, c, r, doorsOpen) { return isWall(M, c, r) || (!doorsOpen && M.doors[idx(M, c, r)]); }

  // BFS on tiles (walls only, doors passable) — used for guard routes and tap routing
  function bfs(M, sc, sr, tc, tr, avoidDoors) {
    if (sc === tc && sr === tr) return [];
    var prev = {}, q = [[sc, sr]], seen = {}; seen[idx(M, sc, sr)] = 1;
    while (q.length) {
      var p = q.shift();
      for (var d = 0; d < 4; d++) {
        var nc = p[0] + DX[d], nr = p[1] + DY[d], ni = idx(M, nc, nr);
        if (isWall(M, nc, nr) || seen[ni] || (avoidDoors && M.doors[ni])) continue;
        seen[ni] = 1; prev[ni] = { i: idx(M, p[0], p[1]), d: d };
        if (nc === tc && nr === tr) {
          var out = [], k = ni, s = idx(M, sc, sr);
          while (k !== s) { out.unshift(prev[k].d); k = prev[k].i; }
          return out;
        }
        q.push([nc, nr]);
      }
    }
    return null;
  }

  /* guard patrol → per-tick schedule [{c,r,f}] (cyclic) */
  function expandGuard(M, g) {
    var pts = g.route.map(function (p) { return { c: p[0], r: p[1], pause: p[2] || 0, look: p[3] != null ? DIRS[p[3]] : null }; });
    var loop = pts;
    if (g.ping && pts.length > 1) loop = pts.concat(pts.slice(1, -1).reverse().map(function (p) { return { c: p.c, r: p.r, pause: 0, look: null }; }));
    // ping-pong: end points get their pause once each lap, middle points pass through
    var step = g.step || 1, seq = [], f = null, n = loop.length;
    if (n > 1) { var first = bfs(M, loop[0].c, loop[0].r, loop[1].c, loop[1].r); f = first && first.length ? first[0] : 2; }
    else f = loop[0].look != null ? loop[0].look : 2;
    for (var i = 0; i < n; i++) {
      var a = loop[i], b = loop[(i + 1) % n];
      var lf = a.look != null ? a.look : f;
      for (var k = 0; k < a.pause; k++) seq.push({ c: a.c, r: a.r, f: lf });
      if (a.look != null) f = a.look;
      if (n === 1) break;
      var path = bfs(M, a.c, a.r, b.c, b.r) || [], c = a.c, r = a.r;
      for (var j = 0; j < path.length; j++) {
        c += DX[path[j]]; r += DY[path[j]]; f = path[j];
        for (var s = 0; s < step; s++) seq.push({ c: c, r: r, f: f });
      }
    }
    if (!seq.length) seq.push({ c: loop[0].c, r: loop[0].r, f: f });
    // rotate so tick 0 is the first waypoint, standing still facing its next move
    var off = g.offset || 0;
    return { seq: seq, range: g.range || 4, off: off, name: g.name || "Guard" };
  }
  function guardAt(G, t) { var s = G.seq; return s[((t + G.off) % s.length + s.length) % s.length]; }

  /* ------------------------------------------------------------ vision */
  var visCache = {};
  function los(M, x0, y0, x1, y1, doorsOpen) {
    // supercover-ish sampling between centres, ignoring the two end tiles
    var dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy)) * 4;
    for (var i = 1; i < n; i++) {
      var x = x0 + 0.5 + dx * i / n, y = y0 + 0.5 + dy * i / n;
      var c = Math.floor(x), r = Math.floor(y);
      if ((c === x0 && r === y0) || (c === x1 && r === y1)) continue;
      if (blocks(M, c, r, doorsOpen)) return false;
      // corner squeeze: block if both orthogonal neighbours at a diagonal crossing are walls
    }
    return true;
  }
  // tiles seen from (c,r) facing f; kind 'g' guard, 'c' camera
  function vision(M, c, r, f, range, kind, doorsOpen) {
    var key = M.uid + "|" + c + "," + r + "," + f + "," + range + kind + (doorsOpen ? 1 : 0);
    var v = visCache[key]; if (v) return v;
    v = {};
    var px = DX[(f + 1) % 4], py = DY[(f + 1) % 4];
    for (var d = 1; d <= range; d++) {
      var lat = kind === "g" ? Math.floor(d / 2) : Math.floor((d + 1) / 2);
      for (var l = -lat; l <= lat; l++) {
        var tc = c + DX[f] * d + px * l, tr = r + DY[f] * d + py * l;
        if (!inB(M, tc, tr) || blocks(M, tc, tr, doorsOpen)) continue;
        if (!los(M, c, r, tc, tr, doorsOpen)) continue;
        v[idx(M, tc, tr)] = d;
      }
    }
    visCache[key] = v; return v;
  }
  var uidN = 0;
  function prep(L) { var M = parse(L); M.uid = ++uidN; return M; }

  function camDir(K, t) { return K.dirs[Math.floor((t + K.phase) / K.hold) % K.dirs.length]; }
  function laserOn(M, t) { var L = M.laser, p = L.on + L.off; return ((t + (L.phase || 0)) % p + p) % p < L.on; }

  // is tile i (c,r) seen at tick t? returns spotter descriptor or null
  function spotted(M, t, c, r, W) {
    var i = idx(M, c, r), shadow = M.cell[i] === ",";
    for (var g = 0; g < M.guards.length; g++) {
      if (W.ko[g]) continue;
      var p = W.gpos[g];
      var vs = vision(M, p.c, p.r, p.f, M.guards[g].range, "g", W.doors);
      var d = vs[i];
      if (d && (!shadow || d <= 1)) return { kind: "guard", n: g, c: p.c, r: p.r };
    }
    if (!W.camsOff) for (var k = 0; k < M.cams.length; k++) {
      var K = M.cams[k], cf = camDir(K, t);
      var cv = vision(M, K.c, K.r, cf, K.range, "c", W.doors);
      if (cv[i] && !shadow) return { kind: "camera", n: k, c: K.c, r: K.r };
    }
    if (M.lasers[i] && !W.lasersOff && laserOn(M, t)) return { kind: "laser", c: c, r: r };
    return null;
  }

  /* ------------------------------------------------------------ simulate
     plans: array (per crew) of step codes 0-3 move, 4 wait, 5 action; null = crew absent
     opts.until: keep the world running to this tick even after the crew are done
     returns { frames, result }                                                   */
  function simulate(M, plans, opts) {
    opts = opts || {};
    var until = opts.until || 0, maxT = Math.max(M.maxT, until);
    var crew = M.starts.map(function (s, i) {
      return { c: s.c, r: s.r, pc: s.c, pr: s.r, role: M.roles[i] || "G", pi: 0, prog: 0, st: plans[i] ? "go" : "absent", f: 2, carry: 0 };
    });
    var taken = M.items.map(function () { return -1; });       // tick taken / crew
    var takenBy = M.items.map(function () { return -1; });
    var W = { doors: !M.nDoors, camsOffUntil: -1, lasersOffUntil: -1, ko: M.guards.map(function () { return 0; }), gpos: [], camsOff: false, lasersOff: false };
    var frames = [], events = [], result = null, kos = 0;
    function snap(t) {
      return {
        t: t, crew: crew.map(function (k) { return { c: k.c, r: k.r, st: k.st, f: k.f, prog: k.prog, act: k.act || 0, pi: k.pi, bl: k.blocked || 0, mv: (k.c !== k.pc || k.r !== k.pr) ? 1 : 0 }; }),
        lasersArmed: laserOn(M, t) && !W.lasersOff,
        guards: W.gpos.map(function (p, g) { return { c: p.c, r: p.r, f: p.f, ko: W.ko[g] }; }),
        cams: M.cams.map(function (K) { return camDir(K, t); }),
        camsOff: W.camsOff, lasersOff: W.lasersOff, laserOn: laserOn(M, t), doors: W.doors, taken: taken.slice()
      };
    }
    function world(t) {
      W.gpos = M.guards.map(function (G, g) { return W.ko[g] ? (W.gpos[g] || guardAt(G, t)) : guardAt(G, t); });
      W.camsOff = t < W.camsOffUntil; W.lasersOff = t < W.lasersOffUntil;
    }
    function pickup(k, ci, t) {
      var it = M.itemAt[idx(M, k.c, k.r)];
      if (!it || taken[it.id] >= 0) return;
      if (it.k === "$" || it.k === "*" || it.k === "K") {
        taken[it.id] = t; takenBy[it.id] = ci;
        events.push({ t: t, e: it.k === "K" ? "key" : "loot", ci: ci, id: it.id });
        if (it.k === "K") { W.doors = true; events.push({ t: t, e: "doors" }); }
      }
    }
    function check(t) {
      for (var ci = 0; ci < crew.length; ci++) {
        var k = crew[ci]; if (k.st !== "go" && k.st !== "idle") continue;
        // collision / swap with a guard
        for (var g = 0; g < M.guards.length; g++) {
          if (W.ko[g]) continue;
          var p = W.gpos[g], pp = t > 0 ? (W.ko[g] ? p : guardAt(M.guards[g], t - 1)) : p;
          if ((p.c === k.c && p.r === k.r) || (p.c === k.pc && p.r === k.pr && pp.c === k.c && pp.r === k.r))
            return { ci: ci, by: { kind: "guard", n: g, c: p.c, r: p.r, bump: true } };
        }
        var s = spotted(M, t, k.c, k.r, W);
        if (s) return { ci: ci, by: s };
      }
      return null;
    }
    world(0);
    for (var ci0 = 0; ci0 < crew.length; ci0++) if (crew[ci0].st === "go" && !plans[ci0].length) crew[ci0].st = M.exits[idx(M, crew[ci0].c, crew[ci0].r)] ? "out" : "idle";
    var c0 = check(0);
    frames.push(snap(0));
    var firstHit = null;
    if (c0) { if (opts.cont) firstHit = { ok: false, t: 0, reason: "spotted", ci: c0.ci, by: c0.by }; else result = { ok: false, t: 0, reason: "spotted", ci: c0.ci, by: c0.by }; }
    for (var t = 1; !result && t <= maxT; t++) {
      // 1. crew act
      for (var ci = 0; ci < crew.length; ci++) {
        var k = crew[ci]; k.pc = k.c; k.pr = k.r; k.act = 0;
        if (k.st !== "go") continue;
        var plan = plans[ci], code = plan[k.pi];
        if (code < 4) {
          var nc = k.c + DX[code], nr = k.r + DY[code];
          k.f = code;
          if (isWall(M, nc, nr)) { k.pi++; }
          else if (!W.doors && M.doors[idx(M, nc, nr)]) { k.blocked = 1; /* wait at the door, retry */ }
          else { k.c = nc; k.r = nr; k.pi++; k.prog = 0; k.blocked = 0; }
        } else if (code === ACT) {
          k.pi++;
          var it = M.itemAt[idx(M, k.c, k.r)];
          if (it && taken[it.id] < 0 && ((it.k === "T" && k.role === "H") || (it.k === "S" && k.role === "C"))) {
            k.prog++; k.act = 1;
            if (k.prog >= NEED[it.k]) {
              taken[it.id] = t; takenBy[it.id] = ci; k.prog = 0;
              if (it.k === "S") events.push({ t: t, e: "crack", ci: ci, id: it.id });
              else {
                events.push({ t: t, e: "hack", ci: ci, id: it.id, fx: it.fx });
                if (it.fx === "cams") W.camsOffUntil = t + it.dur;
                else if (it.fx === "lasers") W.lasersOffUntil = t + it.dur;
                else if (it.fx === "doors") { W.doors = true; events.push({ t: t, e: "doors" }); }
              }
            }
          }
        } else { k.pi++; }
        pickup(k, ci, t);
        if (k.pi >= plan.length) {
          if (M.exits[idx(M, k.c, k.r)]) { k.st = "out"; events.push({ t: t, e: "out", ci: ci }); }
          else k.st = "idle";
        }
      }
      // 2. world moves
      world(t);
      // 3. muscle takedowns (beside or behind an unaware guard)
      for (var m = 0; m < crew.length; m++) {
        var mk = crew[m]; if (mk.role !== "M" || (mk.st !== "go" && mk.st !== "idle")) continue;
        for (var g = 0; g < M.guards.length; g++) {
          if (W.ko[g]) continue;
          var gp = W.gpos[g];
          if (Math.abs(gp.c - mk.c) + Math.abs(gp.r - mk.r) !== 1) continue;
          var vs = vision(M, gp.c, gp.r, gp.f, M.guards[g].range, "g", W.doors);
          if (vs[idx(M, mk.c, mk.r)]) continue;
          W.ko[g] = t; kos++; events.push({ t: t, e: "ko", ci: m, g: g });
        }
      }
      // 4. detection
      var hit = check(t);
      frames.push(snap(t));
      if (hit) {
        var hr = { ok: false, t: t, reason: "spotted", ci: hit.ci, by: hit.by };
        if (!opts.cont) { result = hr; break; }
        if (!firstHit) firstHit = hr;
      }
      var active = crew.some(function (k) { return k.st === "go"; });
      if (!active && !until) break;
      if (!active && t >= until) break;
    }
    var endT = frames[frames.length - 1].t, doneAt = endT;
    for (var fi = 0; fi < frames.length; fi++) if (!frames[fi].crew.some(function (k) { return k.st === "go"; })) { doneAt = frames[fi].t; break; }
    if (!result && firstHit && firstHit.t <= doneAt) result = firstHit;
    if (!result) {
      var lastOut = 0;
      events.forEach(function (e) { if (e.e === "out") lastOut = Math.max(lastOut, e.t); });
      endT = doneAt;
      var stuck = crew.map(function (k, i) { return k.st === "go" ? i : -1; }).filter(function (i) { return i >= 0; });
      var idle = crew.map(function (k, i) { return k.st === "idle" ? i : -1; }).filter(function (i) { return i >= 0; });
      var missing = M.required.filter(function (id) { return taken[id] < 0; });
      if (stuck.length) result = { ok: false, t: endT, reason: "timeout", ci: stuck[0] };
      else if (idle.length) result = { ok: false, t: endT, reason: "stranded", ci: idle[0] };
      else if (missing.length) result = { ok: false, t: endT, reason: "missing", id: missing[0] };
      else result = { ok: true, t: lastOut };
    }
    var fEnd = frames[Math.min(result.t, frames.length - 1)].taken;
    result.bonus = M.bonus.filter(function (id) { return fEnd[id] >= 0 && fEnd[id] <= result.t; }).length;
    result.kos = events.filter(function (e) { return e.e === "ko" && e.t <= result.t; }).length;
    return { frames: frames, events: events, result: result };
  }

  /* ------------------------------------------------------------ scoring */
  function score(L, M, res) {
    if (!res.ok) return null;
    var base = 2000, bonus = res.bonus * 800, par = L.par;
    var under = res.t <= par, speed = Math.max(0, par - res.t) * 40 + (under ? 900 : 0);
    var ko = res.kos * 250;
    var total = Math.max(0, base + bonus + speed - ko);
    var stars = 1 + (res.bonus >= M.bonus.length ? 1 : 0) + (under ? 1 : 0);
    return { total: total, stars: stars, base: base, bonus: bonus, speed: speed, ko: ko, under: under };
  }

  /* ------------------------------------------------------------ plan helpers */
  // "R3D2w4a3" → codes. U/R/D/L moves, w wait, a action; trailing digits repeat.
  function P(s) {
    var out = [], m, re = /([URDLwa])(\d*)/g, map = { U: 0, R: 1, D: 2, L: 3, w: WAIT, a: ACT };
    while ((m = re.exec(s))) { var n = m[2] ? +m[2] : 1; for (var i = 0; i < n; i++) out.push(map[m[1]]); }
    return out;
  }
  function S(codes) {
    var ch = "URDLwa", out = "", i = 0;
    while (i < codes.length) { var j = i; while (j < codes.length && codes[j] === codes[i]) j++; out += ch[codes[i]] + (j - i > 1 ? j - i : ""); i = j; }
    return out;
  }
  function planEnd(M, ci, plan) {
    var s = M.starts[ci], c = s.c, r = s.r;
    for (var i = 0; i < plan.length; i++) if (plan[i] < 4) { var nc = c + DX[plan[i]], nr = r + DY[plan[i]]; if (!isWall(M, nc, nr)) { c = nc; r = nr; } }
    return { c: c, r: r };
  }

  /* ------------------------------------------------------------ solver
     BFS for one crew member against a fixed world (other crews' plans fixed).
     need: item ids this crew must take/finish before escaping.
     Returns step codes or null.                                               */
  function solve(M, plans, ci, need, maxT, opt) {
    opt = opt || {};
    maxT = maxT || 140;
    var others = plans.map(function (p, i) { return i === ci ? null : p; });
    var base = simulate(M, others, { until: maxT + 2 });
    var F = base.frames;
    if (base.result && !base.result.ok && base.result.reason === "spotted") return null;
    function frameAt(t) { return F[Math.min(t, F.length - 1)]; }
    var role = M.roles[ci], start = M.starts[ci];
    var needMask = 0; need.forEach(function (id) { needMask |= 1 << id; });
    var interest = M.items.filter(function (it) {
      if (it.k === "$" || it.k === "*" || it.k === "K") return true;
      return (it.k === "T" && role === "H") || (it.k === "S" && role === "C");
    });
    function wAt(t, mask, hk, ko) {
      var f = frameAt(t);
      var W = { doors: f.doors, camsOff: f.camsOff, lasersOff: f.lasersOff, ko: [], gpos: [] };
      for (var g = 0; g < M.guards.length; g++) {
        var kod = f.guards[g].ko || (ko >> g & 1);
        W.ko.push(kod);
        W.gpos.push(kod && f.guards[g].ko ? f.guards[g] : guardAt(M.guards[g], t));
      }
      for (var j = 0; j < M.items.length; j++) {
        if (!(mask >> j & 1)) continue;
        var it = M.items[j];
        if (it.k === "K") W.doors = true;
        if (it.k === "T") {
          if (it.fx === "doors") W.doors = true;
          else if (it.fx === "cams" && t < hk + it.dur) W.camsOff = true;
          else if (it.fx === "lasers" && t < hk + it.dur) W.lasersOff = true;
        }
      }
      return W;
    }
    function safe(t, c, r, pc, pr, W) {
      for (var g = 0; g < M.guards.length; g++) {
        if (W.ko[g]) continue;
        var p = W.gpos[g], pp = guardAt(M.guards[g], t - 1);
        if ((p.c === c && p.r === r) || (p.c === pc && p.r === pr && pp.c === c && pp.r === r)) return false;
      }
      return !spotted(M, t, c, r, W);
    }
    function takeAt(c, r, mask, t) {
      var it = M.itemAt[idx(M, c, r)];
      if (it && (it.k === "$" || it.k === "*" || it.k === "K") && !(mask >> it.id & 1) && frameAt(t).taken[it.id] < 0) mask |= 1 << it.id;
      return mask;
    }
    function doKO(t, c, r, W, ko) {
      if (role !== "M") return ko;
      for (var g = 0; g < M.guards.length; g++) {
        if (W.ko[g]) continue;
        var p = W.gpos[g];
        if (Math.abs(p.c - c) + Math.abs(p.r - r) !== 1) continue;
        if (vision(M, p.c, p.r, p.f, M.guards[g].range, "g", W.doors)[idx(M, c, r)]) continue;
        ko |= 1 << g;
      }
      return ko;
    }
    var bonusMask = 0; if (opt.bonus) M.bonus.forEach(function (id) { bonusMask |= 1 << id; });
    var goalMask = needMask | bonusMask;
    var koNeed = 0; (opt.ko || []).forEach(function (g) { koNeed |= 1 << g; });
    var startW = wAt(0, 0, -99, 0);
    if (spotted(M, 0, start.c, start.r, startW)) return null;
    var layer = [{ c: start.c, r: start.r, mask: 0, hk: -99, ko: 0, prev: null, code: -1 }];
    for (var t = 0; t < maxT; t++) {
      var next = [], seen = {};
      for (var q = 0; q < layer.length; q++) {
        var s = layer[q];
        // move / wait
        for (var d = 0; d <= 4; d++) {
          var nc = s.c, nr = s.r;
          var ok = true;
          if (d < 4) {
            nc += DX[d]; nr += DY[d];
            if (isWall(M, nc, nr)) continue;
            var doorsOpenNow = frameAt(t).doors || (function () { for (var j = 0; j < M.items.length; j++) if ((s.mask >> j & 1) && (M.items[j].k === "K" || M.items[j].fx === "doors")) return true; return false; })();
            if (M.doors[idx(M, nc, nr)] && !doorsOpenNow) continue;
          }
          var t1 = t + 1, mask = takeAt(nc, nr, s.mask, t1);
          var Wn = wAt(t1, mask, s.hk, s.ko);
          var ko = doKO(t1, nc, nr, Wn, s.ko);
          if (ko !== s.ko) Wn = wAt(t1, mask, s.hk, ko);
          if (M.exits[idx(M, nc, nr)] && (mask & goalMask) === goalMask && (ko & koNeed) === koNeed && d < 4) {
            // stepping onto the exit with the plan ending here escapes before detection
            var path = [d], z = s; while (z.prev) { path.unshift(z.code); z = z.prev; }
            if (path.length && (s.code >= 0 || s.prev === null)) return path.filter(function (x) { return x >= 0; });
          }
          if (!safe(t1, nc, nr, s.c, s.r, Wn)) continue;
          var key = nc + "," + nr + "," + mask + "," + (s.hk > t1 - 40 ? s.hk : -99) + "," + ko;
          if (seen[key]) continue; seen[key] = 1;
          next.push({ c: nc, r: nr, mask: mask, hk: s.hk, ko: ko, prev: s, code: d });
        }
        // action (macro: NEED ticks standing still, safe each tick)
        var it = M.itemAt[idx(M, s.c, s.r)];
        if (it && ((it.k === "T" && role === "H") || (it.k === "S" && role === "C")) && !(s.mask >> it.id & 1) && frameAt(t).taken[it.id] < 0) {
          var n = NEED[it.k], good = true, st = s;
          for (var a = 1; a <= n && good; a++) {
            var ta = t + a, m2 = a === n ? (s.mask | 1 << it.id) : s.mask, hk2 = a === n ? ta : s.hk;
            var Wa = wAt(ta, m2, hk2, st.ko);
            var ko2 = doKO(ta, s.c, s.r, Wa, st.ko); if (ko2 !== st.ko) Wa = wAt(ta, m2, hk2, ko2);
            if (!safe(ta, s.c, s.r, s.c, s.r, Wa)) { good = false; break; }
            st = { c: s.c, r: s.r, mask: m2, hk: hk2, ko: ko2, prev: st, code: ACT, delay: true };
          }
          if (good) { st.t = t + n; (pending[t + n] = pending[t + n] || []).push(st); }
        }
      }
      var pend = pending[t + 1]; if (pend) { pend.forEach(function (p) { var key = p.c + "," + p.r + "," + p.mask + "," + p.hk + "," + p.ko; if (!seen[key]) { seen[key] = 1; next.push(p); } }); delete pending[t + 1]; }
      if (!next.length && !Object.keys(pending).length) return null;
      layer = next;
      if (layer.length > 60000) layer = layer.slice(0, 60000);
    }
    return null;
  }
  var pending = {};
  function solveWrap(M, plans, ci, need, maxT, opt) { pending = {}; var r = solve(M, plans, ci, need, maxT, opt); pending = {}; return r; }

  return {
    DX: DX, DY: DY, WAIT: WAIT, ACT: ACT, ROLES: ROLES, NEED: NEED,
    prep: prep, simulate: simulate, score: score, P: P, S: S, planEnd: planEnd, bfs: bfs,
    vision: vision, camDir: camDir, laserOn: laserOn, guardAt: guardAt, idx: idx, isWall: isWall, solve: solveWrap
  };
})();

var HP_LEVELS = [
 { id: "pawn1", prize: "ring", loc: "Pawn Shop", name: "First Job", crew: "G", par: 31,
   brief: "Lift the ring from the display case and walk out the back. One guard is pacing the shop floor. His red cone is what he can see.",
   tip: "Tap a tile to plot a route there. Tap the ring, then the exit, then hit PLAY.",
   map: ["###########",
         "#1........#",
         "#.........#",
         "#.###.###.#",
         "#.#.....#.#",
         "#.#..*..#.#",
         "#.#.....#.#",
         "#.###.###.#",
         "#.........#",
         "#E........#",
         "###########"],
   guards: [{ route: [[3, 8, 2, "E"], [8, 8, 2, "W"]], ping: true, step: 2, range: 4 }] },

 { id: "pawn2", prize: "gold watch", loc: "Pawn Shop", name: "Mind the Gap", crew: "G", par: 51,
   brief: "The safe room is across the main aisle, and a guard walks that aisle end to end. You'll have to wait for your moment.",
   tip: "Use WAIT to stand still for a tick. Drag the timeline to preview where the guard will be.",
   map: ["#############",
         "#1....#.....#",
         "#.....#..*..#",
         "#.....#.....#",
         "###.#####.###",
         "#...........#",
         "#...........#",
         "###.#####.###",
         "#E..........#",
         "#...........#",
         "#############"],
   guards: [{ route: [[1, 5, 1, "E"], [11, 5, 1, "W"]], ping: true, range: 5 }, { route: [[11, 6, 1, "W"], [1, 6, 1, "E"]], ping: true, range: 5 }] },

 { id: "pawn3", prize: "pearl necklace", loc: "Pawn Shop", name: "Shadow Play", crew: "G", par: 37,
   brief: "A ceiling camera sweeps the back room. Cameras can't see into the dark tiles, so use them to hide. Two bonus watches are lying around.",
   tip: "Dark hatched tiles are shadows. Cameras never see them, and guards only spot you there if they're right on top of you.",
   map: ["#############",
         "#1.,.....,.$#",
         "#..,.....,..#",
         "#..,..#..,..#",
         "#..,..*..,..#",
         "#$.,.....,..#",
         "#.........,E#",
         "#############"],
   cams: [{ c: 6, r: 3, dirs: "ESWN", hold: 3, range: 6 }],
   guards: [{ route: [[4, 6, 0], [8, 6, 0]], ping: true, step: 2, range: 3 }] },

 { id: "office1", prize: "prototype drive", loc: "Office Tower", name: "Keycard", crew: "G", par: 58,
   brief: "The server room is locked. A keycard sits on the desk in the guard's office. Grab it and every purple door in the building opens.",
   tip: "Plot a route through a locked door. Your crew waits at the door until it's open.",
   map: ["#############",
         "#1....#.....#",
         "#.....#..K..#",
         "#.....#.....#",
         "#.....##.####",
         "#...........#",
         "####D####...#",
         "#....,..#...#",
         "#.*..,..#...#",
         "#E...,..#...#",
         "#############"],
   guards: [{ route: [[8, 1, 2, "S"], [11, 1, 0], [11, 3, 2, "W"], [7, 3, 0]], range: 4 },
            { route: [[1, 5, 0], [11, 5, 2, "W"]], ping: true, step: 1, range: 4 }] },

 { id: "office2", prize: "merger files", loc: "Office Tower", name: "Laser Hall", crew: "G", par: 47,
   brief: "The executive corridor is crossed by laser beams that pulse on and off. Touch a live beam and the alarm trips.",
   tip: "Watch the beams blink on the timeline preview. Cross a red line only while it's dark.",
   map: ["#############",
         "#1..........#",
         "#...........#",
         "#####.#######",
         "#####L#######",
         "#####.#######",
         "#####L#######",
         "#####.#######",
         "#####L#####$#",
         "#....*.....L#",
         "#E..........#",
         "#############"],
   laser: { on: 2, off: 2, phase: 0 },
   guards: [{ route: [[1, 10, 1, "E"], [11, 10, 1, "W"]], ping: true, step: 2, range: 4 }] },

 { id: "office3", prize: "bearer bonds", loc: "Office Tower", name: "Inside Man", crew: "GH", par: 28,
   brief: "Meet the Hacker. The vault floor is wall-to-wall cameras. Have him hack the terminal to black them out, then send the Ghost through.",
   tip: "Switch crew with the tabs. Hacking takes 2 ticks on the terminal. The blackout lasts 14 ticks.",
   map: ["#############",
         "#1.........E#",
         "#...........#",
         "#####.#######",
         "#...........#",
         "#.....*.....#",
         "#...........#",
         "#####.#######",
         "#....T......#",
         "#..........2#",
         "#############"],
   term: { "5,8": { fx: "cams", dur: 14 } },
   cams: [{ c: 0, r: 5, dirs: "E", hold: 99, range: 12 }, { c: 12, r: 4, dirs: "W", hold: 99, range: 12 }, { c: 12, r: 6, dirs: "W", hold: 99, range: 12 }],
   guards: [] },

 { id: "museum1", prize: "crown", loc: "Museum", name: "After Hours", crew: "G", par: 50,
   brief: "Night guards walk the halls and stop to admire the art, and a third circles the crown display. Every stop is a window. Two small statues are a bonus.",
   tip: "A guard who stops still keeps looking where he faces. Move when he turns away.",
   map: ["###############",
         "#1...........$#",
         "#.###.###.###.#",
         "#.#.....#.....#",
         "#.#..*..#.###.#",
         "#.#.....#.....#",
         "#.###.###.###.#",
         "#$............#",
         "#E............#",
         "###############"],
   guards: [{ route: [[1, 7, 3, "E"], [13, 7, 3, "W"]], ping: true, range: 4 },
            { route: [[9, 1, 2, "S"], [9, 5, 2, "N"]], ping: true, range: 4 },
            { route: [[3, 3, 0], [7, 3, 0], [7, 5, 0], [3, 5, 0]], step: 2, range: 3, offset: 5 }] },

 { id: "museum2", prize: "jade idol", loc: "Museum", name: "The Muscle", crew: "M", par: 35,
   brief: "A guard stands watch at the gallery door, turning left and right. The Muscle can take him out if he gets beside him without being seen.",
   tip: "Muscle knocks out any guard he ends a tick next to, as long as the guard isn't looking at him. Takedowns cost a little score.",
   map: ["#############",
         "#1..........#",
         "#...........#",
         "######.######",
         "#$..........#",
         "#.....*....$#",
         "#...........#",
         "#E..........#",
         "#############"],
   guards: [{ route: [[6, 4, 4, "W"], [6, 4, 4, "S"], [6, 4, 4, "E"], [6, 4, 4, "S"]], range: 6 }] },

 { id: "museum3", prize: "crown jewels", loc: "Museum", name: "Back Door", crew: "HG", par: 59,
   brief: "The crown jewel room is sealed. The Hacker can pop the door locks from the security office while the Ghost waits nearby.",
   tip: "This terminal opens doors instead of killing cameras. Time the Ghost's walk to arrive just as it opens.",
   map: ["###############",
         "#1....#.......#",
         "#.....#...T...#",
         "#.....D.......#",
         "####.###.######",
         "#.............#",
         "#.............#",
         "######D########",
         "#.....,.,.....#",
         "#$.....*.....2#",
         "#E............#",
         "###############"],
   term: { "10,2": { fx: "doors" } },
   guards: [{ route: [[1, 5, 1, "E"], [13, 5, 1, "W"]], ping: true, range: 5 },
            { route: [[1, 8, 2, "E"], [13, 8, 2, "W"]], ping: true, step: 2, range: 4 },
            { route: [[8, 1, 0], [13, 1, 0], [13, 3, 0], [8, 3, 0]], range: 3 }] },

 { id: "bank1", prize: "cash", loc: "First National", name: "The Safe", crew: "C", par: 43,
   brief: "Meet the Cracker. The cash is in a safe, and cracking it takes 3 ticks of standing still. A camera swings across the vault.",
   tip: "Stand on the safe and tap CRACK. You must stay unseen for all 3 ticks.",
   map: ["#############",
         "#1..........#",
         "#...........#",
         "####.###.####",
         "#....,.,....#",
         "#.....S.....#",
         "#....,.,....#",
         "####.###.####",
         "#E..........#",
         "#############"],
   cams: [{ c: 0, r: 5, dirs: "ENN", hold: 3, range: 12 }],
   guards: [{ route: [[1, 4, 2, "E"], [11, 4, 0], [11, 6, 2, "W"], [1, 6, 0]], range: 5 }] },

 { id: "bank2", prize: "vault cash", loc: "First National", name: "Three's Company", crew: "HCG", par: 34,
   brief: "The vault is behind a laser grid, and there's a deposit box worth grabbing on the way. Hacker kills the lasers, Cracker opens the safe, Ghost lifts the bonus.",
   tip: "Plan one crew at a time. The timeline shows everyone, so you can see when the lasers go down.",
   map: ["###############",
         "#1.....2.....3#",
         "#.............#",
         "###T#######.###",
         "#.....LLL.....#",
         "#.....LLL.....#",
         "#.....LLL.....#",
         "#.....LLL...S.#",
         "#$....LLL.....#",
         "#E............#",
         "###############"],
   term: { "3,3": { fx: "lasers", dur: 16 } },
   laser: { on: 9, off: 1, phase: 0 },
   guards: [{ route: [[1, 2, 2, "E"], [13, 2, 2, "W"]], ping: true, range: 4 }] },

 { id: "bank3", prize: "blue diamond", loc: "First National", name: "Pillar Maze", crew: "G", par: 40,
   brief: "The lobby is a forest of marble pillars, with three guards on rounds. Use the pillars to break their line of sight.",
   tip: "Walls and pillars block vision. Hug them.",
   map: ["###############",
         "#1............#",
         "#.#.#.#.#.#.#.#",
         "#.............#",
         "#.#.#.#.#.#.#.#",
         "#......*......#",
         "#.#.#.#.#.#.#.#",
         "#.............#",
         "#.#.#.#.#.#.#.#",
         "#$...........E#",
         "###############"],
   guards: [{ route: [[1, 3, 0], [13, 3, 0], [13, 7, 0], [1, 7, 0]], range: 4 },
            { route: [[7, 1, 1, "S"], [7, 9, 1, "N"]], ping: true, step: 1, range: 4 },
            { route: [[13, 1, 0], [13, 9, 0], [1, 9, 0], [1, 1, 0]], step: 2, range: 3 }] },

 { id: "casino1", prize: "chip case", loc: "Golden Ace Casino", name: "High Roller", crew: "GM", par: 57,
   brief: "The count room is past the gaming floor, which has blinking cameras and a pit boss on patrol. The Muscle can clear the boss. The cameras you'll have to dodge.",
   tip: "A camera that points at a wall sees nothing. Scrub ahead to read when each one is blind.",
   map: ["###############",
         "#1...........2#",
         "#.............#",
         "#######.#######",
         "#.............#",
         "#..,..,.,..,..#",
         "#.............#",
         "#######.#######",
         "#$.....*.....$#",
         "#E...........E#",
         "###############"],
   cams: [{ c: 0, r: 4, dirs: "ENN", hold: 3, range: 14 }, { c: 14, r: 6, dirs: "WSS", hold: 3, phase: 6, range: 14 }],
   guards: [{ route: [[1, 5, 2, "E"], [13, 5, 2, "W"]], ping: true, range: 5 }] },

 { id: "casino2", prize: "casino vault", loc: "Golden Ace Casino", name: "Vault Approach", crew: "HCM", par: 53,
   brief: "The casino vault. Guards on the approach, cameras in the anteroom, and a safe at the end. Every crew member has a job.",
   tip: "If a plan almost works, drag the playhead to just before it goes wrong, tap TRIM, and replan from there.",
   map: ["###############",
         "#1.....2.....3#",
         "#E............#",
         "###.#######.###",
         "#.............#",
         "#..T.......,..#",
         "#.............#",
         "#######D#######",
         "#......,......#",
         "#......S......#",
         "#E............#",
         "###############"],
   term: { "3,5": { fx: "doors" } },
   cams: [{ c: 0, r: 8, dirs: "EN", hold: 4, range: 14 }],
   guards: [{ route: [[1, 4, 2, "E"], [13, 4, 0], [13, 6, 2, "W"], [1, 6, 0]], range: 4 },
            { route: [[7, 10, 3, "N"], [7, 10, 3, "E"], [7, 10, 3, "N"], [7, 10, 3, "W"]], range: 5 }],
   hint: { ko: { M: [1] } } },

 { id: "casino3", prize: "Ace diamonds", loc: "Golden Ace Casino", name: "The Big Score", crew: "GHCM", par: 80,
   brief: "Everything you've learned in one job: four specialists, a laser wall, blinking cameras, patrols and a guarded vault. Crack the safe, take the diamonds and get everyone out clean.",
   tip: "Take your time. Rerun as often as you like. Only the clean run counts.",
   map: ["###############",
         "#1...2...3...4#",
         "#E...........E#",
         "##.####T####.##",
         "#.............#",
         "#LLLLLLLLLLLLL#",
         "#.............#",
         "#######.#######",
         "#..,...S...,..#",
         "#$...........$#",
         "#E.....*.....E#",
         "###############"],
   term: { "7,3": { fx: "lasers", dur: 24 } },
   laser: { on: 5, off: 2, phase: 0 },
   cams: [{ c: 0, r: 9, dirs: "ENN", hold: 3, range: 6 }, { c: 14, r: 9, dirs: "WNN", hold: 3, phase: 3, range: 6 }],
   guards: [{ route: [[1, 4, 1, "E"], [13, 4, 1, "W"]], ping: true, range: 4 },
            { route: [[1, 6, 1, "E"], [13, 6, 1, "W"]], ping: true, range: 4, offset: 6 },
            { route: [[7, 9, 3, "W"], [7, 9, 3, "E"]], range: 5 }],
   hint: { ko: { M: [2] } } }
];

/* ---------------------------------------------------------------------------
   autoSolveHeist(L) — finds a verified winning plan (one per crew) for a level,
   used to generate an answer key and to prove a level is solvable before it is
   published. Returns { ok, plans:[codeString...], t, stars } or { ok:false }.
   Strategy: assign each crew the items its role must take (Hacker->terminals,
   Cracker->safes, Ghost->loot/keycards), search KO targets for Muscle, and
   solve crews in every order with fixpoint refinement (unsolved crews stay
   absent, never idle, so they don't sit in a guard's sightline).
   --------------------------------------------------------------------------- */
var autoSolveHeist = (function () {
  function perms(a){ if(a.length<=1) return [a]; var r=[]; a.forEach(function(x,i){ perms(a.slice(0,i).concat(a.slice(i+1))).forEach(function(p){ r.push([x].concat(p)); }); }); return r; }
  function subsets(a){ var r=[[]]; a.forEach(function(x){ r=r.concat(r.map(function(s){ return s.concat(x); })); }); return r; }
  return function autoSolveHeist(L, budget){
    var M=HE.prep(L), n=M.starts.length, roles=M.roles, G=M.guards.length, maxT=budget||300;
    var T=[],S=[],STAR=[],K=[];
    M.items.forEach(function(it,id){ var b={T:T,S:S,"*":STAR,K:K}; (b[it.k]||[]).push(id); });
    var firstRole={}; for(var i=0;i<n;i++) if(firstRole[roles[i]]==null) firstRole[roles[i]]=i;
    var needs=Array.from({length:n},function(){return [];});
    [["H",T],["C",S],["G",STAR.concat(K)]].forEach(function(p){ var ci=firstRole[p[0]]; if(ci!=null) p[1].forEach(function(id){ needs[ci].push(id); }); });
    if(firstRole["G"]==null){ var ci=firstRole["M"]!=null?firstRole["M"]:0; STAR.concat(K).forEach(function(id){ needs[ci].push(id); }); }
    var mCrews=[]; for(var j=0;j<n;j++) if(roles[j]==="M") mCrews.push(j);
    var koChoices = G<=3 ? subsets(Array.from({length:G},function(_,x){return x;}))
                         : [[]].concat(Array.from({length:G},function(_,x){return [x];})).concat([Array.from({length:G},function(_,x){return x;})]);
    function attempt(order,ko){
      var plans=new Array(n).fill(null);
      for(var round=0;round<5;round++){
        for(var oi=0;oi<order.length;oi++){
          var cc=order[oi], opt={};
          if(roles[cc]==="M"&&ko[cc]&&ko[cc].length) opt.ko=ko[cc];
          var codes=null; try{ codes=HE.solve(M,plans,cc,needs[cc],maxT,opt); }catch(e){}
          if(codes) plans[cc]=codes;
        }
        if(plans.every(function(p){return p&&p.length!==undefined;})){
          var res=HE.simulate(M,plans,{cont:false,until:maxT+20}).result;
          if(res&&res.ok) return {plans:plans,res:res};
        }
      }
      return null;
    }
    function koCombos(){
      if(!mCrews.length) return [{}];
      var combos=[{}];
      mCrews.forEach(function(cc){ var nc=[]; combos.forEach(function(b){ koChoices.forEach(function(kc){ var o=Object.assign({},b); o[cc]=kc; nc.push(o); }); }); combos=nc; });
      return combos;
    }
    var orders=perms(Array.from({length:n},function(_,x){return x;})), kcs=koCombos();
    for(var a=0;a<kcs.length;a++) for(var b=0;b<orders.length;b++){
      var r=attempt(orders[b],kcs[a]);
      if(r){ var sc=HE.score(L,M,r.res); return { ok:true, plans:r.plans.map(function(p){return HE.S(p);}), t:r.res.t, stars:sc?sc.stars:1 }; }
    }
    return { ok:false };
  };
})();

if (typeof module !== "undefined") module.exports = { HE: HE, HP_LEVELS: HP_LEVELS, autoSolveHeist: autoSolveHeist };
if (typeof window !== "undefined") { window.HE = HE; window.HP_LEVELS = HP_LEVELS; window.autoSolveHeist = autoSolveHeist; }
