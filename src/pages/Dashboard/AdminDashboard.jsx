import React from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faClockRotateLeft,
  faClipboardCheck,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import MainLayout from "../../components/layout/MainLayout";
import {
  ReportReminderPanel,
  AssetDashboardPanel,
  AssetStatusDashboardPanel,
  ReportDashboardPanel,
  TransferDashboardPanel,
  AuditDashboardPanel,
  AuditAttentionDashboardPanel,
} from "../../components/dashboard";

import "./AdminDashboard.css";
import "./Dashboard.css";

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="dashboard admin-dashboard">
        <ReportReminderPanel user={user} />
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
        <section
          className="dashboard-section"
          aria-labelledby="audits-section-title"
        >
          <div className="dashboard-section-header">
            <div className="dashboard-section-title" id="audits-section-title">
              <FontAwesomeIcon
                icon={faClipboardCheck}
                className="dashboard-section-icon"
              />
              <span>Audits</span>
            </div>
            <button
              type="button"
              className="dashboard-section-menu"
              aria-label="Audits section options"
            >
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </div>

          <div className="dashboard-section-grid">
            <AuditDashboardPanel user={user} />
            <AuditAttentionDashboardPanel user={user} />
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default AdminDashboard;
