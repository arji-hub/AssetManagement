const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Firestore Trigger: onUpdateAssetLocalMR
 *
 * Watches transfer_request/{requestId} for changes. When all three
 * acknowledgments (admin, from, to) become true — and weren't
 * all true before this write — marks the request "completed" and
 * updates the asset's local_mr accordingly:
 *   - assign_localmr → sets local_mr to acknowledgments.to.uid
 *   - remove_localmr → clears local_mr to null
 *
 * Only fires for transfer_request docs whose type is assign_localmr or
 * remove_localmr; custodian-transfer requests are handled separately
 * by onUpdateAssetCustodian.
 *
 * This runs with Admin SDK privileges, bypassing Firestore rules,
 * which is required since /asset writes are admin-only and the
 * person whose action completes the chain may not be an admin.
 */
exports.onUpdateAssetLocalMR = onDocumentUpdated(
  { document: "transfer_request/{requestId}", region: "asia-southeast1" },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (!["assign_localmr", "remove_localmr"].includes(after.type)) {
      return;
    }

    if (before.status === "completed" || after.status !== "completed") {
      return;
    }

    if (!after.asset_id) return;

    const db = getFirestore();
    const assetRef = db.collection("asset").doc(after.asset_id);

    const toUid = after.acknowledgments?.to?.uid;
    const isRemoval = after.type === "remove_localmr";

    if (isRemoval) {
      await assetRef.update({
        local_mr: null,
        updated_at: FieldValue.serverTimestamp(),
      });
    } else if (toUid) {
      await assetRef.update({
        local_mr: toUid,
        updated_at: FieldValue.serverTimestamp(),
      });
    }
  },
);
