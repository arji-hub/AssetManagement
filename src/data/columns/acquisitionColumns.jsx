// Also export from src/data/columns/index: export * from "./acquisitionColumns";

const Empty = ({ text = "N/A" }) => <i>{text}</i>;

// date_acquired may be a Firestore Timestamp or a date string.
export function formatAcquiredDate(value) {
  if (!value) return null;
  const date =
    typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const acquisitionColumns = [
  {
    key: "id",
    label: "Acquisition ID",
    width: "1.2fr",
    priority: "low",
    render: (a) => a.id,
  },
  {
    key: "source",
    label: "Donor / Supplier",
    width: "2.8fr",
    priority: "medium",
    render: (a) => a.source || <Empty />,
  },
  {
    key: "type",
    label: "Type",
    width: "1fr",
    priority: "high",
    render: (a) => a.acquisition_type || <Empty />,
  },
  {
    key: "date_acquired",
    label: "Date Acquired",
    width: "1.2fr",
    priority: "high",
    render: (a) => formatAcquiredDate(a.date_acquired) || <Empty />,
  },
  {
    key: "asset_count",
    label: "Assets",
    width: "0.6fr",
    priority: "high",
    render: (a) => a.asset_count,
  },
];
