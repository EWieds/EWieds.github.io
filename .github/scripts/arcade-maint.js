// One-off maintenance: staff LP grants + achievement compensation.
// Reads .github/maint/task.json. mode "dry" only reports; "apply" writes (idempotent per task id).
// Report goes to .github/maint/report-<id>.md (committed by the workflow).
const fs = require("fs"), path = require("path");
const admin = require("firebase-admin");
const sa = JSON.parse(process.env.SA);
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const db = admin.firestore();
const root = process.env.GITHUB_WORKSPACE || process.cwd();
const task = JSON.parse(fs.readFileSync(path.join(root, ".github/maint/task.json"), "utf8"));
const ach = JSON.parse(fs.readFileSync(path.join(root, "arcade/achievements.json"), "utf8")).achievements;
const ev = JSON.parse(fs.readFileSync(path.join(root, "arcade/events.json"), "utf8")).events || [];
const cat = JSON.parse(fs.readFileSync(path.join(root, "arcade/games.json"), "utf8")).games;
const day = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
const live = cat.filter((g) => !g.released || g.released <= day), ids = new Set(live.map((g) => g.id));
const map = {}; ach.forEach((a) => { map[a.id] = a.bonus || 0; });
ev.forEach((e) => (e.missions || []).forEach((m) => { map["ev:" + e.id + ":" + m.id] = m.bonus || 0; }));
const doorBonus = {}; ev.forEach((e) => e.calendar && (e.calendar.doors || []).forEach((d, i) => { doorBonus[e.id + ":" + i] = d.bonus || 0; }));
const dayNum = (d) => Math.round(Date.parse(d + "T12:00:00Z") / 864e5);
function measure(type, days, target) {
  const list = Object.entries(days || {}).filter(([, v]) => v && v.n > 0);
  switch (type) {
    case "sessions": return list.reduce((a, [, v]) => a + v.n, 0);
    case "daysPlayed": return list.length;
    case "lpEarned": return list.reduce((a, [, v]) => a + (v.lp || 0), 0);
    case "gotdDays": return list.filter(([, v]) => v.t).length;
    case "sessionsInDay": return list.reduce((a, [, v]) => Math.max(a, v.n), 0);
    case "lpInDay": return list.reduce((a, [, v]) => Math.max(a, v.lp || 0), 0);
    case "distinctGamesInDay": return list.reduce((a, [, v]) => Math.max(a, (v.g || []).length), 0);
    case "allGames": return new Set(list.flatMap(([, v]) => v.g || [])).size;
    case "playHours": return Math.floor(Object.values(days || {}).reduce((a, v) => a + ((v && v.sec) || 0), 0) / 3600);
    case "streak": { const ns = list.map(([d]) => dayNum(d)).sort((a, b) => a - b); let best = 0, run = 0, prev = null; ns.forEach((n) => { run = prev !== null && n === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = n; }); return best; }
  }
  return 0;
}
function floors(r) {
  let plays = 0, distinct = 0;
  Object.entries(r.games || {}).forEach(([k, v]) => { if (k === "bonus" || !v) return; plays += v.plays || 0; if ((v.plays || 0) > 0 && ids.has(k)) distinct++; });
  const bonus = (r.games && r.games.bonus && r.games.bonus.lp) || 0;
  return { sessions: plays, lpEarned: Math.max(0, (r.lp || 0) - bonus), allGames: distinct };
}
(async () => {
  const out = [`# Maintenance ${task.id} (${task.mode})`, "", `Run ${new Date().toISOString()}`, ""];
  const doneRef = db.collection("arcadeMaint").doc(task.id);
  const already = (await doneRef.get()).exists;
  const apply = task.mode === "apply" && !already;
  if (task.mode === "apply" && already) out.push("**Already applied earlier; nothing written.**", "");
  const players = await db.collection("arcadePlayers").get();
  out.push(`Players: ${players.size}`, "");
  // ---- grants
  out.push("## Grants", "", "| player | game | amount | status |", "|---|---|---|---|");
  for (const g of task.grants || []) {
    const hits = players.docs.filter((d) => (d.data().username || "") === g.username);
    const amt = g.cash ? `$${g.cash} in-game cash` : `${g.lp} LP`;
    if (hits.length !== 1) { out.push(`| ${g.username} | ${g.game} | ${amt} | NOT APPLIED: ${hits.length} matching players |`); continue; }
    const ref = hits[0].ref;
    if (g.cash) {
      // In-game cash: the game applies it once on next load (or within a minute if open).
      if (apply) {
        const gref = db.collection("arcadeGrants").doc(hits[0].id), id = task.id + ":" + g.game;
        await db.runTransaction(async (tx) => {
          const cur = (await tx.get(gref)).data() || {}, items = (cur.items || []).filter((x) => x.id !== id);
          items.push(Object.assign({ id, game: g.game, cash: g.cash, note: g.note || "" }, g.city ? { city: true } : {}));
          tx.set(gref, { items, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        });
      }
      out.push(`| ${g.username} | ${g.game} | ${amt} | ${apply ? "queued for the game to apply" : "dry run"} |`);
      continue;
    }
    if (apply) await db.runTransaction(async (tx) => {
      const r = (await tx.get(ref)).data(), gm = Object.assign({}, r.games || {});
      const row = Object.assign({ lp: 0, best: 0, plays: 0, last: 0 }, gm[g.game] || {}); row.lp += g.lp; gm[g.game] = row;
      tx.update(ref, { lp: (r.lp || 0) + g.lp, games: gm, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
    out.push(`| ${g.username} | ${g.game} | +${amt} | ${apply ? "applied" : "dry run"} |`);
  }
  // ---- achievement compensation
  out.push("", "## Achievements", "", "missing = earned (lifetime totals count) but never unlocked; short = unlocked but bonus underpaid (e.g. cut off by the 20k-per-write cap)", "",
    "| player | LP before | missing unlocks | missing LP | short LP | total paid |", "|---|---|---|---|---|---|");
  let grand = 0, people = 0;
  if (task.skipAchievements) out.push("_Skipped for this task._");
  for (const d of (task.skipAchievements ? [] : players.docs)) {
    const r = d.data(), prog = r.prog || {}, have = Object.assign({}, prog.ach || {}), part = prog.achPart || {};
    const f = floors(r), n = live.length, miss = [];
    ach.forEach((a) => { const t = a.type === "allGames" ? n : a.target; if (have[a.id]) return; if (Math.max(measure(a.type, prog.days, t), f[a.type] || 0) >= t) miss.push(a.id); });
    const missLp = miss.reduce((s, k) => s + map[k], 0);
    const marked = Object.keys(have).reduce((s, k) => s + (map[k] || 0), 0) + Object.keys(prog.claims || {}).reduce((s, k) => s + (doorBonus[k] || 0), 0) + Object.values(part).reduce((s, v) => s + (v || 0), 0);
    const paid = (r.games && r.games.bonus && r.games.bonus.lp) || 0;
    const short = Math.max(0, marked - paid);
    const total = missLp + short;
    if (!total) continue;
    if ((task.exclude || []).includes(r.username)) { out.push(`| ${r.username} | ${r.lp || 0} | ${miss.join(", ") || "-"} | ${missLp} | ${short} | HELD for review (not paid) |`); continue; }
    people++; grand += total;
    out.push(`| ${String(r.username || d.id).replace(/\|/g, "/")} | ${r.lp || 0} | ${miss.join(", ") || "-"} | ${missLp} | ${short} (marked ${marked}, paid ${paid}) | ${total} |`);
    if (apply) await db.runTransaction(async (tx) => {
      const cur = (await tx.get(d.ref)).data(), gm = Object.assign({}, cur.games || {}), p2 = Object.assign({}, cur.prog || {});
      const a2 = Object.assign({}, p2.ach || {}); miss.forEach((k) => { if (!a2[k]) a2[k] = day; }); p2.ach = a2;
      const b = Object.assign({ lp: 0, best: 0, plays: 0, last: 0 }, gm.bonus || {}); b.lp += total; gm.bonus = b;
      tx.update(d.ref, { lp: (cur.lp || 0) + total, games: gm, prog: p2, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
  }
  out.push("", `**${people} players, ${grand} LP total ${apply ? "paid" : "(dry run, nothing written)"}.**`);
  if (apply) await doneRef.set({ at: admin.firestore.FieldValue.serverTimestamp(), people, lp: grand });
  fs.writeFileSync(path.join(root, `.github/maint/report-${task.id}-${task.mode}.md`), out.join("\n") + "\n");
  console.log(out.join("\n"));
})().catch((e) => { console.error(e); process.exit(1); });
