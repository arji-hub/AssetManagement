import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addRoom } from "../services/room";
import { toProperCase, toLowerCase } from "../utils/TextCasing";

export function useRoomRegistration({ onSuccess, existingRooms = [] } = {}) {
  const { role } = useAuth();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (error) setError(validate(value));
  };

  const validate = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Room name is required.";
    if (trimmed.length < 2) return "Room name must be at least 2 characters.";
    if (trimmed.length > 50) return "Room name must be 50 characters or fewer.";
    const isDuplicate = existingRooms.some(
      (existing) => toLowerCase(existing) === toLowerCase(trimmed),
    );
    if (isDuplicate) return `"${trimmed}" already exists.`;
    return "";
  };

  const handleSave = async () => {
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      console.log("Role", role);
      const savedName = await addRoom({ name: toProperCase(name) }, role);
      setName("");
      onSuccess?.(savedName);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return {
    name,
    error,
    saving,
    handleChange,
    handleSave,
  };
}
