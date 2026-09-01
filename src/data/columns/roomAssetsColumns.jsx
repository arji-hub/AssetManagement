import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";

export const roomAssetsColumns = [
  {
    key: "name",
    label: "Asset Name",
    width: "2.2fr",
    priority: "high",
    render: (a) => a.description,
  },
  {
    key: "category",
    label: "Category",
    width: "1fr",
    priority: "medium",
    render: (a) => a.category,
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "custodian",
    label: "Custodian",
    width: "1.5fr",
    priority: "high",
    render: (a) => a.name,
    card: { icon: "fa-solid fa-user" },
  },
  {
    key: "status",
    label: "Status",
    width: "1fr",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "date",
    label: "Date Assigned",
    width: "1.2fr",
    priority: "low",
    render: (a) => formatDate(a.date),
  },
];
