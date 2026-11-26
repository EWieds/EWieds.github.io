// Pulls Evan's CauseMatch donations, tallies votes by side, writes scores.json + scoreboard.svg.
// Run: node vote/update.mjs   (Node 18+, no packages)
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const CAMPAIGN_ID = 6744;
const MY_LAYER = 622598;           // Evan's ambassador page
const GOAL = 25000;                // goal, including the match
const BONUS_GOAL = 30000;          // bonus goal, including the match
const MULTIPLIER = 3;
// Manual side assignments by donation id (for gifts made before voting started).
const OVERRIDES = { 4311599: "chassidish" };

export const SIDES = [
  { k: "chassidish", n: "Chassidish", re: /chass?id|hass?id|chusid|chasid/i },
  { k: "chabad",     n: "Chabad",     re: /chabad|lubavitch|lubavich/i },
  { k: "litvish",    n: "Litvish",    re: /litv|litt?vak|yeshivish|misnag/i },
  { k: "sefardi",    n: "Sefardi",    re: /se[fp]h?a?r?a?d|sfard|mizrachi/i },
];

export function sideOf(comment) {
  const c = String(comment || "");
  // Chabad first so "Chabad chassidish" counts as Chabad.
  for (const k of ["chabad", "chassidish", "litvish", "sefardi"]) {
    if (SIDES.find(s => s.k === k).re.test(c)) return k;
  }
  return "other";
}

export function tally(donations) {
  const t = Object.fromEntries([...SIDES.map(s => s.k), "other"].map(k => [k, { d: 0, n: 0 }]));
  let total = 0;
  for (const d of donations) {
    const a = Number(d.amount) * (Number(d.multiplier) || 1);  // matched amount
    if (!(a > 0)) continue;
    const k = OVERRIDES[d.id] || sideOf(d.comment);
    t[k].d += a; t[k].n += 1; total += a;
  }
  const max = Math.max(...SIDES.map(s => t[s.k].d));
  const top = SIDES.filter(s => t[s.k].d === max);
  return { sides: t, total, donors: donations.length, leader: max > 0 && top.length === 1 ? top[0].k : null };
}

async function fetchMine() {
  const out = [];
  for (let page = 1; page < 50; page++) {
    const url = `https://causematch.com/api/public/donations?order=%5B%5B%22approvedAt%22%2C%22DESC%22%5D%5D&page=${page}&paginate=100&campaignId=${CAMPAIGN_ID}`;
    const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 vote-scoreboard" } });
    if (!r.ok) throw new Error(`CauseMatch ${r.status}`);
    const j = await r.json();
    for (const d of j.docs || []) if (d.layerItem && d.layerItem.id === MY_LAYER) out.push(d);
    if (page >= (j.pages || 1)) break;
  }
  return out;
}

const COLORS = { chassidish: "#f2b632", chabad: "#3fbf7f", litvish: "#5aa2ff", sefardi: "#ee6b52" };
const money = n => "$" + Math.round(n).toLocaleString("en-US");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function svg(r) {
  const W = 600, rowH = 62, top = 96, H = top + SIDES.length * rowH + 70;
  const teamTotal = SIDES.reduce((s, x) => s + r.sides[x.k].d, 0);
  const rows = SIDES.map((s, i) => {
    const y = top + i * rowH, d = r.sides[s.k].d, w = teamTotal ? (d / teamTotal) * 540 : 0;
    const lead = r.leader === s.k ? `<text x="${30 + 200}" y="${y + 22}" font-size="13" font-weight="700" fill="${COLORS[s.k]}">LEADING</text>` : "";
    return `<text x="30" y="${y + 22}" font-size="24" font-weight="700" fill="#f4efe4">${s.n}</text>${lead}
<text x="570" y="${y + 22}" font-size="24" font-weight="700" fill="#f4efe4" text-anchor="end">${money(d)}</text>
<rect x="30" y="${y + 34}" width="540" height="10" rx="5" fill="#2b3b5c"/>
<rect x="30" y="${y + 34}" width="${Math.max(w, d > 0 ? 6 : 0).toFixed(1)}" height="10" rx="5" fill="${COLORS[s.k]}"/>`;
  }).join("\n");
  const matched = r.total;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif">
<rect width="${W}" height="${H}" rx="18" fill="#0e1726"/>
<text x="30" y="46" font-size="30" font-weight="700" fill="#f4efe4">Vote for the best sect of Judaism</text>
<text x="30" y="72" font-size="14" fill="#a3b3cf">Every dollar is a vote. Write your side in the comment.</text>
${rows}
<text x="30" y="${H - 34}" font-size="16" fill="#f4efe4">${esc(money(matched))} of ${esc(money(matched >= GOAL ? BONUS_GOAL : GOAL))}${matched >= GOAL ? " bonus goal" : ""} with the match · ${r.donors} donor${r.donors === 1 ? "" : "s"}</text>
<text x="30" y="${H - 14}" font-size="11" fill="#a3b3cf">All in good fun. We don't actually think any one group is better. Updated ${esc(r.updated)}</text>
</svg>`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const here = dirname(fileURLToPath(import.meta.url));
  const mine = await fetchMine();
  const r = tally(mine);
  try {
    const old = JSON.parse(readFileSync(join(here, "scores.json"), "utf8"));
    if (JSON.stringify(old.sides) === JSON.stringify(r.sides) && old.donors === r.donors && old.goal === GOAL && old.bonusGoal === BONUS_GOAL) { console.log("no change"); process.exit(0); }
  } catch {}
  r.updated = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }) + " ET";
  r.goal = GOAL; r.bonusGoal = BONUS_GOAL; r.multiplier = MULTIPLIER;
  writeFileSync(join(here, "scores.json"), JSON.stringify(r, null, 2));
  writeFileSync(join(here, "scoreboard.svg"), svg(r));
  console.log("ok", r.total, r.leader);
}
