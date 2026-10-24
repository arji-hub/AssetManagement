// src/components/form/ReviewSubmit.jsx
import "./Form.css";
import "./ReviewSubmit.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MAX_SERIALS_SHOWN = 3;

function ReviewSubmit({ acquisitionInfo, docImage, items }) {
  const isDonated = acquisitionInfo.acquisition_type === "donated";

  const grouped = items.reduce((acc, item) => {
    const key = item.category_id || "Uncategorized";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="reg-card">
      <p className="reg-card-title">Review &amp; Submit</p>

      {/* ── acquisition summary ── */}
      <div className="reg-review-summary">
        <div className="reg-review-summary-text">
          <p className="reg-review-summary-label">Acquisition</p>
          <p className="reg-review-summary-value">
            {isDonated ? "Donated" : "Purchased"} ·{" "}
            {acquisitionInfo.date_acquired}
          </p>
          <p className="reg-review-summary-value">
            {isDonated ? acquisitionInfo.donated_by : acquisitionInfo.supplier}
          </p>
        </div>

        {docImage?.preview && (
          <img
            className="reg-review-doc-thumb"
            src={docImage.preview}
            alt="Acquisition document"
          />
        )}
      </div>

      {/* ── items grouped by category ── */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div className="reg-review-group" key={category}>
          <p className="reg-review-group-title">{category}</p>

          {categoryItems.map((item) => {
            const qty = parseInt(item.qty, 10) || 1;
            const isIndividual = item.tracking_mode === "individual" && qty > 1;
            const perUnitPhotos =
              isIndividual && item.image_mode === "per_unit";

            const serials = isIndividual
              ? (item.serial_numbers || []).filter(Boolean)
              : item.serial_number
                ? [item.serial_number]
                : [];

            const shown = serials.slice(0, MAX_SERIALS_SHOWN).join(", ");
            const extra = serials.length - MAX_SERIALS_SHOWN;

            return (
              <div className="reg-review-row" key={item.id}>
                <span className="reg-review-row-desc">{item.description}</span>

                <span
                  className="reg-review-row-meta"
                  title={serials.join(", ")}
                >
                  <span className="reg-review-qty">
                    <FontAwesomeIcon icon="fa-solid fa-boxes-stacked" />
                    {qty}
                  </span>

                  {serials.length > 0 && (
                    <span className="reg-review-sn">
                      <FontAwesomeIcon icon="fa-solid fa-barcode" />
                      <span>
                        {shown}
                        {extra > 0 && ` +${extra} more`}
                      </span>
                    </span>
                  )}

                  {perUnitPhotos && (
                    <span className="reg-review-photos">
                      <FontAwesomeIcon icon="fa-solid fa-images" />
                      {qty} photos
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default ReviewSubmit;
