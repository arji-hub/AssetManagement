export const getReportType = (report) =>
  report.status_log?.[0]?.status ?? null;