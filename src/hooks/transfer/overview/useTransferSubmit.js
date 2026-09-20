import { useCallback, useState } from "react";
import {
  addTransferRequest,
  addTransferRoom,
} from "../../../services/transfer";
import { fetchAssetByID } from "../../../services/asset";
import ROLES from "../../../data/roles";

export function useTransferSubmit({
  variant,
  selectedAssets,
  targetRoom,
  fromCustodian,
  toCustodian,
  notes,
  user,
  navigate,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [createdId, setCreatedId] = useState(null);
  const status = submitting
    ? "loading"
    : submitError
      ? "error"
      : submitSuccess
        ? "success"
        : null;

  const dismissSubmitError = useCallback(() => setSubmitError(null), []);

  const canSubmit =
    selectedAssets.length > 0 &&
    !submitting &&
    (variant === "room"
      ? targetRoom !== undefined
      : fromCustodian || toCustodian) &&
    (variant === "localMR" ? !!(fromCustodian && toCustodian) : true);

  const handleConfirm = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      if (variant === "room") {
        const roomPayloads = selectedAssets.map((asset) => ({
          asset_id: asset.id,
          asset_name: asset.description,
          room_from: asset.room_id || null,
          move_to: targetRoom?.id ?? null,
        }));

        console.log("Room Transfer Payload:", roomPayloads);

        try {
          await addTransferRoom(
            {
              items: selectedAssets.map((a) => ({
                asset_id: a.id,
                asset_name: a.description,
                room_from: a.room_id || null,
              })),
              move_to: targetRoom?.id ?? null,
            },
            user.uid,
          );
          setSubmitSuccess(true);
        } catch (err) {
          console.error("Room transfer failed:", err);
          console.error("Code:", err?.code, "| Message:", err?.message);
          console.error("Payloads:", roomPayloads);
          setSubmitError(
            err?.code ? `${err.code}: ${err.message}` : err.message,
          );
        } finally {
          setSubmitting(false);
        }
        return;
      }

      // custodian / localMR: one batched transfer_request carrying every
      // selected asset — goes through the normal ack/approve flow.
      const items = selectedAssets.map((a) => ({
        asset_id: a.id,
        asset_description: a.description,
      }));

      if (variant === "localMR") {
        try {
          const assetId = items[0]?.asset_id;
          const asset = await fetchAssetByID(assetId);

          if (asset.local_mr != null) {
            const toRole = toCustodian.role;
            const fromRole = fromCustodian.role;

            if (toRole === ROLES.PARTTIME && fromRole === ROLES.FULLTIME) {
              // swap fromCustodian and toCustodian
              [fromCustodian, toCustodian] = [toCustodian, fromCustodian];
            } else {
              setSubmitError("custodian role error");
            }
          }
        } catch (err) {
          setSubmitError(err.message);
        }
      }

      console.log("addTransferRequest payload:", {
        items,
        from: fromCustodian && {
          ...fromCustodian,
          uid: fromCustodian.id,
          role: fromCustodian.role,
        },
        to: toCustodian && {
          ...toCustodian,
          uid: toCustodian.id,
          role: toCustodian.role,
        },
        notes,
        requestedByUid: user.uid,
        requestedByName: user.firstname,
        requestedByRole: user.role,
        user,
      });

      const created = await addTransferRequest(
        {
          items,
          from: fromCustodian && {
            ...fromCustodian,
            uid: fromCustodian.id,
            role: fromCustodian.role,
          },
          to: toCustodian && {
            ...toCustodian,
            uid: toCustodian.id,
            role: toCustodian.role,
          },
          notes,
        },
        user.uid,
        user.firstname,
        user.role,
      );

      setCreatedId(created.id);
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    variant,
    selectedAssets,
    targetRoom,
    fromCustodian,
    toCustodian,
    notes,
    user,
    navigate,
  ]);

  const handleDone = useCallback(() => {
    setSubmitSuccess(false);
    if (variant === "room") {
      navigate("/transfer/room");
    } else if (createdId) {
      navigate(`/transfer/${createdId}`);
    }
  }, [variant, createdId, navigate]);

  return {
    submitting,
    submitError,
    submitSuccess,
    status,
    dismissSubmitError,
    canSubmit,
    handleConfirm,
    handleDone,
  };
}
