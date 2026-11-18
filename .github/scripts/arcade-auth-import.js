// IMPORT side (ewieds, NEW admin key). Recreates every Auth user on the new
// project with the SAME uid + email, so all Firestore data keyed by uid just works.
//
// Two modes:
//  - SIGNER_KEY set  -> bulk import the original password hashes; everyone keeps
//    their exact password (no change for anyone).
//  - SIGNER_KEY unset -> create each account with a one-time placeholder password
//    (MIG_TEMP). The arcade sign-in page uses it behind the scenes so a user just
//    types their email + a new password once and that becomes their password — no
//    reset email. A later cleanup pass retires the placeholder.
// Either way the uid is preserved, so scores and private saves land correctly.
//
// Usage: node arcade-auth-import.js <authDumpFile>
//   env SA         = new project service-account JSON (FB_NEW_SA)
//   env SIGNER_KEY = (optional) old project's base64 password-hash signer key
//   env MIG_TEMP   = one-time placeholder password (must match the sign-in page)
//   env SALT_SEP / ROUNDS / MEM_COST = optional scrypt params (Firebase defaults)

const admin = require("firebase-admin");
const fs = require("fs");

const sa = JSON.parse(process.env.SA);
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const auth = admin.auth();

const SIGNER_KEY = process.env.SIGNER_KEY || "";
const havePw = !!SIGNER_KEY;
const TEMP = process.env.MIG_TEMP || "lzmig_042032c5780167d80d95";
const hash = havePw ? {
  algorithm: "SCRYPT",
  key: Buffer.from(SIGNER_KEY, "base64"),
  saltSeparator: Buffer.from(process.env.SALT_SEP || "Bw==", "base64"),
  rounds: parseInt(process.env.ROUNDS || "8", 10),
  memoryCost: parseInt(process.env.MEM_COST || "14", 10),
} : null;

(async () => {
  const { users } = JSON.parse(fs.readFileSync(process.argv[2] || "auth-dump.json", "utf8"));
  const list = users.filter((u) => u.email);

  if (havePw) {
    // Preserve passwords: bulk import with original hashes.
    const records = list.map((u) => {
      const r = { uid: u.uid, email: u.email, emailVerified: u.emailVerified, disabled: u.disabled };
      if (u.displayName) r.displayName = u.displayName;
      if (u.photoURL) r.photoURL = u.photoURL;
      if (u.passwordHash) {
        r.passwordHash = Buffer.from(u.passwordHash, "base64");
        if (u.passwordSalt) r.passwordSalt = Buffer.from(u.passwordSalt, "base64");
      }
      return r;
    });
    let ok = 0, fail = 0;
    for (let i = 0; i < records.length; i += 1000) {
      const res = await auth.importUsers(records.slice(i, i + 1000), { hash });
      ok += res.successCount; fail += res.failureCount;
      res.errors.forEach((e) => console.log(`  import[${i + e.index}]: ${e.error.message}`));
    }
    console.log(`Auth import: ${ok} ok, ${fail} failed. Passwords PRESERVED.`);
    return;
  }

  // No signer key: create each account with the one-time placeholder password.
  let created = 0, updated = 0, fail = 0;
  for (const u of list) {
    const props = {
      uid: u.uid, email: u.email, emailVerified: u.emailVerified,
      disabled: u.disabled, password: TEMP,
    };
    if (u.displayName) props.displayName = u.displayName;
    if (u.photoURL) props.photoURL = u.photoURL;
    try { await auth.createUser(props); created++; }
    catch (e) {
      if (e.code === "auth/uid-already-exists" || e.code === "auth/email-already-exists") {
        try { await auth.updateUser(u.uid, { password: TEMP, email: u.email }); updated++; }
        catch (e2) { console.log(`  update ${u.uid}: ${e2.message}`); fail++; }
      } else { console.log(`  create ${u.uid}: ${e.message}`); fail++; }
    }
  }
  console.log(`Auth import: ${created} created, ${updated} refreshed, ${fail} failed. One-time password set (reset-free sign-in).`);
})().catch((e) => { console.error("AUTH IMPORT FAILED:", e); process.exit(1); });
