import { useState } from "react";

function useReportFilter() {
  const [statusFilter, setStatusFilter] = useState("all");

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  return {
    statusFilter,
    handleStatusFilter,
  };
}

export default useReportFilter;
