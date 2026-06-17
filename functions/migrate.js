const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // your firebase service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const OLD_COLLECTION = "rooms";
const NEW_COLLECTION = "room";
const BATCH_LIMIT = 500;

async function migrate() {
  console.log(`Starting migration: "${OLD_COLLECTION}" → "${NEW_COLLECTION}"`);

  const snapshot = await db.collection(OLD_COLLECTION).get();

  if (snapshot.empty) {
    console.log(`No documents found in "${OLD_COLLECTION}". Exiting.`);
    return;
  }

  const total = snapshot.docs.length;
  console.log(`Found ${total} documents. Copying...`);

  // Split docs into chunks of 500 (Firestore batch limit)
  const chunks = [];
  for (let i = 0; i < snapshot.docs.length; i += BATCH_LIMIT) {
    chunks.push(snapshot.docs.slice(i, i + BATCH_LIMIT));
  }

  // Copy in batches
  for (let i = 0; i < chunks.length; i++) {
    const batch = db.batch();
    chunks[i].forEach((docSnap) => {
      const newDocRef = db.collection(NEW_COLLECTION).doc(docSnap.id);
      batch.set(newDocRef, docSnap.data());
    });
    await batch.commit();
    console.log(
      `Batch ${i + 1}/${chunks.length} copied (${chunks[i].length} docs)`,
    );
  }

  console.log(
    `\n✅ Done! All ${total} documents copied to "${NEW_COLLECTION}".`,
  );
  console.log(`⚠️  Old collection "${OLD_COLLECTION}" was NOT deleted.`);
  console.log(
    `   Verify the new collection in Firebase Console, then delete the old one manually.`,
  );
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
