import { useState, useEffect, useMemo, useCallback } from "react";
import { addCustodian, fetchCustodians } from "../../services/user";

export function useCustodian() {
  // ── Custodians list ───────────────────────────
  const [custodians, setCustodians] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const loadCustodians = useCallback(async () => {
    try {
      const data = await fetchCustodians();
      setCustodians(data);
    } catch (err) {
      console.error("Failed to fetch custodians:", err);
    }
  }, []);

  useEffect(() => {
    setIsFetching(true);
    loadCustodians().finally(() => setIsFetching(false));
  }, [loadCustodians]);

  // ── Role filter ──────────────────────────────────────────────
  const [roleFilter, setRoleFilter] = useState("all");

  const handleRoleFilter = useCallback((value) => {
    setRoleFilter(value);
  }, []);

  const filteredCustodians = useMemo(() => {
    if (roleFilter === "all") return custodians;
    return custodians.filter((c) => c.role === roleFilter);
  }, [custodians, roleFilter]);

  // ── Add Custodian modal ──────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  // ── Status modal ──────────────────────────────────────────────────────────
  // "idle" | "loading" | "success" | "error"
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState(null);

  const handleAddCustodian = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      setShowModal(false);
      setStatus("loading");
      setSubmitError(null);

      try {
        await addCustodian(formData);
        // Re-fetch so the new custodian appears in the list
        await loadCustodians();
        setStatus("success");
      } catch (error) {
        console.error("Failed to add custodian:", error);
        setSubmitError(
          error.message || "Something went wrong. Please try again.",
        );
        setStatus("error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadCustodians],
  );

  const handleStatusClose = useCallback(() => {
    setStatus("idle");
    setSubmitError(null);
  }, []);

  return {
    // list + filter
    custodians: filteredCustodians,
    isFetching,
    roleFilter,
    handleRoleFilter,

    // add custodian modal
    showModal,
    openModal,
    closeModal,
    isSubmitting,
    handleAddCustodian,

    // status modal
    status,
    submitError,
    handleStatusClose,
  };
}
