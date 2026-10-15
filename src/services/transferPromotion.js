/**
 * services/transferPromotion.js
 *
 * Promote custodian to full-time (admin only).
 */
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";
import { getName, getAdmin } from "./user";
import ROLES from "../data/roles";
import { groupAssetsByPropertyCustodian } from "../utils/transfer";
import { ASSET_COLLECTION } from "./transferShared";
import {
  findAssetsWithOpenTransfer,
  assertNoOpenTransferForAssets,
  addTransferRequest,
} from "./transferRequest";

/** Asset docs where `custodianId` is the local MR. */
async function fetchLocalMrAssetDocs(custodianId) {
  const snap = await getDocs(
    query(
      collection(db, ASSET_COLLECTION),
      where("local_mr", "==", custodianId),
    ),
  );
  return snap.docs;
}

export async function getPromotionBlockers(custodianId) {
  const assetDocs = await fetchLocalMrAssetDocs(custodianId);
  return findAssetsWithOpenTransfer(assetDocs.map((d) => d.id));
}

async function resolveRequester(requestedBy) {
  if (requestedBy?.uid) return requestedBy;

  const admin = await getAdmin();
  if (!admin) throw new Error("No admin found to file the transfer request.");
  return { uid: admin.uid, name: admin.fullname, role: ROLES.ADMIN };
}

export async function createPromotionTransferRequest(custodianId, requestedBy) {
  if (!custodianId) throw new Error("Custodian ID is required.");

  // 1. Group the custodian's local-MR assets by current property custodian.
  const assetDocs = await fetchLocalMrAssetDocs(custodianId);
  const groups = groupAssetsByPropertyCustodian(assetDocs, custodianId);
  if (groups.size === 0) return [];

  // 2. Check every asset up front so we don't half-create requests.
  const allAssetIds = [...groups.values()].flatMap((items) =>
    items.map((i) => i.asset_id),
  );
  await assertNoOpenTransferForAssets(allAssetIds);

  // 3. Resolve requester + notes.
  const requester = await resolveRequester(requestedBy);
  const custodian = await getName(custodianId);
  const notes = `Auto-generated upon promotion of ${custodian?.fullname ?? "custodian"} to full-time.`;

  // 4. One request per group:
  //    has property custodian -> TRANSFER (FULLTIME -> FULLTIME)
  //    no property custodian  -> ASSIGN   (from = null)
  const created = [];
  for (const [propertyCustodianUid, items] of groups) {
    try {
      const request = await addTransferRequest(
        {
          items,
          from: propertyCustodianUid
            ? { uid: propertyCustodianUid, role: ROLES.FULLTIME }
            : null,
          to: { uid: custodianId, role: ROLES.FULLTIME },
          notes,
        },
        requester.uid,
        requester.name,
        requester.role,
      );
      created.push(request);
    } catch (err) {
      throw new Error(
        `Created ${created.length} of ${groups.size} transfer request(s) before failing: ${err.message}`,
      );
    }
  }

  return created;
}
