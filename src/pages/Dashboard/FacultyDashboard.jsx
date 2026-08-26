import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import {
  useAssetSummary,
  useRoomsAndCategories,
  useReportSummary,
  useTransferSummary,
  usePARICSSummary,
} from "../../hooks/dashboard";
import {
  StatCard,
  DonutChart,
  CategoryBarList,
  PARICSTreemap,
  DashboardHeader,
} from "../../components/dashboard";
import "./FacultyDashboard.css";
import "./Dashboard.css";

function FacultyDashboard() {
  const { user } = useAuth();

  const assetSummary = useAssetSummary(user);
  const roomsAndCategories = useRoomsAndCategories(user, assetSummary.assets);
  const reportSummary = useReportSummary(user);
  const transferSummary = useTransferSummary(user);
  const parIcsSummary = usePARICSSummary(
    user,
    assetSummary.assets,
    assetSummary.loading,
    assetSummary.error,
  );

  const visibleCategories = roomsAndCategories.categories.filter(
    (cat) => cat.assetCount > 0,
  );

  const headerLoading = reportSummary.loading || transferSummary.loading;

  return (
    <MainLayout>
      <div className="dashboard">
        <DashboardHeader
          user={user}
          openReportsCount={reportSummary.openReportsCount}
          pendingTransfersCount={transferSummary.pendingCount}
          ongoingAuditsCount={0}
          loading={headerLoading}
        />

        <div className="dashboard__grid">
          {/* Stat cards row */}
          <div className="item" style={{ gridArea: "box-1" }}>
            <StatCard
              title="My assets"
              value={assetSummary.totalAssets}
              loading={assetSummary.loading}
              error={assetSummary.error}
            />
          </div>

          <div className="dashboard__pair">
            <div className="item" style={{ gridArea: "box-2" }}>
              <StatCard
                title="Open reports"
                value={reportSummary.openReportsCount}
                loading={reportSummary.loading}
                error={reportSummary.error}
                variant="alert"
              />
            </div>
            <div className="item" style={{ gridArea: "box-3" }}>
              <StatCard
                title="Pending acknowledgments"
                value={transferSummary.pendingCount}
                loading={transferSummary.loading}
                error={transferSummary.error}
              />
            </div>
          </div>

          {/* Charts row - swapped order */}
          <div className="item" style={{ gridArea: "box-4" }}>
            <CategoryBarList
              title="My categories"
              categories={visibleCategories}
              loading={roomsAndCategories.loading}
              error={roomsAndCategories.error}
            />
          </div>

          <div className="item" style={{ gridArea: "box-5" }}>
            <DonutChart
              title="My asset status"
              statusBreakdown={assetSummary.statusBreakdown}
              loading={assetSummary.loading}
              error={assetSummary.error}
            />
          </div>

          <div className="item" style={{ gridArea: "box-6" }}>
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

export default FacultyDashboard;
