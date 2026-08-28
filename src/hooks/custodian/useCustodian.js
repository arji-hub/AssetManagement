import { useState, useEffect, useMemo, useCallback } from "react";
import { addCustodian, fetchCustodians } from "../../services/user";
import { ROLES } from "../../data/roles";

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

  // ── Filter (role tabs + archive) ──────────────────────────────
  const [activeFilter, setActiveFilter] = useState(ROLES.FULLTIME);

  const handleFilterChange = useCallback((key) => {
    setActiveFilter(key);
  }, []);

  // ── Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  // ── Asset count filter ─────────────────────────────────────────
  const [assetCountFilter, setAssetCountFilter] = useState("");

  const isActive = (c) => c.status !== "inactive";

  const filteredCustodians = useMemo(() => {
    const byTab =
      activeFilter === "archive"
        ? custodians.filter((c) => c.status === "inactive")
        : custodians.filter((c) => isActive(c) && c.role === activeFilter);

    const bySearch = searchQuery.trim()
      ? byTab.filter((c) => {
          const q = searchQuery.toLowerCase();
          return (
            c.fullname?.toLowerCase().includes(q) ||
            c.username?.toLowerCase().includes(q)
          );
        })
      : byTab;

    return bySearch.filter((c) => {
      if (assetCountFilter === "none") return c.asset_count === 0;
      if (assetCountFilter === "low")
        return c.asset_count >= 1 && c.asset_count <= 10;
      if (assetCountFilter === "medium")
        return c.asset_count >= 11 && c.asset_count <= 50;
      if (assetCountFilter === "high") return c.asset_count > 50;
      return true;
    });
  }, [custodians, activeFilter, searchQuery, assetCountFilter]);

  // ── Add Custodian modal ──────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  // ── Status modal ──────────────────────────────────────────────────────────
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState(null);

  const handleAddCustodian = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      setStatus("loading");
      setSubmitError(null);

      try {
        await addCustodian(formData);
        await loadCustodians();
        setStatus("success");
        setShowModal(false);
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
    activeFilter,
    handleFilterChange,

    // search
    searchQuery,
    setSearchQuery,

    // asset count filter
    assetCountFilter,
    setAssetCountFilter,

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
