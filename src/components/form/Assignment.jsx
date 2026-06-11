import "./Form.css";
import "./Assignment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Assignment({
  form,
  onChange,
  skippedWarning,
  fulltimeCustodians,
  parttimeCustodians,
  rooms,
  loadingOptions,
}) {
  return (
    <div className="reg-card">
      <p className="reg-card-title">Custody &amp; Location</p>
      <p className="reg-card-subtitle">
        Assign a custodian and room to this asset. You may skip and update this
        later.
      </p>

      {skippedWarning && (
        <div className="reg-skip-warning">
          <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
          This asset will be saved as <strong>unassigned</strong>. You can
          assign it later from the asset detail page.
        </div>
      )}

      <div className="reg-grid">
        <div className="reg-field">
          <label className="reg-label">Primary Custodian</label>
          <select
            className="reg-select"
            name="primary_custodian"
            value={form.primary_custodian}
            onChange={onChange}
            disabled={loadingOptions}
          >
            <option value="">
              {loadingOptions ? "Loading…" : "Select Custodian"}
            </option>
            {fulltimeCustodians.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullname}
              </option>
            ))}
          </select>
        </div>

        <div className="reg-field">
          <label className="reg-label">Local Custodian</label>
          <select
            className="reg-select"
            name="local_custodian"
            value={form.local_custodian}
            onChange={onChange}
            disabled={loadingOptions}
          >
            <option value="">
              {loadingOptions ? "Loading…" : "Select Custodian"}
            </option>
            {parttimeCustodians.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullname}
              </option>
            ))}
          </select>
        </div>

        <div className="reg-field reg-field--full">
          <label className="reg-label">Location</label>
          <select
            className="reg-select"
            name="room_id"
            value={form.room_id}
            onChange={onChange}
            disabled={loadingOptions}
          >
            <option value="">
              {loadingOptions ? "Loading…" : "Select Location"}
            </option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default Assignment;