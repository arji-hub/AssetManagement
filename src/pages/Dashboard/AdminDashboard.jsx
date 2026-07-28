import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { useAssetSummary } from "../../hooks/dashboard/useAssetSummary";
import { useRoomsAndCategories } from "../../hooks/dashboard/useRoomsAndCategories";
import { useCustodianCount } from "../../hooks/dashboard/useCustodianCount";
import { useReportSummary } from "../../hooks/dashboard/useReportSummary";
import { useTransferSummary } from "../../hooks/dashboard/useTransferSummary";
import { useAuditSummary } from "../../hooks/dashboard/useAuditSummary";
import {
  StatCard,
  DonutChart,
  CategoryBarList,
  AuditProgressCard,
} from "../../components/dashboard";
import "./dashboard.css";

function AdminDashboard() {
  const { user } = useAuth();

  const assetSummary = useAssetSummary(user);
  const roomsAndCategories = useRoomsAndCategories(user, assetSummary.assets);
  const custodianCount = useCustodianCount();
  const reportSummary = useReportSummary(user);
  const transferSummary = useTransferSummary(user);
  const auditSummary = useAuditSummary();

  const visibleCategories = roomsAndCategories.categories.filter(
    (cat) => cat.assetCount > 0,
  );

  return (
    <MainLayout>
      <div className="dashboard">
        <div className="dashboard__header">
          <h1 className="dashboard__title">Admin Dashboard</h1>
        </div>

        <div className="dashboard__grid">
          {/* Stat cards row */}
          <div className="dashboard__stat-card">
            <StatCard
              title="Total assets"
              value={assetSummary.totalAssets}
              description="Equipment/s tracked across CICT."
              loading={assetSummary.loading}
              error={assetSummary.error}
            />
          </div>
          <div className="dashboard__stat-card">
            <StatCard
              title="Total rooms"
              value={roomsAndCategories.rooms.length}
              description="Registered under the department."
              loading={roomsAndCategories.loading}
              error={roomsAndCategories.error}
            />
          </div>
          <div className="dashboard__stat-card">
            <StatCard
              title="Total custodians"
              value={custodianCount.totalCustodians}
              description="Staff currently assigned to an asset."
              loading={custodianCount.loading}
              error={custodianCount.error}
            />
          </div>
          <div className="dashboard__stat-card">
            <StatCard
              title="Open reports"
              value={reportSummary.openReportsCount}
              description="Items awaiting resolution."
              loading={reportSummary.loading}
              error={reportSummary.error}
              variant="alert"
            />
          </div>

          {/* Audit row */}
          <div className="dashboard__section--span-2">
            <AuditProgressCard
              audits={auditSummary.ongoingAudits}
              loading={auditSummary.loading}
              error={auditSummary.error}
              onStartAudit={() => {
                // wired up when audit-start flow is built
              }}
            />
          </div>

          <div className="dashboard__stat-card">
            <StatCard
              title="Pending transfers"
              value={transferSummary.pendingCount}
              description="Waiting for acknowledgment."
              loading={transferSummary.loading}
              error={transferSummary.error}
            />
          </div>

          {/* Charts row */}
          <div className="dashboard__section--span-2">
            <DonutChart
              title="Asset status breakdown"
              statusBreakdown={assetSummary.statusBreakdown}
              loading={assetSummary.loading}
              error={assetSummary.error}
            />
          </div>

          <div className="dashboard__section--span-2">
            <CategoryBarList
              categories={visibleCategories}
              loading={roomsAndCategories.loading}
              error={roomsAndCategories.error}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminDashboard;
