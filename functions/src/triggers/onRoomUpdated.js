const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const db = getFirestore();

exports.onRoomUpdated = onDocumentUpdated(
  { document: "room/{roomID}", region: "asia-southeast1" },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const roomID = event.params.roomID;

    // Only act when the name actually changed — avoids re-running
    // this on every unrelated room update (e.g. assetCount bumps)
    if (before.name === after.name) return;

    const assetsSnap = await db
      .collection("asset")
      .where("room_id", "==", roomID)
      .get();

    if (assetsSnap.empty) return;

    const BATCH_LIMIT = 500;
    const docs = assetsSnap.docs;

    for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
      const chunk = docs.slice(i, i + BATCH_LIMIT);
      const batch = db.batch();

      chunk.forEach((assetDoc) => {
        batch.update(assetDoc.ref, {
          room_name: after.name,
          updated_at: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    }
  },
);
