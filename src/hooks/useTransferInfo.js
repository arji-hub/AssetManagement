import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../data/roles";
import { fetchTransferByID, updateTransferRequest } from "../services/transfer";
import { TRANSFER_TYPE_LABELS } from "../data/transfer";

export function useTransferInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { role, user } = useAuth();
  const isAdmin = role === ROLES.ADMIN;

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

  const isPending = request?.status === "pending";
  const isForApproval = request?.status === "for_approval";
  const isCompleted = request?.status === "completed";
  const isDenied = request?.status === "denied";
  const isResolved = isCompleted || isDenied;

  const typeLabel = request
    ? (TRANSFER_TYPE_LABELS[request.type] ?? request.type)
    : null;

  const ackAdmin = request?.acknowledgments?.admin ?? null;
  const ackFrom = request?.acknowledgments?.from ?? null;
  const ackTo = request?.acknowledgments?.to ?? null;

  const userAck =
    user?.uid === ackAdmin?.uid
      ? ackAdmin
      : user?.uid === ackFrom?.uid
        ? ackFrom
        : user?.uid === ackTo?.uid
          ? ackTo
          : null;

  const showActions = !isResolved && userAck?.acknowledged === false;

  const [actionModal, setActionModal] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null); // "loading" | "success" | "error" | null
  const [submitError, setSubmitError] = useState(null);

  const handleBack = () => navigate("/transfer");

  const handleSubmitAction = async (note) => {
    const isApprove = actionModal === "approve";
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
    isAdmin,
    user,
    isPending,
    isForApproval,
    isCompleted,
    isDenied,
    isResolved,
    typeLabel,
    ackAdmin,
    ackFrom,
    ackTo,
    handleBack,
    showActions,
    actionModal,
    setActionModal,
    submitStatus,
    submitError,
    handleSubmitAction,
    closeActionFlow,
  };
}   