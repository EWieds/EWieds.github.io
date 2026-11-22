/* Crema City (Crema Rush v4) — game data. Plain globals, no build step. */
"use strict";
var CC = window.CC = window.CC || {};

/* ---------- industries (match v3 ids so old shops import 1:1) ---------- */
CC.IND = {
  coffee:   { name: "Coffee bar",   col: 0x3f8f7a, acc: 0xffb83d, lvl: 1,  base: 1.0, items: [["Espresso",3],["Latte",4.5],["Caramel latte",5.75],["Mocha",5.75],["Cold brew",4],["Croissant",3.5]] },
  bakery:   { name: "Bakery",       col: 0xd98a4a, acc: 0xfff1d6, lvl: 10, base: 1.15, items: [["Croissant",3.5],["Donut",2.75],["Sourdough",6],["Cinnamon roll",4.25],["Layer cake",7.5],["Bagel",3]] },
  juice:    { name: "Juice bar",    col: 0x4fbf5a, acc: 0xfff36a, lvl: 13, base: 1.2, items: [["Orange juice",4],["Green smoothie",6.5],["Berry blast",6],["Acai bowl",8.5],["Ginger shot",3]] },
  icecream: { name: "Ice cream",    col: 0xff8fb7, acc: 0xfff6e6, lvl: 16, base: 1.25, items: [["Cone",3.5],["Sundae",6.5],["Waffle bowl",7],["Milkshake",6],["Banana split",8]] },
  diner:    { name: "Restaurant",   col: 0xc0392b, acc: 0xf6e6c8, lvl: 22, base: 1.6, items: [["Burger",11],["Pasta",14],["Steak",26],["Salad",10],["Soup",7],["Pie",6]] },
  grocery:  { name: "Grocery",      col: 0x2f8fd0, acc: 0xe8f4ff, lvl: 26, base: 1.4, items: [["Groceries",18],["Coffee beans",14],["Fresh bread",5],["Fruit box",12]] }
};
CC.IND_ORDER = ["coffee", "bakery", "juice", "icecream", "diner", "grocery"];

/* ---------- districts (v3 ids first; more are generated as the city grows) ---------- */
CC.DIST = [
  { id: "main",    name: "Main Street",         lvl: 1,  demand: 1.0,  price: 1.0,  rent: 1.0, style: "street",  am: 1, lunch: 1, eve: 1 },
  { id: "campus",  name: "Campus Corner",       lvl: 4,  demand: 1.15, price: .85,  rent: .8,  style: "campus",  am: .6, lunch: 1.4, eve: 1.3 },
  { id: "finance", name: "Financial District",  lvl: 6,  demand: 1.05, price: 1.35, rent: 2.2, style: "towers",  am: 2.2, lunch: 1.1, eve: .4 },
  { id: "board",   name: "Boardwalk",           lvl: 8,  demand: 1.2,  price: 1.1,  rent: 1.4, style: "ocean",   am: .5, lunch: 1.5, eve: 1.6 },
  { id: "old",     name: "Old Town",            lvl: 10, demand: 1.1,  price: 1.15, rent: 1.2, style: "old",     am: .8, lunch: 1.2, eve: 1.2 },
  { id: "mall",    name: "Mall District",       lvl: 14, demand: 1.35, price: 1.05, rent: 1.8, style: "mall",    am: .4, lunch: 1.3, eve: 1.5 }
];
CC.GEN_PREFIX = ["North", "South", "East", "West", "Upper", "Lower", "New", "Harbor", "River", "Hill", "Lake", "Park"];
CC.GEN_SUFFIX = ["Heights", "Point", "Village", "Quarter", "Yards", "Gardens", "Square", "Commons", "Flats", "Row", "Crossing", "Terrace"];
CC.CITY_NAMES = ["Crema City", "Portside", "Summit", "Bayview", "Ironwood", "Silverlake", "Northgate", "Sunvale"];

