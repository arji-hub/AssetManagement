import { useEffect, useState } from "react";
import {
  subscribeToCategories,
  addCategory,
  renameCategory,
  deleteCategory,
} from "../../../services/category";

/**
 * Owns state, Firestore subscription, and CRUD logic for the
 * category list shown in Settings > System Config.
 */
function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToCategories(
      (data) => {
        setCategories(data);
        setLoading(false);
      },
      (err) => {
        setLoadError(err.message || "Failed to load categories.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  /* --- Add --- */
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState(null);

  function openAdd() {
    setIsAdding(true);
    setNewCategoryName("");
    setAddError(null);
  }

  function cancelAdd() {
    setIsAdding(false);
    setNewCategoryName("");
    setAddError(null);
  }

  async function handleAddCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setAddError("Category name is required.");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setAddError("A category with this name already exists.");
      return;
    }

    setIsSubmittingAdd(true);
    setAddError(null);
    try {
      await addCategory(trimmed);
      setIsAdding(false);
      setNewCategoryName("");
    } catch (err) {
      setAddError(err.message || "Failed to add category.");
    } finally {
      setIsSubmittingAdd(false);
    }
  }

  /* --- Rename (inline per-row edit) --- */
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  function startEdit(category) {
    setEditingId(category.id);
    setEditValue(category.name);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
    setEditError(null);
  }

  async function handleSaveEdit() {
    if (!editingId) return;

    const trimmed = editValue.trim();
    if (!trimmed) {
      setEditError("Category name is required.");
      return;
    }
    if (
      trimmed !== editingId &&
      categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setEditError("A category with this name already exists.");
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);
    try {
      await renameCategory(editingId, trimmed);
      setEditingId(null);
      setEditValue("");
    } catch (err) {
      setEditError(err.message || "Failed to rename category.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  /* --- Delete --- */
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDelete(category) {
    if (category.assetCount !== 0) {
      setDeleteError("Only categories with no assets can be deleted.");
      return;
    }

    setDeletingId(category.id);
    setDeleteError(null);
    try {
      await deleteCategory(category.id);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  return {
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
  };
}

export default useCategories;