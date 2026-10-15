/**
 * services/transfer.js
 *
 * Public entry point for the transfer service. Everything is re-exported
 * from the modules below, so existing `import { ... } from "./transfer"`
 * statements keep working unchanged.
 *
 *   transferRequest.js    1. Transfer request reads, guards, writes, condemn
 *   transferRoom.js       2. Transfer room reads, writes, initial assignment
 *   transferDashboard.js  3. Dashboard trend + pending-summary subscriptions
 *   transferPromotion.js  4. Promote custodian to full-time (admin only)
 *   transferShared.js     internal helpers (not re-exported)
 */
export {
  fetchAction,
  fetchRequested,
  fetchLogs,
  subscribeToAction,
  subscribeToRequested,
  subscribeToLogs,
  subscribeToTransferByID,
  subscribeToTransfersByAsset,
  addTransferRequest,
  updateTransferRequest,
  logInitialCustodianAssignment,
  condemnAsset,
} from "./transferRequest";

export {
  subscribeToRoomTransfersByAsset,
  subscribeToRoomLogs,
  fetchRoomTransferByID,
  addTransferRoom,
  logInitialRoomAssignment,
} from "./transferRoom";

export {
  subscribeToTransferActivityTrend,
  subscribeToCustodianAssignmentTrend,
  subscribeToPendingSummary,
} from "./transferDashboard";

export {
  getPromotionBlockers,
  createPromotionTransferRequest,
} from "./transferPromotion";
