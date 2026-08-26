import "./CategoryBarList.css";

function CategoryBarList({
  categories,
  loading = false,
  error = null,
  title = "Assets by category",
  icon,
}) {
  if (loading) {
    return (
      <div className="category-list">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-list">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="category-list">
        <div className="category-list__header">
          <p className="category-list__title">{title}</p>
          {icon && <span className="category-list__icon">{icon}</span>}
        </div>
        <p className="category-list__empty-text">No assets assigned yet.</p>
      </div>
    );
  }

  const maxCount = Math.max(...categories.map((c) => c.assetCount), 1);

  return (
    <div className="category-list category-list--has-items">
      <div className="category-list__header">
        <p className="category-list__title">{title}</p>
        {icon && <span className="category-list__icon">{icon}</span>}
      </div>
      <div className="category-list__items">
        {categories.map((cat) => (
          <div key={cat.id} className="category-list__item">
            <div className="category-list__item-header">
              <span>{cat.name}</span>
              <span>{cat.assetCount}</span>
            </div>
            <div className="category-list__bar">
              <div
                className="category-list__bar-fill"
                style={{ width: `${(cat.assetCount / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryBarList;
