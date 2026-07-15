import { useState } from "react";
import useReportFilter from "./useReportFilter";

function useReportPage() {
  const [activeTab, setActiveTab] = useState("incident");
  const [showReportModal, setShowReportModal] = useState(false);

  const filter = useReportFilter();

  const handleReportIncident = () => setShowReportModal(true);
  const handleModalClose = () => {
    setShowReportModal(false);
  };

  return {
    activeTab,
    setActiveTab,
    showReportModal,
    handleReportIncident,
    handleModalClose,
    filter,
  };
}

export default useReportPage;
