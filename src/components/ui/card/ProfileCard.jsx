import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getRole } from "../../../utils/role";
import ProfileField from "./ProfileField";
import useProfileEdit from "../../../hooks/profile/userProfileEdit";
import { useAuth } from "../../../context/AuthContext";
import "./ProfileCard.css";

function ProfileCard({ user }) {
  const { setUser } = useAuth();
  const {
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
  } = useProfileEdit({
    user,
    onSaved: (result) => {
      setUser((prev) => ({
        ...prev,
        firstname: form.firstname,
        middlename: form.middlename || "_",
        lastname: form.lastname,
        username: form.username,
      }));
    },
  });

  const fullName = [
    user?.firstname,
    user?.middlename === "_" ? null : user?.middlename,
    user?.lastname,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="profile-card">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <FontAwesomeIcon icon="fa-solid fa-circle-user" />
        </div>
        <div className="profile-header-info">
          <h1 className="profile-name">{fullName || "—"}</h1>
          <span className="profile-role-badge">{getRole(user?.role)}</span>
        </div>
        <button
          className={
            isEditing ? "profile-edit-btn is-editing" : "profile-edit-btn"
          }
          onClick={handleEditToggle}
        >
          <FontAwesomeIcon
            icon={isEditing ? "fa-solid fa-xmark" : "fa-solid fa-pen"}
          />
          <span>{isEditing ? "Cancel" : "Edit"}</span>
        </button>
      </div>

      <div className="profile-divider" />

      {/* Read-only info */}
      <div className="profile-section">
        <h2 className="profile-section-title">Account information</h2>
        <div className="profile-grid">
          <ProfileField label="Email" value={user?.email} />
          <ProfileField label="Classification" value={getRole(user?.role)} />
        </div>
      </div>

      <div className="profile-divider" />

      {/* Editable info */}
      <div className="profile-section">
        <h2 className="profile-section-title">Personal details</h2>

        {!isEditing ? (
          <div className="profile-grid">
            <ProfileField label="First name" value={user?.firstname} />
            <ProfileField
              label="Middle name"
              value={user?.middlename === "_" ? "" : user?.middlename}
            />
            <ProfileField label="Last name" value={user?.lastname} />
            <ProfileField label="Username" value={user?.username} />
          </div>
        ) : (
          <form
            className="profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="profile-form-grid">
              <div className="profile-form-field">
                <label htmlFor="firstname">First name</label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  value={form.firstname}
                  onChange={handleChange}
                  className={errors.firstname ? "input-error" : ""}
                />
                {errors.firstname && (
                  <span className="field-error">{errors.firstname}</span>
                )}
              </div>
              <div className="profile-form-field">
                <label htmlFor="middlename">Middle name</label>
                <input
                  id="middlename"
                  name="middlename"
                  type="text"
                  value={form.middlename}
                  onChange={handleChange}
                />
              </div>
              <div className="profile-form-field">
                <label htmlFor="lastname">Last name</label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  value={form.lastname}
                  onChange={handleChange}
                  className={errors.lastname ? "input-error" : ""}
                />
                {errors.lastname && (
                  <span className="field-error">{errors.lastname}</span>
                )}
              </div>
              <div className="profile-form-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  className={errors.username ? "input-error" : ""}
                />
                {checking.username && (
                  <span className="field-checking">
                    Checking availability...
                  </span>
                )}
                {errors.username && (
                  <span className="field-error">{errors.username}</span>
                )}
              </div>
            </div>

            {saveError && <p className="profile-save-error">{saveError}</p>}

            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleEditToggle}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-save-btn"
                disabled={!isFormValid || isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

ProfileCard.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string,
    firstname: PropTypes.string,
    middlename: PropTypes.string,
    lastname: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default ProfileCard;
