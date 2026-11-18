// IMPORT side (ewieds, NEW admin key). Best-effort project setup so the arcade
// works on the new project without extra console clicks:
//   1. ensure the default Firestore (Native) database exists
//   2. authorize ewieds.github.io (+ localhost, firebaseapp/web.app) for Auth,
//      so email/password and Google sign-in work from the live site
// Any step that the service account lacks IAM for is logged as a WARNING, not a
// failure — those get done by hand (the workflow prints exactly what to click).
//
// Usage: node arcade-setup.js
//   env SA        = new project service-account JSON (FB_NEW_SA)
//   env LOCATION  = Firestore location if it must be created (default nam5)

const admin = require("firebase-admin");
const sa = JSON.parse(process.env.SA);
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const PID = sa.project_id;
const LOCATION = process.env.LOCATION || "nam5";

async function token() {
  const t = await admin.app().options.credential.getAccessToken();
  return t.access_token;
}
async function api(method, url, tok, body) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  return { ok: res.ok, status: res.status, json };
}

(async () => {
  const tok = await token();

  // 1) Firestore default database
  const dbUrl = `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)`;
  const got = await api("GET", dbUrl, tok);
  if (got.ok) {
    console.log("Firestore: default database already exists.");
  } else if (got.status === 404) {
    const create = await api("POST",
      `https://firestore.googleapis.com/v1/projects/${PID}/databases?databaseId=(default)`, tok,
      { type: "FIRESTORE_NATIVE", locationId: LOCATION });
    console.log(create.ok
      ? `Firestore: created default database in ${LOCATION}.`
      : `::warning::Firestore DB not created (${create.status}). Create it once in the console (Firestore Database -> Create, Native mode).`);
  } else {
    console.log(`::warning::Could not check Firestore DB (${got.status}). If sign-in/data fails, create Firestore (Native) in the console.`);
  }

  // 2) Authorized domains for Auth
  const cfgUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PID}/config`;
  const cfg = await api("GET", cfgUrl, tok);
  if (cfg.ok) {
    const want = ["localhost", "ewieds.github.io", `${PID}.firebaseapp.com`, `${PID}.web.app`];
    const have = (cfg.json.authorizedDomains || []);
    const merged = Array.from(new Set([...have, ...want]));
    if (merged.length !== have.length) {
      const patch = await api("PATCH", `${cfgUrl}?updateMask=authorizedDomains`, tok, { authorizedDomains: merged });
      console.log(patch.ok
        ? `Auth: authorized domains now ${merged.join(", ")}`
        : `::warning::Could not add ewieds.github.io to authorized domains (${patch.status}). Add it under Auth -> Settings -> Authorized domains.`);
    } else {
      console.log("Auth: ewieds.github.io already authorized.");
    }
  } else {
    console.log(`::warning::Could not read Auth config (${cfg.status}). Add ewieds.github.io under Auth -> Settings -> Authorized domains.`);
  }
})().catch((e) => { console.error("SETUP error:", e.message); process.exit(0); /* never fail the run */ });
