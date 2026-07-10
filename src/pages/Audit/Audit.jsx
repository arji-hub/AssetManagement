import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { displayDate } from "../../utils/date";
import AuditRoom from "../../components/panel/AuditRoom";
import AuditReport from "../../components/panel/AuditReport";
import AuditHistory from "../../components/panel/AuditHistory";
import "./Audit.css";

function Audit() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="audit-page">
        <div className="audit-header">
          <div>
            <h2 className="audit-title">Asset Audit</h2>
            <p className="audit-subtitle">
              Institutional resource verification and tracking
            </p>
          </div>
          <p className="audit-date">{displayDate}</p>
        </div>

        <div className="audit-panels">
          <AuditRoom />
          <AuditReport />
        </div>

        <AuditHistory />
      </div>
    </MainLayout>
  );
}

export default Audit;
