import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { ROLES } from "../../data/roles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Report.css";
import ReportPanel from "../../components/panel/ReportPanel";
import { today } from "../../utils/date";

const TABS = [
  { label: "Incident Reports", path: "/report" },
  { label: "For Repair", path: "/repair" },
  { label: "Condemnation", path: "/condemn" },
];

function Report() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = role === ROLES.ADMIN;

  const handleReportIncident = () => {
    // TODO: open report incident modal / navigate to form
  };

  const handleConditionFilter = () => {
    // TODO: condition filter dropdown logic
  };

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
            {/* Condition filter */}
            <button
              className="report-filter-btn"
              onClick={handleConditionFilter}
            >
              <FontAwesomeIcon icon="fa-solid fa-sliders" />
              Condition
              <FontAwesomeIcon icon="fa-solid fa-chevron-down" />
            </button>

            {/* Report Incident */}
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
              key={tab.path}
              className={`report-tab${
                location.pathname === tab.path ? " report-tab--active" : ""
              }`}
              onClick={() => navigate(tab.path)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* table */}
        <div className="report-table-wrap">
          <ReportPanel />
        </div>
      </div>
    </MainLayout>
  );
}

export default Report;
