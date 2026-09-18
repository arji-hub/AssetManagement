import { useCustodianTransfer } from "./overview/useCustodianTransfer";
import { useLocalMRTransfer } from "./overview/useLocalMRTransfer";
import { useRoomTransfer } from "./overview/useRoomTransfer";

/**
 * Powers TransferOverview for all three entry points:
 *   - "custodian": Transfer Asset button on Transfer.jsx  → useCustodianTransfer
 *   - "localMR":   Local MR button on Transfer.jsx         → useLocalMRTransfer
 *   - "room":      Move Asset button on TransferRoom.jsx   → useRoomTransfer
 *
 * Each variant is now its own self-contained hook (see the three files
 * in this folder) instead of one hook with heavy internal branching by
 * variant/role. This file just dispatches to the right one, so
 * TransferOverview.jsx's `useTransferOverview(variant)` call site and
 * the object it destructures don't need to change.
 *
 * ⚠️ Rules-of-hooks caveat: this relies on `variant` being a literal
 * passed once per mounted TransferOverview instance (Transfer.jsx and
 * TransferRoom.jsx each render it with a fixed variant prop) — it must
 * never change on an already-mounted component, since that would swap
 * which hook runs between renders. If that ever stops being guaranteed,
 * add `key={variant}` where TransferOverview is rendered so React
 * remounts it on a variant change, rather than relying on this branch.
 */
export function useTransferOverview(variant) {
  if (variant === "room") return useRoomTransfer();
  if (variant === "localMR") return useLocalMRTransfer();
  return useCustodianTransfer();
}
