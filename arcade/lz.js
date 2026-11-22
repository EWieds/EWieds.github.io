sessionStorage.setItem("prevPage", document.location.href); //for redirect after sign in
// Lazer Arcade shared SDK: accounts, saves, Lazer Points, leaderboards, play counts and feedback.
// Uses the same Firebase project and auth session as the rest of carzzyapps.com.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, runTransaction, increment, serverTimestamp, collection,
  addDoc, query, orderBy, limit, getDocs, getCountFromServer, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const CONFIG = {
  apiKey: "AIzaSyArTaxXErhHQZ07rwLIOI_qoWCQOyHF4A8",
  authDomain: "lazer-arcade.firebaseapp.com",
  projectId: "lazer-arcade",
  storageBucket: "lazer-arcade.firebasestorage.app"
};
const BASE = "/arcade/";
const USERNAME_RE = /^[^\/]{1,30}$/;
const SESSION_LP_CAP = 20000;
// Site-wide LP difficulty knob. Every game's LP is multiplied by this, so lower =
// harder to earn across the whole arcade. 1 = original rates; 0.6 ≈ 40% harder.
const LP_SCALE = 0.6;

const app = getApps().length ? getApp() : initializeApp(CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

/* ---------------- small helpers ---------------- */
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  raw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => Math.round(n || 0).toLocaleString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Never let a slow or blocked request stall a game.
const within = (p, ms, fallback) => Promise.race([p, sleep(ms).then(() => { if (fallback instanceof Error) throw fallback; return fallback; })]);

/* ---------------- catalog ---------------- */
let catalogP = null;
function catalog() {
  if (!catalogP) {
    catalogP = Promise.all([
      fetch(BASE + "games.json", { cache: "no-cache" }).then((r) => r.json()),
      fetch(BASE + "upcoming.json", { cache: "no-cache" }).then((r) => r.json()).catch(() => ({ items: [] }))
    ]).then(([g, u]) => {
      const d = new Date(), day = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      const all = g.games || [];
      // games still in early access stay off the arcade (reachable only by direct link) until their release day
      return { all, games: all.filter((x) => !x.released || x.released <= day), categories: g.categories || [], ratioNote: g.ratioNote || "", upcoming: u.items || [] };
    });
  }
  return catalogP;
}
async function gameInfo(id) { const c = await catalog(); return c.all.find((g) => g.id === id) || { id, name: id, ratio: 0.04 }; }
async function inEarlyAccess(id) { const g = await gameInfo(id); return !!(g.released && today() < g.released); }
async function toLP(id, raw) { const g = await gameInfo(id); return Math.max(0, Math.round((raw || 0) * (g.ratio || 0) * LP_SCALE)); }

/* ---------------- auth state ---------------- */
const state = { user: null, username: "", ready: false, listeners: new Set() };
let resolveReady;
const readyP = new Promise((r) => (resolveReady = r));

async function lookupUsername(user) {
  if (user.displayName && USERNAME_RE.test(user.displayName)) return user.displayName;
  try {
    const snap = await getDocs(query(collection(db, "usernames"), where("uid", "==", user.uid), limit(1)));
    if (!snap.empty) { const d = snap.docs[0]; return d.data().username || d.id; }
  } catch (e) {}
  return "";
}

onAuthStateChanged(auth, async (u) => {
  if (u && !u.isAnonymous) {
    state.user = u;
    state.username = (u.displayName && USERNAME_RE.test(u.displayName)) ? u.displayName : "";
    if (!state.username) state.username = (await within(lookupUsername(u), 4000, "")) || (u.email ? u.email.split("@")[0].slice(0, 20) : "Player");
  } else {
    state.user = null;
    state.username = "";
  }
  if (!state.ready) { state.ready = true; resolveReady(); }
  state.listeners.forEach((fn) => { try { fn(state.user, state.username); } catch (e) { console.error(e); } });
});
setTimeout(() => { if (!state.ready) { state.ready = true; resolveReady(); } }, 3000);

function onChange(fn) { state.listeners.add(fn); if (state.ready) fn(state.user, state.username); return () => state.listeners.delete(fn); }
// Any real (non-guest) Carzzy Apps session counts as signed in, even before its username has been looked up.
function signedIn() { return !!state.user; }

/* ---------------- play counts ---------------- */
const counted = new Set();
async function countPlay(id) {
  if (counted.has(id)) return; counted.add(id);
  try { await setDoc(doc(db, "arcadeStats", id), { plays: increment(1) }, { merge: true }); } catch (e) { console.warn("play count", e.code || e); }
}
async function plays(ids) {
  const out = {};
  await Promise.all(ids.map(async (id) => {
    try { const s = await getDoc(doc(db, "arcadeStats", id)); out[id] = s.exists() ? s.data().plays || 0 : 0; } catch (e) { out[id] = 0; }
  }));
  return out;
}

/* ---------------- saves ----------------
   Each game keeps its own browser save under opts.localKey. lz.owner.<id> records whose save that is
   ("guest" or a uid) so accounts never leak into each other on a shared browser. */
const games = {};
function ownerKey(id) { return "lz.owner." + id; }
function pendingAll() { return ls.get("lz.pending", {}); }
function setPending(p) { ls.set("lz.pending", p); }

async function cloudSave(id) {
  if (!signedIn()) return null;
  const sid = (games[id] && games[id].saveId) || id;
  try { const s = await within(getDoc(doc(db, "arcadeSaves", state.user.uid, "games", sid)), 4000, null); return s && s.exists() ? s.data() : null; } catch (e) { console.warn("cloud load", e.code || e); return null; }
}
async function writeCloud(id) {
  const g = games[id]; if (!g || !signedIn() || !lockOk()) return false;
  const data = ls.raw(g.localKey); if (!data) return false;
  try {
    await liveReady();
    if (!lockOk()) return false;
    await setDoc(doc(db, "arcadeSaves", state.user.uid, "games", g.saveId || id), {
      data, major: g.major, minor: g.minor || 0, progress: Number(g.progressOf(data)) || 0, liveTab: TAB, updatedAt: serverTimestamp()
    });
    g.dirty = false; return true;
  } catch (e) { console.warn("cloud save", e.code || e); return false; }
}

// Decide which save the game should load, syncing a guest save up to the account when it is the better one.
async function reconcile(id) {
  const g = games[id];
  const owner = ls.raw(ownerKey(id));
  const local = ls.raw(g.localKey);
  if (!signedIn()) {
    if (owner && owner !== "guest") { if (local) ls.set("lz.bak." + id, local); ls.del(g.localKey); }
    ls.set(ownerKey(id), "guest");
    return { changed: false };
  }
  const uid = state.user.uid;
  const cloud = await cloudSave(id);
  const cloudOk = cloud && cloud.major === g.major && typeof cloud.data === "string";
  let changed = false;
  if (owner === uid) {
    if (cloudOk && (!local || (cloud.progress || 0) > (Number(g.progressOf(local)) || 0))) { ls.set(g.localKey, cloud.data); changed = local !== cloud.data; }
    else if (local) g.dirty = true;
  } else if (owner && owner !== "guest") {
    if (local) ls.set("lz.bak." + id, local);
    if (cloudOk) ls.set(g.localKey, cloud.data); else ls.del(g.localKey);
    changed = true;
  } else {
    // guest (or never tagged) save on this browser: it syncs to the account if it is further along
    const lp = local ? Number(g.progressOf(local)) || 0 : -1;
    if (cloudOk && (cloud.progress || 0) >= lp) { if (local !== cloud.data) { ls.set(g.localKey, cloud.data); changed = true; } }
    else if (local) g.dirty = true;
  }
  ls.set(ownerKey(id), uid);
  if (g.dirty) await within(writeCloud(id), 4000, false);
  return { changed };
}


/* ---------------- one live game at a time ----------------
   Points, playtime and saves only count in the tab (and on the device) that most recently opened a game.
   Any older game tab is frozen behind a "playing somewhere else" screen: it can't earn, and it can't
   overwrite the live tab's save. Taking it back reloads it with the latest save. */
const TAB = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const lock = { game: null, held: true, unsub: null, confirmed: false, keys: new Set(), ackP: null };
// Game-point writes carry this tab's id; the database only accepts them from the live tab.
function liveStamp(out) { if (lock.game && lock.held) out.liveTab = TAB; return out; }
let bootedRes = null; const bootedP = new Promise((r) => { bootedRes = r; });
// On a game page, point-moving writes wait until this tab has claimed the live slot.
async function afterBoot() { if (window.LZ_GAME) await within(bootedP, 15000, null).catch(() => {}); }
async function liveReady() { if (lock.game && lock.ackP) await within(lock.ackP, 6000, null).catch(() => {}); }
let bc = null; try { bc = new BroadcastChannel("lz-play"); } catch (e) {}
function lockOk() { return !lock.game || lock.held; }
// Frozen tabs must not write game saves (they share localStorage with the live tab).
try {
  const realSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (this === window.localStorage && !lockOk() && (lock.keys.has(k) || String(k).startsWith("lz.prog."))) return;
    return realSet.call(this, k, v);
  };
} catch (e) {}
function claimLock(game) {
  lock.game = game; lock.held = true; lock.confirmed = false; hideLockScreen();
  const msg = { t: "claim", tab: TAB, game, at: Date.now() };
  try { if (bc) bc.postMessage(msg); } catch (e) {}
  ls.set("lz.play", msg);
  if (signedIn()) watchLive(game);
}
function loseLock() {
  if (!lock.game || !lock.held) return;
  try { flushTime(); } catch (e) {}
  lock.held = false;
  showLockScreen();
}
if (bc) bc.onmessage = (e) => { const m = e.data || {}; if (m.t === "claim" && m.tab !== TAB) loseLock(); };
window.addEventListener("storage", (e) => {
  if (e.key !== "lz.play" || !e.newValue) return;
  try { const m = JSON.parse(e.newValue); if (m.tab && m.tab !== TAB) loseLock(); } catch (_) {}
});
function watchLive(game) {
  if (lock.unsub) { try { lock.unsub(); } catch (e) {} lock.unsub = null; }
  const ref = doc(db, "arcadeLive", state.user.uid);
  lock.ackP = setDoc(ref, { tab: TAB, game: String(game).slice(0, 24), at: serverTimestamp() })
    .then(() => { lock.confirmed = true; }).catch(() => { lock.confirmed = false; });
  try {
    lock.unsub = onSnapshot(ref, (snap) => {
      if (!lock.confirmed || snap.metadata.hasPendingWrites) return;
      const d = snap.data(); if (d && d.tab && d.tab !== TAB) loseLock();
    }, () => {});
  } catch (e) {}
}
function showLockScreen() {
  let el = document.getElementById("lz-lock");
  if (!el) {
    el = document.createElement("div"); el.id = "lz-lock";
    el.style.cssText = "position:fixed;inset:0;z-index:2147483600;background:rgba(4,8,18,.94);display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#eef4ff;text-align:center";
    el.innerHTML = '<div style="max-width:380px"><div style="font:800 22px system-ui;letter-spacing:.5px;margin-bottom:8px">Playing somewhere else</div>' +
      '<div style="font:500 15px/1.5 system-ui;color:#b9c8e6;margin-bottom:18px">This game is open in another tab or on another device. Lazer Points and saves only count in one place at a time.</div>' +
      '<button id="lz-lock-go" style="font:700 16px system-ui;padding:13px 22px;border-radius:12px;border:0;background:#35e0ff;color:#03202c;cursor:pointer">Play here instead</button></div>';
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((t) => el.addEventListener(t, (e) => e.stopPropagation(), true));
    document.body.appendChild(el);
    el.querySelector("#lz-lock-go").onclick = () => { const g = lock.game; claimLock(g); location.reload(); };
  }
  el.style.display = "flex";
  try { document.activeElement && document.activeElement.blur(); } catch (e) {}
}
function hideLockScreen() { const el = document.getElementById("lz-lock"); if (el) el.style.display = "none"; }
// Swallow game input while frozen (capture phase, before the game's own handlers).
["keydown", "keyup", "pointerdown", "mousedown", "touchstart"].forEach((t) => window.addEventListener(t, (e) => {
  if (!lockOk() && !(e.target && e.target.closest && e.target.closest("#lz-lock"))) { e.stopImmediatePropagation(); e.preventDefault && t !== "touchstart" && e.preventDefault(); }
}, true));

