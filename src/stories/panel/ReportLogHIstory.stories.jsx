import React from "react";
import ReportLogHistory from "../../components/panel/ReportLogHistory";

const mockLogs = [
  {
    id: "log-0001",
    log_name: "July 2026 Audit Log",
    report_count: 24,
    damaged_count: 9,
    missing_count: 5,
    created_at: new Date("2026-07-24T09:15:00"),
  },
  {
    id: "log-0002",
    log_name: "Comp Lab 402 Cleanup",
    report_count: 8,
    damaged_count: 3,
    missing_count: 0,
    created_at: new Date("2026-07-20T14:32:00"),
  },
  {
    id: "log-0003",
    log_name: "Admin Office Reports",
    report_count: 12,
    damaged_count: 0,
    missing_count: 2,
    created_at: new Date("2026-07-15T11:05:00"),
  },
  {
    id: "log-0004",
    log_name: "Q2 Consolidated Log",
    report_count: 31,
    damaged_count: 14,
    missing_count: 9,
    created_at: new Date("2026-06-30T16:48:00"),
  },
];

export default {
  title: "Panel/ReportLogHistory",
  component: ReportLogHistory,
};

export const Default = {
  args: {
    logs: mockLogs,
    onViewAll: () => alert("View all report logs"),
    handleRowClick: (id) => alert(`Open report log ${id}`),
  },
};

export const Empty = {
  args: {
    logs: [],
    onViewAll: () => alert("View all report logs"),
    handleRowClick: () => {},
  },
};
