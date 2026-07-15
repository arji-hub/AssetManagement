import React from "react";
import AuditReport from "../../components/panel/AuditReport";

export default {
  title: "Panel/AuditReport",
  component: AuditReport,
};

export const Default = {
  args: {
    lastEntry: "2 hours ago",
    onClick: () => alert("Navigate to Report Logs page"),
  },
};

export const NoEntries = {
  args: {
    lastEntry: null,
    onClick: () => alert("Navigate to Report Logs page"),
  },
};