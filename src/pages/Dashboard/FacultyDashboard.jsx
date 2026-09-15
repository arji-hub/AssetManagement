import React from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faClockRotateLeft,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import MainLayout from "../../components/layout/MainLayout";
import {
  AssetDashboardPanel,
  AssetStatusDashboardPanel,
  ReportDashboardPanel,
  TransferDashboardPanel,
} from "../../components/dashboard";

import "./FacultyDashboard.css";
import "./Dashboard.css";

function FacultyDashboard() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="dashboard faculty-dashboard">
        <section
          className="dashboard-section"
          aria-labelledby="assets-section-title"
        >
          <div className="dashboard-section-header">
            <div className="dashboard-section-title" id="assets-section-title">
              <FontAwesomeIcon
                icon={faBoxesStacked}
                className="dashboard-section-icon"
              />
              <span>Assets</span>
            </div>
            <button
              type="button"
              className="dashboard-section-menu"
              aria-label="Assets section options"
            >
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </div>

          <div className="dashboard-section-grid">
            <AssetDashboardPanel user={user} />
            <AssetStatusDashboardPanel user={user} />
          </div>
        </section>

        <section
          className="dashboard-section"
          aria-labelledby="events-section-title"
        >
          <div className="dashboard-section-header">
            <div className="dashboard-section-title" id="events-section-title">
              <FontAwesomeIcon
                icon={faClockRotateLeft}
                className="dashboard-section-icon"
              />
              <span>Events</span>
            </div>
            <button
              type="button"
              className="dashboard-section-menu"
              aria-label="Events section options"
            >
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </div>

          <div className="dashboard-section-grid">
            <ReportDashboardPanel user={user} />
            <TransferDashboardPanel user={user} />
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default FacultyDashboard;
