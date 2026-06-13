/**
 * One-time script to set the "admin" custom claim on a Firebase Auth user.
 *
 * HOW TO RUN:
 *   1. Make sure you have a service account key downloaded from:
 *      Firebase Console → Project Settings → Service Accounts → Generate New Private Key
 *   2. Save that file as serviceAccountKey.json in the functions/ folder
 *   3. Run: node setAdminClaim.js <uid-of-your-admin-account>
 *
 * You only need to run this once per admin account.
 * NEVER commit serviceAccountKey.json to GitHub — add it to .gitignore.
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const uid = process.argv[2];

if (!uid) {
  console.error("❌  Please provide a UID: node setAdminClaim.js <uid>");
  process.exit(1);
}

getAuth()
  .setCustomUserClaims(uid, { role: "admin" })
  .then(() => {
    console.log(`✅  Successfully set role: admin on user ${uid}`);
    console.log("    The user must log out and log back in for the claim to take effect.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌  Failed to set custom claim:", error);
    process.exit(1);
  });