async function boot(id, opts) {
  games[id] = Object.assign({ localKey: id, major: 1, minor: 0, progressOf: () => 0, dirty: false, timer: null }, opts || {});
  await Promise.race([readyP, sleep(3000)]);
  countPlay(id);
  lock.keys.add(games[id].localKey);
  claimLock(id);
  await liveReady();
  try { await within(reconcile(id), 6000, null); } catch (e) { console.warn("reconcile", e); }
  bootedRes();
  if (signedIn()) syncPending().catch(() => {});
  return { user: state.user, username: state.username };
}

function save(id) {
  const g = games[id]; if (!g || !lockOk()) return;
  g.dirty = true;
  if (!signedIn() || g.timer) return;
  g.timer = setTimeout(() => { g.timer = null; if (g.dirty) writeCloud(id); }, 12000);
}
function flush() { Object.keys(games).forEach((id) => { if (games[id].dirty && signedIn()) writeCloud(id); }); }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });

/* ---------------- Game of the Day, achievements, events ----------------
   Progress (which days you played, what you played, what you've unlocked or claimed) lives locally per owner
   and, when signed in, on your leaderboard row as "prog" so it follows the account. */
const today = (d) => { const x = d || new Date(); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
const dayNum = (s) => Math.round(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5);
let extrasP = null;
function extras() {
  if (!extrasP) extrasP = Promise.all([
    fetch(BASE + "events.json", { cache: "no-cache" }).then((r) => r.json()).catch(() => ({ events: [] })),
    fetch(BASE + "achievements.json", { cache: "no-cache" }).then((r) => r.json()).catch(() => ({ achievements: [] }))
  ]).then(([e, a]) => ({ gotd: e.gameOfTheDay || { multiplier: 2 }, events: e.events || [], achievements: a.achievements || [] }));
  return extrasP;
}
async function gameOfTheDay(day) {
  day = day || today();
  const [c, x] = await Promise.all([catalog(), extras()]);
  const live = c.games.filter((g) => !g.released || g.released <= day);
  if (!live.length) return null;
  const ov = (x.gotd.override || {})[day];
  if (ov && live.some((g) => g.id === ov)) return live.find((g) => g.id === ov);
  const fresh = live.filter((g) => g.released && dayNum(day) - dayNum(g.released) < (x.gotd.newGameDays || 7)).sort((a, b) => b.released.localeCompare(a.released));
  if (fresh.length) return fresh[0];
  const sorted = live.slice().sort((a, b) => a.id.localeCompare(b.id));
  return sorted[dayNum(day) % sorted.length];
}
async function multiplier(id) {
  const [g, x] = await Promise.all([gameOfTheDay(), extras()]);
  let m = g && g.id === id ? (x.gotd.multiplier || 2) : 1;
  activeEvents(x).forEach((e) => { if (e.multiplier && (!e.games || e.games.includes(id))) m *= e.multiplier; });
  return m;
}
function activeEvents(x, day) { day = day || today(); return x.events.filter((e) => e.start <= day && day <= e.end); }

function progKey() { return "lz.prog." + (state.user ? state.user.uid : "guest"); }
function blankProg() { return { days: {}, ach: {}, claims: {}, tBest: 0 }; }
function getProg() { return Object.assign(blankProg(), ls.get(progKey(), {})); }
function setProg(p) {
  const keys = Object.keys(p.days).sort(); if (keys.length > 400) keys.slice(0, keys.length - 400).forEach((k) => delete p.days[k]);
  ls.set(progKey(), p);
}
function mergeProg(a, b) {
  const out = blankProg();
  [a, b].forEach((p) => {
    if (!p) return;
    Object.entries(p.days || {}).forEach(([d, v]) => {
      const o = out.days[d] || { g: [], n: 0, lp: 0, t: 0 };
      out.days[d] = { g: Array.from(new Set(o.g.concat(v.g || []))), n: Math.max(o.n, v.n || 0), lp: Math.max(o.lp, v.lp || 0), t: Math.max(o.t, v.t || 0), sec: Math.max(o.sec || 0, v.sec || 0) };
    });
    out.tBest = Math.max(out.tBest || 0, p.tBest || 0);
    Object.assign(out.ach, p.ach || {}); Object.assign(out.claims, p.claims || {});
  });
  return out;
}
/* ---------------- achievement ledger ----------------
   The account's cloud prog.ach is the record of what has been PAID. Any unlock this device knows about
   that the cloud doesn't have yet is paid exactly once, inside the same write that records it.
   Bonuses bigger than one write's LP cap are paid in parts (prog.achPart) over several writes. */
let bonusMapP = null;
function bonusMap() {
  if (!bonusMapP) bonusMapP = extras().then((x) => {
    const m = {};
    x.achievements.forEach((a) => { m[a.id] = a.bonus || 0; });
    x.events.forEach((e) => (e.missions || []).forEach((mm) => { m["ev:" + e.id + ":" + mm.id] = mm.bonus || 0; }));
    return m;
  }).catch(() => { bonusMapP = null; return null; });
  return bonusMapP;
}
// Build the prog to write and how much achievement LP to pay now (never more than budget).
function ledger(cur, local, map, budget) {
  const cp = cur.prog || {}, prog = mergeProg(cp, local);
  const ach = Object.assign({}, cp.ach || {}), part = Object.assign({}, cp.achPart || {});
  let pay = 0, owe = 0; const paid = [];
  if (map) Object.keys(local.ach || {}).sort().forEach((k) => {
    if (ach[k] || !(k in map)) return;
    const need = Math.max(0, (map[k] || 0) - (part[k] || 0)), take = Math.min(need, Math.max(0, budget - pay));
    pay += take;
    if (take >= need) { ach[k] = local.ach[k]; delete part[k]; paid.push(k); } else { part[k] = (part[k] || 0) + take; owe += need - take; }
  });
  prog.ach = ach;
  if (Object.keys(part).length) prog.achPart = part;
  return { prog, pay, owe, paid };
}
function unpaidCount(row) {
  const have = (row && row.prog && row.prog.ach) || {}, loc = getProg().ach || {};
  return Object.keys(loc).filter((k) => !have[k]).length;
}
// Lifetime floors from the account row, so milestones count everything a player did before
// achievements (or this device) started tracking: total games finished, LP earned, games played.
function floors(ids) {
  const r = state.row; if (!r || !r.games) return {};
  let plays = 0, distinct = 0;
  Object.entries(r.games).forEach(([k, v]) => { if (k === "bonus" || !v) return; plays += v.plays || 0; if ((v.plays || 0) > 0 && (!ids || ids.has(k))) distinct++; });
  const bonus = (r.games.bonus && r.games.bonus.lp) || 0;
  return { sessions: plays, lpEarned: Math.max(0, (r.lp || 0) - bonus), allGames: distinct };
}
function measureF(type, days, target, n, ids) { return Math.max(measure(type, days, target, n), floors(ids)[type] || 0); }

// Pull the account's progress down (and fold in any guest progress from this device) once signed in.
async function syncProg() {
  if (!signedIn()) return getProg();
  const guest = ls.get("lz.prog.guest", null);
  let cloud = null;
  try { const s = await within(getDoc(doc(db, "arcadePlayers", state.user.uid)), 4000, null); if (s && s.exists()) { state.row = s.data(); cloud = state.row.prog; } } catch (e) {}
  const merged = mergeProg(mergeProg(getProg(), cloud), guest);
  setProg(merged); if (guest) ls.del("lz.prog.guest");
  return merged;
}

function measure(type, days, target, gameCount) {
  const list = Object.entries(days).filter(([, v]) => v.n > 0);
  switch (type) {
    case "sessions": return list.reduce((a, [, v]) => a + v.n, 0);
    case "daysPlayed": return list.length;
    case "lpEarned": return list.reduce((a, [, v]) => a + v.lp, 0);
    case "gotdDays": return list.filter(([, v]) => v.t).length;
    case "sessionsInDay": return list.reduce((a, [, v]) => Math.max(a, v.n), 0);
    case "lpInDay": return list.reduce((a, [, v]) => Math.max(a, v.lp), 0);
    case "distinctGamesInDay": return list.reduce((a, [, v]) => Math.max(a, v.g.length), 0);
    case "allGames": return new Set(list.flatMap(([, v]) => v.g)).size;
    case "playHours": return Math.floor(Object.values(days).reduce((a, v) => a + (v.sec || 0), 0) / 3600);
    case "streak": {
      const ns = list.map(([d]) => dayNum(d)).sort((a, b) => a - b); let best = 0, run = 0, prev = null;
      ns.forEach((n) => { run = prev !== null && n === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = n; });
      return best;
    }
  }
  return 0;
}
function windowDays(days, start, end) { const o = {}; Object.entries(days).forEach(([d, v]) => { if (d >= start && d <= end) o[d] = v; }); return o; }
async function progress() {
  const [x, c] = await Promise.all([extras(), catalog()]);
  const p = getProg(), n = c.games.length, ids = new Set(c.games.map((g) => g.id));
  const ach = x.achievements.map((a) => {
    const target = a.type === "allGames" ? n : a.target, have = measureF(a.type, p.days, target, n, ids);
    return Object.assign({}, a, { target, have: Math.min(have, target), done: !!p.ach[a.id], when: p.ach[a.id] || null });
  });
  const day = today();
  const events = x.events.filter((e) => e.end >= day).map((e) => {
    const w = windowDays(p.days, e.start, e.end);
    return Object.assign({}, e, {
      live: e.start <= day, daysLeft: dayNum(e.end) - dayNum(day), startsIn: dayNum(e.start) - dayNum(day),
      missions: (e.missions || []).map((m) => ({ ...m, have: Math.min(measure(m.type, w, m.target, n), m.target), done: !!p.ach["ev:" + e.id + ":" + m.id] })),
      doors: e.calendar ? e.calendar.doors.map((d, i) => ({ ...d, i, open: d.date <= day && day <= e.end, claimed: !!p.claims[e.id + ":" + i] })) : null
    });
  });
  return { achievements: ach, events, today: p.days[day] || { g: [], n: 0, lp: 0 } };
}
// Record a finished session and return any newly completed achievements and missions.
async function recordSession(id, lp, isGotd) {
  const [x, c] = await Promise.all([extras(), catalog()]);
  if (signedIn() && !state.row) await within(syncProg(), 4000, null).catch(() => {});
  const p = getProg(), d = today(), n = c.games.length, ids = new Set(c.games.map((g) => g.id));
  const o = p.days[d] || { g: [], n: 0, lp: 0, t: 0 };
  p.days[d] = { g: Array.from(new Set(o.g.concat(id))), n: o.n + 1, lp: o.lp + lp, t: o.t || (isGotd ? 1 : 0), sec: o.sec || 0 };
  const won = [];
  x.achievements.forEach((a) => {
    const target = a.type === "allGames" ? n : a.target;
    if (!p.ach[a.id] && measureF(a.type, p.days, target, n, ids) >= target) { p.ach[a.id] = d; won.push({ kind: "Achievement", name: a.name, bonus: a.bonus }); }
  });
  activeEvents(x, d).forEach((e) => (e.missions || []).forEach((m) => {
    const k = "ev:" + e.id + ":" + m.id;
    if (!p.ach[k] && measure(m.type, windowDays(p.days, e.start, e.end), m.target, n) >= m.target) { p.ach[k] = d; won.push({ kind: e.name, name: m.name, bonus: m.bonus }); }
  }));
  setProg(p);
  return won;
}
async function claimDoor(eventId, i) {
  const x = await extras(), e = x.events.find((v) => v.id === eventId), d = today();
  if (!e || !e.calendar) return 0;
  const door = e.calendar.doors[i], p = getProg(), k = eventId + ":" + i;
  if (!door || p.claims[k] || door.date > d || d > e.end) return 0;
  p.claims[k] = d; setProg(p);
  await creditBonus(door.bonus);
  return door.bonus;
}
async function creditBonus(lp) {
  const entry = { bonus: { lp, best: 0, plays: 0, last: 0 } };
  if (signedIn()) { try { await addToAccount(entry); return; } catch (e) { console.warn("bonus", e.code || e); } }
  stash("bonus", entry.bonus);
}

/* ---------------- Lazer Points ---------------- */
async function addToAccount(entries) {
  // entries: { gameId: { lp, best, plays, last } }
  await liveReady();
  const uid = state.user.uid, ref = doc(db, "arcadePlayers", uid), map = await bonusMap();
  let res = null;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const cur = snap.exists() ? snap.data() : { lp: 0, games: {} };
    const gm = Object.assign({}, cur.games || {});
    let add = 0, br = Math.max(0, Math.round(cur.bestRound || 0)), brg = typeof cur.bestRoundGame === "string" ? cur.bestRoundGame : "";
    Object.keys(entries).forEach((k) => {
      const rd = Math.min(SESSION_LP_CAP, Math.max(0, Math.round(entries[k].round || 0))); if (rd > br) { br = rd; brg = k; }
      const e = entries[k], o = Object.assign({ lp: 0, best: 0, plays: 0, last: 0 }, gm[k] || {});
      const lp = Math.min(SESSION_LP_CAP, Math.max(0, Math.round(e.lp || 0)));
      add += lp;
      const row = { lp: o.lp + lp, best: Math.max(o.best, Math.round(e.best || 0)), plays: o.plays + (e.plays || 0), last: Math.round(e.last || o.last || 0) };
      const held = Math.max(0, Math.round((o.ea || 0) + (e.eaLp || 0)));
      if (e.settle) { row.eaPaid = (o.eaPaid || 0) + lp; const left = Math.max(0, Math.round((o.ea || 0) - (e.eaUse || 0))); if (left) row.ea = left; } else if (held) row.ea = held;
      if (o.eaPaid && !row.eaPaid) row.eaPaid = o.eaPaid;
      gm[k] = row;
    });
    add = Math.min(add, SESSION_LP_CAP);
    const L = ledger(cur, getProg(), map, SESSION_LP_CAP - add);
    if (L.pay) { const b = Object.assign({ lp: 0, best: 0, plays: 0, last: 0 }, gm.bonus || {}); b.lp += L.pay; gm.bonus = b; add += L.pay; }
    const out = liveStamp(keepExtras(cur, { username: state.username, lp: (cur.lp || 0) + add, games: gm, prog: L.prog, updatedAt: serverTimestamp() }));
    if (br) { out.bestRound = br; out.bestRoundGame = brg.slice(0, 24); }
    out.timeTotal = progSeconds(out.prog); out.timeBest = Math.round((out.prog && out.prog.tBest) || 0);
    tx.set(ref, out);
    res = { pay: L.pay, owe: L.owe, paid: L.paid, row: out };
  });
  if (res) { state.row = res.row; if (res.owe > 0 || unpaidCount(res.row) > 0) scheduleOwed(); }
  return res;
}
// Keep paying an owed achievement backlog in capped chunks.
let owedT = null, owedN = 0;
function scheduleOwed() {
  if (owedT || owedN > 40) return;
  owedT = setTimeout(async () => { owedT = null; owedN++; try { if (signedIn() && lockOk()) await addToAccount({}); } catch (e) { console.warn("ach pay", e.code || e); } }, 1500);
}
// On sign-in: unlock anything already earned (lifetime totals count) and pay anything unpaid.
async function catchUp() {
  if (!signedIn()) return;
  try {
    await syncProg();
    const [x, c] = await Promise.all([extras(), catalog()]);
    const p = getProg(), d = today(), n = c.games.length, ids = new Set(c.games.map((g) => g.id)), won = [];
    x.achievements.forEach((a) => {
      const target = a.type === "allGames" ? n : a.target;
      if (!p.ach[a.id] && measureF(a.type, p.days, target, n, ids) >= target) { p.ach[a.id] = d; won.push(a); }
    });
    setProg(p);
    if (!unpaidCount(state.row)) return;
    let total = 0;
    for (let i = 0; i < 30; i++) {
      const r = await addToAccount({}); if (!r) break; total += r.pay;
      if (!r.owe && !unpaidCount(r.row)) break;
    }
    if (total) toast(`Achievement bonuses paid: +${fmt(total)} Lazer Points`);
  } catch (e) { console.warn("catch-up", e.code || e); }
}
async function settleEarly() {
  if (!signedIn()) return 0;
  await afterBoot();
  const c = await catalog(), m = await me();
  if (!m || !m.games) return 0;
  let t = 0;
  for (const g of c.games) {
    const r = m.games[g.id], boost = g.eaBoost || 1.5;
    let held = r && r.ea > 0 ? r.ea : 0;
    // pay out in chunks so each write stays inside the per-write leaderboard limit
    for (let i = 0; held > 0 && i < 20; i++) {
      const use = Math.min(held, Math.floor(19000 / boost)), pay = Math.round(use * boost);
      await addToAccount({ [g.id]: { lp: pay, best: 0, plays: 0, last: r.last || 0, settle: true, eaUse: use } });
      held -= use; t += pay;
    }
  }
  if (!t) return 0;
  toast(`Early-access bonus: +${fmt(t)} Lazer Points`);
  return t;
}
// Moves points queued on this browser (signed out, or the leaderboard was unreachable) into the account.
// Sent in chunks under the 20,000-per-write limit so big backlogs aren't cut off.
let syncing = null;
async function syncPending() {
  if (syncing) return syncing;
  syncing = (async () => {
    await afterBoot();
    const p0 = pendingAll(), p = {};
    // Only move points queued by this version (older queues include points rejected from extra tabs).
    Object.keys(p0).forEach((k) => { if (p0[k] && p0[k].v === 2) p[k] = p0[k]; });
    if (Object.keys(p).length !== Object.keys(p0).length) setPending(p);
    if (!Object.keys(p).length || !signedIn()) return 0;
    let moved = 0, first = true;
    while (Object.keys(p).length) {
      let budget = 19000; const batch = {};
      for (const k of Object.keys(p)) {
        const e = p[k], take = Math.min(budget, Math.max(0, Math.round(e.lp || 0)));
        batch[k] = { lp: take, best: e.best || 0, plays: e.plays || 0, last: e.last || 0 };
        if (e.eaLp) batch[k].eaLp = e.eaLp;
        if (e.round) batch[k].round = e.round;
        budget -= take;
        if (budget <= 0) break;
      }
      await addToAccount(batch);
      Object.keys(batch).forEach((k) => {
        const e = p[k], b = batch[k];
        e.lp = Math.max(0, (e.lp || 0) - b.lp); e.plays = 0; delete e.eaLp;
        moved += b.lp;
        if (!e.lp) delete p[k];
      });
      setPending(p);
      first = false;
    }
    return moved;
  })();
  try { return await syncing; } finally { syncing = null; }
}

