// src/components/ui/modal/PDFPreviewModal.jsx
import React, { useState, useEffect } from "react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./PDFPreviewModal.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

  // Generate the blob once the modal opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    pdf(pdfDocument)
      .toBlob()
      .then((blob) => {
        if (cancelled) return;
        setBlobUrl(URL.createObjectURL(blob));
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, pdfDocument]);

  // Clean up blob URL + reset page state on close
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

  return (
    <>
      <button className="pdf-trigger-btn" onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </button>

      {isOpen && (
        <div className="pdf-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="pdf-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
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

            {/* ── Viewer ── */}
            <div
              className="pdf-modal-viewer"
              ref={(el) => el && setContainerWidth(el.clientWidth)}
            >
              {blobUrl ? (
                <Document
                  file={blobUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<p className="pdf-loading-text">Loading preview…</p>}
                  error={
                    <p className="pdf-loading-text">Couldn't load preview.</p>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    width={Math.min(containerWidth - 20, 700)}
                  />
                </Document>
              ) : (
                <p className="pdf-loading-text">Preparing preview…</p>
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
                    onClick={() =>
                      setPageNumber((p) => Math.min(numPages, p + 1))
                    }
                    disabled={pageNumber >= numPages}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}