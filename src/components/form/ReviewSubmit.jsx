// src/components/form/ReviewSubmit.jsx
import "./Form.css";
import "./ReviewSubmit.css";

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

      <div className="reg-review-summary">
        <div>
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

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div className="reg-review-group" key={category}>
          <p className="reg-review-group-title">{category}</p>
          {categoryItems.map((item) => {
            const qty = parseInt(item.qty, 10) || 1;
            const isIndividual = item.tracking_mode === "individual" && qty > 1;
            return (
              <div className="reg-review-row" key={item.id}>
                <span>{item.description}</span>
                <span>
                  {qty} {isIndividual ? "individual" : "bulk"}
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