let askedThisPage = false;
async function endSession(id, raw, info) {
  if (!lockOk()) { toast("Points paused: this game is live in another tab or device."); return 0; }
  const early = await inEarlyAccess(id), mult = early ? 1 : await multiplier(id), base = await toLP(id, raw), lp = Math.round(base * mult);
  const won = early ? [] : await recordSession(id, lp, mult > 1);
  const entry = early ? { lp: 0, eaLp: lp, best: raw, plays: 1, last: raw, round: lp } : { lp, best: raw, plays: 1, last: raw, round: lp };
  if (early) {
    const boost = (await gameInfo(id)).eaBoost || 1.5;
    if (signedIn()) { try { await addToAccount({ [id]: entry }); } catch (e) { stash(id, entry); } }
    else stash(id, entry);
    toast(`+${fmt(lp)} LP held for launch · paid ${boost}× = ${fmt(lp * boost)} LP`);
    flush();
    return lp;
  }
  if (won.length) {
    // Paid by the ledger inside the account write below (guests: on first sign-in).
    setTimeout(() => won.forEach((w, i) => setTimeout(() => toast(`${w.kind} unlocked: ${w.name} · +${fmt(w.bonus)} LP${signedIn() ? "" : " when you sign in"}`), i * 3800)), 3900);
  }
  if (signedIn()) {
    try { await addToAccount({ [id]: entry }); toast(`+${fmt(lp)} Lazer Points saved${mult > 1 ? ` (${mult}× Game of the Day)` : ""}`); }
    catch (e) { console.warn("leaderboard", e.code || e); stash(id, entry); toast("Couldn't reach the leaderboard. Points are kept and will retry."); }
    flush();
  } else {
    stash(id, entry);
    const pend = pendingAll()[id];
    if (!askedThisPage) { askedThisPage = true; promptSave(lp, pend ? pend.lp : lp); }
    else toast(`+${fmt(lp)} LP waiting. Sign in to save them.`);
  }
  return lp;
}
function stash(id, e) {
  const p = pendingAll(), o = p[id] && p[id].v === 2 ? p[id] : { lp: 0, best: 0, plays: 0, last: 0, v: 2 };
  p[id] = { lp: o.lp + (e.lp || 0), best: Math.max(o.best, e.best || 0), plays: o.plays + (e.plays || 0), last: e.last || o.last };
  if (e.eaLp || o.eaLp) p[id].eaLp = (o.eaLp || 0) + (e.eaLp || 0);
  if (e.round || o.round) p[id].round = Math.max(o.round || 0, e.round || 0);
  setPending(p);
}
function progSeconds(prog) { return Math.round(Object.values((prog && prog.days) || {}).reduce((a, v) => a + (v.sec || 0), 0)); }
function playtime() { const p = getProg(); const total = Object.values(p.days || {}).reduce((a, v) => a + (v.sec || 0), 0); return { total, best: p.tBest || 0 }; }
function pendingLP() { let t = 0; Object.values(pendingAll()).forEach((e) => (t += e.lp || 0)); return t; }

