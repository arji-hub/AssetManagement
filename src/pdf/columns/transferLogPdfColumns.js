export const transferLogPdfColumns = [
  {
    key: "itemNo",
    header: "ITEM NO.",
    width: "12%",
    align: "center",
    render: (_, i) => i + 1,
  },
  {
    key: "assetId",
    header: "ASSET ID",
    width: "33%",
    softBreak: true,
    render: (r) => r.asset_id || "—",
  },
  {
    key: "description",
    header: "DESCRIPTION",
    width: "55%",
    render: (r) => r.asset_description,
  },
];
