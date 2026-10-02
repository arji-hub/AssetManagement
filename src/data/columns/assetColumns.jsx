import { Status } from "../../components/ui/status/assetStatus";

const Empty = ({ text = "N/A" }) => <i>{text}</i>;

export const assetColumns = [
  {
    key: "sn",
    label: "Serial Number",
    width: "1.8fr",
    priority: "high",
    render: (a) => a.serial_number || <Empty />,
    card: { role: "hidden" },
  },
  {
    key: "desc",
    label: "Description",
    width: "3.5fr",
    priority: "high",
    render: (a) => a.description || <Empty />,
  },
  {
    key: "category",
    label: "Category",
    width: "0.9fr",
    priority: "medium",
    render: (a) => a.category_name || <Empty />,
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "qty",
    label: "Qty",
    width: "0.5fr",
    priority: "low",
    render: (a) => a.qty ?? 1,
    card: { icon: "fa-solid fa-boxes-stacked" },
  },
  {
    key: "status",
    label: "Status",
    width: "0.8fr",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "room",
    label: "Room",
    width: "0.8fr",
    priority: "low",
    render: (a) => a.room_name || <Empty text="Unallocated" />,
    card: { icon: "fa-solid fa-door-open" },
  },
];
