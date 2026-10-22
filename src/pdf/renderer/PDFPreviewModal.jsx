// src/pdf/renderer/PDFPreviewModal.jsx — pure rendering; logic lives in usePDFPreview
import React from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./PDFPreviewModal.css";
import { usePDFPreview } from "./usePDFPreview";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const {
    isOpen,
    open,
    close,
    blobUrl,
    error,
    printing,
    print,
    setViewerEl,
    pageWidth,
    onLoadSuccess,
    numPages,
    pageNumber,
    prevPage,
    nextPage,
    canPrev,
    canNext,
  } = usePDFPreview(pdfDocument);

  const modal = isOpen ? (
    <div className="pdf-modal-overlay" onClick={close}>
      <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <h2>{title}</h2>
          <button
            className="pdf-modal-close"
            onClick={close}
            aria-label="Close"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="pdf-modal-actions">
          <a href={blobUrl ?? undefined} download={fileName}>
            <button className="pdf-download-btn" disabled={!blobUrl}>
              <FontAwesomeIcon icon="fa-solid fa-download" />
              {blobUrl ? "Download" : "Preparing..."}
            </button>
          </a>

          <button
            className="pdf-print-btn"
            onClick={print}
            disabled={printing || !blobUrl}
          >
            <FontAwesomeIcon icon="fa-solid fa-print" />
            {printing || !blobUrl ? "Preparing..." : "Print"}
          </button>
        </div>

        <div className="pdf-modal-viewer" ref={setViewerEl}>
          {error ? (
            <p className="pdf-loading-text">Couldn't generate the preview.</p>
          ) : blobUrl ? (
            <Document
              file={blobUrl}
              onLoadSuccess={onLoadSuccess}
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
              <button onClick={prevPage} disabled={!canPrev}>
                <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
              </button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <button onClick={nextPage} disabled={!canNext}>
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
      <button className="pdf-trigger-btn" onClick={open}>
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
