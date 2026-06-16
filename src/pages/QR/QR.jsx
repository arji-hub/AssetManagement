import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import QRModal from "../../components/ui/modal/QRModal";
import QRStatusModal from "../../components/ui/status/QRStatusModal";
import { useQRScanner } from "../../hooks/useQRScanner";
import "./QR.css";

function QR() {
  const { user } = useAuth();
  const { status, errorMessage, handleImageUpload, reset } = useQRScanner();

  const handleCameraScan = () => {
    alert("Camera scan not implemented yet.");
  };

  return (
    <MainLayout>
      <div className="qr-page">
        <QRModal
          onCameraScan={handleCameraScan}
          onImageUpload={handleImageUpload}
        />
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
