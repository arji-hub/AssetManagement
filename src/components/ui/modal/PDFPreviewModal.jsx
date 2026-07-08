// src/components/ui/modal/PDFPreviewModal.jsx
import React, { useState } from "react";
import { PDFViewer, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./PDFPreviewModal.css";

export function PDFPreviewModal({
  document: pdfDocument,
  fileName,
  title,
  triggerLabel = "Preview PDF",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [printing, setPrinting] = useState(false);

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
            {/* ── Header ── */}
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

            {/* ── Action bar ── */}
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
            <div className="pdf-modal-viewer">
              <PDFViewer width="100%" height="100%" showToolbar={false}>
                {pdfDocument}
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}