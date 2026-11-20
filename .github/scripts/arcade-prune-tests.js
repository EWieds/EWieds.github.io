// Removes throwaway QA/test artifacts from the arcade (accounts/usernames/games
// whose owner name or email marks them as automated test data). Safe to run any
// time: real players never match the "ctest"/"codetest_" markers.
//   env SA = new project service-account JSON (FB_NEW_SA)

const admin = require("firebase-admin");
const sa = JSON.parse(process.env.SA);
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const db = admin.firestore();
const isTestName = (s) => /^ctest/i.test(String(s || ""));

(async () => {
  let games = 0, names = 0, users = 0;
  const cg = await db.collection("communityGames").get();
  for (const d of cg.docs) if (isTestName(d.data().ownerName)) { await d.ref.delete(); games++; }
  const un = await db.collection("usernames").get();
  for (const d of un.docs) if (isTestName(d.data().username)) { await d.ref.delete(); names++; }
  let token;
  do {
    const r = await admin.auth().listUsers(1000, token);
    for (const u of r.users) if ((u.email || "").startsWith("codetest_")) { try { await admin.auth().deleteUser(u.uid); users++; } catch (e) {} }
    token = r.pageToken;
  } while (token);
  console.log(`pruned test data: ${games} games, ${names} usernames, ${users} auth users`);
})().catch((e) => { console.error("prune error:", e.message); process.exit(0); });
