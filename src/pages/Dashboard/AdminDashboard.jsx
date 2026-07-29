import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import {
  useAssetSummary,
  useRoomsAndCategories,
  useCustodianCount,
  useReportSummary,
  useTransferSummary,
  useAuditSummary,
  usePARICSSummary,
} from "../../hooks/dashboard";
import {
  StatCard,
  DonutChart,
  CategoryBarList,
  AuditProgressCard,
  PARICSTreemap,
  DashboardHeader,
} from "../../components/dashboard";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user } = useAuth();

  const assetSummary = useAssetSummary(user);
  const roomsAndCategories = useRoomsAndCategories(user, assetSummary.assets);
  const custodianCount = useCustodianCount();
  const reportSummary = useReportSummary(user);
  const transferSummary = useTransferSummary(user);
  const auditSummary = useAuditSummary();
  const parIcsSummary = usePARICSSummary(
    user,
    assetSummary.assets,
    assetSummary.loading,
    assetSummary.error,
  );

  const visibleCategories = roomsAndCategories.categories.filter(
    (cat) => cat.assetCount > 0,
  );

  const headerLoading =
    reportSummary.loading || transferSummary.loading || auditSummary.loading;

  return (
    <MainLayout>
      <div className="dashboard">
        <DashboardHeader
          user={user}
          openReportsCount={reportSummary.openReportsCount}
          pendingTransfersCount={transferSummary.pendingCount}
          ongoingAuditsCount={auditSummary.ongoingAudits.length}
          loading={headerLoading}
        />

        <div className="dashboard-grid-container">
          {/* Stat cards row */}
          <div className="item" style={{ gridArea: "box-1" }}>
            <StatCard
              title="Total assets"
              value={assetSummary.totalAssets}
              description="Equipment/s tracked across CICT."
              loading={assetSummary.loading}
              error={assetSummary.error}
            />
          </div>
          <div className="item" style={{ gridArea: "box-2" }}>
            <StatCard
              title="Total rooms"
              value={roomsAndCategories.rooms.length}
              description="Registered under the department."
              loading={roomsAndCategories.loading}
              error={roomsAndCategories.error}
            />
          </div>
          <div className="item" style={{ gridArea: "box-3" }}>
            <StatCard
              title="Total custodians"
              value={custodianCount.totalCustodians}
              description="Staff currently assigned to an asset."
              loading={custodianCount.loading}
              error={custodianCount.error}
            />
          </div>
          <div className="item" style={{ gridArea: "box-4" }}>
            <StatCard
              title="Open reports"
              value={reportSummary.openReportsCount}
              description="Items awaiting resolution."
              loading={reportSummary.loading}
              error={reportSummary.error}
              variant="alert"
            />
          </div>
          <div className="item" style={{ gridArea: "box-5" }}>
            <StatCard
              title="Pending transfers"
              value={transferSummary.pendingCount}
              description="Waiting for acknowledgment."
              loading={transferSummary.loading}
              error={transferSummary.error}
              variant="alert"
            />
          </div>
          {/* Audit row */}
          <div className="item" style={{ gridArea: "box-6" }}>
            <AuditProgressCard
              audits={auditSummary.ongoingAudits}
              loading={auditSummary.loading}
              error={auditSummary.error}
              onStartAudit={auditSummary.startNewAudit}
            />
          </div>
          {/* Charts row */}
          <div className="item" style={{ gridArea: "box-7" }}>
            <DonutChart
              title="Asset status breakdown"
              statusBreakdown={assetSummary.statusBreakdown}
              loading={assetSummary.loading}
              error={assetSummary.error}
            />
          </div>

          <div className="item" style={{ gridArea: "box-8" }}>
            <CategoryBarList
              categories={visibleCategories}
              loading={roomsAndCategories.loading}
              error={roomsAndCategories.error}
            />
          </div>
          <div className="item" style={{ gridArea: "box-9" }}>
            <PARICSTreemap
              par={parIcsSummary.par}
              ics={parIcsSummary.ics}
              totalCount={parIcsSummary.totalCount}
              totalValue={parIcsSummary.totalValue}
              loading={parIcsSummary.loading}
              error={parIcsSummary.error}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminDashboard;