/* ---------------- tiers & perks ---------------- */
// Fields a player sets on their own row that every full-row write must carry over.
function keepExtras(cur, out) {
  if (Array.isArray(cur.pins)) out.pins = cur.pins;
  if (typeof cur.hideCredits === "boolean") out.hideCredits = cur.hideCredits;
  if (typeof cur.photoURL === "string") out.photoURL = cur.photoURL;
  if (typeof cur.bestRound === "number") { out.bestRound = cur.bestRound; if (typeof cur.bestRoundGame === "string") out.bestRoundGame = cur.bestRoundGame; }
  if (typeof cur.timeTotal === "number") out.timeTotal = cur.timeTotal;
  if (typeof cur.timeBest === "number") out.timeBest = cur.timeBest;
  return out;
}
async function editRow(fn) {
  if (!signedIn()) throw new Error("signed-out");
  const ref = doc(db, "arcadePlayers", state.user.uid), map = await bonusMap();
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref); const cur = snap.exists() ? snap.data() : { lp: 0, games: {} };
    const out = keepExtras(cur, { username: state.username, lp: cur.lp || 0, games: cur.games || {}, prog: ledger(cur, getProg(), map, 0).prog, updatedAt: serverTimestamp() });
    liveStamp(out); fn(out); tx.set(ref, out);
  });
}
// Silver and up: pin up to 3 earned achievements to your leaderboard row.
async function setPins(ids) { await editRow((o) => { o.pins = (ids || []).filter((x) => typeof x === "string").slice(0, 3); }); }
// Diamond and up: hide or show your name on the credits wall.
async function setHideCredits(v) { await editRow((o) => { o.hideCredits = !!v; }); }
// Gold and up: one vote for which queued game ships next (changing it moves the vote).
async function vote(game) { if (!signedIn()) throw new Error("signed-out"); await setDoc(doc(db, "arcadeVotes", state.user.uid), { game: String(game).slice(0, 40), at: serverTimestamp() }); }
async function votes() { try { const s = await getDocs(collection(db, "arcadeVotes")); const c = {}; let mine = null; s.forEach((d) => { const g = d.data().game; c[g] = (c[g] || 0) + 1; if (signedIn() && d.id === state.user.uid) mine = g; }); return { counts: c, mine }; } catch (e) { return { counts: {}, mine: null }; } }
// Platinum: early-access links. Diamond: beta builds. The database only lets qualifying accounts read these.
async function access(kind) { if (!signedIn()) return []; try { const s = await getDoc(doc(db, "arcadeAccess", kind)); return s.exists() ? (s.data().games || []) : []; } catch (e) { return []; } }
async function credits(minLp) { try { const s = await getDocs(query(collection(db, "arcadePlayers"), where("lp", ">=", minLp), orderBy("lp", "desc"), limit(500))); return s.docs.map((d) => Object.assign({ uid: d.id }, d.data())).filter((r) => !r.hideCredits && (r.lp || 0) >= minLp); } catch (e) { console.warn("credits", e.code || e); return []; } }

