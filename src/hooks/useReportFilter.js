import { useState, useRef, useEffect } from "react";

function useReportFilter() {
  const filterRef = useRef(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(["damaged", "missing"]); // was conditionFilter

  const handleStatusToggle = (type) => {
    // was handleConditionToggle
    setStatusFilter((prev) =>
      prev.includes(type)
        ? prev.length === 1
          ? prev
          : prev.filter((t) => t !== type)
        : [...prev, type],
    );
  };

  const handleStatusFilter = () => {
    // was handleConditionFilter
    setFilterOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    filterRef,
    filterOpen,
    statusFilter,
    handleStatusFilter,
    handleStatusToggle,
  };
}

export default useReportFilter;
