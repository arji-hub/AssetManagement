import { useState, useEffect } from "react";
import useReportFilter from "./useReportFilter";

function useReportPage() {
  const [activeTab, setActiveTab] = useState("incident");
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filter = useReportFilter();

  useEffect(() => {
    console.log("[ReportPage] activeTab:", activeTab);
  }, [activeTab]);

  const handleReportIncident = () => setShowReportModal(true);
  const handleModalClose = () => setShowReportModal(false);

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      console.log("add report: ", formData);
      setShowReportModal(false);
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    showReportModal,
    isSubmitting,
    handleReportIncident,
    handleModalClose,
    handleModalSubmit,
    filter,
  };
}

export default useReportPage;