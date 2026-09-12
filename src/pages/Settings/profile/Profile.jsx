import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../../components/layout/MainLayout";
import Settings from "../Settings";
import { useAuth } from "../../../context/AuthContext";
import { getRole } from "../../../utils/role";
import useProfileEdit from "../../../hooks/settings/profile/userProfileEdit";
import "./Profile.css";

function ProfileSettings() {
  const { user, setUser } = useAuth();

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
    onSaved: () => {
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
    <MainLayout>
      <Settings>
        <div className="settings-content">
          {/* Identity */}
          <div className="settings-identity">
            <div className="settings-avatar">
              <FontAwesomeIcon icon="fa-solid fa-circle-user" />
            </div>
            <div className="settings-identity-info">
              <h2>{fullName || "—"}</h2>
              <span className="settings-role-badge">{getRole(user?.role)}</span>
            </div>
          </div>

          {/* Account information (read-only) */}
          <section className="settings-section settings-section--readonly">
            <div className="settings-section-header">
              <div>
                <h3>Account information</h3>
                <p>Read-only details tied to your account.</p>
              </div>
            </div>

            <div className="settings-rows">
              <div className="settings-row">
                <span className="settings-row-label">Email</span>
                <span className="settings-row-value">{user?.email || "—"}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Classification</span>
                <span className="settings-row-value">
                  {getRole(user?.role)}
                </span>
              </div>
            </div>
          </section>

          {/* Personal details */}
          <section className="settings-section">
            <div className="settings-section-header">
              <div>
                <h3>Personal details</h3>
                <p>Your name and username as they appear across the system.</p>
              </div>
              <button
                type="button"
                className={
                  isEditing
                    ? "settings-edit-btn is-editing"
                    : "settings-edit-btn"
                }
                onClick={handleEditToggle}
              >
                <FontAwesomeIcon
                  icon={isEditing ? "fa-solid fa-xmark" : "fa-solid fa-pen"}
                />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            <form
              className="settings-rows"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="settings-row">
                <label htmlFor="firstname" className="settings-row-label">
                  First name
                </label>
                <div className="settings-row-value">
                  {isEditing ? (
                    <>
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
                    </>
                  ) : (
                    user?.firstname || "—"
                  )}
                </div>
              </div>

              <div className="settings-row">
                <label htmlFor="middlename" className="settings-row-label">
                  Middle name
                </label>
                <div className="settings-row-value">
                  {isEditing ? (
                    <input
                      id="middlename"
                      name="middlename"
                      type="text"
                      value={form.middlename}
                      onChange={handleChange}
                    />
                  ) : user?.middlename === "_" ? (
                    "—"
                  ) : (
                    user?.middlename || "—"
                  )}
                </div>
              </div>

              <div className="settings-row">
                <label htmlFor="lastname" className="settings-row-label">
                  Last name
                </label>
                <div className="settings-row-value">
                  {isEditing ? (
                    <>
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
                    </>
                  ) : (
                    user?.lastname || "—"
                  )}
                </div>
              </div>

              <div className="settings-row">
                <label htmlFor="username" className="settings-row-label">
                  Username
                </label>
                <div className="settings-row-value">
                  {isEditing ? (
                    <>
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
                    </>
                  ) : (
                    user?.username || "—"
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="settings-form-actions">
                  {saveError && (
                    <p className="settings-save-error">{saveError}</p>
                  )}
                  <button
                    type="submit"
                    className="settings-save-btn"
                    disabled={!isFormValid || isSaving}
                  >
                    {isSaving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      </Settings>
    </MainLayout>
  );
}

export default ProfileSettings;
