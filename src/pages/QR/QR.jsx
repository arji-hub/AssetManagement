import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import QRModal from "../../components/ui/modal/QRModal";
import QRStatusModal from "../../components/ui/status/QRStatusModal";
import { useQRScanner } from "../../hooks/camera/useQRScanner";
import "./QR.css";

function QR() {
  const { user } = useAuth();
  const { status, errorMessage, handleImageUpload, handleScan, reset } = useQRScanner();

  return (
    <MainLayout>
      <div className="qr-page">
        <QRModal onScan={handleScan} onImageUpload={handleImageUpload} />
        {status && (
          <QRStatusModal
            status={status}
            errorMessage={errorMessage}
            onClose={reset}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default QR;
