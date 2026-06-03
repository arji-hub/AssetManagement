import QRCode from "qrcode";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { assetId, assetName } = req.body;

  try {
    // generates a base64 PNG you can display or download
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({ assetId, assetName }),
      { width: 300, margin: 2 }
    );

    res.status(200).json({ qr: qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: "QR generation failed" });
  }
}