/* ---------------- roles (creator / admin badges) ---------------- */
let rolesP = null;
function roles() {
  if (!rolesP) rolesP = fetch(BASE + "roles.json", { cache: "no-cache" }).then((r) => r.json()).then((j) => {
    const m = {}; (j.roles || []).forEach((r) => { if (r.username) m[r.username.toLowerCase()] = r.role; }); return m;
  }).catch(() => ({}));
  return rolesP;
}

/* ---------------- leaderboards ---------------- */
async function top(field, n) {
  const snap = await getDocs(query(collection(db, "arcadePlayers"), orderBy(field, "desc"), limit(n || 50)));
  return snap.docs.map((d) => Object.assign({ uid: d.id }, d.data()));
}
function watchTop(field, n, cb, onErr) {
  return onSnapshot(query(collection(db, "arcadePlayers"), orderBy(field, "desc"), limit(n || 50)),
    (snap) => cb(snap.docs.map((d) => Object.assign({ uid: d.id }, d.data()))), (e) => { console.warn("leaderboard", e.code || e); if (onErr) onErr(e); });
}
async function me() {
  if (!signedIn()) return null;
  try { const s = await getDoc(doc(db, "arcadePlayers", state.user.uid)); return s.exists() ? s.data() : { lp: 0, games: {} }; } catch (e) { return null; }
}
async function rank(field, value) {
  if (!value) return null;
  try { const c = await getCountFromServer(query(collection(db, "arcadePlayers"), where(field, ">", value))); return c.data().count + 1; } catch (e) { return null; }
}
async function playerCount() {
  try { const c = await getCountFromServer(collection(db, "arcadePlayers")); return c.data().count; } catch (e) { return null; }
}

