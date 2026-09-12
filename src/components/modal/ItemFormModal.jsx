// src/components/form/ItemFormModal.jsx
import "./ItemFormModal.css";
import { createPortal } from "react-dom";
import BasicInfo from "../form/BasicInfo";
import ImagePanel from "../form/ImagePanel";
import Assignment from "../form/Assignment";
import { useItemForm } from "../../hooks/asset/useItemForm";

function ItemFormModal({
  initialItem,
  isDonated,
  fulltimeCustodians,
  rooms,
  loadingOptions,
  onSave,
  onClose,
}) {
  const {
    item,
    error,
    assetImage,
    setAssetImage,
    qty,
    isIndividual,
    handleChange,
    setSerialAt,
    autoNumberSerials,
    validate,
    toPayload,
  } = useItemForm(initialItem, isDonated);

  const handleSave = () => {
    if (!validate()) return;
    onSave(toPayload());
  };

  return createPortal(
    <div className="reg-modal-overlay" onClick={onClose}>
      <div className="reg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reg-modal-header">
          <p className="reg-modal-title">
            {initialItem ? "Edit Asset" : "Add Asset"}
          </p>
          <button type="button" className="reg-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="reg-modal-body">
          <BasicInfo
            item={item}
            isDonated={isDonated}
            onChange={handleChange}
            setSerialAt={setSerialAt}
            autoNumberSerials={autoNumberSerials}
            error={error}
            qty={qty}
            isIndividual={isIndividual}
          />

          <div className="reg-modal-section">
            <Assignment
              form={item}
              onChange={handleChange}
              skippedWarning={false}
              fulltimeCustodians={fulltimeCustodians}
              rooms={rooms}
              loadingOptions={loadingOptions}
            />
          </div>

          <div className="reg-modal-section">
            <ImagePanel
              title="Asset Image"
              image={assetImage}
              onImageChange={setAssetImage}
              required
            />
            {error.assetImage && (
              <p className="reg-error">{error.assetImage}</p>
            )}
          </div>
        </div>

        <div className="reg-modal-footer">
          <button
            type="button"
            className="reg-btn reg-btn--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="reg-btn reg-btn--primary"
            onClick={handleSave}
          >
            Save Item
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ItemFormModal;
