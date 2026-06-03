const BASE = "/api";

export const generateQR = async (assetId, assetName) => {
  const res = await fetch(`${BASE}/generate-qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assetId, assetName }),
  });
  return res.json(); // { qr: "data:image/png;base64,..." }
};

export const downloadReport = async (assets) => {
  const res = await fetch(`${BASE}/generate-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assets }),
  });

  // trigger a file download in the browser
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "assets-report.xlsx";
  a.click();
  URL.revokeObjectURL(url);
};