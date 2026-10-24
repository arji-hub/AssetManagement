// src/components/form/ItemList.jsx
import "./Form.css";
import "./ItemList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ItemList({
  items,
  missingByItem = {},
  onAdd,
  onEdit,
  onDuplicate,
  onRemove,
}) {
  const incompleteCount = Object.keys(missingByItem).length;
  const readyCount = items.length - incompleteCount;
  const firstIncomplete = items.find((i) => missingByItem[i.id]);
  return (
    <div className="reg-card">
      <div className="reg-item-list-header">
        <div>
          <p className="reg-card-title" style={{ marginBottom: 0 }}>
            Items
          </p>
          <p className="reg-card-subtitle" style={{ marginBottom: 0 }}>
            Add every asset covered by this acquisition.
          </p>
        </div>
        <button
          type="button"
          className="reg-btn reg-btn--primary"
          onClick={onAdd}
        >
          <FontAwesomeIcon icon="fa-solid fa-plus" />
          Add Asset
        </button>
      </div>
      {incompleteCount > 0 && (
        <div className="reg-item-list-alert" role="alert">
          <div className="reg-item-list-alert-row">
            <div className="reg-item-list-alert-text">
              <p className="reg-item-list-alert-title">
                <span className="reg-item-list-alert-dot" aria-hidden="true" />
                {readyCount} of {items.length} asset
                {items.length === 1 ? "" : "s"} ready
              </p>
              <p className="reg-item-list-alert-sub">
                {incompleteCount} still{" "}
                {incompleteCount === 1 ? "needs" : "need"} required details
                before you can review.
              </p>
            </div>

            <button
              type="button"
              className="reg-item-list-alert-action"
              onClick={() => onEdit(firstIncomplete.id)}
            >
              Fix next
            </button>
          </div>

          <div
            className="reg-item-list-alert-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuenow={readyCount}
          >
            <div
              className="reg-item-list-alert-fill"
              style={{ width: `${(readyCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="reg-item-list-empty">
          <FontAwesomeIcon icon="fa-solid fa-boxes-stacked" />
          <p>No items added yet.</p>
        </div>
      ) : (
        <div className="reg-item-list">
          {items.map((item) => {
            const qty = parseInt(item.qty, 10) || 1;
            const isIndividual = item.tracking_mode === "individual" && qty > 1;
            const serialLabel = isIndividual
              ? `${qty} unique serials`
              : item.serial_number
                ? item.serial_number
                : "No serial";
            const missing = missingByItem[item.id] || [];
            const hasMissing = missing.length > 0;

            return (
              <div
                className={`reg-item-card${hasMissing ? " reg-item-card--incomplete" : ""}`}
                key={item.id}
              >
                <div className="reg-item-card-thumb">
                  {item.assetImage?.preview ? (
                    <img src={item.assetImage.preview} alt={item.description} />
                  ) : (
                    <FontAwesomeIcon icon="fa-solid fa-image" />
                  )}
                </div>

                <div className="reg-item-card-info">
                  <p className="reg-item-card-desc">
                    {item.description || "Untitled asset"}
                  </p>
                  <p className="reg-item-card-meta">
                    {item.category_id} · {qty}{" "}
                    {isIndividual ? "individual" : "bulk"} · {serialLabel}
                  </p>
                  {hasMissing && (
                    <p className="reg-item-card-missing">
                      <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" />
                      Missing: {missing.join(", ")}
                    </p>
                  )}
                </div>

                <div className="reg-item-card-actions">
                  <button
                    type="button"
                    className={hasMissing ? "is-fix" : ""}
                    onClick={() => onEdit(item.id)}
                    title={hasMissing ? "Fix missing fields" : "Edit"}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-pen" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(item.id)}
                    title="Duplicate (serial auto-increments)"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-copy" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    title="Remove"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ItemList;
