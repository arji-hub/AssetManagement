import { useState, useRef, useEffect } from "react";
import { checkUsernameAvailable, updateProfile } from "../../services/user";
import { toLowerCase } from "../../utils/TextCasing";

const DEBOUNCE_MS = 500;
const REQUIRED_MESSAGE = "This field is required.";

function buildFormFromUser(user) {
  return {
    firstname: user?.firstname || "",
    middlename: user?.middlename === "_" ? "" : user?.middlename || "",
    lastname: user?.lastname || "",
    username: user?.username || "",
  };
}

const INITIAL_ERRORS = {
  firstname: "",
  lastname: "",
  username: "",
};

function useProfileEdit({ user, onSaved }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => buildFormFromUser(user));
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [checking, setChecking] = useState({ username: false });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const usernameTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(usernameTimer.current);
  }, []);

  // Re-sync the form if the underlying user data changes (e.g. after a save)
  useEffect(() => {
    setForm(buildFormFromUser(user));
  }, [user]);

  const runUsernameAvailabilityCheck = (value) => {
    clearTimeout(usernameTimer.current);

    if (!value.trim()) return; // required-error already handled in handleChange

    // No need to re-check if it's unchanged from the user's current username
    if (toLowerCase(value) === user?.username) {
      setErrors((prev) => ({ ...prev, username: "" }));
      return;
    }

    usernameTimer.current = setTimeout(async () => {
      setChecking((prev) => ({ ...prev, username: true }));
      try {
        const available = await checkUsernameAvailable(value, user?.uid);
        setErrors((prev) => ({
          ...prev,
          username: available ? "" : "This username is already taken.",
        }));
      } finally {
        setChecking((prev) => ({ ...prev, username: false }));
      }
    }, DEBOUNCE_MS);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Required-field check applies to all editable fields except middlename
    if (name !== "middlename") {
      setErrors((prev) => ({
        ...prev,
        [name]: value.trim() ? "" : REQUIRED_MESSAGE,
      }));
    }

    if (name === "username" && value.trim()) {
      runUsernameAvailabilityCheck(value);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setForm(buildFormFromUser(user));
      setErrors(INITIAL_ERRORS);
      setSaveError("");
    }
    setIsEditing((prev) => !prev);
  };

  const isFormValid =
    form.firstname.trim() &&
    form.lastname.trim() &&
    form.username.trim() &&
    !errors.firstname &&
    !errors.lastname &&
    !errors.username &&
    !checking.username;

  const hasChanges = () => {
    const original = buildFormFromUser(user);
    return (
      form.firstname !== original.firstname ||
      form.middlename !== original.middlename ||
      form.lastname !== original.lastname ||
      toLowerCase(form.username) !== toLowerCase(original.username)
    );
  };

  const handleSave = async () => {
    if (!isFormValid || isSaving) return;

    if (!hasChanges()) {
      // Nothing changed — skip the network call entirely
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const result = await updateProfile(user.uid, form);
      setIsEditing(false);
      if (onSaved) onSaved(result);
    } catch (err) {
      setSaveError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    errors,
    checking,
    isEditing,
    isSaving,
    saveError,
    isFormValid,
    handleChange,
    handleEditToggle,
    handleSave,
  };
}

export default useProfileEdit;