/* ---------------- feedback ---------------- */
async function sendTicket(t) {
  const d = { kind: t.kind, game: t.game, text: t.text, page: location.pathname.slice(0, 120), synced: false, createdAt: serverTimestamp() };
  if (t.contact) d.contact = t.contact.slice(0, 200);
  if (signedIn()) { d.uid = state.user.uid; d.username = state.username; }
  await addDoc(collection(db, "arcadeTickets"), d);
}

/* ---------------- account actions ----------------
   Lazer Arcade has no separate login: it uses the Carzzy Apps account system. Sign-in and sign-up happen
   on carzzyapps.com's own pages, and the shared Firebase session carries the player straight back. */

function goSignIn() { window.location.href = "/arcade/auth/sign-in/"; }
function goSignUp() { window.location.href = "/arcade/auth/sign-up/"; }
let wasSignedIn = null;
onChange(() => {
  // Signed in from another tab or after returning: move guest progress and points to the account.
  if (wasSignedIn === false && signedIn()) syncPending().then((n) => n && toast(`${fmt(n)} Lazer Points moved to your account`)).catch(() => {});
  wasSignedIn = signedIn();
});
async function logout() { flush(); await sleep(300); ls.del("signIn"); await signOut(auth); }
readyP.then(() => { if (signedIn()) { ls.del("lz.returnTo"); setTimeout(() => catchUp(), 1200); if (lock.game && lock.held) watchLive(lock.game); setTimeout(() => settleEarly().catch(() => {}), 2500); syncPending().then((n) => n && toast(`${fmt(n)} Lazer Points moved to your account`)).catch(() => {}); } });

/* ================= UI (shadow DOM so it never clashes with a game's styles) ================= */
const host = document.createElement("div");
host.id = "lz-ui";
host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483000";
const root = host.attachShadow({ mode: "open" });
root.innerHTML = `<style>
:host{all:initial}
*{box-sizing:border-box}
.wrap{position:fixed;inset:0;display:grid;place-items:center;background:rgba(6,4,20,.72);backdrop-filter:blur(6px);pointer-events:auto;padding:16px;animation:f .18s ease-out}
@keyframes f{from{opacity:0}}
@keyframes up{from{transform:translateY(14px);opacity:0}}
.card{width:min(420px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#120c2e;color:#f1ecff;border-radius:22px;padding:24px 22px 20px;
  border:1px solid rgba(255,255,255,.12);box-shadow:0 0 0 1px rgba(124,77,255,.35),0 20px 60px rgba(0,0,0,.6),0 0 60px rgba(124,77,255,.25);
  font:500 15px/1.45 "Manrope",system-ui,-apple-system,"Segoe UI",sans-serif;animation:up .22s ease-out;position:relative}
.card:before{content:"";position:absolute;left:22px;right:22px;top:0;height:3px;border-radius:3px;background:linear-gradient(90deg,#8b5cff,#4f7bff,#22d3ee)}
h2{font:800 24px/1.15 "Unbounded","Manrope",system-ui,sans-serif;margin:4px 0 6px;letter-spacing:-.01em}
.sub{color:#b9b0dc;margin:0 0 16px;font-size:14px}
.big{font:800 40px/1 "Unbounded",system-ui,sans-serif;background:linear-gradient(90deg,#a78bfa,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent;margin:6px 0 4px}
label{display:block;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#a99fd6;margin:12px 0 5px}
input,select,textarea{width:100%;background:#0a0720;color:#fff;border:1px solid #3a2f73;border-radius:12px;padding:11px 12px;font:600 15px "Manrope",system-ui,sans-serif;outline:none}
textarea{min-height:110px;resize:vertical}
input:focus,select:focus,textarea:focus{border-color:#8b5cff;box-shadow:0 0 0 3px rgba(124,77,255,.25)}
.row{display:flex;gap:8px;align-items:center;margin-top:12px;font-size:14px;color:#cfc6f2}
.row input{width:auto}
.btn{display:block;width:100%;margin-top:12px;border:0;border-radius:14px;padding:13px 16px;font:800 15px "Manrope",system-ui,sans-serif;cursor:pointer;color:#fff;
  background:linear-gradient(90deg,#7c4dff,#4f7bff);box-shadow:0 6px 20px rgba(124,77,255,.35)}
.btn:hover{filter:brightness(1.08)} .btn:disabled{opacity:.6;cursor:wait}
.btn.alt{background:#1d1545;box-shadow:none;border:1px solid #3a2f73}
.btn.txt{background:none;box-shadow:none;color:#a99fd6;padding:8px;font-weight:700}
.err{color:#ff7a9c;font-weight:700;font-size:14px;min-height:20px;margin-top:10px}
.ok{color:#5cf2c2}
.x{position:absolute;right:12px;top:12px;width:34px;height:34px;border-radius:50%;border:0;background:#1d1545;color:#cfc6f2;font-size:18px;cursor:pointer}
.toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#120c2e;color:#fff;border:1px solid #3a2f73;border-radius:999px;padding:10px 18px;
  font:700 14px "Manrope",system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5),0 0 0 1px rgba(34,228,255,.3);animation:up .25s ease-out;max-width:calc(100vw - 32px);text-align:center}
.seg{display:flex;gap:6px;background:#0a0720;border-radius:12px;padding:4px;margin:10px 0 2px}
.seg button{flex:1;border:0;border-radius:9px;padding:9px;background:none;color:#a99fd6;font:800 13px "Manrope",system-ui,sans-serif;cursor:pointer}
.seg button.on{background:#2a1f63;color:#fff}
.note{font-size:12.5px;color:#8f86b8;margin-top:12px;text-align:center}
.cz{display:flex;align-items:center;gap:10px;margin:0 0 16px}
.cz svg{width:38px;height:38px;flex:none}
.cz b{display:block;font:800 15px "Manrope",system-ui,sans-serif;color:#fff;line-height:1.1}
.cz span{font:700 12px "Manrope",system-ui,sans-serif;color:#8f86b8;letter-spacing:.04em}
.perks{list-style:none;padding:0;margin:0 0 6px;display:flex;flex-direction:column;gap:8px}
.perks li{position:relative;padding-left:26px;color:#d6cff5;font-size:14px}
.perks li:before{content:"";position:absolute;left:2px;top:4px;width:14px;height:14px;border-radius:50%;background:#00d1b2;
  -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8.5l3 3 6-7' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/100% no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 8.5l3 3 6-7' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/100% no-repeat}
.btn.cz-btn{display:flex;align-items:center;justify-content:center;gap:10px;background:#0f0f0f;border:1.5px solid #00d1b2;box-shadow:0 6px 22px rgba(0,209,178,.22)}
.btn.cz-btn svg{width:24px;height:24px}
.btn.cz-btn:hover{background:#121a19}
</style><div id="m"></div><div id="t"></div>`;
const mEl = root.getElementById("m"), tEl = root.getElementById("t");
function mount() { if (!host.isConnected) document.body.appendChild(host); }
if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

