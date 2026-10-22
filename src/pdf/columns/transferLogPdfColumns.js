export const transferLogPdfColumns = [
  {
    key: "itemNo",
    header: "NO.",
    width: "10%",
    align: "center",
    render: (_, i) => i + 1,
  },
  {
    key: "description",
    header: "DESCRIPTION",
    width: "70%",
    render: (r) => r.asset_description || "—",
  },
  {
    key: "assetId",
    header: "ASSET ID",
    width: "20%",
    softBreak: true,
    chunkSize: 30,
    mono: true,
    render: (r) => r.asset_id || "—",
  },
];
