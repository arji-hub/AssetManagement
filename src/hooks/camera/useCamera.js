// hooks/useCamera.js
import { useRef } from "react";

export function useCamera(onCapture) {
  const inputRef = useRef(null);

  const openCamera = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture?.(file);
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

  return { openCamera, inputProps };
}