let toastTimer = null;
function toast(text) {
  mount(); tEl.innerHTML = `<div class="toast">${esc(text)}</div>`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (tEl.innerHTML = ""), 3600);
}
let modalDone = null;
function closeModal(v) { mEl.innerHTML = ""; const d = modalDone; modalDone = null; if (d) d(v); }
function modal(html, bind) {
  mount();
  return new Promise((res) => {
    if (modalDone) closeModal();
    modalDone = res;
    mEl.innerHTML = `<div class="wrap"><div class="card" role="dialog" aria-modal="true"><button class="x" aria-label="Close" data-close>×</button>${html}</div></div>`;
    const card = mEl.querySelector(".card");
    mEl.querySelector("[data-close]").onclick = () => closeModal(null);
    mEl.querySelector(".wrap").onclick = (e) => { if (e.target.classList.contains("wrap")) closeModal(null); };
    card.addEventListener("keydown", (e) => e.stopPropagation());
    if (bind) bind(card, closeModal);
    const f = card.querySelector("input,textarea,select"); if (f) setTimeout(() => f.focus(), 30);
  });
}

const CZ_MARK = `<img src="/favicon.png" style="height: 30px; width: 30;">`;
function openAccount(mode, lead) {
  if (signedIn()) return accountMenu();
  const p = pendingLP();
  return modal(`
    <div class="cz">${CZ_MARK}<div><b>Carzzy Apps</b><span>Account</span></div></div>
    <h2>${mode === "signup" ? "Create your Carzzy Apps account" : "Sign in with Carzzy Apps"}</h2>
    <p class="sub">${esc(lead || "Sign in to save your progress and Lazer Points to your account and pick them up on any device.")}</p>
    <ul class="perks"><li>Your game progress saves to your account and follows you to any device</li><li>Anything you've played on this device comes with you${p ? ` (${fmt(p)} LP waiting)` : ""}</li><li>Your scores count on the leaderboards</li></ul>
    <button class="btn cz-btn" data-in>${CZ_MARK}<span>Sign in with Carzzy Apps</span></button>
    <button class="btn alt" data-up>Create a Carzzy Apps account</button>
    <p class="note">You'll continue on carzzyapps.com and come straight back here.</p>`,
  (card, done) => {
    card.querySelector("[data-in]").onclick = () => { done(); goSignIn(); };
    card.querySelector("[data-up]").onclick = () => { done(); goSignUp(); };
  });
}

function accountMenu() {
  return modal(`
    <h2>${esc(state.username)}</h2>
    <p class="sub">Signed in to Carzzy Apps. Progress and Lazer Points save to this account.</p>
    <button class="btn" data-lb>View leaderboard</button>
    <a href="/arcade/auth/account"><button class="btn">Account</button></a>
    <button class="btn alt" data-out>Sign out</button>`,
  (card, done) => {
    card.querySelector("[data-lb]").onclick = () => { location.href = BASE + "leaderboard/"; };
    card.querySelector("[data-out]").onclick = async () => { done(); await logout(); toast("Signed out"); if (Object.keys(games).length) setTimeout(() => location.reload(), 500); };
  });
}

function promptSave(lp, waiting) {
  return modal(`
    <h2>Keep your progress</h2>
    <p class="sub">You're playing as a guest, so this run is only saved on this device. Sign in with your Carzzy Apps account to keep your progress safe, pick it up on any device, and count your ${fmt(waiting || lp)} Lazer Points.</p>
    <button class="btn cz-btn" data-in>${CZ_MARK}<span>Sign in with Carzzy Apps</span></button>
    <button class="btn alt" data-up>Create a free account</button>
    <button class="btn txt" data-close2>Keep playing as guest</button>`,
  (card, done) => {
    card.querySelector("[data-up]").onclick = () => { done(); goSignUp(); };
    card.querySelector("[data-in]").onclick = () => { done(); goSignIn(); };
    card.querySelector("[data-close2]").onclick = () => done();
  });
}

