import { useState } from "react";
import { updateReportStatus } from "../services/report";

export default function useReportAction({ report, onClose, onSuccess }) {
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const isFormValid = note.trim().length > 0;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (newStatus) => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    setSubmitStatus("loading");

    try {
      await updateReportStatus({
        reportId: report.id,
        reportNo: report.report_no,
        newStatus,
        note: note.trim(),
        photo,
      });
      setSubmitStatus("success");
    } catch (err) {
      setSubmitError(err.message);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusClose = () => {
    if (submitStatus === "success") {
      onSuccess?.();
      onClose();
    }
    setSubmitStatus(null);
    setSubmitError(null);
  };

  return {
    note,
    setNote,
    photo,
    photoPreview,
    isSubmitting,
    isFormValid,
    submitStatus,
    submitError,
    handlePhotoChange,
    handleRemovePhoto,
    handleSubmit,
    handleStatusClose,
  };
}