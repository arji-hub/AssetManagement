// src/components/modal/PDFPreviewModal.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./PDFPreviewModal.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// A4-shaped placeholder shown while the PDF is being generated / rendered.
// Colors come from theme tokens, so it follows light/dark automatically.
function PDFSkeleton({ width }) {
  return (
    <div
      className="pdf-skeleton"
      style={{ width, aspectRatio: "1 / 1.414" }}
      role="status"
      aria-label="Loading preview"
    >
      <div className="pdf-skeleton-header">
        <span className="pdf-skeleton-block pdf-skeleton-logo" />

        <div className="pdf-skeleton-lines">
          <span className="pdf-skeleton-block" style={{ width: "55%" }} />
          <span className="pdf-skeleton-block" style={{ width: "80%" }} />
          <span className="pdf-skeleton-block" style={{ width: "40%" }} />
        </div>

        <span className="pdf-skeleton-block pdf-skeleton-logo" />
      </div>

      <span className="pdf-skeleton-block pdf-skeleton-title" />

      <div className="pdf-skeleton-rows">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="pdf-skeleton-block pdf-skeleton-row" />
        ))}
      </div>
    </div>
  );
}

export function PDFPreviewModal({
  document: pdfDocument,
  fileName,
  title,
  triggerLabel = "Preview PDF",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(600);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setPreviewError(false);

    pdf(pdfDocument)
      .toBlob()
      .then((blob) => {
        if (cancelled) return;
        setBlobUrl(URL.createObjectURL(blob));
      })
      .catch((err) => {
        // e.g. an image that failed to load — don't leave the skeleton spinning forever
        console.error("[PDFPreviewModal] Failed to render preview:", err);
        if (!cancelled) setPreviewError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, pdfDocument]);

  useEffect(() => {
    if (!isOpen && blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
      setNumPages(null);
      setPageNumber(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const blob = await pdf(pdfDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } finally {
      setPrinting(false);
    }
  };

  const pageWidth = Math.min(containerWidth - 20, 700);

  const modal = isOpen ? (
    <div className="pdf-modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <h2>{title}</h2>
          <button
            className="pdf-modal-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="pdf-modal-actions">
          <PDFDownloadLink document={pdfDocument} fileName={fileName}>
            {({ loading }) => (
              <button className="pdf-download-btn" disabled={loading}>
                <FontAwesomeIcon icon="fa-solid fa-download" />
                {loading ? "Preparing..." : "Download"}
              </button>
            )}
          </PDFDownloadLink>

          <button
            className="pdf-print-btn"
            onClick={handlePrint}
            disabled={printing}
          >
            <FontAwesomeIcon icon="fa-solid fa-print" />
            {printing ? "Preparing..." : "Print"}
          </button>
        </div>

        <div
          className="pdf-modal-viewer"
          ref={(el) => el && setContainerWidth(el.clientWidth)}
        >
          {previewError ? (
            <p className="pdf-loading-text">Couldn't generate the preview.</p>
          ) : blobUrl ? (
            <Document
              file={blobUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<PDFSkeleton width={pageWidth} />}
              error={<p className="pdf-loading-text">Couldn't load preview.</p>}
            >
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                loading={<PDFSkeleton width={pageWidth} />}
              />
            </Document>
          ) : (
            <PDFSkeleton width={pageWidth} />
          )}

          {numPages > 1 && (
            <div className="pdf-page-nav">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
              >
                <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
              </button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                disabled={pageNumber >= numPages}
              >
                <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className="pdf-trigger-btn" onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </button>
      {/* Render inside the app shell so the modal inherits its theme; fall back to body */}
      {modal &&
        createPortal(
          modal,
          document.querySelector(".layout-wrapper") ?? document.body,
        )}
    </>
  );
}