/* ---------- superstore departments (free placement on the floor grid) ---------- */
// w,h in floor tiles; rev = $/min at full demand; need = level; cost grows per copy owned
CC.DEPT = {
  coffee:   { name: "Coffee bar",      w: 3, h: 2, cost: 6000,   rev: 240,  lvl: 1,  col: 0x3f8f7a, ind: "coffee" },
  bakery:   { name: "Bakery counter",  w: 3, h: 2, cost: 9000,   rev: 320,  lvl: 10, col: 0xd98a4a, ind: "bakery" },
  juice:    { name: "Juice bar",       w: 2, h: 2, cost: 11000,  rev: 340,  lvl: 13, col: 0x4fbf5a, ind: "juice" },
  icecream: { name: "Ice cream stand", w: 2, h: 2, cost: 14000,  rev: 380,  lvl: 16, col: 0xff8fb7, ind: "icecream" },
  diner:    { name: "Restaurant",      w: 4, h: 3, cost: 40000,  rev: 880, lvl: 22, col: 0xc0392b, ind: "diner" },
  grocery:  { name: "Grocery aisles",  w: 4, h: 2, cost: 30000,  rev: 680, lvl: 26, col: 0x2f8fd0, ind: "grocery" },
  seating:  { name: "Seating area",    w: 2, h: 2, cost: 2500,   rev: 0,   lvl: 1,  col: 0x8a6a4a, comfort: 1 },
  restroom: { name: "Restrooms",       w: 2, h: 2, cost: 5000,   rev: 0,   lvl: 1,  col: 0x9fb6d8, comfort: 2 },
  plants:   { name: "Plants & decor",  w: 1, h: 1, cost: 900,    rev: 0,   lvl: 1,  col: 0x3fa65a, decor: 1 },
  arcade:   { name: "Arcade corner",   w: 2, h: 2, cost: 18000,  rev: 260,  lvl: 18, col: 0x7a5ad8, decor: 2 },
  stage:    { name: "Live music stage",w: 3, h: 2, cost: 35000,  rev: 0,   lvl: 24, col: 0xffb83d, decor: 4 },
  escalator:{ name: "Escalator",       w: 1, h: 3, cost: 60000,  rev: 0,   lvl: 30, col: 0xb0b8c8, floor: 1 }
};
CC.DEPT_ORDER = ["coffee", "bakery", "juice", "icecream", "diner", "grocery", "seating", "restroom", "plants", "arcade", "stage", "escalator"];
CC.GARAGE = { levelCost: 25000, perLevel: 40, g: 1.6 }; // parking spaces per garage level

/* ---------- food trucks ---------- */
CC.TRUCK = { cost: 4000, lvl: 3, rate: 22, upCost: 1500, upG: 1.7, rivalLvl: 6 };

/* ---------- city hall ---------- */
CC.PERMITS = {
  late:     { name: "Late-night license", cost: 3000,   lvl: 5,  desc: "Your shops stay open and earn after 10pm." },
  truck:    { name: "Food truck license", cost: 1500,   lvl: 3,  desc: "Required to sell from a truck." },
  super:    { name: "Superstore zoning",  cost: 50000,  lvl: 15, desc: "Lets you build a superstore on a full city block." },
  garage:   { name: "Parking variance",   cost: 20000,  lvl: 18, desc: "Allows a parking garage next to your superstore." },
  airport:  { name: "Regional expansion", cost: 250000, lvl: 25, desc: "Fly to new cities and open there." }
};
CC.TAX = {
  base: 0.25,
  laws: {
    scorp:   { name: "S-Corp election",       cost: 2000,  lvl: 6,  rate: -.04, audit: .00, desc: "Pass-through taxation. Tax rate -4 points.", need: { shops: 2 } },
    enterprise: { name: "Enterprise zone credit", cost: 6000, lvl: 9, rent: -.3, audit: .01, desc: "Shops in Campus Corner and Old Town pay 30% less rent." },
    rd:      { name: "R&D credit",            cost: 9000,  lvl: 12, upgrade: -.1, audit: .01, desc: "Every upgrade costs 10% less." },
    deprec:  { name: "Bonus depreciation",    cost: 15000, lvl: 15, rate: -.03, audit: .02, desc: "Write off equipment fast. Tax rate -3 points." },
    charity: { name: "Charitable foundation", cost: 30000, lvl: 18, rate: -.02, fame: .2, audit: 0, desc: "Tax rate -2 points and +20% fame from good press." },
    offshore:{ name: "Offshore holding co.",  cost: 120000,lvl: 28, rate: -.08, audit: .08, desc: "Tax rate -8 points. Audits get much more likely." }
  }
};
CC.POLITICS = {
  council: { name: "City council", fame: 2500,  influence: 60,  cost: 50000 },
  mayor:   { name: "Mayor",        fame: 12000, influence: 250, cost: 400000 }
};

