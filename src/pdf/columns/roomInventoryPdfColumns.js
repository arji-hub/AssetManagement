export const roomInventoryPdfColumns = [
  {
    key: "type",
    header: "EQUIPMENT TYPE",
    width: "28%",
    render: (a) => a.category_name,
  },
  {
    key: "brand",
    header: "BRAND/ DESCRIPTION",
    width: "34%",
    render: (a) => a.description,
  },
  {
    key: "serial",
    header: "SERIAL NO./ MODEL NO.",
    width: "22%",
    render: (a) => a.serial_number,
  },
  { key: "status", header: "STATUS", width: "16%", render: (a) => a.status },
];
