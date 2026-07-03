import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../data/roles";
import { fetchTransferByID, updateTransferRequest } from "../services/transfer";
import { TRANSFER_TYPE_LABELS, TRANSFER_TYPES } from "../data/transfer";

export function useTransferInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { role, user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRequest = () => {
    setLoading(true);
    return fetchTransferByID(id)
      .then((data) => {
        setRequest(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isCompleted = request?.status === "completed";
  const isDenied = request?.status === "denied";
  const isResolved = isCompleted || isDenied;

  const typeLabel = request
    ? (TRANSFER_TYPE_LABELS[request.type] ?? request.type)
    : null;

  const ackAdmin = request?.acknowledgments?.admin ?? null;

  // Local MR requests store from=localmr, to=custodian. reverse the display for REMOVEMR
  // "custodian -> mr" display regardless of assign/remove direction.
  const isRemoveMR = request?.type === TRANSFER_TYPES.REMOVEMR;

  const ackFrom = isRemoveMR
    ? request?.acknowledgments?.to?.uid
      ? request.acknowledgments.to
      : null
    : request?.acknowledgments?.from?.uid
      ? request.acknowledgments.from
      : null;

  const ackTo = isRemoveMR
    ? request?.acknowledgments?.from?.uid
      ? request.acknowledgments.from
      : null
    : request?.acknowledgments?.to?.uid
      ? request.acknowledgments.to
      : null;

  let userAck;
  if (user?.uid === ackAdmin?.uid) {
    userAck = ackAdmin;
  } else if (user?.uid === ackFrom?.uid) {
    userAck = ackFrom;
  } else if (user?.uid === ackTo?.uid) {
    userAck = ackTo;
  } else {
    userAck = null;
  }
  const showActions = !isResolved && userAck?.acknowledged === false;

  const [actionModal, setActionModal] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null); // "loading" | "success" | "error" | null
  const [submitError, setSubmitError] = useState(null);

  const handleSubmitAction = async (note) => {
    const isApprove = actionModal === "approve";
    console.log("Submitting action:", isApprove ? "approve" : "decline");
    setSubmitStatus("loading");

    try {
      const fullname = `${user.firstname} ${user.lastname}`;
      await updateTransferRequest(
        id,
        { uid: user.uid, name: fullname, role: user.role },
        note,
        isApprove,
      );
      await loadRequest();
      setSubmitStatus("success");
    } catch (err) {
      setSubmitError(err.message);
      setSubmitStatus("error");
    }
  };

  const closeActionFlow = () => {
    setActionModal(null);
    setSubmitStatus(null);
    setSubmitError(null);
  };

  return {
    request,
    loading,
    error,
    typeLabel,
    ackAdmin,
    ackFrom,
    ackTo,
    showActions,
    actionModal,
    setActionModal,
    submitStatus,
    submitError,
    handleSubmitAction,
    closeActionFlow,
  };
}