// Early-access request for an upcoming game. Lands with the feedback tickets (kind "access").
function requestAccess(gameName) {
  const key = "lz.ea." + gameName;
  if (ls.raw(key)) { toast(`You're already on the ${gameName} early-access list`); return Promise.resolve(false); }
  return modal(`
    <h2>Early access: ${esc(gameName)}</h2>
    <p class="sub">Play it before it launches. Points you earn in early access are boosted 1.5× and count on the leaderboard once it goes live.</p>
    <form novalidate>
      <label for="ea">${signedIn() ? "Contact (optional)" : "Email or Carzzy Apps username"}</label>
      <input id="ea" maxlength="200" autocomplete="email" placeholder="${signedIn() ? esc(state.username) : "you@example.com"}" value="${signedIn() ? esc(state.username) : ""}">
      <label for="why">Anything you want to tell us? (optional)</label>
      <textarea id="why" maxlength="600" style="min-height:70px" placeholder="What games you love, what device you play on…"></textarea>
      <div class="err" role="alert"></div>
      <button class="btn" type="submit">Request early access</button>
    </form>
    <p class="note">You'll get the private link once you're approved.</p>`,
  (card, done) => {
    const err = card.querySelector(".err"), btn = card.querySelector("button[type=submit]");
    card.querySelector("form").onsubmit = async (ev) => {
      ev.preventDefault();
      const who = card.querySelector("#ea").value.trim();
      if (!signedIn() && who.length < 3) { err.textContent = "Add an email or username so we can send you the link."; return; }
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        await sendTicket({ kind: "access", game: gameName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 40), text: ("Early access request for " + gameName + ". " + card.querySelector("#why").value.trim()).slice(0, 4000), contact: who });
        ls.set(key, today()); done(true); toast("You're on the list. Watch for your link!");
      } catch (e) { err.textContent = "Couldn't send right now. Try again in a moment."; btn.disabled = false; btn.textContent = "Request early access"; }
    };
  });
}
async function openFeedback(gameId) {
  const c = await catalog();
  const opts = [`<option value="arcade">Lazer Arcade in general</option>`].concat(c.all.map((g) => `<option value="${esc(g.id)}" ${g.id === gameId ? "selected" : ""}>${esc(g.name)}</option>`));
  return modal(`
    <h2>Send feedback</h2>
    <p class="sub">Bugs, ideas, game requests. Every ticket gets read.</p>
    <form novalidate>
      <label for="k">Type</label>
      <select id="k"><option value="bug">Bug</option><option value="idea">Idea / improvement</option><option value="request">New game request</option><option value="other">Other</option></select>
      <label for="g">About</label><select id="g">${opts.join("")}</select>
      <label for="tx">Message</label><textarea id="tx" maxlength="4000" placeholder="What happened, or what would make it better?"></textarea>
      ${signedIn() ? "" : `<label for="ct">Contact (optional)</label><input id="ct" maxlength="200" placeholder="Email or username, if you want a reply">`}
      <div class="err" role="alert"></div>
      <button class="btn" type="submit">Send ticket</button>
    </form>`,
  (card, done) => {
    const err = card.querySelector(".err"), btn = card.querySelector("button[type=submit]");
    card.querySelector("form").onsubmit = async (ev) => {
      ev.preventDefault();
      const text = card.querySelector("#tx").value.trim();
      if (text.length < 3) { err.textContent = "Write a little more first."; return; }
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        const ct = card.querySelector("#ct");
        await sendTicket({ kind: card.querySelector("#k").value, game: card.querySelector("#g").value, text, contact: ct ? ct.value.trim() : "" });
        done(true); toast("Ticket sent. Thank you!");
      } catch (e) { console.warn(e); err.textContent = "Couldn't send right now. Try again in a moment."; btn.disabled = false; btn.textContent = "Send ticket"; }
    };
  });
}

// Read another save slot (any version) without touching it, e.g. to import an older version's progress.
async function peekSave(slot) {
  if (!signedIn()) return null;
  try { const s = await within(getDoc(doc(db, "arcadeSaves", state.user.uid, "games", slot)), 4000, null); return s && s.exists() ? s.data() : null; } catch (e) { return null; }
}

/* ---------------- staff grants ----------------
   arcadeGrants/{uid} = { items: [{ id, game, cash, note }] } written by staff tooling only.
   Games apply each item once and record its id in their own save. */
async function grants(game) {
  if (!signedIn() || !lockOk()) return [];
  try {
    const s = await within(getDoc(doc(db, "arcadeGrants", state.user.uid)), 4000, null);
    const items = s && s.exists() ? s.data().items || [] : [];
    return items.filter((g) => g && g.id && g.game === game);
  } catch (e) { return []; }
}

/* ---------------- public API ---------------- */
const LZ = {
  ready: readyP, auth, db, catalog, gameInfo, toLP, onChange, signedIn,
  get user() { return state.user; }, get username() { return state.username; },
  boot, save, flush, endSession, grants, lockOk, peekSave, inEarlyAccess, settleEarly, gameOfTheDay, multiplier, progress, claimDoor, syncProg, extras, today, pendingLP, playtime, plays, top, watchTop, me, rank, playerCount, goSignIn, goSignUp, roles, setPins, setHideCredits, vote, votes, access, credits,
  openAccount, openFeedback, requestAccess, accountMenu, toast, logout, base: BASE, fmt, esc
};
window.LZ = LZ;
window.dispatchEvent(new CustomEvent("lz-ready"));
// ---------------- Play-time tracking ----------------
// Accrues active (visible) seconds into prog.days[today].sec and tracks the longest
// continuous session in prog.tBest. Persisted inside prog on the leaderboard row.
let tPend = 0, tRun = 0, tBestSeen = 0, tLast = Date.now(), tHidAt = 0, tBusy = false, tStarted = false;
function startTime() {
  if (tStarted) return; tStarted = true;
  try { tBestSeen = getProg().tBest || 0; } catch (e) {}
  setInterval(() => {
    const now = Date.now();
    if (document.visibilityState === "visible") { const dt = (now - tLast) / 1000; if (dt > 0 && dt < 4) { tPend += dt; tRun += dt; } if (tPend >= 90) flushTime(); }
    tLast = now;
  }, 1000);
  document.addEventListener("visibilitychange", () => { const now = Date.now(); if (document.hidden) { tHidAt = now; flushTime(); } else { if (tHidAt && now - tHidAt > 120000) tRun = 0; tLast = now; } });
  window.addEventListener("pagehide", () => flushTime());
  window.addEventListener("beforeunload", () => flushTime());
}
async function flushTime() {
  if (!lockOk()) { tPend = 0; tRun = 0; return; }
  const delta = Math.floor(tPend), run = Math.floor(tRun);
  if (delta < 1 && run <= tBestSeen) return;
  if (delta >= 1) tPend -= delta;
  const p = getProg(), d = today(), o = p.days[d] || { g: [], n: 0, lp: 0, t: 0 };
  o.sec = (o.sec || 0) + delta; p.days[d] = o;
  p.tBest = Math.max(p.tBest || 0, run);
  setProg(p);
  const newBest = run > tBestSeen; tBestSeen = Math.max(tBestSeen, run);
  try {
    const x = await extras(), won = [];
    x.achievements.forEach((a) => { if (a.type === "playHours" && !p.ach[a.id] && measure(a.type, p.days, a.target) >= a.target) { p.ach[a.id] = d; won.push(a); } });
    if (won.length) { setProg(p); if (signedIn()) addToAccount({}).catch(() => {}); won.forEach((w, i) => setTimeout(() => toast(`Achievement unlocked: ${w.name} · +${fmt(w.bonus)} LP`), i * 3800)); }
  } catch (e) {}
  if (signedIn() && !tBusy && (delta >= 1 || newBest)) {
    tBusy = true;
    try { await addTime(); } catch (e) { tPend += delta; } finally { tBusy = false; }
  }
}
async function addTime() {
  const uid = state.user.uid, ref = doc(db, "arcadePlayers", uid), map = await bonusMap();
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref); if (!snap.exists()) return; // row is created on first LP; until then time stays local
    const cur = snap.data();
    const L = ledger(cur, getProg(), map, SESSION_LP_CAP), merged = L.prog, gm = Object.assign({}, cur.games || {});
    if (L.pay) { const b = Object.assign({ lp: 0, best: 0, plays: 0, last: 0 }, gm.bonus || {}); b.lp += L.pay; gm.bonus = b; }
    const out = liveStamp(keepExtras(cur, { username: state.username, lp: (cur.lp || 0) + L.pay, games: gm, prog: merged, updatedAt: serverTimestamp() }));
    out.timeTotal = progSeconds(merged); out.timeBest = Math.round(merged.tBest || 0);
    tx.set(ref, out);
  });
}
readyP.then(startTime);

// One site visit per browser session (feeds creator earnings).
try { if (!sessionStorage.getItem("cz.visit")) { sessionStorage.setItem("cz.visit", "1"); setDoc(doc(db, "arcadeStats", "site"), { plays: increment(1) }, { merge: true }).catch(() => {}); } } catch (e) {}
export default LZ;
