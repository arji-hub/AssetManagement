import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../../components/layout/MainLayout";
import useCategories from "../../../hooks/settings/config/useCategories";
import Settings from "../Settings";
import "./Config.css";

function Config() {
  const {
    categories,
    loading,
    loadError,

    isAdding,
    newCategoryName,
    setNewCategoryName,
    isSubmittingAdd,
    addError,
    openAdd,
    cancelAdd,
    handleAddCategory,

    editingId,
    editValue,
    setEditValue,
    isSavingEdit,
    editError,
    startEdit,
    cancelEdit,
    handleSaveEdit,

    deletingId,
    deleteError,
    handleDelete,
  } = useCategories();

  return (
    <MainLayout>
      <Settings>
        <section className="settings-section">
          <div className="settings-section-header">
            <div>
              <h3>Categories</h3>
              <p>
                Manage the asset categories used across the system. A category
                can only be deleted once it has no assets left.
              </p>
            </div>
            {!isAdding && (
              <button
                type="button"
                className="settings-edit-btn"
                onClick={openAdd}
              >
                <FontAwesomeIcon icon="fa-solid fa-plus" />
                Add category
              </button>
            )}
          </div>

          {isAdding && (
            <div className="category-add-row">
              <div className="category-add-field">
                <input
                  type="text"
                  autoFocus
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCategory();
                    if (e.key === "Escape") cancelAdd();
                  }}
                  className={addError ? "input-error" : ""}
                />
                {addError && <span className="field-error">{addError}</span>}
              </div>
              <div className="category-add-actions">
                <button
                  type="button"
                  className="category-add-confirm"
                  onClick={handleAddCategory}
                  disabled={isSubmittingAdd}
                  title="Add category"
                >
                  <FontAwesomeIcon icon="fa-solid fa-check" />
                </button>
                <button
                  type="button"
                  className="category-add-cancel"
                  onClick={cancelAdd}
                  disabled={isSubmittingAdd}
                  title="Cancel"
                >
                  <FontAwesomeIcon icon="fa-solid fa-xmark" />
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="category-list-empty">Loading categories...</div>
          ) : loadError ? (
            <div className="category-list-empty">{loadError}</div>
          ) : categories.length === 0 ? (
            <div className="category-list-empty">No categories yet.</div>
          ) : (
            <div className="category-list">
              <div className="category-list-header">
                <span>Name</span>
                <span>Assets</span>
                <span></span>
              </div>

              {categories.map((category) => {
                const isEditingRow = editingId === category.id;
                const isDeletingRow = deletingId === category.id;
                const canDelete = category.assetCount === 0;

                return (
                  <div className="category-row" key={category.id}>
                    {isEditingRow ? (
                      <input
                        type="text"
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className={
                          "category-name-input" +
                          (editError ? " input-error" : "")
                        }
                      />
                    ) : (
                      <span className="category-name">{category.name}</span>
                    )}

                    <span className="category-count">
                      {category.assetCount}
                    </span>

                    <div className="category-row-actions">
                      {isEditingRow ? (
                        <>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={isSavingEdit}
                            title="Save"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-check" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isSavingEdit}
                            title="Cancel"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-xmark" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(category)}
                            title="Rename"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-pen" />
                          </button>
                          <button
                            type="button"
                            className="category-delete-btn"
                            onClick={() => handleDelete(category)}
                            disabled={!canDelete || isDeletingRow}
                            title={
                              canDelete
                                ? "Delete"
                                : "Only categories with no assets can be deleted"
                            }
                          >
                            <FontAwesomeIcon icon="fa-solid fa-trash" />
                          </button>
                        </>
                      )}
                    </div>

                    {isEditingRow && editError && (
                      <span className="field-error category-row-error">
                        {editError}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {deleteError && (
            <div className="settings-form-actions">
              <p className="settings-save-error">{deleteError}</p>
            </div>
          )}
        </section>
      </Settings>
    </MainLayout>
  );
}

export default Config;
