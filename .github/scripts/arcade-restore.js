// IMPORT side (runs on ewieds with the NEW admin key, FB_NEW_SA).
// Reads the decrypted firestore-dump.json and writes every document to the new
// project at the same path + ID, decoding the type tags the dumper wrote.
// Idempotent: re-running overwrites with the same data.
//
// Usage: node arcade-restore.js <dumpFile>
//   env SA = new project service-account JSON (FB_NEW_SA)

const admin = require("firebase-admin");
const fs = require("fs");

const sa = JSON.parse(process.env.SA);
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;
const GeoPoint = admin.firestore.GeoPoint;

function dec(v) {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return v.map(dec);
  if (typeof v === "object") {
    if (v.__t === "ts") return new Timestamp(v.s, v.n);
    if (v.__t === "geo") return new GeoPoint(v.lat, v.lng);
    if (v.__t === "bytes") return Buffer.from(v.b64, "base64");
    if (v.__t === "ref") return db.doc(v.p);
    const o = {}; for (const k of Object.keys(v)) o[k] = dec(v[k]); return o;
  }
  return v;
}

(async () => {
  const dumpFile = process.argv[2] || "firestore-dump.json";
  const data = JSON.parse(fs.readFileSync(dumpFile, "utf8"));
  let docs = 0, cols = 0;
  for (const path of Object.keys(data)) {
    const col = db.collection(path); // odd-segment path = valid collection ref
    const entries = Object.entries(data[path]);
    for (let i = 0; i < entries.length; i += 400) {
      const chunk = entries.slice(i, i + 400);
      const batch = db.batch();
      for (const [id, raw] of chunk) batch.set(col.doc(id), dec(raw), { merge: false });
      await batch.commit();
      docs += chunk.length;
    }
    cols++;
    console.log(`  ${path}: ${entries.length}`);
  }
  console.log(`Restored ${docs} docs across ${cols} collection paths into ${sa.project_id}.`);
})().catch((e) => { console.error("RESTORE FAILED:", e); process.exit(1); });
