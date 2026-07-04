// hooks/useCamera.js
import { useRef } from "react";
import { useQRScanner } from "./useQRScanner";

export function useCamera() {
  const inputRef = useRef(null);
  const { status, errorMessage, handleImageUpload, reset } = useQRScanner();

  const openCamera = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = "";
  };

  const inputProps = {
    ref: inputRef,
    type: "file",
    accept: "image/*",
    capture: "environment",
    onChange: handleChange,
    style: { display: "none" },
  };

  return { openCamera, inputProps, status, errorMessage, reset };
}
