// All state + side effects for the PDF preview modal.
// The component only renders what this hook returns.
import { useState, useEffect, useRef, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";

const MAX_PAGE_WIDTH = 700;
const PAGE_GUTTER = 20;

export function usePDFPreview(pdfDocument) {
  const [isOpen, setIsOpen] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [viewerEl, setViewerEl] = useState(null); // callback ref target
  const [containerWidth, setContainerWidth] = useState(600);

  // Keep the latest element in a ref so an inline <Template /> prop (new object
  // every parent render) doesn't regenerate the PDF; it's snapshotted on open.
  const documentRef = useRef(pdfDocument);
  documentRef.current = pdfDocument;

  // ── Generate the blob when the modal opens ──
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    let url = null;
    setError(false);

    pdf(documentRef.current)
      .toBlob()
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch((err) => {
        // e.g. an image that failed to load — don't leave the skeleton spinning
        console.error("[usePDFPreview] Failed to render preview:", err);
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
      setBlobUrl(null);
      setNumPages(null);
      setPageNumber(1);
    };
  }, [isOpen]);

  // ── Track the viewer width so the page scales on resize ──
  useEffect(() => {
    if (!viewerEl) return;
    setContainerWidth(viewerEl.clientWidth);
    const observer = new ResizeObserver(([entry]) =>
      setContainerWidth(entry.contentRect.width),
    );
    observer.observe(viewerEl);
    return () => observer.disconnect();
  }, [viewerEl]);

  // ── Actions ──
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const print = useCallback(() => {
    if (!blobUrl) return;
    setPrinting(true);

    // Hidden iframe: no pop-up blocker, and `onload` is reliable for blobs.
    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    iframe.onload = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } finally {
        setPrinting(false);
        setTimeout(() => iframe.remove(), 60000);
      }
    };
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
  }, [blobUrl]);

  const prevPage = useCallback(
    () => setPageNumber((p) => Math.max(1, p - 1)),
    [],
  );
  const nextPage = useCallback(
    () => setPageNumber((p) => Math.min(numPages ?? p, p + 1)),
    [numPages],
  );

  return {
    // modal
    isOpen,
    open,
    close,
    // pdf
    blobUrl,
    error,
    // print
    printing,
    print,
    // viewer
    setViewerEl,
    pageWidth: Math.min(containerWidth - PAGE_GUTTER, MAX_PAGE_WIDTH),
    onLoadSuccess: ({ numPages }) => setNumPages(numPages),
    // paging
    numPages,
    pageNumber,
    prevPage,
    nextPage,
    canPrev: pageNumber > 1,
    canNext: numPages != null && pageNumber < numPages,
  };
}
