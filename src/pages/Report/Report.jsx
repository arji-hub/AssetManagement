import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { ROLES } from "../../data/roles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Report.css";
import ReportPanel from "../../components/panel/ReportPanel";
import ReportModal from "../../components/ui/modal/ReportModal";
import { today } from "../../utils/date";
import useReportPage from "../../hooks/useReportPage";
import { TABS } from "../../data/reports";
import { useReports } from "../../hooks/useReports";

function Report() {
  const { data: reports, loading, error } = useReports();
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;

  const {
    activeTab,
    setActiveTab,
    showReportModal,
    handleReportIncident,
    handleModalClose,
    filter,
  } = useReportPage();

  return (
    <MainLayout>
      <div className="report-page">
        {/* header */}
        <div className="report-header">
          <div className="report-header-left">
            <h1 className="report-title">Reports</h1>
            <p className="report-date">{today}</p>
          </div>

          <div className="report-header-right">
            <div className="report-filter-segment">
              {[
                { value: "all", label: "All" },
                { value: "damaged", label: "Damaged" },
                { value: "missing", label: "Missing" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`report-filter-option ${
                    filter.statusFilter === opt.value
                      ? "report-filter-option--active"
                      : ""
                  }`}
                  onClick={() => filter.handleStatusFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              className="report-incident-btn"
              onClick={handleReportIncident}
            >
              Report Incident
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="report-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`report-tab${
                activeTab === tab.key ? " report-tab--active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="report-table-wrap">
          {activeTab === "incident" && (
            <ReportPanel
              group="incident"
              statusFilter={filter.statusFilter}
              reports={reports}
              loading={loading}
              error={error}
            />
          )}
          {activeTab === "repair" && (
            <ReportPanel
              group="repair"
              statusFilter={["damaged", "missing", "for_repair", "found"]}
              reports={reports}
              loading={loading}
              error={error}
            />
          )}
          {activeTab === "resolved" && (
            <ReportPanel
              group="resolved"
              statusFilter={["working"]}
              reports={reports}
              loading={loading}
              error={error}
            />
          )}
          {activeTab === "archive" && (
            <ReportPanel
              group="archive"
              statusFilter={["condemned"]}
              reports={reports}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>

      {showReportModal && <ReportModal onClose={handleModalClose} />}
    </MainLayout>
  );
}

export default Report;
