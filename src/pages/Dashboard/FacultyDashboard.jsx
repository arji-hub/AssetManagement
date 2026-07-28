import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { useAssetSummary } from "../../hooks/dashboard/useAssetSummary";
import { useRoomsAndCategories } from "../../hooks/dashboard/useRoomsAndCategories";
import { useReportSummary } from "../../hooks/dashboard/useReportSummary";
import { useTransferSummary } from "../../hooks/dashboard/useTransferSummary";
import {
  StatCard,
  DonutChart,
  CategoryBarList,
} from "../../components/dashboard";
import "./dashboard.css";

function FacultyDashboard() {
  const { user } = useAuth();

  const assetSummary = useAssetSummary(user);
  const roomsAndCategories = useRoomsAndCategories(user, assetSummary.assets);
  const reportSummary = useReportSummary(user);
  const transferSummary = useTransferSummary(user);

  const visibleCategories = roomsAndCategories.categories.filter(
    (cat) => cat.assetCount > 0,
  );

  return (
    <MainLayout>
      <div className="dashboard">
        <div className="dashboard__header">
          <h1 className="dashboard__title">Faculty Dashboard</h1>
          <p className="dashboard__subtitle">
            Welcome, {user?.name || "Faculty Member"}
          </p>
        </div>

        <div className="dashboard__grid">
          {/* Stat cards row */}
          <div className="dashboard__stat-card">
            <StatCard
              title="My assets"
              value={assetSummary.totalAssets}
              loading={assetSummary.loading}
              error={assetSummary.error}
            />
          </div>
          <div className="dashboard__stat-card">
            <StatCard
              title="Open reports"
              value={reportSummary.openReportsCount}
              loading={reportSummary.loading}
              error={reportSummary.error}
              variant="alert"
            />
          </div>
          <div className="dashboard__stat-card">
            <StatCard
              title="Pending acknowledgments"
              value={transferSummary.pendingCount}
              loading={transferSummary.loading}
              error={transferSummary.error}
            />
          </div>

          {/* Charts row - swapped order */}
          <div className="dashboard__section--span-2">
            <CategoryBarList
              title="My categories"
              categories={visibleCategories}
              loading={roomsAndCategories.loading}
              error={roomsAndCategories.error}
            />
          </div>

          <div className="dashboard__section--span-2">
            <DonutChart
              title="My asset status"
              statusBreakdown={assetSummary.statusBreakdown}
              loading={assetSummary.loading}
              error={assetSummary.error}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default FacultyDashboard;
