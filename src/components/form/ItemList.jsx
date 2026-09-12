// src/components/form/ItemList.jsx
import "./Form.css";
import "./ItemList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ItemList({ items, onAdd, onEdit, onRemove, onDuplicate }) {
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

            return (
              <div className="reg-item-card" key={item.id}>
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
                </div>

                <div className="reg-item-card-actions">
                  <button
                    type="button"
                    onClick={() => onDuplicate(item.id)}
                    title="Duplicate"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-copy" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(item.id)}
                    title="Edit"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-pen" />
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
