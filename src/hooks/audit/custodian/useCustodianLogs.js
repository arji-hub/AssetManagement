// src/hooks/audit/useCustodianLogs.js
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCustodians } from "../../../services/user";

function useCustodianLogs() {
  const navigate = useNavigate();

  // ── Custodians ────────────────────────────────────────────────────────
  const [custodians, setCustodians] = useState([]);
  const [custodiansLoading, setCustodiansLoading] = useState(true);
  const [custodiansError, setCustodiansError] = useState("");

  // ── Search ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // == Data loading ==========================================================
  useEffect(() => {
    setCustodiansLoading(true);
    setCustodiansError("");

    fetchCustodians()
      .then(setCustodians)
      .catch((err) =>
        setCustodiansError(err.message ?? "Failed to load custodians."),
      )
      .finally(() => setCustodiansLoading(false));
  }, []);

  // == Derived state ==========================================================
  const filteredCustodians = useMemo(() => {
    const query = search.trim().toLowerCase();

    return custodians.filter((custodian) => {
      const assetCount = custodian.asset_count ?? 0;
      if (assetCount <= 0) return false;

      if (!query) return true;

      const name = (custodian.fullname || "").toLowerCase();
      const username = (custodian.username || "").toLowerCase();
      return name.includes(query) || username.includes(query);
    });
  }, [custodians, search]);

  const totalAssetsInCustody = useMemo(
    () => filteredCustodians.reduce((sum, c) => sum + (c.asset_count ?? 0), 0),
    [filteredCustodians],
  );

  const avgAssetsPerCustodian = useMemo(() => {
    if (filteredCustodians.length === 0) return 0;
    return Math.round(totalAssetsInCustody / filteredCustodians.length);
  }, [filteredCustodians, totalAssetsInCustody]);

  // == Actions ==========================================================

  const handleCustodianClick = (username) => navigate(`/custodian/${username}`);

  return {
    custodians: filteredCustodians,
    custodiansLoading,
    custodiansError,
    search,
    setSearch,
    handleCustodianClick,
    totalAssetsInCustody,
    avgAssetsPerCustodian,
  };
}

export default useCustodianLogs;