/* ---------- empire upgrades: unlimited levels, costs grow, effects keep adding ---------- */
CC.UPG = {
  training: { name: "Barista academy",   base: 400,   g: 1.55, eff: "Staff serve 6% faster per level" },
  loyalty:  { name: "Loyalty app",       base: 900,   g: 1.6,  eff: "+6% customers everywhere per level" },
  quality:  { name: "Quality program",   base: 2000,  g: 1.6,  eff: "+4% prices everywhere per level" },
  offline:  { name: "Night managers",    base: 500,   g: 1.7,  eff: "More income while you're away" },
  marketing:{ name: "Marketing dept.",   base: 1500,  g: 1.6,  eff: "+5% fame and customers per level" },
  logistics:{ name: "Delivery fleet",    base: 9000,  g: 1.65, eff: "-4% costs everywhere per level" },
  lobbying: { name: "Lobbying team",     base: 12000, g: 1.7,  eff: "+10% influence per level" },
  security: { name: "Security team",     base: 5000,  g: 1.7,  eff: "Blocks rival dirty tricks" }
};

/* ---------- rivals ---------- */
CC.RIVALS = {
  coffee: ["Bean There", "Daily Grind", "Brew Bros", "Perk Up", "Mugshot Coffee", "Steamworks"],
  bakery: ["Crumb & Co", "Rise Up", "Flour Power", "Loaf Story"],
  juice: ["Squeeze", "Pulp Fiction", "Blend In", "Juicy Lucy"],
  icecream: ["Scoops Ahoy", "Cold Stone Cold", "Melt", "Swirl Girl"],
  diner: ["Grill Sergeant", "The Fork", "Plate Expectations"],
  grocery: ["QuickMart", "FreshCo", "Basket Case"]
};
CC.FIRST = ["Mia", "Leo", "Ava", "Kai", "Zoe", "Sam", "Noa", "Eli", "Ivy", "Max", "Lily", "Ben", "Ruby", "Finn", "Nora", "Jay"];

/* ---------- time ---------- */
CC.DAY_SEC = 720;              // one in-game day = 12 real minutes
CC.OPEN_H = 6, CC.CLOSE_H = 22;

/* ---------- helpers ---------- */
CC.fmt = function (v) {
  v = Math.round(v || 0); var a = Math.abs(v), s = v < 0 ? "-" : "";
  if (a >= 1e12) return s + "$" + (a / 1e12).toFixed(a >= 1e13 ? 0 : 1) + "T";
  if (a >= 1e9) return s + "$" + (a / 1e9).toFixed(a >= 1e10 ? 0 : 1) + "B";
  if (a >= 1e6) return s + "$" + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
  if (a >= 1e4) return s + "$" + (a / 1e3).toFixed(a >= 1e5 ? 0 : 1) + "K";
  return s + "$" + a.toLocaleString();
};
CC.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
CC.rnd = function (a, b) { return a + Math.random() * (b - a); };
CC.pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
CC.hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
CC.rng = function (seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
CC.xpNeed = function (l) { return Math.round(110 * Math.pow(1.3, l - 1)); };
