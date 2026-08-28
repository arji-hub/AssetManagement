import { useState, useEffect, useMemo } from "react";
import { subscribeToReports } from "../../services/report";
import { useAuth } from "../../context/AuthContext";
import ROLES from "../../data/roles";
import { STATUS_GROUPS } from "../../data/reports";
import { getReportType } from "../../utils/report";
import useReportFilter from "./useReportFilter";

export function useReports() {
  const { user, role } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("incident");
  const [showReportModal, setShowReportModal] = useState(false);
  const filter = useReportFilter();

  const handleReportIncident = () => setShowReportModal(true);
  const handleModalClose = () => setShowReportModal(false);

  // "repair" always filters to damaged, regardless of the top filter segment
  const statusFilter = activeTab === "repair" ? "damaged" : filter.statusFilter;

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const uidFilter = role === ROLES.ADMIN ? undefined : user.uid;

    const unsubscribe = subscribeToReports(
      uidFilter,
      (reports) => {
        setData(reports);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [role, user]);

  const allowedStatuses = STATUS_GROUPS[activeTab] || [];

  const items = useMemo(() => {
    return data.filter((r) => {
      if (!allowedStatuses.includes(r.status)) return false;
      if (statusFilter === "all") return true;
      if (Array.isArray(statusFilter))
        return statusFilter.includes(getReportType(r));
      return getReportType(r) === statusFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, activeTab, statusFilter]);

  return {
    data: items,
    loading,
    error,
    activeTab,
    setActiveTab,
    showReportModal,
    handleReportIncident,
    handleModalClose,
    filter,
  };
}
