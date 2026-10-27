import { db, auth, storage } from "./firebase-config";
import { ROLES } from "../data/roles";
import { doc, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";
import defaultHeaderImg from "../assets/PDFTemplate/Header.png";
import defaultFooterImg from "../assets/PDFTemplate/Footer.png";

/* ---------------------------------------------------------
   PDF header / footer images — Storage only

   One fixed path per slot, no Firestore metadata:
     config/pdf/header
     config/pdf/footer

   The default images are uploaded to these paths once; after that
   the only operation is replacing a file. Saving overwrites the
   file at the same path, so there is never an old file to clean up.
--------------------------------------------------------- */

export const HEADER_FOOTER_SLOTS = {
  HEADER: "header",
  FOOTER: "footer",
};

// @react-pdf/renderer only renders PNG and JPG.
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB — keep in sync with Storage rules

export const DEFAULT_HEADER = defaultHeaderImg;
export const DEFAULT_FOOTER = defaultFooterImg;

const slotRef = (slot) => ref(storage, `config/pdf/${slot}`);

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function assertSlot(slot) {
  if (!Object.values(HEADER_FOOTER_SLOTS).includes(slot)) {
    throw new Error(`Unknown template slot: ${slot}`);
  }
}

// Remembers the last resolved URL per slot, keyed by the file's version, so an
// unchanged image costs one tiny metadata request instead of two lookups.
const CACHE_PREFIX = "pdf_template:";

function readCache(slot) {
  try {
    return JSON.parse(localStorage.getItem(CACHE_PREFIX + slot));
  } catch {
    return null;
  }
}

function writeCache(slot, value) {
  try {
    if (value) {
      localStorage.setItem(CACHE_PREFIX + slot, JSON.stringify(value));
    } else {
      localStorage.removeItem(CACHE_PREFIX + slot);
    }
  } catch {
    // Storage unavailable (private mode, quota) — just skip caching.
  }
}

/**
 * Returns the download URL for a slot, or null if nothing is stored.
 *
 * The file is overwritten in place, so the object's `updated` timestamp is
 * appended as `?v=` — the URL changes exactly when the image changes. That
 * makes it safe for the browser to cache the image bytes for a long time
 * (see cacheControl in saveHeaderFooterImage): an unchanged image is served
 * from the browser cache, a changed one gets a new URL and is fetched fresh.
 */
async function fetchSlotUrl(slot) {
  const fileRef = slotRef(slot);
  try {
    const meta = await getMetadata(fileRef);
    const version = meta.updated;

    const cached = readCache(slot);
    if (cached?.version === version) {
      return cached.url;
    }

    const url = await getDownloadURL(fileRef);
    const separator = url.includes("?") ? "&" : "?";
    const versionedUrl = `${url}${separator}v=${encodeURIComponent(version)}`;

    writeCache(slot, { version, url: versionedUrl });
    return versionedUrl;
  } catch (err) {
    if (err?.code === "storage/object-not-found") {
      writeCache(slot, null);
      return null;
    }
    throw err;
  }
}

/* ---------------------------------------------------------
   Admin guard
   Client-side only — Storage security rules must enforce the
   same admin check server-side.
--------------------------------------------------------- */
async function assertAdmin() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("You must be signed in to edit the PDF template.");
  }

  const userSnap = await getDoc(doc(db, "user", currentUser.uid));
  const role = userSnap.data()?.role;

  if (role !== ROLES.ADMIN) {
    throw new Error("Only admins can edit the PDF template.");
  }
}

/* ---------------------------------------------------------
   Validation (also used by the hook to reject a file the
   moment it is picked, before any upload starts)
--------------------------------------------------------- */
export function validateImageFile(file) {
  if (!file) {
    throw new Error("Choose an image first.");
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only PNG or JPG images can be used in PDFs.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `Image is too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)} MB.`,
    );
  }
}

/* ---------------------------------------------------------
   Read
--------------------------------------------------------- */

function withTimeout(promise, ms = 10000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("Loading the header and footer timed out.")),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function fetchHeaderFooter() {
  const [header_url, footer_url] = await withTimeout(
    Promise.all([
      fetchSlotUrl(HEADER_FOOTER_SLOTS.HEADER),
      fetchSlotUrl(HEADER_FOOTER_SLOTS.FOOTER),
    ]),
  );
  return { header_url, footer_url };
}

/**
 * Turns a template into ready-to-use image sources, falling back to the
 * bundled defaults for any slot that has no custom image.
 */
export function resolveHeaderFooter(template) {
  return {
    headerSrc: template?.header_url || DEFAULT_HEADER,
    footerSrc: template?.footer_url || DEFAULT_FOOTER,
  };
}

/**
 * For PDF generators: resolves the sources to pass into <PDFLayout />.
 * Never throws — if the lookup fails, the PDF still generates with the
 * default header and footer instead of failing outright.
 */
export async function fetchHeaderFooterSources() {
  try {
    return resolveHeaderFooter(await fetchHeaderFooter());
  } catch (err) {
    return resolveHeaderFooter(null);
  }
}

/* ---------------------------------------------------------
   Write
--------------------------------------------------------- */

export async function saveHeaderFooterImage(slot, file) {
  assertSlot(slot);
  await assertAdmin();
  validateImageFile(file);

  await uploadBytes(slotRef(slot), file, {
    contentType: file.type,
    // Safe to cache for a year: the URL carries ?v=<updated>, so a new
    // upload is always requested under a different URL.
    cacheControl: "public, max-age=31536000",
  });

  return fetchSlotUrl(slot);
}
