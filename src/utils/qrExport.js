import { ref, getBlob } from "firebase/storage";
import { storage } from "../services/firebase-config";

/* ─────────────────────────────────────────────────────────
   Sticker sheet layouts (A4). Used by pdf/templates/QRSheetPDF
   and by the size picker on the QR page.
   qrPt / idPt are in PDF points (1mm ≈ 2.835pt).
───────────────────────────────────────────────────────── */

export const SHEET_LAYOUTS = {
  large: {
    label: "Large",
    hint: "3×3 · 9 per Page",
    cols: 3,
    rows: 3,
    qrPt: 150,
    idPt: 16,
  },
  medium: {
    label: "Medium",
    hint: "5×5 · 25 per Page",
    cols: 5,
    rows: 5,
    qrPt: 90,
    idPt: 10,
  },
  small: {
    label: "Small",
    hint: "7×7 · 49 per Page",
    cols: 7,
    rows: 7,
    qrPt: 55,
    idPt: 7,
  },
};

/* ─────────────────────────────────────────────────────────
   ZIP — one PNG per asset (JSZip is lazy-loaded)
   Reads the files from Storage, so it needs the bucket's CORS
   config. Assets that fail are skipped and reported in `failed`.
───────────────────────────────────────────────────────── */

const FETCH_BATCH = 6;

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export async function downloadQRZip(assets, onProgress) {
  const loaded = [];
  const failed = [];
  let done = 0;

  for (const group of chunk(assets, FETCH_BATCH)) {
    const results = await Promise.all(
      group.map(async (asset) => {
        try {
          const blob = await getBlob(ref(storage, asset.qr_code_url));
          return { asset, blob };
        } catch (err) {
          console.error(`[QR export] Failed to load ${asset.id}:`, err);
          return { asset, blob: null };
        }
      }),
    );

    results.forEach((r) => (r.blob ? loaded.push(r) : failed.push(r.asset.id)));
    done += group.length;
    onProgress?.({ done, total: assets.length });
  }

  if (loaded.length === 0) {
    throw new Error(
      "None of the QR images could be loaded. Check your Storage CORS settings.",
    );
  }

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  loaded.forEach(({ asset, blob }) => zip.file(`${asset.id}.png`, blob));

  const content = await zip.generateAsync({ type: "blob" });

  const url = window.URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = `CICT-QR-Codes-${loaded.length}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return { failed };
}
