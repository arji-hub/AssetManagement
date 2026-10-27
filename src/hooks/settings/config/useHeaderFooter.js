import { useCallback, useEffect, useRef, useState } from "react";
import {
  HEADER_FOOTER_SLOTS,
  fetchHeaderFooter,
  saveHeaderFooterImage,
  validateImageFile,
  resolveHeaderFooter,
} from "../../../services/headerFooter";
import { CROP_CONFIG, getCroppedBlob } from "../../../utils/cropImage";

const { HEADER, FOOTER } = HEADER_FOOTER_SLOTS;

const EMPTY_DRAFTS = { [HEADER]: null, [FOOTER]: null };
const NO_ERRORS = { [HEADER]: "", [FOOTER]: "" };
const NOT_SAVING = { [HEADER]: false, [FOOTER]: false };

function friendlyError(err) {
  if (err?.code === "storage/unauthorized") {
    return "You don't have permission to upload this image.";
  }
  if (err?.code === "storage/retry-limit-exceeded") {
    return "Upload timed out. Check your connection and try again.";
  }
  if (err?.code === "storage/canceled") {
    return "Upload was cancelled.";
  }
  return err?.message || "Something went wrong. Please try again.";
}

export default function useHeaderFooter() {
  /* ---------------- Saved template ---------------- */
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setTemplate(await fetchHeaderFooter());
      setLoadError("");
      return true;
    } catch (err) {
      console.error(err);
      setLoadError("Could not load the saved header and footer.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ---------------- Per-slot UI state ----------------
     draft = { file, preview } — a picked-but-unsaved image.
     The ref is the source of truth so object URLs can always
     be revoked, including on unmount. */
  const draftsRef = useRef(EMPTY_DRAFTS);
  const [drafts, setDrafts] = useState(EMPTY_DRAFTS);
  const [saving, setSaving] = useState(NOT_SAVING);
  const [errors, setErrors] = useState(NO_ERRORS);

  const setDraft = useCallback((slot, draft) => {
    const previous = draftsRef.current[slot];
    if (previous?.preview) URL.revokeObjectURL(previous.preview);

    draftsRef.current = { ...draftsRef.current, [slot]: draft };
    setDrafts(draftsRef.current);
  }, []);

  const setError = useCallback((slot, message) => {
    setErrors((prev) => ({ ...prev, [slot]: message }));
  }, []);

  const setSavingFlag = useCallback((slot, value) => {
    setSaving((prev) => ({ ...prev, [slot]: value }));
  }, []);

  useEffect(() => {
    return () => {
      Object.values(draftsRef.current).forEach((draft) => {
        if (draft?.preview) URL.revokeObjectURL(draft.preview);
      });
    };
  }, []);

  const [cropTarget, setCropTarget] = useState(null); // { slot, src, name, type }
  const cropRef = useRef(null);
  cropRef.current = cropTarget;

  useEffect(() => {
    return () => {
      if (cropRef.current?.src) URL.revokeObjectURL(cropRef.current.src);
    };
  }, []);

  /* ---------------- Actions ---------------- */

  const closeCrop = useCallback(() => {
    setCropTarget((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src);
      return null;
    });
  }, []);

  const pickFile = useCallback(
    (slot, file) => {
      if (!file) return;

      try {
        validateImageFile(file);
      } catch (err) {
        setError(slot, err.message);
        return;
      }

      setError(slot, "");
      setCropTarget({
        slot,
        src: URL.createObjectURL(file),
        name: file.name,
        type: file.type === "image/jpeg" ? "image/jpeg" : "image/png",
      });
    },
    [setError],
  );

  const confirmCrop = useCallback(
    async (pixelCrop) => {
      const target = cropRef.current;
      if (!target) return;
      const { slot, src, name, type } = target;

      try {
        const blob = await getCroppedBlob(
          src,
          pixelCrop,
          CROP_CONFIG[slot],
          type,
        );
        const file = new File([blob], name, { type });
        validateImageFile(file); // re-check the 2 MB limit on the cropped output
        setDraft(slot, { file, preview: URL.createObjectURL(file) });
        setError(slot, "");
      } catch (err) {
        setError(slot, err.message || "Could not crop the image.");
      } finally {
        closeCrop();
      }
    },
    [closeCrop, setDraft, setError],
  );

  const discard = useCallback(
    (slot) => {
      setDraft(slot, null);
      setError(slot, "");
    },
    [setDraft, setError],
  );

  const save = useCallback(
    async (slot) => {
      const draft = draftsRef.current[slot];
      if (!draft || saving[slot]) return;

      setSavingFlag(slot, true);
      setError(slot, "");

      try {
        await saveHeaderFooterImage(slot, draft.file);
        if (await refresh()) setDraft(slot, null);
      } catch (err) {
        console.error(err);
        setError(slot, friendlyError(err));
      } finally {
        setSavingFlag(slot, false);
      }
    },
    [refresh, setDraft, setError, setSavingFlag],
  );

  /* ---------------- Public shape ---------------- */

  const resolved = resolveHeaderFooter(template);

  const buildSlot = (slot) => ({
    // Unsaved local preview wins, then the saved image, then the default.
    src: drafts[slot]?.preview ?? resolved[`${slot}Src`],
    hasDraft: Boolean(drafts[slot]),
    isSaving: saving[slot],
    error: errors[slot],
  });

  return {
    loading,
    loadError,

    header: buildSlot(HEADER),
    footer: buildSlot(FOOTER),

    pickFile, // (slot, file)
    discard, // (slot)
    save, // (slot)
    cropTarget,
    confirmCrop,
    cancelCrop: closeCrop,
  };
}
