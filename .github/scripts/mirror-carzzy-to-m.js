// Mirrors carzzyapps.github.io into this repo's /m/ as a self-contained copy:
// every absolute path ("/x") is rewritten to "/m/x" so the mirror works under /m,
// except /arcade (kept pointing at the real arcade) and external/protocol-relative URLs.
// Rebuilds /m from scratch each run so deletions on carzzy propagate.
//
// Usage: node mirror-carzzy-to-m.js <carzzyCloneDir> <repoRootDir>

const fs = require("fs");
const path = require("path");

const [src, dst] = process.argv.slice(2);
const OUT = path.join(dst, "m");
const SKIP_TOP = new Set([".git", ".github", "arcade", "CNAME", "m", "node_modules", "functions"]);
const TEXT = /\.(html?|css|js|mjs|json|svg|xml|txt|webmanifest|md)$/i;

// After a quote, paren or '=', turn /x into /m/x — but not //… , not /m/… , not /arcade…
function rewrite(s) { return s.replace(/(["'(=])\/(?!\/|m\/|arcade)/g, "$1/m/"); }

function walk(rel) {
  for (const name of fs.readdirSync(path.join(src, rel))) {
    if (rel === "" && SKIP_TOP.has(name)) continue;
    const r = path.join(rel, name);
    const st = fs.statSync(path.join(src, r));
    if (st.isDirectory()) { walk(r); continue; }
    const outPath = path.join(OUT, r);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    if (TEXT.test(name)) fs.writeFileSync(outPath, rewrite(fs.readFileSync(path.join(src, r), "utf8")));
    else fs.copyFileSync(path.join(src, r), outPath);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
walk("");
// A tiny marker so the mirror home is obviously the Carzzy mirror.
console.log("Rebuilt /m mirror from carzzyapps.");
