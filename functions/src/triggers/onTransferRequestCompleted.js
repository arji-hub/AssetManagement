const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions/v2");

/**
 * Firestore Trigger: onTransferRequestCompleted
 *
 * Watches transfer_request/{requestId} for changes. When all three
 * acknowledgments (admin, from, to) become true — and weren't all
 * true before this write — marks the request "completed" and updates
 * the corresponding asset field depending on the request type:
 *   - assign_localmr   → sets local_mr to acknowledgments.to.uid
 *   - remove_localmr   → clears local_mr to null
 *   - remove_custodian → clears property_custodian to null
 *   - (all other types, e.g. assign_custodian, transfer_custodian)
 *                      → sets property_custodian to acknowledgments.to.uid
 *
 * This runs with Admin SDK privileges, bypassing Firestore rules,
 * which is required since /asset writes are admin-only and the
 * person whose action completes the chain may not be an admin.
 *
 * Named "Completed" (not "Updated") to avoid colliding with
 * onTransferRequestUpdated in onTransferRequestNotify.js, which
 * handles email notifications on the same document path.
 *
 * Replaces the previously separate onUpdateAssetCustodian and
 * onUpdateAssetLocalMR triggers, which both listened on this same
 * document path and doubled invocation/cold-start overhead.
 */

exports.onTransferRequestCompleted = onDocumentUpdated(
  { document: "transfer_request/{requestId}", region: "asia-southeast1" },
  async (event) => {
    const { requestId } = event.params;
    const before = event.data.before.data();
    const after = event.data.after.data();

    try {
      if (before.status === "completed" || after.status !== "completed") {
        return;
      }

      const assetIds = after.asset_ids;
      if (!Array.isArray(assetIds) || assetIds.length === 0) {
        logger.warn(
          `transfer_request/${requestId} completed but missing asset_ids — skipping asset update.`,
          { requestId, type: after.type },
        );
        return;
      }

      const db = getFirestore();

      const toUid = after.acknowledgments?.to?.uid;
      const isLocalMr = ["assign_localmr", "remove_localmr"].includes(
        after.type,
      );
      const isRemoval = ["remove_localmr", "remove_custodian"].includes(
        after.type,
      );
      const fieldName = isLocalMr ? "local_mr" : "property_custodian";

      if (isRemoval) {
        const batch = db.batch();
        assetIds.forEach((assetId) => {
          batch.update(db.collection("asset").doc(assetId), {
            [fieldName]: null,
            updated_at: FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
        logger.info(
          `transfer_request/${requestId}: cleared ${fieldName} on ${assetIds.length} asset(s).`,
          { requestId, assetIds, type: after.type },
        );
      } else if (toUid) {
        const batch = db.batch();
        assetIds.forEach((assetId) => {
          batch.update(db.collection("asset").doc(assetId), {
            [fieldName]: toUid,
            updated_at: FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
        logger.info(
          `transfer_request/${requestId}: set ${fieldName} to ${toUid} on ${assetIds.length} asset(s).`,
          { requestId, assetIds, type: after.type, toUid },
        );
      } else {
        logger.warn(
          `transfer_request/${requestId} completed but missing acknowledgments.to.uid — no asset update performed.`,
          { requestId, type: after.type },
        );
      }
    } catch (err) {
      logger.error(
        `onTransferRequestUpdated failed for transfer_request/${requestId}: ${err.message}`,
        {
          requestId,
          error: err.stack,
          type: after?.type,
          assetIds: after?.asset_ids,
        },
      );
      // Re-throw so Cloud Functions marks this invocation as failed,
      // which surfaces it in Cloud Monitoring/Error Reporting and
      // makes retries/alerting behave correctly.
      throw err;
    }
  },
);
