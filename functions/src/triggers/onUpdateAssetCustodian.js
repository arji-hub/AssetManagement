const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Firestore Trigger: onUpdateAssetCustodian
 *
 * Watches transfer_request/{requestId} for changes. When all three
 * acknowledgments (admin, from, to) become true — and weren't all
 * true before this write — marks the request "completed" and
 * reassigns the asset's custodian to the "to" party.
 *
 * This runs with Admin SDK privileges, bypassing Firestore rules,
 * which is required since /asset writes are admin-only and the
 * person whose action completes the chain may not be an admin.
 */
exports.onUpdateAssetCustodian = onDocumentUpdated(
  { document: "transfer_request/{requestId}", region: "asia-southeast1" },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (["assign_localmr", "remove_localmr"].includes(after.type)) {
      return;
    }

    if (before.status === "completed" || after.status !== "completed") {
      return;
    }

    if (!after.asset_id) return;

    const db = getFirestore();
    const assetRef = db.collection("asset").doc(after.asset_id);

    const toUid = after.acknowledgments?.to?.uid;
    const isRemoval = after.type === "remove_custodian";

    if (isRemoval) {
      await assetRef.update({
        property_custodian: null,
        updated_at: FieldValue.serverTimestamp(),
      });
    } else if (toUid) {
      await assetRef.update({
        property_custodian: toUid,
        updated_at: FieldValue.serverTimestamp(),
      });
    }
  },
);
